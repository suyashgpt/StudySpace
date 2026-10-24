# StudySpace: Web-Based Study Library Management and Operations System

**Academic Project for Master of Computer Applications (MCA) Degree Evaluation**  
**Institution:** Lovely Professional University (LPU), Punjab, India  
**Official Project Title:** *"Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)"*

---

## 1. Project Introduction & Description

This project develops a centralized web-based operations management application specifically tailored for managing the routine workflows of paid study libraries and reading rooms. 

Unlike conventional public or academic university libraries that primarily focus on book catalog lending, paid study libraries cater to competitive examination aspirants (e.g., UPSC, GATE, Banking, Judiciary) who rent dedicated study seats across designated shifts (e.g., 4-hour morning, 8-hour full-day, night shifts).

Operating these reading facilities manually using paper registers or unlinked spreadsheets leads to record inaccuracies, duplicate fee entries, missed renewals, untracked utility expenses, and unaccounted reference books. **StudySpace** provides a unified dashboard and automated recordkeeping engine to streamline daily operations.

---

## 2. Primary Project Objectives

1. **Centralize Student Records:** Single authoritative database for student admissions, contact details, assigned shifts, and membership status.
2. **Attendance Tracking:** Mark and audit daily student attendance with composite unique constraints preventing duplicate logging.
3. **Automated Monthly Invoicing & Partial Fees:** Batch generate monthly fee invoices while skipping existing entries, and track multi-installment payments with dynamic status derivation.
4. **Expense Monitoring:** Track operational facility overheads (electricity, premises rent, high-speed WiFi, drinking water, maintenance) categorized by type.
5. **Book Circulation & Real-Time Availability:** Maintain reference books catalog with dynamic copy availability calculation ($\text{available} = \text{total} - \text{active loans}$) and prevent over-issuance.
6. **Configurable Study Shifts:** Manage flexible shift durations and pricing tiers.
7. **Real-Time Analytics & RFC-4180 CSV Export:** Provide analytical KPI dashboard and date-range filtered reporting with spreadsheet exports.
8. **Security & Data Integrity:** Protect multi-table relational schema with PostgreSQL Row Level Security (RLS) policies and Supabase Auth.

---

## 3. Technology Stack & Architectural Justifications

| Tier | Technology | Purpose & Academic Justification |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** | Component-driven declarative UI architecture enabling reactive updates across statistics and state. |
| **Language** | **TypeScript** | Static type safety and compile-time contract enforcement matching relational database entities. |
| **Build Tool** | **Vite 8** | High-performance build tool with instantaneous Hot Module Replacement (HMR) and optimized rollup production bundling. |
| **Styling** | **Tailwind CSS v4** | Utility-first responsive styling framework ensuring mobile-to-desktop accessibility and executive aesthetics. |
| **Navigation** | **React Router DOM 7** | Client-side routing with session-protected route guards. |
| **Visual Analytics** | **Recharts** | Declarative composable charting library for monthly cashflow visualization. |
| **Icons** | **Lucide React** | Clean, accessible iconography. |
| **Backend & DB** | **Supabase (PostgreSQL 15)** | Relational PostgreSQL database with PostgREST, built-in Auth, and server-side Row Level Security (RLS). |
| **Unit Testing** | **Vitest** | Fast test runner verifying business logic, financial balance algorithms, and CSV serializers. |
| **Hosting** | **Vercel** | Edge CDN deployment for low latency and automated HTTPS delivery. |

---

## 4. System Architecture & Data Flow

```
Administrator Web Client (Desktop / Tablet / Mobile)
        │
        ▼ (HTTPS / TLS 1.3)
Vercel Edge Network (React 19 SPA)
        │
        ▼ (PostgREST / Supabase JS SDK)
Supabase Platform (AWS ap-south-1 Mumbai)
  ├── Supabase Auth (JWT Token Verification)
  └── PostgreSQL 15 Relational Database
        ├── Row Level Security (RLS) Policy Gates
        ├── Composite Unique Constraints (Duplicate Prevention)
        └── B-Tree Performance Indexes
```

---

## 5. Local Setup & Execution Guide

### Prerequisites
- Node.js version 18+ or 20+ (tested on Node v24.12.0)
- npm version 9+ (tested on npm 11.6.2)

### Installation Steps

1. **Clone or Open the Repository:**
   ```bash
   cd "d:/suyas/workspace/webDev/StudySpace (Library Mngmt Site)"
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Populate your Supabase Project URL and Public Anon Key:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   *(Note: The application includes a self-contained demonstration mode for initial testing if Supabase credentials are not yet configured).*

4. **Run Database Migrations in Supabase:**
   - Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
   - Navigate to the **SQL Editor**.
   - Open and execute the script: [`supabase/migrations/20261024_initial_schema.sql`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/supabase/migrations/20261024_initial_schema.sql).

5. **Start Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

6. **Run Unit Tests:**
   ```bash
   npm test
   ```

7. **Compile Production Bundle:**
   ```bash
   npm run build
   ```

---

## 6. Testing & Quality Assurance

The test suite is powered by **Vitest** and covers all fundamental algorithms:
- `Algorithm 4`: Fee balance calculation, installment accumulation, and status derivation (`pending` / `partial` / `paid`).
- `Algorithm 5`: Expense summarization by category and date interval.
- `Algorithm 6`: Real-time physical book availability and issue locking.
- `Algorithm 8`: RFC-4180 CSV serialization, quoting, and newline escaping.

Execute tests via:
```bash
npm test
```

---

## 7. Project Documentation Index

- [`docs/PROJECT_PLAN.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/PROJECT_PLAN.md) — Scope, Milestones, and Acceptance Criteria.
- [`docs/ARCHITECTURE.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/ARCHITECTURE.md) — System Architecture, Data Flow, and Component Design.
- [`docs/DATABASE_SCHEMA.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/DATABASE_SCHEMA.md) — PostgreSQL Schema, Foreign Keys, Indexes, and RLS Policies.
- [`docs/ALGORITHMS.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/ALGORITHMS.md) — Pseudocode, Complexity Analysis, and Worked Examples.
- [`docs/TEST_CASES.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/TEST_CASES.md) — Matrix of 26 Verified Test Scenarios.
- [`docs/VIVA_NOTES.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/VIVA_NOTES.md) — Academic Viva Defense Guide (Beginner, Intermediate, Advanced Q&A).
- [`docs/REPORT_FACTS.md`](file:///d:/suyas/workspace/webDev/StudySpace%20(Library%20Mngmt%20Site)/docs/REPORT_FACTS.md) — Verified Facts & Statistics for LPU Final Project Report.

---

## 8. Known Limitations & Future Enhancements

- **Current Version:** Built for single-administrator reading facility management with manual cash/UPI receipt recording. Real banking payment gateway integration (Razorpay/Stripe) is outside the academic scope.
- **Future Enhancements:** Biometric fingerprint / RFID turnstile integration for automated entry/exit logging, automated WhatsApp / SMS fee due alerts, and student self-service seat reservation portal.
