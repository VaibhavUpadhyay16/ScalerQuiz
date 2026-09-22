import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QuizProvider } from './context/QuizContext.jsx';
import Login from './pages/Login.jsx';
import Rules from './pages/Rules.jsx';
import Quiz from './pages/Quiz.jsx';
import Workspace from './pages/Workspace.jsx';
import Dashboard from './pages/Dashboard.jsx';

/**
 * Equivalent to QuizApplication.java's main() launching the Login screen.
 * Login -> Rules -> Quiz mirrors the original screen navigation flow.
 */
export default function App() {
  return (
    <QuizProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/problems/:id" element={<Workspace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </QuizProvider>
  );
}
