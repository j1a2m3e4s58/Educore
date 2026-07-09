import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Search, 
  Plus, 
  FileText, 
  Download, 
  UploadCloud,
  Trash2, 
  Calendar, 
  Paperclip, 
  CheckCircle2, 
  X, 
  BookOpen, 
  ExternalLink,
  Cpu,
  Bookmark
} from 'lucide-react';
import { User, School, TeachingMaterial, MaterialUsageLog } from '../types';
import { 
  getTeachingMaterialsInStorage, 
  saveTeachingMaterialsInStorage, 
  getClassesInStorage, 
  getSubjectsInStorage, 
  getTeachersInStorage,
  getMaterialUsageLogsInStorage,
  saveMaterialUsageLogsInStorage,
  appendTeacherActivityLog 
} from '../data/mockData';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { saveWorkflowProgress } from '../data/workflowProgress';

interface TeachingMaterialsProps {
  user: User;
  currentTenant: School;
}

export default function TeachingMaterials({ user, currentTenant }: TeachingMaterialsProps) {
  const tenantId = currentTenant.id;

  // Resolve Teacher Context
  const allTeachers = getTeachersInStorage(tenantId);
  const teacherProfile = (allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase()) || {
    id: `tch_temp_${user.id}`,
    fullName: user.name,
    email: user.email
  }) as any;

  // State
  const [materials, setMaterials] = useState<TeachingMaterial[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [usageLogs, setUsageLogs] = useState<MaterialUsageLog[]>([]);

  // Search/Filters states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [selectedFileTypeFilter, setSelectedFileTypeFilter] = useState('');
  const [selectedYearFilter, setSelectedYearFilter] = useState('');
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'mine' | 'shared' | 'assigned'>('all');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isUseLogOpen, setIsUseLogOpen] = useState(false);
  const [targetUseMaterial, setTargetUseMaterial] = useState<TeachingMaterial | null>(null);

  // Form states
  const [uploadValues, setUploadValues] = useState({
    title: '',
    description: '',
    category: 'Textbook',
    fileType: 'pdf',
    fileSize: '',
    fileName: '',
    gradeClassFilter: '',
    subjectFilter: '',
    shareScope: user.role === 'SchoolAdmin' ? 'SchoolShared' : 'TeacherOnly'
  });
  const [uploadErrors, setUploadErrors] = useState<Record<string, string>>({});

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const units = ['Bytes', 'KB', 'MB', 'GB'];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, index);
    return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
  };

  const getFileExtension = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || 'file';
    return ext.length > 8 ? 'file' : ext;
  };

  const [useLogValues, setUseLogValues] = useState({
    classId: '',
    subjectId: '',
    topic: ''
  });
  const [useLogErrors, setUseLogErrors] = useState<Record<string, string>>({});

  const [successMsg, setSuccessMsg] = useState('');

  // Sync startup catalogs
  useEffect(() => {
    setMaterials(getTeachingMaterialsInStorage(tenantId));
    setClassesList(getClassesInStorage(tenantId));
    setSubjectsList(getSubjectsInStorage(tenantId));
    setUsageLogs(getMaterialUsageLogsInStorage(tenantId).filter(u => u.teacherId === teacherProfile.id));
  }, [tenantId, teacherProfile.id]);

  useEffect(() => {
    try {
      const ctx = JSON.parse(localStorage.getItem('educore_work_context') || 'null');
      if (!ctx || ctx.tenantId !== tenantId || ctx.action !== 'materials') return;
      if (ctx.teacherId && ctx.teacherId !== teacherProfile.id) return;
      setSelectedClassFilter(ctx.classId || '');
      setSelectedSubjectFilter(ctx.subjectId || '');
      setUploadValues(prev => ({
        ...prev,
        gradeClassFilter: ctx.classId || prev.gradeClassFilter,
        subjectFilter: ctx.subjectId || prev.subjectFilter,
        title: prev.title || `${ctx.subjectName || 'Subject'} material`,
        description: prev.description || `Material prepared for ${ctx.className || 'scheduled class'} from timetable.`
      }));
      setUseLogValues(prev => ({ ...prev, classId: ctx.classId || prev.classId, subjectId: ctx.subjectId || prev.subjectId }));
      setIsUploadOpen(true);
    } catch {
      // Ignore malformed launcher context.
    }
  }, [tenantId, teacherProfile.id]);
  const classesMap = React.useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const subjectsMap = React.useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);
  const isSchoolHead = user.role === 'SchoolAdmin' || user.role === 'SuperAdmin';
  const teacherAssignedClassIds = Array.isArray(teacherProfile.assignedClasses) ? teacherProfile.assignedClasses : [];
  const teacherSubjectIds = Array.isArray(teacherProfile.subjectsTaught) ? teacherProfile.subjectsTaught : [];
  const teacherClassOptions = isSchoolHead || teacherAssignedClassIds.length === 0 ? classesList : classesList.filter(c => teacherAssignedClassIds.includes(c.id));
  const teacherSubjectOptions = isSchoolHead || teacherSubjectIds.length === 0 ? subjectsList : subjectsList.filter(s => teacherSubjectIds.includes(s.id));
  const getClassLabel = (id?: string) => id === 'all' ? 'All Classes' : classesMap.get(id || '') || id || 'All Classes';
  const getSubjectLabel = (id?: string) => id === 'all' ? 'All Subjects' : subjectsMap.get(id || '') || id || 'All Subjects';
  const isSharedMaterial = (mat: TeachingMaterial) => mat.shareScope === 'SchoolShared' || (mat.uploadedByTeacherId || '').startsWith('school_shared_');
  const isOwnMaterial = (mat: TeachingMaterial) => mat.uploadedByTeacherId === teacherProfile.id || (isSchoolHead && mat.uploadedByRole === 'SchoolAdmin');
  const isAssignedMaterial = (mat: TeachingMaterial) => {
    const classMatches = !mat.gradeClassFilter || mat.gradeClassFilter === 'all' || teacherAssignedClassIds.includes(mat.gradeClassFilter);
    const subjectMatches = !mat.subjectFilter || mat.subjectFilter === 'all' || teacherSubjectIds.includes(mat.subjectFilter);
    return classMatches && subjectMatches;
  };
  const uploadDraftKey = `educore_draft_material_upload_${tenantId}_${teacherProfile.id}`;
  const hasUploadDraft = Boolean(uploadValues.title || uploadValues.description || uploadValues.gradeClassFilter || uploadValues.subjectFilter);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uploadDraftKey) || 'null');
      if (!saved || typeof saved !== 'object') return;
      setUploadValues(prev => ({
        ...prev,
        ...saved,
        shareScope: saved.shareScope || prev.shareScope
      }));
      setIsUploadOpen(true);
    } catch {
      // Ignore bad draft data.
    }
  }, [uploadDraftKey]);

  useEffect(() => {
    if (!hasUploadDraft) return;
    localStorage.setItem(uploadDraftKey, JSON.stringify(uploadValues));
  }, [hasUploadDraft, uploadDraftKey, uploadValues]);

  // Handle upload input changes
  const handleUploadChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadValues(prev => ({ ...prev, [name]: value }));
    if (uploadErrors[name]) {
      setUploadErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadValues(prev => ({
      ...prev,
      fileName: file.name,
      fileSize: formatFileSize(file.size),
      fileType: getFileExtension(file.name)
    }));
    setUploadErrors(prev => {
      const copy = { ...prev };
      delete copy.fileName;
      return copy;
    });
  };

  // Submit materials upload simulation
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploadErrors({});
    setSuccessMsg('');

    const errors: Record<string, string> = {};
    if (!uploadValues.title.trim()) errors.title = 'Material title is required.';
    if (!uploadValues.description.trim()) errors.description = 'Brief details are required.';
    if (!uploadValues.fileName) errors.fileName = 'Choose the file to upload.';
    if (!uploadValues.gradeClassFilter) errors.gradeClassFilter = 'Choose the class.';
    if (!uploadValues.subjectFilter) errors.subjectFilter = 'Choose the subject.';

    if (Object.keys(errors).length > 0) {
      setUploadErrors(errors);
      return;
    }

    const currentM = getTeachingMaterialsInStorage(tenantId);
    const shareScope = isSchoolHead && uploadValues.shareScope === 'SchoolShared' ? 'SchoolShared' : 'TeacherOnly';
    const uploaderId = shareScope === 'SchoolShared' ? `school_shared_${tenantId}` : teacherProfile.id;
    const uploaderName = shareScope === 'SchoolShared' ? `${user.name} (Principal / School)` : teacherProfile.fullName;
    const newMaterial: TeachingMaterial = {
      id: `mat_${Date.now()}`,
      tenantId,
      title: uploadValues.title,
      description: uploadValues.description,
      category: uploadValues.category,
      fileType: uploadValues.fileType,
      fileSize: uploadValues.fileSize,
      fileName: uploadValues.fileName,
      downloadUrl: uploadValues.fileName,
      gradeClassFilter: uploadValues.gradeClassFilter,
      subjectFilter: uploadValues.subjectFilter,
      uploadedByTeacherId: uploaderId,
      uploadedByTeacherName: uploaderName,
      uploadedByRole: isSchoolHead ? 'SchoolAdmin' : 'Teacher',
      shareScope,
      uploadDate: new Date().toISOString().split('T')[0]
    };

    const updatedM = [newMaterial, ...currentM];
    saveTeachingMaterialsInStorage(tenantId, updatedM);
    localStorage.removeItem(uploadDraftKey);

    // activity logs
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: shareScope === 'SchoolShared' ? user.id : teacherProfile.id,
      teacherName: uploaderName,
      action: 'Uploaded Material',
      details: `Uploaded material: "${uploadValues.title}" (${uploadValues.category}). Size: ${uploadValues.fileSize}`
    });

    setMaterials(updatedM);
    if (!isSchoolHead) {
      saveWorkflowProgress('teacher-material', { doneSteps: [0, 1, 2], completed: true }, 'material uploaded');
    }
    setIsUploadOpen(false);
    setSuccessMsg(`Material uploaded successfully: "${uploadValues.title}".`);
    
    // reset form
    setUploadValues({
      title: '',
      description: '',
      category: 'Textbook',
      fileType: 'pdf',
      fileSize: '',
      fileName: '',
      gradeClassFilter: '',
      subjectFilter: '',
      shareScope: user.role === 'SchoolAdmin' ? 'SchoolShared' : 'TeacherOnly'
    });
  };

  // Use Material action logger trigger
  const handleTriggerUseLog = (mat: TeachingMaterial) => {
    setTargetUseMaterial(mat);
    setUseLogValues({
      classId: mat.gradeClassFilter === 'all' ? '' : mat.gradeClassFilter || '',
      subjectId: mat.subjectFilter === 'all' ? '' : mat.subjectFilter || '',
      topic: ''
    });
    setUseLogErrors({});
    setIsUseLogOpen(true);
  };

  const handleUseLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUseMaterial) return;

    const errors: Record<string, string> = {};
    if (!useLogValues.classId) errors.classId = 'Please select the target rooms.';
    if (!useLogValues.subjectId) errors.subjectId = 'Subject context is requested.';
    if (!useLogValues.topic.trim()) errors.topic = 'Please provide the corresponding topic taught.';

    if (Object.keys(errors).length > 0) {
      setUseLogErrors(errors);
      return;
    }

    const currentUsages = getMaterialUsageLogsInStorage(tenantId);
    const newUsage: MaterialUsageLog = {
      id: `use_${Date.now()}`,
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      materialId: targetUseMaterial.id,
      materialTitle: targetUseMaterial.title,
      classId: useLogValues.classId,
      subjectId: useLogValues.subjectId,
      topic: useLogValues.topic,
      usedAt: new Date().toISOString()
    };

    const updatedUsages = [newUsage, ...currentUsages];
    saveMaterialUsageLogsInStorage(tenantId, updatedUsages);

    // System activity logs
    const classNameMatched = classesMap.get(useLogValues.classId) || useLogValues.classId;
    const subjectNameMatched = subjectsMap.get(useLogValues.subjectId) || useLogValues.subjectId;
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action: 'Used Material',
      details: `Logged preparation review using "${targetUseMaterial.title}" for lesson topic " ${useLogValues.topic}" with ${classNameMatched}.`,
      classId: useLogValues.classId,
      className: classNameMatched,
      subjectId: useLogValues.subjectId,
      subjectName: subjectNameMatched
    });

    setUsageLogs(updatedUsages.filter(u => u.teacherId === teacherProfile.id));
    setIsUseLogOpen(false);
    setSuccessMsg(`Lesson use recorded for: "${targetUseMaterial.title}".`);
    setTargetUseMaterial(null);
  };

  const showAiWorkflowHint = (kind: 'notes' | 'exam') => {
    setSuccessMsg(kind === 'notes'
      ? 'AI notes: choose a material below, record the pages reached, then open AI Tools to prepare a lesson note.'
      : 'AI exam questions: choose the material and pages reached, then open AI Tools to create questions from that content.'
    );
  };

  const handleDeleteMaterial = (id: string, title: string) => {
    const confirmation = window.confirm(`Are you sure you want to remove "${title}" from teaching materials?`);
    if (!confirmation) return;

    const current = getTeachingMaterialsInStorage(tenantId);
    const filtered = current.filter(m => m.id !== id);
    saveTeachingMaterialsInStorage(tenantId, filtered);
    setMaterials(filtered);
    setSuccessMsg(`Removed resource "${title}" from catalog.`);
  };

  // Filter Catalog
  const visibleMaterials = materials.filter(mat => isSchoolHead || isOwnMaterial(mat) || isSharedMaterial(mat) || isAssignedMaterial(mat));
  const myMaterialsCount = visibleMaterials.filter(isOwnMaterial).length;
  const sharedMaterialsCount = visibleMaterials.filter(isSharedMaterial).length;
  const assignedMaterialsCount = visibleMaterials.filter(isAssignedMaterial).length;
  const uploadYears = Array.from(new Set(visibleMaterials.map(mat => (mat.uploadDate || '').slice(0, 4)).filter(Boolean))).sort().reverse();
  const fileTypes = Array.from(new Set(visibleMaterials.map(mat => mat.fileType).filter(Boolean))).sort();

  const filteredMaterials = visibleMaterials.filter(mat => {
    const matchesSearch = mat.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (mat.uploadedByTeacherName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? mat.category === selectedCategory : true;
    const matchesClass = selectedClassFilter ? mat.gradeClassFilter === selectedClassFilter || mat.gradeClassFilter === 'all' : true;
    const matchesSubject = selectedSubjectFilter ? mat.subjectFilter === selectedSubjectFilter || mat.subjectFilter === 'all' : true;
    const matchesFileType = selectedFileTypeFilter ? mat.fileType === selectedFileTypeFilter : true;
    const matchesYear = selectedYearFilter ? (mat.uploadDate || '').startsWith(selectedYearFilter) : true;
    const matchesOwner = ownerFilter === 'mine' ? isOwnMaterial(mat) : ownerFilter === 'shared' ? isSharedMaterial(mat) : ownerFilter === 'assigned' ? isAssignedMaterial(mat) : true;
    return matchesSearch && matchesCategory && matchesClass && matchesSubject && matchesFileType && matchesYear && matchesOwner;
  });

  return (
    <div id="materials-section" className="materials-page space-y-6 scroll-mt-4">

      {/* TOP HEADER BAR */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            TEACHING MATERIALS
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2 font-display leading-tight">
            Teaching Materials
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Upload notes, slides, books, videos, and worksheets by class and subject.
          </p>
        </div>

        <button
          id="btn-upload-material"
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded shadow-sm cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Upload Lesson Material
        </button>
      </div>
      <SectionActionStrip
        progressKey="teacher-material"
        steps={['Upload file', 'Choose class/subject', 'Use for notes or exams']}
        helpText="Upload a file, choose who should see it, and attach the class and subject. After that, use AI notes or exam questions from selected materials."
        reminderText="Upload or open materials before generating AI notes or exam questions."
        canMarkDone={visibleMaterials.length > 0}
        blockedDoneText="Upload or open at least one material before marking materials done."
        actions={[
          { label: 'Upload material', onClick: () => setIsUploadOpen(true), tone: 'primary' },
          { label: 'AI notes', onClick: () => showAiWorkflowHint('notes') },
          { label: 'Exam questions', onClick: () => showAiWorkflowHint('exam') },
        ]}
        isEmpty={visibleMaterials.length === 0}
        emptyText="No teaching material is available yet. Upload a file or ask the principal to share materials for your class."
      />
      <BackToPageMenu />

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            { label: 'All Materials', value: 'all' as const },
            { label: 'My Uploads', value: 'mine' as const },
            { label: 'School Shared', value: 'shared' as const },
            { label: 'My Classes', value: 'assigned' as const },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setOwnerFilter(tab.value)}
              className={`min-h-11 shrink-0 rounded-xl border px-4 py-2 text-sm font-black transition active:scale-95 ${ownerFilter === tab.value ? 'border-blue-200 bg-blue-600 text-white shadow-sm' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
            >
              {tab.label}
            </button>
          ))}
          <button onClick={() => showAiWorkflowHint('notes')} className="min-h-11 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 active:scale-95">
            AI Notes
          </button>
          <button onClick={() => showAiWorkflowHint('exam')} className="min-h-11 shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-black text-amber-900 transition hover:bg-amber-100 active:scale-95">
            Exam Questions
          </button>
        </div>
        <p className="px-1 pt-1 text-xs font-semibold leading-relaxed text-slate-500">
          Teachers add files for the classes they teach. Principals can also share files for all teachers or selected classes.
        </p>
      </div>
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 shadow-sm">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wide text-blue-700">Real file library structure</p>
            <h3 className="text-sm font-black text-slate-950">Find files by class, subject, teacher, year, and file type</h3>
          </div>
          <span className="w-fit rounded-full bg-white px-3 py-1 text-[10px] font-black text-blue-800">{filteredMaterials.length} visible files</span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          <select value={selectedClassFilter} onChange={(e) => setSelectedClassFilter(e.target.value)} className="min-h-10 rounded-xl border border-blue-100 bg-white px-3 text-xs font-black text-slate-700">
            <option value="">All classes</option>
            {classesList.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select value={selectedSubjectFilter} onChange={(e) => setSelectedSubjectFilter(e.target.value)} className="min-h-10 rounded-xl border border-blue-100 bg-white px-3 text-xs font-black text-slate-700">
            <option value="">All subjects</option>
            {subjectsList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={selectedFileTypeFilter} onChange={(e) => setSelectedFileTypeFilter(e.target.value)} className="min-h-10 rounded-xl border border-blue-100 bg-white px-3 text-xs font-black text-slate-700">
            <option value="">All file types</option>
            {fileTypes.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
          </select>
          <select value={selectedYearFilter} onChange={(e) => setSelectedYearFilter(e.target.value)} className="min-h-10 rounded-xl border border-blue-100 bg-white px-3 text-xs font-black text-slate-700">
            <option value="">All years</option>
            {uploadYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('');
              setSelectedClassFilter('');
              setSelectedSubjectFilter('');
              setSelectedFileTypeFilter('');
              setSelectedYearFilter('');
              setOwnerFilter('all');
            }}
            className="min-h-10 rounded-xl bg-blue-600 px-3 text-xs font-black text-white"
          >
            Clear library filters
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'My Uploads', value: myMaterialsCount, mode: 'mine' as const, icon: FileText, hint: 'Files added by you' },
          { label: 'School Shared', value: sharedMaterialsCount, mode: 'shared' as const, icon: Library, hint: 'Principal resources' },
          { label: 'For My Classes', value: assignedMaterialsCount, mode: 'assigned' as const, icon: BookOpen, hint: 'Matches your subjects' }
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.mode}
              type="button"
              onClick={() => setOwnerFilter(item.mode)}
              className={`p-4 border bg-white text-left shadow-sm transition-all ${ownerFilter === item.mode ? 'border-blue-500 ring-2 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{item.label}</p>
                  <p className="text-[11px] text-slate-400 mt-1">{item.hint}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 mt-3">{item.value}</p>
            </button>
          );
        })}
      </div>

      {/* BANNER STATUSES */}
      {successMsg && (
        <div className="p-4 bg-[#EDFDF5] border border-emerald-250 text-emerald-900 text-xs rounded flex items-center gap-3 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">MATERIAL SAVED</p>
            <p className="text-slate-600 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* GRID LAYOUT: LEFT SIDEBAR FILTERS, RIGHT CATALOG LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE BAR CATALOG FILTERS */}
        <div className="bg-white rounded border border-[#E2E8F0] p-5 h-fit space-y-4 shadow-xs" style={{ contentVisibility: 'auto' }}>
          
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider">
              VAULT CATALOG FILTERS
            </h3>
            <p className="text-[10px] text-slate-400 mt-1">Pick a simple group first, then search.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              ['all', 'All'],
              ['mine', 'Mine'],
              ['shared', 'School'],
              ['assigned', 'My Class']
            ].map(([mode, label]) => (
              <button
                key={mode}
                type="button"
                onClick={() => setOwnerFilter(mode as typeof ownerFilter)}
                className={`py-2 px-2 border text-[10px] font-bold ${ownerFilter === mode ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search bar input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Search by Title Or Details</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                id="material-search-sidebar"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="textbook formulas..."
                className="w-full pl-7 pr-3 py-1 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          {/* Category SELECT filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Category type</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">-- All Categories --</option>
              <option value="PDF">PDF Worksheets</option>
              <option value="Notes">Teacher Notes</option>
              <option value="Video">Video Tutorials</option>
              <option value="Slides">Slides Deck Presentation</option>
              <option value="Textbook">Primary Textbooks</option>
              <option value="Scheme of Work">Scheme of Work Plans</option>
              <option value="Past Questions">Past Certificate Questions</option>
            </select>
          </div>

          {/* Grade/Class SELECT filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Grade/Room Class</label>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="w-full p-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">-- All Classes --</option>
              {classesList.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Subject SELECT filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Curriculum Course Selection</label>
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className="w-full p-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">-- All Subjects --</option>
              {subjectsList.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">File type</label>
            <select
              value={selectedFileTypeFilter}
              onChange={(e) => setSelectedFileTypeFilter(e.target.value)}
              className="w-full p-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">-- All Types --</option>
              {fileTypes.map(type => <option key={type} value={type}>{type.toUpperCase()}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase">Upload year</label>
            <select
              value={selectedYearFilter}
              onChange={(e) => setSelectedYearFilter(e.target.value)}
              className="w-full p-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
            >
              <option value="">-- All Years --</option>
              {uploadYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          {/* RESET filters call Button */}
          {(searchQuery || selectedCategory || selectedClassFilter || selectedSubjectFilter || selectedFileTypeFilter || selectedYearFilter || ownerFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedClassFilter('');
                setSelectedSubjectFilter('');
                setSelectedFileTypeFilter('');
                setSelectedYearFilter('');
                setOwnerFilter('all');
              }}
              className="w-full py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          )}

          {/* MY PREPARATION ACTIONS COUNTER */}
          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded text-center">
            <p className="text-[10px] font-bold font-mono text-blue-700 uppercase">MY PREPARATION FILINGS</p>
            <h4 className="text-xl font-bold font-mono text-[#1A56DB] mt-1">{usageLogs.length} Records</h4>
            <p className="text-[9px] text-slate-400 leading-normal mt-0.5">Recorded logs proving lesson prep metrics holding in this term.</p>
          </div>

        </div>

        {/* VAULT CATALOG list CARDS GRID */}
        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {filteredMaterials.map((mat) => (
              <div key={mat.id} className="bg-white rounded border border-[#E2E8F0] shadow-3xs p-5 flex flex-col justify-between hover:shadow-2xs transition-shadow">
                
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 bg-blue-50 text-[#1E40AF] rounded text-[9px] font-mono font-bold uppercase border border-blue-100">
                        {mat.category}
                      </span>
                      {isSharedMaterial(mat) && (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-mono font-bold uppercase border border-emerald-100">
                          School Shared
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] uppercase bg-slate-100 text-slate-600 rounded px-2 py-0.5 select-all text-[9.5px] font-mono font-bold">
                      .{mat.fileType}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold text-slate-800 tracking-tight font-display hover:text-[#1A56DB] transition-colors line-clamp-1">
                      {mat.title}
                    </h3>
                    <p className="text-[10px] text-slate-400 leading-normal line-clamp-2 mt-1">
                      {mat.description}
                    </p>
                    <p className="mt-2 rounded bg-slate-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-slate-500">
                      File group: {getClassLabel(mat.gradeClassFilter)} / {getSubjectLabel(mat.subjectFilter)} / {mat.uploadedByTeacherName || 'School staff'} / {(mat.uploadDate || '').slice(0, 4) || 'Year'} / {mat.fileType?.toUpperCase()}
                    </p>
                    {mat.fileName && (
                      <p className="mt-2 flex items-center gap-1.5 rounded border border-blue-100 bg-blue-50 px-2 py-1 text-[9px] font-black text-blue-800">
                        <Paperclip className="h-3 w-3 shrink-0" />
                        <span className="truncate">{mat.fileName}</span>
                      </p>
                    )}
                  </div>

                  {/* Badges details meta */}
                  <div className="flex flex-wrap gap-1 items-center pt-1.5 border-t border-slate-100">
                    <span className="text-[8px] uppercase font-mono font-bold text-slate-400 mr-1">Class:</span>
                    <span className="bg-slate-100 text-[8.5px] px-2 py-0.2 rounded font-mono font-bold text-slate-600">
                      {getClassLabel(mat.gradeClassFilter)}
                    </span>
                    <span className="bg-indigo-50 text-indigo-700 text-[8.5px] px-2 py-0.2 rounded font-mono font-bold">
                      {getSubjectLabel(mat.subjectFilter)}
                    </span>
                  </div>

                </div>

                {/* Card Action footer buttons */}
                <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex justify-between items-center">
                  
                  <div className="text-[9px] text-slate-400 font-mono leading-relaxed">
                    <p>{mat.fileSize ? `Size: ${mat.fileSize}` : 'Size: 1.2 MB'} | Date: {mat.uploadDate}</p>
                    <p>By: {mat.uploadedByTeacherName || 'School staff'}</p>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    
                    {/* Log Use click handle */}
                    <button
                      onClick={() => handleTriggerUseLog(mat)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#1A56DB] hover:text-[#1E40AF] text-[9.5px] font-bold font-sans rounded transition-all cursor-pointer flex items-center gap-1"
                      title="Log this resource usage"
                    >
                      <Bookmark className="w-3 h-3" /> Log prep use
                    </button>

                    <button
                      onClick={() => alert(`Simulated downloading: ${mat.title}.${mat.fileType} (${mat.fileSize || '10MB'}). Sandbox environment is secure.`)}
                      className="p-1 text-slate-400 hover:text-[#1A56DB] border border-slate-200 hover:border-blue-300 rounded bg-white"
                      title="Simulate downloading file"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                    {(isSchoolHead || mat.uploadedByTeacherId === teacherProfile.id) && (
                      <button
                        onClick={() => handleDeleteMaterial(mat.id, mat.title)}
                        className="p-1 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-300 rounded bg-white hover:bg-rose-50 cursor-pointer"
                        title="Delete material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                  </div>

                </div>

              </div>
            ))}

            {filteredMaterials.length === 0 && (
              <div className="col-span-full bg-white rounded border border-[#E2E8F0] p-12 text-center">
                <Library className="w-12 h-12 text-slate-200 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700 mt-4 font-display">No Resources Found</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Try adjusting searching terms or filter specifications, or upload a new resource workbook.
                </p>
              </div>
            )}

          </div>

          {/* ACTIVE PREPARATION USAGE TIMELINE DIRECTORY */}
          <div className="bg-white rounded border border-[#E2E8F0] shadow-3xs p-5" style={{ contentVisibility: 'auto' }}>
            <h3 className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">
              MY RECENT RESOURCE PREPRATION LOGINGS ({usageLogs.length})
            </h3>
            <p className="text-[11px] text-slate-400 leading-normal mt-1 mb-3.5">
              History of resource logs submitted securely detailing classroom integration metrics.
            </p>

            <div className="space-y-2 text-xs">
              {usageLogs.map((log) => (
                <div key={log.id} className="p-3 border border-slate-100 rounded bg-[#FBFCFD] flex justify-between items-center">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">Used: {log.materialTitle}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0"></span>
                      <span className="text-[10px] text-blue-600 font-mono font-bold uppercase">{classesMap.get(log.classId) || log.classId}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">
                      Syllabus course: <span className="font-semibold text-slate-600">{subjectsMap.get(log.subjectId) || log.subjectId}</span> | Lecture Topic: <span className="font-semibold text-slate-600">"{log.topic}"</span>
                    </p>
                  </div>
                  <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap pl-4">
                    {new Date(log.usedAt).toLocaleDateString()} {new Date(log.usedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              ))}

              {usageLogs.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded">
                  No preparation files have been logged. Select "Log prep use" on any resource sheet.
                </p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* UPLOAD MATERIAL MODAL DIALOG */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200 w-full max-w-lg shadow-2xl relative overflow-hidden">
            
            <div className="p-4 bg-slate-50 border-b border-[#F1F5F9] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Library className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-600 uppercase">
                  UPLOAD LESSON VAULT RESOURCE
                </h3>
              </div>
              <button onClick={() => setIsUploadOpen(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              {hasUploadDraft && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">
                  Draft autosaved. You can close this box and come back without losing the material details.
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(uploadDraftKey);
                      setUploadValues({
                        title: '',
                        description: '',
                        category: 'Textbook',
                        fileType: 'pdf',
                        fileSize: '',
                        fileName: '',
                        gradeClassFilter: '',
                        subjectFilter: '',
                        shareScope: user.role === 'SchoolAdmin' ? 'SchoolShared' : 'TeacherOnly'
                      });
                    }}
                    className="ml-2 font-black text-amber-950 underline"
                  >
                    Clear draft
                  </button>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-blue-100 bg-blue-50 p-2">
                {['Name file', 'Choose class', 'Save'].map((step, index) => (
                  <div key={step} className="rounded-lg bg-white p-2 text-center">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white">{index + 1}</span>
                    <p className="mt-1 text-[10px] font-black text-slate-700">{step}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Resource Document Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. BECE ICT Study Worksheets Book"
                  value={uploadValues.title}
                  onChange={handleUploadChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${uploadErrors.title ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {uploadErrors.title && <p className="text-[9px] text-rose-600 font-mono">{uploadErrors.title}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Brief Resource Description *</label>
                <textarea
                  name="description"
                  rows={2}
                  placeholder="Summarize chapters, guidelines, or materials context..."
                  value={uploadValues.description}
                  onChange={handleUploadChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${uploadErrors.description ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {uploadErrors.description && <p className="text-[9px] text-rose-600 font-mono">{uploadErrors.description}</p>}
              </div>

              <div className={`rounded-xl border p-3 ${uploadErrors.fileName ? 'border-rose-300 bg-rose-50' : 'border-blue-100 bg-blue-50/70'}`}>
                <label htmlFor="lesson-material-file" className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-white px-4 py-5 text-center hover:border-blue-500">
                  <UploadCloud className="h-8 w-8 text-blue-600" />
                  <span className="text-sm font-black text-slate-950">Choose file from this device</span>
                  <span className="text-[11px] font-semibold text-slate-500">PDF, Word, PowerPoint, Excel, video, image, or notes file</span>
                  <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">Browse file</span>
                </label>
                <input
                  id="lesson-material-file"
                  type="file"
                  onChange={handleUploadFileChange}
                  className="sr-only"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.mov,.jpg,.jpeg,.png,.txt"
                />
                {uploadValues.fileName ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-emerald-950">{uploadValues.fileName}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">{uploadValues.fileSize || 'Size ready'} / {uploadValues.fileType.toUpperCase()}</p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  </div>
                ) : (
                  <p className="mt-2 text-[10px] font-bold text-slate-500">No file selected yet. Pick the actual lesson material before saving.</p>
                )}
                {uploadErrors.fileName && <p className="mt-2 text-[9px] text-rose-600 font-mono">{uploadErrors.fileName}</p>}
              </div>

              {isSchoolHead && (
                <div className="space-y-2 rounded border border-emerald-100 bg-emerald-50/60 p-3">
                  <label className="text-[10px] font-bold font-mono text-emerald-800 uppercase">Who should see this material?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['SchoolShared', 'All Teachers'],
                      ['TeacherOnly', 'Only Me']
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setUploadValues(prev => ({ ...prev, shareScope: value }))}
                        className={`py-2 border text-[10px] font-bold ${uploadValues.shareScope === value ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-800 border-emerald-200'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Category type</label>
                  <select
                    name="category"
                    value={uploadValues.category}
                    onChange={handleUploadChange}
                    className="w-full p-2 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-blue-400"
                  >
                    <option value="PDF">PDF Worksheets</option>
                    <option value="Notes">Teacher Notes</option>
                    <option value="Video">Video Tutorials</option>
                    <option value="Slides">Slides Deck Presentation</option>
                    <option value="Textbook">Primary Textbooks</option>
                    <option value="Scheme of Work">Scheme of Work Plans</option>
                    <option value="Past Questions">Past Certificate Questions</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Document File Type Extension</label>
                  <select
                    name="fileType"
                    value={uploadValues.fileType}
                    onChange={handleUploadChange}
                    className="w-full p-2 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-blue-400"
                  >
                    <option value="pdf">.pdf Document</option>
                    <option value="pptx">.pptx Slide Presentation</option>
                    <option value="docx">.docx Grammar Word Sheet</option>
                    <option value="mp4">.mp4 Video Tutorial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Class Scope Filter *</label>
                  <select
                    name="gradeClassFilter"
                    value={uploadValues.gradeClassFilter}
                    onChange={handleUploadChange}
                    className={`w-full p-2 text-xs bg-white border rounded focus:border-blue-400 focus:outline-none ${uploadErrors.gradeClassFilter ? 'border-rose-400' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {isSchoolHead && <option value="all">All Classes</option>}
                    {teacherClassOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {uploadErrors.gradeClassFilter && <p className="text-[9px] text-rose-600 font-mono">{uploadErrors.gradeClassFilter}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Subject Scope Filter *</label>
                  <select
                    name="subjectFilter"
                    value={uploadValues.subjectFilter}
                    onChange={handleUploadChange}
                    className={`w-full p-2 text-xs bg-white border rounded focus:border-blue-400 focus:outline-none ${uploadErrors.subjectFilter ? 'border-rose-400' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {isSchoolHead && <option value="all">All Subjects</option>}
                    {teacherSubjectOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {uploadErrors.subjectFilter && <p className="text-[9px] text-rose-600 font-mono">{uploadErrors.subjectFilter}</p>}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white font-semibold rounded cursor-pointer"
                >
                  {uploadValues.shareScope === 'SchoolShared' ? 'Share to Teachers' : 'Save My Material'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* USE MATERIAL LOGGER DIALOG */}
      {isUseLogOpen && targetUseMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200 w-full max-w-sm shadow-2xl relative overflow-hidden">
            
            <div className="p-4 bg-slate-50 border-b border-[#F1F5F9] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600 shrink-0" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-600 uppercase">
                  RECORD PREP INTEGRATION LOG
                </h3>
              </div>
              <button onClick={() => setIsUseLogOpen(false)} className="text-slate-400 hover:text-slate-850">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUseLogSubmit} className="p-5 space-y-4">
              <div className="bg-slate-50 p-3 rounded border border-slate-100 text-xs">
                <p className="font-extrabold text-slate-500 font-mono text-[9px] uppercase">TARGET FILE</p>
                <p className="font-bold text-slate-800 mt-1">{targetUseMaterial.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Category: {targetUseMaterial.category}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Room Class *</label>
                  <select
                    value={useLogValues.classId}
                    onChange={(e) => setUseLogValues(prev => ({ ...prev, classId: e.target.value }))}
                    className={`w-full p-2 text-xs bg-white border rounded focus:outline-none focus:border-blue-400 ${useLogErrors.classId ? 'border-rose-400' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {isSchoolHead && <option value="all">All Classes</option>}
                    {teacherClassOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {useLogErrors.classId && <p className="text-[9px] text-rose-600 font-mono">{useLogErrors.classId}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Syllabus Subject *</label>
                  <select
                    value={useLogValues.subjectId}
                    onChange={(e) => setUseLogValues(prev => ({ ...prev, subjectId: e.target.value }))}
                    className={`w-full p-2 text-xs bg-white border rounded focus:outline-none focus:border-blue-400 ${useLogErrors.subjectId ? 'border-rose-400' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {isSchoolHead && <option value="all">All Subjects</option>}
                    {teacherSubjectOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {useLogErrors.subjectId && <p className="text-[9px] text-rose-600 font-mono">{useLogErrors.subjectId}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Lesson Topic Taught *</label>
                <input
                  type="text"
                  placeholder="e.g. Solving Simple Conjunctions"
                  value={useLogValues.topic}
                  onChange={(e) => setUseLogValues(prev => ({ ...prev, topic: e.target.value }))}
                  className={`w-full p-2 text-xs border rounded focus:outline-none focus:border-blue-400 ${useLogErrors.topic ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {useLogErrors.topic && <p className="text-[9px] text-rose-600 font-mono">{useLogErrors.topic}</p>}
              </div>

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsUseLogOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white font-semibold rounded cursor-pointer"
                >
                  Log Material Prep Use
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
