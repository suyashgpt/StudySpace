import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/Modal';
import { bookService } from '../../services/bookService';
import type { Book } from '../../types/database';
import { validateRequired, validatePositiveNumber } from '../../lib/validation';
import { AlertCircle } from 'lucide-react';

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bookToEdit?: Book | null;
}

export const BookModal: React.FC<BookModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  bookToEdit,
}) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('');
  const [isbn, setIsbn] = useState('');
  const [totalCopies, setTotalCopies] = useState<number | string>(1);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bookToEdit) {
      setTitle(bookToEdit.title);
      setAuthor(bookToEdit.author);
      setCategory(bookToEdit.category);
      setIsbn(bookToEdit.isbn || '');
      setTotalCopies(bookToEdit.total_copies);
    } else {
      setTitle('');
      setAuthor('');
      setCategory('General Studies');
      setIsbn('');
      setTotalCopies(2);
    }
    setErrors({});
    setSubmitError(null);
  }, [bookToEdit, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleCheck = validateRequired(title, 'Book Title');
    if (!titleCheck.isValid) newErrors.title = titleCheck.error!;

    const authorCheck = validateRequired(author, 'Author');
    if (!authorCheck.isValid) newErrors.author = authorCheck.error!;

    const copiesCheck = validatePositiveNumber(totalCopies, 'Total copies');
    if (!copiesCheck.isValid) newErrors.totalCopies = copiesCheck.error!;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (bookToEdit) {
        await bookService.updateBook(bookToEdit.id, {
          title: title.trim(),
          author: author.trim(),
          category: category.trim() || 'General Studies',
          isbn: isbn.trim() || null,
          total_copies: Math.floor(Number(totalCopies)),
        });
      } else {
        await bookService.createBook({
          title: title.trim(),
          author: author.trim(),
          category: category.trim() || 'General Studies',
          isbn: isbn.trim() || null,
          total_copies: Math.floor(Number(totalCopies)),
        });
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save book catalog.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={bookToEdit ? 'Edit Catalog Book' : 'Add Book to Catalog'}
      description="Study library reference book catalog and inventory copy count"
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
            Book Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Indian Polity (6th Edition)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          {errors.title && <p className="text-xs text-rose-600 mt-1">{errors.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            Author *
          </label>
          <input
            type="text"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="e.g. M. Laxmikanth"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
          />
          {errors.author && <p className="text-xs text-rose-600 mt-1">{errors.author}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Category
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Civil Services"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
              Total Physical Copies *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              required
              value={totalCopies}
              onChange={(e) => setTotalCopies(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-indigo-600 focus:outline-hidden font-bold"
            />
            {errors.totalCopies && (
              <p className="text-xs text-rose-600 mt-1">{errors.totalCopies}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
            ISBN (Optional)
          </label>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="e.g. 978-9352603633"
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
            {isSubmitting ? 'Saving...' : bookToEdit ? 'Save Changes' : 'Add to Catalog'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
