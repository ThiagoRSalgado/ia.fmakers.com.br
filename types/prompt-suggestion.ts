export interface PromptSuggestion {
  id: string
  agent_id: string
  user_id: string
  status: "pending" | "approved" | "rejected" | "testing"
  original_prompt: string
  suggested_prompt: string
  alterations: string[]
  created_at: string
  updated_at: string
  agent_name?: string
}
