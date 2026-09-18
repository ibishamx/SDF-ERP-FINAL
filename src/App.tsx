import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardKPIs } from './components/dashboard/DashboardKPIs';
import { DashboardCharts } from './components/dashboard/DashboardCharts';
import { ChequeTable } from './components/cheques/ChequeTable';
import { ChequeStatsSummary } from './components/cheques/ChequeStatsSummary';
import { QuickFilterBar } from './components/cheques/QuickFilterBar';
import { BulkActionToolbar } from './components/cheques/BulkActionToolbar';
import { ChequeFormModal } from './components/cheques/ChequeFormModal';
import { ChequeDetailModal } from './components/cheques/ChequeDetailModal';
import { QuickClearModal } from './components/cheques/QuickClearModal';
import { QuickReturnModal } from './components/cheques/QuickReturnModal';
import { UtilitiesView } from './components/utilities/UtilitiesView';
import { StockModule } from './components/stock/StockModule';
import { PettyCashModule } from './components/pettyCash/PettyCashModule';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { LoginModal } from './components/auth/LoginModal';
import { LockScreenModal } from './components/auth/LockScreenModal';
import { ManualModal } from './components/ManualModal';

import { storageService, subscribeStorage } from './services/storageService';
import { exportToExcel, printChequeList } from './services/exportService';
import { Cheque, FilterState, CompanySettings, AuditLog } from './types';
import { Plus, FileSpreadsheet, Printer, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLanguage } from './context/LanguageContext';

export default function App() {
  const { t, lang } = useLanguage();
  const [cheques, setCheques] = useState<Cheque[]>(storageService.getCheques());
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(storageService.getAuditLogs());
  const [isLocked, setIsLocked] = useState<boolean>(storageService.isSessionLocked());

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [utilitiesSubTab, setUtilitiesSubTab] = useState<'master' | 'reports' | 'import' | 'backup' | 'settings' | 'users'>('master');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Auth Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Tab Selection Handler
  const handleSelectTab = (tab: string) => {
    const lowerTab = tab.toLowerCase();
    if (lowerTab === 'pettycash') {
      setActiveTab('pettycash');
    } else if (['outstanding', 'cleared', 'returned'].includes(lowerTab)) {
      setActiveTab('cheques');
      setFilter((prev) => ({
        ...prev,
        status: lowerTab === 'outstanding' ? 'Outstanding' : lowerTab === 'cleared' ? 'Cleared' : 'Returned',
      }));
    } else if (['parties', 'banks', 'master', 'reports', 'import', 'export', 'backup', 'settings', 'about', 'users'].includes(lowerTab)) {
      if (lowerTab === 'users') setUtilitiesSubTab('users');
      else if (['parties', 'banks', 'master'].includes(lowerTab)) setUtilitiesSubTab('master');
      else if (lowerTab === 'reports') setUtilitiesSubTab('reports');
      else if (lowerTab === 'settings') setUtilitiesSubTab('settings');
      setActiveTab('utilities');
    } else {
      setActiveTab(tab);
    }
  };

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterState>({
    searchQuery: '',
    status: 'ALL',
  });

  // Table Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals & Drawers state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState<Partial<Cheque> | null>(null);
  const [isDuplicateMode, setIsDuplicateMode] = useState(false);
  const [isQuickClearModalOpen, setIsQuickClearModalOpen] = useState(false);
  const [quickClearInitialChequeId, setQuickClearInitialChequeId] = useState<string | null>(null);
  const [isQuickReturnModalOpen, setIsQuickReturnModalOpen] = useState(false);
  const [quickReturnInitialChequeId, setQuickReturnInitialChequeId] = useState<string | null>(null);

  const [viewingCheque, setViewingCheque] = useState<Cheque | null>(null);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenClearCheque = (cheque?: Cheque) => {
    if (!storageService.hasPermission('canManageCheques')) {
      showToast('Permission Denied: Your account role cannot clear cheques.');
      return;
    }
    setQuickClearInitialChequeId(cheque ? cheque.id : null);
    setIsQuickClearModalOpen(true);
  };

  const handleOpenReturnCheque = (cheque?: Cheque) => {
    if (!storageService.hasPermission('canManageCheques')) {
      showToast('Permission Denied: Your account role cannot return cheques.');
      return;
    }
    setQuickReturnInitialChequeId(cheque ? cheque.id : null);
    setIsQuickReturnModalOpen(true);
  };

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setCheques(storageService.getCheques());
      setSettings(storageService.getSettings());
      setAuditLogs(storageService.getAuditLogs());
      setIsLocked(storageService.isSessionLocked());
    });
    return unsubscribe;
  }, []);

  // Sync dark theme class on body
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Global Keyboard Shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setEditingCheque(null);
        setIsDuplicateMode(false);
        setIsFormModalOpen(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        storageService.createBackup('manual');
        showToast('Instant Database Backup Created Successfully!');
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsFormModalOpen(false);
        setViewingCheque(null);
        setIsShortcutsOpen(false);
        setIsNotificationsOpen(false);
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Combined Search and Filter logic for Cheque Grid
  const activeCheques = cheques.filter((c) => !c.isDeleted);

  const filteredCheques = activeCheques.filter((c) => {
    // Tab filter override
    if (activeTab === 'outstanding' && c.status !== 'Outstanding') return false;
    if (activeTab === 'cleared' && c.status !== 'Cleared') return false;
    if (activeTab === 'returned' && c.status !== 'Returned') return false;

    // Quick filter bar status
    if (filter.status === 'Outstanding' && c.status !== 'Outstanding') return false;
    if (filter.status === 'Cleared' && c.status !== 'Cleared') return false;
    if (filter.status === 'Returned' && c.status !== 'Returned') return false;

    // City / Bank / Employee dropdown filters
    if (filter.city && c.city.toLowerCase() !== filter.city.toLowerCase()) return false;
    if (filter.bank && !c.bank.toLowerCase().includes(filter.bank.toLowerCase())) return false;
    if (filter.employee && c.receivedBy.toLowerCase() !== filter.employee.toLowerCase()) return false;

    // Receive Dates
    if (filter.startDate && c.receiveDate < filter.startDate) return false;
    if (filter.endDate && c.receiveDate > filter.endDate) return false;

    // Paid Dates
    if (filter.paidStartDate && (!c.paidDate || c.paidDate < filter.paidStartDate)) return false;
    if (filter.paidEndDate && (!c.paidDate || c.paidDate > filter.paidEndDate)) return false;

    // Amount Range
    if (filter.minAmount !== undefined && c.amount < filter.minAmount) return false;
    if (filter.maxAmount !== undefined && c.amount > filter.maxAmount) return false;

    // Search query match
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      const matchNum = c.chequeNumber.toLowerCase().includes(q);
      const matchParty = c.receiveFrom.toLowerCase().includes(q);
      const matchBank = c.bank.toLowerCase().includes(q);
      const matchCity = c.city.toLowerCase().includes(q);
      const matchEmp = c.receivedBy.toLowerCase().includes(q);
      const matchVoucher = (c.voucherNumber || '').toLowerCase().includes(q);
      const matchAmt = String(c.amount).includes(q);
      const matchRemarks = (c.remarks || '').toLowerCase().includes(q);
      return (
        matchNum ||
        matchParty ||
        matchBank ||
        matchCity ||
        matchEmp ||
        matchVoucher ||
        matchAmt ||
        matchRemarks
      );
    }

    return true;
  });

  // Selection handlers
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = (allIds: string[]) => {
    if (allIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  // Bulk actions
  const handleBulkMarkCleared = (prefix: string, paidDate: string) => {
    storageService.bulkMarkCleared(selectedIds, prefix, paidDate);
    showToast(`Marked ${selectedIds.length} cheques as Cleared (Paid Date: ${paidDate})!`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to soft-delete ${selectedIds.length} selected cheques?`)) {
      storageService.bulkDelete(selectedIds);
      showToast(`Deleted ${selectedIds.length} cheques.`);
      setSelectedIds([]);
    }
  };

  const handleBulkExport = () => {
    const selectedList = activeCheques.filter((c) => selectedIds.includes(c.id));
    exportToExcel(selectedList, settings, 'Selected Cheques Export');
    showToast(`Exported ${selectedList.length} records to Excel.`);
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-100 text-slate-800 antialiased dark:bg-slate-950 dark:text-slate-100 font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-200">
          <RefreshCw className="h-4 w-4 text-blue-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <Header
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onQuickBackup={() => {
          if (!storageService.hasPermission('canManageSettings')) {
            showToast('Permission Denied: Backup access requires Settings permission.');
            return;
          }
          const record = storageService.triggerBackupDownload('manual');
          showToast(`Full Backup Downloaded: ${record.fileName}`);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        currentTheme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
        activeTab={activeTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenUsersManager={() => handleSelectTab('users')}
        onOpenManual={() => setIsManualModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        {isSidebarOpen && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
            onOpenNewCheque={() => {
              if (!storageService.hasPermission('canManageCheques')) {
                showToast('Access Restricted: Your current account role cannot create cheques.');
                return;
              }
              setEditingCheque(null);
              setIsDuplicateMode(false);
              setIsFormModalOpen(true);
            }}
          />
        )}

        {/* Dynamic View Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <DashboardKPIs
                cheques={cheques}
                onSelectTab={handleSelectTab}
                onOpenAddCheque={() => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Your account role cannot manage cheques.');
                    return;
                  }
                  setEditingCheque(null);
                  setIsDuplicateMode(false);
                  setIsFormModalOpen(true);
                }}
                onOpenClearCheque={() => handleOpenClearCheque()}
                onOpenReturnCheque={() => handleOpenReturnCheque()}
              />
              <DashboardCharts cheques={cheques} />

              {/* Quick Recent Records Section */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Cheque Activity Register</h3>
                  <button
                    onClick={() => handleSelectTab('cheques')}
                    className="text-xs font-bold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    View All Cheques →
                  </button>
                </div>
                <ChequeTable
                  cheques={activeCheques.slice(0, 10)}
                  selectedIds={selectedIds}
                  onToggleSelect={handleToggleSelect}
                  onToggleSelectAll={handleToggleSelectAll}
                  onViewDetail={(c) => setViewingCheque(c)}
                  onClearCheque={(c) => handleOpenClearCheque(c)}
                  onReturnCheque={(c) => handleOpenReturnCheque(c)}
                  onEdit={(c) => {
                    if (!storageService.hasPermission('canManageCheques')) {
                      showToast('Permission Denied: Your account role cannot manage or edit cheques.');
                      return;
                    }
                    setEditingCheque(c);
                    setIsDuplicateMode(false);
                    setIsFormModalOpen(true);
                  }}
                  onDuplicate={(c) => {
                    if (!storageService.hasPermission('canManageCheques')) {
                      showToast('Permission Denied: Your account role cannot duplicate cheques.');
                      return;
                    }
                    setEditingCheque(c);
                    setIsDuplicateMode(true);
                    setIsFormModalOpen(true);
                  }}
                  onDelete={(id) => {
                    if (!storageService.hasPermission('canManageCheques')) {
                      showToast('Permission Denied: Your account role cannot delete cheques.');
                      return;
                    }
                    storageService.deleteCheque(id);
                    showToast('Cheque deleted.');
                  }}
                />
              </div>
            </div>
          )}

          {/* CHEQUES / OUTSTANDING / CLEARED / RETURNED TABS */}
          {(activeTab === 'cheques' || activeTab === 'outstanding' || activeTab === 'cleared' || activeTab === 'returned') && (
            <div className="space-y-4">
              {/* Prominent Action Bar Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                    {filter.status === 'Outstanding'
                      ? (lang === 'ur' ? 'باقی (غیر جمع) چیکس' : 'Outstanding Cheques')
                      : filter.status === 'Cleared'
                      ? (lang === 'ur' ? 'کلیئر شدہ چیکس' : 'Cleared Cheques')
                      : filter.status === 'Returned'
                      ? (lang === 'ur' ? 'واپس شدہ چیکس' : 'Returned Cheques')
                      : t('cheques')}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {lang === 'ur' ? `کل ${filteredCheques.length} ریکارڈز` : `Showing ${filteredCheques.length} records.`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Primary 1: + Add Cheque */}
                  <button
                    onClick={() => {
                      if (!storageService.hasPermission('canManageCheques')) {
                        showToast('Permission Denied: Your account role cannot create cheques.');
                        return;
                      }
                      setEditingCheque(null);
                      setIsDuplicateMode(false);
                      setIsFormModalOpen(true);
                    }}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-blue-600/20 transition-transform active:scale-95"
                  >
                    <Plus className="h-4 w-4 stroke-[3]" />
                    <span>{t('addCheque')}</span>
                  </button>

                  {/* Primary 2: ✓ Clear Cheque */}
                  <button
                    onClick={() => handleOpenClearCheque()}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
                  >
                    <CheckCircle2 className="h-4 w-4 stroke-[3]" />
                    <span>{t('clearCheque')}</span>
                  </button>

                  {/* Primary 3: ↩ Return Cheque */}
                  <button
                    onClick={() => handleOpenReturnCheque()}
                    className="flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-amber-600/20 transition-transform active:scale-95"
                  >
                    <RotateCcw className="h-4 w-4 stroke-[3]" />
                    <span>{lang === 'ur' ? 'چیک واپسی' : 'Return Cheque'}</span>
                  </button>

                  {/* Export & Print Options */}
                  <button
                    onClick={() => handleBulkExport()}
                    title="Export to Excel"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                    <span className="hidden sm:inline">{t('exportExcel')}</span>
                  </button>

                  <button
                    onClick={() => printChequeList(filteredCheques, settings, 'Cheque Register')}
                    title="Print Table"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <Printer className="h-4 w-4 text-blue-600" />
                    <span className="hidden sm:inline">{t('printTable')}</span>
                  </button>
                </div>
              </div>

              {/* Cheque Management KPI Summary Cards (Total, Outstanding, Cleared, Returned Qty & Amount) */}
              <ChequeStatsSummary
                cheques={cheques}
                filter={filter}
                onFilterChange={(newF) => setFilter((f) => ({ ...f, ...newF }))}
              />

              {/* Bulk Action Bar */}
              <BulkActionToolbar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkMarkCleared={(prefix, paidDate) => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Bulk clearance requires Cheque Management permission.');
                    return;
                  }
                  handleBulkMarkCleared(prefix, paidDate);
                }}
                onBulkDelete={() => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Bulk deletion requires Cheque Management permission.');
                    return;
                  }
                  handleBulkDelete();
                }}
                onBulkExport={handleBulkExport}
              />

              {/* Quick Filter Bar */}
              <QuickFilterBar
                filter={filter}
                onFilterChange={(updates) => setFilter((prev) => ({ ...prev, ...updates }))}
                onResetFilter={() => {
                  setFilter({ searchQuery: '', status: 'ALL' });
                  setSearchQuery('');
                }}
                banks={storageService.getBanks()}
                cities={storageService.getCities()}
                employees={storageService.getEmployees()}
              />

              {/* Data Grid Table */}
              <ChequeTable
                cheques={filteredCheques}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onViewDetail={(c) => setViewingCheque(c)}
                onClearCheque={(c) => handleOpenClearCheque(c)}
                onReturnCheque={(c) => handleOpenReturnCheque(c)}
                onEdit={(c) => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Your account role cannot edit cheques.');
                    return;
                  }
                  setEditingCheque(c);
                  setIsDuplicateMode(false);
                  setIsFormModalOpen(true);
                }}
                onDuplicate={(c) => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Your account role cannot duplicate cheques.');
                    return;
                  }
                  setEditingCheque(c);
                  setIsDuplicateMode(true);
                  setIsFormModalOpen(true);
                }}
                onDelete={(id) => {
                  if (!storageService.hasPermission('canManageCheques')) {
                    showToast('Permission Denied: Your account role cannot delete cheques.');
                    return;
                  }
                  storageService.deleteCheque(id);
                  showToast('Cheque deleted.');
                }}
              />
            </div>
          )}

          {/* STOCK MANAGEMENT TAB */}
          {activeTab === 'stock' && <StockModule />}

          {/* PETTY CASH MANAGEMENT TAB */}
          {activeTab === 'pettycash' && <PettyCashModule />}

          {/* UTILITIES TAB (Contains Master Data, Users, Reports, Import, Backup, Settings) */}
          {(activeTab === 'utilities' || ['master', 'reports', 'import', 'export', 'backup', 'settings', 'about', 'users'].includes(activeTab)) && (
            <UtilitiesView
              initialSubTab={utilitiesSubTab}
              onOpenShortcuts={() => setIsShortcutsOpen(true)}
              onImportComplete={() => handleSelectTab('cheques')}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Cheque Modal */}
      <ChequeFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingCheque || undefined}
        isDuplicateMode={isDuplicateMode}
      />

      {/* Cheque Detail Drawer */}
      <ChequeDetailModal
        cheque={viewingCheque}
        onClose={() => setViewingCheque(null)}
        onEdit={(c) => {
          if (!storageService.hasPermission('canManageCheques')) {
            showToast('Permission Denied: Your account role cannot edit cheques.');
            return;
          }
          setEditingCheque(c);
          setIsDuplicateMode(false);
          setIsFormModalOpen(true);
        }}
        onDuplicate={(c) => {
          if (!storageService.hasPermission('canManageCheques')) {
            showToast('Permission Denied: Your account role cannot duplicate cheques.');
            return;
          }
          setEditingCheque(c);
          setIsDuplicateMode(true);
          setIsFormModalOpen(true);
        }}
        onDelete={(id) => {
          if (!storageService.hasPermission('canManageCheques')) {
            showToast('Permission Denied: Your account role cannot delete cheques.');
            return;
          }
          storageService.deleteCheque(id);
          showToast('Cheque deleted.');
        }}
      />

      {/* Quick Clear Cheque Modal */}
      <QuickClearModal
        isOpen={isQuickClearModalOpen}
        onClose={() => {
          setIsQuickClearModalOpen(false);
          setQuickClearInitialChequeId(null);
        }}
        initialChequeId={quickClearInitialChequeId}
        cheques={cheques}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Quick Return Cheque Modal */}
      <QuickReturnModal
        isOpen={isQuickReturnModalOpen}
        onClose={() => {
          setIsQuickReturnModalOpen(false);
          setQuickReturnInitialChequeId(null);
        }}
        initialChequeId={quickReturnInitialChequeId}
        cheques={cheques}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Keyboard Shortcuts Sheet */}
      <ShortcutsModal isOpen={isShortcutsOpen} onClose={() => setIsShortcutsOpen(false)} />

      {/* Audit Logs Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        logs={auditLogs}
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(user) => {
          showToast(`Logged in as ${user.fullName} (${user.role})`);
        }}
      />

      {/* Lock Screen Modal */}
      <LockScreenModal
        isOpen={isLocked}
        onUnlockSuccess={() => {
          setIsLocked(false);
          showToast('Session Unlocked Successfully');
        }}
        onSwitchAccount={() => {
          setIsLocked(false);
          setIsLoginModalOpen(true);
        }}
      />

      {/* Software Manual Modal */}
      <ManualModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
      />
    </div>
  );
}
