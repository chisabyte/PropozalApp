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
  BarChart3,
  Menu,
  X,
} from "lucide-react"
import { UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useState } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { name: "New Proposal", href: "/dashboard/new-proposal", icon: FilePlus, color: "text-emerald-500", highlight: true },
  { name: "Proposals", href: "/dashboard/proposals", icon: FileText, color: "text-purple-500" },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3, color: "text-amber-500" },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: Briefcase, color: "text-pink-500" },
  { name: "Settings", href: "/dashboard/settings", icon: Settings, color: "text-slate-500" },
  { name: "Billing", href: "/dashboard/billing", icon: CreditCard, color: "text-teal-500" },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Logo />
        <div className="flex items-center gap-2">
          <UserButton afterSignOutUrl="/" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-9 w-9"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="fixed inset-y-0 left-0 w-full max-w-xs bg-background shadow-lg">
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="px-3 py-6 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")
                
                if (item.highlight) {
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                        "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20",
                        "text-emerald-700 dark:text-emerald-300 shadow-sm",
                        isActive && "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.name}
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4", isActive ? item.color : "text-muted-foreground")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}
