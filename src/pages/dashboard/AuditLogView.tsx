import React, { useState, useEffect } from 'react';
import { ClipboardList, Search, Clock, ShieldCheck, Filter } from 'lucide-react';
import type { AuditLog } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    try {
      const data = await apiRequest<AuditLog[]>('/api/audit-log');
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filtered = logs.filter(l => 
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.userEmail.toLowerCase().includes(search.toLowerCase()) ||
    l.details.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security Audit Log</h2>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system audit records tracking logins, policy updates, report ingestion, and finding triage.
          </p>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-60"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          LOADING AUDIT LOGS...
        </div>
      ) : logs.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center space-y-2">
          <ClipboardList className="w-8 h-8 text-slate-500 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No audit events recorded yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Audit logs are generated automatically when administrative or analyst security actions occur.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Target Entity</th>
                  <th className="py-3 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono">
                {filtered.map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white font-medium text-[11px]">
                      {log.userEmail}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {log.entityType} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ''}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-300 text-xs">
                      {log.details}
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
