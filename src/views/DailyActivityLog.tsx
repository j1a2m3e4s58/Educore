import React, { useState, useEffect } from 'react';
import { 
  History, 
  Search, 
  Calendar, 
  Trash2, 
  Activity, 
  Layers, 
  BookOpen, 
  Briefcase, 
  Clock, 
  Filter,
  Users
} from 'lucide-react';
import { User, School, TeacherActivityLog } from '../types';
import { 
  getTeacherActivityLogsInStorage, 
  saveTeacherActivityLogsInStorage,
  getTeachersInStorage
} from '../data/mockData';

interface DailyActivityLogProps {
  user: User;
  currentTenant: School;
}

export default function DailyActivityLog({ user, currentTenant }: DailyActivityLogProps) {
  const tenantId = currentTenant.id;
  const isTeacher = user.role === 'Teacher';

  // Resolve Teacher Context
  const allTeachers = getTeachersInStorage(tenantId);
  const teacherProfile = allTeachers.find(t => t.email.toLowerCase() === user.email.toLowerCase());

  // State
  const [logs, setLogs] = useState<TeacherActivityLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Snychronize logs
  useEffect(() => {
    let list = getTeacherActivityLogsInStorage(tenantId);
    if (isTeacher && teacherProfile) {
      list = list.filter(l => l.teacherId === teacherProfile.id);
    }
    setLogs(list);
  }, [tenantId, isTeacher, teacherProfile]);

  // Clear timeline helper
  const handleClearTimeline = () => {
    const confirmation = window.confirm("Are you sure you want to prune and clear out your historical activity tracking? This action is irreversible.");
    if (!confirmation) return;

    if (isTeacher && teacherProfile) {
      const allList = getTeacherActivityLogsInStorage(tenantId);
      const filtered = allList.filter(l => l.teacherId !== teacherProfile.id);
      saveTeacherActivityLogsInStorage(tenantId, filtered);
      setLogs([]);
    } else {
      saveTeacherActivityLogsInStorage(tenantId, []);
      setLogs([]);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.teacherName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter ? log.action === actionFilter : true;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">

      {/* HEADER SECTION */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div>
          <span className="text-[10px] bg-slate-150 text-slate-800 px-2.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
            SYSTEM TEMPORAL AUDITING
          </span>
          <h1 className="text-lg font-bold text-slate-900 mt-2 font-display leading-tight">
            Daily Academic Activity Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isTeacher 
              ? 'Chronological list of your active homework registrations, homework updates, roll calls, and plan validations.'
              : 'Institutional timeline showing master school audits, class filings, teaching documents uploads, and curriculum metrics.'
            }
          </p>
        </div>

        <button
          onClick={handleClearTimeline}
          className="flex items-center gap-1 px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded text-xs font-semibold cursor-pointer transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" /> Prune Log History
        </button>
      </div>

      {/* FILTER ROWS */}
      <div className="bg-white rounded border border-[#E2E8F0] p-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-3xs" style={{ contentVisibility: 'auto' }}>
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            id="activity-log-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search details or instructors..."
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#FBFDFF] border border-slate-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto self-end justify-end">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-[#FBFDFF] border border-slate-200 rounded text-xs focus:outline-none focus:border-blue-500"
          >
            <option value="">-- Action filter --</option>
            <option value="Created Assignment">Created Assignment</option>
            <option value="Marked Attendance">Marked Attendance</option>
            <option value="Recorded Lesson">Recorded Lesson</option>
            <option value="Used Material">Used Material</option>
            <option value="Uploaded Material">Uploaded Material</option>
            <option value="Edited Assignment">Edited Assignment</option>
          </select>

          {(searchQuery || actionFilter) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setActionFilter('');
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-semibold cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* TIMELINE TIMING GRAPH */}
      <div className="bg-white rounded border border-[#E2E8F0] p-6 shadow-sm overflow-hidden" style={{ contentVisibility: 'auto' }}>
        <div className="relative border-l-2 border-[#E2E8F0] pl-6 space-y-6 py-2 ml-4">
          
          {filteredLogs.map((log) => {
            const dateObj = new Date(log.timestamp);
            const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            
            return (
              <div key={log.id} className="relative group text-xs text-slate-600">
                {/* Ring pin pointer indicators */}
                <span className="absolute -left-[30.5px] top-1.5 h-3.5 w-3.5 rounded-full border bg-white border-[#1A56DB] group-hover:scale-110 transition-transform"></span>

                <div className="space-y-1 bg-slate-50/40 hover:bg-slate-50/90 p-4 border border-[#F1F5F9] rounded hover:border-slate-300 transition-colors">
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#0D1F3C] text-sm font-sans">{log.action}</span>
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[9px] font-mono font-bold rounded uppercase">
                        {log.teacherName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
                      <Clock className="w-3h-3" style={{ width: '12px', height: '12px' }} />
                      <span>{dateStr} | {timeStr}</span>
                    </div>
                  </div>

                  <p className="text-slate-500 font-sans text-xs leading-normal">
                    {log.details}
                  </p>

                  {/* Badged metadata shortcuts */}
                  {(log.className || log.subjectName) && (
                    <div className="flex items-center gap-2 pt-1 font-mono text-[9px]">
                      {log.className && (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded font-bold">
                          Class: {log.className}
                        </span>
                      )}
                      {log.subjectName && (
                        <span className="px-2 py-0.5 bg-blue-100/50 border border-blue-200 text-blue-800 rounded font-bold">
                          Subject: {log.subjectName}
                        </span>
                      )}
                    </div>
                  )}

                </div>

              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="text-center py-12 -ml-6 text-slate-400">
              <History className="w-12 h-12 text-slate-200 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700 mt-4 leading-none">Activity Timeline Empty</h3>
              <p className="text-xs text-slate-400 mt-2">No logging sequences matched search query filters in this node database.</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
