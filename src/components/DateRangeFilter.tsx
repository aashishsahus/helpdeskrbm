import React, { useState } from 'react';
import { Calendar, ChevronDown, Check, X } from 'lucide-react';
import { DateRangeFilterType, getDateRangeLabel } from '../utils/dateUtils';

interface DateRangeFilterProps {
  value: DateRangeFilterType;
  onChange: (filter: DateRangeFilterType, customStart?: string, customEnd?: string) => void;
  customStartDate?: string;
  customEndDate?: string;
  className?: string;
  showCustomOption?: boolean;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  value,
  onChange,
  customStartDate = '',
  customEndDate = '',
  className = '',
  showCustomOption = true
}) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [startInput, setStartInput] = useState(customStartDate);
  const [endInput, setEndInput] = useState(customEndDate);

  const filterOptions: { id: DateRangeFilterType; label: string }[] = [
    { id: 'thisWeek', label: 'This Week' },
    { id: 'lastWeek', label: 'Last Week' },
    { id: 'thisMonth', label: 'This Month' },
    { id: 'lastMonth', label: 'Last Month' },
    { id: 'all', label: 'All Time' }
  ];

  const handleApplyCustom = () => {
    if (startInput || endInput) {
      onChange('custom', startInput, endInput);
    } else {
      onChange('all');
    }
    setShowCustomModal(false);
  };

  const handleClearCustom = () => {
    setStartInput('');
    setEndInput('');
    onChange('all');
    setShowCustomModal(false);
  };

  return (
    <div className={`relative flex items-center gap-1.5 flex-wrap ${className}`}>
      <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 text-xs font-semibold shadow-2xs">
        <div className="flex items-center gap-1.5 px-2 text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="hidden sm:inline text-[11px] font-medium text-gray-400">Date Range:</span>
        </div>

        {filterOptions.map(opt => {
          const isActive = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => {
                onChange(opt.id);
                setShowCustomModal(false);
              }}
              className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          );
        })}

        {showCustomOption && (
          <button
            onClick={() => setShowCustomModal(!showCustomModal)}
            className={`px-3 py-1 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              value === 'custom'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <span>Custom</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Active Range Helper Badge */}
      <span className="text-[11px] font-medium text-gray-500 bg-gray-100/80 px-2 py-1 rounded-lg border border-gray-200/60 hidden md:inline-flex items-center gap-1">
        {getDateRangeLabel(value, customStartDate, customEndDate)}
      </span>

      {/* Custom Date Range Popover */}
      {showCustomModal && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-white p-4 rounded-xl border border-gray-200 shadow-xl w-72 space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h4 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Select Custom Range
            </h4>
            <button
              onClick={() => setShowCustomModal(false)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startInput}
                onChange={e => setStartInput(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endInput}
                onChange={e => setEndInput(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 gap-2">
            <button
              onClick={handleClearCustom}
              className="px-2.5 py-1 text-xs text-gray-500 hover:text-gray-700 font-semibold cursor-pointer"
            >
              Reset
            </button>
            <button
              onClick={handleApplyCustom}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Check className="w-3 h-3" />
              Apply Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
