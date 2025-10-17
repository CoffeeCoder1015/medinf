"use client"

import type { DrugIdentification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DrugConfirmationProps {
  drug: DrugIdentification
  onConfirm: (drug: DrugIdentification) => void
  onReject: () => void
  onRefresh: () => void
}

export default function DrugConfirmation({ drug, onConfirm, onReject, onRefresh }: DrugConfirmationProps) {
  return (
    <Alert className="border-primary/50 bg-primary/5">
      <AlertTitle className="text-lg font-semibold mb-4">Medicine Identified</AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          <div className="grid gap-3">
            <div>
              <span className="font-medium text-foreground">Brand Name:</span>{" "}
              <span className="text-muted-foreground">{drug.brandName || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Generic Name:</span>{" "}
              <span className="text-muted-foreground">{drug.genericName || "N/A"}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">NDC Number:</span>{" "}
              <span className="font-mono text-muted-foreground">{drug.ndcNumber}</span>
            </div>
            {drug.manufacturer && (
              <div>
                <span className="font-medium text-foreground">Manufacturer:</span>{" "}
                <span className="text-muted-foreground">{drug.manufacturer}</span>
              </div>
            )}
            {drug.dosageForm && (
              <div>
                <span className="font-medium text-foreground">Dosage Form:</span>{" "}
                <span className="text-muted-foreground">{drug.dosageForm}</span>
              </div>
            )}
            {drug.strength && (
              <div>
                <span className="font-medium text-foreground">Strength:</span>{" "}
                <span className="text-muted-foreground">{drug.strength}</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={() => onConfirm(drug)} className="flex-1" variant="default">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Confirm
            </Button>
            <Button onClick={onReject} className="flex-1" variant="destructive">
              <XCircle className="h-4 w-4 mr-2" />
              Incorrect
            </Button>
            <Button onClick={onRefresh} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
