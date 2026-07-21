"use client"

import { Mail, MessageCircle, MessagesSquare, ShieldCheck, Truck } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ScreenHeader } from "./phone-frame"
import { DealStatusBadge, Rating } from "./shared"
import { useCnKz } from "./store"
import { EmptyState, StatStrip } from "./ui-bits"

// Компактный маршрут-блок «Signal»: синяя точка-происхождение → лаймовая точка-назначение.
function RouteMini({ from, to }: { from: string; to: string }) {
  return (
    <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[15px] font-medium">
      <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-from)]" />
      <span className="truncate">{from}</span>
      <span className="shrink-0 text-muted-foreground">→</span>
      <span className="size-2.5 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
      <span className="truncate">{to}</span>
    </div>
  )
}

export function ChatsListScreen() {
  const { myOrders, feedOrders, role, push, setTab } = useCnKz()
  const source = role === "carrier" ? feedOrders : myOrders
  const convos = source.filter((o) => o.deal)

  // Существующие данные → плотная сводка сверху (анти-пустота): всего / новые / в работе.
  const unreadCount = convos.filter((o) => {
    const last = o.deal!.chat[o.deal!.chat.length - 1]
    return last ? !last.fromMe : false
  }).length
  const activeCount = convos.filter(
    (o) => o.deal!.status !== "completed" && o.deal!.status !== "cancelled"
  ).length

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Чаты" subtitle="Переписка по сделкам" />

      <div className="flex-1 overflow-y-auto pb-24">
        {convos.length === 0 ? (
          <div className="px-4">
            <EmptyState
              icon={MessageCircle}
              title="Чатов пока нет"
              hint="Как только вы примете отклик или начнётся сделка — переписка появится здесь."
              action={
                <Button
                  size="lg"
                  onClick={() => setTab(role === "carrier" ? "feed" : "myorders")}
                >
                  {role === "carrier" ? "Смотреть грузы" : "Мои заказы"}
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <StatStrip
              items={[
                { value: convos.length, label: "Диалоги", icon: MessagesSquare },
                { value: unreadCount, label: "Новые", icon: Mail, accent: true },
                { value: activeCount, label: "В работе", icon: Truck },
              ]}
            />

            <div className="animate-in fade-in slide-in-from-bottom-1 space-y-2.5 px-4 duration-300">
              {convos.map((o) => {
                const deal = o.deal!
                const other = role === "shipper" ? deal.carrier : o.shipper
                const last = deal.chat[deal.chat.length - 1]
                const unread = last ? !last.fromMe : false
                return (
                  <button
                    key={o.id}
                    onClick={() => push({ type: "chat", orderId: o.id })}
                    className="surface-glass flex w-full flex-col gap-2.5 rounded-2xl p-3.5 text-left transition-transform duration-150 active:scale-[0.99]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative shrink-0">
                        <Avatar name={other.name} className="size-11 bg-brand/10 text-brand" />
                        {unread && (
                          <span className="absolute -top-0.5 -right-0.5 size-3 rounded-full bg-brand ring-2 ring-card" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-[17px] font-bold">{other.name}</p>
                          <Rating value={other.rating} />
                        </div>
                        <RouteMini from={o.origin} to={o.destination} />
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-1.5">
                        <DealStatusBadge status={deal.status} />
                        {last && (
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {last.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="surface-inset rounded-lg px-3 py-2">
                      <p
                        className={
                          "truncate text-sm " +
                          (unread ? "font-semibold text-foreground" : "text-muted-foreground")
                        }
                      >
                        {last ? (last.fromMe ? "Вы: " : "") + last.text : "Нет сообщений"}
                      </p>
                    </div>
                  </button>
                )
              })}

              {/* Анти-пустота: полезная подсказка о контактах (FINAL-SPEC §5) заполняет низ экрана. */}
              <div className="surface-inset mt-1 flex items-start gap-3 rounded-2xl p-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/12 text-brand">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Контакты открыты внутри сделки</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Звонок и переписка доступны, пока отклик или сделка активны.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
