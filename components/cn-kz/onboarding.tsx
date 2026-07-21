"use client"

import { useState } from "react"
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Hash,
  Lock,
  Mail,
  MessageSquare,
  Package,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  User,
  UserPlus,
  Zap,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { TRUCK_TYPES, type City, type Role, type TruckType } from "@/lib/cn-kz/types"
import { LANGS } from "@/lib/cn-kz/i18n"
import { CityMultiPicker } from "./city-picker"
import { StatusBar } from "./phone-frame"
import { TermsScreen } from "./screens-terms"
import { useCnKz } from "./store"
import { Chip, ChipRow, StickyCTA } from "./ui-bits"

type Step = "auth" | "login" | "register" | "role" | "profile" | "terms"

// Mirrors User Flow «1. Онбординг»: splash → вход → главный экран; регистрация → выбор роли → профиль → главный экран.
export function OnboardingFlow() {
  // Вход использует роль уже существующего аккаунта (последнюю в сторе); роль выбирается только при регистрации.
  const { enterApp, role: accountRole, closeAuth, lang, setLang, t } = useCnKz()
  const [step, setStep] = useState<Step>("auth")
  const [method, setMethod] = useState<"email" | "phone">("phone")
  const [role, setRole] = useState<Role>("shipper")

  // Оферта показывается КАК ШАГ онбординга (не push в стек), иначе closeAuth() размонтирует
  // онбординг и теряет введённые данные, а «Назад» падает на гостевую ленту.
  const openTerms = () => setStep("terms")

  // profile fields (wireframe — not persisted)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [truck, setTruck] = useState<TruckType>("тент")
  const [docs, setDocs] = useState<string[]>([])
  const toggleDoc = (d: string) =>
    setDocs((x) => (x.includes(d) ? x.filter((y) => y !== d) : [...x, d]))
  const [routes, setRoutes] = useState<City[]>(["Алматы"])

  function pickRole(r: Role) {
    setRole(r)
    setStep("profile") // выбор роли есть только в регистрации → дальше профиль
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
              <h1 className="t-display text-center text-balance">
                {t("Грузоперевозки")}
                <br />
                {t("по всей СНГ")}
              </h1>
              <p className="max-w-[18rem] text-center text-base leading-relaxed text-muted-foreground text-pretty">
                {t("Маркетплейс грузов и перевозчиков. Прямые сделки, торги и рейтинги — без посредников.")}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-1.5">
              <ValuePill icon={Zap} label={t("Realtime лента")} />
              <ValuePill icon={Gavel} label={t("Торги · своя цена")} />
              <ValuePill icon={Star} label={t("Рейтинги сторон")} />
            </div>
          </div>

          {/* Язык — реальный выбор появится позже; на первом экране виден как первичный контрол. */}
          <div className="mb-3 flex flex-col gap-2">
            <span className="t-eyebrow text-muted-foreground">{t("Язык")}</span>
            <ChipRow>
              {LANGS.map((l) => (
                <Chip key={l.id} active={lang === l.id} onClick={() => setLang(l.id)}>
                  {l.label}
                </Chip>
              ))}
            </ChipRow>
          </div>

          {/* CTAs — single lime accent: only «Войти» is the primary. «Создать аккаунт» = gray secondary. */}
          <div className="flex flex-col gap-2.5">
            <Button size="xl" className="w-full" onClick={() => setStep("login")}>
              {t("Войти")}
            </Button>
            <Button
              size="xl"
              variant="secondary"
              className="w-full gap-2"
              onClick={() => setStep("register")}
            >
              <UserPlus className="size-5" />
              {t("Создать аккаунт")}
            </Button>
            <button
              onClick={closeAuth}
              className="mt-1 text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {t("Смотреть грузы без входа →")}
            </button>
          </div>
        </div>
      </Frame>
    )
  }

  // Оферта как шаг онбординга — «Назад» возвращает к регистрации, данные сохраняются.
  if (step === "terms") {
    return (
      <Frame>
        <StatusBar />
        <TermsScreen onBack={() => setStep("register")} />
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
          <h1 className="t-h1">{t("Вход")}</h1>

          <Button
            variant="secondary"
            size="xl"
            className="w-full gap-2.5"
            onClick={() => enterApp(accountRole)}
          >
            <span className="flex size-5 items-center justify-center rounded-full bg-white text-[13px] font-bold text-[#4285F4]">
              G
            </span>
            {t("Продолжить с Google")}
          </Button>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> {t("или по телефону")}
            <span className="h-px flex-1 bg-border" />
          </div>

          <ChipRow>
            <Chip active={method === "phone"} onClick={() => setMethod("phone")}>
              {t("Телефон + SMS")}
            </Chip>
            <Chip active={method === "email"} onClick={() => setMethod("email")}>
              {t("Email + пароль")}
            </Chip>
          </ChipRow>
          {method === "phone" ? (
            <Field label={t("Телефон")}>
              <SignalInput icon={Phone} placeholder="+7 705 123 45 67" inputMode="tel" />
            </Field>
          ) : (
            <>
              <Field label={t("Email")}>
                <SignalInput icon={Mail} type="email" placeholder="you@mail.kz" />
              </Field>
              <Field label={t("Пароль")}>
                <SignalInput icon={Lock} type="password" placeholder={t("Ваш пароль")} />
              </Field>
            </>
          )}
          <Button size="xl" className="w-full" onClick={() => enterApp(accountRole)}>
            {method === "phone" ? t("Войти по SMS") : t("Войти")}
          </Button>
        </div>
      )}

      {step === "register" && (
        <div className="space-y-4 px-5 pt-4">
          <h1 className="t-h1">{t("Регистрация")}</h1>
          <ChipRow>
            <Chip active={method === "phone"} onClick={() => setMethod("phone")}>
              {t("Телефон + SMS")}
            </Chip>
            <Chip active={method === "email"} onClick={() => setMethod("email")}>
              {t("Email + пароль")}
            </Chip>
          </ChipRow>
          {method === "phone" ? (
            <>
              <Field label={t("Телефон")}>
                <SignalInput icon={Phone} placeholder="+7 7__ ___ __ __" inputMode="tel" />
              </Field>
              <Field label={t("SMS-код")}>
                <SignalInput icon={MessageSquare} placeholder="____" inputMode="numeric" />
              </Field>
            </>
          ) : (
            <>
              <Field label={t("Email")}>
                <SignalInput icon={Mail} type="email" placeholder="you@mail.kz" />
              </Field>
              <Field label={t("Пароль")}>
                <SignalInput icon={Lock} type="password" placeholder="••••••••" />
              </Field>
            </>
          )}
          <Button size="xl" className="w-full" onClick={() => setStep("role")}>
            {t("Зарегистрироваться")}
          </Button>
          <p className="text-center text-sm leading-snug text-muted-foreground">
            {t("Регистрируясь, вы принимаете")}{" "}
            <button
              type="button"
              onClick={openTerms}
              className="font-medium text-brand underline underline-offset-2"
            >
              {t("Условия и публичную оферту")}
            </button>
            {t(": CN-KZ — площадка для поиска, не перевозчик и не гарант доставки.")}
          </p>
        </div>
      )}

      {step === "role" && (
        <div className="flex flex-col gap-3 px-5 pt-5 pb-8">
          <div className="space-y-1">
            <h1 className="t-h1">{t("Выберите роль")}</h1>
            <p className="t-meta text-muted-foreground">
              {t("Роль выбирается один раз и не меняется — выберите, кто вы на площадке.")}
            </p>
          </div>
          <RoleCard
            icon={Package}
            title={t("Заказчик")}
            desc={t("У меня есть груз — публикую заказы и выбираю перевозчика.")}
            features={[t("Публикую заказы"), t("Выбираю фуру"), t("Торги · своя цена")]}
            onClick={() => pickRole("shipper")}
          />
          <RoleCard
            icon={Truck}
            title={t("Перевозчик")}
            desc={t("У меня есть фура — беру заказы из ленты и вожу.")}
            features={[t("Лента грузов"), t("Своя цена"), t("Вожу рейсы")]}
            onClick={() => pickRole("carrier")}
          />
          {/* заполняем нижнюю часть экрана: почему CN-KZ (существующие ценности площадки) */}
          <div className="mt-1 space-y-2.5">
            <span className="t-eyebrow">{t("Почему CN-KZ")}</span>
            <div className="flex flex-wrap gap-1.5">
              <ValuePill icon={Zap} label={t("Realtime лента")} />
              <ValuePill icon={Gavel} label={t("Торги · своя цена")} />
              <ValuePill icon={Star} label={t("Рейтинги сторон")} />
              <ValuePill icon={ShieldCheck} label={t("Проверка сторон")} />
            </div>
          </div>
        </div>
      )}

      {step === "profile" && (
        <div className="space-y-4 px-4 pt-4 pb-6">
          <h1 className="t-h1">
            {role === "shipper" ? t("Профиль заказчика") : t("Профиль перевозчика")}
          </h1>
          <Field label={t("ФИО")}>
            <SignalInput icon={User} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Имя Фамилия")} />
          </Field>
          <Field label={t("Телефон")}>
            <SignalInput icon={Phone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7…" inputMode="tel" />
          </Field>

          {role === "shipper" ? (
            <Field label={t("Юр. лицо (необязательно)")}>
              <SignalInput icon={Building2} value={company} onChange={(e) => setCompany(e.target.value)} placeholder={t("ИП / ТОО")} />
            </Field>
          ) : (
            <>
              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("Тип первой фуры")}
                </span>
                <div className="flex flex-wrap gap-2">
                  {TRUCK_TYPES.map((t) => (
                    <Chip key={t} active={truck === t} onClick={() => setTruck(t)}>
                      {t}
                    </Chip>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label={t("Макс. вес, кг")}>
                  <SignalInput type="number" inputMode="numeric" placeholder="20000" />
                </Field>
                <Field label={t("Объём, м³")}>
                  <SignalInput type="number" inputMode="numeric" placeholder="86" />
                </Field>
              </div>
              <Field label={t("Гос. номер")}>
                <SignalInput icon={Hash} placeholder="777 ABC 02" />
              </Field>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("Проверка профиля — значок «Бизнес проверен» и доступ к премиум-грузам")}
                </span>
                {[
                  "БИН/ИНН · сверим с реестром юрлиц",
                  "Селфи · подтверждение, что вы реальный человек",
                  "Удостоверение личности · сверим с селфи",
                  "Фото фуры с гос. номером",
                ].map((d) => {
                  const done = docs.includes(d)
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDoc(d)}
                      className="flex min-h-[52px] w-full items-center gap-3 rounded-lg bg-secondary px-3.5 py-2.5 text-left transition-transform active:scale-[0.99]"
                    >
                      <span
                        className={cn(
                          "flex size-6 shrink-0 items-center justify-center rounded-full text-white transition-colors",
                          done ? "bg-[var(--success)]" : "border-[1.5px] border-input bg-card"
                        )}
                      >
                        {done && <Check className="size-3.5" />}
                      </span>
                      <span className={cn("min-w-0 flex-1 text-[15px] leading-snug", done ? "text-foreground" : "text-muted-foreground")}>
                        {t(d)}
                      </span>
                      <span className={cn("shrink-0 text-sm font-semibold", done ? "text-[var(--success)]" : "text-muted-foreground")}>
                        {done ? t("Готово") : t("Загрузить")}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("Маршруты — пришлём уведомление о новых грузах")}
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

          <StickyCTA>
            <Button
              size="xl"
              className="w-full"
              disabled={role === "carrier" && routes.length === 0}
              onClick={() => enterApp(role, name.trim() ? { name: name.trim(), company: company.trim() || undefined } : undefined)}
            >
              {t("Готово")}
            </Button>
          </StickyCTA>
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
  const { t } = useCnKz()
  return (
    <div className="flex min-h-dvh w-full items-center justify-center bg-foreground p-0 sm:p-6">
      <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2rem] sm:border-[6px] sm:border-foreground sm:shadow-2xl">
        <StatusBar />
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-border px-1">
          {onBack && (
            <button
              onClick={onBack}
              className="flex size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label={t("Назад")}
            >
              <ChevronLeft className="size-6" />
            </button>
          )}
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
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
    <div className="flex min-h-dvh w-full items-center justify-center bg-foreground p-0 sm:p-6">
      <div
        className={cn(
          "relative flex h-dvh w-full flex-col overflow-hidden bg-background sm:h-[844px] sm:max-w-[390px] sm:rounded-[2rem] sm:border-[6px] sm:border-foreground sm:shadow-2xl",
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}

// Brand logo — flat lime tile, black glyph («Signal»: no glows, the one accent).
function LogoMark({ size = "md" }: { size?: "md" | "lg" }) {
  const big = size === "lg"
  return (
    <span
      className={cn(
        "flex items-center justify-center bg-brand text-brand-foreground",
        big ? "size-14 rounded-2xl" : "size-11 rounded-lg"
      )}
    >
      <Package className={big ? "size-7" : "size-5"} />
    </span>
  )
}

function ValuePill({
  icon: Icon,
  label,
}: {
  icon: LucideIcon
  label: string
}) {
  return (
    <span className="surface-inset inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground">
      <Icon className="size-4 text-foreground/70" />
      {label}
    </span>
  )
}

function RoleCard({
  icon: Icon,
  title,
  desc,
  features,
  onClick,
}: {
  icon: LucideIcon
  title: string
  desc: string
  features: string[]
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "surface-glass flex w-full flex-col gap-3 rounded-2xl p-4 text-left transition-[transform,box-shadow,background-color] duration-150 hover:bg-brand/12 hover:shadow-[inset_0_0_0_1.5px_var(--brand)] active:scale-[0.99]"
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-secondary text-foreground">
          <Icon className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block t-h3">{title}</span>
          <span className="mt-0.5 block text-[15px] leading-snug text-muted-foreground">{desc}</span>
        </span>
        <ChevronRight className="mt-1 size-5 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {features.map((f) => (
          <span
            key={f}
            className="rounded-md bg-secondary px-2.5 py-1 text-sm font-medium text-muted-foreground"
          >
            {f}
          </span>
        ))}
      </div>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  )
}

// «Signal» input — h56 r14, gray-fill (bg-secondary), 20px leading glyph, 16px placeholder.
function SignalInput({
  icon: Icon,
  className,
  ...props
}: React.ComponentProps<"input"> & { icon?: LucideIcon }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" />
      )}
      <Input
        className={cn(
          "h-14 rounded-lg border-transparent bg-secondary text-base placeholder:text-muted-foreground md:text-base",
          Icon && "pl-11",
          className
        )}
        {...props}
      />
    </div>
  )
}
