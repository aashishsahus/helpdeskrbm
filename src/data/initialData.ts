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
  ArchivedUser
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
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
    status: 'Active'
  },
  {
    id: 'u1',
    employeeId: 'EMP-1001',
    name: 'Sarah Connor',
    email: 'sarah.connor@company.com',
    role: 'Employee',
    department: 'Sales',
    designation: 'Account Executive',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 019-2834',
    joiningDate: '2023-01-15',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
  },
  {
    id: 'u2',
    employeeId: 'EMP-1002',
    name: 'David Miller',
    email: 'david.miller@company.com',
    role: 'Employee',
    department: 'HR',
    designation: 'HR Specialist',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 018-9921',
    joiningDate: '2022-06-10',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
  },
  {
    id: 'u3',
    employeeId: 'EMP-1003',
    name: 'Anita Roy',
    email: 'anita.roy@company.com',
    role: 'Employee',
    department: 'Accounts',
    designation: 'Senior Accountant',
    location: 'Chicago Hub',
    status: 'Active',
    mobile: '+1 (555) 014-4412',
    joiningDate: '2021-11-01'
  },
  {
    id: 'u4',
    employeeId: 'EMP-1004',
    name: 'Robert Chen',
    email: 'robert.chen@company.com',
    role: 'Employee',
    department: 'Purchase',
    designation: 'Procurement Manager',
    location: 'West Coast Office - CA',
    status: 'Active',
    mobile: '+1 (555) 012-3390'
  },
  {
    id: 'u5',
    employeeId: 'EMP-1005',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    role: 'Employee',
    department: 'Warehouse',
    designation: 'Logistics Supervisor',
    location: 'Central Warehouse - TX',
    status: 'Active',
    mobile: '+1 (555) 016-7788'
  },
  {
    id: 'u6',
    employeeId: 'EMP-2001',
    name: 'Alex Rivera',
    email: 'alex.rivera@company.com',
    role: 'Support Agent',
    department: 'IT Support',
    designation: 'L2 IT Specialist',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 011-5544',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
  },
  {
    id: 'u7',
    employeeId: 'EMP-2002',
    name: 'Priya Sharma',
    email: 'priya.sharma@company.com',
    role: 'Support Agent',
    department: 'IT Support',
    designation: 'Network Administrator',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 013-8822',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  },
  {
    id: 'u8',
    employeeId: 'EMP-2003',
    name: 'Marcus Brody',
    email: 'marcus.brody@company.com',
    role: 'Support Agent',
    department: 'Hardware & Facilities',
    designation: 'Systems Engineer',
    location: 'Chicago Hub',
    status: 'Active',
    mobile: '+1 (555) 017-6633'
  },
  {
    id: 'u9',
    employeeId: 'EMP-3001',
    name: 'Elena Rostova',
    email: 'elena.rostova@company.com',
    role: 'Support Manager',
    department: 'IT Support',
    designation: 'IT Service Desk Manager',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 019-0011',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
  },
  {
    id: 'u10',
    employeeId: 'EMP-4001',
    name: 'Michael Scott',
    email: 'michael.scott@company.com',
    role: 'Admin',
    department: 'Administration',
    designation: 'VP of Operations',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 010-9900',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
  },
  {
    id: 'u11',
    employeeId: 'EMP-5001',
    name: 'Administrator',
    email: 'admin@company.com',
    role: 'Super Admin',
    department: 'IT Support',
    designation: 'Chief Technology Officer',
    location: 'Headquarters - NY',
    status: 'Active',
    mobile: '+1 (555) 000-1111'
  }
];

export const initialDepartments: Department[] = [
  { id: 'd1', name: 'IT Support', headName: 'Elena Rostova', supportTeam: 'Core IT Team', defaultAgentId: 'u6' },
  { id: 'd2', name: 'HR', headName: 'David Miller', supportTeam: 'People Ops Team' },
  { id: 'd3', name: 'Accounts & Finance', headName: 'Anita Roy', supportTeam: 'Finance Desk' },
  { id: 'd4', name: 'Purchase & Procurement', headName: 'Robert Chen', supportTeam: 'Supply Desk' },
  { id: 'd5', name: 'Sales & Marketing', headName: 'Sarah Connor', supportTeam: 'Sales Operations' },
  { id: 'd6', name: 'Maintenance & Facilities', headName: 'Marcus Brody', supportTeam: 'Facilities Team', defaultAgentId: 'u8' }
];

export const initialCategories: Category[] = [
  { id: 'c1', name: 'Hardware', department: 'IT Support', subCategories: ['Laptop', 'Desktop', 'Monitor', 'Keyboard/Mouse', 'Printer', 'Docking Station'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'Hardware Team' },
  { id: 'c2', name: 'Software', department: 'IT Support', subCategories: ['Operating System', 'MS Office 365', 'VPN Client', 'Antivirus', 'License Request', 'ERP Access'], defaultPriority: 'Medium', defaultSLAHours: 8, defaultSupportTeam: 'Software Team' },
  { id: 'c3', name: 'Network & Internet', department: 'IT Support', subCategories: ['Wi-Fi Connectivity', 'LAN Port', 'VPN Connection', 'Internet Speed', 'Firewall Block'], defaultPriority: 'High', defaultSLAHours: 4, defaultSupportTeam: 'Network Team' },
  { id: 'c4', name: 'Email & Communication', department: 'IT Support', subCategories: ['Email Password Reset', 'Distribution List', 'Teams/Zoom Issue', 'Spam/Phishing Report'], defaultPriority: 'High', defaultSLAHours: 2, defaultSupportTeam: 'Core IT Team' },
  { id: 'c5', name: 'HR & Payroll', department: 'HR', subCategories: ['Attendance Correction', 'Leave Balance', 'Payslip Query', 'Insurance Claim', 'ID Card Request'], defaultPriority: 'Low', defaultSLAHours: 24, defaultSupportTeam: 'People Ops Team' },
  { id: 'c6', name: 'Accounts & Billing', department: 'Accounts & Finance', subCategories: ['Reimbursement Request', 'Vendor Invoice', 'Travel Allowance', 'Tax Form 16'], defaultPriority: 'Medium', defaultSLAHours: 12, defaultSupportTeam: 'Finance Desk' },
  { id: 'c7', name: 'Procurement', department: 'Purchase & Procurement', subCategories: ['New Accessory Request', 'Hardware Upgrade', 'Stationery Order'], defaultPriority: 'Low', defaultSLAHours: 48, defaultSupportTeam: 'Supply Desk' },
  { id: 'c8', name: 'Facilities & Maintenance', department: 'Maintenance & Facilities', subCategories: ['Air Conditioning', 'Lighting/Electrical', 'Desk Furniture', 'Access Badge'], defaultPriority: 'Medium', defaultSLAHours: 12, defaultSupportTeam: 'Facilities Team' },
  { id: 'c9', name: 'Warehouse Systems', department: 'IT Support', subCategories: ['Barcode Scanner', 'Label Printer', 'WMS Software', 'Handheld Terminal'], defaultPriority: 'Critical', defaultSLAHours: 2, defaultSupportTeam: 'Core IT Team' },
  { id: 'c10', name: 'Security & Access', department: 'IT Support', subCategories: ['Role Permissions', 'Folder Access', 'Security Key', 'Audit Request'], defaultPriority: 'High', defaultSLAHours: 4, defaultSupportTeam: 'Core IT Team' }
];

export const initialSLARules: SLARule[] = [
  { id: 'sla1', priority: 'Critical', resolutionHours: 2, responseHours: 0.5 },
  { id: 'sla2', priority: 'High', resolutionHours: 4, responseHours: 1 },
  { id: 'sla3', priority: 'Medium', resolutionHours: 8, responseHours: 2 },
  { id: 'sla4', priority: 'Low', resolutionHours: 24, responseHours: 4 }
];

export const initialTickets: Ticket[] = [
  {
    id: 'HD-000001',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Connor',
    employeeEmail: 'sarah.connor@company.com',
    department: 'Sales',
    location: 'Headquarters - NY',
    category: 'Hardware',
    subCategory: 'Laptop',
    subject: 'MacBook display flickering during client presentations',
    description: 'When plugged into external monitors in Conference Room B, the display flickers violently and disconnects every 5 minutes.',
    priority: 'High',
    status: 'In Progress',
    assignedAgentId: 'u6',
    assignedAgentName: 'Alex Rivera',
    createdDate: '2026-08-10T09:30:00Z',
    updatedDate: '2026-08-11T04:15:00Z',
    slaDueDate: '2026-08-11T13:30:00Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 019-2834',
    isDemoTicket: true,
    attachments: [
      {
        id: 'att1',
        ticketId: 'HD-000001',
        fileName: 'display_issue_photo.jpg',
        driveFileId: 'drive_mock_1',
        driveUrl: 'https://drive.google.com/file/d/drive_mock_1/view',
        fileType: 'image/jpeg',
        fileSize: 1024500,
        uploadedBy: 'Sarah Connor',
        uploadedDate: '2026-08-10T09:30:00Z'
      }
    ]
  },
  {
    id: 'HD-000002',
    employeeId: 'EMP-1005',
    employeeName: 'Emily Davis',
    employeeEmail: 'emily.davis@company.com',
    department: 'Warehouse',
    location: 'Central Warehouse - TX',
    category: 'Warehouse Systems',
    subCategory: 'Barcode Scanner',
    subject: 'Barcode scanner offline on Dock 4 - Shipping Halted',
    description: 'The Zebra wireless scanner is unable to sync with the WMS server. Error code 503 shown. Critical shipment waiting to load.',
    priority: 'Critical',
    status: 'Open',
    assignedAgentId: 'u7',
    assignedAgentName: 'Priya Sharma',
    createdDate: '2026-08-11T03:10:00Z',
    updatedDate: '2026-08-11T03:10:00Z',
    slaDueDate: '2026-08-11T05:10:00Z',
    slaStatus: 'Breached',
    contactNumber: '+1 (555) 016-7788',
    isDemoTicket: true
  },
  {
    id: 'HD-000003',
    employeeId: 'EMP-1002',
    employeeName: 'David Miller',
    employeeEmail: 'david.miller@company.com',
    department: 'HR',
    location: 'Headquarters - NY',
    category: 'Email & Communication',
    subCategory: 'Email Password Reset',
    subject: 'Locked out of corporate email after password expiration',
    description: 'Received forced password change prompt and got locked out after 3 attempts. Need password reset for david.miller@company.com.',
    priority: 'High',
    status: 'Resolved',
    assignedAgentId: 'u6',
    assignedAgentName: 'Alex Rivera',
    createdDate: '2026-08-10T14:20:00Z',
    updatedDate: '2026-08-10T15:05:00Z',
    slaDueDate: '2026-08-10T18:20:00Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 018-9921',
    resolvedDate: '2026-08-10T15:05:00Z',
    resolutionTimeMinutes: 45,
    rating: 5,
    feedback: 'Alex resolved it in 45 minutes! Excellent service.',
    isDemoTicket: true
  },
  {
    id: 'HD-000004',
    employeeId: 'EMP-1003',
    employeeName: 'Anita Roy',
    employeeEmail: 'anita.roy@company.com',
    department: 'Accounts',
    location: 'Chicago Hub',
    category: 'Accounts & Billing',
    subCategory: 'Reimbursement Request',
    subject: 'July Travel Reimbursement batch approval stuck',
    description: 'Submitted $2,450 travel expense report under claim #EX-992. Status has been pending finance clearance for over 5 days.',
    priority: 'Medium',
    status: 'Pending',
    assignedAgentId: undefined,
    createdDate: '2026-08-08T11:00:00Z',
    updatedDate: '2026-08-09T09:20:00Z',
    slaDueDate: '2026-08-09T11:00:00Z',
    slaStatus: 'Breached',
    contactNumber: '+1 (555) 014-4412',
    isDemoTicket: true
  },
  {
    id: 'HD-000005',
    employeeId: 'EMP-1004',
    employeeName: 'Robert Chen',
    employeeEmail: 'robert.chen@company.com',
    department: 'Purchase',
    location: 'West Coast Office - CA',
    category: 'Software',
    subCategory: 'License Request',
    subject: 'Request for Adobe Acrobat Pro License for Vendor Contracts',
    description: 'Need Adobe Acrobat Pro license to review, annotate, and digitally sign multi-million dollar vendor agreements.',
    priority: 'Low',
    status: 'Open',
    assignedAgentId: 'u8',
    assignedAgentName: 'Marcus Brody',
    createdDate: '2026-08-11T01:00:00Z',
    updatedDate: '2026-08-11T01:00:00Z',
    slaDueDate: '2026-08-12T01:00:00Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 012-3390',
    isDemoTicket: true
  },
  {
    id: 'HD-000006',
    employeeId: 'EMP-1001',
    employeeName: 'Sarah Connor',
    employeeEmail: 'sarah.connor@company.com',
    department: 'Sales',
    location: 'Headquarters - NY',
    category: 'Network & Internet',
    subCategory: 'VPN Connection',
    subject: 'VPN disconnects every 10 minutes when working remotely',
    description: 'GlobalProtect VPN drops connection frequently from home office Wi-Fi, causing CRM session timeout.',
    priority: 'Medium',
    status: 'Closed',
    assignedAgentId: 'u7',
    assignedAgentName: 'Priya Sharma',
    createdDate: '2026-08-05T08:00:00Z',
    updatedDate: '2026-08-06T12:00:00Z',
    slaDueDate: '2026-08-05T16:00:00Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 019-2834',
    resolvedDate: '2026-08-06T10:00:00Z',
    closedDate: '2026-08-06T12:00:00Z',
    resolutionTimeMinutes: 120,
    rating: 4,
    feedback: 'Priya resolved the VPN configuration promptly. Good support experience.',
    isDemoTicket: true
  },
  {
    id: 'HD-000007',
    employeeId: 'EMP-1002',
    employeeName: 'David Miller',
    employeeEmail: 'david.miller@company.com',
    department: 'HR',
    location: 'Headquarters - NY',
    category: 'HR & Payroll',
    subCategory: 'Leave Balance',
    subject: 'Discrepancy in sick leave balance on HR Portal',
    description: 'Portal displays 2 days sick leave remaining, but official records should reflect 7 days after medical certificate submission.',
    priority: 'Low',
    status: 'In Progress',
    assignedAgentId: undefined,
    createdDate: '2026-08-10T16:00:00Z',
    updatedDate: '2026-08-11T02:00:00Z',
    slaDueDate: '2026-08-11T16:00:00Z',
    slaStatus: 'Due Soon',
    contactNumber: '+1 (555) 018-9921',
    isDemoTicket: true
  },
  {
    id: 'HD-000008',
    employeeId: 'EMP-1005',
    employeeName: 'Emily Davis',
    employeeEmail: 'emily.davis@company.com',
    department: 'Warehouse',
    location: 'Central Warehouse - TX',
    category: 'Facilities & Maintenance',
    subCategory: 'Air Conditioning',
    subject: 'Main Server Room AC unit leaking water',
    description: 'Water condensation leaking near Rack B in server room. Temperature reading 28°C.',
    priority: 'Critical',
    status: 'In Progress',
    assignedAgentId: 'u8',
    assignedAgentName: 'Marcus Brody',
    createdDate: '2026-08-11T04:00:00Z',
    updatedDate: '2026-08-11T04:30:00Z',
    slaDueDate: '2026-08-11T06:00:00Z',
    slaStatus: 'Due Soon',
    contactNumber: '+1 (555) 016-7788',
    isDemoTicket: true
  },
  {
    id: 'HD-000009',
    employeeId: 'EMP-2026',
    employeeName: 'Misr Pr',
    employeeEmail: 'misrpr@rathibuildmart.com',
    department: 'IT Operations',
    location: 'Headquarters - NY',
    category: 'Hardware',
    subCategory: 'Laptop',
    subject: 'bfghf',
    description: 'fyfyfj',
    priority: 'Medium',
    status: 'Open',
    assignedAgentId: 'u_system_misrpr',
    assignedAgentName: 'Misr Pr',
    createdDate: '2026-08-12T00:30:00Z',
    updatedDate: '2026-08-12T00:30:00Z',
    slaDueDate: '2026-08-12T08:30:00Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 019-2026',
    isRealTicket: true
  },
  {
    id: 'HD-000010',
    employeeId: 'EMP-2026',
    employeeName: 'Misr Pr',
    employeeEmail: 'misrpr@rathibuildmart.com',
    department: 'IT Operations',
    location: 'Headquarters - NY',
    category: 'Hardware',
    subCategory: 'Laptop',
    subject: 'm,bjkhhk',
    description: 'jhgjg',
    priority: 'Medium',
    status: 'Resolved',
    assignedAgentId: 'u8',
    assignedAgentName: 'Marcus Brody',
    createdDate: '2026-08-12T00:31:44Z',
    updatedDate: '2026-08-12T00:53:04Z',
    slaDueDate: '2026-08-12T08:31:44Z',
    resolvedDate: '2026-08-12T00:53:04Z',
    slaStatus: 'Safe',
    contactNumber: '+1 (555) 019-2026',
    rating: 5,
    feedback: 'Prompt resolution on laptop ticket! Marcus Brody provided great service.',
    isRealTicket: true
  }
];

export const initialComments: TicketComment[] = [
  {
    id: 'tc1',
    ticketId: 'HD-000001',
    authorId: 'u6',
    authorName: 'Alex Rivera',
    authorRole: 'Support Agent',
    content: 'Hi Sarah, I have assigned this ticket to myself. Please let me know if you can drop off your MacBook at the IT Help Desk on floor 3 at 2 PM today so we can test the USB-C adapter replacement.',
    isInternalNote: false,
    createdAt: '2026-08-10T10:15:00Z'
  },
  {
    id: 'tc2',
    ticketId: 'HD-000001',
    authorId: 'u1',
    authorName: 'Sarah Connor',
    authorRole: 'Employee',
    content: 'Sure Alex! I will bring it by at 2 PM. Thanks for the quick response.',
    isInternalNote: false,
    createdAt: '2026-08-10T10:45:00Z'
  },
  {
    id: 'tc3',
    ticketId: 'HD-000001',
    authorId: 'u6',
    authorName: 'Alex Rivera',
    authorRole: 'Support Agent',
    content: 'INTERNAL NOTE: Replacement USB-C multiport dongle ordered under warranty claim. Tested with Anker dock in lab, flickering issue reproduced.',
    isInternalNote: true,
    createdAt: '2026-08-10T15:00:00Z'
  }
];

export const initialHistory: TicketHistory[] = [
  {
    id: 'th1',
    ticketId: 'HD-000001',
    action: 'Ticket Created',
    actorName: 'Sarah Connor',
    details: 'Ticket created with priority High.',
    timestamp: '2026-08-10T09:30:00Z'
  },
  {
    id: 'th2',
    ticketId: 'HD-000001',
    action: 'Assigned Agent',
    actorName: 'Alex Rivera',
    details: 'Assigned to Alex Rivera',
    timestamp: '2026-08-10T10:15:00Z'
  },
  {
    id: 'th3',
    ticketId: 'HD-000001',
    action: 'Status Changed',
    actorName: 'Alex Rivera',
    details: 'Status changed from Open to In Progress',
    timestamp: '2026-08-10T10:15:00Z'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'n1',
    userId: 'u1',
    ticketId: 'HD-000001',
    title: 'Ticket Updated',
    message: 'Alex Rivera updated ticket HD-000001: "In Progress"',
    type: 'status',
    read: false,
    createdAt: '2026-08-10T10:15:00Z'
  },
  {
    id: 'n2',
    userId: 'u9',
    ticketId: 'HD-000002',
    title: 'SLA Breached Alert',
    message: 'Ticket HD-000002 (Dock 4 Barcode Scanner) has breached SLA!',
    type: 'sla_breach',
    read: false,
    createdAt: '2026-08-11T05:10:00Z'
  }
];

export const initialKnowledgeBase: KnowledgeBaseArticle[] = [
  {
    id: 'kb1',
    title: 'How to Reset Your Corporate Email Password',
    category: 'Email & Security',
    tags: ['password', 'email', 'mfa', 'security'],
    summary: 'Self-service step-by-step guide to reset your Microsoft 365 or Google Workspace email password.',
    content: `### Self-Service Password Reset Guide\n\n1. Go to https://password.company.com in your web browser.\n2. Enter your Employee ID (e.g. EMP-1001) or full corporate email address.\n3. Verify your identity using the Okta / Microsoft Authenticator app on your registered mobile device.\n4. Type your new password conforming to the security policy (12+ characters, uppercase, number, special character).\n5. Click Confirm. Your new password will sync across Wi-Fi, VPN, and Email within 2 minutes.`,
    views: 342,
    updatedAt: '2026-08-01T10:00:00Z'
  },
  {
    id: 'kb2',
    title: 'Connecting to Corporate VPN (GlobalProtect)',
    category: 'Network',
    tags: ['vpn', 'remote', 'network', 'globalprotect'],
    summary: 'Setup instructions for connecting to the corporate VPN when working remotely.',
    content: `### GlobalProtect VPN Connection Steps\n\n1. Open GlobalProtect app on your workstation.\n2. Enter Portal Address: \`vpn.company.com\`\n3. Click Connect and authenticate with your single sign-on credentials.\n4. Approve the push notification on your mobile MFA app.\n5. Once connected, the shield icon in your menu bar will turn green.`,
    views: 521,
    updatedAt: '2026-08-05T14:30:00Z'
  },
  {
    id: 'kb3',
    title: 'Requesting a New Laptop or IT Hardware Upgrade',
    category: 'Procurement & Hardware',
    tags: ['laptop', 'hardware', 'procurement', 'upgrade'],
    summary: 'Policy and workflow for hardware refresh and new equipment requisitions.',
    content: `### IT Hardware Requisition SOP\n\n- Standard refresh cycle for laptops is 36 months.\n- Early replacement requires department manager approval.\n- Submit an Internal Help Desk ticket under Category: **Procurement -> Hardware Upgrade**.\n- Attach signed manager approval email as PDF or DOCX.`,
    views: 189,
    updatedAt: '2026-08-02T11:15:00Z'
  }
];

export const initialAuditLogs: AuditLogItem[] = [
  {
    id: 'al1',
    actorName: 'Michael Scott',
    actorEmail: 'michael.scott@company.com',
    action: 'USER_CREATED',
    module: 'User Management',
    details: 'Created new user Sarah Connor (EMP-1001) assigned to Sales.',
    timestamp: '2026-08-01T09:00:00Z',
    ip: '192.168.1.100'
  },
  {
    id: 'al2',
    actorName: 'Elena Rostova',
    actorEmail: 'elena.rostova@company.com',
    action: 'SLA_UPDATED',
    module: 'SLA Rules',
    details: 'Updated Critical SLA resolution time to 2 hours.',
    timestamp: '2026-08-02T14:10:00Z',
    ip: '192.168.1.105'
  }
];

export const initialSystemSettings: SystemSettings = {
  systemName: 'Apex HelpDesk Pro',
  companyName: 'Apex Enterprise Solutions',
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
  'Headquarters - NY',
  'Chicago Hub',
  'West Coast Office - CA',
  'Central Warehouse - TX',
  'London International Branch',
  'Mumbai Tech Hub'
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

export const initialArchivedTickets: ArchivedTicket[] = [
  {
    id: 'HD-000088',
    employeeId: 'EMP-1008',
    employeeName: 'Sample Archived Ticket',
    employeeEmail: 'sample@rathibuildmart.com',
    department: 'IT Operations',
    location: 'RPR',
    category: 'Hardware Issue',
    subCategory: 'Monitor / Display',
    subject: 'Old monitor replacement request (Closed & Archived)',
    description: 'Replaced damaged display unit. Ticket archived after 90 days retention.',
    priority: 'Low',
    status: 'Closed',
    assignedAgentId: 'u_ashish',
    assignedAgentName: 'Aashish',
    createdDate: '2026-06-01 10:00:00',
    updatedDate: '2026-06-05 16:30:00',
    slaDueDate: '2026-06-07 10:00:00',
    slaStatus: 'Safe',
    contactNumber: '+91 98765 00000',
    resolvedDate: '2026-06-05 16:30:00',
    closedDate: '2026-06-05 16:30:00',
    rating: 5,
    feedback: 'Promptly solved.',
    archivedAt: '2026-08-01 12:00:00',
    archivedBy: 'Misr Pr (Super Admin)',
    archivedByEmail: 'misrpr@rathibuildmart.com',
    archiveReason: 'Periodic archive of resolved tickets'
  }
];

export const initialArchivedUsers: ArchivedUser[] = [
  {
    id: 'u_archived_sample',
    employeeId: 'EMP-0999',
    name: 'Former Staff Member',
    email: 'former.staff@rathibuildmart.com',
    role: 'Employee',
    department: 'Sales',
    designation: 'Sales Intern',
    location: 'RPR',
    status: 'Disabled',
    archivedAt: '2026-08-01 10:00:00',
    archivedBy: 'Misr Pr (Super Admin)',
    archivedByEmail: 'misrpr@rathibuildmart.com',
    archiveReason: 'Internship contract concluded'
  }
];


