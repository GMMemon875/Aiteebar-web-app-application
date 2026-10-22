import React from 'react';
import { 
  Shield, 
  Terminal, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ExternalLink,
  Code2,
  Calendar,
  FileText
} from 'lucide-react';

interface ProjectProps {
  onNavigate: (page: string) => void;
}

export const Project: React.FC<ProjectProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROJECT SPECIFICATION & ARCHITECTURE</span>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
              <span className="flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Last Updated: October 2026</span>
              </span>
              <span>•</span>
              <span className="text-cyan-400 font-bold">v0.4.2-preview</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Aiteebar AI Security Project
          </h1>
          <p className="text-slate-300 text-base mt-2 max-w-3xl leading-relaxed">
            A dedicated, open architecture for discovering AI coding editors, evaluating Model Context Protocol (MCP) server configuration risks, and recording evidence-based activity.
          </p>
        </div>

        {/* Mission & Problem Statement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              <span>Project Mission</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              To provide enterprise security and engineering leaders with uncompromised, factual visibility into developer AI toolchains. We bridge the gap between opaque local AI assistant configurations and organizational security posture through continuous discovery, configuration risk analysis, and rigorous evidence gathering.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>The Problem Statement</span>
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Developers rapidly configure AI tools like Cursor and Claude Desktop to execute MCP servers. These servers frequently invoke unpinned npm/python packages with automated bypass flags (<code className="text-cyan-300 font-mono">-y</code>) or broad folder permissions, creating immediate supply-chain tampering and unintended remote code execution risks.
            </p>
          </div>
        </div>

        {/* Modular Architecture Breakdown */}
        <div className="space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            System Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-cyan-400">
                <Terminal className="w-5 h-5" />
                <h3 className="font-bold text-white">Local Python Scanner</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Location: Windows Endpoint (aiteebar_mini_scanner.py)
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Lightweight Python CLI operating locally without elevated privileges. Inspects Windows registry and candidate paths for Cursor, Claude Desktop, and Ollama; reads MCP configuration JSONs; never runs discovered commands.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-teal-400">
                <Cpu className="w-5 h-5" />
                <h3 className="font-bold text-white">Risk & Watchdog Engine</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Modules: risk_engine.py & activity_monitor.py
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Evaluates rules against extracted configuration tokens: flags unpinned package references (@latest), dangerous subshells (cmd.exe, powershell), and logs filesystem creation/modification events via Python Watchdog.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-purple-400">
                <Layers className="w-5 h-5" />
                <h3 className="font-bold text-white">Central Security Platform</h3>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Stack: Express API + React 19 + JSON Database
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                Centralized dashboard providing role-based access control, untrusted scan report ingestion, risk finding triage, audit logging, documentation, and agent REST synchronization.
              </p>
            </div>
          </div>
        </div>

        {/* Security Scope & Truthful Boundaries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-emerald-500/20 space-y-4">
            <h3 className="text-base font-bold text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>In Scope (Implemented & Actively Monitored)</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Discovery of installed Windows AI applications (Cursor, Claude Desktop, Ollama).</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Static parsing of Cursor MCP server configuration files.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Rule evaluation for unpinned dependencies and suspicious subshells.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Filesystem event logging (created, modified, deleted) in designated test paths.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Standardized scan_report.json ingestion, validation, and audit tracking.</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-amber-500/20 space-y-4">
            <h3 className="text-base font-bold text-amber-300 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <span>Out of Scope / Current Known Limitations</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>No Process Attribution:</strong> Watchdog filesystem hooks do not supply process PID. Labelled strictly as "Responsible process unknown".</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>No Browser Inspection:</strong> We do not infer AI usage simply because Google Chrome or Edge is open.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>No Automatic Server Execution:</strong> We inspect declarations statically; we never launch arbitrary MCP servers.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-amber-400 font-bold">•</span>
                <span><strong>No Secret Storage:</strong> Tokens, passwords, and private environment variables are never stored or displayed.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Documentation Quick Links */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white mb-1">Want to review technical documentation?</h4>
            <p className="text-xs text-slate-400">Explore risk rule specifications, scanner execution guides, and schema definitions.</p>
          </div>
          <button
            onClick={() => onNavigate('docs')}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-1.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)]"
          >
            <FileText className="w-4 h-4" />
            <span>Open Documentation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
