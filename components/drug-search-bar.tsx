"use client"

import * as React from "react"
import { Search, Loader2, Pill } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { DrugIdentification } from "@/lib/types"

interface DrugSearchResult {
  id: string
  name: string
  ndcNumber: string
  genericName: string
  brandName: string
  manufacturer: string
  dosageForm: string
  strength: string
  route?: string
  allNdcs?: string[]
}

interface DrugSearchBarProps {
  onSelect: (drug: DrugIdentification) => void
  disabled?: boolean
}

export function DrugSearchBar({ onSelect, disabled }: DrugSearchBarProps) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [results, setResults] = React.useState<DrugSearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [showResults, setShowResults] = React.useState(false)
  const [hasMore, setHasMore] = React.useState(false)
  const [skip, setSkip] = React.useState(0)
  const searchRef = React.useRef<HTMLDivElement>(null)
  const resultsRef = React.useRef<HTMLDivElement>(null)

  // Close results when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        setSkip(0)
        setResults([])
        searchDrugs(searchQuery, 0)
      } else {
        setResults([])
        setShowResults(false)
        setHasMore(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchDrugs = async (query: string, currentSkip: number) => {
    setIsLoading(true)
    setShowResults(true)
    try {
      const response = await fetch(`/api/search-drugs?q=${encodeURIComponent(query)}&limit=20&skip=${currentSkip}`)
      const data = await response.json()

      if (data.success) {
        setResults((prev) => (currentSkip === 0 ? data.results : [...prev, ...data.results]))
        setHasMore(data.hasMore)
      }
    } catch (error) {
      console.error("[v0] Error searching drugs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50

    if (bottom && hasMore && !isLoading && searchQuery.length >= 2) {
      const newSkip = skip + 20
      setSkip(newSkip)
      searchDrugs(searchQuery, newSkip)
    }
  }

  const handleSelect = (drug: DrugSearchResult) => {
    setShowResults(false)
    setSearchQuery("")
    onSelect({
      id: crypto.randomUUID(),
      name: drug.name,
      ndcNumber: drug.ndcNumber,
      genericName: drug.genericName,
      brandName: drug.brandName,
      manufacturer: drug.manufacturer,
      dosageForm: drug.dosageForm,
      strength: drug.strength,
      confirmed: false,
      timestamp: Date.now(),
    })
    setResults([])
    setSkip(0)
  }

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search for a medicine (e.g., Tylenol, Aspirin, Ibuprofen)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setShowResults(true)
          }}
          disabled={disabled}
          className="pl-9 pr-9"
        />
        {isLoading && skip === 0 && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showResults && searchQuery.length >= 2 && (
        <div
          ref={resultsRef}
          onScroll={handleScroll}
          className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-lg shadow-lg max-h-[400px] overflow-y-auto"
        >
          {isLoading && skip === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
              Searching FDA database...
            </div>
          )}

          {!isLoading && results.length === 0 && skip === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No medicines found. Try a different search term.
            </div>
          )}

          {results.length > 0 && (
            <div className="py-2">
              {results.map((drug) => (
                <button
                  key={drug.id}
                  onClick={() => handleSelect(drug)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 hover:bg-accent transition-colors text-left",
                    "border-b border-border last:border-b-0",
                  )}
                >
                  <Pill className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{drug.name}</div>
                    <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                      {drug.genericName && drug.genericName !== drug.name && (
                        <div className="truncate">{drug.genericName}</div>
                      )}
                      {drug.strength && drug.strength !== "N/A" && (
                        <div>
                          {drug.strength} {drug.dosageForm !== "N/A" && `• ${drug.dosageForm}`}
                        </div>
                      )}
                      <div className="truncate">NDC: {drug.ndcNumber}</div>
                    </div>
                  </div>
                </button>
              ))}

              {isLoading && skip > 0 && (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                </div>
              )}

              {hasMore && !isLoading && (
                <div className="py-2 text-center text-xs text-muted-foreground">Scroll down for more results...</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
