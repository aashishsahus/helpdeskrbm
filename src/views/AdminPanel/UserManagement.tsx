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
  CheckCircle2
} from 'lucide-react';
import { User, UserRole } from '../../types';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, toggleUserStatus, departments, branches, rolesList, designationsList } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

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

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title & Actions Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User & Employee Management</h1>
          <p className="text-xs text-gray-500">
            Create users, assign roles (Employee, Support Agent, Support Manager, Admin, Super Admin), and toggle account statuses.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-2.5 bg-[#063B2C] hover:bg-[#04281C] text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-gray-200/80 shadow-2xs flex items-center justify-between flex-wrap gap-3">
        <div className="relative w-96">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, employee ID, or email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200/80 rounded-full text-xs outline-none focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200/80 rounded-full text-xs font-semibold text-gray-700 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="All">All Roles</option>
            {rolesList.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 w-28">Emp ID</th>
                <th className="px-6 py-3">Name & Email</th>
                <th className="px-6 py-3 w-36">Role</th>
                <th className="px-6 py-3 w-36">Department</th>
                <th className="px-6 py-3 w-32">Location</th>
                <th className="px-6 py-3 w-24">Status</th>
                <th className="px-6 py-3 w-40 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono font-bold text-gray-700 text-xs">{u.employeeId}</div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-sans font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-1 shadow-2xs">
                      <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                      <span>Synced</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{u.name}</p>
                    <p className="text-[10px] text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-[10px] rounded font-bold uppercase ${
                      u.role === 'Super Admin' || u.role === 'Admin' ? 'bg-purple-100 text-purple-700' :
                      u.role === 'Support Manager' || u.role === 'Support Agent' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800">{u.department}</td>
                  <td className="px-6 py-4 text-gray-600">{u.location}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                      u.status === 'Active' ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(u)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded border border-blue-200 text-blue-600 hover:bg-blue-50 flex items-center gap-1 transition-colors shadow-2xs"
                        title="Modify user details"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Modify</span>
                      </button>
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded border transition-colors shadow-2xs ${
                          u.status === 'Active'
                            ? 'border-gray-200 text-gray-700 hover:bg-gray-100'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {u.status === 'Active' ? 'Disable' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono font-bold"
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
                    className="w-full p-2 bg-white border border-blue-200 rounded-lg text-xs font-mono"
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
                    className="w-full p-2 border rounded-lg font-bold"
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
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg"
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
                    className="w-full p-2 border rounded-lg font-semibold"
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
                    className="w-full p-2 border rounded-lg font-bold"
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-colors"
                >
                  {editingUser ? 'Update User' : 'Save User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
