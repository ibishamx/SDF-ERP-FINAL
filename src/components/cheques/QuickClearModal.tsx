import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Search, Clock, FileSpreadsheet } from 'lucide-react';
import { Cheque } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrencyPKR } from '../../services/exportService';
import { useLanguage } from '../../context/LanguageContext';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface QuickClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  cheques: Cheque[];
  initialChequeId?: string | null;
  onSuccess: (message: string) => void;
}

export const QuickClearModal: React.FC<QuickClearModalProps> = ({
  isOpen,
  onClose,
  cheques,
  initialChequeId,
  onSuccess,
}) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(initialChequeId || null);
  const [voucherNumber, setVoucherNumber] = useState('');
  const [paidTo, setPaidTo] = useState('');
  const [paidDate, setPaidDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const targetId = initialChequeId || null;
      setSelectedChequeId(targetId);
      setPaidDate(new Date().toISOString().split('T')[0]);
      setError(null);
      if (targetId) {
        const found = cheques.find((c) => c.id === targetId);
        if (found) {
          setPaidTo(found.paidTo || found.receiveFrom);
          setVoucherNumber(found.voucherNumber || `CV-${found.chequeNumber.slice(-4) || '101'}`);
        }
      } else {
        setPaidTo('');
        setVoucherNumber('');
      }
    }
  }, [isOpen, initialChequeId, cheques]);

  if (!isOpen) return null;

  const outstandingCheques = cheques.filter(
    (c) => !c.isDeleted && (c.status === 'Outstanding' || !c.voucherNumber)
  );

  const filtered = outstandingCheques.filter((c) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.chequeNumber.toLowerCase().includes(term) ||
      c.receiveFrom.toLowerCase().includes(term) ||
      c.bank.toLowerCase().includes(term) ||
      c.city.toLowerCase().includes(term)
    );
  });

  const activeCheque = cheques.find((c) => c.id === selectedChequeId);

  const handleClearSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheque) {
      setError('Please select an outstanding cheque to clear.');
      return;
    }
    if (!voucherNumber.trim()) {
      setError('Voucher Number is required to clear a cheque.');
      return;
    }

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      storageService.updateCheque(activeCheque.id, {
        status: 'Cleared',
        voucherNumber: voucherNumber.trim(),
        paidTo: paidTo.trim() || activeCheque.paidTo || activeCheque.receiveFrom,
        paidDate: paidDate || activeCheque.paidDate || todayStr,
      });

      onSuccess(`Cheque #${activeCheque.chequeNumber} cleared successfully with Voucher #${voucherNumber.trim()}`);
      setSelectedChequeId(null);
      setVoucherNumber('');
      setPaidTo('');
      setPaidDate(new Date().toISOString().split('T')[0]);
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to clear cheque.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            <div>
              <h2 className="font-extrabold text-lg">Clear Outstanding Cheque</h2>
              <p className="text-xs text-emerald-100">
                Select an outstanding cheque below and enter voucher number to apply clearance
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-500 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Search Outstanding Cheques */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="چیک نمبر، پارٹی کا نام یا بینک تلاش کریں"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Cheque Selector List */}
          <div className="max-h-56 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/60">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No outstanding cheques matching search.
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = c.id === selectedChequeId;
                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedChequeId(c.id);
                      setPaidTo(c.receiveFrom);
                      setError(null);
                    }}
                    className={`p-3.5 cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-700/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                          Cheque #{c.chequeNumber}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                          Outstanding
                        </span>
                      </div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {c.receiveFrom} <span className="font-normal text-slate-400">({c.bank} - {c.city})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Date: {c.chequeDate} | Rec: {c.receiveDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-slate-900 dark:text-white">
                        {formatCurrencyPKR(c.amount)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold">
                        {isSelected ? 'Selected ✓' : 'Click to Select'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Clearance Form for Selected Cheque */}
          {activeCheque && (
            <form onSubmit={handleClearSubmit} onKeyDown={handleFormKeyDown} className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Clearing Cheque #{activeCheque.chequeNumber} ({formatCurrencyPKR(activeCheque.amount)})
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Voucher Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder="واؤچر نمبر درج کریں"
                    required
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paid Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To (Party / Account)
                  </label>
                  <input
                    type="text"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    placeholder="کھاتہ یا وصول کنندہ پارٹی درج کریں"
                    className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Clear Cheque
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
