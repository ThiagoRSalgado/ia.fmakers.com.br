import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const agentId = params.id

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(n8nWebhookUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        event: "update_agent",
      },
      body: JSON.stringify({
        id: agentId,
        ...body,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update agent via n8n")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      agent: data.agent,
    })
  } catch (error) {
    console.error("Error updating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to update agent" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const agentId = params.id

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(n8nWebhookUrl, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        event: "delete_agent",
      },
      body: JSON.stringify({
        id: agentId,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to delete agent via n8n")
    }

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting agent:", error)
    return NextResponse.json({ success: false, error: "Failed to delete agent" }, { status: 500 })
  }
}
