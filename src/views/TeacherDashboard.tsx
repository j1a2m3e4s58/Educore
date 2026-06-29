import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  ClipboardList, 
  CheckSquare, 
  PlayCircle, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowRight,
  Plus,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { User, School } from '../types';
import { 
  getAssignmentsInStorage, 
  getAttendanceRecordsInStorage, 
  getLessonRecordsInStorage, 
  getTeachingMaterialsInStorage,
  getTeacherActivityLogsInStorage,
  getTeachersInStorage,
  getStudentsInStorage,
  getClassesInStorage,
  getSubjectsInStorage
} from '../data/mockData';

interface TeacherDashboardProps {
  user: User;
  currentTenant: School;
  setActiveTab: (tab: string) => void;
  onQuickAction?: (actionType: 'assignment' | 'attendance' | 'lesson') => void;
}

export default function TeacherDashboard({ 
  user, 
  currentTenant, 
  setActiveTab,
  onQuickAction
}: TeacherDashboardProps) {
  const tenantId = currentTenant.id;

  // Retrieve current teacher's profile matching email
  const allTeachers = getTeachersInStorage(tenantId);
  const teacherProfile = (allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase()) || {
    id: `tch_temp_${user.id}`,
    fullName: user.name,
    email: user.email,
    assignedClasses: ['class_jhs1', 'class_jhs2'],
    subjectsTaught: ['subj_math', 'subj_science'],
    departmentId: 'dept_science',
    departmentName: 'Science & Mathematics',
    employmentStatus: 'Active'
  }) as any;
 
  // State stats variables
  const [stats, setStats] = useState({
    activeClassesCount: 0,
    assignedSubjectsCount: 0,
    pendingAssignments: 0,
    attendanceToday: 0,
    lessonsCompleted: 0
  });

  const [localActivityLogs, setLocalActivityLogs] = useState<any[]>([]);
  const [teacherQueries, setTeacherQueries] = useState<any[]>([]);
  const [resolverTexts, setResolverTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    const assignments = getAssignmentsInStorage(tenantId).filter(a => a.teacherId === teacherProfile.id);
    const attendanceRecs = getAttendanceRecordsInStorage(tenantId).filter(att => att.teacherId === teacherProfile.id);
    const lessonRecords = getLessonRecordsInStorage(tenantId).filter(l => l.teacherId === teacherProfile.id);

    // Calculate today's attendance percentage
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAtt = attendanceRecs.find(a => a.date === todayStr);
    let todayAttPercent = 0;
    if (todayAtt && todayAtt.items.length > 0) {
      const presents = todayAtt.items.filter(i => i.status === 'Present' || i.status === 'Late').length;
      todayAttPercent = Math.round((presents / todayAtt.items.length) * 100);
    } else {
      // average historically for default feel
      const sum = attendanceRecs.reduce((acc, curr) => {
        const presents = curr.items.filter(i => i.status === 'Present' || i.status === 'Late').length;
        return acc + (curr.items.length > 0 ? (presents / curr.items.length) * 100 : 100);
      }, 0);
      todayAttPercent = attendanceRecs.length > 0 ? Math.round(sum / attendanceRecs.length) : 0;
    }

    setStats({
      activeClassesCount: teacherProfile.assignedClasses?.length || 0,
      assignedSubjectsCount: teacherProfile.subjectsTaught?.length || 0,
      pendingAssignments: assignments.length,
      attendanceToday: todayAttPercent,
      lessonsCompleted: lessonRecords.length
    });

    const logs = getTeacherActivityLogsInStorage(tenantId)
      .filter(l => l.teacherId === teacherProfile.id)
      .slice(0, 5);
    setLocalActivityLogs(logs);

    // Load active unresolved academic head queries
    const qRaw = localStorage.getItem('educore_queries_ledger');
    if (qRaw) {
      try {
        const allQ = JSON.parse(qRaw);
        setTeacherQueries(allQ.filter((q: any) => q.tenantId === tenantId && q.teacherId === teacherProfile.id && !q.resolved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [tenantId, teacherProfile.id]);

  const handleResolveQuery = (queryId: string) => {
    const reply = resolverTexts[queryId] || 'Acknowledged. Log parameters updated according to directive.';
    const qRaw = localStorage.getItem('educore_queries_ledger');
    if (qRaw) {
      try {
        const allQ = JSON.parse(qRaw);
        const updated = allQ.map((q: any) => {
          if (q.id === queryId) {
            return { ...q, resolved: true, teacherResponse: reply };
          }
          return q;
        });
        localStorage.setItem('educore_queries_ledger', JSON.stringify(updated));
        setTeacherQueries(updated.filter((q: any) => q.tenantId === tenantId && q.teacherId === teacherProfile.id && !q.resolved));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Map class ID and Subject ID to human names
  const classesList = getClassesInStorage(tenantId);
  const subjectsList = getSubjectsInStorage(tenantId);
  const timetableStatus = localStorage.getItem('educore_timetable_status_' + tenantId) || 'draft';
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  const toMinutes = (value: string) => {
    const [hour, minute] = value.split(':').map(Number);
    return (hour || 0) * 60 + (minute || 0);
  };
  const todayPeriods = (timetableStatus === 'published' ? ((teacherProfile.teachingSchedule || []) as any[]) : [])
    .filter(slot => slot.day === todayName)
    .map(slot => ({
      ...slot,
      className: classesList.find(c => c.id === slot.classId)?.name || slot.classId,
      subjectName: subjectsList.find(s => s.id === slot.subjectId)?.name || slot.subjectId,
      isActiveNow: toMinutes(slot.startTime) <= nowMinutes && nowMinutes <= toMinutes(slot.endTime)
    }))
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const todayDate = new Date().toISOString().split('T')[0];
  const myAttendanceToday = getAttendanceRecordsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id && record.date === todayDate);
  const myLessonsToday = getLessonRecordsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id && (record.createdAt || '').slice(0, 10) === todayDate);
  const teacherAssignmentsAll = getAssignmentsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id);
  const teacherMaterialsAll = getTeachingMaterialsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id || record.uploadedBy === teacherProfile.fullName || record.uploadedBy === user.name);
  const teacherAttendanceAll = getAttendanceRecordsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id);
  const teacherLessonsAll = getLessonRecordsInStorage(tenantId).filter(record => record.teacherId === teacherProfile.id);
  const upcomingPeriods = todayPeriods.filter(slot => toMinutes(slot.startTime) - nowMinutes >= 0 && toMinutes(slot.startTime) - nowMinutes <= 15);
  const endedPeriods = todayPeriods.filter(slot => toMinutes(slot.endTime) < nowMinutes);
  const missedAttendancePeriods = endedPeriods.filter(slot => !myAttendanceToday.some(record => record.classId === slot.classId));
  const missedLessonPeriods = endedPeriods.filter(slot => !myLessonsToday.some(record => record.classId === slot.classId && record.subjectId === slot.subjectId));
  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const weeklyPeriods = (timetableStatus === 'published' ? ((teacherProfile.teachingSchedule || []) as any[]) : [])
    .map(slot => ({
      ...slot,
      className: classesList.find(c => c.id === slot.classId)?.name || slot.classId,
      subjectName: subjectsList.find(s => s.id === slot.subjectId)?.name || slot.subjectId,
      hasAttendance: teacherAttendanceAll.some(record => record.classId === slot.classId && record.subjectId === slot.subjectId),
      hasLesson: teacherLessonsAll.some(record => record.classId === slot.classId && record.subjectId === slot.subjectId),
      hasMaterial: teacherMaterialsAll.some(record => (record.classId === slot.classId || (record as any).classIds?.includes(slot.classId)) && (record.subjectId === slot.subjectId || (record as any).subjectIds?.includes(slot.subjectId))),
      hasAssignment: teacherAssignmentsAll.some(record => record.classId === slot.classId && record.subjectId === slot.subjectId)
    }))
    .sort((a, b) => `${weekDays.indexOf(a.day)}${a.startTime}`.localeCompare(`${weekDays.indexOf(b.day)}${b.startTime}`));
  const launchTeacherWork = (slot: any, action: 'attendance' | 'lesson' | 'materials' | 'assignment') => {
    localStorage.setItem('educore_work_context', JSON.stringify({
      ...slot,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action,
      tenantId,
      launchedAt: new Date().toISOString()
    }));
    const tabMap: Record<string, string> = {
      attendance: 'teacher-attendance',
      lesson: 'teacher-lessons',
      materials: 'teacher-materials',
      assignment: 'teacher-assignments'
    };
    setActiveTab(tabMap[action]);
  };

  return (
    <div className="teacher-dashboard-page space-y-6">

      {/* ACTIVE OVERSIGHT ALERTS SECTION */}
      {teacherQueries.length > 0 && (
        <div className="space-y-3">
          {teacherQueries.map(q => (
            <div key={q.id} className="p-4 bg-rose-50 border border-rose-200 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs shadow-2xs font-sans animate-in slide-in-from-top-4 duration-300">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                    QUERY FOR "{q.recordTitle}"
                  </span>
                  <span className="text-slate-400 font-mono text-[9px]">{new Date(q.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-rose-950 font-semibold text-xs leading-normal">
                  Academic Principal <span className="font-extrabold text-slate-900">{q.headUserName}</span> flagged your record:
                  <span className="block mt-1 font-mono italic text-rose-800 bg-white/40 p-2 rounded border border-rose-100">"{q.queryText}"</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto items-end sm:items-center">
                <input
                  type="text"
                  placeholder="Type corrective notes..."
                  value={resolverTexts[q.id] || ''}
                  onChange={(e) => setResolverTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                  className="px-2.5 py-1.5 bg-white border border-rose-200 rounded text-xs focus:outline-none focus:border-rose-400 w-full sm:w-48"
                />
                <button
                  onClick={() => handleResolveQuery(q.id)}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded cursor-pointer shrink-0 transition-colors"
                >
                  Confirm Correction
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* ENTERPRISE PAGE HEADER */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] bg-[#EBF5FF] text-[#1E40AF] px-2 py-0.5 rounded-sm font-mono font-bold uppercase tracking-wider">
            TEACHER CONSOLE GATEWAY
          </span>
          <h1 className="text-xl font-bold font-display text-slate-900 mt-2 tracking-tight">
            Welcome, {teacherProfile.fullName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Faculty Representative of <span className="font-semibold text-slate-700">{teacherProfile.departmentName || 'Academic Department'}</span> | {currentTenant.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <p className="text-slate-400">Current Academic Cycle</p>
            <p className="font-semibold text-slate-800">2025/2026 Academic Year</p>
          </div>
          <span className="w-px h-8 bg-slate-200"></span>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-100 font-mono">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ACTIVE SESSION
          </div>
        </div>
      </div>

      <div className="teacher-mobile-start hidden bg-white border border-[#E2E8F0] p-3 shadow-sm">
        <p className="text-[11px] font-black uppercase tracking-wide text-[#1A56DB]">Start work</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onQuickAction ? onQuickAction('attendance') : setActiveTab('teacher-attendance')}
            className="border border-emerald-200 bg-emerald-50 px-3 py-3 text-left text-xs font-black text-emerald-800"
          >
            Mark Attendance
            <span className="mt-0.5 block text-[10px] font-semibold text-emerald-700">Today class</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('teacher-materials')}
            className="border border-blue-200 bg-blue-50 px-3 py-3 text-left text-xs font-black text-blue-800"
          >
            Materials
            <span className="mt-0.5 block text-[10px] font-semibold text-blue-700">Upload or view</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction ? onQuickAction('assignment') : setActiveTab('teacher-assignments')}
            className="border border-amber-200 bg-amber-50 px-3 py-3 text-left text-xs font-black text-amber-800"
          >
            Assignment
            <span className="mt-0.5 block text-[10px] font-semibold text-amber-700">Give class work</span>
          </button>
          <button
            type="button"
            onClick={() => onQuickAction ? onQuickAction('lesson') : setActiveTab('teacher-lessons')}
            className="border border-indigo-200 bg-indigo-50 px-3 py-3 text-left text-xs font-black text-indigo-800"
          >
            Lesson Note
            <span className="mt-0.5 block text-[10px] font-semibold text-indigo-700">Record pages</span>
          </button>
        </div>
      </div>

      {(upcomingPeriods.length > 0 || missedAttendancePeriods.length > 0 || missedLessonPeriods.length > 0) && (
        <div className="grid gap-3 lg:grid-cols-3">
          {upcomingPeriods.length > 0 && (
            <div className="border border-blue-200 bg-blue-50 p-3 text-xs">
              <p className="font-black uppercase text-blue-800">Class starts soon</p>
              {upcomingPeriods.map(slot => <p key={`up-${slot.id}`} className="mt-1 font-semibold text-blue-950">{slot.className} - {slot.subjectName} at {slot.startTime}</p>)}
            </div>
          )}
          {missedAttendancePeriods.length > 0 && (
            <div className="border border-amber-200 bg-amber-50 p-3 text-xs">
              <p className="font-black uppercase text-amber-800">Attendance reminder</p>
              {missedAttendancePeriods.slice(0, 2).map(slot => <button key={`ma-${slot.id}`} type="button" onClick={() => launchTeacherWork(slot, 'attendance')} className="mt-1 block w-full text-left font-semibold text-amber-950 underline">Mark {slot.className} attendance</button>)}
            </div>
          )}
          {missedLessonPeriods.length > 0 && (
            <div className="border border-rose-200 bg-rose-50 p-3 text-xs">
              <p className="font-black uppercase text-rose-800">Lesson record reminder</p>
              {missedLessonPeriods.slice(0, 2).map(slot => <button key={`ml-${slot.id}`} type="button" onClick={() => launchTeacherWork(slot, 'lesson')} className="mt-1 block w-full text-left font-semibold text-rose-950 underline">Record {slot.subjectName}</button>)}
            </div>
          )}
        </div>
      )}
      {/* TODAY TIMETABLE WORKFLOW */}
      <div className="bg-white rounded border border-[#E2E8F0] p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Calendar className="w-4 h-4 text-[#1A56DB]" /> Today&apos;s Teaching Periods</h2>
            <p className="text-xs text-slate-500">Start attendance, lessons, materials, or assignments from the timetable.</p>
          </div>
          <span className="border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">{todayName}</span>
        </div>
        {todayPeriods.length === 0 ? (
          <div className="border border-dashed border-slate-250 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">No published timetable periods assigned for today.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {todayPeriods.map(slot => (
              <div key={slot.id} className={`border p-3 ${slot.isActiveNow ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200 bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400">{slot.startTime} - {slot.endTime}</p>
                    <h3 className="text-sm font-black text-slate-950">{slot.className}</h3>
                    <p className="text-xs font-bold text-blue-700">{slot.subjectName}</p>
                  </div>
                  {slot.isActiveNow && <span className="bg-emerald-600 px-2 py-1 text-[9px] font-black uppercase text-white">Now</span>}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-black sm:grid-cols-4">
                  <button type="button" onClick={() => launchTeacherWork(slot, 'lesson')} className="border border-blue-200 bg-blue-50 px-2 py-2 text-blue-800 hover:bg-blue-100">Start Lesson</button>
                  <button type="button" onClick={() => launchTeacherWork(slot, 'attendance')} disabled={!slot.isActiveNow} className={`border px-2 py-2 ${slot.isActiveNow ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100' : 'border-slate-200 bg-slate-50 text-slate-400'}`}>Mark Attendance</button>
                  <button type="button" onClick={() => launchTeacherWork(slot, 'materials')} className="border border-slate-200 bg-slate-50 px-2 py-2 text-slate-700 hover:bg-slate-100">Materials</button>
                  <button type="button" onClick={() => launchTeacherWork(slot, 'assignment')} className="border border-slate-200 bg-slate-50 px-2 py-2 text-slate-700 hover:bg-slate-100">Assignment</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* CORE FINANCIAL/BANKING METRICS ROWS */}
      <div className="bg-white rounded border border-[#E2E8F0] p-4 shadow-sm space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Briefcase className="w-4 h-4 text-[#1A56DB]" /> Teacher workload calendar</h2>
            <p className="text-xs text-slate-500">See every class period, what is ready, and what still needs attendance, lesson notes, materials, or assignments.</p>
          </div>
          <span className="w-fit border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-black text-slate-600">{weeklyPeriods.length} weekly periods</span>
        </div>
        {weeklyPeriods.length === 0 ? (
          <div className="border border-dashed border-slate-250 bg-slate-50 p-4 text-center text-xs font-semibold text-slate-500">No published weekly timetable yet. Ask the school manager to publish your teaching times.</div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-5">
            {weekDays.map(day => {
              const rows = weeklyPeriods.filter(slot => slot.day === day);
              return (
                <div key={day} className="border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[11px] font-black uppercase tracking-wide text-slate-600">{day}</p>
                  <div className="mt-2 space-y-2">
                    {rows.length > 0 ? rows.map(slot => (
                      <div key={`week-${slot.id}`} className="border border-white bg-white p-2 text-[10px] shadow-sm">
                        <p className="font-black text-slate-950">{slot.startTime} - {slot.endTime}</p>
                        <p className="font-bold text-blue-700">{slot.subjectName}</p>
                        <p className="font-semibold text-slate-500">{slot.className}</p>
                        <div className="mt-2 grid grid-cols-2 gap-1">
                          <button type="button" onClick={() => launchTeacherWork(slot, 'attendance')} className={`border px-1 py-1 font-black ${slot.hasAttendance ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>Attendance</button>
                          <button type="button" onClick={() => launchTeacherWork(slot, 'lesson')} className={`border px-1 py-1 font-black ${slot.hasLesson ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>Lesson</button>
                          <button type="button" onClick={() => launchTeacherWork(slot, 'materials')} className={`border px-1 py-1 font-black ${slot.hasMaterial ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>Materials</button>
                          <button type="button" onClick={() => launchTeacherWork(slot, 'assignment')} className={`border px-1 py-1 font-black ${slot.hasAssignment ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>Work</button>
                        </div>
                      </div>
                    )) : (
                      <p className="border border-dashed border-slate-200 bg-white p-2 text-[10px] font-bold text-slate-400">No class</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="teacher-metric-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-mono tracking-wider font-bold">ASSIGNED CLASSES</span>
            <Users className="w-4 h-4 text-[#1A56DB]" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.activeClassesCount}
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <span className="text-blue-600 font-bold">Primary</span> class rosters
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-mono tracking-wider font-bold">ASSIGNED SUBJECTS</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.assignedSubjectsCount}
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-bold">Syllabus</span> courses active
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-mono tracking-wider font-bold">PENDING ASSIGNMENTS</span>
            <ClipboardList className="w-4 h-4 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.pendingAssignments}
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1 font-mono">
            {stats.pendingAssignments > 0 ? 'Requires grade tracking' : 'All materials up-to-date'}
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-mono tracking-wider font-bold">ATTENDANCE SCOPE</span>
            <CheckSquare className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.attendanceToday}%
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            Average local presence
          </div>
        </div>

        <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-mono tracking-wider font-bold">LESSON LOGS RECORDED</span>
            <TrendingUp className="w-4 h-4 text-rose-500" />
          </div>
          <h2 className="text-2xl font-bold font-mono text-slate-900 mt-2">
            {stats.lessonsCompleted}
          </h2>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            Validated by Head office
          </div>
        </div>

      </div>

      {/* QUICK ACTIONS PANEL - PROMINENT BLUE ROW */}
      <div className="teacher-quick-panel bg-gradient-to-r from-[#0F2942] to-[#0A1A2D] text-white p-6 rounded border border-slate-800 shadow-md">
        <h3 className="text-xs font-semibold font-mono text-[#38BDF8] uppercase tracking-wider">
          ACADEMIC QUICK RECORDERS
        </h3>
        <p className="text-xs text-slate-300 mt-1">
          Perform administrative filings on the active roster. Logs are instantly processed, timestamped, and rendered for reviewer audits.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          
          <button 
            id="qa-mark-attendance"
            onClick={() => onQuickAction ? onQuickAction('attendance') : setActiveTab('teacher-attendance')}
            className="flex items-center justify-between p-4 bg-[#11243B] hover:bg-[#153051] border border-blue-900/60 rounded text-left transition-all duration-150 group cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-bold font-sans text-white group-hover:text-blue-300">
                Mark Student Attendance
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Filing daily presence grids by student roster
              </p>
            </div>
            <span className="p-2 bg-[#1A56DB] rounded-md text-white group-hover:scale-105 transition-transform shrink-0">
              <CheckSquare className="w-4 h-4" />
            </span>
          </button>

          <button 
            id="qa-create-assignment"
            onClick={() => onQuickAction ? onQuickAction('assignment') : setActiveTab('teacher-assignments')}
            className="flex items-center justify-between p-4 bg-[#11243B] hover:bg-[#153051] border border-blue-900/60 rounded text-left transition-all duration-150 group cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-bold font-sans text-white group-hover:text-amber-300">
                Create New Assignment
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Distribute topics, instructions, and marks
              </p>
            </div>
            <span className="p-2 bg-amber-500 rounded-md text-white group-hover:scale-105 transition-transform shrink-0">
              <Plus className="w-4 h-4" />
            </span>
          </button>

          <button 
            id="qa-record-lesson"
            onClick={() => onQuickAction ? onQuickAction('lesson') : setActiveTab('teacher-lessons')}
            className="flex items-center justify-between p-4 bg-[#11243B] hover:bg-[#153051] border border-blue-900/60 rounded text-left transition-all duration-150 group cursor-pointer"
          >
            <div>
              <h4 className="text-xs font-bold font-sans text-white group-hover:text-emerald-300">
                Record Lesson Taught
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Log objectives, materials used and home assignment
              </p>
            </div>
            <span className="p-2 bg-emerald-600 rounded-md text-white group-hover:scale-105 transition-transform shrink-0">
              <PlayCircle className="w-4 h-4" />
            </span>
          </button>

        </div>
      </div>

      {/* THREE SECTION GRID: ASSIGNED GRID, TODAY CLASSES, RECENT ACTIVITY LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ASSIGNED SUBJECTS & CLASSES DETAILS */}
        <div className="bg-white rounded border border-[#E2E8F0] shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#F1F5F9]" style={{ contentVisibility: 'auto' }}>
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              ASSIGNED DEPARTMENTS & SUBJECTS
            </h3>
          </div>
          <div className="p-5 flex-1 space-y-4">
            
            {/* Class badges list */}
            <div>
              <h4 className="text-xs font-semibold text-slate-600">Assigned Classes ({teacherProfile.assignedClasses?.length || 0})</h4>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {teacherProfile.assignedClasses?.map((classId: string) => {
                  const match = classesList.find(c => c.id === classId);
                  return (
                    <span key={classId} className="px-2.5 py-1 bg-slate-100 text-slate-800 text-[10px] rounded font-mono font-bold border border-slate-200">
                      {match ? match.name : classId}
                    </span>
                  );
                })}
                {(!teacherProfile.assignedClasses || teacherProfile.assignedClasses.length === 0) && (
                  <span className="text-xs text-slate-400">No classes assigned. Use School Admin setup.</span>
                )}
              </div>
            </div>

            {/* Subject badges list */}
            <div>
              <h4 className="text-xs font-semibold text-slate-600">Assigned Curriculum Subjects ({teacherProfile.subjectsTaught?.length || 0})</h4>
              <div className="space-y-2 mt-2.5">
                {teacherProfile.subjectsTaught?.map((subId: string) => {
                  const match = subjectsList.find(s => s.id === subId);
                  return (
                    <div key={subId} className="p-2 rounded bg-blue-50/50 border border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-semibold text-slate-700">{match ? match.name : subId}</span>
                      </div>
                      <span className="text-[9px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded uppercase font-mono">
                        {match ? match.code : 'ACTIVE'}
                      </span>
                    </div>
                  );
                })}
                {(!teacherProfile.subjectsTaught || teacherProfile.subjectsTaught.length === 0) && (
                  <span className="text-xs text-slate-400">No subjects assigned. Contact core registrar.</span>
                )}
              </div>
            </div>

            <div className="bg-[#FFF8E6] border border-amber-100 p-3.5 rounded flex gap-3 text-[10px] text-amber-800 mt-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <div>
                <p className="font-bold">CURRICULUM SECURITY RESTRICTION</p>
                <p className="text-slate-500 mt-0.5 leading-normal">
                  In compliance with EduCore AI Multi-Tenant parameters, you are restricted from view-logging other teachers' assigned subjects or grades. Row-level filters are enforced.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* TODAY CLASSES roster */}
        <div className="bg-white rounded border border-[#E2E8F0] shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#F1F5F9]">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              TODAY'S TEACHING SCHEDULE
            </h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-2 rounded font-mono">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Roster Cycles for {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
              </div>

              {/* Loop classes list and make columns */}
              <div className="space-y-3">
                
                {teacherProfile.assignedClasses?.map((classId: string, idx: number) => {
                  const matchClass = classesList.find(c => c.id === classId);
                  const mathSub = teacherProfile.subjectsTaught?.[idx % (teacherProfile.subjectsTaught?.length || 1)] || 'subj_math';
                  const matchSubName = subjectsList.find(s => s.id === mathSub)?.name || 'Subject Course';
                  const classTime = idx === 0 ? '08:30 AM - 09:40 AM' : idx === 1 ? '10:00 AM - 11:15 AM' : '11:45 AM - 01:00 PM';
                  
                  return (
                    <div key={classId} className="p-4 rounded border border-[#E2E8F0] hover:border-blue-300 transition-colors bg-white shadow-3xs flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{matchClass ? matchClass.name : classId}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          <span className="text-[10px] text-slate-400">{matchSubName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" strokeWidth={2.5} />
                          <span>{classTime}</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setActiveTab('teacher-attendance');
                        }}
                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 flex items-center gap-1 px-2.5 py-1 rounded tracking-wide font-sans transition-colors cursor-pointer shrink-0"
                      >
                        Roll Call <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}

                {(!teacherProfile.assignedClasses || teacherProfile.assignedClasses.length === 0) && (
                  <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded text-xs text-slate-400">
                    No active schedule lessons available today.
                  </div>
                )}

              </div>

            </div>

            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-4">
              <span className="h-2 w-2 rounded-full bg-slate-300"></span>
              Schedules synchronized from master registrar timetable
            </div>

          </div>
        </div>

        {/* MY RECENT ACTIVITY AUDIT TIMELINE */}
        <div className="bg-white rounded border border-[#E2E8F0] shadow-xs flex flex-col">
          <div className="p-4 border-b border-[#F1F5F9]">
            <h3 className="text-xs font-bold font-mono tracking-wider text-slate-500 uppercase">
              LOCAL FILING TIMELINE (AUDIT)
            </h3>
          </div>
          <div className="p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              
              <div className="space-y-3.5 relative pl-3 border-l-2 border-slate-100 py-1">
                
                {localActivityLogs.map((log) => (
                  <div key={log.id} className="relative group text-xs">
                    {/* Ring indicator */}
                    <span className="absolute -left-[16.5px] top-1 h-2.5 w-2.5 rounded-full border bg-white border-blue-500 ring-2 ring-white"></span>
                    
                    <div className="space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{log.action}</span>
                        <span className="text-[9px] font-mono text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">
                        {log.details}
                      </p>
                      {log.className && (
                        <div className="flex gap-2 items-center mt-1">
                          <span className="bg-slate-100 text-[8px] px-1 py-0.2 rounded font-mono font-bold text-slate-600">
                            {log.className}
                          </span>
                          {log.subjectName && (
                            <span className="bg-blue-50 text-blue-700 text-[8px] px-1 py-0.2 rounded font-mono font-bold">
                              {log.subjectName}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {localActivityLogs.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No filing logs recorded under this teacher node.
                  </div>
                )}

              </div>

            </div>

            <button 
              onClick={() => setActiveTab('teacher-log')}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1 mt-4 pt-3.5 border-t border-slate-100 font-sans cursor-pointer w-full"
            >
              Examine Complete Audit Log <ArrowRight className="w-3 h-3" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}
