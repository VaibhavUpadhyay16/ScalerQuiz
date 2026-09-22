import { useState } from 'react';
import Modal from './Modal.jsx';

export default function ReviewModal({ questions, showExplanations, onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const question = questions[activeIndex];

  return (
    <Modal title="Review Your Answers" onClose={onClose} maxWidth="max-w-3xl">
      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {questions.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
              idx === activeIndex ? 'bg-primary text-white' : 'bg-surface text-ink hover:bg-primary-light/20'
            }`}
          >
            Q{idx + 1}
          </button>
        ))}
      </div>

      {/* Active question detail */}
      <div>
        <p className="mb-4 text-base font-medium text-ink">
          <span className="font-bold">Q{activeIndex + 1}:</span> {question.text}
        </p>

        <div className="space-y-2">
          {question.options.map((option, i) => {
            const isCorrectOption = i === question.correctOptionIndex;
            return (
              <div
                key={i}
                className={`flex items-center gap-2 rounded-lg border-2 px-4 py-2 text-sm ${
                  isCorrectOption ? 'border-success bg-emerald-50 text-ink' : 'border-surface text-ink'
                }`}
              >
                {isCorrectOption && <span className="font-bold text-success">✓</span>}
                <span>
                  {String.fromCharCode(65 + i)}. {option}
                </span>
              </div>
            );
          })}
        </div>

        {showExplanations && question.explanation && (
          <div className="mt-4 rounded-lg border-2 border-warning bg-yellow-50 p-4 text-sm text-ink">
            <span className="font-bold">Explanation:</span> {question.explanation}
          </div>
        )}
      </div>
    </Modal>
  );
}
