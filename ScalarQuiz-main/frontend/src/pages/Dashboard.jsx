import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Code2, Medal, Trophy } from 'lucide-react';
import { getUserStats } from '../api/api.js';
import { useQuizContext } from '../context/QuizContext.jsx';

const formatDate = (value) => new Date(value).toLocaleString([], {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const percent = (attempt) => attempt.totalQuestions > 0
  ? (attempt.correctAnswers / attempt.totalQuestions) * 100
  : 0;

function Metric({ label, value, icon: Icon, tone }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={19} />
      </div>
      <p className="text-sm font-medium text-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Icon size={19} className="text-primary" />
        <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useQuizContext();
  const [stats, setStats] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) {
      navigate('/', { replace: true });
      return;
    }

    getUserStats(profile.username)
      .then(setStats)
      .catch((err) => setError(err.message || 'Could not load your statistics.'))
      .finally(() => setLoading(false));
  }, [navigate, profile]);

  if (!profile || loading) {
    return <div className="flex min-h-screen items-center justify-center bg-surface font-display text-lg text-muted">Loading your progress...</div>;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <p className="mb-5 text-danger">{error}</p>
          <button onClick={() => navigate('/')} className="rounded-lg bg-primary px-5 py-2.5 font-semibold text-white">Back to home</button>
        </div>
      </div>
    );
  }

  const latestQuiz = stats.latestQuiz;
  const reviews = stats.codeReviewHistory || [];
  const attempts = stats.quizHistory || [];
  const domains = Object.entries(stats.domainAverages || {});

  return (
    <div className="min-h-screen bg-surface px-4 py-8 md:px-8">
      <main className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <button onClick={() => navigate('/')} className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted hover:text-primary">
              <ArrowLeft size={16} /> Back to home
            </button>
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Progress dashboard</p>
            <h1 className="mt-1 font-display text-3xl font-bold text-ink">Welcome back, {stats.name || stats.username}</h1>
            <p className="mt-1 text-sm text-muted">Your quiz results and code review history in one place.</p>
          </div>
          <button onClick={() => navigate('/rules')} className="rounded-lg bg-primary px-5 py-3 font-semibold text-white shadow-sm hover:bg-primary-dark">Start a quiz</button>
        </header>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Metric label="Quizzes completed" value={stats.totalQuizzesTaken} icon={BookOpen} tone="bg-primary-light/20 text-primary" />
          <Metric label="Achievement points" value={stats.achievementPoints} icon={Trophy} tone="bg-amber-100 text-amber-700" />
          <Metric label="Badges earned" value={stats.earnedBadges.length} icon={Medal} tone="bg-emerald-100 text-emerald-700" />
          <Metric label="Code reviews" value={reviews.length} icon={Code2} tone="bg-indigo-100 text-indigo-700" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Section title="Latest quiz attempt" icon={BookOpen}>
            {latestQuiz ? (
              <div>
                <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-bold text-ink">{latestQuiz.domain}</p>
                    <p className="text-sm text-muted">{latestQuiz.difficulty} · {formatDate(latestQuiz.completionDate)}</p>
                  </div>
                  <p className="font-display text-3xl font-bold text-primary">{percent(latestQuiz).toFixed(1)}%</p>
                </div>
                <div className="mb-4 h-3 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${percent(latestQuiz)}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted">Correct</p><p className="mt-1 font-bold text-ink">{latestQuiz.correctAnswers}/{latestQuiz.totalQuestions}</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted">Score</p><p className="mt-1 font-bold text-ink">{latestQuiz.totalScore} pts</p></div>
                  <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-muted">Time</p><p className="mt-1 font-bold text-ink">{latestQuiz.timeTakenSeconds}s</p></div>
                </div>
              </div>
            ) : <p className="text-sm text-muted">No quiz attempts yet. Start your first quiz to see results here.</p>}
          </Section>

          <Section title="Performance by domain" icon={Trophy}>
            {domains.length ? <div className="space-y-4">{domains.map(([domain, average]) => (
              <div key={domain}>
                <div className="mb-1 flex justify-between text-sm"><span className="font-semibold text-ink">{domain}</span><span className="font-bold text-primary">{average.toFixed(1)}%</span></div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary" style={{ width: `${average}%` }} /></div>
              </div>
            ))}</div> : <p className="text-sm text-muted">Complete a quiz to unlock domain performance.</p>}
          </Section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Section title="Recent quiz attempts" icon={BookOpen}>
            {attempts.length ? <div className="space-y-3">{attempts.map((attempt, index) => (
              <div key={`${attempt.completionDate}-${index}`} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
                <div><p className="font-semibold text-ink">{attempt.domain} <span className="font-normal text-muted">· {attempt.difficulty}</span></p><p className="text-xs text-muted">{formatDate(attempt.completionDate)}</p></div>
                <div className="text-right"><p className="font-bold text-primary">{percent(attempt).toFixed(1)}%</p><p className="text-xs text-muted">{attempt.totalScore} pts</p></div>
              </div>
            ))}</div> : <p className="text-sm text-muted">No attempts recorded yet.</p>}
          </Section>

          <Section title="Saved code reviews" icon={Code2}>
            {reviews.length ? <div className="space-y-3">{reviews.map((review) => (
              <button key={review.id} onClick={() => setSelectedReview(review)} className="w-full rounded-xl bg-slate-50 p-3 text-left transition hover:bg-primary-light/20">
                <div className="flex items-center justify-between gap-3"><p className="truncate text-sm font-semibold text-ink">{review.problem}</p><span className="shrink-0 rounded-full bg-indigo-100 px-2 py-1 text-xs font-bold uppercase text-indigo-700">{review.language}</span></div>
                <p className="mt-1 text-xs text-muted">Reviewed {formatDate(review.submittedAt)} · Quality {review.analysis?.codeQuality?.score ?? '—'}/10</p>
              </button>
            ))}</div> : <p className="text-sm text-muted">Submit code in the Code Platform to save your reviews here.</p>}
          </Section>
        </div>

        {stats.earnedBadges.length > 0 && <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5"><h2 className="mb-3 font-display font-bold text-amber-900">Your badges</h2><div className="flex flex-wrap gap-2">{stats.earnedBadges.map((badge) => <span key={badge} className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-amber-800 shadow-sm">{badge}</span>)}</div></section>}
      </main>

      {selectedReview && <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4" onClick={() => setSelectedReview(null)}>
        <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">{selectedReview.language} review</p><h2 className="mt-1 font-display text-xl font-bold text-ink">{selectedReview.problem}</h2></div><button onClick={() => setSelectedReview(null)} className="text-sm font-semibold text-muted hover:text-ink">Close</button></div>
          <pre className="mb-5 max-h-64 overflow-auto rounded-xl bg-slate-900 p-4 text-xs leading-5 text-slate-100"><code>{selectedReview.code}</code></pre>
          <div className="grid gap-4 md:grid-cols-2"><div><p className="text-xs font-bold uppercase text-muted">Approach</p><p className="mt-1 text-sm text-ink">{selectedReview.analysis?.approach || 'Not available'}</p></div><div><p className="text-xs font-bold uppercase text-muted">Complexity</p><p className="mt-1 text-sm text-ink">Time: {selectedReview.analysis?.timeComplexity || '—'} · Space: {selectedReview.analysis?.spaceComplexity || '—'}</p></div><div className="md:col-span-2"><p className="text-xs font-bold uppercase text-muted">Learning notes</p><p className="mt-1 text-sm text-ink">{selectedReview.analysis?.learningExplanation || 'Not available'}</p></div></div>
        </div>
      </div>}
    </div>
  );
}
