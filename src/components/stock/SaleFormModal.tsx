import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, AlertCircle, Save, Plus, Building2 } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { SaleRecord, DispatchRecord, StockBalanceInfo, Party } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface SaleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleToEdit?: SaleRecord | null;
  preselectedDispatchId?: string | null;
  onSuccess?: () => void;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({
  isOpen,
  onClose,
  saleToEdit,
  preselectedDispatchId,
  onSuccess,
}) => {
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [balances, setBalances] = useState<StockBalanceInfo[]>([]);
  const [parties, setParties] = useState<Party[]>([]);

  const [selectedDispatchId, setSelectedDispatchId] = useState('');
  const [saleDate, setSaleDate] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [sbvNumber, setSbvNumber] = useState('');
  const [selectedPartyId, setSelectedPartyId] = useState('');
  const [partyName, setPartyName] = useState('');
  const [quantitySold, setQuantitySold] = useState<number | ''>('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Quick Add Party Modal
  const [showAddParty, setShowAddParty] = useState(false);
  const [newPartyName, setNewPartyName] = useState('');
  const [newPartyCity, setNewPartyCity] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const activeStock = storageService.getStockBalances();
      setBalances(activeStock);
      const activeDispatches = storageService.getDispatches().filter((d) => !d.isDeleted);
      setDispatches(activeDispatches);
      const partyList = storageService.getParties();
      setParties(partyList);

      if (saleToEdit) {
        setSelectedDispatchId(saleToEdit.dispatchId);
        setSaleDate(saleToEdit.saleDate);
        setPickupDate(saleToEdit.pickupDate || '');
        setSbvNumber(saleToEdit.sbvNumber || '');
        setSelectedPartyId(saleToEdit.partyId || '');
        setPartyName(saleToEdit.partyName || '');
        setQuantitySold(saleToEdit.quantitySold);
        setInvoiceNumber(saleToEdit.invoiceNumber || '');
        setRemarks(saleToEdit.remarks || '');
      } else {
        setSaleDate('');
        setPickupDate('');
        setQuantitySold('');
        setInvoiceNumber('');
        setSbvNumber('');
        setRemarks('');
        setSelectedPartyId('');
        setPartyName('');

        let chosenDispatchId = '';
        if (preselectedDispatchId) {
          chosenDispatchId = preselectedDispatchId;
        }
        setSelectedDispatchId(chosenDispatchId);
      }
      setErrorMessage('');
    }
  }, [isOpen, saleToEdit, preselectedDispatchId]);

  if (!isOpen) return null;

  const handleDispatchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedDispatchId(id);
    const disp = dispatches.find((d) => d.id === id);
    if (disp) {
      if (!sbvNumber && disp.sbvNumber) {
        setSbvNumber(disp.sbvNumber);
      }
      if (disp.partyName && (!partyName || partyName === 'General Party')) {
        setSelectedPartyId(disp.partyId || '');
        setPartyName(disp.partyName);
      }
    }
  };

  const handlePartySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === '__ADD_NEW_PARTY__') {
      setShowAddParty(true);
      return;
    }
    setSelectedPartyId(id);
    const p = parties.find((party) => party.id === id);
    if (p) setPartyName(p.name);
  };

  const handleCreateNewParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartyName.trim()) return;
    const saved = storageService.addParty({
      name: newPartyName.trim(),
      city: newPartyCity.trim() || 'Faisalabad',
      phone: newPartyPhone.trim(),
    });
    const updatedParties = storageService.getParties();
    setParties(updatedParties);
    setSelectedPartyId(saved.id);
    setPartyName(saved.name);
    setShowAddParty(false);
    setNewPartyName('');
    setNewPartyCity('Faisalabad');
    setNewPartyPhone('');
  };

  function selectedDispatchInfo() {
    if (!selectedDispatchId) return null;
    const disp = dispatches.find((d) => d.id === selectedDispatchId);
    if (!disp) return null;

    // Sum other sales for this dispatch excluding saleToEdit
    const otherSalesTotal = storageService
      .getSales()
      .filter((s) => !s.isDeleted && s.dispatchId === selectedDispatchId && s.id !== saleToEdit?.id)
      .reduce((sum, s) => sum + s.quantitySold, 0);

    const remainingForNewSale = disp.quantity - otherSalesTotal;

    return {
      dispatch: disp,
      otherSalesTotal,
      remainingForNewSale,
    };
  }

  const info = selectedDispatchInfo();
  const currentQuantityNum = typeof quantitySold === 'number' ? quantitySold : 0;
  const simulatedRemaining = info ? info.remainingForNewSale - currentQuantityNum : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedDispatchId) {
      setErrorMessage('Please select a dispatch record / Bilty.');
      return;
    }

    if (quantitySold === '' || isNaN(Number(quantitySold)) || Number(quantitySold) === 0) {
      setErrorMessage('Sale quantity cannot be zero.');
      return;
    }

    if (!saleDate) {
      setErrorMessage('Sale Bill Date is required.');
      return;
    }

    const payload = {
      id: saleToEdit?.id,
      dispatchId: selectedDispatchId,
      saleDate,
      pickupDate: pickupDate || saleDate,
      sbvNumber: sbvNumber.trim(),
      partyId: selectedPartyId,
      partyName: partyName.trim(),
      quantitySold: Number(quantitySold),
      invoiceNumber: invoiceNumber.trim(),
      remarks: remarks.trim(),
      createdBy: 'System User',
    };

    const res = storageService.saveSale(payload);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMessage(res.message || 'Failed to save sale record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 my-8 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-300">
              <ShoppingCart className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {saleToEdit ? 'Edit Sale Bill' : 'Record Sale Bill'}
              </h3>
              <p className="text-xs text-slate-500">Record customer sale bill, SBV voucher, and deduct stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="p-6 space-y-4">
          {errorMessage && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 dark:bg-red-950/60 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Select Dispatch Bilty */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Select Dispatch / Bilty *
            </label>
            <select
              required
              value={selectedDispatchId}
              onChange={handleDispatchSelect}
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="">-- ڈسپیچ بلٹی منتخب کریں --</option>
              {dispatches.map((d) => {
                const bal = balances.find((b) => b.dispatch.id === d.id);
                const remaining = bal ? bal.remainingQty : d.quantity;
                return (
                  <option key={d.id} value={d.id}>
                    {d.biltyNumber} • {d.itemName} ({d.stationName}) — Remaining: {remaining} Bags
                  </option>
                );
              })}
            </select>
          </div>

          {/* Live Bilty Stock & Logistics Card */}
          {info && (
            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/90 to-indigo-50/50 p-3.5 text-xs text-blue-950 dark:border-blue-900/60 dark:from-slate-900 dark:to-blue-950/40 dark:text-blue-100 shadow-sm space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/60 pb-2 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Bilty Stock Reference
                  </span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    Bilty #{info.dispatch.biltyNumber}
                    <span className="text-[10px] font-normal text-slate-500">
                      ({info.dispatch.dispatchDate})
                    </span>
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Available Stock
                  </span>
                  <div className={`text-base font-extrabold ${info.remainingForNewSale < 0 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {info.remainingForNewSale} <span className="text-xs font-semibold">Bags</span>
                  </div>
                </div>
              </div>

              {/* Grid Details: Item, Quality, Warehouse, Station */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="rounded-xl bg-white/80 p-2 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Item & Packing</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {info.dispatch.itemName} ({info.dispatch.packing})
                  </span>
                </div>

                <div className="rounded-xl bg-white/80 p-2 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Station & Quality</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300">
                    {info.dispatch.stationName} • {info.dispatch.quality || 'Super Fine'}
                  </span>
                </div>
              </div>

              {/* Quantities Breakdown */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                  <span>Dispatched: <strong className="text-slate-900 dark:text-white">{info.dispatch.quantity} Bags</strong></span>
                  <span>Previous Sold: <strong className="text-amber-600 dark:text-amber-400">{info.otherSalesTotal} Bags</strong></span>
                </div>

                {info.remainingForNewSale !== 0 && (
                  <button
                    type="button"
                    onClick={() => setQuantitySold(info.remainingForNewSale)}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-emerald-500 transition-colors shrink-0 cursor-pointer"
                  >
                    Set Qty ({info.remainingForNewSale})
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Row: Customer Party & SBV Bill Number */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-100 dark:bg-slate-800/60 dark:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300">
                  Customer Party *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddParty(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Quick Add Party
                </button>
              </div>
              <select
                value={selectedPartyId}
                onChange={handlePartySelect}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- پارٹی منتخب کریں --</option>
                {parties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.city ? `(${p.city})` : ''}
                  </option>
                ))}
                <option value="__ADD_NEW_PARTY__" className="font-bold text-emerald-600">
                  ➕ + نئی پارٹی شامل کریں...
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 mb-1">
                SBV Bill / Voucher #
              </label>
              <input
                type="text"
                value={sbvNumber}
                onChange={(e) => setSbvNumber(e.target.value)}
                placeholder="ایس بی وی بل نمبر درج کریں"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Row: Sale Bill Date & Pickup Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sale Bill Date *
              </label>
              <input
                type="date"
                required
                value={saleDate}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pickup Date
              </label>
              <input
                type="date"
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Quantity Sold & Invoice Number */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Sold (Bags) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantitySold}
                onChange={(e) => setQuantitySold(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="تعداد درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-extrabold text-emerald-600 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-400"
              />
              {info && (
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Projected Balance:</span>
                  <span className={`font-bold ${simulatedRemaining < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {simulatedRemaining} Bags {simulatedRemaining < 0 ? '(منفی اسٹاک)' : ''}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Invoice # / Voucher
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="انوائس نمبر درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remarks / Delivery Note
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="ریمارکس یا ڈلیوری نوٹ درج کریں"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500"
            >
              <Save className="h-4 w-4" /> Save Sale Bill
            </button>
          </div>
        </form>
      </div>

      {/* QUICK ADD SUB-MODAL: Customer Party */}
      {showAddParty && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Building2 className="h-5 w-5" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add New Customer Party</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddParty(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewParty} onKeyDown={handleFormKeyDown} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Party Name *
                </label>
                <input
                  type="text"
                  required
                  value={newPartyName}
                  onChange={(e) => setNewPartyName(e.target.value)}
                  placeholder="پارٹی کا نام درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  City / Station *
                </label>
                <input
                  type="text"
                  required
                  value={newPartyCity}
                  onChange={(e) => setNewPartyCity(e.target.value)}
                  placeholder="شہر درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newPartyPhone}
                  onChange={(e) => setNewPartyPhone(e.target.value)}
                  placeholder="فون نمبر درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddParty(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Customer Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
