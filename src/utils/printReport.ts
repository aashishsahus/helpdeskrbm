/**
 * Dedicated Executive Print & PDF Utility for RBM Help Desk Reports
 * Works reliably inside iframes, standalone tabs, and browser sandboxes.
 */

export interface ReportPrintData {
  reportTitle: string;
  companyName: string;
  generatedDate: string;
  kpis: {
    totalTickets: number;
    resolutionRate: number;
    slaComplianceRate: number;
    openTickets: number;
  };
  headers: string[];
  rows: (string | number)[][];
  summaryNotes?: string;
}

export function printExecutiveReport(data: ReportPrintData): void {
  const { reportTitle, companyName, generatedDate, kpis, headers, rows, summaryNotes } = data;

  const tableHeadersHtml = headers
    .map(h => `<th style="background:#064e3b;color:#ffffff;padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;border:1px solid #064e3b;letter-spacing:0.5px;">${h}</th>`)
    .join('');

  const tableRowsHtml = rows
    .map((row, idx) => {
      const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
      const cells = row
        .map((cell, cIdx) => {
          const isNum = typeof cell === 'number' || (!isNaN(Number(cell)) && !isNaN(parseFloat(String(cell))));
          const align = cIdx > 0 && isNum ? 'text-align:center;' : 'text-align:left;';
          return `<td style="padding:7px 10px;border:1px solid #e5e7eb;font-size:11px;${align}">${cell}</td>`;
        })
        .join('');
      return `<tr style="background:${bg};">${cells}</tr>`;
    })
    .join('');

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>${reportTitle} - ${companyName}</title>
      <style>
        @page {
          size: landscape;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          color: #111827;
          background: #ffffff;
          margin: 0;
          padding: 16px;
          font-size: 11px;
          line-height: 1.4;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2.5px solid #065f46;
          padding-bottom: 12px;
          margin-bottom: 14px;
        }
        .title {
          font-size: 20px;
          font-weight: 900;
          color: #064e3b;
          margin: 0 0 4px 0;
          letter-spacing: -0.5px;
        }
        .subtitle {
          font-size: 12px;
          color: #374151;
          font-weight: 600;
        }
        .meta {
          text-align: right;
          font-size: 10px;
          color: #6b7280;
          font-family: monospace;
        }
        .badge {
          display: inline-block;
          background: #d1fae5;
          color: #065f46;
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 700;
          font-size: 9px;
          text-transform: uppercase;
          border: 1px solid #a7f3d0;
          margin-bottom: 4px;
        }
        .kpi-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .kpi-card {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 8px 12px;
          background: #f9fafb;
        }
        .kpi-label {
          font-size: 9px;
          text-transform: uppercase;
          color: #6b7280;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .kpi-value {
          font-size: 18px;
          font-weight: 900;
          color: #111827;
          margin-top: 2px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 6px;
          page-break-inside: auto;
        }
        tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        .footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          font-size: 9px;
          color: #9ca3af;
          font-family: monospace;
        }
        @media print {
          body {
            padding: 0;
          }
          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1 class="title">${companyName}</h1>
          <div class="subtitle">Executive Operations Report: ${reportTitle}</div>
        </div>
        <div class="meta">
          <div class="badge">Official Report</div>
          <div>Generated: ${generatedDate}</div>
          <div>System: Live Production Database</div>
        </div>
      </div>

      <div class="kpi-strip">
        <div class="kpi-card">
          <div class="kpi-label">Total Logged Tickets</div>
          <div class="kpi-value">${kpis.totalTickets}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Resolution Rate</div>
          <div class="kpi-value" style="color:#059669;">${kpis.resolutionRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">SLA Compliance</div>
          <div class="kpi-value" style="color:#2563eb;">${kpis.slaComplianceRate}%</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-label">Active Queue</div>
          <div class="kpi-value" style="color:#d97706;">${kpis.openTickets}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>${tableHeadersHtml}</tr>
        </thead>
        <tbody>
          ${tableRowsHtml}
        </tbody>
      </table>

      ${summaryNotes ? `<p style="margin-top:14px;font-size:10px;color:#6b7280;"><em>Note: ${summaryNotes}</em></p>` : ''}

      <div class="footer">
        <span>RBM HelpDesk Pro — Enterprise Operations Analytics</span>
        <span>Executive Certified • Page 1</span>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.focus();
            window.print();
          }, 250);
        };
      </script>
    </body>
    </html>
  `;

  // Method 1: Use hidden iframe (100% iframe-safe in Chrome, Safari, Edge, Firefox)
  try {
    let printIframe = document.getElementById('app-print-helper-iframe') as HTMLIFrameElement;
    if (!printIframe) {
      printIframe = document.createElement('iframe');
      printIframe.id = 'app-print-helper-iframe';
      printIframe.style.position = 'fixed';
      printIframe.style.right = '0';
      printIframe.style.bottom = '0';
      printIframe.style.width = '0';
      printIframe.style.height = '0';
      printIframe.style.border = '0';
      printIframe.style.visibility = 'hidden';
      document.body.appendChild(printIframe);
    }

    const iframeDoc = printIframe.contentDocument || printIframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(html);
      iframeDoc.close();

      setTimeout(() => {
        try {
          printIframe.contentWindow?.focus();
          printIframe.contentWindow?.print();
        } catch (printErr) {
          console.warn('Iframe print blocked, falling back to window.open', printErr);
          openPrintWindowFallback(html, reportTitle);
        }
      }, 350);
      return;
    }
  } catch (err) {
    console.warn('Iframe injection error, trying window.open:', err);
  }

  // Method 2: Fallback window.open
  openPrintWindowFallback(html, reportTitle);
}

function openPrintWindowFallback(html: string, title: string) {
  try {
    const printWindow = window.open('', '_blank', 'width=1000,height=750');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } else {
      // If popup blocker stopped it, trigger standard print
      window.print();
    }
  } catch {
    window.print();
  }
}

/**
 * Downloads report table data directly as CSV
 */
export function downloadReportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCsv = (val: string | number) => {
    const str = String(val ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
