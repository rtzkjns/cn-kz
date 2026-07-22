// i18n for the wireframe (FINAL-SPEC §8). Design so the language toggle changes the UI EVERYWHERE:
// screen strings are keyed by their RUSSIAN text, so any un-translated string falls back to Russian
// (never a broken key). RU is the base + fallback; KZ + ZH come from the merged part dictionaries.
// ⚠️ KZ/ZH copy is standard freight/UI terminology but NEEDS NATIVE REVIEW before real launch.

import { part as pCarrier } from "./i18n-parts/carrier"
import { part as pShipper } from "./i18n-parts/shipper"
import { part as pShared } from "./i18n-parts/shared"
import { part as pMarketGuest } from "./i18n-parts/market-guest"
import { part as pProfiles } from "./i18n-parts/profiles"
import { part as pAccountAnalytics } from "./i18n-parts/account-analytics"
import { part as pOnboardingTerms } from "./i18n-parts/onboarding-terms"
import { part as pMisc } from "./i18n-parts/misc"

export type Lang = "ru" | "kz" | "zh"

export const LANGS: { id: Lang; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "kz", label: "Қаз" },
  { id: "zh", label: "中文" },
]

// Base: legacy namespaced keys (nav.* + act.*) kept for the chrome that already uses them.
const BASE: Record<string, Record<Lang, string>> = {
  "nav.feed": { ru: "Главная", kz: "Басты бет", zh: "首页" },
  "nav.myorders": { ru: "Мои заказы", kz: "Тапсырыстарым", zh: "我的货单" },
  "nav.market": { ru: "Рынок", kz: "Нарық", zh: "市场" },
  "nav.deals": { ru: "Мои рейсы", kz: "Рейстерім", zh: "我的行程" },
  "nav.chats": { ru: "Чаты", kz: "Чаттар", zh: "聊天" },
  "nav.profile": { ru: "Профиль", kz: "Профиль", zh: "我的" },
  "nav.favorites": { ru: "Избранное", kz: "Таңдаулылар", zh: "收藏" },
  "act.respond": { ru: "Откликнуться", kz: "Үн қату", zh: "应答" },
  "act.accept": { ru: "Принять", kz: "Қабылдау", zh: "接受" },
  "act.acceptPrice": { ru: "Принять цену", kz: "Бағаны қабылдау", zh: "接受价格" },
  "act.namePrice": { ru: "Назвать цену", kz: "Баға ұсыну", zh: "报价" },
  "act.skip": { ru: "Пропустить", kz: "Өткізу", zh: "跳过" },
  "act.pickedUp": { ru: "Забрал груз", kz: "Жүкті алдым", zh: "已取货" },
  "act.delivered": { ru: "Доставил груз", kz: "Жеткіздім", zh: "已送达" },
  "act.crossedBorder": { ru: "Прошёл границу", kz: "Шекарадан өттім", zh: "已过境" },
  "act.confirmReceipt": { ru: "Подтвердить получение", kz: "Алғанын растау", zh: "确认收货" },
  "act.call": { ru: "Позвонить", kz: "Қоңырау шалу", zh: "拨打电话" },
}

// Screen parts: keyed by the RUSSIAN string, value = { kz, zh }. Merged with ru = the key.
const PARTS: Record<string, { kz: string; zh: string }> = {
  ...pCarrier,
  ...pShipper,
  ...pShared,
  ...pMarketGuest,
  ...pProfiles,
  ...pAccountAnalytics,
  ...pOnboardingTerms,
  ...pMisc,
}

const DICT: Record<string, Record<Lang, string>> = { ...BASE }
for (const [ru, v] of Object.entries(PARTS)) {
  // BASE wins on the rare collision; otherwise the Russian key becomes its own ru value.
  if (!DICT[ru]) DICT[ru] = { ru, kz: v.kz, zh: v.zh }
}

// translate(lang, key): key is either a legacy "nav.*"/"act.*" id or a Russian string.
// Missing key → return the key itself (which, for screen strings, IS the Russian text → graceful).
export function translate(lang: Lang, key: string): string {
  const row = DICT[key]
  if (!row) return key
  return row[lang] || row.ru
}

// Module-level "active language" — kept in sync by the store's provider so pure helpers that
// aren't React components (e.g. plural()/deals() in shared.tsx) can translate the current language.
let _active: Lang = "ru"
export function setActiveLang(l: Lang) {
  _active = l
}
export function activeLang(): Lang {
  return _active
}
