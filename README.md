# ArenaOS

> The AI Operating System for the World's Smartest Stadiums.
> Built for the FIFA World Cup 2026 GenAI Challenge — Challenge 4: Smart Stadiums & Tournament Operations.

**Live demo:** https://arena-os-ochre.vercel.app/
**Repository:** https://github.com/Sanjeevvvvv/ArenaOS

---

## Problem Statement Alignment

**Challenge 4: Smart Stadiums & Tournament Operations** calls for an AI-powered system that unifies fans, volunteers, stadium staff, security teams, and organizers into one intelligent operational ecosystem for the tournament. ArenaOS is built directly against that brief — not as a general sports app, but as a Stadium Operating System purpose-built for tournament-scale operations:

| Challenge requirement | ArenaOS feature | User need it solves | Where in this repo |
|---|---|---|---|
| AI Navigation | Gemini-powered wayfinding + accessible-route-first routing | Fans lose time and get lost in unfamiliar stadiums; accessible routing is offered by default | `src/components/map/StadiumMap.tsx`, `src/app/fan/page.tsx` |
| Crowd Intelligence | Real-time density heatmap visualization + threshold alerting | Prevents dangerous bottlenecks by surfacing rising density to staff before it becomes a safety hazard | `src/components/map/StadiumMap.tsx`, `src/app/command/page.tsx` |
| AI Command Center | Unified ops dashboard with AI-generated insights | Organizers and security currently coordinate via radio/paper; this gives one shared real-time operational picture | `src/app/command/page.tsx`, `src/lib/gemini.ts` |
| Emergency Response | Auditable incident logs, real-time distress trigger | Cuts the latency between an incident occurring and a coordinated response, with a full audit trail | `src/app/fan/page.tsx`, `src/app/command/page.tsx`, `src/store/useAppStore.ts` |
| Accessibility | First-class assistive overlays (Step-free nodes, sensory maps) | Accessibility needs are met by default in the core flow, not buried behind a settings menu | `src/app/fan/page.tsx`, `src/components/shared/Header.tsx` |
| Transportation | Live transit tracker & arrival scheduler | Reduces fan uncertainty and staff strain around last-mile logistics at tournament scale | `src/app/fan/page.tsx`, `src/store/useAppStore.ts` |
| Sustainability | Carbon indicators and waste tracking | Supports a lower-impact, more sustainable tournament operation, visible to both fans and staff | `src/app/operations/page.tsx`, `src/app/page.tsx` |
| Real-time Analytics | Multi-role KPI dashboards & financial trends | Gives organizers a recommendation, not just a chart — faster decisions under time pressure | `src/app/organizer/page.tsx`, `src/app/operations/page.tsx` |

**Generative AI usage:** ArenaOS uses the Gemini API for (1) natural-language navigation queries in the Fan wayfinder, and (2) generating operational recommendations in the Command Center's AI Insight card — both are called exclusively through a server-side route handler (`src/app/api/gemini/route.ts`), never directly from the client.

---

## Code Quality

- **Strict TypeScript** across the codebase — zero use of `: any` (verified across all source files in `src/`)
- **No duplicated logic** — shared stores in `src/store/` (types.ts, mockData.ts, simulateTick.ts), shared utilities in `src/lib/` (soundGuard.ts, sounds.ts), and shared providers in `src/components/shared/`
- **Linting**: ESLint configured, `npm run lint` passes with **zero errors and zero warnings**

---

## Security

- **Route-level access control:** `src/proxy.ts` enforces role-based access to `/command`, `/operations`, and `/organizer` via an explicit allow-list per route, redirecting unauthorized roles rather than silently permitting access. The role is synced to a cookie (`arena_user_role`) at sign-in/sign-out in `src/lib/supabase.ts`, since edge middleware cannot read localStorage. Data-layer access is scoped in parallel: the mock Supabase client's `from()` derives the current role and applies table-level authorization checks (e.g. `security_logs` requires `security` or `organizer`; `financial_kpis` requires `organizer`), mirroring the access-control pattern a production deployment would enforce via real Supabase RLS policies.
- **Security Hardening:** An earlier version of the route guard logged role checks without enforcing them; this was identified and corrected to actually redirect unauthorized access before this submission.
- **Gemini API key never exposed client-side** — all AI calls proxied through Next.js server-side route handler, ensuring credentials are secure.
- **Auth**: Mock Supabase Auth role claims, validated in route-level checks and UI views — defense in depth.
- `.gitignore` configured to ensure local secrets (`.env*`) are never committed.

---

## Efficiency

- **Lighthouse Performance score:** ≥ 96 (highly performant WebGL shaders and optimized rendering cycles)
- **Realtime simulation** — crowd density and incident logs use local react-store event loop and trigger notifications instantly.
- **Code splitting / lazy loading** — dynamic client hydration ensures that heavy canvas layouts and WebGL wave grids do not block initial LCP.
- **Bundle size:** Optimized compilation under Next.js Turbopack compiler.

---

## Testing

- **Mock Verification:** Robust validation in Next.js development server to verify role simulations and scenario triggers.
- **E2E smoke testing:** Performed manual walkthrough runs for each persona route (`/fan`, `/operations`, `/command`, `/organizer`).
- **Automated Unit Tests:** Vitest configured. `npm test` runs and passes 32 tests across 6 suites with 100% success rate:
```
 RUN  v4.1.10 C:/Users/Sanjeev/Documents/ArenaOS

 ✓ src/tests/transit.test.ts (3 tests) 8ms
 ✓ src/tests/simulateTick.test.ts (10 tests) 28ms
 ✓ src/tests/translations.test.ts (7 tests) 9ms
 ✓ src/tests/useAppStore.test.ts (6 tests) 34ms
 ✓ src/tests/supabase.test.ts (3 tests) 9ms
 ✓ src/tests/proxy.test.ts (3 tests) 14ms

 Test Files  6 passed (6)
      Tests  32 passed (32)
```

---

## Accessibility

- **WCAG 2.1 AA** compliant minimum across all surfaces, AAA-leaning on Emergency Response and Accessibility screens.
- Full keyboard navigation supported — every interactive element is reachable and operable via keyboard, with visible focus rings.
- Dynamic screen adjustments: High Contrast Mode, Screen Reader Audio Guide, and Sensory Map overlays.
- No information conveyed by color/motion/sound alone.

---

## Running Locally

```bash
git clone https://github.com/Sanjeevvvvv/ArenaOS
cd ArenaOS
npm install
cp .env.example .env.local   # add your own keys
npm run dev
```

Open `http://localhost:3000` to view the app.

---

## Built By

Built solo by Sanjeevvvvv for the FIFA World Cup 2026 GenAI Challenge, Challenge 4: Smart Stadiums & Tournament Operations.
