import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Edit2,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  Building2,
  Check,
  X,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { UserAccount, UserRole, UserPermissions } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

export const UsersPermissionsView: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>(storageService.getUsers());
  const [currentUser, setCurrentUser] = useState<UserAccount>(storageService.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [department, setDepartment] = useState('');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');

  const [permissions, setPermissions] = useState<UserPermissions>({
    canViewDashboard: true,
    canManageCheques: false,
    canViewCheques: true,
    canManageStock: false,
    canViewStock: true,
    canManagePettyCash: true,
    canViewPettyCash: true,
    canManageMasterData: false,
    canManageSettings: false,
    canManageUsers: false,
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeStorage(() => {
      setUsers(storageService.getUsers());
      setCurrentUser(storageService.getCurrentUser());
    });
    return unsubscribe;
  }, []);

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setFullName('');
    setUsername('');
    setEmail('');
    setRole('Accounts');
    setDepartment('');
    setPin('');
    setStatus('Active');
    applyRolePreset('Accounts');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: UserAccount) => {
    setEditingUser(user);
    setFullName(user.fullName);
    setUsername(user.username);
    setEmail(user.email || '');
    setRole(user.role);
    setDepartment(user.department || '');
    setPin(user.pin);
    setStatus(user.status);
    setPermissions({ ...user.permissions });
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const applyRolePreset = (selectedRole: UserRole) => {
    setRole(selectedRole);
    switch (selectedRole) {
      case 'Administrator':
        setPermissions({
          canViewDashboard: true,
          canManageCheques: true,
          canViewCheques: true,
          canManageStock: true,
          canViewStock: true,
          canManagePettyCash: true,
          canViewPettyCash: true,
          canManageMasterData: true,
          canManageSettings: true,
          canManageUsers: true,
        });
        break;
      case 'Accounts':
        setPermissions({
          canViewDashboard: true,
          canManageCheques: true,
          canViewCheques: true,
          canManageStock: true,
          canViewStock: true,
          canManagePettyCash: true,
          canViewPettyCash: true,
          canManageMasterData: true,
          canManageSettings: false,
          canManageUsers: false,
        });
        break;
      case 'Manager':
        setPermissions({
          canViewDashboard: true,
          canManageCheques: false,
          canViewCheques: true,
          canManageStock: true,
          canViewStock: true,
          canManagePettyCash: true,
          canViewPettyCash: true,
          canManageMasterData: true,
          canManageSettings: false,
          canManageUsers: false,
        });
        break;
      case 'Employee':
        setPermissions({
          canViewDashboard: true,
          canManageCheques: false,
          canViewCheques: true,
          canManageStock: false,
          canViewStock: true,
          canManagePettyCash: true,
          canViewPettyCash: true,
          canManageMasterData: false,
          canManageSettings: false,
          canManageUsers: false,
        });
        break;
      case 'Viewer':
        setPermissions({
          canViewDashboard: true,
          canManageCheques: false,
          canViewCheques: true,
          canManageStock: false,
          canViewStock: true,
          canManagePettyCash: false,
          canViewPettyCash: true,
          canManageMasterData: false,
          canManageSettings: false,
          canManageUsers: false,
        });
        break;
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!storageService.hasPermission('canManageUsers')) {
      setErrorMsg('Permission Denied: User account administration requires User & Role Management permission.');
      return;
    }

    if (!fullName.trim() || !username.trim() || !pin.trim()) {
      setErrorMsg('Full Name, Username, and Security PIN are required.');
      return;
    }

    try {
      if (editingUser) {
        storageService.updateUserAccount({
          ...editingUser,
          fullName,
          username,
          email,
          role,
          department,
          pin,
          status,
          permissions,
        });
        setSuccessMsg(`User account '${fullName}' updated successfully.`);
      } else {
        storageService.createUserAccount({
          fullName,
          username,
          email,
          role,
          department,
          pin,
          status,
          permissions,
        });
        setSuccessMsg(`New user '${fullName}' registered successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving user account.');
    }
  };

  const handleDeleteUser = (user: UserAccount) => {
    if (!storageService.hasPermission('canManageUsers')) {
      alert('Permission Denied: Deleting user accounts requires User & Role Management permission.');
      return;
    }

    if (confirm(`Are you sure you want to delete user account '${user.fullName}' (@${user.username})?`)) {
      try {
        storageService.deleteUserAccount(user.id);
        setSuccessMsg(`User '${user.fullName}' removed.`);
        setTimeout(() => setSuccessMsg(null), 3000);
      } catch (err: any) {
        alert(err.message || 'Cannot delete user.');
      }
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      (u.department && u.department.toLowerCase().includes(q));
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (userRole: string) => {
    switch (userRole) {
      case 'Administrator':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
      case 'Accounts':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Manager':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Employee':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800 shadow dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total System Users</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{users.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Registered accounts</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Administrators</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {users.filter((u) => u.role === 'Administrator').length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Full access control</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Accounts & Managers</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {users.filter((u) => u.role === 'Accounts' || u.role === 'Manager').length}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Operational officers</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Session</p>
            <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 truncate max-w-[130px]">
              {currentUser.fullName}
            </h3>
            <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
              Role: {currentUser.role}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400">
            <KeyRound className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-1 flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name, username, department..."
                className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="ALL">All Roles</option>
              <option value="Administrator">Administrator</option>
              <option value="Accounts">Accounts</option>
              <option value="Manager">Manager</option>
              <option value="Employee">Employee</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 rounded-xl bg-blue-600 py-2.5 px-4 text-xs font-bold text-white shadow transition hover:bg-blue-700 active:scale-95 shrink-0 w-full sm:w-auto justify-center"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New User Account</span>
          </button>
        </div>

        {/* Users Grid/Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">User Details</th>
                <th className="py-3.5 px-4">Role & Department</th>
                <th className="py-3.5 px-4">Security PIN</th>
                <th className="py-3.5 px-4">Module Permissions</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No user accounts found matching query.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const p = u.permissions || {};
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition ${
                        isCurrent ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 font-black text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 dark:text-white">{u.fullName}</span>
                              {isCurrent && (
                                <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-400">@{u.username}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(
                              u.role
                            )}`}
                          >
                            {u.role}
                          </span>
                          <p className="text-[11px] text-slate-400">{u.department || 'General'}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-400">
                        PIN: •••• ({u.pin})
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs text-[10px]">
                          {p.canManageCheques && (
                            <span className="rounded bg-blue-100 px-1.5 py-0.5 font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                              Cheques
                            </span>
                          )}
                          {p.canManageStock && (
                            <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Stock
                            </span>
                          )}
                          {p.canManagePettyCash && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Petty Cash
                            </span>
                          )}
                          {p.canManageSettings && (
                            <span className="rounded bg-purple-100 px-1.5 py-0.5 font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                              Settings
                            </span>
                          )}
                          {p.canManageUsers && (
                            <span className="rounded bg-rose-100 px-1.5 py-0.5 font-bold text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                              Users
                            </span>
                          )}
                          {!p.canManageCheques &&
                            !p.canManageStock &&
                            !p.canManagePettyCash &&
                            !p.canManageSettings && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                View Only
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {u.status === 'Active' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50 transition"
                            title="Edit User & Permissions"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={users.length <= 1}
                            className="rounded-lg p-1.5 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition disabled:opacity-30"
                            title="Delete User"
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

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {editingUser ? 'Edit User & Permission Matrix' : 'Add New System User'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure role access, module permissions, and PIN security.</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveUser} onKeyDown={handleFormKeyDown} className="p-6 space-y-5">
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
                  {errorMsg}
                </div>
              )}

              {/* General User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="پورا نام درج کریں"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="یوزر کا لاگ اِن نام درج کریں"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="شعبہ درج کریں"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Security PIN (4 digits) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="4 ہندسوں کا پن کوڈ درج کریں"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-mono font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Role Presets */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Role Preset:
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['Administrator', 'Accounts', 'Manager', 'Employee', 'Viewer'] as UserRole[]).map((r) => {
                    const isSelected = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => applyRolePreset(r)}
                        className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow'
                            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Module Permissions Matrix */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2 dark:border-slate-700">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Module Access Permissions Matrix
                  </span>
                  <span className="text-[11px] text-slate-500">Fine-tune functional capabilities</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageCheques}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManageCheques: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Manage Cheques</p>
                      <p className="text-[10px] text-slate-500">Add, edit, clear, or return cheques</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageStock}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManageStock: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Manage Factory Stock</p>
                      <p className="text-[10px] text-slate-500">Record dispatches & sales entries</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManagePettyCash}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManagePettyCash: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Manage Petty Cash</p>
                      <p className="text-[10px] text-slate-500">Issue cash, record expenses, approve vouchers</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageMasterData}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManageMasterData: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">Master Data Setup</p>
                      <p className="text-[10px] text-slate-500">Manage parties, banks, cities, employees</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageSettings}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManageSettings: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">System Settings & Backup</p>
                      <p className="text-[10px] text-slate-500">Company config, backups & restore</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 dark:border-slate-700 dark:bg-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canManageUsers}
                      onChange={(e) =>
                        setPermissions({ ...permissions, canManageUsers: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">User Accounts & Roles</p>
                      <p className="text-[10px] text-slate-500">Create/delete users and adjust roles</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Account Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Active">Active (Can log in)</option>
                  <option value="Inactive">Deactivated (Block login)</option>
                </select>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 py-2.5 px-5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700"
                >
                  {editingUser ? 'Update User & Permissions' : 'Create User Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
