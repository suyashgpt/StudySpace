import { describe, it, expect } from 'vitest';
import {
  calculateFeeBalance,
  calculateExpenseSummary,
  calculateAvailableCopies,
  convertToCSV,
} from '../lib/calculations';
import type { Expense } from '../types/database';

describe('Algorithm 4: Fee Balance & Payment Status', () => {
  it('returns pending status when no payments have been made', () => {
    const result = calculateFeeBalance(750, []);
    expect(result.totalPaid).toBe(0);
    expect(result.balanceRemaining).toBe(750);
    expect(result.status).toBe('pending');
    expect(result.isOverpaid).toBe(false);
  });

  it('returns partial status when partial payment is made', () => {
    const result = calculateFeeBalance(750, [{ amount_paid: 400 }]);
    expect(result.totalPaid).toBe(400);
    expect(result.balanceRemaining).toBe(350);
    expect(result.status).toBe('partial');
    expect(result.isOverpaid).toBe(false);
  });

  it('accumulates multiple payments and marks paid when fully settled', () => {
    const result = calculateFeeBalance(750, [
      { amount_paid: 400 },
      { amount_paid: 350 },
    ]);
    expect(result.totalPaid).toBe(750);
    expect(result.balanceRemaining).toBe(0);
    expect(result.status).toBe('paid');
    expect(result.isOverpaid).toBe(false);
  });

  it('detects overpayment correctly', () => {
    const result = calculateFeeBalance(750, [{ amount_paid: 800 }]);
    expect(result.totalPaid).toBe(800);
    expect(result.balanceRemaining).toBe(0);
    expect(result.status).toBe('paid');
    expect(result.isOverpaid).toBe(true);
  });
});

describe('Algorithm 5: Expense Summary & Categorization', () => {
  const dummyExpenses: Expense[] = [
    {
      id: '1',
      description: 'Electricity bill',
      category: 'electricity',
      amount: 1200,
      expense_date: '2026-10-05',
      created_at: '2026-10-05T00:00:00Z',
    },
    {
      id: '2',
      description: 'Drinking water jars',
      category: 'water',
      amount: 300,
      expense_date: '2026-10-10',
      created_at: '2026-10-10T00:00:00Z',
    },
    {
      id: '3',
      description: 'Wifi broadband',
      category: 'internet',
      amount: 800,
      expense_date: '2026-10-12',
      created_at: '2026-10-12T00:00:00Z',
    },
    {
      id: '4',
      description: 'September repairs',
      category: 'maintenance',
      amount: 500,
      expense_date: '2026-09-28',
      created_at: '2026-09-28T00:00:00Z',
    },
  ];

  it('calculates total and category breakdown accurately', () => {
    const summary = calculateExpenseSummary(dummyExpenses);
    expect(summary.totalAmount).toBe(2800);
    expect(summary.expenseCount).toBe(4);
    expect(summary.categoryBreakdown.electricity).toBe(1200);
    expect(summary.categoryBreakdown.water).toBe(300);
    expect(summary.categoryBreakdown.internet).toBe(800);
    expect(summary.categoryBreakdown.maintenance).toBe(500);
  });

  it('filters correctly within date range', () => {
    const summary = calculateExpenseSummary(
      dummyExpenses,
      '2026-10-01',
      '2026-10-31'
    );
    expect(summary.totalAmount).toBe(2300);
    expect(summary.expenseCount).toBe(3);
    expect(summary.categoryBreakdown.maintenance).toBe(0);
  });
});

describe('Algorithm 6: Book Stock Availability', () => {
  it('calculates available copies correctly when copies are free', () => {
    const availability = calculateAvailableCopies(5, 2);
    expect(availability.availableCopies).toBe(3);
    expect(availability.canIssue).toBe(true);
  });

  it('blocks issuing when all copies are borrowed', () => {
    const availability = calculateAvailableCopies(3, 3);
    expect(availability.availableCopies).toBe(0);
    expect(availability.canIssue).toBe(false);
  });

  it('handles zero or negative edge cases safely', () => {
    const availability = calculateAvailableCopies(0, 0);
    expect(availability.availableCopies).toBe(0);
    expect(availability.canIssue).toBe(false);
  });
});

describe('Algorithm 8: CSV Conversion with RFC-4180 Escaping', () => {
  it('correctly escapes quotes, commas, and formatting', () => {
    const sampleData = [
      { name: 'Rahul Sharma, Jr.', shift: 'Morning "4hr"' },
      { name: 'Priya Verma', shift: 'Full Day' },
    ];

    const csv = convertToCSV(
      [
        { header: 'Student Name', key: 'name' },
        { header: 'Shift Info', key: 'shift' },
      ],
      sampleData
    );

    const lines = csv.split('\r\n');
    expect(lines[0]).toBe('"Student Name","Shift Info"');
    expect(lines[1]).toBe('"Rahul Sharma, Jr.","Morning ""4hr"""');
    expect(lines[2]).toBe('"Priya Verma","Full Day"');
  });
});
