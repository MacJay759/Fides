/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'overdue' | 'partially_paid' | 'paid' | 'void';

export type InvoiceTemplate = 'classic' | 'modern' | 'minimal';

export interface BusinessProfile {
  name: string;
  logo: string | null; // base64 string
  address: string;
  email: string;
  phone: string;
  website?: string;
  defaultCurrency: string;
  defaultTaxRate: number;
  taxLabel: string;
  invoicePrefix: string;
  nextInvoiceNumber: number;
  defaultPaymentTerms: string;
  defaultPaymentInstructions: string;
  defaultNotes: string;
  defaultTerms: string;
  brandColor: string;
  defaultTemplate: InvoiceTemplate;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  onboardingComplete: boolean;
  business: BusinessProfile;
}

export interface ClientSnapshot {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface BusinessSnapshot {
  name: string;
  logo: string | null;
  address: string;
  email: string;
  phone: string;
  website?: string;
}

export interface LineItem {
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  taxRate: number; // custom tax rate percentage
  amount: number; // auto-calculated qty * unitPrice + tax
}

export interface PaymentRecord {
  id: string;
  amount: number;
  method: string;
  reference: string;
  date: string;
  receiptId: string | null;
}

export interface RecurringConfig {
  enabled: boolean;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'custom';
  customDays: number | null;
  startDate: string;
  endDate: string | null;
  autoSend: boolean;
  nextDate: string | null;
  parentTemplateId: string | null;
}

export interface Invoice {
  id: string;
  userId: string;
  number: string;
  status: InvoiceStatus;
  template: InvoiceTemplate;
  brandColor: string;
  currency: string;
  invoiceType: 'invoice' | 'quote' | 'receipt';
  client: ClientSnapshot;
  from: BusinessSnapshot;
  invoiceDate: string;
  dueDate: string;
  poNumber: string | null;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  discount: { type: 'flat' | 'percent'; value: number } | null;
  total: number;
  paymentMethod: string;
  paymentInstructions: string;
  notes: string;
  terms: string;
  createdAt: string;
  updatedAt: string;
  sentAt: string | null;
  viewedAt: string | null;
  paidAt: string | null;
  voidedAt: string | null;
  payments: PaymentRecord[];
  amountPaid: number;
  balanceDue: number;
  recurring: RecurringConfig | null;
  receiptIds: string[];
  shareToken: string;
}

export interface Receipt {
  id: string;
  userId: string;
  invoiceId: string;
  number: string;
  receiptDate: string;
  paymentMethod: string;
  paymentReference: string;
  amountPaid: number;
  currency: string;
  template: InvoiceTemplate;
  brandColor: string;
  client: ClientSnapshot;
  from: BusinessSnapshot;
  items: LineItem[];
  subtotal: number;
  taxTotal: number;
  discount: { type: 'flat' | 'percent'; value: number } | null;
  total: number;
  notes: string;
  createdAt: string;
}

export interface Client {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  defaultCurrency: string;
  defaultPaymentTerms: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FidesSession {
  userId: string;
  email: string;
  expiresAt: string;
  rememberMe: boolean;
}
