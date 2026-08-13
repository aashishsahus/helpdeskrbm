import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileSelectorModal } from './ProfileSelectorModal';
import {
  X,
  Shield,
  Mail,
  CheckCircle2,
  LogIn,
  KeyRound,
  AlertCircle,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, users, loginByIdOrQuery, loginWithGoogleEmail } = useApp();

  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  
  const [googleEmailInput, setGoogleEmailInput] = useState('misrpr@rathibuildmart.com');
  const [googlePasswordInput, setGooglePasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [detectedMessage, setDetectedMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const googlePasswordRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  // Multi-profile state
  const [isProfileSelectorOpen, setIsProfileSelectorOpen] = useState(false);
  const [multiProfileEmail, setMultiProfileEmail] = useState('');
  const [multiProfiles, setMultiProfiles] = useState<User[]>([]);

  if (!isOpen) return null;

  const handleGoogleSSOSubmit = (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    setLoginError('');
    setDetectedMessage('');

    const email = (overrideEmail || googleEmailInput).trim().toLowerCase();
    const pass = googlePasswordInput.trim();

    if (!email) {
      setLoginError('Please enter a registered Google Workspace email address.');
      return;
    }

    if (!pass) {
      setLoginError(`Password / PIN is required to verify ownership of '${email}'.`);
      googlePasswordRef.current?.focus();
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const result = loginWithGoogleEmail(email, pass);

      if (result.success && result.user) {
        setDetectedMessage(`Google Workspace SSO Verified: Logged in as ${result.user.name} (${result.user.role})`);
        setTimeout(() => {
          onClose();
        }, 500);
      } else if (result.matches && result.matches.length > 0) {
        setMultiProfileEmail(email);
        setMultiProfiles(result.matches);
        setIsProfileSelectorOpen(true);
      } else {
        setLoginError(result.message);
      }
    }, 300);
  };

  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setDetectedMessage('');

    const query = emailInput.trim();
    if (!query) {
      setLoginError('Please enter a valid Employee ID, User ID, Name, or Email.');
      return;
    }

    if (!passwordInput.trim()) {
      setLoginError('Password / PIN is required. Please enter your account Password/PIN.');
      passwordInputRef.current?.focus();
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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 text-white p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-300 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors cursor-pointer"
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
                Verified Identity & Account Credentials Protection
              </p>
            </div>
          </div>

          {/* Current user badge strip */}
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-blue-100">
            <span>Currently Active Session:</span>
            <div className="flex items-center gap-2 font-bold bg-white/10 px-3 py-1 rounded-lg">
              {currentUser ? (
                <>
                  <span className="text-emerald-300">● {currentUser.name}</span>
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

        {/* Tab Toggle */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 shrink-0">
          <button
            onClick={() => {
              setLoginMethod('google');
              setLoginError('');
              setDetectedMessage('');
            }}
            className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              loginMethod === 'google'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-500" />
            <span>Google Workspace SSO</span>
          </button>
          <button
            onClick={() => {
              setLoginMethod('email');
              setLoginError('');
              setDetectedMessage('');
            }}
            className={`py-3.5 px-5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              loginMethod === 'email'
                ? 'border-blue-600 text-blue-600 bg-white'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Login by ID / PIN</span>
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
            <form onSubmit={handleGoogleSSOSubmit} className="space-y-4 max-w-md mx-auto py-1">
              <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white rounded-2xl p-4 shadow-lg border border-blue-800/40 space-y-2">
                <div className="flex items-center gap-2 text-blue-300 font-bold text-xs uppercase tracking-wider">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span>Verified Google Workspace Sign-In</span>
                </div>
                <h3 className="font-bold text-sm text-white">Corporate Account Authentication</h3>
                <p className="text-[11px] text-blue-200 leading-relaxed">
                  To protect account access, enter your Google Workspace Email and Password/PIN.
                </p>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Google Workspace Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
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

              {/* Password / PIN Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Account Password / PIN *</label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    ref={googlePasswordRef}
                    type="password"
                    required
                    value={googlePasswordInput}
                    onChange={e => {
                      setGooglePasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter Account Password or PIN..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                </div>
              </div>

              {/* Quick Registered Accounts Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700 block">Select Account Email:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput('misrpr@rathibuildmart.com');
                      setLoginError('');
                      setDetectedMessage("Selected 'misrpr@rathibuildmart.com'. Please enter your Password/PIN.");
                      googlePasswordRef.current?.focus();
                    }}
                    className="p-2.5 border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="font-extrabold text-emerald-900 text-xs">Misr Pr (Super Admin)</div>
                    <div className="text-[10px] text-emerald-700 font-mono font-bold">misrpr@rathibuildmart.com</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setGoogleEmailInput('accountsrpr@rathibuildmart.com');
                      setLoginError('');
                      setDetectedMessage("Selected 'accountsrpr@rathibuildmart.com'. Please enter your Password/PIN.");
                      googlePasswordRef.current?.focus();
                    }}
                    className="p-2.5 border border-blue-200 bg-blue-50/60 hover:bg-blue-100 rounded-xl text-left transition-all cursor-pointer"
                  >
                    <div className="font-extrabold text-blue-900 text-xs">Dhaneshwari / Accounts</div>
                    <div className="text-[10px] text-blue-700 font-mono font-bold">accountsrpr@rathibuildmart.com</div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full py-3 bg-[#4285F4] hover:bg-[#3367D6] text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer mt-3 disabled:opacity-50"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isVerifying ? 'Verifying Credentials...' : 'Verify Google Email & Sign In'}</span>
              </button>
            </form>
          ) : (
            /* ID / Email Login Form */
            <form onSubmit={handleEmailLoginSubmit} className="space-y-4 max-w-md mx-auto py-2">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-800 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  ID & Password Authentication
                </div>
                <p className="text-[11px] leading-relaxed text-blue-700">
                  Enter your Employee ID or User Email along with your Password/PIN.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Employee ID / User ID / Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={emailInput}
                    onChange={e => {
                      setEmailInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="e.g. EMP-2026, EMP-1011, or misrpr@rathibuildmart.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700">Password / Employee PIN *</label>
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    ref={passwordInputRef}
                    type="password"
                    required
                    value={passwordInput}
                    onChange={e => {
                      setPasswordInput(e.target.value);
                      setLoginError('');
                    }}
                    placeholder="Enter password or PIN..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Registered Accounts Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-gray-700">Registered Accounts:</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {users.slice(0, 6).map(u => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setEmailInput(u.employeeId);
                        setPasswordInput('');
                        setLoginError('');
                        setDetectedMessage(`Selected ID: ${u.employeeId} (${u.name}). Enter your Password/PIN to sign in.`);
                        passwordInputRef.current?.focus();
                      }}
                      className="p-2 border border-gray-200 hover:border-blue-400 rounded-xl text-left bg-gray-50 hover:bg-blue-50/60 transition-all cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="font-bold text-gray-800 text-[11px] truncate">{u.name}</div>
                        <div className="text-[10px] text-blue-600 font-mono font-bold">{u.employeeId}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <LogIn className="w-4 h-4" />
                <span>Verify Credentials & Sign In</span>
              </button>
            </form>
          )}
        </div>
      </div>

      <ProfileSelectorModal
        isOpen={isProfileSelectorOpen}
        onClose={() => setIsProfileSelectorOpen(false)}
        email={multiProfileEmail}
        profiles={multiProfiles}
        currentProfileId={''}
        onSelectProfile={(profile) => {
          setCurrentUser(profile);
          setIsProfileSelectorOpen(false);
          setDetectedMessage(`Logged in as ${profile.name} (${profile.employeeId})`);
          onClose();
        }}
        isSwitchMode={false}
      />
    </div>
  );
};
