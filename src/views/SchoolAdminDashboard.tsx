/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  FileSpreadsheet, 
  Calendar, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ClipboardCheck,
  Award,
  AlertCircle,
  FolderOpen,
  Cpu, 
  HelpCircle,
  Database
} from 'lucide-react';
import { School, User } from '../types';
import { CENTRAL_CREST_DASHBOARD_STATS, DEFAULT_SCHOOL_DASHBOARD_STATS } from '../data/mockData';
import StatCard from '../components/StatCard';

interface SchoolAdminDashboardProps {
  currentTenant: School | null;
  users: User[];
  onTriggerAlert: (msg: string) => void;
  simpleMode?: boolean;
  setActiveTab?: (tab: string) => void;
}

export default function SchoolAdminDashboard({
  currentTenant,
  users,
  onTriggerAlert,
  simpleMode = true,
  setActiveTab
}: SchoolAdminDashboardProps) {
  
  const [activeReviewTab, setActiveReviewTab] = useState<'assignments' | 'reports'>('assignments');

  // Load context specific metrics. Fallback to generic if registering custom school
  const stats = currentTenant?.id === 'school_central_crest' 
    ? CENTRAL_CREST_DASHBOARD_STATS 
    : {
        ...DEFAULT_SCHOOL_DASHBOARD_STATS,
        totalTeachers: currentTenant?.teacherCount || 12,
        totalStudents: currentTenant?.studentCount || 180,
        totalClasses: currentTenant?.classCount || 6,
      };

  // Local state for school attendance charts
  const attendanceChart = stats.classAttendanceData;

  // Filter local users strictly as sub-demographics
  const localTeachers = users.filter(u => u.tenantId === currentTenant?.id && u.role === 'Teacher');
  const localStudents = users.filter(u => u.tenantId === currentTenant?.id && u.role === 'Student');

  return (
    <div className="space-y-4 sm:space-y-6 font-sans select-none animate-in fade-in duration-200 max-w-full">
      
      {/* CONTEXT SCHOOL OVERVIEW HERO */}
      <div className="bg-white rounded-2xl sm:rounded-lg border border-banking-border p-4 sm:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 opacity-[0.03] translate-x-12 -translate-y-8 select-none pointer-events-none">
          <BookOpen className="w-56 h-56 text-blue-900" />
        </div>

        <div className="z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono bg-blue-50 text-[#1A56DB] px-2 py-0.5 rounded border border-blue-100 font-bold uppercase">
               {simpleMode ? 'Manager / Head Account' : 'Virtual Deployed Workspace'}
            </span>
            <span className="text-[10px] items-center gap-1 font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold hidden sm:flex">
               <Database className="w-2.5 h-2.5" /> SECURE_TENANT: {currentTenant?.id}
            </span>
          </div>
          <h2 className="text-[1.55rem] sm:text-xl font-black sm:font-bold font-display text-slate-900 tracking-tight mt-2.5 leading-tight">
             {currentTenant?.name || 'School Dashboard'}
          </h2>
          <p className="text-[13px] sm:text-xs text-slate-550 mt-1 max-w-2xl leading-relaxed">
              {simpleMode ? 'Manage students, teachers, fees, attendance, lessons, messages, and school reports.' : 'Manager / Head console. Managing academics, rosters, terms config, and isolated secure student data.'}
          </p>
        </div>

        <div className="flex items-center justify-between gap-2.5 z-10 shrink-0 bg-slate-50 sm:bg-transparent border sm:border-0 border-slate-100 rounded-xl sm:rounded-none p-3 sm:p-0">
          <div className="text-left sm:text-right">
             <p className="text-[10px] font-mono font-bold text-slate-400">{simpleMode ? 'SCHOOL CODE' : 'DEPLOYED REGISTRY'}</p>
             <p className="text-xs font-bold text-slate-800 uppercase mt-0.5">{currentTenant?.code || 'LOCAL'}</p>
          </div>
          <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 text-[#1A56DB] font-display font-bold text-lg rounded shadow-sm flex items-center justify-center select-none uppercase">
             {currentTenant?.logo || 'SC'}
          </div>
        </div>
      </div>

      {simpleMode && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Students', hint: 'View student records', icon: Users },
            { label: 'Teachers', hint: 'Manage teachers', icon: Cpu },
            { label: 'Fees', hint: 'Payments and bills', icon: FileSpreadsheet },
            { label: 'Messages', hint: 'Contact parents', icon: Sparkles },
          ].map((action) => {
            const Icon = action.icon;
            const tab = action.label === 'Students' ? 'school-students' : action.label === 'Teachers' ? 'school-teachers' : action.label === 'Fees' ? 'school-fees' : 'school-comm';
            return (
              <button
                key={action.label}
                onClick={() => setActiveTab?.(tab)}
                className="bg-white rounded-2xl sm:rounded-xl border border-slate-200 p-4 text-left shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              >
                <span className="w-11 h-11 rounded-2xl border border-blue-100 bg-blue-50 text-[#1A56DB] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="block text-sm font-black text-slate-900">{action.label}</span>
                <span className="block text-[11px] text-slate-500 mt-1 leading-snug">{action.hint}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* CORE SCHOOL KPI METRICS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StatCard
          title={simpleMode ? 'Students' : 'Total Students Enrolled'}
          value={stats.totalStudents}
          icon={Users}
          iconBg="bg-blue-50 text-blue-600"
          iconColor="#1A56DB"
          trend={{ value: simpleMode ? 'Active' : 'Cohort A', isPositive: true, label: simpleMode ? 'in school' : 'Verified roster' }}
        />
        <StatCard
          title={simpleMode ? 'Teachers' : 'Total Faculty / Teachers'}
          value={stats.totalTeachers}
          icon={Cpu}
          iconBg="bg-purple-50 text-purple-600"
          iconColor="#8B5CF6"
          trend={{ value: 'Full-time', label: simpleMode ? 'staff' : '100% certified' }}
        />
        <StatCard
          title={simpleMode ? 'Classes' : 'Active Course Classes'}
          value={stats.totalClasses}
          icon={BookOpen}
          iconBg="bg-indigo-50 text-indigo-600"
          iconColor="#4F46E5"
          trend={{ value: simpleMode ? 'Ready' : 'Syllabus Ok', isPositive: true, label: simpleMode ? 'this term' : 'Term term schedule' }}
        />
        <StatCard
          title={simpleMode ? 'Attendance' : 'Consolidated Attendance'}
          value={stats.attendanceSubmittedToday}
          icon={ClipboardCheck}
          iconBg="bg-emerald-50 text-emerald-600"
          iconColor="#10B981"
          trend={{ value: simpleMode ? 'Today' : 'Daily sync', isPositive: true, label: 'submitted' }}
        />
      </div>

      {/* SECONDARY ROW: ACADEMIC COMPLIANCE STATUS METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-5">
         
         {/* KPI Metric 1: Assignments */}
         <div className="bg-white rounded-xl sm:rounded border border-banking-border p-4 flex items-center justify-between shadow-sm md:shadow-none">
           <div className="space-y-1">
             <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Daily Assignments Given</span>
             <p className="text-xl font-bold text-slate-900">{stats.assignmentsGivenToday} Quizzes</p>
           </div>
           <span className="text-[10px] bg-slate-50 border border-slate-250 text-slate-500 px-2 py-1 rounded">Stage 1 Ok</span>
         </div>

         {/* KPI Metric 2: Lesson Logs */}
         <div className="bg-white rounded-xl sm:rounded border border-banking-border p-4 flex items-center justify-between shadow-sm md:shadow-none">
           <div className="space-y-1">
             <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Lesson logs submitted</span>
             <p className="text-xl font-bold text-slate-900">{stats.lessonRecordsSubmittedToday} Blocks</p>
           </div>
           <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-1 rounded font-bold">Sync Safe</span>
         </div>

         {/* KPI Metric 3: Reports Pending Review */}
         <div className="bg-white rounded-xl sm:rounded border border-[#EF4444]/30 bg-rose-50/10 p-4 flex items-center justify-between shadow-sm md:shadow-none">
           <div className="space-y-1">
             <span className="text-[10px] font-mono text-rose-500 uppercase font-bold">Auditing Review queues</span>
             <p className="text-xl font-bold text-slate-900">{stats.reportsWaitingReview} Folders</p>
           </div>
           <span className="text-[10px] bg-rose-50 border border-rose-100 text-rose-600 font-bold px-2 py-1 rounded">Review Needed</span>
         </div>

      </div>

      {/* THREE COLUMN GRID: ATTENDANCE CHART, INTEGRATIONS REVIEWS, FACULTY STAFF */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* ATTENDANCE DETAILED SVG PROGRESS CHART */}
        <div className="bg-white rounded-xl sm:rounded border border-banking-border p-4 sm:p-5 flex flex-col justify-between shadow-sm md:shadow-none">
          <div className="pb-3 border-b border-slate-100">
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Class Attendance Distribution</h3>
             <p className="text-[10px] text-slate-400 mt-0.5">Average compliance rates across target cohorts</p>
          </div>

          {/* DYNAMIC SVG BAR VISUALIZER */}
          <div className="space-y-3 my-5">
             {attendanceChart.map((bar, i) => (
               <div key={bar.label} className="space-y-1">
                 <div className="flex items-center justify-between text-xs">
                   <span className="font-semibold text-slate-700">{bar.label}</span>
                   <span className="font-mono font-bold text-[#1A56DB]">{bar.value}%</span>
                 </div>
                 {/* Bar outline */}
                 <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[#1A56DB] rounded-full transition-all duration-500"
                     style={{ width: `${bar.value}%` }}
                   />
                 </div>
               </div>
             ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[9px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
             <span>COHORT ENUMERATION: COMPLETED</span>
             <span>VERIFIED ACTIVE STATUS</span>
          </div>
        </div>

        {/* MOCK SCHOOL ASSIGNMENTS & REPORTS REVIEW DRAWER */}
        <div className="bg-white rounded-xl sm:rounded border border-banking-border p-4 sm:p-5 flex flex-col justify-between shadow-sm md:shadow-none">
          <div>
            <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
               <div className="flex gap-2 overflow-x-auto">
                 <button 
                   id="tab-switch-assignments"
                   onClick={() => setActiveReviewTab('assignments')}
                   className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b-2 cursor-pointer transition-all ${
                     activeReviewTab === 'assignments' ? 'border-[#1A56DB] text-slate-800' : 'border-transparent text-slate-400'
                   }`}
                 >
                   Assignments
                 </button>
                 <button 
                   id="tab-switch-reports"
                   onClick={() => setActiveReviewTab('reports')}
                   className={`text-xs font-bold uppercase tracking-wider pb-1.5 border-b-2 cursor-pointer transition-all ${
                     activeReviewTab === 'reports' ? 'border-[#1A56DB] text-slate-800' : 'border-transparent text-slate-400'
                   }`}
                 >
                   Reports ({stats.reportsWaitingReview})
                 </button>
               </div>
               
               <span className="text-[9px] font-mono text-slate-400 self-start sm:self-auto">QUEUE_ACTIVE</span>
            </div>

            {activeReviewTab === 'assignments' ? (
              /* Assignments queues */
              <div className="divide-y divide-slate-100 py-1 space-y-3 mt-3">
                 <div className="pt-2 flex items-start gap-2.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] mt-2 shrink-0" />
                   <div>
                     <h4 className="text-xs font-bold text-slate-800 leading-tight">Advanced Calculus Chapter 2 Quiz</h4>
                     <p className="text-[10px] text-slate-400 mt-1">Given by Marcus Brody • Class 11A • Due Tomorrow</p>
                   </div>
                 </div>

                 <div className="pt-3 flex items-start gap-2.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                   <div>
                     <h4 className="text-xs font-bold text-slate-700 leading-tight">Biology Lab Report: Cellular mitosis</h4>
                     <p className="text-[10px] text-slate-400 mt-1">Given by Elizabeth Vance • Grade 10B • Due in 3 days</p>
                   </div>
                 </div>

                 <div className="pt-3 flex items-start gap-2.5">
                   <span className="w-1.5 h-1.5 rounded-full bg-[#1A56DB] mt-2 shrink-0" />
                   <div>
                     <h4 className="text-xs font-bold text-slate-800 leading-tight">Civics and Leadership Reflection Statement</h4>
                     <p className="text-[10px] text-slate-400 mt-1">Given by Principal Office • Grade 12 • Pending submission</p>
                   </div>
                 </div>
              </div>
            ) : (
              /* Reports Waiting Review queues */
              <div className="divide-y divide-slate-100 py-1 space-y-3 mt-3">
                 <div className="pt-2 flex items-start gap-2 text-rose-500 shrink-0">
                   <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                   <div className="flex-1 min-w-0">
                     <h4 className="text-xs font-bold text-slate-800 leading-tight">Critical Roster Revision Approval</h4>
                     <p className="text-[10px] text-slate-500 mt-1">Grade 10 mathematics split proposal requires headmaster signature clearance.</p>
                   </div>
                 </div>

                 <div className="pt-3 flex items-start gap-2 text-amber-500 shrink-0">
                   <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                   <div className="flex-1 min-w-0">
                     <h4 className="text-xs font-bold text-slate-800 leading-tight">Q1 Consolidated Balance Sheet Index</h4>
                     <p className="text-[10px] text-slate-500 mt-1">Audit registry of school system subscriptions and book inventories ready.</p>
                   </div>
                 </div>
              </div>
            )}
          </div>

          <button
            id="btn-school-demo-review-alert"
            onClick={() => onTriggerAlert('Stage 1 Roster & Assignment details validated successfully.')}
            className="text-center text-xs font-bold text-[#1A56DB] hover:underline cursor-pointer mt-4"
          >
            Mark Queues Verified →
          </button>
        </div>

        {/* LOCAL SCHOOL STAFF MEMBERS (DYNAMIC ISOLATED TENANT FILTERING) */}
        <div className="bg-white rounded-xl sm:rounded border border-banking-border p-4 sm:p-5 flex flex-col justify-between shadow-sm md:shadow-none">
          <div>
            <div className="pb-3 border-b border-slate-100 flex items-center justify-between gap-2">
               <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">FACULTY ROSTER</h3>
               <span className="text-[9px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded">
                  ISOLATED COUNT: {localTeachers.length}
               </span>
            </div>

            <div className="divide-y divide-slate-100 my-4 flex-1">
              {localTeachers.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <FolderOpen className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                  <p className="text-xs font-semibold">No teachers enrolled in this workspace.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Use the Faculty Roles page to enroll new accounts.</p>
                </div>
              ) : (
                localTeachers.map((teacher) => (
                  <div key={teacher.id} className="py-2.5 flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-indigo-50 border border-indigo-150 text-[#1A56DB] flex items-center justify-center font-bold text-xs uppercase shadow-inner">
                      {teacher.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 leading-tight">{teacher.name}</div>
                      <p className="text-[9px] text-slate-400 font-mono mt-0.5 truncate">{teacher.department || 'Academic Staff'} • {teacher.email}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-150 rounded text-[9px] font-mono text-slate-400 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
             <span>ROW_ENCRYPT_SCOPE: {currentTenant?.code}</span>
             <span>100% PRIVATE WORKSPACE</span>
          </div>
        </div>

      </div>

    </div>
  );
}
