import { useState } from 'react';
import { CheckCircle2, Circle, HelpCircle, Volume2 } from 'lucide-react';
import { loadWorkflowProgress, saveWorkflowProgress } from '../data/workflowProgress';

type SectionAction = {
  label: string;
  onClick?: () => void;
  scrollTo?: string;
  tone?: 'primary' | 'soft';
};

interface SectionActionStripProps {
  title?: string;
  steps: string[];
  actions?: SectionAction[];
  helpText: string;
  emptyText?: string;
  isEmpty?: boolean;
  progressKey?: string;
  reminderText?: string;
  canMarkDone?: boolean;
  blockedDoneText?: string;
}

function readAloud(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const speech = new SpeechSynthesisUtterance(text);
  speech.rate = 0.88;
  speech.lang = 'en-US';
  window.speechSynthesis.speak(speech);
}

export default function SectionActionStrip({
  title = 'Start here',
  steps,
  actions = [],
  helpText,
  emptyText,
  isEmpty = false,
  progressKey,
  reminderText,
  canMarkDone = true,
  blockedDoneText = 'Save the real record first, then mark this done.',
}: SectionActionStripProps) {
  const [doneSteps, setDoneSteps] = useState<number[]>(() => {
    if (!progressKey || typeof localStorage === 'undefined') return [];
    try {
      const saved = loadWorkflowProgress(progressKey);
      return Array.isArray(saved.doneSteps) ? saved.doneSteps : [];
    } catch {
      return [];
    }
  });
  const [completed, setCompleted] = useState(() => {
    if (!progressKey || typeof localStorage === 'undefined') return false;
    try {
      return Boolean(loadWorkflowProgress(progressKey).completed);
    } catch {
      return false;
    }
  });
  const [roleError, setRoleError] = useState('');

  const saveProgress = (nextDoneSteps: number[], nextCompleted = completed) => {
    if (!progressKey) return;
    const result = saveWorkflowProgress(progressKey, { doneSteps: nextDoneSteps, completed: nextCompleted }, 'section action strip');
    if (!result.ok) {
      setRoleError(result.reason || 'This role cannot update this workflow.');
      return;
    }
    setRoleError('');
  };

  const toggleStep = (index: number) => {
    if (!progressKey) return;
    const next = doneSteps.includes(index) ? doneSteps.filter(item => item !== index) : [...doneSteps, index];
    const nextCompleted = next.length >= Math.min(steps.length, 3);
    setDoneSteps(next);
    setCompleted(nextCompleted);
    saveProgress(next, nextCompleted);
  };

  const markDone = () => {
    if (!canMarkDone) {
      setRoleError(blockedDoneText);
      return;
    }
    const next = steps.slice(0, 3).map((_, index) => index);
    setDoneSteps(next);
    setCompleted(true);
    saveProgress(next, true);
  };

  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-blue-700">{title}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {steps.slice(0, 3).map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => toggleStep(index)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-xs font-black transition ${
                  doneSteps.includes(index) ? 'border-emerald-200 bg-emerald-50 text-emerald-950' : 'border-blue-100 bg-white text-slate-800'
                }`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white ${doneSteps.includes(index) ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                  {doneSteps.includes(index) ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                </span>
                <span>{step}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => readAloud(helpText)}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800 transition hover:bg-emerald-100"
        >
          <Volume2 className="h-4 w-4" />
          Need help?
        </button>
      </div>

      {actions.length > 0 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {actions.map((action, index) => (
            <button
              key={action.label}
              type="button"
              data-scroll-to={action.scrollTo}
              onClick={action.onClick}
              className={`min-h-10 shrink-0 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-95 ${
                action.tone === 'primary' || index === 0
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              {action.label}
            </button>
          ))}
          {progressKey && (
            <button
              type="button"
              onClick={markDone}
              className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-black transition active:scale-95 ${
                completed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              {completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              {completed ? 'Done' : 'Mark done'}
            </button>
          )}
        </div>
      )}

      {progressKey && reminderText && !completed && (
        <div className="mt-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-bold leading-relaxed text-rose-950">
          Reminder: {reminderText}
        </div>
      )}

      {roleError && (
        <div className="mt-3 rounded-xl border border-rose-200 bg-white p-3 text-xs font-black text-rose-700">
          {roleError}
        </div>
      )}

      {isEmpty && emptyText && (
        <div className="mt-3 flex gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-bold leading-relaxed text-amber-950">
          <HelpCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{emptyText}</span>
        </div>
      )}
    </div>
  );
}
