/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Trash2,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  TrendingUp,
  Search,
  Filter,
  CreditCard,
  Crown,
  Database
} from 'lucide-react';
import { School, SaaSPackage, TenantCommercialStatus, TenantSubscription } from '../types';

interface SuperAdminTenantViewProps {
  schools: School[];
  onToggleStatus: (schoolId: string) => void;
  onUpdateSchool: (school: School) => void;
  onDeleteSchool: (schoolId: string) => void;
  subscriptions: TenantSubscription[];
  onUpdateSubscription: (sub: TenantSubscription) => void;
  packages: SaaSPackage[];
}

export default function SuperAdminTenantView({
  schools,
  onToggleStatus,
  onUpdateSchool,
  onDeleteSchool,
  subscriptions,
  onUpdateSubscription,
  packages
}: SuperAdminTenantViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedSchoolForEdit, setSelectedSchoolForEdit] = useState<School | null>(null);
  const [selectedSubForEdit, setSelectedSubForEdit] = useState<TenantSubscription | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Filter school database nodes
  const filteredSchools = schools.filter(s => {
    // Look up subscription metadata as well
    const sub = subscriptions.find(sub => sub.tenantId === s.id);
    const subStatus = sub?.status || s.status;
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.adminEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && (subStatus === statusFilter || s.status === statusFilter);
  });

  const getStatusBadge = (status: TenantCommercialStatus | string) => {
    const defaultClasses = "px-2 tracking-wider py-0.5 text-[10px] font-mono font-bold rounded-full uppercase border";
    switch (status) {
      case 'Active':
        return <span className={`${defaultClasses} bg-emerald-50 text-emerald-700 border-emerald-250`}>● Active</span>;
      case 'Trial':
        return <span className={`${defaultClasses} bg-blue-50 text-blue-700 border-blue-250`}>✦ Trial</span>;
      case 'Suspended':
        return <span className={`${defaultClasses} bg-rose-50 text-rose-700 border-rose-250`}>⚙ Suspended</span>;
      case 'Expired':
        return <span className={`${defaultClasses} bg-amber-50 text-amber-700 border-amber-250`}>⏳ Expired</span>;
      case 'Cancelled':
        return <span className={`${defaultClasses} bg-slate-50 text-slate-700 border-slate-250`}>✕ Cancelled</span>;
      case 'Pending Payment':
        return <span className={`${defaultClasses} bg-yellow-50 text-yellow-700 border-yellow-250`}>❑ Pending Pay</span>;
      default:
        return <span className={`${defaultClasses} bg-slate-100 text-slate-700 border-slate-300`}>{status}</span>;
    }
  };

  const handleOpenUpgrade = (school: School) => {
    const sub = subscriptions.find(sb => sb.tenantId === school.id) || {
      id: `sub_${school.id}`,
      tenantId: school.id,
      packageId: 'basic',
      billingCycle: 'Monthly',
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      autoRenew: true,
      studentUsage: school.studentCount || 10,
      teacherUsage: school.teacherCount || 2,
      aiUsageThisMonth: 0,
      smsUsageThisMonth: 0,
      storageUsageGB: 0.1,
      amountPaidAccumulated: 0
    } as TenantSubscription;

    setSelectedSchoolForEdit(school);
    setSelectedSubForEdit(sub);
    setShowUpgradeModal(true);
  };

  const handleSaveUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchoolForEdit || !selectedSubForEdit) return;

    // Save updated school settings
    const targetPackage = packages.find(p => p.id === selectedSubForEdit.packageId);
    onUpdateSchool({
      ...selectedSchoolForEdit,
      subscriptionPackage: (targetPackage?.name || 'Basic') as any,
      status: (selectedSubForEdit.status === 'Active' || selectedSubForEdit.status === 'Trial') ? 'Active' : 'Suspended'
    });

    onUpdateSubscription(selectedSubForEdit);
    setShowUpgradeModal(false);
    setSelectedSchoolForEdit(null);
    setSelectedSubForEdit(null);
  };

  const handleActionClick = (schoolId: string, action: 'suspend' | 'activate' | 'renew' | 'expire') => {
    const sub = subscriptions.find(sb => sb.tenantId === schoolId);
    const sch = schools.find(s => s.id === schoolId);
    if (!sch) return;

    let targetStatus: TenantCommercialStatus = 'Active';
    if (action === 'suspend') targetStatus = 'Suspended';
    if (action === 'expire') targetStatus = 'Expired';
    if (action === 'renew') targetStatus = 'Active';

    if (sub) {
      const updatedSub: TenantSubscription = {
        ...sub,
        status: targetStatus,
        endDate: action === 'renew' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // extend a year
          : sub.endDate
      };
      onUpdateSubscription(updatedSub);
    }

    onUpdateSchool({
      ...sch,
      status: (((targetStatus as string) === 'Active' || (targetStatus as string) === 'Trial') ? 'Active' : 'Suspended') as any
    });
  };

  return (
    <div className="space-y-6">
      
      {/* TENANT BANNER PORTAL HEADER */}
      <div className="bg-gradient-to-r from-[#0A1E33] to-[#11243E] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-md">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-blue-600 select-none text-white px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/30">
              Central SaaS Node Controller
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">Multi-Tenant School Node Directory</h2>
          <p className="text-sm text-slate-350 leading-relaxed max-w-2xl">
             Manage and track micro-school cloud database structures. Upgrade tiers, renew cycles, suspend access keys, and review tenant usages.
          </p>
        </div>
 
        <div className="bg-blue-950/60 border border-blue-500/30 px-4 py-3 rounded-xl text-xs font-mono flex items-center gap-2.5 self-start md:self-auto shrink-0 shadow-sm">
          <Database className="w-4.5 h-4.5 text-blue-400" />
          <span>Multi-Teancy RLS: <span className="text-emerald-400 font-bold">Enforced</span></span>
        </div>
      </div>

      {/* QUICK METRICS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 select-none shadow-sm rounded-2xl bg-slate-50 border border-slate-100 p-2">
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-sans">Trial Accounts</span>
          <span className="text-2xl font-extrabold text-[#1A56DB] font-mono mt-1.5 block">
            {subscriptions.filter(s => s.status === 'Trial').length} Tenants
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-sans">Active Licenses</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono mt-1.5 block">
            {subscriptions.filter(s => s.status === 'Active').length} Live
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-sans">Suspended / Blocked</span>
          <span className="text-2xl font-extrabold text-rose-600 font-mono mt-1.5 block">
            {subscriptions.filter(s => s.status === 'Suspended' || s.status === 'Expired').length} Locked
          </span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block font-sans">Grace Period / Pending</span>
          <span className="text-2xl font-extrabold text-amber-600 font-mono mt-1.5 block">
            {subscriptions.filter(s => s.status === 'Pending Payment').length} Wait
          </span>
        </div>
      </div>

      {/* CONTROL ACTIONS STRIP */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-4 justify-between items-center shadow-sm">
        
        {/* Search */}
        <div className="relative w-full sm:w-80 group">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3 group-focus-within:text-blue-600 transition-colors" />
          <input
            type="text"
            placeholder="Search tenant name or code..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full text-sm pl-11 pr-4 py-3 border border-slate-200 bg-slate-50 hover:bg-slate-100/50 focus:bg-white focus:border-blue-600 rounded-xl outline-none transition-all shadow-sm"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto self-end sm:self-auto shrink-0 py-1">
          <span className="text-sm font-semibold text-slate-500 flex items-center gap-1.5 shrink-0 px-2 select-none">
            <Filter className="w-4 h-4 text-slate-450" /> Filter:
          </span>
          <div className="flex gap-2">
            {['All', 'Active', 'Trial', 'Suspended', 'Expired', 'Pending Payment'].map((t) => (
              <button
                key={t}
                onClick={() => setStatusFilter(t)}
                className={`px-4 py-2 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer ${
                  statusFilter === t
                    ? 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 border border-transparent' 
                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider font-sans">
                <th className="px-6 py-4.5">School Code / Name</th>
                <th className="px-6 py-4.5">Subscription Tier</th>
                <th className="px-6 py-4.5">Commercial Status</th>
                <th className="px-6 py-4.5">Student / Teacher Load</th>
                <th className="px-6 py-4.5">Memory / Storage</th>
                <th className="px-6 py-4.5">License Expiration</th>
                <th className="px-6 py-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {filteredSchools.map(school => {
                const sub = subscriptions.find(sb => sb.tenantId === school.id);
                const subStatus = sub?.status || (school.status === 'Active' ? 'Active' : 'Suspended');
                const pckName = (school.subscriptionPackage as string) || 'Basic';

                // Look up package capabilities to display limits
                const pck = packages.find(p => p.name.toLowerCase() === pckName.toLowerCase()) || packages[0];

                return (
                  <tr key={school.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="font-extrabold text-[15px] text-slate-900 leading-tight">
                          {school.name}
                        </div>
                        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
                          <span className="font-bold text-blue-600 bg-blue-50 border border-blue-105 px-2 py-0.5 rounded-md uppercase tracking-wider text-[10px]">
                            TID: {school.code}
                          </span>
                          <span className="text-slate-500 font-semibold select-all">Admin: {school.adminEmail}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Crown className={`w-4 h-4 ${
                          pckName === 'Enterprise' ? 'text-amber-500 fill-amber-50/20' : pckName === 'Professional' ? 'text-blue-500 fill-blue-50/20' : 'text-slate-400'
                        }`} />
                        <span className="font-bold text-sm text-slate-800">{pckName} Node</span>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="inline-block scale-105">
                        {getStatusBadge(subStatus)}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="font-mono text-xs text-slate-600 font-medium">
                          Students: <span className="font-bold text-slate-900">{sub?.studentUsage || school.studentCount || 0}</span> / {pck.studentLimit === 999999 ? 'Unlimited' : pck.studentLimit}
                        </div>
                        <div className="font-mono text-xs text-slate-650 font-medium">
                          Teachers: <span className="font-bold text-slate-900">{sub?.teacherUsage || school.teacherCount || 0}</span> / {pck.teacherLimit === 999999 ? 'Unlimited' : pck.teacherLimit}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <div className="space-y-1.5">
                        <div className="font-mono text-xs text-slate-605">
                          Storage: <span className="font-bold text-slate-900">{(sub?.storageUsageGB || 0.1).toFixed(2)} GB</span> / {pck.storageLimitGB} GB
                        </div>
                        <div className="font-mono text-xs text-slate-605">
                          AI: <span className="font-bold text-slate-900">{(sub?.aiUsageThisMonth || 0).toLocaleString()} chars</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-5 font-mono text-xs text-slate-700">
                      {sub?.endDate ? (
                        <div className="space-y-1">
                          <span className="font-bold text-slate-800">{new Date(sub.endDate).toLocaleDateString()}</span>
                          <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                            {sub.billingCycle} Renewal
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Not established</span>
                      )}
                    </td>

                    <td className="px-6 py-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => handleOpenUpgrade(school)}
                        className="px-3.5 py-2 cursor-pointer bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-350 rounded-xl font-bold font-sans text-xs transition-colors shadow-xs"
                        title="Configure Subscription Package Plan & cycle"
                      >
                        Plan / Upgrade
                      </button>

                      {subStatus === 'Active' || subStatus === 'Trial' ? (
                        <button
                          onClick={() => handleActionClick(school.id, 'suspend')}
                          className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-200 hover:border-rose-300 font-bold font-sans text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs"
                          title="Suspend Tenant Database Core"
                        >
                          <PauseCircle className="w-4 h-4" /> Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActionClick(school.id, 'activate')}
                          className="px-3.5 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-emerald-200 hover:border-emerald-300 font-bold font-sans text-xs cursor-pointer transition-colors inline-flex items-center gap-1.5 shadow-xs"
                          title="Revoke Suspension & Activate Tenant"
                        >
                          <PlayCircle className="w-4 h-4" /> Activate
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`CRITICAL DESTRUCTION COMMAND: Are you sure you want to permanently wipe the database registry and container namespaces for ${school.name}? This is irreversible.`)) {
                            onDeleteSchool(school.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-xl inline-flex items-center justify-center cursor-pointer transition-colors"
                        title="Fully delete school micro-tenant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredSchools.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic font-medium">
                     No tenant database matches filters found. Open Deploy School Node to compile a new cluster.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PLAN CONFIGURATION MODAL */}
      {showUpgradeModal && selectedSchoolForEdit && selectedSubForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-205 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Crown className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Configure Plan: {selectedSchoolForEdit.name}</h3>
              </div>
              <button 
                onClick={() => setShowUpgradeModal(false)} 
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUpgrade} className="p-6 space-y-4 text-xs select-text">
              
              {/* Package Select */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Commercial Package Plan</label>
                <div className="grid grid-cols-2 gap-2">
                  {packages.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setSelectedSubForEdit({ ...selectedSubForEdit, packageId: p.id })}
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedSubForEdit.packageId === p.id 
                          ? 'border-[#1A56DB] bg-[#1A56DB]/5 shadow0-sm' 
                          : 'border-slate-200 hover:border-slate-350'
                      }`}
                    >
                      <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                        <Crown className={`w-3.5 h-3.5 ${
                          p.id === 'enterprise' ? 'text-amber-500' : p.id === 'professional' ? 'text-blue-500' : 'text-slate-400'
                        }`} />
                        {p.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">${p.priceMonthly}/mo • ${p.priceYearly}/yr</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Select */}
              <div className="space-y-1">
                <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Tenant Status Status</label>
                <select
                  value={selectedSubForEdit.status}
                  onChange={e => setSelectedSubForEdit({ ...selectedSubForEdit, status: e.target.value as any })}
                  className="w-full px-3 py-2 border border-slate-200 rounded font-mono bg-white"
                >
                  <option value="Active">Active (Durable Full Queries)</option>
                  <option value="Trial">Trial (Durable Full Queries - Zero fees)</option>
                  <option value="Pending Payment">Pending Payment (Grace Period Warn)</option>
                  <option value="Expired">Expired (Access Blocked notice)</option>
                  <option value="Suspended">Suspended (Access Blocked notice)</option>
                  <option value="Cancelled">Cancelled (Clean namespace standby)</option>
                </select>
              </div>

              {/* Billing Cycle */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Billing Cycle</label>
                  <select
                    value={selectedSubForEdit.billingCycle}
                    onChange={e => setSelectedSubForEdit({ ...selectedSubForEdit, billingCycle: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-slate-700 bg-white"
                  >
                    <option value="Monthly">Monthly Cycle</option>
                    <option value="Yearly">Yearly Cycle</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-500 uppercase tracking-widest font-mono block">Contract End Date</label>
                  <input
                    type="date"
                    required
                    value={selectedSubForEdit.endDate}
                    onChange={e => setSelectedSubForEdit({ ...selectedSubForEdit, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              {/* Package limit indicators */}
              {(() => {
                const activePack = packages.find(p => p.id === selectedSubForEdit.packageId);
                if (!activePack) return null;
                return (
                  <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1.5 font-mono text-[10px] text-slate-500">
                    <div className="font-bold text-slate-700 uppercase">Package Capabilities:</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <span>• Students: <strong className="text-slate-800">{activePack.studentLimit === 999999 ? 'Unlimited' : activePack.studentLimit}</strong></span>
                      <span>• Teachers: <strong className="text-slate-800">{activePack.teacherLimit === 999999 ? 'Unlimited' : activePack.teacherLimit}</strong></span>
                      <span>• Storage: <strong className="text-slate-800">{activePack.storageLimitGB} GB</strong></span>
                      <span>• SMS Limit: <strong className="text-slate-800">{activePack.smsLimitMonthly} / mo</strong></span>
                      <span>• AI Usage Limit: <strong className="text-slate-800">{activePack.aiLimitsMonthly} chars</strong></span>
                      <span>• Parent Portal: <strong className="text-slate-800">{activePack.parentPortalAccess ? 'Yes' : 'No'}</strong></span>
                      <span>• Fee Manager: <strong className="text-slate-800">{activePack.feesManagementAccess ? 'Yes' : 'No'}</strong></span>
                      <span>• Reports Desk: <strong className="text-slate-800">{activePack.reportsAccess ? 'Yes' : 'No'}</strong></span>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-3 py-2 border border-slate-200 text-slate-650 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold cursor-pointer text-xs flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Save Package Protocols
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
