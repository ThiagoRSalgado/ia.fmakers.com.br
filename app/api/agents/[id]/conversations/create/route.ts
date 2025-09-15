import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { agent_name, session_id, conversation_type = "normal" } = await request.json()

    const agentId = params.id

    console.log("[v0] Creating conversation:", { agentId, agent_name, session_id, conversation_type })

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "create_conversation",
      },
      body: JSON.stringify({
        agent_id: agentId,
        agent_name,
        session_id,
        conversation_type,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Erro na chamada webhook: ${response.status}`)
    }

    const result = await response.json()
    console.log("[v0] Conversation created:", result)

    const conversationId = result.id || result.conversation_id

    if (!conversationId) {
      console.error("[v0] N8N não retornou ID válido:", result)
      throw new Error("N8N não retornou ID de conversa válido")
    }

    return NextResponse.json({
      success: true,
      conversation_id: conversationId, // Usar o ID retornado pelo n8n (integer)
      session_id,
    })
  } catch (error) {
    console.error("[v0] Erro ao criar conversa:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
