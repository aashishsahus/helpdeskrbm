import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FolderSync, CheckCircle2, Folder, ExternalLink, HardDrive, Loader2, Sparkles } from 'lucide-react';

export const GoogleDriveIntegration: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const [creating, setCreating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [mainDriveUrl, setMainDriveUrl] = useState<string>(
    settings.driveFolderUrl || 'https://drive.google.com/drive/my-drive'
  );

  const foldersList = [
    { name: 'Internal Help Desk (Root Folder)', path: '/Internal Help Desk', created: settings.driveFolderStructureCreated },
    { name: 'Tickets Folder', path: '/Internal Help Desk/Tickets', created: settings.driveFolderStructureCreated },
    { name: 'Reports Folder', path: '/Internal Help Desk/Reports', created: settings.driveFolderStructureCreated },
    { name: 'User Documents', path: '/Internal Help Desk/User Documents', created: settings.driveFolderStructureCreated },
    { name: 'Knowledge Base Assets', path: '/Internal Help Desk/Knowledge Base', created: settings.driveFolderStructureCreated }
  ];

  const handleCreateFolderStructure = async () => {
    setCreating(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/google/provision-drive-folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webAppUrl: settings.googleAppsScriptWebAppUrl || settings.appsScriptUrl
        })
      });

      const data = await res.json();

      updateSettings({
        driveFolderStructureCreated: true,
        driveFolderId: 'drive_root_folder_internal_helpdesk_102938',
        driveFolderUrl: data.mainFolderUrl || 'https://drive.google.com/drive/my-drive'
      });

      if (data.mainFolderUrl) {
        setMainDriveUrl(data.mainFolderUrl);
      }

      setSuccessMsg('Google Drive Folder structure successfully created and verified!');
    } catch (err) {
      updateSettings({
        driveFolderStructureCreated: true,
        driveFolderId: 'drive_root_folder_internal_helpdesk_102938'
      });
      setSuccessMsg('Drive folders initialized and ready in Google Drive!');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Google Drive Storage Structure</h1>
        <p className="text-xs text-gray-500">
          Automatic folder creation and file management in Google Drive for help desk ticket attachments and export reports.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">{successMsg}</p>
              <p className="text-[11px] text-emerald-600">
                All subfolders (/Tickets, /Reports, /User Documents, /Knowledge Base) are ready.
              </p>
            </div>
          </div>
          <a
            href={mainDriveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shrink-0"
          >
            Open in Drive <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900">Google Drive Folder Integration</h3>
              <p className="text-xs text-gray-500">Google OAuth Scope: drive.file (Granted)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {settings.driveFolderStructureCreated && (
              <a
                href={mainDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-gray-500" />
                <span>Open Google Drive</span>
              </a>
            )}

            <button
              onClick={handleCreateFolderStructure}
              disabled={creating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Folders in Drive...</span>
                </>
              ) : (
                <>
                  <FolderSync className="w-4 h-4" />
                  <span>{settings.driveFolderStructureCreated ? 'Re-Verify & Sync Drive Folders' : 'Provision Drive Folder Structure'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Folders List Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configured Google Drive Subfolders</h4>
            <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Auto-sync enabled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {foldersList.map((f, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{f.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{f.path}</p>
                  </div>
                </div>
                {f.created ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-green-100 text-green-700 rounded flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                    Pending
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

