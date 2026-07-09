"use client"

import { useEffect, useState } from "react"
import {
  BadgeCheck,
  BarChart3,
  Bell,
  Camera,
  Check,
  ChevronRight,
  Clock,
  Plus,
  Settings as SettingsIcon,
  Lock,
  LogOut,
  MessageCircle,
  Moon,
  Phone,
  Send,
  ShieldAlert,
  ShieldCheck,
  Truck,
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
import { type Order } from "@/lib/cn-kz/types"
import { ScreenHeader } from "./phone-frame"
import { deals, DealStatusBadge, OfferStatusBadge, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, Section } from "./ui-bits"
import { useCnKz } from "./store"

// ---------- Deals dashboard ----------

export function DealsScreen() {
  const { myOrders, feedOrders, push, role, dealsNewOnly, setDealsNewOnly, isNew } = useCnKz()
  // Заказчик видит сделки по своим заказам; перевозчик — по выигранным грузам из ленты.
  const source = role === "carrier" ? feedOrders : myOrders
  const deals = source.filter((o) => o.deal)
  const visible = dealsNewOnly ? deals.filter((o) => isNew(o.id)) : deals
  const active = visible.filter((o) => o.deal!.status !== "completed" && o.deal!.status !== "cancelled")
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
        title={role === "carrier" ? "Мои сделки" : "Сделки"}
        subtitle={role === "shipper" ? "Ваши грузы в пути" : "Отклики и рейсы"}
      />
      {dealsNewOnly && (
        <ChipRow className="px-4 pb-2">
          <Chip active onClick={() => setDealsNewOnly(false)}>
            Только новые ✕
          </Chip>
        </ChipRow>
      )}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        {myOffers.length > 0 && (
          <Section title="Отклики · ожидают ответа">
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
        <Section title="Активные">
          {active.length === 0 && (
            <p className="text-sm text-muted-foreground">
              {dealsNewOnly ? "Нет сделок с новыми событиями" : "Нет активных сделок"}
            </p>
          )}
          <div className="space-y-2">
            {active.map((o) => (
              <DealRow key={o.id} order={o} isNew={isNew(o.id)} onClick={() => push({ type: "deal", orderId: o.id })} />
            ))}
          </div>
        </Section>

        {settledOffers.length > 0 && (
          <Section title="История откликов">
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
  return (
    <Card size="sm" onClick={onClick} className="cursor-pointer hover:ring-foreground/20">
      <CardContent className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Route from={order.origin} to={order.destination} className="text-sm" />
          <div className="flex items-center gap-1.5">
            {order.overdue && order.deal!.status === "accepted" && (
              <Badge variant="warning">Опаздывает</Badge>
            )}
            {order.deal!.tripId && <Badge variant="outline">Рейс</Badge>}
            {isNew && <Badge variant="brand">новое</Badge>}
            <DealStatusBadge status={order.deal!.status} />
          </div>
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{order.cargo}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {order.deal!.carrier.name}
          </span>
          <span className="font-mono-tech text-sm font-semibold text-foreground">
            {money(order.deal!.agreedPriceUsd)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact row for a carrier's pending offer (bid) — folded into «Мои сделки».
function OfferRow({ order, onClick }: { order: Order; onClick: () => void }) {
  const countered = order.myOfferStatus === "countered"
  return (
    <Card size="sm" onClick={onClick} className="cursor-pointer hover:ring-foreground/20">
      <CardContent className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Route from={order.origin} to={order.destination} className="text-sm" />
          <OfferStatusBadge status={order.myOfferStatus!} />
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">{order.cargo}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {countered ? "Встречная цена заказчика" : "Ваш отклик отправлен"}
          </span>
          <span className="font-mono-tech text-sm font-semibold text-foreground">
            {money(order.myCounterPriceUsd ?? order.myOfferPriceUsd ?? order.priceUsd)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// ---------- Deal detail ----------

export function DealScreen({ orderId }: { orderId: string }) {
  const {
    getOrder,
    pop,
    push,
    role,
    completeDeal,
    confirmDelivery,
    cancelDeal,
    logDealEvent,
    fileClaim,
    submitRating,
    showToast,
    markSeen,
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
  const [podStep, setPodStep] = useState(false)
  const [podAdded, setPodAdded] = useState(false)
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
  const other = role === "shipper" ? deal.carrier : order.shipper
  const protectedPay = order.safePay !== false // «Гарантия оплаты» включена (по умолчанию да)
  // Привязка «кто реально везёт» — против переуступки/двойного брокериджа.
  const acceptedOffer = order.offers.find((o) => o.status === "accepted")
  const boundTruckType = acceptedOffer?.truck ?? order.myOfferTruck?.type ?? order.truckType
  const boundPlate = acceptedOffer?.plate ?? order.myOfferTruck?.plate

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={
          <>
            Сделка{" "}
            <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </>
        }
        subtitle={`${order.origin} → ${order.destination}`}
        onBack={pop}
      />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-6">
        {/* status — 2 состояния, без трекинга доставки */}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Статус</span>
              <DealStatusBadge status={deal.status} />
            </div>
            {cancelled ? (
              <p className="text-sm text-destructive">Сделка отменена</p>
            ) : (
              <div className="flex items-center gap-2 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5 text-brand">
                  <span className="flex size-5 items-center justify-center rounded-full bg-brand text-brand-foreground">
                    <Check className="size-3" />
                  </span>
                  Принято
                </span>
                <span className={"h-0.5 flex-1 " + (completed ? "bg-brand" : "bg-border")} />
                <span
                  className={
                    "inline-flex items-center gap-1.5 " +
                    (completed ? "text-brand" : "text-muted-foreground")
                  }
                >
                  <span
                    className={
                      "flex size-5 items-center justify-center rounded-full text-[10px] " +
                      (completed ? "bg-brand text-brand-foreground" : "bg-muted text-muted-foreground")
                    }
                  >
                    {completed ? <Check className="size-3" /> : "2"}
                  </span>
                  Завершено
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* other party — tap opens the carrier profile (shipper side) */}
        <Card
          size="sm"
          onClick={
            role === "shipper"
              ? () => push({ type: "carrierProfile", carrierId: deal.carrier.id })
              : undefined
          }
          className={role === "shipper" ? "cursor-pointer hover:ring-foreground/20" : ""}
        >
          <CardContent className="flex items-center gap-2">
            <Avatar name={other.name} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-sm font-medium">
                {other.name}
                {other.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand" />}
              </p>
              <p className="text-xs text-muted-foreground">
                <Rating value={other.rating} /> ·{" "}
                {role === "shipper" ? "перевозчик" : "заказчик"}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                push({ type: "chat", orderId: order.id })
              }}
              aria-label="Чат"
            >
              <MessageCircle className="size-3.5" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                showToast("Звоним (номер скрыт для безопасности)")
              }}
              aria-label="Позвонить"
            >
              <Phone className="size-3.5" />
            </Button>
            {role === "shipper" && <ChevronRight className="size-4 text-muted-foreground" />}
          </CardContent>
        </Card>

        <DetailRow label="Груз" value={order.cargo} />
        <DetailRow label="Согласованная цена" value={money(deal.agreedPriceUsd)} />
        {order.deliverBy && <DetailRow label="Срок доставки" value={order.deliverBy} />}

        {/* Анти-переуступка (двойной брокеридж) — кто реально везёт закреплён за сделкой. */}
        {!cancelled && (
          <div className="space-y-1 rounded-md border border-border px-3 py-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-foreground">
              <Truck className="size-3.5 text-brand" /> Рейс выполняет: {deal.carrier.name}
              {boundPlate && <span className="font-mono-tech text-muted-foreground">· {boundPlate}</span>}
            </div>
            <p className="text-muted-foreground">
              {boundTruckType} · переуступка груза запрещена.{" "}
              {role === "shipper"
                ? "Сверьте гос.номер и водителя при погрузке — везти должна эта машина."
                : "Везти должны вы на этой машине, передавать заказ нельзя."}
            </p>
          </div>
        )}
        {order.overdue && !completed && !cancelled && (
          <div className="flex items-center gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-500">
            <ShieldAlert className="size-3.5 shrink-0" /> Перевозчик опаздывает к сроку доставки. Напишите в чат или согласуйте новый срок.
          </div>
        )}
        <div
          className={
            "flex items-start gap-2 rounded-md px-3 py-2 text-xs " +
            (protectedPay
              ? "bg-brand/10 text-foreground"
              : "bg-secondary text-muted-foreground")
          }
        >
          <Lock className="mt-0.5 size-3.5 shrink-0 text-brand" />
          <span>
            {protectedPay && (
              <span className="font-medium">Оплата под защитой (Гарантия оплаты). </span>
            )}
            {protectedPay
              ? cancelled
                ? `Сделка отменена — ${money(deal.agreedPriceUsd)} возвращены заказчику.`
                : completed
                  ? `Доставка подтверждена — ${money(deal.agreedPriceUsd)} переведены перевозчику.`
                  : `${money(deal.agreedPriceUsd)} зарезервированы платформой и уйдут перевозчику после подтверждения доставки.`
              : cancelled
                ? "Сделка отменена — оплата не проводится."
                : completed
                  ? `Доставка подтверждена — оплату ${money(deal.agreedPriceUsd)} можно провести.`
                  : `Прямая оплата — проводите ${money(deal.agreedPriceUsd)} после подтверждения доставки.`}
          </span>
        </div>
        {!cancelled && !completed && (
          <div className="flex items-start gap-2 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-600 dark:text-amber-500">
            <ShieldAlert className="size-3.5 shrink-0" />
            Никогда не переводите предоплату или «депозит» на карту вне приложения — так работают мошенники.
          </div>
        )}

        {/* chat entry */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => push({ type: "chat", orderId: order.id })}
        >
          <MessageCircle className="size-4" /> Чат с{" "}
          {role === "shipper" ? "перевозчиком" : "заказчиком"}
          {deal.chat.length > 0 && (
            <Badge variant="muted" className="ml-auto">
              {deal.chat.length}
            </Badge>
          )}
        </Button>

        {/* Отметки рейса — таймстампы прибытия/простоя (защита перевозчика на детеншене). */}
        {!cancelled && (
          <Card size="sm">
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">Отметки рейса</p>
              {deal.log && deal.log.length > 0 ? (
                <div className="space-y-1">
                  {deal.log.map((e, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-foreground">{e.label}</span>
                      <span className="font-mono-tech text-muted-foreground">{e.time}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Отмечайте прибытие и простой — фиксируется со временем и защищает вас при споре.
                </p>
              )}
              {role === "carrier" && !completed && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Прибыл на погрузку", "Забрал груз", "Прибыл на выгрузку"].map((l) => (
                    <button
                      key={l}
                      onClick={() => logDealEvent(order.id, l)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l}
                    </button>
                  ))}
                  <button
                    onClick={() => logDealEvent(order.id, "Простой / срыв погрузки")}
                    className="rounded-md border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-500"
                  >
                    Зафиксировать простой
                  </button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Претензия — структурный спор с доказательствами; оплата заморожена до решения. */}
        {!cancelled &&
          (deal.claim ? (
            <div className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-500">
              <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
              <span>
                <span className="font-medium">Претензия на рассмотрении: {deal.claim.reason}.</span>{" "}
                Оплата заморожена, чат и фото приложены как доказательства. Решение — в течение 3 дней.
              </span>
            </div>
          ) : (
            <button
              onClick={() => setShowClaim(true)}
              className="w-full rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Подать претензию
            </button>
          ))}

        {/* rating after completion */}
        {completed && !rated && (
          <Card size="sm" className="ring-brand/40">
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">
                Оцените {role === "shipper" ? "перевозчика" : "заказчика"}
              </p>
              <div className="flex justify-center gap-1 text-2xl">
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
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors " +
                        (criteria.includes(c)
                          ? "border-brand/40 bg-brand/15 text-brand"
                          : "border-border text-muted-foreground hover:text-foreground")
                      }
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={
                  commentRequired
                    ? "Комментарий обязателен при оценке 1–2★"
                    : "Комментарий (необязательно)"
                }
                className={
                  "min-h-14 " + (commentRequired && !comment.trim() ? "border-destructive" : "")
                }
              />
              <Button
                className="w-full"
                disabled={!canSubmitRating}
                onClick={() => submitRating(order.id, stars)}
              >
                Отправить оценку
              </Button>
            </CardContent>
          </Card>
        )}
        {completed && rated && (
          <Card size="sm">
            <CardContent className="space-y-1.5 text-sm">
              <p className="text-foreground">
                <Check className="inline size-4" /> Ваша оценка {other.name.split(" ")[0]}: {order.ratedStars}★
              </p>
              {order.counterpartRating == null ? (
                <p className="text-xs text-muted-foreground">
                  Оценка {role === "shipper" ? "перевозчика" : "заказчика"} появится, когда он тоже оценит вас (взаимно и вслепую).
                </p>
              ) : (
                <p className="text-foreground">
                  <Rating value={order.counterpartRating} />{" "}
                  <span className="text-muted-foreground">— {role === "shipper" ? "перевозчик" : "заказчик"} оценил вас</span>
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* actions — 2 состояния (перевозчик завершает, заказчик может подтвердить) */}
        {!cancelled && !completed && (
          <div className="space-y-2 pt-1">
            {role === "carrier" ? (
              podStep ? (
                <Card size="sm" className="ring-brand/40">
                  <CardContent className="space-y-2">
                    <p className="text-sm font-medium">Подтверждение доставки (POD)</p>
                    <p className="text-xs text-muted-foreground">
                      Приложите фото выгруженного груза или накладной — заказчик увидит, что доставлено, и подтвердит.
                    </p>
                    <Button variant="outline" className="w-full" onClick={() => setPodAdded(true)}>
                      <Camera className="size-4" /> {podAdded ? "Фото добавлено ✓" : "Добавить фото выгрузки"}
                    </Button>
                    <Button className="w-full" disabled={!podAdded} onClick={() => completeDeal(order.id)}>
                      <Check className="size-4" /> Завершить заказ
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Button className="w-full" onClick={() => setPodStep(true)}>
                  <Check className="size-4" /> Завершил заказ
                </Button>
              )
            ) : (
              <Button className="w-full" onClick={() => confirmDelivery(order.id)}>
                <Check className="size-4" /> Подтвердить получение
              </Button>
            )}
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowCancel(true)}
            >
              Отменить сделку
            </Button>
          </div>
        )}
      </div>

      {/* cancel-confirmation — показываем цену отмены (главный рычаг против срывов) */}
      {showCancel && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowCancel(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-3 rounded-t-2xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">Отменить сделку?</p>
            <p className="text-sm text-muted-foreground">
              {role === "carrier"
                ? "Отмена принятого заказа снизит вашу надёжность на −10 и может ограничить доступ к премиум-грузам."
                : "Отмена оставит перевозчика без груза и повлияет на ваш рейтинг заказчика."}
            </p>
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <ShieldAlert className="size-3.5 shrink-0 text-amber-500" /> Форс-мажор (поломка, граница)? Отмена без штрафа — приложите фото.
            </div>
            <div className="space-y-2">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  cancelDeal(order.id)
                  setShowCancel(false)
                }}
              >
                {role === "carrier" ? "Отменить (−10 к надёжности)" : "Отменить сделку"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setShowCancel(false)
                  showToast("Заявка о форс-мажоре отправлена на проверку")
                }}
              >
                <ShieldAlert className="size-4" /> Это форс-мажор
              </Button>
              <button
                onClick={() => setShowCancel(false)}
                className="w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Оставить сделку
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
            className="animate-in slide-in-from-bottom w-full space-y-3 rounded-t-2xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">Претензия по сделке</p>
            <div className="flex flex-wrap gap-1.5">
              {["Не оплатили", "Груз повреждён", "Срыв погрузки", "Вес не совпал", "Другое"].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setClaimReason(r)}
                    className={
                      "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors " +
                      (claimReason === r
                        ? "border-brand/40 bg-brand/15 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground")
                    }
                  >
                    {r}
                  </button>
                )
              )}
            </div>
            <Textarea
              value={claimNote}
              onChange={(e) => setClaimNote(e.target.value)}
              placeholder="Опишите, что произошло…"
              className="min-h-16"
            />
            <div className="flex items-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs text-muted-foreground">
              <Camera className="size-3.5 shrink-0 text-brand" /> Чат и фото выгрузки приложатся
              автоматически как доказательства.
            </div>
            <Button
              className="w-full"
              disabled={!claimReason}
              onClick={() => {
                fileClaim(order.id, claimReason, claimNote)
                setShowClaim(false)
                setClaimReason("")
                setClaimNote("")
              }}
            >
              Отправить претензию
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- Chat ----------

export function ChatScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, sendMessage, role } = useCnKz()
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
      <ScreenHeader title={other.name} subtitle="Чат сделки" onBack={pop} />

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-2">
        {order.deal.chat.length === 0 && (
          <p className="pt-10 text-center text-sm text-muted-foreground">
            Сообщений пока нет. Уточните детали груза.
          </p>
        )}
        {order.deal.chat.map((m) => (
          <div
            key={m.id}
            className={"flex " + (m.fromMe ? "justify-end" : "justify-start")}
          >
            <div
              className={
                "max-w-[78%] rounded-md px-3 py-2 text-sm " +
                (m.fromMe
                  ? "rounded-br-[2px] bg-primary text-primary-foreground"
                  : "rounded-bl-[2px] bg-secondary text-foreground")
              }
            >
              {m.text}
              <span
                className={
                  "ml-2 align-bottom text-[10px] " +
                  (m.fromMe ? "text-brand-foreground/60" : "text-muted-foreground")
                }
              >
                {m.time}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-card p-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Сообщение…"
          className="h-9"
        />
        <Button size="icon-lg" onClick={send} disabled={!text.trim()}>
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ---------- Profile ----------

export function ProfileScreen() {
  const { role, me, resetOnboarding, setTab, showToast, reliability, cancelCount } = useCnKz()
  const reliable = reliability >= 90
  const [quiet, setQuiet] = useState(true)

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Профиль" />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <Avatar name={me.name} className="size-14 text-base" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{me.name}</p>
              {me.company && (
                <p className="truncate text-xs text-muted-foreground">{me.company}</p>
              )}
              <p className="mt-0.5 text-xs text-muted-foreground">
                <Rating value={me.rating} /> · {deals(me.dealsCount)}
              </p>
            </div>
            <Badge variant="brand">{role === "shipper" ? "Заказчик" : "Перевозчик"}</Badge>
          </CardContent>
        </Card>

        {/* История + Настройки — быстрый доступ */}
        <Card size="sm">
          <CardContent className="divide-y divide-border">
            <button onClick={() => setTab("history")} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
              <Clock className="size-4 text-muted-foreground" />
              <span className="flex-1">{role === "carrier" ? "История рейсов" : "История заказов"}</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
            <button onClick={() => setTab("settings")} className="flex w-full items-center gap-3 py-2.5 text-left text-sm">
              <SettingsIcon className="size-4 text-muted-foreground" />
              <span className="flex-1">Настройки</span>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          </CardContent>
        </Card>

        {/* Честная проверка — без госбаз: телефон, фото, сверка селфи с документом, отзывы */}
        <Section title="Проверка профиля">
          <Card size="sm">
            <CardContent className="space-y-2.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" /> Телефон подтверждён
                </span>
                <Badge variant="success">Да</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand" /> БИН/ИНН сверен с реестром юрлиц
                </span>
                <Badge variant="success">Проверен</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand" /> Профиль с фото (селфи)
                </span>
                <Badge variant="success">Есть</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <BadgeCheck className="size-4 text-brand" /> Селфи сверено с документом
                </span>
                <Badge variant="success">Совпало</Badge>
              </div>
              {role === "carrier" && (
                <button
                  onClick={() => showToast("Загрузка фото фуры с гос. номером")}
                  className="flex w-full items-center justify-between"
                >
                  <span className="inline-flex items-center gap-2 text-foreground">
                    <Camera className="size-4 text-muted-foreground" /> Транспорт · фото с гос. номером
                  </span>
                  <Badge variant="success">На файле</Badge>
                </button>
              )}
              <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
                Значок «Бизнес проверен» = БИН/ИНН найден в реестре юрлиц и селфи совпало с
                удостоверением. Базы МВД/розыска подключаем поэтапно — проверка снижает риск, но не
                даёт 100% гарантии.
              </p>
            </CardContent>
          </Card>
        </Section>

        {role === "shipper" && (
          <Section title="Аналитика">
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
                  <p className="text-sm font-medium">Аналитика заказов</p>
                  <p className="text-xs text-muted-foreground">Расходы, топ маршрутов, качество откликов</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Section>
        )}

        {role === "carrier" && (
          <>
            <Section title="Надёжность">
              <Card size="sm">
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-tech text-lg font-bold">{reliability} / 100</span>
                    <Badge variant={reliable ? "success" : "warning"}>
                      {reliable ? "Надёжный ✓" : "Снижена"}
                    </Badge>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={"h-full rounded-full " + (reliable ? "bg-brand" : "bg-amber-500")}
                      style={{ width: `${reliability}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    За последние 20 заказов · {cancelCount}{" "}
                    {cancelCount === 1 ? "отмена" : cancelCount >= 2 && cancelCount <= 4 ? "отмены" : "отмен"}.
                    Каждая отмена принятого заказа: −10. Высокая надёжность = приоритет в ленте и доступ к премиум-грузам.
                  </p>
                </CardContent>
              </Card>
            </Section>

            <Section title="Моя статистика">
              <Card size="sm">
                <CardContent>
                  <div className="flex items-center justify-around text-center">
                    <div>
                      <div className="font-mono-tech text-lg font-bold">{me.dealsCount}</div>
                      <div className="text-[11px] text-muted-foreground">рейсов</div>
                    </div>
                    <div>
                      <div className="font-mono-tech text-lg font-bold">{me.rating.toFixed(1)}</div>
                      <div className="text-[11px] text-muted-foreground">рейтинг</div>
                    </div>
                    <div>
                      <div className="font-mono-tech text-lg font-bold text-brand">96%</div>
                      <div className="text-[11px] text-muted-foreground">вовремя</div>
                    </div>
                    <div>
                      <div className="font-mono-tech text-lg font-bold">$18.4k</div>
                      <div className="text-[11px] text-muted-foreground">заработано</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Section>


            <Section title="Мой парк">
              <div className="space-y-2">
                {MY_FLEET.map((t) => (
                  <Card key={t.id} size="sm">
                    <CardContent className="flex items-center gap-2">
                      <Truck className="size-4 text-brand" />
                      <div className="flex-1">
                        <p className="text-sm font-medium capitalize">{t.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.maxWeightKg.toLocaleString("ru-RU")} кг · {t.maxVolumeM3} м³ · {t.plate}
                        </p>
                      </div>
                      <BadgeCheck className="size-4 text-brand" />
                    </CardContent>
                  </Card>
                ))}
                <button
                  onClick={() => showToast("Авто добавлено · на проверке")}
                  className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Plus className="size-4" /> Добавить авто
                </button>
              </div>
            </Section>

            <Section title="Интересующие маршруты">
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

        <Section title="Настройки">
          <Card size="sm">
            <CardContent className="space-y-3">
              <button
                onClick={() => setQuiet((v) => !v)}
                className="flex w-full items-center justify-between text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <Moon className="size-4 text-muted-foreground" /> Тихий режим 22:00–8:00
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
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" /> Push-уведомления
                </span>
                <Badge variant="success">Вкл</Badge>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Button
          variant="outline"
          className="w-full"
          onClick={resetOnboarding}
        >
          <LogOut className="size-4" /> Выйти
        </Button>

        <p className="pb-4 text-center text-[10px] text-muted-foreground">
          CN-KZ · Грузоперевозки по СНГ
        </p>
      </div>
    </div>
  )
}
