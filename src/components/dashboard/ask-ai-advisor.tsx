"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MessageCircleQuestion,
  Send,
  Loader2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Target,
  RefreshCw,
  Copy,
  Check
} from "lucide-react"

interface ConversationMessage {
  role: "user" | "assistant"
  content: string
}

const EXAMPLE_QUESTIONS = [
  "Why am I not winning more Upwork gigs?",
  "Should I raise my prices?",
  "What's the best platform for web development?",
  "How can I improve my proposal quality?",
  "What makes my winning proposals different?"
]

export function AskAIAdvisor() {
  const [open, setOpen] = useState(false)
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [conversation])

  const askQuestion = async (questionText: string) => {
    if (!questionText.trim() || loading) return

    const userMessage: ConversationMessage = {
      role: "user",
      content: questionText
    }

    setConversation(prev => [...prev, userMessage])
    setQuestion("")
    setLoading(true)

    try {
      const response = await fetch("/api/insights/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: questionText })
      })

      if (!response.ok) {
        throw new Error("Failed to get advice")
      }

      const data = await response.json()

      const assistantMessage: ConversationMessage = {
        role: "assistant",
        content: data.answer || "I couldn't analyze your data at this time. Please try again."
      }

      setConversation(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting advice:", error)
      setConversation(prev => [...prev, {
        role: "assistant",
        content: "Sorry, I encountered an error analyzing your data. Please try again in a moment."
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    askQuestion(question)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const clearConversation = () => {
    setConversation([])
    setQuestion("")
  }

  return (
    <>
      {/* Floating Button for Desktop */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all z-50 md:flex hidden"
            size="icon"
          >
            <MessageCircleQuestion className="h-6 w-6" />
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-teal-600" />
              AI Proposal Advisor
            </DialogTitle>
            <DialogDescription>
              Ask me anything about your proposal performance. I'll analyze your data and give personalized advice.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            {/* Conversation Area */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px] max-h-[400px]">
              {conversation.length === 0 ? (
                <div className="space-y-4">
                  {/* Example Questions */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Try asking:</p>
                    <div className="flex flex-wrap gap-2">
                      {EXAMPLE_QUESTIONS.map((q, i) => (
                        <Badge
                          key={i}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/10 transition-colors py-1.5 px-3"
                          onClick={() => setQuestion(q)}
                        >
                          {q}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats Preview */}
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <TrendingUp className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Win Rate Analysis</p>
                        </div>
                        <div>
                          <DollarSign className="h-5 w-5 text-amber-600 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Pricing Insights</p>
                        </div>
                        <div>
                          <Target className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                          <p className="text-xs text-muted-foreground">Strategy Tips</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg px-4 py-3 ${
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.role === "assistant" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 h-6 px-2 text-xs"
                            onClick={() => copyToClipboard(message.content)}
                          >
                            {copied ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Analyzing your data...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t pt-4 mt-auto">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ask about your proposals..."
                  className="min-h-[44px] max-h-[120px] resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                  }}
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!question.trim() || loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                  {conversation.length > 0 && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={clearConversation}
                      title="Clear conversation"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Card Version for Dashboard */}
      <Card className="border-0 shadow-lg md:hidden">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageCircleQuestion className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI Advisor</h3>
              <p className="text-sm text-muted-foreground">Get personalized advice</p>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="w-full"
            variant="outline"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ask AI Advisor
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

// Sidebar version for dashboard
export function AskAIAdvisorSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <MessageCircleQuestion className="h-4 w-4" />
          Ask AI Advisor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <AskAIAdvisorContent />
      </DialogContent>
    </Dialog>
  )
}

// Reusable content component
function AskAIAdvisorContent() {
  const [question, setQuestion] = useState("")
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState("")

  const askQuestion = async () => {
    if (!question.trim() || loading) return

    setLoading(true)
    setAnswer("")

    try {
      const response = await fetch("/api/insights/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      })

      if (!response.ok) throw new Error("Failed to get advice")

      const data = await response.json()
      setAnswer(data.answer || "I couldn't analyze your data at this time.")
    } catch (error) {
      console.error("Error:", error)
      setAnswer("Sorry, I encountered an error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-teal-600" />
          AI Proposal Advisor
        </DialogTitle>
        <DialogDescription>
          Ask me anything about improving your proposals
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        <div className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Why am I not winning more gigs?"
            className="min-h-[80px]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.slice(0, 3).map((q, i) => (
            <Badge
              key={i}
              variant="outline"
              className="cursor-pointer hover:bg-primary/10"
              onClick={() => setQuestion(q)}
            >
              {q}
            </Badge>
          ))}
        </div>

        <Button
          onClick={askQuestion}
          disabled={!question.trim() || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Get Advice
            </>
          )}
        </Button>

        {answer && (
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <p className="text-sm whitespace-pre-wrap">{answer}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
