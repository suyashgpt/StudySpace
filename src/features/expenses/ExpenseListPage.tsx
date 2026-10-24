import React, { useState, useEffect, useMemo } from 'react';
import { expenseService } from '../../services/expenseService';
import type { Expense, ExpenseCategory } from '../../types/database';
import { ExpenseModal } from './ExpenseModal';
import { Badge, type BadgeVariant } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatINR, formatDate } from '../../lib/formatters';
import { calculateExpenseSummary } from '../../lib/calculations';
import {
  TrendingDown,
  PlusCircle,
  Search,
  Filter,
  Edit2,
  Zap,
  Droplet,
  Building,
  Wifi,
  Wrench,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export const ExpenseListPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ExpenseCategory>('all');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getExpenses();
      setExpenses(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, []);

  const handleOpenAdd = () => {
    setSelectedExpense(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setSelectedExpense(exp);
    setIsModalOpen(true);
  };

  const summary = useMemo(() => {
    return calculateExpenseSummary(expenses);
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      const matchesSearch =
        exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCat = categoryFilter === 'all' ? true : exp.category === categoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [expenses, searchQuery, categoryFilter]);

  const getCategoryBadgeVariant = (cat: ExpenseCategory): BadgeVariant => {
    const map: Record<ExpenseCategory, BadgeVariant> = {
      electricity: 'warning',
      water: 'info',
      rent: 'purple',
      internet: 'info',
      maintenance: 'neutral',
      miscellaneous: 'neutral',
    };
    return map[cat] || 'neutral';
  };

  if (loading) {
    return <LoadingSpinner message="Loading operational expenditure records..." size="lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Operational Expenses</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor and record facility utility bills, premises rent, wifi, and maintenance outlays
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          Log Operational Expense
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Categorized Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Electricity</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.electricity)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Building className="w-3.5 h-3.5 text-purple-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Rent</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.rent)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wifi className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Internet WiFi</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.internet)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Droplet className="w-3.5 h-3.5 text-cyan-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Water</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.water)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wrench className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Maintenance</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.maintenance)}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Misc</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            {formatINR(summary.categoryBreakdown.miscellaneous)}
          </p>
        </div>
      </div>

      {/* Toolbar: Search and Category Filter */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expense description or notes..."
            className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-indigo-600 focus:outline-hidden"
          >
            <option value="all">All Categories ({expenses.length})</option>
            <option value="electricity">Electricity</option>
            <option value="water">Water</option>
            <option value="rent">Rent</option>
            <option value="internet">Internet</option>
            <option value="maintenance">Maintenance</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={TrendingDown}
          title="No Expenses Logged"
          description="No operational expenses match your criteria. Record your study library facility overheads to keep track."
          actionLabel="Log Operational Expense"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Expense Date</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-900">
                      <div>
                        {exp.description}
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 font-normal truncate max-w-sm">
                            {exp.notes}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={getCategoryBadgeVariant(exp.category)} size="sm">
                        {exp.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-rose-600">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(exp.expense_date)}
                    </td>
                    <td className="px-5 py-3.5 text-xs uppercase font-medium text-slate-600">
                      {exp.payment_method || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(exp)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Expense"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <span>Showing {filteredExpenses.length} records</span>
            <span className="font-semibold text-slate-700">
              Total Overheads: {formatINR(summary.totalAmount)}
            </span>
          </div>
        </div>
      )}

      {/* Modal */}
      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadExpenses}
        expenseToEdit={selectedExpense}
      />
    </div>
  );
};
