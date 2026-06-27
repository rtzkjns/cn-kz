import { cn } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase()
}

function Avatar({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  return (
    <span
      data-slot="avatar"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground select-none",
        className
      )}
    >
      {initials(name)}
    </span>
  )
}

export { Avatar }
