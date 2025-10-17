"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import SplitText from "@/components/SplitText";
import Image from "next/image";
import MedSearch from "@/components/fda-search";
import { DrugIdentification } from "@/lib/types";

export default function Home() {
  function onSearchSelect(drug: DrugIdentification) {
    console.log(drug)
  } 

  function handleAnimationComplete() {
    console.log('All letters have animated!');
  };

  function MedicineContext() {
    return ( 
      <Card className="w-4xl bg-gray-100">
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
    )
  }
  
  
  return (
    <div className="max-w-5xl justify-center mx-auto h-screen flex items-center flex-col">
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
    </div>
  );
}
