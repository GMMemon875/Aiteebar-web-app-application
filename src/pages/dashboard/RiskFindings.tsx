import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileEdit, 
  History, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Server
} from 'lucide-react';
import { SeverityBadge } from '../../components/SeverityBadge.js';
import { StatusPill } from '../../components/StatusPill.js';
import { EmptyState } from '../../components/EmptyState.js';
import type { RiskFinding, Severity, FindingStatus } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface RiskFindingsProps {
  findings: RiskFinding[];
  onRefresh: () => void;
  onOpenImport: () => void;
  onLoadSample: () => void;
}

export const RiskFindings: React.FC<RiskFindingsProps> = ({
  findings,
  onRefresh,
  onOpenImport,
  onLoadSample
}) => {
  const { user } = useAuth();
  const canTriage = user && (user.role === 'admin' || user.role === 'analyst');

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal / Inline Edit State
  const [editingFinding, setEditingFinding] = useState<RiskFinding | null>(null);
  const [newStatus, setNewStatus] = useState<FindingStatus>('Open');
  const [newNotes, setNewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const handleOpenEdit = (f: RiskFinding) => {
    setEditingFinding(f);
    setNewStatus(f.status);
    setNewNotes(f.analystNotes || '');
  };

  const handleSaveTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFinding) return;

    setSaving(true);
    try {
      await apiRequest(`/api/findings/${editingFinding.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          analystNotes: newNotes
        })
      });
      setEditingFinding(null);
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update finding: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const filtered = findings.filter(f => {
    const matchSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.ruleId.toLowerCase().includes(search.toLowerCase()) ||
      f.description.toLowerCase().includes(search.toLowerCase()) ||
      f.evidence.toLowerCase().includes(search.toLowerCase());
    
    const matchSev = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchStatus = statusFilter === 'ALL' || f.status === statusFilter;

    return matchSearch && matchSev && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Security Risk Findings</h2>
          <p className="text-xs text-slate-400 mt-1">
            Triaged vulnerabilities, configuration hazards, and unpinned dependencies detected across AI assets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search findings, rule IDs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
          </div>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
            <option value="INFORMATIONAL">INFORMATIONAL</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Reviewing">Reviewing</option>
            <option value="Resolved">Resolved</option>
            <option value="Accepted Risk">Accepted Risk</option>
          </select>
        </div>
      </div>

      {findings.length === 0 ? (
        <EmptyState
          icon="findings"
          title="No security risk findings"
          description="No findings have been flagged yet. Ingest a scan report from the Windows endpoint or load the verified lab sample."
          actionLabel="Load Lab Sample"
          onAction={onLoadSample}
          secondaryActionLabel="Import scan_report.json"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <div className="space-y-4">
          {filtered.map(f => {
            const isExpanded = expandedId === f.id;
            return (
              <div
                key={f.id}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden hover:border-cyan-500/30 transition-all"
              >
                {/* Header row */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <SeverityBadge severity={f.severity} />
                      <span className="text-xs font-mono text-cyan-400 font-semibold">{f.ruleId}</span>
                      <StatusPill status={f.status} size="sm" />
                      {f.category && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700/60">
                          {f.category}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-white">{f.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
                      {f.relatedApp && (
                        <span className="flex items-center space-x-1">
                          <Cpu className="w-3.5 h-3.5 text-slate-500" />
                          <span>App: {f.relatedApp}</span>
                        </span>
                      )}
                      {f.relatedMcpServer && (
                        <span className="flex items-center space-x-1">
                          <Server className="w-3.5 h-3.5 text-slate-500" />
                          <span>Server: {f.relatedMcpServer}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(f.timestamp).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {canTriage && (
                      <button
                        onClick={() => handleOpenEdit(f)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 border border-slate-700 hover:border-cyan-500/40 flex items-center space-x-1.5 transition-all"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                        <span>Triage</span>
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : f.id)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      title={isExpanded ? 'Collapse' : 'Expand details'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 bg-slate-950/40 space-y-4 text-xs">
                    <div>
                      <h4 className="font-semibold text-slate-300 mb-1">Explanation</h4>
                      <p className="text-slate-400 leading-relaxed">{f.description}</p>
                    </div>

                    {/* Evidence Box */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono">
                      <div className="text-[10px] text-cyan-400 font-bold mb-1 uppercase tracking-wider">
                        Telemetric Evidence:
                      </div>
                      <div className="text-slate-300 break-all">{f.evidence}</div>
                      <div className="text-[10px] text-slate-500 mt-1">Source: {f.source}</div>
                    </div>

                    {/* Recommendation Box */}
                    <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20">
                      <div className="text-[10px] text-teal-400 font-bold mb-1 uppercase tracking-wider">
                        Actionable Remediation:
                      </div>
                      <div className="text-slate-300 leading-relaxed">{f.recommendation}</div>
                    </div>

                    {/* Analyst Notes */}
                    {f.analystNotes && (
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                        <div className="text-[10px] text-amber-400 font-bold mb-1 uppercase tracking-wider">
                          Analyst Notes:
                        </div>
                        <div className="text-slate-300">{f.analystNotes}</div>
                      </div>
                    )}

                    {/* Finding History Log */}
                    {f.history && f.history.length > 0 && (
                      <div>
                        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mb-2 flex items-center space-x-1">
                          <History className="w-3 h-3" />
                          <span>Audit Trail & Triage History</span>
                        </div>
                        <div className="space-y-1.5">
                          {f.history.map((h, hi) => (
                            <div key={hi} className="p-2 rounded bg-slate-900/60 border border-slate-800/60 text-[11px] flex items-center justify-between">
                              <span className="text-slate-300">{h.action} by <span className="text-cyan-400">{h.userEmail}</span></span>
                              <span className="text-slate-500 font-mono text-[10px]">{new Date(h.timestamp).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Triage Modal */}
      {editingFinding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">Triage Risk Finding</span>
              <h3 className="text-base font-bold text-white">{editingFinding.title}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{editingFinding.ruleId}</p>
            </div>

            <form onSubmit={handleSaveTriage} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Investigation Status
                </label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Open">Open</option>
                  <option value="Reviewing">Reviewing</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Accepted Risk">Accepted Risk</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Analyst Assessment Notes
                </label>
                <textarea
                  rows={4}
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Record verification notes, compensating controls, or resolution ticket IDs..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingFinding(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Update Finding'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
