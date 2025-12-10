"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, Briefcase, Sparkles, Image as ImageIcon, CheckCircle2, XCircle, Search, Bell, Loader2 } from "lucide-react"
import { generateSmartImageUrl } from "@/lib/portfolio-images"

interface PortfolioItem {
  id: string
  title: string
  description: string
  tags: string[]
  industry?: string | null
  use_in_proposals?: boolean
  image_url?: string | null
}

const TAG_COLORS = [
  "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "bg-purple-500/10 text-purple-600 border-purple-500/20",
  "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "bg-amber-500/10 text-amber-600 border-amber-500/20",
  "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
]

export default function PortfolioPage() {
  const { toast } = useToast()
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    industry: "",
    useInProposals: true,
    imageUrl: "",
  })
  const [strengthScore, setStrengthScore] = useState<{
    score: number
    suggestions: string[]
  } | null>(null)
  const [loadingStrength, setLoadingStrength] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchPortfolio()
    fetchStrengthScore()
  }, [])

  const fetchStrengthScore = async () => {
    if (portfolioItems.length === 0) return
    setLoadingStrength(true)
    try {
      const response = await fetch("/api/portfolio/intelligence")
      if (!response.ok) throw new Error("Failed to fetch strength score")
      const data = await response.json()
      setStrengthScore(data)
    } catch (error) {
      console.error("Error fetching strength score:", error)
    } finally {
      setLoadingStrength(false)
    }
  }

  const fetchPortfolio = async () => {
    try {
      const response = await fetch("/api/portfolio")
      if (!response.ok) throw new Error("Failed to fetch portfolio")
      
      const data = await response.json()
      setPortfolioItems(data)
      // Fetch strength score after loading portfolio
      if (data.length > 0) {
        setTimeout(() => fetchStrengthScore(), 500)
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load portfolio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    
    if (!formData.title || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title and Description)",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean)

    try {
      const url = editingItem ? `/api/portfolio/${editingItem.id}` : "/api/portfolio"
      const method = editingItem ? "PATCH" : "POST"

      // Auto-generate image URL if not provided
      let imageUrl = formData.imageUrl.trim()
      if (!imageUrl && formData.industry) {
        // Generate image based on industry (title is optional)
        imageUrl = generateSmartImageUrl(formData.title || "project", formData.industry)
      } else if (!imageUrl) {
        // Fallback to generic business image if no industry selected
        imageUrl = generateSmartImageUrl(formData.title || "project", "Other")
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          tags,
          industry: formData.industry || null,
          use_in_proposals: formData.useInProposals,
          image_url: imageUrl || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to save portfolio item (${response.status})`)
      }

      const data = await response.json()
      console.log("Portfolio item saved:", data)

      toast({
        title: "Success",
        description: editingItem ? "Portfolio item updated" : "Portfolio item added successfully",
      })

      setDialogOpen(false)
      setEditingItem(null)
      setFormData({ title: "", description: "", tags: "", industry: "", useInProposals: true, imageUrl: "" })
      await fetchPortfolio()
    } catch (error: any) {
      console.error("Error saving portfolio item:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save portfolio item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (item: PortfolioItem) => {
    setEditingItem(item)
    setFormData({
      title: item.title,
      description: item.description,
      tags: item.tags.join(", "),
      industry: item.industry || "",
      useInProposals: item.use_in_proposals !== undefined ? item.use_in_proposals : true,
      imageUrl: item.image_url || "",
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (portfolioItems.length <= 2) {
      toast({
        title: "Cannot Delete",
        description: "You must have at least 2 portfolio items",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Are you sure you want to delete this portfolio item?")) return

    try {
      const response = await fetch(`/api/portfolio/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Deleted",
        description: "Portfolio item deleted successfully",
      })
      fetchPortfolio()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete portfolio item",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search proposals..." 
              className="pl-9 w-full"
            />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <a href="/dashboard/new-proposal">
              <Plus className="h-4 w-4 mr-2" />
              New Proposal
            </a>
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Manage your case studies and assets for proposals.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
              onClick={() => {
                setEditingItem(null)
                setFormData({ title: "", description: "", tags: "", industry: "", useInProposals: true, imageUrl: "" })
              }}
            >
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                {editingItem ? "Edit Project" : "Add New Project"}
              </DialogTitle>
              <DialogDescription>
                Add a project to help AI personalize your proposals with relevant experience
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Project Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="E-commerce Site for Fashion Brand"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description *</Label>
                <p className="text-xs text-muted-foreground">
                  Describe the project, your role, and key achievements (2-3 sentences)
                </p>
                <Textarea
                  id="description"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Built a modern e-commerce platform with React and Node.js, increasing client sales by 40%..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    Be specific about results and technologies used
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {formData.description?.length || 0}/1000
                  </p>
                </div>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tags" className="text-sm font-medium">Skills & Technologies</Label>
                  <Input
                    id="tags"
                    value={formData.tags || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="React, Node.js, E-commerce, B2B"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate with commas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                  <Select
                    value={formData.industry || undefined}
                    onValueChange={(value) => {
                      const newIndustry = value || ""
                      // Auto-generate image URL when industry is selected (even without title)
                      if (value && !formData.imageUrl) {
                        const autoImageUrl = generateSmartImageUrl(formData.title || "project", value)
                        setFormData(prev => ({ ...prev, industry: newIndustry, imageUrl: autoImageUrl }))
                      } else {
                        setFormData({ ...formData, industry: newIndustry })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SaaS">SaaS</SelectItem>
                      <SelectItem value="eCommerce">eCommerce</SelectItem>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Mobile App Development">Mobile App Development</SelectItem>
                      <SelectItem value="UX Design">UX Design</SelectItem>
                      <SelectItem value="UI Design">UI Design</SelectItem>
                      <SelectItem value="Branding">Branding</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Construction">Construction</SelectItem>
                      <SelectItem value="Logistics">Logistics</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Real Estate">Real Estate</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageUrl" className="text-sm font-medium">Project Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, imageUrl: e.target.value })
                  }
                  placeholder="Leave empty to auto-generate based on industry"
                />
                <p className="text-xs text-muted-foreground">
                  {formData.imageUrl ? "Custom image URL" : "Image will be auto-generated based on industry"}
                </p>
                {formData.imageUrl && (
                  <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border">
                    <img 
                      src={formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = generateSmartImageUrl(formData.title || "project", formData.industry)
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="useInProposals"
                  checked={formData.useInProposals}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, useInProposals: checked === true })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="useInProposals" className="text-sm font-medium cursor-pointer">
                    Use in proposals
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Uncheck to exclude from AI matching
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setDialogOpen(false)
                  setEditingItem(null)
                  setFormData({ title: "", description: "", tags: "", industry: "", useInProposals: true, imageUrl: "" })
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingItem ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {editingItem ? "Update Project" : "Add Project"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Portfolio Strength Score */}
      {strengthScore && portfolioItems.length > 0 && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/20">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              Portfolio Strength Score
            </CardTitle>
            <CardDescription>
              AI evaluation of your portfolio's effectiveness for proposal generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-teal-600">
                  {strengthScore.score}
                  <span className="text-lg text-muted-foreground">/100</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Overall Score</p>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      strengthScore.score >= 80 ? "bg-emerald-500" :
                      strengthScore.score >= 60 ? "bg-amber-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${strengthScore.score}%` }}
                  />
                </div>
              </div>
            </div>
            {strengthScore.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-semibold mb-2">Improvement Suggestions:</p>
                <ul className="space-y-1">
                  {strengthScore.suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-teal-600 mt-0.5">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="bg-gradient-to-r from-primary/5 to-teal-500/5 border-primary/20">
        <CardContent className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
            💡
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Why add portfolio items?</p>
            <p className="text-sm text-muted-foreground">
              AI uses your portfolio to highlight relevant experience in proposals, making them more personalized and compelling.
            </p>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item, itemIndex) => {
            // Generate a reliable image URL
            // Priority: saved image_url > Picsum Photos with industry-based seed > generic placeholder
            const getImageUrl = () => {
              if (item.image_url) {
                return item.image_url
              }
              
              // Use Picsum Photos with a consistent seed based on industry and title
              const industrySeed = (item.industry || "other").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
              const titleSeed = (item.title || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
              const seed = industrySeed + titleSeed + itemIndex
              
              // Picsum Photos with seed for consistent images
              return `https://picsum.photos/seed/${seed}/800/600`
            }
            
            const imageUrl = getImageUrl()
            
            return (
              <Card key={item.id} className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-all group">
                {/* Image Section */}
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // If image fails to load, use a different Picsum seed
                      const currentSrc = e.currentTarget.src
                      const industrySeed = (item.industry || "other").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                      const titleSeed = (item.title || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
                      const newSeed = industrySeed + titleSeed + itemIndex + Date.now()
                      const fallbackUrl = `https://picsum.photos/seed/${newSeed}/800/600`
                      
                      if (currentSrc !== fallbackUrl) {
                        e.currentTarget.src = fallbackUrl
                      } else {
                        // Ultimate fallback - use a generic placeholder
                        e.currentTarget.src = `https://picsum.photos/800/600?random=${Date.now()}`
                      }
                    }}
                  />
                  {/* Edit/Delete Overlay */}
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={() => handleDelete(item.id)}
                      disabled={portfolioItems.length <= 2}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
                
                {/* Content Section */}
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold mb-1">{item.title}</CardTitle>
                  {item.industry && (
                    <p className="text-sm text-muted-foreground mb-2">{item.industry}</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
          
          {/* Add New Project Card */}
          <Card 
            className="relative overflow-hidden border-2 border-dashed border-muted hover:border-primary/50 transition-all cursor-pointer"
            onClick={() => setDialogOpen(true)}
          >
            <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px] text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <p className="font-medium text-lg mb-1">Add New Project</p>
            </CardContent>
          </Card>
        </div>
      )}

      {portfolioItems.length === 0 && !loading && (
        <Card className="border-0 shadow-lg">
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 text-3xl">
              📁
            </div>
            <h3 className="font-semibold text-lg mb-2">No portfolio items yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Add your best projects to help AI create more personalized proposals that highlight your relevant experience.
            </p>
            <Button onClick={() => setDialogOpen(true)} className="shadow-lg shadow-primary/25">
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Project
            </Button>
          </CardContent>
        </Card>
      )}

    </div>
  )
}

