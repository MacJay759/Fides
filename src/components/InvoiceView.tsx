/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Send, 
  Download, 
  Check, 
  RefreshCw, 
  Mail, 
  Link, 
  Eye, 
  Trash2, 
  Calendar,
  CreditCard,
  Printer,
  FileText
} from 'lucide-react';
import { Invoice, Receipt, PaymentRecord, InvoiceStatus } from '../types';
import { saveInvoice, saveReceipt, getReceipts, deleteInvoice } from '../store';
import { formatCurrencyValue, formatDate, formatFriendlyDate, generateId } from '../utils';
import InvoiceTemplateRenderer from './InvoiceTemplates';

interface InvoiceViewProps {
  userId: string;
  invoice: Invoice;
  onBackToDashboard: () => void;
  onEditInvoice: (invoice: Invoice) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function InvoiceView({
  userId,
  invoice: initialInvoice,
  onBackToDashboard,
  onEditInvoice,
  addToast
}: InvoiceViewProps) {
  const [invoice, setInvoice] = useState<Invoice>(initialInvoice);

  // Modal Triggers
  const [showSendModal, setShowSendModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptOverlay, setShowReceiptOverlay] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Payment Form States
  const [paymentMethod, setPaymentMethod] = useState(invoice.paymentMethod || 'Bank Transfer');
  const [paymentAmount, setPaymentAmount] = useState<number>(invoice.balanceDue);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split('T')[0]);

  // Generated results refs
  const [lastReceiptId, setLastReceiptId] = useState<string | null>(null);

  // Derived receipts
  const receiptsList = useMemo(() => {
    return getReceipts(userId).filter(rec => rec.invoiceId === invoice.id);
  }, [userId, invoice.id, lastReceiptId]);

  // Unique share token simulated url pathing
  const publicShareUrl = useMemo(() => {
    return `${window.location.origin}/invoice-share.html?token=${invoice.shareToken}`;
  }, [invoice.shareToken]);

  // Handle Mark as manually sent (Draft -> Sent)
  const handleMarkAsSent = () => {
    const updated: Invoice = {
      ...invoice,
      status: invoice.status === 'draft' ? 'sent' : invoice.status,
      sentAt: invoice.sentAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    saveInvoice(updated);
    setInvoice(updated);
    addToast(`Invoice ${invoice.number} marked as shared with customer.`, 'success');
    setShowSendModal(false);
  };

  // Copy share path representation
  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicShareUrl);
    addToast('Unique shareable customer URL copied to clipboard!', 'success');
  };

  // Email Mailto composing launcher
  const handleEmailComposing = () => {
    const subject = `Invoice ${invoice.number} from ${invoice.from.name} — ${invoice.currency} ${invoice.total} due ${invoice.dueDate}`;
    const bodyText = `Hi ${invoice.client.name},

Please find your outstanding invoice attached via the direct link below.

View Live Invoice here:
${publicShareUrl}

Outstanding Amount Due: ${formatCurrencyValue(invoice.total, invoice.currency)}
Due Limit Date: ${formatFriendlyDate(invoice.dueDate)}

To easily export a secure PDF copy, please open the link above and click "Download PDF."

Best Regards,
${invoice.from.name}
${invoice.from.email}`;

    const mailtoUrl = `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
    window.open(mailtoUrl, '_blank');
    addToast('Default email client triggered.', 'info');
  };

  // Handle Recording Payment and generating core stamped Receipt folders
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0 || paymentAmount > invoice.balanceDue) {
      addToast(`Payment sum must fall between specified limits. Outstanding: ${invoice.balanceDue}`, 'warning');
      return;
    }

    const payId = generateId('pay');
    const recId = generateId('rec');

    const newPaymentRecord: PaymentRecord = {
      id: payId,
      amount: paymentAmount,
      method: paymentMethod,
      reference: paymentReference || 'MANUAL-REF-STAMP',
      date: new Date(paymentDate).toISOString(),
      receiptId: recId
    };

    const newAmountPaid = invoice.amountPaid + paymentAmount;
    const newBalance = invoice.total - newAmountPaid;
    const finalStatus: InvoiceStatus = newBalance <= 0 ? 'paid' : 'partially_paid';

    // Construct unified corresponding stamped Receipt
    const newReceipt: Receipt = {
      id: recId,
      userId: userId,
      invoiceId: invoice.id,
      number: `REC-${invoice.number.replace(/^[A-Z]+-/, '')}`,
      receiptDate: new Date(paymentDate).toISOString(),
      paymentMethod: paymentMethod,
      paymentReference: paymentReference || 'MANUAL-REF-STAMP',
      amountPaid: paymentAmount,
      currency: invoice.currency,
      template: invoice.template,
      brandColor: invoice.brandColor,
      client: invoice.client,
      from: invoice.from,
      items: invoice.items,
      subtotal: invoice.subtotal,
      taxTotal: invoice.taxTotal,
      discount: invoice.discount,
      total: invoice.total,
      notes: invoice.notes,
      createdAt: new Date().toISOString()
    };

    const updatedInvoice: Invoice = {
      ...invoice,
      status: finalStatus,
      paidAt: finalStatus === 'paid' ? new Date().toISOString() : null,
      payments: [...invoice.payments, newPaymentRecord],
      amountPaid: newAmountPaid,
      balanceDue: newBalance,
      receiptIds: [...invoice.receiptIds, recId],
      updatedAt: new Date().toISOString()
    };

    saveReceipt(newReceipt);
    saveInvoice(updatedInvoice);
    setInvoice(updatedInvoice);
    setLastReceiptId(recId);

    setShowPaymentModal(false);
    setShowReceiptOverlay(true); // Launches full celebratory check overlay!
    addToast('Payment recorded successfully.', 'success');
  };

  // Triggering native OS printing (Highly vectorized pristine PDF exports)
  const handleNativePrint = () => {
    // Inject Target element for printing stylesheet mapping
    const printContainer = document.createElement('div');
    printContainer.id = 'print-target-node';
    document.body.appendChild(printContainer);

    // Render corresponding document clone
    const root = document.createElement('div');
    printContainer.appendChild(root);

    // Render layout using existing templates
    import('react-dom/client').then(({ createRoot }) => {
      const r = createRoot(root);
      r.render(
        <div className="invoice-document flex items-center justify-center p-12 bg-white">
          <InvoiceTemplateRenderer data={invoice} isReceipt={invoice.status === 'paid'} />
        </div>
      );
      
      // Delay briefly to allow rendering paint to finalize
      setTimeout(() => {
        window.print();
        document.body.removeChild(printContainer);
      }, 150);
    });
  };

  // Safe Invoice deleting handler
  const handleDeleteInvoiceSubmit = () => {
    deleteInvoice(invoice.id);
    addToast(`Invoice ${invoice.number} directory deleted.`, 'info');
    onBackToDashboard();
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 select-none relative font-sans text-left">
      
      {/* Banner / Header details */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToDashboard}
            className="p-1.5 sm:p-1 text-[#6B6B6B] dark:text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5] bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md transition-fides cursor-pointer h-9 w-9 sm:h-8 sm:w-8 flex items-center justify-center flex-shrink-0"
          >
            <ArrowLeft size={16} className="sm:hidden" />
            <ArrowLeft size={14} className="hidden sm:block" />
          </button>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2 min-w-0 overflow-x-auto">
              <span className="text-xs text-[#9B9B9B] dark:text-[#555555] whitespace-nowrap">Invoices</span>
              <span className="text-xs text-neutral-300">/</span>
              <span className="text-xs font-semibold text-primary truncate">
                {invoice.number}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-neutral-950 dark:text-white leading-tight">
                Invoice overview
              </h1>
              
              {/* Dynamic Status Badges */}
              <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-tight rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-950/40 select-none lowercase text-center text-body flex-shrink-0`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>

        {/* Action Panel items */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto">
          {invoice.status === 'draft' && (
            <button
              onClick={() => onEditInvoice(invoice)}
              className="h-9 sm:h-8 px-2.5 sm:px-3.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#1E1E1E] text-primary text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer text-center flex-1 sm:flex-none justify-center"
            >
              <span className="hidden sm:inline">Edit</span>
              <span className="sm:hidden">Edit invoice</span>
            </button>
          )}

          <button
            onClick={() => setShowSendModal(true)}
            className="h-9 sm:h-8 px-2.5 sm:px-3.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#1E1E1E] text-primary text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer text-center flex-1 sm:flex-none justify-center"
          >
            <Send size={14} className="sm:hidden" />
            <Send size={12} className="hidden sm:block" />
            <span className="hidden sm:inline">Share</span>
            <span className="sm:hidden">Send</span>
          </button>

          {invoice.status !== 'paid' && invoice.status !== 'void' && (
            <button
              onClick={() => setShowPaymentModal(true)}
              className="h-9 sm:h-8 px-2.5 sm:px-4 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer shadow-hidden text-center flex-1 sm:flex-none justify-center"
            >
              <CreditCard size={14} className="sm:hidden" />
              <CreditCard size={12} className="hidden sm:block" />
              <span className="hidden sm:inline">Pay</span>
              <span className="sm:hidden">Payment</span>
            </button>
          )}

          <button
            onClick={handleNativePrint}
            className="h-9 sm:h-8 px-2.5 sm:px-3.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#1E1E1E] text-primary text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer text-center flex-1 sm:flex-none justify-center"
          >
            <Printer size={14} className="sm:hidden" />
            <Printer size={12} className="hidden sm:block" />
            <span className="hidden sm:inline">Print</span>
            <span className="sm:hidden">Print/PDF</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="h-9 sm:h-8 px-2 sm:px-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 border border-transparent rounded-md transition-fides flex items-center gap-1.5 cursor-pointer"
            title="Delete invoice"
          >
            <Trash2 size={14} className="sm:hidden" />
            <Trash2 size={13} className="hidden sm:block" />
          </button>
        </div>
      </header>

      {/* Main Details Grid splits Preview Document & Activity Panel */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Document Render view area (Left Span) */}
        <div className="lg:col-span-2 flex flex-col items-center bg-neutral-50/50 dark:bg-[#070707]/30 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-3 sm:p-6 lg:p-8 overflow-x-auto min-h-[500px] sm:min-h-[600px] lg:min-h-[920px]">
          <div className="w-full max-w-[794px] border border-neutral-100 dark:border-neutral-900 rounded-md shadow-none flex items-center justify-center overflow-hidden">
            <InvoiceTemplateRenderer data={invoice} isReceipt={invoice.status === 'paid'} />
          </div>
        </div>

        {/* Aside Panel: Transaction Log details / Receipts links */}
        <div className="flex flex-col gap-6">
          
          {/* Metadata quick highlights */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Ledger Metrics
            </span>

            <div className="flex flex-col gap-3 font-sans text-xs">
              <div className="flex justify-between py-1 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                <span className="text-[#9B9B9B]">Total Ledger Amount</span>
                <span className="font-mono font-bold text-primary">{formatCurrencyValue(invoice.total, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                <span className="text-[#9B9B9B]">Settled Amount</span>
                <span className="font-mono font-semibold text-emerald-500">+{formatCurrencyValue(invoice.amountPaid, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                <span className="text-[#9B9B9B]">Balance Due</span>
                <span className={`font-mono font-bold ${invoice.balanceDue > 0 ? 'text-red-500' : 'text-neutral-400'}`}>
                  {formatCurrencyValue(invoice.balanceDue, invoice.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Connected Receipts Area */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Linked Payment Receipts
            </span>

            <div className="flex flex-col gap-2">
              {receiptsList.map((rec) => (
                <div 
                  key={rec.id}
                  className="p-3 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg bg-[#F7F7F7]/50 dark:bg-[#070707]/30 flex flex-col gap-1 text-xs justify-between"
                >
                  <div className="flex justify-between items-center font-mono">
                    <span className="font-semibold text-primary">{rec.number}</span>
                    <span className="font-bold text-emerald-500">+{formatCurrencyValue(rec.amountPaid, rec.currency)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-[10px] text-[#6B6B6B] dark:text-[#888888] font-sans">
                    <span>Clearing: {rec.paymentMethod}</span>
                    <span>{formatFriendlyDate(rec.receiptDate)}</span>
                  </div>
                </div>
              ))}

              {receiptsList.length === 0 && (
                <div className="p-6 text-center text-xs text-neutral-400 select-none">
                  No payment receipts linked for this directory balance.
                </div>
              )}
            </div>
          </div>

          {/* Activity Logs details */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Activity History Log
            </span>

            <div className="flex flex-col gap-4 relative pl-3 border-l border-[#EBEBEB] dark:border-[#1E1E1E] ml-1.5 text-xs text-[#6B6B6B] dark:text-[#888888]">
              <div className="flex flex-col gap-0.5 relative pt-1">
                <span className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white dark:border-[#111111]" />
                <span className="font-semibold text-primary">Compiler Folder initialized</span>
                <span>Created as Draft on {formatFriendlyDate(invoice.createdAt)}</span>
              </div>

              {invoice.sentAt && (
                <div className="flex flex-col gap-0.5 relative pt-1">
                  <span className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-orange-400 border-2 border-white dark:border-[#111111]" />
                  <span className="font-semibold text-primary">Marked Shared & Sent</span>
                  <span>Sent using link tracking index</span>
                </div>
              )}

              {invoice.viewedAt && (
                <div className="flex flex-col gap-0.5 relative pt-1">
                  <span className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white dark:border-[#111111]" />
                  <span className="font-semibold text-primary">Opened by customer (viewed)</span>
                  <span>Indexed at the portal link</span>
                </div>
              )}

              {invoice.status === 'paid' && (
                <div className="flex flex-col gap-0.5 relative pt-1">
                  <span className="absolute left-[-17px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#111111]" />
                  <span className="font-semibold text-primary">Settled Paid In Full</span>
                  <span>Cleared and catalog receipts linked</span>
                </div>
              )}
            </div>
          </div>

        </div>

      </section>

      {/* MODAL 1: Recording Clearing Payments */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/85 pointer-events-all"
            />
            
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-6 pointer-events-all z-10 flex flex-col gap-4"
            >
              <div className="pb-3 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                <h3 className="text-sm font-semibold text-primary">Record Payment Clearance</h3>
                <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888] mt-0.5">Define amount received and swift indicators.</p>
              </div>

              <form onSubmit={handleRecordPaymentSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-secondary label">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="h-8 px-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                  >
                    <option value="Bank Transfer">Bank Transfer / Swift</option>
                    <option value="Cash Clearing">Cash clearing</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Mobile Money">Mobile Money (M-Pesa/Flutterwave)</option>
                    <option value="Crypto Address">Crypto</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Amount Clear ({invoice.currency})</label>
                    <input
                      type="number"
                      required
                      min="0.01"
                      max={invoice.balanceDue}
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Math.max(0, Number(e.target.value)))}
                      className="h-8 px-3 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono text-primary"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Payment Date</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="h-8 px-2 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono text-primary"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-secondary label">Swift Reference/ Transaction ID</label>
                  <input
                    type="text"
                    value={paymentReference}
                    onChange={(e) => setPaymentReference(e.target.value)}
                    placeholder="e.g. TXN-2938102381"
                    className="h-8 px-3 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono text-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-8 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded cursor-pointer transition-fides select-none mt-2 flex items-center justify-center gap-1 shadow-none"
                >
                  <Check size={12} />
                  <span>Settle ledger balance</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Share and Send */}
      <AnimatePresence>
        {showSendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendModal(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/85 pointer-events-all"
            />
            
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-6 pointer-events-all z-10 flex flex-col gap-4 text-xs"
            >
              <div className="pb-3 border-b border-[#EBEBEB] dark:border-[#1E1E1E] flex justify-between items-center">
                <h3 className="text-sm font-semibold text-primary">Share Outstanding Invoice</h3>
                <button onClick={() => setShowSendModal(false)} className="text-[#9B9B9B] hover:text-red-400 select-none cursor-pointer">Close</button>
              </div>

              {/* URL sharing */}
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] label">Unique Customer Link (Tracking active)</span>
                <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md overflow-hidden relative">
                  <span className="truncate font-mono text-[9px] text-[#6B6B6B] dark:text-[#888888] w-52">{publicShareUrl}</span>
                  <button
                    onClick={handleCopyLink}
                    className="absolute right-2 p-1 bg-white dark:bg-[#1E1E1E] border border-[#EBEBEB] dark:border-neutral-800 rounded text-primary hover:text-orange-500 cursor-pointer"
                    title="Copy Link Map"
                  >
                    <Link size={12} />
                  </button>
                </div>
              </div>

              {/* Email Email compose mailto */}
              <div className="flex flex-col gap-2 pt-2 border-t border-[#EBEBEB] dark:border-[#1E1E1E]">
                <span className="font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] label">Send Email Notification Reminders</span>
                
                <button
                  onClick={handleEmailComposing}
                  className="w-full h-8 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#1E1E1E] text-primary text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer select-none font-sans"
                >
                  <Mail size={12} />
                  <span>Compose and Send Email Invoice</span>
                </button>
              </div>

              {/* Manual Sentinel */}
              <button
                onClick={handleMarkAsSent}
                className="w-full h-8 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded text-xs select-none flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Check size={12} />
                <span>Mark shared manual SENT</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CELEBRATORY CHECK OVERLAY: Payment Registered & Receipt Prompt */}
      <AnimatePresence>
        {showReceiptOverlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white dark:bg-[#0A0A0A] select-none text-center">
            
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="max-w-md w-full p-8 flex flex-col items-center gap-6"
            >
              {/* Elegant checkmark drawn loop animation */}
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center border border-emerald-100 dark:border-emerald-950/40 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                >
                  <Check size={32} />
                </motion.div>
              </div>

              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
                  Payment successfully cataloged
                </h2>
                <p className="text-xs text-secondary leading-relaxed max-w-xs self-center">
                  The outstanding ledger balance for #{invoice.number} has been settled.
                </p>
              </div>

              {/* Primary conversion options */}
              <div className="flex flex-col gap-2.5 w-full">
                <button
                  onClick={() => {
                    setShowReceiptOverlay(false);
                    addToast('Converting folder data to Receipts completed.', 'success');
                  }}
                  className="w-full h-9 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-md text-xs cursor-pointer select-none flex items-center justify-center gap-1 shadow-none"
                >
                  <span>Build Digital Stamped Receipt PDF</span>
                </button>
                <button
                  onClick={() => setShowReceiptOverlay(false)}
                  className="w-full h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1E1E1E] dark:hover:bg-[#2E2E2E] text-primary font-semibold text-xs border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md cursor-pointer select-none"
                >
                  Back to bills folder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE DIALOG CONFIRM */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute inset-0 bg-[#0A0A0A]/40 dark:bg-black/80 pointer-events-all"
            />
            
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="relative w-full max-w-xs bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 pointer-events-all z-10 flex flex-col gap-4 text-xs"
            >
              <h3 className="text-sm font-semibold text-red-500 flex items-center gap-1">
                <Check size={14} />
                <span>Delete folder directory?</span>
              </h3>
              <p className="text-secondary leading-relaxed">
                This action breaks numbering sequence files and cannot be restored.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <button onClick={() => setShowDeleteConfirm(false)} className="h-8 px-3.5 bg-neutral-50 dark:bg-neutral-900 text-secondary rounded cursor-pointer select-none">Cancel</button>
                <button onClick={handleDeleteInvoiceSubmit} className="h-8 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded cursor-pointer select-none">Confirm Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
