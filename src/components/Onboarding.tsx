/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Building, Globe, Brush, ArrowLeft, ArrowRight, Check, Upload, Trash2 } from 'lucide-react';
import { User, InvoiceTemplate } from '../types';
import { CURRENCIES } from '../utils';
import { saveUser } from '../store';

interface OnboardingProps {
  user: User;
  onComplete: (updatedUser: User) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function Onboarding({ user, onComplete, addToast }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Workspace Setup Form States
  const [logo, setLogo] = useState<string | null>(user.business.logo);
  const [name, setName] = useState(user.business.name || '');
  const [address, setAddress] = useState(user.business.address || '');
  const [phone, setPhone] = useState(user.business.phone || '');
  const [email, setEmail] = useState(user.business.email || '');
  const [website, setWebsite] = useState(user.business.website || '');

  // Billing Defaults Form States
  const [currency, setCurrency] = useState(user.business.defaultCurrency || 'USD');
  const [taxLabel, setTaxLabel] = useState(user.business.taxLabel || 'VAT');
  const [taxRate, setTaxRate] = useState<number>(user.business.defaultTaxRate ?? 7.5);
  const [paymentTerms, setPaymentTerms] = useState(user.business.defaultPaymentTerms || 'Due on Receipt');
  const [invoicePrefix, setInvoicePrefix] = useState(user.business.invoicePrefix || 'INV');

  // Appearance State
  const [themeTemplate, setThemeTemplate] = useState<InvoiceTemplate>(user.business.defaultTemplate || 'modern');
  const [brandColor, setBrandColor] = useState(user.business.brandColor || '#F97316');

  // Multi-step progression validation
  const nextStep = () => {
    if (step === 1 && !name) {
      addToast('Business Name is required to build invoices.', 'warning');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

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
        addToast('Logo uploaded successfully!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleLogoUpload(e.dataTransfer.files[0]);
    }
  };

  // Save changes and complete onboarding
  const handleComplete = (isSkipped: boolean = false) => {
    let updatedUser: User;
    if (isSkipped) {
      updatedUser = {
        ...user,
        onboardingComplete: true
      };
    } else {
      updatedUser = {
        ...user,
        onboardingComplete: true,
        business: {
          ...user.business,
          name,
          logo,
          address,
          phone,
          email,
          website,
          defaultCurrency: currency,
          taxLabel,
          defaultTaxRate: Number(taxRate) || 0,
          defaultPaymentTerms: paymentTerms,
          invoicePrefix,
          defaultTemplate: themeTemplate,
          brandColor
        }
      };
    }

    saveUser(updatedUser);
    onComplete(updatedUser);
    addToast(isSkipped ? 'Onboarding skipped. Standard defaults applied.' : 'Your billing identity is ready!', 'success');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-orange-50/25 dark:from-orange-950/5 to-transparent pointer-events-none" />

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header Setup Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white text-base font-bold">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5] font-sans">
              Identity Setup
            </span>
          </div>
          <button
            onClick={() => handleComplete(true)}
            className="text-xs text-[#6B6B6B] dark:text-[#888888] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5] font-medium transition-fides cursor-pointer select-none"
          >
            Skip for now &rarr;
          </button>
        </div>

        {/* Status Indicators / Steps */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { id: 1, label: 'Company Identity', icon: Building },
            { id: 2, label: 'Billing Preferences', icon: Globe },
            { id: 3, label: 'Aesthetic Style', icon: Brush }
          ].map((s) => {
            const IconComponent = s.icon;
            const isActive = step === s.id;
            const isCompleted = step > s.id;
            return (
              <div
                key={s.id}
                className={`border-b-2 pb-3 transition-fides flex flex-col md:flex-row items-start md:items-center gap-2 ${
                  isActive 
                    ? 'border-orange-500 text-orange-500' 
                    : isCompleted 
                      ? 'border-[#0A0A0A] dark:border-[#F5F5F5] text-[#0A0A0A] dark:text-[#F5F5F5]' 
                      : 'border-[#EBEBEB] dark:border-[#1E1E1E] text-[#9B9B9B] dark:text-[#555555]'
                }`}
              >
                <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                  isActive 
                    ? 'bg-orange-500 text-white' 
                    : isCompleted 
                      ? 'bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A]' 
                      : 'bg-neutral-100 dark:bg-[#1E1E1E]'
                }`}>
                  {isCompleted ? <Check size={10} /> : s.id}
                </div>
                <span className="text-xs font-medium tracking-tight hidden sm:inline text-body-md">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Main Wizards body container */}
        <div className="bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-6 sm:p-8 min-h-[380px] flex flex-col justify-between">
          
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-base font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-1 text-heading">
                    Let's establish your Business details
                  </h2>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#888888] text-body">
                    These metrics populate the seller area of every invoice automatically.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Logo Drag / Upload Column */}
                  <div className="md:col-span-1 flex flex-col gap-2">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Company Brand Logo
                    </label>
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className="border border-dashed border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-orange-400 dark:hover:border-orange-500 rounded-lg p-4 flex flex-col items-center justify-center gap-2 cursor-pointer h-36 bg-neutral-50/50 dark:bg-[#0A0A0A]/50 transition-fides text-center relative overflow-hidden group"
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
                          <img src={logo} alt="Business logo" className="h-full w-full object-contain p-1" />
                          <div className="absolute inset-0 bg-neutral-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-fides">
                            <Trash2 
                              size={16} 
                              className="text-white hover:text-red-400" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setLogo(null);
                                addToast('Logo cleared.', 'info');
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-2 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md text-[#6B6B6B] dark:text-[#888888]">
                            <Upload size={16} />
                          </div>
                          <span className="text-[10px] text-[#6B6B6B] dark:text-[#888888] select-none font-sans font-medium">
                            Drag or click to host
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Fields Column */}
                  <div className="md:col-span-2 flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                          Business Name*
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Apex Studio"
                          className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                          Phone Contact
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 80 000 000"
                          className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                          Billing Email
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="invoice@apex.com"
                          className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select font-sans"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                          Website
                        </label>
                        <input
                          type="text"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="apex.com"
                          className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                        Office Physical Address
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Suite 102, Design Hub, Lagos"
                        rows={2}
                        className="p-2 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select resize-none textarea"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-base font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-1 text-heading">
                    Billing Defaults & Calculations
                  </h2>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#888888] text-body">
                    Establish global standards. You can easily adjust these on individual invoices.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Default Currency Format
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 text-[#0A0A0A] dark:text-[#F5F5F5] select font-sans select-arrow"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Default Payment Net Terms
                    </label>
                    <select
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                      className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 text-[#0A0A0A] dark:text-[#F5F5F5] select font-sans"
                    >
                      <option value="Due on Receipt">Due on Receipt</option>
                      <option value="Net 7">Net 7 Days</option>
                      <option value="Net 14">Net 14 Days</option>
                      <option value="Net 30">Net 30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Tax Designation Label
                    </label>
                    <input
                      type="text"
                      value={taxLabel}
                      onChange={(e) => setTaxLabel(e.target.value)}
                      placeholder="e.g. VAT or GST"
                      className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Default Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={taxRate}
                      onChange={(e) => setTaxRate(Number(e.target.value))}
                      placeholder="7.5"
                      className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-mono text-primary select"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                      Invoice Prefix Designation
                    </label>
                    <input
                      type="text"
                      value={invoicePrefix}
                      onChange={(e) => setInvoicePrefix(e.target.value)}
                      placeholder="INV"
                      className="h-9 px-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-mono text-primary select text-transform:uppercase"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.12 }}
                className="flex flex-col gap-5"
              >
                <div>
                  <h2 className="text-base font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] mb-1 text-heading">
                    Pick your signature visual template
                  </h2>
                  <p className="text-xs text-[#6B6B6B] dark:text-[#888888] text-body">
                    Each template represents a unique layout and hierarchy, tailored to your professional type.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Classic Card */}
                  <div
                    onClick={() => setThemeTemplate('classic')}
                    className={`border rounded-lg p-4 cursor-pointer transition-fides flex flex-col justify-between h-44 ${
                      themeTemplate === 'classic'
                        ? 'border-orange-500 bg-orange-50/5 dark:bg-orange-500/5'
                        : 'border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">Classic</span>
                        {themeTemplate === 'classic' && <Check size={14} className="text-orange-500" />}
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888] font-sans">
                        Traditional grid. Alternating shaded rows. Perfect for corporate audits, law offices, and strict retainers.
                      </p>
                    </div>
                    {/* Visual Mock Representation */}
                    <div className="bg-neutral-100 dark:bg-neutral-900 h-10 rounded border border-[#EBEBEB] dark:border-[#1E1E1E] p-1 flex flex-col gap-1 justify-center">
                      <div className="h-1 bg-neutral-400 dark:bg-neutral-600 w-1/3 rounded" />
                      <div className="h-0.5 bg-neutral-300 dark:bg-neutral-700 w-full rounded" />
                      <div className="flex justify-between items-center text-[6px] text-neutral-400">
                        <span>● Description</span>
                        <span>$400</span>
                      </div>
                    </div>
                  </div>

                  {/* Modern Card */}
                  <div
                    onClick={() => setThemeTemplate('modern')}
                    className={`border rounded-lg p-4 cursor-pointer transition-fides flex flex-col justify-between h-44 ${
                      themeTemplate === 'modern'
                        ? 'border-orange-500 bg-orange-50/5 dark:bg-orange-500/5'
                        : 'border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">Modern</span>
                        {themeTemplate === 'modern' && <Check size={14} className="text-orange-500" />}
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888] font-sans">
                        Wide brand banner header. Clean floating block styling. Tailored for creative designers, agencies, and studios.
                      </p>
                    </div>
                    {/* Visual Mock representation */}
                    <div className="bg-neutral-100 dark:bg-neutral-900 h-10 rounded border border-[#EBEBEB] dark:border-[#1E1E1E] overflow-hidden flex flex-col justify-between">
                      <div className="h-3.5 bg-orange-500 w-full" />
                      <div className="p-1 flex justify-between items-center text-[6px] text-neutral-400">
                        <div className="h-1 bg-neutral-400 dark:bg-neutral-600 w-1/4 rounded" />
                        <span>$1,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimal Card */}
                  <div
                    onClick={() => setThemeTemplate('minimal')}
                    className={`border rounded-lg p-4 cursor-pointer transition-fides flex flex-col justify-between h-44 ${
                      themeTemplate === 'minimal'
                        ? 'border-orange-500 bg-orange-50/5 dark:bg-orange-500/5'
                        : 'border-[#EBEBEB] dark:border-[#1E1E1E] hover:border-neutral-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">Minimal</span>
                        {themeTemplate === 'minimal' && <Check size={14} className="text-orange-500" />}
                      </div>
                      <p className="text-[10px] text-[#6B6B6B] dark:text-[#888888] font-sans">
                        Stripped layout. heavy typographic whitespace. Dedicated spacing with Courier-Mono digits for tech-minded dev squads.
                      </p>
                    </div>
                    {/* Visual Mock representation */}
                    <div className="bg-neutral-100 dark:bg-neutral-900 h-10 rounded border border-[#EBEBEB] dark:border-[#1E1E1E] p-1 flex flex-col gap-1.5 justify-center">
                      <div className="flex justify-between">
                        <div className="h-1 bg-neutral-500 dark:bg-neutral-600 w-1/4 rounded" />
                        <div className="h-1 bg-neutral-500 dark:bg-neutral-600 w-8 rounded font-mono" />
                      </div>
                      <div className="flex justify-between text-[5px] text-neutral-400">
                        <span>Items 1</span>
                        <span>$12,000.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Color swatches override */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                    Your Brand Accent Signature Color
                  </span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="w-8 h-8 rounded border border-[#EBEBEB] dark:border-[#1E1E1E] cursor-pointer"
                    />
                    <span className="text-xs font-mono text-[#6B6B6B] dark:text-[#888888]">
                      {brandColor.toUpperCase()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions Row */}
          <div className="mt-8 pt-4 border-t border-[#EBEBEB] dark:border-[#1E1E1E] flex justify-between select-none">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`h-9 px-4 text-xs font-medium border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md transition-fides cursor-pointer flex items-center gap-1.5 select-none ${
                step === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F5F5F5] hover:bg-neutral-50 dark:hover:bg-[#111111]'
              }`}
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            {step < 3 ? (
              <button
                onClick={nextStep}
                className="h-9 px-4 text-xs font-medium bg-[#0A0A0A] dark:bg-[#F5F5F5] text-white dark:text-[#0A0A0A] rounded-md hover:opacity-90 select-none cursor-pointer flex items-center gap-1.5 transition-fides"
              >
                <span>Continue</span>
                <ArrowRight size={14} />
              </button>
            ) : (
              <button
                onClick={() => handleComplete(false)}
                className="h-9 px-5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md text-sm transition-fides select-none cursor-pointer flex items-center gap-1.5"
              >
                <span>Finalize Setup</span>
                <Check size={14} />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
