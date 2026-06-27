/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit2, 
  Trash2, 
  GraduationCap, 
  Mail, 
  Phone, 
  Tag, 
  X, 
  Check, 
  AlertTriangle,
  Download,
  Printer,
  ChevronDown,
  UserCheck,
  UserX,
  FileSpreadsheet,
  FileText,
  Calendar,
  Sparkles,
  ClipboardCheck,
  BookOpen
} from 'lucide-react';
import { Teacher, Department, Subject, Class, TeachingScheduleSlot } from '../types';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { saveWorkflowProgress } from '../data/workflowProgress';
import { 
  getTeachersInStorage, 
  saveTeachersInStorage, 
  getDepartmentsInStorage, 
  getSubjectsInStorage, 
  getClassesInStorage,
  appendActivityLog 
} from '../data/mockData';

interface TeachersManagementProps {
  tenantId: string;
  setActiveTab?: (tab: string) => void;
}

export default function TeachersManagement({ tenantId, setActiveTab }: TeachersManagementProps) {
  // Load relational states
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [timetableView, setTimetableView] = useState<'class' | 'teacher'>('class');
  const [timetableDay, setTimetableDay] = useState('Monday');
  const [timetableTeacherFilter, setTimetableTeacherFilter] = useState('ALL');
  const [timetableClassFilter, setTimetableClassFilter] = useState('ALL');
  const [timetableSubjectFilter, setTimetableSubjectFilter] = useState('ALL');
  const [timetableStatus, setTimetableStatus] = useState<'draft' | 'needs-review' | 'published'>(() => (localStorage.getItem('educore_timetable_status_' + tenantId) as any) || 'draft');
  const [timetableAudit, setTimetableAudit] = useState<any[]>(() => { try { return JSON.parse(localStorage.getItem('educore_timetable_audit_' + tenantId) || '[]'); } catch { return []; } });
  const [quickSlot, setQuickSlot] = useState({ teacherId: '', classId: '', subjectId: '', day: 'Monday', startTime: '08:00', endTime: '09:00' });
  const [quickSlotError, setQuickSlotError] = useState('');

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [viewingTeacher, setViewingTeacher] = useState<Teacher | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formStaffId, setFormStaffId] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formGender, setFormGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [formDeptId, setFormDeptId] = useState('');
  const [formSubjects, setFormSubjects] = useState<string[]>([]);
  const [formClasses, setFormClasses] = useState<string[]>([]);
  const [formStatus, setFormStatus] = useState<'Active' | 'Suspended' | 'Inactive'>('Active');
  const [formPhoto, setFormPhoto] = useState('');
  const [formPrimaryAllSubjects, setFormPrimaryAllSubjects] = useState(false);
  const [formSchedule, setFormSchedule] = useState<TeachingScheduleSlot[]>([]);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  // Load storage data on init/tenant swap
  useEffect(() => {
    setTeachers(getTeachersInStorage(tenantId));
    setDepartments(getDepartmentsInStorage(tenantId));
    setSubjects(getSubjectsInStorage(tenantId));
    setClasses(getClassesInStorage(tenantId));
  }, [tenantId]);

  // Sync back to storage when teachers register changes
  const updateTeachersState = (updatedList: Teacher[]) => {
    setTeachers(updatedList);
    saveTeachersInStorage(tenantId, updatedList);
  };

  const handleOpenForm = (teacher: Teacher | null = null) => {
    setFormErrors([]);
    if (teacher) {
      setEditingTeacher(teacher);
      setFormName(teacher.fullName);
      setFormStaffId(teacher.staffId);
      setFormPhone(teacher.phone);
      setFormEmail(teacher.email);
      setFormGender(teacher.gender);
      setFormDeptId(teacher.departmentId);
      setFormSubjects(teacher.subjectsTaught);
      setFormClasses(teacher.assignedClasses);
      setFormStatus(teacher.employmentStatus);
      setFormPhoto(teacher.profilePhoto || '');
      setFormPrimaryAllSubjects(Boolean(teacher.primaryAllSubjects));
      setFormSchedule(teacher.teachingSchedule || []);
    } else {
      setEditingTeacher(null);
      setFormName('');
      // Auto generate staff id to prevent friction
      const randomId = `TCH-${String(Math.floor(100 + Math.random() * 900))}`;
      setFormStaffId(randomId);
      setFormPhone('');
      setFormEmail('');
      setFormGender('Male');
      setFormDeptId(departments[0]?.id || '');
      setFormSubjects([]);
      setFormClasses([]);
      setFormStatus('Active');
      setFormPhoto('');
      setFormPrimaryAllSubjects(false);
      setFormSchedule([]);
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: string[] = [];

    if (!formName.trim()) errors.push('Full name is required.');
    if (!formStaffId.trim()) errors.push('Staff ID is required.');
    if (!formEmail.trim()) errors.push('Email is required.');
    if (formClasses.length === 0) errors.push('Assign at least one class the teacher handles.');
    if (formSubjects.length === 0) errors.push('Assign at least one subject the teacher teaches.');
    if (formSchedule.some(slot => !slot.classId || !slot.subjectId || !slot.day || !slot.startTime || !slot.endTime)) errors.push('Complete every teaching time row or remove empty rows.');
    
    // Check duplication
    const duplicateEmail = teachers.find(
      t => t.email.toLowerCase() === formEmail.trim().toLowerCase() && 
           (!editingTeacher || t.id !== editingTeacher.id)
    );
    if (duplicateEmail) errors.push('A teacher with this email address already exists.');

    const duplicateId = teachers.find(
      t => t.staffId.toUpperCase() === formStaffId.toUpperCase() && 
           (!editingTeacher || t.id !== editingTeacher.id)
    );
    if (duplicateId) errors.push('A teacher with this Staff ID already exists.');

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingTeacher) {
      // Edit mode
      const updated = teachers.map(t => {
        if (t.id === editingTeacher.id) {
          return {
            ...t,
            fullName: formName,
            staffId: formStaffId,
            phone: formPhone,
            email: formEmail,
            gender: formGender,
            departmentId: formDeptId,
            subjectsTaught: formSubjects,
            assignedClasses: formClasses,
            primaryAllSubjects: formPrimaryAllSubjects,
            teachingSchedule: formSchedule,
            employmentStatus: formStatus,
            profilePhoto: formPhoto
          };
        }
        return t;
      });
      updateTeachersState(updated);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Teacher Faculty Modified',
        details: `Updated teacher node profile: ${formName} (${formStaffId})`,
        type: 'info'
      });
    } else {
      // Create mode
      const newTeacher: Teacher = {
        id: `tch_${Date.now()}`,
        tenantId,
        fullName: formName,
        staffId: formStaffId,
        phone: formPhone,
        email: formEmail,
        gender: formGender,
        departmentId: formDeptId,
        subjectsTaught: formSubjects,
        assignedClasses: formClasses,
        primaryAllSubjects: formPrimaryAllSubjects,
        teachingSchedule: formSchedule,
        employmentStatus: formStatus,
        profilePhoto: formPhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${formStaffId}`,
        createdAt: new Date().toISOString()
      };
      updateTeachersState([...teachers, newTeacher]);
      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Teacher Faculty Enrolled',
        details: `Enrolled new teacher faculty row: ${formName} (${formStaffId}).`,
        type: 'success'
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteTeacher = () => {
    if (!teacherToDelete) return;

    const updated = teachers.filter(t => t.id !== teacherToDelete.id);
    updateTeachersState(updated);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Teacher Revoked',
      details: `Revoked and wiped teacher record: ${teacherToDelete.fullName} (${teacherToDelete.staffId}).`,
      type: 'warning'
    });
    setTeacherToDelete(null);
  };

  const handleToggleStatus = (teacherId: string) => {
    const updated = teachers.map(t => {
      if (t.id === teacherId) {
        const nextStatus: Teacher['employmentStatus'] = t.employmentStatus === 'Active' ? 'Suspended' : 'Active';
        appendActivityLog({
          tenantId,
          user: 'School Admin',
          action: 'Teacher Status Update',
          details: `Toggled teacher ${t.fullName} status to ${nextStatus}.`,
          type: 'info'
        });
        return { ...t, employmentStatus: nextStatus };
      }
      return t;
    });
    updateTeachersState(updated);
  };

  const toggleSubjectInForm = (subjectId: string) => {
    if (formSubjects.includes(subjectId)) {
      setFormSubjects(formSubjects.filter(id => id !== subjectId));
    } else {
      setFormSubjects([...formSubjects, subjectId]);
    }
  };

  const toggleClassInForm = (classId: string) => {
    if (formClasses.includes(classId)) {
      setFormClasses(formClasses.filter(id => id !== classId));
    } else {
      setFormClasses([...formClasses, classId]);
    }
  };

  const enablePrimaryAllSubjects = () => {
    const allSubjectIds = subjects.map(subject => subject.id);
    setFormPrimaryAllSubjects(true);
    setFormSubjects(allSubjectIds);
    if (formClasses.length === 0 && classes[0]) setFormClasses([classes[0].id]);
  };

  const addScheduleSlot = () => {
    setFormSchedule(prev => [
      ...prev,
      {
        id: `slot_${Date.now()}`,
        classId: formClasses[0] || classes[0]?.id || '',
        subjectId: formSubjects[0] || subjects[0]?.id || '',
        day: 'Monday',
        startTime: '08:00',
        endTime: '09:00'
      }
    ]);
  };

  const updateScheduleSlot = (id: string, field: 'classId' | 'subjectId' | 'day' | 'startTime' | 'endTime', value: string) => {
    setFormSchedule(prev => prev.map(slot => slot.id === id ? { ...slot, [field]: value } : slot));
  };

  const removeScheduleSlot = (id: string) => {
    setFormSchedule(prev => prev.filter(slot => slot.id !== id));
  };

  const teachingDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const teachingPeriods = [
    ['08:00', '09:00'],
    ['09:00', '10:00'],
    ['10:30', '11:30'],
    ['11:30', '12:30'],
    ['13:30', '14:30']
  ];

  const timeToMinutes = (value: string) => {
    const [hour, minute] = (value || '00:00').split(':').map(Number);
    return (hour || 0) * 60 + (minute || 0);
  };

  const rangesOverlap = (aStart: string, aEnd: string, bStart: string, bEnd: string) => {
    return timeToMinutes(aStart) < timeToMinutes(bEnd) && timeToMinutes(bStart) < timeToMinutes(aEnd);
  };

  const buildScheduleRows = (sourceTeachers: Teacher[]) => sourceTeachers.flatMap(teacher =>
    (teacher.teachingSchedule || []).map(slot => ({
      ...slot,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      teacherStaffId: teacher.staffId,
      className: classes.find(c => c.id === slot.classId)?.name || slot.classId,
      subjectName: subjects.find(s => s.id === slot.subjectId)?.name || slot.subjectId
    }))
  );

  const getScheduleConflicts = (sourceTeachers: Teacher[]) => {
    const rows = buildScheduleRows(sourceTeachers);
    const conflicts: Array<{ id: string; title: string; detail: string }> = [];

    rows.forEach((row, index) => {
      rows.slice(index + 1).forEach(other => {
        if (row.day !== other.day || !rangesOverlap(row.startTime, row.endTime, other.startTime, other.endTime)) return;
        if (row.teacherId === other.teacherId) {
          conflicts.push({
            id: `teacher-${row.id}-${other.id}`,
            title: 'Teacher double-booked',
            detail: `${row.teacherName} has ${row.subjectName} and ${other.subjectName} at ${row.day} ${row.startTime}-${row.endTime}.`
          });
        }
        if (row.classId === other.classId) {
          conflicts.push({
            id: `class-${row.id}-${other.id}`,
            title: 'Class double-booked',
            detail: `${row.className} has ${row.subjectName} and ${other.subjectName} at the same time on ${row.day}.`
          });
        }
      });
    });

    return conflicts;
  };

  const buildDraftTeachers = () => {
    const draftTeacher: Teacher = {
      id: editingTeacher?.id || 'draft_teacher',
      tenantId,
      fullName: formName || 'Current teacher',
      staffId: formStaffId || 'DRAFT',
      phone: formPhone,
      email: formEmail,
      gender: formGender,
      departmentId: formDeptId,
      subjectsTaught: formSubjects,
      assignedClasses: formClasses,
      primaryAllSubjects: formPrimaryAllSubjects,
      teachingSchedule: formSchedule,
      employmentStatus: formStatus,
      profilePhoto: formPhoto,
      createdAt: editingTeacher?.createdAt || new Date().toISOString()
    };
    return [...teachers.filter(t => t.id !== editingTeacher?.id), draftTeacher];
  };

  const allScheduleRows = buildScheduleRows(teachers);
  const activeScheduleRows = allScheduleRows
    .filter(row => row.day === timetableDay)
    .filter(row => timetableTeacherFilter === 'ALL' || row.teacherId === timetableTeacherFilter)
    .filter(row => timetableClassFilter === 'ALL' || row.classId === timetableClassFilter)
    .filter(row => timetableSubjectFilter === 'ALL' || row.subjectId === timetableSubjectFilter)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const scheduleConflicts = getScheduleConflicts(teachers);
  const teacherWorkloads = teachers.map(teacher => ({
    teacher,
    periods: teacher.teachingSchedule?.length || 0,
    classes: teacher.assignedClasses.length,
    subjects: teacher.subjectsTaught.length
  })).sort((a, b) => b.periods - a.periods);
  const totalPeriods = allScheduleRows.length;
  const busiestTeacher = teacherWorkloads[0];

  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayDate = new Date().toISOString().split('T')[0];
  const todayRows = allScheduleRows.filter(row => row.day === todayName);
  const attendanceRecords = (() => {
    try {
      return JSON.parse(localStorage.getItem('educore_attendance_' + tenantId) || '[]');
    } catch {
      return [];
    }
  })();
  const lessonRecords = (() => {
    try {
      return JSON.parse(localStorage.getItem('educore_lessons_' + tenantId) || '[]');
    } catch {
      return [];
    }
  })();
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const endedRows = todayRows.filter(row => timeToMinutes(row.endTime) <= currentMinutes);
  const missingAttendanceRows = endedRows.filter(row => !attendanceRecords.some((rec: any) => rec.date === todayDate && rec.classId === row.classId && rec.teacherId === row.teacherId));
  const missingLessonRows = endedRows.filter(row => !lessonRecords.some((rec: any) => (rec.createdAt || '').slice(0, 10) === todayDate && rec.classId === row.classId && rec.subjectId === row.subjectId && rec.teacherId === row.teacherId));

  const saveTimetableAudit = (action: string, detail: string) => {
    const next = [{ id: `audit_${Date.now()}`, action, detail, actor: 'School Admin', createdAt: new Date().toISOString() }, ...timetableAudit].slice(0, 20);
    setTimetableAudit(next);
    localStorage.setItem('educore_timetable_audit_' + tenantId, JSON.stringify(next));
  };

  const handleQuickAddTimetableSlot = () => {
    setQuickSlotError('');
    const teacher = teachers.find(t => t.id === quickSlot.teacherId);
    const room = classes.find(c => c.id === quickSlot.classId);
    const subject = subjects.find(s => s.id === quickSlot.subjectId);
    if (!teacher || !room || !subject) {
      setQuickSlotError('Choose teacher, class, and subject before adding a period.');
      return;
    }
    if (timeToMinutes(quickSlot.endTime) <= timeToMinutes(quickSlot.startTime)) {
      setQuickSlotError('End time must be after start time.');
      return;
    }
    const draftRow = {
      ...quickSlot,
      id: `slot_quick_${Date.now()}`,
      teacherId: teacher.id,
      teacherName: teacher.fullName,
      teacherStaffId: teacher.staffId,
      className: room.name,
      subjectName: subject.name
    };
    const conflict = allScheduleRows.find(row =>
      row.day === draftRow.day &&
      rangesOverlap(draftRow.startTime, draftRow.endTime, row.startTime, row.endTime) &&
      (row.teacherId === draftRow.teacherId || row.classId === draftRow.classId)
    );
    if (conflict) {
      setQuickSlotError(`${conflict.teacherName} or ${conflict.className} is already booked at that time.`);
      changeTimetableStatus('needs-review');
      return;
    }
    const updated = teachers.map(t => t.id === teacher.id ? {
      ...t,
      assignedClasses: t.assignedClasses.includes(room.id) ? t.assignedClasses : [...t.assignedClasses, room.id],
      subjectsTaught: t.subjectsTaught.includes(subject.id) ? t.subjectsTaught : [...t.subjectsTaught, subject.id],
      teachingSchedule: [...(t.teachingSchedule || []), {
        id: draftRow.id,
        classId: room.id,
        subjectId: subject.id,
        day: draftRow.day,
        startTime: draftRow.startTime,
        endTime: draftRow.endTime
      }]
    } : t);
    updateTeachersState(updated);
    changeTimetableStatus('draft');
    saveTimetableAudit('Quick period added', `${teacher.fullName} teaches ${subject.name} for ${room.name} on ${quickSlot.day} ${quickSlot.startTime}-${quickSlot.endTime}.`);
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Added Timetable Period',
      details: `${teacher.fullName} assigned to ${room.name} for ${subject.name}.`,
      type: 'success'
    });
  };

  const changeTimetableStatus = (status: 'draft' | 'needs-review' | 'published') => {
    setTimetableStatus(status);
    localStorage.setItem('educore_timetable_status_' + tenantId, status);
    saveTimetableAudit('Timetable status changed', `Status changed to ${status}.`);
  };

  const publishTimetable = () => {
    if (scheduleConflicts.length > 0) {
      changeTimetableStatus('needs-review');
      return;
    }
    changeTimetableStatus('published');
    saveWorkflowProgress('manager-timetable', { doneSteps: [0, 1, 2], completed: true }, 'timetable published');
  };

  const launchManagerWorkReview = (row: any, action: 'attendance' | 'materials' | 'lesson' | 'assignment') => {
    localStorage.setItem('educore_work_context', JSON.stringify({ ...row, action, tenantId, launchedAt: new Date().toISOString() }));
    setActiveTab?.(action === 'attendance' || action === 'lesson' ? 'school-review' : 'school-log');
  };

  const handleAutoGenerateTimetable = () => {
    const occupiedTeacher = new Set<string>();
    const occupiedClass = new Set<string>();
    const nextTeachers = teachers.map(teacher => ({
      ...teacher,
      teachingSchedule: [...(teacher.teachingSchedule || [])]
    }));

    nextTeachers.forEach(teacher => {
      (teacher.teachingSchedule || []).forEach(slot => {
        occupiedTeacher.add(`${teacher.id}-${slot.day}-${slot.startTime}`);
        occupiedClass.add(`${slot.classId}-${slot.day}-${slot.startTime}`);
      });
    });

    nextTeachers.forEach(teacher => {
      if (teacher.employmentStatus !== 'Active') return;
      const classIds = teacher.assignedClasses.length ? teacher.assignedClasses : classes.slice(0, 1).map(c => c.id);
      const subjectIds = teacher.primaryAllSubjects ? subjects.map(s => s.id) : teacher.subjectsTaught;
      classIds.forEach(classId => {
        subjectIds.forEach(subjectId => {
          const alreadyExists = (teacher.teachingSchedule || []).some(slot => slot.classId === classId && slot.subjectId === subjectId);
          if (alreadyExists) return;
          for (const day of teachingDays) {
            const period = teachingPeriods.find(([start]) => !occupiedTeacher.has(`${teacher.id}-${day}-${start}`) && !occupiedClass.has(`${classId}-${day}-${start}`));
            if (!period) continue;
            const [startTime, endTime] = period;
            teacher.teachingSchedule = [
              ...(teacher.teachingSchedule || []),
              { id: `slot_${teacher.id}_${classId}_${subjectId}_${day}_${startTime}`.replace(/[^a-zA-Z0-9_]/g, '_'), classId, subjectId, day, startTime, endTime }
            ];
            occupiedTeacher.add(`${teacher.id}-${day}-${startTime}`);
            occupiedClass.add(`${classId}-${day}-${startTime}`);
            break;
          }
        });
      });
    });

    updateTeachersState(nextTeachers);
    changeTimetableStatus('draft');
    saveTimetableAudit('Auto-filled timetable', 'Filled missing periods from teacher assignments and free slots.');
    appendActivityLog({
      tenantId,
      user: 'School Admin',
      action: 'Auto Generated Timetable',
      details: 'Filled missing teacher timetable slots from assigned subjects, classes, and available periods.',
      type: 'success'
    });
  };
  // EXPORTS
  const exportToCSV = () => {
    const headers = ['Staff ID', 'Full Name', 'Email', 'Phone', 'Gender', 'Department', 'Status'];
    const rows = filteredTeachers.map(t => {
      const deptName = departments.find(d => d.id === t.departmentId)?.name || 'General';
      return [t.staffId, t.fullName, t.email, t.phone, t.gender, deptName, t.employmentStatus];
    });

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Teachers_Roster_${tenantId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrintPDF = () => {
    window.print();
  };

  // Filters application
  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.staffId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = filterDepartment === 'ALL' || t.departmentId === filterDepartment;
    const matchesStatus = filterStatus === 'ALL' || t.employmentStatus === filterStatus;

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[#1A56DB]" />
            Faculty Directory & Teachers Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Primary repository of certified teachers with strict tenant isolation, department allocation, and course rosters mapping.
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
            onClick={triggerPrintPDF}
            className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 bg-white text-[11px] font-bold rounded flex items-center gap-1.5 transition-all cursor-pointer mr-0"
          >
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={() => handleOpenForm(null)}
            className="px-3.5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white text-[11px] font-bold rounded flex items-center gap-1.5 shadow transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll New Teacher</span>
          </button>
        </div>
      </div>

      {/* FILTER & BAR COUNTERS */}
      <div className="bg-white p-4 rounded border border-slate-200/65 flex flex-col md:flex-row md:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, staff ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none bg-slate-50 focus:bg-white text-slate-900 font-medium"
          />
        </div>

        {/* Filter Department */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Dept:</span>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="ALL">ALL DEPARTMENTS</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-400">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs border border-slate-200 rounded font-bold text-slate-700 bg-white cursor-pointer"
          >
            <option value="ALL">ALL STATUSES</option>
            <option value="Active">Active Only</option>
            <option value="Suspended">Suspended</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* TIMETABLE COMMAND CENTER */}
      <section id="timetable-section" className="bg-white border border-slate-200 shadow-sm p-4 space-y-4 scroll-mt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-950 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#1A56DB]" />
              Teacher & Class Timetable
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Plan lessons from teacher subjects, assigned classes, and available periods. Use it before attendance, materials, lesson notes, assignments, and head review.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAutoGenerateTimetable}
            className="inline-flex items-center justify-center gap-2 bg-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-amber-400"
          >
            <Sparkles className="h-4 w-4" />
            Auto-fill missing timetable
          </button>
        </div>
        <SectionActionStrip
          progressKey="manager-timetable"
          steps={['Add teacher subjects', 'Auto-fill timetable', 'Publish for users']}
          helpText="First add each teacher subjects and classes. Use auto-fill to create missing periods. Check conflicts, then publish so teachers, students, and parents can see the timetable."
          reminderText="Publish the timetable so teachers, students, and parents can see the schedule."
          canMarkDone={timetableStatus === 'published' && activeScheduleRows.length > 0}
          blockedDoneText="Publish a timetable with at least one period before marking timetable done."
          actions={[
            { label: 'Auto-fill timetable', onClick: handleAutoGenerateTimetable, tone: 'primary' },
            { label: 'Publish timetable', onClick: publishTimetable },
          ]}
          isEmpty={activeScheduleRows.length === 0}
          emptyText="No timetable period is showing. Add teaching times on teacher profiles or press Auto-fill timetable."
        />

        <div className="border border-blue-100 bg-blue-50 p-3">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
            <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">Teacher</span>
                <select value={quickSlot.teacherId} onChange={(e) => setQuickSlot(prev => ({ ...prev, teacherId: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800">
                  <option value="">Choose teacher</option>
                  {teachers.filter(t => t.employmentStatus === 'Active').map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">Class</span>
                <select value={quickSlot.classId} onChange={(e) => setQuickSlot(prev => ({ ...prev, classId: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800">
                  <option value="">Choose class</option>
                  {classes.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">Subject</span>
                <select value={quickSlot.subjectId} onChange={(e) => setQuickSlot(prev => ({ ...prev, subjectId: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800">
                  <option value="">Choose subject</option>
                  {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">Day</span>
                <select value={quickSlot.day} onChange={(e) => setQuickSlot(prev => ({ ...prev, day: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800">
                  {teachingDays.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">Start</span>
                <input type="time" value={quickSlot.startTime} onChange={(e) => setQuickSlot(prev => ({ ...prev, startTime: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800" />
              </label>
              <label className="space-y-1">
                <span className="text-[10px] font-black uppercase text-blue-800">End</span>
                <input type="time" value={quickSlot.endTime} onChange={(e) => setQuickSlot(prev => ({ ...prev, endTime: e.target.value }))} className="min-h-11 w-full border border-blue-200 bg-white px-2 text-xs font-bold text-slate-800" />
              </label>
            </div>
            <button type="button" onClick={handleQuickAddTimetableSlot} className="min-h-11 bg-blue-600 px-4 text-xs font-black text-white hover:bg-blue-700">
              Add period
            </button>
          </div>
          {quickSlotError && <p className="mt-2 border border-rose-200 bg-white p-2 text-[11px] font-black text-rose-700">{quickSlotError}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="border border-blue-100 bg-blue-50 p-3">
            <p className="text-[10px] font-black uppercase text-blue-700">Total Periods</p>
            <p className="text-2xl font-black text-blue-950">{totalPeriods}</p>
          </div>
          <div className="border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-[10px] font-black uppercase text-emerald-700">Teachers Loaded</p>
            <p className="text-2xl font-black text-emerald-950">{teacherWorkloads.filter(item => item.periods > 0).length}</p>
          </div>
          <div className="border border-amber-100 bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase text-amber-700">Conflicts</p>
            <p className="text-2xl font-black text-amber-950">{scheduleConflicts.length}</p>
          </div>
          <div className="border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Busiest Teacher</p>
            <p className="truncate text-sm font-black text-slate-950">{busiestTeacher?.teacher.fullName || 'None yet'}</p>
            <p className="text-[10px] font-bold text-slate-500">{busiestTeacher?.periods || 0} periods/week</p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="border border-slate-200 bg-slate-50 p-3">
            <p className="text-[10px] font-black uppercase text-slate-500">Publish Status</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`px-2 py-1 text-[10px] font-black uppercase ${timetableStatus === 'published' ? 'bg-emerald-100 text-emerald-800' : timetableStatus === 'needs-review' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'}`}>{timetableStatus.replace('-', ' ')}</span>
              <button type="button" onClick={() => changeTimetableStatus('draft')} className="border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-100">Draft</button>
              <button type="button" onClick={() => changeTimetableStatus('needs-review')} className="border border-amber-200 bg-white px-2 py-1 text-[10px] font-bold text-amber-800 hover:bg-amber-50">Review</button>
              <button type="button" onClick={publishTimetable} className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-800 hover:bg-emerald-100">Publish</button>
            </div>
            <p className="mt-2 text-[10.5px] font-semibold text-slate-500">Students and parents see only published timetables.</p>
          </div>
          <div className="border border-blue-100 bg-blue-50 p-3">
            <p className="text-[10px] font-black uppercase text-blue-700">Daily Manager Summary</p>
            <p className="mt-1 text-[11px] font-semibold text-blue-950">Today periods: {todayRows.length} - Attendance missing: {missingAttendanceRows.length} - Lessons missing: {missingLessonRows.length}</p>
            <p className="text-[10px] font-semibold text-blue-700">Published status: {timetableStatus}</p>
          </div>
          <div className="border border-rose-100 bg-rose-50 p-3">
            <p className="text-[10px] font-black uppercase text-rose-700">Workload Balance</p>
            {teacherWorkloads.filter(item => item.periods >= 8).length === 0 ? (
              <p className="mt-1 text-[11px] font-semibold text-rose-800">No teacher is overloaded.</p>
            ) : (
              <div className="mt-1 space-y-1">
                {teacherWorkloads.filter(item => item.periods >= 8).slice(0, 3).map(item => (
                  <p key={item.teacher.id} className="text-[11px] font-semibold text-rose-900">{item.teacher.fullName}: {item.periods} periods/week</p>
                ))}
              </div>
            )}
          </div>
        </div>
        {scheduleConflicts.length > 0 && (
          <div className="space-y-2 border border-rose-200 bg-rose-50 p-3">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-black uppercase">Fix timetable conflicts before publishing</span>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              {scheduleConflicts.slice(0, 4).map(conflict => (
                <div key={conflict.id} className="border border-rose-200 bg-white p-2 text-[11px] font-semibold text-rose-800">
                  <span className="font-black">{conflict.title}:</span> {conflict.detail}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex overflow-x-auto border border-slate-200 bg-slate-50 p-1">
            {teachingDays.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => setTimetableDay(day)}
                className={`min-w-24 px-3 py-2 text-[11px] font-black ${timetableDay === day ? 'bg-[#1A56DB] text-white' : 'text-slate-600 hover:bg-white'}`}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setTimetableView('class')} className={`px-3 py-2 text-[11px] font-black border ${timetableView === 'class' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-600'}`}>Class View</button>
            <button type="button" onClick={() => setTimetableView('teacher')} className={`px-3 py-2 text-[11px] font-black border ${timetableView === 'teacher' ? 'bg-blue-50 border-blue-300 text-blue-800' : 'bg-white border-slate-200 text-slate-600'}`}>Teacher View</button>
            <select value={timetableTeacherFilter} onChange={(e) => setTimetableTeacherFilter(e.target.value)} className="border border-slate-200 bg-white px-2 py-2 text-[11px] font-bold text-slate-700">
              <option value="ALL">All teachers</option>
              {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName}</option>)}
            </select>
            <select value={timetableClassFilter} onChange={(e) => setTimetableClassFilter(e.target.value)} className="border border-slate-200 bg-white px-2 py-2 text-[11px] font-bold text-slate-700">
              <option value="ALL">All classes</option>
              {classes.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
            </select>
            <select value={timetableSubjectFilter} onChange={(e) => setTimetableSubjectFilter(e.target.value)} className="border border-slate-200 bg-white px-2 py-2 text-[11px] font-bold text-slate-700">
              <option value="ALL">All subjects</option>
              {subjects.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </div>
        </div>
        <BackToPageMenu />

        {activeScheduleRows.length === 0 ? (
          <div className="border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs font-semibold text-slate-500">
            No periods match this day and filter. Add teaching times on a teacher profile or use auto-fill.
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {activeScheduleRows.map(row => (
              <div key={`${row.teacherId}-${row.id}`} className="border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">{row.startTime} - {row.endTime}</p>
                    <h3 className="text-sm font-black text-slate-950">{timetableView === 'class' ? row.className : row.teacherName}</h3>
                    <p className="text-xs font-bold text-blue-700">{row.subjectName}</p>
                  </div>
                  <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black uppercase text-slate-600">
                    {timetableView === 'class' ? row.teacherName : row.className}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 sm:grid-cols-4">
                  <button type="button" onClick={() => launchManagerWorkReview(row, 'attendance')} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-1 hover:border-blue-300 hover:bg-blue-50"><ClipboardCheck className="h-3 w-3" /> Attendance</button>
                  <button type="button" onClick={() => launchManagerWorkReview(row, 'materials')} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-1 hover:border-blue-300 hover:bg-blue-50"><BookOpen className="h-3 w-3" /> Materials</button>
                  <button type="button" onClick={() => launchManagerWorkReview(row, 'lesson')} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-1 hover:border-blue-300 hover:bg-blue-50"><FileText className="h-3 w-3" /> Lessons</button>
                  <button type="button" onClick={() => launchManagerWorkReview(row, 'assignment')} className="inline-flex items-center gap-1 border border-slate-200 bg-slate-50 px-2 py-1 hover:border-blue-300 hover:bg-blue-50"><Tag className="h-3 w-3" /> Assignment</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {(missingAttendanceRows.length > 0 || missingLessonRows.length > 0) && (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="border border-amber-200 bg-amber-50 p-3">
              <h3 className="text-xs font-black uppercase text-amber-900">Attendance not marked after period</h3>
              <div className="mt-2 space-y-2">
                {missingAttendanceRows.length === 0 ? <p className="text-[11px] font-semibold text-amber-700">All ended periods have attendance.</p> : missingAttendanceRows.slice(0, 4).map(row => (
                  <button key={`att-${row.teacherId}-${row.id}`} type="button" onClick={() => launchManagerWorkReview(row, 'attendance')} className="block w-full border border-amber-200 bg-white p-2 text-left text-[11px] font-semibold text-amber-900 hover:bg-amber-100">
                    {row.teacherName} - {row.className} - {row.subjectName} ended {row.endTime}
                  </button>
                ))}
              </div>
            </div>
            <div className="border border-rose-200 bg-rose-50 p-3">
              <h3 className="text-xs font-black uppercase text-rose-900">Lesson record missing after teaching</h3>
              <div className="mt-2 space-y-2">
                {missingLessonRows.length === 0 ? <p className="text-[11px] font-semibold text-rose-700">All ended periods have lesson records.</p> : missingLessonRows.slice(0, 4).map(row => (
                  <button key={`les-${row.teacherId}-${row.id}`} type="button" onClick={() => launchManagerWorkReview(row, 'lesson')} className="block w-full border border-rose-200 bg-white p-2 text-left text-[11px] font-semibold text-rose-900 hover:bg-rose-100">
                    {row.teacherName} - {row.className} - {row.subjectName} ended {row.endTime}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-3 lg:grid-cols-3">
          {teacherWorkloads.slice(0, 6).map(item => (
            <div key={item.teacher.id} className="border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-xs font-black text-slate-900">{item.teacher.fullName}</p>
                <span className="text-[10px] font-black text-blue-700">{item.periods} periods</span>
              </div>
              <div className="mt-2 h-2 bg-white border border-slate-200">
                <div className="h-full bg-[#1A56DB]" style={{ width: `${Math.min(100, item.periods * 10)}%` }} />
              </div>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">{item.classes} classes - {item.subjects} subjects</p>
            </div>
          ))}
        </div>

        <div className="border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xs font-black uppercase text-slate-700">Timetable Audit Trail</h3>
            <span className="text-[10px] font-bold text-slate-400">Last {Math.min(5, timetableAudit.length)} changes</span>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {timetableAudit.length === 0 ? (
              <p className="text-[11px] font-semibold text-slate-500">No timetable changes logged yet.</p>
            ) : timetableAudit.slice(0, 5).map(entry => (
              <div key={entry.id} className="border border-slate-200 bg-white p-2 text-[11px]">
                <p className="font-black text-slate-900">{entry.action}</p>
                <p className="font-semibold text-slate-600">{entry.detail}</p>
                <p className="mt-1 text-[9px] font-mono text-slate-400">{new Date(entry.createdAt).toLocaleString()} by {entry.actor}</p>
              </div>
            ))}
          </div>
        </div>      </section>
      {/* COMPACT INTERACTIVE LIST GRID */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-white rounded border border-slate-200 p-12 text-center flex flex-col items-center">
          <div className="p-3.5 bg-slate-100 rounded-full text-slate-400 mb-4">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">No Teacher Nodes Matched</h2>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mx-auto leading-relaxed">
            There are no teacher records matching your status or department filter. Click "Enroll New Teacher" to provision a ledger row.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded border border-slate-250 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse table-auto">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-4 py-3">Profile Info</th>
                <th className="px-4 py-3">Staff ID</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Assigned Structure</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTeachers.map(t => {
                const dept = departments.find(d => d.id === t.departmentId);
                const assignedClassNames = t.assignedClasses.map(cid => classes.find(c => c.id === cid)?.name).filter(Boolean).join(', ');
                const assignedSubjNames = t.subjectsTaught.map(sid => subjects.find(s => s.id === sid)?.name).filter(Boolean).join(', ');

                return (
                  <tr key={t.id} className="hover:bg-slate-50/60 transition-all select-text">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={t.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${t.staffId}`}
                          alt={t.fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 object-cover"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 leading-tight">{t.fullName}</h4>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-normal">
                            {t.gender} - {t.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-mono font-bold text-[#1A56DB]">{t.staffId}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-150 font-bold text-[10px] text-slate-700">
                        {dept?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <div className="truncate">
                        <span className="font-semibold text-slate-800">Classes:</span> {assignedClassNames || 'None'}
                      </div>
                      <div className="truncate text-slate-400 text-[10px] mt-0.5">
                        <span className="font-semibold text-slate-500">Subjects:</span> {assignedSubjNames || 'None'}
                      </div>
                      <div className="truncate text-slate-400 text-[10px] mt-0.5">
                        <span className="font-semibold text-slate-500">Times:</span> {t.teachingSchedule?.length || 0} slot{(t.teachingSchedule?.length || 0) === 1 ? '' : 's'}
                        {t.primaryAllSubjects && <span className="ml-1 text-emerald-700 font-bold">Primary all subjects</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.employmentStatus === 'Active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : t.employmentStatus === 'Suspended'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {t.employmentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingTeacher(t)}
                          className="p-1 px-2 text-[10px] hover:bg-slate-100 rounded text-slate-600 font-bold border border-slate-200 transition-colors cursor-pointer"
                          title="View Info Profile"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleToggleStatus(t.id)}
                          className={`p-1 rounded cursor-pointer ${
                            t.employmentStatus === 'Active'
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={t.employmentStatus === 'Active' ? 'Suspend Record' : 'Activate Record'}
                        >
                          {t.employmentStatus === 'Active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleOpenForm(t)}
                          className="p-1 hover:bg-slate-100 text-blue-600 rounded cursor-pointer"
                          title="Edit Teacher"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setTeacherToDelete(t)}
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded cursor-pointer"
                          title="Wipe Record"
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
      )}

      {/* ENROLL & EDIT MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="w-full max-w-2xl bg-white rounded border border-slate-350 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-[#1A56DB]" />
                {editingTeacher ? `RECONF_ROW // ${formStaffId}` : 'ALLOCATE_NEW_TEACHER_RECORD'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 flex-1 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
              
              {formErrors.length > 0 && (
                <div className="p-3.5 bg-rose-50 text-rose-800 rounded border border-rose-200 space-y-1">
                  <h4 className="font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4 inline" /> Validations Rejected ({formErrors.length}):
                  </h4>
                  <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                    {formErrors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Full name */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Full Name (Adhered to Passport/ID)</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Professor Marcus Brody"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Staff ID */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Staff ID Identifier (Unique Code)</label>
                  <input
                    type="text"
                    required
                    value={formStaffId}
                    onChange={(e) => setFormStaffId(e.target.value)}
                    placeholder="TCH-001"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs font-mono uppercase bg-slate-50 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Academic Email Address</label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="m.brody@centralcrest.edu"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Telephone Contact</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+1 (617) 555-2211"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Gender Specification</label>
                  <select
                    value={formGender}
                    onChange={(e) => setFormGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-bold text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Department */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Assigned Parent Department</label>
                  <select
                    value={formDeptId}
                    onChange={(e) => setFormDeptId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-bold text-slate-700"
                  >
                    <option value="">Unassigned Category</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                {/* Employment Status */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Employment Status Badge</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none cursor-pointer font-bold text-slate-700"
                  >
                    <option value="Active">Active Duty</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Inactive">Inactive/Resigned</option>
                  </select>
                </div>

                {/* Profile photo link optionally */}
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Custom Profile Avatar URL (Optional)</label>
                  <input
                    type="text"
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    placeholder="https://images.unsplash.com/... or blank for auto adventurer avatar seed"
                    className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Subjects Checklist Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Map Subjects Taught (Academic Specialty)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-3 rounded border border-slate-150">
                  {subjects.map(s => {
                    const isChecked = formSubjects.includes(s.id);
                    return (
                      <button
                        type="button"
                        key={s.id}
                        onClick={() => toggleSubjectInForm(s.id)}
                        className={`p-2 rounded text-left border flex items-center justify-between transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50/75 border-blue-300 text-[#1A56DB] font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span className="truncate pr-1">{s.name} ({s.code})</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                      </button>
                    );
                  })}
                  {subjects.length === 0 && (
                    <span className="col-span-3 text-[11px] text-slate-400 p-1">No subjects found in central database directory.</span>
                  )}
                </div>
              </div>


              {/* Primary Class Shortcut */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="rounded border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 text-[11px] font-black text-emerald-950 uppercase tracking-wide">
                        <input type="checkbox" checked={formPrimaryAllSubjects} onChange={(e) => { if (e.target.checked) { enablePrimaryAllSubjects(); } else { setFormPrimaryAllSubjects(false); } }} className="h-4 w-4 accent-emerald-600" />
                        Primary teacher handles all subjects
                      </label>
                      <p className="text-[10.5px] font-semibold leading-relaxed text-emerald-800">For primary classes, one teacher can teach every subject. Select the class, then add the time for each subject below.</p>
                    </div>
                    <button type="button" onClick={enablePrimaryAllSubjects} className="shrink-0 border border-emerald-300 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-wide text-emerald-800 hover:bg-emerald-100">Use all subjects</button>
                  </div>
                </div>
              </div>
              {/* Classes Checklist Selector */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Map Assigned Classroom Lots</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded border border-slate-150">
                  {classes.map(c => {
                    const isChecked = formClasses.includes(c.id);
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => toggleClassInForm(c.id)}
                        className={`p-2 rounded text-center border flex flex-col items-center justify-center transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-emerald-50/75 border-emerald-300 text-emerald-800 font-bold' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        {isChecked ? (
                          <span className="text-[8px] uppercase tracking-widest text-emerald-600 font-extrabold mt-1">ASSIGNED</span>
                        ) : (
                          <span className="text-[8px] uppercase tracking-widest text-slate-350 font-medium mt-1">MAP ROOM</span>
                        )}
                      </button>
                    );
                  })}
                  {classes.length === 0 && (
                    <span className="col-span-4 text-[11px] text-slate-400 p-1">No classes found in school structure registry.</span>
                  )}
                </div>
              </div>


              {/* Teaching Time Table */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Teaching Time Table</label>
                    <p className="text-[10.5px] font-semibold text-slate-500">Add the day and time this teacher handles each class and subject.</p>
                  </div>
                  <button type="button" onClick={addScheduleSlot} className="inline-flex items-center justify-center gap-2 border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-blue-700 hover:bg-blue-100">
                    <Plus className="h-3.5 w-3.5" />
                    Add teaching time
                  </button>
                </div>

                {formSchedule.length === 0 ? (
                  <div className="border border-dashed border-slate-250 bg-slate-50 p-3 text-[11px] font-semibold text-slate-500">
                    No teaching time added yet. Use this for class periods, primary all-subject teachers, and timetable planning.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {formSchedule.map((slot, index) => {
                      const availableClasses = formClasses.length ? classes.filter(c => formClasses.includes(c.id)) : classes;
                      const availableSubjects = formSubjects.length ? subjects.filter(s => formSubjects.includes(s.id)) : subjects;
                      return (
                        <div key={slot.id} className="grid grid-cols-1 gap-2 border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_1fr_0.9fr_0.9fr_auto]">
                          <select value={slot.day} onChange={(e) => updateScheduleSlot(slot.id, 'day', e.target.value)} className="min-h-10 border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={`Teaching day ${index + 1}`}>
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => <option key={day} value={day}>{day}</option>)}
                          </select>
                          <select value={slot.classId} onChange={(e) => updateScheduleSlot(slot.id, 'classId', e.target.value)} className="min-h-10 border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={`Teaching class ${index + 1}`}>
                            <option value="">Class</option>
                            {availableClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                          <select value={slot.subjectId} onChange={(e) => updateScheduleSlot(slot.id, 'subjectId', e.target.value)} className="min-h-10 border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={`Teaching subject ${index + 1}`}>
                            <option value="">Subject</option>
                            {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                          <input type="time" value={slot.startTime} onChange={(e) => updateScheduleSlot(slot.id, 'startTime', e.target.value)} className="min-h-10 border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={`Start time ${index + 1}`} />
                          <input type="time" value={slot.endTime} onChange={(e) => updateScheduleSlot(slot.id, 'endTime', e.target.value)} className="min-h-10 border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" aria-label={`End time ${index + 1}`} />
                          <button type="button" onClick={() => removeScheduleSlot(slot.id)} className="inline-flex min-h-10 items-center justify-center border border-rose-200 bg-rose-50 px-3 text-rose-700 hover:bg-rose-100" aria-label={`Remove teaching time ${index + 1}`}>
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              {/* Footer action bar */}
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
                  className="px-5 py-2 bg-[#1A56DB] hover:bg-opacity-95 text-white rounded font-bold transition-all flex items-center gap-1 cursor-pointer shadow"
                >
                  <span>{editingTeacher ? 'Commit Profile Patch' : 'Deploy Teacher Ledger'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER / POPUP DISPLAY CARD */}
      {viewingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-lg border border-slate-300 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header style */}
            <div className="bg-[#0A1E33] p-6 text-white text-center relative">
              <button 
                onClick={() => setViewingTeacher(null)} 
                className="absolute right-4 top-4 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <img
                src={viewingTeacher.profilePhoto || `https://api.dicebear.com/7.x/adventurer/svg?seed=${viewingTeacher.staffId}`}
                alt={viewingTeacher.fullName}
                referrerPolicy="no-referrer"
                className="w-20 h-20 rounded-full border-2 border-white mx-auto shadow-md mb-3 bg-white"
              />
              
              <h3 className="text-base font-bold leading-tight">{viewingTeacher.fullName}</h3>
              <p className="text-xs font-mono text-blue-300 mt-1 uppercase">Staff Row: {viewingTeacher.staffId}</p>
              
              {/* Status pill inside banner */}
              <span className={`inline-block py-0.5 px-3 rounded-full text-[9px] font-bold uppercase mt-2.5 ${
                viewingTeacher.employmentStatus === 'Active' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/35'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/35'
              }`}>
                {viewingTeacher.employmentStatus}
              </span>
            </div>

            {/* Profile body properties */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 border border-slate-150 p-3.5 rounded space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200/55 pb-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold font-mono">Academic Email</span>
                  <a href={`mailto:${viewingTeacher.email}`} className="text-[#1A56DB] hover:underline font-semibold leading-none">{viewingTeacher.email}</a>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/55 pb-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold font-mono">Phone Contact</span>
                  <span className="text-slate-700 font-semibold leading-none">{viewingTeacher.phone || 'N/A'}</span>
                </div>

                <div className="flex items-center justify-between border-b border-slate-200/55 pb-2">
                  <span className="text-[10px] uppercase text-slate-400 font-bold font-mono">Gender Group</span>
                  <span className="text-slate-700 font-bold leading-none">{viewingTeacher.gender}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-slate-400 font-bold font-mono">Assigned Department</span>
                  <span className="text-slate-800 font-extrabold leading-none">
                    {departments.find(d => d.id === viewingTeacher.departmentId)?.name || 'General Administration'}
                  </span>
                </div>
              </div>

              {/* Subjects maps in list detail */}
              <div className="space-y-1.5">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-tight">Teaching Specialties:</h4>
                <div className="flex flex-wrap gap-1">
                  {viewingTeacher.subjectsTaught.length === 0 ? (
                    <span className="text-slate-400 font-medium italic">No specialties assigned.</span>
                  ) : (
                    viewingTeacher.subjectsTaught.map(sid => {
                      const subj = subjects.find(s => s.id === sid);
                      return (
                        <span key={sid} className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100 font-semibold font-mono text-[9px]">
                          {subj?.name || sid}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Classes maps in list detail */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-tight">Active Assigned Class Rooms:</h4>
                <div className="flex flex-wrap gap-1">
                  {viewingTeacher.assignedClasses.length === 0 ? (
                    <span className="text-slate-400 font-medium italic">No rooms assigned.</span>
                  ) : (
                    viewingTeacher.assignedClasses.map(cid => {
                      const roomObj = classes.find(c => c.id === cid);
                      return (
                        <span key={cid} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-100 font-semibold font-mono text-[9px]">
                          {roomObj?.name || cid}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>
              {/* Teaching timetable in profile */}
              <div className="space-y-1.5 pt-1.5 border-t border-slate-100">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-tight">Teaching Times:</h4>
                  {viewingTeacher.primaryAllSubjects && (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[9px] uppercase">Primary all subjects</span>
                  )}
                </div>
                <div className="space-y-1">
                  {(viewingTeacher.teachingSchedule || []).length === 0 ? (
                    <span className="text-slate-400 font-medium italic">No teaching times recorded.</span>
                  ) : (
                    (viewingTeacher.teachingSchedule || []).map(slot => {
                      const roomObj = classes.find(c => c.id === slot.classId);
                      const subj = subjects.find(s => s.id === slot.subjectId);
                      return (
                        <div key={slot.id} className="border border-slate-150 bg-slate-50 px-2 py-1.5 text-[10px] font-semibold text-slate-700">
                          <span className="font-black text-slate-900">{slot.day}</span> {slot.startTime}-{slot.endTime} - {roomObj?.name || slot.classId} - {subj?.name || slot.subjectId}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-end">
              <button
                onClick={() => setViewingTeacher(null)}
                className="w-full py-2 bg-slate-200 hover:bg-slate-250 text-slate-700 font-bold rounded text-xs transition-colors cursor-pointer"
              >
                Close Profile Info
              </button>
            </div>

          </div>
        </div>
      )}

      {/* DELETE CONFIRM ALERT POPUP */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded border border-rose-300 shadow-2xl overflow-hidden max-w-sm w-full animate-in zoom-in-95 duration-150 text-xs">
            <div className="bg-rose-600 px-4 py-3.5 text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="font-bold uppercase tracking-wider font-mono">Row Purge Authorization</h4>
            </div>
            
            <div className="p-5 space-y-3">
              <p className="text-slate-655 font-medium leading-relaxed">
                You are authorizing a permanent and non-reversible wipe of teacher profile: <strong className="text-slate-900">{teacherToDelete.fullName}</strong>.
              </p>
              <div className="bg-slate-50 p-3 rounded text-[10.5px] text-slate-500 border border-slate-200 uppercase font-mono">
                STAFF_ID_SEED: {teacherToDelete.staffId}<br />
                ACADEMIC_EMAIL: {teacherToDelete.email}
              </div>
              <p className="text-[10px] text-rose-600 font-extrabold flex items-center gap-1 mt-1">
                 Warning: This also tears down all relational allocations in course tables.
              </p>
            </div>

            <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTeacherToDelete(null)}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 rounded text-slate-700 font-bold cursor-pointer"
              >
                Refuse
              </button>
              <button
                onClick={handleDeleteTeacher}
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
