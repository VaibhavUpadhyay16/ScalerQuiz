import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { streamQuestions } from '../api/api.js';
import { useQuizContext } from '../context/QuizContext.jsx';

const DIFFICULTY_ICON = { Easy: '🟢', Medium: '🟡', Hard: '🔴' };

export default function Rules() {
  const navigate = useNavigate();
  const { profile, domain, difficulty, setQuizConfig, setQuestions, setQuestionsLoading } = useQuizContext();

  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [reviewAnswers, setReviewAnswers] = useState(true);
  const [showExplanations, setShowExplanations] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Guard: if someone lands here without going through Login first
  useEffect(() => {
    if (!profile || !domain) {
      navigate('/', { replace: true });
    }
  }, [profile, domain, navigate]);

  if (!profile || !domain) return null;

  // Equivalent to Rules.startQuiz() - fetches AI questions then moves to Quiz screen
  const startQuiz = async () => {
    setError('');
    try {
      setLoading(true);
      setQuestions([]);
      setQuestionsLoading(true);
      setQuizConfig({ questionCount, timePerQuestion, reviewAnswers, showExplanations, soundEffects });
      let receivedQuestions = 0;
      await streamQuestions(domain, difficulty, questionCount, (question) => {
        receivedQuestions += 1;
        setQuestions((currentQuestions) => [...currentQuestions, question]);
        if (receivedQuestions === 1) navigate('/quiz');
      });
      if (receivedQuestions === 0) throw new Error('No questions were generated. Please try again.');
    } catch (err) {
      setError(err.code === 'GEMINI_TIMEOUT'
        ? 'Gemini is taking too long to respond. Please try again after some time.'
        : err.message);
    } finally {
      setQuestionsLoading(false);
      setLoading(false);
    }
  };

  const goBack = () => navigate('/');

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="font-display text-3xl font-bold text-primary">Welcome, {profile.username}! </h1>
          <p className="mt-1 text-ink">Customize your quiz experience before you begin</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-danger bg-red-50 px-4 py-2 text-sm text-danger">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Left column: Info + Rules */}
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-primary bg-white p-6 shadow">
              <h2 className="mb-4 font-display text-lg font-bold text-primary"> Quiz Information</h2>

              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-bold text-ink">Domain:</span>
                <span className="font-bold text-primary">{domain}</span>
              </div>
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="font-bold text-ink">{DIFFICULTY_ICON[difficulty] || ""} Difficulty:</span>
                <span className="font-bold text-primary">{difficulty}</span>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <label className="text-sm font-bold text-ink">Number of Questions:</label>
                <input
                  type="number"
                  min={5}
                  max={30}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Math.min(30, Math.max(5, Number(e.target.value))))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-ink">Time per Question (sec):</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  step={5}
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Math.min(120, Math.max(10, Number(e.target.value))))}
                  className="w-20 rounded-lg border border-slate-300 px-2 py-1 text-center text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-xl border-2 border-success bg-white p-6 shadow">
              <h2 className="mb-3 font-display text-lg font-bold text-success">Quiz Rules</h2>
              <div className="space-y-3 text-sm text-ink">
                <div>
                  <p className="font-bold">SCORING SYSTEM:</p>
                  <p>• Easy Questions: 10 points</p>
                  <p>• Medium Questions: 20 points</p>
                  <p>• Hard Questions: 30 points</p>
                </div>
                <div>
                  <p className="font-bold">SPEED BONUS:</p>
                  <p>Answer within half the time limit to earn a 50% bonus!</p>
                </div>
                <div>
                  <p className="font-bold">ACHIEVEMENTS:</p>
                  <p>• Complete quizzes to earn badges</p>
                  <p>• Perfect scores unlock special achievements</p>
                  <p>• Track your progress across domains</p>
                </div>
                <div>
                  <p className="font-bold">IMPORTANT:</p>
                  <p>• No negative marking for wrong answers</p>
                  <p>• Review explanations to learn</p>
                  <p>• Challenge yourself and have fun!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column: Options + Tips */}
          <div className="space-y-6">
            <div className="rounded-xl border-2 border-warning bg-white p-6 shadow">
              <h2 className="mb-4 font-display text-lg font-bold text-warning">Quiz Options</h2>

              <div className="space-y-4">
                <CheckboxOption
                  label="Review Answers After Quiz"
                  description="See which answers were correct after completing the quiz"
                  checked={reviewAnswers}
                  onChange={setReviewAnswers}
                />
                <CheckboxOption
                  label="Show Explanations"
                  description="Display detailed explanations for each answer"
                  checked={showExplanations}
                  onChange={setShowExplanations}
                />
                <CheckboxOption
                  label="Enable Sound Effects"
                  description="Play sounds for correct/incorrect answers"
                  checked={soundEffects}
                  onChange={setSoundEffects}
                />
              </div>

              <div className="mt-6 rounded-lg border border-warning bg-yellow-50 p-4">
                <p className="mb-2 text-sm font-bold text-yellow-800">Pro Tips</p>
                <div className="space-y-1 text-xs text-yellow-900">
                  <p>• Read questions carefully</p>
                  <p>• Manage your time wisely</p>
                  <p>• Trust your first instinct</p>
                  <p>• Learn from explanations</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={goBack}
            className="rounded-lg bg-slate-400 px-6 py-3 font-semibold text-white shadow transition hover:bg-slate-500"
          >
            ← Back
          </button>
          <button
            onClick={startQuiz}
            disabled={loading}
            className="rounded-lg bg-success px-6 py-3 font-semibold text-white shadow transition hover:bg-emerald-600 disabled:opacity-60"
          >
            {loading ? 'Generating questions...' : 'Start Quiz →'}
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckboxOption({ label, description, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-warning"
      />
      <span>
        <span className="block text-sm font-bold text-ink">{label}</span>
        <span className="block text-xs italic text-muted">{description}</span>
      </span>
    </label>
  );
}
