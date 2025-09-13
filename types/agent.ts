export interface Agent {
  id: string
  name: string
  description?: string
  prompt: string
  debounce_time: number
  max_followups: number
  human_intervention: boolean
  is_active: boolean
  user_id: string // Added user_id to associate agents with their creators
  created_at: string
  updated_at: string
}

export interface AgentHistory {
  id: string
  agent_id: string
  event_type: "created" | "updated" | "activated" | "deactivated" | "prompt_changed"
  event_data: Record<string, any>
  created_at: string
}
