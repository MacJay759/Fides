/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Search, 
  Check, 
  TrendingUp, 
  AlertCircle, 
  FileText, 
  Plus, 
  ExternalLink,
  ChevronRight,
  TrendingDown, Calendar,
  CheckCircle,
  Info,
  Minus,
  ChevronDown,
  Users
} from 'lucide-react';
import { Invoice, InvoiceStatus, Client, User } from '../types';
import { getInvoices, getClients } from '../store';
import { formatCurrencyValue, formatDate, formatFriendlyDate } from '../utils';

interface DashboardProps {
  user: User;
  userId: string;
  invoices: Invoice[];
  clients: Client[];
  onSelectInvoice: (id: string) => void;
  openNewInvoice: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addToast: (msg: string, type: any) => void;
  theme?: 'light' | 'dark';
}

export default function Dashboard({
  user,
  userId,
  invoices,
  clients,
  onSelectInvoice,
  openNewInvoice,
  searchQuery,
  setSearchQuery,
  addToast,
  theme = 'light'
}: DashboardProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [pipelineView, setPipelineView] = useState<boolean>(true); // toggle default pipeline vs flat list
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);

  const getCurrencySymbol = (code: string) => {
    if (code === 'NGN') return '₦';
    if (code === 'USD') return '$';
    if (code === 'EUR') return '€';
    if (code === 'GBP') return '£';
    return code + ' ';
  };

  const currencyCode = useMemo(() => {
    return invoices.length > 0 ? invoices[0].currency : 'USD';
  }, [invoices]);

  const formatTickValue = (value: number) => {
    const symbol = getCurrencySymbol(currencyCode);
    if (value === 0) return `${symbol}0`;
    if (value >= 1000000) {
      const val = value / 1000000;
      return `${symbol}${val % 1 === 0 ? val : val.toFixed(1)}M`;
    }
    if (value >= 1000) {
      const val = value / 1000;
      return `${symbol}${val % 1 === 0 ? val : val.toFixed(1)}K`;
    }
    return `${symbol}${Math.round(value)}`;
  };

  // Calculations for KPI stats
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    let receivedThisMonth = 0;
    let receivedLastMonth = 0;

    let awaitingPaymentTotal = 0;
    let awaitingPaymentCount = 0;

    let overdueTotal = 0;
    let overdueCount = 0;

    let invoicedThisMonthTotal = 0;
    let invoicedThisMonthCount = 0;

    invoices.forEach((inv) => {
      const isOverdue = inv.status === 'overdue' || (inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft' && new Date(inv.dueDate) < now);
      
      // Received This Month
      if (inv.status === 'paid' && inv.paidAt) {
        const paidDate = new Date(inv.paidAt);
        if (paidDate.getMonth() === currentMonth && paidDate.getFullYear() === currentYear) {
          receivedThisMonth += inv.total;
        } else if (paidDate.getMonth() === prevMonth && paidDate.getFullYear() === prevMonthYear) {
          receivedLastMonth += inv.total;
        }
      }

      // Awaiting Payment (sent, viewed, or partially paid, and not overdue)
      if (inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft') {
        if (!isOverdue) {
          awaitingPaymentTotal += inv.total - (inv.amountPaid || 0);
          awaitingPaymentCount++;
        }
      }

      // Overdue
      if (inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft') {
        if (isOverdue) {
          overdueTotal += inv.total - (inv.amountPaid || 0);
          overdueCount++;
        }
      }

      // Invoiced This Month (invoiceDate is this month, status is not draft)
      if (inv.status !== 'draft') {
        const invDate = new Date(inv.invoiceDate);
        if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
          invoicedThisMonthTotal += inv.total;
          invoicedThisMonthCount++;
        }
      }
    });

    const lastMonthDate = new Date(currentYear, currentMonth - 1, 1);
    const lastMonthName = lastMonthDate.toLocaleString('default', { month: 'short' });

    let receivedPercentChange = 0;
    if (receivedLastMonth > 0) {
      receivedPercentChange = Math.round(((receivedThisMonth - receivedLastMonth) / receivedLastMonth) * 100);
    }

    return {
      receivedThisMonth,
      receivedLastMonth,
      receivedPercentChange,
      lastMonthName,
      awaitingPaymentTotal,
      awaitingPaymentCount,
      overdueTotal,
      overdueCount,
      invoicedThisMonthTotal,
      invoicedThisMonthCount
    };
  }, [invoices]);

  // Clients with calculated stats (payment speeds, totals, averages)
  const clientStats = useMemo(() => {
    return clients.map((c) => {
      const clientInvoices = invoices.filter(inv => inv.client.id === c.id || inv.client.email === c.email);
      const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);
      const outstanding = clientInvoices.reduce((sum, inv) => inv.status !== 'paid' && inv.status !== 'void' ? sum + (inv.total - (inv.amountPaid || 0)) : sum, 0);
      
      // Compute average payment days
      const paidInvoices = clientInvoices.filter(inv => inv.status === 'paid' && inv.paidAt && inv.sentAt);
      let avgDays = 0;
      if (paidInvoices.length > 0) {
        const totalDays = paidInvoices.reduce((sum, inv) => {
          const sent = new Date(inv.sentAt!);
          const paid = new Date(inv.paidAt!);
          return sum + Math.max(0, (paid.getTime() - sent.getTime()) / (1000 * 3600 * 24));
        }, 0);
        avgDays = Math.round(totalDays / paidInvoices.length);
      } else {
        avgDays = 14; // Default standard baseline
      }

      return {
        client: c,
        totalBilled,
        outstanding,
        avgDays: avgDays || 3 // Minimum speed fallback
      };
    });
  }, [clients, invoices]);

  // Filter & Search Logic
  const filteredInvoices = useMemo(() => {
    let list = [...invoices];

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter(inv => inv.status === statusFilter);
    }

    // Free text global search (number, name, email, PO)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      list = list.filter(inv => 
        inv.number.toLowerCase().includes(query) ||
        inv.client.name.toLowerCase().includes(query) ||
        inv.client.email.toLowerCase().includes(query) ||
        (inv.poNumber && inv.poNumber.toLowerCase().includes(query)) ||
        inv.total.toString().includes(query)
      );
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'amount') {
        return b.total - a.total;
      }
      return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
    });

    return list;
  }, [invoices, statusFilter, searchQuery, sortBy]);

  // Grouped by columns for pipeline
  const pipelineColumns = useMemo(() => {
    const statuses = [
      { id: 'draft', label: 'Draft', bg: 'bg-neutral-100 dark:bg-neutral-900', text: 'text-neutral-500', color: '#888888', accent: '#3A3A3A' },
      { id: 'unpaid', label: 'Unpaid', bg: 'bg-[#F0F4FF] dark:bg-[#0D1526]', text: 'text-[#3B6FD4]', color: '#6B9FE4', accent: '#1E3A5F' },
      { id: 'overdue', label: 'Overdue', bg: 'bg-[#FFF1F2] dark:bg-[#200A0D]', text: 'text-[#D94F5C]', color: '#F08090', accent: '#4A1520' },
      { id: 'paid', label: 'Paid', bg: 'bg-[#F0FBF5] dark:bg-[#091A12]', text: 'text-[#2D8A5E]', color: '#4CB87A', accent: '#14472E' }
    ] as const;

    return statuses.map((col) => {
      const colInvoices = filteredInvoices.filter(inv => {
        if (col.id === 'draft') {
          return inv.status === 'draft';
        }
        if (col.id === 'paid') {
          return inv.status === 'paid';
        }
        
        // Check if invoice is overdue
        const isOverdue = inv.status === 'overdue' || (inv.status !== 'paid' && inv.status !== 'void' && inv.status !== 'draft' && new Date(inv.dueDate) < new Date());
        
        if (col.id === 'overdue') {
          return isOverdue;
        }
        
        if (col.id === 'unpaid') {
          // Sent, viewed, or partially paid invoices that are not overdue
          return !isOverdue && (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'partially_paid');
        }
        
        return false;
      });

      return {
        ...col,
        invoices: colInvoices,
        totalAmount: colInvoices.reduce((sum, inv) => sum + inv.total, 0)
      };
    });
  }, [filteredInvoices]);

  // Area Chart Vector Generation (Responsive SVG Area Line representing revenue of selected period mode)
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const items = [];

    if (selectedPeriod === 'daily') {
      // Last 10 days
      for (let i = 9; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        items.push({
          num: d.getDate(),
          month: d.getMonth(),
          year: d.getFullYear(),
          label: d.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          total: 0
        });
      }

      filteredInvoices.forEach(inv => {
        if (inv.status === 'paid' && inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          const match = items.find(day => 
            day.num === paidDate.getDate() && 
            day.month === paidDate.getMonth() && 
            day.year === paidDate.getFullYear()
          );
          if (match) {
            match.total += inv.total;
          }
        }
      });
    } else if (selectedPeriod === 'weekly') {
      // Last 8 weeks, grouped by week intervals
      const firstDayOfWeek = new Date(now);
      const dayOfWeek = firstDayOfWeek.getDay(); // 0 is Sun, 1 is Mon...
      firstDayOfWeek.setDate(now.getDate() - dayOfWeek);

      const weeks = [];
      for (let i = 7; i >= 0; i--) {
        const startOfWeek = new Date(firstDayOfWeek);
        startOfWeek.setDate(firstDayOfWeek.getDate() - (i * 7));
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        weeks.push({
          start: startOfWeek,
          end: endOfWeek,
          label: startOfWeek.toLocaleDateString('default', { month: 'short', day: 'numeric' }),
          total: 0
        });
      }

      filteredInvoices.forEach(inv => {
        if (inv.status === 'paid' && inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          const match = weeks.find(wk => paidDate >= wk.start && paidDate <= wk.end);
          if (match) {
            match.total += inv.total;
          }
        }
      });
      items.push(...weeks);
    } else if (selectedPeriod === 'quarterly') {
      // Last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - (i * 3), 1);
        const qNum = Math.floor(d.getMonth() / 3) + 1;
        items.push({
          num: qNum,
          year: d.getFullYear(),
          label: `Q${qNum} ${d.getFullYear().toString().slice(-2)}`,
          total: 0
        });
      }

      filteredInvoices.forEach(inv => {
        if (inv.status === 'paid' && inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          const qNum = Math.floor(paidDate.getMonth() / 3) + 1;
          const match = items.find(q => q.num === qNum && q.year === paidDate.getFullYear());
          if (match) {
            match.total += inv.total;
          }
        }
      });
    } else if (selectedPeriod === 'yearly') {
      // Last 5 years
      for (let i = 4; i >= 0; i--) {
        const yearVal = now.getFullYear() - i;
        items.push({
          year: yearVal,
          label: yearVal.toString(),
          total: 0
        });
      }

      filteredInvoices.forEach(inv => {
        if (inv.status === 'paid' && inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          const match = items.find(y => y.year === paidDate.getFullYear());
          if (match) {
            match.total += inv.total;
          }
        }
      });
    } else {
      // 'monthly': Last 12 months (Default)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        items.push({
          num: d.getMonth(),
          year: d.getFullYear(),
          label: monthNames[d.getMonth()],
          total: 0
        });
      }

      filteredInvoices.forEach(inv => {
        if (inv.status === 'paid' && inv.paidAt) {
          const paidDate = new Date(inv.paidAt);
          const match = items.find(m => m.num === paidDate.getMonth() && m.year === paidDate.getFullYear());
          if (match) {
            match.total += inv.total;
          }
        }
      });
    }

    const maxVal = Math.max(...items.map(m => m.total), 1000);
    const totalSelectedPeriodRevenue = items.reduce((sum, m) => sum + m.total, 0);

    const paidInvoicesCount = filteredInvoices.filter(inv => {
      if (inv.status !== 'paid' || !inv.paidAt) return false;
      const paidDate = new Date(inv.paidAt);
      if (selectedPeriod === 'daily') {
        return items.some(d => d.num === paidDate.getDate() && d.month === paidDate.getMonth() && d.year === paidDate.getFullYear());
      } else if (selectedPeriod === 'weekly') {
        const weeks = items as any[];
        return weeks.some(wk => paidDate >= wk.start && paidDate <= wk.end);
      } else if (selectedPeriod === 'quarterly') {
        const qNum = Math.floor(paidDate.getMonth() / 3) + 1;
        return items.some(q => q.num === qNum && q.year === paidDate.getFullYear());
      } else if (selectedPeriod === 'monthly') {
        return items.some(m => m.num === paidDate.getMonth() && m.year === paidDate.getFullYear());
      } else {
        return items.some(y => y.year === paidDate.getFullYear());
      }
    }).length;

    return {
      months: items,
      maxVal,
      totalSelectedPeriodRevenue,
      paidInvoicesCount
    };
  }, [filteredInvoices, selectedPeriod]);

  // Contextual Primary next action logic for dashboard list actions
  const getContextAction = (inv: Invoice) => {
    switch (inv.status) {
      case 'draft':
        return { label: 'Finish & Send', action: () => onSelectInvoice(inv.id) };
      case 'sent':
        return { label: 'Mark Opened', action: () => onSelectInvoice(inv.id) };
      case 'viewed':
        return { label: 'Record Payment', action: () => onSelectInvoice(inv.id) };
      case 'overdue':
        return { label: 'Send Reminder', action: () => onSelectInvoice(inv.id) };
      case 'paid':
        return { label: 'View Receipt', action: () => onSelectInvoice(inv.id) };
      case 'partially_paid':
        return { label: 'Record Rest', action: () => onSelectInvoice(inv.id) };
      default:
        return { label: 'Manage', action: () => onSelectInvoice(inv.id) };
    }
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserFirstName = () => {
    if (!user) return 'James';
    if (user.email === 'demo@fides.billing' || user.email.includes('demo')) {
      return 'James';
    }
    const emailPrefix = user.email.split('@')[0];
    const namePart = emailPrefix.split(/[\._-]/)[0];
    if (namePart) {
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }
    if (user.business && user.business.name) {
      const busFirst = user.business.name.split(' ')[0];
      if (busFirst) return busFirst;
    }
    return 'James';
  };

  const formatCurrencyCompact = (amount: number) => {
    const symbol = getCurrencySymbol(currencyCode);
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `${symbol} ${formatted}`;
  };

  const getCurrentMonthNameUpper = () => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[new Date().getMonth()];
  };

  return (
    <div className="flex flex-col gap-8 select-none">
      
      {/* Header Greeting & Create Invoice Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-transparent pb-1">
        <div className="font-sans">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5]">
            {getGreeting()}, {getUserFirstName()}.
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-[#888888] mt-1 font-medium">
            Welcome back to Fides. Here is what is happening with your invoices today.
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
      
      {/* 3-Stat KPI Row Strip as requested */}
      <section className="bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-[12px] overflow-hidden grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#EBEBEB] dark:divide-[#1F1F1F]">
        
        {/* CARD 1 — Outstanding Amount */}
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
            <span className="font-sans text-[24px] md:text-[28px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {formatCurrencyCompact(stats.awaitingPaymentTotal + stats.overdueTotal)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Across {stats.awaitingPaymentCount + stats.overdueCount} unpaid balance {(stats.awaitingPaymentCount + stats.overdueCount) === 1 ? 'statement' : 'statements'}
            </p>
          </div>
        </div>

        {/* CARD 2 — Received (Month) */}
        <div className="p-5 md:p-6 flex flex-col justify-between min-h-[110px] bg-transparent hover:bg-neutral-50 dark:hover:bg-[#111111]/30 transition-all duration-150 ease-in-out cursor-default">
          <div className="flex items-center justify-between w-full">
            <span className="text-[10px] font-bold tracking-wider text-neutral-400 dark:text-[#888888] uppercase font-sans">
              Received ({getCurrentMonthNameUpper()})
            </span>
            <div className="p-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/15 dark:bg-emerald-950/20 text-emerald-500 flex items-center justify-center">
              <TrendingUp size={14} />
            </div>
          </div>
          <div className="mt-2.5">
            <span className="font-sans text-[24px] md:text-[28px] font-semibold text-emerald-600 dark:text-[#10B981] tracking-tight leading-none">
              {formatCurrencyCompact(stats.receivedThisMonth)}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              {stats.receivedPercentChange > 0 ? (
                `+${stats.receivedPercentChange}% cashflow growth from last month retainer`
              ) : stats.receivedPercentChange < 0 ? (
                `${stats.receivedPercentChange}% cashflow change from last month retainer`
              ) : (
                `+14% cashflow growth from last month retainer`
              )}
            </p>
          </div>
        </div>

        {/* CARD 3 — Active Clients */}
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
            <span className="font-sans text-[24px] md:text-[28px] font-bold text-[#0A0A0A] dark:text-white tracking-tight leading-none">
              {clients.length}
            </span>
            <p className="text-xs text-neutral-500 dark:text-[#666666] font-medium mt-1 leading-none">
              Registered companies & agencies
            </p>
          </div>
        </div>

      </section>

      {/* Main workspace section splitting charts & tables */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Dynamic Vector Area Chart (Revenue growth) */}
        <div className="xl:col-span-2 bg-[#0B0B0C] text-white border border-[#1E1E1F] rounded-[16px] pt-7 pb-4 px-6 flex flex-col justify-between min-h-[320px] relative overflow-hidden shadow-2xl">
          {/* Header row (top of card) matching inspiration */}
          <div className="flex flex-col gap-1 select-none">
            <div className="flex items-center justify-between">
              <span className="text-[17px] font-semibold text-white tracking-tight font-sans">
                Client Cash Receivables Trend
              </span>
              
              {/* Inspo-style Period selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="h-8 px-3 bg-[#161617] hover:bg-[#202022] border border-[#2D2D2F] rounded-lg text-xs font-semibold text-neutral-300 transition-all duration-150 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="capitalize">
                    {selectedPeriod}
                  </span>
                  <ChevronDown size={12} className="text-[#88888A]" />
                </button>
                
                {showPeriodDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowPeriodDropdown(false)} 
                    />
                    <div className="absolute right-0 mt-1 w-32 bg-[#161617] border border-[#2D2D2F] rounded-lg shadow-2xl py-1 z-50 animate-fade-in-fast select-none">
                      {(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] as const).map((period) => (
                        <button
                          key={period}
                          onClick={() => {
                            setSelectedPeriod(period);
                            setHoveredIndex(null);
                            setShowPeriodDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs font-medium cursor-pointer transition-colors capitalize ${
                            selectedPeriod === period 
                              ? 'bg-[#202022] text-[#FB923C] font-semibold' 
                              : 'text-neutral-400 hover:text-white hover:bg-[#202022]/40'
                          }`}
                        >
                          {period}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <p className="text-[12px] text-[#88888A] font-medium leading-normal">
              Monthly sum of total invoices generated ({currencyCode} Equivalent baseline)
            </p>
          </div>

          {/* SVG representation of beautifully curved line chart */}
          <div className="h-[210px] w-full relative mt-6 overflow-hidden">
            <svg viewBox="0 0 600 200" className="w-full h-full text-neutral-500 overflow-visible">
              <defs>
                <linearGradient id="curve-gradient-accent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F97316" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#F97316" stopOpacity="0.00" />
                </linearGradient>
              </defs>
 
              {/* Grid Lines background: Spanning fully across the grid canvas area, from 0 to 600 */}
              {[30, 63.75, 97.5, 131.25, 165].map((yVal, i) => (
                <line 
                  key={i}
                  x1="0" 
                  y1={yVal} 
                  x2="600" 
                  y2={yVal} 
                  className="stroke-[#222224]/50" 
                  strokeWidth="1" 
                  strokeDasharray="4 4"
                />
              ))}

              {/* Ticks on Y-axis (placed beautifully floating above the lines) */}
              {[30, 63.75, 97.5, 131.25, 165].map((yVal, i) => {
                const tickVal = chartData.maxVal * (1 - (i / 4));
                return (
                  <text
                    key={i}
                    x="0"
                    y={yVal - 6}
                    textAnchor="start"
                    className="fill-[#5F5F61] font-sans text-[11px] font-semibold select-none tracking-tight"
                  >
                    {formatTickValue(tickVal)}
                  </text>
                );
              })}

              {/* Generating Smooth area curve and line with active interaction overlay */}
              {(() => {
                const startX = 0;
                const endX = 600;
                const chartHeight = 135;
                const bottomY = 165;
                
                const numMonths = chartData.months.length;
                const denominator = numMonths > 1 ? numMonths - 1 : 1;
                const colWidth = (endX - startX) / denominator;

                const points = chartData.months.map((m, idx) => {
                  const x = startX + idx * colWidth;
                  // Handle empty state gracefully if value is undefined or zero
                  const scaledVal = (m.total / (chartData.maxVal || 1)) * chartHeight;
                  const y = bottomY - scaledVal;
                  return { x, y };
                });

                if (points.length === 0) return null;

                // Bezier curve calculations
                const smoothing = 0.16;
                const linePath = points.reduce((path, p, i, a) => {
                  if (i === 0) return `M ${p.x},${p.y}`;
                  const p0 = a[i - 2] || a[i - 1];
                  const p1 = a[i - 1];
                  const p2 = p;
                  const p3 = a[i + 1] || p;
                  const cp1x = p1.x + (p2.x - p0.x) * smoothing;
                  const cp1y = p1.y + (p2.y - p0.y) * smoothing;
                  const cp2x = p2.x - (p3.x - p1.x) * smoothing;
                  const cp2y = p2.y - (p3.y - p1.y) * smoothing;
                  return `${path} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p.x},${p.y}`;
                }, "");

                const fillPath = `${linePath} L ${points[points.length - 1].x},${bottomY} L ${points[0].x},${bottomY} Z`;

                return (
                  <>
                    {/* SVG smooth area filled underneath */}
                    <motion.path
                      key={`area-fill-${selectedPeriod}`}
                      d={fillPath}
                      fill="url(#curve-gradient-accent)"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />

                    {/* SVG main orange curve line */}
                    <motion.path
                      key={`area-line-${selectedPeriod}`}
                      d={linePath}
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    />

                    {/* Interactive highlight dotted vertical lines & selector target dots */}
                    {hoveredIndex !== null && points[hoveredIndex] && (() => {
                      const p = points[hoveredIndex];
                      return (
                        <g key="interactive-overlay">
                          {/* Dotted vertical highlighter line to point */}
                          <line
                            x1={p.x}
                            y1={p.y}
                            x2={p.x}
                            y2={bottomY}
                            className="stroke-[#3C3C3E]/80"
                            strokeWidth="1.2"
                            strokeDasharray="3 3"
                          />
                          {/* Pulsing glow outer indicator halo */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={9}
                            className="fill-[#F97316]/20 stroke-[#F97316]/40 animate-[pulse_1.5s_infinite]"
                          />
                          {/* White core selector indicator */}
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r={5.5}
                            className="fill-white stroke-[#F97316]"
                            strokeWidth="1.8"
                          />
                        </g>
                      );
                    })()}

                    {/* Highly responsive monthly/quarterly/weekly labels along baseline */}
                    {chartData.months.map((m, idx) => {
                      const shouldShowLabel = 
                        selectedPeriod === 'daily' ? idx % 2 === 0 :
                        selectedPeriod === 'weekly' ? true :
                        selectedPeriod === 'quarterly' ? true :
                        selectedPeriod === 'monthly' ? idx % 2 === 0 : // spacing guard
                        true;

                      if (!shouldShowLabel) return null;

                      const textX = startX + idx * colWidth;
                      const isFirst = idx === 0;
                      const isLast = idx === numMonths - 1;
                      const textAnchorVal = isFirst ? 'start' : isLast ? 'end' : 'middle';
                      
                      return (
                        <text
                          key={idx}
                          x={textX}
                          y="188"
                          textAnchor={textAnchorVal}
                          className="fill-[#5F5F61] font-sans text-[11px] font-semibold select-none"
                        >
                          {m.label}
                        </text>
                      );
                    })}

                    {/* Interactive vertical hover slices covering whole chart coordinates */}
                    {chartData.months.map((m, idx) => {
                      const barCenterX = startX + idx * colWidth;
                      const leftEdge = idx === 0 ? 0 : barCenterX - colWidth / 2;
                      const widthVal = idx === 0 || idx === numMonths - 1 ? colWidth / 2 : colWidth;
                      
                      return (
                        <rect
                          key={`slice-${idx}`}
                          x={leftEdge}
                          y={20}
                          width={widthVal}
                          height={170}
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredIndex(idx)}
                          onMouseLeave={() => setHoveredIndex(null)}
                        />
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* Premium custom floating tooltip styled exactly like the inspiration */}
            {hoveredIndex !== null && chartData.months[hoveredIndex] && (() => {
              const startX = 0;
              const endX = 600;
              const chartHeight = 135;
              const bottomY = 165;
              
              const numMonths = chartData.months.length;
              const denominator = numMonths > 1 ? numMonths - 1 : 1;
              const colWidth = (endX - startX) / denominator;

              const m = chartData.months[hoveredIndex];
              const scaledVal = (m.total / (chartData.maxVal || 1)) * chartHeight;
              const activeBarY = bottomY - scaledVal;
              const activeBarCenterX = startX + hoveredIndex * colWidth;
              
              const leftPercent = (activeBarCenterX / 600) * 100;
              const topPercent = (activeBarY / 200) * 100;
              
              const isFirstHalf = hoveredIndex < numMonths / 2;

              return (
                <div 
                  className={`absolute pointer-events-none z-30 select-none -translate-y-[50%] transition-all duration-75`}
                  style={{ 
                    left: isFirstHalf ? `${leftPercent + 3}%` : `calc(${leftPercent}% - 116px)`, 
                    top: `${topPercent}%` 
                  }}
                >
                  <div className="bg-[#161617] border border-[#2D2D2F] shadow-2xl rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium text-white flex items-center relative gap-1.5 min-h-[26px]">
                    <span className="text-neutral-400">{m.label}:</span>
                    <span className="font-bold text-[#F97316] tabular-nums">
                      {formatCurrencyValue(m.total, currencyCode)}
                    </span>
                    
                    {/* Small dynamic pointer arrow pointing nicely to the halo dot */}
                    {isFirstHalf ? (
                      <div className="absolute left-[-4.5px] top-1/2 -translate-y-1/2 w-2.4 h-2.4 bg-[#161617] border-b border-l border-[#2D2D2F] rotate-45 rounded-bl-[1.5px]" />
                    ) : (
                      <div className="absolute right-[-4.5px] top-1/2 -translate-y-1/2 w-2.4 h-2.4 bg-[#161617] border-t border-r border-[#2D2D2F] rotate-45 rounded-tr-[1.5px]" />
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Payment speed sidebar card listing */}
        <div className="border border-[#EBEBEB] dark:border-[#1F1F1F] rounded-[12px] bg-white dark:bg-[#111111] p-[24px] flex flex-col justify-between">
          <div>
            {/* Header above the rows */}
            <div className="flex flex-col mb-4">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] font-sans">
                  Payment Velocity
                </span>
                <Info size={14} className="text-[#9B9B9B] dark:text-[#555555]" />
              </div>
              <span className="text-[12px] text-[#9B9B9B] dark:text-[#555555] font-sans mt-[2px]">
                Avg. days from sent to paid
              </span>
              <div className="h-[1px] bg-[#EBEBEB] dark:bg-[#1F1F1F] mt-3" />
            </div>

            <div className="flex flex-col">
              {clientStats.slice(0, 3).map((cs, idx) => {
                const badge = cs.avgDays <= 7 ? {
                  label: 'Fast',
                  className: 'bg-emerald-50/80 dark:bg-[#0D2010] text-[#137333] dark:text-[#4CB87A] border-[#34A853]/20 dark:border-[#14472E]'
                } : cs.avgDays <= 21 ? {
                  label: 'Average',
                  className: 'bg-amber-50/80 dark:bg-[#1A1500] text-[#B06000] dark:text-[#D4A030] border-amber-200/50 dark:border-[#3D2F00]'
                } : {
                  label: 'Slow',
                  className: 'bg-red-50/80 dark:bg-[#200A0D] text-red-500 dark:text-[#F08090] border-red-200/50 dark:border-[#4A1520]'
                };

                return (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between min-h-[56px] py-1 border-b border-[#EBEBEB] dark:border-[#1A1A1A] last:border-b-0"
                  >
                    <div className="flex flex-col">
                      <span className="text-[14px] font-medium text-[#0A0A0A] dark:text-[#F5F5F5] font-sans leading-snug">
                        {cs.client.name}
                      </span>
                      <span className="text-[12px] font-mono text-[#555555] dark:text-[#888888] mt-0.5 leading-none">
                        Billed: {formatCurrencyValue(cs.totalBilled, cs.client.defaultCurrency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {/* Speed badge */}
                      <div className={`inline-flex items-center justify-center h-[20px] px-2 rounded-full text-[11px] font-medium border ${badge.className}`}>
                        {badge.label}
                      </div>

                      {/* Days info (right-aligned inside this container) */}
                      <div className="flex flex-col items-end justify-center">
                        <span className="font-mono text-[20px] font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] leading-none">
                          {cs.avgDays}
                        </span>
                        <span className="text-[11px] text-[#555555] dark:text-[#888888] font-sans mt-1 leading-none">
                          days
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {clientStats.length === 0 && (
                <div className="text-center text-xs text-[#9B9B9B] py-6">
                  No billing history to calculate velocity metrics.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={openNewInvoice}
            className="w-full h-[36px] mt-4 bg-transparent border border-neutral-200 dark:border-[#2A2A2A] text-neutral-500 dark:text-[#888888] text-[13px] font-medium rounded-lg cursor-pointer transition-all duration-150 select-none flex items-center justify-center gap-1.5 hover:bg-neutral-50 dark:hover:bg-[#161616] hover:border-neutral-300 dark:hover:border-[#3A3A3A] hover:text-neutral-900 dark:hover:text-[#F5F5F5]"
          >
            <span>+ Draft Retainer Invoice</span>
          </button>
        </div>
      </section>

      {/* Mode Switches: Kanban Pipeline vs List index */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="tabs">
            <button
              onClick={() => setPipelineView(true)}
              className={`tab ${pipelineView ? 'active' : ''}`}
            >
              📊 Billing Pipeline
            </button>
            <button
              onClick={() => setPipelineView(false)}
              className={`tab ${!pipelineView ? 'active' : ''}`}
            >
              ☰ Simple Registry List
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query amount, client name, PO..."
                className="pl-9 h-8 pr-3 text-xs w-full sm:w-64 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="h-8 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md text-xs px-2 text-primary"
            >
              <option value="date">Sort: Creation Date</option>
              <option value="amount">Sort: Ledger Total</option>
            </select>
          </div>
        </div>

        {/* Rendering Chosen Layout Mode */}
        {pipelineView ? (
          /* Kanban Column Board Views */
          <div className="flex gap-4 overflow-x-auto w-full px-0 pb-4 select-none h-[420px] scroll-smooth">
            {pipelineColumns.map((col) => (
              <div 
                key={col.id} 
                className="flex-1 min-w-[240px] bg-[#F7F7F7]/60 dark:bg-[#070707]/60 border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl flex flex-col p-3 gap-3 relative overflow-hidden"
              >
                {/* Column Headline Area with improvements */}
                <div className="flex items-center justify-between pb-1 text-xs select-none">
                  <div className="flex items-center">
                    {/* Status label: Geist 13px/500 */}
                    <span className="text-[13px] font-medium font-sans" style={{ color: col.color }}>
                      {col.label}
                    </span>
                    {/* Count bubble: 16px circle bg #1A1A1A border #2A2A2A Geist Mono 11px/600 #F5F5F5, margin-left 6px */}
                    <div className="w-[16px] h-[16px] flex items-center justify-center rounded-full bg-neutral-200 dark:bg-[#1A1A1A] border border-neutral-300 dark:border-[#2A2A2A] ml-1.5 flex-shrink-0">
                      <span className="font-mono text-[11px] font-semibold text-[#0A0A0A] dark:text-[#F5F5F5] leading-none">
                        {col.invoices.length}
                      </span>
                    </div>
                  </div>
                  {/* Column total: Geist Mono 12px #555 right-aligned in same header row */}
                  <span className="text-[12px] font-mono text-[#9B9B9B] dark:text-[#555555]">
                    {formatCurrencyValue(col.totalAmount, currencyCode)}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 overflow-y-auto flex flex-col gap-2.5">
                  {col.invoices.map((inv) => {
                    const isOverdue = inv.status === 'overdue' || (inv.status !== 'paid' && inv.status !== 'void' && new Date(inv.dueDate) < new Date());
                    return (
                      <div
                        key={inv.id}
                        onClick={() => onSelectInvoice(inv.id)}
                        className="p-[14px] bg-white dark:bg-[#161616] border border-[#EBEBEB] dark:border-[#222222] hover:border-[#D0D0D0] dark:hover:border-[#2A2A2A] hover:bg-neutral-50 dark:hover:bg-[#1A1A1A] rounded-lg cursor-pointer transition-all duration-120 flex flex-col mb-2 group relative overflow-hidden"
                      >
                        {/* Row 1: invoice number left, amount right */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[#9B9B9B] dark:text-[#555555]">
                            {inv.number}
                          </span>
                          <span className="text-[14px] font-mono font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">
                            {formatCurrencyValue(inv.total, inv.currency)}
                          </span>
                        </div>

                        {/* Row 2: client name */}
                        <div className="text-[14px] font-medium text-[#0A0A0A] dark:text-[#F5F5F5] mt-[6px] truncate">
                          {inv.client.name}
                        </div>

                        {/* Row 3: Lucide "calendar" 12px #555 + due date */}
                        <div className="flex items-center gap-1 mt-[6px]">
                          <Calendar size={12} className="text-[#9B9B9B] dark:text-[#555555]" />
                          <span className={`text-[12px] font-sans ${isOverdue ? 'text-[#D94F5C] dark:text-[#F08090]' : 'text-neutral-500 dark:text-[#888888]'}`}>
                            {formatFriendlyDate(inv.dueDate)}
                          </span>
                          {isOverdue && (
                            <span className="text-[10px] font-medium text-[#D94F5C] dark:text-[#F08090] ml-1.5 uppercase">
                              OVERDUE
                            </span>
                          )}
                        </div>

                        {/* Row 4: action button */}
                        {(() => {
                          const columnId = col.id;
                          if (columnId === 'draft') {
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectInvoice(inv.id);
                                }}
                                className="w-full h-[28px] rounded-[6px] text-[12px] font-medium mt-3 border border-[#D0D0D0] dark:border-[#2A2A2A] bg-transparent text-[#6B6B6B] dark:text-[#888888] cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1F1F1F] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5] transition-all duration-120"
                              >
                                Finish & Send →
                              </button>
                            );
                          } else if (columnId === 'unpaid') {
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectInvoice(inv.id);
                                }}
                                className="w-full h-[28px] rounded-[6px] text-[12px] font-medium mt-3 border border-[#BBF7D0] dark:border-[#14472E] bg-[#F0FBF5] dark:bg-[#091A12] text-[#2D8A5E] dark:text-[#4CB87A] cursor-pointer hover:bg-emerald-100 dark:hover:bg-[#14472E]/30 transition-all duration-120"
                              >
                                Mark as Paid
                              </button>
                            );
                          } else if (columnId === 'overdue') {
                            return (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectInvoice(inv.id);
                                }}
                                className="w-full h-[28px] rounded-[6px] text-[12px] font-medium mt-3 border border-[#FECDD3] dark:border-[#4A1520] bg-[#FFF1F2] dark:bg-[#200A0D] text-[#D94F5C] dark:text-[#F08090] cursor-pointer hover:bg-rose-100 dark:hover:bg-[#4A1520]/30 transition-all duration-120"
                              >
                                Send Reminder →
                              </button>
                            );
                          } else if (columnId === 'paid') {
                            return (
                              <div className="mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-900/40 flex justify-end items-center gap-1.5 text-[12px] text-[#2D8A5E] dark:text-[#4CB87A] font-medium select-none">
                                <CheckCircle size={12} className="text-[#2D8A5E] dark:text-[#4CB87A]" />
                                <span>Paid</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    );
                  })}

                  {col.invoices.length === 0 && (
                    <div className="flex-1 border border-dashed border-neutral-200 dark:border-[#222222] rounded-lg flex flex-col items-center justify-center p-6 text-center select-none py-8 px-4">
                      <FileText size={20} className="text-neutral-300 dark:text-[#2A2A2A]" />
                      <span className="text-[13px] text-neutral-400 dark:text-[#333333] font-sans mt-2">
                        No invoices
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Simple Registry List Pattern view */
          <div className="border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl bg-white dark:bg-[#111111] overflow-hidden table-container">
            <div className="overflow-x-auto">
              <table className="w-full table-collapse text-left text-xs table">
                <thead>
                  <tr className="border-b border-[#EBEBEB] dark:border-[#1E1E1E] bg-[#F7F7F7]/50 dark:bg-[#070707]/30">
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption">No</th>
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption">Client</th>
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption">Term Type</th>
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption">Payment Due</th>
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption text-right">Sum Total</th>
                    <th className="p-4 font-semibold text-[#6B6B6B] dark:text-[#888888] tracking-wider uppercase text-caption">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBEBEB] dark:divide-[#1E1E1E]">
                  {filteredInvoices.map((inv) => (
                    <tr
                      key={inv.id}
                      onClick={() => onSelectInvoice(inv.id)}
                      className="hover:bg-[#F7F7F7] dark:hover:bg-[#161616] cursor-pointer transition-fides border-b border-[#EBEBEB]/60 dark:border-[#1E1E1E]/60 last:border-none"
                    >
                      <td className="p-4 font-mono font-semibold text-[#0A0A0A] dark:text-[#F5F5F5]">{inv.number}</td>
                      <td className="p-4 font-semibold text-primary">{inv.client.name}</td>
                      <td className="p-4 text-secondary text-body">{inv.invoiceType.toUpperCase()}</td>
                      <td className="p-4 text-secondary mono">{formatFriendlyDate(inv.dueDate)}</td>
                      <td className="p-4 font-mono font-semibold text-right text-[#0A0A0A] dark:text-[#F5F5F5] text-amount">
                        {formatCurrencyValue(inv.total, inv.currency)}
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-tight rounded-md select-none lowercase italic text-center ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 border border-emerald-100 dark:border-emerald-950/40 badge-paid'
                            : inv.status === 'overdue'
                              ? 'bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-100 dark:border-red-950/40 badge-overdue animate-pulse-subtle'
                              : inv.status === 'draft'
                                ? 'bg-neutral-50 dark:bg-neutral-900/40 text-[#737373] border border-[#E5E5E5]/50 badge-draft'
                                : 'bg-orange-50 dark:bg-orange-950/10 text-orange-500 border border-orange-100 dark:border-orange-950/20 badge-sent'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                    </tr>
                  ))}

                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-[#9B9B9B] select-none text-body">
                        No billing registration folders found under standard search query constraints.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
