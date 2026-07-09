"use client"

import { useState } from "react"
import { Box, Calendar, Check, ChevronRight, Heart, MessageCircle, Pin, Plus, Star, Truck, Weight } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import type { Order } from "@/lib/cn-kz/types"
import { cn } from "@/lib/utils"
import { DealStatusBadge, OfferStatusBadge, OrderStatusBadge, money } from "./shared"

function MetaPill({ icon: Icon, children }: { icon: typeof Truck; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-[4px] bg-secondary px-2 py-1 text-[11px] font-medium text-muted-foreground tabular-nums">
      <Icon className="size-3 opacity-60" />
      {children}
    </span>
  )
}

export function OrderCard({
  order,
  onClick,
  showMyOffer = false,
  pinned = false,
  onTogglePin,
  favorited = false,
  onToggleFavorite,
  onAddToTrip,
  inTrip = false,
  browse = false,
  onQuickAccept,
}: {
  order: Order
  onClick: () => void
  showMyOffer?: boolean
  pinned?: boolean
  onTogglePin?: () => void
  favorited?: boolean
  onToggleFavorite?: () => void
  onAddToTrip?: () => void // добавить/убрать груз из сборного рейса
  inTrip?: boolean
  // browse = маркетплейс «Главная»: чужие грузы, без статуса/счётчика откликов — только просмотр.
  browse?: boolean
  onQuickAccept?: () => void // перевозчик: принять цену заказчика в один тап прямо из ленты
}) {
  const [confirmAccept, setConfirmAccept] = useState(false)
  const newOffers = order.offers.filter((o) => o.status === "pending").length
  const hasUnread = order.deal?.chat.some((m) => !m.fromMe)
  const price = money(order.deal?.agreedPriceUsd ?? order.priceUsd)

  return (
    <div
      onClick={onClick}
      className={cn(
        "surface-glass group cursor-pointer rounded-md p-3.5 transition-transform duration-150 active:scale-[0.99]"
      )}
    >
      {/* Trust header: shipper + rating · freshness, status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Avatar name={order.shipper.name} className="size-7 rounded-[4px] text-[11px]" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-[13px] font-semibold">{order.shipper.name}</p>
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Star className="size-3 fill-muted-foreground/80 text-muted-foreground/80" />
              <span className="font-mono-tech text-foreground/80">
                {order.shipper.rating.toFixed(1)}
              </span>
              <span aria-hidden>·</span>
              {order.createdAgo}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite()
              }}
              aria-label="В избранное"
              className={cn(
                "flex size-6 items-center justify-center rounded-md transition-colors",
                favorited ? "text-rose-400" : "text-muted-foreground/50 hover:text-foreground"
              )}
            >
              <Heart className={cn("size-4", favorited && "fill-rose-400")} />
            </button>
          )}
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onTogglePin()
              }}
              aria-label="Закрепить"
              className={cn(
                "flex size-6 items-center justify-center rounded-md transition-colors",
                pinned ? "text-brand" : "text-muted-foreground/50 hover:text-foreground"
              )}
            >
              <Pin className={cn("size-4", pinned && "fill-brand")} />
            </button>
          )}
          {!browse &&
            (order.deal ? (
              <DealStatusBadge status={order.deal.status} />
            ) : (
              <OrderStatusBadge status={order.status} />
            ))}
        </div>
      </div>

      {/* Route — origin muted, destination bold */}
      <div className="mt-3 flex gap-3">
        <div className="flex flex-col items-center pt-1.5">
          <span className="size-1.5 rounded-full bg-muted-foreground/60" />
          <span className="my-1 w-px flex-1 bg-gradient-to-b from-border to-brand/50" />
          <span className="size-2 rounded-full bg-brand ring-4 ring-brand/15" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-muted-foreground">
            {order.origin}
          </p>
          <p className="mt-1 truncate text-lg font-bold tracking-tight">
            {order.destination}
          </p>
        </div>
      </div>

      {/* Cargo */}
      <p className="mt-2.5 line-clamp-1 text-[13px] text-muted-foreground">
        {order.cargo}
      </p>

      {/* Meta pills */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <MetaPill icon={Truck}>{order.truckType}</MetaPill>
        <MetaPill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} кг</MetaPill>
        <MetaPill icon={Box}>{order.volumeM3} м³</MetaPill>
        <MetaPill icon={Calendar}>{order.readyDate}</MetaPill>
      </div>

      {/* Price footer + contextual action */}
      <div className="mt-3 flex items-center justify-between rounded-md bg-secondary px-3.5 py-2.5">
        <div className="leading-none">
          <p className="font-mono-tech text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
            Цена заказчика
          </p>
          <p className="font-mono-tech mt-1.5 text-[22px] leading-none font-bold tracking-tight">
            {price}
          </p>
        </div>

        {browse ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
            Смотреть <ChevronRight className="size-4" />
          </span>
        ) : order.deal ? (
          <span className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground">
            {hasUnread && <MessageCircle className="size-4 text-brand" />}
            Открыть <ChevronRight className="size-4" />
          </span>
        ) : newOffers > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-md border border-brand/35 bg-brand/12 px-3 py-2 text-[13px] font-semibold text-brand tabular-nums">
            {newOffers} {newOffers === 1 ? "отклик" : newOffers < 5 ? "отклика" : "откликов"}
            <ChevronRight className="size-3.5" />
          </span>
        ) : showMyOffer && order.myOfferStatus ? (
          // Уже откликнулись — показываем СТАТУС отклика, а не повторную «Принять» (иначе двойная ставка).
          <OfferStatusBadge status={order.myOfferStatus} />
        ) : showMyOffer && onQuickAccept ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (confirmAccept) {
                onQuickAccept()
                setConfirmAccept(false)
              } else {
                setConfirmAccept(true)
              }
            }}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-4 py-2.5 text-[13px] font-bold text-white shadow-key transition-transform hover:brightness-110 active:scale-95",
              confirmAccept ? "bg-emerald-600" : "bg-emerald-500"
            )}
          >
            <Check className="size-4" /> {confirmAccept ? "Точно?" : "Принять"}
          </button>
        ) : showMyOffer ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-primary px-3.5 py-2.5 text-[13px] font-semibold text-primary-foreground shadow-key transition-transform group-active:scale-95">
            Откликнуться
            <ChevronRight className="size-3.5" />
          </span>
        ) : (
          <ChevronRight className="size-5 text-muted-foreground" />
        )}
      </div>

      {onAddToTrip && !order.deal && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onAddToTrip()
          }}
          className={cn(
            "mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border py-2 text-[13px] font-medium transition-colors",
            inTrip
              ? "border-brand/40 bg-brand/12 text-brand"
              : "border-border text-muted-foreground hover:text-foreground"
          )}
        >
          {inTrip ? (
            <>
              <Check className="size-3.5" /> В рейсе
            </>
          ) : (
            <>
              <Plus className="size-3.5" /> Добавить в рейс
            </>
          )}
        </button>
      )}
    </div>
  )
}
