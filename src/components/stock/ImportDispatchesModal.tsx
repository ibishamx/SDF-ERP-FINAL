import React, { useState } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, FileText } from 'lucide-react';
import { storageService } from '../../services/storageService';

interface ImportDispatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ImportDispatchesModal: React.FC<ImportDispatchesModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [csvText, setCsvText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [importStatus, setImportStatus] = useState<{
    validCount: number;
    invalidCount: number;
    errors: string[];
  } | null>(null);

  if (!isOpen) return null;

  const sampleCsvTemplate = `BiltyNumber,DispatchDate,ItemName,Packing,Quantity,PartyName,StationName,GPNumber,SBVNumber,TransportName
B-9001,2025-05-10,Daal Chana Special,50 kg Bag,100,Al-Madina Traders,Lahore,GP-901,SBV-101,Al-Faisal Goods
B-9002,2025-05-11,Daal Moong Washed,50 kg Bag,200,Bismillah Grain Agency,Faisalabad,GP-902,SBV-102,Khyber Transport`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvTemplate], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_dispatches_import.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        setCsvText(text);
        processCsv(text);
      };
      reader.readAsText(file);
    }
  };

  const processCsv = (rawText: string) => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length < 2) {
      setImportStatus({ validCount: 0, invalidCount: 0, errors: ['CSV file is empty or missing headers.'] });
      setParsedRows([]);
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    const existingDispatches = storageService.getDispatches().filter((d) => !d.isDeleted);
    const existingBilties = new Set(existingDispatches.map((d) => d.biltyNumber.toLowerCase()));

    const rows: any[] = [];
    const errors: string[] = [];
    let valid = 0;
    let invalid = 0;

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      if (cols.length < 4) continue;

      const biltyNumber = cols[0];
      const dispatchDate = cols[1] || new Date().toISOString().slice(0, 10);
      const itemName = cols[2] || 'Daal Chana';
      const packing = cols[3] || '50 kg Bag';
      const quantity = Number(cols[4]) || 100;
      const partyName = cols[5] || 'General Party';
      const stationName = cols[6] || 'Lahore';
      const gpNumber = cols[7] || '';
      const sbvNumber = cols[8] || '';
      const transportName = cols[9] || '';

      let rowError = '';
      if (!biltyNumber) {
        rowError = `Row ${i}: Missing Bilty Number`;
      } else if (existingBilties.has(biltyNumber.toLowerCase())) {
        rowError = `Row ${i}: Duplicate Bilty Number "${biltyNumber}" already exists`;
      } else if (isNaN(quantity) || quantity <= 0) {
        rowError = `Row ${i}: Invalid quantity "${cols[4]}"`;
      }

      if (rowError) {
        invalid++;
        errors.push(rowError);
      } else {
        valid++;
        existingBilties.add(biltyNumber.toLowerCase()); // track within file
      }

      rows.push({
        biltyNumber,
        dispatchDate,
        itemName,
        packing,
        quantity,
        partyName,
        stationName,
        gpNumber,
        sbvNumber,
        transportName,
        isValid: !rowError,
        error: rowError,
      });
    }

    setParsedRows(rows);
    setImportStatus({ validCount: valid, invalidCount: invalid, errors });
  };

  const handleExecuteImport = () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    let countSuccess = 0;
    validRows.forEach((r) => {
      const res = storageService.saveDispatch({
        dispatchDate: r.dispatchDate,
        biltyNumber: r.biltyNumber,
        gpNumber: r.gpNumber,
        sbvNumber: r.sbvNumber,
        itemName: r.itemName,
        packing: r.packing,
        quantity: r.quantity,
        partyName: r.partyName,
        stationName: r.stationName,
        transportName: r.transportName,
      });
      if (res.success) countSuccess++;
    });

    alert(`Successfully imported ${countSuccess} dispatch records!`);
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 my-8 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Import Dispatches from CSV / Excel</h3>
              <p className="text-xs text-slate-500">Bulk upload outgoing stock dispatches with validation</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={downloadSampleCsv}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <Download className="h-4 w-4" /> Download Sample CSV Template
            </button>

            <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500">
              <Upload className="h-4 w-4" /> Choose CSV File
              <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Or Paste CSV Content Directly Below:
            </label>
            <textarea
              rows={4}
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                processCsv(e.target.value);
              }}
              placeholder="Paste comma-separated dispatch records here..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs font-mono text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Validation Status Summary */}
          {importStatus && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="text-emerald-600 dark:text-emerald-400">
                  ✓ {importStatus.validCount} Valid Records Ready
                </span>
                {importStatus.invalidCount > 0 && (
                  <span className="text-red-600 dark:text-red-400">
                    ⚠ {importStatus.invalidCount} Rejected / Errors
                  </span>
                )}
              </div>

              {importStatus.errors.length > 0 && (
                <div className="max-h-24 overflow-y-auto rounded-lg bg-red-50 p-2 text-[11px] text-red-700 dark:bg-red-950/60 dark:text-red-300 space-y-1">
                  {importStatus.errors.map((err, idx) => (
                    <div key={idx}>• {err}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              onClick={onClose}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              disabled={!importStatus || importStatus.validCount === 0}
              onClick={handleExecuteImport}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" /> Confirm & Import {importStatus?.validCount || 0} Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
