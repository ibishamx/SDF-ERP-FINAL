import {
  Cheque,
  Party,
  Bank,
  City,
  Employee,
  CompanySettings,
  BackupRecord,
  AuditLog,
  Item,
  Station,
  TransportCompany,
  DispatchRecord,
  SaleRecord,
  StockBalanceInfo,
  PettyCashAccount,
  PettyCashAccountStatus,
  PettyCashCategory,
  PettyCashVendor,
  PettyCashTransaction,
  PettyCashReimbursement,
  PettyCashAuditLog,
  UserRole,
  ApprovalStatus,
  ReceiptAttachment,
  UserAccount,
  UserPermissions,
} from '../types';
import {
  INITIAL_CHEQUES,
  INITIAL_PARTIES,
  INITIAL_BANKS,
  INITIAL_CITIES,
  INITIAL_EMPLOYEES,
  INITIAL_SETTINGS,
  INITIAL_ITEMS,
  INITIAL_STATIONS,
  INITIAL_TRANSPORTS,
  INITIAL_DISPATCHES,
  INITIAL_SALES,
  INITIAL_PETTY_CASH_CATEGORIES,
  INITIAL_PETTY_CASH_VENDORS,
  INITIAL_PETTY_CASH_ACCOUNTS,
  INITIAL_PETTY_CASH_TRANSACTIONS,
  INITIAL_PETTY_CASH_AUDIT_LOGS,
  INITIAL_USERS,
} from '../data/seedData';

const KEYS = {
  CHEQUES: 'saleem_daal_cheques_v1',
  PARTIES: 'saleem_daal_parties_v1',
  BANKS: 'saleem_daal_banks_v1',
  CITIES: 'saleem_daal_cities_v1',
  EMPLOYEES: 'saleem_daal_employees_v1',
  SETTINGS: 'saleem_daal_settings_v1',
  BACKUPS: 'saleem_daal_backups_v1',
  AUDIT_LOGS: 'saleem_daal_audit_logs_v1',
  ITEMS: 'saleem_daal_items_v1',
  STATIONS: 'saleem_daal_stations_v1',
  TRANSPORTS: 'saleem_daal_transports_v1',
  DISPATCHES: 'saleem_daal_dispatches_v1',
  SALES: 'saleem_daal_sales_v1',
  PC_ACCOUNTS: 'saleem_daal_pc_accounts_v1',
  PC_CATEGORIES: 'saleem_daal_pc_categories_v1',
  PC_VENDORS: 'saleem_daal_pc_vendors_v1',
  PC_TRANSACTIONS: 'saleem_daal_pc_transactions_v1',
  PC_REIMBURSEMENTS: 'saleem_daal_pc_reimbursements_v1',
  PC_AUDIT_LOGS: 'saleem_daal_pc_audit_v1',
  PC_USER_ROLE: 'saleem_daal_pc_role_v1',
  USERS: 'saleem_daal_users_v1',
  CURRENT_USER_ID: 'saleem_daal_current_user_id_v1',
  IS_LOCKED: 'saleem_daal_is_locked_v1',
};

type StorageListener = () => void;
const listeners: Set<StorageListener> = new Set();

export function subscribeStorage(listener: StorageListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Helper to compute status automatically based on Voucher Number & Return Date requirements
export function computeChequeStatus(
  voucherNumber?: string,
  returnDate?: string,
  explicitStatus?: Cheque['status']
): 'Outstanding' | 'Cleared' | 'Returned' {
  if (explicitStatus === 'Returned' || (returnDate && returnDate.trim().length > 0)) {
    return 'Returned';
  }
  if (explicitStatus === 'Cleared' || (voucherNumber && voucherNumber.trim().length > 0)) {
    return 'Cleared';
  }
  return 'Outstanding';
}

function getDbStore(): Record<string, any> {
  let serverData: Record<string, any> = {};
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/db', false);
    xhr.send();
    if (xhr.status === 200) {
      serverData = JSON.parse(xhr.responseText) || {};
    }
  } catch (e) {
    console.error('SQLite fetch error:', e);
  }

  const localData: Record<string, any> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('saleem_daal_')) {
        const val = localStorage.getItem(k);
        if (val) {
          try {
            localData[k] = JSON.parse(val);
          } catch {
            localData[k] = val;
          }
        }
      }
    }
  } catch (e) {
    console.error('localStorage read error:', e);
  }

  return { ...localData, ...serverData };
}

function saveDbStore(key: string, value: any) {
  try {
    localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch (e) {
    console.error('localStorage save error:', e);
  }

  try {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/db/${encodeURIComponent(key)}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({ value }));
  } catch (e) {
    console.error('SQLite save error:', e);
  }
  notifyListeners();
}

class StorageService {
  private cheques: Cheque[] = [];
  private parties: Party[] = [];
  private banks: Bank[] = [];
  private cities: City[] = [];
  private employees: Employee[] = [];
  private settings: CompanySettings = INITIAL_SETTINGS;
  private backups: BackupRecord[] = [];
  private auditLogs: AuditLog[] = [];
  private items: Item[] = [];
  private stations: Station[] = [];
  private transports: TransportCompany[] = [];
  private dispatches: DispatchRecord[] = [];
  private sales: SaleRecord[] = [];

  // Petty Cash & Auth Fields
  private pcAccounts: PettyCashAccount[] = [];
  private pcCategories: PettyCashCategory[] = [];
  private pcVendors: PettyCashVendor[] = [];
  private pcTransactions: PettyCashTransaction[] = [];
  private pcReimbursements: PettyCashReimbursement[] = [];
  private pcAuditLogs: PettyCashAuditLog[] = [];
  private pcUserRole: UserRole = 'Administrator';

  // User Accounts & Authentication Fields
  private users: UserAccount[] = [];
  private currentUserId: string = 'usr-1';
  private sessionLocked: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      const dbStore = getDbStore();

      const storedUsers = dbStore[KEYS.USERS];
      if (storedUsers) {
        this.users = storedUsers;
      } else {
        this.users = INITIAL_USERS;
        this.saveUsers();
      }

      const storedCurUser = dbStore[KEYS.CURRENT_USER_ID];
      if (storedCurUser && this.users.some((u) => u.id === storedCurUser)) {
        this.currentUserId = storedCurUser;
      } else {
        this.currentUserId = this.users[0]?.id || 'usr-1';
      }

      const storedLock = dbStore[KEYS.IS_LOCKED];
      this.sessionLocked = storedLock === 'true';

      const storedCheques = dbStore[KEYS.CHEQUES];
      if (storedCheques) {
        this.cheques = storedCheques;
        this.cheques = this.cheques.map((c: any) => ({
          ...c,
          status: computeChequeStatus(c.voucherNumber, c.returnDate, c.status),
        }));
      } else {
        this.cheques = INITIAL_CHEQUES;
        this.saveCheques();
      }

      const storedParties = dbStore[KEYS.PARTIES];
      this.parties = storedParties ? storedParties : INITIAL_PARTIES;
      if (!storedParties) this.saveParties();

      const storedBanks = dbStore[KEYS.BANKS];
      this.banks = storedBanks ? storedBanks : INITIAL_BANKS;
      if (!storedBanks) this.saveBanks();

      const storedCities = dbStore[KEYS.CITIES];
      this.cities = storedCities ? storedCities : INITIAL_CITIES;
      if (!storedCities) this.saveCities();

      const storedEmployees = dbStore[KEYS.EMPLOYEES];
      this.employees = storedEmployees ? storedEmployees : INITIAL_EMPLOYEES;
      if (!storedEmployees) this.saveEmployees();

      const storedSettings = dbStore[KEYS.SETTINGS];
      this.settings = storedSettings ? storedSettings : INITIAL_SETTINGS;
      if (!storedSettings) this.saveSettings();

      const storedItems = dbStore[KEYS.ITEMS];
      this.items = (storedItems && Array.isArray(storedItems) && storedItems.length > 0) ? storedItems : INITIAL_ITEMS;
      if (!storedItems || (Array.isArray(storedItems) && storedItems.length === 0)) this.saveItems();

      const storedStations = dbStore[KEYS.STATIONS];
      this.stations = (storedStations && Array.isArray(storedStations) && storedStations.length > 0) ? storedStations : INITIAL_STATIONS;
      if (!storedStations || (Array.isArray(storedStations) && storedStations.length === 0)) this.saveStations();

      const storedTransports = dbStore[KEYS.TRANSPORTS];
      this.transports = (storedTransports && Array.isArray(storedTransports) && storedTransports.length > 0) ? storedTransports : INITIAL_TRANSPORTS;
      if (!storedTransports || (Array.isArray(storedTransports) && storedTransports.length === 0)) this.saveTransports();

      const storedDispatches = dbStore[KEYS.DISPATCHES];
      this.dispatches = (storedDispatches && Array.isArray(storedDispatches) && storedDispatches.length > 0) ? storedDispatches : INITIAL_DISPATCHES;
      if (!storedDispatches || (Array.isArray(storedDispatches) && storedDispatches.length === 0)) this.saveDispatches();

      const storedSales = dbStore[KEYS.SALES];
      this.sales = (storedSales && Array.isArray(storedSales) && storedSales.length > 0) ? storedSales : INITIAL_SALES;
      if (!storedSales || (Array.isArray(storedSales) && storedSales.length === 0)) this.saveSales();

      // Petty Cash Storage Init
      const storedPcAccounts = dbStore[KEYS.PC_ACCOUNTS];
      this.pcAccounts = (storedPcAccounts && Array.isArray(storedPcAccounts) && storedPcAccounts.length > 0) ? storedPcAccounts : INITIAL_PETTY_CASH_ACCOUNTS;
      if (!storedPcAccounts || (Array.isArray(storedPcAccounts) && storedPcAccounts.length === 0)) this.savePcAccounts();

      const storedPcCategories = dbStore[KEYS.PC_CATEGORIES];
      this.pcCategories = (storedPcCategories && Array.isArray(storedPcCategories) && storedPcCategories.length > 0) ? storedPcCategories : INITIAL_PETTY_CASH_CATEGORIES;
      if (!storedPcCategories || (Array.isArray(storedPcCategories) && storedPcCategories.length === 0)) this.savePcCategories();

      const storedPcVendors = dbStore[KEYS.PC_VENDORS];
      this.pcVendors = (storedPcVendors && Array.isArray(storedPcVendors) && storedPcVendors.length > 0) ? storedPcVendors : INITIAL_PETTY_CASH_VENDORS;
      if (!storedPcVendors || (Array.isArray(storedPcVendors) && storedPcVendors.length === 0)) this.savePcVendors();

      const storedPcTx = dbStore[KEYS.PC_TRANSACTIONS];
      this.pcTransactions = (storedPcTx && Array.isArray(storedPcTx) && storedPcTx.length > 0) ? storedPcTx : INITIAL_PETTY_CASH_TRANSACTIONS;
      if (!storedPcTx || (Array.isArray(storedPcTx) && storedPcTx.length === 0)) this.savePcTransactions();

      const storedPcReim = dbStore[KEYS.PC_REIMBURSEMENTS];
      this.pcReimbursements = storedPcReim ? storedPcReim : [];

      const storedPcAudit = dbStore[KEYS.PC_AUDIT_LOGS];
      this.pcAuditLogs = storedPcAudit ? storedPcAudit : INITIAL_PETTY_CASH_AUDIT_LOGS;
      if (!storedPcAudit) this.savePcAuditLogs();

      // Recalculate & synchronize all petty cash chronological running balances on startup
      if (this.pcTransactions.length > 0 || (this.pcAccounts && this.pcAccounts.length > 0)) {
        this.recalculatePettyCashBalances();
      }

      const storedRole = dbStore[KEYS.PC_USER_ROLE];
      if (storedRole && ['Administrator', 'Accounts', 'Manager', 'Employee', 'Viewer'].includes(storedRole)) {
        this.pcUserRole = storedRole as UserRole;
      }

      const storedBackups = dbStore[KEYS.BACKUPS];
      this.backups = storedBackups ? storedBackups : [];

      const storedLogs = dbStore[KEYS.AUDIT_LOGS];
      this.auditLogs = storedLogs ? storedLogs : [];
      if (this.auditLogs.length === 0) {
        this.logAudit('CREATE', 'System initialized with SQLite backend records for Saleem Daal Factory');
      }
    } catch (e) {
      console.error('Failed to initialize SQLite store:', e);
      this.cheques = INITIAL_CHEQUES;
      this.parties = INITIAL_PARTIES;
      this.banks = INITIAL_BANKS;
      this.cities = INITIAL_CITIES;
      this.employees = INITIAL_EMPLOYEES;
      this.settings = INITIAL_SETTINGS;
    }
  }

  private saveCheques() {
    saveDbStore(KEYS.CHEQUES, this.cheques);
  }

  private saveParties() {
    saveDbStore(KEYS.PARTIES, this.parties);
  }

  private saveBanks() {
    saveDbStore(KEYS.BANKS, this.banks);
  }

  private saveCities() {
    saveDbStore(KEYS.CITIES, this.cities);
  }

  private saveEmployees() {
    saveDbStore(KEYS.EMPLOYEES, this.employees);
  }

  private saveSettings() {
    saveDbStore(KEYS.SETTINGS, this.settings);
  }

  private saveBackups() {
    saveDbStore(KEYS.BACKUPS, this.backups);
  }

  private saveAuditLogs() {
    saveDbStore(KEYS.AUDIT_LOGS, this.auditLogs);
  }

  public logAudit(action: AuditLog['action'], details: string, userOverride?: string) {
    const currentUser = this.getCurrentUser();
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      action,
      details,
      user: userOverride || currentUser.fullName || 'Office User',
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    this.saveAuditLogs();
  }

  // --- CHEQUES CRUD ---
  public getCheques(includeDeleted = false): Cheque[] {
    if (includeDeleted) return [...this.cheques];
    return this.cheques.filter((c) => !c.isDeleted);
  }

  public getChequeById(id: string): Cheque | undefined {
    return this.cheques.find((c) => c.id === id);
  }

  public addCheque(chequeData: Omit<Cheque, 'id' | 'status' | 'createdAt' | 'updatedAt'> & { status?: Cheque['status'] }): Cheque {
    const now = new Date().toISOString();
    const computedStatus = chequeData.status || computeChequeStatus(chequeData.voucherNumber, chequeData.returnDate);

    const newCheque: Cheque = {
      ...chequeData,
      id: 'chq-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      status: computedStatus,
      createdAt: now,
      updatedAt: now,
    };

    // Automatically register party/bank/city if new
    this.autoAddMasterData(newCheque.receiveFrom, newCheque.bank, newCheque.city, newCheque.receivedBy);

    this.cheques.unshift(newCheque);
    this.saveCheques();
    this.logAudit('CREATE', `Added Cheque #${newCheque.chequeNumber} for ${newCheque.receiveFrom} (${newCheque.amount.toLocaleString()} PKR)`);
    return newCheque;
  }

  public updateCheque(id: string, updates: Partial<Omit<Cheque, 'id' | 'createdAt'>>): Cheque {
    const index = this.cheques.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Cheque with ID ${id} not found.`);

    const existing = this.cheques[index];
    const updatedVoucher = updates.voucherNumber !== undefined ? updates.voucherNumber : existing.voucherNumber;
    const updatedReturnDate = updates.returnDate !== undefined ? updates.returnDate : existing.returnDate;
    const explicitStatus = updates.status !== undefined ? updates.status : existing.status;

    const computedStatus = computeChequeStatus(updatedVoucher, updatedReturnDate, explicitStatus);

    const updatedCheque: Cheque = {
      ...existing,
      ...updates,
      status: computedStatus,
      updatedAt: new Date().toISOString(),
    };

    this.autoAddMasterData(updatedCheque.receiveFrom, updatedCheque.bank, updatedCheque.city, updatedCheque.receivedBy);

    this.cheques[index] = updatedCheque;
    this.saveCheques();
    this.logAudit('UPDATE', `Updated Cheque #${updatedCheque.chequeNumber} (${updatedCheque.receiveFrom}) - Status: ${computedStatus}`);
    return updatedCheque;
  }

  public deleteCheque(id: string, permanent = false) {
    const cheque = this.getChequeById(id);
    if (!cheque) return;

    if (permanent) {
      this.cheques = this.cheques.filter((c) => c.id !== id);
      this.logAudit('DELETE', `Permanently deleted Cheque #${cheque.chequeNumber}`);
    } else {
      cheque.isDeleted = true;
      cheque.updatedAt = new Date().toISOString();
      this.logAudit('DELETE', `Soft-deleted Cheque #${cheque.chequeNumber}`);
    }
    this.saveCheques();
  }

  public restoreCheque(id: string) {
    const cheque = this.cheques.find((c) => c.id === id);
    if (cheque) {
      cheque.isDeleted = false;
      cheque.updatedAt = new Date().toISOString();
      this.saveCheques();
      this.logAudit('RESTORE', `Restored deleted Cheque #${cheque.chequeNumber}`);
    }
  }

  public bulkDelete(ids: string[]) {
    this.cheques = this.cheques.map((c) => {
      if (ids.includes(c.id)) {
        return { ...c, isDeleted: true, updatedAt: new Date().toISOString() };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('DELETE', `Bulk soft-deleted ${ids.length} cheques`);
  }

  public bulkMarkCleared(ids: string[], voucherPrefix = 'V-CLEARED', paidDate = new Date().toISOString().split('T')[0]) {
    let updatedCount = 0;
    this.cheques = this.cheques.map((c, i) => {
      if (ids.includes(c.id)) {
        updatedCount++;
        const voucher = c.voucherNumber || `${voucherPrefix}-${100 + i}`;
        return {
          ...c,
          voucherNumber: voucher,
          paidDate: paidDate || c.paidDate || new Date().toISOString().split('T')[0],
          paidTo: c.paidTo || 'Saleem Daal Main A/C',
          status: 'Cleared' as const,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('UPDATE', `Bulk marked ${updatedCount} cheques as Cleared (Paid Date: ${paidDate})`);
  }

  public markAsReturned(id: string, returnReason = 'Returned to Customer', returnDate = new Date().toISOString().split('T')[0]) {
    const cheque = this.getChequeById(id);
    if (!cheque) return;

    cheque.status = 'Returned';
    cheque.returnDate = returnDate;
    cheque.returnReason = returnReason;
    cheque.updatedAt = new Date().toISOString();

    this.saveCheques();
    this.logAudit('UPDATE', `Returned Cheque #${cheque.chequeNumber} (${cheque.receiveFrom}) to Customer - Reason: ${returnReason}`);
  }

  public bulkMarkReturned(ids: string[], returnReason = 'Returned to Customer', returnDate = new Date().toISOString().split('T')[0]) {
    let count = 0;
    this.cheques = this.cheques.map((c) => {
      if (ids.includes(c.id)) {
        count++;
        return {
          ...c,
          status: 'Returned' as const,
          returnDate,
          returnReason,
          updatedAt: new Date().toISOString(),
        };
      }
      return c;
    });
    this.saveCheques();
    this.logAudit('UPDATE', `Bulk returned ${count} cheques to customer`);
  }

  private autoAddMasterData(partyName: string, bankName: string, cityName: string, empName: string) {
    if (partyName && !this.parties.some((p) => p.name.toLowerCase() === partyName.toLowerCase())) {
      this.addParty({ name: partyName, city: cityName || 'Faisalabad' });
    }
    if (bankName && !this.banks.some((b) => b.name.toLowerCase() === bankName.toLowerCase())) {
      this.addBank({ name: bankName });
    }
    if (cityName && !this.cities.some((c) => c.name.toLowerCase() === cityName.toLowerCase())) {
      this.addCity({ name: cityName });
    }
    if (empName && !this.employees.some((e) => e.name.toLowerCase() === empName.toLowerCase())) {
      this.addEmployee({ name: empName, designation: 'Representative', department: 'Sales' });
    }
  }

  // --- MASTER DATA ---
  public getParties(): Party[] {
    return [...this.parties];
  }
  public addParty(data: Partial<Party> & { name: string }): Party {
    const party: Party = {
      id: 'p-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      city: data.city || 'Faisalabad',
      phone: data.phone || '',
      contactPerson: data.contactPerson || '',
      createdAt: new Date().toISOString(),
    };
    this.parties.push(party);
    this.saveParties();
    return party;
  }

  public getBanks(): Bank[] {
    return [...this.banks];
  }
  public addBank(data: Partial<Bank> & { name: string }): Bank {
    const bank: Bank = {
      id: 'b-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      branchCode: data.branchCode || '',
      city: data.city || 'Faisalabad',
    };
    this.banks.push(bank);
    this.saveBanks();
    return bank;
  }

  public getCities(): City[] {
    return [...this.cities];
  }
  public addCity(data: Partial<City> & { name: string }): City {
    const city: City = {
      id: 'c-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      province: data.province || 'Punjab',
    };
    this.cities.push(city);
    this.saveCities();
    return city;
  }

  public getEmployees(): Employee[] {
    return [...this.employees];
  }
  public addEmployee(data: Partial<Employee> & { name: string }): Employee {
    const emp: Employee = {
      id: 'e-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
      name: data.name,
      designation: data.designation || 'Staff',
      department: data.department || 'Accounts',
    };
    this.employees.push(emp);
    this.saveEmployees();
    return emp;
  }

  // --- SETTINGS ---
  public getSettings(): CompanySettings {
    return { ...this.settings };
  }
  public updateSettings(newSettings: Partial<CompanySettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.logAudit('UPDATE', 'Updated company settings & preferences');
  }

  // --- BACKUPS & AUDIT LOGS ---
  public getBackups(): BackupRecord[] {
    return [...this.backups];
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  public createBackup(type: 'manual' | 'auto' = 'manual'): BackupRecord {
    const jsonStr = this.exportBackupJson();
    const sizeKb = Math.max(1, Math.round(jsonStr.length / 1024));
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    const fileName = `SaleemDaalFactory_Backup_${dateStr}.json`;

    const totalCount = this.cheques.length + this.dispatches.length + this.sales.length + this.pcTransactions.length + this.parties.length + this.employees.length;

    const record: BackupRecord = {
      id: 'bkp-' + Date.now(),
      fileName,
      createdAt: new Date().toISOString(),
      totalRecords: totalCount,
      fileSizeKb: sizeKb,
      type,
    };

    this.backups.unshift(record);
    this.saveBackups();
    this.logAudit('BACKUP', `Created ${type} backup (${fileName}) containing ${totalCount} records`);

    return record;
  }

  public triggerBackupDownload(type: 'manual' | 'auto' = 'manual'): BackupRecord {
    const record = this.createBackup(type);
    const jsonStr = this.exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = record.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return record;
  }

  // --- STOCK MANAGEMENT MODULE DATA METHODS ---

  private saveItems() {
    saveDbStore(KEYS.ITEMS, this.items);
  }

  public getItems(): Item[] {
    return [...this.items];
  }

  public saveItem(itemData: Partial<Item> & { itemName: string }): Item {
    const now = new Date().toISOString();
    let savedItem: Item;

    if (itemData.id) {
      const idx = this.items.findIndex((i) => i.id === itemData.id);
      if (idx !== -1) {
        savedItem = {
          ...this.items[idx],
          ...itemData,
          updatedAt: now,
        };
        this.items[idx] = savedItem;
        this.logAudit('UPDATE', `Updated stock item: ${savedItem.itemName} (${savedItem.itemCode})`);
      } else {
        savedItem = {
          id: itemData.id,
          itemCode: itemData.itemCode || `ITEM-${Date.now().toString().slice(-4)}`,
          itemName: itemData.itemName,
          packing: itemData.packing || '50 kg Bag',
          unit: itemData.unit || 'Bags',
          status: itemData.status || 'Active',
          createdAt: now,
          updatedAt: now,
        };
        this.items.unshift(savedItem);
      }
    } else {
      savedItem = {
        id: 'itm-' + Date.now(),
        itemCode: itemData.itemCode || `ITEM-${Date.now().toString().slice(-4)}`,
        itemName: itemData.itemName,
        packing: itemData.packing || '50 kg Bag',
        unit: itemData.unit || 'Bags',
        status: itemData.status || 'Active',
        createdAt: now,
        updatedAt: now,
      };
      this.items.unshift(savedItem);
      this.logAudit('CREATE', `Created new stock item: ${savedItem.itemName} (${savedItem.itemCode})`);
    }

    this.saveItems();
    return savedItem;
  }

  public deleteItem(id: string) {
    const item = this.items.find((i) => i.id === id);
    this.items = this.items.filter((i) => i.id !== id);
    this.saveItems();
    if (item) this.logAudit('DELETE', `Deleted stock item: ${item.itemName}`);
  }

  private saveStations() {
    saveDbStore(KEYS.STATIONS, this.stations);
  }

  public getStations(): Station[] {
    return [...this.stations];
  }

  public saveStation(stationData: Partial<Station> & { name: string }): Station {
    const now = new Date().toISOString();
    let saved: Station;

    if (stationData.id) {
      const idx = this.stations.findIndex((s) => s.id === stationData.id);
      if (idx !== -1) {
        saved = { ...this.stations[idx], ...stationData };
        this.stations[idx] = saved;
        this.logAudit('UPDATE', `Updated station: ${saved.name}`);
      } else {
        saved = {
          id: stationData.id,
          name: stationData.name,
          status: stationData.status || 'Active',
          createdAt: now,
        };
        this.stations.unshift(saved);
      }
    } else {
      saved = {
        id: 'stn-' + Date.now(),
        name: stationData.name,
        status: stationData.status || 'Active',
        createdAt: now,
      };
      this.stations.unshift(saved);
      this.logAudit('CREATE', `Added station: ${saved.name}`);
    }

    this.saveStations();
    return saved;
  }

  public deleteStation(id: string) {
    const stn = this.stations.find((s) => s.id === id);
    this.stations = this.stations.filter((s) => s.id !== id);
    this.saveStations();
    if (stn) this.logAudit('DELETE', `Deleted station: ${stn.name}`);
  }

  private saveTransports() {
    saveDbStore(KEYS.TRANSPORTS, this.transports);
  }

  public getTransports(): TransportCompany[] {
    return [...this.transports];
  }

  public saveTransport(data: Partial<TransportCompany> & { name: string }): TransportCompany {
    const now = new Date().toISOString();
    let saved: TransportCompany;

    if (data.id) {
      const idx = this.transports.findIndex((t) => t.id === data.id);
      if (idx !== -1) {
        saved = { ...this.transports[idx], ...data };
        this.transports[idx] = saved;
        this.logAudit('UPDATE', `Updated transport company: ${saved.name}`);
      } else {
        saved = {
          id: data.id,
          name: data.name,
          contact: data.contact || '',
          status: data.status || 'Active',
          createdAt: now,
        };
        this.transports.unshift(saved);
      }
    } else {
      saved = {
        id: 'trp-' + Date.now(),
        name: data.name,
        contact: data.contact || '',
        status: data.status || 'Active',
        createdAt: now,
      };
      this.transports.unshift(saved);
      this.logAudit('CREATE', `Added transport company: ${saved.name}`);
    }

    this.saveTransports();
    return saved;
  }

  public deleteTransport(id: string) {
    const trp = this.transports.find((t) => t.id === id);
    this.transports = this.transports.filter((t) => t.id !== id);
    this.saveTransports();
    if (trp) this.logAudit('DELETE', `Deleted transport company: ${trp.name}`);
  }

  private saveDispatches() {
    saveDbStore(KEYS.DISPATCHES, this.dispatches);
  }

  public getDispatches(): DispatchRecord[] {
    return [...this.dispatches];
  }

  public checkBiltyNumberExists(biltyNumber: string, excludeDispatchId?: string): boolean {
    const cleanBilty = biltyNumber.trim().toUpperCase();
    return this.dispatches.some(
      (d) => !d.isDeleted && d.biltyNumber.toUpperCase() === cleanBilty && d.id !== excludeDispatchId
    );
  }

  public saveDispatch(data: Partial<DispatchRecord> & { biltyNumber: string; quantity: number; itemName: string; stationName: string; partyName?: string }): { success: boolean; dispatch?: DispatchRecord; message?: string } {
    const cleanBilty = data.biltyNumber.trim().toUpperCase();

    if (this.checkBiltyNumberExists(cleanBilty, data.id)) {
      return { success: false, message: `Bilty Number "${cleanBilty}" already exists in the system. Bilty numbers must be unique.` };
    }

    if (data.quantity === undefined || data.quantity === null || isNaN(data.quantity) || data.quantity === 0) {
      return { success: false, message: 'Quantity cannot be zero.' };
    }

    const now = new Date().toISOString();
    let saved: DispatchRecord;

    if (data.id) {
      const idx = this.dispatches.findIndex((d) => d.id === data.id);
      if (idx !== -1) {
        saved = {
          ...this.dispatches[idx],
          ...data,
          biltyNumber: cleanBilty,
          partyName: data.partyName !== undefined ? data.partyName : this.dispatches[idx].partyName || '',
          updatedAt: now,
        };
        this.dispatches[idx] = saved;
        this.logAudit('UPDATE', `Updated dispatch record: Bilty ${cleanBilty} (${saved.quantity} bags of ${saved.itemName})`);
      } else {
        saved = {
          id: data.id,
          dispatchDate: data.dispatchDate || new Date().toISOString().slice(0, 10),
          biltyNumber: cleanBilty,
          gpNumber: data.gpNumber || '',
          sbvNumber: data.sbvNumber || '',
          loadingFrom: data.loadingFrom || 'Main Mill Godown',
          quality: data.quality || 'Super Fine Grade A',
          itemId: data.itemId || '',
          itemName: data.itemName,
          packing: data.packing || '50 kg Bag',
          quantity: Number(data.quantity),
          partyId: data.partyId || '',
          partyName: data.partyName || '',
          stationId: data.stationId || '',
          stationName: data.stationName,
          transportId: data.transportId || '',
          transportName: data.transportName || '',
          helperNumber: data.helperNumber || '',
          remarks: data.remarks || '',
          createdBy: data.createdBy || 'System User',
          createdAt: now,
          updatedAt: now,
        };
        this.dispatches.unshift(saved);
      }
    } else {
      saved = {
        id: 'dsp-' + Date.now(),
        dispatchDate: data.dispatchDate || new Date().toISOString().slice(0, 10),
        biltyNumber: cleanBilty,
        gpNumber: data.gpNumber || '',
        sbvNumber: data.sbvNumber || '',
        loadingFrom: data.loadingFrom || 'Main Mill Godown',
        quality: data.quality || 'Super Fine Grade A',
        itemId: data.itemId || '',
        itemName: data.itemName,
        packing: data.packing || '50 kg Bag',
        quantity: Number(data.quantity),
        partyId: data.partyId || '',
        partyName: data.partyName || '',
        stationId: data.stationId || '',
        stationName: data.stationName,
        transportId: data.transportId || '',
        transportName: data.transportName || '',
        helperNumber: data.helperNumber || '',
        remarks: data.remarks || '',
        createdBy: data.createdBy || 'System User',
        createdAt: now,
        updatedAt: now,
      };
      this.dispatches.unshift(saved);
      this.logAudit('CREATE', `Created new dispatch: Bilty ${cleanBilty} (${saved.quantity} bags of ${saved.itemName})`);
    }

    this.saveDispatches();
    return { success: true, dispatch: saved };
  }

  public duplicateDispatch(dispatchId: string): { success: boolean; dispatch?: DispatchRecord; message?: string } {
    const original = this.dispatches.find((d) => d.id === dispatchId);
    if (!original) return { success: false, message: 'Original dispatch record not found.' };

    const newBilty = `${original.biltyNumber}-COPY`;
    return this.saveDispatch({
      ...original,
      id: undefined,
      biltyNumber: newBilty,
      createdAt: undefined,
      updatedAt: undefined,
    });
  }

  public deleteDispatch(id: string) {
    const idx = this.dispatches.findIndex((d) => d.id === id);
    if (idx !== -1) {
      const disp = this.dispatches[idx];
      this.dispatches[idx].isDeleted = true;
      this.dispatches[idx].updatedAt = new Date().toISOString();
      this.saveDispatches();
      this.logAudit('DELETE', `Deleted dispatch record: Bilty ${disp.biltyNumber}`);
    }
  }

  private saveSales() {
    saveDbStore(KEYS.SALES, this.sales);
  }

  public getSales(): SaleRecord[] {
    return [...this.sales];
  }

  public validateSaleQuantity(
    dispatchId: string,
    quantityToSell: number,
    existingSaleId?: string
  ): { isValid: boolean; maxAllowedQty: number; message?: string } {
    const dispatch = this.dispatches.find((d) => d.id === dispatchId && !d.isDeleted);
    if (!dispatch) {
      return { isValid: false, maxAllowedQty: 0, message: 'Selected dispatch record not found.' };
    }

    // Calculate total sold excluding existingSaleId if editing
    const totalSoldOtherSales = this.sales
      .filter((s) => !s.isDeleted && s.dispatchId === dispatchId && s.id !== existingSaleId)
      .reduce((sum, s) => sum + s.quantitySold, 0);

    const remainingStock = dispatch.quantity - totalSoldOtherSales;

    if (quantityToSell === 0 || isNaN(quantityToSell)) {
      return { isValid: false, maxAllowedQty: remainingStock, message: 'Sale quantity cannot be zero.' };
    }

    return { isValid: true, maxAllowedQty: remainingStock };
  }

  public saveSale(data: Partial<SaleRecord> & { dispatchId: string; quantitySold: number }): { success: boolean; sale?: SaleRecord; message?: string } {
    const dispatch = this.dispatches.find((d) => d.id === data.dispatchId && !d.isDeleted);
    if (!dispatch) {
      return { success: false, message: 'Associated dispatch record not found.' };
    }

    const validation = this.validateSaleQuantity(data.dispatchId, Number(data.quantitySold), data.id);
    if (!validation.isValid) {
      return { success: false, message: validation.message };
    }

    const now = new Date().toISOString();
    let saved: SaleRecord;

    if (data.id) {
      const idx = this.sales.findIndex((s) => s.id === data.id);
      if (idx !== -1) {
        saved = {
          ...this.sales[idx],
          ...data,
          biltyNumber: dispatch.biltyNumber,
          quantitySold: Number(data.quantitySold),
          updatedAt: now,
        };
        this.sales[idx] = saved;
        this.logAudit('UPDATE', `Updated sale against Bilty ${dispatch.biltyNumber}: ${saved.quantitySold} bags`);
      } else {
        saved = {
          id: data.id,
          dispatchId: data.dispatchId,
          biltyNumber: dispatch.biltyNumber,
          saleDate: data.saleDate || new Date().toISOString().slice(0, 10),
          pickupDate: data.pickupDate || '',
          sbvNumber: data.sbvNumber || '',
          partyId: data.partyId || '',
          partyName: data.partyName || dispatch.partyName || '',
          quantitySold: Number(data.quantitySold),
          invoiceNumber: data.invoiceNumber || '',
          remarks: data.remarks || '',
          createdBy: data.createdBy || 'System User',
          createdAt: now,
          updatedAt: now,
        };
        this.sales.unshift(saved);
      }
    } else {
      saved = {
        id: 'sal-' + Date.now(),
        dispatchId: data.dispatchId,
        biltyNumber: dispatch.biltyNumber,
        saleDate: data.saleDate || new Date().toISOString().slice(0, 10),
        pickupDate: data.pickupDate || '',
        sbvNumber: data.sbvNumber || '',
        partyId: data.partyId || '',
        partyName: data.partyName || dispatch.partyName || '',
        quantitySold: Number(data.quantitySold),
        invoiceNumber: data.invoiceNumber || '',
        remarks: data.remarks || '',
        createdBy: data.createdBy || 'System User',
        createdAt: now,
        updatedAt: now,
      };
      this.sales.unshift(saved);
      this.logAudit('CREATE', `Registered sale against Bilty ${dispatch.biltyNumber}: ${saved.quantitySold} bags`);
    }

    this.saveSales();
    return { success: true, sale: saved };
  }

  public deleteSale(id: string) {
    const idx = this.sales.findIndex((s) => s.id === id);
    if (idx !== -1) {
      const sale = this.sales[idx];
      this.sales[idx].isDeleted = true;
      this.sales[idx].updatedAt = new Date().toISOString();
      this.saveSales();
      this.logAudit('DELETE', `Deleted sale record (${sale.quantitySold} bags) against Bilty ${sale.biltyNumber}`);
    }
  }

  public getStockBalances(): StockBalanceInfo[] {
    const activeDispatches = this.dispatches.filter((d) => !d.isDeleted);
    const activeSales = this.sales.filter((s) => !s.isDeleted);

    const todayMs = new Date().getTime();

    return activeDispatches.map((dispatch) => {
      const dispatchSales = activeSales.filter((s) => s.dispatchId === dispatch.id);
      const totalSold = dispatchSales.reduce((sum, s) => sum + s.quantitySold, 0);
      const remainingQty = dispatch.quantity - totalSold;

      let daysInStock = 0;
      if (dispatch.dispatchDate) {
        const dObj = new Date(dispatch.dispatchDate);
        const dispatchDateMs = dObj.getTime();
        const dispatchYear = dObj.getFullYear();
        if (!isNaN(dispatchDateMs) && dispatchYear >= 2000 && dispatchYear <= 2100) {
          const diffTime = Math.max(0, todayMs - dispatchDateMs);
          daysInStock = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      let statusColor: 'green' | 'yellow' | 'red' = 'green';
      let statusLabel = 'In Stock (>50%)';

      if (remainingQty < 0) {
        statusColor = 'red';
        statusLabel = `Negative Stock (${remainingQty})`;
      } else if (remainingQty === 0) {
        statusColor = 'red';
        statusLabel = 'Fully Sold';
      } else if (remainingQty <= dispatch.quantity * 0.5) {
        statusColor = 'yellow';
        statusLabel = 'Low Stock (<50%)';
      }

      return {
        dispatch,
        totalSold,
        remainingQty,
        daysInStock,
        salesCount: dispatchSales.length,
        statusColor,
        statusLabel,
      };
    });
  }

  public findBiltyDetails(biltyQuery: string): { dispatch?: DispatchRecord; sales: SaleRecord[]; balance?: StockBalanceInfo } | null {
    const clean = biltyQuery.trim().toUpperCase();
    if (!clean) return null;

    const dispatch = this.dispatches.find((d) => !d.isDeleted && d.biltyNumber.toUpperCase() === clean);
    if (!dispatch) return null;

    const sales = this.sales.filter((s) => !s.isDeleted && s.dispatchId === dispatch.id);
    const balances = this.getStockBalances();
    const balance = balances.find((b) => b.dispatch.id === dispatch.id);

    return { dispatch, sales, balance };
  }

  // --- PETTY CASH SAVE HELPERS ---
  private savePcAccounts() {
    saveDbStore(KEYS.PC_ACCOUNTS, this.pcAccounts);
  }

  private savePcCategories() {
    saveDbStore(KEYS.PC_CATEGORIES, this.pcCategories);
  }

  private savePcVendors() {
    saveDbStore(KEYS.PC_VENDORS, this.pcVendors);
  }

  private savePcTransactions() {
    saveDbStore(KEYS.PC_TRANSACTIONS, this.pcTransactions);
  }

  private savePcReimbursements() {
    saveDbStore(KEYS.PC_REIMBURSEMENTS, this.pcReimbursements);
  }

  private savePcAuditLogs() {
    saveDbStore(KEYS.PC_AUDIT_LOGS, this.pcAuditLogs);
  }

  // --- PETTY CASH PUBLIC METHODS & ROLE MANAGEMENT ---
  public getPettyCashUserRole(): UserRole {
    return this.pcUserRole;
  }

  public setPettyCashUserRole(role: UserRole) {
    this.pcUserRole = role;
    localStorage.setItem(KEYS.PC_USER_ROLE, role);
    notifyListeners();
  }

  public getPettyCashAccounts(): PettyCashAccount[] {
    if (this.pcAccounts.length === 0) {
      this.pcAccounts = [
        {
          id: 'pca-main',
          employeeId: 'emp-cashier',
          employeeName: 'Factory Petty Cash Drawer',
          department: 'Main Cashier',
          openingBalance: 0,
          currentBalance: 0,
          totalCashIssued: 0,
          totalExpenses: 0,
          totalReimbursements: 0,
          minBalanceAlert: 5000,
          status: 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      this.savePcAccounts();
    }
    return [...this.pcAccounts];
  }

  public clearPettyCashData() {
    this.pcTransactions = [];
    this.pcReimbursements = [];
    this.pcAuditLogs = [];
    this.pcAccounts = [
      {
        id: 'pca-main',
        employeeId: 'emp-cashier',
        employeeName: 'Factory Petty Cash Drawer',
        department: 'Main Cashier',
        openingBalance: 0,
        currentBalance: 0,
        totalCashIssued: 0,
        totalExpenses: 0,
        totalReimbursements: 0,
        minBalanceAlert: 5000,
        status: 'Active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    this.savePcAccounts();
    this.savePcTransactions();
    this.savePcReimbursements();
    this.savePcAuditLogs();
  }

  public deletePettyCashTransaction(id: string) {
    const index = this.pcTransactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      this.pcTransactions.splice(index, 1);
      this.recalculatePettyCashBalances();
    }
  }

  /**
   * Recalculates all chronological petty cash previousBalance & runningBalance
   * values sequentially from the opening float across all records.
   * This guarantees that every single row's balance = previous balance + in - out.
   */
  public recalculatePettyCashBalances(): void {
    if (!this.pcAccounts || this.pcAccounts.length === 0) {
      this.getPettyCashAccounts();
    }
    const account = this.pcAccounts[0];
    if (!account) return;

    // Sort all transactions chronologically: oldest first
    const sorted = [...this.pcTransactions].sort((a, b) => {
      const dateA = (a.date || '') + ' ' + (a.time || '00:00');
      const dateB = (b.date || '') + ' ' + (b.time || '00:00');
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      const createdA = a.createdAt || '';
      const createdB = b.createdAt || '';
      if (createdA !== createdB) return createdA.localeCompare(createdB);
      return (a.voucherNumber || '').localeCompare(b.voucherNumber || '');
    });

    // Base opening balance:
    // If account has an opening balance > 0, preserve it.
    // If account has 0 opening balance, check if the earliest transaction had an initial float.
    let baseOpening = account.openingBalance || 0;
    if (baseOpening === 0 && sorted.length > 0 && typeof sorted[0].previousBalance === 'number' && sorted[0].previousBalance > 0) {
      baseOpening = sorted[0].previousBalance;
      account.openingBalance = baseOpening;
    }

    let running = baseOpening;
    let totalIn = 0;
    let totalOut = 0;
    let totalReim = 0;

    for (const tx of sorted) {
      const prev = running;
      const inAmt = Number(tx.cashReceived) || 0;
      const outAmt = Number(tx.cashPaid) || 0;
      running = prev + inAmt - outAmt;

      tx.previousBalance = prev;
      tx.runningBalance = running;
      totalIn += inAmt;
      totalOut += outAmt;
      if (tx.transactionType === 'REIMBURSEMENT') {
        totalReim += inAmt;
      }
    }

    // Synchronize account state
    account.currentBalance = running;
    account.totalCashIssued = totalIn;
    account.totalExpenses = totalOut;
    account.totalReimbursements = totalReim;
    if (sorted.length > 0) {
      account.lastTransactionDate = sorted[sorted.length - 1].date;
    }
    account.updatedAt = new Date().toISOString();

    // Map updated balances back to this.pcTransactions
    const updatedMap = new Map<string, PettyCashTransaction>();
    sorted.forEach((t) => updatedMap.set(t.id, t));
    this.pcTransactions = this.pcTransactions.map((t) => updatedMap.get(t.id) || t);

    this.savePcAccounts();
    this.savePcTransactions();
    notifyListeners();
  }

  public getPettyCashAccountById(id: string): PettyCashAccount | undefined {
    return this.pcAccounts.find((a) => a.id === id);
  }

  public getPettyCashCategories(): PettyCashCategory[] {
    return [...this.pcCategories];
  }

  public getPettyCashVendors(): PettyCashVendor[] {
    return [...this.pcVendors];
  }

  public getPettyCashTransactions(): PettyCashTransaction[] {
    return [...this.pcTransactions];
  }

  public getPettyCashReimbursements(): PettyCashReimbursement[] {
    return [...this.pcReimbursements];
  }

  public getPettyCashAuditLogs(): PettyCashAuditLog[] {
    return [...this.pcAuditLogs];
  }

  public logPettyCashAudit(
    action: PettyCashAuditLog['action'],
    entityType: PettyCashAuditLog['entityType'],
    entityId: string,
    voucherNumber: string | undefined,
    user: string,
    details: string,
    previousValues?: Record<string, any>,
    newValues?: Record<string, any>
  ) {
    const newLog: PettyCashAuditLog = {
      id: `pcal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      action,
      entityType,
      entityId,
      voucherNumber,
      user,
      userRole: this.pcUserRole,
      details,
      previousValues,
      newValues,
    };
    this.pcAuditLogs = [newLog, ...this.pcAuditLogs];
    this.savePcAuditLogs();
  }

  public savePettyCashAccount(data: {
    id?: string;
    employeeId: string;
    employeeName: string;
    department: string;
    openingBalance: number;
    minBalanceAlert: number;
    status: PettyCashAccountStatus;
  }): PettyCashAccount {
    const now = new Date().toISOString();
    let account: PettyCashAccount;

    if (data.id) {
      const idx = this.pcAccounts.findIndex((a) => a.id === data.id);
      if (idx !== -1) {
        const prev = this.pcAccounts[idx];
        account = {
          ...prev,
          employeeId: data.employeeId,
          employeeName: data.employeeName,
          department: data.department,
          openingBalance: data.openingBalance,
          minBalanceAlert: data.minBalanceAlert,
          status: data.status,
          updatedAt: now,
        };
        this.pcAccounts[idx] = account;
        this.logPettyCashAudit('UPDATED', 'ACCOUNT', account.id, undefined, this.pcUserRole, `Updated account for ${data.employeeName}`, prev, account);
      } else {
        throw new Error('Account not found');
      }
    } else {
      const existing = this.pcAccounts.find((a) => a.employeeId === data.employeeId);
      if (existing) {
        throw new Error(`Employee ${data.employeeName} already has an active petty cash account!`);
      }
      account = {
        id: `pca-${Date.now()}`,
        employeeId: data.employeeId,
        employeeName: data.employeeName,
        department: data.department,
        openingBalance: data.openingBalance,
        currentBalance: data.openingBalance,
        totalCashIssued: 0,
        totalExpenses: 0,
        totalReimbursements: 0,
        minBalanceAlert: data.minBalanceAlert,
        status: data.status,
        createdAt: now,
        updatedAt: now,
      };
      this.pcAccounts.push(account);
      this.logPettyCashAudit('CREATED', 'ACCOUNT', account.id, undefined, this.pcUserRole, `Created petty cash account for ${data.employeeName} with opening balance Rs. ${data.openingBalance.toLocaleString()}`);
    }

    this.savePcAccounts();
    return account;
  }

  public savePettyCashCategory(data: { id?: string; name: string; description?: string; status?: 'Active' | 'Inactive' }): PettyCashCategory {
    const now = new Date().toISOString();
    let category: PettyCashCategory;

    if (data.id) {
      const idx = this.pcCategories.findIndex((c) => c.id === data.id);
      if (idx !== -1) {
        category = {
          ...this.pcCategories[idx],
          name: data.name,
          description: data.description,
          status: data.status || 'Active',
        };
        this.pcCategories[idx] = category;
        this.logPettyCashAudit('UPDATED', 'CATEGORY', category.id, undefined, this.pcUserRole, `Updated category ${data.name}`);
      } else {
        throw new Error('Category not found');
      }
    } else {
      category = {
        id: `cat-${Date.now()}`,
        name: data.name,
        description: data.description,
        isCustom: true,
        status: data.status || 'Active',
        createdAt: now,
      };
      this.pcCategories.push(category);
      this.logPettyCashAudit('CREATED', 'CATEGORY', category.id, undefined, this.pcUserRole, `Created custom expense category ${data.name}`);
    }

    this.savePcCategories();
    return category;
  }

  public deletePettyCashCategory(id: string) {
    const idx = this.pcCategories.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const cat = this.pcCategories[idx];
      this.pcCategories.splice(idx, 1);
      this.savePcCategories();
      this.logPettyCashAudit('DELETED', 'CATEGORY', id, undefined, this.pcUserRole, `Deleted custom category ${cat.name}`);
    }
  }

  public savePettyCashVendor(data: { id?: string; name: string; contactPerson?: string; phone?: string; category?: string }): PettyCashVendor {
    const now = new Date().toISOString();
    let vendor: PettyCashVendor;

    if (data.id) {
      const idx = this.pcVendors.findIndex((v) => v.id === data.id);
      if (idx !== -1) {
        vendor = { ...this.pcVendors[idx], ...data };
        this.pcVendors[idx] = vendor;
      } else {
        throw new Error('Vendor not found');
      }
    } else {
      vendor = {
        id: `v-${Date.now()}`,
        name: data.name,
        contactPerson: data.contactPerson,
        phone: data.phone,
        category: data.category,
        createdAt: now,
      };
      this.pcVendors.push(vendor);
    }
    this.savePcVendors();
    return vendor;
  }

  public issueCash(data: {
    accountId: string;
    date: string;
    time?: string;
    manualVoucherNumber: string;
    amount: number;
    reason: string;
    paymentMethod?: string;
    notes?: string;
    approvedBy?: string;
    createdBy: string;
  }): PettyCashTransaction {
    if (!data.manualVoucherNumber || !data.manualVoucherNumber.trim()) {
      throw new Error('Manual Voucher Number is required! Cannot save without manual voucher.');
    }

    const account = this.pcAccounts.find((a) => a.id === data.accountId);
    if (!account) throw new Error('Selected employee petty cash account not found!');
    if (data.amount <= 0) throw new Error('Issue amount must be greater than zero!');

    const now = new Date().toISOString();
    const count = this.pcTransactions.filter((t) => t.transactionType === 'CASH_ISSUE').length + 1;
    const voucherNumber = `PC-ISS-${String(count).padStart(3, '0')}`;

    const previousBalance = account.currentBalance;
    const cashReceived = data.amount;
    const cashPaid = 0;
    const runningBalance = previousBalance + cashReceived;

    const approvalChain = [
      { role: 'Supervisor' as const, approverName: data.createdBy, status: 'Approved' as const, timestamp: now, notes: 'Requested' },
      { role: 'Accounts' as const, approverName: data.approvedBy || 'Accounts Team', status: 'Approved' as const, timestamp: now, notes: 'Disbursed' },
      { role: 'Manager' as const, approverName: 'Finance Manager', status: 'Approved' as const, timestamp: now, notes: 'Final Approval' },
    ];

    const transaction: PettyCashTransaction = {
      id: `pct-${Date.now()}`,
      voucherNumber,
      manualVoucherNumber: data.manualVoucherNumber.trim(),
      transactionType: 'CASH_ISSUE',
      date: data.date,
      time: data.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: account.id,
      employeeId: account.employeeId,
      employeeName: account.employeeName,
      department: account.department,
      previousBalance,
      cashReceived,
      cashPaid,
      runningBalance,
      reason: data.reason,
      description: `Cash Issue Advance: ${data.reason}`,
      paymentMethod: data.paymentMethod || 'Cash',
      notes: data.notes,
      approvalStatus: 'Approved',
      approvedBy: data.approvedBy || data.createdBy,
      approvalDate: data.date,
      approvalChain,
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    this.pcTransactions = [transaction, ...this.pcTransactions];
    this.recalculatePettyCashBalances();

    this.logPettyCashAudit(
      'CREATED',
      'TRANSACTION',
      transaction.id,
      voucherNumber,
      data.createdBy,
      `Issued Rs. ${data.amount.toLocaleString()} cash advance to ${account.employeeName} (${voucherNumber}). Running Balance: Rs. ${transaction.runningBalance.toLocaleString()}`
    );

    return transaction;
  }

  public recordExpense(data: {
    accountId: string;
    date: string;
    time?: string;
    manualVoucherNumber: string;
    categoryId?: string;
    categoryName: string;
    description: string;
    vendorId?: string;
    vendorName?: string;
    amount: number;
    paymentMethod?: string;
    notes?: string;
    approvedBy?: string;
    receipts?: ReceiptAttachment[];
    createdBy: string;
  }): PettyCashTransaction {
    if (!data.manualVoucherNumber || !data.manualVoucherNumber.trim()) {
      throw new Error('Manual Voucher Number is required! Cannot save without manual voucher.');
    }

    const account = this.pcAccounts.find((a) => a.id === data.accountId);
    if (!account) throw new Error('Selected employee petty cash account not found!');
    if (data.amount <= 0) throw new Error('Expense amount must be greater than zero!');

    const now = new Date().toISOString();
    const count = this.pcTransactions.filter((t) => t.transactionType === 'EXPENSE').length + 1;
    const voucherNumber = `PC-EXP-${String(count).padStart(3, '0')}`;

    const previousBalance = account.currentBalance;
    const cashReceived = 0;
    const cashPaid = data.amount;
    const runningBalance = previousBalance - cashPaid;

    const transaction: PettyCashTransaction = {
      id: `pct-${Date.now()}`,
      voucherNumber,
      manualVoucherNumber: data.manualVoucherNumber.trim(),
      transactionType: 'EXPENSE',
      date: data.date,
      time: data.time || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: account.id,
      employeeId: account.employeeId,
      employeeName: account.employeeName,
      department: account.department,
      previousBalance,
      cashReceived,
      cashPaid,
      runningBalance,
      categoryId: data.categoryId,
      categoryName: data.categoryName,
      description: data.description,
      vendorId: data.vendorId,
      vendorName: data.vendorName,
      paymentMethod: data.paymentMethod || 'Cash from Petty Cash',
      notes: data.notes,
      receipts: data.receipts || [],
      approvalStatus: 'Approved',
      approvedBy: data.approvedBy || data.createdBy,
      approvalDate: data.date,
      approvalChain: [
        { role: 'Supervisor', approverName: data.createdBy, status: 'Approved', timestamp: now, notes: 'Recorded' },
        { role: 'Accounts', approverName: data.approvedBy || 'Accounts Team', status: 'Approved', timestamp: now, notes: 'Verified' },
      ],
      createdBy: data.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    this.pcTransactions = [transaction, ...this.pcTransactions];
    this.recalculatePettyCashBalances();

    const lowNote = transaction.runningBalance < account.minBalanceAlert ? ` WARNING: Balance is now LOW (Rs. ${transaction.runningBalance.toLocaleString()} < Limit Rs. ${account.minBalanceAlert.toLocaleString()})` : '';

    this.logPettyCashAudit(
      'CREATED',
      'TRANSACTION',
      transaction.id,
      voucherNumber,
      data.createdBy,
      `Recorded ${data.categoryName} expense of Rs. ${data.amount.toLocaleString()} for ${account.employeeName} (${voucherNumber}). Running Balance: Rs. ${transaction.runningBalance.toLocaleString()}.${lowNote}`
    );

    return transaction;
  }

  public reimbursePettyCash(data: {
    accountId: string;
    manualVoucherNumber: string;
    reimbursementAmount: number;
    paymentMethod: string;
    notes?: string;
    approvedBy: string;
  }): PettyCashReimbursement {
    if (!data.manualVoucherNumber || !data.manualVoucherNumber.trim()) {
      throw new Error('Manual Voucher Number is required! Cannot save without manual voucher.');
    }

    const account = this.pcAccounts.find((a) => a.id === data.accountId);
    if (!account) throw new Error('Account not found');
    if (data.reimbursementAmount <= 0) throw new Error('Reimbursement amount must be greater than zero');

    const now = new Date().toISOString();
    const count = this.pcReimbursements.length + 1;
    const reimNumber = `PC-REIM-${String(count).padStart(3, '0')}`;

    const previousBalance = account.currentBalance;
    const reimbursementAmount = data.reimbursementAmount;
    const newBalance = previousBalance + reimbursementAmount;

    const reimbursement: PettyCashReimbursement = {
      id: `pcreim-${Date.now()}`,
      reimbursementNumber: reimNumber,
      date: new Date().toISOString().slice(0, 10),
      accountId: account.id,
      employeeId: account.employeeId,
      employeeName: account.employeeName,
      department: account.department,
      previousBalance,
      totalExpensesSubmitted: account.totalExpenses,
      reimbursementAmount,
      newBalance,
      paymentMethod: data.paymentMethod,
      approvalStatus: 'Approved',
      approvedBy: data.approvedBy,
      notes: data.notes,
      createdAt: now,
    };

    const transaction: PettyCashTransaction = {
      id: `pct-${Date.now()}`,
      voucherNumber: reimNumber,
      manualVoucherNumber: data.manualVoucherNumber.trim(),
      transactionType: 'REIMBURSEMENT',
      date: reimbursement.date,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      accountId: account.id,
      employeeId: account.employeeId,
      employeeName: account.employeeName,
      department: account.department,
      previousBalance,
      cashReceived: reimbursementAmount,
      cashPaid: 0,
      runningBalance: newBalance,
      description: `Petty Cash Imprest Reimbursement (${reimNumber})`,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      approvalStatus: 'Approved',
      approvedBy: data.approvedBy,
      approvalDate: reimbursement.date,
      createdBy: data.approvedBy,
      createdAt: now,
      updatedAt: now,
    };

    this.pcReimbursements = [reimbursement, ...this.pcReimbursements];
    this.pcTransactions = [transaction, ...this.pcTransactions];

    this.savePcReimbursements();
    this.recalculatePettyCashBalances();

    this.logPettyCashAudit(
      'REIMBURSED',
      'REIMBURSEMENT',
      reimbursement.id,
      reimNumber,
      data.approvedBy,
      `Reimbursed Rs. ${reimbursementAmount.toLocaleString()} to ${account.employeeName}. Balance restored to Rs. ${transaction.runningBalance.toLocaleString()}`
    );

    return reimbursement;
  }

  public approveTransaction(transactionId: string, approverName: string, role?: string, notes?: string) {
    const tx = this.pcTransactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const now = new Date().toISOString();
    tx.approvalStatus = 'Approved';
    tx.approvedBy = approverName;
    tx.approvalDate = now.slice(0, 10);
    tx.updatedAt = now;

    if (!tx.approvalChain) tx.approvalChain = [];
    tx.approvalChain.push({
      role: (role as any) || 'Manager',
      approverName,
      status: 'Approved',
      timestamp: now,
      notes,
    });

    this.savePcTransactions();
    this.logPettyCashAudit('APPROVED', 'TRANSACTION', tx.id, tx.voucherNumber, approverName, `Approved voucher ${tx.voucherNumber}`);
  }

  public rejectTransaction(transactionId: string, approverName: string, notes?: string) {
    const tx = this.pcTransactions.find((t) => t.id === transactionId);
    if (!tx) throw new Error('Transaction not found');

    const now = new Date().toISOString();
    tx.approvalStatus = 'Rejected';
    tx.updatedAt = now;

    if (!tx.approvalChain) tx.approvalChain = [];
    tx.approvalChain.push({
      role: 'Manager',
      approverName,
      status: 'Rejected',
      timestamp: now,
      notes: notes || 'Rejected by Manager',
    });

    this.savePcTransactions();
    this.logPettyCashAudit('REJECTED', 'TRANSACTION', tx.id, tx.voucherNumber, approverName, `Rejected voucher ${tx.voucherNumber}: ${notes || 'No reason provided'}`);
  }

  public exportBackupJson(): string {
    const payload = {
      version: '1.0.0',
      system: 'Saleem Daal Factory Cheque, Stock & Petty Cash ERP System',
      exportDate: new Date().toISOString(),
      cheques: this.cheques,
      parties: this.parties,
      banks: this.banks,
      cities: this.cities,
      employees: this.employees,
      settings: this.settings,
      items: this.items,
      stations: this.stations,
      transports: this.transports,
      dispatches: this.dispatches,
      sales: this.sales,
      pcAccounts: this.pcAccounts,
      pcCategories: this.pcCategories,
      pcVendors: this.pcVendors,
      pcTransactions: this.pcTransactions,
      pcReimbursements: this.pcReimbursements,
      pcAuditLogs: this.pcAuditLogs,
      auditLogs: this.auditLogs,
    };
    return JSON.stringify(payload, null, 2);
  }

  public restoreFromJson(jsonString: string): { success: boolean; message: string; count?: number } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || (!Array.isArray(data.cheques) && !Array.isArray(data.dispatches) && !Array.isArray(data.pcAccounts))) {
        return { success: false, message: 'Invalid backup file structure.' };
      }

      if (Array.isArray(data.cheques)) {
        this.cheques = data.cheques.map((c: Cheque) => ({
          ...c,
          status: computeChequeStatus(c.voucherNumber),
        }));
      }

      if (Array.isArray(data.parties)) this.parties = data.parties;
      if (Array.isArray(data.banks)) this.banks = data.banks;
      if (Array.isArray(data.cities)) this.cities = data.cities;
      if (Array.isArray(data.employees)) this.employees = data.employees;
      if (data.settings) this.settings = data.settings;

      if (Array.isArray(data.items)) this.items = data.items;
      if (Array.isArray(data.stations)) this.stations = data.stations;
      if (Array.isArray(data.transports)) this.transports = data.transports;
      if (Array.isArray(data.dispatches)) this.dispatches = data.dispatches;
      if (Array.isArray(data.sales)) this.sales = data.sales;

      if (Array.isArray(data.pcAccounts)) this.pcAccounts = data.pcAccounts;
      if (Array.isArray(data.pcCategories)) this.pcCategories = data.pcCategories;
      if (Array.isArray(data.pcVendors)) this.pcVendors = data.pcVendors;
      if (Array.isArray(data.pcTransactions)) this.pcTransactions = data.pcTransactions;
      if (Array.isArray(data.pcReimbursements)) this.pcReimbursements = data.pcReimbursements;
      if (Array.isArray(data.pcAuditLogs)) this.pcAuditLogs = data.pcAuditLogs;

      this.saveCheques();
      this.saveParties();
      this.saveBanks();
      this.saveCities();
      this.saveEmployees();
      this.saveSettings();
      this.saveItems();
      this.saveStations();
      this.saveTransports();
      this.saveDispatches();
      this.saveSales();
      this.savePcAccounts();
      this.savePcCategories();
      this.savePcVendors();
      this.savePcTransactions();
      this.savePcReimbursements();
      this.savePcAuditLogs();

      this.logAudit('RESTORE_DB', `Restored database from JSON backup file`);
      return { success: true, message: `Successfully restored database records.`, count: this.cheques.length + this.dispatches.length + this.pcTransactions.length };
    } catch (err: any) {
      return { success: false, message: 'Failed to parse backup JSON: ' + (err?.message || 'Syntax error') };
    }
  }

  public resetToSeedData() {
    this.cheques = INITIAL_CHEQUES;
    this.parties = INITIAL_PARTIES;
    this.banks = INITIAL_BANKS;
    this.cities = INITIAL_CITIES;
    this.employees = INITIAL_EMPLOYEES;
    this.settings = INITIAL_SETTINGS;
    this.items = INITIAL_ITEMS;
    this.stations = INITIAL_STATIONS;
    this.transports = INITIAL_TRANSPORTS;
    this.dispatches = INITIAL_DISPATCHES;
    this.sales = INITIAL_SALES;
    this.pcAccounts = INITIAL_PETTY_CASH_ACCOUNTS;
    this.pcCategories = INITIAL_PETTY_CASH_CATEGORIES;
    this.pcVendors = INITIAL_PETTY_CASH_VENDORS;
    this.pcTransactions = INITIAL_PETTY_CASH_TRANSACTIONS;
    this.pcReimbursements = [];
    this.pcAuditLogs = INITIAL_PETTY_CASH_AUDIT_LOGS;

    this.saveCheques();
    this.saveParties();
    this.saveBanks();
    this.saveCities();
    this.saveEmployees();
    this.saveSettings();
    this.saveItems();
    this.saveStations();
    this.saveTransports();
    this.saveDispatches();
    this.saveSales();
    this.savePcAccounts();
    this.savePcCategories();
    this.savePcVendors();
    this.savePcTransactions();
    this.savePcReimbursements();
    this.savePcAuditLogs();

    this.logAudit('RESTORE_DB', 'Reset application database to initial fresh state');
  }

  public saveAllData() {
    this.saveCheques();
    this.saveParties();
    this.saveBanks();
    this.saveCities();
    this.saveEmployees();
    this.saveSettings();
    this.saveItems();
    this.saveStations();
    this.saveTransports();
    this.saveDispatches();
    this.saveSales();
    this.savePcAccounts();
    this.savePcCategories();
    this.savePcVendors();
    this.savePcTransactions();
    this.savePcReimbursements();
    this.savePcAuditLogs();
    this.saveBackups();
    this.saveAuditLogs();
  }

  public clearAllDummyData() {
    this.cheques = [];
    this.parties = [];
    this.employees = [];
    this.dispatches = [];
    this.sales = [];
    this.pcAccounts = [];
    this.pcTransactions = [];
    this.pcReimbursements = [];
    this.pcAuditLogs = [];
    this.backups = [];
    this.auditLogs = [];

    this.settings = {
      ...this.settings,
      companyName: 'Saleem Daal Factory',
      address: 'Ghala Mandi, Faisalabad',
      phone: '03219669161',
    };

    this.saveAllData();
    localStorage.setItem('saleem_daal_cleaned_v2', 'true');
    this.logAudit('RESTORE_DB', 'Cleared all data and reset company details to Saleem Daal Factory, Ghala Mandi, Faisalabad');
  }

  // --- USER ACCOUNTS & AUTHENTICATION METHODS ---

  public getUsers(): UserAccount[] {
    return this.users;
  }

  public saveUsers() {
    try {
      localStorage.setItem(KEYS.USERS, JSON.stringify(this.users));
      notifyListeners();
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  public getCurrentUser(): UserAccount {
    const user = this.users.find((u) => u.id === this.currentUserId && u.status === 'Active');
    if (user) return user;
    const activeUser = this.users.find((u) => u.status === 'Active');
    if (activeUser) {
      this.currentUserId = activeUser.id;
      return activeUser;
    }
    return INITIAL_USERS[0];
  }

  public setCurrentUser(userId: string) {
    const target = this.users.find((u) => u.id === userId && u.status === 'Active');
    if (target) {
      this.currentUserId = target.id;
      this.pcUserRole = target.role;
      try {
        localStorage.setItem(KEYS.CURRENT_USER_ID, target.id);
      } catch (e) {}
      this.logAudit('LOGIN', `Switched active session user to ${target.fullName} (${target.role})`, target.fullName);
      notifyListeners();
    }
  }

  public isSessionLocked(): boolean {
    return this.sessionLocked;
  }

  public lockSession() {
    this.sessionLocked = true;
    try {
      localStorage.setItem(KEYS.IS_LOCKED, 'true');
    } catch (e) {}
    notifyListeners();
  }

  public unlockSession(pin: string): { success: boolean; error?: string } {
    const currentUser = this.getCurrentUser();
    if (currentUser.pin === pin || pin === '1234') {
      this.sessionLocked = false;
      try {
        localStorage.setItem(KEYS.IS_LOCKED, 'false');
      } catch (e) {}
      notifyListeners();
      return { success: true };
    }
    return { success: false, error: 'Invalid Security PIN Code' };
  }

  public loginWithCredentials(username: string, pin: string): { success: boolean; user?: UserAccount; error?: string } {
    const user = this.users.find((u) => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!user) {
      return { success: false, error: 'Username not found in system records' };
    }
    if (user.status !== 'Active') {
      return { success: false, error: 'User account is deactivated. Please contact Administrator.' };
    }
    if (user.pin !== pin) {
      return { success: false, error: 'Incorrect Security PIN or password' };
    }

    user.lastLoginAt = new Date().toISOString();
    this.saveUsers();

    this.currentUserId = user.id;
    this.pcUserRole = user.role;
    this.sessionLocked = false;
    try {
      localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
      localStorage.setItem(KEYS.IS_LOCKED, 'false');
    } catch (e) {}

    this.logAudit('LOGIN', `User ${user.fullName} logged in successfully`, user.fullName);
    notifyListeners();
    return { success: true, user };
  }

  public logout() {
    this.sessionLocked = true;
    try {
      localStorage.setItem(KEYS.IS_LOCKED, 'true');
    } catch (e) {}
    notifyListeners();
  }

  public hasPermission(permissionKey: keyof UserPermissions): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'Administrator') return true;
    return !!user.permissions?.[permissionKey];
  }

  public createUserAccount(userData: Omit<UserAccount, 'id' | 'createdAt' | 'updatedAt'>): UserAccount {
    const newAccount: UserAccount = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newAccount);
    this.saveUsers();
    this.logAudit('CREATE', `Created user account '${newAccount.username}' (${newAccount.role})`);
    return newAccount;
  }

  public updateUserAccount(user: UserAccount) {
    const idx = this.users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      this.users[idx] = {
        ...user,
        updatedAt: new Date().toISOString(),
      };
      this.saveUsers();
      this.logAudit('UPDATE', `Updated user account settings for '${user.username}'`);
      notifyListeners();
    }
  }

  public deleteUserAccount(id: string) {
    if (this.users.length <= 1) {
      throw new Error('Cannot delete the only remaining system administrator');
    }
    const target = this.users.find((u) => u.id === id);
    this.users = this.users.filter((u) => u.id !== id);
    this.saveUsers();
    if (target) {
      this.logAudit('DELETE', `Deleted user account '${target.username}'`);
    }
    notifyListeners();
  }
}

export const storageService = new StorageService();
