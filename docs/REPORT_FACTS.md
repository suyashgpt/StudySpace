# StudySpace Project Report Fact Sheet (Ground Truth)

This file maintains the authoritative facts and technical specifications of the **StudySpace** application. Use this document when preparing the 40–50-page LPU MCA final project report to ensure 100% synchronization between your written report and the real codebase.

---

## 1. Official Project Metadata

- **Official Project Title:**  
  *Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)*
- **Approved Project Description:**  
  *This project lies in developing a simple, centralized web-based system specifically for managing the routine operations of paid study libraries and reading rooms. The proposed system will integrate student record management, attendance tracking, fee payment records, expense monitoring, and basic book inventory management in a single application. Unlike maintaining separate paper registers or spreadsheets, the system will provide an organized dashboard and summary reports to improve record accuracy.*
- **Academic Degree:** Master of Computer Applications (MCA)
- **Institution:** Lovely Professional University (LPU), Punjab, India
- **Evaluation Session:** 2026 Academic Evaluation

---

## 2. Technology Stack & Exact Dependency Versions

- **Node.js Environment:** v24.12.0
- **npm Version:** 11.6.2
- **Core Frontend:**
  - `react`: `^19.3.1`
  - `react-dom`: `^19.3.1`
  - `typescript`: `~6.0.3`
  - `vite`: `^8.3.4`
- **Routing & Navigation:**
  - `react-router-dom`: `^7.18.4`
- **Styling & UI:**
  - `tailwindcss`: `^4.3.3`
  - `@tailwindcss/vite`: `^4.3.3`
  - `lucide-react`: `^1.61.0`
- **Analytics & Charts:**
  - `recharts`: `^3.10.1`
- **Backend & Database SDK:**
  - `@supabase/supabase-js`: `^2.118.0`
- **Testing Framework:**
  - `vitest`: `^5.0.5`

---

## 3. Database Architecture & Schema Tables

Hosted on **Supabase Cloud (PostgreSQL 15)**:
1. `public.profiles` — Administrator identity metadata linked to Supabase Auth (`auth.users`).
2. `public.shift_types` — Configurable study shifts (e.g. 4-hour morning, 8-hour full day) with prices.
3. `public.students` — Student profiles, unique student codes, contact info, assigned shifts, monthly fees, and active/inactive toggles.
4. `public.attendance` — Daily student attendance records. Constraint: `(student_id, attendance_date)` UNIQUE.
5. `public.fee_invoices` — Monthly fee invoices. Constraint: `(student_id, billing_month)` UNIQUE.
6. `public.fee_payments` — Multi-installment payment transactions recorded against invoices with payment methods (cash, UPI, card, bank transfer).
7. `public.expenses` — Facility operational expenditures categorized by type (electricity, water, rent, internet, maintenance, miscellaneous).
8. `public.books` — Reference book catalog and physical copy counts.
9. `public.book_loans` — Book issue and return circulation records with due dates and real-time availability tracking.

---

## 4. Application Routes & Implemented Modules

| Route | Component File | Functional Module |
| :--- | :--- | :--- |
| `/login` | `src/features/auth/LoginPage.tsx` | Administrator Supabase Authentication |
| `/` | `src/features/dashboard/DashboardPage.tsx` | Real-time Analytical Operations Dashboard & Recharts Cashflow |
| `/students` | `src/features/students/StudentListPage.tsx` | Student Records, Code Validation, Search, Filter & Deactivation |
| `/shifts` | `src/features/shifts/ShiftManagerPage.tsx` | Study Shift Tiers, Durations & Configurable Monthly Fees |
| `/attendance` | `src/features/attendance/AttendancePage.tsx` | Daily Register, Date Filtering & Idempotent Upsert Attendance |
| `/fees` | `src/features/fees/FeeManagementPage.tsx` | Monthly Batch Invoicing, Installment Payments & Derived Status |
| `/expenses` | `src/features/expenses/ExpenseListPage.tsx` | Operational Overheads, Categorization & Summary Analytics |
| `/books` | `src/features/books/BookCirculationPage.tsx` | Reference Books Catalog, Dynamic Availability & Loan Circulation |
| `/reports` | `src/features/reports/ReportsPage.tsx` | Date-Range Filtered Analytics & RFC-4180 CSV Data Export |

---

## 5. Implemented Algorithms

- **Algorithm 1:** Student Validation & Duplicate Prevention (`src/lib/validation.ts`, `src/services/studentService.ts`)
- **Algorithm 2:** Idempotent Attendance Recording via PostgreSQL UPSERT (`src/services/attendanceService.ts`)
- **Algorithm 3:** Idempotent Monthly Invoice Batch Generation (`src/services/feeService.ts`)
- **Algorithm 4:** Fee Balance Calculation & Derived Status (`src/lib/calculations.ts` — tested via Vitest)
- **Algorithm 5:** Expense Summaries & Categorization (`src/lib/calculations.ts` — tested via Vitest)
- **Algorithm 6:** Real-Time Book Stock Availability (`src/lib/calculations.ts` — tested via Vitest)
- **Algorithm 7:** Real-Time Dashboard KPI Summaries (`src/services/dashboardService.ts`)
- **Algorithm 8:** RFC-4180 Compliant CSV Export with UTF-8 BOM (`src/lib/calculations.ts` — tested via Vitest)

---

## 6. Verification & Test Outcomes

- **Unit Test Suite:** 10 tests across Algorithm 4, 5, 6, and 8.
  - Result: `1 passed (1 test file)`, `10 passed (10 tests)`.
- **TypeScript Compilation & Build:**
  - Command: `npm run build`
  - Result: Code 0, bundle emitted in `dist/` (assets: `index-Bbgv-l4K.css` 41.58 kB, `index-Bj4YmKfR.js` 996.25 kB).

---

## 7. Report Screenshots Checklist (To be captured from running app)

- [ ] Figure 4.1: Administrator Login Page with authentication validation
- [ ] Figure 4.2: Operations Dashboard displaying real KPI cards and cashflow chart
- [ ] Figure 4.3: Student Management table with search and active/inactive status badges
- [ ] Figure 4.4: Student Enrollment Modal with shift allocation and validation
- [ ] Figure 4.5: Study Shift Management view with duration and pricing cards
- [ ] Figure 4.6: Daily Attendance Register with present/absent counters
- [ ] Figure 4.7: Fee Management table showing invoices and expandable installment history
- [ ] Figure 4.8: Record Payment Modal showing remaining balance validation
- [ ] Figure 4.9: Operational Expenses page with categorized overhead cards
- [ ] Figure 4.10: Book Catalog & Circulation Loans showing real-time copy availability
- [ ] Figure 4.11: Reports & Data Export view with downloaded CSV file opened in spreadsheet
