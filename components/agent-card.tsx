"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Clock, MessageSquare, Trash2, Bot } from "lucide-react"
import type { Agent } from "@/types/agent"

interface AgentCardProps {
  agent: Agent
  onEditPrompt: (agent: Agent) => void
  onConfigure: (agent: Agent) => void
  onViewHistory: (agent: Agent) => void
  onDelete: (agentId: string) => void
  onUpdate: (agentId: string, updates: Partial<Agent>) => void
  onTestAI: (agent: Agent) => void
}

export function AgentCard({
  agent,
  onEditPrompt,
  onConfigure,
  onViewHistory,
  onDelete,
  onUpdate,
  onTestAI,
}: AgentCardProps) {
  const [isActive, setIsActive] = useState(agent.is_active)

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked)
    await onUpdate(agent.id, { is_active: checked })
  }

  return (
    <Card
      className={`bg-card hover:shadow-lg transition-all duration-300 leading-7 ${
        isActive ? "ring-2 ring-flow-lime/20 border-flow-lime/30" : "border-gray-200"
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg text-card-foreground">{agent.name}</h3>
              <Badge
                variant={isActive ? "default" : "secondary"}
                className={`text-xs ${
                  isActive
                    ? "bg-green-100 text-green-800 border-green-200"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                <div className={`w-2 h-2 rounded-full mr-1 ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
                {isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{agent.description || "Sem descrição"}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center gap-1">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleActive}
                className="data-[state=checked]:bg-flow-lime data-[state=unchecked]:bg-gray-300 bg-[rgba(18,68,75,1)]"
              />
              <span className="text-xs text-muted-foreground">{isActive ? "ON" : "OFF"}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditPrompt(agent)}>Editar Prompt</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onConfigure(agent)}>Configurar</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onViewHistory(agent)}>Histórico</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(agent.id)} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
            <span className="text-sm font-medium">Status do Agente</span>
          </div>
          <span className={`text-sm font-semibold ${isActive ? "text-green-600" : "text-gray-500"}`}>
            {isActive ? "Operacional" : "Desativado"}
          </span>
        </div>

        {/* Agent Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Tempo de Espera</p>
              <p className="font-medium">{agent.debounce_time}s</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Follow-ups</p>
              <p className="font-medium">{agent.max_followups}</p>
            </div>
          </div>
        </div>

        {/* Human Intervention Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Intervenção Humana</span>
          <Badge variant={agent.human_intervention ? "default" : "secondary"}>
            {agent.human_intervention ? "Sim" : "Não"}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            onClick={() => onEditPrompt(agent)}
            className="flex-1 min-w-[120px] bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90 bg-[rgba(255,255,255,1)] text-[rgba(10,10,10,1)] border-solid border border-slate-200"
            size="sm"
          >
            Editar Prompt
          </Button>
          <Button onClick={() => onConfigure(agent)} variant="outline" size="sm" className="flex-1 min-w-[100px]">
            Configurar
          </Button>
          <Button onClick={() => onViewHistory(agent)} variant="outline" size="sm" className="flex-1 min-w-[100px]">
            Histórico
          </Button>
          <Button
            onClick={() => onTestAI(agent)}
            variant="outline"
            size="sm"
            className="flex-1 min-w-[100px] hover:bg-blue-100 border-[rgba(9,67,73,1)] bg-[rgba(18,68,75,1)] text-white"
          >
            <Bot className="h-4 w-4 mr-1" />
            Testar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
