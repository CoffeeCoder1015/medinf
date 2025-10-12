import { type NextRequest, NextResponse } from "next/server"
import type { DrugIdentification, FDADrugData } from "@/lib/types"
import { generateObject } from "ai"
import { z } from "zod"
import { createWorker } from "tesseract.js"

export const maxDuration = 30

// Helper function to search FDA API
async function searchFDAByQuery(query: string): Promise<FDADrugData | null> {
  try {
    // Check if query is an NDC number (format: XXXXX-XXXX-XX or similar)
    const isNDC = /^\d{4,5}-\d{3,4}-\d{1,2}$/.test(query) || /^\d{10,11}$/.test(query)

    const searchField = isNDC ? "product_ndc" : "brand_name"
    const searchQuery = query

    // If not NDC, try generic name as fallback
    const searchUrl = `https://api.fda.gov/drug/ndc.json?search=${searchField}:"${encodeURIComponent(searchQuery)}"&limit=1`

    console.log("[v0] Searching FDA API:", searchUrl)

    const response = await fetch(searchUrl)

    if (!response.ok) {
      // Try generic name if brand name fails
      if (searchField === "brand_name") {
        const genericUrl = `https://api.fda.gov/drug/ndc.json?search=generic_name:"${encodeURIComponent(searchQuery)}"&limit=1`
        const genericResponse = await fetch(genericUrl)

        if (genericResponse.ok) {
          const data = await genericResponse.json()
          return data.results?.[0] || null
        }
      }
      return null
    }

    const data = await response.json()
    return data.results?.[0] || null
  } catch (error) {
    console.error("[v0] FDA API error:", error)
    return null
  }
}

// Helper function to extract NDC from image using OCR
async function extractNDCFromImage(imageData: string): Promise<string | null> {
  try {
    console.log("[v0] Starting Tesseract OCR...")

    // Create Tesseract worker
    const worker = await createWorker("eng")

    // Perform OCR on the image
    const {
      data: { text },
    } = await worker.recognize(imageData)

    console.log("[v0] Tesseract extracted text:", text)

    // Terminate worker
    await worker.terminate()

    // Look for NDC patterns in the extracted text
    // NDC formats: XXXXX-XXXX-XX, XXXX-XXXX-XX, or 10-11 digit numbers
    const ndcPatterns = [
      /\b\d{5}-\d{4}-\d{2}\b/g, // 5-4-2 format
      /\b\d{4}-\d{4}-\d{2}\b/g, // 4-4-2 format
      /\b\d{5}-\d{3}-\d{2}\b/g, // 5-3-2 format
      /\bNDC[:\s]*(\d{5}-\d{4}-\d{2}|\d{4}-\d{4}-\d{2}|\d{5}-\d{3}-\d{2}|\d{10,11})\b/gi, // NDC: prefix
      /\b\d{10,11}\b/g, // 10-11 digit format
    ]

    for (const pattern of ndcPatterns) {
      const matches = text.match(pattern)
      if (matches && matches.length > 0) {
        // Clean up the NDC (remove "NDC:" prefix if present)
        const ndc = matches[0].replace(/NDC[:\s]*/gi, "").trim()
        console.log("[v0] Found NDC via Tesseract:", ndc)
        return ndc
      }
    }

    console.log("[v0] No NDC found in Tesseract OCR text")
    return null
  } catch (error) {
    console.error("[v0] Tesseract OCR error:", error)
    return null
  }
}

// Helper function to identify drug from image using vision LLM
async function identifyDrugFromImage(imageData: string): Promise<{ name: string; description: string } | null> {
  try {
    const { object } = await generateObject({
      model: "openai/gpt-5",
      schema: z.object({
        drugName: z.string().describe("The name of the medication visible in the image"),
        description: z.string().describe("Brief description of what you see (pill shape, color, imprint codes)"),
        confidence: z.enum(["high", "medium", "low"]).describe("Confidence level of identification"),
      }),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Identify the medication in this image. Look for pill imprints, packaging labels, or any text that indicates the drug name. Provide the drug name and a description of what you see.",
            },
            {
              type: "image",
              image: imageData,
            },
          ],
        },
      ],
    })

    if (object.confidence === "low") {
      return null
    }

    return {
      name: object.drugName,
      description: object.description,
    }
  } catch (error) {
    console.error("[v0] Vision LLM error:", error)
    return null
  }
}

// Convert FDA data to DrugIdentification
function fdaDataToDrugIdentification(fdaData: FDADrugData): DrugIdentification {
  return {
    id: crypto.randomUUID(),
    name: fdaData.brand_name || fdaData.generic_name,
    ndcNumber: fdaData.product_ndc,
    genericName: fdaData.generic_name,
    brandName: fdaData.brand_name,
    manufacturer: fdaData.labeler_name,
    dosageForm: fdaData.dosage_form,
    strength: fdaData.active_ingredients?.[0]?.strength,
    confirmed: false,
    timestamp: Date.now(),
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type")

    // Handle text-based search
    if (contentType?.includes("application/json")) {
      const { query, method } = await req.json()

      if (method === "text" && query) {
        const fdaData = await searchFDAByQuery(query)

        if (fdaData) {
          const drug = fdaDataToDrugIdentification(fdaData)
          return NextResponse.json({ drug, success: true })
        }

        return NextResponse.json({ error: "Drug not found in FDA database", success: false }, { status: 404 })
      }
    }

    // Handle image-based search
    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData()
      const image = formData.get("image") as File

      if (!image) {
        return NextResponse.json({ error: "No image provided", success: false }, { status: 400 })
      }

      // Convert image to base64
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64Image = `data:${image.type};base64,${buffer.toString("base64")}`

      console.log("[v0] Attempting Tesseract OCR to extract NDC...")
      const ndc = await extractNDCFromImage(base64Image)

      if (ndc) {
        console.log("[v0] NDC found via Tesseract OCR:", ndc)
        const fdaData = await searchFDAByQuery(ndc)

        if (fdaData) {
          const drug = fdaDataToDrugIdentification(fdaData)
          return NextResponse.json({ drug, success: true, method: "tesseract-ocr" })
        }
      }

      console.log("[v0] Tesseract OCR failed, using vision LLM as fallback...")
      const identified = await identifyDrugFromImage(base64Image)

      if (identified) {
        console.log("[v0] Drug identified via vision LLM:", identified.name)
        const fdaData = await searchFDAByQuery(identified.name)

        if (fdaData) {
          const drug = fdaDataToDrugIdentification(fdaData)
          return NextResponse.json({ drug, success: true, method: "vision-llm" })
        }
      }

      return NextResponse.json({ error: "Could not identify drug from image", success: false }, { status: 404 })
    }

    return NextResponse.json({ error: "Invalid request format", success: false }, { status: 400 })
  } catch (error) {
    console.error("[v0] Error in identify-drug API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
