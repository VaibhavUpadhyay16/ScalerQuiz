import { analyzeCodeWithGemini } from '../services/geminiService.js';
import UserProfile from '../models/UserProfile.js';

const SUPPORTED_LANGUAGES = new Set(['javascript', 'python', 'java', 'cpp', 'c']);
const MAX_CODE_LENGTH = 20000;
const MAX_PROBLEM_LENGTH = 4000;
const MAX_CONSTRAINTS_LENGTH = 4000;

// @desc    Analyze submitted code with Gemini
// @route   POST /api/code/submit
export const submitCode = async (req, res, next) => {
  try {
    const { problem, constraints, language, code } = req.body;
    const normalizedLanguage = typeof language === 'string' ? language.toLowerCase() : '';

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({ message: 'Code is required' });
    }
    if (code.length > MAX_CODE_LENGTH) {
      return res.status(413).json({ message: `Code must be ${MAX_CODE_LENGTH} characters or fewer` });
    }
    if (!SUPPORTED_LANGUAGES.has(normalizedLanguage)) {
      return res.status(400).json({ message: `Unsupported language: ${language}` });
    }
    if (!problem || typeof problem !== 'string' || !problem.trim()) {
      return res.status(400).json({ message: 'Problem statement is required' });
    }
    if (problem.length > MAX_PROBLEM_LENGTH) {
      return res.status(413).json({ message: `Problem statement must be ${MAX_PROBLEM_LENGTH} characters or fewer` });
    }
    if (constraints !== undefined && (typeof constraints !== 'string' || constraints.length > MAX_CONSTRAINTS_LENGTH)) {
      return res.status(413).json({ message: `Constraints must be ${MAX_CONSTRAINTS_LENGTH} characters or fewer` });
    }

    const analysis = await analyzeCodeWithGemini({
      problem,
      constraints,
      language: normalizedLanguage,
      code,
      executionResult: 'Code execution is not enabled. Provide static code analysis only; do not claim that the code passed or failed.',
      apiKey: process.env.GEMINI_API_KEY
    });

    const profile = await UserProfile.findById(req.user._id);
    if (profile) {
      profile.addCodeReview({
        problem: problem.trim().slice(0, 2000),
        language: normalizedLanguage,
        code: code.slice(0, 20000),
        analysis,
        submittedAt: new Date()
      });
      await profile.save();
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
};
