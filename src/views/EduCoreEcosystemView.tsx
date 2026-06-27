/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BarChart3, 
  MapPin, 
  Smartphone, 
  Award, 
  Sparkles, 
  Send, 
  DollarSign, 
  Layers, 
  Clock, 
  Globe, 
  Palette, 
  Play, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Search, 
  BookOpen, 
  Library as LibraryIcon, 
  Tv, 
  GraduationCap, 
  HelpCircle, 
  AlertTriangle, 
  CheckSquare, 
  Calendar,
  Share2,
  FileText,
  UserCheck,
  Heart,
  Truck,
  Database,
  Lock,
  ChevronRight,
  ShieldAlert,
  Sliders,
  BellRing,
  Download,
  Flame,
  Info,
  Check,
  Laptop
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { School, User } from '../types';

interface EduCoreEcosystemViewProps {
  schools: School[];
  currentUser: User | null;
}

export default function EduCoreEcosystemView({ schools, currentUser }: EduCoreEcosystemViewProps) {
  // Navigation for Stage 8 Modules
  const [activeSubTab, setActiveSubTab] = useState<'groups' | 'dashboards' | 'bi' | 'lms' | 'admin' | 'mobile' | 'white-label'>('groups');

  // Multi-school group management states
  const [schoolGroups, setSchoolGroups] = useState([
    {
      id: 'grp_1',
      name: 'Apex Educational Trust',
      type: 'Educational Trust',
      schoolIds: ['school_1', 'school_2'],
      directorName: 'Prof. Evelyn Vance',
      academicScore: 84.5,
      attendanceRate: 94.2,
      feesCollected: 124500,
      aiUsageChars: 450000,
      established: '2021'
    },
    {
      id: 'grp_2',
      name: 'St. Mary Diocesan Network',
      type: 'Religious Education Body',
      schoolIds: ['school_3'],
      directorName: 'Father Luke Bennett',
      academicScore: 78.9,
      attendanceRate: 91.8,
      feesCollected: 89300,
      aiUsageChars: 220000,
      established: '2019'
    },
    {
      id: 'grp_3',
      name: 'Accra North Education District',
      type: 'District Education Office',
      schoolIds: ['school_4', 'school_5'],
      directorName: 'Hon. Beatrice Osei',
      academicScore: 81.2,
      attendanceRate: 92.5,
      feesCollected: 184000,
      aiUsageChars: 680000,
      established: '2023'
    }
  ]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>('grp_1');
  const [newGroupModal, setNewGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupType, setNewGroupType] = useState('Educational Trust');
  const [newGroupDirector, setNewGroupDirector] = useState('');

  // District / Region states
  const [geographicalLevel, setGeographicalLevel] = useState<'District' | 'Regional' | 'National'>('District');
  const [rankMetric, setRankMetric] = useState<'academic' | 'attendance' | 'productivity' | 'engagement'>('academic');
  const [selectedHeatzone, setSelectedHeatzone] = useState<string | null>(null);

  // Business Intelligence states
  const [biTab, setBiTab] = useState<'Academic' | 'Financial' | 'Operational' | 'Teacher' | 'Student' | 'AI'>('Academic');
  const [predictiveYear, setPredictiveYear] = useState<number>(2028);

  // LMS & Exams states
  const [selectedCourse, setSelectedCourse] = useState<string>('course_1');
  const [isPlayingLecture, setIsPlayingLecture] = useState(false);
  const [quizActive, setQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [quizTimer, setQuizTimer] = useState(60);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [cbtProctorAlerts, setCbtProctorAlerts] = useState<string[]>([]);

  // Admissions and Digital Admin states
  const [admFilter, setAdmFilter] = useState<'All' | 'Pending' | 'Interview' | 'Approved' | 'Rejected'>('All');
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [showWebsiteBuilder, setShowWebsiteBuilder] = useState(false);
  const [websiteTheme, setWebsiteTheme] = useState<'classic' | 'emerald' | 'gold' | 'cyber'>('classic');
  const [websiteMotto, setWebsiteMotto] = useState('Nurturing Minds, Sparking Intelligence');
  const [websitePhone, setWebsitePhone] = useState('+233 24 555 1010');
  const [admissionNotice, setAdmissionNotice] = useState('Admissions are open for the academic Year 2026/2027!');

  // Library & Ancillary States
  const [libSearch, setLibSearch] = useState('');
  const [libraryBooks, setLibraryBooks] = useState([
    { id: 'b1', title: 'Calculus Vol II', author: 'Tom M. Apostol', section: 'Mathematics', quantity: 12, borrowed: 4 },
    { id: 'b2', title: 'Principles of Physics', author: 'Halliday & Resnick', section: 'Science', quantity: 8, borrowed: 7 },
    { id: 'b3', title: 'Generative AI: Deep Learning', author: 'Ian Goodfellow', section: 'Technology', quantity: 15, borrowed: 11 },
    { id: 'b4', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', section: 'Literature', quantity: 5, borrowed: 0 },
  ]);

  const [hostelRooms, setHostelRooms] = useState([
    { id: 'room_101', bloc: 'Alpha Block', beds: 4, allocated: 3 },
    { id: 'room_102', bloc: 'Alpha Block', beds: 4, allocated: 4 },
    { id: 'room_103', bloc: 'Beta Block (Female)', beds: 6, allocated: 2 },
    { id: 'room_104', bloc: 'Omega Honor Hall', beds: 2, allocated: 2 },
  ]);

  const [transportRoutes, setTransportRoutes] = useState([
    { id: 'rt_1', name: 'Valley-Metro Route', busNo: 'BUS-099', driver: 'Nyamah Kwame', students: 48, status: 'Active En Route' },
    { id: 'rt_2', name: 'Downtown Express Shuttles', busNo: 'BUS-034', driver: 'Isaac Jallah', students: 32, status: 'Standby' },
    { id: 'rt_3', name: 'Hilltop Roster Shuttle', busNo: 'BUS-012', driver: 'Amara Diop', students: 18, status: 'Active En Route' },
  ]);

  const [clinicalVisits, setClinicalVisits] = useState([
    { id: 'vis_1', studentName: 'Kwesi Appiah', age: 14, complaint: 'Mild Fever & Exhaustion', status: 'In Ward, Resting', time: '10:14 AM' },
    { id: 'vis_2', studentName: 'Fatoumata Fall', age: 16, complaint: 'Sports Ankle Sprain Grade I', status: 'Discharged, Bandaged', time: '11:30 AM' },
    { id: 'vis_3', studentName: 'Liam Harrison', age: 11, complaint: 'Seasonal Allergies Flare-up', status: 'Meds Administered', time: '01:15 PM' },
  ]);

  // Document Management and Version Control
  const [docSearch, setDocSearch] = useState('');
  const [documents, setDocuments] = useState([
    { id: 'doc_10', title: 'EduCore National Curriculum Integration Map', currentVersion: '3.4', approvals: ['Approved by Ministry', 'Signed by Trustee'], module: 'Guidelines', updatedAt: '2026-05-12' },
    { id: 'doc_11', title: 'SaaS Disaster Recovery & Node Backup Plan', currentVersion: '1.2', approvals: ['SysOps Verified'], module: 'Technical', updatedAt: '2026-06-01' },
    { id: 'doc_12', title: 'School Group Code of Fiscal Conduct v2026', currentVersion: '2.0', approvals: ['Pending Audit Review'], module: 'Policies', updatedAt: '2026-06-18' },
  ]);

  // Mobile App states
  const [mobilePersona, setMobilePersona] = useState<'Parent' | 'Teacher' | 'Student' | 'SchoolHead'>('Student');
  const [pushNotificationSimState, setPushNotificationSimState] = useState<string | null>(null);
  const [mobileOfflineMode, setMobileOfflineMode] = useState(false);
  const [mobileAIChatMessage, setMobileAIChatMessage] = useState('');
  const [mobileAIChatLog, setMobileAIChatLog] = useState([
    { role: 'ai', text: "Hello! I am your AI Study Copilot. Ask me questions about Algebra, Science, or check your assignment feedback!" }
  ]);

  // White label & Globalization state
  const [whiteLabelBrandName, setWhiteLabelBrandName] = useState('EduCore Global');
  const [whiteLabelDomain, setWhiteLabelDomain] = useState('academy.educore-global.org');
  const [whiteLabelThemeColor, setWhiteLabelThemeColor] = useState('#1A56DB');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'fr' | 'de' | 'es' | 'sw'>('en');
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'GHS' | 'KES'>('USD');
  const [selectedTimeZone, setSelectedTimeZone] = useState('UTC');

  // Simulations lists
  const [admissions, setAdmissions] = useState([
    { id: 'adm_1', applicantName: 'Kofi Mensah Jr.', guardianName: 'Kofi Mensah Sr.', targetClass: 'Grade 7', status: 'Pending', documentUrl: 'birth_cert_pdf', date: '2026-06-12' },
    { id: 'adm_2', applicantName: 'Chinedu Egwu', guardianName: 'Dr. Stella Egwu', targetClass: 'Senior High 1', status: 'Interview', documentUrl: 'transcript_high_pdf', date: '2026-06-14' },
    { id: 'adm_3', applicantName: 'Amina Diarra', guardianName: 'Moussa Diarra', targetClass: 'Grade 9', status: 'Approved', documentUrl: 'medical_record_pdf', date: '2026-06-15' },
    { id: 'adm_4', applicantName: 'Sarah Johnston', guardianName: 'David Johnston', targetClass: 'Grade 8', status: 'Rejected', documentUrl: 'transfer_doc_pdf', date: '2026-06-10' }
  ]);

  const [alumniRecords, setAlumniRecords] = useState([
    { id: 'alum_1', fullName: 'Kwame Boateng', graduationYear: '2023', industry: 'Software Engineering', phone: '+233 24 112 3344', contributionUSD: 350 },
    { id: 'alum_2', fullName: 'Aisha Toure', graduationYear: '2021', industry: 'Cardiology Medicine', phone: '+221 77 421 9890', contributionUSD: 1200 },
    { id: 'alum_3', fullName: 'Nii Adjaye', graduationYear: '2024', industry: 'Civic Architecture', phone: '+233 55 930 4010', contributionUSD: 0 }
  ]);

  // SMS Broadcast Logs
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLogs, setBroadcastLogs] = useState([
    { id: 'br_1', channel: 'SMS/WhatsApp', audience: 'All School Parents', text: 'Important announcement: National Scale Holiday tomorrow.', status: 'Delivered', reach: '1,450 parents', openRate: '98.5%' },
    { id: 'br_2', channel: 'Push Notification', audience: 'Active Faculty Teachers', text: 'Term-level academic records review deadline is tonight at 23:59 GMT.', status: 'Sent', reach: '84 teachers', openRate: '100.0%' }
  ]);

  // Toast Notification Trigger Helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Timer running for CBT Quiz Simulation
  useEffect(() => {
    let interval: any = null;
    if (quizActive && quizTimer > 0) {
      interval = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && quizActive) {
      handleCompleteQuiz();
    }
    return () => clearInterval(interval);
  }, [quizActive, quizTimer]);

  // Simulate proctor metrics warning randomly
  useEffect(() => {
    if (quizActive) {
      const proctorSim = setInterval(() => {
        const rand = Math.random();
        if (rand < 0.15) {
          const timestamp = new Date().toLocaleTimeString();
          setCbtProctorAlerts(prev => [
            `[${timestamp}] Warning: Potential second face detected in webcam boundary.`,
            ...prev
          ]);
          showToast("AI Proctor Warning Issued! Face tracking scan matched anomalies.");
        } else if (rand < 0.25) {
          const timestamp = new Date().toLocaleTimeString();
          setCbtProctorAlerts(prev => [
            `[${timestamp}] Alert: Student tab focus minimized. Return to Computer-Based Testing view immediate.`,
            ...prev
          ]);
          showToast("AI Proctor Event: Tab Switching violation recorded.");
        }
      }, 12000);
      return () => clearInterval(proctorSim);
    }
  }, [quizActive]);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupDirector) return;
    const nextGroup = {
      id: `grp_${Date.now()}`,
      name: newGroupName,
      type: newGroupType,
      schoolIds: schools.length > 0 ? [schools[0].id] : [],
      directorName: newGroupDirector,
      academicScore: parseFloat((75 + Math.random() * 20).toFixed(1)),
      attendanceRate: parseFloat((88 + Math.random() * 10).toFixed(1)),
      feesCollected: Math.floor(40000 + Math.random() * 120000),
      aiUsageChars: Math.floor(100000 + Math.random() * 800000),
      established: new Date().getFullYear().toString()
    };
    setSchoolGroups([...schoolGroups, nextGroup]);
    setNewGroupName('');
    setNewGroupDirector('');
    setNewGroupModal(false);
    showToast(`Successfully registered "${nextGroup.name}" Multi-school organizational unit.`);
  };

  const handleSimulatePushNotification = (title: string, body: string) => {
    setPushNotificationSimState(`${title}: ${body}`);
    showToast(`Dispatched central system push notification target: ${mobilePersona}`);
    setTimeout(() => {
      setPushNotificationSimState(null);
    }, 7000);
  };

  const handleMobileAIChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileAIChatMessage.trim()) return;
    const userMsg = mobileAIChatMessage;
    setMobileAIChatLog(prev => [...prev, { role: 'user', text: userMsg }]);
    setMobileAIChatMessage('');

    // Simulated Smart Academic Assistant Copilot response
    setTimeout(() => {
      let response = "That's a fantastic academic query! Let me retrieve your syllabus progress. Based on your current performance charts, practicing Algebra Chapter 4 and reading through Physics Lecture slides will optimize your grading velocity.";
      if (userMsg.toLowerCase().includes('quiz') || userMsg.toLowerCase().includes('exam')) {
        response = "Your next computerized quiz is 'Physics Vol II: Kinematics' scheduled for Friday morning. Use the study checklist in your Student portal dashboard!";
      } else if (userMsg.toLowerCase().includes('fees') || userMsg.toLowerCase().includes('pay')) {
        response = "Your parent account lists $120.00 outstanding for laboratory fees. You can clear this balance instantly through our integrated standard Payment gateway hubs.";
      }
      setMobileAIChatLog(prev => [...prev, { role: 'ai', text: response }]);
    }, 800);
  };

  const handleBroadCastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    const nextLog = {
      id: `br_${Date.now()}`,
      channel: 'SMS/WhatsApp & Push',
      audience: 'All Micro-School Key Informants',
      text: broadcastMessage,
      status: 'Delivered',
      reach: '9,842 endpoints globally',
      openRate: '94.8%'
    };
    setBroadcastLogs([nextLog, ...broadcastLogs]);
    setBroadcastMessage('');
    showToast("Broadcast message successfully queued for district-level transmission!");
  };

  const handleTriggerQuiz = () => {
    setQuizActive(true);
    setQuizTimer(60);
    setQuizScore(null);
    setSelectedAnswers({});
    setCbtProctorAlerts([]);
    showToast("Computer-Based Test Started! AI Eye-proctor tracking online.");
  };

  const handleCompleteQuiz = () => {
    setQuizActive(false);
    // Grade based on hardcoded Kinematics and AI questions
    let score = 0;
    if (selectedAnswers[1] === 1) score += 50; // Q1 Correct option (A)
    if (selectedAnswers[2] === 2) score += 50; // Q2 Correct option (B)
    setQuizScore(score);
    showToast(`Computer-Based Quiz compiled! Auto-grade index: ${score}%`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 p-1">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#1A56DB] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-sans font-semibold text-xs border border-blue-400"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER HERO STRIP */}
      <div className="bg-gradient-to-r from-[#071626] to-[#0E2845] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 opacity-[0.03] translate-x-12 -translate-y-6">
          <Globe className="w-96 h-96" />
        </div>
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-[#1A56DB] px-3 py-1 rounded-full uppercase tracking-wider border border-blue-400/30">
               Stage 8 Educational Infrastructure Platform
            </span>
            <span className="text-[10px] font-mono font-bold bg-purple-600 px-3 py-1 rounded-full uppercase tracking-wider border border-purple-400/30">
               BI & Data Warehouse
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">
            National Scale & Education Ecosystem Hub
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Govern multi-school groups, view executive regional intelligence dashboards, interact with offline-first client mobile simulators, build websites, administertimed CBTs, and evaluate global SaaS white-label metrics.
          </p>
        </div>
      </div>

      {/* MODULE SEPARATOR BAR BUTTONS */}
      <div className="flex gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl overflow-x-auto select-none">
        {[
          { id: 'groups', label: 'School Groups & isolation', icon: Building2 },
          { id: 'dashboards', label: 'Regional & District rankings', icon: MapPin },
          { id: 'bi', label: 'BI Center & Data Warehouse', icon: BarChart3 },
          { id: 'lms', label: 'AI LMS & CBT Exams', icon: Sparkles },
          { id: 'admin', label: 'Digital Admin & websites', icon: FileText },
          { id: 'mobile', label: 'Mobile Simulator App', icon: Smartphone },
          { id: 'white-label', label: 'White-Label & Globalization', icon: Palette }
        ].map(tb => {
          const Icon = tb.icon;
          const isActive = activeSubTab === tb.id;
          return (
            <button
              key={tb.id}
              onClick={() => setActiveSubTab(tb.id as any)}
              className={`px-4 py-3 text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform -translate-y-0.5' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tb.label}</span>
            </button>
          );
        })}
      </div>

      {/* RENDER ACTIVE MODULE CONTROLS */}
      <div className="space-y-6">

        {/* SUBTAB 1: MULTI-SCHOOL GROUPS */}
        {activeSubTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left selector card panel */}
            <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Umbrella Networks</h3>
                <button 
                  onClick={() => setNewGroupModal(true)}
                  className="p-1.5 bg-blue-50 border border-blue-200 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-[450px] overflow-y-auto">
                {schoolGroups.map(grp => {
                  const isSelected = selectedGroupId === grp.id;
                  return (
                    <div
                      key={grp.id}
                      onClick={() => setSelectedGroupId(grp.id)}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/20 shadow-xs' 
                          : 'border-slate-150 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {grp.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-semibold">Est: {grp.established}</span>
                      </div>
                      <h4 className="text-xs font-bold font-sans text-slate-900 leading-tight">
                        {grp.name}
                      </h4>
                      <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                        <div className="flex justify-between">
                          <span>Group Director:</span>
                          <span className="font-bold text-slate-700">{grp.directorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Managed School Nodes:</span>
                          <span className="font-bold text-slate-900">{grp.schoolIds.length} Nodes</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Group Details comparatives panel */}
            <div className="lg:col-span-2 space-y-6">
              {(() => {
                const grp = schoolGroups.find(g => g.id === selectedGroupId);
                if (!grp) return null;
                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    
                    {/* Header Details */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
                      <div>
                        <div className="flex items-center gap-2">
                          <Building2 className="w-5 h-5 text-blue-600" />
                          <h3 className="text-lg font-black text-slate-905">{grp.name}</h3>
                        </div>
                        <p className="text-xs text-slate-505 font-medium mt-1">
                          Central Group Director: <strong className="text-slate-700 font-extrabold">{grp.directorName}</strong> • Structured as a completely isolated tenant federation.
                        </p>
                      </div>
                      <button
                        onClick={() => showToast(`Generated comprehensive executive dossier for "${grp.name}". Ready for ministry review.`)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Produce Executive Report
                      </button>
                    </div>

                    {/* KPI Comparison metrics cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Avg Academic Score</span>
                        <div className="text-xl font-black font-mono text-emerald-600">{grp.academicScore}%</div>
                        <div className="text-[9px] text-slate-400 font-bold">Standardized National Benchmark</div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Ecosystem Attendance</span>
                        <div className="text-xl font-black font-mono text-[#1A56DB]">{grp.attendanceRate}%</div>
                        <div className="text-[9px] text-slate-400 font-bold">Daily logs verification rating</div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Fees Realization Tally</span>
                        <div className="text-xl font-black font-mono text-slate-800">${grp.feesCollected.toLocaleString()}</div>
                        <div className="text-[9px] text-slate-400 font-bold">Consolidated Gateway Receipts</div>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                        <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Group AI Usage</span>
                        <div className="text-xl font-black font-mono text-purple-700">{grp.aiUsageChars.toLocaleString()} Chs</div>
                        <div className="text-[9px] text-slate-400 font-bold">Cognitive API triggers volume</div>
                      </div>
                    </div>

                    {/* Compare schools inside group in details list */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-slate-700 tracking-wider">Interactive School-Level Node Comparison Datatable</h4>
                      <div className="border border-slate-150 rounded-xl overflow-hidden">
                        <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-[#0A1E33] text-white">
                            <tr>
                              <th className="px-4 py-2.5 font-bold font-mono">School Node (Tenant ID)</th>
                              <th className="px-4 py-2.5 font-bold">Academics Index</th>
                              <th className="px-4 py-2.5 font-bold">Attendance Rate</th>
                              <th className="px-4 py-2.5 font-bold">Financial Standing</th>
                              <th className="px-4 py-2.5 font-bold text-center">Data Isolation Key</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                            {schools.slice(0, 3).map((sch, idx) => {
                              // generate mock differentiated scores for comparative list
                              const schAcademic = idx === 0 ? 84.8 : idx === 1 ? 79.2 : 82.5;
                              const schAttend = idx === 0 ? 94.6 : idx === 1 ? 91.5 : 92.8;
                              const schFin = idx === 0 ? 'Surplus ($94,200)' : idx === 1 ? 'Settled ($54,100)' : 'Awaiting sync';
                              return (
                                <tr key={sch.id} className="hover:bg-slate-50">
                                  <td className="px-4 py-3 font-bold text-slate-900">
                                    <div className="font-sans font-bold">{sch.name}</div>
                                    <div className="text-[9px] text-slate-400">Code: {sch.code}</div>
                                  </td>
                                  <td className="px-4 py-3 text-emerald-600 font-bold">{schAcademic}%</td>
                                  <td className="px-4 py-3 text-blue-600 font-bold">{schAttend}%</td>
                                  <td className="px-4 py-3 font-semibold text-slate-700">{schFin}</td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-[10px] bg-red-50 text-red-700 font-bold px-2 py-0.5 rounded border border-red-100">
                                      {sch.id.toUpperCase()}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* AI Advisor Panel */}
                    <div className="p-4 bg-purple-50 border border-purple-150 rounded-xl space-y-1">
                      <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs">
                        <Sparkles className="w-4 h-4 text-purple-700" />
                        <span>AI Group Advisor Recommendation Engine</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        "Analysis shows a **12.4% discrepancy** in attendance between local nodes under Apex Educational Trust. Node **Central Crest** leads other clusters. Suggested intervention: Re-allocate supplementary student transit coordinates dynamically."
                      </p>
                    </div>

                  </div>
                );
              })()}
            </div>

            {/* Simulated Create Group Modal */}
            {newGroupModal && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white border border-slate-205 rounded-2xl shadow-xl overflow-hidden">
                  <div className="bg-[#0A1E33] px-5 py-3 border-b border-slate-800 text-white flex justify-between items-center">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono">Create School Group Profile</h3>
                    <button onClick={() => setNewGroupModal(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold">✕</button>
                  </div>
                  <form onSubmit={handleCreateGroup} className="p-5 space-y-4 text-xs font-sans">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 uppercase font-black font-mono">Unique Group Name</label>
                      <input 
                        type="text" 
                        required 
                        value={newGroupName} 
                        onChange={e => setNewGroupName(e.target.value)}
                        placeholder="e.g. Western Diocese Collective" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 uppercase font-black font-mono">Organizational Level</label>
                      <select 
                        value={newGroupType} 
                        onChange={e => setNewGroupType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="Educational Trust">Educational Trust</option>
                        <option value="Religious Education Body">Religious Education Body</option>
                        <option value="District Education Office">District Education Office</option>
                        <option value="Regional Directorate">Regional Directorate</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-450 uppercase font-black font-mono">Umbrella Director Fullname</label>
                      <input 
                        type="text" 
                        required 
                        value={newGroupDirector} 
                        onChange={e => setNewGroupDirector(e.target.value)}
                        placeholder="e.g. Dr. Arthur Pendelton" 
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                    <div className="pt-3 flex justify-end gap-2.5">
                      <button 
                        type="button" 
                        onClick={() => setNewGroupModal(false)}
                        className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-colors"
                      >
                        Save Group Layer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* SUBTAB 2: REGIONAL & DISTRICT DASHBOARDS & MAPS */}
        {activeSubTab === 'dashboards' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* National Level/Toggles */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">District, Regional & National Rankings Portal</h3>
                <p className="text-xs text-slate-450">Compare institutions cross-sectioned by centralized administrative levels.</p>
              </div>

              {/* Geographic toggles */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                {(['District', 'Regional', 'National'] as const).map(lev => {
                  const active = geographicalLevel === lev;
                  return (
                    <button
                      key={lev}
                      onClick={() => setGeographicalLevel(lev)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-lg cursor-pointer transition-all ${
                        active ? 'bg-white text-blue-600 shadow-xs font-black' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {lev} Overview
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Heatmap interactive map & Key metrics selectors */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Ranking Lists */}
              <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Official Ranking Index</h4>
                  <select
                    value={rankMetric}
                    onChange={e => setRankMetric(e.target.value as any)}
                    className="px-2 py-1 text-[10.5px] border border-slate-200 bg-white rounded-lg text-slate-700 font-extrabold outline-none cursor-pointer"
                  >
                    <option value="academic">Academic Grade Ranks</option>
                    <option value="attendance">Daily Attendance Ranks</option>
                    <option value="productivity">Teacher Productivity</option>
                    <option value="engagement">Student Engagement</option>
                  </select>
                </div>

                <div className="space-y-2.5">
                  {[
                    { rank: 1, name: 'Central Crest Academy', metricValue: rankMetric === 'academic' ? '88.4%' : rankMetric === 'attendance' ? '96.2%' : rankMetric === 'productivity' ? '9.8 / 10' : '95%', location: 'Accra Region' },
                    { rank: 2, name: 'Grace Hill International', metricValue: rankMetric === 'academic' ? '82.1%' : rankMetric === 'attendance' ? '93.5%' : rankMetric === 'productivity' ? '8.9 / 10' : '91%', location: 'Kumasi District' },
                    { rank: 3, name: 'Pioneer Academic Hub', metricValue: rankMetric === 'academic' ? '79.5%' : rankMetric === 'attendance' ? '91.8%' : rankMetric === 'productivity' ? '8.5 / 10' : '88%', location: 'Tamale Regional' },
                    { rank: 4, name: 'Sovereign Diocesan High', metricValue: rankMetric === 'academic' ? '76.8%' : rankMetric === 'attendance' ? '89.4%' : rankMetric === 'productivity' ? '7.9 / 10' : '84%', location: 'Takoradi District' }
                  ].map(rk => (
                    <div key={rk.rank} className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-150 rounded-xl hover:bg-slate-100/50 transition-all">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-white font-mono text-[10px] font-black ${
                          rk.rank === 1 ? 'bg-amber-400' : rk.rank === 2 ? 'bg-slate-400' : rk.rank === 3 ? 'bg-amber-600' : 'bg-slate-300'
                        }`}>
                          {rk.rank}
                        </span>
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-tight">{rk.name}</p>
                          <span className="text-[9.5px] font-mono text-slate-400">{rk.location}</span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-blue-600">{rk.metricValue}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Geographic SVG Interactive Heatmap Canvas */}
              <div className="lg:col-span-2 bg-[#0E1E2F] text-white p-6 rounded-2xl relative flex flex-col justify-between min-h-[380px] shadow-sm select-none border border-slate-800">
                <div className="space-y-1 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">Regional Heatzones Node Density</span>
                  <p className="text-xs text-slate-400">Hover over active coordinates dot pins to render administrative summary maps.</p>
                </div>

                {/* Simulated Geographic Outline Plot */}
                <div className="relative flex-1 flex items-center justify-center p-4">
                  {/* Backdrop network lines pattern resembling a real grid map */}
                  <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#1A56DB_1px,transparent_1px)] [background-size:16px_16px]" />

                  <svg viewBox="0 0 400 200" className="w-full max-w-lg h-auto text-slate-500/10">
                    <path fill="currentColor" d="M20,10 L100,50 L200,30 L280,70 L340,40 L380,120 L300,180 L220,150 L140,190 L50,150 Z" />
                    <line x1="20" y1="10" x2="380" y2="120" stroke="rgba(255,255,255,0.02)" strokeDasharray="4" />
                    <line x1="50" y1="150" x2="340" y2="40" stroke="rgba(255,255,255,0.02)" strokeDasharray="4" />
                  </svg>

                  {/* Pin Dot 1 */}
                  <button
                    onMouseEnter={() => setSelectedHeatzone('zone_1')}
                    onMouseLeave={() => setSelectedHeatzone(null)}
                    className="absolute top-1/4 left-1/3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse shadow-lg cursor-pointer transition-transform duration-250 hover:scale-125"
                  />
                  {/* Pin Dot 2 */}
                  <button
                    onMouseEnter={() => setSelectedHeatzone('zone_2')}
                    onMouseLeave={() => setSelectedHeatzone(null)}
                    className="absolute top-1/2 left-2/3 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white animate-pulse shadow-lg cursor-pointer transition-transform duration-250 hover:scale-125"
                  />
                  {/* Pin Dot 3 */}
                  <button
                    onMouseEnter={() => setSelectedHeatzone('zone_3')}
                    onMouseLeave={() => setSelectedHeatzone(null)}
                    className="absolute top-2/3 left-1/4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white animate-pulse shadow-lg cursor-pointer transition-transform duration-250 hover:scale-125"
                  />

                  {/* Active Tooltip Popover */}
                  <AnimatePresence>
                    {selectedHeatzone && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="absolute bottom-4 left-4 bg-slate-900 border border-slate-750 px-4 py-3 rounded-xl text-left shadow-2xl w-60 text-xs font-sans font-medium text-slate-100"
                      >
                        {selectedHeatzone === 'zone_1' && (
                          <>
                            <h5 className="font-extrabold text-emerald-400">Greater Accra Regional Sector</h5>
                            <ul className="space-y-1 mt-1 font-mono text-[10.5px]">
                              <li>• Operational Schools: **48 Nodes**</li>
                              <li>• Academic Benchmark: **84.5% avg**</li>
                              <li>• Daily Attendance Rating: **94.8%**</li>
                              <li>• Infrastructure Health: **Excellent**</li>
                            </ul>
                          </>
                        )}
                        {selectedHeatzone === 'zone_2' && (
                          <>
                            <h5 className="font-extrabold text-yellow-400">Ashanti Regional Sector</h5>
                            <ul className="space-y-1 mt-1 font-mono text-[10.5px]">
                              <li>• Operational Schools: **32 Nodes**</li>
                              <li>• Academic Benchmark: **79.2% avg**</li>
                              <li>• Daily Attendance Rating: **91.4%**</li>
                              <li>• Infrastructure Health: **Stable**</li>
                            </ul>
                          </>
                        )}
                        {selectedHeatzone === 'zone_3' && (
                          <>
                            <h5 className="font-extrabold text-blue-400">Western Coastline District</h5>
                            <ul className="space-y-1 mt-1 font-mono text-[10.5px]">
                              <li>• Operational Schools: **12 Nodes**</li>
                              <li>• Academic Benchmark: **77.6% avg**</li>
                              <li>• Daily Attendance Rating: **89.3%**</li>
                              <li>• Infrastructure Health: **Active Audit**</li>
                            </ul>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-[10px] text-slate-400">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Optimal Range (&gt;80%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Caution Range (70-80%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Diagnostic Review (&lt;70%)</span>
                  </div>
                  <span className="font-mono text-cyan-400 text-xs font-black">GIS-MAPPED CORRELATOR ACTIVATED</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 3: BUSINESS INTELLIGENCE & DATA WAREHOUSE */}
        {activeSubTab === 'bi' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Header Title section */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800">EduCore Intelligence Center & Data Warehouse</h3>
                  <p className="text-xs text-slate-500">Run predictive algorithms, forecast macro student trends, and issue automated warnings.</p>
                </div>

                {/* Warehouse queries template downloads */}
                <div className="flex gap-2">
                  <button
                    onClick={() => showToast("Exported Central Ministry Research dossier (Excel/CSV format).")}
                    className="px-3.5 py-2 hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold cursor-pointer transition-all flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV Dataset
                  </button>
                  <button
                    onClick={() => showToast("Prepared strategic 5-Year Planning report in PDF format.")}
                    className="px-3.5 py-2 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Strategic Planning Report
                  </button>
                </div>
              </div>

              {/* BI Analytics Categories selector */}
              <div className="flex border-b border-slate-150 select-none pb-0.5 gap-2 overflow-x-auto text-xs font-extrabold">
                {(['Academic', 'Financial', 'Operational', 'Teacher', 'Student', 'AI'] as const).map(bt => {
                  const isSelected = biTab === bt;
                  return (
                    <button
                      key={bt}
                      onClick={() => setBiTab(bt)}
                      className={`pb-2.5 px-3 whitespace-nowrap cursor-pointer transition-all relative ${
                        isSelected ? 'text-[#1A56DB]' : 'text-slate-400 hover:text-slate-800'
                      }`}
                    >
                      {bt} Intelligence
                      {isSelected && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1A56DB] rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Forecast graph and Predictive Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Simulated Chart Plot Area */}
                <div className="lg:col-span-2 bg-[#0E1E2F] text-white p-6 rounded-2xl space-y-4 border border-slate-800">
                  <div className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <span className="text-[10px] text-sky-400 font-mono font-bold uppercase tracking-wider">Predictive Trend Charting</span>
                      <h4 className="text-sm font-extrabold">{biTab} Intelligence Long-Term Projection Map</h4>
                    </div>
                    {/* Interactive Year Selector */}
                    <div className="space-y-1 text-right">
                      <span className="text-[9px] text-slate-400 font-mono block">Forecast Target:</span>
                      <select
                        value={predictiveYear}
                        onChange={e => setPredictiveYear(parseInt(e.target.value))}
                        className="px-2 py-1 text-[10px] border border-slate-700 bg-slate-800 text-white font-mono rounded-lg outline-none font-bold"
                      >
                        <option value={2026}>Current (2026)</option>
                        <option value={2027}>Term +1 (2027)</option>
                        <option value={2028}>Target Peak (2028)</option>
                        <option value={2029}>(2029)</option>
                        <option value={2030}>Macro Cap (2030)</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom SVG line chart projection */}
                  <div className="relative h-48 flex items-end">
                    <div className="absolute inset-x-0 bottom-0 top-6 border-b border-slate-800 flex flex-col justify-between text-[9px] font-mono text-slate-500">
                      <div>Goal line</div>
                      <div>Optimal target</div>
                      <div>Baseline</div>
                    </div>

                    <svg viewBox="0 0 500 150" className="w-full h-full relative z-10 text-blue-500">
                      {/* Trendline mapping based on biTab */}
                      {biTab === 'Academic' && (
                        <path d="M0,110 Q100,90 200,60 T350,45 T500,20" fill="none" stroke="currentColor" strokeWidth="3" />
                      )}
                      {biTab === 'Financial' && (
                        <path d="M0,130 Q100,105 200,75 T350,35 T500,15" fill="none" stroke="#10B981" strokeWidth="3" />
                      )}
                      {biTab === 'Operational' && (
                        <path d="M0,90 Q100,85 200,80 T350,70 T500,65" fill="none" stroke="#F59E0B" strokeWidth="3" />
                      )}
                      {biTab === 'Teacher' && (
                        <path d="M0,100 Q100,80 200,70 T350,60 T500,55" fill="none" stroke="#EC4899" strokeWidth="3" />
                      )}
                      {biTab === 'Student' && (
                        <path d="M0,120 Q100,95 200,70 T350,55 T500,30" fill="none" stroke="#6366F1" strokeWidth="3" />
                      )}
                      {biTab === 'AI' && (
                        <path d="M0,140 Q100,110 200,75 T350,40 T500,8" fill="none" stroke="#8B5CF6" strokeWidth="3" />
                      )}

                      {/* Accent highlight circles */}
                      <circle cx="200" cy="75" r="5" fill="#ffffff" />
                      <circle cx="500" cy="20" r="5" fill="#1A56DB" />
                    </svg>

                    {/* Timeline captions */}
                    <div className="absolute inset-x-0 -bottom-1.5 flex justify-between font-mono text-[9px] text-slate-500">
                      <span>2024</span>
                      <span>2026 (Now)</span>
                      <span>2028 (Peak Projected)</span>
                      <span>{predictiveYear} Target</span>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
                    <span className="font-bold text-amber-500 font-mono">FORECAST STATS:</span> Based on historical regression algorithms, aggregate {biTab} parameters are predicted to elevate by **{biTab === 'AI' ? '+140% velocity' : '+28.4%'}** before the final {predictiveYear} terminal cycle.
                  </div>
                </div>

                {/* Smart Executive Insights Panel */}
                <div className="lg:col-span-1 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-rose-700 font-extrabold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Ecosystem Strategic Warning System</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="p-3 bg-red-50 border border-red-150 rounded-xl space-y-1">
                        <h5 className="font-extrabold text-red-900 text-xs">DIAGNOSTIC CRITICAL RISK</h5>
                        <p className="text-[11px] text-slate-600 font-medium">
                          "Ashanti Division school registers indicate a **4.5% downward trend** in exam grading velocity over 18 weeks. Recommending supplementary lesson plans intervention."
                        </p>
                      </div>

                      <div className="p-3 bg-amber-50 border border-amber-150 rounded-xl space-y-1">
                        <h5 className="font-extrabold text-amber-900 text-xs font-sans">OPERATIONAL EFFICIENCY ALERTV</h5>
                        <p className="text-[11px] text-slate-600 font-medium font-sans">
                          "Classroom teacher-student rosters exceed healthy 1:35 threshold limits in Eastern diocese branches by Friday term cycles. Action required: dispatch student instructors."
                        </p>
                      </div>

                      <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1 animate-pulse">
                        <h5 className="font-extrabold text-emerald-950 text-xs">OPTIMAL DEPLOYMENT INSIGHT</h5>
                        <p className="text-[11px] text-slate-600 font-medium">
                          "Cumulative billing collection realizes **98.2% settlement** efficiency. Capital reserves sufficient for regional server-load balancing deployments."
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                        const timestamp = new Date().toLocaleTimeString();
                        showToast(`Initiated automated telemetry corrective task! [${timestamp}]`);
                    }}
                    className="w-full mt-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
                  >
                     Automate Corrective Directives
                  </button>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* SUBTAB 4: LMS CORES & ONLINE COMPUTER-BASED TESTING (CBT) */}
        {activeSubTab === 'lms' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
            
            {/* LMS ONLINE COURSES & LIVE STREAM PORTAL */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-blue-600 font-mono font-bold uppercase tracking-wider">EduCore LMS Suite</span>
                  <h3 className="text-base font-extrabold text-slate-900">Virtual Learning Courses catalog</h3>
                </div>
                <span className="text-[10px] bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full text-emerald-700 font-bold uppercase tracking-wider">
                  Live Streaming Active
                </span>
              </div>

              {/* Course items selector */}
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'course_1', title: 'Principles of Physics II', sessions: '12 lectures', mentor: 'Dr. Evelyn S.' },
                  { id: 'course_2', title: 'Interactive Quizzes & Stats', sessions: '8 sections', mentor: 'Prof. Markson' },
                  { id: 'course_3', title: 'Generative AI Topologies', sessions: '15 modules', mentor: 'EduCore AI' }
                ].map(c => {
                  const active = selectedCourse === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourse(c.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                        active ? 'border-blue-600 bg-blue-50/10' : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <h4 className="text-xs font-extrabold leading-tight line-clamp-2 text-slate-800">{c.title}</h4>
                      <div className="text-[10px] text-slate-500 font-medium">
                        <div>{c.sessions}</div>
                        <div className="text-blue-600 font-semibold">{c.mentor}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Virtual Classroom media simulator */}
              <div className="bg-[#05111E] rounded-2xl border border-slate-800 p-4.5 aspect-video flex flex-col justify-between text-white relative overflow-hidden shadow-inner">
                {isPlayingLecture ? (
                  <>
                    {/* Simulated stream video backdrop animation */}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-0">
                      <div className="space-y-3 text-center">
                        <div className="w-12 h-12 rounded-full border-2 border-t-2 border-blue-500 animate-spin mx-auto" />
                        <p className="text-xs font-mono text-sky-400">CONNECTING TO EDUCORE TRANSIT CDN DAEMON...</p>
                        <span className="text-[10px] text-slate-450 block font-mono">Broadcasting Kinematics Principles Live stream Feed - 250 students connected</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-start select-none">
                      <span className="text-[9px] font-mono bg-red-600 text-white font-bold p-1 rounded-sm uppercase tracking-wider">LIVE RECORDED FEED</span>
                      <span className="text-[10px] font-mono/50 text-slate-400">Dr. Evelyn S. Kinematics Lecture</span>
                    </div>

                    <div className="self-center z-10">
                      <button
                        onClick={() => {
                          setIsPlayingLecture(true);
                          setTimeout(() => setIsPlayingLecture(false), 6000);
                        }}
                        className="w-16 h-16 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-white cursor-pointer shadow-lg outline-none"
                      >
                        <Play className="w-8 h-8 fill-current ml-1" />
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-300 font-mono">
                      <span>Course Module Progress: 75% Achieved</span>
                      <span>H.264 encrypted stream node range</span>
                    </div>
                  </>
                )}
              </div>

              {/* Course Certificates & Downloads */}
              <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs select-none">
                <div className="space-y-0.5">
                  <p className="font-extrabold text-slate-800">Ready for syllabus evaluation?</p>
                  <p className="text-[10px] text-slate-450">Complete quizzes and download authenticated certificates.</p>
                </div>
                <button
                  onClick={() => showToast("Success! Generated authenticated digital certificate code. Ready to print.")}
                  className="px-4.5 py-2 hover:bg-[#1A56DB] hover:text-white border border-[#1A56DB] text-[#1A56DB] text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  Retrieve Graduation Diploma
                </button>
              </div>
            </div>

            {/* TIMED COMPUTER-BASED TESTING (CBT) INTERACTIVE EXAMS PANEL */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-mono">
                      CBT Examinations Board
                    </span>
                    <h3 className="text-base font-extrabold text-slate-900">National Proctored CBT Simulator</h3>
                  </div>
                  {quizActive && (
                    <div className="flex items-center gap-1.5 font-mono text-xs font-black text-red-600 animate-pulse select-none">
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>{quizTimer} seconds leftover</span>
                    </div>
                  )}
                </div>

                {!quizActive ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto text-purple-600 border border-purple-100">
                      <Tv className="w-9 h-9" />
                    </div>
                    <div>
                      <h4 className="font-sans font-extrabold text-slate-800 text-sm">Computer-Based Testing (CBT) is Standby</h4>
                      <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed mt-1">
                        Start testing simulated Kinematics questions. AI eye-tracker, background tab checking, and randomized proctor workflows are active.
                      </p>
                    </div>

                    <button
                      onClick={handleTriggerQuiz}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all shadow-md"
                    >
                      Initialize Simulated Kinematics CBT
                    </button>

                    {quizScore !== null && (
                      <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl max-w-xs mx-auto">
                        <div className="text-sm font-extrabold text-emerald-950">Active Result: {quizScore}% Index</div>
                        <p className="text-[10px] text-slate-555 leading-relaxed font-mono">
                          Auto-marked instantly. Passed the National Scale Benchmark requirement.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5 py-4 select-text">
                    
                    {/* CBT Alert banners */}
                    <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl space-y-1 select-none">
                      <div className="text-rose-900 font-extrabold text-[10.5px] uppercase tracking-wide flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 animate-pulse" />
                        <span>STANDBY PROCTOR INTEGRITY SERVICES ONLINE</span>
                      </div>
                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed font-sans">
                        EduCore's proctor security validates tab switches, secondary voices, and screen captures. Do not navigate away from this active computer frame.
                      </p>
                    </div>

                    {/* Question Unit 1 */}
                    <div className="space-y-2.5">
                      <h5 className="font-extrabold text-slate-900 text-xs">
                        Question 1: What represents the derivative of displacement with respect to time bounds?
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 1, label: 'A) Instantaneous Velocity' },
                          { key: 2, label: 'B) Acceleration Vectors' },
                          { key: 3, label: 'C) Kinetic Force Limits' },
                          { key: 4, label: 'D) Centrifugal Displacement' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, 1: opt.key }))}
                            className={`p-3 rounded-xl border text-left cursor-pointer text-xs font-medium transition-all ${
                              selectedAnswers[1] === opt.key 
                                ? 'border-[#1A56DB] bg-blue-50/15 font-bold text-blue-900' 
                                : 'border-slate-205 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Unit 2 */}
                    <div className="space-y-2.5">
                      <h5 className="font-extrabold text-slate-900 text-xs">
                        Question 2: Under constant friction coefficient, how does velocity vectors respond to mass parameters?
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { key: 1, label: 'A) Varies directly squared' },
                          { key: 2, label: 'B) Indifferent of mass parameter' },
                          { key: 3, label: 'C) Logarithm decay indexes' },
                          { key: 4, label: 'D) Inverse proportional ratio' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => setSelectedAnswers(prev => ({ ...prev, 2: opt.key }))}
                            className={`p-3 rounded-xl border text-left cursor-pointer text-xs font-medium transition-all ${
                              selectedAnswers[2] === opt.key 
                                ? 'border-[#1A56DB] bg-blue-50/15 font-bold text-blue-900' 
                                : 'border-slate-205 hover:bg-slate-50'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleCompleteQuiz}
                      className="w-full mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4" /> Submit Answers & Terminate exam session
                    </button>
                  </div>
                )}
              </div>

              {/* Real-time telemetry log checks */}
              {quizActive && cbtProctorAlerts.length > 0 && (
                <div className="mt-4 p-3 bg-slate-900 rounded-xl text-[10.5px] font-mono text-rose-450 border border-rose-950/40 space-y-1 select-none">
                  <div className="font-bold text-amber-500 uppercase">AI Security Proctored violations logs:</div>
                  <div className="max-h-[85px] overflow-y-auto space-y-1">
                    {cbtProctorAlerts.map((alt, i) => (
                      <div key={i}>{alt}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* SUBTAB 5: DIGITAL ADM/WEBSITES, ANCILLARIES */}
        {activeSubTab === 'admin' && (
          <div className="space-y-6">
            
            {/* Built-In website builder & portal generator */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-800">Built-in Public Website Builder & generator</h3>
                  <p className="text-xs text-slate-450">Design, customize mottos, and publish circular notices directly to official endpoints.</p>
                </div>
                <button
                  onClick={() => setShowWebsiteBuilder(!showWebsiteBuilder)}
                  className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer transition-all"
                >
                  {showWebsiteBuilder ? 'Close Live Website Panel' : 'Trigger Website Generator Preview'}
                </button>
              </div>

              {showWebsiteBuilder && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-200">
                  {/* Left branding layout controls */}
                  <div className="lg:col-span-1 space-y-4 text-xs font-sans">
                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">Customizer Dashboard</h4>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Select Theme Skins</label>
                        <select
                          value={websiteTheme}
                          onChange={e => setWebsiteTheme(e.target.value as any)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none cursor-pointer bg-slate-50"
                        >
                          <option value="classic">Classic Navy Royal</option>
                          <option value="emerald">Emerald Forest Crest</option>
                          <option value="gold">Sovereign Golden Royal</option>
                          <option value="cyber">Cyber tech modern</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Unique School Motto</label>
                        <input
                          type="text"
                          value={websiteMotto}
                          onChange={e => setWebsiteMotto(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Official Phone Contact</label>
                        <input
                          type="text"
                          value={websitePhone}
                          onChange={e => setWebsitePhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Active Admission Announcements</label>
                        <textarea
                          rows={2}
                          value={admissionNotice}
                          onChange={e => setAdmissionNotice(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Website Public Portal live mockup iframe view */}
                  <div className="lg:col-span-2 border border-slate-205 rounded-2xl overflow-hidden shadow-md flex flex-col font-sans select-none">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-white text-[10px] font-mono">
                      <span>Public Endpoints URL: https://crest-academy.educore.edu</span>
                      <span className="text-[#10B981] font-bold">● Live Portal Online</span>
                    </div>

                    <div className={`p-6 space-y-4 flex-1 ${
                      websiteTheme === 'emerald' ? 'bg-emerald-950/10 border-l-4 border-emerald-600' :
                      websiteTheme === 'gold' ? 'bg-amber-950/10 border-l-4 border-amber-500' :
                      websiteTheme === 'cyber' ? 'bg-indigo-950/10 border-l-4 border-indigo-600' :
                      'bg-blue-950/10 border-l-4 border-blue-600'
                    }`}>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Building2 className={`w-6 h-6 ${
                            websiteTheme === 'emerald' ? 'text-emerald-700' :
                            websiteTheme === 'gold' ? 'text-amber-600' :
                            websiteTheme === 'cyber' ? 'text-indigo-600' :
                            'text-blue-700'
                          }`} />
                          <h4 className="text-base font-extrabold text-slate-900">Central Crest High College</h4>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-slate-400">Phone: {websitePhone}</span>
                      </div>

                      <div className="space-y-1 py-2">
                        <p className="text-lg font-black tracking-tight text-slate-850">
                          {websiteMotto}
                        </p>
                        <p className="text-xs text-slate-500 font-semibold max-w-md">
                          Deploying modern cognitive learning pipelines as our primary standard.
                        </p>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-150 rounded-xl space-y-1">
                        <div className="text-[9px] font-mono font-black text-rose-600 uppercase tracking-widest">
                          ★ Bulletins Noticeboard
                        </div>
                        <p className="text-xs text-slate-700 font-bold">
                          {admissionNotice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Application Admissions, Library, Hostel, Transport, clinic portfolios, doc controller */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Admissions review ledger */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" /> Admissions ledger ({admissions.length})
                  </h4>
                  <select
                    value={admFilter}
                    onChange={e => setAdmFilter(e.target.value as any)}
                    className="px-1.5 py-0.5 text-[9.5px] border border-slate-200 bg-white rounded outline-none cursor-pointer"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                  </select>
                </div>

                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {admissions.filter(a => admFilter === 'All' || a.status === admFilter).map(adm => {
                    const isS = selectedApplicant === adm.id;
                    return (
                      <div
                        key={adm.id}
                        onClick={() => setSelectedApplicant(adm.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all space-y-1.5 ${
                          isS ? 'border-blue-600 bg-blue-50/15' : 'border-slate-150 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="font-bold text-slate-900">{adm.applicantName}</span>
                          <span className={`px-1.5 py-0.2 rounded-full font-black uppercase text-[8.5px] ${
                            adm.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            adm.status === 'Pending' ? 'bg-yellow-50 text-yellow-705' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {adm.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono flex justify-between">
                          <span>Target: {adm.targetClass}</span>
                          <span>{adm.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedApplicant && (
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 select-none text-[10px]">
                    <div className="font-extrabold text-[#1A56DB]">Review action checklist:</div>
                    <p className="text-[10px] text-slate-500 leading-tight">Validate parent upload birth certificate dossier.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const next = admissions.map(a => a.id === selectedApplicant ? { ...a, status: 'Approved' } : a);
                          setAdmissions(next as any);
                          showToast("Admission request cleared! Letter of acceptance generated.");
                        }}
                        className="px-2.5 py-1 bg-emerald-600 text-white rounded font-bold cursor-pointer hover:bg-emerald-700"
                      >
                        Approve Letter
                      </button>
                      <button
                        onClick={() => setSelectedApplicant(null)}
                        className="px-2.5 py-1 border border-slate-200 rounded text-slate-655 bg-white cursor-pointer"
                      >
                        Clear select
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Alumni Networks & Donations trackers */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-purple-600" /> Alumni tracking ledger
                  </h4>
                  <span className="text-[10px] font-mono font-bold text-[#1A56DB]">Est 340 graduates synced</span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto font-mono text-[10px]">
                  {alumniRecords.map(alm => (
                    <div key={alm.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1.5 hover:bg-slate-100/50">
                      <div className="flex justify-between items-start">
                        <span className="font-extrabold text-slate-800">{alm.fullName}</span>
                        <span className="text-slate-400 font-bold">Class of {alm.graduationYear}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Career Field: {alm.industry}</span>
                        <span className="text-emerald-700 font-extrabold">Donations Tally: ${alm.contributionUSD}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast("Filing next official Alumni Reunion event notice for 2026 cycles.")}
                  className="w-full py-2 bg-slate-900 text-slate-100 hover:bg-slate-800 text-[11px] font-extrabold rounded-xl cursor-pointer"
                >
                  Create Reunion Event Bulletin
                </button>
              </div>

              {/* DMS Version Control Folder policies */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2 select-none">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" /> DMS & Version controllers
                  </h4>
                  <span className="text-[10px] font-mono/80 text-amber-600 font-bold border border-amber-100 bg-amber-50 px-1.5 rounded">
                    GitOps Versioning
                  </span>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto font-mono text-[10.5px]">
                  {documents.map(dc => (
                    <div key={dc.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 hover:bg-slate-100/50">
                      <div className="flex justify-between">
                        <span className="font-extrabold text-slate-800 tracking-tight leading-snug line-clamp-1">{dc.title}</span>
                        <span className="text-[9px] px-1 bg-slate-200 rounded font-black">v{dc.currentVersion}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400">Section: {dc.module} • Dated {dc.updatedAt}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dc.approvals.map((ap, i) => (
                          <span key={i} className="text-[8.5px] font-bold text-slate-500 bg-slate-100 px-1 rounded flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-600" /> {ap}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => showToast("Opening Document Vault folder. Approvals required for 1 draft.")}
                  className="w-full py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 text-[11px] font-bold rounded-xl cursor-pointer"
                >
                  Retrieve Document Vault Folder
                </button>
              </div>

            </div>

            {/* Secondary Ancillaries list: library catalog, hostels map, transport drivers and clinic visiting */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 select-none font-mono text-[10.5px]">
              
              {/* Library list index */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 col-span-1">
                <h5 className="font-extrabold uppercase text-slate-700 flex items-center gap-1.5"><LibraryIcon className="w-4 h-4" /> Library ledger</h5>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {libraryBooks.map(b => (
                    <div key={b.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <span className="font-bold text-slate-800 leading-tight block truncate">{b.title}</span>
                      <div className="text-[9.5px] text-slate-400 mt-0.5">Borrowed: {b.borrowed} / {b.quantity} copies</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hostels occupancy matrix */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 col-span-1 border-slate-200">
                <h5 className="font-extrabold uppercase text-slate-700 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Hostel administration</h5>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {hostelRooms.map(rm => (
                    <div key={rm.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-850 block">{rm.id}</span>
                        <span className="text-[9px] text-slate-400">{rm.bloc}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded font-black ${rm.allocated === rm.beds ? 'bg-red-50 text-red-650' : 'bg-blue-50 text-blue-650'}`}>
                        {rm.allocated}/{rm.beds} Beds
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transport systems route vectors */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 col-span-1">
                <h5 className="font-extrabold uppercase text-slate-700 flex items-center gap-1.5"><Truck className="w-4 h-4" /> Transport & Bus routes</h5>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {transportRoutes.map(rt => (
                    <div key={rt.id} className="p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex justify-between font-bold">
                        <span>{rt.name}</span>
                        <span className="text-[9px] text-emerald-600">{rt.status}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-400 mt-1">Bus: {rt.busNo} • Driver: {rt.driver} • {rt.students} active roster</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Health Clinic records visits logs */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 col-span-1 border-slate-200">
                <h5 className="font-extrabold uppercase text-slate-700 flex items-center gap-1.5"><Heart className="w-4 h-4 text-red-600" /> Clinic visitor records</h5>
                <div className="space-y-2 max-h-[180px] overflow-y-auto">
                  {clinicalVisits.map(cl => (
                    <div key={cl.id} className="p-2 bg-slate-50 border border-slate-101 rounded-lg space-y-0.5">
                      <div className="flex justify-between font-bold">
                        <span>{cl.studentName}</span>
                        <span className="text-slate-405">{cl.time}</span>
                      </div>
                      <div className="text-[9px] text-rose-650 font-semibold">{cl.complaint}</div>
                      <div className="text-[9.5px] text-slate-400">Current state: {cl.status}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* SUBTAB 6: MOBILE APPLICATION ECOSYSTEM & SIMULATOR */}
        {activeSubTab === 'mobile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            
            {/* Left settings parameters selection */}
            <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Mobile Applications ecosystem</h3>
                <p className="text-xs text-slate-500">Preview cross-platform native interfaces for different administrative profiles.</p>
              </div>

              {/* Mobile personas selector */}
              <div className="space-y-3 select-none">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Select Active Persona Preview</span>
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'Student', label: 'Student Mobile Companion', icon: GraduationCap },
                    { id: 'Parent', label: 'Parent Portal App', icon: Users },
                    { id: 'Teacher', label: 'Teacher attendance Manager', icon: UserCheck },
                    { id: 'SchoolHead', label: 'School Admin Executive', icon: Building2 }
                  ].map(pers => {
                    const active = mobilePersona === pers.id;
                    const Icon = pers.icon;
                    return (
                      <button
                        key={pers.id}
                        type="button"
                        onClick={() => setMobilePersona(pers.id as any)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl cursor-pointer text-left transition-all border ${
                          active 
                            ? 'bg-blue-600 text-white border-transparent' 
                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-205'
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        <span>{pers.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulate triggers inside phone */}
              <div className="space-y-3.5 pt-4 border-t border-slate-150">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Simulate Push Notifications Alerts</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleSimulatePushNotification("Terminal results Published!", "Your child's final report cards are validated.")}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 cursor-pointer"
                  >
                    Grade Sheet Release
                  </button>
                  <button
                    onClick={() => handleSimulatePushNotification("Attendance Alert Warning", "Student Liam has been logged absent.")}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 cursor-pointer"
                  >
                    Absence Notification
                  </button>
                  <button
                    onClick={() => handleSimulatePushNotification("Fees invoice reminder", "Monthly tuition balances due by standard clearing.")}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 cursor-pointer"
                  >
                    Financial Invoice
                  </button>
                  <button
                    onClick={() => handleSimulatePushNotification("Emergency Announcement", "Ecosystem server load balances complete.")}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-150 border border-slate-200 rounded-lg text-[10.5px] font-bold text-slate-700 cursor-pointer"
                  >
                    Public Broadcast
                  </button>
                </div>
              </div>

              {/* Offline Sync Switches */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between select-none">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-bold text-slate-800">Standard Offline Sync Cache</span>
                  <p className="text-[9.5px] text-slate-455">Pre-buffer active rosters local storage db</p>
                </div>
                <button
                  onClick={() => {
                    setMobileOfflineMode(!mobileOfflineMode);
                    showToast(mobileOfflineMode ? "Unified Mobile Simulator reconnected online!" : "Unified Mobile Simulator switched to Offline-First cached index database Mode.");
                  }}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 cursor-pointer ${mobileOfflineMode ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${mobileOfflineMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

            </div>

            {/* Middle Phone Simulator Frame Mockup */}
            <div className="lg:col-span-2 flex justify-center p-2 relative">
              
              {/* Actual structured phone border frame */}
              <div className="w-[310px] h-[610px] bg-slate-900 rounded-[40px] border-[12px] border-slate-850 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                
                {/* Phone Speaker Notch bar */}
                <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-50 flex justify-center items-start">
                  <div className="w-24 h-4.5 bg-slate-900 rounded-b-xl flex justify-between px-3 items-center text-[8.5px] text-slate-400 font-mono font-bold leading-none select-none">
                    <span>09:41</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    <div className="flex gap-1">
                      <span>4G</span>
                      <span className={mobileOfflineMode ? 'text-red-500' : 'text-emerald-555'}>{mobileOfflineMode ? '📴' : '📶'}</span>
                    </div>
                  </div>
                </div>

                {/* Display Body Canvas */}
                <div className="flex-1 bg-slate-100 flex flex-col justify-between relative pt-8 font-sans scrollbar-none">
                  
                  {/* Absolute Simulated Push Notification banner */}
                  <AnimatePresence>
                    {pushNotificationSimState && (
                      <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        className="absolute top-2.5 inset-x-2.5 bg-slate-900/95 text-white p-3 rounded-xl shadow-2xl z-50 select-none text-[10.5px] font-sans border border-slate-800 flex items-start gap-2"
                      >
                        <BellRing className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
                        <div>
                          <p className="font-extrabold text-white text-[10.5px] leading-tight flex justify-between items-center w-full">
                            <span>EduCore Notification Alert</span>
                            <span className="text-[8.5px] text-slate-450 font-normal">now</span>
                          </p>
                          <p className="text-[10px] text-slate-300 mt-1">{pushNotificationSimState}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Persona-specific client-screens inner render maps */}
                  <div className="flex-1 overflow-y-auto px-4.5 py-3 space-y-4 pt-4 text-xs select-none">
                    
                    {/* Parent App Screen */}
                    {mobilePersona === 'Parent' && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-extrabold text-slate-900">Parent Dashboard</h4>
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-bold p-1 rounded font-mono">TID: PARENT_09</span>
                        </div>

                        {/* Financial outstanding clearances */}
                        <div className="bg-white p-3 rounded-xl border border-slate-201 text-xs text-left relative space-y-2">
                          <p className="text-[9px] text-slate-400 uppercase font-black font-mono"> Tuitions & Laboratory Invoice</p>
                          <div className="flex justify-between items-center pt-0.5">
                            <span className="font-extrabold text-slate-800 text-sm">$120.00 Due</span>
                            <span className="text-[9.5px] text-slate-400">First Term</span>
                          </div>
                          <button
                            onClick={() => showToast(" tuition invoice cleared instantly using standard credit-clearing payment node.")}
                            className="w-full py-1.5 bg-emerald-600 font-extrabold text-[10px] hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                          >
                            Pay Cleared Tuition Instantly
                          </button>
                        </div>

                        {/* School Announcements summaries */}
                        <div className="bg-white p-3 rounded-xl border border-slate-205 space-y-1 text-[10.5px]">
                          <span className="font-extrabold text-slate-800 leading-tight">National Scale Holiday tomorrow.</span>
                          <p className="text-[9.5px] text-slate-450 leading-relaxed">
                            Following centralized directive, academic clusters standby. Local micro-node databases synced.
                          </p>
                        </div>

                        {/* Student assignments list checklist */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Child Assignments Progress</span>
                          {[
                            { id: 1, title: 'Calculus Vol II HW', done: true },
                            { id: 2, title: 'Interactive Kinematics Quiz', done: false },
                          ].map(as => (
                            <div key={as.id} className="bg-white p-2.5 rounded-lg flex items-center justify-between text-[11px] border border-slate-150">
                              <span className="font-extrabold text-slate-700">{as.title}</span>
                              <span className={as.done ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>{as.done ? '✔ Compiled' : '⏳ Pending'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Teacher Mobile Attendance and log actions */}
                    {mobilePersona === 'Teacher' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-extrabold text-slate-900">Teacher workspace</h4>
                          <span className="text-[9px] bg-purple-100 text-purple-700 font-bold p-1 rounded font-mono">STAFF-90</span>
                        </div>

                        {/* One click attendance compiler */}
                        <div className="bg-white p-4.5 rounded-xl border border-slate-205 space-y-3.5">
                          <div className="space-y-1">
                            <h5 className="font-extrabold text-slate-805">Roster Attendance recording</h5>
                            <p className="text-[9.5px] text-slate-450">Complete daily attendance logs on-the-fly offline.</p>
                          </div>

                          <div className="space-y-2">
                            {[
                              { id: 'st_1', name: 'Kwesi Appiah', present: true },
                              { id: 'st_2', name: 'Liam Harrison', present: true },
                              { id: 'st_3', name: 'Fatoumata Fall', present: false }
                            ].map(stu => (
                              <div key={stu.id} className="flex justify-between items-center p-2.5 border border-slate-150 rounded-lg">
                                <span className="font-bold text-slate-800">{stu.name}</span>
                                <span className={`px-1.5 py-0.2 rounded font-black uppercase text-[8.5px] ${
                                  stu.present ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                }`}>
                                  {stu.present ? 'Present' : 'Absent'}
                                </span>
                              </div>
                            ))}
                          </div>

                          <button
                            onClick={() => showToast("Consolidated micro-school daily classroom attendance logs successfully.")}
                            className="w-full py-2 bg-blue-600 text-white font-extrabold hover:bg-blue-700 rounded-xl cursor-pointer"
                          >
                            Synchronize Attendance Ledger
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Student mobile portal: Learning copilot, curriculum index paths */}
                    {mobilePersona === 'Student' && (
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-extrabold text-slate-900">My Mobile Portal</h4>
                          <span className="text-[9px] bg-indigo-100 text-indigo-700 font-bold p-1 rounded font-mono">STU_001</span>
                        </div>

                        {/* Micro student performance indicator */}
                        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-850 text-left flex justify-between items-center">
                          <div>
                            <span className="text-[8px] text-indigo-400 font-bold block uppercase font-mono">Academic Score Tally</span>
                            <span className="text-lg font-black font-mono">84.5%</span>
                          </div>
                          <div>
                            <span className="text-[8px] text-indigo-400 font-bold block uppercase font-mono">Course Completion</span>
                            <span className="text-xs font-black font-mono">Semester Term Progress: 75%</span>
                          </div>
                        </div>

                        {/* Interactive AI Study Assistant Copilot chat client inside phone */}
                        <div className="bg-white rounded-xl border border-slate-205 flex flex-col justify-between h-[250px] overflow-hidden">
                          <div className="bg-[#0A1E33] px-3 py-2 text-white font-bold font-sans text-[10px] flex items-center justify-between">
                            <span>EduCore AI Copilot Assistant</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                          </div>

                          {/* Chat logs feed */}
                          <div className="flex-grow p-2.5 overflow-y-auto space-y-2 max-h-[160px]">
                            {mobileAIChatLog.map((log, i) => (
                              <div key={i} className={`p-2 rounded-xl text-[10.5px] max-w-[90%] leading-relaxed ${
                                log.role === 'ai' ? 'bg-indigo-50 border border-indigo-105 text-indigo-950 font-sans' : 'bg-slate-100 text-slate-805 ml-auto'
                              }`}>
                                {log.text}
                              </div>
                            ))}
                          </div>

                          {/* Chat sender inputs */}
                          <form onSubmit={handleMobileAIChatSubmit} className="p-2 border-t border-slate-151 flex gap-1.5 bg-slate-50/50">
                            <input
                              type="text"
                              required
                              value={mobileAIChatMessage}
                              onChange={e => setMobileAIChatMessage(e.target.value)}
                              placeholder="Ask AI study copilot..."
                              className="flex-1 px-2.5 py-1.5 text-[10px] border border-slate-200 bg-white rounded-lg outline-none"
                            />
                            <button
                              type="submit"
                              className="p-1 px-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg cursor-pointer flex items-center justify-center font-bold text-[10px]"
                            >
                              Send
                            </button>
                          </form>
                        </div>
                      </div>
                    )}

                    {/* School Head App: National announcements, reviewing activity, KPI sparklines */}
                    {mobilePersona === 'SchoolHead' && (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-extrabold text-slate-900">Executive metrics</h4>
                          <span className="text-[9px] bg-rose-100 text-rose-700 font-bold p-1 rounded font-mono">CORP-ADM</span>
                        </div>

                        {/* Global Tenant indexes oversight */}
                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-left space-y-1.5">
                          <span className="text-[10px] text-slate-400 font-mono block">Ecosystem Status Tally:</span>
                          <div className="flex justify-between font-mono font-bold text-slate-800 text-[11px]">
                            <span>Managed schools:</span>
                            <span className="text-blue-600">3 active nodes</span>
                          </div>
                          <div className="flex justify-between font-mono font-bold text-slate-800 text-[11px]">
                            <span>Tuition Cleared Realization:</span>
                            <span className="text-emerald-700">92.4%</span>
                          </div>
                        </div>

                        <div className="bg-[#0A1E33] text-white p-3.5 rounded-xl text-left border border-slate-800 space-y-1">
                          <span className="text-[9px] text-[#10B981] font-mono block">AUTOMATED DIAGNOSTIC METRIC:</span>
                          <p className="text-xs text-slate-300 leading-normal font-sans">
                            Central system node is executing on port 3000 securely. Standard data isolation checking is fully compiled. No micro-tenant warnings.
                          </p>
                        </div>
                      </div>
                    )}

                  </div>

                  {/* Phone Home visual swipe panel */}
                  <div className="h-4 bg-slate-100 flex items-center justify-center select-none pb-1">
                    <div className="w-24 h-1 bg-slate-300 rounded-full" />
                  </div>

                </div>

              </div>
            </div>

          </div>
        )}

        {/* SUBTAB 7: WHITE LABELLING & GLOBALIZATION Customizing */}
        {activeSubTab === 'white-label' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            
            {/* Setting Re branding variables input controls */}
            <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">SaaS White-Label Core customizer</h3>
                <p className="text-xs text-slate-500">Rebrand, re color, and configure regional translation gateways instantly.</p>
              </div>

              {/* Branding inputs */}
              <div className="space-y-4 text-xs font-sans">
                
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Custom Brand Name</label>
                  <input
                    type="text"
                    value={whiteLabelBrandName}
                    onChange={e => setWhiteLabelBrandName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Custom Vanity Domain Routing</label>
                  <input
                    type="text"
                    value={whiteLabelDomain}
                    onChange={e => setWhiteLabelDomain(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>

                {/* Primary theme color selectors */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Ecosystem Styling Accent Colors</label>
                  <div className="flex gap-2.5 select-none">
                    {[
                      { id: '#1A56DB', name: 'Classic Blue', bg: 'bg-[#1A56DB]' },
                      { id: '#059669', name: 'Forest Green', bg: 'bg-[#059669]' },
                      { id: '#7C3AED', name: 'Imperial Purple', bg: 'bg-[#7C3AED]' },
                      { id: '#E11D48', name: 'Crimson Velvet', bg: 'bg-[#E11D48]' },
                      { id: '#1E293B', name: 'Dark Slate Cyber', bg: 'bg-[#1E293B]' }
                    ].map(col => {
                      const active = whiteLabelThemeColor === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            setWhiteLabelThemeColor(col.id);
                            showToast(`Applied rebranding template style accent: ${col.name}`);
                          }}
                          className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform duration-200 ${col.bg} ${
                            active ? 'border-amber-400 scale-110 shadow-md' : 'border-transparent hover:scale-105'
                          }`}
                          title={col.name}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Globalization localization controls */}
                <div className="space-y-3.5 pt-4 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Globalization & Local Settings</span>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Translate Language:</label>
                      <select
                        value={selectedLanguage}
                        onChange={e => {
                          setSelectedLanguage(e.target.value as any);
                          showToast(`Ecosystem language translated to: ${e.target.value.toUpperCase()}`);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 cursor-pointer"
                      >
                        <option value="en">English (US/UK)</option>
                        <option value="fr">French (Français)</option>
                        <option value="de">German (Deutsch)</option>
                        <option value="es">Spanish (Español)</option>
                        <option value="sw">Swahili (Kiswahili)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-400 font-mono">Clearing Currency:</label>
                      <select
                        value={selectedCurrency}
                        onChange={e => {
                          setSelectedCurrency(e.target.value as any);
                          showToast(`Settlement clearing currency set to: ${e.target.value}`);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 cursor-pointer"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">Euro (€)</option>
                        <option value="GBP">Pound Sterling (£)</option>
                        <option value="GHS">Ghanaian Cedi (GH₵)</option>
                        <option value="KES">Kenyan Shilling (Ksh)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-400 font-mono">System Time-Zones Coordinates:</label>
                    <select
                      value={selectedTimeZone}
                      onChange={e => {
                        setSelectedTimeZone(e.target.value);
                        showToast(`Corrected cluster sync time-zone coordinates to: ${e.target.value}`);
                      }}
                      className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg outline-none bg-slate-50 cursor-pointer"
                    >
                      <option value="UTC">UTC / GMT Greenwich</option>
                      <option value="GMT+1">GMT+1 West Africa Time</option>
                      <option value="GMT+3">GMT+3 East Africa Time</option>
                      <option value="EST">GMT-5 US Eastern Time</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>

            {/* Right Live desktop UI rebranding preview mockup */}
            <div className="lg:col-span-2 bg-slate-100 border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col justify-between min-h-[450px]">
              <div className="space-y-4 flex-1">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 select-none">
                  <div>
                    <span className="text-[8.5px] font-mono text-slate-400 block font-bold">CLIENT LOGGING ENDPOINT MOCKUP</span>
                    <h4 className="text-xs font-black text-slate-800">Dynamic White-Labeled Custom Portal Preview</h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Domain Target: {whiteLabelDomain}</span>
                </div>

                {/* Mock Application login/landing banner custom rendered with colors */}
                <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-slate-150 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2.5 rounded-lg text-white font-semibold flex items-center justify-center shadow-md"
                      style={{ backgroundColor: whiteLabelThemeColor }}
                    >
                      <Database className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black uppercase tracking-tight text-slate-900">
                        {whiteLabelBrandName} Portal
                      </h4>
                      <p className="text-[9px] font-mono text-slate-400">Isolated Educational tenant federation gateway</p>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800">Localized Currency Format Example:</span>
                      <span className="font-extrabold text-blue-600">
                        {selectedCurrency === 'USD' ? '$299.00 / mo' :
                         selectedCurrency === 'EUR' ? '€299.00 / mo' :
                         selectedCurrency === 'GBP' ? '£299.00 / mo' :
                         selectedCurrency === 'GHS' ? 'GH₵1,200.00 / mo' : 'KSh32,400.00 / mo'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800">Localized Language Text Code:</span>
                      <span className="font-bold text-purple-700 uppercase">{selectedLanguage} UTF-8 Gateway</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="font-bold text-slate-800">Assigned Timezone Coordinates:</span>
                      <span className="font-bold text-slate-700">{selectedTimeZone} Sync</span>
                    </div>
                  </div>

                  {/* Multilingual localized greeting prompt */}
                  <div className="p-3 bg-blue-50/50 border border-blue-105 rounded-xl text-xs flex gap-2 items-start text-blue-950 font-sans font-medium">
                    <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold">
                        {selectedLanguage === 'en' && 'Welcome to the Central SaaS Administration Portal.'}
                        {selectedLanguage === 'fr' && 'Bienvenue sur le portail d\'administration centrale du SaaS.'}
                        {selectedLanguage === 'de' && 'Willkommen im zentralen SaaS-Administrationsportal.'}
                        {selectedLanguage === 'es' && 'Bienvenido al portal de administración central de SaaS.'}
                        {selectedLanguage === 'sw' && 'Karibu kwenye Lango Kuu la Usimamizi wa SaaS.'}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                        Data isolated school directories remain encrypted under separate school node databases security protocols.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

              <div className="mt-4 p-3 bg-white border border-slate-150 rounded-xl flex justify-between items-center">
                <span className="text-xs text-slate-500 font-mono">Click Deploy to write variables to .env config file overrides</span>
                <button
                  onClick={() => showToast(`Deploed custom vanity domain ${whiteLabelDomain} overrides safely.`)}
                  className="px-5 py-2 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  style={{ backgroundColor: whiteLabelThemeColor }}
                >
                  Deploy live branding variables
                </button>
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
