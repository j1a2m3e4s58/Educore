/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Layers, 
  User, 
  BookOpen, 
  Users, 
  X, 
  Check, 
  AlertTriangle,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { Class, Teacher, Subject, Student } from '../types';
import { 
  getClassesInStorage, 
  saveClassesInStorage, 
  getTeachersInStorage, 
  getSubjectsInStorage, 
  getStudentsInStorage,
  appendActivityLog 
} from '../data/mockData';

interface ClassesManagementProps {
  tenantId: string;
}

export default function ClassesManagement({ tenantId }: ClassesManagementProps) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  // Modals controller
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classToDelete, setClassToDelete] = useState<Class | null>(null);

  // Form parameters
  const [formName, setFormName] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formSubjectIds, setFormSubjectIds] = useState<string[]>([]);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load everything synced
  useEffect(() => {
    setClasses(getClassesInStorage(tenantId));
    setTeachers(getTeachersInStorage(tenantId));
    setSubjects(getSubjectsInStorage(tenantId));
    setStudents(getStudentsInStorage(tenantId));
  }, [tenantId]);

  const updateClassesState = (newList: Class[]) => {
    setClasses(newList);
    saveClassesInStorage(tenantId, newList);
  };

  const handleOpenForm = (cls: Class | null = null) => {
    setFormErrors([]);
    if (cls) {
      setEditingClass(cls);
      setFormName(cls.name);
      setFormTeacherId(cls.classTeacherId || '');
      setFormSubjectIds(cls.subjectIds || []);
    } else {
      setEditingClass(null);
      setFormName('');
      setFormTeacherId(teachers[0]?.id || '');
      setFormSubjectIds([]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formName.trim()) errors.push('Class name is required (e.g. Basic 1, JHS 2).');
    
    const duplicateClass = classes.find(
      c => c.name.toLowerCase() === formName.trim().toLowerCase() && 
           (!editingClass || c.id !== editingClass.id)
    );
    if (duplicateClass) errors.push('A classroom room with this name is already allocated.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingClass) {
      const updated = classes.map(c => {
        if (c.id === editingClass.id) {
          return {
            ...c,
            name: formName,
            classTeacherId: formTeacherId || undefined,
            subjectIds: formSubjectIds
          };
        }
        return c;
      });
      updateClassesState(updated);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Classroom Structure Edited',
        details: `Edited properties of class division room: ${formName}.`,
        type: 'info'
      });
    } else {
      const newClass: Class = {
        id: `class_${Date.now()}`,
        tenantId,
        name: formName,
        classTeacherId: formTeacherId || undefined,
        subjectIds: formSubjectIds,
        createdAt: new Date().toISOString()
      };
      updateClassesState([...classes, newClass]);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Classroom Structure Allocated',
        details: `Created and allocated new class division room: ${formName}.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!classToDelete) return;

    // Check if there are active students enrolled so they don't get orphaned without feedback
    const studentCount = students.filter(s => s.classId === classToDelete.id).length;
    if (studentCount > 0) {
      alert(`STRICT_FK_VIOLATION: ${studentCount} active students are currently enrolled in classroom ${classToDelete.name}. Please re-assign them to other classrooms first.`);
      setClassToDelete(null);
      return;
    }

    const updated = classes.filter(c => c.id !== classToDelete.id);
    updateClassesState(updated);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Classroom Swapped/Removed',
      details: `Disposed classroom allocation node: ${classToDelete.name}.`,
      type: 'warning'
    });
    setClassToDelete(null);
  };

  const toggleSubjectInForm = (subjectId: string) => {
    if (formSubjectIds.includes(subjectId)) {
      setFormSubjectIds(formSubjectIds.filter(id => id !== subjectId));
    } else {
      setFormSubjectIds([...formSubjectIds, subjectId]);
    }
  };

  const exportToCSV = () => {
    const headers = ['Class Room Name', 'Class Teacher', 'Subject Code List', 'Enrolled Occupants'];
    const rows = classes.map(c => {
      const matchTeach = teachers.find(t => t.id === c.classTeacherId)?.fullName || 'None';
      const subjCodes = c.subjectIds.map(sid => subjects.find(s => s.id === sid)?.code).filter(Boolean).join(' | ');
      const matchingCount = students.filter(s => s.classId === c.id).length;
      return [c.name, matchTeach, subjCodes, matchingCount];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Classes_Ledger_Isol_${tenantId}.csv`);
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
            <Layers className="w-5 h-5 text-[#1A56DB]" />
            Scholastic Clusters & Class Rooms Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Build grade structures (Basic 1, JHS 2, etc.), manage classroom teacher assignments, align teaching curricula, and monitor enrolled student occupancy rates.
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
            <span>Allocate Class Room</span>
          </button>
        </div>
      </div>

      {/* MATRIX GRID DISPLAY */}
      {classes.length === 0 ? (
        <div className="bg-white rounded border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">No Classroom Allocated</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
            There are no grades or classes assigned to this isolated tenant node. Click "Allocate Class Room" to start mapping.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {classes.map(c => {
            const classTeacherObj = teachers.find(t => t.id === c.classTeacherId);
            const classSubjects = c.subjectIds.map(sid => subjects.find(s => s.id === sid)).filter(Boolean) as Subject[];
            
            // DYNAMIC OCCUPANCY CALCULATION
            const enrolledCount = students.filter(s => s.classId === c.id).length;

            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded p-5 relative flex flex-col gap-4 shadow-xs">
                
                {/* Header row */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 font-display">{c.name} Class</h3>
                    <p className="text-[10px] text-slate-450 font-mono focus:select-all">
                       ID_MAPPING: {c.id}
                    </p>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenForm(c)}
                      className="p-1 hover:bg-slate-100 text-slate-600 rounded transition-all cursor-pointer"
                      title="Edit Room Config"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setClassToDelete(c)}
                      className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-all cursor-pointer"
                      title="Dispose Class Node"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info row */}
                <div className="grid grid-cols-2 gap-3 bg-slate-50 border border-slate-150 p-3 rounded text-[11px]">
                  {/* Occupant density */}
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                       <Users className="w-3 h-3 text-slate-400" /> Density Occupants
                    </span>
                    <span className="font-extrabold text-[#1A56DB] text-xs">
                       {enrolledCount} Students Enrolled
                    </span>
                  </div>

                  {/* Classroom Teacher */}
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase font-bold text-slate-400 flex items-center gap-1">
                       <User className="w-3 h-3 text-slate-400" /> Class Mentor
                    </span>
                    <span className="font-bold text-slate-800 truncate block">
                       {classTeacherObj?.fullName || 'Standby Teacher'}
                    </span>
                  </div>
                </div>

                {/* Subj collection in bento block */}
                <div className="space-y-1.5 flex-1 select-text">
                  <span className="text-[9px] uppercase font-bold text-slate-450 tracking-wide block">
                     Teaching Curriculum Subjects ({classSubjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {classSubjects.map(s => (
                      <span key={s.id} className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-[#1A56DB] text-[9.5px] font-semibold">
                        {s.name} ({s.code})
                      </span>
                    ))}
                    {classSubjects.length === 0 && (
                      <span className="text-[10px] text-slate-400 italic">No subject mapped to classroom.</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* CLASS ACC DISPLACEMENT FORMS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-lg bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-blue-500" />
                {editingClass ? 'EDIT_CLASSROOM_CONGIG' : 'NEW_CLASSROOM_SECTOR_ALLOC'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              
              {formErrors.length > 0 && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded border border-rose-200">
                  <h4 className="font-extrabold text-[10.5px] uppercase flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Constraints Rejected:
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-[9.5px] mt-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Class Room Division Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Basic 1, JHS 1, JHS 2..."
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Mentor teacher */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Classroom Head / Mentor</label>
                <select
                  value={formTeacherId}
                  onChange={(e) => setFormTeacherId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded bg-white cursor-pointer font-bold text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Mentor Teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.fullName} ({t.staffId})</option>
                  ))}
                </select>
              </div>

              {/* Subjects mapped checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Align Curriculum Subjects mapped</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded border border-slate-150">
                  {subjects.map(s => {
                    const isChecked = formSubjectIds.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectInForm(s.id)}
                        className={`p-2 rounded text-left border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50/75 border-blue-300 text-[#1A56DB] font-bold shadow-xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate pr-1">{s.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                  {subjects.length === 0 && (
                    <div className="col-span-2 text-slate-400 p-1 text-[10px] italic">Please create subjects under Subjects directory.</div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white rounded font-bold shadow transition-all cursor-pointer"
                >
                  {editingClass ? 'Commit Classroom Patch' : 'Allocate Cluster Entry'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DISPOSAL DIALOG ALERT */}
      {classToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded border border-rose-300 shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-150 text-xs">
            <div className="bg-rose-605 bg-rose-600 px-4 py-3.5 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider font-mono">Structure Displacement Confirmation</h4>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-655 font-medium leading-relaxed">
                Warning: You are requesting displacement of class room: <strong className="text-slate-900">{classToDelete.name}</strong>.
              </p>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded font-mono text-[10.5px] uppercase">
                CLASS_ID: {classToDelete.id}<br />
                SUBJECTS_COUNT: {classToDelete.subjectIds.length} subjects
              </div>
              <p className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1">
                 Note: Active students enrolled will block displacement triggers.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-100 border-t border-[#E2E8F0] flex items-center justify-end gap-2.5">
              <button
                onClick={() => setClassToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-750 text-white hover:bg-rose-700 rounded font-bold cursor-pointer shadow"
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
