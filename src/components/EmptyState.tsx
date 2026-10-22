import React from 'react';
import { ShieldAlert, FileSearch, HardDriveDownload, Sparkles } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: 'scan' | 'findings' | 'activity' | 'apps';
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = 'scan',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'findings':
        return <ShieldAlert className="w-8 h-8 text-cyan-400" />;
      case 'activity':
        return <HardDriveDownload className="w-8 h-8 text-teal-400" />;
      case 'apps':
        return <FileSearch className="w-8 h-8 text-purple-400" />;
      case 'scan':
      default:
        return <FileSearch className="w-8 h-8 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 backdrop-blur-sm my-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">{description}</p>
      
      <div className="flex flex-wrap items-center justify-center gap-3">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
};
