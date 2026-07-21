# CN-KZ — Visual System v3 «Signal» (2026-07-21) — inDrive-system replication

Chosen by pixel-precise research of 5 real apps + a unanimous 3/3 non-biased judge panel: **replicate inDrive's in-app design SYSTEM 1:1** (it IS an inDrive-style bidding product; CIS/driver-native; kills empty space with dense cards + hero price + one big action). Fill inDrive's two gaps (it's map+drawer, no feed/tabs) with **Kaspi's dense white-card feed + 5-tab bottom nav** and **Yandex's filter-chip row**. Supersedes «Тракт».

## What we replicate vs what stays ours
- **Replicate 1:1 (functional UI conventions):** layout composition, component dimensions, 4px spacing grid, radii, type hierarchy, the price-is-hero rule, offer-card & counter-chip patterns, route-block graphic, one-primary-action discipline, dense feed, bottom-nav spec, anti-empty devices.
- **Ours (brand identity — NOT copied):** CN-KZ's own logo/wordmark, its own **signal-lime** accent (below), its own copy. We do not reproduce any competitor's logo, wordmark, illustrations, or exact brand color.
- **Freight adaptation (deliberate deviation):** NO map-first layout for feed/detail/list — a live map reads as EMPTY for 300–3000km intercity freight (the opposite of the goal). Use dense content (Kaspi feed). A static **route-line** visual only; an optional small route strip on deal-tracking. Card metrics = freight facts (вес/кузов/объём/срок/км), not taxi distance/ETA.

## Palette (light, pure-white — the real in-app surface, NOT the dark marketing frame)
```
--background:  #FFFFFF   /* pure white canvas + card surface */
--card:        #FFFFFF
--foreground:  #141414   /* near-black ink — the loudest thing after price */
--muted-foreground: #94999D  /* secondary/meta */
--border:      #ECECEC   /* hairline divider (no shadows/borders on cards; gray gutters instead) */
--gutter:      #F2F2F2   /* Kaspi full-bleed gray band between white blocks (kills empty space, no borders) */
--secondary:   #F7F7F8   /* secondary-button + input fill */
--brand:       #C0F03C   /* CN-KZ SIGNAL LIME — the ONE accent, primary CTA + accept + agreed/active */
--brand-foreground: #141414  /* BLACK on lime — NEVER white-on-lime */
--brand-strong:#A6D82A   /* pressed */
--star:        #F7C649   /* gold rating stars */
--route-from:  #4087E1   /* origin dot (blue) */
--route-to:    #C0F03C   /* destination dot (lime) */
--success:     #1E9E57   /* delivered/completed status (distinct green, NOT the lime brand) */
--warn:        #E08A0C   /* in-transit/attention (amber, AA on white) */
--info:        #4087E1   /* published/neutral (route blue) */
--destructive: #EA3B2E   /* cancel/claim — dot+text only */
```
Night variant optional/deferred (ship light only — inDrive's real app is white).

## Typography — Manrope (display/price/titles, geometric grotesque, full Cyrillic) + Inter (body)
Numerals are the HEAVIEST element on every card/sheet. `tabular-nums` on all prices/weights/counts.
- `.t-price` PriceHero **32/800 -0.01em** Manrope tabular (the hero on every card & sheet)
- `.t-title` ScreenTitle **24/800 -0.02em** Manrope
- `.t-name` Card title / person name **17/700** Manrope
- `.t-metastrong` distance/km/срок **16/700** Manrope (right-aligned secondary metric)
- `.t-body` body/address **16/400–500** Inter
- `.t-label` secondary label **13/500** Inter #94999D
- button text **17/700** Manrope; chip text **16/700** Manrope; nav label **11–12/600**
Driver floor holds: read text ≥14px (nav 11–12 exempt = icon+word).

## Spacing — 4px base grid
screen H-padding **16** · card/sheet inner padding **16** · stacked-card gap **12** (with intentional peek) · name↔stars **8** · header-row↔price-row **12** · chip gap **12** · section gap **24** · sticky CTA sits **12–16px above safe-area**.

## Radii
cards/offer cards **20** · bottom-sheet top **24** · buttons + inputs **14** · counter/category chips **12** · avatars **full circle**. In-app buttons are rounded-RECT (14), NOT full pills.

## Components (exact)
- **PRIMARY CTA** = full-width (screen−16 each side), **h56 r14**, fill `--brand`, label `--brand-foreground` **17/700**, centered, carries the number ("Принять ₸45 000" / "Опубликовать заказ"). **Exactly ONE per screen, pinned 12–16px above safe-area.**
- **SECONDARY** = **h56 r14**, fill `--secondary`, `--foreground` **17/700** + 20px leading icon (Связаться/Помощь). No second accent color — hierarchy is lime-fill vs gray-fill.
- **OFFER / BID CARD** (the signature): white, **r20, pad16**. Row1 = [avatar **44** circle · name **17/700** · gold **14px** 5-star row 8px under] left; right-aligned [km **16/700 #141414** over срок **16/700 #94999D**]. Row2 (12px below) = price **32/800** bottom-left + "Принять" button (**h48 r12** lime, black **17/700**) bottom-right. Stack 12px gap; render 3–4 cards **peeking + fading** behind the top card to fill lower screen + signal volume.
- **NAME-YOUR-PRICE / ONE-COUNTER**: big lime "Принять ₸X" (h56), centered label "Своя цена" 13/500 #94999D, then ONE row of 3 equal lime quick-step chips (₸+/₸++/₸+++) **h48 r12** black 700, 12px gaps + a **15-мин** confirm countdown pill. This row IS the whole counter interaction (no free-text keypad as the primary path; keep an optional "Ввести свою" secondary).
- **ROUTE BLOCK** (every card + detail + create A/B inputs): origin **12px ring #4087E1** → **2px** vertical connector → destination **12px ring lime**; city/point 16/500 #141414, sub-address 13/500 #94999D to the right.
- **FEED CARD** (dense, 6+ atoms so none reads sparse): route block + **32/800 price** + meta chips (вес · кузов · срок) + gold trust row + green "Откликнуться"; tightly stacked, next card peeking.
- **FEED HEADER**: sticky white (route/region + filter glyph) → horizontal **filter-chip row** (cargo type: Все/Рефрижератор/Тент/Контейнер/Негабарит), chip **r12**, selected = lime fill + black 700/16, unselected = `--secondary` + #94999D.
- **BOTTOM NAV**: **h56–64**, white, **1px #ECECEC top hairline**, 24px icons over 11px labels, active `#141414` / inactive `#94999D`. **Keep lime OFF the nav** — reserve `--brand` strictly for the single per-screen CTA (active tab = black icon+label, not lime).
- **INPUTS**: **h56 r14**, fill `--secondary`, placeholder #94999D 16px, 20px leading glyph. Create-listing: A/B route inputs (route-dot pattern), LARGE price field + recommended-price hint, sticky "Опубликовать заказ".
- **STATUS BADGE**: keep dot+icon+WORD; recolor to status palette (success/warn/info/destructive + brand for agreed). On white use a soft tint or a small solid dot — never lime for status.
- **TRUST**: inline gold 5-star + a shield verification badge, reused verbatim for carrier & shipper.

## Anti-empty rules (the founder's explicit complaint)
Every screen is a dense sheet (never a bare canvas): every card packs **6+ data atoms**; the **32/800 price** anchors otherwise-empty space; a **lime quick-action chip row** fills the band under the primary CTA; lists render **peeking/fading** next cards; **empty states = centered flat truck illustration + one line + one lime primary**; use **gray-gutter bands** (`--gutter`) between white blocks instead of borders. Two-column spec grids (вес/объём/кузов/оплата) turn detail whitespace into a scannable table.

## Migration
Rebuild `app/globals.css` (tokens above), `app/layout.tsx` (Manrope+Inter). Restyle DNA: Button (lime primary/gray secondary), OfferCard, order-card (feed), StatusBadge, phone-frame nav (lime OFF nav), inputs, Chip (r12 lime-selected), the route-block + counter-chip components. Keep FINAL-SPEC functionality + driver floors. Then per-screen: fill empty space to the anti-empty rules. Then full i18n (ru/kz/zh everywhere + Settings toggle). ⚠️ Tailwind v4: edits to globals.css `@theme`/font need `rm -rf .next` + dev restart or CSS serves stale — verify computed styles in-browser.
