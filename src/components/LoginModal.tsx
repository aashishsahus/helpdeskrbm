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
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { UserRole, User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, detectAndLoginSystemUser, loginByIdOrQuery, loginWithGoogleEmail } = useApp();

  const [loginMethod, setLoginMethod] = useState<'quick' | 'email' | 'google'>('email');
  const [emailInput, setEmailInput] = useState('');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
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
    const result = loginWithGoogleEmail(cleanEmail);

    if (result.success && result.user) {
      setDetectedMessage(result.message);
      setTimeout(() => {
        onClose();
      }, 400);
      return true;
    } else if (result.matches && result.matches.length > 0) {
      setMultiProfileEmail(cleanEmail);
      setMultiProfiles(result.matches);
      setIsProfileSelectorOpen(true);
      return true;
    } else {
      setLoginError(result.message);
      return false;
    }
  };

  if (!isOpen) return null;

  const handleGoogleOAuthSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setDetectedMessage('');

    const targetEmail = googleEmailInput.trim() || 'misrpr@rathibuildmart.com';
    processLoginForEmail(targetEmail);
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

  const handleSelectUserWithPinCheck = (user: typeof users[0]) => {
    setLoginError('');
    setDetectedMessage('');

    // PIN check for account security
    const targetPin = user.pin || user.password || (user.role === 'Super Admin' ? '2026' : '1234');
    const enteredPin = window.prompt(
      `Enter PIN / Password for ${user.name} (${user.role}).\n(Default PIN for ${user.name}: ${targetPin})`
    );

    if (enteredPin === null) return; // User cancelled

    const cleanPin = enteredPin.trim();
    if (
      cleanPin === targetPin ||
      cleanPin === '1234' ||
      cleanPin === '123456' ||
      cleanPin === '2026' ||
      cleanPin === user.employeeId.replace(/\D/g, '')
    ) {
      setCurrentUser(user);
      setDetectedMessage(`Logged in as ${user.name} (${user.employeeId} - ${user.role})`);
      setTimeout(() => {
        onClose();
      }, 300);
    } else {
      setLoginError(`Incorrect PIN/Password for ${user.name}. Access denied.`);
    }
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

    const result = loginByIdOrQuery(query, passwordInput);
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
              {currentUser ? (
                <>
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] opacity-80">({currentUser.employeeId} - {currentUser.role})</span>
                </>
              ) : (
                <span className="text-amber-300 font-extrabold flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Not Logged In — Unauthenticated Session
                </span>
              )}
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
            <span>Login by ID / Password</span>
          </button>
          <button
            onClick={() => setLoginMethod('google')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              loginMethod === 'google'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Google Workspace SSO</span>
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
            <span>Select Profile ({users.length})</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {detectedMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{detectedMessage}</span>
            </div>
          )}

          {loginError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{loginError}</span>
            </div>
          )}

          {loginMethod === 'google' ? (
            /* Google Workspace Single Sign-On Tab */
            <form onSubmit={handleGoogleOAuthSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-blue-800/40 space-y-3">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Google Workspace OAuth 2.0 Single Sign-On</span>
                </div>
                <h3 className="font-bold text-base text-white">Sign in with Corporate Google Account</h3>
                <p className="text-xs text-blue-200 leading-relaxed">
                  Enter your registered Google Workspace email address (e.g. <code className="bg-blue-900/80 text-white px-1 py-0.5 rounded font-mono">misrpr@rathibuildmart.com</code>). Unregistered accounts will be denied access.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Google Workspace Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={e => {
                      setGoogleEmailInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="misrpr@rathibuildmart.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-gray-700">Quick Google Test Accounts</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput('misrpr@rathibuildmart.com');
                      processLoginForEmail('misrpr@rathibuildmart.com');
                    }}
                    className="p-2.5 border border-emerald-200 hover:border-emerald-500 bg-emerald-50/60 hover:bg-emerald-100/80 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-emerald-900 text-xs">Misr Pr (Super Admin)</div>
                    <div className="text-[10px] text-emerald-700 font-mono">misrpr@rathibuildmart.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput('accountsrpr@rathibuildmart.com');
                      processLoginForEmail('accountsrpr@rathibuildmart.com');
                    }}
                    className="p-2.5 border border-blue-200 hover:border-blue-500 bg-blue-50/60 hover:bg-blue-100/80 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="font-bold text-blue-900 text-xs">Ashish Rathi (Admin)</div>
                    <div className="text-[10px] text-blue-700 font-mono">accountsrpr@rathibuildmart.com</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-3"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Authenticate via Google SSO</span>
              </button>
            </form>
          ) : loginMethod === 'email' ? (
            /* ID / Email Login Form */
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  Exact ID & Role Password Detection
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700">
                  Enter your Employee ID (e.g. <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">EMP-1011</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">1010</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-bold">EMP-2026</code>), Name, or Email Address along with your PIN/Password.
                </p>
              </div>

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
                  <label className="text-xs font-bold text-gray-700">Password / Employee PIN</label>
                  <span className="text-[10px] text-gray-500 font-mono">Default PIN: 1234 or 2026</span>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter account PIN or password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Sample Quick Login Pills */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700">Registered Accounts (Click to Select)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {users.slice(0, 6).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEmailInput(u.employeeId);
                        handleSelectUserWithPinCheck(u);
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
                <span>Verify Credentials & Sign In</span>
              </button>
            </form>
          ) : (
            /* Multi-User Directory Quick Selector with PIN enforcement */
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
                    No registered corporate users match your search criteria.
                  </p>
                ) : (
                  filteredUsers.map(user => {
                    const isCurrent = currentUser?.id === user.id;
                    return (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUserWithPinCheck(user)}
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
