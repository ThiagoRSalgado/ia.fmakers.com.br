import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()

    const { role, email, ...allowedFields } = body

    const updateData = {
      id: sessionCookie.value,
      ...allowedFields,
    }

    console.log("[v0] Updating user profile:", updateData.name)

    const response = await fetch(WEBHOOK_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        event: "update_user_profile",
      },
      body: JSON.stringify(updateData),
    })

    console.log("[v0] n8n profile update response status:", response.status)

    if (!response.ok) {
      console.log("[v0] n8n returned error for profile update")
      return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 400 })
    }

    const data = await response.json()
    console.log("[v0] Profile updated successfully:", data.user?.name || data.name)

    const user = data.id ? data : Array.isArray(data.user) ? data.user[0] : data.user

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
