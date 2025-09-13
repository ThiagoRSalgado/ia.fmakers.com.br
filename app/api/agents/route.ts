import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    console.log("[v0] GET agents - user_id from session:", sessionCookie.value)

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"
    const requestUrl = `${n8nWebhookUrl}?user_id=${sessionCookie.value}`

    console.log("[v0] GET agents - making request to:", requestUrl)

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_agents",
      },
    })

    console.log("[v0] GET agents - n8n response status:", response.status)

    if (!response.ok) {
      throw new Error("Failed to fetch agents from n8n")
    }

    const data = await response.json()
    console.log("[v0] GET agents - n8n response data:", JSON.stringify(data, null, 2))

    return NextResponse.json({
      success: true,
      agents: data.agents || [],
    })
  } catch (error) {
    console.error("Error fetching agents:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch agents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()

    const agentData = {
      ...body,
      user_id: sessionCookie.value,
    }

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        event: "create_agent",
      },
      body: JSON.stringify(agentData),
    })

    if (!response.ok) {
      throw new Error("Failed to create agent via n8n")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      agent: data.agent,
    })
  } catch (error) {
    console.error("Error creating agent:", error)
    return NextResponse.json({ success: false, error: "Failed to create agent" }, { status: 500 })
  }
}
