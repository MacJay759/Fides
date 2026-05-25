/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Save, 
  Eye, 
  Send, 
  UserPlus, 
  AlertCircle, 
  ChevronDown, 
  HelpCircle,
  FileText,
  DollarSign,
  Undo
} from 'lucide-react';
import { Invoice, LineItem, Client, User, InvoiceTemplate, InvoiceStatus } from '../types';
import { CURRENCIES, generateId, formatDate } from '../utils';
import { saveInvoice, getClients, saveClient } from '../store';
import InvoiceTemplateRenderer from './InvoiceTemplates';

interface InvoiceBuilderProps {
  user: User;
  invoiceToEdit?: Invoice | null;
  onBackToDashboard: () => void;
  onSendInvoice: (invoice: Invoice) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function InvoiceBuilder({
  user,
  invoiceToEdit,
  onBackToDashboard,
  onSendInvoice,
  addToast
}: InvoiceBuilderProps) {
  const isEditing = !!invoiceToEdit;

  // Global State Loaded Clients
  const savedClients = useMemo(() => getClients(user.id), [user.id]);

  // Client Selection / Adding States
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [clientQuery, setClientQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showNewClientSlide, setShowNewClientSlide] = useState(false);

  // New Client slide-over fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  // Main Invoice Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14); // default + 14 days
    return d.toISOString().split('T')[0];
  });
  const [poNumber, setPoNumber] = useState('');
  const [currency, setCurrency] = useState(user.business.defaultCurrency || 'USD');
  const [template, setTemplate] = useState<InvoiceTemplate>(user.business.defaultTemplate || 'modern');
  const [brandColor, setBrandColor] = useState(user.business.brandColor || '#F97316');

  // Client snap states
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');

  // Line Items
  const [items, setItems] = useState<LineItem[]>([
    {
      id: generateId('pay'), // simulated item prefix
      description: 'Consulting Services Retainer',
      qty: 1,
      unitPrice: 1500,
      taxRate: user.business.defaultTaxRate || 0,
      amount: 1500 // qty * rate
    }
  ]);

  // Calculations
  const [discountType, setDiscountType] = useState<'flat' | 'percent' | null>(null);
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [paymentInstructions, setPaymentInstructions] = useState(user.business.defaultPaymentInstructions || '');
  const [notes, setNotes] = useState(user.business.defaultNotes || '');
  const [terms, setTerms] = useState(user.business.defaultTerms || '');

  // UI States
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');

  // Input Focus helper
  const firstItemRef = useRef<HTMLInputElement>(null);

  // Initialize form state depending on edit vs create
  useEffect(() => {
    if (isEditing && invoiceToEdit) {
      setInvoiceNumber(invoiceToEdit.number);
      setInvoiceDate(invoiceToEdit.invoiceDate);
      setDueDate(invoiceToEdit.dueDate);
      setPoNumber(invoiceToEdit.poNumber || '');
      setCurrency(invoiceToEdit.currency);
      setTemplate(invoiceToEdit.template);
      setBrandColor(invoiceToEdit.brandColor);

      // Snap client
      setClientName(invoiceToEdit.client.name);
      setClientEmail(invoiceToEdit.client.email);
      setClientPhone(invoiceToEdit.client.phone);
      setClientAddress(invoiceToEdit.client.address);
      if (invoiceToEdit.client.id) {
        setSelectedClientId(invoiceToEdit.client.id);
      }

      setItems(invoiceToEdit.items);
      setPaymentMethod(invoiceToEdit.paymentMethod);
      setPaymentInstructions(invoiceToEdit.paymentInstructions);
      setNotes(invoiceToEdit.notes);
      setTerms(invoiceToEdit.terms);

      if (invoiceToEdit.discount) {
        setDiscountType(invoiceToEdit.discount.type);
        setDiscountValue(invoiceToEdit.discount.value);
      } else {
        setDiscountType(null);
        setDiscountValue(0);
      }
    } else {
      // Create - auto increment numbering
      const nextNum = user.business.nextInvoiceNumber || 1;
      const prefix = user.business.invoicePrefix || 'INV';
      setInvoiceNumber(`${prefix}-${String(nextNum).padStart(3, '0')}`);
    }
  }, [isEditing, invoiceToEdit, user]);

  // Calculations derived
  const totals = useMemo(() => {
    let subtotal = 0;
    let taxTotal = 0;

    items.forEach(item => {
      const itemSub = item.qty * item.unitPrice;
      subtotal += itemSub;
      if (item.taxRate > 0) {
        taxTotal += (itemSub * item.taxRate) / 100;
      }
    });

    let discountAmount = 0;
    if (discountType === 'percent') {
      discountAmount = (subtotal * discountValue) / 100;
    } else if (discountType === 'flat') {
      discountAmount = discountValue;
    }

    const total = Math.max(0, subtotal + taxTotal - discountAmount);

    return {
      subtotal,
      taxTotal,
      discountAmount,
      total
    };
  }, [items, discountType, discountValue]);

  // Construct current state of the document
  const currentInvoiceDraft: Invoice = useMemo(() => {
    return {
      id: isEditing && invoiceToEdit ? invoiceToEdit.id : 'inv_draft_active',
      userId: user.id,
      number: invoiceNumber || 'DRAFT-000',
      status: isEditing && invoiceToEdit ? invoiceToEdit.status : 'draft',
      template,
      brandColor,
      currency,
      invoiceType: 'invoice',
      client: {
        id: selectedClientId || null,
        name: clientName || 'Guest Recipient',
        email: clientEmail || 'billing@recipient.com',
        phone: clientPhone || '',
        address: clientAddress || 'Street Address, Region'
      },
      from: {
        name: user.business.name || 'Your Brand',
        logo: user.business.logo,
        address: user.business.address || 'Company HQ',
        email: user.business.email || user.email,
        phone: user.business.phone || '',
        website: user?.business?.website || ''
      },
      invoiceDate,
      dueDate,
      poNumber: poNumber || null,
      items,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      discount: discountType ? { type: discountType, value: discountValue } : null,
      total: totals.total,
      paymentMethod,
      paymentInstructions,
      notes,
      terms,
      createdAt: isEditing && invoiceToEdit ? invoiceToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: isEditing && invoiceToEdit ? invoiceToEdit.sentAt : null,
      viewedAt: isEditing && invoiceToEdit ? invoiceToEdit.viewedAt : null,
      paidAt: isEditing && invoiceToEdit ? invoiceToEdit.paidAt : null,
      voidedAt: isEditing && invoiceToEdit ? invoiceToEdit.voidedAt : null,
      payments: isEditing && invoiceToEdit ? invoiceToEdit.payments : [],
      amountPaid: isEditing && invoiceToEdit ? invoiceToEdit.amountPaid : 0,
      balanceDue: isEditing && invoiceToEdit ? invoiceToEdit.balanceDue : totals.total,
      recurring: isEditing && invoiceToEdit ? invoiceToEdit.recurring : null,
      receiptIds: isEditing && invoiceToEdit ? invoiceToEdit.receiptIds : [],
      shareToken: isEditing && invoiceToEdit ? invoiceToEdit.shareToken : generateId('inv')
    };
  }, [
    isEditing,
    invoiceToEdit,
    user,
    invoiceNumber,
    template,
    brandColor,
    currency,
    selectedClientId,
    clientName,
    clientEmail,
    clientPhone,
    clientAddress,
    invoiceDate,
    dueDate,
    poNumber,
    items,
    totals,
    paymentMethod,
    paymentInstructions,
    notes,
    terms
  ]);

  // Debounced auto-save handler mapping
  useEffect(() => {
    setAutoSaveStatus('dirty');
    const timer = setTimeout(() => {
      setAutoSaveStatus('saving');
      try {
        if (currentInvoiceDraft.id === 'inv_draft_active') {
          // create a temporary localStorage saved instance to avoid clearing state on reload
          localStorage.setItem('fides_active_builder_draft', JSON.stringify(currentInvoiceDraft));
        } else {
          saveInvoice(currentInvoiceDraft);
        }
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error(err);
        setAutoSaveStatus('dirty');
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [currentInvoiceDraft]);

  // Add Item
  const handleAddItem = () => {
    const newItem: LineItem = {
      id: generateId('pay'),
      description: '',
      qty: 1,
      unitPrice: 0,
      taxRate: user.business.defaultTaxRate || 0,
      amount: 0
    };
    setItems(prev => [...prev, newItem]);
    addToast('New item row active.', 'info');
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) {
      addToast('Invoices must contain at least 1 line item.', 'warning');
      return;
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Update item field values
  const handleUpdateItem = (id: string, field: keyof LineItem, val: any) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: val };
        updated.amount = updated.qty * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  // Autocomplete selecting clients snap
  const handleSelectClient = (c: Client) => {
    setSelectedClientId(c.id);
    setClientName(c.name);
    setClientEmail(c.email);
    setClientPhone(c.phone);
    setClientAddress(c.address);
    setCurrency(c.defaultCurrency || user.business.defaultCurrency || 'USD');
    setClientQuery('');
    setShowClientDropdown(false);
    addToast(`Loaded ${c.name} defaults.`, 'success');
  };

  // Inline client slide save handler
  const handleSaveNewClientSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientEmail) {
      addToast('Name and Email are required.', 'warning');
      return;
    }

    const newClientObj: Client = {
      id: generateId('cli'),
      userId: user.id,
      name: newClientName,
      email: newClientEmail,
      phone: newClientPhone,
      address: newClientAddress,
      defaultCurrency: currency,
      defaultPaymentTerms: user.business.defaultPaymentTerms || 'Due on Receipt',
      notes: 'Added from invoice builder.',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveClient(newClientObj);
    handleSelectClient(newClientObj);
    
    // Clear slide states
    setNewClientName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientAddress('');
    setShowNewClientSlide(false);
    addToast('Saved as client securely.', 'success');
  };

  // Main Submit finalization send/save handler
  const handleFinalizeAndSend = () => {
    if (!clientName || !clientEmail) {
      addToast('Customer Name and Email details are required.', 'warning');
      return;
    }
    if (items.some(i => !i.description || i.qty <= 0 || i.unitPrice < 0)) {
      addToast('Verify all row descriptions and pricing items are valid.', 'warning');
      return;
    }

    try {
      // Save and finalize
      saveInvoice(currentInvoiceDraft);
      localStorage.removeItem('fides_active_builder_draft');
      onSendInvoice(currentInvoiceDraft);
    } catch (err) {
      addToast('Failed to save invoice.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none relative font-sans">
      
      {/* Visual Header */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-1 text-[#6B6B6B] dark:text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5] bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md transition-fides cursor-pointer"
          >
            <Undo size={14} />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#9B9B9B] dark:text-[#555555]">Invoices</span>
              <span className="text-xs text-neutral-300">/</span>
              <span className="text-xs font-semibold text-primary">
                {isEditing ? `Edit Invoice — ${invoiceToEdit?.number}` : 'New Invoice'}
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white leading-tight mt-0.5">
              {isEditing ? 'Edit invoice details' : 'Create a new invoice'}
            </h1>
          </div>
        </div>

        {/* Save Draft Status Notification */}
        <div className="flex items-center gap-3 self-center lg:self-auto">
          <div className="flex items-center gap-1.5 text-[10px] text-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${
              autoSaveStatus === 'saved' ? 'bg-emerald-500' : autoSaveStatus === 'saving' ? 'bg-amber-400 animate-pulse' : 'bg-red-400'
            }`} />
            <span className="italic">
              {autoSaveStatus === 'saved' ? 'Saved as draft' : autoSaveStatus === 'saving' ? 'Saving changes...' : 'Draft unsaved'}
            </span>
          </div>

          <div className="flex gap-2 select-none">
            <button
              onClick={() => setShowFullPreview(true)}
              className="h-8 px-3.5 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] border border-[#EBEBEB] dark:border-[#1E1E1E] text-primary text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer"
            >
              <Eye size={12} />
              <span>Preview</span>
            </button>
            <button
              onClick={handleFinalizeAndSend}
              className="h-8 px-4 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded-md transition-fides flex items-center gap-1.5 cursor-pointer shadow-hidden"
            >
              <Send size={12} />
              <span>Save & Send</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Tab Control Grid */}
      <div className="tabs flex justify-center md:hidden w-full max-w-sm self-center">
        <button
          onClick={() => setMobileTab('edit')}
          className={`tab flex-1 ${mobileTab === 'edit' ? 'active' : ''}`}
        >
          ⚙ Edit Details
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`tab flex-1 ${mobileTab === 'preview' ? 'active' : ''}`}
        >
          📄 Preview Invoice
        </button>
      </div>

      {/* Split builder panel containers */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* LEFT PANEL: Form fields */}
        <div className={`${mobileTab === 'edit' ? 'flex' : 'hidden'} md:flex flex-col gap-6`}>
          
          {/* Section A: Customer Details */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
                Client Details
              </span>
              <button
                type="button"
                onClick={() => setShowNewClientSlide(true)}
                className="text-[10px] text-orange-500 hover:text-orange-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={12} />
                <span>New Client</span>
              </button>
            </div>

            {/* Typeahead Search Client */}
            <div className="relative">
              <input
                type="text"
                value={clientQuery}
                onFocus={() => setShowClientDropdown(true)}
                onChange={(e) => {
                  setClientQuery(e.target.value);
                  setClientName(e.target.value); // set custom inline as well
                  setSelectedClientId('');
                }}
                placeholder="Search or type client name..."
                className="w-full h-9 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500"
              />
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555] pointer-events-none" />

              {/* Autocomplete Dropdown */}
              {showClientDropdown && (
                <div className="absolute top-10 left-0 right-0 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg mt-1 max-h-40 overflow-y-auto index-30 p-1 flex flex-col gap-0.5 z-40">
                  {savedClients
                    .filter(c => c.name.toLowerCase().includes(clientQuery.toLowerCase()))
                    .map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectClient(c)}
                        className="w-full text-left text-xs p-2 hover:bg-neutral-50 dark:hover:bg-[#171717] rounded transition-fides text-primary flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-semibold">{c.name}</span>
                        <span className="text-[10px] text-secondary font-mono">{c.email}</span>
                      </button>
                    ))}
                  {savedClients.length === 0 && (
                    <div className="p-3 text-center text-[10px] text-neutral-400">
                      No clients saved yet.
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowClientDropdown(false)}
                    className="w-full text-center text-[9px] text-[#9B9B9B] p-1 bg-neutral-50 dark:bg-neutral-900 justify-self-end mt-1 font-semibold rounded"
                  >
                    Close Dropdown
                  </button>
                </div>
              )}
            </div>

            {/* Manual Edit overrides of Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Client Name</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Acme Laboratories"
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Client Email</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="accounts@acme.com"
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-secondary label">Client Address</label>
              <textarea
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Suite 102, Innovation Blvd"
                rows={2}
                className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 resize-none textarea"
              />
            </div>
          </div>

          {/* Section B: General Metadata */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Invoice Info
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Invoice Number</label>
                <input
                  type="text"
                  required
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-001"
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Purchase Order (PO)</label>
                <input
                  type="text"
                  value={poNumber}
                  onChange={(e) => setPoNumber(e.target.value)}
                  placeholder="PO-2026-928"
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* Date Picking with Fast Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            {/* Quick selectors for due limit */}
            <div className="flex flex-wrap gap-1.5 select-none pt-1">
              {[
                { label: 'Due on Receipt', days: 0 },
                { label: '7 days', days: 7 },
                { label: '14 days', days: 14 },
                { label: '30 days', days: 30 }
              ].map((term) => (
                <button
                  key={term.label}
                  type="button"
                  onClick={() => {
                    const start = invoiceDate ? new Date(invoiceDate) : new Date();
                    start.setDate(start.getDate() + term.days);
                    setDueDate(start.toISOString().split('T')[0]);
                    addToast(`Set due date: ${term.label}`, 'info');
                  }}
                  className="text-[9px] font-sans font-semibold border border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-orange-300 dark:hover:border-orange-950 px-2 py-0.5 rounded cursor-pointer text-secondary select-none"
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          {/* Section C: Itemized Table */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
                Items
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="h-7 px-2.5 bg-orange-50 hover:bg-orange-100 text-orange-500 dark:bg-orange-950/10 text-[10px] font-semibold rounded transition-fides flex items-center gap-1 cursor-pointer select-none"
              >
                <Plus size={12} />
                <span>Add item</span>
              </button>
            </div>

            {/* Table Rows rendering */}
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => (
                <div 
                  key={item.id} 
                  className="flex flex-col gap-2 p-3.5 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg bg-neutral-50/20"
                >
                  <div className="flex items-center justify-between gap-2.5">
                    <span className="text-[10px] font-mono font-bold text-neutral-400">#{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-400 hover:text-red-500 transition-fides cursor-pointer"
                      title="Delete item"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <input
                    type="text"
                    required
                    ref={idx === 0 ? firstItemRef : null}
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    placeholder="Describe service rendered, e.g. Website design"
                    className="h-8 px-3 text-xs w-full bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500"
                  />

                  <div className="grid grid-cols-3 gap-2.5 mt-1 text-xs">
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] text-[#9B9B9B] dark:text-[#555555]">Qty</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={item.qty}
                        onChange={(e) => handleUpdateItem(item.id, 'qty', Math.max(1, Number(e.target.value)))}
                        className="h-7 px-2 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] text-[#9B9B9B] dark:text-[#555555]">Price ({currency})</label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Math.max(0, Number(e.target.value)))}
                        className="h-7 px-2 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <label className="text-[9px] text-[#9B9B9B] dark:text-[#555555]">Tax %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.taxRate}
                        onChange={(e) => handleUpdateItem(item.id, 'taxRate', Math.max(0, Math.min(100, Number(e.target.value))))}
                        className="h-7 px-2 bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Calculations Blocks details */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#EBEBEB] dark:border-[#1E1E1E]">
              
              {/* Discount custom toggle button */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#6B6B6B] dark:text-[#888888] font-sans">Discount:</span>
                {!discountType ? (
                  <button
                    onClick={() => {
                      setDiscountType('percent');
                      setDiscountValue(10);
                    }}
                    className="text-[10px] text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
                  >
                    + Add Discount
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-primary font-sans select-none">
                    <select
                      value={discountType}
                      onChange={(e: any) => setDiscountType(e.target.value)}
                      className="bg-neutral-50 dark:bg-neutral-900 text-[10px] rounded px-1.5 focus:outline-none"
                    >
                      <option value="percent">Percentage %</option>
                      <option value="flat">Fixed Amount</option>
                    </select>
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                      className="w-12 text-center h-5 text-[10px] font-mono bg-neutral-100 dark:bg-neutral-900 border rounded"
                    />
                    <button
                      onClick={() => {
                        setDiscountType(null);
                        setDiscountValue(0);
                      }}
                      className="text-[9px] text-red-400 hover:text-red-500 font-bold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section D: Billing Templates Layout & Selection Colors */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Theme & Design
            </span>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="h-8 px-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500"
                >
                  {CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Invoice Template</label>
                <select
                  value={template}
                  onChange={(e: any) => setTemplate(e.target.value)}
                  className="h-8 px-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-transform:capitalize"
                >
                  <option value="modern">Modern (Banner layout)</option>
                  <option value="classic">Classic (Standard table layout)</option>
                  <option value="minimal">Minimal (Simple layout)</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-medium text-secondary label">Payment Instructions</label>
              <textarea
                value={paymentInstructions}
                onChange={(e) => setPaymentInstructions(e.target.value)}
                placeholder="Include Swift details, bank card numbers etc..."
                rows={3}
                className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 resize-none font-mono"
              />
            </div>
          </div>

          {/* Section E: Collapsible Terms & Notes */}
          <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
            <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider text-heading">
              Notes & Terms
            </span>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Note to Client</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Thank you for trusting Apex."
                  rows={2}
                  className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded resize-none focus:border-orange-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium text-secondary label">Terms & Conditions</label>
                <textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Payment is strictly monitored."
                  rows={2}
                  className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded resize-none focus:border-orange-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Live Document compiled preview */}
        <div className={`${mobileTab === 'preview' ? 'flex' : 'hidden'} md:flex flex-col items-center bg-neutral-100/50 dark:bg-[#090909]/40 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-6 pointer-events-none sticky top-4`}>
          <div className="text-[10px] font-mono text-secondary mb-4 uppercase tracking-widest select-none">
            📄 Responsive Live compiled document ~65% scale view
          </div>

          {/* Shrink container wrapper simulating responsive document page layout */}
          <div className="origin-top scale-[0.55] sm:scale-[0.62] lg:scale-[0.68] xl:scale-[0.82] min-h-[900px] flex items-start justify-center overflow-hidden h-[640px] border border-neutral-200 dark:border-[#1A1A1A]">
            <InvoiceTemplateRenderer data={currentInvoiceDraft} />
          </div>
        </div>

      </section>

      {/* Slide-over custom new customer adding modal block */}
      <AnimatePresence>
        {showNewClientSlide && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewClientSlide(false)}
              className="absolute inset-0 bg-neutral-900/40 dark:bg-black/60 pointer-events-all"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.18 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#111111] border-l border-[#EBEBEB] dark:border-[#1E1E1E] h-full p-6 flex flex-col justify-between shadow-none pointer-events-all z-10"
            >
              <form onSubmit={handleSaveNewClientSlide} className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                  <h3 className="text-sm font-semibold text-primary">Add Client</h3>
                  <button
                    type="button"
                    onClick={() => setShowNewClientSlide(false)}
                    className="text-xs text-secondary hover:text-red-400 select-none"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Client Name*</label>
                  <input
                    type="text"
                    required
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    placeholder="Acme Labs Inc"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Client Email*</label>
                  <input
                    type="email"
                    required
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="accounts@acmelabs.com"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-sans"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Phone Number</label>
                  <input
                    type="text"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs text-secondary label">Address</label>
                  <textarea
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    placeholder="Corporate Row Street, Texas"
                    rows={2}
                    className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 resize-none textarea"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-8 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold rounded text-xs tracking-wide cursor-pointer transition-fides select-none mt-4"
                >
                  Save Client
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Full screen document render preview modal */}
      <AnimatePresence>
        {showFullPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullPreview(false)}
              className="absolute inset-0 bg-neutral-900/60 dark:bg-black/80 pointer-events-all"
            />
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative w-full max-w-[840px] max-h-[90vh] overflow-y-auto bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-xl p-4 sm:p-8 flex flex-col items-center pointer-events-all select-none gap-4 z-10 scroll-smooth"
            >
              <div className="flex justify-between w-full pb-3 border-b border-neutral-200 dark:border-neutral-800">
                <span className="text-xs font-semibold text-primary font-mono select-none">Invoice Preview</span>
                <button
                  onClick={() => setShowFullPreview(false)}
                  className="bg-[#0A0A0A] text-white hover:bg-neutral-800 text-xs font-semibold px-3 py-1 rounded transition-fides cursor-pointer select-none"
                >
                  Close Preview
                </button>
              </div>

              {/* Renders template inside standard layout wrapper */}
              <div className="w-full max-w-[794px] border border-neutral-200 shadow-none">
                <InvoiceTemplateRenderer data={currentInvoiceDraft} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
