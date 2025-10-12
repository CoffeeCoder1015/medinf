"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, Loader2, X } from "lucide-react"
import type { DrugIdentification } from "@/lib/types"
import DrugConfirmation from "./drug-confirmation"
import DrugContext from "./drug-context"
import MedGemmaChat from "./medgemma-chat"
import { ErrorAlert } from "./error-alert"
import { DrugSearchBar } from "./drug-search-bar"

export default function DrugIdentificationForm() {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [identifiedDrug, setIdentifiedDrug] = useState<DrugIdentification | null>(null)
  const [confirmedDrugs, setConfirmedDrugs] = useState<DrugIdentification[]>([])
  const [showAnalysis, setShowAnalysis] = useState(false)

  const handleDrugSelect = (drug: DrugIdentification) => {
    setIdentifiedDrug(drug)
    setError(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image size must be less than 10MB")
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file")
      return
    }

    setImageFile(file)
    setError(null)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImageSearch = async () => {
    if (!imageFile) return

    setIsLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append("image", imageFile)

      const response = await fetch("/api/identify-drug", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()
      if (data.success && data.drug) {
        setIdentifiedDrug(data.drug)
      } else {
        setError(
          data.error ||
            "Could not identify the medication from the image. Please try a clearer photo or use text search.",
        )
      }
    } catch (error) {
      console.error("[v0] Error identifying drug from image:", error)
      setError("An error occurred while analyzing the image. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = (drug: DrugIdentification) => {
    setConfirmedDrugs([...confirmedDrugs, { ...drug, confirmed: true }])
    setIdentifiedDrug(null)
    setImageFile(null)
    setImagePreview(null)
    setError(null)
  }

  const handleReject = () => {
    setIdentifiedDrug(null)
    setError("Please try searching again with a different query or image.")
  }

  const handleRemoveDrug = (id: string) => {
    setConfirmedDrugs(confirmedDrugs.filter((drug) => drug.id !== id))
  }

  const handleRefresh = () => {
    setImageFile(null)
    setImagePreview(null)
    setIdentifiedDrug(null)
    setError(null)
  }

  const handleAnalyze = () => {
    if (confirmedDrugs.length > 0) {
      setShowAnalysis(true)
    }
  }

  if (showAnalysis) {
    return <MedGemmaChat drugs={confirmedDrugs} onBack={() => setShowAnalysis(false)} />
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="text" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="text">Search by Name/NDC</TabsTrigger>
          <TabsTrigger value="image">Upload Image</TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label>Medicine Name or NDC Number</Label>
            <DrugSearchBar onSelect={handleDrugSelect} disabled={isLoading} />
            <p className="text-sm text-muted-foreground">
              Search by brand name, generic name, or NDC number. All variants will be shown.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="image" className="space-y-4 mt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Upload Medicine Photo</Label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-colors">
                {imagePreview ? (
                  <div className="relative w-full max-w-sm">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Medicine preview"
                      className="rounded-lg w-full h-auto"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setImageFile(null)
                        setImagePreview(null)
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <Label htmlFor="image" className="cursor-pointer text-primary hover:text-primary/80">
                      Click to upload or drag and drop
                    </Label>
                    <p className="text-sm text-muted-foreground mt-2">PNG, JPG up to 10MB</p>
                  </div>
                )}
                <Input id="image" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </div>
            </div>
            {imageFile && (
              <Button onClick={handleImageSearch} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing Image...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Identify Medicine
                  </>
                )}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {error && <ErrorAlert message={error} />}

      {identifiedDrug && (
        <DrugConfirmation
          drug={identifiedDrug}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onRefresh={handleRefresh}
        />
      )}

      {confirmedDrugs.length > 0 && (
        <DrugContext drugs={confirmedDrugs} onRemove={handleRemoveDrug} onAnalyze={handleAnalyze} />
      )}
    </div>
  )
}
