import React, { useState } from 'react';
import { User, Plus, Edit, ShieldAlert, CheckCircle2, Wallet, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { PettyCashAccount, PettyCashAccountStatus, UserRole } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface PettyCashAccountsProps {
  accounts: PettyCashAccount[];
  userRole: UserRole;
  onSaveAccount: (data: {
    id?: string;
    employeeId: string;
    employeeName: string;
    department: string;
    openingBalance: number;
    minBalanceAlert: number;
    status: PettyCashAccountStatus;
  }) => void;
  onOpenReimburse: (accountId: string) => void;
  onSelectAccount: (accountId: string) => void;
}

export const PettyCashAccounts: React.FC<PettyCashAccountsProps> = ({
  accounts,
  userRole,
  onSaveAccount,
  onOpenReimburse,
  onSelectAccount,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<PettyCashAccount | null>(null);

  // Form State
  const [employeeId, setEmployeeId] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [department, setDepartment] = useState('Factory Production');
  const [openingBalance, setOpeningBalance] = useState('50000');
  const [minBalanceAlert, setMinBalanceAlert] = useState('10000');
  const [status, setStatus] = useState<PettyCashAccountStatus>('Active');
  const [formError, setFormError] = useState('');

  const canEdit = ['Administrator', 'Accounts'].includes(userRole);

  const filteredAccounts = accounts.filter(
    (a) =>
      a.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openNewModal = () => {
    setEditingAccount(null);
    setEmployeeId(`EMP-${Math.floor(100 + Math.random() * 900)}`);
    setEmployeeName('');
    setDepartment('Factory Production');
    setOpeningBalance('50000');
    setMinBalanceAlert('10000');
    setStatus('Active');
    setFormError('');
    setShowModal(true);
  };

  const openEditModal = (acc: PettyCashAccount) => {
    setEditingAccount(acc);
    setEmployeeId(acc.employeeId);
    setEmployeeName(acc.employeeName);
    setDepartment(acc.department);
    setOpeningBalance(acc.openingBalance.toString());
    setMinBalanceAlert(acc.minBalanceAlert.toString());
    setStatus(acc.status);
    setFormError('');
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeName.trim()) {
      setFormError('Please enter employee name');
      return;
    }
    const ob = parseFloat(openingBalance);
    const alertVal = parseFloat(minBalanceAlert);
    if (isNaN(ob) || ob < 0) {
      setFormError('Opening balance must be 0 or greater');
      return;
    }

    try {
      onSaveAccount({
        id: editingAccount?.id,
        employeeId,
        employeeName,
        department,
        openingBalance: ob,
        minBalanceAlert: alertVal || 5000,
        status,
      });
      setShowModal(false);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to save account');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Petty Cash Custodian Accounts
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage factory staff petty cash accounts, minimum balance alert thresholds, and individual running ledgers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search custodians..."
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-64"
            />
          </div>

          {canEdit && (
            <button
              onClick={openNewModal}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all hover:scale-105 shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Account
            </button>
          )}
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredAccounts.map((acc) => {
          const isLow = acc.currentBalance < acc.minBalanceAlert && acc.status === 'Active';
          return (
            <div
              key={acc.id}
              className={`bg-white dark:bg-slate-800 rounded-xl border shadow-sm transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                isLow ? 'border-amber-400 dark:border-amber-500/80 bg-amber-50/20' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="p-5 space-y-4">
                {/* Custodian Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-black text-sm flex items-center justify-center shrink-0">
                      {acc.employeeName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base leading-tight">{acc.employeeName}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{acc.department} • {acc.employeeId}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      acc.status === 'Active'
                        ? isLow
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {acc.status === 'Active' ? (isLow ? 'Low Balance' : 'Active') : 'Suspended'}
                  </span>
                </div>

                {/* Balances Display */}
                <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-700/80 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-medium">Current Balance:</span>
                    <span className={`text-xl font-black ${isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                      {formatCurrencyPKR(acc.currentBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Opening Imprest Float:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyPKR(acc.openingBalance)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Min Alert Threshold:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrencyPKR(acc.minBalanceAlert)}</span>
                  </div>
                </div>

                {/* Account Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-1">
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Issued</span>
                    <strong className="text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(acc.totalCashIssued)}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Expenses</span>
                    <strong className="text-rose-600 dark:text-rose-400">{formatCurrencyPKR(acc.totalExpenses)}</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-2 rounded border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Reimbursed</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">{formatCurrencyPKR(acc.totalReimbursements)}</strong>
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectAccount(acc.id)}
                  className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  View Ledger &rarr;
                </button>

                <div className="flex items-center gap-2">
                  {canEdit && isLow && (
                    <button
                      onClick={() => onOpenReimburse(acc.id)}
                      className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 shadow"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reimburse
                    </button>
                  )}

                  {canEdit && (
                    <button
                      onClick={() => openEditModal(acc)}
                      className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1"
                      title="Edit Account Settings"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-600 text-white p-4 px-6 flex items-center justify-between">
              <h2 className="font-bold text-base">{editingAccount ? 'Edit Custodian Account' : 'Create New Custodian Account'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-indigo-500 rounded">
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && <div className="p-2.5 bg-rose-50 text-rose-700 text-xs rounded border border-rose-200">{formError}</div>}

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="e.g. Muhammad Raza"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Department</label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Factory Production">Factory Production</option>
                  <option value="Maintenance & Electrical">Maintenance & Electrical</option>
                  <option value="Gate & Transport Office">Gate & Transport Office</option>
                  <option value="Admin & General Office">Admin & General Office</option>
                  <option value="Procurement & Stores">Procurement & Stores</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Opening Imprest (PKR)</label>
                  <input
                    type="number"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Low Balance Alert Limit</label>
                  <input
                    type="number"
                    value={minBalanceAlert}
                    onChange={(e) => setMinBalanceAlert(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1">Account Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PettyCashAccountStatus)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm text-slate-900 dark:text-white"
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow">
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
