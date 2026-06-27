/**
 * Paste this script into the browser console while signed into the old/local
 * portal to download a JSON export. Then POST the file contents to:
 *   POST /api/migration/browser-export
 * as a SuperAdmin.
 */
(() => {
  const read = (key) => {
    try {
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      return [];
    }
  };
  const tenantIds = read('educore_schools').map((school) => school.id).filter(Boolean);
  const collectTenantRows = (prefix) => tenantIds.flatMap((tenantId) => read(`${prefix}_${tenantId}`));
  const exportData = {
    exportedAt: new Date().toISOString(),
    tables: {
      schools: read('educore_schools'),
      users: read('educore_users'),
      students: collectTenantRows('educore_students'),
      teachers: collectTenantRows('educore_teachers'),
      fees: collectTenantRows('educore_fee_items'),
      materials: collectTenantRows('educore_materials'),
      assignments: collectTenantRows('educore_assignments'),
      audits: read('educore_activity_logs'),
      archives: tenantIds.flatMap((tenantId) => read(`educore_academic_archive_${tenantId}`)),
    },
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `educore-browser-export-${Date.now()}.json`;
  link.click();
  URL.revokeObjectURL(url);
})();
