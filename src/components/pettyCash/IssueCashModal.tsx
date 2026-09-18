import React, { useState } from 'react';
import { X, Plus, AlertCircle, DollarSign, Calendar, Clock, User, FileText } from 'lucide-react';
import { PettyCashAccount } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface IssueCashModalProps {
  accounts: PettyCashAccount[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
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
  }) => void;
}

export const IssueCashModal: React.FC<IssueCashModalProps> = ({ accounts, isOpen, onClose, onSubmit }) => {
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [manualVoucherNumber, setManualVoucherNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [approvedBy, setApprovedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const targetAccountId = accountId || (accounts[0] ? accounts[0].id : '');
  const selectedAccount = accounts.find((a) => a.id === targetAccountId);
  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = selectedAccount ? selectedAccount.currentBalance + parsedAmount : parsedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      setError('Please select an account');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }
    if (!manualVoucherNumber.trim()) {
      setError('Manual Voucher Number is required! Cannot save without manual voucher.');
      return;
    }
    if (!reason.trim()) {
      setError('Please enter source / description for cash received');
      return;
    }

    try {
      onSubmit({
        accountId: targetAccountId,
        date: date || new Date().toISOString().slice(0, 10),
        time: time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        manualVoucherNumber: manualVoucherNumber.trim(),
        amount: parsedAmount,
        reason,
        paymentMethod,
        notes,
        approvedBy: approvedBy || 'Finance Manager / Accounts',
        createdBy: 'Admin / Accounts',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to receive cash');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 stroke-[3]" />
            <h2 className="font-bold text-lg">Money In — Receive Cash</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-500 rounded-lg transition-colors">
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

          {/* Balance Preview Card */}
          {selectedAccount && (
            <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
                <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatCurrencyPKR(selectedAccount.currentBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Balance After Money In:</span>
                <span className="ml-1.5 font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrencyPKR(newBalance)}</span>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Time</label>
              <input
                type="text"
                value={time}
                placeholder="وقت درج کریں"
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700/80 rounded-lg p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Amount PKR */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Issue Amount PKR *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">Rs.</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="رقم درج کریں"
                min="1"
                step="1"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 pl-10 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Reason / Purpose */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Reason / Expense Purpose *
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="رقم جاری کرنے کی وجہ یا مقصد درج کریں"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white"
              required
            />
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
                <option value="Cash">Cash Handover</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
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

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="اضافی نوٹس یا تفصیل درج کریں"
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
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-all"
            >
              Confirm Issue Cash
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
