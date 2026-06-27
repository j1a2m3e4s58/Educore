/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  HelpCircle, 
  Database, 
  ChevronRight, 
  ShieldAlert, 
  Building2, 
  MonitorCheck,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ArrowRightLeft,
  Menu,
  Eye,
  Sliders
} from 'lucide-react';
import { User, School } from '../types';
import { getTenantSettings } from '../data/mockData';

interface NavbarProps {
  user: User | null;
  currentTenant: School | null;
  activeTab: string;
  schools: School[];
  onSwitchTenant: (schoolId: string | 'SUPER_ADMIN') => void;
  onStartTour?: () => void;
  isSidebarCollapsed?: boolean;
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
  simpleMode?: boolean;
  setSimpleMode?: (enabled: boolean) => void;
}

export default function Navbar({ 
  user, 
  currentTenant, 
  activeTab, 
  schools, 
  onSwitchTenant,
  onStartTour,
  isSidebarCollapsed = false,
  isMobileMenuOpen = false,
  setIsMobileMenuOpen,
  simpleMode = true,
  setSimpleMode
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showTenantSwitcher, setShowTenantSwitcher] = useState(false);
  const tenantSettings = currentTenant ? getTenantSettings(currentTenant.id) : null;
  const brandInitials = user?.role === 'SuperAdmin' ? 'SA' : tenantSettings?.schoolLogoInitials || currentTenant?.logo || 'SC';
  const brandColor = tenantSettings?.themeColor || '#1A56DB';
  const brandMotto = tenantSettings?.schoolMotto || 'Smart School Portal';
  
  const roleLabel = user?.role === 'SuperAdmin' ? 'Super Admin' : user?.role === 'SchoolAdmin' ? 'Principal / Manager' : user?.role === 'Teacher' ? 'Teacher' : user?.role === 'Parent' ? 'Parent' : user?.role === 'Student' ? 'Student' : user?.role === 'Accountant' ? 'Accountant' : user?.role === 'Supervisor' ? 'Supervisor' : user?.role === 'AssistantAdmin' ? 'Assistant Admin' : 'Guest';

  // Friendly notifications based on role
  const notifications = user?.role === 'SuperAdmin' ? [
    { id: 'n1', title: 'School Added', body: 'St. Jude setup is ready for review.', time: '10m ago', type: 'success' },
    { id: 'n2', title: 'Payment Alert', body: 'Apex Collegiate needs payment before full access can continue.', time: '2h ago', type: 'error' },
    { id: 'n3', title: 'Security Check', body: 'Weekly data safety check completed. No school data crossed into another school.', time: '1d ago', type: 'info' }
  ] : user?.role === 'Teacher' ? [
    { id: 'n4', title: 'Attendance Due', body: 'Mark today attendance for your assigned class periods.', time: 'Now', type: 'warning' },
    { id: 'n5', title: 'Material Drafts Safe', body: 'Unfinished teaching material uploads are saved until submitted.', time: '1h ago', type: 'success' },
    { id: 'n6', title: 'Lesson Record', body: 'Record pages reached after each taught period.', time: 'Today', type: 'info' }
  ] : user?.role === 'Parent' ? [
    { id: 'n7', title: 'Child Update', body: 'Assignments, fees, and attendance notices are shown here only for your child.', time: 'Today', type: 'info' },
    { id: 'n8', title: 'Fee Notice', body: `Fee statements use ${tenantSettings?.currencyCode || 'the school currency'}.`, time: 'This term', type: 'warning' },
    { id: 'n9', title: 'School Message', body: 'New teacher or school messages appear here.', time: 'Today', type: 'success' }
  ] : user?.role === 'Student' ? [
    { id: 'n10', title: 'Homework', body: 'Open your dashboard to see assignments and materials.', time: 'Today', type: 'warning' },
    { id: 'n11', title: 'Study Materials', body: 'Approved materials from teachers appear in your learning area.', time: 'Today', type: 'info' },
    { id: 'n12', title: 'Calendar', body: 'Check school dates and exam notices.', time: 'This week', type: 'success' }
  ] : [
    { id: 'n13', title: 'Academic Period Ready', body: `Current ${tenantSettings?.periodType || 'term'} is open for school work.`, time: '1h ago', type: 'info' },
    { id: 'n14', title: 'Teacher Requests', body: 'Teacher accounts waiting for approval can be reviewed by the manager.', time: '3h ago', type: 'warning' },
    { id: 'n15', title: 'Backup Ready', body: "Today's school data backup has been saved safely.", time: '5h ago', type: 'success' }
  ];

  // Helper to resolve breadcrumb text in core banking format
  const getBreadcrumbs = () => {
    if (user?.role === 'SuperAdmin') {
      switch (activeTab) {
        case 'dashboard':
          return { category: simpleMode ? 'Home' : 'Central Console', page: simpleMode ? 'Dashboard' : 'School Monitor' };
        case 'register':
          return { category: simpleMode ? 'Schools' : 'Registry Deployment', page: simpleMode ? 'Add School' : 'Deploy School Node' };
        case 'schools':
          return { category: simpleMode ? 'Schools' : 'Registry Audit', page: simpleMode ? 'All Schools' : 'Institutional Logs' };
        case 'roles':
          return { category: simpleMode ? 'People' : 'Access Authorization', page: simpleMode ? 'Users' : 'Global Role Config' };
        case 'settings':
          return { category: simpleMode ? 'Settings' : 'Systems Control', page: simpleMode ? 'Settings' : 'Core Plate Settings' };
        default:
          return { category: simpleMode ? 'Home' : 'Super Admin Control', page: simpleMode ? 'Dashboard' : 'Central Registry' };
      }
    } else {
      switch (activeTab) {
        case 'school-dashboard':
          return { category: simpleMode ? 'Home' : 'Secure School Node', page: simpleMode ? 'School Dashboard' : 'Tenant Overview' };
        case 'school-users':
          return { category: simpleMode ? 'People' : 'Workspace Directory', page: simpleMode ? 'People' : 'Faculty & Student RBAC' };
        case 'school-settings':
          return { category: simpleMode ? 'Settings' : 'Workspace Config', page: simpleMode ? 'Settings' : 'Private Parameters' };
        default:
          return { category: simpleMode ? 'School' : 'Manager / Head', page: simpleMode ? 'School Portal' : 'Private Workspace' };
      }
    }
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-16 md:h-20 bg-white/82 backdrop-blur-xl border-b border-white/70 px-3 sm:px-4 md:px-6 xl:px-8 py-2 md:py-0 flex items-center justify-between gap-2 sm:gap-6 lg:gap-8 font-sans relative z-40 select-none shadow-sm shadow-slate-900/5">
      
      {/* Search Input Bar (Layout only, with look) */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
        
        {/* Mobile Hamburger Menu Trigger */}
        <button
          onClick={() => setIsMobileMenuOpen?.(true)}
          className="md:hidden w-10 h-10 text-slate-700 bg-white/80 hover:bg-white rounded-xl transition-colors cursor-pointer shrink-0 flex items-center justify-center border border-slate-200 shadow-sm"
          title="Open navigation panel"
        >
          <Menu className="w-5 h-5 text-slate-700" />
        </button>

        {/* Mobile-Only Brand Icon/Text */}
        <div className="flex md:hidden items-center gap-2 min-w-0">
          <div className="w-10 h-10 rounded-2xl text-white font-semibold flex items-center justify-center shrink-0 shadow-sm ring-1 ring-white/40" style={{ background: brandColor }}>
            <span className="font-mono text-[10px] font-black">{brandInitials}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950 leading-tight truncate">{breadcrumbs.page}</p>
            <p className="text-[10px] text-[#1A56DB] font-mono font-bold leading-tight truncate">
              {roleLabel}
            </p>
          </div>
        </div>

        {/* Breadcrumb Indicators */}
        <div className={`hidden ${isSidebarCollapsed ? 'lg:flex' : 'xl:flex'} items-center gap-2 text-xs text-slate-500 font-semibold min-w-0 flex-1`}>
          <span className="text-slate-450 whitespace-nowrap hidden sm:inline">EduCore</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 hidden sm:block" />
          <span className="text-slate-500 whitespace-nowrap truncate max-w-[70px] xl:max-w-[120px]">{breadcrumbs.category}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
          <span className="text-slate-950 font-black text-xs sm:text-sm tracking-tight whitespace-nowrap truncate max-w-[150px] xl:max-w-[220px] 2xl:max-w-[280px] bg-white/80 border border-slate-200 px-2.5 py-0.5 rounded-lg shadow-sm">{breadcrumbs.page}</span>
        </div>

        {/* Flat System Status Banner */}
        <div className="hidden 2xl:flex items-center gap-2 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
          <Database className="w-3.5 h-3.5 text-slate-600 animate-pulse shrink-0" />
          <span className="text-[10px] sm:text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wide whitespace-nowrap">
            {user?.role === 'SuperAdmin' 
              ? 'All schools active' 
              : `${brandMotto}: ${currentTenant?.code}`
            }
          </span>
        </div>
      </div>

      {/* Dynamic Controls, Swapper & Notification widgets */}
      <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 shrink-0 min-w-0">
{/* UNIFIED SIMULATION ENGINE BOX */}
        <div className="hidden lg:flex items-center gap-1 md:gap-1.5 bg-white/78 border border-slate-200 p-1 rounded-2xl shadow-sm shrink-0 backdrop-blur">
          <span className={`text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest pl-2 pr-1.5 hidden ${isSidebarCollapsed ? 'xl:inline-block' : '2xl:inline-block'} border-r border-[#E2E8F0] mr-1 select-none whitespace-nowrap`}>
            Tools
          </span>
          
          {/* INTERACTIVE TOUR TRIGGER */}
          {setSimpleMode && (
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`flex items-center justify-center gap-1.5 w-9 sm:w-auto h-9 sm:h-auto sm:px-2 sm:py-1 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm border whitespace-nowrap shrink-0 ${
                simpleMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-250 hover:bg-slate-100'
              }`}
              title={simpleMode ? 'Switch to advanced technical view' : 'Switch to simple friendly view'}
            >
              {simpleMode ? <Eye className="w-3.5 h-3.5 shrink-0" /> : <Sliders className="w-3.5 h-3.5 shrink-0" />}
              <span className="hidden sm:inline-block select-none">
                {simpleMode ? 'Simple' : 'Advanced'}
              </span>
            </button>
          )}

          {/* INTERACTIVE TOUR TRIGGER */}
          {onStartTour && (
            <button
              onClick={onStartTour}
              className="flex items-center justify-center gap-1.5 w-9 sm:w-auto h-9 sm:h-auto sm:px-2 sm:py-1 bg-amber-500 hover:bg-amber-600 active:scale-97 text-slate-950 rounded-lg text-xs font-black transition-all cursor-pointer shadow-sm border border-amber-400 whitespace-nowrap shrink-0"
              title="Start Interactive Portal Guided Tour"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950 shrink-0" />
              <span className="hidden sm:inline-block select-none">
                <span className={isSidebarCollapsed ? 'hidden xl:inline' : 'hidden 2xl:inline'}>Tour</span>
                <span className={isSidebarCollapsed ? 'inline xl:hidden' : 'inline 2xl:hidden'}>Tour</span>
              </span>
            </button>
          )}
          
          {/* INSTANT EVALUATION WORKSPACE SWITCHER */}
          <div className="relative shrink-0">
            <button
              id="navbar-workspace-switcher"
              onClick={() => setShowTenantSwitcher(!showTenantSwitcher)}
              className="flex items-center justify-center gap-1.5 w-9 sm:w-auto h-9 sm:h-auto sm:px-2 sm:py-1 bg-white text-[#1A56DB] border border-slate-250 rounded-lg text-xs font-bold hover:bg-slate-100 hover:text-blue-750 transition-all cursor-pointer shadow-xs active:scale-97 whitespace-nowrap"
              title="Switch school view"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-[#1A56DB] shrink-0" />
              <span className="hidden sm:inline-block select-none">
                <span className={isSidebarCollapsed ? 'hidden xl:inline' : 'hidden 2xl:inline'}>Switch</span>
                <span className={isSidebarCollapsed ? 'inline xl:hidden' : 'inline 2xl:hidden'}>Switch</span>
              </span>
            </button>

            {showTenantSwitcher && (
              <div className="fixed left-2 right-2 top-20 max-h-[calc(100vh-6rem)] overflow-hidden border border-slate-200 bg-white py-2 shadow-2xl z-50 text-slate-800 animate-in fade-in slide-in-from-top-1 duration-150 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-[22rem] sm:max-h-[74vh]">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-3 py-3 sm:px-4">
                  <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 font-mono leading-tight">
                    Select School View
                  </span>
                  <span className="shrink-0 bg-indigo-50 px-2 py-1 text-[9px] font-black font-mono leading-tight text-[#1A56DB]">
                    Stage 1 Evaluation
                  </span>
                </div>
                
                <div className="max-h-[calc(100vh-10rem)] overflow-y-auto sm:max-h-[58vh]">
                  {/* Option 1: Back to Super Admin Global Registry */}
                  <button
                    id="switch-to-super-admin"
                    onClick={() => {
                      onSwitchTenant('SUPER_ADMIN');
                      setShowTenantSwitcher(false);
                    }}
                    className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50 sm:px-4 ${
                      user?.role === 'SuperAdmin' ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''
                    }`}
                  >
                    <ShieldAlert className="w-4.5 h-4.5 text-[#1A56DB] mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs font-bold leading-tight text-slate-905">
                        Super Admin Registry
                        {user?.role === 'SuperAdmin' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">Open all schools and system stats</p>
                    </div>
                  </button>

                  <div className="h-px bg-slate-100 my-1" />

                  {/* Simulated Schools/Tenants */}
                  {schools.map((school) => {
                    const isActive = currentTenant?.id === school.id && user?.role === 'SchoolAdmin';
                    return (
                      <button
                        id={`switch-to-tenant-${school.id}`}
                        key={school.id}
                        onClick={() => {
                          onSwitchTenant(school.id);
                          setShowTenantSwitcher(false);
                        }}
                        className={`flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-slate-50 sm:px-4 ${
                          isActive ? 'bg-indigo-50/50 hover:bg-indigo-50' : ''
                        }`}
                      >
                        <Building2 className="w-4.5 h-4.5 text-emerald-600 mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-1.5 text-xs font-bold leading-tight text-slate-900">
                            {school.name}
                            {isActive && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            )}
                          </div>
                          <p className="mt-1 grid grid-cols-1 gap-1 text-[10px] font-semibold leading-tight text-slate-500 sm:grid-cols-[1fr_auto] sm:items-center">
                            <span className="break-words">Code: <span className="text-slate-700">{school.code}</span></span>
                            <span className="bg-slate-100 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-slate-600">{school.subscriptionPackage} pkg</span>
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* UTILITIES & NOTIFICATIONS SYSTEM */}
        <div className="flex items-center gap-1 bg-slate-50/70 border border-slate-205 p-1 rounded-xl shrink-0">
          {/* Notifications Icon Button */}
          <div className="relative">
            <button
              id="navbar-notifications-button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 rounded-lg transition-all relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full" />
            </button>

            {showNotifications && (
              <div className="fixed left-3 right-3 top-16 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-3 sm:w-80 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150 text-slate-800">
                <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-3 py-3 sm:px-4">
                  <span className="text-xs font-black font-mono text-slate-400 uppercase">Alert Logs</span>
                  <span className="text-[10px] text-blue-600 hover:underline cursor-pointer">Mark read</span>
                </div>
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto w-full">
                  {notifications.map((item) => (
                    <div key={item.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        {item.type === 'success' && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                        {item.type === 'error' && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
                        {item.type === 'info' && <Database className="w-3.5 h-3.5 text-[#1A56DB] shrink-0" />}
                        {item.type === 'warning' && <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        
                        <span className="text-xs font-extrabold text-slate-900 truncate">{item.title}</span>
                        <span className="text-[9px] text-slate-400 ml-auto font-mono">{item.time}</span>
                      </div>
                      <p className="text-[10px] text-slate-505 mt-1 leading-normal">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Global Help Indicator */}
          <button className="hidden sm:flex w-9 h-9 items-center justify-center text-slate-600 hover:bg-slate-200 rounded-lg transition-all cursor-pointer" title="System Documentation & Help">
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Separator */}
        <div className={`h-8 w-px bg-slate-200 shrink-0 hidden ${isSidebarCollapsed ? 'sm:block' : 'xl:block'}`} />

        {/* Current Active Workspace Indicator Box */}
        <div className="hidden sm:flex items-center gap-2.5 md:gap-3 shrink-0">
          <div className={`text-right hidden ${isSidebarCollapsed ? 'xl:block' : '2xl:block'} select-none`}>
            <p className="text-xs font-black text-slate-900 leading-tight whitespace-nowrap max-w-[130px] truncate">
              {user?.role === 'SuperAdmin' ? 'Super Monitor' : currentTenant?.name}
            </p>
            <p className="text-[10px] text-[#1A56DB] font-mono leading-none font-bold mt-1 whitespace-nowrap">
              {user?.role === 'SuperAdmin' ? 'Main Office' : `Code: ${currentTenant?.code}`}
            </p>
            <p className="mt-1 inline-flex rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-blue-800">
              {roleLabel}
            </p>
          </div>
          <div className="w-8.5 h-8.5 rounded-lg text-slate-100 flex items-center justify-center font-display font-black text-xs shadow-inner shrink-0" style={{ background: brandColor }} title={user?.role === 'SuperAdmin' ? 'Super Monitor' : currentTenant?.name}>
            {brandInitials}
          </div>
        </div>

      </div>
    </div>
  );
}
