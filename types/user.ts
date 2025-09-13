export interface User {
  id: string
  name: string
  company_name: string
  document: string // CNPJ ou CPF
  email: string
  role: "admin" | "user"
  about_company?: string
  openai_token?: string
  elevenlabs_token?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  company_name: string
  document: string
  email: string
  password: string
  about_company?: string
  openai_token?: string
  elevenlabs_token?: string
}
