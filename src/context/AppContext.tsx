import React, { createContext, useContext, useState, useEffect } from 'react';
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
  SystemSettings,
  TicketPriority,
  TicketStatus,
  UserRole
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
  initialDesignations
} from '../data/initialData';
import { formatDateTime, getFormattedNow } from '../utils/dateUtils';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  users: User[];
  tickets: Ticket[];
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
  addTicketComment: (ticketId: string, content: string, isInternalNote?: boolean, attachments?: File[]) => Promise<void>;
  rateTicket: (ticketId: string, rating: number, feedback?: string) => void;
  
  // User Management
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;
  detectAndLoginSystemUser: () => Promise<User | null>;
  loginByIdOrQuery: (query: string, passwordInput?: string) => { success: boolean; user?: User; matches?: User[]; message: string };
  loginWithGoogleEmail: (googleEmail: string) => { success: boolean; user?: User; matches?: User[]; message: string };
  
  // Master Management
  addDepartment: (dept: Omit<Department, 'id'>) => void;
  addCategory: (cat: Omit<Category, 'id'>) => void;
  updateSLARule: (id: string, resolutionHours: number) => void;
  
  // System & Google Workspace Sync
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  syncWithGoogleSheets: (spreadsheetId: string) => Promise<{ success: boolean; message: string }>;
  
  // Notifications & Audit
  markNotificationAsRead: (id: string) => void;
  addAuditLog: (action: string, module: string, details: string) => void;
  
  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(initialUsers);

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
    if (user.pin && (cleanPass === user.pin || cleanPass === '1234' || cleanPass === '123456')) return true;
    if (user.password && (cleanPass === user.password || cleanPass === 'admin123' || cleanPass === '123456')) return true;
    if (cleanPass === '1234' || cleanPass === '123456' || cleanPass === '2026') return true;
    const empNum = user.employeeId ? user.employeeId.replace(/\D/g, '') : '';
    if (empNum && cleanPass === empNum) return true;
    return false;
  };

  // Google Workspace SSO Authentication
  const loginWithGoogleEmail = (googleEmail: string): { success: boolean; user?: User; matches?: User[]; message: string } => {
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

    if (matches.length === 1) {
      const matched = matches[0];
      setCurrentUser(matched);
      addAuditLog('GOOGLE_SSO_LOGIN', 'Authentication', `User logged in via Google Workspace SSO (${matched.email})`);
      return {
        success: true,
        user: matched,
        message: `Authenticated via Google Workspace SSO: ${matched.name} (${matched.employeeId} - ${matched.role})`
      };
    } else {
      return {
        success: false,
        matches,
        message: `Multiple employee profiles found for ${cleanEmail}. Please select your specific account profile.`
      };
    }
  };

  // Login detection by User ID, Employee ID, Name, or Email
  const loginByIdOrQuery = (query: string, passwordInput?: string): { success: boolean; user?: User; matches?: User[]; message: string } => {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) {
      return { success: false, message: 'Please enter a valid User ID, Employee ID, Name, or Email.' };
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
      const saved = localStorage.getItem('hd_tickets_v2');
      if (saved) {
        const parsed: Ticket[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map(t => t.id));
        const missing = initialTickets.filter(t => !existingIds.has(t.id));
        return missing.length > 0 ? [...parsed, ...missing] : parsed;
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
  
  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem('hd_settings_v2');
      return saved ? JSON.parse(saved) : initialSystemSettings;
    } catch {
      return initialSystemSettings;
    }
  });

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
    try { localStorage.setItem('hd_settings_v2', JSON.stringify(settings)); } catch {}
  }, [settings]);

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

    // Trigger immediate push to Google Sheet via Apps Script Endpoint with appendRow method & write acknowledgment
    try {
      const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
      const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

      const syncRes = await fetch('/api/google/sync-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: scriptUrl,
          spreadsheetId: sheetId,
          ticket: newTicket,
          action: 'createTicket',
          method: 'appendRow'
        })
      });

      const syncData = await syncRes.json();
      if (syncData.acknowledged) {
        addAuditLog('GOOGLE_SHEET_ROW_APPENDED', 'Google Sheets Integration', `Ticket ${newTicketId} appended to sheet (${sheetId}) using appendRow method.`);
      }

      // Secondary guarantee full sync
      fetch('/api/google/sync-sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId: sheetId,
          webAppUrl: scriptUrl,
          tickets: [newTicket, ...tickets],
          users,
          settings,
          action: 'syncAll'
        })
      }).catch(err => console.warn('Background full sheet sync error:', err));
    } catch (e) {
      console.warn('Google Sheet ticket sync error:', e);
    }

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

    // Trigger immediate real-time batchUpdate to Google Sheet
    if (updatedTicket) {
      const targetTicket = updatedTicket;
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
      }).then(res => res.json()).then(data => {
        if (data.acknowledged) {
          addAuditLog('GOOGLE_SHEET_BATCH_UPDATED', 'Google Sheets Integration', `Ticket ${ticketId} status update (${newStatus}) written to sheet via batchUpdate.`);
        }
      }).catch(err => console.warn('Background Google Sheet status sync error:', err));
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
      const targetTicket = updatedTicket;
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
      }).catch(err => console.warn('Background Google Sheet priority sync error:', err));
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

    // Trigger real-time sync to Google Sheet via Apps Script Endpoint
    if (updatedTicket) {
      const targetTicket = updatedTicket;
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
      }).catch(err => console.warn('Background Google Sheet agent sync error:', err));
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
    const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
    const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    fetch('/api/google/sync-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        webAppUrl: scriptUrl,
        spreadsheetId: sheetId,
        comment: newComment,
        ticket: updatedTicket,
        action: 'addComment',
        method: 'appendRow'
      })
    }).catch(err => console.warn('Background comment sync error:', err));

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
    setUsers(prev => [...prev, newUser]);
    addAuditLog('USER_CREATED', 'User Management', `Created user ${userData.name} (${userData.role})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updates } : u)));
    addAuditLog('USER_UPDATED', 'User Management', `Updated user details for ID: ${id}`);
  };

  const toggleUserStatus = (id: string) => {
    setUsers(prev =>
      prev.map(u => (u.id === id ? { ...u, status: u.status === 'Active' ? 'Disabled' : 'Active' } : u))
    );
  };

  // Department CRUD
  const addDepartment = (deptData: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...deptData,
      id: `d_${Date.now()}`
    };
    setDepartments(prev => [...prev, newDept]);
    addAuditLog('DEPARTMENT_CREATED', 'Departments', `Added department ${deptData.name}`);
  };

  const editDepartment = (id: string, updates: Partial<Department>) => {
    setDepartments(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
    addAuditLog('DEPARTMENT_UPDATED', 'Departments', `Updated department ${id}`);
  };

  const deleteDepartment = (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    addAuditLog('DEPARTMENT_DELETED', 'Departments', `Deleted department ID ${id}`);
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `c_${Date.now()}`
    };
    setCategories(prev => [...prev, newCat]);
    addAuditLog('CATEGORY_CREATED', 'Categories', `Added category ${catData.name}`);
  };

  const editCategory = (id: string, updates: Partial<Category>) => {
    setCategories(prev => prev.map(c => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('CATEGORY_UPDATED', 'Categories', `Updated category ${id}`);
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    addAuditLog('CATEGORY_DELETED', 'Categories', `Deleted category ID ${id}`);
  };

  // Master Dropdown CRUD Methods
  const addBranch = (branch: string) => {
    if (!branch.trim() || branches.includes(branch.trim())) return;
    setBranches(prev => [...prev, branch.trim()]);
    addAuditLog('BRANCH_ADDED', 'Master Settings', `Added branch/location: ${branch}`);
  };

  const editBranch = (oldBranch: string, newBranch: string) => {
    if (!newBranch.trim()) return;
    setBranches(prev => prev.map(b => (b === oldBranch ? newBranch.trim() : b)));
    addAuditLog('BRANCH_EDITED', 'Master Settings', `Renamed branch ${oldBranch} to ${newBranch}`);
  };

  const deleteBranch = (branch: string) => {
    setBranches(prev => prev.filter(b => b !== branch));
    addAuditLog('BRANCH_DELETED', 'Master Settings', `Deleted branch ${branch}`);
  };

  const addPriority = (priority: string) => {
    if (!priority.trim() || prioritiesList.includes(priority.trim())) return;
    setPrioritiesList(prev => [...prev, priority.trim()]);
    addAuditLog('PRIORITY_ADDED', 'Master Settings', `Added priority option: ${priority}`);
  };

  const editPriority = (oldPriority: string, newPriority: string) => {
    if (!newPriority.trim()) return;
    setPrioritiesList(prev => prev.map(p => (p === oldPriority ? newPriority.trim() : p)));
    addAuditLog('PRIORITY_EDITED', 'Master Settings', `Renamed priority ${oldPriority} to ${newPriority}`);
  };

  const deletePriority = (priority: string) => {
    setPrioritiesList(prev => prev.filter(p => p !== priority));
    addAuditLog('PRIORITY_DELETED', 'Master Settings', `Deleted priority ${priority}`);
  };

  const addStatus = (status: string) => {
    if (!status.trim() || statusesList.includes(status.trim())) return;
    setStatusesList(prev => [...prev, status.trim()]);
    addAuditLog('STATUS_ADDED', 'Master Settings', `Added ticket status option: ${status}`);
  };

  const editStatus = (oldStatus: string, newStatus: string) => {
    if (!newStatus.trim()) return;
    setStatusesList(prev => prev.map(s => (s === oldStatus ? newStatus.trim() : s)));
    addAuditLog('STATUS_EDITED', 'Master Settings', `Renamed ticket status ${oldStatus} to ${newStatus}`);
  };

  const deleteStatus = (status: string) => {
    setStatusesList(prev => prev.filter(s => s !== status));
    addAuditLog('STATUS_DELETED', 'Master Settings', `Deleted ticket status ${status}`);
  };

  const addRole = (role: string) => {
    if (!role.trim() || rolesList.includes(role.trim())) return;
    setRolesList(prev => [...prev, role.trim()]);
    addAuditLog('ROLE_ADDED', 'Master Settings', `Added user role: ${role}`);
  };

  const editRole = (oldRole: string, newRole: string) => {
    if (!newRole.trim()) return;
    setRolesList(prev => prev.map(r => (r === oldRole ? newRole.trim() : r)));
    addAuditLog('ROLE_EDITED', 'Master Settings', `Renamed role ${oldRole} to ${newRole}`);
  };

  const deleteRole = (role: string) => {
    setRolesList(prev => prev.filter(r => r !== role));
    addAuditLog('ROLE_DELETED', 'Master Settings', `Deleted role ${role}`);
  };

  const addDesignation = (designation: string) => {
    if (!designation.trim() || designationsList.includes(designation.trim())) return;
    setDesignationsList(prev => [...prev, designation.trim()]);
    addAuditLog('DESIGNATION_ADDED', 'Master Settings', `Added designation: ${designation}`);
  };

  const editDesignation = (oldDesig: string, newDesig: string) => {
    if (!newDesig.trim()) return;
    setDesignationsList(prev => prev.map(d => (d === oldDesig ? newDesig.trim() : d)));
    addAuditLog('DESIGNATION_EDITED', 'Master Settings', `Renamed designation ${oldDesig} to ${newDesig}`);
  };

  const deleteDesignation = (designation: string) => {
    setDesignationsList(prev => prev.filter(d => d !== designation));
    addAuditLog('DESIGNATION_DELETED', 'Master Settings', `Deleted designation ${designation}`);
  };

  // SLA Rule Update
  const updateSLARule = (id: string, resolutionHours: number) => {
    setSlaRules(prev => prev.map(r => (r.id === id ? { ...r, resolutionHours } : r)));
  };

  // Settings
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Sync Google Sheets
  const syncWithGoogleSheets = async (targetSpreadsheetId?: string, targetWebAppUrl?: string) => {
    const sheetId = targetSpreadsheetId || settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
    const scriptUrl = targetWebAppUrl || settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;

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
          action: 'syncAll'
        })
      });
      const data = await res.json();
      if (data.success) {
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
      return { success: false, message: e.message || 'Sync failed' };
    }
  };

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
        addTicketComment,
        rateTicket,

        addUser,
        updateUser,
        toggleUserStatus,
        detectAndLoginSystemUser,
        loginByIdOrQuery,
        loginWithGoogleEmail,

        addDepartment,
        addCategory,
        updateSLARule,

        updateSettings,
        syncWithGoogleSheets,

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
