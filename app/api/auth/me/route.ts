import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    console.log("[v0] Checking session cookie:", sessionCookie?.value)

    if (!sessionCookie) {
      console.log("[v0] No session cookie found")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    console.log("[v0] Making request to n8n for user profile")
    const response = await fetch(`${WEBHOOK_URL}?user_id=${sessionCookie.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_user_profile",
      },
    })

    console.log("[v0] n8n response status:", response.status)

    if (!response.ok) {
      console.log("[v0] n8n returned error for user profile")
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    const data = await response.json()
    console.log("[v0] Full n8n response data:", JSON.stringify(data, null, 2))

    const user = data.id ? data : Array.isArray(data.user) ? data.user[0] : data.user
    console.log("[v0] User profile loaded successfully:", user?.name)

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
