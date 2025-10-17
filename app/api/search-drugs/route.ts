import { type NextRequest, NextResponse } from "next/server"

export const maxDuration = 30

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

    const transformedResults = results.map((result: any, index: number) => {
      const openfda = result.openfda || {}
      const brandName = openfda.brand_name?.[0] || "Unknown"
      const genericName = openfda.generic_name?.[0] || openfda.substance_name?.[0] || "Unknown"
      const ndcs = openfda.product_ndc || []
      const primaryNdc = ndcs[0] || "N/A"
      const id = openfda.spl_id

      const return_object =  {
        id: id,
        name: brandName,
        ndcNumber: primaryNdc,
        genericName: genericName,
        brandName:brandName,
        manufacturer: openfda.manufacturer_name?.[0] || "Unknown",
        route: openfda.route?.[0] || "N/A",
        ndcs:ndcs,
        uclass: result.spl_uncalssified_section,
        active_ingridient: result.active_ingredient,
        purpose: result.purpose,
        indications_and_usage: result.indications_and_usage,
        warnings: result.warnings,
        ask_doctor: result.ask_doctor,
        ask_doctor_or_pharmacist: result.ask_doctor_or_pharmacist,
        when_using: result.when_using,
        stop_use: result.stop_use,
        pregnancy_or_breast_feeding: result.pregnancy_or_breast_feeding,
        keep_out_of_reach_of_children: result.keep_out_of_reach_of_children,
        overdosage: result.overdosage,
        dosage_and_administration: result.dosage_and_administration,
        dosage_and_administration_table: result.dosage_and_administration_table,
        storage_and_handling: result.storage_and_handling,
        inactive_ingredient: result.inactive_ingredient,
        questions: result.questions,
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
