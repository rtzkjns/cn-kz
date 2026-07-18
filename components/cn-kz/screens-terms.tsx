"use client"

import { AlertTriangle, Ban, FileText, HandCoins, Scale, ShieldCheck, UserCheck } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { ScreenHeader } from "./phone-frame"
import { useCnKz } from "./store"

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

export function TermsScreen({ onBack }: { onBack?: () => void } = {}) {
  const { pop } = useCnKz()
  const back = onBack ?? pop
  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Условия и оферта" subtitle="Коротко и по-человечески" onBack={back} />
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4 pb-10">
        {/* Главное — одним абзацем, чтобы понял любой */}
        <Card size="sm" className="ring-brand/40">
          <CardContent className="space-y-1.5 py-3">
            <p className="text-[15px] font-semibold">Коротко</p>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              CN-KZ — это <span className="font-medium text-foreground">доска объявлений о грузах</span>,
              а не перевозчик и не гарант. Мы соединяем стороны, но{" "}
              <span className="font-medium text-foreground">не участвуем в сделке и не отвечаем за неё</span>.
              Оплата, доставка и проверка контрагента — на вас.
            </p>
          </CardContent>
        </Card>

        <Card size="sm">
          <CardContent className="divide-y divide-border py-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.title} className="flex items-start gap-3 py-3">
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-brand">
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium">{s.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        <p className="px-1 text-center text-sm text-muted-foreground">
          Используя CN-KZ, вы принимаете эти условия. Редакция v1.0 · полная оферта — на сайте.
        </p>
      </div>
    </div>
  )
}
