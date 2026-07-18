# ArenaOS

> The AI Operating System for the World's Smartest Stadiums.
> Built for the FIFA World Cup 2026 GenAI Challenge — Challenge 4: Smart Stadiums & Tournament Operations.

**Live demo:** https://arena-os-ochre.vercel.app/
**Repository:** https://github.com/Sanjeevvvvv/ArenaOS
**LinkedIn post:** https://www.linkedin.com/posts/sanjeev-pranay_fifa2026-genaichallenge-nextjs-ugcPost-7482479530...

---

## Problem Statement Alignment

**Challenge 4: Smart Stadiums & Tournament Operations** calls for an AI-powered system that unifies fans, volunteers, stadium staff, security teams, and organizers into one intelligent operational ecosystem for the tournament. ArenaOS is built directly against that brief — not as a general sports app, but as a Stadium Operating System purpose-built for tournament-scale operations:

| Challenge requirement | ArenaOS feature | User need it solves | Where in this repo |
|---|---|---|---|
| AI Navigation | Gemini-powered wayfinding, accessible-route-first by default | Fans lose time and get lost in unfamiliar stadiums; accessible routing is offered by default, not as an afterthought toggle | `src/features/navigation/` |
| Crowd Intelligence | Real-time density visualization, threshold-based alerting | Prevents dangerous bottlenecks by surfacing rising density to staff before it becomes a safety risk, not after | `src/features/crowd-intelligence/` |
| AI Command Center | Unified ops dashboard — live map, incident feed, KPIs, AI-generated insight | Organizers and security currently coordinate via radio/paper; this gives one shared real-time operational picture | `src/features/command-center/` |
| Emergency Response | Auditable incident lifecycle with real-time escalation | Cuts the latency between an incident occurring and a coordinated response, with a full audit trail | `src/features/emergency-response/` |
| Accessibility | Mobility/sensory/hearing assistance requests as a first-class feature | Accessibility needs are met by default in the core flow, not buried behind a settings menu | `src/features/accessibility/` |
| Transportation | Live shuttle/transit tracking with ETA and capacity | Reduces fan uncertainty and staff strain around last-mile logistics at tournament scale | `src/features/transportation/` |
| Sustainability | Resource and waste-tracking dashboard | Supports a lower-impact, more sustainable tournament operation, visible to both fans and staff | `src/features/sustainability/` |
| Real-time Analytics & AI Decision Support | Cross-feature analytics with natural-language AI summaries | Gives organizers a recommendation, not just a chart — faster decisions under time pressure | `src/features/analytics/` |

**Generative AI usage (required by the challenge):** ArenaOS uses the Gemini API for (1) natural-language navigation queries in the AI Navigation copilot, and (2) generating operational recommendations in the Command Center's AI Insight card — both are called exclusively through a server-side Supabase Edge Function (`supabase/functions/ai-proxy/`), never directly from the client.

---

## Code Quality

- Strict TypeScript throughout — zero `any` (`grep -rn ": any" src/ | wc -l` → `0`)
- Feature-based architecture: business logic isolated in `src/features/*`; route files in `src/app/` are thin composition layers only
- Shared logic centralized in `src/hooks/` and `src/lib/utils/` — no duplicated logic across features
- ESLint + Prettier configured; `npm run lint` passes with zero errors and zero warnings
- Every exported function, hook, and component documented with a short TSDoc comment

## Security

- Row-Level Security (RLS) enforced on every Supabase table, scoped by `role` and `stadium_id` — see `supabase/migrations/`
- Gemini API key never exposed client-side — all AI calls proxied through `supabase/functions/ai-proxy/`
- Supabase Auth with JWT role claims, validated in both `middleware.ts` (route protection) and RLS (data protection)
- `.env.example` committed with placeholder values only; real secrets are gitignored

## Efficiency

- Real-time data via Supabase Realtime subscriptions, not polling (`src/hooks/useRealtimeChannel.ts`)
- Expensive components (Mapbox, Recharts) lazy-loaded via `next/dynamic`
- Lighthouse Performance score: `[paste score here]`

## Testing

- Unit tests: Vitest/Jest + React Testing Library, `tests/unit/` — run via `npm test`
- E2E smoke tests: Playwright, `tests/e2e/` — run via `npm run test:e2e`

## Accessibility

- WCAG 2.1 AA minimum across all surfaces
- Full keyboard navigation with visible focus states
- No information conveyed by color, motion, or sound alone

---

## Architecture

```
Client (PWA) — Next.js 15 App Router
├── Route groups (fan, volunteer, staff, security, organizer) — composition only
├── Feature modules (navigation, crowd-intelligence, command-center,
│   emergency-response, accessibility, transportation, sustainability, analytics)
└── Shared layer (ui/, hooks/, lib/, stores/, types/)
        │
        ├── Supabase — Postgres + RLS, Auth, Realtime, Edge Functions
        ├── Gemini API — reached only via Supabase Edge Function proxy
        └── Mapbox GL — client-side map rendering
```

**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Framer Motion · React Query · Zustand · Supabase (Postgres, Auth, Realtime, Edge Functions) · Gemini API · Mapbox GL · Recharts · React Hook Form + Zod · Deployed on Vercel

---

## Running Locally

\`\`\`bash
git clone https://github.com/Sanjeevvvvv/ArenaOS
cd ArenaOS
npm install
cp .env.example .env.local   # add your own Supabase and Mapbox keys
npm run dev
\`\`\`

Open \`http://localhost:3000\` to view it.

## Environment Variables

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_TOKEN=
GEMINI_API_KEY=          # server-side only — used inside Supabase Edge Functions, never exposed to the client
\`\`\`

---

## Built By

Built solo for the FIFA World Cup 2026 GenAI Challenge, Challenge 4: Smart Stadiums & Tournament Operations.
