import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const WEBHOOK_URL = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

export async function POST(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado
    const sessionCookie = cookies().get("session")
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const body = await request.json()

    console.log("[v0] Configure workflow request:", body)

    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "configure_sdr_workflow",
      },
      body: JSON.stringify(body),
    })

    console.log("[v0] N8N response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log("[v0] N8N error response:", errorText)
      return NextResponse.json({ error: "Falha ao configurar fluxo no N8N" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Workflow configured successfully:", data)

    return NextResponse.json({
      success: true,
      message: "Fluxo configurado com sucesso",
      data,
    })
  } catch (error) {
    console.error("[v0] Error configuring workflow:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
