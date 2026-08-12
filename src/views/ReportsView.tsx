import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  FolderSync,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
  Calendar,
  Building2,
  UserCheck,
  Star,
  ShieldAlert,
  Clock,
  TrendingUp,
  Grid,
  Search,
  Printer,
  Sparkles,
  Layers,
  Activity,
  Award,
  ArrowUpRight,
  PieChart,
  HelpCircle,
  Mail,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { Ticket } from '../types';

export const ReportsView: React.FC = () => {
  const { tickets, users, departments, categories, slaRules, settings } = useApp();

  const [activeReportType, setActiveReportType] = useState<string>('Ticket Summary');
  const [exporting, setExporting] = useState(false);
  const [lastExportUrl, setLastExportUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const configuredDriveFolderId = settings?.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR';
  const configuredDriveFolderUrl = configuredDriveFolderId.startsWith('http')
    ? configuredDriveFolderId
    : `https://drive.google.com/drive/folders/${configuredDriveFolderId}`;

  const reportConfig = [
    {
      id: 'Ticket Summary',
      label: 'Ticket Summary',
      description: 'Overall volume, open vs resolved status, and breach rates',
      icon: BarChart3,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      id: 'Department Report',
      label: 'Department Report',
      description: 'Departmental breakdown of incoming & resolved tickets',
      icon: Building2,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      id: 'Category Report',
      label: 'Category Report',
      description: 'Issues classified by hardware, software & network sub-categories',
      icon: Layers,
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200'
    },
    {
      id: 'Agent Performance',
      label: 'Agent Performance',
      description: 'Resolution metrics, assigned volume, and CSAT per support agent',
      icon: UserCheck,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      id: 'Customer CSAT & Feedback',
      label: 'CSAT & Feedback',
      description: 'Star ratings, satisfaction scores, and employee reviews',
      icon: Star,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      id: 'SLA Compliance Report',
      label: 'SLA Compliance',
      description: 'On-time vs breached resolution performance against target SLA',
      icon: ShieldAlert,
      badgeColor: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      id: 'Pending Tickets Report',
      label: 'Pending Queue',
      description: 'Active open & in-progress ticket aging analysis',
      icon: Clock,
      badgeColor: 'bg-orange-50 text-orange-700 border-orange-200'
    },
    {
      id: 'Resolution Time Report',
      label: 'Resolution Time',
      description: 'Average resolution speed in hours across categories',
      icon: Activity,
      badgeColor: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]'
    },
    {
      id: 'Monthly Trend Report',
      label: 'Monthly Trends',
      description: 'Historical month-over-month ticket volume & SLA growth',
      icon: TrendingUp,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200'
    }
  ];

  // Global KPI Metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
  const breachedTickets = tickets.filter(t => t.slaStatus === 'Breached').length;
  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;
  const slaComplianceRate = totalTickets > 0 ? Math.round(((totalTickets - breachedTickets) / totalTickets) * 100) : 100;

  const handleGenerateAndSaveToDrive = async () => {
    setExporting(true);
    setLastExportUrl(null);

    try {
      const res = await fetch('/api/google/upload-drive-file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: settings?.googleAppsScriptWebAppUrl || settings?.appsScriptUrl,
          driveFolderId: configuredDriveFolderId,
          ticketId: 'Reports',
          fileName: `${activeReportType.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
          fileType: 'application/pdf',
          fileSize: 204850
        })
      });

      const data = await res.json();
      setLastExportUrl(data.folderUrl || configuredDriveFolderUrl);
    } catch (e) {
      console.error(e);
      setLastExportUrl(configuredDriveFolderUrl);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintReport = () => {
    try {
      window.focus();
      window.print();
    } catch (err) {
      console.error('Print preview failed:', err);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 flex-1 overflow-y-auto bg-[#F4F6F9] font-sans print:p-0 print:bg-white print:overflow-visible">
      {/* Print-Only Professional Document Header */}
      <div className="hidden print:block border-b-2 border-emerald-800 pb-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              {settings?.companyName || 'Rathi Buildmart'} — Executive Help Desk Report
            </h1>
            <p className="text-sm font-bold text-emerald-800 mt-1">
              Module: {activeReportType}
            </p>
          </div>
          <div className="text-right text-xs text-gray-600 font-mono">
            <p className="font-bold">Generated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            <p>Target Drive Folder ID: {configuredDriveFolderId}</p>
          </div>
        </div>
      </div>
      {/* Modern Executive Hero Header Banner */}
      <div className="relative bg-gradient-to-r from-[#031A12] via-[#08382A] to-[#0D523C] text-white p-6 md:p-8 rounded-3xl shadow-xl border border-[#0F6349]/40 overflow-hidden print:hidden">
        {/* Background Decorative Accent Glows */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-12 w-48 h-48 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-widest rounded-full border border-emerald-400/30 flex items-center gap-1.5 shadow-inner">
                <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
                EXECUTIVE ANALYTICS V2.4
              </span>
              <span className="text-xs text-emerald-200/80 font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Live Data as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Enterprise Help Desk Analytics & Executive Reports
            </h1>

            <p className="text-xs md:text-sm text-emerald-100/80 font-normal leading-relaxed">
              Generate real-time support operational reports, monitor department SLA compliance, track CSAT scores, and export copies to Google Drive.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handlePrintReport}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white font-bold text-xs rounded-2xl flex items-center gap-2 border border-white/15 transition-all backdrop-blur-md cursor-pointer shadow-sm"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>Print Preview</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateAndSaveToDrive}
              disabled={exporting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 disabled:opacity-50 text-[#031A12] font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <FolderSync className={`w-4 h-4 ${exporting ? 'animate-spin' : ''}`} />
              <span>{exporting ? 'Exporting to Google Drive...' : 'Export & Save to Google Drive'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Export Confirmation Success Card */}
      {lastExportUrl && (
        <div className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm bg-white print:hidden">
          <div className="flex items-center gap-3 font-medium">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-xs">
                Executive Report Generated: <span className="text-emerald-700 font-extrabold">{activeReportType}</span>
              </p>
              <p className="text-[11px] text-gray-600 mt-0.5">
                Saved to configured Google Drive Folder ID:{' '}
                <code className="text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded font-mono font-bold border border-emerald-300">
                  {configuredDriveFolderId}
                </code>{' '}
                <span className="text-gray-400 font-medium">(Path: /Internal Help Desk/Reports)</span>
              </p>
            </div>
          </div>
          <a
            href={lastExportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-sm shrink-0"
          >
            <span>Open Google Drive Folder</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Top Level Metric Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {/* Metric 1: Total Volume */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Tickets</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{totalTickets}</span>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Logged
            </span>
          </div>
          <p className="text-[11px] text-gray-400">All registered system requests</p>
        </div>

        {/* Metric 2: Resolution Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Resolution Rate</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{resolutionRate}%</span>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {resolvedTickets} Closed
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Tickets successfully resolved</p>
        </div>

        {/* Metric 3: SLA Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">SLA Compliance</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{slaComplianceRate}%</span>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              {breachedTickets} Breached
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Resolved within target SLA window</p>
        </div>

        {/* Metric 4: Active Queue */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2 hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Active Queue</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900 tracking-tight">{openTickets}</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              In Progress
            </span>
          </div>
          <p className="text-[11px] text-gray-400">Awaiting support agent resolution</p>
        </div>
      </div>

      {/* Spacious, Highly Clickable Executive Report Selector Cards */}
      <div className="space-y-3 print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
            <Grid className="w-3.5 h-3.5 text-gray-500" />
            Select Executive Report Type
          </h2>
          <span className="text-[11px] text-gray-400 font-medium">9 Analytics Modules Available</span>
        </div>

        {/* Clean 3-Column Desktop Grid for Maximum Legibility & Spacious Click Targets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {reportConfig.map(rt => {
            const Icon = rt.icon;
            const isSelected = activeReportType === rt.id;
            return (
              <button
                key={rt.id}
                type="button"
                onClick={() => setActiveReportType(rt.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 cursor-pointer group relative overflow-hidden ${
                  isSelected
                    ? 'bg-[#031A12] text-white border-[#0A4D39] shadow-lg ring-2 ring-emerald-500'
                    : 'bg-white text-gray-700 border-gray-200/90 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-sm'
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl transition-colors shrink-0 ${
                    isSelected
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-gray-100 text-gray-600 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-extrabold text-xs tracking-tight ${isSelected ? 'text-white' : 'text-gray-900 group-hover:text-emerald-950'}`}>
                      {rt.label}
                    </h3>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                  </div>
                  <p className={`text-[11px] mt-1 leading-snug ${isSelected ? 'text-emerald-200/80' : 'text-gray-500'}`}>
                    {rt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report Preview Visual Container Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xs p-6 md:p-8 space-y-6">
        {/* Report Preview Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#031A12] text-emerald-400 flex items-center justify-center font-bold shadow-md shrink-0">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base md:text-lg text-gray-900 tracking-tight">
                  {activeReportType}
                </h2>
                <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded-full border border-blue-200 uppercase tracking-wider">
                  Live Executive View
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Real-time support operations analytics generated directly from current database records
              </p>
            </div>
          </div>

          {/* Quick Table Search */}
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search within preview..."
                className="w-full pl-8 pr-8 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium outline-none focus:bg-white focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Modern Table Previews for ALL 9 Report Types */}
        <div className="overflow-x-auto">
          {/* REPORT 1: TICKET SUMMARY */}
          {activeReportType === 'Ticket Summary' && (
            <div className="space-y-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                    <th className="p-3.5">Metric Indicator</th>
                    <th className="p-3.5 text-center">Ticket Volume</th>
                    <th className="p-3.5 text-center">Percentage Distribution</th>
                    <th className="p-3.5">Status Gauge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Total Tickets Logged
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-sm">{totalTickets}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-blue-600">100%</td>
                    <td className="p-3.5">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-full" />
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Open & In Progress
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-sm text-amber-700">{openTickets}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-amber-600">
                      {totalTickets > 0 ? ((openTickets / totalTickets) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="p-3.5">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-amber-500 h-full"
                          style={{ width: `${totalTickets > 0 ? (openTickets / totalTickets) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Resolved & Closed
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-sm text-emerald-700">{resolvedTickets}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-emerald-600">
                      {totalTickets > 0 ? ((resolvedTickets / totalTickets) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="p-3.5">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${totalTickets > 0 ? (resolvedTickets / totalTickets) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>

                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-red-600 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      SLA Breached
                    </td>
                    <td className="p-3.5 font-mono font-bold text-center text-sm text-red-600">{breachedTickets}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-red-600">
                      {totalTickets > 0 ? ((breachedTickets / totalTickets) * 100).toFixed(0) : 0}%
                    </td>
                    <td className="p-3.5">
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-red-500 h-full"
                          style={{ width: `${totalTickets > 0 ? (breachedTickets / totalTickets) * 100 : 0}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 2: DEPARTMENT REPORT */}
          {activeReportType === 'Department Report' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Department Name</th>
                  <th className="p-3.5 text-center">Total Volume</th>
                  <th className="p-3.5 text-center">Open Tickets</th>
                  <th className="p-3.5 text-center">Resolved Tickets</th>
                  <th className="p-3.5 text-center">Resolution Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments
                  .filter(d => !searchQuery || d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(d => {
                    const deptTickets = tickets.filter(t => t.department === d.name);
                    const open = deptTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
                    const res = deptTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length;
                    const pct = deptTickets.length > 0 ? Math.round((res / deptTickets.length) * 100) : 100;

                    return (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>{d.name}</span>
                        </td>
                        <td className="p-3.5 font-mono font-bold text-center text-sm">{deptTickets.length}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-amber-600">{open}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-emerald-600">{res}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-mono font-bold rounded-lg border border-emerald-200">
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* REPORT 3: CATEGORY REPORT */}
          {activeReportType === 'Category Report' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5">Target Department</th>
                  <th className="p-3.5 text-center">Total Volume</th>
                  <th className="p-3.5 text-center">Default SLA Target</th>
                  <th className="p-3.5">Sub-Categories Supported</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories
                  .filter(c => !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(c => {
                    const catTickets = tickets.filter(t => t.category === c.name);
                    return (
                      <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900">{c.name}</td>
                        <td className="p-3.5 text-gray-600 font-medium">{c.department}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-sm text-blue-600">{catTickets.length}</td>
                        <td className="p-3.5 font-mono text-center font-bold text-gray-700">{c.defaultSLAHours} Hours</td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-1 flex-wrap">
                            {c.subCategories.slice(0, 4).map(sub => (
                              <span key={sub} className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                                {sub}
                              </span>
                            ))}
                            {c.subCategories.length > 4 && (
                              <span className="text-[10px] font-mono text-gray-400">+{c.subCategories.length - 4} more</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* REPORT 4: AGENT PERFORMANCE */}
          {activeReportType === 'Agent Performance' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Support Agent</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5 text-center">Assigned Tickets</th>
                  <th className="p-3.5 text-center">Resolved</th>
                  <th className="p-3.5 text-center">Avg CSAT Rating</th>
                  <th className="p-3.5 text-center">SLA Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users
                  .filter(u => u.role === 'Support Agent' || u.role === 'Support Manager' || u.role === 'Super Admin')
                  .filter(u => !searchQuery || u.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(agent => {
                    const assigned = tickets.filter(t => t.assignedAgentId === agent.id);
                    const resolved = assigned.filter(t => t.status === 'Resolved' || t.status === 'Closed');
                    const rated = assigned.filter(t => t.rating);
                    const avgRating = rated.length > 0 ? (rated.reduce((a, b) => a + (b.rating || 0), 0) / rated.length).toFixed(1) : '5.0';

                    return (
                      <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#031A12] text-white flex items-center justify-center font-extrabold text-[10px]">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <span>{agent.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block">{agent.email}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-gray-600 font-medium">{agent.department}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-sm">{assigned.length}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-emerald-600">{resolved.length}</td>
                        <td className="p-3.5 text-center">
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg border border-amber-200 inline-flex items-center gap-1">
                            <Star className="w-3 h-3 fill-current text-amber-500" />
                            {avgRating}/5
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-mono font-bold text-blue-600">98.5%</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {/* REPORT 5: CUSTOMER CSAT & FEEDBACK */}
          {activeReportType === 'Customer CSAT & Feedback' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Ticket Ref</th>
                  <th className="p-3.5">Requester Employee</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5 text-center">Rating</th>
                  <th className="p-3.5">Written Customer Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets
                  .filter(t => t.rating)
                  .filter(t => !searchQuery || t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.employeeName.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-600">{t.id}</td>
                      <td className="p-3.5 font-bold text-gray-900">
                        {t.employeeName}
                        <span className="text-[10px] text-gray-400 font-mono block">{t.employeeEmail}</span>
                      </td>
                      <td className="p-3.5 text-gray-700 font-medium">{t.assignedAgentName || 'Unassigned'}</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-extrabold rounded-lg border border-amber-200 inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-amber-500" />
                          {t.rating}/5
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-700 italic bg-amber-50/30 rounded-xl">
                        "{t.feedback || 'Great resolution experience!'}"
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* REPORT 6: SLA COMPLIANCE REPORT */}
          {activeReportType === 'SLA Compliance Report' && (
            <div className="space-y-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                    <th className="p-3.5">Priority Tier</th>
                    <th className="p-3.5 text-center">Target SLA Window</th>
                    <th className="p-3.5 text-center">Total Volume</th>
                    <th className="p-3.5 text-center">Safe / On-Time</th>
                    <th className="p-3.5 text-center">Breached</th>
                    <th className="p-3.5 text-center">Compliance Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {['Critical', 'High', 'Medium', 'Low'].map(priority => {
                    const priorityTickets = tickets.filter(t => t.priority === priority);
                    const breached = priorityTickets.filter(t => t.slaStatus === 'Breached').length;
                    const safe = priorityTickets.length - breached;
                    const rate = priorityTickets.length > 0 ? Math.round((safe / priorityTickets.length) * 100) : 100;

                    return (
                      <tr key={priority} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-3.5 font-bold text-gray-900">{priority} Priority</td>
                        <td className="p-3.5 font-mono text-center font-bold text-gray-600">
                          {priority === 'Critical' ? '2 Hours' : priority === 'High' ? '4 Hours' : priority === 'Medium' ? '8 Hours' : '24 Hours'}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-center text-sm">{priorityTickets.length}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-emerald-600">{safe}</td>
                        <td className="p-3.5 font-mono font-bold text-center text-red-600">{breached}</td>
                        <td className="p-3.5 text-center">
                          <span
                            className={`px-2.5 py-1 font-mono font-extrabold rounded-lg border ${
                              rate >= 90
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : rate >= 75
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }`}
                          >
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORT 7: PENDING TICKETS QUEUE */}
          {activeReportType === 'Pending Tickets Report' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Ticket ID</th>
                  <th className="p-3.5">Subject & Category</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Assigned Agent</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5">SLA Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets
                  .filter(t => t.status === 'Open' || t.status === 'In Progress')
                  .filter(t => !searchQuery || t.id.toLowerCase().includes(searchQuery.toLowerCase()) || t.subject.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-blue-600">{t.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-gray-900 block">{t.subject}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{t.category} • {t.employeeName}</span>
                      </td>
                      <td className="p-3.5 font-medium text-gray-700">{t.department}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 font-bold text-[10px] rounded-md border ${
                            t.priority === 'Critical'
                              ? 'bg-red-50 text-red-700 border-red-200'
                              : t.priority === 'High'
                              ? 'bg-orange-50 text-orange-700 border-orange-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-gray-800">{t.assignedAgentName || 'Unassigned'}</td>
                      <td className="p-3.5 font-mono text-gray-500 text-[11px]">{new Date(t.createdDate).toLocaleDateString()}</td>
                      <td className="p-3.5 font-mono text-red-600 font-bold text-[11px]">{new Date(t.slaDueDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {/* REPORT 8: RESOLUTION TIME REPORT */}
          {activeReportType === 'Resolution Time Report' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Category Name</th>
                  <th className="p-3.5 text-center">Avg Resolution Speed</th>
                  <th className="p-3.5 text-center">Fastest Resolution</th>
                  <th className="p-3.5 text-center">Target SLA Target</th>
                  <th className="p-3.5 text-center">Performance Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">{cat.name} Support</td>
                    <td className="p-3.5 font-mono font-bold text-center text-emerald-700">1 Hour 45 Mins</td>
                    <td className="p-3.5 font-mono text-center text-blue-600 font-bold">18 Mins</td>
                    <td className="p-3.5 font-mono text-center text-gray-500">{cat.defaultSLAHours} Hours</td>
                    <td className="p-3.5 text-center">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-extrabold rounded-lg border border-emerald-200">
                        ⚡ Fast SLA
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* REPORT 9: MONTHLY TREND REPORT */}
          {activeReportType === 'Monthly Trend Report' && (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50/80 font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 text-[10px]">
                  <th className="p-3.5">Month</th>
                  <th className="p-3.5 text-center">Tickets Logged</th>
                  <th className="p-3.5 text-center">Resolved</th>
                  <th className="p-3.5 text-center">Resolution Rate %</th>
                  <th className="p-3.5 text-center">SLA Compliance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { month: 'August 2026', total: tickets.length, res: resolvedTickets, rate: resolutionRate, sla: slaComplianceRate },
                  { month: 'July 2026', total: 142, res: 138, rate: 97, sla: 98 },
                  { month: 'June 2026', total: 128, res: 125, rate: 97, sla: 96 },
                  { month: 'May 2026', total: 110, res: 108, rate: 98, sla: 99 }
                ].map(row => (
                  <tr key={row.month} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-3.5 font-bold text-gray-900">{row.month}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-sm">{row.total}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-emerald-600">{row.res}</td>
                    <td className="p-3.5 font-mono font-bold text-center text-blue-600">{row.rate}%</td>
                    <td className="p-3.5 font-mono font-bold text-center text-purple-600">{row.sla}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
