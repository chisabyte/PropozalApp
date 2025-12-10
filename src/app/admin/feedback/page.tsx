'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/components/ui/use-toast'

interface FeedbackSession {
  id: string
  user_name?: string
  user_email?: string
  category: string
  sentiment: string
  priority: string
  summary: string
  resolved: boolean
  messageCount: number
  created_at: string
}

export default function AdminFeedbackDashboard() {
  const [sessions, setSessions] = useState<FeedbackSession[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all',
    resolved: 'false', // Default to unresolved
    sentiment: 'all',
  })
  const [stats, setStats] = useState({
    total: 0,
    unresolved: 0,
    urgent: 0,
    bugs: 0,
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedback()
  }, [filters])

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams(filters as any)
      const response = await fetch(`/api/admin/feedback?${params}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: 'Access Denied',
            description: 'Admin access required',
            variant: 'destructive',
          })
        }
        throw new Error(data.error)
      }

      setSessions(data.sessions)

      // Calculate stats
      setStats({
        total: data.total,
        unresolved: data.sessions.filter((s: any) => !s.resolved).length,
        urgent: data.sessions.filter((s: any) => s.priority === 'urgent').length,
        bugs: data.sessions.filter((s: any) => s.category === 'bug').length,
      })
    } catch (error: any) {
      console.error('Failed to fetch feedback:', error)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'bug':
        return '🐛'
      case 'feature_request':
        return '💡'
      case 'complaint':
        return '😞'
      case 'praise':
        return '🎉'
      case 'question':
        return '❓'
      default:
        return '💬'
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Feedback Dashboard</h1>
          <p className="text-muted-foreground">
            Manage user feedback, complaints, and feature requests
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Unresolved</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unresolved}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Urgent Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.urgent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bug Reports</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bugs}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={filters.resolved}
              onValueChange={(v) => setFilters({ ...filters, resolved: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="false">Unresolved</SelectItem>
                <SelectItem value="true">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.priority}
              onValueChange={(v) => setFilters({ ...filters, priority: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.category}
              onValueChange={(v) => setFilters({ ...filters, category: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bug">Bugs</SelectItem>
                <SelectItem value="feature_request">Feature Requests</SelectItem>
                <SelectItem value="complaint">Complaints</SelectItem>
                <SelectItem value="praise">Praise</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sentiment}
              onValueChange={(v) => setFilters({ ...filters, sentiment: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">
            Loading feedback...
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No feedback found with current filters
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">{getCategoryIcon(session.category)}</span>
                      <Badge variant="outline" className={getPriorityColor(session.priority)}>
                        {session.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">
                        {session.category.replace('_', ' ')}
                      </Badge>
                      <Badge variant="outline">{session.sentiment}</Badge>
                      {session.resolved && (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Resolved
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-semibold text-lg">{session.summary}</h3>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                      <span>👤 {session.user_name || 'Anonymous'}</span>
                      {session.user_email && <span>📧 {session.user_email}</span>}
                      <span>💬 {session.messageCount} messages</span>
                      <span>🕒 {new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <Link href={`/admin/feedback/${session.id}`}>
                    <Button variant="outline" size="sm">
                      View Details →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

