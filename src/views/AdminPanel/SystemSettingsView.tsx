import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, CheckCircle2, ShieldCheck, Database, HardDrive, Bell } from 'lucide-react';

export const SystemSettingsView: React.FC = () => {
  const { settings, updateSettings, syncWithGoogleSheets } = useApp();

  const [systemName, setSystemName] = useState(settings.systemName || 'Apex HelpDesk Pro');
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail || 'misrpr@rathibuildmart.com');
  const [spreadsheetId, setSpreadsheetId] = useState(settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow');
  const [webAppUrl, setWebAppUrl] = useState(settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || 'https://script.google.com/macros/s/AKfycbwIW9GcL2_foursv0rb6sYPp8FYVtN6KDK3fi2enUOkI-jSnTrNIO-kSRtZDDiV0G5G/exec');
  const [driveFolderId, setDriveFolderId] = useState(settings.driveFolderId || '1e9Nu2qsZgOVn36VAnZts18LINrjR_1bR');
  const [ticketPrefix, setTicketPrefix] = useState(settings.ticketIdPrefix || 'HD-');
  const [autoAssignment, setAutoAssignment] = useState(settings.autoAssignmentEnabled ?? true);
  const [emailNotifs, setEmailNotifs] = useState(settings.emailNotificationsEnabled ?? true);
  const [slaAlerts, setSlaAlerts] = useState(settings.slaBreachAlertsEnabled ?? true);

  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string; spreadsheetUrl?: string } | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      systemName,
      companyName,
      supportEmail,
      spreadsheetId,
      appsScriptUrl: webAppUrl,
      googleAppsScriptWebAppUrl: webAppUrl,
      driveFolderId,
      ticketIdPrefix: ticketPrefix,
      autoAssignmentEnabled: autoAssignment,
      emailNotificationsEnabled: emailNotifs,
      slaBreachAlertsEnabled: slaAlerts
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePushAllDataToGoogleSheet = async () => {
    setSyncing(true);
    setSyncResult(null);

    updateSettings({
      spreadsheetId,
      appsScriptUrl: webAppUrl,
      googleAppsScriptWebAppUrl: webAppUrl,
      driveFolderId
    });

    const res = await syncWithGoogleSheets(spreadsheetId, webAppUrl);
    setSyncing(false);
    setSyncResult(res);
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">System & Database Settings</h1>
        <p className="text-xs text-gray-500">Configure core application parameters, Google Workspace IDs, and live Google Sheets automation.</p>
      </div>

      {saved && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {syncResult && (
        <div className={`p-4 rounded-xl text-xs font-medium border space-y-2 ${syncResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
          <div className="flex items-center justify-between font-bold text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{syncResult.message}</span>
            </div>
            {spreadsheetId && (
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-xs"
              >
                <span>Open Google Sheet</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company & General Config Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" /> General Help Desk Configuration
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-gray-700 mb-1">System Name</label>
              <input
                type="text"
                value={systemName}
                onChange={e => setSystemName(e.target.value)}
                className="w-full p-2 border rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Support Email Address</label>
              <input
                type="email"
                value={supportEmail}
                onChange={e => setSupportEmail(e.target.value)}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="block font-bold text-gray-700 mb-1">Ticket ID Prefix</label>
            <input
              type="text"
              value={ticketPrefix}
              onChange={e => setTicketPrefix(e.target.value)}
              className="w-full p-2 border rounded-lg font-mono font-bold"
            />
          </div>
        </div>

        {/* Google Workspace Identifiers Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" /> Google Sheets & Drive Connections
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block font-bold text-gray-700 mb-1">Google Sheet ID (Primary Database)</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={e => setSpreadsheetId(e.target.value)}
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full p-2 border rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Google Apps Script Web App Endpoint URL</label>
              <input
                type="text"
                value={webAppUrl}
                onChange={e => setWebAppUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full p-2 border rounded-lg font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-gray-700 mb-1">Google Drive Root Folder ID</label>
              <input
                type="text"
                value={driveFolderId}
                onChange={e => setDriveFolderId(e.target.value)}
                placeholder="drive_root_folder_internal_helpdesk_102938"
                className="w-full p-2 border rounded-lg font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* System Automation Toggles Card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
            <Bell className="w-4 h-4 text-amber-600" /> Automation Triggers
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <div>
                <p className="font-bold text-gray-900">Auto Ticket Assignment</p>
                <p className="text-[10px] text-gray-500">Route tickets automatically based on category</p>
              </div>
              <input
                type="checkbox"
                checked={autoAssignment}
                onChange={e => setAutoAssignment(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <div>
                <p className="font-bold text-gray-900">Gmail Email Notifications</p>
                <p className="text-[10px] text-gray-500">Send Gmail updates on ticket creation and resolution</p>
              </div>
              <input
                type="checkbox"
                checked={emailNotifs}
                onChange={e => setEmailNotifs(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
              <div>
                <p className="font-bold text-gray-900">SLA Breach Warning Alerts</p>
                <p className="text-[10px] text-gray-500">Notify managers when tickets near SLA target</p>
              </div>
              <input
                type="checkbox"
                checked={slaAlerts}
                onChange={e => setSlaAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <a
            href={`https://docs.google.com/spreadsheets/d/${spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow'}/edit`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            <span>Open Google Sheet (Database)</span>
            <span className="text-[10px]">↗</span>
          </a>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePushAllDataToGoogleSheet}
              disabled={syncing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{syncing ? 'Syncing Data...' : 'Push All Data to Google Sheet Now'}</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
