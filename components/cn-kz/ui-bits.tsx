"use client"

import { useEffect, useState } from "react"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Живой обратный отсчёт mm:ss до дедлайна (§5 — окно подтверждения встречной).
export function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(deadline)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const left = Math.max(0, deadline - now)
  const m = Math.floor(left / 60000)
  const s = Math.floor((left % 60000) / 1000)
  return (
    <span className="font-mono-tech tabular-nums">
      {m}:{String(s).padStart(2, "0")}
    </span>
  )
}

// Мини-сводка сверху ленты: единая карточка с сегментами «иконка + число + подпись».
export interface Stat {
  value: number
  label: string
  icon: LucideIcon
  accent?: boolean
  onClick?: () => void
}

export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <div className="surface-glass mx-4 mb-3 flex items-stretch divide-x divide-border rounded-md">
      {items.map((s) => {
        const Tag = s.onClick ? "button" : "div"
        const Icon = s.icon
        const on = s.value > 0
        return (
          <Tag
            key={s.label}
            onClick={s.onClick}
            className={cn(
              "flex flex-1 flex-col gap-2.5 px-3.5 py-3.5 text-left first:rounded-l-md last:rounded-r-md",
              s.onClick && "transition-transform duration-150 active:scale-[0.97]"
            )}
          >
            <span
              className={cn(
                "flex size-7 items-center justify-center rounded-[5px]",
                s.accent && on ? "bg-brand/15 text-brand" : "bg-muted text-muted-foreground"
              )}
            >
              <Icon className="size-3.5" />
            </span>
            <div>
              <div
                className={cn(
                  "font-mono-tech text-[22px] leading-none font-bold tracking-tight",
                  s.accent && on && "text-brand"
                )}
              >
                {s.value}
              </div>
              <div className="mt-1 text-sm leading-tight font-medium text-muted-foreground">
                {s.label}
              </div>
            </div>
          </Tag>
        )
      })}
    </div>
  )
}

export function ChipRow({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className
      )}
    >
      {children}
    </div>
  )
}

export function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-11 shrink-0 items-center rounded-md border px-4 text-[15px] font-medium whitespace-nowrap transition-[scale,color,background-color,border-color] duration-150 active:scale-[0.96]",
        active
          ? "border-transparent bg-brand text-white"
          : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
      )}
    >
      {children}
    </button>
  )
}

// Липкая нижняя панель с ОДНИМ основным действием (56px, thumb-zone). FINAL-SPEC §2.2.
// Градиентный fade сверху + safe-area снизу. Кладётся последним внутри экрана.
export function StickyCTA({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none sticky inset-x-0 bottom-0 z-20 -mx-4 mt-2 px-4 pt-6 pb-[max(12px,env(safe-area-inset-bottom))] [background:linear-gradient(to_top,var(--background)_55%,transparent)]">
      <div className="pointer-events-auto flex flex-col gap-2">{children}</div>
    </div>
  )
}

// Единое пустое состояние: иконка + заголовок + подсказка + опциональное действие.
export function EmptyState({
  icon: Icon,
  title,
  hint,
  action,
}: {
  icon: LucideIcon
  title: string
  hint?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 pt-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-[17rem] text-sm text-muted-foreground">{hint}</p>}
      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}

export function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}

export function Section({
  title,
  right,
  children,
}: {
  title: string
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </section>
  )
}
