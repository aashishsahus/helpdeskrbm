import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  Ticket,
  Users,
  ShieldAlert,
  BookOpen,
  FileBarChart,
  Settings,
  FolderSync,
  Building2,
  Tags,
  Clock,
  MapPin,
  Code2,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  Briefcase,
  Star,
  ShieldCheck,
  Archive
} from 'lucide-react';
import { isTicketRaisedByUser, isTicketAssignedToAgent } from '../utils/ticketSecurity';

export const Sidebar: React.FC = () => {
  const { currentUser, activeView, setActiveView, tickets, notifications, hasPermission, archivedTickets, archivedUsers } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);

  const isEmployee = currentUser ? currentUser.role === 'Employee' : true;
  const isAgent = currentUser ? (currentUser.role === 'Support Agent' || currentUser.role === 'Support Manager') : false;
  const isAdmin = currentUser ? (currentUser.role === 'Admin' || currentUser.role === 'Super Admin') : false;
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const userTickets = currentUser
    ? isEmployee
      ? tickets.filter(t => isTicketRaisedByUser(t, currentUser))
      : isAgent
      ? tickets.filter(t => isTicketAssignedToAgent(t, currentUser) || t.department?.toLowerCase() === currentUser.department?.toLowerCase())
      : tickets
    : [];

  const openTicketsCount = userTickets.filter(t => t.status === 'Open' || t.status === 'In Progress' || t.status === 'Pending').length;
  const unreadNotifCount = currentUser ? notifications.filter(n => !n.read && n.userId === currentUser.id).length : 0;

  const navItems = [
    {
      id: 'dashboard',
      label: isEmployee ? 'My Help Desk' : isAgent ? 'Support Queue' : 'Dashboard',
      icon: LayoutDashboard,
      visible: true
    },
    {
      id: 'tickets',
      label: isEmployee ? 'My Tickets' : isAgent ? 'Support Queue' : 'Ticket Directory',
      icon: Ticket,
      badge: openTicketsCount > 0 ? openTicketsCount : undefined,
      visible: true
    },
    {
      id: 'feedback',
      label: isEmployee ? 'My Feedback' : 'Feedback & Ratings',
      icon: Star,
      visible: true
    },
    {
      id: 'knowledge-base',
      label: 'Knowledge Base',
      icon: BookOpen,
      visible: true
    },
    {
      id: 'reports',
      label: 'Analytics & Reports',
      icon: FileBarChart,
      visible: !isEmployee
    },
    {
      id: 'users',
      label: 'User Management',
      icon: Users,
      visible: isAdmin && hasPermission('manage_users')
    },
    {
      id: 'role-permissions',
      label: 'Role Permissions (RBAC)',
      icon: ShieldCheck,
      visible: isAdmin && hasPermission('manage_roles')
    },
    {
      id: 'archived-data',
      label: 'Archived Vault (Deleted)',
      icon: Archive,
      badge: (archivedTickets.length + archivedUsers.length) > 0 ? (archivedTickets.length + archivedUsers.length) : undefined,
      visible: isSuperAdmin || hasPermission('view_audit_logs')
    },
    {
      id: 'dropdown-settings',
      label: 'Dropdown Settings',
      icon: MapPin,
      visible: isAdmin
    },
    {
      id: 'departments',
      label: 'Departments',
      icon: Building2,
      visible: isAdmin
    },
    {
      id: 'categories',
      label: 'Categories & Sub',
      icon: Tags,
      visible: isAdmin
    },
    {
      id: 'sla',
      label: 'SLA Config',
      icon: Clock,
      visible: isAdmin
    },
    {
      id: 'google-drive',
      label: 'Google Drive & Sheets',
      icon: FolderSync,
      visible: isAdmin
    },
    {
      id: 'apps-script',
      label: 'Apps Script',
      icon: Code2,
      visible: isAdmin
    },
    {
      id: 'audit-logs',
      label: 'Audit Logs',
      icon: ShieldAlert,
      visible: isAdmin
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: Settings,
      visible: isAdmin
    }
  ];

  return (
    <aside
      id="app-sidebar"
      className={`my-2 ml-2 h-[calc(100vh-16px)] bg-[#031A12] text-white flex flex-col shrink-0 rounded-2xl border border-[#063B2C] shadow-2xl transition-all duration-300 z-30 select-none relative print:hidden ${
        isExpanded ? 'w-64' : 'w-16'
      }`}
    >
      {/* Brand Logo Box at top */}
      <div className="p-2 flex items-center justify-center border-b border-[#063B2C]/80">
        <div className="bg-white rounded-lg p-1 shadow-md flex items-center justify-center w-8 h-8 border border-emerald-100 overflow-hidden shrink-0">
          <div className="bg-[#053B2C] text-emerald-400 font-black text-xs p-1 rounded flex items-center justify-center tracking-tighter">
            <Building className="w-4 h-4 text-[#10B981]" />
          </div>
        </div>
        {isExpanded && (
          <div className="ml-2.5 overflow-hidden">
            <span className="font-extrabold text-xs tracking-tight block text-white leading-tight">
              RATHI BUILDMART
            </span>
            <span className="text-[8px] text-emerald-400 font-mono tracking-widest uppercase block">
              MANAGEMENT PORTAL
            </span>
          </div>
        )}
      </div>

      {/* Expand / Collapse Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-10 bg-[#063B2C] border border-[#10B981]/40 text-emerald-300 hover:text-white p-1 rounded-full shadow-lg transition-all hover:scale-110 z-40"
        title={isExpanded ? 'Collapse Sidebar' : 'Expand Sidebar'}
      >
        {isExpanded ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation Icons Stack */}
      <nav className="flex-1 px-1.5 py-1.5 space-y-1 overflow-hidden">
        {navItems
          .filter(item => item.visible)
          .map(item => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (item.id === 'dashboard' && (activeView === 'dashboard' || activeView.endsWith('_dashboard'))) ||
              (item.id === 'knowledge-base' && activeView === 'knowledge_base') ||
              (item.id === 'tickets' && activeView === 'ticket_directory') ||
              (item.id === 'dropdown-settings' && (activeView === 'dropdown-settings' || activeView === 'admin_dropdowns')) ||
              (item.id === 'users' && activeView === 'admin_users') ||
              (item.id === 'departments' && activeView === 'admin_departments') ||
              (item.id === 'categories' && activeView === 'admin_categories') ||
              (item.id === 'sla' && activeView === 'admin_sla') ||
              (item.id === 'google-drive' && activeView === 'admin_drive') ||
              (item.id === 'apps-script' && activeView === 'admin_script') ||
              (item.id === 'audit-logs' && activeView === 'admin_audit') ||
              (item.id === 'settings' && activeView === 'admin_settings');

            return (
              <div key={item.id} className="relative group">
                <button
                  id={`nav-${item.id}`}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center ${
                    isExpanded ? 'justify-between px-2.5 py-1.5' : 'justify-center p-2'
                  } rounded-lg text-[11px] font-bold transition-all ${
                    isActive
                      ? 'bg-[#084D39] text-[#34D399] border border-[#10B981]/40 shadow-md shadow-emerald-950/50'
                      : 'text-emerald-100/70 hover:text-white hover:bg-[#063326]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-[#34D399] drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'text-emerald-200/80'
                      }`}
                    />
                    {isExpanded && <span className="truncate leading-none">{item.label}</span>}
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-[#10B981] text-[#031A12]' : 'bg-emerald-800/60 text-emerald-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Floating Tooltip when collapsed */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2.5 top-1/2 -translate-y-1/2 bg-[#04281C] text-white text-[11px] font-bold px-2.5 py-1 rounded-md border border-[#10B981]/30 shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all whitespace-nowrap z-50 flex items-center gap-1.5">
                    <span>{item.label}</span>
                    {item.badge !== undefined && (
                      <span className="px-1.5 py-0.2 bg-[#10B981] text-[#031A12] text-[9px] rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </nav>

      {/* Footer User Avatar */}
      <div className="p-1.5 border-t border-[#063B2C]/80 mt-auto">
        <div
          className={`flex items-center gap-2 p-1.5 bg-[#062F23] rounded-lg border border-[#0A4D39] ${
            isExpanded ? '' : 'justify-center'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-emerald-700 border border-emerald-400/40 flex items-center justify-center font-extrabold text-white text-[10px] shrink-0 shadow-inner">
            {currentUser?.avatarUrl ? (
              <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'G'
            )}
          </div>
          {isExpanded && (
            <div className="overflow-hidden flex-1">
              <p className="text-[11px] font-bold text-white truncate leading-tight">{currentUser?.name || 'Guest Session'}</p>
              <span className="text-[8px] font-mono text-emerald-400 font-bold uppercase block truncate">
                {currentUser?.role || 'Sign In Required'}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

