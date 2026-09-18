import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ur';

export const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    cheques: 'Cheque Management',
    stock: 'Stock & Raw Material',
    pettyCash: 'Petty Cash Ledger',
    reports: 'Reports & Statements',
    utilities: 'Utilities & Backup',
    settings: 'Settings',

    // Core Actions
    addCheque: '+ Add Cheque',
    clearCheque: '✓ Clear Cheque',
    exportExcel: 'Export Excel',
    printTable: 'Print Table',
    searchPlaceholder: 'Search by party, cheque #, bank or city...',

    // Cheque Statuses
    allCheques: 'All Cheques',
    outstanding: 'Outstanding',
    cleared: 'Cleared',
    returned: 'Returned',

    // Fields & Columns
    chequeNumber: 'Cheque Number',
    receiveFrom: 'Party Name (Receive From)',
    paidTo: 'Paid To (Credited Party)',
    bank: 'Bank Name',
    city: 'City',
    amount: 'Amount (PKR)',
    receiveDate: 'Receive Date',
    chequeDate: 'Cheque Date',
    voucherNumber: 'Voucher Number',
    status: 'Status',
    actions: 'Actions',

    // Dashboard Headers & Modules
    factoryDashboard: 'Saleem Daal Factory - Operational Dashboard',
    chequeModuleDesc: 'Manage customer cheques, track outstanding balances & clear vouchers',
    stockModuleDesc: 'Warehouse grain stock balances, gate passes & item dispatch',
    pettyCashDesc: 'Factory cashier daily cash drawer float & expense transactions',

    // Common
    save: 'Save Record',
    cancel: 'Cancel',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View Details',
    languageName: 'اردو (Urdu)',
  },
  ur: {
    // Navigation
    dashboard: 'ڈیش بورڈ',
    cheques: 'چیک مینجمنٹ',
    stock: 'اسٹاک و خام مال',
    pettyCash: 'پیٹی کیش (دکان)',
    reports: 'رپورٹس و گوشوارے',
    utilities: 'سیٹنگز و بیک اپ',
    settings: 'ترتیبات',

    // Core Actions
    addCheque: '+ نیا چیک درج کریں',
    clearCheque: '✓ چیک کلیئر کریں',
    exportExcel: 'ایکسل فائل ڈاؤن لوڈ',
    printTable: 'پرنٹ کریں',
    searchPlaceholder: 'پارٹی، چیک نمبر، بینک یا شہر کی تلاش...',

    // Cheque Statuses
    allCheques: 'تمام چیکس',
    outstanding: 'باقی (غیر جمع)',
    cleared: 'کلیئر شدہ (واؤچر)',
    returned: 'واپس شدہ (باؤنس)',

    // Fields & Columns
    chequeNumber: 'چیک نمبر',
    receiveFrom: 'پارٹی کا نام (کس سے ملا)',
    paidTo: 'کس کو دیا (ادائیگی)',
    bank: 'بینک کا نام',
    city: 'شہر',
    amount: 'رقم (روپے)',
    receiveDate: 'موصول ہونے کی تاریخ',
    chequeDate: 'چیک کی تاریخ',
    voucherNumber: 'واؤچر نمبر',
    status: 'صورتحال (سٹیٹس)',
    actions: 'کارروائی',

    // Dashboard Headers & Modules
    factoryDashboard: 'سلیم دال فیکٹری - اہم معلومات و ڈیش بورڈ',
    chequeModuleDesc: 'گاہکوں کے چیکس کا ریکارڈ اور واؤچر کے ساتھ کلیئرنس',
    stockModuleDesc: 'دال کا اسٹاک، گیٹ پاس اور سامان کی ترسیل',
    pettyCashDesc: 'فیکٹری کیش دراز، روزانہ کے اخراجات کا حساب',

    // Common
    save: 'محفوظ کریں',
    cancel: 'منسوخ کریں',
    confirm: 'تکمیل کریں',
    delete: 'ڈیلیٹ کریں',
    edit: 'تبدیل کریں',
    view: 'تفصیل دیکھیں',
    languageName: 'English',
  },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('app_language') as Language) || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ur' : 'en');
  };

  const t = (key: keyof typeof translations['en']): string => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
