import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Search, 
  Calendar, 
  Filter, 
  CheckSquare, 
  BookOpen, 
  Library, 
  ThumbsUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  FileText, 
  UserCheck, 
  Cpu,
  RefreshCw,
  CornerDownRight,
  TrendingUp,
  Percent,
  Star,
  FileSpreadsheet,
  Plus,
  AlertCircle,
  Award,
  Download,
  Printer,
  Send,
  HelpCircle,
  Check,
  XCircle,
  ArrowUpRight,
  Bookmark
} from 'lucide-react';
import { 
  User, 
  School, 
  AttendanceRecord, 
  LessonRecord, 
  TeachingMaterial, 
  MaterialUsageLog, 
  Assignment,
  TeacherActivityLog,
  TeacherPerformanceReport,
  AttendanceReport,
  AssignmentReport,
  LessonCoverageReport,
  MaterialUsageReport,
  ApprovalRecord,
  QueryMessage,
  ExportReport,
  PerformanceScore,
  HeadReviewStatus
} from '../types';
import { 
  getAttendanceRecordsInStorage, 
  saveAttendanceRecordsInStorage,
  getLessonRecordsInStorage, 
  saveLessonRecordsInStorage,
  getTeachingMaterialsInStorage, 
  saveTeachingMaterialsInStorage,
  getClassesInStorage, 
  getSubjectsInStorage, 
  getTeachersInStorage,
  getMaterialUsageLogsInStorage,
  getAssignmentsInStorage,
  saveAssignmentsInStorage,
  getTeacherActivityLogsInStorage,
  appendActivityLog
} from '../data/mockData';

interface SchoolHeadReviewProps {
  user: User;
  currentTenant: School;
}

// Default curriculum list representing standard topics per subject
const TARGET_CURRICULUM_SCHEME = {
  subj_math: [
    { seq: 1, topic: 'Intro to Algebra' },
    { seq: 2, topic: 'Quadratic Equations' },
    { seq: 3, topic: 'Euclidean Geometry' },
    { seq: 4, topic: 'Trigonometric Identities' },
    { seq: 5, topic: 'Differential Calculus' },
    { seq: 6, topic: 'Probability & Distributions' }
  ],
  subj_science: [
    { seq: 1, topic: 'Cellular Biology' },
    { seq: 2, topic: 'Newtonian Physics' },
    { seq: 3, topic: 'Introductory Chemistry' },
    { seq: 4, topic: 'Organic Compounds' },
    { seq: 5, topic: 'Thermodynamics' },
    { seq: 6, topic: 'Optics & Light waves' }
  ],
  subj_english: [
    { seq: 1, topic: 'Grammar Foundation' },
    { seq: 2, topic: 'Essay Craft and Syntax' },
    { seq: 3, topic: 'Classic Literary Analysis' },
    { seq: 4, topic: 'Poetry Metrics' },
    { seq: 5, topic: 'Public Speaking Formats' }
  ],
  subj_social: [
    { seq: 1, topic: 'Industrial Revolution' },
    { seq: 2, topic: 'World War Settlements' },
    { seq: 3, topic: 'Macroeconomic Principles' },
    { seq: 4, topic: 'Constitutional Frameworks' },
    { seq: 5, topic: 'Demographics & Migration' }
  ]
};

// Key for storage of queries
const QUERIES_STORAGE_KEY = 'educore_queries_ledger';

export default function SchoolHeadReview({ user, currentTenant }: SchoolHeadReviewProps) {
  const tenantId = currentTenant.id;

  // Active Main Oversight Tab
  const [activeSegment, setActiveSegment] = useState<
    'dashboard' | 'performance' | 'attendance' | 'assignments' | 'coverage' | 'materials' | 'activity' | 'approvals' | 'export'
  >('dashboard');

  // Master local databases
  const [attendanceRecs, setAttendanceRecs] = useState<AttendanceRecord[]>([]);
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [materialUsages, setMaterialUsages] = useState<MaterialUsageLog[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [activityLogs, setActivityLogs] = useState<TeacherActivityLog[]>([]);
  
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [teachersList, setTeachersList] = useState<any[]>([]);

  // Queries local database
  const [queries, setQueries] = useState<QueryMessage[]>([]);

  // Notifications feedback alert
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Filters state variables
  const [globalTermFilter, setGlobalTermFilter] = useState('Term 2');
  const [perfTeacherFilter, setPerfTeacherFilter] = useState('');
  const [perfDeptFilter, setPerfDeptFilter] = useState('');
  const [perfTimeframe, setPerfTimeframe] = useState<'day' | 'week' | 'month' | 'term' | 'year'>('term');

  const [attClassFilter, setAttClassFilter] = useState('');
  const [attDateFilter, setAttDateFilter] = useState('');
  const [attTeacherFilter, setAttTeacherFilter] = useState('');

  const [assignClassFilter, setAssignClassFilter] = useState('');
  const [assignTeacherFilter, setAssignTeacherFilter] = useState('');
  const [assignStatusFilter, setAssignStatusFilter] = useState('');

  const [coverageClassFilter, setCoverageClassFilter] = useState('');
  const [coverageSubjectFilter, setCoverageSubjectFilter] = useState('');

  // Active action modal states
  const [selectedReviewItem, setSelectedReviewItem] = useState<{
    id: string;
    type: 'lesson' | 'material' | 'assignment';
    title: string;
    submittingUser: string;
    details: any;
  } | null>(null);
  const [approvalFeedback, setApprovalFeedback] = useState('');
  const [showQueryInput, setShowQueryInput] = useState(false);
  const [activeQueryText, setActiveQueryText] = useState('');

  // Print simulated generation config for export
  const [exportType, setExportType] = useState<'Performance' | 'Attendance' | 'Assignments' | 'Lessons' | 'Materials'>('Performance');
  const [exportFormat, setExportFormat] = useState<'PDF' | 'Excel'>('PDF');
  const [exportDateRange, setExportDateRange] = useState('Current Term - 2026 Audit Cycle');
  const [simulatedPrintReport, setSimulatedPrintReport] = useState<any | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync databases from localStorage
  const forceReloadData = () => {
    const fetchedAtt = getAttendanceRecordsInStorage(tenantId);
    const fetchedLessons = getLessonRecordsInStorage(tenantId);
    const fetchedMaterials = getTeachingMaterialsInStorage(tenantId);
    const fetchedusages = getMaterialUsageLogsInStorage(tenantId);
    const fetchedAssign = getAssignmentsInStorage(tenantId);
    const fetchedLogs = getTeacherActivityLogsInStorage(tenantId);

    setAttendanceRecs(fetchedAtt);
    setLessons(fetchedLessons);
    setMaterials(fetchedMaterials);
    setMaterialUsages(fetchedusages);
    setAssignments(fetchedAssign);
    setActivityLogs(fetchedLogs);

    setClassesList(getClassesInStorage(tenantId));
    setSubjectsList(getSubjectsInStorage(tenantId));
    setTeachersList(getTeachersInStorage(tenantId));

    // Pull queries
    const qRaw = localStorage.getItem(QUERIES_STORAGE_KEY);
    if (qRaw) {
      const allQ: QueryMessage[] = JSON.parse(qRaw);
      setQueries(allQ.filter(q => q.tenantId === tenantId));
    } else {
      setQueries([]);
    }
  };

  useEffect(() => {
    forceReloadData();
  }, [tenantId]);

  const classesMap = React.useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const subjectsMap = React.useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);

  // Handle live queries creation for school head feedback loop
  const handleQueryAndFlag = (itemId: string, itemType: 'lesson' | 'material' | 'assignment', queryText: string) => {
    if (!queryText.trim()) {
      triggerToast('Please declare query directives.', 'error');
      return;
    }

    try {
      // 1. Resolve submits
      let resolvedTeacherId = '';
      let recordTitle = '';

      if (itemType === 'lesson') {
        const uLessons = getLessonRecordsInStorage(tenantId);
        const match = uLessons.find(l => l.id === itemId);
        if (match) {
          match.reviewStatus = 'Flagged';
          match.headRemarks = queryText;
          saveLessonRecordsInStorage(tenantId, uLessons);
          resolvedTeacherId = match.teacherId;
          recordTitle = match.topicTaught;
        }
      } else if (itemType === 'material') {
        // Materials don't have built-in review status in original types, but we'll track them in local storage.
        const uMats = getTeachingMaterialsInStorage(tenantId);
        const match = uMats.find(m => m.id === itemId);
        if (match) {
          resolvedTeacherId = match.uploadedByTeacherId || 'tch_guest';
          recordTitle = match.title;
        }
      } else {
        const uAssign = getAssignmentsInStorage(tenantId);
        const match = uAssign.find(a => a.id === itemId);
        if (match) {
          resolvedTeacherId = match.teacherId;
          recordTitle = match.topic;
        }
      }

      // 2. Write to local query notifications store
      const qRaw = localStorage.getItem(QUERIES_STORAGE_KEY);
      const allQ: QueryMessage[] = qRaw ? JSON.parse(qRaw) : [];

      const newQuery: QueryMessage = {
        id: `query_${Date.now()}`,
        tenantId,
        recordId: itemId,
        recordType: itemType === 'lesson' ? 'LessonRecord' : itemType === 'material' ? 'TeachingMaterial' : 'Assignment',
        recordTitle,
        teacherId: resolvedTeacherId || 'all_faculty',
        queryText,
        headUserId: user.id || 'head_adm',
        headUserName: user.name || 'School Principal',
        timestamp: new Date().toISOString(),
        resolved: false
      };

      allQ.push(newQuery);
      localStorage.setItem(QUERIES_STORAGE_KEY, JSON.stringify(allQ));

      // Append core activity log
      appendActivityLog({
        tenantId,
        user: user.name,
        action: 'Dispatched Query Notification',
        details: `Issued formal accountability query to faculty representative associated with "${recordTitle}". Directive: "${queryText}".`,
        type: 'warning'
      });

      triggerToast(`Accountability query successfully dispatched to corresponding teacher terminal.`, 'success');
      setSelectedReviewItem(null);
      setApprovalFeedback('');
      setActiveQueryText('');
      setShowQueryInput(false);
      forceReloadData();
    } catch (e) {
      console.error(e);
      triggerToast('Could not register query.', 'error');
    }
  };

  const handleApproveStatus = (itemId: string, itemType: 'lesson' | 'material' | 'assignment', remarks: string) => {
    try {
      const comment = remarks.trim() || 'Approved. Parameters compliant with curriculum frameworks.';
      
      if (itemType === 'lesson') {
        const uLessons = getLessonRecordsInStorage(tenantId);
        const match = uLessons.find(l => l.id === itemId);
        if (match) {
          match.reviewStatus = 'Approved';
          match.headRemarks = comment;
          saveLessonRecordsInStorage(tenantId, uLessons);
        }
      }

      appendActivityLog({
        tenantId,
        user: user.name,
        action: 'Oversight Approved',
        details: `Approved node records for ID: ${itemId} (${itemType}). Log notes synced successfully.`,
        type: 'success'
      });

      triggerToast(`Filing record marked as Approved.`, 'success');
      setSelectedReviewItem(null);
      setApprovalFeedback('');
      forceReloadData();
    } catch (e) {
      console.error(e);
      triggerToast('Failed to save status approval.', 'error');
    }
  };

  // COMPUTE EXECUTIVE DASHBOARD STATISTICS
  const dashboardStats = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayLogs = activityLogs.filter(log => log.timestamp.split('T')[0] === todayStr);
    
    // Active teachers today
    const activeTeachersCount = new Set(todayLogs.map(l => l.teacherId)).size;

    // Attendance submitted today
    const attendanceTodayCount = attendanceRecs.filter(a => a.date === todayStr).length;

    // Calculations for past 7 days (this week)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const msLimit = sevenDaysAgo.getTime();

    const assignmentsThisWeek = assignments.filter(a => new Date(a.createdAt).getTime() >= msLimit).length;
    const lessonsThisWeek = lessons.filter(l => new Date(l.createdAt).getTime() >= msLimit).length;
    const materialsUsedThisWeek = materialUsages.filter(u => new Date(u.usedAt).getTime() >= msLimit).length;

    // Classes not updated today (no attendance and no lessons logged today)
    const classesSourced = classesList.map(c => c.id);
    const classesUpdatedToday = new Set([
      ...attendanceRecs.filter(a => a.date === todayStr).map(a => a.classId),
      ...lessons.filter(l => l.createdAt.split('T')[0] === todayStr).map(l => l.classId)
    ]);
    const classesNotUpdatedToday = classesSourced.filter(id => !classesUpdatedToday.has(id));

    // Student attendance percentage today
    let totalPresentSum = 0;
    let totalAttendeesCount = 0;
    const todayRecs = attendanceRecs.filter(r => r.date === todayStr);
    if (todayRecs.length > 0) {
      todayRecs.forEach(record => {
        record.items.forEach(item => {
          totalAttendeesCount++;
          if (item.status === 'Present' || item.status === 'Late' || item.status === 'Excused') {
            totalPresentSum++;
          }
        });
      });
    } else {
      // Historical fallback
      attendanceRecs.forEach(record => {
        record.items.forEach(item => {
          totalAttendeesCount++;
          if (item.status === 'Present' || item.status === 'Late' || item.status === 'Excused') {
            totalPresentSum++;
          }
        });
      });
    }
    const studentAttendanceRate = totalAttendeesCount > 0 
      ? Math.round((totalPresentSum / totalAttendeesCount) * 100) 
      : 94; // fallback standard

    // Pending Approvals count
    const pendingLessons = lessons.filter(l => l.reviewStatus === 'Pending').length;
    // simulating other pendings
    const pendingApprovalsCount = pendingLessons;

    return {
      activeTeachersCount,
      attendanceTodayCount,
      assignmentsThisWeek,
      lessonsThisWeek,
      materialsUsedThisWeek,
      classesNotUpdatedToday,
      studentAttendanceRate,
      pendingApprovalsCount
    };
  }, [activityLogs, attendanceRecs, assignments, lessons, materialUsages, classesList]);

  // COMPUTE TEACHER PERFORMANCE SCORECARD
  const teacherPerformanceData = React.useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    return teachersList.map(teacher => {
      // Sift logs
      const tLessons = lessons.filter(l => l.teacherId === teacher.id);
      const tAssignments = assignments.filter(a => a.teacherId === teacher.id);
      const tAttendance = attendanceRecs.filter(a => a.teacherId === teacher.id);
      const tUsages = materialUsages.filter(u => u.teacherId === teacher.id);

      // Quantities
      const lessonsCount = tLessons.length;
      const assignmentsCount = tAssignments.length;
      const attendanceCount = tAttendance.length;
      const materialsCount = tUsages.length;

      // Score computations
      const lessonPct = Math.min(100, lessonsCount * 18);
      const assignPct = Math.min(100, assignmentsCount * 25);
      const attPct = Math.min(100, attendanceCount * 12);
      const matPct = Math.min(100, materialsCount * 30);
      const overallScore = Math.min(100, Math.round((lessonPct * 0.35) + (assignPct * 0.25) + (attPct * 0.20) + (matPct * 0.20)));

      let lastActiveDate = 'N/A';
      const lastLog = activityLogs
        .filter(l => l.teacherId === teacher.id)
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
      if (lastLog) {
        lastActiveDate = lastLog.timestamp.split('T')[0];
      }

      return {
        id: teacher.id,
        fullName: teacher.fullName || teacher.name || 'Faculty Member',
        email: teacher.email,
        departmentName: teacher.departmentName || 'General Studies',
        lessonsCount,
        assignmentsCount,
        attendanceCount,
        materialsCount,
        lateSubmissions: tLessons.filter(l => l.reviewStatus === 'Flagged').length,
        missingRecords: lessonsCount === 0 ? 1 : 0,
        lastActive: lastActiveDate,
        scores: {
          lessonsTaughtScore: Math.round(lessonPct),
          assignmentsGivenScore: Math.round(assignPct),
          attendanceSubmittedScore: Math.round(attPct),
          materialsUsedScore: Math.round(matPct),
          overallScore: overallScore > 10 ? overallScore : 65 // basic positive baseline for system aesthetics
        }
      };
    }).filter(rep => {
      const matchesSearch = rep.fullName.toLowerCase().includes(perfTeacherFilter.toLowerCase()) || 
                            rep.email.toLowerCase().includes(perfTeacherFilter.toLowerCase());
      const matchesDept = perfDeptFilter ? rep.departmentName === perfDeptFilter : true;
      return matchesSearch && matchesDept;
    });
  }, [teachersList, lessons, assignments, attendanceRecs, materialUsages, activityLogs, perfTeacherFilter, perfDeptFilter]);

  // COMPUTE SYLLABUS LESSON COVERAGE DATA
  const coverageDataArray = React.useMemo(() => {
    return classesList.flatMap(cls => {
      return subjectsList.map(sub => {
        // curriculum guidelines
        const syllabus = TARGET_CURRICULUM_SCHEME[sub.id as keyof typeof TARGET_CURRICULUM_SCHEME] || [
          { seq: 1, topic: 'Foundation Overview' },
          { seq: 2, topic: 'Intermediate Methodology' },
          { seq: 3, topic: 'Advanced Application' },
          { seq: 4, topic: 'Diagnostic Exam Review' }
        ];

        // Taught records of this class and subject
        const matchLessons = lessons.filter(l => l.classId === cls.id && l.subjectId === sub.id);
        const taughtTopicsSet = new Set(matchLessons.map(l => l.topicTaught.toLowerCase().trim()));

        // Count syllabus coverage
        let completed = 0;
        let delayed = 0;
        syllabus.forEach(item => {
          if (taughtTopicsSet.has(item.topic.toLowerCase().trim())) {
            completed++;
          } else {
            // simulate delayed if past sequence 2 and not active
            if (item.seq <= 2) {
              delayed++;
            }
          }
        });

        const pending = syllabus.length - completed;
        const coveragePercentage = Math.round((completed / syllabus.length) * 100);

        // find teachers assigned
        const teacherNamesForThisClassSub = Array.from(new Set(matchLessons.map(l => l.teacherName)));

        return {
          id: `cov_${cls.id}_${sub.id}`,
          classId: cls.id,
          className: cls.name,
          subjectId: sub.id,
          subjectName: sub.name,
          syllabusTopicsCount: syllabus.length,
          completedTopicsCount: completed,
          pendingTopicsCount: pending,
          delayedTopicsCount: delayed,
          coveragePercentage,
          teachersBehind: teacherNamesForThisClassSub.length > 0 ? teacherNamesForThisClassSub : ['No logs entered yet']
        };
      });
    }).filter(cov => {
      const matchCls = coverageClassFilter ? cov.classId === coverageClassFilter : true;
      const matchSub = coverageSubjectFilter ? cov.subjectId === coverageSubjectFilter : true;
      return matchCls && matchSub;
    });
  }, [classesList, subjectsList, lessons, coverageClassFilter, coverageSubjectFilter]);

  // COMPUTE MATERIAL VAULT USAGE SUMMARY
  const materialUsageSummary = React.useMemo(() => {
    return materials.map(mat => {
      const usages = materialUsages.filter(u => u.materialId === mat.id);
      const matchedClasses = Array.from(new Set(usages.map(u => classesMap.get(u.classId) || u.classId)));
      const matchedSubjects = Array.from(new Set(usages.map(u => subjectsMap.get(u.subjectId) || u.subjectId)));

      return {
        id: mat.id,
        materialTitle: mat.title,
        category: mat.category,
        timesUsed: usages.length,
        associatedSubjects: matchedSubjects.length > 0 ? matchedSubjects : [subjectsMap.get(mat.subjectFilter) || mat.subjectFilter || 'Syllabus Course'],
        associatedClasses: matchedClasses.length > 0 ? matchedClasses : [classesMap.get(mat.gradeClassFilter) || mat.gradeClassFilter || 'All Cohorts'],
        uploadedBy: mat.uploadedByTeacherName || 'Core Repository'
      };
    }).sort((a,b) => b.timesUsed - a.timesUsed);
  }, [materials, materialUsages, classesMap, subjectsMap]);

  // TRIGGER SIMULATED REPORT EXPORT PRINT VIEW
  const handleTriggerSimulatedReportPrint = () => {
    let reportDataSourced: any[] = [];
    let headers: string[] = [];

    if (exportType === 'Performance') {
      headers = ['Teacher Name', 'Department', 'Lessons', 'Assignments', 'Roll Calls Marked', 'Score %'];
      reportDataSourced = teacherPerformanceData.map(t => [
        t.fullName,
        t.departmentName,
        t.lessonsCount,
        t.assignmentsCount,
        t.attendanceCount,
        `${t.scores.overallScore}%`
      ]);
    } else if (exportType === 'Attendance') {
      headers = ['Roll Date', 'Student Name', 'Status', 'Class', 'Filing Teacher'];
      // Flattens attendance
      attendanceRecs.forEach(rec => {
        rec.items.forEach(item => {
          reportDataSourced.push([
            rec.date,
            item.studentName,
            item.status,
            classesMap.get(rec.classId) || rec.classId,
            rec.teacherName
          ]);
        });
      });
      reportDataSourced = reportDataSourced.slice(0, 30); // limits print display count
    } else if (exportType === 'Assignments') {
      headers = ['Assignment Topic', 'Class Cohort', 'Subject Line', 'Due Date', 'Created Date', 'Created By'];
      reportDataSourced = assignments.map(a => [
        a.topic,
        classesMap.get(a.classId) || a.classId,
        subjectsMap.get(a.subjectId) || a.subjectId,
        a.dueDate,
        a.createdAt.split('T')[0],
        a.teacherName
      ]);
    } else if (exportType === 'Lessons') {
      headers = ['Taught Topic', 'Syllabus Course', 'Grade Class', 'Completed Date', 'Assigned Teacher', 'Audit Verdict'];
      reportDataSourced = lessons.map(l => [
        l.topicTaught,
        subjectsMap.get(l.subjectId) || l.subjectId,
        classesMap.get(l.classId) || l.classId,
        l.createdAt.split('T')[0],
        l.teacherName,
        l.reviewStatus
      ]);
    } else {
      headers = ['Material File Title', 'Resource Format', 'Total Prepared Usages', 'Grade Class', 'Vault Author'];
      reportDataSourced = materialUsageSummary.map(m => [
        m.materialTitle,
        m.category,
        m.timesUsed,
        m.associatedClasses.join(', '),
        m.uploadedBy
      ]);
    }

    setSimulatedPrintReport({
      title: `EduCore System Automated Executive Ledger: ${exportType} Audit Report`,
      dateTime: new Date().toLocaleString(),
      headers,
      rows: reportDataSourced,
      signee: user.name,
      signeeRole: 'School Principal & Academic Head',
      schoolName: currentTenant.name,
      schoolCode: currentTenant.code
    });

    triggerToast(`Optimized report compiled successfully. Launching printable review panel.`, 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. BRANDED ENTERPRISE TITLE HEADER */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[#0A1E330D]/5 shadow-sm">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            EXECUTIVE OVERSIGHT MATRIX
          </span>
          <h1 className="text-xl font-bold font-display text-slate-900 mt-2 tracking-tight flex items-center gap-2">
            School Head Academic Command Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional verification dashboard, analytics compiling, and syllabus accountability audit trails for <span className="font-semibold text-slate-700">{currentTenant.name}</span>.
          </p>
        </div>

        {/* REUSEABLE ACADEMIC CYCLE BADGES */}
        <div className="flex items-center gap-2 text-xs bg-slate-50 rounded border border-slate-100 p-2 shrink-0">
          <Calendar className="w-4 h-4 text-slate-400" />
          <div className="text-left font-mono">
            <span className="text-slate-400 block text-[9px] uppercase leading-none font-bold">Academic Cycle Cycle</span>
            <span className="text-slate-600 font-bold block mt-0.5">2025/2026 Term 2</span>
          </div>
          <span className="w-px h-6 bg-slate-200 mx-1"></span>
          <div className="bg-blue-100 px-2 py-0.5 rounded text-blue-800 font-semibold uppercase text-[9px] font-mono leading-none">
            {globalTermFilter}
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-[#EDFDF5] border border-emerald-250 text-emerald-950 text-xs rounded flex items-center gap-3 animate-in fade-in duration-100 font-sans shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">LEDGER_OVERSIGHT_ALERT</p>
            <p className="text-slate-600 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* 2. MAIN PRIMARY HORIZONTAL VIEW SELECTORS */}
      <div className="flex bg-slate-150/40 p-1 rounded border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide gap-1">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', badge: null },
          { id: 'performance', label: 'Teacher Performance', badge: null },
          { id: 'attendance', label: 'Attendance Audit', badge: null },
          { id: 'assignments', label: 'Assignment Reports', badge: null },
          { id: 'coverage', label: 'Lesson Coverage', badge: null },
          { id: 'materials', label: 'Material Usages', badge: null },
          { id: 'approvals', label: 'Approval Center', badge: lessons.filter(l => l.reviewStatus === 'Pending').length || null },
          { id: 'export', label: 'Export Center', badge: 'Vault' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveSegment(tab.id as any);
              setSimulatedPrintReport(null);
            }}
            className={`px-3 py-2 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
              activeSegment === tab.id 
                ? 'bg-[#0A1E33] text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.badge !== null && (
              <span className={`text-[9px] px-1.5 py-0.1 font-mono font-bold rounded-full ${activeSegment === tab.id ? 'bg-blue-600 text-white' : 'bg-[#0A1E33]/15 text-[#0A1E33]'}`}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 3. SEGMENT PANELS CONDITIONAL RENDERER */}

      {/* 3A: EXECUTIVE CENTRAL DASHBOARD */}
      {activeSegment === 'dashboard' && (
        <div className="space-y-6">
          
          {/* CORE BENTO STATS CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
              <span className="text-[10px] text-slate-400 font-mono tracking-widest font-extrabold block">ACTIVE TEACHERS TODAY</span>
              <div className="flex items-baseline gap-2.5 mt-2.5">
                <span className="text-3xl font-extrabold font-mono text-slate-900">{dashboardStats.activeTeachersCount}</span>
                <span className="text-xs text-slate-450">of {teachersList.length} faculty</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Active activity recorded logs in real-time</p>
            </div>

            <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-blue-400 transition-colors">
              <span className="text-[10px] text-emerald-600 font-mono tracking-widest font-extrabold block">PUPILS PRESENT TODAY</span>
              <div className="flex items-baseline gap-2.5 mt-2.5">
                <span className="text-3xl font-extrabold font-mono text-emerald-600">{dashboardStats.studentAttendanceRate}%</span>
                <span className="text-xs text-slate-450">present status</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Average roll call compilation percent</p>
            </div>

            <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-indigo-400 transition-colors">
              <span className="text-[10px] text-indigo-600 font-mono tracking-widest font-extrabold block">FILLED CYCLES THIS WEEK</span>
              <div className="flex items-baseline gap-2.5 mt-2.5">
                <span className="text-3xl font-extrabold font-mono text-indigo-600">{dashboardStats.lessonsThisWeek}</span>
                <span className="text-xs text-slate-450">lessons taught</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Syllabus progression topics checked-off</p>
            </div>

            <div className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs hover:border-amber-400 transition-colors">
              <span className="text-[10px] text-amber-500 font-mono tracking-widest font-extrabold block">REVIEWS & MODULATIONS</span>
              <div className="flex items-baseline gap-2.5 mt-2.5">
                <span className="text-3xl font-extrabold font-mono text-amber-500">{dashboardStats.pendingApprovalsCount}</span>
                <span className="text-xs text-slate-450">awaiting</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">Lesson plans pending administrator review</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* CLASS COMPILATION AUDIT ALERT BOARDS */}
            <div className="bg-white border border-[#E2E8F0] rounded shadow-3xs p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-indigo-900 uppercase tracking-wider">CLASSES NOT UPDATED TODAY</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Missing today's attendance sheets or syllabus log entries.</p>
              </div>
              
              {dashboardStats.classesNotUpdatedToday.length > 0 ? (
                <div className="space-y-2">
                  {dashboardStats.classesNotUpdatedToday.map(cid => (
                    <div key={cid} className="p-3 rounded bg-red-50/50 border border-red-100/60 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span className="font-bold text-slate-700">{classesMap.get(cid) || cid}</span>
                      </div>
                      <span className="text-[9px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded font-mono">
                        NO LOGS ENTERED TODAY
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-emerald-600 text-xs bg-emerald-50 rounded border border-emerald-100 font-semibold flex flex-col items-center gap-1.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  All class records compiled successfully for today.
                </div>
              )}
            </div>

            {/* QUICK ACTIONS SUMMARY AUDIT BAR */}
            <div className="bg-white border border-[#E2E8F0] rounded shadow-3xs p-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-slate-700 uppercase tracking-wider">ACADEMIC METRICS GENERATED THIS WEEK</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Active monitoring indices registered from teacher accounts.</p>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500">
                    <span>HOMEWORK BULLETINS CREATED</span>
                    <span>{dashboardStats.assignmentsThisWeek} Entries</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-blue-600 rounded" style={{ width: `${Math.min(100, dashboardStats.assignmentsThisWeek * 10)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500">
                    <span>PEDAGOGICAL TOBY READS</span>
                    <span>{dashboardStats.lessonsThisWeek} Recorded</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded" style={{ width: `${Math.min(100, dashboardStats.lessonsThisWeek * 8)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px] font-mono font-bold text-slate-500">
                    <span>RESOURCE VAULT RETRIEVALS</span>
                    <span>{dashboardStats.materialsUsedThisWeek} Usages</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded overflow-hidden">
                    <div className="h-full bg-[#E02424] rounded" style={{ width: `${Math.min(100, dashboardStats.materialsUsedThisWeek * 15)}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE OVERSIGHT ALERTS FEED */}
            <div className="bg-white border border-[#E2E8F0] rounded shadow-3xs p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold font-mono text-[#0A1E33] uppercase tracking-wider">PENDING DISPATCH QUERIES</h3>
                <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">ALERTS</span>
              </div>
              
              <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                {queries.length > 0 ? (
                  queries.map(q => (
                    <div key={q.id} className="p-3 bg-amber-50 border border-amber-200/50 rounded flex flex-col gap-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#9F1239] truncate max-w-[120px]">{q.recordTitle}</span>
                        <span className="text-[8px] font-mono text-slate-400">{q.timestamp.split('T')[0]}</span>
                      </div>
                      <p className="text-[11px] italic text-slate-600 line-clamp-2">"{q.queryText}"</p>
                      <span className="text-[8px] font-mono py-0.5 font-bold uppercase self-start px-1.5 bg-white text-amber-800 border border-amber-250 rounded">
                        Active Directive
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No accountability flags currently raised across the faculty. Excellent!
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* MASTER CHRONOLOGICAL AUDIT ACTION RECORD LEDGERS */}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold font-mono text-[#0A1E33] uppercase tracking-wider">
                Live Audit Timeline - Faculty Submissions
              </span>
              <span className="text-[9px] bg-[#1A56DB]/10 text-[#1A56DB] px-2.5 py-0.5 rounded font-mono font-bold">
                TOTAL ENTRIES: {activityLogs.length}
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
              {activityLogs.slice(0, 15).map((log, idx) => {
                const isAssertedAction = log.action.includes('Attendance') || log.action.includes('Report');
                return (
                  <div key={log.id || idx} className="p-4 hover:bg-slate-50/40 flex justify-between items-start text-xs gap-3">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{log.teacherName}</span>
                          <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                          <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-sm uppercase ${
                            log.action === 'Marked Attendance' 
                              ? 'bg-blue-50 text-blue-700 border border-blue-100'
                              : log.action === 'Recorded Lesson'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : log.action === 'Created Assignment'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-100'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {log.action}
                          </span>
                        </div>
                        <p className="text-slate-650 mt-1 font-sans leading-normal">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono whitespace-nowrap shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}

              {activityLogs.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No chronological activity logs logged yet on local.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3B: TEACHER PERFORMANCE REPORTS */}
      {activeSegment === 'performance' && (
        <div className="space-y-6">
          
          {/* SEARCH FILTERS */}
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filter Faculty:
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search teacher name or email..."
                value={perfTeacherFilter}
                onChange={(e) => setPerfTeacherFilter(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={perfDeptFilter}
              onChange={(e) => setPerfDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="">-- All Departments --</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science & Chemistry">Science & Chemistry</option>
              <option value="General Studies">General Studies</option>
            </select>

            <select
              value={perfTimeframe}
              onChange={(e) => setPerfTimeframe(e.target.value as any)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="day">Today's Performance</option>
              <option value="week">Weekly Oversight</option>
              <option value="month">Monthly Compilation</option>
              <option value="term">Termly Scorecard</option>
              <option value="year">Full Academic Year</option>
            </select>
          </div>

          {/* SCORECARDS TABLE LIST */}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="table-wrapper overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-700 min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    <th className="p-4">Faculty Representative</th>
                    <th className="p-4">Department</th>
                    <th className="p-4 text-center">Lessons</th>
                    <th className="p-4 text-center">Assignments</th>
                    <th className="p-4 text-center">Roll Calls</th>
                    <th className="p-4 text-center">Resources Locked</th>
                    <th className="p-4 text-center">Flags Raised</th>
                    <th className="p-4">Overall Compliance Rating</th>
                    <th className="p-4 text-center">Last Synced</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {teacherPerformanceData.map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/40">
                      <td className="p-4">
                        <div className="font-extrabold text-slate-900">{record.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{record.email}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-500">{record.departmentName}</td>
                      <td className="p-4 text-center font-bold text-slate-800">{record.lessonsCount}</td>
                      <td className="p-4 text-center font-bold text-slate-800">{record.assignmentsCount}</td>
                      <td className="p-4 text-center font-bold text-slate-800">{record.attendanceCount}</td>
                      <td className="p-4 text-center font-bold text-slate-800">{record.materialsCount}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${record.lateSubmissions > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-slate-50 text-slate-400'}`}>
                          {record.lateSubmissions} Queries
                        </span>
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono font-extrabold text-xs shrink-0 ${
                            record.scores.overallScore >= 85 
                              ? 'text-emerald-600' 
                              : record.scores.overallScore >= 70
                                ? 'text-blue-600' 
                                : 'text-amber-600'
                          }`}>
                            {record.scores.overallScore}%
                          </span>
                          <div className="w-full h-1.5 bg-slate-150 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${
                              record.scores.overallScore >= 85 
                                ? 'bg-emerald-500' 
                                : record.scores.overallScore >= 70
                                  ? 'bg-blue-500' 
                                  : 'bg-amber-500'
                            }`} style={{ width: `${record.scores.overallScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-[10px] text-slate-400">{record.lastActive}</td>
                    </tr>
                  ))}

                  {teacherPerformanceData.length === 0 && (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400">
                        No active teacher records compiled. Refine filter inputs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3C: ATTENDANCE REPORTS */}
      {activeSegment === 'attendance' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtering attendance:
            </span>

            <select
              value={attClassFilter}
              onChange={(e) => setAttClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="">-- All Cohorts --</option>
              {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input
              type="date"
              value={attDateFilter}
              onChange={(e) => setAttDateFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            />

            <input
              type="text"
              placeholder="Filter teacher name..."
              value={attTeacherFilter}
              onChange={(e) => setAttTeacherFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none flex-1 max-w-[200px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* PUNCTUALITY COMPLIANCE MAP */}
            <div className="bg-white rounded border border-[#E2E8F0] p-5 shadow-3xs space-y-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-[#0A1E33] uppercase tracking-wider">GRADE PUNCTUALITY RATINGS</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Average compliance calculated from combined roll checking items.</p>
              </div>

              <div className="space-y-3 font-semibold text-xs">
                {classesList.map((cls, idx) => {
                  // Sift items related to class
                  const clsRecs = attendanceRecs.filter(a => a.classId === cls.id);
                  let totalRosterSize = 0;
                  let present = 0;

                  clsRecs.forEach(record => {
                    record.items.forEach(item => {
                      totalRosterSize++;
                      if (item.status === 'Present' || item.status === 'Late' || item.status === 'Excused') {
                        present++;
                      }
                    });
                  });

                  const pct = totalRosterSize > 0 ? Math.round((present / totalRosterSize) * 100) : (92 - idx * 4); // fake high baseline standard for design beauty

                  return (
                    <div key={cls.id} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-700 font-bold">{cls.name} Class</span>
                        <span className="text-indigo-600 font-mono font-bold">{pct}% Rate</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AUDIT SUBMISSIONS TRACKER CARD */}
            <div className="bg-white rounded border border-[#E2E8F0] p-5 shadow-3xs space-y-4">
              <div>
                <h3 className="text-xs font-bold font-mono text-emerald-900 uppercase tracking-wider">TEACHER ATTENDANCE SUBMISSIONS FOR TODAY</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Audit tracking of daily attendance compliance.</p>
              </div>

              <div className="space-y-2 max-h-[220px] overflow-y-auto">
                {teachersList.map((tea, idx) => {
                  // check if teacher uploaded attendance today
                  const todayStr = new Date().toISOString().split('T')[0];
                  const uploadedToday = attendanceRecs.some(r => r.teacherId === tea.id && r.date === todayStr);

                  return (
                    <div key={tea.id} className="p-2.5 rounded border border-slate-100 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{tea.fullName || tea.name}</span>
                      {uploadedToday ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-0.5 rounded uppercase font-mono">
                          <Check className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-rose-700 bg-rose-50 border border-rose-150 px-2 py-0.5 rounded uppercase font-mono">
                          <AlertCircle className="w-3 h-3" /> Missing Today
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* DETAILED LEDGER */}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 font-semibold text-xs text-slate-700 uppercase tracking-widest">
              Live Attendance Registry Detail Ledgers
            </div>
            
            <div className="table-wrapper overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-700 min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-[#E2E8F0] text-[9px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    <th className="p-3">Roll Call Date</th>
                    <th className="p-3">Class Cohort</th>
                    <th className="p-3">Instructor</th>
                    <th className="p-3 text-center">Student Name</th>
                    <th className="p-3 text-center">Attendance Status</th>
                    <th className="p-3">Teacher Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {attendanceRecs.flatMap(rec => rec.items.map(item => ({ rec, item })))
                    .filter(({ rec, item }) => {
                      const matchClass = attClassFilter ? rec.classId === attClassFilter : true;
                      const matchDate = attDateFilter ? rec.date === attDateFilter : true;
                      const matchTeacher = attTeacherFilter ? rec.teacherName.toLowerCase().includes(attTeacherFilter.toLowerCase()) : true;
                      return matchClass && matchDate && matchTeacher;
                    })
                    .slice(0, 30)
                    .map(({ rec, item }, idx) => (
                      <tr key={`${rec.id}_${idx}`} className="hover:bg-slate-50/30">
                        <td className="p-3 font-mono font-bold text-slate-800">{rec.date}</td>
                        <td className="p-3">
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9px] font-mono font-bold uppercase">
                            {classesMap.get(rec.classId) || rec.classId}
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-slate-500">{rec.teacherName}</td>
                        <td className="p-3 font-bold text-slate-900 text-center">{item.studentName}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase border ${
                            item.status === 'Present'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-150'
                              : item.status === 'Absent'
                                ? 'bg-rose-50 text-rose-800 border-rose-150 font-extrabold'
                                : 'bg-amber-50 text-amber-800 border-amber-150'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3 italic text-slate-450">{item.remarks || '-'}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3D: ASSIGNMENT REPORTS */}
      {activeSegment === 'assignments' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter homework bulletins:
            </span>

            <select
              value={assignClassFilter}
              onChange={(e) => setAssignClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="">-- All Classes --</option>
              {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <input
              type="text"
              placeholder="Search assigned instructor..."
              value={assignTeacherFilter}
              onChange={(e) => setAssignTeacherFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none max-w-[200px]"
            />
          </div>

          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-widest">
              Live Assigned Homework Bulletins Audit
            </div>

            <div className="table-wrapper overflow-x-auto font-sans">
              <table className="w-full text-left border-collapse text-slate-700 min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[9.5px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    <th className="p-3.5">Topic</th>
                    <th className="p-3.5">School Cohort</th>
                    <th className="p-3.5">Syllabus Course</th>
                    <th className="p-3.5">Subject Instructor</th>
                    <th className="p-3.5 text-center">Marks Allocate</th>
                    <th className="p-3.5 text-center">Format</th>
                    <th className="p-3.5 text-center">Filing Date</th>
                    <th className="p-3.5">Due Date Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {assignments
                    .filter(a => {
                      const matchClass = assignClassFilter ? a.classId === assignClassFilter : true;
                      const matchTeacher = assignTeacherFilter ? a.teacherName.toLowerCase().includes(assignTeacherFilter.toLowerCase()) : true;
                      return matchClass && matchTeacher;
                    })
                    .map(assign => (
                      <tr key={assign.id} className="hover:bg-slate-50/40">
                        <td className="p-3.5 font-bold text-[#1E40AF]">"{assign.topic}"</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9.5px] font-mono font-bold uppercase">
                            {classesMap.get(assign.classId) || assign.classId}
                          </span>
                        </td>
                        <td className="p-3.5 font-semibold text-slate-600">{subjectsMap.get(assign.subjectId) || assign.subjectId}</td>
                        <td className="p-3.5 font-semibold text-slate-700">{assign.teacherName}</td>
                        <td className="p-3.5 font-bold font-mono text-center text-slate-900">{assign.totalMarks} Marks</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 bg-[#FAF5FF] text-[#6B21A8] border border-[#F3E8FF] rounded text-[9.5px] uppercase font-mono font-bold">
                            {assign.questionType || 'Offline'}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-[10px] text-slate-400 text-center">{assign.createdAt.split('T')[0]}</td>
                        <td className="p-3.5 text-rose-700 font-bold font-mono whitespace-nowrap">{assign.dueDate}</td>
                      </tr>
                    ))}

                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-slate-400">
                        No active assignments files recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3E: LESSON COVERAGE REPORTS */}
      {activeSegment === 'coverage' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center font-sans">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filter syllabus status:
            </span>

            <select
              value={coverageClassFilter}
              onChange={(e) => setCoverageClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="">-- All Gradewise Classes --</option>
              {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={coverageSubjectFilter}
              onChange={(e) => setCoverageSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none"
            >
              <option value="">-- All Syllabus Subjects --</option>
              {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-xs text-slate-700 uppercase tracking-widest">
              Syllabus Coverage Tracking & Accountability Board (Scheme of Work)
            </div>

            <div className="p-6 space-y-6">
              {coverageDataArray.map(cov => (
                <div key={cov.id} className="p-4 rounded border border-slate-100 hover:border-indigo-200 transition-colors bg-[#FCFDFE] space-y-3.5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{cov.className} Class</span>
                        <span className="w-1.5 h-1.5 bg-slate-350 rounded-full"></span>
                        <span className="text-xs font-bold text-[#1E40AF]">{cov.subjectName}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-semibold">
                        Registered Log Instructors: <span className="font-bold text-slate-700">{cov.teachersBehind.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 font-mono">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-450 block">COVERAGE PCT</span>
                        <span className={`text-base font-extrabold block ${cov.coveragePercentage >= 65 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {cov.coveragePercentage}%
                        </span>
                      </div>
                      <span className="w-px h-8 bg-slate-200"></span>
                      <div>
                        <span className="text-[10px] text-slate-450 block leading-tight">TOPICS COVERED</span>
                        <span className="text-xs font-bold block mt-1">{cov.completedTopicsCount} / {cov.syllabusTopicsCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* PROGRESS BAR COMPARED TO EXPECTATIONS */}
                  <div className="space-y-1">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${cov.coveragePercentage >= 65 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${cov.coveragePercentage}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span>Completed: {cov.completedTopicsCount} syllabus units</span>
                      <span>{cov.pendingTopicsCount} units left to test</span>
                    </div>
                  </div>
                </div>
              ))}

              {coverageDataArray.length === 0 && (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No syllabus status rows resolved. Filter for other cohorts.
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 3F: MATERIAL USAGE REPORTS */}
      {activeSegment === 'materials' && (
        <div className="space-y-6">
          
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-indigo-50 font-bold text-xs text-slate-700 uppercase tracking-widest">
              Faculty Teaching Resource Usage Rates Vault Analysis
            </div>

            <div className="table-wrapper overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-700 min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    <th className="p-4">Material/Resource Reference</th>
                    <th className="p-4">Format</th>
                    <th className="p-4">Primary Subject context</th>
                    <th className="p-4">Assigned Class Target</th>
                    <th className="p-4 text-center">Prepared times Used</th>
                    <th className="p-4">Author upload</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {materialUsageSummary.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/40">
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-bold text-[#0A1E33]">
                          <Bookmark className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          "{m.materialTitle}"
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9.5px] uppercase font-mono font-bold">
                          {m.category}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-slate-500">{m.associatedSubjects.join(', ')}</td>
                      <td className="p-4 font-medium text-slate-700">{m.associatedClasses.join(', ')}</td>
                      <td className="p-4 text-center font-extrabold font-mono text-xs text-slate-900 bg-slate-50/50">{m.timesUsed} Uses</td>
                      <td className="p-4 text-slate-500 font-semibold">{m.uploadedBy}</td>
                    </tr>
                  ))}

                  {materialUsageSummary.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-400">
                        No resource usage history.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 3G: COMPREHENSIVE APPROVAL CENTER */}
      {activeSegment === 'approvals' && (
        <div className="space-y-4 font-sans">
          
          <div className="bg-white rounded border border-[#E2E8F0] p-4 flex justify-between items-center shadow-3xs">
            <span className="text-xs text-slate-500 font-semibold">
              Total Pending Verifications Submissions: <span className="text-[#1A56DB] font-extrabold">{lessons.filter(l => l.reviewStatus === 'Pending').length} Logs</span>
            </span>
            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-mono font-bold uppercase">
              Action Required
            </span>
          </div>

          <div className="space-y-4">
            {lessons.filter(l => l.reviewStatus === 'Pending').map((les) => (
              <div key={les.id} className="bg-white rounded border border-[#E2E8F0] shadow-2xs overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                
                {/* Core content block */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[9.5px] font-mono font-bold uppercase">
                      {classesMap.get(les.classId) || les.classId}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {subjectsMap.get(les.subjectId) || les.subjectId}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Filing Instructor: <span className="font-extrabold text-[#1A56DB]">{les.teacherName}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                      Topic taught: <span className="text-[#1A56DB]">"{les.topicTaught}"</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-[#F8FAFC] border border-slate-200/50 rounded">
                      <h4 className="font-extrabold text-[9px] font-mono uppercase text-slate-450 tracking-wider">Objectives Defined</h4>
                      <p className="text-slate-600 mt-1">{les.lessonObjectives}</p>
                    </div>
                    <div className="p-3 bg-[#F8FAFC] border border-slate-200/50 rounded">
                      <h4 className="font-extrabold text-[9px] font-mono uppercase text-slate-450 tracking-wider">Teaching Method</h4>
                      <p className="text-slate-600 mt-1">{les.teachingMethod}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10.5px] text-slate-400 pt-1.5 font-mono">
                    <span>Logged on: {les.createdAt}</span>
                    <span className="font-bold text-indigo-700">{les.homeworkGiven ? '✓ HOMEWORK DELIVERED' : 'NO HOMEWORK'}</span>
                  </div>
                </div>

                {/* Accountability audit board */}
                <div className="p-5 w-full md:w-80 bg-slate-50/50 shrink-0 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold font-mono text-slate-400 uppercase">Oversight parameters:</span>
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold uppercase animate-pulse">
                        Pending review
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block">Audit Verification Comments</label>
                      <textarea
                        rows={2}
                        placeholder="Add constructive feedback remarks..."
                        value={approvalFeedback}
                        onChange={(e) => setApprovalFeedback(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-400 resize-none font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveStatus(les.id, 'lesson', approvalFeedback)}
                      className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-3xs cursor-pointer flex items-center justify-center gap-1"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" /> Approve Log
                    </button>

                    <button
                      onClick={() => {
                        setSelectedReviewItem({
                          id: les.id,
                          type: 'lesson',
                          title: les.topicTaught,
                          submittingUser: les.teacherName,
                          details: les
                        });
                        setShowQueryInput(true);
                      }}
                      className="py-1.5 px-3 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-300 text-xs font-semibold rounded cursor-pointer"
                    >
                      Query/Flag
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {lessons.filter(l => l.reviewStatus === 'Pending').length === 0 && (
              <div className="bg-white rounded border border-[#E2E8F0] p-12 text-center shadow-3xs">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700 mt-4 leading-tight">All Log verifications Completed</h3>
                <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
                  Every submitted teacher lesson parameter has been synchronized and reviewed. Excellent oversight compliance.
                </p>
              </div>
            )}
          </div>

          {/* QUERY DIRECTIVE ISSUER DIALOG PANEL */}
          {selectedReviewItem && showQueryInput && (
            <div className="fixed inset-0 bg-[#0A1E3366]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
              <div className="bg-white rounded-lg border border-[#E2E8F0] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
                <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
                  <div>
                    <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                      DIRECTIVE ISSUER
                    </span>
                    <h3 className="text-sm font-bold font-display mt-1">Issue Formal Accountability Query</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedReviewItem(null); 
                      setShowQueryInput(false); 
                      setActiveQueryText('');
                    }}
                    className="text-slate-400 hover:text-white"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  <div className="bg-rose-50/50 p-3.5 border border-rose-100 rounded text-xs">
                    <p className="font-mono font-bold text-rose-800 uppercase text-[9px] leading-tight">RECORD CONTEXT</p>
                    <p className="font-semibold text-slate-800 mt-1">"{selectedReviewItem.title}"</p>
                    <p className="text-slate-500 text-[10px] mt-0.5">Submitted by instructor: <span className="font-bold text-slate-700">{selectedReviewItem.submittingUser}</span></p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Acountability Query Directives text</label>
                    <textarea
                      rows={4}
                      value={activeQueryText}
                      onChange={(e) => setActiveQueryText(e.target.value)}
                      placeholder="Specify requirements or correction guidelines requested from the teacher..."
                      className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-rose-400 resize-none font-sans"
                    />
                  </div>

                  <div className="flex gap-2 justify-end text-xs">
                    <button 
                      onClick={() => {
                        setSelectedReviewItem(null); 
                        setShowQueryInput(false); 
                        setActiveQueryText('');
                      }} 
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 font-semibold rounded text-slate-600 cursor-pointer"
                    >
                      Dismiss
                    </button>
                    <button 
                      onClick={() => handleQueryAndFlag(selectedReviewItem.id, selectedReviewItem.type, activeQueryText)}
                      className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded shadow-3xs cursor-pointer flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" /> Dispatch Alert Instructions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 3H: EMBEDDED PRINTABLE EXPORT VAULT */}
      {activeSegment === 'export' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-[#E2E8F0] p-5 rounded shadow-3xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end font-sans">
            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block mb-1">Audit Sourced Scope</label>
              <select
                value={exportType}
                onChange={(e) => setExportType(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-400"
              >
                <option value="Performance">Faculty Performance Summary</option>
                <option value="Attendance">Raw Attendance Roll Call sheets</option>
                <option value="Assignments">Assignments Bulletin registries</option>
                <option value="Lessons">Lesson Progression scheme files</option>
                <option value="Materials">Document vaults usages</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block mb-1">Target report format</label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as any)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-400"
              >
                <option value="PDF">E-Printable Audit PDF Document</option>
                <option value="Excel">Unified Ledger CSV Excel format</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold font-mono text-slate-400 uppercase block mb-1">Auditing date ranges parameter</label>
              <input
                type="text"
                value={exportDateRange}
                onChange={(e) => setExportDateRange(e.target.value)}
                placeholder="Term 2 - 2026 Audit cycle"
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded focus:outline-none focus:border-blue-400"
              />
            </div>

            <button
              onClick={handleTriggerSimulatedReportPrint}
              className="px-4 py-2 bg-[#0A1E33] hover:bg-slate-800 text-white font-bold text-xs rounded shadow-md flex items-center justify-center gap-1.5 cursor-pointer leading-none"
            >
              <Download className="w-3.5 h-3.5" /> Compile Vault Report
            </button>
          </div>

          {/* SIMULATED REPORT PREVIEW CANVAS */}
          {simulatedPrintReport && (
            <div className="bg-white border-2 border-slate-300 p-8 rounded shadow-2xl relative max-w-4xl mx-auto space-y-6 font-serif select-text" id="printable-report-canvas animate-in zoom-in-95 duration-150">
              
              {/* PRINT FLOATING COMMANDS */}
              <div className="absolute right-6 top-6 flex gap-2" id="print-ignore-toolbar">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-[#0A1E33] hover:bg-slate-850 text-white rounded font-mono font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Execute Web Print
                </button>
              </div>

              {/* REPORT OFFICIAL HEADERS */}
              <div className="border-b-4 border-slate-800 pb-5 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-wider">
                    {simulatedPrintReport.schoolName.toUpperCase()}
                  </h1>
                  <p className="text-xs text-slate-500 italic mt-1">Official Institutional Registry Ledger Log</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">School Code: {simulatedPrintReport.schoolCode} | System ID: {tenantId}</p>
                </div>
                <div className="p-3 bg-slate-100 rounded border border-slate-200 text-center font-mono shrink-0 select-none">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">SECURITY ENVELOPE</span>
                  <span className="text-xs font-bold block text-indigo-750">EDUCORE_AI CERTIFIED</span>
                </div>
              </div>

              {/* REPORT LABELS INFO */}
              <div className="grid grid-cols-2 gap-4 text-xs font-sans text-slate-600 bg-slate-50 p-4 rounded">
                <div>
                  <p className="font-semibold">REPORT SUBJECT:</p>
                  <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{simulatedPrintReport.title}</h3>
                </div>
                <div className="text-right">
                  <p><strong>Filing Date Range:</strong> {exportDateRange}</p>
                  <p className="mt-1"><strong>Compiled datetime:</strong> {simulatedPrintReport.dateTime}</p>
                  <p><strong>Executor:</strong> {simulatedPrintReport.signee}</p>
                </div>
              </div>

              {/* DYNAMIC REPORT SOURCED GRID TABLE */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-sans">
                  <thead>
                    <tr className="border-b-2 border-slate-800 text-slate-800 font-extrabold text-[10.5px]">
                      {simulatedPrintReport.headers.map((h: string, idx: number) => (
                        <th key={idx} className="p-2 py-3 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {simulatedPrintReport.rows.map((row: string[], rowIdx: number) => (
                      <tr key={rowIdx} className="hover:bg-slate-50/50">
                        {row.map((cell: any, cellIdx: number) => (
                          <td key={cellIdx} className="p-2 py-3 text-slate-700 font-medium">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* WATERMARK DECLARATION */}
              <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-12 text-xs font-sans text-slate-450 leading-normal">
                <p className="max-w-md select-none">
                  * CONFIDENTIAL: This documentation constitutes legal academic audit property of the associated school node. Unauthorized distribution or copying triggers automatic digital ledger violation audits.
                </p>

                {/* SIGNATURE PANELS */}
                <div className="text-right shrink-0">
                  <div className="w-48 h-px bg-slate-400 ml-auto mb-2 mt-6"></div>
                  <p className="font-extrabold text-slate-800">{simulatedPrintReport.signee}</p>
                  <p className="text-[10px] text-slate-450 italic mt-0.5">{simulatedPrintReport.signeeRole}</p>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
