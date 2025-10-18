"use client"

import type { DrugIdentification } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@radix-ui/react-collapsible"
import HTML from "./dynamicHTML"

interface DrugConfirmationProps {
  drug: DrugIdentification
  onConfirm: (drug: DrugIdentification) => void
  onReject: () => void
}

export default function DrugConfirmation({ drug, onConfirm, onReject}: DrugConfirmationProps) {
  return (
    <Alert className="w-99 lg:w-4xl">
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
              <span className="font-medium text-foreground">Manufacturer:</span>{" "}
              <span className="text-muted-foreground">{drug.manufacturer}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">NDC Number:</span>{" "}
              <span className="font-mono text-muted-foreground">{drug.ndcNumber}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">Usage route:</span>{" "}
              <span className="font-mono text-muted-foreground">{drug.route}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">All NDCs:</span>{" "}
              <span className="font-mono text-muted-foreground">{drug.ndcs}</span>
            </div>
            <hr></hr>
            <div>
              {Object.keys(drug.data).map(function (key:string ,index: number) {
                return (
                  <Collapsible key={index}>
                    <CollapsibleTrigger className="text-foreground text-md" asChild>
                      <Button variant={"outline"} className="text-wrap">
                        {key}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="flex flex-col pl-4">
                    {
                      Array.isArray(drug.data[key]) ?
                      (Object.values(drug.data[key]) as Array<string>).map(function(str:string, index: number) {
                        if (key === "dosage_and_administration_table" || key === "clinical_pharmacology_table" || key === "pharmacokinetics_table" || key=="clinical_studies_table") {
                         return HTML(str)
                        }
                        return <div key={index}>{str}</div>
                      }) : drug.data[key]
                    }
                    </CollapsibleContent>
                  </Collapsible>
                ) 
              })
              }
            </div>
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

