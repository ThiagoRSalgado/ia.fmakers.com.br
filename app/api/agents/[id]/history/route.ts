import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(`${n8nWebhookUrl}?agent_id=${agentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_history",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch agent history from n8n")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      history: data.history || [],
    })
  } catch (error) {
    console.error("Error fetching agent history:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch agent history" }, { status: 500 })
  }
}
