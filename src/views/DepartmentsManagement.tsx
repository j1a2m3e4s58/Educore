/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Department } from '../types';
import { 
  getDepartmentsInStorage, 
  saveDepartmentsInStorage, 
  appendActivityLog 
} from '../data/mockData';

interface DepartmentsManagementProps {
  tenantId: string;
}

export default function DepartmentsManagement({ tenantId }: DepartmentsManagementProps) {
  const [departments, setDepartments] = useState<Department[]>([]);

  // Modals controller
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptToDelete, setDeptToDelete] = useState<Department | null>(null);

  // Form properties
  const [formName, setFormName] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load everything synced
  useEffect(() => {
    setDepartments(getDepartmentsInStorage(tenantId));
  }, [tenantId]);

  const updateDepartmentsState = (newList: Department[]) => {
    setDepartments(newList);
    saveDepartmentsInStorage(tenantId, newList);
  };

  const handleOpenForm = (dept: Department | null = null) => {
    setFormErrors([]);
    if (dept) {
      setEditingDept(dept);
      setFormName(dept.name);
    } else {
      setEditingDept(null);
      setFormName('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formName.trim()) errors.push('Department title represents a mandatory field.');

    const nameDuplicate = departments.find(
      d => d.name.toLowerCase() === formName.trim().toLowerCase() && 
           (!editingDept || d.id !== editingDept.id)
    );
    if (nameDuplicate) errors.push('A department with this exact name already operates in this campus node.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingDept) {
      const updated = departments.map(d => {
        if (d.id === editingDept.id) {
          return {
            ...d,
            name: formName
          };
        }
        return d;
      });
      updateDepartmentsState(updated);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Campus Department Modified',
        details: `Updated properties of department: ${formName}.`,
        type: 'info'
      });
    } else {
      const newDept: Department = {
        id: `dept_${Date.now()}`,
        tenantId,
        name: formName,
        createdAt: new Date().toISOString()
      };
      updateDepartmentsState([...departments, newDept]);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Campus Department Scheduled',
        details: `Scheduled new campus department block: ${formName}.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deptToDelete) return;

    const updated = departments.filter(d => d.id !== deptToDelete.id);
    updateDepartmentsState(updated);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Campus Department Swiped',
      details: `Swiped department registry cell: ${deptToDelete.name}.`,
      type: 'warning'
    });
    setDeptToDelete(null);
  };

  const exportToCSV = () => {
    const headers = ['Department ID', 'Department Title', 'Date Created'];
    const rows = departments.map(d => [d.id, d.name, d.createdAt]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Campus_Departments_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#1A56DB]" />
            Faculty Departments Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map primary administrative and school-board divisions (Languages, Mathematics, Administration, Sciences) mapping teaching nodes beneath them.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportToCSV}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>
          
          <button
            onClick={triggerPrint}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => handleOpenForm(null)}
            className="px-3.5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white text-[11px] font-bold rounded flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Map New Department</span>
          </button>
        </div>
      </div>

      {/* MATRIX TABLE DISPLAY */}
      {departments.length === 0 ? (
        <div className="bg-white rounded border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">No Department Division Mapped</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
            There are no departments chartered for this school tenancy node yet. Click "Map New Department" to register a division slot.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-250 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Internal Division Code</th>
                <th className="px-4 py-3">Department Title</th>
                <th className="px-4 py-3">Charter Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {departments.map(d => (
                <tr key={d.id} className="hover:bg-slate-55/35 hover:bg-slate-50/50 transition-colors select-text">
                  <td className="px-4 py-3.5 font-mono font-bold text-[#1A56DB] uppercase tracking-tight">{d.id}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{d.name}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{d.createdAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenForm(d)}
                        className="p-1 hover:bg-slate-150 text-blue-600 rounded cursor-pointer"
                        title="Edit Department Title"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeptToDelete(d)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        title="Sweep Department"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE & EDIT MODAL SYSTEM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#1A56DB]" />
                {editingDept ? 'EDIT_DEPARTMENT_ROW' : 'CREATE_NEW_CAMPUS_DEPT'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded">
                  <h4 className="font-extrabold text-[10.5px] uppercase flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Validations Rejected:
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] mt-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Campus Department Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Science Department, Languages..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A56DB] text-white font-bold rounded shadow hover:bg-opacity-95 transition-all cursor-pointer"
                >
                  {editingDept ? 'Commit Department Patch' : 'Map Department Slot'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM FLIGHT DIALOG */}
      {deptToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded border border-rose-300 shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-150 text-xs">
            <div className="bg-rose-600 px-4 py-3.5 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider font-mono">Department Raze Authorization</h4>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-655 font-medium leading-relaxed">
                You are about to authorize a permanent and non-reversible wipe of department row: <strong className="text-slate-900">{deptToDelete.name}</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded font-mono text-[10.5px] uppercase">
                DEPT_ID_CODE: {deptToDelete.id}<br />
                SCHO_TID_ISOL: {deptToDelete.tenantId}
              </div>
              <p className="text-[10px] text-rose-600 font-extrabold flex items-center gap-1">
                 Warning: This also orphans teacher associations attached to node.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-100 border-t border-[#E2E8F0] flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setDeptToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-bold cursor-pointer"
              >
                Refuse
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-rose-605 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer shadow"
              >
                Execute Sweeper
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
