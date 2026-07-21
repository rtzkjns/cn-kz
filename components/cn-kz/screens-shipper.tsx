"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, Check, Copy, Gavel, Package, Pencil, RefreshCw, Search, ShieldCheck, Tag, Trash2, Truck, X } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
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
import { CallButton, deals, offerLive, plural, Rating, StatusBadge, money } from "./shared"
import { Chip, ChipRow, Countdown, DetailRow, EmptyState, Section, StatStrip, StickyCTA } from "./ui-bits"
import { useCnKz, type NewOrderDraft } from "./store"

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "open", label: "Не принятые" },
  { id: "accepted", label: "Принятые" },
  { id: "archived", label: "Архив" },
] as const

export function ShipperOrdersScreen() {
  const { myOrders, push, togglePin, dealsNewOnly, setDealsNewOnly, isNew } = useCnKz()
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all")
  const [sort, setSort] = useState<"new" | "offers">("new")
  const [query, setQuery] = useState("")

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
    // Поиск по конечной точке / городу / грузу (теги #алматы #тент тоже работают).
    const words = query.trim().toLowerCase().replace(/#/g, " ").split(/\s+/).filter(Boolean)
    const filtered = myOrders.filter((o) => {
      const active = o.deal && o.deal.status !== "completed" && o.deal.status !== "cancelled"
      const finished = o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled")
      if (finished) return false // завершённые/отменённые живут в «Истории заказов», не тут
      const byFilter =
        filter === "all"
          ? true
          : filter === "open"
            ? !o.deal && (o.status === "bidding" || o.status === "published")
            : filter === "archived"
              ? o.status === "archived"
              : !!active
      const byNew = !dealsNewOnly || isNew(o.id) // «Все сделки с новыми» из колокольчика
      const hay = `${o.origin} ${o.destination} ${o.cargo} ${o.truckType}`.toLowerCase()
      const byQuery = words.length === 0 || words.every((w) => hay.includes(w))
      return byFilter && byNew && byQuery
    })
    const pendingOf = (o: Order) => o.offers.filter((of) => of.status === "pending").length
    return filtered.sort((a, b) => {
      if (!!b.pinned !== !!a.pinned) return b.pinned ? 1 : -1 // pinned first
      if (sort === "offers") return pendingOf(b) - pendingOf(a)
      return 0
    })
  }, [myOrders, filter, sort, dealsNewOnly, isNew, query])

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

      <div className="px-4 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по городу назначения, грузу…  #алматы #тент"
            className="h-11 pl-9 text-base"
          />
        </div>
      </div>

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
              <Button size="lg" onClick={() => push({ type: "createOrder" })}>
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
  const { getOrder, pop, push, acceptOffer, pickCounterOffer, rejectOffer, counterOffer, republishOrder, deleteOrder, markSeen } = useCnKz()
  const [counterFor, setCounterFor] = useState<string | null>(null)
  const [counterVal, setCounterVal] = useState("")
  const [rejectFor, setRejectFor] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const order = getOrder(orderId)
  // Открыли заказ → новые отклики прочитаны.
  useEffect(() => {
    markSeen(orderId)
    // markSeen — идемпотентный функциональный апдейт; зависим только от orderId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])
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

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-0">
        <Card size="sm">
          <CardContent className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              {/* route-rail: origin muted → пунктирный коннектор → destination brand (сигнатурный мотив, как в OrderCard) */}
              <div className="flex min-w-0 flex-1 gap-3">
                <div className="flex flex-col items-center pt-1.5">
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
              <span className="font-mono-tech shrink-0 text-2xl font-bold text-foreground tabular-nums">
                {money(order.priceUsd)}
              </span>
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
              <DetailRow label="Контакт погрузки" value={order.pickupPhone} />
            )}
            {order.address && <DetailRow label="Адрес доставки" value={order.address} />}
            {(order.recipientName || order.recipientPhone) && (
              <DetailRow
                label="Получатель"
                value={[order.recipientName, order.recipientPhone].filter(Boolean).join(" · ")}
              />
            )}
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
          right={<span className="text-sm text-muted-foreground">{visible.length} активных</span>}
        >
          {visible.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {order.deal
                ? "Сделка заключена — остальные отклики отклонены."
                : order.status === "archived"
                  ? "Заказ в архиве — откликов не было."
                  : "Пока нет откликов. Пуш ушёл подходящим перевозчикам."}
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
                className="cursor-pointer transition-transform duration-150 active:scale-[0.99]"
              >
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar name={of.carrier.name} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 truncate text-[15px] font-semibold">
                        {of.carrier.name}
                        {of.carrier.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <Rating value={of.carrier.rating} /> · {deals(of.carrier.dealsCount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono-tech text-lg font-bold text-foreground">
                        {money(of.priceUsd)}
                      </p>
                      <p className="text-sm text-muted-foreground">{of.createdAgo}</p>
                    </div>
                  </div>

                  {/* vehicle params */}
                  <div className="flex flex-wrap gap-1.5">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium text-muted-foreground">
                      <Truck className="size-4 opacity-60" /> {of.truck}
                    </span>
                    {of.plate && (
                      <span className="font-mono-tech inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium text-muted-foreground">
                        {of.plate}
                      </span>
                    )}
                    {of.capacityKg && (
                      <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-sm font-medium text-muted-foreground tabular-nums">
                        до {of.capacityKg.toLocaleString("ru-RU")} кг
                      </span>
                    )}
                    {of.kind === "accept" ? (
                      <StatusBadge tone="success" icon={Check}>Готов сразу</StatusBadge>
                    ) : (
                      <StatusBadge tone="info">Встречная</StatusBadge>
                    )}
                  </div>

                  {of.awaitingConfirm && of.confirmDeadline ? (
                    <div className="space-y-2 pt-1">
                      <div className="rounded-md border border-warn/35 bg-warn/12 px-3 py-2 text-[15px] font-medium text-warn">
                        Вы выбрали встречную {money(of.priceUsd)} · ждём подтверждения перевозчика · осталось{" "}
                        <Countdown deadline={of.confirmDeadline} />
                      </div>
                      {/* §5: отклик «живой» — можно позвонить перевозчику, пока ждём подтверждения. */}
                      <CallButton phone={of.carrier.phone} className="w-full" />
                    </div>
                  ) : of.status === "countered" ? (
                    <div className="space-y-2 pt-1">
                      <div className="rounded-md border border-brand/35 bg-brand/12 px-3 py-2 text-[15px] font-medium text-brand">
                        Встречная отправлена: {money(of.shipperCounterUsd ?? of.priceUsd)} · ждём ответа перевозчика
                      </div>
                      {/* §5: контакт раскрыт, пока встречная на рассмотрении. */}
                      <CallButton phone={of.carrier.phone} className="w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="lg"
                          className="h-12 flex-1 bg-[var(--success)] text-[15px] text-white hover:bg-[var(--success-strong)]"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (of.kind === "counter") {
                              // §5 Вариант Б: выбор встречной → 15-мин окно подтверждения перевозчика.
                              pickCounterOffer(order.id, of.id)
                            } else {
                              acceptOffer(order.id, of.id)
                              pop()
                              push({ type: "deal", orderId: order.id })
                            }
                          }}
                        >
                          {of.kind === "accept" ? "Выбрать" : "Выбрать встречную"}
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className={`h-12 text-[15px] ${rejectFor === of.id ? "border-destructive text-destructive" : ""}`}
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
                          <X className="size-4" /> {rejectFor === of.id ? "Точно?" : "Отклонить"}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="lg"
                          variant="ghost"
                          className="h-12 flex-1 text-[15px]"
                          onClick={(e) => {
                            e.stopPropagation()
                            setCounterFor(counterFor === of.id ? null : of.id)
                            setCounterVal("")
                          }}
                        >
                          Своя цена
                        </Button>
                        {/* §5: контакт раскрыт, пока отклик «живой» — шипер может позвонить откликнувшемуся перевозчику. */}
                        {offerLive(of.status) && (
                          <CallButton phone={of.carrier.phone} className="flex-1" />
                        )}
                      </div>
                      {counterFor === of.id && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Input
                            type="number"
                            inputMode="numeric"
                            value={counterVal}
                            onChange={(e) => setCounterVal(e.target.value)}
                            placeholder={`Ваша цена, $ (сейчас ${of.priceUsd})`}
                            className="h-12 text-base"
                          />
                          <Button
                            size="lg"
                            className="h-12 text-[15px]"
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

        <div className="flex gap-2">
          {(order.status === "published" || order.status === "bidding") && (
            <Button
              variant="outline"
              size="lg"
              className="flex-1 text-[15px]"
              onClick={() => push({ type: "createOrder", editId: order.id })}
            >
              <Pencil className="size-4" /> Редактировать
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="flex-1 text-[15px]"
            onClick={() => push({ type: "createOrder", prefillFrom: order.id })}
          >
            <Copy className="size-4" /> Создать копию
          </Button>
        </div>

        {order.deal && order.status === "deal" && (
          <StickyCTA>
            <Button
              size="xl"
              className="w-full"
              onClick={() => {
                pop()
                push({ type: "deal", orderId: order.id })
              }}
            >
              <Truck className="size-5" /> Открыть сделку · {money(order.deal.agreedPriceUsd)}
            </Button>
          </StickyCTA>
        )}

        {order.status === "archived" && (
          <Button
            variant="outline"
            size="lg"
            className="w-full text-[15px]"
            onClick={() => {
              republishOrder(order.id)
              pop()
            }}
          >
            <RefreshCw className="size-5" /> Перепубликовать заказ
          </Button>
        )}

        {!order.deal && (
          <Button
            variant="outline"
            size="lg"
            className={`w-full text-[15px] ${confirmDelete ? "border-destructive text-destructive" : "text-muted-foreground"}`}
            onClick={() => (confirmDelete ? deleteOrder(order.id) : setConfirmDelete(true))}
          >
            <Trash2 className="size-4" /> {confirmDelete ? "Точно удалить заказ?" : "Удалить заказ"}
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

// Города РФ — для грузов в Россию поднимаем санкц-подсказку (главный риск на этом коридоре).
const RU_CITIES = new Set([
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань", "Нижний Новгород",
  "Челябинск", "Самара", "Омск", "Ростов-на-Дону", "Уфа", "Красноярск", "Воронеж", "Пермь",
  "Волгоград", "Краснодар", "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск",
  "Иркутск", "Хабаровск", "Владивосток", "Махачкала", "Томск", "Оренбург", "Кемерово",
  "Новокузнецк", "Рязань", "Астрахань", "Пенза", "Липецк", "Тула", "Киров", "Чебоксары",
  "Калининград", "Курск", "Сочи", "Ставрополь", "Магнитогорск", "Орск", "Сургут", "Курган",
  "Якутск", "Улан-Удэ", "Чита",
])

// ISO из <input type="date"> ("2026-06-12") → «12 июн 2026» для карточек/деталей.
function formatReadyDate(iso: string): string {
  if (!iso) return ""
  const [y, m, day] = iso.split("-").map(Number)
  if (!y || !m || !day) return iso
  return `${day} ${RU_MONTHS[m - 1]} ${y}`
}

// Обратно: «12 июн 2026» → ISO для инициализации date-picker при копии/редактировании.
function readyIsoFromDisplay(s: string): string {
  const m = s.trim().match(/^(\d{1,2})\s+([а-я]+)\s+(\d{4})$/i)
  if (!m) return ""
  const mi = RU_MONTHS.indexOf(m[2].toLowerCase())
  if (mi < 0) return ""
  return `${m[3]}-${String(mi + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`
}

// Заказ → черновик формы (для «Создать копию» и редактирования).
function orderToDraft(o: Order): NewOrderDraft {
  return {
    origin: o.origin,
    pickupPoint: o.pickupPoint ?? "",
    pickupPhone: o.pickupPhone ?? "",
    destination: o.destination,
    cargo: o.cargo,
    weightKg: o.weightKg,
    volumeM3: o.volumeM3,
    truckType: o.truckType,
    priceUsd: o.priceUsd,
    readyDate: o.readyDate,
    notes: o.notes ?? "",
    address: o.address,
    recipientName: o.recipientName,
    recipientPhone: o.recipientPhone,
    payment: o.payment,
    safePay: o.safePay ?? true,
  }
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
  safePay: true,
}

export function CreateOrderScreen({
  prefillFrom,
  editId,
}: {
  prefillFrom?: string
  editId?: string
}) {
  const { publishOrder, saveOrderEdit, getOrder, pop, setTab } = useCnKz()
  const srcOrder = (editId ?? prefillFrom) ? getOrder((editId ?? prefillFrom)!) : undefined
  const isEdit = !!editId
  const [d, setD] = useState<NewOrderDraft>(() =>
    srcOrder ? orderToDraft(srcOrder) : emptyDraft
  )
  const [readyIso, setReadyIso] = useState(() =>
    srcOrder ? readyIsoFromDisplay(srcOrder.readyDate) : ""
  )
  const [attested, setAttested] = useState(!!editId) // подтверждение, что груз не запрещён
  const set = <K extends keyof NewOrderDraft>(k: K, v: NewOrderDraft[K]) =>
    setD((cur) => ({ ...cur, [k]: v }))

  const valid =
    d.origin.trim() &&
    d.destination.trim() &&
    d.cargo.trim() &&
    d.weightKg > 0 &&
    d.priceUsd > 0 &&
    d.readyDate.trim() &&
    attested

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={isEdit ? "Редактировать заказ" : prefillFrom ? "Копия заказа" : "Новый заказ"}
        subtitle={isEdit ? "Изменение условий обновит заказ" : "Опишите груз и маршрут"}
        onBack={pop}
      />

      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-0">
        <Field label="Откуда">
          <CityPicker value={d.origin} onChange={(c) => set("origin", c)} />
        </Field>

        <Field label="Точка погрузки">
          <Input
            value={d.pickupPoint}
            onChange={(e) => set("pickupPoint", e.target.value)}
            placeholder="Склад / терминал / адрес"
            className="h-14 text-base"
          />
        </Field>

        <Field label="Контакт на погрузке (тел.)">
          <Input
            value={d.pickupPhone}
            onChange={(e) => set("pickupPhone", e.target.value)}
            placeholder="+7…"
            inputMode="tel"
            className="h-14 text-base"
          />
        </Field>

        <Field label="Куда">
          <div className="space-y-1.5">
            <CityPicker value={d.destination} onChange={(c) => set("destination", c)} />
            {(d.origin || d.destination) && (
              <button
                onClick={() => setD((c) => ({ ...c, origin: c.destination, destination: c.origin }))}
                className="inline-flex min-h-11 items-center gap-1 text-sm font-medium text-brand"
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
            className="min-h-20 text-base"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Вес, кг">
            <Input
              type="number"
              inputMode="numeric"
              value={d.weightKg || ""}
              onChange={(e) => set("weightKg", Number(e.target.value))}
              className="h-14 text-base"
            />
          </Field>
          <Field label="Объём, м³">
            <Input
              type="number"
              inputMode="numeric"
              value={d.volumeM3 || ""}
              onChange={(e) => set("volumeM3", Number(e.target.value))}
              className="h-14 text-base"
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
            value={d.priceUsd || ""}
            onChange={(e) => set("priceUsd", Number(e.target.value))}
            className="h-14 text-base"
          />
          <p className="text-sm text-muted-foreground">
            Ориентир по похожим маршрутам. Слишком низкая ставка = меньше откликов, а подозрительно
            дешёвые заказы перевозчики обходят как приманку.
          </p>
        </Field>

        <Field label="Дата готовности к погрузке">
          <Input
            type="date"
            value={readyIso}
            onChange={(e) => {
              setReadyIso(e.target.value)
              set("readyDate", formatReadyDate(e.target.value))
            }}
            className="h-14 text-base"
          />
        </Field>

        <Field label="Адрес доставки">
          <Input
            value={d.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="Город, улица, дом"
            className="h-14 text-base"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Получатель">
            <Input
              value={d.recipientName}
              onChange={(e) => set("recipientName", e.target.value)}
              className="h-14 text-base"
            />
          </Field>
          <Field label="Телефон">
            <Input
              value={d.recipientPhone}
              onChange={(e) => set("recipientPhone", e.target.value)}
              placeholder="+7…"
              inputMode="tel"
              className="h-14 text-base"
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

        {/* Честно для нейтральной площадки: денег не держим. Защита = проверка + записи + совет. */}
        <div className="flex w-full items-start gap-3 rounded-md border border-brand/30 bg-brand/8 p-3">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
          <div className="min-w-0">
            <span className="block text-[15px] font-semibold">Безопасная сделка</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">
              Перевозчик проверяется по БИН, переписка и фото сохраняются — это ваша защита при споре.
              Оплата напрямую: платите на счёт компании (по БИН), <span className="font-medium text-foreground">не на личную карту</span>. Площадка деньги не держит.
            </span>
          </div>
        </div>

        <Field label="Примечание">
          <Textarea
            value={d.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Ограничения и требования: растаможка, пропуск, хрупкое, простой…"
            className="min-h-20 text-base"
          />
        </Field>

        {/* Груз в РФ — санкционный риск на коридоре Китай→Россия. Точечная подсказка. */}
        {RU_CITIES.has(d.destination) && (
          <div className="flex items-start gap-2 rounded-md bg-warn/10 px-3 py-2 text-sm text-warn dark:text-warn">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
            Груз в РФ: убедитесь, что это не санкционный товар двойного назначения (электроника, чипы,
            дроны, станки, подшипники). Иначе застрянет на границе, а ответственность — на вас.
          </div>
        )}

        {/* Декларация запрещённых грузов — переносит ответственность на заказчика, площадка нейтральна. */}
        <button
          type="button"
          onClick={() => setAttested((v) => !v)}
          className="flex w-full items-start gap-3 rounded-md border border-border p-3 text-left"
        >
          <span
            className={
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border " +
              (attested ? "border-brand bg-brand text-brand-foreground" : "border-border")
            }
          >
            {attested && <Check className="size-3.5" />}
          </span>
          <span className="text-sm text-muted-foreground">
            Подтверждаю: груз <span className="font-medium text-foreground">не запрещён и не под
            санкциями</span> — без оружия, наркотиков, контрабанды и товаров двойного назначения в РФ.
            Указанные вес и документы — верные.
          </span>
        </button>

        <StickyCTA>
          <p className="text-center text-sm leading-snug text-muted-foreground">
            CN-KZ — площадка для поиска, а не перевозчик и не гарант доставки. Проверяйте контрагента и
            груз сами.
          </p>
          <Button
            size="xl"
            className="w-full"
            disabled={!valid}
            onClick={() => {
              if (isEdit) saveOrderEdit(editId!, d)
              else publishOrder(d)
              pop()
              setTab("myorders") // покажем заказ в «Мои заказы», а не в общей ленте
            }}
          >
            {isEdit ? "Сохранить изменения" : "Опубликовать"}
          </Button>
        </StickyCTA>
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
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
