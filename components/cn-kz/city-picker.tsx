"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ALL_CITIES, POPULAR_CITIES } from "@/lib/cn-kz/types"
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
          className="flex h-12 w-full items-center border-b border-border/60 px-3 text-left text-base last:border-0 hover:bg-muted"
        >
          {c}
        </button>
      ))}
    </div>
  )
}

// Single-select city — tap to open a full-screen picker (search + недавние + популярные).
export function CityPicker({
  value,
  onChange,
  placeholder = "Выберите город",
}: {
  value?: string
  onChange: (c: string) => void
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const results = search(q)
  const pick = (c: string) => {
    onChange(c)
    setOpen(false)
    setQ("")
  }
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-12 w-full items-center justify-between rounded-md border border-border bg-card px-3 text-base"
      >
        <span className={value ? "text-foreground" : "text-muted-foreground"}>
          {value || placeholder}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <div className="animate-in fade-in absolute inset-0 z-50 flex flex-col bg-background duration-150">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <button onClick={() => setOpen(false)} aria-label="Назад">
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-base font-semibold">Выберите город</span>
          </div>
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Введите город…"
                className="h-12 pl-8 text-base"
              />
            </div>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6">
            {q ? (
              <div className="overflow-hidden rounded-lg border border-border">
                {results.length === 0 && (
                  <p className="px-3 py-4 text-base text-muted-foreground">Ничего не найдено</p>
                )}
                {results.map((c) => (
                  <button
                    key={c}
                    onClick={() => pick(c)}
                    className="flex h-12 w-full items-center border-b border-border/60 px-3 text-left text-base last:border-0 hover:bg-muted"
                  >
                    {c}
                  </button>
                ))}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Недавние</p>
                  <div className="flex flex-wrap gap-2">
                    {["Алматы", "Астана"].map((c) => (
                      <Chip key={c} onClick={() => pick(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Популярные города</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_CITIES.map((c) => (
                      <Chip key={c} onClick={() => pick(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
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
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Добавить город…"
          className="h-11 pl-8 text-base"
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
