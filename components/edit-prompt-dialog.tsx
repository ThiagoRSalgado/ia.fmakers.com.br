"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import type { Agent } from "@/types/agent"

interface EditPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSubmit: (prompt: string) => void
}

export function EditPromptDialog({ open, onOpenChange, agent, onSubmit }: EditPromptDialogProps) {
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    if (agent) {
      setPrompt(agent.prompt)
    }
  }, [agent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(prompt)
  }

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Prompt - {agent.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4 h-full flex flex-col">
            <div className="space-y-2 flex-1">
              <Label htmlFor="prompt">Prompt do Sistema</Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Defina o comportamento e personalidade do agente..."
                rows={20}
                className="font-mono text-sm resize-none h-full min-h-[400px]"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t bg-white sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90">
                Salvar Prompt
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
