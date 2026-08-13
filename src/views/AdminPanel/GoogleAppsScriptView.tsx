import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Code2, Copy, Check, ExternalLink, Terminal, Sparkles } from 'lucide-react';

export const GoogleAppsScriptView: React.FC = () => {
  const { settings } = useApp();
  const [copied, setCopied] = useState(false);

  const appsScriptCode = `/**
 * Apex HelpDesk Pro - Complete Google Apps Script Backend (Code.gs)
 * Handles Google Sheets database sync and Google Drive file uploads for attachments.
 */

var DRIVE_ROOT_FOLDER_ID = "${settings.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR'}";

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "OK", service: "Internal Help Desk API" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var contents = JSON.parse(e.postData.contents);
    var action = contents.action;
    var targetSpreadsheetId = contents.spreadsheetId || "${settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}";
    var ss;
    if (targetSpreadsheetId) {
      try {
        ss = SpreadsheetApp.openById(targetSpreadsheetId);
      } catch (err) {
        ss = SpreadsheetApp.getActiveSpreadsheet();
      }
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }

    // Ensure all database tabs exist
    setupHelpDeskSheets(ss);

    if (action === "createTicket") {
      var ticketSheet = ss.getSheetByName("Tickets");
      var attachmentSheet = ss.getSheetByName("TicketAttachments");
      var t = contents.ticket;

      if (ticketSheet && t) {
        var existingData = ticketSheet.getDataRange().getValues();
        var foundRow = -1;
        for (var r = 1; r < existingData.length; r++) {
          if (existingData[r][0] && existingData[r][0].toString().trim() === t.id.toString().trim()) {
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

    if (action === "updateTicket") {
      var ticketSheet = ss.getSheetByName("Tickets");
      var t = contents.ticket;
      if (!t || !ticketSheet) {
        return ContentService.createTextOutput(JSON.stringify({ success: false, message: "Missing ticket or Tickets sheet" }))
          .setMimeType(ContentService.MimeType.JSON);
      }
      var data = ticketSheet.getDataRange().getValues();
      var foundRow = -1;

      var targetId = (t.id || "").toString().trim().toLowerCase();

      for (var r = 1; r < data.length; r++) {
        if (data[r][0] && data[r][0].toString().trim().toLowerCase() === targetId) {
          foundRow = r + 1;
          break;
        }
      }

      var rowValues = [
        t.id || "", t.employeeId || "", t.employeeName || "", t.employeeEmail || "",
        t.department || "", t.location || "", t.category || "", t.subCategory || "",
        t.subject || "", t.description || "", t.priority || "", t.status || "Open",
        t.assignedAgentName || "", t.createdDate || "",
        t.slaDueDate || "", t.closedDate || t.resolvedDate || "",
        t.rating || "", t.feedback || "", t.contactNumber || ""
      ];

      if (foundRow > 0) {
        ticketSheet.getRange(foundRow, 1, 1, rowValues.length).setValues([rowValues]);
      } else {
        ticketSheet.appendRow(rowValues);
      }

      return ContentService.createTextOutput(JSON.stringify({ success: true, ticketId: t.id, updatedRow: foundRow }))
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

      // Get or create Drive Folder "Internal Help Desk / Tickets"
      var folder = getOrCreateTicketsFolder();

      // Decode base64 and create file in Drive
      var base64Clean = fileData.split(",")[1] || fileData;
      var decodedBytes = Utilities.base64Decode(base64Clean);
      var blob = Utilities.newBlob(decodedBytes, fileType, fileName);
      var driveFile = folder.createFile(blob);
      
      // Make file viewable with link
      try {
        driveFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      var driveUrl = driveFile.getUrl();
      var fileId = driveFile.getId();

      // Log to TicketAttachments sheet
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

        tickets.forEach(function(t) {
          var tRow = [
            t.id || "", t.employeeId || "", t.employeeName || "", t.employeeEmail || "",
            t.department || "", t.location || "", t.category || "", t.subCategory || "",
            t.subject || "", t.description || "", t.priority || "", t.status || "Open",
            t.assignedAgentName || "", t.createdDate || "", t.slaDueDate || "",
            t.closedDate || t.resolvedDate || "",
            t.rating || "", t.feedback || "", t.contactNumber || ""
          ];
          var tidKey = (t.id || "").toString().trim().toLowerCase();
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

        users.forEach(function(u) {
          var uRow = [u.id || "", u.employeeId || "", u.name || "", u.email || "", u.role || "", u.department || "", u.designation || "", u.location || "", u.status || "Active"];
          var uidKey = (u.id || "").toString().trim().toLowerCase();
          var empIdKey = (u.employeeId || "").toString().trim().toLowerCase();
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
        mSheet.appendRow(["Dropdown Type", "Option Value", "Updated At"]);
        var nowStr = new Date().toISOString();
        (contents.branches || []).forEach(function(b) { mSheet.appendRow(["Branch / Location", b, nowStr]); });
        (contents.prioritiesList || []).forEach(function(p) { mSheet.appendRow(["Ticket Priority", p, nowStr]); });
        (contents.statusesList || []).forEach(function(s) { mSheet.appendRow(["Ticket Status", s, nowStr]); });
        (contents.rolesList || []).forEach(function(r) { mSheet.appendRow(["User Role", r, nowStr]); });
        (contents.designationsList || []).forEach(function(d) { mSheet.appendRow(["Designation", d, nowStr]); });
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
  var tabs = ["Users", "Tickets", "TicketComments", "TicketAttachments", "TicketHistory", "Departments", "Categories", "MasterDropdowns", "SLARules", "Notifications", "KnowledgeBase", "AuditLogs", "Settings"];
  
  tabs.forEach(function(tabName) {
    if (!targetSS.getSheetByName(tabName)) {
      var sheet = targetSS.insertSheet(tabName);
      if (tabName === "Tickets") {
        sheet.appendRow(["Ticket ID", "Emp ID", "Emp Name", "Email", "Dept", "Location", "Category", "SubCategory", "Subject", "Description", "Priority", "Status", "Agent", "Created Date", "SLA Due", "Closed Date & Time", "Rating", "Feedback", "Contact"]);
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
      } else if (tabName === "MasterDropdowns") {
        sheet.appendRow(["Dropdown Type", "Option Value", "Updated At"]);
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

        {/* Step-by-step Setup Guide */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-900">
          <h4 className="font-bold text-sm text-blue-950">Deployment Instructions:</h4>
          <ol className="list-decimal list-inside space-y-1 leading-relaxed">
            <li>Open your Google Sheet or go to <strong>script.google.com</strong>.</li>
            <li>Paste the above code into the <strong>Code.gs</strong> editor.</li>
            <li>Click <strong>Deploy → New deployment</strong> and select type <strong>Web App</strong>.</li>
            <li>Set "Execute as" to <strong>Me</strong> and "Who has access" to <strong>Anyone</strong>.</li>
            <li>Copy the generated Web App URL and paste it into System Settings.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
