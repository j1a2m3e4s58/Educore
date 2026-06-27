/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  History, 
  ShieldAlert, 
  Lock, 
  Key, 
  UserX, 
  Monitor, 
  Globe, 
  Activity, 
  Search, 
  Filter, 
  RefreshCw, 
  ShieldCheck, 
  Sliders,
  Smartphone,
  Eye,
  Settings
} from 'lucide-react';
import { AuditLog, SecurityPolicy, LoginHistory, School } from '../types';

interface SuperAdminAuditViewProps {
  auditLogs: AuditLog[];
  onClearLogs?: () => void;
  loginHistory: LoginHistory[];
  securityPolicy: SecurityPolicy;
  onUpdatePolicy: (policy: SecurityPolicy) => void;
  schools: School[];
}

export default function SuperAdminAuditView({
  auditLogs,
  onClearLogs,
  loginHistory,
  securityPolicy,
  onUpdatePolicy,
  schools
}: SuperAdminAuditViewProps) {
  const [activeTab, setActiveTab] = useState<'audit-logs' | 'security' | 'login-history'>('audit-logs');
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('All');

  // Multi-tenant selection log search
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (moduleFilter === 'All') return matchesSearch;
    return matchesSearch && log.module === moduleFilter;
  });

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'info': return 'text-blue-600 bg-blue-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'success': return 'text-emerald-600 bg-emerald-50';
      case 'error': return 'text-rose-600 bg-rose-50';
      default: return 'text-slate-600 bg-slate-105';
    }
  };

  const handleUpdatePolicy = (field: keyof SecurityPolicy, value: any) => {
    onUpdatePolicy({
      ...securityPolicy,
      [field]: value
    });
  };

  return (
    <div className="space-y-6 select-text animate-in fade-in duration-150">
      
      {/* SHIELD HEADER FRAME */}
      <div className="bg-[#031525] text-white p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono font-bold bg-[#1A56DB] text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
             Cyber Security & Audit Command Center
          </span>
          <h3 className="text-base font-extrabold text-white tracking-tight">System Compliance & Security Panels</h3>
          <p className="text-xs text-slate-400">
             Audit log records indexes for strict multi-tenant row-isolation, enforce IAM password protocols, track live session devices, and examine logging IPs.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded text-[11px] font-mono flex items-center gap-1.5 self-start md:self-auto">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-bold">Audit Encryption: AES_256 Active</span>
        </div>
      </div>

      {/* SUB PANELS TOGGLES */}
      <div className="border-b border-slate-200 flex gap-2 overflow-x-auto select-none">
        <button
          onClick={() => setActiveTab('audit-logs')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'audit-logs' 
              ? 'border-blue-600 text-blue-600 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> System Audit Trail ({filteredLogs.length})
          </span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security' 
              ? 'border-blue-600 text-blue-600 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Global Access & Policy Rules
          </span>
        </button>

        <button
          onClick={() => setActiveTab('login-history')}
          className={`pb-2.5 px-3.5 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'login-history' 
              ? 'border-blue-600 text-blue-600 font-extrabold' 
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" /> Authentication Session logs
          </span>
        </button>
      </div>

      {/* VIEW Tab 1: AUDIT TRAILS */}
      {activeTab === 'audit-logs' && (
        <div className="space-y-4">
          
          <div className="bg-white rounded-lg border border-slate-200 p-4 flex flex-col sm:flex-row gap-3 justify-between items-center select-none">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail logs..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded outline-none"
              />
            </div>

            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto shrink-0 select-none">
              <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0 px-2">
                <Filter className="w-3.5 h-3.5" /> Filter Category:
              </span>
              {['All', 'Auth', 'Tenant', 'Academic', 'AI', 'Financial', 'System'].map((t) => (
                <button
                  key={t}
                  onClick={() => setModuleFilter(t)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded shrink-0 transition-colors cursor-pointer ${
                    moduleFilter === t
                      ? 'bg-blue-600 text-white font-bold' 
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-[11.5px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                    <th className="p-3">Logged Date / Time</th>
                    <th className="p-3">Secure Tenant</th>
                    <th className="p-3">User Subject</th>
                    <th className="p-3">System Module</th>
                    <th className="p-3">Core Action</th>
                    <th className="p-3">Action Details</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">User Device Node</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono text-slate-650">
                  {filteredLogs.map(log => {
                    const schoolMatch = schools.find(s => s.id === log.tenantId);
                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40">
                        <td className="p-3 text-slate-500 font-bold">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3 font-sans">
                          {log.tenantId === 'GLOBAL' ? (
                            <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-150 rounded text-indigo-700 font-bold text-[8.5px] uppercase">
                              SYSTEM_CLUSTER
                            </span>
                          ) : (
                            <div>
                              <span className="font-bold text-slate-800 text-[11px]">{schoolMatch?.name || 'Local Tenant'}</span>
                              <span className="block text-[8px] text-blue-500 select-all">TID: {schoolMatch?.code || log.tenantId}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5 font-sans">
                            <div className="font-bold text-slate-800">{log.userName}</div>
                            <div className="text-[9.5px] text-slate-400 font-mono select-all leading-tight">{log.userEmail} ({log.userRole})</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 border text-[9px] font-bold rounded uppercase bg-slate-50 border-slate-200 text-slate-600">
                            {log.module}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-900 font-sans">
                          {log.action}
                        </td>
                        <td className="p-3 font-sans text-slate-500 max-w-xs leading-normal select-all">
                          {log.details}
                        </td>
                        <td className="p-3 text-[#1A56DB] font-bold select-all">
                          {log.ipAddress}
                        </td>
                        <td className="p-3 text-slate-400 text-[10px] truncate max-w-[120px]" title={log.device}>
                          {log.device}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-450 italic font-sans font-medium">
                         No audit timeline blocks recorded meeting selection variables.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* VIEW Tab 2: POLICY SETTINGS */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* STRENGH CRITERIA & CONTROLS */}
          <div className="md:col-span-2 bg-white rounded-lg border border-slate-200 p-5 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" /> Password Credentials & Brute mitigation rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
              <div className="space-y-1">
                <label className="text-slate-450 block uppercase tracking-wide font-mono text-[10px]">Minimum Password Length</label>
                <div className="flex items-center gap-3 mt-1.5">
                  <input
                    type="range"
                    min={6}
                    max={20}
                    value={securityPolicy.minPasswordLength}
                    onChange={e => handleUpdatePolicy('minPasswordLength', Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-800 font-black shrink-0">{securityPolicy.minPasswordLength} characters</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityPolicy.requireLetters}
                    onChange={e => handleUpdatePolicy('requireLetters', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Enforce Letter character presence (a-z)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityPolicy.requireNumbers}
                    onChange={e => handleUpdatePolicy('requireNumbers', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Require Numerical numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={securityPolicy.requireSpecialChars}
                    onChange={e => handleUpdatePolicy('requireSpecialChars', e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Require ASCII Special symbols (@#$%^&*)</span>
                </label>
              </div>
            </div>

            <div className="border-t border-slate-150 pt-5 space-y-4">
              <h4 className="text-[11px] font-bold uppercase font-mono text-slate-500 tracking-wider">Account Lockout & Sessions Timeouts</h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-400 block font-mono text-[9px] uppercase">Max Consecutive Failures</label>
                  <select
                    value={securityPolicy.maxFailedLogins}
                    onChange={e => handleUpdatePolicy('maxFailedLogins', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono font-medium text-xs bg-white"
                  >
                    <option value={3}>3 Failed Attempts</option>
                    <option value={5}>5 Failed Attempts</option>
                    <option value={10}>10 Failed Attempts</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-mono text-[9px] uppercase">Lockout Duration</label>
                  <select
                    value={securityPolicy.lockoutDurationMinutes}
                    onChange={e => handleUpdatePolicy('lockoutDurationMinutes', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono font-medium text-xs bg-white"
                  >
                    <option value={5}>5 Minutes Lock</option>
                    <option value={15}>15 Minutes Lock</option>
                    <option value={30}>30 Minutes Lock</option>
                    <option value={60}>60 Minutes Lock</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-400 block font-mono text-[9px] uppercase">Idle Session Expiry</label>
                  <select
                    value={securityPolicy.sessionTimeoutMinutes}
                    onChange={e => handleUpdatePolicy('sessionTimeoutMinutes', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded font-mono font-medium text-xs bg-white"
                  >
                    <option value={15}>15 Minutes IDLE</option>
                    <option value={30}>30 Minutes IDLE</option>
                    <option value={60}>60 Minutes IDLE</option>
                    <option value={120}>120 Minutes IDLE</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-150 pt-5 space-y-4">
              <h4 className="text-[11px] font-bold uppercase font-mono text-slate-500 tracking-wider">Multi-Factor Authentication (MFA / 2FA)</h4>
              
              <div className="flex items-center justify-between gap-4 p-4 rounded bg-slate-50 border border-slate-150 text-[11.5px] leading-relaxed">
                <div>
                  <span className="font-extrabold text-slate-900 block mb-0.5">Two-Factor Authenticator Gate</span>
                  <p className="text-slate-500">Require secondary authenticator checks on secure login terminals. Dispatches dynamic push notifications.</p>
                </div>

                <select
                  value={securityPolicy.twoFactorAuth}
                  onChange={e => handleUpdatePolicy('twoFactorAuth', e.target.value as any)}
                  className="px-3 py-2 border border-slate-205 rounded font-mono bg-white text-xs font-bold"
                >
                  <option value="Disabled">MFA Blocked (Disabled)</option>
                  <option value="Optional">Optional (User Selected)</option>
                  <option value="Mandatory">Mandatory Enforcement</option>
                </select>
              </div>
            </div>

          </div>

          {/* SECURITY NOTIFICATIONS alerts */}
          <div className="md:col-span-1 bg-white rounded-lg border border-slate-200 p-5 space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 flex items-center gap-2 select-none">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Global Security State
            </h3>

            {/* failed login warn strip */}
            <div className="p-3.5 bg-rose-50 border border-rose-150 rounded leading-normal text-rose-800 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" /> FAILED_LOGIN_ALARM
              </div>
              <p className="text-[10px] text-rose-700">Audit captures 2 sequential failed credentials attempts from untracked IP: <span className="font-mono bg-white font-black px-1 py-0.5 rounded text-slate-905 select-all">195.120.45.6</span>.</p>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="flex items-center justify-between p-2 border border-slate-150 rounded bg-slate-50/50">
                <span className="text-slate-500">SSL Certificate Status</span>
                <span className="font-mono text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Strong 256bit</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-slate-150 rounded bg-slate-50/50">
                <span className="text-slate-500">Row-SQL isolation checks</span>
                <span className="font-mono text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-bold uppercase">Cleared</span>
              </div>
              <div className="flex items-center justify-between p-2 border border-slate-150 rounded bg-slate-50/50">
                <span className="text-slate-500">API Throttling Limits</span>
                <span className="font-mono text-[9px] bg-[#1A56DB] text-white px-1.5 py-0.5 rounded font-bold uppercase">1k RPM / Node</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-150">
              <button
                onClick={() => alert(`Global IAM protocols updated. Cluster configurations deployed to client modules.`)}
                className="w-full text-center py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-extrabold text-xs cursor-pointer shadow"
              >
                Apply Cluster Guard Policy
              </button>
            </div>
          </div>

        </div>
      )}

      {/* VIEW Tab 3: LOGIN HISTORIES */}
      {activeTab === 'login-history' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-lg border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Terminal Authentication Journals</h3>
            <p className="text-[11px] text-slate-400">Verifiable logging registries mapping active sessions credentials attempts, hardware devices, and origin networks across the cluster.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                    <th className="p-3.5">Auth DateTime</th>
                    <th className="p-3.5">User Identity</th>
                    <th className="p-3.5">Account Role</th>
                    <th className="p-3.5">Local Tenant Code</th>
                    <th className="p-3.5">IP origin</th>
                    <th className="p-3.5">Browser Client</th>
                    <th className="p-3.5">Node Device</th>
                    <th className="p-3.5 text-right">Gate Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono text-[11px] text-slate-650">
                  {loginHistory.map(hist => {
                    const sch = schools.find(s => s.id === hist.tenantId);
                    return (
                      <tr key={hist.id} className="hover:bg-slate-50/40">
                        <td className="p-3.5 text-slate-500 font-bold">
                          {new Date(hist.timestamp).toLocaleString()}
                        </td>
                        <td className="p-3.5">
                          <div className="font-sans">
                            <span className="font-bold text-slate-900 block">{hist.userName}</span>
                            <span className="text-[9.5px] text-slate-400 select-all">{hist.userEmail}</span>
                          </div>
                        </td>
                        <td className="p-3.5 font-sans font-medium text-slate-700">{hist.role}</td>
                        <td className="p-3.5 whitespace-nowrap">
                          {sch ? (
                            <span className="px-1.5 py-0.5 bg-blue-50 border border-blue-150 font-bold rounded text-blue-700 text-[10px] uppercase font-mono">
                              {sch.code}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-500 text-[10px] uppercase font-mono">
                              GLOBAL
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 text-[#1A56DB] font-extrabold select-all">{hist.ipAddress}</td>
                        <td className="p-3.5">{hist.browser}</td>
                        <td className="p-3.5 truncate max-w-[120px]" title={hist.device}>{hist.device}</td>
                        <td className="p-3.5 text-right font-sans">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black border rounded-full uppercase ${
                            hist.status === 'Success' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-semibold' 
                              : 'bg-rose-50 text-rose-700 border-rose-250 font-semibold'
                          }`}>
                            {hist.status === 'Success' ? '✓ OK' : hist.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
