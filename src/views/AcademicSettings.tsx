/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Settings, 
  Clock, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AcademicYear, Term, AcademicPeriodType } from '../types';
import { 
  getAcademicYearsInStorage, 
  saveAcademicYearsInStorage, 
  getTermsInStorage, 
  saveTermsInStorage, 
  appendActivityLog 
} from '../data/mockData';

interface AcademicSettingsProps {
  tenantId: string;
}

export default function AcademicSettings({ tenantId }: AcademicSettingsProps) {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);

  // State controls
  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [isTermModalOpen, setIsTermModalOpen] = useState(false);

  // Form properties
  const [formYearName, setFormYearName] = useState('');
  const [formTermName, setFormTermName] = useState('');
  const [formPeriodType, setFormPeriodType] = useState<AcademicPeriodType>('Term');
  
  const [errors, setErrors] = useState<string[]>([]);

  // Load calendar datasets on mount
  useEffect(() => {
    setAcademicYears(getAcademicYearsInStorage(tenantId));
    setTerms(getTermsInStorage(tenantId));
  }, [tenantId]);

  const handleCreateYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYearName.trim()) return;

    // Duplications validation
    const duplicate = academicYears.find(y => y.name.toLowerCase() === formYearName.trim().toLowerCase());
    if (duplicate) {
      setErrors(['An academic session under this naming already exists.']);
      return;
    }

    const newYear: AcademicYear = {
      id: `year_${Date.now()}`,
      tenantId,
      name: formYearName,
      status: academicYears.length === 0 ? 'Active' : 'Inactive', // default active if first
      createdAt: new Date().toISOString()
    };

    const updated = [...academicYears, newYear];
    setAcademicYears(updated);
    saveAcademicYearsInStorage(tenantId, updated);

    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Academic Year Charter',
      details: `Chartered new academic calendar session year: ${formYearName}`,
      type: 'success'
    });

    setFormYearName('');
    setIsYearModalOpen(false);
    setErrors([]);
  };

  const handleCreateTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTermName.trim()) return;

    // Check duplication
    const duplicate = terms.find(t => t.name.toLowerCase() === formTermName.trim().toLowerCase() && (t.periodType || 'Term') === formPeriodType);
    if (duplicate) {
      setErrors([`A ${formPeriodType.toLowerCase()} under this name already exists.`]);
      return;
    }

    const activeYearId = academicYears.find(y => y.status === 'Active')?.id || 'year_default';

    const newTerm: Term = {
      id: `term_${Date.now()}`,
      tenantId,
      academicYearId: activeYearId,
      name: formTermName,
      periodType: formPeriodType,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + (formPeriodType === 'Semester' ? 180 : 90) * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: terms.length === 0 ? 'Active' : 'Inactive', // default active if first
      createdAt: new Date().toISOString()
    };

    const updated = [...terms, newTerm];
    setTerms(updated);
    saveTermsInStorage(tenantId, updated);

    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Academic Period Scheduled',
      details: `Scheduled new ${formPeriodType.toLowerCase()}: ${formTermName}`,
      type: 'success'
    });

    setFormTermName('');
    setFormPeriodType('Term');
    setIsTermModalOpen(false);
    setErrors([]);
  };

  const toggleYearActive = (yearId: string) => {
    const updated = academicYears.map(y => {
      const status: AcademicYear['status'] = y.id === yearId ? 'Active' : 'Inactive';
      if (status === 'Active') {
        appendActivityLog({
          tenantId,
          user: 'School Admin',
          action: 'Academic Year Activated',
          details: `Activated academic session year block: ${y.name}`,
          type: 'info'
        });
      }
      return { ...y, status };
    });
    setAcademicYears(updated);
    saveAcademicYearsInStorage(tenantId, updated);
  };

  const toggleTermActive = (termId: string) => {
    const updated = terms.map(t => {
      const status: Term['status'] = t.id === termId ? 'Active' : 'Inactive';
      if (status === 'Active') {
        appendActivityLog({
          tenantId,
          user: 'School Admin',
          action: 'Academic Period Activated',
          details: `Activated school ${(t.periodType || 'Term').toLowerCase()} block: ${t.name}`,
          type: 'info'
        });
      }
      return { ...t, status };
    });
    setTerms(updated);
    saveTermsInStorage(tenantId, updated);
  };

  const handleDeleteYear = (yearId: string, name: string) => {
    const target = academicYears.find(y => y.id === yearId);
    if (target?.status === 'Active' && academicYears.length > 1) {
      alert('STRICT_CALENDAR_RULE: You cannot delete the currently ACTIVE academic year. Activating an alternate year first is required.');
      return;
    }

    const updated = academicYears.filter(y => y.id !== yearId);
    setAcademicYears(updated);
    saveAcademicYearsInStorage(tenantId, updated);

    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Calendar Session Deleted',
      details: `Deleted academic year calendar row: ${name}`,
      type: 'warning'
    });
  };

  const handleDeleteTerm = (termId: string, name: string) => {
    const target = terms.find(t => t.id === termId);
    if (target?.status === 'Active' && terms.length > 1) {
      alert('STRICT_CALENDAR_RULE: You cannot delete the currently ACTIVE school period. Toggle active status on another period first.');
      return;
    }

    const updated = terms.filter(t => t.id !== termId);
    setTerms(updated);
    saveTermsInStorage(tenantId, updated);

    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Academic Period Expunged',
      details: `Expunged calendar period: ${name}`,
      type: 'warning'
    });
  };

  const activeYear = academicYears.find(y => y.status === 'Active')?.name || 'None Set';
  const activeTermRecord = terms.find(t => t.status === 'Active');
  const activeTerm = activeTermRecord ? `${activeTermRecord.name} (${activeTermRecord.periodType || 'Term'})` : 'None Set';

  return (
    <div className="space-y-6">
      
      {/* HEADER CALENDAR CONTROL */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#1A56DB]" />
            Academic Sessions & Calendar Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure semesters, map official school years, and toggle the central active status parameters governing student enrollment boundaries.
          </p>
        </div>

        {/* Current status display tags */}
        <div className="bg-slate-50 border border-slate-205 p-3 rounded flex items-center gap-4 text-xs font-bold shrink-0">
          <div className="flex items-center gap-1.5 border-r border-slate-200 pr-4">
            <Clock className="w-4 h-4 text-[#1A56DB]" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase leading-none">Active Year</p>
              <h4 className="text-slate-800 mt-1">{activeYear}</h4>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-emerald-600" />
            <div>
              <p className="text-[9px] text-slate-400 uppercase leading-none">Active Period</p>
              <h4 className="text-slate-800 mt-1">{activeTerm}</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ACADEMIC YEARS BOX */}
        <div className="bg-white rounded border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase font-mono text-slate-700 tracking-wider">ACADEMIC_YEARS_LEDGER</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Declare active fiscal sessions.</p>
            </div>
            <button
              onClick={() => { setErrors([]); setIsYearModalOpen(true); }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Declare Year
            </button>
          </div>

          <div className="space-y-2">
            {academicYears.map(y => {
              const isActive = y.status === 'Active';
              return (
                <div 
                  key={y.id} 
                  className={`p-3.5 rounded border flex items-center justify-between transition-all select-none ${
                    isActive 
                      ? 'bg-blue-50/60 border-blue-300 text-blue-900' 
                      : 'bg-slate-50/40 border-slate-200 text-slate-600 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-sm ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{y.name} Academic Session</h4>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                        Enrolled: {y.createdAt ? new Date(y.createdAt).toLocaleDateString() : 'Continuous'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-blue-600 bg-white border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> CURRENT_SESSION
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleYearActive(y.id)}
                        className="px-2.5 py-1 text-[9.5px] bg-white border border-slate-200 font-bold hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteYear(y.id, y.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            
            {academicYears.length === 0 && (
              <p className="text-xs text-slate-400 italic p-2">No academic years configured. Please declare session years.</p>
            )}
          </div>
        </div>

        {/* ACADEMIC TERMS BOX */}
        <div className="bg-white rounded border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase font-mono text-slate-700 tracking-wider">TERMS_AND_SEMESTERS</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Choose the period model each school uses: 3 terms or 2 semesters.</p>
            </div>
            <button
              onClick={() => { setErrors([]); setIsTermModalOpen(true); }}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Period
            </button>
          </div>

          <div className="space-y-2">
            {terms.map(t => {
              const isActive = t.status === 'Active';
              const periodType = t.periodType || (t.name.toLowerCase().includes('semester') ? 'Semester' : 'Term');
              return (
                <div 
                  key={t.id} 
                  className={`p-3.5 rounded border flex items-center justify-between transition-all select-none ${
                    isActive 
                      ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900' 
                      : 'bg-slate-50/40 border-slate-200 text-slate-600 hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-sm ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-550'}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs">{t.name}</h4>
                      <p className="text-[9.5px] text-slate-400 font-mono mt-0.5">
                         {periodType} // {t.startDate} to {t.endDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isActive ? (
                      <span className="text-[9px] uppercase tracking-widest font-extrabold text-emerald-700 bg-white border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> CURRENT_{periodType.toUpperCase()}
                      </span>
                    ) : (
                      <button
                        onClick={() => toggleTermActive(t.id)}
                        className="px-2.5 py-1 text-[9.5px] bg-white border border-slate-200 font-bold hover:bg-slate-100 rounded text-slate-700 cursor-pointer"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteTerm(t.id, t.name)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {terms.length === 0 && (
              <p className="text-xs text-slate-400 italic p-2">No school periods configured. Add Term 1, Term 2, Term 3 or Semester 1, Semester 2.</p>
            )}
          </div>
        </div>

      </div>

      {/* COMPLIANCE WARNING */}
      <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-650 shrink-0 mt-0.5 text-blue-600" />
        <div className="text-xs leading-relaxed">
          <h4 className="font-bold uppercase tracking-wider text-[11px]">System Compliance Enforcement</h4>
          <p className="mt-1 text-blue-700">
            Toggling the Active Academic Year or Period acts as a global namespace filter inside the databases. All records generated by teachers (grade sheets, classroom rosters) during this active epoch will be stamped with the respective Active parameters. Please evaluate session transitions during normal off-hours to prevent reporting lag.
          </p>
        </div>
      </div>

      {/* SESSION DECLARE MODAL */}
      {isYearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="bg-[#0A1E33] px-5 py-3.5 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="font-bold font-mono text-xs uppercase tracking-wider">CHARTER_NEW_ACAD_YEAR</h3>
              <button onClick={() => setIsYearModalOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateYear} className="p-5 space-y-4">
              
              {errors.length > 0 && (
                <p className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10.5px] font-medium">
                  {errors[0]}
                </p>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 uppercase block">Academic Year Code Designation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2025/2026 or 2026/2027"
                  value={formYearName}
                  onChange={(e) => setFormYearName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#1A56DB] text-white hover:bg-opacity-95 rounded font-bold shadow transition-all cursor-pointer"
              >
                Charter New Academic Session
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TERM SCHEDULE MODAL */}
      {isTermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-sm bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-xs">
            
            <div className="bg-[#0A1E33] px-5 py-3.5 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="font-bold font-mono text-xs uppercase tracking-wider">ADD_TERM_OR_SEMESTER</h3>
              <button onClick={() => setIsTermModalOpen(false)} className="text-slate-400 cursor-pointer hover:text-white">
                <Plus className="w-4 h-4 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateTerm} className="p-5 space-y-4">
              
              {errors.length > 0 && (
                <p className="p-2.5 bg-rose-50 text-rose-800 border border-rose-200 rounded text-[10.5px] font-medium">
                  {errors[0]}
                </p>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 uppercase block">Academic Period Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Term', 'Semester'] as AcademicPeriodType[]).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setFormPeriodType(type); setFormTermName(type === 'Semester' ? 'Semester 1' : 'Term 1'); }}
                      className={`py-2 border text-[11px] font-bold ${formPeriodType === type ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-550 uppercase block">Period Name</label>
                <input
                  type="text"
                  required
                  placeholder={formPeriodType === 'Semester' ? 'e.g. Semester 1 or Semester 2' : 'e.g. Term 1, Term 2, Term 3'}
                  value={formTermName}
                  onChange={(e) => setFormTermName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(formPeriodType === 'Semester' ? ['Semester 1', 'Semester 2'] : ['Term 1', 'Term 2', 'Term 3']).map(name => (
                  <button key={name} type="button" onClick={() => setFormTermName(name)} className="py-2 bg-slate-50 border border-slate-200 text-slate-700 font-bold text-[10px]">{name}</button>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow transition-all cursor-pointer"
              >
                Save {formPeriodType}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
