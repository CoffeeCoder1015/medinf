"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import SplitText from "@/components/SplitText";
import Image from "next/image";
import MedSearch from "@/components/fda-search";
import { DrugIdentification } from "@/lib/types";
import { useState } from "react";
import DrugConfirmation from "@/components/confirmation";
import DrugContext from "@/components/context";
import Disclaimer from "@/components/disclaimer";

export default function Home() {
  const [identifiedDrug, setIdentifiedDrug] = useState<DrugIdentification | null>(null)
  const [confirmedDrugs, setConfirmedDrugs] = useState<DrugIdentification[]>([])
  const [error, setError] = useState<string | null>(null)

  function onSearchSelect(drug: DrugIdentification) {
    console.log(drug)
    setIdentifiedDrug(drug)
  } 

  function handleAnimationComplete() {
    console.log('All letters have animated!');
  };

  function MedicineContext() {
    return ( 
      <div className="lg:w-4xl w-99">
        <Card className=" bg-gray-100">
          <CardContent className="ml-2 mr-2 flex flex-col gap-2">
              <Button className="min-h-15" variant="outline">
                <Camera />
                Search by picture
              </Button>
              <div className="min-h-15">
                <MedSearch onSelect={onSearchSelect}/>
              </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const handleConfirm = (drug: DrugIdentification) => {
    setConfirmedDrugs([...confirmedDrugs, { ...drug, confirmed: true }])
    setIdentifiedDrug(null)
    // setImageFile(null)
    // setImagePreview(null)
    setError(null)
  }

  const handleReject = () => {
    setIdentifiedDrug(null)
    setError("Please try searching again with a different query or image.")
  }

  const handleRemoveDrug = (id: string) => {
    setConfirmedDrugs(confirmedDrugs.filter((drug) => drug.id !== id))
  }

  const handleAnalyze = () => {
    if (confirmedDrugs.length > 0) {
        // setShowAnalysis(true)
    }
  }


  return (
    <div className="max-w-4xl justify-center mx-auto min-h-screen flex items-center flex-col gap-y-5">
      <SplitText
        text="MedInf 🚑"
        className="text-5xl text-center pb-10"
        delay={100}
        duration={0.6}
        ease="power3.out"
        splitType="chars"
        from={{ opacity: 0, y: 40 }}
        to={{ opacity: 1, y: 0 }}
        threshold={0.1}
        onLetterAnimationComplete={handleAnimationComplete}
      />
      <MedicineContext />
      {identifiedDrug && <DrugConfirmation
        drug={identifiedDrug}
        onConfirm={handleConfirm}
        onReject={handleReject}
      /> }
      {
        confirmedDrugs.length > 0 && 
      <DrugContext
        drugs={confirmedDrugs}
        onRemove={handleRemoveDrug}
        onAnalyze={handleAnalyze}
      />
      }
      <Disclaimer/>
    </div>
  );
}
