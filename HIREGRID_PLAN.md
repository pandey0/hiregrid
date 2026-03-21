# HireGrid — Complete Build Plan
> Last updated: March 2026 | Stack: Next.js 15 · Prisma · PostgreSQL · Better Auth · Tailwind CSS v4 · Resend · OpenAI

---

## 1. Vision

HireGrid is a **Supply Chain Engine for Hiring** — not a Kanban ATS. It balances two sides of a marketplace:

- **Supply** → Panelist/interviewer time slots
- **Demand** → Candidates who need to be interviewed

The system's primary goal is to surface and resolve capacity deficits before they create hiring bottlenecks.

---

## 2. Current State Audit

### ✅ Already Built
| Area | Status | Notes |
|---|---|---|
| Landing page | Done | Animated, polished dark UI with Framer Motion |
| Auth library setup | Done | Better Auth + Prisma adapter configured |
| Prisma schema (base) | Done | User, Org, Program, Round, Panelist, Applicant, Session, Account |
| Sign-in / Sign-up pages | UI only | Better Auth not wired to forms yet |
| Dashboard shell | Mock data | No real DB, session not used |
| Sidebar | Broken | References `auth.api.accountInfo` (doesn't exist), hardcoded programs |
| Onboarding page | Skeleton | Form present but no submit action, no org creation |
| Create Program page | Broken | References non-existent `@shared/schema`, `authService`, `apiRequest` |

### ❌ Not Built (Gaps)
| Area | Priority |
|---|---|
| Schema: ProgramPanelist pivot (magic links, assigned rounds, slots JSON) | P0 |
| Schema: Candidate model with ATS score + booking token | P0 |
| Auth: Sign-in/Sign-up wired to Better Auth API | P0 |
| Auth: Middleware route protection | P0 |
| Onboarding: Create org + ADMIN membership on first login | P0 |
| Program CRUD: Real DB-backed API routes | P0 |
| Panelist Engine: Magic link generation + `/availability/[token]` flow | P0 |
| Candidate Pipeline: CSV upload, individual add, ATS AI scoring | P1 |
| Control Tower: Supply vs Demand health view per round | P1 |
| Candidate self-booking: `/book/[token]` flow | P1 |
| Email system: Transactional emails (invite, reminder, booking confirmation) | P1 |
| Admin "God Mode": Recruiter inputs availability on panelist's behalf | P2 |
| One-click reminder emails | P2 |
| Feedback collection post-interview | P2 |
| Analytics dashboard: Pass rates, avg score, round completion | P3 |

---

## 3. Enhanced Tech Choices

| Concern | Current | Enhanced Choice | Reason |
|---|---|---|---|
| Emails | None | **Resend** | Modern, great DX, Next.js-native, free tier generous |
| AI Resume Scoring | None | **OpenAI GPT-4o** (structured outputs) | JSON mode for deterministic score + reason |
| File Upload | None | **UploadThing** | Native Next.js App Router support, S3-backed, type-safe |
| Data fetching | None wired | **TanStack Query v5** (already in deps on create-program page) | Optimistic updates, cache invalidation |
| Forms | Referenced but broken | **React Hook Form + Zod** (already partially present) | Type-safe, server action compatible |
| Server mutations | REST pattern (broken) | **Next.js Server Actions** | Eliminates boilerplate API routes for mutations |
| Scheduling UI | None | **react-big-calendar** or custom grid | Visual time block picker for availability |
| Tokens | None | **crypto.randomBytes** (Node built-in) | Secure, unguessable magic link tokens |
| Rate limiting | None | **Upstash Redis + Ratelimit** | Protect magic link endpoints from abuse |
| Observability | None | **Sentry** | Error tracking, session replays |

---

## 4. Revised Prisma Schema (Target)

> Current schema needs these additions and changes:

```prisma
// ─── ADDITIONS TO EXISTING SCHEMA ───────────────────────────────────────────

// ProgramPanelist: Pivot table linking a panelist to a specific program
model ProgramPanelist {
  id               Int       @id @default(autoincrement())
  programId        Int
  program          Program   @relation(fields: [programId], references: [id], onDelete: Cascade)
  userId           String    // the panelist's user ID (or null for external)
  externalEmail    String?   // for headless (no-account) panelists
  externalName     String?
  assignedRoundIds Int[]     // which rounds this panelist covers
  magicLinkToken   String    @unique
  magicLinkUsed    Boolean   @default(false)
  availableSlots   Json      @default("[]")  // [{start: ISO, end: ISO, booked: bool}]
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

// Candidate: Full applicant model replacing the thin Applicant model
model Candidate {
  id              Int              @id @default(autoincrement())
  programId       Int
  program         Program          @relation(fields: [programId], references: [id])
  organizationId  Int
  name            String
  email           String
  resumeUrl       String?          // S3 URL from UploadThing
  atsScore        Float?           // 0-100, set by AI
  atsReason       String?          // AI explanation
  status          CandidateStatus  @default(DRAFT)
  activeRoundId   Int?             // which round they are currently in
  bookingToken    String?          @unique
  bookingTokenExp DateTime?
  bookingRoundId  Int?             // round for which booking is pending
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

enum CandidateStatus {
  DRAFT        // just uploaded, not yet reviewed
  SHORTLISTED  // recruiter moved them in
  ACTIVE       // assigned to a round, pending booking
  BOOKED       // has a confirmed interview slot
  COMPLETED    // all rounds done
  REJECTED
}

// Booking: Confirmed interview slot between candidate and panelist
model Booking {
  id               Int              @id @default(autoincrement())
  candidateId      Int
  candidate        Candidate        @relation(fields: [candidateId], references: [id])
  programPanelistId Int
  programPanelist  ProgramPanelist  @relation(fields: [programPanelistId], references: [id])
  roundId          Int
  round            Round            @relation(fields: [roundId], references: [id])
  slotStart        DateTime
  slotEnd          DateTime
  status           BookingStatus    @default(SCHEDULED)
  feedback         String?
  score            Float?
  createdAt        DateTime         @default(now())
}

enum BookingStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}

// Add to Program model:
//   panelists    ProgramPanelist[]
//   candidates   Candidate[]
//   bookings     Booking[]          (via rounds/panelists)

// Add to Round model:
//   durationMinutes Int  (rename durationHours → durationMinutes for precision)
//   bookings        Booking[]
```

---

## 5. Route Map (Complete)

```
/                              → Landing page ✅
/sign-in                       → Better Auth sign-in ✅ (needs wiring)
/sign-up                       → Better Auth sign-up ✅ (needs wiring)
/onboarding                    → Create org, become ADMIN ⚠️ (skeleton)

── Protected (requires session + org) ──────────────────────────────────────
/dashboard                     → Overview: programs, quick stats ⚠️ (mock)
/dashboard/[programId]         → Control Tower for specific program ❌
/programs/create               → Create program + rounds ⚠️ (broken)
/programs/[id]                 → Program detail + round config ❌
/programs/[id]/panelists       → Panelist Manager ❌
/programs/[id]/candidates      → Candidate Inbox + pipeline ❌
/programs/[id]/control-tower   → Supply/Demand health view ❌
/profile                       → User settings ❌

── Magic Link flows (no auth required) ──────────────────────────────────────
/availability/[token]          → Panelist availability scheduler ❌
/book/[token]                  → Candidate self-booking ❌

── API Routes ───────────────────────────────────────────────────────────────
/api/auth/[...all]             → Better Auth handler ✅
/api/programs                  → GET list, POST create ❌
/api/programs/[id]             → GET, PATCH, DELETE ❌
/api/programs/[id]/panelists   → GET, POST invite panelist ❌
/api/programs/[id]/candidates  → GET, POST add/upload candidates ❌
/api/programs/[id]/shortlist   → POST bulk shortlist ❌
/api/candidates/[id]/score     → POST trigger AI scoring ❌
/api/availability/[token]      → GET token info, POST save slots ❌
/api/book/[token]              → GET available slots, POST confirm booking ❌
/api/reminders/panelist/[id]   → POST resend magic link email ❌
/api/upload                    → UploadThing endpoint ❌
/api/webhooks/email            → Optional: Resend delivery webhooks ❌
```

---

## 6. Build Phases

### Phase 0 — Foundation Fix (unblock everything)
> Goal: Auth works end-to-end, DB is correct, app doesn't crash.

- [ ] **0.1** Fix Prisma schema — add `ProgramPanelist`, `Candidate`, `Booking` models
- [ ] **0.2** Run `prisma migrate dev` to apply schema
- [ ] **0.3** Wire Better Auth to sign-in / sign-up forms (email + password)
- [ ] **0.4** Add Next.js middleware (`middleware.ts`) to protect `/dashboard` and below
- [ ] **0.5** Fix sidebar — remove broken `auth.api.accountInfo` call, use server component session
- [ ] **0.6** Fix create-program page — remove broken imports, rewrite with Server Actions
- [ ] **0.7** Onboarding flow — on submit: create `Organization`, create `OrganizationMember` (ADMIN role), redirect to dashboard

**Acceptance**: User can sign up → onboard → see a real (empty) dashboard.

---

### Phase 1 — Program & Round Management
> Goal: Recruiter can create and configure programs.

- [ ] **1.1** `POST /api/programs` Server Action — create program + rounds in one transaction
- [ ] **1.2** `GET /api/programs` — list org's programs with round count + candidate count
- [ ] **1.3** `/dashboard` — real data from DB, stats cards linked to real counts
- [ ] **1.4** `/programs/[id]` — program detail page with round list and edit capability
- [ ] **1.5** Round editor — add/remove/reorder rounds, set name + duration (in minutes)

**Acceptance**: Recruiter creates "Frontend Hiring" with 2 rounds, sees it on dashboard.

---

### Phase 2 — The Panelist Engine (Supply)
> Goal: Headless panelist system working end-to-end.

- [ ] **2.1** Panelist invite form — enter email + name + assign rounds → generates `magicLinkToken`
- [ ] **2.2** Store `ProgramPanelist` row in DB
- [ ] **2.3** Integrate **Resend** — send invite email with `/availability/[token]` link
- [ ] **2.4** `/availability/[token]` — public page, no auth required
  - Validate token, show program + round info
  - Time slot grid UI (custom or react-big-calendar)
  - **Smart Snapping**: force slot duration = round's `durationMinutes`
  - **Conflict detection**: block overlapping selections client-side
  - On save → `POST /api/availability/[token]` → store JSON in `ProgramPanelist.availableSlots`
- [ ] **2.5** Panelist Manager page `/programs/[id]/panelists`
  - Table: panelist name, email, assigned rounds, slot count, last active
  - Progress bar: slots provided vs slots needed
  - "Remind" button → resend magic link email
  - "Manage Time" (God Mode) → recruiter opens availability UI on panelist's behalf

**Acceptance**: Recruiter invites Alice → Alice gets email → opens link → adds 5 × 60min slots → recruiter sees 5 slots in panelist table.

---

### Phase 3 — Candidate Pipeline (Demand)
> Goal: Candidates enter the system, get scored, get shortlisted.

- [ ] **3.1** Integrate **UploadThing** — resume upload endpoint (PDF/DOCX)
- [ ] **3.2** Manual add candidate form (name + email + optional resume)
- [ ] **3.3** CSV bulk upload — parse CSV, validate rows, insert candidates as DRAFT
- [ ] **3.4** **AI Resume Scoring** via OpenAI GPT-4o structured output
  - Extract text from uploaded PDF/DOCX (use `pdf-parse` or `mammoth`)
  - Prompt: score 0-100 vs program description + round requirements
  - Store `atsScore` + `atsReason` on `Candidate`
  - Run as background Server Action (non-blocking)
- [ ] **3.5** Candidate Inbox (`/programs/[id]/candidates`)
  - Data-dense list view (NOT kanban)
  - Columns: Name, Email, ATS Score badge, Status, Actions
  - Filters: by status, by score range
  - Sort: by score desc (default)
  - Bulk select → "Shortlist & Invite" button
- [ ] **3.6** Shortlist action → set status to ACTIVE, assign `activeRoundId`, generate `bookingToken`, send booking email via Resend

**Acceptance**: Upload 10 resumes → all get scored → top 3 are shortlisted → 3 emails sent.

---

### Phase 4 — Candidate Self-Booking (Demand ↔ Supply)
> Goal: Candidates consume panelist time slots.

- [ ] **4.1** `/book/[token]` — public page, no auth required
  - Validate token + expiry
  - Show program name, round info, candidate name
  - Fetch available (unbooked) slots for the candidate's `activeRoundId`
  - Slot picker UI — list of times, click to select
  - On confirm → `POST /api/book/[token]`
    - Mark slot as booked in `ProgramPanelist.availableSlots`
    - Create `Booking` record
    - Update `Candidate.status` to BOOKED
    - Send confirmation emails to candidate AND panelist via Resend
- [ ] **4.2** Handle edge case: slot already taken (optimistic lock, redirect to re-pick)
- [ ] **4.3** Booking confirmation page — shows date/time, panelist name, calendar invite (.ics download)

**Acceptance**: Candidate clicks link → picks a slot → slot disappears from pool → both parties get confirmation email.

---

### Phase 5 — Control Tower (The Recruiter HQ)
> Goal: Full visibility, bottleneck detection, one-click interventions.

- [ ] **5.1** `/programs/[id]/control-tower` (or embed in program page)
- [ ] **5.2** Global program health card:
  - Total supply (all unbooked slots across all rounds)
  - Total demand (all ACTIVE candidates per round)
  - Net health = Supply - Demand per round
- [ ] **5.3** Per-round health badges:
  - 🟢 Green: surplus slots
  - 🟡 Yellow: within 20% of deficit
  - 🔴 Red: deficit — "X slots needed"
- [ ] **5.4** Panelist capacity table per round:
  - Panelist name, slots provided, slots booked, slots remaining, progress bar
  - "Mail" icon → trigger reminder email
  - "Manage Time" icon → God Mode availability editor
- [ ] **5.5** Candidate status breakdown per round:
  - ACTIVE (waiting to book) vs BOOKED vs COMPLETED
- [ ] **5.6** Real-time updates via Next.js `revalidatePath` after mutations

**Acceptance**: 10 candidates shortlisted for Round 1, Alice has 5 slots → dashboard shows RED "5 Slot Deficit" badge.

---

### Phase 6 — Post-Interview Feedback
> Goal: Close the loop on completed interviews.

- [ ] **6.1** After interview slot time passes → mark `Booking.status` as COMPLETED (cron or on-access)
- [ ] **6.2** Send feedback request email to panelist
- [ ] **6.3** Simple feedback form (linked from email or panelist dashboard):
  - Score (1-10)
  - Pass / Fail / Hold
  - Notes (free text)
- [ ] **6.4** Candidate advances to next round automatically if passed
- [ ] **6.5** Update candidate status to REJECTED or promote to `activeRoundId++`

**Acceptance**: Interview complete → panelist submits feedback → candidate promoted to Round 2 → new booking email sent.

---

### Phase 7 — Analytics & Polish
> Goal: Insights and production readiness.

- [ ] **7.1** Analytics page per program:
  - Funnel: Total → Shortlisted → Booked → Completed → Passed
  - Avg ATS score of shortlisted vs passed
  - Average time-to-book (candidate receives email → books slot)
  - Slot utilization per panelist
- [ ] **7.2** Profile / settings page (name, email, org name)
- [ ] **7.3** Sentry integration for error monitoring
- [ ] **7.4** Rate limiting on magic link endpoints (Upstash Redis)
- [ ] **7.5** Email delivery status tracking (Resend webhooks)
- [ ] **7.6** Mobile responsiveness pass on all public pages

---

## 7. Environment Variables Required

| Variable | Source | Used For |
|---|---|---|
| `DATABASE_URL` | Replit Secrets ✅ | Prisma DB connection |
| `BETTER_AUTH_SECRET` | Replit Secrets | Better Auth session signing |
| `RESEND_API_KEY` | Resend dashboard | Sending transactional emails |
| `OPENAI_API_KEY` | OpenAI dashboard | Resume scoring |
| `UPLOADTHING_SECRET` | UploadThing dashboard | File upload auth |
| `UPLOADTHING_APP_ID` | UploadThing dashboard | File upload app ID |
| `UPSTASH_REDIS_REST_URL` | Upstash console | Rate limiting (Phase 7) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console | Rate limiting (Phase 7) |
| `NEXT_PUBLIC_APP_URL` | Replit Secrets ✅ | Base URL for magic links |

---

## 8. Key Design Decisions & Guardrails

### Security
- Magic link tokens: `crypto.randomBytes(32).toString('hex')` — 256 bits of entropy
- Booking tokens expire in 72 hours
- Magic link endpoints rate-limited (max 10 req/min per IP)
- All recruiter routes protected by middleware + org membership check
- AI resume content sent to OpenAI — no PII logging, use `store: false` in API call

### Headless Panelist Flow
- External panelists **never need to create an account**
- `ProgramPanelist` stores their email + name directly
- If they are also an internal user, link via optional `userId`

### Smart Slot Snapping
- Slot duration = round's `durationMinutes`
- UI only allows selection in exact multiples of slot duration
- Backend validates slot duration before storing

### Supply/Demand Calculation
```
Available Supply (round R) = SUM of unbooked slots for all panelists assigned to R
Active Demand (round R) = COUNT of candidates with activeRoundId = R and status = ACTIVE
Health Delta = Available Supply - Active Demand
```

### Candidate State Machine
```
DRAFT → SHORTLISTED → ACTIVE → BOOKED → COMPLETED → (REJECTED at any stage)
                                  ↑ booking token sent
                          ↑ activeRoundId assigned
```

---

## 9. File / Folder Structure (Target)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/        → Better Auth login form
│   │   └── sign-up/        → Better Auth register form
│   ├── (onboarding)/
│   │   └── onboarding/     → Create org, become admin
│   ├── (dashboard)/
│   │   ├── layout.tsx      → Sidebar + auth guard
│   │   ├── dashboard/      → Program list + top-level stats
│   │   └── programs/
│   │       ├── create/     → Create program
│   │       └── [id]/
│   │           ├── page.tsx          → Program overview
│   │           ├── panelists/        → Panelist manager
│   │           ├── candidates/       → Candidate inbox
│   │           └── control-tower/   → Supply/demand health
│   ├── availability/
│   │   └── [token]/        → Public: panelist availability UI
│   ├── book/
│   │   └── [token]/        → Public: candidate booking UI
│   ├── api/
│   │   ├── auth/[...all]/  → Better Auth handler ✅
│   │   ├── programs/       → Program CRUD
│   │   ├── candidates/     → Candidate management
│   │   ├── availability/   → Slot submission
│   │   ├── book/           → Slot booking
│   │   ├── reminders/      → Trigger reminder emails
│   │   └── uploadthing/    → File upload endpoint
│   └── page.tsx            → Landing page ✅
├── components/
│   ├── ui/                 → shadcn primitives ✅
│   ├── layout/
│   │   ├── sidebar.tsx     → Fixed sidebar (needs rewrite)
│   │   └── topbar.tsx      → Mobile topbar
│   ├── programs/
│   │   ├── ProgramCard.tsx
│   │   └── RoundBadge.tsx
│   ├── panelists/
│   │   ├── PanelistTable.tsx
│   │   ├── AvailabilityGrid.tsx   → Time slot picker
│   │   └── InviteForm.tsx
│   ├── candidates/
│   │   ├── CandidateTable.tsx
│   │   ├── ATSScoreBadge.tsx
│   │   ├── BulkActions.tsx
│   │   └── UploadZone.tsx
│   └── control-tower/
│       ├── HealthBadge.tsx
│       ├── CapacityBar.tsx
│       └── RoundHealthCard.tsx
├── lib/
│   ├── auth.ts             ✅ Better Auth server
│   ├── auth-client.ts      ✅ Better Auth client
│   ├── prisma.ts           ✅ Prisma singleton
│   ├── utils.ts            ✅ cn()
│   ├── tokens.ts           → Magic link token generation
│   ├── email.ts            → Resend wrapper + templates
│   ├── ai.ts               → OpenAI resume scoring
│   └── slots.ts            → Slot conflict/availability logic
├── actions/
│   ├── programs.ts         → Server Actions for program CRUD
│   ├── panelists.ts        → Server Actions for panelist invite
│   ├── candidates.ts       → Server Actions for candidate management
│   └── availability.ts     → Server Actions for slot management
└── middleware.ts            → Route protection
```

---

## 10. Dependency Additions Needed

```bash
# Email
npm install resend

# AI scoring
npm install openai pdf-parse mammoth

# File upload
npm install uploadthing @uploadthing/react

# Rate limiting (Phase 7)
npm install @upstash/ratelimit @upstash/redis

# Error monitoring (Phase 7)
npm install @sentry/nextjs

# Forms (fix create-program)
npm install react-hook-form @hookform/resolvers

# Calendar / scheduling UI
npm install react-big-calendar date-fns
# or lightweight custom grid (preferred)
```

---

## 11. Build Order Summary

| Phase | Name | Estimated Complexity |
|---|---|---|
| **Phase 0** | Foundation Fix | Medium — auth wiring, schema migration |
| **Phase 1** | Program & Round CRUD | Low — straightforward DB + UI |
| **Phase 2** | Panelist Engine | High — magic links, slot UI, email |
| **Phase 3** | Candidate Pipeline | High — file upload, AI scoring, bulk ops |
| **Phase 4** | Candidate Self-Booking | High — concurrency, token expiry, emails |
| **Phase 5** | Control Tower | Medium — aggregation queries, real-time feel |
| **Phase 6** | Post-Interview Feedback | Medium — state machine, email triggers |
| **Phase 7** | Analytics & Polish | Low-Medium — charts, monitoring |

---

## 12. Open Questions / Decisions Needed

- [ ] **Calendar invites**: Should booking confirmation include a `.ics` file? (Google/Outlook link?)
- [ ] **Multi-org**: Can one user be admin of multiple orgs? (Currently allowed by schema, but UI supports one)
- [ ] **External panelists**: Should they ever be able to view their past interviews? (Requires minimal account)
- [ ] **Candidate portal**: Should candidates have a login to track their status between rounds?
- [ ] **AI model**: GPT-4o (accurate, $) vs GPT-4o-mini (fast, cheaper) vs Gemini Flash?
- [ ] **Public career page**: Should HireGrid host a `/apply/[orgSlug]/[programId]` public application form?
- [ ] **Payment/Billing**: Is this SaaS (multi-tenant, paid tiers) or internal tool?
