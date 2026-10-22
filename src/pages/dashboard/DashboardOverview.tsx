import React from 'react';
import { 
  ShieldAlert, 
  Cpu, 
  Server, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  HardDrive,
  FileText,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { SeverityBadge } from '../../components/SeverityBadge.js';
import { StatusPill } from '../../components/StatusPill.js';
import { EmptyState } from '../../components/EmptyState.js';
import type { DiscoveredApp, McpServer, RiskFinding, ActivityEvent, ScanReport } from '../../types/index.js';

interface DashboardOverviewProps {
  apps: DiscoveredApp[];
  mcpServers: McpServer[];
  findings: RiskFinding[];
  activityEvents: ActivityEvent[];
  scanReports: ScanReport[];
  onNavigateSection: (sec: string) => void;
  onOpenImport: () => void;
  onLoadSample: () => void;
  loadingSample: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  apps,
  mcpServers,
  findings,
  activityEvents,
  scanReports,
  onNavigateSection,
  onOpenImport,
  onLoadSample,
  loadingSample
}) => {
  const hasData = scanReports.length > 0 || apps.length > 0;

  const highFindings = findings.filter(f => f.severity === 'HIGH').length;
  const medFindings = findings.filter(f => f.severity === 'MEDIUM').length;
  const lowFindings = findings.filter(f => f.severity === 'LOW').length;

  const runningApps = apps.filter(a => a.runningStatus === 'Running').length;
  const installedApps = apps.filter(a => a.runningStatus === 'Installed').length;

  const latestScan = scanReports[0];

  return (
    <div className="space-y-6">
      {/* Scope Integrity Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4 text-xs">
        <div className="flex items-start space-x-2.5">
          <Activity className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white font-semibold">Active Monitoring Coverage:</strong>
            <span className="text-slate-400 ml-1.5">
              Filesystem activity hooks active via Python Watchdog. Process tree attribution is currently unavailable in this operational mode and displayed as "Responsible process unknown".
            </span>
          </div>
        </div>
        <div className="shrink-0 flex items-center space-x-1.5 text-[11px] font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>REALTIME HOOKS ACTIVE</span>
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon="scan"
          title="No scan data available"
          description="Connect an authenticated Python agent or import a scan_report.json file to view discovered AI applications, MCP configurations, and security risk findings."
          actionLabel="Load Lab Sample Report"
          onAction={onLoadSample}
          secondaryActionLabel="Upload scan_report.json"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <>
          {/* Posture Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Apps Card */}
            <div 
              onClick={() => onNavigateSection('apps')}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase">AI Applications</span>
                <Cpu className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{apps.length}</span>
                <span className="text-xs text-slate-400 font-mono">Discovered</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-emerald-400">{runningApps} Running</span>
                <span className="text-cyan-400">{installedApps} Installed</span>
              </div>
            </div>

            {/* MCP Servers Card */}
            <div 
              onClick={() => onNavigateSection('mcp-servers')}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase">Configured MCP Servers</span>
                <Server className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{mcpServers.length}</span>
                <span className="text-xs text-slate-400 font-mono">Declared</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="text-amber-400">{mcpServers.filter(s => !s.isVersionPinned).length} Unpinned</span>
                <span className="text-rose-400">{mcpServers.filter(s => s.hasSuspiciousPattern).length} Flagged</span>
              </div>
            </div>

            {/* Risk Findings Card */}
            <div 
              onClick={() => onNavigateSection('findings')}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-red-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase">Security Risk Findings</span>
                <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-white">{findings.length}</span>
                <span className="text-xs text-slate-400 font-mono">Active</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center space-x-3 text-[11px] font-mono">
                <span className="text-red-400 font-bold">{highFindings} HIGH</span>
                <span className="text-amber-400 font-bold">{medFindings} MED</span>
                <span className="text-blue-400 font-bold">{lowFindings} LOW</span>
              </div>
            </div>

            {/* Latest Scan Status Card */}
            <div 
              onClick={() => onNavigateSection('scans')}
              className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-mono uppercase">Latest Scan Report</span>
                <FileText className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="truncate">
                <span className="text-sm font-bold text-white block truncate">
                  {latestScan ? latestScan.scannedTarget : 'No report ingested'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {latestScan ? `Scanner v${latestScan.scannerVersion}` : 'Scanner offline'}
                </span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 truncate">
                {latestScan ? new Date(latestScan.scanTimestamp).toLocaleString() : 'N/A'}
              </div>
            </div>
          </div>

          {/* Two-Column Detail Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Cols: Active Risk Findings Highlights */}
            <div className="lg:col-span-7 rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <ShieldAlert className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Critical Risk Findings</h3>
                </div>
                <button
                  onClick={() => onNavigateSection('findings')}
                  className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                >
                  <span>View All ({findings.length})</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {findings.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No active risk findings reported.
                </div>
              ) : (
                <div className="space-y-3">
                  {findings.slice(0, 4).map(f => (
                    <div
                      key={f.id}
                      onClick={() => onNavigateSection('findings')}
                      className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <SeverityBadge severity={f.severity} />
                          <span className="text-xs font-mono text-slate-400">{f.ruleId}</span>
                        </div>
                        <StatusPill status={f.status} size="sm" />
                      </div>
                      <h4 className="text-xs font-bold text-white">{f.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {f.description}
                      </p>
                      <div className="text-[10px] font-mono text-cyan-400/80 truncate">
                        Evidence: {f.evidence}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right 5 Cols: Filesystem Watchdog Activity Telemetry */}
            <div className="lg:col-span-5 rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <h3 className="text-sm font-bold text-white">Filesystem Watchdog Activity</h3>
                </div>
                <button
                  onClick={() => onNavigateSection('activity')}
                  className="text-xs font-mono text-teal-400 hover:text-teal-300 flex items-center space-x-1"
                >
                  <span>All Events</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {activityEvents.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 font-mono">
                  No filesystem activity events recorded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {activityEvents.slice(0, 5).map(ev => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-300">
                          {ev.eventType}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(ev.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-slate-300 font-mono text-[11px] truncate">
                        {ev.filePath}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span>Attribution: {ev.responsibleProcess}</span>
                        <span className="text-amber-400">{ev.attributionStatus}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
