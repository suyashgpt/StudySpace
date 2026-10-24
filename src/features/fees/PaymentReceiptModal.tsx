import React from 'react';
import { Modal } from '../../components/Modal';
import type { FeeInvoice, FeePayment } from '../../types/database';
import { formatINR, formatDate, formatMonth } from '../../lib/formatters';
import { Printer, Share2, CheckCircle2, ShieldCheck, BookMarked, Phone, Calendar } from 'lucide-react';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice | null;
  payment: FeePayment | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  payment,
}) => {
  if (!isOpen || !invoice || !payment) return null;

  const student = invoice.student;
  const receiptNo = `SS-REC-${payment.id.replace(/\D/g, '').slice(-6) || Math.floor(100000 + Math.random() * 900000)}`;
  const remainingAfterPayment = invoice.balance_remaining ?? 0;
  const isFullySettled = remainingAfterPayment <= 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    if (!student?.contact_number) return;
    const msg = `Hello ${student.full_name}, here is your payment acknowledgment for StudySpace Reading Room:\nReceipt No: ${receiptNo}\nMonth: ${formatMonth(invoice.billing_month)}\nAmount Paid: ${formatINR(payment.amount_paid)}\nPayment Mode: ${payment.payment_method.toUpperCase()}${payment.reference_number ? ` (Ref: ${payment.reference_number})` : ''}\nRemaining Balance: ${formatINR(remainingAfterPayment)}\nThank you for studying at StudySpace!`;
    const cleanPhone = student.contact_number.replace(/\D/g, '');
    const url = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Payment Receipt"
      description={`Receipt No: ${receiptNo} • Issued to ${student?.full_name || 'Student'}`}
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Printable Receipt Container */}
        <div id="printable-receipt" className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs text-left relative overflow-hidden">
          {/* Top Banner Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-emerald-500" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <BookMarked className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  StudySpace Reading Room & Library
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Main Sanctuary Campus • Quiet Operations
                </p>
                <p className="text-[11px] font-mono text-indigo-700 font-semibold mt-0.5">
                  Receipt No: {receiptNo}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                isFullySettled
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{isFullySettled ? 'PAID IN FULL' : 'PARTIAL SETTLEMENT'}</span>
              </span>
              <p className="text-[11px] text-slate-400 mt-1.5">
                Issue Date: {formatDate(payment.payment_date)}
              </p>
            </div>
          </div>

          {/* Student & Shift Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-slate-100 text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                STUDENT & MEMBER DETAILS
              </span>
              <p className="font-bold text-slate-900 text-sm">{student?.full_name || 'Member'}</p>
              <div className="flex items-center gap-2 mt-1 text-slate-600">
                <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 font-bold">
                  {student?.student_code || 'STU-100'}
                </span>
                {student?.contact_number && (
                  <span className="inline-flex items-center gap-1 text-slate-500">
                    <Phone className="w-3 h-3 text-slate-400" />
                    +91 {student.contact_number}
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                ASSIGNED SHIFT & BILLING
              </span>
              <p className="font-bold text-slate-800">
                {student?.shift?.name || 'Standard Reading Room Shift'}
              </p>
              <p className="text-slate-500 mt-0.5 inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                Billing Month: <strong className="text-slate-700 font-semibold">{formatMonth(invoice.billing_month)}</strong>
              </p>
            </div>
          </div>

          {/* Payment Particulars Table */}
          <div className="py-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              TRANSACTION PARTICULARS
            </span>
            <div className="rounded-xl border border-slate-200 overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-3.5 py-2">Description</th>
                    <th className="px-3.5 py-2">Payment Mode</th>
                    <th className="px-3.5 py-2">Ref / UTR No.</th>
                    <th className="px-3.5 py-2 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      Monthly Membership Fee ({formatMonth(invoice.billing_month)})
                    </td>
                    <td className="px-3.5 py-2.5 uppercase font-semibold text-slate-700">
                      {payment.payment_method}
                    </td>
                    <td className="px-3.5 py-2.5 font-mono text-slate-600">
                      {payment.reference_number || 'N/A (Cash Settlement)'}
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-emerald-600 text-sm">
                      {formatINR(payment.amount_paid)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Ledger Summary */}
          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-500">Invoice Total Due:</span>
              <span className="font-bold text-slate-800 ml-1.5">{formatINR(invoice.amount_due)}</span>
            </div>
            <div>
              <span className="text-slate-500">Total Paid So Far:</span>
              <span className="font-bold text-emerald-600 ml-1.5">{formatINR(invoice.total_paid || payment.amount_paid)}</span>
            </div>
            <div className="sm:border-l sm:border-slate-200 sm:pl-3">
              <span className="text-slate-600 font-semibold">Remaining Balance:</span>
              <span className={`font-bold ml-1.5 ${remainingAfterPayment > 0 ? 'text-amber-600 text-sm' : 'text-slate-800'}`}>
                {formatINR(remainingAfterPayment)}
              </span>
            </div>
          </div>

          {/* Notes if any */}
          {payment.notes && (
            <p className="text-[11px] text-slate-500 italic mt-3">
              Note: {payment.notes}
            </p>
          )}

          {/* Footer Validation */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified System Generated Receipt • MCA Academic Audit Proof</span>
            </div>
            <div className="text-right">
              <span>Authorized Desk: <strong>Chamber Concierge</strong></span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {student?.contact_number && (
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Share Receipt via WhatsApp</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
