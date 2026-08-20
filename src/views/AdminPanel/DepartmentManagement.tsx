import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { departments, addDepartment, editDepartment, deleteDepartment, users } = useApp();

  const suggestedTeams = Array.from(
    new Set([
      'Core IT Team',
      'People Ops Team',
      'Finance Desk',
      'Supply Desk',
      'Sales Operations',
      'Facilities Team',
      'L1 Helpdesk Support',
      'Operations Helpdesk',
      ...departments.map(d => d.supportTeam).filter(Boolean)
    ])
  );

  const [name, setName] = useState('');
  const [headName, setHeadName] = useState('');
  const [customHead, setCustomHead] = useState(false);
  const [supportTeam, setSupportTeam] = useState('');
  const [customTeam, setCustomTeam] = useState(false);

  const [editModal, setEditModal] = useState<{ id: string; name: string; headName: string; supportTeam: string } | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addDepartment({
      name: name.trim(),
      headName: headName.trim() || 'Unassigned',
      supportTeam: supportTeam.trim() || 'Default Team'
    });
    setName('');
    setHeadName('');
    setSupportTeam('');
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Department Management</h1>
        <p className="text-xs text-gray-500">Configure organizational departments, leaders, and default support assignment teams.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Add New Department</h3>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Department Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Cybersecurity & InfoSec"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Department Head (Select User)</label>
            {!customHead ? (
              <div className="space-y-1.5">
                <select
                  value={headName}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomHead(true);
                      setHeadName('');
                    } else {
                      setHeadName(e.target.value);
                    }
                  }}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="">-- Select Registered User as Head --</option>
                  <option value="Unassigned">Unassigned / Pending</option>
                  <optgroup label="Registered Employees & Admins">
                    {users.map((u, idx) => (
                      <option key={`dept-user-${u.id || u.employeeId || u.name}-${idx}`} value={u.name}>
                        {u.name} — {u.role} ({u.department || 'All'})
                      </option>
                    ))}
                  </optgroup>
                  <option value="__custom__">✏️ + Enter Custom Name...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={headName}
                  onChange={e => setHeadName(e.target.value)}
                  placeholder="Enter custom head name"
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomHead(false);
                    setHeadName('');
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg border"
                >
                  List
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
            {!customTeam ? (
              <div className="space-y-1.5">
                <select
                  value={supportTeam}
                  onChange={e => {
                    if (e.target.value === '__custom__') {
                      setCustomTeam(true);
                      setSupportTeam('');
                    } else {
                      setSupportTeam(e.target.value);
                    }
                  }}
                  className="w-full p-2 border rounded-lg bg-white"
                >
                  <option value="">-- Select Support Team --</option>
                  {suggestedTeams.map((team, idx) => (
                    <option key={idx} value={team}>{team}</option>
                  ))}
                  <option value="__custom__">✏️ + Enter Custom Support Team...</option>
                </select>
              </div>
            ) : (
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={supportTeam}
                  onChange={e => setSupportTeam(e.target.value)}
                  placeholder="Enter custom support team"
                  className="flex-1 p-2 border rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomTeam(false);
                    setSupportTeam('');
                  }}
                  className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-bold rounded-lg border"
                >
                  List
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Department
          </button>
        </form>

        {/* Departments List */}
        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3 w-28">Dept ID</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Department Head</th>
                  <th className="p-3">Support Team</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map((d, idx) => (
                  <tr key={`dept-row-${d.id || d.name}-${idx}`} className="hover:bg-gray-50">
                    <td className="p-3">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                        {d.id}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-gray-900">{d.name}</td>
                    <td className="p-3 text-gray-700">{d.headName}</td>
                    <td className="p-3 text-blue-700 font-semibold">{d.supportTeam}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditModal({ id: d.id, name: d.name, headName: d.headName, supportTeam: d.supportTeam })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmModal({ id: d.id, name: d.name })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Edit Department</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Head (Select User)</label>
                <select
                  value={editModal.headName}
                  onChange={e => setEditModal({ ...editModal, headName: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="Unassigned">Unassigned / Pending</option>
                  <optgroup label="Registered Employees & Admins">
                    {users.map((u, idx) => (
                      <option key={`dept-create-head-${u.id || u.employeeId || u.name}-${idx}`} value={u.name}>
                        {u.name} — {u.role} ({u.department || 'All'})
                      </option>
                    ))}
                  </optgroup>
                  {editModal.headName && !users.some(u => u.name === editModal.headName) && editModal.headName !== 'Unassigned' && (
                    <option value={editModal.headName}>{editModal.headName} (Current)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
                <select
                  value={editModal.supportTeam}
                  onChange={e => setEditModal({ ...editModal, supportTeam: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="Default Team">Default Team</option>
                  {suggestedTeams.map((team, idx) => (
                    <option key={idx} value={team}>{team}</option>
                  ))}
                  {editModal.supportTeam && !suggestedTeams.includes(editModal.supportTeam) && editModal.supportTeam !== 'Default Team' && (
                    <option value={editModal.supportTeam}>{editModal.supportTeam} (Current)</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditModal(null)}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  editDepartment(editModal.id, {
                    name: editModal.name,
                    headName: editModal.headName,
                    supportTeam: editModal.supportTeam
                  });
                  setEditModal(null);
                }}
                className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg shadow"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Delete Department</h3>
            </div>
            <p className="text-gray-600 text-xs">
              Are you sure you want to delete department <strong className="text-gray-900 font-bold">"{deleteConfirmModal.name}"</strong>?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteDepartment(deleteConfirmModal.id);
                  setDeleteConfirmModal(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
