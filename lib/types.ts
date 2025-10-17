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