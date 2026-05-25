/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Receipt, 
  Users, 
  Settings as SettingsIcon, 
  LogOut, 
  Search, 
  Sun, 
  Moon, 
  Grid2X2, 
  X,
  Plus,
  Bell,
  Sparkles,
  Menu,
  ChevronDown,
  Home,
  FileText
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openNewInvoice: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  alertsList: Array<{ id: string; text: string; action: () => void }>;
  onPreviewShare: () => void;
}

export default function Navbar({
  user,
  activeTab,
  setActiveTab,
  openNewInvoice,
  searchQuery,
  setSearchQuery,
  onLogout,
  theme,
  setTheme,
  alertsList,
  onPreviewShare
}: NavbarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (n: string) => {
    if (!n) return 'CO';
    const split = n.split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('fides_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'invoices', label: 'Invoices', icon: FileText },
    { id: 'receipts', label: 'Receipts', icon: Receipt },
    { id: 'clients', label: 'Clients', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#EBEBEB] dark:border-[#1E1E1E] bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md transition-colors duration-300 select-none">
      <div className="px-3 sm:px-4 lg:px-8 h-16 flex items-center justify-between md:grid md:grid-cols-3">
        
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2 cursor-pointer md:col-span-1 justify-self-start min-w-0" onClick={() => setActiveTab('dashboard')}>
          <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center text-white font-bold text-sm transition-transform hover:scale-105 active:scale-95 duration-150 flex-shrink-0">
            F
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5] font-sans truncate">
            Fides Billing
          </span>
        </div>

        {/* Center: Floating Pill Navigation (Reference Image Concept) */}
        <div className="hidden md:flex items-center justify-center md:col-span-1">
          <nav className="bg-neutral-100/80 dark:bg-[#0D0D0D]/90 border border-neutral-200/50 dark:border-[#1C1C1C] rounded-full p-1 flex items-center gap-1 shadow-sm transition-colors duration-200">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSearchQuery('');
                  }}
                  className={`h-8 px-4 rounded-full text-xs font-semibold cursor-pointer flex items-center gap-2 transition-all duration-150 relative leading-none select-none ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-[#1C1C1C] dark:text-[#F5F5F5] shadow-xs'
                      : 'text-neutral-500 hover:text-neutral-900 dark:text-[#888888] dark:hover:text-[#F5F5F5] hover:bg-neutral-200/50 dark:hover:bg-[#161616]/35 bg-transparent'
                  }`}
                >
                  <Icon size={14} className="shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions, Alerts, Profile & Theme */}
        <div className="hidden md:flex items-center justify-end gap-4 md:col-span-1">
          
          {/* Notifications Bell Alert */}
          <div ref={notifyRef} className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="p-2 bg-neutral-50 hover:bg-neutral-100 dark:bg-[#111111] dark:hover:bg-[#1A1A1A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-lg text-[#6B6B6B] dark:text-[#888888] hover:text-orange-500 transition-all cursor-pointer h-9 w-9 flex items-center justify-center relative"
            >
              <Bell size={14} />
              {alertsList.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 border border-white dark:border-[#0A0A0A] rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown menu */}
            {showNotificationMenu && (
              <div className="absolute right-0 top-11 w-64 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-2 z-50 text-xs">
                <div className="pb-2 mb-1 border-b border-[#EBEBEB] dark:border-[#1E1E1E] flex justify-between font-semibold px-1 text-primary">
                  <span>Task Alerts Pending</span>
                  <span className="font-mono text-orange-500">{alertsList.length}</span>
                </div>
                
                <div className="flex flex-col gap-1 overflow-y-auto max-h-48">
                  {alertsList.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => {
                        alert.action();
                        setShowNotificationMenu(false);
                      }}
                      className="w-full text-left p-2 hover:bg-neutral-50 dark:hover:bg-[#161616] rounded-lg transition-colors border border-transparent hover:border-[#EBEBEB]/80"
                    >
                      <p className="text-primary truncate font-medium leading-normal">{alert.text}</p>
                    </button>
                  ))}
                  {alertsList.length === 0 && (
                    <div className="p-4 text-center text-[10px] text-neutral-400">
                      No pending billing reminders.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile User avatar dropdown menu */}
          <div ref={profileRef} className="relative pl-1 border-l border-[#EBEBEB] dark:border-[#1E1E1E]">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2.5 py-1 rounded-lg hover:bg-neutral-50 dark:hover:bg-[#111111] cursor-pointer text-left transition-colors h-9"
            >
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                {getInitials(user.business.name)}
              </div>
              <ChevronDown size={11} className="text-secondary" />
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 top-11 w-48 bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-1.5 z-50 flex flex-col gap-1">
                <div className="px-2.5 py-1.5 border-b border-[#EBEBEB] dark:border-[#1E1E1E]">
                  <span className="text-xs font-bold text-[#0A0A0A] dark:text-[#F5F5F5] truncate block leading-tight">
                    {user.business.name || 'Apex Brand'}
                  </span>
                  <span className="text-[10px] text-[#9B9B9B] dark:text-[#555555] truncate block">
                    {user.email}
                  </span>
                </div>
                
                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full h-8 flex items-center gap-2 px-2.5 text-xs text-[#6B6B6B] dark:text-[#888888] hover:bg-neutral-50 dark:hover:bg-[#181818] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5] rounded-lg transition-colors cursor-pointer text-left"
                >
                  <SettingsIcon size={12} />
                  <span>Workspace Settings</span>
                </button>
                <div className="h-[1px] bg-[#EBEBEB] dark:bg-[#1E1E1E] my-0.5" />
                <button
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full h-8 flex items-center gap-2 px-2.5 text-xs text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/10 rounded-lg transition-colors cursor-pointer text-left font-semibold"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile controls: Burger trigger & small logos */}
        <div className="flex md:hidden items-center gap-2">
          {/* Burger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 h-10 w-10 bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-900 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 rounded-md text-[#0A0A0A] dark:text-white cursor-pointer transition-colors flex items-center justify-center"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

      </div>

      {/* Slide-out Mobile Navigation (Standard styled Drawer) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EBEBEB] dark:border-[#1E1E1E] bg-white dark:bg-[#0A0A0A] p-3 sm:p-4 flex flex-col gap-3 py-4 sm:py-6 relative z-50 max-h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col gap-1 text-xs sm:text-sm font-semibold tracking-tight">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Grid2X2 },
              { id: 'invoices', label: 'Invoices', icon: Receipt },
              { id: 'receipts', label: 'Receipts', icon: Receipt },
              { id: 'clients', label: 'Clients', icon: Users },
            ].map((sub) => {
              const isActive = activeTab === sub.id;
              const Icon = sub.icon;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab(sub.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 sm:p-3.5 hover:bg-neutral-50 dark:hover:bg-[#111111] rounded-lg text-left flex items-center gap-3 cursor-pointer font-semibold transition-all min-h-[44px] ${
                    isActive ? 'bg-orange-50/50 dark:bg-orange-500/5 text-orange-500' : 'text-[#6B6B6B] dark:text-[#888888]'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-[1px] bg-[#EBEBEB] dark:bg-[#1E1E1E] my-1 sm:my-2" />

          {/* Quick Creator */}
          <div className="flex flex-col text-xs sm:text-sm gap-2">
            <button
              onClick={() => {
                openNewInvoice();
                setMobileMenuOpen(false);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-3 sm:p-3.5 flex items-center justify-center gap-2 font-bold w-full min-h-[44px]"
            >
              <Plus size={14} />
              <span>Create Invoice</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('settings');
                setMobileMenuOpen(false);
              }}
              className="bg-neutral-100 dark:bg-[#111111] hover:bg-neutral-200 dark:hover:bg-[#1A1A1A] text-[#0A0A0A] dark:text-[#F5F5F5] rounded-lg p-3 sm:p-3.5 flex items-center justify-center gap-2 font-semibold w-full min-h-[44px]"
            >
              <SettingsIcon size={14} />
              <span>Settings</span>
            </button>
          </div>

          <button
            onClick={() => {
              onLogout();
              setMobileMenuOpen(false);
            }}
            className="p-3 sm:p-3.5 hover:bg-red-50 dark:hover:bg-red-950/10 text-red-500 rounded-lg text-left flex items-center gap-3 cursor-pointer text-xs sm:text-sm font-bold min-h-[44px]"
          >
            <LogOut size={14} className="flex-shrink-0" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </header>
  );
}
