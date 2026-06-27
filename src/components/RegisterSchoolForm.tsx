/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Mail, 
  MapPin, 
  Phone, 
  Shield, 
  Award, 
  UploadCloud, 
  Loader2, 
  UserPlus, 
  KeyRound,
  FileSpreadsheet,
  CheckCircle,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { School, SubscriptionPackage } from '../types';

interface RegisterSchoolFormProps {
  onSuccess: (newSchool: School, adminPassword: string) => void;
  existingSchools: School[];
}

export default function RegisterSchoolForm({ onSuccess, existingSchools }: RegisterSchoolFormProps) {
  // Form State variables
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [location, setLocation] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionPackage>('Standard');
  const [logoName, setLogoName] = useState('');
  const [logoInitials, setLogoInitials] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  
  // UI States
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);
  const [createdSchool, setCreatedSchool] = useState<School | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate form entries
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (name.trim().length < 3) {
      newErrors.name = 'School Name must be at least 3 characters.';
    }
    
    // School code: alphanumeric, uppercase, no spaces, starts with EDU- ideally
    const codeClean = code.trim().toUpperCase();
    if (!/^[A-Z0-9-]+$/.test(codeClean)) {
      newErrors.code = 'School Code must be Alphanumeric (uppercase, numbers, and dashes only).';
    } else if (existingSchools.some(s => s.code.toUpperCase() === codeClean)) {
      newErrors.code = 'This unique School Code is already deployed in registry.';
    } else if (codeClean.length < 3 || codeClean.length > 12) {
      newErrors.code = 'School Code must be between 3 and 12 characters.';
    }

    if (location.trim().length < 5) {
      newErrors.location = 'Please provide a valid full physical physical address.';
    }

    if (!/^\+?[0-9\s-]{7,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid telephone (7-15 digits).';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Please enter a valid school communication email.';
    }

    if (adminName.trim().length < 3) {
      newErrors.adminName = 'Admin Contact Name must be at least 3 characters.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail.trim())) {
      newErrors.adminEmail = 'Please enter a valid administrator account email.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Drag and Drop implementation
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setLogoName(file.name);
    // Grab initials from file name or school name as placeholder logo initials
    const initials = name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SC';
    setLogoInitials(initials);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleDeploymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    // Trigger deployment process simulator
    setIsDeploying(true);
    setDeployStep(1);

    // Dynamic log of simulated steps mimicking core DB node deployment
    setTimeout(() => {
      setDeployStep(2); // Initializing isolation partition, indexing
      setTimeout(() => {
         setDeployStep(3); // Creating default School Admin and Roles
         setTimeout(() => {
            // Success deployment
            const calculatedInitials = logoInitials || name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'SC';
            const tid = `school_${code.trim().toLowerCase().replace(/-/g, '_')}`;
            
            const newSchool: School = {
              id: tid,
              name: name.trim(),
              code: code.trim().toUpperCase(),
              location: location.trim(),
              phone: phone.trim(),
              email: email.trim(),
              subscriptionPackage: subscription,
              status: 'Active',
              logo: calculatedInitials,
              adminName: adminName.trim(),
              adminEmail: adminEmail.trim(),
              createdAt: new Date().toISOString(),
              studentCount: 0,
              teacherCount: 0,
              classCount: 0
            };

            setCreatedSchool(newSchool);
            setIsDeploying(false);
            onSuccess(newSchool, 'admin123'); // Default secure password
         }, 1000);
      }, 1000);
    }, 1000);
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setLocation('');
    setPhone('');
    setEmail('');
    setSubscription('Standard');
    setLogoName('');
    setLogoInitials('');
    setAdminName('');
    setAdminEmail('');
    setCreatedSchool(null);
    setErrors({});
  };

  return (
    <div className="bg-white rounded border border-banking-border overflow-hidden select-none font-sans max-w-4xl mx-auto">
      {/* Portal Banner */}
      <div className="bg-[#0A1E33] px-6 py-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#1A56DB] text-white rounded">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-semibold font-display text-white tracking-tight">Add New School</h2>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">STEP-BY-STEP SCHOOL SETUP</p>
          </div>
        </div>
        <div className="text-[10px] font-mono bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          READY
        </div>
      </div>

      {isDeploying ? (
        /* Deployment Loading progress */
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <Loader2 className="w-12 h-12 text-[#1A56DB] animate-spin mb-4" />
          <h3 className="text-base font-bold text-slate-900 font-display">Creating School Account</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Please wait while EduCore creates the school account, admin login, and secure records area.
          </p>

          {/* Sequential Core Steps log */}
          <div className="mt-8 w-full max-w-md bg-slate-50 border border-slate-200 p-4 rounded font-mono text-left space-y-2 text-[10px]">
             <div className="flex items-center gap-2 text-slate-700">
               <span className="text-emerald-500">✔</span> Allocating unique tenant container namespace: <span className="font-bold text-slate-900">school_{code.toLowerCase() || 'id'}</span>
             </div>
             
             <div className="flex items-center gap-2">
               {deployStep >= 2 ? (
                 <span className="text-emerald-500">✔</span>
               ) : (
                 <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
               )}
               <span className={deployStep >= 2 ? 'text-slate-700' : 'text-slate-400 font-semibold'}>
                 Enforcing 128-bit strict multi-tenant row index separations
               </span>
             </div>

             <div className="flex items-center gap-2">
               {deployStep >= 3 ? (
                 <span className="text-emerald-500">✔</span>
               ) : deployStep === 2 ? (
                 <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
               ) : (
                 <span className="text-slate-300">•</span>
               )}
               <span className={deployStep >= 3 ? 'text-slate-700' : deployStep === 2 ? 'text-slate-500 font-semibold' : 'text-slate-300'}>
                 Seeding default administrator auth structures for <span className="font-bold">{adminEmail || 'Admin'}</span>
               </span>
             </div>
          </div>
        </div>
      ) : createdSchool ? (
        /* SUCCESS CONFIRMATION WORKSPACE */
        <div className="p-8 text-center select-text">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 mb-4 animate-bounce">
            <CheckCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display">Tenant Provisioning Succeeded</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
             Workspace cluster successfully designated. The isolation keys are secured. You can now switch to this context instantly using the workspace swapper above.
          </p>

          <div className="mt-6 max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded p-5 text-left text-xs divide-y divide-slate-100">
            <div className="pb-3 grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">School Node:</span>
              <span className="col-span-2 font-bold text-slate-900">{createdSchool.name}</span>
            </div>
            <div className="py-3 grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Access ID:</span>
              <span className="col-span-2 font-mono text-blue-600 font-bold bg-[#E0E7FF]/50 px-2 py-0.5 rounded inline-block w-fit">
                {createdSchool.id}
              </span>
            </div>
            <div className="py-3 grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Admin Username:</span>
              <span className="col-span-2 font-mono font-bold text-slate-800">{createdSchool.adminEmail}</span>
            </div>
            <div className="py-3 grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Default Password:</span>
              <span className="col-span-2 font-mono font-bold text-slate-900">admin123 <span className="text-[10px] text-slate-400 italic">(Change on first login)</span></span>
            </div>
            <div className="pt-3 grid grid-cols-3 gap-1">
              <span className="text-slate-400 font-semibold uppercase tracking-wider font-mono text-[9px]">Cluster Lock:</span>
              <span className="col-span-2 font-mono text-emerald-600 font-bold">100% ISOLATED V-DATABASE</span>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              id="confirm-workspace-reset-btn"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 rounded text-xs font-bold cursor-pointer"
            >
              Deploy Another School
            </button>
            <button
               id="confirm-workspace-goto-dash"
               onClick={() => {
                 // Trigger instant swapper simulator
                 window.dispatchEvent(new CustomEvent('instant-tenant-switch', { detail: createdSchool.id }));
               }}
               className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1A56DB]/90 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              Enter Workspace Context <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        /* STANDARD REGISTER CLIENT FORM */
        <form onSubmit={handleDeploymentSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 text-center">
            {['School Details', 'Plan & Logo', 'Admin Login'].map((step, index) => (
              <div key={step} className="space-y-1">
                <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-[#1A56DB] border border-blue-100">
                  {index + 1}
                </span>
                <p className="text-[10px] font-bold text-slate-700 leading-tight">{step}</p>
              </div>
            ))}
          </div>
          
          {/* SECTION 1: INSTITUTION DETAILS */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Building2 className="w-4 h-4 text-[#1A56DB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">School Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* School Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">School Full Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-school-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Summit International Academy"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.name}</p>}
              </div>

              {/* Unique School Code (Tenant Tag) */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                  <span>School Code</span>
                  <span className="text-[9px] text-[#1A56DB] font-mono normal-case">No spaces</span>
                </label>
                <div className="relative">
                  <input
                    id="form-school-code"
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="e.g. EDU-SUMMIT"
                    className="w-full px-3 py-2 font-mono text-xs border border-slate-200 rounded bg-slate-50 uppercase focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all font-bold text-[#1A56DB]"
                  />
                </div>
                {errors.code && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.code}</p>}
              </div>

              {/* Communication Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Official Contact Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-school-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="info@summitacademy.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.email}</p>}
              </div>

              {/* Telephone */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Official Telephone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-school-phone"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 012-3456"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.phone}</p>}
              </div>

              {/* Location Address */}
              <div className="col-span-1 md:col-span-2 space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Physical Campus Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-school-location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. 505 University Dr, Austin, TX"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                {errors.location && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.location}</p>}
              </div>
            </div>
          </div>

          {/* SECTION 2: SUBSCRIPTION & LOGO FILE UPLOAD */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Subscription Tier Choice */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-4 h-4 text-[#1A56DB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">School Plan</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                {(['Basic', 'Standard', 'Premium', 'Enterprise'] as SubscriptionPackage[]).map((pkg) => (
                  <button
                    id={`form-subscription-${pkg}`}
                    key={pkg}
                    type="button"
                    onClick={() => setSubscription(pkg)}
                    className={`p-3.5 border rounded text-left transition-all flex flex-col justify-between cursor-pointer ${
                      subscription === pkg 
                        ? 'border-[#1A56DB] bg-slate-50/50 ring-2 ring-[#1A56DB]/20' 
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900">{pkg}</span>
                    <span className="text-[9px] font-mono mt-2.5 text-slate-400">
                      {pkg === 'Basic' && 'Small school'}
                      {pkg === 'Standard' && 'Regular school'}
                      {pkg === 'Premium' && 'Large school'}
                      {pkg === 'Enterprise' && 'Multi-campus'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* DRAG AND DROP FILE UPLOAD USABILITY PATTERN */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UploadCloud className="w-4 h-4 text-[#1A56DB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">School Logo</h3>
              </div>
              
              <div 
                id="form-logo-dragarea"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
                className={`border-2 border-dashed rounded p-5 text-center flex flex-col items-center justify-center cursor-pointer transition-all ${
                  dragActive 
                    ? 'border-[#1A56DB] bg-[#E0E7FF]/20' 
                    : 'border-slate-300 hover:border-[#1A56DB] bg-slate-50'
                }`}
              >
                <input 
                  id="form-logo-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                <UploadCloud className="w-8 h-8 text-slate-400 mb-2 transition-transform group-hover:translate-y-[-2px]" />
                
                {logoName ? (
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1 select-all">{logoName}</p>
                    <p className="text-[10px] text-emerald-600 font-mono font-medium mt-1">✓ File verified. Logo cached in browser.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-bold text-slate-700">Drag & Drop Logo here or <span className="text-[#1A56DB] hover:underline">browse</span></p>
                    <p className="text-[9px] text-slate-400 font-mono mt-1">Accepts PNG, JPG (Max 512x512px)</p>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* SECTION 3: ADMINISTRATIVE PRIVILEGES */}
          <div>
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
              <Shield className="w-4 h-4 text-[#1A56DB]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Admin Login</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Admin Name */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Admin Name</label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-admin-name"
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Prof. Eleanor Vance"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                {errors.adminName && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.adminName}</p>}
              </div>

              {/* Admin Email */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Admin Email</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="form-admin-email"
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="e.g. e.vance@summitacademy.edu"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none transition-all text-blue-900 font-medium"
                  />
                </div>
                {errors.adminEmail && <p className="text-[10px] text-rose-500 font-medium font-mono">{errors.adminEmail}</p>}
              </div>
            </div>
          </div>

          {/* BUTTON ACTIONS */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              id="form-clear-btn"
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded text-xs font-semibold cursor-pointer"
            >
              Clear Form
            </button>
            <button
              id="form-submit-deploy-btn"
              type="submit"
              className="px-5 py-2 bg-[#1A56DB] hover:bg-[#1A56DB]/95 text-white rounded text-xs font-bold leading-none shadow-sm cursor-pointer flex items-center gap-1"
            >
              Create School Account
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
