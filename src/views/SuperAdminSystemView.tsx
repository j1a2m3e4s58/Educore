/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Database, 
  Settings, 
  Activity, 
  CheckSquare, 
  RefreshCw, 
  Play, 
  Download, 
  Server, 
  Smartphone, 
  Mail, 
  CreditCard, 
  Eye, 
  Cpu, 
  FileText,
  AlertTriangle,
  PlayCircle,
  Network
} from 'lucide-react';
import { 
  BackupRecord, 
  IntegrationSetting, 
  SystemHealthMetric, 
  DeploymentChecklistItem,
  School
} from '../types';

interface SuperAdminSystemViewProps {
  backupRecords: BackupRecord[];
  onTriggerBackup: (backup: BackupRecord) => void;
  integrationSettings: IntegrationSetting[];
  onUpdateIntegration: (settings: IntegrationSetting) => void;
  systemHealth: SystemHealthMetric;
  deploymentChecklist: DeploymentChecklistItem[];
  onUpdateDeploymentChecklist: (checklist: DeploymentChecklistItem[]) => void;
  schools: School[];
}

export default function SuperAdminSystemView({
  backupRecords,
  onTriggerBackup,
  integrationSettings,
  onUpdateIntegration,
  systemHealth,
  deploymentChecklist,
  onUpdateDeploymentChecklist,
  schools
}: SuperAdminSystemViewProps) {
  const [activePane, setActivePane] = useState<'backups' | 'integrations' | 'health' | 'checklist'>('backups');
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);

  // Trigger simulated backups
  const handleTriggerManualBackup = (target: 'PostgreSQL' | 'Cloud Storage' | 'All') => {
    setIsBackingUp(true);
    setTimeout(() => {
      const newBackup: BackupRecord = {
        id: `bak_${Date.now()}`,
        tenantId: 'GLOBAL',
        type: 'Manual',
        target,
        sizeMB: Math.floor(Math.random() * 450) + 120,
        status: 'Success',
        initiatedBy: 'SuperAdmin Lead',
        createdAt: new Date().toISOString(),
        downloadUrl: '#',
        notes: `Manual snapshot trigger for ${target} databases.`
      };
      onTriggerBackup(newBackup);
      setIsBackingUp(false);
    }, 1500);
  };

  // Test integration settings loader
  const handleTestIntegration = (id: string) => {
    setTestingId(id);
    const target = integrationSettings.find(i => i.id === id);
    if (!target) return;

    onUpdateIntegration({
      ...target,
      status: 'Testing'
    });

    setTimeout(() => {
      onUpdateIntegration({
        ...target,
        status: 'Connected',
        lastTestedAt: new Date().toISOString()
      });
      setTestingId(null);
    }, 1200);
  };

  const handleToggleChecklistTask = (id: string) => {
    const updated = deploymentChecklist.map(item => {
      if (item.id === id) {
        const nextStatus: 'Pending' | 'In Progress' | 'Completed' = 
          item.status === 'Pending' ? 'In Progress' :
          item.status === 'In Progress' ? 'Completed' : 'Pending';
        return { ...item, status: nextStatus };
      }
      return item;
    });
    onUpdateDeploymentChecklist(updated);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 select-text">
      
      {/* SYSTEM OPERATIONS PORTAL HEADER */}
      <div className="bg-[#031525] text-white p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 select-none">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold bg-[#1A56DB] text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
             Systems Operations Office
          </span>
          <h2 className="text-base font-extrabold tracking-tight">SaaS Core Infrastructure & Operations Node</h2>
          <p className="text-xs text-slate-400">
             Govern cluster daily data structures backups, configure external third-party API keys gateways, analyze CPU kernel loads, and complete production deployment readiness checklists.
          </p>
        </div>

        {/* SUB NAVIGATION CONTROLLERS */}
        <div className="flex bg-[#11243E] border border-slate-800 p-1.5 rounded-lg gap-1 overflow-x-auto self-start md:self-auto uppercase tracking-wide shrink-0">
          {[
            { id: 'backups', label: 'Backup System', icon: Database },
            { id: 'integrations', label: 'External APIs', icon: Settings },
            { id: 'health', label: 'Health Analyzer', icon: Activity },
            { id: 'checklist', label: 'Cloud Checklist', icon: CheckSquare }
          ].map(pane => {
            const Icon = pane.icon;
            return (
              <button
                key={pane.id}
                onClick={() => setActivePane(pane.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[9.5px] font-black rounded-md cursor-pointer transition-colors ${
                  activePane === pane.id 
                    ? 'bg-[#1A56DB] text-white' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {pane.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* PANE 1: BACKUPS AND RESTORE ARCHIVE */}
      {activePane === 'backups' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Backups trigger box */}
          <div className="md:col-span-1 bg-white border border-slate-200 rounded-lg p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2 select-none">
                <Database className="w-4 h-4 text-blue-600" /> Database Backup Core
              </h3>
              <p className="text-[11px] text-slate-400 leading-normal">
                 Prepare database dumps containing schema architecture indices, multi-tenant isolates rows structures, and uploads static folders. Compatible with hot-swappable PostgreSQL architectures.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                id="sys-backup-pg-btn"
                disabled={isBackingUp}
                onClick={() => handleTriggerManualBackup('PostgreSQL')}
                className="w-full text-center py-2.5 bg-blue-605 hover:bg-blue-700 font-extrabold text-[#11243E] hover:text-white rounded border border-blue-600 cursor-pointer disabled:opacity-50 text-[11px]"
              >
                {isBackingUp ? 'Executing Backup...' : 'Trigger PostgreSQL DB dump'}
              </button>

              <button
                id="sys-backup-cloud-btn"
                disabled={isBackingUp}
                onClick={() => handleTriggerManualBackup('Cloud Storage')}
                className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 font-extrabold text-slate-700 rounded border border-slate-200 cursor-pointer disabled:opacity-50 text-[11px]"
              >
                Snapshot static Cloud Storage S3
              </button>

              <button
                disabled={isBackingUp}
                onClick={() => handleTriggerManualBackup('All')}
                className="w-full text-center py-2.5 bg-[#031525] hover:bg-opacity-95 text-white font-extrabold text-xs rounded border border-transparent cursor-pointer disabled:opacity-50 text-[11px]"
              >
                Full Cluster Comprehensive Backup
              </button>
            </div>

            <div className="p-3 bg-indigo-50/50 border border-indigo-150 rounded text-indigo-800 text-[10px] font-mono mt-3 select-none">
              <span className="font-bold uppercase tracking-widest block mb-0.5">Automated Daily Crons:</span>
              <span>Backups scheduled at 02:00:00 UTC hourly snapshots stored. Retained 30 days.</span>
            </div>
          </div>

          {/* Backups records listings */}
          <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-slate-50 border-b border-slate-200 select-none">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-750">Cloud Backups Archive File Registry</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-[11px] text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold font-mono">
                    <th className="p-3">Dump Date</th>
                    <th className="p-3">Context Type</th>
                    <th className="p-3">Target Node</th>
                    <th className="p-3">Archive Size</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Trigger Agent</th>
                    <th className="p-3 text-right">Acquire</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 font-mono text-slate-650">
                  {backupRecords.map(b => (
                    <tr key={b.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-500">{new Date(b.createdAt).toLocaleString()}</td>
                      <td className="p-3 font-sans font-medium text-slate-750">{b.type} Snap</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 border text-[9px] font-bold rounded uppercase bg-indigo-50 border-indigo-200 text-[#1A56DB]">
                          {b.target}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-900">{b.sizeMB} MB</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-black rounded-full text-[8.5px] uppercase border border-emerald-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="p-3 font-sans text-slate-450">{b.initiatedBy}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => alert(`Initiating file archive extraction download: ${b.target}_${b.id}_backup.bin`)}
                          className="px-2.5 py-1 text-[10px] bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-black cursor-pointer transition-all inline-flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-blue-600" /> Get DB Dump
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* PANE 2: API GATEWAYS & INTEGRATION SETTINGS */}
      {activePane === 'integrations' && (
        <div className="space-y-6 animate-in fade-in duration-100">
          <div className="bg-white p-5 rounded-lg border border-slate-200 select-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Commercial APIs Key Management & Integrations</h3>
            <p className="text-[11px] text-slate-400">Manage third-party hardware modules, cellular SMS gateways, and cloud financial clearing credentials safely masked in memory arrays.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {integrationSettings.map(gate => {
              const Icon = 
                gate.id === 'sms' ? Smartphone :
                gate.id === 'email' ? Mail :
                gate.id === 'payment' ? CreditCard :
                gate.id === 'ai' ? Cpu : Server;

              return (
                <div key={gate.id} className="bg-white border border-slate-150 rounded-lg p-4 flex flex-col justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="p-2 bg-[#1A56DB]/5 border border-blue-150/50 rounded-md">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      {/* Connection status badge */}
                      <span className={`px-2 py-0.5 text-[8.5px] font-black font-mono uppercase tracking-wider rounded border ${
                        gate.status === 'Connected' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        gate.status === 'Testing' ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse' :
                        gate.status === 'Error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}>
                        {gate.status}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{gate.name}</h4>
                      <p className="text-[10px] text-slate-400">Powered by vendor provider: <strong className="text-slate-650 font-mono font-bold uppercase">{gate.provider}</strong></p>
                    </div>

                    <div className="bg-slate-50/50 border border-slate-100 rounded p-2.5 space-y-1.5 font-mono text-[10px]">
                      <div className="flex justify-between">
                        <span className="text-slate-400">API Endpoint:</span>
                        <span className="text-slate-700 truncate max-w-[130px] select-all font-semibold" title={gate.apiEndpoint}>{gate.apiEndpoint || 'Secure Tunnel'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Secure Secret:</span>
                        <span className="text-slate-700 font-bold tracking-widest">{gate.apiKeyMasked}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex justify-between gap-1 grid grid-cols-2">
                    <button
                      onClick={() => alert(`Open security credentials modify keys: ${gate.name}`)}
                      className="px-2.5 py-1 text-[10px] text-center bg-white border border-slate-200 hover:border-slate-350 text-slate-700 rounded font-black cursor-pointer uppercase tracking-wider"
                    >
                      Update Key
                    </button>
                    <button
                      disabled={testingId === gate.id}
                      onClick={() => handleTestIntegration(gate.id)}
                      className="px-2.5 py-1 text-[10px] text-center bg-blue-50 hover:bg-blue-100 text-[#1A56DB] rounded border border-blue-150 font-black cursor-pointer uppercase tracking-wider disabled:opacity-50"
                    >
                      {testingId === gate.id ? 'Testing...' : 'Test gateway'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PANE 3: SYSTEM HEALTH MONITOR */}
      {activePane === 'health' && (
        <div className="space-y-6 animate-in fade-in duration-100">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Server health states */}
            <div className="bg-[#031525] text-white p-5 rounded-lg border border-slate-800 flex flex-col justify-between h-[300px]">
              <div className="space-y-4">
                <div className="p-2.5 bg-blue-600/10 border border-blue-500/20 rounded-md w-fit">
                  <Server className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">MicroVM Container Instances</h4>
                  <p className="text-xl font-bold font-mono tracking-tight text-white mt-1">Docker Client Cluster</p>
                </div>
                <div className="space-y-1 font-mono text-[10px] text-slate-400 leading-normal">
                  <div className="flex justify-between"><span>SLA SLA State:</span> <strong className="text-emerald-400 font-extrabold uppercase font-sans">99.98% Healthy</strong></div>
                  <div className="flex justify-between"><span>Core Node Uptime:</span> <strong className="text-white">Active (34 days, 5 hours)</strong></div>
                  <div className="flex justify-between"><span>Region Deployment:</span> <strong className="text-white">us-central-1 (Cloud Run)</strong></div>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded text-[10.5px] font-mono leading-relaxed text-emerald-300">
                 All computing cores responsive to gateway requests. Redis memory keys cleared dynamic boundaries.
              </div>
            </div>

            {/* RAM CPU Gauge bars */}
            <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-5 h-[300px] flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-705 mb-4 select-none">Computing Resources Allocation</h4>
                
                <div className="space-y-4">
                  {/* Memory */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Direct RAM Allocation</span>
                      <span className="font-bold text-slate-900">{systemHealth.memoryUsagePercent}% (4.16 GB / 8.0 GB)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#1A56DB] h-2 rounded-full" style={{ width: `${systemHealth.memoryUsagePercent}%` }} />
                    </div>
                  </div>

                  {/* CPU */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Computing Kernels CPU Load</span>
                      <span className="font-bold text-slate-900">{systemHealth.cpuUsagePercent}% (1.2 cores / 4.0 Core micro)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${systemHealth.cpuUsagePercent}%` }} />
                    </div>
                  </div>

                  {/* HDD */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Database Disk Space</span>
                      <span className="font-bold text-slate-900">{systemHealth.diskUsagePercent}% (18.5 GB / (SSD) 120 GB)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${systemHealth.diskUsagePercent}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 italic">Metrics refresh dynamically every 15000ms intervals automatically.</div>
            </div>

            {/* Redis BullMQ Workers State */}
            <div className="bg-white border border-slate-205 rounded-lg p-5 space-y-4 h-[300px] flex flex-col justify-between select-none">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono mb-3">Asynchronous Workers: Redis & BullMQ</h4>
                
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold leading-none">Active Queue Workers</span>
                    <strong className="text-base font-mono font-black text-slate-800 mt-1 block">{systemHealth.activeWorkers} threads</strong>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-150 rounded">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold leading-none">Bulk Queue Status</span>
                    <strong className="text-sm font-mono font-black text-emerald-600 mt-1.5 block uppercase tracking-wide">{systemHealth.queueStatus}</strong>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Redis Broker Status:</span>
                    <strong className="text-emerald-600 uppercase font-black">{systemHealth.redisStatus}</strong>
                  </div>
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-405">Daily Failed Jobs count:</span>
                    <strong className="text-rose-600">{systemHealth.failedJobs} crashed</strong>
                  </div>
                </div>
              </div>

              <button
                onClick={() => alert(`Triggering flush clean command on BullMQ crashed tasks logs broker arrays.`)}
                className="w-full text-center py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded font-black text-[10px] uppercase cursor-pointer"
              >
                Clear crashed queues logs ({systemHealth.failedJobs})
              </button>
            </div>

          </div>

          {/* DOCKER CONTAINER LOG STREAMS PANEL */}
          <div className="bg-[#031525] border border-slate-800 rounded-lg overflow-hidden h-[250px] flex flex-col justify-between">
            <div className="px-4 py-3 border-b border-slate-800 bg-[#061B2E] select-none flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono font-bold uppercase tracking-widest">Syslog Kernels Logger Stream (stdout)</span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">Streaming live</span>
            </div>

            <div className="p-4 flex-grow overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1.5 select-all leading-normal bg-[#010D18]">
              {systemHealth.lastLogLines.map((line, idx) => (
                <div key={idx} className="flex gap-4">
                  <span className="text-slate-500 shrink-0 select-none">[{idx+1}]</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* PANE 4: DEPLOYMENT READY CHECKLIST */}
      {activePane === 'checklist' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 select-none">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Production Deployment readiness certification (SLA Audit)</h3>
            <p className="text-[11px] text-slate-400">Complete architectural checkpoints required before activating multi-tenant school packages contracts and declaring cluster compliance.</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-150">
              {deploymentChecklist.map(item => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 select-none">
                      <span className="px-1.5 py-0.3 bg-slate-100 font-mono text-[9px] font-bold text-slate-650 rounded border border-slate-205 uppercase">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-snug">{item.task}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium select-text">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto select-none shrink-0">
                    <span className={`px-2.5 py-0.5 border text-[9px] font-black uppercase rounded-full font-mono ${
                      item.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold' :
                      item.status === 'In Progress' ? 'bg-amber-50 text-amber-800 border-amber-250 font-semibold animate-pulse' :
                      'bg-rose-50 text-rose-800 border-rose-250'
                    }`}>
                      {item.status}
                    </span>

                    <button
                      onClick={() => handleToggleChecklistTask(item.id)}
                      className="px-2.5 py-1 text-[10px] border border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:bg-slate-50 font-black rounded cursor-pointer transition-all uppercase tracking-wider"
                    >
                      Cycle state
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
