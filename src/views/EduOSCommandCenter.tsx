/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  MapPin, 
  Award, 
  Briefcase, 
  Key, 
  FileSignature, 
  Globe, 
  DollarSign, 
  Sparkles, 
  Globe2,
  ShieldAlert,
  ChevronRight,
  Bookmark,
  QrCode,
  Download,
  Flame,
  FileText,
  UserCheck,
  CheckCircle,
  Plus,
  Trash2,
  Search,
  BookOpen,
  Milestone,
  Fingerprint,
  Activity,
  Network,
  RotateCw,
  LineChart,
  Cpu,
  GraduationCap,
  Hammer,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  BarChart as RechartsBarChart, 
  Bar, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { School, User } from '../types';

interface EduOSCommandCenterProps {
  schools: School[];
  currentUser: User | null;
}

export default function EduOSCommandCenter({ schools, currentUser }: EduOSCommandCenterProps) {
  // Active sub-sections for EduOS Command Center
  const [activeOSSection, setActiveOSSection] = useState<'command-center' | 'student-passport' | 'exams-curriculum' | 'higher-education' | 'employability-research'>('command-center');

  // National Digital Passport / ID State
  const [passportSearch, setPassportSearch] = useState('');
  const [selectedLearnerPassport, setSelectedLearnerPassport] = useState<string | null>('SGP-2026-9012');

  const digitalLearnerPassports = [
    {
      nationalId: 'SGP-2026-9012',
      name: 'Nene Kwesi Appiah Mensah',
      email: 'nene.mensah@scholar.gov.gh',
      currentSchool: 'Central Crest Academy',
      currentGrade: 'Grade 10 STEM Cohort A',
      bloodGroup: 'O+',
      enrolledSince: '2020',
      academicPerformanceHistory: [
        { year: '2023', score: '88.5%', attendance: '96.4%', boardExam: 'Awaiting Assessment' },
        { year: '2024', score: '91.2%', attendance: '97.2%', boardExam: 'National Junior High Score: 94.5%' },
        { year: '2025', score: '93.8%', attendance: '98.5%', boardExam: 'SGP West-African Regional High Honours' }
      ],
      skillsPassport: ['Algebra Prototyping', 'Generative Python Writing', 'Microphysics Mechanics', 'Analytical Writing'],
      extracurriculars: ['National Robotics Olympiad Cap', 'Sovereign Diocesan Choir Pitch Leader'],
      certifications: [
        { title: 'Information Security Standard ISO 27001 Basic Care', issuedBy: 'Global Cyber Security Hub', year: '2025' },
        { title: 'Generative AI Prompting & Learning Track Honors', issuedBy: 'EduCore National Training Initiative', year: '2026' }
      ]
    },
    {
      nationalId: 'SGP-2026-4410',
      name: 'Sarah Fatima Toure',
      email: 's.toure@tertiary-gov.sn',
      currentSchool: 'Kingdom Diocesan High',
      currentGrade: 'Senior High School 2',
      bloodGroup: 'B-',
      enrolledSince: '2022',
      academicPerformanceHistory: [
        { year: '2024', score: '78.4%', attendance: '92.1%', boardExam: 'National Junior Intermediate: 81.2%' },
        { year: '2025', score: '82.5%', attendance: '94.0%', boardExam: 'Awaiting Level 2 Assessment' }
      ],
      skillsPassport: ['Public Debating Catalyst', 'French Academic Literature Translation', 'Basic Chemistry Kinetics'],
      extracurriculars: ['District Track & Field 400m Gold Captain', 'Greenhouse Soil Reclamation Volunteer'],
      certifications: [
        { title: 'Intermediate Algebra and Modeling Course Badge', issuedBy: 'Antigravity Academy', year: '2025' }
      ]
    }
  ];

  // Examination Authority state
  const [candidateSearchFilter, setCandidateSearchFilter] = useState('');
  const [boardExamsList, setBoardExamsList] = useState([
    { code: 'WASSCE-2026', title: 'West African Senior School Certificate Assessment', date: '2026-08-15', status: 'Registration Open', candidatesRegistered: 18450 },
    { code: 'NAT-GRADE-10', title: 'National Level Academic Aptitude exam', date: '2026-07-22', status: 'Scheduling Finalized', candidatesRegistered: 9840 },
    { code: 'DIOCESE-AWARDS', title: 'Diocesan Dioceses Competitive Theology Assessment', date: '2026-11-04', status: 'Draft Status', candidatesRegistered: 4120 }
  ]);

  // Curriculum State Manager
  const [curriculumUpdatesLog, setCurriculumUpdatesLog] = useState([
    { id: 'curr_1', code: 'STEM-VOL-1.4', subject: 'Digital Physics and Basic Robotics', standardGrade: 'Grade 9 - 11', lastReviewDate: '2026-06-12', complianceScore: 98.4, status: 'Active Disseminated' },
    { id: 'curr_2', code: 'CIVICS-ETHICS-22', subject: 'National Public Health, Code of Conduct', standardGrade: 'Grade 7 - 12', lastReviewDate: '2026-05-30', complianceScore: 100.0, status: 'Active Disseminated' },
    { id: 'curr_3', code: 'COMP-COGNITIVE-1', subject: 'Practical Generative Prompt Engineering', standardGrade: 'Grade 10 - 12 Polytech', lastReviewDate: '2026-06-18', complianceScore: 78.5, status: 'Provisionally Active - Review Cycle' }
  ]);

  const [newCurriculumCode, setNewCurriculumCode] = useState('');
  const [newCurriculumSubject, setNewCurriculumSubject] = useState('');
  const [newCurriculumGrade, setNewCurriculumGrade] = useState('');

  // Licensing Authority Panel State
  const [teacherLicenses, setTeacherLicenses] = useState([
    { licenseNumber: 'NTR-2026-8809', name: 'Dr. Evelyn Vance', degree: 'Ph.D in Pure Mathematics', status: 'Fully Certified', tier: 'Master Educator Tier', expiry: '2031-12-31' },
    { licenseNumber: 'NTR-2026-1014', name: 'Sister Agnes Toure', degree: 'M.Ed in Religious Pedagogy', status: 'Fully Certified', tier: 'Senior Professional Tier', expiry: '2029-06-15' },
    { licenseNumber: 'NTR-2026-9040', name: 'Nii Adjaye', degree: 'B.Sc Architectural Engineering', status: 'Conditional Authorization', tier: 'Associate Instructor Tier', expiry: '2027-02-28' }
  ]);

  const [verifyLicenseSearch, setVerifyLicenseSearch] = useState('');

  // Higher Ed (Tertiary Extension) State
  const [tertiaryFacultyTab, setTertiaryFacultyTab] = useState<'management' | 'course-reg' | 'research-tracking'>('management');
  const tertiaryFaculties = [
    { code: 'FAC-ENG', schoolName: 'Accra National Technical Polytechnic', dean: 'Prof. Kofi Osei Jr.', studentEnrollment: 4120, activeResearches: 18, budgetAllocationUSD: 1850000 },
    { code: 'FAC-SCI', schoolName: 'Sovereign Diocesan Theological Seminary', dean: 'Father Luke Bennett', studentEnrollment: 840, activeResearches: 5, budgetAllocationUSD: 420000 },
    { code: 'FAC-TECH', schoolName: 'Global Antigravity Research University', dean: 'Dr. Stella Egwu', studentEnrollment: 2800, activeResearches: 42, budgetAllocationUSD: 6400000 }
  ];

  // Scholarship Management Platform
  const [scholarsAppFilter, setScholarsAppFilter] = useState<'All' | 'Eligible' | 'Funding Active'>('All');
  const scholarshipTrustLog = [
    { name: 'Kofi Mensah Jr.', scheme: 'National Merit STEM Fellowship', country: 'Ghana Node', rating: '98% Eligibility Verified', status: 'Funding Active' },
    { name: 'Amina Diarra', scheme: 'West-African Diocesan Trust fund', country: 'Senegal Node', rating: '94% Eligibility Verified', status: 'Eligible' },
    { name: 'Chinedu Egwu', scheme: 'Antigravity Systems Engineering Grant', country: 'Nigeria Node', rating: '100% Eligibility Verified', status: 'Funding Active' }
  ];

  // AI Super Intelligence Insights State
  const [macroPredictionMetric, setMacroPredictionMetric] = useState<'dropout' | 'excellence' | 'readiness'>('excellence');

  // Multi-region Server Autoscale State Simulators
  const [autoscaleStatus, setAutoscaleStatus] = useState({
    activeReplicas: 38,
    averageLatencyMs: 44,
    currentUptimeSLA: '99.98%',
    complianceGDPR: 'Compliant & Sealed (ISO 27001 Hub)',
    complianceAudits: 'SOC 2 Registry Certified',
    nodeLoadIndex: 'Normal'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRegisterCurriculumUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCurriculumCode || !newCurriculumSubject) return;
    const nextItem = {
      id: `curr_${Date.now()}`,
      code: newCurriculumCode.toUpperCase(),
      subject: newCurriculumSubject,
      standardGrade: newCurriculumGrade || 'Grades 9 - 12',
      lastReviewDate: new Date().toISOString().split('T')[0],
      complianceScore: 100,
      status: 'Active Disseminated'
    };
    setCurriculumUpdatesLog([nextItem, ...curriculumUpdatesLog]);
    setNewCurriculumCode('');
    setNewCurriculumSubject('');
    showToast(`Curriculum node "${nextItem.code}" successfully disseminated to all school groups!`);
  };

  const handleSimulateAutoscaleTrigger = () => {
    showToast("Dispatched scale operation request to central Digital Education Cloud.");
    setAutoscaleStatus(prev => ({
      ...prev,
      activeReplicas: prev.activeReplicas + 8,
      averageLatencyMs: 18,
      nodeLoadIndex: 'Balanced & Amplified'
    }));
    setTimeout(() => {
      showToast("Cognitive auto-scaling routine completed. Standard SLA latency metrics optimized.");
    }, 1500);
  };

  // Advanced Recharts Datasets
  const nationalPerformanceData = [
    { name: 'Jan', enrollment: 34000, activePass: 72, retentionRate: 98.4, certifications: 12000 },
    { name: 'Feb', enrollment: 38000, activePass: 75, retentionRate: 98.6, certifications: 15400 },
    { name: 'Mar', enrollment: 42000, activePass: 78, retentionRate: 98.8, certifications: 19800 },
    { name: 'Apr', enrollment: 47000, activePass: 81, retentionRate: 99.1, certifications: 24000 },
    { name: 'May', enrollment: 51200, activePass: 85, retentionRate: 99.4, certifications: 31200 },
    { name: 'Jun', enrollment: 55000, activePass: 92, retentionRate: 99.8, certifications: 42000 }
  ];

  const regionalSubjectAverages = [
    { region: 'Northern Area', STEM: 74, Humanities: 82, Languages: 90 },
    { region: 'Central Dist', STEM: 85, Humanities: 89, Languages: 94 },
    { region: 'Southern Dio', STEM: 91, Humanities: 92, Languages: 96 },
    { region: 'Coastal Hub', STEM: 96, Humanities: 95, Languages: 98 },
    { region: 'Western Prov', STEM: 78, Humanities: 84, Languages: 88 }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 p-1">
      
      {/* Toast Alerts Popover */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-55 bg-[#0F1E35] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-sans font-semibold text-xs border border-indigo-400"
          >
            <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP HEADER SUMMARY BAR */}
      <div className="bg-gradient-to-r from-[#030E1A] to-[#0A1E33] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 opacity-[0.03] translate-x-12 -translate-y-6">
          <Globe2 className="w-96 h-96 text-sky-400" />
        </div>
        <div className="space-y-2 relative z-10 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-amber-600 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30">
               Stage 10 National EduOS Operating Engine
            </span>
            <span className="text-[10px] font-mono font-bold bg-indigo-650 px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-400/30 text-indigo-50">
               GDPR / ISO 27001 Multi-Region
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            National Education OS (EduOS) Command Center
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Govern academic compliance across entire districts, trace digital learner passports, authorize teacher licenses, administer tertiary faculties, and manage international education exchanges with smart API-first interoperability keys.
          </p>
        </div>
      </div>

      {/* HORIZONTAL SUBTAB CONTROLS */}
      <div className="flex gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl overflow-x-auto select-none">
        {[
          { id: 'command-center', label: 'Command Center & Cloud Status', icon: Activity },
          { id: 'student-passport', label: 'Digital Learner Identity & Passport', icon: Fingerprint },
          { id: 'exams-curriculum', label: 'Examinations, Curriculum & Licensing', icon: Milestone },
          { id: 'higher-education', label: 'Higher Education & Tertiary Expansion', icon: GraduationCap },
          { id: 'employability-research', label: 'Employability Portal & Scholarship Hub', icon: Briefcase }
        ].map(cat => {
          // Fallback icon helper if landmark is omitted
          const Icon = cat.icon || Milestone;
          const isActive = activeOSSection === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveOSSection(cat.id as any)}
              className={`px-4 py-3 text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
                isActive 
                  ? 'bg-indigo-650 text-white hover:bg-indigo-700 shadow-md transform -translate-y-0.5 font-sans' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN RENDER PANEL */}
      <div className="space-y-6 text-left">

        {/* SECTION 1: COMMAND CENTER & INTERACTIVE GEOSPATIAL MAP / CLOUD SCALING */}
        {activeOSSection === 'command-center' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left National KPI stats and diagnostics */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* National Super Intelligence predictors */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 select-none">
                  <Cpu className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">AI Super Intelligence Engine</h3>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block">Toggle Predictive Analytics Track:</span>
                  <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-lg">
                    {(['readiness', 'excellence', 'dropout'] as const).map(tr => (
                      <button
                        key={tr}
                        onClick={() => setMacroPredictionMetric(tr)}
                        className={`py-1 rounded text-[10px] capitalize font-bold cursor-pointer transition-all ${
                          macroPredictionMetric === tr ? 'bg-white text-indigo-600 shadow-xxs font-black' : 'text-slate-500 hover:text-slate-805'
                        }`}
                      >
                        {tr} Analysis
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated predictions cards output */}
                <div className="p-4 bg-indigo-50 border border-indigo-150 rounded-xl space-y-2 font-sans select-none">
                  {macroPredictionMetric === 'excellence' && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-[10.5px] font-extrabold text-indigo-900 uppercase tracking-tight">National Honors Grade Projection</span>
                        <span className="text-xs bg-emerald-500 text-white font-mono px-2 py-0.5 rounded-full font-bold">+12.4% Optimal</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "Curriculum alignments with **Digital Physics Course Modules** have triggered high scholastic aptitude indexes. Forecast models project overall district-level mastery will spike from **78% to 84%** by Q4."
                      </p>
                    </>
                  )}
                  {macroPredictionMetric === 'readiness' && (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10.5px] font-extrabold text-indigo-900 uppercase">Board Exam Preparedness index</span>
                        <span className="text-xs font-mono font-black text-indigo-600">91.8% Readiness</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "Based on randomized test evaluations from **Computer-Based Testing (CBT)** hubs, student readiness indices remain highly resilient. Focus areas identified: kinematic mathematics."
                      </p>
                    </>
                  )}
                  {macroPredictionMetric === 'dropout' && (
                    <>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10.5px] font-extrabold text-[#991B1B] uppercase font-bold">Dropout Risk Prevention Alert</span>
                        <span className="text-xs font-mono font-black text-rose-600">0.2% Churn risk</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        "Centralized school attendance networks demonstrate less than **0.6% student drift** in regions mapped with zero-rated SMS integrations. Predictive safety index is verified."
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Cloud-native auto-scaler stats diagnostic */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-2 border-b border-slate-100 select-none">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-5 h-5 text-indigo-600 animate-pulse" /> Digital Education Cloud telemetry
                  </h3>
                  <p className="text-xs text-slate-500">Trace live system infrastructure workloads, multi-branch routing, and latency logs.</p>
                </div>

                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-slate-450 font-sans">Active Replicas Pool:</span>
                    <strong className="text-indigo-600 font-extrabold">{autoscaleStatus.activeReplicas} nodes container</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-slate-450 font-sans">Sync API Latency Time:</span>
                    <strong className="text-emerald-600 font-black">{autoscaleStatus.averageLatencyMs} ms avg</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-slate-450 font-sans">Realized Uptime SLA:</span>
                    <strong className="text-[#1A56DB] font-extrabold">{autoscaleStatus.currentUptimeSLA}</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-slate-450 font-sans">GDPR Encryption Seal:</span>
                    <strong className="text-slate-800 font-bold">{autoscaleStatus.complianceGDPR}</strong>
                  </div>

                  <div className="flex justify-between p-2.5 bg-slate-50 border border-slate-150 rounded-lg">
                    <span className="text-slate-450 font-sans">Security Audits Registry:</span>
                    <strong className="text-slate-800 font-bold">{autoscaleStatus.complianceAudits}</strong>
                  </div>
                </div>

                <button
                  onClick={handleSimulateAutoscaleTrigger}
                  className="w-full py-2.5 bg-[#0F1E35] text-white hover:bg-slate-800 rounded-xl text-xs font-black cursor-pointer shadow-md transition-all font-sans"
                >
                  Trigger Cognitive Cloud Autoscale
                </button>
              </div>

            </div>

            {/* Right Interactive Map Display Center */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#030E1C] text-white p-6 rounded-2xl shadow-xl relative min-h-[460px] flex flex-col justify-between border border-slate-800 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#3B82F6_2px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                <div className="space-y-1 relative z-10 text-left">
                  <span className="text-[10px] text-sky-400 font-mono tracking-wider uppercase font-black">EduCore Geospatial GIS Correlator Mapping</span>
                  <h3 className="text-base font-extrabold">National Strategic Education Map & School Distribution</h3>
                  <p className="text-xs text-slate-450 max-w-xl">
                    Dynamic visualization of regional multi-school clusters, infrastructure health ratings, and server load balances plotted live.
                  </p>
                </div>

                {/* SVG Geospatial Mapping Layout Design */}
                <div className="relative flex-1 flex items-center justify-center p-4">
                  <svg viewBox="0 0 500 250" className="w-full max-w-2xl h-auto text-slate-700/20">
                    <path fill="currentColor" d="M10,20 L60,80 L180,60 L240,110 L380,40 L480,120 L420,210 L310,180 L210,230 L110,180 L30,130 Z" />
                    {/* Connecting regional line threads */}
                    <line x1="60" y1="80" x2="240" y2="110" stroke="#3B82F6" strokeWidth="1.5" strokeDasharray="3" />
                    <line x1="240" y1="110" x2="380" y2="40" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3" />
                    <line x1="240" y1="110" x2="210" y2="230" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="3" />
                  </svg>

                  {/* Operational Nodes Active Pins overlay */}
                  <div className="absolute top-1/4 left-1/4">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span className="absolute bg-slate-900/90 text-white font-mono text-[9px] px-1 rounded -translate-y-6 -translate-x-1/2 whitespace-nowrap">
                      Northern Cluster Node A (Balanced)
                    </span>
                  </div>

                  <div className="absolute top-1/2 left-1/2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1A56DB] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-[#1A56DB]"></span>
                    </span>
                    <span className="absolute bg-slate-900/90 text-white font-mono text-[9px] px-1 rounded -translate-y-6 -translate-x-1/2 whitespace-nowrap">
                      Central District Command Node (Load Spiked)
                    </span>
                  </div>

                  <div className="absolute bottom-1/4 left-2/3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                    </span>
                    <span className="absolute bg-slate-900/90 text-white font-mono text-[9px] px-1 rounded -translate-y-6 -translate-x-1/2 whitespace-nowrap">
                      Coastal Diocese Diocese Hub (Optimal)
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/40 p-4.5 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-450 text-left font-mono space-y-0.5">
                    <p>✔ Server clusters: <strong>3 Active hubs</strong></p>
                    <p>✔ Strategic monitoring status: <strong>Ministry Level High</strong></p>
                  </div>
                  <span className="text-xs text-sky-400 font-mono font-black uppercase">
                     INTERACTION: AUTO-CORRELATOR VERIFIED INTL STANDARDS
                  </span>
                </div>
              </div>
            </div>

            {/* ADVANCED RECHARTS GRAPHICAL WIDGETS */}
            <div className="col-span-1 lg:col-span-3 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6 mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-1.5 text-[#1A56DB]">
                     <GraduationCap className="w-5 h-5 text-indigo-600" />
                     <span className="text-[10px] font-mono font-bold bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[#1A56DB] uppercase">Metrics Engine Live</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">National Student Metrics & Exam Competencies</h3>
                  <p className="text-xs text-slate-500">Real-time cohort passing rates, digital certificate issuance speed, and subject-matter proficiency.</p>
                </div>
                <div className="flex items-center gap-3.5 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#1A56DB]"></span>
                    <span className="text-slate-500">Active Passing Rate</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]"></span>
                     <span className="text-slate-500">Enrollment</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2">
                
                {/* CHART A: Area Chart for National Performance Tracks */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                  <div className="text-left">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Cohort Enrollment & Achievement Slope</h4>
                    <p className="text-[10px] text-slate-500 font-medium">Tracking aggregate active learner profiles against certified outputs (Jan - Jun).</p>
                  </div>
                  <div className="h-[260px] w-full text-[10px] font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={nationalPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorEnrollment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorCertificates" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="name" stroke="#64748B" />
                        <YAxis stroke="#64748B" />
                        <RechartsTooltip />
                        <Area type="monotone" dataKey="enrollment" stroke="#0EA5E9" strokeWidth={2} fillOpacity={1} fill="url(#colorEnrollment)" name="Enrolled Profiles" />
                        <Area type="monotone" dataKey="certifications" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCertificates)" name="Issued Credentials" />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* CHART B: Bar Chart for Subject Competencies */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl space-y-3">
                  <div className="text-left">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider">Regional Subject-Matter Passing Averages (%)</h4>
                    <p className="text-[10px] text-slate-500 font-medium font-sans">Multi-cohort diagnostics mapping STEM, Humanities, and Language proficiency scores.</p>
                  </div>
                  <div className="h-[260px] w-full text-[10px] font-mono">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={regionalSubjectAverages} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="region" stroke="#64748B" />
                        <YAxis stroke="#64748B" domain={[0, 100]} />
                        <RechartsTooltip />
                        <Bar dataKey="STEM" fill="#1A56DB" radius={[4, 4, 0, 0]} name="STEM Track" />
                        <Bar dataKey="Humanities" fill="#10B981" radius={[4, 4, 0, 0]} name="Humanities" />
                        <Bar dataKey="Languages" fill="#F59E0B" radius={[4, 4, 0, 0]} name="Languages" />
                        <Legend wrapperStyle={{ fontSize: 10, paddingTop: 10 }} />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

              {/* Dynamic Summary Stats Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-indigo-50/40 p-4 border border-indigo-100 rounded-xl select-none font-sans text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">National Mean Passing index</span>
                  <strong className="text-slate-800 text-sm font-black">85.4% Average</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Retention rate index</span>
                  <strong className="text-emerald-700 text-sm font-black">+99.32% Retention</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">Total active certifications verified</span>
                  <strong className="text-violet-700 text-sm font-black">142,400 Records</strong>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-mono uppercase font-bold block">District nodes synchronized</span>
                  <strong className="text-slate-800 text-sm font-black">100% Core compliance</strong>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 2: DIGITAL LEARNER IDENTITY & EDUCATION PASSPORT */}
        {activeOSSection === 'student-passport' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Header with Search and Lifelong query bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-850">Permanent Digital Education Passport Registry</h3>
                <p className="text-xs text-slate-500">Secure lifelong learner historical records that follow student identity nodes across standard levels.</p>
              </div>

              {/* Passport Search bar */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl text-xs w-full md:w-72">
                <Fingerprint className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter National Student ID..."
                  value={passportSearch}
                  onChange={e => setPassportSearch(e.target.value)}
                  className="bg-transparent border-none outline-none font-mono font-bold w-full"
                />
              </div>
            </div>

            {/* Loop render selected or queried student passports */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Selector side panel */}
              <div className="lg:col-span-1 space-y-3 select-none">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-650">Select Regional Student Node</h4>
                {digitalLearnerPassports
                  .filter(lr => !passportSearch || lr.nationalId.toLowerCase().includes(passportSearch.toLowerCase()) || lr.name.toLowerCase().includes(passportSearch.toLowerCase()))
                  .map(lr => {
                    const isSelected = selectedLearnerPassport === lr.nationalId;
                    return (
                      <div
                        key={lr.nationalId}
                        onClick={() => setSelectedLearnerPassport(lr.nationalId)}
                        className={`p-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                          isSelected ? 'border-indigo-650 bg-indigo-50/20' : 'border-slate-155 hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className="bg-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded uppercase">
                            {lr.nationalId}
                          </span>
                          <span className="text-slate-400">{lr.currentSchool}</span>
                        </div>
                        <h4 className="text-xs font-black text-slate-900 leading-tight truncate">{lr.name}</h4>
                        <span className="text-[10px] text-slate-400 font-mono block">Grade context: {lr.currentGrade}</span>
                      </div>
                    );
                  })}
              </div>

              {/* Detailed passport passport output template */}
              <div className="lg:col-span-2 select-text font-sans">
                {(() => {
                  const lr = digitalLearnerPassports.find(p => p.nationalId === selectedLearnerPassport);
                  if (!lr) {
                    return (
                      <div className="p-8 text-center text-slate-400 font-mono text-xs border border-dashed rounded-2xl">
                         No student digital passport record matched that query filter.
                      </div>
                    );
                  }
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
                      
                      {/* Top Passport Core metadata block */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-extrabold bg-[#0A1E33] text-white px-2.5 py-1 rounded">
                              NATIONAL ID: {lr.nationalId}
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 rounded-full font-bold">
                              ✔ ACTIVE VERIFIED NODE
                            </span>
                          </div>
                          <h3 className="text-base font-black text-slate-900">{lr.name}</h3>
                          <span className="text-xs text-slate-505 block">Email address: <strong className="text-slate-705">{lr.email}</strong> • Medical: Blood type {lr.bloodGroup}</span>
                        </div>

                        <div className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2">
                          <QrCode className="w-10 h-10 text-indigo-650" />
                          <div className="text-[9px] font-mono text-slate-400 text-left">
                            <span>SGP QR Signature</span>
                            <span className="block font-bold text-slate-800">VALIDATED LIFETIME</span>
                          </div>
                        </div>
                      </div>

                      {/* Performance history data grids */}
                      <div className="space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">Permanent Academic History Trace</h4>
                        <div className="border border-slate-202 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead className="bg-[#0A1E33] text-white font-mono text-[10px]">
                              <tr>
                                <th className="px-4 py-2">Registration Academic Year</th>
                                <th className="px-4 py-2">Score Aggregation</th>
                                <th className="px-4 py-2">Continuous Attendance</th>
                                <th className="px-4 py-2">State board Exams outcome</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-slate-600 text-[11px]">
                              {lr.academicPerformanceHistory.map((hist, idx) => (
                                <tr key={idx} className="hover:bg-slate-50">
                                  <td className="px-4 py-2.5 font-bold font-sans text-slate-900">{hist.year} Academic cycle</td>
                                  <td className="px-4 py-2.5 text-emerald-600 font-bold">{hist.score}</td>
                                  <td className="px-4 py-2.5 text-indigo-600">{hist.attendance}</td>
                                  <td className="px-4 py-2.5 text-slate-800 font-semibold">{hist.boardExam}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Skills matrix & badges */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        
                        <div className="p-4.5 bg-white border border-slate-200 rounded-xl space-y-2">
                          <h5 className="text-[10.5px] font-black uppercase text-slate-750 font-sans tracking-wide">Learner Core Competencies</h5>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lr.skillsPassport.map((sk, idx) => (
                              <span key={idx} className="text-[9.5px] font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">
                                #{sk}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="p-4.5 bg-white border border-slate-200 rounded-xl space-y-2">
                          <h5 className="text-[10.5px] font-black uppercase text-slate-750 font-sans tracking-wide">Awards & Extracurriculars</h5>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {lr.extracurriculars.map((ex, idx) => (
                              <span key={idx} className="text-[9.5px] font-mono bg-[#030E1C] text-indigo-200 px-2 py-1 rounded-md border border-slate-800">
                                {ex}
                              </span>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Official Certifications Vault */}
                      <div className="space-y-3 text-left">
                        <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">National Certificates & Credentials Registry</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {lr.certifications.map((ct, idx) => (
                            <div key={idx} className="p-4 bg-[#0F1E35] text-white rounded-xl relative overflow-hidden border border-slate-800 select-text">
                              <span className="text-[8.5px] font-mono text-indigo-300 block uppercase font-black">Authorized digital certification</span>
                              <h5 className="text-[11.5px] font-black tracking-tight mt-1 leading-snug w-11/12">{ct.title}</h5>
                              <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono block pt-2 mt-2 border-t border-slate-800">
                                <span>Authority: {ct.issuedBy}</span>
                                <span className="text-emerald-400 font-bold">YEAR: {ct.year}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        )}

        {/* SECTION 3: EXAMS, CURRICULUM, AND LICENSING */}
        {activeOSSection === 'exams-curriculum' && (
          <div className="space-y-6">
            
            {/* National Exam Authority & Curriculum log */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
                <div className="space-y-1">
                  <h3 className="text-base font-extrabold text-slate-850">National Examination Board & Curriculum Registry</h3>
                  <p className="text-xs text-slate-500">Unify national level scheduling, compile question databases, and track curriculum compliance indices.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs w-full sm:w-60">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filter standard exam code..."
                    value={candidateSearchFilter}
                    onChange={e => setCandidateSearchFilter(e.target.value)}
                    className="bg-transparent border-none outline-none font-mono"
                  />
                </div>
              </div>

              {/* Grid split */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Board Exams Schedules list */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase text-[#1A56DB] tracking-wider">Scheduled State Board Assessments</h4>
                  <div className="space-y-3 font-mono text-[11px]">
                    {boardExamsList
                      .filter(ex => !candidateSearchFilter || ex.code.toLowerCase().includes(candidateSearchFilter.toLowerCase()))
                      .map(ex => (
                        <div key={ex.code} className="p-4 bg-slate-50 border border-slate-155 rounded-xl space-y-2 relative">
                          <div className="flex justify-between items-center text-xs">
                            <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono uppercase">{ex.code}</span>
                            <span className="text-emerald-700 font-extrabold">{ex.status}</span>
                          </div>
                          <h5 className="font-sans font-black text-slate-900 leading-tight text-xs">{ex.title}</h5>
                          <div className="flex justify-between text-[10px] text-slate-400 block pt-1.5 border-t border-slate-200">
                            <span>Expected Examination Date: <strong>{ex.date}</strong></span>
                            <span>Registered: <strong>{ex.candidatesRegistered.toLocaleString()} candidates</strong></span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Centralized Curriculum version controls */}
                <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-150">
                  <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider">Centralized Curriculum Administration</h4>
                  
                  {/* Register core curriculum form */}
                  <form onSubmit={handleRegisterCurriculumUnit} className="space-y-3 text-xs font-sans text-left">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Curriculum Spec Code</label>
                        <input
                          type="text"
                          required
                          value={newCurriculumCode}
                          onChange={e => setNewCurriculumCode(e.target.value)}
                          placeholder="STEM-VOL-1.5"
                          className="w-full px-3 py-2 border border-slate-200 outline-none rounded-xl bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Target Cohort Level</label>
                        <input
                          type="text"
                          value={newCurriculumGrade}
                          onChange={e => setNewCurriculumGrade(e.target.value)}
                          placeholder="Grade 9 - 12"
                          className="w-full px-3 py-2 border border-slate-200 outline-none rounded-xl bg-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Subject Standard & Syllabus Title</label>
                      <input
                        type="text"
                        required
                        value={newCurriculumSubject}
                        onChange={e => setNewCurriculumSubject(e.target.value)}
                        placeholder="e.g. Advanced AI Prompting & Linear Vectors"
                        className="w-full px-3 py-2 border border-slate-200 outline-none rounded-xl bg-white"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                    >
                      Disseminate Central Updates
                    </button>
                  </form>

                  {/* Active curriculums updates log */}
                  <div className="space-y-2.5 pt-3 border-t border-slate-200">
                    <span className="text-[10px] text-slate-450 font-extrabold uppercase font-mono block">Published Compliant Syllabus Logs</span>
                    <div className="space-y-2 text-[10px] font-mono">
                      {curriculumUpdatesLog.map(cl => (
                        <div key={cl.id} className="p-3 bg-white border border-slate-150 rounded-lg text-left space-y-1">
                          <div className="flex justify-between items-center font-bold">
                            <span className="text-indigo-750">{cl.code}</span>
                            <span className="text-emerald-600">Compliance Index: {cl.complianceScore.toFixed(1)}%</span>
                          </div>
                          <p className="font-sans font-bold text-slate-800 text-[11px] truncate leading-tight">{cl.subject}</p>
                          <div className="flex justify-between text-[9.5px] text-slate-400 pt-1 mt-1 border-t border-slate-100">
                            <span>Syllabus Standard: {cl.standardGrade}</span>
                            <span>Disseminated: {cl.lastReviewDate}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* DIGITAl TEACHER LICENSING HUB */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="space-y-1 pb-2 border-b border-slate-100 select-none">
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-5 h-5 text-indigo-600 animate-pulse" /> National Professional Teacher Licensing Authority
                </h3>
                <p className="text-xs text-slate-500">Track qualifications, compile professional licensing registers, and issue standardized renewal dates.</p>
              </div>

              {/* Tally loop table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-[#0A1E33] text-white font-mono text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Unified License Key</th>
                      <th className="px-4 py-2.5">Educator Fullname</th>
                      <th className="px-4 py-2.5">Qualification Degree</th>
                      <th className="px-4 py-2.5">Teacher Tier level</th>
                      <th className="px-4 py-2.5">Registration Expiry</th>
                      <th className="px-4 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                    {teacherLicenses.map(lic => (
                      <tr key={lic.licenseNumber} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900 font-mono">{lic.licenseNumber}</td>
                        <td className="px-4 py-3 font-sans font-extrabold text-slate-800">{lic.name}</td>
                        <td className="px-4 py-3 text-slate-505">{lic.degree}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{lic.tier}</td>
                        <td className="px-4 py-3 text-slate-400">{lic.expiry}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[9.5px] bg-emerald-50 border border-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full uppercase">
                            {lic.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* SECTION 4: UNIVERSITY & TERTIARY EDUCATION EXPANSION */}
        {activeOSSection === 'higher-education' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-850">Tertiary, Higher Ed & University expansion portals</h3>
                <p className="text-xs text-slate-500 font-mono text-indigo-750">Serve as dean workspace, review research allocation budgets, and authorize course registration models.</p>
              </div>

              {/* Tertiary quick tab switcher */}
              <div className="flex bg-slate-150 p-1 border border-slate-200 rounded-xl select-none">
                {(['management', 'course-reg', 'research-tracking'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setTertiaryFacultyTab(tab)}
                    className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all uppercase ${
                      tertiaryFacultyTab === tab ? 'bg-white text-indigo-650 shadow-xxs font-black' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Render selected tertiary module views */}
            {tertiaryFacultyTab === 'management' && (
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-indigo-900 tracking-wider text-left">Active Integrated Universities & Technical faculties</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {tertiaryFaculties.map(fac => (
                    <div key={fac.code} className="p-4 bg-slate-50 border border-slate-155 rounded-xl space-y-3 relative text-left">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono bg-indigo-50 border border-indigo-100 text-indigo-700 font-extrabold px-1.5 py-0.5 rounded">
                          {fac.code}
                        </span>
                        <span className="text-slate-400 font-mono text-[9px]">SGP-VERIFIED TERTIARY STATUS</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight truncate">{fac.schoolName}</h4>
                      <div className="space-y-1 text-[10.5px] font-mono text-slate-505">
                        <p>Dean Representative: <strong className="text-slate-800">{fac.dean}</strong></p>
                        <p>Tertiary Cohort Size: <strong className="text-indigo-600">{fac.studentEnrollment.toLocaleString()} students</strong></p>
                        <p>Active Scientific Research Labs: <strong className="text-slate-800">{fac.activeResearches} projects</strong></p>
                      </div>
                      <div className="p-2 bg-indigo-50/50 border border-indigo-100 rounded-lg text-left">
                        <span className="text-[9px] text-indigo-700 block uppercase font-extrabold font-mono">Consolidated Budget Allocation</span>
                        <span className="text-xs font-black text-[#1A56DB] font-mono">${fac.budgetAllocationUSD.toLocaleString()}.00 USD</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Simulated Course Registration matrix */}
            {tertiaryFacultyTab === 'course-reg' && (
              <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2 select-none font-sans">
                <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-xs font-black uppercase text-slate-700">Course Selection & Syllabus Registration terminal</h4>
                <p className="text-xs text-slate-450 max-w-sm mx-auto">
                   Interactive student workspaces are synchronized directly with lifelong digital passports. Select modules from central universities.
                </p>
                <button
                  onClick={() => showToast("Dispatched course registration guidelines dossier.")}
                  className="px-4 py-1.5 bg-[#1A56DB] text-white hover:bg-blue-700 rounded-lg text-[10.5px] font-extrabold cursor-pointer"
                >
                  Retrieve Semester Roster
                </button>
              </div>
            )}

            {/* Scientific tracking state */}
            {tertiaryFacultyTab === 'research-tracking' && (
              <div className="p-4 bg-[#0E1E2F] text-white text-left font-mono text-[11px] rounded-xl space-y-2 border border-slate-800">
                <span className="text-sky-400 font-bold block uppercase tracking-wide">University Research Registry Integration protocols</span>
                <p className="text-slate-350">
                  Allows sovereign research centers to register project outcomes directly. Webhook payloads automatically communicate results to central agencies for resource allocation formulas.
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[10px] text-sky-300">
                  GET https://{currentUser?.email?.split('@')[1] || 'academic-clearing.gov'}/api/v1/tertiary/research-sync \<br />
                  &nbsp;&nbsp;-H "X-API-Authorize-Authority: NTR-2026-8809"
                </div>
              </div>
            )}

          </div>
        )}

        {/* SECTION 5: EMPLOYABILITY PORTAL & SCHOLARSHIP HUB */}
        {activeOSSection === 'employability-research' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Employability listings */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
              
              <div className="space-y-1 pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-base font-extrabold text-slate-850">Strategic Digital Employability Platform</h3>
                <p className="text-xs text-slate-500">Trace post-graduation employment velocities, sync skills profiles, and match candidates with internships.</p>
              </div>

              {/* Loop mock listings matching skills profiles */}
              <div className="space-y-4">
                {[
                  { title: 'Graduate Systems Engineering Intern', firm: 'Antigravity Aerospace Labs', salary: '$1,800/mo stipend', locations: 'Tema Coastal Zone', criteria: 'Lifelong STEM Passport Level 3 Required' },
                  { title: 'Junior Data Cleansing Analyst', firm: 'Ghana Ministry of Planning', salary: '$1,200 - $1,500/mo', locations: 'Accra Headquarters', criteria: 'Information Security Training Track Approved' },
                  { title: 'High-School Geometry Assistant Leader', firm: 'Apex Educational Trust', salary: '$900/mo Part-Time', locations: 'Kumasi District', criteria: 'Mathematics Competencies Certified' }
                ].map((job, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-155 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-100/50 transition-all">
                    <div className="space-y-1 text-left font-sans">
                      <span className="text-[9px] font-mono text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 rounded px-1.5 py-0.2 uppercase">
                        {job.firm}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 mt-1 leading-tight">{job.title}</h4>
                      <p className="text-[10px] text-slate-450">{job.locations} • Compensation: <strong className="text-slate-800">{job.salary}</strong></p>
                      <span className="text-[9.5px] font-mono text-purple-700 block mt-1">✔ Criteria: {job.criteria}</span>
                    </div>

                    <button
                      onClick={() => showToast(`Successfully submitted learner profile. Candidate validation pending verification review.`)}
                      className="px-4 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-all shrink-0 self-start sm:self-center"
                    >
                      Verify profile & Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Central scholarship administration */}
            <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
              
              <div className="space-y-1 pb-2 border-b border-slate-100 select-none">
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-indigo-600" /> National Scholarship Platform
                </h3>
                <p className="text-xs text-slate-505">Track applications eligibility indices, allocate state trust funds, and monitor strategic impact metrics.</p>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block">Eligibility Filter:</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg">
                  {['All', 'Eligible', 'Funding Active'].map(st => (
                    <button
                      key={st}
                      onClick={() => setScholarsAppFilter(st as any)}
                      className={`py-1 rounded text-[9.5px] font-bold cursor-pointer transition-all ${
                        scholarsAppFilter === st ? 'bg-white text-indigo-650 shadow-xxs font-black' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loop listings scholars */}
              <div className="space-y-3 font-mono text-[10.5px] text-left">
                {scholarshipTrustLog
                  .filter(sc => scholarsAppFilter === 'All' || sc.status === scholarsAppFilter)
                  .map((sc, index) => (
                    <div key={index} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 hover:bg-slate-100/50">
                      <div className="flex justify-between items-center font-bold text-slate-850">
                        <span>{sc.name}</span>
                        <span className="text-[9px] bg-indigo-50 border border-indigo-100 px-1 py-0.2 rounded text-indigo-700 font-black">{sc.status}</span>
                      </div>
                      <div className="text-[9.5px] text-slate-505">Scheme: {sc.scheme} • Region: {sc.country}</div>
                      <span className="text-[9.5px] text-indigo-805 font-bold block">{sc.rating}</span>
                    </div>
                  ))}
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
