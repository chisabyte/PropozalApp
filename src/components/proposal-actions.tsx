"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { Eye, Download, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"

interface ProposalActionsProps {
  proposalId: string
  proposalTitle: string
}

export function ProposalActions({ proposalId, proposalTitle }: ProposalActionsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleting, setDeleting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await fetch(`/api/proposals/${proposalId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete proposal")
      }

      toast({
        title: "Deleted",
        description: "Proposal deleted successfully",
      })

      // Refresh the page to show updated list
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete proposal",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
      setDialogOpen(false)
    }
  }

  const handleDownload = async () => {
    // For now, just open the proposal in a new tab for printing/saving as PDF
    window.open(`/dashboard/proposals/${proposalId}`, "_blank")
    toast({
      title: "Tip",
      description: "Use your browser's print function (Ctrl+P) to save as PDF",
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="icon" title="View proposal">
        <Link href={`/dashboard/proposals/${proposalId}`}>
          <Eye className="h-4 w-4" />
        </Link>
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        title="Download proposal"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
      </Button>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            title="Delete proposal"
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Proposal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{proposalTitle}&rdquo;? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

