/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Receipt as ReceiptIcon, 
  Search, 
  Sparkles, 
  CheckCircle, 
  ArrowUpRight, 
  Calendar, 
  CreditCard, 
  Download, 
  Printer, 
  X,
  FileText,
  ChevronRight,
  BookmarkCheck,
  Building2
} from 'lucide-react';
import { Receipt, Client } from '../types';
import { formatCurrencyValue, formatDate, formatFriendlyDate } from '../utils';

interface ReceiptListProps {
  userId: string;
  receipts: Receipt[];
  onSelectReceipt: (rId: string) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ReceiptList({
  userId,
  receipts,
  onSelectReceipt,
  addToast
}: ReceiptListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null);

  const currencyCode = useMemo(() => {
    return receipts.length > 0 ? receipts[0].currency : 'USD';
  }, [receipts]);

  // Overall metric totals specifically for receipts
  const metrics = useMemo(() => {
    const totalCleared = receipts.reduce((sum, rec) => sum + (rec.amountPaid || 0), 0);
    const methodCounts: Record<string, number> = {};
    
    receipts.forEach(r => {
      const m = r.paymentMethod || 'Bank Transfer';
      methodCounts[m] = (methodCounts[m] || 0) + 1;
    });

    const primaryMethod = Object.entries(methodCounts).sort((a,b) => b[1] - a[1])[0]?.[0] || 'Bank Transfer';

    return {
      totalCleared,
      totalCount: receipts.length,
      primaryMethod
    };
  }, [receipts]);

  // Search filtered list
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) return receipts;
    const q = searchQuery.toLowerCase().trim();
    return receipts.filter(rec => 
      rec.number.toLowerCase().includes(q) ||
      rec.client.name.toLowerCase().includes(q) ||
      rec.client.email.toLowerCase().includes(q) ||
      (rec.paymentReference && rec.paymentReference.toLowerCase().includes(q)) ||
      rec.paymentMethod.toLowerCase().includes(q)
    );
  }, [receipts, searchQuery]);

  const handleTriggerPrint = (r: Receipt) => {
    // Elegant system print triggers
    addToast('Preparing client print engine...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans text-left">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent pb-1">
        <div className="font-sans">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
            Receipts
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#888888] mt-1 font-medium">
            View, print, and download payment receipts for your records.
          </p>
        </div>
      </div>

      {/* 2. Custom Metrics Panel */}
      <section className="grid grid-cols-1 md:grid-cols-3 border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-[12px] bg-white dark:bg-[#0A0A0A] overflow-hidden divide-y md:divide-y-0 md:divide-x divide-[#EBEBEB] dark:divide-[#1F1F1F]">
        
        {/* Total Received */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Total Received
            </span>
            <div className="p-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/15 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-semibold text-emerald-600 dark:text-[#10B981] tracking-tight leading-none">
              {formatCurrencyValue(metrics.totalCleared, currencyCode)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Payments successfully recorded
            </p>
          </div>
        </div>

        {/* Total Receipts */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Total Receipts
            </span>
            <div className="p-1.5 rounded-lg border border-neutral-200/35 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#111111]/45 text-[#555555] dark:text-[#888888] flex items-center justify-center">
              <ReceiptIcon size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {metrics.totalCount}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Receipts generated for cleared payments
            </p>
          </div>
        </div>

        {/* Top Payment Method */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Top Payment Method
            </span>
            <div className="p-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center">
              <CreditCard size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none uppercase truncate block">
              {metrics.primaryMethod}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Your most common way to get paid
            </p>
          </div>
        </div>
      </section>

      {/* 3. Search and Action controls */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipt id, reference, or recipient..."
              className="pl-9 h-9 pr-3 text-xs w-full bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg focus:border-orange-500 font-sans"
            />
          </div>

          <span className="text-[11px] text-[#9B9B9B] font-semibold">
            List matches {filteredReceipts.length} transactions
          </span>
        </div>

        <div className="border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl bg-white dark:bg-[#111111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EBEBEB] dark:border-[#1E1E1E] bg-[#F7F7F7]/50 dark:bg-[#070707]/30 text-secondary font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Receipt ID</th>
                  <th className="p-4 font-bold">Target Client</th>
                  <th className="p-4 font-bold">Deposition Date</th>
                  <th className="p-4 font-bold text-center">Clearance Channel</th>
                  <th className="p-4 font-bold text-right">Cleared Cash</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#1E1E1E]">
                {filteredReceipts.map((rec) => (
                  <tr
                    key={rec.id}
                    onClick={() => setActiveReceipt(rec)}
                    className="hover:bg-[#F7F7F7]/80 dark:hover:bg-[#161616]/80 cursor-pointer transition-colors duration-150 group"
                  >
                    <td className="p-4 font-mono font-bold text-emerald-500">
                      {rec.number}
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-primary">{rec.client.name}</span>
                        <span className="text-[10px] text-secondary font-mono mt-0.5">{rec.client.email}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-secondary">
                      {formatDate(rec.receiptDate)}
                    </td>

                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-md px-2 py-1 text-[10px] font-semibold text-primary">
                        <CreditCard size={10} className="text-secondary" />
                        <span>{rec.paymentMethod}</span>
                      </div>
                    </td>

                    <td className="p-4 text-right font-mono font-bold text-primary">
                      {formatCurrencyValue(rec.amountPaid, rec.currency)}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setActiveReceipt(rec)}
                          className="px-2.5 py-1 text-[10px] font-bold text-orange-500 bg-orange-500/10 hover:bg-orange-500 hover:text-white rounded-md transition-all cursor-pointer border border-orange-500/20"
                        >
                          Show Voucher
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredReceipts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-xs text-neutral-400 select-none">
                      No paid receipts registered in current workspace folder.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SLIDE OUT DRAWER: Elegant Watermarked cash receipt Voucher panel */}
      <AnimatePresence>
        {activeReceipt && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveReceipt(null)}
              className="absolute inset-0 bg-[#0A0A0A]/30 dark:bg-black/85 pointer-events-all"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.18 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111111] border-l border-[#EBEBEB] dark:border-[#1E1E1E] h-full p-6 flex flex-col justify-between shadow-none pointer-events-all z-10 overflow-y-auto"
            >
              <div>
                
                {/* Header Section representing verified document */}
                <div className="border-b border-[#EBEBEB] dark:border-[#1E1E1E] pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-950/40 uppercase tracking-wider inline-block">
                      Official Receipt Cashier Draft
                    </span>
                    <h3 className="text-base font-bold text-primary mt-1.5 font-mono">{activeReceipt.number}</h3>
                    <span className="text-[10px] text-secondary font-mono">Issued: {formatDate(activeReceipt.receiptDate)}</span>
                  </div>

                  <button
                    onClick={() => setActiveReceipt(null)}
                    className="text-secondary hover:text-red-400 text-xs cursor-pointer select-none font-semibold"
                  >
                    Close Sheet
                  </button>
                </div>

                {/* Voucher watermarked preview cards */}
                <div className="relative border border-dashed border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 bg-[#F7F7F7]/30 dark:bg-[#080808]/30 overflow-hidden font-sans">
                  
                  {/* Subtle watermark background */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-12 opacity-[0.03] dark:opacity-[0.05] pointer-events-none select-none">
                    <CheckCircle size={200} className="text-emerald-500" />
                  </div>

                  <div className="flex items-center gap-2 mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded text-white font-bold text-xs flex items-center justify-center">
                      F
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-primary">{activeReceipt.from.name}</span>
                      <span className="text-[9px] text-[#9B9B9B] dark:text-[#555555] font-mono block">{activeReceipt.from.email}</span>
                    </div>
                  </div>

                  {/* Transaction metadata logs */}
                  <div className="grid grid-cols-2 gap-3 text-xs leading-normal mb-4 border-b border-neutral-100 dark:border-neutral-900 pb-3 font-sans">
                    <div>
                      <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider block">PAID BY CUSTOMER</span>
                      <span className="font-bold text-primary block mt-0.5">{activeReceipt.client.name}</span>
                      <span className="text-[10px] text-secondary font-mono mt-0.5 block">{activeReceipt.client.email}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#9B9B9B] uppercase font-bold tracking-wider block">CLEAR PROTOCOL</span>
                      <span className="font-bold text-primary block mt-0.5">{activeReceipt.paymentMethod}</span>
                      <span className="text-[10px] font-mono text-secondary block mt-0.5">Ref: {activeReceipt.paymentReference || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Summary amount cleared center badge */}
                  <div className="py-3 px-4 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-center font-sans mb-4">
                    <span className="text-[10px] text-[#9B9B9B] dark:text-emerald-400 font-bold block">TOTAL LIQUIDATED & DEPOSITED</span>
                    <span className="text-xl font-bold font-mono text-emerald-500 block mt-1">
                      {formatCurrencyValue(activeReceipt.amountPaid, activeReceipt.currency)}
                    </span>
                  </div>

                  {/* Line Items checklist inside Receipt */}
                  <div className="text-xs">
                    <h5 className="font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-2 text-[10px]">
                      Voucher Reference breakdown
                    </h5>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto">
                      {activeReceipt.items.map((it) => (
                        <div key={it.id} className="flex justify-between items-baseline border-b border-neutral-100 dark:border-neutral-900/50 pb-1.5">
                          <span className="text-secondary font-medium tracking-tight block max-w-[240px] truncate">
                            {it.description} <span className="text-[10px] text-[#9B9B9B] font-mono">x{it.qty}</span>
                          </span>
                          <span className="font-mono font-bold text-primary">
                            {formatCurrencyValue(it.amount, activeReceipt.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {activeReceipt.notes && (
                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-900/50 text-[10px] text-[#9B9B9B] leading-normal">
                      Note: {activeReceipt.notes}
                    </div>
                  )}

                </div>
              </div>

              {/* PDF Print/Share actions */}
              <div className="grid grid-cols-2 gap-2 mt-6">
                <button
                  onClick={() => handleTriggerPrint(activeReceipt)}
                  className="h-9 rounded-lg border border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-orange-500 transition-all font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer text-primary"
                >
                  <Printer size={12} />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(activeReceipt, null, 2));
                    addToast('Receipt metadata copied to clipboard!', 'success');
                  }}
                  className="h-9 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Copy Metadata</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
