import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    const { templateId, data } = await request.json()

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

    // Send template data to N8N
    const workflowResponse = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "create_workflow_template",
      },
      body: JSON.stringify({
        templateId,
        data,
        createdBy: userData.id,
      }),
    })

    if (!workflowResponse.ok) {
      const errorData = await workflowResponse.json().catch(() => ({}))
      return NextResponse.json(
        {
          error: errorData.message || "Erro ao criar fluxo no N8N",
        },
        { status: 500 },
      )
    }

    const result = await workflowResponse.json()
    return NextResponse.json({
      success: true,
      workflowId: result.workflowId,
      message: "Fluxo criado com sucesso",
    })
  } catch (error) {
    console.error("Erro ao criar template:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
