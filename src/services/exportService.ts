import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Cheque, CompanySettings, StockBalanceInfo, DispatchRecord, SaleRecord, PettyCashTransaction, PettyCashAccount } from '../types';

export function formatCurrencyPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
}

// --- STOCK EXPORT FUNCTIONS ---

export function exportStockToExcel(stockList: StockBalanceInfo[], settings: CompanySettings, title = 'Stock Balance Report') {
  const sortedStock = [...stockList].sort((a, b) => {
    const dateA = a.dispatch.dispatchDate || '';
    const dateB = b.dispatch.dispatchDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.dispatch.biltyNumber || '').localeCompare(b.dispatch.biltyNumber || '');
  });

  const dateStr = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalDispatched = sortedStock.reduce((sum, s) => sum + s.dispatch.quantity, 0);
  const totalSold = sortedStock.reduce((sum, s) => sum + s.totalSold, 0);
  const totalRemaining = sortedStock.reduce((sum, s) => sum + s.remainingQty, 0);

  const excelData: any[] = [
    [settings.companyName.toUpperCase()],
    ['STOCK MANAGEMENT SYSTEM'],
    [`Report Title: ${title}`],
    [`Generated On: ${dateStr}`],
    [`Total Dispatched: ${totalDispatched} Bags | Total Sold: ${totalSold} Bags | Remaining Stock: ${totalRemaining} Bags`],
    [],
    ['Sr #', 'Dispatch Date', 'Bilty Number', 'Loading From', 'Quality Grade', 'GP Number', 'SBV Number', 'Item Name', 'Packing', 'Dispatched Qty', 'Sold Qty', 'Remaining Qty', 'Party Name', 'Station', 'Days in Stock', 'Stock Status'],
  ];

  sortedStock.forEach((s, idx) => {
    excelData.push([
      idx + 1,
      s.dispatch.dispatchDate,
      s.dispatch.biltyNumber,
      s.dispatch.loadingFrom || 'Main Mill Godown',
      s.dispatch.quality || 'Super Fine Grade A',
      s.dispatch.gpNumber || '',
      s.dispatch.sbvNumber || '',
      s.dispatch.itemName,
      s.dispatch.packing,
      s.dispatch.quantity,
      s.totalSold,
      s.remainingQty,
      s.dispatch.partyName,
      s.dispatch.stationName,
      s.daysInStock,
      s.statusLabel,
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock Balances');
  XLSX.writeFile(workbook, `Stock_Balance_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportStockToCsv(stockList: StockBalanceInfo[]) {
  const sortedStock = [...stockList].sort((a, b) => {
    const dateA = a.dispatch.dispatchDate || '';
    const dateB = b.dispatch.dispatchDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.dispatch.biltyNumber || '').localeCompare(b.dispatch.biltyNumber || '');
  });

  const headers = ['Dispatch Date', 'Bilty Number', 'Loading From', 'Quality Grade', 'GP Number', 'SBV Number', 'Item Name', 'Packing', 'Dispatched Qty', 'Sold Qty', 'Remaining Qty', 'Party Name', 'Station', 'Days in Stock', 'Status'];
  const rows = sortedStock.map((s) => [
    s.dispatch.dispatchDate,
    s.dispatch.biltyNumber,
    `"${(s.dispatch.loadingFrom || 'Main Mill Godown').replace(/"/g, '""')}"`,
    `"${(s.dispatch.quality || 'Super Fine Grade A').replace(/"/g, '""')}"`,
    s.dispatch.gpNumber || '',
    s.dispatch.sbvNumber || '',
    `"${s.dispatch.itemName.replace(/"/g, '""')}"`,
    `"${s.dispatch.packing}"`,
    s.dispatch.quantity,
    s.totalSold,
    s.remainingQty,
    `"${s.dispatch.partyName.replace(/"/g, '""')}"`,
    `"${s.dispatch.stationName.replace(/"/g, '""')}"`,
    s.daysInStock,
    s.statusLabel,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Stock_Balance_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printStockReport(
  stockList: StockBalanceInfo[],
  settings: CompanySettings,
  title = 'Live Stock Balance Report',
  excludeZeroStock = true
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print stock reports');
    return;
  }

  // Filter out zero entries (0 remaining stock) if excludeZeroStock is true
  const listToPrint = excludeZeroStock ? stockList.filter((s) => s.remainingQty > 0) : stockList;

  // Ensure first entry on first (chronological order)
  const sortedStock = [...listToPrint].sort((a, b) => {
    const dateA = a.dispatch.dispatchDate || '';
    const dateB = b.dispatch.dispatchDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.dispatch.biltyNumber || '').localeCompare(b.dispatch.biltyNumber || '');
  });

  const totalDispatched = sortedStock.reduce((sum, s) => sum + s.dispatch.quantity, 0);
  const totalSold = sortedStock.reduce((sum, s) => sum + s.totalSold, 0);
  const totalRemaining = sortedStock.reduce((sum, s) => sum + s.remainingQty, 0);
  const dateStr = new Date().toLocaleDateString();

  const rowsHtml = sortedStock.length === 0
    ? `<tr><td colspan="13" style="text-align: center; padding: 24px; color: #64748b; font-style: italic;">No stock records with remaining balance found.</td></tr>`
    : sortedStock
        .map(
          (s, idx) => `
      <tr>
        <td>${idx + 1}</td>
        <td>${s.dispatch.dispatchDate}</td>
        <td><strong>${s.dispatch.biltyNumber}</strong></td>
        <td>${s.dispatch.loadingFrom || 'Main Mill Godown'}</td>
        <td>${s.dispatch.quality || 'Super Fine Grade A'}</td>
        <td>${s.dispatch.itemName} (${s.dispatch.packing})</td>
        <td style="text-align: right;">${s.dispatch.quantity}</td>
        <td style="text-align: right;">${s.totalSold}</td>
        <td style="text-align: right; font-weight: bold; color: ${s.remainingQty === 0 ? '#dc2626' : s.remainingQty <= s.dispatch.quantity * 0.5 ? '#d97706' : '#16a34a'};">${s.remainingQty}</td>
        <td>${s.dispatch.partyName}</td>
        <td>${s.dispatch.stationName}</td>
        <td style="text-align: center;">${s.daysInStock > 3650 || isNaN(s.daysInStock) || s.daysInStock < 0 ? '-' : `${s.daysInStock} d`}</td>
        <td><span class="badge ${s.statusColor}">${s.statusLabel}</span></td>
      </tr>
    `
        )
        .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title} - ${settings.companyName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1e293b; }
          .header { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .summary { display: flex; gap: 20px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px 16px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #1e3a8a; }
          td { padding: 6px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge.green { background: #d1fae5; color: #065f46; }
          .badge.yellow { background: #fef3c7; color: #92400e; }
          .badge.red { background: #fee2e2; color: #991b1b; }
          .totals { font-weight: bold; background: #f1f5f9; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #64748b; }
          .sig-line { border-top: 1px solid #94a3b8; width: 180px; text-align: center; padding-top: 6px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${settings.companyName.toUpperCase()}</h1>
            <div class="sub">Stock & Dispatch Control Register • ${settings.phone}</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <strong>${title}</strong><br/>
            Date: ${dateStr}<br/>
            Total Records: ${sortedStock.length}
          </div>
        </div>

        <div class="summary">
          <div>Dispatched: <strong>${totalDispatched} Bags</strong></div>
          <div>Sold: <strong style="color: #2563eb;">${totalSold} Bags</strong></div>
          <div>Remaining Stock: <strong style="color: #16a34a;">${totalRemaining} Bags</strong></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Dispatch Date</th>
              <th>Bilty #</th>
              <th>Loading From</th>
              <th>Quality Grade</th>
              <th>Item & Packing</th>
              <th style="text-align: right;">Dispatch Qty</th>
              <th style="text-align: right;">Sold Qty</th>
              <th style="text-align: right;">Remaining</th>
              <th>Party</th>
              <th>Station</th>
              <th style="text-align: center;">Age</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="totals">
              <td colspan="5" style="text-align: right;">TOTALS:</td>
              <td style="text-align: right;">${totalDispatched}</td>
              <td style="text-align: right;">${totalSold}</td>
              <td style="text-align: right; color: #16a34a;">${totalRemaining}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">STOCK MANAGER</div>
          <div class="sig-line">ACCOUNTS INCHARGE</div>
          <div class="sig-line">FACTORY DIRECTOR</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function exportToExcel(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Report') {
  const sortedCheques = [...cheques].sort((a, b) => {
    const dateA = a.receiveDate || a.chequeDate || '';
    const dateB = b.receiveDate || b.chequeDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const dateStr = new Date().toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const totalAmount = sortedCheques.reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = sortedCheques.filter((c) => c.status === 'Outstanding').reduce((sum, c) => sum + c.amount, 0);
  const clearedAmount = sortedCheques.filter((c) => c.status === 'Cleared').reduce((sum, c) => sum + c.amount, 0);

  // Header metadata rows
  const excelData: any[] = [
    [settings.companyName.toUpperCase()],
    [settings.tagline || 'Cheque Management System'],
    [`Report Title: ${title}`],
    [`Generated On: ${dateStr}`],
    [`Total Records: ${sortedCheques.length} | Total Outstanding: ${formatCurrencyPKR(outstandingAmount)} | Total Cleared: ${formatCurrencyPKR(clearedAmount)}`],
    [], // Blank separator row
    [
      'Sr #',
      'Receive Date',
      'Party Name (Receive From)',
      'City',
      'Bank Name',
      'Cheque Number',
      'Cheque Date',
      'Amount (PKR)',
      'Received By',
      'Voucher Number',
      'Status',
      'Paid Date',
      'Paid To / Account',
      'Remarks',
    ],
  ];

  sortedCheques.forEach((c, idx) => {
    excelData.push([
      idx + 1,
      c.receiveDate,
      c.receiveFrom,
      c.city,
      c.bank,
      c.chequeNumber,
      c.chequeDate,
      c.amount,
      c.receivedBy,
      c.voucherNumber || 'N/A',
      c.status,
      c.paidDate || '-',
      c.paidTo || '-',
      c.remarks || '',
    ]);
  });

  // Footer summary row
  excelData.push([]);
  excelData.push(['', '', '', '', '', '', 'GRAND TOTAL:', totalAmount, '', '', '', '', '', '']);

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // Sr
    { wch: 14 }, // Rec Date
    { wch: 30 }, // Party
    { wch: 16 }, // City
    { wch: 26 }, // Bank
    { wch: 18 }, // Cheque No
    { wch: 14 }, // Cheque Date
    { wch: 18 }, // Amount
    { wch: 20 }, // Rec By
    { wch: 18 }, // Voucher
    { wch: 14 }, // Status
    { wch: 14 }, // Paid Date
    { wch: 22 }, // Paid To
    { wch: 30 }, // Remarks
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cheques');

  const fileName = `SaleemDaal_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

export function exportToCSV(cheques: Cheque[], settings: CompanySettings, title = 'Cheque_Export') {
  const sortedCheques = [...cheques].sort((a, b) => {
    const dateA = a.receiveDate || a.chequeDate || '';
    const dateB = b.receiveDate || b.chequeDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const headers = [
    'Sr No',
    'Receive Date',
    'Party Name',
    'City',
    'Bank',
    'Cheque Number',
    'Cheque Date',
    'Amount (PKR)',
    'Received By',
    'Voucher Number',
    'Status',
    'Paid Date',
    'Remarks',
  ];

  const rows = sortedCheques.map((c, i) => [
    i + 1,
    `"${c.receiveDate}"`,
    `"${c.receiveFrom.replace(/"/g, '""')}"`,
    `"${c.city}"`,
    `"${c.bank.replace(/"/g, '""')}"`,
    `"${c.chequeNumber}"`,
    `"${c.chequeDate}"`,
    c.amount,
    `"${c.receivedBy}"`,
    `"${c.voucherNumber || ''}"`,
    `"${c.status}"`,
    `"${c.paidDate || ''}"`,
    `"${(c.remarks || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SaleemDaal_${title}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToPDF(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Report') {
  const sortedCheques = [...cheques].sort((a, b) => {
    const dateA = a.receiveDate || a.chequeDate || '';
    const dateB = b.receiveDate || b.chequeDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const doc = new jsPDF('landscape', 'mm', 'a4');
  const totalAmount = sortedCheques.reduce((sum, c) => sum + c.amount, 0);
  const outstandingAmount = sortedCheques.filter((c) => c.status === 'Outstanding').reduce((sum, c) => sum + c.amount, 0);
  const clearedAmount = sortedCheques.filter((c) => c.status === 'Cleared').reduce((sum, c) => sum + c.amount, 0);

  // Header Box
  doc.setFillColor(15, 23, 42); // Slate 900
  doc.rect(0, 0, 297, 24, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(settings.companyName.toUpperCase(), 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text(settings.tagline || 'Cheque Management System', 14, 17);

  const genDate = new Date().toLocaleString('en-PK');
  doc.text(`Generated: ${genDate}`, 283, 11, { align: 'right' });
  doc.text(`Total Records: ${sortedCheques.length}`, 283, 17, { align: 'right' });

  // Subheader title & metrics
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(title, 14, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(
    `Total: ${formatCurrencyPKR(totalAmount)}   |   Outstanding: ${formatCurrencyPKR(outstandingAmount)}   |   Cleared: ${formatCurrencyPKR(clearedAmount)}`,
    14,
    38
  );

  // Table
  const tableData = sortedCheques.map((c, index) => [
    index + 1,
    c.receiveDate,
    c.receiveFrom,
    c.city,
    c.bank,
    c.chequeNumber,
    c.chequeDate,
    formatCurrencyPKR(c.amount),
    c.voucherNumber || '-',
    c.status,
    c.paidDate || '-',
  ]);

  (doc as any).autoTable({
    startY: 42,
    head: [['#', 'Rec Date', 'Party Name', 'City', 'Bank', 'Cheque #', 'Chq Date', 'Amount', 'Voucher #', 'Status', 'Paid Date']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175], // Blue 800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 18 },
      2: { cellWidth: 42 },
      3: { cellWidth: 22 },
      4: { cellWidth: 38 },
      5: { cellWidth: 26 },
      6: { cellWidth: 20 },
      7: { cellWidth: 28, halign: 'right' },
      8: { cellWidth: 24, halign: 'center' },
      9: { cellWidth: 22, halign: 'center' },
      10: { cellWidth: 20 },
    },
    didParseCell: (data: any) => {
      if (data.section === 'body' && data.column.index === 9) {
        if (data.cell.raw === 'Cleared') {
          data.cell.styles.textColor = [16, 185, 129]; // Green
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = [239, 68, 68]; // Red
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Signatures at bottom
  const sigY = Math.max(finalY + 20, 180);
  if (sigY + 15 < 200) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);

    doc.line(20, sigY, 70, sigY);
    doc.text('PREPARED BY', 45, sigY + 5, { align: 'center' });

    doc.line(120, sigY, 170, sigY);
    doc.text('CHECKED BY', 145, sigY + 5, { align: 'center' });

    doc.line(220, sigY, 270, sigY);
    doc.text('AUTHORIZED SIGNATURE', 245, sigY + 5, { align: 'center' });
  }

  const fileName = `SaleemDaal_${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
}

export function printChequeList(cheques: Cheque[], settings: CompanySettings, title = 'Cheque Management Register') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  // Ensure first entry on first (chronological order)
  const sortedCheques = [...cheques].sort((a, b) => {
    const dateA = a.receiveDate || a.chequeDate || '';
    const dateB = b.receiveDate || b.chequeDate || '';
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const totalQty = sortedCheques.length;
  const totalAmount = sortedCheques.reduce((sum, c) => sum + c.amount, 0);

  const outstandingCheques = sortedCheques.filter((c) => c.status === 'Outstanding');
  const outstandingQty = outstandingCheques.length;
  const outstandingAmount = outstandingCheques.reduce((sum, c) => sum + c.amount, 0);

  const clearedCheques = sortedCheques.filter((c) => c.status === 'Cleared');
  const clearedQty = clearedCheques.length;
  const clearedAmount = clearedCheques.reduce((sum, c) => sum + c.amount, 0);

  const returnedCheques = sortedCheques.filter((c) => c.status === 'Returned');
  const returnedQty = returnedCheques.length;
  const returnedAmount = returnedCheques.reduce((sum, c) => sum + c.amount, 0);

  const rowsHtml = sortedCheques
    .map(
      (c, i) => `
    <tr>
      <td style="text-align: center;">${i + 1}</td>
      <td>${c.receiveDate}</td>
      <td><strong>${c.receiveFrom}</strong></td>
      <td>${c.city}</td>
      <td>${c.bank}</td>
      <td><code>${c.chequeNumber}</code></td>
      <td>${c.chequeDate}</td>
      <td style="text-align: right; font-weight: bold;">${formatCurrencyPKR(c.amount)}</td>
      <td style="text-align: center;">${c.voucherNumber || '-'}</td>
      <td style="text-align: center;">${c.paidDate || '-'}</td>
      <td style="text-align: center;">
        <span class="badge ${c.status.toLowerCase()}">${c.status}</span>
      </td>
      <td>${c.receivedBy}</td>
    </tr>
  `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${settings.companyName} - ${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #1e293b; }
          .header { border-bottom: 2px solid #1e40af; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
          .sub { font-size: 13px; color: #64748b; margin-top: 4px; }
          .summary-blocks { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px; }
          .summary-card { border: 1px solid #cbd5e1; background: #f8fafc; border-radius: 8px; padding: 12px 14px; }
          .summary-card.total { border-color: #3b82f6; background: #eff6ff; }
          .summary-card.outstanding { border-color: #f43f5e; background: #fff1f2; }
          .summary-card.cleared { border-color: #10b981; background: #ecfdf5; }
          .summary-card.returned { border-color: #f59e0b; background: #fffbeb; }
          .card-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; }
          .card-qty { font-size: 22px; font-weight: 900; color: #0f172a; margin: 4px 0 2px 0; }
          .card-qty .unit { font-size: 12px; font-weight: 700; color: #475569; }
          .card-amount { font-size: 11px; font-weight: 600; color: #334155; }
          .summary-card.outstanding .card-qty { color: #e11d48; }
          .summary-card.cleared .card-qty { color: #059669; }
          .summary-card.returned .card-qty { color: #d97706; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-weight: 600; border: 1px solid #1e3a8a; }
          td { padding: 6px 10px; border: 1px solid #cbd5e1; }
          tr:nth-child(even) { background: #f8fafc; }
          .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
          .badge.cleared { background: #d1fae5; color: #065f46; }
          .badge.outstanding { background: #fee2e2; color: #991b1b; }
          .badge.returned { background: #fef3c7; color: #92400e; }
          .totals { font-weight: bold; background: #f1f5f9; }
          .signatures { margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; color: #64748b; }
          .sig-line { border-top: 1px solid #94a3b8; width: 180px; text-align: center; padding-top: 6px; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${settings.companyName.toUpperCase()}</h1>
            <div class="sub">${settings.tagline || 'Cheque Management Register'} • ${settings.phone}</div>
          </div>
          <div style="text-align: right; font-size: 12px;">
            <strong>${title}</strong><br/>
            Date: ${new Date().toLocaleDateString('en-PK')}<br/>
            Total Records: ${sortedCheques.length}
          </div>
        </div>

        <div class="summary-blocks">
          <div class="summary-card total">
            <div class="card-label">TOTAL REGISTERED</div>
            <div class="card-qty">${totalQty} <span class="unit">Cheques</span></div>
            <div class="card-amount">Amount: ${formatCurrencyPKR(totalAmount)}</div>
          </div>
          <div class="summary-card outstanding">
            <div class="card-label">OUTSTANDING (AWAITING)</div>
            <div class="card-qty">${outstandingQty} <span class="unit">Cheques</span></div>
            <div class="card-amount">Amount: ${formatCurrencyPKR(outstandingAmount)}</div>
          </div>
          <div class="summary-card cleared">
            <div class="card-label">CLEARED (VOUCHER)</div>
            <div class="card-qty">${clearedQty} <span class="unit">Cheques</span></div>
            <div class="card-amount">Amount: ${formatCurrencyPKR(clearedAmount)}</div>
          </div>
          <div class="summary-card returned">
            <div class="card-label">RETURNED TO CUSTOMER</div>
            <div class="card-qty">${returnedQty} <span class="unit">Cheques</span></div>
            <div class="card-amount">Amount: ${formatCurrencyPKR(returnedAmount)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Receive Date</th>
              <th>Party Name</th>
              <th>City</th>
              <th>Bank</th>
              <th>Cheque #</th>
              <th>Chq Date</th>
              <th style="text-align: right;">Amount</th>
              <th>Voucher #</th>
              <th>Paid Date</th>
              <th>Status</th>
              <th>Received By</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="totals">
              <td colspan="7" style="text-align: right;">GRAND TOTAL:</td>
              <td style="text-align: right;">${formatCurrencyPKR(totalAmount)}</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">PREPARED BY</div>
          <div class="sig-line">CHECKED BY</div>
          <div class="sig-line">AUTHORIZED SIGNATURE</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

// --- PETTY CASH EXPORT & PRINT FUNCTIONS ---

export function exportPettyCashToExcel(
  transactions: PettyCashTransaction[],
  settings: CompanySettings,
  title = 'Petty Cash Ledger Report',
  account?: PettyCashAccount | null
) {
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = (a.date || '') + ' ' + (a.time || '00:00');
    const dateB = (b.date || '') + ' ' + (b.time || '00:00');
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const createdA = a.createdAt || '';
    const createdB = b.createdAt || '';
    if (createdA !== createdB) return createdA.localeCompare(createdB);
    return (a.voucherNumber || '').localeCompare(b.voucherNumber || '');
  });

  const dateStr = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
  const totalReceived = sortedTransactions.reduce((sum, t) => sum + (Number(t.cashReceived) || 0), 0);
  const totalPaid = sortedTransactions.reduce((sum, t) => sum + (Number(t.cashPaid) || 0), 0);

  const openingBalance =
    sortedTransactions.length > 0 && typeof sortedTransactions[0].previousBalance === 'number'
      ? sortedTransactions[0].previousBalance
      : account
      ? account.openingBalance
      : 0;

  const closingBalance = openingBalance + totalReceived - totalPaid;

  const excelData: any[] = [
    [settings.companyName.toUpperCase()],
    ['SALEEM DAAL FACTORY • PETTY CASH MANAGEMENT SYSTEM'],
    [`Statement: ${title}`],
    [`Generated On: ${dateStr} at ${new Date().toLocaleTimeString('en-PK')}`],
    [
      `Opening Balance: ${formatCurrencyPKR(openingBalance)}`,
      `Total Cash In (+): ${formatCurrencyPKR(totalReceived)}`,
      `Total Cash Out (-): ${formatCurrencyPKR(totalPaid)}`,
      `Net Movement: ${formatCurrencyPKR(totalReceived - totalPaid)}`,
      `Closing Balance: ${formatCurrencyPKR(closingBalance)}`,
    ],
    [],
    [
      'Sr #',
      'Date',
      'Time',
      'System Voucher #',
      'Manual Voucher #',
      'Transaction Type',
      'Description / Particulars',
      'Expense Category',
      'Beneficiary / Vendor',
      'Cash In (PKR)',
      'Cash Out (PKR)',
      'Running Balance (PKR)',
      'Payment Method',
      'Status',
      'Approved By',
    ],
  ];

  // Add opening float row
  excelData.push([
    '-',
    sortedTransactions[0]?.date || '-',
    '-',
    '-',
    '-',
    'OPENING FLOAT',
    'Previous Day / Opening Balance Carried Forward',
    '-',
    '-',
    0,
    0,
    openingBalance,
    '-',
    'Verified',
    'System',
  ]);

  let currentRunning = openingBalance;
  sortedTransactions.forEach((t, idx) => {
    const inAmt = Number(t.cashReceived) || 0;
    const outAmt = Number(t.cashPaid) || 0;
    currentRunning = currentRunning + inAmt - outAmt;

    excelData.push([
      idx + 1,
      t.date,
      t.time || '',
      t.voucherNumber,
      t.manualVoucherNumber || '-',
      t.transactionType === 'CASH_ISSUE' ? 'Money In' : t.transactionType === 'EXPENSE' ? 'Money Out' : 'Imprest Reimbursement',
      t.description || t.reason || '-',
      t.categoryName || (inAmt > 0 ? 'Cash Advance / Float' : 'General Expense'),
      t.vendorName || '-',
      inAmt > 0 ? inAmt : 0,
      outAmt > 0 ? outAmt : 0,
      currentRunning,
      t.paymentMethod || 'Cash',
      t.approvalStatus || 'Approved',
      t.approvedBy || 'Accounts Team',
    ]);
  });

  // Summary row at bottom
  excelData.push([]);
  excelData.push([
    '',
    '',
    '',
    '',
    '',
    'TOTALS & CLOSING',
    `Net Movement: ${formatCurrencyPKR(totalReceived - totalPaid)}`,
    '',
    '',
    totalReceived,
    totalPaid,
    currentRunning,
    '',
    '',
    '',
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(excelData);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // Sr #
    { wch: 13 }, // Date
    { wch: 9 },  // Time
    { wch: 18 }, // System Voucher #
    { wch: 18 }, // Manual Voucher #
    { wch: 16 }, // Type
    { wch: 38 }, // Description
    { wch: 22 }, // Category
    { wch: 22 }, // Vendor
    { wch: 16 }, // Cash In
    { wch: 16 }, // Cash Out
    { wch: 20 }, // Running Balance
    { wch: 16 }, // Payment Method
    { wch: 12 }, // Status
    { wch: 18 }, // Approved By
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Petty Cash Ledger');
  XLSX.writeFile(workbook, `Petty_Cash_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportPettyCashToCsv(
  transactions: PettyCashTransaction[],
  account?: PettyCashAccount | null
) {
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = (a.date || '') + ' ' + (a.time || '00:00');
    const dateB = (b.date || '') + ' ' + (b.time || '00:00');
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    const createdA = a.createdAt || '';
    const createdB = b.createdAt || '';
    if (createdA !== createdB) return createdA.localeCompare(createdB);
    return (a.voucherNumber || '').localeCompare(b.voucherNumber || '');
  });

  const openingBalance =
    sortedTransactions.length > 0 && typeof sortedTransactions[0].previousBalance === 'number'
      ? sortedTransactions[0].previousBalance
      : account
      ? account.openingBalance
      : 0;

  const headers = [
    'Sr #',
    'Date',
    'Time',
    'System Voucher #',
    'Manual Voucher #',
    'Type',
    'Description',
    'Category',
    'Cash In',
    'Cash Out',
    'Running Balance',
    'Status',
    'Approved By'
  ];

  let currentRunning = openingBalance;
  const rows: (string | number)[][] = [];

  // Opening row
  rows.push([
    '-',
    sortedTransactions[0]?.date || '-',
    '-',
    '-',
    '-',
    'OPENING FLOAT',
    'Previous Day Opening Balance',
    '-',
    0,
    0,
    openingBalance,
    'Verified',
    'System'
  ]);

  sortedTransactions.forEach((t, idx) => {
    const inAmt = Number(t.cashReceived) || 0;
    const outAmt = Number(t.cashPaid) || 0;
    currentRunning = currentRunning + inAmt - outAmt;

    rows.push([
      idx + 1,
      t.date,
      t.time || '',
      t.voucherNumber,
      `"${(t.manualVoucherNumber || '').replace(/"/g, '""')}"`,
      t.transactionType,
      `"${(t.description || t.reason || '').replace(/"/g, '""')}"`,
      `"${(t.categoryName || '').replace(/"/g, '""')}"`,
      inAmt,
      outAmt,
      currentRunning,
      t.approvalStatus,
      `"${(t.approvedBy || '').replace(/"/g, '""')}"`
    ]);
  });

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Petty_Cash_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPettyCashVoucher(tx: PettyCashTransaction, settings: CompanySettings) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print vouchers');
    return;
  }

  const isIssue = tx.transactionType === 'CASH_ISSUE';
  const isReim = tx.transactionType === 'REIMBURSEMENT';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Petty Cash Voucher - ${tx.voucherNumber}</title>
        <style>
          body { font-family: 'Arial', sans-serif; margin: 30px; color: #1e293b; font-size: 13px; }
          .voucher-box { border: 2px solid #0f172a; padding: 24px; border-radius: 8px; max-width: 750px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #0f172a; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .badge { background: #0284c7; color: white; padding: 6px 14px; border-radius: 4px; font-weight: bold; font-size: 14px; }
          .badge.exp { background: #e11d48; }
          .badge.reim { background: #16a34a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
          .label { font-weight: bold; color: #475569; font-size: 11px; text-transform: uppercase; }
          .value { font-size: 14px; font-weight: 600; color: #0f172a; margin-top: 2px; }
          .amount-box { background: #f8fafc; border: 1.5px solid #cbd5e1; padding: 14px; border-radius: 6px; text-align: right; margin-bottom: 20px; }
          .amount-val { font-size: 24px; font-weight: bold; color: #0f172a; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-top: 50px; text-align: center; }
          .sig-line { border-top: 1px solid #64748b; padding-top: 6px; font-weight: bold; font-size: 11px; color: #475569; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="voucher-box">
          <div class="header">
            <div>
              <div class="title">${settings.companyName.toUpperCase()}</div>
              <div class="subtitle">Petty Cash ${isIssue ? 'Payment Voucher' : isReim ? 'Reimbursement Voucher' : 'Expense Voucher'}</div>
            </div>
            <div style="text-align: right;">
              <span class="badge ${isIssue ? '' : isReim ? 'reim' : 'exp'}">${tx.transactionType.replace('_', ' ')}</span>
              <div style="margin-top: 8px; font-weight: bold; font-size: 14px; font-family: monospace;">Sys: ${tx.voucherNumber}</div>
              <div style="margin-top: 4px; font-weight: bold; font-size: 13px; font-family: monospace; color: #1e40af;">Manual: ${tx.manualVoucherNumber || '-'}</div>
            </div>
          </div>

          <div class="grid">
            <div>
              <div class="label">Date & Time</div>
              <div class="value">${tx.date} at ${tx.time || '12:00'}</div>
            </div>
            <div>
              <div class="label">Manual Voucher #</div>
              <div class="value" style="font-family: monospace; color: #1e40af;">${tx.manualVoucherNumber || 'N/A'}</div>
            </div>
            <div>
              <div class="label">System Voucher #</div>
              <div class="value" style="font-family: monospace;">${tx.voucherNumber}</div>
            </div>
            <div>
              <div class="label">Status</div>
              <div class="value">${tx.approvalStatus}</div>
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <div class="label">Description / Reason</div>
            <div class="value" style="background: #f1f5f9; padding: 10px; border-radius: 4px; margin-top: 4px;">
              ${tx.description || tx.reason || 'N/A'}
            </div>
          </div>

          <div class="amount-box">
            <div class="label">Transaction Amount (PKR)</div>
            <div class="amount-val">${formatCurrencyPKR(isIssue || isReim ? tx.cashReceived : tx.cashPaid)}</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
              Previous Balance: ${formatCurrencyPKR(tx.previousBalance)} → New Balance: <strong>${formatCurrencyPKR(tx.runningBalance)}</strong>
            </div>
          </div>

          <div class="signatures">
            <div class="sig-line">PREPARED / RECORDED BY<br/><small style="font-weight: normal;">${tx.createdBy}</small></div>
            <div class="sig-line">RECEIVED / VERIFIED BY<br/><small style="font-weight: normal;">${tx.employeeName}</small></div>
            <div class="sig-line">APPROVED BY<br/><small style="font-weight: normal;">${tx.approvedBy || 'Authorized Manager'}</small></div>
          </div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printPettyCashLedger(
  transactions: PettyCashTransaction[],
  account: PettyCashAccount | null,
  settings: CompanySettings,
  title = 'Petty Cash Ledger Statement'
) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print petty cash ledger');
    return;
  }

  // Ensure first entry on first (chronological order: oldest first, latest last)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = (a.date || '') + ' ' + (a.time || '00:00');
    const dateB = (b.date || '') + ' ' + (b.time || '00:00');
    if (dateA !== dateB) return dateA.localeCompare(dateB);
    return (a.createdAt || '').localeCompare(b.createdAt || '');
  });

  const totalIn = sortedTransactions.reduce((s, t) => s + t.cashReceived, 0);
  const totalOut = sortedTransactions.reduce((s, t) => s + t.cashPaid, 0);

  // Opening balance is the balance prior to the first transaction in this printed period (closing of previous day)
  const openingBalance =
    sortedTransactions.length > 0 && typeof sortedTransactions[0].previousBalance === 'number'
      ? sortedTransactions[0].previousBalance
      : account
      ? account.openingBalance
      : 0;

  const closingBalance = openingBalance + totalIn - totalOut;

  let currentRunning = openingBalance;
  const rowsHtml = sortedTransactions
    .map((t, idx) => {
      const inAmt = Number(t.cashReceived) || 0;
      const outAmt = Number(t.cashPaid) || 0;
      currentRunning = currentRunning + inAmt - outAmt;
      return `
      <tr>
        <td style="text-align: center;">${idx + 1}</td>
        <td>${t.date}${t.time ? ` <small style="color: #64748b;">${t.time}</small>` : ''}</td>
        <td style="font-family: monospace; font-weight: bold;">${t.voucherNumber}</td>
        <td style="font-family: monospace; font-weight: bold; color: #1e40af;">${t.manualVoucherNumber || '-'}</td>
        <td>${t.description || t.reason || '-'}</td>
        <td style="text-align: right; color: #16a34a; font-weight: 600;">${inAmt > 0 ? formatCurrencyPKR(inAmt) : '-'}</td>
        <td style="text-align: right; color: #dc2626; font-weight: 600;">${outAmt > 0 ? formatCurrencyPKR(outAmt) : '-'}</td>
        <td style="text-align: right; font-weight: bold; background: #f8fafc;">${formatCurrencyPKR(currentRunning)}</td>
      </tr>
    `;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #0f172a; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }
          .title { font-size: 20px; font-weight: bold; color: #0f172a; margin: 0; }
          .sub { font-size: 12px; color: #475569; margin-top: 2px; }
          .summary-bar { background: #f1f5f9; border: 1.5px solid #cbd5e1; padding: 12px 16px; border-radius: 8px; margin-bottom: 16px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
          .summary-item { text-align: center; }
          .summary-label { font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
          .summary-val { font-size: 16px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th { background: #0f172a; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
          td { padding: 6px 10px; border: 1px solid #e2e8f0; }
          tr:nth-child(even) { background: #f8fafc; }
          .opening-row { background: #f8fafc; font-weight: 700; border-top: 2px solid #cbd5e1; border-bottom: 2px solid #cbd5e1; }
          .totals { font-weight: bold; background: #e2e8f0; font-size: 12px; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; color: #475569; }
          .sig-line { border-top: 1px solid #94a3b8; width: 170px; text-align: center; padding-top: 6px; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${settings.companyName.toUpperCase()}</h1>
            <div class="sub">Saleem Daal Factory • Petty Cash Register</div>
          </div>
          <div style="text-align: right; font-size: 11px;">
            <strong>${title}</strong><br/>
            Date: ${new Date().toLocaleDateString('en-PK')}<br/>
            Total Transactions: ${sortedTransactions.length}
          </div>
        </div>

        <div class="summary-bar">
          <div class="summary-item">
            <div class="summary-label">Opening Balance (Prev Day Closing)</div>
            <div class="summary-val" style="color: #0284c7;">${formatCurrencyPKR(openingBalance)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Cash In (+)</div>
            <div class="summary-val" style="color: #16a34a;">+${formatCurrencyPKR(totalIn)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Total Cash Out (-)</div>
            <div class="summary-val" style="color: #dc2626;">-${formatCurrencyPKR(totalOut)}</div>
          </div>
          <div class="summary-item">
            <div class="summary-label">Closing Balance</div>
            <div class="summary-val" style="color: #0f172a;">${formatCurrencyPKR(closingBalance)}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 35px; text-align: center;">#</th>
              <th style="width: 85px;">Date</th>
              <th style="width: 100px;">Sys Voucher #</th>
              <th style="width: 100px;">Manual Voucher #</th>
              <th>Description / Particulars</th>
              <th style="width: 90px; text-align: right;">Cash In</th>
              <th style="width: 90px; text-align: right;">Cash Out</th>
              <th style="width: 95px; text-align: right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr class="opening-row">
              <td style="text-align: center;">-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td><strong>OPENING BALANCE (Closing of Previous Day)</strong></td>
              <td style="text-align: right;">-</td>
              <td style="text-align: right;">-</td>
              <td style="text-align: right; font-weight: 800; color: #0284c7;">${formatCurrencyPKR(openingBalance)}</td>
            </tr>
            ${rowsHtml}
            <tr class="totals">
              <td colspan="5" style="text-align: right;">GRAND TOTALS & CLOSING BALANCE:</td>
              <td style="text-align: right; color: #16a34a;">+${formatCurrencyPKR(totalIn)}</td>
              <td style="text-align: right; color: #dc2626;">-${formatCurrencyPKR(totalOut)}</td>
              <td style="text-align: right; font-weight: 800; color: #0284c7;">${formatCurrencyPKR(closingBalance)}</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-line">PREPARED BY</div>
          <div class="sig-line">ACCOUNTS VERIFIED</div>
          <div class="sig-line">MANAGER APPROVAL</div>
        </div>

        <script>
          window.onload = function() { window.print(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
