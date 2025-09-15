import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string; conversationId: string } }) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const { id: agentId, conversationId } = params
    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    console.log("[v0] Fetching messages for conversation:", conversationId)

    const response = await fetch(
      `${n8nWebhookUrl}?agent_id=${agentId}&conversation_id=${conversationId}&user_id=${sessionCookie.value}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          event: "get_conversation_messages",
        },
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch messages from n8n")
    }

    const data = await response.json()
    console.log("[v0] Messages response:", data)

    return NextResponse.json({
      success: true,
      messages: data.messages || [],
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 })
  }
}
