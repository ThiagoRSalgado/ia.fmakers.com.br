"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown } from "lucide-react"

interface FeedbackDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string
  messageContent: string
  messageSender: "user" | "bot"
  preselectedRating?: "positive" | "negative" | null
  onSubmit: (feedback: {
    messageId: string
    rating: "positive" | "negative"
    comment: string
    messageContent: string
    messageSender: "user" | "bot"
  }) => void
}

export function FeedbackDialog({
  open,
  onOpenChange,
  messageId,
  messageContent,
  messageSender,
  preselectedRating = null,
  onSubmit,
}: FeedbackDialogProps) {
  const [rating, setRating] = useState<"positive" | "negative" | null>(null)
  const [comment, setComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && preselectedRating) {
      setRating(preselectedRating)
    }
  }, [open, preselectedRating])

  const handleSubmit = async () => {
    if (!rating) return

    setIsSubmitting(true)

    try {
      await onSubmit({
        messageId,
        rating,
        comment: comment.trim(),
        messageContent,
        messageSender,
      })

      // Reset form
      setRating(null)
      setComment("")
      onOpenChange(false)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setRating(null)
    setComment("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-lg font-semibold text-gray-900">Dar feedback</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Question */}
          <div>
            <p className="text-sm text-gray-700 mb-4">
              O que você achou da {messageSender === "bot" ? "resposta da IA" : "sua mensagem"}?
            </p>
          </div>

          {/* Rating Options */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setRating("negative")}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                rating === "negative"
                  ? "border-red-500 bg-red-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ThumbsDown className={`w-8 h-8 mb-2 ${rating === "negative" ? "text-red-500" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${rating === "negative" ? "text-red-700" : "text-gray-600"}`}>
                Ruim
              </span>
            </button>

            <button
              onClick={() => setRating("positive")}
              className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all ${
                rating === "positive"
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <ThumbsUp className={`w-8 h-8 mb-2 ${rating === "positive" ? "text-green-500" : "text-gray-400"}`} />
              <span className={`text-sm font-medium ${rating === "positive" ? "text-green-700" : "text-gray-600"}`}>
                Bom
              </span>
            </button>
          </div>

          {/* Comment Section */}
          {rating && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 block">
                {rating === "positive" ? "O que você mais gostou?" : "Como podemos melhorar?"} (opcional)
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  rating === "positive" ? "Conte-nos o que funcionou bem..." : "Descreva o que poderia ser melhor..."
                }
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <div className="text-xs text-gray-500 text-right">{comment.length}/500</div>
            </div>
          )}

          {/* Message Preview */}
          <div className="bg-gray-50 rounded-lg p-3 border">
            <div className="text-xs text-gray-500 mb-1">
              {messageSender === "bot" ? "Resposta da IA:" : "Sua mensagem:"}
            </div>
            <div className="text-sm text-gray-700 line-clamp-3">{messageContent}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="flex-1 bg-transparent">
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!rating || isSubmitting}
              className={`flex-1 ${
                rating === "positive"
                  ? "bg-green-600 hover:bg-green-700"
                  : rating === "negative"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400"
              }`}
            >
              {isSubmitting ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
