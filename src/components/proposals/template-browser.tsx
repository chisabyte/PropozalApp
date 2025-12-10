"use client"

import { useState } from "react"
import { PROPOSAL_TEMPLATES, ProposalTemplate } from "@/config/templates"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, LayoutTemplate, ArrowRight, Check, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface TemplateBrowserProps {
  onSelect: (template: ProposalTemplate) => void
  selectedTemplateId?: string
}

export function TemplateBrowser({ onSelect, selectedTemplateId }: TemplateBrowserProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [previewTemplate, setPreviewTemplate] = useState<ProposalTemplate | null>(null)

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "development", label: "Development" },
    { id: "design", label: "Design" },
    { id: "marketing", label: "Marketing" },
    { id: "business", label: "Business" },
  ]

  const filteredTemplates = PROPOSAL_TEMPLATES.filter(template => {
    const matchesCategory = activeCategory === "all" || template.category === activeCategory
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory} className="w-full md:w-auto">
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id}>{cat.label}</TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card 
            key={template.id} 
            className={`cursor-pointer transition-all hover:shadow-md border-2 ${selectedTemplateId === template.id ? 'border-primary bg-primary/5' : 'border-transparent hover:border-muted'}`}
            onClick={() => setPreviewTemplate(template)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-muted rounded-lg">
                  <LayoutTemplate className="h-6 w-6 text-muted-foreground" />
                </div>
                {selectedTemplateId === template.id && (
                  <Badge variant="default" className="bg-primary">
                    <Check className="h-3 w-3 mr-1" /> Selected
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="secondary" className="capitalize">{template.category}</Badge>
                <Badge variant="outline" className="capitalize">{template.industry}</Badge>
              </div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                Used by hundreds of freelancers
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              <Button variant="ghost" className="w-full justify-between group">
                Preview Details
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No templates found</h3>
          <p className="text-muted-foreground">Try adjusting your search or category filter</p>
        </div>
      )}

      {/* Template Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="capitalize">
                {previewTemplate?.category}
              </Badge>
              {previewTemplate?.platform_fit.map(p => (
                <Badge key={p} variant="outline" className="capitalize">
                  {p.replace('_', ' ')}
                </Badge>
              ))}
            </div>
            <DialogTitle className="text-2xl">{previewTemplate?.name}</DialogTitle>
            <DialogDescription className="text-base">
              {previewTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <h4 className="font-semibold mb-3">Structure Blueprint</h4>
              <div className="space-y-3">
                {previewTemplate && Object.entries(previewTemplate.default_sections).map(([key, value]) => (
                  <div key={key} className="flex gap-3 p-3 bg-muted/30 rounded-lg border">
                    <div className="w-24 shrink-0 font-medium text-sm capitalize text-muted-foreground">
                      {key.replace('_', ' ')}
                    </div>
                    <div className="text-sm">
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Best For</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Freelancers and agencies in {previewTemplate?.industry}</li>
                <li>Projects requiring a {previewTemplate?.tone_hint.replace('_', ' ')} tone</li>
                <li>Proposals on {previewTemplate?.platform_fit.join(', ')}</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
            <Button onClick={() => {
              if (previewTemplate) {
                onSelect(previewTemplate)
                setPreviewTemplate(null)
              }
            }}>
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
