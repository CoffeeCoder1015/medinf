import { type NextRequest, NextResponse } from "next/server"
import type { DrugIdentification } from "@/lib/types"
import { generateObject } from "ai"
import { z } from "zod"

export const maxDuration = 30

const analysisSchema = z.object({
  contradictions: z.array(z.string()).describe("Drug interactions and contradictions between the medications"),
  usageSchedule: z.array(z.string()).describe("Recommended usage schedule and timing for each medication"),
  interactions: z.array(z.string()).describe("Potential drug-drug interactions"),
  warnings: z.array(z.string()).describe("Important warnings and precautions"),
  sideEffects: z.array(z.string()).describe("Common side effects to watch for"),
  summary: z.string().describe("A brief summary of the key information the patient should know"),
})

export async function POST(req: NextRequest) {
  try {
    const { drugs }: { drugs: DrugIdentification[] } = await req.json()

    if (!drugs || drugs.length === 0) {
      return NextResponse.json({ error: "No drugs provided", success: false }, { status: 400 })
    }

    // Create context about the drugs
    const drugContext = drugs
      .map(
        (drug) =>
          `- ${drug.brandName || drug.genericName} (${drug.genericName || ""}): NDC ${drug.ndcNumber}, ${drug.dosageForm || ""} ${drug.strength || ""}`,
      )
      .join("\n")

    console.log("[v0] Analyzing drugs with MedGemma:", drugContext)

    // Use AI to analyze the drugs (simulating MedGemma)
    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: analysisSchema,
      messages: [
        {
          role: "system",
          content:
            "You are a medical AI assistant specialized in medication safety. Analyze the provided medications and identify key safety information including contradictions, interactions, usage schedules, warnings, and side effects. Be thorough but concise.",
        },
        {
          role: "user",
          content: `Analyze these medications and provide comprehensive safety information:\n\n${drugContext}\n\nProvide detailed analysis of contradictions, usage schedules, interactions, warnings, and common side effects.`,
        },
      ],
    })

    return NextResponse.json({
      analysis: object,
      summary: object.summary,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error analyzing drugs:", error)
    return NextResponse.json({ error: "Failed to analyze drugs", success: false }, { status: 500 })
  }
}
