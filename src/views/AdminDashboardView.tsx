import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Ticket,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  Users,
  Building2,
  Calendar,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { DateRangeFilter } from '../components/DateRangeFilter';
import { DateRangeFilterType, isDateInRange, getDateRangeLabel, formatDateTime } from '../utils/dateUtils';
import { RefreshButton } from '../components/RefreshButton';

export const AdminDashboardView: React.FC = () => {
  const { tickets, users, departments, categories, slaRules, setSelectedTicketId, currentUser } = useApp();

  const [dateFilter, setDateFilter] = useState<DateRangeFilterType>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('All');

  // Filter tickets by selected date range
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => isDateInRange(t.createdDate, dateFilter, customStart, customEnd));
  }, [tickets, dateFilter, customStart, customEnd]);

  // Metrics based on filtered tickets
  const totalTickets = filteredTickets.length;
  const openCount = filteredTickets.filter(t => t.status === 'Open').length;
  const inProgressCount = filteredTickets.filter(t => t.status === 'In Progress').length;
  const pendingCount = filteredTickets.filter(t => t.status === 'Pending').length;
  const resolvedCount = filteredTickets.filter(t => t.status === 'Resolved').length;
  const closedCount = filteredTickets.filter(t => t.status === 'Closed').length;
  const slaBreached = filteredTickets.filter(t => t.slaStatus === 'Breached').length;

  const slaCompliancePct = totalTickets > 0 ? (((totalTickets - slaBreached) / totalTickets) * 100).toFixed(1) : '100';

  // Priority Distribution Chart Data
  const priorityData = [
    { name: 'Critical', value: filteredTickets.filter(t => t.priority === 'Critical').length, color: '#EF4444' },
    { name: 'High', value: filteredTickets.filter(t => t.priority === 'High').length, color: '#F97316' },
    { name: 'Medium', value: filteredTickets.filter(t => t.priority === 'Medium').length, color: '#3B82F6' },
    { name: 'Low', value: filteredTickets.filter(t => t.priority === 'Low').length, color: '#6B7280' }
  ];

  // Department Breakdown Data
  const departmentData = departments.map(d => ({
    name: (d.name || 'Dept').replace('&', 'and').split(' ')[0],
    count: filteredTickets.filter(t => t.department === d.name).length
  }));

  // Category Distribution (Hierarchy Level 2 - Orbit, FMS, Hardware, etc.)
  const categoryCountMap: { [cat: string]: number } = {};
  categories.forEach(c => {
    categoryCountMap[c.name] = 0;
  });
  filteredTickets.forEach(t => {
    if (t.category) {
      categoryCountMap[t.category] = (categoryCountMap[t.category] || 0) + 1;
    }
  });
  const categoryData = Object.entries(categoryCountMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name,
      count
    }));

  // Ticket Request Type Distribution
  const typeLabels = ['Modification Request', 'New Request', 'Support / How-To', 'Approval Request', 'Verification Request', 'Issue / Bug'];
  const ticketTypeData = typeLabels.map(tType => ({
    name: tType.replace('Request', 'Req').replace('Support / How-To', 'How-To'),
    fullName: tType,
    count: filteredTickets.filter(t => t.ticketType === tType).length
  })).filter(d => d.count > 0 || true);

  // Module Breakdown Data
  const moduleCounts: { [key: string]: number } = {};
  filteredTickets.forEach(t => {
    if (t.module) {
      moduleCounts[t.module] = (moduleCounts[t.module] || 0) + 1;
    }
  });
  const topModulesData = Object.entries(moduleCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([mod, count]) => ({
      name: mod,
      count
    }));

  // Monthly Trend Data
  const monthlyData = [
    { month: 'Mar', created: 18, resolved: 16 },
    { month: 'Apr', created: 24, resolved: 22 },
    { month: 'May', created: 30, resolved: 28 },
    { month: 'Jun', created: 35, resolved: 33 },
    { month: 'Jul', created: 42, resolved: 39 },
    { month: 'Aug', created: filteredTickets.length, resolved: resolvedCount + closedCount }
  ];

  const handleDateFilterChange = (newFilter: DateRangeFilterType, s?: string, e?: string) => {
    setDateFilter(newFilter);
    if (s !== undefined) setCustomStart(s);
    if (e !== undefined) setCustomEnd(e);
  };

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Admin Title & Date Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              Enterprise Help Desk Command Center
            </h1>
            <span className="text-xs px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              {currentUser?.role === 'Super Admin' ? 'Super Admin: All Company Data (Global)' : 'Admin: Enterprise Scope'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Global ticket volume trends, department SLA compliance, resource workload, and enterprise-wide ticket streaming.
          </p>
        </div>

        {/* Actions & Dynamic Multi-Period Date Filter Component */}
        <div className="flex items-center gap-2.5">
          <RefreshButton
            id="admin-dashboard-refresh-btn"
            variant="default"
            showTimestamp={true}
            label="Refresh Central Data"
          />
          <DateRangeFilter
            value={dateFilter}
            onChange={handleDateFilterChange}
            customStartDate={customStart}
            customEndDate={customEnd}
          />
        </div>
      </div>

      {/* Top 8 Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Volume</p>
          <span className="text-2xl font-bold text-gray-900">{totalTickets}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Open</p>
          <span className="text-2xl font-bold text-blue-600">{openCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">In Progress</p>
          <span className="text-2xl font-bold text-orange-600">{inProgressCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Pending</p>
          <span className="text-2xl font-bold text-amber-600">{pendingCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Resolved</p>
          <span className="text-2xl font-bold text-green-600">{resolvedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Closed</p>
          <span className="text-2xl font-bold text-gray-600">{closedCount}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-2xs">
          <p className="text-[9px] font-bold text-red-500 uppercase tracking-widest mb-1">SLA Breached</p>
          <span className="text-2xl font-bold text-red-600">{slaBreached}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-green-200 bg-green-50/20 shadow-2xs">
          <p className="text-[9px] font-bold text-green-600 uppercase tracking-widest mb-1">SLA Rate</p>
          <span className="text-2xl font-bold text-green-700">{slaCompliancePct}%</span>
        </div>
      </div>

      {/* Analytics Charts Grid (4 Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Request Type Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Ticket Type Distribution (Hierarchy Level 1)</h3>
              <p className="text-[10px] text-gray-400">Modification, New Request, How-To, Approval & Bug volume</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200">
              {typeLabels.length} Types
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ticketTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#4B5563' }} angle={-15} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#3B82F6" name="Tickets" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Modules Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Top ERP / IT Modules (Hierarchy Level 3)</h3>
              <p className="text-[10px] text-gray-400">Most active functional modules across categories</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 bg-indigo-50 text-indigo-700 rounded border border-indigo-200">
              Module Volume
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={topModulesData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4B5563', fontWeight: 600 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#6366F1" name="Tickets" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Ticket Priority Share</h3>
              <p className="text-[10px] text-gray-400">Critical vs High vs Medium vs Low breakdown</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Top Categories Breakdown (Hierarchy Level 2)</h3>
              <p className="text-[10px] text-gray-400">Most frequent support request categories</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#4B5563' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" name="Tickets" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Live Enterprise Ticket Stream (All Departments) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-wrap gap-3">
          <div>
            <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <Ticket className="w-4 h-4 text-purple-600" />
              Live Enterprise Ticket Feed (All Departments & Hierarchy)
            </h2>
            <p className="text-[11px] text-gray-400">
              Showing real-time tickets logged across all employees, departments, and full 4-tier categorization.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
            {['All', 'Open', 'In Progress', 'Pending', 'Resolved'].map(st => (
              <button
                key={st}
                onClick={() => setTicketStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-all text-xs cursor-pointer ${
                  ticketStatusFilter === st
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-white">
                <th className="px-4 py-3 w-28">Ticket ID</th>
                <th className="px-4 py-3 min-w-[150px]">Requester & Dept</th>
                <th className="px-4 py-3 min-w-[180px]">Subject</th>
                <th className="px-4 py-3 min-w-[120px]">Ticket Type</th>
                <th className="px-4 py-3 min-w-[130px]">Category & Module</th>
                <th className="px-4 py-3 min-w-[140px]">Sub-Category / Action Item</th>
                <th className="px-4 py-3 w-20">Priority</th>
                <th className="px-4 py-3 w-24">Status</th>
                <th className="px-4 py-3 w-32">Assigned Agent</th>
                <th className="px-4 py-3 w-28">Logged Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredTickets
                .filter(t => ticketStatusFilter === 'All' || t.status === ticketStatusFilter)
                .slice(0, 15)
                .map((t, idx) => (
                  <tr
                    key={`${t.id}-${idx}`}
                    onClick={() => setSelectedTicketId(t.id)}
                    className="hover:bg-purple-50/30 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-bold text-purple-600">{t.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{t.employeeName}</p>
                      <p className="text-[10px] text-gray-400">{t.department} • {t.location || 'HQ'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 line-clamp-1">{t.subject}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold border text-blue-800 bg-blue-50/80 border-blue-200">
                        {t.ticketType || 'Standard'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900 text-xs">{t.category}</p>
                      {t.module && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {t.module}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-800 border border-purple-200 max-w-[150px] truncate" title={t.subCategory}>
                        {t.subCategory}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                        t.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                        t.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                        t.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        t.status === 'Open' ? 'text-blue-600 bg-blue-50' :
                        t.status === 'In Progress' ? 'text-orange-600 bg-orange-50' :
                        t.status === 'Pending' ? 'text-amber-600 bg-amber-50' :
                        t.status === 'Resolved' ? 'text-emerald-600 bg-emerald-50' :
                        'text-gray-600 bg-gray-100'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-medium">
                      {t.assignedAgentName || <span className="text-gray-400 italic font-normal">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-[11px]">
                      {formatDateTime(t.createdDate) || t.createdDate}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
