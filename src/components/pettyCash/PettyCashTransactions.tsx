import React, { useState } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  FileText,
  Paperclip,
  CheckCircle2,
  XCircle,
  Eye,
  Plus,
  ArrowDownRight,
  RefreshCw,
  User,
} from 'lucide-react';
import { PettyCashTransaction, PettyCashAccount, UserRole, PettyCashCategory } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface PettyCashTransactionsProps {
  transactions: PettyCashTransaction[];
  accounts: PettyCashAccount[];
  categories: PettyCashCategory[];
  userRole: UserRole;
  selectedAccountId?: string;
  onSelectAccountId: (id: string) => void;
  onOpenIssueCash: () => void;
  onOpenRecordExpense: () => void;
  onOpenReimburse: () => void;
  onPrintVoucher: (tx: PettyCashTransaction) => void;
  onPrintLedger: (txs: PettyCashTransaction[]) => void;
  onExportExcel: (txs: PettyCashTransaction[]) => void;
  onExportCsv: (txs: PettyCashTransaction[]) => void;
  onApproveTx?: (id: string) => void;
  onRejectTx?: (id: string) => void;
}

export const PettyCashTransactions: React.FC<PettyCashTransactionsProps> = ({
  transactions,
  accounts,
  categories,
  userRole,
  selectedAccountId = '',
  onSelectAccountId,
  onOpenIssueCash,
  onOpenRecordExpense,
  onOpenReimburse,
  onPrintVoucher,
  onPrintLedger,
  onExportExcel,
  onExportCsv,
  onApproveTx,
  onRejectTx,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTxDetail, setActiveTxDetail] = useState<PettyCashTransaction | null>(null);

  const canManage = ['Administrator', 'Accounts', 'Manager'].includes(userRole);

  const filteredTransactions = transactions.filter((t) => {
    if (selectedAccountId && t.accountId !== selectedAccountId) return false;
    if (typeFilter !== 'ALL' && t.transactionType !== typeFilter) return false;
    if (categoryFilter !== 'ALL' && t.categoryName !== categoryFilter) return false;
    if (statusFilter !== 'ALL' && t.approvalStatus !== statusFilter) return false;
    if (startDate && t.date < startDate) return false;
    if (endDate && t.date > endDate) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        t.voucherNumber.toLowerCase().includes(q) ||
        (t.manualVoucherNumber && t.manualVoucherNumber.toLowerCase().includes(q)) ||
        t.employeeName.toLowerCase().includes(q) ||
        (t.categoryName && t.categoryName.toLowerCase().includes(q)) ||
        (t.vendorName && t.vendorName.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        (t.reason && t.reason.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const totalCashIn = filteredTransactions.reduce((s, t) => s + t.cashReceived, 0);
  const totalCashOut = filteredTransactions.reduce((s, t) => s + t.cashPaid, 0);
  const netFlow = totalCashIn - totalCashOut;

  const activeAccountObj = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="space-y-6">
      {/* Top Bar with Filter Inputs */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Petty Cash Running Ledger
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Immutable ledger history of cash advances, factory expense payouts & imprest reimbursements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenIssueCash}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              Issue Cash
            </button>
            <button
              onClick={onOpenRecordExpense}
              className="bg-rose-600 hover:bg-rose-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Expense
            </button>
            <button
              onClick={onOpenReimburse}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reimburse
            </button>
            <button
              onClick={() => onExportExcel(filteredTransactions)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-300 dark:border-slate-600"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </button>
            <button
              onClick={() => onPrintLedger(filteredTransactions)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-300 dark:border-slate-600"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-600" />
              Print Ledger
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          {/* Account Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Custodian Account
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => onSelectAccountId(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="">All Employee Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.employeeName} ({a.department})
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Type Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="ALL">All Types</option>
              <option value="EXPENSE">Expense Outflow</option>
              <option value="CASH_ISSUE">Cash Issue Advance</option>
              <option value="REIMBURSEMENT">Imprest Reimbursement</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs font-semibold text-slate-900 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Start */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">From Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Date End */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">To Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Search Query */}
          <div>
            <label className="block text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400 mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Voucher, description..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 pr-2 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selected Account Summary Banner if Filtered */}
      {activeAccountObj && (
        <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{activeAccountObj.employeeName}</span>
              <span className="text-slate-500 ml-2">({activeAccountObj.department} • {activeAccountObj.employeeId})</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">Target Float: </span>
              <span className="font-bold">{formatCurrencyPKR(activeAccountObj.openingBalance)}</span>
            </div>
            <div>
              <span className="text-slate-500">Current Balance: </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrencyPKR(activeAccountObj.currentBalance)}</span>
            </div>
            <button
              onClick={() => onSelectAccountId('')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 underline ml-2"
            >
              Clear Filter
            </button>
          </div>
        </div>
      )}

      {/* Ledger Table Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Table Summary Bar */}
        <div className="bg-slate-50 dark:bg-slate-900/60 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="text-slate-600 dark:text-slate-400 font-medium">
            Showing <strong>{filteredTransactions.length}</strong> ledger records
          </div>
          <div className="flex items-center gap-6 font-bold">
            <div>
              Total Cash In (+): <span className="text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(totalCashIn)}</span>
            </div>
            <div>
              Total Cash Out (-): <span className="text-rose-600 dark:text-rose-400">{formatCurrencyPKR(totalCashOut)}</span>
            </div>
            <div>
              Net Flow: <span className="text-indigo-600 dark:text-indigo-400">{formatCurrencyPKR(netFlow)}</span>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Voucher #</th>
                <th className="py-3 px-3">Manual Voucher #</th>
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Employee / Custodian</th>
                <th className="py-3 px-3">Category / Payee</th>
                <th className="py-3 px-3">Description / Reason</th>
                <th className="py-3 px-3 text-right">Cash In (+)</th>
                <th className="py-3 px-3 text-right">Cash Out (-)</th>
                <th className="py-3 px-3 text-right">Running Balance</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={13} className="text-center py-12 text-slate-400">
                    No matching petty cash records found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600 dark:text-indigo-400">{t.voucherNumber}</td>
                    <td className="py-3 px-3 font-mono font-bold text-amber-600 dark:text-amber-400">{t.manualVoucherNumber || '-'}</td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{t.date}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded ${
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
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      <div>{t.employeeName}</div>
                      <div className="text-[10px] text-slate-400">{t.department}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                      <div>{t.categoryName || t.transactionType}</div>
                      {t.vendorName && <div className="text-[10px] text-slate-400">Payee: {t.vendorName}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 max-w-[200px] truncate" title={t.description || t.reason}>
                      {t.description || t.reason || '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      {t.cashReceived > 0 ? formatCurrencyPKR(t.cashReceived) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400">
                      {t.cashPaid > 0 ? formatCurrencyPKR(t.cashPaid) : '-'}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/30">
                      {formatCurrencyPKR(t.runningBalance)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.approvalStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                            : t.approvalStatus === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                        }`}
                      >
                        {t.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setActiveTxDetail(t)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-600 dark:text-slate-300"
                          title="View Voucher Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onPrintVoucher(t)}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-cyan-600"
                          title="Print Official Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {canManage && t.approvalStatus === 'Pending' && (
                          <>
                            <button
                              onClick={() => onApproveTx && onApproveTx(t.id)}
                              className="p-1 hover:bg-emerald-100 rounded text-emerald-600"
                              title="Approve Voucher"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRejectTx && onRejectTx(t.id)}
                              className="p-1 hover:bg-rose-100 rounded text-rose-600"
                              title="Reject Voucher"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail View Modal */}
      {activeTxDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Voucher Details: {activeTxDetail.voucherNumber}</h3>
                <p className="text-xs text-slate-400">
                  {activeTxDetail.transactionType.replace('_', ' ')} • {activeTxDetail.date}
                  {activeTxDetail.manualVoucherNumber && (
                    <span className="ml-2 font-bold text-amber-400">
                      (Manual Voucher: {activeTxDetail.manualVoucherNumber})
                    </span>
                  )}
                </p>
              </div>
              <button onClick={() => setActiveTxDetail(null)} className="p-1 text-slate-400 hover:text-white text-xl">
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px]">Custodian Employee:</span>
                  <strong className="text-slate-900 dark:text-white text-sm">{activeTxDetail.employeeName}</strong>
                  <div className="text-slate-500">{activeTxDetail.department}</div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Transaction Amount:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatCurrencyPKR(activeTxDetail.cashReceived || activeTxDetail.cashPaid)}
                  </strong>
                  <div className="text-slate-500">Balance: {formatCurrencyPKR(activeTxDetail.runningBalance)}</div>
                </div>
              </div>

              <div>
                <span className="text-slate-400 block font-bold mb-1">Description / Reason:</span>
                <p className="p-2.5 bg-slate-100 dark:bg-slate-900 rounded text-slate-800 dark:text-slate-200">
                  {activeTxDetail.description || activeTxDetail.reason || 'N/A'}
                </p>
              </div>

              {activeTxDetail.receipts && activeTxDetail.receipts.length > 0 && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1 flex items-center gap-1">
                    <Paperclip className="w-3.5 h-3.5 text-indigo-500" /> Attached Receipts ({activeTxDetail.receipts.length}):
                  </span>
                  <div className="space-y-1.5">
                    {activeTxDetail.receipts.map((r) => (
                      <div key={r.id} className="p-2 bg-slate-50 dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="font-medium truncate max-w-[260px] text-slate-800 dark:text-slate-200">{r.fileName}</span>
                        {r.dataUrl && (
                          <a href={r.dataUrl} download={r.fileName} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                            Download
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTxDetail.approvalChain && activeTxDetail.approvalChain.length > 0 && (
                <div>
                  <span className="text-slate-400 font-bold block mb-1">Approval Log Chain:</span>
                  <div className="space-y-1 bg-slate-50 dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700">
                    {activeTxDetail.approvalChain.map((step, i) => (
                      <div key={i} className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300">
                        <span>{step.role}: <strong>{step.approverName}</strong></span>
                        <span className="text-emerald-600 font-bold">{step.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    onPrintVoucher(activeTxDetail);
                    setActiveTxDetail(null);
                  }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Official Voucher
                </button>
                <button onClick={() => setActiveTxDetail(null)} className="px-3 py-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-300">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
