import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  RotateCcw,
  Info,
  Save,
  CheckCircle2,
  Lock,
  Users,
  Database,
  Trash2,
  Settings,
  FolderSync,
  FileBarChart,
  Tag,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserRole, RolePermissionConfig } from '../../types';

interface PermissionDefinition {
  key: keyof RolePermissionConfig;
  label: string;
  description: string;
  category: 'Tickets & Service' | 'User Directory' | 'Master Settings' | 'Integrations & Vault';
  superAdminOnly?: boolean;
}

const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // Category 1: Tickets & Service
  {
    key: 'canViewDashboard',
    label: 'View Main Dashboard',
    description: 'Allows role to access dashboard statistics and overview metrics.',
    category: 'Tickets & Service'
  },
  {
    key: 'canViewTickets',
    label: 'View Ticket Queue / Directory',
    description: 'Allows role to view ticket list and search records.',
    category: 'Tickets & Service'
  },
  {
    key: 'canCreateTickets',
    label: 'Create New Tickets',
    description: 'Allows role to raise new support requests & issue tickets.',
    category: 'Tickets & Service'
  },
  {
    key: 'canEditTickets',
    label: 'Modify / Update Tickets',
    description: 'Allows changing ticket status, priority, and agent assignment.',
    category: 'Tickets & Service'
  },
  {
    key: 'canDeleteTickets',
    label: 'Permanent Delete & Archive Tickets',
    description: 'Allows permanently deleting tickets and transferring them to Google Sheet ArchivedTickets.',
    category: 'Tickets & Service',
    superAdminOnly: true
  },
  {
    key: 'canViewFeedback',
    label: 'View Feedback & CSAT Ratings',
    description: 'Allows viewing employee feedback reviews and average CSAT score.',
    category: 'Tickets & Service'
  },
  {
    key: 'canSubmitFeedback',
    label: 'Submit Star Rating & Feedback',
    description: 'Allows submitting feedback on resolved help desk tickets.',
    category: 'Tickets & Service'
  },
  {
    key: 'canViewReports',
    label: 'View Analytics & Performance Reports',
    description: 'Allows viewing SLA performance charts and departmental reports.',
    category: 'Tickets & Service'
  },

  // Category 2: User Directory
  {
    key: 'canManageUsers',
    label: 'Manage Staff Accounts (Add / Edit / Toggle)',
    description: 'Allows creating and editing user profiles, credentials, and active status.',
    category: 'User Directory'
  },
  {
    key: 'canDeleteUsersPermanently',
    label: 'Permanent Delete & Archive Users',
    description: 'Allows permanently removing employee/agent accounts and archiving to Google Sheet ArchivedUsers.',
    category: 'User Directory',
    superAdminOnly: true
  },

  // Category 3: Master Settings
  {
    key: 'canManageDepartments',
    label: 'Manage Departments',
    description: 'Allows adding, editing, and removing organization departments.',
    category: 'Master Settings'
  },
  {
    key: 'canManageCategories',
    label: 'Manage Categories & Sub-Categories',
    description: 'Allows configuring support categories and routing workflows.',
    category: 'Master Settings'
  },
  {
    key: 'canManageSLA',
    label: 'Configure SLA Timelines & Escalation',
    description: 'Allows editing priority SLA resolution deadlines.',
    category: 'Master Settings'
  },
  {
    key: 'canManageDropdowns',
    label: 'Manage Dropdown Options (Branches, Roles, Designations)',
    description: 'Allows customizing system master options and option codes.',
    category: 'Master Settings'
  },

  // Category 4: Integrations & Vault
  {
    key: 'canAccessGoogleDriveSync',
    label: 'Google Drive & Cloud Storage Sync',
    description: 'Allows managing Google Drive storage folders and sync connections.',
    category: 'Integrations & Vault'
  },
  {
    key: 'canAccessAppsScript',
    label: 'Apps Script Automation & Webhooks',
    description: 'Allows viewing Code.gs scripts and spreadsheet web app endpoints.',
    category: 'Integrations & Vault'
  },
  {
    key: 'canViewAuditLogs',
    label: 'View Security Audit Logs',
    description: 'Allows inspecting complete system audit trail and user actions.',
    category: 'Integrations & Vault'
  },
  {
    key: 'canManageSystemSettings',
    label: 'System Settings & Branding Configuration',
    description: 'Allows configuring spreadsheet IDs, company branding, and auto-sync timers.',
    category: 'Integrations & Vault'
  },
  {
    key: 'canManageRolePermissions',
    label: 'Manage Role Access Permissions (RBAC Matrix)',
    description: 'Allows modifying role capabilities and access levels across the platform.',
    category: 'Integrations & Vault',
    superAdminOnly: true
  },
  {
    key: 'canAccessArchivedData',
    label: 'Access Archived Vault (Tickets & Users)',
    description: 'Allows viewing and restoring archived tickets & users synced from Google Sheets.',
    category: 'Integrations & Vault',
    superAdminOnly: true
  }
];

const ROLES: UserRole[] = ['Employee', 'Support Agent', 'Support Manager', 'Admin', 'Super Admin'];

export const RolePermissionsView: React.FC = () => {
  const {
    currentUser,
    users,
    rolePermissions,
    updateRolePermission,
    resetRolePermissionsToDefault,
    hasPermission,
    setActiveView
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedRoleForMembers, setSelectedRoleForMembers] = useState<UserRole>('Admin');
  const [activeTab, setActiveTab] = useState<'matrix' | 'roster'>('matrix');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const categories = ['All', 'Tickets & Service', 'User Directory', 'Master Settings', 'Integrations & Vault'];

  const filteredPermissions = PERMISSION_DEFINITIONS.filter(
    p => activeCategory === 'All' || p.category === activeCategory
  );

  const roleMembers = users.filter(u => u.role === selectedRoleForMembers);

  const handleToggle = (role: UserRole, key: keyof RolePermissionConfig, currentVal: boolean) => {
    if (!isSuperAdmin) {
      alert('Access Restricted: Only Super Admin (misrpr@rathibuildmart.com) can modify Role Permissions.');
      return;
    }
    // Super admin permissions cannot be disabled
    if (role === 'Super Admin') return;

    updateRolePermission(role, key, !currentVal);
    setSaveToast(`Updated "${key}" for role "${role}" → ${!currentVal ? 'ENABLED' : 'DISABLED'}`);
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleReset = () => {
    if (!isSuperAdmin) return;
    if (confirm('Are you sure you want to reset all role permissions to standard corporate defaults?')) {
      resetRolePermissionsToDefault();
      setSaveToast('Role permissions reset to standard corporate defaults!');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-800" />
              Role Access & Permissions Control (RBAC Matrix)
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
              Super Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Define granular access permissions for each user role and inspect assigned staff accounts. All changes are saved locally and synced with Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tab Switcher */}
          <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-2xs">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'matrix'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Permission Matrix
            </button>
            <button
              onClick={() => setActiveTab('roster')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'roster'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Assigned Staff ({users.length})</span>
            </button>
          </div>

          {isSuperAdmin && (
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Defaults</span>
            </button>
          )}
        </div>
      </div>

      {saveToast && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Security Rule Callout */}
      <div className="bg-gradient-to-r from-[#031A12] to-[#063B2C] text-white p-5 rounded-2xl shadow-sm border border-[#063B2C]/50 flex items-start gap-4">
        <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-300 shrink-0 mt-0.5">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1 text-xs">
          <p className="font-bold text-sm text-emerald-200">Live Role Capability & Security Policy</p>
          <p className="text-gray-300 leading-relaxed">
            Permissions granted in this matrix take immediate effect for all active staff members assigned to that role. 
            When granting <strong>Manage Staff Accounts</strong> to Support Managers or Admins, they can view, add, and manage user accounts in the <strong>User Management</strong> directory.
          </p>
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <>
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#063B2C] text-white shadow-2xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* RBAC Matrix Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-700 font-bold text-[11px]">
                    <th className="py-3.5 px-6 min-w-[280px]">Permission Capability</th>
                    {ROLES.map(r => {
                      const count = users.filter(u => u.role === r).length;
                      let badgeColor = 'bg-purple-100 text-purple-800';
                      if (r === 'Support Agent') badgeColor = 'bg-blue-100 text-blue-800';
                      if (r === 'Support Manager') badgeColor = 'bg-cyan-100 text-cyan-800';
                      if (r === 'Admin') badgeColor = 'bg-amber-100 text-amber-800';
                      if (r === 'Super Admin') badgeColor = 'bg-emerald-100 text-emerald-800';

                      return (
                        <th key={r} className="py-3.5 px-4 text-center min-w-[120px]">
                          <div className="flex flex-col items-center gap-1">
                            <span className={`px-2 py-0.5 rounded font-bold ${badgeColor}`}>
                              {r}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              ({count} {count === 1 ? 'user' : 'users'})
                            </span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredPermissions.map(perm => (
                    <tr key={perm.key} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-start gap-2">
                          {perm.superAdminOnly ? (
                            <div className="p-1 rounded bg-red-50 text-red-600 shrink-0 mt-0.5" title="Super Admin Strict Restricted">
                              <Lock className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="p-1 rounded bg-emerald-50 text-emerald-700 shrink-0 mt-0.5">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{perm.label}</span>
                              <span className="text-[10px] px-2 py-0.2 text-gray-400 bg-gray-100 rounded-full font-mono">
                                {perm.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-0.5">{perm.description}</p>
                          </div>
                        </div>
                      </td>

                      {ROLES.map(r => {
                        const roleConfig = rolePermissions.find(p => p.role === r);
                        const isGranted = roleConfig ? !!roleConfig[perm.key] : false;
                        const isSuperAdminCol = r === 'Super Admin';

                        return (
                          <td key={r} className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              disabled={!isSuperAdmin || isSuperAdminCol}
                              onClick={() => handleToggle(r, perm.key, isGranted)}
                              className={`w-7 h-7 rounded-xl flex items-center justify-center mx-auto transition-all shadow-2xs ${
                                isGranted
                                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 border border-gray-200'
                              } ${!isSuperAdmin || isSuperAdminCol ? 'cursor-default opacity-90' : 'cursor-pointer hover:scale-105'}`}
                              title={
                                isSuperAdminCol
                                  ? 'Super Admin retains full master permission.'
                                  : !isSuperAdmin
                                  ? 'Only Super Admin can toggle permissions.'
                                  : `Click to toggle "${perm.label}" for ${r}`
                              }
                            >
                              {isGranted ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : (
                                <X className="w-3.5 h-3.5 stroke-[2.5]" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Role Member Roster View */
        <div className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {ROLES.map(r => {
              const count = users.filter(u => u.role === r).length;
              return (
                <button
                  key={r}
                  onClick={() => setSelectedRoleForMembers(r)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                    selectedRoleForMembers === r
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <span>{r}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                    selectedRoleForMembers === r ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600 font-bold'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  Active Staff with Role: <span className="text-emerald-800 font-extrabold">{selectedRoleForMembers}</span> ({roleMembers.length})
                </h3>
                <p className="text-xs text-gray-500">
                  These users inherit all permissions enabled for <strong>{selectedRoleForMembers}</strong> in the RBAC matrix.
                </p>
              </div>

              <button
                onClick={() => setActiveView('users')}
                className="px-3.5 py-1.5 bg-[#063B2C] hover:bg-[#04281C] text-white text-xs font-bold rounded-lg shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Manage Users in Directory</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-600 font-bold text-[11px]">
                    <th className="py-3 px-4">Employee ID</th>
                    <th className="py-3 px-4">Staff Name</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Designation</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {roleMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500 text-xs">
                        No active users currently assigned to role <strong>{selectedRoleForMembers}</strong>.
                      </td>
                    </tr>
                  ) : (
                    roleMembers.map(u => (
                      <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-gray-800">{u.employeeId}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{u.name}</td>
                        <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">{u.email}</td>
                        <td className="py-3 px-4 text-gray-700">{u.department}</td>
                        <td className="py-3 px-4 text-gray-600">{u.designation || '—'}</td>
                        <td className="py-3 px-4 text-gray-600">{u.location}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Role Summary Guide */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 text-xs">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
            <Users className="w-4 h-4" />
            <span>Employee</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Can raise help desk tickets, track personal tickets, rate closed tickets, and access the Knowledge Base.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold">
            <Shield className="w-4 h-4" />
            <span>Support Agent</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Can view department queue, resolve tickets, add internal notes, reassign agents, and view reports.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-cyan-700 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Support Manager</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Can manage department queues, assign agents, configure SLA & categories, and audit agent response times.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
            <Settings className="w-4 h-4" />
            <span>Admin</span>
          </div>
          <p className="text-[11px] text-gray-500">
            Can manage users, branches, master dropdowns, departments, categories, and audit logs.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-300 bg-emerald-50/30 shadow-2xs space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Super Admin</span>
          </div>
          <p className="text-[11px] text-emerald-800">
            <strong>Full Authority</strong>: Can permanently delete & archive users/tickets, manage RBAC permissions, and access the Archived Vault.
          </p>
        </div>
      </div>
    </div>
  );
};
