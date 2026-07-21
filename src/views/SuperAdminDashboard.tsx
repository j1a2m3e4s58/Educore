/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle, 
  AlertOctagon, 
  TrendingUp, 
  Activity, 
  Database, 
  UserCheck, 
  ShieldCheck, 
  PlusCircle, 
  Sliders, 
  History, 
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { School, User, ActivityLog } from '../types';
import StatCard from '../components/StatCard';

interface SuperAdminDashboardProps {
  schools: School[];
  users: User[];
  activityLogs: ActivityLog[];
  onTriggerAction: (actionName: string) => void;
  setActiveTab: (tab: string) => void;
  simpleMode?: boolean;
}

export default function SuperAdminDashboard({
  schools,
  users,
  activityLogs,
  onTriggerAction,
  setActiveTab,
  simpleMode = true
}: SuperAdminDashboardProps) {
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Compute live aggregates matching dynamic registers
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'Active').length;
  const suspendedSchools = schools.filter(s => s.status === 'Suspended').length;
  const systemUsers = users.length;

  const handleRefreshSimulation = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onTriggerAction('Main Registry Index Synced');
    }, 800);
  };

  return (
    <div className="super-admin-dashboard-page space-y-4 sm:space-y-6 font-sans select-none animate-in fade-in duration-300 max-w-full">
      
      {/* MONOTONE WELCOME BOX */}
      <div className="role-hero role-hero-super bg-[#0A1E33] sm:bg-white rounded-2xl sm:rounded-lg border border-[#163554] sm:border-slate-200 p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5 shadow-lg shadow-slate-900/10 sm:shadow-sm relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-500/20 blur-2xl sm:hidden" />
        <div className="space-y-2 min-w-0">
          <div className="flex items-center gap-2 sm:hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
            <span className="text-[10px] font-mono font-bold text-blue-100 uppercase tracking-wide">{simpleMode ? 'Live System' : 'Live Cluster'}</span>
          </div>
          <h2 className="text-[1.65rem] sm:text-3xl font-extrabold text-white sm:text-slate-950 tracking-tight font-display leading-tight">
             {simpleMode ? 'Main Dashboard' : 'Central Control Console'}
          </h2>
          <p className="text-[13px] sm:text-sm text-blue-100/80 sm:text-slate-500 max-w-3xl leading-relaxed">
             {simpleMode
               ? 'Manage schools, users, payments, messages, and settings from one place.'
               : 'EduCore Grid global multi-tenant cluster dashboard. Real-time status monitored at'} {!simpleMode && <span className="inline-flex max-w-full align-baseline font-mono text-blue-100 sm:text-blue-600 bg-white/10 sm:bg-blue-50/70 border border-white/10 sm:border-blue-100 px-2 py-0.5 rounded text-[11px] sm:text-xs select-all break-all">cloud.educore.ai:3000</span>}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-2 sm:hidden">
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="text-[10px] text-blue-100/70 font-mono">{simpleMode ? 'Schools' : 'Tenants'}</p>
              <p className="text-lg font-black text-white leading-tight">{totalSchools}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="text-[10px] text-blue-100/70 font-mono">Active</p>
              <p className="text-lg font-black text-emerald-300 leading-tight">{activeSchools}</p>
            </div>
            <div className="rounded-xl bg-white/10 border border-white/10 px-3 py-2">
              <p className="text-[10px] text-blue-100/70 font-mono">Users</p>
              <p className="text-lg font-black text-white leading-tight">{systemUsers}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <button
            id="super-admin-refresh"
            onClick={handleRefreshSimulation}
            disabled={isRefreshing}
            className="w-11 h-11 sm:w-auto sm:h-auto sm:p-3 bg-white/10 sm:bg-slate-50 hover:bg-white/15 sm:hover:bg-slate-100 border border-white/15 sm:border-slate-200 rounded-xl sm:rounded-lg text-white sm:text-slate-600 flex items-center justify-center cursor-pointer transition-all active:scale-95 duration-200 shrink-0"
            title="Refresh database index registers"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            id="super-admin-deploy"
            onClick={() => setActiveTab('register')}
            className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-3 bg-white sm:bg-[#1A56DB] hover:bg-blue-50 sm:hover:bg-blue-750 text-[#0A1E33] sm:text-white rounded-xl sm:rounded-lg text-sm font-bold sm:font-semibold flex items-center gap-2.5 shadow-md shadow-blue-500/20 cursor-pointer transition-all duration-200 active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>{simpleMode ? 'Add School' : 'Deploy School Node'}</span>
          </button>
        </div>
      </div>

      {simpleMode && (
        <div className="role-action-grid grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add School', hint: 'Register a new school', tab: 'register', icon: PlusCircle, color: 'text-blue-700 bg-blue-50 border-blue-100' },
            { label: 'All Schools', hint: 'View and manage schools', tab: 'schools', icon: Building2, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
            { label: 'Users', hint: 'Manage people and access', tab: 'roles', icon: UserCheck, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
            { label: 'Settings', hint: 'Change system setup', tab: 'settings', icon: Sliders, color: 'text-amber-700 bg-amber-50 border-amber-100' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.tab}
                onClick={() => setActiveTab(action.tab)}
                className="bg-white rounded-2xl sm:rounded-xl border border-slate-200 p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span className={`w-11 h-11 rounded-2xl border flex items-center justify-center mb-3 ${action.color}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <span className="block text-sm font-black text-slate-900">{action.label}</span>
                <span className="block text-[11px] text-slate-500 mt-1 leading-snug">{action.hint}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* KPI STAT CARDS ROW */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={simpleMode ? 'Schools' : 'Total Registered Tenants'}
          value={totalSchools}
          icon={Building2}
          iconBg="bg-blue-50 text-[#1A56DB]"
          iconColor="#1A56DB"
          trend={{ value: '+12%', isPositive: true, label: simpleMode ? 'growth' : 'vs last term' }}
        />
        <StatCard
          title={simpleMode ? 'Active Schools' : 'Active Server Sites'}
          value={activeSchools}
          icon={CheckCircle}
          iconBg="bg-emerald-50 text-emerald-600"
          iconColor="#10B981"
          trend={{ value: simpleMode ? 'Online' : '100% Up', isPositive: true, label: simpleMode ? 'working now' : 'Cluster SLA' }}
        />
        <StatCard
          title={simpleMode ? 'Need Attention' : 'Suspended Core Nodes'}
          value={suspendedSchools}
          icon={AlertOctagon}
          iconBg="bg-rose-50 text-rose-600"
          iconColor="#EF4444"
          trend={{ value: simpleMode ? `${suspendedSchools} school` : `${suspendedSchools} Node`, isPositive: suspendedSchools === 0, label: simpleMode ? 'requires action' : 'Requires Action' }}
        />
        <StatCard
          title={simpleMode ? 'Users' : 'System IAM Users'}
          value={systemUsers}
          icon={UserCheck}
          iconBg="bg-indigo-50 text-indigo-600"
          iconColor="#6366F1"
          trend={{ value: simpleMode ? '+45' : '+45 accounts', isPositive: true, label: simpleMode ? 'people added' : 'across nodes' }}
        />
      </div>

      {/* GRID: ANALYTICS SVG CHART & QUICK ACTIONS */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        
        {/* INTERACTIVE COMPACT REGISTRATION MONTHLY CHART */}
        <div className="xl:col-span-2 bg-white rounded-xl sm:rounded-lg border border-slate-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-[13px] sm:text-sm font-bold uppercase tracking-wide text-slate-800 font-display">{simpleMode ? 'School Growth' : 'Live Workspace Allocation Metrics'}</h3>
              <p className="text-xs text-slate-405 mt-1">{simpleMode ? 'How schools are being added over time' : 'Deployed instances over last trimester scale'}</p>
            </div>
            <span className="text-[10px] bg-slate-50 border border-slate-100 px-3 py-1 rounded-full text-slate-600 font-mono font-bold tracking-wide self-start sm:self-auto">{simpleMode ? 'LIVE' : 'LIVE METRIC'}</span>
          </div>

          {/* CUSTOM HIGH-FIDELITY RESPONSIVE SVG GRAPH */}
          <div className="h-44 sm:h-56 my-5 sm:my-6 flex items-end justify-between relative px-1 sm:px-2">
            
            {/* Background horizontal banking divider lines */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-slate-100" />
            <div className="absolute inset-x-0 bottom-14 h-px bg-slate-100" />
            <div className="absolute inset-x-0 bottom-28 h-px bg-slate-100/70" />
            <div className="absolute inset-x-0 bottom-42 h-px bg-slate-100/40" />

            {/* Glowing SVG Curve */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1A56DB" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#1A56DB" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              
              {/* Line path mapping points */}
              <path
                d="M 10,150 C 50,130 110,145 150,105 C 190,70 250,90 300,65 C 350,35 400,45 450,25 L 450,224 L 10,224 Z"
                fill="url(#chartGradient)"
              />
              
              <path
                d="M 10,150 C 50,130 110,145 150,105 C 190,70 250,90 300,65 C 350,35 400,45 450,25"
                fill="none"
                stroke="#1A56DB"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Data points */}
              <circle cx="150" cy="105" r="5" fill="#1A56DB" stroke="white" strokeWidth="2" />
              <circle cx="300" cy="65" r="5" fill="#1A56DB" stroke="white" strokeWidth="2" />
              <circle cx="450" cy="25" r="5" fill="#1A56DB" stroke="white" strokeWidth="2" />
            </svg>

            {/* Simulated bar nodes */}
            <div className="flex flex-col items-center z-10 w-full text-center group/bar">
              <span className="text-[10px] font-mono font-bold text-slate-500 group-hover/bar:text-blue-600 transition-colors">CC-01</span>
              <div className="h-10 sm:h-12 w-4 sm:w-6 bg-blue-500/10 hover:bg-blue-500/20 border-t-2 border-blue-500 transition-all rounded-t mt-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Jan</span>
            </div>
            
            <div className="flex flex-col items-center z-10 w-full text-center group/bar">
              <span className="text-[10px] font-mono font-bold text-slate-500 group-hover/bar:text-blue-600 transition-colors">SJ-02</span>
              <div className="h-20 sm:h-24 w-4 sm:w-6 bg-blue-500/15 hover:bg-blue-500/25 border-t-2 border-blue-500 transition-all rounded-t mt-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Feb</span>
            </div>

            <div className="flex flex-col items-center z-10 w-full text-center group/bar">
              <span className="text-[10px] font-mono font-semibold text-slate-500 group-hover/bar:text-blue-600 transition-colors">AP-03</span>
              <div className="h-14 sm:h-16 w-4 sm:w-6 bg-slate-300/40 hover:bg-slate-300/60 border-t-2 border-slate-400 transition-all rounded-t mt-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Mar</span>
            </div>

            <div className="flex flex-col items-center z-10 w-full text-center group/bar">
              <span className="text-[10px] font-mono font-bold text-indigo-600 group-hover/bar:text-indigo-800 transition-colors">SM-04</span>
              <div className="h-28 sm:h-32 w-4 sm:w-6 bg-blue-500/25 hover:bg-blue-500/35 border-t-2 border-blue-600 transition-all rounded-t mt-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">Apr</span>
            </div>

            <div className="flex flex-col items-center z-10 w-full text-center group/bar">
              <span className="text-[10px] font-mono font-bold text-blue-700 transition-all">Active</span>
              <div className="h-36 sm:h-44 w-4 sm:w-6 bg-blue-600/50 hover:bg-blue-600/65 border-t-2 border-blue-600 transition-all rounded-t mt-1.5" />
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-2">May</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
             <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-emerald-500 shrink-0" /> {simpleMode ? '+24% more schools added' : '+24% registration velocity'}</span>
             <span className="font-mono text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-500">{simpleMode ? 'Updated now' : 'ISO_CLUSTER_MONITOR'}</span>
          </div>
        </div>

        {/* QUICK ACTION BUTTON GRID */}
        <div className="bg-white rounded-xl sm:rounded-lg border border-slate-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-[13px] sm:text-sm font-bold uppercase tracking-wide text-slate-800 font-display">{simpleMode ? 'More Actions' : 'Central Control Shortcuts'}</h3>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
              <button
                id="qa-deploy-node"
                onClick={() => setActiveTab('register')}
                className="p-3 sm:p-3.5 border border-slate-200 hover:border-blue-300 hover:bg-slate-50 flex flex-col items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-lg text-left transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group min-h-[98px] sm:min-h-[108px]"
              >
                <PlusCircle className="w-6 h-6 text-[#1A56DB] transition-transform duration-200 group-hover:scale-110" />
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-[#1A56DB] transition-colors leading-tight block">{simpleMode ? 'Add School' : 'Deploy Node'}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{simpleMode ? 'Create school account' : 'Provision namespace'}</span>
                </div>
              </button>

              <button
                id="qa-schools-audit"
                onClick={() => setActiveTab('schools')}
                className="p-3 sm:p-3.5 border border-slate-200 hover:border-blue-310 hover:bg-slate-50 flex flex-col items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-lg text-left transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group min-h-[98px] sm:min-h-[108px]"
              >
                <Building2 className="w-6 h-6 text-indigo-600 transition-transform duration-200 group-hover:scale-110" />
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight block">{simpleMode ? 'All Schools' : 'School Audit'}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{simpleMode ? 'View school list' : 'Registry / suspensions'}</span>
                </div>
              </button>

              <button
                id="qa-backup-db"
                onClick={() => onTriggerAction('Cloud SQL Incremental Backup Initiated')}
                className="p-3 sm:p-3.5 border border-slate-200 hover:border-blue-320 hover:bg-slate-50 flex flex-col items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-lg text-left transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group min-h-[98px] sm:min-h-[108px]"
              >
                <Database className="w-6 h-6 text-emerald-600 transition-transform duration-200 group-hover:scale-110" />
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight block">{simpleMode ? 'Backup' : 'Server Snap'}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{simpleMode ? 'Save a copy' : 'Instant database snapshot'}</span>
                </div>
              </button>

              <button
                id="qa-plate-config"
                onClick={() => setActiveTab('settings')}
                className="p-3 sm:p-3.5 border border-slate-200 hover:border-blue-300 hover:bg-slate-50 flex flex-col items-start gap-2.5 sm:gap-3 rounded-xl sm:rounded-lg text-left transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer group min-h-[98px] sm:min-h-[108px]"
              >
                <Sliders className="w-6 h-6 text-amber-600 transition-transform duration-200 group-hover:scale-110" />
                <div>
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors leading-tight block">{simpleMode ? 'Settings' : 'Grid Parameters'}</span>
                  <span className="text-[10px] text-slate-400 block mt-1">{simpleMode ? 'Change setup' : 'Throttles & limits'}</span>
                </div>
              </button>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 text-xs rounded-lg space-y-1.5 mt-5 font-sans">
             <div className="font-bold text-slate-700 uppercase flex items-center gap-1">
               <Cpu className="w-3.5 h-3.5 text-[#1A56DB]" /> {simpleMode ? 'System Health:' : 'Server Node Stats:'}
             </div>
             <p className="text-slate-500 leading-relaxed font-semibold">{simpleMode ? 'Schools, users, payments, and messages are available. Backups are running normally.' : 'PostgreSQL cloud-isolated instance partitions running on micro-container architectures. Secure clusters isolated perfectly.'}</p>
          </div>
        </div>

      </div>

      {/* RECENT REGISTRATIONS & GLOBAL AUDIT ACTIVITY TRAIL */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5">
        
        {/* RECENT REGISTERS LIST */}
        <div className="xl:col-span-1 bg-white rounded-xl sm:rounded-lg border border-slate-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 font-display">{simpleMode ? 'New Schools' : 'Recently Enrolled Schools'}</h3>
            <span className="text-[10px] bg-blue-50 text-[#1A56DB] border border-blue-100 font-mono font-bold px-2.5 py-0.5 rounded-full">{simpleMode ? 'NEW' : 'NEWEST'}</span>
          </div>

          <div className="divide-y divide-slate-100 my-4 flex-1">
            {schools.slice(-3).reverse().map((school) => (
              <div key={school.id} className="py-3.5 flex items-center justify-between font-sans">
                <div>
                  <div className="text-sm font-bold text-slate-905 leading-snug">{school.name}</div>
                  <div className="text-[11px] font-mono text-slate-400 mt-1">CODE: {school.code} | {school.subscriptionPackage}</div>
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${
                  school.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </div>
            ))}
          </div>

           <button
            id="view-all-schools-bottom"
            onClick={() => setActiveTab('schools')}
            className="text-center text-sm font-bold text-[#1A56DB] hover:text-blue-800 cursor-pointer pt-4 border-t border-slate-100 mt-2 transition-colors block w-full"
          >
            {simpleMode ? 'View All Schools' : 'Open Institutional Registry'} →
          </button>
        </div>

        {/* CLUSTER SECURITY SERVICE AUDIT LOGS */}
        <div className="xl:col-span-2 bg-white rounded-xl sm:rounded-lg border border-slate-200 p-4 sm:p-6 flex flex-col justify-between shadow-sm">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#1A56DB]" />
              <h3 className="text-[13px] sm:text-sm font-bold uppercase tracking-wide text-slate-800 font-display">{simpleMode ? 'Recent Activity' : 'Central Cluster Audit Trail'}</h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold self-start sm:self-auto">{simpleMode ? 'SAFE' : 'MONITOR SECURE'}</span>
          </div>

          <div className="divide-y divide-slate-100 my-4 font-mono text-xs space-y-3 flex-1 max-h-52 overflow-y-auto">
            {activityLogs.map((log) => (
              <div key={log.id} className="pt-3 flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-3.5 text-slate-650">
                <span className="text-slate-450 font-semibold shrink-0">
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span className="font-bold text-[#1A56DB] shrink-0">
                  {log.user}:
                </span>
                <span className="text-slate-705 flex-1 leading-relaxed">
                  {log.action} — <span className="text-slate-500 italic select-all font-medium text-[11px]">{log.details}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>ROW_LEVEL_SECURITY: ENFORCED (V-GATE MONITOR)</span>
            <span>AUDIT CHUNKS: {activityLogs.length} LOGGED FLAGS</span>
          </div>
        </div>

      </div>

    </div>
  );
}
