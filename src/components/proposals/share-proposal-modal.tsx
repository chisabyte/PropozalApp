"use client"

import { useState, useEffect, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Copy, 
  Check, 
  Mail, 
  Download, 
  QrCode,
  Link2,
  ExternalLink
} from "lucide-react"
import QRCode from "qrcode"

interface ShareProposalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposalId: string
  proposalTitle: string
  onShare?: (method: "link" | "email" | "qr") => void
}

export function ShareProposalModal({
  open,
  onOpenChange,
  proposalId,
  proposalTitle,
  onShare,
}: ShareProposalModalProps) {
  const [copied, setCopied] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("")
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const proposalUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/p/${proposalId}`
    : `/p/${proposalId}`

  const emailSubject = `Proposal for ${proposalTitle}`
  const emailBody = `Hi,

I've prepared a proposal for you. You can view it here:

${proposalUrl}

Looking forward to your feedback!

Best regards`

  // Generate QR code when modal opens
  useEffect(() => {
    if (open && proposalUrl) {
      generateQRCode()
    }
  }, [open, proposalUrl])

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(proposalUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      })
      setQrCodeDataUrl(dataUrl)
    } catch (error) {
      console.error("Failed to generate QR code:", error)
    }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(proposalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onShare?.("link")
    trackShare("link")
  }

  const openInNewTab = () => {
    window.open(proposalUrl, "_blank")
  }

  const sendEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    window.location.href = mailtoUrl
    onShare?.("email")
    trackShare("email")
  }

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return

    const link = document.createElement("a")
    link.download = `proposal-${proposalId}-qr.png`
    link.href = qrCodeDataUrl
    link.click()
    onShare?.("qr")
    trackShare("qr")
  }

  const trackShare = async (method: "link" | "email" | "qr") => {
    try {
      await fetch(`/api/proposals/${proposalId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method }),
      })
    } catch (error) {
      // Silent fail - sharing tracking is not critical
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Share Proposal
          </DialogTitle>
          <DialogDescription>
            Share this proposal with your client to track their engagement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public Link */}
          <div className="space-y-2">
            <Label>Public Link</Label>
            <div className="flex items-center gap-2">
              <Input 
                value={proposalUrl} 
                readOnly 
                className="font-mono text-sm"
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={copyLink}
                title="Copy link"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                onClick={openInNewTab}
                title="Open in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-sm text-green-600">✓ Link copied to clipboard!</p>
            )}
          </div>

          {/* QR Code */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              QR Code
            </Label>
            <div className="flex items-start gap-4">
              <div className="border rounded-lg p-2 bg-white">
                {qrCodeDataUrl ? (
                  <img 
                    src={qrCodeDataUrl} 
                    alt="Proposal QR Code" 
                    className="w-32 h-32"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center bg-muted rounded">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <p className="text-sm text-muted-foreground">
                  Scan this code to view the proposal on any device
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={downloadQRCode}
                  disabled={!qrCodeDataUrl}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </div>
            </div>
          </div>

          {/* Email Preview */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Send via Email
            </Label>
            <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
              <div>
                <span className="text-xs text-muted-foreground">Subject:</span>
                <p className="text-sm font-medium">{emailSubject}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Preview:</span>
                <Textarea 
                  value={emailBody}
                  readOnly
                  className="mt-1 text-sm resize-none bg-background"
                  rows={5}
                />
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={sendEmail}
              className="w-full gap-2"
            >
              <Mail className="h-4 w-4" />
              Open in Email Client
            </Button>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={copyLink} className="gap-2">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
