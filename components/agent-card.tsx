"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoreVertical, Bot, Trash2, Clock, Edit, Settings, History } from "lucide-react"
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })

  const handleToggleActive = async (checked: boolean) => {
    setIsActive(checked)
    await onUpdate(agent.id, { is_active: checked })
  }

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("[v0] Three dots button clicked - custom menu")

    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom + window.scrollY + 4,
        left: rect.right + window.scrollX - 192, // 192px = w-48
      })
    }

    setIsMenuOpen(!isMenuOpen)
  }

  const handleMenuItemClick = (action: () => void) => {
    action()
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isMenuOpen])

  const MenuPortal = () => {
    if (!isMenuOpen) return null

    return createPortal(
      <>
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
          onTouchStart={() => setIsMenuOpen(false)}
        />

        <div
          className="fixed w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1"
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleMenuItemClick(() => onEditPrompt(agent))}
            onTouchStart={() => handleMenuItemClick(() => onEditPrompt(agent))}
          >
            <Edit className="h-4 w-4" />
            Editar Prompt
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleMenuItemClick(() => onConfigure(agent))}
            onTouchStart={() => handleMenuItemClick(() => onConfigure(agent))}
          >
            <Settings className="h-4 w-4" />
            Configurar
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
            onClick={() => handleMenuItemClick(() => onViewHistory(agent))}
            onTouchStart={() => handleMenuItemClick(() => onViewHistory(agent))}
          >
            <History className="h-4 w-4" />
            Histórico
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
            onClick={() => handleMenuItemClick(() => onDelete(agent.id))}
            onTouchStart={() => handleMenuItemClick(() => onDelete(agent.id))}
          >
            <Trash2 className="h-4 w-4" />
            Deletar
          </button>
        </div>
      </>,
      document.body,
    )
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
            <span>{isActive ? "Operacional" : "Inativo"}</span>
          </div>
          <div className="flex items-center gap-2 opacity-80">
            <Clock className="h-4 w-4" />
            <span className="tabular-nums">
              {new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4 flex-1">
            <div
              className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #12444B, #0f3a40)" }}
            >
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="truncate text-lg font-semibold tracking-tight text-gray-900">
                  {agent.name.length > 20 ? `${agent.name.substring(0, 20)}...` : agent.name}
                </h3>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className={`text-xs ${
                    isActive
                      ? "bg-green-100 text-green-700 border-green-200"
                      : "bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                >
                  {isActive ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 line-clamp-1">{agent.description || "Sem descrição"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center gap-1">
              <Switch
                checked={isActive}
                onCheckedChange={handleToggleActive}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-gray-300"
              />
              <span className="text-xs text-gray-500">{isActive ? "ON" : "OFF"}</span>
            </div>

            <Button
              ref={buttonRef}
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative z-10 touch-manipulation"
              onClick={toggleMenu}
              onTouchStart={toggleMenu}
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onEditPrompt(agent)}
            className="h-11 justify-center gap-2 rounded-xl border hover:opacity-90"
            style={{
              backgroundColor: "#12444B10",
              color: "#12444B",
              borderColor: "#12444B30",
            }}
            variant="outline"
          >
            Editar Prompt
          </Button>

          <Button
            onClick={() => onTestAI(agent)}
            className="h-11 justify-center gap-2 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
            variant="outline"
          >
            <Bot className="h-4 w-4" />
            Testar IA
          </Button>
        </div>
      </CardContent>

      <MenuPortal />
    </Card>
  )
}
