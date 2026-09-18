import React, { useState } from 'react';
import {
  Package,
  Truck,
  ShoppingCart,
  Search,
  FileSpreadsheet,
  Settings,
  BarChart2,
  Plus,
  Upload,
} from 'lucide-react';
import { StockAlertsBanner } from './StockAlertsBanner';
import { StockDashboard } from './StockDashboard';
import { LiveStockBalance } from './LiveStockBalance';
import { DispatchList } from './DispatchList';
import { DispatchFormModal } from './DispatchFormModal';
import { SalesList } from './SalesList';
import { SaleFormModal } from './SaleFormModal';
import { BiltyTracker } from './BiltyTracker';
import { StockMasterData } from './StockMasterData';
import { StockReports } from './StockReports';
import { ImportDispatchesModal } from './ImportDispatchesModal';
import { DispatchRecord, SaleRecord } from '../../types';
import { storageService } from '../../services/storageService';

interface StockModuleProps {
  initialSubTab?: string;
}

export const StockModule: React.FC<StockModuleProps> = ({ initialSubTab = 'dashboard' }) => {
  const [currentTab, setCurrentTab] = useState<string>(initialSubTab);

  // Modal States
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchToEdit, setDispatchToEdit] = useState<DispatchRecord | null>(null);

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleToEdit, setSaleToEdit] = useState<SaleRecord | null>(null);
  const [preselectedDispatchIdForSale, setPreselectedDispatchIdForSale] = useState<string | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedBiltyForTracker, setSelectedBiltyForTracker] = useState<string>('');

  // Handlers
  const handleOpenNewDispatch = () => {
    if (!storageService.hasPermission('canManageStock')) {
      alert('Permission Denied: Stock dispatch management requires Stock Management permission.');
      return;
    }
    setDispatchToEdit(null);
    setIsDispatchModalOpen(true);
  };

  const handleOpenEditDispatch = (dispatch: DispatchRecord) => {
    if (!storageService.hasPermission('canManageStock')) {
      alert('Permission Denied: Stock dispatch management requires Stock Management permission.');
      return;
    }
    setDispatchToEdit(dispatch);
    setIsDispatchModalOpen(true);
  };

  const handleOpenNewSale = (dispatchId?: string) => {
    if (!storageService.hasPermission('canManageStock')) {
      alert('Permission Denied: Sale recording requires Stock Management permission.');
      return;
    }
    setSaleToEdit(null);
    setPreselectedDispatchIdForSale(dispatchId || null);
    setIsSaleModalOpen(true);
  };

  const handleOpenEditSale = (sale: SaleRecord) => {
    if (!storageService.hasPermission('canManageStock')) {
      alert('Permission Denied: Sale editing requires Stock Management permission.');
      return;
    }
    setSaleToEdit(sale);
    setPreselectedDispatchIdForSale(sale.dispatchId);
    setIsSaleModalOpen(true);
  };

  const handleOpenBiltyLookup = (bilty?: string) => {
    if (bilty) {
      setSelectedBiltyForTracker(bilty);
    }
    setCurrentTab('bilty-lookup');
  };

  return (
    <div className="space-y-6">
      {/* Stock Alerts Banner */}
      <StockAlertsBanner onSelectBilty={handleOpenBiltyLookup} />

      {/* Module Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold text-slate-700 dark:bg-slate-800/80 dark:text-slate-200">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'dashboard'
                ? 'bg-white shadow text-blue-600 dark:bg-slate-900 dark:text-blue-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="h-4 w-4" /> Overview
          </button>

          <button
            onClick={() => setCurrentTab('live-stock')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'live-stock'
                ? 'bg-white shadow text-emerald-600 dark:bg-slate-900 dark:text-emerald-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Package className="h-4 w-4" /> Live Stock Balance
          </button>

          <button
            onClick={() => setCurrentTab('dispatches')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'dispatches'
                ? 'bg-white shadow text-blue-600 dark:bg-slate-900 dark:text-blue-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Truck className="h-4 w-4" /> Dispatches (Bilties)
          </button>

          <button
            onClick={() => setCurrentTab('sales')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'sales'
                ? 'bg-white shadow text-emerald-600 dark:bg-slate-900 dark:text-emerald-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <ShoppingCart className="h-4 w-4" /> Sales Register
          </button>

          <button
            onClick={() => setCurrentTab('bilty-lookup')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'bilty-lookup'
                ? 'bg-white shadow text-indigo-600 dark:bg-slate-900 dark:text-indigo-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Search className="h-4 w-4" /> Bilty Tracker
          </button>

          <button
            onClick={() => setCurrentTab('reports')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'reports'
                ? 'bg-white shadow text-blue-600 dark:bg-slate-900 dark:text-blue-400'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <BarChart2 className="h-4 w-4" /> Reports
          </button>

          <button
            onClick={() => setCurrentTab('master-data')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 transition-all ${
              currentTab === 'master-data'
                ? 'bg-white shadow text-slate-900 dark:bg-slate-900 dark:text-white'
                : 'hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            <Settings className="h-4 w-4" /> Master Setup
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Upload className="h-4 w-4 text-blue-600" /> Import Excel/CSV
          </button>
        </div>
      </div>

      {/* Main Tab Content Display */}
      {currentTab === 'dashboard' && (
        <StockDashboard
          onNavigateTab={(tab) => setCurrentTab(tab)}
          onOpenNewDispatch={handleOpenNewDispatch}
          onOpenNewSale={() => handleOpenNewSale()}
          onOpenBiltySearch={handleOpenBiltyLookup}
        />
      )}

      {currentTab === 'live-stock' && (
        <LiveStockBalance
          onOpenNewSaleForBilty={(dispatchId) => handleOpenNewSale(dispatchId)}
          onOpenBiltyDetails={handleOpenBiltyLookup}
          onOpenNewDispatch={handleOpenNewDispatch}
        />
      )}

      {currentTab === 'dispatches' && (
        <DispatchList
          onOpenNewDispatch={handleOpenNewDispatch}
          onEditDispatch={handleOpenEditDispatch}
          onOpenBiltyDetails={handleOpenBiltyLookup}
          onOpenNewSaleForDispatch={(dispatchId) => handleOpenNewSale(dispatchId)}
        />
      )}

      {currentTab === 'sales' && (
        <SalesList
          onOpenNewSale={() => handleOpenNewSale()}
          onEditSale={handleOpenEditSale}
          onOpenBiltyDetails={handleOpenBiltyLookup}
        />
      )}

      {currentTab === 'bilty-lookup' && (
        <BiltyTracker
          initialBiltyQuery={selectedBiltyForTracker}
          onOpenNewSaleForDispatch={(dispatchId) => handleOpenNewSale(dispatchId)}
          onEditDispatch={handleOpenEditDispatch}
          onBack={() => setCurrentTab('dispatches')}
        />
      )}

      {currentTab === 'reports' && <StockReports />}

      {currentTab === 'master-data' && <StockMasterData />}

      {/* Modals */}
      <DispatchFormModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        dispatchToEdit={dispatchToEdit}
      />

      <SaleFormModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        saleToEdit={saleToEdit}
        preselectedDispatchId={preselectedDispatchIdForSale}
      />

      <ImportDispatchesModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
      />
    </div>
  );
};
