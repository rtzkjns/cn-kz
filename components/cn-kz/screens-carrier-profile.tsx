"use client"

import { useState } from "react"
import { Ban, BadgeCheck, MessageCircle, Phone, ShieldAlert, ShieldCheck, Star, Truck } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { deals, money } from "./shared"
import { Section } from "./ui-bits"
import { useCnKz } from "./store"

export function CarrierProfileScreen({
  carrierId,
  orderId,
  offerId,
}: {
  carrierId: string
  orderId?: string
  offerId?: string
}) {
  const { getCarrier, getOrder, pop, push, acceptOffer, showToast } = useCnKz()
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const c = getCarrier(carrierId)
  if (!c) return null

  const order = orderId ? getOrder(orderId) : undefined
  const offer = order?.offers.find((o) => o.id === offerId)

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Профиль перевозчика" onBack={pop} />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-28">
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={c.name} className="size-14 text-base" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{c.name}</span>
                  {c.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="size-3 fill-muted-foreground/80 text-muted-foreground/80" />
                    <span className="font-mono-tech text-foreground">{c.rating.toFixed(1)}</span>
                  </span>{" "}
                  · {deals(c.dealsCount)}
                  {c.memberSince && <> · с {c.memberSince}</>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {c.verified ? (
                <Badge variant="success">
                  <ShieldCheck className="size-3" /> Бизнес проверен · БИН
                </Badge>
              ) : (
                <Badge variant="warning">Новичок · без БИН</Badge>
              )}
              {c.insured && (
                <Badge variant="muted">
                  <ShieldCheck className="size-3" /> Страховка · CMR
                </Badge>
              )}
              {c.onTimeRate != null && <Badge variant="muted">{c.onTimeRate}% вовремя</Badge>}
            </div>
          </CardContent>
        </Card>

        {/* Проверка: БИН/ИНН сверяется с реестром юрлиц; личность — селфи + удостоверение. */}
        <Section title="Проверка профиля">
          <Card size="sm">
            <CardContent className="space-y-2 text-sm">
              <VerifyRow ok label="Телефон подтверждён" />
              <VerifyRow ok={!!c.verified} label="БИН/ИНН сверен с реестром юрлиц" />
              <VerifyRow ok={!!c.verified} label="Селфи сверено с удостоверением" />
              <VerifyRow ok label="Профиль с фото (селфи)" />
              <VerifyRow ok={!!(c.trucks && c.trucks.length)} label="Транспорт · фото на файле" />
              <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
                Значок «Бизнес проверен» = БИН/ИНН найден в реестре юрлиц и селфи совпало с
                удостоверением. Доступ к базам МВД/розыска подключаем поэтапно — проверка снижает
                риск, но не гарантия.
              </p>
            </CardContent>
          </Card>
        </Section>

        {/* fleet */}
        {c.trucks && c.trucks.length > 0 && (
          <Section title="Парк">
            <div className="space-y-2">
              {c.trucks.map((t) => (
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
        )}

        {/* reviews */}
        {c.reviews && c.reviews.length > 0 && (
          <Section title={`Отзывы (${c.reviews.length})`}>
            <div className="space-y-2">
              {c.reviews.map((r) => (
                <Card key={r.id} size="sm">
                  <CardContent className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{r.author}</span>
                      <span className="font-mono-tech text-xs text-muted-foreground">
                        {"★".repeat(r.rating)}
                        <span className="text-muted-foreground/40">{"★".repeat(5 - r.rating)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.text}</p>
                    <p className="text-[10px] text-muted-foreground/70">{r.ago}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* action bar */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-border bg-card p-3">
        {offer && order && offer.status === "countered" ? (
          <div className="rounded-md border border-brand/35 bg-brand/12 px-3 py-2 text-center text-[13px] font-medium text-brand">
            Встречная отправлена: {money(offer.shipperCounterUsd ?? offer.priceUsd)} · ждём ответа перевозчика
          </div>
        ) : offer && order ? (
          <Button
            className="w-full"
            onClick={() => {
              acceptOffer(order.id, offer.id)
              pop() // снять профиль со стека, чтобы «назад» не вёл к уже принятому отклику
              push({ type: "deal", orderId: order.id })
            }}
          >
            {offer.kind === "accept"
              ? `Принять отклик ${money(offer.priceUsd)}`
              : `Выбрать ${money(offer.priceUsd)}`}
          </Button>
        ) : null}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => showToast("Открываем чат")}>
            <MessageCircle className="size-4" /> Чат
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => showToast(`Звоним (номер скрыт для безопасности)`)}>
            <Phone className="size-4" /> Позвонить
          </Button>
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <ShieldAlert className="size-3.5" /> Пожаловаться на пользователя
        </button>
      </div>

      {/* Жалоба / блокировка — реальное действие, а не мёртвый тост. */}
      {showReport && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowReport(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-2 rounded-t-2xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">Пожаловаться на {c.name}</p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {["Мошенничество", "Не выходит на связь", "Обман по грузу", "Оскорбления", "Другое"].map(
                (r) => (
                  <button
                    key={r}
                    onClick={() => setReportReason(r)}
                    className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      reportReason === r
                        ? "border-brand bg-brand/15 text-brand"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {r}
                  </button>
                )
              )}
            </div>
            <Button
              className="w-full"
              disabled={!reportReason}
              onClick={() => {
                setShowReport(false)
                showToast(`Жалоба отправлена (${reportReason}) — модерация проверит профиль`)
                setReportReason(null)
              }}
            >
              <ShieldAlert className="size-4" /> Отправить жалобу
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowReport(false)
                showToast(`${c.name} заблокирован — вы не увидите его грузы и отклики`)
              }}
            >
              <Ban className="size-4" /> Заблокировать пользователя
            </Button>
            <button
              onClick={() => setShowReport(false)}
              className="w-full py-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VerifyRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
      {ok ? (
        <BadgeCheck className="size-4 text-brand" />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  )
}
