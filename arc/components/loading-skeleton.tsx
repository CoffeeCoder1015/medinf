import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DrugAnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-full mb-2" />
            <Skeleton className="h-3 w-3/4" />
          </Card>
        ))}
      </div>
    </div>
  )
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg p-4 max-w-[80%]">
        <Skeleton className="h-3 w-64 mb-2" />
        <Skeleton className="h-3 w-48 mb-2" />
        <Skeleton className="h-3 w-56" />
      </div>
    </div>
  )
}
