import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Archive,
  Ticket,
  Users,
  Search,
  RotateCcw,
  Trash2,
  Download,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  User as UserIcon,
  Shield,
  Building,
  MapPin,
  Clock,
  X,
  FileSpreadsheet,
  Lock
} from 'lucide-react';
import { ArchivedTicket, ArchivedUser } from '../../types';

export const ArchivedVaultView: React.FC = () => {
  const {
    currentUser,
    archivedTickets,
    archivedUsers,
    restoreArchivedTicket,
    purgeArchivedTicketPermanently,
    restoreArchivedUser,
    purgeArchivedUserPermanently,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState<'tickets' | 'users'>('tickets');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArchivedTicket, setSelectedArchivedTicket] = useState<ArchivedTicket | null>(null);
  const [selectedArchivedUser, setSelectedArchivedUser] = useState<ArchivedUser | null>(null);
  const [statusToast, setStatusToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const showToast = (type: 'success' | 'error', message: string) => {
    setStatusToast({ type, message });
    setTimeout(() => setStatusToast(null), 4000);
  };

  // Filtered Archived Tickets
  const filteredArchivedTickets = archivedTickets.filter(t => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (t.id && t.id.toLowerCase().includes(q)) ||
      (t.subject && t.subject.toLowerCase().includes(q)) ||
      (t.employeeName && t.employeeName.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.archiveReason && t.archiveReason.toLowerCase().includes(q)) ||
      (t.archivedBy && t.archivedBy.toLowerCase().includes(q))
    );
  });

  // Filtered Archived Users
  const filteredArchivedUsers = archivedUsers.filter(u => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.archiveReason && u.archiveReason.toLowerCase().includes(q)) ||
      (u.archivedBy && u.archivedBy.toLowerCase().includes(q))
    );
  });

  const handleRestoreTicket = async (ticketId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can restore archived records.');
      return;
    }
    const res = await restoreArchivedTicket(ticketId);
    if (res.success) {
      showToast('success', res.message);
      if (selectedArchivedTicket?.id === ticketId) setSelectedArchivedTicket(null);
    } else {
      showToast('error', res.message);
    }
  };

  const handlePurgeTicket = async (ticketId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can purge records.');
      return;
    }
    if (confirm(`CRITICAL WARNING: Are you sure you want to purge ticket ${ticketId} permanently from the archive database? This action cannot be reversed.`)) {
      const res = await purgeArchivedTicketPermanently(ticketId);
      if (res.success) {
        showToast('success', res.message);
        if (selectedArchivedTicket?.id === ticketId) setSelectedArchivedTicket(null);
      }
    }
  };

  const handleRestoreUser = async (userId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can restore archived users.');
      return;
    }
    const res = await restoreArchivedUser(userId);
    if (res.success) {
      showToast('success', res.message);
      if (selectedArchivedUser?.id === userId) setSelectedArchivedUser(null);
    } else {
      showToast('error', res.message);
    }
  };

  const handlePurgeUser = async (userId: string) => {
    if (!isSuperAdmin) {
      showToast('error', 'Only Super Admin can purge records.');
      return;
    }
    if (confirm(`CRITICAL WARNING: Are you sure you want to purge user ID ${userId} permanently from the archive database? This action cannot be reversed.`)) {
      const res = await purgeArchivedUserPermanently(userId);
      if (res.success) {
        showToast('success', res.message);
        if (selectedArchivedUser?.id === userId) setSelectedArchivedUser(null);
      }
    }
  };

  const exportArchiveCSV = () => {
    if (activeTab === 'tickets') {
      const headers = ['Archived At', 'Archived By', 'Reason', 'Ticket ID', 'Employee ID', 'Employee Name', 'Email', 'Department', 'Location', 'Category', 'Subject', 'Priority', 'Status', 'Agent', 'Created Date'];
      const rows = archivedTickets.map(t => [
        `"${t.archivedAt || ''}"`,
        `"${t.archivedBy || ''}"`,
        `"${(t.archiveReason || '').replace(/"/g, '""')}"`,
        `"${t.id || ''}"`,
        `"${t.employeeId || ''}"`,
        `"${t.employeeName || ''}"`,
        `"${t.employeeEmail || ''}"`,
        `"${t.department || ''}"`,
        `"${t.location || ''}"`,
        `"${t.category || ''}"`,
        `"${(t.subject || '').replace(/"/g, '""')}"`,
        `"${t.priority || ''}"`,
        `"${t.status || ''}"`,
        `"${t.assignedAgentName || ''}"`,
        `"${t.createdDate || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Archived_Tickets_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const headers = ['Archived At', 'Archived By', 'Reason', 'User ID', 'Employee ID', 'Name', 'Email', 'Role', 'Department', 'Designation', 'Location', 'Status'];
      const rows = archivedUsers.map(u => [
        `"${u.archivedAt || ''}"`,
        `"${u.archivedBy || ''}"`,
        `"${(u.archiveReason || '').replace(/"/g, '""')}"`,
        `"${u.id || ''}"`,
        `"${u.employeeId || ''}"`,
        `"${u.name || ''}"`,
        `"${u.email || ''}"`,
        `"${u.role || ''}"`,
        `"${u.department || ''}"`,
        `"${u.designation || ''}"`,
        `"${u.location || ''}"`,
        `"${u.status || ''}"`
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Archived_Users_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Archive className="w-6 h-6 text-[#063B2C]" />
              Archived Data Vault & Sheet Storage
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
              Super Admin Archive Vault
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Whenever a user or ticket is permanently deleted by Super Admin, the record is safely transferred to the Google Sheets <strong>ArchivedTickets</strong> and <strong>ArchivedUsers</strong> tabs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportArchiveCSV}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export {activeTab === 'tickets' ? 'Tickets' : 'Users'} CSV</span>
          </button>
        </div>
      </div>

      {statusToast && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn shadow-2xs ${
            statusToast.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {statusToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{statusToast.message}</span>
        </div>
      )}

      {/* Google Sheet Sync Banner */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 rounded-xl text-emerald-800">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-gray-900">
              Live Google Sheets Synchronization Target
            </p>
            <p className="text-gray-500">
              Spreadsheet ID: <strong className="font-mono text-gray-700">{settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="px-3 py-1 bg-gray-100 rounded-lg text-gray-700 font-mono">
            Sheet Tab: <strong>{activeTab === 'tickets' ? 'ArchivedTickets' : 'ArchivedUsers'}</strong>
          </span>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg flex items-center gap-1 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            100% Persisted
          </span>
        </div>
      </div>

      {/* Tabs & Search Header */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('tickets');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'tickets'
                ? 'bg-[#063B2C] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>Archived Tickets ({archivedTickets.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('users');
              setSearchQuery('');
            }}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'users'
                ? 'bg-[#063B2C] text-white shadow-2xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Archived Users ({archivedUsers.length})</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search archived ${activeTab}...`}
            className="w-full pl-9 pr-7 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'tickets' ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          {filteredArchivedTickets.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Ticket className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No Archived Tickets Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Tickets permanently deleted by Super Admin will appear here and be stored in the Google Sheets &apos;ArchivedTickets&apos; tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold text-[11px]">
                    <th className="py-3.5 px-4 font-mono">Ticket ID</th>
                    <th className="py-3.5 px-4">Subject & Department</th>
                    <th className="py-3.5 px-4">Requester</th>
                    <th className="py-3.5 px-4">Archived When</th>
                    <th className="py-3.5 px-4">Archived By & Reason</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredArchivedTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
                          {ticket.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900 line-clamp-1">{ticket.subject}</p>
                        <span className="text-[10px] text-gray-500 font-medium">
                          {ticket.department} → {ticket.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-gray-800">{ticket.employeeName}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{ticket.employeeEmail}</p>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-500 font-mono">
                        {ticket.archivedAt}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-gray-800 text-[11px]">{ticket.archivedBy}</p>
                        <p className="text-[10px] text-amber-700 italic truncate bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block mt-0.5">
                          &quot;{ticket.archiveReason || 'N/A'}&quot;
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedArchivedTicket(ticket)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-colors"
                            title="Inspect archived record"
                          >
                            Inspect
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleRestoreTicket(ticket.id)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                                title="Restore ticket back to active queue"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handlePurgeTicket(ticket.id)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Permanently delete from archive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
          {filteredArchivedUsers.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-gray-900">No Archived Users Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Users permanently deleted by Super Admin will appear here and be stored in the Google Sheets &apos;ArchivedUsers&apos; tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-bold text-[11px]">
                    <th className="py-3.5 px-4 font-mono">EMP ID</th>
                    <th className="py-3.5 px-4">User Details</th>
                    <th className="py-3.5 px-4">Role & Dept</th>
                    <th className="py-3.5 px-4">Archived When</th>
                    <th className="py-3.5 px-4">Archived By & Reason</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredArchivedUsers.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-700">
                          {user.employeeId || user.id}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-gray-900">{user.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{user.email}</p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-0.5">{user.department}</p>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-500 font-mono">
                        {user.archivedAt}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-semibold text-gray-800 text-[11px]">{user.archivedBy}</p>
                        <p className="text-[10px] text-amber-700 italic truncate bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block mt-0.5">
                          &quot;{user.archiveReason || 'N/A'}&quot;
                        </p>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedArchivedUser(user)}
                            className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 transition-colors"
                            title="Inspect archived user record"
                          >
                            Inspect
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleRestoreUser(user.id)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                                title="Restore user back to active staff roster"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() => handlePurgeUser(user.id)}
                                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                title="Permanently delete from archive"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Inspect Ticket Modal */}
      {selectedArchivedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200">
            <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Archived Ticket: {selectedArchivedTicket.id}</h3>
              </div>
              <button onClick={() => setSelectedArchivedTicket(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1 text-amber-900">
                <p className="font-bold text-[11px]">Archive Audit Information</p>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong>Archived At:</strong> {selectedArchivedTicket.archivedAt}</div>
                  <div><strong>Archived By:</strong> {selectedArchivedTicket.archivedBy}</div>
                </div>
                <p className="text-[11px] mt-1">
                  <strong>Reason:</strong> {selectedArchivedTicket.archiveReason || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Subject</label>
                  <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedArchivedTicket.subject}</p>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Requester</label>
                  <p className="font-semibold text-gray-800">{selectedArchivedTicket.employeeName} ({selectedArchivedTicket.employeeId})</p>
                  <p className="text-[10px] text-gray-500">{selectedArchivedTicket.employeeEmail}</p>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Department & Category</label>
                  <p className="font-semibold text-gray-800">{selectedArchivedTicket.department} → {selectedArchivedTicket.category}</p>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Priority & Status (At Deletion)</label>
                  <p className="font-semibold text-gray-800">{selectedArchivedTicket.priority} | {selectedArchivedTicket.status}</p>
                </div>
              </div>

              <div>
                <label className="text-gray-400 font-semibold block text-[10px]">Description</label>
                <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-700 whitespace-pre-wrap leading-relaxed mt-1">
                  {selectedArchivedTicket.description}
                </p>
              </div>

              {isSuperAdmin && (
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleRestoreTicket(selectedArchivedTicket.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore to Active Tickets Queue</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inspect User Modal */}
      {selectedArchivedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200">
            <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Archive className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Archived User: {selectedArchivedUser.name}</h3>
              </div>
              <button onClick={() => setSelectedArchivedUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl space-y-1 text-amber-900">
                <p className="font-bold text-[11px]">Archive Audit Information</p>
                <div><strong>Archived At:</strong> {selectedArchivedUser.archivedAt}</div>
                <div><strong>Archived By:</strong> {selectedArchivedUser.archivedBy}</div>
                <p className="mt-1"><strong>Reason:</strong> {selectedArchivedUser.archiveReason || 'N/A'}</p>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Employee ID & Email</label>
                  <p className="font-bold text-gray-900">{selectedArchivedUser.employeeId || selectedArchivedUser.id} - {selectedArchivedUser.email}</p>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Role & Department</label>
                  <p className="font-semibold text-gray-800">{selectedArchivedUser.role} ({selectedArchivedUser.department})</p>
                </div>
                <div>
                  <label className="text-gray-400 font-semibold block text-[10px]">Designation & Location</label>
                  <p className="font-semibold text-gray-800">{selectedArchivedUser.designation || 'N/A'} - {selectedArchivedUser.location || 'N/A'}</p>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => handleRestoreUser(selectedArchivedUser.id)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Restore to Active User Roster</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
