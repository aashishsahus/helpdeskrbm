import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BookOpen,
  Search,
  FileText,
  ExternalLink,
  Tag,
  Eye,
  HelpCircle
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const { knowledgeBase } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(knowledgeBase[0]?.id || null);

  const selectedArticle = knowledgeBase.find(a => a.id === selectedArticleId);

  const filteredArticles = knowledgeBase.filter(
    a =>
      !searchQuery ||
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          Help Desk Knowledge Base & Self-Service SOPs
        </h1>
        <p className="text-xs text-gray-500">
          Official corporate IT guides, troubleshooters, and standard operating procedures.
        </p>
      </div>

      {/* Standard Knowledge Base Search Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-200 space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span>Search Knowledge Base SOPs</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder='Filter articles by title, topic or tag (e.g., "password", "VPN", "hardware")...'
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-xs font-medium border border-gray-200 outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Main Knowledge Base Layout (Left articles list, Right viewer) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Articles */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-4 space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">
            Approved SOP Articles ({filteredArticles.length})
          </h2>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredArticles.map(art => {
              const isSel = art.id === selectedArticleId;
              return (
                <div
                  key={art.id}
                  onClick={() => setSelectedArticleId(art.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    isSel
                      ? 'bg-blue-50 border-blue-400 shadow-2xs'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-[10px] font-bold text-blue-600 block mb-1 uppercase tracking-wider">
                    {art.category}
                  </span>
                  <h3 className="font-bold text-gray-900 mb-1">{art.title}</h3>
                  <p className="text-gray-500 text-[11px] line-clamp-2">{art.summary}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Article Reader */}
        <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-2xs p-6 space-y-4">
          {selectedArticle ? (
            <>
              <div className="border-b border-gray-100 pb-4">
                <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {selectedArticle.category}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-4 text-[11px] text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> {selectedArticle.views} views
                  </span>
                  <span>Updated: {new Date(selectedArticle.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedArticle.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-mono rounded">
                    #{t}
                  </span>
                ))}
              </div>

              {/* Article Content Markdown Rendering */}
              <div className="prose prose-sm max-w-none text-gray-800 text-xs leading-relaxed whitespace-pre-line p-4 bg-gray-50/60 rounded-xl border border-gray-100 font-sans">
                {selectedArticle.content}
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-gray-400">
              Select an article on the left to read full standard operating procedure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
