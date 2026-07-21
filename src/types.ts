/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type SubscriptionPackage = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';
export type SchoolStatus = 'Active' | 'Suspended' | 'Pending';
export type UserRole = 'SuperAdmin' | 'SchoolAdmin' | 'Teacher' | 'Student' | 'Parent' | 'Accountant' | 'Supervisor' | 'AssistantAdmin';
export type UserStatus = 'Active' | 'Pending' | 'Inactive' | 'Suspended';

export interface School {
  id: string; // Dynamic Tenant ID
  name: string;
  code: string; // Unique school code, e.g., EDU-ALPHA
  location: string;
  phone: string;
  email: string;
  subscriptionPackage: SubscriptionPackage;
  status: SchoolStatus;
  logo: string; // Base64 or initials placeholder
  adminName: string;
  adminEmail: string;
  createdAt: string;
  
  // Custom metadata for high-fidelity dashboards
  studentCount?: number;
  teacherCount?: number;
  classCount?: number;
}

export interface User {
  id: string;
  tenantId: string | 'SUPER_ADMIN'; // Data isolation key: belongs to a specific school tenant
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  department?: string; // Optional metadata
  createdBy?: string;
  linkedTeacherId?: string;
  linkedStudentId?: string;
  linkedStudentIds?: string[];
  temporaryPassword?: string;
  password?: string;
  mustChangePassword?: boolean;
  failedLoginCount?: number;
  loginLockedUntil?: string;
}

export interface TeachingScheduleSlot {
  id: string;
  classId: string;
  subjectId: string;
  day: string;
  startTime: string;
  endTime: string;
}

export interface Teacher {
  id: string;
  tenantId: string;
  fullName: string;
  staffId: string; // unique code, e.g. TCH-001
  phone: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  departmentId: string; // refers to Department.id
  subjectsTaught: string[]; // refers to Subject.id[]
  assignedClasses: string[]; // refers to Class.id[]
  primaryAllSubjects?: boolean;
  teachingSchedule?: TeachingScheduleSlot[];
  employmentStatus: 'Active' | 'Suspended' | 'Inactive';
  profilePhoto?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  tenantId: string;
  fullName: string;
  studentId: string; // unique code, e.g. STU-001
  classId: string; // refers to Class.id
  gender: 'Male' | 'Female' | 'Other';
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  dateOfBirth: string;
  admissionDate: string;
  status: 'Active' | 'Suspended' | 'Inactive';
  profilePhoto?: string;
  createdAt: string;
}

export interface Class {
  id: string;
  tenantId: string;
  name: string; // Basic 1, Basic 2, JHS 1, JHS 2, etc.
  classTeacherId?: string; // refers to Teacher.id
  subjectIds: string[]; // refers to Subject.id[]
  createdAt: string;
}

export interface Subject {
  id: string;
  tenantId: string;
  name: string; // English, Mathematics, Science, etc.
  code: string; // e.g. ENG, MATH, SCI
  createdAt: string;
}

export interface Department {
  id: string;
  tenantId: string;
  name: string; // Primary, JHS, Science, Languages, Administration, others
  headOfDepartmentId?: string; // refers to Teacher.id
  createdAt: string;
}

export interface AcademicYear {
  id: string;
  tenantId: string;
  name: string; // e.g. "2025/2026"
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export type AcademicPeriodType = 'Term' | 'Semester';

export interface Term {
  id: string;
  tenantId: string;
  academicYearId: string; // refers to AcademicYear.id
  name: string; // e.g. "First Term", "Second Term", "Semester 1"
  periodType?: AcademicPeriodType;
  startDate: string;
  endDate: string;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface RolePermission {
  id: string;
  tenantId: string;
  role: 'Teacher' | 'Student' | 'Parent' | 'AssistantAdmin';
  // Granular action access level values
  dashboard: 'View' | 'None';
  attendance: 'View' | 'Edit' | 'None';
  assignments: 'View' | 'Edit' | 'None';
  lessonNotes: 'View' | 'Edit' | 'None';
  studentRecords: 'View' | 'Edit' | 'None';
  settings: 'View' | 'Edit' | 'None';
}

export interface ActivityLog {
  id: string;
  tenantId: string | 'GLOBAL';
  user: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface TenantSystemSettings {
  tenantId: string;
  academicYear: string;
  term: string;
  themeColor: string;
  allowParentReg: boolean;
  allowTeacherReg: boolean;
  smsSenderId: string;
  schoolLogoInitials?: string;
  schoolMotto?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  currencyCode?: string;
  periodType?: 'Term' | 'Semester';
}

export interface AuthState {
  user: User | null;
  currentTenant: School | null; // Selected school context for school admins/teachers/students
  isSuperAdmin: boolean;
}

// ================= STAGE 3 ACADEMIC CORE SCHEMAS =================

export type HeadReviewStatus = 'Pending' | 'Reviewed' | 'Approved' | 'Flagged';

export interface Assignment {
  id: string;
  tenantId: string;
  classId: string;
  subjectId: string;
  topic: string;
  instructions: string;
  dueDate: string;
  attachmentName?: string;
  attachmentUrl?: string;
  questionType: 'Multiple Choice' | 'Theoretical' | 'Practical' | 'Essay' | string;
  totalMarks: number;
  submissionMethod: 'Online' | 'Offline' | 'Google Classroom' | string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
}

export interface AttendanceItem {
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  classId: string;
  subjectId?: string; // Optional context matching teacher classes
  teacherId: string;
  teacherName: string;
  items: AttendanceItem[];
  createdAt: string;
}

export interface LessonRecord {
  id: string;
  tenantId: string;
  classId: string;
  subjectId: string;
  topicTaught: string;
  lessonObjectives: string;
  teachingMethod: string;
  materialsUsed: string[]; // List of TeachingMaterial IDs or names
  homeworkGiven: boolean;
  challengesFaced?: string;
  teacherRemarks?: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  reviewStatus: HeadReviewStatus;
  headRemarks?: string;
}

export interface TeachingMaterial {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'PDF' | 'Notes' | 'Video' | 'Slides' | 'Textbook' | 'Scheme of Work' | 'Past Questions' | string;
  fileType: 'pdf' | 'mp4' | 'pptx' | 'docx' | 'xlsx' | string;
  fileSize?: string;
  fileName?: string;
  downloadUrl?: string;
  storageProvider?: 'DemoLocal' | 'BackendCloud' | string;
  storageStatus?: 'metadata-only' | 'uploaded' | 'pending' | string;
  teacherId?: string;
  uploadedBy?: string;
  classId?: string;
  subjectId?: string;
  gradeClassFilter?: string; // Class ID context
  subjectFilter?: string; // Subject ID context
  uploadedByTeacherId?: string;
  uploadedByTeacherName?: string;
  uploadedByRole?: string;
  shareScope?: 'SchoolShared' | 'TeacherOnly' | string;
  uploadDate: string;
}

export interface MaterialUsageLog {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  materialId: string;
  materialTitle: string;
  classId: string;
  subjectId: string;
  topic: string;
  usedAt: string;
}

export interface TeacherActivityLog {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  action: 'Created Assignment' | 'Marked Attendance' | 'Recorded Lesson' | 'Used Material' | 'Edited Assignment' | 'Uploaded Material' | string;
  details: string;
  timestamp: string;
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
}

// ================= STAGE 4 MONITORING & REPORTING SCHEMAS =================

export interface PerformanceScore {
  lessonsTaughtScore: number;
  assignmentsGivenScore: number;
  attendanceSubmittedScore: number;
  materialsUsedScore: number;
  overallScore: number;
}

export interface TeacherPerformanceReport {
  id: string;
  tenantId: string;
  teacherId: string;
  teacherName: string;
  departmentId?: string;
  departmentName?: string;
  lessonsCount: number;
  assignmentsCount: number;
  attendanceCount: number;
  materialsCount: number;
  lateSubmissions: number;
  missingRecords: number;
  scores: PerformanceScore;
  lastActive: string;
}

export interface AttendanceReport {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendancePercent: number;
  submittedCount: number;
  missingSubmissions: number;
}

export interface AssignmentReport {
  id: string;
  tenantId: string;
  subjectId: string;
  subjectName: string;
  classId: string;
  className: string;
  topic: string;
  teacherName: string;
  dueDate: string;
  totalGiven: number;
  submissionRate: number;
  markingStatus: 'Fully Marked' | 'Pending Marking' | 'Not Started';
  overdueCount: number;
}

export interface LessonCoverageReport {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  syllabusTopicsCount: number;
  completedTopicsCount: number;
  pendingTopicsCount: number;
  delayedTopicsCount: number;
  coveragePercentage: number;
  teachersBehind: string[];
}

export interface MaterialUsageReport {
  id: string;
  tenantId: string;
  materialTitle: string;
  category: string;
  timesUsed: number;
  associatedSubjects: string[];
  associatedClasses: string[];
  uploadedBy: string;
}

export interface ApprovalRecord {
  id: string;
  tenantId: string;
  itemType: 'LessonRecord' | 'TeachingMaterial' | 'Assignment' | 'SpecialActivity';
  itemId: string;
  itemTitle: string;
  submittingUser: string;
  submittingUserId: string;
  submittedAt: string;
  status: 'Pending Review' | 'Approved' | 'Queried' | 'Rejected' | 'Needs Correction';
  headRemarks?: string;
}

export interface QueryMessage {
  id: string;
  tenantId: string;
  recordId: string;
  recordType: 'LessonRecord' | 'TeachingMaterial' | 'Assignment';
  recordTitle: string;
  teacherId: string;
  queryText: string;
  headUserId: string;
  headUserName: string;
  timestamp: string;
  resolved: boolean;
  teacherResponse?: string;
}

export interface ExportReport {
  id: string;
  tenantId: string;
  reportType: 'Performance' | 'Attendance' | 'Assignments' | 'Lessons' | 'Materials';
  generatedBy: string;
  dateRange: string;
  createdAt: string;
  fileFormat: 'PDF' | 'Excel';
  title: string;
}

// ================= STAGE 5 INTELLIGENT AI SUITE SCHEMAS =================

export type AIApprovalStatus = 'Draft' | 'Pending Review' | 'Approved' | 'Rejected' | 'Archived';

export interface AIRequest {
  id: string;
  tenantId: string;
  userId: string;
  module: 'Assistant' | 'Summarizer' | 'ExamGenerator' | 'MarkingAssistant' | 'StudentInsights';
  prompt: string;
  timestamp: string;
}

export interface AIResponse {
  id: string;
  requestId: string;
  output: string;
  timestamp: string;
}

export interface LessonSummary {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  week?: string;
  term?: string;
  keyPoints: string[];
  learningObjectives: string[];
  importantDefinitions: { term: string; definition: string }[];
  examples: string[];
  teacherActivities: string[];
  studentActivities: string[];
  homeworkGiven: string;
  revisionAreas: string[];
  generatedAt: string;
}

export interface ObjectiveQuestion {
  questionText: string;
  options: string[]; // 4 options
  correctOptionIndex: number; // 0 to 3
}

export interface TheoryQuestion {
  questionText: string;
  expectedKeywords: string[];
  suggestedAnswer: string;
}

export interface MarkingScheme {
  rubricCriteria: { criterion: string; maxMarks: number; description: string }[];
  totalMarks: number;
}

export interface ExamQuestion {
  id: string;
  type: 'Objective' | 'Theory';
  questionText: string;
  objectiveOptions?: string[];
  correctAnswer: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  marks: number;
  markingGuide?: string;
}

export interface QuestionBankItem {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  term: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questionType: 'Objective' | 'Theory';
  question: ExamQuestion;
  status: AIApprovalStatus;
  createdById: string;
  createdBy: string;
  createdAt: string;
}

export interface AIMarkingResult {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  questionText: string;
  studentAnswer: string;
  suggestedScore: number;
  maxScore: number;
  corrections: string[];
  feedback: string;
  improvementComments: string;
  isApprovedByTeacher: boolean;
  markedAt: string;
}

export interface StudentInsight {
  id: string;
  tenantId: string;
  studentId: string;
  studentName: string;
  gradeClass: string;
  attendanceRate: number;
  assignmentsSubmittedCount: number;
  assignmentsOverdueCount: number;
  participationScore: number; // 1-10
  academicPerformanceAverage: number; // percentage
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  weaknesses: string[];
  strengths: string[];
  recommendedInterventions: string[];
  overallComments: string;
}

export interface AIUsageLog {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userRole: 'Teacher' | 'SchoolAdmin';
  module: string; // "Academic Assistant", "Lesson Summarizer", etc.
  classId?: string;
  className?: string;
  subjectId?: string;
  subjectName?: string;
  promptType: string; // "Curriculum Chat", "Exam Generator", etc.
  timestamp: string;
  generatedTitle: string;
  charCountGenerated: number;
}

// ================= STAGE 6 PORTALS, FEES & COMMUNICATION SCHEMAS =================

export interface ParentProfile {
  id: string;
  tenantId: string;
  userId: string; // references User.id
  fullName: string;
  email: string;
  phone: string;
  childrenIds: string[]; // references Student.id[]
  address?: string;
  occupation?: string;
  relationship: 'Father' | 'Mother' | 'Guardian';
  createdAt: string;
}

export interface StudentPortalProfile {
  id: string;
  tenantId: string;
  userId: string; // references User.id
  studentId: string; // references Student.id
  timetable: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    periods: { time: string; subjectName: string; teacherName: string }[];
  }[];
  notesAndMaterialsCount: number;
  approvedSummariesCount: number;
}

export interface FeeItem {
  id: string;
  tenantId: string;
  name: string;
  amount: number;
  category: 'Tuition' | 'Sports' | 'Lab' | 'Library' | 'PTA' | 'Exam' | 'Feeding' | 'Uniform' | 'Other';
  description?: string;
  isRequired: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string; // e.g. INV-2026-001
  studentId: string; // references Student.id
  studentName: string;
  classId: string; // references Class.id
  className: string;
  issueDate: string;
  dueDate: string;
  items: { feeItemId: string; feeItemName: string; amount: number }[];
  totalAmount: number;
  discounts: number;
  amountPaid: number;
  balance: number;
  status: 'Paid' | 'Part Payment' | 'Pending' | 'Overdue' | 'Waived';
  comments?: string;
}

export interface PaymentRecord {
  id: string;
  tenantId: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  amountPaid: number;
  paymentMethod: 'Mobile Money' | 'Bank Transfer' | 'Card Payment' | 'Manual Entry';
  transactionReference: string;
  datePaid: string;
  recordedBy: string;
  notes?: string;
}

export interface Message {
  id: string;
  tenantId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientType: 'Parents' | 'Teachers' | 'Students' | 'Class' | 'Department' | 'Whole School';
  targetId?: string; // classId, departmentId, or general
  channel: 'SMS' | 'Email' | 'In-App' | 'All';
  title: string;
  body: string;
  sentAt: string;
}

export interface Announcement {
  id: string;
  tenantId: string;
  title: string;
  content: string;
  targetAudience: 'All' | 'Parents' | 'Teachers' | 'Students';
  createdBy: string;
  createdAt: string;
  pinned: boolean;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  moduleRoute?: string;
}

export interface CalendarEvent {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: 'Academic' | 'PTA Meeting' | 'Holiday' | 'Exam' | 'Sports Day' | 'Event' | 'Fees Deadline';
  startDate: string;
  endDate: string;
  allDay: boolean;
  location?: string;
}

export interface SMSLog {
  id: string;
  tenantId: string;
  recipientName: string;
  recipientPhone: string;
  messageText: string;
  status: 'Sent' | 'Failed' | 'Delivered';
  sentAt: string;
}

export interface EmailLog {
  id: string;
  tenantId: string;
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  status: 'Sent' | 'Failed';
  sentAt: string;
}

export interface CommunicationTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: 'SMS' | 'Email' | 'All' | 'In-App';
  category: 'Attendance' | 'Assignment' | 'FeeReminder' | 'ExamNotice' | 'Emergency' | 'General';
  subjectTemplate?: string;
  bodyTemplate: string;
}

// ================= STAGE 7 COMMERCIAL SAAS & SYSTEMS SCHEMAS =================

export type TenantCommercialStatus = 'Trial' | 'Active' | 'Suspended' | 'Expired' | 'Cancelled' | 'Pending Payment';

export interface SaaSPackage {
  id: string; // 'basic', 'professional', 'enterprise', 'custom'
  name: string; // 'Basic', 'Professional', 'Enterprise', 'Custom'
  priceMonthly: number;
  priceYearly: number;
  studentLimit: number;
  teacherLimit: number;
  aiLimitsMonthly: number; // charCount standard allocation
  smsLimitMonthly: number;
  storageLimitGB: number;
  parentPortalAccess: boolean;
  feesManagementAccess: boolean;
  reportsAccess: boolean;
  examGeneratorAccess: boolean;
  description: string;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  packageId: string; // basic, professional, etc.
  billingCycle: 'Monthly' | 'Yearly';
  status: TenantCommercialStatus;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  studentUsage: number;
  teacherUsage: number;
  aiUsageThisMonth: number;
  smsUsageThisMonth: number;
  storageUsageGB: number;
  amountPaidAccumulated: number;
}

export interface BillingRecord {
  id: string;
  tenantId: string;
  invoiceNumber: string;
  amount: number;
  cycle: 'Monthly' | 'Yearly';
  packageName: string;
  issueDate: string;
  dueDate: string;
  paymentDate?: string;
  status: 'Paid' | 'Unpaid' | 'Overdue' | 'Refunded';
  paymentMethod?: string;
  transactionRef?: string;
}

export interface AuditLog {
  id: string;
  tenantId: string | 'GLOBAL';
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  action: string; // e.g. Login, Logout, School Registration, AI Generation...
  details: string;
  ipAddress: string;
  device: string;
  timestamp: string;
  module: 'Auth' | 'Tenant' | 'Academic' | 'AI' | 'Financial' | 'Communication' | 'System';
}

export interface SecurityPolicy {
  id: string;
  tenantId: string | 'GLOBAL';
  minPasswordLength: number;
  requireLetters: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  maxFailedLogins: number;
  lockoutDurationMinutes: number;
  twoFactorAuth: 'Optional' | 'Mandatory' | 'Disabled';
  sessionTimeoutMinutes: number;
}

export interface LoginHistory {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: UserRole;
  ipAddress: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed_Password' | 'Failed_Lockout' | 'Failed_2FA';
  timestamp: string;
  failureReason?: string;
}

export interface BackupRecord {
  id: string;
  tenantId: string | 'GLOBAL'; // GLOBAL is system-wide, tenantId is specific tenant isolated postgres backup
  type: 'Automated' | 'Manual';
  target: 'PostgreSQL' | 'Cloud Storage' | 'All';
  sizeMB: number;
  status: 'Success' | 'In Progress' | 'Failed';
  initiatedBy: string; // User Name or 'System Cron'
  createdAt: string;
  downloadUrl?: string;
  notes?: string;
}

export interface IntegrationSetting {
  id: string; // sms, email, payment, ai, storage, biometric, widget
  name: string; // 'SMS Gateway (Twilio)', etc.
  provider: string; // 'Twilio', 'Mailgun', 'Stripe', 'Google Vertex', 'AWS S3', 'Widget'
  status: 'Connected' | 'Not Connected' | 'Error' | 'Testing';
  apiKeyMasked: string;
  apiEndpoint?: string;
  lastTestedAt?: string;
  errorLog?: string;
}

export interface SystemHealthMetric {
  serverStatus: 'Healthy' | 'Degraded' | 'Critical';
  databaseStatus: 'Healthy' | 'Slow Query Warning' | 'Down';
  memoryUsagePercent: number;
  cpuUsagePercent: number;
  diskUsagePercent: number;
  activeWorkers: number;
  queueStatus: 'Idle' | 'Processing' | 'Backed Up';
  failedJobs: number;
  uptimeSeconds: number;
  redisStatus: 'Healthy' | 'Disconnected';
  lastLogLines: string[];
}

export interface SupportTicketResponse {
  id: string;
  responderId: string;
  responderName: string;
  responderRole: UserRole;
  text: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  tenantId: string;
  schoolName: string;
  title: string;
  description: string;
  module: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdById: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  responses: SupportTicketResponse[];
}

export interface DeploymentChecklistItem {
  id: string;
  task: string;
  category: 'Infrastructure' | 'Database' | 'Security' | 'SaaS Billing' | 'API Gateway';
  status: 'Pending' | 'Completed' | 'In Progress';
  description: string;
}
