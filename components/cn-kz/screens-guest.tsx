"use client"

import { Bell, Boxes, ChevronRight, FileText, Globe, HelpCircle, Heart, Info, MessageCircle, Phone, ShieldCheck, Tag, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"

// Экран-«тизер» для гостя: не пустая заглушка, а приглашение войти с понятной пользой (§ NN/g browse-first).
// Anti-empty: медальон-обещание + карточка выгод заполняют центр вместо пустоты; ОДНО lime-действие внизу.
function GuestGate({
  icon: Icon,
  title,
  subtitle,
  hint,
  cta,
  points,
}: {
  icon: typeof Heart
  title: string
  subtitle: string
  hint: string
  cta: string
  points: { icon: typeof Boxes; title: string; hint: string }[]
}) {
  const { openAuth } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={title} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Иллюстрированный медальон + обещание пользы */}
        <div className="surface-glass flex flex-col items-center gap-3 rounded-2xl px-6 py-8 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand/12 text-brand">
            <Icon className="size-7" />
          </span>
          <div className="space-y-1">
            <p className="t-h2">{subtitle}</p>
            <p className="mx-auto max-w-[17rem] text-[15px] text-muted-foreground">{hint}</p>
          </div>
        </div>

        {/* Что даёт вход — плотность вместо пустого канваса (anti-empty) */}
        <div className="surface-glass divide-y divide-border rounded-2xl px-4">
          {points.map((p) => (
            <ValueRow key={p.title} icon={p.icon} title={p.title} hint={p.hint} />
          ))}
        </div>
      </div>

      {/* Основное действие — ОДНО, в thumb-zone внизу (FINAL-SPEC §2.2) */}
      <div className="px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Button size="xl" className="w-full" onClick={openAuth}>
          {cta}
        </Button>
      </div>
    </div>
  )
}

export function GuestFavoritesScreen() {
  const { t } = useCnKz()
  return (
    <GuestGate
      icon={Heart}
      title={t("Избранное")}
      subtitle={t("Сохраняйте интересные грузы")}
      hint={t("Отмечайте грузы, чтобы вернуться к ним позже. Войдите, чтобы сохранять избранное.")}
      cta={t("Войти, чтобы сохранять")}
      points={[
        { icon: Heart, title: t("Сохраняйте лучшие грузы"), hint: t("Отмечайте маршруты и цены, чтобы сравнить и вернуться") },
        { icon: Bell, title: t("Не упустите цену"), hint: t("Следите за отложенными грузами и торгуйтесь вовремя") },
        { icon: Boxes, title: t("Вся биржа СНГ"), hint: t("Открытые грузы по всей СНГ доступны без входа") },
      ]}
    />
  )
}

export function GuestChatsScreen() {
  const { t } = useCnKz()
  return (
    <GuestGate
      icon={MessageCircle}
      title={t("Чат")}
      subtitle={t("Сообщения по сделкам")}
      hint={t("Чат открывается внутри сделки. Войдите, чтобы общаться с заказчиками и перевозчиками.")}
      cta={t("Войти, чтобы писать")}
      points={[
        { icon: MessageCircle, title: t("Чат внутри сделки"), hint: t("Обсуждайте детали прямо в приложении") },
        { icon: ShieldCheck, title: t("Контакты — в сделке"), hint: t("Номера открываются, когда есть отклик или сделка") },
        { icon: Phone, title: t("Прямая связь"), hint: t("Звоните заказчику или перевозчику по сделке") },
      ]}
    />
  )
}

function ValueRow({ icon: Icon, title, hint }: { icon: typeof Boxes; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

export function GuestProfileScreen() {
  const { openAuth, showToast, push, t } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Профиль")} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {/* Приглашение войти — без кнопки в карточке: основное действие снизу (одно на экран) */}
        <div className="surface-glass flex flex-col items-center gap-3 rounded-2xl px-6 py-7 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-brand/12 text-brand">
            <User className="size-7" />
          </span>
          <div className="space-y-1">
            <p className="t-h2">{t("Войдите в CN-KZ")}</p>
            <p className="mx-auto max-w-[17rem] text-[15px] text-muted-foreground">
              {t("Публикуйте грузы, откликайтесь и ведите сделки")}
            </p>
          </div>
        </div>

        <div className="surface-glass divide-y divide-border rounded-2xl px-4">
          <ValueRow
            icon={Boxes}
            title={t("Смотрите открытые грузы")}
            hint={t("Вся биржа по всей СНГ доступна без входа")}
          />
          <ValueRow
            icon={Tag}
            title={t("Откликайтесь на грузы")}
            hint={t("Примите цену заказчика или предложите свою")}
          />
          <ValueRow
            icon={ShieldCheck}
            title={t("Безопасная сделка")}
            hint={t("Стороны проверены по БИН, контакты открываются в сделке")}
          />
        </div>

        <div className="surface-glass divide-y divide-border rounded-2xl px-4">
          <SettingRow icon={Globe} label={t("Язык")} value="Русский" onClick={() => showToast("Русский · Қазақша · 中文")} />
          <SettingRow icon={FileText} label={t("Условия и оферта")} onClick={() => push({ type: "terms" })} />
          <SettingRow icon={HelpCircle} label={t("Помощь и поддержка")} onClick={() => showToast(t("Открываем чат поддержки"))} />
          <SettingRow icon={Info} label={t("О приложении")} value="v1.0" onClick={() => showToast(t("CN-KZ · Грузоперевозки по всей СНГ"))} />
        </div>
      </div>

      {/* ОДНО основное действие — вход, в thumb-zone внизу */}
      <div className="px-4 pt-2 pb-[max(12px,env(safe-area-inset-bottom))]">
        <Button size="xl" className="w-full" onClick={openAuth}>
          {t("Войти или зарегистрироваться")}
        </Button>
      </div>
    </div>
  )
}

function SettingRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Globe
  label: string
  value?: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex min-h-11 w-full items-center gap-3 py-2.5 text-left text-[15px] transition-colors hover:text-foreground">
      <Icon className="size-5 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      {value && <span className="text-sm text-muted-foreground">{value}</span>}
      <ChevronRight className="size-5 text-muted-foreground" />
    </button>
  )
}
