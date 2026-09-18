import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { UserAccount } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const users = storageService.getUsers().filter((u) => u.status === 'Active');
  const [selectedUser, setSelectedUser] = useState<UserAccount>(users[0] || storageService.getCurrentUser());
  const [username, setUsername] = useState(selectedUser?.username || '');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginMode, setLoginMode] = useState<'quick_switch' | 'credentials'>('quick_switch');

  if (!isOpen) return null;

  const handleSelectUserCard = (u: UserAccount) => {
    setSelectedUser(u);
    setUsername(u.username);
    setPin('');
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const targetUsername = loginMode === 'quick_switch' ? selectedUser.username : username;
    const res = storageService.loginWithCredentials(targetUsername, pin);

    if (res.success && res.user) {
      onLoginSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Authentication failed. Please check your credentials.');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      case 'Accounts':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'Manager':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'Employee':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white text-center relative border-b border-slate-800">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/90 shadow-lg ring-4 ring-blue-500/20">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">Saleem Daal Factory Portal</h2>
          <p className="mt-1 text-xs text-slate-300">Secure User Authentication & Access Permissions</p>

          {/* Mode Tabs */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setLoginMode('quick_switch');
                setError(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                loginMode === 'quick_switch'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Select User Profile
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('credentials');
                setError(null);
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                loginMode === 'credentials'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Username & Password
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} onKeyDown={handleFormKeyDown} className="space-y-5">
            {loginMode === 'quick_switch' ? (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  صارف کا انتخاب کریں (Select User Account):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {users.map((u) => {
                    const isSelected = selectedUser.id === u.id;
                    return (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => handleSelectUserCard(u)}
                        className={`flex items-center gap-3 rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/80 shadow-sm ring-2 ring-blue-500/20 dark:border-blue-500 dark:bg-blue-950/40'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {u.fullName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-xs font-bold text-slate-900 dark:text-white">
                              {u.fullName}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getRoleBadgeColor(
                                u.role
                              )}`}
                            >
                              {u.role}
                            </span>
                          </div>
                          <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                            @{u.username} • {u.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    صارف کا نام (Username)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="یوزر نیم درج کریں (e.g. admin, tariq.accounts)"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-4 text-sm font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* PIN Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  سیکیورٹی پن کوڈ / پاس ورڈ (Security PIN Code)
                </label>
              </div>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="پن کوڈ درج کریں (Enter Security PIN)"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-10 text-sm font-bold tracking-widest text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 px-5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 active:scale-98"
              >
                <LogIn className="h-4 w-4" />
                <span>Log In to Portal</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
