import React from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
  Printer,
  Download,
  ShieldCheck,
  History,
  FileText,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { PettyCashAccount, PettyCashTransaction, PettyCashCategory, UserRole } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface PettyCashDashboardProps {
  accounts: PettyCashAccount[];
  transactions: PettyCashTransaction[];
  categories: PettyCashCategory[];
  userRole: UserRole;
  onOpenIssueCash: () => void;
  onOpenRecordExpense: () => void;
  onOpenReimburse: (accountId?: string) => void;
  onOpenCategories: () => void;
  onOpenAuditLog: () => void;
  onSelectAccount: (accountId: string) => void;
  onPrintLedger: () => void;
  onExportExcel: () => void;
  onApproveTx?: (id: string) => void;
  onRejectTx?: (id: string) => void;
}

export const PettyCashDashboard: React.FC<PettyCashDashboardProps> = ({
  accounts,
  transactions,
  categories,
  userRole,
  onOpenIssueCash,
  onOpenRecordExpense,
  onOpenReimburse,
  onOpenCategories,
  onOpenAuditLog,
  onSelectAccount,
  onPrintLedger,
  onExportExcel,
}) => {
  const totalCashInCustody = accounts.reduce((sum, a) => sum + a.currentBalance, 0);
  const totalExpensesAllTime = accounts.reduce((sum, a) => sum + a.totalExpenses, 0);
  const totalIssuedAllTime = accounts.reduce((sum, a) => sum + a.totalCashIssued, 0);
  const totalReimbursedAllTime = accounts.reduce((sum, a) => sum + a.totalReimbursements, 0);

  const lowBalanceAccounts = accounts.filter((a) => a.currentBalance < a.minBalanceAlert && a.status === 'Active');
  const pendingApprovals = transactions.filter((t) => t.approvalStatus === 'Pending');

  // Category summary calculation
  const categoryTotals: Record<string, number> = {};
  transactions
    .filter((t) => t.transactionType === 'EXPENSE' && t.approvalStatus === 'Approved')
    .forEach((t) => {
      const cat = t.categoryName || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + t.cashPaid;
    });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const canManage = ['Administrator', 'Accounts', 'Manager'].includes(userRole);
  const canIssue = ['Administrator', 'Accounts'].includes(userRole);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-xl p-6 shadow-xl border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-medium text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Saleem Daal Factory • Internal Cash Register
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">Petty Cash & Imprest Management</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Digitized real-time cash ledger for factory staff expenses, cash advances, running balances, low-balance alerts & digital audit logs.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canIssue && (
              <button
                onClick={onOpenIssueCash}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                Issue Cash
              </button>
            )}

            {userRole !== 'Viewer' && (
              <button
                onClick={onOpenRecordExpense}
                className="bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all hover:scale-105"
              >
                <ArrowDownRight className="w-4 h-4" />
                Record Expense
              </button>
            )}

            {canManage && (
              <button
                onClick={() => onOpenReimburse()}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition-all hover:scale-105"
              >
                <RefreshCw className="w-4 h-4" />
                Reimburse Imprest
              </button>
            )}
          </div>
        </div>

        {/* Secondary Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-700/80 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            Current Session Role: <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-600">{userRole}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCategories}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              Categories ({categories.length})
            </button>
            <button
              onClick={onOpenAuditLog}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              Audit Trail
            </button>
            <button
              onClick={onExportExcel}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Excel Export
            </button>
            <button
              onClick={onPrintLedger}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded border border-slate-600 transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              Print Ledger
            </button>
          </div>
        </div>
      </div>

      {/* Low Balance Alert Header if Any */}
      {lowBalanceAccounts.length > 0 && (
        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">
              Low Petty Cash Balance Warning ({lowBalanceAccounts.length} Account{lowBalanceAccounts.length > 1 ? 's' : ''})
            </h4>
            <div className="text-xs text-amber-800 dark:text-amber-400 mt-1 flex flex-wrap gap-2">
              {lowBalanceAccounts.map((a) => (
                <span key={a.id} className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded border border-amber-300 font-medium">
                  {a.employeeName} ({a.department}): Balance {formatCurrencyPKR(a.currentBalance)} &lt; Limit {formatCurrencyPKR(a.minBalanceAlert)}
                </span>
              ))}
            </div>
          </div>
          {canManage && (
            <button
              onClick={() => onOpenReimburse(lowBalanceAccounts[0].id)}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-1.5 rounded shadow"
            >
              Quick Reimburse
            </button>
          )}
        </div>
      )}

      {/* Key Metric Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cash in Custody */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Cash in Custody
            </span>
            <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrencyPKR(totalCashInCustody)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center justify-between">
            <span>Across {accounts.length} Custodian Accounts</span>
            <span className="font-medium text-blue-600">Active</span>
          </div>
        </div>

        {/* Total Expenses All Time */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Recorded Expenses
            </span>
            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrencyPKR(totalExpensesAllTime)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            <span>Outflow from factory expenses</span>
          </div>
        </div>

        {/* Total Cash Issued */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Cash Issued
            </span>
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrencyPKR(totalIssuedAllTime)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            <span>Advances disbursed to custodians</span>
          </div>
        </div>

        {/* Total Reimbursed */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Reimbursed
            </span>
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrencyPKR(totalReimbursedAllTime)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Imprest top-ups completed</span>
          </div>
        </div>
      </div>

      {/* Custodian Accounts Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Active Employee Custodian Accounts
          </h2>
          <span className="text-xs text-slate-500">
            Click an account to filter ledger statement
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {accounts.map((acc) => {
            const isLow = acc.currentBalance < acc.minBalanceAlert;
            return (
              <div
                key={acc.id}
                onClick={() => onSelectAccount(acc.id)}
                className={`cursor-pointer bg-white dark:bg-slate-800 p-4 rounded-xl border transition-all hover:shadow-md hover:border-indigo-500 ${
                  isLow ? 'border-amber-400 dark:border-amber-500/60 bg-amber-50/20' : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{acc.employeeName}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{acc.department}</p>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      isLow
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                    }`}
                  >
                    {isLow ? 'Low Balance' : 'Active'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                  <div className="text-xs text-slate-500">Current Balance</div>
                  <div className={`text-xl font-black ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                    {formatCurrencyPKR(acc.currentBalance)}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Issued Advances:</span>
                    <span className="font-semibold">{formatCurrencyPKR(acc.totalCashIssued)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recorded Expenses:</span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">{formatCurrencyPKR(acc.totalExpenses)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Min Alert Threshold:</span>
                    <span className="font-medium text-slate-600 dark:text-slate-300">{formatCurrencyPKR(acc.minBalanceAlert)}</span>
                  </div>
                </div>

                {canManage && isLow && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenReimburse(acc.id);
                    }}
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reimburse This Account
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Split Section: Category Expenses + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Expenses Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Top Expense Categories
          </h3>

          {sortedCategories.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">No expense records logged yet</div>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(([catName, amount]) => {
                const pct = totalExpensesAllTime > 0 ? Math.round((amount / totalExpensesAllTime) * 100) : 0;
                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{catName}</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatCurrencyPKR(amount)} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Recent Cash Ledger Activity
            </h3>
            <span className="text-xs text-slate-500">Last 5 Transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-2 px-2 font-bold uppercase">Voucher #</th>
                  <th className="py-2 px-2 font-bold uppercase">Date</th>
                  <th className="py-2 px-2 font-bold uppercase">Type</th>
                  <th className="py-2 px-2 font-bold uppercase">Employee</th>
                  <th className="py-2 px-2 font-bold uppercase">Category / Notes</th>
                  <th className="py-2 px-2 font-bold uppercase text-right">In (+)</th>
                  <th className="py-2 px-2 font-bold uppercase text-right">Out (-)</th>
                  <th className="py-2 px-2 font-bold uppercase text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-2.5 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.voucherNumber}</td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">{t.date}</td>
                    <td className="py-2.5 px-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md ${
                          t.transactionType === 'CASH_ISSUE'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : t.transactionType === 'REIMBURSEMENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {t.transactionType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 font-medium text-slate-900 dark:text-white">{t.employeeName}</td>
                    <td className="py-2.5 px-2 text-slate-600 dark:text-slate-300 max-w-[180px] truncate">
                      {t.categoryName || t.description || t.reason || 'N/A'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {t.cashReceived > 0 ? formatCurrencyPKR(t.cashReceived) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-rose-600 dark:text-rose-400">
                      {t.cashPaid > 0 ? formatCurrencyPKR(t.cashPaid) : '-'}
                    </td>
                    <td className="py-2.5 px-2 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrencyPKR(t.runningBalance)}
                    </td>
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
