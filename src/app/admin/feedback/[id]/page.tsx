'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle, ArrowLeft, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

interface Session {
  id: string
  user_name?: string
  user_email?: string
  category: string
  sentiment: string
  priority: string
  summary: string
  keywords: string[]
  requires_follow_up: boolean
  resolved: boolean
  resolved_at?: string
  resolved_by?: string
  admin_notes?: string
  created_at: string
}

export default function AdminFeedbackDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [session, setSession] = useState<Session | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [adminNotes, setAdminNotes] = useState('')
  const [priority, setPriority] = useState<string>('')
  const [resolved, setResolved] = useState(false)

  useEffect(() => {
    fetchSession()
  }, [params.id])

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/admin/feedback/${params.id}`)
      const data = await response.json()

      if (!response.ok) {
        if (response.status === 403) {
          toast({
            title: 'Access Denied',
            description: 'Admin access required',
            variant: 'destructive',
          })
          router.push('/admin/feedback')
          return
        }
        throw new Error(data.error)
      }

      setSession(data.session)
      setMessages(data.messages || [])
      setAdminNotes(data.session.admin_notes || '')
      setPriority(data.session.priority || '')
      setResolved(data.session.resolved || false)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/feedback/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolved,
          admin_notes: adminNotes,
          priority: priority || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: 'Success',
        description: 'Feedback session updated',
      })

      // Refresh session data
      fetchSession()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
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

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Session not found</p>
          <Button onClick={() => router.push('/admin/feedback')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/feedback')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Feedback Details</h1>
            <p className="text-muted-foreground">Session ID: {session.id}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Messages */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex gap-3',
                      message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={
                          message.role === 'assistant'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }
                      >
                        {message.role === 'assistant' ? 'AI' : 'User'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        'rounded-lg px-4 py-2 max-w-[75%]',
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                        className={cn(
                          'text-xs mt-1 opacity-60',
                          message.role === 'user' ? 'text-right' : 'text-left'
                        )}
                      >
                        {new Date(message.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Session Info & Actions */}
        <div className="space-y-4">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle>Session Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">User</Label>
                <p className="font-medium">{session.user_name || 'Anonymous'}</p>
                {session.user_email && (
                  <p className="text-sm text-muted-foreground">{session.user_email}</p>
                )}
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Badge variant="outline" className="mt-1">
                  {session.category.replace('_', ' ')}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Priority</Label>
                <Badge
                  variant="outline"
                  className={cn('mt-1', getPriorityColor(session.priority))}
                >
                  {session.priority.toUpperCase()}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Sentiment</Label>
                <Badge variant="outline" className="mt-1">
                  {session.sentiment}
                </Badge>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Summary</Label>
                <p className="text-sm mt-1">{session.summary}</p>
              </div>

              {session.keywords && session.keywords.length > 0 && (
                <div>
                  <Label className="text-xs text-muted-foreground">Keywords</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {session.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs text-muted-foreground">Created</Label>
                <p className="text-sm mt-1">
                  {new Date(session.created_at).toLocaleString()}
                </p>
              </div>

              {session.resolved && session.resolved_at && (
                <div>
                  <Label className="text-xs text-muted-foreground">Resolved</Label>
                  <p className="text-sm mt-1">
                    {new Date(session.resolved_at).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="resolved"
                  checked={resolved}
                  onChange={(e) => setResolved(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="resolved" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Mark as Resolved
                </Label>
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="admin_notes">Admin Notes</Label>
                <Textarea
                  id="admin_notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this feedback..."
                  rows={4}
                />
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

