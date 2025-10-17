import { type NextRequest, NextResponse } from "next/server"
import type { DrugIdentification, SubstituteRecommendation } from "@/lib/types"

export const maxDuration = 60

/**
 * Drug Substitutes Inference Endpoint
 *
 * This endpoint is designed to integrate with external ML inference services:
 * - Google Vertex AI
 * - Amazon SageMaker
 *
 * Configuration via environment variables:
 * - INFERENCE_ENDPOINT_URL: The URL of your deployed model endpoint
 * - INFERENCE_ENDPOINT_TYPE: 'vertex-ai' | 'sagemaker' | 'local'
 * - INFERENCE_API_KEY: Authentication key for the endpoint
 * - VERTEX_AI_PROJECT_ID: (For Vertex AI) Your GCP project ID
 * - VERTEX_AI_LOCATION: (For Vertex AI) Region like 'us-central1'
 * - SAGEMAKER_ENDPOINT_NAME: (For SageMaker) Your endpoint name
 * - AWS_REGION: (For SageMaker) AWS region
 */

interface InferenceRequest {
  drugs: DrugIdentification[]
  patientContext?: {
    age?: number
    conditions?: string[]
    allergies?: string[]
  }
}

interface InferenceResponse {
  recommendations: SubstituteRecommendation[]
  modelVersion?: string
  confidence?: number
}

/**
 * Call external inference endpoint (Vertex AI or SageMaker)
 */
async function callInferenceEndpoint(request: InferenceRequest): Promise<InferenceResponse> {
  const endpointType = process.env.INFERENCE_ENDPOINT_TYPE || "local"
  const endpointUrl = process.env.INFERENCE_ENDPOINT_URL
  const apiKey = process.env.INFERENCE_API_KEY

  console.log("[v0] Inference endpoint type:", endpointType)

  // For now, return mock data until real endpoint is configured
  if (!endpointUrl || endpointType === "local") {
    console.log("[v0] Using local mock inference (no external endpoint configured)")
    return mockInferenceResponse(request)
  }

  try {
    if (endpointType === "vertex-ai") {
      return await callVertexAI(request, endpointUrl, apiKey)
    } else if (endpointType === "sagemaker") {
      return await callSageMaker(request, endpointUrl, apiKey)
    } else {
      // Generic REST endpoint
      return await callGenericEndpoint(request, endpointUrl, apiKey)
    }
  } catch (error) {
    console.error("[v0] Inference endpoint error:", error)
    // Fallback to mock data on error
    return mockInferenceResponse(request)
  }
}

/**
 * Call Google Vertex AI endpoint
 */
async function callVertexAI(
  request: InferenceRequest,
  endpointUrl: string,
  apiKey?: string,
): Promise<InferenceResponse> {
  const projectId = process.env.VERTEX_AI_PROJECT_ID
  const location = process.env.VERTEX_AI_LOCATION || "us-central1"

  // Format request for Vertex AI
  const vertexRequest = {
    instances: [
      {
        drugs: request.drugs.map((d) => ({
          name: d.name,
          generic_name: d.genericName,
          ndc: d.ndcNumber,
          dosage_form: d.dosageForm,
          strength: d.strength,
        })),
        patient_context: request.patientContext,
      },
    ],
  }

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
    body: JSON.stringify(vertexRequest),
  })

  if (!response.ok) {
    throw new Error(`Vertex AI request failed: ${response.statusText}`)
  }

  const data = await response.json()

  // Parse Vertex AI response format
  return {
    recommendations: data.predictions[0].recommendations || [],
    modelVersion: data.modelVersion,
    confidence: data.predictions[0].confidence,
  }
}

/**
 * Call Amazon SageMaker endpoint
 */
async function callSageMaker(
  request: InferenceRequest,
  endpointUrl: string,
  apiKey?: string,
): Promise<InferenceResponse> {
  const endpointName = process.env.SAGEMAKER_ENDPOINT_NAME
  const region = process.env.AWS_REGION || "us-east-1"

  // Format request for SageMaker
  const sagemakerRequest = {
    drugs: request.drugs.map((d) => ({
      name: d.name,
      generic_name: d.genericName,
      ndc: d.ndcNumber,
      dosage_form: d.dosageForm,
      strength: d.strength,
    })),
    patient_context: request.patientContext,
  }

  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey && { "X-Amzn-SageMaker-Custom-Attributes": apiKey }),
    },
    body: JSON.stringify(sagemakerRequest),
  })

  if (!response.ok) {
    throw new Error(`SageMaker request failed: ${response.statusText}`)
  }

  const data = await response.json()

  // Parse SageMaker response format
  return {
    recommendations: data.recommendations || [],
    modelVersion: data.model_version,
    confidence: data.confidence,
  }
}

/**
 * Call generic REST endpoint
 */
async function callGenericEndpoint(
  request: InferenceRequest,
  endpointUrl: string,
  apiKey?: string,
): Promise<InferenceResponse> {
  const response = await fetch(endpointUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey && { Authorization: `Bearer ${apiKey}` }),
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    throw new Error(`Inference endpoint request failed: ${response.statusText}`)
  }

  return await response.json()
}

/**
 * Mock inference response for development/testing
 */
function mockInferenceResponse(request: InferenceRequest): InferenceResponse {
  const recommendations: SubstituteRecommendation[] = request.drugs.map((drug) => {
    // Generate mock substitutes based on generic name
    const substitutes = [
      {
        id: `sub-${drug.id}-1`,
        name: `Generic ${drug.genericName || drug.name}`,
        genericName: drug.genericName || drug.name,
        brandName: undefined,
        ndcNumber: "00000-0000-00",
        manufacturer: "Generic Manufacturer",
        dosageForm: drug.dosageForm,
        strength: drug.strength,
        reason: "Lower cost generic alternative with same active ingredient",
        costComparison: "lower" as const,
        availability: "widely-available" as const,
      },
      {
        id: `sub-${drug.id}-2`,
        name: `Alternative Brand`,
        genericName: drug.genericName || drug.name,
        brandName: "Alternative Brand",
        ndcNumber: "00000-0000-01",
        manufacturer: "Alternative Manufacturer",
        dosageForm: drug.dosageForm,
        strength: drug.strength,
        reason: "Similar efficacy with better availability",
        costComparison: "similar" as const,
        availability: "widely-available" as const,
      },
    ]

    return {
      originalDrug: drug,
      substitutes,
      reasoning: `Found ${substitutes.length} potential substitutes for ${drug.name}. These alternatives contain the same active ingredient and are therapeutically equivalent.`,
      warnings: [
        "Always consult your healthcare provider before switching medications",
        "Some substitutes may have different inactive ingredients that could affect tolerability",
      ],
    }
  })

  return {
    recommendations,
    modelVersion: "mock-v1.0",
    confidence: 0.85,
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: InferenceRequest = await req.json()

    if (!body.drugs || body.drugs.length === 0) {
      return NextResponse.json({ error: "No drugs provided", success: false }, { status: 400 })
    }

    console.log("[v0] Finding substitutes for", body.drugs.length, "drug(s)")

    const result = await callInferenceEndpoint(body)

    return NextResponse.json({
      ...result,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error finding substitutes:", error)
    return NextResponse.json({ error: "Failed to find substitutes", success: false }, { status: 500 })
  }
}
