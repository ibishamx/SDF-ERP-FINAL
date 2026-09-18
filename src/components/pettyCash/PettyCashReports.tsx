import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar, TrendingDown, Wallet, UserCheck } from 'lucide-react';
import { PettyCashTransaction, PettyCashAccount, CompanySettings } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface PettyCashReportsProps {
  transactions: PettyCashTransaction[];
  accounts: PettyCashAccount[];
  settings: CompanySettings;
  onExportExcel: (txs: PettyCashTransaction[]) => void;
  onPrintLedger: (txs: PettyCashTransaction[]) => void;
}

export const PettyCashReports: React.FC<PettyCashReportsProps> = ({
  transactions,
  accounts,
  onExportExcel,
  onPrintLedger,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Filter transactions for report month and account
  const monthTransactions = transactions.filter((t) => {
    if (selectedAccountId && t.accountId !== selectedAccountId) return false;
    if (selectedMonth && !t.date.startsWith(selectedMonth)) return false;
    return true;
  });

  // Calculate Month Totals
  const totalReceivedMonth = monthTransactions.reduce((s, t) => s + t.cashReceived, 0);
  const totalPaidMonth = monthTransactions.reduce((s, t) => s + t.cashPaid, 0);

  // Category Aggregation
  const categorySummary: Record<string, { total: number; count: number }> = {};
  monthTransactions
    .filter((t) => t.transactionType === 'EXPENSE' && t.approvalStatus === 'Approved')
    .forEach((t) => {
      const cat = t.categoryName || 'General';
      if (!categorySummary[cat]) {
        categorySummary[cat] = { total: 0, count: 0 };
      }
      categorySummary[cat].total += t.cashPaid;
      categorySummary[cat].count += 1;
    });

  const sortedCategories = Object.entries(categorySummary).sort((a, b) => b[1].total - a[1].total);

  // Custodian Reconciliation Summary
  const custodianSummary = accounts.map((acc) => {
    const accTxs = monthTransactions.filter((t) => t.accountId === acc.id);
    const monthIssued = accTxs.reduce((s, t) => s + t.cashReceived, 0);
    const monthSpent = accTxs.reduce((s, t) => s + t.cashPaid, 0);
    return {
      acc,
      monthIssued,
      monthSpent,
      currentBalance: acc.currentBalance,
    };
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Filter */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Petty Cash Analytics & Reconciliation Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monthly expense category distribution, custodian imprest reconciliation & expense audit statements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="">All Custodians</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.employeeName} ({a.department})
              </option>
            ))}
          </select>

          <button
            onClick={() => onExportExcel(monthTransactions)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
          >
            <Download className="w-3.5 h-3.5" />
            Excel Report
          </button>
          <button
            onClick={() => onPrintLedger(monthTransactions)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Month Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Disbursed Advances ({selectedMonth})</div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{formatCurrencyPKR(totalReceivedMonth)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-semibold uppercase">Total Approved Expenses ({selectedMonth})</div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">{formatCurrencyPKR(totalPaidMonth)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="text-xs text-slate-500 font-semibold uppercase">Net Imprest Cash Flow</div>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-2">{formatCurrencyPKR(totalReceivedMonth - totalPaidMonth)}</div>
        </div>
      </div>

      {/* Grid: Category Breakdown + Custodian Reconciliation Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Table */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-rose-500" />
            Expense Breakdown by Category
          </h2>

          <div className="space-y-3">
            {sortedCategories.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No expense transactions in selected period.</div>
            ) : (
              sortedCategories.map(([cat, data]) => {
                const pct = totalPaidMonth > 0 ? Math.round((data.total / totalPaidMonth) * 100) : 0;
                return (
                  <div key={cat} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-900 dark:text-white">{cat}</span>
                      <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrencyPKR(data.total)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{data.count} transaction(s)</span>
                      <span>{pct}% of month expenses</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-rose-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Custodian Reconciliation Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
          <h2 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            Custodian Account Reconciliation ({selectedMonth})
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3">Employee</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3 text-right">Target Imprest</th>
                  <th className="py-2.5 px-3 text-right">Month Issued</th>
                  <th className="py-2.5 px-3 text-right">Month Spent</th>
                  <th className="py-2.5 px-3 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {custodianSummary.map(({ acc, monthIssued, monthSpent, currentBalance }) => (
                  <tr key={acc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white">{acc.employeeName}</td>
                    <td className="py-2.5 px-3 text-slate-500">{acc.department}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyPKR(acc.openingBalance)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(monthIssued)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-600 dark:text-rose-400">{formatCurrencyPKR(monthSpent)}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-indigo-600 dark:text-indigo-400">{formatCurrencyPKR(currentBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
