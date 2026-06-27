/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  KeyRound,
  Link2,
  Lock,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { School, User, UserRole, UserStatus } from '../types';
import { getClassesInStorage, getStudentsInStorage, getSubjectsInStorage, getTeachersInStorage } from '../data/mockData';

interface RoleManagementProps {
  currentTenant: School | null;
  users: User[];
  currentUser?: User | null;
  schools?: School[];
  onAddUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onUpdateUser: (userId: string, patch: Partial<User>) => void;
  onDeleteUser: (userId: string) => void;
}

const MANAGER_CREATABLE_ROLES: UserRole[] = ['SchoolAdmin', 'AssistantAdmin', 'Supervisor', 'Accountant', 'Teacher', 'Parent', 'Student'];
const SUPER_CREATABLE_ROLES: UserRole[] = ['SchoolAdmin', 'AssistantAdmin', 'Supervisor', 'Accountant', 'Teacher', 'Parent', 'Student'];

function roleLabel(role: UserRole) {
  const labels: Record<UserRole, string> = {
    SuperAdmin: 'Super Admin',
    SchoolAdmin: 'Manager / Principal',
    AssistantAdmin: 'Assistant Admin',
    Supervisor: 'Supervisor',
    Accountant: 'Accountant',
    Teacher: 'Teacher',
    Parent: 'Parent',
    Student: 'Student',
  };
  return labels[role] || role;
}

function statusClass(status: UserStatus) {
  if (status === 'Active') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  if (status === 'Pending') return 'border-amber-200 bg-amber-50 text-amber-800';
  if (status === 'Suspended') return 'border-rose-200 bg-rose-50 text-rose-800';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function permissionsForRole(role: UserRole) {
  const pages: Record<UserRole, string[]> = {
    SuperAdmin: ['All schools', 'Subscriptions', 'Global users', 'System settings'],
    SchoolAdmin: ['All school records', 'Users', 'Fees', 'Reports', 'Settings'],
    AssistantAdmin: ['School records', 'Users', 'Fees', 'Messages', 'Reports'],
    Supervisor: ['Teacher review', 'Students', 'Classes', 'Reports'],
    Accountant: ['Fees', 'Payments', 'Receipts', 'Parent balances'],
    Teacher: ['Attendance', 'Lessons', 'Materials', 'Assignments'],
    Parent: ['Own child records', 'Fees', 'Assignments', 'Messages'],
    Student: ['Own assignments', 'Materials', 'Calendar'],
  };
  return pages[role] || [];
}

function generateTemporaryPassword() {
  return `Edu@${Math.floor(100000 + Math.random() * 900000)}`;
}

function schoolLoginLink(tenant?: School | null) {
  const origin = typeof window === 'undefined' ? 'http://localhost:3000' : window.location.origin;
  const path = typeof window === 'undefined' ? '/' : window.location.pathname;
  return `${origin}${path}?school=${encodeURIComponent(tenant?.code || tenant?.id || '')}`;
}

export default function RoleManagement({
  currentTenant,
  users,
  currentUser,
  schools = [],
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}: RoleManagementProps) {
  const isSuperAdmin = currentUser?.role === 'SuperAdmin';
  const initialTenantId = currentTenant?.id || schools[0]?.id || 'school_central_crest';
  const [targetTenantId, setTargetTenantId] = useState(initialTenantId);
  const activeTenant = schools.find(s => s.id === targetTenantId) || currentTenant;
  const effectiveTenantId = isSuperAdmin ? targetTenantId : currentTenant?.id || targetTenantId;

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [showAddForm, setShowAddForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('Teacher');
  const [userDepartment, setUserDepartment] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [linkedTeacherId, setLinkedTeacherId] = useState('');
  const [linkedStudentId, setLinkedStudentId] = useState('');
  const [linkedStudentIds, setLinkedStudentIds] = useState<string[]>([]);
  const [activateImmediately, setActivateImmediately] = useState(true);
  const [inviteMessage, setInviteMessage] = useState('');
  const [auditRange, setAuditRange] = useState<'today' | 'month' | 'year' | 'all'>('today');
  const [resetRequestVersion, setResetRequestVersion] = useState(0);

  const teachers = useMemo(() => getTeachersInStorage(effectiveTenantId), [effectiveTenantId]);
  const students = useMemo(() => getStudentsInStorage(effectiveTenantId), [effectiveTenantId]);
  const classes = useMemo(() => getClassesInStorage(effectiveTenantId), [effectiveTenantId]);
  const subjects = useMemo(() => getSubjectsInStorage(effectiveTenantId), [effectiveTenantId]);
  const selectedTeacher = teachers.find(teacher => teacher.id === linkedTeacherId);
  const creatableRoles = isSuperAdmin ? SUPER_CREATABLE_ROLES : MANAGER_CREATABLE_ROLES;
  const tenantFilteredUsers = users.filter(u => isSuperAdmin ? u.tenantId === effectiveTenantId : u.tenantId === currentTenant?.id);
  const displayUsers = tenantFilteredUsers.filter(u => {
    const matchesSearch = `${u.name} ${u.email} ${u.department || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  const pendingRequests = tenantFilteredUsers.filter(u => u.status === 'Pending');
  const loginAudit = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`educore_login_audit_${effectiveTenantId}`) || '[]');
    } catch {
      return [];
    }
  }, [effectiveTenantId, users]);
  const resetRequests = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(`educore_password_reset_requests_${effectiveTenantId}`) || '[]');
    } catch {
      return [];
    }
  }, [effectiveTenantId, users, resetRequestVersion]);
  const activityTimeline = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('educore_activity_logs') || '[]').filter((entry: any) => entry.tenantId === effectiveTenantId || (isSuperAdmin && entry.tenantId === 'GLOBAL'));
    } catch {
      return [];
    }
  }, [effectiveTenantId, users, isSuperAdmin]);
  const withinAuditRange = (createdAt?: string) => {
    if (auditRange === 'all') return true;
    const created = createdAt ? new Date(createdAt) : null;
    if (!created || Number.isNaN(created.getTime())) return false;
    const now = new Date();
    if (auditRange === 'today') return created.toDateString() === now.toDateString();
    if (auditRange === 'month') return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth();
    return created.getFullYear() === now.getFullYear();
  };
  const visibleActivityTimeline = activityTimeline.filter((entry: any) => withinAuditRange(entry.timestamp));
  const visibleLoginAudit = loginAudit.filter((entry: any) => {
    return withinAuditRange(entry.createdAt);
  });

  const studentName = (studentId?: string) => students.find(student => student.id === studentId)?.fullName || '';
  const linkedStudentNames = (item: User) => {
    const ids = item.linkedStudentIds?.length ? item.linkedStudentIds : item.linkedStudentId ? [item.linkedStudentId] : [];
    return ids.map(id => studentName(id)).filter(Boolean);
  };
  const createInviteMessage = (account: Pick<User, 'name' | 'email' | 'role'>, temporaryPassword: string) => [
    `Welcome to ${activeTenant?.name || 'your school'} portal.`,
    `Login link: ${schoolLoginLink(activeTenant)}`,
    `Account type: ${roleLabel(account.role)}`,
    `Name: ${account.name}`,
    `Username: ${account.email}`,
    `Temporary password: ${temporaryPassword}`,
    'Please login and change this temporary password before using the portal.'
  ].join('\n');
  const togglePendingChild = (item: User, studentId: string) => {
    const current = item.linkedStudentIds?.length ? item.linkedStudentIds : item.linkedStudentId ? [item.linkedStudentId] : [];
    const next = current.includes(studentId) ? current.filter(id => id !== studentId) : [...current, studentId];
    onUpdateUser(item.id, { linkedStudentIds: next, linkedStudentId: next[0] });
  };
  const saveResetRequests = (next: any[]) => {
    localStorage.setItem(`educore_password_reset_requests_${effectiveTenantId}`, JSON.stringify(next));
    setResetRequestVersion(version => version + 1);
  };

  const handleUserAppend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      setFormError('Full name and email are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail.trim())) {
      setFormError('Enter a valid email address.');
      return;
    }
    if (tenantFilteredUsers.some(u => u.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      setFormError('This email already has a login inside this school.');
      return;
    }
    if (userRole === 'Teacher' && !linkedTeacherId) {
      setFormError('Link this login to a teacher profile before saving.');
      return;
    }
    if (userRole === 'Parent' && linkedStudentIds.length === 0) {
      setFormError('Link this parent login to at least one child record before saving.');
      return;
    }
    if (userRole === 'Student' && !linkedStudentId) {
      setFormError('Link this login to the correct student record before saving.');
      return;
    }

    const temporaryPassword = generateTemporaryPassword();
    const newAccount = {
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      role: userRole,
    };
    onAddUser({
      tenantId: effectiveTenantId,
      name: newAccount.name,
      email: newAccount.email,
      role: newAccount.role,
      status: activateImmediately ? 'Active' : 'Pending',
      phone: userPhone.trim() || undefined,
      department: userDepartment.trim() || undefined,
      linkedTeacherId: userRole === 'Teacher' ? linkedTeacherId : undefined,
      linkedStudentId: userRole === 'Student' ? linkedStudentId : userRole === 'Parent' ? linkedStudentIds[0] : undefined,
      linkedStudentIds: userRole === 'Parent' ? linkedStudentIds : undefined,
      temporaryPassword,
      mustChangePassword: true,
      createdBy: currentUser?.email || 'system',
    });
    setInviteMessage(createInviteMessage(newAccount, temporaryPassword));

    setUserName('');
    setUserEmail('');
    setUserRole('Teacher');
    setUserDepartment('');
    setUserPhone('');
    setLinkedTeacherId('');
    setLinkedStudentId('');
    setLinkedStudentIds([]);
    setActivateImmediately(true);
    setFormError('');
    setShowAddForm(false);
  };

  const resetPassword = (item: User) => {
    const temporaryPassword = generateTemporaryPassword();
    onUpdateUser(item.id, { temporaryPassword, mustChangePassword: true });
    setInviteMessage(createInviteMessage(item, temporaryPassword));
  };

  const canActivate = (item: User) => {
    if (item.role === 'Teacher') return Boolean(item.linkedTeacherId);
    if (item.role === 'Parent') return Boolean(item.linkedStudentIds?.length || item.linkedStudentId);
    if (item.role === 'Student') return Boolean(item.linkedStudentId);
    return true;
  };

  return (
    <div className="space-y-6 font-sans select-none">
      <div className="bg-white rounded border border-banking-border p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1A56DB]" />
            User Access Accounts
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Create and manage Manager, Teacher, Parent, Student, Accountant, Supervisor, and Assistant Admin logins. Managers can only manage users for their own school.
          </p>
        </div>
        <button
          id="btn-toggle-add-user"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1A56DB]/95 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm self-start cursor-pointer transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>{showAddForm ? 'Close Form' : 'Create User'}</span>
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="border border-blue-100 bg-blue-50 p-3">
          <p className="text-[10px] font-black uppercase text-blue-700">School Scope</p>
          <p className="mt-1 truncate text-sm font-black text-blue-950">{activeTenant?.name || effectiveTenantId}</p>
        </div>
        <div className="border border-emerald-100 bg-emerald-50 p-3">
          <p className="text-[10px] font-black uppercase text-emerald-700">Active</p>
          <p className="mt-1 text-2xl font-black text-emerald-950">{tenantFilteredUsers.filter(u => u.status === 'Active').length}</p>
        </div>
        <div className="border border-amber-100 bg-amber-50 p-3">
          <p className="text-[10px] font-black uppercase text-amber-700">Pending</p>
          <p className="mt-1 text-2xl font-black text-amber-950">{tenantFilteredUsers.filter(u => u.status === 'Pending').length}</p>
        </div>
        <div className="border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-black uppercase text-slate-500">Linked Records</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{tenantFilteredUsers.filter(u => u.linkedTeacherId || u.linkedStudentId || u.linkedStudentIds?.length).length}</p>
        </div>
      </div>

      {inviteMessage && (
        <section className="border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-emerald-800">Invite message ready</p>
              <pre className="mt-2 whitespace-pre-wrap border border-emerald-200 bg-white p-3 text-xs font-bold leading-relaxed text-slate-800">{inviteMessage}</pre>
            </div>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(inviteMessage)}
              className="bg-emerald-700 px-4 py-2 text-xs font-black text-white"
            >
              Copy Invite
            </button>
            <div className="grid gap-2 sm:grid-cols-3 lg:w-80">
              <a href={`mailto:?subject=${encodeURIComponent(`${activeTenant?.name || 'School'} portal invite`)}&body=${encodeURIComponent(inviteMessage)}`} className="border border-emerald-200 bg-white px-3 py-2 text-center text-xs font-black text-emerald-800">Email</a>
              <a href={`sms:?&body=${encodeURIComponent(inviteMessage)}`} className="border border-emerald-200 bg-white px-3 py-2 text-center text-xs font-black text-emerald-800">SMS</a>
              <a href={`https://wa.me/?text=${encodeURIComponent(inviteMessage)}`} target="_blank" rel="noreferrer" className="border border-emerald-200 bg-white px-3 py-2 text-center text-xs font-black text-emerald-800">WhatsApp</a>
            </div>
          </div>
        </section>
      )}

      {showAddForm && (
        <div className="bg-slate-50 border border-[#CBD5E1] rounded p-5 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 pb-3 border-b border-slate-200 mb-4 text-xs font-mono font-bold text-slate-500 uppercase">
            <UserPlus className="w-4 h-4 text-[#1A56DB]" />
            <span>Create login inside: {activeTenant?.code || effectiveTenantId}</span>
          </div>

          <form onSubmit={handleUserAppend} className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {isSuperAdmin && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">School</label>
                <select value={targetTenantId} onChange={(e) => setTargetTenantId(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none">
                  {schools.map(school => <option key={school.id} value={school.id}>{school.name}</option>)}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
              <input id="rbac-user-name" value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Email / Username</label>
              <input id="rbac-user-email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Role</label>
              <select id="rbac-user-role" value={userRole} onChange={(e) => setUserRole(e.target.value as UserRole)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold">
                {creatableRoles.map(role => <option key={role} value={role}>{roleLabel(role)}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Department / Group</label>
              <input value={userDepartment} onChange={(e) => setUserDepartment(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none" placeholder="e.g. Accounts, JHS, Science" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Phone</label>
              <input value={userPhone} onChange={(e) => setUserPhone(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none" />
            </div>

            {userRole === 'Teacher' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Link Teacher Profile</label>
                <select value={linkedTeacherId} onChange={(e) => setLinkedTeacherId(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none">
                  <option value="">Choose teacher profile</option>
                  {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName} - {teacher.staffId}</option>)}
                </select>
              </div>
            )}

            {userRole === 'Student' && (
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Link Student Record</label>
                <select value={linkedStudentId} onChange={(e) => setLinkedStudentId(e.target.value)} className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-blue-500 focus:outline-none">
                  <option value="">Choose student record</option>
                  {students.map(student => <option key={student.id} value={student.id}>{student.fullName} - {student.studentId}</option>)}
                </select>
              </div>
            )}

            {userRole === 'Parent' && (
              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Link Child / Children</label>
                <div className="grid max-h-40 gap-2 overflow-y-auto border border-slate-200 bg-white p-2 sm:grid-cols-2">
                  {students.map(student => (
                    <label key={student.id} className="flex items-center gap-2 border border-slate-100 bg-slate-50 px-2 py-2 text-[11px] font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={linkedStudentIds.includes(student.id)}
                        onChange={(e) => {
                          setLinkedStudentIds(prev => e.target.checked ? [...prev, student.id] : prev.filter(id => id !== student.id));
                        }}
                        className="h-4 w-4 accent-blue-600"
                      />
                      <span>{student.fullName} - {student.studentId}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {userRole === 'Teacher' && selectedTeacher && (
              <div className="md:col-span-3 border border-blue-100 bg-blue-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">Teacher workload preview</p>
                <div className="mt-2 grid gap-3 md:grid-cols-3">
                  <div className="border border-blue-100 bg-white p-2">
                    <p className="text-[10px] font-black text-slate-500">Classes</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{selectedTeacher.assignedClasses.map(id => classes.find(c => c.id === id)?.name || id).join(', ') || 'No classes assigned'}</p>
                  </div>
                  <div className="border border-blue-100 bg-white p-2">
                    <p className="text-[10px] font-black text-slate-500">Subjects</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">{selectedTeacher.subjectsTaught.map(id => subjects.find(s => s.id === id)?.name || id).join(', ') || 'No subjects assigned'}</p>
                  </div>
                  <div className="border border-blue-100 bg-white p-2">
                    <p className="text-[10px] font-black text-slate-500">Timetable</p>
                    <p className="mt-1 text-xs font-bold text-slate-800">
                      {selectedTeacher.teachingSchedule?.slice(0, 3).map(slot => `${slot.day} ${slot.startTime}-${slot.endTime}`).join(', ') || 'No timetable yet'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white p-3">
              <div>
                <p className="text-xs font-black text-slate-800">Activate immediately</p>
                <p className="text-[10px] font-semibold text-slate-500">Turn off to keep account pending.</p>
              </div>
              <input type="checkbox" checked={activateImmediately} onChange={(e) => setActivateImmediately(e.target.checked)} className="h-4 w-4 accent-blue-600" />
            </div>

            <div className="flex flex-col justify-end">
              <button id="btn-confirm-rbac-add" type="submit" className="w-full py-2 bg-[#1A56DB] hover:bg-opacity-90 text-white rounded text-xs font-bold shadow-sm transition-colors cursor-pointer">
                Create Account
              </button>
            </div>

            {formError && (
              <div className="md:col-span-3 text-[11px] font-semibold text-rose-700 bg-rose-50 p-3 rounded border border-rose-100 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}
          </form>
        </div>
      )}

      {pendingRequests.length > 0 && (
        <section className="border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-amber-800">Manager approval queue</p>
              <h3 className="text-base font-black text-slate-950">{pendingRequests.length} pending access request(s)</h3>
            </div>
            <span className="w-fit border border-amber-300 bg-white px-3 py-1 text-xs font-black text-amber-800">Link before approving</span>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {pendingRequests.map(item => (
              <div key={`pending-${item.id}`} className="border border-amber-200 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">{item.name}</p>
                    <p className="text-[10px] font-mono font-bold text-slate-500">{item.email}</p>
                    <p className="mt-1 text-[10px] font-black uppercase text-amber-700">{roleLabel(item.role)} request</p>
                  </div>
                  <span className={`border px-2 py-1 text-[10px] font-black uppercase ${statusClass(item.status)}`}>{item.status}</span>
                </div>
                {item.role === 'Teacher' && (
                  <select value={item.linkedTeacherId || ''} onChange={(e) => onUpdateUser(item.id, { linkedTeacherId: e.target.value || undefined })} className="mt-3 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold">
                    <option value="">Link teacher profile</option>
                    {teachers.map(teacher => <option key={teacher.id} value={teacher.id}>{teacher.fullName} - {teacher.staffId}</option>)}
                  </select>
                )}
                {item.role === 'Student' && (
                  <select value={item.linkedStudentId || ''} onChange={(e) => onUpdateUser(item.id, { linkedStudentId: e.target.value || undefined })} className="mt-3 w-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold">
                    <option value="">Link student record</option>
                    {students.map(student => <option key={student.id} value={student.id}>{student.fullName} - {student.studentId}</option>)}
                  </select>
                )}
                {item.role === 'Parent' && (
                  <div className="mt-3 grid max-h-36 gap-2 overflow-y-auto border border-slate-200 bg-slate-50 p-2 sm:grid-cols-2">
                    {students.map(student => {
                      const currentIds = item.linkedStudentIds?.length ? item.linkedStudentIds : item.linkedStudentId ? [item.linkedStudentId] : [];
                      return (
                        <label key={student.id} className="flex items-center gap-2 bg-white px-2 py-2 text-[10px] font-bold text-slate-700">
                          <input
                            type="checkbox"
                            checked={currentIds.includes(student.id)}
                            onChange={() => togglePendingChild(item, student.id)}
                            className="h-4 w-4 accent-blue-600"
                          />
                          <span>{student.fullName}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!canActivate(item)) {
                        alert('Link this request to the correct record before approving.');
                        return;
                      }
                      const temporaryPassword = item.temporaryPassword && item.temporaryPassword !== 'Pending manager approval' ? item.temporaryPassword : generateTemporaryPassword();
                      onUpdateUser(item.id, { status: 'Active', temporaryPassword, mustChangePassword: true });
                      setInviteMessage(createInviteMessage(item, temporaryPassword));
                    }}
                    className="bg-emerald-600 px-3 py-2 text-xs font-black text-white"
                  >
                    Approve
                  </button>
                  <button type="button" onClick={() => onUpdateUser(item.id, { status: 'Suspended' })} className="bg-rose-600 px-3 py-2 text-xs font-black text-white">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {resetRequests.filter((item: any) => item.status === 'Pending').length > 0 && (
        <section className="border border-blue-200 bg-blue-50 p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-blue-800">Password reset queue</p>
              <h3 className="text-base font-black text-slate-950">{resetRequests.filter((item: any) => item.status === 'Pending').length} reset request(s)</h3>
            </div>
            <span className="w-fit border border-blue-200 bg-white px-3 py-1 text-xs font-black text-blue-800">Manager approval needed</span>
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {resetRequests.filter((item: any) => item.status === 'Pending').map((request: any) => {
              const account = tenantFilteredUsers.find(user => user.email.toLowerCase() === request.email.toLowerCase());
              return (
                <div key={request.id} className="border border-blue-200 bg-white p-3">
                  <p className="text-sm font-black text-slate-950">{account?.name || request.email}</p>
                  <p className="text-[10px] font-mono font-bold text-slate-500">{request.email}</p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-500">Requested: {new Date(request.createdAt).toLocaleString()}</p>
                  {!account && <p className="mt-2 border border-rose-100 bg-rose-50 p-2 text-[11px] font-bold text-rose-700">No matching account found in this school.</p>}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!account}
                      onClick={() => {
                        if (!account) return;
                        const temporaryPassword = generateTemporaryPassword();
                        onUpdateUser(account.id, { temporaryPassword, mustChangePassword: true });
                        setInviteMessage(createInviteMessage(account, temporaryPassword));
                        saveResetRequests(resetRequests.map((entry: any) => entry.id === request.id ? { ...entry, status: 'Approved', approvedAt: new Date().toISOString() } : entry));
                      }}
                      className="bg-blue-600 px-3 py-2 text-xs font-black text-white disabled:bg-slate-300"
                    >
                      Approve Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => saveResetRequests(resetRequests.map((entry: any) => entry.id === request.id ? { ...entry, status: 'Rejected', approvedAt: new Date().toISOString() } : entry))}
                      className="bg-rose-600 px-3 py-2 text-xs font-black text-white"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded border border-banking-border overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-banking-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search user, email, department..." className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded text-xs focus:outline-none" />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="text-xs bg-white border border-slate-200 rounded p-2 focus:outline-none text-slate-700 font-semibold cursor-pointer">
              <option value="ALL">All Roles</option>
              {creatableRoles.map(role => <option key={role} value={role}>{roleLabel(role)}</option>)}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-banking-border text-[9px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Account</th>
                  <th className="py-2.5 px-4">Role / Status</th>
                  <th className="py-2.5 px-4">Linked Record</th>
                  <th className="py-2.5 px-4">Audit</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayUsers.map(item => {
                  const teacher = teachers.find(t => t.id === item.linkedTeacherId);
                  const student = students.find(s => s.id === item.linkedStudentId);
                  const childNames = linkedStudentNames(item);
                  const canDelete = item.role !== 'SchoolAdmin' || tenantFilteredUsers.filter(u => u.role === 'SchoolAdmin').length > 1;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5 select-all">
                          <Mail className="w-2.5 h-2.5 shrink-0" />
                          <span>{item.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-block rounded border border-blue-200 bg-blue-50 px-2 py-1 text-[9px] font-black uppercase text-blue-800">{roleLabel(item.role)}</span>
                        <span className={`ml-1 inline-block rounded border px-2 py-1 text-[9px] font-black uppercase ${statusClass(item.status)}`}>{item.status}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {teacher || student || childNames.length > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-800">
                            <Link2 className="h-3 w-3" />
                            {teacher?.fullName || childNames.join(', ') || student?.fullName}
                          </span>
                        ) : (
                          <span className="text-slate-400">No linked record needed</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[10px] font-semibold text-slate-500">
                        <p>Created: {new Date(item.createdAt).toLocaleDateString()}</p>
                        <p>By: {item.createdBy || 'seed data'}</p>
                        <p>Last login: {item.lastLogin ? new Date(item.lastLogin).toLocaleDateString() : 'Not yet'}</p>
                        {item.mustChangePassword && <p className="font-black text-amber-700">Must change password</p>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-1.5">
                          {item.status !== 'Active' && (
                            <button type="button" onClick={() => {
                              if (!canActivate(item)) {
                                alert('Link this account to the correct record before activation.');
                                return;
                              }
                              const temporaryPassword = item.temporaryPassword || generateTemporaryPassword();
                              onUpdateUser(item.id, { status: 'Active', temporaryPassword, mustChangePassword: true });
                              setInviteMessage(createInviteMessage(item, temporaryPassword));
                            }} className="rounded border border-emerald-200 bg-emerald-50 p-2 text-emerald-700" title="Activate account">
                              <CheckCircle className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {item.status === 'Active' && item.role !== 'SchoolAdmin' && (
                            <button type="button" onClick={() => onUpdateUser(item.id, { status: 'Suspended' })} className="rounded border border-amber-200 bg-amber-50 p-2 text-amber-700" title="Suspend account">
                              <Lock className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button type="button" onClick={() => resetPassword(item)} className="rounded border border-blue-200 bg-blue-50 p-2 text-blue-700" title="Reset temporary password">
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!canDelete) {
                                alert('At least one Manager / Principal account must remain active for this school.');
                                return;
                              }
                              if (window.confirm(`Remove ${item.name} from this school?`)) onDeleteUser(item.id);
                            }}
                            className={`rounded border border-rose-200 bg-rose-50 p-2 text-rose-700 ${canDelete ? '' : 'opacity-40'}`}
                            title="Delete account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded border border-banking-border overflow-hidden self-start">
          <div className="p-4 bg-slate-50 border-b border-banking-border flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-mono font-bold text-slate-700 uppercase">Access Rules</h3>
          </div>
          <div className="p-4 space-y-3">
            {creatableRoles.map(role => (
              <div key={role} className="border border-slate-100 rounded p-3">
                <p className="text-xs font-black text-slate-850">{roleLabel(role)}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {permissionsForRole(role).map(page => (
                    <span key={page} className="rounded border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-bold text-slate-600">{page}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="bg-white rounded border border-banking-border overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <h3 className="text-xs font-black uppercase tracking-wide text-slate-700">School activity timeline</h3>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">Shows manager, teacher, parent, and student activity for the selected day/month/year filter below.</p>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
          {visibleActivityTimeline.length === 0 ? (
            <p className="p-4 text-xs font-semibold text-slate-500">No activity records in this range yet.</p>
          ) : visibleActivityTimeline.slice(0, 20).map((entry: any) => (
            <div key={entry.id} className="grid gap-2 p-3 text-xs md:grid-cols-[1fr_120px_180px] md:items-center">
              <div>
                <p className="font-black text-slate-900">{entry.action}</p>
                <p className="text-[11px] font-semibold text-slate-500">{entry.user}: {entry.details}</p>
              </div>
              <span className={`w-fit border px-2 py-1 text-[10px] font-black uppercase ${
                entry.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                entry.type === 'error' ? 'border-rose-200 bg-rose-50 text-rose-800' :
                entry.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' :
                'border-slate-200 bg-slate-50 text-slate-700'
              }`}>{entry.type}</span>
              <p className="font-mono text-[10px] font-bold text-slate-500">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white rounded border border-banking-border overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wide text-slate-700">Login audit history</h3>
              <p className="mt-1 text-[11px] font-semibold text-slate-500">Filter by day, month, year, or all records for academic tracking.</p>
            </div>
            <select value={auditRange} onChange={(event) => setAuditRange(event.target.value as typeof auditRange)} className="border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700">
              <option value="today">Today</option>
              <option value="month">This month</option>
              <option value="year">This year</option>
              <option value="all">All records</option>
            </select>
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
          {visibleLoginAudit.length === 0 ? (
            <p className="p-4 text-xs font-semibold text-slate-500">No login audit records yet.</p>
          ) : visibleLoginAudit.slice(0, 20).map((entry: any) => (
            <div key={entry.id} className="grid gap-2 p-3 text-xs md:grid-cols-[1fr_120px_180px] md:items-center">
              <div>
                <p className="font-black text-slate-900">{entry.email}</p>
                <p className="text-[11px] font-semibold text-slate-500">{entry.detail}</p>
              </div>
              <span className={`w-fit border px-2 py-1 text-[10px] font-black uppercase ${
                entry.status === 'success' || entry.status === 'password_changed' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' :
                entry.status === 'failed' ? 'border-rose-200 bg-rose-50 text-rose-800' :
                'border-amber-200 bg-amber-50 text-amber-800'
              }`}>{entry.status}</span>
              <p className="font-mono text-[10px] font-bold text-slate-500">{entry.createdAt ? new Date(entry.createdAt).toLocaleString() : ''}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
