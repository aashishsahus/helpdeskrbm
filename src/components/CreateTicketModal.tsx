import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  Trash2,
  FolderSync,
  UserCheck,
  ShieldCheck,
  Building,
  User,
  Layers,
  Sparkles
} from 'lucide-react';
import { TicketPriority } from '../types';
import {
  TICKET_TYPES,
  TICKET_HIERARCHY_DATA,
  getCategoriesForType,
  getModulesForCategory,
  getSubCategoriesForModule
} from '../data/ticketHierarchy';

export const CreateTicketModal: React.FC = () => {
  const {
    isCreateTicketOpen,
    setIsCreateTicketOpen,
    currentUser,
    users,
    departments,
    categories,
    branches,
    prioritiesList,
    createTicket
  } = useApp();

  // Background profile auto-fills (Hidden from inputs as requested)
  const [department, setDepartment] = useState(currentUser?.department || 'IT Operations');
  const [location, setLocation] = useState(currentUser?.location || 'RPR');

  // Hierarchy State: Type -> Category -> Module -> Sub-Category
  const [ticketType, setTicketType] = useState<string>('Modification Request');
  const [category, setCategory] = useState<string>('Orbit');
  const [module, setModule] = useState<string>('Invoice');
  const [subCategory, setSubCategory] = useState<string>('Add Item');

  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [requiredByDate, setRequiredByDate] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser?.mobile || '');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  // Synchronize profile defaults and initial hierarchy whenever modal opens
  useEffect(() => {
    if (isCreateTicketOpen && currentUser) {
      const userDept = currentUser.department || (departments[0]?.name ?? 'IT Operations');
      const userLoc = currentUser.location || (branches[0] ?? 'RPR');
      setDepartment(userDept);
      setLocation(userLoc);
      setContactNumber(currentUser.mobile || '');
    }
  }, [isCreateTicketOpen, currentUser, departments, branches]);

  if (!isCreateTicketOpen) return null;

  // Registered category names from system settings
  const registeredCategoryNames = categories.map(c => c.name);
  const availableCategories = getCategoriesForType(ticketType, registeredCategoryNames);
  const availableModules = getModulesForCategory(category, ticketType);

  const fallbackSubs = categories.find(c => c.name === category)?.subCategories || [];
  const availableSubCategories = getSubCategoriesForModule(category, module, ticketType, fallbackSubs);

  // Hierarchy Handlers
  const handleTypeChange = (newType: string) => {
    setTicketType(newType);
    const newCats = getCategoriesForType(newType, registeredCategoryNames);
    const validCat = newCats.includes(category) ? category : newCats[0] || 'Orbit';
    setCategory(validCat);

    const newMods = getModulesForCategory(validCat, newType);
    const validMod = newMods[0] || 'General';
    setModule(validMod);

    const newSubs = getSubCategoriesForModule(validCat, validMod, newType, fallbackSubs);
    setSubCategory(newSubs[0] || 'General');
  };

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const newMods = getModulesForCategory(newCat, ticketType);
    const validMod = newMods[0] || 'General';
    setModule(validMod);

    const catObj = categories.find(c => c.name === newCat);
    if (catObj && catObj.defaultPriority) {
      setPriority(catObj.defaultPriority);
    }

    const newSubs = getSubCategoriesForModule(newCat, validMod, ticketType, catObj?.subCategories || []);
    setSubCategory(newSubs[0] || 'General');
  };

  const handleModuleChange = (newMod: string) => {
    setModule(newMod);
    const newSubs = getSubCategoriesForModule(category, newMod, ticketType, fallbackSubs);
    setSubCategory(newSubs[0] || 'General');
  };

  // Auto-fill a clean subject suggestion based on selected hierarchy
  const handleAutoSuggestSubject = () => {
    setSubject(`[${category} - ${module}] ${subCategory}`);
  };

  // Selected agent details
  const selectedAgent = users.find(u => u.id === assignedAgentId || u.employeeId === assignedAgentId || u.name.toLowerCase() === assignedAgentId.toLowerCase());

  // Active support agents and staff list
  const activeStaff = users.filter(u => u.status !== 'Disabled');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFileError('');

    for (const f of selected as File[]) {
      if (f.size > 15 * 1024 * 1024) {
        setFileError(`File "${f.name}" exceeds maximum allowed size of 15MB.`);
        return;
      }
    }

    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    setSubmitting(true);
    try {
      const newTicket = await createTicket({
        employeeId: currentUser?.employeeId || 'EMP-GUEST',
        employeeName: currentUser?.name || 'Guest User',
        employeeEmail: currentUser?.email || 'guest@rathibuildmart.com',
        department,
        location,
        ticketType,
        category,
        module,
        subCategory,
        subject,
        description,
        priority,
        assignedAgentId: selectedAgent?.id || (assignedAgentId ? assignedAgentId : undefined),
        assignedAgentName: selectedAgent?.name || (assignedAgentId ? assignedAgentId : undefined),
        requiredByDate: requiredByDate || undefined,
        contactNumber,
        attachments: files
      });

      setCreatedTicketId(newTicket.id);
    } catch (err: any) {
      console.error('Ticket creation error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setCreatedTicketId(null);
    setSubject('');
    setDescription('');
    setAssignedAgentId('');
    setFiles([]);
    setIsCreateTicketOpen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="bg-[#111827] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              HD
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Create New Support Ticket</h2>
              <p className="text-xs text-gray-400">Structured ticket hierarchy & automated profile assignment</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {createdTicketId ? (
          /* Success Screen */
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Ticket Created Successfully!</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Ticket <strong className="font-mono text-blue-600 text-base">{createdTicketId}</strong> has been registered in the system and logged to Google Sheets database.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-600 max-w-md mx-auto space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-400">Request Type:</span>
                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{ticketType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Category & Module:</span>
                <span className="font-semibold">{category} → {module}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sub-Category / Action:</span>
                <span className="font-semibold text-gray-900">{subCategory}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className="font-semibold text-blue-600">{priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Department & Location:</span>
                <span className="font-semibold text-gray-800">{department} ({location})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned Agent:</span>
                <span className="font-semibold text-emerald-700">
                  {selectedAgent ? `${selectedAgent.name} (${selectedAgent.employeeId || selectedAgent.id})` : 'Auto-Assigned / Department Queue'}
                </span>
              </div>
              {files.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Attachments:</span>
                  <span className="font-semibold">{files.length} File(s)</span>
                </div>
              )}
              <div className="pt-2 border-t border-gray-200 flex items-center gap-2 text-emerald-800 font-semibold text-[11px] bg-emerald-50 p-2 rounded-lg">
                <span>📧</span>
                <span>Confirmation emails automatically sent to both employee and support team.</span>
              </div>
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Ticket Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Requester Profile Summary Bar (Department and Branch/Location auto-attached) */}
            <div className="p-3 bg-gradient-to-r from-gray-50 to-blue-50/40 rounded-xl border border-gray-200 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Requester</span>
                  <span className="font-semibold text-gray-900 truncate block">
                    {currentUser?.name || 'Guest User'} <span className="font-mono text-gray-500 text-[10px]">({currentUser?.employeeId || 'EMP-GUEST'})</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-gray-900 truncate block">{currentUser?.email || 'guest@rathibuildmart.com'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Department (Profile)</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded text-[11px] truncate">
                    <Building className="w-3 h-3 text-blue-600 shrink-0" />
                    <span className="truncate">{currentUser?.department || department}</span>
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Branch (Profile)</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px] truncate">
                    <span>📍</span>
                    <span className="truncate">{currentUser?.location || location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Hierarchical Selection Row 1: Type & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>Ticket Type <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Type</span>
                </label>
                <select
                  value={ticketType}
                  onChange={e => handleTypeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {TICKET_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>Category <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Category</span>
                </label>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availableCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Hierarchical Selection Row 2: Module & Sub-Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>Module <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Module</span>
                </label>
                <select
                  value={module}
                  onChange={e => handleModuleChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availableModules.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-800 mb-1 flex items-center justify-between">
                  <span>Sub-Category / Action Item <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">Sub-Category</span>
                </label>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {availableSubCategories.map((sub, idx) => (
                    <option key={idx} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Priority & Assign Direct Agent / User Dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/40 p-3.5 rounded-xl border border-blue-100">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Ticket Priority <span className="text-red-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {prioritiesList.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    Assign To User / Support Agent
                  </span>
                  <span className="text-[10px] text-gray-400 font-normal">Optional</span>
                </label>
                <select
                  value={assignedAgentId}
                  onChange={e => setAssignedAgentId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Auto Assign / Default Routing --</option>
                  <optgroup label="Support Agents & Managers">
                    {activeStaff
                      .filter(u => u.role === 'Support Agent' || u.role === 'Support Manager')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          [{u.employeeId || u.id}] {u.name} — {u.role} ({u.department || 'Support'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="System Administrators">
                    {activeStaff
                      .filter(u => u.role === 'Super Admin' || u.role === 'Admin')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          [{u.employeeId || u.id}] {u.name} — {u.role} ({u.department || 'Admin'})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="All Other Staff Members">
                    {activeStaff
                      .filter(u => u.role === 'Employee')
                      .map(u => (
                        <option key={u.id} value={u.id}>
                          [{u.employeeId || u.id}] {u.name} — {u.designation || 'Staff'} ({u.department})
                        </option>
                      ))}
                  </optgroup>
                </select>

                {selectedAgent && (
                  <div className="mt-2 flex items-center gap-2 p-1.5 bg-white rounded-lg border border-blue-200 text-[11px] text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {selectedAgent.name.charAt(0)}
                    </div>
                    <span className="font-bold text-blue-900">{selectedAgent.name}</span>
                    <span className="text-gray-400 font-mono text-[10px]">({selectedAgent.employeeId || selectedAgent.id})</span>
                    <span className="text-[10px] text-emerald-700 font-semibold ml-auto">{selectedAgent.role}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Subject */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-gray-700">
                  Subject / Issue Title <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoSuggestSubject}
                  className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 hover:underline"
                >
                  <Sparkles className="w-3 h-3 text-blue-500" />
                  Auto-fill Title from Selection
                </button>
              </div>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder={`Brief summary (e.g. [${category} - ${module}] ${subCategory})`}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe exact symptoms, error codes, steps to reproduce, or urgent operational impacts..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Dates & Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Contact Phone Number</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {currentUser?.mobile ? 'Auto-filled from profile' : 'Optional'}
                  </span>
                </label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Required By Date (Optional)</label>
                <input
                  type="date"
                  value={requiredByDate}
                  onChange={e => setRequiredByDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* File Upload to Google Drive */}
            <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-4 bg-gray-50/50 transition-colors">
              <div className="flex flex-col items-center justify-center text-center">
                <Upload className="w-8 h-8 text-blue-500 mb-1" />
                <p className="text-xs font-bold text-gray-800">
                  Upload Attachments (PDF, JPG, PNG, DOCX, XLSX, CSV)
                </p>
                <p className="text-[10px] text-gray-400 mb-2">
                  Files automatically sync to Google Drive folder <span className="font-mono text-gray-600">/Internal Help Desk/Tickets</span>
                </p>
                <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-100 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 shadow-2xs">
                  Browse Files
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {fileError && (
                <p className="text-xs text-red-600 mt-2 flex items-center gap-1 font-semibold">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}

              {files.length > 0 && (
                <div className="mt-3 space-y-1.5 border-t border-gray-200 pt-2">
                  {files.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <span className="font-medium text-gray-800 truncate">{file.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">({(file.size / 1024).toFixed(0)} KB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-gray-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? 'Creating Ticket...' : 'Submit Ticket'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

