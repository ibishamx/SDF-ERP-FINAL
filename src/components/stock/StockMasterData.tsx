import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Truck,
  CheckCircle,
  XCircle,
  Save,
  X,
} from 'lucide-react';
import { storageService, subscribeStorage } from '../../services/storageService';
import { Item, Station, TransportCompany } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

export const StockMasterData: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ITEMS' | 'STATIONS' | 'TRANSPORTS'>('ITEMS');

  const [items, setItems] = useState<Item[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [transports, setTransports] = useState<TransportCompany[]>([]);

  // Item Form Modal state
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemName, setItemName] = useState('');
  const [itemPacking, setItemPacking] = useState('');
  const [itemCategory, setItemCategory] = useState('');

  // Station Form Modal state
  const [isStationModalOpen, setIsStationModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationNameInput, setStationNameInput] = useState('');

  // Transport Form Modal state
  const [isTransportModalOpen, setIsTransportModalOpen] = useState(false);
  const [editingTransport, setEditingTransport] = useState<TransportCompany | null>(null);
  const [transportNameInput, setTransportNameInput] = useState('');
  const [transportPhone, setTransportPhone] = useState('');

  useEffect(() => {
    const load = () => {
      setItems(storageService.getItems());
      setStations(storageService.getStations());
      setTransports(storageService.getTransports());
    };
    load();
    return subscribeStorage(load);
  }, []);

  // Save Item
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    storageService.saveItem({
      id: editingItem?.id,
      itemName: itemName.trim(),
      packing: itemPacking.trim(),
      status: 'Active',
    });

    setIsItemModalOpen(false);
    setEditingItem(null);
  };

  // Save Station
  const handleSaveStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stationNameInput.trim()) return;

    storageService.saveStation({
      id: editingStation?.id,
      name: stationNameInput.trim(),
      status: 'Active',
    });

    setIsStationModalOpen(false);
    setEditingStation(null);
  };

  // Save Transport
  const handleSaveTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transportNameInput.trim()) return;

    storageService.saveTransport({
      id: editingTransport?.id,
      name: transportNameInput.trim(),
      contact: transportPhone.trim(),
      status: 'Active',
    });

    setIsTransportModalOpen(false);
    setEditingTransport(null);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          <Package className="h-4 w-4" /> Stock System Setup
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Master Data Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Configure items, packings, destination stations, and transport agencies
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('ITEMS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === 'ITEMS'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Package className="h-4 w-4" /> Stock Items & Packings ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('STATIONS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === 'STATIONS'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <MapPin className="h-4 w-4" /> Destination Stations ({stations.length})
        </button>

        <button
          onClick={() => setActiveTab('TRANSPORTS')}
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold transition-colors ${
            activeTab === 'TRANSPORTS'
              ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Truck className="h-4 w-4" /> Transport Companies ({transports.length})
        </button>
      </div>

      {/* TAB 1: ITEMS */}
      {activeTab === 'ITEMS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">All registered pulse items and bag packing configurations</p>
            <button
              onClick={() => {
                setEditingItem(null);
                setItemName('');
                setItemPacking('');
                setItemCategory('');
                setIsItemModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" /> Add Item
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300">
                  <th className="py-3 px-4">Item Name</th>
                  <th className="py-3 px-4">Packing Size</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{i.itemName}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600 dark:text-blue-400">{i.packing}</td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{i.category || 'General'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Active
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEditingItem(i);
                          setItemName(i.itemName);
                          setItemPacking(i.packing);
                          setItemCategory(i.category || '');
                          setIsItemModalOpen(true);
                        }}
                        className="rounded-md p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STATIONS */}
      {activeTab === 'STATIONS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Destination market stations for dispatched dispatches</p>
            <button
              onClick={() => {
                setEditingStation(null);
                setStationNameInput('');
                setIsStationModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" /> Add Station
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {stations.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2.5">
                  <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{s.name}</span>
                </div>
                <button
                  onClick={() => {
                    setEditingStation(s);
                    setStationNameInput(s.name);
                    setIsStationModalOpen(true);
                  }}
                  className="rounded-md p-1 text-slate-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TRANSPORTS */}
      {activeTab === 'TRANSPORTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">Registered transport agencies and cargo services</p>
            <button
              onClick={() => {
                setEditingTransport(null);
                setTransportNameInput('');
                setTransportPhone('');
                setIsTransportModalOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" /> Add Transport
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {transports.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-300">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm block">{t.name}</span>
                    {t.phone && <span className="text-xs text-slate-500 block">{t.phone}</span>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingTransport(t);
                    setTransportNameInput(t.name);
                    setTransportPhone(t.phone || '');
                    setIsTransportModalOpen(true);
                  }}
                  className="rounded-md p-1 text-slate-400 hover:text-blue-600"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h3>
              <button onClick={() => setIsItemModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveItem} onKeyDown={handleFormKeyDown} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="آئٹم کا نام درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Packing Size *
                </label>
                <input
                  type="text"
                  required
                  value={itemPacking}
                  onChange={(e) => setItemPacking(e.target.value)}
                  placeholder="پیکنگ سائز درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsItemModalOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Station */}
      {isStationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingStation ? 'Edit Station' : 'Add New Station'}
              </h3>
              <button onClick={() => setIsStationModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveStation} onKeyDown={handleFormKeyDown} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Station Name *
                </label>
                <input
                  type="text"
                  required
                  value={stationNameInput}
                  onChange={(e) => setStationNameInput(e.target.value)}
                  placeholder="اسٹیشن یا منزل درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsStationModalOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
                  Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Transport */}
      {isTransportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {editingTransport ? 'Edit Transport Company' : 'Add New Transport Company'}
              </h3>
              <button onClick={() => setIsTransportModalOpen(false)}>
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTransport} onKeyDown={handleFormKeyDown} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Agency Name *
                </label>
                <input
                  type="text"
                  required
                  value={transportNameInput}
                  onChange={(e) => setTransportNameInput(e.target.value)}
                  placeholder="ٹرانسپورٹ ایجنسی کا نام درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact Phone / Mobile
                </label>
                <input
                  type="text"
                  value={transportPhone}
                  onChange={(e) => setTransportPhone(e.target.value)}
                  placeholder="فون یا موبائل نمبر درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTransportModalOpen(false)}
                  className="rounded-lg border px-3 py-1.5 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white">
                  Save Transport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
