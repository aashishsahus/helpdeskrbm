import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Filter,
  Download,
  ChevronRight,
  ChevronLeft,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
  FileSpreadsheet,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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
  Timer,
  Calendar,
  Star,
  Lock
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { SendEmailModal } from '../components/SendEmailModal';
import { isTicketRaisedByUser, isTicketAssignedToAgent } from '../utils/ticketSecurity';
import { getTicketDelayInfo, getTicketRelationship } from '../utils/slaCalculator';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { DateRangeFilterType, isDateInRange, formatDateTime } from '../utils/dateUtils';
import { RefreshButton } from '../components/RefreshButton';
import { TicketRatingWidget } from '../components/TicketRatingWidget';

type SortField =
  | 'id'
  | 'subject'
  | 'ticketType'
  | 'category'
  | 'subCategory'
  | 'department'
  | 'priority'
  | 'status'
  | 'slaStatus'
  | 'assignedAgentName'
  | 'createdDate'
  | 'slaDueDate'
  | 'rating';

type SortOrder = 'asc' | 'desc';

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

  // SLA delay quick filter: 'all' | 'breached' | 'due_soon' | 'safe' | 'resolved' | 'feedback_pending'
  const [slaDelayFilter, setSlaDelayFilter] = useState<'all' | 'breached' | 'due_soon' | 'safe' | 'resolved' | 'feedback_pending'>('all');

  // Date Range Filter
  const [dateFilter, setDateFilter] = useState<DateRangeFilterType>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [subCategoryFilter, setSubCategoryFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [isPulling, setIsPulling] = useState(false);
  const [pullMessage, setPullMessage] = useState<string | null>(null);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('createdDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Pagination
  const [pageSize, setPageSize] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

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

  // Feedback pending count on resolved/closed tickets
  const feedbackPendingCount = useMemo(() => {
    return scopedTickets.filter(
      t => (t.status === 'Resolved' || t.status === 'Closed') && (!t.rating || t.rating === 0)
    ).length;
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

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return scopedTickets.filter(t => {
      // Date Range filter
      if (!isDateInRange(t.createdDate, dateFilter, customStart, customEnd)) {
        return false;
      }

      const matchesSearch =
        !globalSearchQuery ||
        t.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        (t.ticketType && t.ticketType.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (t.module && t.module.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (t.subCategory && t.subCategory.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        t.employeeName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        (t.employeeEmail && t.employeeEmail.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        (t.employeeId && t.employeeId.toLowerCase().includes(globalSearchQuery.toLowerCase())) ||
        t.category.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.department.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
        t.location.toLowerCase().includes(globalSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
      const matchesType = typeFilter === 'All' || t.ticketType === typeFilter;
      const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      const matchesModule = moduleFilter === 'All' || t.module === moduleFilter;
      const matchesSubCategory = subCategoryFilter === 'All' || t.subCategory === subCategoryFilter;
      const matchesDepartment = departmentFilter === 'All' || t.department === departmentFilter;
      const matchesBranch = branchFilter === 'All' || t.location === branchFilter;

      // SLA delay filter & Feedback Pending filter
      let matchesSlaDelay = true;
      if (slaDelayFilter === 'feedback_pending') {
        matchesSlaDelay = (t.status === 'Resolved' || t.status === 'Closed') && (!t.rating || t.rating === 0);
      } else if (slaDelayFilter !== 'all') {
        const delayInfo = getTicketDelayInfo(t);
        matchesSlaDelay = delayInfo.category === slaDelayFilter;
      }

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesPriority &&
        matchesCategory &&
        matchesModule &&
        matchesSubCategory &&
        matchesDepartment &&
        matchesBranch &&
        matchesSlaDelay
      );
    });
  }, [
    scopedTickets,
    dateFilter,
    customStart,
    customEnd,
    globalSearchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    categoryFilter,
    moduleFilter,
    subCategoryFilter,
    departmentFilter,
    branchFilter,
    slaDelayFilter
  ]);

  // Priority weight mapping
  const priorityWeight: { [key: string]: number } = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1
  };

  // Status weight mapping
  const statusWeight: { [key: string]: number } = {
    Open: 1,
    'In Progress': 2,
    Pending: 3,
    Resolved: 4,
    Closed: 5
  };

  // Sorted tickets
  const sortedTickets = useMemo(() => {
    const list = [...filteredTickets];

    list.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
          break;
        case 'subject':
          comparison = (a.subject || '').localeCompare(b.subject || '');
          break;
        case 'ticketType':
          comparison = (a.ticketType || '').localeCompare(b.ticketType || '');
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'subCategory':
          comparison = (a.subCategory || '').localeCompare(b.subCategory || '');
          break;
        case 'department':
          comparison = (a.department || '').localeCompare(b.department || '');
          break;
        case 'priority':
          comparison = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
          break;
        case 'status':
          comparison = (statusWeight[a.status] || 0) - (statusWeight[b.status] || 0);
          break;
        case 'slaStatus':
          comparison = (a.slaStatus || '').localeCompare(b.slaStatus || '');
          break;
        case 'assignedAgentName':
          comparison = (a.assignedAgentName || 'Unassigned').localeCompare(b.assignedAgentName || 'Unassigned');
          break;
        case 'slaDueDate':
          const dueA = a.slaDueDate ? new Date(a.slaDueDate).getTime() : 0;
          const dueB = b.slaDueDate ? new Date(b.slaDueDate).getTime() : 0;
          comparison = dueA - dueB;
          break;
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0);
          break;
        case 'createdDate':
        default:
          const dateA = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const dateB = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [filteredTickets, sortField, sortOrder]);

  // Reset page to 1 whenever filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    globalSearchQuery,
    statusFilter,
    typeFilter,
    priorityFilter,
    categoryFilter,
    moduleFilter,
    subCategoryFilter,
    departmentFilter,
    branchFilter,
    slaDelayFilter,
    relationshipScope,
    dateFilter,
    customStart,
    customEnd,
    pageSize
  ]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedTickets.length / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, sortedTickets.length);
  const paginatedTickets = sortedTickets.slice(startIndex, endIndex);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'createdDate' || field === 'priority' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-gray-300 group-hover:text-gray-500 shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-blue-600 shrink-0" />
    ) : (
      <ArrowDown className="w-3 h-3 text-blue-600 shrink-0" />
    );
  };

  const uniqueTypes = Array.from(new Set(['Modification Request', 'New Request', 'Support / How-To', 'Approval Request', 'Verification Request', 'Issue / Bug', ...scopedTickets.map(t => t.ticketType).filter(Boolean) as string[]]));
  const uniqueCategories = Array.from(new Set([...categories.map(c => c.name), ...scopedTickets.map(t => t.category)]));
  const uniqueModules = Array.from(new Set(scopedTickets.map(t => t.module).filter(Boolean) as string[]));
  const uniqueSubCategories = Array.from(new Set(scopedTickets.map(t => t.subCategory).filter(Boolean) as string[]));
  const uniqueDepartments = Array.from(new Set([...departments.map(d => d.name), ...scopedTickets.map(t => t.department)]));
  const uniqueBranches = Array.from(new Set([...branches, ...scopedTickets.map(t => t.location)]));

  const demoIdSet = new Set([
    'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
    'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
    'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
  ]);
  const scopedRealCount = scopedTickets.filter(t => !t.isDemoTicket && !demoIdSet.has(t.id) && !t.employeeEmail?.toLowerCase().endsWith('@company.com')).length;
  const scopedDemoCount = scopedTickets.length - scopedRealCount;

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Direction', 'Request Type', 'Subject', 'Employee', 'Email', 'Department', 'Location', 'Category', 'Module', 'Sub-Category', 'Priority', 'Status', 'SLA Delay Status', 'Assigned Agent', 'Created Date', 'SLA Due Date'];
    const rows = sortedTickets.map(t => {
      const rel = getTicketRelationship(t, currentUser);
      const delay = getTicketDelayInfo(t);
      return [
        t.id,
        `"${rel.badgeLabel}"`,
        `"${t.ticketType || 'Standard'}"`,
        `"${t.subject.replace(/"/g, '""')}"`,
        `"${t.employeeName}"`,
        `"${t.employeeEmail || ''}"`,
        `"${t.department}"`,
        `"${t.location}"`,
        `"${t.category}"`,
        `"${t.module || ''}"`,
        `"${t.subCategory}"`,
        t.priority,
        t.status,
        `"${delay.statusLabel} - ${delay.subLabel}"`,
        `"${t.assignedAgentName || 'Unassigned'}"`,
        formatDateTime(t.createdDate),
        t.slaDueDate ? formatDateTime(t.slaDueDate) : 'N/A'
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
    <div className="p-4 md:p-6 space-y-4 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {isEmployee ? 'My Support Tickets' : 'Enterprise Ticket Directory'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
              {isEmployee
                ? `${scopedTickets.length} Your Requests`
                : `${scopedTickets.length} Active Tickets`}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {isEmployee
              ? `All tickets registered under your employee ID (${currentUser?.employeeId || 'N/A'}) and email (${currentUser?.email || 'N/A'}).`
              : 'Track raised tickets, incoming assignments, real-time SLA delay warnings, and Google Sheets sync status.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Live Refresh Button */}
          <RefreshButton
            id="ticket-directory-refresh-btn"
            variant="pill"
            showTimestamp={true}
            label="Refresh Sheet Data"
          />

          {/* Purge Demo Tickets if any detected */}
          {isDemoDataActive && (
            <button
              onClick={clearMockupTickets}
              className="px-3 py-1.5 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
              title="Remove sample mockup tickets and display only real tickets"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear Demo Data</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateTicketOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>+ Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Pull Feedback Toast Alert */}
      {pullMessage && (
        <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{pullMessage}</span>
          </div>
          <button onClick={() => setPullMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold ml-4 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Ticket Perspective Switcher Tabs (Raised by Me vs Assigned to Me vs Department vs All) */}
      {!isEmployee && (
        <div className="bg-white p-1.5 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest px-2 py-1">
            Perspective:
          </span>

          <button
            onClick={() => setRelationshipScope('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
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
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              relationshipScope === 'raised_by_me'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50/60 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>📤 Raised by Me</span>
            <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-900 rounded-full text-[10px] font-extrabold">{countRaisedByMe}</span>
          </button>

          <button
            onClick={() => setRelationshipScope('assigned_to_me')}
            className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              relationshipScope === 'assigned_to_me'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>📥 Assigned to Me</span>
            <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">{countAssignedToMe}</span>
          </button>

          {currentUser?.department && (
            <button
              onClick={() => setRelationshipScope('dept')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                relationshipScope === 'dept'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50/60 text-blue-800 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              <Building className="w-3.5 h-3.5" />
              <span>🏢 {currentUser.department} Dept</span>
              <span className="px-1.5 py-0.2 bg-blue-200 text-blue-900 rounded-full text-[10px] font-extrabold">{countMyDept}</span>
            </button>
          )}
        </div>
      )}

      {/* SLA & Delay Status Quick Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'breached' ? 'all' : 'breached')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'breached'
              ? 'bg-red-500 text-white border-red-600 shadow-md scale-[1.01]'
              : 'bg-white hover:bg-red-50/50 border-red-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'breached' ? 'text-red-100' : 'text-red-600'}`}>
              <Flame className="w-3 h-3" />
              Overdue / Breached
            </p>
            <p className="text-lg font-black mt-0.5">{slaMetrics.breached}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'breached' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'}`}>
            Overdue
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'due_soon' ? 'all' : 'due_soon')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'due_soon'
              ? 'bg-amber-500 text-white border-amber-600 shadow-md scale-[1.01]'
              : 'bg-white hover:bg-amber-50/50 border-amber-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'due_soon' ? 'text-amber-100' : 'text-amber-600'}`}>
              <Timer className="w-3 h-3" />
              Due Soon (&lt;4h)
            </p>
            <p className="text-lg font-black mt-0.5">{slaMetrics.dueSoon}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'due_soon' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'}`}>
            Expiring
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'safe' ? 'all' : 'safe')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'safe'
              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md scale-[1.01]'
              : 'bg-white hover:bg-emerald-50/50 border-emerald-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'safe' ? 'text-emerald-100' : 'text-emerald-600'}`}>
              <CheckCircle2 className="w-3 h-3" />
              On Track (Safe)
            </p>
            <p className="text-lg font-black mt-0.5">{slaMetrics.safe}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'safe' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
            Healthy
          </span>
        </button>

        <button
          onClick={() => setSlaDelayFilter(slaDelayFilter === 'resolved' ? 'all' : 'resolved')}
          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
            slaDelayFilter === 'resolved'
              ? 'bg-gray-800 text-white border-gray-900 shadow-md scale-[1.01]'
              : 'bg-white hover:bg-gray-100/70 border-gray-200 text-gray-900 shadow-2xs'
          }`}
        >
          <div>
            <p className={`text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1 ${slaDelayFilter === 'resolved' ? 'text-gray-200' : 'text-gray-500'}`}>
              <CheckCircle className="w-3 h-3" />
              Resolved / Closed
            </p>
            <p className="text-lg font-black mt-0.5">{slaMetrics.resolved}</p>
          </div>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${slaDelayFilter === 'resolved' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'}`}>
            Done
          </span>
        </button>
      </div>

      {/* FEEDBACK PENDING PROMINENT BANNER */}
      {feedbackPendingCount > 0 && (
        <div className="p-3 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-3 shadow-xs flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
              <Star className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                <span>⭐ {feedbackPendingCount} Resolved Ticket{feedbackPendingCount > 1 ? 's' : ''} Pending Rating & Feedback</span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-extrabold bg-amber-200 text-amber-900 border border-amber-400 animate-pulse">
                  Action Required
                </span>
              </p>
              <p className="text-[11px] text-amber-800">
                Tickets are marked resolved. Click on the 5-star rater in the table to submit your feedback (locks automatically after submit).
              </p>
            </div>
          </div>
          <button
            onClick={() => setSlaDelayFilter(slaDelayFilter === 'feedback_pending' ? 'all' : 'feedback_pending')}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
              slaDelayFilter === 'feedback_pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white hover:bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current text-amber-500" />
            <span>{slaDelayFilter === 'feedback_pending' ? '✓ Showing Pending Feedback' : 'Filter Pending Feedback Only'}</span>
          </button>
        </div>
      )}

      {/* Comprehensive Filter Bar with Date Range Integration */}
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          {/* Date Range Filter */}
          <DateRangeFilter
            value={dateFilter}
            onChange={(f, s, e) => {
              setDateFilter(f);
              if (s !== undefined) setCustomStart(s);
              if (e !== undefined) setCustomEnd(e);
            }}
            customStartDate={customStart}
            customEndDate={customEnd}
          />

          {/* Quick Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={e => setGlobalSearchQuery(e.target.value)}
              placeholder="Search by ID, Subject, Requester, Module, Email..."
              className="w-full pl-8 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-blue-500 transition-all"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters Line */}
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100 text-xs">
          <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 mr-1">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters:</span>
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs"
          >
            <option value="All">Status: All</option>
            {statusesList.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-bold text-blue-900 shadow-2xs"
          >
            <option value="All">Request Type: All</option>
            {uniqueTypes.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs"
          >
            <option value="All">Priority: All</option>
            {prioritiesList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs"
          >
            <option value="All">Category: All</option>
            {uniqueCategories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-indigo-900 shadow-2xs"
          >
            <option value="All">Module: All</option>
            {uniqueModules.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          <select
            value={subCategoryFilter}
            onChange={e => setSubCategoryFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-purple-200 rounded-lg text-xs font-semibold text-purple-900 shadow-2xs"
          >
            <option value="All">Sub-Category: All</option>
            {uniqueSubCategories.map(sc => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>

          <select
            value={departmentFilter}
            onChange={e => setDepartmentFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs"
          >
            <option value="All">Dept: All</option>
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={branchFilter}
            onChange={e => setBranchFilter(e.target.value)}
            className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 shadow-2xs"
          >
            <option value="All">Branch: All</option>
            {uniqueBranches.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          {(statusFilter !== 'All' ||
            typeFilter !== 'All' ||
            priorityFilter !== 'All' ||
            categoryFilter !== 'All' ||
            moduleFilter !== 'All' ||
            subCategoryFilter !== 'All' ||
            departmentFilter !== 'All' ||
            branchFilter !== 'All' ||
            slaDelayFilter !== 'all' ||
            relationshipScope !== 'all' ||
            dateFilter !== 'all' ||
            globalSearchQuery !== '') && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setTypeFilter('All');
                setPriorityFilter('All');
                setCategoryFilter('All');
                setModuleFilter('All');
                setSubCategoryFilter('All');
                setDepartmentFilter('All');
                setBranchFilter('All');
                setSlaDelayFilter('all');
                setRelationshipScope('all');
                setDateFilter('all');
                setCustomStart('');
                setCustomEnd('');
                setGlobalSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold ml-auto cursor-pointer"
            >
              Reset All
            </button>
          )}
        </div>
      </div>

      {/* Main Ticket Directory Table with Sorting, Compact Rows, and Pagination */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {/* Table Top Status Bar */}
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/80 flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-700">
              {isEmployee
                ? `Showing ${sortedTickets.length} of ${scopedTickets.length} tickets registered for you`
                : `Showing ${sortedTickets.length} of ${scopedTickets.length} tickets in view`}
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
            <span className="text-[11px] text-gray-400">
              (Click column header to sort)
            </span>
          </div>

          {/* Show Entries Selector (Top) */}
          <div className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => setPageSize(Number(e.target.value))}
              className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-800 outline-none focus:border-blue-500 shadow-2xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries</span>
          </div>
        </div>

        {/* Scrollable Compact Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-50/50 select-none">
                {/* Column Headers with Interactive Sorting */}
                <th
                  onClick={() => handleSort('id')}
                  className="px-3 py-2.5 w-28 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Ticket ID</span>
                    {renderSortIcon('id')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('subject')}
                  className="px-3 py-2.5 min-w-[220px] max-w-[300px] cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Subject & Requester</span>
                    {renderSortIcon('subject')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('ticketType')}
                  className="px-3 py-2.5 w-32 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Type</span>
                    {renderSortIcon('ticketType')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('category')}
                  className="px-3 py-2.5 w-32 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Category & Module</span>
                    {renderSortIcon('category')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('subCategory')}
                  className="px-3 py-2.5 w-36 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Sub-Category</span>
                    {renderSortIcon('subCategory')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('department')}
                  className="px-3 py-2.5 w-24 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Dept / Loc</span>
                    {renderSortIcon('department')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('priority')}
                  className="px-3 py-2.5 w-20 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    {renderSortIcon('priority')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('status')}
                  className="px-3 py-2.5 w-24 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    {renderSortIcon('status')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('rating')}
                  className="px-3 py-2.5 min-w-[155px] cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Feedback & Rating</span>
                    {renderSortIcon('rating')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('slaDueDate')}
                  className="px-3 py-2.5 w-36 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>SLA / Due</span>
                    {renderSortIcon('slaDueDate')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('assignedAgentName')}
                  className="px-3 py-2.5 w-28 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Agent</span>
                    {renderSortIcon('assignedAgentName')}
                  </div>
                </th>

                <th
                  onClick={() => handleSort('createdDate')}
                  className="px-3 py-2.5 w-28 cursor-pointer hover:bg-gray-100/70 transition-colors group"
                >
                  <div className="flex items-center gap-1">
                    <span>Created Date</span>
                    {renderSortIcon('createdDate')}
                  </div>
                </th>

                <th className="px-3 py-2.5 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-12 text-gray-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
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
                          className="mt-3 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
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
                paginatedTickets.map(t => {
                  const isDemo = t.isDemoTicket || ['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id);
                  const rel = getTicketRelationship(t, currentUser);
                  const delay = getTicketDelayInfo(t);

                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    >
                      {/* Ticket ID & Origin Badge */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-blue-600 text-xs">{t.id}</span>
                          {isDemo ? (
                            <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200">
                              Demo
                            </span>
                          ) : (
                            <span className="text-[8px] font-extrabold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200">
                              Live
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className={`inline-flex items-center gap-0.5 text-[8px] px-1 py-0.2 rounded border font-bold ${rel.badgeClass}`}>
                            {rel.iconType === 'raised' && <ArrowUpRight className="w-2 h-2" />}
                            {rel.iconType === 'assigned' && <ArrowDownLeft className="w-2 h-2" />}
                            {rel.badgeLabel}
                          </span>
                        </div>
                      </td>

                      {/* Subject & Requester (Compact Single/Two Line) */}
                      <td className="px-3 py-2 min-w-[220px] max-w-[300px]">
                        <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate" title={t.subject}>
                          {t.subject}
                        </p>
                        <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate mt-0.5">
                          <span className="font-semibold text-gray-700">{t.employeeName}</span>
                          {t.employeeEmail && (
                            <span className="text-gray-400 font-mono text-[9px] truncate">
                              • {t.employeeEmail}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Ticket Type */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border text-blue-800 bg-blue-50 border-blue-200">
                          {t.ticketType || 'Standard'}
                        </span>
                      </td>

                      {/* Category & Module */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-bold text-gray-900 text-xs block">{t.category}</span>
                        {t.module && (
                          <span className="inline-block mt-0.5 px-1 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {t.module}
                          </span>
                        )}
                      </td>

                      {/* Sub-Category */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 max-w-[140px] truncate"
                          title={t.subCategory}
                        >
                          {t.subCategory || '-'}
                        </span>
                      </td>

                      {/* Department & Branch */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className="font-semibold text-gray-800 block text-xs">{t.department}</span>
                        <span className="text-[9px] text-gray-400 font-mono">{t.location || 'HQ'}</span>
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 text-[9px] rounded uppercase font-extrabold ${
                          t.priority === 'Critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                          t.priority === 'High' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                          'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          {t.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'Open' ? 'text-blue-700 bg-blue-50 border border-blue-200' :
                          t.status === 'In Progress' ? 'text-orange-700 bg-orange-50 border border-orange-200' :
                          t.status === 'Pending' ? 'text-amber-700 bg-amber-50 border border-amber-200' :
                          t.status === 'Resolved' ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' :
                          'text-gray-700 bg-gray-100 border border-gray-200'
                        }`}>
                          {t.status}
                        </span>
                      </td>

                      {/* Feedback & Star Rating Cell */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        {t.status === 'Resolved' || t.status === 'Closed' ? (
                          <TicketRatingWidget ticket={t} variant="inline" />
                        ) : (
                          <span className="text-gray-300 text-[10px] font-mono select-none">
                            —
                          </span>
                        )}
                      </td>

                      {/* SLA Status & Delay */}
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-bold ${delay.badgeClass}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${delay.dotColor} shrink-0`} />
                          <span>{delay.statusLabel}</span>
                        </div>
                        {t.slaDueDate && (
                          <div className="text-[9px] text-gray-400 font-mono mt-0.5">
                            {formatDateTime(t.slaDueDate)}
                          </div>
                        )}
                      </td>

                      {/* Assigned Agent */}
                      <td className="px-3 py-2 whitespace-nowrap text-gray-700 font-medium">
                        {t.assignedAgentName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-900 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-[10px]">
                            <UserCheck className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-24">{t.assignedAgentName}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-[10px]">Unassigned</span>
                        )}
                      </td>

                      {/* Created Date */}
                      <td className="px-3 py-2 whitespace-nowrap text-gray-600 font-mono text-[10px]">
                        {formatDateTime(t.createdDate)}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2 whitespace-nowrap text-center">
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
                            className="p-1 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded border border-blue-200 transition-all cursor-pointer"
                            title={`Send Email to ${t.employeeEmail}`}
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                          <button className="p-1 hover:bg-white border border-transparent hover:border-gray-200 rounded transition-all cursor-pointer">
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-600" />
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

        {/* Enhanced Pagination Footer Bar */}
        <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3 bg-gray-50/70 text-xs">
          {/* Entries Info */}
          <div className="text-gray-600 font-medium">
            {sortedTickets.length === 0 ? (
              'Showing 0 to 0 of 0 entries'
            ) : (
              <span>
                Showing <span className="font-bold text-gray-900">{startIndex + 1}</span> to{' '}
                <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
                <span className="font-bold text-gray-900">{sortedTickets.length}</span> entries
              </span>
            )}
          </div>

          {/* Pagination Navigation */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                onClick={() => setCurrentPage(1)}
                disabled={validCurrentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 cursor-pointer shadow-2xs"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              {/* Previous Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={validCurrentPage === 1}
                className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold flex items-center gap-1 cursor-pointer shadow-2xs text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Prev</span>
              </button>

              {/* Page Number Buttons */}
              <div className="flex items-center gap-1 mx-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Show first page, last page, and current +/- 2 pages
                    if (p === 1 || p === totalPages) return true;
                    if (Math.abs(p - validCurrentPage) <= 1) return true;
                    return false;
                  })
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((item, idx) => {
                    if (item === '...') {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const isCurrent = item === validCurrentPage;
                    return (
                      <button
                        key={`page-${item}`}
                        onClick={() => setCurrentPage(item as number)}
                        className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
              </div>

              {/* Next Page */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={validCurrentPage === totalPages}
                className="px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-700 font-bold flex items-center gap-1 cursor-pointer shadow-2xs text-xs"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {/* Last Page */}
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={validCurrentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-gray-600 cursor-pointer shadow-2xs"
                title="Last Page"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
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

