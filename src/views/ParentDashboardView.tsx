/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckSquare, 
  ClipboardList, 
  CreditCard, 
  MessageSquare, 
  GraduationCap, 
  Calendar, 
  Clock, 
  BadgePercent, 
  FileText, 
  AlertCircle, 
  Download,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Invoice, Student, School, User, CalendarEvent, Announcement } from '../types';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { getAcademicTimeScope, matchesAcademicTimeScope } from '../data/academicTime';
import { getTenantSettings } from '../data/mockData';

interface ParentDashboardViewProps {
  user: User | null;
  currentTenant: School | null;
}

export default function ParentDashboardView({ user, currentTenant }: ParentDashboardViewProps) {
  const tenantId = currentTenant?.id || 'school_central_crest';
  const parentEmail = user?.email || 'r.vance@gmail.com';
  const tenantSettings = getTenantSettings(tenantId);
  const currencyCode = localStorage.getItem(`educore_fee_currency_${tenantId}`) || tenantSettings.currencyCode || 'GHS';
  const formatMoney = (amount: number) => new Intl.NumberFormat('en', {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'XOF' ? 0 : 2,
  }).format(amount);

  const [student, setStudent] = useState<Student | null>(null);
  const [linkedChildren, setLinkedChildren] = useState<Student[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activePane, setActivePane] = useState<'overview' | 'academics' | 'billing' | 'attendance'>('overview');
  const [timeScope, setTimeScope] = useState(() => getAcademicTimeScope(tenantId));

  // Hardcoded realistic records for Parent Robert Vance / Child Julian Vance Grade 10
  const ATTENDANCE_RECORDS = [
    { date: '2026-06-18', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-17', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-16', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-15', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-12', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-11', status: 'Absent', session: 'Morning', remark: 'Excused sick leave' },
    { date: '2026-06-10', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-09', status: 'Present', session: 'Morning', remark: 'On time' },
    { date: '2026-06-08', status: 'Present', session: 'Morning', remark: 'On time' }
  ];

  const ASSIGNMENTS_RECORDS = [
    { id: 'asgn_101', title: 'Quadratic Equations Worksheet', subject: 'Mathematics', dueDate: '2026-06-19', status: 'Submitted', score: 'Pending', feedback: 'Submitted early by pupil. Teacher assessment in queue.', teacher: 'Mr. Marcus Brody' },
    { id: 'asgn_102', title: 'Kinematics Lab Outline Draft', subject: 'Physics', dueDate: '2026-06-15', status: 'Graded', score: '94/100', feedback: 'Superb precision on force vector graphs. Well illustrated!', teacher: 'Mr. Marcus Brody' },
    { id: 'asgn_103', title: 'Shakespearian Tragedy Critique', subject: 'English Lit', dueDate: '2026-06-10', status: 'Graded', score: '88/100', feedback: 'Strong thematic summaries, formatting could match guidelines closer.', teacher: 'Mrs. Janet Finch' }
  ];

  const EXAM_RESULTS = [
    { subject: 'Mathematics (Advanced)', rawScore: 91, maxScore: 100, grade: 'A', classAverage: '72', remark: 'Outstanding logical reasoning.' },
    { subject: 'Physics Theory', rawScore: 89, maxScore: 100, grade: 'A-', classAverage: '70', remark: 'Exceptional structural analysis.' },
    { subject: 'English Literature', rawScore: 82, maxScore: 100, grade: 'B+', classAverage: '76', remark: 'Very strong literature argument synthesis.' },
    { subject: 'Chemistry Laboratory', rawScore: 95, maxScore: 100, grade: 'A+', classAverage: '78', remark: 'Pristine experimental records.' }
  ];

  useEffect(() => {
    let resolvedChildren: Student[] = [];
    // Resolve only the children linked to this parent account. Legacy seed data falls back to parent email.
    const cachedStudents = localStorage.getItem(`educore_students_${tenantId}`);
    if (cachedStudents) {
      const studentList: Student[] = JSON.parse(cachedStudents);
      const linkedIds = user?.linkedStudentIds?.length ? user.linkedStudentIds : user?.linkedStudentId ? [user.linkedStudentId] : [];
      const matches = linkedIds.length
        ? studentList.filter(s => linkedIds.includes(s.id))
        : studentList.filter(s => s.parentEmail?.toLowerCase() === parentEmail.toLowerCase());
      resolvedChildren = matches;
      setLinkedChildren(matches);
      if (matches[0]) setStudent(matches[0]);
    } else {
      // Fallback fallback setting
      const fallbackStudent = {
        id: 'student_central_1',
        tenantId,
        fullName: 'Julian Vance',
        studentId: 'STU-001',
        classId: 'Grade 10 - Blue',
        gender: 'Male',
        parentName: 'Robert Vance',
        parentPhone: '+1 (617) 555-9011',
        parentEmail: 'r.vance@gmail.com',
        dateOfBirth: '2010-04-12',
        admissionDate: '2025-09-12',
        status: 'Active',
        createdAt: '2025-09-12T08:00:00Z'
      };
      resolvedChildren = [fallbackStudent];
      setStudent(fallbackStudent);
      setLinkedChildren([fallbackStudent]);
    }

    // Load billing invoices
    const cachedInvs = localStorage.getItem(`educore_invoices_${tenantId}`);
    if (cachedInvs) {
      const invList: Invoice[] = JSON.parse(cachedInvs);
      const allowedNames = new Set(resolvedChildren.map(child => child.fullName));
      const matchInvs = allowedNames.size > 0 ? invList.filter(i => allowedNames.has(i.studentName)) : [];
      setInvoices(matchInvs);
    }

    // Load school board alerts
    const cachedAnn = localStorage.getItem(`educore_announcements_${tenantId}`);
    if (cachedAnn) {
      const annList = JSON.parse(cachedAnn);
      setAnnouncements(annList.filter((a: any) => a.targetAudience === 'All' || a.targetAudience === 'Parents'));
    }
  }, [tenantId, parentEmail, user?.linkedStudentId, user?.linkedStudentIds?.join('|')]);

  useEffect(() => {
    const refreshScope = () => setTimeScope(getAcademicTimeScope(tenantId));
    window.addEventListener('educore-time-scope-change', refreshScope);
    window.addEventListener('storage', refreshScope);
    return () => {
      window.removeEventListener('educore-time-scope-change', refreshScope);
      window.removeEventListener('storage', refreshScope);
    };
  }, [tenantId]);

  // Compute stats
  const scopedAttendanceRecords = ATTENDANCE_RECORDS.filter(item => matchesAcademicTimeScope(item.date, timeScope));
  const scopedAssignments = ASSIGNMENTS_RECORDS.filter(item => matchesAcademicTimeScope(item.dueDate, timeScope));
  const scopedInvoices = invoices.filter(item => matchesAcademicTimeScope(item.issueDate || item.dueDate, timeScope));
  const timelineItems = [
    ...scopedAttendanceRecords.map(item => ({ date: item.date, title: `Attendance: ${item.status}`, detail: item.remark, tone: item.status === 'Present' ? 'emerald' : 'amber' })),
    ...scopedAssignments.map(item => ({ date: item.dueDate, title: item.title, detail: `${item.subject} - ${item.status}`, tone: item.status === 'Graded' ? 'blue' : 'amber' })),
    ...scopedInvoices.map(item => ({ date: item.issueDate || item.dueDate, title: `Fee bill: ${item.invoiceNumber || item.id}`, detail: `${formatMoney(item.balance)} outstanding`, tone: item.balance > 0 ? 'rose' : 'emerald' })),
    ...announcements.map(item => ({ date: item.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10), title: item.title, detail: 'School notice', tone: 'blue' })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const periodLabel = timeScope.mode === 'day'
    ? timeScope.date
    : timeScope.mode === 'month'
      ? timeScope.month
      : timeScope.mode === 'term'
        ? `${timeScope.term}, ${timeScope.academicYear}`
        : timeScope.mode === 'year'
          ? timeScope.academicYear
          : 'all history';
  const digestDate = timeScope.mode === 'day' ? timeScope.date : new Date().toISOString().slice(0, 10);
  const todayAttendance = ATTENDANCE_RECORDS.find(item => item.date === digestDate) || scopedAttendanceRecords[0];
  const nextAssignment = [...scopedAssignments].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const nextInvoice = scopedInvoices.find(item => item.balance > 0) || scopedInvoices[0];
  const latestNotice = announcements[0];
  const dailyDigest = [
    { title: 'Attendance', value: todayAttendance ? todayAttendance.status : 'No record', detail: todayAttendance ? `${todayAttendance.date} - ${todayAttendance.remark}` : 'Teacher attendance will appear here.', action: 'Open attendance', pane: 'attendance' as const },
    { title: 'Assignment', value: nextAssignment ? nextAssignment.status : 'No task', detail: nextAssignment ? `${nextAssignment.title} due ${nextAssignment.dueDate}` : 'No assignment for this period. Check another term or wait for the teacher to post work.', action: 'Open assignments', pane: 'academics' as const },
    { title: 'Fees', value: nextInvoice ? formatMoney(nextInvoice.balance) : 'No bill', detail: nextInvoice ? `${nextInvoice.status} - due ${nextInvoice.dueDate}` : 'No fees for this term yet. The school will publish bills here.', action: 'Open fees', pane: 'billing' as const },
    { title: 'Notice', value: latestNotice ? 'New notice' : 'No notice', detail: latestNotice ? latestNotice.title : 'No school notice is showing now.', action: 'Open news', pane: 'overview' as const },
  ];
  const totalBilledOutstanding = scopedInvoices.reduce((acc, curr) => acc + curr.balance, 0);
  const attendancePresentCount = scopedAttendanceRecords.filter(a => a.status === 'Present').length;
  const attendanceRate = scopedAttendanceRecords.length > 0 
    ? ((attendancePresentCount / scopedAttendanceRecords.length) * 100).toFixed(1)
    : '100';

  const pendingAssignmentsCount = scopedAssignments.filter(a => a.status === 'Pending' || (a.status === 'Submitted' && a.score === 'Pending')).length;
  const timetableStatus = localStorage.getItem(`educore_timetable_status_${tenantId}`) || 'draft';
  const publishedClassTimetable = React.useMemo(() => {
    if (timetableStatus !== 'published') return [] as any[];
    try {
      const teachers = JSON.parse(localStorage.getItem(`educore_teachers_${tenantId}`) || '[]');
      const classes = JSON.parse(localStorage.getItem(`educore_classes_${tenantId}`) || '[]');
      const subjects = JSON.parse(localStorage.getItem(`educore_subjects_${tenantId}`) || '[]');
      const rows = teachers.flatMap((teacher: any) => (teacher.teachingSchedule || []).map((slot: any) => ({
        ...slot,
        teacherName: teacher.fullName,
        className: classes.find((room: any) => room.id === slot.classId)?.name || slot.classId,
        subjectName: subjects.find((subject: any) => subject.id === slot.subjectId)?.name || slot.subjectId
      })));
      const matched = rows.filter((row: any) => row.classId === student?.classId || row.className === student?.classId);
      return (matched.length ? matched : rows).sort((a: any, b: any) => `${a.day}${a.startTime}`.localeCompare(`${b.day}${b.startTime}`));
    } catch {
      return [];
    }
  }, [tenantId, timetableStatus, student?.classId]);

  return (
    <div className="space-y-6 select-text">
      
      {/* PARENT INTRO HEADER ELEMENT */}
      <div className="bg-gradient-to-r from-[#031525] to-[#11253C] text-white p-6 rounded-lg border border-slate-800 shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono font-bold bg-[#1A56DB] text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
               CHECK CHILD TODAY
            </span>
            <h3 className="text-lg font-bold font-display tracking-tight text-white leading-tight">My child school update</h3>
            <p className="text-xs text-slate-400">
               Welcome back, {user?.name || 'Robert Vance'}. Check attendance, assignments, fees, and school messages for <span className="font-bold text-blue-400">{student?.fullName || 'your child'}</span>.
            </p>
          </div>

          <div className="bg-[#1A56DB]/15 border border-blue-500/30 p-3 rounded text-[11px] max-w-[340px]">
            <span className="font-extrabold text-blue-300 block mb-0.5">Protected school records</span> You are only seeing records from <span className="underline font-bold text-white">{currentTenant?.name || 'your school'}</span>.
          </div>
        </div>
      </div>

      {linkedChildren.length > 1 && (
        <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Choose child</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {linkedChildren.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => setStudent(child)}
                className={`rounded border px-3 py-2 text-xs font-black ${student?.id === child.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-200 bg-slate-50 text-slate-700'}`}
              >
                {child.fullName}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Today summary</p>
            <h4 className="text-base font-extrabold text-slate-950">Today for {student?.fullName || 'your child'}</h4>
          </div>
          <span className="w-fit rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black text-emerald-800">{digestDate}</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {dailyDigest.map(item => (
            <button
              key={item.title}
              type="button"
              onClick={() => setActivePane(item.pane)}
              className="rounded-lg border border-white bg-white p-3 text-left shadow-sm hover:border-emerald-300"
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{item.title}</p>
              <p className="mt-1 text-sm font-black text-slate-950">{item.value}</p>
              <p className="mt-1 min-h-8 text-xs font-semibold text-slate-600">{item.detail}</p>
              <span className="mt-2 inline-block text-[10px] font-black text-emerald-700">{item.action}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Family timeline</p>
            <h4 className="text-base font-extrabold text-slate-950">What happened in {periodLabel}</h4>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-700">{timelineItems.length} records</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {timelineItems.length > 0 ? timelineItems.map((item, index) => (
            <div key={`${item.date}-${item.title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{item.date}</p>
              <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
              <p className="text-xs font-semibold text-slate-600">{item.detail}</p>
            </div>
          )) : (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500">No record is showing for this period. Try another date, term, or semester.</p>
          )}
        </div>
      </div>

      {/* THREE STRIPE SUMMARY METRICS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-slate-900 font-mono">{attendanceRate}%</span>
            <span className="text-[10px] text-emerald-600 font-bold">Present Rate</span>
          </div>
          <div className="mt-1 pb-0.5 max-w-[120px] rounded bg-slate-100 h-1">
            <div className="bg-emerald-500 h-1 rounded" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fees left to pay</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-lg font-bold font-mono ${totalBilledOutstanding > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {formatMoney(totalBilledOutstanding)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Left</span>
          </div>
          <p className="text-[9px] text-[#1A56DB] font-medium mt-1">Only current bills show here</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class result</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-slate-900 font-mono">88.5%</span>
            <span className="text-[10px] text-indigo-600 font-bold">Grade A</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">GPA: 3.8 / 4.0 Scale</p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Work to check</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-lg font-bold text-slate-900 font-mono">{pendingAssignmentsCount} Tasks</span>
            <span className="text-[10px] text-amber-600 font-bold">Open</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1">Assignments and marked work</p>
        </div>

      </div>

      {/* CORE PORTAL TAB CONTROLLERS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE BAR NAVIGATION SELECTORS */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">What to check</p>
            
            <button
              data-scroll-to="messages-section"
              onClick={() => setActivePane('overview')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'overview' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              School News
            </button>

            <button
              data-scroll-to="assignments-section"
              onClick={() => setActivePane('academics')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'academics' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              Assignments & Results
            </button>

            <button
              data-scroll-to="fees-section"
              onClick={() => setActivePane('billing')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'billing' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              Fees & Payments
            </button>

            <button
              data-scroll-to="attendance-section"
              onClick={() => setActivePane('attendance')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'attendance' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              Attendance
            </button>
          </div>

          {/* PUBLISHED CLASS TIMETABLE */}
          <div id="timetable-section" className="p-4 bg-white border border-slate-200 rounded-lg space-y-3 scroll-mt-4">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Class timetable</h4>
            {publishedClassTimetable.length === 0 ? (
              <p className="text-[11px] font-semibold text-slate-500">The school has not published the timetable yet.</p>
            ) : (
              <div className="space-y-2">
                {publishedClassTimetable.slice(0, 4).map((slot: any) => (
                  <div key={slot.id} className="border border-slate-150 bg-slate-50 p-2 text-xs">
                    <div className="flex items-center justify-between gap-2 font-bold text-slate-900">
                      <span>{slot.subjectName}</span>
                      <span className="text-blue-700">{slot.day.slice(0, 3)} {slot.startTime}</span>
                    </div>
                    <p className="mt-1 text-[10px] font-semibold text-slate-500">{slot.className} - {slot.teacherName}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* TEACHER DIRECT DIRECTORY CARD */}
          <div className="p-4 bg-slate-50 border border-slate-205 rounded-lg space-y-3">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Teacher contact</h4>
            
            <div className="space-y-2">
              <div className="text-xs bg-white p-2.5 rounded border border-slate-150">
                <p className="font-bold text-slate-800">Mr. Marcus Brody</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Faculty Lead / Mathematics & Physics</p>
                <a href="mailto:m.brody@centralcrest.edu" className="text-[10px] font-mono text-blue-600 mt-1 block hover:underline">
                  m.brody@centralcrest.edu
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* BROAD WORKSPACE PANE */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5 overflow-hidden shadow-sm">
          
          {/* PANE 1: OVERVIEW & NEW ALERTS */}
          {activePane === 'overview' && (
            <div id="messages-section" className="space-y-5 scroll-mt-4">
              <SectionActionStrip
                progressKey="parent-messages"
                steps={['Read notice', 'Check child work', 'Contact school if needed']}
                helpText="Read the school notice first. Then check assignments, fees, or attendance if the message mentions them."
                reminderText="Read new school notices before checking fees or assignments."
                actions={[
                  { label: 'Check assignments', onClick: () => setActivePane('academics'), scrollTo: 'assignments-section', tone: 'primary' },
                  { label: 'View fees', onClick: () => setActivePane('billing'), scrollTo: 'fees-section' },
                ]}
                isEmpty={announcements.length === 0}
                emptyText="No school notice is available right now. You can still check assignments, fees, or attendance."
              />
              
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 leading-none">Institutional Alerts & Bulletin Board</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono tracking-wide font-bold">Isolated School Stream</span>
              </div>

              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 rounded-lg border border-slate-150 bg-slate-50/40 hover:bg-slate-50 transition-colors space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="inline-block text-[8px] font-mono uppercase bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded border border-indigo-200">
                        {ann.pinned ? '★ Important Pin Alert' : 'General Board'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                    <p className="text-[11.5px] text-slate-600 leading-normal">{ann.content}</p>
                    
                    <p className="text-[9px] font-mono text-slate-400 text-right">Publisher Reference: {ann.createdBy}</p>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No central bulletins targeted to parents published today.</p>
                )}
              </div>

              {/* AUTOMATED COMPLIANCE BULLETINS */}
              <div className="mt-6 border border-amber-250 bg-amber-50/20 p-4.5 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold text-amber-950">First Semester Examinations Security</p>
                  <p className="text-[11px] text-amber-900 leading-normal">
                    Examinations start June 22nd. Fully cleared invoice accounts are required for seamless card clearance and student examination seat allotment. Contact administration if special wavier accounts apply.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* PANE 2: ACADEMICS / HOMEWORK */}
          {activePane === 'academics' && (
            <div id="assignments-section" className="space-y-6 scroll-mt-4">
              <SectionActionStrip
                progressKey="parent-assignments"
                steps={['Open assignment', 'Check due date', 'Support child']}
                helpText="Look at each assignment, check the due date, and help your child submit before the deadline."
                reminderText="Check due dates so your child does not miss teacher-given work."
                actions={[
                  { label: 'View fees', onClick: () => setActivePane('billing'), scrollTo: 'fees-section', tone: 'primary' },
                  { label: 'Check attendance', onClick: () => setActivePane('attendance'), scrollTo: 'attendance-section' },
                ]}
                isEmpty={scopedAssignments.length === 0}
                emptyText="No assignment is showing for your child yet. When the teacher posts work, it will appear here."
              />
              
              {/* ASSIGNMENTS TRACKING */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1 flex items-center justify-between">
                  <span>Current Homework Assignments</span>
                  <span className="text-[10px] font-mono lowercase text-slate-400">Julian Vance Grade 10</span>
                </h4>

                <div className="space-y-3.5">
                  {scopedAssignments.map(asgn => (
                    <div key={asgn.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm transition-all space-y-2.5">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-650 font-mono">
                            {asgn.subject}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 mt-1.5">{asgn.title}</h5>
                        </div>

                        <div className="text-right">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-bold border rounded-full uppercase ${
                            asgn.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {asgn.status}
                          </span>
                          <p className="text-[11px] font-mono font-bold text-blue-600 mt-1">{asgn.score}</p>
                        </div>
                      </div>

                      {asgn.feedback && (
                        <div className="p-2.5 bg-slate-50 border border-slate-150 rounded text-[11px] text-slate-600 leading-normal">
                          <span className="font-bold text-slate-700">Teacher Remarks:</span> "{asgn.feedback}"
                        </div>
                      )}

                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono pt-1">
                        <span>Instructor: {asgn.teacher}</span>
                        <span className="font-bold text-rose-500">Deadline: {asgn.dueDate}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* EXAMINATION RESULTS EXCEL SHEET */}
              <div className="space-y-3 pt-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 pb-1">
                  End of Midterm Evaluative Transcript
                </h4>

                <div className="border border-slate-200 rounded overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                        <th className="p-3">Syllabus Subject</th>
                        <th className="p-3 text-center">Score Ratio</th>
                        <th className="p-3 text-center">Grade Level</th>
                        <th className="p-3 text-center">Class Median</th>
                        <th className="p-3">Auditor Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {EXAM_RESULTS.map((res, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">{res.subject}</td>
                          <td className="p-3 text-center font-mono font-bold text-[#1A56DB]">{res.rawScore} / {res.maxScore}</td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-blue-50 border border-blue-250 rounded font-black text-blue-800 text-[10px]">
                              {res.grade}
                            </span>
                          </td>
                          <td className="p-3 text-center font-mono text-slate-500">{res.classAverage}%</td>
                          <td className="p-3 text-slate-600 text-[11px] italic">{res.remark}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <BackToPageMenu />

            </div>
          )}

          {/* PANE 3: BILLING & INVOICES */}
          {activePane === 'billing' && (
            <div id="fees-section" className="space-y-5 scroll-mt-4">
              <SectionActionStrip
                progressKey="parent-fees"
                steps={['Open invoice', 'Check balance', 'Pay or contact office']}
                helpText="Open the invoice, check the remaining balance, then pay or contact the school office if something is unclear."
                reminderText="Check the current term or semester fee balance and contact accounts if unclear."
                actions={[
                  { label: 'Check assignments', onClick: () => setActivePane('academics'), scrollTo: 'assignments-section', tone: 'primary' },
                  { label: 'View attendance', onClick: () => setActivePane('attendance'), scrollTo: 'attendance-section' },
                ]}
                isEmpty={scopedInvoices.length === 0}
                emptyText="No fee bill is showing for this child. The school will publish term or semester fees here."
              />
              
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Billed Invoices & Accounts Receipts</h3>
                <span className="text-[10px] text-slate-400 font-mono">Total Pending: {formatMoney(totalBilledOutstanding)}</span>
              </div>

              <div className="space-y-4">
                {scopedInvoices.map(inv => {
                  const isPending = inv.balance > 0;
                  return (
                    <div key={inv.id} className="border border-slate-200 rounded-lg p-5 bg-white space-y-4 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 pb-3 gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400">INVOICE_UID: {inv.invoiceNumber}</span>
                          <h4 className="text-xs font-bold text-slate-900 mt-1">First Semester Term Fee Bundle</h4>
                        </div>

                        <div className="text-right sm:text-right">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold tracking-wider border rounded-full uppercase ${
                            inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {inv.status}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Issued on: {inv.issueDate}</p>
                        </div>
                      </div>

                      {/* Display elements */}
                      <div className="grid grid-cols-3 gap-1.5 bg-slate-50 p-3 rounded text-xs">
                        <div>
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Billed Sum</span>
                          <span className="font-mono text-slate-800 font-bold">{formatMoney(inv.totalAmount - inv.discounts)}</span>
                        </div>
                        <div>
                          <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider block">Clearence Paid</span>
                          <span className="font-mono text-emerald-600 font-bold">{formatMoney(inv.amountPaid)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8.5px] font-bold text-slate-440 uppercase tracking-wider block">Remaining Due</span>
                          <span className="font-mono text-blue-700 font-black">{formatMoney(inv.balance)}</span>
                        </div>
                      </div>

                      {/* Payment simulation button */}
                      {isPending && (
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50/50 p-3 rounded-lg border border-blue-200/50 gap-2.5">
                          <div className="text-[10px] text-blue-900 font-semibold leading-normal flex gap-1.5">
                            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <span>This account balance supports later integrations for Card payments, Mobile Money APIs, or bank wire uploads. Contact Accounts Office with reference.</span>
                          </div>

                          <button
                            onClick={() => {
                              alert(`TUITION PAYMENT GATE: Simulating payment dispatch for invoice ${inv.invoiceNumber}. Settle ${formatMoney(inv.balance)}.`);
                              // Auto update invoice in local storage
                              const allInvs: Invoice[] = JSON.parse(localStorage.getItem(`educore_invoices_${tenantId}`) || '[]');
                              const mutated = allInvs.map(item => {
                                if (item.id === inv.id) {
                                  return {
                                    ...item,
                                    amountPaid: item.totalAmount - item.discounts,
                                    balance: 0,
                                    status: 'Paid' as const
                                  };
                                }
                                return item;
                              });
                              localStorage.setItem(`educore_invoices_${tenantId}`, JSON.stringify(mutated));
                              setInvoices(mutated.filter(item => item.studentName === 'Julian Vance'));
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shrink-0 shadow-sm cursor-pointer"
                          >
                            Pay Balance ({formatMoney(inv.balance)})
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}

                {scopedInvoices.length === 0 && (
                  <p className="text-xs text-slate-400 italic py-4 text-center">No fee bill is showing for this period.</p>
                )}
              </div>
              <BackToPageMenu />

            </div>
          )}

          {/* PANE 4: ATTENDANCE */}
          {activePane === 'attendance' && (
            <div id="attendance-section" className="space-y-4 scroll-mt-4">
              <SectionActionStrip
                progressKey="parent-attendance"
                steps={['Check date', 'Read status', 'Ask school if absent']}
                helpText="Check each date and status. If your child is marked absent and you are not sure why, contact the school."
                reminderText="Review absences and contact the school if a record looks wrong."
                actions={[
                  { label: 'View messages', onClick: () => setActivePane('overview'), scrollTo: 'messages-section', tone: 'primary' },
                  { label: 'View fees', onClick: () => setActivePane('billing'), scrollTo: 'fees-section' },
                ]}
                isEmpty={scopedAttendanceRecords.length === 0}
                emptyText="No attendance record is showing yet. Once the teacher marks attendance, it will appear here."
              />
              
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest font-mono">Attendance records</h3>
                <span className="text-[10px] text-emerald-600 font-bold">Average Presence: {attendanceRate}%</span>
              </div>

              <div className="border border-slate-205 rounded overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="p-3">Roll Date</th>
                      <th className="p-3">Status Badge</th>
                      <th className="p-3">Session Segment</th>
                      <th className="p-3">Auditor Notes/Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150">
                    {scopedAttendanceRecords.map((rec, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{rec.date}</td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold border rounded-full uppercase tracking-wider ${
                            rec.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-220' : 'bg-rose-50 text-rose-700 border-rose-220'
                          }`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-650">{rec.session}</td>
                        <td className="p-3 text-slate-500 italic text-[11px] font-sans">{rec.remark}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <BackToPageMenu />

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
