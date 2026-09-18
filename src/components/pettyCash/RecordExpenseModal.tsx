import React, { useState } from 'react';
import { X, ArrowDownRight, AlertTriangle, Paperclip, Trash2, FileText, Check } from 'lucide-react';
import { PettyCashAccount, PettyCashCategory, PettyCashVendor, ReceiptAttachment } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface RecordExpenseModalProps {
  accounts: PettyCashAccount[];
  categories: PettyCashCategory[];
  vendors: PettyCashVendor[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
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
    receipts?: ReceiptAttachment[];
    approvedBy?: string;
    createdBy: string;
  }) => void;
}

export const RecordExpenseModal: React.FC<RecordExpenseModalProps> = ({
  accounts,
  categories,
  vendors,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [accountId, setAccountId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [manualVoucherNumber, setManualVoucherNumber] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Petty Cash');
  const [notes, setNotes] = useState('');
  const [receipts, setReceipts] = useState<ReceiptAttachment[]>([]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const targetAccountId = accountId || (accounts[0] ? accounts[0].id : '');
  const selectedAccount = accounts.find((a) => a.id === targetAccountId);
  const parsedAmount = parseFloat(amount) || 0;
  const newBalance = selectedAccount ? selectedAccount.currentBalance - parsedAmount : -parsedAmount;
  const isLowBalanceWarning = Boolean(selectedAccount && newBalance < (selectedAccount.minBalanceAlert || 5000));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newReceipt: ReceiptAttachment = {
          id: `rcpt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          fileName: file.name,
          fileType: file.type || 'image/jpeg',
          dataUrl: reader.result as string,
          fileSizeKb: Math.round(file.size / 1024),
          uploadedAt: new Date().toISOString(),
        };
        setReceipts((prev) => [...prev, newReceipt]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAccountId) {
      setError('Please select an account');
      return;
    }
    if (parsedAmount <= 0) {
      setError('Expense amount must be greater than zero');
      return;
    }
    if (selectedAccount && parsedAmount > selectedAccount.currentBalance) {
      setError(`Insufficient petty cash balance! Current balance is ${formatCurrencyPKR(selectedAccount.currentBalance)}, cannot spend ${formatCurrencyPKR(parsedAmount)}.`);
      return;
    }
    if (!manualVoucherNumber.trim()) {
      setError('Manual Voucher Number is required! Cannot save without manual voucher.');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description for the expense');
      return;
    }

    const selectedCategoryObj = categories.find((c) => c.name === categoryName);
    const selectedVendorObj = vendors.find((v) => v.name === vendorName);

    try {
      onSubmit({
        accountId: targetAccountId,
        date: date || new Date().toISOString().slice(0, 10),
        time: time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        manualVoucherNumber: manualVoucherNumber.trim(),
        categoryId: selectedCategoryObj?.id,
        categoryName: categoryName || 'General Expense',
        description,
        vendorId: selectedVendorObj?.id,
        vendorName: vendorName || undefined,
        amount: parsedAmount,
        paymentMethod,
        notes,
        receipts,
        approvedBy: 'Verified Officer',
        createdBy: 'Admin / Accounts',
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record expense');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-rose-600 dark:bg-rose-700 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowDownRight className="w-5 h-5" />
            <h2 className="font-bold text-lg">Record Factory Petty Cash Expense</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-500 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Balance Preview Card */}
          {selectedAccount && (
            <div className="bg-rose-50/60 dark:bg-rose-950/30 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs flex justify-between items-center">
              <div>
                <span className="text-slate-500 dark:text-slate-400">Current Balance:</span>
                <span className="ml-1.5 font-bold text-slate-900 dark:text-white">{formatCurrencyPKR(selectedAccount.currentBalance)}</span>
              </div>
              <div>
                <span className="text-slate-500 dark:text-slate-400">Remaining After Expense:</span>
                <span className={`ml-1.5 font-extrabold ${isLowBalanceWarning ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrencyPKR(newBalance)}
                </span>
              </div>
            </div>
          )}

          {isLowBalanceWarning && (
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-800 dark:text-amber-300 rounded-lg text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Low Balance Warning:</strong> This expense will reduce balance below minimum threshold.
              </span>
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-rose-300 dark:border-rose-700/80 rounded-lg p-2.5 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Category & Vendor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Expense Category *</label>
              <select
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white font-medium"
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">Vendor / Payee</label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="وینڈر یا دکاندار کا نام درج کریں"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Amount PKR */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Expense Amount PKR *
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
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 pl-10 text-lg font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1">
              Description / Detail *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="خرچے کی تفصیل درج کریں"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-sm text-slate-900 dark:text-white"
              required
            />
          </div>

          {/* Receipt Uploads */}
          <div>
            <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>Attach Receipt / Bill</span>
              <span className="text-[10px] text-slate-400 font-normal">Optional</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-300 dark:border-slate-600">
                <Paperclip className="w-4 h-4 text-indigo-500" />
                Upload File
                <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" multiple />
              </label>
              <span className="text-xs text-slate-500">{receipts.length} attached</span>
            </div>

            {receipts.length > 0 && (
              <div className="mt-2 space-y-1.5">
                {receipts.map((r) => (
                  <div key={r.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900 p-2 rounded text-xs border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 truncate max-w-[280px]">
                      <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">{r.fileName}</span>
                      <span className="text-[10px] text-slate-400">({r.fileSizeKb} KB)</span>
                    </div>
                    <button type="button" onClick={() => removeReceipt(r.id)} className="text-rose-500 hover:text-rose-700 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              className="bg-rose-600 hover:bg-rose-500 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md hover:scale-105 transition-all"
            >
              Save Expense Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
