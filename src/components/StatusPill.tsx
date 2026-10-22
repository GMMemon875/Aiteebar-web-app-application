import React from 'react';
import type { CapabilityStatus } from '../types/index.js';

interface StatusPillProps {
  status: CapabilityStatus | string;
  size?: 'sm' | 'md';
}

export const StatusPill: React.FC<StatusPillProps> = ({ status, size = 'md' }) => {
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  if (status === 'Implemented' || status === 'Approved' || status === 'Running') {
    return (
      <span className={`inline-flex items-center rounded-md font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 ${pad}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5" />
        {status}
      </span>
    );
  }

  if (status === 'In Development' || status === 'Under Review' || status === 'Review Required' || status === 'Installed') {
    return (
      <span className={`inline-flex items-center rounded-md font-medium bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 ${pad}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-1.5" />
        {status}
      </span>
    );
  }

  if (status === 'Planned' || status === 'Not Detected') {
    return (
      <span className={`inline-flex items-center rounded-md font-medium bg-purple-950/60 text-purple-300 border border-purple-500/30 ${pad}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mr-1.5" />
        {status}
      </span>
    );
  }

  if (status === 'Unapproved') {
    return (
      <span className={`inline-flex items-center rounded-md font-medium bg-rose-950/60 text-rose-300 border border-rose-500/30 ${pad}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-1.5" />
        {status}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center rounded-md font-medium bg-slate-800 text-slate-300 border border-slate-700 ${pad}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
      {status}
    </span>
  );
};
