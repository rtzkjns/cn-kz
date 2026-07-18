"use client"

import { Boxes, ChevronRight, FileText, Globe, HelpCircle, Heart, Info, MessageCircle, ShieldCheck, Tag, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"

// Экран-«тизер» для гостя: не пустая заглушка, а приглашение войти с понятной пользой (§ NN/g browse-first).
function GuestGate({
  icon: Icon,
  title,
  subtitle,
  hint,
  cta,
}: {
  icon: typeof Heart
  title: string
  subtitle: string
  hint: string
  cta: string
}) {
  const { openAuth } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={title} />
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 pb-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-brand/12 text-brand">
          <Icon className="size-6" />
        </span>
        <p className="text-lg font-semibold">{subtitle}</p>
        <p className="max-w-[15rem] text-[15px] text-muted-foreground">{hint}</p>
        <Button size="xl" className="mt-1 w-full" onClick={openAuth}>
          {cta}
        </Button>
      </div>
    </div>
  )
}

export function GuestFavoritesScreen() {
  return (
    <GuestGate
      icon={Heart}
      title="Избранное"
      subtitle="Сохраняйте интересные грузы"
      hint="Отмечайте грузы, чтобы вернуться к ним позже. Войдите, чтобы сохранять избранное."
      cta="Войти, чтобы сохранять"
    />
  )
}

export function GuestChatsScreen() {
  return (
    <GuestGate
      icon={MessageCircle}
      title="Чат"
      subtitle="Сообщения по сделкам"
      hint="Чат открывается внутри сделки. Войдите, чтобы общаться с заказчиками и перевозчиками."
      cta="Войти, чтобы писать"
    />
  )
}

function ValueRow({ icon: Icon, title, hint }: { icon: typeof Boxes; title: string; hint: string }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[15px] font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
    </div>
  )
}

export function GuestProfileScreen() {
  const { openAuth, showToast, push } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Профиль" />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-24">
        {/* Первичное действие — вход. Не пустой профиль, а приглашение с пользой. */}
        <Card>
          <CardContent className="space-y-3 py-5 text-center">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-brand/12 text-brand">
              <User className="size-6" />
            </span>
            <div className="space-y-0.5">
              <p className="text-lg font-semibold">Войдите в CN-KZ</p>
              <p className="text-[15px] text-muted-foreground">
                Публикуйте грузы, откликайтесь и ведите сделки
              </p>
            </div>
            <Button size="xl" className="w-full" onClick={openAuth}>
              Войти или зарегистрироваться
            </Button>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="divide-y divide-border py-1">
            <ValueRow
              icon={Boxes}
              title="Смотрите открытые грузы"
              hint="Вся биржа по всей СНГ доступна без входа"
            />
            <ValueRow
              icon={Tag}
              title="Откликайтесь на грузы"
              hint="Примите цену заказчика или предложите свою"
            />
            <ValueRow
              icon={ShieldCheck}
              title="Безопасная сделка"
              hint="Оплата после подтверждения, контакты защищены"
            />
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="divide-y divide-border py-1">
            <SettingRow icon={Globe} label="Язык" value="Русский" onClick={() => showToast("Русский · Қазақша · 中文")} />
            <SettingRow icon={FileText} label="Условия и оферта" onClick={() => push({ type: "terms" })} />
            <SettingRow icon={HelpCircle} label="Помощь и поддержка" onClick={() => showToast("Открываем чат поддержки")} />
            <SettingRow icon={Info} label="О приложении" value="v1.0" onClick={() => showToast("CN-KZ · Грузоперевозки по всей СНГ")} />
          </CardContent>
        </Card>
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
