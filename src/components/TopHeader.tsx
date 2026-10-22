import React from 'react';
import { Upload, Sparkles, Shield, User, HardDrive } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface TopHeaderProps {
  currentSectionTitle: string;
  onOpenImportModal: () => void;
  onLoadSample: () => void;
  loadingSample: boolean;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  currentSectionTitle,
  onOpenImportModal,
  onLoadSample,
  loadingSample
}) => {
  const { user } = useAuth();
  const canImport = user && (user.role === 'admin' || user.role === 'analyst');

  return (
    <header className="h-16 px-6 bg-slate-950/80 border-b border-slate-800/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
      {/* Title & Breadcrumbs */}
      <div className="flex items-center space-x-3">
        <span className="text-xs font-mono text-cyan-400">DASHBOARD</span>
        <span className="text-slate-600">/</span>
        <h1 className="text-base font-bold text-white tracking-tight">{currentSectionTitle}</h1>
      </div>

      {/* Quick Action Controls */}
      <div className="flex items-center space-x-3">
        {canImport && (
          <>
            <button
              onClick={onLoadSample}
              disabled={loadingSample}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500/40 text-xs font-medium text-slate-300 hover:text-white transition-all flex items-center space-x-1.5 disabled:opacity-60"
              title="Loads verified scan report from the Windows Python lab environment"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{loadingSample ? 'Loading...' : 'Load Lab Sample'}</span>
            </button>

            <button
              onClick={onOpenImportModal}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import Report</span>
            </button>
          </>
        )}

        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-mono text-cyan-300">
            {user?.role.toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};
