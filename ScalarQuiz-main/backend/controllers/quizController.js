import UserProfile from '../models/UserProfile.js';
import {
  getQuestionsForDomain,
  streamQuestionsForDomain,
  testGeminiConnection,
  DOMAINS
} from '../services/questionService.js';

/**
 * GET /api/quiz/domains
 * Equivalent to QuestionBank.getAvailableDomains(), used to populate the
 * domain dropdown in Login.java.
 */
export const getDomains = (req, res) => {
  res.json(DOMAINS);
};

/**
 * GET /api/quiz/status
 * Equivalent to the startup checks in QuizApplication.performStartupChecks()
 * (API key configured? / can we reach Gemini?).
 */
export const checkGeminiStatus = async (req, res) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const configured = Boolean(apiKey) && apiKey !== 'YOUR_GEMINI_API_KEY_HERE';
  let connected = false;

  if (configured) {
    connected = await testGeminiConnection(apiKey);
  }

  res.json({ configured, connected });
};

/**
 * POST /api/quiz/questions
 * Equivalent to QuestionBank.getQuestionsForDomain(), called from Quiz.java's
 * constructor.
 */
export const generateQuestions = async (req, res) => {
  try {
    const { domain, difficulty, count } = req.body;

    if (!domain || !difficulty || !count) {
      return res.status(400).json({ message: 'domain, difficulty and count are required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const questions = await getQuestionsForDomain(domain, difficulty, Number(count), apiKey);
    res.json(questions);
  } catch (error) {
    if (error.code === 'GEMINI_TIMEOUT') {
      return res.status(504).json({
        code: error.code,
        message: 'Gemini is taking too long to respond. Please try again after some time.'
      });
    }

    res.status(500).json({ message: error.message });
  }
};

export const streamQuestions = async (req, res) => {
  const { domain, difficulty, count } = req.body;

  if (!domain || !difficulty || !count) {
    return res.status(400).json({ message: 'domain, difficulty and count are required' });
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Transfer-Encoding', 'chunked');
  res.flushHeaders();

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    for await (const question of streamQuestionsForDomain(domain, difficulty, Number(count), apiKey)) {
      if (res.destroyed) return;
      res.write(`${JSON.stringify(question)}\n`);
    }
    res.end();
  } catch (error) {
    if (!res.destroyed) {
      res.write(`${JSON.stringify({
        error: error.code === 'GEMINI_TIMEOUT'
          ? 'Gemini is taking too long to respond. Please try again after some time.'
          : error.message,
        code: error.code
      })}\n`);
      res.end();
    }
  }
};

/**
 * POST /api/quiz/submit
 * Equivalent to Quiz.finishQuiz() - builds a QuizResult, saves it onto the
 * user's profile (triggering achievement checks) and persists it.
 */
export const submitResult = async (req, res) => {
  try {
    const { username, domain, difficulty, correctAnswers, totalQuestions, timeTakenSeconds, totalScore } =
      req.body;

    if (!username || !domain || !difficulty) {
      return res.status(400).json({ message: 'username, domain and difficulty are required' });
    }

    const profile = await UserProfile.findOrCreate(username);

    const result = {
      domain,
      difficulty,
      correctAnswers,
      totalQuestions,
      timeTakenSeconds,
      totalScore: totalScore || 0,
      completionDate: new Date()
    };

    profile.addQuizResult(domain, result);
    await profile.save();

    res.json({
      result,
      profile: {
        totalQuizzesTaken: profile.totalQuizzesTaken,
        achievementPoints: profile.achievementPoints,
        earnedBadges: profile.earnedBadges
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
