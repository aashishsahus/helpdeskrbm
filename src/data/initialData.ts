import {
  User,
  Ticket,
  Department,
  Category,
  SLARule,
  NotificationItem,
  KnowledgeBaseArticle,
  AuditLogItem,
  SystemSettings,
  TicketComment,
  TicketHistory,
  RolePermissionConfig,
  ArchivedTicket,
  ArchivedUser,
  NotificationTemplate,
  NotificationLogItem
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'u0',
    employeeId: 'EMP-2026',
    name: 'Misr Pr',
    email: 'misrpr@rathibuildmart.com',
    role: 'Super Admin',
    department: 'IT Operations',
    designation: 'System Administrator',
    location: 'RPR',
    status: 'Active',
    mobile: '+91 98765 43210',
    joiningDate: '2022-01-01',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    pin: '2026',
    password: 'admin123'
  },
  {
    id: 'u_khemaraj',
    employeeId: 'EMP-1022',
    name: 'Khemaraj Sahu',
    email: 'itops@rathibuildmart.com',
    role: 'Support Agent',
    department: 'IT Operations',
    designation: 'IT Support Executive',
    location: 'RPR',
    status: 'Active',
    mobile: '+91 98765 43211',
    joiningDate: '2023-01-15',
    pin: '1022',
    password: '123456'
  },
  {
    id: 'u_rahul',
    employeeId: 'EMP-1023',
    name: 'Rahul Sahu',
    email: 'crmho@rathibuildmart.com',
    role: 'Employee',
    department: 'IT Operations',
    designation: 'CRM / IT Operations',
    location: 'RPR',
    status: 'Active',
    mobile: '+91 98765 43212',
    joiningDate: '2023-03-01',
    pin: '1023',
    password: '123456'
  },
  {
    id: 'u_ashish',
    employeeId: 'EMP-1010',
    name: 'Aashish',
    email: 'mispr@rathibuildmart.com',
    role: 'Employee',
    department: 'IT Operations',
    designation: 'MIS Executive',
    location: 'RPR',
    status: 'Active',
    pin: '1010',
    password: '123456'
  },
  {
    id: 'u_dhaneshwari',
    employeeId: 'EMP-1011',
    name: 'Dhaneshwari',
    email: 'accountsrpr@rathibuildmart.com',
    role: 'Support Manager',
    department: 'Accounts',
    designation: 'Senior Accountant',
    location: 'RPR',
    status: 'Active',
    pin: '1011',
    password: '123456'
  },
  {
    id: 'u_lekhram',
    employeeId: 'EMP-1012',
    name: 'Lekhram',
    email: 'accountsrpr@rathibuildmart.com',
    role: 'Employee',
    department: 'Accounts',
    designation: 'Accountant',
    location: 'RPR',
    status: 'Active',
    pin: '1012',
    password: '123456'
  },
  {
    id: 'u_sarwaswati',
    employeeId: 'EMP-1013',
    name: 'Sarwaswati',
    email: 'accountsrpr@rathibuildmart.com',
    role: 'Employee',
    department: 'Accounts',
    designation: 'Accounts Executive',
    location: 'RPR',
    status: 'Active',
    pin: '1013',
    password: '123456'
  },
  {
    id: 'u_ghanshyam',
    employeeId: 'EMP-1014',
    name: 'Ghanshyam',
    email: 'accountsrpr@rathibuildmart.com',
    role: 'Employee',
    department: 'Accounts',
    designation: 'Accounts Officer',
    location: 'RPR',
    status: 'Active',
    pin: '1014',
    password: '123456'
  },
  {
    id: 'u_samiksha',
    employeeId: 'EMP-1015',
    name: 'Samiksha',
    email: 'bathsales@rathibuildmart.com',
    role: 'Support Agent',
    department: 'Sales',
    designation: 'Sales Supervisor',
    location: 'RPR',
    status: 'Active',
    pin: '1015',
    password: '123456'
  },
  {
    id: 'u_akisha',
    employeeId: 'EMP-1016',
    name: 'Akisha',
    email: 'bathsales@rathibuildmart.com',
    role: 'Employee',
    department: 'Sales',
    designation: 'Sales Executive',
    location: 'RPR',
    status: 'Active',
    pin: '1016',
    password: '123456'
  },
  {
    id: 'u_khelandas',
    employeeId: 'EMP-1017',
    name: 'Khelan das',
    email: 'bathsales@rathibuildmart.com',
    role: 'Employee',
    department: 'Sales',
    designation: 'Sales Executive',
    location: 'RPR',
    status: 'Active',
    pin: '1017',
    password: '123456'
  },
  {
    id: 'u_bhupendra',
    employeeId: 'EMP-1018',
    name: 'Bhupendra',
    email: 'intpurchase@rathibuildmart.com',
    role: 'Support Agent',
    department: 'Purchase',
    designation: 'Procurement Officer',
    location: 'RPR',
    status: 'Active',
    pin: '1018',
    password: '123456'
  }
];

export const initialDepartments: Department[] = [
  { id: 'd1', name: 'IT Operations', headName: 'Misr Pr', supportTeam: 'IT Desk', defaultAgentId: 'u0' },
  { id: 'd2', name: 'Accounts', headName: 'Dhaneshwari', supportTeam: 'Accounts Desk', defaultAgentId: 'u_dhaneshwari' },
  { id: 'd3', name: 'Sales', headName: 'Samiksha', supportTeam: 'Sales Desk', defaultAgentId: 'u_samiksha' },
  { id: 'd4', name: 'Purchase', headName: 'Bhupendra', supportTeam: 'Procurement Team', defaultAgentId: 'u_bhupendra' },
  { id: 'd5', name: 'Warehouse & Logistics', headName: 'Aashish', supportTeam: 'Operations Desk', defaultAgentId: 'u_ashish' },
  { id: 'd6', name: 'Maintenance & Facilities', headName: 'Misr Pr', supportTeam: 'Facilities Team', defaultAgentId: 'u0' }
];

export const initialCategories: Category[] = [
  { id: 'c_orbit', name: 'Orbit', department: 'IT Operations', subCategories: ['Invoice', 'Order', 'Quotation', 'Lead', 'Customer', 'Vendor', 'Stock', 'Receipt Voucher', 'Payment Voucher', 'Journal Voucher', 'Credit Note', 'Professional', 'Consignment'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'IT Desk' },
  { id: 'c_fms', name: 'FMS', department: 'IT Operations', subCategories: ['Material', 'Entry', 'Item', 'Status', 'FMS'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'IT Desk' },
  { id: 'c1', name: 'Hardware', department: 'IT Operations', subCategories: ['Laptop', 'Desktop', 'Monitor', 'Keyboard/Mouse', 'Printer', 'Docking Station'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'IT Desk' },
  { id: 'c2', name: 'Software', department: 'IT Operations', subCategories: ['Operating System', 'MS Office 365', 'VPN Client', 'Antivirus', 'License Request', 'ERP Access'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'IT Desk' },
  { id: 'c3', name: 'Network & Internet', department: 'IT Operations', subCategories: ['Wi-Fi Connectivity', 'LAN Port', 'VPN Connection', 'Internet Speed', 'Firewall Block'], defaultPriority: 'High', defaultSLAHours: 4, defaultSupportTeam: 'IT Desk' },
  { id: 'c4', name: 'Email & Communication', department: 'IT Operations', subCategories: ['Email Password Reset', 'Distribution List', 'Teams/Zoom Issue', 'Spam/Phishing Report'], defaultPriority: 'High', defaultSLAHours: 2, defaultSupportTeam: 'IT Desk' },
  { id: 'c5', name: 'HR & Payroll', department: 'Accounts', subCategories: ['Attendance Correction', 'Leave Balance', 'Payslip Query', 'Insurance Claim', 'ID Card Request'], defaultPriority: 'Low', defaultSLAHours: 24, defaultSupportTeam: 'Accounts Desk' },
  { id: 'c6', name: 'Accounts & Billing', department: 'Accounts', subCategories: ['Reimbursement Request', 'Vendor Invoice', 'Travel Allowance', 'Tax Form 16'], defaultPriority: 'Medium', defaultSLAHours: 12, defaultSupportTeam: 'Accounts Desk' },
  { id: 'c7', name: 'Procurement', department: 'Purchase', subCategories: ['New Accessory Request', 'Hardware Upgrade', 'Stationery Order'], defaultPriority: 'Low', defaultSLAHours: 48, defaultSupportTeam: 'Procurement Team' },
  { id: 'c8', name: 'Facilities & Maintenance', department: 'Maintenance & Facilities', subCategories: ['Air Conditioning', 'Lighting/Electrical', 'Desk Furniture', 'Access Badge'], defaultPriority: 'Medium', defaultSLAHours: 12, defaultSupportTeam: 'Facilities Team' },
  { id: 'c9', name: 'Warehouse Systems', department: 'IT Operations', subCategories: ['Barcode Scanner', 'Label Printer', 'WMS Software', 'Handheld Terminal'], defaultPriority: 'Critical', defaultSLAHours: 2, defaultSupportTeam: 'IT Desk' },
  { id: 'c10', name: 'Security & Access', department: 'IT Operations', subCategories: ['Role Permissions', 'Folder Access', 'Security Key', 'Audit Request'], defaultPriority: 'High', defaultSLAHours: 4, defaultSupportTeam: 'IT Desk' }
];

export const initialSLARules: SLARule[] = [
  { id: 'sla1', priority: 'Critical', resolutionHours: 2, responseHours: 0.5 },
  { id: 'sla2', priority: 'High', resolutionHours: 4, responseHours: 1 },
  { id: 'sla3', priority: 'Medium', resolutionHours: 8, responseHours: 2 },
  { id: 'sla4', priority: 'Low', resolutionHours: 24, responseHours: 4 }
];

export const initialTickets: Ticket[] = [];

export const initialComments: TicketComment[] = [];

export const initialHistory: TicketHistory[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialKnowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: 'kb1',
    title: 'Orbit ERP Invoice & Quotation SOP',
    category: 'Orbit',
    tags: ['orbit', 'erp', 'invoice', 'quotation', 'billing'],
    summary: 'Standard Operating Procedure for generating, modifying, and approving Orbit ERP invoices.',
    content: `### Orbit ERP Invoice SOP\n\n1. Log in to Orbit ERP with your authorized credentials.\n2. Navigate to **Sales & Distribution -> Invoicing**.\n3. Verify customer GSTIN, dispatch location, and pricing slab.\n4. Add material items and confirm tax breakdown (CGST/SGST/IGST).\n5. Click Save & Submit for invoice verification.\n6. For discrepancies or modifications, submit an IT HelpDesk Ticket under **Category: Orbit -> Sub-Category: Invoice** with screenshot attachment.`,
    views: 120,
    updatedAt: '2026-08-15 10:00:00'
  },
  {
    id: 'kb2',
    title: 'FMS Gate Entry & Inward Material Process',
    category: 'FMS',
    tags: ['fms', 'gate entry', 'inward', 'material', 'logistics'],
    summary: 'Step-by-step workflow for FMS gate inward entry and dispatch verification.',
    content: `### FMS Material Inward Procedure\n\n1. Open the FMS portal at security/gate terminal.\n2. Scan or enter the vehicle registration number and transporter LR.\n3. Match challan quantity with actual weighbridge gross weight.\n4. Complete inward stamp entry and submit for unloader verification.\n5. If quantity mismatch occurs, raise an urgent HelpDesk ticket under **FMS -> Material -> Change QTY**.`,
    views: 85,
    updatedAt: '2026-08-15 11:30:00'
  },
  {
    id: 'kb3',
    title: 'Google Workspace & Official Email Guidelines',
    category: 'Software',
    tags: ['email', 'google workspace', 'gmail', 'security'],
    summary: 'Guidelines for corporate email usage, security policies, and password management.',
    content: `### Google Workspace Guidelines\n\n- All official communication must use @rathibuildmart.com corporate email addresses.\n- Enable 2-Step Verification on your Google Account.\n- Never share your password or PIN with anyone.\n- For password resets, contact the IT HelpDesk Super Admin or use the self-service profile update in HelpDesk Settings.`,
    views: 64,
    updatedAt: '2026-08-15 14:00:00'
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'al1',
    actorName: 'Misr Pr',
    actorEmail: 'misrpr@rathibuildmart.com',
    action: 'SETTINGS_CONFIGURED',
    module: 'System Settings',
    details: 'Google Sheets and Apps Script Live Endpoint linked for RBM Help Desk.',
    timestamp: '2026-08-12 00:00:00',
    ip: '192.168.1.1'
  }
];

export const initialSystemSettings: SystemSettings = {
  systemName: 'RBM HelpDesk Pro',
  companyName: 'Rathi Buildmart',
  supportEmail: 'misrpr@rathibuildmart.com',
  logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100',
  spreadsheetId: '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow',
  driveFolderId: '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
  driveFolderUrl: 'https://drive.google.com/drive/folders/1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec',
  googleAppsScriptWebAppUrl: 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec',
  ticketIdPrefix: 'HD-',
  autoAssignmentEnabled: true,
  autoAssignEnabled: true,
  emailNotificationsEnabled: true,
  slaBreachAlertsEnabled: true,
  slaEnforcementEnabled: true,
  driveFolderStructureCreated: true
};

export const initialBranches: string[] = [
  'RPR',
  'Headquarters',
  'Raipur Hub',
  'Bilaspur Branch',
  'Bhilai Branch'
];

export const initialPriorities: string[] = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const initialStatuses: string[] = [
  'Open',
  'Pending',
  'In Progress',
  'Resolved',
  'Closed',
  'Reopened'
];

export const initialRoles: string[] = [
  'Employee',
  'Support Agent',
  'Support Manager',
  'Admin',
  'Super Admin'
];

export const initialDesignations: string[] = [
  'System Administrator',
  'Account Executive',
  'HR Specialist',
  'Senior Accountant',
  'Procurement Manager',
  'Logistics Supervisor',
  'L2 IT Specialist',
  'Network Administrator',
  'Systems Engineer',
  'IT Service Desk Manager',
  'VP of Operations',
  'Chief Technology Officer'
];

export const defaultRolePermissions: RolePermissionConfig[] = [
  {
    role: 'Super Admin',
    canViewDashboard: true,
    canViewTickets: true,
    canCreateTickets: true,
    canEditTickets: true,
    canDeleteTickets: true, // Super Admin exclusive
    canViewFeedback: true,
    canSubmitFeedback: true,
    canViewReports: true,
    canManageUsers: true,
    canDeleteUsersPermanently: true, // Super Admin exclusive
    canManageDepartments: true,
    canManageCategories: true,
    canManageSLA: true,
    canManageDropdowns: true,
    canAccessGoogleDriveSync: true,
    canAccessAppsScript: true,
    canViewAuditLogs: true,
    canManageSystemSettings: true,
    canManageRolePermissions: true, // Super Admin exclusive
    canAccessArchivedData: true
  },
  {
    role: 'Admin',
    canViewDashboard: true,
    canViewTickets: true,
    canCreateTickets: true,
    canEditTickets: true,
    canDeleteTickets: false, // Protected
    canViewFeedback: true,
    canSubmitFeedback: true,
    canViewReports: true,
    canManageUsers: true,
    canDeleteUsersPermanently: false, // Protected
    canManageDepartments: true,
    canManageCategories: true,
    canManageSLA: true,
    canManageDropdowns: true,
    canAccessGoogleDriveSync: true,
    canAccessAppsScript: false,
    canViewAuditLogs: true,
    canManageSystemSettings: true,
    canManageRolePermissions: false,
    canAccessArchivedData: true
  },
  {
    role: 'Support Manager',
    canViewDashboard: true,
    canViewTickets: true,
    canCreateTickets: true,
    canEditTickets: true,
    canDeleteTickets: false,
    canViewFeedback: true,
    canSubmitFeedback: true,
    canViewReports: true,
    canManageUsers: false,
    canDeleteUsersPermanently: false,
    canManageDepartments: false,
    canManageCategories: false,
    canManageSLA: false,
    canManageDropdowns: false,
    canAccessGoogleDriveSync: false,
    canAccessAppsScript: false,
    canViewAuditLogs: false,
    canManageSystemSettings: false,
    canManageRolePermissions: false,
    canAccessArchivedData: false
  },
  {
    role: 'Support Agent',
    canViewDashboard: true,
    canViewTickets: true,
    canCreateTickets: true,
    canEditTickets: true,
    canDeleteTickets: false,
    canViewFeedback: true,
    canSubmitFeedback: false,
    canViewReports: false,
    canManageUsers: false,
    canDeleteUsersPermanently: false,
    canManageDepartments: false,
    canManageCategories: false,
    canManageSLA: false,
    canManageDropdowns: false,
    canAccessGoogleDriveSync: false,
    canAccessAppsScript: false,
    canViewAuditLogs: false,
    canManageSystemSettings: false,
    canManageRolePermissions: false,
    canAccessArchivedData: false
  },
  {
    role: 'Employee',
    canViewDashboard: true,
    canViewTickets: true,
    canCreateTickets: true,
    canEditTickets: false,
    canDeleteTickets: false,
    canViewFeedback: false,
    canSubmitFeedback: true,
    canViewReports: false,
    canManageUsers: false,
    canDeleteUsersPermanently: false,
    canManageDepartments: false,
    canManageCategories: false,
    canManageSLA: false,
    canManageDropdowns: false,
    canAccessGoogleDriveSync: false,
    canAccessAppsScript: false,
    canViewAuditLogs: false,
    canManageSystemSettings: false,
    canManageRolePermissions: false,
    canAccessArchivedData: false
  }
];

export const initialArchivedTickets: ArchivedTicket[] = [];

export const initialArchivedUsers: ArchivedUser[] = [];

export const initialNotificationTemplates: NotificationTemplate[] = [
  {
    id: 'TPL-EMAIL-CREATED',
    name: 'Ticket Confirmation (Email to Employee)',
    channel: 'email',
    triggerEvent: 'ticket_created',
    recipientType: 'employee',
    enabled: true,
    subject: '[HelpDesk Confirmation] Ticket {ticket_id} Registered: {subject}',
    body: `Dear {employee_name},

Your support ticket {ticket_id} ("{subject}") has been successfully registered in our queue.

Ticket Details:
- Ticket ID: {ticket_id}
- Category: {category} > {sub_category}
- Priority: {priority}
- Department: {department} ({location})
- Assigned Specialist: {assigned_agent}
- SLA Target Due: {sla_due}

Our support team is actively reviewing your request. You will receive further notifications as progress is made.

Best regards,
Rathi Buildmart IT Operations & HelpDesk Team`,
    htmlBody: ``,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-EMAIL-ASSIGNED',
    name: 'New Ticket Assignment Alert (Email to Agent)',
    channel: 'email',
    triggerEvent: 'ticket_assigned',
    recipientType: 'agent',
    enabled: true,
    subject: '[Action Required] Ticket {ticket_id} Assigned to You ({priority})',
    body: `Hello {assigned_agent},

A new support request has been assigned to your queue:

Ticket ID: {ticket_id}
Subject: {subject}
Raised By: {employee_name} ({employee_email}, Phone: {employee_phone})
Priority: {priority}
SLA Due: {sla_due}
Description:
{description}

Please log in to the HelpDesk portal to acknowledge and begin work.

Best regards,
HelpDesk Management System`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-EMAIL-STATUS',
    name: 'Status Update Notification (Email to Employee)',
    channel: 'email',
    triggerEvent: 'status_updated',
    recipientType: 'employee',
    enabled: true,
    subject: '[HelpDesk Update] Ticket {ticket_id} status changed to {status}',
    body: `Dear {employee_name},

The status of your support ticket {ticket_id} ("{subject}") has been updated to: {status}.

Handled By: {assigned_agent}
Latest Update: {latest_comment}

You can track your ticket progress in real-time on your HelpDesk portal.

Best regards,
Rathi Buildmart HelpDesk`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-EMAIL-CLOSED',
    name: 'Ticket Resolved & Closed (Email to Employee)',
    channel: 'email',
    triggerEvent: 'ticket_closed',
    recipientType: 'employee',
    enabled: true,
    subject: '[HelpDesk Resolved] Ticket {ticket_id} has been Completed',
    body: `Dear {employee_name},

Your support request {ticket_id} ("{subject}") has been resolved and marked as {status}.

Handled By: {assigned_agent}
Resolution Notes: {resolution_notes}

⭐ Please take a moment to rate your support experience in the HelpDesk portal.

Best regards,
Rathi Buildmart Support Desk`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-WA-CREATED',
    name: 'Ticket Registered Confirmation (WhatsApp)',
    channel: 'whatsapp',
    triggerEvent: 'ticket_created',
    recipientType: 'employee',
    enabled: true,
    body: `*🏢 RATHI BUILDMART HELPDESK*
━━━━━━━━━━━━━━━━━━━━
Namaste *{employee_name}*,

Aapka support ticket successfully register ho gaya hai:

📌 *Ticket ID:* {ticket_id}
📝 *Subject:* {subject}
🏷️ *Category:* {category}
⚡ *Priority:* {priority}
👤 *Assigned Agent:* {assigned_agent}
⏳ *SLA Resolution Target:* {sla_due}

Humari team jald hi aapki request par action legi. Ticket track karne ke liye portal visit karein:
🔗 https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-WA-ASSIGNED',
    name: 'Urgent Ticket Assigned Alert (WhatsApp to Agent)',
    channel: 'whatsapp',
    triggerEvent: 'ticket_assigned',
    recipientType: 'agent',
    enabled: true,
    body: `*🚨 NEW TICKET ASSIGNMENT ALERT*
━━━━━━━━━━━━━━━━━━━━
Hello *{assigned_agent}*,

Naya ticket aapko assign kiya gaya hai:

📌 *Ticket ID:* {ticket_id}
📝 *Subject:* {subject}
⚡ *Priority:* *{priority}*
👤 *Employee:* {employee_name} ({employee_phone})
🏢 *Dept/Branch:* {department} ({location})
⏱️ *SLA Target:* {sla_due}

Kripya portal par jakar jald action lein:
🔗 https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-WA-STATUS',
    name: 'Status Update Progress Alert (WhatsApp)',
    channel: 'whatsapp',
    triggerEvent: 'status_updated',
    recipientType: 'employee',
    enabled: true,
    body: `*🔄 TICKET STATUS UPDATE*
━━━━━━━━━━━━━━━━━━━━
Namaste *{employee_name}*,

Aapke ticket *{ticket_id}* ka status update hua hai:

📌 *Ticket ID:* {ticket_id}
📝 *Subject:* {subject}
📊 *New Status:* *{status}*
👤 *Handled By:* {assigned_agent}
💬 *Update Note:* {latest_comment}

Best regards,
*Rathi Buildmart Support Desk*`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-WA-RESOLVED',
    name: 'Ticket Resolved & Rating Feedback (WhatsApp)',
    channel: 'whatsapp',
    triggerEvent: 'ticket_closed',
    recipientType: 'employee',
    enabled: true,
    body: `*✅ TICKET RESOLVED & COMPLETED*
━━━━━━━━━━━━━━━━━━━━
Namaste *{employee_name}*,

Aapka ticket *{ticket_id}* solve ho gaya hai!

📌 *Ticket ID:* {ticket_id}
📝 *Subject:* {subject}
👤 *Resolved By:* {assigned_agent}
📝 *Resolution Notes:* {resolution_notes}

⭐ *Aapka feedback humare liye anmol hai!*
Kripya portal par jakar service rating (1-5 Star) dein:
🔗 https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app

Dhanyawad,
*Rathi Buildmart IT Team*`,
    updatedAt: '2026-08-18 10:00:00'
  },
  {
    id: 'TPL-WA-SLA-BREACH',
    name: 'SLA Breach Urgent Warning (WhatsApp to Manager)',
    channel: 'whatsapp',
    triggerEvent: 'sla_breach',
    recipientType: 'admin',
    enabled: true,
    body: `*⚠️ CRITICAL SLA BREACH WARNING*
━━━━━━━━━━━━━━━━━━━━
Attention *Support Team Lead*,

Ticket *{ticket_id}* ka SLA breach ho chuka hai ya breach hone wala hai:

📌 *Ticket ID:* {ticket_id}
📝 *Subject:* {subject}
⚡ *Priority:* {priority}
👤 *Assigned Agent:* {assigned_agent}
⏱️ *Overdue Since / Due:* {sla_due}

Immediate escalation required!`,
    updatedAt: '2026-08-18 10:00:00'
  }
];

export const initialNotificationLogs: NotificationLogItem[] = [
  {
    id: 'NLOG-1001',
    channel: 'email',
    recipientName: 'Misr Pr',
    recipientContact: 'misrpr@rathibuildmart.com',
    ticketId: 'HD-000101',
    ticketSubject: 'ERP Access Credentials Reset for Raipur Branch',
    triggerEvent: 'Ticket Created',
    subject: '[HelpDesk Confirmation] Ticket HD-000101 Registered: ERP Access Credentials',
    messagePreview: 'Dear Misr Pr, Your support ticket HD-000101 has been registered in our queue.',
    status: 'Delivered',
    timestamp: '2026-08-18 09:30:15',
    sentBy: 'System Automation'
  },
  {
    id: 'NLOG-1002',
    channel: 'whatsapp',
    recipientName: 'Aashish',
    recipientContact: '+91 98765 43210',
    ticketId: 'HD-000101',
    ticketSubject: 'ERP Access Credentials Reset for Raipur Branch',
    triggerEvent: 'Ticket Assigned',
    subject: 'WhatsApp Assignment Alert',
    messagePreview: '🚨 NEW TICKET ASSIGNMENT ALERT: Hello Aashish, Ticket HD-000101 assigned to you...',
    status: 'Sent',
    timestamp: '2026-08-18 09:30:18',
    sentBy: 'System Automation'
  },
  {
    id: 'NLOG-1003',
    channel: 'email',
    recipientName: 'Dhaneshwari',
    recipientContact: 'accountsrpr@rathibuildmart.com',
    ticketId: 'HD-000102',
    ticketSubject: 'Printer Network Offline in Accounts Department',
    triggerEvent: 'Status Changed to In Progress',
    subject: '[HelpDesk Update] Ticket HD-000102 status changed to In Progress',
    messagePreview: 'Dear Dhaneshwari, The status of your support ticket HD-000102 has been updated to: In Progress.',
    status: 'Delivered',
    timestamp: '2026-08-18 10:15:40',
    sentBy: 'Aashish (Support Agent)'
  },
  {
    id: 'NLOG-1004',
    channel: 'whatsapp',
    recipientName: 'Lekhram',
    recipientContact: '+91 98271 23456',
    ticketId: 'HD-000103',
    ticketSubject: 'Tally Server Connection Timeout',
    triggerEvent: 'Ticket Resolved',
    subject: 'WhatsApp Resolved & Feedback',
    messagePreview: '✅ TICKET RESOLVED & COMPLETED: Namaste Lekhram, Aapka ticket HD-000103 solve ho gaya hai...',
    status: 'Delivered',
    timestamp: '2026-08-18 11:45:10',
    sentBy: 'Misr Pr (Admin)'
  },
  {
    id: 'NLOG-1005',
    channel: 'email',
    recipientName: 'Sarwaswati',
    recipientContact: 'accountsrpr@rathibuildmart.com',
    ticketId: 'HD-000104',
    ticketSubject: 'Biometric Attendance Device Sync Error',
    triggerEvent: 'Ticket Closed',
    subject: '[HelpDesk Resolved] Ticket HD-000104 has been Completed',
    messagePreview: 'Dear Sarwaswati, Your support request HD-000104 has been resolved and closed.',
    status: 'Delivered',
    timestamp: '2026-08-18 12:20:05',
    sentBy: 'System Automation'
  }
];


