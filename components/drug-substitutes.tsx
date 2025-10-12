"use client"

import { useState } from "react"
import type { DrugIdentification, SubstituteRecommendation } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, ArrowRight, DollarSign, Package, AlertTriangle } from "lucide-react"

interface DrugSubstitutesProps {
  drugs: DrugIdentification[]
}

export default function DrugSubstitutes({ drugs }: DrugSubstitutesProps) {
  const [recommendations, setRecommendations] = useState<SubstituteRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResults, setShowResults] = useState(false)

  const findSubstitutes = async () => {
    setIsLoading(true)
    setError(null)
    setShowResults(false)

    try {
      const response = await fetch("/api/find-substitutes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drugs }),
      })

      const data = await response.json()

      if (data.success) {
        setRecommendations(data.recommendations || [])
        setShowResults(true)
      } else {
        setError(data.error || "Failed to find substitutes")
      }
    } catch (err) {
      console.error("[v0] Error finding substitutes:", err)
      setError("An error occurred while finding substitutes")
    } finally {
      setIsLoading(false)
    }
  }

  const getCostBadgeColor = (cost?: string) => {
    switch (cost) {
      case "lower":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "similar":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "higher":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Find Alternative Medications</h3>
          <p className="text-sm text-muted-foreground">Discover potential substitutes and generic alternatives</p>
        </div>
        <Button onClick={findSubstitutes} disabled={isLoading || drugs.length === 0}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding...
            </>
          ) : (
            "Find Substitutes"
          )}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {showResults && recommendations.length > 0 && (
        <div className="space-y-6">
          {recommendations.map((rec, idx) => (
            <Card key={idx} className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-lg">{rec.originalDrug.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {rec.originalDrug.genericName} • {rec.originalDrug.strength}
                    </p>
                  </div>
                  <Badge variant="outline">{rec.substitutes.length} alternatives</Badge>
                </div>

                <p className="text-sm leading-relaxed">{rec.reasoning}</p>

                {rec.warnings && rec.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {rec.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <h5 className="font-medium text-sm">Recommended Substitutes:</h5>
                  {rec.substitutes.map((sub, subIdx) => (
                    <Card key={subIdx} className="p-4 bg-muted/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <ArrowRight className="h-4 w-4 text-primary" />
                            <span className="font-medium">{sub.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{sub.reason}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className={getCostBadgeColor(sub.costComparison)}>
                              <DollarSign className="h-3 w-3 mr-1" />
                              {sub.costComparison || "Unknown"} cost
                            </Badge>
                            <Badge variant="outline">
                              <Package className="h-3 w-3 mr-1" />
                              {sub.availability || "Check availability"}
                            </Badge>
                            {sub.manufacturer && <Badge variant="outline">{sub.manufacturer}</Badge>}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showResults && recommendations.length === 0 && (
        <Alert>
          <AlertDescription>No substitutes found for the selected medications.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
