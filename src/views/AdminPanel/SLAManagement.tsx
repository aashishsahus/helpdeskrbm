import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, ShieldCheck } from 'lucide-react';

export const SLAManagement: React.FC = () => {
  const { slaRules, updateSLARule } = useApp();

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto bg-[#F3F4F6]">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Service Level Agreement (SLA) Rules</h1>
        <p className="text-xs text-gray-500">Configure strict resolution target times based on ticket priority levels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {slaRules.map(rule => (
          <div key={rule.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className={`px-2.5 py-1 text-xs font-bold rounded uppercase ${
                rule.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                rule.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                rule.priority === 'Medium' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {rule.priority} Priority
              </span>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Target Resolution Time (Hours)</label>
              <input
                type="number"
                value={rule.resolutionHours}
                onChange={e => updateSLARule(rule.id, parseFloat(e.target.value) || 1)}
                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-lg font-bold font-mono text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <p className="text-[10px] text-gray-500">
              Response target: {rule.responseHours * 60} mins. Tickets exceeding target automatically mark SLA status as <strong className="text-red-600">Breached</strong>.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
