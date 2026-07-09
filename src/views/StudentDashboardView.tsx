/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  BookOpen, 
  Library, 
  Sparkles, 
  Calendar, 
  Clock, 
  Send, 
  CheckCircle,
  CheckSquare,
  FileText,
  Bookmark,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { Student, School, User, CalendarEvent, Announcement } from '../types';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { getAcademicTimeScope, matchesAcademicTimeScope } from '../data/academicTime';

interface StudentDashboardViewProps {
  user: User | null;
  currentTenant: School | null;
}

interface StudentAssignmentItem {
  id: string;
  title: string;
  subject: string;
  dueDate: string;
  status: string;
  score: string;
  teacher: string;
  instructions?: string;
  feedback?: string;
}

export default function StudentDashboardView({ user, currentTenant }: StudentDashboardViewProps) {
  const tenantId = currentTenant?.id || 'school_central_crest';
  const studentEmail = user?.email || 'j.vance@centralcrest.edu';

  const [student, setStudent] = useState<Student | null>(null);
  const [activePane, setActivePane] = useState<'desktop' | 'homework' | 'library' | 'revision-companion'>('desktop');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [timeScope, setTimeScope] = useState(() => getAcademicTimeScope(tenantId));

  // Simulation states
  const [submittingAsgnId, setSubmittingAsgnId] = useState<string | null>(null);
  const [submittedFile, setSubmittedFile] = useState('');
  const [commentsTxt, setCommentsTxt] = useState('');

  const CLASS_TIMETABLE = [
    { day: 'Mon', sub: 'Mathematics', time: '08:30 - 09:45', room: 'Lab Block A', teacher: 'Mr. Brody' },
    { day: 'Mon', sub: 'Physics Theory', time: '10:00 - 11:15', room: 'Physics Theater', teacher: 'Mr. Brody' },
    { day: 'Tue', sub: 'English Lit', time: '08:30 - 09:45', room: 'Hum 2', teacher: 'Mrs. Finch' },
    { day: 'Tue', sub: 'Chemical Lab', time: '12:00 - 13:30', room: 'Lab Block B', teacher: 'Dr. Jenkins' },
    { day: 'Wed', sub: 'Mathematics', time: '08:30 - 09:45', room: 'Lab Block A', teacher: 'Mr. Brody' },
    { day: 'Wed', sub: 'Digital Computing', time: '10:00 - 11:15', room: 'Cyber Center', teacher: 'Mrs. Vance' },
    { day: 'Thu', sub: 'English Lit', time: '11:15 - 12:30', room: 'Hum 2', teacher: 'Mrs. Finch' },
    { day: 'Fri', sub: 'Physical Education', time: '09:00 - 10:30', room: 'Stadium Field', teacher: 'Coach Vance' }
  ];

  const INITIAL_STUDENT_ASSIGNMENTS: StudentAssignmentItem[] = [
    { id: 'asgn_101', title: 'Quadratic Equations Worksheet', subject: 'Mathematics', dueDate: '2026-06-19', status: 'Pending', score: 'N/A', teacher: 'Mr. Marcus Brody', instructions: 'Attempt sections A through D on the printed chapter outline. Document all steps for linear algebraic reductions.' },
    { id: 'asgn_102', title: 'Kinematics Lab Outline Draft', subject: 'Physics', dueDate: '2026-06-15', status: 'Graded', score: '94/100', teacher: 'Mr. Marcus Brody', feedback: 'Pristine plotting of vectors.' },
    { id: 'asgn_103', title: 'Shakespearian Tragedy Critique', subject: 'English Lit', dueDate: '2026-06-10', status: 'Graded', score: '88/100', teacher: 'Mrs. Janet Finch', feedback: 'Very strong thematic outlines.' }
  ];

  const [studentAssignments, setStudentAssignments] = useState(INITIAL_STUDENT_ASSIGNMENTS);

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

  const LEARNING_MATERIALS = [
    { title: 'Algebraic Vector Reductions Slide', format: 'PDF Presentation', size: '4.2 MB', category: 'Mathematics', dateUploaded: '2026-06-12' },
    { title: 'Freefall Acceleration Constants Reference', format: 'Excel Sheet', size: '1.8 MB', category: 'Physics', dateUploaded: '2026-06-10' },
    { title: 'Macbeth Act IV Thematic Outline', format: 'EPUB / Text Doc', size: '920 KB', category: 'English Lit', dateUploaded: '2026-06-08' },
    { title: 'Inorganic Chemical Valence Structures Chart', format: 'Vector Chart PDF', size: '3.1 MB', category: 'Chemistry', dateUploaded: '2026-06-05' }
  ];

  // Approved AI Revision Guides (Transmitted/Approved by teachers)
  const APPROVED_AI_REVISIONS = [
    {
      id: 'rev_1',
      subject: 'Mathematics (Calculus/Algebra)',
      topic: 'Quadratic Formula & Graph Vertex Properties',
      outline: 'Learn to isolate the focus variable, find intercepts mathematically using discriminant tests, and calculate vertical axes symmetries easily.',
      aiReview: 'Pre-approved study digest compiled by AI Assistant and vetted by Instructor Brody.',
      steps: [
        'Determine discriminant (D = b² - 4ac)',
        'Evaluate intercepts based on D (D > 0: two real roots, D = 0: one real, D < 0: complex roots)',
        'Isolate local vertex: x = -b / (2a)'
      ]
    },
    {
      id: 'rev_2',
      subject: 'Physics',
      topic: 'Newtonian Kinematics Mechanics Formulas',
      outline: 'An abstract of critical laws of motion equations (V_f = V_i + at, S = Vt + 0.5at², etc.) with core variable definitions.',
      aiReview: 'Standard academic summary verified safe for student reference.',
      steps: [
        'Confirm reference coordinate systems',
        'Convert units to metric standard (m/s, kg, Newtons)',
        'Identify target unknown variable and choose matching motion function'
      ]
    }
  ];

  useEffect(() => {
    // Look up only the student linked to this login account. Legacy seed data falls back to the demo student.
    const cachedStudents = localStorage.getItem(`educore_students_${tenantId}`);
    if (cachedStudents) {
      const studentList: Student[] = JSON.parse(cachedStudents);
      const match = user?.linkedStudentId
        ? studentList.find(s => s.id === user.linkedStudentId)
        : studentList.find(s => s.parentEmail?.toLowerCase() === 'r.vance@gmail.com' || s.studentId === 'STU-001');
      if (match) setStudent(match);
    } else {
      setStudent({
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
      });
    }

    // Sync bulletins
    const cachedAnn = localStorage.getItem(`educore_announcements_${tenantId}`);
    if (cachedAnn) {
      const annList = JSON.parse(cachedAnn);
      setAnnouncements(annList.filter((a: any) => a.targetAudience === 'All' || a.targetAudience === 'Students'));
    }
  }, [tenantId, user?.linkedStudentId, studentEmail]);

  useEffect(() => {
    const refreshScope = () => setTimeScope(getAcademicTimeScope(tenantId));
    window.addEventListener('educore-time-scope-change', refreshScope);
    window.addEventListener('storage', refreshScope);
    return () => {
      window.removeEventListener('educore-time-scope-change', refreshScope);
      window.removeEventListener('storage', refreshScope);
    };
  }, [tenantId]);

  const scopedAssignments = studentAssignments.filter(item => matchesAcademicTimeScope(item.dueDate, timeScope));
  const scopedMaterials = LEARNING_MATERIALS.filter(item => matchesAcademicTimeScope(item.dateUploaded, timeScope));
  const studentTimeline = [
    ...scopedAssignments.map(item => ({ date: item.dueDate, title: item.title, detail: `${item.subject} - ${item.status}`, tone: item.status === 'Pending' ? 'amber' : 'emerald' })),
    ...scopedMaterials.map(item => ({ date: item.dateUploaded, title: item.title, detail: `${item.category} material`, tone: 'blue' })),
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
  const todayShort = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const todaysClassRows = (publishedClassTimetable.length
    ? publishedClassTimetable.map((slot: any) => ({ day: slot.day.slice(0, 3), sub: slot.subjectName, time: `${slot.startTime} - ${slot.endTime}`, room: slot.className, teacher: slot.teacherName }))
    : CLASS_TIMETABLE).filter((slot: any) => slot.day === todayShort);
  const nextClass = todaysClassRows[0] || (publishedClassTimetable.length
    ? publishedClassTimetable.map((slot: any) => ({ day: slot.day.slice(0, 3), sub: slot.subjectName, time: `${slot.startTime} - ${slot.endTime}`, room: slot.className, teacher: slot.teacherName }))[0]
    : CLASS_TIMETABLE[0]);
  const nextHomework = scopedAssignments.find(item => item.status === 'Pending') || scopedAssignments[0];
  const nextMaterial = scopedMaterials[0];
  const nextRevision = APPROVED_AI_REVISIONS[0];
  const nowActions = [
    { label: 'Go to class', title: nextClass ? nextClass.sub : 'No class', detail: nextClass ? `${nextClass.time} - ${nextClass.room}` : 'No timetable period is available.', pane: 'desktop' as const },
    { label: 'Do homework', title: nextHomework ? nextHomework.title : 'No homework', detail: nextHomework ? `Due ${nextHomework.dueDate}` : 'No assignment is pending now.', pane: 'homework' as const },
    { label: 'Read material', title: nextMaterial ? nextMaterial.title : 'No material', detail: nextMaterial ? nextMaterial.category : 'No material is in this period.', pane: 'library' as const },
    { label: 'Revise', title: nextRevision ? nextRevision.topic : 'No revision', detail: nextRevision ? nextRevision.subject : 'No approved guide yet.', pane: 'revision-companion' as const },
  ];

  // Homework Upload Simulation Action
  const handleSimulateHomeworkUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsgnId) return;

    const updated = studentAssignments.map(asgn => {
      if (asgn.id === submittingAsgnId) {
        return {
          ...asgn,
          status: 'Submitted',
          instructions: `${asgn.instructions} \n\n[STUDENT CARRIER ATTACHMENT]: "${submittedFile || 'Draft_Outline_Worksheet.pdf'}" uploaded safely. \nComments: ${commentsTxt || 'Completed sections.'}`
        };
      }
      return asgn;
    });

    setStudentAssignments(updated);
    setSubmittingAsgnId(null);
    setSubmittedFile('');
    setCommentsTxt('');
    alert(`SUBMIT COMMAND clears: digital homework uploaded straight to Mr. Brody's instructor inbox!`);
  };

  return (
    <div className="space-y-6 select-text">
      
      {/* STUDENT HEADER PORTAL FRAME */}
      <div className="bg-[#031525] text-white p-5 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <span className="text-[9px] font-mono font-bold bg-[#1A56DB] text-white px-2.5 py-0.5 rounded uppercase tracking-wider">
             DO SCHOOL WORK
          </span>
          <h3 className="text-base font-extrabold text-white tracking-tight">My school work today: {student?.fullName || 'Julian Vance'}</h3>
          <p className="text-xs text-slate-400">
             Class: <span className="font-bold text-blue-400">{student?.classId || '10A'}</span>. Open assignments, read materials, submit work, and use study help.
          </p>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded text-[11px] font-mono flex items-center gap-1.5 self-start md:self-auto">
          <CheckSquare className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-300 font-bold">Ready for class work</span>
        </div>
      </div>

      <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">What should I do now?</p>
            <h4 className="text-base font-extrabold text-slate-950">Start here before opening many pages</h4>
          </div>
          <span className="w-fit rounded-full border border-emerald-200 bg-white px-3 py-1 text-[10px] font-black text-emerald-800">{periodLabel}</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {nowActions.map(item => (
            <button
              key={item.label}
              type="button"
              onClick={() => setActivePane(item.pane)}
              className="rounded-lg border border-white bg-white p-3 text-left shadow-sm hover:border-emerald-300"
            >
              <p className="text-[10px] font-black uppercase tracking-wide text-emerald-700">{item.label}</p>
              <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
              <p className="mt-1 min-h-8 text-xs font-semibold text-slate-600">{item.detail}</p>
            </button>
          ))}
        </div>
      </div>

      {/* QUICK STATUS STRIP */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4.5 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignments to do</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            {scopedAssignments.filter(a => a.status === 'Pending').length} Active
          </p>
          <p className="text-[9px] text-[#1A56DB] font-medium mt-1">Submit files online</p>
        </div>

        <div className="bg-white p-4.5 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Study guides</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            {APPROVED_AI_REVISIONS.length} Modules
          </p>
          <p className="text-[9px] text-slate-400 mt-1">Checked by teachers</p>
        </div>

        <div className="bg-[#1A56DB]/5 border border-blue-150 p-4.5 rounded-lg">
          <p className="text-[10px] font-extrabold text-blue-800 uppercase tracking-wider">Target grade</p>
          <p className="text-lg font-bold text-blue-950 font-mono mt-1">Grade A</p>
          <p className="text-[9px] text-blue-700 font-bold mt-1">GPA: 3.8 / 4.0 scale</p>
        </div>

        <div className="bg-white p-4.5 rounded-lg border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Learning files</p>
          <p className="text-lg font-bold text-slate-900 font-mono mt-1">
            {scopedMaterials.length} Guides
          </p>
          <p className="text-[9px] text-slate-400 mt-1">Notes, slides, and class files</p>
        </div>

      </div>

      <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Student timeline</p>
            <h4 className="text-base font-extrabold text-slate-950">My work in {periodLabel}</h4>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black text-slate-700">{studentTimeline.length} items</span>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {studentTimeline.length > 0 ? studentTimeline.map((item, index) => (
            <div key={`${item.date}-${item.title}-${index}`} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{item.date}</p>
              <p className="mt-1 text-sm font-black text-slate-950">{item.title}</p>
              <p className="text-xs font-semibold text-slate-600">{item.detail}</p>
            </div>
          )) : (
            <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-500">No school work is showing for this period. Try another date, term, or semester.</p>
          )}
        </div>
      </div>

      {/* NAV CHICKLETS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* DESKTOP SELECTOR COLUMN */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">What to open</p>
            
            <button
              data-scroll-to="messages-section"
              onClick={() => setActivePane('desktop')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'desktop' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              My Home
            </button>

            <button
              data-scroll-to="assignments-section"
              onClick={() => setActivePane('homework')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'homework' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              School Assignments ({scopedAssignments.filter(a => a.status === 'Pending').length})
            </button>

            <button
              data-scroll-to="materials-section"
              onClick={() => setActivePane('library')}
              className={`w-full text-left px-3.5 py-2 text-xs font-bold rounded cursor-pointer transition-colors ${
                activePane === 'library' ? 'bg-[#1A56DB]/5 text-[#1A56DB]' : 'text-slate-650 hover:bg-slate-50'
              }`}
            >
              Learning Materials
            </button>

            <button
              data-scroll-to="materials-section"
              onClick={() => setActivePane('revision-companion')}
              className={`w-full text-left px-3 py-2 text-xs font-bold rounded cursor-pointer transition-colors flex items-center justify-between ${
                activePane === 'revision-companion' ? 'bg-blue-600 text-white font-extrabold' : 'text-slate-700 bg-amber-500/10 border border-amber-400/25'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Study Notes</span>
              </span>
              <span className="text-[9px] font-mono px-1 border rounded uppercase">safe</span>
            </button>
          </div>

          {/* ACTIVE CLASS TIMETABLE BOX */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
            <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider font-mono">Today classes</h4>
            <div className="space-y-2">
              <div className="p-2 border border-slate-150 bg-slate-50 rounded text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Mathematics</span>
                  <span className="text-[#1A56DB]">08:30am</span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Lab Block A • Instructor Brody
                </p>
              </div>

              <div className="p-2 border border-slate-150 bg-slate-50 rounded text-xs space-y-1">
                <div className="flex justify-between items-center font-bold text-slate-800">
                  <span>Physics Theory</span>
                  <span className="text-[#1A56DB]">10:00am</span>
                </div>
                <p className="text-[10px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  Physics Theater • Instructor Brody
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* WORKSPACE DISPLAY AREA */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 p-5 overflow-hidden shadow-sm">
          
          {/* VIEW 1: DESKTOP GENERAL */}
          {activePane === 'desktop' && (
            <div id="messages-section" className="space-y-6 scroll-mt-4">
              <SectionActionStrip
                progressKey="student-dashboard"
                steps={['Check timetable', 'Open assignments', 'Read materials']}
                helpText="Start with your timetable. Then check assignments and open learning materials for today."
                reminderText="Check your timetable and assignments before starting revision."
                actions={[
                  { label: 'Check assignments', onClick: () => setActivePane('homework'), scrollTo: 'assignments-section', tone: 'primary' },
                  { label: 'Open materials', onClick: () => setActivePane('library'), scrollTo: 'materials-section' },
                ]}
                isEmpty={announcements.length === 0 && publishedClassTimetable.length === 0}
                emptyText="No new notice or timetable is showing yet. Check assignments or learning materials for class work."
              />
              
              {/* BOARD ANNOUNCEMENTS */}
              <div id="timetable-section" className="space-y-3 scroll-mt-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 pb-1">
                  Campus Publications Board
                </h3>

                <div className="space-y-3">
                  {announcements.map(ann => (
                    <div key={ann.id} className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] text-slate-400">
                        <span className="font-bold text-slate-500 uppercase">Target: {ann.targetAudience}</span>
                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{ann.title}</h4>
                      <p className="text-[11.5px] text-slate-600 leading-normal">{ann.content}</p>
                    </div>
                  ))}

                  {announcements.length === 0 && (
                    <p className="text-xs text-slate-400 italic py-4 text-center">No bulletins published today.</p>
                  )}
                </div>
              </div>

              {/* TIMETABLE OUTLINE EXPANSION */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono border-b border-slate-100 pb-1">
                  Weekly Timetable Matrix
                </h3>

                <div className="border border-slate-200 rounded overflow-x-auto text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 font-bold border-b border-slate-200 text-slate-700">
                        <th className="p-2">Weekday</th>
                        <th className="p-2">Subject Name</th>
                        <th className="p-2">Time Slot</th>
                        <th className="p-2">Venue Room</th>
                        <th className="p-2">Faculty Lead</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150">
                      {(publishedClassTimetable.length ? publishedClassTimetable.map((slot: any) => ({ day: slot.day.slice(0, 3), sub: slot.subjectName, time: slot.startTime + ' - ' + slot.endTime, room: slot.className, teacher: slot.teacherName })) : CLASS_TIMETABLE).map((sl, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2 font-bold text-slate-800">{sl.day}</td>
                          <td className="p-2 font-medium text-slate-900">{sl.sub}</td>
                          <td className="p-2 font-mono text-blue-600 font-bold">{sl.time}</td>
                          <td className="p-2 text-slate-600">{sl.room}</td>
                          <td className="p-2 text-slate-550 font-medium">{sl.teacher}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* VIEW 2: HOMEWORK / ASSIGNMENTS */}
          {activePane === 'homework' && (
            <div id="assignments-section" className="space-y-4 scroll-mt-4">
              <SectionActionStrip
                progressKey="student-assignments"
                steps={['Read task', 'Do work', 'Upload solution']}
                helpText="Read the assignment instructions. Do the work carefully, then upload your solution before the due date."
                reminderText="Read the task and upload your solution before the due date."
                actions={[
                  { label: 'Open materials', onClick: () => setActivePane('library'), scrollTo: 'materials-section', tone: 'primary' },
                  { label: 'AI revision', onClick: () => setActivePane('revision-companion'), scrollTo: 'materials-section' },
                ]}
                isEmpty={scopedAssignments.length === 0}
                emptyText="No assignment is available yet. When your teacher gives work, it will appear here."
              />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                Enroll Class Homework tracker
              </h3>

              <div className="space-y-4">
                {scopedAssignments.map(asgn => (
                  <div key={asgn.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm background-white transition-all space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] bg-blue-55 text-blue-700 font-black px-1.5 py-0.5 rounded uppercase tracking-wide border border-blue-200">
                          {asgn.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-950 mt-1.5">{asgn.title}</h4>
                      </div>

                      <div className="text-right">
                        <span className={`inline-block px-2.5 py-0.5 text-[9px] font-extrabold border rounded-full uppercase ${
                          asgn.status === 'Graded' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : asgn.status === 'Submitted' ? 'bg-indigo-50 text-indigo-700 border-indigo-250' : 'bg-rose-50 text-rose-700 border-rose-250'
                        }`}>
                          {asgn.status}
                        </span>
                        <p className="text-sm font-mono font-bold text-blue-600 mt-1">{asgn.score}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-normal bg-slate-50 p-2.5 rounded border border-slate-150">
                      <span className="font-bold block text-slate-700 mb-0.5">Instructions:</span> 
                      {asgn.instructions}
                    </p>

                    {asgn.status === 'Pending' ? (
                      <div className="pt-2 border-t border-slate-150 flex justify-between items-center">
                        <span className="text-[10px] text-rose-500 font-bold font-mono">Due Link: {asgn.dueDate}</span>
                        
                        <button
                          onClick={() => setSubmittingAsgnId(asgn.id)}
                          className="px-3.5 py-1.5 bg-[#1A56DB] hover:bg-opacity-95 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Upload Homework Solution
                        </button>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-mono text-right italic font-medium">Clear of outstanding solutions</p>
                    )}
                  </div>
                ))}
              </div>
              <BackToPageMenu />
            </div>
          )}

          {/* VIEW 3: LIBRARY */}
          {activePane === 'library' && (
            <div id="materials-section" className="space-y-4 scroll-mt-4">
              <SectionActionStrip
                progressKey="student-materials"
                steps={['Choose material', 'Read or download', 'Use for homework']}
                helpText="Choose a material, read it or download it, then use it to complete your homework."
                reminderText="Open class materials before doing homework or AI revision."
                actions={[
                  { label: 'Check assignments', onClick: () => setActivePane('homework'), scrollTo: 'assignments-section', tone: 'primary' },
                  { label: 'AI revision', onClick: () => setActivePane('revision-companion'), scrollTo: 'materials-section' },
                ]}
                isEmpty={scopedMaterials.length === 0}
                emptyText="No material is available yet. Your teacher or school will upload notes, slides, or files here."
              />
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-2">
                Curriculum Core Learning Slides & Outlines
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scopedMaterials.map((mat, idx) => (
                  <div key={idx} className="p-4 border border-slate-205 rounded-lg bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono">
                        {mat.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 mt-2">{mat.title}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">Size: {mat.size} • Format: {mat.format}</p>
                    </div>

                    <button
                      onClick={() => alert(`Simulating slide download check... downloading secure node object of size ${mat.size}`)}
                      className="w-full text-center py-2 bg-white border border-slate-250 text-slate-705 hover:bg-slate-100 rounded text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
                    >
                      Download Material File
                    </button>
                  </div>
                ))}
              </div>
              <BackToPageMenu />
            </div>
          )}

          {/* VIEW 4: REVISION COMPANION */}
          {activePane === 'revision-companion' && (
            <div id="materials-section" className="space-y-5 select-text scroll-mt-4">
              <SectionActionStrip
                progressKey="student-revision"
                steps={['Pick topic', 'Read summary', 'Revise steps']}
                helpText="Pick a study topic, read the summary, then revise the listed steps before class or exam."
                reminderText="Revise one teacher-approved topic before exam preparation."
                actions={[
                  { label: 'Open assignments', onClick: () => setActivePane('homework'), scrollTo: 'assignments-section', tone: 'primary' },
                  { label: 'Open materials', onClick: () => setActivePane('library'), scrollTo: 'materials-section' },
                ]}
                isEmpty={APPROVED_AI_REVISIONS.length === 0}
                emptyText="No AI revision guide is available yet. Approved summaries will appear here when teachers publish them."
              />
              
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between gap-2.5">
                <div className="space-y-1">
                  <h3 className="text-xs font-extrabold text-blue-600 uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    School-Approved AI Study Guides
                  </h3>
                  <p className="text-[10px] text-slate-400">These topics summaries are generated by high-integrity AI and curated by classroom teachers for Grade 10-A study programs.</p>
                </div>
              </div>

              <div className="space-y-4">
                {APPROVED_AI_REVISIONS.map(it => (
                  <div key={it.id} className="border border-blue-200/60 rounded-lg p-5 bg-gradient-to-br from-blue-50/10 to-indigo-50/5 hover:shadow-md transition-all space-y-3.5">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] bg-blue-100 text-blue-800 font-black px-1.5 py-0.5 rounded uppercase font-mono">
                          {it.subject}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-2.5">{it.topic}</h4>
                      </div>

                      <span className="inline-block px-2 py-0.5 text-[8.5px] font-mono uppercase bg-emerald-50 border border-emerald-250 text-emerald-800 rounded font-bold">
                        Vetted & Safe
                      </span>
                    </div>

                    <p className="text-[11.5px] text-slate-650 leading-normal bg-white p-3 rounded border border-blue-150">
                      {it.outline}
                    </p>

                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-blue-800 uppercase tracking-widest font-mono">Core Study Step Formulas:</span>
                      <div className="space-y-1 font-mono text-[10px] text-slate-600 pl-2">
                        {it.steps.map((st, sIdx) => (
                          <div key={sIdx} className="flex gap-2">
                            <span>{sIdx + 1}.</span>
                            <span>{st}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <p className="text-[10px] italic text-[#1A56DB] font-sans font-medium">Vetting Teacher Comment: "{it.aiReview}"</p>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-normal text-slate-500">
                <span className="font-bold text-slate-800">Notice:</span> AI study notes are made from your class materials only.
              </div>
              <BackToPageMenu />

            </div>
          )}

        </div>

      </div>

      {/* SUBMIT HOMEWORK DIALOG POPUP */}
      {submittingAsgnId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Simulate Solution Upload</h3>
              <button onClick={() => setSubmittingAsgnId(null)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm">✕</button>
            </div>

            <form onSubmit={handleSimulateHomeworkUpload} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Worksheet File Attachment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian_Vance_Quadratic_Reductions.pdf"
                  value={submittedFile}
                  onChange={e => setSubmittedFile(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Write Message to Teacher</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Sola, completed all vertices intercepts calculations graph worksheets..."
                  value={commentsTxt}
                  onChange={e => setCommentsTxt(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSubmittingAsgnId(null)}
                  className="px-3 py-2 border border-slate-200 text-slate-650 rounded bg-slate-50 hover:bg-slate-100 cursor-pointer animate-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold shadow cursor-pointer animate-none"
                >
                  Confirm Upload & Submit Solution
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
