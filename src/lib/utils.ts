import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRelativeTime(date: string | Date): string {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return "unknown time"
  }
}
