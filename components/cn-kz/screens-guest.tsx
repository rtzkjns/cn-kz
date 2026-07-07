"use client"

import { useState } from "react"
import { ChevronLeft, Lock, Package, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FEED_ORDERS } from "@/lib/cn-kz/mock-data"
import type { Order } from "@/lib/cn-kz/types"
import { OrderCard } from "./order-card"
import { StatusBar } from "./phone-frame"
import { Rating, Route, deals, money } from "./shared"
import { DetailRow, Section } from "./ui-bits"
import { useCnKz } from "./store"

// Public marketplace — anyone can browse open loads without an account (kolesa/OLX model).
// Actions (offer, post, contacts) are gated behind auth.
export function GuestApp() {
  const { openAuth } = useCnKz()
  const [order, setOrder] = useState<Order | null>(null)
  const [q, setQ] = useState("")
  const words = q.trim().toLowerCase().replace(/#/g, " ").split(/\s+/).filter(Boolean)
  const loads = FEED_ORDERS.filter((o) => {
    if (o.deal) return false
    const hay = `${o.origin} ${o.destination} ${o.cargo} ${o.truckType}`.toLowerCase()
    return words.length === 0 || words.every((w) => hay.includes(w))
  })

  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-b from-neutral-950 to-black p-0 sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2rem] sm:border-[6px] sm:border-neutral-800 sm:shadow-2xl">
        <StatusBar />
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
          <span className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <Package className="size-4" />
            </span>
            CN-KZ
          </span>
          <Button size="sm" onClick={openAuth}>
            Войти
          </Button>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          {order ? (
            <GuestOrderDetail order={order} onBack={() => setOrder(null)} onAuth={openAuth} />
          ) : (
            <div className="space-y-3 px-4 py-4 pb-28">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Свободные грузы</h1>
                <p className="text-xs text-muted-foreground">
                  по всей СНГ · смотрите без регистрации
                </p>
              </div>

              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Напишите город или тип груза…"
                  className="h-10 pl-8"
                />
              </div>
              {loads.length === 0 && (
                <div className="flex flex-col items-center gap-2 pt-10 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <Search className="size-5" />
                  </span>
                  <p className="text-sm text-muted-foreground">Ничего не найдено по «{q}»</p>
                  <button onClick={() => setQ("")} className="text-sm font-medium text-brand hover:underline">
                    Сбросить поиск
                  </button>
                </div>
              )}
              {loads.map((o, i) => (
                <div
                  key={o.id}
                  className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both"
                  style={{ animationDelay: `${Math.min(i, 6) * 50}ms`, animationDuration: "300ms" }}
                >
                  <OrderCard order={o} onClick={() => setOrder(o)} />
                </div>
              ))}
              {loads.length > 0 && (
                <button
                  onClick={openAuth}
                  className="w-full pt-2 pb-1 text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Есть свой груз? <span className="text-brand">Разместить →</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function GuestOrderDetail({
  order,
  onBack,
  onAuth,
}: {
  order: Order
  onBack: () => void
  onAuth: () => void
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 px-4 pt-4 pb-2">
        <button
          onClick={onBack}
          className="-ml-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Назад"
        >
          <ChevronLeft className="size-5" />
        </button>
        <div className="min-w-0">
          <h1 className="font-heading text-lg leading-tight font-semibold">
            Груз <span className="font-mono-tech">{order.id.replace("ord-", "#")}</span>
          </h1>
          <p className="truncate text-xs text-muted-foreground">
            {order.origin} → {order.destination}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-28">
        <Card size="sm">
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <Route from={order.origin} to={order.destination} />
              <span className="font-mono-tech text-base font-semibold text-foreground">
                {money(order.priceUsd)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{order.cargo}</p>
            <DetailRow label="Тип авто" value={order.truckType} />
            <DetailRow
              label="Вес / объём"
              value={`${order.weightKg.toLocaleString("ru-RU")} кг · ${order.volumeM3} м³`}
            />
            <DetailRow label="Готов к погрузке" value={order.readyDate} />
            <DetailRow label="Направление" value={`${order.origin} → ${order.destination}`} />
          </CardContent>
        </Card>

        <Section title="Заказчик">
          <Card size="sm">
            <CardContent className="flex items-center gap-2">
              <div className="ava size-8 rounded-full border border-border bg-secondary text-xs" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{order.shipper.name}</p>
                <p className="text-xs text-muted-foreground">
                  <Rating value={order.shipper.rating} /> · {deals(order.shipper.dealsCount)}
                </p>
              </div>
            </CardContent>
          </Card>
        </Section>

        {/* gated contacts */}
        <Card size="sm" className="ring-brand/30">
          <CardContent className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Lock className="size-4 text-brand" /> Контакты и точный адрес скрыты
            </p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Точка погрузки</span>
              <span className="select-none blur-[3px]">г. •••, склад ••</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Телефон</span>
              <span className="font-mono-tech select-none blur-[3px]">+7 ••• ••• •• ••</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Адрес доставки</span>
              <span className="select-none blur-[3px]">{order.destination}, ул. •••</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Полные контакты доступны после входа — так мы защищаем данные от спама.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-2 border-t border-border bg-card p-3">
        <Button className="w-full" onClick={onAuth}>
          Войти, чтобы откликнуться
        </Button>
        <p className="text-center text-[11px] text-muted-foreground">
          Регистрация за минуту · Google или телефон
        </p>
      </div>
    </div>
  )
}
