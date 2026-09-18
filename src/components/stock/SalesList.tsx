import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Download,
  Printer,
  Calendar,
  FileSpreadsheet,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { SaleRecord, DispatchRecord } from '../../types';

interface SalesListProps {
  onOpenNewSale: () => void;
  onEditSale: (sale: SaleRecord) => void;
  onOpenBiltyDetails: (bilty: string) => void;
}

export const SalesList: React.FC<SalesListProps> = ({
  onOpenNewSale,
  onEditSale,
  onOpenBiltyDetails,
}) => {
  const [sales, setSales] = useState<SaleRecord[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const load = () => {
      setSales(storageService.getSales().filter((s) => !s.isDeleted));
      setDispatches(storageService.getDispatches().filter((d) => !d.isDeleted));
    };
    load();
    return subscribeStorage(load);
  }, []);

  const handleDelete = (id: string, bilty: string, qty: number) => {
    if (confirm(`Are you sure you want to delete sale of ${qty} bags against Bilty "${bilty}"? The stock balance will be restored automatically.`)) {
      storageService.deleteSale(id);
    }
  };

  const dispatchMap = new Map<string, DispatchRecord>(dispatches.map((d) => [d.id, d]));

  const filteredSales = sales.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const dispatch = dispatchMap.get(s.dispatchId);

    if (q) {
      const matchBilty = s.biltyNumber.toLowerCase().includes(q);
      const matchInvoice = (s.invoiceNumber || '').toLowerCase().includes(q);
      const matchSbv = (s.sbvNumber || '').toLowerCase().includes(q);
      const matchItem = dispatch ? dispatch.itemName.toLowerCase().includes(q) : false;
      const matchParty = (s.partyName || (dispatch ? dispatch.partyName : '')).toLowerCase().includes(q);
      if (!matchBilty && !matchInvoice && !matchSbv && !matchItem && !matchParty) return false;
    }

    if (startDate && s.saleDate < startDate) return false;
    if (endDate && s.saleDate > endDate) return false;

    return true;
  });

  const totalSoldBags = filteredSales.reduce((sum, s) => sum + s.quantitySold, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <ShoppingCart className="h-4 w-4" /> Customer Sales & Deliveries
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Register</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record customer sale bills, SBV vouchers, and pickup dates. Stock balances update in real-time.
          </p>
        </div>

        <button
          onClick={onOpenNewSale}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Record Sale Bill
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Bilty #, SBV Bill #, Invoice #, Item, or Party..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-slate-500">Sale Date:</span>
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
          <div className="rounded-lg bg-emerald-50 px-3 py-1 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Net Sold: {totalSoldBags.toLocaleString()} Bags
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                <th className="py-3 px-3.5">Sale & Pickup Date</th>
                <th className="py-3 px-3.5">SBV Bill #</th>
                <th className="py-3 px-3.5">Customer Party</th>
                <th className="py-3 px-3.5">Bilty Number</th>
                <th className="py-3 px-3.5 text-right">Quantity Sold</th>
                <th className="py-3 px-3.5">Item & Packing</th>
                <th className="py-3 px-3.5">Invoice #</th>
                <th className="py-3 px-3.5">Remarks</th>
                <th className="py-3 px-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No sales recorded matching current filters.
                  </td>
                </tr>
              ) : (
                filteredSales.map((s) => {
                  const dispatch = dispatchMap.get(s.dispatchId);
                  const effectiveParty = s.partyName || dispatch?.partyName || '—';
                  const isNegative = s.quantitySold < 0;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3.5 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-bold text-slate-900 dark:text-white">{s.saleDate}</div>
                        {s.pickupDate && (
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            Pickup: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{s.pickupDate}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {s.sbvNumber ? (
                          <span className="rounded-md bg-emerald-50 px-2 py-0.5 border border-emerald-200 dark:bg-emerald-950/60 dark:border-emerald-800">
                            {s.sbvNumber}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3.5 font-semibold text-slate-800 dark:text-slate-200">
                        {effectiveParty}
                      </td>
                      <td className="py-3 px-3.5 font-extrabold text-slate-900 dark:text-white whitespace-nowrap">
                        <button
                          onClick={() => onOpenBiltyDetails(s.biltyNumber)}
                          className="text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400"
                        >
                          {s.biltyNumber}
                        </button>
                      </td>
                      <td className={`py-3 px-3.5 text-right font-extrabold whitespace-nowrap ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {s.quantitySold} Bags
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {dispatch?.itemName || '—'}
                        </div>
                        <div className="text-[10px] text-slate-500">{dispatch?.packing || ''}</div>
                      </td>
                      <td className="py-3 px-3.5 font-medium text-slate-600 dark:text-slate-400">
                        {s.invoiceNumber || '—'}
                      </td>
                      <td className="py-3 px-3.5 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {s.remarks || '—'}
                      </td>
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditSale(s)}
                            className="rounded-md p-1 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950 cursor-pointer"
                            title="Edit Sale Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.biltyNumber, s.quantitySold)}
                            className="rounded-md p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950 cursor-pointer"
                            title="Delete Sale Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
