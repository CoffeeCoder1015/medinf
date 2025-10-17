"use client"
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Search } from "lucide-react";
import SplitText from "@/components/SplitText";
import Image from "next/image";

export default function Home() {
  const handleAnimationComplete = () => {
    console.log('All letters have animated!');
  };

  function MedicineContext() {
    return ( 
      <Card className="w-5xl">
        <CardContent className="ml-10 mr-10 flex flex-col gap-5">
            <Button>
              <Camera />
              Search by picture
            </Button>
            <Button>
              <Search/>
              Search by name
            </Button>
        </CardContent>
      </Card>
    )
  }
  
  
  return (
    <div className="max-w-5xl justify-center mx-auto h-screen flex items-center flex-col">
      <SplitText
        text="🚑Medinf"
        className="text-5xl font-semibold text-center pb-10"
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
