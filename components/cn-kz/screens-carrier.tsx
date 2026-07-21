"use client"

import { useEffect, useMemo, useState } from "react"
import { Boxes, Check, ChevronRight, Heart, MessageCircle, Plus, RefreshCw, RotateCcw, Search, ShieldCheck, SlidersHorizontal, Tag, Truck, X } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MY_FLEET } from "@/lib/cn-kz/mock-data"
import { TRUCK_TYPES, type TruckType } from "@/lib/cn-kz/types"
import { countActive, EMPTY_FILTERS, matchesFilters, POPULAR_BODY_TYPES } from "@/lib/cn-kz/filters"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { CallButton, contactUnlocked, deals, kzt, OfferStatusBadge, plural, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, EmptyState, Section, StatStrip, StickyCTA } from "./ui-bits"
import { useCnKz } from "./store"

// Вместимость лучшей фуры парка — лента скрывает грузы, что не увезти (MVP §4).
const FLEET_MAX_WEIGHT = Math.max(...MY_FLEET.map((t) => t.maxWeightKg))
const FLEET_MAX_VOLUME = Math.max(...MY_FLEET.map((t) => t.maxVolumeM3))
const fitsFleet = (weightKg: number, volumeM3: number) =>
  weightKg <= FLEET_MAX_WEIGHT && volumeM3 <= FLEET_MAX_VOLUME

// Подбор фуры под груз для быстрого «Принять»: сначала по типу+вместимости, иначе любая, что влезает.
const pickTruckFor = (o: { truckType: string; weightKg: number; volumeM3: number }) => {
  const fits = (t: (typeof MY_FLEET)[number]) =>
    t.maxWeightKg >= o.weightKg && t.maxVolumeM3 >= o.volumeM3
  return MY_FLEET.find((t) => t.type === o.truckType && fits(t)) ?? MY_FLEET.find(fits)
}

// Realtime identity made tangible — a pulsing green dot reinforces the live feed (MVP §4).
function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1 text-sm font-medium tracking-wide text-muted-foreground">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
        <span className="relative inline-flex size-1.5 rounded-full bg-brand" />
      </span>
      В эфире
    </span>
  )
}

export function CarrierFeedScreen() {
  const { feedOrders, push, setTab, toggleFavorite, isFavorite, tripDraft, isInTrip, addToTrip, filters, setFilters, openFilters, isSkipped, makeOffer } =
    useCnKz()
  // Сборный рейс: докидывать можно только грузы в тот же город назначения (решение — same destination).
  const tripDest = feedOrders.find((o) => o.id === tripDraft[0])?.destination
  const [showOverCap, setShowOverCap] = useState(false)
  const [q, setQ] = useState("")
  // Скелет загрузки + «потянуть обновить» (жест — нативный; на вебе даём кнопку).
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

  const byType = useMemo(() => {
    const words = q.trim().toLowerCase().replace(/#/g, " ").split(/\s+/).filter(Boolean)
    return feedOrders.filter((o) => {
      if (o.deal) return false
      if (isSkipped(o.id)) return false // «Пропущенные» грузы скрыты из ленты
      if (!matchesFilters(o, filters)) return false
      const hay = `${o.origin} ${o.destination} ${o.cargo} ${o.truckType}`.toLowerCase()
      return words.length === 0 || words.every((w) => hay.includes(w))
    })
  }, [feedOrders, filters, q, isSkipped])
  const hiddenCount = byType.filter((o) => !fitsFleet(o.weightKg, o.volumeM3)).length
  const list = showOverCap
    ? byType
    : byType.filter((o) => fitsFleet(o.weightKg, o.volumeM3))

  // Сводка сверху ленты.
  const available = feedOrders.filter(
    (o) =>
      !o.deal &&
      !isSkipped(o.id) &&
      fitsFleet(o.weightKg, o.volumeM3) &&
      matchesFilters(o, filters)
  ).length
  const myOffers = feedOrders.filter(
    (o) => o.myOfferStatus === "pending" || o.myOfferStatus === "countered"
  ).length
  const activeDeals = feedOrders.filter(
    (o) => o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
  ).length

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Главная"
        subtitle="Все грузы · по всей СНГ"
        action={
          <div className="flex items-center gap-1.5">
            <button
              onClick={refresh}
              aria-label="Обновить ленту"
              className="flex size-11 items-center justify-center -mr-1.5 rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <RefreshCw className={"size-5 " + (loading ? "animate-spin" : "")} />
            </button>
            <LiveBadge />
          </div>
        }
      />

      <StatStrip
        items={[
          {
            value: available,
            label: "Подходящих грузов",
            icon: Boxes,
          },
          {
            value: myOffers,
            label: "Мои отклики",
            icon: Tag,
            accent: true,
            onClick: () => setTab("deals"),
          },
          {
            value: activeDeals,
            label: "Сделки в пути",
            icon: Truck,
            onClick: () => setTab("deals"),
          },
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
            placeholder="Поиск: город, груз или #тег"
            className="h-11 border-transparent bg-muted/40 pl-9 text-base"
          />
        </div>
      </div>

      {hiddenCount > 0 && (
        <button
          onClick={() => setShowOverCap((v) => !v)}
          className="mx-4 mb-2 inline-flex h-11 w-fit items-center gap-1.5 self-start rounded-md bg-secondary px-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
        >
          <Boxes className="size-4 text-brand" />
          {showOverCap
            ? "Скрыть неподходящие"
            : `Не помещаются: ${hiddenCount} — показать всё`}
        </button>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {loading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="surface-glass space-y-3 rounded-2xl p-4">
              <div className="skeleton-shimmer h-4 w-1/2 rounded-lg" />
              <div className="skeleton-shimmer h-6 w-2/3 rounded-lg" />
              <div className="skeleton-shimmer h-14 rounded-lg" />
            </div>
          ))}
        {!loading && list.length === 0 && (
          <EmptyState
            icon={Boxes}
            title="Под ваши фильтры грузов нет"
            hint="Смягчите фильтры или загляните позже — лента обновляется в реальном времени."
            action={
              <Button variant="outline" size="lg" onClick={() => setFilters(EMPTY_FILTERS)}>
                Сбросить фильтры
              </Button>
            }
          />
        )}
        {!loading && list.map((o, i) => (
          <div
            key={o.id}
            className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
            style={{
              animationDelay: `${Math.min(i, 7) * 55}ms`,
              animationDuration: "300ms",
            }}
          >
            <OrderCard
              order={o}
              showMyOffer
              showKzt
              favorited={isFavorite(o.id)}
              onToggleFavorite={() => toggleFavorite(o.id)}
              inTrip={isInTrip(o.id)}
              onAddToTrip={
                tripDraft.length === 0 || o.destination === tripDest
                  ? () => addToTrip(o.id)
                  : undefined
              }
              onQuickAccept={
                pickTruckFor(o)
                  ? () => makeOffer(o.id, "accept", o.priceUsd, pickTruckFor(o)!.id)
                  : undefined
              }
              onClick={() => push({ type: "cargoDetail", orderId: o.id })}
            />
          </div>
        ))}
      </div>
      <TripTray />
    </div>
  )
}

// Док-панель собираемого рейса (над нижней навигацией).
function TripTray() {
  const { tripDraft, feedOrders, push } = useCnKz()
  if (tripDraft.length === 0) return null
  const orders = feedOrders.filter((o) => tripDraft.includes(o.id))
  const w = orders.reduce((s, o) => s + o.weightKg, 0)
  const v = orders.reduce((s, o) => s + o.volumeM3, 0)
  const pct = Math.min(100, Math.round(Math.max(w / FLEET_MAX_WEIGHT, v / FLEET_MAX_VOLUME) * 100))
  const dest = orders[0]?.destination
  return (
    <button
      onClick={() => push({ type: "tripBuilder" })}
      className="shrink-0 w-full border-t border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium tabular-nums">
          Рейс · {orders.length} {plural(orders.length, "груз", "груза", "грузов")} → {dest}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-brand tabular-nums">
          {pct}% фуры <ChevronRight className="size-4" />
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </div>
    </button>
  )
}

function CapBar({ label, used, max, pct, unit }: { label: string; used: number; max: number; pct: number; unit: string }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono-tech tabular-nums text-muted-foreground">
          {used.toLocaleString("ru-RU")} / {max.toLocaleString("ru-RU")} {unit} · {pct}%
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={"h-full rounded-full " + (pct >= 100 ? "bg-warn" : "bg-brand")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// «Сборный рейс» — вместимость фуры + грузы + «ещё по пути» + взять рейс.
export function TripBuilderScreen() {
  const { tripDraft, feedOrders, addToTrip, removeFromTrip, clearTrip, submitTrip, pop } = useCnKz()
  const orders = feedOrders.filter((o) => tripDraft.includes(o.id))
  const w = orders.reduce((s, o) => s + o.weightKg, 0)
  const v = orders.reduce((s, o) => s + o.volumeM3, 0)
  const total = orders.reduce((s, o) => s + o.priceUsd, 0)
  const dest = orders[0]?.destination
  const overCapacity = w > FLEET_MAX_WEIGHT || v > FLEET_MAX_VOLUME
  const remW = FLEET_MAX_WEIGHT - w
  const remV = FLEET_MAX_VOLUME - v
  const suggestions = feedOrders.filter(
    (o) =>
      !tripDraft.includes(o.id) &&
      !o.deal &&
      o.destination === dest &&
      o.weightKg <= remW &&
      o.volumeM3 <= remV
  )

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Сборный рейс"
        subtitle={dest ? `Разные точки → ${dest}` : "Добавьте грузы"}
        onBack={pop}
      />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-0">
        <Card size="sm">
          <CardContent className="space-y-3">
            <CapBar label="Вес" used={w} max={FLEET_MAX_WEIGHT} pct={Math.min(100, Math.round((w / FLEET_MAX_WEIGHT) * 100))} unit="кг" />
            <CapBar label="Объём" used={v} max={FLEET_MAX_VOLUME} pct={Math.min(100, Math.round((v / FLEET_MAX_VOLUME) * 100))} unit="м³" />
          </CardContent>
        </Card>

        <Section title={`Грузы в рейсе · ${orders.length}`}>
          {orders.length === 0 && (
            <p className="text-[15px] text-muted-foreground">
              Пусто. В ленте нажимайте «Добавить в рейс» на грузах в один город.
            </p>
          )}
          <div className="space-y-2">
            {orders.map((o) => (
              <Card key={o.id} size="sm">
                <CardContent className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <Route from={o.origin} to={o.destination} className="text-[15px]" />
                    <p className="line-clamp-1 text-[15px] text-muted-foreground">
                      {o.cargo} · {o.weightKg.toLocaleString("ru-RU")} кг · {o.volumeM3} м³
                    </p>
                  </div>
                  <span className="font-mono-tech text-[15px] font-semibold tabular-nums">{money(o.priceUsd)}</span>
                  <button
                    onClick={() => removeFromTrip(o.id)}
                    aria-label="Убрать"
                    className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-destructive active:scale-[0.96]"
                  >
                    <X className="size-5" />
                  </button>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {suggestions.length > 0 && (
          <Section title="Ещё по пути">
            <div className="space-y-2">
              {suggestions.map((o) => (
                <Card
                  key={o.id}
                  size="sm"
                  className="cursor-pointer hover:ring-foreground/20"
                  onClick={() => addToTrip(o.id)}
                >
                  <CardContent className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <Route from={o.origin} to={o.destination} className="text-[15px]" />
                      <p className="line-clamp-1 text-[15px] text-muted-foreground">
                        {o.cargo} · {o.weightKg.toLocaleString("ru-RU")} кг
                      </p>
                    </div>
                    <span className="font-mono-tech text-[15px] font-semibold tabular-nums">{money(o.priceUsd)}</span>
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-md border border-border text-brand">
                      <Plus className="size-5" />
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {orders.length > 0 && (
          <StickyCTA>
            <div className="flex items-center justify-between text-[15px]">
              <span className="text-muted-foreground">Заработок за рейс</span>
              <span className="font-mono-tech text-lg font-bold tabular-nums">{money(total)}</span>
            </div>
            {overCapacity && (
              <p className="text-sm text-warn">
                Рейс превышает вместимость фуры — уберите груз, чтобы взять рейс
              </p>
            )}
            <Button size="xl" className="w-full" disabled={overCapacity} onClick={submitTrip}>
              Взять рейс · {orders.length} {plural(orders.length, "груз", "груза", "грузов")}
            </Button>
            <button
              onClick={() => {
                clearTrip()
                pop()
              }}
              className="flex h-11 w-full items-center justify-center text-sm text-muted-foreground hover:text-foreground"
            >
              Очистить рейс
            </button>
          </StickyCTA>
        )}
      </div>
    </div>
  )
}

// «Избранное» — грузы, которые перевозчик лайкнул в ленте, чтобы вернуться позже.
export function FavoritesScreen() {
  const { feedOrders, push, toggleFavorite, isFavorite, favorites, makeOffer } = useCnKz()
  const list = feedOrders.filter((o) => favorites.includes(o.id) && !o.deal)

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Избранное"
        subtitle={`${list.length} ${plural(list.length, "груз", "груза", "грузов")} сохранено`}
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {list.length === 0 && (
          <EmptyState
            icon={Heart}
            title="Пока пусто"
            hint="Нажимайте ♥ на грузах в ленте — они появятся здесь, чтобы вернуться позже."
          />
        )}
        {list.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            showMyOffer
            showKzt
            favorited={isFavorite(o.id)}
            onToggleFavorite={() => toggleFavorite(o.id)}
            onQuickAccept={
              pickTruckFor(o)
                ? () => makeOffer(o.id, "accept", o.priceUsd, pickTruckFor(o)!.id)
                : undefined
            }
            onClick={() => push({ type: "cargoDetail", orderId: o.id })}
          />
        ))}
      </div>
    </div>
  )
}

export function CargoDetailScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, setTab, makeOffer, skipOrder, confirmCounter, declineMyOffer, clearMyOffer, showToast } =
    useCnKz()
  const order = getOrder(orderId)
  const [counter, setCounter] = useState("")
  const [declineConfirm, setDeclineConfirm] = useState(false)
  // По умолчанию — фура парка под тип груза, иначе первая.
  const [truckId, setTruckId] = useState(
    () => MY_FLEET.find((t) => order && t.type === order.truckType)?.id ?? MY_FLEET[0].id
  )
  if (!order) return null

  const alreadyOffered = !!order.myOfferStatus
  const selectedTruck = MY_FLEET.find((t) => t.id === truckId) ?? MY_FLEET[0]
  const overCapacity =
    order.weightKg > selectedTruck.maxWeightKg || order.volumeM3 > selectedTruck.maxVolumeM3

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            Груз{" "}
            <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-0">
        <Card size="sm">
          <CardContent className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 gap-3">
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
              <div className="shrink-0 text-right">
                <div className="font-mono-tech text-[28px] leading-none font-bold tabular-nums text-foreground">
                  {money(order.priceUsd)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground tabular-nums">
                  {kzt(order.priceUsd)} · оплата в USD
                </div>
              </div>
            </div>
            <p className="text-[15px] text-muted-foreground">{order.cargo}</p>
            <DetailRow label="Тип авто" value={order.truckType} />
            <DetailRow
              label="Вес / объём"
              value={`${order.weightKg.toLocaleString("ru-RU")} кг · ${order.volumeM3} м³`}
            />
            <DetailRow label="Готов к погрузке" value={order.readyDate} />
            {order.pickupPoint && (
              <DetailRow label="Точка погрузки" value={order.pickupPoint} />
            )}
            {order.pickupPhone && (
              <DetailRow
                label="Контакт погрузки"
                value={
                  contactUnlocked({ offerStatus: order.myOfferStatus, hasDeal: !!order.deal })
                    ? order.pickupPhone
                    : "откроется после отклика"
                }
              />
            )}
            <DetailRow label="Адрес доставки" value={order.address} />
            {order.notes && <DetailRow label="Примечание" value={order.notes} />}
            {order.safePay !== false && (
              <div className="surface-inset mt-1 flex items-start gap-1.5 rounded-xl px-2.5 py-2 text-sm text-foreground">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" /> Безопасная сделка:
                заказчик проверен по БИН, переписка и фото сохраняются. Берите аванс на счёт компании
                по БИН, не на личную карту.
              </div>
            )}
          </CardContent>
        </Card>

        <Section title="Заказчик">
          <Card size="sm">
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Avatar name={order.shipper.name} className="size-9" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">
                    {order.shipper.name}
                    {order.shipper.company && (
                      <span className="text-muted-foreground">
                        {" "}
                        · {order.shipper.company}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <Rating value={order.shipper.rating} /> ·{" "}
                    {deals(order.shipper.dealsCount)}
                  </p>
                </div>
                {/* Чат остаётся закрытым до сделки (§5) */}
                <Button
                  size="icon-touch"
                  variant="outline"
                  onClick={() =>
                    showToast(
                      order.deal
                        ? "Открываю чат…"
                        : "Чат откроется после создания сделки"
                    )
                  }
                  aria-label="Чат"
                >
                  <MessageCircle />
                </Button>
              </div>
              {/* Номер открывается только при живом отклике или сделке (§5) */}
              {contactUnlocked({ offerStatus: order.myOfferStatus, hasDeal: !!order.deal }) ? (
                <CallButton phone={order.shipper.phone} className="w-full" />
              ) : (
                <p className="text-sm text-muted-foreground">
                  Номер заказчика откроется после отклика.
                </p>
              )}
            </CardContent>
          </Card>
        </Section>

        {order.myOfferStatus && (
          <Card
            size="sm"
            className={order.myOfferStatus === "accepted" ? "surface-glass-brand" : ""}
          >
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[15px] text-muted-foreground">Ваш отклик</span>
                <OfferStatusBadge status={order.myOfferStatus} />
              </div>

              {order.myOfferStatus === "pending" && (
                <>
                  <DetailRow
                    label="Ваша цена"
                    value={money(order.myOfferPriceUsd ?? order.priceUsd)}
                  />
                  {order.myOfferTruck && (
                    <DetailRow
                      label="Ваша фура"
                      value={`${order.myOfferTruck.type} · ${order.myOfferTruck.plate}`}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">Ждём ответа заказчика…</p>
                </>
              )}

              {order.myOfferStatus === "countered" && (
                <>
                  <DetailRow label="Ваша цена" value={money(order.myOfferPriceUsd ?? 0)} />
                  <DetailRow
                    label="Встречная заказчика"
                    value={money(order.myCounterPriceUsd ?? 0)}
                  />
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="lg"
                      className="flex-1 bg-[var(--success)] text-white hover:bg-[var(--success-strong)]"
                      onClick={() => confirmCounter(order.id)}
                    >
                      <Check className="size-4" /> Согласиться {money(order.myCounterPriceUsd ?? 0)}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className={declineConfirm ? "border-destructive text-destructive" : ""}
                      onClick={() => {
                        if (declineConfirm) {
                          declineMyOffer(order.id)
                          setDeclineConfirm(false)
                        } else {
                          setDeclineConfirm(true)
                        }
                      }}
                    >
                      {declineConfirm ? "Точно?" : "Отклонить"}
                    </Button>
                  </div>
                </>
              )}

              {(order.myOfferStatus === "rejected" ||
                order.myOfferStatus === "expired") && (
                <>
                  <p className="text-sm text-muted-foreground">
                    {order.myOfferStatus === "rejected"
                      ? "Отклик снят или отклонён."
                      : "Срок отклика истёк."}
                  </p>
                  {/* Повторный отклик: сбрасываем статус — снова появляется панель ставки (§7) */}
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full"
                    onClick={() => clearMyOffer(order.id)}
                  >
                    <RotateCcw className="size-4" /> Откликнуться заново
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {order.myOfferStatus === "accepted" && (
          <StickyCTA>
            <Button
              size="xl"
              className="w-full"
              onClick={() => {
                setTab("deals")
                push({ type: "deal", orderId: order.id })
              }}
            >
              <Truck className="size-5" /> Открыть сделку
            </Button>
          </StickyCTA>
        )}

        {!alreadyOffered && (
          <StickyCTA>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">Фура из парка</p>
              <ChipRow>
                {MY_FLEET.map((t) => (
                  <Chip key={t.id} active={truckId === t.id} onClick={() => setTruckId(t.id)}>
                    {t.type} · {t.plate}
                  </Chip>
                ))}
              </ChipRow>
              {overCapacity && (
                <p className="text-sm text-warn">
                  Груз превышает вместимость этой фуры — выберите другую
                </p>
              )}
            </div>
            <Button
              size="xl"
              className="w-full bg-[var(--success)] text-white hover:bg-[var(--success-strong)]"
              disabled={overCapacity}
              onClick={() => makeOffer(order.id, "accept", order.priceUsd, truckId)}
            >
              <Check className="size-5" /> Принять цену {money(order.priceUsd)}
            </Button>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={counter}
                onChange={(e) => setCounter(e.target.value)}
                placeholder="Своя цена, $"
                className="h-12 text-base tabular-nums"
              />
              <Button
                variant="outline"
                size="lg"
                className="h-12 shrink-0"
                disabled={!counter || Number(counter) <= 0 || overCapacity}
                onClick={() => makeOffer(order.id, "counter", Number(counter), truckId)}
              >
                Назвать цену
              </Button>
            </div>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => { skipOrder(order.id); pop() }}
            >
              Пропустить груз
            </Button>
          </StickyCTA>
        )}
      </div>
    </div>
  )
}
