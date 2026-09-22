export default function ExplanationModal({ isCorrect, explanation, onContinue }) {
  const headerColor = isCorrect ? 'text-success' : 'text-danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <h2 className={`mb-4 text-center font-display text-xl font-bold ${headerColor}`}>
          {isCorrect ? 'Excellent!' : 'Learn from this'}
        </h2>
        <div className="mb-6 max-h-56 overflow-y-auto rounded-lg bg-surface p-4 text-sm leading-relaxed text-ink">
          {explanation}
        </div>
        <div className="flex justify-center">
          <button
            onClick={onContinue}
            className={`rounded-lg px-6 py-2 font-semibold text-white transition ${
              isCorrect ? 'bg-success hover:bg-emerald-600' : 'bg-danger hover:bg-red-600'
            }`}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}
