import React from 'react';
import type { Severity } from '../types/index.js';

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, className = '' }) => {
  switch (severity) {
    case 'HIGH':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-950/80 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 mr-1.5 animate-pulse" />
          High Risk
        </span>
      );
    case 'MEDIUM':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.15)] ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5" />
          Medium
        </span>
      );
    case 'LOW':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-950/70 text-blue-300 border border-blue-500/30 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-1.5" />
          Low
        </span>
      );
    case 'INFORMATIONAL':
    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5" />
          Info
        </span>
      );
  }
};
