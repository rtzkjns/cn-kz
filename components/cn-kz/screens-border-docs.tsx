"use client"

import { useState } from "react"
import { Check } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"

// PRD §9 — Чеклист документов для границы. Информационный экран, файлы НЕ хранятся.
// Состояние чекбоксов — локально на устройстве (useState), необязательно, ничего не блокирует.
const ITEMS = [
  { id: "cmr", label: "CMR", hint: "Международная товарно-транспортная накладная" },
  { id: "invoice", label: "Commercial Invoice", hint: "Коммерческий инвойс на груз" },
  { id: "packing", label: "Packing List", hint: "Упаковочный лист" },
  { id: "tir", label: "TIR Carnet / транзитная декларация", hint: "Книжка МДП или транзитная декларация" },
  { id: "phyto", label: "Фитосанитарный сертификат", hint: "Для скоропорта и растительной продукции" },
  { id: "passport", label: "Паспорт водителя + виза КЗ", hint: "Документы водителя для пересечения границы" },
] as const

type ItemState = "todo" | "done" | "skip"

export function BorderDocsScreen({ orderId }: { orderId: string }) {
  const { pop, getOrder } = useCnKz()
  const order = getOrder(orderId)
  const [state, setState] = useState<Record<string, ItemState>>({})

  const get = (id: string): ItemState => state[id] ?? "todo"
  const toggleDone = (id: string) =>
    setState((s) => ({ ...s, [id]: get(id) === "done" ? "todo" : "done" }))
  const toggleSkip = (id: string) =>
    setState((s) => ({ ...s, [id]: get(id) === "skip" ? "todo" : "skip" }))

  const ready = ITEMS.filter((i) => get(i.id) !== "todo").length

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Документы для границы"
        subtitle={order ? `${order.origin} → ${order.destination}` : undefined}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        <p className="text-xs text-muted-foreground">
          Что иметь при себе перед границей. Список для памяти — файлы не загружаются, отметки
          хранятся только на этом устройстве и ничего не блокируют. Ненужное можно отметить.
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Отмечено</span>
          <span className="font-mono-tech text-foreground tabular-nums">
            {ready} / {ITEMS.length}
          </span>
        </div>

        <div className="space-y-2">
          {ITEMS.map((it) => {
            const st = get(it.id)
            return (
              <Card key={it.id} size="sm">
                <CardContent className="flex items-center gap-3">
                  <button
                    onClick={() => toggleDone(it.id)}
                    aria-label={st === "done" ? "Снять отметку" : "Отметить"}
                    className={`flex size-6 shrink-0 items-center justify-center rounded-md border transition-colors active:scale-95 ${
                      st === "done"
                        ? "border-transparent bg-[var(--success)] text-white"
                        : "border-input text-transparent"
                    }`}
                  >
                    <Check className="size-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        st === "skip" ? "text-muted-foreground line-through" : ""
                      }`}
                    >
                      {it.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{it.hint}</p>
                  </div>
                  <button
                    onClick={() => toggleSkip(it.id)}
                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                      st === "skip"
                        ? "border-brand/40 bg-brand/15 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {st === "skip" ? "не нужен" : "не нужен?"}
                  </button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
