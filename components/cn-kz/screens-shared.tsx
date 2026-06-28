"use client"

import { useEffect, useState } from "react"
import {
  Bell,
  Check,
  ClipboardList,
  LogOut,
  MessageCircle,
  Moon,
  Phone,
  Send,
  ShieldAlert,
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
import {
  DEAL_FLOW,
  DEAL_STATUS_LABEL,
  type DealStatus,
  type Order,
} from "@/lib/cn-kz/types"
import { ScreenHeader } from "./phone-frame"
import { deals, DealStatusBadge, Rating, Route, money } from "./shared"
import { Chip, ChipRow, DetailRow, Section } from "./ui-bits"
import { useCnKz } from "./store"

// ---------- Deals dashboard ----------

export function DealsScreen() {
  const { myOrders, push, role, dealsNewOnly, setDealsNewOnly, isNew } = useCnKz()
  const deals = myOrders.filter((o) => o.deal)
  const visible = dealsNewOnly ? deals.filter((o) => isNew(o.id)) : deals
  const active = visible.filter((o) => o.deal!.status !== "completed" && o.deal!.status !== "cancelled")
  const done = visible.filter((o) => o.deal!.status === "completed" || o.deal!.status === "cancelled")

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Сделки"
        subtitle={role === "shipper" ? "Ваши грузы в пути" : "Ваши рейсы"}
      />
      <ChipRow className="px-4 pb-2">
        <Chip active={!dealsNewOnly} onClick={() => setDealsNewOnly(false)}>
          Все
        </Chip>
        <Chip active={dealsNewOnly} onClick={() => setDealsNewOnly(true)}>
          Есть новые
        </Chip>
      </ChipRow>
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
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

        {done.length > 0 && (
          <Section title="Завершённые">
            <div className="space-y-2">
              {done.map((o) => (
                <DealRow key={o.id} order={o} isNew={isNew(o.id)} onClick={() => push({ type: "deal", orderId: o.id })} />
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

// ---------- Deal detail ----------

const DOCS = [
  "CMR — транспортная накладная",
  "Commercial Invoice",
  "Packing List",
  "TIR Carnet / транзитная декларация",
  "Фитосанитарный сертификат",
  "Паспорт водителя + виза страны назначения",
]

export function DealScreen({ orderId }: { orderId: string }) {
  const {
    getOrder,
    pop,
    push,
    role,
    advanceDeal,
    confirmDelivery,
    cancelDeal,
    showToast,
    markSeen,
  } = useCnKz()
  const order = getOrder(orderId)
  // Открыли сделку → события прочитаны (сбрасывает «новое» и счётчик колокольчика).
  useEffect(() => {
    markSeen(orderId)
  }, [orderId, markSeen])
  const [showDocs, setShowDocs] = useState(false)
  const [checked, setChecked] = useState<boolean[]>(() => DOCS.map(() => false))
  const [rated, setRated] = useState(false)
  const [stars, setStars] = useState(0)
  const [comment, setComment] = useState("")
  // Низкая оценка (1–2★) требует комментарий — MVP §8.
  const commentRequired = stars > 0 && stars <= 2
  const canSubmitRating = stars > 0 && (!commentRequired || comment.trim().length > 0)

  if (!order?.deal) return null
  const deal = order.deal
  const stepIndex = DEAL_FLOW.indexOf(deal.status)
  const cancelled = deal.status === "cancelled"
  const completed = deal.status === "completed"
  const other = role === "shipper" ? deal.carrier : order.shipper

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
        {/* status tracker */}
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Статус доставки</span>
              <DealStatusBadge status={deal.status} />
            </div>
            {cancelled ? (
              <p className="text-sm text-destructive">Сделка отменена</p>
            ) : (
              <div className="flex items-center justify-between">
                {DEAL_FLOW.map((s, i) => (
                  <div key={s} className="flex flex-1 flex-col items-center gap-1">
                    <div className="flex w-full items-center">
                      {i > 0 && (
                        <div
                          className={
                            "h-0.5 flex-1 " +
                            (i <= stepIndex ? "bg-brand" : "bg-border")
                          }
                        />
                      )}
                      <div
                        className={
                          "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] " +
                          (i <= stepIndex
                            ? "bg-brand text-brand-foreground"
                            : "bg-muted text-muted-foreground")
                        }
                      >
                        {i < stepIndex ? <Check className="size-3" /> : i + 1}
                      </div>
                      {i < DEAL_FLOW.length - 1 && (
                        <div
                          className={
                            "h-0.5 flex-1 " +
                            (i < stepIndex ? "bg-brand" : "bg-border")
                          }
                        />
                      )}
                    </div>
                    <span className="text-center text-[8px] leading-tight text-muted-foreground">
                      {DEAL_STATUS_LABEL[s as DealStatus]}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* other party */}
        <Card size="sm">
          <CardContent className="flex items-center gap-2">
            <Avatar name={other.name} className="size-8" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{other.name}</p>
              <p className="text-xs text-muted-foreground">
                <Rating value={other.rating} /> ·{" "}
                {role === "shipper" ? "перевозчик" : "шипер"}
              </p>
            </div>
            <Button size="sm" variant="outline" onClick={() => showToast(`Звоним: ${other.phone}`)}>
              <Phone className="size-3.5" />
            </Button>
          </CardContent>
        </Card>

        <DetailRow label="Груз" value={order.cargo} />
        <DetailRow label="Согласованная цена" value={money(deal.agreedPriceUsd)} />

        {/* docs checklist (carrier) */}
        {role === "carrier" && (
          <div>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => setShowDocs((v) => !v)}
            >
              <span className="inline-flex items-center gap-2">
                <ClipboardList className="size-4" /> Документы на границу
              </span>
              <span className="text-xs text-muted-foreground">
                {checked.filter(Boolean).length}/{DOCS.length}
              </span>
            </Button>
            {showDocs && (
              <Card size="sm" className="mt-2">
                <CardContent className="space-y-2">
                  {DOCS.map((doc, i) => (
                    <label
                      key={doc}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={checked[i]}
                        onChange={() =>
                          setChecked((c) =>
                            c.map((v, j) => (j === i ? !v : v))
                          )
                        }
                        className="size-4 accent-[#e6e6e6]"
                      />
                      <span className={checked[i] ? "text-muted-foreground line-through" : ""}>
                        {doc}
                      </span>
                    </label>
                  ))}
                  <p className="pt-1 text-[10px] text-muted-foreground">
                    Отметьте, что подготовили. Не обязательно для статуса «На границе».
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* chat entry */}
        <Button
          variant="secondary"
          className="w-full justify-start"
          onClick={() => push({ type: "chat", orderId: order.id })}
        >
          <MessageCircle className="size-4" /> Чат с{" "}
          {role === "shipper" ? "перевозчиком" : "шипером"}
          {deal.chat.length > 0 && (
            <Badge variant="muted" className="ml-auto">
              {deal.chat.length}
            </Badge>
          )}
        </Button>

        {/* rating after completion */}
        {completed && !rated && (
          <Card size="sm" className="ring-brand/40">
            <CardContent className="space-y-2">
              <p className="text-sm font-medium">
                Оцените {role === "shipper" ? "перевозчика" : "шипера"}
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
                onClick={() => {
                  setRated(true)
                  showToast("Спасибо! Оценка отправлена")
                }}
              >
                Отправить оценку
              </Button>
            </CardContent>
          </Card>
        )}
        {completed && rated && (
          <p className="text-center text-sm text-foreground">
            <Check className="inline size-4" /> Сделка завершена и оценена
          </p>
        )}

        {/* actions */}
        {!cancelled && !completed && (
          <div className="space-y-2 pt-1">
            {role === "carrier" && stepIndex < DEAL_FLOW.indexOf("delivered") && (
              <Button className="w-full" onClick={() => advanceDeal(order.id)}>
                <Truck className="size-4" /> Следующий этап:{" "}
                {DEAL_STATUS_LABEL[DEAL_FLOW[stepIndex + 1] as DealStatus]}
              </Button>
            )}
            {role === "shipper" && deal.status === "delivered" && (
              <Button className="w-full" onClick={() => confirmDelivery(order.id)}>
                <Check className="size-4" /> Подтвердить получение
              </Button>
            )}
            {deal.status === "accepted" ? (
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => cancelDeal(order.id)}
              >
                Отменить сделку
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => showToast("Заявка создана — поддержка свяжется с вами")}
              >
                <ShieldAlert className="size-4" /> Подать претензию
              </Button>
            )}
          </div>
        )}
      </div>
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
  const { role, resetOnboarding } = useCnKz()
  const me = role === "shipper" ? ME_SHIPPER : ME_CARRIER
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
            <Badge variant="brand">{role === "shipper" ? "Шипер" : "Перевозчик"}</Badge>
          </CardContent>
        </Card>

        {role === "carrier" && (
          <>
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
                    </CardContent>
                  </Card>
                ))}
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
          CN-KZ · MVP-вайрфрейм · демо-данные
        </p>
      </div>
    </div>
  )
}
