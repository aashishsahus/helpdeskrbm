import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Building2, Plus, Edit2, Trash2 } from 'lucide-react';

export const DepartmentManagement: React.FC = () => {
  const { departments, addDepartment, editDepartment, deleteDepartment } = useApp();

  const [name, setName] = useState('');
  const [headName, setHeadName] = useState('');
  const [supportTeam, setSupportTeam] = useState('');

  const [editModal, setEditModal] = useState<{ id: string; name: string; headName: string; supportTeam: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    addDepartment({
      name,
      headName: headName || 'Unassigned',
      supportTeam: supportTeam || 'Default Team'
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
            <label className="block font-bold text-gray-700 mb-1">Department Head</label>
            <input
              type="text"
              value={headName}
              onChange={e => setHeadName(e.target.value)}
              placeholder="e.g. Marcus Brody"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
            <input
              type="text"
              value={supportTeam}
              onChange={e => setSupportTeam(e.target.value)}
              placeholder="e.g. InfoSec Response Team"
              className="w-full p-2 border rounded-lg"
            />
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
                  <th className="p-3">Department</th>
                  <th className="p-3">Department Head</th>
                  <th className="p-3">Support Team</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
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
                          onClick={() => {
                            if (window.confirm(`Delete department "${d.name}"?`)) deleteDepartment(d.id);
                          }}
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
                <label className="block font-bold text-gray-700 mb-1">Department Head</label>
                <input
                  type="text"
                  value={editModal.headName}
                  onChange={e => setEditModal({ ...editModal, headName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
                <input
                  type="text"
                  value={editModal.supportTeam}
                  onChange={e => setEditModal({ ...editModal, supportTeam: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
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
    </div>
  );
};
