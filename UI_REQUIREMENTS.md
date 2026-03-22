# 🎨 HireGrid: Unified UI Requirements Document

This document serves as the single source of truth for the user interface, design system, and interaction patterns of the HireGrid platform.

---

## 💎 1. Design System & Aesthetic Core
HireGrid follows a **"B2B Premium"** aesthetic—clean, data-dense, yet visually breathing.

*   **Color Palette:**
    *   *Primary:* Blue (`#2563EB`) for actions and primary branding.
    *   *Background:* Slate-50 (`#F8FAFC`) for page backgrounds; pure White (`#FFFFFF`) for cards.
    *   *Typography:* Slate-900 for headings, Slate-500 for body text.
    *   *Status Semantic Colors:* 
        *   Healthy/Success: Emerald (`#10B981`)
        *   Warning/Tight: Amber (`#F59E0B`)
        *   Deficit/Critical: Rose (`#E11D48`)
        *   Automated/Special: Purple (`#A855F7`)
*   **Border Radius:** Large, rounded corners (`24px` for main cards, `12px` for buttons/inputs) to soften the enterprise feel.
*   **Shadows:** Soft, subtle elevation (`shadow-sm`) with specific colored glows for high-impact buttons (e.g., `shadow-blue-200`).

---

## 🏠 2. Internal Dashboard (Recruiter/Admin)

### 2.1 Global Layout
*   **Navigation:** Top navigation for branding/user profile; Sidebar for program-specific context.
*   **Breadcrumbs:** Mandatory on every sub-page for deep-nesting navigation (e.g., *Dashboard > Frontend Program > Rounds > Technical Interview*).

### 2.2 Program Detail View (`/programs/[id]`)
*   **Stats Bar:** High-level summary of Rounds, Panelists, Candidates, and Agencies.
*   **Round Timeline:** A vertical or horizontal visual representation of the hiring sequence.
*   **Pipeline Navigation:** Large, clickable action cards for "Candidates", "Panelists", and "Control Tower".

### 2.3 Granular Round View (`/programs/[id]/rounds/[roundId]`)
*   **Health Delta:** A prominent "Supply vs. Demand" counter showing `Unbooked Slots - Active Candidates`.
*   **Panelist Roster:** List of assigned panelists with a "slot meter" (visual bars showing free vs. booked capacity).
*   **Focus Areas:** Display of AI-driven rubric focus areas with an edit interface.

### 2.4 Candidate Pipeline (`/programs/[id]/candidates`)
*   **Tabbed Interface:** "Pipeline" (Active) vs "Screening Queue" (New/Agency).
*   **Bulk Action Bar:** Floating dark bar that appears upon selection (Move to Round, Reject All).
*   **Candidate Table:** Data-dense rows showing AI scores, current role, and interactive status badges.

---

## 🔗 3. Public Magic Link Portals

### 3.1 Panelist Availability Portal (`/availability/[token]`)
*   **Unified Sidebar:** If a panelist is in multiple programs, show a switcher to manage all availability in one place.
*   **Time Snapping Grid:** A calendar-style grid that **only** allows selection in blocks matching the Round duration (e.g., 60m blocks).
*   **Evaluation Archive:** A dedicated tab for "Past Evaluations" where panelists can see candidates they've already scored.

### 3.2 Candidate Booking Portal (`/book/[token]`)
*   **Optimistic Flow:** When a slot is clicked, show an immediate "Confirming..." pulse state to provide transactional confidence.
*   **Timezone Intelligence:** Clearly state the timezone of the slots being displayed.
*   **Withdrawal Option:** A clear "I am no longer interested" link to trigger the withdrawal state machine.

### 3.3 Agency Dashboard (`/agency/[token]`)
*   **Read-Only Pipeline:** A status tracker for every candidate they submitted.
*   **Headless Upload:** A drag-and-drop zone for resumes that automatically extracts data.

---

## 🤖 4. Intelligence & AI UI Requirements

### 4.1 AI Resume Insights
*   **Match Meter:** A circular gauge (0-100) showing how well the candidate fits the role.
*   **AI Reason Tooltip:** Hover state explaining *why* the AI gave that specific score based on the resume.

### 4.2 AI Fulfillment Status
*   **Visibility:** If a Google Calendar invite fails to send, the UI must show a "rose-colored" error banner in the Control Tower with a "Fix Manually" button.

### 4.3 Dynamic Rubrics
*   **Interviewer View:** Within the Panelist Portal, show a list of suggested questions tailored to the candidate's resume and the round's focus areas.

---

## ⚡ 5. Interaction Standards
*   **Empty States:** Every list/table must have a "Design-First" empty state (illustrations + CTA).
*   **Loading States:** Use skeletons for table rows and pulse animations for status-changing actions.
*   **Feedback Loops:** Use `sonner` toasts for all server action results (Success/Error).
*   **Concurrency Handling:** If a candidate attempts to book a taken slot, show a "Conflict" modal with a "Refresh Slots" action.
