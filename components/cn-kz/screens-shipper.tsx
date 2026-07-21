"use client"

import { useEffect, useMemo, useState } from "react"
import {
  BadgeCheck,
  Box,
  Calendar,
  Check,
  Clock,
  Copy,
  Gavel,
  Package,
  Pencil,
  RefreshCw,
  Search,
  ShieldCheck,
  Star,
  Tag,
  Trash2,
  Truck,
  Weight,
  X,
  type LucideIcon,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  TRUCK_TYPES,
  type Order,
  type TruckType,
} from "@/lib/cn-kz/types"
import { CityPicker } from "./city-picker"
import { OrderCard } from "./order-card"
import { ScreenHeader } from "./phone-frame"
import {
  CallButton,
  DealStatusBadge,
  OrderStatusBadge,
  deals,
  money,
  offerLive,
  plural,
  StatusBadge,
} from "./shared"
import { Chip, ChipRow, Countdown, DetailRow, EmptyState, Section, StatStrip, StickyCTA } from "./ui-bits"
import { useCnKz, type NewOrderDraft } from "./store"

// ===== «Signal» local building blocks (skin/layout/density only — no new data) =====

// Route rail — origin BLUE ring → 2px connector → destination LIME ring (CLONE-SPEC route block).
function RouteRail({ className = "" }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
      <span className="route-connector my-1 flex-1" />
      <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
    </div>
  )
}

// Gold 5-star row + number — the trust signal on «Signal» offer/bid cards (CLONE-SPEC offer card).
function Stars5({ value }: { value: number }) {
  const full = Math.round(value)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5",
              i < full
                ? "fill-[var(--star)] text-[var(--star)]"
                : "fill-transparent text-muted-foreground/30"
            )}
          />
        ))}
      </span>
      <span className="font-mono-tech text-sm font-semibold text-foreground">
        {value.toFixed(1)}
      </span>
    </span>
  )
}

// 2-col spec cell — gray inset, eyebrow + value; turns detail whitespace into a scannable table.
function SpecCell({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
}) {
  return (
    <div className="surface-inset rounded-xl px-3.5 py-3">
      <p className="t-eyebrow flex items-center gap-1.5">
        {Icon && <Icon className="size-3.5" />} {label}
      </p>
      <p className="mt-1.5 text-[15px] font-semibold text-foreground">{value}</p>
    </div>
  )
}

// One segment of the offer-summary strip above the bid stack (count / best price / top rating).
function SummarySeg({ value, label, star }: { value: string; label: string; star?: boolean }) {
  return (
    <div className="flex-1 px-3 py-2.5 text-center">
      <p className="font-mono-tech text-[17px] leading-none font-bold text-foreground">
        {star && <span className="text-[var(--star)]">★ </span>}
        {value}
      </p>
      <p className="t-eyebrow mt-1.5">{label}</p>
    </div>
  )
}

const FILTERS = [
  { id: "all", label: "Все" },
  { id: "open", label: "Не принятые" },
  { id: "accepted", label: "Принятые" },
  { id: "archived", label: "Архив" },
] as const

export function ShipperOrdersScreen() {
  const { myOrders, push, togglePin, dealsNewOnly, setDealsNewOnly, isNew, t } = useCnKz()
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

  // Есть ли вообще заказы (не завершённые) — чтобы отличить «пустой фильтр» от «ничего не создано».
  const anyOrders = myOrders.some(
    (o) => !(o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled"))
  )
  const resetView = () => {
    setFilter("all")
    setSort("new")
    setQuery("")
    setDealsNewOnly(false)
  }

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
        title={t("Мои заказы")}
        subtitle={`${activeCount} ${plural(activeCount, t("активный заказ"), t("активных заказа"), t("активных заказов"))} · ${t("по всей СНГ")}`}
      />

      <StatStrip
        items={[
          { value: inBidding, label: t("Не приняты"), icon: Gavel, onClick: () => setFilter("open") },
          { value: activeDeals, label: t("В работе"), icon: Truck, onClick: () => setFilter("accepted") },
          {
            value: newOffers,
            label: t("Новые отклики"),
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
          <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("Поиск по городу назначения, грузу…  #алматы #тент")}
            className="h-12 rounded-lg bg-secondary pl-10 text-base"
          />
        </div>
      </div>

      <ChipRow className="px-4 pb-2">
        {dealsNewOnly && (
          <Chip active onClick={() => setDealsNewOnly(false)}>
            {t("Только новые")} ✕
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
            {t(f.label)}
          </Chip>
        ))}
        <span className="mx-0.5 w-px shrink-0 self-stretch bg-border" />
        <Chip active={sort === "new"} onClick={() => setSort("new")}>{t("Новые")}</Chip>
        <Chip active={sort === "offers"} onClick={() => setSort("offers")}>{t("Больше откликов")}</Chip>
      </ChipRow>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {list.length === 0 &&
          (anyOrders ? (
            <EmptyState
              icon={Search}
              title={t("Ничего не найдено")}
              hint={t("Под этот фильтр или поиск заказов нет — они никуда не делись.")}
              action={
                <Button size="lg" variant="secondary" onClick={resetView}>
                  {t("Сбросить фильтры")}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Package}
              title={t("Здесь пока пусто")}
              hint={t("Опубликуйте заказ — перевозчики начнут откликаться в реальном времени.")}
              action={
                <Button size="lg" onClick={() => push({ type: "createOrder" })}>
                  {t("Создать заказ")}
                </Button>
              }
            />
          ))}
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
  const { getOrder, pop, push, acceptOffer, pickCounterOffer, rejectOffer, counterOffer, republishOrder, deleteOrder, markSeen, t } = useCnKz()
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
  // Сводка по живым откликам — заполняет заголовок секции полезной плотностью (§anti-empty).
  const minPrice = visible.length ? Math.min(...visible.map((o) => o.priceUsd)) : 0
  const bestRating = visible.length ? Math.max(...visible.map((o) => o.carrier.rating)) : 0

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            {t("Заказ")}{" "}
            <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {/* ===== Cargo detail: «Signal» route block + price hero + 2-col spec grid ===== */}
        <div className="surface-glass space-y-4 rounded-2xl p-4">
          {/* route block + status badge */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-1 gap-3">
              <RouteRail className="pt-1.5" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-medium text-muted-foreground">
                  {order.origin}
                </p>
                <p className="t-h2 mt-1 truncate">{order.destination}</p>
              </div>
            </div>
            {order.deal ? (
              <DealStatusBadge status={order.deal.status} />
            ) : (
              <OrderStatusBadge status={order.status} />
            )}
          </div>

          <p className="text-[15px] text-muted-foreground">{order.cargo}</p>

          {/* price hero band + оплата (заполняет правую пустоту) */}
          <div className="flex items-end justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
            <div className="min-w-0">
              <p className="t-eyebrow">{t("Цена заказчика")}</p>
              <p className="t-display mt-1">{money(order.priceUsd)}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="t-eyebrow">{t("Оплата")}</p>
              <p className="mt-1 text-[15px] font-semibold">
                {order.payment === "cash" ? t("Наличные") : t("Перевод")}
              </p>
            </div>
          </div>

          {/* 2-col spec grid — скан-таблица вместо пустоты */}
          <div className="grid grid-cols-2 gap-2">
            <SpecCell icon={Weight} label={t("Вес")} value={`${order.weightKg.toLocaleString("ru-RU")} ${t("кг")}`} />
            <SpecCell icon={Box} label={t("Объём")} value={`${order.volumeM3} м³`} />
            <SpecCell icon={Truck} label={t("Тип кузова")} value={order.truckType} />
            <SpecCell icon={Calendar} label={t("Готов к погрузке")} value={order.readyDate} />
          </div>

          {/* адрес / контакты / примечание — в серой inset-полосе (gutter вместо бордеров) */}
          {(order.pickupPoint ||
            order.pickupPhone ||
            order.address ||
            order.recipientName ||
            order.recipientPhone ||
            order.notes) && (
            <div className="surface-inset space-y-2.5 rounded-xl p-4">
              {order.pickupPoint && <DetailRow label={t("Точка погрузки")} value={order.pickupPoint} />}
              {order.pickupPhone && <DetailRow label={t("Контакт погрузки")} value={order.pickupPhone} />}
              {order.address && <DetailRow label={t("Адрес доставки")} value={order.address} />}
              {(order.recipientName || order.recipientPhone) && (
                <DetailRow
                  label={t("Получатель")}
                  value={[order.recipientName, order.recipientPhone].filter(Boolean).join(" · ")}
                />
              )}
              {order.notes && <DetailRow label={t("Примечание")} value={order.notes} />}
            </div>
          )}
        </div>

        <Section
          title={t("Отклики")}
          right={<span className="t-meta text-muted-foreground">{visible.length} {t("активных")}</span>}
        >
          {visible.length === 0 ? (
            <EmptyState
              icon={Gavel}
              title={
                order.deal
                  ? t("Сделка заключена")
                  : order.status === "archived"
                    ? t("Откликов не было")
                    : t("Пока нет откликов")
              }
              hint={
                order.deal
                  ? t("Остальные отклики отклонены — сделка уже в работе.")
                  : order.status === "archived"
                    ? t("Заказ ушёл в архив без предложений. Можно перепубликовать.")
                    : t("Пуш ушёл подходящим перевозчикам — первые ставки появятся здесь.")
              }
            />
          ) : (
            <>
              {/* summary strip: сколько откликов · лучшая цена · топ-рейтинг */}
              <div className="surface-inset mb-3 flex items-stretch divide-x divide-border rounded-xl">
                <SummarySeg value={String(visible.length)} label={t("откликов")} />
                <SummarySeg value={money(minPrice)} label={t("лучшая цена")} />
                <SummarySeg value={bestRating.toFixed(1)} label={t("топ-рейтинг")} star />
              </div>

              <div className="space-y-3">
                {visible.map((of) => {
                  const pinned = of.awaitingConfirm || of.status === "countered"
                  return (
                    <div
                      key={of.id}
                      onClick={() =>
                        push({
                          type: "carrierProfile",
                          carrierId: of.carrier.id,
                          orderId: order.id,
                          offerId: of.id,
                        })
                      }
                      className={cn(
                        "cursor-pointer rounded-2xl p-4 transition-transform duration-150 active:scale-[0.99]",
                        pinned ? "surface-glass-brand" : "surface-glass"
                      )}
                    >
                      {/* identity + freshness */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 gap-3">
                          <Avatar
                            name={of.carrier.name}
                            className="size-11 shrink-0 rounded-full text-[15px] font-bold"
                          />
                          <div className="min-w-0">
                            <p className="t-h3 flex items-center gap-1 truncate">
                              {of.carrier.name}
                              {of.carrier.verified && (
                                <BadgeCheck className="size-4 shrink-0 text-brand" />
                              )}
                            </p>
                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <Stars5 value={of.carrier.rating} />
                              <span className="t-meta text-muted-foreground">
                                · {deals(of.carrier.dealsCount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="t-meta shrink-0 text-muted-foreground">{of.createdAgo}</span>
                      </div>

                      {/* vehicle params */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground">
                          <Truck className="size-4 opacity-60" /> {of.truck}
                        </span>
                        {of.plate && (
                          <span className="font-mono-tech inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground">
                            {of.plate}
                          </span>
                        )}
                        {of.capacityKg && (
                          <span className="inline-flex items-center rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground tabular-nums">
                            {t("до")} {of.capacityKg.toLocaleString("ru-RU")} {t("кг")}
                          </span>
                        )}
                        {of.kind === "accept" ? (
                          <StatusBadge tone="success" icon={Check}>{t("Готов сразу")}</StatusBadge>
                        ) : (
                          <StatusBadge tone="info">{t("Встречная")}</StatusBadge>
                        )}
                      </div>

                      {of.awaitingConfirm && of.confirmDeadline ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-end justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
                            <div className="min-w-0">
                              <p className="t-eyebrow">{t("Вы выбрали встречную")}</p>
                              <p className="t-display mt-1">{money(of.priceUsd)}</p>
                            </div>
                            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-[color-mix(in_srgb,var(--warn)_14%,transparent)] px-2.5 py-1.5 text-sm font-semibold text-[var(--warn)]">
                              <Clock className="size-4" /> <Countdown deadline={of.confirmDeadline} />
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {t("Ждём подтверждения перевозчика.")}
                          </p>
                          {/* §5: отклик «живой» — можно позвонить перевозчику, пока ждём подтверждения. */}
                          <CallButton phone={of.carrier.phone} className="w-full" />
                        </div>
                      ) : of.status === "countered" ? (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-end justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
                            <div className="min-w-0">
                              <p className="t-eyebrow">{t("Встречная отправлена")}</p>
                              <p className="t-display mt-1">
                                {money(of.shipperCounterUsd ?? of.priceUsd)}
                              </p>
                            </div>
                            <StatusBadge tone="brand">{t("Ждём ответа")}</StatusBadge>
                          </div>
                          {/* §5: контакт раскрыт, пока встречная на рассмотрении. */}
                          <CallButton phone={of.carrier.phone} className="w-full" />
                        </div>
                      ) : (
                        <>
                          {/* price hero + accept (green) — цена самый громкий элемент карточки */}
                          <div className="mt-3 flex items-end justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
                            <div className="min-w-0">
                              <p className="t-eyebrow">{t("Ставка перевозчика")}</p>
                              <p className="t-display mt-1">{money(of.priceUsd)}</p>
                            </div>
                            <Button
                              size="lg"
                              className="h-12 shrink-0 bg-[var(--success)] px-5 text-[15px] text-white hover:bg-[var(--success-strong)]"
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
                              <Check className="size-4" />
                              {of.kind === "accept" ? t("Выбрать") : t("Выбрать встречную")}
                            </Button>
                          </div>

                          {/* secondary actions — серые (gray-fill), без второго акцента */}
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="lg"
                              variant="secondary"
                              className="h-12 flex-1 text-[15px]"
                              onClick={(e) => {
                                e.stopPropagation()
                                setCounterFor(counterFor === of.id ? null : of.id)
                                setCounterVal("")
                              }}
                            >
                              <Tag className="size-4" /> {t("Своя цена")}
                            </Button>
                            {/* §5: контакт раскрыт, пока отклик «живой». */}
                            {offerLive(of.status) && (
                              <CallButton phone={of.carrier.phone} className="flex-1" />
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (rejectFor === of.id) {
                                rejectOffer(order.id, of.id)
                                setRejectFor(null)
                              } else {
                                setRejectFor(of.id)
                              }
                            }}
                            className={cn(
                              "mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-[14px] font-medium transition-colors",
                              rejectFor === of.id
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <X className="size-4" />
                            {rejectFor === of.id ? t("Точно отклонить?") : t("Отклонить отклик")}
                          </button>

                          {counterFor === of.id && (
                            <div className="mt-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
                              <div className="relative flex-1">
                                <span className="absolute top-1/2 left-3.5 -translate-y-1/2 text-[15px] font-bold text-muted-foreground">
                                  $
                                </span>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  value={counterVal}
                                  onChange={(e) => setCounterVal(e.target.value)}
                                  placeholder={`${t("Ваша цена")} (${t("сейчас")} ${of.priceUsd})`}
                                  className="font-mono-tech h-12 pl-7 text-base tabular-nums"
                                />
                              </div>
                              <Button
                                size="lg"
                                className="h-12 text-[15px]"
                                disabled={!counterVal}
                                onClick={() => {
                                  counterOffer(order.id, of.id, Number(counterVal))
                                  setCounterFor(null)
                                }}
                              >
                                {t("Отправить")}
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </Section>

        <div className="flex gap-2">
          {(order.status === "published" || order.status === "bidding") && (
            <Button
              variant="secondary"
              size="lg"
              className="h-12 flex-1 text-[15px]"
              onClick={() => push({ type: "createOrder", editId: order.id })}
            >
              <Pencil className="size-4" /> {t("Редактировать")}
            </Button>
          )}
          <Button
            variant="secondary"
            size="lg"
            className="h-12 flex-1 text-[15px]"
            onClick={() => push({ type: "createOrder", prefillFrom: order.id })}
          >
            <Copy className="size-4" /> {t("Создать копию")}
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
              <Truck className="size-5" /> {t("Открыть сделку")} · {money(order.deal.agreedPriceUsd)}
            </Button>
          </StickyCTA>
        )}

        {order.status === "archived" && (
          <Button
            variant="secondary"
            size="lg"
            className="h-12 w-full text-[15px]"
            onClick={() => {
              republishOrder(order.id)
              pop()
            }}
          >
            <RefreshCw className="size-4" /> {t("Перепубликовать заказ")}
          </Button>
        )}

        {!order.deal && (
          <button
            onClick={() => (confirmDelete ? deleteOrder(order.id) : setConfirmDelete(true))}
            className={cn(
              "flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-[14px] font-medium transition-colors",
              confirmDelete ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Trash2 className="size-4" /> {confirmDelete ? t("Точно удалить заказ?") : t("Удалить заказ")}
          </button>
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
  const { publishOrder, saveOrderEdit, getOrder, pop, setTab, t } = useCnKz()
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
        title={isEdit ? t("Редактировать заказ") : prefillFrom ? t("Копия заказа") : t("Новый заказ")}
        subtitle={isEdit ? t("Изменение условий обновит заказ") : t("Опишите груз и маршрут")}
        onBack={pop}
      />

      <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-6">
        {/* ===== Маршрут — A/B route inputs по route-ring паттерну ===== */}
        <div className="space-y-2">
          <GroupLabel>{t("Маршрут")}</GroupLabel>
          <div className="surface-glass rounded-2xl p-4">
            <div className="flex gap-3">
              <RouteRail className="py-5" />
              <div className="min-w-0 flex-1 space-y-2">
                <CityPicker
                  value={d.origin}
                  onChange={(c) => set("origin", c)}
                  placeholder={t("Откуда — город отправления")}
                />
                <CityPicker
                  value={d.destination}
                  onChange={(c) => set("destination", c)}
                  placeholder={t("Куда — город назначения")}
                />
              </div>
            </div>
            {(d.origin || d.destination) && (
              <button
                onClick={() =>
                  setD((c) => ({ ...c, origin: c.destination, destination: c.origin }))
                }
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-secondary text-[14px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                ⇅ {t("Поменять откуда / куда")}
              </button>
            )}
          </div>
        </div>

        {/* ===== Погрузка ===== */}
        <div className="space-y-3">
          <GroupLabel>{t("Погрузка")}</GroupLabel>
          <Field label={t("Точка погрузки")}>
            <Input
              value={d.pickupPoint}
              onChange={(e) => set("pickupPoint", e.target.value)}
              placeholder={t("Склад / терминал / адрес")}
              className="h-14 text-base"
            />
          </Field>

          <Field label={t("Контакт на погрузке (тел.)")}>
            <Input
              value={d.pickupPhone}
              onChange={(e) => set("pickupPhone", e.target.value)}
              placeholder="+7…"
              inputMode="tel"
              className="h-14 text-base"
            />
          </Field>
        </div>

        {/* ===== О грузе ===== */}
        <div className="space-y-3">
          <GroupLabel>{t("О грузе")}</GroupLabel>
          <Field label={t("Описание груза")}>
            <Textarea
              value={d.cargo}
              onChange={(e) => set("cargo", e.target.value)}
              placeholder={t("Что везём, сколько мест…")}
              className="min-h-20 text-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Вес, кг")}>
              <Input
                type="number"
                inputMode="numeric"
                value={d.weightKg || ""}
                onChange={(e) => set("weightKg", Number(e.target.value))}
                className="h-14 text-base"
              />
            </Field>
            <Field label={t("Объём, м³")}>
              <Input
                type="number"
                inputMode="numeric"
                value={d.volumeM3 || ""}
                onChange={(e) => set("volumeM3", Number(e.target.value))}
                className="h-14 text-base"
              />
            </Field>
          </div>

          <Field label={t("Тип авто")}>
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

          {/* LARGE price field — цена самый крупный ввод формы */}
          <Field label={t("Ваша цена, $")}>
            <div className="relative">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-xl font-bold text-muted-foreground">
                $
              </span>
              <Input
                type="number"
                inputMode="numeric"
                placeholder={t("напр. 1500")}
                value={d.priceUsd || ""}
                onChange={(e) => set("priceUsd", Number(e.target.value))}
                className="font-mono-tech h-14 pl-9 text-xl font-bold tabular-nums"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("Ориентир по похожим маршрутам. Слишком низкая ставка = меньше откликов, а подозрительно дешёвые заказы перевозчики обходят как приманку.")}
            </p>
          </Field>

          <Field label={t("Дата готовности к погрузке")}>
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
        </div>

        {/* ===== Доставка ===== */}
        <div className="space-y-3">
          <GroupLabel>{t("Доставка")}</GroupLabel>
          <Field label={t("Адрес доставки")}>
            <Input
              value={d.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder={t("Город, улица, дом")}
              className="h-14 text-base"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={t("Получатель")}>
              <Input
                value={d.recipientName}
                onChange={(e) => set("recipientName", e.target.value)}
                className="h-14 text-base"
              />
            </Field>
            <Field label={t("Телефон")}>
              <Input
                value={d.recipientPhone}
                onChange={(e) => set("recipientPhone", e.target.value)}
                placeholder="+7…"
                inputMode="tel"
                className="h-14 text-base"
              />
            </Field>
          </div>
        </div>

        {/* ===== Оплата и безопасность ===== */}
        <div className="space-y-3">
          <GroupLabel>{t("Оплата и безопасность")}</GroupLabel>
          <Field label={t("Тип оплаты (договорная)")}>
            <ChipRow>
              <Chip active={d.payment === "cash"} onClick={() => set("payment", "cash")}>
                {t("Наличные")}
              </Chip>
              <Chip
                active={d.payment === "transfer"}
                onClick={() => set("payment", "transfer")}
              >
                {t("Перевод")}
              </Chip>
            </ChipRow>
          </Field>

          {/* Честно для нейтральной площадки: денег не держим. Защита = проверка + записи + совет. */}
          <div className="surface-inset flex w-full items-start gap-3 rounded-xl p-4">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand" />
            <div className="min-w-0">
              <span className="block text-[15px] font-semibold">{t("Безопасная сделка")}</span>
              <span className="mt-0.5 block text-sm text-muted-foreground">
                {t("Перевозчик проверяется по БИН, переписка и фото сохраняются — это ваша защита при споре. Оплата напрямую: платите на счёт компании (по БИН),")}{" "}
                <span className="font-medium text-foreground">{t("не на личную карту")}</span>
                {t(". Площадка деньги не держит.")}
              </span>
            </div>
          </div>
        </div>

        {/* ===== Примечание + декларация ===== */}
        <div className="space-y-3">
          <GroupLabel>{t("Примечание")}</GroupLabel>
          <Field label={t("Ограничения и требования")}>
            <Textarea
              value={d.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder={t("Растаможка, пропуск, хрупкое, простой…")}
              className="min-h-20 text-base"
            />
          </Field>

          {/* Груз в РФ — санкционный риск на коридоре Китай→Россия. Точечная подсказка. */}
          {RU_CITIES.has(d.destination) && (
            <div className="flex items-start gap-2 rounded-xl bg-warn/10 px-3 py-2.5 text-sm text-warn dark:text-warn">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              {t("Груз в РФ: убедитесь, что это не санкционный товар двойного назначения (электроника, чипы, дроны, станки, подшипники). Иначе застрянет на границе, а ответственность — на вас.")}
            </div>
          )}

          {/* Декларация запрещённых грузов — переносит ответственность на заказчика, площадка нейтральна. */}
          <button
            type="button"
            onClick={() => setAttested((v) => !v)}
            className="surface-inset flex w-full items-start gap-3 rounded-xl p-4 text-left"
          >
            <span
              className={
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border " +
                (attested ? "border-brand bg-brand text-brand-foreground" : "border-border bg-background")
              }
            >
              {attested && <Check className="size-3.5" />}
            </span>
            <span className="text-sm text-muted-foreground">
              {t("Подтверждаю: груз")}{" "}
              <span className="font-medium text-foreground">{t("не запрещён и не под санкциями")}</span>
              {" "}{t("— без оружия, наркотиков, контрабанды и товаров двойного назначения в РФ. Указанные вес и документы — верные.")}
            </span>
          </button>
        </div>

        <StickyCTA>
          <p className="text-center text-sm leading-snug text-muted-foreground">
            {t("CN-KZ — площадка для поиска, а не перевозчик и не гарант доставки. Проверяйте контрагента и груз сами.")}
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
            {isEdit ? t("Сохранить изменения") : t("Опубликовать")}
          </Button>
        </StickyCTA>
      </div>
    </div>
  )
}

// Мелкий eyebrow-заголовок группы полей — структурирует длинную форму (§anti-empty).
function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="t-eyebrow pt-1">{children}</p>
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
