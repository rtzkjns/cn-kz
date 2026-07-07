// Faceted-filter taxonomy for the load feed.
// Grounded in ATI.su's real vehicle dictionaries (56 body types → 2-tier) + CIS cargo classes.
// Popular facets show inline (non-scrolling chips); the long tail lives in the «Все фильтры» drawer.

export type FilterState = {
  bodyTypes: string[] // тип кузова
  loading: string[] // тип загрузки
  tonnage: string | null // грузоподъёмность (tier)
  volume: string | null // объём (tier)
  temp: string[] // температурный режим (только для реф/изотерм)
  adr: string | null // опасный груз
  cargo: string | null // категория груза
  destination: string | null // город назначения
}

export const EMPTY_FILTERS: FilterState = {
  bodyTypes: [],
  loading: [],
  tonnage: null,
  volume: null,
  temp: [],
  adr: null,
  cargo: null,
  destination: null,
}

// Популярные города назначения по СНГ (для фасета «Куда»).
export const POPULAR_DEST_CITIES = [
  "Алматы",
  "Астана",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Тараз",
]

// ~6 самых частых — показываем строкой без горизонтального скролла.
export const POPULAR_BODY_TYPES = [
  "тент",
  "рефрижератор",
  "изотерм",
  "контейнеровоз",
  "бортовой",
  "автовоз",
]

// Полный список (в драйвере «Все фильтры»), сгруппирован как на АТИ.
export const ALL_BODY_TYPES: { group: string; items: string[] }[] = [
  { group: "Закрытые", items: ["тент", "фургон", "изотерм", "цельнометаллический", "контейнеровоз"] },
  { group: "Открытые", items: ["бортовой", "площадка", "низкорама", "шаланда", "манипулятор"] },
  { group: "Рефрижераторы", items: ["рефрижератор", "реф. мультирежим", "реф. с перегородкой", "реф-тушевоз"] },
  { group: "Спец / негабарит", items: ["трал", "автовоз", "негабарит", "балковоз", "телескопический"] },
  { group: "Наливные / сыпучие", items: ["цистерна", "бензовоз", "газовоз", "цементовоз", "зерновоз", "муковоз"] },
  { group: "Отраслевые", items: ["лесовоз", "скотовоз", "трубовоз", "стекловоз", "эвакуатор", "автовышка"] },
  { group: "Крупнотоннажные", items: ["мега-фура", "сцепка", "jumbo", "допельшток"] },
]

// Тип загрузки (ATI loadingTypes) — популярные.
export const LOADING_TYPES = [
  "верхняя",
  "боковая",
  "задняя",
  "полная растентовка",
  "гидроборт",
  "аппарели",
  "налив",
]

// Грузоподъёмность — тир-чипы (лучше слайдера для нашей аудитории).
export const TONNAGE_TIERS = ["до 1,5 т", "1,5–3 т", "3–5 т", "5–10 т", "10–20 т", "20+ т"]

// Объём кузова, м³ — реальные тиры фур.
export const VOLUME_TIERS = ["до 20", "36", "55", "68", "82", "86", "90", "96", "110+"]

// Температурный режим (только когда выбран реф/изотерм).
export const TEMP_MODES = ["Заморозка (−20…−10)", "Охлаждение (0…+6)", "Тепло (+8…+12)", "Мультирежим"]

// Опасный груз (ADR / ДОПОГ).
export const ADR_OPTIONS = [
  "Без ADR",
  "С любым ADR",
  "1 Взрывчатые",
  "2 Газы",
  "3 Легковоспламеняющиеся",
  "4 Твёрдые горючие",
  "5 Окисляющие",
  "6 Токсичные",
  "7 Радиоактивные",
  "8 Коррозионные",
  "9 Прочие",
]

// Категория груза (иконочная сетка — самое дружелюбное для низкой цифр. грамотности).
export const CARGO_CATEGORIES = [
  "Продукты",
  "Напитки",
  "Стройматериалы",
  "Металл",
  "Лес",
  "Техника",
  "Автомобили",
  "Мебель",
  "Электроника",
  "ТНП",
  "Химия",
  "Сыпучие",
  "ГСМ",
  "Животные",
  "Негабарит",
  "Опасный",
  "Переезд",
  "Другое",
]

// tier → [minKg, maxKg]
export function tonnageRange(tier: string | null): [number, number] {
  switch (tier) {
    case "до 1,5 т":
      return [0, 1500]
    case "1,5–3 т":
      return [1500, 3000]
    case "3–5 т":
      return [3000, 5000]
    case "5–10 т":
      return [5000, 10000]
    case "10–20 т":
      return [10000, 20000]
    case "20+ т":
      return [20000, Infinity]
    default:
      return [0, Infinity]
  }
}

// Функциональная фильтрация ленты (кузов + грузоподъёмность + категория; остальное — витрина).
export function matchesFilters(
  o: { truckType: string; weightKg: number; cargo: string; destination?: string },
  f: FilterState
): boolean {
  if (f.bodyTypes.length && !f.bodyTypes.includes(o.truckType)) return false
  const [minW, maxW] = tonnageRange(f.tonnage)
  if (o.weightKg < minW || o.weightKg > maxW) return false
  if (f.cargo && f.cargo !== "Другое" && !o.cargo.toLowerCase().includes(f.cargo.toLowerCase()))
    return false
  if (f.destination && o.destination !== f.destination) return false
  return true
}

export function countActive(f: FilterState): number {
  return (
    f.bodyTypes.length +
    f.loading.length +
    f.temp.length +
    (f.tonnage ? 1 : 0) +
    (f.volume ? 1 : 0) +
    (f.adr ? 1 : 0) +
    (f.cargo ? 1 : 0) +
    (f.destination ? 1 : 0)
  )
}
