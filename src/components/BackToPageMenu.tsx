import { ArrowUp } from 'lucide-react';

export default function BackToPageMenu({ label = 'Back to page menu' }: { label?: string }) {
  return (
    <button
      type="button"
      data-scroll-to="page-live-content"
      className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
    >
      <ArrowUp className="h-4 w-4" />
      {label}
    </button>
  );
}
