import React from 'react';
import { FileSpreadsheet, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { Cheque, FilterState } from '../../types';
import { formatCurrencyPKR } from '../../services/exportService';

interface ChequeStatsSummaryProps {
  cheques: Cheque[];
  filter: FilterState;
  onFilterChange: (newFilter: Partial<FilterState>) => void;
}

export const ChequeStatsSummary: React.FC<ChequeStatsSummaryProps> = ({
  cheques,
  filter,
  onFilterChange,
}) => {
  const activeCheques = cheques.filter((c) => !c.isDeleted);

  const totalQty = activeCheques.length;
  const totalAmount = activeCheques.reduce((sum, c) => sum + c.amount, 0);

  const outstandingList = activeCheques.filter((c) => c.status === 'Outstanding');
  const outstandingQty = outstandingList.length;
  const outstandingAmount = outstandingList.reduce((sum, c) => sum + c.amount, 0);

  const clearedList = activeCheques.filter((c) => c.status === 'Cleared');
  const clearedQty = clearedList.length;
  const clearedAmount = clearedList.reduce((sum, c) => sum + c.amount, 0);

  const returnedList = activeCheques.filter((c) => c.status === 'Returned');
  const returnedQty = returnedList.length;
  const returnedAmount = returnedList.reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Cheques */}
      <button
        type="button"
        onClick={() => onFilterChange({ status: '' })}
        className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-left transition duration-200 shadow-sm hover:shadow-md min-h-[140px] ${
          !filter.status
            ? 'border-blue-500 bg-blue-50/90 ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/50'
            : 'border-slate-200 bg-white hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            TOTAL REGISTERED
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/70 dark:text-blue-300">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-blue-900 dark:text-blue-100 tracking-tight">
            {totalQty} <span className="text-sm sm:text-base font-bold text-blue-700 dark:text-blue-300">Cheques</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Amount: <span className="font-bold text-slate-900 dark:text-white">{formatCurrencyPKR(totalAmount)}</span>
          </p>
        </div>
      </button>

      {/* 2. Outstanding Cheques */}
      <button
        type="button"
        onClick={() => onFilterChange({ status: 'Outstanding' })}
        className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-left transition duration-200 shadow-sm hover:shadow-md min-h-[140px] ${
          filter.status === 'Outstanding'
            ? 'border-rose-500 bg-rose-50/90 ring-2 ring-rose-500/20 dark:border-rose-500 dark:bg-rose-950/50'
            : 'border-slate-200 bg-white hover:border-rose-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            OUTSTANDING (AWAITING)
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/70 dark:text-rose-300">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
            {outstandingQty} <span className="text-sm sm:text-base font-bold text-rose-700 dark:text-rose-300">Cheques</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Amount: <span className="font-bold text-rose-700 dark:text-rose-300">{formatCurrencyPKR(outstandingAmount)}</span>
          </p>
        </div>
      </button>

      {/* 3. Cleared Cheques */}
      <button
        type="button"
        onClick={() => onFilterChange({ status: 'Cleared' })}
        className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-left transition duration-200 shadow-sm hover:shadow-md min-h-[140px] ${
          filter.status === 'Cleared'
            ? 'border-emerald-500 bg-emerald-50/90 ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-emerald-950/50'
            : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            CLEARED (VOUCHER)
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/70 dark:text-emerald-300">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
            {clearedQty} <span className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-300">Cheques</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Amount: <span className="font-bold text-emerald-700 dark:text-emerald-300">{formatCurrencyPKR(clearedAmount)}</span>
          </p>
        </div>
      </button>

      {/* 4. Returned to Customer */}
      <button
        type="button"
        onClick={() => onFilterChange({ status: 'Returned' })}
        className={`flex flex-col justify-between rounded-2xl border p-5 sm:p-6 text-left transition duration-200 shadow-sm hover:shadow-md min-h-[140px] ${
          filter.status === 'Returned'
            ? 'border-amber-500 bg-amber-50/90 ring-2 ring-amber-500/20 dark:border-amber-500 dark:bg-amber-950/50'
            : 'border-slate-200 bg-white hover:border-amber-300 dark:border-slate-800 dark:bg-slate-900'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            RETURNED TO CUSTOMER
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/70 dark:text-amber-300">
            <RotateCcw className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 space-y-1">
          <div className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
            {returnedQty} <span className="text-sm sm:text-base font-bold text-amber-700 dark:text-amber-300">Cheques</span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
            Amount: <span className="font-bold text-amber-700 dark:text-amber-300">{formatCurrencyPKR(returnedAmount)}</span>
          </p>
        </div>
      </button>
    </div>
  );
};

