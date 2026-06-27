"use client"

import { cn } from "@/lib/utils"

// Мини-сводка сверху ленты: ряд плиток «число + подпись», часть кликабельна.
export interface Stat {
  value: number
  label: string
  accent?: boolean
  onClick?: () => void
}

export function StatStrip({ items }: { items: Stat[] }) {
  return (
    <div className="flex gap-2 px-4 pb-2">
      {items.map((s) => {
        const Tag = s.onClick ? "button" : "div"
        return (
          <Tag
            key={s.label}
            onClick={s.onClick}
            className={cn(
              "surface-glass flex-1 rounded-xl px-3 py-3 text-left",
              s.onClick &&
                "transition-[scale,box-shadow] duration-150 active:scale-[0.97]"
            )}
          >
            <div
              className={cn(
                "text-2xl leading-none font-bold tracking-tight tabular-nums",
                s.accent && s.value > 0 && "text-brand"
              )}
            >
              {s.value}
            </div>
            <div className="mt-1.5 text-[10px] leading-tight font-medium tracking-wide text-muted-foreground uppercase">
              {s.label}
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
        "shrink-0 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-[scale,color,background-color,border-color] duration-150 active:scale-[0.96]",
        active
          ? "border-transparent bg-secondary text-foreground"
          : "border-border bg-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
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
