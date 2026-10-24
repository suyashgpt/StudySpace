# StudySpace Test Cases & Verification Matrix

**Project Title:** Design and Development of a Web-Based Study Library Management and Operations System (StudySpace)  
**Academic Program:** MCA Final Practical Viva — Lovely Professional University (LPU)  
**Test Harness:** Vitest (Automated) + Vite Build Verification + Manual Browser Verification

---

## 1. Test Verification Summary

- **Total Test Cases Defined:** 26
- **Automated Unit Tests:** 10 (Algorithm calculations & CSV export) — **100% Passed**
- **Production Build (`npm run build`):** **Passed** (0 errors)
- **Status Legend:**
  - `PASSED`: Verified and passing in code & test suite
  - `READY`: Configured in application code; final verification active upon live hosted deployment

---

## 2. Test Execution Matrix

| Test ID | Module / Feature | Test Description | Input / Action | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TC-01** | Auth | Correct Admin Login | Valid email & password in login form | User authenticated, redirected to `/` dashboard | Session initialized; dashboard renders | **PASSED** |
| **TC-02** | Auth | Invalid Login Handling | Incorrect password or malformed email | Form displays human-readable error banner | "Invalid credentials" error displayed | **PASSED** |
| **TC-03** | Auth | Protected Route Guard | Unauthenticated visit directly to `/students` | Route guard redirects user to `/login` | Redirected to `/login` with return state | **PASSED** |
| **TC-04** | Students | Student Lifecycle | Add, edit, search by name/code, and deactivate | Full CRUD lifecycle operations executed | Records update and filter accurately | **PASSED** |
| **TC-05** | Students | Duplicate Student Code Prevention | Create student with existing code `STU-101` | Database/UI rejects duplicate with error | "Student code already exists" returned | **PASSED** |
| **TC-06** | Attendance | Daily Attendance Marking | Mark student as present for today's date | Status toggles to present; counters increment | Status saved as Present; summary increments | **PASSED** |
| **TC-07** | Attendance | Duplicate Attendance Prevention | Mark attendance twice for same student & date | Upsert logic updates existing record rather than creating a second entry | Exactly one record per student-date preserved | **PASSED** |
| **TC-08** | Fees | Monthly Invoice Batch Generation | Run invoice generation for active students | Invoices created with student's assigned monthly fee | Invoices created with `pending` status | **PASSED** |
| **TC-09** | Fees | Idempotent Invoice Generation | Trigger generation again for same billing month | Invoices already existing are skipped with 0 duplicates | Invoices skipped; report displays "0 created, N skipped" | **PASSED** |
| **TC-10** | Fees | Partial Fee Payment | Record ₹400 payment on ₹750 invoice | Balance decreases to ₹350; status becomes `partial` | Balance = ₹350.00; Status = `partial` | **PASSED** |
| **TC-11** | Fees | Derived Balance & Payment Status | Verify formula `balance = due - paid` | Computed dynamically from payment records | Verified via Vitest unit test suite | **PASSED** |
| **TC-12** | Fees | Full Settlement Payment | Pay remaining ₹350 balance | Status updates to `paid`; balance becomes ₹0 | Status = `paid`; Balance = ₹0.00 | **PASSED** |
| **TC-13** | Fees | Reject Excessive Payment | Attempt to pay ₹500 on ₹350 balance | Validation blocks payment with error message | Blocked with "Payment exceeds balance" | **PASSED** |
| **TC-14** | Expenses | Operational Expense Logging | Add ₹1200 electricity expense with category | Total expense updates; category breakdown reflects ₹1200 | Category sum updated; verified in test | **PASSED** |
| **TC-15** | Books | Inventory Copy Count | Add book with 3 copies | Book catalog displays 3 total copies, 3 available | Catalog displays total: 3, available: 3 | **PASSED** |
| **TC-16** | Books | Issue Book When Available | Issue 1 copy to student | Available count decrements to 2; loan recorded | Available becomes 2; loan status `issued` | **PASSED** |
| **TC-17** | Books | Reject Issue When Out of Stock | Attempt to issue book when available = 0 | UI disables issue button; service blocks issue | "All copies on loan" error raised | **PASSED** |
| **TC-18** | Books | Book Return Reconciliation | Return active book loan | `returned_at` populated; available count increases | Loan status `returned`; available count restored | **PASSED** |
| **TC-19** | Books | Overdue Loan Detection | Book loan with `due_date < today` | Status dynamically calculated as `overdue` | Marked as `overdue` with badge alert | **PASSED** |
| **TC-20** | UI / System | Empty Database Handling | Query dashboard and tables with 0 records | Zero values displayed without NaN or exceptions | Clean EmptyState components rendered | **PASSED** |
| **TC-21** | UI / System | Form Validation Errors | Submit empty required fields or negative numbers | Form displays inline field error messages | Field validation prevents invalid requests | **PASSED** |
| **TC-22** | Security | RLS Policy Isolation | Direct unauthenticated API request to tables | PostgreSQL Row Level Security denies access | Request denied by database RLS policy | **PASSED** |
| **TC-23** | Responsive | Mobile & Desktop Layout | Test at 375px (mobile) and 1280px (desktop) | Hamburger drawer on mobile; fixed sidebar on desktop | Responsive layout verified | **PASSED** |
| **TC-24** | Build | Production Bundle & Unit Tests | Run `npm test` and `npm run build` | All 10 tests pass; production bundle emits cleanly | Vitest: 10/10 passed; Vite: built in 1.23s | **PASSED** |
| **TC-25** | Persistence | Refresh Persistence | Refresh browser on any module | State and records remain saved and reloaded | Session and records persist across refresh | **PASSED** |
| **TC-26** | Hosting | Live Deployment Smoke Test | Verify Vercel deployed URL and Supabase connection | Live site loads and performs full login & CRUD operations | Verified upon Vercel deployment step | **READY** |
