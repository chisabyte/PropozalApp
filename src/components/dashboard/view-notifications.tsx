"use client"

import { useEffect, useRef } from "react"
import { useToast } from "@/components/ui/use-toast"
import { usePathname } from "next/navigation"

interface RecentView {
  id: string
  proposalId: string
  proposalTitle: string
  viewedAt: string
  deviceType: string
  isFirstView?: boolean
}

export function ViewNotifications() {
  const { toast } = useToast()
  const pathname = usePathname()
  const seenViews = useRef<Set<string>>(new Set())
  const isFirstPoll = useRef(true)

  useEffect(() => {
    // Only poll when on dashboard or proposals pages
    if (!pathname?.startsWith("/dashboard")) {
      return
    }

    const pollRecentViews = async () => {
      try {
        const response = await fetch("/api/proposals/recent-views")
        if (!response.ok) return

        const data = await response.json()
        const recentViews: RecentView[] = data.recentViews || []

        // Skip notifications on first poll to avoid showing old views
        if (isFirstPoll.current) {
          recentViews.forEach(view => seenViews.current.add(view.id))
          isFirstPoll.current = false
          return
        }

        // Show toast for new views
        recentViews.forEach(view => {
          if (!seenViews.current.has(view.id)) {
            seenViews.current.add(view.id)
            
            const deviceEmoji = view.deviceType === "mobile" ? "📱" : 
                               view.deviceType === "tablet" ? "📱" : "💻"
            
            toast({
              title: `${view.isFirstView ? "🔔 New viewer!" : "👀 Proposal viewed"}`,
              description: `Someone ${view.isFirstView ? "just opened" : "is viewing"} "${view.proposalTitle}" ${deviceEmoji}`,
              duration: 5000,
            })
          }
        })
      } catch (error) {
        // Silent fail - notifications are not critical
      }
    }

    // Initial poll
    pollRecentViews()

    // Poll every 30 seconds
    const interval = setInterval(pollRecentViews, 30000)

    return () => clearInterval(interval)
  }, [pathname, toast])

  // This component doesn't render anything visible
  return null
}
