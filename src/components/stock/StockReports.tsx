import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  Download,
  Filter,
  BarChart2,
  Calendar,
  Building2,
  MapPin,
  Package,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { exportStockToExcel, exportStockToCsv, printStockReport } from '../../services/exportService';
import { StockBalanceInfo } from '../../types';

export const StockReports: React.FC = () => {
  const [reportType, setReportType] = useState<'STOCK_BALANCE' | 'DISPATCH_SUMMARY' | 'SALES_SUMMARY'>('STOCK_BALANCE');
  const [stockBalances, setStockBalances] = useState<StockBalanceInfo[]>([]);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [partyFilter, setPartyFilter] = useState('ALL');
  const [stationFilter, setStationFilter] = useState('ALL');
  const [itemFilter, setItemFilter] = useState('ALL');
  const [hideZeroStock, setHideZeroStock] = useState<boolean>(true);

  useEffect(() => {
    const load = () => setStockBalances(storageService.getStockBalances());
    load();
    return subscribeStorage(load);
  }, []);

  const parties = storageService.getParties();
  const stations = storageService.getStations();
  const items = storageService.getItems();
  const settings = storageService.getSettings();

  const zeroStockCount = stockBalances.filter((b) => b.remainingQty <= 0).length;

  const filteredBalances = stockBalances.filter((b) => {
    if (hideZeroStock && b.remainingQty <= 0) return false;
    if (partyFilter !== 'ALL' && b.dispatch.partyName !== partyFilter) return false;
    if (stationFilter !== 'ALL' && b.dispatch.stationName !== stationFilter) return false;
    if (itemFilter !== 'ALL' && b.dispatch.itemName !== itemFilter) return false;

    if (startDate && b.dispatch.dispatchDate < startDate) return false;
    if (endDate && b.dispatch.dispatchDate > endDate) return false;

    return true;
  });

  const totalDispatched = filteredBalances.reduce((sum, b) => sum + b.dispatch.quantity, 0);
  const totalSold = filteredBalances.reduce((sum, b) => sum + b.totalSold, 0);
  const totalRemaining = filteredBalances.reduce((sum, b) => sum + b.remainingQty, 0);

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <FileText className="h-4 w-4" /> Stock Analytics & Audit
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Management Reports</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Generate and export dispatches, sales deductions, and live stock audit statements
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              const stockToExport = hideZeroStock ? filteredBalances.filter((b) => b.remainingQty > 0) : filteredBalances;
              exportStockToExcel(stockToExport, settings, 'Stock Inventory Audit Report');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Excel Export
          </button>
          <button
            onClick={() => {
              // Ensure zero entries (0 remaining) are never printed
              const stockToPrint = filteredBalances.filter((b) => b.remainingQty > 0);
              if (stockToPrint.length === 0) {
                alert('No stock records with remaining balance found to print.');
                return;
              }
              printStockReport(stockToPrint, settings, 'Stock Inventory Audit Report', true);
            }}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Printer className="h-4 w-4" /> Print Report
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
        <button
          onClick={() => setReportType('STOCK_BALANCE')}
          className={`flex-1 rounded-lg py-2 transition-colors ${
            reportType === 'STOCK_BALANCE' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-blue-300' : ''
          }`}
        >
          Live Stock Balance Statement
        </button>
        <button
          onClick={() => setReportType('DISPATCH_SUMMARY')}
          className={`flex-1 rounded-lg py-2 transition-colors ${
            reportType === 'DISPATCH_SUMMARY' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-blue-300' : ''
          }`}
        >
          Dispatch Summary Report
        </button>
        <button
          onClick={() => setReportType('SALES_SUMMARY')}
          className={`flex-1 rounded-lg py-2 transition-colors ${
            reportType === 'SALES_SUMMARY' ? 'bg-white shadow text-blue-600 dark:bg-slate-700 dark:text-blue-300' : ''
          }`}
        >
          Sales & Deductions Register
        </button>
      </div>

      {/* Filter Parameters Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Customer Party</label>
            <select
              value={partyFilter}
              onChange={(e) => setPartyFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Parties</option>
              {parties.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Station</label>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Stations</option>
              {stations.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Item / Pulse</label>
            <select
              value={itemFilter}
              onChange={(e) => setItemFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Items</option>
              {items.map((i) => (
                <option key={i.id} value={i.itemName}>
                  {i.itemName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Date Range</label>
            <div className="flex items-center gap-1">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Hide Zero Stock Checkbox & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hideZeroStock}
              onChange={(e) => setHideZeroStock(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800"
            />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              Hide Zero Remaining Entries (0 Stock / Fully Sold)
            </span>
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {hideZeroStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                Active lots only ({filteredBalances.length} shown{zeroStockCount > 0 ? `, ${zeroStockCount} zero-stock lots hidden` : ''})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                All lots shown ({filteredBalances.length} records)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary Totals Cards */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Dispatched</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDispatched.toLocaleString()} Bags</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Total Sold</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{totalSold.toLocaleString()} Bags</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/30">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Remaining Live Stock</span>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300">{totalRemaining.toLocaleString()} Bags</p>
        </div>
      </div>

      {/* Report Table View */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-3 px-3.5">Dispatch Date</th>
                <th className="py-3 px-3.5">Bilty #</th>
                <th className="py-3 px-3.5">Item Name</th>
                <th className="py-3 px-3.5 text-right">Dispatch Qty</th>
                <th className="py-3 px-3.5 text-right">Sold Qty</th>
                <th className="py-3 px-3.5 text-right">Remaining Stock</th>
                <th className="py-3 px-3.5">Party</th>
                <th className="py-3 px-3.5">Station</th>
                <th className="py-3 px-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No records matched report filter criteria.
                  </td>
                </tr>
              ) : (
                filteredBalances.map((b) => (
                  <tr key={b.dispatch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.dispatchDate}</td>
                    <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">{b.dispatch.biltyNumber}</td>
                    <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200">{b.dispatch.itemName}</td>
                    <td className="py-2.5 px-3.5 text-right font-medium text-slate-800 dark:text-slate-200">{b.dispatch.quantity}</td>
                    <td className="py-2.5 px-3.5 text-right font-bold text-blue-600 dark:text-blue-400">{b.totalSold}</td>
                    <td className="py-2.5 px-3.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{b.remainingQty}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.partyName}</td>
                    <td className="py-2.5 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.stationName}</td>
                    <td className="py-2.5 px-3.5 text-center">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.statusColor === 'green'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.statusColor === 'yellow'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {b.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
