import React, { useState } from 'react';
import { Shield, Lock, Mail, User, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface LoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const { isInitialized, login, setupAdmin } = useAuth();

  // Setup Admin Form State
  const [setupFullName, setSetupFullName] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupPassword, setSetupPassword] = useState('');

  // Standard Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    if (setupPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      setLoading(false);
      return;
    }

    const res = await setupAdmin(setupFullName, setupEmail, setupPassword);
    setLoading(false);
    if (res.success) {
      setSuccessMsg('Primary administrator initialized successfully!');
      setTimeout(() => onLoginSuccess(), 600);
    } else {
      setErrorMsg(res.error || 'Failed to initialize administrator.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(loginEmail, loginPassword);
    setLoading(false);
    if (res.success) {
      onLoginSuccess();
    } else {
      setErrorMsg(res.error || 'Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center space-x-2.5 mb-3 group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
              Aiteebar
            </span>
          </button>
          <p className="text-xs font-mono text-cyan-400 tracking-wider uppercase">
            AI Security Platform Access
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-slate-900/80 border border-cyan-500/20 backdrop-blur-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {!isInitialized ? (
            /* First Admin Initialization Mode */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-950/80 border border-amber-500/40 text-amber-300 text-xs font-mono mb-2">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>INITIAL SETUP REQUIRED</span>
                </div>
                <h2 className="text-xl font-bold text-white">Initialize Administrator</h2>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  No administrator account exists yet. Create the primary security administrator. Once initialized, public registration is locked.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-red-950/70 border border-red-500/40 text-xs text-red-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 mb-4 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-xs text-emerald-300 flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kamran Memon"
                      value={setupFullName}
                      onChange={e => setSetupFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Administrator Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="admin@aiteebar.local"
                      value={setupEmail}
                      onChange={e => setSetupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Master Password (min 8 characters)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••••••"
                      value={setupPassword}
                      onChange={e => setSetupPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Initializing...' : 'Initialize Platform Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            /* Standard Secure Login Mode */
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white">Sign In to Dashboard</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your authorized Aiteebar credentials.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-lg bg-red-950/70 border border-red-500/40 text-xs text-red-300 flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="user@organization.com"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Roles explanation footer */}
              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                <span className="font-semibold text-slate-300">Supported Roles:</span>
                <p>• <strong className="text-cyan-400">Admin:</strong> User & team management, docs, policies</p>
                <p>• <strong className="text-teal-400">Analyst:</strong> Findings triage, report ingestion, policy reviews</p>
                <p>• <strong className="text-purple-400">Viewer:</strong> Read-only access to dashboards & telemetry</p>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <button
            onClick={onNavigateHome}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            ← Return to Public Website
          </button>
        </div>
      </div>
    </div>
  );
};
