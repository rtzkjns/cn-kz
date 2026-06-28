"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Gavel, Phone, Plus, RefreshCw, Search, Tag, Truck } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ORIGIN,
  TRUCK_TYPES,
  type Order,
  type TruckType,
} from "@/lib/cn-kz/types"
import { CityPicker } from "./city-picker"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { deals, plural, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, Section, StatStrip } from "./ui-bits"
import { useCnKz, type NewOrderDraft } from "./store"

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "bidding", label: "Торги" },
  { id: "deal", label: "Сделки" },
  { id: "archived", label: "Архив" },
] as const

export function ShipperOrdersScreen() {
  const { myOrders, push, setTab, openNotifications } = useCnKz()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [q, setQ] = useState("")

  // Сводка сверху ленты.
  const inBidding = myOrders.filter(
    (o) => o.status === "bidding" || o.status === "published"
  ).length
  const activeDeals = myOrders.filter(
    (o) => o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
  ).length
  const newOffers = myOrders.reduce(
    (n, o) => n + o.offers.filter((of) => of.status === "pending").length,
    0
  )

  const list = useMemo(() => {
    return myOrders.filter((o) => {
      const byFilter =
        filter === "all"
          ? true
          : filter === "bidding"
            ? o.status === "bidding" || o.status === "published"
            : filter === "deal"
              ? o.status === "deal"
              : o.status === "archived"
      const byQ =
        q.trim() === "" ||
        `${o.destination} ${o.cargo}`.toLowerCase().includes(q.toLowerCase())
      return byFilter && byQ
    })
  }, [myOrders, filter, q])

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Мои заказы"
        subtitle={`${myOrders.length} ${plural(myOrders.length, "заказ", "заказа", "заказов")} · Хоргос → СНГ`}
      />

      <StatStrip
        items={[
          { value: inBidding, label: "В торгах", icon: Gavel },
          {
            value: activeDeals,
            label: "Сделки в пути",
            icon: Truck,
            onClick: () => setTab("deals"),
          },
          {
            value: newOffers,
            label: "Новые офферы",
            icon: Tag,
            accent: true,
            onClick: openNotifications,
          },
        ]}
      />

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по маршруту и грузу"
            className="h-8 pl-7"
          />
        </div>
      </div>

      <ChipRow className="px-4 pb-2">
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </Chip>
        ))}
      </ChipRow>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {list.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            Нет заказов в этой вкладке
          </p>
        )}
        {list.map((o) => (
          <OrderCard
            key={o.id}
            order={o}
            onClick={() =>
              push(
                o.deal
                  ? { type: "deal", orderId: o.id }
                  : { type: "orderDetail", orderId: o.id }
              )
            }
          />
        ))}
      </div>

      <button
        onClick={() => push({ type: "createOrder" })}
        className="shadow-key absolute right-4 bottom-5 z-10 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform duration-150 active:scale-[0.96]"
        aria-label="Новый заказ"
      >
        <Plus className="size-6" />
      </button>
    </div>
  )
}

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, acceptOffer, showToast, markSeen } = useCnKz()
  const order = getOrder(orderId)
  // Открыли заказ → новые офферы прочитаны.
  useEffect(() => {
    markSeen(orderId)
  }, [orderId, markSeen])
  if (!order) return null

  const pending = order.offers.filter((o) => o.status === "pending")

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            Заказ{" "}
            <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
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
            {order.pickupPoint && (
              <DetailRow label="Точка погрузки" value={order.pickupPoint} />
            )}
            {order.pickupPhone && (
              <DetailRow label="Контакт погрузки" value={order.pickupPhone} />
            )}
            <DetailRow label="Адрес доставки" value={order.address} />
            <DetailRow
              label="Получатель"
              value={`${order.recipientName} · ${order.recipientPhone}`}
            />
            <DetailRow
              label="Оплата"
              value={order.payment === "cash" ? "Наличные" : "Банковский перевод"}
            />
            {order.notes && (
              <DetailRow label="Примечание" value={order.notes} />
            )}
          </CardContent>
        </Card>

        <Section
          title="Офферы"
          right={<span className="text-xs text-muted-foreground">{pending.length} активных</span>}
        >
          {pending.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Пока нет откликов. Пуш ушёл подходящим перевозчикам.
            </p>
          )}
          <div className="space-y-2">
            {pending.map((of) => (
              <Card key={of.id} size="sm">
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={of.carrier.name} className="size-8" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {of.carrier.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Rating value={of.carrier.rating} /> ·{" "}
                        {deals(of.carrier.dealsCount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-tech text-base font-semibold text-foreground">
                        {money(of.priceUsd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {of.createdAgo}
                      </p>
                    </div>
                  </div>

                  {of.kind === "accept" ? (
                    <Badge variant="success">
                      <Check className="size-3" /> Готов везти сразу
                    </Badge>
                  ) : (
                    <Badge variant="warning">Встречная цена</Badge>
                  )}

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        acceptOffer(order.id, of.id)
                        pop()
                        push({ type: "deal", orderId: order.id })
                      }}
                    >
                      {of.kind === "accept" ? "Принять — сделка сразу" : "Выбрать · 15 мин на подтверждение"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => showToast(`Звоним: ${of.carrier.phone}`)}
                    >
                      <Phone className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {order.status === "archived" && (
          <Button variant="outline" className="w-full" onClick={pop}>
            <RefreshCw className="size-4" /> Перепубликовать заказ
          </Button>
        )}
      </div>
    </div>
  )
}

const emptyDraft: NewOrderDraft = {
  pickupPoint: "",
  pickupPhone: "",
  destination: "",
  cargo: "",
  weightKg: 0,
  volumeM3: 0,
  truckType: "тент",
  priceUsd: 0,
  readyDate: "12 июн 2026",
  notes: "",
  address: "",
  recipientName: "",
  recipientPhone: "",
  payment: "transfer",
}

export function CreateOrderScreen() {
  const { publishOrder, pop } = useCnKz()
  const [d, setD] = useState<NewOrderDraft>(emptyDraft)
  const set = <K extends keyof NewOrderDraft>(k: K, v: NewOrderDraft[K]) =>
    setD((cur) => ({ ...cur, [k]: v }))

  const valid =
    d.pickupPoint.trim() &&
    d.destination.trim() &&
    d.cargo.trim() &&
    d.weightKg > 0 &&
    d.priceUsd > 0

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Новый заказ" subtitle="Опишите груз и маршрут" onBack={pop} />

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Field label="Откуда">
          <Input value={ORIGIN} disabled />
        </Field>

        <Field label="Точка погрузки в Хоргосе">
          <Input
            value={d.pickupPoint}
            onChange={(e) => set("pickupPoint", e.target.value)}
            placeholder="Склад / терминал / адрес"
          />
        </Field>

        <Field label="Контакт на погрузке (тел.)">
          <Input
            value={d.pickupPhone}
            onChange={(e) => set("pickupPhone", e.target.value)}
            placeholder="+86 / +7…"
          />
        </Field>

        <Field label="Куда">
          <CityPicker
            value={d.destination}
            onChange={(c) => set("destination", c)}
          />
        </Field>

        <Field label="Описание груза">
          <Textarea
            value={d.cargo}
            onChange={(e) => set("cargo", e.target.value)}
            placeholder="Что везём, сколько мест…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Вес, кг">
            <Input
              type="number"
              inputMode="numeric"
              onChange={(e) => set("weightKg", Number(e.target.value))}
            />
          </Field>
          <Field label="Объём, м³">
            <Input
              type="number"
              inputMode="numeric"
              onChange={(e) => set("volumeM3", Number(e.target.value))}
            />
          </Field>
        </div>

        <Field label="Тип авто">
          <ChipRow>
            {TRUCK_TYPES.map((t) => (
              <Chip
                key={t}
                active={d.truckType === t}
                onClick={() => set("truckType", t as TruckType)}
              >
                {t}
              </Chip>
            ))}
          </ChipRow>
        </Field>

        <Field label="Ваша цена, $">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="напр. 1500"
            onChange={(e) => set("priceUsd", Number(e.target.value))}
          />
        </Field>

        <Field label="Дата готовности к погрузке">
          <Input
            value={d.readyDate}
            onChange={(e) => set("readyDate", e.target.value)}
          />
        </Field>

        <Field label="Адрес доставки">
          <Input
            value={d.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Город, улица, дом"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Получатель">
            <Input
              value={d.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
            />
          </Field>
          <Field label="Телефон">
            <Input
              value={d.recipientPhone}
              onChange={(e) => set("recipientPhone", e.target.value)}
              placeholder="+7…"
            />
          </Field>
        </div>

        <Field label="Тип оплаты (договорная)">
          <ChipRow>
            <Chip active={d.payment === "cash"} onClick={() => set("payment", "cash")}>
              Наличные
            </Chip>
            <Chip
              active={d.payment === "transfer"}
              onClick={() => set("payment", "transfer")}
            >
              Перевод
            </Chip>
          </ChipRow>
        </Field>

        <Field label="Примечание">
          <Textarea
            value={d.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Ограничения и требования: растаможка, пропуск, хрупкое, простой…"
          />
        </Field>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-border bg-card p-3">
        <Button
          className="w-full"
          disabled={!valid}
          onClick={() => {
            publishOrder(d)
            pop()
          }}
        >
          Опубликовать
        </Button>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
