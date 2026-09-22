import UserProfile from '../models/UserProfile.js';
import { DOMAINS } from '../services/questionService.js';

/**
 * POST /api/users/login
 * Equivalent to Login.startQuiz()'s username handling + UserProfile.loadProfile().
 * Creates a new profile if the username doesn't exist yet ("New User"),
 * or returns the existing one ("Existing User").
 */
export const loginUser = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ message: 'Please enter a username' });
    }

    const profile = await UserProfile.findOrCreate(username);
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/users
 * Equivalent to UserProfile.getAllUsernames() used to populate the
 * "Existing User" dropdown in Login.java.
 */
export const listUsers = async (req, res) => {
  try {
    const usernames = await UserProfile.getAllUsernames();
    res.json(usernames);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/users/:username
 * Equivalent to Login.showStatisticsDialog() - achievements + per-domain
 * average scores.
 */
export const getUserStats = async (req, res) => {
  try {
    const profile = await UserProfile.findById(req.user._id);

    if (!profile) {
      return res.status(404).json({ message: 'User not found. Create a profile by starting a quiz first.' });
    }

    const domainAverages = {};
    for (const domain of DOMAINS) {
      const results = profile.getResultsForDomain(domain);
      if (results.length > 0) {
        const avg =
          results.reduce((sum, r) => sum + (r.correctAnswers / r.totalQuestions) * 100, 0) / results.length;
        domainAverages[domain] = avg;
      }
    }

    const quizHistory = profile.quizHistory
      .slice()
      .sort((a, b) => new Date(b.completionDate) - new Date(a.completionDate))
      .slice(0, 20);
    const codeReviewHistory = profile.codeReviewHistory
      .slice()
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .map((review) => ({
        id: review._id,
        problem: review.problem,
        language: review.language,
        code: review.code,
        analysis: review.analysis,
        submittedAt: review.submittedAt
      }));

    res.json({
      username: profile.username,
      name: profile.name,
      email: profile.email,
      totalQuizzesTaken: profile.totalQuizzesTaken,
      achievementPoints: profile.achievementPoints,
      earnedBadges: profile.earnedBadges,
      preferredDifficulty: profile.preferredDifficulty,
      preferredTheme: profile.preferredTheme,
      domainAverages,
      quizHistory,
      codeReviewHistory,
      latestQuiz: quizHistory[0] || null,
      latestCodeReview: codeReviewHistory[0] || null
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * PATCH /api/users/:username/preferences
 * Equivalent to profile.setPreferredDifficulty()/setPreferredTheme() +
 * profile.saveProfile() in Login.startQuiz().
 */
export const updatePreferences = async (req, res) => {
  try {
    const { preferredDifficulty, preferredTheme } = req.body;
    const profile = await UserProfile.findOne({ username: req.params.username });

    if (!profile) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (preferredDifficulty) profile.preferredDifficulty = preferredDifficulty;
    if (preferredTheme) profile.preferredTheme = preferredTheme;

    await profile.save();
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
