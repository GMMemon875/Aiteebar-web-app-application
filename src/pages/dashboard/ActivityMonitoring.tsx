import React, { useState } from 'react';
import { 
  Activity, 
  Search, 
  Filter, 
  FilePlus, 
  FileEdit, 
  Trash2, 
  ArrowRightLeft, 
  ShieldAlert, 
  Clock, 
  AlertTriangle,
  Info
} from 'lucide-react';
import { StatusPill } from '../../components/StatusPill.js';
import { EmptyState } from '../../components/EmptyState.js';
import type { ActivityEvent, EventType, AttributionStatus } from '../../types/index.js';

interface ActivityMonitoringProps {
  events: ActivityEvent[];
  onOpenImport: () => void;
  onLoadSample: () => void;
}

export const ActivityMonitoring: React.FC<ActivityMonitoringProps> = ({
  events,
  onOpenImport,
  onLoadSample
}) => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [attributionFilter, setAttributionFilter] = useState<string>('ALL');

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'file_created':
        return <FilePlus className="w-3.5 h-3.5 text-emerald-400" />;
      case 'file_modified':
        return <FileEdit className="w-3.5 h-3.5 text-cyan-400" />;
      case 'file_deleted':
        return <Trash2 className="w-3.5 h-3.5 text-rose-400" />;
      case 'file_moved':
        return <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />;
      case 'process_started':
      case 'network_connection':
      case 'policy_violation':
      default:
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  const filtered = events.filter(ev => {
    const matchSearch =
      ev.filePath.toLowerCase().includes(search.toLowerCase()) ||
      ev.evidenceSource.toLowerCase().includes(search.toLowerCase()) ||
      ev.responsibleProcess.toLowerCase().includes(search.toLowerCase()) ||
      ev.evidenceDetails.toLowerCase().includes(search.toLowerCase());

    const matchType = typeFilter === 'ALL' || ev.eventType === typeFilter;
    const matchAttr = attributionFilter === 'ALL' || ev.attributionStatus === attributionFilter;

    return matchSearch && matchType && matchAttr;
  });

  return (
    <div className="space-y-6">
      {/* Scope Disclaimer Alert */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 space-y-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-semibold">
          <Info className="w-4 h-4" />
          <span>Evidence-Based Activity & Attribution Disclaimer</span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          The existing Python monitor records filesystem events via standard operating system hooks (Watchdog). Because standard filesystem APIs do not attach responsible process IDs or caller binary paths, all events are truthfully labelled as <span className="text-amber-300 font-mono">"Responsible process unknown"</span> with attribution status <span className="text-amber-300 font-mono">"Unavailable"</span>. Missing evidence is never equated with proof of malicious or non-malicious activity.
        </p>
      </div>

      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Activity Monitoring Stream</h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time filesystem events and telemetric evidence captured in monitored project workspaces.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search file paths, processes..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Types</option>
            <option value="file_created">file_created</option>
            <option value="file_modified">file_modified</option>
            <option value="file_deleted">file_deleted</option>
            <option value="file_moved">file_moved</option>
            <option value="process_started">process_started</option>
          </select>

          {/* Attribution Status Filter */}
          <select
            value={attributionFilter}
            onChange={e => setAttributionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Attributions</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Correlated">Correlated</option>
            <option value="Unknown">Unknown</option>
            <option value="Unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState
          icon="activity"
          title="No filesystem activity recorded"
          description="Monitoring source unavailable or no file events have been collected in the designated test workspace. Run activity_monitor.py or load sample lab activity."
          actionLabel="Load Lab Sample"
          onAction={onLoadSample}
          secondaryActionLabel="Import Report"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Event & Timestamp</th>
                  <th className="py-3 px-4">Monitored Resource Path</th>
                  <th className="py-3 px-4">Responsible Process</th>
                  <th className="py-3 px-4">Attribution Status</th>
                  <th className="py-3 px-4">Evidence Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filtered.map(ev => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        {getEventIcon(ev.eventType)}
                        <span className="font-mono text-cyan-300 font-medium">{ev.eventType}</span>
                      </div>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {new Date(ev.timestamp).toLocaleString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-200 max-w-sm truncate" title={ev.filePath}>
                      {ev.filePath}
                      {ev.isDirectory && (
                        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-slate-400 font-sans">
                          directory
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <span className="text-amber-300/90">{ev.responsibleProcess}</span>
                      {ev.processId && (
                        <span className="text-[10px] text-slate-500 ml-1">PID: {ev.processId}</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusPill status={ev.attributionStatus} size="sm" />
                    </td>

                    <td className="py-3.5 px-4 text-[11px] text-slate-400 max-w-xs">
                      <div>{ev.evidenceDetails}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        {ev.monitoringCoverageLimitations}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
