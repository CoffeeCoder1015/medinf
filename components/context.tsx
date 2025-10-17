"use client"

import type { DrugIdentification } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pill, Sparkles } from "lucide-react"

interface DrugContextProps {
  drugs: DrugIdentification[]
  onRemove: (id: string) => void
  onAnalyze: () => void
}

export default function DrugContext({ drugs, onRemove, onAnalyze }: DrugContextProps) {
  return (
      <Card className="w-4xl bg-gray-100 p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill/>
            Your Medications ({drugs.length})
          </h3>
          <Button onClick={onAnalyze} className="gap-2" variant="outline">
            <Sparkles />
            Analyze with AI
          </Button>
        </div>

        <div className="space-y-1">
          {drugs.map((drug) => (
            <div key={drug.id} className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div className="flex-1">
                <p className="font-medium text-card-foreground">{drug.brandName || drug.genericName || drug.name}</p>
                <p className="text-sm text-muted-foreground font-mono">NDC: {drug.ndcNumber}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(drug.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        </Card>
  )
}
