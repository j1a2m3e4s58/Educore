import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  Award, 
  Users, 
  Activity, 
  Bookmark, 
  ClipboardCheck, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  AlertTriangle, 
  Cpu, 
  Download, 
  Search, 
  Filter, 
  RefreshCw, 
  Clock, 
  Coins, 
  ShieldCheck, 
  ChevronRight, 
  Check, 
  X, 
  Trash2, 
  Edit,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  HelpCircle,
  Percent,
  Plus
} from 'lucide-react';
import { 
  User, 
  School, 
  LessonSummary, 
  QuestionBankItem, 
  AIMarkingResult, 
  StudentInsight, 
  AIUsageLog, 
  ExamQuestion,
  AIApprovalStatus
} from '../types';
import { 
  getLessonRecordsInStorage, 
  getTeachingMaterialsInStorage, 
  getAssignmentsInStorage, 
  getClassesInStorage, 
  getSubjectsInStorage, 
  getStudentsInStorage, 
  getAttendanceRecordsInStorage,
  getTeachersInStorage,
  appendActivityLog
} from '../data/mockData';

interface AISuiteProps {
  user: User;
  currentTenant: School;
}

const QUESTION_BANK_KEY = 'educore_ai_question_bank';
const USAGE_LOGS_KEY = 'educore_ai_usage_history';
const SYSTEM_MARKING_RESULTS_KEY = 'educore_ai_marking_results';

export default function AISuite({ user, currentTenant }: AISuiteProps) {
  const tenantId = currentTenant.id;
  const isSchoolHead = user.role === 'SchoolAdmin';

  // Sub-tabs inside Stage 5 AI Suite
  type AISubTab = 'assistant' | 'summarizer' | 'exam-gen' | 'question-bank' | 'marking-asst' | 'student-insights' | 'usage-logs';
  const [activeSubTab, setActiveSubTab] = useState<AISubTab>('assistant');

  // Master Lists synced from localStorage
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);
  const [usageLogs, setUsageLogs] = useState<AIUsageLog[]>([]);
  const [markingResults, setMarkingResults] = useState<AIMarkingResult[]>([]);

  // Original databases
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  // Toast UI feedback alerts
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Loading state
  const [generating, setGenerating] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  // 1. AI Assistant variables
  const [assistantPrompt, setAssistantPrompt] = useState('');
  const [assistantChatHistory, setAssistantChatHistory] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: `Hello ${user.name}! I am your dedicated EduCore AI Academic Assistant safely isolated within the storage boundaries of ${currentTenant.name}. I have indexed your school's current files. How may I assist you with records, lessons, or guidelines today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // 2. AI Summarizer variables
  const [sumClass, setSumClass] = useState('');
  const [sumSubject, setSumSubject] = useState('');
  const [sumTopic, setSumTopic] = useState('');
  const [sumWeek, setSumWeek] = useState('Week 4');
  const [generatedSummary, setGeneratedSummary] = useState<LessonSummary | null>(null);

  // 3. AI Exam Generator variables
  const [examClass, setExamClass] = useState('');
  const [examSubject, setExamSubject] = useState('');
  const [examTopic, setExamTopic] = useState('');
  const [examDifficulty, setExamDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [examNumQuestions, setExamNumQuestions] = useState(5);
  const [examDuration, setExamDuration] = useState(45);
  const [examTerm, setExamTerm] = useState('Term 2');
  const [examType, setExamType] = useState<'Objective' | 'Theory'>('Objective');
  const [examScope, setExamScope] = useState('Regular Quiz'); // Quiz, test, exam etc
  const [generatedQuestions, setGeneratedQuestions] = useState<ExamQuestion[]>([]);

  // 4. Question Bank Filters
  const [qBankClassFilter, setQBankClassFilter] = useState('');
  const [qBankSubjectFilter, setQBankSubjectFilter] = useState('');
  const [qBankSearch, setQBankSearch] = useState('');
  const [qBankStatusFilter, setQBankStatusFilter] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuestionBankItem | null>(null);

  // 5. AI Marking Assistant variables
  const [markingStudentId, setMarkingStudentId] = useState('');
  const [markingQuestionText, setMarkingQuestionText] = useState('Write an essay describing the key factors of the Industrial Revolution and its economic impacts.');
  const [markingStudentAnswer, setMarkingStudentAnswer] = useState('');
  const [markingRubric, setMarkingRubric] = useState('Content: 5 marks, Clarity: 3 marks, Grammar & Syntax: 2 marks');
  const [activeMarkingResult, setActiveMarkingResult] = useState<AIMarkingResult | null>(null);

  // 6. Student Insights Variables & Filters
  const [insightClassFilter, setInsightClassFilter] = useState('');
  const [insightRiskFilter, setInsightRiskFilter] = useState('');
  const [selectedInsightStudent, setSelectedInsightStudent] = useState<StudentInsight | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync / Initialize databases
  const reloadData = () => {
    const lLessons = getLessonRecordsInStorage(tenantId);
    const lMaterials = getTeachingMaterialsInStorage(tenantId);
    const lAssignments = getAssignmentsInStorage(tenantId);
    const lClasses = getClassesInStorage(tenantId);
    const lSubjects = getSubjectsInStorage(tenantId);
    const lStudents = getStudentsInStorage(tenantId);
    const lAttendance = getAttendanceRecordsInStorage(tenantId);

    setLessons(lLessons);
    setMaterials(lMaterials);
    setAssignments(lAssignments);
    setClasses(lClasses);
    setSubjects(lSubjects);
    setStudents(lStudents);
    setAttendance(lAttendance);

    // Initial default filters
    if (lClasses.length > 0 && !sumClass) setSumClass(lClasses[0].id);
    if (lSubjects.length > 0 && !sumSubject) setSumSubject(lSubjects[0].id);
    if (lClasses.length > 0 && !examClass) setExamClass(lClasses[0].id);
    if (lSubjects.length > 0 && !examSubject) setExamSubject(lSubjects[0].id);
    if (lStudents.length > 0 && !markingStudentId) setMarkingStudentId(lStudents[0].id);

    // Question bank sync
    const bankRaw = localStorage.getItem(QUESTION_BANK_KEY);
    if (bankRaw) {
      try {
        const parsed = JSON.parse(bankRaw);
        setQuestionBank(parsed.filter((item: any) => item.tenantId === tenantId));
      } catch (e) {
        setQuestionBank([]);
      }
    } else {
      // Seed default questions if empty to make the interface beautiful initially
      const mockSeeded: QuestionBankItem[] = [
        {
          id: 'q_seed_1',
          tenantId,
          classId: lClasses[0]?.id || 'cls_1',
          className: lClasses[0]?.name || 'Grade 10',
          subjectId: lSubjects[0]?.id || 'subj_math',
          subjectName: lSubjects[0]?.name || 'Mathematics',
          topic: 'Quadratic Equations',
          term: 'Term 2',
          difficulty: 'Medium',
          questionType: 'Objective',
          question: {
            id: 'qi_1',
            type: 'Objective',
            questionText: 'Find the roots of the quadratic equation x² - 5x + 6 = 0.',
            objectiveOptions: ['x = 1, 6', 'x = 2, 3', 'x = -2, -3', 'x = 5, 6'],
            correctAnswer: 'x = 2, 3',
            topic: 'Quadratic Equations',
            difficulty: 'Medium',
            marks: 3
          },
          status: 'Approved',
          createdById: 'tch_seed',
          createdBy: 'Mr. Johnathan Cole',
          createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
        },
        {
          id: 'q_seed_2',
          tenantId,
          classId: lClasses[0]?.id || 'cls_1',
          className: lClasses[0]?.name || 'Grade 10',
          subjectId: lSubjects[1]?.id || 'subj_science',
          subjectName: lSubjects[1]?.name || 'Science',
          topic: 'Cell Biology',
          term: 'Term 2',
          difficulty: 'Hard',
          questionType: 'Theory',
          question: {
            id: 'qi_2',
            type: 'Theory',
            questionText: 'Explain the function of the Mitochondria in eukaryotic cells and describe aerobic cellular respiration.',
            correctAnswer: 'The mitochondria is the clubhouse of energy, producing ATP through oxidative phosphorylation.',
            topic: 'Cell Biology',
            difficulty: 'Hard',
            marks: 10,
            markingGuide: 'Award 4 marks for detailing mitochondria powerhouse, 4 marks for ATP production references, and 2 marks for organic oxygen coupling.'
          },
          status: 'Pending Review',
          createdById: 'tch_seed',
          createdBy: 'Mr. Johnathan Cole',
          createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ];
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(mockSeeded));
      setQuestionBank(mockSeeded);
    }

    // AI Usage synchronization
    const logsRaw = localStorage.getItem(USAGE_LOGS_KEY);
    if (logsRaw) {
      try {
        const parsedLogs = JSON.parse(logsRaw);
        setUsageLogs(parsedLogs.filter((l: any) => l.tenantId === tenantId));
      } catch (e) {
        setUsageLogs([]);
      }
    } else {
      // Seed default usage log
      const defaultLogs: AIUsageLog[] = [
        {
          id: `log_seed_1`,
          tenantId,
          userId: user.id || 'usr_seed',
          userName: user.name || 'Staff Member',
          userRole: isSchoolHead ? 'SchoolAdmin' : 'Teacher',
          module: 'AI Academic Assistant',
          promptType: 'Curriculum Grounded Q&A',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          generatedTitle: 'Safety Audit Grounding Check',
          charCountGenerated: 420
        }
      ];
      localStorage.setItem(USAGE_LOGS_KEY, JSON.stringify(defaultLogs));
      setUsageLogs(defaultLogs);
    }

    // AI Marking Results sync
    const resultsRaw = localStorage.getItem(SYSTEM_MARKING_RESULTS_KEY);
    if (resultsRaw) {
      try {
        setMarkingResults(JSON.parse(resultsRaw).filter((r: any) => r.tenantId === tenantId));
      } catch (e) {}
    }
  };

  useEffect(() => {
    reloadData();
  }, [tenantId]);

  // Maps helpers
  const classesMap = React.useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
  const subjectsMap = React.useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

  // AI Usage tier limits check
  const subscriptionLimit = React.useMemo(() => {
    // Current tier can be found on currentTenant
    const tier = currentTenant.subscriptionPackage || 'Basic';
    switch (tier) {
      case 'Enterprise': return { limit: 10000, label: 'Enterprise Unlocked', value: 'Unlimited Access' };
      case 'Premium': return { limit: 1000, label: 'Premium Tier', value: '1,000 cycles/month' };
      case 'Standard': return { limit: 500, label: 'Standard Tier', value: '500 cycles/month' };
      default: return { limit: 100, label: 'Basic Sandbox Tier', value: '100 cycles/month' };
    }
  }, [currentTenant]);

  const currentUsageCount = usageLogs.length;
  const isLimitReached = currentUsageCount >= subscriptionLimit.limit;

  const logAIUsage = (module: string, promptType: string, generatedTitle: string, charCount: number) => {
    try {
      const logsRaw = localStorage.getItem(USAGE_LOGS_KEY);
      const allLogs: AIUsageLog[] = logsRaw ? JSON.parse(logsRaw) : [];

      const newLog: AIUsageLog = {
        id: `usage_${Date.now()}`,
        tenantId,
        userId: user.id || 'unknown_usr',
        userName: user.name || 'Faculty User',
        userRole: user.role === 'Teacher' ? 'Teacher' : 'SchoolAdmin',
        module,
        classId: sumClass,
        className: classesMap.get(sumClass) || 'N/A',
        subjectId: sumSubject,
        subjectName: subjectsMap.get(sumSubject) || 'N/A',
        promptType,
        timestamp: new Date().toISOString(),
        generatedTitle,
        charCountGenerated: charCount
      };

      allLogs.push(newLog);
      localStorage.setItem(USAGE_LOGS_KEY, JSON.stringify(allLogs));
      setUsageLogs(allLogs.filter(l => l.tenantId === tenantId));
    } catch (e) {
      console.error(e);
    }
  };

  // 1. DYNAMIC CONTEXTUAL GROUNDING CONTEXT GENERATOR
  // Compiles actual school data for chatbot ground response check
  const compileSchoolGroundingContext = () => {
    const totalLessonsCount = lessons.length;
    const totalAssignmentsCount = assignments.length;
    const totalStudentsCount = students.length;
    const totalMaterialsCount = materials.length;
    
    let listOftaught = lessons.slice(0, 5).map(l => `"${l.topicTaught}" taught in ${classesMap.get(l.classId)} by ${l.teacherName}`).join(', ');
    let listOfMats = materials.slice(0, 4).map(m => `"${m.title}" (${m.category})`).join(', ');

    return `
      Tenant Isolation Shield: Active. Owner Node: ${currentTenant.name} (${currentTenant.code}).
      Academic Database Grounding Context:
      - Active Cohorts: ${classes.length} classes enrolled.
      - Registered Pupils: ${totalStudentsCount} student profiles.
      - Pedagogical Lesson Entries: ${totalLessonsCount} standard records. Key topics: ${listOftaught || 'None logged yet'}.
      - Homework Bulletin: ${totalAssignmentsCount} assignments created.
      - Teaching Materials Uploaded: ${totalMaterialsCount} resources indexed. Key files: ${listOfMats || 'None uploaded yet'}.
      Secure directive: The response must relate ONLY to these metrics. If asked about facts not logically inferred from this, declare context boundaries. No details from other schools should be exposed.
    `;
  };

  // AI Chat execution
  const executeChatStream = () => {
    if (!assistantPrompt.trim()) return;
    if (isLimitReached) {
      triggerToast('AI sandbox generation limits exceeded for your current tier budget.', 'error');
      return;
    }

    const userInput = assistantPrompt;
    setAssistantPrompt('');
    
    const userMsg = {
      sender: 'user' as const,
      text: userInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setAssistantChatHistory(prev => [...prev, userMsg]);
    setGenerating(true);

    setTimeout(() => {
      // Core processing & semantic response engine
      const query = userInput.toLowerCase();
      let reply = `Based on the isolated school database for ${currentTenant.name}, `;

      if (query.includes('lesson') || query.includes('teach') || query.includes('topic')) {
        if (lessons.length > 0) {
          reply += `I have matched ${lessons.length} digital lesson log entries. Notable taught sequences include: ${lessons.slice(0, 3).map(l => l.topicTaught).join(', ')}. These records are fully compliant with curriculum framework requirements.`;
        } else {
          reply += `no lesson records have been logged in the portal yet. Teachers can register lesson progress in the Daily Lesson Records tab.`;
        }
      } else if (query.includes('student') || query.includes('pupil') || query.includes('attendance')) {
        reply += `there are currently ${students.length} students enrolled. The combined student roll call rate matches healthy compliance averages at some ~93.4%. No active repeated absenteeism flags have compromised semester goals.`;
      } else if (query.includes('material') || query.includes('resource') || query.includes('file')) {
        if (materials.length > 0) {
          reply += `the library vault holds ${materials.length} approved academic publications. Sourced elements: ${materials.slice(0, 3).map(m => m.title).join(', ')}. These items are restricted for shared teaching use.`;
        } else {
          reply += `no custom study guides or resources have been uploaded to the shared folder.`;
        }
      } else if (query.includes('assignment') || query.includes('homework')) {
        if (assignments.length > 0) {
          reply += `the faculty has initialized ${assignments.length} assignments. Active homework topics include: ${assignments.slice(0, 3).map(a => a.topic).join(', ')}. Submission rate yields 88.5% status.`;
        } else {
          reply += `there are no ongoing homework assignments awaiting pupil grading at this hour.`;
        }
      } else {
        reply += `I am analyzing your core query. This institution operates with ${classes.length} registered classes and ${getTeachersInStorage(tenantId).length} faculty staff on duty. All stored objects remain shielded under enterprise row-level data security keys. Is there a specific class coverage or syllabus summary you would like me to compile?`;
      }

      const aiMsg = {
        sender: 'ai' as const,
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setAssistantChatHistory(prev => [...prev, aiMsg]);
      setGenerating(false);
      
      // Log usage
      logAIUsage('AI Academic Assistant', 'Curriculum Grounded Q&A', `Query: ${userInput.substring(0, 25)}...`, reply.length);
    }, 1200);
  };

  // Preset prompts chips
  const assistantPresets = [
    'How many lesson records were completed in' + (classes[0]?.name ? ` ${classes[0].name}?` : ' our cohort?'),
    'Synthesize a student compliance risk summary.',
    'Are there any pending assignments with low marking rates?'
  ];

  // 2. LESSON SUMMARIZER EXECUTION
  const generateLessonSummary = () => {
    if (isLimitReached) {
      triggerToast('AI sandbox generation limits exceeded for your current tier budget.', 'error');
      return;
    }

    setGenerating(true);
    setProgressMsg('Gathering syllabus files and class lesson records for compilation...');

    setTimeout(() => {
      setProgressMsg('Evaluating completed topics taught, homework briefs, and teacher logs...');
      setTimeout(() => {
        // Resolve selected class and subject
        const selectedClsObj = classes.find(c => c.id === sumClass);
        const selectedSubObj = subjects.find(s => s.id === sumSubject);

        const className = selectedClsObj?.name || 'Class Cohort';
        const subjectName = selectedSubObj?.name || 'Academic Course';
        const topic = sumTopic.trim() || 'Fundamental Course Overview';

        const mockSummary: LessonSummary = {
          id: `sum_${Date.now()}`,
          tenantId,
          classId: sumClass,
          className,
          subjectId: sumSubject,
          subjectName,
          topic,
          week: sumWeek,
          term: 'Term 2',
          keyPoints: [
            `Comprehensive introduction to the core principles of ${topic}.`,
            'Analyzing structural frameworks and real-world implications.',
            'Step-by-step methodologies to resolve analytical patterns.',
            'Best-practice guidelines for academic formulation.'
          ],
          learningObjectives: [
            `Understand the underlying mechanisms governing ${topic}.`,
            'Articulate formulas or logical constructs independently.',
            'Apply parameters to practical exercises with 90% accuracy.'
          ],
          importantDefinitions: [
            { term: 'Primary Parameter', definition: 'The dominant architectural element evaluated under active testing' },
            { term: 'Null Condition', definition: 'A state describing zero structural changes or variables within the ecosystem' },
            { term: 'Variable Catalyst', definition: 'The independent component introduced to prompt systemic equations' }
          ],
          examples: [
            'Standard Equation Model: Resolving x² factors under clean integer values.',
            'Visual mapping of baseline components before applying the final calculation.'
          ],
          teacherActivities: [
            `Lead conceptual lecture on the origin and framework of ${topic}.`,
            'Demonstrate complex multi-step problems on the board.',
            'Facilitate interactive polling query session to check understanding.'
          ],
          studentActivities: [
            'Take structured cornell-style notes in official journals.',
            'Collaborate in peer dyads to perform practical baseline tests.',
            'Present resolved group formulas to the class.'
          ],
          homeworkGiven: `Complete Practice Problems 1 through 10 in Chapter 4 of the official ${subjectName} handbook. Submit before Monday's second cycle.`,
          revisionAreas: [
            'Consolidating rapid division quotients or initial formula statements.',
            'Correcting basic sign errors or misinterpretations of structural variables.'
          ],
          generatedAt: new Date().toISOString()
        };

        setGeneratedSummary(mockSummary);
        setGenerating(false);

        // Usage logging
        logAIUsage('AI Lesson Summarizer', 'Lesson Record Compilation', `Summary: ${topic} (${className})`, 1200);
        appendActivityLog({
          tenantId,
          user: user.name,
          action: 'Lesson Summary Compiled',
          details: `Compiled automated AI lesson summary of "${topic}" for class ${className}.`,
          type: 'success'
        });
        triggerToast('AI Lesson Summary compiled successfully!', 'success');
      }, 1000);
    }, 1000);
  };

  // 3. EXAM GENERATOR EXECUTION
  const handleGenerateExam = () => {
    if (isLimitReached) {
      triggerToast('AI sandbox generation limits exceeded for your current tier budget.', 'error');
      return;
    }

    setGenerating(true);
    setProgressMsg('Analyzing curriculum scheme parameters and difficulty indicators...');

    setTimeout(() => {
      setProgressMsg('Drafting objective MCQs and building answer keys...');
      setTimeout(() => {
        const selectedClsObj = classes.find(c => c.id === examClass);
        const selectedSubObj = subjects.find(s => s.id === examSubject);
        const className = selectedClsObj?.name || 'Class Cohort';
        const subjectName = selectedSubObj?.name || 'Academic Course';
        const topic = examTopic.trim() || 'Comprehensive Curriculum Review';

        const outputQs: ExamQuestion[] = [];

        if (examType === 'Objective') {
          // Objective questions
          for (let i = 1; i <= examNumQuestions; i++) {
            const indexValue = (i % 4); // cycles correct values
            const options = [
              `Alternative choice representation limit Alpha`,
              `Correct mathematical resolved matrix for ${topic}`,
              `Erroneous secondary hypothetical coordinate`,
              `Alternative system placeholder Beta`
            ];
            // swap correct answer corresponding to index
            if (indexValue !== 1) {
              const temp = options[1];
              options[1] = options[indexValue];
              options[indexValue] = temp;
            }

            outputQs.push({
              id: `q_gen_${Date.now()}_${i}`,
              type: 'Objective',
              questionText: `Question ${i}: Which of the following statements best describes the principal framework of ${topic} when evaluated in ${subjectName}?`,
              objectiveOptions: options,
              correctAnswer: options[indexValue],
              topic,
              difficulty: examDifficulty,
              marks: Math.round(50 / examNumQuestions)
            });
          }
        } else {
          // Theory Section B questions
          for (let i = 1; i <= Math.min(examNumQuestions, 3); i++) {
            outputQs.push({
              id: `q_gen_${Date.now()}_${i}`,
              type: 'Theory',
              questionText: `Theory Prompt ${i}: Articulate the primary methodologies applied to resolve issues in "${topic}". Contrast current theoretical models with modern experimental practices.`,
              correctAnswer: `Expected answer should reference core historical parameters, explain at least 2 distinct paradigms of "${topic}", and conclude on modern application advantages.`,
              topic,
              difficulty: examDifficulty,
              marks: 10,
              markingGuide: `Award 4 marks for methodological accuracy, 3 marks for distinct comparative paradigms, and 3 marks for writing style and clear logical format.`
            });
          }
        }

        setGeneratedQuestions(outputQs);
        setGenerating(false);

        logAIUsage('AI Exam Generator', `Assessment Wizard (${examScope})`, `${examScope}: ${topic} (${className})`, 1800);
        triggerToast(`Assessment exam questionnaire built successfully with ${outputQs.length} questions!`, 'success');
      }, 1000);
    }, 1000);
  };

  // Save generated questions to general Question Bank
  const handleSaveToQuestionBank = () => {
    if (generatedQuestions.length === 0) return;

    try {
      const selectedClsObj = classes.find(c => c.id === examClass);
      const selectedSubObj = subjects.find(s => s.id === examSubject);
      const className = selectedClsObj?.name || 'Class Cohort';
      const subjectName = selectedSubObj?.name || 'Academic Course';
      const topic = examTopic.trim() || 'Comprehensive Curriculum Review';

      const bankRaw = localStorage.getItem(QUESTION_BANK_KEY);
      const currentBank: QuestionBankItem[] = bankRaw ? JSON.parse(bankRaw) : [];

      const newItems: QuestionBankItem[] = generatedQuestions.map((q, idx) => ({
        id: `q_bank_${Date.now()}_${idx}`,
        tenantId,
        classId: examClass,
        className,
        subjectId: examSubject,
        subjectName,
        topic,
        term: examTerm,
        difficulty: examDifficulty,
        questionType: q.type,
        question: q,
        status: isSchoolHead ? 'Approved' : 'Draft', // Teachers save Drafts, Heads approve
        createdById: user.id || 'usr_node',
        createdBy: user.name || 'Faculty Member',
        createdAt: new Date().toISOString()
      }));

      const updatedBank = [...currentBank, ...newItems];
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(updatedBank));
      setQuestionBank(updatedBank.filter(item => item.tenantId === tenantId));

      triggerToast(`Saved ${receivedItemsCount(newItems)} questions to institutional Question Bank as ${isSchoolHead ? 'Approved' : 'Drafts'}.`, 'success');
      
      // Clear current generation list
      setGeneratedQuestions([]);
    } catch (e) {
      console.error(e);
      triggerToast('Unable to persist questions to general repository.', 'error');
    }
  };

  const receivedItemsCount = (arr: any[]) => arr.length;

  // 4. QUESTION BANK MULTI-ROLE INTERACTIONS
  const handleModifyStatus = (questionId: string, newStatus: AIApprovalStatus) => {
    try {
      const bankRaw = localStorage.getItem(QUESTION_BANK_KEY);
      if (!bankRaw) return;

      const fullList: QuestionBankItem[] = JSON.parse(bankRaw);
      const updated = fullList.map(item => {
        if (item.id === questionId) {
          return { ...item, status: newStatus };
        }
        return item;
      });

      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(updated));
      setQuestionBank(updated.filter(item => item.tenantId === tenantId));
      triggerToast(`Question status updated to "${newStatus}" successfully.`, 'success');

      appendActivityLog({
        tenantId,
        user: user.name,
        action: 'Question Bank Status Changed',
        details: `Updated state of exam question ID ${questionId} to: ${newStatus}.`,
        type: 'info'
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveQuestion = (questionId: string) => {
    try {
      const bankRaw = localStorage.getItem(QUESTION_BANK_KEY);
      if (!bankRaw) return;

      const fullList: QuestionBankItem[] = JSON.parse(bankRaw);
      const filtered = fullList.filter(item => item.id !== questionId);
      localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(filtered));
      setQuestionBank(filtered.filter(item => item.tenantId === tenantId));
      triggerToast('Question deleted from school bank.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  // Filtered Question Bank
  const filteredQuestionBank = React.useMemo(() => {
    return questionBank.filter(item => {
      const matClass = qBankClassFilter ? item.classId === qBankClassFilter : true;
      const matSub = qBankSubjectFilter ? item.subjectId === qBankSubjectFilter : true;
      const matStatus = qBankStatusFilter ? item.status === qBankStatusFilter : true;
      
      const text = qBankSearch.toLowerCase();
      const matSearch = text 
        ? item.topic.toLowerCase().includes(text) || 
          item.question.questionText.toLowerCase().includes(text) ||
          item.createdBy.toLowerCase().includes(text)
        : true;

      return matClass && matSub && matStatus && matSearch;
    });
  }, [questionBank, qBankClassFilter, qBankSubjectFilter, qBankStatusFilter, qBankSearch]);

  // 5. AI MARKING ASSISTANT
  const handleMarkStudentPaper = () => {
    if (!markingStudentAnswer.trim()) {
      triggerToast('Please provide the student’s drafted answer first.', 'error');
      return;
    }
    if (isLimitReached) {
      triggerToast('AI sandbox generation limits exceeded for your current tier budget.', 'error');
      return;
    }

    setGenerating(true);
    setProgressMsg('Scanning student text syntax and checking expected keywords...');

    setTimeout(() => {
      setProgressMsg('Aligning writing prompts with educational grading rubrics...');
      setTimeout(() => {
        const studentObj = students.find(s => s.id === markingStudentId);
        const studentName = studentObj?.fullName || 'Selected Pupil';

        // Extracting max score from rubric text roughly or defaulting
        let calculatedScore = 7;
        let maxScore = 10;
        if (markingRubric.includes('Content: 5')) {
          maxScore = 10;
          calculatedScore = markingStudentAnswer.length > 200 ? 8 : 6;
        } else {
          maxScore = 20;
          calculatedScore = markingStudentAnswer.length > 300 ? 16 : 11;
        }

        const result: AIMarkingResult = {
          id: `mark_${Date.now()}`,
          tenantId,
          studentId: markingStudentId,
          studentName,
          questionText: markingQuestionText,
          studentAnswer: markingStudentAnswer,
          suggestedScore: calculatedScore,
          maxScore,
          corrections: [
            'Revise capitalization checks in the introductory paragraph.',
            'Improve transition flow when contrasting empirical models.'
          ],
          feedback: 'The student demonstrated a strong grasp of the fundamental definitions and structural concepts. However, the explanation of the independent variable catalysts was thin.',
          improvementComments: 'Encourage secondary study cycles centered on applied formulas. Peer-to-peer quizzes may optimize synthesis speeds.',
          isApprovedByTeacher: false,
          markedAt: new Date().toISOString()
        };

        setActiveMarkingResult(result);
        setGenerating(false);

        logAIUsage('AI Marking Assistant', 'Interactive Paper Grading', `Marking: ${studentName}`, 950);
        triggerToast('Grading assistant suggestions generated! Teacher review required.', 'info');
      }, 1000);
    }, 1000);
  };

  const handleApproveFinalMark = () => {
    if (!activeMarkingResult) return;

    try {
      const resultsRaw = localStorage.getItem(SYSTEM_MARKING_RESULTS_KEY);
      const currentList: AIMarkingResult[] = resultsRaw ? JSON.parse(resultsRaw) : [];

      const approvedResult = { ...activeMarkingResult, isApprovedByTeacher: true };
      currentList.push(approvedResult);

      localStorage.setItem(SYSTEM_MARKING_RESULTS_KEY, JSON.stringify(currentList));
      setMarkingResults(currentList.filter(r => r.tenantId === tenantId));

      appendActivityLog({
        tenantId,
        user: user.name,
        action: 'AI Grading Finalized',
        details: `Finalized and approved grading score of ${approvedResult.suggestedScore}/${approvedResult.maxScore} for student ${approvedResult.studentName}.`,
        type: 'success'
      });

      triggerToast('AI marking approved! Scores officially recorded in the class roster.', 'success');

      // Clear layout
      setActiveMarkingResult(null);
      setMarkingStudentAnswer('');
    } catch (e) {
      console.error(e);
    }
  };

  // 6. STUDENT INSIGHTS PROCESSOR
  const computedStudentInsights = React.useMemo(() => {
    return students.map((std, idx) => {
      // Analyze attendance records of this student
      let totalAttClasses = 0;
      let presentAttClasses = 0;
      
      attendance.forEach(rec => {
        const item = rec.items.find((i: any) => i.studentId === std.id);
        if (item) {
          totalAttClasses++;
          if (item.status === 'Present' || item.status === 'Late' || item.status === 'Excused') {
            presentAttClasses++;
          }
        }
      });

      const attRate = totalAttClasses > 0 ? Math.round((presentAttClasses / totalAttClasses) * 100) : (94 - (idx % 3) * 6);
      
      // Assignments compiled
      const assignmentsSubmitted = 4 - (idx % 3);
      const assignmentsOverdue = idx % 3 === 2 ? 1 : 0;

      // Risk level heuristic
      let riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk' = 'Low Risk';
      if (attRate < 80 || assignmentsOverdue > 0) {
        riskLevel = 'High Risk';
      } else if (attRate < 90 || assignmentsSubmitted < 3) {
        riskLevel = 'Medium Risk';
      }

      const weaknesses = idx % 2 === 0
        ? ['Speed of calculations in exams', 'Initial baseline formula structural layout']
        : ['Consistent study habits', 'Participation scores during dyads activities'];

      const strengths = idx % 2 === 0
        ? ['Active listening', 'Detailed standard homework entries']
        : ['Analytical methodology speed', 'Abstract concept mapping'];

      const interventions = riskLevel === 'High Risk'
        ? ['Schedule mandatory extra-help session with course representative.', 'Issue parent-teacher diagnostic meeting request.']
        : riskLevel === 'Medium Risk'
          ? ['Provide secondary worksheets targeting abstract calculation loops.', 'Assign peer-study dyad partner.']
          : ['Enroll in accelerated mentorship cohort.', 'Prepare advanced enrichment challenges.'];

      return {
        id: `ins_${std.id}`,
        tenantId,
        studentId: std.id,
        studentName: std.fullName || std.name || 'Enrolled Student',
        gradeClass: classesMap.get(std.classId || std.gradeClass) || 'Cohort Grade',
        attendanceRate: attRate,
        assignmentsSubmittedCount: assignmentsSubmitted,
        assignmentsOverdueCount: assignmentsOverdue,
        participationScore: 8 - (idx % 3) * 2,
        academicPerformanceAverage: 82 - (idx % 4) * 8,
        riskLevel,
        weaknesses,
        strengths,
        recommendedInterventions: interventions,
        overallComments: `This student shows ${riskLevel === 'Low Risk' ? 'pristine academic progression' : 'noticeable performance bottlenecks'} during the current evaluation window. Attendance tracks at ${attRate}%.`
      } as StudentInsight;
    }).filter(ins => {
      const matchClass = insightClassFilter ? ins.gradeClass.toLowerCase().includes(insightClassFilter.toLowerCase()) : true;
      const matchRisk = insightRiskFilter ? ins.riskLevel === insightRiskFilter : true;
      return matchClass && matchRisk;
    });
  }, [students, attendance, insightClassFilter, insightRiskFilter, classesMap]);


  return (
    <div className="space-y-6">
      
      {/* BRAND HEADER COMMAND UNIT */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-[#0A1E330D]/5 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-700" /> STAGE 5 INTELLIGENCE HUB
            </span>
            <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
            <span className="text-[10px] text-slate-400 font-mono font-bold uppercase select-none">
              PRIVATE SANDBOX ACTS SECURELY
            </span>
          </div>
          <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight flex items-center gap-2">
            EduCore AI Academic Engine
          </h1>
          <p className="text-xs text-slate-500">
            Automated syllabus summaries, test drafts, peer evaluation support, student behavioral diagnostics, and usage checks for <span className="font-semibold text-slate-700">{currentTenant.name}</span>.
          </p>
        </div>

        {/* AI SUBSCRIPTION TRACKER */}
        <div className="bg-slate-50 border border-slate-200 rounded p-3 min-w-[200px] text-xs space-y-2">
          <div className="flex justify-between items-center font-mono font-bold">
            <span className="text-slate-400 text-[9px] uppercase">Subs Tier</span>
            <span className="text-indigo-800 uppercase text-[10px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{currentTenant.subscriptionPackage || 'Basic'}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-baseline text-[10px] font-mono leading-none">
              <span className="text-slate-500 font-bold">AI CYCLES SPENT</span>
              <span className="text-slate-900 font-bold">{currentUsageCount} / {subscriptionLimit.limit}</span>
            </div>
            <div className="h-1.5 bg-slate-150 rounded overflow-hidden">
              <div 
                className={`h-full rounded ${isLimitReached ? 'bg-rose-500 animate-pulse' : 'bg-indigo-600'}`} 
                style={{ width: `${Math.min(100, (currentUsageCount / subscriptionLimit.limit) * 100)}%` }}
              ></div>
            </div>
            <p className="text-[9px] text-[#A3AED0] font-medium leading-none mt-1">Limits reallocate every academic quarter calendar.</p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 bg-[#EDFDF5] border border-emerald-250 text-emerald-950 text-xs rounded flex items-center gap-3 animate-in fade-in duration-100 font-sans shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">INTELLIGENT_ENGINE_ALIGNED</p>
            <p className="text-slate-600 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {/* HORIZONTAL SECONDARY TABS VIEW SELECTOR */}
      <div className="flex bg-slate-150/40 p-1 rounded border border-slate-200 overflow-x-auto whitespace-nowrap scrollbar-hide gap-1">
        {[
          { id: 'assistant', label: 'Academic Assistant', icon: MessageSquare },
          { id: 'summarizer', label: 'Lesson Summarizer', icon: BookOpen },
          { id: 'exam-gen', label: 'Assessment Gen', icon: FileText },
          { id: 'question-bank', label: 'Question Bank', icon: Bookmark, badge: questionBank.length || null },
          { id: 'marking-asst', label: 'Marking Assistant', icon: Award },
          { id: 'student-insights', label: 'Student Insights', icon: Users },
          { id: 'usage-logs', label: 'Usage & Audits', icon: Activity, hidden: !isSchoolHead }
        ].map(tab => {
          if (tab.hidden) return null;
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-3 py-2 text-xs font-semibold rounded cursor-pointer transition-all flex items-center gap-1.5 ${
                isActive 
                  ? 'bg-indigo-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-indigo-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              {tab.label}
              {tab.badge !== undefined && tab.badge !== null && (
                <span className={`text-[9px] px-1.5 py-0.1 font-mono font-bold rounded-full ${isActive ? 'bg-[#1A56DB] text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* CORE RENDER SPACES */}

      {/* GENERATIVE LOADER OVERLAY */}
      {generating && (
        <div className="p-8 bg-indigo-50/50 border border-indigo-150 rounded text-center space-y-3 animate-pulse">
          <Cpu className="w-10 h-10 text-indigo-700 mx-auto animate-spin" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-indigo-900 font-mono uppercase tracking-wider">EDUCORE_SYNAPSE_PROCESSING</p>
            <p className="text-xs text-slate-600 font-medium">{progressMsg || 'Synthesizing queries with private datasets...'}</p>
          </div>
          <div className="max-w-xs mx-auto h-1.5 bg-slate-200 rounded overflow-hidden">
            <div className="h-full bg-indigo-600 rounded animate-infinite-loading"></div>
          </div>
        </div>
      )}

      {/* TAB 1: AI ACADEMIC ASSISTANT CHAT PANEL */}
      {activeSubTab === 'assistant' && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* SYSTEM SIDEBAR AUDIT NOTICE CARD */}
          <div className="lg:col-span-1 bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs space-y-4">
            <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded font-mono font-bold">SECURITY NOTICE</span>
            
            <div className="space-y-2 text-xs">
              <h3 className="font-extrabold text-slate-900">Row-Isolated Data Grounding</h3>
              <p className="text-slate-500 leading-normal">
                This academic assistant operates in a multi-tenant sandbox. The model resolves queries based only on files, syllabus guidelines, lesson registers, and student lists logged inside:
              </p>
              <div className="p-2 bg-slate-50 border border-slate-100 rounded text-[10px] font-mono select-all">
                OWNER_ID: {tenantId} <br/>
                SCOPE: {currentTenant.code === 'CENTRAL_CREST' ? 'Enterprise Core' : 'Independent Node'}
              </div>
            </div>

            <span className="w-full h-px bg-slate-100 block"></span>

            <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded flex gap-2.5 text-[11px] text-amber-900 leading-normal">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Staff Review Required:</span> AI answers are generated from cached academic tables. Verify parameters before making core structural decisions.
              </div>
            </div>
          </div>

          {/* CHAT INTERACTIVE WINDOW */}
          <div className="lg:col-span-3 bg-white rounded border border-[#E2E8F0] shadow-sm flex flex-col h-[500px]">
            <div className="p-4 border-b border-[#E2E8F0] bg-slate-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-bold font-mono text-[#0A1E33] uppercase">AI Assistant Interface - Grounded</span>
              </div>
              <span className="text-[9px] text-[#A3AED0] font-mono">VERBOSITY: LOW_LATENCY</span>
            </div>

            {/* MESSAGE HISTORY */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {assistantChatHistory.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2 text-xs animate-in fade-in duration-200`}>
                  
                  {m.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-md bg-[#0A1E33] flex items-center justify-center shrink-0 font-bold text-white text-[10px] uppercase">
                      AI
                    </div>
                  )}

                  <div className={`p-4.5 rounded-lg max-w-[80%] leading-relaxed ${
                    m.sender === 'user' 
                      ? 'bg-indigo-900 text-white rounded-br-none' 
                      : 'bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-none'
                  }`}>
                    <p className="font-sans">{m.text}</p>
                    <span className={`text-[8px] font-mono uppercase block mt-1.5 ${m.sender === 'user' ? 'text-indigo-200 text-right' : 'text-slate-400'}`}>
                      {m.time} • SECURED_QUERY
                    </span>
                  </div>

                </div>
              ))}
            </div>

            {/* CHIPS SUGGESTED PROMPTS */}
            <div className="px-4 py-2 border-t border-slate-50 flex flex-wrap gap-2 overflow-x-auto whitespace-nowrap shrink-0">
              {assistantPresets.map((chip, i) => (
                <button
                  key={i}
                  onClick={() => setAssistantPrompt(chip)}
                  className="text-[10px] font-semibold text-indigo-700 bg-indigo-50/50 hover:bg-indigo-150/60 px-3 py-1 rounded-full border border-indigo-100 cursor-pointer shrink-0 transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* SEND PROMPT INPUT PANEL */}
            <div className="p-3 border-t border-[#E2E8F0] shrink-0 bg-slate-50/50 flex gap-2.5 items-center">
              <input
                type="text"
                placeholder={`Ask the assistant about ${currentTenant.name}'s statistics, files, or records...`}
                value={assistantPrompt}
                onChange={e => setAssistantPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && executeChatStream()}
                className="flex-1 bg-white border border-slate-205 rounded px-3.5 py-2 text-xs focus:outline-none focus:border-indigo-600 transition-colors"
              />
              <button
                onClick={executeChatStream}
                className="p-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded cursor-pointer transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: AI LESSON SUMMARIZER */}
      {activeSubTab === 'summarizer' && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* CONTROL GENERATOR DIALOG */}
          <div className="lg:col-span-1 bg-white p-5 rounded border border-[#E2E8F0] shadow-sm space-y-4 h-fit">
            <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-extrabold block">SUMMARIZATION CONTROL</span>
            
            <div className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Target Class Cohort</label>
                <select
                  value={sumClass}
                  onChange={e => setSumClass(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Subject File Field</label>
                <select
                  value={sumSubject}
                  onChange={e => setSumSubject(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Syllabus Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g., Intro to Algebra, Cell Biology"
                  value={sumTopic}
                  onChange={e => setSumTopic(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Academic Calendar Week</label>
                <select
                  value={sumWeek}
                  onChange={e => setSumWeek(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  {['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={generateLessonSummary}
                className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer mt-4 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" /> Compile Lesson Summary
              </button>

            </div>
          </div>

          {/* GENERATED SUMMARY DISPLAY CARD */}
          <div className="lg:col-span-2 space-y-4">
            
            {generatedSummary ? (
              <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in duration-300">
                
                {/* DISPLAY TITLE */}
                <div className="p-5 border-b border-[#E2E8F0] bg-slate-50/50 flex justify-between items-center">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
                      {generatedSummary.className} • {generatedSummary.subjectName} • {generatedSummary.week}
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-930 text-slate-900 font-display">
                      Syllabus Topic: {generatedSummary.topic}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      triggerToast('Syllabus summary catalog exported to local directory.', 'success');
                    }}
                    className="p-1.5 hover:bg-slate-200/65 border border-slate-200 rounded text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>

                {/* SUMMARY DETAILED CONTENTS */}
                <div className="p-6 space-y-5 text-xs text-slate-700">
                  
                  {/* METRIC CHIPS GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="p-4 rounded border border-[#E2E8F0] bg-slate-50 space-y-2">
                      <span className="text-[10px] font-mono text-indigo-700 font-bold block">LEARNING OBJECTIVES</span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-650">
                        {generatedSummary.learningObjectives.map((o, idx) => (
                          <li key={idx}>{o}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded border border-[#E2E8F0] bg-slate-50 space-y-2">
                      <span className="text-[10px] font-mono text-indigo-700 font-bold block">CLASS KEY DEFINITIONS</span>
                      <div className="space-y-2">
                        {generatedSummary.importantDefinitions.map((d, idx) => (
                          <div key={idx} className="text-[11px]">
                            <span className="font-extrabold text-slate-900 block">{d.term}:</span>
                            <span className="text-slate-500">{d.definition}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-indigo-900 font-bold block">CORE CONCEPTS TAUGHT</span>
                    <ol className="list-decimal pl-4 space-y-1.5 text-slate-600 font-sans lines-leading-comfortable">
                      {generatedSummary.keyPoints.map((k, idx) => (
                        <li key={idx}>{k}</li>
                      ))}
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-emerald-600 font-bold block">TEACHER ACTIVITIES</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        {generatedSummary.teacherActivities.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-emerald-600 font-bold block">STUDENT WORK ACTIVITIES</span>
                      <ul className="list-disc pl-4 space-y-1 text-slate-500">
                        {generatedSummary.studentActivities.map((a, idx) => (
                          <li key={idx}>{a}</li>
                        ))}
                      </ul>
                    </div>

                  </div>

                  <span className="w-full h-px bg-slate-100 block"></span>

                  <div className="p-3.5 bg-indigo-50 border border-indigo-100 rounded text-[11px] space-y-1">
                    <span className="font-extrabold text-indigo-950 font-mono block">HOMEWORK TASK ALLOCATED:</span>
                    <p className="text-indigo-900 font-medium italic">"{generatedSummary.homeworkGiven}"</p>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded border border-[#E2E8F0] shadow-sm text-slate-400 text-xs flex flex-col items-center gap-2">
                <BookOpen className="w-10 h-10 text-slate-300" />
                Select search parameters on the left and click "Compile Lesson Summary" to generate academic notes.
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 3: AI EXAM GENERATOR */}
      {activeSubTab === 'exam-gen' && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* STEP BY STEP QUESTION BUILDER WIZARD */}
          <div className="lg:col-span-1 bg-white p-5 rounded border border-[#E2E8F0] shadow-sm space-y-4">
            <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-extrabold block">ASSESSMENT GENERATIVE WIZARD</span>
            
            <div className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Assessment Scope Type</label>
                <select
                  value={examScope}
                  onChange={e => setExamScope(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none"
                >
                  <option value="Class Test Quiz">Interactive Classroom Quiz</option>
                  <option value="Mid-Term Diagnostic">Mid-Term Diagnostic Exam</option>
                  <option value="End-of-Term Finals">End-of-Term Final Assessment</option>
                  <option value="Weekly Homework Tasks">Weekly Homework Worksheet</option>
                  <option value="Remedial Study Exercises">Remedial Quiz Drill</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Class Cohort</label>
                  <select
                    value={examClass}
                    onChange={e => setExamClass(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  >
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Course Subject</label>
                  <select
                    value={examSubject}
                    onChange={e => setExamSubject(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  >
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block font-bold">Curriculum Topic of Focus</label>
                <input
                  type="text"
                  placeholder="e.g., Geometry Proofs, Cell Respiration"
                  value={examTopic}
                  onChange={e => setExamTopic(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Difficulty Level</label>
                  <select
                    value={examDifficulty}
                    onChange={e => setExamDifficulty(e.target.value as any)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Target Quarter</label>
                  <select
                    value={examTerm}
                    onChange={e => setExamTerm(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">No. Questions</label>
                  <input
                    type="number"
                    min={2}
                    max={15}
                    value={examNumQuestions}
                    onChange={e => setExamNumQuestions(parseInt(e.target.value) || 5)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Duration (min)</label>
                  <input
                    type="number"
                    min={10}
                    max={180}
                    value={examDuration}
                    onChange={e => setExamDuration(parseInt(e.target.value) || 45)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Question Pattern Format</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q_pattern" 
                      checked={examType === 'Objective'} 
                      onChange={() => setExamType('Objective')} 
                    />
                    Objective MCQs
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input 
                      type="radio" 
                      name="q_pattern" 
                      checked={examType === 'Theory'} 
                      onChange={() => setExamType('Theory')} 
                    />
                    Section B Theory
                  </label>
                </div>
              </div>

              <button
                onClick={handleGenerateExam}
                className="w-full py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold rounded flex items-center justify-center gap-1.5 cursor-pointer mt-3 transition-colors text-xs"
              >
                <Cpu className="w-3.5 h-3.5" /> Synthesize Exam Draft
              </button>

            </div>
          </div>

          {/* QUESTIONS LISTING AND SAVE MODULE */}
          <div className="lg:col-span-2 space-y-4">
            
            {generatedQuestions.length > 0 ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                
                {/* WIZARD ACTIONS BAR */}
                <div className="bg-[#051424] text-white p-4 rounded flex justify-between items-center shadow-md">
                  <div className="space-y-1">
                    <p className="text-[9px] font-mono font-bold text-[#A3AED0]">AUTOMATED LEDGER DRILL READY</p>
                    <p className="text-xs font-bold font-display">{examScope} • {generatedQuestions.length} Items Built</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setGeneratedQuestions([])}
                      className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs transition-all cursor-pointer font-extrabold"
                    >
                      Clear
                    </button>
                    <button
                      onClick={handleSaveToQuestionBank}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save to Question Bank
                    </button>
                  </div>
                </div>

                {/* ITERATED EDITABLE QUESTION CARDS */}
                {generatedQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-white p-5 rounded border border-[#E2E8F0] shadow-2xs space-y-3 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono font-bold text-indigo-700">QUESTION {idx + 1} ({q.difficulty} • {q.marks} Marks)</span>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-400 uppercase font-bold">{q.type}</span>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs font-bold text-slate-900 leading-normal">{q.questionText}</p>

                      {/* Options rendering for objectives */}
                      {q.objectiveOptions && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {q.objectiveOptions.map((opt, oIdx) => {
                            const isCorrect = opt === q.correctAnswer;
                            return (
                              <div key={oIdx} className={`p-2.5 rounded border text-[11px] font-medium flex items-center justify-between ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-150 text-slate-650'}`}>
                                <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                                {isCorrect && <Check className="w-4 h-4 text-emerald-600" />}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Theory marking rubric details */}
                      {q.markingGuide && (
                        <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded text-[11px] leading-relaxed">
                          <span className="font-extrabold text-indigo-950 font-mono block">SUGGESTED EXAM GRADING RUBRIC:</span>
                          <p className="text-slate-600 mt-1">{q.markingGuide}</p>
                          <span className="text-indigo-800 font-extrabold block mt-2">Correct Answer Anchor: <span className="text-slate-750 font-semibold italic">"{q.correctAnswer}"</span></span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded border border-[#E2E8F0] shadow-sm text-slate-400 text-xs flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-slate-300" />
                No questions drafted. Complete the generative wizard parameters on the left and click "Synthesize Exam Draft".
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 4: GENERAL AI QUESTION BANK */}
      {activeSubTab === 'question-bank' && !generating && (
        <div className="space-y-6">
          
          {/* SEARCH FILTERS */}
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2 font-semibold">
              <Filter className="w-3.5 h-3.5" /> Filtering Bank:
            </div>

            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search topic or question prompt..."
                value={qBankSearch}
                onChange={e => setQBankSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <select
              value={qBankClassFilter}
              onChange={e => setQBankClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- All Grade Ranks --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select
              value={qBankSubjectFilter}
              onChange={e => setQBankSubjectFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- All Subject Lines --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>

            <select
              value={qBankStatusFilter}
              onChange={e => setQBankStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- All Status Indicators --</option>
              <option value="Draft">Draft</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* QUESTIONS TILES LISTING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredQuestionBank.map(item => (
              <div key={item.id} className="bg-white rounded border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
                
                {/* STATE FLAGS */}
                <div className="flex justify-between items-start gap-1">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase select-none">
                      {item.className} • {item.subjectName}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium">Topic: <span className="font-semibold text-slate-600">{item.topic}</span></p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                    item.status === 'Approved' 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : item.status === 'Pending Review'
                        ? 'bg-amber-50 border-amber-200 text-amber-800 animate-pulse'
                        : item.status === 'Draft'
                          ? 'bg-slate-50 border-slate-200 text-slate-500'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* TEXT PREVIEW */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900 leading-normal">{item.question.questionText}</p>

                  {item.question.objectiveOptions && (
                    <div className="space-y-1.5">
                      {item.question.objectiveOptions.map((opt, oIdx) => {
                        const isCorrect = opt === item.question.correctAnswer;
                        return (
                          <div key={oIdx} className={`p-2 rounded border text-[10px] font-medium flex justify-between ${isCorrect ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800' : 'bg-slate-50/50 border-slate-100 text-slate-605'}`}>
                            <span>{String.fromCharCode(65 + oIdx)}. {opt}</span>
                            {isCorrect && <Check className="w-3 h-3 text-emerald-600" />}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {item.question.type === 'Theory' && (
                    <div className="p-3 bg-indigo-50/40 border border-indigo-100 rounded text-[10px]">
                      <span className="font-extrabold text-indigo-950 font-mono block leading-none mb-1">EXPECTED ANSWER PARADIGM:</span>
                      <p className="text-slate-650 italic">"{item.question.correctAnswer}"</p>
                      {item.question.markingGuide && (
                        <p className="text-[9px] text-slate-400 mt-2 font-medium">Guide: {item.question.markingGuide}</p>
                      )}
                    </div>
                  )}
                </div>

                <span className="w-full h-px bg-slate-100 block"></span>

                {/* ROW ASSIGNED CREATOR & VERIFICATION COMMANDS */}
                <div className="flex justify-between items-center text-[10px]">
                  <div className="text-slate-400">
                    Drafted by: <span className="font-semibold text-slate-650">{item.createdBy}</span>
                  </div>

                  <div className="flex gap-2">
                    {/* Head Review actions */}
                    {isSchoolHead && item.status === 'Pending Review' && (
                      <>
                        <button
                          onClick={() => handleModifyStatus(item.id, 'Approved')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer transition-colors"
                        >
                          Approve Question
                        </button>
                        <button
                          onClick={() => handleModifyStatus(item.id, 'Rejected')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {/* Teacher Draft submissions */}
                    {!isSchoolHead && item.status === 'Draft' && (
                      <button
                        onClick={() => handleModifyStatus(item.id, 'Pending Review')}
                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold cursor-pointer transition-colors"
                      >
                        Submit for Review
                      </button>
                    )}

                    <button
                      onClick={() => handleRemoveQuestion(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {filteredQuestionBank.length === 0 && (
              <div className="col-span-2 bg-white p-12 text-center text-slate-400 text-xs">
                No archived exam questions matched filters. Modify search terms or compile questions in the Assessment Gen tab.
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 5: AI MARKING ASSISTANT */}
      {activeSubTab === 'marking-asst' && !generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* PASTE PAPERS GRADUATE FORM */}
          <div className="lg:col-span-1 bg-white p-5 rounded border border-[#E2E8F0] shadow-sm space-y-4">
            <span className="text-[10px] text-indigo-600 font-mono tracking-wider font-extrabold block">MARKING INPUT DESK</span>
            
            <div className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Assessed Student</label>
                <select
                  value={markingStudentId}
                  onChange={e => setMarkingStudentId(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-600"
                >
                  {students.map(s => <option key={s.id} value={s.id}>{s.fullName || s.name}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Question Statement Assigned</label>
                <textarea
                  rows={2}
                  value={markingQuestionText}
                  onChange={e => setMarkingQuestionText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-202 bg-slate-50/20 rounded focus:outline-none focus:border-indigo-600 font-sans leading-normal"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block">Expectation Scoring Rubric</label>
                <input
                  type="text"
                  value={markingRubric}
                  onChange={e => setMarkingRubric(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono uppercase text-slate-500 font-bold block font-bold">Paste Student Answer Here</label>
                <textarea
                  rows={5}
                  placeholder="Paste response words..."
                  value={markingStudentAnswer}
                  onChange={e => setMarkingStudentAnswer(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded focus:outline-none focus:border-indigo-600 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50/50 border border-amber-200/50 rounded flex gap-2 text-[10px] text-amber-900 leading-normal">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Assistive Oversight Tool:</span> suggested scores are calculated logically and do not constitute final database grading until teacher approval.
                </div>
              </div>

              <button
                onClick={markingStudentAnswer.trim() ? handleMarkStudentPaper : undefined}
                disabled={!markingStudentAnswer.trim()}
                className={`w-full py-2.5 text-white font-bold rounded flex items-center justify-center gap-1.5 transition-colors text-xs ${
                  markingStudentAnswer.trim() ? 'bg-indigo-900 hover:bg-indigo-950 cursor-pointer' : 'bg-slate-350 bg-slate-300 cursor-not-allowed'
                }`}
              >
                <Award className="w-3.5 h-3.5" /> Grade Student Answer
              </button>

            </div>
          </div>

          {/* GRADED RESULTS SUGGESTIONS PREVIEW */}
          <div className="lg:col-span-2">
            
            {activeMarkingResult ? (
              <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden animate-in fade-in duration-300 space-y-4 p-6">
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold uppercase select-none">
                      ASSESSMENT SUGGESTED REPORT CARD
                    </span>
                    <h2 className="text-sm font-extrabold text-slate-930 text-slate-900">
                      Evaluated Pupil: {activeMarkingResult.studentName}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-indigo-700">{activeMarkingResult.suggestedScore}</span>
                    <span className="text-slate-400 font-mono font-bold text-xs"> / {activeMarkingResult.maxScore}</span>
                    <p className="text-[9px] uppercase font-mono text-[#A3AED0] font-bold mt-1">Suggested Score</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs text-slate-700">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">STATED TASK QUESTION:</span>
                    <p className="font-bold text-slate-800">{activeMarkingResult.questionText}</p>
                  </div>

                  <div className="p-3.5 bg-slate-900 text-slate-100 rounded font-mono text-[11px] leading-normal max-h-32 overflow-y-auto">
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest block mb-1">SUBMITTED TEXT PAPER:</span>
                    "{activeMarkingResult.studentAnswer}"
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold block">CRITICAL FEEDBACK EXPLANATION:</span>
                    <p className="leading-relaxed text-slate-650">{activeMarkingResult.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-indigo-700 font-bold block">RECOMMENDED CORRECTIVES:</span>
                    <ul className="list-disc pl-4 space-y-1 text-slate-550">
                      {activeMarkingResult.corrections.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <span className="w-full h-px bg-slate-100 block"></span>

                  <div className="flex gap-2.5 justify-end">
                    <button
                      onClick={() => setActiveMarkingResult(null)}
                      className="px-4 py-2 hover:bg-slate-100 text-slate-600 rounded font-bold cursor-pointer transition-all"
                    >
                      Dismount
                    </button>
                    <button
                      onClick={handleApproveFinalMark}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve & Lock Grades
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded border border-[#E2E8F0] shadow-sm text-slate-400 text-xs flex flex-col items-center gap-2">
                <Award className="w-10 h-10 text-slate-300" />
                No evaluations active. Paste study prompts and pupil written copy on the left Desk view and click "Grade Student Answer".
              </div>
            )}

          </div>

        </div>
      )}

      {/* TAB 6: AI STUDENT INSIGHTS */}
      {activeSubTab === 'student-insights' && !generating && (
        <div className="space-y-6">
          
          {/* SEARCH FILTERS */}
          <div className="bg-white p-4 rounded border border-[#E2E8F0] shadow-3xs flex flex-wrap gap-3 items-center">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Filtering Insights:
            </span>

            <input
              type="text"
              placeholder="Search class cohort..."
              value={insightClassFilter}
              onChange={e => setInsightClassFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-205 rounded text-xs focus:outline-none"
            />

            <select
              value={insightRiskFilter}
              onChange={e => setInsightRiskFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:border-indigo-600"
            >
              <option value="">-- All Risk Categories --</option>
              <option value="High Risk">High Risk Indicator</option>
              <option value="Medium Risk">Medium Risk Indicator</option>
              <option value="Low Risk">Low Risk Standard</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* INSIGHTS ROSTER */}
            <div className="lg:col-span-1 bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
              
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <span className="text-xs font-bold font-mono text-[#0A1E33] uppercase">CLASS COMPILATION MATRIX</span>
              </div>

              {computedStudentInsights.map(studentIns => (
                <div
                  key={studentIns.id}
                  onClick={() => setSelectedInsightStudent(studentIns)}
                  className={`p-4 hover:bg-slate-50/55 cursor-pointer flex justify-between items-center transition-all ${
                    selectedInsightStudent?.id === studentIns.id ? 'bg-indigo-50/50 border-l-4 border-indigo-700' : ''
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold text-slate-850">{studentIns.studentName}</p>
                    <p className="text-[10px] text-slate-400 font-sans">{studentIns.gradeClass}</p>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                    studentIns.riskLevel === 'High Risk' 
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : studentIns.riskLevel === 'Medium Risk'
                        ? 'bg-amber-50 border border-amber-200 text-amber-700'
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    {studentIns.riskLevel}
                  </span>
                </div>
              ))}

              {computedStudentInsights.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No tracking vectors matched.
                </div>
              )}

            </div>

            {/* EXPANDED IN-DEPTH STUDENT INSIGHT DETAIL CARD */}
            <div className="lg:col-span-2">
              
              {selectedInsightStudent ? (
                <div className="bg-white rounded border border-[#E2E8F0] shadow-sm p-6 space-y-5 animate-in fade-in duration-200">
                  
                  <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                    <div className="space-y-1.5">
                      <span className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-bold">
                        DIAGNOSTIC CASE STUDY
                      </span>
                      <h2 className="text-sm font-extrabold text-slate-900">{selectedInsightStudent.studentName}</h2>
                      <p className="text-[11px] text-slate-400">{selectedInsightStudent.gradeClass}</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded border border-slate-150 text-center min-w-[100px]">
                      <span className="text-xs text-slate-400 font-mono block leading-none mb-1">RISK LEVEL</span>
                      <span className={`text-[10.5px] font-mono font-bold uppercase ${
                        selectedInsightStudent.riskLevel === 'High Risk' ? 'text-rose-600' : selectedInsightStudent.riskLevel === 'Medium Risk' ? 'text-amber-550 text-amber-600' : 'text-emerald-600'
                      }`}>
                        {selectedInsightStudent.riskLevel}
                      </span>
                    </div>
                  </div>

                  {/* METRICS METRIC GRID CHIPS */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                    
                    <div className="p-3.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 font-mono text-[9px] block">ROLL CALL</span>
                      <span className="text-sm font-bold text-slate-800 font-mono block mt-1">{selectedInsightStudent.attendanceRate}%</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 font-mono text-[9px] block">HOMEWORK COMP</span>
                      <span className="text-sm font-bold text-slate-800 font-mono block mt-1">{selectedInsightStudent.assignmentsSubmittedCount} submissions</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 font-mono text-[9px] block">MISSING TASKS</span>
                      <span className={`text-sm font-bold font-mono block mt-1 ${selectedInsightStudent.assignmentsOverdueCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{selectedInsightStudent.assignmentsOverdueCount} Overdue</span>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded border border-slate-100">
                      <span className="text-slate-400 font-mono text-[9px] block">AVERAGE GRADES</span>
                      <span className="text-sm font-bold text-slate-800 font-mono block mt-1">{selectedInsightStudent.academicPerformanceAverage}%</span>
                    </div>

                  </div>

                  {/* PROMPT DIAGNOSTIC DETAIL */}
                  <div className="space-y-4">
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      
                      <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded border border-slate-150">
                        <span className="text-[10px] font-mono text-indigo-700 font-bold block">IDENTIFIED PROFILE WEAKNESSES</span>
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-500 leading-normal">
                          {selectedInsightStudent.weaknesses.map((w, idx) => (
                            <li key={idx}>{w}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1.5 p-3.5 bg-slate-50/50 rounded border border-slate-150">
                        <span className="text-[10px] font-mono text-emerald-700 font-bold block">OBSERVED INDIVIDUAL STRENGTHS</span>
                        <ul className="list-disc pl-4 space-y-1.5 text-slate-500 leading-normal">
                          {selectedInsightStudent.strengths.map((s, idx) => (
                            <li key={idx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                    </div>

                    <span className="w-full h-px bg-slate-100 block"></span>

                    {/* INTERVENTION BULLETINS */}
                    <div className="p-4 bg-indigo-900 text-white rounded space-y-2.5 text-xs">
                      <span className="text-[9px] text-[#A3AED0] font-mono font-bold tracking-wider block">RECOMMENDED INTERVENTION PROGRAM:</span>
                      <div className="space-y-1.5">
                        {selectedInsightStudent.recommendedInterventions.map((item, idx) => (
                          <div key={idx} className="flex gap-2 items-start font-medium">
                            <span className="text-indigo-400 select-none font-bold font-mono">0{idx + 1}.</span>
                            <p className="leading-snug text-indigo-100">{item}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-150 rounded leading-relaxed text-slate-600 text-[11px] italic">
                      "{selectedInsightStudent.overallComments}"
                    </div>

                  </div>

                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded border border-[#E2E8F0] shadow-sm text-slate-400 text-xs flex flex-col items-center gap-2">
                  <Users className="w-10 h-10 text-slate-300" />
                  Select a student profile from the class roster index on the left to review automated AI Academic Diagnostic metrics.
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* TAB 7: AI USAGE LOGS (RESTRICTED TO ADM/HEADS ROLES) */}
      {activeSubTab === 'usage-logs' && isSchoolHead && !generating && (
        <div className="space-y-6">
          
          {/* SUBSCRIPTION CAPABILITIES DESCRIPTION BOX */}
          <div className="bg-white rounded border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-bold font-mono text-indigo-900 uppercase tracking-wider">
                EduCore AI Usage Audit and Allocation Control
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Security accountability tracking for multi-tenant billing protocols. Basic nodes are capped at 100 runs, Professional at 500, and Enterprise is unlimited.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono font-bold">
              <div className="p-3 rounded bg-indigo-55 bg-indigo-50 border border-indigo-100 text-indigo-950 flex flex-col gap-1">
                <span className="text-[9px] text-[#A3AED0]">CORE RESOLVER PACKAGE</span>
                <span className="text-sm font-extrabold">{subscriptionLimit.label}</span>
              </div>

              <div className="p-3 rounded bg-slate-50 border border-slate-150 text-slate-900 flex flex-col gap-1">
                <span className="text-[9px] text-slate-400">ALLOCATION CAP</span>
                <span className="text-sm font-extrabold">{subscriptionLimit.value}</span>
              </div>

              <div className="p-3 rounded bg-emerald-50 border border-emerald-150 text-emerald-950 flex flex-col gap-1">
                <span className="text-[9px] text-emerald-450 text-emerald-500">CONSUMED TO date</span>
                <span className="text-sm font-extrabold">{currentUsageCount} Operations</span>
              </div>
            </div>
          </div>

          {/* CHRONOLOGICAL TABLE */}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-700">Chronological AI Activity Logs</span>
              <button
                onClick={() => {
                  localStorage.removeItem(USAGE_LOGS_KEY);
                  setUsageLogs([]);
                  triggerToast('AI usage audits reset.', 'info');
                }}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-extrabold flex items-center gap-1 cursor-pointer"
              >
                Clear Ledger
              </button>
            </div>

            <div className="table-wrapper overflow-x-auto">
              <table className="w-full text-left border-collapse text-slate-700 min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-mono tracking-wider text-slate-400 uppercase font-bold">
                    <th className="p-4">User Details</th>
                    <th className="p-4">Staff Role</th>
                    <th className="p-4">AI Module</th>
                    <th className="p-4">Prompt Type / Title</th>
                    <th className="p-4">Generated Title</th>
                    <th className="p-4 text-center">Output Size</th>
                    <th className="p-4 text-center">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {usageLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/40">
                      <td className="p-4 font-bold text-slate-900">{log.userName}</td>
                      <td className="p-4 font-semibold text-slate-500">{log.userRole}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-[10px]">
                          {log.module}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 italic">"{log.promptType}"</td>
                      <td className="p-4 font-semibold text-slate-700">"{log.generatedTitle}"</td>
                      <td className="p-4 text-center font-mono text-[11px] text-slate-500">{log.charCountGenerated} chars</td>
                      <td className="p-4 text-center text-slate-400 font-mono text-[10.5px]">
                        {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}

                  {usageLogs.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-slate-400">
                        No operations cataloged on local ledger.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
