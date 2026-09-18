import React, { useState, useEffect } from 'react';
import {
  HardDriveUpload,
  Download,
  Upload,
  Database,
  Clock,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  FileJson,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { BackupRecord, CompanySettings } from '../../types';

export const BackupRestoreManager: React.FC = () => {
  const [backups, setBackups] = useState<BackupRecord[]>(storageService.getBackups());
  const [settings, setSettings] = useState<CompanySettings>(storageService.getSettings());
  const [restoreJson, setRestoreJson] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setBackups(storageService.getBackups());
      setSettings(storageService.getSettings());
    });
    return unsubscribe;
  }, []);

  const handleCreateBackup = () => {
    if (!storageService.hasPermission('canManageSettings')) {
      alert('Permission Denied: Backup generation requires Settings permission.');
      return;
    }
    storageService.triggerBackupDownload('manual');
  };

  const handleRestoreFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!storageService.hasPermission('canManageSettings')) {
      alert('Permission Denied: Data restore requires Settings permission.');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRestoreJson(content);
      const res = storageService.restoreFromJson(content);
      setRestoreStatus(res);
    };
    reader.readAsText(file);
  };

  const handleResetSeedData = () => {
    if (!storageService.hasPermission('canManageSettings')) {
      alert('Permission Denied: Action requires Settings permission.');
      return;
    }
    storageService.resetToSeedData();
    setShowConfirmReset(false);
    setRestoreStatus({
      success: true,
      message: 'Database reset to default Saleem Daal Factory seed data.',
    });
  };

  const handleClearAllData = () => {
    if (!storageService.hasPermission('canManageSettings')) {
      alert('Permission Denied: Clearing data requires Settings permission.');
      return;
    }
    storageService.clearAllDummyData();
    setShowConfirmClear(false);
    setRestoreStatus({
      success: true,
      message: 'All system data and employer names cleared. Address set to Ghala Mandi, Faisalabad, Contact: 03219669161.',
    });
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow">
              <HardDriveUpload className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Backup & Restore Management</h2>
              <p className="text-xs text-slate-500">Safeguard company records with offline backups and one-click restores</p>
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700 active:scale-[0.98]"
          >
            <Download className="h-4 w-4" />
            <span>Create & Download Backup</span>
          </button>
        </div>
      </div>

      {/* Backup & Restore Action Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Manual Backup Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Database className="h-4 w-4 text-blue-600" />
            <span>Manual Database Backup</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Generates a complete offline snapshot file containing all cheques, parties, banks, cities, employees, and settings.
          </p>

          <div className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="text-slate-600 dark:text-slate-400">
              Backup Directory: <strong className="text-slate-800 dark:text-slate-200">{settings.backupFolder}</strong>
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              Auto Schedule: <strong className="text-blue-600 uppercase">{settings.autoBackupSchedule}</strong>
            </div>
          </div>

          <button
            onClick={handleCreateBackup}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Download className="h-4 w-4" />
            <span>Save Timestamped Backup File</span>
          </button>
        </div>

        {/* Restore Database Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-sm">
            <Upload className="h-4 w-4 text-emerald-600" />
            <span>Restore From Backup File</span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Restore database state from a previously saved JSON backup file.
          </p>

          <input
            type="file"
            accept=".json"
            id="restore-file-input"
            className="hidden"
            onChange={handleRestoreFileSelected}
          />

          <label
            htmlFor="restore-file-input"
            className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          >
            <FileJson className="h-4 w-4 text-emerald-600" />
            <span>Browse & Apply Backup (.json)</span>
          </label>

          {restoreStatus && (
            <div
              className={`rounded-lg p-3 text-xs font-bold ${
                restoreStatus.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              {restoreStatus.message}
            </div>
          )}
        </div>
      </div>

      {/* Snapshot Log History */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Backup Snapshots Log</h3>

        {backups.length === 0 ? (
          <p className="text-xs text-slate-500">No backup logs registered yet in this session.</p>
        ) : (
          <div className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
            {backups.map((b) => (
              <div key={b.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{b.fileName}</p>
                  <p className="text-[11px] text-slate-400">
                    {new Date(b.createdAt).toLocaleString()} • {b.totalRecords} Cheques • {b.fileSizeKb} KB
                  </p>
                </div>
                <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  {b.type.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reset & Clear System Data Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/20 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-300">Clear All System Records</h4>
            <p className="text-xs text-rose-700/80 dark:text-rose-400 mt-1">
              Wipes all parties, cheques, stock dispatches, sales, petty cash, and employer names for a fresh start.
            </p>
          </div>

          {!showConfirmClear ? (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="w-full rounded-lg bg-rose-600 py-2 text-xs font-bold text-white hover:bg-rose-700 transition shadow-sm"
            >
              Clear All Data (Even Employers)
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-rose-800 shrink-0">Confirm Wipe?</span>
              <button
                onClick={handleClearAllData}
                className="flex-1 rounded-md bg-rose-700 py-1.5 text-xs font-bold text-white hover:bg-rose-800"
              >
                Yes, Wipe All Data
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-sm dark:border-amber-900/40 dark:bg-amber-950/20 flex flex-col justify-between space-y-3">
          <div>
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300">Reset Factory Defaults</h4>
            <p className="text-xs text-amber-800/80 dark:text-amber-400 mt-1">
              Reloads the clean Saleem Daal Factory default configuration.
            </p>
          </div>

          {!showConfirmReset ? (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="w-full rounded-lg bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-700 transition shadow-sm"
            >
              Reset Initial Config
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-900 shrink-0">Confirm Reset?</span>
              <button
                onClick={handleResetSeedData}
                className="flex-1 rounded-md bg-amber-700 py-1.5 text-xs font-bold text-white hover:bg-amber-800"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
