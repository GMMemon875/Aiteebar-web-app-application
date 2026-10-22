import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Users, 
  ShieldCheck, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Save, 
  Key, 
  Clock, 
  Lock
} from 'lucide-react';
import type { PlatformSettings, User, Role, AppCategory } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const SettingsView: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State for Platform Settings
  const [orgName, setOrgName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [timezone, setTimezone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [retentionDays, setRetentionDays] = useState(90);
  const [enableAgentApi, setEnableAgentApi] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Form State for Adding User
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('analyst');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [addingUser, setAddingUser] = useState(false);

  const fetchData = async () => {
    try {
      const [sData, uData] = await Promise.all([
        apiRequest<PlatformSettings>('/api/settings'),
        apiRequest<User[]>('/api/users')
      ]);
      setSettings(sData);
      setOrgName(sData.organizationName);
      setDisplayName(sData.platformDisplayName);
      setTimezone(sData.timezone);
      setContactEmail(sData.contactEmail);
      setRetentionDays(sData.dataRetentionDays);
      setEnableAgentApi(sData.enableAgentApi);
      setUsers(uData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const updated = await apiRequest<PlatformSettings>('/api/settings', {
        method: 'PUT',
        body: JSON.stringify({
          organizationName: orgName,
          platformDisplayName: displayName,
          timezone,
          contactEmail,
          dataRetentionDays: Number(retentionDays),
          enableAgentApi
        })
      });
      setSettings(updated);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 2500);
    } catch (err: any) {
      alert(`Failed to save settings: ${err.message}`);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingUser(true);

    try {
      await apiRequest('/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: newUserEmail,
          fullName: newUserFullName,
          role: newUserRole,
          password: newUserPassword
        })
      });
      setIsAddUserOpen(false);
      setNewUserEmail('');
      setNewUserFullName('');
      setNewUserPassword('');
      const uData = await apiRequest<User[]>('/api/users');
      setUsers(uData);
    } catch (err: any) {
      alert(`Failed to create user: ${err.message}`);
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;
    try {
      await apiRequest(`/api/users/${id}`, { method: 'DELETE' });
      const uData = await apiRequest<User[]>('/api/users');
      setUsers(uData);
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs font-mono text-slate-500">
        LOADING SETTINGS...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Platform Configuration */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <SettingsIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Platform Organization & Parameters</h3>
          </div>
          {settingsSuccess && (
            <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Settings Saved</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                value={orgName}
                onChange={e => setOrgName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Platform Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Security Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={e => setContactEmail(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Timezone</label>
              <input
                type="text"
                value={timezone}
                onChange={e => setTimezone(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Data Retention (Days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={e => setRetentionDays(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="enable-agent"
              checked={enableAgentApi}
              onChange={e => setEnableAgentApi(e.target.checked)}
              className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
            />
            <label htmlFor="enable-agent" className="text-xs text-slate-300 cursor-pointer">
              Enable Authenticated Python Scanner Agent Ingestion API (<code className="text-cyan-400 font-mono">/api/agent/v1/report</code>)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all disabled:opacity-60"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* User & Access Management */}
      <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Users & Role-Based Access Control</h3>
          </div>
          <button
            onClick={() => setIsAddUserOpen(!isAddUserOpen)}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center space-x-1.5 border border-slate-700"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create User</span>
          </button>
        </div>

        {/* Create user inline drawer */}
        {isAddUserOpen && (
          <form onSubmit={handleCreateUser} className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-white">New User Provisioning</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUserFullName}
                  onChange={e => setNewUserFullName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  placeholder="sconnor@organization.com"
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Role Permissions</label>
                <select
                  value={newUserRole}
                  onChange={e => setNewUserRole(e.target.value as any)}
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="analyst">Security Analyst (Triage & Scan ingestion)</option>
                  <option value="viewer">Read-Only Viewer (Dashboard & Telemetry)</option>
                  <option value="admin">Administrator (Full Control)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Initial Password</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddUserOpen(false)}
                className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addingUser}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
              >
                {addingUser ? 'Creating...' : 'Provision User'}
              </button>
            </div>
          </form>
        )}

        {/* Users list table */}
        <div className="rounded-lg border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[10px] uppercase">
              <tr>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Created</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-white">{u.fullName}</td>
                  <td className="py-2.5 px-3 text-cyan-300">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400">
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {u.id !== currentUser?.id && (
                      <button
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded text-slate-500 hover:text-red-400"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
