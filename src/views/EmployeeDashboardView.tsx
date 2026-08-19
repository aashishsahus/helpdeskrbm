import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  Inbox,
  Star,
  Lock
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { isTicketRaisedByUser } from '../utils/ticketSecurity';
import { RefreshButton } from '../components/RefreshButton';
import { TicketRatingWidget } from '../components/TicketRatingWidget';

export const EmployeeDashboardView: React.FC = () => {
  const {
    currentUser,
    tickets,
    setSelectedTicketId,
    setIsCreateTicketOpen,
    globalSearchQuery
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Filter user's own tickets with comprehensive security matching
  const myTickets = currentUser
    ? tickets.filter(t => isTicketRaisedByUser(t, currentUser))
    : [];

  const totalMyTickets = myTickets.length;
  const openCount = myTickets.filter(t => t.status === 'Open').length;
  const inProgressCount = myTickets.filter(t => t.status === 'In Progress').length;
  const pendingCount = myTickets.filter(t => t.status === 'Pending').length;
  const resolvedCount = myTickets.filter(t => t.status === 'Resolved').length;
  const closedCount = myTickets.filter(t => t.status === 'Closed').length;
  const completedCount = resolvedCount + closedCount;
  const myResolutionRate = totalMyTickets > 0 ? Math.round((completedCount / totalMyTickets) * 100) : 100;

  // Pending feedback count on my tickets
  const feedbackPendingTickets = myTickets.filter(
    t => (t.status === 'Resolved' || t.status === 'Closed') && (!t.rating || t.rating === 0)
  );

  const filteredTickets = myTickets.filter(t => {
    const matchesSearch =
      !globalSearchQuery ||
      t.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(globalSearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getPriorityBadge = (p: TicketPriority) => {
    switch (p) {
      case 'Critical':
        return 'bg-red-100 text-red-700 font-bold';
      case 'High':
        return 'bg-orange-100 text-orange-700 font-bold';
      case 'Medium':
        return 'bg-blue-100 text-blue-700 font-semibold';
      case 'Low':
        return 'bg-gray-100 text-gray-700 font-medium';
    }
  };

  const getStatusBadge = (s: TicketStatus) => {
    switch (s) {
      case 'Open':
        return 'text-blue-600 bg-blue-50';
      case 'In Progress':
        return 'text-orange-600 bg-orange-50';
      case 'Pending':
        return 'text-amber-600 bg-amber-50';
      case 'Resolved':
        return 'text-green-600 bg-green-50';
      case 'Closed':
        return 'text-gray-600 bg-gray-100';
      case 'Reopened':
        return 'text-purple-600 bg-purple-50';
    }
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#111827] to-indigo-950 text-white p-6 rounded-2xl shadow-md border border-gray-800 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Welcome back, {currentUser?.name || 'Guest User'}!
            <span className="text-xs px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded font-mono font-semibold border border-blue-500/30">
              {currentUser?.department || 'RPR Help Desk'}
            </span>
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            Track your IT support requests, submit new issues, or get instant help from AI Help Desk Assistant.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <RefreshButton
            id="employee-banner-refresh-btn"
            variant="banner"
            showTimestamp={true}
            label="Refresh"
          />
          <button
            onClick={() => setIsCreateTicketOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Support Ticket</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards (Personalized Employee View) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Raised</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-gray-900">{totalMyTickets}</span>
            <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-700 font-bold rounded">My Tickets</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress / Open</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-blue-600">{openCount + inProgressCount}</span>
            <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 font-bold rounded">Working</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending Action</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
            <span className="text-[10px] px-2 py-0.5 bg-amber-50 text-amber-600 font-bold rounded">Awaiting Info</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resolved & Closed</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-emerald-600">{completedCount}</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 font-bold rounded">Completed</span>
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resolution Rate</p>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-bold text-emerald-700">{myResolutionRate}%</span>
            <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded">Success</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK PENDING PROMINENT ALERT */}
      {feedbackPendingTickets.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-300 rounded-2xl flex items-center justify-between gap-4 shadow-sm flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-xs font-black text-amber-950 flex items-center gap-2">
                <span>⭐ Action Required: {feedbackPendingTickets.length} Resolved Ticket{feedbackPendingTickets.length > 1 ? 's' : ''} Pending Your Rating</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-200 text-amber-900 border border-amber-400">
                  Feedback Pending
                </span>
              </h3>
              <p className="text-[11px] text-amber-800 mt-0.5">
                Your support issues have been resolved. Please rate the quality of service below (locks permanently once submitted).
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('Resolved')}
            className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs rounded-xl shadow-xs transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rate Resolved Tickets</span>
          </button>
        </div>
      )}

      {/* Main Ticket Queue Data Grid */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
        {/* Table Header Controls */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900 text-sm">My Support Tickets</h2>
            <span className="text-[10px] px-2.5 py-0.5 bg-gray-200 text-gray-700 rounded-full font-mono font-bold">
              {filteredTickets.length} Tickets
            </span>
          </div>

          <div className="flex items-center gap-2">
            <RefreshButton
              id="employee-table-refresh-btn"
              variant="outline"
              label="Sync Tickets"
            />

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>

        {/* Data Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-5 py-3 w-28">Ticket ID</th>
                <th className="px-5 py-3 min-w-[200px]">Subject & Type</th>
                <th className="px-5 py-3 min-w-[140px]">Category & Module</th>
                <th className="px-5 py-3 min-w-[150px]">Sub-Category / Action Item</th>
                <th className="px-5 py-3 w-24">Priority</th>
                <th className="px-5 py-3 w-28">Status</th>
                <th className="px-5 py-3 min-w-[150px]">Feedback & Rating</th>
                <th className="px-5 py-3 w-36">Assigned To</th>
                <th className="px-5 py-3 w-28">Created Date</th>
                <th className="px-5 py-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No support tickets match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-5 py-4 font-mono font-bold text-blue-600">{t.id}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{t.subject}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {t.ticketType && (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                            {t.ticketType}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 font-mono">{t.department}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-900 text-xs">{t.category}</p>
                      {t.module && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.module}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 max-w-[170px] truncate" title={t.subCategory}>
                        {t.subCategory}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded uppercase ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    {/* Feedback Rating Widget */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {t.status === 'Resolved' || t.status === 'Closed' ? (
                        <TicketRatingWidget ticket={t} variant="inline" />
                      ) : (
                        <span className="text-gray-300 text-[10px] font-mono select-none">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">
                      {t.assignedAgentName || <span className="text-gray-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4 text-gray-500 font-mono text-[11px]">
                      {new Date(t.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <button className="p-1.5 hover:bg-white hover:shadow-2xs border border-transparent hover:border-gray-200 rounded transition-all">
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
