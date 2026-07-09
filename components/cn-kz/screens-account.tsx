"use client"

import { useState } from "react"
import {
  Bell,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Shield,
  Smartphone,
  Trash2,
  User as UserIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import type { Order } from "@/lib/cn-kz/types"
import { ScreenHeader } from "./phone-frame"
import { DealStatusBadge, Route, money } from "./shared"
import { Chip, ChipRow, Section } from "./ui-bits"
import { useCnKz } from "./store"

// ---------- Settings ----------

function Toggle({ on, label }: { on: boolean; label: string }) {
  const [v, setV] = useState(on)
  return (
    <button
      onClick={() => setV((x) => !x)}
      role="switch"
      aria-checked={v}
      aria-label={label}
      className={"relative h-5 w-9 shrink-0 rounded-full transition-colors " + (v ? "bg-brand" : "bg-muted")}
    >
      <span
        className={"absolute top-0.5 size-4 rounded-full bg-white transition-all " + (v ? "left-[18px]" : "left-0.5")}
      />
    </button>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
}: {
  icon: typeof UserIcon
  label: string
  value?: React.ReactNode
  onClick?: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-3 px-1 py-2.5 text-left text-sm transition-colors " +
        (danger ? "text-destructive" : "hover:text-foreground")
      }
    >
      <Icon className={"size-4 " + (danger ? "" : "text-muted-foreground")} />
      <span className="flex-1">{label}</span>
      {value}
      {!value && !danger && <ChevronRight className="size-4 text-muted-foreground" />}
    </button>
  )
}

export function SettingsScreen() {
  const { setTab, resetOnboarding, showToast, push } = useCnKz()
  const back = () => setTab("profile")
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Настройки" onBack={back} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Section title="Аккаунт">
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <Row icon={UserIcon} label="Профиль" onClick={() => setTab("profile")} />
              <Row icon={Bell} label="Номер телефона" value={<span className="text-xs text-muted-foreground">+7 ··· 34</span>} onClick={() => showToast("Изменение номера — по SMS")} />
              <Row icon={Lock} label="Вход и безопасность" onClick={() => push({ type: "security" })} />
            </CardContent>
          </Card>
        </Section>

        <Section title="Уведомления">
          <Card size="sm">
            <CardContent className="space-y-1 divide-y divide-border">
              <div className="flex items-center gap-3 py-2.5 text-sm">
                <Bell className="size-4 text-muted-foreground" />
                <span className="flex-1">Новые отклики и грузы</span>
                <Toggle on label="Новые отклики и грузы" />
              </div>
              <div className="flex items-center gap-3 py-2.5 text-sm">
                <Bell className="size-4 text-muted-foreground" />
                <span className="flex-1">Сообщения в чате</span>
                <Toggle on label="Сообщения в чате" />
              </div>
              <div className="flex items-center gap-3 py-2.5 text-sm">
                <Bell className="size-4 text-muted-foreground" />
                <span className="flex-1">SMS-уведомления</span>
                <Toggle on={false} label="SMS-уведомления" />
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title="Приложение">
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <Row icon={Globe} label="Язык" value={<span className="text-xs text-muted-foreground">Русский</span>} onClick={() => showToast("Русский · Қазақша · 中文")} />
              <Row icon={CreditCard} label="Валюта" value={<span className="text-xs text-muted-foreground">$ USD</span>} onClick={() => showToast("Валюта отображения: ₸ · $ · ¥")} />
            </CardContent>
          </Card>
        </Section>

        <Section title="Прочее">
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <Row icon={Shield} label="Конфиденциальность" onClick={() => showToast("Кто видит ваш профиль и телефон")} />
              <Row icon={HelpCircle} label="Помощь и поддержка" onClick={() => showToast("Открываем чат поддержки")} />
              <Row icon={FileText} label="Условия и оферта" onClick={() => push({ type: "terms" })} />
              <Row icon={Info} label="О приложении" value={<span className="text-xs text-muted-foreground">v1.0</span>} onClick={() => showToast("CN-KZ · Грузоперевозки по СНГ")} />
            </CardContent>
          </Card>
        </Section>

        <Card size="sm">
          <CardContent className="divide-y divide-border">
            <Row icon={LogOut} label="Выйти" onClick={resetOnboarding} />
            <Row icon={Trash2} label="Удалить аккаунт" danger onClick={() => showToast("Удаление аккаунта — по запросу в поддержку")} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------- History (past orders / hauls) ----------

// Вход и безопасность — защита от угона аккаунта (SIM-swap): 2FA, список устройств.
export function SecurityScreen() {
  const { pop, showToast } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Вход и безопасность" subtitle="Защита аккаунта от угона" onBack={pop} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-24">
        <Card size="sm">
          <CardContent className="space-y-1 py-1">
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <Lock className="size-4 text-muted-foreground" />
              <span className="flex-1">Вход по коду из SMS + PIN</span>
              <Toggle on label="Двухфакторный вход" />
            </div>
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <Shield className="size-4 text-muted-foreground" />
              <span className="flex-1">Просить подтверждение при смене номера и реквизитов</span>
              <Toggle on label="Подтверждение важных действий" />
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Активные устройства</p>
          <Card size="sm">
            <CardContent className="divide-y divide-border py-1">
              {[
                ["iPhone · Алматы", "это устройство · сейчас", true],
                ["Android · Астана", "был вход 2 дня назад", false],
              ].map(([name, when, current]) => (
                <div key={name as string} className="flex items-center gap-3 py-2.5 text-sm">
                  <Smartphone className="size-4 text-muted-foreground" />
                  <span className="flex-1">
                    {name}
                    <span className="block text-xs text-muted-foreground">{when}</span>
                  </span>
                  {current ? (
                    <span className="text-xs font-medium text-brand">активно</span>
                  ) : (
                    <button
                      onClick={() => showToast("Устройство отключено от аккаунта")}
                      className="text-xs font-medium text-destructive"
                    >
                      Выйти
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <button
          onClick={() => showToast("Ссылка для смены пароля отправлена по SMS")}
          className="w-full rounded-md border border-border py-2.5 text-sm font-medium text-foreground"
        >
          Сменить пароль
        </button>
        <button
          onClick={() => showToast("Вы вышли на всех устройствах, кроме этого")}
          className="flex w-full items-center justify-center gap-1.5 py-1 text-xs font-medium text-destructive"
        >
          <LogOut className="size-3.5" /> Выйти на всех устройствах
        </button>
      </div>
    </div>
  )
}

const HFILTERS = [
  { id: "all", label: "Все" },
  { id: "done", label: "Завершённые" },
  { id: "cancelled", label: "Отменённые" },
] as const

export function HistoryScreen() {
  const { role, myOrders, feedOrders, setTab, push } = useCnKz()
  const [f, setF] = useState<(typeof HFILTERS)[number]["id"]>("all")
  const source = role === "carrier" ? feedOrders : myOrders
  const finished = source.filter(
    (o) => o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled")
  )
  const list = finished.filter((o) =>
    f === "all" ? true : f === "done" ? o.deal!.status === "completed" : o.deal!.status === "cancelled"
  )
  const earned = finished
    .filter((o) => o.deal!.status === "completed")
    .reduce((s, o) => s + o.deal!.agreedPriceUsd, 0)

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={role === "carrier" ? "История рейсов" : "История заказов"}
        onBack={() => setTab("profile")}
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {role === "carrier" && finished.length > 0 && (
          <Card size="sm">
            <CardContent className="flex items-center justify-around text-center">
              <div>
                <div className="font-mono-tech text-lg font-bold">{finished.length}</div>
                <div className="text-[11px] text-muted-foreground">рейсов</div>
              </div>
              <div>
                <div className="font-mono-tech text-lg font-bold">{money(earned)}</div>
                <div className="text-[11px] text-muted-foreground">заработано</div>
              </div>
              <div>
                <div className="font-mono-tech text-lg font-bold text-brand">4.8</div>
                <div className="text-[11px] text-muted-foreground">рейтинг</div>
              </div>
            </CardContent>
          </Card>
        )}

        <ChipRow>
          {HFILTERS.map((x) => (
            <Chip key={x.id} active={f === x.id} onClick={() => setF(x.id)}>
              {x.label}
            </Chip>
          ))}
        </ChipRow>

        {list.length === 0 && (
          <p className="pt-16 text-center text-sm text-muted-foreground">
            Здесь появятся ваши завершённые {role === "carrier" ? "рейсы" : "заказы"}.
          </p>
        )}
        <div className="space-y-2">
          {list.map((o) => (
            <HistoryRow key={o.id} order={o} carrier={role === "carrier"} onClick={() => push({ type: "deal", orderId: o.id })} />
          ))}
        </div>
      </div>
    </div>
  )
}

function HistoryRow({ order, carrier, onClick }: { order: Order; carrier: boolean; onClick: () => void }) {
  const other = carrier ? order.shipper.name : order.deal!.carrier.name
  return (
    <Card size="sm" onClick={onClick} className="cursor-pointer hover:ring-foreground/20">
      <CardContent className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Route from={order.origin} to={order.destination} className="text-sm" />
          <DealStatusBadge status={order.deal!.status} />
        </div>
        <p className="line-clamp-1 text-xs text-muted-foreground">
          {order.completedAt ?? order.readyDate} · {order.cargo}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {carrier ? "Заказчик" : "Перевозчик"}: {other}
          </span>
          <span className="font-mono-tech text-sm font-semibold text-foreground">
            {money(order.deal!.agreedPriceUsd)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
