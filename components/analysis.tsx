import { DrugIdentification } from "@/lib/types";
import AnimatedContent from "./AnimatedContent";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/card";
import { useEffect, useState } from "react";
import { Skeleton } from "./ui/skeleton";
import {Streamdown} from "streamdown";

export interface AnalysisProps{
    closeAnalysis: () => void
    all_medication: DrugIdentification[]
}

function resultSkeleton() {
    return (
        <div className="flex flex-col gap-3 m-5">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
            </div>
        </div>
    )
}

export default function AnalysisPanel({closeAnalysis, all_medication}: AnalysisProps) {
    const [report,setReport] = useState<string>("");

    useEffect(function () {
        fetch("/api/analyze-drugs",{method:"POST",body:JSON.stringify(all_medication)}).then(function (response) {
            console.log(response)
            return response
        }).then((response)=>(response.json())).then(function (json) {
            console.log(json)
            setReport(json.steps[0].content[0].text)
        })
    },[all_medication])
    
    return ( 
        <AnimatedContent
            distance={150}
            direction="vertical"
            reverse={true}
            duration={0.6}
            ease="ease.in"
            initialOpacity={0.2}
            animateOpacity
            scale={1.1}
            threshold={0.2}
            onComplete={null}
        >
            <Card className="lg:w-4xl w-99">
                <CardHeader className="flex items-center gap-4">
                    <Button onClick={closeAnalysis} variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button> 
                    <div>
                        <h2 className="text-2xl font-bold space-x-8">
                            Analysis
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Analyzing {all_medication.length} medication{all_medication.length > 1 ? "s" : ""}
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    {report === "" && resultSkeleton()}
                    <Streamdown>
                        {report}
                    </Streamdown>
                </CardContent>
            </Card>
        </AnimatedContent>
    )
}