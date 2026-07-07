"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, Check, Gavel, MessageCircle, Package, Phone, RefreshCw, Tag, Truck, X } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  TRUCK_TYPES,
  type Order,
  type TruckType,
} from "@/lib/cn-kz/types"
import { CityPicker } from "./city-picker"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import { deals, plural, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, EmptyState, Section, StatStrip } from "./ui-bits"
import { useCnKz, type NewOrderDraft } from "./store"

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "open", label: "Не принятые" },
  { id: "accepted", label: "Принятые" },
] as const

export function ShipperOrdersScreen() {
  const { myOrders, push, togglePin, dealsNewOnly, setDealsNewOnly, isNew } = useCnKz()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [sort, setSort] = useState<"new" | "offers">("new")

  const inBidding = myOrders.filter(
    (o) => !o.deal && (o.status === "bidding" || o.status === "published")
  ).length
  const activeDeals = myOrders.filter(
    (o) => o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
  ).length
  const newOffers = myOrders.reduce(
    (n, o) => n + o.offers.filter((of) => of.status === "pending").length,
    0
  )
  // Завершённые/отменённые ушли в «Историю», архивные не активны — в счётчике только активные.
  const activeCount = myOrders.filter(
    (o) =>
      o.status !== "archived" &&
      !(o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled"))
  ).length

  const list = useMemo(() => {
    const filtered = myOrders.filter((o) => {
      const active = o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
      const finished = o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled")
      if (finished) return false // завершённые/отменённые живут в «Истории заказов», не тут
      const byFilter =
        filter === "all"
          ? true
          : filter === "open"
            ? !o.deal && (o.status === "bidding" || o.status === "published")
            : !!active
      const byNew = !dealsNewOnly || isNew(o.id) // «Все сделки с новыми» из колокольчика
      return byFilter && byNew
    })
    const pendingOf = (o: Order) => o.offers.filter((of) => of.status === "pending").length
    return filtered.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1 // pinned first
      if (sort === "offers") return pendingOf(b) - pendingOf(a)
      return 0
    })
  }, [myOrders, filter, sort, dealsNewOnly, isNew])

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Мои заказы"
        subtitle={`${activeCount} ${plural(activeCount, "активный заказ", "активных заказа", "активных заказов")} · по всей СНГ`}
      />

      <StatStrip
        items={[
          { value: inBidding, label: "Не приняты", icon: Gavel, onClick: () => setFilter("open") },
          { value: activeDeals, label: "В работе", icon: Truck, onClick: () => setFilter("accepted") },
          {
            value: newOffers,
            label: "Новые отклики",
            icon: Tag,
            accent: true,
            onClick: () => {
              setFilter("open")
              setSort("offers")
            },
          },
        ]}
      />

      <ChipRow className="px-4 pb-2">
        {dealsNewOnly && (
          <Chip active onClick={() => setDealsNewOnly(false)}>
            Только новые ✕
          </Chip>
        )}
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id && !dealsNewOnly}
            onClick={() => {
              setFilter(f.id)
              setDealsNewOnly(false)
            }}
          >
            {f.label}
          </Chip>
        ))}
        <span className="mx-0.5 w-px shrink-0 self-stretch bg-border" />
        <Chip active={sort === "new"} onClick={() => setSort("new")}>Новые</Chip>
        <Chip active={sort === "offers"} onClick={() => setSort("offers")}>Больше откликов</Chip>
      </ChipRow>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {list.length === 0 && (
          <EmptyState
            icon={Package}
            title="Здесь пока пусто"
            hint="Опубликуйте заказ — перевозчики начнут откликаться в реальном времени."
            action={
              <Button size="sm" onClick={() => push({ type: "createOrder" })}>
                Создать заказ
              </Button>
            }
          />
        )}
        {list.map((o, i) => (
          <div
            key={o.id}
            className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
            style={{ animationDelay: `${Math.min(i, 7) * 50}ms`, animationDuration: "300ms" }}
          >
            <OrderCard
              order={o}
              pinned={o.pinned}
              onTogglePin={() => togglePin(o.id)}
              onClick={() =>
                push(
                  o.deal
                    ? { type: "deal", orderId: o.id }
                    : { type: "orderDetail", orderId: o.id }
                )
              }
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export function OrderDetailScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, acceptOffer, rejectOffer, counterOffer, republishOrder, showToast, markSeen } = useCnKz()
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [counterVal, setCounterVal] = useState("")
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const order = getOrder(orderId)
  // Открыли заказ → новые отклики прочитаны.
  useEffect(() => {
    markSeen(orderId)
  }, [orderId, markSeen])
  if (!order) return null

  const visible = order.offers.filter(
    (o) => o.status === "pending" || o.status === "countered"
  )

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
          title="Отклики"
          right={<span className="text-xs text-muted-foreground">{visible.length} активных</span>}
        >
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Пока нет откликов. Пуш ушёл подходящим перевозчикам.
            </p>
          )}
          <div className="space-y-2">
            {visible.map((of) => (
              <Card
                key={of.id}
                size="sm"
                onClick={() =>
                  push({
                    type: "carrierProfile",
                    carrierId: of.carrier.id,
                    orderId: order.id,
                    offerId: of.id,
                  })
                }
                className="cursor-pointer hover:ring-foreground/20"
              >
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={of.carrier.name} className="size-8" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-sm font-medium">
                        {of.carrier.name}
                        {of.carrier.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" />}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <Rating value={of.carrier.rating} /> · {deals(of.carrier.dealsCount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-tech text-base font-semibold text-foreground">
                        {money(of.priceUsd)}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{of.createdAgo}</p>
                    </div>
                  </div>

                  {/* vehicle params */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-[4px] bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                      <Truck className="size-3 opacity-60" /> {of.truck}
                    </span>
                    {of.plate && (
                      <span className="font-mono-tech inline-flex items-center rounded-[4px] bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground">
                        {of.plate}
                      </span>
                    )}
                    {of.capacityKg && (
                      <span className="inline-flex items-center rounded-[4px] bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground tabular-nums">
                        до {of.capacityKg.toLocaleString("ru-RU")} кг
                      </span>
                    )}
                    {of.kind === "accept" ? (
                      <Badge variant="success">
                        <Check className="size-3" /> Готов сразу
                      </Badge>
                    ) : (
                      <Badge variant="warning">Встречная</Badge>
                    )}
                  </div>

                  {of.status === "countered" ? (
                    <div className="rounded-md border border-brand/35 bg-brand/12 px-3 py-2 text-[13px] font-medium text-brand">
                      Встречная отправлена: {money(of.shipperCounterUsd ?? of.priceUsd)} · ждём ответа перевозчика
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            acceptOffer(order.id, of.id)
                            pop()
                            push({ type: "deal", orderId: order.id })
                          }}
                        >
                          {of.kind === "accept" ? "Выбрать" : "Выбрать встречную"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className={rejectFor === of.id ? "border-destructive text-destructive" : ""}
                          onClick={(e) => {
                            e.stopPropagation()
                            if (rejectFor === of.id) {
                              rejectOffer(order.id, of.id)
                              setRejectFor(null)
                            } else {
                              setRejectFor(of.id)
                            }
                          }}
                        >
                          <X className="size-3.5" /> {rejectFor === of.id ? "Точно?" : "Отклонить"}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCounterFor(counterFor === of.id ? null : of.id)
                            setCounterVal("")
                          }}
                        >
                          Своя цена
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            showToast("Чат откроется после начала сделки")
                          }}
                        >
                          <MessageCircle className="size-3.5" /> Чат
                        </Button>
                      </div>
                      {counterFor === of.id && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={counterVal}
                            onChange={(e) => setCounterVal(e.target.value)}
                            placeholder={`Ваша цена, $ (сейчас ${of.priceUsd})`}
                            className="h-9"
                          />
                          <Button
                            size="sm"
                            disabled={!counterVal}
                            onClick={() => {
                              counterOffer(order.id, of.id, Number(counterVal))
                              setCounterFor(null)
                            }}
                          >
                            Отправить
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </Section>

        {order.deal && order.status === "deal" && (
          <Button
            className="w-full"
            onClick={() => {
              pop()
              push({ type: "deal", orderId: order.id })
            }}
          >
            <Truck className="size-4" /> Открыть сделку · {money(order.deal.agreedPriceUsd)}
          </Button>
        )}

        {order.status === "archived" && (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              republishOrder(order.id)
              pop()
            }}
          >
            <RefreshCw className="size-4" /> Перепубликовать заказ
          </Button>
        )}
      </div>
    </div>
  )
}

const RU_MONTHS = [
  "янв", "фев", "мар", "апр", "май", "июн",
  "июл", "авг", "сен", "окт", "ноя", "дек",
]

// ISO из <input type="date"> ("2026-06-12") → «12 июн 2026» для карточек/деталей.
function formatReadyDate(iso: string): string {
  if (!iso) return ""
  const [y, m, day] = iso.split("-").map(Number)
  if (!y || !m || !day) return iso
  return `${day} ${RU_MONTHS[m - 1]} ${y}`
}

const emptyDraft: NewOrderDraft = {
  origin: "",
  pickupPoint: "",
  pickupPhone: "",
  destination: "",
  cargo: "",
  weightKg: 0,
  volumeM3: 0,
  truckType: "тент",
  priceUsd: 0,
  readyDate: "",
  notes: "",
  address: "",
  recipientName: "",
  recipientPhone: "",
  payment: "transfer",
}

export function CreateOrderScreen() {
  const { publishOrder, pop, setTab } = useCnKz()
  const [d, setD] = useState<NewOrderDraft>(emptyDraft)
  const [readyIso, setReadyIso] = useState("")
  const set = <K extends keyof NewOrderDraft>(k: K, v: NewOrderDraft[K]) =>
    setD((cur) => ({ ...cur, [k]: v }))

  const valid =
    d.origin.trim() &&
    d.pickupPoint.trim() &&
    d.destination.trim() &&
    d.cargo.trim() &&
    d.weightKg > 0 &&
    d.priceUsd > 0 &&
    d.readyDate.trim()

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Новый заказ" subtitle="Опишите груз и маршрут" onBack={pop} />

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Field label="Откуда">
          <CityPicker value={d.origin} onChange={(c) => set("origin", c)} />
        </Field>

        <Field label="Точка погрузки">
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
            placeholder="+7…"
          />
        </Field>

        <Field label="Куда">
          <div className="space-y-1.5">
            <CityPicker value={d.destination} onChange={(c) => set("destination", c)} />
            {(d.origin || d.destination) && (
              <button
                onClick={() => setD((c) => ({ ...c, origin: c.destination, destination: c.origin }))}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand"
              >
                ⇅ Поменять откуда / куда
              </button>
            )}
          </div>
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
          <div className="flex flex-wrap gap-1.5">
            {TRUCK_TYPES.map((t) => (
              <Chip
                key={t}
                active={d.truckType === t}
                onClick={() => set("truckType", t as TruckType)}
              >
                {t}
              </Chip>
            ))}
          </div>
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
            type="date"
            value={readyIso}
            onChange={(e) => {
              setReadyIso(e.target.value)
              set("readyDate", formatReadyDate(e.target.value))
            }}
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
            setTab("myorders") // покажем новый заказ в «Мои заказы», а не в общей ленте
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
