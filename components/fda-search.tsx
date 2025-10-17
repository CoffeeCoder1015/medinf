"use client"

import * as React from "react"
import { Check, Pill } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import type { DrugIdentification } from "@/lib/types"
import { Card, CardContent } from "./ui/card"

interface DrugSearchResult {
  id: string
  name: string
  ndcNumber: string
  genericName: string
  brandName: string
  manufacturer: string
  dosageForm: string
  strength: string
  route: string
}

interface DrugSearchComboboxProps {
  onSelect: (drug: DrugIdentification) => void
  disabled?: boolean
}

export default function MedSearch({ onSelect, disabled }: DrugSearchComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [results, setResults] = React.useState<DrugSearchResult[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState("")

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchDrugs(searchQuery)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const searchDrugs = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/search-drugs?q=${encodeURIComponent(query)}&limit=15`)
      const data = await response.json()

      if (data.success) {
        setResults(data.results)
      }
    } catch (error) {
      console.error("[v0] Error searching drugs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelect = (drug: DrugSearchResult) => {
    setSelectedValue(drug.name)
    setOpen(false)
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
    // Reset after selection
    setTimeout(() => {
      setSearchQuery("")
      setSelectedValue("")
      setResults([])
    }, 100)
  }

  return (
      <Command shouldFilter={false} className="border">
        <CommandInput placeholder="Type medicine name or NDC..." value={searchQuery} onValueChange={setSearchQuery} />
        <CommandList>
          {isLoading && (
            <div className="py-6 text-center text-sm text-muted-foreground">Searching FDA database...</div>
          )}
          {!isLoading && searchQuery.length >= 2 && results.length === 0 && (
            <CommandEmpty>No medicines found. Try a different search term.</CommandEmpty>
          )}
          {!isLoading && searchQuery.length < 2 && (
            <div className="pb-2 pt-2 text-center text-sm text-muted-foreground">Type at least 2 characters to search</div>
          )}
          {!isLoading && results.length > 0 && (
            <CommandGroup heading="Medicines">
              {results.map((drug) => (
                <CommandItem
                  key={drug.id}
                  value={drug.id}
                  onSelect={() => handleSelect(drug)}
                  className="flex items-start gap-2 py-1"
                >
                  <Pill className="h-4 w-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{drug.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {drug.genericName && drug.genericName !== drug.name && (
                        <span className="block">{drug.genericName}</span>
                      )}
                      <span className="block">
                        {drug.manufacturer}
                      </span>
                      <span>
                        {drug.route}
                      </span>
                      <span className="block">NDC: {drug.ndcNumber}</span>
                    </div>
                  </div>
                  <Check
                    className={cn("h-4 w-4 shrink-0", selectedValue === drug.name ? "opacity-100" : "opacity-0")}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
  )
}

