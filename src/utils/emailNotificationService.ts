import { Ticket, User, SystemSettings } from '../types';

export interface EmailPayload {
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  body: string;
  htmlBody?: string;
  ticketId?: string;
  eventType?: 'ticket_created' | 'ticket_closed' | 'ticket_updated' | 'general';
}

/**
 * Format clean, branded HTML email for Rathi Buildmart HelpDesk
 */
export function generateHtmlEmailTemplate(options: {
  title: string;
  badgeText: string;
  badgeColor: string;
  recipientName: string;
  headline: string;
  introMessage: string;
  ticket: Ticket;
  additionalInfo?: { label: string; value: string }[];
  actionButtonText?: string;
  actionButtonUrl?: string;
  footerNote?: string;
}): string {
  const {
    title,
    badgeText,
    badgeColor,
    recipientName,
    headline,
    introMessage,
    ticket,
    additionalInfo = [],
    actionButtonText = 'View Ticket in HelpDesk',
    actionButtonUrl = 'https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app',
    footerNote = 'This is an automated notification from Rathi Buildmart HelpDesk System.'
  } = options;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
    .email-header { background: linear-gradient(135deg, #064e3b 0%, #0f172a 100%); color: #ffffff; padding: 24px 30px; text-align: left; }
    .brand-title { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; margin: 0; display: flex; align-items: center; gap: 8px; }
    .brand-subtitle { font-size: 12px; color: #94a3b8; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; background-color: ${badgeColor}; color: #ffffff; }
    .content-body { padding: 30px; }
    .greeting { font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px; }
    .ticket-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px; }
    .ticket-header { border-bottom: 1px solid #cbd5e1; padding-bottom: 12px; margin-bottom: 14px; }
    .ticket-id { font-size: 18px; font-weight: 800; color: #0284c7; font-family: monospace; }
    .ticket-subject { font-size: 16px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .info-grid { width: 100%; border-collapse: collapse; }
    .info-grid td { padding: 6px 0; font-size: 13px; vertical-align: top; }
    .info-label { color: #64748b; font-weight: 600; width: 38%; }
    .info-value { color: #0f172a; font-weight: 600; }
    .description-box { margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1; }
    .description-title { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    .description-text { font-size: 13px; line-height: 1.5; color: #334155; white-space: pre-wrap; background: #ffffff; padding: 10px 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
    .action-btn { display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 10px; font-size: 14px; font-weight: 700; text-align: center; margin: 10px 0 20px 0; }
    .footer { background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5; }
    .priority-High { color: #dc2626; font-weight: 800; }
    .priority-Medium { color: #d97706; font-weight: 800; }
    .priority-Low { color: #16a34a; font-weight: 800; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="brand-title">🏢 Rathi Buildmart HelpDesk</div>
      <div class="brand-subtitle">Enterprise IT & Facilities Operations</div>
      <span class="badge">${badgeText}</span>
    </div>

    <div class="content-body">
      <div class="greeting">Dear ${recipientName || 'Team Member'},</div>
      <div class="intro">${introMessage}</div>

      <div class="ticket-card">
        <div class="ticket-header">
          <div class="ticket-id">${ticket.id}</div>
          <div class="ticket-subject">${ticket.subject}</div>
        </div>

        <table class="info-grid">
          <tr>
            <td class="info-label">Status:</td>
            <td class="info-value"><strong>${ticket.status}</strong></td>
          </tr>
          <tr>
            <td class="info-label">Priority:</td>
            <td class="info-value"><span class="priority-${ticket.priority}">${ticket.priority}</span></td>
          </tr>
          <tr>
            <td class="info-label">Category:</td>
            <td class="info-value">${ticket.category} &rsaquo; ${ticket.subCategory || 'General'}</td>
          </tr>
          <tr>
            <td class="info-label">Department / Branch:</td>
            <td class="info-value">${ticket.department} (${ticket.location})</td>
          </tr>
          <tr>
            <td class="info-label">Raised By:</td>
            <td class="info-value">${ticket.employeeName} (${ticket.employeeEmail})</td>
          </tr>
          <tr>
            <td class="info-label">Assigned Agent:</td>
            <td class="info-value"><strong>${ticket.assignedAgentName || 'Assigned Support Specialist'}</strong></td>
          </tr>
          <tr>
            <td class="info-label">SLA Target Due:</td>
            <td class="info-value">${ticket.slaDueDate ? new Date(ticket.slaDueDate).toLocaleString() : 'Standard 24h SLA'}</td>
          </tr>
          ${additionalInfo.map(item => `
          <tr>
            <td class="info-label">${item.label}:</td>
            <td class="info-value">${item.value}</td>
          </tr>
          `).join('')}
        </table>

        ${ticket.description ? `
        <div class="description-box">
          <div class="description-title">Ticket Description:</div>
          <div class="description-text">${ticket.description}</div>
        </div>
        ` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${actionButtonUrl}" class="action-btn" target="_blank">${actionButtonText}</a>
      </div>
    </div>

    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>Rathi Buildmart HelpDesk Portal</strong></p>
      <p style="margin: 0 0 4px 0;">Support Email: <a href="mailto:misrpr@rathibuildmart.com" style="color: #0284c7;">misrpr@rathibuildmart.com</a></p>
      <p style="margin: 0; font-size: 11px; color: #94a3b8;">${footerNote}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Dispatch an email notification via Google Apps Script & Server Backend
 */
export async function sendEmailNotification(
  payload: EmailPayload,
  webAppUrl?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch('/api/google/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        webAppUrl
      })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    console.warn('Email notification dispatch error:', err);
    return {
      success: false,
      message: err.message || 'Failed to dispatch email'
    };
  }
}

/**
 * Dispatch confirmation email to BOTH Employee and Assigned Agent / Support Admin
 * when a new ticket is raised (created).
 */
export async function sendTicketRaisedEmails(
  ticket: Ticket,
  allUsers: User[],
  settings: SystemSettings
): Promise<{ employeeSent: boolean; agentSent: boolean }> {
  const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;
  const adminEmail = settings.supportEmail || 'misrpr@rathibuildmart.com';

  // 1. Resolve Assigned Agent Email
  let assignedAgentEmail = adminEmail;
  let assignedAgentName = ticket.assignedAgentName || 'Support Team Specialist';

  if (ticket.assignedAgentId || ticket.assignedAgentName) {
    const agentUser = allUsers.find(
      u => u.id === ticket.assignedAgentId || u.name === ticket.assignedAgentName || u.employeeId === ticket.assignedAgentId
    );
    if (agentUser && agentUser.email) {
      assignedAgentEmail = agentUser.email;
      assignedAgentName = agentUser.name;
    }
  }

  const results = { employeeSent: false, agentSent: false };

  // 2. Email to EMPLOYEE (Ticket Creator Confirmation)
  if (ticket.employeeEmail) {
    const employeeHtml = generateHtmlEmailTemplate({
      title: `Ticket Confirmation - ${ticket.id}`,
      badgeText: 'Ticket Registered Successfully',
      badgeColor: '#059669', // Emerald
      recipientName: ticket.employeeName || 'Valued Employee',
      headline: 'Your HelpDesk Ticket has been Registered',
      introMessage: `Your support ticket has been received and registered in our queue. Our IT & Operations team has been notified and will address your request within the SLA timeframe.`,
      ticket,
      additionalInfo: [
        { label: 'Registered On', value: new Date(ticket.createdDate).toLocaleString() },
        { label: 'Contact Number', value: ticket.contactNumber || 'Provided during submission' }
      ],
      actionButtonText: 'Track Your Ticket Status',
      footerNote: 'You will receive another email confirmation as soon as your ticket is resolved or closed.'
    });

    const employeePlain = `Dear ${ticket.employeeName},\n\nYour support ticket ${ticket.id} ("${ticket.subject}") has been successfully registered.\n\nDetails:\n- Ticket ID: ${ticket.id}\n- Category: ${ticket.category} (${ticket.subCategory})\n- Priority: ${ticket.priority}\n- Assigned Specialist: ${assignedAgentName}\n- SLA Target: ${ticket.slaDueDate}\n\nOur team is working on your request.\n\nBest regards,\nRathi Buildmart HelpDesk Team`;

    const empRes = await sendEmailNotification(
      {
        recipientEmail: ticket.employeeEmail,
        recipientName: ticket.employeeName,
        subject: `[HelpDesk Confirmation] Ticket ${ticket.id} Registered: ${ticket.subject}`,
        body: employeePlain,
        htmlBody: employeeHtml,
        ticketId: ticket.id,
        eventType: 'ticket_created'
      },
      scriptUrl
    );
    results.employeeSent = empRes.success;
  }

  // 3. Email to ASSIGNED AGENT / ADMIN (Action Required Alert)
  const agentTargetEmail = assignedAgentEmail || adminEmail;
  if (agentTargetEmail && agentTargetEmail !== ticket.employeeEmail) {
    const agentHtml = generateHtmlEmailTemplate({
      title: `New Ticket Assigned - ${ticket.id}`,
      badgeText: 'New Ticket Assigned to You',
      badgeColor: '#0284c7', // Sky Blue
      recipientName: assignedAgentName,
      headline: 'New Support Ticket Assignment',
      introMessage: `A new support request has been raised by <strong>${ticket.employeeName}</strong> and assigned to your queue. Please review the details below and take necessary action.`,
      ticket,
      additionalInfo: [
        { label: 'Employee Email', value: ticket.employeeEmail || 'N/A' },
        { label: 'Employee Phone', value: ticket.contactNumber || 'N/A' },
        { label: 'SLA Target Due', value: ticket.slaDueDate ? new Date(ticket.slaDueDate).toLocaleString() : 'Standard 24h' }
      ],
      actionButtonText: 'Open & Work on Ticket',
      footerNote: 'Please update the ticket status and add notes as you make progress.'
    });

    const agentPlain = `Hello ${assignedAgentName},\n\nA new ticket ${ticket.id} ("${ticket.subject}") has been assigned to you.\n\nRaised By: ${ticket.employeeName} (${ticket.employeeEmail}, Phone: ${ticket.contactNumber || 'N/A'})\nDepartment: ${ticket.department} (${ticket.location})\nCategory: ${ticket.category} - ${ticket.subCategory}\nPriority: ${ticket.priority}\nSLA Due: ${ticket.slaDueDate}\n\nDescription:\n${ticket.description}\n\nPlease take appropriate action in the HelpDesk portal.\n\nBest regards,\nHelpDesk System`;

    const agentRes = await sendEmailNotification(
      {
        recipientEmail: agentTargetEmail,
        recipientName: assignedAgentName,
        subject: `[HelpDesk New Assignment] Ticket ${ticket.id} (${ticket.priority}): ${ticket.subject}`,
        body: agentPlain,
        htmlBody: agentHtml,
        ticketId: ticket.id,
        eventType: 'ticket_created'
      },
      scriptUrl
    );
    results.agentSent = agentRes.success;
  }

  return results;
}

/**
 * Dispatch completion email to BOTH Employee and Assigned Agent / Support Admin
 * when a ticket is closed or resolved.
 */
export async function sendTicketClosedEmails(
  ticket: Ticket,
  allUsers: User[],
  settings: SystemSettings,
  closureNotes?: string
): Promise<{ employeeSent: boolean; agentSent: boolean }> {
  const scriptUrl = settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl;
  const adminEmail = settings.supportEmail || 'misrpr@rathibuildmart.com';

  // 1. Resolve Assigned Agent Email
  let assignedAgentEmail = adminEmail;
  let assignedAgentName = ticket.assignedAgentName || 'Support Team Specialist';

  if (ticket.assignedAgentId || ticket.assignedAgentName) {
    const agentUser = allUsers.find(
      u => u.id === ticket.assignedAgentId || u.name === ticket.assignedAgentName || u.employeeId === ticket.assignedAgentId
    );
    if (agentUser && agentUser.email) {
      assignedAgentEmail = agentUser.email;
      assignedAgentName = agentUser.name;
    }
  }

  const results = { employeeSent: false, agentSent: false };
  const closedTimeFormatted = new Date().toLocaleString();

  // 2. Email to EMPLOYEE (Ticket Closed / Resolved Confirmation + Rating Request)
  if (ticket.employeeEmail) {
    const employeeHtml = generateHtmlEmailTemplate({
      title: `Ticket ${ticket.id} Closed & Resolved`,
      badgeText: `Ticket ${ticket.status.toUpperCase()}`,
      badgeColor: '#16a34a', // Green
      recipientName: ticket.employeeName || 'Valued Employee',
      headline: `Your Ticket ${ticket.id} has been ${ticket.status}`,
      introMessage: `Your support request <strong>"${ticket.subject}"</strong> has been completed and marked as <strong>${ticket.status}</strong> by our support team.`,
      ticket,
      additionalInfo: [
        { label: 'Closed Date & Time', value: closedTimeFormatted },
        { label: 'Handled By', value: assignedAgentName },
        { label: 'Resolution Notes', value: closureNotes || 'Issue verified and resolved successfully.' }
      ],
      actionButtonText: 'Rate Support Experience (1-5 Stars)',
      footerNote: 'Please take 10 seconds to submit your satisfaction rating in the HelpDesk portal.'
    });

    const employeePlain = `Dear ${ticket.employeeName},\n\nYour support ticket ${ticket.id} ("${ticket.subject}") has been marked as ${ticket.status}.\n\nClosed Date: ${closedTimeFormatted}\nHandled By: ${assignedAgentName}\nResolution Notes: ${closureNotes || 'Issue verified and resolved.'}\n\nWe value your feedback! Please log in to rate our service.\n\nBest regards,\nRathi Buildmart HelpDesk Team`;

    const empRes = await sendEmailNotification(
      {
        recipientEmail: ticket.employeeEmail,
        recipientName: ticket.employeeName,
        subject: `[HelpDesk ${ticket.status}] Ticket ${ticket.id} Completed: ${ticket.subject}`,
        body: employeePlain,
        htmlBody: employeeHtml,
        ticketId: ticket.id,
        eventType: 'ticket_closed'
      },
      scriptUrl
    );
    results.employeeSent = empRes.success;
  }

  // 3. Email to ASSIGNED AGENT / ADMIN (Closure Confirmation Record)
  const agentTargetEmail = assignedAgentEmail || adminEmail;
  if (agentTargetEmail) {
    const agentHtml = generateHtmlEmailTemplate({
      title: `Ticket ${ticket.id} Closed Confirmation`,
      badgeText: `Ticket ${ticket.status.toUpperCase()}`,
      badgeColor: '#475569', // Slate
      recipientName: assignedAgentName,
      headline: `Ticket ${ticket.id} Officially Closed`,
      introMessage: `Support ticket <strong>${ticket.id}</strong> submitted by <strong>${ticket.employeeName}</strong> has been officially marked as <strong>${ticket.status}</strong> and logged to the database.`,
      ticket,
      additionalInfo: [
        { label: 'Employee Email', value: ticket.employeeEmail || 'N/A' },
        { label: 'Closure Time', value: closedTimeFormatted },
        { label: 'Notes', value: closureNotes || 'Marked as completed.' }
      ],
      actionButtonText: 'View in HelpDesk Directory',
      footerNote: 'Ticket record archived in Google Sheets with complete audit trail.'
    });

    const agentPlain = `Hello ${assignedAgentName},\n\nTicket ${ticket.id} ("${ticket.subject}") raised by ${ticket.employeeName} has been closed (${ticket.status}) at ${closedTimeFormatted}.\n\nNotes: ${closureNotes || 'Issue resolved.'}\n\nBest regards,\nHelpDesk System`;

    const agentRes = await sendEmailNotification(
      {
        recipientEmail: agentTargetEmail,
        recipientName: assignedAgentName,
        subject: `[HelpDesk Closed] Ticket ${ticket.id} Completed: ${ticket.subject}`,
        body: agentPlain,
        htmlBody: agentHtml,
        ticketId: ticket.id,
        eventType: 'ticket_closed'
      },
      scriptUrl
    );
    results.agentSent = agentRes.success;
  }

  return results;
}
