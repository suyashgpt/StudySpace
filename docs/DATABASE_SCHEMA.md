# StudySpace Database Schema Specification

**System:** StudySpace — Web-Based Study Library Management and Operations System  
**Engine:** PostgreSQL 15+ (Hosted on Supabase)  
**Security Model:** Row-Level Security (RLS) with Authenticated Role Enforcement  
**Migration Path:** `supabase/migrations/20261024_initial_schema.sql`

---

## 1. Relational Entity Relationship (ER) Summary

```
[auth.users] (Supabase Auth)
     │ 1:1
[profiles] (Admin details)

[shift_types] ───(1:N)───< [students] ───(1:N)───< [attendance]
                              │
                              ├───(1:N)───< [fee_invoices] ───(1:N)───< [fee_payments]
                              │
                              └───(1:N)───< [book_loans] >───(N:1)─── [books]

[expenses] (Independent operational transaction entity)
```

---

## 2. Table Specifications

### 2.1 `profiles`
Stores administrator identity metadata linked directly to Supabase Auth `auth.users`.
- **`id`** (`UUID`, Primary Key): Foreign key referencing `auth.users(id)` with `ON DELETE CASCADE`.
- **`email`** (`TEXT`, Unique, Not Null): Admin email.
- **`full_name`** (`TEXT`, Not Null): Display name of the administrator.
- **`role`** (`TEXT`, Not Null, Default `'admin'`): Role enumeration constraint (`CHECK (role IN ('admin'))`).
- **`created_at`** (`TIMESTAMPTZ`, Not Null): Registration timestamp.

### 2.2 `shift_types`
Configurable reading room shifts with designated study hours and pricing tiers.
- **`id`** (`UUID`, Primary Key, Default `gen_random_uuid()`): Unique identifier.
- **`name`** (`TEXT`, Not Null): Shift designation (e.g., "Morning Shift (4 Hours)").
- **`duration_hours`** (`NUMERIC(4, 2)`, Not Null): Duration with check constraint `duration_hours > 0`.
- **`price`** (`NUMERIC(10, 2)`, Not Null): Configurable monthly rate with check constraint `price >= 0`.
- **`is_active`** (`BOOLEAN`, Not Null, Default `true`): Operational status toggle.
- **`created_at`** (`TIMESTAMPTZ`, Not Null): Creation timestamp.

### 2.3 `students`
Registered library members and their academic reading allocations.
- **`id`** (`UUID`, Primary Key, Default `gen_random_uuid()`).
- **`student_code`** (`TEXT`, Unique, Not Null): Business identifier (e.g. `STU-001`). Indexed for fast lookup.
- **`full_name`** (`TEXT`, Not Null): Student's full legal name.
- **`contact_number`** (`TEXT`, Nullable): Phone number for communications.
- **`enrollment_date`** (`DATE`, Not Null, Default `CURRENT_DATE`).
- **`shift_id`** (`UUID`, Foreign Key referencing `shift_types(id)` on delete `SET NULL`).
- **`monthly_fee`** (`NUMERIC(10, 2)`, Not Null, Default `0.00`): Monthly rate (`CHECK (monthly_fee >= 0)`).
- **`is_active`** (`BOOLEAN`, Not Null, Default `true`): Soft deletion toggle preserving transaction history.
- **`notes`** (`TEXT`, Nullable): Administrative notes.
- **`created_at`** / **`updated_at`** (`TIMESTAMPTZ`).

### 2.4 `attendance`
Daily attendance register.
- **`id`** (`UUID`, Primary Key).
- **`student_id`** (`UUID`, Foreign Key referencing `students(id)` on delete `RESTRICT`).
- **`attendance_date`** (`DATE`, Not Null, Default `CURRENT_DATE`).
- **`status`** (`TEXT`, Not Null): Check constraint `status IN ('present', 'absent')`.
- **`notes`** (`TEXT`, Nullable).
- **Composite Unique Constraint:** `uq_student_attendance_date (student_id, attendance_date)`. Prevents duplicate attendance logging for any student on the same date.
- **Index:** `idx_attendance_date` on `attendance_date`.

### 2.5 `fee_invoices`
Monthly billing cycles generated per student.
- **`id`** (`UUID`, Primary Key).
- **`student_id`** (`UUID`, Foreign Key referencing `students(id)` on delete `RESTRICT`).
- **`billing_month`** (`DATE`, Not Null): Normalized to the 1st of the month (`YYYY-MM-01`).
- **`amount_due`** (`NUMERIC(10, 2)`, Not Null): Billed amount (`CHECK (amount_due >= 0)`).
- **`due_date`** (`DATE`, Not Null).
- **`status`** (`TEXT`, Not Null, Default `'pending'`): `CHECK (status IN ('pending', 'partial', 'paid'))`.
- **Composite Unique Constraint:** `uq_student_billing_month (student_id, billing_month)`. Ensures idempotent monthly batch generation.

### 2.6 `fee_payments`
Individual payment transactions received against invoices.
- **`id`** (`UUID`, Primary Key).
- **`invoice_id`** (`UUID`, Foreign Key referencing `fee_invoices(id)` on delete `RESTRICT`).
- **`student_id`** (`UUID`, Foreign Key referencing `students(id)` on delete `RESTRICT`).
- **`amount_paid`** (`NUMERIC(10, 2)`, Not Null): `CHECK (amount_paid > 0)`.
- **`payment_date`** (`DATE`, Not Null, Default `CURRENT_DATE`).
- **`payment_method`** (`TEXT`, Not Null): `CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other'))`.
- **`reference_number`** (`TEXT`, Nullable): Transaction reference / UTR.
- **`notes`** (`TEXT`, Nullable).

### 2.7 `expenses`
Daily operational expenditures incurred running the study facility.
- **`id`** (`UUID`, Primary Key).
- **`description`** (`TEXT`, Not Null).
- **`category`** (`TEXT`, Not Null): `CHECK (category IN ('electricity', 'water', 'rent', 'internet', 'maintenance', 'miscellaneous'))`.
- **`amount`** (`NUMERIC(10, 2)`, Not Null): `CHECK (amount > 0)`.
- **`expense_date`** (`DATE`, Not Null, Default `CURRENT_DATE`).
- **`payment_method`** (`TEXT`, Nullable).
- **`notes`** (`TEXT`, Nullable).

### 2.8 `books`
Physical library book catalog.
- **`id`** (`UUID`, Primary Key).
- **`title`** (`TEXT`, Not Null).
- **`author`** (`TEXT`, Not Null).
- **`category`** (`TEXT`, Not Null).
- **`isbn`** (`TEXT`, Nullable).
- **`total_copies`** (`INTEGER`, Not Null, Default `1`): `CHECK (total_copies >= 1)`.

### 2.9 `book_loans`
Circulation records tracking issued and returned books.
- **`id`** (`UUID`, Primary Key).
- **`book_id`** (`UUID`, Foreign Key referencing `books(id)` on delete `RESTRICT`).
- **`student_id`** (`UUID`, Foreign Key referencing `students(id)` on delete `RESTRICT`).
- **`issue_date`** (`DATE`, Not Null, Default `CURRENT_DATE`).
- **`due_date`** (`DATE`, Not Null).
- **`returned_at`** (`TIMESTAMPTZ`, Nullable): Null while actively issued; populated upon return.
- **`status`** (`TEXT`, Not Null, Default `'issued'`): `CHECK (status IN ('issued', 'returned', 'overdue'))`.

---

## 3. Data Integrity & Business Constraints
1. **Financial Precision:** All currency amounts use `NUMERIC(10, 2)` instead of floating-point numbers (`FLOAT` / `REAL`), eliminating binary rounding errors during financial summarization.
2. **Duplicate Prevention:** Strict database-level unique constraints (`uq_student_attendance_date` and `uq_student_billing_month`) prevent concurrency race conditions.
3. **Audit Trail Preservation:** Historical student transactions (attendance, invoices, payments, book loans) reference students with `ON DELETE RESTRICT`. Inactive members are flagged via `is_active = false` rather than physically deleted.
4. **Calculated Book Availability:** Book availability is not an independently updated number. It is derived via `total_copies - COUNT(active unreturned loans)` to prevent stock desynchronization.

---

## 4. Row Level Security (RLS) Policies
Every application table has RLS enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`). Access is restricted to authenticated administrator sessions verified via Supabase Auth JWT tokens. Public or anonymous requests without a valid session token are blocked at the database tier.
