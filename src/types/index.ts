export type ChequeStatus = 'Outstanding' | 'Cleared' | 'Returned';

export interface Cheque {
  id: string;
  receiveDate: string; // YYYY-MM-DD
  receiveFrom: string; // Party Name (Receive From / Customer)
  city: string;
  bank: string;
  chequeNumber: string;
  chequeDate: string; // YYYY-MM-DD
  amount: number;
  receivedBy: string; // Employee Name
  paidDate?: string; // YYYY-MM-DD
  paidTo?: string; // Paid To Party Name / Disbursed Account
  voucherNumber?: string;
  status: ChequeStatus; // 'Outstanding' | 'Cleared' | 'Returned'
  returnDate?: string; // YYYY-MM-DD (Date returned to customer)
  returnReason?: string; // Reason for returning cheque to customer
  remarks?: string;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Party {
  id: string;
  name: string;
  city: string;
  phone?: string;
  address?: string;
  contactPerson?: string;
  createdAt: string;
}

export interface Bank {
  id: string;
  name: string;
  branchCode?: string;
  city?: string;
}

export interface City {
  id: string;
  name: string;
  province?: string;
}

export interface Employee {
  id: string;
  name: string;
  designation: string;
  phone?: string;
  department?: string;
}

export interface CompanySettings {
  companyName: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  ntn?: string;
  strn?: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  backupFolder: string;
  exportFolder: string;
  autoBackupSchedule: 'daily' | 'weekly' | 'monthly' | 'disabled';
  logoUrl?: string;
}

export interface BackupRecord {
  id: string;
  fileName: string;
  createdAt: string;
  totalRecords: number;
  fileSizeKb: number;
  type: 'manual' | 'auto';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'RESTORE' | 'IMPORT' | 'BACKUP' | 'RESTORE_DB' | 'LOGIN';
  details: string;
  user?: string;
}

// --- STOCK MANAGEMENT MODULE TYPES ---

export interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  packing: string; // e.g. "50 kg Bag", "25 kg Bag"
  unit: string; // "Bags", "Kg", "Ton"
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Station {
  id: string;
  name: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface TransportCompany {
  id: string;
  name: string;
  contact?: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface DispatchRecord {
  id: string;
  dispatchDate: string; // YYYY-MM-DD
  biltyNumber: string; // Unique
  gpNumber?: string;
  sbvNumber?: string;
  loadingFrom?: string; // e.g. "Mill Godown #1", "Factory Silo A", "Main Warehouse"
  quality?: string; // e.g. "Grade A Super", "Premium", "Fine", "Standard", "Export Quality"
  itemId: string;
  itemName: string;
  packing: string;
  quantity: number; // Dispatched Qty
  partyId?: string;
  partyName?: string;
  stationId?: string;
  stationName: string;
  transportId?: string;
  transportName?: string;
  helperNumber?: string;
  remarks?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface SaleRecord {
  id: string;
  dispatchId: string;
  biltyNumber: string;
  saleDate: string; // YYYY-MM-DD (Sale Bill Date)
  pickupDate?: string; // YYYY-MM-DD (Pickup Date)
  sbvNumber?: string; // SBV Bill Number / Voucher
  partyId?: string;
  partyName?: string; // Customer Party / Name
  quantitySold: number;
  invoiceNumber?: string;
  remarks?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface StockBalanceInfo {
  dispatch: DispatchRecord;
  totalSold: number;
  remainingQty: number;
  daysInStock: number;
  salesCount: number;
  statusColor: 'green' | 'yellow' | 'red';
  statusLabel: string;
}

export interface StockFilterState {
  searchQuery: string;
  biltyNumber?: string;
  partyName?: string;
  stationName?: string;
  itemName?: string;
  transportName?: string;
  startDate?: string;
  endDate?: string;
  stockAvailability?: 'ALL' | 'IN_STOCK' | 'LOW_STOCK' | 'FULLY_SOLD' | 'ACTIVE_ONLY';
}

export interface FilterState {
  searchQuery: string;
  status: 'ALL' | 'Outstanding' | 'Cleared' | 'Returned';
  startDate?: string;
  endDate?: string;
  paidStartDate?: string;
  paidEndDate?: string;
  bank?: string;
  city?: string;
  employee?: string;
  party?: string;
  paidTo?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface PaginationState {
  page: number;
  pageSize: number;
}

export interface SortState {
  field: keyof Cheque;
  direction: 'asc' | 'desc';
}

// --- PETTY CASH MANAGEMENT MODULE TYPES ---

export type PettyCashAccountStatus = 'Active' | 'Closed';
export type TransactionType = 'CASH_ISSUE' | 'EXPENSE' | 'REIMBURSEMENT';
export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
export type UserRole = 'Administrator' | 'Accounts' | 'Manager' | 'Employee' | 'Viewer';

export interface UserPermissions {
  canViewDashboard: boolean;
  canManageCheques: boolean;
  canViewCheques: boolean;
  canManageStock: boolean;
  canViewStock: boolean;
  canManagePettyCash: boolean;
  canViewPettyCash: boolean;
  canManageMasterData: boolean;
  canManageSettings: boolean;
  canManageUsers: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: UserRole;
  department?: string;
  pin: string;
  status: 'Active' | 'Inactive';
  permissions: UserPermissions;
  avatarUrl?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: UserAccount | null;
  isAuthenticated: boolean;
  loginTime?: string;
}

export interface PettyCashAccount {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  openingBalance: number;
  currentBalance: number;
  totalCashIssued: number;
  totalExpenses: number;
  totalReimbursements: number;
  minBalanceAlert: number;
  lastTransactionDate?: string;
  status: PettyCashAccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PettyCashCategory {
  id: string;
  name: string;
  description?: string;
  isCustom?: boolean;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface PettyCashVendor {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  category?: string;
  createdAt: string;
}

export interface ReceiptAttachment {
  id: string;
  fileName: string;
  fileType: string;
  fileSizeKb: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface ApprovalStep {
  role: 'Supervisor' | 'Accounts' | 'Manager';
  approverName: string;
  status: ApprovalStatus;
  timestamp?: string;
  notes?: string;
}

export interface PettyCashTransaction {
  id: string;
  voucherNumber: string; // e.g. PC-ISS-001, PC-EXP-001, PC-REIM-001
  manualVoucherNumber?: string; // Physical Book / Manual Voucher Number (Mandatory)
  transactionType: TransactionType;
  date: string; // YYYY-MM-DD
  time?: string;
  accountId: string;
  employeeId: string;
  employeeName: string;
  department: string;

  // Running Balance Math
  previousBalance: number;
  cashReceived: number; // >0 for ISSUE or REIMBURSEMENT
  cashPaid: number; // >0 for EXPENSE
  runningBalance: number; // calculated & permanently stored

  // Details
  categoryId?: string;
  categoryName?: string;
  description?: string;
  vendorId?: string;
  vendorName?: string;
  reason?: string;
  paymentMethod?: string;
  notes?: string;

  // Receipts
  receipts?: ReceiptAttachment[];

  // Approvals
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvalDate?: string;
  approvalChain?: ApprovalStep[];

  // Audit
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export interface PettyCashReimbursement {
  id: string;
  reimbursementNumber: string;
  date: string;
  accountId: string;
  employeeId: string;
  employeeName: string;
  department: string;
  previousBalance: number;
  totalExpensesSubmitted: number;
  reimbursementAmount: number;
  newBalance: number;
  paymentMethod: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
}

export interface PettyCashAuditLog {
  id: string;
  timestamp: string;
  action: 'CREATED' | 'UPDATED' | 'DELETED' | 'APPROVED' | 'REJECTED' | 'REIMBURSED';
  entityType: 'ACCOUNT' | 'TRANSACTION' | 'CATEGORY' | 'REIMBURSEMENT';
  entityId: string;
  voucherNumber?: string;
  user: string;
  userRole?: UserRole;
  details: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface PettyCashFilterState {
  searchQuery: string;
  employeeId?: string;
  categoryName?: string;
  transactionType?: 'ALL' | TransactionType;
  approvalStatus?: 'ALL' | ApprovalStatus;
  startDate?: string;
  endDate?: string;
  department?: string;
  vendorName?: string;
  voucherNumber?: string;
  minAmount?: number;
  maxAmount?: number;
}

