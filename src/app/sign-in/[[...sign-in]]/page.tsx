import { SignIn } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Image from "next/image"
import Link from "next/link"

export default async function SignInPage() {
  const { userId } = await auth()
  
  // If already signed in, redirect based on onboarding status
  if (userId) {
    const user = await getCurrentUser()
    if (user?.industry) {
      redirect("/dashboard")
    } else {
      redirect("/onboarding")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50/30 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-teal-600 p-12 flex-col justify-between">
        <div>
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/propozzy/My Logo.jpg"
              alt="Propozzy"
              width={48}
              height={48}
              className="rounded-xl"
            />
            <span className="text-2xl font-bold text-white">Propozzy</span>
          </Link>
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Win more projects with AI-powered proposals
          </h1>
          <p className="text-white/80 text-lg">
            Join thousands of freelancers who save hours and close more deals.
          </p>
          <div className="flex items-center gap-4 text-white/90">
            <div className="flex -space-x-2">
              {[1,2,3,4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30" />
              ))}
            </div>
            <span className="text-sm">2,000+ freelancers trust Propozzy</span>
          </div>
        </div>
        <p className="text-white/60 text-sm">
          © 2024 Propozzy. All rights reserved.
        </p>
      </div>
      
      {/* Right side - Sign In */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/propozzy/My Logo.jpg"
                alt="Propozzy"
                width={40}
                height={40}
                className="rounded-xl"
              />
              <span className="text-xl font-bold">Propozzy</span>
            </Link>
          </div>
          <SignIn
            afterSignInUrl="/onboarding"
            afterSignUpUrl="/onboarding"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full",
              }
            }}
          />
        </div>
      </div>
    </div>
  )
}
