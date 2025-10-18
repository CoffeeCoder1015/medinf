import { OpenFDARecord } from "@/lib/types";
import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

function invertOpenFDA<T extends OpenFDARecord>(record: T) {
  const { openfda, ...rest } = record;

  return {
    openfda,
    data: rest,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get("q")
    const limit = Number.parseInt(searchParams.get("limit") || "20", 10)
    const skip = Number.parseInt(searchParams.get("skip") || "0", 10)

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [], hasMore: false, success: true })
    }

    console.log("[v0] Searching FDA for:", query, "limit:", limit, "skip:", skip)

    const searchTerms = [
      `openfda.brand_name:*${query}*`,
      `openfda.generic_name:*${query}*`,
      `openfda.substance_name:*${query}*`,
    ]

    const searchQuery = searchTerms.join("+")
    const fdaUrl = `https://api.fda.gov/drug/label.json?search=${searchQuery}&limit=${limit}&skip=${skip}`

    console.log("[v0] FDA URL:", fdaUrl)

    const response = await fetch(fdaUrl)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ results: [], hasMore: false, success: true })
      }
      throw new Error(`FDA API error: ${response.status}`)
    }

    const data = await response.json()
    const results = data.results || []

    const transformedResults = results.map((result: OpenFDARecord) => {
      const openfda = result.openfda || {}
      const brandName = openfda.brand_name?.[0] || "Unknown"
      const genericName = openfda.generic_name?.[0] || openfda.substance_name?.[0] || "Unknown"
      const ndcs = openfda.product_ndc || []
      const primaryNdc = ndcs[0] || "N/A"
      const id = openfda.spl_id
      const inverted = invertOpenFDA(result)

      const return_object =  {
        id: id,
        name: brandName,
        ndcNumber: primaryNdc,
        genericName: genericName,
        brandName:brandName,
        manufacturer: openfda.manufacturer_name?.[0] || "Unknown",
        route: openfda.route?.[0] || "N/A",
        ndcs:ndcs,
        type: openfda.product_type,
        data: inverted.data
      }
      
      return return_object
    })

    const hasMore = results.length === limit

    console.log("[v0] Returning", transformedResults.length, "results, hasMore:", hasMore)

    return NextResponse.json({
      results: transformedResults,
      hasMore,
      success: true,
    })
  } catch (error) {
    console.error("[v0] Error in search-drugs API:", error)
    return NextResponse.json({ error: "Internal server error", success: false }, { status: 500 })
  }
}
