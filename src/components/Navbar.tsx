import React, { useState } from 'react';
import { Shield, ShieldAlert, Cpu, Terminal, Menu, X, ChevronRight, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate }) => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'platform', label: 'Platform' },
    { id: 'capabilities', label: 'Capabilities' },
    { id: 'project', label: 'Project' },
    { id: 'team', label: 'Team' },
    { id: 'docs', label: 'Documentation' },
  ];

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-500/20 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => handleNav('home')}
          className="flex items-center space-x-3 text-left focus:outline-none group"
        >
          <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-base font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                Aiteebar
              </span>
              <span className="text-xs font-semibold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono">
                SEC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase font-mono hidden sm:block">
              AI Security Platform
            </p>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
          {navItems.map(item => {
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="hidden sm:flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleNav('dashboard')}
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Open Dashboard</span>
              </button>
              <div className="px-2 py-1 rounded bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-cyan-400">
                {user.role.toUpperCase()}
              </div>
            </div>
          ) : (
            <button
              onClick={() => handleNav('login')}
              className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-cyan-500/40 flex items-center space-x-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-400" />
              <span>Login</span>
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center space-x-2">
          {user && (
            <button
              onClick={() => handleNav('dashboard')}
              className="px-2.5 py-1 text-xs font-medium rounded bg-cyan-500 text-slate-950"
            >
              Dashboard
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950/95 backdrop-blur-xl px-4 pt-2 pb-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === item.id
                  ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800/80 mt-2">
            {user ? (
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-center px-3 py-2 text-sm font-medium rounded-md bg-cyan-500 text-slate-950 font-semibold"
              >
                Security Dashboard ({user.role})
              </button>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="w-full text-center px-3 py-2 text-sm font-medium rounded-md bg-slate-800 text-slate-200 border border-slate-700"
              >
                Login to Platform
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
