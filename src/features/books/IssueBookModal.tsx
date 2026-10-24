import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { bookService } from '../../services/bookService';
import { studentService } from '../../services/studentService';
import type { Book, Student } from '../../types/database';
import { AlertCircle, BookOpen } from 'lucide-react';

interface IssueBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedBook?: Book | null;
}

export const IssueBookModal: React.FC<IssueBookModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedBook,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Compute default due date 14 days from today
  const getDefaultDueDate = (): string => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  };

  useEffect(() => {
    Promise.all([bookService.getBooks(), studentService.getStudents()]).then(([bData, sData]) => {
      setBooks(bData);
      setStudents(sData.filter((s) => s.is_active));

      if (preselectedBook) {
        setSelectedBookId(preselectedBook.id);
      } else if (bData.length > 0) {
        setSelectedBookId(bData[0].id);
      }

      if (sData.filter((s) => s.is_active).length > 0) {
        setSelectedStudentId(sData.filter((s) => s.is_active)[0].id);
      }
    });

    setDueDate(getDefaultDueDate());
    setNotes('');
    setError(null);
  }, [preselectedBook, isOpen]);

  const activeBook = books.find((b) => b.id === selectedBookId);
  const isAvailable = (activeBook?.available_copies ?? 0) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedBookId) {
      setError('Please select a book.');
      return;
    }

    if (!selectedStudentId) {
      setError('Please select a student.');
      return;
    }

    if (!isAvailable) {
      setError('Selected book has no available copies in stock.');
      return;
    }

    setIsSubmitting(true);
    try {
      await bookService.issueBook({
        bookId: selectedBookId,
        studentId: selectedStudentId,
        dueDate,
        notes: notes.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to issue book loan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Issue Reference Book"
      description="Circulate a catalog book to an active enrolled student"
      maxWidth="md"
    >
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Book Availability Indicator */}
      {activeBook && (
        <div
          className={`mb-4 p-3 rounded-xl border flex items-center justify-between text-xs ${
            isAvailable
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="font-semibold">{activeBook.title}</span>
          </div>
          <span className="font-bold">
            {activeBook.available_copies} of {activeBook.total_copies} Copies Available
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Select Catalog Book *
          </label>
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} by {b.author} ({b.available_copies ?? 0} available)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Select Enrolled Student *
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.student_code}] {s.full_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Return Due Date *
          </label>
          <input
            type="date"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          <p className="text-[11px] text-slate-400 mt-1">Default 14 days loan period</p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Issue Remarks / Notes
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Reference copy condition good"
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
            disabled={isSubmitting || !isAvailable}
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            {isSubmitting ? 'Issuing...' : 'Confirm Loan Issue'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
