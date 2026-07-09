/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  BadgePercent, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertTriangle, 
  Download, 
  Clock, 
  CreditCard, 
  DollarSign, 
  Users, 
  FileDown, 
  ListOrdered,
  Eye,
  Trash2,
  PhoneCall
} from 'lucide-react';
import { FeeItem, Invoice, PaymentRecord, Student, School, User } from '../types';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { saveWorkflowProgress } from '../data/workflowProgress';
import { getTenantSettings } from '../data/mockData';

interface FeesManagementProps {
  user: User | null;
  currentTenant: School | null;
}

const DEFAULT_FEE_ITEMS: FeeItem[] = [
  { id: 'fee_1', tenantId: 'school_central_crest', name: 'First Term Tuition Fee', amount: 850, category: 'Tuition', isRequired: true, description: 'Core academic term instruction and faculty lectures coverage.' },
  { id: 'fee_2', tenantId: 'school_central_crest', name: 'Science Laboratory Levy', amount: 120, category: 'Lab', isRequired: true, description: 'Material consumption, glassware, chemical supplies, and equipment wear.' },
  { id: 'fee_3', tenantId: 'school_central_crest', name: 'Inter-School Athletics Fee', amount: 50, category: 'Sports', isRequired: false, description: 'Athletic wear, gala registration, and track training facilities.' },
  { id: 'fee_4', tenantId: 'school_central_crest', name: 'Digital Library Subscription', amount: 80, category: 'Library', isRequired: true, description: 'Global eBook indexing, curriculum licenses, and PDF text databases.' },
  { id: 'fee_5', tenantId: 'school_central_crest', name: 'Hot Lunch Nutrition Coverage', amount: 200, category: 'Feeding', isRequired: false, description: 'Daily hot balanced meals served in the student refectory.' }
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    tenantId: 'school_central_crest',
    invoiceNumber: 'INV-2026-101',
    studentId: 'student_central_1', // Julian Vance
    studentName: 'Julian Vance',
    classId: 'class_central_10a',
    className: 'Grade 10 - Blue',
    issueDate: '2026-06-01',
    dueDate: '2026-06-25',
    items: [
      { feeItemId: 'fee_1', feeItemName: 'First Term Tuition Fee', amount: 850 },
      { feeItemId: 'fee_2', feeItemName: 'Science Laboratory Levy', amount: 120 },
      { feeItemId: 'fee_4', feeItemName: 'Digital Library Subscription', amount: 80 }
    ],
    totalAmount: 1050,
    discounts: 50,
    amountPaid: 600,
    balance: 400,
    status: 'Part Payment',
    comments: 'Parent paid partial amount on bank transfer. Remainder expected by final due date.'
  },
  {
    id: 'inv_2',
    tenantId: 'school_central_crest',
    invoiceNumber: 'INV-2026-102',
    studentId: 'student_central_2', // Let's mock a secondary student
    studentName: 'Sophia Brody',
    classId: 'class_central_10a',
    className: 'Grade 10 - Blue',
    issueDate: '2026-05-15',
    dueDate: '2026-06-10',
    items: [
      { feeItemId: 'fee_1', feeItemName: 'First Term Tuition Fee', amount: 850 },
      { feeItemId: 'fee_4', feeItemName: 'Digital Library Subscription', amount: 80 }
    ],
    totalAmount: 930,
    discounts: 0,
    amountPaid: 930,
    balance: 0,
    status: 'Paid',
    comments: 'Completed full wire transfer clearance.'
  },
  {
    id: 'inv_3',
    tenantId: 'school_central_crest',
    invoiceNumber: 'INV-2026-103',
    studentId: 'student_central_3',
    studentName: 'Oliver Jenkins',
    classId: 'class_central_8',
    className: 'Grade 8 - Green',
    issueDate: '2026-06-10',
    dueDate: '2026-06-28',
    items: [
      { feeItemId: 'fee_1', feeItemName: 'First Term Tuition Fee', amount: 850 },
      { feeItemId: 'fee_5', feeItemName: 'Hot Lunch Nutrition Coverage', amount: 200 }
    ],
    totalAmount: 1050,
    discounts: 100,
    amountPaid: 0,
    balance: 950,
    status: 'Pending',
    comments: 'PTA staff kid waiver partial adjustment applied.'
  },
  {
    id: 'inv_4',
    tenantId: 'school_central_crest',
    invoiceNumber: 'INV-2026-104',
    studentId: 'student_central_4',
    studentName: 'Amara Kante',
    classId: 'class_central_12b',
    className: 'Grade 12 - Gold',
    issueDate: '2026-04-01',
    dueDate: '2026-05-01',
    items: [
      { feeItemId: 'fee_1', feeItemName: 'First Term Tuition Fee', amount: 850 },
      { feeItemId: 'fee_2', feeItemName: 'Science Laboratory Levy', amount: 120 }
    ],
    totalAmount: 970,
    discounts: 0,
    amountPaid: 200,
    balance: 770,
    status: 'Overdue',
    comments: 'No payments scheduled since April. Arrears processing triggered.'
  }
];

const DEFAULT_PAYMENT_RECORDS: PaymentRecord[] = [
  {
    id: 'pay_1',
    tenantId: 'school_central_crest',
    invoiceId: 'inv_1',
    studentId: 'student_central_1',
    studentName: 'Julian Vance',
    amountPaid: 600,
    paymentMethod: 'Bank Transfer',
    transactionReference: 'TXN-BOA-8837311',
    datePaid: '2026-06-05',
    recordedBy: 'Dr. Sarah Jenkins',
    notes: 'Partial payment recorded manually from bank clearing spreadsheet.'
  },
  {
    id: 'pay_2',
    tenantId: 'school_central_crest',
    invoiceId: 'inv_2',
    studentId: 'student_central_2',
    studentName: 'Sophia Brody',
    amountPaid: 930,
    paymentMethod: 'Card Payment',
    transactionReference: 'TXN-STRIPE-4819',
    datePaid: '2026-05-20',
    recordedBy: 'Accounts Terminal',
    notes: 'Online clearance completed.'
  }
];

export default function FeesManagement({ user, currentTenant }: FeesManagementProps) {
  const tenantId = currentTenant?.id || 'school_central_crest';
  const role = user?.role || 'SchoolAdmin';
  const currencyOptions = [
    { code: 'GHS', label: 'Ghana Cedi' },
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'GBP', label: 'British Pound' },
    { code: 'NGN', label: 'Nigerian Naira' },
    { code: 'XOF', label: 'CFA Franc' },
    { code: 'KES', label: 'Kenyan Shilling' },
    { code: 'ZAR', label: 'South African Rand' },
  ];
  const tenantSettings = getTenantSettings(tenantId);
  const [currencyCode, setCurrencyCode] = useState(() => localStorage.getItem(`educore_fee_currency_${tenantId}`) || tenantSettings.currencyCode || 'GHS');
  const formatMoney = (amount: number) => new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'XOF' ? 0 : 2,
  }).format(amount);

  // Config collections
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Sub-tabs in fees panel
  const [activeTab, setActiveTab] = useState<'invoices' | 'items' | 'payments' | 'billing-analytics'>('invoices');

  // Search/Filters states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Invoice creation helper states
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [invoiceDueDate, setInvoiceDueDate] = useState('2026-07-15');
  const [selectedFeeItemIds, setSelectedFeeItemIds] = useState<string[]>([]);
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [invoiceComments, setInvoiceComments] = useState('');

  // Manual payment recording states
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [targetInvoiceId, setTargetInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord['paymentMethod']>('Manual Entry');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Selected invoice for detail modal projection
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);

  // New Fee Item states
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'Tuition' as FeeItem['category'],
    amount: 100,
    isRequired: true,
    description: ''
  });

  useEffect(() => {
    localStorage.setItem(`educore_fee_currency_${tenantId}`, currencyCode);
  }, [currencyCode, tenantId]);

  useEffect(() => {
    const settingsCurrency = getTenantSettings(tenantId).currencyCode || 'GHS';
    setCurrencyCode(localStorage.getItem(`educore_fee_currency_${tenantId}`) || settingsCurrency);
  }, [tenantId]);

  useEffect(() => {
    // Sync lists from localStorage
    const cachedItems = localStorage.getItem(`educore_fee_items_${tenantId}`);
    const cachedInvs = localStorage.getItem(`educore_invoices_${tenantId}`);
    const cachedPays = localStorage.getItem(`educore_payments_${tenantId}`);
    
    if (cachedItems) setFeeItems(JSON.parse(cachedItems));
    else {
      setFeeItems(DEFAULT_FEE_ITEMS);
      localStorage.setItem(`educore_fee_items_${tenantId}`, JSON.stringify(DEFAULT_FEE_ITEMS));
    }

    if (cachedInvs) setInvoices(JSON.parse(cachedInvs));
    else {
      setInvoices(DEFAULT_INVOICES);
      localStorage.setItem(`educore_invoices_${tenantId}`, JSON.stringify(DEFAULT_INVOICES));
    }

    if (cachedPays) setPayments(JSON.parse(cachedPays));
    else {
      setPayments(DEFAULT_PAYMENT_RECORDS);
      localStorage.setItem(`educore_payments_${tenantId}`, JSON.stringify(DEFAULT_PAYMENT_RECORDS));
    }

    // Pull student registry to configure selector
    const cachedStudents = localStorage.getItem(`educore_students_${tenantId}`);
    if (cachedStudents) {
      setStudents(JSON.parse(cachedStudents));
    } else {
      // Seed fallback students
      const dummyStudents: Student[] = [
        { id: 'student_central_1', tenantId, fullName: 'Julian Vance', studentId: 'STU-001', classId: '10A', gender: 'Male', parentName: 'Robert Vance', parentPhone: '+1 (617) 555-9011', parentEmail: 'r.vance@gmail.com', dateOfBirth: '2010-04-12', admissionDate: '2025-09-12', status: 'Active', createdAt: '2025-09-12T08:00:00Z' },
        { id: 'student_central_2', tenantId, fullName: 'Sophia Brody', studentId: 'STU-002', classId: '10A', gender: 'Female', parentName: 'Marcus Brody', parentPhone: '+1 (617) 555-2211', parentEmail: 'm.brody@centralcrest.edu', dateOfBirth: '2010-10-05', admissionDate: '2025-09-12', status: 'Active', createdAt: '2025-09-12T08:00:00Z' },
        { id: 'student_central_3', tenantId, fullName: 'Oliver Jenkins', studentId: 'STU-003', classId: '8B', gender: 'Male', parentName: 'Dr. Sarah Jenkins', parentPhone: '+1 (617) 555-0190', parentEmail: 'admin@centralcrest.edu', dateOfBirth: '2012-01-22', admissionDate: '2025-09-12', status: 'Active', createdAt: '2025-09-12T08:00:00Z' },
        { id: 'student_central_4', tenantId, fullName: 'Amara Kante', studentId: 'STU-004', classId: '12B', gender: 'Female', parentName: 'Mariama Kante', parentPhone: '+1 (617) 555-0019', parentEmail: 'amara.parent@gmail.com', dateOfBirth: '2008-08-30', admissionDate: '2024-09-10', status: 'Active', createdAt: '2024-09-10T08:00:00Z' }
      ];
      setStudents(dummyStudents);
      localStorage.setItem(`educore_students_${tenantId}`, JSON.stringify(dummyStudents));
    }
  }, [tenantId]);

  // Persisters
  const persistItems = (fresh: FeeItem[]) => {
    setFeeItems(fresh);
    localStorage.setItem(`educore_fee_items_${tenantId}`, JSON.stringify(fresh));
  };

  const persistInvoices = (fresh: Invoice[]) => {
    setInvoices(fresh);
    localStorage.setItem(`educore_invoices_${tenantId}`, JSON.stringify(fresh));
  };

  const persistPayments = (fresh: PaymentRecord[]) => {
    setPayments(fresh);
    localStorage.setItem(`educore_payments_${tenantId}`, JSON.stringify(fresh));
  };

  // Status Badge color helper
  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'Paid': return 'bg-emerald-50 text-emerald-700 border-emerald-250';
      case 'Part Payment': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Overdue': return 'bg-rose-50 text-rose-700 border-rose-250';
      case 'Waived': return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Generate Invoices Command Handler
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const student = students.find(s => s.id === selectedStudentId);
    if (!student || selectedFeeItemIds.length === 0) return;

    // Gather fee items details
    const selectedItems = feeItems
      .filter(item => selectedFeeItemIds.includes(item.id))
      .map(item => ({
        feeItemId: item.id,
        feeItemName: item.name,
        amount: item.amount
      }));

    const rawTotal = selectedItems.reduce((acc, current) => acc + current.amount, 0);
    const finalAmount = Math.max(0, rawTotal - appliedDiscount);

    const generated: Invoice = {
      id: `inv_auto_${Date.now()}`,
      tenantId,
      invoiceNumber: `INV-2026-${100 + invoices.length + 1}`,
      studentId: student.id,
      studentName: student.fullName,
      classId: student.classId,
      className: `Grade ${student.classId}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceDueDate,
      items: selectedItems,
      totalAmount: rawTotal,
      discounts: appliedDiscount,
      amountPaid: 0,
      balance: finalAmount,
      status: 'Pending',
      comments: invoiceComments
    };

    const updated = [generated, ...invoices];
    persistInvoices(updated);
    saveWorkflowProgress('manager-fees', { doneSteps: [0, 1, 2], completed: true }, 'invoice generated');
    setIsNewInvoiceOpen(false);
    
    // Reset states
    setSelectedStudentId('');
    setSelectedFeeItemIds([]);
    setAppliedDiscount(0);
    setInvoiceComments('');
  };

  // Log manual payments command helper
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const invoice = invoices.find(inv => inv.id === targetInvoiceId);
    if (!invoice || paymentAmount <= 0) return;

    // Append Payment Row
    const paymentRec: PaymentRecord = {
      id: `pay_auto_${Date.now()}`,
      tenantId,
      invoiceId: invoice.id,
      studentId: invoice.studentId,
      studentName: invoice.studentName,
      amountPaid: paymentAmount,
      paymentMethod,
      transactionReference: paymentRef || `MANUAL-${Date.now().toString().substring(6)}`,
      datePaid: new Date().toISOString().split('T')[0],
      recordedBy: user?.name || 'Administrator',
      notes: paymentNotes
    };

    // Update original invoice metrics
    const newPaid = invoice.amountPaid + paymentAmount;
    const finalTotalWithDiscount = invoice.totalAmount - invoice.discounts;
    const newBalance = Math.max(0, finalTotalWithDiscount - newPaid);
    
    let targetStatus: Invoice['status'] = 'Part Payment';
    if (newBalance <= 0) {
      targetStatus = 'Paid';
    } else if (newPaid <= 0) {
      targetStatus = 'Pending';
    }

    const updatedInvoices = invoices.map(i => {
      if (i.id === invoice.id) {
        return {
          ...i,
          amountPaid: newPaid,
          balance: newBalance,
          status: targetStatus
        };
      }
      return i;
    });

    persistInvoices(updatedInvoices);
    persistPayments([paymentRec, ...payments]);
    setIsPaymentModalOpen(false);

    // Reset payment values
    setTargetInvoiceId('');
    setPaymentAmount(0);
    setPaymentRef('');
    setPaymentNotes('');
  };

  // Toggle item in invoice creation
  const handleToggleFeeItemSelection = (id: string) => {
    if (selectedFeeItemIds.includes(id)) {
      setSelectedFeeItemIds(selectedFeeItemIds.filter(fId => fId !== id));
    } else {
      setSelectedFeeItemIds([...selectedFeeItemIds, id]);
    }
  };

  // Create Fee Items
  const handleCreateFeeItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || newItem.amount <= 0) return;

    const added: FeeItem = {
      id: `fee_auto_${Date.now()}`,
      tenantId,
      name: newItem.name,
      category: newItem.category,
      amount: newItem.amount,
      isRequired: newItem.isRequired,
      description: newItem.description
    };

    persistItems([...feeItems, added]);
    setIsNewItemOpen(false);
    setNewItem({
      name: '',
      category: 'Tuition',
      amount: 100,
      isRequired: true,
      description: ''
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm("Do you want to delete this fee bill permanently?")) {
      persistInvoices(invoices.filter(i => i.id !== id));
    }
  };

  // EXPORT METRICS CSV GENERATOR
  const triggerSpreadsheetExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Invoice Number,Pupil Name,Total Invoiced,Applied Discount,Paid Clearing,Balance Outstanding,Status"]
      .concat(invoices.map(i => `${i.invoiceNumber},${i.studentName},${i.totalAmount},${i.discounts},${i.amountPaid},${i.balance},${i.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `EduCore_Ledger_${tenantId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute stats card
  const totalReceivables = invoices.reduce((acc, curr) => acc + (curr.totalAmount - curr.discounts), 0);
  const totalCollected = invoices.reduce((acc, curr) => acc + curr.amountPaid, 0);
  const totalArrears = invoices.filter(inv => inv.status === 'Overdue' || inv.status === 'Part Payment').reduce((acc, curr) => acc + curr.balance, 0);
  const pendingCollections = invoices.filter(inv => inv.status === 'Pending').reduce((acc, curr) => acc + curr.balance, 0);

  // Search filter
  const filteredInvoiceList = invoices.filter(inv => {
    const sMatch = inv.studentName.toLowerCase().includes(searchText.toLowerCase()) || inv.invoiceNumber.toLowerCase().includes(searchText.toLowerCase());
    const filterMatch = statusFilter === 'All' || inv.status === statusFilter;
    return sMatch && filterMatch;
  });

  return (
    <div id="fees-section" className="fees-management-page space-y-6 select-text scroll-mt-4">
      
      {/* PAGE BANNER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">School Fees</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create fee bills, record payments, choose currency, and see what parents still need to pay.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <label className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
            <span>Currency</span>
            <select
              value={currencyCode}
              onChange={e => setCurrencyCode(e.target.value)}
              className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-black text-slate-800 outline-none"
            >
              {currencyOptions.map(option => (
                <option key={option.code} value={option.code}>{option.code} - {option.label}</option>
              ))}
            </select>
          </label>
          <button
            id="btn-fees-export"
            onClick={triggerSpreadsheetExport}
            className="px-3.5 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            id="btn-fees-new-inv"
            onClick={() => setIsNewInvoiceOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Fee Bill</span>
          </button>
        </div>
      </div>
      <SectionActionStrip
        progressKey="manager-fees"
        steps={['Choose currency', 'Create invoice', 'Record payment']}
        helpText="Choose the currency first. Generate a student invoice, then record each payment so parents can see the right balance."
        reminderText="Create invoices and record payments so parents see the correct term or semester balance."
        canMarkDone={invoices.length > 0}
        blockedDoneText="Generate at least one invoice or record a payment before marking fees done."
        actions={[
          { label: 'Generate invoice', onClick: () => setIsNewInvoiceOpen(true), tone: 'primary' },
          { label: 'Check payments', onClick: () => setActiveTab('payments') },
        ]}
        isEmpty={invoices.length === 0}
        emptyText="No invoice is available yet. Create a fee item, then generate a student invoice."
      />
      <BackToPageMenu />

      {/* STRIP STATS MATRIX */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Expected Revenue</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">{formatMoney(totalReceivables)}</p>
          <div className="text-[9px] text-[#1A56DB] font-medium mt-1 uppercase font-mono bg-blue-50 border border-blue-100/50 rounded p-1 inline-block">Tuition & Lab structures</div>
        </div>

        <div className="bg-emerald-50/40 p-4.5 rounded-lg border border-emerald-200/50">
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Total Fees Collected</p>
          <p className="text-lg font-bold text-emerald-950 font-mono mt-1">{formatMoney(totalCollected)}</p>
          <div className="text-[9px] text-emerald-700 font-extrabold mt-1">
            {totalReceivables > 0 ? `${((totalCollected / totalReceivables) * 100).toFixed(1)}% Collection Rate` : '0%'}
          </div>
        </div>

        <div className="bg-amber-50/40 p-4.5 rounded-lg border border-amber-200/50">
          <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Arrears & Part Payments</p>
          <p className="text-lg font-bold text-amber-950 font-mono mt-1">{formatMoney(totalArrears)}</p>
          <div className="text-[9px] text-amber-700 font-extrabold mt-1 uppercase font-mono">Requires reminders</div>
        </div>

        <div className="bg-rose-50/40 p-4.5 rounded-lg border border-rose-200/50">
          <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Pending Initial clearance</p>
          <p className="text-lg font-bold text-rose-950 font-mono mt-1">{formatMoney(pendingCollections)}</p>
          <div className="text-[9px] text-rose-700 font-extrabold mt-1 uppercase font-mono">Unpaid invoices</div>
        </div>

      </div>

      {/* MAIN LAYOUT CONTROL TABS */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        
        {/* TABS SELECTOR */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4">
          <button
            onClick={() => setActiveTab('invoices')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'invoices' ? 'border-blue-600 text-blue-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fee Bills & Payments
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'items' ? 'border-blue-600 text-blue-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Fee Structures
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
              activeTab === 'payments' ? 'border-blue-600 text-blue-600 font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Payment Receipts Logs
          </button>
        </div>

        {/* CONTAINER CONTENT */}
        <div className="p-5">
          
          {/* TAB 1: INVOICES LIST */}
          {activeTab === 'invoices' && (
            <div className="space-y-4">
              
              {/* FILTERS CONTAINER */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search invoice numbers, pupil names..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-2.5 py-1.5 text-xs font-bold border border-slate-200 rounded bg-white text-slate-700 focus:outline-none cursor-pointer"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Part Payment">Part Payment</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Waived">Waived</option>
                  </select>
                </div>
              </div>

              {/* OUTSTANDING TABLE */}
              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="p-3">Invoice ID</th>
                      <th className="p-3">Student / Pupil</th>
                      <th className="p-3">Class</th>
                      <th className="p-3">Date Issued</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3 text-right">Invoiced</th>
                      <th className="p-3 text-right">Paid</th>
                      <th className="p-3 text-right">Outstanding</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {filteredInvoiceList.map(inv => {
                      const overdueClass = (inv.status === 'Overdue') ? 'text-rose-600 font-bold' : 'text-slate-800';
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900">{inv.invoiceNumber}</td>
                          <td className="p-3 font-bold text-slate-900">{inv.studentName}</td>
                          <td className="p-3 text-slate-600">{inv.className}</td>
                          <td className="p-3 text-slate-500 font-mono">{inv.issueDate}</td>
                          <td className="p-3 text-slate-500 font-mono">{inv.dueDate}</td>
                          <td className="p-3 text-right font-mono font-bold">{formatMoney(inv.totalAmount - inv.discounts)}</td>
                          <td className="p-3 text-right font-mono text-emerald-600 font-bold">{formatMoney(inv.amountPaid)}</td>
                          <td className={`p-3 text-right font-mono ${overdueClass}`}>{formatMoney(inv.balance)}</td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider border rounded-full uppercase ${getStatusBadge(inv.status)}`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                title="View details and print"
                                onClick={() => setViewingInvoice(inv)}
                                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              
                              {inv.status !== 'Paid' && (
                                <button
                                  title="Log payment receipt"
                                  onClick={() => {
                                    setTargetInvoiceId(inv.id);
                                    setPaymentAmount(inv.balance);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="p-1 hover:b-blue-100 rounded text-blue-600 font-bold font-mono text-[10px]"
                                >
                                  +
                                </button>
                              )}

                              <button
                                title="Purge Invoice"
                                onClick={() => handleDeleteInvoice(inv.id)}
                                className="p-1 hover:bg-slate-100 rounded text-rose-500 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredInvoiceList.length === 0 && (
                      <tr>
                        <td colSpan={10} className="p-12 text-center text-slate-400 bg-slate-50/50">
                          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No students invoices match your criteria details.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: FEE ITEMS CONFIG */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-3.5 rounded border border-slate-200">
                <span className="text-xs font-semibold text-slate-600">Configured Fee Templates applied to pupils rosters.</span>
                <button
                  onClick={() => setIsNewItemOpen(true)}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  Define Fee Item
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {feeItems.map(item => (
                  <div key={item.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-all space-y-3 relative overflow-hidden bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wide">
                          {item.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5">{item.name}</h4>
                      </div>

                      <span className="text-sm font-extrabold text-blue-700 font-mono">
                        {formatMoney(item.amount)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-normal min-h-[40px]">
                      {item.description || 'No specialized description provided.'}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <span className="text-slate-400">Status rule:</span>
                      {item.isRequired ? (
                        <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">Mandatory Core Coverage</span>
                      ) : (
                        <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded">Optional Event Coverage</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PAYMENT RECEIPTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded overflow-x-auto bg-white">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Method type</th>
                      <th className="p-3">Date Paid</th>
                      <th className="p-3">Recorded Auditor</th>
                      <th className="p-3 text-right">Receipt Total</th>
                      <th className="p-3">Internal Memo Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {payments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{pay.transactionReference}</td>
                        <td className="p-3 font-bold text-slate-900">{pay.studentName}</td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700">
                            <CreditCard className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                            {pay.paymentMethod}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{pay.datePaid}</td>
                        <td className="p-3 text-slate-600">{pay.recordedBy}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-600">{formatMoney(pay.amountPaid)}</td>
                        <td className="p-3 text-slate-500 text-[11px] italic truncate max-w-[200px]" title={pay.notes}>
                          {pay.notes || '-'}
                        </td>
                      </tr>
                    ))}

                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-slate-400 bg-slate-50/50">
                          <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-semibold">No recent payments recorded yet.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* MODAL 1: ADD FEE ITEM */}
      {isNewItemOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-4.5 py-3.5 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Define Fee Item</h3>
              <button onClick={() => setIsNewItemOpen(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateFeeItemSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Fee Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. First Semester Chemistry Lab Fee"
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Category</label>
                  <select
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as FeeItem['category']})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded text-slate-800"
                  >
                    <option value="Tuition">Tuition</option>
                    <option value="Sports">Sports</option>
                    <option value="Lab">Lab</option>
                    <option value="Library">Library</option>
                    <option value="Feeding">Feeding</option>
                    <option value="Uniform">Uniform</option>
                    <option value="Exam">Exam</option>
                    <option value="PTA">PTA</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Levy Amount ($)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newItem.amount}
                    onChange={e => setNewItem({...newItem, amount: Number(e.target.value)})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Long Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain billing rules and structure details..."
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isRequiredC"
                  checked={newItem.isRequired}
                  onChange={e => setNewItem({...newItem, isRequired: e.target.checked})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="isRequiredC" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  Mandatory fee applied to all students bulk bills
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewItemOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4.5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white rounded font-bold shadow cursor-pointer"
                >
                  Commit structure
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: GENERATE STUDENT INVOICE */}
      {isNewInvoiceOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Invoice Generator</h3>
              <button onClick={() => setIsNewInvoiceOpen(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Student Name</label>
                  <select
                    required
                    value={selectedStudentId}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded bg-white font-bold"
                  >
                    <option value="">-- Choose Pupil --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.fullName} ({s.studentId}) - {s.classId}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment Due Date</label>
                  <input
                    type="date"
                    required
                    value={invoiceDueDate}
                    onChange={e => setInvoiceDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold"
                  />
                </div>
              </div>

              {/* CHOOSE FEE CATEGORY CHECKBOXES */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Choose itemized structures bills</label>
                <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-2 max-h-[160px] overflow-y-auto">
                  {feeItems.map(item => {
                    const isChecked = selectedFeeItemIds.includes(item.id);
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleToggleFeeItemSelection(item.id)}
                        className={`p-2 rounded border flex items-center justify-between transition-colors cursor-pointer text-xs ${
                          isChecked ? 'bg-blue-50/50 border-blue-200 font-bold' : 'bg-white border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // Swapped via parent div
                            className="text-blue-600 focus:ring-blue-500 rounded border-slate-300 cursor-pointer"
                          />
                          <span>{item.name}</span>
                        </div>
                        <span className="font-mono text-blue-700">{formatMoney(item.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Discount apply */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Scholarship Discount</label>
                  <div className="relative">
                    <BadgePercent className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={appliedDiscount}
                      onChange={e => setAppliedDiscount(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 px-3 py-2 rounded border border-blue-250 flex flex-col justify-center text-right font-sans">
                  <span className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Gross Total</span>
                  <span id="label-live-invoice-summary" className="text-sm font-extrabold text-blue-900 font-mono">
                    {formatMoney(Math.max(0, feeItems.filter(item => selectedFeeItemIds.includes(item.id)).reduce((acc, curr) => acc + curr.amount, 0) - appliedDiscount))}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Internal Billing Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Approved partial athletic voucher refund."
                  value={invoiceComments}
                  onChange={e => setInvoiceComments(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceOpen(false)}
                  className="px-3 py-2 border border-slate-250 text-slate-650 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selectedFeeItemIds.length === 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow-sm cursor-pointer disabled:bg-slate-200 disabled:cursor-not-allowed"
                >
                  Generate Invoice Voucher
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: INVOICE PREVIEW ON GIVEN OBJECT */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 select-text">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Invoice Voucher # {viewingInvoice.invoiceNumber}</h3>
              <button onClick={() => setViewingInvoice(null)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm">✕</button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Billing Info block */}
              <div className="flex justify-between border-b border-slate-200 pb-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#0A1E33] font-display uppercase tracking-tight">SCHOOL FEE BILL</h4>
                  <p className="text-[10px] text-slate-400 font-mono">School: {viewingInvoice.tenantId}</p>
                  <p className="text-xs text-slate-600 font-medium">{currentTenant?.name || 'Local School Authority'}</p>
                </div>

                <div className="text-right">
                  <span className={`inline-block px-3 py-0.5 text-[9px] font-extrabold border rounded-md uppercase ${getStatusBadge(viewingInvoice.status)}`}>
                    {viewingInvoice.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-2 font-mono">Issued: {viewingInvoice.issueDate}</p>
                  <p className="text-[10px] text-rose-500 font-bold font-mono">Due: {viewingInvoice.dueDate}</p>
                </div>
              </div>

              {/* Student info */}
              <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-2 text-xs gap-2">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Billed To Parent:</span>
                  <p className="font-extrabold text-slate-800">{viewingInvoice.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{viewingInvoice.className}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Payment Status:</span>
                  <p className="font-bold text-slate-600">Manual Entry / Card proxy</p>
                </div>
              </div>

              {/* Items loop */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Voucher Bill breakdowns</span>
                <div className="border border-slate-200 rounded divide-y divide-slate-150 text-xs text-slate-700">
                  {viewingInvoice.items.map((it, idx) => (
                    <div key={idx} className="p-2 w-full flex items-center justify-between">
                      <span className="font-medium text-slate-800">{it.feeItemName}</span>
                      <span className="font-mono text-slate-600 font-semibold">{formatMoney(it.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="border-t border-slate-200 pt-3 text-xs space-y-1.5 max-w-[280px] ml-auto font-sans">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal Level:</span>
                  <span className="font-mono text-slate-800">{formatMoney(viewingInvoice.totalAmount)}</span>
                </div>
                {viewingInvoice.discounts > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span className="font-bold">Scholarship support waiver:</span>
                    <span className="font-mono font-bold">-{formatMoney(viewingInvoice.discounts)}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Clearence Paid:</span>
                  <span className="font-mono">{formatMoney(viewingInvoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-black text-slate-900 bg-slate-100 p-2 rounded">
                  <span>Net Outstanding Balance:</span>
                  <span className="font-mono text-blue-700">{formatMoney(viewingInvoice.balance)}</span>
                </div>
              </div>

              {viewingInvoice.comments && (
                <div className="p-3 bg-slate-55 rounded text-[11px] text-slate-500 border border-slate-200/50">
                  <span className="font-bold">Auditor Comments:</span> {viewingInvoice.comments}
                </div>
              )}

              <div className="pt-3 border-t border-slate-150 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span>V-Clear-Checksum: SHA_ROW_{viewingInvoice.id.substring(9)}</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-slate-800 text-white rounded font-mono font-bold hover:bg-slate-950 flex items-center gap-1 cursor-pointer"
                >
                  PRINT LEDGER
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD PAYMENT MANUAL RECEIPT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-4.5 py-3.5 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono font-sans">Clear invoice payment</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Invoicing Reference</label>
                <select
                  required
                  value={targetInvoiceId}
                  onChange={e => {
                    setTargetInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.balance);
                  }}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-bold font-mono"
                >
                  <option value="">-- Select outstanding invoice --</option>
                  {invoices
                    .filter(i => i.status !== 'Paid')
                    .map(i => (
                      <option key={i.id} value={i.id}>
                        {i.invoiceNumber} - {i.studentName} (Owes: {formatMoney(i.balance)})
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Amount Cleared</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentRecord['paymentMethod'])}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded text-slate-800 font-bold"
                  >
                    <option value="Manual Entry">Cash / Manual Entry</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Wire Transfer</option>
                    <option value="Card Payment">Card Proxy Clearance</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Transaction Reference ID (or bank code)</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-MTN-44919"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Clearing Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Paid by cash receipt or mobile money."
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-600 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow cursor-pointer"
                >
                  Record Payment
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
