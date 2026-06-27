/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Check, 
  AlertTriangle, 
  Users, 
  GraduationCap, 
  FileDown, 
  Info,
  Ban,
  Database,
  ArrowRight
} from 'lucide-react';
import { Teacher, Student, Class, Department, Subject, FeeItem } from '../types';
import { 
  getTeachersInStorage, 
  saveTeachersInStorage, 
  getStudentsInStorage, 
  saveStudentsInStorage, 
  getClassesInStorage,
  saveClassesInStorage,
  getSubjectsInStorage,
  saveSubjectsInStorage,
  getDepartmentsInStorage,
  appendActivityLog 
} from '../data/mockData';

interface BulkImportProps {
  tenantId: string;
}

interface RawImportRow {
  index: number;
  fullName: string;
  uniqueId: string; // Staff ID or Student ID
  gender: string;
  emailContact: string; // email for teachers, parentEmail for student
  phoneContact: string; // phone for teachers, parentPhone for student
  mappedIdField: string; // departmentId for teachers, classId for students
  extraField: string; // assignedClasses for teachers, parentName for students
  status: string;

  // Validation issues
  errors: string[];
  isDupeInDb: boolean;
  isDupeInCsv: boolean;
}

export default function BulkImport({ tenantId }: BulkImportProps) {
  const [importType, setImportType] = useState<'Teachers' | 'Students' | 'Classes' | 'Subjects' | 'Fees'>('Teachers');
  
  // Storage rosters for validations
  const [existingTeachers, setExistingTeachers] = useState<Teacher[]>([]);
  const [existingStudents, setExistingStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [feeItems, setFeeItems] = useState<FeeItem[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  // Preview state
  const [previewRows, setPreviewRows] = useState<RawImportRow[]>([]);
  const [isImportDone, setIsImportDone] = useState(false);
  const [importStats, setImportStats] = useState({ total: 0, valid: 0, saved: 0, skipped: 0 });
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setExistingTeachers(getTeachersInStorage(tenantId));
    setExistingStudents(getStudentsInStorage(tenantId));
    setClasses(getClassesInStorage(tenantId));
    setSubjects(getSubjectsInStorage(tenantId));
    try {
      setFeeItems(JSON.parse(localStorage.getItem(`educore_fee_items_${tenantId}`) || '[]'));
    } catch {
      setFeeItems([]);
    }
    setDepartments(getDepartmentsInStorage(tenantId));
    // Reset state on type/tenant change
    setPreviewRows([]);
    setIsImportDone(false);
    setUploadError('');
  }, [tenantId, importType]);

  const parseCsvLine = (line: string) => {
    const cells: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      const next = line[index + 1];
      if (char === '"' && inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cells.push(current.trim());
    return cells;
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setIsImportDone(false);
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadError('Please upload a CSV file. Excel files should be saved as CSV first.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
      if (lines.length < 2) {
        setUploadError('CSV needs a header row and at least one data row.');
        return;
      }
      const headers = parseCsvLine(lines[0]).map(header => header.toLowerCase().replace(/\s+/g, ''));
      const findCell = (cells: string[], names: string[]) => {
        const index = names.map(name => headers.indexOf(name)).find(pos => pos >= 0);
        return typeof index === 'number' ? cells[index] || '' : '';
      };
      const rows = lines.slice(1).map((line, index): RawImportRow => {
        const cells = parseCsvLine(line);
        return {
          index: index + 1,
          fullName: findCell(cells, ['fullname', 'name', 'studentname', 'teachername', 'classname', 'subjectname', 'feename']),
          uniqueId: findCell(cells, ['uniqueid', 'id', 'staffid', 'studentid', 'code', 'feeid']),
          gender: findCell(cells, ['gender']) || 'N/A',
          emailContact: findCell(cells, ['email', 'parentemail', 'contactemail']),
          phoneContact: findCell(cells, ['phone', 'parentphone', 'contactphone']),
          mappedIdField: findCell(cells, ['mappedidfield', 'classid', 'departmentid', 'subjectid', 'category']),
          extraField: findCell(cells, ['extrafield', 'parentname', 'assignedclass', 'amount']),
          status: findCell(cells, ['status']) || (importType === 'Fees' ? 'Required' : 'Active'),
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        };
      });
      validateRows(rows);
    };
    reader.onerror = () => setUploadError('Could not read this CSV file. Please check the file and try again.');
    reader.readAsText(file);
    event.target.value = '';
  };

  // Demo CSV Templates
  const loadDemoTemplateData = () => {
    setIsImportDone(false);
    
    // Default mock classroom / department IDs
    const classId_0 = classes[0]?.id || 'class_1';
    const deptId_0 = departments[0]?.id || 'dept_1';

    let demoRows: RawImportRow[] = [];

    if (importType === 'Teachers') {
      demoRows = [
        {
          index: 1,
          fullName: 'Dr. Evelyn Stone',
          uniqueId: 'TCH-901',
          gender: 'Female',
          emailContact: 'e.stone@centralcrest.edu',
          phoneContact: '+1 (617) 555-0811',
          mappedIdField: deptId_0,
          extraField: classId_0,
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        {
          index: 2,
          fullName: 'Alfred Pennyworth',
          uniqueId: 'TCH-902',
          gender: 'Male',
          emailContact: 'a.penny@centralcrest.edu',
          phoneContact: '+1 (617) 555-0812',
          mappedIdField: deptId_0,
          extraField: '',
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        { // INVALID ROW: Missing Name, Duplicated Email
          index: 3,
          fullName: '', // Error: File missing name!
          uniqueId: 'TCH-903',
          gender: 'Other',
          emailContact: 'e.stone@centralcrest.edu', // Error: Duplicate in CSV
          phoneContact: '+1 555-1234',
          mappedIdField: '',
          extraField: '',
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        { // INVALID ROW: Duplicate in DB Staff ID
          index: 4,
          fullName: 'Duplicate Professor',
          uniqueId: existingTeachers[0]?.staffId || 'TCH-101', // Duplicate in Db!
          gender: 'Female',
          emailContact: 'prof.dupe@edu.org',
          phoneContact: '+1 555-9876',
          mappedIdField: deptId_0,
          extraField: '',
          status: 'Suspended',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        }
      ];
    } else if (importType === 'Students') {
      demoRows = [
        {
          index: 1,
          fullName: 'Brandon Stark',
          uniqueId: 'STU-440',
          gender: 'Male',
          emailContact: 'stark.parent@winterfell.org',
          phoneContact: '+1 (415) 333-2211',
          mappedIdField: classId_0,
          extraField: 'Eddard Stark',
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        {
          index: 2,
          fullName: 'Arya Stark',
          uniqueId: 'STU-441',
          gender: 'Female',
          emailContact: 'stark.parent@winterfell.org',
          phoneContact: '+1 (415) 333-2211',
          mappedIdField: classId_0,
          extraField: 'Eddard Stark',
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        { // INVALID ROW: Missing Parent Guardian Name
          index: 3,
          fullName: 'Orphan Student',
          uniqueId: 'STU-442',
          gender: 'Other',
          emailContact: 'orphan@contact.org',
          phoneContact: '',
          mappedIdField: classId_0,
          extraField: '', // Error: missing name!
          status: 'Suspended',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        },
        { // INVALID ROW: Duplicate in DB ID
          index: 4,
          fullName: 'Reginald Stark',
          uniqueId: existingStudents[0]?.studentId || 'STU-101', // Error: Duplicated ID in DB!
          gender: 'Male',
          emailContact: 'r.stark@gmail.com',
          phoneContact: '+1 (415) 333-9999',
          mappedIdField: classId_0,
          extraField: 'Lady Stark',
          status: 'Active',
          errors: [],
          isDupeInDb: false,
          isDupeInCsv: false
        }
      ];
    } else if (importType === 'Classes') {
      demoRows = [
        { index: 1, fullName: 'Basic 4', uniqueId: 'CLS-B4', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: subjects[0]?.id || '', extraField: '', status: 'Active', errors: [], isDupeInDb: false, isDupeInCsv: false },
        { index: 2, fullName: 'JHS 3', uniqueId: 'CLS-JHS3', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: subjects[1]?.id || '', extraField: '', status: 'Active', errors: [], isDupeInDb: false, isDupeInCsv: false },
      ];
    } else if (importType === 'Subjects') {
      demoRows = [
        { index: 1, fullName: 'Creative Arts', uniqueId: 'ART', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: '', extraField: '', status: 'Active', errors: [], isDupeInDb: false, isDupeInCsv: false },
        { index: 2, fullName: 'Religious and Moral Education', uniqueId: 'RME', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: '', extraField: '', status: 'Active', errors: [], isDupeInDb: false, isDupeInCsv: false },
      ];
    } else {
      demoRows = [
        { index: 1, fullName: 'First Term Tuition', uniqueId: 'FEE-TUITION', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: 'Tuition', extraField: '450', status: 'Required', errors: [], isDupeInDb: false, isDupeInCsv: false },
        { index: 2, fullName: 'Library Fee', uniqueId: 'FEE-LIB', gender: 'N/A', emailContact: '', phoneContact: '', mappedIdField: 'Library', extraField: '35', status: 'Required', errors: [], isDupeInDb: false, isDupeInCsv: false },
      ];
    }

    // Run custom parsing and validations on the loaded items
    validateRows(demoRows);
  };

  // Execution verification logic
  const validateRows = (rowsList: RawImportRow[]) => {
    const validated = rowsList.map(row => {
      const issues: string[] = [];
      let isDbDupe = false;
      let isCsvDupe = false;

      // Rule 1: Missing Required Fields
      if (!row.fullName.trim()) {
        issues.push('Missing Full Name.');
      }
      if (!row.uniqueId.trim()) {
        issues.push('Missing unique ID identifier.');
      }

      // Teachers Specific Rule: check emails & depts
      if (importType === 'Teachers') {
        if (!row.emailContact.trim()) {
          issues.push('Missing academic email.');
        }
        // Duplicate in Db
        const foundInDb = existingTeachers.some(t => 
          t.staffId.toUpperCase() === row.uniqueId.toUpperCase() || 
          t.email.toLowerCase() === row.emailContact.toLowerCase()
        );
        if (foundInDb) {
          isDbDupe = true;
          issues.push('DUPLICATE_ROW: ID/Email matches active teacher in database.');
        }

        // Duplicate in current CSV list
        const csvDupes = rowsList.filter(r => r.index !== row.index && (
          (r.uniqueId.toUpperCase() === row.uniqueId.toUpperCase() && row.uniqueId) || 
          (r.emailContact.toLowerCase() === row.emailContact.toLowerCase() && row.emailContact)
        ));
        if (csvDupes.length > 0) {
          isCsvDupe = true;
          issues.push('DUPLICATE_CELL: ID/Email matches other node inside CSV registry.');
        }
      } 
      
      // Students Specific rules: check class & parent name
      else if (importType === 'Students') {
        if (!row.extraField.trim()) {
          issues.push('Missing Parent/Guardian Name.');
        }
        // Duplicate in Db
        const foundInDb = existingStudents.some(s => 
          s.studentId.toUpperCase() === row.uniqueId.toUpperCase()
        );
        if (foundInDb) {
          isDbDupe = true;
          issues.push('DUPLICATE_ROW: Student ID already allocated in database.');
        }

        // Duplicate in CSV
        const csvDupes = rowsList.filter(r => r.index !== row.index && (
          r.uniqueId.toUpperCase() === row.uniqueId.toUpperCase() && row.uniqueId
        ));
        if (csvDupes.length > 0) {
          isCsvDupe = true;
          issues.push('DUPLICATE_CELL: Student ID matches other rows inside CSV registry.');
        }
      } else if (importType === 'Classes') {
        if (classes.some(c => c.name.toLowerCase() === row.fullName.toLowerCase())) {
          isDbDupe = true;
          issues.push('DUPLICATE_ROW: Class name already exists.');
        }
      } else if (importType === 'Subjects') {
        if (subjects.some(s => s.code.toLowerCase() === row.uniqueId.toLowerCase() || s.name.toLowerCase() === row.fullName.toLowerCase())) {
          isDbDupe = true;
          issues.push('DUPLICATE_ROW: Subject name or code already exists.');
        }
      } else if (importType === 'Fees') {
        if (!Number(row.extraField)) issues.push('Fee amount must be a number.');
        if (feeItems.some(f => f.name.toLowerCase() === row.fullName.toLowerCase())) {
          isDbDupe = true;
          issues.push('DUPLICATE_ROW: Fee item already exists.');
        }
      }

      return {
        ...row,
        errors: issues,
        isDupeInDb: isDbDupe,
        isDupeInCsv: isCsvDupe
      };
    });

    setPreviewRows(validated);
  };

  // EXECUTE IMPORT MAPPING INTO DB
  const executeBulkImportWrite = () => {
    // Audit only clean rows
    const cleanRows = previewRows.filter(r => r.errors.length === 0);
    if (cleanRows.length === 0) {
      alert('BULK_LOADER_ERROR: You do not have any valid rows in queue. Please repair issues or load test template scripts first.');
      return;
    }

    if (importType === 'Teachers') {
      const addedTeachers: Teacher[] = cleanRows.map(row => ({
        id: `tch_bulk_${Date.now()}_${row.index}`,
        tenantId,
        fullName: row.fullName,
        staffId: row.uniqueId,
        phone: row.phoneContact,
        email: row.emailContact,
        gender: row.gender as any,
        departmentId: row.mappedIdField,
        subjectsTaught: [],
        assignedClasses: [row.extraField].filter(Boolean),
        employmentStatus: row.status as any,
        profilePhoto: `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.uniqueId}`,
        createdAt: new Date().toISOString()
      }));

      const finalRoster = [...existingTeachers, ...addedTeachers];
      saveTeachersInStorage(tenantId, finalRoster);
      setExistingTeachers(finalRoster);

      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Teacher Bulk Enrolled',
        details: `Imported (${addedTeachers.length}) faculty teacher profiles via Excel spreadsheet.`,
        type: 'success'
      });

      setImportStats({
        total: previewRows.length,
        valid: cleanRows.length,
        saved: addedTeachers.length,
        skipped: previewRows.length - cleanRows.length
      });

    } else if (importType === 'Students') {
      const addedStudents: Student[] = cleanRows.map(row => ({
        id: `stu_bulk_${Date.now()}_${row.index}`,
        tenantId,
        fullName: row.fullName,
        studentId: row.uniqueId,
        classId: row.mappedIdField,
        gender: row.gender as any,
        parentName: row.extraField,
        parentPhone: row.phoneContact,
        parentEmail: row.emailContact,
        dateOfBirth: '2014-06-15',
        admissionDate: new Date().toISOString().split('T')[0],
        status: row.status as any,
        profilePhoto: `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.uniqueId}`,
        createdAt: new Date().toISOString()
      }));

      const finalRoster = [...existingStudents, ...addedStudents];
      saveStudentsInStorage(tenantId, finalRoster);
      setExistingStudents(finalRoster);

      appendActivityLog({
        tenantId,
        user: 'School Admin',
        action: 'Student Bulk Admitted',
        details: `Imported (${addedStudents.length}) student profiles via Excel template spreadsheets.`,
        type: 'success'
      });

      setImportStats({
        total: previewRows.length,
        valid: cleanRows.length,
        saved: addedStudents.length,
        skipped: previewRows.length - cleanRows.length
      });
    } else if (importType === 'Classes') {
      const addedClasses: Class[] = cleanRows.map(row => ({
        id: `class_bulk_${Date.now()}_${row.index}`,
        tenantId,
        name: row.fullName,
        subjectIds: [row.mappedIdField].filter(Boolean),
        createdAt: new Date().toISOString()
      }));
      const finalClasses = [...classes, ...addedClasses];
      saveClassesInStorage(tenantId, finalClasses);
      setClasses(finalClasses);
      appendActivityLog({ tenantId, user: 'School Admin', action: 'Class Bulk Imported', details: `Imported ${addedClasses.length} classes.`, type: 'success' });
      setImportStats({ total: previewRows.length, valid: cleanRows.length, saved: addedClasses.length, skipped: previewRows.length - cleanRows.length });
    } else if (importType === 'Subjects') {
      const addedSubjects: Subject[] = cleanRows.map(row => ({
        id: `subj_bulk_${Date.now()}_${row.index}`,
        tenantId,
        name: row.fullName,
        code: row.uniqueId,
        createdAt: new Date().toISOString()
      }));
      const finalSubjects = [...subjects, ...addedSubjects];
      saveSubjectsInStorage(tenantId, finalSubjects);
      setSubjects(finalSubjects);
      appendActivityLog({ tenantId, user: 'School Admin', action: 'Subject Bulk Imported', details: `Imported ${addedSubjects.length} subjects.`, type: 'success' });
      setImportStats({ total: previewRows.length, valid: cleanRows.length, saved: addedSubjects.length, skipped: previewRows.length - cleanRows.length });
    } else {
      const addedFees: FeeItem[] = cleanRows.map(row => ({
        id: `fee_bulk_${Date.now()}_${row.index}`,
        tenantId,
        name: row.fullName,
        amount: Number(row.extraField),
        category: (row.mappedIdField || 'Other') as FeeItem['category'],
        isRequired: row.status !== 'Optional',
        description: `Bulk imported fee item ${row.uniqueId}`
      }));
      const finalFees = [...feeItems, ...addedFees];
      localStorage.setItem(`educore_fee_items_${tenantId}`, JSON.stringify(finalFees));
      setFeeItems(finalFees);
      appendActivityLog({ tenantId, user: 'School Admin', action: 'Fee Items Bulk Imported', details: `Imported ${addedFees.length} fee items.`, type: 'success' });
      setImportStats({ total: previewRows.length, valid: cleanRows.length, saved: addedFees.length, skipped: previewRows.length - cleanRows.length });
    }

    setIsImportDone(true);
    setPreviewRows([]); // Wipe active preview queue
  };

  const validCount = previewRows.filter(r => r.errors.length === 0).length;
  const invalidCount = previewRows.filter(r => r.errors.length > 0).length;

  return (
    <div className="space-y-6 text-xs text-slate-800">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded border border-slate-100 shadow-sm gap-4">
        <div>
          <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2 font-display">
            <FileSpreadsheet className="w-5 h-5 text-[#1A56DB]" />
            Bulk Data Imports Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Bulk-upload students, teachers, classes, subjects, and fee items using a simple step-by-step validator.
          </p>
        </div>

        {/* Dynamic type selectors */}
        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded border border-slate-200">
          {(['Teachers', 'Students', 'Classes', 'Subjects', 'Fees'] as const).map(type => {
            const Icon = type === 'Teachers' ? GraduationCap : type === 'Students' ? Users : type === 'Fees' ? FileSpreadsheet : Database;
            return (
              <button
                key={type}
                onClick={() => setImportType(type)}
                className={`px-3 py-1.5 font-bold transition-all rounded text-[10px] uppercase flex items-center gap-1 cursor-pointer ${
                  importType === type ? 'bg-[#1A56DB] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{type}</span>
              </button>
            );
          })}
        </div>
      </div>

      {isImportDone && (
        <div className="p-5 bg-emerald-50 border border-emerald-250 rounded text-emerald-800 text-xs animate-in zoom-in-95 duration-150">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div className="space-y-2">
              <h4 className="font-extrabold uppercase tracking-wide">IMPORT_JOB_COMPLETED_SUCCESSFULLY</h4>
              <p className="text-emerald-700 leading-normal">
                Structured spreadsheet importing completed. All records matching our database constraints were serialized into active tenants table rows safely.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-1 font-mono text-[10.5px]">
                <div className="bg-white border border-emerald-200/50 px-3 py-1.5 rounded">
                   SAMPLED_ROWS: <strong>{importStats.total}</strong>
                </div>
                <div className="bg-emerald-600 text-white px-3 py-1.5 rounded font-extrabold flex items-center gap-1">
                   COMMITTED_ROWS: <strong>+{importStats.saved}</strong>
                </div>
                <div className="bg-amber-100 border border-amber-200 px-3 py-1.5 rounded text-amber-800">
                   SKIPPED/REJECTED: <strong>{importStats.skipped}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-xs font-black uppercase tracking-wide text-blue-700">Import wizard</p>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          {['Choose data type', 'Load or upload CSV', 'Fix rejected rows', 'Commit valid records'].map((step, index) => (
            <div key={step} className="rounded-xl border border-white bg-white p-3">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-xs font-black text-white">{index + 1}</span>
              <p className="mt-2 text-sm font-black text-slate-950">{step}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-white bg-white p-3">
          <p className="text-[10px] font-black uppercase tracking-wide text-slate-500">CSV header format</p>
          <p className="mt-1 break-all font-mono text-[11px] font-bold text-slate-700">
            fullName, uniqueId, gender, email, phone, mappedIdField, extraField, status
          </p>
          <p className="mt-1 text-[11px] font-semibold text-slate-500">
            Students: mappedIdField is classId and extraField is parentName. Teachers: mappedIdField is departmentId and extraField is assigned class. Fees: mappedIdField is category and extraField is amount.
          </p>
        </div>
      </div>

      {/* COMPACT BENTO INSTRUCTION LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Template info card */}
        <div className="bg-white rounded border border-slate-205 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold flex items-center gap-1.5 text-slate-705">
              <FileDown className="w-4 h-4 text-slate-400" />
               1. Review Structure Requirements
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your upload spreadsheets must align with the exact column schemas. Duplicating values of primary key IDs or emails instantly halts database ingestion on those records.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 mt-3">
             <span className="text-[9.5px] uppercase font-mono font-bold tracking-widest text-[#1A56DB]">TEMPLATES_APPROVED ✔</span>
          </div>
        </div>

        {/* Upload mimicker */}
        <div className="bg-white rounded border border-slate-205 p-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold flex items-center gap-1.5 text-slate-705">
              <Upload className="w-4 h-4 text-slate-400" />
               2. Map Spreadsheets Files
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Drop target worksheets or load preset demoware mockups. You may review rows inside our ledger playground prior to committing updates.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-3 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={loadDemoTemplateData}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-bold hover:bg-slate-850 rounded text-[9.5px] uppercase transition-all flex items-center gap-1 cursor-pointer"
              >
                Load Demo Template CSV
              </button>
              <label className="px-3.5 py-1.5 bg-[#1A56DB] text-white font-bold rounded text-[9.5px] uppercase transition-all flex items-center gap-1 cursor-pointer">
                Upload CSV
                <input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="hidden" />
              </label>
            </div>
            <span className="text-[9px] font-mono text-slate-400 uppercase">CSV PREVIEW READY</span>
          </div>
          {uploadError && (
            <p className="mt-3 rounded border border-rose-200 bg-rose-50 p-2 text-[11px] font-bold text-rose-700">{uploadError}</p>
          )}
        </div>

        {/* Dynamic Database summary stats cards */}
        <div className="bg-[#0A1E33] rounded p-4 text-white flex flex-col justify-between">
          <div className="space-y-2 font-mono">
            <h3 className="font-bold text-slate-250 flex items-center gap-1 text-[11px] tracking-wider uppercase">
               <Database className="w-4 h-4 text-[#1A56DB]" />
               ACTIVE_TENANT_SCHEMAS
            </h3>
            <div className="space-y-1 text-[11px] text-slate-350">
               <p>DATABASE_TID: • <strong className="text-white">{tenantId}</strong></p>
               <p>TEACHERS_TABLE_KEYS: • <strong className="text-white">{existingTeachers.length} rows</strong></p>
               <p>STUDENTS_TABLE_KEYS: • <strong className="text-white">{existingStudents.length} rows</strong></p>
            </div>
          </div>
          <span className="text-[8px] font-mono tracking-widest text-sky-400 uppercase font-bold text-right block mt-3">T24 Centralized Core</span>
        </div>

      </div>

      {/* SPREADSHEET MOCK PREVIEW PLAYGROUND */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded border border-slate-250 overflow-hidden space-y-4 shadow-sm">
          
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs select-none">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 rounded bg-blue-50 text-blue-800 font-extrabold font-mono text-[10px]">PREVIEW QUEUE</span>
              <span className="font-bold text-slate-700">Matched {previewRows.length} Rows inside Spreadsheet File</span>
            </div>

            {/* Ingestion stats */}
            <div className="flex items-center gap-3 text-[10.5px] font-mono font-bold">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                Eligible rows: +{validCount}
              </span>
              <span className="text-rose-700 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                Rejected rows: {invalidCount}
              </span>
              <button
                onClick={executeBulkImportWrite}
                className="px-3 py-1.5 bg-[#1A56DB] hover:bg-opacity-95 text-white font-sans text-[10.5px] font-bold rounded flex items-center gap-1 transition-all cursor-pointer shadow"
              >
                <span>Execute Ingestion Mapping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table display */}
          <table className="w-full text-left border-collapse table-auto text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-raw text-[9.5px] font-mono font-bold text-slate-500 uppercase tracking-widest select-none">
                <th className="px-4 py-3">Row</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Identifier Unique ID</th>
                <th className="px-4 py-3">Contacts Coordinates</th>
                <th className="px-4 py-3">Roster Mapping Field</th>
                <th className="px-4 py-3">Status Value</th>
                <th className="px-4 py-3">Ingestion Compliance Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150 text-xs">
              {previewRows.map(r => {
                const isInvalid = r.errors.length > 0;
                
                return (
                  <tr 
                    key={r.index} 
                    className={`hover:bg-slate-50/60 transition-all ${isInvalid ? 'bg-rose-50/20' : ''}`}
                  >
                    {/* Index */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-400 select-none">#{r.index}</td>
                    
                    {/* Name */}
                    <td className="px-4 py-3">
                      {r.fullName ? (
                        <div className="font-bold text-slate-900">{r.fullName}</div>
                      ) : (
                        <div className="px-2 py-0.5 bg-rose-100 border border-rose-200 text-rose-800 rounded font-bold w-fit text-[10px]">
                           [REJECTED: MISSING_VALUE]
                        </div>
                      )}
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">{r.gender}</span>
                    </td>

                    {/* unique ID */}
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">{r.uniqueId}</td>

                    {/* Email Contact */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800">{r.emailContact || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{r.phoneContact || 'N/A'}</div>
                    </td>

                    {/* department or class */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 font-mono text-[10.5px]">
                         {r.mappedIdField}
                      </span>
                      {r.extraField && (
                        <div className="text-[9px] text-slate-450 mt-1">
                           EXTRA: {r.extraField}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-150 font-bold font-mono text-[10px]">
                         {r.status}
                      </span>
                    </td>

                    {/* Verification report */}
                    <td className="px-4 py-3 select-none">
                      {isInvalid ? (
                        <div className="space-y-1">
                          <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 rounded font-extrabold tracking-wider text-[9px] flex items-center gap-1 w-fit">
                            <Ban className="w-3 h-3" /> FAILED_CRITERIA
                          </span>
                          <ul className="list-disc pl-3 text-[9px] text-rose-600 font-medium leading-none space-y-0.5">
                            {r.errors.map((err, i) => <li key={i}>{err}</li>)}
                          </ul>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded font-extrabold tracking-wider text-[9px] flex items-center gap-1 w-fit">
                           <Check className="w-3 h-3 text-emerald-600" /> COMPLY_SUCCESS
                        </span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      )}

      {/* SAMPLE VISUAL TEXT CSV DESCRIPTION EXAMPLES */}
      <div className="bg-slate-50 p-5 rounded border border-slate-200 space-y-3">
         <h4 className="font-extrabold text-[#1A56DB] uppercase tracking-wide flex items-center gap-1.5 select-none text-[10.5px]">
            <Info className="w-4 h-4" /> Recommended Excel Spreadsheet Formats
         </h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[10.5px] leading-relaxed">
           <div className="bg-white p-3 rounded border border-slate-155">
             <span className="font-extrabold text-slate-700 block mb-1">TEACHER_COLUMN_INDEX:</span>
             <ul className="list-disc pl-4 space-y-1 text-slate-500 font-mono">
               <li><strong>fullName</strong>: Professor full identity</li>
               <li><strong>staffId</strong>: Primary key staff code (unique)</li>
               <li><strong>gender</strong>: Male, Female, or Other</li>
               <li><strong>email</strong>: Primary email identifier</li>
               <li><strong>departmentId</strong>: Target administrative division ID</li>
               <li><strong>status</strong>: Active, Suspended, Ininactive</li>
             </ul>
           </div>

           <div className="bg-white p-3 rounded border border-slate-155">
             <span className="font-extrabold text-slate-700 block mb-1">STUDENT_COLUMN_INDEX:</span>
             <ul className="list-disc pl-4 space-y-1 text-slate-500 font-mono font-mono">
               <li><strong>fullName</strong>: Student full target name</li>
               <li><strong>studentId</strong>: Student unique ID token (unique)</li>
               <li><strong>classId</strong>: Grade division target ID room</li>
               <li><strong>parentName</strong>: Primary emergency contact</li>
               <li><strong>parentPhone</strong>: Valid hotline contact number</li>
               <li><strong>parentEmail</strong>: Optional backup mail address</li>
             </ul>
           </div>
         </div>
      </div>

    </div>
  );
}
