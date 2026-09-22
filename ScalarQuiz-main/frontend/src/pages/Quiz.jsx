import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizContext } from '../context/QuizContext.jsx';
import { submitQuizResult } from '../api/api.js';
import ExplanationModal from '../components/ExplanationModal.jsx';
import ResultsModal from '../components/ResultsModal.jsx';
import ReviewModal from '../components/ReviewModal.jsx';

// Equivalent to the point values in Quiz.selectAnswer()
const POINTS_BY_DIFFICULTY = { Easy: 10, Medium: 20, Hard: 30 };

export default function Quiz() {
  const navigate = useNavigate();
  const { profile, domain, difficulty, quizConfig, questions, questionsLoading } = useQuizContext();

  // Guard against landing here directly without going through Login/Rules
  useEffect(() => {
    if (!profile || !domain || !quizConfig || questions.length === 0) {
      navigate('/', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { questionCount, timePerQuestion, reviewAnswers, showExplanations } = quizConfig || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(timePerQuestion || 30);
  const [explanationModal, setExplanationModal] = useState(null); // { isCorrect, explanation }
  const [result, setResult] = useState(null); // finished quiz result
  const [showReview, setShowReview] = useState(false);
  const [waitingForQuestion, setWaitingForQuestion] = useState(false);

  const startTimeRef = useRef(Date.now());
  const questionStartRef = useRef(Date.now());
  const timerRef = useRef(null);

  const currentQuestion = questions[currentIndex];

  // Equivalent to Quiz.startQuestionTimer()
  useEffect(() => {
    if (!currentQuestion || result) return;

    setTimeRemaining(timePerQuestion);
    setSelectedIndex(null);
    setAnswered(false);
    questionStartRef.current = Date.now();

    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, result]);

  useEffect(() => {
    if (waitingForQuestion && currentIndex + 1 < questions.length) {
      setWaitingForQuestion(false);
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, questions.length, waitingForQuestion]);

  // Equivalent to Quiz.timeUp()
  const handleTimeUp = () => {
    setAnswered(true);
  };

  // Equivalent to Quiz.selectAnswer()
  const selectAnswer = (optionIndex) => {
    if (answered) return;
    clearInterval(timerRef.current);

    const timeTakenMs = Date.now() - questionStartRef.current;
    const isCorrect = optionIndex === currentQuestion.correctOptionIndex;

    setSelectedIndex(optionIndex);
    setAnswered(true);

    let questionScore = 0;
    if (isCorrect) {
      setCorrectCount((prev) => prev + 1);
      questionScore = POINTS_BY_DIFFICULTY[difficulty] || 10;
      if (timeTakenMs < (timePerQuestion * 1000) / 2) {
        questionScore = Math.round(questionScore * 1.5);
      }
      setTotalScore((prev) => prev + questionScore);
    }

    if (showExplanations && currentQuestion.explanation) {
      setExplanationModal({ isCorrect, explanation: currentQuestion.explanation });
    }
  };

  // Equivalent to Quiz.nextQuestion()
  const nextQuestion = () => {
    setExplanationModal(null);
    if (currentIndex + 1 < questionCount && currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else if (currentIndex + 1 < questionCount && questionsLoading) {
      setWaitingForQuestion(true);
    } else {
      finishQuiz();
    }
  };

  // Equivalent to Quiz.finishQuiz()
  const finishQuiz = async () => {
    const totalTimeTakenSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    const finalResult = {
      domain,
      difficulty,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      timeTakenSeconds: totalTimeTakenSeconds
    };

    try {
      await submitQuizResult({ username: profile.username, ...finalResult, totalScore });
    } catch (err) {
      console.error('Failed to save quiz result:', err.message);
    }

    setResult({ ...finalResult, percentageScore: (correctCount / questions.length) * 100 });
  };

  const confirmExit = () => {
    const confirmed = window.confirm('Are you sure you want to quit?\nYour progress will be lost.');
    if (confirmed) navigate('/');
  };

  if (!currentQuestion && !result) return null;

  const timerColor = timeRemaining <= 5 ? 'text-danger border-danger' : timeRemaining <= 10 ? 'text-warning border-warning' : 'text-success border-success';

  return (
    <div className="min-h-screen bg-surface px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header stats */}
        {!result && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h1 className="font-display text-xl font-bold text-ink">
                {domain} <span className="font-normal text-muted">({difficulty})</span>
              </h1>
              <button onClick={confirmExit} className="text-sm font-semibold text-danger hover:underline">
                Exit Quiz
              </button>
            </div>

            <div className="mb-2 h-6 w-full overflow-hidden rounded-full bg-white shadow-inner">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentIndex + 1) / questionCount) * 100}%` }}
              />
            </div>
            <p className="mb-6 text-center text-xs font-semibold text-muted">
              Progress: {currentIndex + 1} / {questionCount}
            </p>

            <div className="mb-6 grid grid-cols-3 gap-4">
              <StatCard label="Question" value={`${currentIndex + 1} of ${questionCount}`} colorClass="border-primary text-primary" />
              <StatCard label="Score" value={totalScore} colorClass="border-success text-success" />
              <StatCard label="Time" value={`${timeRemaining}s`} colorClass={timerColor} />
            </div>

            {/* Question card */}
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 shadow-lg md:p-8">
              <p className="mb-6 font-display text-lg font-semibold text-ink">{currentQuestion.text}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedIndex === i;
                  const isCorrectOption = i === currentQuestion.correctOptionIndex;

                  let styles = 'border-primary-light bg-primary-light text-white hover:bg-primary';
                  if (answered) {
                    if (isSelected && isCorrectOption) styles = 'border-success bg-success text-white';
                    else if (isSelected && !isCorrectOption) styles = 'border-danger bg-danger text-white';
                    else if (reviewAnswers && isCorrectOption) styles = 'border-success bg-success text-white';
                    else styles = 'border-slate-200 bg-slate-100 text-slate-400';
                  }

                  return (
                    <button
                      key={i}
                      disabled={answered}
                      onClick={() => selectAnswer(i)}
                      className={`w-full rounded-xl border-2 px-5 py-3.5 text-left text-sm font-medium transition ${styles}`}
                    >
                      {String.fromCharCode(65 + i)}. {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={nextQuestion}
                disabled={!answered || waitingForQuestion}
                className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
              >
                {waitingForQuestion ? 'Loading next question...' : 'Next Question'}
              </button>
            </div>
          </>
        )}
      </div>

      {explanationModal && (
        <ExplanationModal
          isCorrect={explanationModal.isCorrect}
          explanation={explanationModal.explanation}
          onContinue={() => setExplanationModal(null)}
        />
      )}

      {result && !showReview && (
        <ResultsModal
          result={result}
          totalScore={totalScore}
          reviewAnswers={reviewAnswers}
          onReview={() => setShowReview(true)}
          onClose={() => navigate('/')}
        />
      )}

      {result && showReview && (
        <ReviewModal
          questions={questions}
          showExplanations={showExplanations}
          onClose={() => setShowReview(false)}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, colorClass }) {
  return (
    <div className={`rounded-xl border-2 bg-white p-4 text-center shadow ${colorClass}`}>
      <p className="text-xs font-bold text-ink">{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
