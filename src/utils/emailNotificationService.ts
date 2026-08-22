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
 * Format any date string or Date object into a clean, professional IST date format
 * e.g. "18 Aug 2026, 02:37 PM IST" - preventing raw browser locale strings like "(印度標準時間)"
 */
export function formatISTDate(dateInput?: string | Date | null): string {
  if (!dateInput) return 'Within SLA Target';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) {
      // If already a formatted string, clean up any messy timezone strings
      return String(dateInput).replace(/\s*\([^)]*\)/g, '').trim();
    }
    
    // Format in English (India) with 12-hour AM/PM and IST suffix
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

/**
 * Convert plain text into an enterprise-grade branded HTML email if no custom HTML is provided
 */
export function generateRichHtmlFromText(options: {
  subject: string;
  recipientName: string;
  textBody: string;
  badgeText?: string;
  badgeColor?: string;
  ticketId?: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
}): string {
  const {
    subject,
    recipientName,
    textBody,
    badgeText = 'NOTIFICATION',
    badgeColor = '#0284c7',
    ticketId,
    actionButtonText = 'Open HelpDesk Portal',
    actionButtonUrl = 'https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app'
  } = options;

  // Split lines into clean paragraphs or formatted lists
  const lines = textBody.split('\n');
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
      if (line.startsWith('Ticket Details:') || line.startsWith('Details:')) {
        formattedHtmlLines.push(`<div style="font-weight: 700; color: #0f172a; margin-top: 14px; margin-bottom: 6px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">${line}</div>`);
      } else if (line.startsWith('Dear ') || line.startsWith('Hello ') || line.startsWith('Namaste ')) {
        formattedHtmlLines.push(`<p style="font-weight: 700; color: #0f172a; font-size: 15px; margin: 0 0 10px 0;">${line}</p>`);
      } else if (line.startsWith('Best regards,') || line.startsWith('Regards,')) {
        formattedHtmlLines.push(`<p style="color: #64748b; font-size: 13px; margin: 18px 0 2px 0;">${line}</p>`);
      } else {
        formattedHtmlLines.push(`<p style="color: #334155; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">${line}</p>`);
      }
    }
  }
  if (inList) {
    formattedHtmlLines.push('</ul>');
  }

  return `
<!DOCTYPE html>
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
                <a href="${actionButtonUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px;" target="_blank">${actionButtonText}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Rathi Buildmart IT Operations & HelpDesk System</div>
              <div>Support & Escalations: <a href="mailto:misrpr@rathibuildmart.com" style="color: #0284c7; text-decoration: none; font-weight: 600;">misrpr@rathibuildmart.com</a></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">Dispatched automatically at ${formatISTDate(new Date())}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Format clean, responsive, high-contrast HTML email for Rathi Buildmart HelpDesk
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
    actionButtonText = 'View & Track Ticket in HelpDesk',
    actionButtonUrl = 'https://ais-pre-og6oceunixmom6wlssthgr-101533959483.asia-east1.run.app',
    footerNote = 'This is an automated notification from Rathi Buildmart IT Operations & HelpDesk System.'
  } = options;

  // Priority color config
  let priorityBg = '#fef2f2';
  let priorityColor = '#dc2626';
  let priorityBorder = '#fecaca';
  if (ticket.priority === 'Critical') {
    priorityBg = '#faf5ff';
    priorityColor = '#7e22ce';
    priorityBorder = '#e9d5ff';
  } else if (ticket.priority === 'High') {
    priorityBg = '#fef2f2';
    priorityColor = '#dc2626';
    priorityBorder = '#fecaca';
  } else if (ticket.priority === 'Medium') {
    priorityBg = '#fffbeb';
    priorityColor = '#b45309';
    priorityBorder = '#fde68a';
  } else if (ticket.priority === 'Low') {
    priorityBg = '#f0fdf4';
    priorityColor = '#15803d';
    priorityBorder = '#bbf7d0';
  }

  // Status color config
  let statusBg = '#eff6ff';
  let statusColor = '#1d4ed8';
  if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
    statusBg = '#f0fdf4';
    statusColor = '#15803d';
  } else if (ticket.status === 'In Progress') {
    statusBg = '#f0f9ff';
    statusColor = '#0369a1';
  } else if (ticket.status === 'Pending') {
    statusBg = '#fff7ed';
    statusColor = '#c2410c';
  }

  const formattedSlaDue = formatISTDate(ticket.slaDueDate);
  const formattedCreated = formatISTDate(ticket.createdDate);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
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

          <!-- Main Content -->
          <tr>
            <td style="padding: 28px 30px;">
              <div style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 6px;">Dear ${recipientName || 'Valued Employee'},</div>
              <div style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">${introMessage}</div>

              <!-- Ticket Overview Box -->
              <table role="presentation" width="100%" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 20px;" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0; background: #f1f5f9; border-top-left-radius: 11px; border-top-right-radius: 11px;">
                    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td>
                          <span style="font-family: monospace; font-size: 16px; font-weight: 800; color: #0284c7; background: #e0f2fe; padding: 3px 10px; border-radius: 6px; border: 1px solid #bae6fd;">${ticket.id}</span>
                        </td>
                        <td align="right">
                          <span style="display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background-color: ${statusBg}; color: ${statusColor};">${ticket.status}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top: 10px;">
                          <div style="font-size: 16px; font-weight: 800; color: #0f172a;">${ticket.subject}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Structured Table Details -->
                <tr>
                  <td style="padding: 16px 20px;">
                    <table role="presentation" width="100%" style="border-collapse: collapse;" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; width: 38%; vertical-align: top;">Category:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 700; vertical-align: top;">
                          ${ticket.category}${ticket.module ? ` &rsaquo; ${ticket.module}` : ''}${ticket.subCategory ? ` &rsaquo; ${ticket.subCategory}` : ''}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Priority:</td>
                        <td style="padding: 7px 0; font-size: 13px; vertical-align: top;">
                          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 800; background-color: ${priorityBg}; color: ${priorityColor}; border: 1px solid ${priorityBorder};">${ticket.priority} Priority</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Department & Branch:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600; vertical-align: top;">
                          ${ticket.department} &bull; ${ticket.location || 'Headquarters'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Raised By:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600; vertical-align: top;">
                          ${ticket.employeeName} (${ticket.employeeEmail || 'No Email'}${ticket.contactNumber ? `, Ph: ${ticket.contactNumber}` : ''})
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Assigned Specialist:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 700; vertical-align: top;">
                          ${ticket.assignedAgentName || 'IT Support Queue (Auto-Routing)'}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">SLA Target Due:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0369a1; font-weight: 700; vertical-align: top;">
                          ${formattedSlaDue}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">Registered On:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #475569; font-weight: 500; vertical-align: top;">
                          ${formattedCreated}
                        </td>
                      </tr>
                      ${additionalInfo.map(item => `
                      <tr>
                        <td style="padding: 7px 0; font-size: 13px; color: #64748b; font-weight: 600; vertical-align: top;">${item.label}:</td>
                        <td style="padding: 7px 0; font-size: 13px; color: #0f172a; font-weight: 600; vertical-align: top;">${item.value}</td>
                      </tr>
                      `).join('')}
                    </table>

                    ${ticket.description ? `
                    <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 6px; letter-spacing: 0.5px;">Ticket Issue Description:</div>
                      <div style="font-size: 13px; line-height: 1.55; color: #334155; background: #ffffff; padding: 12px 14px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${ticket.description}</div>
                    </div>
                    ` : ''}
                  </td>
                </tr>
              </table>

              <!-- Call to action button -->
              <div style="text-align: center; margin-top: 24px;">
                <a href="${actionButtonUrl}" style="display: inline-block; background-color: #0284c7; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 700; letter-spacing: 0.3px;" target="_blank">${actionButtonText}</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.6;">
              <div style="font-weight: 700; color: #334155; margin-bottom: 4px;">Rathi Buildmart HelpDesk Portal</div>
              <div>Support & Escalations: <a href="mailto:misrpr@rathibuildmart.com" style="color: #0284c7; text-decoration: none; font-weight: 600;">misrpr@rathibuildmart.com</a></div>
              <div style="font-size: 11px; color: #94a3b8; margin-top: 8px;">${footerNote}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Dispatch an email notification via Google Apps Script & Server Backend
 */
export async function sendEmailNotification(
  payload: EmailPayload,
  webAppUrl?: string,
  smtpConfig?: { host?: string; port?: number; user?: string; pass?: string; secure?: boolean; senderName?: string }
): Promise<{ success: boolean; message: string; deliveredVia?: string; mailtoUrl?: string; webGmailUrl?: string; error?: string }> {
  try {
    // Ensure htmlBody is populated with rich HTML if not explicitly supplied
    const finalHtmlBody = payload.htmlBody && payload.htmlBody.includes('<') 
      ? payload.htmlBody 
      : generateRichHtmlFromText({
          subject: payload.subject,
          recipientName: payload.recipientName || 'Team Member',
          textBody: payload.body,
          ticketId: payload.ticketId,
          badgeText: payload.eventType === 'ticket_created' ? 'TICKET REGISTERED' : (payload.eventType === 'ticket_closed' ? 'TICKET COMPLETED' : 'HELPDESK ALERT'),
          badgeColor: payload.eventType === 'ticket_created' ? '#059669' : (payload.eventType === 'ticket_closed' ? '#16a34a' : '#0284c7')
        });

    const res = await fetch('/api/google/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        htmlBody: finalHtmlBody,
        webAppUrl,
        smtpConfig
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
  const smtpConfig = (settings.smtpHost && settings.smtpUser && settings.smtpPass) ? {
    host: settings.smtpHost,
    port: settings.smtpPort,
    user: settings.smtpUser,
    pass: settings.smtpPass,
    secure: settings.smtpSecure,
    senderName: settings.smtpSenderName || settings.companyName || 'Rathi Buildmart HelpDesk'
  } : undefined;

  // 1. Resolve Assigned Agent Email
  let assignedAgentEmail = adminEmail;
  let assignedAgentName = ticket.assignedAgentName || 'IT Support Team Specialist';

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
  const formattedSlaDue = formatISTDate(ticket.slaDueDate);
  const formattedCreated = formatISTDate(ticket.createdDate);

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
        { label: 'Registered Date', value: formattedCreated },
        { label: 'Contact Phone', value: ticket.contactNumber || 'Provided during submission' }
      ],
      actionButtonText: 'Track Your Ticket in HelpDesk',
      footerNote: 'You will receive another email confirmation as soon as your ticket is resolved or closed.'
    });

    const employeePlain = `Dear ${ticket.employeeName || 'Employee'},

Your support ticket ${ticket.id} ("${ticket.subject}") has been successfully registered in our queue.

--------------------------------------------------
TICKET DETAILS:
--------------------------------------------------
- Ticket ID: ${ticket.id}
- Subject: ${ticket.subject}
- Category: ${ticket.category}${ticket.module ? ` > ${ticket.module}` : ''}${ticket.subCategory ? ` > ${ticket.subCategory}` : ''}
- Priority: ${ticket.priority}
- Department: ${ticket.department} (${ticket.location || 'Headquarters'})
- Assigned Specialist: ${assignedAgentName}
- SLA Target Due: ${formattedSlaDue}
- Registered On: ${formattedCreated}
${ticket.description ? `\nDescription:\n${ticket.description}\n` : ''}
--------------------------------------------------

Our support team is actively reviewing your request. You will receive further notifications as progress is made.

Best regards,
Rathi Buildmart IT Operations & HelpDesk Team
Support Email: misrpr@rathibuildmart.com`;

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
      scriptUrl,
      smtpConfig
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
        { label: 'SLA Target Due', value: formattedSlaDue }
      ],
      actionButtonText: 'Open & Work on Ticket',
      footerNote: 'Please update the ticket status and add notes as you make progress.'
    });

    const agentPlain = `Hello ${assignedAgentName},

A new support ticket ${ticket.id} ("${ticket.subject}") has been assigned to your queue.

--------------------------------------------------
TICKET SPECIFICATIONS:
--------------------------------------------------
- Ticket ID: ${ticket.id}
- Subject: ${ticket.subject}
- Priority: ${ticket.priority} (Action Required)
- Category: ${ticket.category} > ${ticket.subCategory || 'General'}
- Raised By: ${ticket.employeeName} (${ticket.employeeEmail || 'N/A'}, Phone: ${ticket.contactNumber || 'N/A'})
- Department: ${ticket.department} (${ticket.location || 'Headquarters'})
- SLA Resolution Due: ${formattedSlaDue}
${ticket.description ? `\nDescription:\n${ticket.description}\n` : ''}
--------------------------------------------------

Please log in to the HelpDesk portal to acknowledge and begin work on this ticket.

Best regards,
Rathi Buildmart HelpDesk System`;

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
      scriptUrl,
      smtpConfig
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
  const smtpConfig = (settings.smtpHost && settings.smtpUser && settings.smtpPass) ? {
    host: settings.smtpHost,
    port: settings.smtpPort,
    user: settings.smtpUser,
    pass: settings.smtpPass,
    secure: settings.smtpSecure,
    senderName: settings.smtpSenderName || settings.companyName || 'Rathi Buildmart HelpDesk'
  } : undefined;

  // 1. Resolve Assigned Agent Email
  let assignedAgentEmail = adminEmail;
  let assignedAgentName = ticket.assignedAgentName || 'IT Support Team Specialist';

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
  const closedTimeFormatted = formatISTDate(ticket.closedDate || ticket.resolvedDate || new Date());

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

    const employeePlain = `Dear ${ticket.employeeName || 'Employee'},

Your support ticket ${ticket.id} ("${ticket.subject}") has been officially marked as ${ticket.status}.

--------------------------------------------------
COMPLETION SUMMARY:
--------------------------------------------------
- Ticket ID: ${ticket.id}
- Subject: ${ticket.subject}
- Status: ${ticket.status}
- Completed Date: ${closedTimeFormatted}
- Handled By: ${assignedAgentName}
- Resolution Notes: ${closureNotes || 'Issue verified and resolved successfully.'}
--------------------------------------------------

We value your feedback! Please log in to the HelpDesk portal to rate our support service.

Best regards,
Rathi Buildmart IT Operations & HelpDesk Team
Support Email: misrpr@rathibuildmart.com`;

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
      scriptUrl,
      smtpConfig
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

    const agentPlain = `Hello ${assignedAgentName},

Ticket ${ticket.id} ("${ticket.subject}") raised by ${ticket.employeeName} has been completed (${ticket.status}) at ${closedTimeFormatted}.

--------------------------------------------------
CLOSURE DETAILS:
--------------------------------------------------
- Ticket ID: ${ticket.id}
- Subject: ${ticket.subject}
- Employee: ${ticket.employeeName} (${ticket.employeeEmail || 'N/A'})
- Status: ${ticket.status}
- Closure Timestamp: ${closedTimeFormatted}
- Notes: ${closureNotes || 'Issue resolved.'}
--------------------------------------------------

Best regards,
Rathi Buildmart HelpDesk System`;

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
      scriptUrl,
      smtpConfig
    );
    results.agentSent = agentRes.success;
  }

  return results;
}

