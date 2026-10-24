// Database type definitions for StudySpace Library Management System

export type UserRole = 'admin';

export interface Profile {
  id: string; // References auth.users
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface ShiftType {
  id: string;
  name: string;
  duration_hours: number;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  student_code: string;
  full_name: string;
  contact_number?: string | null;
  enrollment_date: string; // YYYY-MM-DD
  shift_id?: string | null;
  monthly_fee: number;
  is_active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Join fields:
  shift?: ShiftType | null;
}

export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  attendance_date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string | null;
  created_at: string;
  updated_at?: string;
  // Join fields:
  student?: Student;
}

export type InvoiceStatus = 'pending' | 'partial' | 'paid';

export interface FeeInvoice {
  id: string;
  student_id: string;
  billing_month: string; // YYYY-MM-01
  amount_due: number;
  due_date: string; // YYYY-MM-DD
  status: InvoiceStatus;
  notes?: string | null;
  created_at: string;
  // Computed / Join fields:
  student?: Student;
  payments?: FeePayment[];
  total_paid?: number;
  balance_remaining?: number;
}

export type PaymentMethod = 'cash' | 'upi' | 'card' | 'bank_transfer' | 'other';

export interface FeePayment {
  id: string;
  invoice_id: string;
  student_id: string;
  amount_paid: number;
  payment_date: string; // YYYY-MM-DD
  payment_method: PaymentMethod;
  reference_number?: string | null;
  notes?: string | null;
  created_at: string;
  // Join fields:
  student?: Student;
  invoice?: FeeInvoice;
}

export type ExpenseCategory =
  | 'electricity'
  | 'water'
  | 'rent'
  | 'internet'
  | 'maintenance'
  | 'miscellaneous';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  amount: number;
  expense_date: string; // YYYY-MM-DD
  payment_method?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  isbn?: string | null;
  total_copies: number;
  created_at: string;
  // Derived fields:
  active_loans_count?: number;
  available_copies?: number;
}

export type LoanStatus = 'issued' | 'returned' | 'overdue';

export interface BookLoan {
  id: string;
  book_id: string;
  student_id: string;
  issue_date: string; // YYYY-MM-DD
  due_date: string; // YYYY-MM-DD
  returned_at?: string | null; // ISO timestamp
  status: LoanStatus;
  notes?: string | null;
  created_at: string;
  // Join fields:
  book?: Book;
  student?: Student;
}

// Dashboard Summary Model
export interface DashboardMetrics {
  totalActiveStudents: number;
  todayPresentCount: number;
  todayAbsentCount: number;
  monthCollectedFees: number;
  totalOutstandingFees: number;
  monthExpenses: number;
  totalBooks: number;
  currentlyIssuedBooks: number;
  overdueLoansCount: number;
}
