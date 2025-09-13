import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const updateData = await request.json()
    const userId = params.id

    const response = await fetch(WEBHOOK_URL, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        event: "update_user_admin",
      },
      body: JSON.stringify({
        id: userId,
        ...updateData,
      }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ user: data.user })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = params.id

    const response = await fetch(WEBHOOK_URL, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        event: "delete_user",
      },
      body: JSON.stringify({ id: userId }),
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
