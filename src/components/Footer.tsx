import React from 'react';
import { Shield, ExternalLink, Terminal, Cpu, FileText } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
  contactEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, contactEmail = 'security@aiteebar.local' }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-base font-bold text-white">Aiteebar</span>
            </div>
            <p className="text-xs text-cyan-400 font-mono font-medium">
              Discover. Assess. Monitor. Protect.
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Developing AI security platform focused on discovering AI applications, inspecting MCP configurations, identifying risky patterns, and evidence-based activity monitoring.
            </p>
          </div>

          {/* Column 2: Platform Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('platform')} className="hover:text-cyan-400 transition-colors">
                  7-Step Security Workflow
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('capabilities')} className="hover:text-cyan-400 transition-colors">
                  Current Capabilities Matrix
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('project')} className="hover:text-cyan-400 transition-colors">
                  Project Scope & Architecture
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('docs')} className="hover:text-cyan-400 transition-colors">
                  Documentation & Risk Rules
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Scanner Integration */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono mb-3">
              Scanner Integration
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-400" />
                <span>aiteebar_mini_scanner.py</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Cpu className="w-3.5 h-3.5 text-purple-400" />
                <span>risk_engine.py</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>activity_monitor.py</span>
              </li>
              <li className="pt-1 text-[11px] text-slate-500 font-mono">
                Windows Lab target: C:\Users\kamran\Desktop\Aiteebar-Lab
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Verification */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase font-mono mb-3">
              Operational Standards
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Scanner Format: scan_report.json</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Contact: <span className="text-cyan-400 font-mono">{contactEmail}</span>
              </p>
              <div className="p-2.5 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 leading-snug">
                Process attribution is labelled "Responsible process unknown" until ETW integration is available.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>
            &copy; 2026 Aiteebar AI Security Project. Authorized enterprise security monitoring only.
          </p>
          <div className="flex items-center space-x-4 font-mono text-[11px]">
            <span className="text-slate-400">Release: v0.4.2-preview</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyan-500">Node: 22.x + React 19 + Express</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
