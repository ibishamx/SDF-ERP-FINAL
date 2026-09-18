import React, { useState, useEffect } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Printer,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { exportStockToExcel, exportStockToCsv, printStockReport } from '../../services/exportService';
import { DispatchRecord, StockBalanceInfo } from '../../types';

interface DispatchListProps {
  onOpenNewDispatch: () => void;
  onEditDispatch: (dispatch: DispatchRecord) => void;
  onOpenBiltyDetails: (bilty: string) => void;
  onOpenNewSaleForDispatch: (dispatchId: string) => void;
}

export const DispatchList: React.FC<DispatchListProps> = ({
  onOpenNewDispatch,
  onEditDispatch,
  onOpenBiltyDetails,
  onOpenNewSaleForDispatch,
}) => {
  const [stockList, setStockList] = useState<StockBalanceInfo[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParty, setSelectedParty] = useState('ALL');
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const load = () => setStockList(storageService.getStockBalances());
    load();
    return subscribeStorage(load);
  }, []);

  const parties = storageService.getParties();
  const stations = storageService.getStations();
  const items = storageService.getItems();
  const settings = storageService.getSettings();

  const handleDuplicate = (id: string) => {
    const res = storageService.duplicateDispatch(id);
    if (res.success) {
      alert(`Dispatch duplicated successfully as Bilty "${res.dispatch?.biltyNumber}"`);
    } else {
      alert(res.message || 'Failed to duplicate dispatch record.');
    }
  };

  const handleDelete = (id: string, bilty: string) => {
    if (confirm(`Are you sure you want to delete Dispatch record Bilty "${bilty}"?`)) {
      storageService.deleteDispatch(id);
    }
  };

  const filtered = stockList.filter((b) => {
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const mBilty = b.dispatch.biltyNumber.toLowerCase().includes(q);
      const mGp = (b.dispatch.gpNumber || '').toLowerCase().includes(q);
      const mSbv = (b.dispatch.sbvNumber || '').toLowerCase().includes(q);
      const mItem = b.dispatch.itemName.toLowerCase().includes(q);
      const mQuality = (b.dispatch.quality || '').toLowerCase().includes(q);
      const mLoading = (b.dispatch.loadingFrom || '').toLowerCase().includes(q);
      const mParty = b.dispatch.partyName.toLowerCase().includes(q);
      const mStation = b.dispatch.stationName.toLowerCase().includes(q);
      const mTrp = (b.dispatch.transportName || '').toLowerCase().includes(q);
      if (!mBilty && !mGp && !mSbv && !mItem && !mQuality && !mLoading && !mParty && !mStation && !mTrp) return false;
    }

    if (selectedParty !== 'ALL' && b.dispatch.partyName !== selectedParty) return false;
    if (selectedStation !== 'ALL' && b.dispatch.stationName !== selectedStation) return false;
    if (selectedItem !== 'ALL' && b.dispatch.itemName !== selectedItem) return false;

    if (startDate && b.dispatch.dispatchDate < startDate) return false;
    if (endDate && b.dispatch.dispatchDate > endDate) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Truck className="h-4 w-4" /> Factory Dispatch Operations
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dispatches & Bilties Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, edit, duplicate dispatches, track driver helper details, and print bilties
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportStockToExcel(filtered, settings, 'Dispatch Register Report')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-4 w-4 text-emerald-600" /> Export Excel
          </button>
          <button
            onClick={onOpenNewDispatch}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" /> Create New Dispatch
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Bilty #, GP #, SBV #, Party, Item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <select
            value={selectedParty}
            onChange={(e) => setSelectedParty(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Parties</option>
            {parties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStation}
            onChange={(e) => setSelectedStation(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Stations</option>
            {stations.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="ALL">All Items</option>
            {items.map((i) => (
              <option key={i.id} value={i.itemName}>
                {i.itemName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-500">Dispatch Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="text-xs text-red-600 hover:underline"
              >
                Clear Dates
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900 dark:text-white">{filtered.length}</strong> dispatches
          </div>
        </div>
      </div>

      {/* Dispatches Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Bilty # / Identifiers</th>
                <th className="py-3 px-3.5">Item & Packing</th>
                <th className="py-3 px-3.5 text-right">Dispatch Qty</th>
                <th className="py-3 px-3.5 text-right">Sold</th>
                <th className="py-3 px-3.5 text-right">Remaining</th>
                <th className="py-3 px-3.5">Party</th>
                <th className="py-3 px-3.5">Station</th>
                <th className="py-3 px-3.5">Transport & Helper</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No dispatch records found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.dispatch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {b.dispatch.dispatchDate}
                    </td>
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 dark:text-white">{b.dispatch.biltyNumber}</div>
                      <div className="text-[10px] text-slate-500">
                        {b.dispatch.gpNumber && `GP: ${b.dispatch.gpNumber} `}
                        {b.dispatch.sbvNumber && `• SBV: ${b.dispatch.sbvNumber}`}
                      </div>
                    </td>
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">{b.dispatch.itemName}</div>
                      <div className="text-[10px] text-slate-500">{b.dispatch.packing}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span className="inline-block rounded-md bg-indigo-50 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                          {b.dispatch.quality || 'Super Fine'}
                        </span>
                        <span className="inline-block rounded-md bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                          📍 {b.dispatch.loadingFrom || 'Main Godown'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-slate-900 dark:text-white">
                      {b.dispatch.quantity}
                    </td>
                    <td className="py-3 px-3.5 text-right font-semibold text-blue-600 dark:text-blue-400">
                      {b.totalSold}
                    </td>
                    <td
                      className={`py-3 px-3.5 text-right font-bold ${
                        b.remainingQty === 0
                          ? 'text-red-600 dark:text-red-400'
                          : b.statusColor === 'yellow'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {b.remainingQty}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 font-medium">
                      {b.dispatch.partyName}
                    </td>
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">{b.dispatch.stationName}</td>
                    <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400">
                      <div>{b.dispatch.transportName || 'N/A'}</div>
                      {b.dispatch.helperNumber && (
                        <div className="text-[10px] text-slate-400">H: {b.dispatch.helperNumber}</div>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onOpenBiltyDetails(b.dispatch.biltyNumber)}
                          className="rounded-md p-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                          title="View Full Bilty Timeline"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {b.remainingQty > 0 && (
                          <button
                            onClick={() => onOpenNewSaleForDispatch(b.dispatch.id)}
                            className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300"
                            title="Add Sale"
                          >
                            + Sale
                          </button>
                        )}

                        <button
                          onClick={() => onEditDispatch(b.dispatch)}
                          className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                          title="Edit Dispatch"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(b.dispatch.id)}
                          className="rounded-md p-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950"
                          title="Duplicate Dispatch Record"
                        >
                          <Copy className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(b.dispatch.id, b.dispatch.biltyNumber)}
                          className="rounded-md p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950"
                          title="Delete Dispatch"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
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
