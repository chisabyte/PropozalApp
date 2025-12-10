import { Sidebar } from "@/components/dashboard/sidebar"
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
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">{children}</div>
      </main>
      <FeedbackChatbot />
      <ViewNotifications />
    </div>
  )
}

