"use client"

import { MessageCircle } from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"

export function ChatsListScreen() {
  const { myOrders, feedOrders, role, push } = useCnKz()
  const source = role === "carrier" ? feedOrders : myOrders
  const convos = source.filter((o) => o.deal)

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Чаты" subtitle="Переписка по сделкам" />

      <div className="flex-1 overflow-y-auto px-4 pb-24">
        {convos.length === 0 && (
          <div className="flex flex-col items-center gap-2 pt-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <MessageCircle className="size-5" />
            </span>
            <p className="text-base font-medium">Чатов пока нет</p>
            <p className="max-w-[16rem] text-sm text-muted-foreground">
              Как только вы примете отклик или начнётся сделка — переписка появится здесь.
            </p>
          </div>
        )}
        <div className="animate-in fade-in slide-in-from-bottom-1 divide-y divide-border duration-300">
          {convos.map((o) => {
            const deal = o.deal!
            const other = role === "shipper" ? deal.carrier : o.shipper
            const last = deal.chat[deal.chat.length - 1]
            const unread = last ? !last.fromMe : false
            return (
              <button
                key={o.id}
                onClick={() => push({ type: "chat", orderId: o.id })}
                className="flex min-h-14 w-full items-center gap-3 py-3 text-left transition-colors active:bg-muted/40"
              >
                <Avatar name={other.name} className="size-11 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-base font-semibold">{other.name}</p>
                    {last && <span className="shrink-0 text-sm text-muted-foreground">{last.time}</span>}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {o.origin} → {o.destination}
                  </p>
                  <p className={"truncate text-sm " + (unread ? "font-medium text-foreground" : "text-muted-foreground")}>
                    {last ? (last.fromMe ? "Вы: " : "") + last.text : "Нет сообщений"}
                  </p>
                </div>
                {unread && <span className="size-2 shrink-0 rounded-full bg-brand" />}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
