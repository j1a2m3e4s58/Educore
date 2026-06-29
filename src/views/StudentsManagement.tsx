/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  X, 
  Check, 
  AlertTriangle,
  FileSpreadsheet,
  FileText,
  UserCheck,
  UserX,
  CreditCard,
  User
} from 'lucide-react';
import { Student, Class } from '../types';
import { 
  getStudentsInStorage, 
  saveStudentsInStorage, 
  getClassesInStorage,
  appendActivityLog 
} from '../data/mockData';

interface StudentsManagementProps {
  tenantId: string;
}

export default function StudentsManagement({ tenantId }: StudentsManagementProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState('');
  const [filterClass, setFilterClass] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Modals controller
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  // Form parameters
  const [formName, setFormName] = useState('');
  const [formStudentId, setFormStudentId] = useState('');
  const [formClassId, setFormClassId] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formParentName, setFormParentName] = useState('');
  const [formParentPhone, setFormParentPhone] = useState('');
  const [formParentEmail, setFormParentEmail] = useState('');
  const [formDob, setFormDob] = useState('');
  const [formAdmissionDate, setFormAdmissionDate] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended' | 'Inactive'>('Active');
  const [formPhoto, setFormPhoto] = useState('');

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load datasets on sync
  useEffect(() => {
    setStudents(getStudentsInStorage(tenantId));
    setClasses(getClassesInStorage(tenantId));
  }, [tenantId]);

  const updateStudentsState = (newList: Student[]) => {
    setStudents(newList);
    saveStudentsInStorage(tenantId, newList);
  };

  const handleOpenForm = (student: Student | null = null) => {
    setFormErrors([]);
    if (student) {
      setEditingStudent(student);
      setFormName(student.fullName);
      setFormStudentId(student.studentId);
      setFormClassId(student.classId);
      setFormGender(student.gender);
      setFormParentName(student.parentName);
      setFormParentPhone(student.parentPhone);
      setFormParentEmail(student.parentEmail);
      setFormDob(student.dateOfBirth);
      setFormAdmissionDate(student.admissionDate);
      setFormStatus(student.status);
      setFormPhoto(student.profilePhoto || '');
    } else {
      setEditingStudent(null);
      setFormName('');
      // Auto generate default student ID code
      const generatedId = `STU-${String(Math.floor(100+Math.random()*900))}`;
      setFormStudentId(generatedId);
      setFormClassId(classes[0]?.id || '');
      setFormGender('Male');
      setFormParentName('');
      setFormParentPhone('');
      setFormParentEmail('');
      // Sensible default dates
      setFormDob('2014-06-15');
      setFormAdmissionDate(new Date().toISOString().split('T')[0]);
      setFormStatus('Active');
      setFormPhoto('');
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    // Validations
    if (!formName.trim()) errors.push('Full name is required.');
    if (!formStudentId.trim()) errors.push('Student unique ID code is required.');
    if (!formClassId) errors.push('Please map the student to a designated Class.');
    if (!formParentName.trim()) errors.push('Parent or Guardian name is required.');

    // Check telephone format quickly 
    if (formParentPhone.length < 5) errors.push('Parent phone contract requires a valid formatting.');

    const duplicateId = students.find(
      s => s.studentId.toUpperCase() === formStudentId.trim().toUpperCase() && 
           (!editingStudent || s.id !== editingStudent.id)
    );
    if (duplicateId) errors.push('A student with this Student ID code is already recorded.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingStudent) {
      const updated = students.map(s => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            fullName: formName,
            studentId: formStudentId,
            classId: formClassId,
            gender: formGender,
            parentName: formParentName,
            parentPhone: formParentPhone,
            parentEmail: formParentEmail,
            dateOfBirth: formDob,
            admissionDate: formAdmissionDate,
            status: formStatus,
            profilePhoto: formPhoto
          };
        }
        return s;
      });
      updateStudentsState(updated);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Student Profile Revamped',
        details: `Refurbished profile information for student registrar: ${formName} (${formStudentId})`,
        type: 'info'
      });
    } else {
      const newStudent: Student = {
        id: `stu_${Date.now()}`,
        tenantId,
        fullName: formName,
        studentId: formStudentId,
        classId: formClassId,
        gender: formGender,
        parentName: formParentName,
        parentPhone: formParentPhone,
        parentEmail: formParentEmail,
        dateOfBirth: formDob,
        admissionDate: formAdmissionDate,
        status: formStatus,
        profilePhoto: formPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${formStudentId}`,
        createdAt: new Date().toISOString()
      };
      updateStudentsState([...students, newStudent]);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Student Enrolled',
        details: `Enrolled new student node: ${formName} (${formStudentId}) mapped into class room.`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!studentToDelete) return;

    const updated = students.filter(s => s.id !== studentToDelete.id);
    updateStudentsState(updated);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Student Deregistered',
      details: `Purged student record row: ${studentToDelete.fullName} (${studentToDelete.studentId}).`,
      type: 'warning'
    });
    setStudentToDelete(null);
  };

  const handleToggleStatus = (studentId: string) => {
    const updated = students.map(s => {
      if (s.id === studentId) {
        const nextStatus: Student['status'] = s.status === 'Active' ? 'Suspended' : 'Active';
        appendActivityLog({
          tenantId,
          user: 'School Admin',
          action: 'Student Status Modified',
          details: `Modified student ${s.fullName} status to ${nextStatus}.`,
          type: 'info'
        });
        return { ...s, status: nextStatus };
      }
      return s;
    });
    updateStudentsState(updated);
  };

  // CSV Export
  const exportToCSV = () => {
    const headers = ['Student ID', 'Full Name', 'Class Room', 'Gender', 'Parent Name', 'Parent Email', 'Parent Phone', 'Admission Date', 'Status'];
    const rows = filteredStudents.map(s => {
      const clsName = classes.find(c => c.id === s.classId)?.name || 'Unassigned';
      return [s.studentId, s.fullName, clsName, s.gender, s.parentName, s.parentEmail, s.parentPhone, s.admissionDate, s.status];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Students_Registry_Isol_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  // Queries application
  const filteredStudents = students.filter(s => {
    const matchesQuery = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.parentName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = filterClass === 'ALL' || s.classId === filterClass;
    const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;

    return matchesQuery && matchesClass && matchesStatus;
  });

  return (
    <div className="students-management-page space-y-6">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between bg-white p-4 sm:p-5 rounded-2xl sm:rounded border border-slate-100 shadow-sm gap-4">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#1A56DB]" />
            Students
          </h1>
          <p className="text-sm sm:text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
            View students, parents, classes, and status in one place.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={exportToCSV}
            className="min-h-10 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white text-xs font-bold rounded-xl sm:rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export</span>
          </button>
          
          <button
            onClick={triggerPrint}
            className="min-h-10 px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white text-xs font-bold rounded-xl sm:rounded flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Print</span>
          </button>

          <button
            onClick={() => handleOpenForm(null)}
            className="col-span-2 sm:col-span-1 min-h-11 px-3.5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white text-sm sm:text-xs font-bold rounded-xl sm:rounded flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* FILTER SEARCHES BAR */}
      <div className="bg-white p-4 rounded-2xl sm:rounded border border-slate-200/65 grid grid-cols-1 md:grid-cols-[1fr_auto_auto] md:items-center gap-3">
        {/* Search */}
        <div className="relative min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, ID, or parent..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-11 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-xl sm:rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Filter Class */}
        <label className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] uppercase font-bold text-slate-500 shrink-0">Class</span>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full md:w-auto min-h-11 px-3 py-2 text-sm border border-slate-200 rounded-xl sm:rounded font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        {/* Filter Status */}
        <label className="flex items-center gap-2 min-w-0">
          <span className="text-[11px] uppercase font-bold text-slate-500 shrink-0">Status</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full md:w-auto min-h-11 px-3 py-2 text-sm border border-slate-200 rounded-xl sm:rounded font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>
      </div>

      {/* ROSTER TABLE GRID */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl sm:rounded border border-slate-200 p-8 sm:p-12 text-center flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 rounded-full text-slate-400 mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="text-base font-bold text-slate-800">No Students Found</h2>
          <p className="text-sm text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
            Try another search, or tap Add Student to create a new student record.
          </p>
        </div>
      ) : (
        <>
          <div className="md:hidden space-y-3">
            {filteredStudents.map(s => {
              const mappedClass = classes.find(c => c.id === s.classId);
              const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
              return (
                <article key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4 overflow-hidden">
                  <div className="flex items-start gap-3 min-w-0">
                    <img
                      src={s.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.studentId}`}
                      alt={s.fullName}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 leading-tight break-words">{s.fullName}</h3>
                          <p className="text-xs font-mono text-[#1A56DB] font-bold mt-1 break-all">{s.studentId}</p>
                        </div>
                        <span className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
                          s.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : s.status === 'Suspended'
                              ? 'bg-rose-50 text-rose-700 border border-rose-100'
                              : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{s.gender} • Born {s.dateOfBirth}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[11px] uppercase font-extrabold text-slate-500">Class</p>
                      <p className="font-bold text-slate-900 break-words">{mappedClass?.name || 'Not assigned'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[11px] uppercase font-extrabold text-slate-500">Parent / Guardian</p>
                      <p className="font-bold text-slate-900 break-words">{s.parentName}</p>
                      <p className="text-xs text-slate-600 mt-1 break-all">{s.parentPhone}</p>
                      <p className="text-xs text-slate-500 break-all">{s.parentEmail || 'No email added'}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3">
                      <p className="text-[11px] uppercase font-extrabold text-slate-500">Admission Date</p>
                      <p className="font-bold text-slate-900">{s.admissionDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setViewingStudent(s)}
                      className="min-h-11 px-3 py-2 text-sm bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => handleOpenForm(s)}
                      className="min-h-11 px-3 py-2 text-sm bg-blue-50 border border-blue-100 hover:bg-blue-100 text-blue-700 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Change ${s.fullName} to ${nextStatus}?`)) {
                          handleToggleStatus(s.id);
                        }
                      }}
                      className={`min-h-11 px-3 py-2 text-sm border font-bold rounded-xl transition-colors cursor-pointer ${
                        s.status === 'Active' ? 'bg-rose-50 border-rose-100 text-rose-700 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {s.status === 'Active' ? 'Pause' : 'Activate'}
                    </button>
                    <button
                      onClick={() => setStudentToDelete(s)}
                      className="min-h-11 px-3 py-2 text-sm bg-white border border-rose-100 hover:bg-rose-50 text-rose-700 font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden md:block bg-white rounded border border-slate-250 overflow-x-auto shadow-sm">
          <table className="w-full min-w-[980px] text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Student Name</th>
                <th className="px-4 py-3">Student ID</th>
                <th className="px-4 py-3">Class Assigned</th>
                <th className="px-4 py-3">Parent/Guardian Info</th>
                <th className="px-4 py-3">Admission Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-850">
              {filteredStudents.map(s => {
                const mappedClass = classes.find(c => c.id === s.classId);
                return (
                  <tr key={s.id} className="hover:bg-slate-55/40 hover:bg-slate-50/50 transition-colors select-text">
                    {/* Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.studentId}`}
                          alt={s.fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 leading-none">{s.fullName}</h4>
                          <span className="text-[10px] font-mono text-slate-450 uppercase mt-1 inline-block">
                             {s.gender} • DOB {s.dateOfBirth}
                          </span>
                        </div>
                      </div>
                    </td>
                    {/* ID */}
                    <td className="px-4 py-3.5 font-mono font-bold text-[#1A56DB]">{s.studentId}</td>
                    {/* Class */}
                    <td className="px-4 py-3.5 font-bold text-slate-800">
                      {mappedClass ? (
                        <span className="px-2 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-700 font-mono text-[10px]">
                           {mappedClass.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned Room</span>
                      )}
                    </td>
                    {/* Guardian */}
                    <td className="px-4 py-3.5 whitespace-normal">
                      <div className="font-semibold text-slate-800">{s.parentName}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 select-all font-mono">
                        {s.parentPhone} • {s.parentEmail || 'No Email'}
                      </div>
                    </td>
                    {/* Admission */}
                    <td className="px-4 py-3.5">
                      <span className="text-slate-700 font-medium">{s.admissionDate}</span>
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        s.status === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : s.status === 'Suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingStudent(s)}
                          className="p-1 px-2 text-[10px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded transition-colors cursor-pointer"
                          title="View transcript & family profile"
                        >
                          Profile
                        </button>
                        
                        <button
                          onClick={() => {
                            const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
                            if (window.confirm(`Change ${s.fullName} to ${nextStatus}?`)) {
                              handleToggleStatus(s.id);
                            }
                          }}
                          className={`p-1 rounded cursor-pointer ${
                            s.status === 'Active' ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={s.status === 'Active' ? 'Suspend Student' : 'Activate Student'}
                        >
                          {s.status === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenForm(s)}
                          className="p-1 text-blue-600 hover:bg-slate-55 rounded cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        
                        <button
                          onClick={() => setStudentToDelete(s)}
                          className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      {/* ADMISSION & STUDENT MUTATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded-2xl sm:rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 text-sm">
            
            {/* Header info */}
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white gap-3">
              <h3 className="font-bold text-base sm:text-sm flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                {editingStudent ? `Edit Student ${formStudentId}` : 'Add Student'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form list scrollable container */}
            <form onSubmit={handleFormSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[82vh] sm:max-h-[75vh] space-y-4">
              {formErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 border border-rose-250 text-rose-800 rounded">
                  <h4 className="font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                     <AlertTriangle className="w-4 h-4" /> Please fix {formErrors.length} item{formErrors.length > 1 ? 's' : ''}
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-xs mt-1">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Julian Robert Vance"
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* ID */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Student ID</label>
                  <input
                    type="text"
                    required
                    value={formStudentId}
                    onChange={(e) => setFormStudentId(e.target.value)}
                    placeholder="STU-100"
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded font-mono uppercase bg-slate-55 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Class */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Class</label>
                  <select
                    value={formClassId}
                    onChange={(e) => setFormClassId(e.target.value)}
                    required
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded bg-white cursor-pointer font-bold text-slate-700"
                  >
                    <option value="">Select Target Class...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Gender</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded bg-white cursor-pointer font-bold text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* DOB */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={formDob}
                    onChange={(e) => setFormDob(e.target.value)}
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded hover:bg-slate-50 focus:bg-white"
                  />
                </div>

                {/* Parent name */}
                <div className="space-y-1 sm:col-span-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Parent / Guardian</label>
                  <input
                    type="text"
                    required
                    value={formParentName}
                    onChange={(e) => setFormParentName(e.target.value)}
                    placeholder="e.g. Robert Vance Sr."
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Parent Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Parent Phone</label>
                  <input
                    type="text"
                    required
                    value={formParentPhone}
                    onChange={(e) => setFormParentPhone(e.target.value)}
                    placeholder="+1 (617) 555-9011"
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Parent Email */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Parent Email</label>
                  <input
                    type="email"
                    value={formParentEmail}
                    onChange={(e) => setFormParentEmail(e.target.value)}
                    placeholder="r.vance@gmail.com"
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Admission Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Admission Date</label>
                  <input
                    type="date"
                    required
                    value={formAdmissionDate}
                    onChange={(e) => setFormAdmissionDate(e.target.value)}
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded focus:bg-white"
                  />
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-tight">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded bg-white cursor-pointer font-bold text-slate-700"
                  >
                    <option value="Active">Active Student</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>

                {/* Avatar URL */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-450 uppercase tracking-wide">Photo URL (Optional)</label>
                  <input
                    type="text"
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    placeholder="Leave blank to create an avatar automatically"
                    className="w-full min-h-11 px-3 py-2 border border-slate-200 rounded-xl sm:rounded text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:flex sm:items-center sm:justify-end gap-3 pt-5 border-t border-slate-150">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="min-h-11 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl sm:rounded transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="min-h-11 px-5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white rounded-xl sm:rounded font-bold shadow transition-all cursor-pointer"
                >
                  {editingStudent ? 'Save Student' : 'Add Student'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER POPUP DETAIL CARD */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-slate-900/65 backdrop-blur-xs text-sm">
          <div className="w-[min(92vw,27rem)] max-h-[calc(100dvh-5rem)] bg-white border border-slate-300 rounded-lg shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Upper profile banner */}
            <div className="bg-[#0A1E33] px-5 py-4 text-white text-center relative shrink-0">
              <button 
                onClick={() => setViewingStudent(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <img
                src={viewingStudent.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${viewingStudent.studentId}`}
                alt={viewingStudent.fullName}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full border-2 border-white mx-auto shadow-md mb-2 bg-white"
              />

              <h3 className="text-base font-bold leading-tight">{viewingStudent.fullName}</h3>
              <p className="text-xs font-mono text-cyan-300 mt-0.5">Student ID: {viewingStudent.studentId}</p>

              <span className={`inline-block py-1 px-3 rounded-full text-[11px] font-bold uppercase mt-2 ${
                viewingStudent.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40' : 'bg-rose-500/20 text-rose-300 border border-rose-300/40'
              }`}>
                {viewingStudent.status}
              </span>
            </div>

            {/* Profile properties */}
            <div className="p-5 space-y-3 text-xs overflow-y-auto">
              <div className="bg-slate-50 border border-slate-150 p-3 rounded space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3 border-b border-slate-200 pb-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Class</span>
                  <span className="font-bold text-slate-800 sm:text-right break-words">
                    {classes.find(c => c.id === viewingStudent.classId)?.name || 'Unmapped'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3 border-b border-slate-200 pb-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Parent / Guardian</span>
                  <span className="font-bold text-slate-800 sm:text-right break-words">{viewingStudent.parentName}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3 border-b border-slate-200 pb-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Phone</span>
                  <span className="font-semibold text-slate-700 select-all font-mono sm:text-right break-all">{viewingStudent.parentPhone}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3 border-b border-slate-200 pb-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Email</span>
                  <span className="font-semibold text-slate-700 select-all font-mono sm:text-right break-all">{viewingStudent.parentEmail || 'N/A'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3 border-b border-slate-200 pb-1.5">
                  <span className="text-xs text-slate-500 font-bold uppercase">Date of Birth</span>
                  <span className="font-semibold text-slate-700 sm:text-right">{viewingStudent.dateOfBirth}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-1 sm:gap-3">
                  <span className="text-xs text-slate-500 font-bold uppercase">Admission Date</span>
                  <span className="font-semibold text-slate-700 sm:text-right">{viewingStudent.admissionDate}</span>
                </div>
              </div>

              {/* Sub-block showing Stage 3 teaser assignments attendance */}
              <div className="p-2.5 bg-blue-50 text-blue-900 border border-blue-150/70 rounded flex items-start gap-2.5">
                <CreditCard className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                   <h5 className="font-extrabold text-xs uppercase tracking-wide leading-tight">More details coming</h5>
                   <p className="text-xs text-blue-700 mt-1 leading-normal">
                     Attendance, lesson materials, and assignments will appear here when they are connected.
                   </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3 border-t border-slate-150 flex items-center shrink-0">
              <button
                onClick={() => setViewingStudent(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Close Profile Info
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DEREGISTER ALERT DIALOG */}
      {studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl sm:rounded border border-rose-350 shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-150 text-sm">
            <div className="bg-rose-600 px-4 py-3.5 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold">Remove Student?</h4>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-slate-655 font-medium leading-relaxed text-slate-700">
                This will remove <strong className="text-slate-900">{studentToDelete.fullName}</strong> from the student list.
              </p>
              <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-xl sm:rounded font-mono text-xs text-slate-600 break-all">
                Student ID: {studentToDelete.studentId}<br />
                Class: {classes.find(c => c.id === studentToDelete.classId)?.name || 'N/A'}<br />
                Phone: {studentToDelete.parentPhone}
              </div>
              <p className="text-xs text-rose-600 font-extrabold flex items-center gap-1">
                 This action cannot be undone.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 grid grid-cols-1 sm:flex sm:items-center sm:justify-end gap-2 text-sm">
              <button
                onClick={() => setStudentToDelete(null)}
                className="min-h-11 px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-xl sm:rounded text-slate-700 font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="min-h-11 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl sm:rounded font-bold cursor-pointer shadow"
              >
                Remove Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
