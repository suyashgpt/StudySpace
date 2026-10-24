import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { shiftService } from '../../services/shiftService';
import type { ShiftType } from '../../types/database';
import { validateRequired, validatePositiveNumber, validateNonNegativeNumber } from '../../lib/validation';
import { AlertCircle } from 'lucide-react';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  shiftToEdit?: ShiftType | null;
}

export const ShiftModal: React.FC<ShiftModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  shiftToEdit,
}) => {
  const [name, setName] = useState('');
  const [durationHours, setDurationHours] = useState<number | string>(4);
  const [price, setPrice] = useState<number | string>(400);
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (shiftToEdit) {
      setName(shiftToEdit.name);
      setDurationHours(shiftToEdit.duration_hours);
      setPrice(shiftToEdit.price);
      setIsActive(shiftToEdit.is_active);
    } else {
      setName('');
      setDurationHours(4);
      setPrice(400);
      setIsActive(true);
    }
    setErrors({});
    setSubmitError(null);
  }, [shiftToEdit, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameCheck = validateRequired(name, 'Shift Name');
    if (!nameCheck.isValid) newErrors.name = nameCheck.error!;

    const durationCheck = validatePositiveNumber(durationHours, 'Duration in hours');
    if (!durationCheck.isValid) newErrors.durationHours = durationCheck.error!;

    const priceCheck = validateNonNegativeNumber(price, 'Price');
    if (!priceCheck.isValid) newErrors.price = priceCheck.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (shiftToEdit) {
        await shiftService.updateShift(shiftToEdit.id, {
          name: name.trim(),
          duration_hours: Number(durationHours),
          price: Number(price),
          is_active: isActive,
        });
      } else {
        await shiftService.createShift({
          name: name.trim(),
          duration_hours: Number(durationHours),
          price: Number(price),
          is_active: isActive,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save study shift.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shiftToEdit ? 'Configure Study Shift' : 'Create New Study Shift'}
      description="Define reading room shift duration and configurable monthly price"
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
            Shift Name *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Morning Shift (4 Hours)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          {errors.name && <p className="text-xs text-rose-600 mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Duration (Hours) *
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              required
              value={durationHours}
              onChange={(e) => setDurationHours(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
            {errors.durationHours && (
              <p className="text-xs text-rose-600 mt-1">{errors.durationHours}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Monthly Fee (₹) *
            </label>
            <input
              type="number"
              min="0"
              step="10"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
            {errors.price && <p className="text-xs text-rose-600 mt-1">{errors.price}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Operational Status
          </label>
          <select
            value={isActive ? 'active' : 'inactive'}
            onChange={(e) => setIsActive(e.target.value === 'active')}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="active">Active (Available for Student Allocation)</option>
            <option value="inactive">Inactive (Discontinued)</option>
          </select>
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
            {isSubmitting ? 'Saving...' : shiftToEdit ? 'Save Changes' : 'Create Shift'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
