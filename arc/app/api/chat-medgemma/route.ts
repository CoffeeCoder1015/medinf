import { type NextRequest, NextResponse } from "next/server"
import type { DrugIdentification } from "@/lib/types"
import { generateText } from "ai"

export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const { messages, drugs }: { messages: Array<{ role: string; content: string }>; drugs: DrugIdentification[] } =
      await req.json()

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided", success: false }, { status: 400 })
    }

    // Create context about the drugs
    const drugContext = drugs
      .map(
        (drug) =>
          `- ${drug.brandName || drug.genericName} (${drug.genericName || ""}): NDC ${drug.ndcNumber}, ${drug.dosageForm || ""} ${drug.strength || ""}`,
      )
      .join("\n")

    // Build conversation history
    const conversationHistory = messages.map((msg) => `${msg.role}: ${msg.content}`).join("\n\n")

    console.log("[v0] MedGemma chat request")

    // Use AI to respond (simulating MedGemma)
    const { text } = await generateText({
      model: "openai/gpt-5",
      messages: [
        {
          role: "system",
          content: `You are MedGemma, a specialized medical AI assistant focused on medication safety and information. You are helping a patient understand their medications:

${drugContext}

Provide accurate, helpful information about these medications. Always remind users to consult their healthcare provider for medical advice. Be empathetic and clear in your explanations.`,
        },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
    })

    return NextResponse.json({
      response: text,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error in MedGemma chat:", error)
    return NextResponse.json({ error: "Failed to generate response", success: false }, { status: 500 })
  }
}
