export interface DrugIdentification {
  id: string ,
  ndcNumber: string ,
  genericName: string ,
  brandName: string ,
  manufacturer:string,
  route:string ,
  ndcs:string[] ,
  uclass:string[] ,
  active_ingridient:string[] ,
  purpose:string[] ,
  indications_and_usage:string[] ,
  warnings:string[] ,
  ask_doctor:string[] ,
  ask_doctor_or_pharmacist:string[] ,
  when_using:string[] ,
  stop_use:string[] ,
  pregnancy_or_breast_feeding:string[] ,
  keep_out_of_reach_of_children:string[] ,
  overdosage:string[] ,
  dosage_and_administration:string[] ,
  dosage_and_administration_table:string[] ,
  storage_and_handling:string[] ,
  inactive_ingredient:string[] ,
  questions:string[]
}

export interface MedGemmaAnalysis {
  contradictions: string[]
  usageSchedule: string[]
  interactions: string[]
  warnings: string[]
  sideEffects: string[]
}