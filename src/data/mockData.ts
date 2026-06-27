/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  School, 
  User, 
  ActivityLog, 
  TenantSystemSettings,
  Teacher,
  Student,
  Class,
  Subject,
  Department,
  AcademicYear,
  Term,
  RolePermission,
  Assignment,
  AttendanceRecord,
  LessonRecord,
  TeachingMaterial,
  MaterialUsageLog,
  TeacherActivityLog
} from '../types';

// Default seeded schools representing institutional clients
export const DEFAULTS_SCHOOLS: School[] = [
  {
    id: 'school_central_crest',
    name: 'Central Crest Collegiate',
    code: 'EDU-CENTRAL',
    location: '102 Lexington Pkwy, Boston, MA',
    phone: '+1 (617) 555-0190',
    email: 'admin@centralcrest.edu',
    subscriptionPackage: 'Premium',
    status: 'Active',
    logo: 'CC',
    adminName: 'Dr. Sarah Jenkins',
    adminEmail: 's.jenkins@centralcrest.edu',
    createdAt: '2025-09-12T08:00:00Z',
    studentCount: 1240,
    teacherCount: 82,
    classCount: 36
  },
  {
    id: 'school_st_jude',
    name: 'St. Jude International Academy',
    code: 'EDU-STJUDE',
    location: '404 Westhaven Road, Houston, TX',
    phone: '+1 (713) 555-0143',
    email: 'contact@stjude.edu',
    subscriptionPackage: 'Enterprise',
    status: 'Active',
    logo: 'SJ',
    adminName: 'Principal Arthur Vance',
    adminEmail: 'a.vance@stjude.edu',
    createdAt: '2025-11-04T09:30:00Z',
    studentCount: 890,
    teacherCount: 54,
    classCount: 24
  },
  {
    id: 'school_apex_collegiate',
    name: 'Apex Collegiate Institute',
    code: 'EDU-APEX',
    location: '277 Silicon Valley Blvd, San Jose, CA',
    phone: '+1 (408) 555-0112',
    email: 'info@apexcollegiate.org',
    subscriptionPackage: 'Basic',
    status: 'Suspended', // To show how Suspended states render
    logo: 'AC',
    adminName: 'Director Miriam Sterling',
    adminEmail: 'm.sterling@apexcollegiate.org',
    createdAt: '2026-01-15T11:00:00Z',
    studentCount: 410,
    teacherCount: 22,
    classCount: 14
  }
];

// Seeded users partitionable by tenantId (school ID)
export const DEFAULT_USERS: User[] = [
  // Super Admin (No tenant, controls everything)
  {
    id: 'user_sa_1',
    tenantId: 'SUPER_ADMIN',
    name: 'EduCore General Super Admin',
    email: 'superadmin@educore.ai',
    role: 'SuperAdmin',
    status: 'Active',
    phone: '+1 (800) 555-9000',
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: '2026-06-18T09:44:12Z'
  },
  // School Admins for secure tenants
  {
    id: 'user_admin_central',
    tenantId: 'school_central_crest',
    name: 'Dr. Sarah Jenkins',
    email: 's.jenkins@centralcrest.edu',
    role: 'SchoolAdmin',
    status: 'Active',
    phone: '+1 (617) 555-0191',
    createdAt: '2025-09-12T08:15:00Z',
    lastLogin: '2026-06-18T10:02:41Z',
    department: 'Administration'
  },
  {
    id: 'user_admin_stjude',
    tenantId: 'school_st_jude',
    name: 'Principal Arthur Vance',
    email: 'a.vance@stjude.edu',
    role: 'SchoolAdmin',
    status: 'Active',
    phone: '+1 (713) 555-0144',
    createdAt: '2025-11-04T09:45:00Z',
    lastLogin: '2026-06-17T15:20:00Z',
    department: 'Administration'
  },
  {
    id: 'user_admin_apex',
    tenantId: 'school_apex_collegiate',
    name: 'Director Miriam Sterling',
    email: 'm.sterling@apexcollegiate.org',
    role: 'SchoolAdmin',
    status: 'Active',
    phone: '+1 (408) 555-0113',
    createdAt: '2026-01-15T11:15:00Z',
    lastLogin: '2026-05-30T10:00:00Z',
    department: 'Executive Council'
  },
  // Sub-roles under Central Crest tenant (to demonstrate full RBAC settings)
  {
    id: 'user_teacher_central_1',
    tenantId: 'school_central_crest',
    name: 'Marcus Brody',
    email: 'm.brody@centralcrest.edu',
    role: 'Teacher',
    status: 'Active',
    phone: '+1 (617) 555-2211',
    createdAt: '2025-09-15T10:00:00Z',
    department: 'Mathematics'
  },
  {
    id: 'user_teacher_central_2',
    tenantId: 'school_central_crest',
    name: 'Elizabeth Vance',
    email: 'e.vance@centralcrest.edu',
    role: 'Teacher',
    status: 'Active',
    phone: '+1 (617) 555-2212',
    createdAt: '2025-09-15T10:30:00Z',
    department: 'Science & Chemistry'
  },
  {
    id: 'user_student_central_1',
    tenantId: 'school_central_crest',
    name: 'Julian Vance',
    email: 'j.vance@centralcrest.edu',
    role: 'Student',
    status: 'Active',
    phone: '+1 (617) 555-4811',
    createdAt: '2025-09-16T08:00:00Z'
  },
  {
    id: 'user_parent_central_1',
    tenantId: 'school_central_crest',
    name: 'Robert Vance',
    email: 'r.vance@gmail.com',
    role: 'Parent',
    status: 'Active',
    phone: '+1 (617) 555-9011',
    createdAt: '2025-09-16T18:00:00Z'
  }
];

// Central Crest dashboard mock stats for School Admin
export const CENTRAL_CREST_DASHBOARD_STATS = {
  totalTeachers: 82,
  totalStudents: 1240,
  totalClasses: 36,
  assignmentsGivenToday: 14,
  attendanceSubmittedToday: '96.4%',
  lessonRecordsSubmittedToday: 32,
  reportsWaitingReview: 5,
  recentActivities: [
    { id: 'act_1', user: 'Marcus Brody', action: 'Uploaded Assignment', details: 'Algebra II Quiz 3 uploaded for Class 10A.', time: '10 mins ago', type: 'info' },
    { id: 'act_2', user: 'Elisabeth Vance', action: 'Submitted Attendance', details: 'Biology Lab 12B attendance marked completed.', time: '1 hour ago', type: 'success' },
    { id: 'act_3', user: 'Dean Office', action: 'New Student Admitted', details: 'Julian Vance enrolled in Grade 10.', time: '3 hours ago', type: 'info' },
    { id: 'act_4', user: 'System Alert', action: 'Subscription Renewal', details: 'Subscription active. Next invoice date July 12, 2026.', time: '1 day ago', type: 'warning' }
  ],
  classAttendanceData: [
    { label: 'Grade 8', value: 98 },
    { label: 'Grade 9', value: 95 },
    { label: 'Grade 10', value: 94 },
    { label: 'Grade 11', value: 92 },
    { label: 'Grade 12', value: 97 }
  ]
};

// Default generic placeholder stats for other schools
export const DEFAULT_SCHOOL_DASHBOARD_STATS = {
  totalTeachers: 45,
  totalStudents: 580,
  totalClasses: 18,
  assignmentsGivenToday: 8,
  attendanceSubmittedToday: '92.1%',
  lessonRecordsSubmittedToday: 16,
  reportsWaitingReview: 2,
  recentActivities: [
    { id: 'act_g1', user: 'School Admin', action: 'Workspace Ready', details: 'Multi-tenant database configuration initialized successfully.', time: '2 hours ago', type: 'success' }
  ],
  classAttendanceData: [
    { label: 'A', value: 90 },
    { label: 'B', value: 92 },
    { label: 'C', value: 95 }
  ]
};

// Global audit activities for Super Admin (Central Monitoring Console)
export const DEFAULT_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'log_1',
    tenantId: 'GLOBAL',
    user: 'EduCore Engine',
    action: 'System Boot Completed',
    details: 'Central core database routing engines verified online.',
    timestamp: '2026-06-18T00:00:00Z',
    type: 'success'
  },
  {
    id: 'log_2',
    tenantId: 'school_central_crest',
    user: 'Dr. Sarah Jenkins',
    action: 'Tenant Config Synced',
    details: 'Central Crest updated school contact email to admin@centralcrest.edu.',
    timestamp: '2026-06-18T10:02:41Z',
    type: 'info'
  },
  {
    id: 'log_3',
    tenantId: 'school_apex_collegiate',
    user: 'System Auditor',
    action: 'Workspace Frozen',
    details: 'Apex Collegiate suspended automatically due to payment grace-period expiration.',
    timestamp: '2026-06-15T00:00:00Z',
    type: 'error'
  }
];

// Helper methods with localStorage integration to make the prototype functional
export const initializeStorage = () => {
  if (!localStorage.getItem('educore_schools')) {
    localStorage.setItem('educore_schools', JSON.stringify(DEFAULTS_SCHOOLS));
  }
  if (!localStorage.getItem('educore_users')) {
    localStorage.setItem('educore_users', JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem('educore_activity_logs')) {
    localStorage.setItem('educore_activity_logs', JSON.stringify(DEFAULT_ACTIVITY_LOGS));
  }
};

export const getSchoolsInStorage = (): School[] => {
  initializeStorage();
  const raw = localStorage.getItem('educore_schools');
  return raw ? JSON.parse(raw) : [];
};

export const saveSchoolsInStorage = (schools: School[]): void => {
  localStorage.setItem('educore_schools', JSON.stringify(schools));
};

export const getUsersInStorage = (): User[] => {
  initializeStorage();
  const raw = localStorage.getItem('educore_users');
  return raw ? JSON.parse(raw) : [];
};

export const saveUsersInStorage = (users: User[]): void => {
  localStorage.setItem('educore_users', JSON.stringify(users));
};

export const getActivityLogs = (): ActivityLog[] => {
  initializeStorage();
  const raw = localStorage.getItem('educore_activity_logs');
  return raw ? JSON.parse(raw) : [];
};

export const appendActivityLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>): void => {
  const current = getActivityLogs();
  const newLog: ActivityLog = {
    ...log,
    id: `log_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('educore_activity_logs', JSON.stringify([newLog, ...current]));
};

// Tenant System Settings (Isolated by tenant_id)
export const getTenantSettings = (tenantId: string): TenantSystemSettings => {
  const key = `educore_settings_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  // Default templates
  const defaults: TenantSystemSettings = {
    tenantId,
    academicYear: '2025/2026',
    term: 'First Term',
    themeColor: '#0A1E33', // Deep Navy
    allowParentReg: true,
    allowTeacherReg: true,
    smsSenderId: tenantId.substring(7, 13).toUpperCase().replace('_', '') || 'EDUCORE',
    schoolLogoInitials: 'EC',
    schoolMotto: 'Smart School Portal',
    contactPhone: '+233 000 000 000',
    contactEmail: 'office@school.edu',
    contactAddress: 'School address',
    currencyCode: 'GHS',
    periodType: 'Term'
  };
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

export const saveTenantSettings = (settings: TenantSystemSettings): void => {
  const key = `educore_settings_${settings.tenantId}`;
  localStorage.setItem(key, JSON.stringify(settings));
};

// ================= STAGE 2 MULTI-TENANT ISOLATED SEED DATA =================

const DEFAULTS_DEPARTMENTS: Department[] = [
  { id: 'dept_primary', tenantId: 'school_central_crest', name: 'Primary Department', HeadOfDepartment: 'Elizabeth Vance', createdAt: '2025-09-12T08:00:00Z' } as any,
  { id: 'dept_jhs', tenantId: 'school_central_crest', name: 'Junior High School', HeadOfDepartment: 'Marcus Brody', createdAt: '2025-09-12T08:00:00Z' } as any,
  { id: 'dept_science', tenantId: 'school_central_crest', name: 'Science & Tech Department', HeadOfDepartment: 'Elizabeth Vance', createdAt: '2025-09-12T08:00:00Z' } as any,
  { id: 'dept_languages', tenantId: 'school_central_crest', name: 'Languages Department', HeadOfDepartment: 'Marcus Brody', createdAt: '2025-09-12T08:00:00Z' } as any,
  { id: 'dept_admin', tenantId: 'school_central_crest', name: 'Administration', createdAt: '2025-09-12T08:00:00Z' }
];

const DEFAULTS_SUBJECTS: Subject[] = [
  { id: 'subj_english', tenantId: 'school_central_crest', name: 'English Language', code: 'ENG101', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_math', tenantId: 'school_central_crest', name: 'Mathematics', code: 'MAT101', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_science', tenantId: 'school_central_crest', name: 'Integrated Science', code: 'SCI150', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_social', tenantId: 'school_central_crest', name: 'Social Studies', code: 'SOC120', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_ict', tenantId: 'school_central_crest', name: 'Information & Comm. Technology', code: 'ICT101', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_arts', tenantId: 'school_central_crest', name: 'Creative Arts', code: 'ART101', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_rme', tenantId: 'school_central_crest', name: 'Religious & Moral Education', code: 'RME110', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'subj_ghanaian', tenantId: 'school_central_crest', name: 'Ghanaian Language (Twi)', code: 'GHA101', createdAt: '2025-09-12T08:00:00Z' }
];

const DEFAULTS_CLASSES: Class[] = [
  { id: 'class_b1', tenantId: 'school_central_crest', name: 'Basic 1', classTeacherId: 'tch_mbrody', subjectIds: ['subj_english', 'subj_math', 'subj_arts'], createdAt: '2025-09-12T08:00:00Z' },
  { id: 'class_b2', tenantId: 'school_central_crest', name: 'Basic 2', classTeacherId: 'tch_evance', subjectIds: ['subj_english', 'subj_math', 'subj_science', 'subj_arts'], createdAt: '2025-09-12T08:00:00Z' },
  { id: 'class_jhs1', tenantId: 'school_central_crest', name: 'JHS 1', classTeacherId: 'tch_mbrody', subjectIds: ['subj_english', 'subj_math', 'subj_science', 'subj_social', 'subj_ict', 'subj_rme', 'subj_ghanaian'], createdAt: '2025-09-12T08:00:00Z' },
  { id: 'class_jhs2', tenantId: 'school_central_crest', name: 'JHS 2', classTeacherId: 'tch_evance', subjectIds: ['subj_english', 'subj_math', 'subj_science', 'subj_social', 'subj_ict', 'subj_rme', 'subj_ghanaian'], createdAt: '2025-09-12T08:00:00Z' }
];

const DEFAULTS_TEACHERS: Teacher[] = [
  {
    id: 'tch_mbrody',
    tenantId: 'school_central_crest',
    fullName: 'Marcus Brody',
    staffId: 'TCH-001',
    phone: '+1 (617) 555-2211',
    email: 'm.brody@centralcrest.edu',
    gender: 'Male',
    departmentId: 'dept_science',
    subjectsTaught: ['subj_math', 'subj_science', 'subj_ict'],
    assignedClasses: ['class_b1', 'class_jhs1'],
    employmentStatus: 'Active',
    profilePhoto: '',
    createdAt: '2025-09-15T10:00:00Z'
  },
  {
    id: 'tch_evance',
    tenantId: 'school_central_crest',
    fullName: 'Elizabeth Vance',
    staffId: 'TCH-002',
    phone: '+1 (617) 555-2212',
    email: 'e.vance@centralcrest.edu',
    gender: 'Female',
    departmentId: 'dept_languages',
    subjectsTaught: ['subj_english', 'subj_ghanaian', 'subj_social'],
    assignedClasses: ['class_b2', 'class_jhs2'],
    employmentStatus: 'Active',
    profilePhoto: '',
    createdAt: '2025-09-15T10:30:00Z'
  }
];

const DEFAULTS_STUDENTS: Student[] = [
  {
    id: 'stu_j_vance',
    tenantId: 'school_central_crest',
    fullName: 'Julian Vance',
    studentId: 'STU-001',
    classId: 'class_jhs1',
    gender: 'Male',
    parentName: 'Robert Vance',
    parentPhone: '+1 (617) 555-9011',
    parentEmail: 'r.vance@gmail.com',
    dateOfBirth: '2012-05-14',
    admissionDate: '2025-09-16',
    status: 'Active',
    profilePhoto: '',
    createdAt: '2025-09-16T08:00:00Z'
  },
  {
    id: 'stu_s_brody',
    tenantId: 'school_central_crest',
    fullName: 'Sarah Brody',
    studentId: 'STU-002',
    classId: 'class_b1',
    gender: 'Female',
    parentName: 'Alice Brody',
    parentPhone: '+1 (617) 555-9033',
    parentEmail: 'a.brody@gmail.com',
    dateOfBirth: '2018-02-10',
    admissionDate: '2026-01-05',
    status: 'Active',
    profilePhoto: '',
    createdAt: '2026-01-05T09:00:00Z'
  }
];

const DEFAULTS_ACADEMIC_YEARS: AcademicYear[] = [
  { id: 'acad_25_26', tenantId: 'school_central_crest', name: '2025/2026', status: 'Active', createdAt: '2025-09-12T08:00:00Z' }
];

const DEFAULTS_TERMS: Term[] = [
  { id: 'term_1', tenantId: 'school_central_crest', academicYearId: 'acad_25_26', name: 'First Term', startDate: '2025-09-15', endDate: '2025-12-18', status: 'Active', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'term_2', tenantId: 'school_central_crest', academicYearId: 'acad_25_26', name: 'Second Term', startDate: '2026-01-10', endDate: '2026-04-12', status: 'Inactive', createdAt: '2025-09-12T08:00:00Z' },
  { id: 'term_3', tenantId: 'school_central_crest', academicYearId: 'acad_25_26', name: 'Third Term', startDate: '2026-04-20', endDate: '2026-07-25', status: 'Inactive', createdAt: '2025-09-12T08:00:00Z' }
];

const DEFAULTS_ROLE_PERMISSIONS: RolePermission[] = [
  { id: 'perm_tch', tenantId: 'school_central_crest', role: 'Teacher', dashboard: 'View', attendance: 'Edit', assignments: 'Edit', lessonNotes: 'Edit', studentRecords: 'View', settings: 'None' },
  { id: 'perm_stu', tenantId: 'school_central_crest', role: 'Student', dashboard: 'View', attendance: 'None', assignments: 'View', lessonNotes: 'View', studentRecords: 'None', settings: 'None' },
  { id: 'perm_par', tenantId: 'school_central_crest', role: 'Parent', dashboard: 'View', attendance: 'None', assignments: 'View', lessonNotes: 'None', studentRecords: 'View', settings: 'None' },
  { id: 'perm_asst', tenantId: 'school_central_crest', role: 'AssistantAdmin', dashboard: 'View', attendance: 'View', assignments: 'View', lessonNotes: 'View', studentRecords: 'Edit', settings: 'View' }
];

// ================= ISOLATED STAGE 2 ACCESSORS =================

export const getTeachersInStorage = (tenantId: string): Teacher[] => {
  const key = `educore_teachers_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  // If central crest, seed with default teachers list
  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_TEACHERS));
    return DEFAULTS_TEACHERS;
  }
  return [];
};

export const saveTeachersInStorage = (tenantId: string, teachers: Teacher[]): void => {
  const key = `educore_teachers_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(teachers));
};

export const getStudentsInStorage = (tenantId: string): Student[] => {
  const key = `educore_students_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_STUDENTS));
    return DEFAULTS_STUDENTS;
  }
  return [];
};

export const saveStudentsInStorage = (tenantId: string, students: Student[]): void => {
  const key = `educore_students_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(students));
};

export const getClassesInStorage = (tenantId: string): Class[] => {
  const key = `educore_classes_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_CLASSES));
    return DEFAULTS_CLASSES;
  }
  return [];
};

export const saveClassesInStorage = (tenantId: string, classes: Class[]): void => {
  const key = `educore_classes_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(classes));
};

export const getSubjectsInStorage = (tenantId: string): Subject[] => {
  const key = `educore_subjects_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_SUBJECTS));
    return DEFAULTS_SUBJECTS;
  }
  // Fill generic defaults for empty tenants to make setup elegant and prompt
  const genericDefaults = DEFAULTS_SUBJECTS.map(s => ({ ...s, id: `subj_${s.id}_${tenantId}`, tenantId }));
  localStorage.setItem(key, JSON.stringify(genericDefaults));
  return genericDefaults;
};

export const saveSubjectsInStorage = (tenantId: string, subjects: Subject[]): void => {
  const key = `educore_subjects_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(subjects));
};

export const getDepartmentsInStorage = (tenantId: string): Department[] => {
  const key = `educore_departments_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_DEPARTMENTS));
    return DEFAULTS_DEPARTMENTS;
  }
  const genericDefaults = DEFAULTS_DEPARTMENTS.map(d => ({ ...d, id: `dept_${d.id}_${tenantId}`, tenantId }));
  localStorage.setItem(key, JSON.stringify(genericDefaults));
  return genericDefaults;
};

export const saveDepartmentsInStorage = (tenantId: string, departments: Department[]): void => {
  const key = `educore_departments_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(departments));
};

export const getAcademicYearsInStorage = (tenantId: string): AcademicYear[] => {
  const key = `educore_academic_years_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_ACADEMIC_YEARS));
    return DEFAULTS_ACADEMIC_YEARS;
  }
  const genericDefaults: AcademicYear[] = [
    { id: `acad_25_26_${tenantId}`, tenantId, name: '2025/2026', status: 'Active', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem(key, JSON.stringify(genericDefaults));
  return genericDefaults;
};

export const saveAcademicYearsInStorage = (tenantId: string, years: AcademicYear[]): void => {
  const key = `educore_academic_years_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(years));
};

export const getTermsInStorage = (tenantId: string): Term[] => {
  const key = `educore_terms_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_TERMS));
    return DEFAULTS_TERMS;
  }
  const acadId = `acad_25_26_${tenantId}`;
  const genericDefaults: Term[] = [
    { id: `term_1_${tenantId}`, tenantId, academicYearId: acadId, name: 'First Term', startDate: '2025-09-15', endDate: '2025-12-18', status: 'Active', createdAt: new Date().toISOString() },
    { id: `term_2_${tenantId}`, tenantId, academicYearId: acadId, name: 'Second Term', startDate: '2026-01-10', endDate: '2026-04-12', status: 'Inactive', createdAt: new Date().toISOString() },
    { id: `term_3_${tenantId}`, tenantId, academicYearId: acadId, name: 'Third Term', startDate: '2026-04-20', endDate: '2026-07-25', status: 'Inactive', createdAt: new Date().toISOString() }
  ];
  localStorage.setItem(key, JSON.stringify(genericDefaults));
  return genericDefaults;
};

export const saveTermsInStorage = (tenantId: string, terms: Term[]): void => {
  const key = `educore_terms_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(terms));
};

export const getRolePermissionsInStorage = (tenantId: string): RolePermission[] => {
  const key = `educore_permissions_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_ROLE_PERMISSIONS));
    return DEFAULTS_ROLE_PERMISSIONS;
  }
  const genericDefaults = DEFAULTS_ROLE_PERMISSIONS.map(p => ({ ...p, id: `perm_${p.role.toLowerCase()}_${tenantId}`, tenantId }));
  localStorage.setItem(key, JSON.stringify(genericDefaults));
  return genericDefaults;
};

export const saveRolePermissionsInStorage = (tenantId: string, permissions: RolePermission[]): void => {
  const key = `educore_permissions_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(permissions));
};

// ================= STAGE 3 PRE-SEEDED CORE ACADEMIC RECS =================

const DEFAULTS_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign_1',
    tenantId: 'school_central_crest',
    classId: 'class_jhs1',
    subjectId: 'subj_math',
    topic: 'Quadratic & Linear Equations',
    instructions: 'Complete exercises 4.2 and 4.3 on page 81 of the Integrated Mathematics Textbook. Clearly state the axis of symmetry and key coordinates. Submit written solutions physically in the assignment locker or scan as a single PDF.',
    dueDate: '2026-06-25',
    attachmentName: 'Algebra_Assig_JHS1_SetA.pdf',
    attachmentUrl: '#',
    questionType: 'Theoretical',
    totalMarks: 50,
    submissionMethod: 'Offline',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    createdAt: '2026-06-17T09:12:00Z'
  },
  {
    id: 'assign_2',
    tenantId: 'school_central_crest',
    classId: 'class_b2',
    subjectId: 'subj_english',
    topic: 'Conjunctions and Pronouns Practice',
    instructions: 'Complete sentences by choosing correct conjunction worksheets. Provide definition examples for subordinate clauses.',
    dueDate: '2026-06-22',
    attachmentName: 'English_Conjunctions_Wksht.docx',
    attachmentUrl: '#',
    questionType: 'Theoretical',
    totalMarks: 20,
    submissionMethod: 'Online',
    teacherId: 'tch_evance',
    teacherName: 'Elizabeth Vance',
    createdAt: '2026-06-18T08:15:00Z'
  }
];

const DEFAULTS_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att_1',
    tenantId: 'school_central_crest',
    date: '2026-06-17',
    classId: 'class_jhs1',
    subjectId: 'subj_math',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    items: [
      { studentId: 'stu_j_vance', studentName: 'Julian Vance', status: 'Present', remarks: 'On time, active' },
      { studentId: 'stu_bulk_1', studentName: 'Brandon Stark', status: 'Late', remarks: 'Late school bus shift' }
    ],
    createdAt: '2026-06-17T08:10:00Z'
  },
  {
    id: 'att_2',
    tenantId: 'school_central_crest',
    date: '2026-06-18',
    classId: 'class_b1',
    subjectId: 'subj_english',
    teacherId: 'tch_evance',
    teacherName: 'Elizabeth Vance',
    items: [
      { studentId: 'stu_s_brody', studentName: 'Sarah Brody', status: 'Present', remarks: 'Class rep duty' }
    ],
    createdAt: '2026-06-18T08:05:00Z'
  }
];

const DEFAULTS_LESSONS: LessonRecord[] = [
  {
    id: 'lesson_1',
    tenantId: 'school_central_crest',
    classId: 'class_jhs1',
    subjectId: 'subj_math',
    topicTaught: 'Introduction to Algebraic Expressions',
    lessonObjectives: 'Students should be able to identify coefficients, variables, constants, and write basic statements as algebraic equations.',
    teachingMethod: 'Interactive whiteboard lecture and step-by-step example drills',
    materialsUsed: ['JHS 1 Mathematics Curricular Workbook', 'Interactive Math Grid Poster'],
    homeworkGiven: true,
    challengesFaced: 'Some students struggled with sign conventions when moving terms across brackets.',
    teacherRemarks: 'Excellent effort overall. Retesting will hold next Monday during normal class hours.',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    createdAt: '2026-06-17T11:20:00Z',
    reviewStatus: 'Approved',
    headRemarks: 'Solid pedagogy, Marcus. Perfect alignment with national scheme guidelines.'
  },
  {
    id: 'lesson_2',
    tenantId: 'school_central_crest',
    classId: 'class_b2',
    subjectId: 'subj_english',
    topicTaught: 'Compound Conjunctions and Clauses',
    lessonObjectives: 'Demonstrate coordination using clauses; differentiate dependent and independent segments using illustrative exercises.',
    teachingMethod: 'Chalkboard illustrations and team worksheet mapping',
    materialsUsed: ['Syllabus Booklet Volume A', 'English Grammar Cheat Sheets'],
    homeworkGiven: true,
    challengesFaced: 'Limited reading textbooks triggered duplicate group shares.',
    teacherRemarks: 'Very participatory. Need extra worksheets printed before tomorrow.',
    teacherId: 'tch_evance',
    teacherName: 'Elizabeth Vance',
    createdAt: '2026-06-18T09:40:00Z',
    reviewStatus: 'Pending',
    headRemarks: ''
  }
];

const DEFAULTS_MATERIALS: TeachingMaterial[] = [
  {
    id: 'mat_1',
    tenantId: 'school_central_crest',
    title: 'Algebra Foundations - Student Guide',
    description: 'Comprehensive core curriculum formulas and reference worksheets for algebra pupils.',
    category: 'Textbook',
    fileType: 'pdf',
    fileSize: '4.8 MB',
    gradeClassFilter: 'class_jhs1',
    subjectFilter: 'subj_math',
    uploadedByTeacherId: 'tch_mbrody',
    uploadedByTeacherName: 'Marcus Brody',
    uploadDate: '2026-02-15'
  },
  {
    id: 'mat_2',
    tenantId: 'school_central_crest',
    title: 'Syllabus Scheme of Work - English Grammar',
    description: 'Quarterly layout plans mapping structural clauses and sentence types.',
    category: 'Scheme of Work',
    fileType: 'docx',
    fileSize: '1.2 MB',
    gradeClassFilter: 'class_b2',
    subjectFilter: 'subj_english',
    uploadedByTeacherId: 'tch_evance',
    uploadedByTeacherName: 'Elizabeth Vance',
    uploadDate: '2026-01-10'
  },
  {
    id: 'mat_3',
    tenantId: 'school_central_crest',
    title: 'BECE ICT Core 2024 Past Questions Booklet',
    description: 'Full compilation of past national certificate questions spanning hardware, peripherals and network loops.',
    category: 'Past Questions',
    fileType: 'pdf',
    fileSize: '3.1 MB',
    gradeClassFilter: 'class_jhs1',
    subjectFilter: 'subj_ict',
    uploadedByTeacherId: 'tch_mbrody',
    uploadedByTeacherName: 'Marcus Brody',
    uploadDate: '2026-05-18'
  },
  {
    id: 'mat_4',
    tenantId: 'school_central_crest',
    title: 'Photosynthesis Laboratory Slides Deck',
    description: 'Animated diagrams proving oxygen output from standard chemical experiments.',
    category: 'Slides',
    fileType: 'pptx',
    fileSize: '8.4 MB',
    gradeClassFilter: 'class_jhs2',
    subjectFilter: 'subj_science',
    uploadedByTeacherId: 'tch_evance',
    uploadedByTeacherName: 'Elizabeth Vance',
    uploadDate: '2026-04-12'
  }
];

const DEFAULTS_MATERIAL_USAGES: MaterialUsageLog[] = [
  {
    id: 'use_1',
    tenantId: 'school_central_crest',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    materialId: 'mat_1',
    materialTitle: 'Algebra Foundations - Student Guide',
    classId: 'class_jhs1',
    subjectId: 'subj_math',
    topic: 'Introduction to Algebra Expressions',
    usedAt: '2026-06-17T11:20:00Z'
  },
  {
    id: 'use_2',
    tenantId: 'school_central_crest',
    teacherId: 'tch_evance',
    teacherName: 'Elizabeth Vance',
    materialId: 'mat_2',
    materialTitle: 'Syllabus Scheme of Work - English Grammar',
    classId: 'class_b2',
    subjectId: 'subj_english',
    topic: 'Compound Conjunctions and Clauses',
    usedAt: '2026-06-18T09:40:00Z'
  }
];

const DEFAULTS_TEACHER_ACTIVITY: TeacherActivityLog[] = [
  {
    id: 'tlog_1',
    tenantId: 'school_central_crest',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    action: 'Created Assignment',
    details: 'Created assignment Quadratic & Linear Equations for JHS 1 Mathematics. Due on 2026-06-25.',
    timestamp: '2026-06-17T09:12:00Z',
    classId: 'class_jhs1',
    className: 'JHS 1',
    subjectId: 'subj_math',
    subjectName: 'Mathematics'
  },
  {
    id: 'tlog_2',
    tenantId: 'school_central_crest',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    action: 'Marked Attendance',
    details: 'Submitted attendance sheet for JHS 1 Mathematics today. Attendance: 95% present.',
    timestamp: '2026-06-17T08:10:00Z',
    classId: 'class_jhs1',
    className: 'JHS 1',
    subjectId: 'subj_math',
    subjectName: 'Mathematics'
  },
  {
    id: 'tlog_3',
    tenantId: 'school_central_crest',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    action: 'Recorded Lesson',
    details: 'Recorded lesson completed on Introduction to Algebraic Expressions for JHS 1 Mathematics.',
    timestamp: '2026-06-17T11:20:00Z',
    classId: 'class_jhs1',
    className: 'JHS 1',
    subjectId: 'subj_math',
    subjectName: 'Mathematics'
  },
  {
    id: 'tlog_4',
    tenantId: 'school_central_crest',
    teacherId: 'tch_mbrody',
    teacherName: 'Marcus Brody',
    action: 'Used Material',
    details: 'Used textbook Algebra Foundations - Student Guide for lecturing JHS 1 Mathematics class.',
    timestamp: '2026-06-17T11:20:00Z',
    classId: 'class_jhs1',
    className: 'JHS 1',
    subjectId: 'subj_math',
    subjectName: 'Mathematics'
  }
];

// ================= ISOLATED STAGE 3 ACCESSORS =================

export const getAssignmentsInStorage = (tenantId: string): Assignment[] => {
  const key = `educore_assignments_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_ASSIGNMENTS));
    return DEFAULTS_ASSIGNMENTS;
  }
  return [];
};

export const saveAssignmentsInStorage = (tenantId: string, assignments: Assignment[]): void => {
  const key = `educore_assignments_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(assignments));
};

export const getAttendanceRecordsInStorage = (tenantId: string): AttendanceRecord[] => {
  const key = `educore_attendance_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_ATTENDANCE));
    return DEFAULTS_ATTENDANCE;
  }
  return [];
};

export const saveAttendanceRecordsInStorage = (tenantId: string, records: AttendanceRecord[]): void => {
  const key = `educore_attendance_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(records));
};

export const getLessonRecordsInStorage = (tenantId: string): LessonRecord[] => {
  const key = `educore_lessons_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_LESSONS));
    return DEFAULTS_LESSONS;
  }
  return [];
};

export const saveLessonRecordsInStorage = (tenantId: string, records: LessonRecord[]): void => {
  const key = `educore_lessons_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(records));
};

export const getTeachingMaterialsInStorage = (tenantId: string): TeachingMaterial[] => {
  const key = `educore_materials_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_MATERIALS));
    return DEFAULTS_MATERIALS;
  }
  return [];
};

export const saveTeachingMaterialsInStorage = (tenantId: string, materials: TeachingMaterial[]): void => {
  const key = `educore_materials_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(materials));
};

export const getMaterialUsageLogsInStorage = (tenantId: string): MaterialUsageLog[] => {
  const key = `educore_material_usage_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_MATERIAL_USAGES));
    return DEFAULTS_MATERIAL_USAGES;
  }
  return [];
};

export const saveMaterialUsageLogsInStorage = (tenantId: string, logs: MaterialUsageLog[]): void => {
  const key = `educore_material_usage_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(logs));
};

export const getTeacherActivityLogsInStorage = (tenantId: string): TeacherActivityLog[] => {
  const key = `educore_teacher_activity_${tenantId}`;
  const raw = localStorage.getItem(key);
  if (raw) return JSON.parse(raw);

  if (tenantId === 'school_central_crest') {
    localStorage.setItem(key, JSON.stringify(DEFAULTS_TEACHER_ACTIVITY));
    return DEFAULTS_TEACHER_ACTIVITY;
  }
  return [];
};

export const saveTeacherActivityLogsInStorage = (tenantId: string, logs: TeacherActivityLog[]): void => {
  const key = `educore_teacher_activity_${tenantId}`;
  localStorage.setItem(key, JSON.stringify(logs));
};

export const appendTeacherActivityLog = (
  tenantId: string, 
  log: Omit<TeacherActivityLog, 'id' | 'timestamp'>
): void => {
  const current = getTeacherActivityLogsInStorage(tenantId);
  const newLog: TeacherActivityLog = {
    ...log,
    id: `tlog_${Date.now()}`,
    timestamp: new Date().toISOString()
  };
  const updated = [newLog, ...current];
  saveTeacherActivityLogsInStorage(tenantId, updated);
  
  // also mirror to global/school activity logs
  appendActivityLog({
    tenantId,
    user: log.teacherName,
    action: log.action,
    details: log.details,
    type: log.action.toLowerCase().includes('attendance') 
      ? 'success' 
      : log.action.toLowerCase().includes('assignment') 
        ? 'info' 
        : 'success'
  });
};
