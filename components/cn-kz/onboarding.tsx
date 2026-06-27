"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, Gavel, Package, Star, Truck, User, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TRUCK_TYPES, type City, type Role, type TruckType } from "@/lib/cn-kz/types"
import { CityMultiPicker } from "./city-picker"
import { StatusBar } from "./phone-frame"
import { useCnKz } from "./store"
import { Chip, ChipRow } from "./ui-bits"

type Step = "splash" | "auth" | "login" | "register" | "role" | "profile"

// Mirrors User Flow «1. Онбординг»: splash → вход → главный экран; регистрация → выбор роли → профиль → главный экран.
export function OnboardingFlow() {
  // Вход использует роль уже существующего аккаунта (последнюю в сторе); роль выбирается только при регистрации.
  const { enterApp, role: accountRole } = useCnKz()
  const [step, setStep] = useState<Step>("splash")

  // Splash при запуске: показываем логотип ~1.6с, затем экран авторизации.
  useEffect(() => {
    if (step !== "splash") return
    const t = setTimeout(() => setStep("auth"), 1600)
    return () => clearTimeout(t)
  }, [step])
  const [method, setMethod] = useState<"email" | "phone">("phone")
  const [role, setRole] = useState<Role>("shipper")

  // profile fields (wireframe — not persisted)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [truck, setTruck] = useState<TruckType>("тент")
  const [routes, setRoutes] = useState<City[]>(["Алматы"])

  function pickRole(r: Role) {
    setRole(r)
    setStep("profile") // выбор роли есть только в регистрации → дальше профиль
  }

  if (step === "splash") {
    return (
      <Frame className="items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <LogoMark size="lg" />
          <div className="flex flex-col items-center gap-1.5">
            <span className="text-3xl font-semibold tracking-tight">CN-KZ</span>
            <span className="font-mono-tech text-[13px] text-muted-foreground">
              Хоргос&nbsp;→&nbsp;СНГ
            </span>
          </div>
        </div>
      </Frame>
    )
  }

  if (step === "auth") {
    return (
      <Frame>
        <StatusBar />
        <div className="flex flex-1 flex-col px-6 pb-8">
          {/* hero */}
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <LogoMark size="lg" />
            <div className="flex flex-col items-center gap-3">
              <h1 className="text-center text-[2rem] leading-[1.08] font-semibold tracking-[-0.02em] text-balance">
                Грузоперевозки
                <br />
                Хоргос → СНГ
              </h1>
              <p className="max-w-[18rem] text-center text-sm leading-relaxed text-muted-foreground text-pretty">
                Маркетплейс грузов и перевозчиков. Прямые сделки, торги и рейтинги — без посредников.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              <ValuePill icon={Zap} label="Realtime лента" />
              <ValuePill icon={Gavel} label="Торги · inDrive" />
              <ValuePill icon={Star} label="Рейтинги сторон" />
            </div>
          </div>

          {/* CTAs — single accent: only «Войти» is the lime/green action. */}
          <div className="flex flex-col gap-2.5">
            <Button
              size="lg"
              className="h-12 w-full text-[15px]"
              onClick={() => setStep("login")}
            >
              Войти
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full rounded-full text-[15px]"
              onClick={() => setStep("register")}
            >
              Создать аккаунт
            </Button>
          </div>
        </div>
      </Frame>
    )
  }

  return (
    <Shell
      onBack={
        step === "login" || step === "register"
          ? () => setStep("auth")
          : step === "role"
            ? () => setStep("register")
            : step === "profile"
              ? () => setStep("role")
              : undefined
      }
    >
      {step === "login" && (
        <div className="space-y-4 px-5 pt-4">
          <h1 className="font-heading text-lg font-semibold">Вход</h1>
          <ChipRow>
            <Chip active={method === "phone"} onClick={() => setMethod("phone")}>
              Телефон + SMS
            </Chip>
            <Chip active={method === "email"} onClick={() => setMethod("email")}>
              Email + пароль
            </Chip>
          </ChipRow>
          {method === "phone" ? (
            <>
              <Field label="Телефон">
                <Input placeholder="+7 7__ ___ __ __" />
              </Field>
              <Field label="SMS-код">
                <Input placeholder="____" inputMode="numeric" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Email">
                <Input type="email" placeholder="you@mail.kz" />
              </Field>
              <Field label="Пароль">
                <Input type="password" placeholder="••••••••" />
              </Field>
            </>
          )}
          <Button className="w-full" onClick={() => enterApp(accountRole)}>
            Войти
          </Button>
        </div>
      )}

      {step === "register" && (
        <div className="space-y-4 px-5 pt-4">
          <h1 className="font-heading text-lg font-semibold">Регистрация</h1>
          <ChipRow>
            <Chip active={method === "phone"} onClick={() => setMethod("phone")}>
              Телефон + SMS
            </Chip>
            <Chip active={method === "email"} onClick={() => setMethod("email")}>
              Email + пароль
            </Chip>
          </ChipRow>
          {method === "phone" ? (
            <>
              <Field label="Телефон">
                <Input placeholder="+7 7__ ___ __ __" />
              </Field>
              <Field label="SMS-код">
                <Input placeholder="____" inputMode="numeric" />
              </Field>
            </>
          ) : (
            <>
              <Field label="Email">
                <Input type="email" placeholder="you@mail.kz" />
              </Field>
              <Field label="Пароль">
                <Input type="password" placeholder="••••••••" />
              </Field>
            </>
          )}
          <Button className="w-full" onClick={() => setStep("role")}>
            Зарегистрироваться
          </Button>
        </div>
      )}

      {step === "role" && (
        <div className="flex h-full flex-col justify-center space-y-3 px-5 pb-40">
          <h1 className="text-center font-heading text-lg font-semibold">
            Выберите роль
          </h1>
          <p className="text-center text-xs text-muted-foreground">
            Роль выбирается один раз и не меняется.
          </p>
          <RoleCard
            icon={Package}
            title="Шипер"
            desc="У меня есть груз — публикую заказы и выбираю перевозчика."
            onClick={() => pickRole("shipper")}
          />
          <RoleCard
            icon={Truck}
            title="Перевозчик"
            desc="У меня есть фура — беру заказы из ленты и вожу."
            onClick={() => pickRole("carrier")}
          />
        </div>
      )}

      {step === "profile" && (
        <div className="space-y-4 px-5 pt-4 pb-6">
          <h1 className="font-heading text-lg font-semibold">
            Профиль {role === "shipper" ? "шипера" : "перевозчика"}
          </h1>
          <Field label="ФИО">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя Фамилия" />
          </Field>
          <Field label="Телефон">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7…" />
          </Field>

          {role === "shipper" ? (
            <Field label="Юр. лицо (необязательно)">
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="ИП / ТОО" />
            </Field>
          ) : (
            <>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Тип первой фуры
                </span>
                <ChipRow>
                  {TRUCK_TYPES.map((t) => (
                    <Chip key={t} active={truck === t} onClick={() => setTruck(t)}>
                      {t}
                    </Chip>
                  ))}
                </ChipRow>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Макс. вес, кг">
                  <Input type="number" inputMode="numeric" placeholder="20000" />
                </Field>
                <Field label="Объём, м³">
                  <Input type="number" inputMode="numeric" placeholder="86" />
                </Field>
              </div>
              <Field label="Гос. номер">
                <Input placeholder="777 ABC 02" />
              </Field>
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-muted-foreground">
                  Маршруты — пришлём уведомление о новых грузах
                </span>
                <CityMultiPicker
                  selected={routes}
                  onToggle={(c) =>
                    setRoutes((r) =>
                      r.includes(c) ? r.filter((x) => x !== c) : [...r, c]
                    )
                  }
                />
              </div>
            </>
          )}

          <Button
            className="w-full"
            disabled={role === "carrier" && routes.length === 0}
            onClick={() => enterApp(role)}
          >
            Готово
          </Button>
        </div>
      )}
    </Shell>
  )
}

function Shell({
  children,
  onBack,
}: {
  children: React.ReactNode
  onBack?: () => void
}) {
  return (
    <Frame>
      <StatusBar />
      <header className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Назад"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </Frame>
  )
}

// Phone-frame container shared by the full-bleed entry screens (splash / auth).
function Frame({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-gradient-to-b from-[#fdeae5] to-[#f6cfc6] p-0 sm:p-6">
      <div
        className={cn(
          "relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2.5rem] sm:border-[6px] sm:border-white sm:shadow-2xl sm:shadow-[#f73b20]/15",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Brand logo — flat green tile (Linear: no glows).
function LogoMark({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg"
  return (
    <span
      style={{ background: "linear-gradient(135deg, #f8a4a4 0%, #f73b20 100%)" }}
      className={cn(
        "shadow-key flex items-center justify-center text-white",
        big ? "size-20 rounded-[32%]" : "size-12 rounded-[28%]"
      )}
    >
      <Package className={big ? "size-10" : "size-6"} />
    </span>
  )
}

function ValuePill({
  icon: Icon,
  label,
}: {
  icon: typeof Zap
  label: string
}) {
  return (
    <span className="surface-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5 text-brand" />
      {label}
    </span>
  )
}

function RoleCard({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: typeof Package
  title: string
  desc: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-brand hover:bg-muted/40"
      )}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/15 text-brand">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="block font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}
