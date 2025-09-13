"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Bot, User, Flag, Mic, MicOff } from "lucide-react"
import type { Agent } from "@/types/agent"
import type { User as UserType } from "@/types/user"
import type { PromptSuggestion } from "@/types/prompt-suggestion"

interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  timestamp: Date
  type?: "text" | "audio"
  audioData?: {
    base64: string
    mimeType: string
    size: number
  }
  transcript?: string
}

interface TestAIDialogProps {
  agent: Agent | null
  user: UserType | null
  open: boolean
  onOpenChange: (open: boolean) => void
  testingSuggestion?: PromptSuggestion // Added testingSuggestion prop
}

export function TestAIDialog({ agent, user, open, onOpenChange, testingSuggestion }: TestAIDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState("")
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<Message | null>(null)
  const [feedbackText, setFeedbackText] = useState("")
  const [isSendingFeedback, setIsSendingFeedback] = useState(false)
  const [reportedMessages, setReportedMessages] = useState<Set<string>>(new Set())
  const [isRecording, setIsRecording] = useState(false)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (open && agent) {
      const newSessionId = crypto.randomUUID()
      setSessionId(newSessionId)

      setMessages([
        {
          id: crypto.randomUUID(),
          content: `Olá! 👋 Sou o ${agent.name}. Como posso ajudá-lo hoje?`,
          sender: "bot",
          timestamp: new Date(),
        },
      ])
    } else {
      setMessages([])
      setInputValue("")
      setSessionId("")
    }
  }, [open, agent])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

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
      const payload = testingSuggestion
        ? {
            action: "testSuggestedPrompt",
            sessionId: sessionId,
            chatInput: userMessage.content,
            suggestionId: testingSuggestion.id,
            suggestedPrompt: testingSuggestion.suggested_prompt,
            metadata: {
              agentId: agent.id,
              agentName: agent.name,
              userId: user.email,
              originalAgentId: testingSuggestion.agent_id,
            },
          }
        : {
            action: "sendMessage",
            sessionId: sessionId,
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

          // Handle text response (existing logic)
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

        const payload = testingSuggestion
          ? {
              action: "testSuggestedPromptAudio",
              sessionId: sessionId,
              audioData: {
                base64: base64Data,
                mimeType: mimeType,
                duration: estimatedDuration,
                size: audioBlob.size,
              },
              suggestionId: testingSuggestion.id,
              suggestedPrompt: testingSuggestion.suggested_prompt,
              metadata: {
                agentId: agent.id,
                agentName: agent.name,
                userId: user.email,
                originalAgentId: testingSuggestion.agent_id,
              },
            }
          : {
              action: "sendAudio",
              sessionId: sessionId,
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

            // Handle text response (existing logic)
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleFeedback = (message: Message) => {
    setFeedbackMessage(message)
    setFeedbackOpen(true)
    setFeedbackText("")
  }

  const sendFeedback = async () => {
    if (!feedbackText.trim() || !feedbackMessage || !agent || !user) return

    setIsSendingFeedback(true)

    try {
      const reportedMessageData = {
        type: feedbackMessage.type || "text",
        content: feedbackMessage.content,
        ...(feedbackMessage.type === "audio" &&
          feedbackMessage.audioData && {
            audioData: {
              base64: feedbackMessage.audioData.base64,
              mimeType: feedbackMessage.audioData.mimeType,
              size: feedbackMessage.audioData.size,
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
        messageSource: feedbackMessage.sender, // "user" or "bot"
        metadata: {
          agentId: agent.id,
          agentName: agent.name,
          userId: user.email,
          messageId: feedbackMessage.id,
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
        setReportedMessages((prev) => new Set([...prev, feedbackMessage.id]))
        setFeedbackOpen(false)
        setFeedbackMessage(null)
        setFeedbackText("")
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.error("[v0] Error sending feedback:", error)
    } finally {
      setIsSendingFeedback(false)
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!max-w-none w-[95vw] h-[90vh] p-0 flex flex-col [&>button]:text-white [&>button]:hover:text-gray-200">
          <DialogHeader className="p-6 pb-4 bg-flow-dark-teal text-white rounded-t-lg bg-[rgba(9,67,73,1)]">
            <DialogTitle className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <div className="text-xl font-semibold">
                  {agent?.name} - Flow Makers
                  {testingSuggestion && (
                    <span className="ml-2 text-sm bg-flow-lime text-flow-dark-teal px-2 py-1 rounded">
                      Testando Prompt Sugerido
                    </span>
                  )}
                </div>
                <div className="text-sm text-flow-lime/80 font-normal">
                  {testingSuggestion
                    ? "Testando versão melhorada baseada em feedback dos clientes"
                    : "Converse com nossa IA especializada. Estamos aqui para ajudar 24/7."}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.sender === "bot" && (
                  <div className="w-8 h-8 rounded-full bg-flow-dark-teal flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`max-w-[70%] p-4 rounded-2xl ${
                    message.sender === "user"
                      ? "bg-flow-dark-teal text-white rounded-br-md shadow-sm border border-flow-dark-teal/20"
                      : "bg-white text-gray-800 rounded-bl-md shadow-sm border"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-slate-950">{message.content}</div>

                  {message.type === "audio" && message.audioData && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="bg-gray-50 rounded-lg p-3 border">
                        <audio
                          controls
                          className="w-full mb-2"
                          onLoadStart={() => console.log("[v0] Audio loading started")}
                          onError={(e) => console.error("[v0] Audio error:", e)}
                          onCanPlay={() => console.log("[v0] Audio can play")}
                          preload="metadata"
                          ref={(audioElement) => {
                            if (audioElement && message.audioData) {
                              try {
                                // Convert base64 to blob and create object URL
                                const binaryString = atob(message.audioData.base64)
                                const bytes = new Uint8Array(binaryString.length)
                                for (let i = 0; i < binaryString.length; i++) {
                                  bytes[i] = binaryString.charCodeAt(i)
                                }
                                const audioBlob = new Blob([bytes], { type: message.audioData.mimeType })
                                const audioUrl = URL.createObjectURL(audioBlob)
                                audioElement.src = audioUrl

                                // Cleanup URL when component unmounts
                                audioElement.addEventListener("loadstart", () => {
                                  console.log(
                                    "[v0] Audio blob created:",
                                    audioBlob.size,
                                    "bytes, type:",
                                    audioBlob.type,
                                  )
                                })
                              } catch (error) {
                                console.error("[v0] Error creating audio blob:", error)
                              }
                            }
                          }}
                        >
                          Seu navegador não suporta o elemento de áudio.
                        </audio>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                          <span>{message.sender === "user" ? "🎤 Sua mensagem de áudio" : "🔊 Resposta em áudio"}</span>
                          <span>{(message.audioData.size / 1024).toFixed(1)} KB</span>
                        </div>

                        {message.transcript && (
                          <div className="text-sm text-gray-700 bg-white p-2 rounded border-l-4 border-flow-dark-teal">
                            <div className="font-medium text-gray-600 mb-1">Transcrição:</div>
                            {message.transcript}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <div
                      className={`text-xs text-gray-700 ${message.sender === "user" ? "text-flow-lime/70" : "text-gray-500"}`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                    <Button
                      onClick={() => handleFeedback(message)}
                      variant="ghost"
                      size="sm"
                      className={`h-6 w-6 p-0 hover:bg-red-50 ${
                        reportedMessages.has(message.id) ? "text-red-500" : "text-gray-400 hover:text-red-500"
                      }`}
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {message.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-flow-lime flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-flow-dark-teal" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-flow-dark-teal flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border">
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

          <div className="p-6 border-t bg-[rgba(9,67,73,1)] text-white rounded-md">
            <div className="flex gap-3 items-end text-white rounded-lg">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta..."
                  disabled={isLoading || isRecording}
                  className="w-full p-4 bg-white text-gray-700 placeholder-gray-400 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-flow-dark-teal focus:border-transparent resize-none disabled:opacity-50"
                />
              </div>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                className={`h-14 w-14 ${
                  isRecording ? "bg-red-500 hover:bg-red-600 animate-pulse" : "bg-white hover:bg-gray-100"
                } text-gray-700 rounded-lg disabled:opacity-50 flex-shrink-0 shadow-md border border-gray-300`}
              >
                {isRecording ? <MicOff className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-gray-700" />}
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading || isRecording}
                className="h-14 w-14 bg-white hover:bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 flex-shrink-0 shadow-md border border-gray-300"
              >
                <Send className="h-7 w-7 rounded-2xl text-gray-700" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-red-500" />
              Reportar Resposta Incorreta
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Mensagem reportada:</label>
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border">
                {feedbackMessage?.type === "audio" ? (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span>🎤 Mensagem de áudio</span>
                      <span className="text-xs text-gray-500">
                        ({(feedbackMessage.audioData?.size || 0) / 1024} KB)
                      </span>
                    </div>
                    {feedbackMessage.transcript && (
                      <div className="text-xs text-gray-500 italic">Transcrição: {feedbackMessage.transcript}</div>
                    )}
                  </div>
                ) : (
                  feedbackMessage?.content
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                O que houve de errado? Como{" "}
                {feedbackMessage?.sender === "user" ? "você deveria ter falado" : "a IA deveria ter respondido"}?
              </label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={
                  feedbackMessage?.sender === "user"
                    ? "Descreva o que você queria dizer ou como deveria ter falado..."
                    : "Descreva o problema e como a resposta deveria ser..."
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setFeedbackOpen(false)} disabled={isSendingFeedback}>
                Cancelar
              </Button>
              <Button
                onClick={sendFeedback}
                disabled={!feedbackText.trim() || isSendingFeedback}
                className="bg-red-500 hover:bg-red-600"
              >
                {isSendingFeedback ? "Enviando..." : "Enviar Feedback"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
