import type { FDADrugData } from "./types"

export async function searchFDADatabase(query: string, searchType: "ndc" | "name" = "name"): Promise<FDADrugData[]> {
  try {
    const searchField = searchType === "ndc" ? "product_ndc" : "brand_name"
    const url = `https://api.fda.gov/drug/ndc.json?search=${searchField}:"${encodeURIComponent(query)}"&limit=5`

    const response = await fetch(url)

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("[v0] FDA database search error:", error)
    return []
  }
}

export function formatNDC(ndc: string): string {
  // Remove any existing hyphens
  const cleaned = ndc.replace(/-/g, "")

  // Format as XXXXX-XXXX-XX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
  } else if (cleaned.length === 11) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 9)}-${cleaned.slice(9)}`
  }

  return ndc
}

export function validateNDC(ndc: string): boolean {
  const cleaned = ndc.replace(/-/g, "")
  return /^\d{10,11}$/.test(cleaned)
}
