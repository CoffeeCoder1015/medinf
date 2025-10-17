"use client"

import type { DrugIdentification } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Pill, Sparkles } from "lucide-react"
import DrugSubstitutes from "./drug-substitutes"

interface DrugContextProps {
  drugs: DrugIdentification[]
  onRemove: (id: string) => void
  onAnalyze: () => void
}

export default function DrugContext({ drugs, onRemove, onAnalyze }: DrugContextProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-accent/10 border-accent/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Pill className="h-5 w-5 text-accent" />
            Your Medications ({drugs.length})
          </h3>
          <Button onClick={onAnalyze} className="gap-2">
            <Sparkles className="h-4 w-4" />
            Analyze with AI
          </Button>
        </div>

        <div className="space-y-2">
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

      {drugs.length > 0 && (
        <Card className="p-6">
          <DrugSubstitutes drugs={drugs} />
        </Card>
      )}
    </div>
  )
}
