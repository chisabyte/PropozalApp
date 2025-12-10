"use client"

import { AlertTriangle, Mail, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"

interface ExpiredOverlayProps {
  expiresAt: string
  expiredAction: "show_message" | "hide" | "redirect"
  expiryMessage: string | null
  userEmail: string | null
  userName: string | null
  proposalTitle: string
}

export function ExpiredOverlay({
  expiresAt,
  expiredAction,
  expiryMessage,
  userEmail,
  userName,
  proposalTitle,
}: ExpiredOverlayProps) {
  const expiredDate = new Date(expiresAt)
  const defaultMessage = `This proposal has expired. Please contact ${userName || "us"} for updated pricing.`
  const displayMessage = expiryMessage || defaultMessage

  const handleRequestUpdate = () => {
    if (userEmail) {
      const subject = encodeURIComponent(`Request Updated Proposal: ${proposalTitle}`)
      const body = encodeURIComponent(
        `Hi ${userName || "there"},\n\nI was reviewing your proposal "${proposalTitle}" but noticed it has expired.\n\nCould you please send me an updated version?\n\nThank you!`
      )
      window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`
    }
  }

  if (expiredAction === "hide") {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            Proposal No Longer Available
          </h1>
          <p className="text-slate-600 mb-6">
            This proposal is no longer available. Please contact {userName || "the sender"} for updated pricing and information.
          </p>
          {userEmail && (
            <Button onClick={handleRequestUpdate} className="gap-2">
              <Mail className="h-4 w-4" />
              Contact {userName || "Sender"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // show_message action - show overlay on top of grayed content
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Proposal Expired
        </h1>
        <p className="text-slate-600 mb-4">
          {displayMessage}
        </p>
        <p className="text-sm text-slate-500 mb-6">
          Expired on {format(expiredDate, "MMMM d, yyyy 'at' h:mm a")}
        </p>
        {userEmail && (
          <Button onClick={handleRequestUpdate} size="lg" className="gap-2">
            <Mail className="h-4 w-4" />
            Request Updated Proposal
          </Button>
        )}
      </div>
    </div>
  )
}

// Banner version for showing at top of page
export function ExpiredBanner({
  expiresAt,
  userName,
  userEmail,
  proposalTitle,
}: {
  expiresAt: string
  userName: string | null
  userEmail: string | null
  proposalTitle: string
}) {
  const expiredDate = new Date(expiresAt)

  const handleRequestUpdate = () => {
    if (userEmail) {
      const subject = encodeURIComponent(`Request Updated Proposal: ${proposalTitle}`)
      const body = encodeURIComponent(
        `Hi ${userName || "there"},\n\nI was reviewing your proposal "${proposalTitle}" but noticed it has expired.\n\nCould you please send me an updated version?\n\nThank you!`
      )
      window.location.href = `mailto:${userEmail}?subject=${subject}&body=${body}`
    }
  }

  return (
    <div className="bg-red-500 text-white py-3 px-4">
      <div className="container mx-auto max-w-4xl flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          <span className="font-medium">
            This proposal expired on {format(expiredDate, "MMM d, yyyy")}
          </span>
        </div>
        {userEmail && (
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleRequestUpdate}
            className="gap-1"
          >
            <Mail className="h-3 w-3" />
            Request Update
          </Button>
        )}
      </div>
    </div>
  )
}
