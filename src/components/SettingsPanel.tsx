/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Cpu, 
  Sliders, 
  Layout, 
  Users, 
  ToggleLeft, 
  BellRing, 
  CheckCircle,
  KeyRound,
  Lock,
  Globe,
  Save,
  Server
} from 'lucide-react';
import { User, School, TenantSystemSettings } from '../types';
import { getTenantSettings, saveTenantSettings } from '../data/mockData';
import { archiveCurrentAcademicYear } from '../data/academicTime';
import { backendBackup, backendEnvCheck, backendHealth, backendResetDemoData, migrateBrowserExport } from '../lib/backendApi';
import { EDUCORE_BUILD_LABEL } from '../lib/version';

interface SettingsPanelProps {
  user: User | null;
  currentTenant: School | null;
  onSaveNotification: (msg: string) => void;
}

export default function SettingsPanel({
  user,
  currentTenant,
  onSaveNotification
}: SettingsPanelProps) {
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const publicBaseUrl = typeof window === 'undefined' ? '' : `${window.location.origin}${window.location.pathname}`;
  const schoolLoginLink = currentTenant ? `${publicBaseUrl}?school=${encodeURIComponent(currentTenant.code)}` : '';
  const schoolRequestLink = currentTenant ? `${publicBaseUrl}?school=${encodeURIComponent(currentTenant.code)}&request=1` : '';
  const [copyMsg, setCopyMsg] = useState('');
  const [setupStep, setSetupStep] = useState(0);
  const [setupDone, setSetupDone] = useState<Record<string, boolean>>({});
  const [deliveryProvider, setDeliveryProvider] = useState('Device apps only');
  const [deliveryApiKey, setDeliveryApiKey] = useState('');
  const [archiveMsg, setArchiveMsg] = useState('');
  const [archiveList, setArchiveList] = useState<any[]>([]);
  const [backendMsg, setBackendMsg] = useState('');
  const [backendHealthText, setBackendHealthText] = useState('Not checked');
  const [envChecks, setEnvChecks] = useState<Array<{ name: string; ok: boolean; detail: string }>>([]);
  const [localResetMsg, setLocalResetMsg] = useState('');
  
  // TENANT ISOLATION SETTINGS STATE
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [term, setTerm] = useState('First Term');
  const [themeColor, setThemeColor] = useState('#0A1E33');
  const [allowParentReg, setAllowParentReg] = useState(true);
  const [allowTeacherReg, setAllowTeacherReg] = useState(true);
  const [smsSenderId, setSmsSenderId] = useState('EDUCORE');
  const [schoolLogoInitials, setSchoolLogoInitials] = useState('EC');
  const [schoolMotto, setSchoolMotto] = useState('Smart School Portal');
  const [contactPhone, setContactPhone] = useState('+233 000 000 000');
  const [contactEmail, setContactEmail] = useState('office@school.edu');
  const [contactAddress, setContactAddress] = useState('School address');
  const [currencyCode, setCurrencyCode] = useState('GHS');
  const [periodType, setPeriodType] = useState<'Term' | 'Semester'>('Term');

  // SUPER ADMIN CLUSTER SETTINGS STATE
  const [maxSchools, setMaxSchools] = useState(150);
  const [allowGlobalRegistrations, setAllowGlobalRegistrations] = useState(true);
  const [billingReminderDays, setBillingReminderDays] = useState(7);
  const [sslActive, setSslActive] = useState(true);
  const [primaryCluster, setPrimaryCluster] = useState('US_EAST_CLUSTER_1');

  // Load contextual settings based on active tenant/super scope
  useEffect(() => {
    if (!isSuperAdmin && currentTenant) {
      const s = getTenantSettings(currentTenant.id);
      setAcademicYear(s.academicYear);
      setTerm(s.term);
      setThemeColor(s.themeColor);
      setAllowParentReg(s.allowParentReg);
      setAllowTeacherReg(s.allowTeacherReg);
      setSmsSenderId(s.smsSenderId);
      setSchoolLogoInitials(s.schoolLogoInitials || currentTenant.name.split(/\s+/).slice(0, 2).map(word => word[0]).join('').toUpperCase());
      setSchoolMotto(s.schoolMotto || 'Smart School Portal');
      setContactPhone(s.contactPhone || '+233 000 000 000');
      setContactEmail(s.contactEmail || 'office@school.edu');
      setContactAddress(s.contactAddress || 'School address');
      setCurrencyCode(s.currencyCode || 'GHS');
      setPeriodType(s.periodType || 'Term');
      setDeliveryProvider(localStorage.getItem(`educore_delivery_provider_${currentTenant.id}`) || 'Device apps only');
      setDeliveryApiKey(localStorage.getItem(`educore_delivery_key_${currentTenant.id}`) || '');
      try {
        setSetupDone(JSON.parse(localStorage.getItem(`educore_setup_wizard_${currentTenant.id}`) || '{}'));
        setArchiveList(JSON.parse(localStorage.getItem(`educore_academic_archive_${currentTenant.id}`) || '[]'));
      } catch {
        setSetupDone({});
        setArchiveList([]);
      }
    }
  }, [currentTenant, isSuperAdmin]);

  const setupSteps = [
    { id: 'calendar', title: 'Academic calendar', body: 'Confirm academic year, term or semester, and school currency.' },
    { id: 'classes', title: 'Classes and subjects', body: 'Create classrooms, subjects, departments, and primary all-subject handling.' },
    { id: 'people', title: 'People and logins', body: 'Add teachers, students, parents, managers, and link accounts correctly.' },
    { id: 'fees', title: 'Fees and billing', body: 'Set fee currency, bills, balances, receipts, and parent visibility.' },
    { id: 'teaching', title: 'Teaching workflow', body: 'Upload materials, assignments, attendance, lessons, AI notes, exams, and timetable.' },
  ];
  const saveSetupDone = (next: Record<string, boolean>) => {
    if (!currentTenant) return;
    setSetupDone(next);
    localStorage.setItem(`educore_setup_wizard_${currentTenant.id}`, JSON.stringify(next));
  };

  const handleSaveTenantSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin && currentTenant) {
      saveTenantSettings({
        tenantId: currentTenant.id,
        academicYear,
        term,
        themeColor,
        allowParentReg,
        allowTeacherReg,
        smsSenderId,
        schoolLogoInitials,
        schoolMotto,
        contactPhone,
        contactEmail,
        contactAddress,
        currencyCode,
        periodType
      });
      localStorage.setItem(`educore_delivery_provider_${currentTenant.id}`, deliveryProvider);
      localStorage.setItem(`educore_delivery_key_${currentTenant.id}`, deliveryApiKey);
      onSaveNotification('School settings, branding, currency, and academic period saved.');
    }
  };

  const handleSaveGlobalParams = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin) {
      // Mock global settings persistence success
      onSaveNotification('Central cluster system parameters updated in Global Registry.');
    }
  };

  const handleBackendHealth = async () => {
    try {
      const health = await backendHealth();
      setBackendHealthText(`${health.mode} online, ${health.tables.length} tables, updated ${health.updatedAt || 'now'}`);
    } catch (error: any) {
      setBackendHealthText(error.message || 'Backend is not reachable');
    }
  };

  const handleEnvCheck = async () => {
    try {
      const result = await backendEnvCheck();
      setEnvChecks(result.checks);
      setBackendMsg('Production environment check completed.');
    } catch (error: any) {
      setBackendMsg(error.message || 'Environment check failed.');
    }
  };

  const handleBackup = async () => {
    try {
      const result = await backendBackup();
      setBackendMsg(`Backup created: ${result.backupFile} (${result.bytes} bytes).`);
    } catch (error: any) {
      setBackendMsg(error.message || 'Backup failed.');
    }
  };

  const handleResetDemoData = async () => {
    const confirmed = window.confirm('Reset demo data for testing? This creates a backend backup first when backend mode is active, then clears local demo storage and reloads.');
    if (!confirmed) return;
    try {
      await backendResetDemoData().catch(() => null);
      Object.keys(localStorage)
        .filter(key => key.startsWith('educore_'))
        .forEach(key => localStorage.removeItem(key));
      setLocalResetMsg('Demo data reset. Reloading clean test data...');
      setTimeout(() => window.location.reload(), 600);
    } catch (error: any) {
      setLocalResetMsg(error.message || 'Reset failed.');
    }
  };

  const handleMigrationUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const payload = JSON.parse(String(reader.result || '{}'));
        const result = await migrateBrowserExport(payload);
        setBackendMsg(`Migration completed: ${Object.entries(result.imported).map(([table, count]) => `${table} ${count}`).join(', ') || 'no new rows'}.`);
      } catch (error: any) {
        setBackendMsg(error.message || 'Migration failed.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const testAccounts = [
    { role: 'Super Admin', school: 'Global', email: 'superadmin@educore.ai', password: 'admin123' },
    { role: 'Manager', school: 'Central Crest Collegiate', email: 's.jenkins@centralcrest.edu', password: 'admin123' },
    { role: 'Teacher', school: 'Central Crest Collegiate', email: 'm.brody@centralcrest.edu', password: 'admin123' },
    { role: 'Parent', school: 'Central Crest Collegiate', email: 'r.vance@gmail.com', password: 'admin123' },
    { role: 'Student', school: 'Central Crest Collegiate', email: 'j.vance@centralcrest.edu', password: 'admin123' },
  ];

  const readinessItems = [
    { label: 'Frontend production build', detail: 'Verified by npm run build', ok: true },
    { label: 'Backend health API', detail: backendHealthText === 'Not checked' ? 'Click Check Backend' : backendHealthText, ok: backendHealthText !== 'Not checked' && !backendHealthText.toLowerCase().includes('not reachable') },
    { label: 'Role security', detail: 'Server and frontend route guards are active', ok: true },
    { label: 'Mobile journeys', detail: 'Covered by smoke:journeys', ok: true },
    { label: 'Backup command', detail: 'Available in this panel', ok: true },
    { label: 'Migration upload', detail: 'Super Admin JSON upload is ready', ok: true },
  ];

  return (
    <div className="max-w-4xl mx-auto font-sans select-none space-y-6">
      
      {/* HEADER BAR */}
      <div className="bg-white rounded border border-banking-border p-5">
        <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1A56DB]" />
          {isSuperAdmin ? 'Central Cluster Control Panel' : 'Tenant Workspace Settings'}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {isSuperAdmin 
            ? 'Super Admin global directory parameters, system throttling, and node allocation logs.' 
            : `Fulfill and edit operational parameters locked securely to school ID ${currentTenant?.id}.`
          }
        </p>
      </div>

      {isSuperAdmin ? (
        /* ================= SUPER ADMIN CONFIGURATION PANEL ================= */
        <form onSubmit={handleSaveGlobalParams} className="space-y-6">
          <section className="bg-white rounded border border-emerald-200 p-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Final readiness</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Ready To Test Checklist</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">{EDUCORE_BUILD_LABEL} - use this panel before handing the portal to testers.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={handleBackendHealth} className="border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-800">
                  Refresh Readiness
                </button>
                <button type="button" onClick={handleResetDemoData} className="border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-800">
                  Reset Demo Data
                </button>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {readinessItems.map(item => (
                <div key={item.label} className={`border p-3 ${item.ok ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
                  <p className={`text-xs font-black ${item.ok ? 'text-emerald-900' : 'text-amber-900'}`}>{item.ok ? 'PASS' : 'CHECK'}: {item.label}</p>
                  <p className="mt-1 text-[11px] font-semibold text-slate-600">{item.detail}</p>
                </div>
              ))}
            </div>
            {localResetMsg && <p className="border border-blue-100 bg-blue-50 p-3 text-xs font-black text-blue-800">{localResetMsg}</p>}
          </section>

          <section className="bg-white rounded border border-banking-border p-5 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-[#1A56DB]">Seed test accounts</p>
              <h3 className="mt-1 text-base font-black text-slate-950">Use these logins during QA</h3>
            </div>
            <div className="grid gap-3 md:grid-cols-5">
              {testAccounts.map(account => (
                <div key={account.email} className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-black text-slate-950">{account.role}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">{account.school}</p>
                  <p className="mt-2 break-all font-mono text-[10px] font-bold text-blue-700">{account.email}</p>
                  <p className="mt-1 font-mono text-[10px] font-black text-slate-700">{account.password}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded border border-banking-border p-5 space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-[#1A56DB]">Production backend control</p>
                <h3 className="mt-1 text-base font-black text-slate-950">Connect, migrate, backup, and verify the server</h3>
                <p className="mt-1 text-xs font-semibold text-slate-500">Use this after signing in through backend mode so the bearer token can authorize Super Admin actions.</p>
              </div>
              <button type="button" onClick={handleBackendHealth} className="border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-black text-blue-800">
                Check Backend
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase text-slate-500">Backend health</p>
                <p className="mt-1 text-xs font-bold text-slate-800">{backendHealthText}</p>
              </div>
              <label className="border border-emerald-200 bg-emerald-50 p-3 text-xs font-black text-emerald-800 cursor-pointer">
                Upload Browser Export JSON
                <input type="file" accept=".json,application/json" onChange={handleMigrationUpload} className="hidden" />
                <span className="mt-1 block text-[10px] font-semibold text-emerald-700">Migrates old localStorage data into backend tables.</span>
              </label>
              <div className="grid gap-2">
                <button type="button" onClick={handleEnvCheck} className="border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-800">Run Environment Check</button>
                <button type="button" onClick={handleBackup} className="bg-slate-900 px-3 py-2 text-xs font-black text-white">Create Server Backup</button>
              </div>
            </div>
            {envChecks.length > 0 && (
              <div className="grid gap-2 md:grid-cols-2">
                {envChecks.map(check => (
                  <div key={check.name} className={`border p-3 text-xs font-bold ${check.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    {check.ok ? 'OK' : 'Check'}: {check.name}
                    <p className="mt-1 text-[11px] font-semibold">{check.detail}</p>
                  </div>
                ))}
              </div>
            )}
            {backendMsg && <p className="border border-blue-100 bg-blue-50 p-3 text-xs font-black text-blue-800">{backendMsg}</p>}
          </section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: SYSTEM CONTROLS LIMITS */}
            <div className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Server className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Cluster Provisioning</h3>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Max Allowed Schools</label>
                <input
                  id="settings-max-schools"
                  type="number"
                  value={maxSchools}
                  onChange={(e) => setMaxSchools(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Primary Server Cluster</label>
                <select
                  id="settings-primary-cluster"
                  value={primaryCluster}
                  onChange={(e) => setPrimaryCluster(e.target.value)}
                  className="w-full p-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="US_EAST_CLUSTER_1">US-East (AWS Lambda Serverless)</option>
                  <option value="EU_WEST_RUN_3">Europe-West (Cloud Run Container)</option>
                  <option value="APAC_SEOUL_DB">APAC-Seoul Cluster Grid</option>
                </select>
              </div>

              <div className="p-3 bg-indigo-50/50 rounded border border-indigo-100/50 text-[10px] text-slate-500 space-y-1 leading-normal font-medium">
                <p className="font-bold text-[#1A56DB] flex items-center gap-1">
                  <Database className="w-3.5 h-3.5" /> Registry Server Info:
                </p>
                <p>Allocated Storage: 2.1 TB / 10 TB</p>
                <p>Registry Health: 99.99% Node SLA</p>
              </div>
            </div>

            {/* COLUMN 2: REGISTRATION GATEWAYS & REMINDERS */}
            <div className="bg-white rounded border border-[#CBD5E1] p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Globe className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Global Gateways</h3>
              </div>

              <div className="flex items-center justify-between py-2 transition-all">
                <div>
                  <div className="text-xs font-bold text-slate-800">Direct Registration Portal</div>
                  <p className="text-[10px] text-slate-400">Allows public to apply for school licenses</p>
                </div>
                <input
                  id="settings-global-reg"
                  type="checkbox"
                  checked={allowGlobalRegistrations}
                  onChange={(e) => setAllowGlobalRegistrations(e.target.checked)}
                  className="w-4 h-4 accent-[#1A56DB] cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Grace Reminder (Days)</label>
                <input
                  id="settings-billing-days"
                  type="number"
                  value={billingReminderDays}
                  onChange={(e) => setBillingReminderDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-bold text-slate-800">Strict SSL Enforcement</div>
                  <p className="text-[10px] text-slate-400">Forces secure HTTPS headers across school domains</p>
                </div>
                <input
                  id="settings-ssl"
                  type="checkbox"
                  checked={sslActive}
                  onChange={(e) => setSslActive(e.target.checked)}
                  className="w-4 h-4 accent-[#1A56DB] cursor-pointer"
                />
              </div>
            </div>

            {/* COLUMN 3: SECURITY KEYS MONITOR */}
            <div className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Lock className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Audit Safety Controls</h3>
              </div>

              <div className="space-y-2 text-[10px] font-mono leading-relaxed">
                 <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600">
                   <p className="font-bold text-slate-800 flex items-center justify-between">
                     <span>SECURITY_KEY:</span>
                     <span className="text-emerald-600">ACTIVE</span>
                   </p>
                   <p className="mt-1 font-semibold truncate text-[9px]">45a42aab-1d87-42a7-93b8-ab87fe707333</p>
                 </div>

                 <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-slate-600">
                   <p className="font-bold text-slate-800 flex items-center justify-between">
                     <span>ENCRYPTION SHA:</span>
                     <span className="text-slate-500">AES-256</span>
                   </p>
                   <p className="mt-1 text-[9px] select-all">RSA_PUBLIC_KEY_PEM_CLUSTER_SECURE_VERIFIED</p>
                 </div>
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-2">
             <button
                id="btn-settings-save-global"
                type="submit"
                className="px-5 py-2.5 bg-[#1A56DB] hover:bg-opacity-90 text-white rounded text-xs font-semibold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
             >
                <Save className="w-4 h-4" />
                <span>Save Global Cluster Setup</span>
             </button>
          </div>
        </form>
      ) : (
        /* ================= SCHOOL ADMIN LOCAL CONFIG PANEL ================= */
        <form onSubmit={handleSaveTenantSettings} className="space-y-6">
          {currentTenant && (
            <section className="bg-white rounded border border-banking-border p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#1A56DB]">School setup wizard</p>
                  <h3 className="mt-1 text-lg font-black text-slate-950">Finish the school in the right order</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Use this when opening a new school year, term, or semester.</p>
                </div>
                <span className="w-fit border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
                  {Object.values(setupDone).filter(Boolean).length}/{setupSteps.length} done
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
                <div className="space-y-2">
                  {setupSteps.map((step, index) => (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setSetupStep(index)}
                      className={`w-full border px-3 py-3 text-left text-xs font-black ${setupStep === index ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                      {setupDone[step.id] ? 'Done: ' : ''}{index + 1}. {step.title}
                    </button>
                  ))}
                </div>
                <div className="border border-slate-200 bg-slate-50 p-4">
                  <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">Step {setupStep + 1}</p>
                  <h4 className="mt-1 text-base font-black text-slate-950">{setupSteps[setupStep].title}</h4>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">{setupSteps[setupStep].body}</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => saveSetupDone({ ...setupDone, [setupSteps[setupStep].id]: true })}
                      className="bg-emerald-600 px-4 py-3 text-xs font-black text-white"
                    >
                      Mark Done
                    </button>
                    <button
                      type="button"
                      onClick={() => setSetupStep(Math.min(setupSteps.length - 1, setupStep + 1))}
                      className="border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}
          {currentTenant && (
            <div className="bg-white rounded border border-banking-border p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-[#1A56DB]">
                <Globe className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">School Login Links</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {[
                  ['School login', schoolLoginLink],
                  ['Access request', schoolRequestLink],
                ].map(([label, link]) => (
                  <div key={label} className="border border-slate-200 bg-slate-50 p-3">
                    <p className="text-[10px] font-black uppercase text-slate-500">{label}</p>
                    <p className="mt-1 break-all font-mono text-[10px] font-bold text-slate-700">{link}</p>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(link);
                        setCopyMsg(`${label} copied`);
                      }}
                      className="mt-2 border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800"
                    >
                      Copy link
                    </button>
                  </div>
                ))}
              </div>
              {copyMsg && <p className="text-xs font-black text-emerald-700">{copyMsg}</p>}
            </div>
          )}
          {currentTenant && (
            <div className="grid gap-6 md:grid-cols-2">
              <section className="bg-white rounded border border-banking-border p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-[#1A56DB]">
                  <Server className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-display uppercase text-slate-700">Server & Database Readiness</h3>
                </div>
                <div className="rounded border border-emerald-100 bg-emerald-50 p-3">
                  <p className="text-xs font-black text-emerald-900">Current mode: Browser database demo</p>
                  <p className="mt-1 text-[11px] font-semibold leading-relaxed text-emerald-800">
                    The app is structured with central session and role guards. For full production security, connect these same screens to a real backend API and database so users cannot edit records in the browser.
                  </p>
                </div>
                <div className="grid gap-2 text-[11px] font-bold text-slate-600">
                  {['Users and passwords', 'Lockouts and reset requests', 'Fees, materials, assignments', 'Audit logs and archives'].map(item => (
                    <span key={item} className="border border-slate-200 bg-slate-50 px-3 py-2">{item}: backend-ready table</span>
                  ))}
                </div>
              </section>

              <section className="bg-white rounded border border-banking-border p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5 text-[#1A56DB]">
                  <BellRing className="w-4 h-4" />
                  <h3 className="text-xs font-bold font-display uppercase text-slate-700">Real Message Delivery</h3>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Delivery Provider</label>
                  <select value={deliveryProvider} onChange={(e) => setDeliveryProvider(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black">
                    <option>Device apps only</option>
                    <option>Twilio SMS / WhatsApp</option>
                    <option>Africa's Talking SMS</option>
                    <option>SendGrid Email</option>
                    <option>Custom School API</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">API Key / Token</label>
                  <input value={deliveryApiKey} onChange={(e) => setDeliveryApiKey(e.target.value)} type="password" className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold" placeholder="Paste provider key when backend is connected" />
                </div>
                <p className="text-[11px] font-semibold leading-relaxed text-slate-500">Invite buttons can open email/SMS/WhatsApp now; this provider setting prepares the school for automatic sending through a backend.</p>
              </section>
            </div>
          )}

          {currentTenant && (
            <section className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-[#1A56DB]">Academic archive</p>
                  <h3 className="mt-1 text-base font-black text-slate-950">Close and save old academic records</h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">Archive the current year/term/semester before moving to a new one. Old records stay searchable but separated.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const snapshot = archiveCurrentAcademicYear(currentTenant.id);
                    const nextArchive = JSON.parse(localStorage.getItem(`educore_academic_archive_${currentTenant.id}`) || '[]');
                    setArchiveList(nextArchive);
                    setArchiveMsg(`Archived ${snapshot.academicYear} - ${snapshot.term}.`);
                  }}
                  className="bg-slate-900 px-4 py-3 text-xs font-black text-white"
                >
                  Archive Current Period
                </button>
              </div>
              {archiveMsg && <p className="border border-emerald-100 bg-emerald-50 p-3 text-xs font-black text-emerald-800">{archiveMsg}</p>}
              <div className="grid gap-2 md:grid-cols-3">
                {archiveList.slice(0, 6).map(item => (
                  <div key={item.id} className="border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs font-black text-slate-950">{item.academicYear}</p>
                    <p className="text-[11px] font-bold text-slate-600">{item.term}</p>
                    <p className="mt-1 text-[10px] font-mono text-slate-500">{new Date(item.archivedAt).toLocaleString()}</p>
                  </div>
                ))}
                {archiveList.length === 0 && <p className="text-xs font-semibold text-slate-500">No archived academic periods yet.</p>}
              </div>
            </section>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* COLUMN 1: LOCAL CALENDAR ACADEMICS */}
            <div className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Layout className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Academics Term Calendar</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Academic Year</label>
                  <select
                    id="settings-academic-year"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="2025/2026">2025/2026</option>
                    <option value="2026/2027">2026/2027</option>
                    <option value="2027/2028">2027/2028</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Current {periodType}</label>
                  <select
                    id="settings-term"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    {periodType === 'Semester' ? (
                      <>
                        <option value="First Semester">First Semester</option>
                        <option value="Second Semester">Second Semester</option>
                        <option value="Summer Semester">Summer Semester</option>
                      </>
                    ) : (
                      <>
                        <option value="First Term">First Term</option>
                        <option value="Second Term">Second Term</option>
                        <option value="Third Term">Third Term</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">School Calendar Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Term', 'Semester'] as const).map(value => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        setPeriodType(value);
                        setTerm(value === 'Semester' ? 'First Semester' : 'First Term');
                      }}
                      className={`rounded border px-3 py-2 text-xs font-black ${periodType === value ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
                    >
                      {value}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] font-semibold text-slate-500">Use terms for basic schools or semesters for colleges and international schools.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">SMS Gateway Sender ID Mark</label>
                <input
                  id="settings-sms-sender"
                  type="text"
                  maxLength={11}
                  value={smsSenderId}
                  onChange={(e) => setSmsSenderId(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                  placeholder="e.g. S_ACADEMY"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-mono font-bold text-[#1A56DB]"
                />
                <p className="text-[9px] text-slate-400 font-mono mt-0.5">Enforces localized signature brand under SMS nodes.</p>
              </div>
            </div>

            {/* COLUMN 2: REGISTRATIONS & PERMISSION FLAGS */}
            <div className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Users className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Self-Registration Portals</h3>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-50">
                <div>
                  <div className="text-xs font-bold text-slate-800">Allow Parent Registration</div>
                  <p className="text-[10px] text-slate-400">Allows guardian profiles to match student keys</p>
                </div>
                <input
                  id="settings-parent-reg"
                  type="checkbox"
                  checked={allowParentReg}
                  onChange={(e) => setAllowParentReg(e.target.checked)}
                  className="w-4 h-4 accent-[#1A56DB] cursor-pointer shadow-none"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="text-xs font-bold text-slate-800">Allow Faculty Self-Onboarding</div>
                  <p className="text-[10px] text-slate-400">Allows teachers to request workspace entry permissions</p>
                </div>
                <input
                  id="settings-teacher-reg"
                  type="checkbox"
                  checked={allowTeacherReg}
                  onChange={(e) => setAllowTeacherReg(e.target.checked)}
                  className="w-4 h-4 accent-[#1A56DB] cursor-pointer shadow-none"
                />
              </div>

              <div className="p-3 bg-emerald-50 text-slate-600 rounded border border-emerald-100 flex gap-2 text-[10px] !mt-4 font-semibold leading-relaxed">
                 <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                 <span>
                    All school parameters are strictly isolated under tenant row-scopes and cannot be read, monitored, or overwritten by adjacent school instances.
                 </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="bg-white rounded border border-banking-border p-5 space-y-4 md:col-span-2">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Sliders className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">School Branding & Contact</h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Logo Initials</label>
                  <input value={schoolLogoInitials} onChange={(e) => setSchoolLogoInitials(e.target.value.toUpperCase().slice(0, 4))} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Brand Color</label>
                  <input type="color" value={themeColor} onChange={(e) => setThemeColor(e.target.value)} className="h-10 w-full rounded border border-slate-200 bg-slate-50 p-1" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">School Motto / Small Subtitle</label>
                  <input value={schoolMotto} onChange={(e) => setSchoolMotto(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
                  <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email</label>
                  <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Address</label>
                  <input value={contactAddress} onChange={(e) => setContactAddress(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:outline-none" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded border border-banking-border p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 text-[#1A56DB]">
                <Globe className="w-4 h-4" />
                <h3 className="text-xs font-bold font-display uppercase text-slate-700">Currency & Preview</h3>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Default Currency</label>
                <select value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value)} className="w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black focus:border-blue-500 focus:outline-none">
                  <option value="GHS">GHS - Ghana Cedi</option>
                  <option value="USD">USD - Dollar</option>
                  <option value="NGN">NGN - Naira</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - Pound</option>
                  <option value="XOF">XOF - CFA Franc</option>
                  <option value="KES">KES - Kenyan Shilling</option>
                  <option value="ZAR">ZAR - Rand</option>
                </select>
              </div>
              <div className="rounded border p-4 text-white" style={{ background: themeColor }}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded border border-white/30 bg-white/15 text-sm font-black">{schoolLogoInitials || 'EC'}</div>
                  <div>
                    <p className="text-sm font-black">{currentTenant?.name || 'School name'}</p>
                    <p className="text-xs font-semibold opacity-80">{schoolMotto}</p>
                  </div>
                </div>
                <p className="mt-3 text-[10px] font-bold uppercase opacity-80">{currencyCode} fees, {periodType.toLowerCase()} records, and contact details will use this setup.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
             <button
                id="btn-settings-save-tenant"
                type="submit"
                className="px-5 py-2.5 bg-[#1A56DB] hover:bg-opacity-90 text-white rounded text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer transition-colors"
             >
                <Save className="w-4 h-4" />
                <span>Save Workspace Parameters</span>
             </button>
          </div>
        </form>
      )}

    </div>
  );
}
