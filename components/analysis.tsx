import { DrugIdentification } from "@/lib/types";
import AnimatedContent from "./AnimatedContent";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export interface AnalysisProps{
    closeAnalysis: () => void
    all_medication: DrugIdentification[]
}

export default function AnalysisPanel({closeAnalysis, all_medication}: AnalysisProps) {
    return ( 
        <AnimatedContent
            distance={150}
            direction="vertical"
            reverse={true}
            duration={1.2}
            ease="ease.in"
            initialOpacity={0.2}
            animateOpacity
            scale={1.1}
            threshold={0.2}
            delay={0.3}
            onComplete={null}
        >
            <Button onClick={closeAnalysis} variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            <div>Content to Animate</div>
        </AnimatedContent>
    )
}