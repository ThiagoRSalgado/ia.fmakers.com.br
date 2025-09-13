import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    const { email, name, company, cnpj } = await request.json()

    // Verify admin access
    const sessionCookie = cookies().get("session")
    if (!sessionCookie) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    // Verify user is admin
    const userResponse = await fetch(`${WEBHOOK_URL}?user_id=${sessionCookie.value}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_user_profile",
      },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Erro ao verificar usuário" }, { status: 500 })
    }

    const userData = await userResponse.json()
    if (userData.role !== "admin") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const createUserResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "create_n8n_user",
      },
      body: JSON.stringify({
        email,
        name,
        company,
        cnpj,
        createdBy: userData.id,
      }),
    })

    if (!createUserResponse.ok) {
      const errorData = await createUserResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: errorData.message || "Erro ao criar usuário no N8N",
        },
        { status: 500 },
      )
    }

    const result = await createUserResponse.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Erro ao criar usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
