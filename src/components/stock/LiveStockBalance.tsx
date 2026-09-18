import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  Download,
  Printer,
  Plus,
  ShoppingCart,
  Eye,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { exportStockToExcel, exportStockToCsv, printStockReport } from '../../services/exportService';
import { StockBalanceInfo } from '../../types';

interface LiveStockBalanceProps {
  onOpenNewSaleForBilty?: (dispatchId: string) => void;
  onOpenBiltyDetails?: (bilty: string) => void;
  onOpenNewDispatch?: () => void;
}

export const LiveStockBalance: React.FC<LiveStockBalanceProps> = ({
  onOpenNewSaleForBilty,
  onOpenBiltyDetails,
  onOpenNewDispatch,
}) => {
  const [balances, setBalances] = useState<StockBalanceInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'FULLY_SOLD'>('ALL');
  const [selectedItem, setSelectedItem] = useState<string>('ALL');
  const [selectedStation, setSelectedStation] = useState<string>('ALL');

  useEffect(() => {
    const load = () => setBalances(storageService.getStockBalances());
    load();
    return subscribeStorage(load);
  }, []);

  const itemsList = storageService.getItems();
  const stationsList = storageService.getStations();
  const companySettings = storageService.getSettings();

  // Filtered List
  const filteredBalances = balances.filter((b) => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const matchBilty = b.dispatch.biltyNumber.toLowerCase().includes(query);
      const matchItem = b.dispatch.itemName.toLowerCase().includes(query);
      const matchParty = b.dispatch.partyName.toLowerCase().includes(query);
      const matchStation = b.dispatch.stationName.toLowerCase().includes(query);
      const matchGp = (b.dispatch.gpNumber || '').toLowerCase().includes(query);
      const matchSbv = (b.dispatch.sbvNumber || '').toLowerCase().includes(query);
      if (!matchBilty && !matchItem && !matchParty && !matchStation && !matchGp && !matchSbv) {
        return false;
      }
    }

    if (statusFilter === 'IN_STOCK' && (b.statusColor !== 'green' || b.remainingQty === 0)) return false;
    if (statusFilter === 'LOW_STOCK' && b.statusColor !== 'yellow') return false;
    if (statusFilter === 'FULLY_SOLD' && b.remainingQty > 0) return false;

    if (selectedItem !== 'ALL' && b.dispatch.itemName !== selectedItem) return false;
    if (selectedStation !== 'ALL' && b.dispatch.stationName !== selectedStation) return false;

    return true;
  });

  // Aggregated Summary
  const totalDispatched = filteredBalances.reduce((sum, b) => sum + b.dispatch.quantity, 0);
  const totalSold = filteredBalances.reduce((sum, b) => sum + b.totalSold, 0);
  const totalRemaining = filteredBalances.reduce((sum, b) => sum + b.remainingQty, 0);

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Package className="h-4 w-4" /> Real-Time Inventory Control
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Live Stock Balance Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Dispatches, sold deductions, remaining bags, and color-coded stock warnings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportStockToExcel(filteredBalances, companySettings)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Excel
          </button>
          <button
            onClick={() => exportStockToCsv(filteredBalances)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-blue-600" /> CSV
          </button>
          <button
            onClick={() => printStockReport(filteredBalances, companySettings)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Printer className="h-4 w-4 text-slate-600" /> Print
          </button>
          <button
            onClick={onOpenNewDispatch}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" /> New Dispatch
          </button>
        </div>
      </div>

      {/* Metric Highlights Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Filtered Bilties</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{filteredBalances.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-slate-500 uppercase">Dispatched Bags</span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white">{totalDispatched.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase">Sold Bags</span>
          <p className="text-xl font-extrabold text-blue-600 dark:text-blue-400">{totalSold.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Remaining Stock</span>
          <p className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">{totalRemaining.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by Bilty #, Item, Party, Station, GP #, SBV #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Tabs */}
          <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === 'ALL' ? 'bg-white shadow text-slate-900 dark:bg-slate-700 dark:text-white' : ''
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('IN_STOCK')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === 'IN_STOCK' ? 'bg-white shadow text-emerald-700 dark:bg-slate-700 dark:text-emerald-300' : ''
              }`}
            >
              In Stock (&gt;50%)
            </button>
            <button
              onClick={() => setStatusFilter('LOW_STOCK')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === 'LOW_STOCK' ? 'bg-white shadow text-amber-700 dark:bg-slate-700 dark:text-amber-300' : ''
              }`}
            >
              Low Stock (&lt;50%)
            </button>
            <button
              onClick={() => setStatusFilter('FULLY_SOLD')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                statusFilter === 'FULLY_SOLD' ? 'bg-white shadow text-red-700 dark:bg-slate-700 dark:text-red-300' : ''
              }`}
            >
              Fully Sold
            </button>
          </div>

          {/* Item Dropdown */}
          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Items</option>
            {itemsList.map((i) => (
              <option key={i.id} value={i.itemName}>
                {i.itemName}
              </option>
            ))}
          </select>

          {/* Station Dropdown */}
          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Stations</option>
            {stationsList.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Stock Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-3 px-3.5">Dispatch Date</th>
                <th className="py-3 px-3.5">Bilty #</th>
                <th className="py-3 px-3.5">Item Name</th>
                <th className="py-3 px-3.5">Packing</th>
                <th className="py-3 px-3.5 text-right">Dispatch Qty</th>
                <th className="py-3 px-3.5 text-right">Sold Qty</th>
                <th className="py-3 px-3.5 text-right">Remaining</th>
                <th className="py-3 px-3.5">Party</th>
                <th className="py-3 px-3.5">Station</th>
                <th className="py-3 px-3.5 text-center">In Stock Age</th>
                <th className="py-3 px-3.5 text-center">Status</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBalances.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    No stock records found matching your current filter parameters.
                  </td>
                </tr>
              ) : (
                filteredBalances.map((b) => (
                  <tr
                    key={b.dispatch.id}
                    className={`transition-colors hover:bg-slate-50/90 dark:hover:bg-slate-800/50 ${
                      b.remainingQty === 0 ? 'bg-slate-50/40 dark:bg-slate-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {b.dispatch.dispatchDate}
                    </td>
                    <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {b.dispatch.biltyNumber}
                      {b.dispatch.gpNumber && (
                        <span className="block text-[10px] font-normal text-slate-400">GP: {b.dispatch.gpNumber}</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{b.dispatch.itemName}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        {b.dispatch.quality || 'Super Fine'} • 📍 {b.dispatch.loadingFrom || 'Main Godown'}
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">{b.dispatch.packing}</td>
                    <td className="py-3 px-3.5 text-right font-medium text-slate-800 dark:text-slate-200">
                      {b.dispatch.quantity}
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-blue-600 dark:text-blue-400">
                      {b.totalSold}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-extrabold ${
                        b.remainingQty === 0
                          ? 'text-red-600 dark:text-red-400'
                          : b.statusColor === 'yellow'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {b.remainingQty}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.partyName}</td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.stationName}</td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          b.daysInStock >= 30 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <Clock className="h-3 w-3" /> {b.daysInStock} Days
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          b.statusColor === 'green'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : b.statusColor === 'yellow'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        }`}
                      >
                        {b.statusColor === 'green' && <CheckCircle2 className="h-3 w-3" />}
                        {b.statusColor === 'yellow' && <AlertTriangle className="h-3 w-3" />}
                        {b.statusColor === 'red' && <XCircle className="h-3 w-3" />}
                        {b.statusLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {b.remainingQty > 0 && onOpenNewSaleForBilty && (
                          <button
                            onClick={() => onOpenNewSaleForBilty(b.dispatch.id)}
                            className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-emerald-500"
                            title="Record Sale against this Bilty"
                          >
                            <ShoppingCart className="h-3 w-3" /> Sale
                          </button>
                        )}
                        {onOpenBiltyDetails && (
                          <button
                            onClick={() => onOpenBiltyDetails(b.dispatch.biltyNumber)}
                            className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                            title="View Full Bilty Timeline"
                          >
                            <Eye className="h-3 w-3" /> Details
                          </button>
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
    </div>
  );
};
