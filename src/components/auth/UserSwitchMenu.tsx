import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Lock,
  UserCheck,
  Building,
  Key,
  ShieldAlert,
  Users,
  Check,
  X,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { UserAccount } from '../../types';

interface UserSwitchMenuProps {
  onOpenLoginModal: () => void;
  onOpenUsersManager: () => void;
}

export const UserSwitchMenu: React.FC<UserSwitchMenuProps> = ({
  onOpenLoginModal,
  onOpenUsersManager,
}) => {
  const [currentUser, setCurrentUser] = useState<UserAccount>(storageService.getCurrentUser());
  const [users, setUsers] = useState<UserAccount[]>(storageService.getUsers());
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setCurrentUser(storageService.getCurrentUser());
      setUsers(storageService.getUsers());
    });
    return unsubscribe;
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (userId: string) => {
    storageService.setCurrentUser(userId);
    setIsOpen(false);
  };

  const handleLockSession = () => {
    storageService.lockSession();
    setIsOpen(false);
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Administrator':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'Accounts':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'Manager':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Employee':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const perms = currentUser.permissions || {};

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-800/90 px-2.5 py-1.5 text-xs font-medium text-white transition hover:border-blue-500 hover:bg-slate-700/90 active:scale-95 shadow-sm"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-inner">
          {currentUser.fullName.charAt(0)}
        </div>
        <div className="hidden text-left sm:block min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate max-w-[100px] font-bold text-white leading-none">
              {currentUser.fullName}
            </span>
            <span
              className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                currentUser.role
              )}`}
            >
              {currentUser.role}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 leading-none">
            {currentUser.department || 'Factory Ops'}
          </span>
        </div>
        <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl text-slate-200 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* Active User Header */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-800/80 p-3 border border-slate-700/60">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-extrabold text-white text-base shadow">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="truncate text-sm font-bold text-white">{currentUser.fullName}</p>
              </div>
              <p className="text-xs text-slate-400">@{currentUser.username}</p>
              <div className="mt-1 flex items-center gap-1">
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                    currentUser.role
                  )}`}
                >
                  {currentUser.role}
                </span>
                <span className="text-[10px] text-slate-400">• {currentUser.department}</span>
              </div>
            </div>
          </div>

          {/* Quick Permission Summary */}
          <div className="my-2.5 rounded-xl border border-slate-800 bg-slate-950/60 p-2.5 text-[11px] space-y-1">
            <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider mb-1">
              Module Access Permissions
            </p>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300">
              <div className="flex items-center gap-1">
                {perms.canManageCheques ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                <span>Cheques Mgmt</span>
              </div>
              <div className="flex items-center gap-1">
                {perms.canManageStock ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                <span>Stock Mgmt</span>
              </div>
              <div className="flex items-center gap-1">
                {perms.canManagePettyCash ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                <span>Petty Cash</span>
              </div>
              <div className="flex items-center gap-1">
                {perms.canManageSettings ? <Check className="h-3 w-3 text-emerald-400" /> : <X className="h-3 w-3 text-rose-400" />}
                <span>System Config</span>
              </div>
            </div>
          </div>

          {/* Switch User List */}
          <div className="space-y-1 border-t border-slate-800 pt-2">
            <p className="px-2 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Switch Active User Account:
            </p>
            <div className="max-h-36 overflow-y-auto space-y-0.5">
              {users.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      isActive
                        ? 'bg-blue-600/30 text-blue-300 font-bold border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="flex h-5 w-5 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-300">
                        {u.fullName.charAt(0)}
                      </div>
                      <span className="truncate">{u.fullName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">({u.role})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-2.5 pt-2 border-t border-slate-800 flex flex-col gap-1">
            {currentUser.permissions?.canManageUsers && (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenUsersManager();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-400 hover:bg-slate-800 hover:text-blue-300 transition"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Manage Users & Permissions</span>
              </button>
            )}

            <button
              onClick={handleLockSession}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Lock Session / Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
