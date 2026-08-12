import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  MapPin,
  ListFilter,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  Building2,
  Tags,
  Shield,
  Briefcase,
  AlertCircle,
  Clock,
  Layers
} from 'lucide-react';

export const MasterDropdownsView: React.FC = () => {
  const {
    branches,
    addBranch,
    editBranch,
    deleteBranch,

    prioritiesList,
    addPriority,
    editPriority,
    deletePriority,

    statusesList,
    addStatus,
    editStatus,
    deleteStatus,

    rolesList,
    addRole,
    editRole,
    deleteRole,

    designationsList,
    addDesignation,
    editDesignation,
    deleteDesignation,

    departments,
    editDepartment,
    deleteDepartment,

    categories,
    editCategory,
    deleteCategory
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'branches' | 'departments' | 'categories' | 'priorities' | 'statuses' | 'roles' | 'designations'
  >('branches');

  const [searchQuery, setSearchQuery] = useState('');
  const [newItemText, setNewItemText] = useState('');

  // Editing State
  const [editingItemKey, setEditingItemKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Department Edit Modal / Inline
  const [deptEditModal, setDeptEditModal] = useState<{ id: string; name: string; headName: string; supportTeam: string } | null>(null);

  // Category Edit Modal
  const [catEditModal, setCatEditModal] = useState<{ id: string; name: string; department: string; subCategories: string; defaultPriority: string } | null>(null);

  const tabs = [
    { id: 'branches', label: 'Branches / Locations', icon: MapPin, count: branches.length },
    { id: 'departments', label: 'Departments', icon: Building2, count: departments.length },
    { id: 'categories', label: 'Categories & Subs', icon: Tags, count: categories.length },
    { id: 'priorities', label: 'Ticket Priorities', icon: AlertCircle, count: prioritiesList.length },
    { id: 'statuses', label: 'Ticket Statuses', icon: Clock, count: statusesList.length },
    { id: 'roles', label: 'User Roles', icon: Shield, count: rolesList.length },
    { id: 'designations', label: 'Designations', icon: Briefcase, count: designationsList.length }
  ] as const;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    switch (activeTab) {
      case 'branches':
        addBranch(newItemText);
        break;
      case 'priorities':
        addPriority(newItemText);
        break;
      case 'statuses':
        addStatus(newItemText);
        break;
      case 'roles':
        addRole(newItemText);
        break;
      case 'designations':
        addDesignation(newItemText);
        break;
    }
    setNewItemText('');
  };

  const handleSaveEdit = (oldVal: string) => {
    if (!editValue.trim() || editValue === oldVal) {
      setEditingItemKey(null);
      return;
    }

    switch (activeTab) {
      case 'branches':
        editBranch(oldVal, editValue);
        break;
      case 'priorities':
        editPriority(oldVal, editValue);
        break;
      case 'statuses':
        editStatus(oldVal, editValue);
        break;
      case 'roles':
        editRole(oldVal, editValue);
        break;
      case 'designations':
        editDesignation(oldVal, editValue);
        break;
    }
    setEditingItemKey(null);
    setEditValue('');
  };

  const handleDelete = (item: string) => {
    if (!window.confirm(`Are you sure you want to delete "${item}"? This option will no longer appear in dropdowns.`)) return;

    switch (activeTab) {
      case 'branches':
        deleteBranch(item);
        break;
      case 'priorities':
        deletePriority(item);
        break;
      case 'statuses':
        deleteStatus(item);
        break;
      case 'roles':
        deleteRole(item);
        break;
      case 'designations':
        deleteDesignation(item);
        break;
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Master Dropdowns & Options Settings
          </h1>
          <p className="text-xs text-gray-500">
            Configure, edit, add, and remove dropdown choices for Branches, Departments, Categories, Statuses, Priorities, and User Roles.
          </p>
        </div>

        {/* Global Search */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search options..."
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setEditingItemKey(null);
                setNewItemText('');
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-mono ${
                  isActive ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Panel Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Simple List Management (Branches, Priorities, Statuses, Roles, Designations) */}
        {activeTab !== 'departments' && activeTab !== 'categories' && (
          <>
            {/* Add Option Form */}
            <form onSubmit={handleAddItem} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs h-fit">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add New {tabs.find(t => t.id === activeTab)?.label.slice(0, -1) || 'Option'}
              </h3>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Option Name *</label>
                <input
                  required
                  type="text"
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  placeholder={`e.g. Enter new ${activeTab} name...`}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save Option
              </button>
            </form>

            {/* List Table */}
            <div className="md:col-span-2 space-y-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">#</th>
                      <th className="p-3">Option Name</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      let currentList: string[] = [];
                      if (activeTab === 'branches') currentList = branches;
                      if (activeTab === 'priorities') currentList = prioritiesList;
                      if (activeTab === 'statuses') currentList = statusesList;
                      if (activeTab === 'roles') currentList = rolesList;
                      if (activeTab === 'designations') currentList = designationsList;

                      const filtered = currentList.filter(item =>
                        item.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={3} className="p-8 text-center text-gray-400">
                              No dropdown options found matching "{searchQuery}".
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((item, idx) => (
                        <tr key={item} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 text-gray-400 font-mono text-[11px] w-12">{idx + 1}</td>
                          <td className="p-3 font-semibold text-gray-900">
                            {editingItemKey === item ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  className="px-2 py-1 border border-blue-500 rounded focus:outline-none text-xs w-full"
                                  autoFocus
                                />
                              </div>
                            ) : (
                              <span>{item}</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {editingItemKey === item ? (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleSaveEdit(item)}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Save Changes"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingItemKey(null)}
                                  className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => {
                                    setEditingItemKey(item);
                                    setEditValue(item);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit Name"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Option"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Departments Tab Content */}
        {activeTab === 'departments' && (
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Department Name</th>
                    <th className="p-3">Department Head</th>
                    <th className="p-3">Support Team</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departments
                    .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(d => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="p-3 font-bold text-gray-900">{d.name}</td>
                        <td className="p-3 text-gray-700">{d.headName}</td>
                        <td className="p-3 text-blue-700 font-semibold">{d.supportTeam}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setDeptEditModal({ id: d.id, name: d.name, headName: d.headName, supportTeam: d.supportTeam })}
                              className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] rounded flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete department "${d.name}"?`)) deleteDepartment(d.id);
                              }}
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] rounded flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Categories Tab Content */}
        {activeTab === 'categories' && (
          <div className="md:col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Target Department</th>
                    <th className="p-3">Sub Categories</th>
                    <th className="p-3">Default Priority</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories
                    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(c => (
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
                              onClick={() =>
                                setCatEditModal({
                                  id: c.id,
                                  name: c.name,
                                  department: c.department,
                                  subCategories: c.subCategories.join(', '),
                                  defaultPriority: c.defaultPriority
                                })
                              }
                              className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] rounded flex items-center gap-1"
                            >
                              <Edit2 className="w-3 h-3" /> Edit
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete category "${c.name}"?`)) deleteCategory(c.id);
                              }}
                              className="px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-[11px] rounded flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Department Modal */}
      {deptEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-gray-900 border-b pb-2">Edit Department</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Name</label>
                <input
                  type="text"
                  value={deptEditModal.name}
                  onChange={e => setDeptEditModal({ ...deptEditModal, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Head</label>
                <input
                  type="text"
                  value={deptEditModal.headName}
                  onChange={e => setDeptEditModal({ ...deptEditModal, headName: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
                <input
                  type="text"
                  value={deptEditModal.supportTeam}
                  onChange={e => setDeptEditModal({ ...deptEditModal, supportTeam: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeptEditModal(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  editDepartment(deptEditModal.id, {
                    name: deptEditModal.name,
                    headName: deptEditModal.headName,
                    supportTeam: deptEditModal.supportTeam
                  });
                  setDeptEditModal(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {catEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="font-bold text-base text-gray-900 border-b pb-2">Edit Category</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  value={catEditModal.name}
                  onChange={e => setCatEditModal({ ...catEditModal, name: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Department</label>
                <select
                  value={catEditModal.department}
                  onChange={e => setCatEditModal({ ...catEditModal, department: e.target.value })}
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
                  value={catEditModal.subCategories}
                  onChange={e => setCatEditModal({ ...catEditModal, subCategories: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCatEditModal(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const subs = catEditModal.subCategories.split(',').map(s => s.trim()).filter(Boolean);
                  editCategory(catEditModal.id, {
                    name: catEditModal.name,
                    department: catEditModal.department,
                    subCategories: subs.length > 0 ? subs : ['General']
                  });
                  setCatEditModal(null);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
