# CN-KZ — Design System

> Derived from the **Raycast** style on [refero.design](https://styles.refero.design/style/3b6a17f0-3bdf-418c-a95e-0b89e5a8b2f8), adapted to CN-KZ. Pairs with the **make-interfaces-feel-better** skill (`.agents/skills/`) — that skill is the micro-polish layer (radii, tabular-nums, scale-on-press, shadows-over-borders); this doc is the macro visual language (palette, type, spacing, elevation).
>
> Aesthetic: **"obsidian command terminal"** — near-black canvas, charcoal surfaces floating on it, depth from layered monochrome shadows (not borders or colored backgrounds). Utilitarian, precise — fits a logistics tool.

## Adaptation notes (where CN-KZ differs from stock Raycast)
- **Accent = indigo `#5e6ad2`** (light) / acid-lime `#e4f222` (dark) — the shipped "Linear midnight" identity, rationed to actions & active states. This is the CANONICAL brand (decided 2026-07-12). It replaced an earlier green/"Bolt" idea — the green spec is kept below only as historical reference, not current truth.
- **Font = Inter** (`--font-sans`). Two-register idea stays: tight tracking on big headings, normal on body.
- **One green token** `--success` (#10b981) is reserved for the single positive/accept action (carrier quick-accept) — it is NOT a general accent.
- Everything else (surfaces, shadows, radius discipline, spacing) follows the Raycast structural principles below.

## Color tokens
```
/* Canvas & surfaces — near-black, neutral (no warm/cool tint) */
--canvas:        #040506   /* outermost background */
--surface-1:     #07080a   /* deep charcoal */
--surface-2:     #111214   /* graphite 700 — cards */
--surface-3:     #1b1c1e   /* graphite 600 — raised/hover */

/* Text */
--text:          #ffffff   /* primary */
--text-2:        #9c9c9d   /* secondary */
--text-3:        #6a6b6c   /* tertiary / metadata */

/* Brand (CN-KZ green) — CTAs, prices, active, accent */
--brand:         oklch(0.74 0.17 152)   /* ≈ #25b06a */
--brand-fg:      oklch(0.2 0.03 152)    /* dark text on green */

/* Semantic status */
--ok:            #59d499   /* mint — success/delivered */
--warn:          #f5b545   /* amber — bidding/in-transit */
--info:          #5aa9f5   /* sky — published */
--danger:        #ff6363   /* ember — cancelled/claim (status only, never big fills) */
--border:        rgba(255,255,255,0.08)
```

## Typography (Manrope)
- Display / headings: tight tracking (`-0.02em` at ~20px, tighter as size grows). `text-balance` on headings.
- Body / UI: normal tracking, 12–16px.
- Metadata / badges: small (11–12px), can use slightly positive tracking.
- Dynamic numbers (prices, weights, counts, clock): **`tabular-nums`** always.
- Root: `-webkit-font-smoothing: antialiased`.

## Spacing
- Base unit **8px**. Card padding **16px** (mobile; Raycast uses 24 on desktop). Element gaps 8–16px. Screen padding 16px.

## Border radius (never exceed 20px on cards)
```
--r-badge:  6px
--r-control: 8px   /* inputs, small buttons */
--r-card:   12px   /* list cards (we use rounded-xl ≈ 12) */
--r-modal:  16px
--r-card-lg: 20px  /* big tiles, phone-frame inner */
/* pills (chips, FAB): fully rounded */
```
Concentric rule (from the skill): outer radius = inner radius + padding.

## Elevation — shadows, not borders
Depth comes from **layered monochrome shadows** (black + white only, never tinted). Use a subtle ring (`ring-1 ring-white/8`) for separation on flat lists; use the **keyboard-key shadow** on pressable/raised elements for tactility:
```
/* pressable / raised element ("keyboard key") */
box-shadow:
  rgba(0,0,0,0.4)  0px 1.5px 0.5px 2.5px,
  rgb(0,0,0)       0px 0px   0.5px 1px,
  rgba(0,0,0,0.25) 0px 2px   1px   1px inset,
  rgba(255,255,255,0.2) 0px 1px 1px 1px inset;
```

## Interaction (correlates with the skill)
- **Scale on press**: buttons `active:scale-[0.96]`, large cards `active:scale-[0.98]`.
- Transitions: specify exact properties (`transition-[scale,box-shadow]`), never `transition: all`.
- Enter animations: split + stagger ~100ms; exits subtle.

## Do / Don't
**Do:** near-black neutral surfaces only · layered black/white shadows for depth · green for CTA/price/active · `tabular-nums` on all live numbers · concentric radii · scale-on-press.
**Don't:** colored section backgrounds · radius > 20px on cards · tinted (slate/zinc) near-blacks · `#ff6363` for buttons/large fills (status dots only) · `transition: all` · pure-white button fills.

## Current state vs target — READ THIS FIRST
⚠️ **The shipped code does NOT implement the green/Manrope system described above.** As of now (`app/globals.css`, `app/layout.tsx`) the wireframe ships a **"Linear midnight" theme**, not the Raycast/green one:
- **Accent:** indigo `--brand: #5e6ad2` (light `:root`) / acid-lime `#e4f222` (`.dark`) — NOT green `#25b06a`.
- **Font:** **Inter** (via `--font-sans`) — NOT Manrope.
- **Radius:** `--radius: 0.375rem` (6px, sharp) — the code favours crisp corners + 1px borders over the shadow-elevation model above.
- **Success/accept:** the carrier quick-accept button uses a dedicated green token `--success` (#10b981) — the one green in the shipped system.
- Surfaces are near-black (`#08090a` canvas, `#0f1011` cards) with `--border` separation.

**Brand decision (2026-07-12): indigo/Linear is canonical.** The green/"Bolt" spec is retired to historical reference. **Build every component against the shipped `globals.css` tokens (indigo `--brand`, `--success` green only for accept).**
