import type { DashboardMetrics } from '../types/database';
import { studentService } from './studentService';
import { attendanceService } from './attendanceService';
import { feeService } from './feeService';
import { expenseService } from './expenseService';
import { bookService } from './bookService';
import { getTodayDateString, getCurrentBillingMonth } from '../lib/formatters';

export interface MonthlyChartData {
  month: string;
  fees: number;
  expenses: number;
}

export const dashboardService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const today = getTodayDateString();
    const currentMonthPrefix = getCurrentBillingMonth().slice(0, 7); // YYYY-MM

    // 1. Students
    const students = await studentService.getStudents();
    const totalActiveStudents = students.filter((s) => s.is_active).length;

    // 2. Attendance today
    const todayAttendance = await attendanceService.getAttendanceByDate(today);
    const todayPresentCount = todayAttendance.filter((a) => a.status === 'present').length;
    const todayAbsentCount = todayAttendance.filter((a) => a.status === 'absent').length;

    // 3. Fees
    const invoices = await feeService.getInvoices();
    const allPayments = await feeService.getAllPayments();

    const monthCollectedFees = allPayments
      .filter((p) => p.payment_date && p.payment_date.startsWith(currentMonthPrefix))
      .reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);

    const totalOutstandingFees = invoices.reduce(
      (sum, inv) => sum + (Number(inv.balance_remaining) || 0),
      0
    );

    // 4. Expenses
    const expenses = await expenseService.getExpenses();
    const monthExpenses = expenses
      .filter((e) => e.expense_date && e.expense_date.startsWith(currentMonthPrefix))
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    // 5. Books & Loans
    const books = await bookService.getBooks();
    const totalBooks = books.reduce((sum, b) => sum + (Number(b.total_copies) || 0), 0);

    const loans = await bookService.getLoans();
    const activeLoans = loans.filter((l) => !l.returned_at);
    const currentlyIssuedBooks = activeLoans.length;
    const overdueLoansCount = activeLoans.filter((l) => l.status === 'overdue' || l.due_date < today).length;

    return {
      totalActiveStudents,
      todayPresentCount,
      todayAbsentCount,
      monthCollectedFees: Math.round(monthCollectedFees * 100) / 100,
      totalOutstandingFees: Math.round(totalOutstandingFees * 100) / 100,
      monthExpenses: Math.round(monthExpenses * 100) / 100,
      totalBooks,
      currentlyIssuedBooks,
      overdueLoansCount,
    };
  },

  async getCashflowChartData(): Promise<MonthlyChartData[]> {
    const allPayments = await feeService.getAllPayments();
    const allExpenses = await expenseService.getExpenses();

    // Generate monthly bins for past 6 months
    const result: MonthlyChartData[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const monthNum = String(d.getMonth() + 1).padStart(2, '0');
      const prefix = `${year}-${monthNum}`;

      const monthName = d.toLocaleDateString('en-US', { month: 'short' });

      const feeSum = allPayments
        .filter((p) => p.payment_date && p.payment_date.startsWith(prefix))
        .reduce((sum, p) => sum + (Number(p.amount_paid) || 0), 0);

      const expSum = allExpenses
        .filter((e) => e.expense_date && e.expense_date.startsWith(prefix))
        .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      result.push({
        month: monthName,
        fees: Math.round(feeSum),
        expenses: Math.round(expSum),
      });
    }

    return result;
  },
};
