import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const agentId = params.id
    const { searchParams } = new URL(request.url)
    const agentName = searchParams.get("agent_name") || ""

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    console.log("[v0] Fetching conversations for agent:", agentId, "with name:", agentName)

    const conversationsUrl = `${n8nWebhookUrl}?agent_id=${agentId}&agent_name=${encodeURIComponent(agentName)}&user_id=${sessionCookie.value}`
    console.log("[v0] Conversations URL:", conversationsUrl)

    const response = await fetch(conversationsUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_conversations",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch conversations from n8n")
    }

    const data = await response.json()
    console.log("[v0] Conversations response:", data)

    return NextResponse.json({
      success: true,
      conversations: data.conversations || [],
    })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch conversations" }, { status: 500 })
  }
}
