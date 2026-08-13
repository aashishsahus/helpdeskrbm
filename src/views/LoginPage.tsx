import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { ProfileSelectorModal } from '../components/ProfileSelectorModal';
import {
  Shield,
  Mail,
  CheckCircle2,
  LogIn,
  KeyRound,
  AlertCircle,
  Building2,
  Sparkles,
  Lock
} from 'lucide-react';
import { User } from '../types';

export const LoginPage: React.FC = () => {
  const { setCurrentUser, users, loginByIdOrQuery, loginWithGoogleEmail } = useApp();

  const [loginMethod, setLoginMethod] = useState<'google' | 'email'>('google');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  // Google Workspace SSO state
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

  const handleGoogleSSOSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');
    setDetectedMessage('');

    const email = googleEmailInput.trim().toLowerCase();
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
        setDetectedMessage(`Authentication Successful! Welcome, ${result.user.name} (${result.user.role}).`);
      } else if (result.matches && result.matches.length > 0) {
        setMultiProfileEmail(email);
        setMultiProfiles(result.matches);
        setIsProfileSelectorOpen(true);
      } else {
        setLoginError(result.message);
      }
    }, 350);
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
      setLoginError('Password / PIN is required. Please enter your account password or PIN.');
      passwordInputRef.current?.focus();
      return;
    }

    const result = loginByIdOrQuery(query, passwordInput);
    if (result.success && result.user) {
      setDetectedMessage(result.message);
    } else if (result.matches && result.matches.length > 0) {
      setMultiProfileEmail(query);
      setMultiProfiles(result.matches);
      setIsProfileSelectorOpen(true);
    } else {
      setLoginError(result.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">
              Rathi Buildmart Pvt. Ltd.
            </h1>
            <p className="text-[11px] text-emerald-400 font-semibold tracking-wider uppercase">
              RBM Help Desk & Asset Portal
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-800/50 px-3.5 py-1.5 rounded-full border border-slate-700/60">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Enterprise Secure Portal</span>
        </div>
      </header>

      {/* Main Login Body */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col backdrop-blur-xl">
          {/* Card Top Title Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 border-b border-slate-800 text-center relative">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 px-3 py-1 rounded-full text-blue-300 text-xs font-bold mb-3">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Authentication Portal</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">Sign In to Help Desk</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Please choose your preferred sign-in method and enter your registered credentials to access the portal.
            </p>
          </div>

          {/* Tab Navigation (Google Workspace SSO vs Employee ID / PIN) */}
          <div className="flex border-b border-slate-800 bg-slate-900/50">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('google');
                setLoginError('');
                setDetectedMessage('');
              }}
              className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                loginMethod === 'google'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span>Google Workspace SSO</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setLoginError('');
                setDetectedMessage('');
              }}
              className={`flex-1 py-3.5 px-4 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
                loginMethod === 'email'
                  ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
              }`}
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <span>Login by Employee ID / PIN</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            {detectedMessage && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-200 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>{detectedMessage}</span>
              </div>
            )}

            {loginError && (
              <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {loginMethod === 'google' ? (
              /* Google Workspace SSO Form */
              <form onSubmit={handleGoogleSSOSubmit} className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-blue-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      Corporate SSO Verification
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Domain: rathibuildmart.com</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sign in with your official Google Workspace email and registered Account Password/PIN.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Google Workspace Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={googleEmailInput}
                      onChange={e => {
                        setGoogleEmailInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="e.g. misrpr@rathibuildmart.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Account Password / PIN *</label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Select Corporate Accounts */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-400 block">Select Registered Corporate Account:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setGoogleEmailInput('misrpr@rathibuildmart.com');
                        setLoginError('');
                        setDetectedMessage("Selected 'misrpr@rathibuildmart.com'. Please enter your Password/PIN.");
                        googlePasswordRef.current?.focus();
                      }}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-emerald-500/40 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="font-extrabold text-emerald-300 text-xs group-hover:text-emerald-200">Misr Pr (Super Admin)</div>
                      <div className="text-[10px] text-slate-400 font-mono">misrpr@rathibuildmart.com</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setGoogleEmailInput('accountsrpr@rathibuildmart.com');
                        setLoginError('');
                        setDetectedMessage("Selected 'accountsrpr@rathibuildmart.com'. Please enter your Password/PIN.");
                        googlePasswordRef.current?.focus();
                      }}
                      className="p-2.5 bg-slate-950 hover:bg-slate-800/80 border border-blue-500/40 rounded-xl text-left transition-all cursor-pointer group"
                    >
                      <div className="font-extrabold text-blue-300 text-xs group-hover:text-blue-200">Dhaneshwari / Accounts</div>
                      <div className="text-[10px] text-slate-400 font-mono">accountsrpr@rathibuildmart.com</div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>{isVerifying ? 'Authenticating...' : 'Sign In with Google Workspace SSO'}</span>
                </button>
              </form>
            ) : (
              /* Employee ID / PIN Login Form */
              <form onSubmit={handleEmailLoginSubmit} className="space-y-4">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                    <KeyRound className="w-4 h-4 text-emerald-400" />
                    Employee ID & Password Sign-In
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Enter your Employee ID or User Email along with your Password / PIN.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block">Employee ID / User ID / Email *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailInput}
                      onChange={e => {
                        setEmailInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="e.g. EMP-2026, EMP-1011, or 1010"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">Password / Account PIN *</label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      ref={passwordInputRef}
                      type="password"
                      required
                      value={passwordInput}
                      onChange={e => {
                        setPasswordInput(e.target.value);
                        setLoginError('');
                      }}
                      placeholder="Enter Password or PIN..."
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-medium"
                    />
                  </div>
                </div>

                {/* Account Selection Pills */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-bold text-slate-400 block">Select Registered Account:</label>
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
                        className="p-2 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/50 rounded-xl text-left transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-200 text-[11px] truncate">{u.name}</div>
                          <div className="text-[10px] text-blue-400 font-mono font-bold">{u.employeeId}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Verify Credentials & Sign In</span>
                </button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-950 px-6 py-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
            <span>Rathi Buildmart IT Infrastructure System</span>
            <span className="text-emerald-400 font-bold">v2.4 Live</span>
          </div>
        </div>
      </main>

      {/* Footer copyright */}
      <footer className="py-3 text-center text-xs text-slate-400 border-t border-slate-900 z-10">
        © {new Date().getFullYear()} Rathi Buildmart Pvt. Ltd. All rights reserved. Help Desk & Asset Portal.
      </footer>

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
        }}
        isSwitchMode={false}
      />
    </div>
  );
};
