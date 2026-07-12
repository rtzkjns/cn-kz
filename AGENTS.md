<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# CN-KZ project

This repo is **CN-KZ** — a cross-border freight marketplace, China → Kazakhstan (route Хоргос → KZ cities). Two roles: **Шипер** (publishes cargo orders) and **Перевозчик** (browses feed, makes offers). UI in Russian. Bidding is inDrive-style (Name your price + 1 counter + 15-min confirm).

**Read the full product spec before building features:** [docs/PRD.md](docs/PRD.md) — covers all 10 MVP features, edge cases, and backlog. Authoritative source is the Notion "CN-KZ" page; `docs/PRD.md` mirrors it for in-repo access.

**Design:** follow [docs/DESIGN.md](docs/DESIGN.md). Canonical theme (decided 2026-07-12) is **"Linear midnight": indigo `#5e6ad2` accent (acid-lime in dark) + Inter**, near-black surfaces, sharp 6px radius, 1px borders, one green `--success` token for the accept action only. (The older green/Manrope idea is retired — see DESIGN.md "Current state".) Pair it with the **make-interfaces-feel-better** skill in `.agents/skills/` for micro-polish (tabular-nums, scale-on-press, concentric radii).

Current state: a front-end **wireframe** (mock data, no backend) at `/` (`components/cn-kz/`, `lib/cn-kz/`). Run with `bun run dev`.
