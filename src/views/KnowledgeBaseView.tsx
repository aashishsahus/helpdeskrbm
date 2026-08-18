import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { KnowledgeBaseArticle } from '../types';
import { AddEditSOPModal } from '../components/AddEditSOPModal';
import {
  BookOpen,
  Search,
  FileText,
  ExternalLink,
  Tag,
  Eye,
  Plus,
  Edit,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Check,
  Printer,
  Sparkles,
  Link,
  Layers,
  FolderOpen,
  Calendar,
  User,
  Building,
  CheckCircle2,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const KnowledgeBaseView: React.FC = () => {
  const {
    knowledgeBase,
    currentUser,
    categories,
    deleteKnowledgeBaseArticle,
    voteKnowledgeBaseArticle,
    incrementKnowledgeBaseViews
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(knowledgeBase[0]?.id || null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<KnowledgeBaseArticle | null>(null);
  const [articleToDelete, setArticleToDelete] = useState<KnowledgeBaseArticle | null>(null);

  // Interactive feedback state
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);
  const [votedMap, setVotedMap] = useState<Record<string, 'helpful' | 'notHelpful'>>({});
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Available unique categories
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    knowledgeBase.forEach(a => {
      if (a.category) set.add(a.category);
    });
    categories.forEach(c => {
      if (c.name) set.add(c.name);
    });
    return ['All', ...Array.from(set)];
  }, [knowledgeBase, categories]);

  // Filtered articles
  const filteredArticles = useMemo(() => {
    return knowledgeBase.filter(a => {
      const matchesCat = selectedCategory === 'All' || a.category.toLowerCase() === selectedCategory.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCat;
      const matchesQuery =
        a.title.toLowerCase().includes(q) ||
        (a.summary && a.summary.toLowerCase().includes(q)) ||
        (a.content && a.content.toLowerCase().includes(q)) ||
        (a.tags && a.tags.some(t => t.toLowerCase().includes(q))) ||
        (a.category && a.category.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [knowledgeBase, selectedCategory, searchQuery]);

  // Sync selected article
  const selectedArticle = useMemo(() => {
    if (!selectedArticleId) return filteredArticles[0] || null;
    return knowledgeBase.find(a => a.id === selectedArticleId) || filteredArticles[0] || null;
  }, [knowledgeBase, selectedArticleId, filteredArticles]);

  const handleSelectArticle = (art: KnowledgeBaseArticle) => {
    setSelectedArticleId(art.id);
    incrementKnowledgeBaseViews(art.id);
  };

  const handleCopyArticle = (article: KnowledgeBaseArticle) => {
    const textToCopy = `Title: ${article.title}\nCategory: ${article.category}\n\nSummary:\n${article.summary}\n\nGuide:\n${article.content}\n${
      article.docUrl ? `\nDoc URL: ${article.docUrl}` : ''
    }${article.externalLink ? `\nReference Link: ${article.externalLink}` : ''}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 2500);
  };

  const handlePrintArticle = () => {
    window.print();
  };

  const handleVote = (articleId: string, type: 'helpful' | 'notHelpful') => {
    if (votedMap[articleId]) return;
    voteKnowledgeBaseArticle(articleId, type);
    setVotedMap(prev => ({ ...prev, [articleId]: type }));
    setFeedbackToast(type === 'helpful' ? 'Thank you! Marked as helpful.' : 'Feedback recorded. We will improve this guide.');
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleConfirmDelete = () => {
    if (!articleToDelete) return;
    deleteKnowledgeBaseArticle(articleToDelete.id);
    if (selectedArticleId === articleToDelete.id) {
      const remaining = knowledgeBase.filter(a => a.id !== articleToDelete.id);
      setSelectedArticleId(remaining[0]?.id || null);
    }
    setArticleToDelete(null);
  };

  const canManageKB = Boolean(
    currentUser?.role === 'Super Admin' ||
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Support Manager' ||
    currentUser?.role === 'Support Agent'
  );

  return (
    <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 text-white rounded-xl shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <span>Help Desk Knowledge Base & Self-Service SOPs</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Standard Operating Procedures (SOPs), IT resolution manuals, Google Doc guides, and reference URLs.
          </p>
        </div>

        {/* Add New SOP Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setArticleToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-2 transition-all cursor-pointer hover:shadow"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SOP Article</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="bg-white p-5 rounded-2xl shadow-2xs border border-gray-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search SOPs by title, keyword (#vpn, #mfa), department, or instructions..."
              className="w-full pl-10 pr-8 py-2.5 bg-gray-50 text-gray-900 rounded-xl text-xs font-medium border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="text-xs font-bold text-gray-500 shrink-0 font-mono">
            {filteredArticles.length} / {knowledgeBase.length} SOP Articles
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 mr-1">
            Category:
          </span>
          {allCategories.map(cat => {
            const isSel = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-bold text-xs shrink-0 transition-all ${
                  isSel
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Knowledge Base 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: SOP Articles List (4 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-col space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
            <h2 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-emerald-700" />
              <span>Standard Operating Procedures</span>
            </h2>
            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {filteredArticles.length} Loaded
            </span>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="py-12 px-4 text-center space-y-3 my-auto">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-gray-700">No SOP articles found</p>
              <p className="text-[11px] text-gray-400">
                Try searching with different keywords or create a new SOP guide.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setIsAddModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-emerald-800 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New SOP</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[680px] pr-1">
              {filteredArticles.map(art => {
                const isSel = selectedArticle?.id === art.id;
                const hasDoc = Boolean(art.docUrl || art.driveUrl);
                const hasLink = Boolean(art.externalLink);

                return (
                  <div
                    key={art.id}
                    onClick={() => handleSelectArticle(art)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isSel
                        ? 'bg-emerald-50/80 border-emerald-500 shadow-2xs ring-1 ring-emerald-400'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md uppercase tracking-wider">
                        {art.category}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                        <span className="flex items-center gap-0.5">
                          <Eye className="w-3 h-3 text-gray-400" />
                          {art.views || 0}
                        </span>
                        {art.helpfulCount ? (
                          <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                            <ThumbsUp className="w-2.5 h-2.5" />
                            {art.helpfulCount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-gray-900 mb-1 leading-snug">{art.title}</h3>
                    <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed mb-2">
                      {art.summary}
                    </p>

                    {/* Footer indicators for Doc / Link attached */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        {hasDoc && (
                          <span
                            className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-bold flex items-center gap-1"
                            title="Google Doc / Drive Link Attached"
                          >
                            <FileText className="w-2.5 h-2.5" />
                            <span>Doc</span>
                          </span>
                        )}
                        {hasLink && (
                          <span
                            className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded font-bold flex items-center gap-1"
                            title="External Reference Link Attached"
                          >
                            <ExternalLink className="w-2.5 h-2.5" />
                            <span>Link</span>
                          </span>
                        )}
                      </div>
                      <span className="text-gray-400 font-mono text-[10px]">
                        {new Date(art.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: SOP Reader & Action Center (7 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-2xs p-6 flex flex-col space-y-5">
          {selectedArticle ? (
            <>
              {/* Reader Header */}
              <div className="border-b border-gray-100 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-3 py-1 bg-emerald-800 text-white rounded-lg shadow-2xs uppercase tracking-wider">
                      {selectedArticle.category}
                    </span>
                    {selectedArticle.department && (
                      <span className="text-xs font-semibold px-2.5 py-0.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-md flex items-center gap-1">
                        <Building className="w-3 h-3 text-gray-500" />
                        <span>{selectedArticle.department}</span>
                      </span>
                    )}
                  </div>

                  {/* Actions (Edit, Delete, Copy, Print) */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyArticle(selectedArticle)}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200"
                      title="Copy Guide to Clipboard"
                    >
                      {copiedStatus ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-gray-600" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePrintArticle}
                      className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all border border-gray-200"
                      title="Print SOP Article"
                    >
                      <Printer className="w-3.5 h-3.5 text-gray-600" />
                      <span>Print</span>
                    </button>

                    {canManageKB && (
                      <>
                        <button
                          onClick={() => {
                            setArticleToEdit(selectedArticle);
                            setIsAddModalOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Edit this SOP"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => setArticleToDelete(selectedArticle)}
                          className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
                          title="Delete this SOP"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <h2 className="text-xl font-black text-gray-900 leading-tight">
                  {selectedArticle.title}
                </h2>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-medium pt-1">
                  <span className="flex items-center gap-1 text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Author: {selectedArticle.authorName || 'IT Support Team'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>Last Updated: {new Date(selectedArticle.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{selectedArticle.views || 1} Views</span>
                  </span>
                </div>
              </div>

              {/* Reference Links & Google Doc Banner (Requested by User) */}
              {(selectedArticle.docUrl || selectedArticle.driveUrl || selectedArticle.externalLink) && (
                <div className="p-4 bg-gradient-to-r from-blue-50/70 via-emerald-50/50 to-purple-50/70 rounded-xl border border-gray-200/80 space-y-2">
                  <div className="text-[11px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Link className="w-3.5 h-3.5 text-emerald-700" />
                    <span>External Links & Live Document Resources</span>
                  </div>

                  <div className="flex flex-wrap gap-2.5 pt-1">
                    {(selectedArticle.docUrl || selectedArticle.driveUrl) && (
                      <a
                        href={selectedArticle.docUrl || selectedArticle.driveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Open Google Doc / SOP Manual</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    )}

                    {selectedArticle.externalLink && (
                      <a
                        href={selectedArticle.externalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs inline-flex items-center gap-2 transition-all"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Open Reference Link / Web Portal</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Summary Highlight Box */}
              {selectedArticle.summary && (
                <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-700 font-medium leading-relaxed italic">
                  <strong>Overview:</strong> {selectedArticle.summary}
                </div>
              )}

              {/* Tags Filter Chips */}
              {selectedArticle.tags && selectedArticle.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tags:</span>
                  {selectedArticle.tags.map((t, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchQuery(t)}
                      className="px-2 py-0.5 bg-gray-100 hover:bg-emerald-100 hover:text-emerald-800 text-gray-600 text-[10px] font-mono rounded-md border border-gray-200 transition-colors"
                      title={`Filter articles with tag #${t}`}
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}

              {/* SOP Step-by-Step Resolution Guide Content */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Step-by-Step Resolution Guide</span>
                </h4>
                <div className="prose prose-sm max-w-none text-gray-800 text-xs leading-relaxed whitespace-pre-line p-5 bg-white rounded-xl border border-gray-200 font-sans shadow-2xs">
                  {selectedArticle.content}
                </div>
              </div>

              {/* Helpful Feedback Voting Box */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 mt-auto">
                <div>
                  <h4 className="font-bold text-xs text-gray-900">Was this SOP article helpful?</h4>
                  <p className="text-[11px] text-gray-500">
                    Your feedback helps the IT Help Desk team improve technical guides.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleVote(selectedArticle.id, 'helpful')}
                    disabled={Boolean(votedMap[selectedArticle.id])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      votedMap[selectedArticle.id] === 'helpful'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300'
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Yes ({selectedArticle.helpfulCount || 0})</span>
                  </button>

                  <button
                    onClick={() => handleVote(selectedArticle.id, 'notHelpful')}
                    disabled={Boolean(votedMap[selectedArticle.id])}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                      votedMap[selectedArticle.id] === 'notHelpful'
                        ? 'bg-red-600 text-white border-red-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-red-50 hover:text-red-800 hover:border-red-300'
                    }`}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                    <span>No ({selectedArticle.notHelpfulCount || 0})</span>
                  </button>
                </div>
              </div>

              {feedbackToast && (
                <div className="p-2.5 bg-emerald-800 text-white text-xs font-bold rounded-xl text-center shadow-md animate-in fade-in">
                  {feedbackToast}
                </div>
              )}
            </>
          ) : (
            <div className="py-24 text-center space-y-3 my-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-gray-700">No SOP Selected</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Select an SOP article from the left list to view step-by-step resolution guides, Google Docs, and documentation URLs.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit SOP Modal */}
      <AddEditSOPModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setArticleToEdit(null);
        }}
        articleToEdit={articleToEdit}
        onSaved={saved => {
          setSelectedArticleId(saved.id);
        }}
      />

      {/* Delete Confirmation Modal */}
      {articleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 border border-gray-200">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">Delete SOP Article?</h3>
              <p className="text-xs text-gray-500">
                Are you sure you want to permanently remove <strong>"{articleToDelete.title}"</strong> from the Knowledge Base?
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setArticleToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete SOP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
