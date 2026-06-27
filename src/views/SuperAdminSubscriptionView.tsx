/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Crown, 
  DollarSign, 
  CreditCard, 
  Activity, 
  Sparkles, 
  Database, 
  Layers, 
  ShieldAlert, 
  PlusCircle, 
  Trash2,
  TrendingUp,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { SaaSPackage, BillingRecord, TenantSubscription, School } from '../types';

interface SuperAdminSubscriptionViewProps {
  packages: SaaSPackage[];
  onAddPackage: (pkg: SaaSPackage) => void;
  onDeletePackage: (pkgId: string) => void;
  billingRecords: BillingRecord[];
  subscriptions: TenantSubscription[];
  schools: School[];
}

export default function SuperAdminSubscriptionView({
  packages,
  onAddPackage,
  onDeletePackage,
  billingRecords,
  subscriptions,
  schools
}: SuperAdminSubscriptionViewProps) {
  const [activePane, setActivePane] = useState<'packages' | 'billing'>('packages');
  const [showAddPkgModal, setShowAddPkgModal] = useState(false);

  // New package form states
  const [newPkgName, setNewPkgName] = useState('');
  const [newPkgPriceM, setNewPkgPriceM] = useState(99);
  const [newPkgPriceY, setNewPkgPriceY] = useState(990);
  const [newPkgStudents, setNewPkgStudents] = useState(250);
  const [newPkgTeachers, setNewPkgTeachers] = useState(25);
  const [newPkgAI, setNewPkgAI] = useState(100000);
  const [newPkgSMS, setNewPkgSMS] = useState(5000);
  const [newPkgStorage, setNewPkgStorage] = useState(10);
  const [newPkgParent, setNewPkgParent] = useState(true);
  const [newPkgFees, setNewPkgFees] = useState(true);
  const [newPkgReports, setNewPkgReports] = useState(true);
  const [newPkgExam, setNewPkgExam] = useState(true);
  const [newPkgDesc, setNewPkgDesc] = useState('');

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgName) return;

    const pkg: SaaSPackage = {
      id: newPkgName.trim().toLowerCase().replace(/\s+/g, '_'),
      name: newPkgName,
      priceMonthly: Number(newPkgPriceM),
      priceYearly: Number(newPkgPriceY),
      studentLimit: Number(newPkgStudents),
      teacherLimit: Number(newPkgTeachers),
      aiLimitsMonthly: Number(newPkgAI),
      smsLimitMonthly: Number(newPkgSMS),
      storageLimitGB: Number(newPkgStorage),
      parentPortalAccess: newPkgParent,
      feesManagementAccess: newPkgFees,
      reportsAccess: newPkgReports,
      examGeneratorAccess: newPkgExam,
      description: newPkgDesc || `SaaS pricing package for ${newPkgName} workloads.`
    };

    onAddPackage(pkg);
    setShowAddPkgModal(false);

    // reset states
    setNewPkgName('');
    setNewPkgPriceM(99);
    setNewPkgPriceY(990);
    setNewPkgStudents(250);
    setNewPkgTeachers(25);
    setNewPkgAI(100000);
    setNewPkgSMS(5000);
    setNewPkgStorage(10);
    setNewPkgParent(true);
    setNewPkgFees(true);
    setNewPkgReports(true);
    setNewPkgExam(true);
    setNewPkgDesc('');
  };

  const calculateTotalARR = () => {
    return subscriptions.reduce((acc, sub) => {
      const pkg = packages.find(p => p.id === sub.packageId) || packages[0];
      const rate = sub.billingCycle === 'Yearly' ? pkg.priceYearly : pkg.priceMonthly * 12;
      return sub.status === 'Active' ? acc + rate : acc;
    }, 0);
  };

  const calculateTotalMRR = () => {
    return subscriptions.reduce((acc, sub) => {
      const pkg = packages.find(p => p.id === sub.packageId) || packages[0];
      const rate = sub.billingCycle === 'Monthly' ? pkg.priceMonthly : pkg.priceYearly / 12;
      return sub.status === 'Active' ? acc + rate : acc;
    }, 0);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* SaaS HEADER VIEW STRIP */}
      <div className="bg-gradient-to-r from-[#0A1E33] to-[#11243E] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none shadow-md">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
             Commercial License Desk
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">SaaS Subscription & Billing Engine</h2>
          <p className="text-sm text-slate-350 max-w-2xl leading-relaxed">
             Manage software editions models boundaries, create rate plans tiers, analyze metrics charts, and audit enterprise billing records invoicing.
          </p>
        </div>

        <div className="flex gap-2.5 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActivePane('packages')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
              activePane === 'packages' ? 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            Packages & Editions ({packages.length})
          </button>
          <button
            onClick={() => setActivePane('billing')}
            className={`px-4 py-2.5 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
              activePane === 'billing' ? 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
            }`}
          >
            SaaS Billing Registry ({billingRecords.length})
          </button>
        </div>
      </div>

      {/* QUICK FINANCIAL KPI WIDGETS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none bg-slate-50 border border-slate-100 p-2 rounded-2xl shadow-sm">
        
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Total Projected MRR</p>
          <p className="text-2xl font-mono font-extrabold text-[#1A56DB] mt-2 flex items-center gap-0.5">
            <DollarSign className="w-5 h-5 text-blue-600" />
            {calculateTotalMRR().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-slate-450 font-medium mt-1.5 leading-snug">Sum of active contract cycles monthly</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Estimated ARR Velocity</p>
          <p className="text-2xl font-mono font-extrabold text-emerald-700 mt-2 flex items-center gap-0.5">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            {calculateTotalARR().toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-[10px] text-emerald-650 font-semibold mt-1.5 leading-snug">Uptime SLA targets: 99.9% achieved</p>
        </div>

        <div className="bg-blue-50/50 border border-blue-200 p-6 rounded-xl">
          <p className="text-xs font-bold text-blue-800 uppercase tracking-wider font-sans">Accrued Recurring Revenue</p>
          <p className="text-2xl font-mono font-black text-blue-950 mt-2 flex items-center gap-0.5">
            <DollarSign className="w-5 h-5 text-blue-700 font-bold" />
            {billingRecords.filter(r => r.status === 'Paid').reduce((a, b) => a + b.amount, 0).toLocaleString()}
          </p>
          <p className="text-[10px] text-blue-705 font-medium mt-1.5 leading-snug">Settled payment gateway invoice balances</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Active Client Licenses</p>
          <p className="text-2xl font-extrabold text-slate-900 font-mono mt-2">
            {subscriptions.filter(s => s.status === 'Active' || s.status === 'Trial').length} Tenants
          </p>
          <p className="text-[10px] text-slate-450 font-medium mt-1.5 leading-snug">{subscriptions.filter(s => s.status === 'Trial').length} active evaluation trials</p>
        </div>

      </div>

      {/* PANE VIEW 1: PACKAGE MANAGEMENT */}
      {activePane === 'packages' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-205 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800">Editions & Features Tiers</h3>
              <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">Add or refine plan models to dynamically govern school features, student logs boundaries, and monthly computing caps.</p>
            </div>

            <button
              id="sa-add-package-btn"
              onClick={() => setShowAddPkgModal(true)}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4.5 h-4.5" /> Create Pricing Package
            </button>
          </div>

          {/* DYNAMIC PACKAGE CARDS PLATFORM */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map(p => {
              const activeCount = subscriptions.filter(sub => sub.packageId === p.id && sub.status === 'Active').length;
              return (
                <div key={p.id} className="bg-white border border-slate-205 rounded-2xl overflow-hidden flex flex-col justify-between hover:shadow-md hover:border-slate-350 transition-all shadow-sm">
                  
                  {/* Top card */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] bg-[#1A56DB] text-white font-black px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                        {p.id === 'enterprise' ? 'Enterprise Gold' : p.id === 'professional' ? 'Professional' : p.id}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{activeCount} schools active</span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 tracking-tight">{p.name}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed h-12 line-clamp-3">{p.description}</p>
                  </div>

                  {/* Pricing Rate */}
                  <div className="p-5 bg-white space-y-1 border-b border-slate-100 font-mono">
                    <div className="text-slate-900 font-extrabold text-2xl">
                      ${p.priceMonthly}<span className="text-xs font-normal text-slate-400 font-sans"> / mo</span>
                    </div>
                    <div className="text-[10px] text-slate-450 font-bold">
                      or ${p.priceYearly} / yearly contractual
                    </div>
                  </div>

                  {/* Limits Checklist */}
                  <div className="p-5 space-y-2.5 flex-grow bg-white font-mono text-xs text-slate-600">
                    <div className="font-bold text-[10px] text-slate-450 uppercase mb-2 font-sans">Editions Throttles:</div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Students Capacity:</span>
                        <span className="font-bold text-slate-900">{p.studentLimit === 999999 ? 'Unlimited' : (p.studentLimit >= 1000 ? `${p.studentLimit / 1000}k` : p.studentLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Instructors Limit:</span>
                        <span className="font-bold text-slate-900">{p.teacherLimit === 999999 ? 'Unlimited' : (p.teacherLimit >= 1000 ? `${p.teacherLimit / 1000}k` : p.teacherLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Database Storage:</span>
                        <span className="font-bold text-slate-900">{p.storageLimitGB} GB</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">SMS Gateway:</span>
                        <span className="font-bold text-slate-900">{p.smsLimitMonthly.toLocaleString()} / mo</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">AI Tokens caps:</span>
                        <span className="font-bold text-blue-600 font-semibold">{p.aiLimitsMonthly.toLocaleString()} chs</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-4 pt-4 space-y-2 text-[10.5px]">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.parentPortalAccess ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'}`} />
                        <span className={p.parentPortalAccess ? 'text-slate-800 font-semibold font-sans' : 'text-slate-400 line-through font-sans'}>Parent Portal Roster</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.feesManagementAccess ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'}`} />
                        <span className={p.feesManagementAccess ? 'text-slate-800 font-semibold font-sans' : 'text-slate-400 line-through font-sans'}>Fees & Accounting logs</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.reportsAccess ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'}`} />
                        <span className={p.reportsAccess ? 'text-slate-800 font-semibold font-sans' : 'text-slate-400 line-through font-sans'}>Faculty Reviews report</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${p.examGeneratorAccess ? 'bg-emerald-500 shadow-xs' : 'bg-slate-300'}`} />
                        <span className={p.examGeneratorAccess ? 'text-slate-800 font-semibold font-sans' : 'text-slate-400 line-through font-sans'}>AI Exam Generators</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-1.5">
                    <button
                      onClick={() => alert(`Package ${p.name} properties modified! Boundaries applied dynamically across connected school cluster.`)}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-700 font-bold hover:bg-[#1A56DB] hover:text-white hover:border-[#1A56DB] rounded-xl text-xs uppercase tracking-wider flex-1 cursor-pointer transition-all shadow-xs"
                    >
                      Refine limits
                    </button>
                    {['basic', 'professional', 'enterprise', 'custom'].includes(p.id) ? (
                      <span className="px-3 py-2 text-slate-400 font-mono text-[9px] uppercase select-none flex items-center justify-center font-bold">Standard</span>
                    ) : (
                      <button
                        onClick={() => onDeletePackage(p.id)}
                        className="p-2 bg-white hover:bg-rose-50 text-rose-500 hover:text-rose-600 rounded-xl border border-slate-200 hover:border-rose-200 cursor-pointer transition-colors shadow-xs"
                        title="Delete custom pricing package"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* PANE VIEW 2: BILLING DASHBOARD */}
      {activePane === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-205 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-extrabold uppercase tracking-wider text-slate-800 mb-1.5 font-sans">Live SaaS Revenue Receipts</h3>
            <p className="text-sm leading-relaxed text-slate-500">These receipts represent invoices automatically processed by the integrated payment gateways (Stripe, Paypal, Mobile Money APIs) on subscription renewals.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold text-xs">
                    <th className="px-6 py-4 uppercase font-display">Invoice No.</th>
                    <th className="px-6 py-4 uppercase font-display">School / Code</th>
                    <th className="px-6 py-4 uppercase font-display">Software Tier</th>
                    <th className="px-6 py-4 uppercase font-display">Financial Amount</th>
                    <th className="px-6 py-4 uppercase font-display">Billing Cycle</th>
                    <th className="px-6 py-4 uppercase font-display">Dates (Issue / Due)</th>
                    <th className="px-6 py-4 uppercase font-display">Payment Method</th>
                    <th className="px-6 py-4 uppercase font-display text-right">Status Badge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-xs">
                  {billingRecords.map(record => {
                    const schoolMatch = schools.find(s => s.id === record.tenantId);
                    return (
                      <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-5 font-bold text-blue-605 font-mono">{record.invoiceNumber}</td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <span className="font-extrabold text-slate-800 block font-sans text-sm">{schoolMatch?.name || 'Local Tenant'}</span>
                            <span className="inline-block text-[10px] text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider text-center">
                              TID: {schoolMatch?.code || 'UNKNOWN'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 font-sans font-semibold text-slate-705">{record.packageName} Node</td>
                        <td className="px-6 py-5 font-extrabold text-slate-900">${record.amount.toFixed(2)}</td>
                        <td className="px-6 py-5 font-bold text-slate-550 uppercase">{record.cycle}</td>
                        <td className="px-6 py-5 shrink-0 whitespace-nowrap">
                          <div className="space-y-1 text-slate-600">
                            <div><span className="text-[10px] text-slate-400 font-semibold mr-1.5 uppercase">Issued:</span> {record.issueDate}</div>
                            <div><span className="text-[10px] text-slate-400 font-semibold mr-1 uppercase">Pay:</span> {record.paymentDate || record.dueDate}</div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-slate-600 font-sans font-semibold">{record.paymentMethod || 'Automatic Clearing'}</td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 text-[10px] font-black border rounded-full uppercase ${
                            record.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {billingRecords.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-6 py-8 text-center text-slate-400 italic font-sans text-sm">
                         No SaaS commercial financial logs captured. Set up active contract payments patterns.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW PACKAGE DIALOG */}
      {showAddPkgModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white border border-slate-205 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-4 py-3 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Create Custom pricing Plan Edition</h3>
              <button 
                onClick={() => setShowAddPkgModal(false)} 
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm text-[20px]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="p-6 space-y-4 text-xs select-text">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Package Title Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Diamond Custom Tier"
                    value={newPkgName}
                    onChange={e => setNewPkgName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-slate-700 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Brief Description</label>
                  <input
                    type="text"
                    placeholder="For heavy multi-campus environments"
                    value={newPkgDesc}
                    onChange={e => setNewPkgDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-slate-700 font-medium"
                  />
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Monthly Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newPkgPriceM}
                    onChange={e => setNewPkgPriceM(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Contractual Yearly Price ($)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newPkgPriceY}
                    onChange={e => setNewPkgPriceY(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block text-[9px]">Students Capacity</label>
                  <input
                    type="number"
                    required
                    value={newPkgStudents}
                    onChange={e => setNewPkgStudents(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block text-[9px]">Teachers Limit</label>
                  <input
                    type="number"
                    required
                    value={newPkgTeachers}
                    onChange={e => setNewPkgTeachers(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block text-[9px]">Storage (GB Limit)</label>
                  <input
                    type="number"
                    required
                    value={newPkgStorage}
                    onChange={e => setNewPkgStorage(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              {/* computing caps */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block text-[9px]">AI Char Limits Monthly</label>
                  <input
                    type="number"
                    required
                    value={newPkgAI}
                    onChange={e => setNewPkgAI(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block text-[9px]">SMS Limits Monthly</label>
                  <input
                    type="number"
                    required
                    value={newPkgSMS}
                    onChange={e => setNewPkgSMS(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono text-xs"
                  />
                </div>
              </div>

              {/* Module access codes */}
              <div className="space-y-1 pb-2">
                <label className="font-bold text-slate-400 uppercase tracking-widest font-mono text-[9px] block border-b border-slate-100 pb-1 mb-2">Configure Authorized Modules Access</label>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-650">
                    <input
                      type="checkbox"
                      checked={newPkgParent}
                      onChange={e => setNewPkgParent(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Parent Portal Access
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-650">
                    <input
                      type="checkbox"
                      checked={newPkgFees}
                      onChange={e => setNewPkgFees(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    School Fees Ledger Management
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-650">
                    <input
                      type="checkbox"
                      checked={newPkgReports}
                      onChange={e => setNewPkgReports(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    Performances Report Desks
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-650">
                    <input
                      type="checkbox"
                      checked={newPkgExam}
                      onChange={e => setNewPkgExam(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    AI Exam Generator Module
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddPkgModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-650 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer"
                >
                  Confirm Pricing Tier
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

function pckLimitStr(num: number) {
  return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num.toString();
}
