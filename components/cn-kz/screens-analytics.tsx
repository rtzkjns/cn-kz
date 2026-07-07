"use client"

import { useState } from "react"
import { AlertTriangle, Clock, Package, Star, Tag, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { money } from "./shared"
import { Chip, ChipRow, Section } from "./ui-bits"
import { useCnKz } from "./store"

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: typeof Package
  accent?: boolean
}) {
  return (
    <div className="surface-glass rounded-md p-3">
      <span
        className={
          "mb-2 flex size-7 items-center justify-center rounded-[5px] " +
          (accent ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground")
        }
      >
        <Icon className="size-3.5" />
      </span>
      <div className={"font-mono-tech text-xl leading-none font-bold tracking-tight " + (accent ? "text-brand" : "")}>
        {value}
      </div>
      <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-[10px] text-muted-foreground/70">{sub}</div>}
    </div>
  )
}

// Simple CSS bar row for a horizontal chart.
function Bar({ label, value, max, suffix }: { label: string; value: number; max: number; suffix?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono-tech text-foreground">{suffix ? `${value}${suffix}` : value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function AnalyticsScreen() {
  const { myOrders } = useCnKz()
  const [period, setPeriod] = useState("all")

  const completed = myOrders.filter((o) => o.deal?.status === "completed")
  const active = myOrders.filter(
    (o) => o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
  )
  const spend = completed.reduce((s, o) => s + (o.deal?.agreedPriceUsd ?? 0), 0)
  const avgPrice = completed.length ? Math.round(spend / completed.length) : 0

  const withOffers = myOrders.filter((o) => o.offers.length > 0)
  const avgOffers = withOffers.length
    ? (withOffers.reduce((n, o) => n + o.offers.length, 0) / withOffers.length).toFixed(1)
    : "0"
  const ratings = completed.map((o) => o.deal!.carrier.rating)
  const avgCarrierRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—"
  const onTime = 96

  // Top destinations across all orders.
  const routeCount: Record<string, number> = {}
  myOrders.forEach(
    (o) => (routeCount[`${o.origin} → ${o.destination}`] = (routeCount[`${o.origin} → ${o.destination}`] || 0) + 1)
  )
  const topRoutes = Object.entries(routeCount).sort((a, b) => b[1] - a[1]).slice(0, 4)
  const maxRoute = Math.max(1, ...topRoutes.map((r) => r[1]))

  // Spend by month.
  const byMonth: Record<string, number> = {}
  completed.forEach((o) => {
    const m = o.completedAt || "—"
    byMonth[m] = (byMonth[m] || 0) + (o.deal?.agreedPriceUsd ?? 0)
  })
  const months = Object.entries(byMonth)
  const maxMonth = Math.max(1, ...months.map((m) => m[1]))

  const noOffers = myOrders.filter(
    (o) => (o.status === "published" || o.status === "bidding") && o.offers.length === 0
  ).length

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Аналитика" subtitle="Ваша логистика в цифрах" />

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <ChipRow>
          <Chip active={period === "all"} onClick={() => setPeriod("all")}>Всё время</Chip>
          <Chip active={period === "30"} onClick={() => setPeriod("30")}>30 дней</Chip>
          <Chip active={period === "q"} onClick={() => setPeriod("q")}>Квартал</Chip>
        </ChipRow>

        <div className="grid grid-cols-2 gap-2">
          <Kpi label="Всего заказов" value={String(myOrders.length)} icon={Package} />
          <Kpi label="Завершено" value={String(completed.length)} sub={`${active.length} в работе`} icon={TrendingUp} />
          <Kpi label="Общие расходы" value={money(spend)} icon={Tag} accent />
          <Kpi label="Средняя цена" value={money(avgPrice)} sub="за рейс" icon={Tag} />
        </div>

        {/* insights / exceptions */}
        {noOffers > 0 && (
          <Card size="sm" className="ring-amber-500/30">
            <CardContent className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div className="text-sm">
                <p className="font-medium">{noOffers} заказ(а) без откликов</p>
                <p className="text-xs text-muted-foreground">
                  Возможно, цена ниже рынка на этих маршрутах — попробуйте поднять.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Section title="Расходы по месяцам">
          <Card size="sm">
            <CardContent className="space-y-3">
              {months.length === 0 && <p className="text-sm text-muted-foreground">Нет завершённых заказов</p>}
              {months.map(([m, v]) => (
                <Bar key={m} label={m} value={v} max={maxMonth} suffix="" />
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="Топ маршрутов">
          <Card size="sm">
            <CardContent className="space-y-3">
              {topRoutes.map(([r, n]) => (
                <Bar key={r} label={r} value={n} max={maxRoute} suffix=" зак." />
              ))}
            </CardContent>
          </Card>
        </Section>

        <Section title="Качество">
          <div className="grid grid-cols-3 gap-2">
            <Kpi label="откликов / заказ" value={avgOffers} icon={Tag} />
            <Kpi label="рейтинг перевозчиков" value={String(avgCarrierRating)} icon={Star} />
            <Kpi label="вовремя" value={`${onTime}%`} icon={Clock} accent />
          </div>
        </Section>

      </div>
    </div>
  )
}
