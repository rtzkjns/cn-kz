"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ALL_CITIES } from "@/lib/cn-kz/types"
import { Chip, ChipRow } from "./ui-bits"

// Нормализация: нижний регистр + ё→е, чтобы поиск был предсказуемым.
const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim()

function search(q: string, exclude: string[] = []) {
  const t = norm(q)
  if (!t) return []
  const ex = new Set(exclude)
  const matches = ALL_CITIES.filter((c) => !ex.has(c) && norm(c).includes(t))
  // Сначала города, начинающиеся с запроса, потом остальные; внутри — по алфавиту.
  matches.sort((a, b) => {
    const aStarts = norm(a).startsWith(t)
    const bStarts = norm(b).startsWith(t)
    if (aStarts !== bStarts) return aStarts ? -1 : 1
    return a.localeCompare(b, "ru")
  })
  return matches.slice(0, 10)
}

function Results({
  items,
  onPick,
}: {
  items: string[]
  onPick: (c: string) => void
}) {
  if (items.length === 0) return null
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      {items.map((c) => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className="block w-full border-b border-border/60 px-3 py-2 text-left text-sm last:border-0 hover:bg-muted"
        >
          {c}
        </button>
      ))}
    </div>
  )
}

// Single-select city: search over the full CIS list (no preset chips).
export function CityPicker({
  value,
  onChange,
}: {
  value?: string
  onChange: (c: string) => void
}) {
  const [q, setQ] = useState("")
  const results = search(q)
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Город назначения…"
          className="h-8 pl-7"
        />
      </div>
      <Results
        items={results}
        onPick={(c) => {
          onChange(c)
          setQ("")
        }}
      />
      {value && (
        <ChipRow>
          <Chip active onClick={() => onChange(value)}>
            {value}
          </Chip>
        </ChipRow>
      )}
    </div>
  )
}

// Multi-select cities (carrier watched routes): search to add, chosen shown as removable chips.
export function CityMultiPicker({
  selected,
  onToggle,
}: {
  selected: string[]
  onToggle: (c: string) => void
}) {
  const [q, setQ] = useState("")
  const results = search(q, selected)
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Добавить город…"
          className="h-8 pl-7"
        />
      </div>
      <Results
        items={results}
        onPick={(c) => {
          onToggle(c)
          setQ("")
        }}
      />
      {selected.length > 0 && (
        <ChipRow>
          {selected.map((c) => (
            <Chip key={c} active onClick={() => onToggle(c)}>
              {c} <X className="size-3" />
            </Chip>
          ))}
        </ChipRow>
      )}
    </div>
  )
}
