import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCw, CheckCircle2, CloudDownload } from 'lucide-react';

interface RefreshButtonProps {
  id?: string;
  variant?: 'default' | 'primary' | 'outline' | 'compact' | 'pill' | 'header' | 'banner';
  showTimestamp?: boolean;
  showIconOnlyOnMobile?: boolean;
  label?: string;
  className?: string;
  onRefreshComplete?: (count: number) => void;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  id = 'dashboard-refresh-btn',
  variant = 'default',
  showTimestamp = false,
  showIconOnlyOnMobile = true,
  label = 'Refresh Data',
  className = '',
  onRefreshComplete
}) => {
  const { refreshAllData, isDataRefreshing, lastRefreshedAt } = useApp();
  const [justRefreshed, setJustRefreshed] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDataRefreshing) return;

    try {
      const result = await refreshAllData();
      setJustRefreshed(true);
      if (onRefreshComplete) {
        onRefreshComplete(result.count);
      }
      setTimeout(() => setJustRefreshed(false), 2500);
    } catch {
      // Error handled inside AppContext
    }
  };

  // Base button styles based on variant
  let variantStyles = 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-2xs';

  if (variant === 'primary') {
    variantStyles = 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs border border-blue-700';
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent hover:bg-gray-100/80 text-gray-700 border border-gray-300 shadow-none';
  } else if (variant === 'compact') {
    variantStyles = 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-2xs text-xs p-1.5';
  } else if (variant === 'pill') {
    variantStyles = 'bg-emerald-50 hover:bg-emerald-100 text-[#065F46] border border-emerald-300 shadow-2xs rounded-full font-bold';
  } else if (variant === 'banner') {
    variantStyles = 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xs shadow-xs';
  } else if (variant === 'header') {
    variantStyles = 'bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 shadow-2xs';
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        id={id}
        onClick={handleRefresh}
        disabled={isDataRefreshing}
        title={
          isDataRefreshing
            ? 'Fetching live data from Google Sheet...'
            : lastRefreshedAt
            ? `Force refresh data from Google Sheet (Last updated: ${lastRefreshedAt})`
            : 'Force refresh data from Google Sheet'
        }
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed select-none active:scale-95 ${variantStyles} ${className}`}
      >
        {justRefreshed ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 animate-bounce" />
        ) : (
          <RotateCw
            className={`w-3.5 h-3.5 shrink-0 ${
              isDataRefreshing ? 'animate-spin text-blue-600' : 'text-gray-500 group-hover:text-gray-700'
            }`}
          />
        )}

        <span className={showIconOnlyOnMobile ? 'hidden sm:inline font-medium' : 'font-medium'}>
          {isDataRefreshing ? 'Refreshing...' : justRefreshed ? 'Updated!' : label}
        </span>

        {showTimestamp && lastRefreshedAt && !isDataRefreshing && (
          <span className="hidden md:inline-block text-[10px] text-gray-400 font-mono ml-0.5 border-l border-gray-200 pl-1.5">
            {lastRefreshedAt}
          </span>
        )}
      </button>

      {showTimestamp && !lastRefreshedAt && (
        <span className="text-[11px] text-gray-400 font-normal hidden lg:inline">
          Live Sync Active
        </span>
      )}
    </div>
  );
};
