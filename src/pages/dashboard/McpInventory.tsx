import React, { useState } from 'react';
import { 
  Server, 
  Search, 
  AlertTriangle, 
  FolderCheck, 
  Terminal, 
  ShieldCheck, 
  Lock,
  ExternalLink,
  Tag
} from 'lucide-react';
import { StatusPill } from '../../components/StatusPill.js';
import { SeverityBadge } from '../../components/SeverityBadge.js';
import { EmptyState } from '../../components/EmptyState.js';
import type { McpServer } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface McpInventoryProps {
  servers: McpServer[];
  onRefresh: () => void;
  onOpenImport: () => void;
  onLoadSample: () => void;
}

export const McpInventory: React.FC<McpInventoryProps> = ({
  servers,
  onRefresh,
  onOpenImport,
  onLoadSample
}) => {
  const { user } = useAuth();
  const canEdit = user && (user.role === 'admin' || user.role === 'analyst');

  const [search, setSearch] = useState('');
  const [filterPinned, setFilterPinned] = useState<'ALL' | 'pinned' | 'unpinned'>('ALL');
  const [filterSuspicious, setFilterSuspicious] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleUpdateApproval = async (id: string, status: 'Approved' | 'Unapproved' | 'Review Required') => {
    try {
      setUpdatingId(id);
      await apiRequest(`/api/mcp-servers/${id}/approval`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (err: any) {
      alert(`Failed to update approval: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredServers = servers.filter(srv => {
    const matchSearch = 
      srv.name.toLowerCase().includes(search.toLowerCase()) ||
      srv.parentApp.toLowerCase().includes(search.toLowerCase()) ||
      srv.command.toLowerCase().includes(search.toLowerCase()) ||
      srv.args.some(a => a.toLowerCase().includes(search.toLowerCase()));
    
    const matchPinned = 
      filterPinned === 'ALL' ||
      (filterPinned === 'pinned' && srv.isVersionPinned) ||
      (filterPinned === 'unpinned' && !srv.isVersionPinned);

    const matchSuspicious = !filterSuspicious || srv.hasSuspiciousPattern;

    return matchSearch && matchPinned && matchSuspicious;
  });

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">MCP Server Inventory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Model Context Protocol servers declared in Cursor, Claude Desktop, and local developer configuration files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search servers, commands, packages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
          </div>

          {/* Version Pinning Filter */}
          <select
            value={filterPinned}
            onChange={e => setFilterPinned(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Versions</option>
            <option value="pinned">Pinned Only</option>
            <option value="unpinned">Unpinned Only (@latest)</option>
          </select>

          {/* Suspicious Filter Toggle */}
          <button
            onClick={() => setFilterSuspicious(!filterSuspicious)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center space-x-1.5 ${
              filterSuspicious
                ? 'bg-red-950 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Suspicious Pattern ({servers.filter(s => s.hasSuspiciousPattern).length})</span>
          </button>
        </div>
      </div>

      {servers.length === 0 ? (
        <EmptyState
          icon="scan"
          title="No MCP server configurations discovered"
          description="No Model Context Protocol servers were detected in candidate configuration files (such as cursor_settings.json). Run the scanner locally or load sample lab data."
          actionLabel="Load Lab Sample"
          onAction={onLoadSample}
          secondaryActionLabel="Import Report"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredServers.map(srv => (
            <div
              key={srv.id}
              className={`p-5 rounded-xl border transition-all ${
                srv.hasSuspiciousPattern
                  ? 'bg-slate-900/80 border-red-500/30 hover:border-red-500/60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-white">{srv.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                      Parent: {srv.parentApp}
                    </span>
                    <StatusPill status={srv.approvalStatus} size="sm" />
                    {srv.isVersionPinned ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                        Pinned
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                        Unpinned (@latest)
                      </span>
                    )}
                  </div>

                  {/* Suspicious Reasons Callout */}
                  {srv.suspiciousReasons && srv.suspiciousReasons.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-xs text-red-300 space-y-1">
                      <div className="font-semibold flex items-center space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                        <span>Security Risk Pattern Detected:</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-red-300/90 pl-1">
                        {srv.suspiciousReasons.map((r, ri) => (
                          <li key={ri}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Execution Command Line */}
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 flex items-center space-x-2 overflow-x-auto">
                    <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-400 shrink-0">$</span>
                    <span className="font-bold text-white">{srv.command}</span>
                    <span className="text-slate-300">{srv.args.join(' ')}</span>
                  </div>

                  {/* Metadata Bar */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono pt-1">
                    <div>
                      <strong className="text-slate-300">Config:</strong> {srv.configFilePath}
                    </div>
                    {srv.allowedFolders && srv.allowedFolders.length > 0 && (
                      <div>
                        <strong className="text-slate-300">Whitelisted Folders:</strong> {srv.allowedFolders.join(', ')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Actions */}
                {canEdit && (
                  <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                    {srv.approvalStatus !== 'Approved' && (
                      <button
                        onClick={() => handleUpdateApproval(srv.id, 'Approved')}
                        disabled={updatingId === srv.id}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 text-xs font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {srv.approvalStatus !== 'Unapproved' && (
                      <button
                        onClick={() => handleUpdateApproval(srv.id, 'Unapproved')}
                        disabled={updatingId === srv.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30 text-xs font-semibold"
                      >
                        Unapprove
                      </button>
                    )}
                    {srv.approvalStatus !== 'Review Required' && (
                      <button
                        onClick={() => handleUpdateApproval(srv.id, 'Review Required')}
                        disabled={updatingId === srv.id}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                      >
                        Flag Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
