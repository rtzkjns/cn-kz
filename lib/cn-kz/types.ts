// Domain types for the CN-KZ freight marketplace wireframe.
// Mock-data only — no backend. See docs/superpowers/specs/2026-06-04-cn-kz-wireframe-design.md

export type Role = "shipper" | "carrier"

// Назначение — любой город СНГ (не ограничено КЗ). Значение структурное (из списка),
// чтобы матчинг ленты и пуши по маршруту (§4, §10) работали. Полный список — ALL_CITIES.
export type City = string

// Быстрые «популярные» чипы в выборе города.
export const POPULAR_CITIES: string[] = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
]

// Сид-список городов КЗ + СНГ для поиска/автодополнения.
// ВАЖНО: это статический список (~150 городов). Полная база всех городов СНГ
// требует реального гео-источника (API/датасет) на бэкенде — для вайрфрейма это мок.
export const ALL_CITIES: string[] = [
  // Казахстан
  "Алматы", "Астана", "Шымкент", "Караганда", "Актобе", "Тараз", "Павлодар",
  "Усть-Каменогорск", "Семей", "Атырау", "Костанай", "Кызылорда", "Уральск",
  "Петропавловск", "Актау", "Темиртау", "Туркестан", "Кокшетау", "Талдыкорган",
  "Экибастуз", "Рудный", "Жезказган", "Балхаш", "Кентау", "Сатпаев",
  "Риддер", "Жанаозен", "Каскелен", "Капшагай", "Степногорск", "Щучинск",
  "Хоргос", "Жаркент", "Сарыагаш", "Аягоз", "Зайсан", "Текели",
  // Россия
  "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
  "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону", "Уфа",
  "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар", "Саратов",
  "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск", "Иркутск",
  "Хабаровск", "Владивосток", "Махачкала", "Томск", "Оренбург", "Кемерово",
  "Новокузнецк", "Рязань", "Астрахань", "Пенза", "Липецк", "Тула", "Киров",
  "Чебоксары", "Калининград", "Курск", "Сочи", "Ставрополь", "Магнитогорск",
  "Орск", "Сургут", "Курган", "Якутск", "Улан-Удэ", "Чита",
  // Узбекистан
  "Ташкент", "Самарканд", "Бухара", "Наманган", "Андижан", "Фергана",
  "Нукус", "Карши", "Коканд", "Маргилан", "Джизак", "Термез", "Ургенч", "Навои",
  // Кыргызстан
  "Бишкек", "Ош", "Джалал-Абад", "Каракол", "Токмок", "Нарын", "Талас",
  // Таджикистан
  "Душанбе", "Худжанд", "Бохтар", "Куляб", "Истаравшан",
  // Туркменистан
  "Ашхабад", "Туркменабат", "Дашогуз", "Мары",
  // Азербайджан
  "Баку", "Гянджа", "Сумгаит", "Мингечаур",
  // Армения
  "Ереван", "Гюмри", "Ванадзор",
  // Беларусь
  "Минск", "Гомель", "Могилёв", "Витебск", "Гродно", "Брест", "Барановичи",
  // Грузия
  "Тбилиси", "Батуми", "Кутаиси",
  // Молдова
  "Кишинёв", "Бельцы", "Тирасполь",
]

export const ORIGIN = "Хоргос"

export type TruckType =
  | "рефрижератор"
  | "тент"
  | "контейнеровоз"
  | "автовоз"
  | "бортовой"
  | "цистерна"

export const TRUCK_TYPES: TruckType[] = [
  "рефрижератор",
  "тент",
  "контейнеровоз",
  "автовоз",
  "бортовой",
  "цистерна",
]

// Lifecycle of an order in the marketplace.
export type OrderStatus =
  | "published" // Опубликован — в ленте, офферов нет
  | "bidding" // Торгуется — есть офферы
  | "deal" // Сделка создана
  | "archived" // Архив (истёк срок без откликов)

// Lifecycle of a deal (after an offer is accepted).
export type DealStatus =
  | "accepted" // Принято
  | "picked_up" // Забрал заказ
  | "in_transit" // В пути
  | "at_border" // На границе
  | "delivered" // Доставлено
  | "completed" // Завершено
  | "cancelled" // Отменено

export const DEAL_FLOW: DealStatus[] = [
  "accepted",
  "picked_up",
  "in_transit",
  "at_border",
  "delivered",
  "completed",
]

export const DEAL_STATUS_LABEL: Record<DealStatus, string> = {
  accepted: "Принято",
  picked_up: "Забрал заказ",
  in_transit: "В пути",
  at_border: "На границе",
  delivered: "Доставлено",
  completed: "Завершено",
  cancelled: "Отменено",
}

export type OfferKind = "accept" | "counter" // «Принять цену» | «Своя цена»

export type OfferStatus = "pending" | "countered" | "accepted" | "rejected" | "expired"

export interface User {
  id: string
  name: string
  phone: string
  rating: number // 0..5
  dealsCount: number
  role: Role
  company?: string
}

export interface Truck {
  id: string
  type: TruckType
  maxWeightKg: number
  maxVolumeM3: number
  plate: string
}

export interface Offer {
  id: string
  carrier: User
  truck: TruckType
  kind: OfferKind
  priceUsd: number // counter price, or the order's price for "accept"
  status: OfferStatus
  createdAgo: string // human-readable, e.g. "12 мин назад"
}

export interface ChatMessage {
  id: string
  fromMe: boolean
  text: string
  time: string
}

export interface Order {
  id: string
  origin: string
  pickupPoint?: string // точка погрузки в Хоргосе (склад/терминал/адрес)
  pickupPhone?: string // контакт на погрузке
  destination: City
  cargo: string
  weightKg: number
  volumeM3: number
  truckType: TruckType
  priceUsd: number
  readyDate: string // ISO-ish display date
  notes?: string // примечание: ограничения/требования
  status: OrderStatus
  shipper: User
  // delivery details
  address: string
  recipientName: string
  recipientPhone: string
  payment: "cash" | "transfer"
  createdAgo: string
  offers: Offer[]
  // present once status === "deal"
  deal?: {
    status: DealStatus
    carrier: User
    agreedPriceUsd: number
    chat: ChatMessage[]
  }
  // carrier's own offer state when viewing the feed
  myOfferStatus?: OfferStatus
  myOfferPriceUsd?: number // цена, которую предложил перевозчик
  myCounterPriceUsd?: number // встречная цена шипера в ответ на оффер перевозчика
}
