// Bounded i18n for the wireframe (FINAL-SPEC §8). RU is the base; KZ covers the driver core path
// (nav + the action words a driver taps most), ZH gives the shipper a taste. Missing keys fall back
// to RU. Full app translation lives in the real Expo app (react-i18next ru/kz/zh).
// ⚠️ KZ/ZH copy is standard freight/UI terminology but NEEDS NATIVE REVIEW before real launch.

export type Lang = "ru" | "kz" | "zh"

export const LANGS: { id: Lang; label: string }[] = [
  { id: "ru", label: "Рус" },
  { id: "kz", label: "Қаз" },
  { id: "zh", label: "中文" },
]

// key -> { ru, kz, zh }. ru is authoritative + fallback.
const DICT: Record<string, Record<Lang, string>> = {
  // navigation (ever-present chrome — the clearest proof the toggle works)
  "nav.feed": { ru: "Главная", kz: "Басты бет", zh: "首页" },
  "nav.myorders": { ru: "Мои заказы", kz: "Тапсырыстарым", zh: "我的货单" },
  "nav.market": { ru: "Рынок", kz: "Нарық", zh: "市场" },
  "nav.deals": { ru: "Мои рейсы", kz: "Рейстерім", zh: "我的行程" },
  "nav.chats": { ru: "Чаты", kz: "Чаттар", zh: "聊天" },
  "nav.profile": { ru: "Профиль", kz: "Профиль", zh: "我的" },
  "nav.favorites": { ru: "Избранное", kz: "Таңдаулылар", zh: "收藏" },
  // core driver action words (what a low-literacy driver taps)
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

export function translate(lang: Lang, key: string): string {
  const row = DICT[key]
  if (!row) return key
  return row[lang] || row.ru
}
