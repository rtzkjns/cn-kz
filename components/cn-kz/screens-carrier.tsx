"use client"

import { useMemo, useState } from "react"
import { Boxes, Check, Phone, Tag, Truck } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MY_FLEET } from "@/lib/cn-kz/mock-data"
import { TRUCK_TYPES, type TruckType } from "@/lib/cn-kz/types"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { deals, OfferStatusBadge, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, Section, StatStrip } from "./ui-bits"
import { useCnKz } from "./store"

// Вместимость лучшей фуры парка — лента скрывает грузы, что не увезти (MVP §4).
const FLEET_MAX_WEIGHT = Math.max(...MY_FLEET.map((t) => t.maxWeightKg))
const FLEET_MAX_VOLUME = Math.max(...MY_FLEET.map((t) => t.maxVolumeM3))
const fitsFleet = (weightKg: number, volumeM3: number) =>
  weightKg <= FLEET_MAX_WEIGHT && volumeM3 <= FLEET_MAX_VOLUME

// Realtime identity made tangible — a pulsing green dot reinforces the live feed (MVP §4).
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

export function CarrierFeedScreen() {
  const { feedOrders, push, setTab } = useCnKz()
  const [type, setType] = useState<TruckType | "all">("all")
  const [showOverCap, setShowOverCap] = useState(false)

  const byType = useMemo(
    () =>
      feedOrders.filter(
        (o) => !o.deal && (type === "all" || o.truckType === type)
      ),
    [feedOrders, type]
  )
  const hiddenCount = byType.filter((o) => !fitsFleet(o.weightKg, o.volumeM3)).length
  const list = showOverCap
    ? byType
    : byType.filter((o) => fitsFleet(o.weightKg, o.volumeM3))

  // Сводка сверху ленты.
  const available = feedOrders.filter(
    (o) => !o.deal && fitsFleet(o.weightKg, o.volumeM3)
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
        title="Лента грузов"
        subtitle="Хоргос → СНГ"
        action={<LiveBadge />}
      />

      <StatStrip
        items={[
          { value: available, label: "Подходящих грузов", icon: Boxes },
          {
            value: myOffers,
            label: "Мои офферы",
            icon: Tag,
            accent: true,
            onClick: () => setTab("offers"),
          },
          {
            value: activeDeals,
            label: "Сделки в пути",
            icon: Truck,
            onClick: () => setTab("deals"),
          },
        ]}
      />

      <ChipRow className="px-4 pb-2">
        <Chip active={type === "all"} onClick={() => setType("all")}>
          Все
        </Chip>
        {TRUCK_TYPES.map((t) => (
          <Chip key={t} active={type === t} onClick={() => setType(t)}>
            {t}
          </Chip>
        ))}
      </ChipRow>

      {hiddenCount > 0 && (
        <button
          onClick={() => setShowOverCap((v) => !v)}
          className="mx-4 mb-2 inline-flex w-fit items-center gap-1.5 self-start rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground active:scale-[0.97]"
        >
          <Boxes className="size-3.5 text-brand" />
          {showOverCap
            ? "Скрыть неподходящие"
            : `Не помещаются: ${hiddenCount} — показать всё`}
        </button>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {list.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            Нет грузов под этот фильтр
          </p>
        )}
        {list.map((o, i) => (
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
              onClick={() => push({ type: "cargoDetail", orderId: o.id })}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function MyOffersScreen() {
  const { feedOrders, push } = useCnKz()
  const offers = feedOrders.filter((o) => o.myOfferStatus)
  const active = offers.filter(
    (o) => o.myOfferStatus === "pending" || o.myOfferStatus === "countered"
  )
  const settled = offers.filter(
    (o) =>
      o.myOfferStatus === "accepted" ||
      o.myOfferStatus === "rejected" ||
      o.myOfferStatus === "expired"
  )

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Мои офферы" subtitle="Ваши ставки на грузы" />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pt-2 pb-24">
        {offers.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            Пока нет офферов. Откликнитесь на груз в ленте.
          </p>
        )}
        {active.length > 0 && (
          <Section title="Активные">
            <div className="space-y-3">
              {active.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  showMyOffer
                  onClick={() => push({ type: "cargoDetail", orderId: o.id })}
                />
              ))}
            </div>
          </Section>
        )}
        {settled.length > 0 && (
          <Section title="История">
            <div className="space-y-3">
              {settled.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  showMyOffer
                  onClick={() => push({ type: "cargoDetail", orderId: o.id })}
                />
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  )
}

export function CargoDetailScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, setTab, makeOffer, confirmCounter, declineMyOffer, showToast } =
    useCnKz()
  const order = getOrder(orderId)
  const [counter, setCounter] = useState("")
  if (!order) return null

  const alreadyOffered = !!order.myOfferStatus

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

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-28">
        <Card size="sm">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Route from={order.origin} to={order.destination} />
              <span className="font-mono-tech text-lg font-semibold text-foreground">
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
            {order.pickupPoint && (
              <DetailRow label="Точка погрузки" value={order.pickupPoint} />
            )}
            {order.pickupPhone && (
              <DetailRow label="Контакт погрузки" value={order.pickupPhone} />
            )}
            <DetailRow label="Адрес доставки" value={order.address} />
            {order.notes && <DetailRow label="Примечание" value={order.notes} />}
          </CardContent>
        </Card>

        <Section title="Шипер">
          <Card size="sm">
            <CardContent className="flex items-center gap-2">
              <Avatar name={order.shipper.name} className="size-8" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {order.shipper.name}
                  {order.shipper.company && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {order.shipper.company}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  <Rating value={order.shipper.rating} /> ·{" "}
                  {deals(order.shipper.dealsCount)}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => showToast(`Звоним: ${order.shipper.phone}`)}
              >
                <Phone className="size-3.5" />
              </Button>
            </CardContent>
          </Card>
        </Section>

        {order.myOfferStatus && (
          <Card
            size="sm"
            className={order.myOfferStatus === "accepted" ? "ring-brand/40" : ""}
          >
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ваш оффер</span>
                <OfferStatusBadge status={order.myOfferStatus} />
              </div>

              {order.myOfferStatus === "pending" && (
                <>
                  <DetailRow
                    label="Ваша цена"
                    value={money(order.myOfferPriceUsd ?? order.priceUsd)}
                  />
                  <p className="text-xs text-muted-foreground">Ждём ответа шипера…</p>
                </>
              )}

              {order.myOfferStatus === "countered" && (
                <>
                  <DetailRow label="Ваша цена" value={money(order.myOfferPriceUsd ?? 0)} />
                  <DetailRow
                    label="Встречная шипера"
                    value={money(order.myCounterPriceUsd ?? 0)}
                  />
                  <div className="flex gap-2 pt-1">
                    <Button className="flex-1" onClick={() => confirmCounter(order.id)}>
                      <Check className="size-4" /> Согласиться {money(order.myCounterPriceUsd ?? 0)}
                    </Button>
                    <Button variant="outline" onClick={() => declineMyOffer(order.id)}>
                      Отклонить
                    </Button>
                  </div>
                </>
              )}

              {order.myOfferStatus === "accepted" && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setTab("deals")
                    push({ type: "deal", orderId: order.id })
                  }}
                >
                  <Truck className="size-4" /> Открыть сделку
                </Button>
              )}

              {(order.myOfferStatus === "rejected" ||
                order.myOfferStatus === "expired") && (
                <p className="text-xs text-muted-foreground">
                  {order.myOfferStatus === "rejected"
                    ? "Оффер снят или отклонён."
                    : "Срок оффера истёк."}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {!alreadyOffered && (
        <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-border bg-card p-3">
          <Button
            className="w-full"
            onClick={() => {
              makeOffer(order.id, "accept", order.priceUsd)
              pop()
            }}
          >
            <Check className="size-4" /> Принять цену {money(order.priceUsd)}
          </Button>
          <div className="flex gap-2">
            <Input
              type="number"
              inputMode="numeric"
              value={counter}
              onChange={(e) => setCounter(e.target.value)}
              placeholder="Своя цена, $"
              className="h-9"
            />
            <Button
              variant="outline"
              size="lg"
              disabled={!counter || Number(counter) <= 0}
              onClick={() => {
                makeOffer(order.id, "counter", Number(counter))
                pop()
              }}
            >
              Предложить
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
