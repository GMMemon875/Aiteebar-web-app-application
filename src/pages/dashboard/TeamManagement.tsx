import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  EyeOff, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import type { TeamMember } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';

interface TeamManagementProps {
  onPreviewPublicTeam: () => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ onPreviewPublicTeam }) => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [biography, setBiography] = useState('');
  const [skillsStr, setSkillsStr] = useState('');
  const [respStr, setRespStr] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTeam = async () => {
    try {
      const data = await apiRequest<TeamMember[]>('/api/team');
      setMembers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const openAddModal = () => {
    setEditingMember(null);
    setFullName('');
    setRoleTitle('');
    setBiography('');
    setSkillsStr('');
    setRespStr('');
    setLinkedInUrl('');
    setGithubUrl('');
    setPortfolioUrl('');
    setIsPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (m: TeamMember) => {
    setEditingMember(m);
    setFullName(m.fullName);
    setRoleTitle(m.roleTitle);
    setBiography(m.biography);
    setSkillsStr(m.skills.join(', '));
    setRespStr(m.responsibilities.join('\n'));
    setLinkedInUrl(m.linkedInUrl || '');
    setGithubUrl(m.githubUrl || '');
    setPortfolioUrl(m.portfolioUrl || '');
    setIsPublished(m.isPublished);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      fullName,
      roleTitle,
      biography,
      skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean),
      responsibilities: respStr.split('\n').map(s => s.trim()).filter(Boolean),
      linkedInUrl: linkedInUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      portfolioUrl: portfolioUrl.trim() || undefined,
      isPublished
    };

    try {
      if (editingMember) {
        await apiRequest(`/api/team/${editingMember.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/team', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchTeam();
    } catch (err: any) {
      alert(`Error saving team member: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member profile?')) return;
    try {
      await apiRequest(`/api/team/${id}`, { method: 'DELETE' });
      fetchTeam();
    } catch (err: any) {
      alert(`Failed to delete member: ${err.message}`);
    }
  };

  const handleAvatarUpload = async (id: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await apiRequest(`/api/team/${id}/avatar`, {
        method: 'POST',
        body: formData
      });
      fetchTeam();
    } catch (err: any) {
      alert(`Avatar upload failed: ${err.message}`);
    }
  };

  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= members.length) return;

    const newMembers = [...members];
    const temp = newMembers[index];
    newMembers[index] = newMembers[targetIdx];
    newMembers[targetIdx] = temp;

    setMembers(newMembers);

    try {
      await apiRequest('/api/team/reorder', {
        method: 'POST',
        body: JSON.stringify({ orderedIds: newMembers.map(m => m.id) })
      });
    } catch (err: any) {
      console.error(err);
      fetchTeam();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Team Profile Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure verified researchers and security analysts displayed on the public Team page.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onPreviewPublicTeam}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preview Public Page</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs font-mono text-slate-500">
          LOADING TEAM ROSTER...
        </div>
      ) : members.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-center space-y-3">
          <Users className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No team profiles added yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Initially, no fictitious team members are published. Add verified team contributors, set their roles, and upload their photos.
          </p>
          <button
            onClick={openAddModal}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Team Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {members.map((member, index) => (
            <div
              key={member.id}
              className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start space-x-4 flex-1">
                {/* Photo & Upload control */}
                <div className="relative group shrink-0">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.fullName}
                      className="w-14 h-14 rounded-xl object-cover border border-cyan-500/40"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-300 font-mono">
                      {member.fullName.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  {/* Hidden file input for quick photo update */}
                  <label
                    htmlFor={`avatar-${member.id}`}
                    className="absolute inset-0 bg-slate-950/80 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-cyan-400 cursor-pointer transition-opacity"
                    title="Upload photo"
                  >
                    <Upload className="w-4 h-4" />
                  </label>
                  <input
                    id={`avatar-${member.id}`}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarUpload(member.id, e.target.files[0]);
                      }
                    }}
                  />
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-base text-white">{member.fullName}</span>
                    <span className="text-xs font-mono text-cyan-400 font-medium">({member.roleTitle})</span>
                    {member.isPublished ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
                        Draft / Hidden
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 max-w-2xl">{member.biography}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {member.skills.map((s, si) => (
                      <span key={si} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions & Reordering */}
              <div className="flex items-center space-x-2 shrink-0">
                {/* Reorder Buttons */}
                <button
                  onClick={() => handleMoveOrder(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveOrder(index, 'down')}
                  disabled={index === members.length - 1}
                  className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openEditModal(member)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700"
                  title="Edit Profile"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-red-400 border border-slate-700"
                  title="Delete Profile"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingMember ? 'Edit Team Profile' : 'Add Team Member'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 my-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer"
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Role / Job Title</label>
                  <input
                    type="text"
                    required
                    value={roleTitle}
                    onChange={e => setRoleTitle(e.target.value)}
                    placeholder="e.g. Lead AI Security Researcher"
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Short Biography</label>
                <textarea
                  rows={3}
                  required
                  value={biography}
                  onChange={e => setBiography(e.target.value)}
                  placeholder="Focus areas in Model Context Protocol security, static analysis, and runtime monitoring..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={skillsStr}
                  onChange={e => setSkillsStr(e.target.value)}
                  placeholder="MCP Protocol, Python, AST Analysis, Threat Modeling"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Responsibilities in Aiteebar (one per line)
                </label>
                <textarea
                  rows={3}
                  value={respStr}
                  onChange={e => setRespStr(e.target.value)}
                  placeholder="Architecting the Python Mini Scanner&#10;Authoring MCP risk engine rules&#10;Managing Windows ETW driver integration"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">LinkedIn URL</label>
                  <input
                    type="url"
                    value={linkedInUrl}
                    onChange={e => setLinkedInUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">GitHub URL</label>
                  <input
                    type="url"
                    value={githubUrl}
                    onChange={e => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/..."
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Portfolio URL</label>
                  <input
                    type="url"
                    value={portfolioUrl}
                    onChange={e => setPortfolioUrl(e.target.value)}
                    placeholder="https://portfolio.dev"
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="pub-check"
                  checked={isPublished}
                  onChange={e => setIsPublished(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <label htmlFor="pub-check" className="text-xs text-slate-300 cursor-pointer">
                  Publish profile to public Team page
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(6,182,212,0.3)] disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
