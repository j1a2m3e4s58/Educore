import React from 'react';

interface PageErrorBoundaryProps {
  children: React.ReactNode;
  resetKey: string;
  homeLabel?: string;
  onGoHome: () => void;
  onReload?: () => void;
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class PageErrorBoundary extends React.Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  state: PageErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep a small local audit trail for troubleshooting prototype crashes.
    try {
      const key = 'educore_page_error_log';
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const next = [{
        message: error.message,
        stack: error.stack,
        componentStack: info.componentStack,
        when: new Date().toISOString(),
        page: this.props.resetKey
      }, ...existing].slice(0, 20);
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Never let logging create another crash.
    }
  }

  componentDidUpdate(prevProps: PageErrorBoundaryProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  private reloadPage = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReload) {
      this.props.onReload();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    return (
      <div className="mx-auto my-6 w-full max-w-3xl border border-rose-200 bg-white p-5 shadow-sm">
        <div className="border border-rose-100 bg-rose-50 p-4">
          <p className="text-[11px] font-black uppercase tracking-wider text-rose-700">Page recovered safely</p>
          <h2 className="mt-1 text-lg font-black text-slate-950">This page had a problem, but the portal is still open.</h2>
          <p className="mt-2 text-sm font-semibold text-slate-600">
            You can go back to your dashboard or reload this page. This prevents the whole portal from becoming blank.
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={this.props.onGoHome}
            className="flex-1 bg-[#1A56DB] px-4 py-3 text-sm font-black text-white hover:bg-blue-700"
          >
            Go Back to {this.props.homeLabel || 'Dashboard'}
          </button>
          <button
            type="button"
            onClick={this.reloadPage}
            className="flex-1 border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-800 hover:bg-slate-50"
          >
            Reload Page
          </button>
        </div>

        {isLocal && this.state.error && (
          <details className="mt-4 border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
            <summary className="cursor-pointer font-black text-slate-900">Developer error details</summary>
            <pre className="mt-3 max-h-64 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px]">
              {this.state.error.stack || this.state.error.message}
            </pre>
          </details>
        )}
      </div>
    );
  }
}
