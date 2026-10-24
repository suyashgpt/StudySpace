import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { studentService } from '../../services/studentService';
import { shiftService } from '../../services/shiftService';
import type { Student, ShiftType } from '../../types/database';
import {
  validateRequired,
  validatePositiveNumber,
  validateContactNumber,
  validateStudentCode,
} from '../../lib/validation';
import { getTodayDateString } from '../../lib/formatters';
import { AlertCircle } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  studentToEdit,
}) => {
  const [shifts, setShifts] = useState<ShiftType[]>([]);
  const [studentCode, setStudentCode] = useState('');
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [enrollmentDate, setEnrollmentDate] = useState(getTodayDateString());
  const [shiftId, setShiftId] = useState('');
  const [monthlyFee, setMonthlyFee] = useState<number | string>(400);
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    shiftService.getShifts().then((data) => {
      setShifts(data);
      if (!studentToEdit && data.length > 0 && !shiftId) {
        setShiftId(data[0].id);
        setMonthlyFee(data[0].price);
      }
    });
  }, [studentToEdit]);

  useEffect(() => {
    if (studentToEdit) {
      setStudentCode(studentToEdit.student_code);
      setFullName(studentToEdit.full_name);
      setContactNumber(studentToEdit.contact_number || '');
      setEnrollmentDate(studentToEdit.enrollment_date);
      setShiftId(studentToEdit.shift_id || '');
      setMonthlyFee(studentToEdit.monthly_fee);
      setNotes(studentToEdit.notes || '');
      setIsActive(studentToEdit.is_active);
    } else {
      setStudentCode(`STU-${Math.floor(100 + Math.random() * 900)}`);
      setFullName('');
      setContactNumber('');
      setEnrollmentDate(getTodayDateString());
      setNotes('');
      setIsActive(true);
    }
    setErrors({});
    setSubmitError(null);
  }, [studentToEdit, isOpen]);

  const handleShiftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    setShiftId(selectedId);
    const foundShift = shifts.find((s) => s.id === selectedId);
    if (foundShift) {
      setMonthlyFee(foundShift.price);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const codeCheck = validateStudentCode(studentCode);
    if (!codeCheck.isValid) newErrors.studentCode = codeCheck.error!;

    const nameCheck = validateRequired(fullName, 'Full Name');
    if (!nameCheck.isValid) newErrors.fullName = nameCheck.error!;

    const phoneCheck = validateContactNumber(contactNumber);
    if (!phoneCheck.isValid) newErrors.contactNumber = phoneCheck.error!;

    const feeCheck = validatePositiveNumber(monthlyFee, 'Monthly fee');
    if (!feeCheck.isValid) newErrors.monthlyFee = feeCheck.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (studentToEdit) {
        await studentService.updateStudent(studentToEdit.id, {
          student_code: studentCode.trim().toUpperCase(),
          full_name: fullName.trim(),
          contact_number: contactNumber.trim() || null,
          enrollment_date: enrollmentDate,
          shift_id: shiftId || null,
          monthly_fee: Number(monthlyFee),
          is_active: isActive,
          notes: notes.trim() || null,
        });
      } else {
        await studentService.createStudent({
          student_code: studentCode.trim().toUpperCase(),
          full_name: fullName.trim(),
          contact_number: contactNumber.trim() || null,
          enrollment_date: enrollmentDate,
          shift_id: shiftId || null,
          monthly_fee: Number(monthlyFee),
          is_active: isActive,
          notes: notes.trim() || null,
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save student record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? 'Edit Student Details' : 'Enroll New Student'}
      description="Student record and study reading seat allocation"
      maxWidth="lg"
    >
      {submitError && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Student Code *
            </label>
            <input
              type="text"
              required
              value={studentCode}
              onChange={(e) => setStudentCode(e.target.value)}
              placeholder="e.g. STU-101"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
            {errors.studentCode && (
              <p className="text-xs text-rose-600 mt-1">{errors.studentCode}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Enrollment Date *
            </label>
            <input
              type="date"
              required
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Aarav Sharma"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          {errors.fullName && <p className="text-xs text-rose-600 mt-1">{errors.fullName}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Contact Number (10 Digits)
            </label>
            <input
              type="tel"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="9876543210"
              maxLength={10}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
            {errors.contactNumber && (
              <p className="text-xs text-rose-600 mt-1">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Assigned Study Shift
            </label>
            <select
              value={shiftId}
              onChange={handleShiftChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="">-- Select Shift --</option>
              {shifts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (₹{s.price})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Monthly Fee (INR ₹) *
            </label>
            <input
              type="number"
              min="0"
              step="10"
              required
              value={monthlyFee}
              onChange={(e) => setMonthlyFee(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
            {errors.monthlyFee && (
              <p className="text-xs text-rose-600 mt-1">{errors.monthlyFee}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Membership Status
            </label>
            <select
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value="active">Active (Currently Attending)</option>
              <option value="inactive">Inactive (Deactivated)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Optional Notes / Target Exam
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. UPSC Prelims preparation, seat preference hall 2"
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
            {isSubmitting ? 'Saving...' : studentToEdit ? 'Save Changes' : 'Enroll Student'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
