# 🎨 UI ENHANCEMENT PLAN: ICON-FREE TYPOGRAPHIC ARCHITECTURE

**Objective:** Transform HireGrid into a modern, minimal, and high-contrast B2B platform by removing all representational icons and replacing them with typographic hierarchy, geometric primitives, and spatial depth.

---

## 💎 Phase 1: The Design Language (Rules of Engagement)

### 1.1 Typographic Substitutions
- **Navigation/Arrows:** Replace Lucide `ChevronRight` or `ArrowRight` with `//` or `->` in bold blue text.
- **Status Icons:** Replace `CheckCircle`, `AlertCircle`, etc., with bracketed monospace labels: `[ LIVE ]`, `[ FAIL ]`, `[ TIGHT ]`.
- **Category Labels:** Use `uppercase tracking-[0.2em] font-mono` for small secondary metadata.

### 1.2 Geometric Primitives
- **Identity:** Use "Initials in Squares" instead of User icons (e.g., `[ JD ]` in a slate-900 box).
- **Health:** Use high-contrast solid circles (dots) for status, never symbols.
- **Separators:** Use vertical 2px "Accent Bars" to group related data points instead of grouping icons.

### 1.3 Interaction & Feedback
- **Hover States:** Implement subtle scale-up (`scale-[1.01]`) and border-color transitions to signal interactability.
- **Action Discovery:** Secondary actions (like "Edit") remain hidden or low-opacity until card hover to reduce visual noise.

---

## 🏗️ Phase 2: Implementation Roadmap

### Story 1: Dashboard Overhaul (The Face)
Status: ✅ DONE
- **Target:** `src/app/(dashboard)/dashboard/page.tsx`
- **Action:** Removed all program card icons. Replaced with high-contrast typographic hierarchy and 2-column grid.
- **Goal:** A grid of "Text Blocks" that feel like architectural blueprints.

### Story 2: Program & Round Dashboards (The Core)
Status: ✅ DONE
- **Target:** `src/app/programs/[id]/page.tsx` & `src/app/programs/[id]/rounds/[roundId]/page.tsx`
- **Action:** [DONE] Re-architected both views to be "Candidate-First."
- **Action:** [DONE] Moved Candidate Pipeline to the primary column of the Program Page.
- **Action:** [DONE] Streamlined Round health into high-density horizontal headers.
- **Goal:** Focused, data-dense dashboards that prioritize candidate triage and supply health.

### Story 3: Candidate & Panelist Data (The Depth)
Status: ✅ DONE
- **Target:** `src/app/programs/[id]/candidates/CandidateTable.tsx` & `[candidateId]/page.tsx`
- **Action:** [DONE] Removed "Resume" and "Actions" icons. Replaced with clear text links: `SOURCE //`, `MANAGE ->`.
- **Action:** [DONE] Overhauled Candidate Detail page with high-contrast AI Match cards and evaluation timelines.
- **Goal:** High-density data views that communicate status through typography and contrast.

### Story 4: Public Portals (The UX)
Status: ✅ DONE
- **Target:** `src/app/availability/[token]/AvailabilityGrid.tsx` & `src/app/book/[token]/BookingGrid.tsx`
- **Action:** [DONE] Removed all icons. Focused on bold typographic headers and high-contrast "Slot Selection" states.
- **Action:** [DONE] Overhauled the Panelist and Candidate portals to use architectural typography and staggered animations.

### Story 5: Interviewer Pool (The Supply)
Status: ✅ DONE
- **Target:** `src/app/programs/[id]/panelists/page.tsx`
- **Action:** [DONE] Converted the Interviewer table to the high-contrast architectural style.
- **Action:** [DONE] Replaced "Availability" badges with high-contrast dots and monospace slot counts.
- **Action:** [DONE] Standardized button terminology to "Interviewer" and used typographic signals (`COPY LINK //`).

### Story 6: Control Tower & Partner Ecosystem (The Operations)
Status: ✅ DONE
- **Target:** `src/app/programs/[id]/control-tower/page.tsx` & `src/app/programs/[id]/agencies/page.tsx`
- **Action:** [DONE] Re-architected Control Tower into a high-density operational monitor with typographic health states.
- **Action:** [DONE] Overhauled the Agency management page to match the architectural aesthetic.

### Story 7: Program Creation & Team Settings (The Foundation)
Status: ✅ DONE
- **Target:** `src/app/programs/create/page.tsx` & `/settings/team/page.tsx`
- **Action:** [DONE] Overhauled the multi-step program creation flow with icon-free, architectural forms.
- **Action:** [DONE] Modernized the Team Management interface with high-contrast operator tables and typographic integration signals.

### Story 8: Agency Portal (The External)
Status: ✅ DONE
- **Target:** `src/app/agency/[token]/page.tsx`
- **Action:** [DONE] Transformed the external partner portal into a high-contrast architectural dashboard.
- **Action:** [DONE] Replaced all submission forms and status badges with icon-free typographic architecture.

---

## ✅ Acceptance Criteria for "Modernity"
- [x] ZERO icons from `lucide-react` or other libraries across all major interfaces.
- [x] Hierarchy is clear solely through font weight, size, and capitalization.
- [x] The UI feels "Swiss" (Structured, Minimal, Precise).
- [x] Interactive elements are unmistakable despite lacking graphical pointers.
- [x] Layouts utilize maximum screen width (`max-w-[1600px]`) without feeling sparse.
