"use client"

import { useState } from "react"
import {
  BarChart3,
  BatteryFull,
  Bell,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Clock,
  Heart,
  HelpCircle,
  Home,
  LogOut,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Settings,
  Signal,
  Store,
  Tag,
  User,
  Wifi,
} from "lucide-react"

import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ME_CARRIER, ME_SHIPPER } from "@/lib/cn-kz/mock-data"
import { FilterSheet } from "./filter-sheet"
import { useCnKz, type Tab } from "./store"

// Left slide-in drawer — account header + grouped items. Filters live on-screen
// (keyword chips), so the drawer holds account/notifications/support/logout.
function LogoMenu() {
  const { showToast, openNotifications, setTab, resetOnboarding, newCount, role, me } = useCnKz()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)
  const go = (fn: () => void) => {
    close()
    fn()
  }
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Меню"
        className="flex size-8 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted active:scale-95"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="absolute inset-0 z-40 flex">
          <button
            aria-label="Закрыть меню"
            onClick={close}
            className="animate-in fade-in absolute inset-0 bg-black/55 duration-200"
          />
          <div className="animate-in slide-in-from-left relative flex h-full w-72 flex-col bg-popover shadow-2xl duration-200 ease-out">
            <button
              onClick={() => go(() => setTab("profile"))}
              className="flex items-center gap-3 border-b border-border p-4 text-left transition-colors hover:bg-muted"
            >
              <Avatar name={me.name} className="size-11 text-base" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{me.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {role === "shipper" ? "Заказчик" : "Перевозчик"} · открыть профиль
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>

            <nav className="flex-1 space-y-0.5 p-2">
              <MenuRow icon={Bell} label="Уведомления" badge={newCount} onClick={() => go(openNotifications)} />
              <MenuRow
                icon={Clock}
                label={role === "carrier" ? "История рейсов" : "История заказов"}
                onClick={() => go(() => setTab("history"))}
              />
              {role === "shipper" && (
                <MenuRow icon={BarChart3} label="Аналитика" onClick={() => go(() => setTab("analytics"))} />
              )}
              <MenuRow icon={Settings} label="Настройки" onClick={() => go(() => setTab("settings"))} />
              <MenuRow icon={HelpCircle} label="Поддержка" onClick={() => go(() => showToast("Открываем чат поддержки"))} />
            </nav>

            <div className="border-t border-border p-2">
              <MenuRow icon={LogOut} label="Выйти" danger onClick={() => go(resetOnboarding)} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function MenuRow({
  icon: Icon,
  label,
  badge = 0,
  danger = false,
  onClick,
}: {
  icon: typeof Package
  label: string
  badge?: number
  danger?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors hover:bg-muted active:scale-[0.98]",
        danger ? "text-destructive" : "text-foreground"
      )}
    >
      <Icon className={cn("size-4", danger ? "" : "text-muted-foreground")} />
      <span className="flex-1 text-left">{label}</span>
      {badge > 0 && (
        <span className="rounded-full bg-brand px-1.5 text-[10px] font-semibold text-brand-foreground">{badge}</span>
      )}
    </button>
  )
}

// Mock iOS status bar — makes each screen read like a real device.
export function StatusBar() {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between px-6 pt-1 select-none">
      <span className="text-[13px] font-semibold tabular-nums">9:41</span>
      <span className="flex items-center gap-1.5">
        <Signal className="size-3.5" />
        <Wifi className="size-3.5" />
        <BatteryFull className="size-5" />
      </span>
    </div>
  )
}

// §10: колокольчик со счётчиком → выпадающая мини-панель уведомлений.
// Тап по уведомлению → к нужному заказу/сделке; «Все» → дашборд сделок с фильтром «есть новые».
function NotificationBell() {
  const { newCount, notifications, push, openNotifications } = useCnKz()
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Уведомления"
        className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-5" />
        {newCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-brand-foreground">
            {newCount}
          </span>
        )}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-10 right-0 z-40 w-72 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
            <div className="border-b border-border px-3 py-2 text-sm font-semibold">
              Уведомления
            </div>
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">
                Нет новых уведомлений
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => {
                      setOpen(false)
                      push(n.screen)
                    }}
                    className="flex w-full items-center gap-2.5 border-b border-border/60 px-3 py-2.5 text-left last:border-0 hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full",
                        n.kind === "offer"
                          ? "bg-brand/15 text-brand"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {n.kind === "offer" ? (
                        <Tag className="size-3.5" />
                      ) : (
                        <MessageCircle className="size-3.5" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {n.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {n.subtitle}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => {
                setOpen(false)
                openNotifications()
              }}
              className="flex w-full items-center justify-center gap-1 border-t border-border px-3 py-2 text-xs font-medium text-brand hover:bg-muted"
            >
              Все сделки с новыми <ChevronRight className="size-3.5" />
            </button>
          </div>
        </>
      )}
    </div>
  )
}

type NavItem = { id: string; label: string; icon: typeof Package; center?: boolean }

const NAV: Record<"shipper" | "carrier", NavItem[]> = {
  // Shipper home = Мои заказы (их работа); Рынок = просмотр рыночных цен (FINAL-SPEC §3).
  shipper: [
    { id: "myorders", label: "Мои заказы", icon: Package },
    { id: "feed", label: "Рынок", icon: Store },
    { id: "add", label: "", icon: Plus, center: true },
    { id: "chats", label: "Чаты", icon: MessageCircle },
    { id: "profile", label: "Профиль", icon: User },
  ],
  // Carrier = 4 таба (Избранное → сердечко в шапке ленты). FINAL-SPEC §3.
  carrier: [
    { id: "feed", label: "Главная", icon: Home },
    { id: "deals", label: "Мои рейсы", icon: Boxes },
    { id: "chats", label: "Чаты", icon: MessageCircle },
    { id: "profile", label: "Профиль", icon: User },
  ],
}

// Гость видит ПОЛНУЮ навигацию (не 2 таба): открытый браузинг + вход в табе «Профиль».
const GUEST_NAV: NavItem[] = [
  { id: "feed", label: "Главная", icon: Home },
  { id: "favorites", label: "Избранное", icon: Heart },
  { id: "chats", label: "Чат", icon: MessageCircle },
  { id: "profile", label: "Профиль", icon: User },
]

function BottomNav() {
  const { role, tab, setTab, push, authed } = useCnKz()
  const items = authed ? NAV[role] : GUEST_NAV
  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-card px-2 pt-2 pb-[max(10px,env(safe-area-inset-bottom))]">
      {items.map((t) => {
        const Icon = t.icon
        if (t.center) {
          return (
            <button
              key={t.id}
              onClick={() => push({ type: "createOrder" })}
              className="flex flex-1 flex-col items-center justify-center"
              aria-label="Новый заказ"
            >
              <span className="shadow-key flex size-11 items-center justify-center rounded-full bg-brand text-brand-foreground transition-transform duration-150 active:scale-95">
                <Icon className="size-5" />
              </span>
            </button>
          )
        }
        const active = tab === t.id
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            aria-label={t.label}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={cn(
                "flex h-9 w-16 items-center justify-center rounded-md transition-colors",
                active ? "bg-brand/12 text-brand" : "text-muted-foreground"
              )}
            >
              <Icon className="size-6" />
            </span>
            <span
              className={cn(
                "text-[12px] font-medium transition-colors",
                active ? "text-brand" : "text-muted-foreground"
              )}
            >
              {t.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  const { toast, authed, openAuth, role, setTab } = useCnKz()
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-b from-neutral-950 to-black p-0 sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2rem] sm:border-[6px] sm:border-neutral-800 sm:shadow-2xl">
        <StatusBar />
        {/* Header — гость видит логотип + «Войти», залогиненный — меню + колокольчик */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
          {authed ? (
            <LogoMenu />
          ) : (
            <span className="flex items-center gap-2 font-semibold tracking-tight">
              <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
                <Package className="size-4" />
              </span>
              CN-KZ
            </span>
          )}
          {authed ? (
            <div className="flex items-center gap-0.5">
              {role === "carrier" && (
                <button
                  onClick={() => setTab("favorites")}
                  aria-label="Избранное"
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Heart className="size-5" />
                </button>
              )}
              <NotificationBell />
            </div>
          ) : (
            <Button size="sm" onClick={openAuth}>
              Войти
            </Button>
          )}
        </header>

        {/* Content */}
        <main className="relative flex-1 overflow-y-auto">{children}</main>

        {/* Toast — z-50 + top placement so it's never hidden behind a fixed bottom action bar */}
        {toast && (
          <div className="pointer-events-none absolute inset-x-0 top-16 z-50 flex justify-center px-4">
            <div className="animate-in fade-in slide-in-from-top-2 rounded-lg bg-foreground px-3 py-2 text-center text-xs font-medium text-background shadow-lg">
              {toast}
            </div>
          </div>
        )}

        <BottomNav />
        <FilterSheet />
      </div>
    </div>
  )
}

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  action,
}: {
  title: React.ReactNode
  subtitle?: string
  onBack?: () => void
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-2">
      {onBack && (
        <button
          onClick={onBack}
          className="-ml-1 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Назад"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="font-heading text-xl leading-tight font-semibold tracking-tight text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}
