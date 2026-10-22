import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Search, 
  Sliders, 
  Activity, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Terminal, 
  ChevronRight, 
  Cpu, 
  FileCode2, 
  Database,
  Users
} from 'lucide-react';
import { Hero3D } from '../components/Hero3D.js';
import { StatusPill } from '../components/StatusPill.js';
import { SeverityBadge } from '../components/SeverityBadge.js';
import type { PlatformCapability, TeamMember } from '../types/index.js';
import { apiRequest } from '../utils/api.js';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const [capabilities, setCapabilities] = useState<PlatformCapability[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    apiRequest<PlatformCapability[]>('/api/capabilities')
      .then(setCapabilities)
      .catch(() => {});

    apiRequest<TeamMember[]>('/api/team')
      .then(setTeamMembers)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Reduced motion toggle bar */}
      <div className="max-w-7xl mx-auto px-4 pt-3 flex justify-end">
        <button
          onClick={() => setReducedMotion(!reducedMotion)}
          className="text-[11px] font-mono text-slate-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
        >
          <span>Animation Mode:</span>
          <span className={`px-1.5 py-0.5 rounded text-[10px] ${reducedMotion ? 'bg-amber-900/60 text-amber-300' : 'bg-cyan-950 text-cyan-400 border border-cyan-800'}`}>
            {reducedMotion ? 'Reduced Motion' : 'Full 3D & FX'}
          </span>
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-20 md:pt-16 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/10 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & Call to Action */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>AITEEBAR AI SECURITY PLATFORM</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
                Discover and Assess Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                  AI Security Risks
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                Aiteebar is a dedicated AI security platform designed to discover installed AI applications, inspect Model Context Protocol (MCP) server configurations, detect unpinned packages and risky commands, and track evidence-based filesystem activity.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center space-x-2"
                >
                  <span>Open Security Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('platform')}
                  className="px-6 py-3 rounded-lg bg-slate-900/90 text-slate-200 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 transition-all font-medium flex items-center space-x-2"
                >
                  <span>Explore Platform</span>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              {/* Honest Scope Callout */}
              <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start space-x-2.5 max-w-xl">
                <Shield className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-slate-200 font-semibold">Scope & Integrity:</strong> We clearly distinguish confirmed configuration risks (such as unpinned MCP packages or dangerous shell wrappers) from executed actions. Process attribution is not assumed without direct operating system telemetry.
                </p>
              </div>
            </div>

            {/* Right Column: 3D Cyber Security Globe */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/40 backdrop-blur-md p-2 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <Hero3D reducedMotion={reducedMotion} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview Pillars */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
              Four Core Security Pillars
            </h2>
            <h3 className="text-3xl font-bold text-white">
              Comprehensive AI Infrastructure Visibility
            </h3>
            <p className="text-sm text-slate-400 mt-3">
              Built specifically for engineering organizations adopting Cursor, Claude Desktop, local runtimes, and MCP servers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Search className="w-5 h-5 text-cyan-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">1. Discover</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan candidate filesystem locations, registry entries, and local processes to discover installed AI coding editors and desktop assistants.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-teal-500/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-teal-950/80 border border-teal-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sliders className="w-5 h-5 text-teal-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">2. Assess</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect MCP configuration files, evaluate command arguments, identify unpinned package dependencies, and evaluate directory permissions.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-purple-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">3. Monitor</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Collect filesystem activity telemetry in designated directories using Watchdog hooks, logging creation, modification, and deletion events.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Lock className="w-5 h-5 text-emerald-400" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">4. Protect</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Surface severity-rated risk findings, correlate configuration hazards, enforce organizational policies, and generate audit-ready reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Step Security Workflow Preview */}
      <section className="py-16 border-t border-slate-800/80 bg-[#090d18]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                Operational Methodology
              </h2>
              <h3 className="text-3xl font-bold text-white">
                The 7-Step Security Workflow
              </h3>
            </div>
            <button
              onClick={() => onNavigate('platform')}
              className="mt-4 md:mt-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View Full Platform Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {[
              { step: '01', title: 'Discover AI Apps', desc: 'Scan candidate paths & runtimes' },
              { step: '02', title: 'Locate MCP Files', desc: 'Find Cursor & Claude configs' },
              { step: '03', title: 'Inspect Commands', desc: 'Evaluate flags & package versions' },
              { step: '04', title: 'Identify Risks', desc: 'Trigger risk engine rules' },
              { step: '05', title: 'Collect Evidence', desc: 'Watchdog filesystem activity' },
              { step: '06', title: 'Correlate Logs', desc: 'Process log mapping when present' },
              { step: '07', title: 'Generate Reports', desc: 'JSON reports & audit findings' },
            ].map(item => (
              <div
                key={item.step}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold block mb-2">
                    {item.step}
                  </span>
                  <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-tight">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Capabilities & Roadmap Highlights */}
      <section className="py-16 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                Verification & Roadmap
              </h2>
              <h3 className="text-3xl font-bold text-white">
                Current Capabilities Matrix
              </h3>
            </div>
            <button
              onClick={() => onNavigate('capabilities')}
              className="mt-4 md:mt-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>Explore All Capabilities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Implemented */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-emerald-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Implemented</span>
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400">
                  Ready in Python Lab
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Windows AI application discovery (Cursor, Claude Desktop, Ollama)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Cursor MCP configuration inspection</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Package version pinning analysis (@latest flags)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Suspicious command pattern detection (cmd.exe, -y)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>Basic filesystem event monitoring with Watchdog</span>
                </li>
              </ul>
            </div>

            {/* In Development */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-cyan-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-cyan-300 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <span>In Development</span>
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400">
                  Active Sprint
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Clearer dashboard risk posture reporting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Scan report import validation & normalization</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Expanded AI application discovery heuristics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-cyan-400 font-bold">•</span>
                  <span>Broader MCP configuration discovery (Windsurf, Zed)</span>
                </li>
              </ul>
            </div>

            {/* Planned */}
            <div className="p-6 rounded-xl bg-slate-900/60 border border-purple-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-purple-300 flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-purple-400" />
                  <span>Planned</span>
                </h4>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400">
                  Roadmap
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-300">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Reliable process attribution via Windows ETW driver</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Windows Security Event Log integration (Sysmon / 4688)</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Approved/unapproved policy enforcement workflows</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 font-bold">•</span>
                  <span>Data Loss Prevention (DLP) for external AI egress</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Preview Section */}
      <section className="py-16 border-t border-slate-800/80 bg-[#070b14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
            <div>
              <h2 className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
                Project Leadership
              </h2>
              <h3 className="text-3xl font-bold text-white">
                Engineering Team
              </h3>
            </div>
            <button
              onClick={() => onNavigate('team')}
              className="mt-4 md:mt-0 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
            >
              <span>View Full Team Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {teamMembers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {teamMembers.slice(0, 3).map(member => (
                <div key={member.id} className="p-6 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="flex items-center space-x-4 mb-4">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.fullName} className="w-14 h-14 rounded-full object-cover border border-cyan-500/40" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-800 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400">
                        {member.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-bold text-white">{member.fullName}</h4>
                      <p className="text-xs text-cyan-400 font-mono">{member.roleTitle}</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">{member.biography}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {member.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center">
              <Users className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-slate-300 mb-1">Team Profiles Under Configuration</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No public profiles have been published yet. Administrators can add and publish verified team members from the Private Security Dashboard.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Bar */}
      <section className="py-16 border-t border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-extrabold text-white">
            Ready to Inspect Your AI Application Footprint?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
            Access the private security dashboard to view discovered runtimes, inspect unpinned MCP configurations, and review Watchdog activity records.
          </p>
          <div className="flex justify-center items-center gap-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-teal-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Access Dashboard
            </button>
            <button
              onClick={() => onNavigate('docs')}
              className="px-6 py-3 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all"
            >
              Read Documentation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
