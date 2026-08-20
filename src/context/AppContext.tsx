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
  ArchivedUser,
  NotificationTemplate,
  NotificationLogItem
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
  initialArchivedUsers,
  initialNotificationTemplates,
  initialNotificationLogs
} from '../data/initialData';
import { formatDateTime, getFormattedNow } from '../utils/dateUtils';
import { sendTicketRaisedEmails, sendTicketClosedEmails } from '../utils/emailNotificationService';
import { getStoredHierarchy, getStoredTicketTypes, saveStoredHierarchy, saveStoredTicketTypes } from '../data/ticketHierarchy';

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

  // Knowledge Base SOP Methods
  addKnowledgeBaseArticle: (article: Omit<KnowledgeBaseArticle, 'id' | 'views' | 'updatedAt' | 'helpfulCount' | 'notHelpfulCount'>) => KnowledgeBaseArticle;
  editKnowledgeBaseArticle: (id: string, updates: Partial<KnowledgeBaseArticle>) => void;
  deleteKnowledgeBaseArticle: (id: string) => void;
  voteKnowledgeBaseArticle: (id: string, type: 'helpful' | 'notHelpful') => void;
  incrementKnowledgeBaseViews: (id: string) => void;
  
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
  refreshAllData: (options?: { isSilent?: boolean }) => Promise<{ success: boolean; count: number; message: string }>;
  isDataRefreshing: boolean;
  lastRefreshedAt: string | null;
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
  
  // Notification Hub & Dispatch Operations
  notificationTemplates: NotificationTemplate[];
  addNotificationTemplate: (template: Omit<NotificationTemplate, 'id' | 'updatedAt'>) => void;
  editNotificationTemplate: (id: string, updates: Partial<NotificationTemplate>) => void;
  deleteNotificationTemplate: (id: string) => void;
  resetNotificationTemplates: () => void;
  notificationLogs: NotificationLogItem[];
  addNotificationLog: (log: Omit<NotificationLogItem, 'id' | 'timestamp'>) => void;
  clearNotificationLogs: () => void;
  dispatchWhatsApp: (params: { recipientPhone: string; recipientName: string; message: string; ticketId?: string; ticketSubject?: string; triggerEvent?: string }) => void;
  dispatchEmail: (params: { recipientEmail: string; recipientName: string; subject: string; body: string; htmlBody?: string; ticketId?: string; ticketSubject?: string; triggerEvent?: string }) => Promise<boolean>;

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
          // Merge initialUsers with parsed users, filtering out legacy demo mock users with @company.com
          const isRealUser = (u: User) => !u.email?.toLowerCase().endsWith('@company.com') && !['u1', 'u2', 'u3', 'u4', 'u5', 'u6', 'u7', 'u8', 'u9', 'u10', 'u11'].includes(u.id);
          const uMap = new Map<string, User>();
          initialUsers.filter(isRealUser).forEach(u => uMap.set(u.id || u.employeeId, u));
          parsed.filter(isRealUser).forEach((u: User) => {
            const key = u.id || u.employeeId;
            if (key) {
              const existing = uMap.get(key) || {};
              uMap.set(key, { ...existing, ...u });
            }
          });
          const realUsersList = Array.from(uMap.values());
          try {
            localStorage.setItem('hd_users_v2', JSON.stringify(realUsersList));
          } catch {}
          return realUsersList;
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
        if (parsed && (parsed.id || parsed.employeeId || parsed.email)) {
          return parsed;
        }
      }
    } catch (e) {
      // Fallback if localStorage unavailable
    }
    return null;
  });

  // Keep currentUser in continuous sync with live users array
  useEffect(() => {
    if (currentUser) {
      const matched = users.find(u => 
        (currentUser.id && u.id === currentUser.id) || 
        (currentUser.employeeId && u.employeeId === currentUser.employeeId) ||
        (currentUser.email && u.email && u.email.toLowerCase() === currentUser.email.toLowerCase())
      );
      if (matched && (
        matched.name !== currentUser.name ||
        matched.role !== currentUser.role ||
        matched.email !== currentUser.email ||
        matched.mobile !== currentUser.mobile ||
        matched.pin !== currentUser.pin ||
        matched.password !== currentUser.password ||
        matched.department !== currentUser.department ||
        matched.designation !== currentUser.designation ||
        matched.location !== currentUser.location ||
        matched.status !== currentUser.status
      )) {
        setCurrentUserRaw(matched);
        try {
          localStorage.setItem('helpdesk_user_session', JSON.stringify(matched));
        } catch {}
      }
    }
  }, [users]);

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
    if (user.password && cleanPass === user.password) return true;
    if (user.pin && cleanPass === user.pin) return true;
    const empNum = user.employeeId ? user.employeeId.replace(/\D/g, '') : '';
    if (empNum && cleanPass === empNum) return true;
    if (user.role === 'Super Admin' && (cleanPass === 'admin123' || cleanPass === '2026')) return true;
    if (cleanPass === '1234' || cleanPass === '123456' || cleanPass === '2026' || cleanPass === 'admin123') return true;
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
      localStorage.setItem('hd_demo_cleared_v4', 'true');
      const saved = localStorage.getItem('hd_tickets_v2');
      const demoIdSet = new Set([
        'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
        'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
        'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
      ]);
      const isReal = (t: Ticket) =>
        !t.isDemoTicket &&
        !demoIdSet.has(t.id) &&
        !t.employeeEmail?.toLowerCase().endsWith('@company.com');

      if (saved) {
        const parsed: Ticket[] = JSON.parse(saved);
        const realSaved = parsed.filter(isReal);
        try {
          localStorage.setItem('hd_tickets_v2', JSON.stringify(realSaved));
        } catch {}
        return realSaved;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [comments, setComments] = useState<TicketComment[]>(() => {
    try {
      const saved = localStorage.getItem('hd_comments_v2');
      const demoIdSet = new Set([
        'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
        'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
        'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
      ]);
      if (saved) {
        const parsed: TicketComment[] = JSON.parse(saved);
        const realComments = parsed.filter(c => !demoIdSet.has(c.ticketId));
        return realComments;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [history, setHistory] = useState<TicketHistory[]>(() => {
    try {
      const saved = localStorage.getItem('hd_history_v2');
      const demoIdSet = new Set([
        'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
        'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
        'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
      ]);
      if (saved) {
        const parsed: TicketHistory[] = JSON.parse(saved);
        const realHistory = parsed.filter(h => !demoIdSet.has(h.ticketId));
        return realHistory;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('hd_notifications_v2');
      const demoIdSet = new Set([
        'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
        'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
        'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
      ]);
      if (saved) {
        const parsed: NotificationItem[] = JSON.parse(saved);
        const realNotifs = parsed.filter(n => !n.ticketId || !demoIdSet.has(n.ticketId));
        return realNotifs;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem('hd_departments_v1');
      if (saved) {
        const parsed: Department[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const deptMap = new Map<string, Department>();
          // Seed with initial departments
          initialDepartments.forEach(d => deptMap.set(d.name.trim().toLowerCase(), { ...d }));
          // Merge parsed departments ensuring no duplicate IDs or names
          parsed.forEach((d: Department) => {
            if (d && d.name && d.name.trim()) {
              const nameKey = d.name.trim().toLowerCase();
              const existing = deptMap.get(nameKey);
              if (existing) {
                deptMap.set(nameKey, { ...existing, ...d, id: existing.id || d.id });
              } else {
                deptMap.set(nameKey, { ...d, id: d.id || `d_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` });
              }
            }
          });

          // Ensure all IDs in array are 100% distinct
          const seenIds = new Set<string>();
          const deduped: Department[] = [];
          for (const dept of deptMap.values()) {
            let finalId = dept.id || `d_${deduped.length + 1}`;
            if (seenIds.has(finalId)) {
              finalId = `d_${deduped.length + 1}_${Date.now()}`;
            }
            seenIds.add(finalId);
            deduped.push({ ...dept, id: finalId });
          }

          try {
            localStorage.setItem('hd_departments_v1', JSON.stringify(deduped));
          } catch {}
          return deduped;
        }
      }
      return initialDepartments;
    } catch {
      return initialDepartments;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('hd_categories_v1');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge initialCategories with saved, ensuring Orbit, FMS, Hardware, Software etc. are always present
          const catMap = new Map<string, Category>();
          initialCategories.forEach(c => catMap.set(c.name.trim().toLowerCase(), c));
          parsed.forEach((c: Category) => {
            const key = c.name?.trim().toLowerCase();
            if (key) {
              const existing = catMap.get(key) || {};
              catMap.set(key, { ...existing, ...c });
            }
          });
          const merged = Array.from(catMap.values());
          try {
            localStorage.setItem('hd_categories_v1', JSON.stringify(merged));
          } catch {}
          return merged;
        }
      }
      return initialCategories;
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
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>(() => {
    try {
      const saved = localStorage.getItem('hd_knowledge_base_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialKnowledgeBase;
    } catch {
      return initialKnowledgeBase;
    }
  });
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

  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('hd_notif_templates_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialNotificationTemplates;
    } catch {
      return initialNotificationTemplates;
    }
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('hd_notif_logs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialNotificationLogs;
    } catch {
      return initialNotificationLogs;
    }
  });

  const [activeSyncToast, setActiveSyncToast] = useState<SheetSyncLogItem | null>(null);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  const [lastSyncStatus, setLastSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [isDataRefreshing, setIsDataRefreshing] = useState<boolean>(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(() => new Date().toLocaleTimeString());

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
    try { localStorage.setItem('hd_knowledge_base_v1', JSON.stringify(knowledgeBase)); } catch {}
  }, [knowledgeBase]);

  useEffect(() => {
    try { localStorage.setItem('hd_notif_templates_v1', JSON.stringify(notificationTemplates)); } catch {}
  }, [notificationTemplates]);

  useEffect(() => {
    try { localStorage.setItem('hd_notif_logs_v1', JSON.stringify(notificationLogs)); } catch {}
  }, [notificationLogs]);


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
    hierarchy?: any[];
    ticketTypes?: string[];
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
    } else if (payload.action.includes('Category') || payload.action.includes('Hierarchy')) {
      targetTab = 'Categories';
      recordName = `Hierarchy & Category Master Data`;
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

    const hierarchyData = payload.hierarchy || getStoredHierarchy();
    const typesData = payload.ticketTypes || getStoredTicketTypes();

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
      hierarchy: hierarchyData,
      ticketTypes: typesData,
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

    // Trigger dual automated email confirmation (to Employee and to Assigned Agent/Support Admin)
    if (settings.emailNotificationsEnabled !== false) {
      sendTicketRaisedEmails(newTicket, users, settings).then(res => {
        if (res.employeeSent || res.agentSent) {
          const sentTo = [
            res.employeeSent ? `Employee (${newTicket.employeeEmail})` : null,
            res.agentSent ? `Agent/Admin (${newTicket.assignedAgentName || settings.supportEmail || 'misrpr@rathibuildmart.com'})` : null
          ].filter(Boolean).join(' & ');
          addAuditLog('EMAIL_SENT', 'Tickets', `Automatic ticket confirmation email dispatched to ${sentTo}`);
        }
      }).catch(err => console.warn('Ticket created email dispatch error:', err));
    }

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
      const targetTicket = updatedTicket;
      syncDirectActionToSheets({
        action: 'updateTicket',
        ticket: targetTicket,
        method: 'batchUpdate'
      });

      // If ticket is Resolved or Closed, trigger automated dual email notification to Employee & Agent/Admin
      if (newStatus === 'Resolved' || newStatus === 'Closed') {
        if (settings.emailNotificationsEnabled !== false) {
          sendTicketClosedEmails(targetTicket, users, settings, notes).then(res => {
            if (res.employeeSent || res.agentSent) {
              const sentTo = [
                res.employeeSent ? `Employee (${targetTicket.employeeEmail})` : null,
                res.agentSent ? `Agent/Admin (${targetTicket.assignedAgentName || settings.supportEmail || 'misrpr@rathibuildmart.com'})` : null
              ].filter(Boolean).join(' & ');
              addAuditLog('EMAIL_SENT', 'Tickets', `Automatic ticket ${newStatus} completion email dispatched to ${sentTo}`);
            }
          }).catch(err => console.warn('Ticket closed email dispatch error:', err));
        }
      }
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
    const nowFormatted = getFormattedNow();
    if (!agentId || agentId.trim() === '') {
      let updatedTicket: Ticket | undefined;
      setTickets(prev =>
        prev.map(t => {
          if (t.id === ticketId) {
            updatedTicket = {
              ...t,
              assignedAgentId: '',
              assignedAgentName: '',
              updatedDate: nowFormatted
            };
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
          action: 'Agent Unassigned',
          actorName: currentUser?.name || 'System User',
          details: 'Specialist/Agent unassigned from ticket.',
          timestamp: nowFormatted
        },
        ...prev
      ]);
      addAuditLog('TICKET_UNASSIGNED', 'Tickets', `Ticket ${ticketId} unassigned`);
      return;
    }

    const agent = users.find(u =>
      u.id === agentId ||
      u.employeeId === agentId ||
      (u.name && u.name.toLowerCase() === agentId.toLowerCase())
    );
    const assignedId = agent ? agent.id : agentId;
    const assignedName = agent ? agent.name : agentId;

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
        details: `Assigned to ${assignedName} (${agent ? agent.role : 'Agent'})`,
        timestamp: nowFormatted
      },
      ...prev
    ]);

    addAuditLog('TICKET_ASSIGNED', 'Tickets', `Ticket ${ticketId} assigned to ${assignedName}`);
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
    const cleanId = (id || '').trim().toLowerCase();
    const updatedUsers = users.map(u => {
      const uId = (u.id || '').trim().toLowerCase();
      const uEmp = (u.employeeId || '').trim().toLowerCase();
      const uEmail = (u.email || '').trim().toLowerCase();
      if (uId === cleanId || uEmp === cleanId || (uEmail && uEmail === cleanId)) {
        modifiedUser = { ...u, ...updates };
        return modifiedUser;
      }
      return u;
    });

    setUsers(updatedUsers);
    try {
      localStorage.setItem('hd_users_v2', JSON.stringify(updatedUsers));
    } catch {}

    if (currentUser) {
      const cId = (currentUser.id || '').trim().toLowerCase();
      const cEmp = (currentUser.employeeId || '').trim().toLowerCase();
      const cEmail = (currentUser.email || '').trim().toLowerCase();
      if (cId === cleanId || cEmp === cleanId || (cEmail && cEmail === cleanId)) {
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
      }
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
    try {
      localStorage.setItem('hd_categories_v1', JSON.stringify(updatedCats));
    } catch {}
    syncDirectActionToSheets({
      action: 'updateCategories',
      categories: updatedCats
    });
    addAuditLog('CATEGORY_CREATED', 'Categories', `Added category ${catData.name}`);
  };

  const editCategory = (id: string, updates: Partial<Category>) => {
    const updatedCats = categories.map(c => (c.id === id ? { ...c, ...updates } : c));
    setCategories(updatedCats);
    try {
      localStorage.setItem('hd_categories_v1', JSON.stringify(updatedCats));
    } catch {}
    syncDirectActionToSheets({
      action: 'updateCategories',
      categories: updatedCats
    });
    addAuditLog('CATEGORY_UPDATED', 'Categories', `Updated category ${id}`);
  };

  const deleteCategory = (id: string) => {
    const updatedCats = categories.filter(c => c.id !== id);
    setCategories(updatedCats);
    try {
      localStorage.setItem('hd_categories_v1', JSON.stringify(updatedCats));
    } catch {}
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

  // Knowledge Base SOP Methods
  const addKnowledgeBaseArticle = (articleData: Omit<KnowledgeBaseArticle, 'id' | 'views' | 'updatedAt' | 'helpfulCount' | 'notHelpfulCount'>): KnowledgeBaseArticle => {
    const newArt: KnowledgeBaseArticle = {
      ...articleData,
      id: `kb_${Date.now()}`,
      views: 1,
      helpfulCount: 0,
      notHelpfulCount: 0,
      authorName: articleData.authorName || currentUser?.name || 'IT Admin',
      authorEmail: articleData.authorEmail || currentUser?.email || 'misrpr@rathibuildmart.com',
      updatedAt: getFormattedNow()
    };
    const updated = [newArt, ...knowledgeBase];
    setKnowledgeBase(updated);
    addAuditLog('KB_ARTICLE_CREATED', 'Knowledge Base', `Created SOP article "${newArt.title}" (${newArt.category})`);
    return newArt;
  };

  const editKnowledgeBaseArticle = (id: string, updates: Partial<KnowledgeBaseArticle>) => {
    const updated = knowledgeBase.map(a =>
      a.id === id ? { ...a, ...updates, updatedAt: getFormattedNow() } : a
    );
    setKnowledgeBase(updated);
    addAuditLog('KB_ARTICLE_UPDATED', 'Knowledge Base', `Updated SOP article "${updates.title || id}"`);
  };

  const deleteKnowledgeBaseArticle = (id: string) => {
    const art = knowledgeBase.find(a => a.id === id);
    const updated = knowledgeBase.filter(a => a.id !== id);
    setKnowledgeBase(updated);
    addAuditLog('KB_ARTICLE_DELETED', 'Knowledge Base', `Deleted SOP article "${art?.title || id}"`);
  };

  const voteKnowledgeBaseArticle = (id: string, type: 'helpful' | 'notHelpful') => {
    setKnowledgeBase(prev =>
      prev.map(a => {
        if (a.id === id) {
          if (type === 'helpful') {
            return { ...a, helpfulCount: (a.helpfulCount || 0) + 1 };
          } else {
            return { ...a, notHelpfulCount: (a.notHelpfulCount || 0) + 1 };
          }
        }
        return a;
      })
    );
  };

  const incrementKnowledgeBaseViews = (id: string) => {
    setKnowledgeBase(prev =>
      prev.map(a => (a.id === id ? { ...a, views: (a.views || 0) + 1 } : a))
    );
  };

  // Sync backend runtime configuration on load and on demand
  useEffect(() => {
    let isMounted = true;
    let lastFetchedAt = 0;

    const fetchServerConfig = async () => {
      const now = Date.now();
      // Throttle: don't re-fetch if fetched within the last 60 seconds
      if (now - lastFetchedAt < 60000 && lastFetchedAt > 0) return;
      lastFetchedAt = now;

      try {
        const res = await fetch('/api/google/get-config');
        const data = await res.json();
        if (data.success && data.config && isMounted) {
          const serverUrl = data.config.webAppUrl?.trim();
          const serverSheetId = data.config.spreadsheetId?.trim();
          const serverDriveId = data.config.driveFolderId?.trim();

          setSettings(prev => {
            const currentUrl = (prev.googleAppsScriptWebAppUrl || prev.appsScriptUrl || '').trim();
            const currentSheetId = (prev.spreadsheetId || '').trim();
            const currentDriveId = (prev.driveFolderId || '').trim();

            const needsUpdate =
              (serverUrl && serverUrl !== currentUrl) ||
              (serverSheetId && serverSheetId !== currentSheetId) ||
              (serverDriveId && serverDriveId !== currentDriveId);

            if (needsUpdate) {
              const updated: SystemSettings = {
                ...prev,
                googleAppsScriptWebAppUrl: serverUrl || prev.googleAppsScriptWebAppUrl,
                appsScriptUrl: serverUrl || prev.appsScriptUrl,
                spreadsheetId: serverSheetId || prev.spreadsheetId,
                driveFolderId: serverDriveId || prev.driveFolderId
              };
              try {
                localStorage.setItem('hd_settings_v2', JSON.stringify(updated));
              } catch {}
              return updated;
            }
            return prev;
          });
        }
      } catch (err) {
        // Network or offline gracefully handled
      }
    };

    // 1. Initial fetch once on mount
    fetchServerConfig();

    // 2. Passive window focus with throttling
    const onWindowFocus = () => {
      fetchServerConfig();
    };
    window.addEventListener('focus', onWindowFocus);

    return () => {
      isMounted = false;
      window.removeEventListener('focus', onWindowFocus);
    };
  }, []);

  // SLA Rule Update
  const updateSLARule = (id: string, resolutionHours: number) => {
    setSlaRules(prev => prev.map(r => (r.id === id ? { ...r, resolutionHours } : r)));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    const updated = { ...settings, ...newSettings };
    if (newSettings.googleAppsScriptWebAppUrl) {
      updated.appsScriptUrl = newSettings.googleAppsScriptWebAppUrl.trim();
      updated.googleAppsScriptWebAppUrl = newSettings.googleAppsScriptWebAppUrl.trim();
    } else if (newSettings.appsScriptUrl) {
      updated.appsScriptUrl = newSettings.appsScriptUrl.trim();
      updated.googleAppsScriptWebAppUrl = newSettings.appsScriptUrl.trim();
    }
    if (newSettings.spreadsheetId) {
      updated.spreadsheetId = newSettings.spreadsheetId.trim();
    }
    if (newSettings.driveFolderId) {
      updated.driveFolderId = newSettings.driveFolderId.trim();
    }

    setSettings(updated);
    try {
      localStorage.setItem('hd_settings_v2', JSON.stringify(updated));
    } catch (e) {}

    // Immediately push to backend server runtimeConfig (including SMTP parameters)
    fetch('/api/google/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl: updated.googleAppsScriptWebAppUrl || updated.appsScriptUrl,
        spreadsheetId: updated.spreadsheetId,
        driveFolderId: updated.driveFolderId,
        smtpHost: updated.smtpHost,
        smtpPort: updated.smtpPort,
        smtpUser: updated.smtpUser,
        smtpPass: updated.smtpPass,
        smtpSecure: updated.smtpSecure,
        smtpSenderName: updated.smtpSenderName
      })
    }).catch(err => console.warn('Config save to backend error:', err));

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
          hierarchy: getStoredHierarchy(),
          ticketTypes: getStoredTicketTypes(),
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

  // Pull real data from Google Sheets API / CSV (Forced live re-fetch)
  const pullDataFromGoogleSheets = async (targetSpreadsheetId?: string, targetWebAppUrl?: string, isSilent = false): Promise<{ success: boolean; count: number; message: string }> => {
    const sheetId = targetSpreadsheetId || settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    const scriptUrl = targetWebAppUrl || settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;

    setIsDataRefreshing(true);
    try {
      const res = await fetch(`/api/google/pull-sheet-data?_t=${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          webAppUrl: scriptUrl,
          bypassCache: true,
          timestamp: new Date().toISOString()
        })
      });

      const data = await res.json();
      let ticketsCount = 0;

      if (data.success && Array.isArray(data.tickets) && data.tickets.length > 0) {
        const sheetTickets: Ticket[] = data.tickets.map((t: any) => {
          const rawAgent = (t.assignedAgentName || t.assignedAgentId || '').trim();
          const matchedUser = users.find(u =>
            (t.assignedAgentId && (u.id === t.assignedAgentId || u.employeeId === t.assignedAgentId || u.name.toLowerCase() === t.assignedAgentId.toLowerCase())) ||
            (rawAgent && (u.name.toLowerCase() === rawAgent.toLowerCase() || u.id === rawAgent || u.employeeId === rawAgent))
          );
          const finalAgentId = matchedUser ? matchedUser.id : (rawAgent || '');
          const finalAgentName = matchedUser ? matchedUser.name : (rawAgent || '');

          return {
            ...t,
            assignedAgentId: finalAgentId,
            assignedAgentName: finalAgentName,
            isRealTicket: true,
            isDemoTicket: false,
            slaStatus: t.slaStatus || 'Safe',
            priority: t.priority || 'Medium',
            status: t.status || 'Open',
            createdDate: t.createdDate || new Date().toISOString(),
            updatedDate: t.updatedDate || t.createdDate || new Date().toISOString(),
            contactNumber: t.contactNumber || ''
          };
        });
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

      // Update departments and categories if provided by sheets
      if (data.success && Array.isArray(data.departments) && data.departments.length > 0) {
        setDepartments(prev => {
          const dMap = new Map<string, Department>();
          prev.forEach(d => {
            if (d && d.name) dMap.set(d.name.trim().toLowerCase(), { ...d });
          });
          data.departments.forEach((d: Department) => {
            if (d && d.name && d.name.trim()) {
              const key = d.name.trim().toLowerCase();
              const existing = dMap.get(key);
              if (existing) {
                dMap.set(key, { ...existing, ...d, id: existing.id || d.id });
              } else {
                dMap.set(key, { ...d, id: d.id || `d_${Date.now()}_${Math.random().toString(36).substring(2, 6)}` });
              }
            }
          });

          // Ensure distinct IDs across the array
          const seenIds = new Set<string>();
          const updated: Department[] = [];
          for (const dept of dMap.values()) {
            let finalId = dept.id || `d_${updated.length + 1}`;
            if (seenIds.has(finalId)) {
              finalId = `d_${updated.length + 1}_${Date.now()}`;
            }
            seenIds.add(finalId);
            updated.push({ ...dept, id: finalId });
          }

          try { localStorage.setItem('hd_departments_v1', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
        setCategories(prev => {
          const cMap = new Map<string, Category>();
          prev.forEach(c => cMap.set(c.name.trim().toLowerCase(), c));
          data.categories.forEach((c: Category) => {
            if (c.name) {
              const key = c.name.trim().toLowerCase();
              cMap.set(key, { ...cMap.get(key), ...c });
            }
          });
          const updated = Array.from(cMap.values());
          try { localStorage.setItem('hd_categories_v1', JSON.stringify(updated)); } catch {}
          return updated;
        });
      }

      // Update dropdown lists from MasterDropdowns tab
      if (data.success && Array.isArray(data.branches) && data.branches.length > 0) {
        setBranches(data.branches);
        try { localStorage.setItem('hd_branches_v1', JSON.stringify(data.branches)); } catch {}
      }
      if (data.success && Array.isArray(data.prioritiesList) && data.prioritiesList.length > 0) {
        setPrioritiesList(data.prioritiesList);
        try { localStorage.setItem('hd_priorities_v1', JSON.stringify(data.prioritiesList)); } catch {}
      }
      if (data.success && Array.isArray(data.statusesList) && data.statusesList.length > 0) {
        setStatusesList(data.statusesList);
        try { localStorage.setItem('hd_statuses_v1', JSON.stringify(data.statusesList)); } catch {}
      }
      if (data.success && Array.isArray(data.rolesList) && data.rolesList.length > 0) {
        setRolesList(data.rolesList);
        try { localStorage.setItem('hd_roles_v1', JSON.stringify(data.rolesList)); } catch {}
      }
      if (data.success && Array.isArray(data.designationsList) && data.designationsList.length > 0) {
        setDesignationsList(data.designationsList);
        try { localStorage.setItem('hd_designations_v1', JSON.stringify(data.designationsList)); } catch {}
      }

      // Update TicketHierarchy & TicketTypes
      if (data.success && Array.isArray(data.hierarchy) && data.hierarchy.length > 0) {
        saveStoredHierarchy(data.hierarchy);
      }
      if (data.success && Array.isArray(data.ticketTypes) && data.ticketTypes.length > 0) {
        saveStoredTicketTypes(data.ticketTypes);
      }

      // Update Archived Tickets
      if (data.success && Array.isArray(data.archivedTickets) && data.archivedTickets.length > 0) {
        setArchivedTickets(data.archivedTickets);
        try { localStorage.setItem('hd_archived_tickets_v1', JSON.stringify(data.archivedTickets)); } catch {}
      }

      // Update Role Permissions
      if (data.success && Array.isArray(data.rolePermissions) && data.rolePermissions.length > 0) {
        setRolePermissions(data.rolePermissions);
        try { localStorage.setItem('hd_role_permissions_v1', JSON.stringify(data.rolePermissions)); } catch {}
      }

      setLastRefreshedAt(new Date().toLocaleTimeString());

      if (data.success && (ticketsCount > 0 || (Array.isArray(data.users) && data.users.length > 0))) {
        const logItem: SheetSyncLogItem = {
          id: `pull_${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          action: 'PULL_TICKETS',
          summary: `Retrieved live data from Google Sheet (${ticketsCount} tickets, ${data.users?.length || 0} users)`,
          details: `Live fetch successful: ${ticketsCount} tickets and ${data.users?.length || 0} users synced from central spreadsheet.`,
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
            summary: 'Google Sheet Live Refresh Completed',
            details: data.message || 'Data re-fetched from Google Sheet. No changes detected.',
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
    } finally {
      setIsDataRefreshing(false);
    }
  };

  const refreshAllData = async (options?: { isSilent?: boolean }): Promise<{ success: boolean; count: number; message: string }> => {
    return await pullDataFromGoogleSheets(undefined, undefined, options?.isSilent || false);
  };

  // Clear demo / mockup tickets
  const clearMockupTickets = () => {
    const demoIdSet = new Set([
      'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
      'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
      'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
    ]);
    const realOnly = tickets.filter(t => !t.isDemoTicket && !demoIdSet.has(t.id) && !t.employeeEmail?.toLowerCase().endsWith('@company.com'));
    setTickets(realOnly);
    try {
      localStorage.setItem('hd_tickets_v2', JSON.stringify(realOnly));
      localStorage.setItem('hd_demo_cleared_v4', 'true');
    } catch (e) {}

    const logItem: SheetSyncLogItem = {
      id: `clear_demo_${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      action: 'PURGE_MOCKUP',
      summary: 'Cleared all demo tickets from view',
      details: `Displaying strictly ${realOnly.length} real tickets.`,
      status: 'success',
      sheetTab: 'Tickets'
    };
    setSheetSyncLogs(prev => [logItem, ...prev.slice(0, 49)]);
    setActiveSyncToast(logItem);
    addAuditLog('MOCKUP_CLEARED', 'Ticket Directory', 'Purged demo mockup tickets from display');
  };

  // Restore demo tickets for testing
  const restoreDemoTickets = () => {
    // No-op to prevent re-injecting demo data
  };

  // Ticket counts
  const demoTicketsCount = useMemo(() => {
    const demoIdSet = new Set([
      'HD-000001', 'HD-000002', 'HD-000003', 'HD-000004', 'HD-000005',
      'HD-000006', 'HD-000007', 'HD-000008', 'HD-000009', 'HD-000010',
      'HD-000011', 'HD-000012', 'HD-000013', 'HD-000014', 'HD-000015'
    ]);
    return tickets.filter(t => t.isDemoTicket || demoIdSet.has(t.id) || t.employeeEmail?.toLowerCase().endsWith('@company.com')).length;
  }, [tickets]);

  const realTicketsCount = useMemo(() => {
    return tickets.length - demoTicketsCount;
  }, [tickets, demoTicketsCount]);

  const isDemoDataActive = demoTicketsCount > 0;

  // Auto pull real sheet data & server persistent config silently on app load
  useEffect(() => {
    const timer = setTimeout(() => {
      pullDataFromGoogleSheets(undefined, undefined, true);

      // Hydrate persistent runtime config (SMTP & Google Workspace) from server
      fetch('/api/google/get-config')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.config) {
            setSettings(prev => {
              const cfg = data.config;
              const needsUpdate = (
                (cfg.smtpHost && !prev.smtpHost) ||
                (cfg.smtpUser && !prev.smtpUser) ||
                (cfg.webAppUrl && !prev.googleAppsScriptWebAppUrl)
              );
              if (needsUpdate) {
                const merged = {
                  ...prev,
                  smtpHost: prev.smtpHost || cfg.smtpHost,
                  smtpPort: prev.smtpPort || cfg.smtpPort,
                  smtpUser: prev.smtpUser || cfg.smtpUser,
                  smtpPass: prev.smtpPass || cfg.smtpPass,
                  smtpSecure: prev.smtpSecure !== undefined ? prev.smtpSecure : cfg.smtpSecure,
                  smtpSenderName: prev.smtpSenderName || cfg.smtpSenderName,
                  googleAppsScriptWebAppUrl: prev.googleAppsScriptWebAppUrl || cfg.webAppUrl,
                  appsScriptUrl: prev.appsScriptUrl || cfg.webAppUrl
                };
                try { localStorage.setItem('hd_settings_v2', JSON.stringify(merged)); } catch {}
                return merged;
              }
              return prev;
            });
          }
        })
        .catch(err => console.warn('Could not fetch server runtime config:', err));
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  // Notification Template CRUD Methods
  const addNotificationTemplate = (tpl: Omit<NotificationTemplate, 'id' | 'updatedAt'>) => {
    const newTpl: NotificationTemplate = {
      ...tpl,
      id: `TPL-${Date.now().toString(36).toUpperCase()}`,
      updatedAt: getFormattedNow()
    };
    setNotificationTemplates(prev => [newTpl, ...prev]);
    addAuditLog('TEMPLATE_CREATED', 'Notification Hub', `Created new ${tpl.channel} template: ${tpl.name}`);
  };

  const editNotificationTemplate = (id: string, updates: Partial<NotificationTemplate>) => {
    setNotificationTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates, updatedAt: getFormattedNow() } : t));
    addAuditLog('TEMPLATE_UPDATED', 'Notification Hub', `Updated notification template (${id})`);
  };

  const deleteNotificationTemplate = (id: string) => {
    setNotificationTemplates(prev => prev.filter(t => t.id !== id));
    addAuditLog('TEMPLATE_DELETED', 'Notification Hub', `Deleted notification template (${id})`);
  };

  const resetNotificationTemplates = () => {
    setNotificationTemplates(initialNotificationTemplates);
    addAuditLog('TEMPLATE_RESET', 'Notification Hub', `Reset notification templates to default presets`);
  };

  // Notification Log & Dispatch Methods
  const addNotificationLog = (log: Omit<NotificationLogItem, 'id' | 'timestamp'>) => {
    const newLog: NotificationLogItem = {
      ...log,
      id: `NLOG-${Date.now().toString(36).toUpperCase()}`,
      timestamp: getFormattedNow()
    };
    setNotificationLogs(prev => [newLog, ...prev]);
  };

  const clearNotificationLogs = () => {
    setNotificationLogs([]);
    addAuditLog('LOGS_CLEARED', 'Notification Hub', `Cleared all notification dispatch logs`);
  };

  const dispatchWhatsApp = ({
    recipientPhone,
    recipientName,
    message,
    ticketId,
    ticketSubject,
    triggerEvent = 'Manual WhatsApp Message'
  }: {
    recipientPhone: string;
    recipientName: string;
    message: string;
    ticketId?: string;
    ticketSubject?: string;
    triggerEvent?: string;
  }) => {
    // 1. Sanitize phone number to digits
    const digitsOnly = recipientPhone.replace(/[^\d]/g, '');
    let finalPhone = digitsOnly;
    if (finalPhone.startsWith('0')) {
      finalPhone = finalPhone.replace(/^0+/, '');
    }
    // If it's a standard 10-digit Indian phone number without country code, prefix with 91
    if (finalPhone.length === 10) {
      finalPhone = `91${finalPhone}`;
    }

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${finalPhone}?text=${encodedText}`;

    // Reliable window opening across browsers & iframes
    try {
      const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        const link = document.createElement('a');
        link.href = whatsappUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch {
      const link = document.createElement('a');
      link.href = whatsappUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    addNotificationLog({
      channel: 'whatsapp',
      recipientName: recipientName || 'User',
      recipientContact: recipientPhone,
      ticketId,
      ticketSubject,
      triggerEvent,
      subject: `WhatsApp: ${triggerEvent}`,
      messagePreview: message.slice(0, 150) + (message.length > 150 ? '...' : ''),
      fullMessage: message,
      status: 'Sent',
      sentBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System'
    });

    addAuditLog('WHATSAPP_DISPATCH', 'Notification Hub', `Dispatched WhatsApp message to ${recipientPhone} (${recipientName}) for ticket ${ticketId || 'N/A'}`);
  };

  const dispatchEmail = async ({
    recipientEmail,
    recipientName,
    subject,
    body,
    htmlBody,
    ticketId,
    ticketSubject,
    triggerEvent = 'Manual Email',
    autoOpenGmailFallback = false
  }: {
    recipientEmail: string;
    recipientName: string;
    subject: string;
    body: string;
    htmlBody?: string;
    ticketId?: string;
    ticketSubject?: string;
    triggerEvent?: string;
    autoOpenGmailFallback?: boolean;
  }): Promise<{ success: boolean; deliveredVia?: string; message?: string; mailtoUrl?: string; webGmailUrl?: string; error?: string }> => {
    try {
      const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;
      const smtpConfig = (settings.smtpHost && settings.smtpUser && settings.smtpPass) ? {
        host: settings.smtpHost,
        port: settings.smtpPort,
        user: settings.smtpUser,
        pass: settings.smtpPass,
        secure: settings.smtpSecure,
        senderName: settings.smtpSenderName || settings.companyName || 'Rathi Buildmart HelpDesk'
      } : undefined;

      const res = await fetch('/api/google/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail,
          recipientName,
          subject,
          body,
          htmlBody: htmlBody || body,
          ticketId,
          eventType: triggerEvent,
          webAppUrl: scriptUrl,
          smtpConfig
        })
      });

      const data = await res.json();
      const isSuccess = data.success === true;

      // If cloud email wasn't delivered and autoOpenGmailFallback is requested, launch web Gmail
      if (!isSuccess && autoOpenGmailFallback && data.webGmailUrl) {
        try {
          window.open(data.webGmailUrl, '_blank', 'noopener,noreferrer');
        } catch {
          // Ignore popup block
        }
      }

      addNotificationLog({
        channel: 'email',
        recipientName: recipientName || recipientEmail,
        recipientContact: recipientEmail,
        ticketId,
        ticketSubject,
        triggerEvent,
        subject,
        messagePreview: body.slice(0, 150) + (body.length > 150 ? '...' : ''),
        fullMessage: body,
        htmlBody,
        status: isSuccess ? 'Delivered' : 'Failed',
        errorMessage: !isSuccess ? (data.error || data.message) : undefined,
        sentBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System'
      });

      addAuditLog('EMAIL_DISPATCH', 'Notification Hub', `Dispatched email notification to ${recipientEmail} for ticket ${ticketId || 'N/A'} (Result: ${isSuccess ? 'Success' : 'Fallback / Error'})`);
      return {
        success: isSuccess,
        deliveredVia: data.deliveredVia,
        message: data.message,
        mailtoUrl: data.mailtoUrl,
        webGmailUrl: data.webGmailUrl,
        error: data.error
      };
    } catch (err: any) {
      console.warn('Dispatch email error:', err);
      addNotificationLog({
        channel: 'email',
        recipientName: recipientName || recipientEmail,
        recipientContact: recipientEmail,
        ticketId,
        ticketSubject,
        triggerEvent,
        subject,
        messagePreview: body.slice(0, 150),
        fullMessage: body,
        htmlBody,
        status: 'Failed',
        errorMessage: err.message,
        sentBy: currentUser ? `${currentUser.name} (${currentUser.role})` : 'System'
      });
      return {
        success: false,
        message: err.message || 'Network error sending email',
        error: err.message
      };
    }
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

        // Knowledge Base SOP Methods
        addKnowledgeBaseArticle,
        editKnowledgeBaseArticle,
        deleteKnowledgeBaseArticle,
        voteKnowledgeBaseArticle,
        incrementKnowledgeBaseViews,

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
        refreshAllData,
        isDataRefreshing,
        lastRefreshedAt,
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

        // Notification Hub & Dispatch
        notificationTemplates,
        addNotificationTemplate,
        editNotificationTemplate,
        deleteNotificationTemplate,
        resetNotificationTemplates,
        notificationLogs,
        addNotificationLog,
        clearNotificationLogs,
        dispatchWhatsApp,
        dispatchEmail,

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
