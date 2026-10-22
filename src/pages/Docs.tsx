import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Terminal, 
  FileCode, 
  ShieldAlert, 
  Lock, 
  ChevronRight, 
  FileText,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';
import type { DocArticle } from '../types/index.js';
import { apiRequest } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.js';

interface DocsProps {
  onNavigate: (page: string) => void;
}

export const Docs: React.FC<DocsProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<DocArticle[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('project-overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<DocArticle[]>('/api/docs')
      .then(res => {
        setArticles(res);
        if (res.length > 0) {
          setSelectedSlug(res[0].slug);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.summary.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  const currentArticle = articles.find(a => a.slug === selectedSlug) || articles[0];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-800 pb-6 mb-8 gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono mb-3">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
              <span>TECHNICAL SPECIFICATIONS & GUIDES</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Aiteebar Platform Documentation
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Comprehensive reference for scanner operation, MCP risk engine rules, JSON schema, and operational limitations.
            </p>
          </div>

          {user && user.role === 'admin' && (
            <button
              onClick={() => onNavigate('dashboard-docs')}
              className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center space-x-2 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all shrink-0"
            >
              <span>Manage Docs (Admin)</span>
            </button>
          )}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Articles List */}
            <div className="space-y-1.5">
              {filteredArticles.map(article => {
                const isActive = article.slug === selectedSlug;
                return (
                  <button
                    key={article.id}
                    onClick={() => setSelectedSlug(article.slug)}
                    className={`w-full text-left p-3 rounded-lg transition-all border flex flex-col ${
                      isActive
                        ? 'bg-cyan-950/60 border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                        : 'bg-slate-900/40 border-slate-800/80 text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono uppercase text-cyan-400">
                        {article.category}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-600'}`} />
                    </div>
                    <span className="text-xs font-semibold text-white">{article.title}</span>
                    <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{article.summary}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Document Viewer */}
          <div className="lg:col-span-8">
            {currentArticle ? (
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-6 md:p-8 space-y-6">
                <div className="border-b border-slate-800/80 pb-4">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 mb-2">
                    <span>{currentArticle.category.toUpperCase()}</span>
                    <span>•</span>
                    <span className="text-slate-400">Updated: {currentArticle.lastUpdated}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">{currentArticle.title}</h2>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentArticle.summary}</p>
                </div>

                {/* Article Body */}
                <div className="prose prose-invert prose-cyan max-w-none text-slate-300 text-sm leading-relaxed space-y-4">
                  {currentArticle.content.split('\n\n').map((block, idx) => {
                    if (block.startsWith('### ')) {
                      return (
                        <h3 key={idx} className="text-lg font-bold text-cyan-300 pt-2 border-b border-slate-800/60 pb-1">
                          {block.replace('### ', '')}
                        </h3>
                      );
                    }
                    if (block.startsWith('1. ') || block.startsWith('2. ') || block.startsWith('- ')) {
                      return (
                        <div key={idx} className="bg-slate-950/70 border border-slate-800 rounded-lg p-4 font-sans text-xs space-y-2">
                          {block.split('\n').map((line, li) => (
                            <div key={li} className="text-slate-300">
                              {line}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <p key={idx} className="text-slate-300 whitespace-pre-line">
                        {block}
                      </p>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 font-mono">
                NO ARTICLE FOUND MATCHING CRITERIA
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
