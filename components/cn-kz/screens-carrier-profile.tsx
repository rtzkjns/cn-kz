"use client"

import { useState, type ReactNode } from "react"
import {
  Ban,
  BadgeCheck,
  Box,
  CalendarDays,
  Clock,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  Weight,
  type LucideIcon,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScreenHeader } from "./phone-frame"
import { CallButton, OfferStatusBadge, StatusBadge, contactUnlocked, deals, money } from "./shared"
import { Chip, Countdown, Section } from "./ui-bits"
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
  const { getCarrier, getOrder, pop, push, acceptOffer, pickCounterOffer, showToast, t } = useCnKz()
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const c = getCarrier(carrierId)
  if (!c) return null

  const order = orderId ? getOrder(orderId) : undefined
  const offer = order?.offers.find((o) => o.id === offerId)
  // §5: контакт раскрыт только при живом отклике этого перевозчика ИЛИ уже есть сделка по заказу.
  const unlocked = contactUnlocked({ offerStatus: offer?.status, hasDeal: !!order?.deal })
  // Кнопка «Принять отклик» = основное действие экрана — только при живом отклике (не встречная, не ожидание подтверждения).
  const showAccept =
    !!offer && !!order && !(offer.awaitingConfirm && offer.confirmDeadline) && offer.status !== "countered"

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Профиль перевозчика")} onBack={pop} />

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-44">
        {/* Identity — name, gold rating, trust badges */}
        <div className="surface-glass space-y-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Avatar name={c.name} className="size-14 shrink-0 rounded-full text-[17px] font-bold" />
            <div className="min-w-0 flex-1">
              <p className="t-h2 flex items-center gap-1.5">
                <span className="truncate">{c.name}</span>
                {c.verified && <BadgeCheck className="size-5 shrink-0 text-brand" />}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Star className="size-4 shrink-0 fill-[var(--star)] text-[var(--star)]" />
                <span className="font-mono-tech text-foreground">{c.rating.toFixed(1)}</span>
                <span aria-hidden>·</span>
                <span className="truncate">{deals(c.dealsCount)}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {c.verified ? (
              <StatusBadge tone="success" icon={ShieldCheck}>
                {t("Бизнес проверен · БИН")}
              </StatusBadge>
            ) : (
              <StatusBadge tone="warn">{t("Новичок · без БИН")}</StatusBadge>
            )}
            {c.insured && (
              <StatusBadge tone="info" icon={ShieldCheck}>
                {t("Страховка · CMR")}
              </StatusBadge>
            )}
          </div>
        </div>

        {/* Trust stat strip — вовремя / парк / стаж (kills the empty band under the name) */}
        <div className="surface-glass flex items-stretch divide-x divide-border rounded-2xl">
          <StatCell icon={Clock} value={c.onTimeRate != null ? `${c.onTimeRate}%` : "—"} label={t("Вовремя")} />
          <StatCell icon={Truck} value={c.trucks?.length ?? 0} label={t("Парк")} />
          <StatCell icon={CalendarDays} value={c.memberSince ?? "—"} label={t("На платформе")} />
        </div>

        {/* Bid summary — that carrier's live offer on your cargo (the reason you're here) */}
        {offer && order && (
          <div className="surface-glass space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="t-eyebrow">{t("Отклик на ваш заказ")}</p>
              <OfferStatusBadge status={offer.status} />
            </div>
            {/* route: blue origin → connector → lime destination */}
            <div className="flex gap-3">
              <div className="flex flex-col items-center pt-1.5">
                <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
                <span className="route-connector my-1 flex-1" />
                <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-muted-foreground">{order.origin}</p>
                <p className="t-h3 mt-0.5 truncate">{order.destination}</p>
              </div>
            </div>
            <p className="line-clamp-1 text-[15px] text-muted-foreground">{order.cargo}</p>
            <div className="flex items-end justify-between gap-3 rounded-xl bg-secondary px-4 py-3">
              <div className="min-w-0 leading-none">
                <p className="t-eyebrow">{offer.kind === "accept" ? t("Готов за вашу цену") : t("Своя цена")}</p>
                <p className="t-display mt-1.5">{money(offer.priceUsd)}</p>
              </div>
              <span className="font-mono-tech shrink-0 text-[14px] font-medium text-muted-foreground">
                {offer.createdAgo}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <MetaPill icon={Truck}>{offer.truck}</MetaPill>
              <MetaPill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} {t("кг")}</MetaPill>
              <MetaPill icon={Box}>{order.volumeM3} {t("м³")}</MetaPill>
            </div>
            {(offer.plate || offer.capacityKg != null) && (
              <p className="t-meta text-muted-foreground">
                {t("Авто")}{offer.plate ? ` · ${offer.plate}` : ""}
                {offer.capacityKg != null ? ` · ${t("до")} ${offer.capacityKg.toLocaleString("ru-RU")} ${t("кг")}` : ""}
              </p>
            )}
          </div>
        )}

        {/* Проверка: БИН/ИНН сверяется с реестром юрлиц; личность — селфи + удостоверение. */}
        <Section title={t("Проверка профиля")}>
          <div className="surface-glass space-y-2 rounded-2xl p-4 text-sm">
            <VerifyRow ok label={t("Телефон подтверждён")} />
            <VerifyRow ok={!!c.verified} label={t("БИН/ИНН сверен с реестром юрлиц")} />
            <VerifyRow ok={!!c.verified} label={t("Селфи сверено с удостоверением")} />
            <VerifyRow ok label={t("Профиль с фото (селфи)")} />
            <VerifyRow ok={!!(c.trucks && c.trucks.length)} label={t("Транспорт · фото на файле")} />
            <p className="pt-1 text-sm leading-snug text-muted-foreground">
              {t("Значок «Бизнес проверен» = БИН/ИНН найден в реестре юрлиц и селфи совпало с удостоверением. Доступ к базам МВД/розыска подключаем поэтапно — проверка снижает риск, но не гарантия.")}
            </p>
          </div>
        </Section>

        {/* fleet */}
        {c.trucks && c.trucks.length > 0 && (
          <Section title={t("Парк")}>
            <div className="space-y-2">
              {c.trucks.map((truck) => (
                <div key={truck.id} className="surface-glass flex items-center gap-3 rounded-2xl p-4">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Truck className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="t-h3 capitalize">{truck.type}</p>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      <MetaPill icon={Weight}>{truck.maxWeightKg.toLocaleString("ru-RU")} {t("кг")}</MetaPill>
                      <MetaPill icon={Box}>{truck.maxVolumeM3} {t("м³")}</MetaPill>
                    </div>
                  </div>
                  <span className="font-mono-tech shrink-0 rounded-md bg-muted px-2 py-1 text-[14px] font-semibold text-foreground">
                    {truck.plate}
                  </span>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* reviews */}
        {c.reviews && c.reviews.length > 0 && (
          <Section title={`${t("Отзывы")} (${c.reviews.length})`}>
            <div className="space-y-2">
              {c.reviews.map((r) => (
                <div key={r.id} className="surface-glass space-y-1.5 rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar name={r.author} className="size-9 shrink-0 rounded-full text-[13px] font-bold" />
                      <span className="t-h3 truncate">{r.author}</span>
                    </div>
                    <span className="shrink-0 text-[14px] tracking-tight">
                      <span className="text-[var(--star)]">{"★".repeat(r.rating)}</span>
                      <span className="text-muted-foreground/25">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  <p className="t-body text-foreground/90">{r.text}</p>
                  <p className="t-meta text-muted-foreground">{r.ago}</p>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* action bar */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 bg-card px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(20,17,14,0.12)]">
        {offer && order && offer.awaitingConfirm && offer.confirmDeadline ? (
          <div className="rounded-lg border border-warn/35 bg-warn/12 px-3 py-2 text-center text-sm font-medium text-warn">
            {t("Встречная выбрана — ждём подтверждения перевозчика")} · <Countdown deadline={offer.confirmDeadline} />
          </div>
        ) : offer && order && offer.status === "countered" ? (
          <div className="rounded-lg border border-brand/35 bg-brand/12 px-3 py-2 text-center text-sm font-medium text-brand">
            {t("Встречная отправлена:")} {money(offer.shipperCounterUsd ?? offer.priceUsd)} · {t("ждём ответа перевозчика")}
          </div>
        ) : offer && order ? (
          <Button
            size="xl"
            className="w-full bg-[var(--success)] text-white shadow-none hover:bg-[var(--success-strong)] active:bg-[var(--success-strong)]"
            onClick={() => {
              if (offer.kind === "counter") {
                // §5 Вариант Б: выбор встречной → перевозчику 15 мин на подтверждение, сделки ещё нет.
                pickCounterOffer(order.id, offer.id)
                pop()
              } else {
                acceptOffer(order.id, offer.id)
                pop() // снять профиль со стека, чтобы «назад» не вёл к уже принятому отклику
                push({ type: "deal", orderId: order.id })
              }
            }}
          >
            {offer.kind === "accept"
              ? `${t("Принять отклик")} ${money(offer.priceUsd)}`
              : `${t("Выбрать")} ${money(offer.priceUsd)}`}
          </Button>
        ) : null}
        {showAccept ? (
          /* Есть «Принять отклик» (основное действие экрана) → Чат + Звонок вторичной строкой. */
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 flex-1"
              onClick={() => {
                if (order?.deal) push({ type: "chat", orderId: order.id })
                else showToast(t("Чат откроется после сделки · сейчас доступен вопрос «Уточнить»"))
              }}
            >
              <MessageCircle className="size-5" /> {t("Чат")}
            </Button>
            {unlocked ? (
              <CallButton phone={c.phone} className="flex-1" />
            ) : (
              <Button
                variant="secondary"
                size="lg"
                className="h-12 flex-1"
                onClick={() =>
                  showToast(t("Номер откроется, когда перевозчик откликнется или начнётся сделка"))
                }
              >
                <Phone className="size-5" /> {t("Номер скрыт")}
              </Button>
            )}
          </div>
        ) : (
          /* Чистый профиль (нет отклика к принятию) → звонок = основное 56px действие, чат — вторичное. */
          <>
            {unlocked ? (
              <CallButton phone={c.phone} variant="primary" className="w-full" />
            ) : (
              <Button
                variant="secondary"
                className="h-12 w-full"
                onClick={() =>
                  showToast(t("Номер откроется, когда перевозчик откликнется или начнётся сделка"))
                }
              >
                <Phone className="size-5" /> {t("Номер скрыт")}
              </Button>
            )}
            <Button
              variant="secondary"
              className="h-12 w-full"
              onClick={() => {
                if (order?.deal) push({ type: "chat", orderId: order.id })
                else showToast(t("Чат откроется после сделки · сейчас доступен вопрос «Уточнить»"))
              }}
            >
              <MessageCircle className="size-5" /> {t("Чат")}
            </Button>
          </>
        )}
        <button
          onClick={() => setShowReport(true)}
          className="flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <ShieldAlert className="size-3.5" /> {t("Пожаловаться на пользователя")}
        </button>
      </div>

      {/* Жалоба / блокировка — реальное действие, а не мёртвый тост. */}
      {showReport && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowReport(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-2 rounded-t-3xl bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="t-h3">{t("Пожаловаться на")} {c.name}</p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {["Мошенничество", "Не выходит на связь", "Обман по грузу", "Оскорбления", "Другое"].map(
                (r) => (
                  <Chip key={r} active={reportReason === r} onClick={() => setReportReason(r)}>
                    {t(r)}
                  </Chip>
                )
              )}
            </div>
            <Button
              size="lg"
              className="w-full"
              disabled={!reportReason}
              onClick={() => {
                setShowReport(false)
                showToast(`${t("Жалоба отправлена")} (${reportReason}) — ${t("модерация проверит профиль")}`)
                setReportReason(null)
              }}
            >
              <ShieldAlert className="size-4" /> {t("Отправить жалобу")}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={() => {
                setShowReport(false)
                showToast(`${c.name} ${t("заблокирован — вы не увидите его грузы и отклики")}`)
              }}
            >
              <Ban className="size-4" /> {t("Заблокировать пользователя")}
            </Button>
            <button
              onClick={() => setShowReport(false)}
              className="w-full py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              {t("Отмена")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Плотная ячейка «иконка + число + подпись» — превращает пустую полосу под именем в дашборд доверия.
function StatCell({ icon: Icon, value, label }: { icon: LucideIcon; value: ReactNode; label: string }) {
  return (
    <div className="flex flex-1 flex-col gap-2.5 px-3.5 py-3.5 first:rounded-l-2xl last:rounded-r-2xl">
      <span className="flex size-7 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-3.5" />
      </span>
      <div>
        <div className="font-mono-tech text-[22px] leading-none font-bold tracking-tight">{value}</div>
        <div className="mt-1 text-sm leading-tight font-medium text-muted-foreground">{label}</div>
      </div>
    </div>
  )
}

function MetaPill({ icon: Icon, children }: { icon?: LucideIcon; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground tabular-nums">
      {Icon && <Icon className="size-4 opacity-60" />}
      {children}
    </span>
  )
}

function VerifyRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={ok ? "text-foreground" : "text-muted-foreground"}>{label}</span>
      {ok ? (
        <BadgeCheck className="size-4 shrink-0 text-brand" />
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      )}
    </div>
  )
}
