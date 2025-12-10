'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { MessageCircle, X, Send, Loader2, ThumbsUp } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function FeedbackChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [hasEnded, setHasEnded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load or create session when opened
  useEffect(() => {
    if (isOpen && !sessionId && !hasEnded) {
      loadSession()
    }
  }, [isOpen])

  const loadSession = async () => {
    try {
      const response = await fetch('/api/feedback/session')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setSessionId(data.session.id)
      setMessages(
        data.messages.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          timestamp: new Date(m.created_at),
        }))
      )
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to start feedback session',
        variant: 'destructive',
      })
      console.error(error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !sessionId || isLoading) return

    const userMessage = inputValue.trim()
    setInputValue('')
    setIsLoading(true)

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      },
    ])

    try {
      const response = await fetch('/api/feedback/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: 'Rate limit exceeded',
            description: 'Too many messages. Please wait a moment.',
            variant: 'destructive',
          })
        } else {
          throw new Error(data.error)
        }
        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempId))
        return
      }

      // Add bot response
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.botResponse,
          timestamp: new Date(),
        },
      ])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      })
      console.error(error)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndSession = async () => {
    if (!sessionId) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/feedback/session/end', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      toast({
        title: 'Success',
        description: data.message,
      })
      setHasEnded(true)

      // Add final bot message
      setMessages((prev) => [
        ...prev,
        {
          id: `end-${Date.now()}`,
          role: 'assistant',
          content:
            "Thanks again for your feedback! Feel free to start a new conversation anytime. 👋",
          timestamp: new Date(),
        },
      ])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      })
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-[100] bg-primary hover:bg-primary/90"
        size="icon"
        aria-label={isOpen ? "Close feedback chat" : "Open feedback chat"}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-[100]">
          {/* Header */}
          <div className="p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <h3 className="font-semibold">Feedback & Support</h3>
            <p className="text-xs opacity-90">We're here to help!</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
                    {message.role === 'assistant' ? 'AI' : 'You'}
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
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t space-y-2">
            {!hasEnded ? (
              <>
                <div className="flex gap-2">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">Press Enter to send</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEndSession}
                    disabled={isLoading || messages.length < 2}
                    className="text-xs"
                  >
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    Submit Feedback
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Session ended. Thanks for your feedback!
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setHasEnded(false)
                    setSessionId(null)
                    setMessages([])
                    loadSession()
                  }}
                >
                  Start New Conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
