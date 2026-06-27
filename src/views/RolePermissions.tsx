/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Save, 
  CheckCircle,
  UserCheck,
  Info,
  ShieldAlert
} from 'lucide-react';
import { RolePermission } from '../types';
import { 
  getRolePermissionsInStorage, 
  saveRolePermissionsInStorage, 
  appendActivityLog 
} from '../data/mockData';

interface RolePermissionsProps {
  tenantId: string;
}

type PermField = 'dashboard' | 'attendance' | 'assignments' | 'lessonNotes' | 'studentRecords' | 'settings';

export default function RolePermissions({ tenantId }: RolePermissionsProps) {
  const [permissions, setPermissions] = useState<RolePermission[]>([]);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [extraRoles, setExtraRoles] = useState<Record<string, Record<string, boolean>>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(`educore_extra_permissions_${tenantId}`) || '{}');
      return saved && typeof saved === 'object' ? saved : {};
    } catch {
      return {};
    }
  });

  // Load permissions from mock database
  useEffect(() => {
    setPermissions(getRolePermissionsInStorage(tenantId));
  }, [tenantId]);

  const handleChangeAccess = (
    role: RolePermission['role'], 
    field: PermField, 
    value: 'View' | 'Edit' | 'None'
  ) => {
    const updated = permissions.map(p => {
      if (p.role === role) {
        return {
          ...p,
          [field]: value
        };
      }
      return p;
    });
    setPermissions(updated);
  };

  const handleSave = () => {
    saveRolePermissionsInStorage(tenantId, permissions);
    localStorage.setItem(`educore_extra_permissions_${tenantId}`, JSON.stringify(extraRoles));
    setSaveSuccess(true);
    
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Security Matrix Updated',
      details: 'Updated segment-based role permission policies matrix for standard academic users.',
      type: 'info'
    });

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3500);
  };

  const roleLabels: Record<RolePermission['role'], { label: string; desc: string; color: string }> = {
    Teacher: { 
      label: 'Academic Teacher Faculty', 
      desc: 'Certified classroom teachers mapping course grades and lesson registers.',
      color: 'border-l-[#1A56DB] bg-slate-50'
    },
    AssistantAdmin: { 
      label: 'Campus Assistant Admin', 
      desc: 'Vice-principals and academic coordinators adjusting schedules.',
      color: 'border-l-[#4F46E5] bg-slate-50'
    },
    Parent: { 
      label: 'Student Parents / Guardians', 
      desc: 'Hotline contacts checking grade scores and fee ledger balances.',
      color: 'border-l-[#F59E0B] bg-slate-50'
    },
    Student: { 
      label: 'Enrolled Academic Occupants (Students)', 
      desc: 'Students checking assignment timetables and self-grades.',
      color: 'border-l-[#10B981] bg-slate-50'
    }
  };

  const accessModules: { field: PermField; label: string; desc: string; allowEdit: boolean }[] = [
    { field: 'dashboard', label: 'Dashboard Access', desc: 'Central performance dashboards & widgets overview.', allowEdit: false },
    { field: 'attendance', label: 'Attendance Registers', desc: 'Take daily attendance or review classroom sign-in sheets.', allowEdit: true },
    { field: 'assignments', label: 'Assignments Folder', desc: 'Manage and grade homework schedules and worksheets.', allowEdit: true },
    { field: 'lessonNotes', label: 'Syllabus & Lesson Notes', desc: 'Publish, revise, or consult academic lesson blueprints.', allowEdit: true },
    { field: 'studentRecords', label: 'Scholastic Roster Directory', desc: 'Consult directory, primary enrollment cards, and profiles.', allowEdit: true },
    { field: 'settings', label: 'System Plate Settings', desc: 'Edit localized school metadata descriptors.', allowEdit: true }
  ];
  const practicalRoles = ['Teachers', 'Parents', 'Students', 'Accountants', 'Supervisors', 'Admins'];
  const practicalActions = [
    'View dashboard',
    'Edit records',
    'Approve changes',
    'See fees',
    'See reports',
    'Manage users',
  ];
  const toggleExtra = (roleName: string, action: string) => {
    setExtraRoles(prev => ({
      ...prev,
      [roleName]: {
        ...(prev[roleName] || {}),
        [action]: !(prev[roleName]?.[action] ?? ['Teachers', 'Admins'].includes(roleName)),
      },
    }));
  };

  return (
    <div className="space-y-6 text-xs text-slate-800">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
            <Shield className="w-5 h-5 text-[#1A56DB]" />
            Enterprise Security Safeguard & Role Permissions
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Formulate segment-based access controls (None, View Only, Full Edit) governing grade boards, attendance sheets, and curriculum libraries.
          </p>
        </div>

        <div>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-[#1A56DB] hover:bg-opacity-95 text-white text-xs font-bold rounded flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Store Security Policies</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-extrabold uppercase font-mono text-[10px] tracking-wide">SECURITY_POLICIES_COMMITTED</p>
              <p className="text-[11px] text-emerald-700 mt-0.5 font-sans font-medium">The segment permission policies matrix has been serialized securely inside institutional tenant database schemas.</p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wide text-blue-700">Simple permission setup</p>
            <h2 className="text-base font-black text-slate-950">Choose what each group can see or do</h2>
            <p className="text-xs font-semibold text-slate-600">Use this for teachers, parents, students, accountants, supervisors, and admins before giving accounts.</p>
          </div>
          <button type="button" onClick={handleSave} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white">Save all permissions</button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="p-3 font-black text-slate-600">Role group</th>
                {practicalActions.map(action => <th key={action} className="p-3 text-center font-black text-slate-600">{action}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {practicalRoles.map(roleName => (
                <tr key={roleName}>
                  <td className="p-3 font-black text-slate-950">{roleName}</td>
                  {practicalActions.map(action => {
                    const checked = extraRoles[roleName]?.[action] ?? ['Teachers', 'Admins'].includes(roleName);
                    return (
                      <td key={action} className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleExtra(roleName, action)}
                          className={`mx-auto h-8 w-16 rounded-full text-[10px] font-black ${checked ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {checked ? 'YES' : 'NO'}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MATRIX PERMISSIONS GROUP */}
      <div className="space-y-6">
        {permissions.map(p => {
          const cfg = roleLabels[p.role];
          if (!cfg) return null;

          return (
            <div key={p.id} className={`bg-white rounded border border-slate-200 overflow-hidden border-l-4 shadow-xs ${cfg.color}`}>
              {/* Roster Header */}
              <div className="p-4 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <div>
                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5 font-display">
                    <UserCheck className="w-4 h-4 text-slate-550" />
                    {cfg.label}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {cfg.desc}
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded font-mono text-[9px] font-extrabold uppercase bg-slate-900 text-slate-300 tracking-wider">
                  ROLE: {p.role.toUpperCase()}
                </span>
              </div>

              {/* Toggles cluster */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-5 text-xs text-slate-800 select-none bg-white">
                {accessModules.map(module => {
                  const currentVal = p[module.field] as 'View' | 'None' | 'Edit';
                  
                  // segOptions based on whether edit is allowed (dashboard segment is view only or none)
                  const segOptions = module.allowEdit ? ['None', 'View', 'Edit'] : ['None', 'View'];

                  return (
                    <div key={module.field} className="flex flex-col justify-between p-3.5 bg-slate-50/45 border border-slate-200 rounded gap-3">
                      <div>
                        <span className="font-bold text-slate-800 block text-xs leading-none">{module.label}</span>
                        <span className="text-[10px] text-slate-450 mt-1 block leading-tight">{module.desc}</span>
                      </div>

                      {/* Pill options segment */}
                      <div className="flex bg-slate-100 p-0.5 rounded border border-slate-200 w-fit self-start">
                        {segOptions.map(opt => {
                          const isActive = currentVal === opt;
                          return (
                            <button
                              type="button"
                              key={opt}
                              onClick={() => handleChangeAccess(p.role, module.field, opt as any)}
                              className={`px-3 py-1 text-[9px] uppercase tracking-wider font-extrabold rounded-sm transition-all duration-150 cursor-pointer ${
                                isActive 
                                  ? opt === 'None'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : opt === 'Edit'
                                      ? 'bg-slate-900 text-white shadow-xs'
                                      : 'bg-[#1A56DB] text-white shadow-xs'
                                  : 'text-slate-400 hover:text-slate-700'
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MATRIX INFO COMPACT BANNER */}
      <div className="bg-slate-50 border border-slate-300 p-4 rounded text-slate-650 text-xs flex gap-3">
        <ShieldAlert className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wide text-[10px] text-slate-800">Role-Based Identity Segment Safeguards</span>
           <p className="mt-1 text-slate-450">
             Segment-based options restrict academic operations tightly. Granting "Edit" to students is prevented by safety rules unless authorized by the Board of Directors. All changes persist instantly inside local persistence files conforming seamlessly to structural PostgreSQL paradigms.
           </p>
        </div>
      </div>

    </div>
  );
}
