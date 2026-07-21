# CN-KZ — Visual Redesign «Тракт / Signal Dispatch» (2026-07-21)

Chosen by a 5-direction research + 3-judge panel (won 18 pts). A GENUINELY new visual language — the deliberate inverse of the retired dark-indigo-Linear "dev tool" look. **Skin changes; the finalized functionality + IA (docs/FINAL-SPEC.md) and driver-first floors stay.** Goal: read as a shipped premium consumer app a driver already trusts (inDrive / Kaspi / Bolt / Yandex Pro energy).

## The leap (what changes vs the old dark Linear)
| axis | OLD (retired) | NEW «Тракт» |
|---|---|---|
| theme | dark onyx #08090a | **light warm paper #FBF9F6** |
| accent | cold indigo #5e6ad2 | **signal-orange #EA4E1B** (hi-vis, rationed) |
| elevation | 1px graphite borders | **soft warm shadows, borderless white cards** |
| radius | sharp 6px | **generous 16–20px** (pills fully round) |
| type | Inter + Geist Mono (tool) | **Golos Text** (Cyrillic humanist, consumer) |
| numerals | monospace "tool" | bold **tabular sans** |

## Tokens (light = default `:root`)
```
--background: #FBF9F6   /* warm paper canvas */
--card:       #FFFFFF   /* white cards float via shadow, not borders */
--foreground: #14110E   /* warm ink ~16:1 */
--muted-foreground: #6B6560  /* AA secondary */
--border:     #ECE7E1   /* warm hairline (dividers/inputs only) */
--brand:      #EA4E1B   /* THE hero: primary CTA, active nav, focus, price emphasis */
--brand-strong:#C23D12  /* pressed */
--brand-tint: #FDEDE7   /* 12% wash: selected card / active nav pill / quiet emphasis */
--success:    #12925A   /* accept/deal fill, Доставлен/Завершено */
--warn:       #B7791F   /* amber text + #F6C453 dot, tint bg — in-transit/attention (never a fill) */
--info:       #2563C9   /* neutral/published status */
--destructive:#D22F2F   /* cancel/claim — dot + text ONLY, never a fill */
--primary = --brand; --ring = --brand; --success-strong: #0E7A4B
```
Night variant (`.dark`, optional): `--background #14120F`, `--card #1F1C18`, ink `#F7F4F0`, `--border #2A2621`; same orange hero, same rounding.

## Type — Golos Text (next/font/google, weights 400/500/600/700/800, cyrillic+latin), tabular-nums on all numbers
Keep the LOCKED driver scale, re-skinned: `.t-display` 32/800 tnum (price) · `.t-h1` 24/800 -.02em · `.t-h2` 20/700 (route/destination) · `.t-h3` 17/600 · `.t-body` 16/400–500 · `.t-body-strong` 16/600 · `.t-meta` 14/500 · `.t-eyebrow` 12/700 +.04em UPPERCASE. Floor holds: read text ≥14px; nav labels 12px exempt (icon+word). Geist Mono ONLY for raw IDs.

## Radius — base 16px. badges 8 · inputs/secondary/primary 14 · cards 20 · sheets 24 (top) · chips/pills/avatars/FAB fully round. Concentric; cards capped 20.

## Elevation — soft warm shadows, NO card borders
- card rest: `0 1px 2px rgba(20,17,14,.04), 0 6px 16px -8px rgba(20,17,14,.10)`
- selected/your-offer/accepted card: 1.5px `--brand` ring + `--brand-tint` bg (no shadow bump)
- sticky bottom-CTA: paper gradient fade up + subtle top shadow
- nested/quiet block: `--brand-tint` or faint `#F4F1EC` inset, no shadow
- 8px grid · 16px card padding · 16px gutters

## Components
- **CARD**: white, rounded-20, soft warm shadow, 16px pad, whole card pressable (active:scale-.98). Status Badge top. **Route-rail hero**: origin→dest with a dotted connector + two terminal dots (orange origin, ink destination), route text `.t-h2`. Price `.t-display` ink + muted ≈₸ line. Meta row 14/500. **Real 48px action button** at bottom (never a bare chevron).
- **PRIMARY BUTTON**: 56px, full-width, **rounded-full (pill)**, `--brand` fill, white 17/700, soft orange glow `0 6px 16px -6px rgba(234,78,27,.45)`, active:scale-.97 + `--brand-strong`. Exactly ONE per screen, bottom sticky bar + safe-area. **ACCEPT** = `--success` green pill, two-tap confirm (color+label change).
- **SECONDARY**: 48px, white fill, 1.5px `--border`, ink 16/600, rounded-14.
- **BOTTOM NAV**: white, 64px + safe-area, top hairline + soft upward shadow, 4 tabs; active = orange filled icon + orange 12px label on a `--brand-tint` pill; inactive muted; labels always.
- **STATUS BADGE**: rounded-8, 12%-tint bg, 8px dot + icon + WORD (13–14/600) in status color; never full fill / never color-alone; danger = red dot+text no bg.
- **INPUT**: 56px, rounded-14, white, 1.5px `#DED8D1` border, 16px ink, floating meta label, focus = 2px orange ring.

## Grafted from runners-up (the "finished app" kit)
- **Route-rail motif** reused on card / cargo-detail / deal-timeline — the signature brand device.
- **Completeness**: warm circular avatars, **illustrated empty states**, **warm shimmer skeletons**, duotone cargo icons — push from "themed" to "shipped".
- One orange rationed to the single action per screen; tabular-nums everywhere.

## Migration hazards (must sweep)
Old code has dark-mode hardcodes that will fight the light theme: `text-white` on non-orange buttons, `bg-secondary`, `.surface-glass` dark shadow/border, literal `bg-amber-500/10`, `text-[#...]`, `border-brand/…` indigo assumptions. The token flip fixes token-based styles; hardcoded dark classes must be swept per screen and re-verified by SCREENSHOT.
