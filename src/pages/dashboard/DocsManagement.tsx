import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Edit2, 
  Eye, 
  CheckCircle2, 
  X,
  FileText
} from 'lucide-react';
import type { DocArticle } from '../../types/index.js';
import { apiRequest } from '../../utils/api.js';

interface DocsManagementProps {
  onPreviewPublicDocs: () => void;
}

export const DocsManagement: React.FC<DocsManagementProps> = ({ onPreviewPublicDocs }) => {
  const [docs, setDocs] = useState<DocArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocArticle | null>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<DocArticle['category']>('Overview');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);

  const categories: DocArticle['category'][] = [
    'Overview',
    'Architecture',
    'Scanner',
    'MCP Security',
    'Risk Rules',
    'Monitoring',
    'Limitations & Privacy'
  ];

  const fetchDocs = async () => {
    try {
      const data = await apiRequest<DocArticle[]>('/api/docs');
      setDocs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const openAddModal = () => {
    setEditingDoc(null);
    setTitle('');
    setSlug('');
    setCategory('Overview');
    setSummary('');
    setContent('');
    setOrder(docs.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (d: DocArticle) => {
    setEditingDoc(d);
    setTitle(d.title);
    setSlug(d.slug);
    setCategory(d.category);
    setSummary(d.summary);
    setContent(d.content);
    setOrder(d.order);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title,
      slug,
      category,
      summary,
      content,
      order: Number(order)
    };

    try {
      if (editingDoc) {
        await apiRequest(`/api/docs/${editingDoc.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await apiRequest('/api/docs', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      fetchDocs();
    } catch (err: any) {
      alert(`Error saving doc article: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this documentation article?')) return;
    try {
      await apiRequest(`/api/docs/${id}`, { method: 'DELETE' });
      fetchDocs();
    } catch (err: any) {
      alert(`Failed to delete doc: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Documentation Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Author and edit technical manuals, scanner execution instructions, and risk rule definitions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onPreviewPublicDocs}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 hover:text-white flex items-center space-x-1.5 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Preview Public Docs</span>
          </button>

          <button
            onClick={openAddModal}
            className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Article</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {docs.map(doc => (
          <div
            key={doc.id}
            className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1 flex-1">
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 text-[10px] font-mono uppercase">
                  {doc.category}
                </span>
                <span className="text-xs font-mono text-slate-500">Order: {doc.order}</span>
                <span className="text-xs font-mono text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-500">/{doc.slug}</span>
              </div>
              <h3 className="text-base font-bold text-white">{doc.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-1">{doc.summary}</p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => openEditModal(doc)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700"
                title="Edit Article"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(doc.id)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-red-400 border border-slate-700"
                title="Delete Article"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-cyan-500/30 p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white">
                {editingDoc ? 'Edit Documentation Article' : 'Create Article'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 my-4 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => {
                      setTitle(e.target.value);
                      if (!editingDoc) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                      }
                    }}
                    placeholder="Article Title..."
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={e => setSlug(e.target.value)}
                    placeholder="e.g. mcp-security-rules"
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={e => setOrder(Number(e.target.value))}
                    className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Summary</label>
                <input
                  type="text"
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="One sentence synopsis of the article..."
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Article Content (Markdown supported)
                </label>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="### Section Heading&#10;Detailed technical specifications..."
                  className="w-full p-3 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                />
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
                  {saving ? 'Saving...' : 'Save Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
