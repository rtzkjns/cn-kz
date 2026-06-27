"use client"

import { Box, Calendar, ChevronRight, MessageCircle, Star, Truck, Weight } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import type { Order } from "@/lib/cn-kz/types"
import { cn } from "@/lib/utils"
import { DealStatusBadge, OrderStatusBadge, money } from "./shared"

function MetaPill({ icon: Icon, children }: { icon: typeof Truck; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-foreground/70 tabular-nums">
      <Icon className="size-3 opacity-60" />
      {children}
    </span>
  )
}

export function OrderCard({
  order,
  onClick,
  showMyOffer = false,
}: {
  order: Order
  onClick: () => void
  showMyOffer?: boolean
}) {
  const newOffers = order.offers.filter((o) => o.status === "pending").length
  const hasUnread = order.deal?.chat.some((m) => !m.fromMe)
  const mine = showMyOffer && !!order.myOfferStatus
  const price = money(order.deal?.agreedPriceUsd ?? order.priceUsd)

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-3xl p-4 transition-transform duration-150 active:scale-[0.985]",
        mine ? "surface-glass-brand" : "surface-glass"
      )}
    >
      {/* Trust header: shipper + rating · freshness, status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={order.shipper.name} className="size-7 text-[11px]" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">{order.shipper.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground/70 tabular-nums">
                {order.shipper.rating.toFixed(1)}
              </span>
              <span aria-hidden>·</span>
              {order.createdAgo}
            </p>
          </div>
        </div>
        {order.deal ? (
          <DealStatusBadge status={order.deal.status} />
        ) : (
          <OrderStatusBadge status={order.status} />
        )}
      </div>

      {/* Route — origin muted, destination bold (the goal) */}
      <div className="mt-4 flex gap-3">
        <div className="flex flex-col items-center pt-1.5">
          <span className="size-2 rounded-full bg-muted-foreground/50" />
          <span className="my-1 w-px flex-1 bg-gradient-to-b from-muted-foreground/30 to-brand/40" />
          <span className="size-2.5 rounded-full bg-brand ring-4 ring-brand/10" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-muted-foreground">
            {order.origin}
          </p>
          <p className="mt-3 truncate text-lg font-bold tracking-tight">
            {order.destination}
          </p>
        </div>
      </div>

      {/* Cargo */}
      <p className="mt-3 line-clamp-1 text-[13px] text-muted-foreground">
        {order.cargo}
      </p>

      {/* Meta pills */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        <MetaPill icon={Truck}>{order.truckType}</MetaPill>
        <MetaPill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} кг</MetaPill>
        <MetaPill icon={Box}>{order.volumeM3} м³</MetaPill>
        <MetaPill icon={Calendar}>{order.readyDate}</MetaPill>
      </div>

      {/* Price footer + contextual action */}
      <div className="mt-4 flex items-center justify-between rounded-2xl bg-muted px-3.5 py-2.5">
        <div className="leading-none">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Цена шипера
          </p>
          <p className="mt-1.5 text-[22px] leading-none font-extrabold tracking-tight tabular-nums">
            {price}
          </p>
        </div>

        {order.deal ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
            {hasUnread && <MessageCircle className="size-4 text-brand" />}
            Открыть <ChevronRight className="size-4" />
          </span>
        ) : mine ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/12 px-3.5 py-2 text-[13px] font-semibold text-brand">
            Ваш оффер
          </span>
        ) : newOffers > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-brand/12 px-3.5 py-2 text-[13px] font-semibold text-brand tabular-nums">
            {newOffers} {newOffers === 1 ? "оффер" : newOffers < 5 ? "оффера" : "офферов"}
            <ChevronRight className="size-3.5" />
          </span>
        ) : showMyOffer ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2.5 text-[13px] font-semibold text-background shadow-key transition-transform group-active:scale-95">
            Откликнуться
            <ChevronRight className="size-3.5" />
          </span>
        ) : (
          <ChevronRight className="size-5 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}
