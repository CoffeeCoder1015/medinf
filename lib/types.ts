export type OpenFDARecord = {
  openfda: Record<string, string[]>;
  [key: string]: string[] | Record<string, string[]>; // catch-all for other fields
};

export interface DrugIdentification {
  id: string ,
  name:string ,
  ndcNumber: string ,
  genericName: string ,
  brandName: string ,
  manufacturer:string,
  route:string ,
  type: string,
  ndcs: string[],
  data: string[] | Record<string, string[]>;
}

export interface MedGemmaAnalysis {
  contradictions: string[]
  usageSchedule: string[]
  interactions: string[]
  warnings: string[]
  sideEffects: string[]
}