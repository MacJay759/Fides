/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Invoice, Client, Receipt, FidesSession, InvoiceStatus } from './types';
import { generateId } from './utils';

const STORE_USERS_KEY = 'fides_users';
const STORE_INVOICES_KEY = 'fides_invoices';
const STORE_CLIENTS_KEY = 'fides_clients';
const STORE_RECEIPTS_KEY = 'fides_receipts';
const STORE_SESSION_KEY = 'fides_session';

// Setup Mock/Seed Data
export function initializeStorage() {
  const users = localStorage.getItem(STORE_USERS_KEY);
  if (!users) {
    // Standard Demo Profile
    const demoUser: User = {
      id: 'usr_demo',
      email: 'demo@fides.billing',
      passwordHash: 'ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f', // hash of "password"
      createdAt: new Date('2026-01-15T08:00:00Z').toISOString(),
      onboardingComplete: true,
      business: {
        name: 'Apex Digital Creative',
        logo: null,
        address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
        email: 'hello@apexdigital.agency',
        phone: '+234 812 345 6789',
        website: 'apexdigital.agency',
        defaultCurrency: 'NGN',
        defaultTaxRate: 7.5,
        taxLabel: 'VAT',
        invoicePrefix: 'ADC',
        nextInvoiceNumber: 105,
        defaultPaymentTerms: 'Net 14',
        defaultPaymentInstructions: 'Access Bank PLC\nAccount Name: Apex Digital Creative\nAccount Number: 0122345678\nSwift Code: ACCENGLa',
        defaultNotes: 'Thank you for your business. We appreciate your confidence in Apex!',
        defaultTerms: 'Payments are strictly due on or before specified due dates. Please support our 14-day speed rule.',
        brandColor: '#F97316', // Orange-500
        defaultTemplate: 'modern'
      }
    };

    const seedClients: Client[] = [
      {
        id: 'cli_acme',
        userId: 'usr_demo',
        name: 'Acme Laboratories',
        email: 'billing@acmelabs.com',
        phone: '+1 (555) 019-2831',
        address: '101 Science Blvd, Industrial Zone\nAustin, TX 78701',
        defaultCurrency: 'USD',
        defaultPaymentTerms: 'Net 14',
        notes: 'Premium enterprise client. Always prompt with payments.',
        createdAt: new Date('2026-02-01T10:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-01T10:00:00Z').toISOString()
      },
      {
        id: 'cli_starling',
        userId: 'usr_demo',
        name: 'Starling Tech Ltd',
        email: 'finance@starlingcss.co',
        phone: '+234 809 999 8888',
        address: 'Plot 12, Waterfront Promenade\nLekki Phase 1, Lagos',
        defaultCurrency: 'NGN',
        defaultPaymentTerms: 'Due on Receipt',
        notes: 'Fast-paced growth startup.',
        createdAt: new Date('2026-02-10T12:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-10T12:00:00Z').toISOString()
      },
      {
        id: 'cli_cyberlabs',
        userId: 'usr_demo',
        name: 'CyberLabs Global SA',
        email: 'accounts@cyberlabs.net',
        phone: '+44 20 7946 0192',
        address: 'Finsbury Pavement\nLondon, EC2A 1SE',
        defaultCurrency: 'EUR',
        defaultPaymentTerms: 'Net 30',
        notes: 'Development retainers.',
        createdAt: new Date('2026-02-28T09:00:00Z').toISOString(),
        updatedAt: new Date('2026-02-28T09:00:00Z').toISOString()
      }
    ];

    const seedInvoices: Invoice[] = [
      {
        id: 'inv_1',
        userId: 'usr_demo',
        number: 'ADC-101',
        status: 'paid',
        template: 'modern',
        brandColor: '#F97316',
        currency: 'NGN',
        invoiceType: 'invoice',
        client: {
          id: 'cli_starling',
          name: 'Starling Tech Ltd',
          email: 'finance@starlingcss.co',
          phone: '+234 809 999 8888',
          address: 'Plot 12, Waterfront Promenade\nLekki Phase 1, Lagos'
        },
        from: {
          name: 'Apex Digital Creative',
          logo: null,
          address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
          email: 'hello@apexdigital.agency',
          phone: '+234 812 345 6789',
          website: 'apexdigital.agency'
        },
        invoiceDate: '2026-05-01',
        dueDate: '2026-05-01',
        poNumber: 'PO-2026-092',
        items: [
          {
            id: 'item_1',
            description: 'E-commerce Redesign Strategy & Blueprint',
            qty: 1,
            unitPrice: 480000,
            taxRate: 7.5,
            amount: 516000
          },
          {
            id: 'item_2',
            description: 'Lottie Animations Interface Assets',
            qty: 4,
            unitPrice: 30000,
            taxRate: 7.5,
            amount: 129000
          }
        ],
        subtotal: 600000,
        taxTotal: 45000,
        discount: { type: 'flat', value: 45000 },
        total: 600000,
        paymentMethod: 'Bank Transfer',
        paymentInstructions: 'Access Bank PLC\nAccount Name: Apex Digital Creative\nAccount Number: 0122345678',
        notes: 'Monthly billing cycle. Paid in full.',
        terms: 'Access bank invoice regulations apply.',
        createdAt: '2026-05-01T14:22:00Z',
        updatedAt: '2026-05-02T09:15:00Z',
        sentAt: '2026-05-01T14:30:00Z',
        viewedAt: '2026-05-01T16:12:00Z',
        paidAt: '2026-05-02T09:15:00Z',
        voidedAt: null,
        payments: [
          {
            id: 'pay_1',
            amount: 600000,
            method: 'Bank Transfer',
            reference: 'TXN-902381023',
            date: '2026-05-02T09:15:00Z',
            receiptId: 'rec_seed1'
          }
        ],
        amountPaid: 600000,
        balanceDue: 0,
        recurring: null,
        receiptIds: ['rec_seed1'],
        shareToken: 'tok_paidinvoice'
      },
      {
        id: 'inv_2',
        userId: 'usr_demo',
        number: 'ADC-102',
        status: 'viewed',
        template: 'minimal',
        brandColor: '#F97316',
        currency: 'USD',
        invoiceType: 'invoice',
        client: {
          id: 'cli_acme',
          name: 'Acme Laboratories',
          email: 'billing@acmelabs.com',
          phone: '+1 (555) 019-2831',
          address: '101 Science Blvd, Industrial Zone\nAustin, TX 78701'
        },
        from: {
          name: 'Apex Digital Creative',
          logo: null,
          address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
          email: 'hello@apexdigital.agency',
          phone: '+234 812 345 6789',
          website: 'apexdigital.agency'
        },
        invoiceDate: '2026-05-18',
        dueDate: '2026-06-01',
        poNumber: '',
        items: [
          {
            id: 'item_3',
            description: 'Enterprise React Design System Engineering',
            qty: 40,
            unitPrice: 120,
            taxRate: 0,
            amount: 4800
          }
        ],
        subtotal: 4800,
        taxTotal: 0,
        discount: null,
        total: 4800,
        paymentMethod: 'PayPal',
        paymentInstructions: 'PayPal email: billing@apexdigital.agency',
        notes: 'Milestone 2 Delivery. Awaiting review.',
        terms: 'Net 14 payment protocol.',
        createdAt: '2026-05-18T10:00:00Z',
        updatedAt: '2026-05-18T10:15:00Z',
        sentAt: '2026-05-18T10:15:00Z',
        viewedAt: '2026-05-24T15:43:00Z', // viewed today!
        paidAt: null,
        voidedAt: null,
        payments: [],
        amountPaid: 0,
        balanceDue: 4800,
        recurring: null,
        receiptIds: [],
        shareToken: 'tok_viewedinvoice'
      },
      {
        id: 'inv_3',
        userId: 'usr_demo',
        number: 'ADC-103',
        status: 'overdue',
        template: 'classic',
        brandColor: '#F97316',
        currency: 'EUR',
        invoiceType: 'invoice',
        client: {
          id: 'cli_cyberlabs',
          name: 'CyberLabs Global SA',
          email: 'accounts@cyberlabs.net',
          phone: '+44 20 7946 0192',
          address: 'Finsbury Pavement\nLondon, EC2A 1SE'
        },
        from: {
          name: 'Apex Digital Creative',
          logo: null,
          address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
          email: 'hello@apexdigital.agency',
          phone: '+234 812 345 6789',
          website: 'apexdigital.agency'
        },
        invoiceDate: '2026-04-10',
        dueDate: '2026-04-24', // overdue!
        poNumber: '',
        items: [
          {
            id: 'item_4',
            description: 'UI Audits & Interaction Performance Optimization',
            qty: 1,
            unitPrice: 2400,
            taxRate: 20, // 20% VAT in UK/Europe
            amount: 2880
          }
        ],
        subtotal: 2400,
        taxTotal: 480,
        discount: null,
        total: 2880,
        paymentMethod: 'Bank Transfer',
        paymentInstructions: 'Apex Barclays BIC: BARCGB2L',
        notes: 'Please expedite payment. It is currently overdue by several weeks.',
        terms: 'Overdue accounts are subject to simple balance interest fines.',
        createdAt: '2026-04-10T11:00:00Z',
        updatedAt: '2026-04-10T11:05:00Z',
        sentAt: '2026-04-10T11:10:00Z',
        viewedAt: '2026-04-12T09:44:00Z',
        paidAt: null,
        voidedAt: null,
        payments: [],
        amountPaid: 0,
        balanceDue: 2880,
        recurring: null,
        receiptIds: [],
        shareToken: 'tok_overdueinvoice'
      },
      {
        id: 'inv_4',
        userId: 'usr_demo',
        number: 'ADC-104',
        status: 'draft',
        template: 'modern',
        brandColor: '#F97316',
        currency: 'NGN',
        invoiceType: 'invoice',
        client: {
          id: 'cli_starling',
          name: 'Starling Tech Ltd',
          email: 'finance@starlingcss.co',
          phone: '+234 809 999 8888',
          address: 'Plot 12, Waterfront Promenade\nLekki Phase 1, Lagos'
        },
        from: {
          name: 'Apex Digital Creative',
          logo: null,
          address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
          email: 'hello@apexdigital.agency',
          phone: '+234 812 345 6789',
          website: 'apexdigital.agency'
        },
        invoiceDate: '2026-05-24',
        dueDate: '2026-06-07',
        poNumber: '',
        items: [
          {
            id: 'item_5',
            description: 'Backend API Proxy Node Development Retainer (May)',
            qty: 1,
            unitPrice: 350000,
            taxRate: 7.5,
            amount: 376250
          }
        ],
        subtotal: 350000,
        taxTotal: 26250,
        discount: null,
        total: 376250,
        paymentMethod: 'Bank Transfer',
        paymentInstructions: 'Access Bank Account 0122345678',
        notes: 'Drafting current May client operations.',
        terms: 'Subject to standard service level agreements.',
        createdAt: '2026-05-24T09:00:00Z',
        updatedAt: '2026-05-24T09:30:00Z',
        sentAt: null,
        viewedAt: null,
        paidAt: null,
        voidedAt: null,
        payments: [],
        amountPaid: 0,
        balanceDue: 376250,
        recurring: {
          enabled: true,
          frequency: 'monthly',
          customDays: null,
          startDate: '2026-05-24',
          endDate: null,
          autoSend: false,
          nextDate: '2026-06-24',
          parentTemplateId: null
        },
        receiptIds: [],
        shareToken: 'tok_draftinvoice'
      }
    ];

    const seedReceipts: Receipt[] = [
      {
        id: 'rec_seed1',
        userId: 'usr_demo',
        invoiceId: 'inv_1',
        number: 'REC-101',
        receiptDate: '2026-05-02T09:15:00Z',
        paymentMethod: 'Bank Transfer',
        paymentReference: 'TXN-902381023',
        amountPaid: 600000,
        currency: 'NGN',
        template: 'modern',
        brandColor: '#F97316',
        client: {
          id: 'cli_starling',
          name: 'Starling Tech Ltd',
          email: 'finance@starlingcss.co',
          phone: '+234 809 999 8888',
          address: 'Plot 12, Waterfront Promenade\nLekki Phase 1, Lagos'
        },
        from: {
          name: 'Apex Digital Creative',
          logo: null,
          address: 'Suite 404, Creative Rail Plaza\nYaba, Lagos, Nigeria',
          email: 'hello@apexdigital.agency',
          phone: '+234 812 345 6789',
          website: 'apexdigital.agency'
        },
        items: [
          {
            id: 'item_1',
            description: 'E-commerce Redesign Strategy & Blueprint',
            qty: 1,
            unitPrice: 480000,
            taxRate: 7.5,
            amount: 516000
          },
          {
            id: 'item_2',
            description: 'Lottie Animations Interface Assets',
            qty: 4,
            unitPrice: 30000,
            taxRate: 7.5,
            amount: 129000
          }
        ],
        subtotal: 600000,
        taxTotal: 45000,
        discount: { type: 'flat', value: 45000 },
        total: 600000,
        notes: 'Monthly billing cycle. Paid in full. Access Bank Access TXN.',
        createdAt: '2026-05-02T09:15:00Z'
      }
    ];

    localStorage.setItem(STORE_USERS_KEY, JSON.stringify([demoUser]));
    localStorage.setItem(STORE_CLIENTS_KEY, JSON.stringify(seedClients));
    localStorage.setItem(STORE_INVOICES_KEY, JSON.stringify(seedInvoices));
    localStorage.setItem(STORE_RECEIPTS_KEY, JSON.stringify(seedReceipts));
    
    // Auto-login the demo session to give the user an amazing immediate landing!
    const defaultSession: FidesSession = {
      userId: 'usr_demo',
      email: 'demo@fides.billing',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true
    };
    localStorage.setItem(STORE_SESSION_KEY, JSON.stringify(defaultSession));
  }
}

// User Actions
export function getUsers(): User[] {
  initializeStorage();
  const users = localStorage.getItem(STORE_USERS_KEY);
  return users ? JSON.parse(users) : [];
}

export function saveUser(user: User) {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index !== -1) {
    users[index] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORE_USERS_KEY, JSON.stringify(users));
}

// Session Actions
export function getSession(): FidesSession | null {
  initializeStorage();
  const sessionStr = localStorage.getItem(STORE_SESSION_KEY);
  if (!sessionStr) return null;
  const session: FidesSession = JSON.parse(sessionStr);
  const expiry = new Date(session.expiresAt);
  if (expiry.getTime() < Date.now()) {
    localStorage.removeItem(STORE_SESSION_KEY);
    return null;
  }
  return session;
}

export function saveSession(session: FidesSession) {
  localStorage.setItem(STORE_SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORE_SESSION_KEY);
}

export function getActiveUser(): User | null {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  return users.find(u => u.id === session.userId) || null;
}

// Invoice Actions
export function getInvoices(userId: string): Invoice[] {
  initializeStorage();
  const invoicesStr = localStorage.getItem(STORE_INVOICES_KEY);
  if (!invoicesStr) return [];
  const invoices: Invoice[] = JSON.parse(invoicesStr);
  return invoices.filter(inv => inv.userId === userId);
}

export function saveInvoice(invoice: Invoice) {
  initializeStorage();
  const invoicesStr = localStorage.getItem(STORE_INVOICES_KEY);
  let invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
  const index = invoices.findIndex(inv => inv.id === invoice.id);
  
  if (index !== -1) {
    invoices[index] = invoice;
  } else {
    invoices.push(invoice);
  }
  localStorage.setItem(STORE_INVOICES_KEY, JSON.stringify(invoices));
}

export function deleteInvoice(invoiceId: string) {
  initializeStorage();
  const invoicesStr = localStorage.getItem(STORE_INVOICES_KEY);
  let invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
  invoices = invoices.filter(inv => inv.id !== invoiceId);
  localStorage.setItem(STORE_INVOICES_KEY, JSON.stringify(invoices));
}

// For no-auth client share page access to render correctly across boundaries
export function getInvoiceByShareToken(token: string): Invoice | null {
  initializeStorage();
  const invoicesStr = localStorage.getItem(STORE_INVOICES_KEY);
  if (!invoicesStr) return null;
  const invoices: Invoice[] = JSON.parse(invoicesStr);
  return invoices.find(inv => inv.shareToken === token || inv.id === token) || null;
}

// Client Actions
export function getClients(userId: string): Client[] {
  initializeStorage();
  const clientsStr = localStorage.getItem(STORE_CLIENTS_KEY);
  if (!clientsStr) return [];
  const clients: Client[] = JSON.parse(clientsStr);
  return clients.filter(cli => cli.userId === userId);
}

export function saveClient(client: Client) {
  initializeStorage();
  const clientsStr = localStorage.getItem(STORE_CLIENTS_KEY);
  let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
  const index = clients.findIndex(cli => cli.id === client.id);
  
  if (index !== -1) {
    clients[index] = client;
  } else {
    clients.push(client);
  }
  localStorage.setItem(STORE_CLIENTS_KEY, JSON.stringify(clients));
}

export function deleteClient(clientId: string) {
  initializeStorage();
  const clientsStr = localStorage.getItem(STORE_CLIENTS_KEY);
  let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
  clients = clients.filter(cli => cli.id !== clientId);
  localStorage.setItem(STORE_CLIENTS_KEY, JSON.stringify(clients));
}

// Receipt Actions
export function getReceipts(userId: string): Receipt[] {
  initializeStorage();
  const receiptsStr = localStorage.getItem(STORE_RECEIPTS_KEY);
  if (!receiptsStr) return [];
  const receipts: Receipt[] = JSON.parse(receiptsStr);
  return receipts.filter(rec => rec.userId === userId);
}

export function saveReceipt(receipt: Receipt) {
  initializeStorage();
  const receiptsStr = localStorage.getItem(STORE_RECEIPTS_KEY);
  let receipts: Receipt[] = receiptsStr ? JSON.parse(receiptsStr) : [];
  const index = receipts.findIndex(rec => rec.id === receipt.id);
  
  if (index !== -1) {
    receipts[index] = receipt;
  } else {
    receipts.push(receipt);
  }
  localStorage.setItem(STORE_RECEIPTS_KEY, JSON.stringify(receipts));
}

export function getReceiptById(receiptId: string): Receipt | null {
  initializeStorage();
  const receiptsStr = localStorage.getItem(STORE_RECEIPTS_KEY);
  if (!receiptsStr) return null;
  const receipts: Receipt[] = JSON.parse(receiptsStr);
  return receipts.find(rec => rec.id === receiptId) || null;
}
