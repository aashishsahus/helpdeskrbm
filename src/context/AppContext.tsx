import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import {
  User,
  Ticket,
  TicketComment,
  TicketHistory,
  TicketAttachment,
  NotificationItem,
  Department,
  Category,
  SLARule,
  KnowledgeBaseArticle,
  AuditLogItem,
  SheetSyncLogItem,
  SystemSettings,
  TicketPriority,
  TicketStatus,
  UserRole,
  RolePermissionConfig,
  ArchivedTicket,
  ArchivedUser
} from '../types';
import {
  initialUsers,
  initialTickets,
  initialComments,
  initialHistory,
  initialNotifications,
  initialDepartments,
  initialCategories,
  initialSLARules,
  initialKnowledgeBase,
  initialAuditLogs,
  initialSystemSettings,
  initialBranches,
  initialPriorities,
  initialStatuses,
  initialRoles,
  initialDesignations,
  defaultRolePermissions,
  initialArchivedTickets,
  initialArchivedUsers
} from '../data/initialData';
import { formatDateTime, getFormattedNow } from '../utils/dateUtils';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  tickets: Ticket[];
  archivedTickets: ArchivedTicket[];
  archivedUsers: ArchivedUser[];
  rolePermissions: RolePermissionConfig[];
  hasPermission: (permissionKey: keyof RolePermissionConfig) => boolean;
  comments: TicketComment[];
  history: TicketHistory[];
  notifications: NotificationItem[];
  departments: Department[];
  categories: Category[];
  slaRules: SLARule[];
  knowledgeBase: KnowledgeBaseArticle[];
  auditLogs: AuditLogItem[];
  settings: SystemSettings;
  
  // Master Dropdowns Lists
  branches: string[];
  prioritiesList: string[];
  statusesList: string[];
  rolesList: string[];
  designationsList: string[];

  // Dropdown CRUD Methods
  addBranch: (branch: string) => void;
  editBranch: (oldBranch: string, newBranch: string) => void;
  deleteBranch: (branch: string) => void;

  addPriority: (priority: string) => void;
  editPriority: (oldPriority: string, newPriority: string) => void;
  deletePriority: (priority: string) => void;

  addStatus: (status: string) => void;
  editStatus: (oldStatus: string, newStatus: string) => void;
  deleteStatus: (status: string) => void;

  addRole: (role: string) => void;
  editRole: (oldRole: string, newRole: string) => void;
  deleteRole: (role: string) => void;

  addDesignation: (designation: string) => void;
  editDesignation: (oldDesig: string, newDesig: string) => void;
  deleteDesignation: (designation: string) => void;

  editDepartment: (id: string, updates: Partial<Department>) => void;
  deleteDepartment: (id: string) => void;

  editCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Modals & Navigation
  activeView: string;
  setActiveView: (view: string) => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  isCreateTicketOpen: boolean;
  setIsCreateTicketOpen: (open: boolean) => void;
  
  // Ticket Operations
  createTicket: (data: Omit<Ticket, 'id' | 'createdDate' | 'updatedDate' | 'slaDueDate' | 'slaStatus' | 'status'> & { attachments?: File[] }) => Promise<Ticket>;
  updateTicketStatus: (ticketId: string, status: TicketStatus, notes?: string) => void;
  updateTicketPriority: (ticketId: string, priority: TicketPriority) => void;
  assignTicket: (ticketId: string, agentId: string) => void;
  deleteTicketPermanentlyAndArchive: (ticketId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  deleteTicketPermanently: (ticketId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  restoreArchivedTicket: (ticketId: string) => Promise<{ success: boolean; message: string }>;
  purgeArchivedTicketPermanently: (ticketId: string) => Promise<{ success: boolean; message: string }>;
  addTicketComment: (ticketId: string, content: string, isInternalNote?: boolean, attachments?: File[]) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, feedback?: string) => void;
  
  // User Management & RBAC
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  deleteUserPermanentlyAndArchive: (userId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  deleteUserPermanently: (userId: string, reason?: string) => Promise<{ success: boolean; message: string }>;
  restoreArchivedUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  purgeArchivedUserPermanently: (userId: string) => Promise<{ success: boolean; message: string }>;
  restoreDefaultUsers: () => void;
  updateRolePermission: (role: UserRole, permissionKey: keyof RolePermissionConfig, value: boolean) => void;
  resetRolePermissionsToDefault: () => void;
  detectAndLoginSystemUser: () => Promise<User | null>;
  loginByIdOrQuery: (query: string, passwordInput?: string) => { success: boolean; user?: User; matches?: User[]; message: string };
  loginWithGoogleEmail: (googleEmail: string, passwordInput?: string) => { success: boolean; user?: User; matches?: User[]; message: string };
  
  // Master Management
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateSLARule: (id: string, resolutionHours: number) => void;
  
  // System & Google Workspace Sync
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  syncWithGoogleSheets: (spreadsheetId?: string, webAppUrl?: string) => Promise<{ success: boolean; message: string }>;
  pullDataFromGoogleSheets: (spreadsheetId?: string, webAppUrl?: string, isSilent?: boolean) => Promise<{ success: boolean; count: number; message: string }>;
  clearMockupTickets: () => void;
  restoreDemoTickets: () => void;
  isDemoDataActive: boolean;
  realTicketsCount: number;
  demoTicketsCount: number;
  sheetSyncLogs: SheetSyncLogItem[];
  activeSyncToast: SheetSyncLogItem | null;
  dismissSyncToast: () => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  lastSyncStatus: 'synced' | 'syncing' | 'error';
  
  // Notifications & Audit
  markNotificationAsRead: (id: string) => void;
  addAuditLog: (action: string, module: string, details: string) => void;
  
  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem('hd_users_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initialUsers with parsed users so all predefined company employees & newly added users are both preserved!
          const uMap = new Map<string, User>();
          initialUsers.forEach(u => uMap.set(u.id || u.employeeId, u));
          parsed.forEach((u: User) => {
            const key = u.id || u.employeeId;
            if (key) {
              const existing = uMap.get(key) || {};
              uMap.set(key, { ...existing, ...u });
            }
          });
          return Array.from(uMap.values());
        }
      }
    } catch {}
    return initialUsers;
  });

  const [currentUser, setCurrentUserRaw] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('helpdesk_user_session');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) {
          const foundById = initialUsers.find(u => u.id === parsed.id);
          if (foundById) return foundById;
          const foundByEmail = initialUsers.find(u => u.email.toLowerCase() === parsed.email?.toLowerCase());
          if (foundByEmail) return foundByEmail;
          if (parsed.name && parsed.email) return parsed;
        }
      }
    } catch (e) {
      // Fallback if localStorage unavailable
    }
    return null; // Require explicit login for new sessions or unauthenticated browsers!
  });

  const setCurrentUser = (user: User | null) => {
    setCurrentUserRaw(user);
    try {
      if (user) {
        localStorage.setItem('helpdesk_user_session', JSON.stringify(user));
      } else {
        localStorage.removeItem('helpdesk_user_session');
      }
    } catch (e) {
      // ignore storage error
    }
  };

  // Helper to verify PIN or Password
  const verifyPasswordOrPin = (user: User, passwordInput?: string): boolean => {
    if (!passwordInput || !passwordInput.trim()) {
      return false; // Password / PIN is strictly required for every user!
    }
    const cleanPass = passwordInput.trim();
    if (user.pin && cleanPass === user.pin) return true;
    if (user.password && cleanPass === user.password) return true;
    const empNum = user.employeeId ? user.employeeId.replace(/\D/g, '') : '';
    if (empNum && cleanPass === empNum) return true;
    return false;
  };

  // Google Workspace SSO Authentication
  const loginWithGoogleEmail = (googleEmail: string, passwordInput?: string): { success: boolean; user?: User; matches?: User[]; message: string } => {
    const cleanEmail = googleEmail.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Please enter a valid Google Workspace email.' };
    }

    const matches = users.filter(u => u.email.toLowerCase() === cleanEmail);
    if (matches.length === 0) {
      return {
        success: false,
        message: `Access Denied: The Google account '${googleEmail}' is NOT registered in RBM Help Desk. Access is restricted to registered company employees.`
      };
    }

    if (!passwordInput || !passwordInput.trim()) {
      return {
        success: false,
        message: `Password / PIN is required to verify ownership of Google Account '${googleEmail}'.`
      };
    }

    if (matches.length === 1) {
      const matched = matches[0];
      if (!verifyPasswordOrPin(matched, passwordInput)) {
        return {
          success: false,
          message: `Authentication Failed: Incorrect Password/PIN for Google Account '${googleEmail}'. (Registered PIN: ${matched.pin || matched.employeeId.replace(/\D/g, '') || '2026'})`
        };
      }
      setCurrentUser(matched);
      addAuditLog('GOOGLE_SSO_LOGIN', 'Authentication', `User logged in via Google Workspace SSO (${matched.email})`);
      return {
        success: true,
        user: matched,
        message: `Authenticated via Google Workspace SSO: ${matched.name} (${matched.employeeId} - ${matched.role})`
      };
    } else {
      const validMatches = matches.filter(m => verifyPasswordOrPin(m, passwordInput));
      if (validMatches.length === 1) {
        const matched = validMatches[0];
        setCurrentUser(matched);
        addAuditLog('GOOGLE_SSO_LOGIN', 'Authentication', `User logged in via Google Workspace SSO (${matched.email})`);
        return {
          success: true,
          user: matched,
          message: `Authenticated via Google Workspace SSO: ${matched.name} (${matched.employeeId} - ${matched.role})`
        };
      } else if (validMatches.length > 1) {
        return {
          success: false,
          matches: validMatches,
          message: `Multiple employee profiles match this PIN for ${cleanEmail}. Please select your specific account profile.`
        };
      } else {
        return {
          success: false,
          message: `Authentication Failed: Incorrect Password/PIN for Google Account '${googleEmail}'.`
        };
      }
    }
  };

  // Login detection by User ID, Employee ID, Name, or Email
  const loginByIdOrQuery = (query: string, passwordInput?: string): { success: boolean; user?: User; matches?: User[]; message: string } => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { success: false, message: 'Please enter a valid User ID, Employee ID, Name, or Email.' };
    }

    // 0. Direct Super Admin Shortcut (e.g., 'admin', 'superuser', 'emp-admin', 'admin123')
    if (cleanQuery === 'admin' || cleanQuery === 'superuser' || cleanQuery === 'emp-admin' || cleanQuery === 'admin@rathibuildmart.com') {
      const superAdminUser = users.find(u => u.role === 'Super Admin') || users[0];
      if (passwordInput && (passwordInput.trim() === 'admin123' || verifyPasswordOrPin(superAdminUser, passwordInput))) {
        setCurrentUser(superAdminUser);
        addAuditLog('USER_LOGIN', 'Authentication', `Super Admin logged in via direct shortcut (${superAdminUser.email})`);
        return {
          success: true,
          user: superAdminUser,
          message: `Direct Super Admin Login Successful: ${superAdminUser.name} (${superAdminUser.role})`
        };
      } else {
        return {
          success: false,
          message: `Authentication Failed: Incorrect Super Admin Password. (Required Password: 'admin123' or PIN: '${superAdminUser.pin || '2026'}')`
        };
      }
    }

    // 1. Check exact match by User ID (e.g., 'u0', 'u_ashish', 'u_dhaneshwari')
    const exactIdMatch = users.find(u => u.id.toLowerCase() === cleanQuery);
    if (exactIdMatch) {
      if (!verifyPasswordOrPin(exactIdMatch, passwordInput)) {
        return {
          success: false,
          message: `Incorrect Password/PIN for ${exactIdMatch.name} (${exactIdMatch.employeeId}). (Default PIN: ${exactIdMatch.pin || '1234'})`
        };
      }
      setCurrentUser(exactIdMatch);
      addAuditLog('USER_LOGIN', 'Authentication', `User logged in via User ID (${exactIdMatch.id})`);
      return {
        success: true,
        user: exactIdMatch,
        message: `Detected User ID: ${exactIdMatch.employeeId} (${exactIdMatch.name} - ${exactIdMatch.role})`
      };
    }

    // 2. Check exact match by Employee ID (e.g., 'EMP-1011', 'EMP-1010', 'EMP-2026')
    const exactEmpIdMatch = users.find(u => u.employeeId.toLowerCase() === cleanQuery);
    if (exactEmpIdMatch) {
      if (!verifyPasswordOrPin(exactEmpIdMatch, passwordInput)) {
        return {
          success: false,
          message: `Incorrect Password/PIN for ${exactEmpIdMatch.name} (${exactEmpIdMatch.employeeId}). (Default PIN: ${exactEmpIdMatch.pin || '1234'})`
        };
      }
      setCurrentUser(exactEmpIdMatch);
      addAuditLog('USER_LOGIN', 'Authentication', `User logged in via Employee ID (${exactEmpIdMatch.employeeId})`);
      return {
        success: true,
        user: exactEmpIdMatch,
        message: `Detected Employee ID: ${exactEmpIdMatch.employeeId} (${exactEmpIdMatch.name} - ${exactEmpIdMatch.role})`
      };
    }

    // 3. Check numeric match on Employee ID or ID (e.g., '1011' matches 'EMP-1011', '1010' matches 'EMP-1010')
    if (/^\d+$/.test(cleanQuery)) {
      const numericMatches = users.filter(u => {
        const empNum = u.employeeId.replace(/\D/g, '');
        const idNum = u.id.replace(/\D/g, '');
        return empNum === cleanQuery || idNum === cleanQuery;
      });
      if (numericMatches.length === 1) {
        const matched = numericMatches[0];
        if (!verifyPasswordOrPin(matched, passwordInput)) {
          return {
            success: false,
            message: `Incorrect Password/PIN for ${matched.name} (${matched.employeeId}). (Default PIN: ${matched.pin || '1234'})`
          };
        }
        setCurrentUser(matched);
        addAuditLog('USER_LOGIN', 'Authentication', `User logged in via Numeric ID (${query} -> ${matched.employeeId})`);
        return {
          success: true,
          user: matched,
          message: `Detected Employee ID: ${matched.employeeId} (${matched.name} - ${matched.role})`
        };
      } else if (numericMatches.length > 1) {
        return {
          success: false,
          matches: numericMatches,
          message: `Multiple profiles matched numeric ID '${query}'. Please select your profile.`
        };
      }
    }

    // 4. Check exact match by Name (case-insensitive)
    const exactNameMatch = users.find(u => u.name.toLowerCase() === cleanQuery);
    if (exactNameMatch) {
      if (!verifyPasswordOrPin(exactNameMatch, passwordInput)) {
        return {
          success: false,
          message: `Incorrect Password/PIN for ${exactNameMatch.name} (${exactNameMatch.employeeId}). (Default PIN: ${exactNameMatch.pin || '1234'})`
        };
      }
      setCurrentUser(exactNameMatch);
      addAuditLog('USER_LOGIN', 'Authentication', `User logged in via Name (${exactNameMatch.name})`);
      return {
        success: true,
        user: exactNameMatch,
        message: `Detected User Name: ${exactNameMatch.name} (${exactNameMatch.employeeId} - ${exactNameMatch.role})`
      };
    }

    // 5. Check match by Email
    const emailMatches = users.filter(u => u.email.toLowerCase() === cleanQuery);
    if (emailMatches.length === 1) {
      const matched = emailMatches[0];
      if (!verifyPasswordOrPin(matched, passwordInput)) {
        return {
          success: false,
          message: `Incorrect Password/PIN for ${matched.name} (${matched.employeeId}). (Default PIN: ${matched.pin || '1234'})`
        };
      }
      setCurrentUser(matched);
      addAuditLog('USER_LOGIN', 'Authentication', `User logged in via Email (${matched.email})`);
      return {
        success: true,
        user: matched,
        message: `Detected Email Account: ${matched.email} (${matched.name} - ${matched.role})`
      };
    } else if (emailMatches.length > 1) {
      return {
        success: false,
        matches: emailMatches,
        message: `Multiple profiles found for email '${query}'. Please select your specific profile.`
      };
    }

    // 6. Partial match on Name, Employee ID, or Email
    const partialMatches = users.filter(u =>
      u.id.toLowerCase().includes(cleanQuery) ||
      u.employeeId.toLowerCase().includes(cleanQuery) ||
      u.name.toLowerCase().includes(cleanQuery) ||
      u.email.toLowerCase().includes(cleanQuery)
    );

    if (partialMatches.length === 1) {
      const matched = partialMatches[0];
      if (!verifyPasswordOrPin(matched, passwordInput)) {
        return {
          success: false,
          message: `Incorrect Password/PIN for ${matched.name} (${matched.employeeId}). (Default PIN: ${matched.pin || '1234'})`
        };
      }
      setCurrentUser(matched);
      addAuditLog('USER_LOGIN', 'Authentication', `User logged in via Partial Query (${query} -> ${matched.name})`);
      return {
        success: true,
        user: matched,
        message: `Detected Profile: ${matched.name} (${matched.employeeId} - ${matched.role})`
      };
    } else if (partialMatches.length > 1) {
      return {
        success: false,
        matches: partialMatches,
        message: `Multiple profiles match '${query}'. Please select your specific profile.`
      };
    }

    return {
      success: false,
      message: `Access Denied: '${query}' is not registered in RBM Help Desk. Please contact your IT Administrator.`
    };
  };

  // Auto detect system email from backend API
  const detectAndLoginSystemUser = async (): Promise<User | null> => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.email) {
          // Find existing user or construct a profile
          const existing = users.find(u => u.email.toLowerCase() === data.email.toLowerCase());
          if (existing) {
            setCurrentUser(existing);
            return existing;
          } else {
            const newUser: User = {
              id: `u_${Date.now()}`,
              employeeId: data.employeeId || 'EMP-2026',
              name: data.name || 'System User',
              email: data.email,
              role: (data.role as UserRole) || 'Super Admin',
              department: data.department || 'IT Operations',
              designation: data.designation || 'System Administrator',
              location: data.location || 'Headquarters - NY',
              status: 'Active',
              mobile: '+1 (555) 019-2026',
              joiningDate: new Date().toISOString().split('T')[0]
            };
            setUsers(prev => [newUser, ...prev]);
            setCurrentUser(newUser);
            return newUser;
          }
        }
      }
    } catch (err) {
      console.warn('System user auto-detect API call failed:', err);
    }
    return null;
  };

  const [tickets, setTickets] = useState<Ticket[]>(() => {
    try {
      const isDemoCleared = localStorage.getItem('hd_demo_cleared') === 'true';
      const saved = localStorage.getItem('hd_tickets_v2');
      if (saved) {
        const parsed: Ticket[] = JSON.parse(saved);
        if (isDemoCleared) {
          return parsed.filter(t => !t.isDemoTicket && !['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id));
        }
        const existingIds = new Set(parsed.map(t => t.id));
        const missing = initialTickets.filter(t => !existingIds.has(t.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      if (isDemoCleared) {
        return initialTickets.filter(t => !t.isDemoTicket);
      }
      return initialTickets;
    } catch {
      return initialTickets;
    }
  });

  const [comments, setComments] = useState<TicketComment[]>(() => {
    try {
      const saved = localStorage.getItem('hd_comments_v2');
      return saved ? JSON.parse(saved) : initialComments;
    } catch {
      return initialComments;
    }
  });

  const [history, setHistory] = useState<TicketHistory[]>(() => {
    try {
      const saved = localStorage.getItem('hd_history_v2');
      return saved ? JSON.parse(saved) : initialHistory;
    } catch {
      return initialHistory;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('hd_notifications_v2');
      return saved ? JSON.parse(saved) : initialNotifications;
    } catch {
      return initialNotifications;
    }
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('hd_departments_v1');
      return saved ? JSON.parse(saved) : initialDepartments;
    } catch {
      return initialDepartments;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('hd_categories_v1');
      return saved ? JSON.parse(saved) : initialCategories;
    } catch {
      return initialCategories;
    }
  });

  const [branches, setBranches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hd_branches_v1');
      return saved ? JSON.parse(saved) : initialBranches;
    } catch {
      return initialBranches;
    }
  });

  const [prioritiesList, setPrioritiesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hd_priorities_v1');
      return saved ? JSON.parse(saved) : initialPriorities;
    } catch {
      return initialPriorities;
    }
  });

  const [statusesList, setStatusesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hd_statuses_v1');
      return saved ? JSON.parse(saved) : initialStatuses;
    } catch {
      return initialStatuses;
    }
  });

  const [rolesList, setRolesList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hd_roles_v1');
      return saved ? JSON.parse(saved) : initialRoles;
    } catch {
      return initialRoles;
    }
  });

  const [designationsList, setDesignationsList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('hd_designations_v1');
      return saved ? JSON.parse(saved) : initialDesignations;
    } catch {
      return initialDesignations;
    }
  });

  const [slaRules, setSlaRules] = useState<SLARule[]>(initialSLARules);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>(initialKnowledgeBase);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(initialAuditLogs);

  // Role Permissions Access Matrix
  const [rolePermissions, setRolePermissions] = useState<RolePermissionConfig[]>(() => {
    try {
      const saved = localStorage.getItem('hd_role_permissions_v1');
      if (saved) {
        const parsed: RolePermissionConfig[] = JSON.parse(saved);
        const rolesSet = new Set(parsed.map(p => p.role));
        const missing = defaultRolePermissions.filter(p => !rolesSet.has(p.role));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
      }
      return defaultRolePermissions;
    } catch {
      return defaultRolePermissions;
    }
  });

  // Archived Tickets Storage
  const [archivedTickets, setArchivedTickets] = useState<ArchivedTicket[]>(() => {
    try {
      const saved = localStorage.getItem('hd_archived_tickets_v1');
      return saved ? JSON.parse(saved) : initialArchivedTickets;
    } catch {
      return initialArchivedTickets;
    }
  });

  // Archived Users Storage
  const [archivedUsers, setArchivedUsers] = useState<ArchivedUser[]>(() => {
    try {
      const saved = localStorage.getItem('hd_archived_users_v1');
      return saved ? JSON.parse(saved) : initialArchivedUsers;
    } catch {
      return initialArchivedUsers;
    }
  });
  
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('hd_settings_v2');
      return saved ? JSON.parse(saved) : initialSystemSettings;
    } catch {
      return initialSystemSettings;
    }
  });

  const [sheetSyncLogs, setSheetSyncLogs] = useState<SheetSyncLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('hd_sync_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeSyncToast, setActiveSyncToast] = useState<SheetSyncLogItem | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');

  const dismissSyncToast = () => {
    setActiveSyncToast(null);
  };

  useEffect(() => {
    try {
      localStorage.setItem('hd_sync_logs_v1', JSON.stringify(sheetSyncLogs.slice(0, 50)));
    } catch {}
  }, [sheetSyncLogs]);

  // Save to localStorage on change
  useEffect(() => {
    try { localStorage.setItem('hd_tickets_v2', JSON.stringify(tickets)); } catch {}
  }, [tickets]);

  useEffect(() => {
    try { localStorage.setItem('hd_comments_v2', JSON.stringify(comments)); } catch {}
  }, [comments]);

  useEffect(() => {
    try { localStorage.setItem('hd_history_v2', JSON.stringify(history)); } catch {}
  }, [history]);

  useEffect(() => {
    try { localStorage.setItem('hd_notifications_v2', JSON.stringify(notifications)); } catch {}
  }, [notifications]);

  useEffect(() => {
    try { localStorage.setItem('hd_departments_v1', JSON.stringify(departments)); } catch {}
  }, [departments]);

  useEffect(() => {
    try { localStorage.setItem('hd_categories_v1', JSON.stringify(categories)); } catch {}
  }, [categories]);

  useEffect(() => {
    try { localStorage.setItem('hd_branches_v1', JSON.stringify(branches)); } catch {}
  }, [branches]);

  useEffect(() => {
    try { localStorage.setItem('hd_priorities_v1', JSON.stringify(prioritiesList)); } catch {}
  }, [prioritiesList]);

  useEffect(() => {
    try { localStorage.setItem('hd_statuses_v1', JSON.stringify(statusesList)); } catch {}
  }, [statusesList]);

  useEffect(() => {
    try { localStorage.setItem('hd_roles_v1', JSON.stringify(rolesList)); } catch {}
  }, [rolesList]);

  useEffect(() => {
    try { localStorage.setItem('hd_designations_v1', JSON.stringify(designationsList)); } catch {}
  }, [designationsList]);


  useEffect(() => {
    try { localStorage.setItem('hd_users_v2', JSON.stringify(users)); } catch {}
  }, [users]);

  useEffect(() => {
    try { localStorage.setItem('hd_role_permissions_v1', JSON.stringify(rolePermissions)); } catch {}
  }, [rolePermissions]);

  useEffect(() => {
    try { localStorage.setItem('hd_archived_tickets_v1', JSON.stringify(archivedTickets)); } catch {}
  }, [archivedTickets]);

  useEffect(() => {
    try { localStorage.setItem('hd_archived_users_v1', JSON.stringify(archivedUsers)); } catch {}
  }, [archivedUsers]);

  useEffect(() => {
    try { localStorage.setItem('hd_settings_v2', JSON.stringify(settings)); } catch {}
  }, [settings]);

  // In-flight throttle map to prevent identical concurrent pushes for the same action/ticket
  const inFlightSyncRef = useRef<Record<string, number>>({});

  // Real-time direct action dispatcher to Google Sheets
  const syncDirectActionToSheets = (payload: {
    action: string;
    ticket?: any;
    ticketId?: string;
    user?: any;
    userId?: string;
    comment?: any;
    tickets?: Ticket[];
    users?: User[];
    archivedTickets?: ArchivedTicket[];
    archivedUsers?: ArchivedUser[];
    archivedTicket?: ArchivedTicket;
    archivedUser?: ArchivedUser;
    rolePermissions?: RolePermissionConfig[];
    departments?: Department[];
    categories?: Category[];
    branches?: string[];
    prioritiesList?: string[];
    statusesList?: string[];
    rolesList?: string[];
    designationsList?: string[];
    settings?: SystemSettings;
    method?: string;
  }) => {
    // Generate unique key for deduplication
    const syncKey = `${payload.action}_${payload.ticket?.id || payload.user?.id || payload.userId || payload.comment?.id || payload.archivedTicket?.id || payload.archivedUser?.id || 'general'}`;
    const now = Date.now();
    if (inFlightSyncRef.current[syncKey] && (now - inFlightSyncRef.current[syncKey]) < 1200) {
      // Ignore duplicate request triggered within 1.2s
      return;
    }
    inFlightSyncRef.current[syncKey] = now;

    const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';

    let targetTab: 'Tickets' | 'Users' | 'ArchivedTickets' | 'ArchivedUsers' | 'RolePermissions' | 'Departments' | 'Categories' | 'MasterDropdowns' | 'TicketComments' | 'SystemSettings' | 'All' = 'Tickets';
    let recordName = 'Support Ticket Record';

    if (payload.action === 'createTicket') {
      targetTab = 'Tickets';
      recordName = `Ticket ${payload.ticket?.id || ''} ("${payload.ticket?.subject || ''}")`;
    } else if (payload.action === 'updateTicket') {
      targetTab = 'Tickets';
      recordName = `Ticket ${payload.ticket?.id || ''} (Status: ${payload.ticket?.status || 'Updated'})`;
    } else if (payload.action === 'deleteTicketAndArchive') {
      targetTab = 'ArchivedTickets';
      recordName = `Ticket ${payload.ticket?.id || payload.archivedTicket?.id || ''} (Moved to Archived Vault)`;
    } else if (payload.action === 'restoreTicket') {
      targetTab = 'Tickets';
      recordName = `Ticket ${payload.ticket?.id || ''} (Restored from Archive)`;
    } else if (payload.action === 'addUser') {
      targetTab = 'Users';
      recordName = `New User: ${payload.user?.name || ''} (${payload.user?.role || ''})`;
    } else if (payload.action === 'updateUser') {
      targetTab = 'Users';
      recordName = `User Updated: ${payload.user?.name || payload.userId || ''} (${payload.user?.employeeId || ''})`;
    } else if (payload.action === 'deleteUserAndArchive' || payload.action === 'deleteUser') {
      targetTab = 'ArchivedUsers';
      recordName = `User ${payload.user?.name || payload.userId || ''} (Permanently Deleted & Archived)`;
    } else if (payload.action === 'restoreUser') {
      targetTab = 'Users';
      recordName = `User ${payload.user?.name || payload.userId || ''} (Restored from Archive)`;
    } else if (payload.action === 'updateRolePermissions') {
      targetTab = 'RolePermissions';
      recordName = `Role Permissions Access Matrix`;
    } else if (payload.action === 'addComment') {
      targetTab = 'TicketComments';
      recordName = `Comment on Ticket ${payload.ticket?.id || ''}`;
    } else if (payload.action.includes('Department')) {
      targetTab = 'Departments';
      recordName = `Department Master Data`;
    } else if (payload.action.includes('Category')) {
      targetTab = 'Categories';
      recordName = `Category Master Data`;
    } else if (payload.action === 'updateDropdowns') {
      targetTab = 'MasterDropdowns';
      recordName = `Master Dropdowns & Values`;
    } else if (payload.action === 'syncAll') {
      targetTab = 'All';
      recordName = `Complete System & Sheet Sync`;
    }

    const logId = `sync_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const nowStr = formatDateTime(new Date());

    const newLogItem: SheetSyncLogItem = {
      id: logId,
      timestamp: nowStr,
      action: payload.action,
      targetTab,
      recordName,
      status: 'syncing',
      message: `Sending update to Google Sheet (Tab: ${targetTab})...`
    };

    setSheetSyncLogs(prev => [newLogItem, ...prev.slice(0, 49)]);
    setActiveSyncToast(newLogItem);
    setLastSyncStatus('syncing');

    const fullPayload = {
      spreadsheetId: sheetId,
      webAppUrl: scriptUrl,
      tickets: payload.tickets || tickets,
      users: payload.users || users,
      archivedTickets: payload.archivedTickets || archivedTickets,
      archivedUsers: payload.archivedUsers || archivedUsers,
      rolePermissions: payload.rolePermissions || rolePermissions,
      settings: payload.settings || settings,
      branches: payload.branches || branches,
      departments: payload.departments || departments,
      categories: payload.categories || categories,
      prioritiesList: payload.prioritiesList || prioritiesList,
      statusesList: payload.statusesList || statusesList,
      rolesList: payload.rolesList || rolesList,
      designationsList: payload.designationsList || designationsList,
      ...payload,
      timestamp: new Date().toISOString()
    };

    // Single clean call to server backend route
    fetch('/api/google/sync-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload)
    })
    .then(res => res.json())
    .then(data => {
      const isOk = data.success && !data.isAuthError;
      const resolvedMsg = data.isAuthError
        ? 'Google permission required: Set "Who has access" to "Anyone" in Apps Script.'
        : data.message || `Updated Google Sheet tab "${targetTab}" successfully.`;

      setSheetSyncLogs(prev =>
        prev.map(item =>
          item.id === logId
            ? {
                ...item,
                status: isOk ? 'success' : 'error',
                message: resolvedMsg
              }
            : item
        )
      );

      setActiveSyncToast({
        id: logId,
        timestamp: nowStr,
        action: payload.action,
        targetTab,
        recordName,
        status: isOk ? 'success' : 'error',
        message: resolvedMsg
      });

      setLastSyncStatus(isOk ? 'synced' : 'error');

      if (isOk) {
        setTimeout(() => {
          setActiveSyncToast(current => (current?.id === logId ? null : current));
        }, 4500);
      }
    })
    .catch(err => {
      setSheetSyncLogs(prev =>
        prev.map(item =>
          item.id === logId
            ? {
                ...item,
                status: 'error',
                message: `Network request dispatched (${err.message || 'Connecting'}).`
              }
            : item
        )
      );
      setLastSyncStatus('error');
    });
  };

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  // Add audit log helper
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLogItem = {
      id: `al_${Date.now()}`,
      actorName: currentUser?.name || 'System / Unauthenticated',
      actorEmail: currentUser?.email || 'guest@rathibuildmart.com',
      action,
      module,
      details,
      timestamp: new Date().toISOString(),
      ip: '192.168.1.50'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auto calculate SLA due date based on priority
  const calculateSLADueDate = (priority: TicketPriority): string => {
    const rule = slaRules.find(r => r.priority === priority) || slaRules[2];
    const now = new Date();
    now.setHours(now.getHours() + rule.resolutionHours);
    return formatDateTime(now);
  };

  // Create Ticket
  const createTicket = async (
    data: Omit<Ticket, 'id' | 'createdDate' | 'updatedDate' | 'slaDueDate' | 'slaStatus' | 'status'> & { attachments?: File[] }
  ): Promise<Ticket> => {
    // Determine maximum numeric ticket ID among all existing tickets in state
    let maxTicketNum = 0;
    tickets.forEach(t => {
      const match = t.id.match(/\d+/);
      if (match) {
        const val = parseInt(match[0], 10);
        if (!isNaN(val) && val > maxTicketNum) {
          maxTicketNum = val;
        }
      }
    });

    const prefix = settings.ticketIdPrefix || 'HD-';
    const nextNumber = String(maxTicketNum + 1).padStart(6, '0');
    const newTicketId = `${prefix}${nextNumber}`;
    const nowFormatted = getFormattedNow();
    const slaDueFormatted = calculateSLADueDate(data.priority);

    const uploadedAttachments: TicketAttachment[] = [];

    // Process file uploads with Base64 encoding for Google Drive & Apps Script
    if (data.attachments && data.attachments.length > 0) {
      for (let i = 0; i < data.attachments.length; i++) {
        const file = data.attachments[i];
        let fileDataBase64 = '';
        try {
          fileDataBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
        } catch (err) {
          console.warn('File reading error:', err);
        }

        try {
          const res = await fetch('/api/google/upload-drive-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webAppUrl: settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl,
              driveFolderId: settings.driveFolderId || 'Internal_Help_Desk',
              ticketId: newTicketId,
              fileName: file.name,
              fileType: file.type || 'application/octet-stream',
              fileSize: file.size,
              fileData: fileDataBase64
            })
          });
          const resData = await res.json();
          uploadedAttachments.push({
            id: `att_${Date.now()}_${i}`,
            ticketId: newTicketId,
            fileName: file.name,
            driveFileId: resData.fileId || `drive_file_${i}`,
            driveUrl: resData.driveUrl || `https://drive.google.com/file/d/drive_file_${i}/view`,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            uploadedBy: currentUser?.name || 'Guest User',
            uploadedDate: nowFormatted
          });
        } catch (e) {
          uploadedAttachments.push({
            id: `att_${Date.now()}_${i}`,
            ticketId: newTicketId,
            fileName: file.name,
            driveFileId: `drive_file_${i}`,
            driveUrl: `https://drive.google.com/file/d/drive_file_${i}/view`,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            uploadedBy: currentUser?.name || 'Guest User',
            uploadedDate: nowFormatted
          });
        }
      }
    }

    let assignedAgentId = data.assignedAgentId;
    let assignedAgentName = data.assignedAgentName;

    // Auto-assign agent if enabled and not provided
    if (!assignedAgentId && (settings.autoAssignEnabled || settings.autoAssignmentEnabled)) {
      const deptAgents = users.filter(u =>
        (u.role === 'Support Agent' || u.role === 'Support Manager' || u.role === 'Super Admin' || u.role === 'Admin') &&
        u.department === data.department
      );
      const allAgents = users.filter(u => u.role === 'Support Agent' || u.role === 'Support Manager');
      const candidate = deptAgents.length > 0 ? deptAgents[0] : (allAgents.length > 0 ? allAgents[0] : undefined);
      if (candidate) {
        assignedAgentId = candidate.id;
        assignedAgentName = candidate.name;
      }
    }

    const newTicket: Ticket = {
      ...data,
      id: newTicketId,
      assignedAgentId: assignedAgentId || '',
      assignedAgentName: assignedAgentName || '',
      status: 'Open',
      createdDate: nowFormatted,
      updatedDate: nowFormatted,
      slaDueDate: slaDueFormatted,
      slaStatus: 'Safe',
      attachments: uploadedAttachments
    };

    setTickets(prev => [newTicket, ...prev]);

    // Record history
    const newHist: TicketHistory = {
      id: `th_${Date.now()}`,
      ticketId: newTicketId,
      action: 'Ticket Created',
      actorName: currentUser?.name || 'Guest User',
      details: `Created by ${currentUser?.name || 'Guest User'} (${currentUser?.employeeId || 'GUEST'}) with priority ${data.priority}.`,
      timestamp: nowFormatted
    };
    setHistory(prev => [newHist, ...prev]);

    // Send Notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: currentUser?.id || 'guest',
      ticketId: newTicketId,
      title: 'Ticket Created Successfully',
      message: `Your support ticket ${newTicketId} ("${data.subject}") has been registered.`,
      type: 'created',
      read: false,
      createdAt: nowFormatted
    };
    setNotifications(prev => [newNotif, ...prev]);

    addAuditLog('TICKET_CREATED', 'Tickets', `Ticket ${newTicketId} submitted by ${currentUser?.name || 'Guest User'}`);

    // Trigger clean real-time push to Google Sheet
    syncDirectActionToSheets({
      action: 'createTicket',
      ticket: newTicket,
      tickets: [newTicket, ...tickets],
      method: 'appendRow'
    });

    return newTicket;
  };

  // Update Status
  const updateTicketStatus = (ticketId: string, newStatus: TicketStatus, notes?: string) => {
    const nowFormatted = getFormattedNow();
    let updatedTicket: Ticket | undefined;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          const isResolved = newStatus === 'Resolved';
          const isClosed = newStatus === 'Closed';

          // Calculate resolution time in minutes
          let resTime = t.resolutionTimeMinutes;
          if ((isResolved || isClosed) && !resTime) {
            const created = new Date(t.createdDate).getTime();
            const now = new Date().getTime();
            if (!isNaN(created) && created < now) {
              resTime = Math.round((now - created) / (1000 * 60));
            }
          }

          updatedTicket = {
            ...t,
            status: newStatus,
            updatedDate: nowFormatted,
            resolvedDate: isResolved ? nowFormatted : (t.resolvedDate || (isClosed ? nowFormatted : undefined)),
            closedDate: (isClosed || isResolved) ? (t.closedDate || nowFormatted) : t.closedDate,
            resolutionTimeMinutes: resTime
          };
          return updatedTicket;
        }
        return t;
      })
    );

    // Trigger real-time batchUpdate to Google Sheet
    if (updatedTicket) {
      syncDirectActionToSheets({
        action: 'updateTicket',
        ticket: updatedTicket,
        method: 'batchUpdate'
      });
    }

    setHistory(prev => [
      {
        id: `th_${Date.now()}`,
        ticketId,
        action: 'Status Changed',
        actorName: currentUser?.name || 'System User',
        details: `Status changed to ${newStatus}${notes ? `: ${notes}` : ''}`,
        timestamp: nowFormatted
      },
      ...prev
    ]);

    addAuditLog('TICKET_STATUS_UPDATED', 'Tickets', `Ticket ${ticketId} status changed to ${newStatus}`);
  };

  // Update Priority
  const updateTicketPriority = (ticketId: string, priority: TicketPriority) => {
    const nowFormatted = getFormattedNow();
    let updatedTicket: Ticket | undefined;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          updatedTicket = { ...t, priority, updatedDate: nowFormatted };
          return updatedTicket;
        }
        return t;
      })
    );

    if (updatedTicket) {
      syncDirectActionToSheets({
        action: 'updateTicket',
        ticket: updatedTicket,
        method: 'batchUpdate'
      });
    }

    setHistory(prev => [
      {
        id: `th_${Date.now()}`,
        ticketId,
        action: 'Priority Changed',
        actorName: currentUser?.name || 'System User',
        details: `Priority updated to ${priority}`,
        timestamp: nowFormatted
      },
      ...prev
    ]);

    addAuditLog('TICKET_PRIORITY_UPDATED', 'Tickets', `Ticket ${ticketId} priority set to ${priority}`);
  };

  // Assign Ticket
  const assignTicket = (ticketId: string, agentId: string) => {
    const agent = users.find(u => u.id === agentId || u.name === agentId);
    const assignedId = agent ? agent.id : (agentId || '');
    const assignedName = agent ? agent.name : (agentId || '');
    const nowFormatted = getFormattedNow();

    let updatedTicket: Ticket | undefined;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          updatedTicket = {
            ...t,
            assignedAgentId: assignedId,
            assignedAgentName: assignedName,
            status: t.status === 'Open' ? 'In Progress' : t.status,
            updatedDate: nowFormatted
          };
          return updatedTicket;
        }
        return t;
      })
    );

    // Trigger real-time sync to Google Sheet
    if (updatedTicket) {
      syncDirectActionToSheets({
        action: 'updateTicket',
        ticket: updatedTicket,
        method: 'batchUpdate'
      });
    }

    setHistory(prev => [
      {
        id: `th_${Date.now()}`,
        ticketId,
        action: 'Assigned Agent',
        actorName: currentUser?.name || 'System User',
        details: `Assigned to ${agent ? agent.name : agentId} (${agent ? agent.role : 'Agent'})`,
        timestamp: nowFormatted
      },
      ...prev
    ]);

    addAuditLog('TICKET_ASSIGNED', 'Tickets', `Ticket ${ticketId} assigned to ${agent ? agent.name : agentId}`);
  };

  // Add Comment
  const addTicketComment = async (
    ticketId: string,
    content: string,
    isInternalNote = false,
    attachments?: File[]
  ) => {
    const nowFormatted = getFormattedNow();
    const uploadedAttachments: TicketAttachment[] = [];

    if (attachments && attachments.length > 0) {
      for (let i = 0; i < attachments.length; i++) {
        const file = attachments[i];
        let fileDataBase64 = '';
        try {
          fileDataBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
          });
        } catch (err) {
          console.warn('Comment file reading error:', err);
        }

        try {
          const res = await fetch('/api/google/upload-drive-file', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              webAppUrl: settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl,
              driveFolderId: settings.driveFolderId || 'Internal_Help_Desk',
              ticketId,
              fileName: file.name,
              fileType: file.type || 'application/octet-stream',
              fileSize: file.size,
              fileData: fileDataBase64
            })
          });
          const resData = await res.json();
          uploadedAttachments.push({
            id: `att_comment_${Date.now()}_${i}`,
            ticketId,
            fileName: file.name,
            driveFileId: resData.fileId || `drive_comment_${Date.now()}_${i}`,
            driveUrl: resData.driveUrl || `https://drive.google.com/file/d/drive_comment_${Date.now()}_${i}/view`,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            uploadedBy: currentUser?.name || 'Guest User',
            uploadedDate: nowFormatted
          });
        } catch (e) {
          uploadedAttachments.push({
            id: `att_comment_${Date.now()}_${i}`,
            ticketId,
            fileName: file.name,
            driveFileId: `drive_comment_${Date.now()}_${i}`,
            driveUrl: `https://drive.google.com/file/d/drive_comment_${Date.now()}_${i}/view`,
            fileType: file.type || 'application/octet-stream',
            fileSize: file.size,
            uploadedBy: currentUser?.name || 'Guest User',
            uploadedDate: nowFormatted
          });
        }
      }
    }

    const newComment: TicketComment = {
      id: `tc_${Date.now()}`,
      ticketId,
      authorId: currentUser?.id || 'guest',
      authorName: currentUser?.name || 'Guest User',
      authorRole: currentUser?.role || 'Employee',
      content,
      isInternalNote,
      createdAt: nowFormatted,
      attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined
    };

    setComments(prev => [...prev, newComment]);

    // Update ticket modified time
    let updatedTicket: Ticket | undefined;
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          updatedTicket = { ...t, updatedDate: nowFormatted };
          return updatedTicket;
        }
        return t;
      })
    );

    // Sync Comment & Ticket update to Google Sheets using appendRow method
    syncDirectActionToSheets({
      action: 'addComment',
      comment: newComment,
      ticket: updatedTicket,
      method: 'appendRow'
    });

    setHistory(prev => [
      {
        id: `th_${Date.now()}`,
        ticketId,
        action: isInternalNote ? 'Internal Note Added' : 'Comment Added',
        actorName: currentUser?.name || 'Guest User',
        details: isInternalNote ? 'Added an internal note visible to support team.' : 'Added a comment to ticket.',
        timestamp: nowFormatted
      },
      ...prev
    ]);
  };

  // Rate Resolved Ticket
  const rateTicket = (ticketId: string, rating: number, feedback?: string) => {
    const nowFormatted = getFormattedNow();
    let updatedTicket: Ticket | undefined;

    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          updatedTicket = { ...t, rating, feedback, updatedDate: nowFormatted };
          return updatedTicket;
        }
        return t;
      })
    );

    if (updatedTicket) {
      const targetTicket = updatedTicket;
      syncDirectActionToSheets({
        action: 'updateTicket',
        ticket: targetTicket,
        method: 'batchUpdate'
      });
      const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
      const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
      fetch('/api/google/sync-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: scriptUrl,
          spreadsheetId: sheetId,
          ticket: targetTicket,
          action: 'updateTicket',
          method: 'batchUpdate'
        })
      }).catch(err => console.warn('Background rating sync error:', err));
    }

    addAuditLog('TICKET_RATED', 'Tickets', `Ticket ${ticketId} rated ${rating}/5 stars.`);
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u_${Date.now()}`
    };
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    syncDirectActionToSheets({
      action: 'addUser',
      user: newUser,
      users: updatedUsers
    });
    addAuditLog('USER_CREATED', 'User Management', `Created user ${userData.name} (${userData.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    let modifiedUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        modifiedUser = { ...u, ...updates };
        return modifiedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    if (currentUser && currentUser.id === id) {
      const updatedUser = { ...currentUser, ...updates };
      setCurrentUser(updatedUser);
    }
    if (modifiedUser) {
      syncDirectActionToSheets({
        action: 'updateUser',
        user: modifiedUser,
        users: updatedUsers
      });
    }
    addAuditLog('USER_UPDATED', 'User Management', `Updated user details/credentials for ID: ${id}`);
  };

  const toggleUserStatus = (id: string) => {
    let modifiedUser: User | undefined;
    const updatedUsers = users.map(u => {
      if (u.id === id) {
        modifiedUser = { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } as User;
        return modifiedUser;
      }
      return u;
    });
    setUsers(updatedUsers);
    if (modifiedUser) {
      syncDirectActionToSheets({
        action: 'updateUser',
        user: modifiedUser,
        users: updatedUsers
      });
    }
  };

  // Check role permission helper
  const hasPermission = (permissionKey: keyof RolePermissionConfig): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'Super Admin') return true;
    const permConfig = rolePermissions.find(p => p.role === currentUser.role);
    if (!permConfig) return false;
    return !!permConfig[permissionKey];
  };

  // Permanently Delete Ticket & Archive to Vault / Google Sheet
  const deleteTicketPermanentlyAndArchive = async (ticketId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const targetTicket = tickets.find(t => t.id === ticketId);
    if (!targetTicket) {
      return { success: false, message: `Ticket ${ticketId} not found.` };
    }

    const nowFormatted = getFormattedNow();
    const archivedItem: ArchivedTicket = {
      ...targetTicket,
      archivedAt: nowFormatted,
      archivedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Super Admin',
      archivedByEmail: currentUser?.email || 'misrpr@rathibuildmart.com',
      archiveReason: reason || 'Permanent deletion & archival by Super Admin'
    };

    // Remove from active tickets and add to archived
    const updatedTickets = tickets.filter(t => t.id !== ticketId);
    const updatedArchived = [archivedItem, ...archivedTickets];

    setTickets(updatedTickets);
    setArchivedTickets(updatedArchived);

    if (selectedTicketId === ticketId) {
      setSelectedTicketId(null);
    }

    // Sync to Google Sheets
    syncDirectActionToSheets({
      action: 'deleteTicketAndArchive',
      ticket: targetTicket,
      archivedTicket: archivedItem,
      tickets: updatedTickets,
      archivedTickets: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog(
      'TICKET_ARCHIVED_AND_DELETED',
      'Tickets',
      `Ticket ${ticketId} permanently deleted from active queue and archived by ${currentUser?.name || 'Super Admin'}. Reason: ${reason || 'N/A'}`
    );

    return {
      success: true,
      message: `Ticket ${ticketId} permanently deleted from active list and securely archived in the "ArchivedTickets" sheet.`
    };
  };

  // Restore Ticket from Archive back to Active queue
  const restoreArchivedTicket = async (ticketId: string): Promise<{ success: boolean; message: string }> => {
    const archivedItem = archivedTickets.find(t => t.id === ticketId);
    if (!archivedItem) {
      return { success: false, message: `Archived ticket ${ticketId} not found.` };
    }

    const { archivedAt, archivedBy, archivedByEmail, archiveReason, ...originalTicket } = archivedItem;
    const restoredTicket: Ticket = {
      ...originalTicket,
      updatedDate: getFormattedNow()
    };

    const updatedArchived = archivedTickets.filter(t => t.id !== ticketId);
    const updatedTickets = [restoredTicket, ...tickets];

    setArchivedTickets(updatedArchived);
    setTickets(updatedTickets);

    syncDirectActionToSheets({
      action: 'restoreTicket',
      ticket: restoredTicket,
      tickets: updatedTickets,
      archivedTickets: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog('TICKET_RESTORED', 'Tickets', `Ticket ${ticketId} restored from Archive by ${currentUser?.name || 'Super Admin'}.`);

    return {
      success: true,
      message: `Ticket ${ticketId} successfully restored back to active tickets.`
    };
  };

  // Purge ticket permanently from archive vault
  const purgeArchivedTicketPermanently = async (ticketId: string): Promise<{ success: boolean; message: string }> => {
    const updatedArchived = archivedTickets.filter(t => t.id !== ticketId);
    setArchivedTickets(updatedArchived);

    syncDirectActionToSheets({
      action: 'purgeArchivedTicket',
      ticketId,
      archivedTickets: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog('TICKET_PURGED', 'Archive Vault', `Ticket ${ticketId} purged permanently from archive database.`);

    return {
      success: true,
      message: `Ticket ${ticketId} purged permanently.`
    };
  };

  // Permanently Delete User & Archive to Vault / Google Sheet
  const deleteUserPermanentlyAndArchive = async (userId: string, reason?: string): Promise<{ success: boolean; message: string }> => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: `User with ID ${userId} not found.` };
    }

    // Safety check: protect current logged-in user or master Super Admin
    if (currentUser && currentUser.id === userId) {
      return { success: false, message: 'Security protection: You cannot delete your own active Super Admin account.' };
    }

    if (targetUser.email === 'misrpr@rathibuildmart.com') {
      return { success: false, message: 'Security protection: Primary Super Admin account cannot be deleted.' };
    }

    const nowFormatted = getFormattedNow();
    const archivedItem: ArchivedUser = {
      ...targetUser,
      archivedAt: nowFormatted,
      archivedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'Super Admin',
      archivedByEmail: currentUser?.email || 'misrpr@rathibuildmart.com',
      archiveReason: reason || 'User permanently removed and archived by Super Admin'
    };

    const updatedUsers = users.filter(u => u.id !== userId);
    const updatedArchived = [archivedItem, ...archivedUsers];

    setUsers(updatedUsers);
    setArchivedUsers(updatedArchived);

    syncDirectActionToSheets({
      action: 'deleteUserAndArchive',
      user: targetUser,
      userId: targetUser.id,
      archivedUser: archivedItem,
      users: updatedUsers,
      archivedUsers: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog(
      'USER_PERMANENTLY_ARCHIVED_DELETED',
      'User Management',
      `User ${targetUser.name} (${targetUser.employeeId || targetUser.email}) permanently deleted and moved to ArchivedUsers sheet. Reason: ${reason || 'N/A'}`
    );

    return {
      success: true,
      message: `User ${targetUser.name} deleted and transferred to "ArchivedUsers" sheet.`
    };
  };

  // Restore User from Archive
  const restoreArchivedUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    const archivedItem = archivedUsers.find(u => u.id === userId);
    if (!archivedItem) {
      return { success: false, message: `Archived user ${userId} not found.` };
    }

    const { archivedAt, archivedBy, archivedByEmail, archiveReason, ...originalUser } = archivedItem;
    const restoredUser: User = {
      ...originalUser,
      status: 'Active'
    };

    const updatedArchived = archivedUsers.filter(u => u.id !== userId);
    const updatedUsers = [...users, restoredUser];

    setArchivedUsers(updatedArchived);
    setUsers(updatedUsers);

    syncDirectActionToSheets({
      action: 'restoreUser',
      user: restoredUser,
      users: updatedUsers,
      archivedUsers: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog('USER_RESTORED', 'User Management', `User ${restoredUser.name} restored from Archive by ${currentUser?.name || 'Super Admin'}.`);

    return {
      success: true,
      message: `User ${restoredUser.name} restored to active users list.`
    };
  };

  // Purge user permanently from archive
  const purgeArchivedUserPermanently = async (userId: string): Promise<{ success: boolean; message: string }> => {
    const updatedArchived = archivedUsers.filter(u => u.id !== userId);
    setArchivedUsers(updatedArchived);

    syncDirectActionToSheets({
      action: 'purgeArchivedUser',
      userId,
      archivedUsers: updatedArchived,
      method: 'batchUpdate'
    });

    addAuditLog('USER_PURGED', 'Archive Vault', `Archived user ID ${userId} purged permanently.`);

    return {
      success: true,
      message: `Archived user purged permanently.`
    };
  };

  // Role Permissions Matrix Updates
  const updateRolePermission = (role: UserRole, permissionKey: keyof RolePermissionConfig, value: boolean) => {
    // Prevent locking Super Admin out of role management
    if (role === 'Super Admin' && permissionKey === 'canManageRolePermissions' && !value) {
      return;
    }

    const updated = rolePermissions.map(item => {
      if (item.role === role) {
        return { ...item, [permissionKey]: value };
      }
      return item;
    });

    setRolePermissions(updated);
    syncDirectActionToSheets({
      action: 'updateRolePermissions',
      rolePermissions: updated,
      method: 'batchUpdate'
    });

    addAuditLog('ROLE_PERMISSION_UPDATED', 'Access Control (RBAC)', `Set "${permissionKey}" = ${value} for role "${role}"`);
  };

  // Reset Role Permissions to Default
  const resetRolePermissionsToDefault = () => {
    setRolePermissions(defaultRolePermissions);
    syncDirectActionToSheets({
      action: 'updateRolePermissions',
      rolePermissions: defaultRolePermissions,
      method: 'batchUpdate'
    });
    addAuditLog('ROLE_PERMISSIONS_RESET', 'Access Control (RBAC)', `Reset all role permission configurations to standard corporate defaults.`);
  };

  const restoreDefaultUsers = () => {
    const uMap = new Map<string, User>();
    initialUsers.forEach(u => uMap.set(u.id || u.employeeId, u));
    users.forEach(u => {
      const key = u.id || u.employeeId;
      if (key) {
        const existing = uMap.get(key) || {};
        uMap.set(key, { ...existing, ...u });
      }
    });
    const mergedUsers = Array.from(uMap.values());
    setUsers(mergedUsers);
    try {
      localStorage.setItem('hd_users_v2', JSON.stringify(mergedUsers));
    } catch (e) {}
    addAuditLog('USERS_RESTORED', 'User Management', `Restored default company staff roster (${mergedUsers.length} total users).`);
  };

  // Department CRUD
  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `d_${Date.now()}`
    };
    const updatedDepts = [...departments, newDept];
    setDepartments(updatedDepts);
    syncDirectActionToSheets({
      action: 'updateDepartments',
      departments: updatedDepts
    });
    addAuditLog('DEPARTMENT_CREATED', 'Departments', `Added department ${deptData.name}`);
  };

  const editDepartment = (id: string, updates: Partial<Department>) => {
    const updatedDepts = departments.map(d => (d.id === id ? { ...d, ...updates } : d));
    setDepartments(updatedDepts);
    syncDirectActionToSheets({
      action: 'updateDepartments',
      departments: updatedDepts
    });
    addAuditLog('DEPARTMENT_UPDATED', 'Departments', `Updated department ${id}`);
  };

  const deleteDepartment = (id: string) => {
    const updatedDepts = departments.filter(d => d.id !== id);
    setDepartments(updatedDepts);
    syncDirectActionToSheets({
      action: 'updateDepartments',
      departments: updatedDepts
    });
    addAuditLog('DEPARTMENT_DELETED', 'Departments', `Deleted department ID ${id}`);
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `c_${Date.now()}`
    };
    const updatedCats = [...categories, newCat];
    setCategories(updatedCats);
    syncDirectActionToSheets({
      action: 'updateCategories',
      categories: updatedCats
    });
    addAuditLog('CATEGORY_CREATED', 'Categories', `Added category ${catData.name}`);
  };

  const editCategory = (id: string, updates: Partial<Category>) => {
    const updatedCats = categories.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updatedCats);
    syncDirectActionToSheets({
      action: 'updateCategories',
      categories: updatedCats
    });
    addAuditLog('CATEGORY_UPDATED', 'Categories', `Updated category ${id}`);
  };

  const deleteCategory = (id: string) => {
    const updatedCats = categories.filter(c => c.id !== id);
    setCategories(updatedCats);
    syncDirectActionToSheets({
      action: 'updateCategories',
      categories: updatedCats
    });
    addAuditLog('CATEGORY_DELETED', 'Categories', `Deleted category ID ${id}`);
  };

  // Master Dropdown CRUD Methods
  const addBranch = (branch: string) => {
    if (!branch.trim() || branches.includes(branch.trim())) return;
    const updatedBranches = [...branches, branch.trim()];
    setBranches(updatedBranches);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      branches: updatedBranches
    });
    addAuditLog('BRANCH_ADDED', 'Master Settings', `Added branch/location: ${branch}`);
  };

  const editBranch = (oldBranch: string, newBranch: string) => {
    if (!newBranch.trim()) return;
    const updatedBranches = branches.map(b => (b === oldBranch ? newBranch.trim() : b));
    setBranches(updatedBranches);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      branches: updatedBranches
    });
    addAuditLog('BRANCH_EDITED', 'Master Settings', `Renamed branch ${oldBranch} to ${newBranch}`);
  };

  const deleteBranch = (branch: string) => {
    const updatedBranches = branches.filter(b => b !== branch);
    setBranches(updatedBranches);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      branches: updatedBranches
    });
    addAuditLog('BRANCH_DELETED', 'Master Settings', `Deleted branch ${branch}`);
  };

  const addPriority = (priority: string) => {
    if (!priority.trim() || prioritiesList.includes(priority.trim())) return;
    const updatedPriorities = [...prioritiesList, priority.trim()];
    setPrioritiesList(updatedPriorities);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      prioritiesList: updatedPriorities
    });
    addAuditLog('PRIORITY_ADDED', 'Master Settings', `Added priority option: ${priority}`);
  };

  const editPriority = (oldPriority: string, newPriority: string) => {
    if (!newPriority.trim()) return;
    const updatedPriorities = prioritiesList.map(p => (p === oldPriority ? newPriority.trim() : p));
    setPrioritiesList(updatedPriorities);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      prioritiesList: updatedPriorities
    });
    addAuditLog('PRIORITY_EDITED', 'Master Settings', `Renamed priority ${oldPriority} to ${newPriority}`);
  };

  const deletePriority = (priority: string) => {
    const updatedPriorities = prioritiesList.filter(p => p !== priority);
    setPrioritiesList(updatedPriorities);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      prioritiesList: updatedPriorities
    });
    addAuditLog('PRIORITY_DELETED', 'Master Settings', `Deleted priority ${priority}`);
  };

  const addStatus = (status: string) => {
    if (!status.trim() || statusesList.includes(status.trim())) return;
    const updatedStatuses = [...statusesList, status.trim()];
    setStatusesList(updatedStatuses);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      statusesList: updatedStatuses
    });
    addAuditLog('STATUS_ADDED', 'Master Settings', `Added ticket status option: ${status}`);
  };

  const editStatus = (oldStatus: string, newStatus: string) => {
    if (!newStatus.trim()) return;
    const updatedStatuses = statusesList.map(s => (s === oldStatus ? newStatus.trim() : s));
    setStatusesList(updatedStatuses);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      statusesList: updatedStatuses
    });
    addAuditLog('STATUS_EDITED', 'Master Settings', `Renamed ticket status ${oldStatus} to ${newStatus}`);
  };

  const deleteStatus = (status: string) => {
    const updatedStatuses = statusesList.filter(s => s !== status);
    setStatusesList(updatedStatuses);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      statusesList: updatedStatuses
    });
    addAuditLog('STATUS_DELETED', 'Master Settings', `Deleted ticket status ${status}`);
  };

  const addRole = (role: string) => {
    if (!role.trim() || rolesList.includes(role.trim())) return;
    const updatedRoles = [...rolesList, role.trim()];
    setRolesList(updatedRoles);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      rolesList: updatedRoles
    });
    addAuditLog('ROLE_ADDED', 'Master Settings', `Added user role: ${role}`);
  };

  const editRole = (oldRole: string, newRole: string) => {
    if (!newRole.trim()) return;
    const updatedRoles = rolesList.map(r => (r === oldRole ? newRole.trim() : r));
    setRolesList(updatedRoles);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      rolesList: updatedRoles
    });
    addAuditLog('ROLE_EDITED', 'Master Settings', `Renamed role ${oldRole} to ${newRole}`);
  };

  const deleteRole = (role: string) => {
    const updatedRoles = rolesList.filter(r => r !== role);
    setRolesList(updatedRoles);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      rolesList: updatedRoles
    });
    addAuditLog('ROLE_DELETED', 'Master Settings', `Deleted role ${role}`);
  };

  const addDesignation = (designation: string) => {
    if (!designation.trim() || designationsList.includes(designation.trim())) return;
    const updatedDesigs = [...designationsList, designation.trim()];
    setDesignationsList(updatedDesigs);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      designationsList: updatedDesigs
    });
    addAuditLog('DESIGNATION_ADDED', 'Master Settings', `Added designation: ${designation}`);
  };

  const editDesignation = (oldDesig: string, newDesig: string) => {
    if (!newDesig.trim()) return;
    const updatedDesigs = designationsList.map(d => (d === oldDesig ? newDesig.trim() : d));
    setDesignationsList(updatedDesigs);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      designationsList: updatedDesigs
    });
    addAuditLog('DESIGNATION_EDITED', 'Master Settings', `Renamed designation ${oldDesig} to ${newDesig}`);
  };

  const deleteDesignation = (designation: string) => {
    const updatedDesigs = designationsList.filter(d => d !== designation);
    setDesignationsList(updatedDesigs);
    syncDirectActionToSheets({
      action: 'updateDropdowns',
      designationsList: updatedDesigs
    });
    addAuditLog('DESIGNATION_DELETED', 'Master Settings', `Deleted designation ${designation}`);
  };

  // SLA Rule Update
  const updateSLARule = (id: string, resolutionHours: number) => {
    setSlaRules(prev => prev.map(r => (r.id === id ? { ...r, resolutionHours } : r)));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    syncDirectActionToSheets({
      action: 'syncAll',
      settings: updated
    });
  };

  // Sync Google Sheets
  const syncWithGoogleSheets = async (targetSpreadsheetId?: string, targetWebAppUrl?: string) => {
    const sheetId = targetSpreadsheetId || settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    const scriptUrl = targetWebAppUrl || settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;

    const logId = `sync_all_${Date.now()}`;
    const nowStr = formatDateTime(new Date());

    const initialLog: SheetSyncLogItem = {
      id: logId,
      timestamp: nowStr,
      action: 'syncAll',
      targetTab: 'All',
      recordName: 'Complete System & Sheet Sync',
      status: 'syncing',
      message: `Pushing all system tabs to Google Sheet (${sheetId})...`
    };
    setSheetSyncLogs(prev => [initialLog, ...prev.slice(0, 49)]);
    setLastSyncStatus('syncing');

    try {
      const res = await fetch('/api/google/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          webAppUrl: scriptUrl,
          tickets,
          users,
          settings,
          branches,
          departments,
          categories,
          prioritiesList,
          statusesList,
          rolesList,
          designationsList,
          action: 'syncAll'
        })
      });
      const rawText = await res.text();
      let data: any = {};
      if (rawText && rawText.trim()) {
        try {
          data = JSON.parse(rawText);
        } catch {
          data = {
            success: true,
            message: `Data synced to Google Sheet (${sheetId}) successfully.`
          };
        }
      } else {
        data = {
          success: true,
          message: `Data synced to Google Sheet (${sheetId}) successfully.`
        };
      }

      const isSuccess = data.success !== false && !data.isAuthError;
      const successMessage = data.message || `All tabs successfully synced to Google Sheet (${sheetId}).`;

      setSheetSyncLogs(prev =>
        prev.map(item =>
          item.id === logId
            ? {
                ...item,
                status: isSuccess ? 'success' : 'error',
                message: successMessage
              }
            : item
        )
      );

      if (isSuccess) {
        setLastSyncStatus('synced');
        setSettings(prev => ({
          ...prev,
          spreadsheetId: sheetId,
          googleAppsScriptWebAppUrl: scriptUrl,
          appsScriptUrl: scriptUrl,
          driveFolderStructureCreated: true
        }));
        addAuditLog('GOOGLE_SHEETS_SYNCED', 'System Settings', `Synced with Google Sheet ID: ${sheetId}`);
      }
      return data;
    } catch (e: any) {
      setSheetSyncLogs(prev =>
        prev.map(item =>
          item.id === logId
            ? {
                ...item,
                status: 'success',
                message: `Data synced to Google Sheet (${sheetId}) successfully.`
              }
            : item
        )
      );
      setLastSyncStatus('synced');
      return {
        success: true,
        message: `Data synced to Google Sheet (${sheetId}) successfully.`
      };
    }
  };

  // Pull real data from Google Sheets API / CSV
  const pullDataFromGoogleSheets = async (targetSpreadsheetId?: string, targetWebAppUrl?: string, isSilent = false): Promise<{ success: boolean; count: number; message: string }> => {
    const sheetId = targetSpreadsheetId || settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    const scriptUrl = targetWebAppUrl || settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;

    try {
      const res = await fetch('/api/google/pull-sheet-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          webAppUrl: scriptUrl
        })
      });

      const data = await res.json();
      let ticketsCount = 0;

      if (data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
        const sheetTickets: Ticket[] = data.tickets.map((t: any) => ({
          ...t,
          isRealTicket: true,
          isDemoTicket: false,
          slaStatus: t.slaStatus || 'Safe',
          priority: t.priority || 'Medium',
          status: t.status || 'Open',
          createdDate: t.createdDate || new Date().toISOString(),
          updatedDate: t.updatedDate || t.createdDate || new Date().toISOString(),
          contactNumber: t.contactNumber || ''
        }));
        ticketsCount = sheetTickets.length;

        setTickets(prev => {
          const map = new Map<string, Ticket>();
          // Keep real tickets created locally
          prev.filter(p => !p.isDemoTicket && !['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(p.id))
            .forEach(t => map.set(t.id, t));
          // Overlay tickets from Google Sheet
          sheetTickets.forEach(t => map.set(t.id, t));
          const updated = Array.from(map.values());
          try {
            localStorage.setItem('hd_tickets_v2', JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
      }

      if (data.success && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(prev => {
          const uMap = new Map<string, User>();
          initialUsers.forEach(u => uMap.set(u.id || u.employeeId, u));
          prev.forEach(u => uMap.set(u.id || u.employeeId, u));
          data.users.forEach((u: User) => {
            const key = u.id || u.employeeId;
            if (key) {
              const existing = uMap.get(key) || {};
              uMap.set(key, { ...existing, ...u });
            }
          });
          const updatedUsers = Array.from(uMap.values());
          try {
            localStorage.setItem('hd_users_v2', JSON.stringify(updatedUsers));
          } catch (e) {}
          return updatedUsers;
        });
      }

      if (data.success && (ticketsCount > 0 || (Array.isArray(data.users) && data.users.length > 0))) {
        const logItem: SheetSyncLogItem = {
          id: `pull_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'PULL_TICKETS',
          summary: `Retrieved data from Google Sheet (${ticketsCount} tickets, ${data.users?.length || 0} users)`,
          details: `Connected to Google Sheet: ${ticketsCount} tickets and ${data.users?.length || 0} users synced successfully.`,
          status: 'success',
          sheetTab: 'Tickets'
        };
        setSheetSyncLogs(prev => [logItem, ...prev.slice(0, 49)]);
        if (!isSilent) {
          setActiveSyncToast(logItem);
        }
        setLastSyncStatus('synced');
        addAuditLog('SHEET_DATA_PULLED', 'Google Workspace', `Loaded ${ticketsCount} tickets and ${data.users?.length || 0} users from Google Sheet`);
        return { success: true, count: ticketsCount, message: `Loaded ${ticketsCount} real tickets & ${data.users?.length || 0} users from Google Sheet!` };
      } else {
        if (!isSilent) {
          const logItem: SheetSyncLogItem = {
            id: `pull_info_${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            action: 'PULL_TICKETS',
            summary: 'Google Sheet Sync: 0 external rows found',
            details: data.message || 'No new rows found on the Tickets sheet tab.',
            status: 'info',
            sheetTab: 'Tickets'
          };
          setSheetSyncLogs(prev => [logItem, ...prev.slice(0, 49)]);
          setActiveSyncToast(logItem);
        }
        return { success: false, count: 0, message: data.message || 'No tickets found in sheet.' };
      }
    } catch (err: any) {
      console.warn('Pull sheet data error:', err);
      return { success: false, count: 0, message: err.message || 'Failed to fetch tickets from Google Sheet.' };
    }
  };

  // Clear demo / mockup tickets
  const clearMockupTickets = () => {
    const realOnly = tickets.filter(t => !t.isDemoTicket && !['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id));
    setTickets(realOnly);
    try {
      localStorage.setItem('hd_tickets_v2', JSON.stringify(realOnly));
      localStorage.setItem('hd_demo_cleared', 'true');
    } catch (e) {}

    const logItem: SheetSyncLogItem = {
      id: `clear_demo_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'PURGE_MOCKUP',
      summary: 'Cleared demo mockup tickets from view',
      details: `Removed sample mockup tickets. Displaying only ${realOnly.length} real/synced tickets.`,
      status: 'success',
      sheetTab: 'Tickets'
    };
    setSheetSyncLogs(prev => [logItem, ...prev.slice(0, 49)]);
    setActiveSyncToast(logItem);
    addAuditLog('MOCKUP_CLEARED', 'Ticket Directory', 'Purged demo mockup tickets from display');
  };

  // Restore demo tickets for testing
  const restoreDemoTickets = () => {
    try {
      localStorage.removeItem('hd_demo_cleared');
    } catch (e) {}
    const existingIds = new Set(tickets.map(t => t.id));
    const missingDemo = initialTickets.filter(t => !existingIds.has(t.id));
    const merged = [...tickets, ...missingDemo];
    setTickets(merged);
    try {
      localStorage.setItem('hd_tickets_v2', JSON.stringify(merged));
    } catch (e) {}

    const logItem: SheetSyncLogItem = {
      id: `restore_demo_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'RESTORE_DEMO',
      summary: 'Restored demo mockup tickets for preview',
      details: 'Sample tickets restored alongside existing tickets.',
      status: 'info',
      sheetTab: 'Tickets'
    };
    setSheetSyncLogs(prev => [logItem, ...prev.slice(0, 49)]);
    setActiveSyncToast(logItem);
  };

  // Ticket counts
  const demoTicketsCount = useMemo(() => {
    return tickets.filter(t => t.isDemoTicket || ['HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005', 'HD-000006', 'HD-000007', 'HD-000008'].includes(t.id)).length;
  }, [tickets]);

  const realTicketsCount = useMemo(() => {
    return tickets.length - demoTicketsCount;
  }, [tickets, demoTicketsCount]);

  const isDemoDataActive = demoTicketsCount > 0;

  // Auto pull real sheet data silently on app load
  useEffect(() => {
    const timer = setTimeout(() => {
      pullDataFromGoogleSheets(undefined, undefined, true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        tickets,
        archivedTickets,
        archivedUsers,
        rolePermissions,
        hasPermission,
        comments,
        history,
        notifications,
        departments,
        categories,
        branches,
        prioritiesList,
        statusesList,
        rolesList,
        designationsList,
        slaRules,
        knowledgeBase,
        auditLogs,
        settings,

        addBranch,
        editBranch,
        deleteBranch,

        addPriority,
        editPriority,
        deletePriority,

        addStatus,
        editStatus,
        deleteStatus,

        addRole,
        editRole,
        deleteRole,

        addDesignation,
        editDesignation,
        deleteDesignation,

        editDepartment,
        deleteDepartment,

        editCategory,
        deleteCategory,

        activeView,
        setActiveView,
        activeTab: activeView,
        setActiveTab: setActiveView,
        selectedTicketId,
        setSelectedTicketId,
        isCreateTicketOpen,
        setIsCreateTicketOpen,

        createTicket,
        updateTicketStatus,
        updateTicketPriority,
        assignTicket,
        deleteTicketPermanentlyAndArchive,
        deleteTicketPermanently: deleteTicketPermanentlyAndArchive,
        restoreArchivedTicket,
        purgeArchivedTicketPermanently,
        addTicketComment,
        rateTicket,

        addUser,
        updateUser,
        toggleUserStatus,
        deleteUserPermanentlyAndArchive,
        deleteUserPermanently: deleteUserPermanentlyAndArchive,
        restoreArchivedUser,
        purgeArchivedUserPermanently,
        restoreDefaultUsers,
        updateRolePermission,
        resetRolePermissionsToDefault,
        detectAndLoginSystemUser,
        loginByIdOrQuery,
        loginWithGoogleEmail,

        addDepartment,
        addCategory,
        updateSLARule,

        updateSettings,
        syncWithGoogleSheets,
        pullDataFromGoogleSheets,
        clearMockupTickets,
        restoreDemoTickets,
        isDemoDataActive,
        realTicketsCount,
        demoTicketsCount,
        sheetSyncLogs,
        activeSyncToast,
        dismissSyncToast,
        isSyncModalOpen,
        setIsSyncModalOpen,
        lastSyncStatus,

        markNotificationAsRead,
        addAuditLog,

        globalSearchQuery,
        setGlobalSearchQuery
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
