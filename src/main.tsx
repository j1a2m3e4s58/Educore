import {Component, StrictMode, type ErrorInfo, type ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

class AppRecoveryBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorText: string }> {
  state = { hasError: false, errorText: '' };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorText: error?.message || 'Unknown portal error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EduCore recovered from a portal render error', error, errorInfo);
  }

  reopenLogin = () => {
    localStorage.removeItem('educore_portal_session');
    window.location.href = '/';
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="min-h-screen bg-slate-100 px-4 py-16 text-slate-950">
        <section className="mx-auto max-w-lg border border-rose-200 bg-white p-6 shadow-xl">
          <p className="text-xs font-black uppercase tracking-wide text-rose-600">Portal recovered</p>
          <h1 className="mt-3 text-2xl font-black">The page had a problem, but it is not lost.</h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">
            Press the button below to reopen the login page. This clears only the saved login session, not your school records.
          </p>
          <button
            type="button"
            onClick={this.reopenLogin}
            className="mt-6 w-full bg-blue-600 px-4 py-4 text-sm font-black text-white"
          >
            Reopen login page
          </button>
        </section>
      </main>
    );
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRecoveryBoundary>
      <App />
    </AppRecoveryBoundary>
  </StrictMode>,
);
