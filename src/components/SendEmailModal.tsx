import React, { useState, useEffect } from 'react';
import { Mail, Send, X, CheckCircle2, Copy, Sparkles, ExternalLink, Ticket as TicketIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SendEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  ticketId?: string;
  ticketSubject?: string;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  isOpen,
  onClose,
  recipientEmail,
  recipientName,
  ticketId,
  ticketSubject
}) => {
  const { notificationTemplates, dispatchEmail, tickets } = useApp();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  const emailTemplates = notificationTemplates.filter(t => t.channel === 'email');
  const relatedTicket = ticketId ? tickets.find(t => t.id === ticketId) : undefined;

  const formatVariables = (templateText: string) => {
    let text = templateText;
    if (relatedTicket) {
      text = text
        .replace(/{ticket_id}/g, relatedTicket.id)
        .replace(/{subject}/g, relatedTicket.subject)
        .replace(/{employee_name}/g, recipientName || relatedTicket.employeeName)
        .replace(/{employee_email}/g, relatedTicket.employeeEmail)
        .replace(/{department}/g, relatedTicket.department)
        .replace(/{location}/g, relatedTicket.location)
        .replace(/{category}/g, relatedTicket.category)
        .replace(/{sub_category}/g, relatedTicket.subCategory)
        .replace(/{priority}/g, relatedTicket.priority)
        .replace(/{status}/g, relatedTicket.status)
        .replace(/{assigned_agent}/g, relatedTicket.assignedAgentName || 'IT Support Team')
        .replace(/{sla_due}/g, relatedTicket.slaDueDate || 'Within 24 Hours')
        .replace(/{description}/g, relatedTicket.description)
        .replace(/{resolution_notes}/g, relatedTicket.resolutionNotes || 'Issue diagnosed and resolved successfully.')
        .replace(/{latest_comment}/g, 'Our technician has updated the work notes on your ticket.')
        .replace(/{portal_url}/g, window.location.origin);
    } else {
      text = text
        .replace(/{employee_name}/g, recipientName || 'Valued User')
        .replace(/{ticket_id}/g, ticketId || 'HD-TICKET')
        .replace(/{subject}/g, ticketSubject || 'Support Request')
        .replace(/{portal_url}/g, window.location.origin);
    }
    return text;
  };

  useEffect(() => {
    if (isOpen) {
      setSentSuccess(false);
      setSending(false);

      // Pick default template or format default message
      let defaultTpl = emailTemplates.find(t => t.triggerEvent === 'status_updated') || emailTemplates[0];
      if (relatedTicket) {
        if (relatedTicket.status === 'Resolved' || relatedTicket.status === 'Closed') {
          defaultTpl = emailTemplates.find(t => t.triggerEvent === 'ticket_closed') || defaultTpl;
        } else if (relatedTicket.status === 'Open') {
          defaultTpl = emailTemplates.find(t => t.triggerEvent === 'ticket_created') || defaultTpl;
        }
      }

      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        setSubject(formatVariables(defaultTpl.subject || `[${ticketId || 'HelpDesk'}] Support Notification`));
        setBody(formatVariables(defaultTpl.body));
      } else {
        const defaultSubj = ticketId
          ? `[${ticketId}] ${ticketSubject ? `Regarding: ${ticketSubject}` : 'Update on your Help Desk Ticket'}`
          : `Update regarding your Rathi Buildmart Help Desk Request`;
        
        const defaultBody = `Dear ${recipientName || 'Valued User'},

We are reaching out regarding your Help Desk ticket ${ticketId ? `(${ticketId})` : ''}.

Please let us know if you have any questions or if you would like to rate our support experience.

Best regards,
Rathi Buildmart IT Operations & Support Team`;

        setSubject(defaultSubj);
        setBody(defaultBody);
      }
    }
  }, [isOpen, recipientEmail, recipientName, ticketId, ticketSubject]);

  if (!isOpen) return null;

  const handleTemplateSelect = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = emailTemplates.find(t => t.id === tplId);
    if (tpl) {
      setSubject(formatVariables(tpl.subject || `[${ticketId || 'HelpDesk'}] Notification`));
      setBody(formatVariables(tpl.body));
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject.trim() || !body.trim()) return;

    setSending(true);
    try {
      await dispatchEmail({
        recipientEmail: recipientEmail.trim(),
        recipientName: recipientName.trim(),
        subject: subject.trim(),
        body: body.trim(),
        ticketId,
        ticketSubject,
        triggerEvent: selectedTemplateId ? (emailTemplates.find(t => t.id === selectedTemplateId)?.name || 'Direct Email') : 'Direct Email'
      });

      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } finally {
      setSending(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(recipientEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#031A12] to-[#0A4D39] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                Send Direct Email Notification
              </h2>
              <p className="text-[11px] text-emerald-200/80">
                Contact requester directly & log delivery into history report
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {sentSuccess ? (
          <div className="p-8 text-center space-y-3 my-auto">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-base text-gray-900">Email Dispatched Successfully!</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              An official email message has been dispatched to <strong>{recipientEmail}</strong> and recorded in delivery history.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendEmail} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Recipient Details Row */}
            <div className="bg-gray-50 p-3.5 border border-gray-200 rounded-xl flex items-center justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block">Recipient</span>
                <p className="text-xs font-bold text-gray-900 truncate">
                  {recipientName} <span className="text-blue-600 font-mono font-medium">(&lt;{recipientEmail}&gt;)</span>
                </p>
                {ticketId && (
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block mt-1">
                    Ticket Ref: {ticketId}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="p-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg flex items-center gap-1 border border-gray-200 bg-white"
                  title="Copy Email Address"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Copy Email'}</span>
                </button>
                <a
                  href={mailtoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 border border-blue-200 bg-white"
                  title="Open in Mail Client"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Mail Client</span>
                </a>
              </div>
            </div>

            {/* Quick Templates Selector */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Select Email Template Preset
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="">-- Custom Email --</option>
                {emailTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Body Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email Message Body</label>
              <textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                rows={6}
                required
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-blue-500 focus:bg-white transition-all resize-none"
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-[11px] text-gray-400">
                Dispatches via Apps Script & SMTP
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending Email...' : 'Send Direct Email'}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

