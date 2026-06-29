import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Search, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  Save, 
  FileSpreadsheet, 
  Plus, 
  Info,
  Clock
} from 'lucide-react';
import { User, School, AttendanceRecord, AttendanceItem } from '../types';
import { 
  getAttendanceRecordsInStorage, 
  saveAttendanceRecordsInStorage, 
  getClassesInStorage, 
  getSubjectsInStorage, 
  getStudentsInStorage, 
  getTeachersInStorage,
  appendTeacherActivityLog 
} from '../data/mockData';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { saveWorkflowProgress } from '../data/workflowProgress';

interface AttendanceManagementProps {
  user: User;
  currentTenant: School;
}

export default function AttendanceManagement({ user, currentTenant }: AttendanceManagementProps) {
  const tenantId = currentTenant.id;

  // Resolve Teacher Context
  const allTeachers = getTeachersInStorage(tenantId);
  const teacherProfile = (allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase()) || {
    id: `tch_temp_${user.id}`,
    fullName: user.name,
    email: user.email,
    assignedClasses: ['class_jhs1', 'class_jhs2'],
    subjectsTaught: ['subj_math', 'subj_science']
  }) as any;

  // State
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [allStudents, setAllStudents] = useState<any[]>([]);

  // Selection states for filling attendance
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [roster, setRoster] = useState<AttendanceItem[]>([]);

  // Messages / Validation Errors
  const [validationError, setValidationError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitMode, setIsSubmitMode] = useState(false);

  // Sync Master catalogs on startup
  useEffect(() => {
    const list = getAttendanceRecordsInStorage(tenantId).filter(r => r.teacherId === teacherProfile.id);
    setAttendanceLogs(list);
    setClassesList(getClassesInStorage(tenantId));
    setSubjectsList(getSubjectsInStorage(tenantId));
    setAllStudents(getStudentsInStorage(tenantId));
  }, [tenantId, teacherProfile.id]);

  useEffect(() => {
    try {
      const ctx = JSON.parse(localStorage.getItem('educore_work_context') || 'null');
      if (!ctx || ctx.tenantId !== tenantId || ctx.action !== 'attendance') return;
      if (ctx.teacherId && ctx.teacherId !== teacherProfile.id) return;
      setSelectedClass(ctx.classId || '');
      setSelectedSubject(ctx.subjectId || '');
      setSelectedDate(new Date().toISOString().split('T')[0]);
      setIsSubmitMode(true);
      setSuccessMsg(`Loaded timetable period: ${ctx.className || 'Class'} - ${ctx.subjectName || 'Subject'}.`);
    } catch {
      // Ignore malformed launcher context.
    }
  }, [tenantId, teacherProfile.id]);
  const classesMap = React.useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const subjectsMap = React.useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);

  // Load roster when selected class changes
  useEffect(() => {
    if (!selectedClass) {
      setRoster([]);
      setValidationError('');
      return;
    }

    // Check if attendance already recorded today/chosen date for this class
    const existing = getAttendanceRecordsInStorage(tenantId);
    const isDuplicate = existing.some(r => r.classId === selectedClass && r.date === selectedDate);
    if (isDuplicate) {
      setValidationError(`Operational Conflict: Attendance checklist has already been finalized for this Class on ${selectedDate}.`);
    } else {
      setValidationError('');
    }

    const filteredStudents = allStudents.filter(s => s.classId === selectedClass);
    const initialRoster: AttendanceItem[] = filteredStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      status: 'Present',
      remarks: ''
    }));
    setRoster(initialRoster);
  }, [selectedClass, selectedDate, allStudents, tenantId]);

  // Update specific student status inside roster
  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setRoster(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, status } : item
    ));
  };

  // Update student performance remarks
  const handleRemarksChange = (studentId: string, remarks: string) => {
    setRoster(prev => prev.map(item => 
      item.studentId === studentId ? { ...item, remarks } : item
    ));
  };

  // Commit Attendance Form
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setSuccessMsg('');

    if (!selectedClass) {
      setValidationError('Class parameter is required before initiating core roll call.');
      return;
    }

    if (roster.length === 0) {
      setValidationError('Cannot record empty roster. Ensure students are enrolled in the selected Class context.');
      return;
    }

    // Final duplicate check immediately before database commit to prevent race-conditions
    const existing = getAttendanceRecordsInStorage(tenantId);
    const isDuplicate = existing.some(r => r.classId === selectedClass && r.date === selectedDate);
    if (isDuplicate) {
      setValidationError(`Operational Conflict Blocked: Attendance has already been filed for Class on ${selectedDate}.`);
      return;
    }

    const newRecord: AttendanceRecord = {
      id: `att_${Date.now()}`,
      tenantId,
      date: selectedDate,
      classId: selectedClass,
      subjectId: selectedSubject || undefined,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      items: roster,
      createdAt: new Date().toISOString()
    };

    const updatedAll = [newRecord, ...existing];
    saveAttendanceRecordsInStorage(tenantId, updatedAll);

    // Activity logging
    const presentsCount = roster.filter(i => i.status === 'Present' || i.status === 'Late').length;
    const absentsCount = roster.filter(i => i.status === 'Absent').length;
    const latesCount = roster.filter(i => i.status === 'Late').length;
    const excusesCount = roster.filter(i => i.status === 'Excused').length;
    
    const classNameVal = classesMap.get(selectedClass) || selectedClass;
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action: 'Marked Attendance',
      details: `Injected daily roll call sheet for Class: ${classNameVal} on date: ${selectedDate}. Attendance scope: ${presentsCount} Present, ${absentsCount} Absent, ${latesCount} Late, ${excusesCount} Excused.`,
      classId: selectedClass,
      className: classNameVal,
      subjectId: selectedSubject || undefined,
      subjectName: selectedSubject ? (subjectsMap.get(selectedSubject) || selectedSubject) : undefined
    });

    setAttendanceLogs([newRecord, ...attendanceLogs]);
    saveWorkflowProgress('teacher-attendance', { doneSteps: [0, 1, 2], completed: true }, 'attendance record saved');
    setSuccessMsg(`System Ledger Synced: Successfully filed attendance checklist for ${classNameVal} (${presentsCount} Present, ${absentsCount} Absent).`);
    
    // Close submit forms
    setIsSubmitMode(false);
    setSelectedClass('');
    setSelectedSubject('');
    setRoster([]);
  };

  return (
    <div id="attendance-section" className="attendance-page space-y-6 scroll-mt-4">

      {/* TOP HEADER */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            ACADEMIC ATTENDANCE HUB
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2 font-display leading-tight">
            Classroom Attendance Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Mark daily roll calls, flag chronics or absentees, and provide notes for official oversight records.
          </p>
        </div>

        <div className="flex gap-2">
          {isSubmitMode ? (
            <button
              onClick={() => {
                setIsSubmitMode(false);
                setSelectedClass('');
                setValidationError('');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded cursor-pointer transition-colors"
            >
              Cancel Entry
            </button>
          ) : (
            <button
              id="btn-new-attendance"
              onClick={() => setIsSubmitMode(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded shadow-sm cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Initialize Roll Call
            </button>
          )}
        </div>
      </div>
      <SectionActionStrip
        progressKey="teacher-attendance"
        steps={['Choose class', 'Mark present or absent', 'Save attendance']}
        helpText="Choose the class first. Mark each student as present, absent, late, or excused. Press save attendance when you finish."
        reminderText="Attendance should be saved before lesson records are completed."
        canMarkDone={attendanceLogs.length > 0}
        blockedDoneText="Save at least one attendance record before marking attendance done."
        actions={[
          { label: isSubmitMode ? 'Continue marking' : 'Start attendance', onClick: () => setIsSubmitMode(true), tone: 'primary' },
          { label: 'View saved rolls', scrollTo: 'attendance-section' },
        ]}
        isEmpty={attendanceLogs.length === 0 && !isSubmitMode}
        emptyText="No attendance has been saved yet. Press Start attendance, choose a class, mark the students, then save."
      />
      <BackToPageMenu />

      {/* BANNER NOTIFICATION CONSOLES */}
      {successMsg && (
        <div className="p-4 bg-[#EDFDF5] border border-emerald-250 text-emerald-900 text-xs rounded flex items-center gap-3 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">LEDGER_SYNCHRONIZED</p>
            <p className="text-slate-600 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {validationError && (
        <div className="p-4 bg-[#FFF5F5] border border-rose-250 text-rose-900 text-xs rounded flex items-center gap-3 animate-in fade-in duration-150">
          <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">VALIDATION_CONFLICT</p>
            <p className="text-slate-600 mt-0.5">{validationError}</p>
          </div>
        </div>
      )}

      {/* BODY SECTION RENDER CONTROLLER */}
      {isSubmitMode ? (
        
        /* ACTIVE GRID ENTRY MODE */
        <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in duration-150" style={{ contentVisibility: 'auto' }}>
          
          {/* parameters selection head */}
          <div className="p-5 border-b border-slate-100 bg-slate-50 flex flex-wrap gap-4 items-center">
            
            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Target Room Class *</label>
              <select
                id="attendance-class-select"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Pick Class --</option>
                {teacherProfile.assignedClasses?.map((classId: string) => (
                  <option key={classId} value={classId}>
                    {classesMap.get(classId) || classId}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Subject Context</label>
              <select
                id="attendance-subject-select"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500"
              >
                <option value="">-- General Lesson --</option>
                {teacherProfile.subjectsTaught?.map((subId: string) => (
                  <option key={subId} value={subId}>
                    {subjectsMap.get(subId) || subId}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 min-w-[140px]">
              <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Roll date *</label>
              <input
                id="attendance-date-select"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-800 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Student Roster list checklist */}
          {selectedClass ? (
            <div className="p-0">
              <table className="w-full text-left border-collapse text-slate-700">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-mono tracking-wider text-slate-400 border-b border-slate-100 uppercase font-bold">
                    <th className="p-4 w-12 text-center">#</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4 w-72 text-center text-slate-500">Attendance Index Selection</th>
                    <th className="p-4">Staff Hand Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {roster.map((student, idx) => (
                    <tr key={student.studentId} className="hover:bg-slate-50/50">
                      <td className="p-4 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="p-4 font-bold text-slate-800">{student.studentName}</td>
                      
                      <td className="p-4">
                        <div className="flex gap-1 justify-center">
                          
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Present')}
                            className={`px-3 py-1 text-[10px] font-mono tracking-wide rounded cursor-pointer transition-colors ${
                              student.status === 'Present' 
                                ? 'bg-[#ECFDF5] text-emerald-800 border border-[#A7F3D0] font-bold' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            PRESENT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Late')}
                            className={`px-3 py-1 text-[10px] font-mono tracking-wide rounded cursor-pointer transition-colors ${
                              student.status === 'Late' 
                                ? 'bg-[#FEF3C7] text-amber-800 border border-[#FDE68A] font-bold' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            LATE
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Absent')}
                            className={`px-3 py-1 text-[10px] font-mono tracking-wide rounded cursor-pointer transition-colors ${
                              student.status === 'Absent' 
                                ? 'bg-[#FEE2E2] text-rose-800 border border-[#FCA5A5] font-bold' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            ABSENT
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, 'Excused')}
                            className={`px-3 py-1 text-[10px] font-mono tracking-wide rounded cursor-pointer transition-colors ${
                              student.status === 'Excused' 
                                ? 'bg-sky-50 text-sky-800 border border-sky-200 font-bold' 
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            EXCUSED
                          </button>

                        </div>
                      </td>

                      <td className="p-4">
                        <input
                          type="text"
                          value={student.remarks || ''}
                          onChange={(e) => handleRemarksChange(student.studentId, e.target.value)}
                          placeholder="Note reason, doctor medical slip code..."
                          className="w-full px-2 py-1 text-xs bg-slate-50/50 border border-slate-200 rounded focus:bg-white focus:outline-none focus:border-blue-400"
                        />
                      </td>

                    </tr>
                  ))}

                  {roster.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400">
                        No students found registered under this class node.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* SAVE BLOCK BUTTON */}
              <div className="p-5 border-t border-slate-100 bg-[#FCFDFE] flex justify-end">
                <button
                  id="btn-save-attendance-r"
                  onClick={handleSaveAttendance}
                  disabled={!!validationError}
                  className={`flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded shadow-sm cursor-pointer ${
                    validationError ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Save className="w-3.5 h-3.5" /> Synchronize Roll Call Sheet
                </button>
              </div>

            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-xs font-semibold mt-4">Select Room Class to Initiate Core Roll Call</p>
              <p className="text-[11px] text-slate-400 mt-1">Please select an isolated class parameter in the header filters above to populate students.</p>
            </div>
          )}

        </div>

      ) : (

        /* HISTORIC FILINGS SHEET */
        <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in duration-150">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center" style={{ contentVisibility: 'auto' }}>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              HISTORIC ATTENDANCE SUBMISSIONS ({attendanceLogs.length})
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">LOCKED_RECORDS</span>
          </div>

          <div className="p-0">
            <table className="w-full text-left border-collapse text-slate-700">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-mono tracking-wider text-slate-400 border-b border-slate-100 uppercase font-bold">
                  <th className="p-4">Submission Date</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Syllabus Context</th>
                  <th className="p-4 text-center">Roster Ratio</th>
                  <th className="p-4 text-right">Attendance Ratio</th>
                  <th className="p-4 text-right">Recorded Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {attendanceLogs.map((log) => {
                  const presents = log.items.filter(i => i.status === 'Present' || i.status === 'Late').length;
                  const ratio = log.items.length > 0 ? Math.round((presents / log.items.length) * 100) : 100;
                  
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/30">
                      <td className="p-4 font-mono font-bold text-slate-800">{log.date}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-800 border border-blue-100 rounded text-[10px] font-mono font-bold">
                          {classesMap.get(log.classId) || log.classId}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">
                        {log.subjectId ? (subjectsMap.get(log.subjectId) || log.subjectId) : 'General Roll Call'}
                      </td>
                      <td className="p-4 text-center font-mono">
                        {log.items.length} pupils
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          ratio >= 90 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {ratio}% Pres.
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-400 font-mono text-[10px]">
                        {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  );
                })}

                {attendanceLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400">
                      <FileSpreadsheet className="w-10 h-10 text-slate-200 mx-auto" />
                      <p className="text-xs font-semibold mt-4">No Historical Sheets Found</p>
                      <p className="text-[11px] text-slate-400 mt-1">Initiate a roll call using the button in the upper-right corner.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
}
