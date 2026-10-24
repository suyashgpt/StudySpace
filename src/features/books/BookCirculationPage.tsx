import React, { useState, useEffect, useMemo } from 'react';
import { bookService } from '../../services/bookService';
import type { Book, BookLoan } from '../../types/database';
import { BookModal } from './BookModal';
import { IssueBookModal } from './IssueBookModal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatDate } from '../../lib/formatters';
import {
  BookOpen,
  Plus,
  Search,
  BookCheck,
  RotateCcw,
  Edit2,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const BookCirculationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'catalog' | 'loans'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueTargetBook, setIssueTargetBook] = useState<Book | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [bData, lData] = await Promise.all([
        bookService.getBooks(),
        bookService.getLoans(),
      ]);
      setBooks(bData);
      setLoans(lData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load book circulation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddBook = () => {
    setSelectedBook(null);
    setIsBookModalOpen(true);
  };

  const handleOpenEditBook = (b: Book) => {
    setSelectedBook(b);
    setIsBookModalOpen(true);
  };

  const handleOpenIssue = (b?: Book) => {
    setIssueTargetBook(b || null);
    setIsIssueModalOpen(true);
  };

  const handleReturnBook = async (loan: BookLoan) => {
    if (!window.confirm(`Confirm return of "${loan.book?.title || 'Book'}"? This copy will immediately become available for circulation.`)) {
      return;
    }

    try {
      await bookService.returnBook(loan.id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to record return.');
    }
  };

  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      return (
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [books, searchQuery]);

  const filteredLoans = useMemo(() => {
    return loans.filter((l) => {
      const bookTitle = l.book?.title || '';
      const stuName = l.student?.full_name || '';
      const stuCode = l.student?.student_code || '';
      return (
        bookTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stuName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stuCode.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [loans, searchQuery]);

  if (loading) {
    return <LoadingSpinner message="Loading library catalog & circulation status..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Book Inventory & Circulation</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage reference books, track borrowing loans, and maintain real-time copy availability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenIssue()}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            <BookCheck className="w-4 h-4" />
            Issue Reference Book
          </button>
          <button
            type="button"
            onClick={handleOpenAddBook}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add New Book
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('catalog')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'catalog'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Catalog Inventory ({books.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('loans')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'loans'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Clock className="w-4 h-4" />
          Circulation Loans ({loans.filter((l) => !l.returned_at).length} Active)
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              activeTab === 'catalog'
                ? 'Search by title, author, or category...'
                : 'Search loans by book or student...'
            }
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <>
          {filteredBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No Books Found"
              description="No reference books in the catalog match your search."
              actionLabel="Add Book to Catalog"
              onAction={handleOpenAddBook}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Title & Author</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Total Copies</th>
                      <th className="px-5 py-3.5">Currently Issued</th>
                      <th className="px-5 py-3.5">Available Stock</th>
                      <th className="px-5 py-3.5 text-right">Circulation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredBooks.map((book) => {
                      const isAvailable = (book.available_copies ?? 0) > 0;
                      return (
                        <tr key={book.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            <div>
                              <p className="font-bold text-slate-900">{book.title}</p>
                              <p className="text-xs text-slate-500 font-normal">by {book.author}</p>
                              {book.isbn && (
                                <p className="text-[11px] text-slate-400 font-mono">ISBN: {book.isbn}</p>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-medium text-slate-700">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                              {book.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-slate-800">
                            {book.total_copies}
                          </td>
                          <td className="px-5 py-3.5 font-semibold text-indigo-600">
                            {book.active_loans_count || 0}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {book.available_copies} Available
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                disabled={!isAvailable}
                                onClick={() => handleOpenIssue(book)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isAvailable
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <BookCheck className="w-3.5 h-3.5" />
                                Issue
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenEditBook(book)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                title="Edit Book Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Circulation Loans */}
      {activeTab === 'loans' && (
        <>
          {filteredLoans.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No Loan Records Found"
              description="No book loans match your search."
              actionLabel="Issue Reference Book"
              onAction={() => handleOpenIssue()}
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Book Title</th>
                      <th className="px-5 py-3.5">Borrowing Student</th>
                      <th className="px-5 py-3.5">Issue Date</th>
                      <th className="px-5 py-3.5">Due Date</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Return Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLoans.map((loan) => {
                      const isReturned = Boolean(loan.returned_at);
                      const isOverdue = loan.status === 'overdue';

                      return (
                        <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5 font-semibold text-slate-900">
                            <div>
                              <p className="font-bold text-slate-900">
                                {loan.book?.title || 'Book Title'}
                              </p>
                              <p className="text-xs text-slate-500 font-normal">
                                {loan.book?.author}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                                {loan.student?.student_code || 'STU'}
                              </span>
                              <span className="font-semibold text-slate-800 text-xs">
                                {loan.student?.full_name || 'Member'}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-600">
                            {formatDate(loan.issue_date)}
                          </td>
                          <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                            {formatDate(loan.due_date)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge
                              variant={
                                isReturned
                                  ? 'neutral'
                                  : isOverdue
                                  ? 'danger'
                                  : 'success'
                              }
                              size="sm"
                            >
                              {isReturned ? 'Returned' : isOverdue ? 'Overdue' : 'Issued'}
                            </Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {!isReturned ? (
                              <button
                                type="button"
                                onClick={() => handleReturnBook(loan)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                Mark Returned
                              </button>
                            ) : (
                              <span className="text-xs text-slate-400">
                                Returned on {formatDate(loan.returned_at)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <BookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSuccess={loadData}
        bookToEdit={selectedBook}
      />

      <IssueBookModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={loadData}
        preselectedBook={issueTargetBook}
      />
    </div>
  );
};
