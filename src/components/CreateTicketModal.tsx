import React, { useState } from 'react';
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
  User
} from 'lucide-react';
import { TicketPriority } from '../types';

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

  const [department, setDepartment] = useState(currentUser?.department || 'IT Operations');
  const [location, setLocation] = useState(currentUser?.location || 'RPR');
  const [category, setCategory] = useState('Hardware');
  const [subCategory, setSubCategory] = useState('Laptop');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [assignedAgentId, setAssignedAgentId] = useState<string>('');
  const [requiredByDate, setRequiredByDate] = useState('');
  const [contactNumber, setContactNumber] = useState(currentUser?.mobile || '+91 98765 43210');
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);

  if (!isCreateTicketOpen) return null;

  const currentCategoryObj = categories.find(c => c.name === category);
  const availableSubCategories = currentCategoryObj ? currentCategoryObj.subCategories : ['General'];

  // Selected agent details
  const selectedAgent = users.find(u => u.id === assignedAgentId || u.employeeId === assignedAgentId);

  // Active support agents and staff list
  const activeStaff = users.filter(u => u.status !== 'Disabled');

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const cat = categories.find(c => c.name === catName);
    if (cat) {
      setSubCategory(cat.subCategories[0] || 'General');
      setPriority(cat.defaultPriority);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFileError('');

    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ];

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
        category,
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
              <p className="text-xs text-gray-400">Direct agent assignment & auto-sync with Google Sheets</p>
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
                <span className="text-gray-400">Category:</span>
                <span className="font-semibold">{category} ({subCategory})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority:</span>
                <span className="font-semibold text-blue-600">{priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Assigned Agent:</span>
                <span className="font-semibold text-emerald-700">
                  {selectedAgent ? `${selectedAgent.name} (${selectedAgent.employeeId || selectedAgent.id})` : 'Auto-Assigned / Department Queue'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Attachments Uploaded:</span>
                <span className="font-semibold">{files.length} File(s) to Google Drive</span>
              </div>
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
            {/* Requester Bar */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Employee ID</span>
                <span className="font-semibold text-gray-900 font-mono">{currentUser?.employeeId || 'GUEST'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Employee Name</span>
                <span className="font-semibold text-gray-900">{currentUser?.name || 'Guest User'}</span>
              </div>
              <div>
                <span className="text-gray-400 block text-[10px] uppercase font-bold">Email</span>
                <span className="font-semibold text-gray-900 truncate block">{currentUser?.email || 'unauthenticated'}</span>
              </div>
            </div>

            {/* Department & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Branch / Office Location</label>
                <select
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                >
                  {branches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category & Sub Category */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sub Category</label>
                <select
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
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
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Subject / Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Brief summary of the issue (e.g. Printer offline in Sales bay)"
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
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe exact symptoms, error codes, steps to reproduce, or urgent operational impacts..."
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              />
            </div>

            {/* Dates & Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
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
