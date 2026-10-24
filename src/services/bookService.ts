import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Book, BookLoan } from '../types/database';
import { calculateAvailableCopies } from '../lib/calculations';

let demoBooks: Book[] = [
  {
    id: 'book-1',
    title: 'Indian Polity (6th Edition)',
    author: 'M. Laxmikanth',
    category: 'Civil Services',
    isbn: '978-9352603633',
    total_copies: 4,
    created_at: new Date().toISOString(),
  },
  {
    id: 'book-2',
    title: 'Quantitative Aptitude for Competitive Examinations',
    author: 'Dr. R.S. Aggarwal',
    category: 'General Aptitude',
    isbn: '978-9352534029',
    total_copies: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'book-3',
    title: 'Operating System Concepts (10th Edition)',
    author: 'Silberschatz, Galvin, Gagne',
    category: 'Computer Science',
    isbn: '978-1118063330',
    total_copies: 2,
    created_at: new Date().toISOString(),
  },
];

let demoLoans: BookLoan[] = [
  {
    id: 'loan-1',
    book_id: 'book-1',
    student_id: 'stu-1',
    issue_date: '2026-10-10',
    due_date: '2026-10-24',
    returned_at: null,
    status: 'issued',
    notes: 'Reference copy issued for 14 days',
    created_at: new Date().toISOString(),
  },
];

export const bookService = {
  async getBooks(): Promise<Book[]> {
    if (!isSupabaseConfigured) {
      return demoBooks.map((b) => {
        const activeLoans = demoLoans.filter((l) => l.book_id === b.id && !l.returned_at).length;
        const { availableCopies } = calculateAvailableCopies(b.total_copies, activeLoans);
        return {
          ...b,
          active_loans_count: activeLoans,
          available_copies: availableCopies,
        };
      });
    }

    const { data: books, error: bookError } = await supabase
      .from('books')
      .select('*')
      .order('title', { ascending: true });

    if (bookError) throw bookError;

    // Get active loans count
    const { data: loans, error: loanError } = await supabase
      .from('book_loans')
      .select('book_id')
      .is('returned_at', null);

    if (loanError) throw loanError;

    const loanCountMap = (loans || []).reduce<Record<string, number>>((acc, l) => {
      acc[l.book_id] = (acc[l.book_id] || 0) + 1;
      return acc;
    }, {});

    return (books || []).map((b) => {
      const activeLoans = loanCountMap[b.id] || 0;
      const { availableCopies } = calculateAvailableCopies(b.total_copies, activeLoans);
      return {
        ...b,
        active_loans_count: activeLoans,
        available_copies: availableCopies,
      };
    });
  },

  async createBook(book: Omit<Book, 'id' | 'created_at' | 'active_loans_count' | 'available_copies'>): Promise<Book> {
    if (book.total_copies < 1) {
      throw new Error('Total copies must be at least 1.');
    }

    if (!isSupabaseConfigured) {
      const newBook: Book = {
        ...book,
        id: `book-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      demoBooks.unshift(newBook);
      return newBook;
    }

    const { data, error } = await supabase
      .from('books')
      .insert([book])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBook(
    id: string,
    updates: Partial<Omit<Book, 'id' | 'created_at' | 'active_loans_count' | 'available_copies'>>
  ): Promise<Book> {
    if (updates.total_copies !== undefined && updates.total_copies < 1) {
      throw new Error('Total copies must be at least 1.');
    }

    if (!isSupabaseConfigured) {
      demoBooks = demoBooks.map((b) => (b.id === id ? { ...b, ...updates } : b));
      const updated = demoBooks.find((b) => b.id === id);
      if (!updated) throw new Error('Book not found.');
      return updated;
    }

    const { data, error } = await supabase
      .from('books')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getLoans(): Promise<BookLoan[]> {
    if (!isSupabaseConfigured) {
      return demoLoans.map((loan) => {
        const book = demoBooks.find((b) => b.id === loan.book_id);
        const today = new Date().toISOString().split('T')[0];
        let status = loan.status;
        if (!loan.returned_at && loan.due_date < today) {
          status = 'overdue';
        }
        return {
          ...loan,
          status,
          book,
        };
      });
    }

    const { data, error } = await supabase
      .from('book_loans')
      .select('*, book:books(*), student:students(*)')
      .order('issue_date', { ascending: false });

    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    return (data || []).map((loan) => {
      let status = loan.status;
      if (!loan.returned_at && loan.due_date < today) {
        status = 'overdue';
      }
      return { ...loan, status };
    });
  },

  async issueBook(params: {
    bookId: string;
    studentId: string;
    dueDate: string;
    notes?: string;
  }): Promise<BookLoan> {
    const { bookId, studentId, dueDate, notes } = params;

    // Check availability first
    const books = await this.getBooks();
    const targetBook = books.find((b) => b.id === bookId);
    if (!targetBook) {
      throw new Error('Selected book not found.');
    }

    if ((targetBook.available_copies ?? 0) <= 0) {
      throw new Error(`Cannot issue book. All ${targetBook.total_copies} copies are currently on loan.`);
    }

    const today = new Date().toISOString().split('T')[0];

    if (!isSupabaseConfigured) {
      const newLoan: BookLoan = {
        id: `loan-${Date.now()}`,
        book_id: bookId,
        student_id: studentId,
        issue_date: today,
        due_date: dueDate,
        returned_at: null,
        status: 'issued',
        notes,
        created_at: new Date().toISOString(),
      };
      demoLoans.unshift(newLoan);
      return newLoan;
    }

    const { data, error } = await supabase
      .from('book_loans')
      .insert([
        {
          book_id: bookId,
          student_id: studentId,
          issue_date: today,
          due_date: dueDate,
          status: 'issued',
          notes,
        },
      ])
      .select('*, book:books(*), student:students(*)')
      .single();

    if (error) throw error;
    return data;
  },

  async returnBook(loanId: string): Promise<BookLoan> {
    const nowIso = new Date().toISOString();

    if (!isSupabaseConfigured) {
      const loan = demoLoans.find((l) => l.id === loanId);
      if (!loan) throw new Error('Loan record not found.');
      loan.returned_at = nowIso;
      loan.status = 'returned';
      return loan;
    }

    const { data, error } = await supabase
      .from('book_loans')
      .update({
        returned_at: nowIso,
        status: 'returned',
      })
      .eq('id', loanId)
      .select('*, book:books(*), student:students(*)')
      .single();

    if (error) throw error;
    return data;
  },
};
