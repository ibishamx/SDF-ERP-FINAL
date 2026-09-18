import React, { useState, useEffect } from 'react';
import {
  Search,
  Truck,
  ShoppingCart,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Plus,
  Clock,
  ArrowLeft,
  Building2,
  Package,
  User,
  Phone,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { printStockReport } from '../../services/exportService';
import { DispatchRecord, SaleRecord, StockBalanceInfo } from '../../types';

interface BiltyTrackerProps {
  initialBiltyQuery?: string;
  onOpenNewSaleForDispatch?: (dispatchId: string) => void;
  onEditDispatch?: (dispatch: DispatchRecord) => void;
  onBack?: () => void;
}

export const BiltyTracker: React.FC<BiltyTrackerProps> = ({
  initialBiltyQuery = '',
  onOpenNewSaleForDispatch,
  onEditDispatch,
  onBack,
}) => {
  const [biltyInput, setBiltyInput] = useState(initialBiltyQuery);
  const [allBalances, setAllBalances] = useState<StockBalanceInfo[]>([]);
  const [biltyData, setBiltyData] = useState<{
    dispatch?: DispatchRecord;
    sales: SaleRecord[];
    balance?: StockBalanceInfo;
  } | null>(null);

  useEffect(() => {
    const load = () => {
      setAllBalances(storageService.getStockBalances());
    };
    load();
    return subscribeStorage(load);
  }, []);

  useEffect(() => {
    if (initialBiltyQuery) {
      setBiltyInput(initialBiltyQuery);
      performSearch(initialBiltyQuery);
    } else if (allBalances.length > 0) {
      // Default to first bilty
      setBiltyInput(allBalances[0].dispatch.biltyNumber);
      performSearch(allBalances[0].dispatch.biltyNumber);
    }
  }, [initialBiltyQuery, allBalances.length]);

  const performSearch = (query: string) => {
    const result = storageService.findBiltyDetails(query);
    setBiltyData(result);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(biltyInput);
  };

  const companySettings = storageService.getSettings();

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {onBack && (
            <button
              onClick={onBack}
              className="mb-2 flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Dispatches
            </button>
          )}
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Search className="h-4 w-4" /> Comprehensive Bilty Tracker
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bilty Details & Sales History</h1>
        </div>

        {/* Bilty Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Bilty Number (e.g. B-1050)..."
              value={biltyInput}
              onChange={(e) => setBiltyInput(e.target.value)}
              className="w-64 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500"
          >
            Lookup
          </button>
        </form>
      </div>

      {/* Quick Select Buttons from Recent Bilties */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-xs font-semibold text-slate-500">Quick Bilties:</span>
        {allBalances.slice(0, 8).map((b) => (
          <button
            key={b.dispatch.id}
            onClick={() => {
              setBiltyInput(b.dispatch.biltyNumber);
              performSearch(b.dispatch.biltyNumber);
            }}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-colors ${
              biltyData?.dispatch?.biltyNumber === b.dispatch.biltyNumber
                ? 'bg-blue-600 text-white shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {b.dispatch.biltyNumber} ({b.remainingQty} left)
          </button>
        ))}
      </div>

      {!biltyData || !biltyData.dispatch ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <Search className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">No Bilty Record Found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Please enter a valid Bilty Number above or select one from the quick options list.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status & Summary Header Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                      Bilty #{biltyData.dispatch.biltyNumber}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ${
                        biltyData.balance?.statusColor === 'green'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : biltyData.balance?.statusColor === 'yellow'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}
                    >
                      {biltyData.balance?.statusColor === 'green' && <CheckCircle2 className="h-3.5 w-3.5" />}
                      {biltyData.balance?.statusColor === 'yellow' && <AlertTriangle className="h-3.5 w-3.5" />}
                      {biltyData.balance?.statusColor === 'red' && <XCircle className="h-3.5 w-3.5" />}
                      {biltyData.balance?.statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispatched on {biltyData.dispatch.dispatchDate} • In Stock for{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{biltyData.balance?.daysInStock} Days</strong>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {biltyData.balance && biltyData.balance.remainingQty > 0 && onOpenNewSaleForDispatch && (
                  <button
                    onClick={() => onOpenNewSaleForDispatch(biltyData.dispatch!.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
                  >
                    <ShoppingCart className="h-4 w-4" /> Record Sale
                  </button>
                )}
                {onEditDispatch && (
                  <button
                    onClick={() => onEditDispatch(biltyData.dispatch!)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Edit Dispatch
                  </button>
                )}
                <button
                  onClick={() => printStockReport([biltyData.balance!], companySettings, `Bilty ${biltyData.dispatch!.biltyNumber} Statement`, false)}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  <Printer className="h-4 w-4" /> Print Statement
                </button>
              </div>
            </div>

            {/* Metric Counters */}
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Original Dispatched</span>
                <p className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {biltyData.dispatch.quantity} Bags
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40">
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Total Sold</span>
                <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">
                  {biltyData.balance?.totalSold} Bags
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
                <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Remaining Stock</span>
                <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {biltyData.balance?.remainingQty} Bags
                </p>
              </div>
            </div>
          </div>

          {/* Dispatch Info Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Dispatch Specifications */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800 flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" /> Dispatch Specifications
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Item Name:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{biltyData.dispatch.itemName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Packing Type:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{biltyData.dispatch.packing}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Quality Grade:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">{biltyData.dispatch.quality || 'Super Fine Grade A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Loading From:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{biltyData.dispatch.loadingFrom || 'Main Mill Godown'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Gate Pass (GP) #:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{biltyData.dispatch.gpNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">SBV Number:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{biltyData.dispatch.sbvNumber || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Created By:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{biltyData.dispatch.createdBy || 'System'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Remarks:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{biltyData.dispatch.remarks || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Destination & Logistics */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 dark:text-white border-b border-slate-100 pb-2 dark:border-slate-800 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-600" /> Party & Logistics Details
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block">Customer Party:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{biltyData.dispatch.partyName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Destination Station:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{biltyData.dispatch.stationName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Transport Company:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{biltyData.dispatch.transportName || 'Direct Delivery'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Driver / Helper / Vehicle:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{biltyData.dispatch.helperNumber || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sales History Timeline Table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Sales Deduction History</h3>
                <p className="text-xs text-slate-500">Every sale registered against Bilty #{biltyData.dispatch.biltyNumber}</p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {biltyData.sales.length} Sales Entries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Sale & Pickup Date</th>
                    <th className="py-2.5 px-3">SBV Bill #</th>
                    <th className="py-2.5 px-3">Customer Party</th>
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3 text-right">Quantity Sold</th>
                    <th className="py-2.5 px-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {biltyData.sales.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No sales recorded yet against this Bilty. Total stock remains unsold ({biltyData.dispatch.quantity} Bags).
                      </td>
                    </tr>
                  ) : (
                    biltyData.sales.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{s.saleDate}</div>
                          {s.pickupDate && (
                            <div className="text-[10px] text-slate-500">Pickup: <span className="font-medium text-indigo-600 dark:text-indigo-400">{s.pickupDate}</span></div>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                          {s.sbvNumber || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                          {s.partyName || biltyData.dispatch?.partyName || '—'}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-blue-600 dark:text-blue-400">{s.invoiceNumber || '—'}</td>
                        <td className={`py-2.5 px-3 text-right font-extrabold whitespace-nowrap ${s.quantitySold < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {s.quantitySold} Bags
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{s.remarks || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
