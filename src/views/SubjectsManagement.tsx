/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  BookOpen, 
  X, 
  AlertTriangle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Subject } from '../types';
import { 
  getSubjectsInStorage, 
  saveSubjectsInStorage, 
  appendActivityLog 
} from '../data/mockData';

interface SubjectsManagementProps {
  tenantId: string;
}

export default function SubjectsManagement({ tenantId }: SubjectsManagementProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Modals controller
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);

  // Form properties
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load everything synced
  useEffect(() => {
    setSubjects(getSubjectsInStorage(tenantId));
  }, [tenantId]);

  const updateSubjectsState = (newList: Subject[]) => {
    setSubjects(newList);
    saveSubjectsInStorage(tenantId, newList);
  };

  const handleOpenForm = (subj: Subject | null = null) => {
    setFormErrors([]);
    if (subj) {
      setEditingSubject(subj);
      setFormName(subj.name);
      setFormCode(subj.code);
    } else {
      setEditingSubject(null);
      setFormName('');
      const generatedCode = `SUB-${String(Math.floor(100+Math.random()*900))}`;
      setFormCode(generatedCode);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formName.trim()) errors.push('Subject Name is required.');
    if (!formCode.trim()) errors.push('Course Code abbreviation is required.');

    const nameDuplicate = subjects.find(
      s => s.name.toLowerCase() === formName.trim().toLowerCase() && 
           (!editingSubject || s.id !== editingSubject.id)
    );
    if (nameDuplicate) errors.push('A subject with this exact name exists.');

    const codeDuplicate = subjects.find(
      s => s.code.toUpperCase() === formCode.trim().toUpperCase() && 
           (!editingSubject || s.id !== editingSubject.id)
    );
    if (codeDuplicate) errors.push('A subject with this Course Code already exists.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingSubject) {
      const updated = subjects.map(s => {
        if (s.id === editingSubject.id) {
          return {
            ...s,
            name: formName,
            code: formCode.toUpperCase()
          };
        }
        return s;
      });
      updateSubjectsState(updated);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Subject Syllabus Modified',
        details: `Updated subject record: ${formName} (${formCode.toUpperCase()}).`,
        type: 'info'
      });
    } else {
      const newSubj: Subject = {
        id: `subj_${Date.now()}`,
        tenantId,
        name: formName,
        code: formCode.toUpperCase(),
        createdAt: new Date().toISOString()
      };
      updateSubjectsState([...subjects, newSubj]);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Subject Syllabus Allocated',
        details: `Allocated new subject row: ${formName} (${formCode.toUpperCase()}).`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!subjectToDelete) return;

    const updated = subjects.filter(s => s.id !== subjectToDelete.id);
    updateSubjectsState(updated);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Subject Syllabus Disposed',
      details: `Disposed subject registry row: ${subjectToDelete.name} (${subjectToDelete.code}).`,
      type: 'warning'
    });
    setSubjectToDelete(null);
  };

  const exportToCSV = () => {
    const headers = ['Subject Code', 'Course Title', 'Date Created'];
    const rows = subjects.map(s => [s.code, s.name, s.createdAt]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Subjects_Curriculum_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#1A56DB]" />
            Academic Curriculum & Research Subjects
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Centrally manage localized teaching courses (English, Mathematics, Science, ICT, RME, Twi) mapping unique, indexable syllabus row entries.
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
            <span>Map New Subject</span>
          </button>
        </div>
      </div>

      {/* MATRIX TABLE DISPLAY */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 rounded-full text-slate-400 mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">No Course Mapped</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
            There are no teaching courses or curriculum items registered on your school tenancy node. Click "Map New Subject" to provision.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-250 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Course Code Abbr</th>
                <th className="px-4 py-3">Course Title / Subject Name</th>
                <th className="px-4 py-3">Syllabus Seeding Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {subjects.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-all select-text">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-650 text-blue-700">{s.code}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{s.name}</td>
                  <td className="px-4 py-3.5 text-slate-400 font-mono text-[11px]">{s.createdAt}</td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenForm(s)}
                        className="p-1 hover:bg-slate-150 text-blue-600 rounded cursor-pointer"
                        title="Modify Subject Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setSubjectToDelete(s)}
                        className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                        title="Wipe Subject"
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

      {/* CREATE / EDIT MODAL SCREEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-md bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-500" />
                {editingSubject ? 'CONGIG_SUBJECT_PARAMS' : 'ALLOC_NEW_SUBJECT_ROW'}
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
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Course Subject Title</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Religious & Moral Education, ICT..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Course Code Abbr</label>
                <input
                  type="text"
                  required
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="RME, GHA, ICT..."
                  className="w-full px-3 py-2 border border-slate-200 rounded font-mono uppercase bg-slate-50 focus:bg-white focus:outline-none"
                />
              </div>

              {/* Actions bars */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-150 text-xs">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A56DB] text-white hover:bg-opacity-95 font-bold rounded shadow transition-all cursor-pointer"
                >
                  {editingSubject ? 'Commit Subject Patch' : 'Map Syllabus Entry'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DISPOSAL DIALOG ALERT */}
      {subjectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded border border-rose-300 shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-150 text-xs">
            <div className="bg-rose-600 px-4 py-3.5 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider font-mono">Curriculum Node Sweeper Confirmation</h4>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-655 font-medium leading-relaxed">
                You are requesting to permanently swipe curriculum item: <strong className="text-slate-900">{subjectToDelete.name}</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded font-mono text-[10.5px] uppercase">
                COURSE_CODE: {subjectToDelete.code}<br />
                SCHO_TID_ISOL: {subjectToDelete.tenantId}
              </div>
              <p className="text-[10px] text-rose-605 text-rose-600 font-extrabold flex items-center gap-1">
                 Warning: Relational mapping in classroom directories will be detached.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2.5 text-xs">
              <button
                onClick={() => setSubjectToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-bold cursor-pointer"
              >
                Refuse
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer shadow"
              >
                Execute Sweep
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
