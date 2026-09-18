import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowRight, Building2, User } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserAccount } from '../../types';

interface LockScreenModalProps {
  isOpen: boolean;
  onUnlockSuccess: () => void;
  onSwitchAccount: () => void;
}

export const LockScreenModal: React.FC<LockScreenModalProps> = ({
  isOpen,
  onUnlockSuccess,
  onSwitchAccount,
}) => {
  const currentUser = storageService.getCurrentUser();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = storageService.unlockSession(pin);
    if (res.success) {
      setPin('');
      onUnlockSuccess();
    } else {
      setError(res.error || 'Incorrect Security PIN code.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl text-white text-center p-8">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/90 shadow-xl ring-4 ring-blue-500/20">
          <Lock className="h-8 w-8 text-white" />
        </div>

        <h2 className="text-xl font-black text-white tracking-tight">Session Locked</h2>
        <p className="mt-1 text-xs text-slate-400">Saleem Daal Factory Portal Protection</p>

        {/* User Card */}
        <div className="my-6 rounded-2xl border border-slate-800 bg-slate-800/60 p-4 text-left flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-black text-white text-lg">
            {currentUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-bold text-white text-sm">{currentUser.fullName}</h3>
            <p className="text-xs text-slate-400">@{currentUser.username}</p>
            <p className="text-[10px] font-bold text-blue-400 mt-0.5">{currentUser.role} • {currentUser.department}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-900/50 bg-rose-950/40 p-3 text-xs font-bold text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1 px-1">
              <span>Enter Security PIN</span>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                autoFocus
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full rounded-2xl border border-slate-700 bg-slate-800/80 py-3 pl-10 pr-4 text-center font-mono text-lg font-bold tracking-widest text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-98"
          >
            <span>Unlock Session</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 border-t border-slate-800/80 pt-4">
          <button
            type="button"
            onClick={onSwitchAccount}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            <User className="h-3.5 w-3.5" />
            <span>Switch User Account or Log In as Different Role</span>
          </button>
        </div>
      </div>
    </div>
  );
};
