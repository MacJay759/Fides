/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Receipt, 
  ArrowUpRight, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Trash2,
  Edit2,
  X
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client } from '../types';
import { formatCurrencyValue, formatDate, formatFriendlyDate } from '../utils';

interface InvoiceListProps {
  userId: string;
  invoices: Invoice[];
  clients: Client[];
  onSelectInvoice: (id: string) => void;
  openNewInvoice: () => void;
  onEditInvoice: (inv: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function InvoiceList({
  userId,
  invoices,
  clients,
  onSelectInvoice,
  openNewInvoice,
  onEditInvoice,
  onDeleteInvoice,
  addToast
}: InvoiceListProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');

  const currencyCode = useMemo(() => {
    return invoices.length > 0 ? invoices[0].currency : 'USD';
  }, [invoices]);

  // Invoice KPIs calculation
  const metrics = useMemo(() => {
    let totalInvoiced = 0;
    let totalReceived = 0;
    let totalOutstanding = 0;
    let totalOverdue = 0;
    
    let draftCount = 0;
    let sentCount = 0;
    let viewedCount = 0;
    let overdueCount = 0;
    let paidCount = 0;

    invoices.forEach(inv => {
      totalInvoiced += inv.total;
      totalReceived += (inv.amountPaid || 0);
      
      const balance = inv.total - (inv.amountPaid || 0);

      if (inv.status === 'draft') draftCount++;
      else if (inv.status === 'sent') sentCount++;
      else if (inv.status === 'viewed') {
        viewedCount++;
        totalOutstanding += balance;
      }
      else if (inv.status === 'overdue') {
        overdueCount++;
        totalOverdue += balance;
        totalOutstanding += balance;
      }
      else if (inv.status === 'partially_paid') {
        totalOutstanding += balance;
      }
      else if (inv.status === 'paid') {
        paidCount++;
      }
    });

    return {
      totalInvoiced,
      totalReceived,
      totalOutstanding,
      totalOverdue,
      counts: { draftCount, sentCount, viewedCount, overdueCount, paidCount }
    };
  }, [invoices]);

  // Search, filter, and sort logic
  const processedInvoices = useMemo(() => {
    let list = [...invoices];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(inv => inv.status === statusFilter);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(inv => 
        inv.number.toLowerCase().includes(q) ||
        inv.client.name.toLowerCase().includes(q) ||
        inv.client.email.toLowerCase().includes(q) ||
        (inv.poNumber && inv.poNumber.toLowerCase().includes(q)) ||
        inv.total.toString().includes(q)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'amount_desc') return b.total - a.total;
      if (sortBy === 'amount_asc') return a.total - b.total;
      if (sortBy === 'date_asc') return new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime(); // date_desc
    });

    return list;
  }, [invoices, statusFilter, searchQuery, sortBy]);

  const handleConfirmDelete = (e: React.MouseEvent, id: string, num: string) => {
    e.stopPropagation();
    if (confirm(`Remove Invoice folder ${num} forever? This cannot be undone.`)) {
      onDeleteInvoice(id);
      addToast(`Invoice (${num}) deleted from records.`, 'info');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans text-left">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent pb-1">
        <div className="font-sans">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#888888] mt-1 font-medium">
            Create, search, and manage all your client invoices in one place.
          </p>
        </div>

        <button
          onClick={openNewInvoice}
          className="shrink-0 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 duration-100 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer h-10 select-none shadow-xs"
        >
          <Plus size={14} />
          <span>New invoice</span>
        </button>
      </div>

      {/* 2. Custom Structured Metric Blocks */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-[12px] bg-white dark:bg-[#0A0A0A] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#EBEBEB] dark:divide-[#1F1F1F]">
        
        {/* Metric 1: Outstanding Amount */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Outstanding Amount
            </span>
            <div className="p-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center">
              <Clock size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {formatCurrencyValue(metrics.totalOutstanding, currencyCode)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Unpaid balance waiting to be collected
            </p>
          </div>
        </div>

        {/* Metric 2: Payments Received */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Payments Received
            </span>
            <div className="p-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/15 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <CheckCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-semibold text-emerald-600 dark:text-[#10B981] tracking-tight leading-none">
              {formatCurrencyValue(metrics.totalReceived, currencyCode)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              {Math.round((metrics.totalReceived / (metrics.totalInvoiced || 1)) * 100)}% of all invoices paid successfully
            </p>
          </div>
        </div>

        {/* Metric 3: Overdue Amount */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Overdue Amount
            </span>
            <div className={`p-1.5 rounded-lg flex items-center justify-center ${
              metrics.totalOverdue > 0 
                ? 'border-red-500/25 bg-red-500/10 dark:bg-red-950/20 text-red-500 animate-pulse' 
                : 'border-neutral-200/35 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#111111]/45 text-[#555555]'
            }`}>
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`font-sans text-[22px] md:text-[25px] font-bold tracking-tight leading-none ${
              metrics.totalOverdue > 0 ? 'text-red-500 dark:text-red-400' : 'text-[#0A0A0A] dark:text-white'
            }`}>
              {formatCurrencyValue(metrics.totalOverdue, currencyCode)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              {metrics.counts.overdueCount} {metrics.counts.overdueCount === 1 ? 'invoice is' : 'invoices are'} past due date
            </p>
          </div>
        </div>

        {/* Metric 4: Total Invoices */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Total Invoices
            </span>
            <div className="p-1.5 rounded-lg border border-neutral-200/35 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#111111]/45 text-[#555555] dark:text-[#888888] flex items-center justify-center">
              <Layers size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {invoices.length}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Total number of invoices created
            </p>
          </div>
        </div>
      </section>

      {/* 3. Filter Grid and Search Tools */}
      <section className="flex flex-col gap-4">
        
        {/* Horizontal filters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Select Scroll Rails */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 md:pb-0 scroll-smooth">
            {[
              { id: 'all', label: 'All Invoices' },
              { id: 'draft', label: 'Drafts' },
              { id: 'sent', label: 'Sent' },
              { id: 'viewed', label: 'Opened' },
              { id: 'overdue', label: 'Overdue' },
              { id: 'paid', label: 'Paid' }
            ].map((p) => {
              const isActive = statusFilter === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setStatusFilter(p.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition-all duration-150 border ${
                    isActive
                      ? 'bg-orange-500 border-orange-500 text-white shadow-none'
                      : 'bg-white dark:bg-[#111111] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] border-[#EBEBEB] dark:border-[#1E1E1E] text-secondary'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            
            {/* Direct Search query */}
            <div className="relative flex-1 md:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search number, clients..."
                className="pl-9 h-9 pr-3 text-xs w-full md:w-56 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg focus:border-orange-500 font-sans"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Sorters */}
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-9 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg text-xs px-2.5 text-primary"
            >
              <option value="date_desc">Created: Latest</option>
              <option value="date_asc">Created: Earliest</option>
              <option value="amount_desc">Amount: High-Low</option>
              <option value="amount_asc">Amount: Low-High</option>
            </select>
          </div>
        </div>

        {/* 4. Custom Registry List Table */}
        <div className="border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl bg-white dark:bg-[#111111] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EBEBEB] dark:border-[#1E1E1E] bg-[#F7F7F7]/50 dark:bg-[#070707]/30 text-secondary font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-4 font-bold">Bill No</th>
                  <th className="p-4 font-bold">Client Recipient</th>
                  <th className="p-4 font-bold">Issue/Due Date</th>
                  <th className="p-4 font-bold text-right">Invoice Sum</th>
                  <th className="p-4 font-bold text-center">Status Badge</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#1E1E1E]">
                {processedInvoices.map((inv) => {
                  const isOverdue = inv.status === 'overdue' || (inv.status !== 'paid' && inv.status !== 'void' && new Date(inv.dueDate) < new Date());

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv.id)}
                      className="hover:bg-[#F7F7F7]/80 dark:hover:bg-[#161616]/80 cursor-pointer transition-colors duration-150 group"
                    >
                      {/* Bill No */}
                      <td className="p-4 font-mono font-bold text-primary group-hover:text-orange-500 transition-colors">
                        {inv.number}
                      </td>
                      
                      {/* Client recipient */}
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0A0A0A] dark:text-[#F5F5F5]">{inv.client.name}</span>
                          <span className="text-[10px] text-secondary font-mono mt-0.5">{inv.client.email}</span>
                        </div>
                      </td>

                      {/* Issue/Due date */}
                      <td className="p-4">
                        <div className="flex flex-col gap-0.5 text-secondary">
                          <span className="font-mono">{formatDate(inv.invoiceDate)}</span>
                          <span className="text-[10px] font-mono font-semibold text-neutral-400">Due: {formatDate(inv.dueDate)}</span>
                        </div>
                      </td>

                      {/* Invoice Sum */}
                      <td className="p-4 font-mono font-bold text-right text-primary text-sm">
                        {formatCurrencyValue(inv.total, inv.currency)}
                      </td>

                      {/* Status badge */}
                      <td className="p-4 text-center whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold tracking-tight rounded-md select-none border lowercase italic ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border-emerald-100 dark:border-emerald-950/40'
                            : isOverdue && inv.status !== 'paid'
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border-red-100 dark:border-red-950/40 animate-pulse-subtle'
                              : inv.status === 'draft'
                                ? 'bg-neutral-50 dark:bg-neutral-900/40 text-neutral-500 border-[#E5E5E5]/50'
                                : 'bg-orange-50 dark:bg-orange-950/10 text-orange-500 border-orange-100 dark:border-orange-950/20'
                        }`}>
                          {inv.status}
                        </span>
                      </td>

                      {/* Quick Actions row button list */}
                      <td className="p-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          
                          {/* Inspect Detail */}
                          <button
                            onClick={() => onSelectInvoice(inv.id)}
                            className="p-1 text-secondary hover:text-orange-500 hover:bg-neutral-50 dark:hover:bg-[#1F1F1F] rounded-md transition-colors border border-transparent hover:border-[#EBEBEB]"
                            title="Inspect Details"
                          >
                            <ChevronRight size={14} />
                          </button>

                          {/* Edit Invoice (Draft only) */}
                          {inv.status === 'draft' && (
                            <button
                              onClick={() => onEditInvoice(inv)}
                              className="p-1 text-secondary hover:text-orange-500 hover:bg-neutral-50 dark:hover:bg-[#1F1F1F] rounded-md transition-colors border border-transparent hover:border-[#EBEBEB]"
                              title="Edit Draft"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {/* Delete profile */}
                          <button
                            onClick={(e) => handleConfirmDelete(e, inv.id, inv.number)}
                            className="p-1 text-secondary hover:text-red-500 hover:bg-neutral-50 dark:hover:bg-[#1F1F1F] rounded-md transition-colors border border-transparent hover:border-[#EBEBEB]"
                            title="Delete Invoice Archive"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {processedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-16 text-center text-xs text-neutral-400 select-none">
                      No invoices found under specified filter conditions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  );
}
