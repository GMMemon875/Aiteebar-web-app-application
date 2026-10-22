import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Cpu, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  ShieldCheck,
  FolderOpen
} from 'lucide-react';
import { StatusPill } from '../../components/StatusPill.js';
import { EmptyState } from '../../components/EmptyState.js';
import type { DiscoveredApp, AppCategory, AppApprovalStatus } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface AppInventoryProps {
  apps: DiscoveredApp[];
  onRefresh: () => void;
  onOpenImport: () => void;
  onLoadSample: () => void;
}

export const AppInventory: React.FC<AppInventoryProps> = ({
  apps,
  onRefresh,
  onOpenImport,
  onLoadSample
}) => {
  const { user } = useAuth();
  const canEdit = user && (user.role === 'admin' || user.role === 'analyst');

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const categories: AppCategory[] = [
    'AI coding editors',
    'Desktop AI assistants',
    'Local AI runtimes',
    'Browser-based AI services',
    'Other AI applications'
  ];

  const handleUpdateApproval = async (id: string, status: AppApprovalStatus) => {
    try {
      setUpdatingId(id);
      await apiRequest(`/api/apps/${id}/approval`, {
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

  const filteredApps = apps.filter(app => {
    const matchSearch = 
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      (app.installPath && app.installPath.toLowerCase().includes(search.toLowerCase())) ||
      app.discoveryMethod.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'ALL' || app.category === categoryFilter;
    const matchAppr = approvalFilter === 'ALL' || app.approvalStatus === approvalFilter;
    return matchSearch && matchCat && matchAppr;
  });

  return (
    <div className="space-y-6">
      {/* Title & Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Application Inventory</h2>
          <p className="text-xs text-slate-400 mt-1">
            Catalog of discovered AI coding editors, desktop assistants, and local AI runtimes on monitored endpoints.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search apps or paths..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48 sm:w-60"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Approval Filter */}
          <select
            value={approvalFilter}
            onChange={e => setApprovalFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Approvals</option>
            <option value="Approved">Approved</option>
            <option value="Unapproved">Unapproved</option>
            <option value="Under Review">Under Review</option>
          </select>
        </div>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          icon="apps"
          title="No AI applications detected"
          description="The scanner has not registered any AI applications yet. Import a scan report from the Windows scanner or load the verified lab sample."
          actionLabel="Load Lab Sample"
          onAction={onLoadSample}
          secondaryActionLabel="Import scan_report.json"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Status & Discovery</th>
                  <th className="py-3 px-4">Install Path</th>
                  <th className="py-3 px-4">Policy Approval</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center shrink-0">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        </div>
                        <div>
                          <div className="font-bold text-white text-xs">{app.name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{app.executableName || 'process'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-cyan-300">
                      {app.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <StatusPill status={app.runningStatus} size="sm" />
                        <div className="text-[10px] text-slate-400 font-mono">
                          Method: {app.discoveryMethod}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate font-mono text-[11px] text-slate-400" title={app.installPath}>
                      {app.installPath || <span className="text-slate-600">Not recorded</span>}
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusPill status={app.approvalStatus} size="sm" />
                    </td>

                    {canEdit && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {app.approvalStatus !== 'Approved' && (
                            <button
                              onClick={() => handleUpdateApproval(app.id, 'Approved')}
                              disabled={updatingId === app.id}
                              className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 hover:bg-emerald-900 border border-emerald-500/30 text-[10px] font-semibold"
                              title="Approve application"
                            >
                              Approve
                            </button>
                          )}
                          {app.approvalStatus !== 'Unapproved' && (
                            <button
                              onClick={() => handleUpdateApproval(app.id, 'Unapproved')}
                              disabled={updatingId === app.id}
                              className="px-2 py-1 rounded bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-500/30 text-[10px] font-semibold"
                              title="Mark unapproved"
                            >
                              Unapprove
                            </button>
                          )}
                          {app.approvalStatus !== 'Under Review' && (
                            <button
                              onClick={() => handleUpdateApproval(app.id, 'Under Review')}
                              disabled={updatingId === app.id}
                              className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-[10px]"
                            >
                              Review
                            </button>
                          )}
                        </div>
                      </td>
                    )}
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
