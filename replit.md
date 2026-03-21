# HireGrid AI

An AI-powered hiring management platform built with Next.js 15, Prisma, and Better Auth.

## Architecture

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: Better Auth with Prisma adapter (email + password)
- **UI**: Tailwind CSS v4, Radix UI, Framer Motion, shadcn/ui
- **Package manager**: npm

## Key Directories

- `src/app/` — Next.js App Router pages and API routes
- `src/lib/` — Shared utilities: `auth.ts` (server auth), `auth-client.ts` (client auth), `prisma.ts`
- `src/components/` — Shared UI components
- `prisma/schema.prisma` — Database schema (Users, Orgs, Programs, Rounds, Applicants)
- `src/generated/prisma/` — Auto-generated Prisma client (do not edit)

## Environment Variables / Secrets

- `DATABASE_URL` — PostgreSQL connection string (required)
- `NEXT_PUBLIC_API_URL` — Optional: base URL for auth client; falls back to `window.location.origin`

## Running the App

The dev script auto-generates the Prisma client before starting Next.js:

```
npm run dev   # runs on port 5000, host 0.0.0.0
npm run build
npm run start
```

## Replit Configuration

- Port: **5000** (required for Replit webview)
- Host: **0.0.0.0** (required for Replit proxy)
- Workflow: "Start application" → `npm run dev`
