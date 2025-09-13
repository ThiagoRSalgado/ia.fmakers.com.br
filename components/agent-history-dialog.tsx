"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Agent, AgentHistory } from "@/types/agent"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface AgentHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent | null
}

export function AgentHistoryDialog({ open, onOpenChange, agent }: AgentHistoryDialogProps) {
  const [history, setHistory] = useState<AgentHistory[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (agent && open) {
      loadHistory()
    }
  }, [agent, open])

  const loadHistory = async () => {
    if (!agent) return

    try {
      setLoading(true)
      const response = await fetch(`/api/agents/${agent.id}/history`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data.history || [])
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error)
    } finally {
      setLoading(false)
    }
  }

  const getEventTypeLabel = (eventType: string) => {
    const labels = {
      created: "Criado",
      updated: "Atualizado",
      activated: "Ativado",
      deactivated: "Desativado",
      prompt_changed: "Prompt Alterado",
    }
    return labels[eventType as keyof typeof labels] || eventType
  }

  const getEventTypeBadgeVariant = (eventType: string) => {
    const variants = {
      created: "default",
      updated: "secondary",
      activated: "default",
      deactivated: "destructive",
      prompt_changed: "outline",
    }
    return variants[eventType as keyof typeof variants] || "secondary"
  }

  const renderEventData = (eventType: string, eventData: any) => {
    if (!eventData || Object.keys(eventData).length === 0) return null

    switch (eventType) {
      case "created":
        if (eventData.initial_config) {
          const config = eventData.initial_config
          return (
            <div className="mt-3 space-y-2">
              <h4 className="text-sm font-medium text-foreground">Configuração inicial:</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span> {config.name}
                </div>
                <div>
                  <span className="text-muted-foreground">Tempo de espera:</span> {config.debounce_time}s
                </div>
                <div>
                  <span className="text-muted-foreground">Follow-ups:</span> {config.max_followups}
                </div>
                <div>
                  <span className="text-muted-foreground">Intervenção humana:</span>{" "}
                  {config.human_intervention ? "Sim" : "Não"}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span> {config.is_active ? "Ativo" : "Inativo"}
                </div>
              </div>
              {config.prompt && (
                <div className="mt-2">
                  <span className="text-muted-foreground text-sm">Prompt:</span>
                  <p className="text-sm bg-muted p-2 rounded mt-1 max-h-20 overflow-y-auto">{config.prompt}</p>
                </div>
              )}
            </div>
          )
        }
        break

      case "updated":
        if (eventData.changed_fields && eventData.old_values && eventData.new_values) {
          const getFieldLabel = (field: string) => {
            const labels: Record<string, string> = {
              name: "Nome",
              prompt: "Prompt",
              debounce_time: "Tempo de espera",
              max_followups: "Follow-ups",
              human_intervention: "Intervenção humana",
              is_active: "Status",
            }
            return labels[field] || field
          }

          const formatValue = (field: string, value: any) => {
            if (field === "human_intervention" || field === "is_active") {
              return value ? "Sim" : "Não"
            }
            if (field === "debounce_time") {
              return `${value}s`
            }
            return value
          }

          return (
            <div className="mt-3 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Alterações realizadas:</h4>
              {eventData.changed_fields.map((field: string) => (
                <div key={field} className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium mb-2">{getFieldLabel(field)}</div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex-1">
                      <span className="text-muted-foreground">Antes:</span>
                      <div className="bg-red-50 dark:bg-red-950/20 p-2 rounded mt-1 border-l-2 border-red-200 dark:border-red-800">
                        {field === "prompt" ? (
                          <p className="max-h-16 overflow-y-auto">{eventData.old_values[field]}</p>
                        ) : (
                          formatValue(field, eventData.old_values[field])
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <span className="text-muted-foreground">Depois:</span>
                      <div className="bg-green-50 dark:bg-green-950/20 p-2 rounded mt-1 border-l-2 border-green-200 dark:border-green-800">
                        {field === "prompt" ? (
                          <p className="max-h-16 overflow-y-auto">{eventData.new_values[field]}</p>
                        ) : (
                          formatValue(field, eventData.new_values[field])
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        }
        break

      default:
        return (
          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto">{JSON.stringify(eventData, null, 2)}</pre>
        )
    }

    return null
  }

  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Histórico - {agent.name}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          {loading ? (
            <div className="space-y-4 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg animate-pulse">
                  <div className="w-20 h-6 bg-muted rounded"></div>
                  <div className="flex-1 h-4 bg-muted rounded"></div>
                  <div className="w-16 h-4 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum histórico encontrado</p>
            </div>
          ) : (
            <div className="space-y-4 p-4">
              {history.map((event) => (
                <div key={event.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant={getEventTypeBadgeVariant(event.event_type) as any}>
                      {getEventTypeLabel(event.event_type)}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(event.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  {renderEventData(event.event_type, event.event_data)}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
