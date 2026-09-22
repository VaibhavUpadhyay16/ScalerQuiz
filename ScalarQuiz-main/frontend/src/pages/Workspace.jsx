import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CodeEditor from '../components/workspace/CodeEditor.jsx';
import CodeAnalysisPanel from '../components/workspace/CodeAnalysisPanel.jsx';
import LanguageSelector from '../components/workspace/LanguageSelector.jsx';
import ThemeToggle from '../components/workspace/ThemeToggle.jsx';
import ActionButtons from '../components/workspace/ActionButtons.jsx';
import { problemService } from '../api/problemService.js';
import { codeService } from '../api/codeService.js';
import { RotateCcw, ChevronLeft } from 'lucide-react';

export default function Workspace() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('dark');
  const [code, setCode] = useState('');
  
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Fetch problem details
    problemService.getProblemById(id)
      .then(data => {
        setProblem(data);
        // Load starter code for the selected language if available
        if (data.starterCode && data.starterCode[language]) {
          setCode(data.starterCode[language]);
        }
      })
      .catch(err => {
        console.error(err);
        // Fallback for testing UI without a seeded DB
        setProblem({
          description: 'Analyze the submitted code according to the problem supplied by the application.',
          
          constraints: []
          });
      });
  }, [id]);

  const handleReset = () => {
    if (problem?.starterCode?.[language]) {
      setCode(problem.starterCode[language]);
    } else {
      setCode('');
    }
  };

  const handleSubmit = async () => {
    if (!code.trim() || !problem) {
      setAnalysisError('Write some code before submitting.');
      return;
    }

    setAiAnalysis(null);
    setAnalysisError(null);
    setIsSubmitting(true);
    setShowReview(true);

    try {
      const problemStatement = problem.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      const constraints = Array.isArray(problem.constraints) ? problem.constraints.join('\n') : '';
      const analysis = await codeService.submitCode(problemStatement, constraints, language, code);
      setAiAnalysis(analysis);
    } catch (error) {
      setAnalysisError(error.message || 'AI analysis is temporarily unavailable.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = () => {
    setShowReview(true);
  };

  return (
    <div className={`h-screen w-full flex flex-col overflow-hidden ${theme === 'dark' ? 'dark bg-[#1e1e1e]' : 'bg-slate-50'}`}>
      {/* Top Navbar */}
      <nav className="h-14 bg-white dark:bg-[#1e1e1e] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors">
            <ChevronLeft size={20} />
          </Link>
          <div className="font-display font-bold text-lg text-slate-800 dark:text-white">
            Code Platform
          </div>
        </div>
        <ActionButtons
          onSubmit={handleSubmit}
          onReview={handleReview}
          isSubmitting={isSubmitting}
          hasAnalysis={Boolean(aiAnalysis)}
        />
        <div className="w-24 flex justify-end text-sm text-slate-500 dark:text-slate-400">
          User Info
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Code Editor and optional AI review */}
        <div className="w-full h-full flex flex-col bg-white dark:bg-[#1e1e1e]">
          
          {/* Editor Header Toolbar */}
          <div className="h-12 bg-slate-50 dark:bg-[#252526] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
            <LanguageSelector language={language} setLanguage={setLanguage} />
            <div className="flex items-center gap-3">
              <button onClick={handleReset} title="Reset to default code" className="p-1.5 rounded text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <RotateCcw size={14} />
              </button>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
          </div>

          {/* Editor */}
          <div className={`${showReview ? 'h-1/2' : 'flex-1'} overflow-hidden relative`}>
            <CodeEditor code={code} setCode={setCode} language={language} theme={theme} />
          </div>

          {showReview && (
            <CodeAnalysisPanel analysis={aiAnalysis} isSubmitting={isSubmitting} error={analysisError} />
          )}
        
        </div>
      </div>
    </div>
  );
}
