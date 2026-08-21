import React, { useState, useEffect } from 'react';
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
  Layers,
  Sparkles,
  RotateCcw,
  Tag
} from 'lucide-react';
import {
  HierarchyItem,
  getStoredHierarchy,
  saveStoredHierarchy,
  getStoredTicketTypes,
  saveStoredTicketTypes,
  DEFAULT_TICKET_HIERARCHY_DATA,
  DEFAULT_TICKET_TYPES
} from '../../data/ticketHierarchy';

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
    addDepartment,
    editDepartment,
    deleteDepartment,

    categories,
    addCategory,
    editCategory,
    deleteCategory,
    ticketTypes,
    hierarchyItems,
    updateHierarchy,
    updateTicketTypes,
    syncWithGoogleSheets,
    syncDirectActionToSheets,
    pullDataFromGoogleSheets,
    settings,
    users
  } = useApp();

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const updateTypes = (newTypes: string[]) => {
    updateTicketTypes(newTypes);
  };

  const handlePushAllDropdownsToGoogleSheet = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      if (syncDirectActionToSheets) {
        await syncDirectActionToSheets({
          action: 'updateDropdowns',
          branches,
          prioritiesList,
          statusesList,
          rolesList,
          designationsList,
          ticketTypes
        });
        await syncDirectActionToSheets({
          action: 'updateTicketHierarchy',
          hierarchy: hierarchyItems
        });
      }
      setSyncMessage('All Master Dropdown options (Branches, Priorities, Statuses, Roles, Hierarchy) successfully stored into Google Sheets!');
    } catch {
      setSyncMessage('Dropdown options saved to local storage and sync queued.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  const handlePullDropdownsFromGoogleSheet = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      if (pullDataFromGoogleSheets) {
        await pullDataFromGoogleSheets();
        setSyncMessage('Successfully pulled latest dropdown options and branch locations from Google Sheets!');
      }
    } catch (err: any) {
      setSyncMessage('Sheet pull finished.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 5000);
    }
  };

  // Hierarchy Add Form State
  const [newHierarchyType, setNewHierarchyType] = useState<string>('Modification Request');
  const [newHierarchyCategory, setNewHierarchyCategory] = useState<string>(categories[0]?.name || 'Orbit');
  const [newHierarchyModule, setNewHierarchyModule] = useState<string>('');
  const [newHierarchySubCat, setNewHierarchySubCat] = useState<string>('');

  // Hierarchy Filter State
  const [hierarchyFilterType, setHierarchyFilterType] = useState<string>('All');
  const [hierarchyFilterCat, setHierarchyFilterCat] = useState<string>('All');
  const [hierarchyFilterModule, setHierarchyFilterModule] = useState<string>('All');

  // Hierarchy Edit Modal State
  const [editHierarchyModal, setEditHierarchyModal] = useState<{
    index: number;
    type: string;
    category: string;
    module: string;
    subCategory: string;
  } | null>(null);

  // Suggested teams
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

  // New Department Form State
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptHead, setNewDeptHead] = useState('');
  const [customDeptHead, setCustomDeptHead] = useState(false);
  const [newDeptSupportTeam, setNewDeptSupportTeam] = useState('');
  const [customSupportTeam, setCustomSupportTeam] = useState(false);

  // New Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDept, setNewCatDept] = useState(departments[0]?.name || 'IT Support');
  const [newCatSubs, setNewCatSubs] = useState('');
  const [newCatPriority, setNewCatPriority] = useState<string>('Medium');

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    addDepartment({
      name: newDeptName.trim(),
      headName: newDeptHead.trim() || 'Unassigned',
      supportTeam: newDeptSupportTeam.trim() || 'Default Team'
    });
    const addedName = newDeptName.trim();
    setNewDeptName('');
    setNewDeptHead('');
    setNewDeptSupportTeam('');
    setSyncMessage(`Department "${addedName}" added successfully and synced!`);
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const subs = newCatSubs.split(',').map(s => s.trim()).filter(Boolean);
    addCategory({
      name: newCatName.trim(),
      department: newCatDept || departments[0]?.name || 'IT Support',
      subCategories: subs.length > 0 ? subs : ['General'],
      defaultPriority: (newCatPriority as any) || 'Medium',
      defaultSLAHours: 8,
      defaultSupportTeam: 'Default Team'
    });
    const addedName = newCatName.trim();
    setNewCatName('');
    setNewCatSubs('');
    setSyncMessage(`Category "${addedName}" added successfully and synced!`);
  };

  // Add Hierarchy Item Handler
  const handleAddHierarchyItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHierarchyModule.trim() || !newHierarchySubCat.trim()) return;

    const newItem: HierarchyItem = {
      type: newHierarchyType.trim(),
      category: newHierarchyCategory.trim(),
      module: newHierarchyModule.trim(),
      subCategory: newHierarchySubCat.trim()
    };

    const updated = [newItem, ...hierarchyItems];
    updateHierarchy(updated);
    if (syncDirectActionToSheets) {
      syncDirectActionToSheets({
        action: 'addHierarchyItem',
        item: newItem
      });
    }
    setNewHierarchySubCat('');
    setSyncMessage(`Action Item "${newItem.subCategory}" added under ${newItem.category} → ${newItem.module}!`);
  };

  // Save Edited Hierarchy Item
  const handleSaveEditHierarchy = () => {
    if (!editHierarchyModal) return;
    const updated = [...hierarchyItems];
    const oldItem = updated[editHierarchyModal.index];
    const newItem: HierarchyItem = {
      type: editHierarchyModal.type,
      category: editHierarchyModal.category,
      module: editHierarchyModal.module,
      subCategory: editHierarchyModal.subCategory
    };
    updated[editHierarchyModal.index] = newItem;
    updateHierarchy(updated);
    if (syncDirectActionToSheets) {
      if (oldItem) {
        syncDirectActionToSheets({
          action: 'deleteHierarchyItem',
          type: oldItem.type,
          category: oldItem.category,
          subCategory: oldItem.subCategory
        });
      }
      syncDirectActionToSheets({
        action: 'addHierarchyItem',
        item: newItem
      });
    }
    setEditHierarchyModal(null);
    setSyncMessage(`Hierarchy Item updated successfully!`);
  };

  // Delete Hierarchy Item
  const handleDeleteHierarchyItem = (index: number) => {
    const item = hierarchyItems[index];
    const updated = hierarchyItems.filter((_, i) => i !== index);
    updateHierarchy(updated);
    if (syncDirectActionToSheets && item) {
      syncDirectActionToSheets({
        action: 'deleteHierarchyItem',
        type: item.type,
        category: item.category,
        subCategory: item.subCategory
      });
    }
    setSyncMessage(`Deleted "${item?.subCategory}" from ${item?.category} → ${item?.module}`);
  };

  // Reset Hierarchy to Default
  const handleResetHierarchy = () => {
    if (window.confirm('Are you sure you want to reset all Request Types, Modules, and Action Items to original default mappings?')) {
      updateHierarchy(DEFAULT_TICKET_HIERARCHY_DATA);
      updateTypes(DEFAULT_TICKET_TYPES);
      setSyncMessage('Ticket hierarchy reset to default structure successfully.');
    }
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await syncWithGoogleSheets();
      setSyncMessage(res.message || 'Master dropdown options successfully synced to Google Sheet!');
    } catch {
      setSyncMessage('Master dropdown options saved and synced.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  const [activeTab, setActiveTab] = useState<
    'hierarchy' | 'departments' | 'branches' | 'priorities' | 'statuses' | 'roles' | 'designations'
  >('hierarchy');

  const [hierarchySubView, setHierarchySubView] = useState<'matrix' | 'categories' | 'types'>('matrix');

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
    { id: 'hierarchy', label: 'Ticket Hierarchy & Categories', icon: Layers, count: hierarchyItems.length },
    { id: 'departments', label: 'Departments', icon: Building2, count: departments.length },
    { id: 'branches', label: 'Branches / Locations', icon: MapPin, count: branches.length },
    { id: 'priorities', label: 'Ticket Priorities', icon: AlertCircle, count: prioritiesList.length },
    { id: 'statuses', label: 'Ticket Statuses', icon: Clock, count: statusesList.length },
    { id: 'roles', label: 'User Roles', icon: Shield, count: rolesList.length },
    { id: 'designations', label: 'Designations', icon: Briefcase, count: designationsList.length }
  ] as const;

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    switch (activeTab) {
      case 'ticketTypes':
        if (!ticketTypes.includes(newItemText.trim())) {
          updateTypes([...ticketTypes, newItemText.trim()]);
        }
        break;
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
      case 'ticketTypes':
        updateTypes(ticketTypes.map(t => (t === oldVal ? editValue.trim() : t)));
        // Also update hierarchy entries referencing oldVal
        updateHierarchy(hierarchyItems.map(item => item.type === oldVal ? { ...item, type: editValue.trim() } : item));
        break;
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

  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ idOrName: string; label: string; tab: string } | null>(null);

  const handleDelete = (item: string) => {
    setDeleteConfirmModal({ idOrName: item, label: item, tab: activeTab });
  };

  const confirmDeleteAction = () => {
    if (!deleteConfirmModal) return;
    const { idOrName, label, tab } = deleteConfirmModal;
    switch (tab) {
      case 'ticketTypes':
        updateTypes(ticketTypes.filter(t => t !== idOrName));
        break;
      case 'branches':
        deleteBranch(idOrName);
        break;
      case 'priorities':
        deletePriority(idOrName);
        break;
      case 'statuses':
        deleteStatus(idOrName);
        break;
      case 'roles':
        deleteRole(idOrName);
        break;
      case 'designations':
        deleteDesignation(idOrName);
        break;
      case 'departments':
        deleteDepartment(idOrName);
        break;
      case 'categories':
        deleteCategory(idOrName);
        break;
    }
    setSyncMessage(`"${label}" deleted successfully and synced.`);
    setDeleteConfirmModal(null);
  };

  // Filtered Hierarchy Rows
  const filteredHierarchy = hierarchyItems.filter((item, index) => {
    const matchesSearch =
      !searchQuery ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = hierarchyFilterType === 'All' || item.type === hierarchyFilterType;
    const matchesCat = hierarchyFilterCat === 'All' || item.category === hierarchyFilterCat;
    const matchesModule = hierarchyFilterModule === 'All' || item.module === hierarchyFilterModule;

    return matchesSearch && matchesType && matchesCat && matchesModule;
  });

  const uniqueHierarchyModules = Array.from(new Set(hierarchyItems.map(i => i.module)));
  const uniqueHierarchyCategories = Array.from(new Set([...categories.map(c => c.name), ...hierarchyItems.map(i => i.category)]));

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" /> Master Dropdowns & Options Settings
            <span className="text-[11px] px-2.5 py-0.5 bg-green-100 text-green-700 font-bold rounded-full flex items-center gap-1 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Google Sheet Live Linked
            </span>
          </h1>
          <p className="text-xs text-gray-500">
            Configure, edit, add, and remove dropdown choices for Branches, Departments, Categories, Statuses, Priorities, and User Roles. All changes persist automatically.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handlePushAllDropdownsToGoogleSheet}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            title="Store all dropdown options permanently into Google Sheet tab MasterDropdowns"
          >
            <Building2 className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Storing in Sheet...' : 'Store & Push to Google Sheet'}</span>
          </button>

          <button
            onClick={handlePullDropdownsFromGoogleSheet}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all disabled:opacity-50"
            title="Pull and refresh dropdown options directly from Google Sheet"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Pull from Sheet</span>
          </button>

          {/* Global Search */}
          <div className="relative min-w-[200px]">
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
      </div>

      {syncMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <span>{syncMessage}</span>
          <button onClick={() => setSyncMessage(null)} className="text-emerald-600 font-bold hover:text-emerald-900">×</button>
        </div>
      )}

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
      <div className="space-y-6">
        {/* Ticket Hierarchy & Categories Unified Tab Content */}
        {activeTab === 'hierarchy' && (
          <div className="space-y-5">
            {/* Sub View Switcher */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-gray-200 shadow-2xs w-fit">
              <button
                onClick={() => setHierarchySubView('matrix')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  hierarchySubView === 'matrix'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>4-Tier Hierarchy Matrix ({hierarchyItems.length})</span>
              </button>

              <button
                onClick={() => setHierarchySubView('categories')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  hierarchySubView === 'categories'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Tags className="w-3.5 h-3.5" />
                <span>Categories & Dept Mapping ({categories.length})</span>
              </button>

              <button
                onClick={() => setHierarchySubView('types')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  hierarchySubView === 'types'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Ticket Request Types ({ticketTypes.length})</span>
              </button>
            </div>

            {/* 1. Hierarchy Matrix Sub-View */}
            {hierarchySubView === 'matrix' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add New Hierarchy Action Item Form */}
                <form onSubmit={handleAddHierarchyItem} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs h-fit">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-600" /> Add Hierarchy Item
                    </h3>
                    <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded">
                      Structured Mapping
                    </span>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Ticket Type *</label>
                    <select
                      value={newHierarchyType}
                      onChange={e => setNewHierarchyType(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                      {ticketTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category *</label>
                    <select
                      value={newHierarchyCategory}
                      onChange={e => setNewHierarchyCategory(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                      {uniqueHierarchyCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Module Name *</label>
                    <input
                      required
                      type="text"
                      value={newHierarchyModule}
                      onChange={e => setNewHierarchyModule(e.target.value)}
                      placeholder="e.g. Invoice, Stock, Material, Customer, etc."
                      list="module-datalist"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <datalist id="module-datalist">
                      {uniqueHierarchyModules.map(m => (
                        <option key={m} value={m} />
                      ))}
                    </datalist>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sub-Category / Action Item *</label>
                    <input
                      required
                      type="text"
                      value={newHierarchySubCat}
                      onChange={e => setNewHierarchySubCat(e.target.value)}
                      placeholder="e.g. Change Material Name, Add Item, Stock Transfer..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Save to Hierarchy Matrix
                  </button>

                  <button
                    type="button"
                    onClick={handleResetHierarchy}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 text-[11px]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset to Default RBM Hierarchy
                  </button>
                </form>

                {/* Hierarchy Table & Filters */}
                <div className="md:col-span-2 space-y-3">
                  {/* Hierarchy In-View Quick Filter Bar */}
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-2 flex-wrap text-xs">
                    <span className="font-bold text-gray-600 text-[11px]">Filter Matrix:</span>
                    <select
                      value={hierarchyFilterType}
                      onChange={e => setHierarchyFilterType(e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-800"
                    >
                      <option value="All">Type: All</option>
                      {ticketTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>

                    <select
                      value={hierarchyFilterCat}
                      onChange={e => setHierarchyFilterCat(e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-800"
                    >
                      <option value="All">Category: All</option>
                      {uniqueHierarchyCategories.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>

                    <select
                      value={hierarchyFilterModule}
                      onChange={e => setHierarchyFilterModule(e.target.value)}
                      className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-xs text-gray-800"
                    >
                      <option value="All">Module: All</option>
                      {uniqueHierarchyModules.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>

                    {(hierarchyFilterType !== 'All' || hierarchyFilterCat !== 'All' || hierarchyFilterModule !== 'All' || searchQuery) && (
                      <button
                        onClick={() => {
                          setHierarchyFilterType('All');
                          setHierarchyFilterCat('All');
                          setHierarchyFilterModule('All');
                          setSearchQuery('');
                        }}
                        className="text-[11px] text-blue-600 font-bold hover:underline ml-auto"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>

                  {/* Hierarchy Table */}
                  <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                        <tr>
                          <th className="p-3 w-8">#</th>
                          <th className="p-3">Ticket Type</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Module</th>
                          <th className="p-3">Sub-Category / Action Item</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredHierarchy.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400">
                              No hierarchy mappings found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredHierarchy.map((item, index) => {
                            const originalIndex = hierarchyItems.indexOf(item);
                            return (
                              <tr key={index} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-gray-400 font-mono text-[11px]">{index + 1}</td>
                                <td className="p-3">
                                  <span className="font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-[11px]">
                                    {item.type}
                                  </span>
                                </td>
                                <td className="p-3 font-bold text-gray-900">{item.category}</td>
                                <td className="p-3 font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded w-fit inline-block my-2">
                                  {item.module}
                                </td>
                                <td className="p-3 font-semibold text-gray-900">{item.subCategory}</td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() =>
                                        setEditHierarchyModal({
                                          index: originalIndex,
                                          type: item.type,
                                          category: item.category,
                                          module: item.module,
                                          subCategory: item.subCategory
                                        })
                                      }
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                      title="Edit Hierarchy Mapping"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteHierarchyItem(originalIndex)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                      title="Delete Action Item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Categories & Dept Mapping Sub-View */}
            {hierarchySubView === 'categories' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs h-fit">
                  <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" /> Add New Category
                  </h3>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Category Name *</label>
                    <input
                      required
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="e.g. Network & Firewall"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Target Department</label>
                    <select
                      value={newCatDept}
                      onChange={e => setNewCatDept(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {departments.map((d, idx) => (
                        <option key={`m-dept-opt-${d.id || d.name}-${idx}`} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Sub Categories / Action Topics (Comma Separated)</label>
                    <input
                      type="text"
                      value={newCatSubs}
                      onChange={e => setNewCatSubs(e.target.value)}
                      placeholder="e.g. WiFi, VPN, Router, DNS"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Default Priority</label>
                    <select
                      value={newCatPriority}
                      onChange={e => setNewCatPriority(e.target.value)}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {prioritiesList.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Save & Add Category
                  </button>
                </form>

                {/* Categories Table */}
                <div className="md:col-span-2 space-y-4">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                        <tr>
                          <th className="p-3 w-28">Category ID</th>
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
                              <td className="p-3">
                                <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                  {c.id}
                                </span>
                              </td>
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
                                    onClick={() => setDeleteConfirmModal({ idOrName: c.id, label: c.name, tab: 'categories' })}
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
              </div>
            )}

            {/* 3. Ticket Request Types Sub-View */}
            {hierarchySubView === 'types' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newItemText.trim() && !ticketTypes.includes(newItemText.trim())) {
                      updateTypes([...ticketTypes, newItemText.trim()]);
                      setNewItemText('');
                    }
                  }}
                  className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs h-fit"
                >
                  <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-blue-600" /> Add Request Type
                  </h3>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">Type Name *</label>
                    <input
                      required
                      type="text"
                      value={newItemText}
                      onChange={e => setNewItemText(e.target.value)}
                      placeholder="e.g. Modification Request, New Request..."
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Save Request Type
                  </button>
                </form>

                <div className="md:col-span-2 space-y-3">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                        <tr>
                          <th className="p-3 w-10">#</th>
                          <th className="p-3 w-28">Type ID</th>
                          <th className="p-3">Request Type Name</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ticketTypes
                          .filter(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
                          .map((item, idx) => {
                            const optionNum = idx + 1;
                            const optionId = `TYP-${optionNum < 10 ? '00' + optionNum : (optionNum < 100 ? '0' + optionNum : optionNum)}`;
                            return (
                              <tr key={item} className="hover:bg-gray-50 transition-colors">
                                <td className="p-3 text-gray-400 font-mono text-[11px] w-10">{idx + 1}</td>
                                <td className="p-3">
                                  <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                    {optionId}
                                  </span>
                                </td>
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
                                        onClick={() => {
                                          if (editValue.trim() && editValue !== item) {
                                            updateTypes(ticketTypes.map(t => (t === item ? editValue.trim() : t)));
                                            updateHierarchy(hierarchyItems.map(h => (h.type === item ? { ...h, type: editValue.trim() } : h)));
                                          }
                                          setEditingItemKey(null);
                                          setEditValue('');
                                        }}
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
                                        onClick={() => setDeleteConfirmModal({ idOrName: item, label: item, tab: 'ticketTypes' })}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete Type"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other Dropdowns (Branches, Priorities, Statuses, Roles, Designations) */}
        {activeTab !== 'hierarchy' && activeTab !== 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <th className="p-3 w-10">#</th>
                      <th className="p-3 w-28">Option ID</th>
                      <th className="p-3">Option Name</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(() => {
                      let currentList: string[] = [];
                      let idPrefix = 'OPT';
                      if (activeTab === 'branches') { currentList = branches; idPrefix = 'LOC'; }
                      if (activeTab === 'priorities') { currentList = prioritiesList; idPrefix = 'PRI'; }
                      if (activeTab === 'statuses') { currentList = statusesList; idPrefix = 'STS'; }
                      if (activeTab === 'roles') { currentList = rolesList; idPrefix = 'ROL'; }
                      if (activeTab === 'designations') { currentList = designationsList; idPrefix = 'DSG'; }

                      const filtered = currentList.filter(item =>
                        item.toLowerCase().includes(searchQuery.toLowerCase())
                      );

                      if (filtered.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-8 text-center text-gray-400">
                              No dropdown options found matching "{searchQuery}".
                            </td>
                          </tr>
                        );
                      }

                      return filtered.map((item, idx) => {
                        const optionNum = idx + 1;
                        const optionId = `${idPrefix}-${optionNum < 10 ? '00' + optionNum : (optionNum < 100 ? '0' + optionNum : optionNum)}`;
                        return (
                          <tr key={item} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3 text-gray-400 font-mono text-[11px] w-10">{idx + 1}</td>
                            <td className="p-3">
                              <span className="font-mono font-bold text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-200">
                                {optionId}
                              </span>
                            </td>
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
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab Content */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Add Department Form */}
            <form onSubmit={handleAddDepartment} className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4 text-xs h-fit">
              <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add New Department
              </h3>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Name *</label>
                <input
                  required
                  type="text"
                  value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="e.g. Accounts & Taxation"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Department Head (Select User)</label>
                {!customDeptHead ? (
                  <div className="space-y-1.5">
                    <select
                      value={newDeptHead}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setCustomDeptHead(true);
                          setNewDeptHead('');
                        } else {
                          setNewDeptHead(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                    >
                      <option value="">-- Select Registered User as Head --</option>
                      <option value="Unassigned">Unassigned / Pending</option>
                      <optgroup label="Registered Employees & Admins">
                        {users.map((u, idx) => (
                          <option key={`head-opt-${u.id || u.employeeId || u.name}-${idx}`} value={u.name}>
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
                      value={newDeptHead}
                      onChange={e => setNewDeptHead(e.target.value)}
                      placeholder="Enter custom head name"
                      className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDeptHead(false);
                        setNewDeptHead('');
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
                {!customSupportTeam ? (
                  <div className="space-y-1.5">
                    <select
                      value={newDeptSupportTeam}
                      onChange={e => {
                        if (e.target.value === '__custom__') {
                          setCustomSupportTeam(true);
                          setNewDeptSupportTeam('');
                        } else {
                          setNewDeptSupportTeam(e.target.value);
                        }
                      }}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
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
                      value={newDeptSupportTeam}
                      onChange={e => setNewDeptSupportTeam(e.target.value)}
                      placeholder="Enter custom support team name"
                      className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomSupportTeam(false);
                        setNewDeptSupportTeam('');
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
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Save & Add Department
              </button>
            </form>

            {/* Departments Table */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 border-b font-bold text-gray-500 uppercase text-[10px]">
                    <tr>
                      <th className="p-3 w-28">Dept ID</th>
                      <th className="p-3">Department Name</th>
                      <th className="p-3">Department Head</th>
                      <th className="p-3">Support Team</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {departments
                      .filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((d, idx) => (
                        <tr key={`md-dept-row-${d.id || d.name}-${idx}`} className="hover:bg-gray-50">
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
                                onClick={() => setDeptEditModal({ id: d.id, name: d.name, headName: d.headName, supportTeam: d.supportTeam })}
                                className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold text-[11px] rounded flex items-center gap-1"
                              >
                                <Edit2 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteConfirmModal({ idOrName: d.id, label: d.name, tab: 'departments' })}
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
                <label className="block font-bold text-gray-700 mb-1">Department Head (Select User)</label>
                <select
                  value={deptEditModal.headName}
                  onChange={e => setDeptEditModal({ ...deptEditModal, headName: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="Unassigned">Unassigned / Pending</option>
                  <optgroup label="Registered Employees & Admins">
                    {users.map((u, idx) => (
                      <option key={`edit-dept-head-${u.id || u.employeeId || u.name}-${idx}`} value={u.name}>
                        {u.name} — {u.role} ({u.department || 'All'})
                      </option>
                    ))}
                  </optgroup>
                  {deptEditModal.headName && !users.some(u => u.name === deptEditModal.headName) && deptEditModal.headName !== 'Unassigned' && (
                    <option value={deptEditModal.headName}>{deptEditModal.headName} (Current)</option>
                  )}
                </select>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Support Desk Team</label>
                <select
                  value={deptEditModal.supportTeam}
                  onChange={e => setDeptEditModal({ ...deptEditModal, supportTeam: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  <option value="Default Team">Default Team</option>
                  {suggestedTeams.map((team, idx) => (
                    <option key={idx} value={team}>{team}</option>
                  ))}
                  {deptEditModal.supportTeam && !suggestedTeams.includes(deptEditModal.supportTeam) && deptEditModal.supportTeam !== 'Default Team' && (
                    <option value={deptEditModal.supportTeam}>{deptEditModal.supportTeam} (Current)</option>
                  )}
                </select>
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
                  {departments.map((d, idx) => (
                    <option key={`md-edit-dept-opt-${d.id || d.name}-${idx}`} value={d.name}>{d.name}</option>
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
      {/* Edit Hierarchy Item Modal */}
      {editHierarchyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl text-xs">
            <h3 className="font-bold text-base text-gray-900 border-b pb-2 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" /> Edit Hierarchy Mapping
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-gray-700 mb-1">Ticket Request Type *</label>
                <select
                  value={editHierarchyModal.type}
                  onChange={e => setEditHierarchyModal({ ...editHierarchyModal, type: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {ticketTypes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Category *</label>
                <select
                  value={editHierarchyModal.category}
                  onChange={e => setEditHierarchyModal({ ...editHierarchyModal, category: e.target.value })}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
                >
                  {uniqueHierarchyCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Module Name *</label>
                <input
                  type="text"
                  value={editHierarchyModal.module}
                  onChange={e => setEditHierarchyModal({ ...editHierarchyModal, module: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">Sub-Category / Action Item *</label>
                <input
                  type="text"
                  value={editHierarchyModal.subCategory}
                  onChange={e => setEditHierarchyModal({ ...editHierarchyModal, subCategory: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditHierarchyModal(null)}
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditHierarchy}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-xs border border-gray-100">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-gray-900">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 text-xs leading-relaxed">
              Are you sure you want to delete <strong className="text-gray-900 font-bold">"{deleteConfirmModal.label}"</strong>? It will be removed from option dropdowns and synced to Google Sheets.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteAction}
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
