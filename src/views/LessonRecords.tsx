import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Search, 
  X, 
  Save, 
  AlertTriangle,
  Library,
  Paperclip,
  Check,
  Eye,
  Settings
} from 'lucide-react';
import { User, School, LessonRecord, TeachingMaterial, MaterialUsageLog } from '../types';
import { 
  getLessonRecordsInStorage, 
  saveLessonRecordsInStorage, 
  getClassesInStorage, 
  getSubjectsInStorage, 
  getTeachingMaterialsInStorage,
  getMaterialUsageLogsInStorage,
  saveMaterialUsageLogsInStorage,
  getTeachersInStorage,
  appendTeacherActivityLog 
} from '../data/mockData';
import { saveWorkflowProgress } from '../data/workflowProgress';

interface LessonRecordsProps {
  user: User;
  currentTenant: School;
}

export default function LessonRecords({ user, currentTenant }: LessonRecordsProps) {
  const tenantId = currentTenant.id;

  // Resolve Teacher Context
  const allTeachers = getTeachersInStorage(tenantId);
  const teacherProfile = (allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase()) || {
    id: `tch_temp_${user.id}`,
    fullName: user.name,
    email: user.email,
    assignedClasses: ['class_jhs1', 'class_jhs2'],
    subjectsTaught: ['subj_math', 'subj_science']
  }) as any;

  // State
  const [lessons, setLessons] = useState<LessonRecord[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  const [materialsList, setMaterialsList] = useState<TeachingMaterial[]>([]);

  // UI state
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [formValues, setFormValues] = useState({
    classId: '',
    subjectId: '',
    topicTaught: '',
    lessonObjectives: '',
    teachingMethod: '',
    homeworkGiven: false,
    challengesFaced: '',
    teacherRemarks: '',
    selectedMaterials: [] as string[] // list of titles or IDs
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState('');

  // Sync startup databases
  useEffect(() => {
    const list = getLessonRecordsInStorage(tenantId).filter(l => l.teacherId === teacherProfile.id);
    setLessons(list);
    setClassesList(getClassesInStorage(tenantId));
    setSubjectsList(getSubjectsInStorage(tenantId));
    setMaterialsList(getTeachingMaterialsInStorage(tenantId));
  }, [tenantId, teacherProfile.id]);

  useEffect(() => {
    try {
      const ctx = JSON.parse(localStorage.getItem('educore_work_context') || 'null');
      if (!ctx || ctx.tenantId !== tenantId || ctx.action !== 'lesson') return;
      if (ctx.teacherId && ctx.teacherId !== teacherProfile.id) return;
      setFormValues(prev => ({
        ...prev,
        classId: ctx.classId || prev.classId,
        subjectId: ctx.subjectId || prev.subjectId,
        topicTaught: prev.topicTaught || `${ctx.subjectName || 'Lesson'} period`,
        teachingMethod: prev.teachingMethod || 'Classroom teaching from scheduled timetable period'
      }));
      setIsRecordOpen(true);
      setSuccessMsg(`Loaded timetable period: ${ctx.className || 'Class'} - ${ctx.subjectName || 'Subject'}.`);
    } catch {
      // Ignore malformed launcher context.
    }
  }, [tenantId, teacherProfile.id]);
  const classesMap = React.useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const subjectsMap = React.useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);

  // Form value change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormValues(prev => ({
      ...prev,
      [name]: val
    }));

    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Toggle referred training material
  const toggleMaterial = (title: string, matId: string) => {
    setFormValues(prev => {
      const exists = prev.selectedMaterials.includes(title);
      const updated = exists 
        ? prev.selectedMaterials.filter(t => t !== title)
        : [...prev.selectedMaterials, title];
      return { ...prev, selectedMaterials: updated };
    });
  };

  // Submit Lesson record save flow
  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setSuccessMsg('');

    const errors: Record<string, string> = {};
    if (!formValues.classId) errors.classId = 'Please select the target lecture room Class.';
    if (!formValues.subjectId) errors.subjectId = 'Please select the curriculum Subject.';
    
    // Stage 3 constraint check: "Add validation for missing lesson topic"
    if (!formValues.topicTaught.trim()) {
      errors.topicTaught = 'Topic Taught is highly mandatory; missing lesson topic blocked.';
    }

    if (!formValues.lessonObjectives.trim()) errors.lessonObjectives = 'Detailed Lesson Objectives are required.';
    if (!formValues.teachingMethod.trim()) errors.teachingMethod = 'Lecturing methodology detail is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const currentAllLessons = getLessonRecordsInStorage(tenantId);
    const newLessonId = `lesson_${Date.now()}`;
    const newRecord: LessonRecord = {
      id: newLessonId,
      tenantId,
      classId: formValues.classId,
      subjectId: formValues.subjectId,
      topicTaught: formValues.topicTaught,
      lessonObjectives: formValues.lessonObjectives,
      teachingMethod: formValues.teachingMethod,
      materialsUsed: formValues.selectedMaterials,
      homeworkGiven: formValues.homeworkGiven,
      challengesFaced: formValues.challengesFaced || undefined,
      teacherRemarks: formValues.teacherRemarks || undefined,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      createdAt: new Date().toISOString(),
      reviewStatus: 'Pending',
      headRemarks: ''
    };

    const updatedLessonsAll = [newRecord, ...currentAllLessons];
    saveLessonRecordsInStorage(tenantId, updatedLessonsAll);

    // Save MaterialUsageLogs (Stage 3 Requirement: logs which teacher used which material)
    if (formValues.selectedMaterials.length > 0) {
      const currentUsages = getMaterialUsageLogsInStorage(tenantId);
      const newUsages: MaterialUsageLog[] = formValues.selectedMaterials.map((title, i) => {
        // find matching material Id if possible
        const matchedMat = materialsList.find(m => m.title === title);
        return {
          id: `use_${Date.now()}_${i}`,
          tenantId,
          teacherId: teacherProfile.id,
          teacherName: teacherProfile.fullName,
          materialId: matchedMat ? matchedMat.id : `mat_ref_${Date.now()}`,
          materialTitle: title,
          classId: formValues.classId,
          subjectId: formValues.subjectId,
          topic: formValues.topicTaught,
          usedAt: new Date().toISOString()
        };
      });
      saveMaterialUsageLogsInStorage(tenantId, [...newUsages, ...currentUsages]);
    }

    // Append to system logs
    const classNameMatched = classesMap.get(formValues.classId) || formValues.classId;
    const subjectNameMatched = subjectsMap.get(formValues.subjectId) || formValues.subjectId;
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action: 'Recorded Lesson',
      details: `Filed core lesson report on "${formValues.topicTaught}" for Class: ${classNameMatched}, Subject: ${subjectNameMatched}. Materials noted: (${formValues.selectedMaterials.join(', ') || 'None'}). Review status sent to School Head dashboard.`,
      classId: formValues.classId,
      className: classNameMatched,
      subjectId: formValues.subjectId,
      subjectName: subjectNameMatched
    });

    setLessons(updatedLessonsAll.filter(l => l.teacherId === teacherProfile.id));
    saveWorkflowProgress('teacher-lesson', { doneSteps: [0, 1, 2], completed: true }, 'lesson record saved');
    setSuccessMsg(`Daily Lesson Log for "${formValues.topicTaught}" committed. Submitted for reviewer review.`);
    setIsRecordOpen(false);

    // Reset Form values
    setFormValues({
      classId: '',
      subjectId: '',
      topicTaught: '',
      lessonObjectives: '',
      teachingMethod: '',
      homeworkGiven: false,
      challengesFaced: '',
      teacherRemarks: '',
      selectedMaterials: []
    });
  };

  const filteredLessons = lessons.filter(l => 
    l.topicTaught.toLowerCase().includes(searchQuery.toLowerCase()) || 
    l.lessonObjectives.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-150">

      {/* TOP HEADER */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex justify-between items-center shadow-xs">
        <div>
          <span className="text-[10px] bg-sky-50 text-sky-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            FACULTY LESSON REGISTRY
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2 font-display leading-tight">
            Daily Lesson Outlines & Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            File complete lectures taught, record homework assignments, specify challenges, and document materials used.
          </p>
        </div>

        <button
          id="btn-trigger-lesson-modal"
          onClick={() => setIsRecordOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded shadow-sm cursor-pointer transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> File Daily Lesson Taught
        </button>
      </div>

      {/* BANNER NOTIFICATION CONSOLES */}
      {successMsg && (
        <div className="p-4 bg-[#EDFDF5] border border-emerald-250 text-emerald-900 text-xs rounded flex items-center gap-3 animate-in fade-in duration-150">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="flex-1">
            <p className="font-bold font-mono">LESSON_SAVED_OK</p>
            <p className="text-slate-600 mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* FILTER SEARCH BAR */}
      <div className="bg-white rounded border border-[#E2E8F0] p-4 flex justify-between items-center shadow-3xs" style={{ contentVisibility: 'auto' }}>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="lesson-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics taught or objectives..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FBFDFF] border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
        <span className="text-[10px] font-mono text-slate-400">ISOLATION SCYTHE ACTIVE</span>
      </div>

      {/* RECENT LESSON SUBMISSIONS */}
      <div className="space-y-4">
        {filteredLessons.map((les) => (
          <div key={les.id} className="bg-white rounded border border-[#E2E8F0] shadow-2xs hover:shadow-3xs transition-shadow overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
            
            {/* Left section: main details */}
            <div className="p-5 flex-1 space-y-3.5">
              
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[9px] border border-blue-100 rounded uppercase">
                  {classesMap.get(les.classId) || les.classId}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <span className="text-[11px] font-bold text-slate-500 font-sans">
                  {subjectsMap.get(les.subjectId) || les.subjectId}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800 tracking-tight font-display">
                  {les.topicTaught}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">Recorded ID: {les.id}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div>
                  <h4 className="font-extrabold text-slate-600 uppercase font-mono text-[9px] tracking-wider">Lesson Objectives</h4>
                  <p className="text-slate-500 mt-1 leading-normal font-sans">{les.lessonObjectives}</p>
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-600 uppercase font-mono text-[9px] tracking-wider">Teaching Methodology</h4>
                  <p className="text-slate-500 mt-1 leading-normal font-sans">{les.teachingMethod}</p>
                </div>
              </div>

              {les.materialsUsed && les.materialsUsed.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 items-center">
                  <span className="text-[9px] uppercase font-mono font-bold text-slate-400 mr-1">Materials Linked:</span>
                  {les.materialsUsed.map((m, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono border border-slate-200">
                      <Library className="w-2.5 h-2.5 text-slate-400" /> {m}
                    </span>
                  ))}
                </div>
              )}

              {les.challengesFaced && (
                <div className="p-3 bg-rose-50/50 border border-rose-100/60 rounded text-[10px] text-rose-900 font-mono">
                  <span className="font-extrabold text-rose-800 uppercase">[CHALLENGES NOTED]</span> {les.challengesFaced}
                </div>
              )}

            </div>

            {/* Right section: reviewer & state monitor */}
            <div className="p-5 w-full md:w-64 bg-slate-50/40 shrink-0 flex flex-col justify-between space-y-4">
              
              <div className="space-y-2">
                <span className="text-[9px] uppercase font-mono font-extrabold text-slate-400 leading-none block">Review Status:</span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase border ${
                    les.reviewStatus === 'Approved'
                      ? 'bg-[#ECFDF5] text-emerald-800 border-[#A7F3D0]'
                      : les.reviewStatus === 'Pending'
                        ? 'bg-[#FEF3C7] text-amber-800 border-[#FDE68A]'
                        : 'bg-rose-50 text-rose-800 border-rose-250'
                  }`}>
                    {les.reviewStatus || 'PENDING'}
                  </span>
                  {les.homeworkGiven && (
                    <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-[#1E40AF] rounded text-[9px] font-mono font-bold font-sans uppercase">
                      Homework Set
                    </span>
                  )}
                </div>

                {les.headRemarks ? (
                  <div className="p-3 border border-emerald-100 bg-[#F4FBF7] rounded text-[10px] text-slate-600 leading-normal font-sans">
                    <p className="font-bold text-emerald-800 font-mono text-[9px] uppercase">REVIEWER COMMITTED REMARKS</p>
                    <p className="mt-1 italic">"{les.headRemarks}"</p>
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 font-mono italic">Waiting for head oversight audit.</p>
                )}
              </div>

              <div className="text-[9px] font-mono text-slate-400">
                Logged Date: {new Date(les.createdAt).toLocaleDateString()}
              </div>

            </div>

          </div>
        ))}

        {filteredLessons.length === 0 && (
          <div className="bg-white rounded border border-[#E2E8F0] p-12 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 mt-4 font-display">No Lessons Logged</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ready to submit your daily outline plans representing taught topics? Click the button above.
            </p>
          </div>
        )}
      </div>

      {/* CREATE LESSON RECORD MODAL DIALOG */}
      {isRecordOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200 w-full max-w-lg shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Title bar */}
            <div className="p-4 bg-slate-50 border-b border-[#F1F5F9] flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-600 uppercase">
                  RECORD DAILY LECTURE RECORD
                </h3>
              </div>
              <button 
                onClick={() => setIsRecordOpen(false)}
                className="text-slate-400 hover:text-slate-850 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Modal Form inputs */}
            <form onSubmit={handleSaveRecord} className="p-5 space-y-4 overflow-y-auto flex-1">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Select Class */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Target Room Class *</label>
                  <select
                    name="classId"
                    value={formValues.classId}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-xs bg-white border rounded focus:border-blue-400 focus:outline-none ${formErrors.classId ? 'border-rose-400 bg-rose-50/25' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {teacherProfile.assignedClasses?.map((classId: string) => (
                      <option key={classId} value={classId}>
                        {classesMap.get(classId) || classId}
                      </option>
                    ))}
                  </select>
                  {formErrors.classId && <p className="text-[9px] text-rose-600 font-mono">{formErrors.classId}</p>}
                </div>

                {/* Select Subject */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Syllabus Subject *</label>
                  <select
                    name="subjectId"
                    value={formValues.subjectId}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-xs bg-white border rounded focus:border-blue-400 focus:outline-none ${formErrors.subjectId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'}`}
                  >
                    <option value="">-- Selection --</option>
                    {teacherProfile.subjectsTaught?.map((subId: string) => (
                      <option key={subId} value={subId}>
                        {subjectsMap.get(subId) || subId}
                      </option>
                    ))}
                  </select>
                  {formErrors.subjectId && <p className="text-[9px] text-rose-600 font-mono">{formErrors.subjectId}</p>}
                </div>

              </div>

              {/* Topic Taught - STRICT STAGE 3 VALIDATION FOR MANDATORY */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Topic Taught today *</label>
                <input
                  type="text"
                  name="topicTaught"
                  placeholder="e.g., Coordination Compound Sentences"
                  value={formValues.topicTaught}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.topicTaught ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.topicTaught && (
                  <div className="flex gap-1 items-center mt-1 text-rose-600">
                    <AlertTriangle className="w-3 h-3 shrink-0" />
                    <span className="text-[9px] font-mono">{formErrors.topicTaught}</span>
                  </div>
                )}
              </div>

              {/* Objectives */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Lesson Objectives Completed *</label>
                <textarea
                  name="lessonObjectives"
                  rows={2}
                  placeholder="What should students gain from this lecture..."
                  value={formValues.lessonObjectives}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.lessonObjectives ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.lessonObjectives && <p className="text-[9px] text-rose-600 font-mono">{formErrors.lessonObjectives}</p>}
              </div>

              {/* Objectives */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Lecturing Methodology / Pedagogy *</label>
                <textarea
                  name="teachingMethod"
                  rows={1}
                  placeholder="e.g., Socratic classroom debate, illustrations on board..."
                  value={formValues.teachingMethod}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.teachingMethod ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.teachingMethod && <p className="text-[9px] text-rose-600 font-mono">{formErrors.teachingMethod}</p>}
              </div>

              {/* Search-select Materials Used */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Linked Teaching Materials Used</label>
                <p className="text-[9px] text-slate-400 leading-none">Preparing details? Search & associate files. Triggers material logs.</p>
                
                <div className="border border-slate-200 rounded p-3 h-28 overflow-y-auto space-y-1 bg-slate-50/50">
                  {materialsList.map(mat => {
                    const isSelected = formValues.selectedMaterials.includes(mat.title);
                    return (
                      <div 
                        key={mat.id}
                        onClick={() => toggleMaterial(mat.title, mat.id)}
                        className={`p-1.5 rounded text-xs flex items-center justify-between cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50 border border-blue-200 text-blue-900 font-medium' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate pr-4">{mat.title} ({mat.category})</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </div>
                    );
                  })}
                  {materialsList.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-2">No files available inside school materials library.</p>
                  )}
                </div>
              </div>

              {/* Challenges & Remarks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Challenges Caught</label>
                  <input
                    type="text"
                    name="challengesFaced"
                    placeholder="e.g. Workbook shortage"
                    value={formValues.challengesFaced}
                    onChange={handleInputChange}
                    className="w-full p-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">General Teacher Remarks</label>
                  <input
                    type="text"
                    name="teacherRemarks"
                    placeholder="e.g. Excellent attention"
                    value={formValues.teacherRemarks}
                    onChange={handleInputChange}
                    className="w-full p-2 text-xs border border-slate-200 rounded focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Set Homework boolean indicator */}
              <div className="flex items-center gap-2 p-2 bg-[#F8FAFC] border border-slate-200 rounded shrink-0">
                <input
                  id="homeworkGiven"
                  type="checkbox"
                  name="homeworkGiven"
                  checked={formValues.homeworkGiven}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label htmlFor="homeworkGiven" className="text-xs text-slate-700 font-semibold cursor-pointer">
                  Has homework been given to students after this lesson?
                </label>
              </div>

              {/* Click button CTAs */}
              <div className="pt-2 flex justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsRecordOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel File
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Commit Daily Log
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
