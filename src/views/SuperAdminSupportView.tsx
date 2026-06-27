/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  MessageSquare, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Send, 
  User, 
  HelpCircle, 
  Filter, 
  Search,
  PlusCircle,
  Building2,
  Trash2,
  Bookmark
} from 'lucide-react';
import { SupportTicket, SupportTicketResponse, School, User as AppUser } from '../types';

interface SuperAdminSupportViewProps {
  tickets: SupportTicket[];
  onAddTicket: (ticket: SupportTicket) => void;
  onUpdateTicket: (ticket: SupportTicket) => void;
  schools: School[];
  currentUser: AppUser | null;
}

export default function SuperAdminSupportView({
  tickets,
  onAddTicket,
  onUpdateTicket,
  schools,
  currentUser
}: SuperAdminSupportViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [responseText, setResponseText] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Create ticket simulation form states
  const [showSimulateForm, setShowSimulateForm] = useState(false);
  const [simSchoolId, setSimSchoolId] = useState(schools[0]?.id || 'school_central_crest');
  const [simTitle, setSimTitle] = useState('');
  const [simDesc, setSimDesc] = useState('');
  const [simPriority, setSimPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [simModule, setSimModule] = useState('Financial Center');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'Urgent':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-rose-100 border border-rose-250 text-rose-700 uppercase font-mono rounded">☠ Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-amber-50 border border-amber-205 text-amber-700 uppercase font-mono rounded">▲ High</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-blue-50 border border-blue-205 text-blue-700 uppercase font-mono rounded">◆ Medium</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-100 border border-slate-205 text-slate-505 uppercase font-mono rounded">▼ Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Open':
        return <span className="px-2 py-0.5 text-[9px] font-black bg-rose-50 border border-rose-200 text-rose-605 uppercase font-mono rounded-full">Open</span>;
      case 'In Progress':
        return <span className="px-2 py-0.5 text-[9px] font-black bg-blue-50 border border-blue-200 text-blue-605 uppercase font-mono rounded-full">In Progress</span>;
      case 'Resolved':
        return <span className="px-2 py-0.5 text-[9px] font-black bg-emerald-50 border border-emerald-200 text-emerald-605 uppercase font-mono rounded-full">Resolved</span>;
      default:
        return <span className="px-2 py-0.5 text-[9px] font-black bg-slate-50 border border-slate-200 text-slate-505 uppercase font-mono rounded-full">Closed</span>;
    }
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simTitle || !simDesc) return;

    const matchedSch = schools.find(s => s.id === simSchoolId);
    
    const newTick: SupportTicket = {
      id: `tick_${Date.now()}`,
      tenantId: simSchoolId,
      schoolName: matchedSch?.name || 'Local High School',
      title: simTitle,
      description: simDesc,
      module: simModule,
      priority: simPriority,
      status: 'Open',
      createdById: 'usr_dem',
      createdByName: matchedSch?.adminName || 'Principal Principal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      responses: []
    };

    onAddTicket(newTick);
    setSelectedTicketId(newTick.id);
    setShowSimulateForm(false);
    setSimTitle('');
    setSimDesc('');
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !responseText.trim()) return;

    const newRes: SupportTicketResponse = {
      id: `res_${Date.now()}`,
      responderId: currentUser?.id || 'sa_lead',
      responderName: currentUser?.name || 'Central SaaS Support Desk',
      responderRole: 'SuperAdmin',
      text: responseText,
      createdAt: new Date().toISOString()
    };

    const updated: SupportTicket = {
      ...selectedTicket,
      status: 'In Progress',
      updatedAt: new Date().toISOString(),
      responses: [...selectedTicket.responses, newRes]
    };

    onUpdateTicket(updated);
    setResponseText('');
  };

  const handleToggleTicketStatus = (status: SupportTicket['status']) => {
    if (!selectedTicket) return;
    onUpdateTicket({
      ...selectedTicket,
      status,
      updatedAt: new Date().toISOString()
    });
  };

  const handleTogglePriority = (priority: SupportTicket['priority']) => {
    if (!selectedTicket) return;
    onUpdateTicket({
      ...selectedTicket,
      priority,
      updatedAt: new Date().toISOString()
    });
  };

  const filteredTickets = tickets.filter(t => {
    if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
    if (statusFilter !== 'All' && t.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-150 select-text">
      
      {/* TICKET HEADER HERO */}
      <div className="bg-gradient-to-r from-[#0A1E33] to-[#122E4D] text-white p-8 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 select-none shadow-md">
        <div className="space-y-2">
          <span className="text-[10px] font-mono font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-wider border border-blue-500/20">
             Central SaaS Kundensupport
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight font-display">Institutional Response Desk Support</h2>
          <p className="text-sm text-slate-350 max-w-2xl leading-relaxed animate-fade-in">
             Centralized ticket registry for integrated micro-schools admins. Answer service inquiries, assign engineering priorities, and track technical SLA deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowSimulateForm(true)}
          className="px-5 py-3 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 whitespace-nowrap"
        >
          <PlusCircle className="w-4.5 h-4.5" /> Simulate Support Ticket
        </button>
      </div>

      {/* TICKET CONSOLE SPLIT VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SIDE BAR LIST */}
        <div className="lg:col-span-1 bg-white border border-slate-205 rounded-2xl p-6 space-y-5 flex flex-col min-h-[500px] shadow-sm">
          <div className="space-y-4 pb-4 border-b border-slate-100 select-none">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">Open Tickets Registry</h3>
            
            {/* Filters */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold block">Priority</span>
                <select 
                  value={priorityFilter} 
                  onChange={e => setPriorityFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 transition-colors focus:bg-white cursor-pointer"
                >
                  <option value="All">All Priority</option>
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-500 font-bold block">Ticket State</span>
                <select 
                  value={statusFilter} 
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs font-bold text-slate-700 transition-colors focus:bg-white cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ticket list strip */}
          <div className="space-y-3 flex-grow overflow-y-auto max-h-[460px] divide-y divide-slate-100 pr-1">
            {filteredTickets.map(t => {
              const isSelected = t.id === selectedTicketId;
              const hasUnreplied = t.responses.length === 0 || t.responses[t.responses.length - 1].responderRole !== 'SuperAdmin';
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`pt-3 first:pt-0 pb-3 px-4 rounded-xl border text-left cursor-pointer transition-all space-y-2 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                      : 'border-transparent hover:bg-slate-50/80 hover:border-slate-100'
                  }`}
                >
                  <div className="flex justify-between items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider max-w-[130px] truncate">
                      {t.schoolName}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] text-slate-400 font-semibold">{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-blue-950 font-extrabold' : 'text-slate-800'}`}>
                    {t.title}
                  </h4>

                  <div className="flex items-center justify-between pt-1 select-none">
                    <div className="flex gap-1.5 flex-wrap">
                      {getPriorityBadge(t.priority)}
                      {getStatusBadge(t.status)}
                    </div>

                    {hasUnreplied && t.status !== 'Resolved' && t.status !== 'Closed' && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-rose-350 shadow-sm" title="Needs Response" />
                    )}
                  </div>
                </div>
              );
            })}

            {filteredTickets.length === 0 && (
              <p className="text-xs text-slate-400 italic py-10 text-center font-medium">No system support tickets meeting criteria.</p>
            )}
          </div>
        </div>

        {/* ACTIVE CONVERSATION THREAD */}
        <div className="lg:col-span-2 bg-white border border-slate-205 rounded-2xl p-6 flex flex-col justify-between min-h-[500px] shadow-sm">
          {selectedTicket ? (
            <div className="h-full flex flex-col justify-between space-y-6">
              
              {/* Header metadata */}
              <div className="pb-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Building2 className="w-4.5 h-4.5 text-blue-600" />
                    <span className="text-sm font-extrabold text-slate-800">{selectedTicket.schoolName}</span>
                    <span className="text-[10px] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md font-mono text-blue-600 uppercase tracking-wider font-bold">TID: {selectedTicket.tenantId}</span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 tracking-tight leading-snug mt-1.5">{selectedTicket.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">Topic Module: <strong className="text-slate-700 font-bold">{selectedTicket.module}</strong> • Created by Principal <strong className="text-slate-700 font-bold">{selectedTicket.createdByName}</strong></p>
                </div>
 
                {/* Status action switches */}
                <div className="flex gap-2 self-end sm:self-auto select-none">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono text-right">Pri:</span>
                    <select
                      value={selectedTicket.priority}
                      onChange={e => handleTogglePriority(e.target.value as any)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
 
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono text-right">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={e => handleToggleTicketStatus(e.target.value as any)}
                      className="px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-mono bg-slate-50 font-bold cursor-pointer text-slate-700"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>
              </div>
 
              {/* Chat Thread */}
              <div className="flex-grow space-y-4 overflow-y-auto max-h-[340px] p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                
                {/* Org Description */}
                <div className="p-4 bg-white border border-slate-150 rounded-xl space-y-2 shadow-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono select-none">
                    <span className="font-bold text-slate-600 flex items-center gap-1.5"><User className="w-4 h-4 text-slate-500" /> Tenant Submitter ({selectedTicket.createdByName})</span>
                    <span>{new Date(selectedTicket.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed select-all whitespace-pre-line font-sans">{selectedTicket.description}</p>
                </div>
 
                {/* Multi Responses list */}
                {selectedTicket.responses.map(res => {
                  const isSA = res.responderRole === 'SuperAdmin';
                  return (
                    <div 
                      key={res.id} 
                      className={`p-4 rounded-xl border max-w-[85%] space-y-2 shadow-xs ${
                        isSA 
                          ? 'ml-auto bg-blue-50/40 border-blue-150 text-slate-800' 
                          : 'bg-white border-slate-200 text-slate-850'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px] font-mono select-none">
                        <span className={`font-bold uppercase ${isSA ? 'text-blue-700' : 'text-slate-600'}`}>
                          {isSA ? '★ Central Support Staff' : `Principal: ${res.responderName}`}
                        </span>
                        <span className="text-slate-400">{new Date(res.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-xs select-all leading-relaxed whitespace-pre-line font-sans">{res.text}</p>
                    </div>
                  );
                })}
 
                {selectedTicket.responses.length === 0 && (
                  <p className="text-center font-mono text-[10px] text-slate-400 py-6 select-none">--- STANDBY: Support representative response outstanding ---</p>
                )}
              </div>
 
              {/* Response input */}
              <form onSubmit={handleSendResponse} className="pt-4 border-t border-slate-150 flex gap-3">
                <input
                  type="text"
                  required
                  placeholder={selectedTicket.status === 'Closed' ? "Ticket closed. Re-Open first to chat..." : "Write official reply from central administration desk..."}
                  disabled={selectedTicket.status === 'Closed'}
                  value={responseText}
                  onChange={e => setResponseText(e.target.value)}
                  className="flex-1 px-4 py-3 text-xs border border-slate-200 rounded-xl focus:bg-white focus:border-blue-600 bg-slate-50/50 outline-none transition-all placeholder:text-slate-400 font-sans"
                />
                <button
                  type="submit"
                  disabled={selectedTicket.status === 'Closed'}
                  className="px-5 py-3 bg-[#1A56DB] hover:bg-blue-700 hover:shadow-md transition-all text-white text-xs font-black rounded-xl cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> <span>Send</span>
                </button>
              </form>
 
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-slate-400 py-20 space-y-3 select-none">
              <HelpCircle className="w-16 h-16 text-slate-350" />
              <h4 className="font-extrabold text-slate-700 text-base font-sans">No Target Ticket Active</h4>
              <p className="text-xs max-w-sm text-center text-slate-400 leading-relaxed font-sans">Select an institutional inquiry block on the list registry pane panel, or simulate a support issue request.</p>
            </div>
          )}
        </div>

      </div>

      {/* SIMULATE CREATOR TICKET MODAL */}
      {showSimulateForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-100">
            
            <div className="bg-[#0A1E33] px-6 py-4 border-b border-slate-700 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold uppercase tracking-wider font-sans">Simulate School Support Request</h3>
              <button onClick={() => setShowSimulateForm(false)} className="text-slate-400 hover:text-white cursor-pointer font-bold text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSimulateSubmit} className="p-6 space-y-4 text-xs select-text font-sans">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide font-mono text-[10px]">Trigger Origin School</label>
                <select
                  value={simSchoolId}
                  onChange={e => setSimSchoolId(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 font-bold bg-slate-50 text-xs focus:bg-white cursor-pointer"
                >
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide font-mono text-[10px]">Module Section</label>
                  <select
                    value={simModule}
                    onChange={e => setSimModule(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 text-xs focus:bg-white cursor-pointer"
                  >
                    <option value="AI Academic Suite">AI Academic Suite</option>
                    <option value="Financial Center">Financial Center</option>
                    <option value="SMS Gateway APIs">SMS Gateway APIs</option>
                    <option value="Daily Lesson Records">Daily Lesson Records</option>
                    <option value="Bulk Import CSV">Bulk Import CSV</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-500 uppercase tracking-wide font-mono text-[10px]">Priority</label>
                  <select
                    value={simPriority}
                    onChange={e => setSimPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-700 bg-slate-50 text-xs focus:bg-white cursor-pointer"
                  >
                    <option value="Low">Low priority</option>
                    <option value="Medium">Medium priority</option>
                    <option value="High">High priority</option>
                    <option value="Urgent">Urgent SLA</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide font-mono text-[10px]">Inquiry Title Header</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI Question bank generator throws timeout error"
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:bg-white text-slate-800 text-xs outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-500 uppercase tracking-wide font-mono text-[10px]">Issue Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain issue details..."
                  value={simDesc}
                  onChange={e => setSimDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:bg-white text-slate-800 text-xs outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateForm(false)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl bg-slate-50 hover:bg-slate-100 cursor-pointer font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-sm"
                >
                  Save Simulated Ticket
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
