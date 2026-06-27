"use client"

import { Box, Calendar, ChevronRight, MessageCircle, Truck, Weight } from "lucide-react"

import type { Order } from "@/lib/cn-kz/types"
import { cn } from "@/lib/utils"
import { DealStatusBadge, OrderStatusBadge, money } from "./shared"

// Route as a graphic: origin → dashed track with a truck → destination.
function RouteLine({ from, to }: { from: string; to: string }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
        <span className="truncate">{from}</span>
        <span className="text-brand">→</span>
        <span className="truncate">{to}</span>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/70" />
        <span className="h-px flex-1 border-t border-dashed border-border" />
        <Truck className="size-3 shrink-0 text-muted-foreground" />
        <span className="h-px flex-1 border-t border-dashed border-border" />
        <span className="size-1.5 shrink-0 rounded-full bg-brand" />
      </div>
    </div>
  )
}

function Meta({ icon: Icon, children }: { icon: typeof Truck; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1">
      <Icon className="size-3 opacity-55" />
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

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative cursor-pointer rounded-2xl p-4 transition-[scale,box-shadow] duration-150 active:scale-[0.985]",
        mine ? "surface-glass-brand" : "surface-glass"
      )}
    >
      {/* Route + status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <RouteLine from={order.origin} to={order.destination} />
        </div>
        {order.deal ? (
          <DealStatusBadge status={order.deal.status} />
        ) : (
          <OrderStatusBadge status={order.status} />
        )}
      </div>

      {/* Cargo */}
      <p className="mt-3 line-clamp-1 text-xs text-muted-foreground">
        {order.cargo}
      </p>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground tabular-nums">
        <Meta icon={Truck}>{order.truckType}</Meta>
        <Meta icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} кг</Meta>
        <Meta icon={Box}>{order.volumeM3} м³</Meta>
        <Meta icon={Calendar}>{order.readyDate}</Meta>
      </div>

      {/* Price + signals */}
      <div className="mt-3.5 flex items-end justify-between border-t border-border pt-3">
        <div className="flex items-baseline gap-1">
          <span className="font-mono-tech text-xl leading-none font-semibold text-foreground">
            {money(order.deal?.agreedPriceUsd ?? order.priceUsd)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {hasUnread && (
            <span className="text-muted-foreground">
              <MessageCircle className="size-4" />
            </span>
          )}
          {mine && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-[11px] font-medium text-brand">
              Ваш оффер
            </span>
          )}
          {newOffers > 0 && (
            <span className="inline-flex items-center gap-0.5 font-medium text-brand tabular-nums">
              {newOffers}{" "}
              {newOffers === 1 ? "оффер" : newOffers < 5 ? "оффера" : "офферов"}
              <ChevronRight className="size-3.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
