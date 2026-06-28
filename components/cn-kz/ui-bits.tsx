"use client"

import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

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
              <div className="mt-1 text-[11px] leading-tight font-medium text-muted-foreground">
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
        "shrink-0 rounded-md border px-3 py-1.5 text-[13px] font-medium whitespace-nowrap transition-[scale,color,background-color,border-color] duration-150 active:scale-[0.96]",
        active
          ? "border-transparent bg-brand text-white"
          : "border-border bg-card text-muted-foreground hover:border-foreground/25 hover:text-foreground"
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
