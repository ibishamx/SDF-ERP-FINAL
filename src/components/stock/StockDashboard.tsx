import React, { useState, useEffect } from 'react';
import {
  Package,
  Truck,
  TrendingUp,
  Clock,
  AlertCircle,
  Building2,
  Box,
  Plus,
  Search,
  ShoppingCart,
  CheckCircle2,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { storageService, subscribeStorage } from '../../services/storageService';
import { StockBalanceInfo } from '../../types';

interface StockDashboardProps {
  onNavigateTab: (tab: string) => void;
  onOpenNewDispatch: () => void;
  onOpenNewSale: () => void;
  onOpenBiltySearch: (bilty?: string) => void;
}

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#f59e0b'];

export const StockDashboard: React.FC<StockDashboardProps> = ({
  onNavigateTab,
  onOpenNewDispatch,
  onOpenNewSale,
  onOpenBiltySearch,
}) => {
  const [stockBalances, setStockBalances] = useState<StockBalanceInfo[]>([]);
  const [searchBiltyInput, setSearchBiltyInput] = useState('');

  useEffect(() => {
    const loadData = () => {
      setStockBalances(storageService.getStockBalances());
    };
    loadData();
    return subscribeStorage(loadData);
  }, []);

  // Compute Metrics
  const totalDispatches = stockBalances.length;
  const totalDispatchedBags = stockBalances.reduce((sum, b) => sum + b.dispatch.quantity, 0);
  const totalSoldBags = stockBalances.reduce((sum, b) => sum + b.totalSold, 0);
  const totalRemainingBags = stockBalances.reduce((sum, b) => sum + b.remainingQty, 0);

  const activeStockCount = stockBalances.filter((b) => b.remainingQty > 0).length;
  const lowStockCount = stockBalances.filter((b) => b.statusColor === 'yellow').length;
  const oldStockCount = stockBalances.filter((b) => b.remainingQty > 0 && b.daysInStock >= 30).length;

  const totalParties = storageService.getParties().length;
  const totalItems = storageService.getItems().length;

  // Monthly Dispatches vs Sales Data for Recharts
  const monthlyMap: { [key: string]: { month: string; dispatched: number; sold: number } } = {};

  stockBalances.forEach((b) => {
    const monthKey = b.dispatch.dispatchDate.slice(0, 7); // YYYY-MM
    if (!monthlyMap[monthKey]) {
      const monthName = new Date(b.dispatch.dispatchDate).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      });
      monthlyMap[monthKey] = { month: monthName, dispatched: 0, sold: 0 };
    }
    monthlyMap[monthKey].dispatched += b.dispatch.quantity;
    monthlyMap[monthKey].sold += b.totalSold;
  });

  const monthlyChartData = Object.values(monthlyMap).reverse();

  // Item-wise Stock Distribution
  const itemMap: { [key: string]: number } = {};
  stockBalances.forEach((b) => {
    itemMap[b.dispatch.itemName] = (itemMap[b.dispatch.itemName] || 0) + b.remainingQty;
  });
  const itemPieData = Object.keys(itemMap).map((itemName) => ({
    name: itemName,
    value: itemMap[itemName],
  }));

  // Station-wise Stock Distribution
  const stationMap: { [key: string]: number } = {};
  stockBalances.forEach((b) => {
    stationMap[b.dispatch.stationName] = (stationMap[b.dispatch.stationName] || 0) + b.remainingQty;
  });
  const stationBarData = Object.keys(stationMap).map((stn) => ({
    station: stn,
    bags: stationMap[stn],
  }));

  // Top Selling Items (by total sold bags)
  const topSellingMap: { [key: string]: number } = {};
  stockBalances.forEach((b) => {
    topSellingMap[b.dispatch.itemName] = (topSellingMap[b.dispatch.itemName] || 0) + b.totalSold;
  });
  const topSellingItems = Object.entries(topSellingMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const handleBiltySearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchBiltyInput.trim()) {
      onOpenBiltySearch(searchBiltyInput.trim());
    }
  };

  return (
    <div className="space-[#1e293b] space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
            <Package className="h-4 w-4" /> Live Stock Control Dashboard
          </div>
          <h1 className="mt-1 text-2xl font-bold text-white">Stock & Dispatch Operations</h1>
          <p className="mt-1 text-sm text-slate-300">
            Real-time balance tracking, automatic sales deduction, and Bilty lifecycle management.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenNewDispatch}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-500 active:scale-95"
          >
            <Plus className="h-4 w-4" /> Dispatch Stock
          </button>
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-emerald-500 active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" /> Record Sale
          </button>
        </div>
      </div>

      {/* Quick Bilty Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <form onSubmit={handleBiltySearchSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Instant Bilty Lookup (e.g. B-1050, GP-8801, Party or Item)..."
              value={searchBiltyInput}
              onChange={(e) => setSearchBiltyInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Search className="h-4 w-4" /> Search Bilty
          </button>
        </form>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Stock Remaining */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Current Live Stock
            </span>
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalRemainingBags.toLocaleString()} <span className="text-sm font-semibold text-slate-500">Bags</span>
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Dispatched: {totalDispatchedBags.toLocaleString()}</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Sold: {totalSoldBags.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Total Dispatches */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Dispatches (Bilties)
            </span>
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
              <Truck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalDispatches}</span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-blue-400 font-semibold">{activeStockCount} Active Bilties in stock</span>
            </div>
          </div>
        </div>

        {/* Total Sales Completed */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Bags Sold
            </span>
            <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {totalSoldBags.toLocaleString()} <span className="text-sm font-semibold text-slate-500">Bags</span>
            </span>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {totalDispatchedBags > 0
                  ? `${Math.round((totalSoldBags / totalDispatchedBags) * 100)}% of total dispatch sold`
                  : '0% sold'}
              </span>
            </div>
          </div>
        </div>

        {/* Low Stock & Old Stock Alerts */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Stock Alerts
            </span>
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-extrabold text-amber-900 dark:text-amber-200">{lowStockCount}</span>
              <span className="ml-1 text-xs text-amber-700 dark:text-amber-400">Low Stock (&lt;50%)</span>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-amber-800 dark:text-amber-300">{oldStockCount}</span>
              <span className="block text-xs text-amber-700 dark:text-amber-400">Old (30+ Days)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Dispatch vs Sales Bar Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Monthly Dispatch vs Sales Volume</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Comparison of total dispatched bags vs sold bags</p>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="dispatched" name="Dispatched Bags" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="sold" name="Sold Bags" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Item-wise Remaining Stock Distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Live Stock by Pulse / Item Type</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of remaining unsold bags per item</p>
            </div>
            <Box className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={itemPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, value }) => `${name.slice(0, 15)}: ${value}b`}
                >
                  {itemPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Station-wise Distribution & Top Selling Items */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Selling Items */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-1">
          <h3 className="font-bold text-slate-900 dark:text-white">Top Selling Items</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Items with highest sales volume</p>
          <div className="space-y-3">
            {topSellingItems.map(([itemName, bags], idx) => (
              <div key={itemName} className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{itemName}</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{bags} Bags Sold</span>
              </div>
            ))}
          </div>
        </div>

        {/* Station-wise Stock Overview */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Station-wise Remaining Stock</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unsold bags accumulated at each destination market station</p>
            </div>
            <button
              onClick={() => onNavigateTab('live-stock')}
              className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              View Full Table <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stationBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="station" type="category" tick={{ fontSize: 11 }} width={140} />
                <Tooltip />
                <Bar dataKey="bags" name="Remaining Bags" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Dispatches Summary Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Active Stock Dispatches</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Overview of recent dispatches and live balances</p>
          </div>
          <button
            onClick={() => onNavigateTab('dispatches')}
            className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Manage Dispatches <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Bilty #</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-right">Dispatch Qty</th>
                <th className="py-2.5 px-3 text-right">Sold Qty</th>
                <th className="py-2.5 px-3 text-right">Remaining</th>
                <th className="py-2.5 px-3">Party</th>
                <th className="py-2.5 px-3">Station</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stockBalances.slice(0, 6).map((b) => (
                <tr key={b.dispatch.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{b.dispatch.dispatchDate}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 dark:text-white whitespace-nowrap">{b.dispatch.biltyNumber}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">{b.dispatch.itemName}</td>
                  <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">{b.dispatch.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-semibold text-blue-600 dark:text-blue-400">{b.totalSold}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-bold ${
                      b.remainingQty === 0
                        ? 'text-red-600 dark:text-red-400'
                        : b.remainingQty <= b.dispatch.quantity * 0.5
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {b.remainingQty}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{b.dispatch.partyName}</td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{b.dispatch.stationName}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        b.statusColor === 'green'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                          : b.statusColor === 'yellow'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300'
                      }`}
                    >
                      {b.statusLabel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => onOpenBiltySearch(b.dispatch.biltyNumber)}
                      className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                    >
                      Lookup
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
