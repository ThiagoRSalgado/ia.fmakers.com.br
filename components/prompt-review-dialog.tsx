"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, MessageSquare, TrendingUp } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  feedbackSent?: "positive" | "negative"
}

interface PromptReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conversationId: string
  messages: Message[]
  agentName: string
  onSubmit: (data: {
    conversationId: string
    feedbackStats: {
      positive: number
      negative: number
      total: number
    }
    reviewComment: string
    messages: Message[]
  }) => void
}

export function PromptReviewDialog({
  open,
  onOpenChange,
  conversationId,
  messages,
  agentName,
  onSubmit,
}: PromptReviewDialogProps) {
  const [reviewComment, setReviewComment] = useState("")

  // Calcular estatísticas de feedback
  const feedbackStats = messages.reduce(
    (stats, message) => {
      if (message.feedbackSent === "positive") {
        stats.positive++
        stats.total++
      } else if (message.feedbackSent === "negative") {
        stats.negative++
        stats.total++
      }
      return stats
    },
    { positive: 0, negative: 0, total: 0 },
  )

  const hasFeedback = feedbackStats.total > 0

  const handleSubmit = () => {
    onSubmit({
      conversationId,
      feedbackStats,
      reviewComment: reviewComment.trim(),
      messages,
    })
    setReviewComment("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Enviar para Revisão de Prompt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm mb-3">Estatísticas da Conversa</h4>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-lg font-semibold text-green-600">{feedbackStats.positive}</div>
                <div className="text-xs text-gray-500">Positivos</div>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <ThumbsDown className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-lg font-semibold text-red-600">{feedbackStats.negative}</div>
                <div className="text-xs text-gray-500">Negativos</div>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-lg font-semibold text-blue-600">{feedbackStats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {!hasFeedback && (
            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
              <p className="text-sm text-amber-700">
                Para enviar para revisão, é necessário dar feedback em pelo menos uma mensagem da conversa.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Comentário sobre a revisão (opcional)</label>
            <Textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Descreva o que precisa ser melhorado no prompt..."
              className="min-h-[80px]"
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Agente:</strong> {agentName}
            </p>
            <p className="text-sm text-blue-700">
              <strong>Mensagens:</strong> {messages.length} na conversa
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!hasFeedback}
              className={`flex-1 ${
                hasFeedback
                  ? "bg-[#12444B] hover:bg-[#0f3a40] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Enviar para Revisão
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
