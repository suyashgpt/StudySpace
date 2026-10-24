# StudySpace Algorithms & Business Logic

This document details the core algorithms and computational procedures implemented in **StudySpace**, formatted for academic project evaluation and practical viva defense.

---

## Algorithm 1: Student Validation and Duplicate Code Prevention

- **Module:** Student Management (`src/features/students/StudentModal.tsx`, `src/services/studentService.ts`)
- **Objective:** Ensure student attributes satisfy operational constraints and enforce system-wide uniqueness on `student_code`.
- **Inputs:** Student form object `{ student_code, full_name, contact_number, enrollment_date, shift_id, monthly_fee }`.
- **Outputs:** Validated student entity inserted/updated in database, or validation error message.

### Pseudocode:
```text
1. Procedure ValidateAndSaveStudent(studentInput):
2.    Trim all string inputs.
3.    If studentInput.student_code is empty or length < 3:
4.        Raise ValidationError("Valid Student Code is required (min 3 chars).")
5.    If studentInput.full_name is empty:
6.        Raise ValidationError("Full Name is required.")
7.    If studentInput.monthly_fee < 0:
8.        Raise ValidationError("Monthly fee cannot be negative.")
9.    If studentInput.contact_number is provided AND not matches /^[0-9]{10}$/:
10.       Raise ValidationError("Contact number must be a 10-digit phone number.")
11.   Attempt database INSERT INTO students VALUES (...)
12.   Catch DatabaseUniqueViolationException (uq_students_student_code):
13.       Return UserFriendlyError("Student Code already exists. Please assign a unique code.")
14.   Return Success(studentRecord)
```
- **Time Complexity:** $O(1)$ client validation; $O(\log N)$ database B-tree index lookup on `student_code`.
- **Edge Cases:** Whitespace-only strings, duplicate codes generated concurrently, negative fee amounts.

---

## Algorithm 2: Attendance Recording and Upsert

- **Module:** Attendance Management (`src/features/attendance/AttendancePage.tsx`, `src/services/attendanceService.ts`)
- **Objective:** Mark or update daily attendance for a student on a specific date without generating duplicate entries.
- **Inputs:** `student_id` (UUID), `attendance_date` (YYYY-MM-DD), `status` ('present' | 'absent'), `notes`.
- **Outputs:** Persisted attendance record.

### Pseudocode:
```text
1. Procedure RecordAttendance(student_id, attendance_date, status, notes):
2.    Validate that attendance_date <= CurrentDate() (prevent future logging if restricted).
3.    Execute PostgreSQL UPSERT via Supabase:
4.        INSERT INTO attendance (student_id, attendance_date, status, notes, updated_at)
5.        VALUES (student_id, attendance_date, status, notes, NOW())
6.        ON CONFLICT (student_id, attendance_date)
7.        DO UPDATE SET status = EXCLUDED.status,
8.                      notes = EXCLUDED.notes,
9.                      updated_at = NOW()
10.   Return UpdatedAttendanceRecord
```
- **Duplicate Prevention Guarantee:** Backed by database unique constraint `uq_student_attendance_date (student_id, attendance_date)`.
- **Time Complexity:** $O(\log N)$ through composite B-tree index.

---

## Algorithm 3: Idempotent Monthly Invoice Generation

- **Module:** Fee Management (`src/services/feeService.ts`)
- **Objective:** Generate monthly fee invoices for all active students for a specified billing month (e.g., `2026-10-01`) while skipping existing invoices without duplication or errors.
- **Inputs:** `billing_month` (Date string representing 1st of month).
- **Outputs:** Number of new invoices generated and count skipped.

### Pseudocode:
```text
1. Procedure GenerateMonthlyInvoices(billing_month):
2.    activeStudents = Query("SELECT id, monthly_fee FROM students WHERE is_active = true")
3.    existingInvoices = Query("SELECT student_id FROM fee_invoices WHERE billing_month = :billing_month")
4.    existingSet = Set(existingInvoices.map(i => i.student_id))
5.    
6.    invoicesToInsert = []
7.    For each student in activeStudents:
8.        If student.id NOT in existingSet:
9.            dueDate = CalculateDueDate(billing_month, day=10) -- 10th of the month
10.           invoicesToInsert.append({
11.               student_id: student.id,
12.               billing_month: billing_month,
13.               amount_due: student.monthly_fee,
14.               due_date: dueDate,
15.               status: 'pending'
16.           })
17.   If invoicesToInsert is not empty:
18.       INSERT INTO fee_invoices (invoicesToInsert)
19.       ON CONFLICT (student_id, billing_month) DO NOTHING
20.   Return { created: invoicesToInsert.length, skipped: existingSet.size }
```
- **Time Complexity:** $O(S)$ where $S$ is the number of active students (using hash set lookup $O(1)$).

---

## Algorithm 4: Fee Balance and Payment Status Derivation

- **Module:** Calculations Utility (`src/lib/calculations.ts`)
- **Objective:** Calculate total amount paid, outstanding balance, and derived status ('pending', 'partial', 'paid') for an invoice.
- **Inputs:** `amountDue` (Number), `payments` (Array of payment records with `amount_paid`).
- **Outputs:** `{ totalPaid, balanceRemaining, status, isOverpaid }`.

### Pseudocode:
```text
1. Function calculateFeeBalance(amountDue, payments):
2.    safeDue = Max(0, amountDue)
3.    totalPaid = 0
4.    For each payment in payments:
5.        If payment.amount_paid > 0:
6.            totalPaid = totalPaid + payment.amount_paid
7.    totalPaid = RoundTo2Decimals(totalPaid)
8.    balanceRemaining = Max(0, RoundTo2Decimals(safeDue - totalPaid))
9.    
10.   If totalPaid >= safeDue and safeDue > 0:
11.       status = 'paid'
12.   Else if totalPaid > 0:
13.       status = 'partial'
14.   Else:
15.       status = 'pending'
16.   
17.   Return { totalPaid, balanceRemaining, status, isOverpaid: (totalPaid > safeDue) }
```
- **Unit Test File:** `src/test/calculations.test.ts`
- **Worked Example:**
  - Invoice Amount Due: ₹750.00
  - Payment 1: ₹400.00 -> Total Paid: ₹400.00, Balance: ₹350.00, Status: `partial`
  - Payment 2: ₹350.00 -> Total Paid: ₹750.00, Balance: ₹0.00, Status: `paid`

---

## Algorithm 5: Expense Summaries and Categorization

- **Module:** Calculations Utility (`src/lib/calculations.ts`)
- **Objective:** Aggregate operational expenditures within date boundaries and compute category totals.
- **Inputs:** `expenses` (Array), optional `startDate`, optional `endDate`.
- **Outputs:** `{ totalAmount, categoryBreakdown, expenseCount }`.

### Pseudocode:
```text
1. Function calculateExpenseSummary(expenses, startDate, endDate):
2.    categories = { electricity: 0, water: 0, rent: 0, internet: 0, maintenance: 0, miscellaneous: 0 }
3.    grandTotal = 0, count = 0
4.    For each item in expenses:
5.        If startDate and item.expense_date < startDate: Continue
6.        If endDate and item.expense_date > endDate: Continue
7.        If item.amount > 0:
8.            grandTotal = grandTotal + item.amount
9.            count = count + 1
10.           cat = item.category in categories ? item.category : 'miscellaneous'
11.           categories[cat] = categories[cat] + item.amount
12.   Return { totalAmount: Round2(grandTotal), categoryBreakdown: categories, expenseCount: count }
```
- **Time Complexity:** $O(E)$ where $E$ is the number of expense records.

---

## Algorithm 6: Book Stock Availability Calculation

- **Module:** Calculations Utility (`src/lib/calculations.ts`)
- **Objective:** Compute available physical copies based on inventory catalog and active loans.
- **Inputs:** `totalCopies` (Integer), `activeLoansCount` (Integer of unreturned loans).
- **Outputs:** `{ availableCopies, canIssue: boolean }`.

### Mathematical Formula:
$$\text{availableCopies} = \max(0, \text{totalCopies} - \text{activeLoansCount})$$
$$\text{canIssue} = (\text{availableCopies} > 0)$$
- **Prevention Rule:** Prevents issuing a book if $\text{availableCopies} = 0$.

---

## Algorithm 7: Real-Time Dashboard KPI Summaries

- **Module:** Dashboard (`src/features/dashboard/DashboardPage.tsx`)
- **Objective:** Aggregate key operational indicators directly from database records without hardcoded values.
- **Metrics Calculated:**
  1. Active Students: `COUNT(*) FROM students WHERE is_active = true`
  2. Today's Present: `COUNT(*) FROM attendance WHERE attendance_date = TODAY AND status = 'present'`
  3. Month Fee Collections: `SUM(amount_paid) FROM fee_payments WHERE payment_date BETWEEN MonthStart AND MonthEnd`
  4. Total Outstanding Balance: `SUM(invoices.amount_due) - SUM(payments.amount_paid)` for all non-paid invoices
  5. Month Operational Expenses: `SUM(amount) FROM expenses WHERE expense_date BETWEEN MonthStart AND MonthEnd`
  6. Total Books & Currently Issued Books: `SUM(total_copies)` vs `COUNT(*) FROM book_loans WHERE returned_at IS NULL`

---

## Algorithm 8: RFC-4180 Compliant CSV Export

- **Module:** Calculations Utility (`src/lib/calculations.ts`)
- **Objective:** Serialize tabular records into CSV with proper escaping for commas, newlines, and quotes.
- **Escaping Rule:** Any cell value containing a comma `,`, newline `\n`, or double quote `"` is wrapped in quotes, with internal quotes escaped as `""`.
- **Encoding:** Prepend UTF-8 BOM (`\uFEFF`) to ensure Indian Rupee symbols (₹) and international characters render correctly in Microsoft Excel.
