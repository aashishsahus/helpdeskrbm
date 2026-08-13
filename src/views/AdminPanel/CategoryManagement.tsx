import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Tags, Plus, Edit2, Trash2 } from 'lucide-react';
import { TicketPriority } from '../../types';

export const CategoryManagement: React.FC = () => {
  const { categories, addCategory, editCategory, deleteCategory, departments, prioritiesList } = useApp();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState(departments[0]?.name || 'IT Support');
  const [subCategoriesStr, setSubCategoriesStr] = useState('');
  const [defaultPriority, setDefaultPriority] = useState<TicketPriority>('Medium');

  const [editModal, setEditModal] = useState<{ id: string; name: string; department: string; subCategories: string; defaultPriority: TicketPriority } | null>(null);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const subs = subCategoriesStr.split(',').map(s => s.trim()).filter(Boolean);

    addCategory({
      name,
      department,
      subCategories: subs.length > 0 ? subs : ['General'],
      defaultPriority,
      defaultSLAHours: 8,
      defaultSupportTeam: 'Default Team'
    });

    setName('');
    setSubCategoriesStr('');
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Categories & Sub-Categories</h1>
        <p className="text-xs text-gray-500">Define ticket categories, sub-topic lists, and default priority classifications.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Create New Category</h3>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
            <input
              required
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Cloud Infrastructure"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Target Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Sub Categories (Comma Separated)</label>
            <input
              type="text"
              value={subCategoriesStr}
              onChange={e => setSubCategoriesStr(e.target.value)}
              placeholder="e.g. AWS Access, VPN, Firewall, DNS"
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-1">Default Priority</label>
            <select
              value={defaultPriority}
              onChange={e => setDefaultPriority(e.target.value as TicketPriority)}
              className="w-full p-2 border rounded-lg font-bold"
            >
              {prioritiesList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Category
          </button>
        </form>

        <div className="md:col-span-2 space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Category Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Sub-Categories</th>
                  <th className="p-3">Default Priority</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-3 font-bold text-gray-900">{c.name}</td>
                    <td className="p-3 text-gray-700">{c.department}</td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {c.subCategories.map((sub, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded font-mono">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-blue-600">{c.defaultPriority}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditModal({
                            id: c.id,
                            name: c.name,
                            department: c.department,
                            subCategories: c.subCategories.join(', '),
                            defaultPriority: c.defaultPriority
                          })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmModal({ id: c.id, name: c.name })}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Delete Category"
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
            <h3 className="font-bold text-sm text-gray-900 border-b pb-2">Edit Category</h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={editModal.name}
                  onChange={e => setEditModal({ ...editModal, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department</label>
                <select
                  value={editModal.department}
                  onChange={e => setEditModal({ ...editModal, department: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Sub Categories (Comma Separated)</label>
                <input
                  type="text"
                  value={editModal.subCategories}
                  onChange={e => setEditModal({ ...editModal, subCategories: e.target.value })}
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
                  const subs = editModal.subCategories.split(',').map(s => s.trim()).filter(Boolean);
                  editCategory(editModal.id, {
                    name: editModal.name,
                    department: editModal.department,
                    subCategories: subs.length > 0 ? subs : ['General']
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
              <h3 className="font-extrabold text-sm text-gray-900">Delete Category</h3>
            </div>
            <p className="text-gray-600 text-xs">
              Are you sure you want to delete category <strong className="text-gray-900 font-bold">"{deleteConfirmModal.name}"</strong>?
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
                  deleteCategory(deleteConfirmModal.id);
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
