import mongoose from 'mongoose';
const quizResultSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true },
    difficulty: { type: String, required: true },
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    timeTakenSeconds: { type: Number, required: true },
    totalScore: { type: Number, default: 0 },
    completionDate: { type: Date, default: Date.now }
  },
  { _id: false }
);

const codeReviewSchema = new mongoose.Schema(
  {
    problem: { type: String, required: true, maxlength: 2000 },
    language: { type: String, required: true },
    code: { type: String, required: true, maxlength: 20000 },
    analysis: { type: mongoose.Schema.Types.Mixed, required: true },
    submittedAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

quizResultSchema.virtual('percentageScore').get(function () {
  return this.totalQuestions > 0 ? (this.correctAnswers / this.totalQuestions) * 100 : 0;
});

quizResultSchema.virtual('isPerfectScore').get(function () {
  return this.correctAnswers === this.totalQuestions;
});

quizResultSchema.set('toJSON', { virtuals: true });
quizResultSchema.set('toObject', { virtuals: true });

const userProfileSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true, default: 'User' },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['User', 'Admin'], default: 'User' },
    refreshToken: { type: String },
    quizHistory: { type: [quizResultSchema], default: [] },
    codeReviewHistory: { type: [codeReviewSchema], default: [] },
    totalQuizzesTaken: { type: Number, default: 0 },
    achievementPoints: { type: Number, default: 0 },
    earnedBadges: { type: [String], default: [] },
    preferredDifficulty: { type: String, default: 'Medium' },
    preferredTheme: { type: String, default: 'Light' }
  },
  { timestamps: true }
);
userProfileSchema.methods.addQuizResult = function (domain, result) {
  this.quizHistory.push({ domain, ...result });
  this.totalQuizzesTaken += 1;
  this.checkForAchievements(domain);
};

userProfileSchema.methods.addCodeReview = function (review) {
  this.codeReviewHistory.unshift(review);
  this.codeReviewHistory = this.codeReviewHistory.slice(0, 20);
};

userProfileSchema.methods.checkForAchievements = function (domain) {
  if (this.totalQuizzesTaken === 1 && !this.earnedBadges.includes('First Quiz')) {
    this.earnedBadges.push('First Quiz');
    this.achievementPoints += 10;
  }

  if (this.totalQuizzesTaken === 5 && !this.earnedBadges.includes('Quiz Enthusiast')) {
    this.earnedBadges.push('Quiz Enthusiast');
    this.achievementPoints += 25;
  }

  const results = this.getResultsForDomain(domain);
  if (results.length > 0) {
    const latestResult = results[results.length - 1];
    const badgeName = `Perfect Score: ${domain}`;
    const isPerfect = latestResult.correctAnswers === latestResult.totalQuestions;
    if (isPerfect && !this.earnedBadges.includes(badgeName)) {
      this.earnedBadges.push(badgeName);
      this.achievementPoints += 50;
    }
  }
};

userProfileSchema.methods.getResultsForDomain = function (domain) {
  return this.quizHistory.filter((r) => r.domain === domain);
};

userProfileSchema.methods.getAverageScores = function () {
  const domains = [...new Set(this.quizHistory.map((r) => r.domain))];
  const averages = {};
  for (const domain of domains) {
    const results = this.getResultsForDomain(domain);
    if (results.length === 0) continue;
    const sum = results.reduce((acc, r) => acc + (r.correctAnswers / r.totalQuestions) * 100, 0);
    averages[domain] = sum / results.length;
  }
  return averages;
};

userProfileSchema.statics.findOrCreate = async function (username) {
  const trimmed = username.trim();
  let profile = await this.findOne({ username: trimmed });
  if (!profile) {
    profile = await this.create({ username: trimmed });
  }
  return profile;
};

userProfileSchema.statics.getAllUsernames = async function () {
  const profiles = await this.find({}, 'username').lean();
  return profiles.map((p) => p.username);
};

export default mongoose.model('UserProfile', userProfileSchema);
