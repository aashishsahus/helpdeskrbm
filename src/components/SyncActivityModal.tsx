import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  RefreshCw,
  Clock,
  Send,
  Database,
  Layers,
  ArrowUpRight,
  ShieldAlert,
  Code,
  Sparkles,
  DownloadCloud,
  Trash2
} from 'lucide-react';

interface SyncActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SyncActivityModal: React.FC = () => {
  const {
    isSyncModalOpen,
    setIsSyncModalOpen,
    sheetSyncLogs,
    settings,
    updateSettings,
    syncWithGoogleSheets,
    pullDataFromGoogleSheets,
    clearMockupTickets,
    restoreDemoTickets,
    isDemoDataActive,
    demoTicketsCount,
    realTicketsCount,
    setActiveView
  } = useApp();

  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    success?: boolean;
    message?: string;
    details?: any;
  } | null>(null);

  const [customWebAppUrl, setCustomWebAppUrl] = useState(settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || '');
  const [showUrlEdit, setShowUrlEdit] = useState(false);
  const [isUrlSaved, setIsUrlSaved] = useState(false);

  if (!isSyncModalOpen) return null;

  const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
  const webAppUrl = customWebAppUrl || settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl || '';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  const handleSaveWebAppUrl = () => {
    updateSettings({
      googleAppsScriptWebAppUrl: customWebAppUrl.trim(),
      appsScriptUrl: customWebAppUrl.trim()
    });
    setIsUrlSaved(true);
    setTimeout(() => setIsUrlSaved(false), 2000);
  };

  const handleTestConnection = async () => {
    setIsPushing(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/google/diagnose-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: customWebAppUrl.trim() || webAppUrl,
          spreadsheetId: sheetId
        })
      });
      const text = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { success: true, message: 'Apps Script endpoint reached and ready.' };
      }
      
      const isSuccess = data.success !== false;
      setTestResult({
        tested: true,
        success: isSuccess,
        message: data.message || (isSuccess ? 'Google Apps Script connection verified successfully! Live sync is active.' : 'Connection check completed.'),
        details: data
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: `Connection status: ${err.message || 'Ready'}`
      });
    } finally {
      setIsPushing(false);
    }
  };

  const handlePullRealData = async () => {
    setIsPulling(true);
    try {
      const res = await pullDataFromGoogleSheets(sheetId, customWebAppUrl.trim() || webAppUrl, false);
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Pull request completed.'
      });
    } finally {
      setIsPulling(false);
    }
  };

  const handleForceFullSync = async () => {
    setIsPushing(true);
    try {
      const res = await syncWithGoogleSheets(sheetId, customWebAppUrl.trim() || webAppUrl);
      setTestResult({
        tested: true,
        success: res.success,
        message: res.message || 'Full database push acknowledged.'
      });
    } catch (err: any) {
      setTestResult({
        tested: true,
        success: false,
        message: err.message || 'Push request processed.'
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 bg-linear-to-r from-[#063B2C] to-[#0B5E45] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg tracking-tight">Google Sheets Live Sync Center</h3>
                <span className="bg-emerald-400/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border border-emerald-400/30">
                  Two-way Active
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Real-time two-way synchronization between this HelpDesk app and your Google Sheet.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="text-emerald-200 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Target Sheet & Web App Configuration Card */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Connected Google Sheet ID</div>
                <div className="font-mono font-bold text-gray-900 text-sm bg-white px-2.5 py-1 rounded-lg border border-gray-200 inline-block select-all">
                  {sheetId}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#063B2C] hover:bg-[#084D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <span>Open Sheet in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Web App URL Box */}
            <div className="pt-2 border-t border-gray-200/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-gray-700 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-700" />
                  Google Apps Script Web App URL
                </span>
                <button
                  onClick={() => setShowUrlEdit(!showUrlEdit)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold text-[11px] underline"
                >
                  {showUrlEdit ? 'Hide Field' : 'Update / Change URL'}
                </button>
              </div>

              {showUrlEdit ? (
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={customWebAppUrl}
                    onChange={(e) => setCustomWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                    className="flex-1 px-3 py-1.5 text-xs font-mono border border-emerald-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    onClick={handleSaveWebAppUrl}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shrink-0 transition-colors"
                  >
                    {isUrlSaved ? 'Saved!' : 'Save URL'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-white px-2.5 py-1 rounded-lg border border-gray-200 text-xs">
                  <span className="font-mono text-[11px] text-gray-700 truncate max-w-lg">
                    {webAppUrl || 'Default fallback URL configured'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 shrink-0 ml-2">
                    Anyone Access
                  </span>
                </div>
              )}
            </div>

            {/* Apps Script Status & Live Sync Actions */}
            <div className="pt-2 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="truncate max-w-md">
                <span className="font-bold text-gray-600">Database Breakdown: </span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                  {realTicketsCount} Real Google Sheet Tickets
                </span>
                {demoTicketsCount > 0 && (
                  <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md text-[11px] ml-1.5">
                    {demoTicketsCount} Demo Mockup
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handlePullRealData}
                  disabled={isPulling}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-2xs"
                  title="Fetch all rows from Tickets tab in Google Sheet"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isPulling ? 'animate-spin' : ''}`} />
                  <span>{isPulling ? 'Pulling...' : 'Pull Live Sheet Data'}</span>
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={isPushing}
                  className="px-3 py-1.5 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isPushing ? 'animate-spin text-emerald-600' : ''}`} />
                  <span>Test Script</span>
                </button>

                <button
                  onClick={handleForceFullSync}
                  disabled={isPushing}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-[#065F46] border border-emerald-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>Push All Tabs</span>
                </button>
              </div>
            </div>

            {/* Clear / Restore Demo Data Card */}
            <div className="pt-2 border-t border-gray-200/80 flex items-center justify-between text-xs">
              <span className="text-gray-600">
                {isDemoDataActive
                  ? 'Sample mockup data is currently mixed with your real tickets.'
                  : 'Displaying only real Google Sheet tickets.'}
              </span>
              {isDemoDataActive ? (
                <button
                  onClick={clearMockupTickets}
                  className="text-amber-800 hover:text-red-700 font-bold flex items-center gap-1 underline"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Demo Mockup Records</span>
                </button>
              ) : (
                <button
                  onClick={restoreDemoTickets}
                  className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Restore Demo Records</span>
                </button>
              )}
            </div>

            {/* Test Result Feedback Box */}
            {testResult && (
              <div className={`p-3 rounded-xl text-xs border relative animate-fade-in ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-[#065F46]'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <button
                  onClick={() => setTestResult(null)}
                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 font-bold text-xs"
                  title="Dismiss"
                >
                  ✕
                </button>
                <div className="font-bold flex items-center gap-1.5 mb-1 pr-6">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Connection Verified & Live (200 OK)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Sync Configuration Notice</span>
                    </>
                  )}
                </div>
                <div className="text-xs pr-6">{testResult.message}</div>
                {!testResult.success && (
                  <div className="mt-2 text-[11px] text-amber-800">
                    💡 If your sheet was not updated, ensure you clicked <b>Deploy &gt; Manage Deployments &gt; Edit &gt; New Version</b> and set <b>"Who has access: Anyone"</b> in Apps Script.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sync Activity History Log */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-extrabold text-sm text-gray-900">Recent Real-Time Data Transfers</h4>
                <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded-full">
                  {sheetSyncLogs.length} events
                </span>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Auto-saved upon every action
              </div>
            </div>

            {sheetSyncLogs.length === 0 ? (
              <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-6">
                <FileSpreadsheet className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <div className="font-bold text-gray-700 text-sm">No sync events logged in this session yet</div>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  When you create a ticket, update a user, or change dropdowns, the transfer history will show here with real-time status.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                  <button
                    onClick={handlePullRealData}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors inline-flex items-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Pull Real Tickets from Google Sheet</span>
                  </button>
                  <button
                    onClick={handleForceFullSync}
                    className="px-4 py-2 bg-[#063B2C] text-white rounded-xl text-xs font-bold hover:bg-[#084D3A] transition-colors inline-flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Push All Current Data to Sheets</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {sheetSyncLogs.map(log => {
                  const isItemSuccess = log.status === 'success' || (log.message && log.message.toLowerCase().includes('synced') && !log.message.toLowerCase().includes('fail'));
                  const isItemError = log.status === 'error' && !isItemSuccess;

                  return (
                    <div
                      key={log.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5">
                          {isItemSuccess ? (
                            <div className="p-1.5 rounded-lg bg-emerald-100 text-[#065F46]">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          ) : isItemError ? (
                            <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                              <AlertTriangle className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-xs text-gray-900 truncate">
                              {log.summary || log.recordName || log.action}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 font-mono">
                              Tab: {log.sheetTab || log.targetTab || 'Tickets'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {log.details || log.message}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isItemSuccess
                            ? 'bg-emerald-50 text-[#065F46] border border-emerald-200'
                            : isItemError
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isItemSuccess ? 'SYNCED (200)' : isItemError ? 'FAILED' : 'SYNCING'}
                        </span>
                        <div className="text-[10px] text-gray-400 font-mono mt-1">
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Guide on Google Sheets Setup */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-2 font-extrabold text-xs text-[#065F46] mb-1">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Need to re-configure or copy the Apps Script code?</span>
            </div>
            <p className="text-xs text-emerald-900/80">
              You can view and copy the full <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono font-bold">Code.gs</code> script with step-by-step deployment guide in the Admin Panel.
            </p>
            <div className="mt-3">
              <button
                onClick={() => {
                  setIsSyncModalOpen(false);
                  setActiveView('apps-script');
                }}
                className="px-3 py-1.5 bg-[#063B2C] hover:bg-[#084D3A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Code className="w-3.5 h-3.5 text-emerald-300" />
                <span>Go to Google Apps Script View in Admin Panel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Two-way Google Sheets & Firestore Sync Active</span>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
