import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  Printer,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Filter,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { PettyCashAccount, PettyCashTransaction } from '../../types';
import { formatCurrencyPKR, printPettyCashLedger, printPettyCashVoucher, exportPettyCashToExcel } from '../../services/exportService';
import { IssueCashModal } from './IssueCashModal';
import { RecordExpenseModal } from './RecordExpenseModal';

export const PettyCashModule: React.FC = () => {
  const [accounts, setAccounts] = useState<PettyCashAccount[]>([]);
  const [transactions, setTransactions] = useState<PettyCashTransaction[]>([]);

  // Modals
  const [showIssueCashModal, setShowIssueCashModal] = useState(false);
  const [showRecordExpenseModal, setShowRecordExpenseModal] = useState(false);
  const [showConfirmClearModal, setShowConfirmClearModal] = useState(false);
  const [showEditFloatModal, setShowEditFloatModal] = useState(false);
  const [floatInputValue, setFloatInputValue] = useState('0');

  // Date Filtering State
  const [dateRangeFilter, setDateRangeFilter] = useState<'today' | 'yesterday' | 'month' | 'all' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = () => {
    const accs = storageService.getPettyCashAccounts();
    setAccounts(accs);
    setTransactions(storageService.getPettyCashTransactions());
  };

  useEffect(() => {
    loadData();
    const unsubscribe = subscribeStorage(loadData);
    return () => unsubscribe();
  }, []);

  const primaryAccount = accounts[0] || {
    id: 'pca-main',
    employeeId: 'emp-cashier',
    employeeName: 'Factory Cashier',
    department: 'Main Cashier',
    openingBalance: 0,
    currentBalance: 0,
    totalCashIssued: 0,
    totalExpenses: 0,
    totalReimbursements: 0,
    minBalanceAlert: 5000,
    status: 'Active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Starting Float adjustment handlers
  const handleOpenEditFloat = () => {
    setFloatInputValue((primaryAccount.openingBalance || 0).toString());
    setShowEditFloatModal(true);
  };

  const handleSaveStartingFloat = (amount: number) => {
    if (!storageService.hasPermission('canManagePettyCash')) {
      showToast('Permission Denied: Requires Petty Cash Management permission.', 'error');
      return;
    }
    storageService.setAccountOpeningBalance(primaryAccount.id, amount);
    loadData();
    setShowEditFloatModal(false);
    showToast(`Starting Float set to Rs. ${amount.toLocaleString()}. All ledger balances recalculated!`);
  };

  const handleResetFloatToZero = () => {
    if (!storageService.hasPermission('canManagePettyCash')) {
      showToast('Permission Denied: Requires Petty Cash Management permission.', 'error');
      return;
    }
    if (confirm('Reset starting float to Rs. 0? All balances will recalculate purely from recorded Money In and Money Out entries.')) {
      storageService.setAccountOpeningBalance(primaryAccount.id, 0);
      loadData();
      showToast('Starting float reset to Rs. 0 and all ledger balances verified!');
    }
  };

  // + Money In Handler
  const handleIssueCash = (data: {
    accountId: string;
    date: string;
    time: string;
    manualVoucherNumber: string;
    amount: number;
    reason: string;
    paymentMethod: string;
    notes?: string;
    approvedBy?: string;
    createdBy: string;
  }) => {
    if (!storageService.hasPermission('canManagePettyCash')) {
      showToast('Permission Denied: Money In requires Petty Cash Management permission.', 'error');
      return;
    }
    const tx = storageService.issueCash({
      ...data,
      accountId: primaryAccount.id,
    });
    loadData();
    showToast(`Money In: Added Rs. ${data.amount.toLocaleString()} to Petty Cash (Voucher: ${tx.voucherNumber})`);
  };

  // - Money Out Handler
  const handleRecordExpense = (data: {
    accountId: string;
    date: string;
    time: string;
    manualVoucherNumber: string;
    categoryId?: string;
    categoryName: string;
    description: string;
    vendorId?: string;
    vendorName?: string;
    amount: number;
    paymentMethod: string;
    notes?: string;
    receipts?: any[];
    approvedBy?: string;
    createdBy: string;
  }) => {
    if (!storageService.hasPermission('canManagePettyCash')) {
      showToast('Permission Denied: Money Out requires Petty Cash Management permission.', 'error');
      return;
    }
    const tx = storageService.recordExpense({
      ...data,
      accountId: primaryAccount.id,
    });
    loadData();
    showToast(`Money Out: Recorded expense of Rs. ${data.amount.toLocaleString()} (Voucher: ${tx.voucherNumber})`);
  };

  // Clear All Balance Handler
  const handleClearAllPettyCash = () => {
    if (!storageService.hasPermission('canManageSettings')) {
      showToast('Permission Denied: Clearing petty cash ledger requires Settings permission.', 'error');
      return;
    }
    storageService.clearPettyCashData();
    loadData();
    setShowConfirmClearModal(false);
    showToast('All petty cash transactions cleared and balance reset to Rs. 0.');
  };

  // Delete Single Transaction
  const handleDeleteTx = (id: string) => {
    if (!storageService.hasPermission('canManagePettyCash')) {
      showToast('Permission Denied: Cannot delete petty cash entries.', 'error');
      return;
    }
    if (confirm('Are you sure you want to delete this petty cash entry? All subsequent balances will be cleanly recalculated with ZERO residual effect.')) {
      storageService.deletePettyCashTransaction(id);
      loadData();
      showToast('Entry deleted and ledger balances recalculated successfully with zero residual effect.');
    }
  };

  // Date Filter Logic
  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  const filteredTransactions = transactions.filter((t) => {
    if (dateRangeFilter === 'today') {
      return t.date === todayStr;
    }
    if (dateRangeFilter === 'yesterday') {
      return t.date === yesterdayStr;
    }
    if (dateRangeFilter === 'month') {
      return t.date.startsWith(currentMonthPrefix);
    }
    if (dateRangeFilter === 'custom') {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    }
    return true; // 'all'
  });

  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayMoneyIn = todayTransactions.reduce((sum, t) => sum + t.cashReceived, 0);
  const todayMoneyOut = todayTransactions.reduce((sum, t) => sum + t.cashPaid, 0);
  const totalMoneyInFiltered = filteredTransactions.reduce((sum, t) => sum + t.cashReceived, 0);
  const totalMoneyOutFiltered = filteredTransactions.reduce((sum, t) => sum + t.cashPaid, 0);

  const settings = storageService.getSettings();

  const handlePrintTodayExpenses = () => {
    if (todayTransactions.length === 0) {
      alert('No entries (Money In or Money Out) recorded for today (' + todayStr + ').');
      return;
    }
    printPettyCashLedger(
      todayTransactions,
      primaryAccount,
      settings,
      `Today's Petty Cash Day-Book / Ledger (${todayStr})`
    );
  };

  const handlePrintFilteredLedger = () => {
    printPettyCashLedger(
      filteredTransactions,
      primaryAccount,
      settings,
      dateRangeFilter === 'today'
        ? `Today's Petty Cash Statement (${todayStr})`
        : `Petty Cash Ledger Statement (${filteredTransactions.length} records)`
    );
  };

  const handleExportToExcel = () => {
    if (filteredTransactions.length === 0) {
      showToast('No transactions to export for the selected filter.', 'error');
      return;
    }
    const reportTitle =
      dateRangeFilter === 'today'
        ? `Today's Petty Cash Ledger (${todayStr})`
        : dateRangeFilter === 'yesterday'
        ? `Yesterday's Petty Cash Ledger (${yesterdayStr})`
        : dateRangeFilter === 'month'
        ? 'Monthly Petty Cash Statement'
        : dateRangeFilter === 'custom'
        ? `Petty Cash Statement (${startDate || 'Start'} to ${endDate || 'End'})`
        : 'Complete Petty Cash Ledger Register';

    exportPettyCashToExcel(filteredTransactions, settings, reportTitle, primaryAccount);
    showToast('Petty cash ledger exported to Excel successfully!');
  };

  const handleRecalculateBalances = () => {
    storageService.recalculatePettyCashBalances();
    loadData();
    showToast('All petty cash ledger balances recalculated and verified successfully!');
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 text-sm font-bold text-white transition-all animate-in slide-in-from-top-5 duration-200 ${
            toast.type === 'success' ? 'bg-emerald-600 border-emerald-400' : 'bg-rose-600 border-rose-400'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Wallet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Factory Petty Cash
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Simple Cash In & Out Ledger — Saleem Daal Factory, Ghala Mandi, Faisalabad
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRecalculateBalances()}
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition flex items-center gap-2"
            title="Recalculate and synchronize all chronological ledger balances"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            Recalculate Balances
          </button>
          <button
            onClick={() => setShowConfirmClearModal(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-rose-950/60 hover:border-rose-700 text-slate-300 hover:text-rose-300 text-xs font-bold transition flex items-center gap-2"
            title="Clear petty cash balance & wipe history"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            Clear All Balance
          </button>
        </div>
      </div>

      {/* Hero Section: Current Balance & Money In / Money Out Options Right On Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Large Current Balance Display */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 p-6 sm:p-7 rounded-3xl border border-emerald-900/50 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400/90">
                Current Petty Cash Balance
              </span>
              <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                Live Float
              </span>
            </div>
            <div className="text-4xl sm:text-5xl font-black tracking-tight text-white my-1">
              {formatCurrencyPKR(primaryAccount.currentBalance)}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-400">
              <span>Starting Float: <strong className="text-slate-200">{formatCurrencyPKR(primaryAccount.openingBalance || 0)}</strong></span>
              <button
                onClick={handleOpenEditFloat}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-medium"
                title="Change or set the starting cash float"
              >
                Set Float
              </button>
              {(primaryAccount.openingBalance || 0) > 0 && (
                <button
                  onClick={handleResetFloatToZero}
                  className="text-[11px] text-amber-400 hover:text-amber-300 underline font-medium"
                  title="Reset starting float to 0 if an old deleted transaction corrupted it"
                >
                  (Reset to 0)
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">
              {primaryAccount.currentBalance === 0
                ? 'Balance is Rs. 0. Use + Money In to deposit funds.'
                : 'Available cash ready for daily operational payouts.'}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400 mt-4">
            <div>
              <span>Today's In:</span>{' '}
              <span className="font-bold text-emerald-400">
                {formatCurrencyPKR(todayMoneyIn)}
              </span>
            </div>
            <div className="text-right">
              <span>Today's Out:</span>{' '}
              <span className="font-bold text-rose-400">
                {formatCurrencyPKR(todayMoneyOut)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2 & 3: Money In & Money Out Direct Big Action Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Money In Card */}
          <button
            onClick={() => {
              if (!storageService.hasPermission('canManagePettyCash')) {
                showToast('Permission Denied: Money In requires Petty Cash Management permission.', 'error');
                return;
              }
              setShowIssueCashModal(true);
            }}
            className="group relative bg-emerald-600 hover:bg-emerald-500 text-white p-6 rounded-3xl shadow-lg border border-emerald-500 transition-all transform active:scale-95 text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Plus className="w-6 h-6 text-white stroke-[3]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  + Add Cash
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Money In
              </h3>
              <p className="text-xs text-emerald-100 mt-1">
                Receive cash, add opening float, or transfer funds into Petty Cash drawer.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-emerald-400/30 flex items-center justify-between text-xs font-bold text-emerald-100">
              <span>Click to add funds</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>

          {/* Money Out Card */}
          <button
            onClick={() => {
              if (!storageService.hasPermission('canManagePettyCash')) {
                showToast('Permission Denied: Money Out requires Petty Cash Management permission.', 'error');
                return;
              }
              setShowRecordExpenseModal(true);
            }}
            className="group relative bg-rose-600 hover:bg-rose-500 text-white p-6 rounded-3xl shadow-lg border border-rose-500 transition-all transform active:scale-95 text-left flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <ArrowDownRight className="w-6 h-6 text-white stroke-[3]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full">
                  - Pay Expense
                </span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">
                Money Out
              </h3>
              <p className="text-xs text-rose-100 mt-1">
                Record factory expenses, tea, repair, freight, stationery, or labor payouts.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-rose-400/30 flex items-center justify-between text-xs font-bold text-rose-100">
              <span>Click to record payout</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </button>
        </div>
      </div>

      {/* Date Filtering Bar & Print Section */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filter & Print Ledger Statement
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Filter cash transactions by date or print today's expenses report directly
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePrintTodayExpenses}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              title="Print all entries for today (Money In and Money Out)"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              Print Today's Entries (In & Out: {todayTransactions.length})
            </button>

            <button
              onClick={handlePrintFilteredLedger}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center gap-2 border border-slate-300 dark:border-slate-600 transition"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              Print Filtered Ledger ({filteredTransactions.length})
            </button>

            <button
              onClick={handleExportToExcel}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              title="Export petty cash ledger to Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Export to Excel ({filteredTransactions.length})
            </button>
          </div>
        </div>

        {/* Date Filter Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">
            Quick Filter:
          </span>
          <button
            onClick={() => setDateRangeFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateRangeFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            All Records
          </button>
          <button
            onClick={() => setDateRangeFilter('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateRangeFilter === 'today'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            Today ({todayStr})
          </button>
          <button
            onClick={() => setDateRangeFilter('yesterday')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateRangeFilter === 'yesterday'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            Yesterday ({yesterdayStr})
          </button>
          <button
            onClick={() => setDateRangeFilter('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateRangeFilter === 'month'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateRangeFilter('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              dateRangeFilter === 'custom'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
            }`}
          >
            Custom Dates
          </button>

          {dateRangeFilter === 'custom' && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Running Ledger Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="p-4 px-6 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Petty Cash Running Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filteredTransactions.length} transaction entries
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 text-xs font-bold mr-1">
              <span className="text-emerald-600">Total In: {formatCurrencyPKR(totalMoneyInFiltered)}</span>
              <span className="text-rose-600">Total Out: {formatCurrencyPKR(totalMoneyOutFiltered)}</span>
            </div>
            <button
              onClick={handleExportToExcel}
              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition"
              title="Download Excel Sheet (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Excel
            </button>
            <button
              onClick={handleRecalculateBalances}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1 border border-slate-300 dark:border-slate-600 transition"
              title="Recalculate and verify chronological ledger balances"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-500" />
              Recalculate
            </button>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 dark:text-slate-500 space-y-3">
            <Wallet className="w-12 h-12 mx-auto stroke-1 text-slate-300 dark:text-slate-600" />
            <p className="font-bold text-sm">No Petty Cash Transactions Found</p>
            <p className="text-xs text-slate-500">
              Use the <strong className="text-emerald-600">+ Money In</strong> button to add funds or{' '}
              <strong className="text-rose-600">- Money Out</strong> to pay expenses.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="p-3.5 pl-6"># / Date</th>
                  <th className="p-3.5">Voucher #</th>
                  <th className="p-3.5">Manual Voucher #</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Particulars / Source</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right text-emerald-600">Cash In (+)</th>
                  <th className="p-3.5 text-right text-rose-600">Cash Out (-)</th>
                  <th className="p-3.5 text-right">Balance</th>
                  <th className="p-3.5 pr-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 font-medium text-slate-800 dark:text-slate-200">
                {filteredTransactions.map((tx, idx) => {
                  const isCashIn = tx.cashReceived > 0;
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="p-3.5 pl-6 font-semibold">
                        <div className="text-slate-900 dark:text-white">{tx.date}</div>
                        <div className="text-[10px] text-slate-400">{tx.time || '12:00'}</div>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tx.voucherNumber}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-700 dark:text-amber-400">
                        {tx.manualVoucherNumber || '-'}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            isCashIn
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {isCashIn ? 'Money In' : 'Money Out'}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                        {tx.description || tx.reason || '-'}
                        {tx.vendorName && <div className="text-[10px] font-normal text-slate-400">Paid to: {tx.vendorName}</div>}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">
                        {tx.categoryName || (isCashIn ? 'Cash Advance / Deposit' : 'General Expense')}
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-600 dark:text-emerald-400">
                        {isCashIn ? formatCurrencyPKR(tx.cashReceived) : '-'}
                      </td>
                      <td className="p-3.5 text-right font-black text-rose-600 dark:text-rose-400">
                        {!isCashIn ? formatCurrencyPKR(tx.cashPaid) : '-'}
                      </td>
                      <td className="p-3.5 text-right font-black text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/40">
                        {formatCurrencyPKR(tx.runningBalance)}
                      </td>
                      <td className="p-3.5 pr-6 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => printPettyCashVoucher(tx, settings)}
                            title="Print Voucher"
                            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTx(tx.id)}
                            title="Delete Entry"
                            className="p-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Set / Adjust Starting Float Modal */}
      {showEditFloatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400">
              <Wallet className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Set Starting Cash Float
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              The starting float is the initial physical cash in the drawer before any Money In / Money Out records. If you record all cash injections via <strong>+ Money In</strong>, keep this at <strong>Rs. 0</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Starting Float (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={floatInputValue}
                onChange={(e) => setFloatInputValue(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-cyan-500"
                placeholder="0"
                autoFocus
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => handleSaveStartingFloat(0)}
                className="text-xs font-semibold text-amber-600 hover:text-amber-700 dark:text-amber-400 underline"
              >
                Set to Rs. 0
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditFloatModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStartingFloat(Number(floatInputValue) || 0)}
                  className="px-4 py-2 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-md"
                >
                  Save & Recalculate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showConfirmClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-rose-200 dark:border-rose-900">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Clear All Petty Cash Data?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This will erase all petty cash Money In and Money Out entries and reset the current balance to <strong>Rs. 0</strong>.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmClearModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleClearAllPettyCash}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                Yes, Wipe & Reset to Rs. 0
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <IssueCashModal
        accounts={[primaryAccount]}
        isOpen={showIssueCashModal}
        onClose={() => setShowIssueCashModal(false)}
        onSubmit={handleIssueCash}
      />

      <RecordExpenseModal
        accounts={[primaryAccount]}
        categories={storageService.getPettyCashCategories()}
        vendors={storageService.getPettyCashVendors()}
        isOpen={showRecordExpenseModal}
        onClose={() => setShowRecordExpenseModal(false)}
        onSubmit={handleRecordExpense}
      />
    </div>
  );
};
