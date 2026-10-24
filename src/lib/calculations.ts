import type { FeePayment, InvoiceStatus, Expense, ExpenseCategory } from '../types/database';

/**
 * ALGORITHM 4: Fee Balance and Payment Status Calculation
 * 
 * Purpose:
 * Given an invoice's total amount due and a list of recorded payments, calculates:
 * 1. Total amount paid so far
 * 2. Remaining outstanding balance
 * 3. Derived payment status ('pending', 'partial', or 'paid')
 * 
 * Rules:
 * - If total paid == 0 -> status is 'pending'
 * - If 0 < total paid < amount due -> status is 'partial'
 * - If total paid >= amount due -> status is 'paid'
 * - Balance remaining = max(0, amount due - total paid)
 */
export interface FeeCalculationResult {
  totalPaid: number;
  balanceRemaining: number;
  status: InvoiceStatus;
  isOverpaid: boolean;
}

export function calculateFeeBalance(
  amountDue: number,
  payments: Array<Pick<FeePayment, 'amount_paid'>>
): FeeCalculationResult {
  const safeDue = Math.max(0, Number(amountDue) || 0);
  const totalPaid = (payments || []).reduce((acc, curr) => {
    const val = Number(curr.amount_paid);
    return acc + (isNaN(val) || val < 0 ? 0 : val);
  }, 0);

  const roundedPaid = Math.round(totalPaid * 100) / 100;
  const balanceRemaining = Math.max(0, Math.round((safeDue - roundedPaid) * 100) / 100);

  let status: InvoiceStatus = 'pending';
  if (roundedPaid >= safeDue && safeDue > 0) {
    status = 'paid';
  } else if (roundedPaid > 0) {
    status = 'partial';
  }

  return {
    totalPaid: roundedPaid,
    balanceRemaining,
    status,
    isOverpaid: roundedPaid > safeDue,
  };
}

/**
 * ALGORITHM 5: Expense Summary and Categorization
 * 
 * Purpose:
 * Filters expenses by optional date boundaries and computes:
 * 1. Grand total of operational expenses
 * 2. Categorized sum mapping (Electricity, Water, Rent, Internet, Maintenance, Misc)
 */
export interface ExpenseSummaryResult {
  totalAmount: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
  expenseCount: number;
}

export function calculateExpenseSummary(
  expenses: Array<Pick<Expense, 'amount' | 'category' | 'expense_date'>>,
  startDate?: string,
  endDate?: string
): ExpenseSummaryResult {
  const breakdown: Record<ExpenseCategory, number> = {
    electricity: 0,
    water: 0,
    rent: 0,
    internet: 0,
    maintenance: 0,
    miscellaneous: 0,
  };

  let totalAmount = 0;
  let count = 0;

  for (const exp of expenses || []) {
    if (startDate && exp.expense_date < startDate) continue;
    if (endDate && exp.expense_date > endDate) continue;

    const amount = Number(exp.amount) || 0;
    if (amount <= 0) continue;

    totalAmount += amount;
    count += 1;

    const cat = exp.category in breakdown ? exp.category : 'miscellaneous';
    breakdown[cat] = (breakdown[cat] || 0) + amount;
  }

  return {
    totalAmount: Math.round(totalAmount * 100) / 100,
    categoryBreakdown: breakdown,
    expenseCount: count,
  };
}

/**
 * ALGORITHM 6: Book Stock Availability
 * 
 * Purpose:
 * Calculates physical copies available for circulation:
 * availableCopies = max(0, totalCopies - activeLoansCount)
 * 
 * Can Issue Rule:
 * Book can only be issued if availableCopies > 0
 */
export function calculateAvailableCopies(
  totalCopies: number,
  activeLoansCount: number
): { availableCopies: number; canIssue: boolean } {
  const safeTotal = Math.max(0, Math.floor(Number(totalCopies) || 0));
  const safeLoans = Math.max(0, Math.floor(Number(activeLoansCount) || 0));
  const availableCopies = Math.max(0, safeTotal - safeLoans);

  return {
    availableCopies,
    canIssue: availableCopies > 0,
  };
}

/**
 * ALGORITHM 8: Report Export to RFC-4180 Compliant CSV
 * 
 * Purpose:
 * Converts an array of objects into standard CSV text, escaping commas,
 * double quotes, and line breaks properly.
 */
export function convertToCSV<T extends object>(
  columns: Array<{ header: string; key: keyof T | ((row: T) => string | number | null | undefined) }>,
  rows: T[]
): string {
  if (!rows || rows.length === 0) {
    return columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');
  }

  const headerLine = columns
    .map(c => `"${c.header.replace(/"/g, '""')}"`)
    .join(',');

  const dataLines = rows.map(row => {
    return columns
      .map(col => {
        let value: unknown;
        if (typeof col.key === 'function') {
          value = col.key(row);
        } else {
          value = row[col.key];
        }

        if (value === null || value === undefined) {
          return '""';
        }

        const stringValue = String(value);
        // RFC 4180: escape internal quotes by doubling them
        const escaped = stringValue.replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(',');
  });

  return [headerLine, ...dataLines].join('\r\n');
}

/**
 * Triggers client-side download of a CSV file in browser
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
