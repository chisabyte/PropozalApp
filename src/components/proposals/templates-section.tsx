"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bookmark, Copy, ArrowRight, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { CloneProposalModal } from "@/components/proposals/clone-proposal-modal"

interface Template {
  id: string
  title: string
  platform: string | null
  tone: string | null
  clone_count: number
  status: string
}

export function TemplatesSection() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [cloneModalOpen, setCloneModalOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/proposals/templates")
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template)
    setCloneModalOpen(true)
  }

  if (loading) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (templates.length === 0) {
    return null // Don't show if no templates
  }

  return (
    <>
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-purple-500" />
              <CardTitle className="text-lg">My Templates</CardTitle>
            </div>
            <Badge variant="secondary">{templates.length} saved</Badge>
          </div>
          <CardDescription>
            Reusable proposal templates for quick starts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {templates.slice(0, 6).map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-xl bg-background border hover:border-purple-500/30 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`/dashboard/proposals/${template.id}`}
                      className="font-medium text-sm truncate block hover:text-primary transition-colors"
                    >
                      {template.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {template.platform && (
                        <Badge variant="outline" className="text-xs">
                          {template.platform}
                        </Badge>
                      )}
                      {template.tone && (
                        <span className="text-xs text-muted-foreground capitalize">
                          {template.tone}
                        </span>
                      )}
                    </div>
                    {template.clone_count > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Used {template.clone_count} time{template.clone_count > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUseTemplate(template)}
                  className="w-full mt-3 gap-1 text-purple-600 border-purple-500/30 hover:bg-purple-500/10"
                >
                  <Copy className="h-3 w-3" />
                  Use Template
                </Button>
              </div>
            ))}
          </div>

          {templates.length > 6 && (
            <div className="mt-4 text-center">
              <Button variant="ghost" size="sm" asChild className="gap-1">
                <Link href="/dashboard/proposals?template=true">
                  View all templates
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Clone Modal */}
      {selectedTemplate && (
        <CloneProposalModal
          open={cloneModalOpen}
          onOpenChange={setCloneModalOpen}
          proposalId={selectedTemplate.id}
          proposalTitle={selectedTemplate.title}
        />
      )}
    </>
  )
}
