/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Clock, 
  MapPin, 
  Info, 
  CalendarDays, 
  CheckCircle,
  FileText,
  AlertCircle
} from 'lucide-react';
import { CalendarEvent, School, User } from '../types';

interface SchoolCalendarViewProps {
  user: User | null;
  currentTenant: School | null;
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    tenantId: 'school_central_crest',
    title: 'First Term Exam Review Week',
    description: 'Preparatory revision tutorials for all grade classes ahead of the final term examinations.',
    category: 'Exam',
    startDate: '2026-06-22',
    endDate: '2026-06-26',
    allDay: true,
    location: 'Primary & High School Blocks'
  },
  {
    id: 'evt_2',
    tenantId: 'school_central_crest',
    title: 'Annual General PTA Assembly',
    description: 'Discussion on academic performance reports, capital budget planning, and AI tool integration.',
    category: 'PTA Meeting',
    startDate: '2026-06-20',
    endDate: '2026-06-20',
    allDay: false,
    location: 'Main School Auditorium'
  },
  {
    id: 'evt_3',
    tenantId: 'school_central_crest',
    title: 'Inter-School Sports Gala',
    description: 'Track and field events featuring schools from the Boston region district.',
    category: 'Sports Day',
    startDate: '2026-06-28',
    endDate: '2026-06-28',
    allDay: true,
    location: 'Central Crest Stadium'
  },
  {
    id: 'evt_4',
    tenantId: 'school_central_crest',
    title: 'Final Tuition Balance Due Date',
    description: 'Grace period deadline for the first term tuition fee invoices. Unpaid records face penalty fee adjustments.',
    category: 'Fees Deadline',
    startDate: '2026-06-25',
    endDate: '2026-06-25',
    allDay: true,
    location: 'Accounts Office / Online'
  },
  {
    id: 'evt_5',
    tenantId: 'school_central_crest',
    title: 'Staff Curriculum Development Seminar',
    description: 'Special in-service teacher workshop focusing on advanced personalized lesson planners and AI diagnostics.',
    category: 'Academic',
    startDate: '2026-06-15',
    endDate: '2026-06-16',
    allDay: false,
    location: 'Science Conference Lab'
  }
];

export default function SchoolCalendarView({ user, currentTenant }: SchoolCalendarViewProps) {
  const tenantId = currentTenant?.id || 'school_central_crest';
  const isAdmin = user?.role === 'SchoolAdmin';

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeView, setActiveView] = useState<'month' | 'week' | 'list'>('month');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 18)); // Set consistent year/month based on current mock date (June 2026)
  
  // Create event State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    category: 'Academic' as CalendarEvent['category'],
    startDate: '2026-06-18',
    endDate: '2026-06-18',
    allDay: true,
    location: ''
  });

  useEffect(() => {
    const key = `educore_calendar_events_${tenantId}`;
    const cached = localStorage.getItem(key);
    if (cached) {
      setEvents(JSON.parse(cached));
    } else {
      const tenantSpecific = DEFAULT_EVENTS.map(evt => ({ ...evt, tenantId }));
      setEvents(tenantSpecific);
      localStorage.setItem(key, JSON.stringify(tenantSpecific));
    }
  }, [tenantId]);

  const saveEvents = (updatedEvents: CalendarEvent[]) => {
    setEvents(updatedEvents);
    localStorage.setItem(`educore_calendar_events_${tenantId}`, JSON.stringify(updatedEvents));
  };

  // Category Color Utilities
  const getCategoryStyles = (category: CalendarEvent['category']) => {
    switch (category) {
      case 'Academic': return { badge: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', text: 'text-blue-900', border: 'border-blue-100' };
      case 'PTA Meeting': return { badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600', text: 'text-indigo-900', border: 'border-indigo-100' };
      case 'Holiday': return { badge: 'bg-emerald-50 text-emerald-700 border-emerald-250', dot: 'bg-emerald-600', text: 'text-emerald-950', border: 'border-emerald-100' };
      case 'Exam': return { badge: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', text: 'text-purple-900', border: 'border-purple-100' };
      case 'Sports Day': return { badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-600', text: 'text-amber-900', border: 'border-amber-100' };
      case 'Fees Deadline': return { badge: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-600', text: 'text-rose-900', border: 'border-rose-100' };
      default: return { badge: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-600', text: 'text-slate-900', border: 'border-slate-100' };
    }
  };

  // Months/Days Helper
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevDate = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNextDate = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else {
      setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    }
  };

  const filteredEvents = events.filter(evt => {
    if (filterCategory === 'All') return true;
    return evt.category === filterCategory;
  });

  // Render Month grid
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysCount = new Date(year, month + 1, 0).getDate();
    
    const daysList = [];
    // Padding from previous month
    for (let i = 0; i < firstDay; i++) {
      daysList.push(null);
    }
    // Days of current month
    for (let day = 1; day <= daysCount; day++) {
      daysList.push(day);
    }
    return daysList;
  };

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.startDate) return;

    const added: CalendarEvent = {
      id: `evt_auto_${Date.now()}`,
      tenantId,
      ...newEvent
    };

    saveEvents([...events, added]);
    setIsModalOpen(false);
    setNewEvent({
      title: '',
      description: '',
      category: 'Academic',
      startDate: '2026-06-18',
      endDate: '2026-06-18',
      allDay: true,
      location: ''
    });
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    startOfWeek.setDate(diff);

    const weekList = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(startOfWeek);
      nextDay.setDate(startOfWeek.getDate() + i);
      weekList.push(nextDay);
    }
    return weekList;
  };

  const checkEventOnDate = (evt: CalendarEvent, dateStr: string) => {
    const start = new Date(evt.startDate).toISOString().split('T')[0];
    const end = new Date(evt.endDate).toISOString().split('T')[0];
    return dateStr >= start && dateStr <= end;
  };

  return (
    <div className="space-y-6 select-text">
      
      {/* HEADER ACTION ROAD */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Institutional Calendar Node</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Publish academic landmarks, sports galas, holidays, and PTA schedules securely within the virtual workspace.
          </p>
        </div>

        {isAdmin && (
          <button
            id="btn-calendar-add-event"
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all flex items-center gap-1.5 shadow self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Publish New Event
          </button>
        )}
      </div>

      {/* FILTER SHEETS & VIEW SWITCHER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SIDE BAR CONTROL SLATE */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white p-4.5 rounded-lg border border-slate-200 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              <span>Category Filter</span>
            </div>

            <div className="space-y-1">
              {['All', 'Academic', 'PTA Meeting', 'Holiday', 'Exam', 'Sports Day', 'Event', 'Fees Deadline'].map(cat => {
                const isActive = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded text-left transition-colors cursor-pointer ${
                      isActive 
                        ? 'bg-blue-50 text-blue-800 font-extrabold border border-blue-200/50' 
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <span>{cat}</span>
                    {cat !== 'All' && (
                      <span className={`w-2.5 h-2.5 rounded-full ${getCategoryStyles(cat as CalendarEvent['category']).dot}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/50 p-4 rounded-lg flex gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-[11px] text-blue-900 leading-normal">
              <span className="font-bold">Automated Sync:</span> Deadlines, PTA schedules, and term activities are immediately visible across parent and student terminals.
            </div>
          </div>
        </div>

        {/* CALENDAR DISPLAY SHEET */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-lg overflow-hidden flex flex-col">
          
          {/* MONTH NAVIGATION RIBBON */}
          <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            
            {/* Left controller */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-white border border-slate-250 rounded shadow-sm p-1">
                <button
                  id="btn-calendar-prev"
                  onClick={handlePrevDate}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  id="btn-calendar-next"
                  onClick={handleNextDate}
                  className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <h3 className="text-sm font-extrabold text-slate-900 font-display">
                {activeView === 'month' 
                  ? `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
              </h3>
            </div>

            {/* Selector tabs */}
            <div className="flex bg-slate-100 border border-slate-250/60 p-1 rounded rounded-md">
              {(['month', 'week', 'list'] as const).map(view => (
                <button
                  key={view}
                  onClick={() => setActiveView(view)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold tracking-wider rounded cursor-pointer transition-all ${
                    activeView === view 
                      ? 'bg-white text-blue-700 shadow-sm font-extrabold' 
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {view} View
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC CALENDAR CANVAS */}
          <div className="flex-1 p-5 min-h-[450px]">
            
            {/* MONTH CELL VIEW */}
            {activeView === 'month' && (
              <div className="space-y-4 h-full">
                {/* Weed day headers */}
                <div className="grid grid-cols-7 text-center border-b border-slate-200 pb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{d}</span>
                  ))}
                </div>

                {/* Day Blocks */}
                <div className="grid grid-cols-7 gap-1 bg-slate-100 p-0.5 rounded border border-slate-200/60">
                  {getDaysInMonth().map((day, idx) => {
                    const isToday = day === 18 && currentDate.getMonth() === 5 && currentDate.getFullYear() === 2026;
                    
                    // Format current day to yyyy-mm-dd
                    let dateStr = '';
                    if (day !== null) {
                      const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
                      const dd = String(day).padStart(2, '0');
                      dateStr = `${currentDate.getFullYear()}-${mm}-${dd}`;
                    }

                    // Get events on this date
                    const todaysEvents = day !== null 
                      ? filteredEvents.filter(evt => checkEventOnDate(evt, dateStr))
                      : [];

                    return (
                      <div 
                        key={idx} 
                        className={`min-h-[72px] bg-white p-1.5 flex flex-col justify-between border border-transparent hover:border-slate-300 transition-all ${
                          day === null ? 'bg-slate-55/40 opacity-40' : ''
                        } ${isToday ? 'bg-blue-50/40 relative border-blue-300' : ''}`}
                      >
                        <div className="flex justify-between items-center">
                          {day !== null ? (
                            <span className={`text-xs font-bold font-mono ${
                              isToday 
                                ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-black shadow-sm' 
                                : 'text-slate-800'
                            }`}>{day}</span>
                          ) : <span />}
                        </div>

                        {/* Events stacking */}
                        <div className="mt-1 space-y-1">
                          {todaysEvents.slice(0, 2).map((evt, eIdx) => {
                            const cStyles = getCategoryStyles(evt.category);
                            return (
                              <div 
                                key={eIdx}
                                title={`${evt.title}\n${evt.description}`}
                                className={`text-[8.5px] px-1 py-0.5 rounded border ${cStyles.badge} leading-tight truncate font-medium`}
                              >
                                {evt.title}
                              </div>
                            );
                          })}
                          {todaysEvents.length > 2 && (
                            <div className="text-[8px] text-slate-400 font-mono pl-1">
                              + {todaysEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW PANEL */}
            {activeView === 'week' && (
              <div className="grid grid-cols-7 gap-2">
                {getWeekDays().map((mDay, idx) => {
                  const mDayStr = mDay.toISOString().split('T')[0];
                  const todaysEvents = filteredEvents.filter(evt => checkEventOnDate(evt, mDayStr));
                  const isToday = mDay.getDate() === 18 && mDay.getMonth() === 5 && mDay.getFullYear() === 2026;

                  return (
                    <div 
                      key={idx} 
                      className={`border rounded-md p-3 min-h-[350px] flex flex-col ${
                        isToday ? 'border-blue-400 bg-blue-50/10' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="text-center border-b border-slate-200 pb-2 mb-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {mDay.toLocaleDateString('en-US', { weekday: 'short' })}
                        </p>
                        <p className={`text-sm font-mono font-bold mt-1 ${isToday ? 'text-blue-600 font-extrabold' : 'text-slate-800'}`}>
                          {mDay.getDate()}
                        </p>
                      </div>

                      <div className="flex-1 space-y-2">
                        {todaysEvents.map(evt => {
                          const cStyles = getCategoryStyles(evt.category);
                          return (
                            <div 
                              key={evt.id}
                              className={`p-2 rounded border bg-white ${cStyles.border} shadow-sm space-y-1.5`}
                            >
                              <span className={`inline-block text-[8px] font-bold px-1 py-0.2 rounded ${cStyles.badge}`}>
                                {evt.category}
                              </span>
                              <h4 className={`text-[10px] font-bold ${cStyles.text} leading-tight`}>{evt.title}</h4>
                              {evt.location && (
                                <p className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                  <MapPin className="w-2.5 h-2.5 text-slate-300" />
                                  <span className="truncate">{evt.location}</span>
                                </p>
                              )}
                            </div>
                          );
                        })}

                        {todaysEvents.length === 0 && (
                          <p className="text-[9px] text-slate-400 text-center italic mt-4 font-mono">No land activities</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* LIST CHRONOLOGICAL VIEW */}
            {activeView === 'list' && (
              <div className="space-y-3.5">
                {filteredEvents.length > 0 ? (
                  filteredEvents
                    .sort((a,b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
                    .map(evt => {
                      const cStyles = getCategoryStyles(evt.category);
                      return (
                        <div 
                          key={evt.id} 
                          className={`p-4 border rounded-lg bg-white ${cStyles.border} transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4`}
                        >
                          <div className="space-y-1.5 max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 border rounded-md ${cStyles.badge}`}>
                                {evt.category}
                              </span>
                              {evt.location && (
                                <span className="text-[10px] text-slate-500 font-medium flex items-center gap-0.5">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {evt.location}
                                </span>
                              )}
                            </div>

                            <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                            <p className="text-[11px] text-slate-500 leading-normal">{evt.description}</p>
                          </div>

                          <div className="flex items-center gap-3 bg-slate-50 p-2.5 border border-slate-200 rounded shrink-0 self-start md:self-auto min-w-[150px]">
                            <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                            <div className="font-mono text-[10px] leading-snug">
                              <p className="font-bold text-slate-800">{evt.startDate === evt.endDate ? evt.startDate : `${evt.startDate} to`}</p>
                              {evt.startDate !== evt.endDate && <p className="font-semibold text-slate-550">{evt.endDate}</p>}
                              <p className="text-[8.5px] text-slate-400">{evt.allDay ? 'All Day Landmark' : 'Check Times'}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-12 bg-slate-50/50 border border-dashed border-slate-200 rounded-lg">
                    <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-medium text-slate-600">No events matched the selected filters.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* CREATE EVENT MODAL DIALOG */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-[#0A1E33] px-5 py-4 border-b border-slate-700 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Publish Calendar Event</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEventSubmit} className="p-5 space-y-4">
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Semester PTA Session"
                  value={newEvent.title}
                  onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500 font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Event Description</label>
                <textarea
                  rows={3}
                  placeholder="Summarize context and expectations for readers..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({...newEvent, description: e.target.value})}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Category Category</label>
                  <select
                    value={newEvent.category}
                    onChange={e => setNewEvent({...newEvent, category: e.target.value as CalendarEvent['category']})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:bg-white focus:outline-none font-bold text-slate-800"
                  >
                    <option value="Academic">Academic</option>
                    <option value="PTA Meeting">PTA Meeting</option>
                    <option value="Holiday">Holiday</option>
                    <option value="Exam">Exam</option>
                    <option value="Sports Day">Sports Day</option>
                    <option value="Event">Event</option>
                    <option value="Fees Deadline">Fees Deadline</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Venue Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Assembly Court"
                    value={newEvent.location}
                    onChange={e => setNewEvent({...newEvent, location: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.startDate}
                    onChange={e => setNewEvent({...newEvent, startDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.endDate}
                    onChange={e => setNewEvent({...newEvent, endDate: e.target.value})}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-mono font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="allDayCheck"
                  checked={newEvent.allDay}
                  onChange={e => setNewEvent({...newEvent, allDay: e.target.checked})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 rounded border-slate-300 font-medium cursor-pointer"
                />
                <label htmlFor="allDayCheck" className="text-xs font-bold text-slate-600 select-none cursor-pointer">
                  This calendar landmark is an All-Day Event
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 border border-slate-250 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold shadow cursor-pointer"
                >
                  Publish to Node
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
