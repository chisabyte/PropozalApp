"use client"

import { useState, useEffect } from "react"
import { Clock, Zap, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CountdownTimerProps {
  expiresAt: Date | string
  urgencyThreshold?: number // hours before showing urgent state (default 24)
  className?: string
  showIcon?: boolean
  size?: "sm" | "md" | "lg"
}

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  total: number // total milliseconds
  isExpired: boolean
}

function calculateTimeRemaining(expiresAt: Date): TimeRemaining {
  const now = new Date()
  const total = expiresAt.getTime() - now.getTime()

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0, isExpired: true }
  }

  const seconds = Math.floor((total / 1000) % 60)
  const minutes = Math.floor((total / 1000 / 60) % 60)
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24)
  const days = Math.floor(total / (1000 * 60 * 60 * 24))

  return { days, hours, minutes, seconds, total, isExpired: false }
}

function getUrgencyLevel(hoursRemaining: number): "normal" | "info" | "warning" | "urgent" | "critical" {
  if (hoursRemaining > 168) return "normal" // > 7 days
  if (hoursRemaining > 72) return "info" // 3-7 days
  if (hoursRemaining > 24) return "warning" // 1-3 days
  if (hoursRemaining > 1) return "urgent" // < 24h
  return "critical" // < 1h
}

export function CountdownTimer({
  expiresAt,
  urgencyThreshold = 24,
  className,
  showIcon = true,
  size = "md",
}: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(new Date(expiresAt))
  )

  useEffect(() => {
    const expiryDate = new Date(expiresAt)

    // Update immediately
    setTimeRemaining(calculateTimeRemaining(expiryDate))

    // Update every minute (or every second if < 1 hour)
    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(expiryDate)
      setTimeRemaining(remaining)

      // If expired, stop the interval
      if (remaining.isExpired) {
        clearInterval(interval)
      }
    }, timeRemaining.total < 3600000 ? 1000 : 60000) // Every second if < 1 hour, else every minute

    return () => clearInterval(interval)
  }, [expiresAt])

  const hoursRemaining = timeRemaining.total / (1000 * 60 * 60)
  const urgencyLevel = getUrgencyLevel(hoursRemaining)

  // Format the display text
  const formatTimeText = (): string => {
    if (timeRemaining.isExpired) return "EXPIRED"

    if (timeRemaining.days > 0) {
      return `${timeRemaining.days} day${timeRemaining.days > 1 ? "s" : ""}`
    }
    if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours} hour${timeRemaining.hours > 1 ? "s" : ""}`
    }
    return `${timeRemaining.minutes} minute${timeRemaining.minutes > 1 ? "s" : ""}`
  }

  // Get styling based on urgency
  const getStyles = () => {
    const baseStyles = {
      normal: "bg-slate-100 text-slate-600 border-slate-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      urgent: "bg-red-50 text-red-700 border-red-200",
      critical: "bg-red-100 text-red-800 border-red-300 animate-pulse",
    }
    return baseStyles[urgencyLevel]
  }

  const sizeStyles = {
    sm: "text-xs px-2 py-1",
    md: "text-sm px-3 py-1.5",
    lg: "text-base px-4 py-2",
  }

  const IconComponent = urgencyLevel === "critical" ? Zap : 
                        urgencyLevel === "urgent" ? AlertTriangle : Clock

  if (timeRemaining.isExpired) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-medium",
          "bg-red-100 text-red-800 border-red-300",
          sizeStyles[size],
          className
        )}
      >
        <AlertTriangle className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4")} />
        <span>EXPIRED</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        getStyles(),
        sizeStyles[size],
        className
      )}
    >
      {showIcon && (
        <IconComponent className={cn(
          size === "sm" ? "h-3 w-3" : "h-4 w-4",
          urgencyLevel === "critical" && "animate-bounce"
        )} />
      )}
      <span>
        {urgencyLevel === "critical" ? "⚡ " : ""}
        Expires in {formatTimeText()}
      </span>
    </div>
  )
}

// Full banner version for public proposal page
export function CountdownBanner({
  expiresAt,
  className,
}: {
  expiresAt: Date | string
  className?: string
}) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
    calculateTimeRemaining(new Date(expiresAt))
  )

  useEffect(() => {
    const expiryDate = new Date(expiresAt)
    setTimeRemaining(calculateTimeRemaining(expiryDate))

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(expiryDate)
      setTimeRemaining(remaining)
      if (remaining.isExpired) clearInterval(interval)
    }, timeRemaining.total < 3600000 ? 1000 : 60000)

    return () => clearInterval(interval)
  }, [expiresAt])

  if (timeRemaining.isExpired) return null

  const hoursRemaining = timeRemaining.total / (1000 * 60 * 60)
  const urgencyLevel = getUrgencyLevel(hoursRemaining)

  const bgStyles = {
    normal: "bg-slate-600",
    info: "bg-blue-600",
    warning: "bg-amber-500",
    urgent: "bg-red-500",
    critical: "bg-red-600 animate-pulse",
  }

  // Format with all units for banner
  const formatBannerText = (): string => {
    const parts: string[] = []
    if (timeRemaining.days > 0) parts.push(`${timeRemaining.days}d`)
    if (timeRemaining.hours > 0) parts.push(`${timeRemaining.hours}h`)
    if (timeRemaining.minutes > 0) parts.push(`${timeRemaining.minutes}m`)
    if (parts.length === 0) parts.push(`${timeRemaining.seconds}s`)
    return parts.join(" ")
  }

  return (
    <div
      className={cn(
        "text-white text-center py-2 px-4 font-medium",
        bgStyles[urgencyLevel],
        className
      )}
    >
      <div className="container mx-auto flex items-center justify-center gap-2">
        {urgencyLevel === "critical" ? (
          <Zap className="h-4 w-4 animate-bounce" />
        ) : (
          <Clock className="h-4 w-4" />
        )}
        <span>
          {urgencyLevel === "critical" ? "⚡ EXPIRES SOON: " : "⏰ This proposal expires in: "}
          <span className="font-bold">{formatBannerText()}</span>
        </span>
      </div>
    </div>
  )
}
