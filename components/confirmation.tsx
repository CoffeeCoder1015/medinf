"use client"

import type { DrugIdentification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface DrugConfirmationProps {
  drug: DrugIdentification
  onConfirm: (drug: DrugIdentification) => void
  onReject: () => void
}

export default function DrugConfirmation({ drug, onConfirm, onReject}: DrugConfirmationProps) {
  return (
    <Alert>
      <AlertTitle className="text-lg font-semibold mb-4">Medicine Identified</AlertTitle>
      <AlertDescription>
        <div className="space-y-4">
          <div className="grid gap-1">
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
            <div>
              <span className="font-medium text-foreground">NDC Number:</span>{" "}
            </div>
            {drug.manufacturer && (
              <div>
                <span className="font-medium text-foreground">Manufacturer:</span>{" "}
                <span className="text-muted-foreground">{drug.manufacturer}</span>
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
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}

