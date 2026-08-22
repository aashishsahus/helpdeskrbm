import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw, Home, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('HelpDesk Critical Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      sessionStorage.clear();
      // Only clear cache keys that could contain corrupted transient data, keep auth if possible
      localStorage.removeItem('hd_active_view');
      localStorage.removeItem('hd_selected_ticket');
    } catch (e) {}
    window.location.reload();
  };

  private handleHardReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#0F172A] text-gray-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-[#1E293B] border border-red-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <span className="text-[11px] font-bold font-mono uppercase tracking-widest text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-800/50">
                  System Recovery Mode
                </span>
                <h1 className="text-xl font-extrabold text-white mt-1">
                  Help Desk Safe Mode Active
                </h1>
                <p className="text-xs text-gray-400">
                  A client-side render exception occurred. The safety boundary prevented the application from displaying a blank screen.
                </p>
              </div>
            </div>

            {this.state.error && (
              <div className="bg-black/40 border border-gray-800 rounded-xl p-4 text-xs font-mono text-red-300 space-y-2 overflow-x-auto">
                <p className="font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{this.state.error.name}: {this.state.error.message}</span>
                </p>
                {this.state.errorInfo?.componentStack && (
                  <details className="mt-2 text-[10px] text-gray-500 cursor-pointer">
                    <summary className="hover:text-gray-300">View Component Stack Trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap text-gray-400 max-h-40 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetCache}
                className="px-4 py-2.5 bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset View Cache</span>
              </button>
            </div>

            <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-500">
              <span>Rathi Buildmart IT Help Desk v2.5</span>
              <button
                onClick={this.handleHardReset}
                className="text-red-400/80 hover:text-red-300 underline text-[10px]"
              >
                Clear all local cache and restart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
