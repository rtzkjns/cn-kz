"use client"

import { type ReactNode, useEffect, useState } from "react"
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Box,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  Clock,
  Flag,
  Handshake,
  Plus,
  Search,
  Settings as SettingsIcon,
  Lock,
  LogOut,
  MessageCircle,
  Moon,
  Send,
  ShieldAlert,
  ShieldCheck,
  Truck,
  Wallet,
  Weight,
  type LucideIcon,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  MY_FLEET,
  ME_CARRIER,
  ME_SHIPPER,
  WATCHED_ROUTES,
} from "@/lib/cn-kz/mock-data"
import { DEAL_FLOW, DEAL_STATUS_LABEL, type Order } from "@/lib/cn-kz/types"
import { ScreenHeader } from "./phone-frame"
import { CallButton, deals, DealStatusBadge, kzt, OfferStatusBadge, Rating, StatusBadge, money } from "./shared"
import { Chip, ChipRow, DetailRow, EmptyState, Section, StatStrip, StickyCTA } from "./ui-bits"
import { useCnKz } from "./store"

// ===== «Signal» row primitives: meta-pill + vertical ring route-block (blue origin → lime dest). =====
function Pill({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground tabular-nums">
      <Icon className="size-4 opacity-60" />
      {children}
    </span>
  )
}

function RingRoute({ from, to }: { from: string; to: string }) {
  return (
    <div className="flex gap-2.5">
      <div className="flex flex-col items-center pt-1">
        <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
        <span className="route-connector my-0.5 min-h-3 flex-1" />
        <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
      </div>
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-[15px] font-medium text-muted-foreground">{from}</p>
        <p className="t-h3 mt-0.5 truncate">{to}</p>
      </div>
    </div>
  )
}

// Гроссбух-подвал карточки: eyebrow + цена-герой (32/800) + опц. ≈₸ для перевозчика + действие.
function PriceFooter({
  eyebrow,
  usd,
  showKzt,
  action,
}: {
  eyebrow: string
  usd: number
  showKzt?: boolean
  action?: React.ReactNode
}) {
  return (
    <div className="mt-3 flex items-end justify-between gap-2 rounded-xl bg-secondary px-3.5 py-2.5">
      <div className="min-w-0 leading-none">
        <p className="t-eyebrow">{eyebrow}</p>
        <p className="t-display mt-1.5">{money(usd)}</p>
        {showKzt && (
          <p className="font-mono-tech mt-1.5 text-sm leading-none text-muted-foreground/80">
            {kzt(usd)}
          </p>
        )}
      </div>
      {action}
    </div>
  )
}

// Плитка спец-таблицы (вес/объём/кузов/оплата) — превращает пустое место детали в скан-таблицу.
function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="surface-inset rounded-xl px-3 py-2.5">
      <p className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
        <Icon className="size-3.5 opacity-70" /> {label}
      </p>
      <p className="mt-1 text-[15px] font-semibold text-foreground capitalize tabular-nums">{value}</p>
    </div>
  )
}

// ---------- Deals dashboard ----------

export function DealsScreen() {
  const { myOrders, feedOrders, push, role, dealsNewOnly, setDealsNewOnly, isNew, tripDraft, setTab, t } = useCnKz()
  // Заказчик видит сделки по своим заказам; перевозчик — по выигранным грузам из ленты.
  const source = role === "carrier" ? feedOrders : myOrders
  const deals = source.filter((o) => o.deal)
  const visible = dealsNewOnly ? deals.filter((o) => isNew(o.id)) : deals
  const active = visible.filter((o) => o.deal!.status !== "completed" && o.deal!.status !== "cancelled")
  // Итоги для верхней сводки (анти-пустота) — считаем по ВСЕМ сделкам, не по фильтру «только новые».
  const activeTotal = deals.filter((o) => o.deal!.status !== "completed" && o.deal!.status !== "cancelled").length
  const completedTotal = deals.filter((o) => o.deal!.status === "completed").length
  // Перевозчик: «Отклики» (ожидающие ставки без сделки) слиты в «Мои сделки».
  const myOffers =
    role === "carrier"
      ? source.filter(
          (o) => !o.deal && (o.myOfferStatus === "pending" || o.myOfferStatus === "countered")
        )
      : []
  const settledOffers =
    role === "carrier"
      ? source.filter(
          (o) => !o.deal && (o.myOfferStatus === "rejected" || o.myOfferStatus === "expired")
        )
      : []

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={role === "carrier" ? t("Мои рейсы") : t("Сделки")}
        subtitle={role === "shipper" ? t("Ваши грузы в пути") : t("Отклики и рейсы")}
      />
      {dealsNewOnly && (
        <ChipRow className="px-4 pb-2">
          <Chip active onClick={() => setDealsNewOnly(false)}>
            {t("Только новые")} ✕
          </Chip>
        </ChipRow>
      )}
      {deals.length > 0 && (
        <StatStrip
          items={
            role === "carrier"
              ? [
                  { value: activeTotal, label: t("Активные рейсы"), icon: Truck, accent: true },
                  { value: myOffers.length, label: t("Отклики в ожидании"), icon: Clock },
                  { value: completedTotal, label: t("Завершено"), icon: CheckCheck },
                ]
              : [
                  { value: activeTotal, label: t("Активные сделки"), icon: Truck, accent: true },
                  { value: completedTotal, label: t("Завершено"), icon: CheckCheck },
                  { value: deals.length, label: t("Всего сделок"), icon: Handshake },
                ]
          }
        />
      )}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        {role === "carrier" && (
          <Card
            size="sm"
            onClick={() => push({ type: "tripBuilder" })}
            className="cursor-pointer hover:ring-foreground/20"
          >
            <CardContent className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-md bg-brand/15 text-brand">
                <Truck className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold">{t("Сборный рейс")}</p>
                <p className="text-sm text-muted-foreground">
                  {tripDraft.length > 0
                    ? `${tripDraft.length} ${tripDraft.length === 1 ? t("груз") : t("груза")} ${t("в сборке")}`
                    : t("Соберите несколько грузов в одну фуру")}
                </p>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        )}
        {myOffers.length > 0 && (
          <Section title={t("Отклики · ожидают ответа")}>
            <div className="space-y-2">
              {myOffers.map((o) => (
                <OfferRow
                  key={o.id}
                  order={o}
                  onClick={() => push({ type: "cargoDetail", orderId: o.id })}
                />
              ))}
            </div>
          </Section>
        )}
        <Section title={t("Активные")}>
          {active.length === 0 && (
            <EmptyState
              icon={Truck}
              title={dealsNewOnly ? t("Нет сделок с новыми событиями") : t("Пока нет активных сделок")}
              hint={
                dealsNewOnly
                  ? t("Новые отклики и сообщения появятся здесь.")
                  : role === "carrier"
                    ? t("Откликнитесь на груз в ленте — принятый заказ появится здесь как рейс.")
                    : t("Опубликуйте заказ и выберите перевозчика — сделка появится здесь.")
              }
              action={
                dealsNewOnly ? (
                  <Button variant="secondary" className="h-12" onClick={() => setDealsNewOnly(false)}>
                    {t("Показать все сделки")}
                  </Button>
                ) : (
                  <Button size="xl" onClick={() => setTab(role === "carrier" ? "feed" : "myorders")}>
                    <Search className="size-5" />
                    {role === "carrier" ? t("Смотреть грузы") : t("Мои заказы")}
                  </Button>
                )
              }
            />
          )}
          <div className="space-y-2">
            {active.map((o) => (
              <DealRow key={o.id} order={o} isNew={isNew(o.id)} onClick={() => push({ type: "deal", orderId: o.id })} />
            ))}
          </div>
        </Section>

        {settledOffers.length > 0 && (
          <Section title={t("История откликов")}>
            <div className="space-y-2">
              {settledOffers.map((o) => (
                <OfferRow
                  key={o.id}
                  order={o}
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

function DealRow({
  order,
  isNew,
  onClick,
}: {
  order: Order
  isNew: boolean
  onClick: () => void
}) {
  const { role, t } = useCnKz()
  // Показываем ВТОРУЮ сторону: перевозчику — заказчика, заказчику — перевозчика.
  const other = role === "carrier" ? order.shipper : order.deal!.carrier
  const unread = order.deal!.chat.filter((m) => !m.fromMe).length
  return (
    <div
      onClick={onClick}
      className="surface-glass group cursor-pointer rounded-2xl p-4 transition-transform duration-150 active:scale-[0.99]"
    >
      {/* Trust header: контрагент + рейтинг · статусы справа */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={other.name} className="size-11 shrink-0 rounded-full text-[15px] font-bold" />
          <div className="min-w-0 leading-tight">
            <p className="t-h3 flex items-center gap-1 truncate">
              <span className="truncate">{other.name}</span>
              {other.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <Rating value={other.rating} /> · {role === "carrier" ? t("заказчик") : t("перевозчик")}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <DealStatusBadge status={order.deal!.status} />
          <div className="flex flex-wrap items-center justify-end gap-1">
            {order.overdue && order.deal!.status === "accepted" && (
              <StatusBadge tone="warn">{t("Опаздывает")}</StatusBadge>
            )}
            {order.deal!.tripId && <Badge variant="outline">{t("Рейс")}</Badge>}
            {isNew && <Badge variant="brand">{t("новое")}</Badge>}
          </div>
        </div>
      </div>

      {/* Route block — origin blue ring → connector → destination lime ring */}
      <div className="mt-3">
        <RingRoute from={order.origin} to={order.destination} />
      </div>

      {/* Cargo */}
      <p className="mt-3 line-clamp-1 text-[15px] text-muted-foreground">{order.cargo}</p>

      {/* Meta pills — вес/кузов/объём */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill icon={Truck}>{order.truckType}</Pill>
        <Pill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} {t("кг")}</Pill>
        <Pill icon={Box}>{order.volumeM3} {t("м³")}</Pill>
      </div>

      {/* Price footer — согласованная цена-герой + вход в сделку */}
      <PriceFooter
        eyebrow={t("Согласовано")}
        usd={order.deal!.agreedPriceUsd}
        showKzt={role === "carrier"}
        action={
          <span className="mb-0.5 inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-[15px] font-semibold text-foreground">
            {unread > 0 && <MessageCircle className="size-4 text-brand" />}
            {t("Открыть")}
            <ChevronRight className="size-4" />
          </span>
        }
      />
    </div>
  )
}

// Плотная карточка отклика перевозчика (ставка) — свёрнута в «Мои рейсы».
function OfferRow({ order, onClick }: { order: Order; onClick: () => void }) {
  const { t } = useCnKz()
  const countered = order.myOfferStatus === "countered"
  const priceUsd = order.myCounterPriceUsd ?? order.myOfferPriceUsd ?? order.priceUsd
  return (
    <div
      onClick={onClick}
      className="surface-glass group cursor-pointer rounded-2xl p-4 transition-transform duration-150 active:scale-[0.99]"
    >
      {/* Trust header: заказчик + рейтинг · статус отклика справа */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={order.shipper.name} className="size-11 shrink-0 rounded-full text-[15px] font-bold" />
          <div className="min-w-0 leading-tight">
            <p className="t-h3 flex items-center gap-1 truncate">
              <span className="truncate">{order.shipper.name}</span>
              {order.shipper.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              <Rating value={order.shipper.rating} /> · {t("заказчик")}
            </p>
          </div>
        </div>
        <OfferStatusBadge status={order.myOfferStatus!} />
      </div>

      {/* Route block */}
      <div className="mt-3">
        <RingRoute from={order.origin} to={order.destination} />
      </div>

      {/* Cargo */}
      <p className="mt-3 line-clamp-1 text-[15px] text-muted-foreground">{order.cargo}</p>

      {/* Meta pills */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill icon={Truck}>{order.truckType}</Pill>
        <Pill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} {t("кг")}</Pill>
        <Pill icon={Box}>{order.volumeM3} {t("м³")}</Pill>
      </div>

      {/* Price footer — ваша ставка / встречная цена-герой */}
      <PriceFooter
        eyebrow={countered ? t("Встречная заказчика") : t("Ваш отклик")}
        usd={priceUsd}
        showKzt
        action={
          <span className="mb-0.5 inline-flex h-11 shrink-0 items-center gap-1 rounded-md px-3 text-[15px] font-semibold text-foreground">
            {t("Открыть")}
            <ChevronRight className="size-4" />
          </span>
        }
      />
    </div>
  )
}

// ---------- Deal detail ----------

// Свёрнутый тоггл для второстепенных блоков сделки (журнал/претензия/кто везёт) — FINAL-SPEC §6.
function Collapse({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
}) {
  return (
    <details className="group rounded-md border border-border bg-card">
      <summary className="flex h-12 cursor-pointer list-none items-center gap-2 px-3 text-[15px] font-medium text-foreground [&::-webkit-details-marker]:hidden">
        <Icon className="size-4 text-muted-foreground" />
        <span className="flex-1">{title}</span>
        <ChevronRight className="size-4 text-muted-foreground transition-transform group-open:rotate-90" />
      </summary>
      <div className="space-y-2 border-t border-border px-3 py-3">{children}</div>
    </details>
  )
}

export function DealScreen({ orderId }: { orderId: string }) {
  const {
    getOrder,
    pop,
    push,
    role,
    advanceDeal,
    markAtBorder,
    confirmDelivery,
    cancelDeal,
    logDealEvent,
    fileClaim,
    attachPod,
    submitRating,
    showToast,
    markSeen,
    t,
  } = useCnKz()
  const order = getOrder(orderId)
  // Открыли сделку → события прочитаны (сбрасывает «новое» и счётчик колокольчика).
  useEffect(() => {
    markSeen(orderId)
    // markSeen — идемпотентный функциональный апдейт; зависим только от orderId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId])
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState("")
  const [criteria, setCriteria] = useState<string[]>([])
  const [showCancel, setShowCancel] = useState(false)
  const [confirmAdvance, setConfirmAdvance] = useState(false)
  const [showClaim, setShowClaim] = useState(false)
  const [claimReason, setClaimReason] = useState("")
  const [claimNote, setClaimNote] = useState("")
  // Низкая оценка (1–2★) требует комментарий — MVP §8.
  const commentRequired = stars > 0 && stars <= 2
  const canSubmitRating = stars > 0 && (!commentRequired || comment.trim().length > 0)
  const toggleCriterion = (c: string) =>
    setCriteria((cur) => (cur.includes(c) ? cur.filter((x) => x !== c) : [...cur, c]))

  if (!order?.deal) return null
  const deal = order.deal
  const rated = order.ratedStars != null
  const cancelled = deal.status === "cancelled"
  const completed = deal.status === "completed"
  const curIdx = DEAL_FLOW.indexOf(deal.status)
  // Основное действие водителя — одна кнопка «следующее действие» (2 обязательных тапа):
  const driverNext: "pickup" | "deliver" | null =
    deal.status === "accepted"
      ? "pickup"
      : deal.status === "picked_up" || deal.status === "at_border"
        ? "deliver"
        : null
  const canConfirmDelivery = role === "shipper" && deal.status === "delivered"
  const canCancel = deal.status === "accepted" // отмена только до «Забрал груз»
  const other = role === "shipper" ? deal.carrier : order.shipper
  // Привязка «кто реально везёт» — против переуступки/двойного брокериджа.
  const acceptedOffer = order.offers.find((o) => o.status === "accepted")
  const boundTruckType = acceptedOffer?.truck ?? order.myOfferTruck?.type ?? order.truckType
  const boundPlate = acceptedOffer?.plate ?? order.myOfferTruck?.plate
  // Большая кнопка «следующее действие» с подтверждением в 2 тапа (без свайпа — он плохо в перчатках/мороз).
  const tapAdvance = () => {
    if (confirmAdvance) {
      advanceDeal(order.id)
      setConfirmAdvance(false)
    } else {
      setConfirmAdvance(true)
    }
  }
  const submitRatingNow = () => submitRating(order.id, stars, criteria, comment)

  // ОДНО нижнее действие по (статус × роль) — FINAL-SPEC §6. 2-тап меняет и ЦВЕТ, и текст.
  // Цвет подтверждения задаём inline-стилем — гарантированно перекрывает bg-primary (равная специфичность классов).
  const confirmStyle = confirmAdvance
    ? { backgroundColor: "var(--success)", color: "#fff" }
    : undefined
  let primary: ReactNode = null
  let waiting: string | null = null
  if (completed && !rated) {
    primary = (
      <Button size="xl" className="w-full" disabled={!canSubmitRating} onClick={submitRatingNow}>
        {t("Отправить оценку")}
      </Button>
    )
  } else if (!completed && !cancelled) {
    if (role === "carrier") {
      if (driverNext === "pickup") {
        primary = (
          <Button size="xl" className="w-full" style={confirmStyle} onClick={tapAdvance}>
            <Check /> {confirmAdvance ? t("Точно забрали груз?") : t("Забрал груз")}
          </Button>
        )
      } else if (driverNext === "deliver") {
        // «Прошёл границу» + «Фото выгрузки» — тихая вторичная строка НАД основной (не три равные кнопки).
        primary = (
          <>
            <div className="flex gap-2">
              {deal.status === "picked_up" && (
                <Button
                  variant="outline"
                  className="h-12 flex-1"
                  onClick={() => markAtBorder(order.id)}
                >
                  <Flag className="size-4" /> {t("Прошёл границу")}
                </Button>
              )}
              <Button
                variant="outline"
                className="h-12 flex-1"
                onClick={() => attachPod(order.id)}
              >
                <Camera className="size-4" /> {deal.podPhoto ? t("Фото добавлено ✓") : t("Фото выгрузки")}
              </Button>
            </div>
            <Button size="xl" className="w-full" style={confirmStyle} onClick={tapAdvance}>
              <Check /> {confirmAdvance ? t("Точно доставили?") : t("Доставил груз")}
            </Button>
          </>
        )
      } else {
        waiting = t("Груз доставлен — ждём подтверждения получения заказчиком.")
      }
    } else if (canConfirmDelivery) {
      primary = (
        <Button size="xl" className="w-full" onClick={() => confirmDelivery(order.id)}>
          <Check /> {t("Подтвердить получение")}
        </Button>
      )
    } else {
      waiting = t("Перевозчик обновляет статус доставки — изменения появятся здесь.")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            {t("Сделка")}{" "}
            <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-0">
        {/* status — простой степпер: «На границе» мягкий/необязательный узел */}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-semibold">{t("Статус доставки")}</span>
              <DealStatusBadge status={deal.status} />
            </div>
            {cancelled ? (
              <p className="text-sm text-destructive">{t("Сделка отменена")}</p>
            ) : (
              <>
                <ol className="space-y-2.5">
                  {DEAL_FLOW.map((st, i) => {
                    const isBorder = st === "at_border"
                    const passed = completed || i < curIdx
                    const done = isBorder ? !!deal.crossedBorder : passed
                    const current = !completed && i === curIdx
                    return (
                      <li key={st} className="flex items-center gap-2.5 text-[15px]">
                        <span
                          className={
                            "flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-medium " +
                            (done
                              ? "bg-brand text-brand-foreground"
                              : current
                                ? "border border-brand text-brand"
                                : "bg-muted text-muted-foreground")
                          }
                        >
                          {done ? <Check className="size-3.5" /> : i + 1}
                        </span>
                        <span className={done || current ? "font-medium text-foreground" : "text-muted-foreground"}>
                          {t(DEAL_STATUS_LABEL[st])}
                        </span>
                        {current && (
                          <span className="ml-auto text-xs font-medium text-brand">{t("сейчас")}</span>
                        )}
                        {isBorder && !done && !current && (
                          <span className="ml-auto text-xs text-muted-foreground">{t("необязательно")}</span>
                        )}
                      </li>
                    )
                  })}
                </ol>
                {deal.updatedAgo && (
                  <p className="text-sm text-muted-foreground">{t("Обновлено")}: {deal.updatedAgo}</p>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* other party — обе стороны могут открыть профиль контрагента (симметрия проверки/жалобы) */}
        <Card
          size="sm"
          onClick={
            role === "shipper"
              ? () => push({ type: "carrierProfile", carrierId: deal.carrier.id })
              : () => push({ type: "shipperProfile", orderId: order.id })
          }
          className="cursor-pointer hover:ring-foreground/20"
        >
          <CardContent className="flex items-center gap-3">
            <Avatar name={other.name} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-base font-medium">
                {other.name}
                {other.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
              </p>
              <p className="text-sm text-muted-foreground">
                <Rating value={other.rating} /> ·{" "}
                {role === "shipper" ? t("перевозчик") : t("заказчик")}
              </p>
            </div>
            <Button
              size="icon-touch"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                push({ type: "chat", orderId: order.id })
              }}
              aria-label={t("Чат")}
            >
              <MessageCircle className="size-5" />
            </Button>
            <ChevronRight className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>

        {/* Сделка = контакт раскрыт (FINAL-SPEC §5). Звонок — высокоакцентная вторичная. */}
        <CallButton phone={other.phone} className="w-full" />

        {/* Детали груза — цена-герой + 2-колоночная спец-таблица (анти-пустота §детали). */}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="leading-none">
              <p className="t-eyebrow">{t("Согласованная цена")}</p>
              <p className="t-display mt-1.5">{money(deal.agreedPriceUsd)}</p>
              {role === "carrier" && (
                <p className="font-mono-tech mt-1.5 text-sm leading-none text-muted-foreground/80">
                  {kzt(deal.agreedPriceUsd)} · {t("оплата в USD")}
                </p>
              )}
            </div>
            <p className="text-[15px] text-foreground">{order.cargo}</p>
            <div className="grid grid-cols-2 gap-2">
              <Spec icon={Weight} label={t("Вес")} value={`${order.weightKg.toLocaleString("ru-RU")} ${t("кг")}`} />
              <Spec icon={Box} label={t("Объём")} value={`${order.volumeM3} ${t("м³")}`} />
              <Spec icon={Truck} label={t("Кузов")} value={order.truckType} />
              <Spec icon={Wallet} label={t("Оплата")} value={order.payment === "cash" ? t("Наличные") : t("Перевод")} />
            </div>
            <div className="space-y-1.5">
              <DetailRow label={t("Готов к погрузке")} value={order.readyDate} />
              {order.deliverBy && <DetailRow label={t("Срок доставки")} value={order.deliverBy} />}
              <DetailRow label={t("Адрес доставки")} value={order.address} />
            </div>
          </CardContent>
        </Card>

        {order.overdue && !completed && !cancelled && (
          <div className="flex items-center gap-2 rounded-md bg-warn/10 px-3 py-2.5 text-sm text-warn dark:text-warn">
            <ShieldAlert className="size-4 shrink-0" /> {t("Перевозчик опаздывает к сроку доставки. Напишите в чат или согласуйте новый срок.")}
          </div>
        )}
        <div className="flex items-start gap-2 rounded-md bg-brand/10 px-3 py-2.5 text-sm text-foreground">
          <Lock className="mt-0.5 size-4 shrink-0 text-brand" />
          <span>
            <span className="font-medium">{t("Безопасная сделка.")} </span>
            {cancelled
              ? t("Сделка отменена — оплата не проводится.")
              : completed
                ? `${t("Доставка подтверждена — можно провести оплату")} ${money(deal.agreedPriceUsd)}.`
                : `${t("Стороны проверены, переписка и фото сохранены. Оплату")} ${money(deal.agreedPriceUsd)} ${t("проводите после подтверждения доставки — на счёт компании по БИН, не на личную карту. Площадка деньги не держит.")}`}
          </span>
        </div>
        {!cancelled && !completed && (
          <div className="flex items-start gap-2 rounded-md bg-warn/10 px-3 py-2.5 text-sm text-warn dark:text-warn">
            <ShieldAlert className="mt-0.5 size-4 shrink-0" />
            <span>
              {t("Аванс на топливо — обычное дело. Проводите его через приложение проверенному перевозчику (по БИН),")}{" "}
              <span className="font-medium">{t("не на личную карту и не по просьбе вне сделки")}</span>{" "}
              {t("— задаток на карту незнакомцу до сделки берут мошенники.")}
            </span>
          </div>
        )}

        {/* chat entry — крупная вторичная кнопка */}
        <Button
          variant="secondary"
          className="h-12 w-full justify-start text-[15px]"
          onClick={() => push({ type: "chat", orderId: order.id })}
        >
          <MessageCircle className="size-5" /> {t("Чат с")}{" "}
          {role === "shipper" ? t("перевозчиком") : t("заказчиком")}
          {deal.chat.length > 0 && (
            <Badge variant="muted" className="ml-auto">
              {deal.chat.length}
            </Badge>
          )}
        </Button>

        {/* rating after completion */}
        {completed && !rated && (
          <Card size="sm" className="surface-glass-brand">
            <CardContent className="space-y-3">
              <p className="text-base font-semibold">
                {t("Оцените")} {role === "shipper" ? t("перевозчика") : t("заказчика")}
              </p>
              <div className="flex justify-center gap-2 text-4xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    onClick={() => setStars(n)}
                    className={
                      "transition-transform hover:scale-110 " +
                      (n <= stars ? "text-foreground" : "text-muted-foreground/40")
                    }
                  >
                    ★
                  </button>
                ))}
              </div>
              {stars > 0 && stars <= 4 && (
                <div className="flex flex-wrap justify-center gap-1.5">
                  {["Пунктуальность", "Состояние груза", "Документы", "Связь"].map((c) => (
                    <button
                      key={c}
                      onClick={() => toggleCriterion(c)}
                      className={
                        "min-h-11 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors " +
                        (criteria.includes(c)
                          ? "border-brand/40 bg-brand/15 text-brand"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      {t(c)}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  commentRequired
                    ? t("Комментарий обязателен при оценке 1–2★")
                    : t("Комментарий (необязательно)")
                }
                className={
                  "min-h-16 text-base " + (commentRequired && !comment.trim() ? "border-destructive" : "")
                }
              />
            </CardContent>
          </Card>
        )}
        {completed && rated && (
          <Card size="sm">
            <CardContent className="space-y-1.5 text-[15px]">
              <p className="text-foreground">
                <Check className="inline size-4" /> {t("Ваша оценка")} {other.name.split(" ")[0]}: {order.ratedStars}★
              </p>
              {order.counterpartRating == null ? (
                <p className="text-sm text-muted-foreground">
                  {t("Оценка")} {role === "shipper" ? t("перевозчика") : t("заказчика")} {t("появится, когда он тоже оценит вас (взаимно и вслепую).")}
                </p>
              ) : (
                <p className="text-foreground">
                  <Rating value={order.counterpartRating} />{" "}
                  <span className="text-muted-foreground">— {role === "shipper" ? t("перевозчик") : t("заказчик")} {t("оценил вас")}</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Второстепенное — свёрнутые тоггли НИЖЕ основного действия (FINAL-SPEC §6) */}
        {!cancelled && (
          <div className="space-y-2">
            {/* Анти-переуступка (двойной брокеридж) — кто реально везёт закреплён за сделкой. */}
            <Collapse title={t("Кто выполняет рейс")} icon={Truck}>
              <p className="text-sm font-medium text-foreground">
                {deal.carrier.name}
                {boundPlate && (
                  <span className="ml-1 font-mono-tech text-muted-foreground">· {boundPlate}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {boundTruckType} · {t("переуступка груза запрещена.")}{" "}
                {role === "shipper"
                  ? t("Сверьте гос.номер и водителя при погрузке — везти должна эта машина.")
                  : t("Везти должны вы на этой машине, передавать заказ нельзя.")}
              </p>
            </Collapse>

            {/* Отметки рейса — таймстампы прибытия/простоя (защита перевозчика на детеншене). */}
            <Collapse title={t("Отметки рейса")} icon={Clock}>
              {deal.log && deal.log.length > 0 ? (
                <div className="space-y-1">
                  {deal.log.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{t(e.label)}</span>
                      <span className="font-mono-tech text-muted-foreground">{e.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("Отмечайте прибытие и простой — фиксируется со временем и защищает вас при споре.")}
                </p>
              )}
              {role === "carrier" && !completed && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Прибыл на погрузку", "Прибыл на выгрузку"].map((l) => (
                    <button
                      key={l}
                      onClick={() => logDealEvent(order.id, l)}
                      className="min-h-11 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {t(l)}
                    </button>
                  ))}
                  <button
                    onClick={() => logDealEvent(order.id, "Простой / срыв погрузки")}
                    className="min-h-11 rounded-md border border-warn/40 px-3 py-2 text-sm font-medium text-warn dark:text-warn"
                  >
                    {t("Зафиксировать простой")}
                  </button>
                </div>
              )}
            </Collapse>

            {/* «Что-то не так со сделкой?» — вход в поддержку/спор с доказательствами. */}
            {deal.claim ? (
              <div className="flex items-start gap-2 rounded-md border border-warn/40 bg-warn/10 px-3 py-2.5 text-sm text-warn dark:text-warn">
                <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                <span>
                  <span className="font-medium">{t("Поддержка разбирается")}: {t(deal.claim.reason)}.</span>{" "}
                  {t("Переписку и фото приложили как доказательства — поможем с посредничеством. Оплату до решения лучше придержать.")}
                </span>
              </div>
            ) : (
              <Collapse title={t("Что-то не так со сделкой?")} icon={ShieldAlert}>
                <p className="text-sm text-muted-foreground">
                  {t("Опишите проблему — поможем с доказательствами и посредничеством.")}
                </p>
                <Button
                  variant="outline"
                  className="h-12 w-full"
                  onClick={() => setShowClaim(true)}
                >
                  <ShieldAlert className="size-4" /> {t("Открыть претензию")}
                </Button>
              </Collapse>
            )}
          </div>
        )}

        {/* Отмена — вторичное действие до забора груза (§6). */}
        {canCancel && (
          <Button
            variant="destructive"
            className="h-12 w-full"
            onClick={() => setShowCancel(true)}
          >
            {t("Отменить сделку")}
          </Button>
        )}

        {/* Состояние ожидания — без основного действия (§6). */}
        {waiting && (
          <p className="rounded-md bg-muted px-3 py-3 text-center text-sm text-muted-foreground">
            {waiting}
          </p>
        )}

        {/* ОДНО нижнее закреплённое действие (§6). */}
        {primary && <StickyCTA>{primary}</StickyCTA>}
      </div>

      {/* cancel-confirmation — показываем цену отмены (главный рычаг против срывов) */}
      {showCancel && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowCancel(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-3 rounded-t-3xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">{t("Отменить сделку?")}</p>
            <p className="text-sm text-muted-foreground">
              {role === "carrier"
                ? t("Отмена принятого заказа снизит вашу надёжность на −10 и может ограничить доступ к премиум-грузам.")
                : t("Отмена оставит перевозчика без груза и повлияет на ваш рейтинг заказчика.")}
            </p>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              <ShieldAlert className="size-4 shrink-0 text-warn" /> {t("Форс-мажор (поломка, граница)? Отмена без штрафа — приложите фото.")}
            </div>
            <div className="space-y-2">
              <Button
                variant="destructive"
                className="h-12 w-full"
                onClick={() => {
                  cancelDeal(order.id)
                  setShowCancel(false)
                }}
              >
                {role === "carrier" ? t("Отменить (−10 к надёжности)") : t("Отменить сделку")}
              </Button>
              <Button
                variant="outline"
                className="h-12 w-full"
                onClick={() => {
                  setShowCancel(false)
                  showToast(t("Заявка о форс-мажоре отправлена на проверку"))
                }}
              >
                <ShieldAlert className="size-4" /> {t("Это форс-мажор")}
              </Button>
              <button
                onClick={() => setShowCancel(false)}
                className="min-h-11 w-full py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground"
              >
                {t("Оставить сделку")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Претензия — структурная форма: причина + описание + авто-доказательства. */}
      {showClaim && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowClaim(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-3 rounded-t-3xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">{t("Что случилось?")}</p>
            <p className="-mt-1 text-sm text-muted-foreground">
              {t("Опишите проблему — поможем с доказательствами и посредничеством. Площадка деньги не держит, поэтому оплату до решения придержите сами.")}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["Не оплатили", "Груз повреждён", "Срыв погрузки", "Вес не совпал", "Другое"].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setClaimReason(r)}
                    className={
                      "min-h-11 rounded-full border px-3 py-2 text-sm font-medium transition-colors " +
                      (claimReason === r
                        ? "border-brand/40 bg-brand/15 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t(r)}
                  </button>
                )
              )}
            </div>
            <Textarea
              value={claimNote}
              onChange={(e) => setClaimNote(e.target.value)}
              placeholder={t("Опишите, что произошло…")}
              className="min-h-16 text-base"
            />
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
              <Camera className="size-4 shrink-0 text-brand" /> {t("Чат и фото выгрузки приложатся автоматически как доказательства.")}
            </div>
            <Button
              size="xl"
              className="w-full"
              disabled={!claimReason}
              onClick={() => {
                fileClaim(order.id, claimReason, claimNote)
                setShowClaim(false)
                setClaimReason("")
                setClaimNote("")
              }}
            >
              {t("Отправить в поддержку")}
            </Button>
            <button
              onClick={() => setShowClaim(false)}
              className="min-h-11 w-full py-1 text-center text-[15px] font-medium text-muted-foreground hover:text-foreground"
            >
              {t("Отмена")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Chat ----------

export function ChatScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, sendMessage, role, t } = useCnKz()
  const order = getOrder(orderId)
  const [text, setText] = useState("")
  if (!order?.deal) return null
  const other = role === "shipper" ? order.deal.carrier : order.shipper

  const send = () => {
    if (!text.trim()) return
    sendMessage(order.id, text.trim())
    setText("")
  }

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={other.name} subtitle={t("Чат сделки")} onBack={pop} />

      {/* Контекст сделки — чтобы чат не «висел в пустоте»: маршрут + груз + согласованная цена. */}
      <div className="surface-glass mx-4 mt-2 flex shrink-0 items-center gap-3 rounded-2xl px-3.5 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
          <Truck className="size-5" />
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[15px] font-semibold">
            {order.origin} <span className="font-normal text-muted-foreground">→</span> {order.destination}
          </p>
          <p className="truncate text-sm text-muted-foreground">{order.cargo}</p>
        </div>
        <div className="shrink-0 text-right leading-none">
          <p className="font-mono-tech text-[17px] font-bold tabular-nums">
            {money(order.deal.agreedPriceUsd)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(DEAL_STATUS_LABEL[order.deal.status])}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {order.deal.chat.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title={t("Сообщений пока нет")}
            hint={t("Уточните детали груза, время погрузки и место встречи.")}
          />
        )}
        {order.deal.chat.map((m) => (
          <div
            key={m.id}
            className={"flex " + (m.fromMe ? "justify-end" : "justify-start")}
          >
            <div
              className={
                "max-w-[78%] rounded-2xl px-3 py-2 text-base " +
                (m.fromMe
                  ? "rounded-br-[2px] bg-primary text-primary-foreground"
                  : "rounded-bl-[2px] bg-secondary text-foreground")
              }
            >
              {m.text}
              <span
                className={
                  "ml-2 align-bottom text-xs " +
                  (m.fromMe ? "text-brand-foreground/60" : "text-muted-foreground")
                }
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-card p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={t("Сообщение…")}
          className="h-14 rounded-lg bg-secondary text-base"
        />
        <Button className="size-14 shrink-0 rounded-lg" onClick={send} disabled={!text.trim()}>
          <Send className="size-5" />
        </Button>
      </div>
    </div>
  )
}

// ---------- Profile ----------

export function ProfileScreen() {
  const { role, me, myOrders, resetOnboarding, setTab, showToast, reliability, cancelCount, t } = useCnKz()
  const reliable = reliability >= 90
  const [quiet, setQuiet] = useState(true)
  // Заказы «в работе» заказчика (не архив, не завершено/отменено) — для сводки статистики.
  const activeOrders = myOrders.filter(
    (o) => o.status !== "archived" && o.deal?.status !== "completed" && o.deal?.status !== "cancelled"
  ).length

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Профиль")} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <Avatar name={me.name} className="size-14 text-base" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold">{me.name}</p>
              {me.company && (
                <p className="truncate text-sm text-muted-foreground">{me.company}</p>
              )}
              <p className="mt-0.5 text-sm text-muted-foreground">
                <Rating value={me.rating} /> · {deals(me.dealsCount)}
              </p>
            </div>
            <Badge variant="brand">{role === "shipper" ? t("Заказчик") : t("Перевозчик")}</Badge>
          </CardContent>
        </Card>

        {/* Заказчик: сводка статистики — заполняет верх профиля (анти-пустота). */}
        {role === "shipper" && (
          <Section title={t("Моя статистика")}>
            <Card size="sm">
              <CardContent>
                <div className="flex items-center justify-around text-center">
                  <div>
                    <div className="font-mono-tech text-xl font-bold">{me.dealsCount}</div>
                    <div className="text-sm text-muted-foreground">{t("сделок")}</div>
                  </div>
                  <div>
                    <div className="font-mono-tech text-xl font-bold">{me.rating.toFixed(1)}</div>
                    <div className="text-sm text-muted-foreground">{t("рейтинг")}</div>
                  </div>
                  <div>
                    <div className="font-mono-tech text-xl font-bold text-brand">{activeOrders}</div>
                    <div className="text-sm text-muted-foreground">{t("в работе")}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Section>
        )}

        {/* История + Настройки — быстрый доступ */}
        <Card size="sm">
          <CardContent className="divide-y divide-border">
            <button onClick={() => setTab("history")} className="flex min-h-12 w-full items-center gap-3 py-2.5 text-left text-base">
              <Clock className="size-5 text-muted-foreground" />
              <span className="flex-1">{role === "carrier" ? t("История рейсов") : t("История заказов")}</span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
            <button onClick={() => setTab("settings")} className="flex min-h-12 w-full items-center gap-3 py-2.5 text-left text-base">
              <SettingsIcon className="size-5 text-muted-foreground" />
              <span className="flex-1">{t("Настройки")}</span>
              <ChevronRight className="size-5 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Честная проверка — без госбаз: телефон, фото, сверка селфи с документом, отзывы */}
        <Section title={t("Проверка профиля")}>
          <Card size="sm">
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" /> {t("Телефон подтверждён")}
                </span>
                <StatusBadge tone="success">{t("Да")}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" /> {t("БИН/ИНН сверен с реестром юрлиц")}
                </span>
                <StatusBadge tone="success">{t("Проверен")}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand" /> {t("Профиль с фото (селфи)")}
                </span>
                <StatusBadge tone="success">{t("Есть")}</StatusBadge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand" /> {t("Селфи сверено с документом")}
                </span>
                <StatusBadge tone="success">{t("Совпало")}</StatusBadge>
              </div>
              {role === "carrier" && (
                <button
                  onClick={() => showToast(t("Загрузка фото фуры с гос. номером"))}
                  className="flex w-full items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Camera className="size-4 text-muted-foreground" /> {t("Транспорт · фото с гос. номером")}
                  </span>
                  <StatusBadge tone="success">{t("На файле")}</StatusBadge>
                </button>
              )}
              <p className="pt-1 text-sm leading-snug text-muted-foreground">
                {t("Значок «Бизнес проверен» = БИН/ИНН найден в реестре юрлиц и селфи совпало с удостоверением. Базы МВД/розыска подключаем поэтапно — проверка снижает риск, но не даёт 100% гарантии.")}
              </p>
            </CardContent>
          </Card>
        </Section>

        {role === "shipper" && (
          <Section title={t("Аналитика")}>
            <Card
              size="sm"
              onClick={() => setTab("analytics")}
              className="cursor-pointer hover:ring-foreground/20"
            >
              <CardContent className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-brand/15 text-brand">
                  <BarChart3 className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium">{t("Аналитика заказов")}</p>
                  <p className="text-sm text-muted-foreground">{t("Расходы, топ маршрутов, качество откликов")}</p>
                </div>
                <ChevronRight className="size-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </Section>
        )}

        {role === "carrier" && (
          <>
            <Section title={t("Надёжность")}>
              <Card size="sm">
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-lg font-bold">{reliability} / 100</span>
                    <StatusBadge tone={reliable ? "success" : "warn"}>
                      {reliable ? t("Надёжный ✓") : t("Снижена")}
                    </StatusBadge>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={"h-full rounded-full " + (reliable ? "bg-brand" : "bg-warn")}
                      style={{ width: `${reliability}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t("За последние 20 заказов ·")} {cancelCount}{" "}
                    {cancelCount === 1 ? t("отмена") : cancelCount >= 2 && cancelCount <= 4 ? t("отмены") : t("отмен")}.{" "}
                    {t("Каждая отмена принятого заказа: −10. Высокая надёжность = приоритет в ленте и доступ к премиум-грузам.")}
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section title={t("Моя статистика")}>
              <Card size="sm">
                <CardContent>
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="font-mono-tech text-xl font-bold">{me.dealsCount}</div>
                      <div className="text-sm text-muted-foreground">{t("рейсов")}</div>
                    </div>
                    <div>
                      <div className="font-mono-tech text-xl font-bold">{me.rating.toFixed(1)}</div>
                      <div className="text-sm text-muted-foreground">{t("рейтинг")}</div>
                    </div>
                    <div>
                      <div className="font-mono-tech text-xl font-bold text-brand">{reliability}</div>
                      <div className="text-sm text-muted-foreground">{t("надёжность")}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>


            <Section title={t("Мой парк")}>
              <div className="space-y-2">
                {MY_FLEET.map((truck) => (
                  <Card key={truck.id} size="sm">
                    <CardContent className="flex items-center gap-2">
                      <Truck className="size-5 text-brand" />
                      <div className="flex-1">
                        <p className="text-base font-medium capitalize">{truck.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {truck.maxWeightKg.toLocaleString("ru-RU")} {t("кг")} · {truck.maxVolumeM3} {t("м³")} · {truck.plate}
                        </p>
                      </div>
                      <BadgeCheck className="size-5 text-brand" />
                    </CardContent>
                  </Card>
                ))}
                <button
                  onClick={() => showToast(t("Авто добавлено · на проверке"))}
                  className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2.5 text-base font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="size-4" /> {t("Добавить авто")}
                </button>
              </div>
            </Section>

            <Section title={t("Интересующие маршруты")}>
              <div className="flex flex-wrap gap-1.5">
                {WATCHED_ROUTES.map((r) => (
                  <Badge key={r} variant="outline">
                    {r}
                  </Badge>
                ))}
              </div>
            </Section>
          </>
        )}

        <Section title={t("Настройки")}>
          <Card size="sm">
            <CardContent className="space-y-3">
              <button
                onClick={() => setQuiet((v) => !v)}
                className="flex min-h-11 w-full items-center justify-between text-base"
              >
                <span className="inline-flex items-center gap-2">
                  <Moon className="size-5 text-muted-foreground" /> {t("Тихий режим 22:00–8:00")}
                </span>
                <span
                  className={
                    "relative h-5 w-9 rounded-full transition-colors " +
                    (quiet ? "bg-brand" : "bg-muted")
                  }
                >
                  <span
                    className={
                      "absolute top-0.5 size-4 rounded-full bg-white transition-all " +
                      (quiet ? "left-[18px]" : "left-0.5")
                    }
                  />
                </span>
              </button>
              <div className="flex min-h-11 items-center justify-between text-base">
                <span className="inline-flex items-center gap-2">
                  <Bell className="size-5 text-muted-foreground" /> {t("Push-уведомления")}
                </span>
                <StatusBadge tone="success">{t("Вкл")}</StatusBadge>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Button
          variant="outline"
          className="h-12 w-full"
          onClick={resetOnboarding}
        >
          <LogOut className="size-5" /> {t("Выйти")}
        </Button>

        <p className="pb-4 text-center text-sm text-muted-foreground">
          CN-KZ · {t("Грузоперевозки по СНГ")}
        </p>
      </div>
    </div>
  )
}
