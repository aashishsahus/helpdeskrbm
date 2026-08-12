import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileSelectorModal } from './ProfileSelectorModal';
import {
  UserCheck,
  X,
  Search,
  Shield,
  Briefcase,
  Mail,
  Building,
  CheckCircle2,
  LogIn,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { UserRole, User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, detectAndLoginSystemUser, loginByIdOrQuery } = useApp();

  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [loginMethod, setLoginMethod] = useState<'quick' | 'email'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedMessage, setDetectedMessage] = useState('');
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);

  // Multi-profile state
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const [multiProfileEmail, setMultiProfileEmail] = useState('');
  const [multiProfiles, setMultiProfiles] = useState<User[]>([]);

  // Function to process login for an email address
  const processLoginForEmail = (email: string) => {
    setLoginError('');
    const cleanEmail = email.trim().toLowerCase();
    const matches = users.filter(u => u.email.toLowerCase() === cleanEmail);

    if (matches.length === 0) {
      setLoginError("Profile Not Found: We couldn't find a profile associated with this email address. Please contact the administrator.");
      return false;
    } else if (matches.length === 1) {
      setCurrentUser(matches[0]);
      setDetectedMessage(`Logged in as ${matches[0].name} (${matches[0].employeeId})`);
      setTimeout(() => {
        onClose();
      }, 300);
      return true;
    } else {
      setMultiProfileEmail(cleanEmail);
      setMultiProfiles(matches);
      setIsProfileSelectorOpen(true);
      return true;
    }
  };

  // Listen for Google OAuth callback postMessage
  React.useEffect(() => {
    if (!isOpen) return;
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const payload = event.data.user;
        if (payload && payload.email) {
          processLoginForEmail(payload.email);
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, users, setCurrentUser, onClose]);

  if (!isOpen) return null;

  const handleAutoDetectSystemLogin = async () => {
    setIsDetecting(true);
    setLoginError('');
    setDetectedMessage('');

    const user = await detectAndLoginSystemUser();
    setIsDetecting(false);

    if (user) {
      setCurrentUser(user);
      setDetectedMessage(`Auto-detected system account: ${user.name} (${user.employeeId})`);
      setTimeout(() => {
        onClose();
      }, 400);
    } else {
      setLoginError('Could not auto-detect system account. Please enter your Employee ID below.');
    }
  };

  const handleGoogleOAuthLogin = async () => {
    try {
      setIsOAuthLoading(true);
      setLoginError('');
      setDetectedMessage('');

      const res = await fetch('/api/auth/google/url');
      if (!res.ok) throw new Error('Failed to fetch OAuth URL');
      const { url } = await res.json();

      const popup = window.open(url, 'google_oauth_popup', 'width=580,height=680');
      if (!popup) {
        setLoginError('Popup blocker prevented opening Google Sign-In. Please allow popups.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'OAuth authentication failed.');
    } finally {
      setIsOAuthLoading(false);
    }
  };

  const roles: (UserRole | 'All')[] = ['All', 'Employee', 'Support Agent', 'Support Manager', 'Admin', 'Super Admin'];

  const filteredUsers = users.filter(user => {
    const matchesRole = selectedRoleFilter === 'All' || user.role === selectedRoleFilter;
    const matchesQuery =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesQuery;
  });

  const handleSelectUser = (user: typeof users[0]) => {
    setCurrentUser(user);
    setDetectedMessage(`Logged in as ${user.name} (${user.employeeId} - ${user.role})`);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setDetectedMessage('');

    const query = emailInput.trim() || employeeIdInput.trim();
    if (!query) {
      setLoginError('Please enter a valid User ID, Employee ID, Name, or Email.');
      return;
    }

    const result = loginByIdOrQuery(query);
    if (result.success && result.user) {
      setDetectedMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 400);
    } else if (result.matches && result.matches.length > 0) {
      setMultiProfileEmail(query);
      setMultiProfiles(result.matches);
      setIsProfileSelectorOpen(true);
    } else {
      setLoginError(result.message);
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Admin':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Support Manager':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Support Agent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-300 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-500/20 backdrop-blur-md rounded-xl border border-blue-400/30">
              <LogIn className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Help Desk Account Portal</h2>
              <p className="text-xs text-blue-200">
                Detect User by Employee ID, Name, or Email
              </p>
            </div>
          </div>

          {/* Current user badge strip */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
            <span>Currently Active User:</span>
            <div className="flex items-center gap-2 font-bold bg-white/10 px-3 py-1 rounded-lg">
              <span>{currentUser.name}</span>
              <span className="text-[10px] opacity-80">({currentUser.employeeId} - {currentUser.role})</span>
            </div>
          </div>
        </div>

        {/* Tab Toggle (ID / Email Login vs Select Corporate Profile) */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
          <button
            onClick={() => setLoginMethod('email')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              loginMethod === 'email'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Login by ID / Email</span>
          </button>
          <button
            onClick={() => setLoginMethod('quick')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              loginMethod === 'quick'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Select Corporate Profile ({users.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Google Workspace OAuth 2.0 Single Sign-On Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 shadow-lg border border-blue-800/40 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-center gap-1.5 justify-center sm:justify-start text-blue-300 font-bold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Google Workspace OAuth 2.0 SSO (@rathibuildmart.com)</span>
              </div>
              <h3 className="font-bold text-sm text-white">Sign in with Google Workspace Account</h3>
              <p className="text-[11px] text-blue-200">
                Authenticate with corporate email <code className="bg-blue-900/60 px-1 py-0.5 rounded border border-blue-700/50 text-white font-mono">misrpr@rathibuildmart.com</code>
              </p>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleOAuthLogin}
              disabled={isOAuthLoading}
              className="bg-white hover:bg-blue-50 text-slate-900 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0 cursor-pointer disabled:opacity-50 border border-gray-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isOAuthLoading ? 'Opening Google SSO...' : 'Sign in with Google'}</span>
            </button>
          </div>

          {detectedMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{detectedMessage}</span>
            </div>
          )}

          {loginMethod === 'email' ? (
            /* ID / Email Login Form */
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Exact ID Detection System
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700">
                  Enter your Employee ID (e.g. <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">EMP-1011</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">1010</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">EMP-2026</code>), Name, or Email Address to detect and load your account directly.
                </p>
              </div>

              {loginError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Employee ID / User ID / Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={e => {
                      setEmailInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="e.g. EMP-1011, 1010, Dhaneshwari, or accountsrpr@rathibuildmart.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Password / PIN (Optional)</label>
                  <span className="text-[10px] text-gray-400">Default: Any password or 123456</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={e => setPasswordInput(e.target.value)}
                    placeholder="Enter password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Sample Quick Login Pills */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700">Sample Employee IDs (Click to Detect & Login Directly)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {users.slice(0, 6).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEmailInput(u.employeeId);
                        setCurrentUser(u);
                        setDetectedMessage(`Detected Employee ID: ${u.employeeId} (${u.name} - ${u.role})`);
                        setTimeout(() => onClose(), 350);
                      }}
                      className="p-2 border border-gray-200 hover:border-blue-400 rounded-xl text-left bg-gray-50 hover:bg-blue-50/60 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-800 text-[11px] truncate">{u.name}</div>
                        <div className="text-[10px] text-blue-600 font-mono font-bold">{u.employeeId}</div>
                      </div>
                      <div className="text-[9px] text-gray-500 font-medium truncate mt-1">{u.role}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Detect Account & Log In</span>
              </button>
            </form>
          ) : (
            /* Multi-User Directory Quick Selector */
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                {/* Search */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search ID, name, email, role..."
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Role Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                  {roles.map(r => (
                    <button
                      key={r}
                      onClick={() => setSelectedRoleFilter(r)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 transition-colors cursor-pointer ${
                        selectedRoleFilter === r
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* User Grid / Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {filteredUsers.length === 0 ? (
                  <p className="col-span-2 text-center text-xs text-gray-400 py-8">
                    No users match your filter criteria.
                  </p>
                ) : (
                  filteredUsers.map(user => {
                    const isCurrent = currentUser.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 relative ${
                          isCurrent
                            ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                            : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="relative shrink-0">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          )}
                          {isCurrent && (
                            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-bold text-gray-900 text-xs truncate">{user.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-500 flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-gray-400">
                            <span className="font-mono bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded border border-blue-200">
                              {user.employeeId}
                            </span>
                            <span className="truncate flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {user.department}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500 shrink-0">
          <span>Active Role Determines Navigation & Admin Permissions</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      <ProfileSelectorModal
        isOpen={isProfileSelectorOpen}
        onClose={() => setIsProfileSelectorOpen(false)}
        email={multiProfileEmail}
        profiles={multiProfiles}
        currentProfileId={currentUser?.id}
        onSelectProfile={(profile) => {
          setCurrentUser(profile);
          setIsProfileSelectorOpen(false);
          setDetectedMessage(`Logged in as ${profile.name} (${profile.employeeId})`);
          setTimeout(() => {
            onClose();
          }, 300);
        }}
        isSwitchMode={false}
      />
    </div>
  );
};
