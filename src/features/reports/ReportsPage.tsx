import React, { useState, useEffect, useMemo } from 'react';
import { studentService } from '../../services/studentService';
import { feeService } from '../../services/feeService';
import { expenseService } from '../../services/expenseService';
import { bookService } from '../../services/bookService';
import type { Student, FeePayment, Expense, BookLoan } from '../../types/database';
import { convertToCSV, downloadCSV } from '../../lib/calculations';
import { formatINR, formatDate, getTodayDateString, getCurrentBillingMonth } from '../../lib/formatters';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  Download,
  Calendar,
  FileSpreadsheet,
  Users,
  Receipt,
  TrendingDown,
  BookOpen,
} from 'lucide-react';

type ReportType = 'students' | 'payments' | 'expenses' | 'loans';

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('payments');
  const [startDate, setStartDate] = useState<string>(getCurrentBillingMonth());
  const [endDate, setEndDate] = useState<string>(getTodayDateString());

  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      studentService.getStudents(),
      feeService.getAllPayments(),
      expenseService.getExpenses(),
      bookService.getLoans(),
    ])
      .then(([sData, pData, eData, lData]) => {
        setStudents(sData);
        setPayments(pData);
        setExpenses(eData);
        setLoans(lData);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered dataset according to active reportType & date range
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = p.payment_date;
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });
  }, [payments, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = e.expense_date;
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });
  }, [expenses, startDate, endDate]);

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const d = l.issue_date;
      return (!startDate || d >= startDate) && (!endDate || d <= endDate);
    });
  }, [loans, startDate, endDate]);

  const handleExportCSV = () => {
    const dateTag = `${startDate}_to_${endDate}`;

    if (reportType === 'students') {
      const csv = convertToCSV<Student>(
        [
          { header: 'Student Code', key: 'student_code' },
          { header: 'Full Name', key: 'full_name' },
          { header: 'Contact', key: (r) => r.contact_number || 'N/A' },
          { header: 'Assigned Shift', key: (r) => r.shift?.name || 'Unassigned' },
          { header: 'Monthly Fee', key: (r) => r.monthly_fee },
          { header: 'Status', key: (r) => (r.is_active ? 'Active' : 'Inactive') },
          { header: 'Enrollment Date', key: 'enrollment_date' },
        ],
        students
      );
      downloadCSV(`StudySpace_Students_Roster_${getTodayDateString()}`, csv);
    } else if (reportType === 'payments') {
      const csv = convertToCSV<FeePayment>(
        [
          { header: 'Payment ID', key: 'id' },
          { header: 'Payment Date', key: 'payment_date' },
          { header: 'Student Code', key: (r) => r.student?.student_code || 'N/A' },
          { header: 'Student Name', key: (r) => r.student?.full_name || 'Member' },
          { header: 'Amount (INR)', key: 'amount_paid' },
          { header: 'Payment Method', key: 'payment_method' },
          { header: 'Reference No.', key: (r) => r.reference_number || 'None' },
          { header: 'Remarks', key: (r) => r.notes || '' },
        ],
        filteredPayments
      );
      downloadCSV(`StudySpace_Fee_Collections_${dateTag}`, csv);
    } else if (reportType === 'expenses') {
      const csv = convertToCSV<Expense>(
        [
          { header: 'Expense ID', key: 'id' },
          { header: 'Expense Date', key: 'expense_date' },
          { header: 'Category', key: 'category' },
          { header: 'Description', key: 'description' },
          { header: 'Amount (INR)', key: 'amount' },
          { header: 'Payment Method', key: (r) => r.payment_method || 'N/A' },
          { header: 'Notes', key: (r) => r.notes || '' },
        ],
        filteredExpenses
      );
      downloadCSV(`StudySpace_Expenses_Report_${dateTag}`, csv);
    } else if (reportType === 'loans') {
      const csv = convertToCSV<BookLoan>(
        [
          { header: 'Loan ID', key: 'id' },
          { header: 'Book Title', key: (r) => r.book?.title || 'Book' },
          { header: 'Author', key: (r) => r.book?.author || 'Author' },
          { header: 'Student Code', key: (r) => r.student?.student_code || 'N/A' },
          { header: 'Student Name', key: (r) => r.student?.full_name || 'Member' },
          { header: 'Issue Date', key: 'issue_date' },
          { header: 'Due Date', key: 'due_date' },
          { header: 'Status', key: 'status' },
          { header: 'Returned Timestamp', key: (r) => r.returned_at || 'Not Returned' },
        ],
        filteredLoans
      );
      downloadCSV(`StudySpace_Book_Circulation_${dateTag}`, csv);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Aggregating records for export..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports & Tabular Export</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Filter operational logs across date boundaries and download RFC-4180 standard CSV exports
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export Report to CSV
        </button>
      </div>

      {/* Date Filter & Report Selector Strip */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Report Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setReportType('payments')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  reportType === 'payments'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Fee Collections
              </button>

              <button
                type="button"
                onClick={() => setReportType('expenses')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  reportType === 'expenses'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Expenses Log
              </button>

              <button
                type="button"
                onClick={() => setReportType('loans')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  reportType === 'loans'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Book Circulation
              </button>

              <button
                type="button"
                onClick={() => setReportType('students')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                  reportType === 'students'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Students Roster
              </button>
            </div>
          </div>
        </div>

        {/* Date Boundaries */}
        {reportType !== 'students' && (
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-600">From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setStartDate(getCurrentBillingMonth());
                setEndDate(getTodayDateString());
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Reset to Current Month
            </button>
          </div>
        )}
      </div>

      {/* Report Data Preview Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Filtered Records Preview
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {reportType === 'students'
              ? `${students.length} Total Enrolled Students`
              : reportType === 'payments'
              ? `${filteredPayments.length} Payments (${formatINR(
                  filteredPayments.reduce((s, p) => s + (Number(p.amount_paid) || 0), 0)
                )})`
              : reportType === 'expenses'
              ? `${filteredExpenses.length} Expenses (${formatINR(
                  filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0)
                )})`
              : `${filteredLoans.length} Circulation Loan Records`}
          </span>
        </div>

        <div className="overflow-x-auto max-h-96">
          {reportType === 'payments' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2 text-slate-500">{formatDate(p.payment_date)}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">
                      {p.student?.full_name || 'Member'}
                    </td>
                    <td className="px-4 py-2 font-bold text-emerald-600">
                      {formatINR(p.amount_paid)}
                    </td>
                    <td className="px-4 py-2 uppercase font-medium">{p.payment_method}</td>
                    <td className="px-4 py-2 font-mono text-slate-400">{p.reference_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expenses' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Description</th>
                  <th className="px-4 py-2.5">Category</th>
                  <th className="px-4 py-2.5">Amount</th>
                  <th className="px-4 py-2.5">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((e) => (
                  <tr key={e.id}>
                    <td className="px-4 py-2 text-slate-500">{formatDate(e.expense_date)}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{e.description}</td>
                    <td className="px-4 py-2 uppercase font-medium text-slate-500">{e.category}</td>
                    <td className="px-4 py-2 font-bold text-rose-600">{formatINR(e.amount)}</td>
                    <td className="px-4 py-2 uppercase text-slate-500">{e.payment_method || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'loans' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Book Title</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Issue Date</th>
                  <th className="px-4 py-2.5">Due Date</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLoans.map((l) => (
                  <tr key={l.id}>
                    <td className="px-4 py-2 font-semibold text-slate-900">{l.book?.title}</td>
                    <td className="px-4 py-2">{l.student?.full_name || 'Member'}</td>
                    <td className="px-4 py-2 text-slate-500">{formatDate(l.issue_date)}</td>
                    <td className="px-4 py-2 text-slate-500">{formatDate(l.due_date)}</td>
                    <td className="px-4 py-2 uppercase font-bold text-[10px]">{l.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'students' && (
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Code</th>
                  <th className="px-4 py-2.5">Full Name</th>
                  <th className="px-4 py-2.5">Contact</th>
                  <th className="px-4 py-2.5">Shift</th>
                  <th className="px-4 py-2.5">Monthly Fee</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 font-mono font-bold text-indigo-700">{s.student_code}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{s.full_name}</td>
                    <td className="px-4 py-2 text-slate-500">{s.contact_number || '—'}</td>
                    <td className="px-4 py-2">{s.shift?.name || 'Standard'}</td>
                    <td className="px-4 py-2 font-semibold text-slate-900">{formatINR(s.monthly_fee)}</td>
                    <td className="px-4 py-2">{s.is_active ? 'Active' : 'Inactive'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
