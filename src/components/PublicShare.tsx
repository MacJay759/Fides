/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useMemo } from 'react';
import { Download, Check, Printer, FileText, Globe } from 'lucide-react';
import { Invoice } from '../types';
import { getInvoiceByShareToken, saveInvoice } from '../store';
import InvoiceTemplateRenderer from './InvoiceTemplates';
import { formatCurrencyValue, formatFriendlyDate } from '../utils';

interface PublicShareProps {
  token: string;
  onClosePublicView?: () => void;
}

export default function PublicShare({ token, onClosePublicView }: PublicShareProps) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Resolve token representation
    const inv = getInvoiceByShareToken(token);
    if (inv) {
      setInvoice(inv);
      
      // Automatic tracking Viewed status state progression on initial page loads
      if (inv.status === 'sent') {
        const updated: Invoice = {
          ...inv,
          status: 'viewed',
          viewedAt: inv.viewedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        saveInvoice(updated);
        setInvoice(updated);
      }
    }
    setLoading(false);
  }, [token]);

  // Handle native high-def printing triggers
  const handleClientPrintTrigger = () => {
    if (!invoice) return;
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-neutral-400 font-medium">Rerouting portal folders...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-3">
          <FileText size={20} />
        </div>
        <h2 className="text-sm font-bold text-neutral-800">Invoice directory not found</h2>
        <p className="text-[11px] text-neutral-400 mt-1 max-w-xs">
          The unique sharing token is invalid or the corresponding document was deleted by the owner.
        </p>
        {onClosePublicView && (
          <button
            onClick={onClosePublicView}
            className="mt-6 text-xs text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
          >
            ← Exit Client Portal
          </button>
        )}
      </div>
    );
  }

  const isPaid = invoice.status === 'paid' || invoice.status === 'partially_paid';

  return (
    <div className="min-h-screen bg-[#F7F7F7] dark:bg-[#0A0A0A] flex flex-col items-center p-4 sm:p-8 font-sans select-none overflow-y-auto">
      
      {/* Top sticky portal action bar */}
      <div className="w-full max-w-[794px] bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] p-3.5 rounded-xl mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center text-white text-xs font-bold">
            F
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary">Fides Client Portal</span>
            <span className="text-[9px] text-[#6B6B6B] dark:text-[#888888] font-mono leading-none mt-0.5 uppercase tracking-wide">
              Document type: {invoice.invoiceType}
            </span>
          </div>
        </div>

        {/* Action triggers */}
        <div className="flex items-center gap-3">
          
          {/* Dynamic Status badge */}
          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${
            isPaid 
              ? 'bg-emerald-50 text-emerald-500 border-emerald-100 dark:bg-emerald-950/20' 
              : 'bg-orange-50 text-orange-500 border-orange-100 dark:bg-orange-950/10'
          }`}>
            {invoice.status === 'paid' ? 'Paid in Full' : invoice.status === 'viewed' || invoice.status === 'sent' ? 'Awaiting Payment' : invoice.status}
          </span>

          <button
            onClick={handleClientPrintTrigger}
            className="h-8 px-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white dark:bg-[#F5F5F5] dark:text-[#0A0A0A] text-xs font-semibold rounded-md flex items-center gap-1.5 cursor-pointer transition-fides select-none"
          >
            <Printer size={12} />
            <span>Download Invoice PDF / Print</span>
          </button>

          {onClosePublicView && (
            <button
              onClick={onClosePublicView}
              className="text-xs text-[#6B6B6B] dark:text-[#888888] hover:text-[#0A0A0A] font-medium cursor-pointer"
            >
              Exit Portal
            </button>
          )}
        </div>
      </div>

      {/* Main A4 sheet rendered strictly isolated */}
      <div className="w-full max-w-[794px] border border-neutral-200 shadow-none scroll-smooth">
        <InvoiceTemplateRenderer data={invoice} isReceipt={invoice.status === 'paid'} />
      </div>

      {/* Footer support credits */}
      <div className="mt-8 text-[10px] text-neutral-400 font-mono text-center pb-8">
        Billing managed securely via Fides • Secure Ledger Token encryption
      </div>

    </div>
  );
}
