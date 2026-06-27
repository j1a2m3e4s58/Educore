/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  Building2, 
  Users, 
  GraduationCap, 
  Cpu, 
  Activity, 
  Sparkles, 
  UserCheck, 
  BookOpen 
} from 'lucide-react';
import { School, User } from '../types';

interface GuidedTourProps {
  isOpen: boolean;
  onClose: () => void;
  schools: School[];
  allUsers: User[];
  onTriggerSession: (user: User | null, tenant: School | null, activeTab: string) => void;
  currentUserId: string | undefined;
  activeTab: string;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

export default function GuidedTour({
  isOpen,
  onClose,
  schools,
  allUsers,
  onTriggerSession,
  currentUserId,
  activeTab,
  currentStep,
  setCurrentStep
}: GuidedTourProps) {

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to EduCore & EduOS Platform",
      role: "Guest Overview",
      description: "Welcome to the Unified Multi-Tenant National Educational Operating System. This interactive onboarding companion guides you through our unified portals in real-time, automatically switching sessions so you do not need to log out and research mock passwords!",
      icon: Compass,
      color: "from-blue-600 to-indigo-700",
      setup: () => {
        // Keep current state or log out to show login page overview
      },
      highlights: [
        "Interactive cross-role exploration",
        "Integrated multi-tenant database isolation",
        "No manual signup or logging required"
      ]
    },
    {
      title: "Super Admin Control Panel",
      role: "SuperAdmin Portal",
      description: "Step into the shoes of the Global Super-Administrator. Manage the entire nation's multi-tenant database records, provision school row allotments, suspend frozen instances, customize SaaS billings, and inspect global container audit logging.",
      icon: Building2,
      color: "from-indigo-700 to-slate-900",
      setup: () => {
        const saUser = allUsers.find(u => u.role === 'SuperAdmin');
        if (saUser) {
          onTriggerSession(saUser, null, 'dashboard');
        }
      },
      highlights: [
        "Manage Multi-Tenant tenants & licenses",
        "Alter subscription tiers and SaaS limits",
        "SOC-2 secure system health dials"
      ]
    },
    {
      title: "Teacher Academic Assistant",
      role: "Faculty Portals",
      description: "Meet Marcus Brody, a Mathematics Lecturer inside Central Crest Academy. Explore the interactive daily dashboards where staff take fingerprint attendance, utilize Generative AI lesson plan builders, and compile student score card vectors.",
      icon: UserCheck,
      color: "from-teal-600 to-emerald-700",
      setup: () => {
        const teacher = allUsers.find(u => u.role === 'Teacher');
        const centralCrest = schools.find(s => s.id === 'school_central_crest');
        if (teacher && centralCrest) {
          onTriggerSession(teacher, centralCrest, 'teacher-dashboard');
        }
      },
      highlights: [
        "Frictionless finger-scan attendance ledgers",
        "AI Exam & Lesson Material Generators",
        "Electronic assignment trackers with ratings"
      ]
    },
    {
      title: "Permanent Digital Student Passport",
      role: "Student Desk Desk",
      description: "Log in as Julian Vance. View standard high-school grade tracking sheets, retrieve cryptographically signed, permanent regional education certificates, check lessons, and file homework assignments.",
      icon: GraduationCap,
      color: "from-violet-600 to-purple-800",
      setup: () => {
        const student = allUsers.find(u => u.role === 'Student');
        const centralCrest = schools.find(s => s.id === 'school_central_crest');
        if (student && centralCrest) {
          onTriggerSession(student, centralCrest, 'student-dashboard');
        }
      },
      highlights: [
        "Unyielding security-stamped student ID",
        "Permanent digital transcripts record",
        "Instant visual certificate verification"
      ]
    },
    {
      title: "National Command & Telemetry Center",
      role: "Ministry Level Command",
      description: "Elevate your credentials back to Ministry level. Monitor real-time geospatial regional clusters, study Cloud scaling telemetry with automated auto-scaling simulation, and analyze live Advanced Student Metrics (enrollment vs certificates & regional competency) powered by Recharts!",
      icon: Activity,
      color: "from-purple-800 to-rose-950",
      setup: () => {
        const saUser = allUsers.find(u => u.role === 'SuperAdmin');
        if (saUser) {
          onTriggerSession(saUser, null, 'eduos-engine');
        }
      },
      highlights: [
        "Interactive GIS District map",
        "Recharts Passing Rates comparison widgets",
        "Cloud auto-scaling workload tests"
      ]
    },
    {
      title: "Commercialization & Creator Economy Hub",
      role: "Developer & Marketplace",
      description: "Understand the broader commercialization suite. Create and sell lesson packages, configure developer API authorization keys, apply for recruitment vacancies, and view the live read-only server-side REST API request output terminal stream!",
      icon: Cpu,
      color: "from-[#0F1E35] to-slate-900",
      setup: () => {
        const saUser = allUsers.find(u => u.role === 'SuperAdmin');
        if (saUser) {
          onTriggerSession(saUser, null, 'commercial-hub');
        }
      },
      highlights: [
        "Creator digital license market",
        "Teacher job search and application filing",
        "Live Mock API requests stream CRT Monitor"
      ]
    }
  ];

  const handleNext = () => {
    const nextIdx = currentStep + 1;
    if (nextIdx < steps.length) {
      setCurrentStep(nextIdx);
      steps[nextIdx].setup();
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    const prevIdx = currentStep - 1;
    if (prevIdx >= 0) {
      setCurrentStep(prevIdx);
      steps[prevIdx].setup();
    }
  };

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-slate-150 flex flex-col"
      >
        
        {/* Step Banner Color block */}
        <div className={`bg-gradient-to-r ${currentStepData.color} p-6 text-white text-left relative overflow-hidden select-none`}>
          <div className="absolute -right-6 -bottom-6 opacity-10">
            <StepIcon className="w-36 h-36" />
          </div>
          <div className="flex justify-between items-start relative z-10">
            <span className="text-[10px] font-mono font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-white/20">
              Onboarding: Portal Tour {currentStep + 1} of {steps.length}
            </span>
            <button 
              onClick={onClose} 
              className="p-1 rounded-full bg-black/10 hover:bg-black/20 text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2.5 mt-5 relative z-10">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10 backdrop-blur-md">
              <StepIcon className="w-5 h-5 text-yellow-300" />
            </div>
            <div className="text-left">
              <span className="text-[9.5px] font-mono block text-white/70 uppercase font-black uppercase font-bold tracking-wider">{currentStepData.role}</span>
              <h3 className="text-lg font-black tracking-tight">{currentStepData.title}</h3>
            </div>
          </div>
        </div>

        {/* Description and specifics */}
        <div className="p-6 text-left space-y-5 flex-1">
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            {currentStepData.description}
          </p>

          <div className="space-y-2 pb-1.5">
            <h4 className="text-[10px] text-slate-400 font-mono font-black uppercase tracking-wider">Key highlights to discover:</h4>
            <div className="grid grid-cols-1 gap-2">
              {currentStepData.highlights.map((h, i) => (
                <div key={i} className="flex items-center gap-2.5 p-2 bg-slate-50 border border-slate-150 rounded-xl font-sans text-[11px] text-slate-755 font-bold">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[9px]">&#10003;</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer controls */}
        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-150 flex items-center justify-between">
          
          {/* Progress dots */}
          <div className="flex items-center gap-1.5 select-none">
            {steps.map((_, i) => (
              <span 
                key={i} 
                onClick={() => {
                  setCurrentStep(i);
                  steps[i].setup();
                }}
                className={`h-1.5 rounded-full cursor-pointer transition-all ${
                  currentStep === i ? 'w-4 bg-indigo-600' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 font-sans"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="px-4.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-sm font-sans border border-amber-300"
            >
              {currentStep === steps.length - 1 ? 'Finish Tour' : 'Next Step'} <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
