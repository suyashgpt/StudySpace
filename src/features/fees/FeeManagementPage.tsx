import React, { useState, useEffect, useMemo } from 'react';
import { feeService } from '../../services/feeService';
import { studentService } from '../../services/studentService';
import type { FeeInvoice, FeePayment, Student } from '../../types/database';
import { RecordPaymentModal } from './RecordPaymentModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';
import { Badge } from '../../components/Badge';
import { EmptyState } from '../../components/EmptyState';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { formatINR, formatMonth, formatDate, getCurrentBillingMonth } from '../../lib/formatters';
import {
  Receipt,
  Search,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  AlertCircle,
  Printer,
  Phone,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const FeeManagementPage: React.FC = () => {
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [viewFilter, setViewFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentBillingMonth());

  // Modal and accordion
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptInvoice, setReceiptInvoice] = useState<FeeInvoice | null>(null);
  const [receiptPayment, setReceiptPayment] = useState<FeePayment | null>(null);

  // Batch generation loading & copy alert
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);
  const [copiedDueList, setCopiedDueList] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [invData, stuData] = await Promise.all([
        feeService.getInvoices(),
        studentService.getStudents(),
      ]);

      // Fallback join guarantee: ensure every invoice is coupled with its student record
      const studentMap = new Map(stuData.map((s) => [s.id, s]));
      const enrichedInvoices = invData.map((inv) => ({
        ...inv,
        student: inv.student || studentMap.get(inv.student_id),
      }));

      setInvoices(enrichedInvoices);
      setStudents(stuData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load fee invoices.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateInvoices = async () => {
    const activeStudents = students.filter((s) => s.is_active);
    if (activeStudents.length === 0) {
      alert('No active students available to generate invoices for.');
      return;
    }

    if (
      !window.confirm(
        `Generate monthly fee invoices for ${formatMonth(selectedMonth)} for ${activeStudents.length} active students? Existing invoices for this month will be skipped automatically.`
      )
    ) {
      return;
    }

    try {
      setIsGenerating(true);
      setBatchNotice(null);
      const res = await feeService.generateMonthlyInvoices(
        selectedMonth,
        activeStudents.map((s) => ({ id: s.id, monthly_fee: s.monthly_fee }))
      );
      setBatchNotice(`Batch Result: Generated ${res.created} new invoices, skipped ${res.skipped} existing invoices.`);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed during batch invoice generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenPayment = (inv: FeeInvoice) => {
    setSelectedInvoice(inv);
    setIsPayModalOpen(true);
  };

  const handlePaymentSuccess = (payment?: FeePayment) => {
    loadData();
    if (payment && selectedInvoice) {
      // Auto-prompt official receipt
      setReceiptInvoice(selectedInvoice);
      setReceiptPayment(payment);
      setReceiptModalOpen(true);
    }
  };

  const handleOpenReceipt = (inv: FeeInvoice, pay: FeePayment) => {
    setReceiptInvoice(inv);
    setReceiptPayment(pay);
    setReceiptModalOpen(true);
  };

  const toggleExpand = (id: string) => {
    setExpandedInvoiceId(expandedInvoiceId === id ? null : id);
  };

  // Metrics
  const totalBilled = useMemo(() => {
    return invoices.reduce((sum, i) => sum + (Number(i.amount_due) || 0), 0);
  }, [invoices]);

  const totalCollected = useMemo(() => {
    return invoices.reduce((sum, i) => sum + (Number(i.total_paid) || 0), 0);
  }, [invoices]);

  const totalOutstanding = useMemo(() => {
    return invoices.reduce((sum, i) => sum + (Number(i.balance_remaining) || 0), 0);
  }, [invoices]);

  const dueInvoicesCount = useMemo(() => {
    return invoices.filter((i) => (i.balance_remaining ?? i.amount_due) > 0).length;
  }, [invoices]);

  const settledInvoicesCount = useMemo(() => {
    return invoices.filter((i) => i.status === 'paid').length;
  }, [invoices]);

  // Copy Defaulters Reminder Broadcast
  const handleCopyDueList = () => {
    const dueList = invoices
      .filter((inv) => (inv.balance_remaining ?? inv.amount_due) > 0)
      .map(
        (inv, index) =>
          `${index + 1}. ${inv.student?.full_name || 'Member'} (${inv.student?.student_code || 'ID'}): Due ${formatINR(
            inv.balance_remaining ?? inv.amount_due
          )} for ${formatMonth(inv.billing_month)} (Phone: ${inv.student?.contact_number || 'N/A'})`
      )
      .join('\n');

    const message = `*StudySpace Pending Fee Dues Alert (${formatMonth(selectedMonth)})*\nTotal Outstanding: ${formatINR(
      totalOutstanding
    )}\n\n${dueList}\n\nPlease settle your pending dues at the library reception or via UPI.`;

    navigator.clipboard.writeText(message);
    setCopiedDueList(true);
    setTimeout(() => setCopiedDueList(false), 3000);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const studentName = inv.student?.full_name || '';
      const studentCode = inv.student?.student_code || '';
      const contactNum = inv.student?.contact_number || '';
      const shiftName = inv.student?.shift?.name || '';

      const query = searchQuery.toLowerCase();
      const matchesSearch =
        studentName.toLowerCase().includes(query) ||
        studentCode.toLowerCase().includes(query) ||
        contactNum.includes(query) ||
        shiftName.toLowerCase().includes(query);

      const hasBalance = (inv.balance_remaining ?? inv.amount_due) > 0;
      let matchesView = true;
      if (viewFilter === 'due') {
        matchesView = hasBalance;
      } else if (viewFilter === 'paid') {
        matchesView = inv.status === 'paid';
      }

      return matchesSearch && matchesView;
    });
  }, [invoices, searchQuery, viewFilter]);

  if (loading) {
    return <LoadingSpinner message="Calculating fee invoices and member balances..." size="lg" />;
  }

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fee Management & Invoicing</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Transparent student fee collections, installment tracking, dues recovery, and official receipts
          </p>
        </div>

        {/* Batch Invoice Generator Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="month"
              value={selectedMonth.slice(0, 7)}
              onChange={(e) => setSelectedMonth(`${e.target.value}-01`)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-0 focus:ring-0 cursor-pointer"
            />
          </div>

          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateInvoices}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            <Receipt className="w-4 h-4" />
            {isGenerating ? 'Generating...' : `Generate Invoices for ${formatMonth(selectedMonth)}`}
          </button>
        </div>
      </div>

      {batchNotice && (
        <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 flex items-center justify-between text-xs">
          <span>{batchNotice}</span>
          <button
            type="button"
            onClick={() => setBatchNotice(null)}
            className="text-indigo-400 hover:text-indigo-600 ml-4 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Billed */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            TOTAL BILLED
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            {formatINR(totalBilled)}
          </p>
          <span className="text-xs text-slate-400 mt-1">
            {invoices.length} total issued invoices
          </span>
        </div>

        {/* Collections */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
            FEE COLLECTIONS
          </span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
            {formatINR(totalCollected)}
          </p>
          <span className="text-xs text-slate-400 mt-1">
            Total verified payments received
          </span>
        </div>

        {/* Outstanding Recovery */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              OUTSTANDING BALANCE
            </span>
            {totalOutstanding > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold animate-pulse">
                Action Required
              </span>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-600 mt-2">
            {formatINR(totalOutstanding)}
          </p>
          <span className="text-xs text-slate-400 mt-1">
            {dueInvoicesCount} students with pending dues
          </span>
        </div>
      </div>

      {/* Due Amount Recovery Callout Banner */}
      {dueInvoicesCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 shadow-xs">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {dueInvoicesCount} student{dueInvoicesCount > 1 ? 's' : ''} have unpaid fees totaling {formatINR(totalOutstanding)}.
              </p>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Every member's exact due amount, contact details, and assigned shift are tracked below without ambiguity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyDueList}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100/50 shadow-2xs transition-colors shrink-0"
            >
              {copiedDueList ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-700" />}
              <span>{copiedDueList ? 'Copied WhatsApp Dues List!' : 'Copy Defaulters List'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters and View Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, roll code, or phone..."
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-600 focus:outline-hidden bg-slate-50/50"
          />
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs w-full md:w-auto">
          <button
            type="button"
            onClick={() => setViewFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              viewFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Invoices ({invoices.length})
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('due')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              viewFilter === 'due'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-amber-700 hover:bg-amber-50'
            }`}
          >
            <span>⚠️ Due Amount ({dueInvoicesCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setViewFilter('paid')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
              viewFilter === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <span>✅ Fully Paid ({settledInvoicesCount})</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No Invoices Found"
          description="No fee records match the selected filter. Try clearing the search or generating invoices for the current billing month."
          actionLabel={`Generate for ${formatMonth(selectedMonth)}`}
          onAction={handleGenerateInvoices}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Student Member</th>
                  <th className="px-5 py-3.5">Billing Month</th>
                  <th className="px-5 py-3.5">Total Fee</th>
                  <th className="px-5 py-3.5">Paid So Far</th>
                  <th className="px-5 py-3.5">Remaining Due</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => {
                  const isExpanded = expandedInvoiceId === inv.id;
                  const isPaid = inv.status === 'paid';
                  const remainingDue = inv.balance_remaining ?? inv.amount_due;
                  const paymentsCount = inv.payments?.length || 0;
                  const student = inv.student;

                  const initials = student?.full_name
                    ? student.full_name
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()
                    : 'ST';

                  return (
                    <React.Fragment key={inv.id}>
                      <tr className="hover:bg-slate-50/70 transition-colors">
                        {/* Student Details (Eliminates Identity Blindness) */}
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => toggleExpand(inv.id)}
                              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100"
                              title="Toggle payment history"
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>

                            <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {initials}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                  {student?.full_name || 'Registered Member'}
                                </span>
                                <span className="font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {student?.student_code || 'STU-ID'}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                                {student?.contact_number && (
                                  <span className="inline-flex items-center gap-1">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    {student.contact_number}
                                  </span>
                                )}
                                {student?.shift?.name && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-600 font-medium">
                                      {student.shift.name}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Billing Month */}
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-700">
                          {formatMonth(inv.billing_month)}
                        </td>

                        {/* Amount Due */}
                        <td className="px-5 py-3.5 font-bold text-slate-900">
                          {formatINR(inv.amount_due)}
                        </td>

                        {/* Paid So Far */}
                        <td className="px-5 py-3.5 font-semibold text-emerald-600">
                          {formatINR(inv.total_paid || 0)}
                        </td>

                        {/* Remaining Due */}
                        <td className="px-5 py-3.5 font-extrabold">
                          <span className={remainingDue > 0 ? 'text-amber-600 text-sm' : 'text-slate-700'}>
                            {formatINR(remainingDue)}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-5 py-3.5">
                          <Badge
                            variant={
                              inv.status === 'paid'
                                ? 'success'
                                : inv.status === 'partial'
                                ? 'warning'
                                : 'danger'
                            }
                            size="sm"
                          >
                            {inv.status === 'paid' ? 'Fully Settled' : inv.status === 'partial' ? 'Partial Due' : 'Unpaid Due'}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {paymentsCount > 0 && (
                              <button
                                type="button"
                                onClick={() => handleOpenReceipt(inv, inv.payments![inv.payments!.length - 1])}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                                title="View latest payment receipt"
                              >
                                <Printer className="w-3.5 h-3.5 text-slate-500" />
                                <span className="hidden sm:inline">Receipt</span>
                              </button>
                            )}

                            <button
                              type="button"
                              disabled={isPaid}
                              onClick={() => handleOpenPayment(inv)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                isPaid
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                              }`}
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              {isPaid ? 'Settled' : 'Record Payment'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Payment History Accordion */}
                      {isExpanded && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={7} className="px-8 py-4">
                            <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-2xs">
                              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                                  <span>Payment Installment Ledger</span>
                                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px]">
                                    {paymentsCount} transaction{paymentsCount !== 1 ? 's' : ''}
                                  </span>
                                </h4>
                                {student?.contact_number && (
                                  <span className="text-xs text-slate-500">
                                    Student Contact: <strong>+91 {student.contact_number}</strong>
                                  </span>
                                )}
                              </div>

                              {paymentsCount === 0 ? (
                                <p className="text-xs text-slate-400 italic py-2">
                                  No payment installments have been received for this invoice yet. Total outstanding balance is {formatINR(inv.amount_due)}.
                                </p>
                              ) : (
                                <div className="space-y-2">
                                  {inv.payments?.map((pay, idx) => (
                                    <div
                                      key={pay.id}
                                      className="flex flex-col sm:flex-row sm:items-center justify-between text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-100 gap-2"
                                    >
                                      <div className="flex items-center gap-3">
                                        <span className="font-bold text-emerald-600 text-sm">
                                          +{formatINR(pay.amount_paid)}
                                        </span>
                                        <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 shadow-2xs">
                                          {pay.payment_method}
                                        </span>
                                        {pay.reference_number && (
                                          <span className="font-mono text-slate-600 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                                            Ref: {pay.reference_number}
                                          </span>
                                        )}
                                        {pay.notes && (
                                          <span className="text-slate-500 italic text-[11px]">
                                            "{pay.notes}"
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-3">
                                        <span className="text-slate-500 text-[11px]">
                                          {formatDate(pay.payment_date)}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenReceipt(inv, pay)}
                                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-indigo-700 font-semibold hover:bg-indigo-50 transition-colors shadow-2xs"
                                        >
                                          <Printer className="w-3 h-3" />
                                          <span>Print Receipt #{idx + 1}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
            <span>Showing {filteredInvoices.length} invoices ({dueInvoicesCount} with pending dues, {settledInvoicesCount} settled)</span>
            <span>Composite key constraint enforces strictly 1 invoice per student per month</span>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        invoice={selectedInvoice}
      />

      {/* Official Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        invoice={receiptInvoice}
        payment={receiptPayment}
      />
    </div>
  );
};
