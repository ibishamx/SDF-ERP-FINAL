import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle2,
  Wallet,
  Boxes,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  Users,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  TrendingUp,
  PackageCheck,
  Layers,
  RotateCcw,
} from 'lucide-react';
import { Cheque } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrencyPKR } from '../../services/exportService';
import { useLanguage } from '../../context/LanguageContext';

interface DashboardKPIsProps {
  cheques: Cheque[];
  onSelectTab: (tab: string) => void;
  onOpenAddCheque?: () => void;
  onOpenClearCheque?: () => void;
  onOpenReturnCheque?: () => void;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({
  cheques,
  onSelectTab,
  onOpenAddCheque,
  onOpenClearCheque,
  onOpenReturnCheque,
}) => {
  const { t, lang } = useLanguage();

  // Cheque Data
  const activeCheques = cheques.filter((c) => !c.isDeleted);
  const totalChequesCount = activeCheques.length;
  const totalChequesAmount = activeCheques.reduce((sum, c) => sum + c.amount, 0);

  const outstandingCheques = activeCheques.filter((c) => c.status === 'Outstanding');
  const outstandingCount = outstandingCheques.length;
  const outstandingAmount = outstandingCheques.reduce((sum, c) => sum + c.amount, 0);

  const clearedCheques = activeCheques.filter((c) => c.status === 'Cleared');
  const clearedCount = clearedCheques.length;
  const clearedAmount = clearedCheques.reduce((sum, c) => sum + c.amount, 0);

  // Petty Cash Data
  const pcAccounts = storageService.getPettyCashAccounts();
  const pcTransactions = storageService.getPettyCashTransactions();
  const primaryAccount = pcAccounts[0] || { currentBalance: 0 };
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = pcTransactions
    .filter((t) => t.date === todayStr && t.cashPaid > 0)
    .reduce((sum, t) => sum + t.cashPaid, 0);

  // Stock Data
  const items = storageService.getItems();
  const dispatches = storageService.getDispatches();
  const parties = storageService.getParties();
  const banks = storageService.getBanks();

  return (
    <div className="space-y-6">
      {/* Minimalist Top Header Greeting */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {lang === 'ur' ? 'تمام ماڈیول ایکٹو ہیں' : 'All Modules Active'}
            </span>
            <span className="text-xs text-slate-400 font-medium">Saleem Daal Factory, Faisalabad</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {t('factoryDashboard')}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'ur'
              ? 'چیکس، خام مال اسٹاک اور کیش دراز کا آسان ترین ڈیش بورڈ'
              : 'Direct & fast control across Cheques, Raw Material Stock, and Petty Cash'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectTab('cheques')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" />
            {t('cheques')}
          </button>
          <button
            onClick={() => onSelectTab('stock')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5"
          >
            <Boxes className="w-4 h-4" />
            {t('stock')}
          </button>
          <button
            onClick={() => onSelectTab('pettyCash')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center gap-1.5"
          >
            <Wallet className="w-4 h-4" />
            {t('pettyCash')}
          </button>
        </div>
      </div>

      {/* 3 Core Modules Main Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module 1: Cheque Management */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:border-blue-300 dark:hover:border-blue-800 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-100 dark:border-blue-900">
                  <FileText className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Cheque Management
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">Customer Receivables</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                {totalChequesCount} Total
              </span>
            </div>

            {/* Key KPI Stats inside Cheque Module */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                  Outstanding
                </span>
                <span className="text-lg font-black text-rose-700 dark:text-rose-400">
                  {formatCurrencyPKR(outstandingAmount)}
                </span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                  {outstandingCount} Pending Cheques
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">
                  Cleared Value
                </span>
                <span className="text-lg font-black text-emerald-700 dark:text-emerald-400">
                  {formatCurrencyPKR(clearedAmount)}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold block mt-0.5">
                  {clearedCount} Vouchers Applied
                </span>
              </div>
            </div>
          </div>

          {/* Quick Prominent Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onOpenAddCheque ? onOpenAddCheque() : onSelectTab('cheques')}
                className="py-2.5 px-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[11px] font-black shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95"
                title="Add New Cheque"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>+ Add</span>
              </button>

              <button
                onClick={() => onOpenClearCheque ? onOpenClearCheque() : onSelectTab('cheques')}
                className="py-2.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[11px] font-black shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95"
                title="Clear Cheque with Voucher Number"
              >
                <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                <span>✓ Clear</span>
              </button>

              <button
                onClick={() => onOpenReturnCheque ? onOpenReturnCheque() : onSelectTab('cheques')}
                className="py-2.5 px-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-black shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95"
                title="Return Cheque (Party, Return Date, Voucher Number)"
              >
                <RotateCcw className="w-3.5 h-3.5 stroke-[3]" />
                <span>↩ Return</span>
              </button>
            </div>

            <button
              onClick={() => onSelectTab('cheques')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              Open Cheques Register <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module 2: Stock & Raw Material */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-100 dark:border-indigo-900">
                  <Boxes className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Stock & Raw Material
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">Daal & Grain Warehouse</span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {items.length} Items
              </span>
            </div>

            {/* Key KPI Stats inside Stock Module */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                  Stock Items
                </span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  {items.length} Daal Varieties
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  50kg & 25kg Bags
                </span>
              </div>

              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 block uppercase">
                  Dispatches
                </span>
                <span className="text-xl font-black text-indigo-700 dark:text-indigo-400">
                  {dispatches.length} Entries
                </span>
                <span className="text-[10px] text-indigo-500 font-semibold block mt-0.5">
                  Gate Passes Logged
                </span>
              </div>
            </div>
          </div>

          {/* Quick Prominent Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onSelectTab('stock')}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              + Create Stock Dispatch Gate Pass
            </button>

            <button
              onClick={() => onSelectTab('stock')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              Open Stock Warehouse <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Module 3: Petty Cash Drawer */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-5 hover:border-emerald-300 dark:hover:border-emerald-800 transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-100 dark:border-emerald-900">
                  <Wallet className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h2 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {t('pettyCash')}
                  </h2>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {lang === 'ur' ? 'دکان دراز کیش' : 'Daily Factory Cashier'}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {lang === 'ur' ? 'لائیو کیش' : 'Live Float'}
              </span>
            </div>

            {/* Key KPI Stats inside Petty Cash Module */}
            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase">
                  {lang === 'ur' ? 'موجودہ کیش' : 'Available Cash'}
                </span>
                <span className="text-xl font-black text-emerald-800 dark:text-emerald-300">
                  {formatCurrencyPKR(primaryAccount.currentBalance)}
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                  {lang === 'ur' ? 'دراز بیلنس' : 'Drawer Balance'}
                </span>
              </div>

              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 block uppercase">
                  {lang === 'ur' ? 'آج کے اخراجات' : "Today's Expenses"}
                </span>
                <span className="text-xl font-black text-rose-700 dark:text-rose-400">
                  {formatCurrencyPKR(todayExpenses)}
                </span>
                <span className="text-[10px] text-rose-500 font-semibold block mt-0.5">
                  {lang === 'ur' ? 'آج کی ادائیگی' : 'Paid Out Today'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Prominent Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSelectTab('pettycash')}
                className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                {lang === 'ur' ? '+ کیش موصول' : '+ Money In'}
              </button>

              <button
                onClick={() => onSelectTab('pettycash')}
                className="py-2.5 px-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1 transition-transform active:scale-95"
              >
                <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                {lang === 'ur' ? '- کیش خرچ' : '- Money Out'}
              </button>
            </div>

            <button
              onClick={() => onSelectTab('pettycash')}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
            >
              {lang === 'ur' ? 'پیٹی کیش رجسٹر کھولیں' : 'Open Petty Cash Ledger'} <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Master Data & System Navigation Minimalist Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Master Data & System Utilities
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => onSelectTab('parties')}
            className="p-3.5 bg-slate-50 hover:bg-blue-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-slate-400">{parties.length} Registered</span>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-blue-600">
              Parties & Customers
            </div>
            <div className="text-[10px] text-slate-400">Manage directory</div>
          </button>

          <button
            onClick={() => onSelectTab('banks')}
            className="p-3.5 bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <Building className="w-4 h-4 text-emerald-600" />
              <span className="text-[10px] font-bold text-slate-400">{banks.length} Banks</span>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-emerald-600">
              Banks & Cities
            </div>
            <div className="text-[10px] text-slate-400">Master database</div>
          </button>

          <button
            onClick={() => onSelectTab('reports')}
            className="p-3.5 bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
              <span className="text-[10px] font-bold text-slate-400">Print / Export</span>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-amber-600">
              Financial Reports
            </div>
            <div className="text-[10px] text-slate-400">Statements & PDFs</div>
          </button>

          <button
            onClick={() => onSelectTab('settings')}
            className="p-3.5 bg-slate-50 hover:bg-purple-50 dark:bg-slate-800/60 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 text-left transition group"
          >
            <div className="flex items-center justify-between">
              <Settings className="w-4 h-4 text-purple-600" />
              <span className="text-[10px] font-bold text-slate-400">System</span>
            </div>
            <div className="text-xs font-black text-slate-900 dark:text-white mt-1 group-hover:text-purple-600">
              Settings & Backups
            </div>
            <div className="text-[10px] text-slate-400">Database JSON export</div>
          </button>
        </div>
      </div>
    </div>
  );
};
