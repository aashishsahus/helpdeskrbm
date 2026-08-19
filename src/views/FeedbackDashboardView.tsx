import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  MessageSquareHeart,
  Calendar,
  UserCheck,
  Mail,
  Search,
  Filter,
  CheckCircle2,
  TrendingUp,
  Award,
  Clock,
  Send,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Ticket } from '../types';
import { SendEmailModal } from '../components/SendEmailModal';
import { isTicketRaisedByUser } from '../utils/ticketSecurity';
import { RefreshButton } from '../components/RefreshButton';

export const FeedbackDashboardView: React.FC = () => {
  const { currentUser, tickets, users, setSelectedTicketId, addAuditLog } = useApp();

  const isEmployee = currentUser?.role === 'Employee';

  // Filters
  const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
  const [starFilter, setStarFilter] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    email: string;
    name: string;
    ticketId?: string;
    ticketSubject?: string;
  }>({ email: '', name: '' });

  // Base tickets scoped for role
  const scopedBaseTickets = useMemo(() => {
    if (isEmployee && currentUser) {
      return tickets.filter(t => isTicketRaisedByUser(t, currentUser));
    }
    return tickets;
  }, [tickets, isEmployee, currentUser]);

  // Filter tickets by timeframe
  const timeframeFilteredTickets = useMemo(() => {
    const now = new Date();
    return scopedBaseTickets.filter(t => {
      // Must have resolved or closed date or updatedDate
      const dateStr = t.resolvedDate || t.updatedDate || t.createdDate;
      if (!dateStr) return true;
      const date = new Date(dateStr);

      if (timeframe === 'daily') {
        return (
          date.getUTCFullYear() === now.getUTCFullYear() &&
          date.getUTCMonth() === now.getUTCMonth() &&
          date.getUTCDate() === now.getUTCDate()
        );
      }

      if (timeframe === 'weekly') {
        const diffMs = now.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays <= 7;
      }

      if (timeframe === 'monthly') {
        const diffMs = now.getTime() - date.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        return diffDays <= 30;
      }

      return true; // All time
    });
  }, [scopedBaseTickets, timeframe]);

  // Rated tickets within timeframe
  const ratedTickets = useMemo(() => {
    return timeframeFilteredTickets.filter(t => t.rating && t.rating > 0);
  }, [timeframeFilteredTickets]);

  // Apply Search & Star Filter
  const filteredFeedbackList = useMemo(() => {
    return ratedTickets.filter(t => {
      if (starFilter !== 'all' && t.rating !== starFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.id.toLowerCase().includes(q);
        const matchEmail = (t.employeeEmail || '').toLowerCase().includes(q);
        const matchName = (t.employeeName || '').toLowerCase().includes(q);
        const matchFeedback = (t.feedback || '').toLowerCase().includes(q);
        const matchAgent = (t.assignedAgentName || '').toLowerCase().includes(q);
        const matchSubject = (t.subject || '').toLowerCase().includes(q);
        return matchId || matchEmail || matchName || matchFeedback || matchAgent || matchSubject;
      }

      return true;
    });
  }, [ratedTickets, starFilter, searchQuery]);

  // Core Metrics
  const totalFeedbackCount = ratedTickets.length;
  const totalResolvedCount = timeframeFilteredTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;

  const averageRating = useMemo(() => {
    if (totalFeedbackCount === 0) return '0.0';
    const sum = ratedTickets.reduce((acc, t) => acc + (t.rating || 0), 0);
    return (sum / totalFeedbackCount).toFixed(1);
  }, [ratedTickets, totalFeedbackCount]);

  const csatPercentage = useMemo(() => {
    if (totalFeedbackCount === 0) return 0;
    const positiveCount = ratedTickets.filter(t => (t.rating || 0) >= 4).length;
    return Math.round((positiveCount / totalFeedbackCount) * 100);
  }, [ratedTickets, totalFeedbackCount]);

  // Rating Distribution (1 to 5 Stars)
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedTickets.forEach(t => {
      if (t.rating && t.rating >= 1 && t.rating <= 5) {
        counts[t.rating as 1 | 2 | 3 | 4 | 5]++;
      }
    });
    return counts;
  }, [ratedTickets]);

  // Agent Performance Breakdown
  const agentPerformance = useMemo(() => {
    const agentMap: Record<string, { id: string; name: string; dept: string; email: string; ratings: number[] }> = {};

    users.filter(u => u.role === 'Support Agent' || u.role === 'Support Manager' || u.role === 'Super Admin' || u.role === 'Admin').forEach(u => {
      const key = u.id || u.employeeId || u.email;
      agentMap[key] = { id: key, name: u.name, dept: u.department, email: u.email, ratings: [] };
    });

    timeframeFilteredTickets.forEach(t => {
      if (t.rating && t.assignedAgentId && agentMap[t.assignedAgentId]) {
        agentMap[t.assignedAgentId].ratings.push(t.rating);
      }
    });

    return Object.values(agentMap)
      .map(agent => {
        const count = agent.ratings.length;
        const avg = count > 0 ? (agent.ratings.reduce((a, b) => a + b, 0) / count).toFixed(1) : 'N/A';
        const csat = count > 0 ? Math.round((agent.ratings.filter(r => r >= 4).length / count) * 100) : 0;
        return { ...agent, count, avg, csat };
      })
      .sort((a, b) => b.count - a.count || b.csat - a.csat);
  }, [timeframeFilteredTickets, users]);

  const handleOpenEmailModal = (email: string, name: string, ticketId?: string, subject?: string) => {
    setSelectedRecipient({
      email: email || 'misrpr@rathibuildmart.com',
      name: name || 'Valued User',
      ticketId,
      ticketSubject: subject
    });
    setEmailModalOpen(true);
  };

  const formatDateWithTime = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#031A12] text-amber-400 rounded-2xl flex items-center justify-center shadow-lg border border-[#063B2C] shrink-0">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 tracking-tight">
                Feedback & CSAT Rating Analytics
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-emerald-300">
                Live Data
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Monitor employee satisfaction scores, star ratings, and agent resolution reviews
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <RefreshButton
            id="feedback-refresh-btn"
            variant="default"
            showTimestamp={true}
            label="Refresh Ratings"
          />

          <button
            onClick={() => handleOpenEmailModal('misrpr@rathibuildmart.com', 'Misr Pr')}
            className="px-4 py-2 bg-[#031A12] hover:bg-[#063B2C] text-emerald-300 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-all border border-[#0A4D39]"
          >
            <Mail className="w-4 h-4 text-emerald-400" />
            <span>Send Direct Email / Request Feedback</span>
          </button>
        </div>
      </div>

      {/* Timeframe Selector Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-2 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Timeframe:
          </span>
          <button
            onClick={() => setTimeframe('daily')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'daily'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Daily (Today)
          </button>
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'weekly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Weekly (7 Days)
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'monthly'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Monthly (30 Days)
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Time
          </button>
        </div>

        <span className="text-[11px] font-mono text-gray-500 font-bold px-3 py-1 bg-gray-50 rounded-lg border border-gray-200">
          Filtered Records: {ratedTickets.length} Feedback Submissions
        </span>
      </div>

      {/* Overview Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: CSAT Satisfaction Score */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">CSAT Score</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{csatPercentage}%</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Positive Experience
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Percentage of 4 & 5-star ratings</p>
        </div>

        {/* Card 2: Average Rating */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Rating</span>
            <div className="p-2 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-5 h-5 fill-current" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-gray-900">{averageRating}</span>
            <div className="flex items-center text-amber-400">
              {[1, 2, 3, 4, 5].map(s => (
                <Star
                  key={s}
                  className={`w-4 h-4 ${
                    parseFloat(averageRating as string) >= s ? 'fill-current text-amber-400' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-[11px] text-gray-400">Out of 5.0 maximum rating scale</p>
        </div>

        {/* Card 3: Feedback Count & Response Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Feedbacks</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <MessageSquareHeart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalFeedbackCount}</span>
            <span className="text-xs text-gray-500 font-mono">/ {totalResolvedCount} Resolved</span>
          </div>
          <p className="text-[11px] text-gray-400">
            Response Rate:{' '}
            <strong className="text-gray-700">
              {totalResolvedCount > 0 ? Math.round((totalFeedbackCount / totalResolvedCount) * 100) : 100}%
            </strong>
          </p>
        </div>

        {/* Card 4: 5-Star Highest Rating Count */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">5-Star Reviews</span>
            <div className="p-2 bg-yellow-50 text-yellow-600 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{starCounts[5]}</span>
            <span className="text-xs text-gray-500 font-mono">
              ({totalFeedbackCount > 0 ? Math.round((starCounts[5] / totalFeedbackCount) * 100) : 100}%)
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Excellent support resolution ratings</p>
        </div>
      </div>

      {/* Rating Breakdown & Agent Leaderboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rating Distribution Column */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-current" />
            <span>Rating Star Breakdown</span>
          </h2>

          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map(starNum => {
              const count = starCounts[starNum as 1 | 2 | 3 | 4 | 5];
              const pct = totalFeedbackCount > 0 ? Math.round((count / totalFeedbackCount) * 100) : 0;
              return (
                <div key={starNum} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1 w-16 shrink-0">
                      {starNum} Stars
                    </span>
                    <div className="flex-1 mx-3 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          starNum >= 4 ? 'bg-emerald-500' : starNum === 3 ? 'bg-amber-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="font-mono text-gray-500 text-[11px] w-12 text-right">
                      {count} ({pct}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agent Wise CSAT Performance */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-gray-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Support Agent CSAT & Feedback Leaderboard</span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Agent Performance</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 font-bold text-gray-500 uppercase border-b border-gray-200">
                  <th className="p-2.5">Agent Name</th>
                  <th className="p-2.5">Department</th>
                  <th className="p-2.5 text-center">Rated Tickets</th>
                  <th className="p-2.5 text-center">Avg Rating</th>
                  <th className="p-2.5 text-center">CSAT %</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {agentPerformance.map((agent, idx) => (
                  <tr key={`${agent.id || agent.name}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-2.5 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center font-extrabold text-[10px] shrink-0">
                        {agent.name.charAt(0)}
                      </div>
                      <span>{agent.name}</span>
                    </td>
                    <td className="p-2.5 text-gray-600">{agent.dept || 'IT Operations'}</td>
                    <td className="p-2.5 font-mono font-bold text-center">{agent.count}</td>
                    <td className="p-2.5 text-center">
                      {agent.count > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          {agent.avg}
                        </span>
                      ) : (
                        <span className="text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-flex items-center gap-1">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono font-bold">
                      {agent.count > 0 ? (
                        <span className={agent.csat >= 80 ? 'text-emerald-600' : agent.csat >= 60 ? 'text-amber-600' : 'text-red-600'}>
                          {agent.csat}%
                        </span>
                      ) : (
                        <span className="text-gray-400 font-normal">0%</span>
                      )}
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleOpenEmailModal(agent.email, agent.name)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 border border-gray-300"
                        title="Send Direct Email to Agent"
                      >
                        <Mail className="w-3 h-3 text-blue-600" />
                        <span>Email</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Feedback & Ticket Logs List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-emerald-600" />
              <span>Customer Reviews & Feedback Log</span>
            </h2>
            <p className="text-xs text-gray-500">
              Detailed list showing created date, assignee agent, user email, and star rating comments
            </p>
          </div>

          {/* Search & Star Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ticket ID, email, feedback..."
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-blue-500 transition-all w-60"
              />
            </div>

            <select
              value={starFilter}
              onChange={e => setStarFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none"
            >
              <option value="all">All Rating Stars</option>
              <option value="5">5 Stars ⭐⭐⭐⭐⭐</option>
              <option value="4">4 Stars ⭐⭐⭐⭐</option>
              <option value="3">3 Stars ⭐⭐⭐</option>
              <option value="2">2 Stars ⭐⭐</option>
              <option value="1">1 Star ⭐</option>
            </select>
          </div>
        </div>

        {/* Feedback Cards List */}
        {filteredFeedbackList.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <MessageSquareHeart className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs font-bold text-gray-500">No feedback submissions found for selected filter</p>
            <p className="text-[11px] text-gray-400">
              Ratings submitted by employees upon ticket resolution will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFeedbackList.map(t => (
              <div
                key={t.id}
                className="p-5 bg-white border border-gray-200 hover:border-emerald-300 rounded-2xl shadow-2xs hover:shadow-md transition-all space-y-3"
              >
                {/* Card Top Header: Ticket ID + Creation Date + Assigned Agent + Rating */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                      {t.id}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{t.subject}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md">
                      {t.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 font-black text-xs shrink-0">
                    {[...Array(t.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current text-amber-400" />
                    ))}
                    <span className="ml-1 text-gray-900 font-mono font-bold">({t.rating}/5 Stars)</span>
                  </div>
                </div>

                {/* Ticket Creation & Assignee Details Bar (Mandatory Requirement) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-gray-50 p-3 rounded-xl text-xs">
                  {/* Created Date */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Ticket Created On</span>
                      <strong className="text-gray-900 font-mono">{formatDateWithTime(t.createdDate)}</strong>
                    </div>
                  </div>

                  {/* Assigned Agent */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Assigned Support Agent</span>
                      <strong className="text-gray-900">{t.assignedAgentName || 'Unassigned'}</strong>
                    </div>
                  </div>

                  {/* Requester Name & Email */}
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-gray-400 block font-semibold uppercase">Requester Email</span>
                      <span className="text-blue-700 font-bold truncate block">{t.employeeEmail}</span>
                    </div>
                  </div>
                </div>

                {/* User Feedback Comment Quote */}
                {t.feedback ? (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs text-gray-800 italic flex items-start gap-2">
                    <MessageSquareHeart className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-900 not-italic block text-[11px] mb-0.5">
                        User Review by {t.employeeName}:
                      </span>
                      "{t.feedback}"
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No written comment provided with star rating.</p>
                )}

                {/* Bottom Actions Row */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[11px] text-gray-500">
                    Resolved Date:{' '}
                    <strong className="text-gray-800 font-mono">{formatDateWithTime(t.resolvedDate || t.updatedDate)}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEmailModal(t.employeeEmail, t.employeeName, t.id, t.subject)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-xs flex items-center gap-1.5 border border-blue-200 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>Email Requester ({t.employeeEmail})</span>
                    </button>

                    <button
                      onClick={() => setSelectedTicketId(t.id)}
                      className="px-3 py-1.5 bg-[#031A12] hover:bg-[#063B2C] text-emerald-300 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Ticket</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Send Email Modal */}
      <SendEmailModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        recipientEmail={selectedRecipient.email}
        recipientName={selectedRecipient.name}
        ticketId={selectedRecipient.ticketId}
        ticketSubject={selectedRecipient.ticketSubject}
      />
    </div>
  );
};
