<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CN-KZ project

This repo is **CN-KZ** — a cross-border freight marketplace, China → Kazakhstan (route Хоргос → KZ cities). Two roles: **Шипер** (publishes cargo orders) and **Перевозчик** (browses feed, makes offers). UI in Russian. Bidding is inDrive-style (Name your price + 1 counter + 15-min confirm).

**Read the full product spec before building features:** [docs/PRD.md](docs/PRD.md) — covers all 10 MVP features, edge cases, and backlog. Authoritative source is the Notion "CN-KZ" page; `docs/PRD.md` mirrors it for in-repo access.

**Design:** follow [docs/CLONE-SPEC.md](docs/CLONE-SPEC.md) (authoritative). Canonical theme (decided 2026-07-22) is **«Signal»** — a 1:1 replication of inDrive's in-app design SYSTEM in CN-KZ's own identity (chosen by pixel research + a unanimous 3-judge panel; CN-KZ IS an inDrive-style bidding product): **pure-white surfaces**, ONE **signal-lime `#C0F03C`** accent with **BLACK `#141414` text on it** (never white-on-lime), rationed to the single action/screen; flat cards on **gray gutters** (`#F2F2F2`, no borders/heavy shadows); **Manrope** (display/price, heavy) + **Inter** (body); PRICE-IS-HERO (32/800 tabular); 12–24px radii; blue-origin/lime-destination **route rings**; green `#1E9E57` for accept/status only. Anti-empty rules (spec grids, stat strips, dense 6+-atom cards, peeking lists, illustrated empty states). Build every component against the shipped `app/globals.css` tokens. (Prior themes — dark indigo "Linear", warm-paper "Тракт" — are RETIRED.) Pair with **make-interfaces-feel-better** for micro-polish.

Current state: a front-end **wireframe** (mock data, no backend) at `/` (`components/cn-kz/`, `lib/cn-kz/`). Run with `bun run dev`.
