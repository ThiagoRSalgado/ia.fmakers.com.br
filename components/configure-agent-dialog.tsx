"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Agent } from "@/types/agent"

interface ConfigureAgentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
  onSubmit: (config: Partial<Agent>) => void
}

export function ConfigureAgentDialog({ open, onOpenChange, agent, onSubmit }: ConfigureAgentDialogProps) {
  const [config, setConfig] = useState({
    name: "",
    description: "",
    debounce_time: 30,
    max_followups: 3,
    human_intervention: false,
    is_active: true,
  })

  useEffect(() => {
    if (agent) {
      setConfig({
        name: agent.name,
        description: agent.description || "",
        debounce_time: agent.debounce_time,
        max_followups: agent.max_followups,
        human_intervention: agent.human_intervention,
        is_active: agent.is_active,
      })
    }
  }, [agent])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(config)
  }

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurar Agente - {agent.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Agente</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debounce_time">Tempo de Espera (segundos)</Label>
              <Input
                id="debounce_time"
                type="number"
                min="1"
                value={config.debounce_time}
                onChange={(e) => setConfig({ ...config, debounce_time: Number.parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={config.description}
              onChange={(e) => setConfig({ ...config, description: e.target.value })}
              placeholder="Breve descrição do agente"
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
                value={config.max_followups}
                onChange={(e) => setConfig({ ...config, max_followups: Number.parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="human_intervention"
                  checked={config.human_intervention}
                  onCheckedChange={(checked) => setConfig({ ...config, human_intervention: checked })}
                />
                <Label htmlFor="human_intervention">Intervenção Humana</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={config.is_active}
                  onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
                />
                <Label htmlFor="is_active">Ativar Agente</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90">
              Salvar Configurações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
