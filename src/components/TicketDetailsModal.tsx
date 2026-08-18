import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Clock,
  User,
  Building,
  Tag,
  AlertTriangle,
  Paperclip,
  Send,
  Lock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  History,
  Star,
  UserCheck,
  ShieldCheck,
  FileText,
  Mail,
  Trash2,
  AlertTriangle as AlertIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  Timer
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { SendEmailModal } from './SendEmailModal';
import { SendWhatsAppModal } from './SendWhatsAppModal';
import { getTicketDelayInfo, getTicketRelationship } from '../utils/slaCalculator';

export const TicketDetailsModal: React.FC = () => {
  const {
    selectedTicketId,
    setSelectedTicketId,
    tickets,
    comments,
    history,
    users,
    currentUser,
    updateTicketStatus,
    updateTicketPriority,
    assignTicket,
    addTicketComment,
    rateTicket,
    deleteTicketPermanently
  } = useApp();

  const [commentText, setCommentText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
  const [newAgentId, setNewAgentId] = useState<string>('');
  const [starRating, setStarRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!selectedTicketId) return null;

  const ticket = tickets.find(t => t.id === selectedTicketId);
  if (!ticket) return null;

  const ticketComments = comments.filter(c => c.ticketId === ticket.id);
  const ticketHistoryList = history.filter(h => h.ticketId === ticket.id);
  const agentsList = users.filter(u => u.role === 'Support Agent' || u.role === 'Support Manager');

  const isStaff = currentUser ? currentUser.role !== 'Employee' : false;

  // Calculate SLA Remaining Time
  const getSLARemaining = () => {
    const due = new Date(ticket.slaDueDate).getTime();
    const now = new Date().getTime();
    const diff = due - now;

    if (diff < 0) return { text: 'SLA Breached', color: 'bg-red-100 text-red-700 border-red-300' };
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 2) return { text: `Due in ${mins}m`, color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { text: `Safe - Due in ${hours}h ${mins}m`, color: 'bg-green-100 text-green-700 border-green-300' };
  };

  const slaInfo = getSLARemaining();

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addTicketComment(ticket.id, commentText, isInternalNote);
    setCommentText('');
  };

  const handleStatusChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStatus) {
      updateTicketStatus(ticket.id, newStatus);
      setNewStatus('');
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAgentId) {
      assignTicket(ticket.id, newAgentId);
      setNewAgentId('');
    }
  };

  const handleRatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    rateTicket(ticket.id, starRating, feedbackText);
  };

  const rel = getTicketRelationship(ticket, currentUser);
  const delayInfo = getTicketDelayInfo(ticket);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-blue-600/30 text-blue-400 font-mono font-bold text-sm rounded border border-blue-500/30">
              {ticket.id}
            </span>
            <h2 className="text-base font-bold text-white truncate max-w-xl">{ticket.subject}</h2>
          </div>
          <button
            onClick={() => setSelectedTicketId(null)}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Context & SLA Status Bar */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
          {/* Origin / Relationship Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border font-extrabold shadow-2xs ${rel.badgeClass}`}>
              {rel.iconType === 'raised' && <ArrowUpRight className="w-3.5 h-3.5" />}
              {rel.iconType === 'assigned' && <ArrowDownLeft className="w-3.5 h-3.5" />}
              {rel.badgeLabel}
            </span>
            <span className="text-[11px] text-gray-600 font-medium hidden sm:inline">
              • {rel.description}
            </span>
          </div>

          {/* SLA Delay Alert */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 shadow-2xs ${delayInfo.badgeClass}`}>
              {delayInfo.isDelayed && <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />}
              {delayInfo.isDueSoon && <Timer className="w-3.5 h-3.5 text-amber-600" />}
              {delayInfo.category === 'safe' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              <span>{delayInfo.statusLabel} ({delayInfo.subLabel})</span>
            </div>
          </div>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50">
          {/* Main Left Details (2 cols) */}
          <div className="md:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Issue Description</h3>
              <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed font-normal">{ticket.description}</p>
            </div>

            {/* Attachments Section */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  Google Drive Attachments ({ticket.attachments.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ticket.attachments.map(att => (
                    <a
                      key={att.id}
                      href={att.driveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-gray-800 group-hover:text-blue-700 truncate">{att.fileName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{(att.fileSize / 1024).toFixed(0)} KB • {att.uploadedBy}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Activity Section */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                Comments & Updates
              </h3>

              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {ticketComments.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No comments added yet.</p>
                ) : (
                  ticketComments.map(c => {
                    if (c.isInternalNote && !isStaff) return null; // Hide internal notes from normal employees
                    return (
                      <div
                        key={c.id}
                        className={`p-3.5 rounded-xl text-xs ${
                          c.isInternalNote
                            ? 'bg-amber-50/80 border border-amber-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{c.authorName}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-200 text-gray-700 rounded font-semibold">
                              {c.authorRole}
                            </span>
                            {c.isInternalNote && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-200 text-amber-900 rounded flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" /> Internal Note
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(c.createdAt).toLocaleDateString()} {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-800 whitespace-pre-line leading-relaxed">{c.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Comment Form */}
              <form onSubmit={handleSendComment} className="pt-2 border-t border-gray-100 space-y-2">
                <textarea
                  rows={2}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder={isInternalNote ? "Type internal note (only visible to support agents)..." : "Add a comment to employee..."}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                />

                <div className="flex items-center justify-between">
                  {isStaff ? (
                    <label className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isInternalNote}
                        onChange={e => setIsInternalNote(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span>Internal Staff Note Only</span>
                    </label>
                  ) : <div />}

                  <button
                    type="submit"
                    disabled={!commentText.trim()}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-all"
                  >
                    <Send className="w-3 h-3" /> Post Comment
                  </button>
                </div>
              </form>
            </div>

            {/* Rating Section (If Ticket Resolved/Closed) */}
            {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-yellow-500" /> Service Satisfaction Rating
                </h3>

                {ticket.rating ? (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      {[...Array(ticket.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                      <span className="text-gray-800 ml-1">({ticket.rating}/5 Stars)</span>
                    </div>
                    {ticket.feedback && <p className="text-gray-700 italic">"{ticket.feedback}"</p>}
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="space-y-2">
                    <p className="text-xs text-gray-600">Please rate your support resolution experience:</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setStarRating(star)}
                          className={`p-1.5 rounded hover:bg-yellow-50 transition-colors ${starRating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                          <Star className="w-6 h-6 fill-current" />
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      value={feedbackText}
                      onChange={e => setFeedbackText(e.target.value)}
                      placeholder="Optional feedback..."
                      className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg text-xs shadow-2xs"
                    >
                      Submit Rating
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar Status & Meta (1 col) */}
          <div className="space-y-5">
            {/* SLA Status Pill */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">SLA Target Time</span>
              <div className={`p-2.5 rounded-lg border font-mono font-bold text-xs flex items-center justify-between ${slaInfo.color}`}>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 shrink-0" />
                  <span>{slaInfo.text}</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-mono">
                Due: {new Date(ticket.slaDueDate).toLocaleString()}
              </p>
            </div>

            {/* Quick Staff Controls */}
            {isStaff && (
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Agent Controls</span>

                {/* Status Update */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] text-gray-500 font-semibold block">Change Status</label>
                    <span className="text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Auto Email on Close</span>
                  </div>
                  <div className="flex gap-1.5">
                    <select
                      value={newStatus || ticket.status}
                      onChange={e => updateTicketStatus(ticket.id, e.target.value as TicketStatus)}
                      className="flex-1 px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending">Pending</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                      <option value="Reopened">Reopened</option>
                    </select>
                  </div>
                  {(ticket.status === 'Resolved' || ticket.status === 'Closed') && (
                    <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                      <span>✓</span> Confirmation email dispatched to employee & agent.
                    </p>
                  )}
                </div>

                {/* Priority Update */}
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold block mb-1">Change Priority</label>
                  <select
                    value={ticket.priority}
                    onChange={e => updateTicketPriority(ticket.id, e.target.value as TicketPriority)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 focus:bg-white"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                {/* Assign Agent */}
                <div>
                  <label className="text-[10px] text-gray-500 font-semibold block mb-1">Assign Agent</label>
                  <select
                    value={ticket.assignedAgentId || ''}
                    onChange={e => assignTicket(ticket.id, e.target.value)}
                    className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:bg-white"
                  >
                    <option value="">-- Unassigned --</option>
                    {agentsList.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.department})</option>
                    ))}
                  </select>
                </div>

                {/* Super Admin Permanent Delete / Archive Option */}
                {currentUser?.role === 'Super Admin' && (
                  <div className="pt-2 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-1.5 px-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Archive & Delete Ticket</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Ticket Attributes Card */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-3 text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-1">
                Metadata Summary
              </span>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-gray-400 block text-[10px]">Requester Employee</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setIsWhatsAppModalOpen(true)}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200 transition-colors"
                        title="Send WhatsApp Message"
                      >
                        <MessageSquare className="w-3 h-3 text-emerald-600" />
                        <span>WhatsApp</span>
                      </button>
                      <button
                        onClick={() => setIsEmailModalOpen(true)}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                        title="Send Email Notification"
                      >
                        <Mail className="w-3 h-3" />
                        <span>Email</span>
                      </button>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{ticket.employeeName} ({ticket.employeeId})</p>
                  <div className="flex flex-wrap items-center gap-x-2 text-[10px]">
                    <span className="text-blue-700 font-bold font-mono">{ticket.employeeEmail}</span>
                    {ticket.contactNumber && (
                      <span className="text-emerald-700 font-bold font-mono">📱 {ticket.contactNumber}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Department & Location</span>
                  <p className="font-semibold text-gray-800">{ticket.department}</p>
                  <p className="text-[10px] text-gray-500">{ticket.location}</p>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Category / Sub Category</span>
                  <p className="font-semibold text-gray-800">{ticket.category} → {ticket.subCategory}</p>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Assigned Agent</span>
                  <p className="font-semibold text-blue-700">{ticket.assignedAgentName || 'Unassigned'}</p>
                </div>

                <div>
                  <span className="text-gray-400 block text-[10px]">Created Date</span>
                  <p className="font-mono text-gray-600">{new Date(ticket.createdDate).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Timeline Audit Log */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <History className="w-3 h-3 text-blue-600" /> Audit Timeline
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto text-[11px] font-mono">
                {ticketHistoryList.map(h => (
                  <div key={h.id} className="border-l-2 border-blue-500 pl-2 py-0.5">
                    <p className="font-bold text-gray-800">{h.action}</p>
                    <p className="text-[10px] text-gray-500">{h.details}</p>
                    <span className="text-[9px] text-gray-400">{new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={ticket.employeeEmail}
        recipientName={ticket.employeeName}
        ticketId={ticket.id}
        ticketSubject={ticket.subject}
      />

      {/* Send WhatsApp Modal */}
      <SendWhatsAppModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        ticket={ticket}
        defaultPhone={ticket.contactNumber || ''}
        defaultRecipientName={ticket.employeeName}
      />

      {/* Super Admin Permanent Delete / Archive Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-200 animate-in fade-in zoom-in-95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl text-red-600">
                <AlertIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Move Ticket to Archive Vault?</h3>
                <p className="text-xs text-gray-500 font-mono">{ticket.id} - {ticket.subject}</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              This will remove the ticket from the active queues and transfer all ticket metadata, SLA logs, and history to the <span className="font-bold text-gray-800">"ArchivedTickets"</span> Google Sheet tab.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Reason for Deletion / Archival *</label>
              <textarea
                rows={2}
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                placeholder="E.g., Duplicate ticket, test submission, resolved externally..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:bg-white focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteReason('');
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={async () => {
                  setIsDeleting(true);
                  await deleteTicketPermanently(ticket.id, deleteReason || 'Deleted by Super Admin');
                  setIsDeleting(false);
                  setShowDeleteConfirm(false);
                  setSelectedTicketId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Archiving...' : 'Confirm Archive & Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
