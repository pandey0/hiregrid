# 📋 COMPLETE USER STORY EXTRACTION (HireGrid)

---

# 🏗️ Epic 1: B2B Foundation & Program Configuration

* **Story 1.1: Organization & Auth** - As a Recruiter, I can sign up, create an Organization, and manage my team members via secure authentication.
---

### 🔍 Implementation Status
Status: ✅ DONE

### 🧱 Implementation Mapping
- Frontend: `/sign-in`, `/sign-up`, `/onboarding` pages, `/settings/team` page.
- Backend: `better-auth` in `src/lib/auth.ts`, server actions in `src/actions/onboarding.ts` and `src/actions/organization.ts`.
- Database: `User`, `Organization`, `OrganizationMember` models.
- Integrations: Better Auth Prisma Adapter.

---

### 🔧 Implementation Update
Status: ✅ FIXED

### ✅ Acceptance Criteria Coverage
- Recruiter can sign up: ✅
- Recruiter can create an Organization: ✅
- Recruiter can manage team members (View/Add/Remove): ✅

---

* **Story 1.2: Program Creation** - As a Recruiter, I can create a new "Program" (e.g., *Frontend SDE-2 Hiring*).
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 1.3: Dynamic Rounds** - As a Recruiter, I can define $N$ number of sequential rounds for a Program (e.g., Round 1: React Coding, Round 2: System Design).
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 1.4: Round Constraints** - As a Recruiter, I must define the exact duration (e.g., 45 minutes or 60 minutes) for each round. This duration dictates the "Time Snapping" for all scheduling.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 1.5: Member Invitations** - As an Admin, I can invite new team members by email. If the user doesn't have an account, they are automatically joined to the organization upon signing up.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

# ⚙️ Epic 2: The Supply Engine (Panelist Management)

* **Story 2.1: Panelist Assignment** - As a Recruiter, I can invite a Panelist via email and assign them to specific Rounds within a Program.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 2.2: Magic Link Generation** - The system must generate a cryptographically secure, unique URL (`/availability/[token]`) for the Panelist.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 2.3: Time Snapping UI** - As a Panelist clicking the link, the UI forces me to provide availability in blocks that *exactly* match my assigned round's duration (e.g., I cannot select a 30-min block if assigned to a 60-min round).
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 2.4: Availability Storage** - The backend stores these time blocks as JSON arrays in UTC format attached to the `ProgramPanelist` pivot table.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

# 📥 Epic 3: The Demand Pipeline (Candidate Management)

* **Story 3.1: Candidate Ingestion** - As a Recruiter, I can bulk upload candidates via CSV, manual entry, or through a headless Agency upload link.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 3.2: Draft State & Scoring** - New candidates enter a `DRAFT` state. The system parses their resume and assigns an AI Match Score (0-100%).
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 3.3: Shortlisting (State Machine)** - As a Recruiter, I can bulk-select `DRAFT` candidates and move them to `ACTIVE` for a specific Round.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 3.4: Candidate Magic Link** - Moving a candidate to `ACTIVE` automatically generates their booking URL (`/book/[token]`).
---

### 🔍 Implementation Status
Status: ✅ DONE

---

# 🧠 Epic 4: The Control Tower (Dashboard & AI Co-Pilot)

* **Story 4.1: Capacity Math** - The dashboard must calculate: `(Total Usable Slots from Panelists for Round X) - (Total Active Candidates in Round X)`.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 4.2: Bottleneck Alerts** - If Demand > Supply, the UI must display a red "Capacity Deficit" alert.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

* **Story 4.3: One-Click Nudges** - As a Recruiter, I can click a button to re-send Magic Links to panelists who have provided 0 hours of availability.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 4.4: God Mode** - As a Recruiter, I can manually add or delete available time slots on behalf of a Panelist if they message me directly.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

# 📅 Epic 5: The Booking Engine (Transactional Scheduling)

* **Story 5.1: The Booking UI** - As a Candidate, my Magic Link shows a consolidated, timezone-adjusted view of all available time slots from all eligible panelists in my active round.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 5.2: Concurrency Locks** - When Candidate A and B click the same slot simultaneously, the Prisma `$transaction` must use row-level locking. Only one succeeds; the other gracefully fails and prompts a refresh.
---

### 🔧 Implementation Update
Status: ✅ FIXED

---

* **Story 5.3: Slot Consumption** - Upon successful booking, the time block is instantly deducted from the Panelist's JSON array, and an `Interview` record is created in the database.
---

### 🔍 Implementation Status
Status: ✅ DONE

---

# 🤖 Epic 6: The Fulfillment Dispatcher (MCP Calendar Integration)

* **Story 6.1: Recruiter Google Connect** - As a Recruiter, I can connect my Google Workspace (OAuth scopes: `calendar.events`, `gmail.send`) to my Organization profile.
---

### 🔧 Implementation Update
Status: ✅ FIXED

### 🧱 Implementation Mapping
- Backend: `socialProviders` configured in `src/lib/auth.ts` with correct scopes.

---

* **Story 6.2: MCP Agent Trigger** - Upon a successful candidate booking, a background worker triggers an AI Agent (via Vercel AI SDK).
---

### 🔧 Implementation Update
Status: ✅ FIXED

### 🧱 Implementation Mapping
- Backend: `confirmBooking` in `src/actions/candidates.ts` calls `dispatchInterviewFulfillment` asynchronously.

---

* **Story 6.3: Event Generation** - The AI uses the Google Workspace MCP Server (authenticated with the Recruiter's tokens) to dynamically create a Calendar Event with a Google Meet link, adding the Candidate and Panelist as attendees.
---

### 🔧 Implementation Update
Status: ✅ FIXED

### ✅ Acceptance Criteria Coverage
- Event Generation: ✅ (Using real Google Calendar API via AI Agent)
- Google Meet integration: ✅ (Automatically generated for all interviews)
- Organization Admin Tokens: ✅ (Retrieved and refreshed automatically)

### 🧱 Changes Made
- Backend: Created `src/lib/google.ts` for API handling. Overhauled `src/lib/mcp.ts` with Vercel AI SDK and GPT-4o.
- Frontend: Added "Connect Google Calendar" to Team Settings.
- Database: Using `Account` table for token storage.
- Integrations: Google Calendar API, Vercel AI SDK.

---

* **Story 6.4: Graceful Degradation** - If the Google API fails, the Candidate's booking remains intact, and the system alerts the Recruiter to manually generate the invite.
---

### 🔍 Implementation Status
Status: ✅ DONE

### 🧱 Implementation Mapping
- Backend: `dispatchInterviewFulfillment` updates `fulfillmentStatus` to `FAILED` on catch.
- Frontend: Dashboard shows a rose-colored alert if any bookings have `FAILED` fulfillment.
- Database: `fulfillmentStatus` tracking in `Booking` model.

---

# 🎟️ Engineering Stories (HG-001 → HG-012)

## HG-001 → HG-005 (Core Booking + MCP Dispatcher)

### HG-001: Unified Booking Link
Status: ✅ DONE

### HG-002: Real-time Availability Sync
Status: ✅ DONE

### HG-003: Conflict Prevention
Status: ✅ FIXED

### HG-004: Candidate Confirmation
Status: ✅ DONE

### HG-005: MCP Dispatcher
Status: ✅ FIXED

## HG-005.1 → HG-005.5 (MCP Breakdown)

- HG-005.1 (OAuth): ✅ DONE
- HG-005.2 (MCP Client): ✅ DONE
- HG-005.3 (Async Worker): ✅ DONE
- HG-005.4 (AI Dispatcher): ✅ DONE
- HG-005.5 (Fallback UI): ✅ DONE

---

# 📋 Epic 7: Security, Compliance & Abuse Prevention

## HG-006: API Rate Limiting & Brute-Force Lockout
Status: ✅ FIXED

## HG-007: Automated Data Retention & PII Anonymization
---

### 🔧 Implementation Update
Status: ✅ FIXED

### ✅ Acceptance Criteria Coverage
- Delete resumes after 90 days: ✅ (Handled in `performPIICleanup`)
- Anonymize candidate data: ✅ (Clears email, phone, resume, LinkedIn)

### 🧱 Changes Made
- Backend: Added `performPIICleanup` action in `src/actions/candidates.ts`.

---

# 📋 Epic 8: Operational Reliability & Observability

## HG-008: Optimistic Booking UI
---

### 🔧 Implementation Update
Status: ✅ FIXED

### ✅ Acceptance Criteria Coverage
- Instant confirmation feel: ✅ (Added pulse loading and immediate success-state placeholder)

### 🧱 Changes Made
- Frontend: Updated `BookingGrid.tsx` with `isOptimisticBooking` state.

---

## HG-009: Full-Stack Observability & LLM Tracing
---

### 🔧 Implementation Update
Status: ✅ FIXED

### ✅ Acceptance Criteria Coverage
- Sentry integration: ✅ (Configured in `sentry.server.config.ts`)
- AI tracing: ✅ (Added console-based tracing and Sentry capture in `src/lib/ai.ts`)

---

# 📋 Epic 9: Advanced Scheduling UX

## HG-010: Soft Deletes
Status: ✅ FIXED

## HG-011: Panelist Context Portal
Status: ✅ FIXED

## HG-012: Candidate Rescheduling
Status: ✅ FIXED

---

# 🛡️ Epic 10: Enterprise-Grade Robustness & Security

...

# 📝 Epic 11: The Feedback Loop (Evaluation Engine)

* **Story 11.1: Panelist Scorecards** - As a Panelist, I can submit a performance score (1-5), a verdict (PASS/FAIL/HOLD), and detailed feedback notes for a candidate after the session.
* **Story 11.2: Scorecard Visibility** - As a Recruiter, I can view all submitted scorecards for a candidate across different rounds to make a data-driven hiring decision.
* **Story 11.3: Automatic Candidate Conclusion** - If an interview is marked as FAIL, the candidate's status automatically moves to REJECTED.
* **Story 11.4: One-Click Round Promotion** - As a Recruiter, I can promote a successful candidate to the next round with a single click, instantly sending them a new booking link.

---

### 🔍 Implementation Status
Status: ✅ DONE

### ✅ Acceptance Criteria Coverage
- Direct promotion logic: ✅ (promoteCandidate action)
- Automated next-round detection: ✅ (Logic in Candidate Detail page)
- New token generation: ✅ (Included in promotion step)

### 🧱 Changes Made
- Backend: Added `promoteCandidate` in `src/actions/candidates.ts`.
- Frontend: Created `PromoteButton` component and integrated it into the `Candidate Detail` header.

---

# 🤖 Epic 12: The Intelligence Layer (AI Rubrics)

...

# 🛡️ Epic 13: The Fail-Safe Layer (Edge Case Protection)

...

# 🔄 Epic 14: Lifecycle & Exception Management

* **Story 14.1: Recruiter-led Cancellation** - Recruiters can cancel any booking. This marks the booking as `CANCELLED`, restores the panelist's slot, and sends an automated notification to both parties.
* **Story 14.2: Panelist Reassignment** - Recruiters can reassign a scheduled booking to a different panelist in the same round if the original panelist becomes unavailable.
* **Story 14.3: Rescheduling Lock** - Prevent candidates from cancelling or rescheduling if the interview is less than 2 hours away, forcing them to contact the recruiter instead.

---

### 🔍 Implementation Status
Status: ✅ DONE

### ✅ Acceptance Criteria Coverage
- Recruiter cancellation: ✅ (cancelBookingByRecruiter action)
- Reassignment logic: ✅ (reassignPanelist action)
- 2-hour rescheduling lock: ✅ (Validation in cancelBooking)

### 🧱 Changes Made
- Backend: Added advanced management actions in `src/actions/candidates.ts`.
- Frontend: Created `ManageBookingActions` dropdown and integrated into `Candidate Detail` page.

---

---

# 🛡️ Epic 16: Granular Access Control (RBAC Overhaul)

* **Story 16.1: Program Assignment** - As an Admin, I can assign staff members to specific hiring programs with a defined role (Lead or HR).
* **Story 16.2: Program Lead Empowerment** - As a Program Lead, I have full control over the rounds and settings of my assigned program, but I cannot see programs I'm not assigned to.
* **Story 16.3: Program HR Execution** - As a Program HR, I can manage candidates and panelists for my assigned programs, but I cannot modify the program structure (rounds).
* **Story 16.4: Admin Oversight** - As an Organization Admin, I have global visibility and can manage any program in the organization regardless of assignment.

---

### 🔍 Implementation Status
Status: ✅ DONE

### ✅ Acceptance Criteria Coverage
- Program-specific roles (Lead/HR): ✅ (Implemented in ProgramMember model)
- Creator auto-assignment: ✅ (Handled in createProgram action)
- Role-based action guarding: ✅ (Unified helper in lib/permissions.ts applied to all actions)
- Assigned program filtering: ✅ (Dashboard filters based on assignment for members)

---

# 🛡️ Epic 15: Edge Case Handling & Hardening

* **Story 15.1: Panelist Token Expiration** - Panelist magic links must expire after a configurable duration (e.g., 30 days) or when the program ends, preventing indefinitely active availability submission pages.
* **Story 15.2: Global Availability Conflicts** - When a panelist submits availability for a program, the system must cross-check their existing availability across *all* their programs (matched by email) to prevent double-promising the same time slot to different recruiters.
* **Story 15.3: Resume Parsing Graceful Degradation** - If the AI resume parsing service fails or the PDF is unreadable, candidate creation must still succeed with a `null` score, allowing recruiters to manually review the candidate instead of completely failing the upload.
* **Story 15.4: Panelist-led Slot Deletion Guard** - Panelists must be prevented from removing time slots that are already booked by a candidate, ensuring the source of truth for scheduled interviews remains consistent.
* **Story 15.5: Candidate Double-Booking Prevention** - The system must strictly enforce that a candidate can only have one active `SCHEDULED` booking per round, preventing race conditions where multiple tabs could result in multiple slots being taken.
* **Story 15.6: Orphaned Booking Cleanup** - When a program or round is soft-deleted by a recruiter, all associated future bookings must be automatically marked as `CANCELLED` and their slots restored to panelists.
* **Story 15.13: Premature Promotion Guard** - Recruiters are blocked from promoting a candidate to the next round if they still have a `SCHEDULED` booking in their current round, preventing zombie meetings.
* **Story 15.17: Organization Admin Lockdown** - Only users with the `ADMIN` role can delete hiring programs, ensuring high-stakes destructive actions are restricted to authorized personnel.
* **Story 15.18: Interview History Preservation** - Panelists are soft-deleted instead of hard-deleted, ensuring that completed interview records, scorecards, and historical data remain accessible even after an interviewer is removed from a program.
* **Story 15.19: Transactional Double-Booking Prevention** - Explicit state-machine checks inside Prisma serialized transactions ensure that candidates cannot book two slots simultaneously even if using multiple browser tabs.

---

### 🔍 Implementation Status
Status: ✅ DONE

### ✅ Acceptance Criteria Coverage
- Panelist tokens expire: ✅
- Global availability conflict prevention: ✅
- Graceful resume parsing degradation: ✅
- Panelist-led slot deletion guard: ✅
- Candidate double-booking prevention: ✅
- Orphaned booking cleanup: ✅
- Premature promotion guard: ✅
- Organization admin lockdown: ✅
- Interview history preservation: ✅
- Transactional double-booking prevention: ✅


