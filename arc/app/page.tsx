import DrugIdentificationForm from "@/components/drug-identification-form"
import { Card } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-balance mb-4 text-foreground">Medicine Information Assistant</h1>
          <p className="text-lg text-muted-foreground text-pretty max-w-2xl mx-auto">
            Identify your medication by name, NDC number, or photo. Get comprehensive safety information and
            personalized guidance.
          </p>
        </div>

        <Card className="p-8 shadow-lg">
          <DrugIdentificationForm />
        </Card>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p className="text-pretty">
            This tool provides general information only. Always consult your healthcare provider for medical advice.
          </p>
        </div>
      </div>
    </main>
  )
}
