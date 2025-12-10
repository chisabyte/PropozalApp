"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useUser, useClerk } from "@clerk/nextjs"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const INDUSTRIES = [
  "Web Development",
  "Marketing",
  "Construction",
  "Consulting",
  "Design",
  "Other"
]

const TONE_OPTIONS = [
  "Professional & Formal",
  "Friendly & Conversational",
  "Technical & Detailed",
  "Creative & Bold",
  "Consultant",
  "Corporate",
  "Startup Founder",
]

export default function SettingsPage() {
  const { user: clerkUser } = useUser()
  const { openUserProfile } = useClerk()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    companyName: "",
    industry: "",
    tonePreference: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile")
      if (!response.ok) throw new Error("Failed to fetch profile")
      
      const data = await response.json()
      setProfileData({
        fullName: data.full_name || "",
        email: data.email || "",
        companyName: data.company_name || "",
        industry: data.industry || "",
        tonePreference: data.tone_preference || "",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) throw new Error("Failed to save profile")

      toast({
        title: "Saved",
        description: "Profile updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const TONE_ICONS: Record<string, string> = {
    "Professional & Formal": "👔",
    "Friendly & Conversational": "😊",
    "Technical & Detailed": "🔧",
    "Creative & Bold": "🎨",
  }

  const handleManageSecurity = () => {
    if (openUserProfile) {
      openUserProfile()
    } else {
      toast({
        title: "Error",
        description: "Unable to open security settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      // Delete user data from database first
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to delete account data")
      }

      // Delete user from Clerk
      if (clerkUser) {
        try {
          await clerkUser.delete()
        } catch (clerkError: any) {
          console.error("Clerk deletion error:", clerkError)
          // Continue even if Clerk deletion fails - database is already cleaned
        }
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      })

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push("/")
      }, 1000)
    } catch (error: any) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete account. Please contact support.",
        variant: "destructive",
      })
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            👤 Profile
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            ⚙️ Preferences
          </TabsTrigger>
          <TabsTrigger value="style" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            ✍️ Writing Style
          </TabsTrigger>
          <TabsTrigger value="branding" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            🎨 Branding
          </TabsTrigger>
          <TabsTrigger value="account" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            🔐 Account
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>
                Update your profile information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileData.fullName}
                    onChange={(e) =>
                      setProfileData({ ...profileData, fullName: e.target.value })
                    }
                    className="mt-2"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <Input
                    id="email"
                    value={profileData.email}
                    disabled
                    className="mt-2 bg-muted/50"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Managed by your authentication provider
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="companyName" className="text-sm font-medium">Company Name</Label>
                  <Input
                    id="companyName"
                    value={profileData.companyName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        companyName: e.target.value,
                      })
                    }
                    className="mt-2"
                    placeholder="Acme Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="industry" className="text-sm font-medium">Industry</Label>
                  <Select
                    value={profileData.industry}
                    onValueChange={(value) =>
                      setProfileData({ ...profileData, industry: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((ind) => (
                        <SelectItem key={ind} value={ind}>
                          {ind}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="shadow-lg shadow-primary/25">
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Proposal Preferences</CardTitle>
              <CardDescription>
                Customize how AI generates your proposals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Default Tone</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose the default writing style for your proposals
                </p>
                <RadioGroup
                  value={profileData.tonePreference}
                  onValueChange={(value) =>
                    setProfileData({ ...profileData, tonePreference: value })
                  }
                  className="grid sm:grid-cols-2 gap-3"
                >
                  {TONE_OPTIONS.map((tone) => (
                    <div
                      key={tone}
                      className={`flex items-center space-x-3 rounded-xl border-2 p-4 cursor-pointer transition-all hover:border-primary/50 ${
                        profileData.tonePreference === tone 
                          ? "border-primary bg-primary/5" 
                          : "border-muted"
                      }`}
                      onClick={() => setProfileData({ ...profileData, tonePreference: tone })}
                    >
                      <span className="text-2xl">{TONE_ICONS[tone]}</span>
                      <div className="flex-1">
                        <RadioGroupItem value={tone} id={tone} className="sr-only" />
                        <Label htmlFor={tone} className="cursor-pointer font-medium">
                          {tone}
                        </Label>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              <Button onClick={handleSaveProfile} disabled={saving} className="shadow-lg shadow-primary/25">
                {saving ? "Saving..." : "Save Preferences"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="style">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Writing Style Training</CardTitle>
              <CardDescription>
                Train AI to write proposals in your personal style
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-sm text-muted-foreground mb-4">
                  Upload 2-3 of your best past proposals. AI will analyze your writing patterns and create a personalized style profile.
                </p>
                <Button variant="outline" size="sm">
                  <Link href="/dashboard/settings/style-training">
                    Train Writing Style →
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Branding Configuration</CardTitle>
              <CardDescription>
                Customize your proposal branding for PDF exports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="logo" className="text-sm font-medium">Logo</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Upload your company logo (will appear on PDF exports)
                </p>
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="primaryColor" className="text-sm font-medium">Primary Color</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Hex color code (e.g., #3B82F6)
                </p>
                <Input
                  id="primaryColor"
                  type="color"
                  className="mt-2 h-10 w-20"
                />
              </div>
              <div>
                <Label htmlFor="footerInfo" className="text-sm font-medium">Footer Information</Label>
                <Textarea
                  id="footerInfo"
                  placeholder="Company address, phone, website..."
                  className="mt-2"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="defaultCTA" className="text-sm font-medium">Default CTA</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  Default ending paragraph for proposals (optional)
                </p>
                <Textarea
                  id="defaultCTA"
                  placeholder="I'd love to discuss this opportunity further..."
                  className="mt-2"
                  rows={3}
                />
              </div>
              <Button className="shadow-lg shadow-primary/25">
                Save Branding
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Account Settings</CardTitle>
              <CardDescription>
                Manage your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-xl bg-muted/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🔒</span>
                  <h3 className="font-semibold">Password & Security</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Manage your password and security settings through your authentication provider.
                </p>
                <Button variant="outline" size="sm" onClick={handleManageSecurity}>
                  Manage Security →
                </Button>
              </div>

              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50/50">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">⚠️</span>
                  <h3 className="font-semibold text-red-700">Danger Zone</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data.
                  This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deleting}>
                      {deleting ? "Deleting..." : "Delete Account"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove all your data from our servers. This includes:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>All your proposals</li>
                          <li>Your portfolio items</li>
                          <li>Your account settings</li>
                          <li>All associated data</li>
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteAccount}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={deleting}
                      >
                        {deleting ? "Deleting..." : "Yes, delete my account"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

