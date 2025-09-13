import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"
    const requestUrl = `${n8nWebhookUrl}?user_id=${sessionCookie.value}`

    const response = await fetch(requestUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        event: "get_prompt_suggestions",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch prompt suggestions from n8n")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      suggestions: data.suggestions || [],
    })
  } catch (error) {
    console.error("Error fetching prompt suggestions:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch prompt suggestions" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("session")

    if (!sessionCookie?.value) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    const body = await request.json()
    const { suggestion_id, action, agent_id, new_prompt } = body

    const n8nWebhookUrl = "https://webhook.agenciaart.com.br/webhook/flowagentpanel"

    const response = await fetch(n8nWebhookUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        event: "update_prompt_suggestion",
      },
      body: JSON.stringify({
        suggestion_id,
        action, // "approve", "reject", "test"
        agent_id,
        new_prompt,
        user_id: sessionCookie.value,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to update prompt suggestion")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Error updating prompt suggestion:", error)
    return NextResponse.json({ success: false, error: "Failed to update prompt suggestion" }, { status: 500 })
  }
}
