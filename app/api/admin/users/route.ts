import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log("[v0] Admin users - checking user permissions for user_id:", sessionCookie.value)

    const userResponse = await fetch(`${WEBHOOK_URL}?user_id=${sessionCookie.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_user_profile",
      },
    })

    if (!userResponse.ok) {
      console.log("[v0] Admin users - user verification failed with status:", userResponse.status)
      return NextResponse.json({ error: "Erro ao verificar usuário" }, { status: 500 })
    }

    const userData = await userResponse.json()
    const user = userData.user || userData

    console.log("[v0] Admin users - user role:", user.role)

    if (user.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    console.log("[v0] Admin users - making request for all users")

    const response = await fetch(WEBHOOK_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_all_users",
      },
    })

    if (!response.ok) {
      console.log("[v0] Admin users - get_all_users failed with status:", response.status)
      return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 })
    }

    const data = await response.json()
    console.log("[v0] Admin users - successfully loaded", data.users?.length || 0, "users")
    return NextResponse.json({ users: data.users || [] })
  } catch (error) {
    console.error("Erro ao buscar usuários:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
