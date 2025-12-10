"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Briefcase,
  Settings,
  CreditCard,
  Home,
  BarChart3,
  Sparkles,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { name: "New Proposal", href: "/dashboard/new-proposal", icon: FilePlus, color: "text-emerald-500", highlight: true },
  { name: "Proposals", href: "/dashboard/proposals", icon: FileText, color: "text-purple-500" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-amber-500" },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase, color: "text-pink-500" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-slate-500" },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard, color: "text-teal-500" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-gradient-to-b from-background via-background to-muted/30">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
          
          if (item.highlight) {
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-primary to-teal-600 text-white shadow-lg shadow-primary/25"
                    : "bg-primary/5 text-primary hover:bg-primary/10 border border-primary/20"
                )}
              >
                <Sparkles className="h-5 w-5" />
                {item.name}
              </Link>
            )
          }
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                isActive
                  ? "bg-muted text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5 transition-colors", isActive ? item.color : "group-hover:" + item.color)} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t p-4 space-y-3 bg-muted/30">
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </Button>
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-background/50">
          <UserButton
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "h-10 w-10 ring-2 ring-primary/20",
              },
            }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Account</p>
            <p className="text-xs text-muted-foreground">Manage profile</p>
          </div>
        </div>
      </div>
    </div>
  )
}

