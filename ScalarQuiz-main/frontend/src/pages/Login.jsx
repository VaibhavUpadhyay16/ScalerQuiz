import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser, getDomains, updatePreferences } from '../api/api.js';
import { useQuizContext } from '../context/QuizContext.jsx';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const THEMES = ['Light', 'Dark', 'Blue', 'Green'];
const ROLES = ['User', 'Admin'];

export default function Login() {
  const navigate = useNavigate();
  const { profile, setProfile, setDomain, setDifficulty, logout } = useQuizContext();

  const [isLogin, setIsLogin] = useState(true); // true = login, false = signup

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');

  // Quiz Settings
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium');
  const [selectedTheme, setSelectedTheme] = useState('Light');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getDomains()
      .then((list) => {
        setDomains(list);
        setSelectedDomain(list[0] || '');
      })
      .catch(() => setError('Could not load quiz domains from the server.'));
  }, []);

  const handleModeChange = (mode) => {
    setIsLogin(mode);
    setError('');
  };

  const startQuiz = async () => {
    setError('');

    if (!profile) {
      if (!email || !password) {
        setError('Please provide email and password.');
        return;
      }
      if (!isLogin && !name) {
        setError('Please provide your name.');
        return;
      }
    }

    if (!selectedDomain) {
      setError('Please select a domain.');
      return;
    }

    try {
      setLoading(true);

      let currentProfile = profile;
      if (!currentProfile) {
        if (isLogin) {
          currentProfile = await loginUser({ email, password });
        } else {
          currentProfile = await registerUser({ name, email, password, role });
        }
        if (currentProfile.token) {
          localStorage.setItem('token', currentProfile.token);
        }
        setProfile({ ...currentProfile, preferredDifficulty: selectedDifficulty, preferredTheme: selectedTheme });
      }

      await updatePreferences(currentProfile.username, {
        preferredDifficulty: selectedDifficulty,
        preferredTheme: selectedTheme
      });

      setDomain(selectedDomain);
      setDifficulty(selectedDifficulty);

      navigate('/rules');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewStatistics = async () => {
    setError('');

    if (!profile) {
      setError('Please sign in to view your statistics.');
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-app-gradient px-4 py-10">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-6 rounded-2xl bg-header-gradient px-8 py-6 text-center shadow-lg">
          <h1 className="font-display text-3xl font-bold text-white">Test Your Knowledge</h1>
          <div className="mt-2 space-y-0.5 text-sm text-white/90">
            <p>ScalarQuiz AI Based Quiz & CodeReviewer</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl md:p-8">
          {error && (
            <div className="mb-4 rounded-lg border border-danger bg-red-50 px-4 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          {/* User Profile section */}
          <section className="mb-6 rounded-xl border-2 border-primary-light p-5">
            <h2 className="mb-4 font-display text-base font-bold text-primary"> Authentication</h2>

            {profile ? (
              <div className="text-center">
                <p className="mb-4 text-ink">Welcome back, <strong>{profile.name}</strong>!</p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => navigate('/problems/1')}
                    className="rounded-lg bg-indigo-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-indigo-600"
                  >
                    Code Platform
                  </button>
                  <button
                    onClick={logout}
                    className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-white shadow transition hover:bg-red-600"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4 flex gap-6">
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input
                      type="radio"
                      name="authMode"
                      checked={isLogin}
                      onChange={() => handleModeChange(true)}
                      className="accent-primary"
                    />
                    Sign In
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-ink">
                    <input
                      type="radio"
                      name="authMode"
                      checked={!isLogin}
                      onChange={() => handleModeChange(false)}
                      className="accent-primary"
                    />
                    Sign Up
                  </label>
                </div>

                <div className="space-y-4">
                  {!isLogin && (
                    <div>
                      <label className="mb-1 block text-sm font-bold text-ink">Name:</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                      />
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-bold text-ink">Email:</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-bold text-ink">Password:</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary-light/40"
                    />
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="mb-1 block text-sm font-bold text-ink">Role:</label>
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Quiz Settings section */}
          <section className="mb-6 rounded-xl border-2 border-primary-light p-5">
            <h2 className="mb-4 font-display text-base font-bold text-primary">Quiz Settings</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-ink">Domain:</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {domains.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-ink">Difficulty:</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between gap-4">
                <label className="text-sm font-bold text-ink">Theme:</label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                >
                  {THEMES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={startQuiz}
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-white shadow transition hover:bg-primary-dark disabled:opacity-60"
            >
               {loading ? 'Processing...' : 'Start Quiz'}
            </button>
            <button
              onClick={() => navigate('/problems/1')}
              className="rounded-lg bg-indigo-500 px-6 py-3 font-semibold text-white shadow transition hover:bg-indigo-600"
            >
              💻 Code Platform
            </button>
            <button
              onClick={viewStatistics}
              className="rounded-lg bg-success px-6 py-3 font-semibold text-white shadow transition hover:bg-emerald-600"
            >
              View Statistics
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
