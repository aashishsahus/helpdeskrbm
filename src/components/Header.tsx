import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LoginModal } from './LoginModal';
import { ProfileSelectorModal } from './ProfileSelectorModal';
import {
  Search,
  Bell,
  Plus,
  Crown,
  CheckCircle2,
  FileSpreadsheet,
  X,
  LogIn,
  ChevronDown,
  RotateCw,
  Database,
  CloudCheck,
  UserCheck,
  MapPin,
  Mail,
  User as UserIcon,
  LogOut,
  Users
} from 'lucide-react';
import { UserRole, User } from '../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationAsRead,
    setIsCreateTicketOpen,
    globalSearchQuery,
    setGlobalSearchQuery
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserSwitchOpen, setIsUserSwitchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const unreadNotifs = currentUser
    ? notifications.filter(n => !n.read && n.userId === currentUser.id)
    : [];

  // Get all profiles associated with the current email
  const userProfilesForCurrentEmail = currentUser
    ? users.filter(u => u.email.toLowerCase() === currentUser.email.toLowerCase())
    : [];

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Guest';

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const handleLogout = () => {
    setIsUserSwitchOpen(false);
    setCurrentUser(null);
    setIsLoginModalOpen(true);
  };

  return (
    <>
      <header id="app-header" className="h-14 bg-white/95 backdrop-blur-xs border-b border-gray-200/80 flex items-center justify-between px-4 shrink-0 z-20 select-none print:hidden">
        {/* Left Status Pills */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-2xs">
            <span className="text-gray-500 font-bold text-[11px]">Database:</span>
            <span className="font-bold text-gray-900 text-[11px]">Google Sheet & Firestore</span>
            <span className="bg-emerald-100 text-[#065F46] border border-emerald-300 font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 ml-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>ONLINE</span>
            </span>
          </div>
        </div>

        {/* Right Status Controls & Actions */}
        <div className="flex items-center gap-2.5">
          {/* Active Profile Dropdown Pill or Sign In Button */}
          {!currentUser ? (
            <button
              id="header-login-trigger-btn"
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#063B2C] hover:bg-[#084D3A] text-white rounded-full text-xs font-extrabold transition-all shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In to Portal</span>
            </button>
          ) : (
            <div className="relative">
              <button
                id="user-profile-dropdown-btn"
                onClick={() => setIsUserSwitchOpen(!isUserSwitchOpen)}
                className="flex items-center gap-2 px-3 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-[#063B2C] border border-emerald-200 rounded-full text-xs font-bold transition-all shadow-2xs group"
                title="View Profile & Switch Account"
              >
                <div className="w-5 h-5 rounded-full bg-[#063B2C] text-emerald-300 flex items-center justify-center font-black text-[10px] border border-emerald-400/40">
                  {currentUser?.avatarUrl ? (
                    <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{firstName.charAt(0)}</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-gray-900">{firstName}</span>
                  <span className="text-[10px] font-bold bg-[#10B981] text-[#031A12] px-1.5 py-0.2 rounded-full font-mono">
                    {currentUser?.location || 'RPR'}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700 ml-0.5 group-hover:translate-y-0.5 transition-transform" />
              </button>

              {/* Profile Dropdown Menu */}
              {isUserSwitchOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50 animate-in fade-in duration-150">
                  {/* Profile Card Summary */}
                  <div className="p-3.5 bg-[#063B2C] text-white rounded-xl mb-2">
                    <div className="flex items-center justify-between text-[10px] text-emerald-300 font-bold uppercase tracking-wider mb-1">
                      <span>Active Session</span>
                      <span className="bg-emerald-800/80 px-1.5 py-0.5 rounded text-emerald-200 font-mono">
                        {currentUser?.role}
                      </span>
                    </div>
                    <div className="font-extrabold text-base leading-tight flex items-center justify-between">
                      <span>{currentUser?.name}</span>
                    </div>
                    <div className="text-xs text-emerald-200/90 truncate flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3 text-emerald-300 shrink-0" />
                      <span className="truncate">{currentUser?.email}</span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-emerald-700/60 flex items-center justify-between text-[11px] text-emerald-100">
                      <div className="flex items-center gap-1 font-bold">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        <span>{currentUser?.location || 'RPR'}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded-full font-medium">
                        {currentUser?.department}
                      </span>
                    </div>
                  </div>

                {/* Profile Menu Actions */}
                <div className="space-y-1 my-1">
                  <button
                    onClick={() => {
                      setIsUserSwitchOpen(false);
                      setIsProfileSelectorOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-[#063B2C] flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100 text-[#063B2C] rounded-lg group-hover:bg-[#063B2C] group-hover:text-emerald-300 transition-colors">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Switch Profile</div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {userProfilesForCurrentEmail.length > 1
                            ? `${userProfilesForCurrentEmail.length} profiles for this email`
                            : 'Select active profile'}
                        </div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                  </button>

                  <button
                    onClick={() => {
                      setIsUserSwitchOpen(false);
                      setIsLoginModalOpen(true);
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl text-xs font-bold text-gray-800 hover:bg-emerald-50 hover:text-[#063B2C] flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-gray-100 text-gray-700 rounded-lg group-hover:bg-gray-200 transition-colors">
                        <LogIn className="w-4 h-4" />
                      </div>
                      <div>
                        <div>Login as Different Account</div>
                        <div className="text-[10px] text-gray-400 font-normal">Authenticate another email</div>
                      </div>
                    </div>
                  </button>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          )}

          {/* Saved in Sheets Indicator Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-xs font-bold rounded-full shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            <span>SAVED IN SHEETS</span>
          </div>

          {/* Sync Refresh Button */}
          <button
            onClick={handleManualSync}
            className={`p-1.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full transition-all ${
              isSyncing ? 'animate-spin text-emerald-600' : ''
            }`}
            title="Refresh & Sync Data with Google Sheets"
          >
            <RotateCw className="w-4 h-4" />
          </button>

          {/* Notification Bell Badge */}
          <div className="relative">
            <button
              id="notifications-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full relative transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[9px] text-white flex items-center justify-center rounded-full font-black border-2 border-white shadow-xs">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3 z-50">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                  <span className="text-xs font-bold text-gray-800">In-App Notifications</span>
                  <span className="text-[10px] text-gray-400 font-mono">{unreadNotifs.length} new</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 py-4 text-center">No notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationAsRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                          n.read ? 'bg-gray-50 text-gray-600' : 'bg-emerald-50/80 border border-emerald-100 text-gray-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold mb-1">
                          <span>{n.title}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Create Ticket CTA Button */}
          <button
            id="header-create-ticket-btn"
            onClick={() => setIsCreateTicketOpen(true)}
            className="bg-[#063B2C] hover:bg-[#04281C] text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">Create Ticket</span>
          </button>
        </div>
      </header>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      <ProfileSelectorModal
        isOpen={isProfileSelectorOpen}
        onClose={() => setIsProfileSelectorOpen(false)}
        email={currentUser?.email || ''}
        profiles={userProfilesForCurrentEmail}
        currentProfileId={currentUser?.id || ''}
        onSelectProfile={(profile) => {
          setCurrentUser(profile);
          setIsProfileSelectorOpen(false);
        }}
        isSwitchMode={true}
      />
    </>
  );
};


