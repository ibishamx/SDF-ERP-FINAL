import {
  Cheque,
  Party,
  Bank,
  City,
  Employee,
  CompanySettings,
  Item,
  Station,
  TransportCompany,
  DispatchRecord,
  SaleRecord,
  PettyCashAccount,
  PettyCashTransaction,
  UserAccount,
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    username: 'admin',
    fullName: 'Rana Shahid',
    email: 'finance.head@saleemdaal.com',
    role: 'Administrator',
    department: 'Finance & Management',
    pin: '1234',
    status: 'Active',
    permissions: {
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
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'usr-2',
    username: 'tariq.accounts',
    fullName: 'Muhammad Tariq',
    email: 'tariq.accounts@saleemdaal.com',
    role: 'Accounts',
    department: 'Accounts & Audit',
    pin: '2222',
    status: 'Active',
    permissions: {
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
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'usr-3',
    username: 'hamza.manager',
    fullName: 'Hamza Saleem',
    email: 'hamza.operations@saleemdaal.com',
    role: 'Manager',
    department: 'Factory Operations',
    pin: '3333',
    status: 'Active',
    permissions: {
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
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'usr-4',
    username: 'usman.custodian',
    fullName: 'Usman Ghani',
    email: 'usman.field@saleemdaal.com',
    role: 'Employee',
    department: 'Sales & Field',
    pin: '4444',
    status: 'Active',
    permissions: {
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
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'usr-5',
    username: 'viewer',
    fullName: 'Auditor Guest',
    email: 'auditor@external.com',
    role: 'Viewer',
    department: 'External Audit',
    pin: '0000',
    status: 'Active',
    permissions: {
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
    },
    createdAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

export const INITIAL_SETTINGS: CompanySettings = {
  companyName: 'Saleem Daal Factory',
  tagline: 'Pulse Processor & Grain Wholesaler',
  address: 'Ghala Mandi, Faisalabad',
  phone: '03219669161',
  email: 'saleemdaalfactory@gmail.com',
  ntn: '3490123-7',
  strn: '3277870001234',
  currency: 'PKR',
  dateFormat: 'YYYY-MM-DD',
  theme: 'light',
  backupFolder: 'C:\\SaleemDaalBackups',
  exportFolder: 'C:\\SaleemDaalExports',
  autoBackupSchedule: 'daily',
  logoUrl: '',
};

export const INITIAL_CITIES: City[] = [
  { id: 'c1', name: 'Faisalabad', province: 'Punjab' },
  { id: 'c2', name: 'Lahore', province: 'Punjab' },
  { id: 'c3', name: 'Multan', province: 'Punjab' },
  { id: 'c4', name: 'Sargodha', province: 'Punjab' },
  { id: 'c5', name: 'Gujranwala', province: 'Punjab' },
  { id: 'c6', name: 'Karachi', province: 'Sindh' },
  { id: 'c7', name: 'Rawalpindi', province: 'Punjab' },
  { id: 'c8', name: 'Bahawalpur', province: 'Punjab' },
];

export const INITIAL_BANKS: Bank[] = [
  { id: 'b1', name: 'Meezan Bank', branchCode: '0201 - Grain Market Faisalabad' },
  { id: 'b2', name: 'Habib Bank Limited (HBL)', branchCode: '0042 - Faisalabad' },
  { id: 'b3', name: 'MCB Bank Limited', branchCode: '0112 - Clock Tower Faisalabad' },
  { id: 'b4', name: 'United Bank Limited (UBL)', branchCode: '0308 - Faisalabad' },
  { id: 'b5', name: 'Bank Alfalah', branchCode: '0415 - Faisalabad' },
  { id: 'b6', name: 'Allied Bank Limited (ABL)', branchCode: '0089 - Faisalabad' },
  { id: 'b7', name: 'Faysal Bank', branchCode: '0551 - Faisalabad' },
  { id: 'b8', name: 'National Bank of Pakistan (NBP)', branchCode: '0011 - Main Branch Faisalabad' },
];

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_PARTIES: Party[] = [];

export const INITIAL_CHEQUES: Cheque[] = [];

export const INITIAL_ITEMS: Item[] = [
  { id: 'itm-1', itemCode: 'DL-MNG-50', itemName: 'Mong Daal Special Grade A', packing: '50 kg Bag', unit: 'Bags', status: 'Active', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'itm-2', itemCode: 'DL-CHN-50', itemName: 'Chana Daal Supreme', packing: '50 kg Bag', unit: 'Bags', status: 'Active', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'itm-3', itemCode: 'DL-MSR-25', itemName: 'Masoor Whole Premium Wash', packing: '25 kg Bag', unit: 'Bags', status: 'Active', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'itm-4', itemCode: 'DL-MSH-50', itemName: 'Maash Daal Washed White', packing: '50 kg Bag', unit: 'Bags', status: 'Active', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'itm-5', itemCode: 'DL-CHK-50', itemName: 'Moong Chilka Desi', packing: '50 kg Bag', unit: 'Bags', status: 'Active', createdAt: '2026-06-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z' },
];

export const INITIAL_STATIONS: Station[] = [
  { id: 'stn-1', name: 'Akbari Mandi Lahore', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'stn-2', name: 'Ghalla Mandi Multan', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'stn-3', name: 'Circular Road Sargodha', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'stn-4', name: 'Grain Market Faisalabad', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'stn-5', name: 'Wholesale Market Rawalpindi', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'stn-6', name: 'Jodiya Bazaar Karachi', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
];

export const INITIAL_TRANSPORTS: TransportCompany[] = [
  { id: 'trp-1', name: 'Faisalabad Goods Freight & Express', contact: '+92 300 8877112', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'trp-2', name: 'New Khan Cargo & Logistics', contact: '+92 321 4455667', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'trp-3', name: 'Al-Mehran Goods Transport', contact: '+92 312 9900112', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'trp-4', name: 'Khyber Freight Carriers', contact: '+92 333 7788990', status: 'Active', createdAt: '2026-06-01T00:00:00Z' },
];

export const INITIAL_DISPATCHES: DispatchRecord[] = [];

export const INITIAL_SALES: SaleRecord[] = [];

// --- PETTY CASH SEED DATA ---

export const INITIAL_PETTY_CASH_CATEGORIES = [
  { id: 'cat-1', name: 'Fuel', description: 'Diesel & Petrol for factory generators and transport vehicles', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-2', name: 'Transportation', description: 'Local rickshaw, loader van, and freight fares', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-3', name: 'Tea & Refreshments', description: 'Daily worker tea, snacks, and guest hospitality', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-4', name: 'Office Supplies', description: 'Drinking water, tissue, handwash, kitchen items', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-5', name: 'Stationery', description: 'Paper, voucher books, pens, printer ink, registers', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-6', name: 'Maintenance', description: 'Routine plant electrical, plumbing & building upkeep', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-7', name: 'Repairs', description: 'Daal processing machinery spare parts & welding', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-8', name: 'Cleaning', description: 'Sweeping brooms, detergents, disinfectant chemicals', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-9', name: 'Courier', description: 'TCS, M&P, Leopard post for sample and document dispatch', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-10', name: 'Loading & Unloading', description: 'Daily mazdoor wages for pulse bag stacking', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-11', name: 'Packing Material', description: 'Plastic twine, stitching threads, marker pens, stencils', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-12', name: 'Utility Payments', description: 'Small emergency bills, internet topup, gas cylinder', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-13', name: 'Labour', description: 'Daily temporary casual labor payments', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-14', name: 'Vehicle Expenses', description: 'Factory pickup maintenance, puncture, toll tax', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
  { id: 'cat-15', name: 'Miscellaneous', description: 'Other unclassified operational expenses', isCustom: false, status: 'Active' as const, createdAt: '2026-06-01T00:00:00Z' },
];

export const INITIAL_PETTY_CASH_VENDORS = [
  { id: 'v-1', name: 'PSO Fuel Station - Industrial Estate', contactPerson: 'Asif Petroleum', phone: '+92 300 1112233', category: 'Fuel', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'v-2', name: 'Siddique Electric & Machinery Store', contactPerson: 'Mian Siddique', phone: '+92 321 4445566', category: 'Repairs', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'v-3', name: 'TCS Express Center Faisalabad', contactPerson: 'Customer Service', phone: '+92 41 111123456', category: 'Courier', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'v-4', name: 'Al-Madina Hotel & Hoteling', contactPerson: 'Umer Farooq', phone: '+92 302 7778899', category: 'Tea & Refreshments', createdAt: '2026-06-01T00:00:00Z' },
  { id: 'v-5', name: 'Faisalabad Hardware & Stitching Thread Store', contactPerson: 'Zafar Iqbal', phone: '+92 333 8889900', category: 'Packing Material', createdAt: '2026-06-01T00:00:00Z' },
];

export const INITIAL_PETTY_CASH_ACCOUNTS: PettyCashAccount[] = [];

export const INITIAL_PETTY_CASH_TRANSACTIONS: PettyCashTransaction[] = [];

export const INITIAL_PETTY_CASH_AUDIT_LOGS = [];

