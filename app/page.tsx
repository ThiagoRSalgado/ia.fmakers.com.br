"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { AgentCard } from "@/components/agent-card"
import { CreateAgentDialog } from "@/components/create-agent-dialog"
import { EditPromptDialog } from "@/components/edit-prompt-dialog"
import { ConfigureAgentDialog } from "@/components/configure-agent-dialog"
import { AgentHistoryDialog } from "@/components/agent-history-dialog"
import { TestAIWithHistoryDialog } from "@/components/test-ai-with-history-dialog" // importando nova interface
import { Button } from "@/components/ui/button"
import { Plus, Bot, Activity } from "lucide-react"
import type { Agent } from "@/types/agent"
import type { User } from "@/types/user"

export default function Dashboard() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editPromptDialog, setEditPromptDialog] = useState<{ open: boolean; agent: Agent | null }>({
    open: false,
    agent: null,
  })
  const [configureDialog, setConfigureDialog] = useState<{ open: boolean; agent: Agent | null }>({
    open: false,
    agent: null,
  })
  const [historyDialog, setHistoryDialog] = useState<{ open: boolean; agent: Agent | null }>({
    open: false,
    agent: null,
  })
  const [testAIDialog, setTestAIDialog] = useState<{ open: boolean; agent: Agent | null }>({
    open: false,
    agent: null,
  })

  useEffect(() => {
    loadAgents()
    loadUserData()
  }, [])

  const loadAgents = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/agents", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAgents(data.agents || [])
      }
    } catch (error) {
      console.error("Erro ao carregar agentes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const userData = await response.json()
        console.log("[v0] User data loaded:", userData)
        console.log("[v0] OpenAI token exists:", !!userData?.user?.openai_token)
        console.log("[v0] ElevenLabs token exists:", !!userData?.user?.elevenlabs_token)
        setUser(userData.user)
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error)
    }
  }

  const handleCreateAgent = async (agentData: Omit<Agent, "id" | "created_at" | "updated_at">) => {
    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(agentData),
      })

      if (response.ok) {
        await loadAgents()
        setCreateDialogOpen(false)
      }
    } catch (error) {
      console.error("Erro ao criar agente:", error)
    }
  }

  const handleUpdateAgent = async (agentId: string, updates: Partial<Agent>) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        await loadAgents()
      }
    } catch (error) {
      console.error("Erro ao atualizar agente:", error)
    }
  }

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        await loadAgents()
      }
    } catch (error) {
      console.error("Erro ao deletar agente:", error)
    }
  }

  const handleTestAI = (agent: Agent) => {
    setTestAIDialog({ open: true, agent })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      <main className="container mx-auto px-6 py-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-flow-dark-teal via-flow-medium-teal to-flow-dark-teal p-8 mb-8 text-white bg-[rgba(17,68,75,1)]">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-flow-lime bg-clip-text text-[rgba(232,245,78,1)]">
                  Painel de Controle IA
                </h1>
                <p className="text-flow-lime/80 text-lg">Gerencie seus agentes inteligentes</p>
              </div>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90 font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-[rgba(232,245,78,1)] text-teal-950"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Agente
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-flow-lime/20 rounded-lg">
                    <Bot className="w-6 h-6 text-flow-lime" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{agents.length}</p>
                    <p className="text-sm text-flow-lime">Total de Agentes</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{agents.filter((a) => a.is_active).length}</p>
                    <p className="text-sm text-flow-lime">Agentes Ativos</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${user?.openai_token && user.openai_token.trim() !== "" ? "bg-green-500/20" : "bg-gray-500/20"}`}
                  >
                    <svg
                      className={`w-6 h-6 ${user?.openai_token && user.openai_token.trim() !== "" ? "text-green-400" : "text-gray-400"}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${user?.openai_token && user.openai_token.trim() !== "" ? "text-green-400" : "text-white"}`}
                    >
                      {user?.openai_token && user.openai_token.trim() !== "" ? "Ativo" : "Inativo"}
                    </p>
                    <p className="text-sm text-flow-lime">OpenAI</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2 rounded-lg ${user?.elevenlabs_token && user.elevenlabs_token.trim() !== "" ? "bg-green-500/20" : "bg-gray-500/20"}`}
                  >
                    <svg
                      className={`w-6 h-6 ${user?.elevenlabs_token && user.elevenlabs_token.trim() !== "" ? "text-green-400" : "text-gray-400"}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M11.999 0C18.617 0 24 5.383 24 12.001S18.617 24 11.999 24C5.383 24 0 18.617 0 12.001S5.383 0 11.999 0zm0 1.714c-5.68 0-10.285 4.605-10.285 10.287S6.319 22.286 12 22.286s10.285-4.605 10.285-10.285S17.68 1.714 11.999 1.714zm0 2.572c4.284 0 7.713 3.429 7.713 7.715 0 4.284-3.429 7.713-7.713 7.713-4.286 0-7.715-3.429-7.715-7.713 0-4.286 3.429-7.715 7.715-7.715zm0 1.714c-3.314 0-6.001 2.687-6.001 6.001S8.685 18.002 12 18.002s6.001-2.687 6.001-6.001S15.314 6 11.999 6z" />
                    </svg>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${user?.elevenlabs_token && user.elevenlabs_token.trim() !== "" ? "text-green-400" : "text-white"}`}
                    >
                      {user?.elevenlabs_token && user.elevenlabs_token.trim() !== "" ? "Ativo" : "Inativo"}
                    </p>
                    <p className="text-sm text-flow-lime">ElevenLabs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse shadow-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : agents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 shadow-xl border border-slate-200 dark:border-slate-700 max-w-md mx-auto">
              <div className="w-20 h-20 bg-flow-lime/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-flow-dark-teal" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Nenhum agente encontrado</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Crie seu primeiro agente IA para começar a automatizar processos
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90 px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Plus className="w-5 h-5 mr-2" />
                Criar Primeiro Agente
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <AgentCard
                key={agent.id}
                agent={agent}
                onEditPrompt={(agent) => setEditPromptDialog({ open: true, agent })}
                onConfigure={(agent) => setConfigureDialog({ open: true, agent })}
                onViewHistory={(agent) => setHistoryDialog({ open: true, agent })}
                onDelete={handleDeleteAgent}
                onUpdate={handleUpdateAgent}
                onTestAI={handleTestAI}
              />
            ))}
          </div>
        )}
      </main>

      {/* Dialogs */}
      <CreateAgentDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSubmit={handleCreateAgent} />

      <EditPromptDialog
        open={editPromptDialog.open}
        onOpenChange={(open) => setEditPromptDialog({ open, agent: null })}
        agent={editPromptDialog.agent}
        onSubmit={(prompt) => {
          if (editPromptDialog.agent) {
            handleUpdateAgent(editPromptDialog.agent.id, { prompt })
            setEditPromptDialog({ open: false, agent: null })
          }
        }}
      />

      <ConfigureAgentDialog
        open={configureDialog.open}
        onOpenChange={(open) => setConfigureDialog({ open, agent: null })}
        agent={configureDialog.agent}
        onSubmit={(config) => {
          if (configureDialog.agent) {
            handleUpdateAgent(configureDialog.agent.id, config)
            setConfigureDialog({ open: false, agent: null })
          }
        }}
      />

      <AgentHistoryDialog
        open={historyDialog.open}
        onOpenChange={(open) => setHistoryDialog({ open, agent: null })}
        agent={historyDialog.agent}
      />

      <TestAIWithHistoryDialog
        open={testAIDialog.open}
        onOpenChange={(open) => setTestAIDialog({ open, agent: null })}
        agent={testAIDialog.agent}
        user={user}
      />
    </div>
  )
}
