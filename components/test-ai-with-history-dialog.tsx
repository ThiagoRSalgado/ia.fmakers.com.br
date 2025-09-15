"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Send,
  Bot,
  User,
  Plus,
  Search,
  MessageCircle,
  Zap,
  X,
  Users,
  Smile,
  Frown,
  HelpCircle,
  Settings,
  ShoppingCart,
  Mic,
  MicOff,
  Paperclip,
  FileImage,
  FileText,
  ExternalLink,
} from "lucide-react"
import type { Agent } from "@/types/agent"
import type { User as UserType } from "@/types/user"
import { v4 as uuidv4 } from "uuid"
import { CustomAudioPlayer } from "./custom-audio-player"
import { FeedbackDialog } from "@/components/feedback-dialog"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { PromptReviewDialog } from "./prompt-review-dialog"
import { TrendingUp } from "lucide-react"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "audio" | "file"
  audioData?: {
    base64: string
    mimeType: string
    size: number
  }
  fileData?: {
    base64: string
    mimeType: string
    size: number
    fileName: string
  }
  transcript?: string
  flagged?: boolean
  feedbackSent?: "positive" | "negative"
}

interface FeedbackModal {
  isOpen: boolean
  messageId: string
  originalMessage: string
}

interface Conversation {
  id: string
  contact: string
  lastMessage: string
  created_at: string // Changed from Date to string
  status: "active" | "completed" | "pending"
}

interface TestAIWithHistoryDialogProps {
  agent: Agent | null
  user: UserType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CustomerProfile {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  personality: string
  sampleMessages: string[]
}

const customerProfiles: CustomerProfile[] = [
  {
    id: "satisfied",
    name: "Cliente Satisfeito",
    description: "Cliente feliz que elogia o serviço e faz perguntas simples",
    icon: <Smile className="w-5 h-5" />,
    personality: "Educado, agradecido, faz perguntas diretas",
    sampleMessages: [
      "Olá! Estou muito satisfeito com o serviço de vocês!",
      "Gostaria de saber mais sobre os novos recursos",
      "Obrigado pela ajuda, vocês são ótimos!",
    ],
  },
  {
    id: "dissatisfied",
    name: "Cliente Insatisfeito",
    description: "Cliente frustrado com problemas não resolvidos",
    icon: <Frown className="w-5 h-5" />,
    personality: "Impaciente, exigente, quer soluções rápidas",
    sampleMessages: [
      "Estou com um problema há dias e ninguém resolve!",
      "Isso não funciona! Quero falar com um supervisor!",
      "Já tentei de tudo e nada funciona!",
    ],
  },
  {
    id: "confused",
    name: "Cliente Confuso",
    description: "Cliente que tem dificuldades para entender o sistema",
    icon: <HelpCircle className="w-5 h-5" />,
    personality: "Faz muitas perguntas, precisa de explicações detalhadas",
    sampleMessages: [
      "Não entendi como funciona isso...",
      "Onde eu clico para fazer isso?",
      "Pode me explicar passo a passo?",
    ],
  },
  {
    id: "technical",
    name: "Cliente Técnico",
    description: "Cliente com conhecimento técnico que faz perguntas específicas",
    icon: <Settings className="w-5 h-5" />,
    personality: "Direto, usa termos técnicos, quer detalhes específicos",
    sampleMessages: [
      "Preciso configurar a API para integração",
      "Qual é a documentação técnica disponível?",
      "Como funciona a autenticação OAuth?",
    ],
  },
  {
    id: "buyer",
    name: "Cliente Comprador",
    description: "Cliente interessado em comprar produtos ou serviços",
    icon: <ShoppingCart className="w-5 h-5" />,
    personality: "Interessado em preços, benefícios e comparações",
    sampleMessages: [
      "Quais são os planos disponíveis?",
      "Tem desconto para pagamento anual?",
      "Como posso fazer um upgrade?",
    ],
  },
]

const mockConversations: Conversation[] = [
  {
    id: "1",
    contact: "Alteração de cadastro",
    lastMessage: "Tentei fazer a alteração do cadastro conforme mostra no site mas dá um erro!",
    created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 min atrás
    status: "active",
  },
  {
    id: "2",
    contact: "Não encontro onde posso fazer...",
    lastMessage: "Não encontro onde eu posso fazer...",
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 min atrás
    status: "pending",
  },
  {
    id: "3",
    contact: "Não entendi onde está!",
    lastMessage: "Não entendi onde está!",
    created_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(), // 42 min atrás
    status: "pending",
  },
  {
    id: "4",
    contact: "Simulação: Cliente Insatisfeito",
    lastMessage: "Isso não resolve meu problema! Quero falar com um humano!",
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1h atrás
    status: "completed",
  },
  {
    id: "5",
    contact: "Simulação: Dúvida Técnica",
    lastMessage: "Preciso de ajuda com configurações avançadas do sistema",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h atrás
    status: "completed",
  },
]

const mockMessages: { [key: string]: Message[] } = {
  "1": [
    {
      id: "1",
      content: "Olá! 👋 Sou o ClaudIA. Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      id: "2",
      content: "Tentei fazer a alteração do cadastro conforme mostra no site mas dá um erro!",
      sender: "user",
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
    },
    {
      id: "3",
      content: "Um especialista do nosso time já está analisando. Só um momento!",
      sender: "bot",
      timestamp: new Date(Date.now() - 7 * 60 * 1000),
    },
    {
      id: "4",
      content: "Realizei o procedimento do assunto alteração_cadastro mas o usuário reportou que o problema persiste.",
      sender: "bot",
      timestamp: new Date(Date.now() - 6 * 60 * 1000),
    },
    {
      id: "5",
      content: "💡 ClaudIA transferiu para atendimento humano.",
      sender: "bot",
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
    },
  ],
  "4": [
    {
      id: "sim1",
      content: "Olá! 👋 Sou o ClaudIA. Como posso ajudá-lo hoje?",
      sender: "bot",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: "sim2",
      content: "Estou com um problema no meu pedido e ninguém resolve!",
      sender: "user",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 30000),
    },
    {
      id: "sim3",
      content: "Entendo sua frustração. Vou verificar seu pedido imediatamente. Pode me informar o número?",
      sender: "bot",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 60000),
    },
    {
      id: "sim4",
      content: "Já informei isso 3 vezes! Vocês não anotam nada?",
      sender: "user",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 90000),
    },
    {
      id: "sim5",
      content:
        "Peço desculpas pela inconveniência. Vou transferir você para um especialista que terá acesso completo ao seu histórico.",
      sender: "bot",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000 + 120000),
    },
  ],
}

const isMediaUrl = (content: string) => {
  try {
    // Decodifica a URL para lidar com caracteres especiais como %2F
    const decodedContent = decodeURIComponent(content.trim())
    const url = new URL(decodedContent)
    const pathname = url.pathname.toLowerCase()

    // Verifica se é uma URL válida do Backblaze ou outro serviço de storage
    const isValidStorageUrl =
      url.hostname.includes("backblazeb2.com") ||
      url.hostname.includes("amazonaws.com") ||
      url.hostname.includes("googleapis.com") ||
      url.hostname.includes("cloudfront.net")

    if (!isValidStorageUrl) {
      return { isMedia: false, isImage: false, isAudio: false, isVideo: false, isPdf: false, url: content }
    }

    // Extensões de imagem
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg", ".bmp"]
    const isImage = imageExtensions.some((ext) => pathname.endsWith(ext))

    // Extensões de áudio
    const audioExtensions = [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".mpga"]
    const isAudio = audioExtensions.some((ext) => pathname.endsWith(ext))

    // Extensões de vídeo
    const videoExtensions = [".mp4", ".webm", ".ogg", ".avi", ".mov", ".wmv", ".flv"]
    const isVideo = videoExtensions.some((ext) => pathname.endsWith(ext))

    // PDF
    const isPdf = pathname.endsWith(".pdf")

    const isMedia = isImage || isAudio || isVideo || isPdf

    return {
      isMedia,
      isImage,
      isAudio,
      isVideo,
      isPdf,
      url: decodedContent,
    }
  } catch (error) {
    // Se não for uma URL válida, retorna como não sendo mídia
    return { isMedia: false, isImage: false, isAudio: false, isVideo: false, isPdf: false, url: content }
  }
}

const formatMessagePreview = (message: string | null | undefined): string => {
  // Verifica se a mensagem existe e não é null/undefined
  if (!message || typeof message !== "string") {
    return "Sem mensagens"
  }

  // Verifica se é uma URL de mídia do Backblaze ou outros serviços
  if (
    message.includes("backblazeb2.com") ||
    message.includes("amazonaws.com") ||
    message.includes("storage.googleapis.com")
  ) {
    try {
      const decodedUrl = decodeURIComponent(message)
      const extension = decodedUrl.split(".").pop()?.toLowerCase()

      if (extension) {
        // Áudio
        if (["mp3", "wav", "ogg", "m4a", "aac", "flac", "mpga"].includes(extension)) {
          return "🎵 Mensagem de áudio"
        }
        // Imagem
        if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(extension)) {
          return "🖼️ Imagem"
        }
        // Vídeo
        if (["mp4", "avi", "mov", "wmv", "flv", "webm", "mkv"].includes(extension)) {
          return "🎥 Vídeo"
        }
        // PDF
        if (extension === "pdf") {
          return "📄 Documento PDF"
        }
        // Outros arquivos
        if (["doc", "docx", "txt", "rtf"].includes(extension)) {
          return "📝 Documento"
        }
        if (["xls", "xlsx", "csv"].includes(extension)) {
          return "📊 Planilha"
        }
        if (["zip", "rar", "7z", "tar"].includes(extension)) {
          return "🗜️ Arquivo compactado"
        }
        // Arquivo genérico
        return "📎 Arquivo"
      }
    } catch (error) {
      // Se houver erro na decodificação, retorna a mensagem original
      return message
    }
  }

  return message
}

export function TestAIWithHistoryDialog({ agent, user, open, onOpenChange }: TestAIWithHistoryDialogProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingConversations, setIsLoadingConversations] = useState(false)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState<FeedbackModal>({
    isOpen: false,
    messageId: "",
    originalMessage: "",
  })
  const [feedbackText, setFeedbackText] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [sessionId, setSessionId] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isNewlyCreatedConversation, setIsNewlyCreatedConversation] = useState(false)
  const [messageFeedback, setMessageFeedback] = useState<Record<string, "positive" | "negative">>({})

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showProfileSelection, setShowProfileSelection] = useState(false)
  const audioChunksRef = useRef<Blob[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [feedbackDialog, setFeedbackDialog] = useState<{
    open: boolean
    messageId: string
    messageContent: string
    messageSender: "user" | "bot"
    preselectedRating?: "positive" | "negative"
  }>({
    open: false,
    messageId: "",
    messageContent: "",
    messageSender: "bot",
  })

  const [promptReviewDialog, setPromptReviewDialog] = useState({
    open: false,
  })

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const loadConversations = async () => {
    if (!agent) return

    setIsLoadingConversations(true)
    try {
      const response = await fetch(
        `/api/agents/${agent.id}/conversations?agent_name=${encodeURIComponent(agent.name || "")}`,
      )
      const data = await response.json()

      if (data.success) {
        const formattedConversations = data.conversations
          .map((conv: any) => ({
            id: conv.id,
            contact: conv.contact,
            lastMessage: conv.lastMessage,
            created_at: conv.created_at,
            status: conv.status || "pending",
          }))
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setConversations(formattedConversations)
      }
    } catch (error) {
      console.error("Error loading conversations:", error)
    } finally {
      setIsLoadingConversations(false)
    }
  }

  const loadMessages = async (conversationId: string) => {
    if (!agent?.id) return

    setIsLoadingMessages(true)
    try {
      const response = await fetch(`/api/agents/${agent.id}/conversations/${conversationId}/messages`)
      const data = await response.json()

      if (data.success) {
        const formattedMessages = data.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
          feedbackSent: messageFeedback[msg.id] || undefined,
        }))
        setMessages(formattedMessages)
      } else {
        console.error("Failed to load messages:", data.error)
      }
    } catch (error) {
      console.error("Error loading messages:", error)
    } finally {
      setIsLoadingMessages(false)
    }
  }

  useEffect(() => {
    if (open && agent?.id) {
      loadConversations()
    }
  }, [open, agent?.id])

  useEffect(() => {
    if (selectedConversation && selectedConversation !== "new") {
      // Só carrega mensagens se não for uma conversa recém-criada
      if (!isNewlyCreatedConversation) {
        loadMessages(selectedConversation)
      }
    } else if (selectedConversation === "new") {
      const newSessionId = crypto.randomUUID()
      setSessionId(newSessionId)

      setMessages([
        {
          id: crypto.randomUUID(),
          content: `Olá! 👋 Sou o ${agent?.name || "Assistente"}. Como posso ajudá-lo hoje?`,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    }
  }, [selectedConversation, agent, isNewlyCreatedConversation])

  useEffect(() => {
    if (isNewlyCreatedConversation) {
      const timer = setTimeout(() => {
        setIsNewlyCreatedConversation(false)
      }, 100) // Reset após um pequeno delay para garantir que o useEffect anterior seja processado

      return () => clearTimeout(timer)
    }
  }, [isNewlyCreatedConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const createConversation = async (sessionId: string, conversationType: "normal" | "simulation" = "normal") => {
    try {
      const response = await fetch(`/api/agents/${agent.id}/conversations/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_name: agent?.name || "",
          session_id: sessionId,
          conversation_type: conversationType,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar conversa")
      }

      const result = await response.json()
      console.log("[v0] Conversa criada:", result)
      return result
    } catch (error) {
      console.error("[v0] Erro ao criar conversa:", error)
      throw error
    }
  }

  const startNewConversation = async () => {
    try {
      const sessionId = uuidv4()
      const result = await createConversation(sessionId, "normal")

      if (result.success && result.conversation_id) {
        setSelectedConversation(result.conversation_id)
        setMessages([])
        setIsNewlyCreatedConversation(true)
        await loadConversations()
      } else {
        console.error("Falha ao criar conversa:", result.error)
      }
    } catch (error) {
      console.error("Erro ao criar nova conversa:", error)
    }
  }

  const simulateConversation = async (conversationId: string) => {
    const maxExchanges = 8 // Máximo de trocas para evitar loops infinitos
    const delayBetweenMessages = 3000 // 3 segundos entre mensagens
    let exchangeCount = 0
    let conversationContext = ""

    // Prompt inicial para a IA Cliente
    const clientAIPrompt = `Você é um cliente interessado em energia solar. Faça perguntas naturais e realistas baseadas nas respostas que receber. Seja específico sobre suas necessidades (residencial/comercial, conta de luz alta, etc.). Mantenha as mensagens curtas e diretas como um cliente real faria no WhatsApp.

Contexto da conversa até agora: {context}

Responda apenas com a mensagem que o cliente enviaria, sem explicações adicionais.`

    // Primeira mensagem do cliente (sempre a mesma para começar)
    const firstClientMessage =
      "Olá! Vi que vocês trabalham com energia solar. Gostaria de saber mais sobre os sistemas para residência."

    // Adicionar primeira mensagem do cliente
    const firstMessage = {
      id: `sim_client_${Date.now()}_0`,
      content: firstClientMessage,
      sender: "user" as const,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    }
    setMessages((prev) => [...prev, firstMessage])
    conversationContext += `Cliente: ${firstClientMessage}\n`

    while (exchangeCount < maxExchanges) {
      try {
        // Aguardar resposta da IA Agente
        await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages))

        const lastClientMessage =
          exchangeCount === 0
            ? firstClientMessage
            : await generateClientMessage(conversationContext, clientAIPrompt, conversationId)

        // Enviar mensagem para a IA Agente
        const agentPayload = {
          action: "sendMessage",
          conversation_id: conversationId,
          chatInput: lastClientMessage,
          metadata: {
            agentId: agent.id,
            agentName: agent.name,
            userId: "simulation@test.com",
          },
        }

        console.log("[v0] Enviando mensagem para IA Agente:", agentPayload)

        const agentResponse = await fetch("https://webhook.agenciaart.com.br/webhook/testedeagenteflow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([agentPayload]),
        })

        if (agentResponse.ok) {
          const agentData = await agentResponse.text()

          try {
            const agentJsonData = JSON.parse(agentData)

            if (agentJsonData.output) {
              const agentMessage = {
                id: `sim_agent_${Date.now()}_${exchangeCount}`,
                content: agentJsonData.output,
                sender: "bot" as const,
                timestamp: new Date().toISOString(),
                type: "text" as const,
              }
              setMessages((prev) => [...prev, agentMessage])
              conversationContext += `Agente: ${agentJsonData.output}\n`

              // Verificar se a conversa deve parar (palavras-chave de finalização)
              const finalizationKeywords = ["obrigado", "tchau", "até logo", "vou pensar", "entrar em contato"]
              if (finalizationKeywords.some((keyword) => agentJsonData.output.toLowerCase().includes(keyword))) {
                console.log("[v0] Conversa finalizada naturalmente")
                break
              }

              exchangeCount++

              // Se não é a última troca, gerar próxima mensagem do cliente
              if (exchangeCount < maxExchanges) {
                await new Promise((resolve) => setTimeout(resolve, delayBetweenMessages))

                // Gerar próxima mensagem do cliente usando IA
                const nextClientMessage = await generateClientMessage(
                  conversationContext,
                  clientAIPrompt,
                  conversationId,
                )

                if (nextClientMessage) {
                  const clientMessage = {
                    id: `sim_client_${Date.now()}_${exchangeCount}`,
                    content: nextClientMessage,
                    sender: "user" as const,
                    timestamp: new Date().toISOString(),
                    type: "text" as const,
                  }
                  setMessages((prev) => [...prev, clientMessage])
                  conversationContext += `Cliente: ${nextClientMessage}\n`
                }
              }
            }
          } catch (parseError) {
            console.error("Erro ao fazer parse da resposta do agente:", parseError)
            break
          }
        } else {
          console.error("Erro na resposta do agente:", agentResponse.status)
          break
        }
      } catch (error) {
        console.error("Erro na simulação dual-AI:", error)
        break
      }
    }

    console.log("[v0] Simulação dual-AI finalizada após", exchangeCount, "trocas")
  }

  const generateClientMessage = async (context: string, prompt: string, conversationId: string): Promise<string> => {
    try {
      const clientPayload = {
        action: "simulate_client", // Nova action para diferenciar
        conversation_id: conversationId, // Added conversation_id to payload
        context: context,
        prompt: prompt.replace("{context}", context),
        metadata: {
          agentId: agent.id,
          agentName: `${agent?.name || "Assistente"} - Cliente Simulado`,
          userId: "client_simulation@test.com",
        },
      }

      console.log("[v0] Gerando mensagem do cliente IA:", clientPayload)

      const clientResponse = await fetch("https://webhook.agenciaart.com.br/webhook/testedeagenteflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([clientPayload]),
      })

      if (clientResponse.ok) {
        const clientData = await clientResponse.text()

        try {
          const clientJsonData = JSON.parse(clientData)
          return clientJsonData.output || "Entendi, obrigado pelas informações!"
        } catch (parseError) {
          console.error("Erro ao fazer parse da resposta do cliente:", parseError)
          return "Pode me dar mais detalhes sobre isso?"
        }
      } else {
        console.error("Erro na resposta do cliente IA:", clientResponse.status)
        return "Interessante, e quanto aos custos?"
      }
    } catch (error) {
      console.error("Erro ao gerar mensagem do cliente:", error)
      return "Preciso saber mais sobre essa opção."
    }
  }

  const startSimulation = async () => {
    try {
      const simulationId = uuidv4()
      const result = await createConversation(simulationId, "simulation")

      if (result.success && result.conversation_id) {
        setSelectedConversation(result.conversation_id)
        setMessages([])
        setIsNewlyCreatedConversation(true)
        await loadConversations()

        await simulateConversation(result.conversation_id)
      } else {
        console.error("Falha ao criar simulação:", result.error)
      }
    } catch (error) {
      console.error("Erro ao criar simulação:", error)
    }
  }

  const startSimulationWithProfile = async (profile: CustomerProfile) => {
    const simulationId = crypto.randomUUID()

    try {
      const result = await createConversation(simulationId, "simulation")
      setIsNewlyCreatedConversation(true)
      setSelectedConversation(result.conversation_id) // Usar conversation_id retornado pelo n8n
      setShowProfileSelection(false)

      const randomMessage = profile.sampleMessages[Math.floor(Math.random() * profile.sampleMessages.length)]

      setMessages([
        {
          id: crypto.randomUUID(),
          content: `Olá! 👋 Sou o ${agent?.name || "Assistente"}. Como posso ajudá-lo hoje?`,
          sender: "bot",
          timestamp: new Date(),
        },
        {
          id: crypto.randomUUID(),
          content: randomMessage,
          sender: "user",
          timestamp: new Date(Date.now() + 2000),
        },
      ])
    } catch (error) {
      console.error("Erro ao iniciar simulação:", error)
      alert("Erro ao criar simulação. Tente novamente.")
      return
    }
  }

  const openFeedbackDialog = (
    messageId: string,
    messageContent: string,
    messageSender: "user" | "bot",
    preselectedRating?: "positive" | "negative",
  ) => {
    setFeedbackDialog({
      open: true,
      messageId,
      messageContent,
      messageSender,
      preselectedRating,
    })
  }

  const handleFeedbackSubmit = async (feedbackData: {
    rating: "positive" | "negative"
    comment: string
    messageId: string
    originalMessage: string
  }) => {
    try {
      console.log("[v0] Submitting feedback:", feedbackData)

      const payload = {
        messageId: feedbackData.messageId,
        rating: feedbackData.rating,
        comment: feedbackData.comment,
        conversationId: selectedConversation,
        agentId: agent?.id || "",
        userId: user?.id || "",
        messageContent:
          feedbackData.originalMessage || messages.find((msg) => msg.id === feedbackData.messageId)?.content || "",
      }

      console.log("[v0] Feedback payload:", payload)

      // Validar se temos os dados essenciais
      if (!payload.messageContent || !payload.conversationId || !payload.agentId) {
        throw new Error("Missing required feedback data")
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      const response = await fetch("https://webhook.agenciaart.com.br/webhook/feedbackdeagenteflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log("[v0] Feedback response status:", response.status)
      console.log("[v0] Feedback response ok:", response.ok)

      if (response.ok) {
        console.log("[v0] Feedback sent successfully")

        setMessageFeedback((prev) => ({
          ...prev,
          [feedbackData.messageId]: feedbackData.rating,
        }))

        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.id === feedbackData.messageId ? { ...msg, feedbackSent: feedbackData.rating } : msg,
          ),
        )

        setFeedbackModal({ isOpen: false, messageId: "", originalMessage: "" })
      } else {
        const errorText = await response.text().catch(() => "Unable to read response")
        console.error("[v0] Failed to send feedback - Status:", response.status, "Text:", errorText)
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("[v0] Error sending feedback:", error.message)
        if (error.name === "AbortError") {
          console.error("[v0] Feedback request timed out")
        }
      } else {
        console.error("[v0] Unknown error sending feedback:", error)
      }

      alert("Erro ao enviar feedback. Tente novamente.")
    }
  }

  const handlePromptReviewSubmit = async (data: {
    conversationId: string
    feedbackStats: {
      positive: number
      negative: number
      total: number
    }
    reviewComment: string
    messages: Message[]
  }) => {
    try {
      const payload = {
        action: "promptReview",
        conversationId: data.conversationId,
        feedbackStats: data.feedbackStats,
        reviewComment: data.reviewComment,
        conversationHistory: data.messages.map((msg) => ({
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString(),
          type: msg.type || "text",
          feedbackSent: msg.feedbackSent,
        })),
        metadata: {
          agentId: agent?.id || null,
          agentName: agent?.name || "Unknown Agent",
          userId: user?.email || "unknown",
          totalMessages: data.messages.length,
        },
      }

      console.log("[v0] Sending prompt review:", payload)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const response = await fetch("https://webhook.agenciaart.com.br/webhook/promptreviewflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([payload]),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        console.log("[v0] Prompt review sent successfully")
        // Aqui você pode adicionar uma notificação de sucesso se desejar
      } else {
        const errorText = await response.text()
        console.error("[v0] Failed to send prompt review:", response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.error("[v0] Prompt review request timed out")
      } else {
        console.error("[v0] Error sending prompt review:", error)
      }
      throw error
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || !agent || !user || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue.trim(),
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)
    setIsTyping(true)

    setTimeout(() => inputRef.current?.focus(), 50)

    try {
      const payload = {
        action: "sendMessage",
        conversation_id: selectedConversation,
        chatInput: userMessage.content,
        metadata: {
          agentId: agent.id,
          agentName: agent.name,
          userId: user.email,
        },
      }

      console.log("[v0] Sending message to n8n:", payload)

      const response = await fetch("https://webhook.agenciaart.com.br/webhook/testedeagenteflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([payload]),
      })

      if (response.ok) {
        const data = await response.text()

        try {
          const jsonData = JSON.parse(data)

          // Check if it's an audio response
          if (jsonData.type === "audio" && jsonData.audioData) {
            setIsTyping(false)

            const botMessage: Message = {
              id: crypto.randomUUID(),
              content: jsonData.transcript || "🔊 Resposta em áudio",
              sender: "bot",
              timestamp: new Date(),
              type: "audio",
              audioData: jsonData.audioData,
              transcript: jsonData.transcript,
            }

            setMessages((prev) => [...prev, botMessage])
            return
          }

          // Handle text response
          const botContent = jsonData.output || data || "Desculpe, não consegui processar sua mensagem."

          const messageParts = botContent.split("\n\n").filter((part) => part.trim())
          setIsTyping(false)

          messageParts.forEach((part, index) => {
            setTimeout(() => {
              if (index > 0) {
                setIsTyping(true)
                setTimeout(() => {
                  setIsTyping(false)
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }, 500)
              } else {
                const botMessage: Message = {
                  id: crypto.randomUUID(),
                  content: part.trim(),
                  sender: "bot",
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, botMessage])
              }
            }, index * 1000)
          })
        } catch (e) {
          // Fallback for plain text responses
          console.log("[v0] Response is not JSON, using raw text")
          const botContent = data || "Desculpe, não consegui processar sua mensagem."

          const messageParts = botContent.split("\n\n").filter((part) => part.trim())
          setIsTyping(false)

          messageParts.forEach((part, index) => {
            setTimeout(() => {
              if (index > 0) {
                setIsTyping(true)
                setTimeout(() => {
                  setIsTyping(false)
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }, 500)
              } else {
                const botMessage: Message = {
                  id: crypto.randomUUID(),
                  content: part.trim(),
                  sender: "bot",
                  timestamp: new Date(),
                }
                setMessages((prev) => [...prev, botMessage])
              }
            }, index * 1000)
          })
        }
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setIsTyping(false)

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000, // OpenAI prefere 16kHz
          channelCount: 1, // Mono
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      const options = [
        { mimeType: "audio/mp4", audioBitsPerSecond: 128000 },
        { mimeType: "audio/mpeg", audioBitsPerSecond: 128000 },
        { mimeType: "audio/wav", audioBitsPerSecond: 128000 },
        { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 128000 },
      ]

      let recorder: MediaRecorder
      let selectedFormat = "audio/webm" // fallback

      for (const option of options) {
        if (MediaRecorder.isTypeSupported(option.mimeType)) {
          recorder = new MediaRecorder(stream, option)
          selectedFormat = option.mimeType
          console.log("[v0] Using supported format:", selectedFormat)
          break
        }
      }

      if (!recorder) {
        recorder = new MediaRecorder(stream) // Usar formato padrão
        selectedFormat = recorder.mimeType || "audio/webm"
      }

      audioChunksRef.current = []

      recorder.ondataavailable = (event) => {
        console.log("[v0] Audio data available, size:", event.data.size)
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
          console.log("[v0] Audio chunks count:", audioChunksRef.current.length)
        }
      }

      recorder.onstop = async () => {
        console.log("[v0] MediaRecorder stopped, processing audio chunks:", audioChunksRef.current.length)

        if (audioChunksRef.current.length > 0) {
          const mimeType = recorder.mimeType || "audio/webm"
          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
          console.log("[v0] Created audio blob with size:", audioBlob.size, "type:", mimeType)
          await sendAudioMessage(audioBlob)
        } else {
          console.error("[v0] No audio chunks available")
        }

        audioChunksRef.current = []
        stream.getTracks().forEach((track) => track.stop())
      }

      setMediaRecorder(recorder)
      recorder.start(1000) // Request data every 1000ms
      setIsRecording(true)

      console.log("[v0] Started audio recording with format:", recorder.mimeType)
    } catch (error) {
      console.error("[v0] Error starting recording:", error)
      alert("Erro ao acessar o microfone. Verifique as permissões.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop()
      setIsRecording(false)
      console.log("[v0] Stopped audio recording")
    }
  }

  const sendAudioMessage = async (audioBlob: Blob) => {
    if (!agent || !user || isLoading) return

    console.log("[v0] Audio blob size:", audioBlob.size, "type:", audioBlob.type)
    if (audioBlob.size === 0) {
      console.error("[v0] Audio blob is empty")
      return
    }

    setIsLoading(true)
    setIsTyping(true)

    setTimeout(() => inputRef.current?.focus(), 50)

    try {
      let mimeType = audioBlob.type

      if (mimeType.includes("webm")) {
        mimeType = "audio/ogg" // OpenAI aceita OGG melhor que WebM
      } else if (mimeType.includes("mp4")) {
        mimeType = "audio/mp4"
      } else if (mimeType.includes("mpeg")) {
        mimeType = "audio/mpeg"
      } else if (!mimeType || mimeType === "") {
        mimeType = "audio/ogg" // Fallback seguro
      }

      console.log("[v0] Original type:", audioBlob.type, "-> Using:", mimeType)

      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64Audio = reader.result as string
        const base64Data = base64Audio.includes(",") ? base64Audio.split(",")[1] : base64Audio

        console.log("[v0] Base64 audio length:", base64Data.length)
        console.log("[v0] Base64 audio preview:", base64Data.substring(0, 50))

        const userMessage: Message = {
          id: crypto.randomUUID(),
          content: "🎤 Mensagem de áudio",
          sender: "user",
          timestamp: new Date(),
          type: "audio",
          audioData: {
            base64: base64Data,
            mimeType: mimeType,
            size: audioBlob.size,
          },
        }

        setMessages((prev) => [...prev, userMessage])

        const estimatedDuration = Math.max(0.1, audioBlob.size / (16000 * 2 * 0.8)) // Estimativa mais conservadora

        const payload = {
          action: "sendAudio",
          conversation_id: selectedConversation,
          audioData: {
            base64: base64Data,
            mimeType: mimeType,
            duration: estimatedDuration,
            size: audioBlob.size,
          },
          metadata: {
            agentId: agent.id,
            agentName: agent.name,
            userId: user.email,
          },
        }

        console.log("[v0] Sending audio to n8n:", {
          ...payload,
          audioData: {
            ...payload.audioData,
            base64: `${payload.audioData.base64.substring(0, 50)}... (${payload.audioData.base64.length} chars)`,
          },
        })

        const response = await fetch("https://webhook.agenciaart.com.br/webhook/testedeagenteflow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([payload]),
        })

        if (response.ok) {
          const data = await response.text()

          try {
            const jsonData = JSON.parse(data)

            if (jsonData.type === "audio" && jsonData.audioData) {
              setIsTyping(false)

              const botMessage: Message = {
                id: crypto.randomUUID(),
                content: jsonData.transcript || "🔊 Resposta em áudio",
                sender: "bot",
                timestamp: new Date(),
                type: "audio",
                audioData: jsonData.audioData,
                transcript: jsonData.transcript,
              }

              setMessages((prev) => [...prev, botMessage])
              return
            }

            // Handle text response
            const botContent = jsonData.output || data || "Desculpe, não consegui processar seu áudio."

            const messageParts = botContent.split("\n\n").filter((part) => part.trim())
            setIsTyping(false)

            messageParts.forEach((part, index) => {
              setTimeout(() => {
                if (index > 0) {
                  setIsTyping(true)
                  setTimeout(() => {
                    setIsTyping(false)
                    const botMessage: Message = {
                      id: crypto.randomUUID(),
                      content: part.trim(),
                      sender: "bot",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, botMessage])
                  }, 500)
                } else {
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }
              }, index * 1000)
            })
          } catch (e) {
            console.log("[v0] Response is not JSON, using raw text")
            const botContent = data || "Desculpe, não consegui processar seu áudio."

            const messageParts = botContent.split("\n\n").filter((part) => part.trim())
            setIsTyping(false)

            messageParts.forEach((part, index) => {
              setTimeout(() => {
                if (index > 0) {
                  setIsTyping(true)
                  setTimeout(() => {
                    setIsTyping(false)
                    const botMessage: Message = {
                      id: crypto.randomUUID(),
                      content: part.trim(),
                      sender: "bot",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, botMessage])
                  }, 500)
                } else {
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }
              }, index * 1000)
            })
          }
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      }

      reader.readAsDataURL(audioBlob)
    } catch (error) {
      console.error("[v0] Error sending audio:", error)
      setIsTyping(false)

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Desculpe, ocorreu um erro ao processar seu áudio. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const playAudio = (message: Message) => {
    if (!message.audioData) return

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    if (playingAudio === message.id) {
      setPlayingAudio(null)
      return
    }

    try {
      const audioBlob = new Blob([Uint8Array.from(atob(message.audioData.base64), (c) => c.charCodeAt(0))], {
        type: message.audioData.mimeType,
      })

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onplay = () => setPlayingAudio(message.id)
      audio.onended = () => {
        setPlayingAudio(null)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setPlayingAudio(null)
        URL.revokeObjectURL(audioUrl)
        console.error("[v0] Error playing audio")
      }

      audioRef.current = audio
      audio.play()
    } catch (error) {
      console.error("[v0] Error creating audio:", error)
      setPlayingAudio(null)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = Math.floor(now.getTime() - date.getTime())
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffMins < 1) return "agora"
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    return date.toLocaleDateString()
  }

  const openFeedbackModal = (messageId: string, messageContent: string) => {
    setFeedbackModal({
      isOpen: true,
      messageId,
      originalMessage: messageContent,
    })
    setFeedbackText("")
  }

  const closeFeedbackModal = () => {
    setFeedbackModal({
      isOpen: false,
      messageId: "",
      originalMessage: "",
    })
    setFeedbackText("")
  }

  const submitFeedback = async () => {
    if (!feedbackText.trim() || !agent || !user) return

    try {
      const reportedMessage = messages.find((msg) => msg.id === feedbackModal.messageId)
      if (!reportedMessage) return

      const reportedMessageData = {
        type: reportedMessage.type || "text",
        content: reportedMessage.content,
        ...(reportedMessage.type === "audio" &&
          reportedMessage.audioData && {
            audioData: {
              base64: reportedMessage.audioData.base64,
              mimeType: reportedMessage.audioData.mimeType,
              size: reportedMessage.audioData.size,
            },
          }),
      }

      const payload = {
        action: "reportMessage",
        sessionId: sessionId,
        reportedMessage: reportedMessageData,
        conversationHistory: messages.map((msg) => ({
          content: msg.content,
          sender: msg.sender,
          timestamp: msg.timestamp.toISOString(),
          type: msg.type || "text",
          ...(msg.type === "audio" &&
            msg.audioData && {
              audioData: {
                base64: msg.audioData.base64,
                mimeType: msg.audioData.mimeType,
                size: msg.audioData.size,
              },
            }),
        })),
        feedback: feedbackText.trim(),
        messageSource: reportedMessage.sender,
        metadata: {
          agentId: agent.id,
          agentName: agent.name,
          userId: user.email,
          messageId: reportedMessage.id,
        },
      }

      console.log("[v0] Sending feedback to n8n:", payload)

      const response = await fetch("https://webhook.agenciaart.com.br/webhook/feedbackdeagenteflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([payload]),
      })

      if (response.ok) {
        console.log("[v0] Feedback sent successfully")
        setMessages((prev) => prev.map((msg) => (msg.id === feedbackModal.messageId ? { ...msg, flagged: true } : msg)))
        closeFeedbackModal()
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error sending feedback:", error)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]
      const maxSize = 10 * 1024 * 1024 // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert("Tipo de arquivo não suportado. Use imagens (JPEG, PNG, GIF, WebP) ou PDFs.")
        return
      }

      if (file.size > maxSize) {
        alert("Arquivo muito grande. O tamanho máximo é 10MB.")
        return
      }

      setSelectedFile(file)
    }
  }

  const sendFileMessage = async (file: File) => {
    if (!agent || !user || isLoading) return

    setIsLoading(true)
    setIsTyping(true)

    setTimeout(() => inputRef.current?.focus(), 50)

    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64File = reader.result as string
        const base64Data = base64File.includes(",") ? base64File.split(",")[1] : base64File

        const userMessage: Message = {
          id: crypto.randomUUID(),
          content: file.type.startsWith("image/") ? `📷 ${file.name}` : `📄 ${file.name}`,
          sender: "user",
          timestamp: new Date(),
          type: "file",
          fileData: {
            base64: base64Data,
            mimeType: file.type,
            size: file.size,
            fileName: file.name,
          },
        }

        setMessages((prev) => [...prev, userMessage])
        setSelectedFile(null)

        const payload = {
          action: "sendFile",
          conversation_id: selectedConversation,
          fileData: {
            base64: base64Data,
            mimeType: file.type,
            size: file.size,
            fileName: file.name,
          },
          metadata: {
            agentId: agent.id,
            agentName: agent?.name || "",
            userId: user.email,
          },
        }

        console.log("[v0] Sending file to n8n:", {
          ...payload,
          fileData: {
            ...payload.fileData,
            base64: `${payload.fileData.base64.substring(0, 50)}... (${payload.fileData.base64.length} chars)`,
          },
        })

        const response = await fetch("https://webhook.agenciaart.com.br/webhook/testedeagenteflow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify([payload]),
        })

        if (response.ok) {
          const data = await response.text()

          try {
            const jsonData = JSON.parse(data)
            const botContent = jsonData.output || data || "Desculpe, não consegui processar seu arquivo."

            const messageParts = botContent.split("\n\n").filter((part) => part.trim())
            setIsTyping(false)

            messageParts.forEach((part, index) => {
              setTimeout(() => {
                if (index > 0) {
                  setIsTyping(true)
                  setTimeout(() => {
                    setIsTyping(false)
                    const botMessage: Message = {
                      id: crypto.randomUUID(),
                      content: part.trim(),
                      sender: "bot",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, botMessage])
                  }, 500)
                } else {
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }
              }, index * 1000)
            })
          } catch (e) {
            console.log("[v0] Response is not JSON, using raw text")
            const botContent = data || "Desculpe, não consegui processar seu arquivo."

            const messageParts = botContent.split("\n\n").filter((part) => part.trim())
            setIsTyping(false)

            messageParts.forEach((part, index) => {
              setTimeout(() => {
                if (index > 0) {
                  setIsTyping(true)
                  setTimeout(() => {
                    setIsTyping(false)
                    const botMessage: Message = {
                      id: crypto.randomUUID(),
                      content: part.trim(),
                      sender: "bot",
                      timestamp: new Date(),
                    }
                    setMessages((prev) => [...prev, botMessage])
                  }, 500)
                } else {
                  const botMessage: Message = {
                    id: crypto.randomUUID(),
                    content: part.trim(),
                    sender: "bot",
                    timestamp: new Date(),
                  }
                  setMessages((prev) => [...prev, botMessage])
                }
              }, index * 1000)
            })
          }
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      }

      reader.readAsDataURL(file)
    } catch (error) {
      console.error("[v0] Error sending file:", error)
      setIsTyping(false)

      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Desculpe, ocorreu um erro ao processar seu arquivo. Tente novamente.",
        sender: "bot",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-none w-[95vw] h-[90vh] p-0 flex flex-col overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 bg-[#12444B] text-white rounded-t-xl">
            <DialogTitle className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <div className="text-xl font-semibold">{agent?.name || "Assistente"} - Histórico de Conversas</div>
                <div className="text-sm text-white/80 font-normal">Teste e monitore conversas reais e simuladas</div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-80 border-r bg-gray-50 flex flex-col">
              <div className="px-4 pt-4 pb-4 border-b bg-white">
                <div className="flex gap-2 mb-3">
                  <Button
                    onClick={startNewConversation}
                    size="sm"
                    className="flex-1 bg-[#12444B] hover:bg-[#12444B]/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Conversa
                  </Button>
                  {/* <Button
                    onClick={startSimulation}
                    size="sm"
                    className="flex-1 bg-[#E8F54E] hover:bg-[#E8F54E]/90 text-black border-0"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Simular
                  </Button> */}
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar conversas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`p-4 border-b cursor-pointer hover:bg-white transition-colors ${
                      selectedConversation === conversation.id ? "bg-white border-l-4 border-l-[#12444B]" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#12444B] flex items-center justify-center flex-shrink-0">
                        {conversation.isSimulation ? (
                          <Zap className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-sm text-gray-900 truncate">{conversation.contact}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">{formatTime(conversation.created_at)}</span>
                            {conversation.status === "active" && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 truncate mb-2">
                          {formatMessagePreview(conversation.lastMessage)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/*conversation.isSimulation ? (
                              <Badge variant="secondary" className="text-xs">
                                <Zap className="w-3 h-3 mr-1" />
                                Simulação
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Real
                              </Badge>
                            )*/}
                          </div>

                          {/*<span className="text-xs text-gray-500 flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {conversation.messageCount}
                          </span>*/}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b bg-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#12444B] flex items-center justify-center">
                        {selectedConversation === "new" ? (
                          <Bot className="w-4 h-4 text-white" />
                        ) : filteredConversations.find((c) => c.id === selectedConversation)?.isSimulation ? (
                          <Zap className="w-4 h-4 text-white" />
                        ) : (
                          <User className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">
                          {selectedConversation === "new"
                            ? "Nova Conversa"
                            : filteredConversations.find((c) => c.id === selectedConversation)?.contact}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {selectedConversation === "new"
                            ? "Inicie uma nova conversa de teste"
                            : filteredConversations.find((c) => c.id === selectedConversation)?.isSimulation
                              ? "Conversa simulada por IA"
                              : "via WhatsApp"}
                        </p>
                      </div>
                      {selectedConversation && selectedConversation !== "new" && messages.length > 0 && (
                        <Button
                          onClick={() => setPromptReviewDialog({ open: true })}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <TrendingUp className="w-4 h-4" />
                          Revisar Prompt
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {message.sender === "bot" && (
                          <div className="w-8 h-8 rounded-full bg-[#12444B] flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                          </div>
                        )}

                        <div
                          className={`group relative p-4 rounded-2xl ${
                            message.sender === "user"
                              ? "bg-[#12444B] text-white rounded-br-md shadow-sm max-w-[70%]"
                              : "bg-white text-gray-800 rounded-bl-md shadow-sm border max-w-[70%]"
                          }`}
                        >
                          {(() => {
                            if (message.type === "file" && message.fileData?.mimeType.startsWith("image/")) {
                              const imageUrl = `data:${message.fileData.mimeType};base64,${message.fileData.base64}`
                              return (
                                <div>
                                  <img
                                    src={imageUrl || "/placeholder.svg"}
                                    alt={message.fileData.fileName || "Imagem enviada"}
                                    className="max-w-full h-auto rounded-lg mb-2"
                                    style={{ maxHeight: "300px" }}
                                  />
                                </div>
                              )
                            }

                            if (message.type === "file" && message.fileData?.mimeType === "application/pdf") {
                              const pdfUrl = `data:${message.fileData.mimeType};base64,${message.fileData.base64}`
                              return (
                                <div>
                                  <div className="bg-gray-50 rounded-lg p-3 border mb-2">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-8 h-8 text-red-500" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-700">{message.fileData.fileName}</div>
                                        <div className="text-sm text-gray-500">
                                          Documento PDF • {(message.fileData.size / 1024 / 1024).toFixed(2)} MB
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(pdfUrl, "_blank")}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            }

                            if (message.type === "audio" && message.audioData) {
                              const audioUrl = `data:${message.audioData.mimeType};base64,${message.audioData.base64}`
                              return (
                                <div>
                                  <CustomAudioPlayer
                                    src={audioUrl}
                                    variant={message.sender === "user" ? "user" : "bot"}
                                  />
                                </div>
                              )
                            }

                            const mediaInfo = isMediaUrl(message.content)

                            if (mediaInfo.isImage) {
                              return (
                                <div>
                                  <img
                                    src={mediaInfo.url || "/placeholder.svg"}
                                    alt="Imagem enviada"
                                    className="max-w-full h-auto rounded-lg mb-2"
                                    style={{ maxHeight: "300px" }}
                                    onError={(e) => {
                                      // Fallback para mostrar o URL se a imagem não carregar
                                      e.currentTarget.style.display = "none"
                                      const fallback = e.currentTarget.nextElementSibling as HTMLElement
                                      if (fallback) fallback.style.display = "block"
                                    }}
                                  />
                                  <div className="whitespace-pre-wrap" style={{ display: "none" }}>
                                    {message.content}
                                  </div>
                                </div>
                              )
                            }

                            if (mediaInfo.isAudio) {
                              return (
                                <div>
                                  <CustomAudioPlayer
                                    src={mediaInfo.url}
                                    variant={message.sender === "user" ? "user" : "bot"}
                                  />
                                </div>
                              )
                            }

                            if (mediaInfo.isVideo) {
                              return (
                                <div>
                                  <video
                                    controls
                                    className="max-w-full h-auto rounded-lg mb-2"
                                    style={{ maxHeight: "300px" }}
                                    src={mediaInfo.url}
                                    preload="metadata"
                                  >
                                    Seu navegador não suporta o elemento de vídeo.
                                  </video>
                                </div>
                              )
                            }

                            if (mediaInfo.isPdf) {
                              return (
                                <div>
                                  <div className="bg-gray-50 rounded-lg p-3 border mb-2">
                                    <div className="flex items-center gap-3">
                                      <FileText className="w-8 h-8 text-red-500" />
                                      <div className="flex-1">
                                        <div className="font-medium text-gray-700">Documento PDF</div>
                                        <div className="text-sm text-gray-500">Clique para visualizar</div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => window.open(mediaInfo.url, "_blank")}
                                        className="text-gray-500 hover:text-gray-700"
                                      >
                                        <ExternalLink className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )
                            }

                            // Fallback para texto normal
                            return <div className="whitespace-pre-wrap">{message.content}</div>
                          })()}

                          <div className={`text-xs ${message.sender === "user" ? "text-white/70" : "text-gray-500"}`}>
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>

                          {message.sender === "bot" && (
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                onClick={() =>
                                  openFeedbackDialog(message.id, message.content, message.sender, "negative")
                                }
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 hover:bg-red-50 ${
                                  message.feedbackSent === "negative"
                                    ? "text-red-500"
                                    : "text-gray-400 hover:text-red-500"
                                }`}
                                title="Feedback negativo"
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() =>
                                  openFeedbackDialog(message.id, message.content, message.sender, "positive")
                                }
                                variant="ghost"
                                size="sm"
                                className={`h-6 w-6 p-0 hover:bg-green-50 ${
                                  message.feedbackSent === "positive"
                                    ? "text-green-500"
                                    : "text-gray-400 hover:text-green-500"
                                }`}
                                title="Feedback positivo"
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>

                        {message.sender === "user" && (
                          <div className="w-8 h-8 rounded-full bg-[#12444B]/10 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-[#12444B]" />
                          </div>
                        )}
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-full bg-[#12444B] flex items-center justify-center flex-shrink-0">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-bl-md shadow-sm border">
                          <div className="flex gap-1 items-center">
                            <span className="text-gray-500 text-sm mr-2">Digitando</span>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-6 border-t bg-[#12444B] text-white rounded-b-xl">
                    {selectedFile && (
                      <div className="mb-4 p-3 bg-white/10 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {selectedFile.type.startsWith("image/") ? (
                              <FileImage className="w-5 h-5 text-white" />
                            ) : (
                              <FileText className="w-5 h-5 text-white" />
                            )}
                            <div>
                              <div className="text-sm font-medium text-white">{selectedFile.name}</div>
                              <div className="text-xs text-white/70">
                                {selectedFile.type} • {(selectedFile.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => sendFileMessage(selectedFile)}
                              disabled={isLoading}
                              size="sm"
                              className="bg-white/20 hover:bg-white/30 text-white"
                            >
                              Enviar
                            </Button>
                            <Button
                              onClick={() => setSelectedFile(null)}
                              size="sm"
                              variant="ghost"
                              className="text-white/70 hover:text-white hover:bg-white/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 items-center text-white rounded-lg">
                      <div className="flex-1">
                        <input
                          ref={inputRef}
                          type="text"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Digite sua pergunta..."
                          disabled={isLoading || isRecording}
                          className="w-full px-4 py-2.5 h-10 bg-white text-gray-700 placeholder-gray-400 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#12444B] focus:border-transparent resize-none disabled:opacity-50"
                        />
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || isRecording}
                        className="h-10 w-10 bg-white hover:bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 flex-shrink-0 shadow-md border border-gray-300"
                      >
                        <Paperclip className="h-4 w-4 text-gray-700" />
                      </Button>

                      <Button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={isLoading}
                        className={`h-10 w-10 ${
                          isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-gray-100 hover:bg-gray-200"
                        } text-gray-700 rounded-lg disabled:opacity-50 flex-shrink-0`}
                      >
                        {isRecording ? (
                          <MicOff className="h-4 w-4 text-white" />
                        ) : (
                          <Mic className="h-4 w-4 text-gray-700" />
                        )}
                      </Button>
                      <Button
                        onClick={sendMessage}
                        disabled={!inputValue.trim() || isLoading || isRecording}
                        className="bg-[#12444B] hover:bg-[#12444B]/90 h-10"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma conversa</h3>
                    <p className="text-gray-500 mb-6">
                      Escolha uma conversa da lista ou inicie uma nova para começar a testar
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button onClick={startNewConversation} className="bg-[#12444B] hover:bg-[#12444B]/90">
                        <Plus className="w-4 h-4 mr-2" />
                        Nova Conversa
                      </Button>
                      {/* <Button
                        onClick={startSimulation}
                        className="bg-[#E8F54E] hover:bg-[#E8F54E]/90 text-black border-0"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Iniciar Simulação
                      </Button> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileSelection} onOpenChange={setShowProfileSelection}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#12444B]" />
              Selecionar Perfil de Cliente para Simulação
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {customerProfiles.map((profile) => (
              <div
                key={profile.id}
                onClick={() => startSimulationWithProfile(profile)}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 hover:border-[#12444B] transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#12444B]/10 flex items-center justify-center text-[#12444B] group-hover:bg-[#12444B] group-hover:text-white transition-all">
                    {profile.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{profile.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{profile.description}</p>

                    <div className="mb-3">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Personalidade:</span>
                      <p className="text-sm text-gray-700 mt-1">{profile.personality}</p>
                    </div>

                    <div>
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Exemplos de mensagens:
                      </span>
                      <div className="mt-2 space-y-1">
                        {profile.sampleMessages.slice(0, 2).map((message, index) => (
                          <div key={index} className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                            "{message}"
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowProfileSelection(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <FeedbackDialog
        open={feedbackDialog.open}
        onOpenChange={(open) => setFeedbackDialog((prev) => ({ ...prev, open }))}
        messageId={feedbackDialog.messageId}
        messageContent={feedbackDialog.messageContent}
        messageSender={feedbackDialog.messageSender}
        preselectedRating={feedbackDialog.preselectedRating}
        onSubmit={handleFeedbackSubmit}
      />

      <PromptReviewDialog
        open={promptReviewDialog.open}
        onOpenChange={(open) => setPromptReviewDialog({ open })}
        conversationId={selectedConversation || ""}
        messages={messages}
        agentName={agent?.name || ""}
        onSubmit={handlePromptReviewSubmit}
      />
    </>
  )
}
