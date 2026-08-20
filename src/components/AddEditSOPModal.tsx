import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { KnowledgeBaseArticle } from '../types';
import {
  X,
  BookOpen,
  FileText,
  Link,
  ExternalLink,
  Tag,
  Save,
  Layers,
  Building,
  Sparkles,
  Eye,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface AddEditSOPModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: KnowledgeBaseArticle | null;
  onSaved?: (savedArticle: KnowledgeBaseArticle) => void;
}

export const AddEditSOPModal: React.FC<AddEditSOPModalProps> = ({
  isOpen,
  onClose,
  articleToEdit,
  onSaved
}) => {
  const {
    currentUser,
    categories,
    departments,
    addKnowledgeBaseArticle,
    editKnowledgeBaseArticle
  } = useApp();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [department, setDepartment] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state
  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      const matchedCat = categories.find(c => c.name.toLowerCase() === articleToEdit.category.toLowerCase());
      if (matchedCat) {
        setCategory(matchedCat.name);
        setCustomCategory('');
      } else {
        setCategory('Other');
        setCustomCategory(articleToEdit.category || '');
      }
      setDepartment(articleToEdit.department || '');
      setTagsInput((articleToEdit.tags || []).join(', '));
      setSummary(articleToEdit.summary || '');
      setContent(articleToEdit.content || '');
      setDocUrl(articleToEdit.docUrl || articleToEdit.driveUrl || '');
      setExternalLink(articleToEdit.externalLink || '');
    } else {
      setTitle('');
      setCategory(categories[0]?.name || 'General IT');
      setCustomCategory('');
      setDepartment(departments[0]?.name || 'IT Support');
      setTagsInput('');
      setSummary('');
      setContent('');
      setDocUrl('');
      setExternalLink('');
    }
    setPreviewMode(false);
    setErrorMsg('');
  }, [articleToEdit, isOpen, categories, departments]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanTitle = title.trim();
    const finalCategory = (category === 'Other' ? customCategory.trim() : category.trim()) || 'General IT';
    const cleanSummary = summary.trim();
    const cleanContent = content.trim();

    if (!cleanTitle) {
      setErrorMsg('Please provide an SOP Article Title.');
      return;
    }
    if (!finalCategory) {
      setErrorMsg('Please select or specify a Category.');
      return;
    }
    if (!cleanSummary) {
      setErrorMsg('Please enter a brief summary or abstract.');
      return;
    }
    if (!cleanContent) {
      setErrorMsg('Please write the step-by-step guide / resolution content.');
      return;
    }

    const parsedTags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    setIsSubmitting(true);

    try {
      if (articleToEdit) {
        const updates: Partial<KnowledgeBaseArticle> = {
          title: cleanTitle,
          category: finalCategory,
          department: department || undefined,
          tags: parsedTags.length > 0 ? parsedTags : ['general'],
          summary: cleanSummary,
          content: cleanContent,
          docUrl: docUrl.trim() || undefined,
          driveUrl: docUrl.trim() || undefined,
          externalLink: externalLink.trim() || undefined
        };
        editKnowledgeBaseArticle(articleToEdit.id, updates);
        if (onSaved) onSaved({ ...articleToEdit, ...updates } as KnowledgeBaseArticle);
      } else {
        const created = addKnowledgeBaseArticle({
          title: cleanTitle,
          category: finalCategory,
          department: department || undefined,
          tags: parsedTags.length > 0 ? parsedTags : ['sop'],
          summary: cleanSummary,
          content: cleanContent,
          docUrl: docUrl.trim() || undefined,
          driveUrl: docUrl.trim() || undefined,
          externalLink: externalLink.trim() || undefined,
          authorName: currentUser?.name || 'IT Admin',
          authorEmail: currentUser?.email || 'misrpr@rathibuildmart.com'
        });
        if (onSaved) onSaved(created);
      }
      setIsSubmitting(false);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Failed to save SOP article.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between border-b border-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-400/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white flex items-center gap-2">
                {articleToEdit ? 'Edit Knowledge Base SOP' : 'Create New Knowledge Base SOP'}
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/30 text-emerald-300 font-bold rounded-full border border-emerald-400/30">
                  Self-Service Guide
                </span>
              </h2>
              <p className="text-xs text-gray-300">
                Publish standard operating procedures, documentation URLs, and reference links for users.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Title & Preview Toggle */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 space-y-1.5">
              <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                SOP Title / Topic <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. How to Configure Outlook Email Client on Windows & Mobile"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                required
              />
            </div>
            <div className="shrink-0 pt-5">
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  previewMode
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{previewMode ? 'Edit Mode' : 'Live Preview'}</span>
              </button>
            </div>
          </div>

          {previewMode ? (
            /* Live Preview Layout */
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
              <div className="border-b border-gray-200 pb-3">
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase tracking-wider">
                  {category === 'Other' ? customCategory || 'General' : category || 'General'}
                </span>
                <h3 className="text-base font-extrabold text-gray-900 mt-2">{title || 'Untitled SOP'}</h3>
                <p className="text-xs text-gray-500 mt-1 italic">{summary || 'No summary entered yet.'}</p>
              </div>

              {/* Links Preview */}
              {(docUrl || externalLink) && (
                <div className="flex flex-wrap gap-2">
                  {docUrl && (
                    <a
                      href={docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-blue-100"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Google Doc / Drive Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {externalLink && (
                    <a
                      href={externalLink}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-purple-50 border border-purple-200 text-purple-700 font-bold text-xs rounded-xl flex items-center gap-1.5 hover:bg-purple-100"
                    >
                      <Link className="w-3.5 h-3.5" />
                      <span>Reference Link / Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Content Preview */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 text-gray-800 text-xs leading-relaxed whitespace-pre-line font-sans">
                {content || 'Enter step-by-step instructions below...'}
              </div>
            </div>
          ) : (
            <>
              {/* Category, Department & Tags Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                    <option value="Email & Security">Email & Security</option>
                    <option value="Network">Network</option>
                    <option value="Procurement & Hardware">Procurement & Hardware</option>
                    <option value="Software & Apps">Software & Apps</option>
                    <option value="ERP / SAP">ERP / SAP</option>
                    <option value="Other">+ Custom / Other</option>
                  </select>
                </div>

                {category === 'Other' && (
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                      Specify Custom Category <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value)}
                      placeholder="e.g. Printer Setup & Drivers"
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Target Department
                  </label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">All Departments (General)</option>
                    {departments.map((d, idx) => (
                      <option key={`sop-dept-${d.id || d.name}-${idx}`} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Keywords / Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="e.g. outlook, email, sync, mfa"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* URL & Doc Link Inputs (Requested by User) */}
              <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-3">
                <div className="font-bold text-emerald-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Link className="w-3.5 h-3.5 text-emerald-700" />
                  <span>External Documentation & Attachment Links</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Google Doc URL */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>Google Doc URL / Drive Link</span>
                      </span>
                      {docUrl && (
                        <a
                          href={docUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline text-[10px] font-bold inline-flex items-center gap-0.5"
                        >
                          <span>Test URL</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      value={docUrl}
                      onChange={e => setDocUrl(e.target.value)}
                      placeholder="https://docs.google.com/document/d/... or drive.google.com"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-[11px]"
                    />
                  </div>

                  {/* External Reference Link */}
                  <div className="space-y-1">
                    <label className="font-bold text-gray-700 text-[10px] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="w-3 h-3 text-purple-600" />
                        <span>External Portal / Reference Link</span>
                      </span>
                      {externalLink && (
                        <a
                          href={externalLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-purple-600 hover:underline text-[10px] font-bold inline-flex items-center gap-0.5"
                        >
                          <span>Test URL</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </label>
                    <input
                      type="url"
                      value={externalLink}
                      onChange={e => setExternalLink(e.target.value)}
                      placeholder="https://portal.company.com or web guide link"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Summary / Abstract */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                  Summary / Overview (1-2 sentences) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={summary}
                  onChange={e => setSummary(e.target.value)}
                  placeholder="Quick summary shown in article preview card"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              {/* Step-by-Step SOP Content */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                    Step-by-Step Guide / Resolution Content <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[10px] text-gray-400">Supports Markdown & numbered lists</span>
                </div>
                <textarea
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder={`### Step-by-Step Instructions\n\n1. Open your browser and navigate to the portal.\n2. Login with your corporate credentials.\n3. Click on Settings -> Account Configuration.\n4. Complete the required fields and click Save.`}
                  className="w-full p-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                  required
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving SOP...' : articleToEdit ? 'Update SOP Article' : 'Publish SOP Article'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
