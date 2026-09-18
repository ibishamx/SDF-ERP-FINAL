import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, ShieldAlert, X } from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { StockBalanceInfo } from '../../types';

interface StockAlertsBannerProps {
  onSelectBilty?: (bilty: string) => void;
}

export const StockAlertsBanner: React.FC<StockAlertsBannerProps> = ({ onSelectBilty }) => {
  const [stockList, setStockList] = useState<StockBalanceInfo[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = () => setStockList(storageService.getStockBalances());
    load();
    return subscribeStorage(load);
  }, []);

  if (dismissed || stockList.length === 0) return null;

  const lowStockItems = stockList.filter((s) => s.statusColor === 'yellow');
  const oldStockItems = stockList.filter((s) => s.remainingQty > 0 && s.daysInStock >= 30);

  if (lowStockItems.length === 0 && oldStockItems.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-amber-900 shadow-sm dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">Stock Alerts & Notifications</h4>
            <div className="mt-1 flex flex-wrap gap-4 text-xs">
              {lowStockItems.length > 0 && (
                <div className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
                  <ShieldAlert className="h-4 w-4 text-amber-600" />
                  <span>
                    <strong>{lowStockItems.length} Bilties</strong> with low remaining stock (&lt;50%).
                  </span>
                </div>
              )}
              {oldStockItems.length > 0 && (
                <div className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
                  <Clock className="h-4 w-4 text-amber-600" />
                  <span>
                    <strong>{oldStockItems.length} Bilties</strong> in stock for 30+ days (Old Stock).
                  </span>
                </div>
              )}
            </div>

            {/* Quick bilty buttons */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-amber-700 dark:text-amber-400">Quick view bilties:</span>
              {[...lowStockItems, ...oldStockItems].slice(0, 5).map((s) => (
                <button
                  key={s.dispatch.id}
                  onClick={() => onSelectBilty && onSelectBilty(s.dispatch.biltyNumber)}
                  className="rounded-md border border-amber-300/80 bg-white px-2 py-0.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-800"
                >
                  {s.dispatch.biltyNumber} ({s.remainingQty} bags left, {s.daysInStock}d)
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 text-amber-600 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-400 dark:hover:bg-amber-900"
          title="Dismiss Alert"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
