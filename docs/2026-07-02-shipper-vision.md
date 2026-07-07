# CN-KZ — New Shipper Vision (wireframe build)

Built in the real dark-Linear prototype (`~/cn-kz`), from the cofounder Figma
(HIARbrJvNTYE0EHzSQecl2) — 7 commented screens + 9 master notes + 29 comments —
plus reference research (Full Truck Alliance, Lalamove, Uber Freight, inDrive).
Decisions: dark Linear look · full new-vision · 5-tab bottom nav. Deployed to a
**new preview link**, not pushed to GitHub.

## Navigation (shipper)
5-tab bottom bar: **Заказы · Аналитика · ➕(Добавить) · Чаты · Профиль**.
Center ➕ pushes Create Order. Burger/top-left menu holds filters, notifications,
saved/pinned, support. (Carrier nav unchanged: Лента · Офферы · Сделки · Профиль.)

## Screens & changes (from comments → build)
- **Заказы (home)** — tabs → *Не принятые / Принятые / Архив / Все*; search by
  destination + **tag search** (`#алматы #тент`, Lamoda-style); **filters** (by #
  offers, by date, truck type) in a sheet; **pin/закрепить** (favorite, à la
  Lalamove rebook) → pinned float to top; compact cards, clear deal identity.
- **Аналитика (NEW)** — Uber-Freight-style insights: spend, avg price, orders,
  completion %, avg offers/order, avg carrier rating, top routes (bar), spend by
  month (spark), exception alerts ("2 заказа без офферов", "цена выше рынка").
- **Чаты (NEW)** — conversation list across all deals; unread badges → ChatScreen.
- **Order + offers** — each offer: carrier + rating, **vehicle params** (type,
  plate, capacity), **chat button**, **reject button**, tap → **Carrier profile**.
- **Carrier profile (NEW)** — rating, deals, **verified/docs (security)**, fleet,
  reviews, actions (choose offer / chat / masked call).
- **Create order** — cleaner sectioned form + **suggested price** hint.
- **Deal / accepted order** — polished 6-step tracker + carrier card (→profile) +
  chat + secure-payment cue + cancel.
- **Profile** — verification/security block, granular settings.
- **Auth** — **Continue with Google** + phone-SMS below; forgot password; bigger
  buttons/placeholders.
- **Security surfaces** — verified badges, doc-verified checks, masked calling,
  escrow/payment-protection cue.

## Out of scope for this pass
Real backend, real analytics data (mock), pixel-final visual polish (cofounder),
carrier-side changes.
