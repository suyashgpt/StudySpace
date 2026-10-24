import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { feeService } from '../../services/feeService';
import type { FeeInvoice, FeePayment, PaymentMethod } from '../../types/database';
import { formatINR, getTodayDateString, formatMonth } from '../../lib/formatters';
import { validatePositiveNumber } from '../../lib/validation';
import { AlertCircle, IndianRupee, Phone, ShieldCheck } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (payment?: FeePayment) => void;
  invoice: FeeInvoice | null;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}) => {
  const [amount, setAmount] = useState<number | string>('');
  const [paymentDate, setPaymentDate] = useState<string>(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (invoice) {
      setAmount(invoice.balance_remaining ?? invoice.amount_due);
      setPaymentDate(getTodayDateString());
      setPaymentMethod('upi');
      setReferenceNumber('');
      setNotes('');
      setError(null);
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const student = invoice.student;
  const currentBalance = invoice.balance_remaining ?? invoice.amount_due;
  const numAmount = Number(amount) || 0;
  const projectedBalance = Math.max(0, currentBalance - numAmount);
  const isOnlinePayment = paymentMethod === 'upi' || paymentMethod === 'card' || paymentMethod === 'bank_transfer';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valCheck = validatePositiveNumber(amount, 'Payment amount');
    if (!valCheck.isValid) {
      setError(valCheck.error!);
      return;
    }

    const payAmount = Number(amount);
    if (payAmount > currentBalance) {
      setError(`Payment amount (${formatINR(payAmount)}) cannot exceed current balance (${formatINR(currentBalance)}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const recordedPayment = await feeService.recordPayment({
        invoiceId: invoice.id,
        studentId: invoice.student_id,
        amountPaid: payAmount,
        paymentDate,
        paymentMethod,
        referenceNumber: referenceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      onSuccess(recordedPayment);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to record fee payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayFull = () => {
    setAmount(currentBalance);
  };

  const initials = student?.full_name
    ? student.full_name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'ST';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Fee Payment"
      description={`Issuing official payment entry for ${student?.full_name || 'Member'}`}
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Prominent Student Identity Card (Eliminates Identity Blindness Loophole) */}
      <div className="mb-4 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3 text-left">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                {student?.full_name || 'Student Member'}
              </h4>
              <span className="font-mono text-[10px] font-bold text-indigo-700 bg-white px-1.5 py-0.5 rounded border border-indigo-200">
                {student?.student_code || 'STU-ID'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              {student?.contact_number && (
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  +91 {student.contact_number}
                </span>
              )}
              <span>•</span>
              <span className="text-indigo-800 font-medium">
                {student?.shift?.name || 'Assigned Shift'}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-500 block">Billing Month</span>
          <span className="text-xs font-semibold text-slate-800">{formatMonth(invoice.billing_month)}</span>
        </div>
      </div>

      {/* Invoice Balance Summary Box with Live Projected Remaining Balance */}
      <div className="mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-xs text-center">
        <div>
          <span className="text-slate-500 block">Total Due:</span>
          <p className="font-bold text-slate-800 text-sm mt-0.5">{formatINR(invoice.amount_due)}</p>
        </div>
        <div>
          <span className="text-slate-500 block">Paid So Far:</span>
          <p className="font-bold text-emerald-600 text-sm mt-0.5">{formatINR(invoice.total_paid || 0)}</p>
        </div>
        <div>
          <span className="text-slate-600 font-semibold block">Outstanding:</span>
          <p className="font-bold text-amber-600 text-sm mt-0.5">
            {formatINR(currentBalance)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* Payment Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Payment Amount (INR ₹) *
            </label>
            <button
              type="button"
              onClick={handlePayFull}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
            >
              Pay Full Balance ({formatINR(currentBalance)})
            </button>
          </div>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              step="1"
              min="1"
              max={currentBalance}
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 400"
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-hidden font-bold"
            />
          </div>

          {/* Live Dynamic Ledger Projection */}
          {numAmount > 0 && numAmount <= currentBalance && (
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center justify-between">
              <span>Projected balance after this payment:</span>
              <strong className={projectedBalance === 0 ? 'text-emerald-600 font-bold' : 'text-slate-800'}>
                {projectedBalance === 0 ? '₹0.00 (Fully Settled)' : formatINR(projectedBalance)}
              </strong>
            </p>
          )}
        </div>

        {/* Date & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Payment Date *
            </label>
            <input
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
              <option value="cash">Cash (Desk Counter)</option>
              <option value="card">Debit / Credit Card (POS)</option>
              <option value="bank_transfer">Direct Bank Transfer / NEFT</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* Reference / UTR Number (Eliminates Untracked Online Payments Loophole) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
              Reference / Transaction UTR No.
            </label>
            {isOnlinePayment && (
              <span className="text-[10px] text-indigo-600 font-semibold">
                Recommended for UPI/Bank
              </span>
            )}
          </div>
          <input
            type="text"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            placeholder={paymentMethod === 'cash' ? 'Optional counter receipt number' : 'e.g. UPI Ref / UTR / GPay txn ID'}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Audit / Admin Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Paid first installment at desk, promised remaining on 15th"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        {/* Audit info stamp */}
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Audit Logged: Transaction will automatically generate a verified receipt and update student ledger.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Recording Transaction...' : 'Confirm & Record Payment'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
