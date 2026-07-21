import { User } from '../types';

const TOKEN_KEY = 'educore_backend_token';

export const backendApiEnabled = () => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('educore_use_backend_api') === '1' || import.meta.env.VITE_BACKEND_API === '1';
};

export const backendToken = () => localStorage.getItem(TOKEN_KEY) || '';

export function saveBackendToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearBackendToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = backendToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || body.message || `Backend request failed: ${response.status}`);
  return body as T;
}

export async function backendLogin(email: string, password: string, schoolId?: string) {
  const result = await request<{ token: string; expiresAt: string; user: User }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, schoolId }),
  });
  saveBackendToken(result.token);
  return result;
}

export async function backendAuthorizeAccess(payload: {
  userId: string;
  tenantId: string;
  role: User['role'];
  tab: string;
}) {
  return request<{ ok: boolean; allowed: boolean; reason?: string }>('/api/auth/authorize', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function backendAuditEvent(event: {
  tenantId: string | 'GLOBAL';
  user: string;
  action: string;
  details: string;
  type?: string;
}) {
  return request<{ ok: boolean; id: string }>('/api/audit/events', {
    method: 'POST',
    body: JSON.stringify(event),
  });
}

export async function backendRequestPasswordReset(payload: {
  tenantId: string;
  schoolName: string;
  email: string;
}) {
  return request<{ ok: boolean; message: string; requestId: string }>('/api/auth/password-reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function backendUploadMaterialFile(payload: {
  tenantId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  title: string;
  classId: string;
  subjectId: string;
}) {
  return request<{ ok: boolean; storageKey: string; downloadUrl: string }>('/api/materials/upload-intent', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function backendRecordPayment(payload: {
  tenantId: string;
  invoiceId: string;
  amountPaid: number;
  currencyCode: string;
  paymentMethod: string;
  transactionReference: string;
}) {
  return request<{ ok: boolean; receiptNumber: string; status: string }>('/api/payments/record', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function backendLogout() {
  try {
    await request('/api/auth/logout', { method: 'POST' });
  } finally {
    clearBackendToken();
  }
}

export async function backendHealth() {
  return request<{ ok: boolean; mode: string; tables: string[]; updatedAt: string }>('/api/health');
}

export async function migrateBrowserExport(payload: unknown) {
  return request<{ ok: boolean; imported: Record<string, number> }>('/api/migration/browser-export', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function backendEnvCheck() {
  return request<{ ok: boolean; checks: Array<{ name: string; ok: boolean; detail: string }> }>('/api/admin/env-check');
}

export async function backendBackup() {
  return request<{ ok: boolean; backupFile: string; bytes: number }>('/api/admin/backup', { method: 'POST' });
}

export async function backendResetDemoData() {
  return request<{ ok: boolean; message: string }>('/api/admin/reset-demo-data', { method: 'POST' });
}
