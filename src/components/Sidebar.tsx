/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Building2, 
  LayoutDashboard, 
  PlusCircle, 
  ListOrdered, 
  Users, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Database,
  Lock,
  Compass,
  FileText,
  Sliders,
  GraduationCap,
  Layers,
  BookOpen,
  Network,
  Calendar,
  FileUp,
  ClipboardList,
  CheckSquare,
  Library,
  Activity,
  History,
  Eye,
  FileSpreadsheet,
  Sparkles,
  Send,
  DollarSign,
  MessageSquare,
  Clock,
  CreditCard,
  Globe,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import { User, School } from '../types';
import { getTenantSettings } from '../data/mockData';

interface SidebarProps {
  user: User | null;
  currentTenant: School | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  setIsMobileOpen?: (open: boolean) => void;
  simpleMode?: boolean;
}

function getSidebarScrollTarget(tab: string, label: string) {
  const key = `${tab} ${label}`.toLowerCase();
  if (key.includes('fee') || key.includes('billing') || key.includes('payment')) return 'fees-section';
  if (key.includes('assignment') || key.includes('homework') || key.includes('task')) return 'assignments-section';
  if (key.includes('material') || key.includes('library')) return 'materials-section';
  if (key.includes('attendance') || key.includes('attend')) return 'attendance-section';
  if (key.includes('teacher') || key.includes('timetable') || key.includes('calendar')) return 'timetable-section';
  if (key.includes('message') || key.includes('communication')) return 'messages-section';
  return 'page-live-content';
}

export default function Sidebar({ 
  user, 
  currentTenant, 
  activeTab, 
  setActiveTab, 
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  setIsMobileOpen,
  simpleMode = true
}: SidebarProps) {
  const isSuperAdmin = user?.role === 'SuperAdmin';
  const isTeacher = user?.role === 'Teacher';
  const isSchoolAdmin = user?.role === 'SchoolAdmin';
  const tenantSettings = currentTenant ? getTenantSettings(currentTenant.id) : null;
  const brandInitials = isSuperAdmin ? 'EA' : tenantSettings?.schoolLogoInitials || currentTenant?.logo || 'SC';
  const brandColor = tenantSettings?.themeColor || '#1A56DB';
  const brandMotto = tenantSettings?.schoolMotto || 'SMART SCHOOL PORTAL';

  // Navigation schema for Super Admin
  const superAdminNav = [
    { id: 'dashboard', label: 'Central Overview', icon: LayoutDashboard, category: 'GLOBAL ADMIN' },
    { id: 'edu-ecosystem', label: 'Ecosystem & National Hub', icon: Globe, category: 'STAGE 8 ECOSYSTEM' },
    { id: 'commercial-hub', label: 'Marketplace & Investors', icon: TrendingUp, category: 'STAGE 9 COMMERCIAL' },
    { id: 'eduos-engine', label: 'National EduOS Command', icon: Compass, category: 'STAGE 10 EduOS' },
    { id: 'register', label: 'Deploy School Node', icon: PlusCircle, category: 'GLOBAL ADMIN' },
    { id: 'schools', label: 'Institutional Registry', icon: ListOrdered, category: 'GLOBAL ADMIN' },
    { id: 'sa-tenants', label: 'Tenant Directory', icon: Building2, category: 'SaaS SYSTEM CONTROLS' },
    { id: 'sa-subscriptions', label: 'SaaS Subscriptions', icon: CreditCard, category: 'SaaS SYSTEM CONTROLS' },
    { id: 'sa-audit-security', label: 'Compliance & Security', icon: ShieldAlert, category: 'SaaS SYSTEM CONTROLS' },
    { id: 'sa-system-ops', label: 'Systems & Backups', icon: Database, category: 'SaaS SYSTEM CONTROLS' },
    { id: 'sa-support-tickets', label: 'Customer Helpdesk', icon: MessageSquare, category: 'SaaS SYSTEM CONTROLS' },
    { id: 'roles', label: 'Global Role Config', icon: ShieldCheck, category: 'GLOBAL CONFIG' },
    { id: 'settings', label: 'Core Plate Settings', icon: Sliders, category: 'GLOBAL CONFIG' },
  ];

  // Navigation schema for School Head (School Admin)
  const schoolAdminNav = [
    { id: 'school-dashboard', label: 'Tenant Overview', icon: LayoutDashboard, category: 'CORE MONITOR' },
    { id: 'edu-ecosystem', label: 'Ecosystem & National Hub', icon: Globe, category: 'STAGE 8 ECOSYSTEM' },
    { id: 'commercial-hub', label: 'Marketplace & Investors', icon: TrendingUp, category: 'STAGE 9 COMMERCIAL' },
    { id: 'eduos-engine', label: 'National EduOS Command', icon: Compass, category: 'STAGE 10 EduOS' },
    { id: 'school-review', label: 'Head Activity Review', icon: Eye, category: 'CORE MONITOR' },
    
    { id: 'school-teachers', label: 'Teachers Management', icon: GraduationCap, category: 'ACADEMIC ROSTER' },
    { id: 'school-students', label: 'Students Management', icon: Users, category: 'ACADEMIC ROSTER' },
    
    { id: 'school-classes', label: 'Classes Management', icon: Layers, category: 'SCHOOL MATRIX' },
    { id: 'school-subjects', label: 'Subjects Management', icon: BookOpen, category: 'SCHOOL MATRIX' },
    { id: 'school-departments', label: 'Departments', icon: Network, category: 'SCHOOL MATRIX' },
    
    { id: 'school-fees', label: 'Fees & Invoicing', icon: FileSpreadsheet, category: 'ADMIN FINANCIALS' },
    { id: 'school-comm', label: 'Communication Hub', icon: Send, category: 'ADMIN FINANCIALS' },
    { id: 'school-calendar', label: 'School Calendar', icon: Calendar, category: 'ADMIN FINANCIALS' },

    { id: 'school-academic-year', label: 'Academic Year & Term', icon: Calendar, category: 'SYSTEM CONTROL' },
    { id: 'school-users', label: 'Access Accounts', icon: ShieldCheck, category: 'SYSTEM CONTROL' },
    { id: 'school-permissions', label: 'Role Permissions', icon: ShieldCheck, category: 'SYSTEM CONTROL' },
    { id: 'school-import', label: 'Bulk Import Data', icon: FileUp, category: 'SYSTEM CONTROL' },
    { id: 'school-log', label: 'System Activity Log', icon: History, category: 'SYSTEM CONTROL' },

    { id: 'school-ai-suite', label: 'AI Academic Suite', icon: Sparkles, category: 'COGNITIVE INTELLIGENCE' },
  ];

  // Navigation schema for Faculty Teachers
  const teacherNav = [
    { id: 'teacher-dashboard', label: 'Teacher Dashboard', icon: LayoutDashboard, category: 'MY CLASSROOM' },
    { id: 'edu-ecosystem', label: 'Ecosystem & National Hub', icon: Globe, category: 'STAGE 8 ECOSYSTEM' },
    { id: 'commercial-hub', label: 'Marketplace & Investors', icon: TrendingUp, category: 'STAGE 9 COMMERCIAL' },
    { id: 'eduos-engine', label: 'National EduOS Command', icon: Compass, category: 'STAGE 10 EduOS' },
    { id: 'teacher-assignments', label: 'Assignment Manager', icon: ClipboardList, category: 'ACADEMIC CORE' },
    { id: 'teacher-attendance', label: 'Attendance Manager', icon: CheckSquare, category: 'ACADEMIC CORE' },
    { id: 'teacher-lessons', label: 'Daily Lesson Records', icon: BookOpen, category: 'ACADEMIC CORE' },
    { id: 'teacher-materials', label: 'Teaching Materials', icon: Library, category: 'RESOURCES' },
    { id: 'teacher-log', label: 'Daily Activity Log', icon: Activity, category: 'TRACKING' },

    { id: 'teacher-ai-suite', label: 'AI Academic Suite', icon: Sparkles, category: 'COGNITIVE INTELLIGENCE' },
  ];

  // Navigation schema for Parents Portal
  const parentNav = [
    { id: 'parent-dashboard', label: 'My Children Overview', icon: LayoutDashboard, category: 'PARENT PORTAL' },
    { id: 'edu-ecosystem', label: 'Ecosystem & National Hub', icon: Globe, category: 'STAGE 8 ECOSYSTEM' },
    { id: 'commercial-hub', label: 'Marketplace & Investors', icon: TrendingUp, category: 'STAGE 9 COMMERCIAL' },
    { id: 'eduos-engine', label: 'National EduOS Command', icon: Compass, category: 'STAGE 10 EduOS' },
    { id: 'school-calendar', label: 'School Calendar', icon: Calendar, category: 'INFORMATION' },
  ];

  // Navigation schema for Students Portal
  const studentNav = [
    { id: 'student-dashboard', label: 'My Academic Desktop', icon: LayoutDashboard, category: 'STUDENT PORTAL' },
    { id: 'edu-ecosystem', label: 'Ecosystem & National Hub', icon: Globe, category: 'STAGE 8 ECOSYSTEM' },
    { id: 'commercial-hub', label: 'Marketplace & Investors', icon: TrendingUp, category: 'STAGE 9 COMMERCIAL' },
    { id: 'eduos-engine', label: 'National EduOS Command', icon: Compass, category: 'STAGE 10 EduOS' },
    { id: 'school-calendar', label: 'School Calendar', icon: Calendar, category: 'INFORMATION' },
  ];

  // Select navigation schema based on user role
  const baseNav = isSuperAdmin 
    ? superAdminNav 
    : isTeacher 
      ? teacherNav 
      : user?.role === 'Parent'
        ? parentNav
        : user?.role === 'Student'
          ? studentNav
          : schoolAdminNav;

  const simpleVisibleIds: Record<string, string[]> = {
    SuperAdmin: ['dashboard', 'register', 'schools', 'roles', 'settings'],
    SchoolAdmin: ['school-dashboard', 'school-students', 'school-teachers', 'school-fees', 'school-comm', 'school-calendar', 'school-review', 'school-users'],
    Accountant: ['school-dashboard', 'school-fees', 'school-comm', 'school-calendar'],
    Supervisor: ['school-dashboard', 'school-review', 'school-students', 'school-teachers', 'school-classes', 'school-subjects', 'school-calendar'],
    AssistantAdmin: ['school-dashboard', 'school-students', 'school-teachers', 'school-fees', 'school-comm', 'school-calendar', 'school-review', 'school-users'],
    Teacher: ['teacher-dashboard', 'teacher-attendance', 'teacher-materials', 'teacher-ai-suite', 'teacher-assignments', 'teacher-lessons'],
    Parent: ['parent-dashboard', 'school-calendar'],
    Student: ['student-dashboard', 'school-calendar'],
  };

  const currentNav = simpleMode
    ? baseNav.filter(item => (simpleVisibleIds[user?.role || 'SchoolAdmin'] || []).includes(item.id))
    : baseNav;

  const simpleLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    register: 'Add School',
    schools: 'All Schools',
    'sa-tenants': 'Schools',
    'sa-subscriptions': 'Payments',
    'sa-audit-security': 'Security',
    'sa-system-ops': 'Backups',
    'sa-support-tickets': 'Help Desk',
    roles: 'Users',
    settings: 'Settings',
    'school-dashboard': 'Dashboard',
    'school-review': 'Teacher Review',
    'school-teachers': 'Teachers',
    'school-students': 'Students',
    'school-classes': 'Timetable',
    'school-subjects': 'Subjects',
    'school-departments': 'Departments',
    'school-fees': 'Fees',
    'school-comm': 'Messages',
    'school-calendar': 'Calendar',
    'school-academic-year': 'School Year',
    'school-users': 'Add Users',
    'school-permissions': 'User Access',
    'school-import': 'Import Data',
    'school-log': 'Activity',
    'school-settings': 'Settings',
    'school-ai-suite': 'AI Tools',
    'teacher-dashboard': 'Dashboard',
    'teacher-assignments': 'Assignments',
    'teacher-attendance': 'Attendance',
    'teacher-lessons': 'Lessons',
    'teacher-materials': 'Materials',
    'teacher-log': 'Activity',
    'teacher-ai-suite': 'AI Tools',
    'parent-dashboard': 'Home',
    'student-dashboard': 'Home',
    'edu-ecosystem': 'Education Hub',
    'commercial-hub': 'Marketplace',
    'eduos-engine': 'Command Center'
  };

  const simpleCategories: Record<string, string> = {
    'GLOBAL ADMIN': 'Home',
    'STAGE 8 ECOSYSTEM': 'EXTRA',
    'STAGE 9 COMMERCIAL': 'EXTRA',
    'STAGE 10 EduOS': 'EXTRA',
    'SaaS SYSTEM CONTROLS': 'MANAGE',
    'GLOBAL CONFIG': 'Settings',
    'CORE MONITOR': 'Home',
    'ACADEMIC ROSTER': 'People',
    'SCHOOL MATRIX': 'Learning',
    'ADMIN FINANCIALS': 'Money / Messages',
    'SYSTEM CONTROL': 'Settings',
    'COGNITIVE INTELLIGENCE': 'Learning',
    'MY CLASSROOM': 'Home',
    'ACADEMIC CORE': 'Learning',
    RESOURCES: 'Learning',
    TRACKING: 'Reports',
    'PARENT PORTAL': 'Home',
    INFORMATION: 'Messages / Help',
    'STUDENT PORTAL': 'Home'
  };

  const getNavLabel = (item: { id: string; label: string }) => simpleMode ? (simpleLabels[item.id] || item.label) : item.label;
  const getCategoryLabel = (category: string) => simpleMode ? (simpleCategories[category] || category) : category;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen?.(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
          id="sidebar-mobile-backdrop"
        />
      )}

      <div className={`
        glass-sidebar text-white flex flex-col border-r border-white/10 h-full shrink-0 select-none font-sans transition-all duration-300
        !fixed md:!relative inset-y-0 left-0 z-50 md:translate-x-0
        ${isMobileOpen ? 'translate-x-0 w-76 animate-in slide-in-from-left duration-300' : '-translate-x-full md:w-auto'}
        ${isCollapsed && !isMobileOpen ? 'md:w-18' : 'md:w-76'}
        w-76
      `}>
        
        {/* Platform branding: serious core banking style */}
        <div className={`border-b border-white/10 flex items-center bg-white/[0.035] transition-all duration-200 ${(isCollapsed && !isMobileOpen) ? 'p-3 justify-center' : 'p-5 justify-between'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl text-white font-semibold flex items-center justify-center shadow-lg shadow-blue-900/30 ring-1 ring-white/20 shrink-0" style={{ background: brandColor }}>
              {isSuperAdmin ? <Database className="w-6 h-6 text-slate-100" /> : <span className="w-6 text-center text-sm font-black">{brandInitials}</span>}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="animate-in fade-in duration-300">
                <h1 className="font-display font-black text-xl tracking-wide leading-none text-white">
                  {isSuperAdmin ? 'EDUCORE' : (currentTenant?.name || 'SCHOOL')}
                  {isSuperAdmin && <span className="text-cyan-200 text-xs font-mono align-super font-black px-1.5 py-0.5 rounded-full bg-white/10 ml-0.5 border border-white/15">AI</span>}
                </h1>
                <p className="text-[10px] text-cyan-100/70 tracking-widest font-mono mt-1">{brandMotto}</p>
              </div>
            )}
          </div>

          {/* Mobile close button inside header */}
          {isMobileOpen && (
            <button
              onClick={() => setIsMobileOpen?.(false)}
              className="md:hidden p-1.5 bg-white/10 text-slate-200 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="Close navigation panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tenancy Context Monitor Header */}
        {(!isCollapsed || isMobileOpen) ? (
          <div className="sidebar-glow p-4 mx-4 my-5 rounded-2xl border border-white/10 flex flex-col gap-3.5 relative overflow-hidden animate-in fade-in duration-300">
            <div className="absolute right-0 top-0 opacity-[0.10] translate-x-3 -translate-y-3">
              <Database className="w-24 h-24 text-cyan-200" />
            </div>
            
            {isSuperAdmin ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] text-emerald-300 font-mono font-bold tracking-widest leading-none">SUPER CLUSTER SECURE</span>
                </div>
                <div>
                  <p className="text-xs text-slate-300/80 leading-none">Access Control Range</p>
                  <h3 className="text-base font-bold text-slate-100 mt-1.5 leading-tight flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-[#1A56DB] shrink-0" />
                    Super-Admin Gateway
                  </h3>
                </div>
                <div className="text-[10px] bg-white/10 border border-white/15 px-2.5 py-1 rounded-full font-mono text-cyan-100 self-start font-bold">
                  ROOT_CID: GLOBAL_CORE
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                  </span>
                  <span className="text-[11px] text-sky-300 font-mono font-bold tracking-widest leading-none">MY SCHOOL</span>
                </div>
                <div>
                  <p className="text-xs text-slate-300/80 leading-none">Current School</p>
                  <h3 className="text-base font-bold text-white mt-1.5 leading-tight line-clamp-1 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400 shrink-0" />
                    {currentTenant?.name || 'My School'}
                  </h3>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono mt-1.5 text-slate-300">
                  <span className="bg-white/10 border border-white/15 px-2 py-1 rounded-full select-all font-bold">
                    Code: {currentTenant?.code || currentTenant?.id || 'SCHOOL'}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-200 font-bold">
                    <Lock className="w-3 h-3" /> Protected
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="sidebar-glow p-2 mx-2 my-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center gap-1 text-xs relative animate-in fade-in duration-200 py-3.5" title={isSuperAdmin ? "Super Admin Operations" : `School: ${currentTenant?.name}`}>
            {isSuperAdmin ? (
              <ShieldAlert className="w-5 h-5 text-indigo-400 shrink-0" />
            ) : (
              <Building2 className="w-5 h-5 text-sky-400 shrink-0" />
            )}
            <span className="text-[8px] font-mono font-bold tracking-tighter text-slate-400 text-center uppercase truncate block max-w-full px-0.5">
              {isSuperAdmin ? 'ADMIN' : (currentTenant?.code || 'SCHOOL')}
            </span>
          </div>
        )}

        {/* Main sidebar Navigation links list */}
        <div className={`py-2 flex-1 flex flex-col overflow-y-auto transition-all ${(isCollapsed && !isMobileOpen) ? 'px-1.5 gap-2.5 items-center' : 'px-3.5 gap-1.5'}`}>
          {(() => {
            let lastCategory: string | null = null;
            return currentNav.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              const categoryLabel = getCategoryLabel(item.category);
              const itemLabel = getNavLabel(item);
              const showCategoryHeader = categoryLabel !== lastCategory;
              if (showCategoryHeader) {
                lastCategory = categoryLabel;
              }
              return (
                <React.Fragment key={item.id}>
                  {showCategoryHeader && (!isCollapsed || isMobileOpen) && (
                    <p className="px-3.5 mt-5 mb-2.5 text-[10px] font-mono tracking-[0.18em] text-cyan-100/50 uppercase font-black first:mt-1.5 animate-in fade-in duration-200">
                      {categoryLabel}
                    </p>
                  )}
                  {showCategoryHeader && (isCollapsed && !isMobileOpen) && (
                    <div className="w-6 h-px bg-white/15 my-2" />
                  )}
                  <button
                    id={`sidebar-nav-${item.id}`}
                    data-scroll-to={getSidebarScrollTarget(item.id, itemLabel)}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center rounded-xl transition-all duration-200 text-left cursor-pointer group relative ${
                      (isCollapsed && !isMobileOpen) 
                        ? 'justify-center p-2.5 w-11 h-11' 
                        : 'gap-3.5 px-3.5 py-3 text-[15px] w-full'
                    } ${
                      isActive 
                        ? 'sidebar-nav-active text-white font-semibold' 
                        : 'sidebar-nav-idle text-slate-300 hover:text-white border border-transparent hover:border-white/10'
                    }`}
                    title={(isCollapsed && !isMobileOpen) ? itemLabel : undefined}
                  >
                    <IconComponent className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-200'}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="truncate tracking-tight">{itemLabel}</span>}
                    {isActive && (!isCollapsed || isMobileOpen) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_#ffffff]" />
                    )}
                    {isActive && (isCollapsed && !isMobileOpen) && (
                      <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-md bg-white shadow-[0_0_8px_#ffffff]" />
                    )}
                  </button>
                </React.Fragment>
              );
            });
          })()}
        </div>

        {/* Footer Deployed User Badge and Logout */}
        <div className={`border-t border-white/10 bg-black/15 transition-all duration-200 ${(isCollapsed && !isMobileOpen) ? 'p-2.5 flex flex-col items-center gap-3.5' : 'p-4'}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl border border-white/20 flex items-center justify-center font-bold text-sm text-white uppercase shrink-0 shadow-lg shadow-blue-950/25" style={{ background: brandColor }} title={user?.name || 'User Profile'}>
              {user?.name ? user.name.substring(0, 2) : 'AU'}
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <h4 className="text-xs font-semibold text-slate-200 truncate leading-snug">
                  {user?.name || 'Anonymous User'}
                </h4>
                <p className="text-[10px] text-slate-400 truncate leading-snug font-mono">
                  {user?.email || 'admin@educore.ai'}
                </p>
              </div>
            )}
          </div>

          {(!isCollapsed || isMobileOpen) ? (
            <div className="mt-3.5 flex items-center justify-between text-[11px] text-slate-300/75 pt-3 border-t border-white/10 animate-in fade-in duration-300">
              <span className="font-mono text-[9px] bg-white/10 px-2 py-1 rounded-full font-extrabold uppercase text-slate-100 tracking-wider border border-white/10">
                {user?.role === 'SuperAdmin' ? 'Super Admin' : user?.role === 'Teacher' ? 'Teacher' : user?.role === 'Parent' ? 'Parent' : user?.role === 'Student' ? 'Student' : user?.role === 'Accountant' ? 'Accountant' : user?.role === 'Supervisor' ? 'Supervisor' : user?.role === 'AssistantAdmin' ? 'Assistant Admin' : 'Principal / Manager'}
              </span>
              <button
                id="sidebar-logout-button"
                onClick={onLogout}
                className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer group"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              id="sidebar-logout-button"
              onClick={onLogout}
              className="p-2 bg-slate-800/45 hover:bg-rose-950/45 rounded-lg border border-slate-700/50 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer group flex items-center justify-center w-11 h-11"
              title="Sign Out of Portal"
            >
              <LogOut className="w-4.5 h-4.5 text-slate-400 group-hover:text-rose-400 shrink-0" />
            </button>
          )}
        </div>

        {/* MIDDLE EDGE COLLAPSE TRIGGER BUTTON */}
        <button
          onClick={onToggleCollapse}
          className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-7 h-7 bg-indigo-600 hover:bg-indigo-500 active:scale-90 text-white rounded-full border border-indigo-400 shadow-md hidden md:flex items-center justify-center transition-all cursor-pointer z-50 select-none animate-in fade-in duration-200"
          title={isCollapsed ? "Open sidebar" : "Close sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-white" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-white" />
          )}
        </button>

      </div>
    </>
  );
}
