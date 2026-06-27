# CN-KZ Mobile Wireframe — Design

**Date:** 2026-06-04
**Goal:** A clickable, styled front-end MVP wireframe for the CN-KZ cross-border freight marketplace (Хоргос → Kazakhstan). Mock data only, no backend. RU UI. Built on the existing Next.js 16 + React 19 + shadcn + Tailwind 4 repo. Run with `bun run dev`.

## Decisions
- **Location:** CN-KZ is the homepage (`/`). (An unrelated legacy app that previously shared this repo has since been removed.)
- **Roles:** A demo role-switcher in the header flips Шипер ⇄ Перевозчик live (no real auth).
- **Fidelity:** Styled mockup using real shadcn components, presented inside a centered phone frame (~390px) with a bottom tab bar.
- **State:** Pure client-side. One root client component holds `role`, `activeTab`, and a navigation stack of detail screens. Avoids Next 16's Promise-based `params`/`searchParams`.

## Architecture
- `app/page.tsx` → renders `<CnKzApp/>` (client).
- `components/cn-kz/cn-kz-app.tsx` — root state machine (role, tab, nav stack push/pop).
- `components/cn-kz/phone-frame.tsx` — centered device shell + header (logo, role switch) + bottom nav.
- Screens (each a focused component):
  - Shipper: `orders-screen` (Мои заказы feed + filter chips + FAB), `order-detail-screen` (offers list, accept/counter), `create-order-screen` (publish form).
  - Carrier: `feed-screen` (Лента грузов + truck-type filter), `cargo-detail-screen` (make offer: accept price / counter).
  - Shared: `deal-screen` (status tracker Принято→…→Завершено, docs checklist, chat entry, claim button), `chat-screen`, `profile-screen` (rating, history, fleet for carrier, тихий режим toggle), `rating-modal`.
- `lib/cn-kz/types.ts` — Order, Offer, Deal, User, Truck, Message, status enums.
- `lib/cn-kz/mock-data.ts` — sample orders, offers, deals, users, fleet, chat threads.
- UI primitives to add: `badge`, `avatar`, `textarea` (match existing button/card style; base-ui where relevant).

## Screen → role map
| Tab | Шипер | Перевозчик |
|-----|-------|-----------|
| Лента/Заказы | Мои заказы (own orders, status + offer badges, chips Все·Торги·Сделки·Архив, + FAB) | Лента грузов (cargo cards, truck-type chips, capacity filter) |
| Сделки | Active/finished deals dashboard | same |
| Профиль | rating, history, settings | + fleet & watched routes |
| Detail (pushed) | Order → offers → deal → chat | Cargo → offer → deal → chat |

## Out of scope (wireframe)
Real auth, real-time, push notifications, payments, persistence, backend. All faked with static mock data + local React state.

## Verification
`bun run dev`, open `/`, toggle roles, click through feed → detail → deal → chat → profile on both sides.
