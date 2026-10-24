-- ==============================================================================
-- STUDYSPACE - Web-Based Study Library Management and Operations System
-- Initial PostgreSQL Database Migration & RLS Policies
-- Academic Project for MCA Evaluation - Lovely Professional University (LPU)
-- ==============================================================================

-- 1. Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. PROFILES (Admin metadata linked to Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. SHIFT_TYPES (Configurable study shifts & pricing)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.shift_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    duration_hours NUMERIC(4, 2) NOT NULL CHECK (duration_hours > 0),
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. STUDENTS (Student records & enrollment details)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_code TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    contact_number TEXT,
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    shift_id UUID REFERENCES public.shift_types(id) ON DELETE SET NULL,
    monthly_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00 CHECK (monthly_fee >= 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. ATTENDANCE (Daily attendance per student)
-- Unique constraint prevents duplicate attendance on same date
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_attendance_date UNIQUE (student_id, attendance_date)
);

-- ------------------------------------------------------------------------------
-- 6. FEE_INVOICES (Monthly billing per student)
-- Unique constraint prevents duplicate monthly invoice generation
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    billing_month DATE NOT NULL, -- Stored as YYYY-MM-01
    amount_due NUMERIC(10, 2) NOT NULL CHECK (amount_due >= 0),
    due_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_student_billing_month UNIQUE (student_id, billing_month)
);

-- ------------------------------------------------------------------------------
-- 7. FEE_PAYMENTS (Payment transactions recorded against invoices)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fee_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.fee_invoices(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid > 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 8. EXPENSES (Operational overheads categorized)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('electricity', 'water', 'rent', 'internet', 'maintenance', 'miscellaneous')),
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 9. BOOKS (Library catalog & physical copies)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    category TEXT NOT NULL,
    isbn TEXT,
    total_copies INTEGER NOT NULL DEFAULT 1 CHECK (total_copies >= 1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 10. BOOK_LOANS (Issue and return circulation)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.book_loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    returned_at TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 11. INDEXES FOR PERFORMANCE OPTIMIZATION
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_students_active ON public.students(is_active);
CREATE INDEX IF NOT EXISTS idx_students_code ON public.students(student_code);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance(attendance_date);
CREATE INDEX IF NOT EXISTS idx_invoices_billing_month ON public.fee_invoices(billing_month);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.fee_invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.fee_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.fee_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON public.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_loans_book ON public.book_loans(book_id);
CREATE INDEX IF NOT EXISTS idx_loans_student ON public.book_loans(student_id);
CREATE INDEX IF NOT EXISTS idx_loans_status ON public.book_loans(status);

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- Security rule: Only authenticated administrators have full access.
-- Unauthenticated requests are rejected.
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_loans ENABLE ROW LEVEL SECURITY;

-- Profiles: Authenticated users can view and update their own profile
CREATE POLICY "Profiles access" ON public.profiles
    FOR ALL TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Shift Types: Authenticated admin access
CREATE POLICY "Shift types admin access" ON public.shift_types
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Students: Authenticated admin access
CREATE POLICY "Students admin access" ON public.students
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Attendance: Authenticated admin access
CREATE POLICY "Attendance admin access" ON public.attendance
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Fee Invoices: Authenticated admin access
CREATE POLICY "Fee invoices admin access" ON public.fee_invoices
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Fee Payments: Authenticated admin access
CREATE POLICY "Fee payments admin access" ON public.fee_payments
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Expenses: Authenticated admin access
CREATE POLICY "Expenses admin access" ON public.expenses
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Books: Authenticated admin access
CREATE POLICY "Books admin access" ON public.books
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Book Loans: Authenticated admin access
CREATE POLICY "Book loans admin access" ON public.book_loans
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 13. SEED DEFAULT SHIFT TYPES
-- ------------------------------------------------------------------------------
INSERT INTO public.shift_types (name, duration_hours, price, is_active)
VALUES 
    ('Morning Shift (4 Hours)', 4.00, 400.00, true),
    ('Evening Shift (4 Hours)', 4.00, 400.00, true),
    ('Full Day Shift (8 Hours)', 8.00, 750.00, true),
    ('Night Shift (6 Hours)', 6.00, 600.00, true)
ON CONFLICT DO NOTHING;
