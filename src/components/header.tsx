"use client"

import { usePathname } from "next/navigation"
import { Logo } from "./logo"

export function Header() {
  const pathname = usePathname()
  
  // Don't show header on landing pages (they have their own nav)
  if (pathname === "/" || pathname === "/how-it-works" || pathname === "/features" || pathname === "/why-us") {
    return null
  }
  
  // Don't show header on dashboard pages (they have sidebar with logo)
  if (pathname?.startsWith("/dashboard")) {
    return null
  }
  
  // Don't show header on auth pages (Clerk handles those)
  if (pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up")) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center px-4">
        <Logo />
      </div>
    </header>
  )
}

