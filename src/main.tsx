import {StrictMode} from 'react';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || 'Unknown error' };
  }

  componentDidCatch(error: Error) {
    try {
      localStorage.setItem('educore_root_error', JSON.stringify({
        message: error.message,
        stack: error.stack,
        when: new Date().toISOString()
      }));
    } catch {
      // Keep recovery screen safe even if storage is unavailable.
    }
  }

  private resetPortal = () => {
    try {
      localStorage.removeItem('educore_portal_session');
      localStorage.removeItem('educore_tour_completed');
    } catch {
      // Ignore storage cleanup failures.
    }
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-100 p-4 flex items-center justify-center font-sans text-slate-900">
        <div className="w-full max-w-md border border-rose-200 bg-white p-5 shadow-xl">
          <p className="text-xs font-black uppercase tracking-wide text-rose-600">Portal recovered</p>
          <h1 className="mt-2 text-xl font-black">The page had a problem, but it is not lost.</h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
            Press the button below to reopen the login page. This also clears any old saved session that may be causing a blank screen.
          </p>
          <button
            type="button"
            onClick={this.resetPortal}
            className="mt-5 w-full bg-blue-600 px-4 py-3 text-sm font-black text-white"
          >
            Reopen Login Page
          </button>
        </div>
      </div>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);
