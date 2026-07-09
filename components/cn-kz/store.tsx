"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"

import {
  carriers,
  FEED_ORDERS,
  ME_CARRIER,
  ME_SHIPPER,
  MY_FLEET,
  MY_ORDERS,
} from "@/lib/cn-kz/mock-data"
import {
  type ChatMessage,
  type OfferKind,
  type Order,
  type Role,
  type User,
} from "@/lib/cn-kz/types"
import { plural } from "./shared"
import { EMPTY_FILTERS, type FilterState } from "@/lib/cn-kz/filters"

// A pushed detail screen sits on top of the active tab.
export type Screen =
  | { type: "orderDetail"; orderId: string }
  | { type: "cargoDetail"; orderId: string }
  | { type: "deal"; orderId: string }
  | { type: "chat"; orderId: string }
  | { type: "carrierProfile"; carrierId: string; orderId?: string; offerId?: string }
  | { type: "marketOrder"; orderId: string }
  | { type: "tripBuilder" }
  | { type: "createOrder"; prefillFrom?: string; editId?: string } // дубль/редактирование

export type Tab =
  | "feed"
  | "myorders"
  | "deals"
  | "favorites"
  | "profile"
  | "analytics"
  | "chats"
  | "settings"
  | "history"

// Монотонные счётчики id — исключают коллизии со seed- id (ord-0xxx/1xxx/2xxx) и
// дубликаты React key при быстрых действиях. Стартуют выше всех сидов.
let ORDER_SEQ = 9000
let MSG_SEQ = 0

// Общие поля заказа из черновика — используются и при публикации, и при редактировании.
function draftToFields(d: NewOrderDraft) {
  return {
    origin: d.origin,
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
    address: d.address,
    recipientName: d.recipientName,
    recipientPhone: d.recipientPhone,
    payment: d.payment,
  }
}

export interface Notification {
  id: string
  kind: "offer" | "message"
  title: string
  subtitle: string
  screen: Screen
}

export interface NewOrderDraft {
  origin: string
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
  enterApp: (r: Role, p?: { name: string; company?: string }) => void // онбординг → приложение
  me: User // текущий пользователь (демо-аккаунт или введённый при регистрации)
  resetOnboarding: () => void // demo reset: back to the onboarding flow
  showAuth: boolean // guest tapped a gated action → show the auth flow over the public feed
  openAuth: () => void
  closeAuth: () => void
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
  saveOrderEdit: (orderId: string, d: NewOrderDraft) => void // редактирование заказа
  republishOrder: (orderId: string) => void // архивный заказ → снова в ленту
  acceptOffer: (orderId: string, offerId: string) => void
  makeOffer: (orderId: string, kind: OfferKind, priceUsd: number, truckId?: string) => void
  skipOrder: (orderId: string) => void // «Пропустить» груз (без отклика)
  isSkipped: (orderId: string) => boolean
  confirmCounter: (orderId: string) => void // перевозчик принимает встречную цену заказчика
  declineMyOffer: (orderId: string) => void // перевозчик снимает свой отклик
  completeDeal: (orderId: string) => void
  submitRating: (orderId: string, stars: number) => void
  confirmDelivery: (orderId: string) => void
  cancelDeal: (orderId: string) => void
  reliability: number // живая надёжность текущего перевозчика (падает при отмене)
  cancelCount: number // сколько сделок отменил
  sendMessage: (orderId: string, text: string) => void
  togglePin: (orderId: string) => void // закрепить/открепить заказ
  toggleFavorite: (orderId: string) => void // добавить/убрать из «Избранного»
  isFavorite: (orderId: string) => boolean
  favorites: string[]
  tripDraft: string[] // грузы в собираемом рейсе
  isInTrip: (orderId: string) => boolean
  addToTrip: (orderId: string) => void
  removeFromTrip: (orderId: string) => void
  clearTrip: () => void
  submitTrip: () => void
  filters: FilterState
  setFilters: (f: FilterState) => void
  showFilters: boolean
  openFilters: () => void
  closeFilters: () => void
  rejectOffer: (orderId: string, offerId: string) => void // заказчик отклоняет отклик
  counterOffer: (orderId: string, offerId: string, priceUsd: number) => void // встречная цена
  getCarrier: (id: string) => User | undefined // профиль перевозчика
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
  const [showAuth, setShowAuth] = useState(false)
  const [role, setRoleRaw] = useState<Role>("shipper")
  const [tab, setTabRaw] = useState<Tab>("feed")
  const [dealsNewOnly, setDealsNewOnly] = useState(false)
  const [seen, setSeen] = useState<string[]>([]) // id заказов с просмотренными событиями
  const [stack, setStack] = useState<Screen[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [myOrders, setMyOrders] = useState<Order[]>(MY_ORDERS)
  const [feedOrders, setFeedOrders] = useState<Order[]>(FEED_ORDERS)
  const [favorites, setFavorites] = useState<string[]>([]) // «Избранное» перевозчика (id заказов)
  const [skipped, setSkipped] = useState<string[]>([]) // грузы, которые перевозчик «Пропустил»
  // Надёжность — ЖИВОЙ показатель: отмена принятого заказа реально бьёт по нему (не косметика).
  const [reliability, setReliability] = useState(98)
  const [cancelCount, setCancelCount] = useState(0)
  const [tripDraft, setTripDraft] = useState<string[]>([]) // грузы, собираемые в один рейс (сборный груз)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [profile, setProfile] = useState<{ name: string; company?: string } | null>(null) // из регистрации

  // Выделенные ссылки: ?role=carrier / ?role=shipper открывают сразу нужную роль.
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get("role")
    if (r === "carrier" || r === "shipper") {
      setRoleRaw(r)
      setAuthed(true)
      setShowAuth(false)
      // Автовыбор фильтра по типу авто из профиля (Figma) — перевозчик видит «свои» грузы.
      if (r === "carrier") setFilters({ ...EMPTY_FILTERS, bodyTypes: ["тент"] })
    }
  }, [])

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

    function enterApp(r: Role, p?: { name: string; company?: string }) {
      setRoleRaw(r)
      setTabRaw("feed")
      setStack([])
      setAuthed(true)
      setShowAuth(false)
      setProfile(p ?? null)
      setFilters(r === "carrier" ? { ...EMPTY_FILTERS, bodyTypes: ["тент"] } : EMPTY_FILTERS)
    }

    // Текущий пользователь: демо-аккаунт (сид) или введённый при регистрации.
    const seededMe = role === "shipper" ? ME_SHIPPER : ME_CARRIER
    const me: User = profile
      ? { ...seededMe, name: profile.name, company: profile.company ?? seededMe.company }
      : seededMe

    function resetOnboarding() {
      setAuthed(false)
      setShowAuth(false)
      setStack([])
    }

    const openAuth = () => setShowAuth(true)
    const closeAuth = () => setShowAuth(false)

    function setTab(t: Tab) {
      setTabRaw(t)
      setDealsNewOnly(false)
      setStack([])
    }

    // §10: тап по колокольчику → дашборд «Сделки» с фильтром «есть новые».
    function openNotifications() {
      setTabRaw(role === "carrier" ? "deals" : "myorders") // shipper: свои заказы с новыми событиями
      setDealsNewOnly(true)
      setStack([])
    }

    const seenSet = new Set(seen)
    // Заказчик: события по своим заказам; перевозчик: по выигранным грузам из ленты.
    const source = role === "carrier" ? feedOrders : myOrders
    function markSeen(orderId: string) {
      setSeen((s) => (s.includes(orderId) ? s : [...s, orderId]))
    }
    // Заказ/сделка «новые», если есть непрочитанное событие и они ещё не просмотрены.
    function isNew(orderId: string) {
      if (seenSet.has(orderId)) return false
      const o = source.find((x) => x.id === orderId)
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
      // Перевозчик: только что выигранная сделка тоже «новое» в списке сделок.
      const newWonDeal = role === "carrier" && !!o.deal && o.deal.status === "accepted"
      return newOffers || newMsg || newWonDeal
    }

    // Лента уведомлений: только непрочитанные (новые отклики заказчику + входящие сообщения в сделках).
    const notifications: Notification[] = []
    for (const o of source) {
      if (seenSet.has(o.id)) continue
      if (role === "shipper") {
        const pending = o.offers.filter((of) => of.status === "pending").length
        if (pending > 0 && (o.status === "bidding" || o.status === "published")) {
          notifications.push({
            id: `${o.id}-offers`,
            kind: "offer",
            title: `${pending} ${pending === 1 ? "новый" : "новых"} ${plural(pending, "отклик", "отклика", "откликов")}`,
            subtitle: `${o.origin} → ${o.destination}`,
            screen: { type: "orderDetail", orderId: o.id },
          })
        }
      }
      if (o.deal) {
        const route = `${o.origin} → ${o.destination}`
        const active = o.deal.status !== "completed" && o.deal.status !== "cancelled"
        // Новое входящее сообщение в активной сделке.
        if (active && o.deal.chat.some((m) => !m.fromMe)) {
          const other = role === "shipper" ? o.deal.carrier.name : o.shipper.name
          notifications.push({
            id: `${o.id}-msg`,
            kind: "message",
            title: "Новое сообщение",
            subtitle: `${other} · ${route}`,
            screen: { type: "deal", orderId: o.id },
          })
        }
        // Перевозчик: заказчик принял отклик → сделка создана (только свежая, без чата,
        // чтобы не дублировать уведомление о сообщении и совпадать со счётчиком «новых»).
        if (role === "carrier" && o.deal.status === "accepted" && o.deal.chat.length === 0) {
          notifications.push({
            id: `${o.id}-accepted`,
            kind: "offer",
            title: "Ваш отклик принят",
            subtitle: `Сделка создана · ${route}`,
            screen: { type: "deal", orderId: o.id },
          })
        }
        // Завершённые/отменённые сделки не шлют пуш: они уходят в «Историю», оценка
        // и статус видны на экране сделки — иначе счётчик колокольчика расходится со списком.
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
    // Обновляет заказ в том списке, где он есть (id заказчика ord-1xxx и ленты ord-2xxx не пересекаются).
    function updateOrder(id: string, fn: (o: Order) => Order) {
      setMyOrders((list) => list.map((o) => (o.id === id ? fn(o) : o)))
      setFeedOrders((list) => list.map((o) => (o.id === id ? fn(o) : o)))
    }

    function publishOrder(d: NewOrderDraft) {
      const order: Order = {
        id: `ord-${++ORDER_SEQ}`,
        ...draftToFields(d),
        status: "published",
        shipper: ME_SHIPPER,
        createdAgo: "только что",
        offers: [],
      }
      setMyOrders((list) => [order, ...list])
      showToast("Заказ опубликован — ушёл в ленту перевозчиков")
    }

    // Редактирование заказа: обновляет поля; изменение условий аннулирует активные отклики.
    function saveOrderEdit(orderId: string, d: NewOrderDraft) {
      updateMy(orderId, (o) => {
        const hadOffers = o.offers.some(
          (of) => of.status === "pending" || of.status === "countered"
        )
        return {
          ...o,
          ...draftToFields(d),
          offers: hadOffers ? [] : o.offers,
          status: "published",
        }
      })
      showToast("Заказ обновлён")
    }

    // Перепубликация архивного заказа: сбрасываем срок и старые отклики, возвращаем в ленту.
    function republishOrder(orderId: string) {
      updateMy(orderId, (o) => ({
        ...o,
        status: "published",
        createdAgo: "только что",
        offers: [],
      }))
      showToast("Заказ снова в ленте перевозчиков")
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
            escrow: "held",
          },
        }
      })
      showToast("Сделка создана. Оплата зарезервирована в эскроу")
    }

    // Перевозчик выигрывает заказ → на заказе появляется сделка (carrier = ME_CARRIER).
    function createCarrierDeal(orderId: string, price: number, tripId?: string) {
      updateFeed(orderId, (o) => ({
        ...o,
        status: "deal",
        myOfferStatus: "accepted",
        deal: {
          status: "accepted",
          carrier: ME_CARRIER,
          agreedPriceUsd: price,
          chat: [],
          tripId,
          escrow: "held",
        },
      }))
    }

    function makeOffer(orderId: string, kind: OfferKind, priceUsd: number, truckId?: string) {
      const order = feedOrders.find((o) => o.id === orderId)
      const offered = kind === "accept" ? order?.priceUsd ?? priceUsd : priceUsd
      const base = order?.priceUsd ?? offered
      const truck = MY_FLEET.find((t) => t.id === truckId) ?? MY_FLEET[0]
      updateFeed(orderId, (o) => ({
        ...o,
        myOfferStatus: "pending",
        myOfferPriceUsd: offered,
        myOfferTruck: truck,
        myCounterPriceUsd: undefined,
      }))
      showToast(
        kind === "accept"
          ? "Отклик отправлен: готовы везти за цену заказчика"
          : `Встречная цена отправлена: $${priceUsd}`
      )
      // Симуляция ответа заказчика (в проде — realtime-событие с бэкенда).
      setTimeout(() => {
        if (kind === "accept") {
          createCarrierDeal(orderId, offered)
          showToast("Заказчик принял отклик — сделка создана")
        } else {
          const back = Math.round((offered + base) / 2)
          setFeedOrders((list) =>
            list.map((o) =>
              o.id === orderId
                ? { ...o, myOfferStatus: "countered", myCounterPriceUsd: back }
                : o
            )
          )
          showToast("Заказчик предложил встречную цену")
        }
      }, 1600)
    }

    function confirmCounter(orderId: string) {
      const o = feedOrders.find((x) => x.id === orderId)
      const price = o?.myCounterPriceUsd ?? o?.myOfferPriceUsd ?? o?.priceUsd ?? 0
      createCarrierDeal(orderId, price)
      showToast("Сделка создана по встречной цене")
    }

    function declineMyOffer(orderId: string) {
      updateFeed(orderId, (o) => ({ ...o, myOfferStatus: "rejected" }))
      showToast("Отклик снят")
    }

    // «Пропустить» (inDrive): без отклика, убираем груз из ленты перевозчика.
    function skipOrder(orderId: string) {
      setSkipped((s) => (s.includes(orderId) ? s : [...s, orderId]))
      showToast("Груз пропущен")
    }
    const isSkipped = (orderId: string) => skipped.includes(orderId)

    // Перевозчик завершает заказ (кнопка «Завершил»). Трекинг между этим не делаем.
    function completeDeal(orderId: string) {
      updateOrder(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, status: "completed", escrow: "released" } } : o
      )
      showToast("Заказ завершён · оплата переведена перевозчику")
    }

    function confirmDelivery(orderId: string) {
      updateOrder(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, status: "completed", escrow: "released" } } : o
      )
      showToast("Получение подтверждено · оплата переведена перевозчику")
    }

    // Оценка сохраняется на заказе (видно в истории). §8: взаимная СЛЕПАЯ оценка —
    // встречная оценка второй стороны раскрывается только после того, как она тоже оценит (мок).
    function submitRating(orderId: string, stars: number) {
      updateOrder(orderId, (o) => ({ ...o, ratedStars: stars }))
      showToast(`Спасибо! Вы поставили ${stars}★`)
      setTimeout(() => {
        updateOrder(orderId, (o) =>
          o.counterpartRating == null ? { ...o, counterpartRating: 5 } : o
        )
      }, 1800)
    }

    function cancelDeal(orderId: string) {
      // Реальный штраф: надёжность −10 (пол 0), счётчик отмен +1. Не «безнаказанно».
      setReliability((r) => Math.max(0, r - 10))
      setCancelCount((c) => c + 1)
      updateOrder(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, status: "cancelled" } } : o
      )
      showToast("Сделка отменена. Рейтинг снижен")
    }

    function sendMessage(orderId: string, text: string) {
      const msg: ChatMessage = {
        id: `m-${++MSG_SEQ}`,
        fromMe: true,
        text,
        time: nowTime(),
      }
      updateOrder(orderId, (o) =>
        o.deal ? { ...o, deal: { ...o.deal, chat: [...o.deal.chat, msg] } } : o
      )
    }

    function togglePin(orderId: string) {
      updateOrder(orderId, (o) => ({ ...o, pinned: !o.pinned }))
    }

    function toggleFavorite(orderId: string) {
      setFavorites((f) =>
        f.includes(orderId) ? f.filter((x) => x !== orderId) : [...f, orderId]
      )
    }
    const isFavorite = (orderId: string) => favorites.includes(orderId)

    // ——— Сборный рейс (консолидация): грузы в один A→B рейс, статус на каждый груз 2-статусный.
    const isInTrip = (orderId: string) => tripDraft.includes(orderId)
    function addToTrip(orderId: string) {
      setTripDraft((d) => (d.includes(orderId) ? d.filter((x) => x !== orderId) : [...d, orderId]))
    }
    function removeFromTrip(orderId: string) {
      setTripDraft((d) => d.filter((x) => x !== orderId))
    }
    function clearTrip() {
      setTripDraft([])
    }
    function submitTrip() {
      if (tripDraft.length === 0) return
      const tripId = "trip-" + tripDraft.join("-")
      const ids = [...tripDraft]
      ids.forEach((oid) => {
        const o = feedOrders.find((x) => x.id === oid)
        if (o) createCarrierDeal(oid, o.priceUsd, tripId)
      })
      setTripDraft([])
      setStack([])
      setTabRaw("deals")
      showToast(`Рейс собран: ${ids.length} груз(а). Заказчики уведомлены`)
    }

    function rejectOffer(orderId: string, offerId: string) {
      updateOrder(orderId, (o) => {
        const offers = o.offers.map((of) =>
          of.id === offerId ? { ...of, status: "rejected" as const } : of
        )
        // Не осталось активных откликов → заказ снова просто «Опубликован» (не «Торги»).
        const stillActive = offers.some(
          (of) => of.status === "pending" || of.status === "countered"
        )
        const status = o.status === "bidding" && !stillActive ? "published" : o.status
        return { ...o, offers, status }
      })
      showToast("Отклик отклонён")
    }

    // Заказчик предлагает перевозчику свою (встречную) цену по его отклику (inDrive-торг).
    // shipperCounterUsd хранит встречную ОТДЕЛЬНО — цена перевозчика (priceUsd) не затирается.
    function counterOffer(orderId: string, offerId: string, priceUsd: number) {
      updateMy(orderId, (o) => ({
        ...o,
        offers: o.offers.map((of) =>
          of.id === offerId
            ? { ...of, status: "countered", shipperCounterUsd: priceUsd }
            : of
        ),
      }))
      showToast(`Встречная цена отправлена: $${priceUsd}`)
      // Симуляция ответа перевозчика (в проде — realtime-событие). Иначе торг — тупик.
      setTimeout(() => {
        setMyOrders((list) =>
          list.map((o) => {
            if (o.id !== orderId) return o
            const chosen = o.offers.find((of) => of.id === offerId)
            if (!chosen || chosen.status !== "countered") return o // уже разрешено
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
                agreedPriceUsd: priceUsd,
                chat: [],
                escrow: "held",
              },
            }
          })
        )
        showToast("Перевозчик принял встречную цену — сделка создана")
      }, 1600)
    }

    const getCarrier = (id: string) => carriers.find((c) => c.id === id)

    return {
      authed,
      me,
      enterApp,
      resetOnboarding,
      showAuth,
      openAuth,
      closeAuth,
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
      saveOrderEdit,
      republishOrder,
      acceptOffer,
      makeOffer,
      skipOrder,
      isSkipped,
      confirmCounter,
      declineMyOffer,
      completeDeal,
      submitRating,
      confirmDelivery,
      cancelDeal,
      reliability,
      cancelCount,
      sendMessage,
      togglePin,
      counterOffer,
      toggleFavorite,
      isFavorite,
      favorites,
      tripDraft,
      isInTrip,
      addToTrip,
      removeFromTrip,
      clearTrip,
      submitTrip,
      filters,
      setFilters,
      showFilters,
      openFilters: () => setShowFilters(true),
      closeFilters: () => setShowFilters(false),
      rejectOffer,
      getCarrier,
    }
  }, [authed, showAuth, role, tab, dealsNewOnly, seen, stack, toast, myOrders, feedOrders, favorites, skipped, reliability, cancelCount, tripDraft, filters, showFilters, profile])

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>
}
