export type UserRole = 'Employee' | 'Support Agent' | 'Support Manager' | 'Admin' | 'Super Admin';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type TicketStatus = 'Open' | 'Pending' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';

export type SLAStatus = 'Safe' | 'Due Soon' | 'Breached';

export interface RolePermissionConfig {
  role: UserRole;
  canViewDashboard: boolean;
  canViewTickets: boolean;
  canCreateTickets: boolean;
  canEditTickets: boolean;
  canDeleteTickets: boolean; // Super Admin exclusive by default
  canViewFeedback: boolean;
  canSubmitFeedback: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canDeleteUsersPermanently: boolean; // Super Admin exclusive by default
  canManageDepartments: boolean;
  canManageCategories: boolean;
  canManageSLA: boolean;
  canManageDropdowns: boolean;
  canAccessGoogleDriveSync: boolean;
  canAccessAppsScript: boolean;
  canViewAuditLogs: boolean;
  canManageSystemSettings: boolean;
  canManageRolePermissions: boolean; // Super Admin exclusive
  canAccessArchivedData: boolean; // Access archived tickets & users vault
}

export interface User {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  location: string;
  status: 'Active' | 'Disabled';
  mobile?: string;
  joiningDate?: string;
  avatarUrl?: string;
  pin?: string;
  password?: string;
}

export interface Ticket {
  id: string; // e.g. HD-000001
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  location: string;
  category: string;
  subCategory: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedAgentId?: string;
  assignedAgentName?: string;
  createdDate: string;
  updatedDate: string;
  requiredByDate?: string;
  slaDueDate: string;
  slaStatus: SLAStatus;
  contactNumber: string;
  resolvedDate?: string;
  closedDate?: string;
  resolutionTimeMinutes?: number;
  rating?: number;
  feedback?: string;
  attachments?: TicketAttachment[];
  isDemoTicket?: boolean;
  isRealTicket?: boolean;
}

export interface ArchivedTicket extends Ticket {
  archivedAt: string;
  archivedBy: string;
  archivedByEmail?: string;
  archiveReason?: string;
}

export interface ArchivedUser extends User {
  archivedAt: string;
  archivedBy: string;
  archivedByEmail?: string;
  archiveReason?: string;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileName: string;
  driveFileId: string;
  driveUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedDate: string;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  isInternalNote: boolean;
  createdAt: string;
  attachments?: TicketAttachment[];
}

export interface TicketHistory {
  id: string;
  ticketId: string;
  action: string;
  actorName: string;
  details: string;
  timestamp: string;
}

export interface Department {
  id: string;
  name: string;
  headName: string;
  supportTeam: string;
  defaultAgentId?: string;
}

export interface Category {
  id: string;
  name: string;
  department: string;
  subCategories: string[];
  defaultPriority: TicketPriority;
  defaultSLAHours: number;
  defaultSupportTeam: string;
}

export interface SLARule {
  id: string;
  priority: TicketPriority;
  category?: string;
  department?: string;
  resolutionHours: number;
  responseHours: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  ticketId?: string;
  title: string;
  message: string;
  type: 'created' | 'assigned' | 'status' | 'comment' | 'resolved' | 'sla_breach' | 'system';
  read: boolean;
  createdAt: string;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  content: string;
  driveUrl?: string;
  fileType?: string;
  views: number;
  updatedAt: string;
}

export interface AuditLogItem {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ip?: string;
}

export interface SheetSyncLogItem {
  id: string;
  timestamp: string;
  action: string;
  targetTab?: 'Tickets' | 'Users' | 'Departments' | 'Categories' | 'MasterDropdowns' | 'TicketComments' | 'SystemSettings' | 'All' | string;
  sheetTab?: string;
  recordName?: string;
  summary?: string;
  details?: string;
  status: 'syncing' | 'success' | 'error' | 'info';
  message?: string;
}

export interface SystemSettings {
  systemName?: string;
  companyName: string;
  supportEmail?: string;
  logoUrl: string;
  spreadsheetId: string;
  driveFolderId: string;
  appsScriptUrl: string;
  googleAppsScriptWebAppUrl?: string;
  ticketIdPrefix?: string;
  autoAssignEnabled: boolean;
  autoAssignmentEnabled?: boolean;
  emailNotificationsEnabled: boolean;
  slaEnforcementEnabled: boolean;
  slaBreachAlertsEnabled?: boolean;
  driveFolderStructureCreated: boolean;
  driveFolderUrl?: string;
}
