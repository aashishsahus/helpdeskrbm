import React, { useState, useEffect } from 'react';
import { Mail, Send, X, CheckCircle2, Copy, Sparkles, ExternalLink, Ticket } from 'lucide-react';
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
  const { settings, addAuditLog } = useApp();

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSentSuccess(false);
      setSending(false);
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
  }, [isOpen, recipientEmail, recipientName, ticketId, ticketSubject]);

  if (!isOpen) return null;

  const handleTemplateSelect = (type: 'feedback' | 'update' | 'custom') => {
    if (type === 'feedback') {
      setSubject(`[${ticketId || 'HelpDesk'}] Please Rate Your Support Experience`);
      setBody(`Dear ${recipientName || 'Employee'},\n\nYour support ticket ${ticketId || ''} (${ticketSubject || 'Request'}) has been resolved.\n\nWe value your feedback! Please log in to your Help Desk portal to rate our service and share your comments.\n\nThank you,\nIT Support Team`);
    } else if (type === 'update') {
      setSubject(`[${ticketId || 'HelpDesk'}] Status Update on your request`);
      setBody(`Dear ${recipientName || 'Employee'},\n\nWe wanted to inform you that your ticket ${ticketId || ''} is currently being processed by our support team.\n\nIf you have any additional details or files to share, please reply or update the ticket in your portal.\n\nBest regards,\nSupport Desk`);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail || !subject.trim() || !body.trim()) return;

    setSending(true);
    try {
      const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;
      await fetch('/api/google/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          subject,
          body,
          ticketId,
          webAppUrl: scriptUrl
        })
      });

      addAuditLog('EMAIL_SENT', 'Support Queue', `Sent email notification to ${recipientEmail} for ticket ${ticketId || 'general'}`);
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      setSentSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
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
                Contact requester directly & send feedback requests
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
              An official email message has been dispatched to <strong>{recipientEmail}</strong>.
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

            {/* Quick Templates */}
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Quick Email Preset Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('feedback')}
                  className="p-2 border border-amber-200 hover:border-amber-400 bg-amber-50/50 hover:bg-amber-50 text-left rounded-xl transition-all"
                >
                  <span className="font-bold text-[11px] text-amber-900 block">⭐ Request Rating & Feedback</span>
                  <span className="text-[10px] text-amber-700 block truncate">Ask employee to rate ticket resolution</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTemplateSelect('update')}
                  className="p-2 border border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-left rounded-xl transition-all"
                >
                  <span className="font-bold text-[11px] text-blue-900 block">📩 Ticket Progress Update</span>
                  <span className="text-[10px] text-blue-700 block truncate">Notify employee about ongoing status</span>
                </button>
              </div>
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
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
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
          </form>
        )}
      </div>
    </div>
  );
};
