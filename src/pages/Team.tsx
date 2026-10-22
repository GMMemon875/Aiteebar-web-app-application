import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Linkedin, 
  Github, 
  Globe, 
  Shield, 
  PlusCircle, 
  Briefcase, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import type { TeamMember } from '../types/index.js';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';

interface TeamProps {
  onNavigate: (page: string) => void;
}

export const Team: React.FC<TeamProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<TeamMember[]>('/api/team')
      .then(res => setMembers(res))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>PROJECT LEADERSHIP & CONTRIBUTORS</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Aiteebar Team
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
              The researchers, security analysts, and engineers building the Aiteebar AI Security Platform.
            </p>
          </div>

          {user && user.role === 'admin' && (
            <button
              onClick={() => onNavigate('dashboard-team')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0"
            >
              <Briefcase className="w-4 h-4" />
              <span>Manage Team (Admin)</span>
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-sm font-mono text-slate-500 animate-pulse">
            LOADING TEAM PROFILES...
          </div>
        ) : members.length === 0 ? (
          /* Honest Placeholder State as required by prompt */
          <div className="p-12 md:p-16 rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center mx-auto text-slate-400 shadow-[0_0_20px_rgba(6,182,212,0.05)]">
              <Users className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white">No Team Profiles Published Yet</h3>
            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
              In accordance with Aiteebar verification standards, we do not invent placeholder biographies, fictitious credentials, or unverified contributors. Verified profiles can be added and published by platform administrators in the dashboard.
            </p>
            {user && user.role === 'admin' ? (
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('dashboard-team')}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs inline-flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Team Member</span>
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono">
                Log in as an administrator to manage and publish team profiles.
              </p>
            )}
          </div>
        ) : (
          /* Published Team Members Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map(member => (
              <div
                key={member.id}
                className="rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 transition-all p-6 flex flex-col justify-between group shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              >
                <div>
                  <div className="flex items-start space-x-4 mb-4">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        className="w-16 h-16 rounded-xl object-cover border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)] shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-950 to-slate-800 border border-cyan-500/40 flex items-center justify-center font-bold text-xl text-cyan-300 font-mono shrink-0">
                        {member.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {member.fullName}
                      </h3>
                      <p className="text-xs text-cyan-400 font-mono font-medium">{member.roleTitle}</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">
                    {member.biography}
                  </p>

                  {/* Responsibilities */}
                  {member.responsibilities && member.responsibilities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                        Key Responsibilities:
                      </h4>
                      <ul className="space-y-1 text-xs text-slate-400">
                        {member.responsibilities.map((resp, i) => (
                          <li key={i} className="flex items-start space-x-1.5">
                            <span className="text-cyan-400 font-bold">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Skills badges */}
                  {member.skills && member.skills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {member.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] font-mono border border-slate-700/60"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Social links */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center space-x-3 text-slate-400">
                  {member.linkedInUrl && (
                    <a
                      href={member.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {member.githubUrl && (
                    <a
                      href={member.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-800 hover:text-white transition-colors"
                      title="GitHub"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {member.portfolioUrl && (
                    <a
                      href={member.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded hover:bg-slate-800 hover:text-teal-400 transition-colors"
                      title="Portfolio"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
