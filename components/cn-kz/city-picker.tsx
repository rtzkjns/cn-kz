"use client"

import { useState } from "react"
import { ChevronDown, ChevronLeft, MapPin, MapPinOff, Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { ALL_CITIES } from "@/lib/cn-kz/types"
import { useCnKz } from "./store"
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

// Строка города в списке результатов/популярных — с ведущей булавкой для сканируемости.
function CityRow({ city, onPick }: { city: string; onPick: (c: string) => void }) {
  return (
    <button
      onClick={() => onPick(city)}
      className="flex h-12 w-full items-center gap-3 px-3.5 text-left text-base transition-colors hover:bg-muted active:bg-muted"
    >
      <MapPin className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{city}</span>
    </button>
  )
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
    <div className="surface-glass divide-y divide-border overflow-hidden rounded-2xl">
      {items.map((c) => (
        <CityRow key={c} city={c} onPick={onPick} />
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
  const { t } = useCnKz()
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
        className="flex h-14 w-full items-center gap-2.5 rounded-lg bg-secondary px-4 text-base"
      >
        <MapPin className="size-5 shrink-0 text-muted-foreground" />
        <span className={"truncate " + (value ? "text-foreground" : "text-muted-foreground")}>
          {value || t(placeholder)}
        </span>
        <ChevronDown className="ml-auto size-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="animate-in fade-in absolute inset-0 z-50 flex flex-col bg-background duration-150">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <button
              onClick={() => setOpen(false)}
              aria-label={t("Назад")}
              className="-ml-2 flex size-11 items-center justify-center text-muted-foreground"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="text-base font-semibold">{t("Выберите город")}</span>
          </div>
          <div className="px-4 py-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Введите город…")}
                className="h-14 rounded-lg border-0 bg-secondary pl-11 text-base"
              />
            </div>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto px-4 pb-6">
            {q ? (
              results.length === 0 ? (
                <div className="flex flex-col items-center gap-2 pt-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <MapPinOff className="size-6" />
                  </span>
                  <p className="text-base font-semibold">{t("Город не найден")}</p>
                  <p className="max-w-[16rem] text-sm text-muted-foreground">
                    {t("Проверьте написание или попробуйте соседний крупный город.")}
                  </p>
                </div>
              ) : (
                <Results items={results} onPick={pick} />
              )
            ) : (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">{t("Недавние")}</p>
                  <div className="flex flex-wrap gap-2">
                    {["Алматы", "Астана"].map((c) => (
                      <Chip key={c} onClick={() => pick(c)}>
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 pt-10 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Search className="size-6" />
                  </span>
                  <p className="text-[15px] font-semibold text-foreground">
                    {t("Из любой точки — в любую")}
                  </p>
                  <p className="max-w-[16rem] text-sm text-muted-foreground">
                    {t("Китай → СНГ или внутри СНГ. Начните вводить город назначения.")}
                  </p>
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
  const { t } = useCnKz()
  const [q, setQ] = useState("")
  const results = search(q, selected)
  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("Добавить город…")}
          className="h-14 rounded-lg border-0 bg-secondary pl-11 text-base"
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
