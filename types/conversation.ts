export interface Conversation {
  id: string
  title: string
  lastMessage: string
  created_at: Date
  messageCount: number
  isSimulation: boolean
  simulationType: "real" | "customer"
  customerName?: string
  status: "active" | "pending" | "completed"
  agentId: string
  userId: string
}

export interface Message {
  id: string
  content: string
  sender: "user" | "bot"
  created_at: Date
  type?: "text" | "audio" | "file"
  audioData?: string
  transcript?: string
  fileData?: {
    name: string
    type: string
    size: number
    data: string
  }
  feedbackSent?: "positive" | "negative"
}

export interface FeedbackModal {
  isOpen: boolean
  messageId: string
  originalMessage: string
}
