import { Sidebar } from "@/components/dashboard/sidebar"
import { MobileNav } from "@/components/dashboard/mobile-nav"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { FeedbackChatbot } from "@/components/feedback/feedback-chatbot"
import { ViewNotifications } from "@/components/dashboard/view-notifications"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/sign-in")
  }

  // Check if user exists in database and has completed onboarding
  const user = await getCurrentUser()
  if (!user) {
    redirect("/onboarding")
  }
  
  // If user exists but hasn't completed onboarding (no industry), redirect to onboarding
  if (!user.industry) {
    redirect("/onboarding")
  }

  return (
    <div className="flex h-screen">
      {/* Mobile Navigation */}
      <MobileNav />
      
      {/* Desktop Sidebar - hidden on mobile, shown on larger screens */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Main content - full width on mobile, with sidebar space on desktop */}
      <main className="flex-1 overflow-y-auto md:ml-0">
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
          {children}
        </div>
      </main>
      
      <FeedbackChatbot />
      <ViewNotifications />
    </div>
  )
}

