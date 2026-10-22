import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Search, 
  FileCode, 
  AlertTriangle, 
  Eye, 
  Terminal, 
  FileText, 
  CheckCircle2, 
  Clock, 
  HelpCircle,
  Filter
} from 'lucide-react';
import { StatusPill } from '../components/StatusPill.js';
import type { PlatformCapability } from '../types/index.js';
import { apiRequest } from '../utils/api.js';

interface PlatformProps {
  onNavigate: (page: string) => void;
}

export const Platform: React.FC<PlatformProps> = ({ onNavigate }) => {
  const [capabilities, setCapabilities] = useState<PlatformCapability[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Implemented' | 'In Development' | 'Planned'>('ALL');

  useEffect(() => {
    apiRequest<PlatformCapability[]>('/api/capabilities')
      .then(setCapabilities)
      .catch(() => {});
  }, []);

  const workflowSteps = [
    {
      num: '01',
      title: 'Discover AI Applications',
      icon: Search,
      badge: 'Implemented',
      details: 'Scans Windows registry, %LOCALAPPDATA% candidates, and running processes to identify AI developer tools (Cursor, VS Code extensions, Claude Desktop, and Ollama local daemon).',
      evidenceSource: 'Windows process snapshot & candidate filesystem check',
      limitation: 'Does not infer browser-based AI usage merely because a web browser is running.'
    },
    {
      num: '02',
      title: 'Locate Supported MCP Configuration Files',
      icon: FileCode,
      badge: 'Implemented',
      details: 'Detects and parses JSON configurations (such as cursor_settings.json and Claude Desktop config) defining Model Context Protocol (MCP) server endpoints.',
      evidenceSource: 'Direct filesystem read of authorized configuration paths',
      limitation: 'Restricted to known configuration directories configured on the local endpoint.'
    },
    {
      num: '03',
      title: 'Inspect Server Commands & Package Metadata',
      icon: Terminal,
      badge: 'Implemented',
      details: 'Extracts the exact command string (e.g. npx, uvx, docker, python), arguments, package name, pinned semantic versions, and permitted directory whitelists.',
      evidenceSource: 'Parsed MCP JSON objects',
      limitation: 'Secrets, environment variables, and authentication tokens are masked and never transmitted.'
    },
    {
      num: '04',
      title: 'Identify Configured Risk Patterns',
      icon: AlertTriangle,
      badge: 'Implemented',
      details: 'Evaluates configurations against security rules: unpinned package references (@latest), suspicious shell interpreters (cmd.exe, powershell), and automated execution approval flags (-y, --yes).',
      evidenceSource: 'risk_engine.py rule match evaluation',
      limitation: 'Configuration risk indicates an unsafe declaration; it does not prove malicious exploitation.'
    },
    {
      num: '05',
      title: 'Collect Supported Filesystem Activity Evidence',
      icon: Eye,
      badge: 'Implemented',
      details: 'Uses the Python Watchdog framework in activity_monitor.py to track real-time file creation, modification, deletion, and directory events in configured project folders.',
      evidenceSource: 'Filesystem event notifications via OS watchdog hooks',
      limitation: 'Standard filesystem hooks do not supply the responsible process PID or image path.'
    },
    {
      num: '06',
      title: 'Correlate Activity with Process & Security Logs',
      icon: ShieldCheck,
      badge: 'In Development',
      details: 'Correlates observed filesystem events with process launch telemetry and Windows Event Log entries when ETW (Event Tracing for Windows) or Sysmon data is available.',
      evidenceSource: 'Correlated event logs and ETW telemetry',
      limitation: 'Where correlation data is missing, the dashboard strictly records "Responsible process unknown".'
    },
    {
      num: '07',
      title: 'Generate Reports with Findings & Recommendations',
      icon: FileText,
      badge: 'Implemented',
      details: 'Compiles a standardized scan_report.json containing discovered applications, MCP server inventories, severity-rated findings, monitored file events, and actionable remediation steps.',
      evidenceSource: 'Consolidated Aiteebar JSON schema',
      limitation: 'Reports are stored securely and treated as untrusted inputs during ingestion.'
    }
  ];

  const filteredCaps = statusFilter === 'ALL'
    ? capabilities
    : capabilities.filter(c => c.status === statusFilter);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-4">
            <span>PLATFORM ARCHITECTURE & WORKFLOW</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Aiteebar AI Security Lifecycle
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mt-3 leading-relaxed">
            Aiteebar inspects developer endpoints and local AI infrastructure through seven rigorous stages. Every finding is backed by explicit evidence, separating static configuration risks from observed runtime events.
          </p>
        </div>

        {/* 7-Step Workflow Deep Dive */}
        <div className="space-y-6 mb-16">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Stage-by-Stage Security Workflow
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {workflowSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.num}
                  className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
                >
                  <div className="flex items-start space-x-4">
                    <span className="text-xl font-mono font-bold text-cyan-400 pt-1 shrink-0">
                      {step.num}
                    </span>
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{step.title}</h3>
                        <StatusPill status={step.badge} size="sm" />
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed max-w-3xl">
                        {step.details}
                      </p>
                      <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
                        <span className="text-slate-400">
                          <strong className="text-slate-200">Evidence Source:</strong> {step.evidenceSource}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-72 shrink-0 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400">
                    <strong className="text-amber-400 block mb-1">Operational Limitation:</strong>
                    {step.limitation}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Capabilities Matrix Filter */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-1">
                Capability Matrix
              </h2>
              <h3 className="text-2xl font-bold text-white">Feature Status Verification</h3>
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              {(['ALL', 'Implemented', 'In Development', 'Planned'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                    statusFilter === tab
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCaps.map(cap => (
              <div
                key={cap.id}
                className="p-5 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">
                      {cap.category}
                    </span>
                    <StatusPill status={cap.status} size="sm" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-2">{cap.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{cap.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
                  Scope: {cap.scope}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
