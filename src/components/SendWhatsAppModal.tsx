import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, X, CheckCircle2, Copy, Sparkles, ExternalLink, Phone, User, Ticket as TicketIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Ticket } from '../types';

interface SendWhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket?: Ticket;
  defaultPhone?: string;
  defaultRecipientName?: string;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  isOpen,
  onClose,
  ticket,
  defaultPhone,
  defaultRecipientName
}) => {
  const { users, notificationTemplates, dispatchWhatsApp } = useApp();

  const [phone, setPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const whatsappTemplates = notificationTemplates.filter(t => t.channel === 'whatsapp');

  // Helper to replace variables in template
  const applyVariables = (templateText: string, tkt?: Ticket, rName?: string, rPhone?: string) => {
    let text = templateText;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (tkt) {
      text = text
        .replace(/{ticket_id}/g, tkt.id)
        .replace(/{subject}/g, tkt.subject)
        .replace(/{employee_name}/g, rName || tkt.employeeName)
        .replace(/{employee_email}/g, tkt.employeeEmail)
        .replace(/{employee_phone}/g, rPhone || tkt.contactNumber || '')
        .replace(/{department}/g, tkt.department)
        .replace(/{location}/g, tkt.location)
        .replace(/{category}/g, tkt.category)
        .replace(/{sub_category}/g, tkt.subCategory)
        .replace(/{priority}/g, tkt.priority)
        .replace(/{status}/g, tkt.status)
        .replace(/{assigned_agent}/g, tkt.assignedAgentName || 'IT Support Team')
        .replace(/{sla_due}/g, tkt.slaDueDate || 'Within 24 Hours')
        .replace(/{description}/g, tkt.description)
        .replace(/{resolution_notes}/g, tkt.resolutionNotes || 'Issue diagnosed and resolved successfully.')
        .replace(/{latest_comment}/g, 'Our technician has updated the work notes on your ticket.')
        .replace(/{portal_url}/g, window.location.origin);
    } else {
      text = text
        .replace(/{employee_name}/g, rName || 'Valued Employee')
        .replace(/{ticket_id}/g, 'HD-TICKET')
        .replace(/{subject}/g, 'Support Inquiry')
        .replace(/{status}/g, 'Active')
        .replace(/{priority}/g, 'Normal')
        .replace(/{assigned_agent}/g, 'HelpDesk Team')
        .replace(/{sla_due}/g, `${formattedDate} ${formattedTime}`)
        .replace(/{portal_url}/g, window.location.origin);
    }
    return text;
  };

  useEffect(() => {
    if (isOpen) {
      setSentSuccess(false);
      const initialPhone = defaultPhone || ticket?.contactNumber || '';
      const initialName = defaultRecipientName || ticket?.employeeName || 'Employee';
      setPhone(initialPhone);
      setRecipientName(initialName);

      // Choose default template based on ticket status
      let defaultTpl = whatsappTemplates.find(t => t.triggerEvent === 'status_updated') || whatsappTemplates[0];
      if (ticket) {
        if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
          defaultTpl = whatsappTemplates.find(t => t.triggerEvent === 'ticket_closed') || defaultTpl;
        } else if (ticket.status === 'Open' && !ticket.assignedAgentId) {
          defaultTpl = whatsappTemplates.find(t => t.triggerEvent === 'ticket_created') || defaultTpl;
        } else if (ticket.status === 'Assigned') {
          defaultTpl = whatsappTemplates.find(t => t.triggerEvent === 'ticket_assigned') || defaultTpl;
        }
      }

      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        setMessage(applyVariables(defaultTpl.body, ticket, initialName, initialPhone));
      } else {
        setMessage(`*🏢 RATHI BUILDMART HELPDESK*\n\nNamaste ${initialName},\n\nRegarding ticket ${ticket ? `*${ticket.id}* - ${ticket.subject}` : ''}: Our team is working on your request.`);
      }
    }
  }, [isOpen, ticket, defaultPhone, defaultRecipientName]);

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = whatsappTemplates.find(t => t.id === tplId);
    if (tpl) {
      setMessage(applyVariables(tpl.body, ticket, recipientName, phone));
    }
  };

  const handleSendWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !message.trim()) return;

    dispatchWhatsApp({
      recipientPhone: phone.trim(),
      recipientName: recipientName.trim(),
      message: message.trim(),
      ticketId: ticket?.id,
      ticketSubject: ticket?.subject,
      triggerEvent: selectedTemplateId ? (whatsappTemplates.find(t => t.id === selectedTemplateId)?.name || 'WhatsApp Update') : 'Manual WhatsApp Message'
    });

    setSentSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const digitsOnly = phone.replace(/[^\d]/g, '');
  let formattedTargetPhone = digitsOnly;
  if (formattedTargetPhone.startsWith('0')) formattedTargetPhone = formattedTargetPhone.replace(/^0+/, '');
  if (formattedTargetPhone.length === 10) formattedTargetPhone = `91${formattedTargetPhone}`;
  const directWaUrl = `https://wa.me/${formattedTargetPhone}?text=${encodeURIComponent(message)}`;
  const webWaUrl = `https://web.whatsapp.com/send?phone=${formattedTargetPhone}&text=${encodeURIComponent(message)}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-emerald-700 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-800/80 rounded-xl">
              <MessageSquare className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Send WhatsApp Notification</h3>
              <p className="text-xs text-emerald-100">Direct instant 1-Click WhatsApp dispatch with dynamic templates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1.5 hover:bg-emerald-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-gray-900">WhatsApp Window Triggered!</h4>
              <p className="text-sm text-gray-600 mt-1">The message was dispatched and recorded into your delivery history logs.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <a
                href={directWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Re-open WhatsApp Link</span>
              </a>
              <a
                href={webWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#128C7E] hover:bg-[#075E54] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in WhatsApp Web</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSendWhatsApp} className="p-6 space-y-4">
            {/* Recipient details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  Recipient Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={recipientName}
                    onChange={e => setRecipientName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Employee Name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                  WhatsApp Mobile Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                    placeholder="+91 98765 43210"
                  />
                </div>
                {formattedTargetPhone && (
                  <span className="text-[10px] text-emerald-600 font-mono mt-0.5 block">
                    International Format: +{formattedTargetPhone}
                  </span>
                )}
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>Choose Template</span>
                <span className="text-[10px] text-emerald-600 font-normal">Auto-fills ticket data</span>
              </label>
              <select
                value={selectedTemplateId}
                onChange={e => handleTemplateChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="">-- Custom / No Template --</option>
                {whatsappTemplates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name} ({tpl.triggerEvent})
                  </option>
                ))}
              </select>
            </div>

            {/* Message Body with WhatsApp Preview */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Message Content (Supports WhatsApp *bold*, _italic_)
                </label>
                <button
                  type="button"
                  onClick={handleCopyText}
                  className="text-xs text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-medium"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy Text'}
                </button>
              </div>

              <textarea
                rows={5}
                required
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl text-xs md:text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50/50"
                placeholder="Type WhatsApp message here..."
              />
            </div>

            {/* WhatsApp Chat Bubble Live Preview */}
            <div className="bg-[#e5ddd5] p-3 rounded-xl border border-[#d1c7bc]">
              <div className="text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>WhatsApp Live Preview</span>
                <span className="text-[10px] text-gray-500">Auto-formatted</span>
              </div>
              <div className="bg-[#d9fdd3] text-gray-800 p-3 rounded-xl rounded-tr-none shadow-xs text-xs font-sans whitespace-pre-wrap max-h-32 overflow-y-auto leading-relaxed border border-[#c4e6be]">
                {message || 'No message content...'}
                <div className="text-[10px] text-gray-500 text-right mt-1">
                  Just now ✓✓
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <a
                  href={directWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-gray-300"
                  title="Open direct link without popup blocker"
                >
                  <ExternalLink className="w-3 h-3 text-emerald-600" />
                  <span>Direct Web Link</span>
                </a>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!phone.trim() || !message.trim()}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
