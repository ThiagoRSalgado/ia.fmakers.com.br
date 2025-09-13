"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Agent } from "@/types/agent"

interface CreateAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (agent: Omit<Agent, "id" | "created_at" | "updated_at">) => void
}

export function CreateAgentDialog({ open, onOpenChange, onSubmit }: CreateAgentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    prompt: "",
    debounce_time: 30,
    max_followups: 3,
    human_intervention: false,
    is_active: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      name: "",
      description: "",
      prompt: "",
      debounce_time: 30,
      max_followups: 3,
      human_intervention: false,
      is_active: true,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Criar Novo Agente</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6 h-full flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Agente</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Atendimento Comercial"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="debounce_time">Tempo de Espera (segundos)</Label>
                <Input
                  id="debounce_time"
                  type="number"
                  min="1"
                  value={formData.debounce_time}
                  onChange={(e) => setFormData({ ...formData, debounce_time: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Breve descrição do agente"
              />
            </div>

            <div className="space-y-2 flex-1">
              <Label htmlFor="prompt">Prompt do Sistema</Label>
              <Textarea
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                placeholder="Defina o comportamento e personalidade do agente..."
                rows={15}
                className="font-mono text-sm resize-none min-h-[300px]"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_followups">Número de Follow-ups</Label>
                <Input
                  id="max_followups"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.max_followups}
                  onChange={(e) => setFormData({ ...formData, max_followups: Number.parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="human_intervention"
                    checked={formData.human_intervention}
                    onCheckedChange={(checked) => setFormData({ ...formData, human_intervention: checked })}
                  />
                  <Label htmlFor="human_intervention">Intervenção Humana</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Ativar Agente</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t bg-white sticky bottom-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90">
                Criar Agente
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
