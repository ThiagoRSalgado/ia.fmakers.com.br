import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Admin create user - starting request")

    const sessionCookie = cookies().get("session")
    if (!sessionCookie) {
      console.log("[v0] Admin create user - no session cookie")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Verify admin role
    const adminCheckResponse = await fetch(`${WEBHOOK_URL}?user_id=${sessionCookie.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_user_profile",
      },
    })

    if (!adminCheckResponse.ok) {
      console.log("[v0] Admin create user - failed to verify admin")
      return NextResponse.json({ error: "Erro ao verificar permissões" }, { status: 500 })
    }

    const adminData = await adminCheckResponse.json()
    console.log("[v0] Admin create user - admin role:", adminData.role)

    if (adminData.role !== "admin") {
      console.log("[v0] Admin create user - user is not admin")
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    console.log("[v0] Admin create user - creating user:", body.email)

    const createResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "register_user",
      },
      body: JSON.stringify(body),
    })

    if (!createResponse.ok) {
      console.log("[v0] Admin create user - n8n error:", createResponse.status)
      return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
    }

    const data = await createResponse.json()
    console.log("[v0] Admin create user - user created successfully:", data.user?.[0]?.name || data.user?.name)

    return NextResponse.json({
      user: Array.isArray(data.user) ? data.user[0] : data.user,
    })
  } catch (error) {
    console.error("[v0] Admin create user - error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
