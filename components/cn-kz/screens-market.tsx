"use client"

import { useEffect, useState } from "react"
import { Box, Building2, Calendar, Copy, MapPin, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Truck, Wallet, Weight } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { countActive, EMPTY_FILTERS, matchesFilters, POPULAR_BODY_TYPES } from "@/lib/cn-kz/filters"
import type { Order } from "@/lib/cn-kz/types"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { Rating, StatusBadge, deals, kzt, money, plural } from "./shared"
import { Chip, EmptyState, Section, StatStrip, StickyCTA } from "./ui-bits"
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

  // Живая сводка рынка — плотный верх ленты вместо пустоты (anti-empty). Считаем по видимым грузам.
  const uniqueRoutes = new Set(list.map((o) => `${o.origin}→${o.destination}`)).size
  const uniqueShippers = new Set(list.map((o) => o.shipper.id)).size

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

      <StatStrip
        items={[
          { value: list.length, label: "Открытых грузов", icon: Box },
          { value: uniqueRoutes, label: "Направлений", icon: MapPin },
          { value: uniqueShippers, label: "Заказчиков", icon: Building2 },
        ]}
      />

      {/* Тип кузова — основной способ подбора (чипы 44px). Поиск — вспомогательный, приглушён. */}
      <div className="flex flex-wrap items-center gap-2 px-4 pb-2">
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

const paymentLabel = (p: Order["payment"]) => (p === "cash" ? "Наличные" : "Безнал · перевод")

// Одна ячейка 2-колоночной спец-таблицы (anti-empty: пустое место → сканируемая таблица).
function SpecCell({
  icon: Icon,
  label,
  value,
  wide = false,
}: {
  icon: typeof Truck
  label: string
  value: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={"surface-inset rounded-xl px-3.5 py-3 " + (wide ? "col-span-2" : "")}>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon className="size-3.5 shrink-0" />
        <span className="t-eyebrow">{label}</span>
      </div>
      <p className="t-body-strong mt-1.5 tabular-nums">{value}</p>
    </div>
  )
}

// Компактная строка «похожего груза» — заполняет низ экрана реальными данными рынка (anti-empty).
function SimilarRow({ order, onOpen }: { order: Order; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="surface-glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-transform active:scale-[0.99]"
    >
      <div className="flex flex-col items-center pt-0.5">
        <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
        <span className="route-connector my-0.5 h-4" />
        <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="t-h3 truncate">{order.destination}</p>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {order.origin} · {order.truckType}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-mono-tech text-[17px] font-bold tabular-nums">{money(order.priceUsd)}</p>
        <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
          {order.weightKg.toLocaleString("ru-RU")} кг
        </p>
      </div>
    </button>
  )
}

// Read-only market listing (a load posted by another заказчик) — for browsing / rate research.
export function MarketOrderScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, authed, role, openAuth, feedOrders } = useCnKz()
  const order = getOrder(orderId)
  if (!order) return null

  const canClone = authed && role === "shipper"

  // «Похожие грузы на рынке» — то же направление или тот же тип кузова (реальные данные ленты).
  const similar = feedOrders
    .filter(
      (o) =>
        o.id !== order.id &&
        !o.deal &&
        (o.destination === order.destination || o.truckType === order.truckType)
    )
    .slice(0, 3)

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
        {/* Главная карточка груза — плотная: маршрут + груз + мета-пиллы + hero-цена */}
        <div className="surface-glass space-y-4 rounded-2xl p-4">
          {/* Route block — origin blue ring → connector → destination lime ring (единый паттерн) */}
          <div className="flex gap-3">
            <div className="flex flex-col items-center pt-1.5">
              <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
              <span className="route-connector my-1 flex-1" />
              <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-medium text-muted-foreground">{order.origin}</p>
              <p className="t-h2 mt-1 truncate">{order.destination}</p>
            </div>
          </div>

          <p className="text-[15px] text-muted-foreground">{order.cargo}</p>

          {/* Цена — суть этого экрана рыночных цен: hero-блок 32/800 + ориентир ≈₸ */}
          <div className="rounded-xl bg-secondary px-4 py-3">
            <p className="t-eyebrow">Цена заказчика</p>
            <p className="t-display mt-1.5">{money(order.priceUsd)}</p>
            <p className="font-mono-tech mt-1.5 text-sm leading-none text-muted-foreground/80">
              {kzt(order.priceUsd)} · курс ориентировочный
            </p>
          </div>
        </div>

        {/* 2-колоночная спец-таблица — anti-empty: превращаем пустоту в сканируемые характеристики */}
        <div className="grid grid-cols-2 gap-2">
          <SpecCell icon={Weight} label="Вес" value={`${order.weightKg.toLocaleString("ru-RU")} кг`} />
          <SpecCell icon={Box} label="Объём" value={`${order.volumeM3} м³`} />
          <SpecCell icon={Truck} label="Тип кузова" value={order.truckType} />
          <SpecCell icon={Wallet} label="Оплата" value={paymentLabel(order.payment)} />
          <SpecCell icon={Calendar} label="Готов к погрузке" value={order.readyDate} wide />
        </div>

        {order.notes && (
          <div className="surface-inset rounded-xl px-4 py-3">
            <p className="t-eyebrow">Примечание</p>
            <p className="mt-1.5 text-[15px] text-foreground">{order.notes}</p>
          </div>
        )}

        <Section title="Заказчик">
          <div className="surface-glass flex items-center gap-3 rounded-2xl p-4">
            <Avatar name={order.shipper.name} className="size-11 shrink-0 rounded-full text-[15px] font-bold" />
            <div className="min-w-0 flex-1">
              <p className="t-h3 truncate">
                {order.shipper.name}
                {order.shipper.company && (
                  <span className="font-normal text-muted-foreground"> · {order.shipper.company}</span>
                )}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                <Rating value={order.shipper.rating} /> · {deals(order.shipper.dealsCount)}
              </p>
            </div>
            {order.shipper.verified && (
              <StatusBadge tone="info" icon={ShieldCheck}>
                Проверен
              </StatusBadge>
            )}
          </div>
        </Section>

        {similar.length > 0 && (
          <Section title="Похожие грузы на рынке">
            <div className="space-y-2">
              {similar.map((o) => (
                <SimilarRow
                  key={o.id}
                  order={o}
                  onOpen={() => push({ type: "marketOrder", orderId: o.id })}
                />
              ))}
            </div>
          </Section>
        )}

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
