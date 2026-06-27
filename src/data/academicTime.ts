export type AcademicTimeScope = {
  mode: 'day' | 'month' | 'term' | 'year' | 'all';
  date: string;
  month: string;
  academicYear: string;
  term: string;
};

function today() {
  return new Date().toISOString().split('T')[0];
}

export function getActiveAcademicContext(tenantId = 'school_central_crest') {
  let academicYear = '2025/2026';
  let term = 'First Term';
  try {
    const years = JSON.parse(localStorage.getItem(`educore_academic_years_${tenantId}`) || '[]');
    const terms = JSON.parse(localStorage.getItem(`educore_terms_${tenantId}`) || '[]');
    academicYear = years.find((item: any) => item.status === 'Active')?.name || academicYear;
    term = terms.find((item: any) => item.status === 'Active')?.name || term;
  } catch {
    // Keep defaults for early demo startup.
  }
  return { academicYear, term };
}

export function getAcademicTimeScope(tenantId = 'school_central_crest'): AcademicTimeScope {
  const active = getActiveAcademicContext(tenantId);
  try {
    const saved = JSON.parse(localStorage.getItem(`educore_time_scope_${tenantId}`) || '{}');
    return {
      mode: saved.mode || 'term',
      date: saved.date || today(),
      month: saved.month || today().slice(0, 7),
      academicYear: saved.academicYear || active.academicYear,
      term: saved.term || active.term,
    };
  } catch {
    return { mode: 'term', date: today(), month: today().slice(0, 7), ...active };
  }
}

export function saveAcademicTimeScope(tenantId: string, scope: AcademicTimeScope) {
  localStorage.setItem(`educore_time_scope_${tenantId}`, JSON.stringify(scope));
  window.dispatchEvent(new CustomEvent('educore-time-scope-change', { detail: { tenantId, scope } }));
}

export function matchesAcademicTimeScope(recordDate: string | undefined, scope: AcademicTimeScope) {
  if (scope.mode === 'all') return true;
  if (!recordDate) return true;
  const date = recordDate.slice(0, 10);
  if (scope.mode === 'day') return date === scope.date;
  if (scope.mode === 'month') return date.startsWith(scope.month);
  return true;
}

export function archiveCurrentAcademicYear(tenantId: string) {
  const active = getActiveAcademicContext(tenantId);
  const archiveKey = `educore_academic_archive_${tenantId}`;
  const previous = JSON.parse(localStorage.getItem(archiveKey) || '[]');
  const snapshot = {
    id: `archive_${Date.now()}`,
    tenantId,
    academicYear: active.academicYear,
    term: active.term,
    archivedAt: new Date().toISOString(),
    counts: {
      attendance: JSON.parse(localStorage.getItem(`educore_attendance_${tenantId}`) || '[]').length,
      assignments: JSON.parse(localStorage.getItem(`educore_assignments_${tenantId}`) || '[]').length,
      lessons: JSON.parse(localStorage.getItem(`educore_lessons_${tenantId}`) || '[]').length,
      fees: JSON.parse(localStorage.getItem(`educore_invoices_${tenantId}`) || '[]').length,
      workflows: Object.keys(localStorage).filter(key => key.startsWith(`educore_backend_workflow_${tenantId}_`)).length,
    },
  };
  localStorage.setItem(archiveKey, JSON.stringify([snapshot, ...previous]));
  return snapshot;
}
