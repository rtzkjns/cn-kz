"use client"

import { useState, type ReactNode } from "react"
import {
  Ban,
  BadgeCheck,
  Box,
  Handshake,
  MessageCircle,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Star,
  Truck,
  Wallet,
  Weight,
  type LucideIcon,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScreenHeader } from "./phone-frame"
import { CallButton, StatusBadge, contactUnlocked, kzt, money } from "./shared"
import { Chip, Section } from "./ui-bits"
import { useCnKz } from "./store"

// Профиль ЗАКАЗЧИКА — симметрия с профилем перевозчика: перевозчик может проверить и пожаловаться.
export function ShipperProfileScreen({ orderId }: { orderId: string }) {
  const { getOrder, pop, push, showToast, t } = useCnKz()
  const [showReport, setShowReport] = useState(false)
  const [reportReason, setReportReason] = useState<string | null>(null)
  const order = getOrder(orderId)
  const s = order?.shipper
  if (!s) return null

  // §5: номер заказчика виден перевозчику только пока его отклик живой ИЛИ есть сделка.
  const unlocked = contactUnlocked({ offerStatus: order?.myOfferStatus, hasDeal: !!order?.deal })

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Заказчик")} onBack={pop} />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-40">
        {/* Identity — company + verification */}
        <div className="surface-glass space-y-3 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <Avatar name={s.name} className="size-14 shrink-0 rounded-full text-[17px] font-bold" />
            <div className="min-w-0 flex-1">
              <p className="t-h2 flex items-center gap-1.5">
                <span className="truncate">{s.name}</span>
                {s.verified && <BadgeCheck className="size-5 shrink-0 text-brand" />}
              </p>
              <p className="mt-1 truncate text-sm text-muted-foreground">{s.company ?? t("Заказчик")}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {s.verified ? (
              <StatusBadge tone="success" icon={ShieldCheck}>
                {t("Бизнес проверен · БИН")}
              </StatusBadge>
            ) : (
              <StatusBadge tone="warn">{t("Новичок · без БИН")}</StatusBadge>
            )}
          </div>
        </div>

        {/* Trust stat strip — рейтинг / сделки (big tabular numbers fill the band under the name) */}
        <div className="surface-glass flex items-stretch divide-x divide-border rounded-2xl">
          <StatCell icon={Star} value={s.rating.toFixed(1)} label={t("Рейтинг")} />
          <StatCell icon={Handshake} value={s.dealsCount} label={t("Сделок")} />
        </div>

        {/* Что везёт этот заказчик — контекст заказа, из-за которого открыт профиль */}
        {order && (
          <div className="surface-glass space-y-3 rounded-2xl p-4">
            <p className="t-eyebrow">{t("Груз этого заказчика")}</p>
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
                <p className="t-eyebrow">{t("Цена заказчика")}</p>
                <p className="t-display mt-1.5">{money(order.priceUsd)}</p>
                <p className="font-mono-tech mt-1.5 text-sm leading-none text-muted-foreground/80">
                  {kzt(order.priceUsd)} · {t("оплата в USD")}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <MetaPill icon={Truck}>{order.truckType}</MetaPill>
              <MetaPill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} {t("кг")}</MetaPill>
              <MetaPill icon={Box}>{order.volumeM3} {t("м³")}</MetaPill>
              <MetaPill icon={Wallet}>{order.payment === "cash" ? t("Наличные") : t("Перевод")}</MetaPill>
            </div>
          </div>
        )}

        {/* Как заказчик платит — важнее всего для перевозчика (риск неоплаты). */}
        <Section title={t("Проверка заказчика")}>
          <div className="surface-glass space-y-2 rounded-2xl p-4 text-sm">
            <VRow ok label={t("Телефон подтверждён")} />
            <VRow ok={!!s.verified} label={t("БИН/ИНН сверен с реестром юрлиц")} />
            <VRow ok={s.dealsCount > 0} label={`${t("История:")} ${s.dealsCount} ${t("завершённых сделок")}`} />
            <p className="pt-1 text-sm leading-snug text-muted-foreground">
              {t("Аванс берите на счёт компании по БИН, не на личную карту. Оплата — напрямую, площадка деньги не держит.")}
            </p>
          </div>
        </Section>

        {s.reviews && s.reviews.length > 0 && (
          <Section title={`${t("Отзывы перевозчиков")} (${s.reviews.length})`}>
            <div className="space-y-2">
              {s.reviews.map((r) => (
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

      {/* Нижняя панель контакта — звонок = основное действие на экране профиля (§4/§5). */}
      <div className="absolute inset-x-0 bottom-0 space-y-2 bg-card px-3 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgba(20,17,14,0.12)]">
        {unlocked ? (
          <>
            <CallButton phone={s.phone} variant="primary" className="w-full" />
            <Button
              variant="secondary"
              size="lg"
              className="h-12 w-full"
              onClick={() => {
                if (order?.deal) push({ type: "chat", orderId })
                else showToast(t("Чат откроется после сделки · сейчас доступен вопрос «Уточнить»"))
              }}
            >
              <MessageCircle className="size-5" /> {t("Чат")}
            </Button>
          </>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="lg"
              className="h-12 flex-1"
              onClick={() => {
                if (order?.deal) push({ type: "chat", orderId })
                else showToast(t("Чат откроется после сделки · сейчас доступен вопрос «Уточнить»"))
              }}
            >
              <MessageCircle className="size-5" /> {t("Чат")}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="h-12 flex-1"
              onClick={() => showToast(t("Номер откроется после вашего отклика или начала сделки"))}
            >
              <Phone className="size-5" /> {t("Номер скрыт")}
            </Button>
          </div>
        )}
        <button
          onClick={() => setShowReport(true)}
          className="flex w-full items-center justify-center gap-1.5 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
        >
          <ShieldAlert className="size-3.5" /> {t("Пожаловаться на заказчика")}
        </button>
      </div>

      {showReport && (
        <div
          className="animate-in fade-in absolute inset-0 z-50 flex items-end bg-black/50"
          onClick={() => setShowReport(false)}
        >
          <div
            className="animate-in slide-in-from-bottom w-full space-y-2 rounded-t-3xl bg-card p-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="t-h3">{t("Пожаловаться на")} {s.name}</p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {["Не платит", "Мошенничество", "Груз не тот", "Не выходит на связь", "Другое"].map((r) => (
                <Chip key={r} active={reportReason === r} onClick={() => setReportReason(r)}>
                  {t(r)}
                </Chip>
              ))}
            </div>
            <Button size="lg" className="w-full" disabled={!reportReason} onClick={() => { setShowReport(false); showToast(`${t("Жалоба отправлена")} (${reportReason}) — ${t("модерация проверит профиль")}`); setReportReason(null) }}>
              <ShieldAlert className="size-4" /> {t("Отправить жалобу")}
            </Button>
            <Button variant="destructive" size="lg" className="w-full" onClick={() => { setShowReport(false); showToast(`${s.name} ${t("заблокирован — вы не увидите его заказы")}`) }}>
              <Ban className="size-4" /> {t("Заблокировать")}
            </Button>
            <button onClick={() => setShowReport(false)} className="w-full py-3 text-center text-sm font-medium text-muted-foreground hover:text-foreground">
              {t("Отмена")}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Плотная ячейка «иконка + число + подпись» — большие табличные числа под именем.
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

function VRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={ok ? "tabular-nums text-foreground" : "tabular-nums text-muted-foreground"}>{label}</span>
      {ok ? <BadgeCheck className="size-4 shrink-0 text-brand" /> : <span className="text-xs text-muted-foreground">—</span>}
    </div>
  )
}
