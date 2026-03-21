# HireGrid

AI-powered hiring supply chain platform. Balances panelist time slots (supply) against candidate interview demand across multi-round hiring programs.

## Architecture

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database**: PostgreSQL via Prisma ORM (output: `src/generated/prisma`)
- **Auth**: Better Auth with Prisma adapter (email + password). Secret: `BETTER_AUTH_SECRET` env var.
- **UI**: Tailwind CSS v4, clean zinc/white aesthetic — no animations, no icons
- **Email**: Resend (pending integration)
- **AI scoring**: OpenAI (pending integration)
- **Excel parsing**: `xlsx` package (server-side)
- **Package manager**: npm

## Key Directories

```
src/
  app/
    (dashboard)/        # Protected layout: session + org membership check
      dashboard/        # Main dashboard with real DB stats
      layout.tsx        # Auth guard: redirects to /sign-in or /onboarding
    (onboarding)/       # Org setup flow (post-registration)
      onboarding/       # OnboardingForm.tsx client component
    programs/
      create/           # CreateProgramForm.tsx (server action)
      [id]/             # Program detail (rounds, stats, nav to sub-pages)
        panelists/      # Manage panelists, generate magic links
        candidates/     # Pipeline tab + Screening Queue tab; add/bulk-upload candidates
        agencies/       # Create agency links; table with copy link + candidate count
        control-tower/  # Supply/demand deficit view
    availability/[token]/ # Headless: panelist magic link availability grid
    book/[token]/         # Headless: candidate self-booking grid
    agency/[token]/       # Headless: agency portal (individual + bulk submit)
    api/
      template/candidates/ # GET: download Excel template (.xlsx) for bulk upload
    sign-in/            # Better Auth sign-in route
    sign-up/            # Better Auth sign-up route
  actions/              # Server Actions
    onboarding.ts
    programs.ts
    panelists.ts
    candidates.ts       # addCandidate, bulkUploadCandidates, approveScreening,
                        #   shortlistAndActivate, rejectCandidate, confirmBooking,
                        #   updateCandidateResume
    agencies.ts         # createAgency, deleteAgency, agencySubmitCandidate, agencyBulkUpload
  components/PageComponents/
    sidebar.tsx         # Text-only sidebar (client)
    SidebarShell.tsx    # Mobile state wrapper (client)
  lib/
    auth.ts             # Better Auth server instance
    auth-client.ts      # Better Auth client (signIn, signUp, signOut)
    prisma.ts           # Prisma client singleton
    tokens.ts           # Crypto token generation
  middleware.ts         # Edge: cookie-based auth guard for /dashboard, /programs
```

## Auth Flow

1. Register → `/onboarding` → create org → `/dashboard`
2. Login → `/dashboard`
3. `/dashboard` layout checks: session → org membership → render
4. Middleware (edge): checks cookie presence for `/dashboard/*` and `/programs/*`
5. `/agency/[token]` and `/book/[token]` and `/availability/[token]` are fully public

## Data Model (Prisma)

- `User` / `Session` / `Account` / `Verification` — Better Auth tables
- `Organization` + `OrganizationMember` — multi-tenant workspace
- `Program` → `Round[]` — hiring programs with typed rounds
- `ProgramPanelist` — magic link token, `availableSlots` JSON, linked to round
- `Agency` — per-program agency with `magicLinkToken`; candidates linked via `agencyId`
- `Candidate` — expanded profile (phone, linkedIn, currentRole, currentCompany,
  yearsExperience, resumeUrl, notes, source DIRECT/AGENCY, agencyId)
  Status FSM: SCREENING → DRAFT → SHORTLISTED → ACTIVE → BOOKED → COMPLETED | REJECTED
- `Booking` — confirmed slot linking candidate ↔ panelist

## Candidate Flow

### Direct (recruiter-added):
Add via form or bulk Excel upload → DRAFT → activate for booking (ACTIVE) → BOOKED → COMPLETED

### Agency-submitted:
Agency uses magic link portal → submits individually or via bulk Excel → SCREENING →
recruiter approves (DRAFT) or rejects → ACTIVE → BOOKED → COMPLETED

## shadcn/ui Components Installed

button, input, label, card, badge, select, textarea, table, separator, alert-dialog,
alert, breadcrumb, tooltip, progress, avatar, dropdown-menu, tabs

## Environment Variables

- `DATABASE_URL` — PostgreSQL connection string (required)
- `BETTER_AUTH_SECRET` — Auth secret (required)
- `NEXT_PUBLIC_API_URL` — Optional: base URL for auth client
- `NEXTAUTH_URL` or `NEXT_PUBLIC_APP_URL` — Used to build agency portal links

## Running

```bash
npm run dev     # prisma generate + next dev on port 5000
npm run build
npx prisma db push   # apply schema changes to DB
npx prisma generate  # regenerate client after schema changes
```

## Design

Clean, minimal, no flash. Zinc palette. White backgrounds. No icons in navigation (text only). No animations. Thin borders. Typographic hierarchy.
