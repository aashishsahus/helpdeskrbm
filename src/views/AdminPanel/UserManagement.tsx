import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  KeyRound,
  Shield,
  X,
  CheckCircle2,
  RefreshCw,
  RotateCcw,
  Building2,
  MapPin,
  Mail,
  Phone,
  Filter,
  Check,
  Trash2,
  Archive,
  Lock,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    deleteUserPermanentlyAndArchive,
    restoreDefaultUsers,
    pullDataFromGoogleSheets,
    departments,
    branches,
    rolesList,
    designationsList,
    currentUser,
    hasPermission,
    archivedUsers,
    setActiveView
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Deletion Modal State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteReason, setDeleteReason] = useState('Employee offboarding / Role conclude');
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Employee');
  const [department, setDepartment] = useState(departments[0]?.name || 'IT Support');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState(branches[0] || 'Headquarters - NY');
  const [mobile, setMobile] = useState('');
  const [userStatus, setUserStatus] = useState<'Active' | 'Disabled'>('Active');

  const isSuperAdmin = currentUser?.role === 'Super Admin';
  const canDeleteUsers = isSuperAdmin || hasPermission('canDeleteUsersPermanently');

  const filteredUsers = users.filter(u => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.employeeId && u.employeeId.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.designation && u.designation.toLowerCase().includes(q)) ||
      (u.location && u.location.toLowerCase().includes(q)) ||
      (u.mobile && u.mobile.toLowerCase().includes(q));

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesDepartment = departmentFilter === 'All' || u.department === departmentFilter;
    const matchesStatus = statusFilter === 'All' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  const activeUsersCount = users.filter(u => u.status === 'Active').length;
  const supportUsersCount = users.filter(u => ['Support Agent', 'Support Manager', 'Admin', 'Super Admin'].includes(u.role)).length;
  const employeeCount = users.filter(u => u.role === 'Employee').length;

  const handleOpenAddModal = () => {
    setEditingUser(null);
    const newEmpId = `EMP-${1000 + users.length + 1}`;
    setEmployeeId(newEmpId);
    setName('');
    setEmail('');
    setPin('1234');
    setPassword('123456');
    setRole('Employee');
    setDepartment(departments[0]?.name || 'IT Support');
    setDesignation('');
    setLocation(branches[0] || 'Headquarters - NY');
    setMobile('');
    setUserStatus('Active');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setEmployeeId(u.employeeId);
    setName(u.name);
    setEmail(u.email);
    setPin(u.pin || u.employeeId.replace(/\D/g, '') || '1234');
    setPassword(u.password || '123456');
    setRole(u.role);
    setDepartment(u.department);
    setDesignation(u.designation || '');
    setLocation(u.location);
    setMobile(u.mobile || '');
    setUserStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSyncFromSheets = async () => {
    setIsSyncing(true);
    try {
      await pullDataFromGoogleSheets(undefined, undefined, false);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreRoster = () => {
    restoreDefaultUsers();
    setRestoreSuccessMsg(`Successfully verified and restored all company users (${users.length} profiles active).`);
    setTimeout(() => setRestoreSuccessMsg(null), 4000);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setRoleFilter('All');
    setDepartmentFilter('All');
    setStatusFilter('All');
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !employeeId || !email) return;

    if (editingUser) {
      updateUser(editingUser.id, {
        employeeId,
        name,
        email,
        pin,
        password,
        role,
        department,
        designation: designation || 'Staff Member',
        location,
        mobile,
        status: userStatus
      });
    } else {
      addUser({
        employeeId,
        name,
        email,
        pin,
        password,
        role,
        department,
        designation: designation || 'Staff Member',
        location,
        status: userStatus,
        mobile,
        joiningDate: new Date().toISOString().split('T')[0]
      });
    }

    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleOpenDeleteModal = (u: User) => {
    if (!isSuperAdmin && !canDeleteUsers) {
      alert('Access Restricted: Permanent deletion is restricted to Super Admin.');
      return;
    }
    if (u.email === 'misrpr@rathibuildmart.com') {
      alert('Security Protection: Primary Super Admin account cannot be deleted.');
      return;
    }
    if (currentUser && currentUser.id === u.id) {
      alert('Security Protection: You cannot delete your own active Super Admin session.');
      return;
    }
    setUserToDelete(u);
    setDeleteReason('Employee offboarding / Role conclude');
  };

  const handleConfirmPermanentDelete = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteUserPermanentlyAndArchive(userToDelete.id, deleteReason);
      if (res.success) {
        setRestoreSuccessMsg(res.message);
        setTimeout(() => setRestoreSuccessMsg(null), 4000);
      } else {
        alert(res.message);
      }
    } finally {
      setIsDeleting(false);
      setUserToDelete(null);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title & Top Action Controls */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">User & Staff Management</h1>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
                  RBAC Enabled
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Directory of all company employees, support staff, managers, and administrators ({users.length} active registered).
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveView('role-permissions')}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            title="Configure role-based access matrix"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
            <span>Role Permissions (RBAC)</span>
          </button>

          <button
            onClick={() => setActiveView('archived-data')}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            title="View archived users and tickets database"
          >
            <Archive className="w-3.5 h-3.5 text-amber-700" />
            <span>Archived Vault ({archivedUsers.length})</span>
          </button>

          <button
            onClick={handleRestoreRoster}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all"
            title="Ensure all standard staff & roles are loaded"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
            <span>Verify Staff</span>
          </button>

          <button
            onClick={handleSyncFromSheets}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all disabled:opacity-50"
            title="Sync users and tickets with connected Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-700 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Sheet...' : 'Sync with Sheet'}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#063B2C] hover:bg-[#04281C] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {restoreSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{restoreSuccessMsg}</span>
        </div>
      )}

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-gray-200/80 shadow-2xs">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Total Users</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{users.length}</p>
          <span className="text-[10px] text-gray-400 font-medium">All registered accounts</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Active Staff</p>
          <p className="text-2xl font-black text-emerald-800 mt-1">{activeUsersCount}</p>
          <span className="text-[10px] text-emerald-600 font-medium">Can sign in & create tickets</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 bg-blue-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Support & Admins</p>
          <p className="text-2xl font-black text-blue-800 mt-1">{supportUsersCount}</p>
          <span className="text-[10px] text-blue-600 font-medium">Agents, Managers & Admins</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-purple-100 bg-purple-50/20 shadow-2xs">
          <p className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Company Employees</p>
          <p className="text-2xl font-black text-purple-800 mt-1">{employeeCount}</p>
          <span className="text-[10px] text-purple-600 font-medium">Standard requester accounts</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, EMP ID, email, designation, branch..."
            className="w-full pl-10 pr-8 py-2 bg-gray-50 border border-gray-200/80 rounded-xl text-xs outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1 text-xs">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer text-xs"
            >
              <option value="All">All Roles</option>
              {rolesList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1 text-xs">
            <Building2 className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={departmentFilter}
              onChange={e => setDepartmentFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer text-xs"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200/80 rounded-xl px-2.5 py-1 text-xs">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent font-semibold text-gray-700 outline-none cursor-pointer text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Disabled">Disabled</option>
            </select>
          </div>

          {(searchQuery || roleFilter !== 'All' || departmentFilter !== 'All' || statusFilter !== 'All') && (
            <button
              onClick={clearAllFilters}
              className="px-2.5 py-1 text-[11px] font-bold text-gray-500 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Showing count tag */}
      <div className="flex items-center justify-between text-xs text-gray-500 px-1">
        <span>
          Showing <strong className="text-gray-900">{filteredUsers.length}</strong> of{' '}
          <strong className="text-gray-900">{users.length}</strong> total users
        </span>
        {filteredUsers.length === 0 && users.length > 0 && (
          <span className="text-amber-600 font-semibold">
            No matching users with current filter criteria.
          </span>
        )}
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto text-gray-400">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">No Users Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {users.length === 0
                ? 'No users exist in the system yet. Click the restore button below to load the complete company user list.'
                : 'No users matched the search query or active filter settings.'}
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              {users.length > 0 ? (
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-gray-800"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={handleRestoreRoster}
                  className="px-4 py-2 bg-[#063B2C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#04281C]"
                >
                  Restore Company Staff Directory
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">
                  <th className="px-6 py-3.5 w-32">Employee ID</th>
                  <th className="px-6 py-3.5">Name & Email</th>
                  <th className="px-6 py-3.5 w-36">Role</th>
                  <th className="px-6 py-3.5 w-44">Department & Role</th>
                  <th className="px-6 py-3.5 w-40">Branch Location</th>
                  <th className="px-6 py-3.5 w-28">Status</th>
                  <th className="px-6 py-3.5 w-36 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-gray-900 text-xs">{u.employeeId}</div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-sans font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 shadow-2xs">
                        <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                        <span>Ready</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-xs shrink-0 border border-emerald-200">
                          {u.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{u.name}</p>
                          <p className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5 text-gray-400" />
                            <span>{u.email}</span>
                          </p>
                          {u.mobile && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-gray-400" />
                              <span>{u.mobile}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] rounded-full font-bold uppercase tracking-wider ${
                        u.role === 'Super Admin' || u.role === 'Admin' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                        u.role === 'Support Manager' || u.role === 'Support Agent' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800">{u.department}</p>
                      <p className="text-[10px] text-gray-500 font-medium">{u.designation || 'Staff Member'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-[11px] font-medium">{u.location}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full cursor-pointer transition-all ${
                          u.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200'
                        }`}
                        title="Click to toggle active status"
                      >
                        {u.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100 flex items-center gap-1 transition-colors shadow-2xs"
                          title="Modify user details"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Modify</span>
                        </button>
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-colors shadow-2xs ${
                            u.status === 'Active'
                              ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                              : 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                          }`}
                        >
                          {u.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>

                        {/* Super Admin Permanent Delete & Archive */}
                        {canDeleteUsers && (
                          <button
                            onClick={() => handleOpenDeleteModal(u)}
                            disabled={u.email === 'misrpr@rathibuildmart.com' || currentUser?.id === u.id}
                            className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors shadow-2xs flex items-center gap-1 ${
                              u.email === 'misrpr@rathibuildmart.com' || currentUser?.id === u.id
                                ? 'opacity-30 border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-red-200 text-red-600 bg-red-50 hover:bg-red-100'
                            }`}
                            title={
                              u.email === 'misrpr@rathibuildmart.com'
                                ? 'Master Super Admin cannot be deleted'
                                : currentUser?.id === u.id
                                ? 'Cannot delete your active session'
                                : 'Permanently delete user & archive to Google Sheets ArchivedUsers'
                            }
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
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

      {/* Add / Edit User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-200">
            <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingUser ? `Modify User Details: ${editingUser.name}` : 'Add New System User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Employee ID *</label>
                  <input
                    required
                    type="text"
                    value={employeeId}
                    onChange={e => setEmployeeId(e.target.value)}
                    placeholder="EMP-1009"
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Email Address *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="john.doe@company.com"
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Password & PIN Configuration */}
              <div className="grid grid-cols-2 gap-3 bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                <div>
                  <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                    <span>Employee PIN *</span>
                    <span className="text-[10px] text-blue-600 font-mono">Quick PIN</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    placeholder="e.g. 1011 or 1234"
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono font-bold outline-none focus:border-blue-500"
                  />
                  <span className="text-[9px] text-gray-500 mt-0.5 block">Used for fast ID sign-in</span>
                </div>
                <div>
                  <label className="block font-bold text-blue-900 mb-1 flex items-center justify-between">
                    <span>Password *</span>
                    <span className="text-[10px] text-blue-600 font-mono">Account Pass</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. admin123 or pass123"
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
                  />
                  <span className="text-[9px] text-gray-500 mt-0.5 block">Account authentication password</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Role *</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full p-2 border rounded-lg font-bold outline-none focus:border-emerald-500"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Designation</label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full p-2 border rounded-lg outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Designation...</option>
                    {designationsList.map(des => (
                      <option key={des} value={des}>{des}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">Branch / Location</label>
                  <select
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg font-semibold outline-none focus:border-emerald-500"
                  >
                    {branches.map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {editingUser && (
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Account Status</label>
                  <select
                    value={userStatus}
                    onChange={e => setUserStatus(e.target.value as 'Active' | 'Disabled')}
                    className="w-full p-2 border rounded-lg font-bold outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Disabled">Disabled</option>
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#063B2C] hover:bg-[#04281C] text-white font-bold rounded-lg shadow-md transition-colors"
                >
                  {editingUser ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permanent Delete & Archive Confirmation Modal (Super Admin Exclusive) */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-red-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-200" />
                <h3 className="font-bold text-sm">Permanent User Deletion & Archive</h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-red-200 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-900 space-y-1">
                <p className="font-bold text-[11px] flex items-center gap-1 text-red-800">
                  <ShieldAlert className="w-4 h-4 text-red-700" />
                  Google Workspace Archive Policy
                </p>
                <p className="text-[11px] leading-relaxed text-red-800">
                  User <strong>{userToDelete.name}</strong> ({userToDelete.employeeId || userToDelete.email}) will be permanently deleted from the active staff roster and automatically moved to the <strong>&apos;ArchivedUsers&apos;</strong> Google Sheet tab for audit traceability.
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 space-y-1">
                <p className="text-gray-500 font-semibold">User Details:</p>
                <p className="font-bold text-gray-900 text-sm">{userToDelete.name}</p>
                <p className="text-gray-600 font-mono text-[11px]">{userToDelete.email} &bull; {userToDelete.role} &bull; {userToDelete.department}</p>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Reason for Archival & Deletion *
                </label>
                <input
                  type="text"
                  required
                  value={deleteReason}
                  onChange={e => setDeleteReason(e.target.value)}
                  placeholder="e.g. Employee offboarded, duplicate account..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:bg-white focus:border-red-500 font-medium text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setUserToDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmPermanentDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Archiving & Deleting...' : 'Archive & Delete User'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
