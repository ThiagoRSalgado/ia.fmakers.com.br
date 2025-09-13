import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "register_user",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error || "Erro ao criar conta" }, { status: 400 })
    }

    const data = await response.json()
    console.log("[v0] n8n register response data:", data)

    let user
    if (data.user && Array.isArray(data.user) && data.user.length > 0) {
      user = data.user[0]
    } else if (data.user) {
      user = data.user
    } else {
      console.log("[v0] No user data in response")
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 400 })
    }

    console.log("[v0] Setting session cookie for user:", user.id)
    const cookieStore = await cookies()
    cookieStore.set("session", String(user.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log("[v0] Register successful for user:", user.name)
    return NextResponse.json({ user })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
