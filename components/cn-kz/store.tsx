"use client"

import { createContext, useContext, useMemo, useState } from "react"

import {
  FEED_ORDERS,
  ME_CARRIER,
  ME_SHIPPER,
  MY_ORDERS,
} from "@/lib/cn-kz/mock-data"
import {
  DEAL_FLOW,
  type ChatMessage,
  type OfferKind,
  type Order,
  type Role,
} from "@/lib/cn-kz/types"

// A pushed detail screen sits on top of the active tab.
export type Screen =
  | { type: "orderDetail"; orderId: string }
  | { type: "createOrder" }
  | { type: "cargoDetail"; orderId: string }
  | { type: "deal"; orderId: string }
  | { type: "chat"; orderId: string }

export type Tab = "feed" | "deals" | "profile"

export interface Notification {
  id: string
  kind: "offer" | "message"
  title: string
  subtitle: string
  screen: Screen
}

export interface NewOrderDraft {
  pickupPoint: string
  pickupPhone: string
  destination: Order["destination"]
  cargo: string
  weightKg: number
  volumeM3: number
  truckType: Order["truckType"]
  priceUsd: number
  readyDate: string
  notes: string
  address: string
  recipientName: string
  recipientPhone: string
  payment: Order["payment"]
}

interface CnKzStore {
  authed: boolean
  enterApp: (r: Role) => void // finish onboarding → main app with a fixed role
  resetOnboarding: () => void // demo reset: back to the onboarding flow
  role: Role
  setRole: (r: Role) => void
  tab: Tab
  setTab: (t: Tab) => void
  dealsNewOnly: boolean // «Сделки» отфильтрованы по «Есть новые» (§10)
  setDealsNewOnly: (v: boolean) => void
  openNotifications: () => void // «Все» из дропдауна → дашборд сделок с фильтром «есть новые» (§10)
  notifications: Notification[]
  newCount: number // непрочитанные уведомления
  isNew: (orderId: string) => boolean // у заказа/сделки есть непрочитанные события
  markSeen: (orderId: string) => void // пометить заказ/сделку просмотренными
  stack: Screen[]
  push: (s: Screen) => void
  pop: () => void
  toast: string | null
  showToast: (m: string) => void

  myOrders: Order[]
  feedOrders: Order[]
  getOrder: (id: string) => Order | undefined

  publishOrder: (d: NewOrderDraft) => void
  acceptOffer: (orderId: string, offerId: string) => void
  makeOffer: (orderId: string, kind: OfferKind, priceUsd: number) => void
  advanceDeal: (orderId: string) => void
  confirmDelivery: (orderId: string) => void
  cancelDeal: (orderId: string) => void
  sendMessage: (orderId: string, text: string) => void
}

const Ctx = createContext<CnKzStore | null>(null)

export function useCnKz() {
  const v = useContext(Ctx)
  if (!v) throw new Error("useCnKz must be used inside CnKzProvider")
  return v
}

function nowTime() {
  return new Date().toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function CnKzProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [role, setRoleRaw] = useState<Role>("shipper")
  const [tab, setTabRaw] = useState<Tab>("feed")
  const [dealsNewOnly, setDealsNewOnly] = useState(false)
  const [seen, setSeen] = useState<string[]>([]) // id заказов с просмотренными событиями
  const [stack, setStack] = useState<Screen[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [myOrders, setMyOrders] = useState<Order[]>(MY_ORDERS)
  const [feedOrders, setFeedOrders] = useState<Order[]>(FEED_ORDERS)

  const store = useMemo<CnKzStore>(() => {
    function showToast(m: string) {
      setToast(m)
      setTimeout(() => setToast((cur) => (cur === m ? null : cur)), 2600)
    }

    function setRole(r: Role) {
      setRoleRaw(r)
      setTabRaw("feed")
      setStack([])
    }

    function enterApp(r: Role) {
      setRoleRaw(r)
      setTabRaw("feed")
      setStack([])
      setAuthed(true)
    }

    function resetOnboarding() {
      setAuthed(false)
      setStack([])
    }

    function setTab(t: Tab) {
      setTabRaw(t)
      setDealsNewOnly(false)
      setStack([])
    }

    // §10: тап по колокольчику → дашборд «Сделки» с фильтром «есть новые».
    function openNotifications() {
      setTabRaw("deals")
      setDealsNewOnly(true)
      setStack([])
    }

    const seenSet = new Set(seen)
    function markSeen(orderId: string) {
      setSeen((s) => (s.includes(orderId) ? s : [...s, orderId]))
    }
    // Заказ/сделка «новые», если есть непрочитанное событие и они ещё не просмотрены.
    function isNew(orderId: string) {
      if (seenSet.has(orderId)) return false
      const o = myOrders.find((x) => x.id === orderId)
      if (!o) return false
      const newOffers =
        role === "shipper" &&
        o.offers.some((of) => of.status === "pending") &&
        (o.status === "bidding" || o.status === "published")
      const newMsg =
        !!o.deal &&
        o.deal.status !== "completed" &&
        o.deal.status !== "cancelled" &&
        o.deal.chat.some((m) => !m.fromMe)
      return newOffers || newMsg
    }

    // Лента уведомлений: только непрочитанные (новые офферы шиперу + входящие сообщения в сделках).
    const notifications: Notification[] = []
    for (const o of myOrders) {
      if (seenSet.has(o.id)) continue
      if (role === "shipper") {
        const pending = o.offers.filter((of) => of.status === "pending").length
        if (pending > 0 && (o.status === "bidding" || o.status === "published")) {
          notifications.push({
            id: `${o.id}-offers`,
            kind: "offer",
            title: `${pending} ${pending === 1 ? "новый оффер" : "новых офферов"}`,
            subtitle: `${o.origin} → ${o.destination}`,
            screen: { type: "orderDetail", orderId: o.id },
          })
        }
      }
      if (
        o.deal &&
        o.deal.status !== "completed" &&
        o.deal.status !== "cancelled" &&
        o.deal.chat.some((m) => !m.fromMe)
      ) {
        const other = role === "shipper" ? o.deal.carrier.name : o.shipper.name
        notifications.push({
          id: `${o.id}-msg`,
          kind: "message",
          title: "Новое сообщение",
          subtitle: `${other} · ${o.origin} → ${o.destination}`,
          screen: { type: "deal", orderId: o.id },
        })
      }
    }
    const newCount = notifications.length

    const push = (s: Screen) => setStack((st) => [...st, s])
    const pop = () => setStack((st) => st.slice(0, -1))

    const getOrder = (id: string) =>
      [...myOrders, ...feedOrders].find((o) => o.id === id)

    function updateMy(id: string, fn: (o: Order) => Order) {
      setMyOrders((list) => list.map((o) => (o.id === id ? fn(o) : o)))
    }
    function updateFeed(id: string, fn: (o: Order) => Order) {
      setFeedOrders((list) => list.map((o) => (o.id === id ? fn(o) : o)))
    }

    function publishOrder(d: NewOrderDraft) {
      const order: Order = {
        id: `ord-${Math.floor(Math.random() * 9000 + 1000)}`,
        origin: "Хоргос",
        pickupPoint: d.pickupPoint.trim() || undefined,
        pickupPhone: d.pickupPhone.trim() || undefined,
        destination: d.destination,
        cargo: d.cargo,
        weightKg: d.weightKg,
        volumeM3: d.volumeM3,
        truckType: d.truckType,
        priceUsd: d.priceUsd,
        readyDate: d.readyDate,
        notes: d.notes.trim() || undefined,
        status: "published",
        shipper: ME_SHIPPER,
        address: d.address,
        recipientName: d.recipientName,
        recipientPhone: d.recipientPhone,
        payment: d.payment,
        createdAgo: "только что",
        offers: [],
      }
      setMyOrders((list) => [order, ...list])
      showToast("Заказ опубликован — ушёл в ленту перевозчиков")
    }

    function acceptOffer(orderId: string, offerId: string) {
      updateMy(orderId, (o) => {
        const chosen = o.offers.find((of) => of.id === offerId)
        if (!chosen) return o
        return {
          ...o,
          status: "deal",
          offers: o.offers.map((of) => ({
            ...of,
            status: of.id === offerId ? "accepted" : "rejected",
          })),
          deal: {
            status: "accepted",
            carrier: chosen.carrier,
            agreedPriceUsd: chosen.priceUsd,
            chat: [],
          },
        }
      })
      showToast("Сделка создана. Перевозчик уведомлён")
    }

    function makeOffer(orderId: string, kind: OfferKind, priceUsd: number) {
      updateFeed(orderId, (o) => ({ ...o, myOfferStatus: "pending" }))
      showToast(
        kind === "accept"
          ? "Оффер отправлен: готовы везти за цену шипера"
          : `Встречная цена отправлена: $${priceUsd}`
      )
    }

    function advanceDeal(orderId: string) {
      updateMy(orderId, (o) => {
        if (!o.deal) return o
        const i = DEAL_FLOW.indexOf(o.deal.status)
        // carrier advances up to "delivered"; shipper confirms "completed"
        const next = DEAL_FLOW[Math.min(i + 1, DEAL_FLOW.indexOf("delivered"))]
        return { ...o, deal: { ...o.deal, status: next } }
      })
      showToast("Статус обновлён")
    }

    function confirmDelivery(orderId: string) {
      updateMy(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, status: "completed" } } : o
      )
      showToast("Получение подтверждено. Сделка завершена")
    }

    function cancelDeal(orderId: string) {
      updateMy(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, status: "cancelled" } } : o
      )
      showToast("Сделка отменена. Рейтинг снижен")
    }

    function sendMessage(orderId: string, text: string) {
      const msg: ChatMessage = {
        id: `m-${Date.now()}`,
        fromMe: true,
        text,
        time: nowTime(),
      }
      updateMy(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, chat: [...o.deal.chat, msg] } } : o
      )
    }

    return {
      authed,
      enterApp,
      resetOnboarding,
      role,
      setRole,
      tab,
      setTab,
      dealsNewOnly,
      setDealsNewOnly,
      openNotifications,
      notifications,
      newCount,
      isNew,
      markSeen,
      stack,
      push,
      pop,
      toast,
      showToast,
      myOrders,
      feedOrders,
      getOrder,
      publishOrder,
      acceptOffer,
      makeOffer,
      advanceDeal,
      confirmDelivery,
      cancelDeal,
      sendMessage,
    }
  }, [authed, role, tab, dealsNewOnly, seen, stack, toast, myOrders, feedOrders])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
