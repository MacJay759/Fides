/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Save, 
  Building, 
  DollarSign, 
  Palette, 
  ShieldAlert, 
  Upload, 
  Trash2, 
  Download, 
  Lock, 
  Check, 
  Eye 
} from 'lucide-react';
import { User, InvoiceTemplate } from '../types';
import { CURRENCIES } from '../utils';
import { saveUser, getInvoices, getClients, getReceipts } from '../store';

interface SettingsProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function Settings({ user, onUpdateUser, addToast }: SettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'billing' | 'appearance' | 'account'>('profile');

  // STEP 1S: PROFILE
  const [name, setName] = useState(user.business.name || '');
  const [logo, setLogo] = useState<string | null>(user.business.logo);
  const [address, setAddress] = useState(user.business.address || '');
  const [phone, setPhone] = useState(user.business.phone || '');
  const [email, setEmail] = useState(user.business.email || '');
  const [website, setWebsite] = useState(user.business.website || '');

  // STEP 2S: BILLING DEFAULTS
  const [defaultCurrency, setDefaultCurrency] = useState(user.business.defaultCurrency || 'USD');
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(user.business.defaultTaxRate ?? 7.5);
  const [taxLabel, setTaxLabel] = useState(user.business.taxLabel || 'VAT');
  const [invoicePrefix, setInvoicePrefix] = useState(user.business.invoicePrefix || 'INV');
  const [nextInvoiceNumber, setNextInvoiceNumber] = useState<number>(user.business.nextInvoiceNumber || 1);
  const [defaultPaymentTerms, setDefaultPaymentTerms] = useState(user.business.defaultPaymentTerms || 'Due on Receipt');
  const [defaultPaymentInstructions, setDefaultPaymentInstructions] = useState(user.business.defaultPaymentInstructions || '');
  const [defaultNotes, setDefaultNotes] = useState(user.business.defaultNotes || '');
  const [defaultTerms, setDefaultTerms] = useState(user.business.defaultTerms || '');

  // STEP 3S: APPEARANCE
  const [brandColor, setBrandColor] = useState(user.business.brandColor || '#F97316');
  const [defaultTemplate, setDefaultTemplate] = useState<InvoiceTemplate>(user.business.defaultTemplate || 'modern');

  // Convert uploaded image to base64
  const handleLogoUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('Please upload an image file.', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      addToast('File size is too big. Keep under 2MB.', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogo(reader.result);
        addToast('Logo configured successfully! Click Save Profiles.', 'info');
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit all changes across workspace
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: User = {
      ...user,
      business: {
        name,
        logo,
        address,
        phone,
        email,
        website,
        defaultCurrency,
        defaultTaxRate: Number(defaultTaxRate) || 0,
        taxLabel: taxLabel || 'VAT',
        invoicePrefix: invoicePrefix || 'INV',
        nextInvoiceNumber: Number(nextInvoiceNumber) || 1,
        defaultPaymentTerms,
        defaultPaymentInstructions,
        defaultNotes,
        defaultTerms,
        brandColor,
        defaultTemplate
      }
    };

    saveUser(updatedUser);
    onUpdateUser(updatedUser);
    addToast('Workspace parameters updated successfully.', 'success');
  };

  // Export entire workspace backup (JSON)
  const handleExportBackup = () => {
    try {
      const backupData = {
        exportedAt: new Date().toISOString(),
        userId: user.id,
        userEmail: user.email,
        businessProfile: user.business,
        clients: getClients(user.id),
        invoices: getInvoices(user.id),
        receipts: getReceipts(user.id)
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `fides_billing_backup_${user.id}_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      addToast('Unified JSON data backup successfully exported.', 'success');
    } catch (err) {
      addToast('Data backup failed to export.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none font-sans text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent pb-1">
        <div className="font-sans">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
            Settings
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#888888] mt-1 font-medium">
            Configure your business profile, default billing preferences, and template designs.
          </p>
        </div>
      </div>

      {/* Grid containing options tabs left and details right */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Navigation panel tab cards */}
        <div className="lg:col-span-1 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl bg-white dark:bg-[#111111] p-2 flex flex-row lg:flex-col gap-1 overflow-x-auto select-none">
          {[
            { id: 'profile', label: 'Company Profile', icon: Building },
            { id: 'billing', label: 'Billing Defaults', icon: DollarSign },
            { id: 'appearance', label: 'Theme Styling', icon: Palette },
            { id: 'account', label: 'Secured Backups', icon: ShieldAlert }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 lg:flex-none h-9 px-3 text-xs font-semibold rounded-md transition-fides cursor-pointer text-left flex items-center gap-2 ${
                  isActive
                    ? 'bg-neutral-50 dark:bg-[#1C1C1C] text-orange-500 border border-neutral-100 dark:border-neutral-800'
                    : 'text-[#6B6B6B] dark:text-[#888888] hover:bg-neutral-50/50 dark:hover:bg-[#161616]/35 hover:text-primary animate-item'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Form Details Area (Right columns span) */}
        <div className="lg:col-span-3">
          <form onSubmit={handleSaveSettings} className="flex flex-col gap-5">
            
            {/* profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-5">
                <div>
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-1 text-heading">
                    Company Profile Identifiers
                  </h3>
                  <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888]">These variables populate the billing headers on templates automatically.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logo column */}
                  <div className="md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-secondary label">Company Logo branding</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-[#EBEBEB] dark:border-[#1E1E1E] group hover:border-orange-500 h-32 rounded-lg flex flex-col items-center justify-center p-3 cursor-pointer bg-neutral-50/50 dark:bg-neutral-900/50 relative overflow-hidden transition-fides"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                        accept="image/*"
                        className="hidden"
                      />
                      {logo ? (
                        <>
                          <img src={logo} alt="custom logo" className="h-full w-full object-contain p-1" />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setLogo(null);
                              addToast('Logo removed from identity assets.', 'info');
                            }}
                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-400 hover:text-red-500 hover:scale-105"
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="p-1.5 bg-white dark:bg-[#1E1E1E] border border-[#EBEBEB] dark:border-neutral-800 rounded mb-1 text-secondary">
                            <Upload size={14} />
                          </div>
                          <span className="text-[9px] text-secondary font-sans font-semibold">Upload brand logo</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Profile Fields Column */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-secondary label">Business Legal Name</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Apex Studio"
                          className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-secondary label">Direct phone contact</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 812 345"
                          className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-secondary label">Billing email contact</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="billing@apex.agency"
                          className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-medium text-secondary label">Direct website</label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="apex.agency"
                          className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-medium text-secondary label">Office address HQ</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="HQ Suites, Lagos"
                        rows={2}
                        className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 resize-none textarea text-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* billing Defaults Tab */}
            {activeTab === 'billing' && (
              <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-1 text-heading">
                    Global Invoicing Presets
                  </h3>
                  <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888]">Presets autoloaded during fresh creation. Individually overrides on drafts always.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Default currency layout</label>
                    <select
                      value={defaultCurrency}
                      onChange={(e) => setDefaultCurrency(e.target.value)}
                      className="h-8 px-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Default net payment limit terms</label>
                    <select
                      value={defaultPaymentTerms}
                      onChange={(e: any) => setDefaultPaymentTerms(e.target.value)}
                      className="h-8 px-2 text-xs bg-[#FFFFFF] dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary select"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 7">Net 7 Days</option>
                      <option value="Net 14">Net 14 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Tax Label indicator</label>
                    <input
                      type="text"
                      value={taxLabel}
                      onChange={(e) => setTaxLabel(e.target.value)}
                      placeholder="VAT"
                      className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-secondary label">Tax % rate preset</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={defaultTaxRate}
                      onChange={(e) => setDefaultTaxRate(Number(e.target.value))}
                      placeholder="7.5"
                      className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-[#6B6B6B] dark:text-[#888888] label">Prefix designation</label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      placeholder="INV"
                      className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary font-mono uppercase"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-medium text-[#6B6B6B] dark:text-[#888888] label">Next Starting Number</label>
                    <input
                      type="number"
                      min="1"
                      value={nextInvoiceNumber}
                      onChange={(e) => setNextInvoiceNumber(Math.max(1, Number(e.target.value)))}
                      className="h-8 px-3 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-secondary label">Transfer / Clearing info directives</label>
                  <textarea
                    value={defaultPaymentInstructions}
                    onChange={(e) => setDefaultPaymentInstructions(e.target.value)}
                    placeholder="Enter wire clearing accounts details..."
                    rows={2}
                    className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 font-mono text-primary"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-medium text-[#6B6B6B] dark:text-[#888888] label">Notes foot presets</label>
                  <textarea
                    value={defaultNotes}
                    onChange={(e) => setDefaultNotes(e.target.value)}
                    placeholder="Thank you for choosing Apex."
                    rows={2}
                    className="p-2 text-xs bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded focus:border-orange-500 text-primary text-body"
                  />
                </div>
              </div>
            )}

            {/* appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-1 text-heading">
                    Design Theme Presets
                  </h3>
                  <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888]">Determine signature alignments and signature visual palettes for brand templates.</p>
                </div>

                {/* Templates inline select */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { id: 'classic', title: 'Classic layout' },
                    { id: 'modern', title: 'Modern Band style' },
                    { id: 'minimal', title: 'Minimal typographic grid' }
                  ].map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => setDefaultTemplate(preset.id as any)}
                      className={`border p-3.5 rounded-lg text-xs leading-normal cursor-pointer transition-fides flex flex-col justify-between h-20 ${
                        defaultTemplate === preset.id
                          ? 'border-orange-500 bg-orange-50/5 dark:bg-orange-500/5'
                          : 'border-[#EBEBEB] dark:border-[#1E1E1E]'
                      }`}
                    >
                      <span className="font-semibold text-primary">{preset.title}</span>
                      {defaultTemplate === preset.id && <span className="text-[9px] text-orange-500">• Active Preset</span>}
                    </div>
                  ))}
                </div>

                {/* Brand Color selection overrides */}
                <div className="flex flex-col gap-1 pt-2">
                  <label className="text-xs text-secondary label">Master Theme Brand Accent Hex Specification</label>
                  <div className="flex items-center gap-2.5 mt-1 select-none">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-8 h-8 rounded border border-[#EBEBEB] dark:border-[#1E1E1E] cursor-pointer"
                    />
                    <span className="text-xs font-mono text-secondary uppercase">{brandColor}</span>
                  </div>
                </div>
              </div>
            )}

            {/* account Backups Tab */}
            {activeTab === 'account' && (
              <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-5 flex flex-col gap-4">
                <div>
                  <h3 className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] uppercase tracking-wider mb-1 text-heading">
                    Secured Data Portability Backups
                  </h3>
                  <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888]">Since Fides utilizes client-side isolated storage, please back up records periodically.</p>
                </div>

                <div className="p-4 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg bg-[#F7F7F7]/50 dark:bg-[#070707]/35 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-primary">Download Complete Registry Archive</span>
                    <span className="text-[9px] text-secondary">Export invoices ledger, receipt stacks, and client database logs as a unified JSON package download.</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="h-8 px-4 bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A] text-xs font-semibold rounded hover:opacity-90 select-none cursor-pointer flex items-center gap-1.5 transition-fides"
                  >
                    <Download size={12} />
                    <span>Download Backup JSON</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sticky Submission Buttons */}
            {activeTab !== 'account' && (
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="h-8 px-5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-semibold text-xs rounded-md transition-fides shadow-none cursor-pointer flex items-center gap-1.5 select-none"
                >
                  <Save size={12} />
                  <span>Update Workspace Presets</span>
                </button>
              </div>
            )}

          </form>
        </div>

      </section>

    </div>
  );
}
