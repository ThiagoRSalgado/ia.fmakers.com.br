"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TestAIDialog } from "@/components/test-ai-dialog"
import { CheckCircle, XCircle, TestTube, Clock, Lightbulb } from "lucide-react"
import type { PromptSuggestion } from "@/types/prompt-suggestion"
import type { Agent } from "@/types/agent"
import type { User } from "@/types/user"

interface PromptSuggestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  onPromptUpdated: () => void
}

export function PromptSuggestionsDialog({ open, onOpenChange, user, onPromptUpdated }: PromptSuggestionsDialogProps) {
  const [suggestions, setSuggestions] = useState<PromptSuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [testingAgent, setTestingAgent] = useState<Agent | null>(null)
  const [testDialogOpen, setTestDialogOpen] = useState(false)

  useEffect(() => {
    if (open) {
      loadSuggestions()
    }
  }, [open])

  const loadSuggestions = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/prompt-suggestions")
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data.suggestions || [])
      }
    } catch (error) {
      console.error("Error loading suggestions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (
    suggestionId: string,
    action: "approve" | "reject",
    agentId?: string,
    newPrompt?: string,
  ) => {
    try {
      const response = await fetch("/api/prompt-suggestions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suggestion_id: suggestionId,
          action,
          agent_id: agentId,
          new_prompt: newPrompt,
        }),
      })

      if (response.ok) {
        await loadSuggestions()
        if (action === "approve") {
          onPromptUpdated()
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing suggestion:`, error)
    }
  }

  const handleTestPrompt = (suggestion: PromptSuggestion) => {
    const testAgent: Agent = {
      id: `test-${suggestion.agent_id}`,
      name: `${suggestion.agent_name || "Agente"} (Teste)`,
      prompt: suggestion.suggested_prompt,
      description: "Versão de teste com prompt sugerido",
      debounce_time: 20,
      max_followups: 3,
      human_intervention: false,
      is_active: true,
      user_id: suggestion.user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    setTestingAgent(testAgent)
    setTestDialogOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "testing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      case "testing":
        return <TestTube className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const pendingSuggestions = suggestions.filter((s) => s.status === "pending")
  const processedSuggestions = suggestions.filter((s) => s.status !== "pending")

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] w-[95vw] max-h-[90vh] h-[90vh] p-0 flex flex-col">
          <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-white">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Lightbulb className="w-6 h-6 text-flow-lime" />
              Sugestões de Prompts IA
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 flex flex-col min-h-0">
            <Tabs defaultValue="pending" className="flex-1 flex flex-col">
              <div className="flex-shrink-0 px-6 pt-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Pendentes ({pendingSuggestions.length})
                  </TabsTrigger>
                  <TabsTrigger value="processed" className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Processadas ({processedSuggestions.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="pending" className="flex-1 mt-4 mx-6 mb-6 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {loading ? (
                    <div className="space-y-6">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-lg border p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="h-6 bg-gray-200 rounded w-32"></div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="h-32 bg-gray-100 rounded"></div>
                            <div className="h-32 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pendingSuggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <Lightbulb className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma sugestão pendente</h3>
                      <p className="text-gray-500 max-w-md">
                        Quando a IA analisar os feedbacks dos clientes, as sugestões de melhoria aparecerão aqui.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 pb-4">
                      {pendingSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.id}
                          className="bg-white rounded-lg border border-l-4 border-l-flow-lime shadow-sm"
                        >
                          {/* Header */}
                          <div className="p-6 border-b bg-gray-50/50">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {suggestion.agent_name || `Agente ${suggestion.agent_id}`}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  Sugestão baseada em {suggestion.alterations?.length || 0} feedback(s) de clientes
                                </p>
                              </div>
                              <Badge className={`${getStatusColor(suggestion.status)} flex-shrink-0`}>
                                {getStatusIcon(suggestion.status)}
                                <span className="ml-1 capitalize">{suggestion.status}</span>
                              </Badge>
                            </div>
                          </div>

                          {/* Content */}
                          <div className="p-6 space-y-6">
                            {/* Prompt Comparison */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-700 text-sm">Prompt Atual</h4>
                                <div className="bg-gray-50 border rounded-lg p-4 h-40 overflow-y-auto">
                                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                                    {suggestion.original_prompt}
                                  </p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="font-medium text-gray-700 text-sm">Prompt Sugerido</h4>
                                <div className="bg-flow-lime/5 border border-flow-lime/30 rounded-lg p-4 h-40 overflow-y-auto">
                                  <p className="text-sm text-gray-800 whitespace-pre-wrap break-words">
                                    {suggestion.suggested_prompt}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Improvements */}
                            {suggestion.alterations && suggestion.alterations.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-700 text-sm">Melhorias Identificadas</h4>
                                <div className="flex flex-wrap gap-2">
                                  {suggestion.alterations.map((alteration, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs px-3 py-1 bg-blue-50 text-blue-700 border-blue-200 whitespace-normal break-words"
                                    >
                                      {alteration}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                              <Button
                                onClick={() => handleTestPrompt(suggestion)}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 justify-center"
                              >
                                <TestTube className="w-4 h-4" />
                                Testar Prompt
                              </Button>
                              <Button
                                onClick={() =>
                                  handleAction(
                                    suggestion.id,
                                    "approve",
                                    suggestion.agent_id,
                                    suggestion.suggested_prompt,
                                  )
                                }
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 justify-center"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Aprovar
                              </Button>
                              <Button
                                onClick={() => handleAction(suggestion.id, "reject")}
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2 justify-center"
                              >
                                <XCircle className="w-4 h-4" />
                                Rejeitar
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="processed" className="flex-1 mt-4 mx-6 mb-6 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  {processedSuggestions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <CheckCircle className="w-16 h-16 text-gray-300 mb-4" />
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhuma sugestão processada</h3>
                      <p className="text-gray-500 max-w-md">
                        Sugestões aprovadas ou rejeitadas aparecerão aqui para referência futura.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 pb-4">
                      {processedSuggestions.map((suggestion) => (
                        <div key={suggestion.id} className="bg-white rounded-lg border shadow-sm opacity-75">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-gray-900">
                                  {suggestion.agent_name || `Agente ${suggestion.agent_id}`}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Processada em {new Date(suggestion.updated_at).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <Badge className={getStatusColor(suggestion.status)}>
                                {getStatusIcon(suggestion.status)}
                                <span className="ml-1 capitalize">{suggestion.status}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <TestAIDialog
        open={testDialogOpen}
        onOpenChange={setTestDialogOpen}
        agent={testingAgent}
        user={user}
        testingSuggestion={pendingSuggestions.find(
          (s) => testingAgent && s.agent_id.toString() === testingAgent.id.replace("test-", ""),
        )}
      />
    </>
  )
}
