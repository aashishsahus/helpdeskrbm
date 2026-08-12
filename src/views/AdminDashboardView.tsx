import React, { useState } from 'react';
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
  CheckCircle2
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const { tickets, users, departments, categories, slaRules } = useApp();

  const [dateFilter, setDateFilter] = useState<'thisMonth' | 'lastMonth' | 'all'>('all');

  // Metrics
  const totalTickets = tickets.length;
  const openCount = tickets.filter(t => t.status === 'Open').length;
  const inProgressCount = tickets.filter(t => t.status === 'In Progress').length;
  const pendingCount = tickets.filter(t => t.status === 'Pending').length;
  const resolvedCount = tickets.filter(t => t.status === 'Resolved').length;
  const closedCount = tickets.filter(t => t.status === 'Closed').length;
  const slaBreached = tickets.filter(t => t.slaStatus === 'Breached').length;

  const slaCompliancePct = totalTickets > 0 ? (((totalTickets - slaBreached) / totalTickets) * 100).toFixed(1) : '100';

  // Priority Distribution Chart Data
  const priorityData = [
    { name: 'Critical', value: tickets.filter(t => t.priority === 'Critical').length, color: '#EF4444' },
    { name: 'High', value: tickets.filter(t => t.priority === 'High').length, color: '#F97316' },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'Medium').length, color: '#3B82F6' },
    { name: 'Low', value: tickets.filter(t => t.priority === 'Low').length, color: '#6B7280' }
  ];

  // Department Breakdown Data
  const departmentData = departments.map(d => ({
    name: d.name.replace('&', 'and').split(' ')[0],
    count: tickets.filter(t => t.department === d.name).length
  }));

  // Category Distribution
  const categoryData = categories.slice(0, 6).map(c => ({
    name: c.name,
    count: tickets.filter(t => t.category === c.name).length
  }));

  // Monthly Trend Data
  const monthlyData = [
    { month: 'Mar', created: 18, resolved: 16 },
    { month: 'Apr', created: 24, resolved: 22 },
    { month: 'May', created: 30, resolved: 28 },
    { month: 'Jun', created: 35, resolved: 33 },
    { month: 'Jul', created: 42, resolved: 39 },
    { month: 'Aug', created: tickets.length, resolved: resolvedCount + closedCount }
  ];

  return (
    <div className="p-8 space-y-8 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Admin Title & Date Filter Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Enterprise Executive Help Desk Dashboard
            <span className="text-xs px-2.5 py-0.5 bg-purple-100 text-purple-700 font-bold rounded-full border border-purple-200">
              Admin Analytics
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Global ticket volume trends, SLA compliance metrics, and support performance indicators.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-gray-400 ml-2" />
          <button
            onClick={() => setDateFilter('thisMonth')}
            className={`px-3 py-1 rounded-lg transition-all ${dateFilter === 'thisMonth' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            This Month
          </button>
          <button
            onClick={() => setDateFilter('lastMonth')}
            className={`px-3 py-1 rounded-lg transition-all ${dateFilter === 'lastMonth' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            Last Month
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${dateFilter === 'all' ? 'bg-blue-600 text-white font-bold' : 'text-gray-600 hover:text-gray-900'}`}
          >
            All Time
          </button>
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

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Monthly Ticket Flow Trend</h3>
              <p className="text-[10px] text-gray-400">Created vs Resolved tickets month over month</p>
            </div>
            <span className="text-xs font-mono font-semibold px-2 py-1 bg-gray-100 text-gray-700 rounded">
              2026 YTD
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="created" fill="#3B82F6" name="Created" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10B981" name="Resolved" radius={[4, 4, 0, 0]} />
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

        {/* Department Wise Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Department Wise Ticket Volume</h3>
              <p className="text-[10px] text-gray-400">Tickets generated by department origin</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Category Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-gray-900">Top Categories Breakdown</h3>
              <p className="text-[10px] text-gray-400">Most frequent support request categories</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={categoryData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#6B7280' }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
