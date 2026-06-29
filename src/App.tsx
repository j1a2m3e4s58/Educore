/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  getSchoolsInStorage, 
  saveSchoolsInStorage, 
  getUsersInStorage, 
  saveUsersInStorage, 
  getActivityLogs, 
  appendActivityLog 
} from './data/mockData';
import { School, User, ActivityLog } from './types';

// Importing Views
import LoginView from './views/LoginView';
import SuperAdminDashboard from './views/SuperAdminDashboard';
import SchoolAdminDashboard from './views/SchoolAdminDashboard';
import TeachersManagement from './views/TeachersManagement';
import StudentsManagement from './views/StudentsManagement';
import ClassesManagement from './views/ClassesManagement';
import SubjectsManagement from './views/SubjectsManagement';
import DepartmentsManagement from './views/DepartmentsManagement';
import AcademicSettings from './views/AcademicSettings';
import RolePermissions from './views/RolePermissions';
import BulkImport from './views/BulkImport';

// Stage 3 Core Academic Views
import TeacherDashboard from './views/TeacherDashboard';
import AssignmentManagement from './views/AssignmentManagement';
import AttendanceManagement from './views/AttendanceManagement';
import LessonRecords from './views/LessonRecords';
import TeachingMaterials from './views/TeachingMaterials';
import SchoolHeadReview from './views/SchoolHeadReview';
import DailyActivityLog from './views/DailyActivityLog';
import AISuite from './views/AISuite';

// Stage 6 Portals, Fees, Calendar & Comm Views
import SchoolCalendarView from './views/SchoolCalendarView';
import FeesManagement from './views/FeesManagement';
import CommunicationCenter from './views/CommunicationCenter';
import ParentDashboardView from './views/ParentDashboardView';
import StudentDashboardView from './views/StudentDashboardView';

// Stage 7 Super Admin Views
import SuperAdminTenantView from './views/SuperAdminTenantView';
import SuperAdminSubscriptionView from './views/SuperAdminSubscriptionView';
import SuperAdminAuditView from './views/SuperAdminAuditView';
import SuperAdminSystemView from './views/SuperAdminSystemView';
import SuperAdminSupportView from './views/SuperAdminSupportView';
import EduCoreEcosystemView from './views/EduCoreEcosystemView';
import EduCoreCommercialHub from './views/EduCoreCommercialHub';
import EduOSCommandCenter from './views/EduOSCommandCenter';
import { 
  SaaSPackage, 
  TenantSubscription, 
  BillingRecord, 
  AuditLog, 
  SecurityPolicy, 
  LoginHistory, 
  BackupRecord, 
  IntegrationSetting, 
  SystemHealthMetric, 
  DeploymentChecklistItem, 
  SupportTicket 
} from './types';

// Importing Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import RegisterSchoolForm from './components/RegisterSchoolForm';
import SchoolsTable from './components/SchoolsTable';
import RoleManagement from './components/RoleManagement';
import SettingsPanel from './components/SettingsPanel';
import GuidedTour from './components/GuidedTour';
import PageErrorBoundary from './components/PageErrorBoundary';
import { canAccessTab, clearPortalSession, getSafeTabForRole, restoreUserFromSession, savePortalSession } from './security/accessControl';
import { getWorkflowLabel, isWorkflowOverdue, listTenantWorkflowProgress, loadWorkflowProgress, saveWorkflowProgress } from './data/workflowProgress';
import { AcademicTimeScope, archiveCurrentAcademicYear, getAcademicTimeScope, matchesAcademicTimeScope, saveAcademicTimeScope } from './data/academicTime';

// Importing Lucide feedback icon
import { X, CheckCircle2, ShieldAlert, Cpu, LayoutDashboard, Building2, Users, MessageSquare, Settings, PlusCircle, Calendar, Search, HelpCircle, Volume2, ArrowLeft, Home, DollarSign, ClipboardCheck, BookOpen, LockKeyhole, WifiOff, Cloud, FileText } from 'lucide-react';

type PortalLanguage = 'en';

const quickWords: Record<PortalLanguage, { search: string; help: string; read: string; simpleHelp: string }> = {
  en: {
    search: 'Search student, teacher, fee, class, material...',
    help: 'Help',
    read: 'Read',
    simpleHelp: 'Use the big buttons for common work. Use the bottom bar on phone to move quickly.',
  },
};
const pageHelpText: Record<string, string> = {
  dashboard: 'This is your home page. Use the big cards to open schools, users, settings, and reports.',
  register: 'Use this page to add a new school. Fill one section at a time, then save.',
  schools: 'This page shows all schools. Use Open to view a school, and use status colors to know what needs attention.',
  roles: 'This page controls users and access. Add only people who should use the portal.',
  settings: 'This page changes portal settings. If you are not sure, ask an administrator before saving.',
  'school-dashboard': 'This is the school home page. Use the large buttons for students, teachers, fees, messages, and reports.',
  'school-students': 'This page keeps student records. Search a student, open the profile, edit details, or add a new student.',
  'school-teachers': 'This page keeps teacher records. Search a teacher, open the profile, or add a new teacher.',
  'school-fees': 'This page shows fees and payments. Green means paid, yellow means pending, and red means overdue.',
  'school-comm': 'Use this page to send messages to parents, teachers, and students.',
  'school-calendar': 'This page shows school events, dates, and activities.',
  'school-settings': 'Use this page to adjust school setup and important preferences.',
  'school-users': 'Use this page to create and manage logins for teachers, parents, students, managers, accountants, supervisors, and assistant admins.',
  'teacher-dashboard': 'This is the teacher home page. Use it to mark attendance, give work, and view lessons.',
  'teacher-attendance': 'Use this page to mark students present or absent.',
  'teacher-ai-suite': 'Use this page for AI help. Select materials or covered pages, then make notes, summaries, or exam questions.',
  'teacher-materials': 'Use this page to upload school materials, open them for teaching, and prepare them for AI notes or exam questions.',
  'teacher-assignments': 'Use this page to give assignments. Students and parents can see the assignment records.',
  'teacher-lessons': 'Use this page to record the pages and topics you have reached in class.',
  'school-review': 'This page helps the school manager see teacher work, activity records, and statistics for who is working well.',
  'school-classes': 'Use this page to organize classes and support timetable planning based on teachers, subjects, and class load.',
  'school-subjects': 'Use this page to manage subjects and connect them to teachers for better timetable planning.',
  'parent-dashboard': 'This is the parent home page. Use it to see your child records, fees, and school updates.',
  'student-dashboard': 'This is the student home page. Use it to see lessons, assignments, and school updates.',
  'edu-ecosystem': 'This page shows education news, opportunities, and school community information.',
  'commercial-hub': 'This page is the marketplace. Use it for school-related products and services.',
  'eduos-engine': 'This page is the command center for advanced school system controls.',
};

const plainToastText = (message: string) => message
  .replace(/tenant/gi, 'school')
  .replace(/cluster/gi, 'system')
  .replace(/node/gi, 'school')
  .replace(/workspace/gi, 'portal')
  .replace(/tunneling/gi, 'opening')
  .replace(/synchronized/gi, 'ready')
  .replace(/authenticated/gi, 'signed in')
  .replace(/deallocated/gi, 'paused')
  .replace(/protocols/gi, 'settings')
  .replace(/registry/gi, 'list')
  .replace(/credentials/gi, 'login details');

const speechLangByPortalLanguage: Record<PortalLanguage, string> = {
  en: 'en-US',
};

function speakText(text: string, language: PortalLanguage = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.88;
  utterance.lang = speechLangByPortalLanguage[language] || 'en-US';
  window.speechSynthesis.speak(utterance);
}

function scrollAppContentToTop() {
  if (typeof document === 'undefined') return;
  const scrollArea = document.querySelector('.app-content') as HTMLElement | null;
  if (scrollArea) {
    scrollArea.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function getSectionTarget(tab: string, label = '') {
  const key = `${tab} ${label}`.toLowerCase();
  if (key.includes('fee') || key.includes('bill') || key.includes('tuition') || key.includes('payment')) return 'fees-section';
  if (key.includes('assignment') || key.includes('homework') || key.includes('task') || key.includes('work')) return 'assignments-section';
  if (key.includes('material') || key.includes('library') || key.includes('file') || key.includes('upload')) return 'materials-section';
  if (key.includes('attendance') || key.includes('attend')) return 'attendance-section';
  if (key.includes('timetable') || key.includes('schedule') || key.includes('calendar') || key.includes('teacher')) return 'timetable-section';
  if (key.includes('message') || key.includes('update') || key.includes('alert') || key.includes('communication')) return 'messages-section';
  return 'page-live-content';
}

function highlightPageTarget(target: HTMLElement) {
  target.classList.remove('section-jump-highlight');
  void target.offsetWidth;
  target.classList.add('section-jump-highlight');
  window.setTimeout(() => target.classList.remove('section-jump-highlight'), 1800);
}

function scrollToPageTarget(targetId: string, attempt = 0) {
  if (typeof document === 'undefined') return;
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    highlightPageTarget(target);
  } else if (attempt < 8) {
    window.setTimeout(() => scrollToPageTarget(targetId, attempt + 1), 120);
  }
}

function scrollToMainWorkspace() {
  scrollToPageTarget('page-live-content');
}

function PortalAssistBar({
  role,
  language,
  setLanguage,
  simpleMode,
  setActiveTab,
  fontScale,
  setFontScale,
  bigMode,
  setBigMode,
  activeTab,
}: {
  role: User['role'];
  language: PortalLanguage;
  setLanguage: (language: PortalLanguage) => void;
  simpleMode: boolean;
  setActiveTab: (tab: string) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  bigMode: boolean;
  setBigMode: (enabled: boolean) => void;
  activeTab: string;
}) {
  const [query, setQuery] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const copy = quickWords.en;
  const suggestions = role === 'SuperAdmin'
    ? [
        { label: 'Add School', tab: 'register', keywords: 'add school register create' },
        { label: 'All Schools', tab: 'schools', keywords: 'school list all schools tenant academy institution' },
        { label: 'Users', tab: 'roles', keywords: 'users people role access permission who can login staff accounts' },
        { label: 'Settings', tab: 'settings', keywords: 'settings setup' },
        { label: 'Help Desk', tab: 'sa-support-tickets', keywords: 'support help ticket problem' },
      ]
    : role === 'SchoolAdmin'
      ? [
          { label: 'Students', tab: 'school-students', keywords: 'students pupils learners child children admission roster register student profile' },
          { label: 'Teachers', tab: 'school-teachers', keywords: 'teachers staff teacher not working timetable subjects workload supervisor' },
          { label: 'Fees', tab: 'school-fees', keywords: 'fees payments invoices money cedis dollars bill owing debt term bill semester bill' },
          { label: 'Messages', tab: 'school-comm', keywords: 'messages parents communication notice announcement contact parent' },
          { label: 'Timetable', tab: 'school-teachers', keywords: 'classes timetable schedule periods rooms publish' },
          { label: 'Subjects', tab: 'school-subjects', keywords: 'subjects courses lessons' },
          { label: 'Review Teachers', tab: 'school-review', keywords: 'review teachers performance statistics teacher not working hardworking lazy manager approval approve' },
          { label: 'Permissions', tab: 'school-permissions', keywords: 'permission access accountant supervisor admin parent teacher student can see can edit' },
          { label: 'Import Data', tab: 'school-import', keywords: 'bulk import upload excel csv many students many teachers classes subjects fees' },
        ]
      : role === 'Teacher'
        ? [
            { label: 'Mark Attendance', tab: 'teacher-attendance', keywords: 'attendance present absent roll call mark present mark absent child absent student absent' },
            { label: 'Create Assignment', tab: 'teacher-assignments', keywords: 'assignments homework tasks give work create assignment class work' },
            { label: 'Record Lesson', tab: 'teacher-lessons', keywords: 'lessons records topic pages taught daily lesson' },
            { label: 'AI Exam Questions', tab: 'teacher-ai-suite', keywords: 'ai tools notes exam questions set exam generate questions' },
            { label: 'Upload Material', tab: 'teacher-materials', keywords: 'materials files books slides upload upload book upload file teaching material' },
          ]
        : [
            { label: role === 'Parent' ? 'Check Fees' : 'Assignments', tab: role === 'Parent' ? 'parent-dashboard' : 'student-dashboard', keywords: 'home dashboard fees money child absent assignments homework materials timetable report' },
            { label: 'Calendar', tab: 'school-calendar', keywords: 'calendar events' },
            { label: 'Hub', tab: 'edu-ecosystem', keywords: 'hub news' },
          ];
  const filtered = query.trim()
    ? suggestions.filter(item => `${item.label} ${item.keywords}`.toLowerCase().includes(query.toLowerCase())).slice(0, 4)
    : [];

  if (!simpleMode) return null;

  return (
    <div className="academic-scope-bar mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={copy.search}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm font-medium text-slate-800 outline-none focus:border-blue-400 focus:bg-white"
          />
        </div>
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A56DB] flex items-center justify-center border border-blue-100"
          title={copy.help}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
        <button
          onClick={() => speakText(copy.simpleHelp, 'en')}
          className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100"
          title={copy.read}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto">
        <button
          onClick={() => setFontScale(Math.max(90, fontScale - 6))}
          className="rounded-full px-3 py-1 text-[11px] font-black border shrink-0 bg-white text-slate-700 border-slate-200"
          title="Reduce text size"
        >
          A-
        </button>
        <span className="rounded-full px-2 py-1 text-[10px] font-black border shrink-0 bg-slate-50 text-slate-500 border-slate-200">
          Text {fontScale}%
        </span>
        <button
          onClick={() => setFontScale(Math.min(140, fontScale + 6))}
          className="rounded-full px-3 py-1 text-[12px] font-black border shrink-0 bg-[#1A56DB] text-white border-[#1A56DB]"
          title="Increase text size"
        >
          A+
        </button>
        <button
          onClick={() => setBigMode(!bigMode)}
          className={`rounded-full px-3 py-1 text-[11px] font-black border shrink-0 ${
            bigMode ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
          title="Make the portal easier to see and tap"
        >
          Big Mode
        </button>
        <button
          onClick={() => speakText(pageHelpText[activeTab] || copy.simpleHelp, 'en')}
          className="rounded-full px-3 py-1 text-[11px] font-black border shrink-0 bg-blue-50 text-blue-800 border-blue-200"
          title="Explain this page"
        >
          Explain
        </button>
      </div>

      {showHelp && (
        <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950">
          {copy.simpleHelp}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {filtered.map(item => (
            <button
              key={item.tab}
              data-scroll-to={getSectionTarget(item.tab, item.label)}
              onClick={() => {
                setActiveTab(item.tab);
                setQuery('');
              }}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-bold text-slate-800"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OfflineSyncStatus() {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [pending, setPending] = useState(() => Number(localStorage.getItem('educore_pending_sync_count') || '0'));

  useEffect(() => {
    const refresh = () => setPending(Number(localStorage.getItem('educore_pending_sync_count') || '0'));
    const goOnline = () => {
      setOnline(true);
      localStorage.setItem('educore_pending_sync_count', '0');
      refresh();
    };
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    window.addEventListener('educore-workflow-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('educore-workflow-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  return (
    <div className={`mb-3 flex items-center justify-between gap-3 rounded-2xl border p-3 text-xs font-black shadow-sm ${
      online ? 'border-emerald-100 bg-emerald-50 text-emerald-900' : 'border-amber-100 bg-amber-50 text-amber-950'
    }`}>
      <div className="flex items-center gap-2">
        {online ? <Cloud className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
        <span>{online ? 'Online. Work saved on this device and ready to sync.' : 'Low network/offline. Work is saved on this device and will sync later.'}</span>
      </div>
      <span className="shrink-0 rounded-full bg-white px-2 py-1">{pending} saved</span>
    </div>
  );
}

function AcademicTimeScopeBar({ tenantId, role }: { tenantId: string; role: User['role'] }) {
  const [scope, setScope] = useState<AcademicTimeScope>(() => getAcademicTimeScope(tenantId));
  const [archiveMsg, setArchiveMsg] = useState('');
  const [showArchives, setShowArchives] = useState(false);
  const [archiveList, setArchiveList] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(`educore_academic_archive_${tenantId}`) || '[]');
    } catch {
      return [];
    }
  });

  const updateScope = (patch: Partial<AcademicTimeScope>) => {
    const next = { ...scope, ...patch };
    setScope(next);
    saveAcademicTimeScope(tenantId, next);
  };

  const refreshArchives = () => {
    try {
      setArchiveList(JSON.parse(localStorage.getItem(`educore_academic_archive_${tenantId}`) || '[]'));
    } catch {
      setArchiveList([]);
    }
  };

  return (
    <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Academic history filter</p>
          <p className="mt-1 text-xs font-semibold text-slate-600">
            Showing {scope.mode} records for {scope.term}, {scope.academicYear}. Old academic years stay searchable.
          </p>
        </div>
        <div className="academic-scope-controls flex flex-wrap gap-2">
          <select value={scope.mode} onChange={e => updateScope({ mode: e.target.value as AcademicTimeScope['mode'] })} className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700">
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="term">Term/Semester</option>
            <option value="year">Academic Year</option>
            <option value="all">All History</option>
          </select>
          <input type="date" value={scope.date} onChange={e => updateScope({ date: e.target.value })} className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700" />
          <input type="month" value={scope.month} onChange={e => updateScope({ month: e.target.value })} className="min-h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700" />
          <input value={scope.academicYear} onChange={e => updateScope({ academicYear: e.target.value })} className="min-h-10 w-28 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700" />
          <input value={scope.term} onChange={e => updateScope({ term: e.target.value })} className="min-h-10 w-32 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-black text-slate-700" />
          {role === 'SchoolAdmin' && (
            <button
              type="button"
              onClick={() => {
                const snapshot = archiveCurrentAcademicYear(tenantId);
                refreshArchives();
                setArchiveMsg(`Archived ${snapshot.academicYear} / ${snapshot.term}`);
              }}
              className="min-h-10 rounded-xl bg-slate-950 px-3 text-xs font-black text-white"
            >
              Archive year
            </button>
          )}
          {role === 'SchoolAdmin' && (
            <button
              type="button"
              onClick={() => {
                refreshArchives();
                setShowArchives(value => !value);
              }}
              className="min-h-10 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-800"
            >
              {showArchives ? 'Hide archives' : 'Open archives'}
            </button>
          )}
        </div>
      </div>
      {archiveMsg && <p className="mt-2 rounded-xl border border-emerald-100 bg-emerald-50 p-2 text-xs font-black text-emerald-800">{archiveMsg}</p>}
      {showArchives && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-slate-700">Academic archive browser</p>
              <p className="text-xs font-semibold text-slate-500">Open an old year, compare totals, or print reports for school records.</p>
            </div>
            <button type="button" onClick={() => window.print()} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm">Print</button>
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {archiveList.length > 0 ? archiveList.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => updateScope({ mode: 'term', academicYear: item.academicYear, term: item.term })}
                className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm hover:border-blue-300"
              >
                <p className="text-sm font-black text-slate-950">{item.academicYear}</p>
                <p className="text-xs font-bold text-blue-700">{item.term}</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] font-black text-slate-600">
                  <span>Attendance {item.counts?.attendance || 0}</span>
                  <span>Assignments {item.counts?.assignments || 0}</span>
                  <span>Lessons {item.counts?.lessons || 0}</span>
                  <span>Fees {item.counts?.fees || 0}</span>
                </div>
              </button>
            )) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white p-3 text-xs font-bold text-slate-500">No archive yet. Press Archive year at the end of an academic year or term/semester.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FloatingHelpButton({
  activeTab,
  role,
  bigMode,
  setBigMode,
  setActiveTab,
}: {
  activeTab: string;
  role: User['role'];
  bigMode: boolean;
  setBigMode: (enabled: boolean) => void;
  setActiveTab: (tab: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const homeTab = role === 'SuperAdmin'
    ? 'dashboard'
    : role === 'Teacher'
      ? 'teacher-dashboard'
      : role === 'Parent'
        ? 'parent-dashboard'
        : role === 'Student'
          ? 'student-dashboard'
          : 'school-dashboard';
  const text = pageHelpText[activeTab] || 'Use the bottom menu or the big buttons to move around. Ask an administrator if you are not sure.';

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
      {open && (
        <div className="w-[min(92vw,340px)] rounded-2xl border border-blue-100 bg-white/95 p-4 shadow-2xl shadow-slate-900/20 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-700">Help Me</p>
              <h3 className="mt-1 text-base font-extrabold text-slate-950">What can I do here?</h3>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              title="Close help"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">{text}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => speakText(text)}
              className="min-h-11 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm font-extrabold text-emerald-800"
            >
              Read Page
            </button>
            <button
              onClick={() => setBigMode(!bigMode)}
              className="min-h-11 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-extrabold text-blue-800"
            >
              {bigMode ? 'Normal Size' : 'Big Mode'}
            </button>
            <button
              onClick={() => {
                setActiveTab(homeTab);
                setOpen(false);
              }}
              className="min-h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-extrabold text-slate-800"
            >
              Go Home
            </button>
            <a
              href="tel:+233000000000"
              className="flex min-h-11 items-center justify-center rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-sm font-extrabold text-amber-900"
            >
              Call Help
            </a>
          </div>
          <p className="mt-3 text-xs font-semibold leading-relaxed text-slate-500">
            Colors: green means done, blue means open or view, yellow means check, red means danger.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-2xl font-black text-white shadow-2xl shadow-blue-900/25 ring-1 ring-white/40"
        title="Help"
        aria-label="Help"
      >
        ?
      </button>
    </div>
  );
}

type PageAction = {
  label: string;
  tab: string;
  tone?: 'primary' | 'soft' | 'warn';
};

type PageGuide = {
  title: string;
  summary: string;
  start: string;
  steps: string[];
  actions: PageAction[];
};

const pageGuides: Record<string, PageGuide> = {
  dashboard: {
    title: 'Home',
    summary: 'See what is happening and choose where to go next.',
    start: 'Open Schools',
    steps: ['Check the cards', 'Open the area you need', 'Use Help if you are unsure'],
    actions: [
      { label: 'Open Schools', tab: 'schools', tone: 'primary' },
      { label: 'Add School', tab: 'register' },
      { label: 'Users', tab: 'roles' },
    ],
  },
  register: {
    title: 'Add School',
    summary: 'Create a school account step by step.',
    start: 'Start Form',
    steps: ['Enter school details', 'Check contact details', 'Save the school'],
    actions: [
      { label: 'Start Form', tab: 'register', tone: 'primary' },
      { label: 'All Schools', tab: 'schools' },
      { label: 'Users', tab: 'roles' },
    ],
  },
  schools: {
    title: 'All Schools',
    summary: 'Find, open, and check school accounts.',
    start: 'Find School',
    steps: ['Search school name', 'Open the school', 'Check status color'],
    actions: [
      { label: 'Find School', tab: 'schools', tone: 'primary' },
      { label: 'Add School', tab: 'register' },
      { label: 'Users', tab: 'roles' },
    ],
  },
  roles: {
    title: 'Users',
    summary: 'Add people and control what they can use.',
    start: 'Add User',
    steps: ['Choose the person', 'Choose their role', 'Save access'],
    actions: [
      { label: 'Add User', tab: 'roles', tone: 'primary' },
      { label: 'Settings', tab: 'settings' },
      { label: 'Home', tab: 'dashboard' },
    ],
  },
  settings: {
    title: 'Settings',
    summary: 'Change important portal settings carefully.',
    start: 'Check Settings',
    steps: ['Read the setting', 'Change only what you know', 'Save when ready'],
    actions: [
      { label: 'Check Settings', tab: 'settings', tone: 'primary' },
      { label: 'Users', tab: 'roles' },
      { label: 'Home', tab: 'dashboard' },
    ],
  },
  'school-dashboard': {
    title: 'School Home',
    summary: 'Choose the school work you want to do now.',
    start: 'Open Students',
    steps: ['Pick a big button', 'Search or add records', 'Use Help when stuck'],
    actions: [
      { label: 'Open Students', tab: 'school-students', tone: 'primary' },
      { label: 'Fees', tab: 'school-fees' },
      { label: 'Messages', tab: 'school-comm' },
    ],
  },
  'school-students': {
    title: 'Students',
    summary: 'Add, find, and update student records.',
    start: 'Add Student',
    steps: ['Search student name', 'Open profile', 'Edit or add student'],
    actions: [
      { label: 'Add Student', tab: 'school-students', tone: 'primary' },
      { label: 'Teachers', tab: 'school-teachers' },
      { label: 'Fees', tab: 'school-fees' },
    ],
  },
  'school-teachers': {
    title: 'Teachers',
    summary: 'Add, find, and update teacher records.',
    start: 'Add Teacher',
    steps: ['Search teacher name', 'Open profile', 'Edit or add teacher'],
    actions: [
      { label: 'Add Teacher', tab: 'school-teachers', tone: 'primary' },
      { label: 'Students', tab: 'school-students' },
      { label: 'Classes', tab: 'school-classes' },
    ],
  },
  'school-fees': {
    title: 'Fees',
    summary: 'Check bills, payments, and balances.',
    start: 'Record Payment',
    steps: ['Find student bill', 'Check amount due', 'Record or view payment'],
    actions: [
      { label: 'Record Payment', tab: 'school-fees', tone: 'primary' },
      { label: 'Students', tab: 'school-students' },
      { label: 'Messages', tab: 'school-comm' },
    ],
  },
  'school-comm': {
    title: 'Messages',
    summary: 'Send clear messages to parents, teachers, and students.',
    start: 'Send Message',
    steps: ['Choose who receives it', 'Write simple message', 'Send'],
    actions: [
      { label: 'Send Message', tab: 'school-comm', tone: 'primary' },
      { label: 'Students', tab: 'school-students' },
      { label: 'Calendar', tab: 'school-calendar' },
    ],
  },
  'school-calendar': {
    title: 'Calendar',
    summary: 'See school events, dates, and activities.',
    start: 'View Events',
    steps: ['Check today', 'Open event', 'Add or share if needed'],
    actions: [
      { label: 'View Events', tab: 'school-calendar', tone: 'primary' },
      { label: 'Messages', tab: 'school-comm' },
      { label: 'Home', tab: 'school-dashboard' },
    ],
  },
  'teacher-dashboard': {
    title: 'Teacher Home',
    summary: 'Start class work, attendance, lessons, or assignments.',
    start: 'Mark Attendance',
    steps: ['Choose class work', 'Update records', 'Save before leaving'],
    actions: [
      { label: 'Mark Attendance', tab: 'teacher-attendance', tone: 'primary' },
      { label: 'Assignments', tab: 'teacher-assignments' },
      { label: 'Lessons', tab: 'teacher-lessons' },
    ],
  },
  'teacher-attendance': {
    title: 'Attendance',
    summary: 'Mark who is present or absent.',
    start: 'Mark Attendance',
    steps: ['Choose class', 'Mark students', 'Save attendance'],
    actions: [
      { label: 'Mark Attendance', tab: 'teacher-attendance', tone: 'primary' },
      { label: 'Assignments', tab: 'teacher-assignments' },
      { label: 'Home', tab: 'teacher-dashboard' },
    ],
  },
  'teacher-assignments': {
    title: 'Assignments',
    summary: 'Give class work or homework.',
    start: 'Create Work',
    steps: ['Choose class', 'Write task', 'Set due date'],
    actions: [
      { label: 'Create Work', tab: 'teacher-assignments', tone: 'primary' },
      { label: 'Lessons', tab: 'teacher-lessons' },
      { label: 'Attendance', tab: 'teacher-attendance' },
    ],
  },
  'teacher-lessons': {
    title: 'Lessons',
    summary: 'Record what was taught in class.',
    start: 'Record Lesson',
    steps: ['Choose subject', 'Write lesson note', 'Save record'],
    actions: [
      { label: 'Record Lesson', tab: 'teacher-lessons', tone: 'primary' },
      { label: 'Assignments', tab: 'teacher-assignments' },
      { label: 'AI Help', tab: 'teacher-ai-suite' },
    ],
  },
  'parent-dashboard': {
    title: 'Parent Home',
    summary: 'Check your child records, fees, and school messages.',
    start: 'Check Child',
    steps: ['Look at summary cards', 'Check messages', 'Open calendar if needed'],
    actions: [
      { label: 'Check Child', tab: 'parent-dashboard', tone: 'primary' },
      { label: 'Calendar', tab: 'school-calendar' },
      { label: 'Hub', tab: 'edu-ecosystem' },
    ],
  },
  'student-dashboard': {
    title: 'Student Home',
    summary: 'See your lessons, assignments, and school updates.',
    start: 'Check Work',
    steps: ['Look at today', 'Open assignments', 'Check school calendar'],
    actions: [
      { label: 'Check Work', tab: 'student-dashboard', tone: 'primary' },
      { label: 'Calendar', tab: 'school-calendar' },
      { label: 'Hub', tab: 'edu-ecosystem' },
    ],
  },
};

function getPageGuide(activeTab: string, role: User['role']): PageGuide {
  return pageGuides[activeTab] || {
    title: pageHelpText[activeTab]?.split('.')[0] || 'This Page',
    summary: pageHelpText[activeTab] || 'Use the buttons below to choose what to do next.',
    start: 'Start Here',
    steps: ['Read the page title', 'Press the main button', 'Use Help if unsure'],
    actions: [
      { label: 'Go Home', tab: role === 'SuperAdmin' ? 'dashboard' : role === 'Teacher' ? 'teacher-dashboard' : role === 'Parent' ? 'parent-dashboard' : role === 'Student' ? 'student-dashboard' : 'school-dashboard', tone: 'primary' },
    ],
  };
}

function SimplePageStart({
  activeTab,
  role,
  setActiveTab,
  recentTabs,
  currentTenant,
}: {
  activeTab: string;
  role: User['role'];
  setActiveTab: (tab: string) => void;
  recentTabs: string[];
  currentTenant: School | null;
}) {
  const guide = getPageGuide(activeTab, role);
  const [showIntro, setShowIntro] = useState(false);
  const homeTab = getHomeTab(role);
  const backTab = recentTabs.find(tab => tab !== activeTab) || homeTab;

  useEffect(() => {
    const key = `educore_seen_page_${activeTab}`;
    if (!localStorage.getItem(key)) {
      setShowIntro(true);
      localStorage.setItem(key, 'true');
    } else {
      setShowIntro(false);
    }
  }, [activeTab]);

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white/94 p-3 shadow-lg shadow-slate-900/5 backdrop-blur sm:mb-4 sm:rounded-3xl sm:p-4">
      {showIntro && (
        <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-2.5 text-xs font-semibold leading-relaxed text-amber-950 sm:p-3 sm:text-sm">
          Welcome. This page helps you: {guide.summary} Press <strong>{guide.start}</strong> to begin, or use Help if you are not sure.
        </div>
      )}

      <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          data-scroll-to="page-live-content"
          onClick={() => setActiveTab(backTab)}
          className="flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          data-scroll-to="page-live-content"
          onClick={() => setActiveTab(homeTab)}
          className="flex min-h-10 shrink-0 items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 sm:text-sm"
        >
          <Home className="h-4 w-4" /> Home
        </button>
        <div className="hidden shrink-0 flex-wrap items-center gap-1.5 sm:flex">
          <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">Green: Done</span>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800">Blue: Open</span>
          <span className="rounded-full border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">Yellow: Check</span>
          <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-2 text-xs font-black text-rose-800">Red: Danger</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Start Here</p>
          <h1 className="mt-1 text-xl font-black tracking-tight text-slate-950 sm:text-2xl">{guide.title}</h1>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-relaxed text-slate-600">{guide.summary}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:overflow-visible lg:min-w-[420px]">
          {guide.actions.slice(0, 3).map((action, index) => {
            const Icon = getActionIcon(action.tab);
            return (
              <button
                key={`${action.tab}-${action.label}`}
                data-scroll-to={getSectionTarget(action.tab, action.label)}
                onClick={() => setActiveTab(action.tab)}
                className={`flex min-h-11 w-[72vw] shrink-0 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-xs font-black shadow-sm transition-transform active:scale-95 sm:w-auto sm:text-sm ${
                  index === 0 || action.tone === 'primary'
                    ? 'bg-[#1A56DB] text-white shadow-blue-900/15'
                    : action.tone === 'warn'
                      ? 'bg-amber-50 text-amber-900 border border-amber-200'
                      : 'bg-slate-50 text-slate-800 border border-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-3">
        {guide.steps.slice(0, 3).map((step, index) => (
          <div key={step} className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 sm:text-sm">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-[#1A56DB] shadow-sm">{index + 1}</span>
            <span>{step}</span>
          </div>
        ))}
      </div>

      <TodayFocus role={role} />
      <RoleTodayHub role={role} setActiveTab={setActiveTab} />
      <ContinueWorkflowPanel role={role} setActiveTab={setActiveTab} />
      {role === 'SchoolAdmin' && currentTenant && (
        <ManagerWorkflowSummary tenantId={currentTenant.id} />
      )}

      {role === 'SchoolAdmin' && activeTab === 'school-dashboard' && (
        <SchoolSetupChecklist setActiveTab={setActiveTab} />
      )}

      {recentTabs.filter(tab => tab !== activeTab).length > 0 && (
        <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-3 sm:mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Recent work</p>
          <div className="mt-2 flex gap-2 overflow-x-auto">
            {recentTabs.filter(tab => tab !== activeTab).slice(0, 4).map(tab => {
              const recentGuide = getPageGuide(tab, role);
              return (
                <button
                  key={tab}
                  data-scroll-to={getSectionTarget(tab, recentGuide.title)}
                  onClick={() => setActiveTab(tab)}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700"
                >
                  {recentGuide.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
function getActionIcon(tab: string) {
  if (tab.includes('fee')) return DollarSign;
  if (tab.includes('student') || tab.includes('teacher') || tab.includes('role')) return Users;
  if (tab.includes('comm') || tab.includes('message')) return MessageSquare;
  if (tab.includes('calendar')) return Calendar;
  if (tab.includes('attendance')) return ClipboardCheck;
  if (tab.includes('lesson') || tab.includes('assignment')) return BookOpen;
  if (tab.includes('register') || tab.includes('add')) return PlusCircle;
  return LayoutDashboard;
}

function getHomeTab(role: User['role']) {
  return role === 'SuperAdmin'
    ? 'dashboard'
    : role === 'Teacher'
      ? 'teacher-dashboard'
      : role === 'Parent'
        ? 'parent-dashboard'
        : role === 'Student'
          ? 'student-dashboard'
          : 'school-dashboard';
}

function TodayFocus({ role }: { role: User['role'] }) {
  const items = role === 'SchoolAdmin'
    ? [
        { label: 'Fees to check', value: '4', tone: 'amber' },
        { label: 'Messages waiting', value: '3', tone: 'blue' },
        { label: 'Students to review', value: '2', tone: 'emerald' },
      ]
    : role === 'Teacher'
      ? [
          { label: 'Attendance', value: 'Now', tone: 'blue' },
          { label: 'Class work', value: '2', tone: 'emerald' },
          { label: 'Lessons due', value: '1', tone: 'amber' },
        ]
      : role === 'SuperAdmin'
        ? [
            { label: 'Schools active', value: '2', tone: 'emerald' },
            { label: 'Needs payment', value: '1', tone: 'amber' },
            { label: 'Support', value: '5', tone: 'blue' },
          ]
        : [
            { label: 'Updates', value: 'Today', tone: 'blue' },
            { label: 'Calendar', value: 'Open', tone: 'emerald' },
            { label: 'Messages', value: 'Check', tone: 'amber' },
          ];

  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:grid-cols-3">
      {items.map(item => (
        <div key={item.label} className={`rounded-2xl border px-2 py-2 text-center sm:px-3 sm:py-3 ${
          item.tone === 'emerald' ? 'border-emerald-100 bg-emerald-50 text-emerald-900' :
          item.tone === 'amber' ? 'border-amber-100 bg-amber-50 text-amber-950' :
          'border-blue-100 bg-blue-50 text-blue-950'
        }`}>
          <p className="text-[9px] font-black uppercase tracking-wide opacity-75 sm:text-xs">Today</p>
          <p className="mt-0.5 text-base font-black sm:mt-1 sm:text-lg">{item.value}</p>
          <p className="text-[10px] font-bold leading-tight sm:text-sm">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

type WorkflowItem = {
  key: string;
  title: string;
  tab: string;
  section: string;
  next: string;
  reminder: string;
};

function getRoleWorkflows(role: User['role']): WorkflowItem[] {
  if (role === 'Teacher') {
    return [
      { key: 'teacher-attendance', title: 'Mark attendance', tab: 'teacher-attendance', section: 'attendance-section', next: 'Choose class and save roll call', reminder: 'You may need to record today attendance before lesson records.' },
      { key: 'teacher-lesson', title: 'Record lesson', tab: 'teacher-lessons', section: 'page-live-content', next: 'Record pages and topic taught today', reminder: 'Daily lesson records help managers see teaching progress.' },
      { key: 'teacher-material', title: 'Upload material', tab: 'teacher-materials', section: 'materials-section', next: 'Upload or open lesson material', reminder: 'Use materials before AI notes or exam questions.' },
      { key: 'teacher-assignment', title: 'Give assignment', tab: 'teacher-assignments', section: 'assignments-section', next: 'Create work parents can see', reminder: 'Assignments are not visible until saved.' },
    ];
  }
  if (role === 'SchoolAdmin') {
    return [
      { key: 'manager-timetable', title: 'Publish timetable', tab: 'school-teachers', section: 'timetable-section', next: 'Auto-fill, check, and publish timetable', reminder: 'Published timetables guide teachers, students, and parents.' },
      { key: 'manager-fees', title: 'Check fees', tab: 'school-fees', section: 'fees-section', next: 'Create invoice or record payment', reminder: 'Parents need correct current term or semester balances.' },
    ];
  }
  if (role === 'Parent') {
    return [
      { key: 'parent-messages', title: 'Read school notice', tab: 'parent-dashboard', section: 'messages-section', next: 'Read latest message', reminder: 'School notices may explain fees, assignments, or events.' },
      { key: 'parent-assignments', title: 'Check assignment', tab: 'parent-dashboard', section: 'assignments-section', next: 'Check due date and support child', reminder: 'Teacher-given assignments appear here.' },
      { key: 'parent-fees', title: 'Check fees', tab: 'parent-dashboard', section: 'fees-section', next: 'Open invoice and balance', reminder: 'Check current term or semester fees.' },
    ];
  }
  if (role === 'Student') {
    return [
      { key: 'student-dashboard', title: 'Check timetable', tab: 'student-dashboard', section: 'timetable-section', next: 'See today class schedule', reminder: 'Start with timetable before class work.' },
      { key: 'student-assignments', title: 'Do assignment', tab: 'student-dashboard', section: 'assignments-section', next: 'Read task and upload solution', reminder: 'Submit homework before the due date.' },
      { key: 'student-materials', title: 'Read materials', tab: 'student-dashboard', section: 'materials-section', next: 'Open learning files', reminder: 'Materials help with assignments and revision.' },
    ];
  }
  return [
    { key: 'super-schools', title: 'Check schools', tab: 'schools', section: 'page-live-content', next: 'Review school status', reminder: 'Keep school accounts healthy.' },
  ];
}

function readWorkflow(key: string) {
  return loadWorkflowProgress(key);
}

function ContinueWorkflowPanel({ role, setActiveTab }: { role: User['role']; setActiveTab: (tab: string) => void }) {
  const workflows = getRoleWorkflows(role);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const refresh = () => setVersion(v => v + 1);
    window.addEventListener('educore-workflow-progress', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('educore-workflow-progress', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const rows = workflows.map(item => ({ ...item, progress: readWorkflow(item.key) }));
  const unfinished = rows.filter(item => !item.progress.completed);
  const continueItem = unfinished[0] || rows[0];

  const markDone = (item: WorkflowItem) => {
    saveWorkflowProgress(item.key, { doneSteps: [0, 1, 2], completed: true }, 'continue workflow panel');
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-500">Continue where you stopped</p>
          <h3 className="mt-1 text-base font-black text-slate-950">{continueItem.title}</h3>
          <p className="mt-1 text-xs font-semibold leading-relaxed text-slate-600">{continueItem.next}</p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button
            type="button"
            data-scroll-to={continueItem.section}
            onClick={() => setActiveTab(continueItem.tab)}
            className="min-h-10 shrink-0 rounded-xl bg-blue-600 px-3 py-2 text-xs font-black text-white"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => markDone(continueItem)}
            className="min-h-10 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800"
          >
            Done
          </button>
        </div>
      </div>
      {unfinished.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold leading-relaxed text-amber-950">
          Smart reminder: {isWorkflowOverdue(continueItem.key, continueItem.progress) ? 'Overdue today. ' : ''}{continueItem.reminder}
        </div>
      )}
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {rows.map(item => (
          <button
            key={item.key}
            type="button"
            data-scroll-to={item.section}
            onClick={() => setActiveTab(item.tab)}
            className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-black ${
              item.progress.completed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-slate-50 text-slate-700'
            }`}
          >
            {item.progress.completed ? 'Done: ' : isWorkflowOverdue(item.key, item.progress) ? 'Overdue: ' : 'Next: '}{item.title}
          </button>
        ))}
      </div>
    </div>
  );
}

function ManagerWorkflowSummary({ tenantId }: { tenantId: string }) {
  const [version, setVersion] = useState(0);
  const [filter, setFilter] = useState<'All' | 'Completed' | 'Overdue' | 'In Progress' | 'Teacher only'>('All');
  const [scope, setScope] = useState<AcademicTimeScope>(() => getAcademicTimeScope(tenantId));

  useEffect(() => {
    const refresh = () => setVersion(v => v + 1);
    const refreshScope = () => setScope(getAcademicTimeScope(tenantId));
    window.addEventListener('educore-workflow-progress', refresh);
    window.addEventListener('educore-time-scope-change', refreshScope);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('educore-workflow-progress', refresh);
      window.removeEventListener('educore-time-scope-change', refreshScope);
      window.removeEventListener('storage', refresh);
    };
  }, [tenantId]);

  const records = listTenantWorkflowProgress(tenantId);
  const scopedRecords = records.filter(item => {
    if (scope.mode === 'term') {
      return (item.academicYear || '').toLowerCase() === scope.academicYear.toLowerCase()
        && (item.term || '').toLowerCase() === scope.term.toLowerCase();
    }
    if (scope.mode === 'year') {
      return (item.academicYear || '').toLowerCase() === scope.academicYear.toLowerCase();
    }
    return matchesAcademicTimeScope(item.updatedAt, scope);
  });
  const scopeLabel = scope.mode === 'day'
    ? scope.date
    : scope.mode === 'month'
      ? scope.month
      : scope.mode === 'term'
        ? `${scope.term}, ${scope.academicYear}`
        : scope.mode === 'year'
          ? scope.academicYear
          : 'All history';
  const workflowKeys = ['teacher-attendance', 'teacher-lesson', 'teacher-material', 'teacher-assignment'];
  const teacherUsers: User[] = (() => {
    try {
      const raw = JSON.parse(localStorage.getItem('educore_users') || '[]');
      const found = Array.isArray(raw) ? raw.filter((user: User) => user.tenantId === tenantId && user.role === 'Teacher') : [];
      if (found.length > 0) return found;
    } catch {
      // Fall back to default storage accessor below.
    }
    return getUsersInStorage().filter((user: User) => user.tenantId === tenantId && user.role === 'Teacher');
  })();
  const teacherRows = teacherUsers.map(teacher => {
    const teacherRecords = scopedRecords.filter(item => item.userId === teacher.id || item.userId === (teacher as any).userId || item.userId === teacher.email);
    const completedKeys = workflowKeys.filter(key => teacherRecords.some(item => item.key === key && item.completed));
    const overdueKeys = workflowKeys.filter(key => {
      const found = teacherRecords.find(item => item.key === key);
      return !found || isWorkflowOverdue(key, found);
    });
    return {
      teacher,
      completedKeys,
      overdueKeys,
      score: Math.round((completedKeys.length / workflowKeys.length) * 100),
    };
  });
  const completed = scopedRecords.filter(item => item.completed).length;
  const overdue = scopedRecords.filter(item => isWorkflowOverdue(item.key, item)).length;
  const activeTeachers = teacherRows.length || scopedRecords.filter(item => item.role === 'Teacher').length;
  const filteredRecords = scopedRecords.filter(item => {
    if (filter === 'Completed') return item.completed;
    if (filter === 'Overdue') return isWorkflowOverdue(item.key, item);
    if (filter === 'In Progress') return !item.completed && !isWorkflowOverdue(item.key, item);
    if (filter === 'Teacher only') return item.role === 'Teacher';
    return true;
  });
  const recent = [...filteredRecords].sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt))).slice(0, 4);
  const workNotDone = teacherRows.flatMap(row => row.overdueKeys.map(key => ({ teacher: row.teacher, key }))).slice(0, 6);
  const averageScore = teacherRows.length ? Math.round(teacherRows.reduce((sum, row) => sum + row.score, 0) / teacherRows.length) : 0;
  const strongTeachers = teacherRows.filter(row => row.score >= 75).length;
  const needsSupportTeachers = teacherRows.filter(row => row.score < 50).length;
  const teacherTaskTotal = teacherRows.length * workflowKeys.length;
  const teacherTasksDone = teacherRows.reduce((sum, row) => sum + row.completedKeys.length, 0);
  const completionRate = teacherTaskTotal ? Math.round((teacherTasksDone / teacherTaskTotal) * 100) : 0;
  const analyticsCards = [
    { label: 'Completion rate', value: `${completionRate}%`, detail: `${teacherTasksDone}/${teacherTaskTotal || 0} teacher tasks`, tone: 'cyan' },
    { label: 'Strong teachers', value: strongTeachers, detail: '75% and above', tone: 'emerald' },
    { label: 'Need support', value: needsSupportTeachers, detail: 'Below 50%', tone: 'amber' },
    { label: 'Work not done', value: overdue + workNotDone.length, detail: 'Follow up today', tone: 'rose' },
  ];

  const sendReminder = (teacher: User, key: string) => {
    appendActivityLog({
      tenantId,
      user: 'School Manager',
      action: 'Workflow Reminder Sent',
      details: `Reminder sent to ${teacher.name || teacher.email}: ${getWorkflowLabel(key)} is not done today.`,
      type: 'warning',
    });
    window.dispatchEvent(new CustomEvent('educore-workflow-progress', { detail: { key, reminder: true } }));
  };

  const exportReport = () => {
    const header = ['Period', 'Teacher', 'Email', 'Score', 'Completed', 'Not Done Today'];
    const lines = teacherRows.map(row => [
      scopeLabel,
      row.teacher.name || row.teacher.email,
      row.teacher.email,
      `${row.score}%`,
      row.completedKeys.map(getWorkflowLabel).join('; ') || 'None',
      row.overdueKeys.map(getWorkflowLabel).join('; ') || 'None',
    ]);
    const csv = [header, ...lines].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `EduCore_Workflow_Report_${tenantId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-sm sm:mt-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Manager workflow summary</p>
          <h3 className="mt-1 text-base font-black">Staff and portal task control</h3>
          <p className="mt-1 text-xs font-semibold text-slate-300">Period: {scopeLabel} - Completed: {completed} - Overdue: {overdue + workNotDone.length} - Active teachers: {activeTeachers} - Average score: {averageScore}%</p>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          <button type="button" onClick={exportReport} className="min-h-10 shrink-0 rounded-xl bg-cyan-300 px-3 py-2 text-xs font-black text-slate-950">Export CSV</button>
          <button type="button" onClick={() => window.print()} className="min-h-10 shrink-0 rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white">Print</button>
          <span className={`flex min-h-10 w-fit shrink-0 items-center rounded-xl px-3 py-1.5 text-xs font-black ${overdue + workNotDone.length > 0 ? 'bg-amber-300 text-slate-950' : 'bg-emerald-400 text-slate-950'}`}>
            {overdue + workNotDone.length > 0 ? `${overdue + workNotDone.length} not done` : 'All clear'}
          </span>
        </div>
      </div>
      <div className="mt-3 flex gap-2 overflow-x-auto">
        {(['All', 'Completed', 'Overdue', 'In Progress', 'Teacher only'] as const).map(item => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`min-h-9 shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-black ${filter === item ? 'border-cyan-300 bg-cyan-300 text-slate-950' : 'border-white/10 bg-white/10 text-slate-200'}`}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {analyticsCards.map(card => (
          <div key={card.label} className="rounded-xl border border-white/10 bg-white/10 p-3">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-300">{card.label}</p>
            <p className={`mt-1 text-2xl font-black ${
              card.tone === 'emerald' ? 'text-emerald-300' : card.tone === 'amber' ? 'text-amber-300' : card.tone === 'rose' ? 'text-rose-300' : 'text-cyan-200'
            }`}>{card.value}</p>
            <p className="text-xs font-semibold text-slate-300">{card.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-xl border border-white/10 bg-white/10 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Teacher performance analytics</p>
          <span className="text-[10px] font-black text-slate-300">{scopeLabel}</span>
        </div>
        <div className="mt-3 space-y-2">
          {teacherRows.slice(0, 8).map(row => (
            <div key={`bar-${row.teacher.id}`} className="grid grid-cols-[minmax(90px,180px)_1fr_44px] items-center gap-2 text-xs">
              <span className="truncate font-bold text-white">{row.teacher.name || row.teacher.email}</span>
              <span className="h-3 overflow-hidden rounded-full bg-slate-800">
                <span className={`block h-full ${row.score >= 75 ? 'bg-emerald-300' : row.score >= 40 ? 'bg-amber-300' : 'bg-rose-300'}`} style={{ width: `${row.score}%` }} />
              </span>
              <span className="text-right font-black text-slate-200">{row.score}%</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {teacherRows.slice(0, 6).map(row => (
          <div key={row.teacher.id} className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs">
            <div className="flex items-center justify-between gap-2">
              <p className="font-black text-white">{row.teacher.name || row.teacher.email}</p>
              <span className={`rounded-full px-2 py-1 font-black ${row.score >= 75 ? 'bg-emerald-300 text-slate-950' : row.score >= 40 ? 'bg-amber-300 text-slate-950' : 'bg-rose-300 text-slate-950'}`}>{row.score}%</span>
            </div>
            <p className="mt-1 font-semibold text-slate-300">{row.completedKeys.length}/{workflowKeys.length} teacher tasks done</p>
          </div>
        ))}
      </div>
      {workNotDone.length > 0 && (
        <div className="mt-3 rounded-xl border border-amber-300/40 bg-amber-300/10 p-3">
          <p className="text-xs font-black uppercase tracking-wide text-amber-200">Work not done today</p>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {workNotDone.map(item => (
              <div key={`${item.teacher.id}-${item.key}`} className="flex items-center justify-between gap-2 rounded-lg bg-slate-950/40 p-2 text-xs">
                <span className="font-bold text-white">{item.teacher.name || item.teacher.email}: {getWorkflowLabel(item.key)}</span>
                <button type="button" onClick={() => sendReminder(item.teacher, item.key)} className="shrink-0 rounded-lg bg-amber-300 px-2 py-1 font-black text-slate-950">Send reminder</button>
              </div>
            ))}
          </div>
        </div>
      )}
      {recent.length > 0 ? (
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {recent.map(item => (
            <div key={`${item.userId}-${item.key}`} className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs">
              <p className="font-black text-white">{getWorkflowLabel(item.key)}</p>
              <p className="mt-1 font-semibold text-slate-300">{item.role} - {item.userId}</p>
              <p className={`mt-1 font-black ${item.completed ? 'text-emerald-300' : isWorkflowOverdue(item.key, item) ? 'text-amber-300' : 'text-cyan-200'}`}>
                {item.completed ? 'Done' : isWorkflowOverdue(item.key, item) ? 'Overdue' : 'In progress'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-slate-300">
          No workflow completion records yet. When teachers mark attendance, materials, assignments, or lessons done, the manager will see it here.
        </p>
      )}
    </div>
  );
}

function SchoolSetupChecklist({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const steps = [
    { label: 'School Info', detail: 'Name, logo, contacts', tab: 'school-settings', tone: 'blue' },
    { label: 'Term / Semester', detail: 'Choose how the school runs', tab: 'school-academic-year', tone: 'emerald' },
    { label: 'Classes', detail: 'Rooms and class levels', tab: 'school-classes', tone: 'blue' },
    { label: 'Teachers', detail: 'Add staff and subjects', tab: 'school-teachers', tone: 'amber' },
    { label: 'Fees', detail: 'This term or semester bills', tab: 'school-fees', tone: 'emerald' },
  ];

  return (
    <div className="mt-3 rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm sm:mt-4 sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">First setup</p>
          <h3 className="text-base font-black text-slate-950 sm:text-lg">Make the school ready in 5 steps</h3>
        </div>
        <span className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black text-emerald-800">Start from left to right</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((step, index) => (
          <button
            key={step.label}
            data-scroll-to={getSectionTarget(step.tab, step.label)}
            onClick={() => setActiveTab(step.tab)}
            className="group flex min-h-20 items-center gap-3 rounded-2xl border border-white bg-white/92 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95"
          >
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${
              step.tone === 'emerald' ? 'bg-emerald-100 text-emerald-800' : step.tone === 'amber' ? 'bg-amber-100 text-amber-900' : 'bg-blue-100 text-blue-800'
            }`}>
              {index + 1}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black text-slate-950">{step.label}</span>
              <span className="block text-xs font-semibold leading-snug text-slate-500">{step.detail}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
function FirstTimeSetupWizard({ role, setActiveTab }: { role: User['role']; setActiveTab: (tab: string) => void }) {
  const key = `educore_setup_steps_${role}`;
  const [done, setDone] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(`${key}_collapsed`) === 'true');

  const steps = role === 'SchoolAdmin'
    ? [
        { id: 'school', title: 'School info', tab: 'school-settings', text: 'Confirm name, logo, phone, and address.' },
        { id: 'period', title: 'Term / Semester', tab: 'school-academic-year', text: 'Choose term or semester and current academic year.' },
        { id: 'classes', title: 'Classes', tab: 'school-classes', text: 'Create classes before adding records.' },
        { id: 'teachers', title: 'Teachers', tab: 'school-teachers', text: 'Add teachers and subjects they teach.' },
        { id: 'fees', title: 'Fees', tab: 'school-fees', text: 'Set bills parents should see for this period.' },
      ]
    : role === 'Teacher'
      ? [
          { id: 'attendance', title: 'Attendance', tab: 'teacher-attendance', text: 'Mark today attendance first.' },
          { id: 'materials', title: 'Materials', tab: 'teacher-materials', text: 'Upload or open lesson materials.' },
          { id: 'lessons', title: 'Lessons', tab: 'teacher-lessons', text: 'Record pages and topics reached.' },
          { id: 'assignments', title: 'Assignments', tab: 'teacher-assignments', text: 'Give work students and parents can see.' },
          { id: 'ai', title: 'AI tools', tab: 'teacher-ai-suite', text: 'Make notes or exams from selected materials.' },
        ]
      : role === 'SuperAdmin'
        ? [
            { id: 'schools', title: 'Schools', tab: 'schools', text: 'Check all active and suspended schools.' },
            { id: 'add', title: 'Add school', tab: 'register', text: 'Create a school account when needed.' },
            { id: 'users', title: 'Users', tab: 'roles', text: 'Check who can access each area.' },
            { id: 'support', title: 'Support', tab: 'sa-support-tickets', text: 'Review help requests.' },
          ]
        : [
            { id: 'home', title: 'Home', tab: getHomeTab(role), text: 'Start from your dashboard.' },
            { id: 'calendar', title: 'Calendar', tab: 'school-calendar', text: 'Check dates and events.' },
            { id: 'hub', title: 'Updates', tab: 'edu-ecosystem', text: 'Read school updates and useful links.' },
          ];

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(done));
  }, [done, key]);

  const toggleDone = (id: string) => {
    setDone(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
  };
  const progress = Math.round((done.length / steps.length) * 100);

  return (
    <section className="role-onboarding-card mb-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-lg shadow-slate-900/5 sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Smart role onboarding</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">Your first steps for this account</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">{progress}% complete. Tap a step to open it, or tick it when finished.</p>
        </div>
        <button
          onClick={() => {
            const next = !collapsed;
            setCollapsed(next);
            localStorage.setItem(`${key}_collapsed`, String(next));
          }}
          className="min-h-10 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-black text-slate-700"
        >
          {collapsed ? 'Show guide' : 'Hide guide'}
        </button>
      </div>
      {!collapsed && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((step, index) => {
            const isDone = done.includes(step.id);
            return (
              <div key={step.id} className={`rounded-2xl border p-3 ${isDone ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <button data-scroll-to={getSectionTarget(step.tab, step.title)} onClick={() => setActiveTab(step.tab)} className="flex-1 text-left">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-blue-700 shadow-sm">{index + 1}</span>
                    <span className="mt-2 block text-sm font-black text-slate-950">{step.title}</span>
                    <span className="mt-1 block text-xs font-semibold leading-snug text-slate-600">{step.text}</span>
                  </button>
                  <button
                    onClick={() => toggleDone(step.id)}
                    className={`h-8 w-8 shrink-0 rounded-full border text-xs font-black ${isDone ? 'border-emerald-300 bg-emerald-600 text-white' : 'border-slate-200 bg-white text-slate-400'}`}
                    title={isDone ? 'Untick onboarding step' : 'Tick onboarding step'}
                  >
                    {isDone ? '✓' : ''}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RoleTodayHub({ role, setActiveTab }: { role: User['role']; setActiveTab: (tab: string) => void }) {
  const items = role === 'SchoolAdmin'
    ? [
        { title: 'Check fees', value: '4', tab: 'school-fees', icon: DollarSign, color: 'amber' },
        { title: 'Teacher activity', value: 'Review', tab: 'school-review', icon: ClipboardCheck, color: 'blue' },
        { title: 'Messages', value: '3', tab: 'school-comm', icon: MessageSquare, color: 'emerald' },
      ]
    : role === 'Teacher'
      ? [
          { title: 'Mark attendance', value: 'Now', tab: 'teacher-attendance', icon: ClipboardCheck, color: 'blue' },
          { title: 'Upload material', value: 'Open', tab: 'teacher-materials', icon: BookOpen, color: 'emerald' },
          { title: 'AI notes/exam', value: 'Ready', tab: 'teacher-ai-suite', icon: Cpu, color: 'amber' },
        ]
      : role === 'Parent'
        ? [
            { title: 'Fees', value: 'Check', tab: 'parent-dashboard', icon: DollarSign, color: 'amber' },
            { title: 'Assignments', value: '2', tab: 'parent-dashboard', icon: BookOpen, color: 'blue' },
            { title: 'School dates', value: 'Open', tab: 'school-calendar', icon: Calendar, color: 'emerald' },
          ]
        : role === 'Student'
          ? [
              { title: 'Class work', value: '2', tab: 'student-dashboard', icon: BookOpen, color: 'blue' },
              { title: 'Calendar', value: 'Open', tab: 'school-calendar', icon: Calendar, color: 'emerald' },
              { title: 'Updates', value: 'New', tab: 'edu-ecosystem', icon: MessageSquare, color: 'amber' },
            ]
          : [
              { title: 'Schools', value: 'Open', tab: 'schools', icon: Building2, color: 'blue' },
              { title: 'Users', value: 'Check', tab: 'roles', icon: Users, color: 'emerald' },
              { title: 'Support', value: '5', tab: 'sa-support-tickets', icon: HelpCircle, color: 'amber' },
            ];

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5 sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Today</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">Start with these</h2>
        </div>
        <button onClick={() => speakText('Start with the Today cards. They show the most important work for your role.')} className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">
          Read aloud
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button key={item.title} data-scroll-to={getSectionTarget(item.tab, item.title)} onClick={() => setActiveTab(item.tab)} className={`min-h-24 rounded-2xl border p-4 text-left shadow-sm transition active:scale-95 ${
              item.color === 'emerald' ? 'border-emerald-100 bg-emerald-50 text-emerald-950' : item.color === 'amber' ? 'border-amber-100 bg-amber-50 text-amber-950' : 'border-blue-100 bg-blue-50 text-blue-950'
            }`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80 shadow-sm"><Icon className="h-5 w-5" /></span>
              <span className="mt-3 block text-2xl font-black">{item.value}</span>
              <span className="block text-sm font-black">{item.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DemoVideoGuide({ role }: { role: User['role'] }) {
  const [open, setOpen] = useState(false);
  const demos = role === 'Teacher'
    ? ['Mark attendance', 'Upload material', 'Generate AI notes', 'Set exam questions']
    : role === 'SchoolAdmin'
      ? ['Add teacher', 'Set term or semester', 'Check teacher work', 'Send parent message']
      : role === 'Parent'
        ? ['Check fees', 'View assignments', 'Read messages']
        : role === 'Student'
          ? ['Check class work', 'Open calendar', 'Read updates']
          : ['Add school', 'Manage users', 'Review support'];

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-xl shadow-slate-900/15 sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Short demos</p>
          <h2 className="mt-1 text-lg font-black sm:text-xl">Watch one-minute guides</h2>
        </div>
        <button onClick={() => setOpen(!open)} className="rounded-full bg-white/10 px-3 py-2 text-xs font-black text-cyan-100 border border-white/10">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {demos.map(title => (
            <button key={title} onClick={() => speakText(`${title}. This demo will guide you step by step.`)} className="flex min-h-20 items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 text-left transition hover:bg-white/15">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950"><HelpCircle className="h-5 w-5" /></span>
              <span><span className="block text-sm font-black">{title}</span><span className="block text-xs font-semibold text-slate-300">Tap to hear guide</span></span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function OfflineDraftPanel({ role }: { role: User['role'] }) {
  const [online, setOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine);
  const [draftCount, setDraftCount] = useState(() => Number(localStorage.getItem('educore_offline_draft_count') || '0'));

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
    };
  }, []);

  const saveDraft = () => {
    const next = draftCount + 1;
    setDraftCount(next);
    localStorage.setItem('educore_offline_draft_count', String(next));
  };

  const clearDrafts = () => {
    setDraftCount(0);
    localStorage.setItem('educore_offline_draft_count', '0');
  };

  if (role === 'Parent' || role === 'Student') return null;

  return (
    <section className={`mb-3 rounded-2xl border p-3 shadow-sm sm:mb-4 sm:rounded-3xl sm:p-4 ${online ? 'border-emerald-100 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-600">Poor network support</p>
          <h2 className="mt-1 text-base font-black text-slate-950">{online ? 'Online now' : 'Offline mode'}</h2>
          <p className="mt-1 text-sm font-semibold text-slate-600">Drafts saved here can be submitted when internet returns. Drafts waiting: {draftCount}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={saveDraft} className="rounded-xl bg-white px-3 py-2 text-xs font-black text-slate-800 shadow-sm">Save draft</button>
          <button onClick={clearDrafts} className="rounded-xl border border-white/70 px-3 py-2 text-xs font-black text-slate-600">Clear</button>
        </div>
      </div>
    </section>
  );
}

function getStoredList<T = any>(key: string): T[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function NotificationCenterPanel({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  const [open, setOpen] = useState(false);
  const workflows = tenantId ? listTenantWorkflowProgress(tenantId) : [];
  const invoices = tenantId ? getStoredList<any>(`educore_invoices_${tenantId}`) : [];
  const assignments = tenantId ? getStoredList<any>(`educore_assignments_${tenantId}`) : [];
  const materials = tenantId ? getStoredList<any>(`educore_materials_${tenantId}`) : [];
  const queries = getStoredList<any>('educore_queries_ledger').filter(item => !tenantId || item.tenantId === tenantId);
  const pendingFees = invoices.filter(item => Number(item.balance || 0) > 0).length;
  const overdueWork = workflows.filter(item => isWorkflowOverdue(item.key, item)).length;
  const teacherQueries = queries.filter(item => !item.resolved).length;
  const items = role === 'SchoolAdmin'
    ? [
        { title: 'Teacher work needs review', detail: `${overdueWork} overdue workflow item(s)`, tab: 'school-review', tone: overdueWork ? 'amber' : 'emerald' },
        { title: 'Fees need attention', detail: `${pendingFees} unpaid or partial invoice(s)`, tab: 'school-fees', tone: pendingFees ? 'rose' : 'emerald' },
        { title: 'Parent messages', detail: 'Check communication requests and school notices', tab: 'school-comm', tone: 'blue' },
      ]
    : role === 'Teacher'
      ? [
          { title: 'Head review queries', detail: `${teacherQueries} unresolved question(s) from management`, tab: 'teacher-dashboard', tone: teacherQueries ? 'rose' : 'emerald' },
          { title: 'Attendance reminder', detail: 'Mark class attendance after each taught period', tab: 'teacher-attendance', tone: 'amber' },
          { title: 'Materials library', detail: `${materials.length} file(s) available for notes and exam questions`, tab: 'teacher-materials', tone: 'blue' },
        ]
      : role === 'Parent'
        ? [
            { title: 'Child fees', detail: `${pendingFees} fee item(s) to check`, tab: 'parent-dashboard', tone: pendingFees ? 'amber' : 'emerald' },
            { title: 'Homework', detail: `${assignments.length || 2} assignment record(s) to review`, tab: 'parent-dashboard', tone: 'blue' },
            { title: 'School notice', detail: 'Read latest school update for your child', tab: 'parent-dashboard', tone: 'blue' },
          ]
        : role === 'Student'
          ? [
              { title: 'Homework', detail: `${assignments.length || 2} task(s) to check`, tab: 'student-dashboard', tone: 'amber' },
              { title: 'Learning materials', detail: `${materials.length || 4} material(s) available`, tab: 'student-dashboard', tone: 'blue' },
              { title: 'Today class', detail: 'Open your next class and revision work', tab: 'student-dashboard', tone: 'emerald' },
            ]
          : [
              { title: 'Schools', detail: 'Review active and suspended schools', tab: 'schools', tone: 'blue' },
              { title: 'Support', detail: 'Check open support tickets', tab: 'sa-support-tickets', tone: 'amber' },
            ];
  const urgentCount = items.filter(item => item.tone === 'rose' || item.tone === 'amber').length;

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Notification center</p>
          <h2 className="text-base font-black text-slate-950">Important alerts for this role</h2>
          <p className="text-xs font-semibold text-slate-600">{urgentCount} alert(s) need attention now.</p>
        </div>
        <button onClick={() => setOpen(!open)} className="min-h-10 rounded-xl border border-blue-200 bg-blue-50 px-3 text-xs font-black text-blue-800">
          {open ? 'Hide alerts' : 'Show alerts'}
        </button>
      </div>
      {open && (
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {items.map(item => (
            <button key={item.title} type="button" onClick={() => setActiveTab(item.tab)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-blue-300">
              <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                item.tone === 'rose' ? 'bg-rose-100 text-rose-800' : item.tone === 'amber' ? 'bg-amber-100 text-amber-900' : item.tone === 'emerald' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>{item.tone === 'emerald' ? 'OK' : 'Check'}</span>
              <p className="mt-2 text-sm font-black text-slate-950">{item.title}</p>
              <p className="text-xs font-semibold text-slate-600">{item.detail}</p>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

function UniversalTodayPanel({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const workflows = tenantId ? listTenantWorkflowProgress(tenantId) : [];
  const invoices = tenantId ? getStoredList<any>(`educore_invoices_${tenantId}`) : [];
  const materials = tenantId ? getStoredList<any>(`educore_materials_${tenantId}`) : [];
  const todayWork = workflows.filter(item => (item.updatedAt || '').slice(0, 10) === today);
  const cards = role === 'SchoolAdmin'
    ? [
        { title: 'School alerts', value: workflows.filter(item => isWorkflowOverdue(item.key, item)).length, detail: 'Overdue workflow items', tab: 'school-review' },
        { title: 'Fees', value: invoices.filter(item => Number(item.balance || 0) > 0).length, detail: 'Balances to follow', tab: 'school-fees' },
        { title: 'Reports', value: todayWork.length, detail: 'Workflow updates today', tab: 'school-review' },
      ]
    : role === 'Teacher'
      ? [
          { title: 'Attendance', value: 'Mark', detail: 'Start with today class roll', tab: 'teacher-attendance' },
          { title: 'Materials', value: materials.length, detail: 'Files ready for teaching', tab: 'teacher-materials' },
          { title: 'Lessons', value: 'Record', detail: 'Save pages and topics reached', tab: 'teacher-lessons' },
        ]
      : role === 'Parent'
        ? [
            { title: 'Child update', value: 'Open', detail: 'Attendance, fees, homework', tab: 'parent-dashboard' },
            { title: 'Fees', value: invoices.filter(item => Number(item.balance || 0) > 0).length, detail: 'Current balance items', tab: 'parent-dashboard' },
            { title: 'Calendar', value: 'Dates', detail: 'School events', tab: 'school-calendar' },
          ]
        : role === 'Student'
          ? [
              { title: 'Next action', value: 'Start', detail: 'Class, homework, materials', tab: 'student-dashboard' },
              { title: 'Revision', value: 'AI', detail: 'Approved summaries', tab: 'student-dashboard' },
              { title: 'Calendar', value: 'Open', detail: 'School dates', tab: 'school-calendar' },
            ]
          : [
              { title: 'Schools', value: 'Open', detail: 'All tenants', tab: 'schools' },
              { title: 'Users', value: 'Check', detail: 'Access control', tab: 'roles' },
              { title: 'Support', value: 'Open', detail: 'Requests', tab: 'sa-support-tickets' },
            ];
  return (
    <section id="today-panel" className="mb-3 scroll-mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Universal Today page</p>
          <h2 className="text-base font-black text-slate-950">Only what matters today</h2>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-emerald-800">{today}</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {cards.map(card => (
          <button key={card.title} type="button" onClick={() => setActiveTab(card.tab)} className="rounded-xl border border-white bg-white p-3 text-left shadow-sm hover:border-emerald-300">
            <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">{card.title}</p>
            <p className="mt-1 text-xl font-black text-slate-950">{card.value}</p>
            <p className="text-xs font-semibold text-slate-600">{card.detail}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function FormCoachPanel({ role, setActiveTab }: { role: User['role']; setActiveTab: (tab: string) => void }) {
  if (role === 'Parent' || role === 'Student') return null;
  const steps = role === 'Teacher'
    ? [
        { title: 'Choose class', tab: 'teacher-attendance' },
        { title: 'Fill few fields', tab: 'teacher-lessons' },
        { title: 'Save and continue', tab: 'teacher-assignments' },
      ]
    : [
        { title: 'Open setup', tab: 'school-settings' },
        { title: 'Add people/classes', tab: 'school-teachers' },
        { title: 'Review reports', tab: 'school-review' },
      ];
  return (
    <section className="mb-3 rounded-2xl border border-amber-100 bg-amber-50 p-3 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-amber-800">Easy forms mode</p>
      <div className="mt-2 grid gap-2 md:grid-cols-3">
        {steps.map((step, index) => (
          <button key={step.title} type="button" onClick={() => setActiveTab(step.tab)} className="rounded-xl border border-white bg-white p-3 text-left shadow-sm">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-xs font-black text-amber-900">{index + 1}</span>
            <p className="mt-2 text-sm font-black text-slate-950">{step.title}</p>
            <p className="text-xs font-semibold text-slate-600">Use one small step at a time, then save before moving on.</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function FormValidationGuidePanel({ role, setActiveTab }: { role: User['role']; setActiveTab: (tab: string) => void }) {
  if (role === 'Parent' || role === 'Student') return null;
  const forms = role === 'Teacher'
    ? [
        { title: 'Attendance', tab: 'teacher-attendance', tip: 'Choose class and date before saving.' },
        { title: 'Lesson record', tab: 'teacher-lessons', tip: 'Topic, objectives, method, class, and subject are required.' },
        { title: 'Material upload', tab: 'teacher-materials', tip: 'Title, description, class, and subject are required. Drafts are saved.' },
        { title: 'Assignment', tab: 'teacher-assignments', tip: 'Class, subject, title, instructions, due date, and marks are required.' },
      ]
    : [
        { title: 'Students', tab: 'school-students', tip: 'Names, class, parent contact, and status should be filled.' },
        { title: 'Teachers', tab: 'school-teachers', tip: 'Add subject, class, and timetable load so work can be tracked.' },
        { title: 'Fees', tab: 'school-fees', tip: 'Select currency, period, amount, due date, and student/class scope.' },
        { title: 'Settings', tab: 'school-settings', tip: 'Save academic year, term/semester, currency, and school branding.' },
      ];
  return (
    <section className="mb-3 rounded-2xl border border-rose-100 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-rose-700">Form validation help</p>
          <h2 className="text-base font-black text-slate-950">Red message means something important is missing</h2>
          <p className="text-xs font-semibold text-slate-600">Each form now explains what to fix. Fill the red fields, then save again.</p>
        </div>
        <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-800">No lost work</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {forms.map(form => (
          <button key={form.title} type="button" onClick={() => setActiveTab(form.tab)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-rose-300 hover:bg-rose-50">
            <p className="text-sm font-black text-slate-950">{form.title}</p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{form.tip}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function RoleReportsPanel({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  const workflows = tenantId ? listTenantWorkflowProgress(tenantId) : [];
  const invoices = tenantId ? getStoredList<any>(`educore_invoices_${tenantId}`) : [];
  const materials = tenantId ? getStoredList<any>(`educore_materials_${tenantId}`) : [];
  const reports = role === 'SchoolAdmin'
    ? [
        { title: 'Teacher performance report', value: `${workflows.filter(item => item.completed).length} done`, tab: 'school-review' },
        { title: 'Fees report', value: `${invoices.length} invoices`, tab: 'school-fees' },
        { title: 'Materials report', value: `${materials.length} files`, tab: 'school-log' },
      ]
    : role === 'Teacher'
      ? [
          { title: 'My teaching report', value: `${workflows.filter(item => item.role === 'Teacher').length} tasks`, tab: 'teacher-dashboard' },
          { title: 'My materials report', value: `${materials.length} files`, tab: 'teacher-materials' },
          { title: 'My lesson report', value: 'Open', tab: 'teacher-lessons' },
        ]
      : role === 'Parent'
        ? [
            { title: 'Child progress report', value: 'Open', tab: 'parent-dashboard' },
            { title: 'Fee statement', value: `${invoices.length} bills`, tab: 'parent-dashboard' },
            { title: 'Attendance report', value: 'Open', tab: 'parent-dashboard' },
          ]
        : role === 'Student'
          ? [
              { title: 'Learning progress', value: 'Open', tab: 'student-dashboard' },
              { title: 'Assignments report', value: 'Open', tab: 'student-dashboard' },
              { title: 'Materials read', value: `${materials.length} files`, tab: 'student-dashboard' },
            ]
          : [
              { title: 'Tenant report', value: 'Open', tab: 'schools' },
              { title: 'Subscription report', value: 'Open', tab: 'sa-subscriptions' },
              { title: 'System report', value: 'Open', tab: 'sa-system-ops' },
            ];
  return (
    <section id="reports-panel" className="mb-3 scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600">Role-based reports</p>
          <h2 className="text-base font-black text-slate-950">Reports for your access level</h2>
        </div>
        <button onClick={() => window.print()} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">Print</button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {reports.map(report => (
          <button key={report.title} type="button" onClick={() => setActiveTab(report.tab)} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-left hover:border-blue-300">
            <p className="text-sm font-black text-slate-950">{report.title}</p>
            <p className="mt-1 text-xs font-bold text-blue-700">{report.value}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function ManagerApprovalPanel({ role, tenantId }: { role: User['role']; tenantId?: string }) {
  if (role !== 'SchoolAdmin' || !tenantId) return null;
  const storageKey = `educore_approval_queue_${tenantId}`;
  const defaultApprovals = [
    { id: 'appr_fee_change', title: 'Fee change request', detail: 'Approve before changing current term or semester bills.', status: 'Pending' },
    { id: 'appr_delete_record', title: 'Delete record request', detail: 'Deleting students, fees, or teacher records needs manager approval.', status: 'Pending' },
    { id: 'appr_exam_publish', title: 'AI exam questions', detail: 'Generated exam questions must be approved before publishing.', status: 'Pending' },
    { id: 'appr_shared_material', title: 'Share material to all teachers', detail: 'School-wide materials need review before all teachers see them.', status: 'Pending' },
    { id: 'appr_academic_year', title: 'Academic year change', detail: 'Changing active year or term/semester must be approved and logged.', status: 'Pending' },
  ];
  const [queue, setQueue] = useState<any[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(saved) && saved.length ? saved : defaultApprovals;
    } catch {
      return defaultApprovals;
    }
  });
  const updateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    const next = queue.map(item => item.id === id ? { ...item, status, decidedAt: new Date().toISOString() } : item);
    setQueue(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
    const item = queue.find(row => row.id === id);
    appendActivityLog({
      tenantId,
      user: 'School Manager',
      action: `Approval ${status}`,
      details: `${item?.title || 'Approval item'} was ${status.toLowerCase()} by manager.`,
      type: status === 'Approved' ? 'success' : 'warning',
    });
  };
  const pending = queue.filter(item => item.status === 'Pending').length;
  return (
    <section className="mb-3 rounded-2xl border border-amber-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-amber-700">Approval workflow</p>
          <h2 className="text-base font-black text-slate-950">{pending} item(s) waiting for manager approval</h2>
        </div>
        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800">Protected actions</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        {queue.map(item => (
          <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-black ${
              item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : item.status === 'Rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
            }`}>{item.status}</span>
            <p className="mt-2 text-sm font-black text-slate-950">{item.title}</p>
            <p className="mt-1 min-h-10 text-xs font-semibold text-slate-600">{item.detail}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => updateStatus(item.id, 'Approved')} className="flex-1 rounded-lg bg-emerald-600 px-2 py-2 text-[10px] font-black text-white">Approve</button>
              <button type="button" onClick={() => updateStatus(item.id, 'Rejected')} className="flex-1 rounded-lg bg-rose-600 px-2 py-2 text-[10px] font-black text-white">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SchoolBackupRestorePanel({ role, tenantId }: { role: User['role']; tenantId?: string }) {
  if (role !== 'SchoolAdmin' || !tenantId) return null;
  const [message, setMessage] = useState('');
  const keys = [
    `educore_teachers_${tenantId}`,
    `educore_students_${tenantId}`,
    `educore_classes_${tenantId}`,
    `educore_subjects_${tenantId}`,
    `educore_invoices_${tenantId}`,
    `educore_assignments_${tenantId}`,
    `educore_attendance_${tenantId}`,
    `educore_lessons_${tenantId}`,
    `educore_materials_${tenantId}`,
    `educore_permissions_${tenantId}`,
  ];
  const makeBackup = () => {
    const payload: Record<string, any> = {
      tenantId,
      backedUpAt: new Date().toISOString(),
      data: {},
    };
    keys.forEach(key => {
      payload.data[key] = localStorage.getItem(key);
    });
    localStorage.setItem(`educore_backup_latest_${tenantId}`, JSON.stringify(payload));
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `EduCore_Backup_${tenantId}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMessage('Backup saved and downloaded. A restore copy is also kept in this browser.');
    appendActivityLog({ tenantId, user: 'School Manager', action: 'School Backup Created', details: 'Manager exported school data backup.', type: 'success' });
  };
  const restoreLatest = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(`educore_backup_latest_${tenantId}`) || '{}');
      Object.entries(saved.data || {}).forEach(([key, value]) => {
        if (typeof value === 'string') localStorage.setItem(key, value);
      });
      setMessage('Latest browser backup restored. Refresh or reopen pages to see restored records.');
      appendActivityLog({ tenantId, user: 'School Manager', action: 'School Backup Restored', details: 'Manager restored the latest browser backup.', type: 'warning' });
    } catch {
      setMessage('No valid backup found to restore.');
    }
  };
  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600">Data backup and restore</p>
          <h2 className="text-base font-black text-slate-950">Protect school records before big changes</h2>
          <p className="text-xs font-semibold text-slate-600">Exports teachers, students, classes, subjects, fees, attendance, lessons, materials, and permissions.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={makeBackup} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Download backup</button>
          <button type="button" onClick={restoreLatest} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-black text-slate-700">Restore latest</button>
        </div>
      </div>
      {message && <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-black text-blue-800">{message}</p>}
    </section>
  );
}

function PrintExportCenter({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  if (!tenantId && role !== 'SuperAdmin') return null;
  const exportJson = (name: string, keys: string[]) => {
    const payload: Record<string, any> = { exportedAt: new Date().toISOString(), tenantId, data: {} };
    keys.forEach(key => {
      try {
        payload.data[key] = JSON.parse(localStorage.getItem(key) || '[]');
      } catch {
        payload.data[key] = localStorage.getItem(key);
      }
    });
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `EduCore_${name}_${tenantId || 'GLOBAL'}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const t = tenantId || 'GLOBAL';
  const reports = role === 'SchoolAdmin'
    ? [
        { title: 'Students', tab: 'school-students', keys: [`educore_students_${t}`] },
        { title: 'Teachers', tab: 'school-teachers', keys: [`educore_teachers_${t}`] },
        { title: 'Fees', tab: 'school-fees', keys: [`educore_invoices_${t}`, `educore_fee_items_${t}`] },
        { title: 'Attendance', tab: 'school-review', keys: [`educore_attendance_${t}`] },
        { title: 'Lessons', tab: 'school-review', keys: [`educore_lessons_${t}`] },
        { title: 'Materials', tab: 'school-log', keys: [`educore_materials_${t}`] },
        { title: 'Approvals', tab: 'school-review', keys: [`educore_approval_queue_${t}`] },
        { title: 'Backups', tab: 'school-settings', keys: [`educore_backup_latest_${t}`] },
      ]
    : role === 'Teacher'
      ? [
          { title: 'Assignments', tab: 'teacher-assignments', keys: [`educore_assignments_${t}`] },
          { title: 'Attendance', tab: 'teacher-attendance', keys: [`educore_attendance_${t}`] },
          { title: 'Lessons', tab: 'teacher-lessons', keys: [`educore_lessons_${t}`] },
          { title: 'Materials', tab: 'teacher-materials', keys: [`educore_materials_${t}`] },
        ]
      : [
          { title: 'My report', tab: role === 'Parent' ? 'parent-dashboard' : role === 'Student' ? 'student-dashboard' : 'dashboard', keys: [] },
          { title: 'Calendar', tab: 'school-calendar', keys: [] },
        ];
  return (
    <section id="export-center" className="mb-3 scroll-mt-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-slate-600">Print/export center</p>
          <h2 className="text-base font-black text-slate-950">Print or export important reports</h2>
        </div>
        <button onClick={() => window.print()} className="rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">Print current page</button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {reports.map(report => (
          <div key={report.title} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-black text-slate-950">{report.title}</p>
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setActiveTab(report.tab)} className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-2 text-[10px] font-black text-slate-700">Open</button>
              <button type="button" onClick={() => exportJson(report.title, report.keys)} className="flex-1 rounded-lg bg-blue-600 px-2 py-2 text-[10px] font-black text-white">Export</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function DashboardCleanupPanel({ compact, setCompact }: { compact: boolean; setCompact: (value: boolean) => void }) {
  return (
    <section className="mb-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-indigo-700">Dashboard cleanup</p>
          <h2 className="text-base font-black text-slate-950">Keep the page simple and focused</h2>
          <p className="text-xs font-semibold text-slate-600">Compact mode keeps the most useful sections visible and hides extra guidance panels.</p>
        </div>
        <button
          type="button"
          onClick={() => setCompact(!compact)}
          className={`rounded-xl px-3 py-2 text-xs font-black ${compact ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-800 border border-indigo-200'}`}
        >
          {compact ? 'Compact on' : 'Compact off'}
        </button>
      </div>
    </section>
  );
}

function UnreadStatusPanel({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  const readKey = `educore_read_status_${tenantId || 'GLOBAL'}_${role}`;
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem(readKey) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const items = role === 'SchoolAdmin'
    ? [
        { id: 'manager-teacher-report', title: 'Teacher review report', tab: 'school-review' },
        { id: 'manager-fees-report', title: 'Fees report', tab: 'school-fees' },
        { id: 'manager-alerts', title: 'Manager alerts', tab: 'school-log' },
      ]
    : role === 'Teacher'
      ? [
          { id: 'teacher-materials', title: 'New material update', tab: 'teacher-materials' },
          { id: 'teacher-assignment', title: 'Assignment reminder', tab: 'teacher-assignments' },
          { id: 'teacher-report', title: 'Daily lesson report', tab: 'teacher-log' },
        ]
      : role === 'Parent'
        ? [
            { id: 'parent-notice', title: 'School notice', tab: 'parent-dashboard' },
            { id: 'parent-homework', title: 'Child assignment', tab: 'parent-dashboard' },
            { id: 'parent-fees', title: 'Fee statement', tab: 'parent-dashboard' },
          ]
        : role === 'Student'
          ? [
              { id: 'student-homework', title: 'Homework update', tab: 'student-dashboard' },
              { id: 'student-material', title: 'Learning material', tab: 'student-dashboard' },
              { id: 'student-revision', title: 'Revision guide', tab: 'student-dashboard' },
            ]
          : [
              { id: 'super-school', title: 'School update', tab: 'schools' },
              { id: 'super-support', title: 'Support update', tab: 'sa-support-tickets' },
            ];
  const markRead = (id: string) => {
    setReadIds(prev => {
      const next = prev.includes(id) ? prev : [...prev, id];
      localStorage.setItem(readKey, JSON.stringify(next));
      return next;
    });
  };
  const unreadCount = items.filter(item => !readIds.includes(item.id)).length;
  return (
    <section className="mb-3 rounded-2xl border border-blue-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-blue-700">Unread status</p>
          <h2 className="text-base font-black text-slate-950">{unreadCount} unread item(s)</h2>
        </div>
        <button
          type="button"
          onClick={() => {
            const all = items.map(item => item.id);
            setReadIds(all);
            localStorage.setItem(readKey, JSON.stringify(all));
          }}
          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-black text-blue-800"
        >
          Mark all read
        </button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-3">
        {items.map(item => {
          const isRead = readIds.includes(item.id);
          return (
            <button
              key={`${item.label}-${item.id}`}
              type="button"
              onClick={() => {
                markRead(item.id);
                setActiveTab(item.tab);
              }}
              className={`rounded-xl border p-3 text-left ${isRead ? 'border-slate-200 bg-slate-50' : 'border-blue-200 bg-blue-50'}`}
            >
              <span className={`inline-block rounded-full px-2 py-1 text-[10px] font-black ${isRead ? 'bg-slate-200 text-slate-700' : 'bg-blue-600 text-white'}`}>{isRead ? 'Read' : 'Unread'}</span>
              <p className="mt-2 text-sm font-black text-slate-950">{item.title}</p>
              <p className="text-xs font-semibold text-slate-600">Open once to clear the badge.</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CompleteTodayChecklist({ role, tenantId, setActiveTab }: { role: User['role']; tenantId?: string; setActiveTab: (tab: string) => void }) {
  if (role !== 'Teacher' && role !== 'SchoolAdmin') return null;
  const keys = role === 'Teacher'
    ? [
        { key: 'teacher-attendance', label: 'Attendance done', tab: 'teacher-attendance' },
        { key: 'teacher-lesson', label: 'Lesson recorded', tab: 'teacher-lessons' },
        { key: 'teacher-material', label: 'Material used', tab: 'teacher-materials' },
        { key: 'teacher-assignment', label: 'Assignment given', tab: 'teacher-assignments' },
      ]
    : [
        { key: 'manager-timetable', label: 'Timetable checked', tab: 'school-teachers' },
        { key: 'manager-fees', label: 'Fees checked', tab: 'school-fees' },
        { key: 'parent-messages', label: 'Messages checked', tab: 'school-comm' },
        { key: 'teacher-attendance', label: 'Teacher work reviewed', tab: 'school-review' },
      ];
  const records = tenantId ? listTenantWorkflowProgress(tenantId) : [];
  const doneCount = keys.filter(item => records.some(record => record.key === item.key && record.completed)).length;
  return (
    <section className="mb-3 rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-emerald-700">Complete today checklist</p>
          <h2 className="text-base font-black text-slate-950">{doneCount}/{keys.length} done</h2>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">One-click work list</span>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {keys.map(item => {
          const done = records.some(record => record.key === item.key && record.completed);
          return (
            <button key={item.key} type="button" onClick={() => setActiveTab(item.tab)} className={`rounded-xl border p-3 text-left ${done ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}>
              <p className="text-sm font-black text-slate-950">{item.label}</p>
              <p className={`mt-1 text-xs font-black ${done ? 'text-emerald-700' : 'text-amber-800'}`}>{done ? 'Done' : 'Open now'}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SimpleProofTrailPanel({ role, tenantId }: { role: User['role']; tenantId?: string }) {
  const logs = getActivityLogs()
    .filter(log => !tenantId || log.tenantId === tenantId || log.tenantId === 'GLOBAL')
    .slice(0, 5);
  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-cyan-200">Simple activity proof trail</p>
          <h2 className="text-base font-black">Who did what, and when</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-slate-200">{role}</span>
      </div>
      <div className="mt-3 grid gap-2">
        {logs.length > 0 ? logs.map(log => (
          <div key={log.id} className="rounded-xl border border-white/10 bg-white/10 p-3">
            <p className="text-sm font-black">{log.user} did: {log.action}</p>
            <p className="text-xs font-semibold text-slate-300">{log.details}</p>
            <p className="mt-1 text-[10px] font-black uppercase tracking-wide text-cyan-200">{new Date(log.timestamp).toLocaleString()}</p>
          </div>
        )) : (
          <p className="rounded-xl border border-white/10 bg-white/10 p-3 text-xs font-semibold text-slate-300">No activity proof record yet. Important saves and reviews will appear here.</p>
        )}
      </div>
    </section>
  );
}

function TranslationReadinessPanel() {
  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Language safety</p>
          <h2 className="text-base font-black text-slate-950">English is the clean default</h2>
          <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-600">Translation buttons stay hidden until every language is properly translated and tested, so users do not see broken text.</p>
        </div>
        <span className="w-fit rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">Ready for future translation</span>
      </div>
    </section>
  );
}
function TaskModePanel({
  role,
  setActiveTab,
}: {
  role: User['role'];
  setActiveTab: (tab: string) => void;
}) {
  const tasks = role === 'SchoolAdmin'
    ? [
        { label: 'Review teachers', tab: 'school-review', icon: ClipboardCheck },
        { label: 'Make timetable', tab: 'school-teachers', icon: Calendar },
        { label: 'Check subjects', tab: 'school-subjects', icon: BookOpen },
        { label: 'Collect fees', tab: 'school-fees', icon: DollarSign },
        { label: 'Send message', tab: 'school-comm', icon: MessageSquare },
        { label: 'Register student', tab: 'school-students', icon: Users },
      ]
    : role === 'Teacher'
      ? [
          { label: 'Mark attendance', tab: 'teacher-attendance', icon: ClipboardCheck },
          { label: 'Upload materials', tab: 'teacher-materials', icon: BookOpen },
          { label: 'AI notes', tab: 'teacher-ai-suite', icon: Cpu },
          { label: 'AI exam questions', tab: 'teacher-ai-suite', icon: Cpu },
          { label: 'Give assignment', tab: 'teacher-assignments', icon: BookOpen },
          { label: 'Record lesson', tab: 'teacher-lessons', icon: Calendar },
        ]
      : role === 'SuperAdmin'
        ? [
            { label: 'Add school', tab: 'register', icon: PlusCircle },
            { label: 'Open schools', tab: 'schools', icon: Building2 },
            { label: 'Manage users', tab: 'roles', icon: Users },
            { label: 'Check support', tab: 'sa-support-tickets', icon: HelpCircle },
          ]
        : [
            { label: 'Go home', tab: getHomeTab(role), icon: Home },
            { label: 'Check calendar', tab: 'school-calendar', icon: Calendar },
            { label: 'Open hub', tab: 'edu-ecosystem', icon: MessageSquare },
          ];

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-slate-950 p-3 text-white shadow-xl shadow-slate-900/15 sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-200">Task Mode</p>
          <h2 className="mt-1 text-lg font-black sm:text-xl">What do you want to do?</h2>
        </div>
        <span className="hidden rounded-full bg-white/10 px-3 py-1 text-xs font-black text-cyan-100 sm:inline-flex">Choose one</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:mt-4 sm:grid-cols-2 lg:grid-cols-6">
        {tasks.map(task => {
          const Icon = task.icon;
          return (
            <button
              key={task.label}
              data-scroll-to={getSectionTarget(task.tab, task.label)}
              onClick={() => setActiveTab(task.tab)}
              className="flex min-h-16 flex-col items-start justify-between gap-2 rounded-2xl border border-white/10 bg-white/10 p-2.5 text-left text-xs font-black text-white transition hover:bg-white/15 active:scale-95 sm:min-h-20 sm:flex-row sm:items-center sm:justify-start sm:gap-3 sm:p-3 sm:text-sm"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-300 text-slate-950 sm:h-11 sm:w-11 sm:rounded-2xl">
                <Icon className="h-5 w-5" />
              </span>
              <span>{task.label}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
function SchoolWorkflowMap({
  role,
  setActiveTab,
}: {
  role: User['role'];
  setActiveTab: (tab: string) => void;
}) {
  const [open, setOpen] = useState(false);

  if (role === 'Parent' || role === 'Student') {
    const items = role === 'Parent'
      ? [
          { title: 'Assignments', body: 'See only assignments teachers gave to your child.', tab: 'parent-dashboard', icon: BookOpen },
          { title: 'Fees', body: 'See only this term or semester fees and payment status.', tab: 'parent-dashboard', icon: DollarSign },
          { title: 'School updates', body: 'Check messages, calendar, and school information.', tab: 'school-calendar', icon: MessageSquare },
        ]
      : [
          { title: 'My work', body: 'See assignments and class updates.', tab: 'student-dashboard', icon: BookOpen },
          { title: 'Calendar', body: 'Know school dates and events.', tab: 'school-calendar', icon: Calendar },
          { title: 'Learning hub', body: 'Open useful education resources.', tab: 'edu-ecosystem', icon: MessageSquare },
        ];

    return (
      <section className="mb-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg shadow-slate-900/5 sm:mb-4 sm:rounded-3xl sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Easy access</p>
            <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">What you can see</h2>
          </div>
          <button onClick={() => setOpen(!open)} className="rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 border border-blue-100">
            {open ? 'Hide details' : 'Show details'}
          </button>
        </div>
        {open && (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.title} data-scroll-to={getSectionTarget(item.tab, item.title)} onClick={() => setActiveTab(item.tab)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-3 font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
                </button>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  const items = role === 'Teacher'
    ? [
        { title: 'Attendance', body: 'Mark who is present or absent and save the record.', tab: 'teacher-attendance', icon: ClipboardCheck },
        { title: 'Materials', body: 'Upload notes, books, slides, videos, and class files.', tab: 'teacher-materials', icon: BookOpen },
        { title: 'Teach from materials', body: 'Open uploaded materials and use them while teaching.', tab: 'teacher-materials', icon: BookOpen },
        { title: 'AI notes', body: 'Use AI to make lesson notes from selected materials and reached pages.', tab: 'teacher-ai-suite', icon: Cpu },
        { title: 'AI exams', body: 'Use AI to set exam questions from selected materials and covered pages.', tab: 'teacher-ai-suite', icon: Cpu },
        { title: 'Assignments', body: 'Give assignments to students. Parents can see teacher-given work.', tab: 'teacher-assignments', icon: BookOpen },
      ]
    : [
        { title: 'Teacher work review', body: 'See attendance, lessons, materials, assignments, and activity records.', tab: 'school-review', icon: ClipboardCheck },
        { title: 'Statistics', body: 'Compare who is active, who records lessons, and who needs support.', tab: 'school-review', icon: Cpu },
        { title: 'Timetable', body: 'Plan classes using teachers, subjects, classes, and teaching load.', tab: 'school-teachers', icon: Calendar },
        { title: 'Subjects and load', body: 'Set subjects each teacher can teach so timetable planning is easier.', tab: 'school-subjects', icon: BookOpen },
        { title: 'Parents view', body: 'Parents see assignments from teachers and current term or semester fees.', tab: 'school-comm', icon: MessageSquare },
        { title: 'Fees and term bills', body: 'Track this term or semester fees, balances, and payment reminders.', tab: 'school-fees', icon: DollarSign },
      ];

  const extra = role === 'Teacher'
    ? ['Take attendance by class', 'Upload teaching materials', 'Generate notes with AI', 'Generate exams with AI', 'Give assignments', 'Record lessons taught']
    : ['Teacher performance statistics', 'Timetable planning', 'Subject-teacher matching', 'Parent fee visibility', 'Parent assignment visibility', 'School activity records'];

  return (
    <section className="mb-3 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-lg shadow-slate-900/5 sm:mb-4 sm:rounded-3xl sm:p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">More school tools</p>
          <h2 className="mt-1 text-lg font-black text-slate-950 sm:text-xl">See what the system can do</h2>
          <p className="mt-1 max-w-3xl text-xs font-medium leading-relaxed text-slate-600 sm:text-sm">
            Keep this closed for a simple page. Open it when you want to see all school workflows.
          </p>
        </div>
        <button onClick={() => setOpen(!open)} className="min-h-10 shrink-0 rounded-full bg-blue-50 px-3 py-2 text-xs font-black text-blue-800 border border-blue-100 sm:min-h-11 sm:px-4 sm:text-sm">
          {open ? 'Hide tools' : 'Show tools'}
        </button>
      </div>

      {open && (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {items.map(item => {
              const Icon = item.icon;
              return (
                <button key={item.title} data-scroll-to={getSectionTarget(item.tab, item.title)} onClick={() => setActiveTab(item.tab)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 active:scale-[0.99]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700"><Icon className="h-5 w-5" /></span>
                  <h3 className="mt-3 font-black text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm font-medium leading-relaxed text-slate-600">{item.body}</p>
                </button>
              );
            })}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
            <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Also useful</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {extra.map(item => (
                <span key={item} className="rounded-full bg-white px-3 py-1.5 text-xs font-black text-emerald-900 shadow-sm">{item}</span>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
function MobileBottomNav({
  role,
  activeTab,
  setActiveTab,
}: {
  role: User['role'];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const items = role === 'SuperAdmin'
    ? [
        { id: 'dashboard', label: 'Home', icon: LayoutDashboard, target: 'page-live-content' },
        { id: 'dashboard', label: 'Today', icon: Calendar, target: 'today-panel' },
        { id: 'schools', label: 'Work', icon: Building2, target: 'page-live-content' },
        { id: 'roles', label: 'Reports', icon: FileText, target: 'reports-panel' },
        { id: 'settings', label: 'More', icon: Settings, target: 'page-live-content' },
      ]
    : role === 'SchoolAdmin'
      ? [
          { id: 'school-dashboard', label: 'Home', icon: LayoutDashboard, target: 'page-live-content' },
          { id: 'school-dashboard', label: 'Today', icon: Calendar, target: 'today-panel' },
          { id: 'school-review', label: 'Work', icon: ClipboardCheck, target: 'page-live-content' },
          { id: 'school-log', label: 'Reports', icon: FileText, target: 'reports-panel' },
          { id: 'school-settings', label: 'More', icon: Settings, target: 'page-live-content' },
        ]
      : role === 'Teacher'
        ? [
            { id: 'teacher-dashboard', label: 'Home', icon: LayoutDashboard, target: 'page-live-content' },
            { id: 'teacher-dashboard', label: 'Today', icon: Calendar, target: 'today-panel' },
            { id: 'teacher-attendance', label: 'Work', icon: ClipboardCheck, target: 'page-live-content' },
            { id: 'teacher-log', label: 'Reports', icon: FileText, target: 'reports-panel' },
            { id: 'teacher-materials', label: 'More', icon: Settings, target: 'page-live-content' },
          ]
        : [
            { id: role === 'Parent' ? 'parent-dashboard' : 'student-dashboard', label: 'Home', icon: LayoutDashboard, target: 'page-live-content' },
            { id: role === 'Parent' ? 'parent-dashboard' : 'student-dashboard', label: 'Today', icon: Calendar, target: 'today-panel' },
            { id: role === 'Parent' ? 'parent-dashboard' : 'student-dashboard', label: 'Work', icon: BookOpen, target: 'page-live-content' },
            { id: role === 'Parent' ? 'parent-dashboard' : 'student-dashboard', label: 'Reports', icon: FileText, target: 'reports-panel' },
            { id: 'school-calendar', label: 'More', icon: Settings, target: 'page-live-content' },
          ];

  return (
    <div className="md:hidden fixed left-2 right-2 bottom-2 z-40 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur">
      <div className="grid gap-0.5 px-1 py-1" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={`${item.label}-${item.id}`}
              data-scroll-to={item.target || getSectionTarget(item.id, item.label)}
              onClick={() => setActiveTab(item.id)}
              className={`min-w-0 flex flex-col items-center justify-center gap-1.5 rounded-xl px-0.5 py-2 font-bold transition-colors ${
                isActive ? 'text-[#1A56DB]' : 'text-slate-500'
              }`}
            >
              <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-blue-50' : 'bg-transparent'}`}>
                <Icon className="w-4 h-4" />
              </span>
              <span className="block max-w-full truncate text-[9px] leading-tight tracking-normal">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}


function PageRouteFallback({ activeTab, onGoHome }: { activeTab: string; onGoHome: () => void }) {
  return (
    <div className="mx-auto my-6 w-full max-w-2xl border border-amber-200 bg-white p-5 shadow-sm">
      <div className="border border-amber-100 bg-amber-50 p-4">
        <p className="text-[11px] font-black uppercase tracking-wider text-amber-700">Page not ready</p>
        <h2 className="mt-1 text-lg font-black text-slate-950">This page route has no screen attached.</h2>
        <p className="mt-2 text-sm font-semibold text-slate-600">
          The portal protected you from a blank page. Route key: <span className="font-mono text-amber-800">{activeTab}</span>
        </p>
      </div>
      <button
        type="button"
        onClick={onGoHome}
        className="mt-4 w-full bg-[#1A56DB] px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
      >
        Go Back to Dashboard
      </button>
    </div>
  );
}

function hasRenderedPageForRole(role: User['role'], activeTab: string) {
  const shared = ['edu-ecosystem', 'commercial-hub', 'eduos-engine'];
  const routes: Record<User['role'], string[]> = {
    SuperAdmin: ['dashboard', 'register', 'schools', 'sa-tenants', 'sa-subscriptions', 'sa-audit-security', 'sa-system-ops', 'sa-support-tickets', 'roles', 'settings', ...shared],
    SchoolAdmin: ['school-dashboard', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-departments', 'school-academic-year', 'school-users', 'school-permissions', 'school-import', 'school-log', 'school-settings', 'school-ai-suite', 'school-fees', 'school-comm', 'school-calendar', ...shared],
    Accountant: ['school-dashboard', 'school-fees', 'school-comm', 'school-calendar', 'school-log', ...shared],
    Supervisor: ['school-dashboard', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-calendar', 'school-log', ...shared],
    AssistantAdmin: ['school-dashboard', 'school-review', 'school-teachers', 'school-students', 'school-classes', 'school-subjects', 'school-fees', 'school-comm', 'school-calendar', 'school-users', 'school-import', 'school-log', ...shared],
    Teacher: ['teacher-dashboard', 'teacher-assignments', 'teacher-attendance', 'teacher-lessons', 'teacher-materials', 'teacher-log', 'teacher-ai-suite', ...shared],
    Parent: ['parent-dashboard', 'school-calendar', ...shared],
    Student: ['student-dashboard', 'school-calendar', ...shared]
  };
  return routes[role]?.includes(activeTab) ?? false;
}
function AccessDeniedPanel({ user, activeTab, onGoHome, onLogout }: { user: User; activeTab: string; onGoHome: () => void; onLogout: () => void }) {
  return (
    <div className="mx-auto my-8 max-w-lg rounded-3xl border border-rose-100 bg-white p-5 text-center shadow-xl sm:p-7">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
        <LockKeyhole className="h-7 w-7" />
      </div>
      <p className="text-xs font-black uppercase tracking-[0.18em] text-rose-500">Access blocked</p>
      <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">This page is not for this account</h2>
      <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-600">
        You are signed in as <span className="text-slate-950">{user.role === 'SchoolAdmin' ? 'Manager / Head' : user.role}</span>. The page <span className="font-mono text-rose-600">{activeTab}</span> belongs to another role, so the portal protected it.
      </p>
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button type="button" onClick={onGoHome} className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700">
          Go to my home
        </button>
        <button type="button" onClick={onLogout} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-white">
          Log out
        </button>
      </div>
    </div>
  );
}

function PasswordChangeGate({ user, onChangePassword, onLogout }: { user: User; onChangePassword: (password: string) => void; onLogout: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const passwordFixes = [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One uppercase letter', ok: /[A-Z]/.test(password) },
    { label: 'One number', ok: /\d/.test(password) },
    { label: 'One special character', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const missing = passwordFixes.filter(rule => !rule.ok).map(rule => rule.label.toLowerCase());
    if (missing.length > 0) {
      setError(`Fix password: add ${missing.join(', ')}.`);
      return;
    }
    if (password !== confirm) {
      setError('The two passwords do not match.');
      return;
    }
    onChangePassword(password);
  };
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-md border border-slate-200 bg-white p-5 shadow-xl">
        <div className="mb-4 flex h-12 w-12 items-center justify-center bg-blue-600 text-white">
          <LockKeyhole className="h-6 w-6" />
        </div>
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">First login setup</p>
        <h1 className="mt-1 text-xl font-black text-slate-950">Change your temporary password</h1>
        <p className="mt-2 text-sm font-semibold text-slate-600">Account: {user.email}. You must set your own password before entering the portal.</p>
        {error && <p className="mt-3 border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">{error}</p>}
        <label className="mt-4 block text-[10px] font-black uppercase text-slate-500">New password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-blue-500" />
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {passwordFixes.map(rule => (
            <span key={rule.label} className={`border px-2 py-2 text-[11px] font-black ${rule.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-slate-50 text-slate-500'}`}>
              {rule.ok ? 'OK' : 'Need'}: {rule.label}
            </span>
          ))}
        </div>
        <label className="mt-3 block text-[10px] font-black uppercase text-slate-500">Confirm password</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="mt-1 w-full border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold outline-none focus:border-blue-500" />
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button type="button" onClick={onLogout} className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">Log out</button>
          <button type="submit" className="bg-blue-600 px-4 py-3 text-sm font-black text-white">Save password</button>
        </div>
      </form>
    </div>
  );
}

function AccountLinkRequiredPanel({ user, onGoAccess, onLogout }: { user: User; onGoAccess?: () => void; onLogout: () => void }) {
  const needed = user.role === 'Teacher' ? 'teacher profile' : 'student record';
  return (
    <div className="mx-auto my-8 max-w-lg border border-amber-200 bg-white p-6 text-center shadow-xl">
      <LockKeyhole className="mx-auto h-10 w-10 text-amber-600" />
      <h2 className="mt-3 text-xl font-black text-slate-950">Account needs linking</h2>
      <p className="mt-2 text-sm font-semibold text-slate-600">This {user.role} login must be linked to the correct {needed} before it can show private school data.</p>
      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {onGoAccess && <button type="button" onClick={onGoAccess} className="bg-blue-600 px-4 py-3 text-sm font-black text-white">Open Access</button>}
        <button type="button" onClick={onLogout} className="border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black text-slate-700">Log out</button>
      </div>
    </div>
  );
}

function needsLinkedRecord(user: User) {
  if (!user.createdBy) return false;
  if (user.role === 'Teacher') return !user.linkedTeacherId;
  if (user.role === 'Parent') return !(user.linkedStudentIds?.length || user.linkedStudentId);
  if (user.role === 'Student') return !user.linkedStudentId;
  return false;
}
export default function App() {
  // Authentication & session variables
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTenant, setCurrentTenant] = useState<School | null>(null);

  // Interactive Onboarding Guided Tour state
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [tourStep, setTourStep] = useState<number>(0);

  // Database list from local storage or seeds
  const [schools, setSchools] = useState<School[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Navigation tab tracker
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [recentTabs, setRecentTabs] = useState<string[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('educore_recent_tabs') || '[]');
      return Array.isArray(saved) ? saved.slice(0, 6) : [];
    } catch {
      return [];
    }
  });

  // Interactive feedback notification bar state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Sidebar collapse toggle state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSimpleMode, setIsSimpleMode] = useState<boolean>(true);
  const [portalLanguage, setPortalLanguage] = useState<PortalLanguage>('en');
  const [bigMode, setBigMode] = useState<boolean>(() => localStorage.getItem('educore_big_mode') === 'true');
  const [compactDashboard, setCompactDashboard] = useState<boolean>(() => localStorage.getItem('educore_compact_dashboard') !== 'false');
  const [fontScale, setFontScale] = useState<number>(() => {
    const saved = Number(localStorage.getItem('educore_font_scale'));
    return Number.isFinite(saved) && saved >= 90 && saved <= 140 ? saved : 112;
  });

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale}%`;
    localStorage.setItem('educore_font_scale', String(fontScale));
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontScale]);

  useEffect(() => {
    localStorage.setItem('educore_big_mode', String(bigMode));
  }, [bigMode]);

  useEffect(() => {
    localStorage.setItem('educore_compact_dashboard', String(compactDashboard));
  }, [compactDashboard]);

  useEffect(() => {
    const timer = window.setTimeout(scrollToMainWorkspace, 120);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    setRecentTabs(prev => {
      const next = [activeTab, ...prev.filter(tab => tab !== activeTab)].slice(0, 6);
      localStorage.setItem('educore_recent_tabs', JSON.stringify(next));
      return next;
    });
  }, [activeTab]);

  useEffect(() => {
    const handleSmartScrollClick = (event: MouseEvent) => {
      const element = event.target as HTMLElement | null;
      const trigger = element?.closest('[data-scroll-to]') as HTMLElement | null;
      if (trigger?.dataset.scrollTo) {
        window.setTimeout(() => scrollToPageTarget(trigger.dataset.scrollTo || ''), 60);
        return;
      }
      const anchor = element?.closest('a[href^="#"]') as HTMLAnchorElement | null;
      const hash = anchor?.getAttribute('href');
      if (hash && hash.length > 1) {
        event.preventDefault();
        scrollToPageTarget(hash.slice(1));
      }
    };
    document.addEventListener('click', handleSmartScrollClick);
    return () => document.removeEventListener('click', handleSmartScrollClick);
  }, []);

  useEffect(() => {
    const applyMobileTableLabels = () => {
      document.querySelectorAll('table').forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => (th.textContent || '').trim());
        if (headers.length === 0) return;
        table.querySelectorAll('tbody tr').forEach(row => {
          Array.from(row.children).forEach((cell, index) => {
            if (cell instanceof HTMLElement && headers[index]) {
              cell.setAttribute('data-mobile-label', headers[index]);
            }
          });
        });
      });
    };
    applyMobileTableLabels();
    const timeout = window.setTimeout(applyMobileTableLabels, 250);
    const observer = new MutationObserver(applyMobileTableLabels);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(timeout);
      observer.disconnect();
    };
  }, [activeTab]);
  // Automated layout responses for tablet / mobile sizes
  useEffect(() => {
    const handleAutoResponsive = () => {
      if (window.innerWidth < 1150) {
        setIsSidebarCollapsed(true);
      } else {
        setIsSidebarCollapsed(false);
      }
    };
    handleAutoResponsive();
    window.addEventListener('resize', handleAutoResponsive);
    return () => window.removeEventListener('resize', handleAutoResponsive);
  }, []);

  // --- STAGE 7 SEED MODULES ---
  const [packages, setPackages] = useState<SaaSPackage[]>([
    {
      id: 'basic',
      name: 'Basic Edition',
      priceMonthly: 49,
      priceYearly: 490,
      studentLimit: 250,
      teacherLimit: 20,
      aiLimitsMonthly: 50000,
      smsLimitMonthly: 1000,
      storageLimitGB: 5,
      parentPortalAccess: false,
      feesManagementAccess: false,
      reportsAccess: true,
      examGeneratorAccess: false,
      description: 'Optimized pricing for rising primary schools needing essential index dashboards.'
    },
    {
      id: 'professional',
      name: 'Professional Edition',
      priceMonthly: 129,
      priceYearly: 1290,
      studentLimit: 1000,
      teacherLimit: 60,
      aiLimitsMonthly: 250000,
      smsLimitMonthly: 5000,
      storageLimitGB: 25,
      parentPortalAccess: true,
      feesManagementAccess: true,
      reportsAccess: true,
      examGeneratorAccess: true,
      description: 'The standard SaaS package providing complete Parent/Student portals, automatic invoicing, and standard AI summarizers.'
    },
    {
      id: 'enterprise',
      name: 'Enterprise Gold',
      priceMonthly: 299,
      priceYearly: 2990,
      studentLimit: 999999, // unlimited
      teacherLimit: 999999,
      aiLimitsMonthly: 1000000,
      smsLimitMonthly: 20000,
      storageLimitGB: 100,
      parentPortalAccess: true,
      feesManagementAccess: true,
      reportsAccess: true,
      examGeneratorAccess: true,
      description: 'Fully unlocked system limits for massive universities and multi-campus configurations requiring advanced computing SLAs.'
    },
    {
      id: 'custom',
      name: 'Custom Tailored',
      priceMonthly: 499,
      priceYearly: 4990,
      studentLimit: 999999,
      teacherLimit: 999999,
      aiLimitsMonthly: 5000000,
      smsLimitMonthly: 100000,
      storageLimitGB: 500,
      parentPortalAccess: true,
      feesManagementAccess: true,
      reportsAccess: true,
      examGeneratorAccess: true,
      description: 'SLA contractual setups governed by custom enterprise pricing schedules.'
    }
  ]);

  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([
    {
      id: 'sub_central_crest',
      tenantId: 'school_central_crest',
      packageId: 'professional',
      billingCycle: 'Yearly',
      status: 'Active',
      startDate: '2025-09-12',
      endDate: '2026-09-12',
      autoRenew: true,
      studentUsage: 840,
      teacherUsage: 45,
      aiUsageThisMonth: 124500,
      smsUsageThisMonth: 1240,
      storageUsageGB: 8.4,
      amountPaidAccumulated: 1290
    },
    {
      id: 'sub_st_jude',
      tenantId: 'school_st_jude',
      packageId: 'enterprise',
      billingCycle: 'Monthly',
      status: 'Active',
      startDate: '2025-11-04',
      endDate: '2026-07-04',
      autoRenew: true,
      studentUsage: 940,
      teacherUsage: 54,
      aiUsageThisMonth: 489000,
      smsUsageThisMonth: 8900,
      storageUsageGB: 34.2,
      amountPaidAccumulated: 2392
    },
    {
      id: 'sub_apex_collegiate',
      tenantId: 'school_apex_collegiate',
      packageId: 'basic',
      billingCycle: 'Monthly',
      status: 'Suspended',
      startDate: '2026-01-15',
      endDate: '2026-02-15',
      autoRenew: false,
      studentUsage: 410,
      teacherUsage: 22,
      aiUsageThisMonth: 1000,
      smsUsageThisMonth: 120,
      storageUsageGB: 1.1,
      amountPaidAccumulated: 0
    }
  ]);

  const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([
    {
      id: 'inv_cc_9019',
      tenantId: 'school_central_crest',
      invoiceNumber: 'INV-2025-CC-9019',
      amount: 1290,
      cycle: 'Yearly',
      packageName: 'Professional Edition',
      issueDate: '2025-09-12',
      dueDate: '2025-09-25',
      paymentDate: '2025-09-14',
      status: 'Paid',
      paymentMethod: 'Stripe ACH Clearing',
      transactionRef: 'ch_stripe_81j2h8x6v'
    },
    {
      id: 'inv_sj_4401',
      tenantId: 'school_st_jude',
      invoiceNumber: 'INV-2025-SJ-4401',
      amount: 299,
      cycle: 'Monthly',
      packageName: 'Enterprise Gold',
      issueDate: '2025-11-04',
      dueDate: '2025-11-18',
      paymentDate: '2025-11-05',
      status: 'Paid',
      paymentMethod: 'Credit Card Inline',
      transactionRef: 'ch_stripe_h18ha8901'
    },
    {
      id: 'inv_sj_4402',
      tenantId: 'school_st_jude',
      invoiceNumber: 'INV-2025-SJ-4402',
      amount: 299,
      cycle: 'Monthly',
      packageName: 'Enterprise Gold',
      issueDate: '2025-12-04',
      dueDate: '2025-12-18',
      paymentDate: '2025-12-04',
      status: 'Paid',
      paymentMethod: 'Credit Card Inline',
      transactionRef: 'ch_stripe_v22ga8944'
    },
    {
      id: 'inv_ap_0110',
      tenantId: 'school_apex_collegiate',
      invoiceNumber: 'INV-2026-AP-0110',
      amount: 49,
      cycle: 'Monthly',
      packageName: 'Basic Edition',
      issueDate: '2026-01-15',
      dueDate: '2026-01-30',
      status: 'Unpaid',
      paymentMethod: 'Manual Mobile Money Platform'
    }
  ]);

  const [saAuditLogs, setSaAuditLogs] = useState<AuditLog[]>([
    {
      id: 'audit_01',
      tenantId: 'GLOBAL',
      userId: 'usr_sa_1',
      userName: 'EduCore Admin Core',
      userEmail: 'superadmin@educore.ai',
      userRole: 'SuperAdmin',
      action: 'Cluster Init Protocols',
      details: 'Super Admin successfully ran base server Docker node deployments.',
      ipAddress: '15.201.44.12',
      device: 'NodeJS V22 Linux kernel',
      timestamp: '2025-01-01T00:00:10Z',
      module: 'System'
    },
    {
      id: 'audit_02',
      tenantId: 'school_central_crest',
      userId: 'user_admin_central',
      userName: 'Dr. Sarah Jenkins',
      userEmail: 's.jenkins@centralcrest.edu',
      userRole: 'SchoolAdmin',
      action: 'Credentials Login Gate',
      details: 'Secure SchoolAdmin login cleared auth checkpoint.',
      ipAddress: '194.34.120.2',
      device: 'Google Chrome Desktop Mac_OS',
      timestamp: '2026-06-18T09:44:12Z',
      module: 'Auth'
    },
    {
      id: 'audit_03',
      tenantId: 'school_st_jude',
      userId: 'user_admin_jude',
      userName: 'Principal Arthur Vance',
      userEmail: 'a.vance@stjude.edu',
      userRole: 'SchoolAdmin',
      action: 'Financial Ledger Cleared',
      details: 'Invoiced receipt payment processed for class St. Jude matriculation limits.',
      ipAddress: '12.44.60.101',
      device: 'Safari Mobile iOS iPhone',
      timestamp: '2026-06-18T10:14:22Z',
      module: 'Financial'
    },
    {
      id: 'audit_04',
      tenantId: 'school_central_crest',
      userId: 'user_teacher_central',
      userName: 'Academic Coach Jenkins',
      userEmail: 'teacher@centralcrest.edu',
      userRole: 'Teacher',
      action: 'AI Lesson Record Summary',
      details: 'Evaluated school curriculum topics teach using Google Vertex engine.',
      ipAddress: '194.34.120.3',
      device: 'Mozilla Firefox Desktop Linux',
      timestamp: '2026-06-18T11:00:05Z',
      module: 'AI'
    },
    {
      id: 'audit_05',
      tenantId: 'school_apex_collegiate',
      userId: 'user_admin_apex',
      userName: 'Director Miriam Sterling',
      userEmail: 'm.sterling@apexcollegiate.org',
      userRole: 'SchoolAdmin',
      action: 'Tenant Row Suspended',
      details: 'Super Admin automatically disabled Row Level Access keys on Trial contract expiration.',
      ipAddress: '127.0.0.1 (Local host API)',
      device: 'Nginx container socket proxy',
      timestamp: '2026-06-18T12:00:00Z',
      module: 'Tenant'
    }
  ]);

  const [securityPolicy, setSecurityPolicy] = useState<SecurityPolicy>({
    id: 'policy_global',
    tenantId: 'GLOBAL',
    minPasswordLength: 10,
    requireLetters: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxFailedLogins: 5,
    lockoutDurationMinutes: 15,
    twoFactorAuth: 'Optional',
    sessionTimeoutMinutes: 30
  });

  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([
    {
      id: 'log_01',
      tenantId: 'school_central_crest',
      userId: 'user_admin_central',
      userName: 'Dr. Sarah Jenkins',
      userEmail: 's.jenkins@centralcrest.edu',
      role: 'SchoolAdmin',
      ipAddress: '194.34.120.2',
      device: 'MacBook Pro Apple Silicon',
      browser: 'Chrome V126',
      status: 'Success',
      timestamp: '2026-06-18T09:44:12Z'
    },
    {
      id: 'log_02',
      tenantId: 'school_apex_collegiate',
      userId: 'user_admin_apex',
      userName: 'Director Miriam Sterling',
      userEmail: 'm.sterling@apexcollegiate.org',
      role: 'SchoolAdmin',
      ipAddress: '195.120.45.6',
      device: 'Lenovo ThinkPad Intel',
      browser: 'Firefox V120',
      status: 'Failed_Password',
      timestamp: '2026-06-18T12:00:05Z',
      failureReason: 'Invalid core password credentials hash matching indices.'
    }
  ]);

  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([
    {
      id: 'bak_01',
      tenantId: 'GLOBAL',
      type: 'Automated',
      target: 'PostgreSQL',
      sizeMB: 341.2,
      status: 'Success',
      initiatedBy: 'System Cron Daemon',
      createdAt: '2026-06-18T02:00:00Z',
      downloadUrl: '#',
      notes: 'Automated daily database SQL dump including relations.'
    },
    {
      id: 'bak_02',
      tenantId: 'GLOBAL',
      type: 'Automated',
      target: 'Cloud Storage',
      sizeMB: 2841.0,
      status: 'Success',
      initiatedBy: 'System Cron Daemon',
      createdAt: '2026-06-18T03:00:00Z',
      downloadUrl: '#',
      notes: 'Storage assets container bucket snapshot.'
    }
  ]);

  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSetting[]>([
    {
      id: 'sms',
      name: 'SMS Notification Gateway',
      provider: 'Twilio',
      status: 'Connected',
      apiKeyMasked: '****-DEMO-KEY',
      apiEndpoint: 'https://api.twilio.com/2010-04-01',
      lastTestedAt: '2026-06-18T08:00:00Z'
    },
    {
      id: 'email',
      name: 'SMTP Email Delivery Service',
      provider: 'Mailgun',
      status: 'Connected',
      apiKeyMasked: '****-DEMO-KEY',
      apiEndpoint: 'https://api.mailgun.net/v3',
      lastTestedAt: '2026-06-18T08:15:00Z'
    },
    {
      id: 'payment',
      name: 'Credit Card & ACH Processor',
      provider: 'Stripe',
      status: 'Connected',
      apiKeyMasked: '****-DEMO-KEY',
      apiEndpoint: 'https://api.stripe.com/v1',
      lastTestedAt: '2026-06-18T08:30:00Z'
    },
    {
      id: 'ai',
      name: 'AI Summarizer & Exam Generator',
      provider: 'Google Vertex AI',
      status: 'Connected',
      apiKeyMasked: '****-DEMO-KEY',
      apiEndpoint: 'https://us-central1-aiplatform.googleapis.com',
      lastTestedAt: '2026-06-18T08:45:00Z'
    },
    {
      id: 'biometric',
      name: 'Physical Biometrics Gateway',
      provider: 'HikVision IoT platform',
      status: 'Not Connected',
      apiKeyMasked: '****-DEMO-KEY'
    }
  ]);

  const [systemHealth, setSystemHealth] = useState<SystemHealthMetric>({
    serverStatus: 'Healthy',
    databaseStatus: 'Healthy',
    memoryUsagePercent: 52,
    cpuUsagePercent: 30,
    diskUsagePercent: 15,
    activeWorkers: 8,
    queueStatus: 'Idle',
    failedJobs: 0,
    uptimeSeconds: 2956800, // 34 days
    redisStatus: 'Healthy',
    lastLogLines: [
      '2026-06-18T14:40:01Z [kernel] [info] NodeJs microvMs online us-central CloudRun.',
      '2026-06-18T14:40:05Z [auth] [success] Cleared token credentials check path: /api/session.',
      '2026-06-18T14:41:22Z [db] [info] Spanner index lock query resolved in 1.45 ms.',
      '2026-06-18T14:42:10Z [bullmq] [success] Worker core #3 processed background SMS dispatch job.',
      '2026-06-18T14:42:12Z [nginx] [info] Reverse proxy routed GET /api/v1/clinical/statistics 200 OK'
    ]
  });

  const [deploymentChecklist, setDeploymentChecklist] = useState<DeploymentChecklistItem[]>([
    {
      id: 'item_01',
      task: 'Kubernetes Scaling configuration',
      category: 'Infrastructure',
      status: 'Completed',
      description: 'Defined auto-scaling threshold triggers from 1 to 10 active container replicas based on CPU target thresholds.'
    },
    {
      id: 'item_02',
      task: 'PostgreSQL DB schema sync with Drizzle ORM migrate',
      category: 'Database',
      status: 'Completed',
      description: 'Verify model schemas migrations are replicated safely without tables lock conditions.'
    },
    {
      id: 'item_03',
      task: 'Secure SSL Certificates with auto Renewals',
      category: 'Security',
      status: 'Completed',
      description: 'Setup Let\'s Encrypt certbots inside the Nginx reverse ingress nodes.'
    },
    {
      id: 'item_04',
      task: 'Configure Stripe Recurring Webhook endpoints',
      category: 'SaaS Billing',
      status: 'In Progress',
      description: 'Sync stripe customer portal updates to renew contracts expiration dates.'
    },
    {
      id: 'item_05',
      task: 'Rate-Limit Endpoint Protection shields',
      category: 'Security',
      status: 'Completed',
      description: 'Enforce express-rate-limit headers limits of 1000 requests per minute from localized IPs.'
    }
  ]);

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'tick_1',
      tenantId: 'school_central_crest',
      schoolName: 'Central Crest Collegiate',
      title: 'AI Exam Generator is slow on Chemistry paper models',
      description: 'Generating 50 chemistry multiple-choice options with formulas is taking over 45 seconds to compile and timing out. Is there a token limit exceeded?',
      module: 'AI Academic Suite',
      priority: 'High',
      status: 'Open',
      createdById: 'user_admin_central',
      createdByName: 'Dr. Sarah Jenkins',
      createdAt: '2026-06-18T09:00:00Z',
      updatedAt: '2026-06-18T09:00:00Z',
      responses: []
    }
  ]);

  // Initialize and load database states
  useEffect(() => {
    // Seed and pull records
    const storedSchools = getSchoolsInStorage();
    const storedUsers = getUsersInStorage();
    const storedLogs = getActivityLogs();

    setSchools(storedSchools);
    setAllUsers(storedUsers);
    setActivityLogs(storedLogs);

    const restored = restoreUserFromSession(storedUsers, storedSchools);
    if (restored) {
      setCurrentUser(restored.user);
      setCurrentTenant(restored.tenant);
      setActiveTab(getSafeTabForRole(restored.user.role, activeTab));
    }
  }, []);

  // Auto-launch guided tour on first-time visit
  useEffect(() => {
    const isCompleted = localStorage.getItem("educore_tour_completed");
    const isPhone = window.matchMedia?.('(max-width: 767px)').matches;
    if (!isCompleted && !isPhone) {
      const t = setTimeout(() => {
        setIsTourOpen(true);
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  // Listen for instant workspace swap commands emitted from widgets
  useEffect(() => {
    const handleInstantSwitch = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      const targetSchoolId = customEvent.detail;
      
      const targetSchoolObj = schools.find(s => s.id === targetSchoolId);
      if (targetSchoolObj) {
         // Auto find corresponding local school admin user
         const localAdminUser = allUsers.find(
           u => u.tenantId === targetSchoolId && u.role === 'SchoolAdmin'
         );
         
         if (localAdminUser) {
           setCurrentUser(localAdminUser);
           setCurrentTenant(targetSchoolObj);
           savePortalSession(localAdminUser);
           setActiveTab('school-dashboard');
           triggerToast(`Opened ${targetSchoolObj.name} for review`, 'success');
           appendActivityLog({
             tenantId: targetSchoolObj.id,
             user: 'Super cluster tunnel',
             action: 'Cross-Tenant Direct Switch',
             details: `Super Admin bypassed credentials to enter ${targetSchoolObj.name} local workspace.`,
             type: 'info'
           });
           // Re-fetch activities
           setActivityLogs(getActivityLogs());
         }
      }
    };

    window.addEventListener('instant-tenant-switch', handleInstantSwitch);
    return () => {
      window.removeEventListener('instant-tenant-switch', handleInstantSwitch);
    };
  }, [schools, allUsers]);

  // Handle toast notification timing and close animation
  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message: plainToastText(message), type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const secureSetActiveTab = (tab: string) => {
    if (!currentUser) return;
    if (canAccessTab(currentUser, tab)) {
      setActiveTab(tab);
      return;
    }

    const safeTab = getSafeTabForRole(currentUser.role);
    setActiveTab(safeTab);
    triggerToast('This page is protected for another role. You were returned to your own home page.', 'error');
    appendActivityLog({
      tenantId: currentUser.tenantId === 'SUPER_ADMIN' ? 'GLOBAL' : currentUser.tenantId,
      user: currentUser.name,
      action: 'Blocked Unauthorized Page Access',
      details: `${currentUser.role} account tried to open restricted page: ${tab}.`,
      type: 'warning'
    });
    setActivityLogs(getActivityLogs());
  };

  useEffect(() => {
    if (!currentUser) return;
    if (!canAccessTab(currentUser, activeTab)) {
      setActiveTab(getSafeTabForRole(currentUser.role));
      triggerToast('Your account cannot open that page. The portal returned you to your allowed home.', 'error');
    }
  }, [currentUser, activeTab]);

  // Switch context from swapper dropdown (Super Admin <-> School Admin toggling)
  const handleContextSwitch = (selection: string | 'SUPER_ADMIN') => {
    if (selection === 'SUPER_ADMIN') {
      // Find default prefilled super admin user
      const sAdminUser = allUsers.find(u => u.role === 'SuperAdmin');
      if (sAdminUser) {
        setCurrentUser(sAdminUser);
        setCurrentTenant(null);
        savePortalSession(sAdminUser);
        setActiveTab('dashboard');
        triggerToast('Returned to the Super Admin home.', 'info');
      }
    } else {
      // Find targeted school admin details
      const targetSchool = schools.find(s => s.id === selection);
      if (targetSchool) {
        const matchingAdmin = allUsers.find(
          u => u.tenantId === selection && u.role === 'SchoolAdmin'
        );
        if (matchingAdmin) {
          setCurrentUser(matchingAdmin);
          setCurrentTenant(targetSchool);
          savePortalSession(matchingAdmin);
          setActiveTab('school-dashboard');
          triggerToast(`Opened ${targetSchool.name} for review.`, 'success');
        }
      }
    }
  };

  // LOGOUT COMMAND RESETTER
  const handlePlatformLogout = () => {
    clearPortalSession();
    setCurrentUser(null);
    setCurrentTenant(null);
    setToast(null);
    triggerToast('You have signed out safely.', 'info');
  };

  // REGISTRY ACTION 1: Register and deploy a brand new school node
  const handleDeployNewSchoolNode = (newSchool: School, defaultAdminPassword: string) => {
    // Append to live context & storage
    const updatedSchools = [...schools, newSchool];
    setSchools(updatedSchools);
    saveSchoolsInStorage(updatedSchools);

    // Create the associated localized admin user account 
    const isMatchingUserExist = allUsers.some(u => u.email.toLowerCase() === newSchool.adminEmail.toLowerCase());
    let updatedUsers = [...allUsers];
    if (!isMatchingUserExist) {
       const schoolAdminUser: User = {
         id: `user_adm_${Date.now()}`,
         tenantId: newSchool.id,
         name: newSchool.adminName,
         email: newSchool.adminEmail,
         role: 'SchoolAdmin',
         status: 'Active',
         phone: newSchool.phone,
         createdAt: new Date().toISOString(),
         department: 'Administration'
       };
       updatedUsers = [...allUsers, schoolAdminUser];
       setAllUsers(updatedUsers);
       saveUsersInStorage(updatedUsers);
    }

    // Append localized system logs for central monitor audit
    appendActivityLog({
      tenantId: newSchool.id,
      user: 'SuperAdmin System',
      action: 'Tenant Row Allocated',
      details: `Allocated school safe database row limits for code ${newSchool.code}. Package tier: ${newSchool.subscriptionPackage}.`,
      type: 'success'
    });

    triggerToast(`School ${newSchool.code} was created successfully.`, 'success');
    
    // Refresh table registries
    setActivityLogs(getActivityLogs());
  };

  // REGISTRY ACTION 2: Freeze / Suspend Core Database Workspace row toggles
  const handleToggleSchoolDatabaseStatus = (schoolId: string) => {
    const freshSchools = schools.map(s => {
      if (s.id === schoolId) {
        const isCurrentlyActive = s.status === 'Active';
        const targetStatus = isCurrentlyActive ? 'Suspended' : 'Active';
        
        appendActivityLog({
          tenantId: schoolId,
          user: 'Central Guard',
          action: isCurrentlyActive ? 'Workspace Frozen' : 'Workspace Restored',
          details: isCurrentlyActive 
            ? `Admin manually toggled suspension. Row level queries for ${s.code} are locked.`
            : `Suspension revoked. Restored regular multi-tenant ledger rows for ${s.code}.`,
          type: isCurrentlyActive ? 'warning' : 'success'
        });

        triggerToast(
          isCurrentlyActive 
            ? `School ${s.code} is suspended.` 
            : `School ${s.code} is active again.`,
          isCurrentlyActive ? 'error' : 'success'
        );

        return { ...s, status: targetStatus };
      }
      return s;
    });

    setSchools(freshSchools);
    saveSchoolsInStorage(freshSchools);
    setActivityLogs(getActivityLogs());
  };

  // TENANT ACTION 1: Enroll a localized user credentials strictly checked inside tenant ID
  const handleAddLocalTenantUser = (userMeta: Omit<User, 'id' | 'createdAt'>) => {
    if (currentUser?.role !== 'SuperAdmin' && userMeta.tenantId !== currentUser?.tenantId) {
      triggerToast('Managers can only create users inside their own school.', 'error');
      return;
    }
    const newUser: User = {
      ...userMeta,
      id: `user_role_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const updated = [...allUsers, newUser];
    setAllUsers(updated);
    saveUsersInStorage(updated);

    appendActivityLog({
      tenantId: newUser.tenantId,
      user: currentUser?.name || 'Local Admin',
      action: 'User Registered',
      details: `Enrolled new ${newUser.role}: ${newUser.name} [${newUser.email}]. Enforced isolation: row owner constraints validated.`,
      type: 'info'
    });

    triggerToast(`User account for ${newUser.name} was added.`, 'success');
    setActivityLogs(getActivityLogs());
  };

  const handleUpdateLocalTenantUser = (userId: string, patch: Partial<User>) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;
    if (currentUser?.role !== 'SuperAdmin' && targetUser.tenantId !== currentUser?.tenantId) {
      triggerToast('This account belongs to another school, so it cannot be changed here.', 'error');
      return;
    }
    const updated = allUsers.map(u => u.id === userId ? { ...u, ...patch } : u);
    setAllUsers(updated);
    saveUsersInStorage(updated);
    appendActivityLog({
      tenantId: targetUser.tenantId,
      user: currentUser?.name || 'Access Manager',
      action: 'User Access Updated',
      details: `Updated ${targetUser.role} account for ${targetUser.name}. Changed fields: ${Object.keys(patch).join(', ')}.`,
      type: patch.status === 'Active' ? 'success' : 'info'
    });
    if (patch.temporaryPassword) {
      appendLoginAudit({ tenantId: targetUser.tenantId, email: targetUser.email, status: 'password_reset', detail: 'Temporary password was reset by an access manager.' });
    }
    setActivityLogs(getActivityLogs());
    triggerToast(`Updated access for ${targetUser.name}.`, 'success');
  };

  // TENANT ACTION 2: Revoke local user credentials inside private tenant
  const handleRevokeLocalTenantUser = (userId: string) => {
    const targetUser = allUsers.find(u => u.id === userId);
    if (!targetUser) return;
    if (currentUser?.role !== 'SuperAdmin' && targetUser.tenantId !== currentUser?.tenantId) {
      triggerToast('This account belongs to another school, so it cannot be removed here.', 'error');
      return;
    }

    const filtered = allUsers.filter(u => u.id !== userId);
    setAllUsers(filtered);
    saveUsersInStorage(filtered);

    appendActivityLog({
      tenantId: targetUser.tenantId,
      user: currentUser?.name || 'Local Admin',
      action: 'User Revoked',
      details: `Revoked credentials key for ${targetUser.role}: ${targetUser.name}. Row clean-up finished.`,
      type: 'warning'
    });

    triggerToast(`User access removed for ${targetUser.name}.`, 'error');
    setActivityLogs(getActivityLogs());
  };

  const appendLoginAudit = (event: { tenantId: string | 'GLOBAL'; email: string; status: 'success' | 'failed' | 'pending' | 'password_change_required' | 'password_changed' | 'password_reset'; detail: string }) => {
    const key = `educore_login_audit_${event.tenantId}`;
    const current = getStoredList<any>(key);
    const record = { id: `login_${Date.now()}`, ...event, createdAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify([record, ...current].slice(0, 100)));
    appendActivityLog({
      tenantId: event.tenantId,
      user: event.email,
      action: 'Login Audit',
      details: `${event.status}: ${event.detail}`,
      type: event.status === 'success' || event.status === 'password_changed' ? 'success' : event.status === 'failed' ? 'error' : 'warning'
    });
  };

  const handlePasswordChange = (password: string) => {
    if (!currentUser) return;
    handleUpdateLocalTenantUser(currentUser.id, { password, temporaryPassword: undefined, mustChangePassword: false });
    appendLoginAudit({ tenantId: currentUser.tenantId, email: currentUser.email, status: 'password_changed', detail: 'User changed temporary password on first login.' });
    setCurrentUser({ ...currentUser, password, temporaryPassword: undefined, mustChangePassword: false });
    triggerToast('Password changed. Portal access is now open.', 'success');
  };

  // Simple Action trigger helpers for quick backups from short commands
  const handleSimulateQuickCommand = (promptMsg: string) => {
    triggerToast(`${promptMsg} started successfully.`, 'info');
    appendActivityLog({
      tenantId: 'GLOBAL',
      user: 'Super Admin Engine',
      action: 'Fast Command Fired',
      details: `${promptMsg} completed safely in Cloud environment. 0 conflicts identified.`,
      type: 'success'
    });
    setActivityLogs(getActivityLogs());
  };

  return (
    <div className={`app-shell min-h-screen text-slate-800 flex flex-col font-sans select-none antialiased overflow-x-hidden ${bigMode ? 'big-mode' : ''}`}> 
      
      {/* FLOATING SUCCESS AND ALERT TOAST CONTROLLER */}
      {toast && (
        <div 
          onClick={() => setToast(null)}
          className={`fixed bottom-24 left-1/2 right-auto z-50 w-[calc(100vw-2rem)] max-w-[330px] -translate-x-1/2 p-3.5 sm:bottom-6 sm:left-auto sm:right-6 sm:w-auto sm:max-w-sm sm:translate-x-0 sm:p-4 rounded-xl sm:rounded-md border flex items-center gap-3 shadow-2xl cursor-pointer animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === 'success' 
              ? 'bg-white border-emerald-250 text-slate-900 select-all' 
              : toast.type === 'error'
                ? 'bg-[#FFF5F5] border-rose-200 text-slate-900 select-all'
                : 'bg-white border-blue-200 text-slate-900 select-all'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />}
          {toast.type === 'info' && <Cpu className="w-5 h-5 text-indigo-600 shrink-0" />}
          
          <div className="flex-1 min-w-0 text-left">
             <p className="text-[11px] sm:text-xs font-bold font-sans pr-2">
               {toast.type === 'success' ? 'Done' : toast.type === 'error' ? 'Check This' : 'Info'}
             </p>
             <p className="text-[10px] text-slate-500 font-medium leading-normal mt-0.5">{toast.message}</p>
          </div>
          <button className="text-slate-400 hover:text-slate-800 self-start">
             <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* RENDER VIEW CONTROLLER */}
      {!currentUser ? (
        /* PORTAL LOGIN GATES */
        <LoginView 
          schools={schools}
          allUsers={allUsers}
          onLoginAudit={appendLoginAudit}
          onCreateUserAccount={(userMeta) => {
            const exists = allUsers.some(u => u.email.toLowerCase() === userMeta.email.toLowerCase() && u.tenantId === userMeta.tenantId);
            if (exists) return false;
            const newUser: User = {
              ...userMeta,
              id: `user_login_${Date.now()}`,
              createdAt: new Date().toISOString()
            };
            const updated = [...allUsers, newUser];
            setAllUsers(updated);
            saveUsersInStorage(updated);
            appendActivityLog({
              tenantId: newUser.tenantId,
              user: 'Login Account Creator',
              action: 'Login Account Created',
              details: `${newUser.role} login account created for ${newUser.name}. Status: ${newUser.status}.`,
              type: newUser.status === 'Active' ? 'success' : 'info'
            });
            setActivityLogs(getActivityLogs());
            return true;
          }}
          onLoginSuccess={(user, selectedSchool) => {
            const userWithLogin = { ...user, lastLogin: new Date().toISOString() };
            const updatedUsers = allUsers.map(item => item.id === user.id ? userWithLogin : item);
            setAllUsers(updatedUsers);
            saveUsersInStorage(updatedUsers);
            setCurrentUser(userWithLogin);
            setCurrentTenant(selectedSchool);
            savePortalSession(userWithLogin);
            // Default active tabs on successful login
            if (user.role === 'SuperAdmin') {
              setActiveTab('dashboard');
              triggerToast('Super admin login completed.', 'success');
            } else if (user.role === 'Teacher') {
              setActiveTab('teacher-dashboard');
              triggerToast(`Teacher login completed for ${selectedSchool?.name}.`, 'success');
            } else if (user.role === 'Parent') {
              setActiveTab('parent-dashboard');
              triggerToast(`Parent login completed for ${selectedSchool?.name}.`, 'success');
            } else if (user.role === 'Student') {
              setActiveTab('student-dashboard');
              triggerToast(`Student login completed for ${selectedSchool?.name}.`, 'success');
            } else if (user.role === 'Accountant') {
              setActiveTab('school-fees');
              triggerToast(`Accountant login completed for ${selectedSchool?.name}.`, 'success');
            } else if (user.role === 'Supervisor') {
              setActiveTab('school-review');
              triggerToast(`Supervisor login completed for ${selectedSchool?.name}.`, 'success');
            } else if (user.role === 'AssistantAdmin') {
              setActiveTab('school-dashboard');
              triggerToast(`Assistant admin login completed for ${selectedSchool?.name}.`, 'success');
            } else {
              setActiveTab('school-dashboard');
              triggerToast(`School manager login completed for ${selectedSchool?.name}.`, 'success');
            }
          }}
        />
      ) : (
        /* RUNNING SYSTEM CORE INTERFACES LAYOUT */
        currentUser.mustChangePassword ? (
          <PasswordChangeGate user={currentUser} onChangePassword={handlePasswordChange} onLogout={handlePlatformLogout} />
        ) : needsLinkedRecord(currentUser) ? (
          <div className="h-screen flex overflow-hidden">
            <Sidebar
              user={currentUser}
              currentTenant={currentTenant}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                secureSetActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onLogout={handlePlatformLogout}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              isMobileOpen={isMobileMenuOpen}
              setIsMobileOpen={setIsMobileMenuOpen}
              simpleMode={isSimpleMode}
            />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              <Navbar
                user={currentUser}
                currentTenant={currentTenant}
                activeTab={activeTab}
                schools={schools}
                onSwitchTenant={handleContextSwitch}
                isSidebarCollapsed={isSidebarCollapsed}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                simpleMode={isSimpleMode}
                setSimpleMode={setIsSimpleMode}
              />
              <div className="app-content flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3.5 pb-24 sm:px-5 md:pb-6 lg:px-7 lg:py-6">
                <AccountLinkRequiredPanel user={currentUser} onLogout={handlePlatformLogout} />
              </div>
            </div>
          </div>
        ) : (
        <div className="h-screen flex overflow-hidden">
          
          {/* NAVY LEFT SIDEBAR */}
          <Sidebar 
            user={currentUser}
            currentTenant={currentTenant}
            activeTab={activeTab}
            setActiveTab={(tab) => {
              secureSetActiveTab(tab);
              setIsMobileMenuOpen(false); // Close mobile menu drawer on selection
            }}
            onLogout={handlePlatformLogout}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            isMobileOpen={isMobileMenuOpen}
            setIsMobileOpen={setIsMobileMenuOpen}
            simpleMode={isSimpleMode}
          />

          {/* MAIN PAGE SEGMENT */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* TOP NAVIGATION HEADER */}
            <Navbar 
              user={currentUser}
              currentTenant={currentTenant}
              activeTab={activeTab}
              schools={schools}
              onSwitchTenant={handleContextSwitch}
              onStartTour={() => {
                setTourStep(0);
                setIsTourOpen(true);
              }}
              isSidebarCollapsed={isSidebarCollapsed}
              isMobileMenuOpen={isMobileMenuOpen}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
              simpleMode={isSimpleMode}
              setSimpleMode={setIsSimpleMode}
            />

            {/* SCROLLABLE CENTRAL CONTENT FRAME */}
            <div className="app-content flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3.5 pb-24 sm:px-5 md:pb-6 lg:px-7 lg:py-6">
              <PortalAssistBar
                role={currentUser.role}
                language={portalLanguage}
                setLanguage={setPortalLanguage}
                simpleMode={isSimpleMode}
                setActiveTab={secureSetActiveTab}
                fontScale={fontScale}
                setFontScale={setFontScale}
                bigMode={bigMode}
                setBigMode={setBigMode}
                activeTab={activeTab}
              />
              <OfflineSyncStatus />
              {currentTenant && (
                <AcademicTimeScopeBar tenantId={currentTenant.id} role={currentUser.role} />
              )}
              <FirstTimeSetupWizard
                role={currentUser.role}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <DashboardCleanupPanel compact={compactDashboard} setCompact={setCompactDashboard} />
              <FormValidationGuidePanel
                role={currentUser.role}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <UniversalTodayPanel
                role={currentUser.role}
                tenantId={currentTenant?.id}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <NotificationCenterPanel
                role={currentUser.role}
                tenantId={currentTenant?.id}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <ManagerApprovalPanel role={currentUser.role} tenantId={currentTenant?.id} />
              <SchoolBackupRestorePanel role={currentUser.role} tenantId={currentTenant?.id} />
              {!compactDashboard && (
                <>
                  <UnreadStatusPanel
                    role={currentUser.role}
                    tenantId={currentTenant?.id}
                    setActiveTab={(tab) => {
                      secureSetActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  <FormCoachPanel
                    role={currentUser.role}
                    setActiveTab={(tab) => {
                      secureSetActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </>
              )}
              <CompleteTodayChecklist
                role={currentUser.role}
                tenantId={currentTenant?.id}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <RoleReportsPanel
                role={currentUser.role}
                tenantId={currentTenant?.id}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              <PrintExportCenter
                role={currentUser.role}
                tenantId={currentTenant?.id}
                setActiveTab={(tab) => {
                  secureSetActiveTab(tab);
                  setIsMobileMenuOpen(false);
                }}
              />
              {!compactDashboard && <SimpleProofTrailPanel role={currentUser.role} tenantId={currentTenant?.id} />}
              {isSimpleMode && (
                <>
                  <SimplePageStart
                    activeTab={activeTab}
                    role={currentUser.role}
                    recentTabs={recentTabs}
                    currentTenant={currentTenant}
                    setActiveTab={(tab) => {
                      secureSetActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  <TaskModePanel
                    role={currentUser.role}
                    setActiveTab={(tab) => {
                      secureSetActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                  <SchoolWorkflowMap
                    role={currentUser.role}
                    setActiveTab={(tab) => {
                      secureSetActiveTab(tab);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                </>
              )}
              
              <div id="page-live-content" className="scroll-mt-4">
              <PageErrorBoundary
                resetKey={`${currentUser.role}:${activeTab}`}
                homeLabel="Dashboard"
                onGoHome={() => secureSetActiveTab(getSafeTabForRole(currentUser.role))}
                onReload={() => window.location.reload()}
              >              {/* INTERRUPT LAYER FOR SUSPENDED/EXPIRED SCHOOL WORKSPACES */}
              {!canAccessTab(currentUser, activeTab) ? (
                <AccessDeniedPanel
                  user={currentUser}
                  activeTab={activeTab}
                  onGoHome={() => setActiveTab(getSafeTabForRole(currentUser.role))}
                  onLogout={handlePlatformLogout}
                />
              ) : currentUser.role !== 'SuperAdmin' && currentTenant && (currentTenant.status === 'Suspended' || subscriptions.find(s => s.tenantId === currentTenant.id && (s.status === 'Suspended' || s.status === 'Expired' || s.status === 'Cancelled'))) ? (
                <div className="w-full max-w-3xl mx-auto my-6 sm:my-10 bg-white border border-rose-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-sm">
                  <div className="bg-rose-600 p-5 text-white flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-12 h-12 bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-black uppercase tracking-widest text-rose-100">Workspace locked</p>
                      <h3 className="text-lg sm:text-xl font-black tracking-tight">Subscription access is frozen</h3>
                      <p className="text-xs text-rose-100 mt-1 break-words">{currentTenant.name} ({currentTenant.code})</p>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 space-y-5 text-slate-700">
                    <div className="bg-rose-50 border border-rose-200 p-4">
                      <p className="font-bold text-slate-900 leading-relaxed">
                        This school's subscription is suspended, expired, or cancelled. Teacher work, attendance, AI tools, fees, messages, parent access, and student records are locked until the account is restored.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Current status</p>
                        <p className="mt-2 text-base font-black text-rose-700 uppercase">{subscriptions.find(s => s.tenantId === currentTenant.id)?.status || currentTenant.status}</p>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">School code</p>
                        <p className="mt-2 text-base font-black text-slate-900">{currentTenant.code}</p>
                      </div>
                      <div className="border border-slate-200 bg-slate-50 p-4">
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">Package</p>
                        <p className="mt-2 text-base font-black text-slate-900">{currentTenant.subscriptionPackage}</p>
                      </div>
                    </div>

                    <div className="border border-slate-200 p-4">
                      <p className="font-black text-slate-900">How to restore access</p>
                      <ol className="mt-3 space-y-2 text-xs sm:text-sm leading-relaxed list-decimal list-inside text-slate-600">
                        <li>Contact EduCore billing at <strong className="text-blue-700">billing@educore.ai</strong>.</li>
                        <li>Submit the payment or renewal confirmation.</li>
                        <li>A Super Admin can reactivate the school from the subscription panel.</li>
                      </ol>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={handlePlatformLogout}
                        className="flex-1 px-4 py-3 border border-slate-300 bg-white text-slate-800 font-black hover:bg-slate-50 transition-colors"
                      >
                        Log Out of Portal
                      </button>
                      <button
                        onClick={() => {
                          const sub = subscriptions.find(s => s.tenantId === currentTenant.id);
                          if (sub) {
                            setSubscriptions(subscriptions.map(s => s.id === sub.id ? { ...s, status: 'Active' } : s));
                          }
                          setSchools(schools.map(s => s.id === currentTenant.id ? { ...s, status: 'Active' } : s));
                          setCurrentTenant({ ...currentTenant, status: 'Active' });
                        }}
                        className="flex-1 px-4 py-3 bg-rose-600 text-white font-black hover:bg-rose-700 transition-colors"
                      >
                        Simulate Bill Renewal Payment
                      </button>
                    </div>
                  </div>
                </div>              ) : (
                <>
                  {/* SUPER ADMIN CONSOLE PAGES ROUTER */}
                  {currentUser.role === 'SuperAdmin' && (
                    <>
                      {activeTab === 'dashboard' && (
                        <SuperAdminDashboard 
                          schools={schools}
                          users={allUsers}
                          activityLogs={activityLogs}
                          setActiveTab={secureSetActiveTab}
                          onTriggerAction={handleSimulateQuickCommand}
                          simpleMode={isSimpleMode}
                        />
                      )}

                      {activeTab === 'edu-ecosystem' && (
                        <EduCoreEcosystemView schools={schools} currentUser={currentUser} />
                      )}

                      {activeTab === 'commercial-hub' && (
                        <EduCoreCommercialHub schools={schools} currentUser={currentUser} />
                      )}

                      {activeTab === 'eduos-engine' && (
                        <EduOSCommandCenter schools={schools} currentUser={currentUser} />
                      )}

                      {activeTab === 'register' && (
                        <RegisterSchoolForm 
                          onSuccess={handleDeployNewSchoolNode}
                          existingSchools={schools}
                        />
                      )}

                      {activeTab === 'schools' && (
                        <div className="space-y-6">
                          <div className="bg-white rounded border border-banking-border p-5">
                            <h2 className="text-sm font-bold tracking-tight font-display text-slate-900 leading-none">
                               Institutional Registry Index Ledger
                            </h2>
                            <p className="text-xs text-slate-400 mt-1.5">
                               Comprehensive index list of deployed school instances. Block row-queries or tunnel across isolated nodes.
                            </p>
                          </div>

                          <SchoolsTable 
                            schools={schools}
                            onToggleStatus={handleToggleSchoolDatabaseStatus}
                            onEnterWorkspace={(id) => handleContextSwitch(id)}
                          />
                        </div>
                      )}

                      {activeTab === 'sa-tenants' && (
                        <SuperAdminTenantView 
                          schools={schools}
                          onToggleStatus={handleToggleSchoolDatabaseStatus}
                          onUpdateSchool={(updatedSchool) => {
                            const nextSchools = schools.map(s => s.id === updatedSchool.id ? updatedSchool : s);
                            setSchools(nextSchools);
                            saveSchoolsInStorage(nextSchools);
                            
                            // Append to audit trail log
                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: updatedSchool.id,
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'Tenant Properties Modified',
                              details: `Super Admin customized subscription plan models for code ${updatedSchool.code}. Configured status to ${updatedSchool.status}`,
                              ipAddress: '127.0.0.1',
                              device: 'Web Client Portal console',
                              timestamp: new Date().toISOString(),
                              module: 'Tenant'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`School details saved successfully.`, 'success');
                          }}
                          onDeleteSchool={(schoolId) => {
                            const targetSchool = schools.find(s => s.id === schoolId);
                            const nextSchools = schools.filter(s => s.id !== schoolId);
                            setSchools(nextSchools);
                            saveSchoolsInStorage(nextSchools);

                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: 'GLOBAL',
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'Tenant Clusters Wiped',
                              details: `Force deleted database namespace and cluster assets for tenant: ${targetSchool?.name || schoolId}`,
                              ipAddress: '127.0.0.1',
                              device: 'Web Client Portal console',
                              timestamp: new Date().toISOString(),
                              module: 'Tenant'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`School record removed successfully.`, 'info');
                          }}
                          subscriptions={subscriptions}
                          onUpdateSubscription={(updatedSub) => {
                            const nextSubs = subscriptions.map(sub => sub.id === updatedSub.id ? updatedSub : sub);
                            setSubscriptions(nextSubs);
                            
                            // Create associated billing record receipt
                            const pck = packages.find(p => p.id === updatedSub.packageId) || packages[0];
                            const amount = updatedSub.billingCycle === 'Yearly' ? pck.priceYearly : pck.priceMonthly;
                            
                            const newBill: BillingRecord = {
                              id: `inv_cc_${Date.now()}`,
                              tenantId: updatedSub.tenantId,
                              invoiceNumber: `INV-${new Date().getFullYear()}-RENEW-${Math.floor(Math.random() * 9000) + 1000}`,
                              amount,
                              cycle: updatedSub.billingCycle,
                              packageName: pck.name,
                              issueDate: new Date().toISOString().split('T')[0],
                              dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                              paymentDate: updatedSub.status === 'Active' ? new Date().toISOString().split('T')[0] : undefined,
                              status: updatedSub.status === 'Active' ? 'Paid' : 'Unpaid',
                              paymentMethod: 'Automatic SaaS Clearing'
                            };

                            setBillingRecords([newBill, ...billingRecords]);

                            // Log to audit trails
                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: updatedSub.tenantId,
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'Subscription Package Configured',
                              details: `Upgraded/renewed subscription package to ${pck.name} (${updatedSub.billingCycle}). Billing status: ${updatedSub.status}`,
                              ipAddress: '127.0.0.1',
                              device: 'Web Client Portal console',
                              timestamp: new Date().toISOString(),
                              module: 'Financial'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`Pricing plan saved successfully.`, 'success');
                          }}
                          packages={packages}
                        />
                      )}

                      {activeTab === 'sa-subscriptions' && (
                        <SuperAdminSubscriptionView 
                          packages={packages}
                          onAddPackage={(newPkg) => {
                            setPackages([...packages, newPkg]);
                            
                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: 'GLOBAL',
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'Commercial Package Created',
                              details: `Super Admin created custom price plan option: ${newPkg.name}. Configured Monthly rate: $${newPkg.priceMonthly}, Student cap: ${newPkg.studentLimit}`,
                              ipAddress: '127.0.0.1',
                              device: 'Web Client Portal console',
                              timestamp: new Date().toISOString(),
                              module: 'Financial'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`Pricing package created successfully.`, 'success');
                          }}
                          onDeletePackage={(pkgId) => {
                            setPackages(packages.filter(p => p.id !== pkgId));
                            triggerToast(`Deallocated custom packaging module.`, 'info');
                          }}
                          billingRecords={billingRecords}
                          subscriptions={subscriptions}
                          schools={schools}
                        />
                      )}

                      {activeTab === 'sa-audit-security' && (
                        <SuperAdminAuditView 
                          auditLogs={saAuditLogs}
                          loginHistory={loginHistory}
                          securityPolicy={securityPolicy}
                          onUpdatePolicy={(updatedPolicy) => {
                            setSecurityPolicy(updatedPolicy);
                            
                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: 'GLOBAL',
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'Security Access Control Policy Enforced',
                              details: `Configured system credentials min-length requirements to ${updatedPolicy.minPasswordLength}. Required special: ${updatedPolicy.requireSpecialChars ? 'Yes' : 'No'}, 2FA gate rules: ${updatedPolicy.twoFactorAuth}`,
                              ipAddress: '127.0.0.1',
                              device: 'Web Client Portal console',
                              timestamp: new Date().toISOString(),
                              module: 'System'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`Enforced global IAM security matrix.`, 'success');
                          }}
                          schools={schools}
                        />
                      )}

                      {activeTab === 'sa-system-ops' && (
                        <SuperAdminSystemView 
                          backupRecords={backupRecords}
                          onTriggerBackup={(newBackup) => {
                            setBackupRecords([newBackup, ...backupRecords]);
                            
                            const freshAudit: AuditLog = {
                              id: `audit_${Date.now()}`,
                              tenantId: 'GLOBAL',
                              userId: currentUser.id,
                              userName: currentUser.name,
                              userEmail: currentUser.email,
                              userRole: currentUser.role,
                              action: 'System Database Snapshot hot-run',
                              details: `Manually initiated database backup of target element: ${newBackup.target}. Archive compiled size: ${newBackup.sizeMB} MB`,
                              ipAddress: '127.0.0.1',
                              device: 'System automated hot dump container daemon',
                              timestamp: new Date().toISOString(),
                              module: 'System'
                            };
                            setSaAuditLogs([freshAudit, ...saAuditLogs]);
                            triggerToast(`Success! Prepared database schema and files snapshot backup.`, 'success');
                          }}
                          integrationSettings={integrationSettings}
                          onUpdateIntegration={(updatedSetting) => {
                            const nextSettings = integrationSettings.map(g => g.id === updatedSetting.id ? updatedSetting : g);
                            setIntegrationSettings(nextSettings);
                            
                            if (updatedSetting.status === 'Connected') {
                              // Append to audit
                              const freshAudit: AuditLog = {
                                id: `audit_${Date.now()}`,
                                tenantId: 'GLOBAL',
                                userId: currentUser.id,
                                userName: currentUser.name,
                                userEmail: currentUser.email,
                                userRole: currentUser.role,
                                action: 'API Gateway Connection Tested',
                                details: `Successfully tested communication endpoints gateway matching vendor: ${updatedSetting.provider}. Masked API keys checked.`,
                                ipAddress: '127.0.0.1',
                                device: 'Web Client Portal console',
                                timestamp: new Date().toISOString(),
                                module: 'System'
                              };
                              setSaAuditLogs([freshAudit, ...saAuditLogs]);
                              triggerToast(`Communication setting checked successfully: ${updatedSetting.name}`, 'success');
                            }
                          }}
                          systemHealth={systemHealth}
                          deploymentChecklist={deploymentChecklist}
                          onUpdateDeploymentChecklist={(updatedChecklist) => {
                            setDeploymentChecklist(updatedChecklist);
                            triggerToast(`Refreshed infrastructure readiness checkpoints.`, 'info');
                          }}
                          schools={schools}
                        />
                      )}

                      {activeTab === 'sa-support-tickets' && (
                        <SuperAdminSupportView 
                          tickets={supportTickets}
                          onAddTicket={(newTicket) => {
                            setSupportTickets([...supportTickets, newTicket]);
                            triggerToast(`Simulated customer support ticket filed on behalf of ${newTicket.schoolName}.`, 'success');
                          }}
                          onUpdateTicket={(updatedTicket) => {
                            const nextTickets = supportTickets.map(t => t.id === updatedTicket.id ? updatedTicket : t);
                            setSupportTickets(nextTickets);
                            triggerToast(`Saved support ticket updates successfully.`, 'success');
                          }}
                          schools={schools}
                          currentUser={currentUser}
                        />
                      )}

                      {activeTab === 'roles' && (
                        <RoleManagement 
                          currentTenant={schools[0]} // Defaults context to Central Crest to show demo global roles configuration
                          users={allUsers}
                          currentUser={currentUser}
                          schools={schools}
                          onAddUser={handleAddLocalTenantUser}
                          onUpdateUser={handleUpdateLocalTenantUser}
                          onDeleteUser={handleRevokeLocalTenantUser}
                        />
                      )}

                      {activeTab === 'settings' && (
                        <SettingsPanel 
                          user={currentUser}
                          currentTenant={null}
                          onSaveNotification={(msg) => triggerToast(msg, 'success')}
                        />
                      )}
                    </>
                  )}

              {/* SCHOOL ADMIN VIRTUAL ENVIRONMENT PAGES ROUTER */}
              {['SchoolAdmin', 'Accountant', 'Supervisor', 'AssistantAdmin'].includes(currentUser.role) && (
                <>
                  {activeTab === 'school-dashboard' && (
                    <SchoolAdminDashboard 
                      currentTenant={currentTenant}
                      users={allUsers}
                      onTriggerAlert={(msg) => triggerToast(msg, 'success')}
                      simpleMode={isSimpleMode}
                      setActiveTab={secureSetActiveTab}
                    />
                  )}

                  {activeTab === 'edu-ecosystem' && (
                    <EduCoreEcosystemView schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'commercial-hub' && (
                    <EduCoreCommercialHub schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'eduos-engine' && (
                    <EduOSCommandCenter schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'school-teachers' && (
                    <TeachersManagement 
                      tenantId={currentTenant?.id || ''}
                      setActiveTab={secureSetActiveTab}
                    />
                  )}

                  {activeTab === 'school-students' && (
                    <StudentsManagement 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-classes' && (
                    <ClassesManagement 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-subjects' && (
                    <SubjectsManagement 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-departments' && (
                    <DepartmentsManagement 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-academic-year' && (
                    <AcademicSettings 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-users' && (
                    <RoleManagement
                      currentTenant={currentTenant}
                      users={allUsers}
                      currentUser={currentUser}
                      schools={schools}
                      onAddUser={handleAddLocalTenantUser}
                      onUpdateUser={handleUpdateLocalTenantUser}
                      onDeleteUser={handleRevokeLocalTenantUser}
                    />
                  )}

                  {activeTab === 'school-permissions' && (
                    <RolePermissions 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-import' && (
                    <BulkImport 
                      tenantId={currentTenant?.id || ''}
                    />
                  )}

                  {activeTab === 'school-review' && (
                    <SchoolHeadReview 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'school-log' && (
                    <DailyActivityLog 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'school-settings' && (
                    <SettingsPanel 
                      user={currentUser}
                      currentTenant={currentTenant}
                      onSaveNotification={(msg) => triggerToast(msg, 'success')}
                    />
                  )}

                  {activeTab === 'school-ai-suite' && (
                    <AISuite 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'school-fees' && (
                    <FeesManagement 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}

                  {activeTab === 'school-comm' && (
                    <CommunicationCenter 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}

                  {activeTab === 'school-calendar' && (
                    <SchoolCalendarView 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}
                </>
              )}

              {/* TEACHER VIRTUAL ENVIRONMENT WORKSPACE PAGES ROUTER */}
              {currentUser.role === 'Teacher' && (
                <>
                  {activeTab === 'teacher-dashboard' && (
                    <TeacherDashboard 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                      setActiveTab={secureSetActiveTab}
                    />
                  )}

                  {activeTab === 'edu-ecosystem' && (
                    <EduCoreEcosystemView schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'commercial-hub' && (
                    <EduCoreCommercialHub schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'eduos-engine' && (
                    <EduOSCommandCenter schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'teacher-assignments' && (
                    <AssignmentManagement 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'teacher-attendance' && (
                    <AttendanceManagement 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'teacher-lessons' && (
                    <LessonRecords 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'teacher-materials' && (
                    <TeachingMaterials 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'teacher-log' && (
                    <DailyActivityLog 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}

                  {activeTab === 'teacher-ai-suite' && (
                    <AISuite 
                      user={currentUser}
                      currentTenant={currentTenant || {} as School}
                    />
                  )}
                </>
              )}

              {/* PARENT VIRTUAL WORKSPACE ROUTER */}
              {currentUser.role === 'Parent' && (
                <>
                  {activeTab === 'parent-dashboard' && (
                    <ParentDashboardView 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}
                  
                  {activeTab === 'edu-ecosystem' && (
                    <EduCoreEcosystemView schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'commercial-hub' && (
                    <EduCoreCommercialHub schools={schools} currentUser={currentUser} />
                  )}
                  
                  {activeTab === 'eduos-engine' && (
                    <EduOSCommandCenter schools={schools} currentUser={currentUser} />
                  )}
                  
                  {activeTab === 'school-calendar' && (
                    <SchoolCalendarView 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}
                </>
              )}

              {/* STUDENT VIRTUAL WORKSPACE ROUTER */}
              {currentUser.role === 'Student' && (
                <>
                  {activeTab === 'student-dashboard' && (
                    <StudentDashboardView 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}

                  {activeTab === 'edu-ecosystem' && (
                    <EduCoreEcosystemView schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'commercial-hub' && (
                    <EduCoreCommercialHub schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'eduos-engine' && (
                    <EduOSCommandCenter schools={schools} currentUser={currentUser} />
                  )}

                  {activeTab === 'school-calendar' && (
                    <SchoolCalendarView 
                      user={currentUser}
                      currentTenant={currentTenant}
                    />
                  )}
                </>
              )}
              {canAccessTab(currentUser, activeTab) && !hasRenderedPageForRole(currentUser.role, activeTab) && (
                <PageRouteFallback
                  activeTab={activeTab}
                  onGoHome={() => secureSetActiveTab(getSafeTabForRole(currentUser.role))}
                />
              )}
                </>
              )}
              </PageErrorBoundary>
              </div>
            </div>

            <MobileBottomNav
              role={currentUser.role}
              activeTab={activeTab}
              setActiveTab={(tab) => {
                secureSetActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
            />

            <FloatingHelpButton
              activeTab={activeTab}
              role={currentUser.role}
              bigMode={bigMode}
              setBigMode={setBigMode}
              setActiveTab={(tab) => {
                secureSetActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
            />

          </div>

        </div>
        )
      )}

      {/* INTERACTIVE ONBOARDING GUIDED-TOUR OVERLAY */}
      <GuidedTour 
        isOpen={isTourOpen}
        onClose={() => {
          setIsTourOpen(false);
          localStorage.setItem("educore_tour_completed", "true");
          triggerToast("Tour completed. You can start it again from the top tools button.", "success");
        }}
        schools={schools}
        allUsers={allUsers}
        onTriggerSession={(user, tenant, targetTab) => {
          setCurrentUser(user);
          setCurrentTenant(tenant);
          setActiveTab(targetTab);
        }}
        currentUserId={currentUser?.id}
        activeTab={activeTab}
        currentStep={tourStep}
        setCurrentStep={setTourStep}
      />

    </div>
  );
}









