import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Trash2, 
  Search, 
  X, 
  Calendar, 
  Paperclip, 
  FileText, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { User, School, Assignment } from '../types';
import { 
  getAssignmentsInStorage, 
  saveAssignmentsInStorage, 
  getClassesInStorage, 
  getSubjectsInStorage, 
  getTeachersInStorage,
  appendTeacherActivityLog 
} from '../data/mockData';
import BackToPageMenu from '../components/BackToPageMenu';
import SectionActionStrip from '../components/SectionActionStrip';
import { saveWorkflowProgress } from '../data/workflowProgress';

interface AssignmentManagementProps {
  user: User;
  currentTenant: School;
}

export default function AssignmentManagement({ user, currentTenant }: AssignmentManagementProps) {
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

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classesList, setClassesList] = useState<any[]>([]);
  const [subjectsList, setSubjectsList] = useState<any[]>([]);
  
  // UI states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Form State
  const [formValues, setFormValues] = useState({
    classId: '',
    subjectId: '',
    topic: '',
    instructions: '',
    dueDate: '',
    questionType: 'Theoretical',
    totalMarks: 20,
    submissionMethod: 'Offline',
    attachmentName: ''
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState(false);

  // Sync data on load
  useEffect(() => {
    const list = getAssignmentsInStorage(tenantId).filter(a => a.teacherId === teacherProfile.id);
    setAssignments(list);
    setClassesList(getClassesInStorage(tenantId));
    setSubjectsList(getSubjectsInStorage(tenantId));
  }, [tenantId, teacherProfile.id]);

  useEffect(() => {
    try {
      const ctx = JSON.parse(localStorage.getItem('educore_work_context') || 'null');
      if (!ctx || ctx.tenantId !== tenantId || ctx.action !== 'assignment') return;
      if (ctx.teacherId && ctx.teacherId !== teacherProfile.id) return;
      setClassFilter(ctx.classId || '');
      setSubjectFilter(ctx.subjectId || '');
      setFormValues(prev => ({
        ...prev,
        classId: ctx.classId || prev.classId,
        subjectId: ctx.subjectId || prev.subjectId,
        topic: prev.topic || `${ctx.subjectName || 'Subject'} assignment`,
        dueDate: prev.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }));
      setIsCreateOpen(true);
    } catch {
      // Ignore malformed launcher context.
    }
  }, [tenantId, teacherProfile.id]);
  const classesMap = React.useMemo(() => new Map(classesList.map(c => [c.id, c.name])), [classesList]);
  const subjectsMap = React.useMemo(() => new Map(subjectsList.map(s => [s.id, s.name])), [subjectsList]);

  // Handle Form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: name === 'totalMarks' ? Number(value) : value
    }));
    
    // Clear error
    if (formErrors[name]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  // Drag and Drop simulation for standard upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const nameLower = file.name.toLowerCase();
      // Validate file extension (.pdf, .docx, .docx, .xlsx, .pptx, .mp4, .png)
      const isAllowed = nameLower.endsWith('.pdf') || nameLower.endsWith('.docx') || nameLower.endsWith('.pptx') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.png');
      
      if (!isAllowed) {
        setFormErrors(prev => ({ ...prev, attachment: 'Invalid file format. Only PDF, DOCX, PPTX, XLSX and PNG files are supported.' }));
        return;
      }

      setFormValues(prev => ({ ...prev, attachmentName: file.name }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const nameLower = file.name.toLowerCase();
      const isAllowed = nameLower.endsWith('.pdf') || nameLower.endsWith('.docx') || nameLower.endsWith('.pptx') || nameLower.endsWith('.xlsx') || nameLower.endsWith('.png');
      
      if (!isAllowed) {
        setFormErrors(prev => ({ ...prev, attachment: 'Only PDF, DOCX, PPTX, XLSX and PNG files are allowed.' }));
        return;
      }
      setFormValues(prev => ({ ...prev, attachmentName: file.name }));
    }
  };

  // Submit Form Validation
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formValues.classId) errors.classId = 'Target class selection is required.';
    if (!formValues.subjectId) errors.subjectId = 'Subject syllabus is required.';
    if (!formValues.topic.trim()) errors.topic = 'Please provide an assignment title/topic.';
    if (!formValues.instructions.trim()) errors.instructions = 'Instructions details cannot be left blank.';
    if (!formValues.dueDate) {
      errors.dueDate = 'Due return date is required.';
    } else {
      const selectedDate = new Date(formValues.dueDate);
      const today = new Date();
      today.setHours(0,0,0,0);
      if (selectedDate < today) {
        errors.dueDate = 'Due return date cannot be set in the past.';
      }
    }
    if (formValues.totalMarks <= 0) errors.totalMarks = 'Total grading marks must be greater than zero.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const currentAll = getAssignmentsInStorage(tenantId);
    const newId = `assign_${Date.now()}`;
    const newRecord: Assignment = {
      id: newId,
      tenantId,
      classId: formValues.classId,
      subjectId: formValues.subjectId,
      topic: formValues.topic,
      instructions: formValues.instructions,
      dueDate: formValues.dueDate,
      attachmentName: formValues.attachmentName || undefined,
      attachmentUrl: formValues.attachmentName ? '#' : undefined,
      questionType: formValues.questionType,
      totalMarks: formValues.totalMarks,
      submissionMethod: formValues.submissionMethod,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      createdAt: new Date().toISOString()
    };

    const updatedList = [newRecord, ...currentAll];
    saveAssignmentsInStorage(tenantId, updatedList);

    // Append teacher log (Stage 3 Requirement: automatically logs created assignment details)
    const classNameMatched = classesMap.get(formValues.classId) || formValues.classId;
    const subjectNameMatched = subjectsMap.get(formValues.subjectId) || formValues.subjectId;
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action: 'Created Assignment',
      details: `Created new assignment "${formValues.topic}" for Class: ${classNameMatched}, Subject: ${subjectNameMatched}. Total marks: ${formValues.totalMarks}. Due on ${formValues.dueDate}.`,
      classId: formValues.classId,
      className: classNameMatched,
      subjectId: formValues.subjectId,
      subjectName: subjectNameMatched
    });

    // Reset Form
    setAssignments(updatedList.filter(a => a.teacherId === teacherProfile.id));
    saveWorkflowProgress('teacher-assignment', { doneSteps: [0, 1, 2], completed: true }, 'assignment record created');
    setIsCreateOpen(false);
    setFormValues({
      classId: '',
      subjectId: '',
      topic: '',
      instructions: '',
      dueDate: '',
      questionType: 'Theoretical',
      totalMarks: 20,
      submissionMethod: 'Offline',
      attachmentName: ''
    });
    setFormErrors({});
  };

  const handleDeleteAssignment = (id: string, topicName: string) => {
    const confirmation = window.confirm(`Are you sure you want to retire assignment "${topicName}" from active circulation?`);
    if (!confirmation) return;

    const currentAll = getAssignmentsInStorage(tenantId);
    const filtered = currentAll.filter(a => a.id !== id);
    saveAssignmentsInStorage(tenantId, filtered);
    setAssignments(filtered.filter(a => a.teacherId === teacherProfile.id));

    // Log retiring/deleting action
    appendTeacherActivityLog(tenantId, {
      tenantId,
      teacherId: teacherProfile.id,
      teacherName: teacherProfile.fullName,
      action: 'Edited Assignment',
      details: `Deleted completed homework assignment: "${topicName}" from the private node registry.`
    });
  };

  // Filter Logic
  const filteredAssignments = assignments.filter(assign => {
    const matchesSearch = assign.topic.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          assign.instructions.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter ? assign.classId === classFilter : true;
    const matchesSubject = subjectFilter ? assign.subjectId === subjectFilter : true;
    return matchesSearch && matchesClass && matchesSubject;
  });

  return (
    <div id="assignments-section" className="space-y-6 scroll-mt-4">

      {/* COMPACT TOP HEADER */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex justify-between items-center shadow-xs">
        <div>
          <span className="text-[10px] bg-blue-50 text-blue-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            ACADEMIC ASSIGNMENTS GATEWAY
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2 font-display leading-tight">
            Homework & Course Assignments
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Build student curriculum homework sheets, specify grading parameters, and attach workbook material.
          </p>
        </div>

        <button
          id="btn-trigger-assign-modal"
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded shadow-sm cursor-pointer transition-all duration-150 shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> Deconstruct New Assignment
        </button>
      </div>
      <SectionActionStrip
        progressKey="teacher-assignment"
        steps={['Choose class', 'Write task', 'Set due date']}
        helpText="Press create assignment. Choose the class and subject, write the work clearly, set the due date, then save it for students and parents to see."
        reminderText="Assignments are not visible to parents until you create and save one."
        canMarkDone={assignments.length > 0}
        blockedDoneText="Create and save at least one assignment before marking assignments done."
        actions={[
          { label: 'Create assignment', onClick: () => setIsCreateOpen(true), tone: 'primary' },
          { label: 'Filter class', scrollTo: 'assignments-section' },
        ]}
        isEmpty={filteredAssignments.length === 0}
        emptyText="No assignment is showing. Create a new assignment or clear the filters to see existing work."
      />
      <BackToPageMenu />

      {/* SYSTEM CONTROL LABELS FILTERING */}
      <div className="bg-white rounded border border-[#E2E8F0] p-4 flex flex-col md:flex-row justify-between items-center gap-3.5 shadow-3xs" style={{ contentVisibility: 'auto' }}>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="assignment-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search instructions or topics..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FBFDFF] border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto self-end">
          <select
            id="assignment-class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
          >
            <option value="">-- Class filter --</option>
            {teacherProfile.assignedClasses?.map((classId: string) => (
              <option key={classId} value={classId}>
                {classesMap.get(classId) || classId}
              </option>
            ))}
          </select>

          <select
            id="assignment-subject-filter"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-400"
          >
            <option value="">-- Subject filter --</option>
            {teacherProfile.subjectsTaught?.map((subId: string) => (
              <option key={subId} value={subId}>
                {subjectsMap.get(subId) || subId}
              </option>
            ))}
          </select>

          {(classFilter || subjectFilter || searchQuery) && (
            <button
              onClick={() => {
                setClassFilter('');
                setSubjectFilter('');
                setSearchQuery('');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* LIST OF RECORDED ASSIGNMENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssignments.map((assign) => (
          <div key={assign.id} className="bg-white rounded border border-[#E2E8F0] shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between">
            
            {/* Assignment Top Meta */}
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-[9px] rounded uppercase border border-blue-100">
                  {classesMap.get(assign.classId) || assign.classId}
                </span>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded font-semibold uppercase">
                  {assign.questionType}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight font-display line-clamp-1">
                  {assign.topic}
                </h3>
                <p className="text-[11px] font-semibold text-blue-600 font-mono mt-0.5">
                  {subjectsMap.get(assign.subjectId) || assign.subjectId}
                </p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded text-[11px] text-slate-500 leading-relaxed max-h-24 overflow-y-auto font-sans">
                {assign.instructions}
              </div>

              {assign.attachmentName && (
                <div className="inline-flex items-center gap-1.5 p-1.5 bg-[#F0FDF4] border border-[#DCFCE7] rounded text-[10px] text-emerald-800 font-medium">
                  <Paperclip className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[180px]">{assign.attachmentName}</span>
                </div>
              )}

            </div>

            {/* Assignment Bottom Grading details */}
            <div className="p-4 border-t border-[#F1F5F9] bg-[#FDFEFF] flex justify-between items-center">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-400 font-mono font-bold">TOTAL VALUE: <span className="text-slate-800 font-extrabold">{assign.totalMarks} Marks</span></div>
                <div className="flex items-center gap-1 text-[9px] text-amber-600 font-semibold uppercase font-mono">
                  <Clock className="w-3 h-3 shrink-0" />
                  <span>Due: {assign.dueDate}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDeleteAssignment(assign.id, assign.topic)}
                  className="p-1.5 bg-white hover:bg-rose-50 rounded border border-slate-200 hover:border-rose-300 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Remove this assignment"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        ))}

        {filteredAssignments.length === 0 && (
          <div className="col-span-full bg-white rounded border border-[#E2E8F0] p-12 text-center">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 mt-4 font-display">No Assignments Circulated</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Ready to assign homework objectives? Click the button above to spawn a new workbook sheet for your assigned classes.
            </p>
          </div>
        )}
      </div>

      {/* CREATE MODAL DIALOG */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded border border-slate-200 w-full max-w-md shadow-2xl relative overflow-hidden">
            
            {/* Modal Title bar */}
            <div className="p-4 bg-slate-50 border-b border-[#F1F5F9] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold font-mono tracking-wider text-slate-600 uppercase">
                  CREATE CENTRAL ASSIGNMENT
                </h3>
              </div>
              <button 
                onClick={() => setIsCreateOpen(false)}
                className="text-slate-400 hover:text-slate-850 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form inputs */}
            <form onSubmit={handleCreateAssignment} className="p-5 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                
                {/* Select Class */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Target Class *</label>
                  <select
                    name="classId"
                    value={formValues.classId}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-xs bg-white border rounded focus:border-blue-400 focus:outline-none ${formErrors.classId ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'}`}
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

              {/* Topic Taught */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Assignment Title / Topic *</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g., Simultaneous Linear Equations"
                  value={formValues.topic}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.topic ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.topic && <p className="text-[9px] text-rose-600 font-mono">{formErrors.topic}</p>}
              </div>

              {/* Instructions text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Work Sheet Instructions *</label>
                <textarea
                  name="instructions"
                  rows={3}
                  placeholder="Enter details, questions, text book references..."
                  value={formValues.instructions}
                  onChange={handleInputChange}
                  className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.instructions ? 'border-rose-400' : 'border-slate-200'}`}
                />
                {formErrors.instructions && <p className="text-[9px] text-rose-600 font-mono">{formErrors.instructions}</p>}
              </div>

              {/* Grid with due date and marks */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Due Return Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formValues.dueDate}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.dueDate ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.dueDate && <p className="text-[9px] text-rose-600 font-mono">{formErrors.dueDate}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Total Score Marks *</label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formValues.totalMarks}
                    onChange={handleInputChange}
                    className={`w-full p-2 text-xs border rounded focus:border-blue-400 focus:outline-none ${formErrors.totalMarks ? 'border-rose-400' : 'border-slate-200'}`}
                  />
                  {formErrors.totalMarks && <p className="text-[9px] text-rose-600 font-mono">{formErrors.totalMarks}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Question Format</label>
                  <select
                    name="questionType"
                    value={formValues.questionType}
                    onChange={handleInputChange}
                    className="w-full p-2 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-blue-400"
                  >
                    <option value="Theoretical">Theoretical Practice</option>
                    <option value="Multiple Choice">Multiple Choice Questionnaire</option>
                    <option value="Practical">Practical Lab Task</option>
                    <option value="Essay">Essay & Text Critique</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Submission Channel</label>
                  <select
                    name="submissionMethod"
                    value={formValues.submissionMethod}
                    onChange={handleInputChange}
                    className="w-full p-2 text-xs border border-slate-200 bg-white rounded focus:outline-none focus:border-blue-400"
                  >
                    <option value="Offline">Offline / Physical Submission</option>
                    <option value="Online">Online / Portal PDF Scan</option>
                    <option value="Google Classroom">Google Classroom Stream</option>
                  </select>
                </div>
              </div>

              {/* Attachment upload Simulator area with drag-over */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold font-mono text-slate-500 uppercase">Document Attachment (Optional)</label>
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded p-3 text-center transition-colors relative cursor-pointer ${
                    dragActive ? 'border-blue-400 bg-blue-50/30' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <Paperclip className="w-4 h-4 text-slate-400 mx-auto" />
                  <p className="text-[10px] text-slate-500 font-sans mt-1">
                    {formValues.attachmentName ? (
                      <span className="text-emerald-700 font-bold">Successfully attached: {formValues.attachmentName}</span>
                    ) : (
                      'Drag & Drop sheet or click here'
                    )}
                  </p>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    title=""
                  />
                </div>
                {formErrors.attachment && <p className="text-[9px] text-rose-600 font-mono mt-0.5">{formErrors.attachment}</p>}
                <p className="text-[9px] text-slate-400 font-mono leading-none">Accepts PDF, DOCX, XLSX, PPTX & PNG (Max 10MB)</p>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#1A56DB] hover:bg-[#1E40AF] text-white rounded text-xs font-semibold cursor-pointer"
                >
                  Commit & Dispatch
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
