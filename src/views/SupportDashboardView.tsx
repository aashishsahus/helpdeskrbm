import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Ticket,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  Filter,
  Search,
  ChevronRight,
  ShieldAlert,
  BarChart3,
  Flame,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { DateRangeFilterType, isDateInRange } from '../utils/dateUtils';
import { RefreshButton } from '../components/RefreshButton';
import { TicketRatingWidget } from '../components/TicketRatingWidget';

export const SupportDashboardView: React.FC = () => {
  const {
    tickets,
    categories,
    users,
    currentUser,
    setSelectedTicketId,
    assignTicket,
    updateTicketStatus,
    globalSearchQuery
  } = useApp();

  const [dateFilter, setDateFilter] = useState<DateRangeFilterType>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [slaFilter, setSlaFilter] = useState<string>('All');
  const [viewTab, setViewTab] = useState<'all' | 'my' | 'unassigned'>('all');

  const agents = users.filter(u => u.role === 'Support Agent' || u.role === 'Support Manager');

  // Filter base tickets by date range
  const dateFilteredTickets = useMemo(() => {
    return tickets.filter(t => isDateInRange(t.createdDate, dateFilter, customStart, customEnd));
  }, [tickets, dateFilter, customStart, customEnd]);

  // KPI calculations
  const totalOpen = dateFilteredTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const unassigned = dateFilteredTickets.filter(t => !t.assignedAgentId && t.status !== 'Closed' && t.status !== 'Resolved').length;
  const myAssigned = currentUser ? dateFilteredTickets.filter(t => t.assignedAgentId === currentUser.id && t.status !== 'Closed').length : 0;
  const highPriority = dateFilteredTickets.filter(t => t.priority === 'High' && t.status !== 'Closed').length;
  const criticalCount = dateFilteredTickets.filter(t => t.priority === 'Critical' && t.status !== 'Closed').length;
  const slaBreached = dateFilteredTickets.filter(t => t.slaStatus === 'Breached' && t.status !== 'Resolved' && t.status !== 'Closed').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const dueToday = dateFilteredTickets.filter(t => t.slaDueDate.startsWith(todayStr) && t.status !== 'Closed').length;
  const resolvedToday = dateFilteredTickets.filter(t => t.resolvedDate && t.resolvedDate.startsWith(todayStr)).length;

  // Filter queue
  const filteredQueue = dateFilteredTickets.filter(t => {
    if (viewTab === 'my' && (!currentUser || t.assignedAgentId !== currentUser.id)) return false;
    if (viewTab === 'unassigned' && t.assignedAgentId) return false;

    const matchesSearch =
      !globalSearchQuery ||
      (t.id && t.id.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.subject && t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.employeeName && t.employeeName.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.ticketType && t.ticketType.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.module && t.module.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.subCategory && t.subCategory.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(globalSearchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesType = typeFilter === 'All' || t.ticketType === typeFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesModule = moduleFilter === 'All' || t.module === moduleFilter;
    const matchesSla = slaFilter === 'All' || t.slaStatus === slaFilter;

    return matchesSearch && matchesStatus && matchesType && matchesPriority && matchesCategory && matchesModule && matchesSla;
  });

  const uniqueTypes = Array.from(new Set(['Modification Request', 'New Request', 'Support / How-To', 'Approval Request', 'Verification Request', 'Issue / Bug', ...tickets.map(t => t.ticketType).filter(Boolean) as string[]]));
  const categoriesList = Array.from(new Set([...categories.map(c => c.name), ...tickets.map(t => t.category)]));
  const modulesList = Array.from(new Set([...tickets.map(t => t.module).filter(Boolean) as string[], 'Invoice', 'Order', 'Quotation', 'Lead', 'Customer', 'Vendor', 'Stock', 'Material', 'Entry', 'Item']));

  const handleDateFilterChange = (newFilter: DateRangeFilterType, s?: string, e?: string) => {
    setDateFilter(newFilter);
    if (s !== undefined) setCustomStart(s);
    if (e !== undefined) setCustomEnd(e);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Top Banner */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Support Agent Desk Queue
            <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full border border-blue-200">
              Live Operations
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Real-time ticket dispatching, SLA monitoring, and resolution queue for support engineers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <RefreshButton
            id="support-dashboard-refresh-btn"
            variant="default"
            showTimestamp={true}
            label="Refresh Desk"
          />
          <DateRangeFilter
            value={dateFilter}
            onChange={handleDateFilterChange}
            customStartDate={customStart}
            customEndDate={customEnd}
          />
        </div>
      </div>

      {/* KPI Cards Strip (8 Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Open</p>
          <span className="text-xl font-bold text-gray-900">{totalOpen}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Unassigned</p>
          <span className="text-xl font-bold text-amber-600">{unassigned}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">My Tickets</p>
          <span className="text-xl font-bold text-blue-600">{myAssigned}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">High Priority</p>
          <span className="text-xl font-bold text-orange-600">{highPriority}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Critical</p>
          <span className="text-xl font-bold text-red-600 flex items-center gap-1">
            <Flame className="w-4 h-4 fill-red-500" />
            {criticalCount}
          </span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-red-200 bg-red-50/30 shadow-2xs">
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">SLA Breached</p>
          <span className="text-xl font-bold text-red-700">{slaBreached}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Due Today</p>
          <span className="text-xl font-bold text-indigo-600">{dueToday}</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resolved Today</p>
          <span className="text-xl font-bold text-green-600">{resolvedToday}</span>
        </div>
      </div>

      {/* Queue Data Grid Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden flex flex-col">
        {/* View Tabs & Filters Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50 flex-wrap gap-3">
          {/* Tabs */}
          <div className="flex bg-gray-200/80 p-1 rounded-lg text-xs font-bold gap-1">
            <button
              onClick={() => setViewTab('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewTab === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              All Support Queue ({tickets.length})
            </button>
            <button
              onClick={() => setViewTab('my')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewTab === 'my' ? 'bg-white text-blue-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Assigned to Me ({myAssigned})
            </button>
            <button
              onClick={() => setViewTab('unassigned')}
              className={`px-3 py-1.5 rounded-md transition-all ${viewTab === 'unassigned' ? 'bg-white text-amber-700 shadow-2xs' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Unassigned Queue ({unassigned})
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
            >
              <option value="All">Status: All</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-900 outline-none"
            >
              <option value="All">Type: All</option>
              {uniqueTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
            >
              <option value="All">Priority: All</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
            >
              <option value="All">Category: All</option>
              {categoriesList.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={moduleFilter}
              onChange={e => setModuleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900 outline-none"
            >
              <option value="All">Module: All</option>
              {modulesList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select
              value={slaFilter}
              onChange={e => setSlaFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 outline-none"
            >
              <option value="All">SLA: All</option>
              <option value="Safe">Safe</option>
              <option value="Due Soon">Due Soon</option>
              <option value="Breached">Breached</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-4 py-3 w-28">Ticket ID</th>
                <th className="px-4 py-3 min-w-[200px]">Subject & Requester</th>
                <th className="px-4 py-3 min-w-[120px]">Ticket Type</th>
                <th className="px-4 py-3 min-w-[130px]">Category & Module</th>
                <th className="px-4 py-3 min-w-[140px]">Sub-Category / Action Item</th>
                <th className="px-4 py-3 w-20">Priority</th>
                <th className="px-4 py-3 w-24">Status</th>
                <th className="px-4 py-3 min-w-[140px]">Feedback & Rating</th>
                <th className="px-4 py-3 w-32">SLA Countdown</th>
                <th className="px-4 py-3 w-40">Assigned Agent</th>
                <th className="px-4 py-3 w-24 text-center">Quick Assign</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredQueue.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    No tickets found in queue matching filters.
                  </td>
                </tr>
              ) : (
                filteredQueue.map((t, idx) => (
                  <tr
                    key={`${t.id}-${idx}`}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{t.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {t.subject}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {t.employeeName} • <span className="font-mono">{t.department} - {t.location}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border text-blue-800 bg-blue-50/80 border-blue-200">
                        {t.ticketType || 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 text-xs">{t.category}</p>
                      {t.module && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.module}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 max-w-[160px] truncate" title={t.subCategory}>
                        {t.subCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                        t.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        t.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        t.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-gray-800">{t.status}</span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      {t.status === 'Resolved' || t.status === 'Closed' ? (
                        <TicketRatingWidget ticket={t} variant="inline" />
                      ) : (
                        <span className="text-gray-300 text-[10px] font-mono select-none">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-[11px]">
                      {t.slaStatus === 'Breached' ? (
                        <span className="text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Breached
                        </span>
                      ) : t.slaStatus === 'Due Soon' ? (
                        <span className="text-yellow-700 font-bold bg-yellow-50 px-2 py-0.5 rounded border border-yellow-200">
                          Due Soon
                        </span>
                      ) : (
                        <span className="text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-200">
                          On Track
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-800 font-medium" onClick={e => e.stopPropagation()}>
                      <select
                        value={t.assignedAgentId || ''}
                        onChange={e => assignTicket(t.id, e.target.value)}
                        className="px-2 py-1 bg-gray-50 border border-gray-200 rounded text-xs font-semibold text-gray-700 focus:bg-white max-w-[130px]"
                      >
                        <option value="">Unassigned</option>
                        {agents.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-center" onClick={e => e.stopPropagation()}>
                      {!t.assignedAgentId && (
                        <button
                          onClick={() => currentUser && assignTicket(t.id, currentUser.id)}
                          className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded text-[10px] shadow-2xs cursor-pointer"
                        >
                          Claim
                        </button>
                      )}
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
