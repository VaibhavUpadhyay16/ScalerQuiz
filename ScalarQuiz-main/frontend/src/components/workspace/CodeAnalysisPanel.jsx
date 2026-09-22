import React from 'react';

export default function CodeAnalysisPanel({ analysis, isSubmitting, error }) {
  return (
    <div className="flex-1 overflow-y-auto border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e1e1e] p-4 text-sm">
      <div className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">AI Code Analysis</div>

      {isSubmitting && (
        <div className="text-slate-500 dark:text-slate-400">Gemini is analyzing your code...</div>
      )}

      {!isSubmitting && error && (
        <div className="text-amber-600 dark:text-amber-400">{error}</div>
      )}

      {!isSubmitting && !error && !analysis && (
        <div className="text-slate-500 dark:text-slate-400">Submit your code to receive an AI analysis.</div>
      )}

      {!isSubmitting && !error && analysis && (
        <div className="space-y-4 text-slate-700 dark:text-slate-300">
          <section>
            <div className="font-semibold">Approach</div>
            <p>{analysis.approach}</p>
          </section>
          <section>
            <div className="font-semibold">Evidence from your code</div>
            <ul className="list-disc space-y-1 pl-5">
              {analysis.evidence.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          </section>
          <section>
            <div className="font-semibold">Time Complexity: {analysis.timeComplexity}</div>
            <p>{analysis.timeExplanation}</p>
          </section>
          <section>
            <div className="font-semibold">Space Complexity: {analysis.spaceComplexity}</div>
            <p>{analysis.spaceExplanation}</p>
          </section>
          <section>
            <div className="font-semibold">Better Approach</div>
            <p>{analysis.betterApproach.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Trade-offs: {analysis.betterApproach.tradeoffs}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {analysis.betterApproach.timeComplexity} time, {analysis.betterApproach.spaceComplexity} space
            </p>
          </section>
          <section>
            <div className="font-semibold">Code Quality: {analysis.codeQuality.score}/10</div>
            <p>{analysis.codeQuality.summary}</p>
            <div className="mt-1"><span className="font-semibold">Strengths:</span> {analysis.codeQuality.strengths.join(' ')}</div>
            <div className="mt-1"><span className="font-semibold">Improvements:</span> {analysis.codeQuality.improvements.join(' ')}</div>
          </section>
          <section>
            <div className="font-semibold">Learning Explanation</div>
            <p>{analysis.learningExplanation}</p>
          </section>
        </div>
      )}
    </div>
  );
}
