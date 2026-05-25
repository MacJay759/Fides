/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Building2, 
  Grid2X2, 
  Receipt, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Bell, 
  Sun, 
  Moon, 
  Share2, 
  Plus, 
  User, 
  Menu, 
  X,
  Sparkles
} from 'lucide-react';

// Core types & operations
import { User as UserType, Invoice, Client, Receipt as ReceiptType, InvoiceStatus } from './types';
import { getActiveUser, getInvoices, getClients, getReceipts, initializeStorage, clearSession, deleteInvoice } from './store';
import { CURRENCIES, formatDate } from './utils';

// Core Subcomponents
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import InvoiceList from './components/InvoiceList';
import ReceiptList from './components/ReceiptList';
import InvoiceBuilder from './components/InvoiceBuilder';
import InvoiceView from './components/InvoiceView';
import ClientManager from './components/ClientManager';
import Settings from './components/Settings';
import PublicShare from './components/PublicShare';

interface Toast {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Router tabs: 'dashboard' | 'invoices' | 'receipts' | 'clients' | 'settings' | 'public_share'
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [originTab, setOriginTab] = useState<string>('dashboard');
  
  // Custom states for builders and viewers
  const [builderInvoice, setBuilderInvoice] = useState<Invoice | null>(null);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [publicShareToken, setPublicShareToken] = useState<string>('');

  // Active loaded records (fetched from local storage)
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [receipts, setReceipts] = useState<ReceiptType[]>([]);

  // Search & Global state options
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return localStorage.getItem('fides_theme') === 'dark' ? 'dark' : 'light';
  });

  // Notifications bell dropdown states
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Standard toast trigger
  const addToast = (msg: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, msg, type }]);
    
    // Auto-dismiss after 3.2s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  // Synchronize storage records on component mounting or manual user logins
  const refreshWorkspaceData = (userId: string) => {
    setInvoices(getInvoices(userId));
    setClients(getClients(userId));
    setReceipts(getReceipts(userId));
  };

  // Overdue check trigger (comparative limit checker on page loads)
  const runOverdueCronChecker = (userId: string) => {
    let changed = false;
    const invList = getInvoices(userId);
    const now = new Date();

    invList.forEach(inv => {
      if (inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft') {
        const isPastDue = new Date(inv.dueDate) < now;
        if (isPastDue && inv.status !== 'overdue') {
          inv.status = 'overdue';
          changed = true;
        }
      }
    });

    if (changed) {
      // Save all updated invoices back to localStorage at once
      localStorage.setItem('fides_invoices', JSON.stringify(invList));
      setInvoices(invList);
      addToast('System auto-flagged outstanding overdue bills.', 'warning');
    }
  };

  // Initialize session and preloaded states
  useEffect(() => {
    initializeStorage();
    const active = getActiveUser();
    if (active) {
      setCurrentUser(active);
      refreshWorkspaceData(active.id);
      runOverdueCronChecker(active.id);
    }
    setInitialLoading(false);
  }, []);

  const handleAuthSuccess = (user: UserType) => {
    setCurrentUser(user);
    refreshWorkspaceData(user.id);
    runOverdueCronChecker(user.id);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setInvoices([]);
    setClients([]);
    setReceipts([]);
    addToast('Cleared session workspace.', 'info');
  };

  // Build temporary fresh drafts
  const handleOpenNewInvoice = () => {
    setBuilderInvoice(null);
    setViewInvoice(null);
    setOriginTab(activeTab);
    setActiveTab('builder_mode');
    addToast('Fresh draft card compiling.', 'info');
  };

  // Modify Draft Invoices
  const handleEditInvoice = (inv: Invoice) => {
    setBuilderInvoice(inv);
    setViewInvoice(null);
    setOriginTab(activeTab);
    setActiveTab('builder_mode');
  };

  // Inspect particular invoice
  const handleInspectInvoice = (id: string) => {
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setViewInvoice(inv);
      setBuilderInvoice(null);
      setOriginTab(activeTab);
      setActiveTab('view_mode');
    }
  };

  // Triggered direct sending modals
  const handleSendInvoice = (inv: Invoice) => {
    refreshWorkspaceData(currentUser!.id);
    handleInspectInvoice(inv.id);
  };

  // Delete individual invoice and refresh workspace lists
  const handleDeleteInvoice = (id: string) => {
    deleteInvoice(id);
    if (currentUser) {
      refreshWorkspaceData(currentUser.id);
    }
  };

  // Generated static alerts for Bell icons inside application panels
  const alertsList = useMemo(() => {
    const list = [];
    const now = new Date();

    // 1. Check for drafts past 7 days
    invoices.forEach(inv => {
      if (inv.status === 'draft') {
        const createdDate = new Date(inv.createdAt);
        const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 3600 * 24);
        if (diffDays > 7) {
          list.push({
            id: `drf_${inv.id}`,
            text: `Draft for ${inv.client.name} is older than a week.`,
            action: () => handleInspectInvoice(inv.id)
          });
        }
      }
    });

    // 2. Check for newly flagged overdues
    invoices.forEach(inv => {
      if (inv.status === 'overdue') {
        list.push({
          id: `ovd_${inv.id}`,
          text: `Invoice ${inv.number} is overdue. Sent reminder!`,
          action: () => handleInspectInvoice(inv.id)
        });
      }
    });

    return list;
  }, [invoices]);

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center font-sans tracking-tight">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs text-[#6B6B6B] dark:text-[#888888] font-medium uppercase tracking-widest">
          Securing credential indexes...
        </span>
      </div>
    );
  }

  // Handle client portal direct token previews
  if (publicShareToken) {
    return (
      <PublicShare 
        token={publicShareToken} 
        onClosePublicView={() => setPublicShareToken('')} 
      />
    );
  }

  // Auth gate check
  if (!currentUser) {
    return (
      <>
        <Auth onAuthSuccess={handleAuthSuccess} addToast={addToast} />
        {/* Render visible toasts */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none">
          {toasts.map(t => (
            <div
              key={t.id}
              className={`px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-none animate-bounce-subtle pointer-events-all ${
                t.type === 'error' ? 'border-red-500/20' : t.type === 'warning' ? 'border-amber-500/20' : 'border-neutral-800'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${
                t.type === 'success' ? 'bg-emerald-400' : t.type === 'error' ? 'bg-red-400' : t.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
              }`} />
              <span>{t.msg}</span>
            </div>
          ))}
        </div>
      </>
    );
  }

  // Onboarding wizard gate check
  if (!currentUser.onboardingComplete) {
    return (
      <Onboarding 
        user={currentUser} 
        onComplete={(updated) => {
          setCurrentUser(updated);
          refreshWorkspaceData(updated.id);
        }} 
        addToast={addToast} 
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-[#0A0A0A] dark:text-[#F5F5F5] font-sans antialiased overflow-x-hidden ${
      theme === 'dark' ? 'dark' : ''
    }`}>

      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openNewInvoice={handleOpenNewInvoice}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
        alertsList={alertsList}
        onPreviewShare={() => {
          if (invoices.length > 0) {
            setPublicShareToken(invoices[0].shareToken);
          } else {
            addToast('Please draft at least one invoice folder first!', 'warning');
          }
        }}
      />

      {/* Main Page scroll wrapper container */}
      <div className="flex-grow flex flex-col min-w-0 overflow-y-auto">
        
        {/* Dynamic workspace context route router rendering */}
        <main className="flex-1 p-3 sm:p-4 lg:p-8 scroll-smooth z-10 relative">
          <div className="max-w-7xl mx-auto w-full h-full">
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -3 }}
                transition={{ duration: 0.12 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    user={currentUser}
                    userId={currentUser.id}
                    invoices={invoices}
                    clients={clients}
                    onSelectInvoice={handleInspectInvoice}
                    openNewInvoice={handleOpenNewInvoice}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    addToast={addToast}
                    theme={theme}
                  />
                )}

                {activeTab === 'invoices' && (
                  <InvoiceList
                    userId={currentUser.id}
                    invoices={invoices}
                    clients={clients}
                    onSelectInvoice={handleInspectInvoice}
                    openNewInvoice={handleOpenNewInvoice}
                    onEditInvoice={handleEditInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'receipts' && (
                  <ReceiptList
                    userId={currentUser.id}
                    receipts={receipts}
                    onSelectReceipt={(recId) => {
                      const rec = receipts.find(r => r.id === recId);
                      if (rec && rec.invoiceId) {
                        handleInspectInvoice(rec.invoiceId);
                      }
                    }}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'clients' && (
                  <ClientManager
                    user={currentUser}
                    clients={clients}
                    invoices={invoices}
                    onRefreshClients={() => {
                      setClients(getClients(currentUser.id));
                    }}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'settings' && (
                  <Settings
                    user={currentUser}
                    onUpdateUser={(updated) => {
                      setCurrentUser(updated);
                    }}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'builder_mode' && (
                  <InvoiceBuilder
                    user={currentUser}
                    invoiceToEdit={builderInvoice}
                    onBackToDashboard={() => setActiveTab(originTab)}
                    onSendInvoice={handleSendInvoice}
                    addToast={addToast}
                  />
                )}

                {activeTab === 'view_mode' && viewInvoice && (
                  <InvoiceView
                    userId={currentUser.id}
                    invoice={viewInvoice}
                    onBackToDashboard={() => {
                      refreshWorkspaceData(currentUser.id);
                      setActiveTab(originTab);
                    }}
                    onEditInvoice={handleEditInvoice}
                    addToast={addToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>

          </div>
        </main>
      </div>

      {/* Render visible toasts (Relative bottom-right container) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none select-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`px-4 py-2.5 bg-neutral-900 border border-neutral-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-none animate-bounce-subtle pointer-events-all ${
              t.type === 'error' ? 'border-red-500/20' : t.type === 'warning' ? 'border-amber-500/20' : 'border-neutral-800'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${
              t.type === 'success' ? 'bg-emerald-400' : t.type === 'error' ? 'bg-red-400' : t.type === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
            }`} />
            <span>{t.msg}</span>
          </div>
        ))}
      </div>

    </div>
  );
}
