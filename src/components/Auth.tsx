/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Building, ArrowRight } from 'lucide-react';
import { generateId, hashPassword } from '../utils';
import { saveUser, saveSession, getUsers, initializeStorage } from '../store';
import { User, FidesSession } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
  addToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export default function Auth({ onAuthSuccess, addToast }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !businessName)) {
      addToast('Please fill in all fields.', 'warning');
      return;
    }
    if (password.length < 8) {
      addToast('Password must be at least 8 characters long.', 'warning');
      return;
    }

    setLoading(true);
    try {
      initializeStorage();
      const pHash = await hashPassword(password);
      const existingUsers = getUsers();

      if (isLogin) {
        // Handle Login
        const user = existingUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          addToast('No business account found with this email.', 'error');
          setLoading(false);
          return;
        }

        if (user.passwordHash !== pHash) {
          addToast('Incorrect password. Please try again.', 'error');
          setLoading(false);
          return;
        }

        const sessionExpiry = new Date(
          Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
        ).toISOString();

        const session: FidesSession = {
          userId: user.id,
          email: user.email,
          expiresAt: sessionExpiry,
          rememberMe
        };

        saveSession(session);
        addToast(`Welcome back, ${user.business.name || 'User'}!`, 'success');
        onAuthSuccess(user);
      } else {
        // Handle Signup
        const emailExists = existingUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
        if (emailExists) {
          addToast('An account is already registered with this email.', 'error');
          setLoading(false);
          return;
        }

        const userId = generateId('usr');
        const newUser: User = {
          id: userId,
          email: email.toLowerCase(),
          passwordHash: pHash,
          createdAt: new Date().toISOString(),
          onboardingComplete: false,
          business: {
            name: businessName,
            logo: null,
            address: '',
            email: email.toLowerCase(),
            phone: '',
            website: '',
            defaultCurrency: 'USD',
            defaultTaxRate: 7.5,
            taxLabel: 'VAT',
            invoicePrefix: 'INV',
            nextInvoiceNumber: 1,
            defaultPaymentTerms: 'Due on Receipt',
            defaultPaymentInstructions: '',
            defaultNotes: 'Thank you for your business!',
            defaultTerms: 'Please pay within terms.',
            brandColor: '#F97316',
            defaultTemplate: 'modern'
          }
        };

        saveUser(newUser);

        const sessionExpiry = new Date(
          Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
        ).toISOString();

        const session: FidesSession = {
          userId,
          email: newUser.email,
          expiresAt: sessionExpiry,
          rememberMe
        };

        saveSession(session);
        addToast('Account created successfully!', 'success');
        onAuthSuccess(newUser);
      }
    } catch (err) {
      console.error(err);
      addToast('An unexpected authentication error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Skip Login directly to initialized Demo Workspace
  const handleQuickDemo = () => {
    initializeStorage();
    const existingUsers = getUsers();
    const demoUser = existingUsers.find(u => u.id === 'usr_demo');
    if (demoUser) {
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const session: FidesSession = {
        userId: 'usr_demo',
        email: demoUser.email,
        expiresAt: sessionExpiry,
        rememberMe: true
      };
      saveSession(session);
      addToast('Demo account logged in successfully.', 'success');
      onAuthSuccess(demoUser);
    } else {
      addToast('Demo account was not initialized correctly.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Visual background lines to match premium minimal mood */}
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-orange-50/25 dark:from-orange-950/5 to-transparent pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[1px] h-[150vh] bg-neutral-100 dark:bg-neutral-900 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[1px] h-[150vh] bg-neutral-100 dark:bg-neutral-900 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 flex flex-col items-center">
        {/* Fides Elegant Logo Mark */}
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold tracking-tight select-none mb-6">
          F
        </div>

        <h1 className="text-xl font-semibold tracking-tight text-[#0A0A0A] dark:text-[#F5F5F5] mb-2 text-center text-title">
          {isLogin ? 'Welcome back to Fides' : 'Create your billing workspace'}
        </h1>
        <p className="text-xs text-[#6B6B6B] dark:text-[#888888] mb-8 text-center max-w-xs text-body">
          {isLogin 
            ? 'Access your unified client billing, invoicing, and instant receipt outputs.' 
            : 'Set up your professional billing identity in under twenty seconds.'}
        </p>

        {/* Auth Card Container */}
        <div className="w-full bg-white dark:bg-[#111111] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                  Business Name
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]">
                    <Building size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Apex Studio"
                    className="w-full h-9 pl-9 pr-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                Business Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="billing@yourbrand.com"
                  className="w-full h-9 pl-9 pr-3 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#0A0A0A] dark:text-[#F5F5F5] label">
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555]">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-9 pl-9 pr-10 text-sm bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E] rounded-md focus:border-orange-500 transition-fides font-sans text-primary select"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B9B9B] dark:text-[#555555] hover:text-[#0A0A0A] dark:hover:text-[#F5F5F5]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me & Forget Password details */}
            <div className="flex items-center justify-between mt-1 mb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 accent-orange-500 rounded bg-white dark:bg-[#0A0A0A] border border-[#EBEBEB] dark:border-[#1E1E1E]"
                />
                <span className="text-xs text-[#6B6B6B] dark:text-[#888888] font-sans">
                  Remember my session
                </span>
              </label>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-medium rounded-md text-sm transition-fides cursor-pointer flex items-center justify-center gap-1.5 select-none"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In to Workspace' : 'Build Free Workspace'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Prompt to shift modes */}
          <div className="mt-6 pt-4 border-t border-[#EBEBEB] dark:border-[#1E1E1E] text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword('');
              }}
              className="text-xs text-orange-500 hover:text-orange-600 font-medium transition-fides font-sans cursor-pointer"
            >
              {isLogin ? 'Need a new workspace? Create Account' : 'Already have a workspace? Login'}
            </button>
          </div>
        </div>

        {/* DEMO ACC PANEL (Extremely helpful for previewing and rating fides instantly!) */}
        <div className="w-full mt-4 flex flex-col gap-2">
          <button
            onClick={handleQuickDemo}
            className="w-full h-9 bg-neutral-100 hover:bg-neutral-200 dark:bg-[#1E1E1E] dark:hover:bg-[#2A2A2A] text-[#0A0A0A] dark:text-[#F5F5F5] border border-[#EBEBEB] dark:border-[#1E1E1E] text-xs font-medium rounded-md flex items-center justify-center gap-1.5 cursor-pointer select-none transition-fides"
          >
            <span>Explore Demo Account (Pre-loaded with Data)</span>
            <ArrowRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}
