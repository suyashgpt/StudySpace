# Project Implementation Plan: StudySpace

**Official Title:** Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)  
**Institution:** Lovely Professional University (LPU) — MCA Final Project  
**Author / Student:** MCA Candidate  
**Target Architecture:** React + TypeScript + Vite + Tailwind CSS (Frontend) + Supabase (PostgreSQL, Auth, RLS) + Vercel (Hosting)

---

## 1. Project Overview & Scope
StudySpace is a centralized web application tailored for managing the routine operations of paid study libraries and reading rooms. It replaces error-prone paper registers and fragmented spreadsheets with a unified system managing:
- Student admission, profile, and status tracking (Active/Inactive)
- Study shift management with configurable slots and fees
- Daily attendance tracking with zero duplicate record guarantees
- Invoicing and installment/partial fee payments recording
- Daily operational expense tracking categorized by type
- Book cataloging, availability tracking, and issue/return circulation
- Real-time analytical dashboard with revenue, expense, and occupancy metrics
- Tabular reporting with date-range filters and CSV export

---

## 2. Project Milestones & Acceptance Criteria

### Milestone 1: Workspace & Application Architecture (Foundation)
- **Status:** In Progress
- **Tasks:**
  - Scaffold React 18+ / Vite project with TypeScript directly in workspace root.
  - Install core dependencies: Tailwind CSS, React Router DOM, Lucide React, Recharts, `@supabase/supabase-js`, Vitest.
  - Establish modular folder structure (`src/components`, `src/layouts`, `src/features`, `src/lib`, `src/types`, `src/services`, `src/utils`).
  - Configure Tailwind styling, color tokens, and responsive layout primitives.
  - Set up Vitest testing harness and `.env.example`.
- **Acceptance Criteria:**
  - `npm run build` succeeds cleanly without TypeScript or styling errors.
  - Development server runs and displays responsive base layout.
  - Unit test suite executes and passes.

### Milestone 2: Supabase Schema, Migrations & Authentication
- **Tasks:**
  - Design relational PostgreSQL schema with 8 core tables:
    - `profiles` (Admin credentials metadata)
    - `shift_types` (4hr, 8hr, custom shifts & pricing)
    - `students` (Student profile, code, shift link, monthly fee)
    - `attendance` (Student attendance records per date)
    - `fee_invoices` (Monthly invoices linked to students)
    - `fee_payments` (Individual installment/payment records against invoices)
    - `expenses` (Operational expenses with category breakdown)
    - `books` (Inventory catalog & copy counts)
    - `book_loans` (Book issues, due dates, return dates)
  - Define composite unique keys, foreign keys, and check constraints (e.g. `(student_id, attendance_date)`, `(student_id, billing_month)`).
  - Write idempotent SQL migration scripts in `supabase/migrations/`.
  - Configure Row Level Security (RLS) policies enforcing authenticated admin access.
  - Implement Supabase Auth login/logout flow with persistent session handling and protected route guards.
- **Acceptance Criteria:**
  - Valid migration scripts execute cleanly.
  - Unauthenticated access to protected routes is redirected to `/login`.
  - Authenticated session persists across browser page reloads.

### Milestone 3: Core Operations Modules (CRUD & Workflows)
- **Module C (Students):** Code auto-generation/input, validation, shift assignment, edit, search, filter, safe deactivation.
- **Module H (Study Shifts):** Shift creation, duration & fee configuration, active/inactive toggles.
- **Module D (Attendance):** Date-based attendance register, present/absent toggling, unique constraint upsert, daily summary counters.
- **Module E (Fee Management):** Single & bulk monthly invoice generation, payment installment recording, outstanding balance calculation, payment status derivation.
- **Module F (Expenses):** Operational expenditure logging, categorization (Electricity, Rent, Water, Wifi, Maintenance, Misc), date filtering.
- **Module G (Book Circulation):** Inventory management, real-time copy availability calculation (`total - unreturned loans`), issue tracking, return reconciliation.
- **Acceptance Criteria:**
  - All forms validate required fields and positive monetary amounts.
  - All actions persist directly to Supabase and update UI reactively.
  - Duplicate attendance and duplicate monthly invoices are physically prevented at database and UI layers.

### Milestone 4: Analytical Dashboard, Reports & Data Export
- **Module B (Dashboard):**
  - KPI cards: Active students, today's attendance count, current month collections, outstanding fee balance, current month expenses, total books, currently issued books, overdue loans.
  - Financial cashflow bar/line chart (collections vs expenses) using real records.
  - Quick action shortcuts.
- **Module I (Reports & Export):**
  - Date-range filtered reports for Attendance, Fee Collections, Outstanding Fees, Expenses, and Book Circulation.
  - RFC 4180 compliant CSV export with proper quotation and escaping.
- **Acceptance Criteria:**
  - Empty database returns clean zero states without errors.
  - Date filtering recalculates totals accurately.
  - CSV export downloads valid files with accurate record counts.

### Milestone 5: Testing, Quality Assurance & Edge Case Verification
- **Tasks:**
  - Unit tests for core algorithms:
    - Algorithm 1: Student validation & code uniqueness checks
    - Algorithm 2: Attendance upsert & uniqueness logic
    - Algorithm 3: Safe batch invoice generation logic
    - Algorithm 4: Fee payment status derivation & balance calculation
    - Algorithm 5: Expense category summation
    - Algorithm 6: Real-time book copy availability derivation
    - Algorithm 7: Dashboard metrics aggregation
    - Algorithm 8: CSV escaping & formatting
  - Comprehensive manual testing of all 26 required test cases.
  - Responsive verification on mobile (375px), tablet (768px), and desktop (1280px+).
- **Acceptance Criteria:**
  - 100% of defined unit tests pass.
  - All 26 manual test cases documented in `docs/TEST_CASES.md`.

### Milestone 6: Deployment & Production Hosting
- **Tasks:**
  - Deploy frontend to Vercel with environment variable configuration.
  - Verify live Supabase production database connectivity.
  - Smoke-test full admin login, student creation, attendance, fee collection, and book issuance on live domain.
- **Acceptance Criteria:**
  - Live HTTPS URL active and tested.
  - No secret keys exposed in client bundles or public repositories.

### Milestone 7: Academic Viva Preparation & Documentation Report
- **Tasks:**
  - Maintain synchronized technical documentation:
    - `README.md`
    - `docs/ARCHITECTURE.md`
    - `docs/DATABASE_SCHEMA.md`
    - `docs/ALGORITHMS.md`
    - `docs/TEST_CASES.md`
    - `docs/VIVA_NOTES.md` (Beginner, Intermediate, Advanced questions & answers)
    - `docs/REPORT_FACTS.md`
  - Prepare LPU-compliant MCA project report outline & editable draft adhering to official formatting guidelines.
- **Acceptance Criteria:**
  - Documentation accurately reflects production code without fictional metrics.
  - Comprehensive Viva Q&A covering every technical and architectural decision.
