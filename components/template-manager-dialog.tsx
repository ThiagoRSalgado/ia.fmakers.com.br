"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Bot, Zap, ArrowRight, Copy } from "lucide-react"

interface TemplateManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface ServiceTemplate {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  step1Fields: TemplateField[]
  step2Fields: TemplateField[]
}

interface TemplateField {
  id: string
  label: string
  type: "text" | "email" | "textarea" | "number" | "select"
  required: boolean
  placeholder?: string
  options?: string[]
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: "sdr-ia",
    name: "SDR IA",
    description: "Agente inteligente para prospecção e qualificação de leads",
    icon: <Bot className="h-5 w-5" />,
    step1Fields: [
      { id: "company_name", label: "Nome da Empresa", type: "text", required: true, placeholder: "Ex: Empresa LTDA" },
      { id: "client_name", label: "Nome do Cliente", type: "text", required: true, placeholder: "Ex: João Silva" },
      { id: "cnpj_cpf", label: "CNPJ/CPF", type: "text", required: true, placeholder: "Ex: 12.345.678/0001-90" },
      { id: "email", label: "Email", type: "email", required: true, placeholder: "Ex: contato@empresa.com" },
    ],
    step2Fields: [
      {
        id: "market_differentials",
        label: "Diferenciais de Mercado",
        type: "textarea",
        required: true,
        placeholder: "Descreva os principais diferenciais da empresa...",
      },
      { id: "openai_token", label: "Token OpenAI", type: "text", required: true, placeholder: "sk-proj-..." },
      { id: "elevenlabs_token", label: "Token ElevenLabs", type: "text", required: true, placeholder: "el_..." },
      { id: "n8n_token", label: "Token N8N", type: "text", required: true, placeholder: "Token para integração N8N" },
      { id: "users_count", label: "Número de Usuários", type: "number", required: true, placeholder: "Ex: 5" },
      { id: "boxes_count", label: "Número de Caixas", type: "number", required: true, placeholder: "Ex: 3" },
      {
        id: "tools_needed",
        label: "Ferramentas Necessárias",
        type: "textarea",
        required: false,
        placeholder: "Liste as ferramentas que a IA deve ter acesso...",
      },
      {
        id: "questions_to_ask",
        label: "Perguntas que a IA deve fazer",
        type: "textarea",
        required: false,
        placeholder: "Liste as perguntas essenciais para qualificação...",
      },
    ],
  },
]

type CurrentStep = 1 | 2
type ExecutionStatus = "idle" | "creating-user" | "configuring-workflow" | "success" | "error"

export function TemplateManagerDialog({ open, onOpenChange }: TemplateManagerDialogProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [currentStep, setCurrentStep] = useState<CurrentStep>(1)
  const [step1Data, setStep1Data] = useState<Record<string, string>>({})
  const [step2Data, setStep2Data] = useState<Record<string, string>>({})
  const [executionStatus, setExecutionStatus] = useState<ExecutionStatus>("idle")
  const [executionMessage, setExecutionMessage] = useState("")
  const [userInviteLink, setUserInviteLink] = useState("")
  const [generatedPassword, setGeneratedPassword] = useState("")
  const [userExists, setUserExists] = useState(false)

  const generatePassword = (companyName: string) => {
    const empresa = (companyName || "empresa")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 4) // prefixo fixo

    const letters = "abcdefghijklmnopqrstuvwxyz"
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const specials = "-"

    let password = ""
    password += upper.charAt(Math.floor(Math.random() * upper.length))
    password += numbers.charAt(Math.floor(Math.random() * numbers.length))
    password += specials.charAt(Math.floor(Math.random() * specials.length))

    const all = letters + upper + numbers + specials
    for (let i = 0; i < 8 - 3; i++) {
      password += all.charAt(Math.floor(Math.random() * all.length))
    }

    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("")

    return (empresa + password).slice(0, 12)
  }

  const handleCopyInviteLink = async () => {
    if (userInviteLink) {
      try {
        await navigator.clipboard.writeText(userInviteLink)
        setExecutionMessage("Link copiado para área de transferência!")
      } catch (error) {
        setExecutionMessage("Erro ao copiar link")
      }
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setCurrentStep(1)
    setStep1Data({})
    setStep2Data({})
    setExecutionStatus("idle")
    setExecutionMessage("")
    setUserInviteLink("")
    setGeneratedPassword("")
    setUserExists(false)
  }

  const handleStep1InputChange = (fieldId: string, value: string) => {
    setStep1Data((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleStep2InputChange = (fieldId: string, value: string) => {
    setStep2Data((prev) => ({ ...prev, [fieldId]: value }))
  }

  const handleStep1Submit = async () => {
    if (!selectedTemplate) return

    const template = SERVICE_TEMPLATES.find((t) => t.id === selectedTemplate)
    if (!template) return

    const missingFields = template.step1Fields
      .filter((field) => field.required && !step1Data[field.id])
      .map((field) => field.label)

    if (missingFields.length > 0) {
      setExecutionStatus("error")
      setExecutionMessage(`Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`)
      return
    }

    try {
      setExecutionStatus("creating-user")
      setExecutionMessage("Criando usuário no N8N...")

      const userResponse = await fetch("/api/templates/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: step1Data.email,
          name: step1Data.client_name,
          company: step1Data.company_name,
          cnpj: step1Data.cnpj_cpf,
        }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.error || "Falha ao criar usuário no N8N")
      }

      const userData = await userResponse.json()

      setUserExists(userData.userExists)

      if (userData.userExists) {
        setExecutionMessage("Usuário já existe no sistema. Prossiga para a configuração do fluxo.")
        setExecutionStatus("idle")
        setCurrentStep(2)
      } else {
        setUserInviteLink(userData.inviteLink || "")
        const password = generatePassword(step1Data.company_name || "empresa")
        setGeneratedPassword(password)
        setExecutionMessage(
          "Usuário criado com sucesso! Copie o link de convite e configure o token N8N antes de prosseguir.",
        )
        setExecutionStatus("idle")
      }
    } catch (error) {
      setExecutionStatus("error")
      setExecutionMessage(error instanceof Error ? error.message : "Erro ao criar usuário")
    }
  }

  const handleAdvanceToStep2 = () => {
    if (!step2Data.n8n_token) {
      setExecutionStatus("error")
      setExecutionMessage("Token N8N é obrigatório para prosseguir")
      return
    }
    setCurrentStep(2)
    setExecutionStatus("idle")
    setExecutionMessage("")
  }

  const handleStep2Submit = async () => {
    if (!selectedTemplate) return

    const template = SERVICE_TEMPLATES.find((t) => t.id === selectedTemplate)
    if (!template) return

    const missingFields = template.step2Fields
      .filter((field) => field.required && !step2Data[field.id])
      .map((field) => field.label)

    if (missingFields.length > 0) {
      setExecutionStatus("error")
      setExecutionMessage(`Campos obrigatórios não preenchidos: ${missingFields.join(", ")}`)
      return
    }

    try {
      setExecutionStatus("configuring-workflow")
      setExecutionMessage("Configurando fluxo SDR IA...")

      const workflowResponse = await fetch("/api/templates/configure-workflow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...step1Data,
          ...step2Data,
          user_invitation_link: userInviteLink,
          template_type: "sdr-ia",
          generated_password: generatedPassword,
        }),
      })

      if (!workflowResponse.ok) {
        const errorData = await workflowResponse.json()
        throw new Error(errorData.error || "Falha ao configurar fluxo SDR IA")
      }

      setExecutionStatus("success")
      setExecutionMessage(`Fluxo SDR IA criado com sucesso! Usuário criado e configurações aplicadas.`)

      setTimeout(() => {
        setSelectedTemplate("")
        setCurrentStep(1)
        setStep1Data({})
        setStep2Data({})
        setExecutionStatus("idle")
        setExecutionMessage("")
        setUserInviteLink("")
        setGeneratedPassword("")
        setUserExists(false)
      }, 5000)
    } catch (error) {
      setExecutionStatus("error")
      setExecutionMessage(error instanceof Error ? error.message : "Erro ao configurar fluxo")
    }
  }

  const selectedTemplateData = SERVICE_TEMPLATES.find((t) => t.id === selectedTemplate)
  const currentFields = selectedTemplateData
    ? currentStep === 1
      ? selectedTemplateData.step1Fields
      : selectedTemplateData.step2Fields
    : []
  const currentData = currentStep === 1 ? step1Data : step2Data
  const handleInputChange = currentStep === 1 ? handleStep1InputChange : handleStep2InputChange

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-flow-lime" />
            Gerenciador de Templates
          </DialogTitle>
          <DialogDescription>
            Crie novos fluxos automatizados no N8N usando templates pré-configurados
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-3">
            <Label>Selecione o Tipo de Serviço</Label>
            <div className="grid grid-cols-1 gap-3">
              {SERVICE_TEMPLATES.map((template) => (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id ? "ring-2 ring-flow-lime bg-flow-lime/5" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleTemplateSelect(template.id)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      {template.icon}
                      {template.name}
                    </CardTitle>
                    <CardDescription className="text-xs">{template.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {selectedTemplateData && (
            <div className="flex items-center justify-center gap-4 py-4">
              <div
                className={`flex items-center gap-2 ${currentStep === 1 ? "text-flow-lime font-semibold" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep === 1 ? "bg-flow-lime text-flow-dark-teal" : "bg-gray-200"}`}
                >
                  1
                </div>
                <span>Criar Usuário</span>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
              <div
                className={`flex items-center gap-2 ${currentStep === 2 ? "text-flow-lime font-semibold" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep === 2 ? "bg-flow-lime text-flow-dark-teal" : "bg-gray-200"}`}
                >
                  2
                </div>
                <span>Configurar Fluxo</span>
              </div>
            </div>
          )}

          {selectedTemplateData && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">
                  {currentStep === 1 ? "Dados do Cliente" : "Configuração Técnica"}: {selectedTemplateData.name}
                </h3>
                <Badge variant="outline">{currentFields.length} campos</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label htmlFor={field.id}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>

                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.id}
                        placeholder={field.placeholder}
                        value={currentData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        rows={3}
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={currentData[field.id] || ""}
                        onValueChange={(value) => handleInputChange(field.id, value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma opção" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={currentData[field.id] || ""}
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {executionStatus !== "idle" && (
            <Card
              className={`${
                executionStatus === "success"
                  ? "border-green-200 bg-green-50"
                  : executionStatus === "error"
                    ? "border-red-200 bg-red-50"
                    : "border-blue-200 bg-blue-50"
              }`}
            >
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  {(executionStatus === "creating-user" || executionStatus === "configuring-workflow") && (
                    <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  )}
                  {executionStatus === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {executionStatus === "error" && <XCircle className="h-5 w-5 text-red-600" />}
                  <span
                    className={`font-medium ${
                      executionStatus === "success"
                        ? "text-green-800"
                        : executionStatus === "error"
                          ? "text-red-800"
                          : "text-blue-800"
                    }`}
                  >
                    {executionMessage}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {userInviteLink && currentStep === 1 && (
            <Card className="border-flow-lime/30 bg-flow-lime/5">
              <CardContent className="pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-flow-dark-teal">Link de Convite Disponível</span>
                    <Button
                      onClick={handleCopyInviteLink}
                      variant="outline"
                      size="sm"
                      className="border-flow-lime text-flow-dark-teal hover:bg-flow-lime/10 bg-transparent"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar Link
                    </Button>
                  </div>

                  {generatedPassword && (
                    <div className="p-3 bg-white rounded-lg border">
                      <Label className="text-sm font-medium text-flow-dark-teal">Senha Gerada:</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{generatedPassword}</code>
                        <Button
                          onClick={() => navigator.clipboard.writeText(generatedPassword)}
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="n8n_token">
                      Token N8N <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="n8n_token"
                      placeholder="Token para integração N8N"
                      value={step2Data.n8n_token || ""}
                      onChange={(e) => handleStep2InputChange("n8n_token", e.target.value)}
                    />
                    <p className="text-xs text-gray-600">
                      Complete o cadastro usando o link acima e cole aqui o token N8N gerado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>

            {currentStep === 1 ? (
              <>
                {!userInviteLink ? (
                  <Button
                    onClick={handleStep1Submit}
                    disabled={!selectedTemplate || executionStatus === "creating-user"}
                    className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90"
                  >
                    {executionStatus === "creating-user" ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Criando Usuário...
                      </>
                    ) : (
                      <>
                        Criar Usuário
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleAdvanceToStep2}
                    disabled={!step2Data.n8n_token}
                    className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90"
                  >
                    Prosseguir para Configuração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}

                {userExists && (
                  <Button
                    onClick={() => setCurrentStep(2)}
                    className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90"
                  >
                    Prosseguir para Configuração
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </>
            ) : (
              <Button
                onClick={handleStep2Submit}
                disabled={executionStatus === "configuring-workflow"}
                className="bg-flow-lime text-flow-dark-teal hover:bg-flow-lime/90"
              >
                {executionStatus === "configuring-workflow" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Configurando...
                  </>
                ) : (
                  "Finalizar Configuração"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
