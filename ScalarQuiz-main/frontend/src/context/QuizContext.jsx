import { createContext, useContext, useState, useEffect } from 'react';
import { getMe, logoutUser } from '../api/api.js';

const QuizContext = createContext(null);

export function QuizProvider({ children }) {
  const [profile, setProfile] = useState(null); // UserProfile equivalent
  const [domain, setDomain] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [quizConfig, setQuizConfig] = useState(null); // { questionCount, timePerQuestion, reviewAnswers, showExplanations, soundEffects }
  const [questions, setQuestions] = useState([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const user = await getMe();
          setProfile(user);
        } catch (err) {
          localStorage.removeItem('token');
          setProfile(null);
        }
      }
      setLoadingAuth(false);
    };
    checkAuth();

    const handleAuthError = () => {
      setProfile(null);
      localStorage.removeItem('token');
      window.location.hash = '/';
    };

    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const logout = async () => {
    try {
      await logoutUser();
    } catch (e) {}
    setProfile(null);
    localStorage.removeItem('token');
    window.location.hash = '/';
  };

  const value = {
    profile,
    setProfile,
    domain,
    setDomain,
    difficulty,
    setDifficulty,
    quizConfig,
    setQuizConfig,
    questions,
    setQuestions,
    questionsLoading,
    setQuestionsLoading,
    logout
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-app-gradient flex items-center justify-center">
        <div className="text-white font-display text-xl">Loading...</div>
      </div>
    );
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>;
}

export function useQuizContext() {
  const ctx = useContext(QuizContext);
  if (!ctx) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return ctx;
}
