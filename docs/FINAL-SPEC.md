# CN-KZ — Final Functions & Design Spec (LOCKED v2 · 2026-07-18)

Product of a 3-phase finalization: 9-agent audit + global competitor research (inDrive/Uber/Yandex, Manbang/Kargo/BlackBuck, ATI/kolesa) + low-tech-driver UX specs, then an adversarial 3-lens judge panel. This is the build contract. Companion: `docs/DESIGN.md` (visual system), `docs/PRD.md` (product spec).

**North star:** the low-tech KZ/CIS truck driver wins every trade-off. CN-KZ is a **neutral matchmaker** — it introduces parties; they transact directly. No custody, no guarantee, minimal cost.

---

## 0. IMPLEMENTATION ORDER (sequenced; each batch builds + verifies before the next)
1. **Tokens** — `app/globals.css`: type-scale classes, sizing tokens, status colors (`--warn`,`--info`; `--success` exists). Radius stays **6px** (no change). + `DESIGN.md` "Driver-first UI contract".
2. **Shared components** — `Badge` (full status map), sticky bottom-CTA bar, `Button` primary/secondary sizes, bump `Chip`/`MetaPill`/icon-button hit areas.
3. **IA / nav** — carrier 4-tab; Профиль becomes the account hub (absorbs hamburger); shipper home = Мои заказы; StatStrip tap-to-filter; Избранное via header heart.
4. **Per-screen size + primary-action sweep** — every screen (driver surfaces first).
5. **Function fixes** — contact-reveal matrix, POD + rating persistence, re-bid, dead-control cleanup, CUT SOS + online-toggle, ≈₸, maps deep-link.
6. **Language toggle** (real+persistent; KZ covers carrier core path; ZH demo; RU fallback) — LAST, flagged for native review.

---

## 1. FUNCTION VERDICTS (every function gets one)
| Function | Verdict | Note |
|---|---|---|
| Guest browse-first feed, phone+SMS auth, role fixed once | KEEP | validated |
| inDrive bidding: accept-price / one counter / skip; 15-min counter window | KEEP | locked, validated |
| Shipper: post cargo, manage orders, review offers, pick carrier, deal, confirm receipt, rate | KEEP | |
| Carrier: feed, filter, cargo detail, bid, 2-tap delivery status, rate | KEEP | |
| Сборный рейс / TripBuilder (consolidation) | **KEEP-DEMOTE** | reachable from feed TripTray + a card in «Мои рейсы»; not a nav tab. Apply size floors. |
| Отметки рейса (deal event log) | **DEMOTE** | collapse into a toggle inside DealScreen, below the sticky primary |
| Претензия / «Что-то не так со сделкой?» (claim) | KEEP | keep; demote below primary |
| Надёжность (reliability score) + anti-переуступка (vehicle bind) card | KEEP | free trust signal; keep |
| verified / insured / БИН badges, rating | KEEP | the only trust surface a non-guarantor has |
| SOS / «Поделиться поездкой» | **CUT** | dead, off-loop, security-pass leftover |
| «Я на линии» online toggle | **CUT (do not add)** | no dispatch model → dead/confusing |
| Contact reveal (call/chat) once engaged | **ADD/FIX** | §5 matrix |
| ≈₸ secondary price (carrier) | **ADD** | §5, muted indicative only |
| «Открыть в картах» deep-link (city-name query, no coords) | **ADD** | cheap navigation, zero GPS |
| Backhaul / return-load | **DEFER** | post-MVP earnings hook; do not build |
| GPS/tracking/ETA, escrow/payments, border-docs, algorithmic pricing | **STAY CUT** | locked, validated |

---

## 2. DESIGN SYSTEM (exact — encode in globals.css, sweep components/cn-kz/*)
### 2.1 Type scale (Inter; Geist Mono for numbers). Floor: nothing a driver READS < 14px; nothing < 12px. tabular-nums on every number.
`.t-display 32/700/1.05 -.02em` · `.t-h1 24/700/1.2 -.02em` · `.t-h2 20/700/1.25 -.015em` · `.t-h3 17/600/1.3` · `.t-body 16/400-500/1.5` · `.t-body-strong 16/600` · `.t-meta 14/500/1.35` · `.t-eyebrow 12/600 +.04em UPPERCASE` (labels only, never data).
Sweep: shipped 13px→16, 11px→14, 10px eyebrows→12 (labels only). Bottom-nav labels stay 12px **exempt from the read-floor** because they are always icon+word paired.

### 2.2 Sizing & buttons
`--cta-h:56px; --tap-min:48px`. **Primary** 56px full-width, radius 12 (via `rounded-xl`—keep --radius 6px base; use explicit rounded on CTAs), label 17/700, `bg-primary`, **bottom-anchored, exactly ONE per screen**. **Secondary** 48px ghost/outline 16px. **Chips** 44px. **Icon buttons** 44×44 hit area (glyph 20-24). Gap ≥8px (prefer 12). Detail/form/bid/deal use a **sticky bottom CTA bar** (`pb-[env(safe-area-inset-bottom)]` + gradient fade). Feed card carries a **real 48px action button**, never a bare chevron.
Binding/destructive actions = **two-tap confirm that changes BOTH color and label** (not word alone).

### 2.3 Color / semantic status — one `Badge` = dot + icon + WORD on 12%-tint bg (never full fill; danger = text+dot only; never color alone). Add `--warn #f5b545`, `--info #5aa9f5` (already in DESIGN.md). COMPLETE map:
| state | color |
|---|---|
| OrderStatus published (Опубликован) | info |
| OrderStatus bidding (Идут отклики) | warn |
| OrderStatus/DealStatus deal·accepted (Принято/Сделка) | brand |
| DealStatus picked_up (В пути) | warn |
| DealStatus at_border (На границе) | info |
| DealStatus delivered (Доставлен) | success |
| DealStatus completed (Завершено) | success (solid check) |
| OrderStatus archived (Архив) | muted/neutral |
| cancelled / claim (Отменён/Претензия) | danger (text+dot) |
Accept ACTION button = success green (`--success`), distinct from the "accepted" STATUS badge = brand. Migrate scattered inline `bg-amber-500/10`,`text-destructive`,`text-brand` in screens-shared.tsx etc. into the one Badge.

### 2.4 Card anatomy (feed = core carrier screen)
radius 12, pad 16, gap 12. (1) trust header: 28px avatar + shipper 15/600 + mono rating + freshness 14 muted + status badge; (2) ROUTE hero: origin 15 muted → **destination 22/700** + connector dots; (3) cargo 15 muted 1-line; (4) meta pills 14px / 32px tall / 16px icon; (5) price footer: eyebrow 12 UPPERCASE + **price 28 mono/700** (+ muted ≈₸ for carrier) + real 48px action button.

### 2.5 Radius / surfaces / motion — **KEEP `--radius: 0.375rem` (6px)** and surface-glass border-elevation (do NOT oscillate). Buttons `active:scale-0.96`, cards `0.99`, `transition-[transform,box-shadow] duration-150`. Skeletons over spinners.

---

## 3. IA / NAVIGATION (decided — no forks)
- **Carrier bottom nav = 4:** Главная · Мои рейсы · Чаты · Профиль. Избранное → **header heart icon** on the feed (`setTab('favorites')`, FavoritesScreen stays reachable). Сборный рейс → feed TripTray + card in Мои рейсы.
- **Shipper bottom nav = 5:** Мои заказы · Рынок · ＋Создать · Чаты · Профиль. **Home/default tab = `myorders`** (was market feed). Market feed → «Рынок» tab (labeled as price-research). Requires: authed-shipper default tab → myorders; swap Home/Package icons; **guests keep market as home** (GUEST_NAV unchanged).
- **Профиль = account hub:** absorb every hamburger destination (История, Аналитика [shipper], Настройки, Вход и безопасность, Поддержка, Оферта, Выйти) as rows. Then the `LogoMenu` hamburger can be removed without orphaning anything. Notifications bell stays in header.
- Bottom nav spec: 56px, 24px icon + always-on 12px label, active = indigo icon+label + faint tint, top hairline, full-height hit area. Never icon-only. Guest nav mirrors member (browse-first, login in Профиль).

---

## 4. PER-SCREEN PRIMARY ACTION + PLACEMENT (all screens; ONE bottom-anchored 56px primary unless noted)
| Screen | Primary action | Notes / size fixes |
|---|---|---|
| CarrierFeed (Главная) | on-card «Принять»(2-tap)/«Откликнуться» 48px | dest 22, price 28, meta 14, chips 44; StatStrip tap-to-filter; header heart+lang; de-emphasize free-text search, chips primary |
| CargoDetail | sticky «Откликнуться»/«Принять цену» | high-emphasis secondary «Позвонить»(when engaged); price 28; «в картах» link |
| Name-price (bid) | sticky «Отправить» | numeric keypad value 20 tabular; base = numeric entry, +/- as nudge |
| ShipperOrders (Мои заказы, shipper home) | ＋ (create, in nav) | StatStrip tap-to-filter; cards to floors |
| OrderDetail (shipper) | per-offer «Выбрать» 48px + call btn | offer rows 16; rating mono; re-bid n/a here |
| CreateOrder | sticky «Опубликовать»/«Сохранить» | inputs 56px value 16; pickers/steppers, minimal free-text |
| MarketFeed (Рынок) / MarketOrder | browse (on-card «Смотреть» 48px) / «Создать похожий» | read-only; label the tab's research purpose |
| Deal (both) | **state×role sticky primary** — see §6 | move above fold; call = secondary top; log/claim in toggles below |
| Chat / ChatsList | send (fine) | bubbles 16, input 16 (no iOS zoom) |
| Rating | sticky «Отправить оценку» | stars large; **persist criteria+comment** |
| Мои рейсы (DealsScreen) | open a deal (row) | TripBuilder entry card; rows to floors |
| TripBuilder (Сборный рейс) | sticky «Взять рейс» (capacity-guarded) | cargo text 11→15; remove-X 44px; add-suggestion 48px |
| Favorites / GuestFavorites | open / sign-in | rows to floors |
| Profile (account hub) | — (list) | absorb hamburger rows; verification honest; toggles persist |
| CarrierProfile / ShipperProfile | «Позвонить»/«Написать» primary here (profile = contact screen) | per §5 matrix |
| Analytics | «Назад» | drop fake 96% metric or label «прогноз» |
| Settings / Security | — (list) | toggles persist in mock; language row → real selector; currency honest |
| History | — (list) | drop fake 4.8 or compute |
| Onboarding | one CTA per step | inputs 56px; language on first screen; link Terms at consent; remove dead «Забыли пароль» (SMS auth) |
| Terms | «Назад»/«Принять» | reachable from consent + Профиль |

---

## 5. CONTACT-REVEAL PII MATRIX (the liquidity fix — precise)
Rule: the app introduces; masking lifts only within an **engaged order context**, scoped to that order. `tel:` uses the mock phone (fake numbers). Call = **high-emphasis secondary** on cargo/deal screens; **primary** only on the profile screens.
| Context | Shipper sees carrier # | Carrier sees shipper # | Chat |
|---|---|---|---|
| Guest (not logged in) | masked | masked | gated → sign in |
| Carrier browsing, no offer yet | n/a | **masked** (no pre-bid reveal) — a 1-tap «Уточнить» opens a limited pre-bid question thread instead | pre-bid «Уточнить» only |
| Carrier offer pending/countered on order | **reveal** (this carrier only) | **reveal** (this shipper) | in-deal chat still gated to deal; «Уточнить» thread available |
| Offer rejected/expired | re-mask (no longer engaged) | re-mask | closed |
| Deal exists (accepted…completed) | reveal | reveal | full in-app chat |
Shipper sees the number **only of carriers who bid** (not a global list), and only while that offer is live. Real-app note: revealing on unilateral bid is a PII exposure (bid-to-harvest risk) — scope strictly to the live offer; a masked-relay call is the future hardening. Non-guarantor posture preserved (parties transact off-platform).

Fix all 5 dead call/chat surfaces: cargoDetail, order-detail offers, DealScreen, CarrierProfile, ShipperProfile.

---

## 6. DEAL SCREEN — sticky primary by (status × role)
Move the ONE action to a sticky bottom bar; demote log/claim/anti-переуступка into toggles; call = secondary at top.
| deal.status | Carrier primary | Shipper primary |
|---|---|---|
| accepted | **«Забрал груз»** (2-tap confirm, color+label) | — (waiting note; secondary «Отменить» pre-pickup; call/chat) |
| picked_up | secondary row: «Прошёл границу»(optional) + «Фото выгрузки»(optional); **primary «Доставил груз»** (2-tap) | — (waiting; call/chat) |
| at_border | **«Доставил груз»** | — (waiting) |
| delivered | — (waiting for confirm) | **«Подтвердить получение»** |
| completed | «Оценить» | «Оценить» |
| cancelled | — | — |
Only «Доставил» is the sticky primary in the deliver state; граница + фото are a quieter secondary row above it. Status taps commit **optimistically** to local/deal state (real-app contract: never block the driver's tap on the network — show «отправится при связи», never spin/error on a dead zone).

---

## 7. PERSISTENCE / TYPE ADDITIONS (name them, not just behavior)
- `Order.ratedCriteria?: string[]`, `Order.ratedComment?: string` — persist rating detail (was discarded).
- `deal.podPhoto?: boolean` (mock) — POD photo attached flag survives navigation (was local state).
- Re-bid: allow re-submitting an offer after `rejected`/`expired` (clear the dead-end that hides the bid panel).
- ≈₸: one hardcoded constant in `lib/cn-kz/` (e.g. `USD_TO_KZT ≈ 500`), rendered muted with `≈` + a static «курс ориентировочный · оплата в USD». Never styled as the payable figure. (Real app: maintained/cached daily constant, never a paid FX call.)

---

## 8. LANGUAGE (batch 6 — real toggle, honest scope)
- Real, **persistent** РУС/ҚАЗ/中文 selector on the **first onboarding screen + header** (not buried in Settings).
- **KZ fully covers the carrier core path end-to-end** (nav + feed + cargo detail + bid + deal/status + rating) so the driver has a complete, self-contained Kazakh experience — no mid-flow language mixing on the path that matters.
- **中文 covers the shipper hero/nav** as a demonstration. Everything else **falls back to RU**.
- Mechanism: a tiny `t()` dictionary keyed to the covered strings; RU is the base/fallback.
- ⚠️ **KZ/ZH copy needs native review before real launch** — the wireframe proves the design (language is a first-class control); the full dictionary lives in the real Expo app (react-i18next ru/kz/zh). Do not ship machine-quality copy as final.

---

## 9. DONE = 
Build+typecheck clean · every driver surface: one bottom primary, ≥44px targets, ≥16px body / ≥14px meta, no dead controls · contact works per §5 · DealScreen action reachable per §6 · rating/POD persist · re-bid works · SOS+online-toggle gone · ≈₸ honest · language toggle real · adversarial per-screen recheck passes · screenshots confirm the density change.
