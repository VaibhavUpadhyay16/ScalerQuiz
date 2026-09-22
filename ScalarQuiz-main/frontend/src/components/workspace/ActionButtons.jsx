import React from 'react';
import { FileText, Send } from 'lucide-react';

export default function ActionButtons({ onSubmit, onReview, isSubmitting, hasAnalysis }) {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onReview}
        disabled={isSubmitting || !hasAnalysis}
        className="flex items-center gap-2 px-4 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded font-medium text-sm transition-colors disabled:opacity-50"
      >
        <FileText size={14} />
        Review
      </button>
      <button
        onClick={onSubmit}
        disabled={isSubmitting}
        className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded font-medium text-sm transition-colors disabled:opacity-50"
      >
        <Send size={14} />
        {isSubmitting ? 'Analyzing...' : 'Submit'}
      </button>
    </div>
  );
}
