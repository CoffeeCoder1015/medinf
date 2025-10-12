"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { DrugIdentification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Send, Loader2, AlertTriangle, Calendar, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DrugAnalysisSkeleton } from "./loading-skeleton"
import { ErrorAlert } from "./error-alert"

interface MedGemmaChatProps {
  drugs: DrugIdentification[]
  onBack: () => void
}

export default function MedGemmaChat({ drugs, onBack }: MedGemmaChatProps) {
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(true)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Initial analysis
    const fetchAnalysis = async () => {
      setIsAnalyzing(true)
      setError(null)
      try {
        const response = await fetch("/api/analyze-drugs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ drugs }),
        })

        const data = await response.json()
        if (data.success) {
          setAnalysis(data.analysis)
          setMessages([
            {
              role: "assistant",
              content: data.summary,
            },
          ])
        } else {
          setError(data.error || "Failed to analyze medications")
        }
      } catch (error) {
        console.error("[v0] Error analyzing drugs:", error)
        setError("An error occurred while analyzing your medications. Please try again.")
      } finally {
        setIsAnalyzing(false)
      }
    }

    fetchAnalysis()
  }, [drugs])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    const newMessages = [...messages, { role: "user", content: userMessage }]
    setMessages(newMessages)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat-medgemma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          drugs,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setMessages([...newMessages, { role: "assistant", content: data.response }])
      } else {
        setError(data.error || "Failed to get response")
      }
    } catch (error) {
      console.error("[v0] Error chatting with MedGemma:", error)
      setError("An error occurred while getting a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">AI Analysis & Chat</h2>
          <p className="text-sm text-muted-foreground">
            Analyzing {drugs.length} medication{drugs.length > 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {isAnalyzing ? (
        <DrugAnalysisSkeleton />
      ) : analysis ? (
        <div className="grid gap-4 md:grid-cols-3">
          {analysis.contradictions && analysis.contradictions.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Contradictions</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {analysis.contradictions.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {analysis.usageSchedule && analysis.usageSchedule.length > 0 && (
            <Alert>
              <Calendar className="h-4 w-4" />
              <AlertTitle>Usage Schedule</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {analysis.usageSchedule.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {analysis.warnings && analysis.warnings.length > 0 && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Important Warnings</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                  {analysis.warnings.map((item: string, i: number) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>
      ) : null}

      {error && <ErrorAlert message={error} />}

      <Card className="p-4 min-h-[400px] max-h-[500px] overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message, i) => (
            <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card>

      <form onSubmit={handleSend} className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about drug interactions, side effects, or usage..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <p className="text-xs text-center text-muted-foreground">
        This AI assistant provides general information only. Always consult your healthcare provider for medical
        decisions.
      </p>
    </div>
  )
}
