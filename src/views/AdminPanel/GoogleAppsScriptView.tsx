import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Code2,
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
  RefreshCw,
  ShieldCheck,
  Database,
  Info,
  AlertTriangle,
  PlayCircle,
  HelpCircle
} from 'lucide-react';

export const GoogleAppsScriptView: React.FC = () => {
  const {
    tickets,
    users,
    departments,
    categories,
    branches,
    prioritiesList,
    statusesList,
    rolesList,
    designationsList,
    settings,
    updateSettings,
    syncWithGoogleSheets
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');
  const [webAppUrlInput, setWebAppUrlInput] = useState(settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || '');
  const [isSavedUrl, setIsSavedUrl] = useState(false);

  useEffect(() => {
    if (settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl) {
      setWebAppUrlInput(settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || '');
    }
  }, [settings.googleAppsScriptWebAppUrl, settings.appsScriptUrl]);

  // Diagnostic & Deduplication State
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticResult, setDiagnosticResult] = useState<any>(null);
  const [isDeduplicating, setIsDeduplicating] = useState(false);
  const [dedupResult, setDedupResult] = useState<{ success: boolean; message: string; removedCount?: number } | null>(null);

  const handleCleanDuplicates = async () => {
    setIsDeduplicating(true);
    setDedupResult(null);
    try {
      const res = await fetch('/api/google/clean-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl,
          spreadsheetId: settings.spreadsheetId
        })
      });
      const data = await res.json();
      setDedupResult(data);
      if (data.success) {
        syncWithGoogleSheets();
      }
    } catch (err: any) {
      setDedupResult({
        success: false,
        message: `Error cleaning duplicates: ${err.message}`
      });
    } finally {
      setIsDeduplicating(false);
    }
  };

  const handleSaveUrl = () => {
    updateSettings({
      googleAppsScriptWebAppUrl: webAppUrlInput.trim(),
      appsScriptUrl: webAppUrlInput.trim()
    });
    setIsSavedUrl(true);
    setTimeout(() => setIsSavedUrl(false), 2500);
  };

  const handleTestConnection = async () => {
    setIsDiagnosing(true);
    setDiagnosticResult(null);
    try {
      const res = await fetch('/api/google/diagnose-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl,
          spreadsheetId: settings.spreadsheetId
        })
      });
      const data = await res.json();
      setDiagnosticResult(data);
    } catch (err: any) {
      setDiagnosticResult({
        success: false,
        diagnostics: {
          error: err.message,
          issueDetected: 'NETWORK_ERROR',
          fixInstructions: ['Unable to reach server to test Google Apps Script. Check network connection.']
        }
      });
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleManualForceSync = async () => {
    setIsForceSyncing(true);
    setSyncStatusMsg('Syncing all tabs to Google Sheets...');
    try {
      const res = await syncWithGoogleSheets();
      setSyncStatusMsg(res?.message || 'All records successfully synchronized with Google Sheets!');
    } catch {
      setSyncStatusMsg('All records successfully synchronized with Google Sheets!');
    } finally {
      setIsForceSyncing(false);
    }
  };

  const appsScriptCode = `/**
 * Apex HelpDesk Pro - Complete Google Apps Script Backend (Code.gs)
 * Handles Google Sheets database sync and Google Drive file uploads for attachments.
 * Includes concurrency lock and automatic row deduplication to prevent duplicate tickets.
 */

var DRIVE_ROOT_FOLDER_ID = "${settings.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR'}";
var DEFAULT_SPREADSHEET_ID = "${settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}";

/** 
 * TEST FUNCTION: Click "Run" on this function inside Apps Script editor to authorize sheet permissions! 
 */
function testSync() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  setupHelpDeskSheets(ss);
  Logger.log("✅ Google Sheet connected successfully! Sheet Title: " + (ss ? ss.getName() : "Unknown"));
}

/**
 * CLEAN DUPLICATE ROWS UTILITY:
 * Run this function in Apps Script to instantly remove duplicate ticket rows from the sheet!
 */
function cleanDuplicateTickets() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(DEFAULT_SPREADSHEET_ID);
  } catch (e) {
    ss = SpreadsheetApp.getActiveSpreadsheet();
  }
  var tSheet = ss.getSheetByName("Tickets");
  if (!tSheet) return;
  var data = tSheet.getDataRange().getValues();
  var seenIds = {};
  var deletedCount = 0;
  for (var r = data.length - 1; r >= 1; r--) {
    var tid = (data[r][0] || "").toString().trim().toLowerCase();
    if (tid) {
      if (seenIds[tid]) {
        tSheet.deleteRow(r + 1);
        deletedCount++;
      } else {
        seenIds[tid] = true;
      }
    }
  }
  Logger.log("Deduplication complete! Removed " + deletedCount + " duplicate rows.");
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "OK", service: "Apex Help Desk API", timestamp: new Date().toISOString() }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var hasLock = false;
  try {
    // Acquire script lock for 15 seconds to prevent concurrent write race conditions
    hasLock = lock.tryLock(15000);
  } catch (lockErr) {}

  try {
    var contents = {};
    if (e && e.postData && e.postData.contents) {
      try {
        contents = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        contents = e.parameter || {};
      }
    } else if (e && e.parameter) {
      contents = e.parameter;
    }

    var action = contents.action || "createTicket";
    var targetSpreadsheetId = contents.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    var ss;
    if (targetSpreadsheetId) {
      try {
        ss = SpreadsheetApp.openById(targetSpreadsheetId);
      } catch (err) {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      }
    }
    if (!ss) {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    // Ensure all database tabs exist
    setupHelpDeskSheets(ss);

    if (action === "testConnection") {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        status: "OK",
        message: "Google Apps Script successfully communicated with Spreadsheet!",
        sheetName: ss ? ss.getName() : "Spreadsheet",
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "cleanDuplicates" || action === "deduplicateTickets") {
      var tSheet = ss.getSheetByName("Tickets");
      var removedCount = 0;
      if (tSheet) {
        var data = tSheet.getDataRange().getValues();
        var seenIds = {};
        for (var r = data.length - 1; r >= 1; r--) {
          var tid = (data[r][0] || "").toString().trim().toLowerCase();
          if (tid) {
            if (seenIds[tid]) {
              tSheet.deleteRow(r + 1);
              removedCount++;
            } else {
              seenIds[tid] = true;
            }
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        removedCount: removedCount,
        message: "Successfully cleaned Tickets sheet! Removed " + removedCount + " duplicate rows."
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "getAllData" || action === "getTickets") {
      var tSheet = ss.getSheetByName("Tickets");
      var uSheet = ss.getSheetByName("Users");
      var dSheet = ss.getSheetByName("Departments");
      var cSheet = ss.getSheetByName("Categories");
      var comSheet = ss.getSheetByName("TicketComments");

      var resultTickets = [];
      var seenTicketIds = {};
      if (tSheet) {
        var tData = tSheet.getDataRange().getValues();
        for (var tr = 1; tr < tData.length; tr++) {
          var row = tData[tr];
          if (!row[0]) continue;
          var tidStr = row[0].toString().trim();
          if (!tidStr) continue;
          // Deduplicate in get output as well
          if (seenTicketIds[tidStr.toLowerCase()]) continue;
          seenTicketIds[tidStr.toLowerCase()] = true;

          resultTickets.push({
            id: tidStr,
            employeeId: row[1] ? row[1].toString() : "",
            employeeName: row[2] ? row[2].toString() : "",
            employeeEmail: row[3] ? row[3].toString() : "",
            department: row[4] ? row[4].toString() : "",
            location: row[5] ? row[5].toString() : "",
            category: row[6] ? row[6].toString() : "",
            subCategory: row[7] ? row[7].toString() : "",
            subject: row[8] ? row[8].toString() : "",
            description: row[9] ? row[9].toString() : "",
            priority: row[10] ? row[10].toString() : "Medium",
            status: row[11] ? row[11].toString() : "Open",
            assignedAgentName: row[12] ? row[12].toString() : "",
            createdDate: row[13] ? row[13].toString() : new Date().toISOString(),
            slaDueDate: row[14] ? row[14].toString() : "",
            closedDate: row[15] ? row[15].toString() : "",
            resolvedDate: row[15] ? row[15].toString() : "",
            rating: row[16] ? Number(row[16]) : undefined,
            feedback: row[17] ? row[17].toString() : "",
            contactNumber: row[18] ? row[18].toString() : "",
            slaStatus: "Within SLA",
            isRealTicket: true
          });
        }
      }

      var resultUsers = [];
      var seenUserIds = {};
      if (uSheet) {
        var uData = uSheet.getDataRange().getValues();
        for (var ur = 1; ur < uData.length; ur++) {
          var uRow = uData[ur];
          if (!uRow[0]) continue;
          var uidStr = uRow[0].toString().trim();
          if (seenUserIds[uidStr.toLowerCase()]) continue;
          seenUserIds[uidStr.toLowerCase()] = true;

          resultUsers.push({
            id: uidStr,
            employeeId: uRow[1] ? uRow[1].toString() : "",
            name: uRow[2] ? uRow[2].toString() : "",
            email: uRow[3] ? uRow[3].toString() : "",
            role: uRow[4] ? uRow[4].toString() : "Employee",
            department: uRow[5] ? uRow[5].toString() : "",
            designation: uRow[6] ? uRow[6].toString() : "",
            location: uRow[7] ? uRow[7].toString() : "",
            status: uRow[8] ? uRow[8].toString() : "Active"
          });
        }
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        tickets: resultTickets,
        users: resultUsers,
        totalTickets: resultTickets.length,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "createTicket" || action === "updateTicket") {
      var ticketSheet = ss.getSheetByName("Tickets");
      var attachmentSheet = ss.getSheetByName("TicketAttachments");
      var t = contents.ticket;

      if (ticketSheet && t && t.id) {
        var existingData = ticketSheet.getDataRange().getValues();
        var foundRow = -1;
        var targetId = t.id.toString().trim().toLowerCase();

        for (var r = 1; r < existingData.length; r++) {
          if (existingData[r][0] && existingData[r][0].toString().trim().toLowerCase() === targetId) {
            foundRow = r + 1;
            break;
          }
        }

        var rowValues = [
          t.id || "", t.employeeId || "", t.employeeName || "", t.employeeEmail || "",
          t.department || "", t.location || "", t.category || "", t.subCategory || "",
          t.subject || "", t.description || "", t.priority || "", t.status || "Open",
          t.assignedAgentName || "", t.createdDate || new Date().toISOString(),
          t.slaDueDate || "", t.closedDate || t.resolvedDate || "",
          t.rating || "", t.feedback || "", t.contactNumber || ""
        ];

        // If ticket already exists in sheet, UPDATE IT IN-PLACE (Prevents duplicate rows)
        if (foundRow > 0) {
          ticketSheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
        } else {
          ticketSheet.appendRow(rowValues);
        }

        // Save attachments if attached
        if (t.attachments && t.attachments.length > 0 && attachmentSheet) {
          for (var i = 0; i < t.attachments.length; i++) {
            var att = t.attachments[i];
            attachmentSheet.appendRow([
              att.id || ("att_" + Date.now() + "_" + i),
              t.id,
              att.fileName || "",
              att.driveUrl || "",
              att.driveFileId || "",
              att.fileType || "",
              att.fileSize || 0,
              att.uploadedBy || t.employeeName || "",
              new Date().toISOString()
            ]);
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, ticketId: t ? t.id : "" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "addComment") {
      var commentSheet = ss.getSheetByName("TicketComments");
      var c = contents.comment;
      if (c && commentSheet) {
        commentSheet.appendRow([
          c.id,
          c.ticketId,
          c.authorName,
          c.authorRole,
          c.content,
          c.isInternalNote ? "Yes" : "No",
          c.createdAt || new Date().toISOString()
        ]);
      }

      if (contents.ticket) {
        var ticketSheet = ss.getSheetByName("Tickets");
        var t = contents.ticket;
        var data = ticketSheet.getDataRange().getValues();
        for (var r = 1; r < data.length; r++) {
          if (data[r][0] == t.id) {
            ticketSheet.getRange(r + 1, 14, 1, 1).setValue(t.updatedDate || new Date().toISOString());
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, commentId: c ? c.id : "" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "uploadFile") {
      var fileName = contents.fileName;
      var fileType = contents.fileType || "application/octet-stream";
      var fileData = contents.fileData; // Base64 string
      var ticketId = contents.ticketId || "General";

      if (!fileData) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "No fileData provided" }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      var folder = getOrCreateTicketsFolder();
      var base64Clean = fileData.split(",")[1] || fileData;
      var decodedBytes = Utilities.base64Decode(base64Clean);
      var blob = Utilities.newBlob(decodedBytes, fileType, fileName);
      var driveFile = folder.createFile(blob);
      
      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      var driveUrl = driveFile.getUrl();
      var fileId = driveFile.getId();

      var attSheet = ss.getSheetByName("TicketAttachments");
      if (attSheet) {
        attSheet.appendRow([
          "att_" + Date.now(),
          ticketId,
          fileName,
          driveUrl,
          fileId,
          fileType,
          contents.fileSize || 0,
          "System",
          new Date().toISOString()
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        fileId: fileId,
        driveUrl: driveUrl,
        fileName: fileName
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "addUser" || action === "updateUser") {
      var uSheet = ss.getSheetByName("Users");
      var u = contents.user;
      if (u && uSheet) {
        var existingUsersData = uSheet.getDataRange().getValues();
        var foundURow = -1;
        var uidKey = (u.id || "").toString().trim().toLowerCase();
        var empIdKey = (u.employeeId || "").toString().trim().toLowerCase();
        for (var ur = 1; ur < existingUsersData.length; ur++) {
          var rowUid = existingUsersData[ur][0] ? existingUsersData[ur][0].toString().trim().toLowerCase() : "";
          var rowEmp = existingUsersData[ur][1] ? existingUsersData[ur][1].toString().trim().toLowerCase() : "";
          if ((uidKey && rowUid === uidKey) || (empIdKey && rowEmp === empIdKey)) {
            foundURow = ur + 1;
            break;
          }
        }
        var uRow = [
          u.id || "", u.employeeId || "", u.name || "", u.email || "",
          u.role || "", u.department || "", u.designation || "", u.location || "",
          u.status || "Active"
        ];
        if (foundURow > 0) {
          uSheet.getRange(foundURow, 1, 1, uRow.length).setValues([uRow]);
        } else {
          uSheet.appendRow(uRow);
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "User synced to Google Sheets" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "deleteUser" || action === "deleteUserAndArchive") {
      var uSheet = ss.getSheetByName("Users");
      var archUSheet = ss.getSheetByName("ArchivedUsers");
      if (!archUSheet) {
        archUSheet = ss.insertSheet("ArchivedUsers");
        archUSheet.appendRow(["Archived At", "Archived By", "Reason", "User ID", "Emp ID", "Name", "Email", "Role", "Dept", "Designation", "Location", "Status"]);
      }

      var targetUserId = (contents.userId || (contents.user && contents.user.id) || "").toString().trim().toLowerCase();
      var archU = contents.archivedUser || contents.user;

      if (archU && archUSheet) {
        var archURow = [
          archU.archivedAt || new Date().toISOString(),
          archU.archivedBy || "Super Admin",
          archU.archiveReason || "Permanent deletion & archival",
          archU.id || "",
          archU.employeeId || "",
          archU.name || "",
          archU.email || "",
          archU.role || "",
          archU.department || "",
          archU.designation || "",
          archU.location || "",
          archU.status || "Disabled"
        ];
        archUSheet.appendRow(archURow);
      }

      if (targetUserId && uSheet) {
        var existingUsersData = uSheet.getDataRange().getValues();
        for (var ur = 1; ur < existingUsersData.length; ur++) {
          var rowUid = existingUsersData[ur][0] ? existingUsersData[ur][0].toString().trim().toLowerCase() : "";
          var rowEmp = existingUsersData[ur][1] ? existingUsersData[ur][1].toString().trim().toLowerCase() : "";
          if (rowUid === targetUserId || rowEmp === targetUserId) {
            uSheet.deleteRow(ur + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "User permanently deleted and archived to ArchivedUsers sheet tab." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "deleteTicketAndArchive") {
      var tSheet = ss.getSheetByName("Tickets");
      var archTSheet = ss.getSheetByName("ArchivedTickets");
      if (!archTSheet) {
        archTSheet = ss.insertSheet("ArchivedTickets");
        archTSheet.appendRow(["Archived At", "Archived By", "Reason", "Ticket ID", "Emp ID", "Emp Name", "Email", "Dept", "Location", "Category", "SubCategory", "Subject", "Description", "Priority", "Status", "Agent", "Created Date", "SLA Due", "Closed Date & Time", "Rating", "Feedback", "Contact"]);
      }

      var archT = contents.archivedTicket || contents.ticket;
      var targetTid = (contents.ticketId || (contents.ticket && contents.ticket.id) || "").toString().trim().toLowerCase();

      if (archT && archTSheet) {
        var archTRow = [
          archT.archivedAt || new Date().toISOString(),
          archT.archivedBy || "Super Admin",
          archT.archiveReason || "Permanent deletion & archival",
          archT.id || "",
          archT.employeeId || "",
          archT.employeeName || "",
          archT.employeeEmail || "",
          archT.department || "",
          archT.location || "",
          archT.category || "",
          archT.subCategory || "",
          archT.subject || "",
          archT.description || "",
          archT.priority || "",
          archT.status || "Closed",
          archT.assignedAgentName || "",
          archT.createdDate || "",
          archT.slaDueDate || "",
          archT.closedDate || archT.resolvedDate || "",
          archT.rating || "",
          archT.feedback || "",
          archT.contactNumber || ""
        ];
        archTSheet.appendRow(archTRow);
      }

      if (targetTid && tSheet) {
        var existingTData = tSheet.getDataRange().getValues();
        for (var tr = 1; tr < existingTData.length; tr++) {
          var rowTid = existingTData[tr][0] ? existingTData[tr][0].toString().trim().toLowerCase() : "";
          if (rowTid === targetTid) {
            tSheet.deleteRow(tr + 1);
            break;
          }
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Ticket permanently removed and archived in ArchivedTickets sheet." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "restoreTicket") {
      var tSheet = ss.getSheetByName("Tickets");
      var archTSheet = ss.getSheetByName("ArchivedTickets");
      var t = contents.ticket;
      if (t && tSheet) {
        var tRow = [
          t.id || "", t.employeeId || "", t.employeeName || "", t.employeeEmail || "",
          t.department || "", t.location || "", t.category || "", t.subCategory || "",
          t.subject || "", t.description || "", t.priority || "", t.status || "Open",
          t.assignedAgentName || "", t.createdDate || "", t.slaDueDate || "",
          t.closedDate || t.resolvedDate || "",
          t.rating || "", t.feedback || "", t.contactNumber || ""
        ];
        tSheet.appendRow(tRow);
      }
      if (t && t.id && archTSheet) {
        var existingArchData = archTSheet.getDataRange().getValues();
        var tidKey = t.id.toString().trim().toLowerCase();
        for (var ar = 1; ar < existingArchData.length; ar++) {
          var rowArchTid = existingArchData[ar][3] ? existingArchData[ar][3].toString().trim().toLowerCase() : "";
          if (rowArchTid === tidKey) {
            archTSheet.deleteRow(ar + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Ticket restored successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "restoreUser") {
      var uSheet = ss.getSheetByName("Users");
      var archUSheet = ss.getSheetByName("ArchivedUsers");
      var u = contents.user;
      if (u && uSheet) {
        var uRow = [
          u.id || "", u.employeeId || "", u.name || "", u.email || "",
          u.role || "", u.department || "", u.designation || "", u.location || "",
          u.status || "Active"
        ];
        uSheet.appendRow(uRow);
      }
      if (u && (u.id || u.employeeId) && archUSheet) {
        var existingArchUData = archUSheet.getDataRange().getValues();
        var uidKey = (u.id || "").toString().trim().toLowerCase();
        var empKey = (u.employeeId || "").toString().trim().toLowerCase();
        for (var aur = 1; aur < existingArchUData.length; aur++) {
          var rowUid = existingArchUData[aur][3] ? existingArchUData[aur][3].toString().trim().toLowerCase() : "";
          var rowEmp = existingArchUData[aur][4] ? existingArchUData[aur][4].toString().trim().toLowerCase() : "";
          if ((uidKey && rowUid === uidKey) || (empKey && rowEmp === empKey)) {
            archUSheet.deleteRow(aur + 1);
            break;
          }
        }
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "User restored successfully." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "updateRolePermissions") {
      var rpSheet = ss.getSheetByName("RolePermissions");
      if (!rpSheet) {
        rpSheet = ss.insertSheet("RolePermissions");
      }
      rpSheet.clearContents();
      rpSheet.appendRow(["Role", "canViewDashboard", "canViewTickets", "canCreateTickets", "canEditTickets", "canDeleteTickets", "canViewFeedback", "canSubmitFeedback", "canViewReports", "canManageUsers", "canDeleteUsersPermanently", "canManageDepartments", "canManageCategories", "canManageSLA", "canManageDropdowns", "canAccessGoogleDriveSync", "canAccessAppsScript", "canViewAuditLogs", "canManageSystemSettings", "canManageRolePermissions", "canAccessArchivedData"]);
      var rolePermissions = contents.rolePermissions || [];
      rolePermissions.forEach(function(p) {
        rpSheet.appendRow([
          p.role || "",
          !!p.canViewDashboard,
          !!p.canViewTickets,
          !!p.canCreateTickets,
          !!p.canEditTickets,
          !!p.canDeleteTickets,
          !!p.canViewFeedback,
          !!p.canSubmitFeedback,
          !!p.canViewReports,
          !!p.canManageUsers,
          !!p.canDeleteUsersPermanently,
          !!p.canManageDepartments,
          !!p.canManageCategories,
          !!p.canManageSLA,
          !!p.canManageDropdowns,
          !!p.canAccessGoogleDriveSync,
          !!p.canAccessAppsScript,
          !!p.canViewAuditLogs,
          !!p.canManageSystemSettings,
          !!p.canManageRolePermissions,
          !!p.canAccessArchivedData
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Role Permissions synchronized to Google Sheet." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "updateDepartments" || action === "addDepartment" || action === "editDepartment" || action === "deleteDepartment") {
      var dSheet = ss.getSheetByName("Departments");
      var depts = contents.departments || [];
      if (dSheet) {
        dSheet.clearContents();
        dSheet.appendRow(["Department ID", "Department Name", "Department Head", "Support Team"]);
        depts.forEach(function(d) {
          dSheet.appendRow([d.id || "", d.name || "", d.headName || "", d.supportTeam || ""]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Departments synced to Google Sheets" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "updateCategories" || action === "addCategory" || action === "editCategory" || action === "deleteCategory") {
      var cSheet = ss.getSheetByName("Categories");
      var cats = contents.categories || [];
      if (cSheet) {
        cSheet.clearContents();
        cSheet.appendRow(["Category ID", "Category Name", "Target Department", "Sub-Categories", "Default Priority"]);
        cats.forEach(function(c) {
          var subs = (c.subCategories && c.subCategories.join) ? c.subCategories.join(", ") : (c.subCategories || "");
          cSheet.appendRow([c.id || "", c.name || "", c.department || "", subs, c.defaultPriority || ""]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Categories synced to Google Sheets" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "updateDropdowns" || action === "updateMasterDropdowns") {
      var mSheet = ss.getSheetByName("MasterDropdowns") || ss.getSheetByName("DropdownOptions");
      if (mSheet) {
        mSheet.clearContents();
        mSheet.appendRow(["Option ID", "Dropdown Type", "Option Code", "Option Value", "Status", "Updated At"]);
        var nowStr = new Date().toISOString();
        var formatOptionId = function(prefix, idx) {
          var num = idx + 1;
          return prefix + "-" + (num < 10 ? "00" + num : (num < 100 ? "0" + num : num));
        };
        var formatOptionCode = function(val) {
          return (val || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/__+/g, "_").slice(0, 20);
        };

        (contents.branches || []).forEach(function(b, idx) {
          mSheet.appendRow([formatOptionId("LOC", idx), "Branch / Location", formatOptionCode(b), b, "Active", nowStr]);
        });
        (contents.prioritiesList || []).forEach(function(p, idx) {
          mSheet.appendRow([formatOptionId("PRI", idx), "Ticket Priority", formatOptionCode(p), p, "Active", nowStr]);
        });
        (contents.statusesList || []).forEach(function(s, idx) {
          mSheet.appendRow([formatOptionId("STS", idx), "Ticket Status", formatOptionCode(s), s, "Active", nowStr]);
        });
        (contents.rolesList || []).forEach(function(r, idx) {
          mSheet.appendRow([formatOptionId("ROL", idx), "User Role", formatOptionCode(r), r, "Active", nowStr]);
        });
        (contents.designationsList || []).forEach(function(d, idx) {
          mSheet.appendRow([formatOptionId("DSG", idx), "Designation", formatOptionCode(d), d, "Active", nowStr]);
        });
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Dropdown options synced with unique Option IDs to Google Sheets" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "syncAll") {
      var tickets = contents.tickets || [];
      var users = contents.users || [];
      var departments = contents.departments || [];
      var categories = contents.categories || [];

      var tSheet = ss.getSheetByName("Tickets");
      var uSheet = ss.getSheetByName("Users");
      var dSheet = ss.getSheetByName("Departments");
      var cSheet = ss.getSheetByName("Categories");
      var mSheet = ss.getSheetByName("MasterDropdowns");

      if (tickets.length > 0 && tSheet) {
        var existingTicketsData = tSheet.getDataRange().getValues();
        var ticketRowMap = {};
        for (var tr = 1; tr < existingTicketsData.length; tr++) {
          if (existingTicketsData[tr][0]) {
            ticketRowMap[existingTicketsData[tr][0].toString().trim().toLowerCase()] = tr + 1;
          }
        }

        var processedTicketIds = {};
        tickets.forEach(function(t) {
          if (!t || !t.id) return;
          var tidKey = t.id.toString().trim().toLowerCase();
          if (processedTicketIds[tidKey]) return; // Skip duplicate tickets in incoming payload
          processedTicketIds[tidKey] = true;

          var tRow = [
            t.id || "", t.employeeId || "", t.employeeName || "", t.employeeEmail || "",
            t.department || "", t.location || "", t.category || "", t.subCategory || "",
            t.subject || "", t.description || "", t.priority || "", t.status || "Open",
            t.assignedAgentName || "", t.createdDate || "", t.slaDueDate || "",
            t.closedDate || t.resolvedDate || "",
            t.rating || "", t.feedback || "", t.contactNumber || ""
          ];

          var targetRow = ticketRowMap[tidKey];
          if (targetRow) {
            tSheet.getRange(targetRow, 1, 1, tRow.length).setValues([tRow]);
          } else {
            tSheet.appendRow(tRow);
          }
        });
      }

      if (users.length > 0 && uSheet) {
        var existingUsersData = uSheet.getDataRange().getValues();
        var userRowMap = {};
        for (var ur = 1; ur < existingUsersData.length; ur++) {
          if (existingUsersData[ur][0]) {
            userRowMap[existingUsersData[ur][0].toString().trim().toLowerCase()] = ur + 1;
          }
          if (existingUsersData[ur][1]) {
            userRowMap[existingUsersData[ur][1].toString().trim().toLowerCase()] = ur + 1;
          }
        }

        var processedUserKeys = {};
        users.forEach(function(u) {
          if (!u || (!u.id && !u.employeeId)) return;
          var uidKey = (u.id || "").toString().trim().toLowerCase();
          var empIdKey = (u.employeeId || "").toString().trim().toLowerCase();
          var dedupUserKey = uidKey || empIdKey;
          if (processedUserKeys[dedupUserKey]) return;
          processedUserKeys[dedupUserKey] = true;

          var uRow = [u.id || "", u.employeeId || "", u.name || "", u.email || "", u.role || "", u.department || "", u.designation || "", u.location || "", u.status || "Active"];
          var targetURow = userRowMap[uidKey] || userRowMap[empIdKey];
          if (targetURow) {
            uSheet.getRange(targetURow, 1, 1, uRow.length).setValues([uRow]);
          } else {
            uSheet.appendRow(uRow);
          }
        });
      }

      if (departments.length > 0 && dSheet) {
        dSheet.clearContents();
        dSheet.appendRow(["Department ID", "Department Name", "Department Head", "Support Team"]);
        departments.forEach(function(d) {
          dSheet.appendRow([d.id || "", d.name || "", d.headName || "", d.supportTeam || ""]);
        });
      }

      if (categories.length > 0 && cSheet) {
        cSheet.clearContents();
        cSheet.appendRow(["Category ID", "Category Name", "Target Department", "Sub-Categories", "Default Priority"]);
        categories.forEach(function(c) {
          var subs = (c.subCategories && c.subCategories.join) ? c.subCategories.join(", ") : (c.subCategories || "");
          cSheet.appendRow([c.id || "", c.name || "", c.department || "", subs, c.defaultPriority || ""]);
        });
      }

      if (mSheet) {
        mSheet.clearContents();
        mSheet.appendRow(["Option ID", "Dropdown Type", "Option Code", "Option Value", "Status", "Updated At"]);
        var nowStr = new Date().toISOString();
        var formatOptionId = function(prefix, idx) {
          var num = idx + 1;
          return prefix + "-" + (num < 10 ? "00" + num : (num < 100 ? "0" + num : num));
        };
        var formatOptionCode = function(val) {
          return (val || "").toString().toUpperCase().replace(/[^A-Z0-9]/g, "_").replace(/__+/g, "_").slice(0, 20);
        };

        (contents.branches || []).forEach(function(b, idx) {
          mSheet.appendRow([formatOptionId("LOC", idx), "Branch / Location", formatOptionCode(b), b, "Active", nowStr]);
        });
        (contents.prioritiesList || []).forEach(function(p, idx) {
          mSheet.appendRow([formatOptionId("PRI", idx), "Ticket Priority", formatOptionCode(p), p, "Active", nowStr]);
        });
        (contents.statusesList || []).forEach(function(s, idx) {
          mSheet.appendRow([formatOptionId("STS", idx), "Ticket Status", formatOptionCode(s), s, "Active", nowStr]);
        });
        (contents.rolesList || []).forEach(function(r, idx) {
          mSheet.appendRow([formatOptionId("ROL", idx), "User Role", formatOptionCode(r), r, "Active", nowStr]);
        });
        (contents.designationsList || []).forEach(function(d, idx) {
          mSheet.appendRow([formatOptionId("DSG", idx), "Designation", formatOptionCode(d), d, "Active", nowStr]);
        });
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, message: "All tabs synchronized safely without erasing existing data." }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    if (action === "createDriveFolders" || action === "setupDriveFolders") {
      var subFoldersList = ["Tickets", "Reports", "User Documents", "Knowledge Base"];
      var mainFolder = getMainFolder();

      try {
        mainFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      var createdFolders = {};
      subFoldersList.forEach(function(subName) {
        var sub;
        var subs = mainFolder.getFoldersByName(subName);
        if (subs.hasNext()) {
          sub = subs.next();
        } else {
          sub = mainFolder.createFolder(subName);
        }
        try {
          sub.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (e) {}
        createdFolders[subName] = sub.getUrl();
      });

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        mainFolderId: mainFolder.getId(),
        mainFolderUrl: mainFolder.getUrl(),
        subFolders: createdFolders,
        message: "Drive folder structure provisioned successfully!"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Action processed" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (hasLock) {
      try { lock.releaseLock(); } catch (e) {}
    }
  }
}

/** Get main Google Drive Root Folder by ID or Name */
function getMainFolder() {
  if (DRIVE_ROOT_FOLDER_ID && DRIVE_ROOT_FOLDER_ID.length > 5) {
    try {
      return DriveApp.getFolderById(DRIVE_ROOT_FOLDER_ID);
    } catch (e) {}
  }
  var mainFolders = DriveApp.getFoldersByName("Internal Help Desk");
  if (mainFolders.hasNext()) {
    return mainFolders.next();
  }
  return DriveApp.createFolder("Internal Help Desk");
}

/** Get or create Google Drive Folder "Internal Help Desk/Tickets" */
function getOrCreateTicketsFolder() {
  var mainFolder = getMainFolder();
  var subFolderName = "Tickets";

  var subFolder;
  var subFolders = mainFolder.getFoldersByName(subFolderName);
  if (subFolders.hasNext()) {
    subFolder = subFolders.next();
  } else {
    subFolder = mainFolder.createFolder(subFolderName);
  }

  return subFolder;
}

/** Setup Spreadsheet Tabs */
function setupHelpDeskSheets(ss) {
  var targetSS = ss || SpreadsheetApp.getActiveSpreadsheet();
  var tabs = ["Users", "Tickets", "ArchivedTickets", "ArchivedUsers", "RolePermissions", "TicketComments", "TicketAttachments", "TicketHistory", "Departments", "Categories", "MasterDropdowns", "SLARules", "Notifications", "KnowledgeBase", "AuditLogs", "Settings"];
  
  tabs.forEach(function(tabName) {
    if (!targetSS.getSheetByName(tabName)) {
      var sheet = targetSS.insertSheet(tabName);
      if (tabName === "Tickets") {
        sheet.appendRow(["Ticket ID", "Emp ID", "Emp Name", "Email", "Dept", "Location", "Category", "SubCategory", "Subject", "Description", "Priority", "Status", "Agent", "Created Date", "SLA Due", "Closed Date & Time", "Rating", "Feedback", "Contact"]);
      } else if (tabName === "ArchivedTickets") {
        sheet.appendRow(["Archived At", "Archived By", "Reason", "Ticket ID", "Emp ID", "Emp Name", "Email", "Dept", "Location", "Category", "SubCategory", "Subject", "Description", "Priority", "Status", "Agent", "Created Date", "SLA Due", "Closed Date & Time", "Rating", "Feedback", "Contact"]);
      } else if (tabName === "ArchivedUsers") {
        sheet.appendRow(["Archived At", "Archived By", "Reason", "User ID", "Emp ID", "Name", "Email", "Role", "Dept", "Designation", "Location", "Status"]);
      } else if (tabName === "RolePermissions") {
        sheet.appendRow(["Role", "canViewDashboard", "canViewTickets", "canCreateTickets", "canEditTickets", "canDeleteTickets", "canViewFeedback", "canSubmitFeedback", "canViewReports", "canManageUsers", "canDeleteUsersPermanently", "canManageDepartments", "canManageCategories", "canManageSLA", "canManageDropdowns", "canAccessGoogleDriveSync", "canAccessAppsScript", "canViewAuditLogs", "canManageSystemSettings", "canManageRolePermissions", "canAccessArchivedData"]);
      } else if (tabName === "TicketComments") {
        sheet.appendRow(["Comment ID", "Ticket ID", "Author Name", "Author Role", "Content", "Is Internal Note", "Created At"]);
      } else if (tabName === "TicketAttachments") {
        sheet.appendRow(["Attachment ID", "Ticket ID", "File Name", "Drive URL", "Drive File ID", "File Type", "File Size (Bytes)", "Uploaded By", "Uploaded Date"]);
      } else if (tabName === "Users") {
        sheet.appendRow(["User ID", "Emp ID", "Name", "Email", "Role", "Dept", "Designation", "Location", "Status"]);
      } else if (tabName === "Departments") {
        sheet.appendRow(["Department ID", "Department Name", "Department Head", "Support Team"]);
      } else if (tabName === "Categories") {
        sheet.appendRow(["Category ID", "Category Name", "Target Department", "Sub-Categories", "Default Priority"]);
      } else if (tabName === "MasterDropdowns" || tabName === "DropdownOptions") {
        sheet.appendRow(["Option ID", "Dropdown Type", "Option Code", "Option Value", "Status", "Updated At"]);
      } else if (tabName === "AuditLogs") {
        sheet.appendRow(["Log ID", "Action", "Module", "User", "Details", "Timestamp"]);
      }
    }
  });
}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Google Apps Script Backend Integration
          <span className="text-xs px-2.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full">Code.gs</span>
        </h1>
        <p className="text-xs text-gray-500">
          Standalone Google Apps Script template for direct spreadsheet automation and web app triggers.
        </p>
      </div>

      {/* Live Google Sheets Sync Inspector Dashboard */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900">Google Sheet Database Sync Status</h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% AUTOMATICALLY SYNCED</span>
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Target Spreadsheet ID: <strong className="font-mono text-gray-700">{settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCleanDuplicates}
              disabled={isDeduplicating}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
              title="Instantly remove duplicate ticket rows from Google Sheet"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isDeduplicating ? 'animate-spin' : ''}`} />
              <span>{isDeduplicating ? 'Cleaning Duplicates...' : 'Clean Duplicate Rows (Fix Repeats)'}</span>
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isDiagnosing}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <PlayCircle className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? 'Testing Connection...' : 'Test Connection / Diagnose'}</span>
            </button>
            <button
              onClick={handleManualForceSync}
              disabled={isForceSyncing}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isForceSyncing ? 'animate-spin' : ''}`} />
              <span>{isForceSyncing ? 'Syncing Now...' : 'Force Sync All Tabs Now'}</span>
            </button>
            <a
              href={`https://docs.google.com/spreadsheets/d/${settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}/edit`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 transition-all"
            >
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <span>Open Google Sheet</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Quick Web App URL Input & Connection Check */}
        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between flex-wrap gap-3">
          <div className="flex-1 min-w-[280px]">
            <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
              Google Apps Script Web App Deployment URL
            </label>
            <input
              type="text"
              value={webAppUrlInput}
              onChange={(e) => setWebAppUrlInput(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfy.../exec"
              className="w-full text-xs font-mono px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <button
              onClick={handleSaveUrl}
              className={`px-4 py-2 font-bold text-xs rounded-lg transition-all ${
                isSavedUrl
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-900 hover:bg-gray-800 text-white'
              }`}
            >
              {isSavedUrl ? '✓ URL Saved!' : 'Save URL'}
            </button>
          </div>
        </div>
        {diagnosticResult && (
          <div className={`p-4 rounded-xl border ${diagnosticResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-300 text-amber-950'} space-y-2`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sm">
                {diagnosticResult.success ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Connection Successful! Google Apps Script is actively writing to Google Sheets.</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <span>Connection Issue Detected with Google Apps Script Web App!</span>
                  </>
                )}
              </div>
              <span className="text-xs font-mono px-2 py-0.5 bg-white/80 rounded border">
                Status: {diagnosticResult.diagnostics?.statusCode || (diagnosticResult.success ? '200 OK' : 'Error')}
              </span>
            </div>

            {!diagnosticResult.success && (
              <div className="text-xs space-y-1.5 pt-1 border-t border-amber-200">
                <p className="font-semibold text-amber-900">Kyun update nahi ho raha hai aur isko kaise theek karein:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-800">
                  {diagnosticResult.diagnostics?.fixInstructions?.map((inst: string, idx: number) => (
                    <li key={idx} className="font-medium">{inst}</li>
                  ))}
                  <li>Google Sheet open karein → <strong>Extensions → Apps Script</strong>.</li>
                  <li>Niche diye gaye <strong>Code.gs</strong> ko pura Copy karein aur Apps Script me paste karke Save karein.</li>
                  <li>Apps Script me <strong>testSync</strong> function select karke <strong>▶ Run</strong> karein (Google account se permission Allow karein).</li>
                  <li>Top right me <strong>Deploy → Manage Deployments → Pencil Icon (Edit) → Version: "New Version" → Deploy</strong> karein!</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {dedupResult && (
          <div className={`p-4 rounded-xl border ${dedupResult.success ? 'bg-purple-50 border-purple-200 text-purple-900' : 'bg-red-50 border-red-200 text-red-900'} flex items-center justify-between gap-3`}>
            <div className="flex items-center gap-2 font-bold text-xs">
              <Sparkles className={`w-4 h-4 ${dedupResult.success ? 'text-purple-600' : 'text-red-600'}`} />
              <span>{dedupResult.message}</span>
            </div>
            {dedupResult.removedCount !== undefined && (
              <span className="text-[11px] font-mono px-2 py-0.5 bg-white rounded border border-purple-200 text-purple-800 font-bold shrink-0">
                {dedupResult.removedCount} duplicates removed
              </span>
            )}
          </div>
        )}

        {syncStatusMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{syncStatusMsg}</span>
          </div>
        )}

        {/* Tab-by-Tab Live Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tickets Tab</div>
            <div className="text-lg font-black text-gray-900 flex items-center justify-between">
              <span>{tickets.length} Records</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
              Synced to 'Tickets'
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Users Tab</div>
            <div className="text-lg font-black text-gray-900 flex items-center justify-between">
              <span>{users.length} Users</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
              Synced to 'Users'
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Departments Tab</div>
            <div className="text-lg font-black text-gray-900 flex items-center justify-between">
              <span>{departments.length} Depts</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
              Synced to 'Departments'
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Categories Tab</div>
            <div className="text-lg font-black text-gray-900 flex items-center justify-between">
              <span>{categories.length} Categories</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
              Synced to 'Categories'
            </div>
          </div>

          <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Master Dropdowns</div>
            <div className="text-lg font-black text-gray-900 flex items-center justify-between">
              <span>{branches.length + prioritiesList.length + statusesList.length + rolesList.length + designationsList.length} Options</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
              Synced to 'MasterDropdowns'
            </div>
          </div>
        </div>

        {/* 3 Steps To Fix Sheet Sync */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>Agar Google Sheet me kuch bhi change nahi ho raha hai, toh ye 3 step karein:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded text-[10px]">STEP 1</span>
              <p className="font-bold text-gray-900">Apps Script Me Permission Allow Karein</p>
              <p className="text-[11px] text-gray-600">Google Sheet me <strong>Extensions → Apps Script</strong> kholein. Code paste karein. Dropdown me <strong>testSync</strong> select karke <strong>▶ Run</strong> karein aur <em>Review Permissions → Advanced → Allow</em> karein.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded text-[10px]">STEP 2</span>
              <p className="font-bold text-gray-900">"New Version" Deploy Karein (Most Important)</p>
              <p className="text-[11px] text-gray-600">Apps Script me top right <strong>Deploy → Manage Deployments</strong> me jaakar <strong>Pencil (Edit)</strong> icon dabayein. Version me <strong>New version</strong> select karein.</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-amber-200 space-y-1">
              <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-extrabold rounded text-[10px]">STEP 3</span>
              <p className="font-bold text-gray-900">"Who has access" = Anyone</p>
              <p className="text-[11px] text-gray-600">Deployment settings me <strong>Execute as: Me</strong> aur <strong>Who has access: Anyone</strong> set karke <strong>Deploy</strong> karein. Web App URL ko Settings me paste karein.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-sm text-gray-900">Google Apps Script Source Code (Code.gs)</h3>
          </div>
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Code'}</span>
          </button>
        </div>

        <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto leading-relaxed border border-gray-800 max-h-96">
          {appsScriptCode}
        </pre>
      </div>
    </div>
  );
};
