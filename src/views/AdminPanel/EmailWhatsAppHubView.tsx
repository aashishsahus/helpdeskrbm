import React, { useState, useMemo } from 'react';
import {
  Mail,
  MessageSquare,
  Send,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Sparkles,
  AlertCircle,
  Phone,
  FileText,
  User,
  Shield,
  Eye,
  Check,
  Zap,
  HelpCircle,
  Sliders,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationTemplate, NotificationLogItem, Ticket } from '../../types';
import { SendWhatsAppModal } from '../../components/SendWhatsAppModal';
import { SendEmailModal } from '../../components/SendEmailModal';

export const EmailWhatsAppHubView: React.FC = () => {
  const {
    notificationTemplates,
    addNotificationTemplate,
    editNotificationTemplate,
    deleteNotificationTemplate,
    resetNotificationTemplates,
    notificationLogs,
    clearNotificationLogs,
    dispatchEmail,
    dispatchWhatsApp,
    tickets,
    users,
    currentUser,
    setSelectedTicketId,
    settings,
    updateSettings,
    setActiveView
  } = useApp();

  // Active Main Tab: 'history' | 'templates' | 'quick-send' | 'settings'
  const [activeTab, setActiveTab] = useState<'history' | 'templates' | 'quick-send' | 'settings'>('history');

  // History Tab Filters
  const [historySearch, setHistorySearch] = useState('');
  const [historyChannel, setHistoryChannel] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [historyStatus, setHistoryStatus] = useState<string>('all');
  const [historyEvent, setHistoryEvent] = useState<string>('all');

  // Templates Tab Filters
  const [templateFilterChannel, setTemplateFilterChannel] = useState<'all' | 'email' | 'whatsapp'>('all');
  const [templateSearch, setTemplateSearch] = useState('');

  // Modal State for Viewing Log Details
  const [selectedLog, setSelectedLog] = useState<NotificationLogItem | null>(null);

  // Modal State for Template Creation / Editing
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    channel: 'whatsapp' as 'email' | 'whatsapp',
    triggerEvent: 'status_updated' as NotificationTemplate['triggerEvent'],
    subject: '',
    body: '',
    enabled: true
  });

  // Quick Send State
  const [quickChannel, setQuickChannel] = useState<'whatsapp' | 'email'>('whatsapp');
  const [quickRecipientContact, setQuickRecipientContact] = useState('');
  const [quickRecipientName, setQuickRecipientName] = useState('');
  const [quickSelectedTicketId, setQuickSelectedTicketId] = useState('');
  const [quickSelectedTemplateId, setQuickSelectedTemplateId] = useState('');
  const [quickSubject, setQuickSubject] = useState('');
  const [quickBody, setQuickBody] = useState('');
  const [quickSending, setQuickSending] = useState(false);
  const [quickSuccessMsg, setQuickSuccessMsg] = useState('');
  const [quickErrorMsg, setQuickErrorMsg] = useState<{ message: string; webGmailUrl?: string; mailtoUrl?: string } | null>(null);

  // SMTP Settings & Test State
  const [testEmailRecipient, setTestEmailRecipient] = useState(settings.supportEmail || 'misrpr@rathibuildmart.com');
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [smtpTestResult, setSmtpTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Copied alert state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Stats Calculations
  const stats = useMemo(() => {
    const total = notificationLogs.length;
    const emails = notificationLogs.filter(l => l.channel === 'email').length;
    const whatsapp = notificationLogs.filter(l => l.channel === 'whatsapp').length;
    const successful = notificationLogs.filter(l => l.status === 'Delivered' || l.status === 'Sent').length;
    const rate = total > 0 ? Math.round((successful / total) * 100) : 100;
    return { total, emails, whatsapp, successful, rate };
  }, [notificationLogs]);

  // Filtered History Logs
  const filteredLogs = useMemo(() => {
    return notificationLogs.filter(log => {
      if (historyChannel !== 'all' && log.channel !== historyChannel) return false;
      if (historyStatus !== 'all' && log.status !== historyStatus) return false;
      if (historyEvent !== 'all' && log.triggerEvent !== historyEvent) return false;
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const matchesContact = log.recipientContact.toLowerCase().includes(q);
        const matchesName = log.recipientName.toLowerCase().includes(q);
        const matchesSubject = (log.subject || '').toLowerCase().includes(q);
        const matchesTicket = (log.ticketId || '').toLowerCase().includes(q);
        const matchesMsg = log.messagePreview.toLowerCase().includes(q);
        if (!matchesContact && !matchesName && !matchesSubject && !matchesTicket && !matchesMsg) {
          return false;
        }
      }
      return true;
    });
  }, [notificationLogs, historyChannel, historyStatus, historyEvent, historySearch]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return notificationTemplates.filter(t => {
      if (templateFilterChannel !== 'all' && t.channel !== templateFilterChannel) return false;
      if (templateSearch.trim()) {
        const q = templateSearch.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesSubj = (t.subject || '').toLowerCase().includes(q);
        const matchesBody = t.body.toLowerCase().includes(q);
        if (!matchesName && !matchesSubj && !matchesBody) return false;
      }
      return true;
    });
  }, [notificationTemplates, templateFilterChannel, templateSearch]);

  // Handle Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) return;

    const headers = ['Timestamp', 'Channel', 'Recipient Name', 'Recipient Contact', 'Ticket ID', 'Ticket Subject', 'Event Trigger', 'Subject', 'Message Snippet', 'Status', 'Sent By'];
    const rows = filteredLogs.map(log => [
      `"${log.timestamp}"`,
      `"${log.channel.toUpperCase()}"`,
      `"${(log.recipientName || '').replace(/"/g, '""')}"`,
      `"${(log.recipientContact || '').replace(/"/g, '""')}"`,
      `"${(log.ticketId || 'N/A').replace(/"/g, '""')}"`,
      `"${(log.ticketSubject || '').replace(/"/g, '""')}"`,
      `"${(log.triggerEvent || '').replace(/"/g, '""')}"`,
      `"${(log.subject || '').replace(/"/g, '""')}"`,
      `"${(log.messagePreview || '').replace(/"/g, '""')}"`,
      `"${log.status}"`,
      `"${(log.sentBy || 'System').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `helpdesk_notification_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Template Modal for Create
  const handleOpenCreateTemplate = (channel: 'email' | 'whatsapp' = 'whatsapp') => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      channel,
      triggerEvent: 'status_updated',
      subject: channel === 'email' ? '[{ticket_id}] Ticket Status Update: {subject}' : '',
      body: channel === 'whatsapp'
        ? `*🏢 RATHI BUILDMART HELPDESK*\n\nNamaste {employee_name},\n\nYour Ticket *{ticket_id}* ({subject}) status has been updated to *{status}*.\nAssigned: {assigned_agent}\n\nTrack updates on the portal: {portal_url}`
        : `Dear {employee_name},\n\nYour support ticket {ticket_id} ({subject}) is currently {status}.\n\nPriority: {priority}\nAssigned Specialist: {assigned_agent}\nTarget SLA Due: {sla_due}\n\nBest regards,\nHelpDesk Support Operations`,
      enabled: true
    });
    setIsTemplateModalOpen(true);
  };

  // Open Template Modal for Edit
  const handleOpenEditTemplate = (tpl: NotificationTemplate) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      channel: tpl.channel,
      triggerEvent: tpl.triggerEvent,
      subject: tpl.subject || '',
      body: tpl.body,
      enabled: tpl.enabled
    });
    setIsTemplateModalOpen(true);
  };

  // Save Template
  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name.trim() || !templateForm.body.trim()) return;

    if (editingTemplate) {
      editNotificationTemplate(editingTemplate.id, {
        name: templateForm.name.trim(),
        channel: templateForm.channel,
        triggerEvent: templateForm.triggerEvent,
        subject: templateForm.channel === 'email' ? templateForm.subject.trim() : undefined,
        body: templateForm.body.trim(),
        enabled: templateForm.enabled
      });
    } else {
      addNotificationTemplate({
        name: templateForm.name.trim(),
        channel: templateForm.channel,
        triggerEvent: templateForm.triggerEvent,
        subject: templateForm.channel === 'email' ? templateForm.subject.trim() : undefined,
        body: templateForm.body.trim(),
        enabled: templateForm.enabled
      });
    }
    setIsTemplateModalOpen(false);
  };

  // Insert Variable Chip into Template Body
  const handleInsertVariable = (varKey: string) => {
    setTemplateForm(prev => ({
      ...prev,
      body: prev.body + ` ${varKey} `
    }));
  };

  // Quick Send Form Logic
  const handleQuickSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickRecipientContact.trim() || !quickBody.trim()) return;

    const tkt = tickets.find(t => t.id === quickSelectedTicketId);

    setQuickSending(true);
    setQuickErrorMsg(null);
    setQuickSuccessMsg('');

    if (quickChannel === 'whatsapp') {
      dispatchWhatsApp({
        recipientPhone: quickRecipientContact.trim(),
        recipientName: quickRecipientName.trim() || 'Employee',
        message: quickBody.trim(),
        ticketId: tkt?.id,
        ticketSubject: tkt?.subject,
        triggerEvent: 'Direct Hub WhatsApp'
      });
      setQuickSuccessMsg('WhatsApp window launched! Dispatched & recorded into history report.');
    } else {
      const res = await dispatchEmail({
        recipientEmail: quickRecipientContact.trim(),
        recipientName: quickRecipientName.trim() || 'Employee',
        subject: quickSubject.trim() || `[${tkt?.id || 'HelpDesk'}] Notification`,
        body: quickBody.trim(),
        ticketId: tkt?.id,
        ticketSubject: tkt?.subject,
        triggerEvent: 'Direct Hub Email'
      });

      if (res.success) {
        setQuickSuccessMsg(`Email dispatched successfully via ${res.deliveredVia || 'Cloud'}! Recorded into history report.`);
      } else {
        setQuickErrorMsg({
          message: res.message || 'Automated cloud email could not be delivered directly. Use 1-Click Web Gmail below.',
          webGmailUrl: res.webGmailUrl,
          mailtoUrl: res.mailtoUrl
        });
      }
    }
    setQuickSending(false);
  };

  const handleTestEmailDispatch = async () => {
    if (!testEmailRecipient.trim()) return;
    setTestingSmtp(true);
    setSmtpTestResult(null);

    try {
      const res = await dispatchEmail({
        recipientEmail: testEmailRecipient.trim(),
        recipientName: 'HelpDesk Admin',
        subject: `[Test Ping] Rathi Buildmart HelpDesk Notification Test (${new Date().toLocaleTimeString()})`,
        body: `Hello,\n\nThis is a test notification dispatched from Rathi Buildmart HelpDesk system to verify active email gateway configurations.\n\nTimestamp: ${new Date().toISOString()}\nSystem Name: ${settings.systemName || 'Rathi Buildmart HelpDesk'}`,
        triggerEvent: 'Gateway Diagnostic Test'
      });

      if (res.success) {
        setSmtpTestResult({
          success: true,
          message: `Success! Test email delivered via ${res.deliveredVia || 'Cloud Gateway'} to ${testEmailRecipient}`
        });
      } else {
        setSmtpTestResult({
          success: false,
          message: res.message || 'Email delivery failed. Please check Google Apps Script deployment or SMTP credentials.'
        });
      }
    } catch (err: any) {
      setSmtpTestResult({
        success: false,
        message: `Error testing email: ${err.message}`
      });
    } finally {
      setTestingSmtp(false);
    }
  };

  const handleQuickTemplateChange = (tplId: string) => {
    setQuickSelectedTemplateId(tplId);
    const tpl = notificationTemplates.find(t => t.id === tplId);
    const tkt = tickets.find(t => t.id === quickSelectedTicketId);

    if (tpl) {
      let subj = tpl.subject || '';
      let body = tpl.body;
      const rName = quickRecipientName || tkt?.employeeName || 'Valued User';

      if (tkt) {
        subj = subj
          .replace(/{ticket_id}/g, tkt.id)
          .replace(/{subject}/g, tkt.subject)
          .replace(/{employee_name}/g, rName)
          .replace(/{status}/g, tkt.status);

        body = body
          .replace(/{ticket_id}/g, tkt.id)
          .replace(/{subject}/g, tkt.subject)
          .replace(/{employee_name}/g, rName)
          .replace(/{employee_email}/g, tkt.employeeEmail)
          .replace(/{employee_phone}/g, tkt.contactNumber || '')
          .replace(/{department}/g, tkt.department)
          .replace(/{location}/g, tkt.location)
          .replace(/{category}/g, tkt.category)
          .replace(/{sub_category}/g, tkt.subCategory)
          .replace(/{priority}/g, tkt.priority)
          .replace(/{status}/g, tkt.status)
          .replace(/{assigned_agent}/g, tkt.assignedAgentName || 'IT Support Team')
          .replace(/{sla_due}/g, tkt.slaDueDate || 'Within 24 Hours')
          .replace(/{description}/g, tkt.description)
          .replace(/{resolution_notes}/g, tkt.resolutionNotes || 'Issue diagnosed and resolved.')
          .replace(/{portal_url}/g, window.location.origin);
      } else {
        body = body
          .replace(/{employee_name}/g, rName)
          .replace(/{ticket_id}/g, 'HD-TICKET')
          .replace(/{subject}/g, 'Support Inquiry')
          .replace(/{portal_url}/g, window.location.origin);
      }

      setQuickSubject(subj);
      setQuickBody(body);
    }
  };

  const handleQuickTicketSelect = (tktId: string) => {
    setQuickSelectedTicketId(tktId);
    const tkt = tickets.find(t => t.id === tktId);
    if (tkt) {
      setQuickRecipientName(tkt.employeeName);
      if (quickChannel === 'whatsapp') {
        setQuickRecipientContact(tkt.contactNumber || '');
      } else {
        setQuickRecipientContact(tkt.employeeEmail);
      }
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#F3F4F6] min-w-0 max-w-full space-y-6 pb-20 custom-scrollbar">
      {/* Top Hero Banner / Guidance */}
      <div className="bg-gradient-to-r from-[#031A12] via-[#0A4D39] to-[#043324] rounded-2xl p-5 md:p-6 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-emerald-500/20 rounded-full text-emerald-300 text-[11px] font-semibold border border-emerald-400/30">
              <Zap className="w-3.5 h-3.5" />
              <span>Multi-Channel Communication & Automated Dispatch System</span>
            </div>
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white">
              Email & WhatsApp Notification Hub
            </h1>
            <p className="text-emerald-100/80 text-xs md:text-sm max-w-2xl leading-relaxed">
              Dispatch notifications to employees and support agents, manage customizable message templates with live variable placeholders, and view audit delivery logs.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenCreateTemplate('whatsapp')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add WhatsApp Template</span>
            </button>
            <button
              onClick={() => handleOpenCreateTemplate('email')}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Email Template</span>
            </button>
          </div>
        </div>

        {/* How It Works 3-Step Guide */}
        <div className="mt-4 pt-4 border-t border-emerald-800/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/30 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-400/30 text-[11px]">
              1
            </div>
            <div>
              <p className="font-bold text-white text-xs mb-0.5">Automated & 1-Click Dispatch</p>
              <p className="text-emerald-200/70 text-[11px] leading-tight">Send via WhatsApp Web or Google Apps Script directly from tickets.</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/30 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-400/30 text-[11px]">
              2
            </div>
            <div>
              <p className="font-bold text-white text-xs mb-0.5">Template Studio</p>
              <p className="text-emerald-200/70 text-[11px] leading-tight">Insert variables like <code className="bg-emerald-900/80 px-1 py-0.2 rounded text-[10px] font-mono">{'{ticket_id}'}</code>, <code className="bg-emerald-900/80 px-1 py-0.2 rounded text-[10px] font-mono">{'{status}'}</code>.</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-700/30 flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center shrink-0 border border-emerald-400/30 text-[11px]">
              3
            </div>
            <div>
              <p className="font-bold text-white text-xs mb-0.5">Delivery History & Export</p>
              <p className="text-emerald-200/70 text-[11px] leading-tight">Audit timestamps, channels, recipients, and download full CSV reports.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 md:p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Send className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Total Dispatched</span>
            <p className="text-xl md:text-2xl font-black text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 md:p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Mail className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Emails Dispatched</span>
            <p className="text-xl md:text-2xl font-black text-sky-700">{stats.emails}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 md:p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">WhatsApp Dispatched</span>
            <p className="text-xl md:text-2xl font-black text-emerald-700">{stats.whatsapp}</p>
          </div>
        </div>

        <div className="bg-white p-3.5 md:p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2.5 md:p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div>
            <span className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Success Rate</span>
            <p className="text-xl md:text-2xl font-black text-green-700">{stats.rate}%</p>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-gray-200 bg-white rounded-2xl px-3 md:px-4 shadow-xs overflow-x-auto custom-scrollbar">
        <button
          onClick={() => setActiveTab('history')}
          className={`py-3 px-3 md:px-4 font-bold text-xs md:text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'history'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Delivery History & Reports ({notificationLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('templates')}
          className={`py-3 px-3 md:px-4 font-bold text-xs md:text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'templates'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Template Studio ({notificationTemplates.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quick-send')}
          className={`py-3 px-3 md:px-4 font-bold text-xs md:text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'quick-send'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Quick Dispatcher / Test Message</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-3 px-3 md:px-4 font-bold text-xs md:text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Gateways & Automation</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DELIVERY HISTORY & REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search recipient, contact, ticket ID, subject..."
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
              </div>

              {/* Channel Filter */}
              <select
                value={historyChannel}
                onChange={e => setHistoryChannel(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">All Channels</option>
                <option value="email">✉️ Email Only</option>
                <option value="whatsapp">💬 WhatsApp Only</option>
              </select>

              {/* Status Filter */}
              <select
                value={historyStatus}
                onChange={e => setHistoryStatus(e.target.value)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Sent">Sent</option>
                <option value="Failed">Failed</option>
              </select>
            </div>

            {/* Actions: Export & Clear */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredLogs.length === 0}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all"
                title="Download CSV Report of Dispatch History"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV Report</span>
              </button>

              {notificationLogs.length > 0 && currentUser?.role === 'Super Admin' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all notification delivery logs?')) {
                      clearNotificationLogs();
                    }
                  }}
                  className="px-3 py-1.5 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors border border-transparent hover:border-red-200"
                >
                  Clear Logs
                </button>
              )}
            </div>
          </div>

          {/* Delivery Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {filteredLogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-700">No Notification Logs Found</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Dispatched emails or WhatsApp notifications will be recorded here automatically with full delivery timestamps and content snapshots.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[780px] text-left text-xs">
                  <thead className="bg-gray-50/90 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-3 py-3">Channel</th>
                      <th className="px-4 py-3">Recipient</th>
                      <th className="px-3 py-3">Ticket ID</th>
                      <th className="px-4 py-3">Event & Message Snippet</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Dispatched By</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Timestamp */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-gray-900 font-mono font-medium text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                            <span>{log.timestamp}</span>
                          </div>
                        </td>

                        {/* Channel Badge */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {log.channel === 'whatsapp' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg font-bold text-[11px]">
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              WhatsApp
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px]">
                              <Mail className="w-3 h-3 text-blue-600" />
                              Email
                            </span>
                          )}
                        </td>

                        {/* Recipient */}
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-bold text-gray-900 leading-tight">{log.recipientName || 'User'}</p>
                            <p className="text-[10px] text-gray-500 font-mono mt-0.5">{log.recipientContact}</p>
                          </div>
                        </td>

                        {/* Ticket ID */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {log.ticketId ? (
                            <button
                              onClick={() => setSelectedTicketId(log.ticketId!)}
                              className="px-2 py-0.5 bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 border border-gray-200 hover:border-emerald-300 rounded-lg font-mono font-bold text-[11px] transition-colors"
                            >
                              {log.ticketId}
                            </button>
                          ) : (
                            <span className="text-gray-400 font-mono text-[10px]">--</span>
                          )}
                        </td>

                        {/* Event / Subject */}
                        <td className="px-4 py-3 max-w-xs">
                          <div>
                            <span className="inline-block px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded text-[9px] font-bold uppercase mb-0.5">
                              {log.triggerEvent || 'Direct Message'}
                            </span>
                            <p className="font-semibold text-gray-800 line-clamp-1 text-[11.5px] leading-snug">
                              {log.subject || log.messagePreview}
                            </p>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {log.status === 'Delivered' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded font-bold text-[10.5px]">
                              <Check className="w-3 h-3 text-green-600" /> Delivered
                            </span>
                          ) : log.status === 'Sent' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold text-[10.5px]">
                              <Check className="w-3 h-3 text-blue-600" /> Sent
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded font-bold text-[10.5px]">
                              <AlertCircle className="w-3 h-3 text-red-600" /> Failed
                            </span>
                          )}
                        </td>

                        {/* Sent By */}
                        <td className="px-3 py-3 whitespace-nowrap text-gray-500 text-[11px]">
                          {log.sentBy || 'System'}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1 justify-end">
                            <button
                              onClick={() => setSelectedLog(log)}
                              className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Full Dispatched Message"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => copyToClipboard(log.fullMessage || log.messagePreview, log.id)}
                              className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copy Message Content"
                            >
                              {copiedId === log.id ? (
                                <Check className="w-3.5 h-3.5 text-green-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEMPLATE STUDIO */}
      {/* ========================================================================= */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search templates by name, keyword or body..."
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <select
                value={templateFilterChannel}
                onChange={e => setTemplateFilterChannel(e.target.value as any)}
                className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
              >
                <option value="all">All Channels</option>
                <option value="whatsapp">💬 WhatsApp Templates</option>
                <option value="email">✉️ Email Templates</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (window.confirm('Reset all notification templates back to standard default presets?')) {
                    resetNotificationTemplates();
                  }
                }}
                className="px-3 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 border border-gray-200"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={() => handleOpenCreateTemplate('whatsapp')}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Template</span>
              </button>
            </div>
          </div>

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map(tpl => (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar of Card */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {tpl.channel === 'whatsapp' ? (
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
                          <Mail className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">{tpl.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">Trigger: {tpl.triggerEvent}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditTemplate(tpl)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Template"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete template "${tpl.name}"?`)) {
                            deleteNotificationTemplate(tpl.id);
                          }
                        }}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Template"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Subject if email */}
                  {tpl.channel === 'email' && tpl.subject && (
                    <div className="text-xs bg-gray-50 p-2 rounded-lg border border-gray-200 font-medium text-gray-700">
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Subject Line</span>
                      {tpl.subject}
                    </div>
                  )}

                  {/* Body Preview */}
                  <div className="bg-gray-50/80 p-3 rounded-xl border border-gray-200 text-xs font-mono text-gray-700 whitespace-pre-wrap max-h-36 overflow-y-auto leading-relaxed">
                    {tpl.body}
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 font-mono">Updated: {tpl.updatedAt || 'Default'}</span>
                  <button
                    onClick={() => {
                      setActiveTab('quick-send');
                      setQuickChannel(tpl.channel);
                      setQuickSelectedTemplateId(tpl.id);
                      setQuickSubject(tpl.subject || '');
                      setQuickBody(tpl.body);
                    }}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
                  >
                    <span>Test Send & Dispatch</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUICK DISPATCHER / TEST SENDER */}
      {/* ========================================================================= */}
      {activeTab === 'quick-send' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dispatch Form (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-gray-900">Direct Notification Dispatcher</h3>
                <p className="text-xs text-gray-500">Test send or broadcast messages with live ticket parameters</p>
              </div>
              <div className="flex bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setQuickChannel('whatsapp');
                    const tpl = notificationTemplates.find(t => t.channel === 'whatsapp');
                    if (tpl) handleQuickTemplateChange(tpl.id);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    quickChannel === 'whatsapp' ? 'bg-emerald-600 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={() => {
                    setQuickChannel('email');
                    const tpl = notificationTemplates.find(t => t.channel === 'email');
                    if (tpl) handleQuickTemplateChange(tpl.id);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    quickChannel === 'email' ? 'bg-blue-600 text-white shadow-xs' : 'text-gray-600'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email</span>
                </button>
              </div>
            </div>

            {quickSuccessMsg && (
              <div className="p-3 bg-green-50 text-green-800 border border-green-200 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                <span>{quickSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleQuickSend} className="space-y-4">
              {/* Load from Ticket or Template */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Auto-Fill from Existing Ticket (Optional)
                  </label>
                  <select
                    value={quickSelectedTicketId}
                    onChange={e => handleQuickTicketSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="">-- No Ticket Selected (Custom) --</option>
                    {tickets.slice(0, 30).map((t, idx) => (
                      <option key={`${t.id}-${idx}`} value={t.id}>
                        {t.id} - {t.employeeName} ({t.subject.slice(0, 35)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Apply Preset Template
                  </label>
                  <select
                    value={quickSelectedTemplateId}
                    onChange={e => handleQuickTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  >
                    <option value="">-- Choose Template --</option>
                    {notificationTemplates
                      .filter(t => t.channel === quickChannel)
                      .map((t, idx) => (
                        <option key={`${t.id}-${idx}`} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={quickRecipientName}
                    onChange={e => setQuickRecipientName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {quickChannel === 'whatsapp' ? 'WhatsApp Phone Number *' : 'Recipient Email Address *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={quickRecipientContact}
                    onChange={e => setQuickRecipientContact(e.target.value)}
                    placeholder={quickChannel === 'whatsapp' ? '+91 98765 43210' : 'employee@rathibuildmart.com'}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-medium"
                  />
                </div>
              </div>

              {/* Email Subject if Email */}
              {quickChannel === 'email' && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Email Subject Line</label>
                  <input
                    type="text"
                    value={quickSubject}
                    onChange={e => setQuickSubject(e.target.value)}
                    placeholder="[HD-0001] Regarding your request"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium"
                  />
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Message Body</label>
                <textarea
                  rows={6}
                  required
                  value={quickBody}
                  onChange={e => setQuickBody(e.target.value)}
                  placeholder="Type message content here..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono resize-none outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Submit / Action Buttons */}
              {quickSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{quickSuccessMsg}</span>
                </div>
              )}

              {quickErrorMsg && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-2">
                  <div className="flex items-start gap-2 font-bold text-amber-950">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{quickErrorMsg.message}</span>
                  </div>
                  {quickErrorMsg.webGmailUrl && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <a
                        href={quickErrorMsg.webGmailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Send Now via Web Gmail</span>
                      </a>
                      {quickErrorMsg.mailtoUrl && (
                        <a
                          href={quickErrorMsg.mailtoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-xs"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open in Mail App</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
                {quickChannel === 'email' ? (
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(quickRecipientContact)}&su=${encodeURIComponent(quickSubject)}&body=${encodeURIComponent(quickBody)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 text-xs text-red-700 hover:text-white hover:bg-red-600 bg-red-50 rounded-xl flex items-center gap-1 font-bold border border-red-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Send with Web Gmail (1-Click)</span>
                    </a>
                  </div>
                ) : <div />}

                <button
                  type="submit"
                  disabled={quickSending || !quickRecipientContact.trim() || !quickBody.trim()}
                  className={`px-6 py-2.5 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                    quickChannel === 'whatsapp'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {quickSending
                      ? 'Dispatching...'
                      : quickChannel === 'whatsapp'
                      ? 'Launch WhatsApp Dispatch'
                      : 'Send via Cloud / SMTP'}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Mobile / Email Preview Card (1 col) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400">Live Delivery Preview</h4>

            {quickChannel === 'whatsapp' ? (
              <div className="bg-[#e5ddd5] p-3.5 rounded-2xl border border-[#d1c7bc] space-y-2">
                <div className="bg-emerald-800 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  <span>WhatsApp Business Notification</span>
                </div>
                <div className="bg-[#d9fdd3] text-gray-800 p-3.5 rounded-2xl rounded-tr-none shadow-xs text-xs font-sans whitespace-pre-wrap leading-relaxed border border-[#c4e6be]">
                  {quickBody || 'Type a message to see the live WhatsApp preview here...'}
                  <div className="text-[10px] text-gray-500 text-right mt-1.5 font-sans">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2">
                <div className="bg-white p-3 rounded-xl border border-gray-200 text-xs space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Subject</p>
                  <p className="font-bold text-gray-900">{quickSubject || 'No Subject Line'}</p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed min-h-[140px]">
                  {quickBody || 'Type a message body to see the live email layout here...'}
                </div>
              </div>
            )}

            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] border border-emerald-200">
              💡 <strong>Instant Log:</strong> All sent items are logged into the <strong>Delivery History</strong> tab with timestamps and status.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: GATEWAYS & AUTOMATION SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Method A: Google Apps Script Web App Dispatcher */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Google Apps Script Web App Dispatcher</h3>
                  <p className="text-xs text-gray-500">Method 1: Google Workspace / Gmail Apps Script</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-gray-700">Central Google Apps Script Endpoint</label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                      System Settings Managed
                    </span>
                  </div>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <code className="font-mono text-xs text-gray-800 break-all select-all flex-1">
                        {settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'No Web App URL configured. Please set in System Settings.'}
                      </code>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex items-center justify-between gap-2">
                      <span className="text-[11px] text-gray-500">
                        {settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl ? '✅ Live Endpoint Active' : '⚠️ Missing Endpoint URL'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveView('settings')}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <span>Manage in System Settings ↗</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-blue-50/80 text-blue-900 rounded-xl text-[11px] border border-blue-200 leading-relaxed space-y-1.5">
                  <p className="font-bold">📋 Deployment Checklist for Google Apps Script:</p>
                  <ol className="list-decimal list-inside space-y-1 text-blue-800">
                    <li>Open your Google Sheet &gt; <strong>Extensions &gt; Apps Script</strong>.</li>
                    <li>Ensure the backend script code from <strong>Apps Script</strong> view is pasted.</li>
                    <li>Click <strong>Deploy &gt; New deployment</strong> &gt; Select <strong>Web app</strong>.</li>
                    <li>Set <strong>Execute as:</strong> <code>Me ({settings.supportEmail || 'misrpr@rathibuildmart.com'})</code></li>
                    <li>Set <strong>Who has access:</strong> <code>Anyone</code> <em>(Important: Anyone access is required for automated backend calls)</em>.</li>
                    <li>Copy the generated <code>/exec</code> URL and paste it in <strong>System Settings</strong>.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Method B: Direct SMTP Email Configuration (Nodemailer) */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Direct SMTP Server Configuration</h3>
                  <p className="text-xs text-gray-500">Method 2: Send directly via SMTP (Gmail App Password, SendGrid, etc.)</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500">Quick Configuration:</span>
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({
                        smtpHost: 'smtp.gmail.com',
                        smtpPort: 587,
                        smtpUser: settings.smtpUser || settings.supportEmail || 'misrpr@rathibuildmart.com',
                        smtpSenderName: settings.smtpSenderName || 'Rathi Buildmart HelpDesk'
                      });
                    }}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold rounded-lg border border-indigo-200 cursor-pointer"
                  >
                    ⚡ Auto-Fill Gmail Defaults (smtp.gmail.com : 587)
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-gray-700 mb-1">
                      SMTP Host <span className="text-[11px] font-normal text-indigo-600">(Must be smtp.gmail.com)</span>
                    </label>
                    <input
                      type="text"
                      value={settings.smtpHost || ''}
                      onChange={e => {
                        let val = e.target.value;
                        if (val.trim() === 'smpt.gmail.com') val = 'smtp.gmail.com';
                        updateSettings({ smtpHost: val });
                      }}
                      onBlur={e => {
                        if (e.target.value.trim().toLowerCase() === 'smpt.gmail.com') {
                          updateSettings({ smtpHost: 'smtp.gmail.com' });
                        }
                      }}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Port</label>
                    <input
                      type="number"
                      value={settings.smtpPort || 587}
                      onChange={e => updateSettings({ smtpPort: Number(e.target.value) })}
                      placeholder="587 or 465"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SMTP Username / Email</label>
                    <input
                      type="text"
                      value={settings.smtpUser || ''}
                      onChange={e => updateSettings({ smtpUser: e.target.value })}
                      placeholder="misrpr@rathibuildmart.com"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">SMTP App Password</label>
                    <input
                      type="password"
                      value={settings.smtpPass || ''}
                      onChange={e => updateSettings({ smtpPass: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Sender Display Name</label>
                  <input
                    type="text"
                    value={settings.smtpSenderName || ''}
                    onChange={e => updateSettings({ smtpSenderName: e.target.value })}
                    placeholder="Rathi Buildmart HelpDesk"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Auto-Saved to Local Storage & Server Disk</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSettings({
                        smtpHost: settings.smtpHost,
                        smtpPort: settings.smtpPort,
                        smtpUser: settings.smtpUser,
                        smtpPass: settings.smtpPass,
                        smtpSenderName: settings.smtpSenderName
                      });
                      setSmtpTestResult({
                        success: true,
                        message: 'SMTP settings successfully saved and locked into persistent configuration!'
                      });
                    }}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save SMTP Config</span>
                  </button>
                </div>

                <div className="p-3 bg-indigo-50/70 text-indigo-900 rounded-xl text-[11px] border border-indigo-200">
                  💡 <strong>Gmail Tip:</strong> If using Gmail SMTP, generate a 16-character <strong>App Password</strong> in your Google Account Security settings (2-Step Verification &gt; App Passwords) and paste it here.
                </div>
              </div>
            </div>
          </div>

          {/* Test Email Dispatcher Tool */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Test Email Gateway Diagnostics</h3>
                  <p className="text-xs text-gray-500">Send an instant test email to verify live delivery</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={testEmailRecipient}
                  onChange={e => setTestEmailRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono w-64"
                />
                <button
                  type="button"
                  onClick={handleTestEmailDispatch}
                  disabled={testingSmtp || !testEmailRecipient.trim()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testingSmtp ? 'Sending Test...' : 'Send Live Test Email'}</span>
                </button>
              </div>
            </div>

            {smtpTestResult && (
              <div className={`p-4 rounded-xl text-xs font-medium border ${
                smtpTestResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-start gap-2">
                  {smtpTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="font-bold">{smtpTestResult.message}</p>
                    {!smtpTestResult.success && (
                      <p className="text-[11px] text-amber-800">
                        Aap 1-Click <strong>Web Gmail</strong> ke through bina kisi configuration ke direct emails bhej sakte hain, ya Google Apps Script Web App ko "Who has access: Anyone" ke saath re-deploy karein.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* WhatsApp Gateway Config */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">WhatsApp Gateway Mode</h3>
                <p className="text-xs text-gray-500">Choose how WhatsApp messages are dispatched</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Selected WhatsApp Dispatch Gateway</label>
                <select
                  value={settings.whatsappGateway || 'whatsapp_web'}
                  onChange={e => updateSettings({ whatsappGateway: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
                >
                  <option value="whatsapp_web">Direct 1-Click WhatsApp Web / Desktop App (Zero Setup Required)</option>
                  <option value="meta_cloud_api">Meta WhatsApp Cloud API (Official Business API)</option>
                  <option value="twilio">Twilio Programmable WhatsApp SMS</option>
                  <option value="ultramsg">UltraMsg WhatsApp Gateway</option>
                  <option value="green_api">Green-API Gateway</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-[11px] border border-emerald-200 leading-relaxed">
                ✅ <strong>Zero-Setup Recommended:</strong> "Direct 1-Click WhatsApp Web" instantly pre-fills messages and opens WhatsApp for desktop or mobile without needing third-party tokens or monthly billing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE / EDIT TEMPLATE */}
      {/* ========================================================================= */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-r from-[#031A12] to-[#0A4D39] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-300">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingTemplate ? 'Edit Notification Template' : 'Create New Notification Template'}
                  </h3>
                  <p className="text-[11px] text-emerald-200">Define dynamic templates with placeholder replacement</p>
                </div>
              </div>
              <button
                onClick={() => setIsTemplateModalOpen(false)}
                className="p-1 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Name & Channel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Template Name *</label>
                  <input
                    type="text"
                    required
                    value={templateForm.name}
                    onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })}
                    placeholder="e.g. Ticket Assigned Alert"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Channel *</label>
                  <select
                    value={templateForm.channel}
                    onChange={e => setTemplateForm({ ...templateForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                  >
                    <option value="whatsapp">💬 WhatsApp Notification</option>
                    <option value="email">✉️ Email Notification</option>
                  </select>
                </div>
              </div>

              {/* Event Trigger */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Trigger Event</label>
                <select
                  value={templateForm.triggerEvent}
                  onChange={e => setTemplateForm({ ...templateForm, triggerEvent: e.target.value as any })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                >
                  <option value="ticket_created">Ticket Created (Requester / Team alert)</option>
                  <option value="ticket_assigned">Ticket Assigned (Agent notification)</option>
                  <option value="status_updated">Status Updated (In Progress / On Hold)</option>
                  <option value="ticket_closed">Ticket Resolved / Closed</option>
                  <option value="sla_warning">SLA Warning / Escalation</option>
                  <option value="feedback_request">Feedback & Star Rating Request</option>
                </select>
              </div>

              {/* Subject if Email */}
              {templateForm.channel === 'email' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Subject Line *</label>
                  <input
                    type="text"
                    required
                    value={templateForm.subject}
                    onChange={e => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    placeholder="[{ticket_id}] Ticket Status Update: {subject}"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl font-medium"
                  />
                </div>
              )}

              {/* Variable Chips Inserter */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Click to Insert Dynamic Placeholders:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '{ticket_id}',
                    '{subject}',
                    '{employee_name}',
                    '{employee_email}',
                    '{employee_phone}',
                    '{status}',
                    '{priority}',
                    '{assigned_agent}',
                    '{department}',
                    '{location}',
                    '{category}',
                    '{sla_due}',
                    '{resolution_notes}',
                    '{portal_url}'
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => handleInsertVariable(chip)}
                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-mono font-bold transition-all"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Template Body */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">Message Body *</label>
                <textarea
                  rows={7}
                  required
                  value={templateForm.body}
                  onChange={e => setTemplateForm({ ...templateForm, body: e.target.value })}
                  placeholder="Enter message template text with placeholders..."
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs leading-relaxed outline-none focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW FULL LOG MESSAGE DETAILS */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col">
            <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedLog.channel === 'whatsapp' ? (
                  <div className="p-2 bg-emerald-600/30 text-emerald-400 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                ) : (
                  <div className="p-2 bg-blue-600/30 text-blue-400 rounded-xl">
                    <Mail className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-sm text-white">Notification Dispatch Details</h3>
                  <p className="text-[10px] text-gray-400 font-mono">{selectedLog.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 hover:bg-gray-800 text-gray-400 hover:text-white rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Recipient</span>
                  <p className="font-bold text-gray-900">{selectedLog.recipientName}</p>
                  <p className="font-mono text-blue-700 text-[11px]">{selectedLog.recipientContact}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Ticket Reference</span>
                  <p className="font-mono font-bold text-gray-800">{selectedLog.ticketId || 'General Notification'}</p>
                  <span className="text-[10px] text-green-700 font-bold">Status: {selectedLog.status}</span>
                </div>
              </div>

              {selectedLog.subject && (
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-0.5">Subject</span>
                  <p className="font-bold text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200">{selectedLog.subject}</p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block">Full Dispatched Content</span>
                  <button
                    onClick={() => copyToClipboard(selectedLog.fullMessage || selectedLog.messagePreview, selectedLog.id)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 font-mono text-gray-800 whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                  {selectedLog.fullMessage || selectedLog.messagePreview}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-gray-500 text-[11px]">
                <span>Sent By: <strong>{selectedLog.sentBy || 'System'}</strong></span>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
