import React, { useState } from 'react';
import { User } from '../types';
import {
  UserCheck,
  Building,
  MapPin,
  CheckCircle2,
  ChevronRight,
  Shield,
  X,
  Mail,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';

interface ProfileSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  profiles: User[];
  currentProfileId?: string;
  onSelectProfile: (profile: User) => void;
  isSwitchMode?: boolean;
}

export const ProfileSelectorModal: React.FC<ProfileSelectorModalProps> = ({
  isOpen,
  onClose,
  email,
  profiles,
  currentProfileId,
  onSelectProfile,
  isSwitchMode = false
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    currentProfileId || (profiles.length > 0 ? profiles[0].id : '')
  );

  React.useEffect(() => {
    if (profiles.length > 0) {
      if (currentProfileId && profiles.some(p => p.id === currentProfileId)) {
        setSelectedId(currentProfileId);
      } else {
        setSelectedId(profiles[0].id);
      }
    }
  }, [profiles, currentProfileId]);

  if (!isOpen) return null;

  const selectedProfile = profiles.find(p => p.id === selectedId) || profiles[0];

  const handleConfirm = () => {
    if (selectedProfile) {
      onSelectProfile(selectedProfile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#063B2C] text-white p-5 relative">
          {isSwitchMode && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-emerald-200 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-400/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {isSwitchMode ? 'Switch Profile' : 'Welcome back!'}
              </h3>
              <p className="text-xs text-emerald-200/90 flex items-center gap-1 mt-0.5">
                <Mail className="w-3 h-3 text-emerald-300" />
                <span className="font-mono text-[11px] truncate">{email}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Select your profile:</span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {profiles.length} Profiles Available
              </span>
            </p>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {profiles.map(profile => {
                const isSelected = profile.id === selectedId;
                const firstName = profile.name.split(' ')[0];

                return (
                  <div
                    key={profile.id}
                    onClick={() => setSelectedId(profile.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50/80 border-[#10B981] shadow-sm ring-2 ring-[#10B981]/20'
                        : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border ${
                          isSelected
                            ? 'bg-[#063B2C] text-emerald-300 border-emerald-500'
                            : 'bg-gray-100 text-gray-700 border-gray-200'
                        }`}
                      >
                        {profile.avatarUrl ? (
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span>{firstName.charAt(0)}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-gray-900 leading-tight">
                            {profile.name}
                          </span>
                          {profile.id === currentProfileId && isSwitchMode && (
                            <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full border border-amber-200">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                          <span className="font-bold text-emerald-700 flex items-center gap-0.5">
                            <MapPin className="w-3 h-3 text-emerald-600" />
                            {profile.location}
                          </span>
                          <span>•</span>
                          <span className="truncate">{profile.department}</span>
                          {profile.designation && (
                            <>
                              <span>•</span>
                              <span className="truncate">{profile.designation}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      <div
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-[#10B981] border-[#10B981] text-white shadow-xs'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Confirmation Actions */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
            {isSwitchMode && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 py-2.5 bg-[#063B2C] hover:bg-[#04281C] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
