export interface DrugIdentification {
  id: string
  name: string
  ndcNumber: string
  genericName?: string
  brandName?: string
  manufacturer?: string
  dosageForm?: string
  strength?: string
  confirmed: boolean
  timestamp: number
}

export interface FDADrugData {
  product_ndc: string
  generic_name: string
  brand_name: string
  dosage_form: string
  route: string[]
  marketing_category: string
  labeler_name: string
  substance_name: string[]
  active_ingredients: Array<{
    name: string
    strength: string
  }>
  packaging: Array<{
    package_ndc: string
    description: string
  }>
}

export interface MedGemmaAnalysis {
  contradictions: string[]
  usageSchedule: string[]
  interactions: string[]
  warnings: string[]
  sideEffects: string[]
}

export interface DrugSubstitute {
  id: string
  name: string
  genericName: string
  brandName?: string
  ndcNumber: string
  manufacturer?: string
  dosageForm?: string
  strength?: string
  reason: string
  costComparison?: "lower" | "similar" | "higher"
  availability?: "widely-available" | "limited" | "prescription-required"
}

export interface SubstituteRecommendation {
  originalDrug: DrugIdentification
  substitutes: DrugSubstitute[]
  reasoning: string
  warnings: string[]
}
