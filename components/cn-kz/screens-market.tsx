"use client"

import { useEffect, useState } from "react"
import { Phone, RefreshCw, Search, SlidersHorizontal } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { countActive, EMPTY_FILTERS, matchesFilters, POPULAR_BODY_TYPES } from "@/lib/cn-kz/filters"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { Rating, Route, deals, money, plural } from "./shared"
import { Chip, DetailRow, EmptyState, Section } from "./ui-bits"
import { useCnKz } from "./store"

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-[11px] font-medium tracking-wide text-muted-foreground">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
      </span>
      В эфире
    </span>
  )
}

// «Главная» — весь маркетплейс грузов (все открытые заказы), как на kolesa/OLX.
export function MarketFeedScreen() {
  const { feedOrders, push, filters, setFilters, openFilters } = useCnKz()
  const [q, setQ] = useState("")
  // Короткий скелет загрузки — под обещание «Realtime лента». refresh() = «потянуть обновить».
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    if (!loading) return
    const t = setTimeout(() => setLoading(false), 550)
    return () => clearTimeout(t)
  }, [loading])
  const refresh = () => setLoading(true)

  const toggleBody = (t: string) =>
    setFilters({
      ...filters,
      bodyTypes: filters.bodyTypes.includes(t)
        ? filters.bodyTypes.filter((x) => x !== t)
        : [...filters.bodyTypes, t],
    })

  const words = q.trim().toLowerCase().replace(/#/g, " ").split(/\s+/).filter(Boolean)
  const list = feedOrders.filter((o) => {
    if (o.deal) return false
    if (!matchesFilters(o, filters)) return false
    const hay = `${o.origin} ${o.destination} ${o.cargo} ${o.truckType}`.toLowerCase()
    return words.length === 0 || words.every((w) => hay.includes(w))
  })

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Главная"
        subtitle={`${list.length} ${plural(list.length, "груз", "груза", "грузов")} на маршруте · по всей СНГ`}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={refresh}
              aria-label="Обновить ленту"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCw className={"size-4 " + (loading ? "animate-spin" : "")} />
            </button>
            <LiveBadge />
          </div>
        }
      />

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Город, груз или #тег…  #алматы #тент"
            className="h-9 pl-7"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
        {POPULAR_BODY_TYPES.map((t) => (
          <Chip key={t} active={filters.bodyTypes.includes(t)} onClick={() => toggleBody(t)}>
            {t}
          </Chip>
        ))}
        <button
          onClick={openFilters}
          className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <SlidersHorizontal className="size-3.5" />
          Все фильтры{countActive(filters) > 0 ? ` · ${countActive(filters)}` : ""}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="surface-glass animate-pulse space-y-3 rounded-md p-4">
              <div className="h-4 w-1/2 rounded bg-muted" />
              <div className="h-6 w-2/3 rounded bg-muted" />
              <div className="h-14 rounded bg-muted" />
            </div>
          ))}
        {!loading && list.length === 0 && (
          <EmptyState
            icon={Search}
            title="Ничего не найдено"
            hint="Попробуйте другой город или сбросьте фильтры."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQ("")
                  setFilters(EMPTY_FILTERS)
                }}
              >
                Сбросить фильтры
              </Button>
            }
          />
        )}
        {!loading &&
          list.map((o, i) => (
            <div
              key={o.id}
              className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
              style={{ animationDelay: `${Math.min(i, 7) * 50}ms`, animationDuration: "300ms" }}
            >
              <OrderCard browse order={o} onClick={() => push({ type: "marketOrder", orderId: o.id })} />
            </div>
          ))}
      </div>
    </div>
  )
}

// Read-only market listing (a load posted by another заказчик) — for browsing / rate research.
export function MarketOrderScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, authed, openAuth } = useCnKz()
  const order = getOrder(orderId)
  if (!order) return null

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            Груз <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        <Card size="sm">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Route from={order.origin} to={order.destination} />
              <span className="font-mono-tech text-base font-semibold text-foreground">
                {money(order.priceUsd)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{order.cargo}</p>
            <DetailRow label="Тип авто" value={order.truckType} />
            <DetailRow
              label="Вес / объём"
              value={`${order.weightKg.toLocaleString("ru-RU")} кг · ${order.volumeM3} м³`}
            />
            <DetailRow label="Готов к погрузке" value={order.readyDate} />
          </CardContent>
        </Card>

        <Section title="Заказчик">
          <Card size="sm">
            <CardContent className="flex items-center gap-2">
              <Avatar name={order.shipper.name} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {order.shipper.name}
                  {order.shipper.company && (
                    <span className="text-muted-foreground"> · {order.shipper.company}</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Rating value={order.shipper.rating} /> · {deals(order.shipper.dealsCount)}
                </p>
              </div>
              <Phone className="size-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Section>

        <p className="px-1 text-center text-[11px] text-muted-foreground">
          {authed
            ? "Заказ другого заказчика · только просмотр (рыночные цены и маршруты)"
            : "Контакты и точный адрес скрыты — войдите, чтобы связаться и откликнуться"}
        </p>
      </div>

      {!authed && (
        <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card p-3">
          <Button className="w-full" onClick={openAuth}>
            Войти, чтобы откликнуться
          </Button>
        </div>
      )}
    </div>
  )
}
