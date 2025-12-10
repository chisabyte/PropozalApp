"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export function ProposalFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" || value === "newest") {
      params.delete(key)
    } else {
      params.set(key, value)
    }
    router.push(`/dashboard/proposals?${params.toString()}`)
  }

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search proposals..." className="pl-9" />
          </div>
          <Select
            value={searchParams.get("platform") || "all"}
            onValueChange={(value) => updateFilter("platform", value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="All Platforms" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="Upwork">Upwork</SelectItem>
              <SelectItem value="Fiverr">Fiverr</SelectItem>
              <SelectItem value="Thumbtack">Thumbtack</SelectItem>
              <SelectItem value="Houzz">Houzz</SelectItem>
              <SelectItem value="LinkedIn">LinkedIn</SelectItem>
              <SelectItem value="Direct RFP">Direct RFP</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("status") || "all"}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="won">Won</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={searchParams.get("sort") || "newest"}
            onValueChange={(value) => updateFilter("sort", value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="score">Score</SelectItem>
              <SelectItem value="value">Value</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

