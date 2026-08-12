import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, Search, Filter } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(
    l =>
      !searchQuery ||
      l.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.details.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Security & Compliance Audit Logs</h1>
        <p className="text-xs text-gray-500">Immutable record of administrative operations, security actions, and configuration updates.</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search audit trail logs..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border rounded-lg text-xs"
            />
          </div>
          <span className="text-xs font-mono font-bold text-gray-500">{filteredLogs.length} Log Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b font-bold text-gray-400 uppercase text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User Email</th>
                <th className="p-3">Action</th>
                <th className="p-3">Target / Module</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 font-mono text-[11px]">
                  <td className="p-3 text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-gray-900">{log.userEmail}</td>
                  <td className="p-3 font-bold text-blue-600">{log.action}</td>
                  <td className="p-3 text-purple-700">{log.targetModule || 'System'}</td>
                  <td className="p-3 text-gray-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
