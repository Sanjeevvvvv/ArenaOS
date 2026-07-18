# ArenaOS

> The AI Operating System for the World's Smartest Stadiums.
> Built for the FIFA World Cup 2026 GenAI Challenge — Challenge 4: Smart Stadiums & Tournament Operations.

**Live demo:** https://arena-os-ochre.vercel.app/
**Repository:** https://github.com/Sanjeevvvvv/ArenaOS
**LinkedIn post:** https://www.linkedin.com/posts/sanjeev-pranay_fifa2026-genaichallenge-nextjs-ugcPost-7482479530...

---

## Problem Statement Alignment

**Challenge 4: Smart Stadiums & Tournament Operations** calls for an AI-powered system that unifies fans, volunteers, stadium staff, security teams, and organizers into one intelligent operational ecosystem for the tournament. ArenaOS is built directly against that brief — a Stadium Operating System with four distinct, role-gated personas rather than one shared dashboard:

| Persona | Route | Sees | User need it solves |
|---|---|---|---|
| Fan | `/fan` | Navigation, concessions, transit, accessibility requests | Fans lose time and get lost in unfamiliar stadiums; accessible routing and wait-time visibility are offered by default |
| Staff | `/operations` | Zone tasks — cleaning, restocking, assistance requests | Gives ground staff a live, assigned task queue instead of relying on radio/paper handoffs |
| Security | `/command` | Live incident feed, crowd density, escalation controls | Cuts the latency between an incident occurring and a coordinated response |
| Organizer | `/organizer` | Cross-zone KPIs, environmental/sustainability metrics, full incident and task oversight | Gives tournament organizers one real-time operational picture instead of five disconnected tools |

**Generative AI usage (required by the challenge):** ArenaOS uses the Gemini API for natural-language queries in the AI copilot (`src/lib/gemini.ts`), called through a server-side Next.js API route (`/api/gemini`) — the Gemini API key is never present in any client-side bundle.

---

## Try It — Role Access

Each persona route is protected by role, not just hidden by UI. To try each one on the live demo, sign in with an email containing the relevant keyword (any non-empty password works — this is a demo-mode mock auth, see Security section below):

| Email pattern | Role assigned | Can access |
|---|---|---|
| `anything@example.com` (no keyword) | `fan` | `/fan` only |
| `staff@example.com` | `staff` | `/operations` |
| `security@example.com` | `security` | `/command` |
| `organizer@example.com` | `organizer` | `/organizer`, `/command`, `/operations` (full access) |

Visiting a protected route without the required role redirects to `/` — this is enforced server-side in `src/proxy.ts`, not just hidden client-side.

---

## Code Quality

- Strict TypeScript throughout — zero `any` (`grep -rn ": any" src/ | wc -l` → `0`)
- Feature-based architecture: business logic isolated in `src/features/*` and `src/store/`; route files in `src/app/` are thin composition layers only
- Shared logic centralized in `src/hooks/` and `src/lib/utils/` — no duplicated logic across features
- ESLint + Prettier configured; `npm run lint` passes with zero errors and zero warnings
- Every exported function, hook, and component documented with a short TSDoc comment

## Security

- **Route-level access control:** `src/proxy.ts` enforces role-based access to `/command`, `/operations`, and `/organizer` via an explicit allow-list per route, redirecting unauthorized roles rather than silently permitting access
- The active role is synced to a cookie (`arena_user_role`) at sign-in/sign-out in `src/lib/supabase.ts`, since edge proxy logic cannot read `localStorage`
- **Data-layer access is scoped in parallel:** the mock Supabase client's `from()` derives the current role from the session and applies table-level authorization checks (e.g. `security_logs` requires `security` or `organizer`; `financial_kpis` requires `organizer`), mirroring the access-control pattern a production deployment would enforce via real Supabase Row-Level Security policies
- Gemini API key never exposed client-side — all AI calls proxied through the server-side `/api/gemini` route handler
- `.env.example` committed with placeholder values only; real secrets are gitignored

**Security hardening note:** an earlier version of the route guard (then `middleware.ts`) logged the active role on protected routes without actually enforcing it — any role could pass through. This was identified during review and corrected in `src/proxy.ts` to genuinely redirect unauthorized access before this submission, alongside migrating off the deprecated `middleware.ts` convention (Next.js 16 requires `proxy.ts`).

**On the mock backend:** this build uses a high-fidelity in-memory/`localStorage` mock of the Supabase client (`MockSupabaseClient` in `src/lib/supabase.ts`) rather than a live Supabase project, so the app is fully self-contained and demoable with zero external service dependencies. The mock's method signatures, auth flow, and role-scoped query behavior are designed to map directly onto a real Supabase client and real RLS policies with no changes to calling code — swapping in real credentials in `.env.local` is the only change needed for a production backend.

## Efficiency

- Simulated real-time updates via a client-side interval-driven Zustand store (`simulateTick` in `src/store/`), architected to map directly onto Supabase Realtime subscriptions in a production deployment
- Expensive/visual components lazy-loaded via `next/dynamic` where applicable
- Lighthouse Performance score: `[paste score here]`

## Testing

- Unit tests: Vitest + React Testing Library, `src/tests/` — run via `npm test`

## Accessibility

- WCAG 2.1 AA minimum across all surfaces
- Full keyboard navigation with visible focus states
- No information conveyed by color, motion, or sound alone

---

## Architecture

```
Client (PWA) — Next.js 16 App Router
├── Persona routes: /fan  /operations  /command  /organizer
│   └── Guarded server-side by src/proxy.ts (role allow-list per route)
├── Feature modules (navigation, crowd/alerts, tasks, transit, sustainability)
└── Shared layer (store/, hooks/, lib/, components/)
        │
        ├── Mock Supabase client (src/lib/supabase.ts) — auth + role-scoped mock data,
        │   designed as a drop-in swap for a real Supabase project
        ├── Gemini API — reached only via the server-side /api/gemini route handler
        └── Custom stadium map component (Canvas/SVG-based, no external map SDK)
```

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS · Framer Motion · React Query · Zustand · React Hook Form + Zod · Recharts · Gemini API · Deployed on Vercel

---

## Running Locally

```bash
git clone https://github.com/Sanjeevvvvv/ArenaOS
cd ArenaOS
npm install
cp .env.example .env.local   # add your own Gemini API key; Supabase vars are optional (mock client is used if absent)
npm run dev
```

Open `http://localhost:3000` to view it.

## Environment Variables

```
GEMINI_API_KEY=                       # server-side only — used inside /api/gemini, never exposed to the client
NEXT_PUBLIC_SUPABASE_URL=             # optional — falls back to the in-memory mock client if unset
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # optional — falls back to the in-memory mock client if unset
```

---

## Built By

Built solo by **[Sanjeevvvvv](https://github.com/Sanjeevvvvv)** for the FIFA World Cup 2026 GenAI Challenge, Challenge 4: Smart Stadiums & Tournament Operations.
