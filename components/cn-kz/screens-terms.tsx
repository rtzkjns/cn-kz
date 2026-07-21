"use client"

import { AlertTriangle, Ban, FileText, HandCoins, Scale, ShieldCheck, UserCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"
import { StickyCTA } from "./ui-bits"

// Публичная оферта в понятном языке: позиционируем площадку как нейтрального посредника,
// переносим ответственность на пользователей, минимизируем риски компании.
const SECTIONS: { icon: typeof FileText; title: string; body: string }[] = [
  {
    icon: FileText,
    title: "Кто мы",
    body: "CN-KZ — это площадка для поиска: она соединяет заказчиков и перевозчиков. Мы НЕ перевозчик, НЕ экспедитор, НЕ брокер и НЕ сторона вашего договора перевозки.",
  },
  {
    icon: ShieldCheck,
    title: "Мы ничего не гарантируем",
    body: "Мы не отвечаем за доставку, оплату, сохранность груза и надёжность второй стороны. Проверка (БИН, значок «Бизнес проверен», рейтинг) — это помощь для вашего решения, а не гарантия.",
  },
  {
    icon: HandCoins,
    title: "Оплата — напрямую между вами",
    body: "Площадка не держит ваши деньги. Расчёты идут напрямую. Платите проверенному перевозчику на счёт компании по БИН — не на личную карту и не по просьбе увести разговор из приложения.",
  },
  {
    icon: UserCheck,
    title: "Ваша ответственность",
    body: "Вы сами проверяете контрагента, законность и вес груза, документы, страховку и соблюдаете законы — включая таможню, разрешения и санкционные ограничения.",
  },
  {
    icon: Ban,
    title: "Что запрещено",
    body: "Оружие, наркотики, контрабанда, санкционные товары и товары двойного назначения в РФ, а также любой обман. Нарушителей блокируем и при необходимости передаём информацию в органы.",
  },
  {
    icon: AlertTriangle,
    title: "Споры",
    body: "Мы даём инструменты: сохранённую переписку, фото, отметки рейса и жалобу. Но площадка — не арбитр и не несёт ответственности за ваши убытки. Помогаем в разумных пределах.",
  },
  {
    icon: Scale,
    title: "Данные и право",
    body: "Регистрируясь, вы соглашаетесь на обработку данных для работы сервиса. Мы можем ограничить или заблокировать аккаунт при нарушении. Условия регулируются законодательством РК.",
  },
]

// Суть одной строкой — превращаем вводный пробел в сканируемую таблицу (2 колонки).
const FACTS: { icon: typeof FileText; label: string }[] = [
  { icon: Ban, label: "НЕ перевозчик" },
  { icon: ShieldCheck, label: "НЕ гарант" },
  { icon: HandCoins, label: "Оплата напрямую" },
  { icon: UserCheck, label: "Проверка ≠ гарантия" },
]

export function TermsScreen({ onBack }: { onBack?: () => void } = {}) {
  const { pop, t } = useCnKz()
  const back = onBack ?? pop
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title={t("Условия и оферта")} subtitle={t("Коротко и по-человечески")} onBack={back} />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-4">
        {/* Главное — одним абзацем, чтобы понял любой */}
        <Card size="sm" className="surface-glass-brand rounded-2xl border-transparent">
          <CardContent className="space-y-1.5 py-3">
            <p className="text-[15px] font-semibold">{t("Коротко")}</p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              {t("CN-KZ — это")} <span className="font-medium text-foreground">{t("доска объявлений о грузах")}</span>
              {t(", а не перевозчик и не гарант. Мы соединяем стороны, но")}{" "}
              <span className="font-medium text-foreground">{t("не участвуем в сделке и не отвечаем за неё")}</span>
              {t(". Оплата, доставка и проверка контрагента — на вас.")}
            </p>
          </CardContent>
        </Card>

        {/* Суть в 4 атома — заполняем вводный пробел сканируемой таблицей */}
        <div className="grid grid-cols-2 gap-2">
          {FACTS.map((f) => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className="surface-inset flex items-center gap-2.5 rounded-xl px-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card text-foreground">
                  <Icon className="size-4" />
                </span>
                <span className="text-sm leading-tight font-semibold">{t(f.label)}</span>
              </div>
            )
          })}
        </div>

        <Card size="sm" className="rounded-2xl">
          <CardContent className="divide-y divide-border py-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-semibold">{t(s.title)}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t(s.body)}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <p className="px-1 text-center text-sm text-muted-foreground">
          {t("Используя CN-KZ, вы принимаете эти условия. Редакция v1.0 · полная оферта — на сайте.")}
        </p>

        {/* Единственное основное действие — липкая лаймовая кнопка закрывает оферту (§4). */}
        <StickyCTA>
          <Button size="xl" className="w-full" onClick={back}>
            {t("Понятно")}
          </Button>
        </StickyCTA>
      </div>
    </div>
  )
}
