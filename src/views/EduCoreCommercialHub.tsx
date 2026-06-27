/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  ShoppingBag, 
  Users, 
  BarChart3, 
  Award, 
  Briefcase, 
  Key, 
  FileSignature, 
  Globe, 
  DollarSign, 
  Compass, 
  Cpu, 
  BookOpen, 
  BadgeCheck, 
  UserCheck, 
  TrendingUp, 
  Zap, 
  Share2, 
  Heart, 
  LifeBuoy, 
  FolderLock, 
  Download, 
  QrCode, 
  CheckCircle,
  Plus,
  AlertCircle,
  Search,
  MessageSquare,
  ShieldCheck,
  Building2,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Settings,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { School, User } from '../types';

interface EduCoreCommercialHubProps {
  schools: School[];
  currentUser: User | null;
}

export default function EduCoreCommercialHub({ schools, currentUser }: EduCoreCommercialHubProps) {
  // Navigation tabs for Stage 9 Commercialization
  const [activeTab, setActiveTab] = useState<'marketplace' | 'investor' | 'developer' | 'recruitment' | 'enterprise'>('marketplace');

  // Marketplace states
  const [marketCategory, setMarketCategory] = useState<string>('All');
  const [purchasedProducts, setPurchasedProducts] = useState<string[]>([]);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  
  const [availableProducts, setAvailableProducts] = useState([
    { id: 'prod_1', title: 'Grade 10 Calculus Practice pack', author: 'Dr. Evelyn Vance', rate: 4.9, costSingular: 45, type: 'Exam Packs', downloadedCount: 412, description: 'Comprehensive question set with automated solutions and digital grading templates.' },
    { id: 'prod_2', title: 'Generative AI: Lesson plans package', author: 'EduCore Consulting Ltd.', rate: 4.8, costSingular: 79, type: 'AI Extensions', downloadedCount: 189, description: 'Curriculum-mapped guidelines mapped for standard national level classrooms.' },
    { id: 'prod_3', title: 'Cyber Physics interactive video models', author: 'Apex Publishers Group', rate: 5.0, costSingular: 120, type: 'Educational Content', downloadedCount: 310, description: '12 standard high-definition lecture clips to stream on built-in LMS channels.' },
    { id: 'prod_4', title: 'Advanced Digital Report Templates', author: 'Grace Academic Hub', rate: 4.7, costSingular: 35, type: 'Report Templates', downloadedCount: 94, description: 'Polished CSS skin templates that integrate with standard transcript systems.' },
    { id: 'prod_5', title: 'Offline-first Mobile Theme skins Set', author: 'Antigravity Designs', rate: 4.9, costSingular: 60, type: 'Mobile App Themes', downloadedCount: 201, description: 'Futuristic slate themes optimizing terminal visibility across low-spec handsets.' }
  ]);

  // Creator economy state
  const [creatorRevenueShare, setCreatorRevenueShare] = useState({ totalEarnings: 24500, platformCut: '25%', creatorCut: '75%', pendingPayout: 3200 });
  const [creatorItems, setCreatorItems] = useState([
    { id: 'item_1', name: 'West Coastline Geometry series', author: 'Kwame Mensah', sales: 42, proceeds: 1260 },
    { id: 'item_2', name: 'diocesan Religion syllabus guide', author: 'Sister Agnes', sales: 84, proceeds: 4200 },
  ]);

  // Push custom item creator form
  const [customItemTitle, setCustomItemTitle] = useState('');
  const [customItemCost, setCustomItemCost] = useState('');
  const [customItemType, setCustomItemType] = useState('Lesson Plans');

  // Third party store activations
  const [installedApps, setInstalledApps] = useState<string[]>(['app_attendance']);
  const thirdPartyApps = [
    { id: 'app_gamify', title: 'Gamified Algebra Quest API', provider: 'SolaTech Labs', rating: 4.9, description: 'Bridges cognitive gaming vectors directly to your student performance records.' },
    { id: 'app_attendance', title: 'Visual Face-Recognition Ledger', provider: 'Biometrics Node Group', rating: 4.6, description: 'Uses camera frames directly on mobile view to capture attendance vectors.' },
    { id: 'app_telecom', title: 'Zero-Rated Push & SMS Connector', provider: 'MTN Gateway Escrow', rating: 5.0, description: 'Delivers notifications over GSM pathways completely free of charges.' }
  ];

  // Investor dashboard executive SaaS indices
  const [growthForecastYears, setGrowthForecastYears] = useState(2030);
  const investorMetrics = {
    mrr: 148500,
    arr: 1782000,
    churnRate: '0.64%',
    ltv: 245000,
    cac: 4500,
    activeSubscribers: 125,
    growthQuarter: '+18.4%',
    cagrProjection: '38.2%'
  };

  // Partner ecosystems tracking
  const partnerFirms = [
    { id: 'part_1', firm: 'EcoBank Central Clearing', type: 'Payment Provider & Banks', status: 'Active Escrow', annualClearingUSD: 4500000 },
    { id: 'part_2', firm: 'Vodafone GSM West-Africa', type: 'Telecommunication Providers', status: 'Zero-Rated Tunnel Activated', annualClearingUSD: 180000 },
    { id: 'part_3', firm: 'Sanlam Sovereign Trust', type: 'Insurance Companies', status: 'Registered Trustee', annualClearingUSD: 1200000 }
  ];

  // Certification state
  const [selectedCertRecipient, setSelectedCertRecipient] = useState('Kwesi Appiah');
  const [selectedCertCourse, setSelectedCertCourse] = useState('Advanced Science & AI Integrations');
  const [generatedCertificates, setGeneratedCertificates] = useState([
    { id: 'cert_901', name: 'Kwesi Appiah', course: 'Computer-Based Testing Honors Class', verified: true, signature: 'Prof_Vance_09A', qrHash: '0xBD7812EFAA' },
    { id: 'cert_902', name: 'Fatoumata Fall', course: 'Ecosystem Strategic Leadership Course', verified: true, signature: 'Hon_Beatrice_O0', qrHash: '0xAC95542DA3' }
  ]);

  // Jobs Portal states
  const [vacancies, setVacancies] = useState([
    { id: 'vac_1', title: 'Director of Academic Information Engineering', classNode: 'Central Crest Academy', salaryRange: '$3,500 - $5,000 / mo', type: 'Full-Time', applicants: 18 },
    { id: 'vac_2', title: 'High-School STEM & Generative Robotics Leader', classNode: 'Grace Hill High', salaryRange: '$2,800 - $4,200 / mo', type: 'Part-time Hybrid', applicants: 34 },
    { id: 'vac_3', title: 'District Attendance & Community Outreach Officer', classNode: 'Ministry Trust High', salaryRange: '$2,200 - $3,300 / mo', type: 'District Level Contract', applicants: 9 }
  ]);
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  // Scholarships Tracking states
  const [scholarshipFundingTotal, setScholarshipFundingTotal] = useState(480000);
  const [scholarshipAwards, setScholarshipAwards] = useState([
    { id: 'sch_1', name: 'Amina Diarra', sponsor: 'Sovereign Diocesan Education Fund', allocationUSD: 12000, status: 'Active Disbursed' },
    { id: 'sch_2', name: 'Sarah Johnston', sponsor: 'Antigravity Founder Fellowship', allocationUSD: 8500, status: 'Reviewing Grades' }
  ]);

  // API Developer keys list
  const [developerKeys, setDeveloperKeys] = useState([
    { name: 'MTN Webhook Integration API', key: 'ed_live_fk90s11aa90qww42d931', status: 'Live', requests24h: 12450 },
    { name: 'Diocesan central analytics sync API', key: 'ed_live_sa21jj11bb22cc44dd55', status: 'Live', requests24h: 310 }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('https://agency-clearing.org/webhooks/educore');

  // Enterprise Agreement contracts state
  const [enterpriseContracts, setEnterpriseContracts] = useState([
    { id: 'ent_01', entity: 'Accra North Education District', nodesCount: 42, slaTarget: '99.95% Network Availability', renewalDate: '2027-01-12' },
    { id: 'ent_02', entity: 'Kingdom Religious Diocesan Schools', nodesCount: 18, slaTarget: '99.9% Uptime SLA', renewalDate: '2026-12-01' }
  ]);

  // Global taxation tables & region rates
  const [billingCurrency, setBillingCurrency] = useState<'USD' | 'GHS' | 'EUR' | 'GBP'>('USD');
  const regionalTaxationRates = [
    { country: 'Standard Global Tier', code: 'INTL', vatPercent: 15, typicalSurcharge: '0%' },
    { country: 'Republic of Ghana', code: 'GHS', vatPercent: 12.5, typicalSurcharge: '2.5% Covid levy' },
    { country: 'European Union Nations', code: 'EUR', vatPercent: 19, typicalSurcharge: '0% Standard' }
  ];

  // Onboarding success indices
  const onboardingMetrics = [
    { task: 'Register District Multi-School Groups', score: 100, isFinalized: true },
    { task: 'Set Up White Label Domain Routing', score: 80, isFinalized: true },
    { task: 'Initialize Strategic SLA Contract Files', score: 10, isFinalized: false }
  ];

  // Toast Notification triggered helper
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProductPurchase = (productId: string, cost: number) => {
    setPurchasedProducts(prev => [...prev, productId]);
    showToast(`Licensing cleared! Transaction finalized under standard ledger: -$${cost}.00`);
  };

  const handleCreateProductSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemTitle || !customItemCost) return;
    const nextItem = {
      id: `item_${Date.now()}`,
      name: customItemTitle,
      author: currentUser?.name || 'Academic Consultant',
      sales: 0,
      proceeds: 0
    };
    setCreatorItems([nextItem, ...creatorItems]);
    showToast(`Successfully published "${customItemTitle}" educational resource to the vendor pipeline.`);
    setCustomItemTitle('');
    setCustomItemCost('');
  };

  const handleRegisterDeveloperKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    const nextKey = {
      name: newKeyName,
      key: `ed_live_${Math.random().toString(36).substring(2, 22)}`,
      status: 'Live',
      requests24h: 0
    };
    setDeveloperKeys([...developerKeys, nextKey]);
    setNewKeyName('');
    showToast(`Dispatched secure developer key pair: ${nextKey.key}`);
  };

  // Real-time terminal logs state
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[08:14:22] SECURE_GATEWAY_UP: Listening on port 3000... Isolation scopes: CENTRAL_CREST_1, KINGDOM_DIOCESE_1",
    "[08:14:25] API_AUTHORIZED: Key ed_live_fk90s11aa90qww42d931 successfully authenticated for MTN Webhook Integration.",
    "[08:15:30] POST /api/v1/sync HTTP/1.1 200 OK - Payload: { assessmentMarksPush: 42, syncStatus: 'COMPLETED' }",
  ]);

  useEffect(() => {
    if (activeTab !== 'developer') return;
    
    const candidates = [
      "POST /api/v1/sync/student-passport HTTP/1.1 200 OK - Synced Nene Mensah (SGP-2026-9012)",
      "GET /api/v1/certificates/verify?qr=0xAC95542DA3 HTTP/1.1 200 OK - Signature validated against: Hon_Beatrice_O0",
      "POST /api/v1/webhooks/push HTTP/1.1 200 OK - Dispatched school-parent advisory SMS via MTN escrows",
      "GET /api/v1/academic/attendance HTTP/1.1 304 NOT_MODIFIED - Fingerprint vectors already cached locally",
      "POST /api/v1/licensing/authorize HTTP/1.1 200 OK - Authorized NTR-2026-8809 (Dr. Evelyn Vance)",
      "POST /api/v1/sync/curriculum HTTP/1.1 200 OK - Disseminated block reference STEM-VOL-1.4 to 125 instances",
      "GET /api/v1/fees/clearing-house HTTP/1.1 200 OK - Verified Escrow allocation: $12,450 cleared via EcoBank",
      "POST /api/v1/jobs/apply HTTP/1.1 201 CREATED - Mapped verified Teacher Credentials to STEM Director post",
      "GET /api/v1/research/tertiary HTTP/1.1 200 OK - Extracted 42 active project publications from Antigravity Uni",
      "POST /api/v1/sync/system-telemetry HTTP/1.1 200 OK - System load check: 44ms response latency, 38 container replicas"
    ];

    const timer = setInterval(() => {
      const randomText = candidates[Math.floor(Math.random() * candidates.length)];
      const now = new Date();
      const timestamp = `[${now.toTimeString().split(' ')[0]}]`;
      const fullLogStr = `${timestamp} ${randomText}`;
      setTerminalLogs(prev => {
        const next = [...prev, fullLogStr];
        if (next.length > 15) {
          return next.slice(next.length - 15);
        }
        return next;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [activeTab]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 p-1">
      
      {/* Dynamic Toast Popup */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#1A56DB] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 font-sans font-semibold text-xs border border-blue-400"
          >
            <Coins className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STRATEGIC HUB TOP HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#071626] to-[#0A2036] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl relative overflow-hidden select-none">
        <div className="absolute right-0 top-0 opacity-[0.03] translate-x-12 -translate-y-6">
          <TrendingUp className="w-96 h-96 text-sky-400" />
        </div>
        <div className="space-y-2 relative z-10 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold bg-[#14B8A6] px-3 py-1 rounded-full uppercase tracking-wider border border-teal-400/30">
               Stage 9 SaaS Enterprise Infrastructure
            </span>
            <span className="text-[10px] font-mono font-bold bg-amber-600 px-3 py-1 rounded-full uppercase tracking-wider border border-amber-400/30 text-amber-50">
               Investor-Grade Model
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display text-white">
            Ecosystem Marketplace & Strategic Hub
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            Unify third-party microservice integration hubs, coordinate jobs recruitment ledgers, manage content creators revenue share models, issue validated certificates, and monitor SaaS financial telemetry.
          </p>
        </div>
      </div>

      {/* SYSTEM CATEGORY MODE SELECTION CHIPS */}
      <div className="flex gap-2 bg-slate-50 border border-slate-200 p-2 rounded-2xl overflow-x-auto select-none">
        {[
          { id: 'marketplace', label: 'Ecosystem Marketplace', icon: ShoppingBag },
          { id: 'investor', label: 'Investor Dashboard', icon: TrendingUp },
          { id: 'developer', label: 'Developer & API Portal', icon: Key },
          { id: 'recruitment', label: 'Recruitment & Job Center', icon: Briefcase },
          { id: 'enterprise', label: 'Enterprise Contract Files', icon: FolderLock }
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = activeTab === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id as any)}
              className={`px-4 py-3 text-xs font-extrabold rounded-xl cursor-pointer flex items-center gap-2 transition-all whitespace-nowrap shadow-xs ${
                isActive 
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform -translate-y-0.5 font-sans' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* DYNAMIC TAB COMPONENT OUTPUT FEED */}
      <div className="space-y-6">

        {/* TAB 1: EDUCORE ECOSYSTEM MARKETPLACE & CREATOR WORKSHOPS */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Products Explorer Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
                
                {/* Search & Category Filter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Ecosystem Catalog Resources</h3>
                    <p className="text-xs text-slate-450">Browse and subscribe instantly to micro-learning packages.</p>
                  </div>
                  
                  {/* Category select chips */}
                  <div className="flex flex-wrap gap-1 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    {['All', 'Educational Content', 'Exam Packs', 'AI Extensions', 'Report Templates', 'Mobile App Themes'].map(item => (
                      <button
                        key={item}
                        onClick={() => setMarketCategory(item)}
                        className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg cursor-pointer transition-all ${
                          marketCategory === item 
                            ? 'bg-white text-blue-600 shadow-xs' 
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Products Cards Lists Area */}
                <div className="space-y-4">
                  {availableProducts
                    .filter(pr => marketCategory === 'All' || pr.type === marketCategory)
                    .map(pr => {
                      const isPurchased = purchasedProducts.includes(pr.id);
                      return (
                        <div key={pr.id} className="p-4.5 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-100/50 transition-all">
                          <div className="space-y-2 max-w-xl text-left select-text">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] bg-blue-105 border border-blue-200 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                {pr.type}
                              </span>
                              <span className="text-xs text-amber-500 font-mono font-bold">★ {pr.rate.toFixed(1)} Rating Index</span>
                              <span className="text-[9.5px] font-mono text-slate-400">({pr.downloadedCount} downloads synced)</span>
                            </div>
                            <h4 className="text-xs font-black text-slate-900 font-sans">{pr.title}</h4>
                            <p className="text-[10.5px] text-slate-500 leading-relaxed">{pr.description}</p>
                            <span className="text-[9px] font-mono text-slate-400 block mt-1">Publisher Authority: <strong className="text-slate-705 font-bold">{pr.author}</strong></span>
                          </div>

                          <div className="sm:text-right shrink-0 flex flex-col items-start sm:items-end justify-between font-mono space-y-2">
                            <span className="text-lg font-black text-slate-800">${pr.costSingular}.00</span>
                            {isPurchased ? (
                              <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-[9.5px] font-black uppercase flex items-center gap-1.5">
                                <CheckCircle className="w-3.5 h-3.5" /> Licensed node Active
                              </span>
                            ) : (
                              <button
                                onClick={() => handleProductPurchase(pr.id, pr.costSingular)}
                                className="px-4 py-2 bg-blue-600 font-sans hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-all"
                              >
                                License resource
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

              </div>

              {/* Developer Store Mini integration applet list */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4.5 h-4.5 text-blue-600" /> Third-Party App Store integrations ({thirdPartyApps.length})
                  </h3>
                  <p className="text-xs text-slate-500">Allow certified external developers to mount operational applications on top of school nodes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans">
                  {thirdPartyApps.map(app => {
                    const isInstalled = installedApps.includes(app.id);
                    return (
                      <div key={app.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3.5 relative flex flex-col justify-between">
                        <div className="space-y-1.5 text-left">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] font-mono text-slate-400 uppercase font-black">{app.provider}</span>
                            <span className="text-[9.5px] font-mono text-amber-500 font-extrabold">★ {app.rating}</span>
                          </div>
                          <h4 className="text-xs font-extrabold text-slate-900 leading-tight">{app.title}</h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed">{app.description}</p>
                        </div>

                        {isInstalled ? (
                          <div className="flex justify-between items-center text-[10px] pt-2 border-t border-slate-150">
                            <span className="text-emerald-700 font-black uppercase tracking-wide flex items-center gap-1">
                              <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" /> Active
                            </span>
                            <button
                              onClick={() => {
                                setInstalledApps(installedApps.filter(id => id !== app.id));
                                showToast(`Unmounted "${app.title}" from school node records.`);
                              }}
                              className="text-xs text-red-650 hover:underline cursor-pointer"
                            >
                              Uninstall
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setInstalledApps([...installedApps, app.id]);
                              showToast(`Successfully mounted "${app.title}" software bundle.`);
                            }}
                            className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-extrabold cursor-pointer"
                          >
                            Install Integration
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Creator Economy & Earnings ledger panel */}
            <div className="space-y-6 lg:col-span-1">
              
              {/* Creator dashboard widget */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Coins className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider">Creator Economy Tally</h3>
                </div>

                <div className="grid grid-cols-2 gap-3.5 font-mono text-center">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] text-slate-400 block font-sans">Ecosystem Revenue</span>
                    <span className="text-sm font-black text-[#1A56DB]">${creatorRevenueShare.totalEarnings.toLocaleString()}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                    <span className="text-[9px] text-slate-400 block font-sans">Platform Fee Cap</span>
                    <span className="text-sm font-black text-rose-600">{creatorRevenueShare.platformCut}</span>
                  </div>
                </div>

                {/* Publish creator item form */}
                <form onSubmit={handleCreateProductSubmission} className="space-y-3 pt-3 border-t border-slate-150 text-xs font-sans">
                  <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">Publish New Material</h4>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Material Title</label>
                    <input
                      type="text"
                      required
                      value={customItemTitle}
                      onChange={e => setCustomItemTitle(e.target.value)}
                      placeholder="e.g. Grade 9 Science notes"
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Category Type</label>
                      <select
                        value={customItemType}
                        onChange={e => setCustomItemType(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      >
                        <option value="Lesson Plans">Lesson Plans</option>
                        <option value="Exam Packs">Exam Packs</option>
                        <option value="AI Extensions">AI Extensions</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Suggested Price ($)</label>
                      <input
                        type="number"
                        required
                        value={customItemCost}
                        onChange={e => setCustomItemCost(e.target.value)}
                        placeholder="45"
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Deploy to Marketplace Queue
                  </button>
                </form>

                {/* Active sales files */}
                <div className="space-y-2.5 pt-3 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block text-left">Your current published assets</span>
                  <div className="space-y-2 font-mono text-[10.5px]">
                    {creatorItems.map(it => (
                      <div key={it.id} className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg text-left">
                        <div className="flex justify-between font-bold">
                          <span className="text-slate-800 text-xs truncate leading-tight w-4/5">{it.name}</span>
                          <span className="text-[#1A56DB]">{it.sales} sales</span>
                        </div>
                        <span className="text-[9.5px] text-emerald-700 font-black block mt-0.5">Clearing proceeds: ${it.proceeds}.00</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Digital Certification QR validations */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-1 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-indigo-600 animate-pulse" /> Digital Certificate system
                  </h3>
                  <p className="text-xs text-slate-500">Design, issue, and verify student achievements with cryptographically unique QR hashes.</p>
                </div>

                <div className="space-y-3.5 text-xs font-sans text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Recipient Student Full name</label>
                    <input
                      type="text"
                      value={selectedCertRecipient}
                      onChange={e => setSelectedCertRecipient(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Course / Accomplishment</label>
                    <input
                      type="text"
                      value={selectedCertCourse}
                      onChange={e => setSelectedCertCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                    />
                  </div>

                  <button
                    onClick={() => {
                      const hash = `0x${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
                      const next = {
                        id: `cert_${Date.now()}`,
                        name: selectedCertRecipient,
                        course: selectedCertCourse,
                        verified: true,
                        signature: 'Sovereign_Trust_Authority_09',
                        qrHash: hash
                      };
                      setGeneratedCertificates([next, ...generatedCertificates]);
                      showToast(`Cryptographic Certificate generated under verification key: ${hash}. Signed!`);
                    }}
                    className="w-full py-2 bg-emerald-600 font-sans hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl cursor-pointer"
                  >
                    Generate signed PDF & QR Node
                  </button>

                  <div className="space-y-2.5 pt-3 border-t border-slate-150">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block">Certificate Vault Registry</span>
                    <div className="space-y-2 font-mono text-[10.5px]">
                      {generatedCertificates.map(c => (
                        <div key={c.id} className="p-2.5 bg-[#071626] text-white rounded-xl space-y-1 text-left relative overflow-hidden border border-slate-800">
                          <div className="absolute right-2.5 top-2 opacity-[0.2]">
                            <QrCode className="w-8 h-8 text-indigo-400" />
                          </div>
                          <span className="font-sans font-black tracking-tight block text-white truncate w-4/5">{c.name}</span>
                          <span className="text-[9.5px] text-slate-400 block leading-tight">{c.course}</span>
                          <div className="flex justify-between items-center text-[8.5px] text-indigo-300 font-bold block pt-1.5 border-t border-slate-800 mt-1">
                            <span>Hash: {c.qrHash}</span>
                            <span className="text-emerald-400">✔ SGP-VERIFIED</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: INVESTOR DASHBOARD & SAAS METRICS */}
        {activeTab === 'investor' && (
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            
            {/* Header top row */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-150">
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Investor-Grade SaaS diagnostic dashboards</h3>
                <p className="text-xs text-slate-500">Macro SaaS KPI telemetry, growth modeling forecasting, and regional monetization metrics.</p>
              </div>

              {/* PDF Strategic download */}
              <button
                onClick={() => showToast("strategic data packet prepared. All compliance nodes verified.")}
                className="px-4 py-2.5 bg-[#1A56DB] hover:bg-blue-700 text-white rounded-xl text-xs font-black cursor-pointer font-sans"
              >
                Produce Acquisition Dossier
              </button>
            </div>

            {/* Top metrics indices cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono select-none">
              
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Monthly Recur Revenue (MRR)</span>
                <div className="text-xl font-black text-emerald-600">${investorMetrics.mrr.toLocaleString()}</div>
                <span className="text-[9.5px] text-slate-400 block">SGP SaaS sub-nodes realized</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Annual Recur Revenue (ARR)</span>
                <div className="text-xl font-black text-[#1A56DB]">${investorMetrics.arr.toLocaleString()}</div>
                <span className="text-[9.5px] text-slate-400 block font-bold text-slate-800">Run-rate velocity</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Customer LTV index</span>
                <div className="text-xl font-black text-indigo-700">${investorMetrics.ltv.toLocaleString()}</div>
                <span className="text-[9.5px] text-slate-400 block">Enterprise segment valuation</span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center space-y-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase font-sans">Platform Monthly Churn</span>
                <div className="text-xl font-black text-rose-600">{investorMetrics.churnRate}</div>
                <span className="text-[9.5px] text-slate-450 block">Extreme SaaS retention factor</span>
              </div>

            </div>

            {/* Interactive Graph Projection panel */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none leading-relaxed">
              
              {/* Projection canvas representation */}
              <div className="lg:col-span-2 bg-[#0E1E2F] text-white p-6 rounded-2xl relative flex flex-col justify-between min-h-[350px] border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] text-sky-400 font-mono tracking-wider font-extrabold uppercase">SaaS CAGR Exponential modeling</span>
                  <h4 className="text-sm font-extrabold text-white">Revenue Growth trajectory mapping to {growthForecastYears}</h4>
                </div>

                {/* SVG Graph plotting */}
                <div className="flex-1 flex items-center justify-center relative p-4">
                  <svg viewBox="0 0 400 150" className="w-full max-w-lg h-auto overflow-hidden">
                    {/* Linear line path standard */}
                    <path
                      d="M20,120 Q120,95 220,55 T380,20"
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                    {/* Dots pinpoint nodes */}
                    <circle cx="20" cy="120" r="4.5" fill="#EF4444" />
                    <circle cx="220" cy="55" r="4.5" fill="#3B82F6" />
                    <circle cx="380" cy="20" r="5" fill="#10B981" />
                    {/* Dash helper grid boundaries */}
                    <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                    <line x1="220" y1="150" x2="220" y2="10" stroke="rgba(255,255,255,0.06)" strokeDasharray="3" />
                  </svg>

                  {/* Micro index boxes overlays */}
                  <div className="absolute top-1/4 right-1/4 bg-slate-900 border border-slate-750 px-3 py-1.5 rounded-lg text-left text-[10px] font-mono w-48 text-slate-300">
                    <span className="text-emerald-400 font-bold tracking-tight">AI BI Growth Engine prediction:</span>
                    <p className="mt-0.5">• Total ARR: <strong>$6.2M targets</strong></p>
                    <p>• Upsell probability: <strong>94.2%</strong></p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                  <div className="space-y-0.5 text-left">
                    <span className="text-[10px] text-slate-400">Target projection endpoint year boundaries:</span>
                  </div>
                  <select
                    value={growthForecastYears}
                    onChange={e => setGrowthForecastYears(parseInt(e.target.value))}
                    className="px-2.5 py-1 text-[11px] font-mono border border-slate-700 bg-slate-800 font-bold rounded-lg outline-none cursor-pointer"
                  >
                    <option value={2028}>Moderate Cycle Projection (2028)</option>
                    <option value={2030}>Aggressive International Rollout (2030)</option>
                  </select>
                </div>
              </div>

              {/* Right Multi-revenue streams & Onboarding status checklist */}
              <div className="space-y-6 lg:col-span-1 text-left">
                
                {/* Partners directories */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-750">Ecosystem Partnerships & telecommunications</h4>
                  <div className="space-y-3 font-mono text-[10px]">
                    {partnerFirms.map(part => (
                      <div key={part.id} className="p-3 bg-slate-50 border border-slate-155 rounded-xl space-y-1 hover:bg-slate-100/50">
                        <div className="flex justify-between items-center font-bold text-slate-850">
                          <span>{part.firm}</span>
                          <span className="text-[9px] bg-indigo-50 border border-indigo-100 px-1 p-0.2 text-indigo-700 rounded uppercase">{part.status}</span>
                        </div>
                        <div className="text-[9.5px] text-slate-505">Domain: {part.type}</div>
                        <span className="text-[9.5px] text-emerald-700 font-black block pt-0.5 mt-0.5">Clearing gateway volume: ${part.annualClearingUSD.toLocaleString()}/annum</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Acquisition governance check status */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3.5">
                  <h4 className="text-xs font-black uppercase text-slate-700 font-sans tracking-wide">Governance compliance checklists</h4>
                  
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {onboardingMetrics.map((met, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-150 rounded-lg">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                          met.isFinalized ? 'bg-emerald-500' : 'bg-amber-400'
                        }`}>
                          {met.isFinalized ? '✔' : '⏳'}
                        </span>
                        <div>
                          <p className="font-sans font-extrabold text-slate-800 leading-tight">{met.task}</p>
                          <span className="text-[9px] text-[#1A56DB] font-mono">Setup complete index: {met.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: DEVELOPER API PORTAL */}
        {activeTab === 'developer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left Keys registration form */}
            <div className="lg:col-span-1 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
              <div className="space-y-1 pb-2 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-800">Developer Platform credentials</h3>
                <p className="text-xs text-slate-500">Unify external custom microservice operations and webhooks.</p>
              </div>

              <form onSubmit={handleRegisterDeveloperKey} className="space-y-3.5 text-xs font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Key Nickname Identifier</label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={e => setNewKeyName(e.target.value)}
                    placeholder="e.g. Sanlam Sync Webhook"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-[#1A56DB] hover:bg-blue-700 text-white text-xs font-extrabold rounded-xl cursor-pointer"
                >
                  Generate dynamic key authority
                </button>
              </form>

              {/* Set Webhook endpoints config URL */}
              <div className="space-y-3 pt-3 border-t border-slate-150 text-xs font-sans">
                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">Configure Central Webhook Target</h4>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Escrow webhook endpoint DNS</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={e => setWebhookUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none font-mono"
                  />
                </div>
                <button
                  onClick={() => showToast(`Successfully bound Webhook coordinates endpoint to standard DNS: ${webhookUrl}`)}
                  className="w-full py-1.5 border border-slate-200 hover:bg-slate-50 text-[10.5px] font-bold rounded-lg cursor-pointer text-slate-705"
                >
                  Save webhook targets
                </button>
              </div>
            </div>

            {/* Right details files lists */}
            <div className="lg:col-span-2 bg-white border border-slate-205 p-6 rounded-2xl shadow-sm space-y-6">
              
              <div className="space-y-1 pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Credentials authority files</h3>
                <p className="text-xs text-slate-400">Keep track of keys access. All signatures validated by the National Ministry trust protocols.</p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {developerKeys.map((k, index) => (
                  <div key={index} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 relative">
                    <div className="flex justify-between items-center bg-[#071626] px-3 py-1 text-white text-[10px] rounded-lg">
                      <span>Unique Key Node Name: <strong>{k.name}</strong></span>
                      <span className="text-sky-400 font-bold">● ACTIVE</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-bold break-all p-1.5 bg-slate-100 border border-slate-200 rounded-lg select-all">
                      OAuth Bearer Secret: {k.key}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-405 pt-1">
                      <span>Synchronized API requests count (Last 24h): <strong>{k.requests24h} cycles</strong></span>
                      <button
                        onClick={() => {
                          setDeveloperKeys(developerKeys.filter(item => item.key !== k.key));
                          showToast(`Revoked programmatic authority key: ${k.key}`);
                        }}
                        className="text-red-650 hover:underline cursor-pointer"
                      >
                        De-authorize authority key
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-[#0E1E2F] text-white rounded-xl space-y-2 select-text font-mono text-[10.5px] leading-relaxed">
                <div className="flex items-center gap-1.5 text-sky-400 font-extrabold uppercase">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Interactive Developer SDK guidelines overview</span>
                </div>
                <p className="text-slate-350">
                  Secure programmatic endpoints resolve against `/api/v1/sync` under standard OAuth 2.0 authorization rules. Micro-tenant context passes completely isolated headers.
                </p>
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg font-mono text-[9.5px] text-sky-300">
                  curl -X POST "https://{webhookUrl.split('/')[2]}/api/v1/sync" \<br />
                  &nbsp;&nbsp;-H "Authorization: Bearer ed_live_fk90s11..." \<br />
                  &nbsp;&nbsp;-H "X-School-Node-Isolation: CENTRAL_CREST_1"
                </div>
              </div>

              {/* REAL-TIME TERMINAL CONSOLE */}
              <div className="bg-slate-950 border border-slate-900 p-4 rounded-xl shadow-inner space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800 text-slate-400 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 ml-1">Live Server-Side Mock API Streams Terminal</span>
                  </div>
                  <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-sky-450 animate-pulse font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span> LIVE FEED
                  </span>
                </div>

                <div className="space-y-1.5 h-[200px] overflow-y-auto pr-1 text-emerald-400 text-[10.5px] leading-relaxed select-text font-mono">
                  {terminalLogs.map((log, idx) => {
                    let colorClass = "text-slate-300";
                    if (log.includes("200 OK") || log.includes("201 CREATED")) {
                      colorClass = "text-emerald-400 font-bold";
                    } else if (log.includes("AUTHORIZED") || log.includes("UP:")) {
                      colorClass = "text-sky-400 font-extrabold";
                    } else if (log.includes("304")) {
                      colorClass = "text-amber-400";
                    }
                    return (
                      <div key={idx} className={`${colorClass} hover:bg-slate-900/50 p-0.5 rounded transition-all flex gap-1.5`}>
                        <span className="text-slate-650 shrink-0 font-bold select-none">&gt;</span>
                        <span>{log}</span>
                      </div>
                    );
                  })}
                  <div className="flex items-center gap-1 text-emerald-500 select-none animate-pulse">
                    <span>&gt; _</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400 select-none">
                  <span>Routing Target Host: <strong className="text-sky-300 font-mono">/api/v1/*</strong></span>
                  <button 
                    onClick={() => {
                      setTerminalLogs([`[${new Date().toTimeString().split(' ')[0]}] TERMINAL_FLUSH: Cleared cache. Initialized telemetry listening.`]);
                      showToast("Terminal buffer flushed successfully.");
                    }}
                    className="text-amber-500 hover:underline cursor-pointer font-bold uppercase text-[9px] font-mono"
                  >
                    Clear buffer logs
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: RECRUITMENT & JOBS PORTAL */}
        {activeTab === 'recruitment' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
            
            {/* Left Vacancies Lists */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
                
                {/* Title and searches inputs search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-150 select-none">
                  <div className="space-y-1">
                    <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Education Jobs & Recruitment portal</h3>
                    <p className="text-xs text-slate-450">Review vacancy postings or apply directly using compiled teacher profile records.</p>
                  </div>

                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs w-full sm:w-60">
                    <Search className="w-4 h-4 text-slate-450 shrink-0" />
                    <input
                      type="text"
                      placeholder="Search active listings..."
                      value={jobSearchQuery}
                      onChange={e => setJobSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>

                {/* Listings loops */}
                <div className="space-y-4">
                  {vacancies
                    .filter(v => v.title.toLowerCase().includes(jobSearchQuery.toLowerCase()))
                    .map(vac => {
                      const applied = appliedJobIds.includes(vac.id);
                      return (
                        <div key={vac.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:bg-slate-100/50 transition-all">
                          <div className="space-y-1 text-left">
                            <span className="text-[9.5px] font-mono text-indigo-700 font-extrabold bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase">
                              {vac.type}
                            </span>
                            <h4 className="text-xs font-black font-sans text-slate-900 mt-1">{vac.title}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">Posted by: {vac.classNode} • Applicants submitted: {vac.applicants} members</p>
                            <span className="text-[10px] text-emerald-800 font-extrabold block">Salary Compensation index: {vac.salaryRange}</span>
                          </div>

                          <div className="shrink-0">
                            {applied ? (
                              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-205 rounded-xl text-[10px] font-extrabold uppercase font-sans flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Applied Successfully
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  setAppliedJobIds([...appliedJobIds, vac.id]);
                                  showToast(`Application successfully files and mapped to your verified profile logs!`);
                                }}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-extrabold cursor-pointer transition-colors font-sans"
                              >
                                File Application
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

              </div>
            </div>

            {/* Right Scholarship Funding Tracker */}
            <div className="lg:col-span-1 space-y-6 select-none font-sans text-xs">
              
              <div className="bg-white border border-slate-20D p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                    <Award className="w-5 h-5 text-[#14B8A6]" /> Scholarship Portfolio
                  </h3>
                  <p className="text-xs text-slate-500">Coordinate Sovereign Funding grants allocation indicators.</p>
                </div>

                <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-850 text-center font-mono">
                  <span className="text-[9.5px] text-indigo-300 block uppercase font-sans">Strategic Funding Pool Outstanding</span>
                  <div className="text-2xl font-black text-rose-500">${scholarshipFundingTotal?.toLocaleString()}.00</div>
                  <span className="text-[9.5px] text-slate-400 block pt-1 font-sans">Grants and Trust fund synchronization</span>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-150">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block">Scholarship allocations ledger</span>
                  <div className="space-y-2.5 font-mono text-[10px]">
                    {scholarshipAwards.map(sch => (
                      <div key={sch.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-1 text-left">
                        <div className="flex justify-between font-bold text-slate-800">
                          <span>Recipient Name: <strong>{sch.name}</strong></span>
                          <span className="text-emerald-700 font-black">${sch.allocationUSD.toLocaleString()} cap</span>
                        </div>
                        <p className="text-[9px] text-slate-500 leading-snug truncate">Sponsor Fund: {sch.sponsor}</p>
                        <div className="flex justify-between items-center text-[9.5px] text-slate-405 pt-1 border-t border-slate-150 mt-1">
                          <span>Verified: {sch.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: ENTERPRISE CONTRACT FILES & INTERNATIONAL BILLINGS */}
        {activeTab === 'enterprise' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left font-sans text-xs">
            
            {/* Left SLA files lists */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white border border-slate-205 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-2 border-b border-slate-100 select-none">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Enterprise agreements & Contract SLA dossiers</h3>
                  <p className="text-xs text-slate-400">Keep strategic contracts and active renewal metrics up to standard.</p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {enterpriseContracts.map(ent => (
                    <div key={ent.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl space-y-2 hover:bg-slate-100/50 transition-all">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-[#1A56DB] text-xs">{ent.entity}</span>
                        <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-750 font-black px-1.5 py-0.5 rounded">
                          Renewal: {ent.renewalDate}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-[10px] text-slate-500 border-t border-slate-150 pt-2 pb-1">
                        <div>SaaS Nodes deployment: <strong>{ent.nodesCount} Networks</strong></div>
                        <div>SLA Commitments Index: <strong>{ent.slaTarget}</strong></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated add SLA */}
                <button
                  onClick={() => showToast("Added dummy draft for Western Diocese federation contract SLA reviews.")}
                  className="w-full py-2.5 bg-[#071626] text-white hover:bg-slate-805 text-xs font-extrabold rounded-xl cursor-pointer font-sans"
                >
                  Create New Enterprise Agreement File Draft
                </button>
              </div>
            </div>

            {/* Right International tax parameters configuration */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="space-y-1 pb-1 border-b border-slate-100 select-none">
                  <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-4.5 h-4.5 text-blue-600 animate-spin" /> Cross-Border Billings
                  </h3>
                  <p className="text-xs text-slate-500">Configure global currency indices and regional tax templates.</p>
                </div>

                {/* Currency select */}
                <div className="space-y-1.5 text-xs font-sans text-left">
                  <label className="text-[10px] text-slate-400 font-extrabold uppercase font-mono">Select Base Accounting Currency</label>
                  <select
                    value={billingCurrency}
                    onChange={e => {
                      setBillingCurrency(e.target.value as any);
                      showToast(`Unified billing currency switched to standard: ${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none"
                  >
                    <option value="USD">USD ($) Standard Base</option>
                    <option value="GHS">GHS (₵) West Africa Regional</option>
                    <option value="EUR">EUR (€) Euro-Peon Sovereign</option>
                    <option value="GBP">GBP (£) Sterling United</option>
                  </select>
                </div>

                {/* Tax codes values registry */}
                <div className="space-y-2.5 pt-3 border-t border-slate-150 select-none">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase font-mono block text-left">Active Regional Tax matrices</span>
                  <div className="space-y-2 font-mono text-[9.5px]">
                    {regionalTaxationRates.map((tx, idx) => (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-150 rounded-lg flex justify-between items-center text-left">
                        <div>
                          <span className="font-sans font-extrabold text-slate-800 block truncate">{tx.country}</span>
                          <span className="text-slate-400">Regional code: {tx.code}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#1A56DB] font-extrabold block">{tx.vatPercent}% Standard VAT</span>
                          <span className="text-slate-400">{tx.typicalSurcharge} surcharge</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
