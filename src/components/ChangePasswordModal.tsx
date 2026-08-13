import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateUser } = useApp();

  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // 1. Verify current PIN/Password if user set one
    const userPin = currentUser.pin || currentUser.employeeId.replace(/\D/g, '') || '2026';
    const userPass = currentUser.password || 'admin123';

    if (currentPinInput.trim() !== userPin && currentPinInput.trim() !== userPass) {
      setError('Current Password / PIN does not match your active account settings.');
      return;
    }

    // 2. Validate new PIN and Password
    if (!newPin.trim() && !newPassword.trim()) {
      setError('Please enter a new numeric PIN or Password.');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    // 3. Update User
    updateUser(currentUser.id, {
      pin: newPin.trim() || currentUser.pin,
      password: newPassword.trim() || currentUser.password
    });

    setSuccessMsg('Password & PIN updated successfully! Your account credentials have been synchronized.');
    setCurrentPinInput('');
    setNewPin('');
    setNewPassword('');
    setConfirmPassword('');

    setTimeout(() => {
      onClose();
      setSuccessMsg('');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Account Security</span>
          </div>
          <h2 className="text-xl font-black text-white">Change Password & PIN</h2>
          <p className="text-xs text-gray-300 mt-1">
            Update PIN/Password for <strong className="text-emerald-300">{currentUser.name}</strong> ({currentUser.employeeId}).
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current PIN or Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 block">Current Password or PIN *</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                required
                value={currentPinInput}
                onChange={e => {
                  setCurrentPinInput(e.target.value);
                  setError('');
                }}
                placeholder="Enter current PIN / Password..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 outline-none font-medium"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-gray-100 grid grid-cols-1 gap-3">
            {/* New Numeric PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">New 4-Digit Numeric PIN</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-emerald-600" />
                <input
                  type="text"
                  maxLength={6}
                  value={newPin}
                  onChange={e => {
                    setNewPin(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="e.g. 2026, 1234, 1010"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 outline-none font-mono font-bold"
                />
              </div>
              <p className="text-[10px] text-gray-400">Numeric PIN used for fast login on mobile & desktop.</p>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 block">New Account Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="e.g. admin123 or custom secret"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                />
              </div>
            </div>

            {/* Confirm Password */}
            {newPassword && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 block">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Re-enter new password..."
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:border-emerald-500 outline-none font-medium"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Update Password & PIN</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
