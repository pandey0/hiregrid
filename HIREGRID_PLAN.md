# HireGrid — Complete Requirements & Bug Analysis
> Deep audit conducted: March 2026 | Every file inspected, every route navigated, every log read.

---

## 🔴 PART 1 — WHAT IS ACTUALLY BROKEN RIGHT NOW (Live Bugs)

### BUG-01 · `/create-program` crashes the ENTIRE app [SEVERITY: CRITICAL]

**Impact:** When Next.js tries to compile `/create-program`, it fails with 9 missing module errors. Because Next.js shares a single compilation context, this crashes ALL routes — including the landing page — producing `GET / 500` errors that are visible in the server logs right now.

**Root cause:** The page was copied from a different project (Express + React Query + shared schema) and none of the dependencies or files exist here.

Missing modules (confirmed from logs):
```
@tanstack/react-query        → not installed
@hookform/resolvers/zod      → not installed
react-hook-form              → not installed
@/hooks/use-toast            → file does not exist
@/components/ui/textarea     → file does not exist
@/components/ui/form         → file does not exist
@shared/schema               → package does not exist (was from a monorepo)
@/components/ui/round-form-field → file does not exist
@/services/authService       → file does not exist
@/lib/queryClient            → file does not exist
```

**What user sees:** Page timeout. Landing page intermittently 500s. The sidebar "Create Program" link navigates the user to a broken page.

---

### BUG-02 · Dashboard sidebar crashes on client [SEVERITY: CRITICAL]

**File:** `src/components/PageComponents/sidebar.tsx` line 29

```typescript
const currentUser = auth.api.accountInfo;
// auth.api is the Better Auth SERVER-SIDE handler object.
// It is NOT a client data store. This is the wrong API entirely.

const userName = currentUser.name || currentUser?.name || "";
// currentUser is undefined → TypeError: Cannot read properties of undefined ('name')
```

**Consequence:** Any page using the `(dashboard)` layout will crash client-side with a TypeError. The dashboard "appears" to work only because Next.js App Router renders the server component (the page) first, and the sidebar error is silently swallowed in some cases.

---

### BUG-03 · Dashboard layout has a hardcoded throw [SEVERITY: HIGH]

**File:** `src/app/(dashboard)/layout.tsx` line 29-31

```typescript
<Sidebar isMobileOpen={false} setMobileOpen={function (open: boolean): void {
  throw new Error("Function not implemented.");  // ← this is live in production
}} />
```

The `isMobileOpen` state is created (line 14) but never actually wired to the Sidebar. On mobile, clicking the hamburger menu will throw an uncaught Error.

---

### BUG-04 · Dashboard renders raw session object as text [SEVERITY: HIGH]

**File:** `src/app/(dashboard)/dashboard/page.tsx` line 45

```tsx
<div>{JSON.stringify(session, null, 2)}</div>
```

This is debug code left in production. Session is `null` (no active session) so the dashboard shows the literal text **`; null`** underneath the program cards. Visible in the live screenshot.

---

### BUG-05 · Landing page intermittent 500 errors [SEVERITY: HIGH]

**From logs (confirmed):**
```
⨯ SyntaxError: Unexpected end of JSON input  { page: '/' }
GET / 500 in 1832ms
```

This appears 3+ times in the logs. Caused by Better Auth trying to parse malformed or empty JSON from the database connection on cold start, or by the `create-program` compilation failure polluting the module graph. Intermittent — sometimes 200, sometimes 500.

---

### BUG-06 · `BETTER_AUTH_SECRET` is not set [SEVERITY: HIGH]

**From env audit:** The secret `BETTER_AUTH_SECRET` is not in the secrets. Better Auth uses this to sign JWTs/sessions. Without it, Better Auth either uses an insecure default or throws at runtime, making all login/signup operations unreliable or completely broken.

---

### BUG-07 · Onboarding form does absolutely nothing [SEVERITY: HIGH]

**File:** `src/app/(onboarding)/onboarding/page.tsx`

```typescript
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // Add your form submission logic here   ← no logic, never was
}
```

Clicking "Next" prevents default and... does nothing. No organization is created. No DB insert. No redirect. The user is stuck.

---

### BUG-08 · Sign-up has no post-registration redirect [SEVERITY: HIGH]

**File:** `src/app/ui-components/pages/register.tsx`

After `signUp.email()` succeeds (in `onResponse`), there is no `router.push('/onboarding')`. The user registers and stays on the register page with no feedback about what to do next.

---

### BUG-09 · No route protection — dashboard is publicly accessible [SEVERITY: HIGH]

There is no `middleware.ts` file. Any unauthenticated user who navigates to `/dashboard` sees the full dashboard with mock data. Session is `null` but no redirect happens.

---

### BUG-10 · Sidebar navigation links point to non-existent routes [SEVERITY: MEDIUM]

**File:** `src/components/PageComponents/sidebar.tsx`

```typescript
{ name: "Manage Panelists",    href: "/manage-panelists" },     // ❌ 404
{ name: "Schedule Interviews", href: "/schedule-interviews" },  // ❌ 404
{ name: "Profile",             href: "/profile" },              // ❌ 404
```

Clicking these shows Next.js 404 page.

---

### BUG-11 · Dashboard data is 100% hardcoded mock [SEVERITY: MEDIUM]

**File:** `src/app/(dashboard)/dashboard/page.tsx`

Programs, candidates, round counts — all are literal JavaScript arrays defined inline. The DB is never queried. A user who creates a real program via API would never see it here.

---

## 🟡 PART 2 — THE HIRING ROUNDS SYSTEM: What's Missing vs What's Needed

The core value proposition is **dynamic multi-round hiring management**. Here is what's needed vs what exists.

### The Dynamic Round Flow (Required)

```
Program: "Senior Frontend Engineer Hiring Drive"
│
├── Round 1: Resume Screening (ATS AI)
│   ├── Duration: N/A (AI-automated, no human interview slot needed)
│   ├── Panelists assigned: none
│   └── Outcome: PASS → Round 2 | FAIL → REJECTED
│
├── Round 2: Technical Assessment (60 min)
│   ├── Duration: 60 minutes  ← stored as durationMinutes (INT)
│   ├── Panelists assigned: Alice, Charlie
│   │   └── Each has a magic link to submit availability
│   ├── Candidate gets /book/[token] link
│   └── Outcome: PASS → Round 3 | FAIL → REJECTED
│
├── Round 3: System Design (90 min)
│   ├── Duration: 90 minutes
│   ├── Panelists assigned: Bob, Dave
│   └── Same booking flow
│
└── Round 4: Culture Fit (30 min)
    ├── Duration: 30 minutes
    ├── Panelists: HR team
    └── Final outcome
```

### Schema Gap Analysis (Round-by-Round)

| Feature | Needed | Current State |
|---|---|---|
| Round duration in minutes | `durationMinutes: Int` | `durationHours: Int` — precision wrong, can't do 45-min or 90-min rounds |
| Round order | `roundNumber: Int` | ✅ Exists but not enforced |
| Round type (AI / Human) | `roundType: RoundType` enum | ❌ Missing |
| Panelist-to-Round assignment | `ProgramPanelist` pivot with `assignedRoundIds` | ❌ Entire table missing |
| Panelist magic link token | `ProgramPanelist.magicLinkToken: String @unique` | ❌ Missing |
| Panelist external (no account) support | `ProgramPanelist.externalEmail`, `.externalName` | ❌ Missing |
| Panelist time slots (JSON) | `ProgramPanelist.availableSlots: Json` | ❌ Missing |
| Candidate with ATS score | `Candidate.atsScore: Float`, `.atsReason: String` | ❌ Missing — only thin `Applicant` exists |
| Candidate resume URL | `Candidate.resumeUrl: String` | ❌ Missing |
| Candidate active round tracking | `Candidate.activeRoundId: Int` | ❌ Missing |
| Candidate booking token | `Candidate.bookingToken: String @unique` | ❌ Missing |
| Candidate booking token expiry | `Candidate.bookingTokenExp: DateTime` | ❌ Missing |
| Candidate status granularity | DRAFT/SHORTLISTED/ACTIVE/BOOKED/COMPLETED | Only PENDING/SELECTED/REJECTED |
| Confirmed booking record | `Booking` model | ❌ Entire model missing |
| Booking status | SCHEDULED/COMPLETED/CANCELLED/NO_SHOW | ❌ Missing |
| Post-interview feedback on booking | `Booking.feedback`, `.score` | ❌ Missing |

---

## 🟠 PART 3 — WHAT'S BUILT BUT WORKS (Salvageable)

| Feature | Status | Quality |
|---|---|---|
| Landing page | ✅ Loads (mostly) | Good — polished dark UI |
| Sign-in page UI | ✅ Renders | Good — calls Better Auth correctly |
| Sign-up page UI | ✅ Renders | Good — calls Better Auth correctly |
| Better Auth setup (`/api/auth/[...all]`) | ✅ Wired | Correct handler |
| Prisma schema (base) | ✅ Partial | User, Org, Round, Program exist — needs 3 new models |
| Prisma client generation | ✅ Works | Runs on `npm run dev` |
| Sidebar navigation structure | ✅ UI only | Links, icons — just broken targets |
| Dashboard layout shell | ✅ Renders | Layout OK — sidebar crash is client-side |
| Dashboard stats cards | ✅ Renders | Mock data only |
| Onboarding form UI | ✅ Renders | Form renders — submit is dead |
| Framer Motion animations | ✅ | Good quality throughout |

---

## 🔵 PART 4 — COMPLETE FEATURE INVENTORY

### Features Fully Missing (never started)

| Feature | Complexity | Blocks What |
|---|---|---|
| `middleware.ts` route protection | Low | Everything in dashboard |
| `BETTER_AUTH_SECRET` env var | Trivial | All auth |
| Onboarding → create Org + ADMIN member | Low | Everything else |
| `/programs/create` — real Server Action | Medium | Creating programs |
| `/programs/[id]` — program detail | Medium | Round management |
| **Panelist Invite** — generate magic link, send email | High | Supply side |
| **`/availability/[token]`** — headless scheduler UI | High | Supply side |
| Smart slot snapping (force slot = round duration) | Medium | Capacity accuracy |
| Slot conflict detection | Medium | Capacity accuracy |
| "God Mode" — recruiter manages panelist slots | Medium | Bottleneck resolution |
| One-click reminder email | Low | Panelist nudge |
| Resume / CSV upload | Medium | Demand side |
| AI ATS scoring (Gemini) | Medium | Candidate shortlisting |
| Candidate Inbox (data-dense list view) | Medium | Demand side |
| Bulk shortlist action | Medium | Demand side |
| **`/book/[token]`** — candidate self-booking | High | Demand ↔ Supply match |
| **Control Tower** — Supply vs Demand health view | High | Recruiter visibility |
| Health badges (🔴🟡🟢) per round | Medium | Bottleneck alerts |
| Post-interview feedback | Medium | Round progression |
| Candidate round promotion | Low | Multi-round support |
| Analytics/funnel view | Medium | Insights |
| Profile/settings page | Low | UX completeness |

---

## 🟢 PART 5 — CORRECTED PRISMA SCHEMA (Target State)

```prisma
// ─── CHANGES TO EXISTING MODELS ──────────────────────────────────────────────

// Round: rename durationHours → durationMinutes, add roundType
model Round {
  id              Int           @id @default(autoincrement())
  name            String
  description     String?
  roundNumber     Int           // 1-indexed ordering within program
  durationMinutes Int           // was durationHours — supports 30/45/60/90 min
  roundType       RoundType     @default(HUMAN_INTERVIEW)
  programId       Int
  program         Program       @relation(fields: [programId], references: [id])
  panelists       ProgramPanelist[]
  bookings        Booking[]
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

enum RoundType {
  ATS_SCREENING    // automated, no panelist needed
  HUMAN_INTERVIEW  // requires panelist slots
  ASSIGNMENT       // async task submission
}

// ─── NEW MODELS ───────────────────────────────────────────────────────────────

// ProgramPanelist: Headless panelist engine — THE core supply table
model ProgramPanelist {
  id               Int       @id @default(autoincrement())
  programId        Int
  program          Program   @relation(fields: [programId], references: [id], onDelete: Cascade)
  roundId          Int       // which specific round this panelist covers
  round            Round     @relation(fields: [roundId], references: [id])

  // Panelist identity — can be internal (userId) or external (email only)
  userId           String?   // null for external/headless panelists
  user             User?     @relation(fields: [userId], references: [id])
  externalEmail    String?   // required if userId is null
  externalName     String?

  // Magic link system
  magicLinkToken   String    @unique  // crypto.randomBytes(32).toString('hex')
  magicLinkUsedAt  DateTime?          // null = never used

  // Availability (JSON array of time blocks)
  // Structure: [{start: ISO8601, end: ISO8601, booked: boolean, bookingId?: Int}]
  availableSlots   Json      @default("[]")

  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  bookings         Booking[]

  @@unique([programId, roundId, externalEmail])  // prevent duplicate invites
}

// Candidate: Full applicant model (replaces thin Applicant)
model Candidate {
  id              Int              @id @default(autoincrement())
  programId       Int
  program         Program          @relation(fields: [programId], references: [id])
  organizationId  Int

  // Identity — candidates are NOT required to have a User account
  name            String
  email           String
  resumeUrl       String?          // S3/UploadThing URL

  // ATS AI scoring (set after resume upload)
  atsScore        Float?           // 0-100
  atsReason       String?          // AI explanation text

  // Pipeline state
  status          CandidateStatus  @default(DRAFT)
  activeRoundId   Int?             // which round they are currently in
  activeRound     Round?           @relation(fields: [activeRoundId], references: [id])

  // Self-booking token for /book/[token] page
  bookingToken    String?          @unique
  bookingTokenExp DateTime?
  bookingRoundId  Int?             // which round this booking token is for

  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  bookings        Booking[]

  @@unique([programId, email])     // one candidate per program per email
}

enum CandidateStatus {
  DRAFT        // uploaded, not reviewed
  SHORTLISTED  // recruiter manually approved
  ACTIVE       // assigned to a round, booking token sent
  BOOKED       // confirmed slot exists
  COMPLETED    // all rounds finished
  REJECTED     // eliminated at any stage
}

// Booking: Confirmed interview record
model Booking {
  id                Int              @id @default(autoincrement())
  candidateId       Int
  candidate         Candidate        @relation(fields: [candidateId], references: [id])
  programPanelistId Int
  programPanelist   ProgramPanelist  @relation(fields: [programPanelistId], references: [id])
  roundId           Int
  round             Round            @relation(fields: [roundId], references: [id])

  // Slot details (denormalized for display without parsing availableSlots JSON)
  slotStart         DateTime
  slotEnd           DateTime

  status            BookingStatus    @default(SCHEDULED)

  // Post-interview feedback
  score             Float?           // panelist's numeric score
  verdict           Verdict?         // PASS / FAIL / HOLD
  feedback          String?          // free text notes

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
}

enum BookingStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}

enum Verdict {
  PASS
  FAIL
  HOLD
}
```

---

## 🟣 PART 6 — FIX ORDER (Strict Build Sequence)

### Step 1 — Immediate crash fixes (do first, today)

These are blocking everything:

- [ ] **1a** Delete or rewrite `create-program/page.tsx` (9 broken imports crash the app)
- [ ] **1b** Set `BETTER_AUTH_SECRET` in Replit Secrets
- [ ] **1c** Fix sidebar — replace `auth.api.accountInfo` with a prop/context pattern
- [ ] **1d** Fix dashboard layout — wire `isMobileOpen` state properly to Sidebar
- [ ] **1e** Remove `{JSON.stringify(session, null, 2)}` debug line from dashboard page
- [ ] **1f** Install missing packages: `react-hook-form @hookform/resolvers @tanstack/react-query`

### Step 2 — Auth & Onboarding (unlock the user journey)

- [ ] **2a** Add `middleware.ts` protecting all `/dashboard` routes → redirect to `/sign-in`
- [ ] **2b** Onboarding form: wire submit → create `Organization` + `OrganizationMember (ADMIN)` → redirect `/dashboard`
- [ ] **2c** Register page: on success → redirect to `/onboarding`
- [ ] **2d** Login page: on success → check if org exists → redirect to `/dashboard` or `/onboarding`

### Step 3 — Schema & DB migration

- [ ] **3a** Rename `Round.durationHours` → `Round.durationMinutes`, add `roundType`
- [ ] **3b** Add `ProgramPanelist` model
- [ ] **3c** Add `Candidate` model (replaces `Applicant`)
- [ ] **3d** Add `Booking` model
- [ ] **3e** Run `prisma migrate dev`

### Step 4 — Program & Round CRUD (first real feature)

- [ ] **4a** Replace broken create-program page with Server Action-based form
- [ ] **4b** `GET /dashboard` — query real programs from DB for this org
- [ ] **4c** Program detail page `/programs/[id]` — show rounds list, edit rounds

### Step 5 — Panelist Engine (Supply side)

- [ ] **5a** Panelist invite form → generates `magicLinkToken`, saves `ProgramPanelist`, sends email (Resend)
- [ ] **5b** `/availability/[token]` — public page:
  - Validate token
  - Show time slot grid
  - Smart snapping: slots must be multiples of `round.durationMinutes`
  - Client-side conflict detection
  - Save to `ProgramPanelist.availableSlots` JSON
- [ ] **5c** Panelist Manager page — table view, slot counts, remind button, God Mode editor

### Step 6 — Candidate Pipeline (Demand side)

- [ ] **6a** Install UploadThing, add resume upload endpoint
- [ ] **6b** Manual add + CSV bulk upload → create `Candidate` records as DRAFT
- [ ] **6c** AI scoring: extract PDF text → Gemini structured output → save `atsScore`, `atsReason`
- [ ] **6d** Candidate Inbox — list view, ATS score badge, status filter, bulk select
- [ ] **6e** "Shortlist & Invite" bulk action → set ACTIVE, assign `activeRoundId`, generate `bookingToken`, send email

### Step 7 — Candidate Booking (Supply ↔ Demand)

- [ ] **7a** `/book/[token]` — public page:
  - Validate token + expiry
  - Fetch unbooked slots for `bookingRoundId`
  - Slot picker UI
  - Confirm → create `Booking`, mark slot booked, update candidate status, send confirmation emails
- [ ] **7b** Handle race condition (two candidates pick same slot simultaneously)
- [ ] **7c** Booking confirmation page with .ics download

### Step 8 — Control Tower

- [ ] **8a** Per-round health calculation:
  ```
  supply = count of unbooked slots across all ProgramPanelists for this round
  demand = count of Candidates where activeRoundId = this round AND status = ACTIVE
  delta  = supply - demand
  ```
- [ ] **8b** Health badge component: 🔴 deficit / 🟡 close / 🟢 surplus
- [ ] **8c** Panelist capacity table per round
- [ ] **8d** One-click reminder (resend magic link email)
- [ ] **8e** God Mode — recruiter opens availability editor for a panelist

### Step 9 — Feedback & Round Progression

- [ ] **9a** After interview slot time passes, mark booking COMPLETED (on-access check)
- [ ] **9b** Feedback form for panelist (via email link)
- [ ] **9c** Verdict: PASS → promote to next round, FAIL → REJECTED

### Step 10 — Polish & Production Ready

- [ ] Install Sentry
- [ ] Rate limit `/availability/[token]` and `/book/[token]` endpoints
- [ ] Analytics funnel page
- [ ] Profile/settings page
- [ ] Full mobile responsiveness pass

---

## 📦 PART 7 — PACKAGES TO INSTALL (Full List)

```bash
# Fix create-program crash immediately
npm install react-hook-form @hookform/resolvers @tanstack/react-query

# Email (panelist invites, booking confirmations)
npm install resend

# File upload (resumes)
npm install uploadthing @uploadthing/react

# AI resume scoring
npm install @ai-sdk/google

# PDF text extraction for AI scoring
npm install pdf-parse @types/pdf-parse

# Rate limiting (protect magic link endpoints)
npm install @upstash/ratelimit @upstash/redis

# Error tracking
npm install @sentry/nextjs
```

---

## 📐 PART 8 — ROUTE MAP (Complete Target)

```
PUBLIC ROUTES
────────────────────────────────────────────────────────
/                        Landing page               ✅ works
/sign-in                 Better Auth sign-in        ✅ UI works, auth works
/sign-up                 Better Auth sign-up        ⚠️ no post-signup redirect
/onboarding              Create org                 ⚠️ form does nothing
/availability/[token]    Panelist slot scheduler    ❌ not built
/book/[token]            Candidate self-booking     ❌ not built

PROTECTED ROUTES (require session + org membership)
────────────────────────────────────────────────────────
/dashboard               Overview                   ⚠️ mock data, crashes
/programs/create         Create program             🔴 9 module errors, crashes app
/programs/[id]           Program detail             ❌ not built
/programs/[id]/panelists Panelist manager           ❌ not built
/programs/[id]/candidates Candidate inbox           ❌ not built
/programs/[id]/control-tower Control tower         ❌ not built
/manage-panelists        (sidebar link)             🔴 404
/schedule-interviews     (sidebar link)             🔴 404
/profile                 User settings              🔴 404

API ROUTES
────────────────────────────────────────────────────────
/api/auth/[...all]       Better Auth handler        ✅ wired
/api/programs            GET list / POST create     ❌ not built
/api/programs/[id]       GET / PATCH / DELETE       ❌ not built
/api/programs/[id]/panelists  Invite panelist       ❌ not built
/api/programs/[id]/candidates Manage candidates     ❌ not built
/api/availability/[token] Save panelist slots       ❌ not built
/api/book/[token]        Confirm booking            ❌ not built
/api/upload              UploadThing endpoint       ❌ not built
/api/reminders/[id]      Resend magic link email    ❌ not built
```

---

## 📊 PART 9 — HONEST COMPLETION ESTIMATE

| Area | % Complete |
|---|---|
| UI/Design (landing, auth pages) | 85% |
| Authentication backend | 60% (wired, but missing secret, no guard) |
| Database schema | 35% (base models ok, 3 critical models missing) |
| Program management | 10% (DB model exists, no API, no real UI) |
| Panelist engine | 0% |
| Candidate pipeline | 0% |
| Candidate booking | 0% |
| Control Tower | 0% |
| Email system | 0% |
| AI resume scoring | 0% |
| **Overall** | **~15%** |

---

## ❓ PART 10 — OPEN QUESTIONS THAT WILL AFFECT BUILD DECISIONS

1. **Do panelists ever create accounts?** The design says "headless" (no account needed). But if a panelist is also an internal employee, should they have a linked account for history?

2. **Do candidates create accounts?** Or is everything magic-link-only for them too? (Affects whether `Candidate` needs a `userId` foreign key)

3. **Who sends the initial candidate resumes?** Manual upload by recruiter only? CSV import? Public career page (`/apply/[programSlug]`)?

4. **Is the ATS scoring automatic on upload or manual trigger?** Auto-scoring all uploads is simpler but costs API credits for every PDF.

5. **Round duration precision?** Are 45-minute rounds needed or is 30/60/90 sufficient? (Affects slot snapping complexity)

6. **Timezone handling?** All slots stored in UTC and displayed in recruiter's local timezone? Or panelist's timezone?

7. **Calendar invite format?** On booking confirmation, send `.ics` file, Google Calendar link, or both?

8. **Multi-org?** Can one user admin multiple organizations? (Schema supports it but the UI flow assumes one org per user)
