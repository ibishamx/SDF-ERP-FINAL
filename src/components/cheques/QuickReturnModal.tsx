import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Search, Clock, Building, User, FileText, Calendar } from 'lucide-react';
import { Cheque } from '../../types';
import { storageService } from '../../services/storageService';
import { formatCurrencyPKR } from '../../services/exportService';
import { useLanguage } from '../../context/LanguageContext';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface QuickReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  cheques: Cheque[];
  initialChequeId?: string | null;
  onSuccess: (message: string) => void;
}

export const QuickReturnModal: React.FC<QuickReturnModalProps> = ({
  isOpen,
  onClose,
  cheques,
  initialChequeId,
  onSuccess,
}) => {
  const { t, lang } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(initialChequeId || null);
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [party, setParty] = useState('');
  const [voucherNumber, setVoucherNumber] = useState('');
  const [returnReason, setReturnReason] = useState('Returned to Customer');
  const [error, setError] = useState<string | null>(null);

  // Sync initialChequeId when modal opens or initialChequeId changes
  useEffect(() => {
    if (isOpen) {
      const targetId = initialChequeId || null;
      setSelectedChequeId(targetId);
      setReturnDate(new Date().toISOString().split('T')[0]);
      setError(null);

      if (targetId) {
        const found = cheques.find((c) => c.id === targetId);
        if (found) {
          setParty(found.receiveFrom);
          setVoucherNumber(found.voucherNumber || `RV-${found.chequeNumber.slice(-4) || '101'}`);
          setReturnReason(found.returnReason || 'Returned to Customer');
        }
      } else {
        setParty('');
        setVoucherNumber('');
        setReturnReason('Returned to Customer');
      }
    }
  }, [isOpen, initialChequeId, cheques]);

  if (!isOpen) return null;

  // Filter only outstanding or unreturned cheques
  const outstandingCheques = cheques.filter(
    (c) => !c.isDeleted && c.status === 'Outstanding'
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

  const handleSelectCheque = (c: Cheque) => {
    setSelectedChequeId(c.id);
    setParty(c.receiveFrom);
    setVoucherNumber(c.voucherNumber || `RV-${c.chequeNumber.slice(-4) || '101'}`);
    setReturnReason(c.returnReason || 'Returned to Customer');
    setError(null);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheque) {
      setError('Please select an outstanding cheque to return.');
      return;
    }
    if (!returnDate.trim()) {
      setError('Return Date is required.');
      return;
    }
    if (!party.trim()) {
      setError('Party Name (Customer / Returned To) is required.');
      return;
    }
    if (!voucherNumber.trim()) {
      setError('Return Voucher Number is required.');
      return;
    }

    try {
      storageService.updateCheque(activeCheque.id, {
        status: 'Returned',
        returnDate: returnDate.trim(),
        voucherNumber: voucherNumber.trim(),
        paidTo: party.trim(),
        returnReason: returnReason.trim() || `Returned to ${party.trim()}`,
      });

      onSuccess(`Cheque #${activeCheque.chequeNumber} returned to ${party.trim()} successfully with Voucher #${voucherNumber.trim()}`);
      setSelectedChequeId(null);
      setVoucherNumber('');
      setParty('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to return cheque.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-amber-600 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-6 h-6 stroke-[2.5]" />
            <div>
              <h2 className="font-extrabold text-lg">Return Cheque (چیک واپسی)</h2>
              <p className="text-xs text-amber-100">
                Select an outstanding cheque below and enter return date, party name, and voucher number
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-amber-500 rounded-lg transition-colors">
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
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Cheque Selector List */}
          <div>
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                1. Select Outstanding Cheque ({outstandingCheques.length} Available)
              </span>
              {activeCheque && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Selected: #{activeCheque.chequeNumber}
                </span>
              )}
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700/60">
              {filtered.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  {outstandingCheques.length === 0
                    ? 'No outstanding cheques available to return.'
                    : 'No outstanding cheques match your search.'}
                </div>
              ) : (
                filtered.map((c) => {
                  const isSelected = c.id === selectedChequeId;
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectCheque(c)}
                      className={`p-3 cursor-pointer flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/50 border-l-4 border-amber-600'
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
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                          {c.receiveFrom} • <span className="font-normal text-slate-500">{c.bank} ({c.city})</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {formatCurrencyPKR(c.amount)}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>Date: {c.chequeDate}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Return Form */}
          {activeCheque && (
            <form onSubmit={handleReturnSubmit} onKeyDown={handleFormKeyDown} className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              {/* Selected Cheque Preview Card */}
              <div className="bg-amber-50/60 dark:bg-amber-950/30 p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Selected Cheque:</span>
                  <span className="ml-2 font-mono font-bold text-slate-900 dark:text-white">#{activeCheque.chequeNumber}</span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold mt-0.5">
                    Original Party: <strong>{activeCheque.receiveFrom}</strong> ({activeCheque.bank})
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Amount:</span>
                  <span className="font-black text-sm text-slate-900 dark:text-white">{formatCurrencyPKR(activeCheque.amount)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Return Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    Return Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Party */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    Party (Returned To) *
                  </label>
                  <input
                    type="text"
                    required
                    value={party}
                    onChange={(e) => setParty(e.target.value)}
                    placeholder="کسٹمر / پارٹی کا نام درج کریں"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Voucher Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-amber-600" />
                    Return Voucher Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={voucherNumber}
                    onChange={(e) => setVoucherNumber(e.target.value)}
                    placeholder="واؤچر نمبر درج کریں e.g. RV-101"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                {/* Reason / Remarks */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Return Reason / Remarks
                  </label>
                  <input
                    type="text"
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    placeholder="واپسی کی وجہ e.g. Returned to Customer"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-600/30 flex items-center gap-2 transition-transform active:scale-95"
                >
                  <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                  <span>Confirm Return & Save Voucher</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
