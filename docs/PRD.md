# CN-KZ — Product Requirements (PRD)

> Cross-border freight marketplace. Origin hardcoded: **Хоргос** (China border crossing). Destination: **any CIS city** (КЗ + РФ, Узбекистан, Кыргызстан и т.д.) — not limited to 5 cities. No navigator/distance/pricing-by-km; shipper names the price.
> Source of truth: Notion page "CN-KZ" (`36d07ffa-1b2c-804e-b141-f308b20de77e`) + "User Flow" subpage. This file mirrors that spec for in-repo access. UI language: **Russian**.

## Concept

A two-sided marketplace connecting **shippers** (have cargo in Хоргос that needs to reach a KZ city) with **carriers/truckers** (have фуры and drive these routes). Modeled on inDrive / Uber Freight / ATI.SU. The platform is an aggregator: it does **not** handle money or arbitration in the MVP — parties arrange payment (cash / bank transfer) and resolve disputes via chat, escalating to support if needed.

## Roles

Chosen once at signup, **never changes**:

- **Шипер (shipper)** — publishes cargo orders, reviews offers, picks a carrier, tracks delivery, rates the carrier.
- **Перевозчик (carrier)** — maintains a truck fleet + watched routes, browses the cargo feed, makes offers, drives the delivery, updates status, rates the shipper.

---

# MVP — 10 features

### 1. Авторизация и роли
- Registration: email + password, **or** phone + SMS code.
- **Mandatory role choice at signup** (Шипер / Перевозчик). App won't open without it.
- Login / Logout / password recovery (email link or SMS depending on signup method).
- Role is fixed once and cannot be changed.

### 2. Профиль пользователя
Holds user data, builds trust via rating + deal history.
- **Phone required for both roles.** When an offer is opened, the partner's phone is visible immediately for direct contact.
- **Carrier — fleet & routes:** can add multiple фуры; each truck = type + max weight + max volume + plate number + photo. When creating an offer the carrier picks which truck. **Watched routes** = which destination cities to track → used for push on matching new orders.

### 3. Создание и публикация заказа — **shipper only**
Form fields:
- **Origin** — Хоргос (hardcoded).
- **Pickup point at Хоргос** *(2026-06-16)* — склад/терминал/адрес where the carrier loads (Хоргос has many terminals, so this is required) + **pickup contact phone**.
- **Destination** — **searchable city picker over CIS** (autocomplete search; no preset chips). Structured value (selected from list), so feed-filter (§4) and route-match push (§10) keep working. *(Updated 2026-06-16: was 5 fixed KZ cities; broadened to CIS — pulls BACKLOG P3 "city DB + autocomplete" forward.)*
- **Cargo description** — text.
- **Weight (kg)** and **Volume (m³)** — numbers.
- **Truck type** — chips: рефрижератор / тент / контейнеровоз / автовоз / бортовой / цистерна.
- **Price (Name your price)** — number in **USD**, shipper sets it (static market ranges per route as guidance).
- **Ready-to-load date** at Хоргос — calendar.
- **Delivery address** — street + house in destination city.
- **Recipient name + phone** at destination.
- **Payment type** (informational): cash or bank transfer — arranged in chat. Platform handles no money in MVP.
- **Notes / Примечание** *(2026-06-16)* — free text for constraints/requirements (растаможка, пропуск, хрупкое, простой…). Industry-standard field (ATI.SU).

On **Опубликовать**, the order appears (real-time) in the feed of carriers whose truck type matches.

**Edit/delete edge cases:**
- No offers → edit freely. Offers but no deal → changing a key field (price / weight / route) **voids offers** + pushes carriers; minor edits have no effect. Deal created → order frozen (chat or cancel only).
- Delete only before a deal; after a deal, only deal cancellation.
- **72h** without responses → auto-archived; one-tap **Перепубликовать**.

**Power-shipper tools** (compete with TG/WhatsApp workflows):
- **«Создать копию»** in each order card menu → pre-filled form (seconds, not minutes).
- Header filter chips on Мои заказы: **Все · Торги · Сделки · Архив**.
- Sort: newest first (default) · by load date · by route. Search by "route + cargo description".
- Card badges: number of new offers, unread-chat indicator.

### 4. Лента грузов и фильтрация — **carrier only**
Real-time inventory of available cargo.
- Cards with key fields: route, truck type, weight, price, date.
- Horizontal truck-type filter chips ("Все" default). Extra filters by weight and destination city.
- Pull-to-refresh + new orders auto-appear without reload. Tap card → detail + bidding.
- **Defaults:** feed auto-filtered by the carrier's own truck type (expandable manually). Sorted newest first. **Capacity filter** hides orders exceeding the truck's max weight/volume.
- If the carrier already made an offer → "Ваш оффер" indicator (colored stripe).
- When an order becomes a deal → it disappears from everyone's feed (it's taken).

### 5. Торги: один раунд
Name-your-price + 1 counter-offer + **15-minute confirmation window** (inDrive model).
- **Carrier side:** "Принять цену" (agree to shipper's price) or "Своя цена" (counter). Can cancel own offer until the shipper picks it. Offer status visible: На рассмотрении / Принят / Отклонён / Истёк.
- **Shipper side:** sees all offers with carrier name + rating. Accept-price offers are marked "Готов везти сразу"; counters are normal.
- **When shipper picks:**
  - **Вариант А (Принять цену):** deal created **immediately**, no confirmation. Carrier gets "Ваш оффер принят".
  - **Вариант Б (Counter-offer):** carrier gets a 15-min window to confirm (truck may be taken). Confirm → deal. No confirm → offer expires, order returns to feed.
- Picking one offer auto-rejects the rest (push: "выбран другой перевозчик").

### 6. Сделка и статусы доставки  — DRIVER-SIMPLE (updated 2026-07-12)
`Принято → В пути → [На границе] → Доставлено → Завершено`
Truck drivers are a low-tech audience and won't tap a button per micro-status (research: inDrive/Yandex/Uber Freight/Convoy converge on **2 required driver taps at physical handoffs**). So:
- **Принято** — AUTO the instant the offer is accepted (no driver tap).
- **«Забрал груз»** — driver **tap #1** (required) at pickup → shipper reads this as **«В пути»**.
- **«Прошёл границу»** — **optional** driver tap; never blocks the pipeline. Shows as a soft node shipper-side, greyed if skipped.
- **«Доставил груз»** — driver **tap #2** (required) at delivery. Optional POD photo at this step.
- **Завершено** — the **shipper** confirms with **«Подтвердить получение»**.
- The carrier UI shows **one big "next action" button** (the single next step only) with a **confirm step** (two-tap «Точно?» — not swipe, which fails with gloves/cold). Forward-only; no intermediate "В пути"/"На границе" as *required* driver actions.
- Shipper sees a coarse timestamped stepper + «Обновлено N назад» + chat/call as the fallback when the driver goes quiet.
- Deals dashboard for both roles (active + completed). Colored status badges.
- **Cancel deal:** available to both sides **until "Забрал заказ"**. Requires confirmation ("снизит ваш рейтинг"); cancelling side loses N rating (floor 0). Deal → "Отменено" with who cancelled.
- **Claims (претензии):** no auto-arbiter in MVP. **«Подать претензию»** button in deal detail (from "Забрал заказ" onward) → support ticket (email to admin) with chat history + deal data attached. Covers damage / loss / shortage / delay / cargo mismatch. Runs parallel to the order status.

### 7. Чат
- Exists **only inside a deal**. Real-time, text only in MVP. RU only (AI translation CN/KZ is backlog).
- History persists after completion, available in deal archive (Profile) — for dispute resolution (deliberately unlike Yandex, since freight stakes are higher).

### 8. Рейтинги после сделки
- After "Завершено", a rating screen pops for both sides. **Stars 1–5 required** + optional comment.
- A side's rating is revealed only after **both** rate. Average updates in profile automatically.
- 7-day window; after that the partner's rating shows without exchange. Low rating (1–2) requires a comment. No editing after submit.

### 9. ~~Чеклист документов для границы~~ — DROPPED (2026-07-12)
Cut after research: the driver doesn't *produce* border documents (the shipper / freight-forwarder / customs broker does), a static list is wrong for the specific load (phyto only for perishables, TIR only under the TIR regime — much China↔KZ freight now clears via ASTANA-1 digital customs), and regular-corridor drivers know the docs cold. Real freight apps ship document **upload (POD)**, not a static pre-border checklist. The actionable, kept equivalent = the **optional POD photo** at the «Доставил груз» step (§6). No dedicated checklist screen.

### 10. Push-уведомления
Liquidity-critical. **Trigger "new matching cargo"**: on publish, push goes to carriers matching truck type + watched destination + cargo type.
- **Shipper pushes:** new offer; all offers received (30 min after publish); counter-offer confirmed (deal created); counter not confirmed in 15 min (offer expired); status changed; new chat message. Grouping: several offers in 10 min → one digest push.
- **Carrier pushes:** offer accepted (Вариант А — deal created); shipper picked your counter (confirm in 15 min); offer rejected; new chat message.
- **Implementation:** Expo Push Notifications, triggered from backend on DB field changes. Quiet hours 22:00–8:00 (toggle in profile); only critical (offer expiry) breaks through. If system push denied → critical notifications duplicated to email.

---

# Backlog (post-MVP, P1 → P7)

- **P1 Монетизация:** 5% carrier commission on completed deals; escrow; Kaspi Pay / Alipay / WeChat Pay.
- **P2 Доверие и верификация:** license + vehicle-doc upload & checks; "Верифицирован" badge; admin moderation; full claims process; business-shipper KYC (БИН).
- **P3 Улучшения флоу:** Telegram bot to create orders from freeform text (LLM parse via Claude API; trojan-horse to migrate power-shippers from TG; cross-posting); ML-suggested pricing; route subscriptions; "best time to post" widget; backhaul matching; cargo photos + GPS tracking; maps/distance/price-per-km/ETA; detailed truck subtypes; full KZ city DB + autocomplete; order templates; CSV/Excel bulk import; voice order entry; digest push mode; auto-republish; ML field prefill.
- **P3 Опасный груз (ADR)** *(добавлено 2026-06-16):* флаг ADR у заказа + признак «ADR-допуск» (ДОПОГ) у перевозчика → опасный груз видят/берут только сертифицированные; ADR-документы (свидетельство ДОПОГ, аварийная карточка) добавляются в чеклист §9. Отложено в бэклог: большого спроса пока нет, есть более приоритетные задачи.
- **P4 Торги 2-го уровня:** A/B "Bid Up"; auto-accept by filters; long-term contracts for repeat shippers.
- **P5 География:** + Алтынколь, + Достык (mostly rail).
- (P6–P7: further-out expansion.)

---

# Engineering rules

- See `AGENTS.md`: this Next.js version has **breaking changes** — read `node_modules/next/dist/docs/` before writing code; heed deprecation notices.
- Stack: Next.js 16 + React 19 + shadcn (base-nova, base-ui) + Tailwind 4 + Supabase. Dark theme; brand accent `--brand` (amber). Run with `bun run dev`.
- Current state: a **front-end wireframe** (mock data, no backend) lives at `/` (`components/cn-kz/`). See `docs/superpowers/specs/2026-06-04-cn-kz-wireframe-design.md`.
