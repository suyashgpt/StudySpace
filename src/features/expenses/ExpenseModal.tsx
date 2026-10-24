import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { expenseService } from '../../services/expenseService';
import type { Expense, ExpenseCategory } from '../../types/database';
import { validateRequired, validatePositiveNumber } from '../../lib/validation';
import { getTodayDateString } from '../../lib/formatters';
import { AlertCircle, IndianRupee } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit,
}) => {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('electricity');
  const [amount, setAmount] = useState<number | string>('');
  const [expenseDate, setExpenseDate] = useState(getTodayDateString());
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDescription(expenseToEdit.description);
      setCategory(expenseToEdit.category);
      setAmount(expenseToEdit.amount);
      setExpenseDate(expenseToEdit.expense_date);
      setPaymentMethod(expenseToEdit.payment_method || 'upi');
      setNotes(expenseToEdit.notes || '');
    } else {
      setDescription('');
      setCategory('electricity');
      setAmount('');
      setExpenseDate(getTodayDateString());
      setPaymentMethod('upi');
      setNotes('');
    }
    setErrors({});
    setSubmitError(null);
  }, [expenseToEdit, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const descCheck = validateRequired(description, 'Description');
    if (!descCheck.isValid) newErrors.description = descCheck.error!;

    const amountCheck = validatePositiveNumber(amount, 'Expense amount');
    if (!amountCheck.isValid) newErrors.amount = amountCheck.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (expenseToEdit) {
        await expenseService.updateExpense(expenseToEdit.id, {
          description: description.trim(),
          category,
          amount: Number(amount),
          expense_date: expenseDate,
          payment_method: paymentMethod || null,
          notes: notes.trim() || null,
        });
      } else {
        await expenseService.createExpense({
          description: description.trim(),
          category,
          amount: Number(amount),
          expense_date: expenseDate,
          payment_method: paymentMethod || null,
          notes: notes.trim() || null,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save expense.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Operational Expense' : 'Log Library Operational Expense'}
      description="Record facility overhead costs, utilities, or maintenance bills"
      maxWidth="md"
    >
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Expense Description *
          </label>
          <input
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. October Commercial Electricity Bill"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          {errors.description && (
            <p className="text-xs text-rose-600 mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="electricity">Electricity</option>
              <option value="water">Water Supply</option>
              <option value="rent">Premises Rent</option>
              <option value="internet">Internet / WiFi</option>
              <option value="maintenance">Cleaning & Maintenance</option>
              <option value="miscellaneous">Miscellaneous</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Amount (INR ₹) *
            </label>
            <div className="relative">
              <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="1"
                min="1"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1200"
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden font-bold"
              />
            </div>
            {errors.amount && <p className="text-xs text-rose-600 mt-1">{errors.amount}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Expense Date *
            </label>
            <input
              type="date"
              required
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="upi">UPI / Online</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Optional Notes / Vendor Details
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Paid to electricity board counter"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Log Expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
