"use client"

import { useState } from "react"
import { RotateCcw, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CityPicker } from "./city-picker"
import {
  ADR_OPTIONS,
  ALL_BODY_TYPES,
  CARGO_CATEGORIES,
  EMPTY_FILTERS,
  LOADING_TYPES,
  matchesFilters,
  POPULAR_BODY_TYPES,
  TEMP_MODES,
  TONNAGE_TIERS,
  VOLUME_TIERS,
  type FilterState,
} from "@/lib/cn-kz/filters"
import { useCnKz } from "./store"

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-11 items-center rounded-full border px-4 text-[15px] font-medium transition-colors",
        active
          ? "border-transparent bg-brand text-white"
          : "border-border text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-[15px] font-semibold">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// «Все фильтры» — нижний лист (как на Ламода/kolesa): фасеты чипами + «Показать N».
export function FilterSheet() {
  const { showFilters, closeFilters, filters, setFilters, feedOrders } = useCnKz()
  const [draft, setDraft] = useState<FilterState>(filters)
  const [showAllTypes, setShowAllTypes] = useState(false)

  // Синхронизируем черновик при каждом открытии.
  const [wasOpen, setWasOpen] = useState(false)
  if (showFilters && !wasOpen) {
    setDraft(filters)
    setWasOpen(true)
  }
  if (!showFilters && wasOpen) setWasOpen(false)
  if (!showFilters) return null

  const toggleArr = (key: "bodyTypes" | "loading" | "temp", v: string) =>
    setDraft((d) => {
      const arr = d[key]
      return { ...d, [key]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v] }
    })
  const setOne = (key: "tonnage" | "volume" | "adr" | "cargo" | "destination", v: string) =>
    setDraft((d) => ({ ...d, [key]: d[key] === v ? null : v }))

  const tempApplies = draft.bodyTypes.some((b) => b.includes("реф") || b === "изотерм")
  const count = feedOrders.filter((o) => !o.deal && matchesFilters(o, draft)).length

  return (
    <div
      className="animate-in fade-in absolute inset-0 z-50 flex flex-col bg-black/50"
      onClick={closeFilters}
    >
      <div className="flex-1" />
      <div
        className="animate-in slide-in-from-bottom shadow-key flex max-h-[85%] flex-col rounded-t-3xl bg-card duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="text-base font-semibold">Все фильтры</span>
          <button
            onClick={closeFilters}
            aria-label="Закрыть"
            className="-mr-2 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Куда (город назначения)</h3>
            <CityPicker
              value={draft.destination ?? undefined}
              onChange={(c) => setOne("destination", c)}
              placeholder="Любой город — начните вводить"
            />
            {draft.destination && (
              <button
                onClick={() => setOne("destination", "")}
                className="text-sm font-medium text-muted-foreground"
              >
                Сбросить город
              </button>
            )}
          </div>

          <Group title="Тип кузова">
            {(showAllTypes ? [] : POPULAR_BODY_TYPES).map((t) => (
              <Pill key={t} active={draft.bodyTypes.includes(t)} onClick={() => toggleArr("bodyTypes", t)}>
                {t}
              </Pill>
            ))}
            {!showAllTypes && (
              <button
                onClick={() => setShowAllTypes(true)}
                className="flex h-11 items-center rounded-full border border-dashed border-border px-4 text-[15px] font-medium text-muted-foreground"
              >
                Показать все типы
              </button>
            )}
            {showAllTypes &&
              ALL_BODY_TYPES.map((g) => (
                <div key={g.group} className="w-full space-y-2">
                  <p className="text-sm text-muted-foreground">{g.group}</p>
                  <div className="flex flex-wrap gap-2">
                    {g.items.map((t) => (
                      <Pill key={t} active={draft.bodyTypes.includes(t)} onClick={() => toggleArr("bodyTypes", t)}>
                        {t}
                      </Pill>
                    ))}
                  </div>
                </div>
              ))}
          </Group>

          <Group title="Тип загрузки">
            {LOADING_TYPES.map((t) => (
              <Pill key={t} active={draft.loading.includes(t)} onClick={() => toggleArr("loading", t)}>
                {t}
              </Pill>
            ))}
          </Group>

          <Group title="Грузоподъёмность">
            {TONNAGE_TIERS.map((t) => (
              <Pill key={t} active={draft.tonnage === t} onClick={() => setOne("tonnage", t)}>
                {t}
              </Pill>
            ))}
          </Group>

          <Group title="Объём кузова, м³">
            {VOLUME_TIERS.map((t) => (
              <Pill key={t} active={draft.volume === t} onClick={() => setOne("volume", t)}>
                {t}
              </Pill>
            ))}
          </Group>

          {tempApplies && (
            <Group title="Температурный режим">
              {TEMP_MODES.map((t) => (
                <Pill key={t} active={draft.temp.includes(t)} onClick={() => toggleArr("temp", t)}>
                  {t}
                </Pill>
              ))}
            </Group>
          )}

          <Group title="Опасный груз (ADR)">
            {ADR_OPTIONS.map((t) => (
              <Pill key={t} active={draft.adr === t} onClick={() => setOne("adr", t)}>
                {t}
              </Pill>
            ))}
          </Group>

          <Group title="Категория груза">
            {CARGO_CATEGORIES.map((t) => (
              <Pill key={t} active={draft.cargo === t} onClick={() => setOne("cargo", t)}>
                {t}
              </Pill>
            ))}
          </Group>
        </div>

        <div className="flex flex-col gap-2 border-t border-border p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          <Button
            variant="outline"
            size="lg"
            className="h-12 w-full text-[15px]"
            onClick={() => setDraft(EMPTY_FILTERS)}
          >
            <RotateCcw className="size-4" /> Сбросить
          </Button>
          <Button
            size="xl"
            className="w-full"
            onClick={() => {
              setFilters(draft)
              closeFilters()
            }}
          >
            Показать <span className="tabular-nums">{count}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
