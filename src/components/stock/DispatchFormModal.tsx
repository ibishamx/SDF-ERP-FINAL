import React, { useState, useEffect } from 'react';
import { X, Truck, Package, Save, AlertCircle, Plus, MapPin } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { DispatchRecord, Item, Station, TransportCompany } from '../../types';
import { handleFormKeyDown } from '../../utils/formNavigation';

interface DispatchFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  dispatchToEdit?: DispatchRecord | null;
  onSuccess?: () => void;
}

export const DispatchFormModal: React.FC<DispatchFormModalProps> = ({
  isOpen,
  onClose,
  dispatchToEdit,
  onSuccess,
}) => {
  const [biltyNumber, setBiltyNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState('');
  const [gpNumber, setGpNumber] = useState('');
  const [loadingFrom, setLoadingFrom] = useState('');
  const [quality, setQuality] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemName, setItemName] = useState('');
  const [packing, setPacking] = useState('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [stationName, setStationName] = useState('');
  const [selectedTransportId, setSelectedTransportId] = useState('');
  const [transportName, setTransportName] = useState('');
  const [helperNumber, setHelperNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [transports, setTransports] = useState<TransportCompany[]>([]);

  // Quick Add Sub-Modal States
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPacking, setNewItemPacking] = useState('');

  const [showAddStation, setShowAddStation] = useState(false);
  const [newStationName, setNewStationName] = useState('');

  const [showAddTransport, setShowAddTransport] = useState(false);
  const [newTransportName, setNewTransportName] = useState('');
  const [newTransportContact, setNewTransportContact] = useState('');

  useEffect(() => {
    if (isOpen) {
      const itemList = storageService.getItems();
      const stationList = storageService.getStations();
      const transportList = storageService.getTransports();

      setItems(itemList);
      setStations(stationList);
      setTransports(transportList);

      if (dispatchToEdit) {
        setBiltyNumber(dispatchToEdit.biltyNumber);
        setDispatchDate(dispatchToEdit.dispatchDate);
        setGpNumber(dispatchToEdit.gpNumber || '');
        setLoadingFrom(dispatchToEdit.loadingFrom || '');
        setQuality(dispatchToEdit.quality || '');
        setSelectedItemId(dispatchToEdit.itemId || '');
        setItemName(dispatchToEdit.itemName);
        setPacking(dispatchToEdit.packing);
        setQuantity(dispatchToEdit.quantity);
        setSelectedStationId(dispatchToEdit.stationId || '');
        setStationName(dispatchToEdit.stationName);
        setSelectedTransportId(dispatchToEdit.transportId || '');
        setTransportName(dispatchToEdit.transportName || '');
        setHelperNumber(dispatchToEdit.helperNumber || '');
        setRemarks(dispatchToEdit.remarks || '');
      } else {
        setBiltyNumber('');
        setDispatchDate('');
        setGpNumber('');
        setLoadingFrom('');
        setQuality('');
        setSelectedItemId('');
        setItemName('');
        setPacking('');
        setQuantity('');
        setSelectedStationId('');
        setStationName('');
        setSelectedTransportId('');
        setTransportName('');
        setHelperNumber('');
        setRemarks('');
      }
      setErrorMessage('');
    }
  }, [isOpen, dispatchToEdit]);

  if (!isOpen) return null;

  const handleItemSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === '__ADD_NEW_ITEM__') {
      setShowAddItem(true);
      return;
    }
    setSelectedItemId(id);
    const itemObj = items.find((i) => i.id === id);
    if (itemObj) {
      setItemName(itemObj.itemName);
      setPacking(itemObj.packing);
    }
  };

  const handleStationSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === '__ADD_NEW_STATION__') {
      setShowAddStation(true);
      return;
    }
    setSelectedStationId(id);
    const stn = stations.find((s) => s.id === id);
    if (stn) setStationName(stn.name);
  };

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    const saved = storageService.saveItem({
      itemName: newItemName.trim(),
      packing: newItemPacking.trim() || '50 kg Bag',
      unit: 'Bags',
      status: 'Active',
    });
    const updatedItems = storageService.getItems();
    setItems(updatedItems);
    setSelectedItemId(saved.id);
    setItemName(saved.itemName);
    setPacking(saved.packing);
    setShowAddItem(false);
    setNewItemName('');
    setNewItemPacking('50 kg Bag');
  };

  const handleCreateNewStation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStationName.trim()) return;
    const saved = storageService.saveStation({
      name: newStationName.trim(),
      status: 'Active',
    });
    const updatedStations = storageService.getStations();
    setStations(updatedStations);
    setSelectedStationId(saved.id);
    setStationName(saved.name);
    setShowAddStation(false);
    setNewStationName('');
  };

  const handleCreateNewTransport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransportName.trim()) return;
    const saved = storageService.saveTransport({
      name: newTransportName.trim(),
      contact: newTransportContact.trim(),
      status: 'Active',
    });
    const updatedTransports = storageService.getTransports();
    setTransports(updatedTransports);
    setSelectedTransportId(saved.id);
    setTransportName(saved.name);
    setShowAddTransport(false);
    setNewTransportName('');
    setNewTransportContact('');
  };

  const handleTransportSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    if (id === '__ADD_NEW_TRANSPORT__') {
      setShowAddTransport(true);
      return;
    }
    setSelectedTransportId(id);
    const trp = transports.find((t) => t.id === id);
    if (trp) setTransportName(trp.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!biltyNumber.trim()) {
      setErrorMessage('Bilty Number is required.');
      return;
    }

    if (quantity === '' || isNaN(Number(quantity)) || Number(quantity) === 0) {
      setErrorMessage('Quantity cannot be zero.');
      return;
    }

    if (!itemName.trim()) {
      setErrorMessage('Item Name is required.');
      return;
    }

    if (!stationName.trim()) {
      setErrorMessage('Destination Station is required.');
      return;
    }

    const payload = {
      id: dispatchToEdit?.id,
      dispatchDate,
      biltyNumber: biltyNumber.trim(),
      gpNumber: gpNumber.trim(),
      loadingFrom: loadingFrom.trim(),
      quality: quality.trim(),
      itemId: selectedItemId,
      itemName: itemName.trim(),
      packing: packing.trim(),
      quantity: Number(quantity),
      stationId: selectedStationId,
      stationName: stationName.trim(),
      transportId: selectedTransportId,
      transportName: transportName.trim(),
      helperNumber: helperNumber.trim(),
      remarks: remarks.trim(),
    };

    const res = storageService.saveDispatch(payload);

    if (res.success) {
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMessage(res.message || 'Failed to save dispatch record.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 my-8 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {dispatchToEdit ? 'Edit Dispatch Record' : 'Create New Stock Dispatch'}
              </h3>
              <p className="text-xs text-slate-500">Record factory outgoing stock consignment against Bilty</p>
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
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Row 1: Bilty Number, Dispatch Date, GP Number */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Bilty Number *
              </label>
              <input
                type="text"
                required
                value={biltyNumber}
                onChange={(e) => setBiltyNumber(e.target.value)}
                placeholder="بلٹی نمبر درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dispatch Date *
              </label>
              <input
                type="date"
                required
                value={dispatchDate}
                onChange={(e) => setDispatchDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gate Pass Number (GP #)
              </label>
              <input
                type="text"
                value={gpNumber}
                onChange={(e) => setGpNumber(e.target.value)}
                placeholder="گیٹ پاس نمبر درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Row 2: Loading From (Origin Warehouse / Godown) & Quality / Spec Grade */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-blue-50/50 p-3 rounded-xl border border-blue-100 dark:bg-slate-800/60 dark:border-slate-700">
            <div>
              <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                Loading From (Godown / Mill)
              </label>
              <input
                type="text"
                value={loadingFrom}
                onChange={(e) => setLoadingFrom(e.target.value)}
                placeholder="گودام یا لوڈنگ کا مقام درج کریں"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-blue-900 dark:text-blue-300 mb-1">
                Quality / Spec Grade
              </label>
              <input
                type="text"
                value={quality}
                onChange={(e) => setQuality(e.target.value)}
                placeholder="معیار یا گریڈ درج کریں"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Row 3: Item, Packing, Quantity */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Stock Item *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddItem(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Quick Add Item
                </button>
              </div>
              <select
                value={selectedItemId}
                onChange={handleItemSelect}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Item --</option>
                {items.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.itemName} ({i.packing})
                  </option>
                ))}
                <option value="__ADD_NEW_ITEM__" className="font-bold text-blue-600">
                  ➕ + Add New Item...
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity (Bags) *
              </label>
              <input
                type="number"
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value !== '' ? Number(e.target.value) : '')}
                placeholder="تعداد درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-blue-600 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-blue-400"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Negative quantity allowed for adjustments</span>
            </div>
          </div>

          {/* Row 4: Destination Station, Transport Company */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Destination Station *
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddStation(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Quick Add Station
                </button>
              </div>
              <select
                value={selectedStationId}
                onChange={handleStationSelect}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Station --</option>
                {stations.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
                <option value="__ADD_NEW_STATION__" className="font-bold text-blue-600">
                  ➕ + Add New Station...
                </option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Transport Company
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddTransport(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 cursor-pointer"
                >
                  <Plus className="h-3 w-3" /> Quick Add Transport
                </button>
              </div>
              <select
                value={selectedTransportId}
                onChange={handleTransportSelect}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Select Transport --</option>
                {transports.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
                <option value="__ADD_NEW_TRANSPORT__" className="font-bold text-blue-600">
                  ➕ + Add New Transport...
                </option>
              </select>
            </div>
          </div>

          {/* Row 5: Helper Number / Vehicle & Remarks */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Driver / Vehicle / Contact
              </label>
              <input
                type="text"
                value={helperNumber}
                onChange={(e) => setHelperNumber(e.target.value)}
                placeholder="گاڑی نمبر یا ڈرائیور کا فون درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Remarks / Instructions
              </label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="اضافی تفصیل یا ریمارکس درج کریں"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Footer buttons */}
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
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-blue-500"
            >
              <Save className="h-4 w-4" /> Save Dispatch Record
            </button>
          </div>
        </form>
      </div>

      {/* QUICK ADD SUB-MODAL: Stock Item */}
      {showAddItem && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Package className="h-5 w-5" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add New Stock Item</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddItem(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} onKeyDown={handleFormKeyDown} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="آئٹم کا نام درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Packing / Packaging *
                </label>
                <input
                  type="text"
                  required
                  value={newItemPacking}
                  onChange={(e) => setNewItemPacking(e.target.value)}
                  placeholder="پیکنگ کا سائز یا وزن درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SUB-MODAL: Destination Station */}
      {showAddStation && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <MapPin className="h-5 w-5" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add New Destination Station</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStation(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewStation} onKeyDown={handleFormKeyDown} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Station Name / City *
                </label>
                <input
                  type="text"
                  required
                  value={newStationName}
                  onChange={(e) => setNewStationName(e.target.value)}
                  placeholder="اسٹیشن کا نام درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStation(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Station
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK ADD SUB-MODAL: Transport Company */}
      {showAddTransport && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Truck className="h-5 w-5" />
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">Add New Transport Company</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTransport(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewTransport} onKeyDown={handleFormKeyDown} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transport Agency / Goods Company Name *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTransportName}
                  onChange={(e) => setNewTransportName(e.target.value)}
                  placeholder="ٹرانسپورٹ کمپنی کا نام درج کریں (e.g. Al-Mehran Goods)"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Contact / Phone (Optional)
                </label>
                <input
                  type="text"
                  value={newTransportContact}
                  onChange={(e) => setNewTransportContact(e.target.value)}
                  placeholder="فون نمبر یا اڈہ رابطہ درج کریں"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTransport(false)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-500"
                >
                  <Plus className="h-3.5 w-3.5" /> Save Transport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
