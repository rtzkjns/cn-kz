"use client"

import { useState } from "react"
import { Ban, BadgeCheck, MessageCircle, Phone, ShieldAlert, ShieldCheck, Star } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { deals } from "./shared"
import { Section } from "./ui-bits"
import { useCnKz } from "./store"

// Профиль ЗАКАЗЧИКА — симметрия с профилем перевозчика: перевозчик может проверить и пожаловаться.
export function ShipperProfileScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, showToast } = useCnKz()
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const s = getOrder(orderId)?.shipper
  if (!s) return null

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Заказчик" onBack={pop} />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-6">
        <Card size="sm">
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Avatar name={s.name} className="size-14 text-base" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{s.name}</span>
                  {s.verified && <BadgeCheck className="size-4 shrink-0 text-brand" />}
                </p>
                {s.company && <p className="truncate text-xs text-muted-foreground">{s.company}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-0.5">
                    <Star className="size-3 fill-muted-foreground/80 text-muted-foreground/80" />
                    <span className="font-mono-tech text-foreground">{s.rating.toFixed(1)}</span>
                  </span>{" "}
                  · {deals(s.dealsCount)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {s.verified ? (
                <Badge variant="success">
                  <ShieldCheck className="size-3" /> Бизнес проверен · БИН
                </Badge>
              ) : (
                <Badge variant="warning">Новичок · без БИН</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Как заказчик платит — важнее всего для перевозчика (риск неоплаты). */}
        <Section title="Проверка заказчика">
          <Card size="sm">
            <CardContent className="space-y-2 text-sm">
              <VRow ok label="Телефон подтверждён" />
              <VRow ok={!!s.verified} label="БИН/ИНН сверен с реестром юрлиц" />
              <VRow ok={s.dealsCount > 0} label={`История: ${s.dealsCount} завершённых сделок`} />
              <p className="pt-1 text-[11px] leading-snug text-muted-foreground">
                Аванс берите на счёт компании по БИН, не на личную карту. Оплата — напрямую, площадка
                деньги не держит.
              </p>
            </CardContent>
          </Card>
        </Section>

        {s.reviews && s.reviews.length > 0 && (
          <Section title="Отзывы перевозчиков">
            <div className="space-y-2">
              {s.reviews.map((r) => (
                <Card key={r.id} size="sm">
                  <CardContent className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{r.author}</span>
                      <span className="text-muted-foreground">{r.ago}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{r.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Section>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => showToast("Открываем чат")}>
            <MessageCircle className="size-4" /> Чат
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => showToast("Звоним (номер скрыт для безопасности)")}>
            <Phone className="size-4" /> Позвонить
          </Button>
        </div>
        <button
          onClick={() => setShowReport(true)}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <ShieldAlert className="size-3.5" /> Пожаловаться на заказчика
        </button>
      </div>

      {showReport && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowReport(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-2 rounded-t-2xl border-t border-border bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-base font-semibold">Пожаловаться на {s.name}</p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {["Не платит", "Мошенничество", "Груз не тот", "Не выходит на связь", "Другое"].map((r) => (
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
              ))}
            </div>
            <Button className="w-full" disabled={!reportReason} onClick={() => { setShowReport(false); showToast(`Жалоба отправлена (${reportReason}) — модерация проверит профиль`); setReportReason(null) }}>
              <ShieldAlert className="size-4" /> Отправить жалобу
            </Button>
            <Button variant="outline" className="w-full" onClick={() => { setShowReport(false); showToast(`${s.name} заблокирован — вы не увидите его заказы`) }}>
              <Ban className="size-4" /> Заблокировать
            </Button>
            <button onClick={() => setShowReport(false)} className="w-full py-1 text-center text-xs font-medium text-muted-foreground hover:text-foreground">
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function VRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={ok ? "" : "text-muted-foreground"}>{label}</span>
      {ok ? <BadgeCheck className="size-4 text-brand" /> : <span className="text-xs text-muted-foreground">—</span>}
    </div>
  )
}
