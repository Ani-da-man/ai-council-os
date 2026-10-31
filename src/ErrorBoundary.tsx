import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AI Council OS] Uncaught render error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleResetState = () => {
    try {
      localStorage.removeItem('COUNCIL_STAGE');
      localStorage.removeItem('COUNCIL_FOUNDER_PROFILE');
      localStorage.removeItem('COUNCIL_EVAL_SHEET');
    } catch (e) {
      console.warn(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#060810] text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900/90 border border-red-500/40 rounded-2xl p-6 space-y-4 shadow-2xl backdrop-blur-xl text-center">
            <div className="w-12 h-12 rounded-xl bg-red-950/70 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <h2 className="text-xl font-black text-white">Chamber Recovery Mode</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              An unexpected interface anomaly was intercepted. Your session data has been safeguarded.
            </p>
            {this.state.error && (
              <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-lg text-left text-[11px] font-mono text-red-300 max-h-32 overflow-y-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-1.5 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                onClick={this.handleResetState}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Session</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
