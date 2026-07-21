"use client"

import { AlertTriangle, BarChart3, Info, Package, Plus, Star, Tag, TrendingUp, Truck, Wallet } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { money, plural } from "./shared"
import { EmptyState, Section } from "./ui-bits"
import { useCnKz } from "./store"

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string
  value: string
  sub?: string
  icon: typeof Package
}) {
  return (
    <div className="surface-glass rounded-2xl p-3">
      <span className="mb-2 flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div className="font-mono-tech text-2xl leading-none font-bold tracking-tight tabular-nums">
        {value}
      </div>
      <div className="mt-1.5 text-sm leading-tight text-muted-foreground">{label}</div>
      {sub && <div className="mt-0.5 text-sm text-muted-foreground/70">{sub}</div>}
    </div>
  )
}

// Simple CSS bar row for a horizontal chart.
function Bar({ label, value, max, suffix, asMoney, neutral }: { label: string; value: number; max: number; suffix?: string; asMoney?: boolean; neutral?: boolean }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono-tech tabular-nums text-foreground">
          {asMoney ? money(value) : suffix ? `${value}${suffix}` : value}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={"h-full rounded-full transition-all " + (neutral ? "bg-foreground/25" : "bg-brand")} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// Компактное пустое состояние ВНУТРИ карточки графика — вместо голого «нет данных».
function ChartEmpty({ icon: Icon, text }: { icon: typeof Package; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="max-w-[15rem] text-sm text-muted-foreground">{text}</p>
    </div>
  )
}

export function AnalyticsScreen() {
  const { myOrders, setTab, push, t } = useCnKz()

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

  // Совсем нет заказов → полноценный иллюстрированный empty с одним лаймовым действием.
  if (myOrders.length === 0) {
    return (
      <div className="flex h-full flex-col">
        <ScreenHeader title={t("Аналитика")} subtitle={t("Ваша логистика в цифрах")} onBack={() => setTab("profile")} />
        <div className="flex-1 overflow-y-auto px-4 pb-24">
          <EmptyState
            icon={BarChart3}
            title={t("Пока нет данных для аналитики")}
            hint={t("Опубликуйте первый заказ — здесь появятся расходы, топ маршрутов и рейтинг перевозчиков.")}
            action={
              <Button size="xl" className="px-8" onClick={() => push({ type: "createOrder" })}>
                <Plus className="size-5" /> {t("Создать заказ")}
              </Button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Аналитика")} subtitle={t("Ваша логистика в цифрах")} onBack={() => setTab("profile")} />

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        {/* Герой-число: общие расходы 32/800 — самый громкий элемент, якорит верх экрана. */}
        <div className="surface-glass rounded-2xl p-4">
          <p className="t-eyebrow">{t("Общие расходы")}</p>
          <p className="t-display mt-1.5 text-brand">{money(spend)}</p>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {completed.length > 0
              ? `${completed.length} ${plural(completed.length, t("завершённый заказ"), t("завершённых заказа"), t("завершённых заказов"))} · ${t("в среднем")} ${money(avgPrice)} ${t("за рейс")}`
              : t("Ещё нет завершённых заказов — расходы появятся после первой сделки")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Kpi label={t("Всего заказов")} value={String(myOrders.length)} icon={Package} />
          <Kpi label={t("Завершено")} value={String(completed.length)} icon={TrendingUp} />
          <Kpi label={t("Средняя цена")} value={money(avgPrice)} sub={t("за рейс")} icon={Tag} />
          <Kpi label={t("В работе")} value={String(active.length)} sub={t("активные сделки")} icon={Truck} />
        </div>

        {/* insights / exceptions — Signal-медальон вместо цветной полоски-бордера */}
        {noOffers > 0 && (
          <div className="surface-glass flex items-start gap-3 rounded-2xl p-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--warn)_16%,transparent)] text-warn">
              <AlertTriangle className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="t-body-strong">
                {noOffers} {plural(noOffers, t("заказ"), t("заказа"), t("заказов"))} {t("без откликов")}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {t("Возможно, цена ниже рынка на этих маршрутах — попробуйте поднять.")}
              </p>
            </div>
          </div>
        )}

        <Section title={t("Расходы по месяцам")}>
          <Card size="sm">
            <CardContent className="space-y-3">
              {months.length === 0 ? (
                <ChartEmpty icon={Wallet} text={t("Расходы появятся после первых завершённых заказов")} />
              ) : (
                months.map(([m, v]) => <Bar key={m} label={m} value={v} max={maxMonth} asMoney />)
              )}
            </CardContent>
          </Card>
        </Section>

        <Section title={t("Топ маршрутов")}>
          <Card size="sm">
            <CardContent className="space-y-3">
              {topRoutes.length === 0 ? (
                <ChartEmpty icon={TrendingUp} text={t("Здесь появятся ваши самые частые маршруты")} />
              ) : (
                topRoutes.map(([r, n]) => <Bar key={r} label={r} value={n} max={maxRoute} suffix={` ${t("зак.")}`} neutral />)
              )}
            </CardContent>
          </Card>
        </Section>

        <Section title={t("Качество")}>
          <div className="grid grid-cols-2 gap-2">
            <Kpi label={t("откликов / заказ")} value={avgOffers} icon={Tag} />
            <Kpi label={t("рейтинг перевозчиков")} value={String(avgCarrierRating)} icon={Star} />
          </div>
        </Section>

        {/* Закрывающая honest-подсказка — заполняет низ полезным контекстом (курс/USD). */}
        <div className="surface-inset flex items-start gap-2.5 rounded-2xl p-4">
          <Info className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-snug text-muted-foreground">
            {t("Показатели считаются автоматически по вашим заказам и сделкам. Оплата в USD, ₸ — ориентировочно.")}
          </p>
        </div>
      </div>
    </div>
  )
}
