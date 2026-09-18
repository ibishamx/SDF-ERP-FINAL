import React, { useState } from 'react';
import { X, Plus, Trash2, Edit, Check, FileText } from 'lucide-react';
import { PettyCashCategory, UserRole } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface PettyCashCategoriesModalProps {
  categories: PettyCashCategory[];
  userRole: UserRole;
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (data: { id?: string; name: string; description?: string; status?: 'Active' | 'Inactive' }) => void;
  onDeleteCategory?: (id: string) => void;
}

export const PettyCashCategoriesModal: React.FC<PettyCashCategoriesModalProps> = ({
  categories,
  userRole,
  isOpen,
  onClose,
  onSaveCategory,
  onDeleteCategory,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const canEdit = ['Administrator', 'Accounts'].includes(userRole);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a category name');
      return;
    }

    try {
      onSaveCategory({
        id: editingId || undefined,
        name: name.trim(),
        description: description.trim(),
        status: 'Active',
      });
      setName('');
      setDescription('');
      setEditingId(null);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to save category');
    }
  };

  const startEdit = (cat: PettyCashCategory) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || '');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 text-white p-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h2 className="font-bold text-base">Expense Categories Management</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Form to Add / Edit Category */}
          {canEdit && (
            <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300">
                {editingId ? 'Edit Category' : 'Add Custom Expense Category'}
              </h3>

              {error && <div className="p-2 bg-rose-50 text-rose-700 text-xs rounded">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="کیٹیگری کا نام درج کریں"
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 text-xs text-slate-900 dark:text-white"
                  required
                />
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="مختصر تفصیل درج کریں"
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2">
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setName('');
                      setDescription('');
                    }}
                    className="px-3 py-1 text-xs text-slate-500"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-bold shadow flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {editingId ? 'Update Category' : 'Add Category'}
                </button>
              </div>
            </form>
          )}

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configured Expense Categories ({categories.length})</h4>
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</span>
                    {c.description && <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    {c.isCustom && <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded">Custom</span>}
                    {canEdit && (
                      <button onClick={() => startEdit(c)} className="p-1 text-slate-500 hover:text-indigo-600" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canEdit && c.isCustom && onDeleteCategory && (
                      <button onClick={() => onDeleteCategory(c.id)} className="p-1 text-slate-400 hover:text-rose-600" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-slate-700">
            <button onClick={onClose} className="bg-slate-800 text-white px-4 py-1.5 rounded text-xs font-bold">
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
