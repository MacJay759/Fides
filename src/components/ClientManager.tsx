/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Users, 
  Edit2, 
  Trash2, 
  Mail, 
  Phone, 
  MapPin, 
  Clipboard, 
  ChevronRight,
  UserCheck,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import { Client, Invoice, User } from '../types';
import { getClients, saveClient, deleteClient, getInvoices } from '../store';
import { formatCurrencyValue, formatDate, generateId, CURRENCIES } from '../utils';

interface ClientManagerProps {
  user: User;
  clients: Client[];
  invoices: Invoice[];
  onRefreshClients: () => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function ClientManager({
  user,
  clients,
  invoices,
  onRefreshClients,
  addToast
}: ClientManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Slide Over Triggers
  const [activeSlideClient, setActiveSlideClient] = useState<Client | null>(null);
  const [showAddEditSlide, setShowAddEditSlide] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState(user.business.defaultCurrency || 'USD');
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState('Due on Receipt');
  const [notes, setNotes] = useState('');

  // Filtering list
  const filteredClients = useMemo(() => {
    return clients.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery))
    );
  }, [clients, searchQuery]);

  // Shared customer directory analytics
  const globalMetrics = useMemo(() => {
    const activeClients = clients.length;
    let totalBilledSum = 0;
    let totalUnpaidAR = 0;

    invoices.forEach(inv => {
      totalBilledSum += inv.total;
      if (inv.status !== 'paid' && inv.status !== 'void') {
        totalUnpaidAR += (inv.total - (inv.amountPaid || 0));
      }
    });

    return {
      activeClients,
      totalBilledSum,
      totalUnpaidAR
    };
  }, [clients, invoices]);

  // Handle Opening fresh Add Client Slide
  const openAddSlide = () => {
    setClientToEdit(null);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setDefaultCurrency(user.business.defaultCurrency || 'USD');
    setDefaultPaymentTerms('Due on Receipt');
    setNotes('');
    setShowAddEditSlide(true);
  };

  // Handle Opening Edit Client slide with metrics preloaded
  const openEditSlide = (c: Client, e: React.MouseEvent) => {
    e.stopPropagation();
    setClientToEdit(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setAddress(c.address || '');
    setDefaultCurrency(c.defaultCurrency || user.business.defaultCurrency || 'USD');
    setDefaultPaymentTerms(c.defaultPaymentTerms || 'Due on Receipt');
    setNotes(c.notes || '');
    setShowAddEditSlide(true);
  };

  // Profile Save Submit
  const handleSaveClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      addToast('Name and billing email are required fields.', 'warning');
      return;
    }

    const saved: Client = {
      id: clientToEdit ? clientToEdit.id : generateId('cli'),
      userId: user.id,
      name,
      email: email.toLowerCase().trim(),
      phone,
      address,
      defaultCurrency,
      defaultPaymentTerms,
      notes,
      createdAt: clientToEdit ? clientToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveClient(saved);
    onRefreshClients();
    setShowAddEditSlide(false);
    addToast(clientToEdit ? 'Client profiles updated successfully.' : 'New customer registered.', 'success');
  };

  // Invoice logs specific to currently inspected client
  const inspectedClientInvoices = useMemo(() => {
    if (!activeSlideClient) return [];
    return invoices.filter(inv => inv.client.id === activeSlideClient.id || inv.client.email === activeSlideClient.email);
  }, [activeSlideClient, invoices]);

  // Client financial summary calculations
  const clientFinancialTotals = useMemo(() => {
    if (!activeSlideClient) return { billed: 0, unpaid: 0 };
    const clientInvs = invoices.filter(inv => inv.client.id === activeSlideClient.id || inv.client.email === activeSlideClient.email);
    const billed = clientInvs.reduce((sum, inv) => sum + inv.total, 0);
    const unpaid = clientInvs.reduce((sum, inv) => inv.status !== 'paid' && inv.status !== 'void' ? sum + (inv.total - (inv.amountPaid || 0)) : sum, 0);
    return { billed, unpaid };
  }, [activeSlideClient, invoices]);

  // Delete Client Profile
  const handleDeleteClientSubmit = (id: string, name: string) => {
    deleteClient(id);
    onRefreshClients();
    setActiveSlideClient(null);
    addToast(`Client (${name}) folder deleted successfully.`, 'info');
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent pb-1">
        <div className="font-sans">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
            Clients
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#888888] mt-1 font-medium">
            Manage client contact details, default currencies, and billing terms.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="pl-9 h-10 pr-3 text-xs w-full sm:w-60 bg-white dark:bg-[#111111]/45 border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-lg focus:border-orange-500 font-sans transition-colors duration-200"
            />
          </div>

          <button
            onClick={openAddSlide}
            className="shrink-0 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 active:scale-95 duration-100 text-white text-xs font-bold px-4 py-2.5 rounded-lg cursor-pointer h-10 select-none shadow-xs"
          >
            <Plus size={14} />
            <span>New client</span>
          </button>
        </div>
      </div>

      {/* Dynamic Customer Relations KPI Panels */}
      <section className="grid grid-cols-1 sm:grid-cols-3 border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-[12px] bg-white dark:bg-[#0A0A0A] overflow-hidden divide-y sm:divide-y-0 sm:divide-x divide-[#EBEBEB] dark:divide-[#1F1F1F]">
        
        {/* Metric 1: Active Accounts */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Active Clients
            </span>
            <div className="p-1.5 rounded-lg border border-neutral-200/35 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#111111]/45 text-[#555555] dark:text-[#888888] flex items-center justify-center">
              <Users size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {globalMetrics.activeClients}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Customers successfully configured inside your account
            </p>
          </div>
        </div>

        {/* Metric 2: Consolidated AR Balance */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Total Unpaid
            </span>
            <div className={`p-1.5 rounded-lg flex items-center justify-center ${
              globalMetrics.totalUnpaidAR > 0 
                ? 'border-red-500/25 bg-red-500/10 dark:bg-red-950/20 text-red-500 animate-pulse' 
                : 'border-neutral-200/35 dark:border-[#1F1F1F] bg-neutral-50 dark:bg-[#111111]/45 text-[#555555]'
            }`}>
              <AlertCircle size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className={`font-sans text-[22px] md:text-[25px] font-bold tracking-tight leading-none ${
              globalMetrics.totalUnpaidAR > 0 ? 'text-red-500 dark:text-red-400' : 'text-[#0A0A0A] dark:text-white'
            }`}>
              {formatCurrencyValue(globalMetrics.totalUnpaidAR, user.business.defaultCurrency || 'USD')}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Active unpaid balances from client invoices
            </p>
          </div>
        </div>

        {/* Metric 3: Total Invoiced Portfolio */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Total Billed
            </span>
            <div className="p-1.5 rounded-lg border border-orange-500/25 bg-orange-500/10 dark:bg-orange-950/20 text-orange-500 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[22px] md:text-[25px] font-semibold text-emerald-600 dark:text-[#10B981] tracking-tight leading-none">
              {formatCurrencyValue(globalMetrics.totalBilledSum, user.business.defaultCurrency || 'USD')}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Total sales amount successfully billed to date
            </p>
          </div>
        </div>
      </section>

      {/* Grid rendering list of client entries */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((c) => {
          const clientInvs = invoices.filter(inv => inv.client.id === c.id || inv.client.email === c.email);
          const totalBilled = clientInvs.reduce((sum, inv) => sum + inv.total, 0);
          const totalOutstanding = clientInvs.reduce((sum, inv) => inv.status !== 'paid' && inv.status !== 'void' ? sum + (inv.total - (inv.amountPaid || 0)) : sum, 0);

          return (
            <div
              key={c.id}
              onClick={() => setActiveSlideClient(c)}
              className="p-5 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-orange-500 rounded-xl cursor-pointer transition-fides flex flex-col justify-between h-40 relative group overflow-hidden"
            >
              {/* Highlight bar hover borders */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent group-hover:bg-orange-500 transition-all" />

              <div className="flex items-start justify-between">
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-[#0A0A0A] dark:text-[#F5F5F5] truncate">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-secondary truncate font-mono mt-0.5">
                    {c.email}
                  </span>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => openEditSlide(c, e)}
                    className="p-1 hover:text-orange-500 transition-fides cursor-pointer"
                    title="Edit Customer Profile"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Clear all directories connected to ${c.name}?`)) {
                        handleDeleteClientSubmit(c.id, c.name);
                      }
                    }}
                    className="p-1 hover:text-red-400 transition-fides cursor-pointer"
                    title="Delete Profile Folder"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {/* Financial summarizers rows */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-neutral-50 dark:border-neutral-900 text-xs font-sans">
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#9B9B9B] uppercase font-bold tracking-wider">TOL BILLED</span>
                  <span className="font-mono text-primary font-bold mt-0.5">
                    {formatCurrencyValue(totalBilled, c.defaultCurrency || user.business.defaultCurrency)}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] text-[#9B9B9B] uppercase font-bold tracking-wider">DUE ARREARS</span>
                  <span className={`font-mono font-bold mt-0.5 ${totalOutstanding > 0 ? 'text-red-500' : 'text-neutral-400'}`}>
                    {formatCurrencyValue(totalOutstanding, c.defaultCurrency || user.business.defaultCurrency)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="col-span-full border border-dashed border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl py-16 text-center text-xs text-neutral-400 select-none">
            No customers matching standard filters registered in the database directory.
          </div>
        )}
      </section>

      {/* SLIDE-OVER A: Client Detail Panel Slide (Inspect history & profile notes) */}
      <AnimatePresence>
        {activeSlideClient && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSlideClient(null)}
              className="absolute inset-0 bg-[#0A0A0A]/30 dark:bg-black/85 pointer-events-all"
            />
            
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.18 }}
              className="relative w-full max-w-md bg-white dark:bg-[#111111] border-l border-[#EBEBEB] dark:border-[#1E1E1E] h-full p-6 flex flex-col justify-between shadow-none pointer-events-all z-10 flex flex-col overflow-y-auto"
            >
              <div>
                {/* Header card details */}
                <div className="pb-4 border-b border-[#EBEBEB] dark:border-[#1E1E1E] flex justify-between items-baseline">
                  <div className="flex flex-col">
                    <h3 className="text-base font-bold text-primary">{activeSlideClient.name}</h3>
                    <span className="text-[10px] font-mono text-secondary">{activeSlideClient.email}</span>
                  </div>
                  <button onClick={() => setActiveSlideClient(null)} className="text-secondary text-xs hover:text-red-400 cursor-pointer">
                    Close Details
                  </button>
                </div>

                {/* Info blocks contacts */}
                <div className="py-4 flex flex-col gap-2.5 text-xs text-[#6B6B6B] dark:text-[#888888] font-sans border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                  {activeSlideClient.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={12} />
                      <span>Phone: {activeSlideClient.phone}</span>
                    </div>
                  )}
                  {activeSlideClient.address && (
                    <div className="flex items-start gap-2">
                      <MapPin size={12} className="mt-0.5" />
                      <span className="whitespace-pre-line leading-relaxed">Address: {activeSlideClient.address}</span>
                    </div>
                  )}
                  {activeSlideClient.notes && (
                    <div className="bg-neutral-50 dark:bg-[#1A1A1A] p-2.5 rounded border border-neutral-100 dark:border-neutral-900 mt-1 italic">
                      Notes: {activeSlideClient.notes}
                    </div>
                  )}
                </div>

                {/* Balances highlights */}
                <div className="grid grid-cols-2 gap-4 py-4 text-xs font-sans border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-[#9B9B9B] tracking-wider block">ALL TIME INVOICED</span>
                    <span className="font-mono text-sm text-primary font-bold mt-1">
                      {formatCurrencyValue(clientFinancialTotals.billed, activeSlideClient.defaultCurrency)}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-[#9B9B9B] tracking-wider block">OUTSTANDING BALANCE</span>
                    <span className={`font-mono text-sm font-bold mt-1 ${clientFinancialTotals.unpaid > 0 ? 'text-red-500' : 'text-neutral-400'}`}>
                      {formatCurrencyValue(clientFinancialTotals.unpaid, activeSlideClient.defaultCurrency)}
                    </span>
                  </div>
                </div>

                {/* Invoice listing scroll area */}
                <div className="mt-6">
                  <h4 className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-3">
                    Invoices Ledger Folder
                  </h4>
                  <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                    {inspectedClientInvoices.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-3 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg bg-[#F7F7F7]/20 dark:bg-[#070707]/10 flex items-center justify-between text-xs transition-fides hover:border-orange-400"
                      >
                        <div className="flex flex-col">
                          <span className="font-mono font-bold text-primary">{inv.number}</span>
                          <span className="text-[10px] text-secondary font-mono">Issued: {formatDate(inv.invoiceDate)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-mono font-bold text-primary">{formatCurrencyValue(inv.total, inv.currency)}</span>
                          <span className={`text-[9px] font-semibold italic ${
                            inv.status === 'paid' ? 'text-emerald-500' : inv.status === 'overdue' ? 'text-red-500 font-bold' : 'text-orange-400'
                          }`}>
                            {inv.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {inspectedClientInvoices.length === 0 && (
                      <div className="text-center py-6 text-[11px] text-neutral-400 italic">
                        No invoices compiled for this client profile.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SLIDE-OVER B: Add or edit Customer forms (slide on right) */}
      <AnimatePresence>
        {showAddEditSlide && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddEditSlide(false)}
              className="absolute inset-0 bg-[#0A0A0A]/30 dark:bg-black/85 pointer-events-all"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.18 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111111] border-l border-[#EBEBEB] dark:border-[#1E1E1E] h-full p-6 flex flex-col justify-between shadow-none pointer-events-all z-10 overflow-y-auto"
            >
              <form onSubmit={handleSaveClientSubmit} className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                  <h3 className="text-sm font-semibold text-primary">
                    {clientToEdit ? 'Modify customer profile' : 'Register brand customer'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowAddEditSlide(false)}
                    className="text-xs text-secondary hover:text-red-400 select-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Company Name Detail*</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Acme Laboratories"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Key Contact Email*</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="billing@acme.com"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-sans text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Phone Direct Contact</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 812 345"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Office Head Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Physical HQ rows..."
                    rows={2}
                    className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 resize-none textarea text-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary label">Default currency</label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="h-8 px-1 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded text-primary"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.code}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-secondary label">Payment net limits</label>
                    <select
                      value={defaultPaymentTerms}
                      onChange={(e: any) => setDefaultPaymentTerms(e.target.value)}
                      className="h-8 px-1 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded text-primary"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 7">Net 7</option>
                      <option value="Net 14">Net 14</option>
                      <option value="Net 30">Net 30</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Internal profile notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Personal profile identifiers..."
                    rows={2}
                    className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 resize-none textarea text-primary"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-8 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded text-xs select-none cursor-pointer mt-4"
                >
                  Save Profile defaults
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
