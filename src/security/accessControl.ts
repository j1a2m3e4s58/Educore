/**
 * Central role and page access rules for the portal.
 * Keep this file aligned with backend middleware when API persistence is added.
 */
import { User, School } from '../types';

export type AccessRole = User['role'];

export interface PortalSession {
  userId: string;
  tenantId: User['tenantId'];
  role: AccessRole;
  email: string;
  issuedAt: string;
  expiresAt: string;
}

const SESSION_KEY = 'educore_portal_session';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const HOME_TAB_BY_ROLE: Record<AccessRole, string> = {
  SuperAdmin: 'dashboard',
  SchoolAdmin: 'school-dashboard',
  Teacher: 'teacher-dashboard',
  Parent: 'parent-dashboard',
  Student: 'student-dashboard',
  Accountant: 'school-fees',
  Supervisor: 'school-review',
  AssistantAdmin: 'school-dashboard',
};

export const ROLE_ALLOWED_TABS: Record<AccessRole, string[]> = {
  SuperAdmin: [
    'dashboard',
    'edu-ecosystem',
    'commercial-hub',
    'eduos-engine',
    'register',
    'schools',
    'sa-tenants',
    'sa-subscriptions',
    'sa-audit-security',
    'sa-system-ops',
    'sa-support-tickets',
    'roles',
    'settings',
  ],
  SchoolAdmin: [
    'school-dashboard',
    'edu-ecosystem',
    'commercial-hub',
    'eduos-engine',
    'school-review',
    'school-teachers',
    'school-students',
    'school-classes',
    'school-subjects',
    'school-departments',
    'school-fees',
    'school-comm',
    'school-calendar',
    'school-academic-year',
    'school-users',
    'school-permissions',
    'school-import',
    'school-log',
    'school-settings',
    'school-ai-suite',
  ],
  Accountant: [
    'school-dashboard',
    'school-fees',
    'school-comm',
    'school-calendar',
    'school-log',
  ],
  Supervisor: [
    'school-dashboard',
    'school-review',
    'school-teachers',
    'school-students',
    'school-classes',
    'school-subjects',
    'school-calendar',
    'school-log',
  ],
  AssistantAdmin: [
    'school-dashboard',
    'school-review',
    'school-teachers',
    'school-students',
    'school-classes',
    'school-subjects',
    'school-fees',
    'school-comm',
    'school-calendar',
    'school-users',
    'school-import',
    'school-log',
  ],
  Teacher: [
    'teacher-dashboard',
    'edu-ecosystem',
    'commercial-hub',
    'eduos-engine',
    'teacher-assignments',
    'teacher-attendance',
    'teacher-lessons',
    'teacher-materials',
    'teacher-log',
    'teacher-ai-suite',
  ],
  Parent: [
    'parent-dashboard',
    'edu-ecosystem',
    'commercial-hub',
    'eduos-engine',
    'school-calendar',
  ],
  Student: [
    'student-dashboard',
    'edu-ecosystem',
    'commercial-hub',
    'eduos-engine',
    'school-calendar',
  ],
};

export function canAccessTab(user: User | null, tab: string): boolean {
  if (!user) return false;
  return ROLE_ALLOWED_TABS[user.role]?.includes(tab) ?? false;
}

export function getSafeTabForRole(role: AccessRole, requestedTab?: string): string {
  if (requestedTab && ROLE_ALLOWED_TABS[role]?.includes(requestedTab)) return requestedTab;
  return HOME_TAB_BY_ROLE[role];
}

export function canAccessTenant(user: User | null, tenantId?: string | null): boolean {
  if (!user) return false;
  if (user.role === 'SuperAdmin') return true;
  return Boolean(tenantId && user.tenantId === tenantId);
}

export function isActiveUser(user: User | null): boolean {
  return Boolean(user && user.status === 'Active');
}

export function createPortalSession(user: User): PortalSession {
  const now = Date.now();
  return {
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + SESSION_TTL_MS).toISOString(),
  };
}

export function savePortalSession(user: User): PortalSession {
  const session = createPortalSession(user);
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function readPortalSession(): PortalSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PortalSession;
    if (!session.userId || !session.role || !session.expiresAt) return null;
    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      clearPortalSession();
      return null;
    }
    return session;
  } catch {
    clearPortalSession();
    return null;
  }
}

export function clearPortalSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function restoreUserFromSession(users: User[], schools: School[]): { user: User; tenant: School | null } | null {
  const session = readPortalSession();
  if (!session) return null;
  const user = users.find(candidate => candidate.id === session.userId && candidate.role === session.role && candidate.email === session.email);
  if (!isActiveUser(user || null)) {
    clearPortalSession();
    return null;
  }
  if (user?.role !== 'SuperAdmin' && user?.tenantId !== session.tenantId) {
    clearPortalSession();
    return null;
  }
  const tenant = user?.role === 'SuperAdmin' ? null : schools.find(school => school.id === user?.tenantId) || null;
  if (user?.role !== 'SuperAdmin' && !tenant) {
    clearPortalSession();
    return null;
  }
  return user ? { user, tenant } : null;
}
