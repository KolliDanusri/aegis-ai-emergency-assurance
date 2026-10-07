import React, { useState } from 'react';
import { api } from '../services/api';
import { User, UserRole } from '../types';
import { Lock, UserCheck, Shield, X, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onAuthSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onAuthSuccess,
  onLogout,
}) => {
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(name, email, password, role);
        onAuthSuccess(res.user);
      } else {
        const res = await api.login(email, password);
        onAuthSuccess(res.user);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSwitch = async (presetEmail: string, presetPass: string) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login(presetEmail, presetPass);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-md w-full text-white shadow-2xl overflow-hidden animate-fadeIn">
        <div className="bg-neutral-800 px-6 py-4 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-400" />
            <h3 className="font-black text-sm uppercase tracking-wide">
              {currentUser ? 'User Profile & Role Management' : isRegister ? 'Create AEGIS Account' : 'AEGIS Portal Sign In'}
            </h3>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-950/80 border border-red-500/80 p-3 rounded-xl text-xs text-red-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {currentUser ? (
            <div className="space-y-4 text-xs">
              <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                <p className="text-neutral-400">Currently Logged In As:</p>
                <p className="font-bold text-base text-white">{currentUser.name}</p>
                <p className="text-neutral-400">{currentUser.email}</p>
                <div className="pt-2 flex items-center gap-2">
                  <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded font-black uppercase text-[10px]">
                    Role: {currentUser.role}
                  </span>
                  {currentUser.agency && (
                    <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded text-[10px]">
                      {currentUser.agency}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition text-xs uppercase tracking-wider"
              >
                Sign Out of AEGIS
              </button>
            </div>
          ) : (
            <>
              {/* Quick Persona Switchers (For Hackathon Reviewers) */}
              <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-2 text-xs">
                <p className="font-bold text-neutral-300 uppercase tracking-wider text-[10px]">
                  Fast Role Switching (Evaluation Presets):
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('authority@aegis.gov', 'OfficerSecure2026!')}
                    className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-lg text-left transition border border-neutral-700"
                  >
                    <p className="font-bold text-red-400">Emergency Officer</p>
                    <p className="text-[10px] text-neutral-400">authority@aegis.gov</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('citizen@example.com', 'CitizenSafe2026!')}
                    className="bg-neutral-800 hover:bg-neutral-700 p-2.5 rounded-lg text-left transition border border-neutral-700"
                  >
                    <p className="font-bold text-emerald-400">Public Citizen</p>
                    <p className="text-[10px] text-neutral-400">citizen@example.com</p>
                  </button>
                </div>
              </div>

              {/* Standard Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                {isRegister && (
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                {isRegister && (
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="citizen">Citizen / Public</option>
                      <option value="authority">Emergency Authority Officer</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition uppercase tracking-wider text-xs shadow-lg mt-2"
                >
                  {loading ? 'Authenticating...' : isRegister ? 'Create Account' : 'Sign In'}
                </button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-neutral-400 hover:text-white text-xs underline"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register here"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
