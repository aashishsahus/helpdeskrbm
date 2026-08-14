import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  ArrowRight,
  Database
} from 'lucide-react';

export const GoogleSheetSyncToast: React.FC = () => {
  const { activeSyncToast, dismissSyncToast, setIsSyncModalOpen, settings } = useApp();

  if (!activeSyncToast) return null;

  const sheetId = settings.spreadsheetId || '1gvVSa5rvj8b-ygXxc_dHXQ9y8dH52andFgnLaYft7ow';
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

  return (
    <div
      id="google-sheet-live-sync-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto"
    >
      <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all ${
        activeSyncToast.status === 'success'
          ? 'bg-[#063B2C]/95 text-white border-emerald-500/50 shadow-emerald-950/40'
          : activeSyncToast.status === 'error'
          ? 'bg-[#450A0A]/95 text-white border-red-500/50 shadow-red-950/40'
          : 'bg-[#0F172A]/95 text-white border-blue-500/50 shadow-blue-950/40'
      }`}>
        <div className="flex items-start gap-3">
          {/* Status Icon */}
          <div className="shrink-0 mt-0.5">
            {activeSyncToast.status === 'syncing' ? (
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : activeSyncToast.status === 'success' ? (
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black tracking-wider uppercase bg-white/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
                  Google Sheet Sync
                </span>
                <span className="text-[10px] font-bold text-white/70 bg-white/5 px-2 py-0.5 rounded-full font-mono">
                  Tab: {activeSyncToast.targetTab}
                </span>
              </div>
              <button
                onClick={dismissSyncToast}
                className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-1.5 font-extrabold text-sm text-white truncate">
              {activeSyncToast.recordName}
            </div>

            <div className="text-xs text-white/80 mt-0.5 line-clamp-2">
              {activeSyncToast.message}
            </div>

            {/* Quick Actions */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
              <button
                onClick={() => {
                  dismissSyncToast();
                  setIsSyncModalOpen(true);
                }}
                className={`font-bold flex items-center gap-1 transition-colors ${
                  activeSyncToast.status === 'error'
                    ? 'text-amber-300 hover:text-amber-200 underline'
                    : 'text-emerald-300 hover:text-emerald-200'
                }`}
              >
                <span>{activeSyncToast.status === 'error' ? 'Fix & Update Web App URL' : 'View Sync Activity Log'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
              >
                <span>Open Sheet</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
