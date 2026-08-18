import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  Inbox,
  FileSpreadsheet,
  ArrowUpDown,
  Mail,
  Clock,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Trash2,
  Sparkles,
  Layers,
  CheckCircle,
  AlertCircle,
  User,
  ShieldCheck,
  Building,
  AlertTriangle,
  Send,
  ArrowDownLeft,
  ArrowUpRight,
  Flame,
  Timer
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { SendEmailModal } from '../components/SendEmailModal';
import { isTicketRaisedByUser, isTicketAssignedToAgent } from '../utils/ticketSecurity';
import { getTicketDelayInfo, getTicketRelationship } from '../utils/slaCalculator';

export const TicketDirectoryView: React.FC = () => {
  const {
    currentUser,
    tickets,
    setSelectedTicketId,
    setIsCreateTicketOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    branches,
    statusesList,
    prioritiesList,
    categories,
    departments,
    pullDataFromGoogleSheets,
    clearMockupTickets,
    restoreDemoTickets,
    isDemoDataActive,
    demoTicketsCount,
    realTicketsCount
  } = useApp();

  const isEmployee = currentUser ? currentUser.role === 'Employee' : true;
  const isAgent = currentUser ? (currentUser.role === 'Support Agent' || currentUser.role === 'Support Manager') : false;
  const isAdmin = currentUser ? (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') : false;

  // Direction / Relationship perspective filter: 'all' | 'raised_by_me' | 'assigned_to_me' | 'dept'
  const [relationshipScope, setRelationshipScope] = useState<'all' | 'raised_by_me' | 'assigned_to_me' | 'dept'>('all');

  // SLA delay quick filter: 'all' | 'breached' | 'due_soon' | 'safe' | 'resolved'
  const [slaDelayFilter, setSlaDelayFilter] = useState<'all' | 'breached' | 'due_soon' | 'safe' | 'resolved'>('all');

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [isPulling, setIsPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string | null>(null);

  // Email Modal
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState({
    email: '',
    name: '',
    ticketId: '',
    subject: ''
  });

  // Base tickets accessible according to role
  const accessibleTickets = useMemo(() => {
    if (!currentUser) return [];

    // Standard Employees ONLY see their own tickets
    if (isEmployee) {
      return tickets.filter(t => isTicketRaisedByUser(t, currentUser));
    }

    // Support staff & Admins have access to the full dataset
    return tickets;
  }, [tickets, currentUser, isEmployee]);

  // Scoped tickets by user relationship perspective
  const scopedTickets = useMemo(() => {
    if (!currentUser) return [];

    if (isEmployee) {
      return accessibleTickets;
    }

    if (relationshipScope === 'raised_by_me') {
      return accessibleTickets.filter(t => isTicketRaisedByUser(t, currentUser));
    }

    if (relationshipScope === 'assigned_to_me') {
      return accessibleTickets.filter(t => isTicketAssignedToAgent(t, currentUser));
    }

    if (relationshipScope === 'dept' && currentUser.department) {
      return accessibleTickets.filter(
        t => (t.department || '').toLowerCase() === currentUser.department.toLowerCase()
      );
    }

    return accessibleTickets;
  }, [accessibleTickets, currentUser, isEmployee, relationshipScope]);

  // KPI Metrics for Quick Badges
  const countRaisedByMe = useMemo(() => {
    return accessibleTickets.filter(t => isTicketRaisedByUser(t, currentUser)).length;
  }, [accessibleTickets, currentUser]);

  const countAssignedToMe = useMemo(() => {
    return accessibleTickets.filter(t => isTicketAssignedToAgent(t, currentUser)).length;
  }, [accessibleTickets, currentUser]);

  const countMyDept = useMemo(() => {
    if (!currentUser?.department) return 0;
    return accessibleTickets.filter(
      t => (t.department || '').toLowerCase() === currentUser.department.toLowerCase()
    ).length;
  }, [accessibleTickets, currentUser]);

  // SLA delay metrics on current scoped view
  const slaMetrics = useMemo(() => {
    let breached = 0;
    let dueSoon = 0;
    let safe = 0;
    let resolved = 0;

    scopedTickets.forEach(t => {
      const delayInfo = getTicketDelayInfo(t);
      if (delayInfo.category === 'breached') breached++;
      else if (delayInfo.category === 'due-soon') dueSoon++;
      else if (delayInfo.category === 'safe') safe++;
      else if (delayInfo.category === 'resolved') resolved++;
    });

    return { breached, dueSoon, safe, resolved };
  }, [scopedTickets]);

  const handlePullData = async () => {
    setIsPulling(true);
    setPullMessage(null);
    try {
      const result = await pullDataFromGoogleSheets(undefined, undefined, false);
      setPullMessage(result.message);
      setTimeout(() => setPullMessage(null), 5000);
    } catch (e: any) {
      setPullMessage(e.message || 'Sync failed');
    } finally {
      setIsPulling(false);
    }
  };

  const filteredTickets = useMemo(() => {
    return scopedTickets.filter(t => {
      const matchesSearch =
        !globalSearchQuery ||
        t.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.employeeName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        (t.employeeEmail && t.employeeEmail.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        t.category.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(globalSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesDepartment = departmentFilter === 'All' || t.department === departmentFilter;
      const matchesBranch = branchFilter === 'All' || t.location === branchFilter;

      // SLA delay filter
      let matchesSlaDelay = true;
      if (slaDelayFilter !== 'all') {
        const delayInfo = getTicketDelayInfo(t);
        matchesSlaDelay = delayInfo.category === slaDelayFilter;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCategory &&
        matchesDepartment &&
        matchesBranch &&
        matchesSlaDelay
      );
    });
  }, [scopedTickets, globalSearchQuery, statusFilter, priorityFilter, categoryFilter, departmentFilter, branchFilter, slaDelayFilter]);

  const uniqueCategories = Array.from(new Set([...categories.map(c => c.name), ...scopedTickets.map(t => t.category)]));
  const uniqueDepartments = Array.from(new Set([...departments.map(d => d.name), ...scopedTickets.map(t => t.department)]));
  const uniqueBranches = Array.from(new Set([...branches, ...scopedTickets.map(t => t.location)]));

  const scopedRealCount = scopedTickets.filter(t => !t.isDemoTicket && !['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id)).length;
  const scopedDemoCount = scopedTickets.length - scopedRealCount;

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Direction', 'Subject', 'Employee', 'Email', 'Department', 'Category', 'Priority', 'Status', 'SLA Delay Status', 'Assigned Agent', 'Created Date', 'SLA Due Date'];
    const rows = filteredTickets.map(t => {
      const rel = getTicketRelationship(t, currentUser);
      const delay = getTicketDelayInfo(t);
      return [
        t.id,
        `"${rel.badgeLabel}"`,
        `"${t.subject.replace(/"/g, '""')}"`,
        `"${t.employeeName}"`,
        `"${t.employeeEmail || ''}"`,
        `"${t.department}"`,
        `"${t.category}"`,
        t.priority,
        t.status,
        `"${delay.statusLabel} - ${delay.subLabel}"`,
        `"${t.assignedAgentName || 'Unassigned'}"`,
        new Date(t.createdDate).toLocaleDateString(),
        t.slaDueDate ? new Date(t.slaDueDate).toLocaleDateString() : 'N/A'
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HelpDesk_Tickets_${currentUser?.name?.replace(/\s+/g, '_') || 'Export'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {isEmployee ? 'My Support Tickets' : 'Enterprise Ticket Directory'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
              {isEmployee
                ? `${scopedTickets.length} Your Requests`
                : `${scopedRealCount} Real • ${scopedDemoCount} Demo`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEmployee
              ? `All tickets registered under your employee ID (${currentUser?.employeeId || 'N/A'}) and email (${currentUser?.email || 'N/A'}).`
              : 'Track raised tickets, incoming assignments, real-time SLA delay warnings, and Google Sheets sync status.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pull from Google Sheets Button */}
          <button
            onClick={handlePullData}
            disabled={isPulling}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            title="Fetch real tickets directly from Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? 'Fetching Sheet...' : 'Pull from Sheet'}</span>
          </button>

          {/* Purge / Restore Demo Tickets (Visible to Admins / Agents) */}
          {!isEmployee && (
            isDemoDataActive ? (
              <button
                onClick={clearMockupTickets}
                className="px-3.5 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Remove sample mockup tickets and display only real tickets"
              >
                <Trash2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Clear Mockup ({demoTicketsCount})</span>
              </button>
            ) : (
              <button
                onClick={restoreDemoTickets}
                className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                title="Restore demo tickets for testing"
              >
                <Sparkles className="w-3.5 h-3.5 text-gray-500" />
                <span>Restore Demo</span>
              </button>
            )
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateTicketOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+ Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Pull Feedback Toast Alert */}
      {pullMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pullMessage}</span>
          </div>
          <button onClick={() => setPullMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Ticket Perspective Switcher Tabs (Raised by Me vs Assigned to Me vs Department vs All) */}
      {!isEmployee && (
        <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-2xs flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-widest px-3 py-1">
            Perspective:
          </span>

          <button
            onClick={() => setRelationshipScope('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              relationshipScope === 'all'
                ? 'bg-gray-900 text-white shadow-xs'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🌐 All Tickets</span>
            <span className="px-1.5 py-0.2 bg-white/20 rounded-full text-[10px]">{accessibleTickets.length}</span>
          </button>

          <button
            onClick={() => setRelationshipScope('raised_by_me')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              relationshipScope === 'raised_by_me'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50/60 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>📤 Raised by Me (Mera Ticket)</span>
            <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-900 rounded-full text-[10px] font-extrabold">{countRaisedByMe}</span>
          </button>

          <button
            onClick={() => setRelationshipScope('assigned_to_me')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              relationshipScope === 'assigned_to_me'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>📥 Assigned to Me (To Resolve)</span>
            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">{countAssignedToMe}</span>
          </button>

          {currentUser?.department && (
            <button
              onClick={() => setRelationshipScope('dept')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                relationshipScope === 'dept'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50/60 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>🏢 {currentUser.department} Department</span>
              <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded-full text-[10px] font-extrabold">{countMyDept}</span>
            </button>
          )}
        </div>
      )}

      {/* SLA & Delay Status Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'breached' ? 'all' : 'breached')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'breached'
              ? 'bg-red-500 text-white border-red-600 shadow-md scale-[1.02]'
              : 'bg-white hover:bg-red-50/50 border-red-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'breached' ? 'text-red-100' : 'text-red-600'}`}>
              <Flame className="w-3 h-3" />
              Delayed / Breached
            </p>
            <p className="text-xl font-black mt-0.5">{slaMetrics.breached}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'breached' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
            Overdue
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'due_soon' ? 'all' : 'due_soon')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'due_soon'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.02]'
              : 'bg-white hover:bg-amber-50/50 border-amber-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'due_soon' ? 'text-amber-100' : 'text-amber-600'}`}>
              <Timer className="w-3 h-3" />
              Due Soon (&lt;4h)
            </p>
            <p className="text-xl font-black mt-0.5">{slaMetrics.dueSoon}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'due_soon' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            Expiring
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'safe' ? 'all' : 'safe')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'safe'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.02]'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'safe' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              <CheckCircle2 className="w-3 h-3" />
              On Track (Within SLA)
            </p>
            <p className="text-xl font-black mt-0.5">{slaMetrics.safe}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'safe' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            Healthy
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'resolved' ? 'all' : 'resolved')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'resolved'
              ? 'bg-gray-800 text-white border-gray-900 shadow-md scale-[1.02]'
              : 'bg-white hover:bg-gray-100/70 border-gray-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'resolved' ? 'text-gray-200' : 'text-gray-500'}`}>
              <CheckCircle className="w-3 h-3" />
              Resolved / Closed
            </p>
            <p className="text-xl font-black mt-0.5">{slaMetrics.resolved}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'resolved' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            Completed
          </span>
        </button>
      </div>

      {/* Comprehensive Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mr-2">
          <Filter className="w-4 h-4 text-blue-600" /> Filters:
        </div>

        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">Status: All</option>
          {statusesList.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">Priority: All</option>
          {prioritiesList.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">Category: All</option>
          {uniqueCategories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={departmentFilter}
          onChange={e => setDepartmentFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">Department: All</option>
          {uniqueDepartments.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        <select
          value={branchFilter}
          onChange={e => setBranchFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">Branch/Location: All</option>
          {uniqueBranches.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {(statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || departmentFilter !== 'All' || branchFilter !== 'All' || slaDelayFilter !== 'all' || relationshipScope !== 'all') && (
          <button
            onClick={() => {
              setStatusFilter('All');
              setPriorityFilter('All');
              setCategoryFilter('All');
              setDepartmentFilter('All');
              setBranchFilter('All');
              setSlaDelayFilter('all');
              setRelationshipScope('all');
            }}
            className="text-xs text-blue-600 hover:underline font-bold ml-auto cursor-pointer"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Main Ticket Directory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 flex-wrap gap-2">
          <span className="text-xs font-bold text-gray-700 flex items-center gap-2">
            <span>
              {isEmployee
                ? `Showing ${filteredTickets.length} of ${scopedTickets.length} tickets registered for you`
                : `Showing ${filteredTickets.length} of ${scopedTickets.length} tickets in view`}
            </span>
            {slaDelayFilter !== 'all' && (
              <span className="px-2 py-0.5 bg-gray-200 text-gray-800 rounded-full text-[10px] font-mono font-bold">
                Filtered: {slaDelayFilter.toUpperCase()}
              </span>
            )}
            {relationshipScope !== 'all' && (
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-full text-[10px] font-bold">
                Scope: {relationshipScope.replace('_', ' ').toUpperCase()}
              </span>
            )}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-5 py-3 w-40">Ticket ID & Origin</th>
                <th className="px-5 py-3">Subject & Requester</th>
                <th className="px-5 py-3 w-32">Department</th>
                <th className="px-5 py-3 w-24">Priority</th>
                <th className="px-5 py-3 w-28">Status</th>
                <th className="px-5 py-3 w-48">SLA & Delay Status</th>
                <th className="px-5 py-3 w-36">Assigned Agent</th>
                <th className="px-5 py-3 w-28">Logged Date</th>
                <th className="px-5 py-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-14 text-gray-400">
                    <Inbox className="w-9 h-9 mx-auto mb-2 text-gray-300" />
                    {scopedTickets.length === 0 ? (
                      <div>
                        <p className="font-bold text-gray-700 text-sm">No tickets found in this scope</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {relationshipScope === 'raised_by_me'
                            ? "You haven't raised any support tickets yet."
                            : relationshipScope === 'assigned_to_me'
                            ? "No active tickets are currently assigned to you."
                            : "No tickets registered for your account."}
                        </p>
                        <button
                          onClick={() => setIsCreateTicketOpen(true)}
                          className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          + Raise New Ticket
                        </button>
                      </div>
                    ) : (
                      <p>No tickets found matching the selected filters.</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => {
                  const isDemo = t.isDemoTicket || ['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id);
                  const rel = getTicketRelationship(t, currentUser);
                  const delay = getTicketDelayInfo(t);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID, Origin & Sync Status */}
                      <td className="px-5 py-3.5 align-top">
                        <div className="font-mono font-black text-blue-600 text-xs">{t.id}</div>
                        
                        {/* Direction Badge (Raised by Me vs Assigned to Me) */}
                        <div className="mt-1 flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border font-bold ${rel.badgeClass}`}>
                            {rel.iconType === 'raised' && <ArrowUpRight className="w-2.5 h-2.5" />}
                            {rel.iconType === 'assigned' && <ArrowDownLeft className="w-2.5 h-2.5" />}
                            {rel.badgeLabel}
                          </span>

                          {isDemo ? (
                            <span className="inline-flex items-center gap-1 text-[8px] font-sans font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                              <Sparkles className="w-2 h-2 text-amber-600" />
                              <span>Demo</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[8px] font-sans font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              <CheckCircle2 className="w-2 h-2 text-emerald-600" />
                              <span>Live Sheet</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subject & Requester */}
                      <td className="px-5 py-3.5 align-top">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {t.subject}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-[10px] text-gray-500 font-medium">{t.category} → {t.subCategory}</span>
                          <span className="text-[10px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.2 rounded">
                            {t.employeeName}
                          </span>
                          {t.employeeEmail && (
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                              {t.employeeEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Department & Branch */}
                      <td className="px-5 py-3.5 align-top">
                        <p className="font-semibold text-gray-800">{t.department}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{t.location || 'HQ'}</p>
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 text-[10px] rounded uppercase font-extrabold ${
                          t.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                          t.priority === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 align-top">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          t.status === 'Open' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                          t.status === 'In Progress' ? 'text-orange-700 bg-orange-50 border border-orange-200' :
                          t.status === 'Pending' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                          t.status === 'Resolved' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                          'text-gray-700 bg-gray-100 border border-gray-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* SLA & Delay Indicator (High Visibility) */}
                      <td className="px-5 py-3.5 align-top">
                        <div className={`p-1.5 rounded-lg border text-[10px] ${delay.badgeClass}`}>
                          <div className="flex items-center gap-1.5 font-black">
                            <span className={`w-2 h-2 rounded-full ${delay.dotColor} shrink-0 animate-ping`} />
                            <span>{delay.statusLabel}</span>
                          </div>
                          <p className="text-[10px] font-semibold mt-0.5 opacity-90">
                            {delay.subLabel}
                          </p>
                          {t.slaDueDate && (
                            <p className="text-[9px] text-gray-500 font-mono mt-0.5">
                              Due: {new Date(t.slaDueDate).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Assigned Agent */}
                      <td className="px-5 py-3.5 align-top text-gray-700 font-medium">
                        {t.assignedAgentName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 text-[11px]">
                            <UserCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-28">{t.assignedAgentName}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[11px]">Unassigned</span>
                        )}
                      </td>

                      {/* Logged Date */}
                      <td className="px-5 py-3.5 align-top text-gray-500 font-mono text-[11px]">
                        {new Date(t.createdDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-3.5 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRecipient({
                                email: t.employeeEmail,
                                name: t.employeeName,
                                ticketId: t.id,
                                subject: t.subject
                              });
                              setEmailModalOpen(true);
                            }}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded-lg border border-blue-200 transition-all cursor-pointer"
                            title={`Send Email to ${t.employeeEmail}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded-lg transition-all cursor-pointer">
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={selectedRecipient.email}
        recipientName={selectedRecipient.name}
        ticketId={selectedRecipient.ticketId}
        ticketSubject={selectedRecipient.subject}
      />
    </div>
  );
};
