"use client"

import {
  Archive,
  ArrowLeftRight,
  Ban,
  Check,
  CheckCheck,
  Clock,
  Flag,
  Gavel,
  Handshake,
  PackageCheck,
  Phone,
  Radio,
  Truck,
  X,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  DEAL_STATUS_LABEL,
  type DealStatus,
  type OfferStatus,
  type OrderStatus,
} from "@/lib/cn-kz/types"

export function money(usd: number) {
  return "$" + usd.toLocaleString("en-US")
}

// ≈₸ для перевозчика: цена котируется в USD (locked), тенге — только ориентир (FINAL-SPEC §7).
// Один зашитый приблизительный курс; в реальном апе — поддерживаемая/кэшируемая константа, не платный FX.
export const USD_TO_KZT = 500
export function kzt(usd: number) {
  const t = Math.round((usd * USD_TO_KZT) / 1000) * 1000 // округляем до тысяч ₸
  return "≈ " + t.toLocaleString("ru-RU") + " ₸"
}

// ===== Единый статус-бейдж: цветная точка + слово на 12%-тинте (никогда только цвет). FINAL-SPEC §2.3 =====
type Tone = "success" | "warn" | "info" | "brand" | "danger" | "muted"
const TONE: Record<Tone, string> = {
  success: "text-[var(--success)] bg-[color-mix(in_srgb,var(--success)_14%,transparent)]",
  warn: "text-[var(--warn)] bg-[color-mix(in_srgb,var(--warn)_14%,transparent)]",
  info: "text-[var(--info)] bg-[color-mix(in_srgb,var(--info)_16%,transparent)]",
  brand: "text-brand bg-brand/12",
  danger: "text-destructive bg-transparent", // danger = текст + точка только
  muted: "text-muted-foreground bg-muted",
}
export function StatusBadge({
  tone,
  icon: Icon,
  children,
}: {
  tone: Tone
  icon?: LucideIcon
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md px-2.5 py-1 text-[13px] font-semibold whitespace-nowrap",
        TONE[tone]
      )}
    >
      {Icon ? <Icon className="size-3.5" /> : <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

// Русское склонение: plural(4, "заказ", "заказа", "заказов") → "заказа".
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return one
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few
  return many
}

export const deals = (n: number) => `${n} ${plural(n, "сделка", "сделки", "сделок")}`

const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  published: { label: "Опубликован", tone: "info", icon: Radio },
  bidding: { label: "Торги", tone: "warn", icon: Gavel },
  deal: { label: "Сделка", tone: "brand", icon: Handshake },
  archived: { label: "Архив", tone: "muted", icon: Archive },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status]
  return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>
}

// FINAL-SPEC §2.3 complete map: accepted=brand(agreed), picked_up=warn(в пути), at_border=info,
// delivered/completed=success, cancelled=danger.
const DEAL_STATUS: Record<DealStatus, { tone: Tone; icon: LucideIcon }> = {
  accepted: { tone: "brand", icon: Handshake },
  picked_up: { tone: "warn", icon: Truck },
  at_border: { tone: "info", icon: Flag },
  delivered: { tone: "success", icon: PackageCheck },
  completed: { tone: "success", icon: CheckCheck },
  cancelled: { tone: "danger", icon: X },
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  const s = DEAL_STATUS[status]
  return <StatusBadge tone={s.tone} icon={s.icon}>{DEAL_STATUS_LABEL[status]}</StatusBadge>
}

const OFFER_STATUS: Record<OfferStatus, { label: string; tone: Tone; icon: LucideIcon }> = {
  pending: { label: "На рассмотрении", tone: "warn", icon: Clock },
  countered: { label: "Встречная цена", tone: "info", icon: ArrowLeftRight },
  accepted: { label: "Принят", tone: "success", icon: Check },
  rejected: { label: "Отклонён", tone: "danger", icon: X },
  expired: { label: "Истёк", tone: "muted", icon: Ban },
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const s = OFFER_STATUS[status]
  return <StatusBadge tone={s.tone} icon={s.icon}>{s.label}</StatusBadge>
}

// ===== Раскрытие контакта (FINAL-SPEC §5). Маскировка снимается только внутри «живой» сделки/отклика. =====
export function offerLive(status?: OfferStatus) {
  return status === "pending" || status === "countered" || status === "accepted"
}
// Раскрыт ли контакт: есть сделка ЛИБО живой отклик между сторонами (не rejected/expired, не гость).
export function contactUnlocked(opts: { offerStatus?: OfferStatus; hasDeal?: boolean }) {
  return !!opts.hasDeal || offerLive(opts.offerStatus)
}

// Рабочая кнопка звонка (tel:) — высокоакцентная ВТОРИЧНАЯ (кроме экранов профиля). 48px, водитель звонит.
export function CallButton({
  phone,
  className = "",
}: {
  phone: string
  className?: string
}) {
  return (
    <a
      href={`tel:${phone.replace(/[^+\d]/g, "")}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "flex h-12 items-center justify-center gap-2 rounded-md border border-brand/40 bg-brand/10 px-4 text-[15px] font-semibold text-brand transition-transform active:scale-[0.98]",
        className
      )}
    >
      <Phone className="size-5" /> Позвонить
    </a>
  )
}

export function Rating({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-muted-foreground">
      ★ <span className="font-mono-tech text-foreground">{value.toFixed(1)}</span>
    </span>
  )
}

export function Route({
  from,
  to,
  className = "",
}: {
  from: string
  to: string
  className?: string
}) {
  return (
    <span className={"font-semibold tracking-tight " + className}>
      {from} <span className="font-normal text-muted-foreground">→</span> {to}
    </span>
  )
}
