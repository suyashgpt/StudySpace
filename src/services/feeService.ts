import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { FeeInvoice, FeePayment, PaymentMethod } from '../types/database';
import { calculateFeeBalance } from '../lib/calculations';
import { getCurrentBillingMonth } from '../lib/formatters';
import { studentService } from './studentService';

let demoInvoices: FeeInvoice[] = [
  {
    id: 'inv-1',
    student_id: 'stu-1',
    billing_month: getCurrentBillingMonth(),
    amount_due: 750,
    due_date: `${getCurrentBillingMonth().slice(0, 7)}-10`,
    status: 'partial',
    created_at: new Date().toISOString(),
    payments: [
      {
        id: 'pay-1',
        invoice_id: 'inv-1',
        student_id: 'stu-1',
        amount_paid: 400,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'upi',
        reference_number: 'UPI98374211',
        notes: 'First installment via GPay',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'inv-2',
    student_id: 'stu-2',
    billing_month: getCurrentBillingMonth(),
    amount_due: 400,
    due_date: `${getCurrentBillingMonth().slice(0, 7)}-10`,
    status: 'paid',
    created_at: new Date().toISOString(),
    payments: [
      {
        id: 'pay-2',
        invoice_id: 'inv-2',
        student_id: 'stu-2',
        amount_paid: 400,
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'cash',
        notes: 'Full month advance paid at desk',
        created_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'inv-3',
    student_id: 'stu-3',
    billing_month: getCurrentBillingMonth(),
    amount_due: 400,
    due_date: `${getCurrentBillingMonth().slice(0, 7)}-10`,
    status: 'pending',
    created_at: new Date().toISOString(),
    payments: [],
  },
];

export const feeService = {
  async getInvoices(): Promise<FeeInvoice[]> {
    if (!isSupabaseConfigured) {
      const students = await studentService.getStudents();
      const studentMap = new Map(students.map((s) => [s.id, s]));

      return demoInvoices.map((inv) => {
        const { totalPaid, balanceRemaining, status } = calculateFeeBalance(
          inv.amount_due,
          inv.payments || []
        );
        return {
          ...inv,
          student: inv.student || studentMap.get(inv.student_id),
          total_paid: totalPaid,
          balance_remaining: balanceRemaining,
          status,
        };
      });
    }

    const { data, error } = await supabase
      .from('fee_invoices')
      .select('*, student:students(*, shift:shift_types(*)), payments:fee_payments(*)')
      .order('billing_month', { ascending: false });

    if (error) throw error;

    return (data || []).map((inv) => {
      const { totalPaid, balanceRemaining, status } = calculateFeeBalance(
        inv.amount_due,
        inv.payments || []
      );
      return {
        ...inv,
        total_paid: totalPaid,
        balance_remaining: balanceRemaining,
        status,
      };
    });
  },

  async generateMonthlyInvoices(
    billingMonth: string,
    activeStudents: Array<{ id: string; monthly_fee: number }>
  ): Promise<{ created: number; skipped: number }> {
    if (!isSupabaseConfigured) {
      let created = 0;
      let skipped = 0;
      const dueDate = `${billingMonth.slice(0, 7)}-10`;
      const students = await studentService.getStudents();
      const studentMap = new Map(students.map((s) => [s.id, s]));

      for (const student of activeStudents) {
        const exists = demoInvoices.some(
          (inv) => inv.student_id === student.id && inv.billing_month === billingMonth
        );
        if (exists) {
          skipped += 1;
        } else {
          demoInvoices.push({
            id: `inv-${Date.now()}-${student.id}`,
            student_id: student.id,
            student: studentMap.get(student.id),
            billing_month: billingMonth,
            amount_due: student.monthly_fee,
            due_date: dueDate,
            status: 'pending',
            created_at: new Date().toISOString(),
            payments: [],
          });
          created += 1;
        }
      }
      return { created, skipped };
    }

    // Query existing invoices for billingMonth
    const { data: existing, error: existError } = await supabase
      .from('fee_invoices')
      .select('student_id')
      .eq('billing_month', billingMonth);

    if (existError) throw existError;

    const existingStudentIds = new Set((existing || []).map((e) => e.student_id));
    const dueDate = `${billingMonth.slice(0, 7)}-10`;

    const newInvoices = activeStudents
      .filter((s) => !existingStudentIds.has(s.id))
      .map((s) => ({
        student_id: s.id,
        billing_month: billingMonth,
        amount_due: s.monthly_fee,
        due_date: dueDate,
        status: 'pending',
      }));

    if (newInvoices.length > 0) {
      const { error: insertError } = await supabase
        .from('fee_invoices')
        .insert(newInvoices);

      if (insertError) throw insertError;
    }

    return {
      created: newInvoices.length,
      skipped: existingStudentIds.size,
    };
  },

  async recordPayment(params: {
    invoiceId: string;
    studentId: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceNumber?: string;
    notes?: string;
  }): Promise<FeePayment> {
    const { invoiceId, studentId, amountPaid, paymentDate, paymentMethod, referenceNumber, notes } = params;

    if (amountPaid <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    if (!isSupabaseConfigured) {
      const invoice = demoInvoices.find((i) => i.id === invoiceId);
      if (!invoice) throw new Error('Invoice not found.');

      const { balanceRemaining } = calculateFeeBalance(invoice.amount_due, invoice.payments || []);
      if (amountPaid > balanceRemaining) {
        throw new Error(
          `Payment amount (₹${amountPaid}) exceeds outstanding balance (₹${balanceRemaining}).`
        );
      }

      const newPayment: FeePayment = {
        id: `pay-${Date.now()}`,
        invoice_id: invoiceId,
        student_id: studentId,
        amount_paid: amountPaid,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        reference_number: referenceNumber,
        notes,
        created_at: new Date().toISOString(),
      };

      invoice.payments = invoice.payments || [];
      invoice.payments.push(newPayment);

      const updated = calculateFeeBalance(invoice.amount_due, invoice.payments);
      invoice.status = updated.status;

      return newPayment;
    }

    // Supabase query to get invoice and existing payments
    const { data: invoice, error: invError } = await supabase
      .from('fee_invoices')
      .select('amount_due, payments:fee_payments(amount_paid)')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) throw new Error('Invoice not found in database.');

    const { balanceRemaining } = calculateFeeBalance(invoice.amount_due, invoice.payments || []);
    if (amountPaid > balanceRemaining) {
      throw new Error(
        `Payment amount of ₹${amountPaid} exceeds current balance of ₹${balanceRemaining}.`
      );
    }

    // Insert payment record
    const { data: payment, error: payError } = await supabase
      .from('fee_payments')
      .insert([
        {
          invoice_id: invoiceId,
          student_id: studentId,
          amount_paid: amountPaid,
          payment_date: paymentDate,
          payment_method: paymentMethod,
          reference_number: referenceNumber,
          notes,
        },
      ])
      .select()
      .single();

    if (payError) throw payError;

    // Recalculate and update invoice status
    const allPayments = [...(invoice.payments || []), { amount_paid: amountPaid }];
    const { status: newStatus } = calculateFeeBalance(invoice.amount_due, allPayments);

    await supabase
      .from('fee_invoices')
      .update({ status: newStatus })
      .eq('id', invoiceId);

    return payment;
  },

  async getAllPayments(): Promise<FeePayment[]> {
    if (!isSupabaseConfigured) {
      const all: FeePayment[] = [];
      const students = await studentService.getStudents();
      const studentMap = new Map(students.map((s) => [s.id, s]));

      demoInvoices.forEach((inv) => {
        if (inv.payments) {
          inv.payments.forEach((p) => {
            all.push({
              ...p,
              student: p.student || studentMap.get(p.student_id),
              invoice: inv,
            });
          });
        }
      });
      return all;
    }

    const { data, error } = await supabase
      .from('fee_payments')
      .select('*, student:students(student_code, full_name), invoice:fee_invoices(billing_month)')
      .order('payment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
