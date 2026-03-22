# 🚀 HireGrid: The Complete Organization Hiring Journey

This document outlines the end-to-end workflow for an organization using HireGrid, from initial setup to a successful hire.

---

## 🟢 Phase 1: Foundation & Team Setup
**Objective:** Establish the workspace and assemble the recruiting team.

1.  **Organization Creation:** 
    *   The first user signs up and creates an **Organization** (e.g., "TechCorp"). 
    *   This user is automatically assigned the **Organization Admin** role.
2.  **Infrastructure Connectivity:**
    *   The Admin connects the organization's **Google Workspace** in Team Settings.
    *   This enables the AI Agent to create calendar invites and Google Meet links automatically.
3.  **Staff Onboarding:**
    *   Admin invites colleagues (e.g., "Jane Recruiter") via email as **Staff Members**.
    *   **Auto-Join:** When Jane signs up, HireGrid recognizes her email and automatically joins her to TechCorp, skipping organization setup.

---

## 🔵 Phase 2: Program Architecture
**Objective:** Define the "Hiring Supply Chain" for a specific role.

1.  **Program Creation:**
    *   Jane (Staff Member) creates a **Program** called "Senior Frontend Engineer".
    *   She defines the **Rounds** (e.g., Round 1: Coding - 60 min, Round 2: Architecture - 90 min).
    *   **Ownership:** Jane is automatically assigned as the **Program Lead** for this specific program.
2.  **Staff Assignment:**
    *   Jane assigns "Bob Coordinator" to the program as **Program HR** to help with candidate management.
3.  **Supply Generation (Panelists):**
    *   Jane invites engineering managers as **Panelists** for specific rounds.
    *   Panelists receive a **Magic Link** where they mark their available blocks.
    *   **Unified Portal:** If a panelist is in multiple programs, they can switch between them in their sidebar to manage their total availability.

---

## 🔐 Roles & Permissions Matrix
**Objective:** Understanding team authority levels.

| Action | Organization Admin | Program Lead | Program HR |
| :--- | :---: | :---: | :---: |
| **View Pipeline & Stats** | ✅ | ✅ | ✅ |
| **Add/Reject Candidates** | ✅ | ✅ | ✅ |
| **Promote Candidates** | ✅ | ✅ | ✅ |
| **Invite/Nudge Panelists** | ✅ | ✅ | ✅ |
| **Manage Bookings** | ✅ | ✅ | ✅ |
| **Access Control Tower** | ✅ | ✅ | ✅ |
| **Edit Rounds (Structure)** | ✅ | ✅ | ❌ |
| **Manage Program Team** | ✅ | ✅ | ❌ |
| **Delete Program** | ✅ | ✅ | ❌ |

**Staff Assignment:** Admins or Leads manage assignments at `/programs/[id]/team`. A user can have different roles across different programs.

---

## 🟡 Phase 3: The Demand Pipeline
**Objective:** Ingest and filter talent.

1.  **Candidate Ingestion:**
    *   Candidates are added via CSV bulk upload or manual entry.
    *   **AI Match Score:** HireGrid immediately parses their resume, assigning a score (0-100%) and extracting their current role and experience.
2.  **Shortlisting:**
    *   Jane reviews the scores in the **Candidate Table** and moves top candidates from `DRAFT` to `ACTIVE` for Round 1.
3.  **Self-Scheduling:**
    *   Active candidates receive an automated email with a **Booking Magic Link**.
    *   The candidate picks a slot that works for them. HireGrid's **Transactional Lock** ensures two candidates never book the same slot simultaneously.

---

## 🤖 Phase 4: AI Fulfillment & Interview
**Objective:** Automated execution of the interview.

1.  **Event Dispatching:**
    *   As soon as a candidate books, an **AI Agent (via MCP)** creates a Google Calendar event.
    *   It adds the candidate and panelist, generates a **Google Meet link**, and sends the invites.
2.  **Interviewer Prep:**
    *   The Panelist checks their portal and sees the **AI Interview Rubric**, which suggests specific questions based on the candidate's resume and the round's goals.
3.  **The Interview:**
    *   The interview takes place on Google Meet.

---

## 🔴 Phase 5: Evaluation & Promotion
**Objective:** Data-driven decision making.

1.  **Scorecard Submission:**
    *   After the call, the Panelist submits a **Scorecard** (1-5 score + PASS/FAIL verdict) in their portal.
2.  **State Machine Trigger:**
    *   If the panelist marks "FAIL", the candidate is automatically moved to `REJECTED`.
    *   If "PASS", Jane receives a notification in the **Control Tower**.
3.  **Round Promotion:**
    *   Jane clicks **"Promote"** to move the candidate to Round 2.
    *   The cycle repeats: A new booking link is sent, and the candidate schedules their next round.

---

## 🏁 Phase 6: Operational Oversight
**Objective:** Managing the "Big Picture".

1.  **Control Tower Monitoring:**
    *   Admins and Leads monitor the **Capacity Math** (`Supply - Demand`). 
    *   If too many candidates are waiting for slots, the UI shows a **"Capacity Deficit"** alert, signaling Jane to invite more panelists.
2.  **Lifecycle Management:**
    *   Jane can **Reassign** a panelist if one falls sick or **Mark as No-Show** if a candidate misses the call.
3.  **PII Cleanup:**
    *   Every 90 days, the system runs an automated cleanup to anonymize candidate data and delete resumes for compliance.
