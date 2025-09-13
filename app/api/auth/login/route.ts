import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    console.log("[v0] Login attempt for email:", email)

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "login_user",
      },
      body: JSON.stringify({ email, password }),
    })

    console.log("[v0] n8n login response status:", response.status)

    if (!response.ok) {
      console.log("[v0] n8n returned error for login")
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 })
    }

    const data = await response.json()

    console.log("[v0] Full n8n response data:", JSON.stringify(data, null, 2))
    console.log("[v0] data.user exists:", !!data.user)
    const user = Array.isArray(data.user) ? data.user[0] : data.user
    console.log("[v0] user.id:", user?.id)
    console.log("[v0] user.name:", user?.name)

    if (!user) {
      console.log("[v0] No user data returned from n8n")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 401 })
    }

    console.log("[v0] Setting session cookie for user:", user.id)
    const cookieStore = await cookies()
    cookieStore.set("session", user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[v0] Login successful for user:", user.name)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
