"use client"

import { useState } from "react"
import {
  BatteryFull,
  Bell,
  Boxes,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Info,
  MessageCircle,
  Package,
  Signal,
  Tag,
  Truck,
  User,
  Wifi,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useCnKz, type Tab } from "./store"

// Logo doubles as a menu button (top-left). Holds actions that aren't in the bottom nav.
function LogoMenu() {
  const { showToast } = useCnKz()
  const [open, setOpen] = useState(false)
  const items = [
    { icon: HelpCircle, label: "Поддержка" },
    { icon: Info, label: "О приложении" },
  ]
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Меню"
        className="flex size-7 items-center justify-center rounded-lg bg-brand text-brand-foreground transition-transform active:scale-95"
      >
        <Package className="size-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-9 left-0 z-40 w-44 overflow-hidden rounded-xl border border-border bg-popover py-1 shadow-lg">
            {items.map((it) => (
              <button
                key={it.label}
                onClick={() => {
                  setOpen(false)
                  showToast(`${it.label} — демо`)
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-muted"
              >
                <it.icon className="size-4 text-muted-foreground" />
                {it.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
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
                          : "bg-sky-500/15 text-sky-400"
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

const TABS: Record<
  "shipper" | "carrier",
  { id: Tab; label: string; icon: typeof Package }[]
> = {
  shipper: [
    { id: "feed", label: "Заказы", icon: Package },
    { id: "deals", label: "Сделки", icon: Boxes },
    { id: "profile", label: "Профиль", icon: User },
  ],
  carrier: [
    { id: "feed", label: "Лента", icon: Truck },
    { id: "deals", label: "Сделки", icon: Boxes },
    { id: "profile", label: "Профиль", icon: User },
  ],
}

function BottomNav() {
  const { role, tab, setTab } = useCnKz()
  return (
    <nav className="flex shrink-0 items-stretch border-t border-border bg-card px-2 pt-2 pb-3">
      {TABS[role].map((t) => {
        const active = tab === t.id
        const Icon = t.icon
        return (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span
              className={cn(
                "flex h-8 w-16 items-center justify-center rounded-full transition-colors",
                active ? "bg-brand/12 text-brand" : "text-muted-foreground"
              )}
            >
              <Icon className="size-5" />
            </span>
            <span
              className={cn(
                "text-[11px] font-medium transition-colors",
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
  const { toast } = useCnKz()
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-b from-[#eeeef1] to-[#e3e3e7] p-0 sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2.5rem] sm:border-[6px] sm:border-white sm:shadow-2xl sm:shadow-black/15">
        <StatusBar />
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-3">
          <LogoMenu />
          <NotificationBell />
        </header>

        {/* Content */}
        <main className="relative flex-1 overflow-y-auto">{children}</main>

        {/* Toast */}
        {toast && (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 z-20 flex justify-center px-4">
            <div className="rounded-lg bg-foreground px-3 py-2 text-center text-xs font-medium text-background shadow-lg">
              {toast}
            </div>
          </div>
        )}

        <BottomNav />
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
