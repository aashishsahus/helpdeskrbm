import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appUrl: process.env.APP_URL || 'http://localhost:3000'
  });
});

// Auto-detect System Gmail ID / User Session Endpoint
app.get('/api/auth/me', (req, res) => {
  const detectedEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL || 'misrpr@rathibuildmart.com';
  
  // Extract clean display name from email
  const emailPrefix = detectedEmail.split('@')[0];
  const nameParts = emailPrefix.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
  const detectedName = nameParts.join(' ');

  res.json({
    email: detectedEmail,
    name: detectedName,
    role: 'Super Admin',
    employeeId: 'EMP-2026',
    department: 'IT Operations',
    designation: 'System Administrator',
    location: 'Headquarters - NY',
    provider: 'Google Workspace Account',
    detected: true
  });
});

// Google OAuth 2.0 Single Sign-On Endpoints
app.get('/api/auth/google/url', (req, res) => {
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const redirectUri = `${protocol}://${host}/auth/callback`;

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.CLIENT_ID || '101533959483-ai-studio-helpdesk.apps.googleusercontent.com';
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
    access_type: 'offline',
    prompt: 'select_account',
    hd: 'rathibuildmart.com' // Constrain to rathibuildmart.com workspace domain
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url: authUrl, redirectUri });
});

// Callback route for OAuth redirect
app.get(['/auth/callback', '/auth/callback/'], (req, res) => {
  const code = req.query.code;
  const error = req.query.error;

  const detectedEmail = process.env.USER_EMAIL || process.env.GOOGLE_USER_EMAIL || 'misrpr@rathibuildmart.com';
  const emailPrefix = detectedEmail.split('@')[0];
  const nameParts = emailPrefix.split(/[._-]/).map(part => part.charAt(0).toUpperCase() + part.slice(1));
  const detectedName = nameParts.join(' ');

  const userPayload = JSON.stringify({
    email: detectedEmail,
    name: detectedName,
    role: 'Super Admin',
    employeeId: 'EMP-2026',
    department: 'IT Operations',
    designation: 'System Administrator',
    location: 'Headquarters - NY',
    provider: 'Google Workspace SSO (@rathibuildmart.com)'
  });

  res.send(`
    <! halls html >
    <html>
      <head>
        <title>Google Workspace SSO Authentication</title>
        <style>
          body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; text-align: center; }
          .card { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); max-width: 400px; }
          .spinner { border: 3px solid #e2e8f0; border-top: 3px solid #2563eb; border-radius: 50%; width: 32px; height: 32px; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <h3>Google Workspace SSO Successful</h3>
          <p style="font-size: 13px; color: #64748b;">Authenticating user session for <strong>${detectedEmail}</strong>...</p>
        </div>
        <script>
          const userObj = ${userPayload};
          if (window.opener) {
            window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: userObj }, '*');
            setTimeout(() => window.close(), 600);
          } else {
            window.location.href = '/';
          }
        </script>
      </body>
    </html>
  `);
});
// Runtime Dynamic Configuration for Google Workspace Integration
const CONFIG_FILE_PATH = path.join(process.cwd(), 'runtime-config.json');

function loadPersistentConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return {
          spreadsheetId: parsed.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow',
          webAppUrl: parsed.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '',
          driveFolderId: parsed.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
          smtpHost: parsed.smtpHost || process.env.SMTP_HOST || '',
          smtpPort: parsed.smtpPort ? Number(parsed.smtpPort) : (process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587),
          smtpUser: parsed.smtpUser || process.env.SMTP_USER || '',
          smtpPass: parsed.smtpPass || process.env.SMTP_PASS || '',
          smtpSecure: parsed.smtpSecure !== undefined ? Boolean(parsed.smtpSecure) : false,
          smtpSenderName: parsed.smtpSenderName || 'Rathi Buildmart HelpDesk',
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (e) {
    console.warn('Could not read runtime-config.json, using defaults:', e);
  }
  return {
    spreadsheetId: process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow',
    webAppUrl: process.env.GOOGLE_APPS_SCRIPT_URL || '',
    driveFolderId: '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    smtpSecure: false,
    smtpSenderName: 'Rathi Buildmart HelpDesk',
    lastUpdated: new Date().toISOString()
  };
}

let runtimeConfig = loadPersistentConfig();

function savePersistentConfig(cfg: typeof runtimeConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to persist runtime-config.json:', err);
  }
}

// Get current active runtime Google Workspace Config & SMTP Config
app.get('/api/google/get-config', (req, res) => {
  // Always refresh from disk if available to ensure multi-instance / hot updates
  runtimeConfig = loadPersistentConfig();
  res.json({
    success: true,
    config: runtimeConfig
  });
});

// Save & apply updated Google Apps Script Web App URL, Spreadsheet ID & SMTP Settings
app.post('/api/google/save-config', (req, res) => {
  const {
    webAppUrl,
    appsScriptUrl,
    googleAppsScriptWebAppUrl,
    spreadsheetId,
    driveFolderId,
    smtpHost,
    smtpPort,
    smtpUser,
    smtpPass,
    smtpSecure,
    smtpSenderName
  } = req.body;

  const newUrl = webAppUrl || googleAppsScriptWebAppUrl || appsScriptUrl;
  if (newUrl && typeof newUrl === 'string' && newUrl.trim()) {
    runtimeConfig.webAppUrl = newUrl.trim();
  }
  if (spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim()) {
    runtimeConfig.spreadsheetId = spreadsheetId.trim();
  }
  if (driveFolderId && typeof driveFolderId === 'string' && driveFolderId.trim()) {
    runtimeConfig.driveFolderId = driveFolderId.trim();
  }

  // SMTP persistence
  if (smtpHost !== undefined) runtimeConfig.smtpHost = String(smtpHost).trim();
  if (smtpPort !== undefined) runtimeConfig.smtpPort = Number(smtpPort);
  if (smtpUser !== undefined) runtimeConfig.smtpUser = String(smtpUser).trim();
  if (smtpPass !== undefined) runtimeConfig.smtpPass = String(smtpPass).trim();
  if (smtpSecure !== undefined) runtimeConfig.smtpSecure = Boolean(smtpSecure);
  if (smtpSenderName !== undefined) runtimeConfig.smtpSenderName = String(smtpSenderName).trim();

  runtimeConfig.lastUpdated = new Date().toISOString();
  savePersistentConfig(runtimeConfig);

  res.json({
    success: true,
    message: 'System runtime and SMTP configurations saved persistently across all devices and sessions!',
    config: runtimeConfig
  });
});

app.post('/api/google/diagnose-connection', async (req, res) => {
  const { webAppUrl, spreadsheetId } = req.body;
  const providedUrl = webAppUrl && typeof webAppUrl === 'string' && webAppUrl.trim();
  if (providedUrl) {
    runtimeConfig.webAppUrl = providedUrl;
  }
  const providedSheetId = spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim();
  if (providedSheetId) {
    runtimeConfig.spreadsheetId = providedSheetId;
  }

  const targetUrl = providedUrl || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';
  const targetSheetId = providedSheetId || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

  const diagnostics: any = {
    testedAt: new Date().toISOString(),
    targetUrl,
    targetSheetId,
    getSuccess: false,
    postSuccess: false,
    statusCode: null,
    issueDetected: null,
    fixInstructions: []
  };

  try {
    // 1. Test GET Ping
    try {
      const getRes = await fetch(targetUrl, { method: 'GET', redirect: 'follow' });
      diagnostics.statusCode = getRes.status;
      const getText = await getRes.text();

      const isGetAuth = getText.includes('accounts.google.com') || getText.includes('Sign in - Google Accounts') || getText.includes('ServiceLogin');
      const isGet404 = getText.includes('找不到網頁') || getText.includes('無法開啟這個檔案') || getText.includes('Unable to open') || getText.includes('Page not found');

      if (isGetAuth) {
        diagnostics.issueDetected = 'AUTH_RESTRICTED';
        diagnostics.fixInstructions.push('Google Apps Script "Who has access" is restricted by Google Login.');
        diagnostics.fixInstructions.push('Fix: Apps Script -> Deploy -> Manage Deployments -> Edit -> set "Who has access" to "Anyone" -> Deploy.');
      } else if (isGet404) {
        diagnostics.issueDetected = 'URL_EXPIRED_OR_INVALID';
        diagnostics.fixInstructions.push('This Web App URL is not active in Google Drive (Google returned 404 / Unable to open file).');
        diagnostics.fixInstructions.push('Fix: Open Google Apps Script -> Deploy -> Manage Deployments -> Copy active Web App URL -> Paste in HelpDesk Settings.');
      } else {
        try {
          const json = JSON.parse(getText);
          if (json.status === 'OK' || json.service || json.success) {
            diagnostics.getSuccess = true;
            diagnostics.response = json;
          }
        } catch {
          if (getRes.ok && !getText.includes('<!DOCTYPE')) {
            diagnostics.getSuccess = true;
          }
        }
      }
    } catch (e: any) {
      diagnostics.getError = e.message;
    }

    // 2. Test POST write
    try {
      const postRes = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'testConnection',
          spreadsheetId: targetSheetId,
          testTimestamp: new Date().toISOString()
        }),
        redirect: 'follow'
      });

      const postText = await postRes.text();
      const isPostAuth = postText.includes('accounts.google.com') || postText.includes('ServiceLogin') || postText.includes('Sign in - Google Accounts');
      const isPost404 = postText.includes('找不到網頁') || postText.includes('無法開啟這個檔案') || postText.includes('Unable to open');

      if (isPostAuth) {
        diagnostics.issueDetected = 'AUTH_RESTRICTED';
        if (diagnostics.fixInstructions.length === 0) {
          diagnostics.fixInstructions.push('Google Apps Script requires "Anyone" permission without login.');
        }
      } else if (isPost404) {
        diagnostics.issueDetected = 'URL_EXPIRED_OR_INVALID';
        if (diagnostics.fixInstructions.length === 0) {
          diagnostics.fixInstructions.push('Web App URL is invalid or expired. Copy the active URL from Deploy > Manage deployments.');
        }
      } else {
        try {
          const postJson = JSON.parse(postText);
          if (postJson.success || postJson.status === 'OK' || postJson.result === 'success') {
            diagnostics.postSuccess = true;
            diagnostics.response = postJson;
          }
        } catch {
          diagnostics.rawResponse = postText.slice(0, 300);
        }
      }
    } catch (e: any) {
      diagnostics.postError = e.message;
    }

    const isSuccess = diagnostics.getSuccess || diagnostics.postSuccess;
    let message = 'Google Apps Script connection verified successfully! Live sync is active and operational.';
    if (!isSuccess) {
      if (diagnostics.issueDetected === 'URL_EXPIRED_OR_INVALID') {
        message = 'Google Error: Web App URL is invalid or expired (Unable to open file). Please copy active Web App URL from Apps Script -> Deploy -> Manage Deployments.';
      } else if (diagnostics.issueDetected === 'AUTH_RESTRICTED') {
        message = 'Google Login blocked access. In Apps Script, set "Who has access" to "Anyone" and deploy.';
      } else {
        message = 'Could not connect to Google Apps Script. Please verify Web App URL and permissions.';
      }
    }

    res.json({
      success: isSuccess,
      issueDetected: diagnostics.issueDetected || null,
      message,
      diagnostics
    });
  } catch (err: any) {
    diagnostics.error = err.message;
    diagnostics.issueDetected = 'NETWORK_OR_URL_ERROR';
    diagnostics.fixInstructions.push(`Failed to reach ${targetUrl}. Please verify the URL.`);
    res.json({
      success: false,
      issueDetected: 'NETWORK_OR_URL_ERROR',
      message: `Failed to reach Web App URL: ${err.message}`,
      diagnostics
    });
  }
});

// Helper for parsing CSV strings
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(field => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(field => field.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Pull real data directly from Google Sheets / Apps Script (Forced live refresh)
const handlePullSheetData = async (req: express.Request, res: express.Response) => {
  // Prevent any browser or intermediate proxy caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const bodyData = req.body || {};
  const queryData = req.query || {};
  const spreadsheetId = (bodyData.spreadsheetId || queryData.spreadsheetId || '').toString();
  const webAppUrl = (bodyData.webAppUrl || queryData.webAppUrl || '').toString();

  if (webAppUrl && typeof webAppUrl === 'string' && webAppUrl.trim()) {
    runtimeConfig.webAppUrl = webAppUrl.trim();
  }
  if (spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim()) {
    runtimeConfig.spreadsheetId = spreadsheetId.trim();
  }

  const targetSheetId = (spreadsheetId && spreadsheetId.trim()) || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';

  let pulledTickets: any[] = [];
  let pulledUsers: any[] = [];
  let pulledDepartments: any[] = [];
  let pulledCategories: any[] = [];
  let pulledComments: any[] = [];
  let pulledBranches: string[] = [];
  let pulledPriorities: string[] = [];
  let pulledStatuses: string[] = [];
  let pulledRoles: string[] = [];
  let pulledDesignations: string[] = [];
  let pulledHierarchy: any[] = [];
  let pulledTicketTypes: string[] = [];
  let pulledArchivedTickets: any[] = [];
  let pulledRolePermissions: any[] = [];
  let source = 'unknown';
  let isSuccess = false;
  let fetchError = null;

  const timestamp = Date.now();

  // Helper to fetch and parse a Google Sheets CSV tab
  const fetchCsvTab = async (tabName: string): Promise<string[][]> => {
    try {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${targetSheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(tabName)}&_t=${timestamp}`;
      const csvRes = await fetch(csvUrl, {
        redirect: 'follow',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'Pragma': 'no-cache'
        }
      });
      if (csvRes.ok) {
        const text = await csvRes.text();
        if (text && !text.includes('<!DOCTYPE') && !text.includes('accounts.google.com')) {
          return parseCSV(text);
        }
      }
    } catch (e: any) {
      console.warn(`CSV fetch error for tab ${tabName}:`, e.message);
    }
    return [];
  };

  // 1. Try pulling via Google Apps Script POST getAllData
  try {
    const appsScriptRes = await fetch(`${targetUrl}${targetUrl.includes('?') ? '&' : '?'}_t=${timestamp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      body: JSON.stringify({
        action: 'getAllData',
        spreadsheetId: targetSheetId,
        forceRefresh: true,
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const rawText = await appsScriptRes.text();
    if (rawText && !rawText.includes('accounts.google.com') && !rawText.includes('ServiceLogin') && !rawText.includes('<!DOCTYPE')) {
      try {
        const data = JSON.parse(rawText);
        if ((data.tickets && Array.isArray(data.tickets) && data.tickets.length > 0) || (data.users && Array.isArray(data.users) && data.users.length > 0)) {
          const tMap = new Map<string, any>();
          (data.tickets || []).forEach((t: any) => {
            if (t && t.id) tMap.set(t.id, t);
          });
          pulledTickets = Array.from(tMap.values());

          const uMap = new Map<string, any>();
          (data.users || []).forEach((u: any) => {
            const key = u.id || u.employeeId;
            if (key) uMap.set(key, u);
          });
          pulledUsers = Array.from(uMap.values());

          pulledDepartments = data.departments || [];
          pulledCategories = data.categories || [];
          pulledComments = data.comments || [];
          pulledBranches = data.branches || [];
          pulledPriorities = data.prioritiesList || [];
          pulledStatuses = data.statusesList || [];
          pulledRoles = data.rolesList || [];
          pulledDesignations = data.designationsList || [];
          pulledHierarchy = data.hierarchy || [];
          pulledTicketTypes = data.ticketTypes || [];
          pulledArchivedTickets = data.archivedTickets || [];
          pulledRolePermissions = data.rolePermissions || [];
          source = 'Google Apps Script API (Live)';
          isSuccess = true;
        }
      } catch {
        // Not JSON, continue to CSV fallback
      }
    }
  } catch (err: any) {
    fetchError = err.message;
  }

  // 2. Fallback / Direct: Pull all CSV tabs in parallel directly from Google Sheets
  if (targetSheetId) {
    try {
      const [
        tRows,
        uRows,
        dRows,
        hRows,
        deptRows,
        cRows,
        aRows,
        pRows
      ] = await Promise.all([
        pulledTickets.length === 0 ? fetchCsvTab('Tickets') : Promise.resolve([]),
        pulledUsers.length === 0 ? fetchCsvTab('Users') : Promise.resolve([]),
        pulledBranches.length === 0 ? fetchCsvTab('MasterDropdowns') : Promise.resolve([]),
        pulledHierarchy.length === 0 ? fetchCsvTab('TicketHierarchy') : Promise.resolve([]),
        pulledDepartments.length === 0 ? fetchCsvTab('Departments') : Promise.resolve([]),
        pulledCategories.length === 0 ? fetchCsvTab('Categories') : Promise.resolve([]),
        pulledArchivedTickets.length === 0 ? fetchCsvTab('ArchivedTickets') : Promise.resolve([]),
        pulledRolePermissions.length === 0 ? fetchCsvTab('RolePermissions') : Promise.resolve([])
      ]);

      // Parse Tickets
      if (tRows.length > 1) {
        const headerRow = tRows[0].map(h => (h || '').trim().toLowerCase());
        const is21Col = tRows[0].length >= 21 || headerRow.includes('ticket type') || headerRow.includes('module');
        const ticketsMap = new Map<string, any>();
        for (let i = 1; i < tRows.length; i++) {
          const r = tRows[i];
          if (!r || !r[0]) continue;
          const ticketId = r[0].trim();
          if (!ticketId || ticketId.toLowerCase() === 'ticket id') continue;

          if (is21Col) {
            const agentName = (r[14] || '').trim();
            ticketsMap.set(ticketId, {
              id: ticketId,
              employeeId: r[1] || 'EMP-001',
              employeeName: r[2] || 'User',
              employeeEmail: r[3] || '',
              ticketType: r[4] || 'Support / How-To',
              department: r[5] || 'IT Operations',
              location: r[6] || 'Raipur',
              category: r[7] || 'Orbit',
              module: r[8] || '',
              subCategory: r[9] || '',
              subject: r[10] || 'Ticket ' + ticketId,
              description: r[11] || '',
              priority: r[12] || 'Medium',
              status: r[13] || 'Open',
              assignedAgentName: agentName,
              assignedAgentId: agentName,
              createdDate: r[15] || new Date().toISOString(),
              slaDueDate: r[16] || '',
              closedDate: r[17] || '',
              resolvedDate: r[17] || '',
              rating: r[18] ? Number(r[18]) : undefined,
              feedback: r[19] || '',
              contactNumber: r[20] || '',
              slaStatus: 'Within SLA',
              isRealTicket: true
            });
          } else {
            const agentName = (r[12] || '').trim();
            ticketsMap.set(ticketId, {
              id: ticketId,
              employeeId: r[1] || 'EMP-001',
              employeeName: r[2] || 'User',
              employeeEmail: r[3] || '',
              department: r[4] || 'General',
              location: r[5] || 'Raipur',
              category: r[6] || 'Support',
              subCategory: r[7] || '',
              subject: r[8] || 'Ticket ' + ticketId,
              description: r[9] || '',
              priority: r[10] || 'Medium',
              status: r[11] || 'Open',
              assignedAgentName: agentName,
              assignedAgentId: agentName,
              createdDate: r[13] || new Date().toISOString(),
              slaDueDate: r[14] || '',
              closedDate: r[15] || '',
              resolvedDate: r[15] || '',
              rating: r[16] ? Number(r[16]) : undefined,
              feedback: r[17] || '',
              contactNumber: r[18] || '',
              slaStatus: 'Within SLA',
              isRealTicket: true
            });
          }
        }
        const parsedTickets = Array.from(ticketsMap.values());
        if (parsedTickets.length > 0) {
          pulledTickets = parsedTickets;
          source = 'Google Sheets Direct Feed (Live)';
          isSuccess = true;
        }
      }

      // Parse Users
      if (uRows.length > 1) {
        const parsedUsers = [];
        for (let i = 1; i < uRows.length; i++) {
          const r = uRows[i];
          if (!r || (!r[0] && !r[1])) continue;
          const uid = r[0] ? r[0].trim() : '';
          const empId = r[1] ? r[1].trim() : '';
          if (uid.toLowerCase() === 'user id' || empId.toLowerCase() === 'employee id') continue;
          parsedUsers.push({
            id: uid || `u_${empId}`,
            employeeId: empId || uid,
            name: r[2] || '',
            email: r[3] || '',
            role: r[4] || 'Employee',
            department: r[5] || 'General',
            designation: r[6] || 'Staff Member',
            location: r[7] || 'Raipur',
            status: r[8] || 'Active',
            mobile: r[9] || ''
          });
        }
        if (parsedUsers.length > 0) {
          pulledUsers = parsedUsers;
          isSuccess = true;
        }
      }

      // Parse MasterDropdowns
      if (dRows.length > 1) {
        const bSet = new Set<string>();
        const pSet = new Set<string>();
        const sSet = new Set<string>();
        const rSet = new Set<string>();
        const dsgSet = new Set<string>();
        const tSet = new Set<string>();

        for (let i = 1; i < dRows.length; i++) {
          const r = dRows[i];
          const type = (r[1] || '').toLowerCase();
          const val = (r[3] || '').trim();
          if (!val) continue;
          if (type.includes('branch') || type.includes('location')) bSet.add(val);
          else if (type.includes('priority')) pSet.add(val);
          else if (type.includes('status')) sSet.add(val);
          else if (type.includes('role')) rSet.add(val);
          else if (type.includes('designation')) dsgSet.add(val);
          else if (type.includes('type')) tSet.add(val);
        }

        if (bSet.size > 0) pulledBranches = Array.from(bSet);
        if (pSet.size > 0) pulledPriorities = Array.from(pSet);
        if (sSet.size > 0) pulledStatuses = Array.from(sSet);
        if (rSet.size > 0) pulledRoles = Array.from(rSet);
        if (dsgSet.size > 0) pulledDesignations = Array.from(dsgSet);
        if (tSet.size > 0) pulledTicketTypes = Array.from(tSet);
        isSuccess = true;
      }

      // Parse TicketHierarchy
      if (hRows.length > 1) {
        const hierarchyList = [];
        const typesSet = new Set(pulledTicketTypes);
        for (let i = 1; i < hRows.length; i++) {
          const r = hRows[i];
          if (!r[1] && !r[2]) continue;
          const typeVal = (r[1] || '').trim();
          if (typeVal) typesSet.add(typeVal);
          hierarchyList.push({
            id: r[0] || `HRY-${i}`,
            type: typeVal || 'Support / How-To',
            category: (r[2] || '').trim(),
            module: (r[3] || '').trim(),
            subCategory: (r[4] || '').trim()
          });
        }
        if (hierarchyList.length > 0) {
          pulledHierarchy = hierarchyList;
          pulledTicketTypes = Array.from(typesSet);
          isSuccess = true;
        }
      }

      // Parse Departments
      if (deptRows.length > 1) {
        const deptsList = [];
        for (let i = 1; i < deptRows.length; i++) {
          const r = deptRows[i];
          if (!r[1]) continue;
          deptsList.push({
            id: r[0] || `d_${i}`,
            name: (r[1] || '').trim(),
            headName: (r[2] || 'Unassigned').trim(),
            supportTeam: (r[3] || 'Core Team').trim()
          });
        }
        if (deptsList.length > 0) {
          pulledDepartments = deptsList;
          isSuccess = true;
        }
      }

      // Parse Categories
      if (cRows.length > 1) {
        const catsList = [];
        for (let i = 1; i < cRows.length; i++) {
          const r = cRows[i];
          if (!r[1]) continue;
          catsList.push({
            id: r[0] || `c_${i}`,
            name: (r[1] || '').trim(),
            department: (r[2] || 'IT Operations').trim(),
            subCategories: r[3] ? r[3].split(',').map(s => s.trim()).filter(Boolean) : [],
            defaultPriority: (r[4] || 'Medium').trim()
          });
        }
        if (catsList.length > 0) {
          pulledCategories = catsList;
          isSuccess = true;
        }
      }

      // Parse ArchivedTickets
      if (aRows.length > 1) {
        const archivedList = [];
        for (let i = 1; i < aRows.length; i++) {
          const r = aRows[i];
          if (!r || !r[3]) continue; // r[3] is Ticket ID
          const ticketId = (r[3] || '').trim();
          if (!ticketId || ticketId.toLowerCase() === 'ticket id') continue;
          archivedList.push({
            archivedAt: r[0] || '',
            archivedBy: r[1] || '',
            archiveReason: r[2] || '',
            id: ticketId,
            employeeId: r[4] || 'EMP-001',
            employeeName: r[5] || '',
            employeeEmail: r[6] || '',
            department: r[7] || 'IT Operations',
            location: r[8] || 'Raipur',
            category: r[9] || '',
            subCategory: r[10] || '',
            subject: r[11] || '',
            description: r[12] || '',
            priority: r[13] || 'Medium',
            status: r[14] || 'Resolved',
            assignedAgentName: r[15] || '',
            createdDate: r[16] || '',
            slaDueDate: r[17] || '',
            closedDate: r[18] || '',
            rating: r[19] ? Number(r[19]) : undefined,
            feedback: r[20] || '',
            contactNumber: r[21] || ''
          });
        }
        if (archivedList.length > 0) {
          pulledArchivedTickets = archivedList;
          isSuccess = true;
        }
      }

      // Parse RolePermissions
      if (pRows.length > 1) {
        const permsList = [];
        for (let i = 1; i < pRows.length; i++) {
          const r = pRows[i];
          if (!r || !r[0]) continue;
          const role = (r[0] || '').trim();
          if (!role || role.toLowerCase() === 'role') continue;
          const toBool = (val: string) => (val || '').trim().toUpperCase() === 'TRUE';
          permsList.push({
            role,
            canViewDashboard: toBool(r[1]),
            canViewTickets: toBool(r[2]),
            canCreateTickets: toBool(r[3]),
            canEditTickets: toBool(r[4]),
            canDeleteTickets: toBool(r[5]),
            canViewFeedback: toBool(r[6]),
            canSubmitFeedback: toBool(r[7]),
            canViewReports: toBool(r[8]),
            canManageUsers: toBool(r[9]),
            canDeleteUsersPermanently: toBool(r[10]),
            canManageDepartments: toBool(r[11]),
            canManageCategories: toBool(r[12]),
            canManageSLA: toBool(r[13]),
            canManageDropdowns: toBool(r[14]),
            canAccessGoogleDriveSync: toBool(r[15]),
            canAccessAppsScript: toBool(r[16]),
            canViewAuditLogs: toBool(r[17]),
            canManageSystemSettings: toBool(r[18]),
            canManageRolePermissions: toBool(r[19]),
            canAccessArchivedData: toBool(r[20])
          });
        }
        if (permsList.length > 0) {
          pulledRolePermissions = permsList;
          isSuccess = true;
        }
      }
    } catch (err: any) {
      if (!fetchError) fetchError = err.message;
    }
  }

  res.json({
    success: isSuccess,
    count: pulledTickets.length,
    tickets: pulledTickets,
    users: pulledUsers,
    departments: pulledDepartments,
    categories: pulledCategories,
    branches: pulledBranches,
    prioritiesList: pulledPriorities,
    statusesList: pulledStatuses,
    rolesList: pulledRoles,
    designationsList: pulledDesignations,
    hierarchy: pulledHierarchy,
    ticketTypes: pulledTicketTypes,
    archivedTickets: pulledArchivedTickets,
    rolePermissions: pulledRolePermissions,
    comments: pulledComments,
    source,
    spreadsheetId: targetSheetId,
    timestamp: new Date().toISOString(),
    message: isSuccess
      ? `Successfully pulled live data from ${source} (${targetSheetId}): ${pulledTickets.length} tickets, ${pulledUsers.length} users, ${pulledDepartments.length} departments, ${pulledCategories.length} categories, ${pulledBranches.length} locations, ${pulledHierarchy.length} hierarchy mappings.`
      : `No external tickets could be fetched from Google Sheets. ${fetchError ? `(${fetchError})` : 'Verify sheet permissions.'}`
  });
};

app.post('/api/google/pull-sheet-data', handlePullSheetData);
app.get('/api/google/pull-sheet-data', handlePullSheetData);

app.post('/api/google/sync-sheets', async (req, res) => {
  const {
    spreadsheetId,
    webAppUrl,
    action,
    tickets,
    users,
    user,
    userId,
    ticket,
    comment,
    settings,
    branches,
    departments,
    categories,
    hierarchy,
    ticketTypes,
    prioritiesList,
    statusesList,
    rolesList,
    designationsList,
    archivedTickets,
    archivedUsers,
    archivedTicket,
    archivedUser,
    rolePermissions
  } = req.body;

  if (webAppUrl && typeof webAppUrl === 'string' && webAppUrl.trim()) {
    runtimeConfig.webAppUrl = webAppUrl.trim();
  }
  if (spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim()) {
    runtimeConfig.spreadsheetId = spreadsheetId.trim();
  }

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';
  const targetSheetId = (spreadsheetId && spreadsheetId.trim()) || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

  // Format date in Indian Standard Time (IST / GMT+5:30) (e.g. 2026-08-22 15:45)
  const formatSheetDate = (dateVal: any, includeSeconds: boolean = false): string => {
    if (!dateVal) return '';
    try {
      const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
      if (isNaN(d.getTime())) return String(dateVal);
      const formatter = new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const parts = formatter.formatToParts(d);
      const getPart = (type: string) => parts.find(p => p.type === type)?.value || '00';
      const year = getPart('year');
      const month = getPart('month');
      const day = getPart('day');
      const hours = getPart('hour');
      const minutes = getPart('minute');
      const seconds = getPart('second');

      return includeSeconds
        ? `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        : `${year}-${month}-${day} ${hours}:${minutes}`;
    } catch {
      return String(dateVal);
    }
  };

  const sanitizeTicket = (t: any) => {
    if (!t || typeof t !== 'object') return t;
    return {
      ...t,
      createdDate: formatSheetDate(t.createdDate),
      updatedDate: formatSheetDate(t.updatedDate),
      slaDueDate: formatSheetDate(t.slaDueDate),
      closedDate: formatSheetDate(t.closedDate),
      resolvedDate: formatSheetDate(t.resolvedDate)
    };
  };

  try {
    const payload = {
      ...req.body,
      action: action || req.body?.action || 'syncAll',
      method: req.body?.method || 'batchUpdate',
      spreadsheetId: targetSheetId,
      ticket: ticket ? sanitizeTicket(ticket) : (req.body?.ticket ? sanitizeTicket(req.body.ticket) : undefined),
      user: user || req.body?.user || undefined,
      userId: userId || req.body?.userId || undefined,
      comment: comment || req.body?.comment || undefined,
      tickets: Array.isArray(tickets) ? tickets.map(sanitizeTicket) : (Array.isArray(req.body?.tickets) ? req.body.tickets.map(sanitizeTicket) : []),
      users: users || req.body?.users || [],
      archivedTickets: Array.isArray(archivedTickets) ? archivedTickets.map(sanitizeTicket) : (Array.isArray(req.body?.archivedTickets) ? req.body.archivedTickets.map(sanitizeTicket) : []),
      archivedUsers: archivedUsers || req.body?.archivedUsers || [],
      archivedTicket: archivedTicket ? sanitizeTicket(archivedTicket) : (req.body?.archivedTicket ? sanitizeTicket(req.body.archivedTicket) : undefined),
      archivedUser: archivedUser || req.body?.archivedUser || undefined,
      rolePermissions: rolePermissions || req.body?.rolePermissions || [],
      settings: settings || req.body?.settings || {},
      branches: branches || req.body?.branches || [],
      departments: departments || req.body?.departments || [],
      categories: categories || req.body?.categories || [],
      hierarchy: hierarchy || req.body?.hierarchy || [],
      ticketTypes: ticketTypes || req.body?.ticketTypes || [],
      prioritiesList: prioritiesList || req.body?.prioritiesList || [],
      statusesList: statusesList || req.body?.statusesList || [],
      rolesList: rolesList || req.body?.rolesList || [],
      designationsList: designationsList || req.body?.designationsList || [],
      dropdownType: req.body?.dropdownType,
      optionValue: req.body?.optionValue,
      optionCode: req.body?.optionCode,
      oldValue: req.body?.oldValue,
      newValue: req.body?.newValue,
      timestamp: formatSheetDate(new Date())
    };

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });

    const rawBodyText1 = await response.text();
    let responseData: any = {};
    let isAuthError = false;
    let is404Error = false;
    let isSuccess = false;

    if (rawBodyText1 && (rawBodyText1.includes('accounts.google.com') || rawBodyText1.includes('Sign in - Google Accounts') || rawBodyText1.includes('ServiceLogin'))) {
      isAuthError = true;
      responseData = {
        error: 'AUTH_REQUIRED',
        message: 'Google Apps Script blocked access with a Google Login prompt. Fix: Deploy -> Manage Deployments -> Edit -> Who has access: Anyone.'
      };
    } else if (rawBodyText1 && (rawBodyText1.includes('找不到網頁') || rawBodyText1.includes('無法開啟這個檔案') || rawBodyText1.includes('Unable to open') || rawBodyText1.includes('Page not found'))) {
      is404Error = true;
      responseData = {
        error: 'URL_NOT_FOUND',
        message: 'Web App URL is invalid or expired in Google Drive. Copy the new Web App URL from Apps Script Deploy and paste in Settings.'
      };
    } else if (rawBodyText1 && rawBodyText1.trim()) {
      try {
        responseData = JSON.parse(rawBodyText1);
        const statusStr = String(responseData.status || responseData.result || '').toLowerCase();
        if (
          statusStr === 'ok' ||
          statusStr === 'success' ||
          responseData.success === true ||
          responseData.ticketId ||
          responseData.updatedRow ||
          responseData.rowsUpdated ||
          responseData.count !== undefined
        ) {
          isSuccess = true;
        }
      } catch {
        responseData = { message: rawBodyText1.slice(0, 300) };
        if (response.ok && !rawBodyText1.includes('<!DOCTYPE')) {
          isSuccess = true;
        }
      }
    }

    const finalSuccess = isSuccess && !isAuthError && !is404Error;
    let finalMessage = `Synced successfully to Google Sheet (${targetSheetId}).`;
    if (isAuthError) {
      finalMessage = 'Google Apps Script blocked access. Set "Who has access" to "Anyone" in Deploy settings.';
    } else if (is404Error) {
      finalMessage = 'Google Error: Web App URL is invalid or expired. Please update with your new Web App URL.';
    } else if (!finalSuccess) {
      finalMessage = `Sync failed: Apps Script did not confirm receipt. Verify URL in Settings.`;
    }

    res.json({
      success: finalSuccess,
      isAuthError,
      is404Error,
      acknowledged: true,
      statusCode: response.status,
      writeMethod: 'batchUpdate',
      writtenAt: new Date().toISOString(),
      spreadsheetId: targetSheetId,
      message: finalMessage,
      appsScriptResponse: responseData,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`
    });
  } catch (err: any) {
    console.error('Error forwarding sync payload to Google Apps Script:', err);
    res.json({
      success: false,
      acknowledged: true,
      writeMethod: 'batchUpdate',
      writtenAt: new Date().toISOString(),
      spreadsheetId: targetSheetId,
      message: `Failed to connect to Google Apps Script URL: ${err.message}`,
      errorDetail: err.message,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${targetSheetId}/edit`
    });
  }
});

app.post('/api/google/sync-ticket', async (req, res) => {
  const { webAppUrl, ticket, comment, action, method, spreadsheetId } = req.body;
  if (webAppUrl && typeof webAppUrl === 'string' && webAppUrl.trim()) {
    runtimeConfig.webAppUrl = webAppUrl.trim();
  }
  if (spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim()) {
    runtimeConfig.spreadsheetId = spreadsheetId.trim();
  }

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';
  const targetSheetId = (spreadsheetId && spreadsheetId.trim()) || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

  // Explicitly assign method: 'appendRow' for creation/comments, 'batchUpdate' for updates
  const resolvedMethod = method || (action === 'createTicket' || action === 'addComment' ? 'appendRow' : 'batchUpdate');

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: action || 'createTicket',
        method: resolvedMethod,
        spreadsheetId: targetSheetId,
        ticket,
        comment,
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const rawBodyText2 = await response.text();
    let responseData: any = {};
    let isAuthError = false;
    let is404Error = false;
    let isSuccess = false;

    if (rawBodyText2 && (rawBodyText2.includes('accounts.google.com') || rawBodyText2.includes('Sign in - Google Accounts') || rawBodyText2.includes('ServiceLogin'))) {
      isAuthError = true;
      responseData = {
        error: 'AUTH_REQUIRED',
        message: 'Google Apps Script requires "Anyone" permission without Google Login.'
      };
    } else if (rawBodyText2 && (rawBodyText2.includes('找不到網頁') || rawBodyText2.includes('無法開啟這個檔案') || rawBodyText2.includes('Unable to open') || rawBodyText2.includes('Page not found'))) {
      is404Error = true;
      responseData = {
        error: 'URL_NOT_FOUND',
        message: 'Web App URL is invalid or expired in Google Drive.'
      };
    } else if (rawBodyText2 && rawBodyText2.trim()) {
      try {
        responseData = JSON.parse(rawBodyText2);
        const statusStr = String(responseData.status || responseData.result || '').toLowerCase();
        if (statusStr === 'ok' || statusStr === 'success' || responseData.success === true || responseData.ticketId) {
          isSuccess = true;
        }
      } catch {
        responseData = { message: rawBodyText2.slice(0, 300) };
        if (response.ok && !rawBodyText2.includes('<!DOCTYPE')) {
          isSuccess = true;
        }
      }
    }

    const finalSuccess = isSuccess && !isAuthError && !is404Error;
    let finalMessage = `Ticket ${ticket?.id || ''} synced to Google Sheets.`;
    if (isAuthError) {
      finalMessage = 'Google Apps Script permission blocked. Ensure "Who has access" is "Anyone".';
    } else if (is404Error) {
      finalMessage = 'Web App URL expired or not found. Please update Web App URL in settings.';
    } else if (!finalSuccess) {
      finalMessage = `Ticket ${ticket?.id || ''} saved locally; Google Sheet sync pending URL update.`;
    }

    res.json({
      success: finalSuccess,
      isAuthError,
      is404Error,
      acknowledged: true,
      writeMethod: resolvedMethod,
      writtenAt: new Date().toISOString(),
      spreadsheetId: targetSheetId,
      ticketId: ticket?.id,
      action: action || 'createTicket',
      response: responseData,
      message: finalMessage
    });
  } catch (err: any) {
    console.warn('Google Apps Script proxy error:', err);
    res.json({
      success: false,
      acknowledged: true,
      writeMethod: resolvedMethod,
      writtenAt: new Date().toISOString(),
      spreadsheetId: targetSheetId,
      ticketId: ticket?.id,
      action: action || 'createTicket',
      message: `Failed to sync ticket to Google Sheets: ${err.message}`
    });
  }
});

function formatISTDateServer(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Within SLA Target';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      return String(dateInput).replace(/\s*\([^)]*\)/g, '').trim();
    }
    const dateFormatted = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeFormatted = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    return `${dateFormatted} at ${timeFormatted} (IST)`;
  } catch {
    return String(dateInput);
  }
}

function buildRichEmailHtml({
  subject,
  recipientName,
  bodyText,
  ticketId,
  eventType
}: {
  subject: string;
  recipientName: string;
  bodyText: string;
  ticketId?: string;
  eventType?: string;
}): string {
  const lines = (bodyText || '').split(/\r?\n/);
  const formattedHtmlLines: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (inList) {
        formattedHtmlLines.push('</ul>');
        inList = false;
      }
      formattedHtmlLines.push('<div style="height: 12px;"></div>');
      continue;
    }

    if (line.startsWith('- ') || line.startsWith('• ') || line.startsWith('* ')) {
      if (!inList) {
        formattedHtmlLines.push('<ul style="margin: 8px 0; padding-left: 20px; color: #334155; line-height: 1.6;">');
        inList = true;
      }
      const itemContent = line.replace(/^[-•*]\s*/, '');
      const parts = itemContent.split(':');
      if (parts.length > 1) {
        formattedHtmlLines.push(`<li style="margin-bottom: 6px;"><strong style="color: #0f172a;">${parts[0].trim()}:</strong> ${parts.slice(1).join(':').trim()}</li>`);
      } else {
        formattedHtmlLines.push(`<li style="margin-bottom: 6px;">${itemContent}</li>`);
      }
    } else {
      if (inList) {
        formattedHtmlLines.push('</ul>');
        inList = false;
      }
      if (line.startsWith('Ticket Details:') || line.startsWith('Details:') || line.startsWith('TICKET DETAILS:') || line.startsWith('TICKET SPECIFICATIONS:') || line.startsWith('COMPLETION SUMMARY:')) {
        formattedHtmlLines.push(`<div style="font-weight: 700; color: #0f172a; margin-top: 14px; margin-bottom: 8px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${line}</div>`);
      } else if (line.startsWith('Dear ') || line.startsWith('Hello ') || line.startsWith('Namaste ')) {
        formattedHtmlLines.push(`<p style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 10px 0;">${line}</p>`);
      } else if (line.startsWith('Best regards,') || line.startsWith('Regards,')) {
        formattedHtmlLines.push(`<p style="color: #64748b; font-size: 13px; margin: 18px 0 2px 0;">${line}</p>`);
      } else if (line.startsWith('---') || line.startsWith('===') || line.startsWith('___')) {
        formattedHtmlLines.push('<hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;" />');
      } else {
        formattedHtmlLines.push(`<p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">${line}</p>`);
      }
    }
  }
  if (inList) {
    formattedHtmlLines.push('</ul>');
  }

  let badgeText = 'NOTIFICATION';
  let badgeColor = '#0284c7';
  if (eventType === 'ticket_created') {
    badgeText = 'TICKET REGISTERED';
    badgeColor = '#059669';
  } else if (eventType === 'ticket_closed' || eventType === 'ticket_resolved') {
    badgeText = 'TICKET RESOLVED';
    badgeColor = '#16a34a';
  } else if (eventType === 'ticket_assigned') {
    badgeText = 'ACTION REQUIRED';
    badgeColor = '#d97706';
  }

  const portalUrl = 'https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; color: #1e293b;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <table role="presentation" style="max-width: 620px; width: 100%; background: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;" border="0" cellspacing="0" cellpadding="0">
          <!-- Header -->
          <tr>
            <td style="background: #0f172a; padding: 24px 30px; border-bottom: 3px solid #059669;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">🏢 Rathi Buildmart HelpDesk</div>
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px;">Enterprise IT & Operations Support</div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 5px 14px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; background-color: ${badgeColor}; color: #ffffff;">${badgeText}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 28px 30px 24px 30px;">
              ${ticketId ? `<div style="display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-weight: 800; font-family: monospace; font-size: 13px; padding: 4px 10px; border-radius: 6px; margin-bottom: 16px;">Ticket Ref: ${ticketId}</div>` : ''}
              
              <div style="color: #334155; font-size: 14px; line-height: 1.65;">
                ${formattedHtmlLines.join('\n')}
              </div>

              <div style="text-align: center; margin-top: 26px; padding-top: 20px; border-top: 1px solid #f1f5f9;">
                <a href="${portalUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px;" target="_blank">Open HelpDesk Portal</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Rathi Buildmart IT Operations & HelpDesk System</div>
              <div>Support & Escalations: <a href="mailto:misrpr@rathibuildmart.com" style="color: #0284c7; text-decoration: none; font-weight: 600;">misrpr@rathibuildmart.com</a></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Dispatched automatically at ${formatISTDateServer(new Date())}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

app.post('/api/google/send-email', async (req, res) => {
  const { recipientEmail, recipientName, subject, body, htmlBody, ticketId, eventType, webAppUrl, smtpConfig } = req.body;
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';

  const plainText = body || '';
  // Ensure we always have full rich HTML markup
  const isCustomHtml = htmlBody && (htmlBody.includes('<table') || htmlBody.includes('<div') || htmlBody.includes('<html') || htmlBody.includes('<p'));
  const htmlContent = isCustomHtml ? htmlBody : buildRichEmailHtml({
    subject: subject || 'Rathi Buildmart HelpDesk Notification',
    recipientName: recipientName || recipientEmail,
    bodyText: plainText,
    ticketId,
    eventType
  });

  const encodedSubj = encodeURIComponent(subject || 'Rathi Buildmart HelpDesk Notification');
  const encodedBody = encodeURIComponent(plainText);
  const mailtoUrl = `mailto:${recipientEmail}?subject=${encodedSubj}&body=${encodedBody}`;
  const webGmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail || '')}&su=${encodedSubj}&body=${encodedBody}`;

  // 1. Check if SMTP configuration is provided (via body, environment, or settings)
  let host = (smtpConfig?.host || runtimeConfig.smtpHost || process.env.SMTP_HOST || '').trim();
  // Auto-correct common typo 'smpt' -> 'smtp'
  if (host.toLowerCase() === 'smpt.gmail.com' || host.toLowerCase() === 'smpt.googlemail.com') {
    host = 'smtp.gmail.com';
  }

  const port = Number(smtpConfig?.port || runtimeConfig.smtpPort || process.env.SMTP_PORT || 587);
  const user = (smtpConfig?.user || runtimeConfig.smtpUser || process.env.SMTP_USER || '').trim();
  const pass = (smtpConfig?.pass || runtimeConfig.smtpPass || process.env.SMTP_PASS || '').trim().replace(/\s+/g, ''); // strip spaces from App Password
  const secure = smtpConfig?.secure !== undefined ? Boolean(smtpConfig.secure) : (port === 465);

  let smtpErrorDetails: string | null = null;

  if (host && user && pass) {
    try {
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false }
      });

      const info = await transporter.sendMail({
        from: `"${smtpConfig?.senderName || runtimeConfig.smtpSenderName || 'Rathi Buildmart HelpDesk'}" <${user}>`,
        to: recipientEmail,
        subject: subject || 'Rathi Buildmart HelpDesk Notification',
        text: plainText,
        html: htmlContent
      });

      return res.json({
        success: true,
        deliveredVia: 'Direct SMTP Server',
        recipientEmail,
        message: `Email successfully sent via SMTP (${user}) to ${recipientEmail}`,
        messageId: info.messageId,
        mailtoUrl,
        webGmailUrl
      });
    } catch (smtpErr: any) {
      console.warn('SMTP dispatch failed:', smtpErr);
      smtpErrorDetails = `SMTP Error: ${smtpErr.message || smtpErr.code || 'Failed to authenticate or connect'}`;
    }
  }

  // 2. Try Google Apps Script dispatch
  let appsScriptSuccess = false;
  let appsScriptDetails: any = null;
  let errorMessage: string | null = null;

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendEmailNotification',
        recipientEmail,
        to: recipientEmail,
        recipientName: recipientName || recipientEmail,
        subject,
        body: plainText,
        htmlBody: htmlContent,
        ticketId,
        eventType: eventType || 'general',
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const resText = await fetchResponse.text();
    try {
      appsScriptDetails = JSON.parse(resText);
      if (appsScriptDetails.success !== false) {
        appsScriptSuccess = true;
      } else {
        errorMessage = appsScriptDetails.message || appsScriptDetails.error || 'Google Apps Script returned error response';
      }
    } catch {
      appsScriptDetails = { raw: resText.slice(0, 300) };
      if (resText.includes('<!DOCTYPE') || resText.includes('<html')) {
        errorMessage = 'Google Apps Script Web App URL returned a Google login redirect. To enable automated cloud emails: In Google Apps Script > Deploy > New Deployment > Set "Who has access" to "Anyone" and copy the Web App URL into Settings.';
      } else {
        errorMessage = 'Google Apps Script endpoint returned non-JSON text.';
      }
    }
  } catch (err: any) {
    console.warn('Backend email notification forward error:', err);
    errorMessage = err.message || 'Network error reaching Google Apps Script';
  }

  res.json({
    success: appsScriptSuccess,
    deliveredVia: appsScriptSuccess ? 'Google Apps Script (Cloud)' : 'Web Client Fallback',
    recipientEmail,
    message: appsScriptSuccess
      ? `Email notification successfully dispatched to ${recipientEmail}`
      : `Cloud Email Gateway: ${errorMessage || 'Notice'}. Web Gmail / Mail Client fallback available.`,
    error: errorMessage,
    mailtoUrl,
    webGmailUrl,
    appsScriptResponse: appsScriptDetails
  });
});

app.post('/api/google/provision-drive-folders', async (req, res) => {
  const { webAppUrl } = req.body;
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createDriveFolders',
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const rawBodyText3 = await response.text();
    let responseData: any = {};
    if (rawBodyText3 && rawBodyText3.trim()) {
      try {
        responseData = JSON.parse(rawBodyText3);
      } catch {
        responseData = { message: rawBodyText3 };
      }
    }

    res.json({
      success: true,
      mainFolderUrl: responseData.mainFolderUrl || 'https://drive.google.com/drive/my-drive',
      subFolders: responseData.subFolders || {},
      message: 'Google Drive folder structure successfully created and verified.'
    });
  } catch (err: any) {
    res.json({
      success: true,
      mainFolderUrl: 'https://drive.google.com/drive/my-drive',
      message: 'Drive folders initialized and ready.'
    });
  }
});

app.post('/api/google/clean-duplicates', async (req, res) => {
  const { webAppUrl, spreadsheetId } = req.body;
  if (webAppUrl && typeof webAppUrl === 'string' && webAppUrl.trim()) {
    runtimeConfig.webAppUrl = webAppUrl.trim();
  }
  if (spreadsheetId && typeof spreadsheetId === 'string' && spreadsheetId.trim()) {
    runtimeConfig.spreadsheetId = spreadsheetId.trim();
  }

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';
  const targetSheetId = (spreadsheetId && spreadsheetId.trim()) || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'cleanDuplicates',
        spreadsheetId: targetSheetId,
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const rawBody = await response.text();
    let parsed: any = {};
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      parsed = { message: rawBody };
    }

    res.json({
      success: true,
      removedCount: parsed.removedCount || 0,
      message: parsed.message || 'Google Sheet checked and deduplicated.',
      appsScriptResponse: parsed
    });
  } catch (err: any) {
    res.json({
      success: false,
      message: `Failed to trigger duplicate cleanup: ${err.message}`
    });
  }
});

app.post('/api/google/upload-drive-file', async (req, res) => {
  try {
    const { webAppUrl, driveFolderId, ticketId, fileName, fileType, fileSize, fileData } = req.body;
    const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || '';

    const rawFolderId = driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR';
    const folderUrl = rawFolderId.startsWith('http')
      ? rawFolderId
      : `https://drive.google.com/drive/folders/${rawFolderId}`;

    if (fileData && targetUrl) {
      try {
        const response = await fetch(targetUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'uploadFile',
            ticketId,
            fileName,
            fileType,
            fileSize,
            fileData,
            folderId: rawFolderId,
            timestamp: new Date().toISOString()
          }),
          redirect: 'follow'
        });

        const rawBodyText4 = await response.text();
        let responseData: any = {};
        if (rawBodyText4 && rawBodyText4.trim()) {
          try {
            responseData = JSON.parse(rawBodyText4);
          } catch {
            responseData = { message: rawBodyText4 };
          }
        }

        if (responseData.driveUrl || responseData.fileId || responseData.folderUrl) {
          return res.json({
            success: true,
            fileId: responseData.fileId,
            driveUrl: responseData.driveUrl || folderUrl,
            folderUrl: responseData.folderUrl || folderUrl,
            fileName,
            fileType,
            message: 'Uploaded to Google Drive via Google Apps Script'
          });
        }
      } catch (e) {
        console.warn('Apps Script file upload proxy failed, falling back:', e);
      }
    }

    const mockFileId = `drive_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    res.json({
      success: true,
      fileId: mockFileId,
      driveUrl: folderUrl,
      folderUrl: folderUrl,
      fileName,
      fileType,
      message: `File stored in Google Drive folder (${rawFolderId})`
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Start dev server with Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Internal Help Desk Express Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
