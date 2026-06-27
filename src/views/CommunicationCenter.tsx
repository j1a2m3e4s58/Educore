/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Send, 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Plus, 
  History, 
  Bookmark, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Sliders, 
  BookMarked,
  Info
} from 'lucide-react';
import { Announcement, CommunicationTemplate, EmailLog, Message, SMSLog, School, User } from '../types';

interface CommunicationCenterProps {
  user: User | null;
  currentTenant: School | null;
}

const SEEDED_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'tpl_1',
    tenantId: 'school_central_crest',
    name: 'Absenteeism Notice (SMS)',
    channel: 'SMS',
    category: 'Attendance',
    bodyTemplate: 'Urgent: Your child [Student Name] was marked Absent during morning attendance roll call. Please contact the Office immediately.'
  },
  {
    id: 'tpl_2',
    tenantId: 'school_central_crest',
    name: 'Assignment Reminder (Email)',
    channel: 'Email',
    category: 'Assignment',
    subjectTemplate: 'Homework Deadlines: Pending Assignment Reminder',
    bodyTemplate: 'Dear Parents, \n\nThis is a friendly reminder that [Student Name] has an outstanding assignment "[Assignment Title]" due on [Due Date]. Please ensure they complete and upload it.'
  },
  {
    id: 'tpl_3',
    tenantId: 'school_central_crest',
    name: 'Fee Outstanding Levy Notice (All)',
    channel: 'All',
    category: 'FeeReminder',
    subjectTemplate: 'Notice: Tuition Balance Arrears Outstanding',
    bodyTemplate: 'Dear Parent of [Student Name], please be notified that the outstanding budget balance for invoice [Invoice Number] is $[Balance]. Please clear before the due deadline [Due Date].'
  },
  {
    id: 'tpl_4',
    tenantId: 'school_central_crest',
    name: 'Exam Schedule Dispatch (In-App)',
    channel: 'In-App',
    category: 'ExamNotice',
    bodyTemplate: 'Notice: First Semester Final Examination Review guides and room listings are now published on the Student Terminal. Study hard!'
  },
  {
    id: 'tpl_5',
    tenantId: 'school_central_crest',
    name: 'Bad Weather Postponement (SMS)',
    channel: 'SMS',
    category: 'Emergency',
    bodyTemplate: 'ALERT: Due to district weather advisories, school operations are deferred for tomorrow. Virtual e-learning continues via portals.'
  }
];

const SEEDED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_1',
    tenantId: 'school_central_crest',
    title: 'First Term Final Examination Timetable Released',
    content: 'The definitive room allocations and schedules for the mid-year examination block starting June 22nd has been officially compiled. Students are requested to inspect their syllabus summaries, clear balance invoices, and access their revision portals. Best of luck to our scholars!',
    targetAudience: 'All',
    createdBy: 'Dr. Sarah Jenkins',
    createdAt: '2026-06-12T09:00:00Z',
    pinned: true
  },
  {
    id: 'ann_2',
    tenantId: 'school_central_crest',
    title: 'New Cognitive AI Revision Companion Live',
    content: 'We are thrilled to launch our state-of-the-art AI Cognitive Suite! Faculty teachers can now transmit summarization outlines to Student Portals for seamless mobile revision sessions. Engage deeply and build study flashcards.',
    targetAudience: 'Students',
    createdBy: 'Elizabeth Vance',
    createdAt: '2026-06-14T11:30:00Z',
    pinned: false
  },
  {
    id: 'ann_3',
    tenantId: 'school_central_crest',
    title: 'Annual General PTA Assembly Reminders',
    content: 'The central administration extends invitations to all parents and guardians for the PTA workshop scheduled inside the main hall this weekend. Dr. Jenkins will be addressing new curriculum milestones and security parameters.',
    targetAudience: 'Parents',
    createdBy: 'Dr. Sarah Jenkins',
    createdAt: '2026-06-15T15:00:00Z',
    pinned: true
  }
];

const SEEDED_SMS_LOGS: SMSLog[] = [
  { id: 'sms_1', tenantId: 'school_central_crest', recipientName: 'Robert Vance', recipientPhone: '+1 (617) 555-9011', messageText: 'Urgent: Your child Julian Vance was marked Absent during morning attendance roll call. Please contact the Office.', status: 'Delivered', sentAt: '2026-06-18T08:32:00Z' },
  { id: 'sms_2', tenantId: 'school_central_crest', recipientName: 'Mariama Kante', recipientPhone: '+1 (617) 555-0019', messageText: 'Notice: Tuition balance of $770 for Amara Kante is overdue. Please settle before the grace period closure.', status: 'Sent', sentAt: '2026-06-17T14:15:00Z' }
];

const SEEDED_EMAIL_LOGS: EmailLog[] = [
  { id: 'eml_1', tenantId: 'school_central_crest', recipientName: 'Robert Vance', recipientEmail: 'r.vance@gmail.com', subject: 'PTA Assembly Invitations', body: 'Central Crest parent association requests your esteemed attendance at our regional assembly...', status: 'Sent', sentAt: '2026-06-16T10:00:00Z' }
];

export default function CommunicationCenter({ user, currentTenant }: CommunicationCenterProps) {
  const tenantId = currentTenant?.id || 'school_central_crest';
  const isAdmin = user?.role === 'SchoolAdmin';

  // Core messaging databases
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);

  // Composer States
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [msgChannel, setMsgChannel] = useState<'SMS' | 'Email' | 'In-App' | 'All'>('SMS');
  const [msgRecipientType, setMsgRecipientType] = useState<Message['recipientType']>('Parents');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');

  // Active view tab
  const [activeTab, setActiveTab] = useState<'composer' | 'announcements' | 'templates' | 'sms' | 'email'>('composer');

  // Load from local storage
  useEffect(() => {
    const keyAnn = `educore_announcements_${tenantId}`;
    const keyTpl = `educore_comm_templates_${tenantId}`;
    const keySms = `educore_sms_logs_${tenantId}`;
    const keyEml = `educore_email_logs_${tenantId}`;

    const cachedAnn = localStorage.getItem(keyAnn);
    const cachedTpl = localStorage.getItem(keyTpl);
    const cachedSms = localStorage.getItem(keySms);
    const cachedEml = localStorage.getItem(keyEml);

    if (cachedAnn) setAnnouncements(JSON.parse(cachedAnn));
    else {
      setAnnouncements(SEEDED_ANNOUNCEMENTS);
      localStorage.setItem(keyAnn, JSON.stringify(SEEDED_ANNOUNCEMENTS));
    }

    if (cachedTpl) setTemplates(JSON.parse(cachedTpl));
    else {
      setTemplates(SEEDED_TEMPLATES);
      localStorage.setItem(keyTpl, JSON.stringify(SEEDED_TEMPLATES));
    }

    if (cachedSms) setSmsLogs(JSON.parse(cachedSms));
    else {
      setSmsLogs(SEEDED_SMS_LOGS);
      localStorage.setItem(keySms, JSON.stringify(SEEDED_SMS_LOGS));
    }

    if (cachedEml) setEmailLogs(JSON.parse(cachedEml));
    else {
      setEmailLogs(SEEDED_EMAIL_LOGS);
      localStorage.setItem(keyEml, JSON.stringify(SEEDED_EMAIL_LOGS));
    }
  }, [tenantId]);

  // Persisters
  const persistAnnouncements = (fresh: Announcement[]) => {
    setAnnouncements(fresh);
    localStorage.setItem(`educore_announcements_${tenantId}`, JSON.stringify(fresh));
  };

  const persistSmsLogs = (fresh: SMSLog[]) => {
    setSmsLogs(fresh);
    localStorage.setItem(`educore_sms_logs_${tenantId}`, JSON.stringify(fresh));
  };

  const persistEmailLogs = (fresh: EmailLog[]) => {
    setEmailLogs(fresh);
    localStorage.setItem(`educore_email_logs_${tenantId}`, JSON.stringify(fresh));
  };

  // Compose Submit Handler (Fires virtual network gateways logs instantly)
  const handleComposeDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgTitle || !msgBody) return;

    // Based on recipient, simulate dispatch logs
    let recipientTypeName = 'Roster Member';
    if (msgRecipientType === 'Parents') recipientTypeName = 'Parent Registry';
    else if (msgRecipientType === 'Students') recipientTypeName = 'Student Registry';
    else if (msgRecipientType === 'Teachers') recipientTypeName = 'Faculty Staff';
    else if (msgRecipientType === 'Class') recipientTypeName = `Class Roster ${selectedClassId || '10A'}`;
    else if (msgRecipientType === 'Department') recipientTypeName = `Department ${selectedDeptId || 'Mathematics'}`;

    if (msgChannel === 'SMS' || msgChannel === 'All') {
      const addedSms: SMSLog = {
        id: `sms_auto_${Date.now()}`,
        tenantId,
        recipientName: recipientTypeName,
        recipientPhone: msgRecipientType === 'Parents' ? '+1 (617) 555-9011' : '+1 (555) 019-9218',
        messageText: msgBody,
        status: 'Delivered',
        sentAt: new Date().toISOString()
      };
      persistSmsLogs([addedSms, ...smsLogs]);
    }

    if (msgChannel === 'Email' || msgChannel === 'All') {
      const addedEml: EmailLog = {
        id: `eml_auto_${Date.now()}`,
        tenantId,
        recipientName: recipientTypeName,
        recipientEmail: msgRecipientType === 'Parents' ? 'parent.vance@gmail.com' : 'academic.staff@educore.edu',
        subject: msgTitle,
        body: msgBody,
        status: 'Sent',
        sentAt: new Date().toISOString()
      };
      persistEmailLogs([addedEml, ...emailLogs]);
    }

    // Also write to active announcements if designated Whole School
    if (msgRecipientType === 'Whole School') {
      const addedAnn: Announcement = {
        id: `ann_auto_${Date.now()}`,
        tenantId,
        title: msgTitle,
        content: msgBody,
        targetAudience: 'All',
        createdBy: user?.name || 'School Principal',
        createdAt: new Date().toISOString(),
        pinned: false
      };
      persistAnnouncements([addedAnn, ...announcements]);
    } else if (msgRecipientType === 'Parents' || msgRecipientType === 'Students') {
      const addedAnn: Announcement = {
        id: `ann_auto_${Date.now()}`,
        tenantId,
        title: msgTitle,
        content: msgBody,
        targetAudience: msgRecipientType as Announcement['targetAudience'],
        createdBy: user?.name || 'School Principal',
        createdAt: new Date().toISOString(),
        pinned: false
      };
      persistAnnouncements([addedAnn, ...announcements]);
    }

    alert(`VIRTUAL DISPATCH GATE: Messages synced to outbound queues! Generated logs in tables.`);
    
    // Clear composer
    setMsgTitle('');
    setMsgBody('');
  };

  const handleApplyTemplate = (tpl: CommunicationTemplate) => {
    setMsgChannel(tpl.channel === 'All' ? 'All' : tpl.channel as any);
    setMsgBody(tpl.bodyTemplate);
    if (tpl.subjectTemplate) {
      setMsgTitle(tpl.subjectTemplate);
    } else {
      setMsgTitle(`Notification regarding ${tpl.category}`);
    }
    setActiveTab('composer');
  };

  const handleTogglePinAnnouncement = (id: string) => {
    const updated = announcements.map(ann => {
      if (ann.id === id) return { ...ann, pinned: !ann.pinned };
      return ann;
    });
    persistAnnouncements(updated);
  };

  return (
    <div className="space-y-6 select-text">
      
      {/* HEADER RIBBON */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Communication Node & Hub</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch urgent announcement banners, high-priority automated SMS attendance reminders, curriculum emails, and localized in-app alarms across the campus mesh.
          </p>
        </div>
      </div>

      {/* MATRIX LAYOUT TABS */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* SMALL SELECTION PANEL SIDEBAR */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shrink-0 shadow-sm space-y-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Routing Sections</p>
          
          <div className="flex flex-col space-y-1">
            <button
              onClick={() => setActiveTab('composer')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded text-left cursor-pointer transition-colors ${
                activeTab === 'composer' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Compose Message</span>
            </button>

            <button
              onClick={() => setActiveTab('announcements')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded text-left cursor-pointer transition-colors ${
                activeTab === 'announcements' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Announcements Board</span>
            </button>

            <button
              onClick={() => setActiveTab('templates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold rounded text-left cursor-pointer transition-colors ${
                activeTab === 'templates' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <BookMarked className="w-4 h-4" />
              <span>Template Presets</span>
            </button>
            
            <p className="border-t border-slate-100 pt-3 pb-1 text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">Outbound Gateway Logs</p>

            <button
              onClick={() => setActiveTab('sms')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded text-left cursor-pointer transition-colors ${
                activeTab === 'sms' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4" />
                <span>SMS Gateway Logs</span>
              </span>
              <span className="text-[9px] font-mono font-black text-slate-400">{smsLogs.length}</span>
            </button>

            <button
              onClick={() => setActiveTab('email')}
              className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded text-left cursor-pointer transition-colors ${
                activeTab === 'email' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Mail className="w-4 h-4" />
                <span>Email Gateway Logs</span>
              </span>
              <span className="text-[9px] font-mono font-black text-slate-400">{emailLogs.length}</span>
            </button>
          </div>

          <div className="p-3 bg-blue-50 text-blue-900 rounded border border-blue-150/40 text-[10px] leading-normal flex gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 text-blue-600" />
            <div>
              <span className="font-bold">Privacy Scoped:</span> outbound log data streams are sealed only to parents and student rosters matching your current credential node.
            </div>
          </div>
        </div>

        {/* CONTAINER SHEETS FOR CHOSEN TAB */}
        <div className="lg:col-span-3 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          
          {/* TAB 1: COMPOSE */}
          {activeTab === 'composer' && (
            <div className="p-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-600" />
                Dispatch Center Composer
              </h3>

              <form onSubmit={handleComposeDispatch} className="space-y-4">
                
                {/* Channel & Recipient selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Outbound Channel</label>
                    <select
                      value={msgChannel}
                      onChange={e => setMsgChannel(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-bold text-slate-800"
                    >
                      <option value="SMS">SMS dispatch only (Telecom Gateway)</option>
                      <option value="Email">Email document proxy</option>
                      <option value="In-App">In-Portal message toast</option>
                      <option value="All">All Pathways synchronized</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Target Audience</label>
                    <select
                      value={msgRecipientType}
                      onChange={e => setMsgRecipientType(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-bold text-slate-800"
                    >
                      <option value="Parents">Parents of Pupils</option>
                      <option value="Students">Enroll Students</option>
                      <option value="Teachers">Faculty Staff Teachers</option>
                      <option value="Class">Specific Class</option>
                      <option value="Whole School">Whole School Node</option>
                    </select>
                  </div>

                </div>

                {/* Specific selectors */}
                {msgRecipientType === 'Class' && (
                  <div className="space-y-1 grid grid-cols-2 gap-4 animate-in fade-in duration-200">
                    <div className="col-span-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Class Identifier</label>
                      <input
                        type="text"
                        placeholder="e.g. 10A"
                        required
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-200 rounded"
                      />
                    </div>
                  </div>
                )}

                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Push Title / Subject Line</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bad Weather Operations Suspend Warning"
                    value={msgTitle}
                    onChange={e => setMsgTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded font-semibold text-slate-900"
                  />
                </div>

                {/* Body */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Message Body / SMS Character block</label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Provide specific message content..."
                    value={msgBody}
                    onChange={e => setMsgBody(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded text-slate-800 leading-normal font-sans"
                  />
                  <p className="text-[9px] font-mono text-slate-400 text-right">
                    Characters: {msgBody.length} | SMS Units: {Math.ceil(msgBody.length / 160)}
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer font-sans uppercase tracking-wider"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Secure Broadcast
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* TAB 2: ANNOUNCEMENTS OUT */}
          {activeTab === 'announcements' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                Active Announcements Log
              </h3>

              <div className="space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="p-4 border border-slate-200 rounded-lg hover:shadow-sm bg-white transition-all space-y-2 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        {ann.pinned ? (
                          <span className="inline-block text-[8px] bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold px-1 py-0.2 rounded uppercase font-mono tracking-wider mr-2">
                             ★ Pinned Node Announcement
                          </span>
                        ) : null}
                        <span className="inline-block text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono">
                          Scope: Billed to {ann.targetAudience}
                        </span>
                        
                        <h4 className="text-xs font-bold text-slate-950 mt-1.5">{ann.title}</h4>
                      </div>

                      <button
                        onClick={() => handleTogglePinAnnouncement(ann.id)}
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                          ann.pinned ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700' : 'bg-transparent border-slate-200 hover:bg-slate-50 text-slate-500'
                        }`}
                      >
                        {ann.pinned ? 'Unpin' : 'Pin'}
                      </button>
                    </div>

                    <p className="text-[11.5px] text-slate-600 leading-normal whitespace-pre-wrap">
                      {ann.content}
                    </p>

                    <div className="border-t border-slate-100 pt-2 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                      <span>Publisher: {ann.createdBy}</span>
                      <span>Published: {new Date(ann.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}

                {announcements.length === 0 && (
                  <div className="p-12 text-center text-slate-400 italic">No board publications found.</div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">
                Emergency & Notifications Presets
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {templates.map(tpl => (
                  <div key={tpl.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 hover:shadow-sm transition-all flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] bg-slate-200 text-slate-700 font-extrabold px-1.5 rounded uppercase font-mono">
                          {tpl.category}
                        </span>
                        <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 rounded font-mono">
                          {tpl.channel}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 mt-2">{tpl.name}</h4>
                      <p className="text-[11px] text-slate-650 bg-white border border-slate-200 p-2.5 rounded mt-2 select-all font-mono leading-relaxed">
                        {tpl.bodyTemplate}
                      </p>
                    </div>

                    <button
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full text-center py-1.5 bg-white border border-slate-250 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply Template to Composer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SMS OUTBOX LOGS */}
          {activeTab === 'sms' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Telecom Outbound SMS Clearing Ledger</span>
                <span className="text-[10px] font-mono text-slate-400">Total Cleared: {smsLogs.length}</span>
              </h3>

              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="p-3">Phone Line</th>
                      <th className="p-3">Recipient Group</th>
                      <th className="p-3">Message Body</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Time Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
                    {smsLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900">{log.recipientPhone}</td>
                        <td className="p-3 text-slate-600 font-sans font-bold">{log.recipientName}</td>
                        <td className="p-3 text-slate-800 leading-snug font-sans truncate max-w-[280px]" title={log.messageText}>
                          {log.messageText}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.2 text-[9px] font-black tracking-wider uppercase border rounded-md ${
                            log.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[10px]">{new Date(log.sentAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: EMAIL OUTBOX LOGS */}
          {activeTab === 'email' && (
            <div className="p-6 space-y-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2 flex items-center justify-between">
                <span>Outbound Document Email Clearing Ledger</span>
                <span className="text-[10px] font-mono text-slate-400">Total Cleared: {emailLogs.length}</span>
              </h3>

              <div className="border border-slate-200 rounded overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 font-bold border-b border-slate-200">
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Subject Title</th>
                      <th className="p-3">Body segment</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3">Time Dispatched</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-mono text-[11px]">
                    {emailLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{log.recipientEmail}</td>
                        <td className="p-3 text-slate-700 font-semibold font-sans">{log.subject}</td>
                        <td className="p-3 text-slate-500 font-sans truncate max-w-[220px]" title={log.body}>
                          {log.body}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`inline-block px-2 py-0.2 text-[9px] font-black tracking-wider uppercase border rounded-md bg-emerald-50 text-emerald-700 border-emerald-250`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 text-[10px]">{new Date(log.sentAt).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
