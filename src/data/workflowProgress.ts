import { appendActivityLog } from './mockData';
import { getActiveAcademicContext } from './academicTime';
import { User } from '../types';

export type WorkflowProgress = {
  key: string;
  userId: string;
  tenantId: string;
  role: User['role'];
  doneSteps: number[];
  completed: boolean;
  updatedAt: string;
  source: string;
  academicYear?: string;
  term?: string;
};

const WORKFLOW_RULES: Record<string, { label: string; roles: User['role'][]; daily?: boolean }> = {
  'teacher-attendance': { label: 'Teacher attendance', roles: ['Teacher'], daily: true },
  'teacher-lesson': { label: 'Teacher lesson record', roles: ['Teacher'], daily: true },
  'teacher-material': { label: 'Teacher materials', roles: ['Teacher'] },
  'teacher-assignment': { label: 'Teacher assignments', roles: ['Teacher'] },
  'manager-timetable': { label: 'Manager timetable', roles: ['SchoolAdmin'] },
  'manager-fees': { label: 'Manager fees', roles: ['SchoolAdmin'] },
  'parent-messages': { label: 'Parent messages', roles: ['Parent'], daily: true },
  'parent-assignments': { label: 'Parent assignments', roles: ['Parent'] },
  'parent-fees': { label: 'Parent fees', roles: ['Parent'] },
  'parent-attendance': { label: 'Parent attendance', roles: ['Parent'] },
  'student-dashboard': { label: 'Student timetable', roles: ['Student'], daily: true },
  'student-assignments': { label: 'Student assignments', roles: ['Student'] },
  'student-materials': { label: 'Student materials', roles: ['Student'] },
  'student-revision': { label: 'Student revision', roles: ['Student'] },
};

function getSession(): Partial<User> & { userId?: string } {
  try {
    return JSON.parse(localStorage.getItem('educore_portal_session') || '{}');
  } catch {
    return {};
  }
}

function getStorageKey(progressKey: string, session = getSession()) {
  const tenantId = session.tenantId || 'GLOBAL';
  const userId = session.userId || session.id || 'guest';
  return `educore_backend_workflow_${tenantId}_${userId}_${progressKey}`;
}

function isAllowed(progressKey: string, role?: User['role']) {
  const rule = WORKFLOW_RULES[progressKey];
  return !rule || !role || rule.roles.includes(role);
}

export function getWorkflowLabel(progressKey: string) {
  return WORKFLOW_RULES[progressKey]?.label || progressKey.replace(/-/g, ' ');
}

export function loadWorkflowProgress(progressKey: string): Partial<WorkflowProgress> {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey(progressKey)) || '{}');
  } catch {
    return {};
  }
}

export function saveWorkflowProgress(
  progressKey: string,
  patch: Partial<Pick<WorkflowProgress, 'doneSteps' | 'completed'>>,
  source: string
) {
  const session = getSession();
  const role = session.role as User['role'] | undefined;
  if (!isAllowed(progressKey, role)) {
    return { ok: false, reason: `${role || 'Unknown role'} cannot update ${getWorkflowLabel(progressKey)}.` };
  }

  const previous = loadWorkflowProgress(progressKey);
  const academic = getActiveAcademicContext(session.tenantId || 'GLOBAL');
  const payload: WorkflowProgress = {
    key: progressKey,
    userId: session.userId || session.id || 'guest',
    tenantId: session.tenantId || 'GLOBAL',
    role: role || 'Student',
    doneSteps: patch.doneSteps || previous.doneSteps || [],
    completed: Boolean(patch.completed ?? previous.completed),
    updatedAt: new Date().toISOString(),
    source,
    academicYear: academic.academicYear,
    term: academic.term,
  };

  localStorage.setItem(getStorageKey(progressKey, session), JSON.stringify(payload));
  localStorage.setItem('educore_pending_sync_count', String(Number(localStorage.getItem('educore_pending_sync_count') || '0') + 1));

  if (payload.completed && !previous.completed) {
    appendActivityLog({
      tenantId: payload.tenantId,
      user: session.email || payload.userId,
      action: 'Workflow Completed',
      details: `${getWorkflowLabel(progressKey)} marked done from ${source}.`,
      type: 'success',
    });
  }

  window.dispatchEvent(new CustomEvent('educore-workflow-progress', { detail: payload }));
  return { ok: true, progress: payload };
}

export function isWorkflowOverdue(progressKey: string, progress: Partial<WorkflowProgress>) {
  const rule = WORKFLOW_RULES[progressKey];
  if (!rule?.daily || progress.completed) return false;
  if (!progress.updatedAt) return true;
  return new Date(progress.updatedAt).toDateString() !== new Date().toDateString();
}

export function listTenantWorkflowProgress(tenantId: string) {
  const items: WorkflowProgress[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i) || '';
    if (!key.startsWith(`educore_backend_workflow_${tenantId}_`)) continue;
    try {
      items.push(JSON.parse(localStorage.getItem(key) || '{}'));
    } catch {
      // Ignore malformed local demo records.
    }
  }
  return items;
}
