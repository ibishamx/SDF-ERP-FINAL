import React, { useState } from 'react';
import { X, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PettyCashAccount } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface ReimburseModalProps {
  accounts: PettyCashAccount[];
  initialAccountId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    accountId: string;
    manualVoucherNumber: string;
    reimbursementAmount: number;
    paymentMethod: string;
    notes?: string;
    approvedBy: string;
  }) => void;
}

export const ReimburseModal: React.FC<ReimburseModalProps> = ({
  accounts,
  initialAccountId,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [accountId, setAccountId] = useState(initialAccountId || '');
  const [manualVoucherNumber, setManualVoucherNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Company Bank Transfer');
  const [approvedBy, setApprovedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const targetAccountId = accountId || (accounts[0] ? accounts[0].id : '');
  const selectedAccount = accounts.find((a) => a.id === targetAccountId);

  // Auto calculate recommended replenishment amount (difference between opening balance and current balance, or total expenses)
  const recommendedAmount = selectedAccount ? Math.max(0, selectedAccount.openingBalance - selectedAccount.currentBalance) : 0;
  const finalReimbursementAmount = customAmount !== '' ? parseFloat(customAmount) || 0 : (recommendedAmount > 0 ? recommendedAmount : 0);
  const newBalance = selectedAccount ? selectedAccount.currentBalance + finalReimbursementAmount : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      setError('Please select an account');
      return;
    }
    if (finalReimbursementAmount <= 0) {
      setError('Reimbursement amount must be greater than zero');
      return;
    }
    if (!manualVoucherNumber.trim()) {
      setError('Manual Voucher Number is required! Cannot save without manual voucher.');
      return;
    }

    try {
      onSubmit({
        accountId: targetAccountId,
        manualVoucherNumber: manualVoucherNumber.trim(),
        reimbursementAmount: finalReimbursementAmount,
        paymentMethod,
        notes,
        approvedBy: approvedBy || 'Factory General Manager',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to complete reimbursement');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-indigo-600 dark:bg-indigo-700 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            <h2 className="font-bold text-lg">Reimburse Petty Cash Imprest</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-indigo-500 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Imprest Status Breakdown */}
          {selectedAccount && (
            <div className="bg-indigo-50/50 dark:bg-slate-900/60 p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Target Float:</span>
                <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyPKR(selectedAccount.openingBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Current Balance:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{formatCurrencyPKR(selectedAccount.currentBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Total Expenses:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{formatCurrencyPKR(selectedAccount.totalExpenses)}</span>
              </div>
              <div className="pt-2 border-t border-indigo-200 dark:border-slate-700 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-800 dark:text-slate-200">Recommended Top-Up:</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(recommendedAmount)}</span>
              </div>
            </div>
          )}

          {/* Manual Voucher Number (Mandatory) */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Manual Voucher Number *
            </label>
            <input
              type="text"
              required
              value={manualVoucherNumber}
              onChange={(e) => setManualVoucherNumber(e.target.value)}
              placeholder="مینول واؤچر نمبر درج کریں (لازمی)"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-indigo-300 dark:border-indigo-700/80 rounded-lg p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Custom Reimbursement Amount */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Top-Up Amount PKR *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Rs.</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                placeholder="رقم درج کریں"
                min="1"
                step="1"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 pl-10 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {selectedAccount && (
              <p className="text-[11px] text-slate-500 mt-1">
                New balance after reimbursement: <strong className="text-indigo-600 dark:text-indigo-400">{formatCurrencyPKR(newBalance)}</strong>
              </p>
            )}
          </div>

          {/* Payment Method & Approver */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
              >
                <option value="Company Bank Transfer">Company Bank Transfer</option>
                <option value="Cheque Payment">Company Cheque</option>
                <option value="Main Cash Vault">Main Cash Vault</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Approved By</label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="منظور کرنے والے کا نام درج کریں"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Notes / Reference</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="واؤچر کا حوالہ یا نوٹس درج کریں"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs text-slate-900 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Approve & Reimburse
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
