"use client"

import { useState } from "react"
import {
  Bell,
  Calendar,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  HelpCircle,
  Info,
  Lock,
  LogOut,
  Package,
  Plus,
  Shield,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Truck,
  User as UserIcon,
  Weight,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { Order } from "@/lib/cn-kz/types"
import { LANGS } from "@/lib/cn-kz/i18n"
import { cn } from "@/lib/utils"
import { ScreenHeader } from "./phone-frame"
import { DealStatusBadge, money } from "./shared"
import { Chip, ChipRow, EmptyState, Section } from "./ui-bits"
import { useCnKz } from "./store"

// ---------- Settings ----------

// Real local-state switch — visibly flips and holds for the session (mock; no backend).
function Toggle({ on, label }: { on: boolean; label: string }) {
  const [v, setV] = useState(on)
  // ≥44px tap target: кнопка тянется на min-h-11 с паддингом, 28px трек — только визуал.
  return (
    <button
      onClick={() => setV((x) => !x)}
      role="switch"
      aria-checked={v}
      aria-label={label}
      className="flex min-h-11 shrink-0 items-center py-2 pl-2"
    >
      <span
        className={"relative block h-7 w-12 rounded-full transition-colors " + (v ? "bg-brand" : "bg-input")}
      >
        <span
          className={"absolute top-1 size-5 rounded-full bg-white shadow-sm transition-all " + (v ? "left-[22px]" : "left-1")}
        />
      </span>
    </button>
  )
}

function Row({
  icon: Icon,
  label,
  value,
  onClick,
  danger,
  armed,
}: {
  icon: typeof UserIcon
  label: string
  value?: React.ReactNode
  onClick?: () => void
  danger?: boolean
  armed?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={
        "flex w-full items-center gap-3 px-1 py-3 text-left text-base transition-colors " +
        (armed
          ? "rounded-lg bg-destructive/10 px-2 font-semibold text-destructive"
          : danger
            ? "text-destructive"
            : "hover:text-foreground")
      }
    >
      <Icon className={"size-5 " + (armed ? "text-destructive" : danger ? "" : "text-muted-foreground")} />
      <span className="flex-1">{label}</span>
      {value}
      {!value && !danger && !armed && <ChevronRight className="size-5 text-muted-foreground" />}
    </button>
  )
}

export function SettingsScreen() {
  const { setTab, resetOnboarding, showToast, push, lang, setLang, t } = useCnKz()
  const [confirmDel, setConfirmDel] = useState(false)
  const back = () => setTab("profile")
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Настройки")} onBack={back} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-24">
        <Section title={t("Аккаунт")}>
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <Row icon={UserIcon} label={t("Профиль")} onClick={() => setTab("profile")} />
              <Row icon={Bell} label={t("Номер телефона")} value={<span className="text-sm text-muted-foreground">+7 ··· 34</span>} onClick={() => showToast(t("Изменение номера — по SMS"))} />
              <Row icon={Lock} label={t("Вход и безопасность")} onClick={() => push({ type: "security" })} />
            </CardContent>
          </Card>
        </Section>

        <Section title={t("Уведомления")}>
          <Card size="sm">
            <CardContent className="space-y-1 divide-y divide-border">
              <div className="flex items-center gap-3 py-3 text-base">
                <Bell className="size-5 text-muted-foreground" />
                <span className="flex-1">{t("Новые отклики и грузы")}</span>
                <Toggle on label={t("Новые отклики и грузы")} />
              </div>
              <div className="flex items-center gap-3 py-3 text-base">
                <Bell className="size-5 text-muted-foreground" />
                <span className="flex-1">{t("Сообщения в чате")}</span>
                <Toggle on label={t("Сообщения в чате")} />
              </div>
              <div className="flex items-center gap-3 py-3 text-base">
                <Bell className="size-5 text-muted-foreground" />
                <span className="flex-1">{t("SMS-уведомления")}</span>
                <Toggle on={false} label={t("SMS-уведомления")} />
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section title={t("Приложение")}>
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <div className="flex items-center gap-3 py-3">
                <Globe className="size-5 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-base">{t("Язык")}</span>
                <div className="flex gap-1 rounded-lg bg-secondary p-1">
                  {LANGS.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setLang(l.id)}
                      className={cn(
                        "min-h-9 rounded-md px-3 text-sm font-bold transition-colors",
                        lang === l.id
                          ? "bg-brand text-brand-foreground"
                          : "text-muted-foreground"
                      )}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
              <Row
                icon={CreditCard}
                label={t("Валюта")}
                value={
                  <span className="text-right text-sm leading-tight">
                    <span className="block text-foreground">$ USD</span>
                    <span className="block text-sm text-muted-foreground">{t("тенге — ориентир")}</span>
                  </span>
                }
                onClick={() => showToast(t("Оплата в USD · ₸ показан ориентировочно"))}
              />
            </CardContent>
          </Card>
        </Section>

        <Section title={t("Прочее")}>
          <Card size="sm">
            <CardContent className="divide-y divide-border">
              <Row icon={Shield} label={t("Конфиденциальность")} onClick={() => showToast(t("Кто видит ваш профиль и телефон"))} />
              <Row icon={HelpCircle} label={t("Помощь и поддержка")} onClick={() => showToast(t("Открываем чат поддержки"))} />
              <Row icon={FileText} label={t("Условия и оферта")} onClick={() => push({ type: "terms" })} />
              <Row icon={Info} label={t("О приложении")} value={<span className="text-sm text-muted-foreground">v1.0</span>} onClick={() => showToast(t("CN-KZ · Грузоперевозки по СНГ"))} />
            </CardContent>
          </Card>
        </Section>

        <Card size="sm">
          <CardContent className="divide-y divide-border">
            <Row icon={LogOut} label={t("Выйти")} onClick={resetOnboarding} />
            <Row
              icon={Trash2}
              label={confirmDel ? t("Нажмите ещё раз для подтверждения") : t("Удалить аккаунт")}
              danger
              armed={confirmDel}
              onClick={() => {
                if (!confirmDel) {
                  setConfirmDel(true)
                  return
                }
                setConfirmDel(false)
                showToast(t("Запрос на удаление отправлен в поддержку"))
              }}
            />
            {confirmDel && (
              <p className="px-1 pt-2 text-sm text-muted-foreground">
                {t("Аккаунт удаляется по запросу в поддержку — это действие необратимо.")}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ---------- History (past orders / hauls) ----------

// Вход и безопасность — защита от угона аккаунта (SIM-swap): 2FA, список устройств.
export function SecurityScreen() {
  const { pop, showToast, t } = useCnKz()
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Вход и безопасность")} subtitle={t("Защита аккаунта от угона")} onBack={pop} />
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 pb-24">
        <Card size="sm">
          <CardContent className="space-y-1 py-1">
            <div className="flex items-center gap-3 py-3 text-base">
              <Lock className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1">{t("Вход по коду из SMS + PIN")}</span>
              <Toggle on label={t("Двухфакторный вход")} />
            </div>
            <div className="flex items-center gap-3 py-3 text-base">
              <Shield className="size-5 shrink-0 text-muted-foreground" />
              <span className="flex-1">{t("Просить подтверждение при смене номера и реквизитов")}</span>
              <Toggle on label={t("Подтверждение важных действий")} />
            </div>
          </CardContent>
        </Card>

        <div>
          <p className="t-eyebrow mb-1.5 px-1">{t("Активные устройства")}</p>
          <Card size="sm">
            <CardContent className="divide-y divide-border py-1">
              {[
                ["iPhone · Алматы", t("это устройство · сейчас"), true],
                ["Android · Астана", t("был вход 2 дня назад"), false],
              ].map(([name, when, current]) => (
                <div key={name as string} className="flex items-center gap-3 py-3 text-base">
                  <Smartphone className="size-5 shrink-0 text-muted-foreground" />
                  <span className="flex-1">
                    {name}
                    <span className="block text-sm text-muted-foreground">{when}</span>
                  </span>
                  {current ? (
                    <span className="text-sm font-medium text-success">{t("активно")}</span>
                  ) : (
                    <button
                      onClick={() => showToast(t("Устройство отключено от аккаунта"))}
                      className="min-h-11 px-2 text-sm font-medium text-destructive"
                    >
                      {t("Выйти")}
                    </button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Anti-empty: honest SIM-swap / фишинг tip заполняет низ экрана полезной плотностью. */}
        <div className="surface-inset flex items-start gap-2.5 rounded-2xl p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
          <p className="text-sm leading-snug text-muted-foreground">
            {t("Вход подтверждается кодом из SMS. Никому не сообщайте код и PIN — поддержка CN-KZ их не спрашивает.")}
          </p>
        </div>

        <Button
          variant="secondary"
          onClick={() => showToast(t("Код для смены PIN отправлен по SMS"))}
          className="h-12 w-full rounded-xl text-base"
        >
          {t("Сменить PIN-код")}
        </Button>
        <button
          onClick={() => showToast(t("Вы вышли на всех устройствах, кроме этого"))}
          className="flex min-h-11 w-full items-center justify-center gap-1.5 py-2 text-sm font-medium text-destructive"
        >
          <LogOut className="size-4" /> {t("Выйти на всех устройствах")}
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
  const { role, myOrders, feedOrders, setTab, push, t } = useCnKz()
  const [f, setF] = useState<(typeof HFILTERS)[number]["id"]>("all")
  const source = role === "carrier" ? feedOrders : myOrders
  const finished = source.filter(
    (o) => o.deal && (o.deal.status === "completed" || o.deal.status === "cancelled")
  )
  const list = finished.filter((o) =>
    f === "all" ? true : f === "done" ? o.deal!.status === "completed" : o.deal!.status === "cancelled"
  )
  const done = finished.filter((o) => o.deal!.status === "completed")
  const earned = done.reduce((s, o) => s + o.deal!.agreedPriceUsd, 0)
  const ratings = done.map((o) => o.deal!.carrier.rating).filter((r) => typeof r === "number")
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "—"

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title={role === "carrier" ? t("История рейсов") : t("История заказов")}
        onBack={() => setTab("profile")}
      />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-24">
        {/* Стат-полоса для ОБЕИХ ролей (было только у перевозчика) — заполняет верх сводкой. */}
        {finished.length > 0 && (
          <Card size="sm">
            <CardContent className="flex items-center justify-around text-center">
              <div>
                <div className="font-mono-tech text-xl font-bold tabular-nums">{finished.length}</div>
                <div className="text-sm text-muted-foreground">{role === "carrier" ? t("рейсов") : t("заказов")}</div>
              </div>
              <div>
                <div className="font-mono-tech text-xl font-bold tabular-nums">{money(earned)}</div>
                <div className="text-sm text-muted-foreground">{role === "carrier" ? t("заработано") : t("потрачено")}</div>
              </div>
              <div>
                <div className="font-mono-tech text-xl font-bold tabular-nums text-brand">{avgRating}</div>
                <div className="text-sm text-muted-foreground">{t("рейтинг")}</div>
              </div>
            </CardContent>
          </Card>
        )}

        {finished.length > 0 && (
          <ChipRow>
            {HFILTERS.map((x) => (
              <Chip key={x.id} active={f === x.id} onClick={() => setF(x.id)}>
                {t(x.label)}
              </Chip>
            ))}
          </ChipRow>
        )}

        {finished.length === 0 ? (
          <EmptyState
            icon={role === "carrier" ? Truck : Package}
            title={role === "carrier" ? t("Пока нет завершённых рейсов") : t("Пока нет завершённых заказов")}
            hint={
              role === "carrier"
                ? t("Здесь появятся доставленные рейсы и заработок по каждому из них.")
                : t("Здесь появятся закрытые заказы, суммы и оценки перевозчиков.")
            }
            action={
              <Button
                size="xl"
                className="px-8"
                onClick={() => (role === "carrier" ? setTab("feed") : push({ type: "createOrder" }))}
              >
                {role === "carrier" ? (
                  <>
                    <Truck className="size-5" /> {t("К грузам")}
                  </>
                ) : (
                  <>
                    <Plus className="size-5" /> {t("Создать заказ")}
                  </>
                )}
              </Button>
            }
          />
        ) : list.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t("В этом фильтре пусто")}
            hint={t("Смените фильтр выше, чтобы увидеть другие записи истории.")}
          />
        ) : (
          <div className="space-y-2.5">
            {list.map((o) => (
              <HistoryRow
                key={o.id}
                order={o}
                carrier={role === "carrier"}
                onClick={() => push({ type: "deal", orderId: o.id })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Мета-пилл истории — тот же атом плотности, что и в ленте (вес/кузов/срок).
function MetaPill({ icon: Icon, children }: { icon: typeof Truck; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2.5 py-1.5 text-[14px] font-medium text-muted-foreground tabular-nums">
      <Icon className="size-4 opacity-60" />
      {children}
    </span>
  )
}

// Плотная карточка истории: аватар второй стороны + рейтинг, кольцевой маршрут,
// мета-пиллы и КРУПНАЯ итоговая цена — строка заполнена 6+ атомами данных, не пустует.
function HistoryRow({ order, carrier, onClick }: { order: Order; carrier: boolean; onClick: () => void }) {
  const { t } = useCnKz()
  const other = carrier ? order.shipper : order.deal!.carrier
  const priceUsd = order.deal!.agreedPriceUsd
  return (
    <div
      onClick={onClick}
      className="surface-glass cursor-pointer rounded-2xl p-4 transition-transform duration-150 active:scale-[0.99]"
    >
      {/* Вторая сторона + статус сделки */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <Avatar name={other.name} className="size-10 shrink-0 text-sm font-bold" />
          <div className="min-w-0 leading-tight">
            <p className="t-h3 truncate">{other.name}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-3.5 shrink-0 fill-[var(--star)] text-[var(--star)]" />
              <span className="font-mono-tech text-foreground">{other.rating.toFixed(1)}</span>
              <span aria-hidden>·</span>
              <span className="truncate">{carrier ? t("Заказчик") : t("Перевозчик")}</span>
            </p>
          </div>
        </div>
        <DealStatusBadge status={order.deal!.status} />
      </div>

      {/* Маршрут — синее кольцо → коннектор → лаймовое кольцо */}
      <div className="mt-3 flex gap-3">
        <div className="flex flex-col items-center pt-1.5">
          <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-from)] bg-background" />
          <span className="route-connector my-1 flex-1" />
          <span className="size-3 shrink-0 rounded-full border-2 border-[var(--route-to)] bg-[var(--route-to)]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-medium text-muted-foreground">{order.origin}</p>
          <p className="t-h3 mt-0.5 truncate">{order.destination}</p>
        </div>
      </div>

      {/* Мета-пиллы: кузов · вес · дата */}
      <div className="mt-3 flex flex-wrap gap-2">
        <MetaPill icon={Truck}>{order.truckType}</MetaPill>
        <MetaPill icon={Weight}>{order.weightKg.toLocaleString("ru-RU")} {t("кг")}</MetaPill>
        <MetaPill icon={Calendar}>{order.completedAt ?? order.readyDate}</MetaPill>
      </div>

      {/* Итоговая цена — самый громкий элемент строки, якорит правый низ */}
      <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary px-4 py-3">
        <div className="min-w-0 leading-none">
          <p className="t-eyebrow">{order.deal!.status === "completed" ? t("Оплачено") : t("Сумма сделки")}</p>
          <p className="font-mono-tech mt-1.5 text-2xl font-bold tracking-tight tabular-nums">
            {money(priceUsd)}
          </p>
        </div>
        <span className="flex size-11 shrink-0 items-center justify-center text-muted-foreground">
          <ChevronRight className="size-5" />
        </span>
      </div>

      {order.cargo && (
        <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">{order.cargo}</p>
      )}
    </div>
  )
}
