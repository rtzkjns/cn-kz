"use client"

import { useEffect, useState } from "react"
import { Copy, RefreshCw, Search, SlidersHorizontal } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { countActive, EMPTY_FILTERS, matchesFilters, POPULAR_BODY_TYPES } from "@/lib/cn-kz/filters"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { Rating, deals, money, plural } from "./shared"
import { Chip, DetailRow, EmptyState, Section, StickyCTA } from "./ui-bits"
import { useCnKz } from "./store"

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-xs font-medium tracking-wide text-muted-foreground">
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
  const { feedOrders, push, filters, setFilters, openFilters, authed, role } = useCnKz()
  // Для авторизованного заказчика эта вкладка = «Рынок» (исследование цен); для гостя/перевозчика — домашняя «Главная».
  const isMarketTab = authed && role === "shipper"
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
        title={isMarketTab ? "Рынок" : "Главная"}
        subtitle={`Рынок цен и маршрутов · ${list.length} ${plural(list.length, "открытый груз", "открытых груза", "открытых грузов")} по СНГ`}
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={refresh}
              aria-label="Обновить ленту"
              className="-mr-1.5 flex size-11 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
            >
              <RefreshCw className={"size-5 " + (loading ? "animate-spin" : "")} />
            </button>
            <LiveBadge />
          </div>
        }
      />

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Город, груз или #тег…  #алматы #тент"
            className="h-11 border-transparent bg-muted/40 pl-9 text-base"
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
          className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <SlidersHorizontal className="size-4" />
          Все фильтры{countActive(filters) > 0 ? ` · ${countActive(filters)}` : ""}
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="surface-glass space-y-3 rounded-2xl p-4">
              <div className="skeleton-shimmer h-4 w-1/2 rounded" />
              <div className="skeleton-shimmer h-6 w-2/3 rounded" />
              <div className="skeleton-shimmer h-14 rounded" />
            </div>
          ))}
        {!loading && list.length === 0 && (
          <EmptyState
            icon={Search}
            title="Ничего не найдено"
            hint="Попробуйте другой город или сбросьте фильтры."
            action={
              <Button
                variant="secondary"
                className="h-11"
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
  const { getOrder, pop, push, authed, role, openAuth } = useCnKz()
  const order = getOrder(orderId)
  if (!order) return null

  const canClone = authed && role === "shipper"

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

      <div className="flex-1 space-y-3 overflow-y-auto px-4">
        <Card size="sm">
          <CardContent className="space-y-3">
            {/* Route-rail — origin muted, destination bold (подпись бренда, как в OrderCard) */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-2">
                <span className="size-1.5 rounded-full bg-muted-foreground/60" />
                <span className="my-1 w-px flex-1 bg-gradient-to-b from-border to-brand/50" />
                <span className="size-2 rounded-full bg-brand ring-4 ring-brand/15" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-muted-foreground">
                  {order.origin}
                </p>
                <p className="mt-0.5 truncate text-[22px] leading-tight font-bold tracking-tight">
                  {order.destination}
                </p>
              </div>
            </div>

            <p className="text-[15px] text-muted-foreground">{order.cargo}</p>

            {/* Цена — суть этого экрана рыночных цен: hero-блок */}
            <div className="rounded-xl bg-secondary px-4 py-3">
              <p className="t-eyebrow text-muted-foreground">Цена заказчика</p>
              <p className="font-mono-tech mt-1.5 text-[28px] leading-none font-bold tracking-tight tabular-nums">
                {money(order.priceUsd)}
              </p>
            </div>

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
            <CardContent className="flex items-center gap-3">
              <Avatar name={order.shipper.name} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">
                  {order.shipper.name}
                  {order.shipper.company && (
                    <span className="text-muted-foreground"> · {order.shipper.company}</span>
                  )}
                </p>
                <p className="text-sm text-muted-foreground">
                  <Rating value={order.shipper.rating} /> · {deals(order.shipper.dealsCount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Section>

        <p className="px-1 text-center text-sm text-muted-foreground">
          {authed
            ? "Заказ другого заказчика · только просмотр (рыночные цены и маршруты)"
            : "Контакты и точный адрес скрыты — войдите, чтобы связаться и откликнуться"}
        </p>

        {!authed ? (
          <StickyCTA>
            <Button size="xl" className="w-full" onClick={openAuth}>
              Войти, чтобы откликнуться
            </Button>
          </StickyCTA>
        ) : canClone ? (
          <StickyCTA>
            <Button
              size="xl"
              className="w-full"
              onClick={() => push({ type: "createOrder", prefillFrom: order.id })}
            >
              <Copy className="size-5" /> Создать похожий заказ
            </Button>
          </StickyCTA>
        ) : null}
      </div>
    </div>
  )
}
