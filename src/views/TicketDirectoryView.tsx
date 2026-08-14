import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { TicketPriority, TicketStatus } from '../types';
import { SendEmailModal } from '../components/SendEmailModal';

export const TicketDirectoryView: React.FC = () => {
  const {
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

  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [branchFilter, setBranchFilter] = useState<string>('All');
  const [slaFilter, setSlaFilter] = useState<string>('All');
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

  const filteredTickets = tickets.filter(t => {
    const matchesSearch =
      !globalSearchQuery ||
      t.id.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.employeeName.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.department.toLowerCase().includes(globalSearchQuery.toLowerCase()) ||
      t.location.toLowerCase().includes(globalSearchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || t.status === statusFilter;
    const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
    const matchesDepartment = departmentFilter === 'All' || t.department === departmentFilter;
    const matchesBranch = branchFilter === 'All' || t.location === branchFilter;
    const matchesSla = slaFilter === 'All' || t.slaStatus === slaFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesCategory &&
      matchesDepartment &&
      matchesBranch &&
      matchesSla
    );
  });

  const uniqueCategories = Array.from(new Set([...categories.map(c => c.name), ...tickets.map(t => t.category)]));
  const uniqueDepartments = Array.from(new Set([...departments.map(d => d.name), ...tickets.map(t => t.department)]));
  const uniqueBranches = Array.from(new Set([...branches, ...tickets.map(t => t.location)]));

  const handleExportCSV = () => {
    const headers = ['Ticket ID', 'Subject', 'Employee', 'Department', 'Category', 'Priority', 'Status', 'Assigned Agent', 'Created Date', 'SLA Status'];
    const rows = filteredTickets.map(t => [
      t.id,
      `"${t.subject.replace(/"/g, '""')}"`,
      `"${t.employeeName}"`,
      `"${t.department}"`,
      `"${t.category}"`,
      t.priority,
      t.status,
      `"${t.assignedAgentName || 'Unassigned'}"`,
      new Date(t.createdDate).toLocaleDateString(),
      t.slaStatus
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `HelpDesk_Tickets_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Master Ticket Directory</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {realTicketsCount} Real • {demoTicketsCount} Demo
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Search, filter, and audit all enterprise support tickets registered across departments and synced to Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pull from Google Sheets Button */}
          <button
            onClick={handlePullData}
            disabled={isPulling}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
            title="Fetch real tickets directly from Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
            <span>{isPulling ? 'Fetching Sheet...' : 'Pull from Google Sheet'}</span>
          </button>

          {/* Purge / Restore Demo Tickets */}
          {isDemoDataActive ? (
            <button
              onClick={clearMockupTickets}
              className="px-3.5 py-2 bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Remove sample mockup tickets and display only real tickets"
            >
              <Trash2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear Mockup ({demoTicketsCount})</span>
            </button>
          ) : (
            <button
              onClick={restoreDemoTickets}
              className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
              title="Restore demo tickets for testing"
            >
              <Sparkles className="w-3.5 h-3.5 text-gray-500" />
              <span>Restore Demo</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsCreateTicketOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
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

      {/* Demo Mockup Data Active Notice */}
      {isDemoDataActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-200/80 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-amber-800" />
            </div>
            <div>
              <span className="font-bold">Mockup Demo Tickets Present:</span> Currently displaying {demoTicketsCount} sample mockup tickets alongside {realTicketsCount} real ticket(s).
              Click <button onClick={handlePullData} className="font-bold underline text-amber-950 hover:text-blue-700">Pull from Google Sheet</button> to sync real tickets directly, or <button onClick={clearMockupTickets} className="font-bold underline text-amber-950 hover:text-red-700">Clear Mockup Data</button> to see only real records.
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={clearMockupTickets}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs transition-colors"
            >
              Clear Mockup
            </button>
          </div>
        </div>
      )}

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

        <select
          value={slaFilter}
          onChange={e => setSlaFilter(e.target.value)}
          className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800"
        >
          <option value="All">SLA Status: All</option>
          <option value="Safe">Safe</option>
          <option value="Due Soon">Due Soon</option>
          <option value="Breached">Breached</option>
        </select>

        {(statusFilter !== 'All' || priorityFilter !== 'All' || categoryFilter !== 'All' || departmentFilter !== 'All' || slaFilter !== 'All') && (
          <button
            onClick={() => {
              setStatusFilter('All');
              setPriorityFilter('All');
              setCategoryFilter('All');
              setDepartmentFilter('All');
              setSlaFilter('All');
            }}
            className="text-xs text-blue-600 hover:underline font-bold ml-auto"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <span className="text-xs font-bold text-gray-600">
            Showing {filteredTickets.length} of {tickets.length} total tickets ({realTicketsCount} real, {demoTicketsCount} demo)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-6 py-3 w-32">Ticket ID & Sync</th>
                <th className="px-6 py-3">Subject & Employee</th>
                <th className="px-6 py-3 w-32">Department</th>
                <th className="px-6 py-3 w-28">Priority</th>
                <th className="px-6 py-3 w-32">Status</th>
                <th className="px-6 py-3 w-36">Assigned Agent</th>
                <th className="px-6 py-3 w-28">Created Date</th>
                <th className="px-6 py-3 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No tickets found matching current query and filter parameters.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(t => {
                  const isDemo = t.isDemoTicket || ['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id);
                  return (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono font-bold text-blue-600 text-xs">{t.id}</div>
                        {isDemo ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-sans font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1 shadow-2xs">
                            <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                            <span>Demo Mockup</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-sans font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            <span>Google Sheet Live</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{t.subject}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-gray-500 font-mono">{t.category} • {t.employeeName}</span>
                          {t.employeeEmail && (
                            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 font-bold">
                              {t.employeeEmail}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">{t.department}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                          t.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                          t.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                          t.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-800">{t.status}</span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 font-medium">
                        {t.assignedAgentName ? (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            {t.assignedAgentName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-500 font-mono text-[11px]">
                        {new Date(t.createdDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 text-center">
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
                            className="p-1.5 hover:bg-blue-50 text-blue-600 hover:text-blue-800 rounded border border-blue-200 transition-all"
                            title={`Send Email to ${t.employeeEmail}`}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1.5 hover:bg-white border border-transparent hover:border-gray-200 rounded transition-all">
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
