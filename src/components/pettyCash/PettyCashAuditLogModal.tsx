import React, { useState } from 'react';
import { X, History, Shield, Search } from 'lucide-react';
import { PettyCashAuditLog } from '../../types';

interface PettyCashAuditLogModalProps {
  logs: PettyCashAuditLog[];
  isOpen: boolean;
  onClose: () => void;
}

export const PettyCashAuditLogModal: React.FC<PettyCashAuditLogModalProps> = ({ logs, isOpen, onClose }) => {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      (l.voucherNumber && l.voucherNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-base">Petty Cash Security & Audit Trail</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit actions, users, voucher #..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <span className="text-xs text-slate-500 font-medium">{filtered.length} audit logs</span>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2 text-xs pr-1">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-slate-400">No audit log records found.</div>
            ) : (
              filtered.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white uppercase text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {log.action}
                      </span>
                      {log.voucherNumber && (
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">{log.voucherNumber}</span>
                      )}
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">{log.details}</p>
                    <div className="text-[10px] text-slate-400">
                      Performed by: <strong className="text-slate-600 dark:text-slate-300">{log.performedBy}</strong> ({log.userRole})
                    </div>
                  </div>

                  <div className="text-right shrink-0 text-[10px] text-slate-400">
                    <div>{new Date(log.timestamp).toLocaleDateString('en-PK')}</div>
                    <div>{new Date(log.timestamp).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
            <button onClick={onClose} className="bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-bold">
              Close Audit Trail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
