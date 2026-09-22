import { useNavigate } from 'react-router-dom';

function ResultCard({ title, value, colorClass }) {
  return (
    <div className={`rounded-xl border-2 p-4 text-center ${colorClass.border}`}>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${colorClass.text}`}>{value}</p>
    </div>
  );
}

const THEME_BY_SCORE = (percent) => {
  if (percent >= 90) return { message: "Outstanding! You're a master!", color: 'text-warning', border: 'border-warning' };
  if (percent >= 70) return { message: 'Great job! You know your stuff!', color: 'text-success', border: 'border-success' };
  if (percent >= 50) return { message: 'Good effort. Keep practicing!', color: 'text-primary', border: 'border-primary' };
  return { message: 'Keep learning and try again!', color: 'text-warning', border: 'border-warning' };
};

export default function ResultsModal({ result, totalScore, reviewAnswers, onReview, onClose }) {
  const navigate = useNavigate();
  const percent = result.percentageScore;
  const theme = THEME_BY_SCORE(percent);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl">
        <h2 className={`mb-6 text-center font-display text-2xl font-bold ${theme.color}`}>{theme.message}</h2>

        <div className="mb-6 grid grid-cols-2 gap-4">
          <ResultCard
            title="Total Score"
            value={`${totalScore} pts`}
            colorClass={{ text: 'text-success', border: 'border-success' }}
          />
          <ResultCard
            title="Correct Answers"
            value={`${result.correctAnswers} / ${result.totalQuestions}`}
            colorClass={{ text: 'text-primary', border: 'border-primary' }}
          />
          <ResultCard
            title="Percentage"
            value={`${percent.toFixed(1)}%`}
            colorClass={{ text: theme.color, border: theme.border }}
          />
          <ResultCard
            title="Time Taken"
            value={`${result.timeTakenSeconds}s`}
            colorClass={{ text: 'text-warning', border: 'border-warning' }}
          />
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white transition hover:bg-primary-dark"
          >
            New Quiz
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-lg border-2 border-primary px-5 py-2.5 font-semibold text-primary transition hover:bg-primary-light/20"
          >
            View Dashboard
          </button>
          <button
            onClick={onReview}
            disabled={!reviewAnswers}
            className="rounded-lg bg-success px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Review
          </button>
          <button
            onClick={onClose}
            className="rounded-lg bg-danger px-5 py-2.5 font-semibold text-white transition hover:bg-red-600"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
