<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CN-KZ project

This repo is **CN-KZ** — a cross-border freight marketplace, China → Kazakhstan (route Хоргос → KZ cities). Two roles: **Шипер** (publishes cargo orders) and **Перевозчик** (browses feed, makes offers). UI in Russian. Bidding is inDrive-style (Name your price + 1 counter + 15-min confirm).

**Read the full product spec before building features:** [docs/PRD.md](docs/PRD.md) — covers all 10 MVP features, edge cases, and backlog. Authoritative source is the Notion "CN-KZ" page; `docs/PRD.md` mirrors it for in-repo access.

**Design:** follow [docs/REDESIGN-SPEC.md](docs/REDESIGN-SPEC.md) (authoritative) + [docs/DESIGN.md](docs/DESIGN.md). Canonical theme (decided 2026-07-21) is **«Тракт / Signal Dispatch»**: a warm-paper LIGHT canvas `#FBF9F6`, white cards floating on soft warm shadows (no 1px borders), ONE signal-orange `#EA4E1B` accent rationed to the single action per screen, **Golos Text** (Cyrillic humanist), 14–24px radius scale, `--success` green for accept only, tabular-SANS numbers. Build every component against the shipped `app/globals.css` tokens. (The prior dark "Linear midnight" indigo/Inter theme is RETIRED — see DESIGN.md.) Pair with the **make-interfaces-feel-better** skill in `.agents/skills/` for micro-polish (tabular-nums, scale-on-press, concentric radii, shadows-over-borders).

Current state: a front-end **wireframe** (mock data, no backend) at `/` (`components/cn-kz/`, `lib/cn-kz/`). Run with `bun run dev`.
