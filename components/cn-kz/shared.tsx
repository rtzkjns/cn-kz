"use client"

import { Badge } from "@/components/ui/badge"
import {
  DEAL_STATUS_LABEL,
  type DealStatus,
  type OfferStatus,
  type OrderStatus,
} from "@/lib/cn-kz/types"

export function money(usd: number) {
  return "$" + usd.toLocaleString("en-US")
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

const ORDER_STATUS: Record<
  OrderStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  published: { label: "Опубликован", variant: "info" },
  bidding: { label: "Торги", variant: "warning" },
  deal: { label: "Сделка", variant: "success" },
  archived: { label: "Архив", variant: "muted" },
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status]
  return <Badge variant={s.variant}>{s.label}</Badge>
}

const DEAL_STATUS_VARIANT: Record<
  DealStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  accepted: "info",
  picked_up: "info",
  at_border: "warning",
  delivered: "success",
  completed: "success",
  cancelled: "destructive",
}

export function DealStatusBadge({ status }: { status: DealStatus }) {
  return (
    <Badge variant={DEAL_STATUS_VARIANT[status]}>
      {DEAL_STATUS_LABEL[status]}
    </Badge>
  )
}

const OFFER_STATUS: Record<
  OfferStatus,
  { label: string; variant: React.ComponentProps<typeof Badge>["variant"] }
> = {
  pending: { label: "На рассмотрении", variant: "warning" },
  countered: { label: "Встречная цена", variant: "info" },
  accepted: { label: "Принят", variant: "success" },
  rejected: { label: "Отклонён", variant: "destructive" },
  expired: { label: "Истёк", variant: "muted" },
}

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
  const s = OFFER_STATUS[status]
  return <Badge variant={s.variant}>{s.label}</Badge>
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
