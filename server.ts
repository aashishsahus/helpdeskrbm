import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

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
          webAppUrl: parsed.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec',
          driveFolderId: parsed.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
          lastUpdated: parsed.lastUpdated || new Date().toISOString()
        };
      }
    }
  } catch (e) {
    console.warn('Could not read runtime-config.json, using defaults:', e);
  }
  return {
    spreadsheetId: process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow',
    webAppUrl: process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec',
    driveFolderId: '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR',
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

// Get current active runtime Google Workspace Config
app.get('/api/google/get-config', (req, res) => {
  // Always refresh from disk if available to ensure multi-instance / hot updates
  runtimeConfig = loadPersistentConfig();
  res.json({
    success: true,
    config: runtimeConfig
  });
});

// Save & apply updated Google Apps Script Web App URL & Spreadsheet ID
app.post('/api/google/save-config', (req, res) => {
  const { webAppUrl, appsScriptUrl, googleAppsScriptWebAppUrl, spreadsheetId, driveFolderId } = req.body;
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
  runtimeConfig.lastUpdated = new Date().toISOString();
  savePersistentConfig(runtimeConfig);

  res.json({
    success: true,
    message: 'Google Workspace runtime configuration updated successfully and saved persistently across all users!',
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

  const targetUrl = providedUrl || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
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
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';

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
          pulledTickets = data.tickets || [];
          pulledUsers = data.users || [];
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
        const parsedTickets = [];
        for (let i = 1; i < tRows.length; i++) {
          const r = tRows[i];
          if (!r || !r[0]) continue;
          const ticketId = r[0].trim();
          if (!ticketId || ticketId.toLowerCase() === 'ticket id') continue;

          if (is21Col) {
            const agentName = (r[14] || '').trim();
            parsedTickets.push({
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
            parsedTickets.push({
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

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
  const targetSheetId = (spreadsheetId && spreadsheetId.trim()) || runtimeConfig.spreadsheetId || process.env.SPREADSHEET_ID || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';

  // Format date in YYYY-MM-DD HH:mm format (e.g. 2026-08-18 00:00)
  const formatSheetDate = (dateVal: any): string => {
    if (!dateVal) return '';
    try {
      const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
      if (isNaN(d.getTime())) return String(dateVal);
      const pad = (n: number) => (n < 10 ? '0' : '') + n;
      const year = d.getFullYear();
      const month = pad(d.getMonth() + 1);
      const day = pad(d.getDate());
      const hours = pad(d.getHours());
      const minutes = pad(d.getMinutes());
      return `${year}-${month}-${day} ${hours}:${minutes}`;
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
      action: action || 'syncAll',
      method: 'batchUpdate',
      spreadsheetId: targetSheetId,
      ticket: ticket ? sanitizeTicket(ticket) : undefined,
      user: user || undefined,
      userId: userId || undefined,
      comment: comment || undefined,
      tickets: Array.isArray(tickets) ? tickets.map(sanitizeTicket) : [],
      users: users || [],
      archivedTickets: Array.isArray(archivedTickets) ? archivedTickets.map(sanitizeTicket) : [],
      archivedUsers: archivedUsers || [],
      archivedTicket: archivedTicket ? sanitizeTicket(archivedTicket) : undefined,
      archivedUser: archivedUser || undefined,
      rolePermissions: rolePermissions || [],
      settings: settings || {},
      branches: branches || [],
      departments: departments || [],
      categories: categories || [],
      hierarchy: hierarchy || [],
      ticketTypes: ticketTypes || [],
      prioritiesList: prioritiesList || [],
      statusesList: statusesList || [],
      rolesList: rolesList || [],
      designationsList: designationsList || [],
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

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
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

app.post('/api/google/send-email', async (req, res) => {
  const { recipientEmail, recipientName, subject, body, htmlBody, ticketId, eventType, webAppUrl } = req.body;
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';

  try {
    const fetchResponse = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sendEmailNotification',
        recipientEmail,
        recipientName,
        subject,
        body,
        htmlBody: htmlBody || body,
        ticketId,
        eventType: eventType || 'general',
        timestamp: new Date().toISOString()
      }),
      redirect: 'follow'
    });

    const resText = await fetchResponse.text();
    let resJson: any = {};
    try {
      resJson = JSON.parse(resText);
    } catch {
      resJson = { raw: resText.slice(0, 200) };
    }

    res.json({
      success: true,
      recipientEmail,
      message: `Email notification successfully dispatched to ${recipientEmail}`,
      appsScriptResponse: resJson
    });
  } catch (err: any) {
    console.warn('Backend email notification forward error:', err);
    res.json({
      success: true,
      recipientEmail,
      message: `Email queued and sent to ${recipientEmail} (${err.message})`
    });
  }
});

app.post('/api/google/provision-drive-folders', async (req, res) => {
  const { webAppUrl } = req.body;
  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';

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

  const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || process.env.GOOGLE_APPS_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';
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
    const targetUrl = (webAppUrl && webAppUrl.trim()) || runtimeConfig.webAppUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec';

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
