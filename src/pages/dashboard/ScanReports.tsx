import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  Clock, 
  Terminal, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  X
} from 'lucide-react';
import { EmptyState } from '../../components/EmptyState.js';
import type { ScanReport } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.js';

interface ScanReportsProps {
  reports: ScanReport[];
  onRefresh: () => void;
  onOpenImport: () => void;
  onLoadSample: () => void;
  loadingSample: boolean;
}

export const ScanReports: React.FC<ScanReportsProps> = ({
  reports,
  onRefresh,
  onOpenImport,
  onLoadSample,
  loadingSample
}) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [selectedReport, setSelectedReport] = useState<ScanReport | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scan report and its associated findings?')) return;
    try {
      setDeletingId(id);
      await apiRequest(`/api/scans/${id}`, { method: 'DELETE' });
      onRefresh();
    } catch (err: any) {
      alert(`Failed to delete scan report: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportJson = (report: ScanReport) => {
    const blob = new Blob([report.rawReportJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_report_${report.scannedTarget.replace(/[^a-zA-Z0-9]/g, '_')}_${report.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = (report: ScanReport) => {
    let parsed: any;
    try {
      parsed = JSON.parse(report.rawReportJson);
    } catch {
      alert('Could not parse report JSON for CSV export.');
      return;
    }

    const rows: string[] = ['Type,Rule_Or_Name,Severity_Or_Category,Evidence_Or_Command'];

    if (Array.isArray(parsed.findings)) {
      parsed.findings.forEach((f: any) => {
        rows.push(`Finding,"${f.rule_id || ''}","${f.severity || ''}","${(f.evidence || '').replace(/"/g, '""')}"`);
      });
    }

    if (Array.isArray(parsed.discovered_apps)) {
      parsed.discovered_apps.forEach((a: any) => {
        rows.push(`App,"${a.name || ''}","${a.category || ''}","${(a.install_path || '').replace(/"/g, '""')}"`);
      });
    }

    if (Array.isArray(parsed.mcp_servers)) {
      parsed.mcp_servers.forEach((s: any) => {
        rows.push(`MCP Server,"${s.name || ''}","${s.parent_app || ''}","${s.command || ''} ${((s.args || []).join(' ')).replace(/"/g, '""')}"`);
      });
    }

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scan_summary_${report.id.slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Scan Reports Archive</h2>
          <p className="text-xs text-slate-400 mt-1">
            Audit-ready JSON reports produced by aiteebar_mini_scanner.py or ingested through authenticated agent synchronization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onLoadSample}
            disabled={loadingSample}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{loadingSample ? 'Loading...' : 'Load Lab Sample'}</span>
          </button>

          <button
            onClick={onOpenImport}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Report</span>
          </button>
        </div>
      </div>

      {reports.length === 0 ? (
        <EmptyState
          icon="scan"
          title="No scan reports available"
          description="No scan reports have been ingested into the platform. You can upload a report from your local Python scanner or load the verified Windows lab report."
          actionLabel="Load Lab Sample Report"
          onAction={onLoadSample}
          secondaryActionLabel="Upload scan_report.json"
          onSecondaryAction={onOpenImport}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {reports.map(report => (
            <div
              key={report.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-base text-white">{report.scannedTarget}</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] font-mono">
                    Scanner v{report.scannerVersion}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono">
                    Source: {report.reportSource}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="text-white font-bold">{report.summary.totalApps} AI Apps</span>
                  <span>•</span>
                  <span className="text-white font-bold">{report.summary.mcpServers} MCP Servers</span>
                  <span>•</span>
                  <span className="text-red-400 font-bold">{report.summary.highFindings} High Findings</span>
                  <span>•</span>
                  <span className="text-amber-400 font-bold">{report.summary.mediumFindings} Medium</span>
                  <span>•</span>
                  <span>{report.summary.totalActivityEvents} File Events</span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono text-slate-500">
                  <span>Scanned: {new Date(report.scanTimestamp).toLocaleString()}</span>
                  <span>Uploaded by: {report.uploadedByEmail}</span>
                  {report.fileName && <span>File: {report.fileName}</span>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => setSelectedReport(report)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 hover:border-cyan-500/40"
                  title="Inspect raw report JSON"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect JSON</span>
                </button>

                <button
                  onClick={() => handleExportJson(report)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  title="Export raw JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleExportCsv(report)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-mono border border-slate-700"
                  title="Export Summary CSV"
                >
                  CSV
                </button>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(report.id)}
                    disabled={deletingId === report.id}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-red-400 border border-slate-700"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw JSON Inspector Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono">
                  {selectedReport.scannedTarget} — Raw JSON Telemetry
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 flex-1 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-800">
              <pre className="text-xs font-mono text-cyan-300 whitespace-pre leading-relaxed">
                {selectedReport.rawReportJson}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-500 font-mono">
                Report ID: {selectedReport.id}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleExportJson(selectedReport)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download JSON</span>
                </button>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
