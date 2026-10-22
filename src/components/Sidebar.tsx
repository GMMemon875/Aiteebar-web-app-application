import React from 'react';
import { 
  LayoutDashboard, 
  Cpu, 
  Server, 
  ShieldAlert, 
  Activity, 
  FileText, 
  Users, 
  BookOpen, 
  Sliders, 
  ClipboardList, 
  Settings as SettingsIcon,
  Globe,
  LogOut,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface SidebarProps {
  currentSection: string;
  onSelectSection: (section: string) => void;
  onNavigateHome: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection, onNavigateHome }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'apps', label: 'AI App Inventory', icon: Cpu },
    { id: 'mcp-servers', label: 'MCP Server Inventory', icon: Server },
    { id: 'findings', label: 'Risk Findings', icon: ShieldAlert },
    { id: 'activity', label: 'Activity Monitoring', icon: Activity },
    { id: 'scans', label: 'Scan Reports', icon: FileText },
    { id: 'team', label: 'Team Management', icon: Users, adminOnly: true },
    { id: 'docs-mgmt', label: 'Documentation Mgmt', icon: BookOpen, adminOnly: true },
    { id: 'integrations', label: 'Integrations & Agent', icon: Sliders },
    { id: 'audit-log', label: 'Audit Log', icon: ClipboardList, adminOnly: true },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, adminOnly: true },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      {/* Top Header */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">Aiteebar</span>
              <span className="text-[10px] font-mono text-cyan-400 block -mt-1">SECURITY OPS</span>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="py-4 px-2 space-y-1 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Security Core
          </div>

          {navItems.map(item => {
            if (item.adminOnly && !isAdmin) return null;
            const Icon = item.icon;
            const isActive = currentSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectSection(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-500/30 font-semibold shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / User info & Logout */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40 space-y-2">
        <button
          onClick={onNavigateHome}
          className="w-full flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span>Public Website</span>
        </button>

        <div className="px-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between">
          <div className="truncate mr-2">
            <div className="text-xs font-medium text-slate-200 truncate">{user?.fullName || 'User'}</div>
            <div className="text-[10px] font-mono text-cyan-400 truncate">{user?.role.toUpperCase()}</div>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
