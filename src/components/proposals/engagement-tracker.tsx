"use client"

import { useEffect, useRef, useCallback } from "react"

interface EngagementTrackerProps {
  proposalId: string
}

// Generate or retrieve session ID from sessionStorage
function getSessionId(): string {
  if (typeof window === "undefined") return ""
  
  let sessionId = sessionStorage.getItem("proposal_session_id")
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem("proposal_session_id", sessionId)
  }
  return sessionId
}

// Detect device type
function getDeviceType(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop"
  
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

export function EngagementTracker({ proposalId }: EngagementTrackerProps) {
  const sessionId = useRef<string>("")
  const startTime = useRef<number>(Date.now())
  const lastSentTime = useRef<number>(0)
  const maxScrollDepth = useRef<number>(0)
  const sectionsViewed = useRef<Set<string>>(new Set())
  const isVisible = useRef<boolean>(true)
  const totalTimeSpent = useRef<number>(0)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Send engagement event to API
  const sendEvent = useCallback(async (
    eventType: "view" | "scroll" | "time_spent" | "exit",
    additionalData: Record<string, any> = {}
  ) => {
    if (!sessionId.current) return

    try {
      await fetch(`/api/proposals/${proposalId}/track-engagement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventType,
          session_id: sessionId.current,
          device_type: getDeviceType(),
          referrer: document.referrer || "direct",
          user_agent: navigator.userAgent,
          ...additionalData,
        }),
      })
    } catch (error) {
      console.error("Failed to send engagement event:", error)
    }
  }, [proposalId])

  // Debounced send function (every 5 seconds while active)
  const debouncedSend = useCallback(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }

    debounceTimer.current = setTimeout(() => {
      const now = Date.now()
      const timeSinceLastSend = (now - lastSentTime.current) / 1000

      if (timeSinceLastSend >= 5) {
        sendEvent("time_spent", {
          scroll_depth: maxScrollDepth.current,
          time_spent: Math.round(timeSinceLastSend),
        })
        lastSentTime.current = now
      }
    }, 5000)
  }, [sendEvent])

  useEffect(() => {
    // Initialize session
    sessionId.current = getSessionId()
    lastSentTime.current = Date.now()

    // Send initial view event
    sendEvent("view", {
      scroll_depth: 0,
      time_spent: 0,
    })

    // Track scroll depth
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0

      if (scrollPercent > maxScrollDepth.current) {
        maxScrollDepth.current = scrollPercent
      }

      debouncedSend()
    }

    // Track section visibility using Intersection Observer
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionName = entry.target.getAttribute("data-section")
          if (sectionName && !sectionsViewed.current.has(sectionName)) {
            sectionsViewed.current.add(sectionName)
            sendEvent("scroll", {
              section_viewed: sectionName,
              scroll_depth: maxScrollDepth.current,
            })
          }
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.5, // 50% of section must be visible
    })

    // Observe all sections with data-section attribute
    const sections = document.querySelectorAll("[data-section]")
    sections.forEach((section) => observer.observe(section))

    // Track page visibility (for accurate time tracking)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - save time spent
        isVisible.current = false
        const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
        totalTimeSpent.current += timeSpent
      } else {
        // Page became visible again
        isVisible.current = true
        startTime.current = Date.now()
      }
    }

    // Track page unload
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
      
      // Use sendBeacon for reliable delivery on page unload
      navigator.sendBeacon(
        `/api/proposals/${proposalId}/track-engagement`,
        JSON.stringify({
          event_type: "exit",
          session_id: sessionId.current,
          scroll_depth: maxScrollDepth.current,
          time_spent: timeSpent,
          device_type: getDeviceType(),
        })
      )
    }

    // Add event listeners
    window.addEventListener("scroll", handleScroll, { passive: true })
    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      observer.disconnect()
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
    }
  }, [proposalId, sendEvent, debouncedSend])

  // This component doesn't render anything visible
  return null
}
