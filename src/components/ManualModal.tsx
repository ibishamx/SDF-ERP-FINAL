import React, { useState } from 'react';
import { 
  BookOpen, Download, Printer, Globe, Shield, Cpu, HardDrive, Users, 
  CheckCircle2, Terminal, Network, Database, Lock, ArrowRight, X, FileText
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../context/LanguageContext';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManualModal: React.FC<ManualModalProps> = ({ isOpen, onClose }) => {
  const { lang } = useLanguage();
  const [manualLang, setManualLang] = useState<'en' | 'ur'>(lang);
  const [activeSection, setActiveSection] = useState<string>('intro');

  if (!isOpen) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let y = 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Smart Cheque & Petty Cash ERP System', 20, y);
    
    y += 10;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Comprehensive Technical & User Software Manual (English & Urdu Guide)', 20, y);

    y += 15;
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);

    const sections = [
      {
        title: '1. Executive Summary & Overview',
        text: 'This software is an enterprise-grade offline-first ERP and Financial Ledger Management System designed for factory operations, trading businesses, and cashiers. It handles multi-bank cheques (Incoming/Outgoing), Petty Cash drawer floats, party ledgers, multi-currency formatting (PKR), audit logs, and instant backups.'
      },
      {
        title: '2. Technology Stack & Architecture',
        text: 'Built using React 18+, TypeScript, Tailwind CSS, Vite, and Node.js/Express backend. Data is stored securely in LocalStorage / IndexedDB with automated cloud synchronization options. Fully containerized for deployment on Docker, Cloud Run, or local Windows/Linux servers.'
      },
      {
        title: '3. Installation on a New Client PC',
        text: 'Step 1: Install Node.js (v18+) on the client PC. Step 2: Unzip the application package into a local folder (e.g., C:\\ChequeERP). Step 3: Open terminal in folder and run "npm install". Step 4: Run "npm run dev" or "npm start" for production mode. Step 5: Access via browser at http://localhost:3000.'
      },
      {
        title: '4. Local Area Network (LAN) & Multi-User Setup',
        text: 'To share the application across multiple PCs in the office/factory network: Run the app on a designated Host PC with a static local IP (e.g., 192.168.1.50). Ensure Windows Firewall allows inbound connections on port 3000. Other client PCs on the same Wi-Fi/LAN can open http://192.168.1.50:3000 in their browsers.'
      },
      {
        title: '5. Core Modules & Daily Workflow',
        text: '- Dashboard & KPIs: Real-time summary of outstanding cheques, petty cash balance, and monthly cash flow.\n- Cheques Management: Track PDC, Cleared, and Returned cheques with SMS/WhatsApp alerts and slip printing.\n- Petty Cash Ledger: Record cash-in, cash-out, daily factory expenses, and cashier closing balance.\n- Parties & Banks Master: Maintain customer/supplier ledgers and bank branch directories.\n- Reports & Analytics: Export comprehensive summaries to Excel and PDF.'
      },
      {
        title: '6. Backup, Restore & Data Security',
        text: 'The system performs automated local backups. Users can manually download JSON backup files from the Utilities -> Backup tab or trigger Ctrl+B instant backup. To restore, simply upload the backup file to instantly recover all records.'
      },
      {
        title: '7. User Roles & Security',
        text: 'Supports Admin, Cashier, and Viewer roles with granular permission toggles, session lock timers, and immutable audit logs tracking every financial transaction.'
      }
    ];

    sections.forEach((sec) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(15, 23, 42);
      doc.text(sec.title, 20, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(51, 65, 85);
      const splitText = doc.splitTextToSize(sec.text, 170);
      doc.text(splitText, 20, y);
      y += splitText.length * 5 + 10;
    });

    doc.save('Cheque_ERP_Software_Manual.pdf');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {manualLang === 'ur' ? 'سافٹ ویئر یوزر مینوئل اور گائیڈ' : 'Software Master Manual & Technical Guide'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {manualLang === 'ur' ? 'مکمل انگریزی اور اردو دستاویزات' : 'Complete English & Urdu Documentation'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setManualLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  manualLang === 'en' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setManualLang('ur')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                  manualLang === 'ur' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                اردو (Urdu)
              </button>
            </div>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              {manualLang === 'ur' ? 'پی ڈی ایف ڈاؤن لوڈ کریں' : 'Download PDF'}
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar Navigation & Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Navigation Sidebar */}
          <div className="w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 p-4 space-y-1.5 overflow-y-auto">
            {[
              { id: 'intro', labelEn: '1. Executive Overview', labelUr: '1. تعارف و خلاصہ', icon: FileText },
              { id: 'tech', labelEn: '2. Tech Stack & Architecture', labelUr: '2. ٹیکنالوجی اور آرکیٹیکچر', icon: Cpu },
              { id: 'install', labelEn: '3. Client PC Installation', labelUr: '3. نئے کمپیوٹر پر انسٹالیشن', icon: Terminal },
              { id: 'network', labelEn: '4. LAN & Multi-User Setup', labelUr: '4. نیٹ ورکنگ اور ملٹی یوزر', icon: Network },
              { id: 'modules', labelEn: '5. Core Modules & Workflow', labelUr: '5. اہم ماڈیولز اور طریقہ کار', icon: CheckCircle2 },
              { id: 'backup', labelEn: '6. Backup & Restore', labelUr: '6. بیک اپ اور ڈیٹا بحالی', icon: HardDrive },
              { id: 'users', labelEn: '7. Users & Permissions', labelUr: '7. یوزر رول اور سیکیورٹی', icon: Shield },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition text-left ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className={manualLang === 'ur' ? 'font-urdu text-sm' : ''}>
                    {manualLang === 'ur' ? item.labelUr : item.labelEn}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">
            {manualLang === 'ur' ? (
              // URDU CONTENT
              <div dir="rtl" className="font-urdu space-y-6 leading-relaxed">
                {activeSection === 'intro' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۱۔ تعارف اور ایگزیکٹو خلاصہ (Executive Overview)
                    </h3>
                    <p className="text-sm">
                      یہ سافٹ ویئر فیکٹریوں، کاروباری اداروں، اور کیشیئرز کے لیے ایک مکمل اور جدید <strong>اسمارٹ چیک، کیش اور لیجر مینجمنٹ سسٹم (ERP)</strong> ہے۔ اس کے ذریعے آپ کسٹمرز اور سپلائرز کے چیک (معلق، کلیئر، ریٹرن)، پیٹی کیش دراز کے اخراجات، بینکوں کے ریکارڈ، اور یوزر کے حقوق کو باآسانی کنٹرول کر سکتے ہیں۔
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">اہم خصوصیات</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">ریئل ٹائم ڈیش بورڈ، آٹومیٹڈ واٹس ایپ/ایس ایم ایس، بلک چیک کلیئرنس، پیٹی کیش فلوٹ مینجمنٹ۔</p>
                      </div>
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">آف لائن فرسٹ سیکیورٹی</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">تمام ڈیٹا آپ کے اپنے لوکل سسٹم پر محفوظ رہتا ہے، انٹرنیٹ کے بغیر بھی مکمل کام کرتا ہے۔</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'tech' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۲۔ ٹیکنالوجی اسٹیک اور آرکیٹیکچر (Tech Stack)
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li><strong>فرنٹ اینڈ:</strong> React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts</li>
                      <li><strong>بیک اینڈ / سرور:</strong> Node.js, Express.js (صحت مند API راؤٹس اور پروکسی کے لیے)</li>
                      <li><strong>ڈیٹا بیس اور اسٹوریج:</strong> LocalStorage اور IndexedDB (براہ راست براؤزر میں محفوظ)</li>
                      <li><strong>بلڈ ٹूल:</strong> Vite & esbuild (انتہائی تیز رفتار پروڈکشن بنڈلنگ)</li>
                    </ul>
                  </div>
                )}

                {activeSection === 'install' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۳۔ نئے کلائنٹ کمپیوٹر پر انسٹالیشن (Client PC Installation)
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>سب سے پہلے کلائنٹ کمپیوٹر پر <strong>Node.js (v18 یا اس سے اوپر)</strong> انسٹال کریں۔</li>
                      <li>سافٹ ویئر کا سورس فولڈر (يا زپ فائل) کمپیوٹر پر کسی مناسب ڈرائیو میں ان زپ کریں (مثلاً <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">C:\ChequeERP</code>)۔</li>
                      <li>ٹرمینل یا کمانڈ پرمٹ کھولیں اور پروجیکٹ کے فولڈر میں جائیں۔</li>
                      <li>تمام ضروری لائبریریاں انسٹال کرنے کے لیے کمانڈ لکھیں: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1">npm install</code>
                      </li>
                      <li>ایپلی کیشن کو رن کرنے کے لیے کمانڈ لکھیں: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1">npm run dev</code>
                      </li>
                      <li>براؤزر کھولیں اور درج ذیل ایڈریس ٹائپ کریں: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1">http://localhost:3000</code>
                      </li>
                    </ol>
                  </div>
                )}

                {activeSection === 'network' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۴۔ نیٹ ورکنگ اور ملٹی یوزر سیٹ اپ (LAN Networking)
                    </h3>
                    <p className="text-sm">
                      اگر آپ فیکٹری یا آفس کے لوکل ایریا نیٹ ورک (LAN / Wi-Fi) پر ایک سے زیادہ کمپیوٹرز سے اس سسٹم کو استعمال کرنا چاہتے ہیں:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                      <li>مرکزی ہوسٹ (Host) کمپیوٹر کا آئی پی ایڈریس معلوم کریں (مثلاً <code className="bg-slate-100 dark:bg-slate-800 px-1">192.168.1.100</code>)۔</li>
                      <li>ہوسٹ کمپیوٹر پر فائر وال کی سیٹنگ میں پورٹ <code className="bg-slate-100 dark:bg-slate-800 px-1">3000</code> کو الاؤ کریں۔</li>
                      <li>دیگر کمپیوٹرز پر کوئی بھی ویب براؤزر کھول کر ہوسٹ کا آئی پی درج کریں: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1">http://192.168.1.100:3000</code>
                      </li>
                    </ul>
                  </div>
                )}

                {activeSection === 'modules' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۵۔ اہم ماڈیولز اور روزمرہ کا کام (Core Modules)
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>ڈیش بورڈ (Dashboard):</strong> کل بقایا چیک، وصولی، کلئیرنس اور پیٹی کیش کا فوری جائزہ۔
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>چیک مینجمنٹ:</strong> نیا چیک درج کریں، اسٹیٹس تبدیل کریں (Clearing / Return)، سلپ پرنٹ کریں۔
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>پیٹی کیش دراز:</strong> روزانہ کی فیکٹری کی نقد آمدنی اور اخراجات کا اندراج۔
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'backup' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۶۔ ڈیٹا کا بیک اپ اور بحالی (Backup & Restore)
                    </h3>
                    <p className="text-sm">
                      ڈیٹا کی حفاظت کے لیے Utilities &gt; Backup مینو سے جب چاہیں بیک اپ فائل ڈاؤن لوڈ کر سکتے ہیں یا شارٹ کٹ مفتاح (<kbd className="bg-slate-200 dark:kbd-slate-700 px-1 rounded">Ctrl + B</kbd>) استعمال کریں۔ بحالی کے لیے صرف پرانی بیک اپ فائل اپ لوڈ کریں۔
                    </p>
                  </div>
                )}

                {activeSection === 'users' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      ۷۔ یوزر کے حقوق اور سیکیورٹی (Users & Security)
                    </h3>
                    <p className="text-sm">
                      ایڈمن (Admin) اور کیشئر (Cashier) کے الگ الگ پاس ورڈز اور سیشن لاک کی سہولت موجود ہے تاکہ غیر متعلقہ افراد مالی ریکارڈ تک رسائی حاصل نہ کر سکیں۔
                    </p>
                  </div>
                )}
              </div>
            ) : (
              // ENGLISH CONTENT
              <div className="space-y-6 text-sm leading-relaxed">
                {activeSection === 'intro' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      1. Executive Overview & Scope
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      This application is an enterprise-grade offline-first ERP and Financial Ledger Management System tailored for factories, corporate cashiers, and trading businesses. It provides rigorous tracking for Incoming/Outgoing Cheques, Petty Cash float drawer balances, Party directories, Bank branch lists, Audit logs, and instant exports.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
                        <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm mb-1">Key Advantages</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Lightning-fast search, multi-currency formatting in PKR, real-time status updates, and zero data loss.</p>
                      </div>
                      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
                        <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm mb-1">Local & Cloud Ready</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Operates locally via IndexedDB/LocalStorage with simple JSON export and cloud container deployment support.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'tech' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      2. Technology Stack & Architecture
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      <li><strong>Frontend Framework:</strong> React 18+ with TypeScript & Vite for high-performance UI rendering.</li>
                      <li><strong>Styling & Animations:</strong> Tailwind CSS utility classes with Motion animations.</li>
                      <li><strong>Icons & Visualization:</strong> Lucide React iconography and Recharts analytics.</li>
                      <li><strong>Backend & API:</strong> Express.js server middleware supporting static asset serving and API proxies.</li>
                      <li><strong>Export & PDF:</strong> jsPDF and jsPDF-AutoTable for professional report generation.</li>
                    </ul>
                  </div>
                )}

                {activeSection === 'install' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      3. Installation on a New Client PC
                    </h3>
                    <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      <li>Download and install <strong>Node.js (LTS v18+)</strong> on the target Windows or Linux PC from nodejs.org.</li>
                      <li>Extract the application ZIP package into your working directory (e.g., <code className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-xs">C:\ChequeERP</code>).</li>
                      <li>Open Command Prompt or Terminal inside the project root folder.</li>
                      <li>Install all required node packages by executing: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">npm install</code>
                      </li>
                      <li>Launch the development server or production build: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">npm run dev</code> (or <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">npm start</code> for production)
                      </li>
                      <li>Open your default web browser (Chrome / Edge) and navigate to: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">http://localhost:3000</code>
                      </li>
                    </ol>
                  </div>
                )}

                {activeSection === 'network' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      4. Local Area Network (LAN) & Multi-User Setup
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      To enable multiple department computers to access the system over your office Wi-Fi or Ethernet LAN:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-300">
                      <li>Designate one stable PC as the Host Server and note its local IPv4 address (e.g., <code className="bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">192.168.1.55</code>) via <code className="bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">ipconfig</code>.</li>
                      <li>Configure Windows Defender Firewall to allow incoming TCP traffic on port <code className="bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">3000</code>.</li>
                      <li>From client machines on the same local subnet, open any browser and enter: <br/>
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded inline-block mt-1 font-mono text-xs">http://192.168.1.55:3000</code>
                      </li>
                    </ul>
                  </div>
                )}

                {activeSection === 'modules' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      5. Core Modules & Daily Workflow
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>Dashboard & KPIs:</strong> High-level overview of Outstanding Cheques, Cleared Totals, Cashier Float, and Monthly Volumetrics.
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>Cheque Ledger:</strong> Add, edit, filter, bulk clear, or mark cheques as returned with integrated slip printing.
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                        <strong>Petty Cash Drawer:</strong> Monitor daily cash-in and cash-out slips with running balance calculations.
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'backup' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      6. Backup, Restore & Data Security
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      The application includes automated and manual backup capabilities. Press <kbd className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs font-mono">Ctrl + B</kbd> at any time to instantly trigger a JSON snapshot download. Restore effortlessly by uploading your backup file in the Utilities &gt; Backup tab.
                    </p>
                  </div>
                )}

                {activeSection === 'users' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 border-b pb-2">
                      7. User Roles & Security Controls
                    </h3>
                    <p className="text-slate-600 dark:text-slate-300">
                      Manage administrative and cashier accounts with session locking, pin security, and immutable audit logging that records every user action and financial modification.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {manualLang === 'ur' ? 'چیک اور کیش مینجمنٹ سسٹم - کاپی رائٹ محفوظ' : 'Cheque & Petty Cash ERP System - Enterprise Edition'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition"
          >
            {manualLang === 'ur' ? 'بند کریں' : 'Close Manual'}
          </button>
        </div>

      </div>
    </div>
  );
};
