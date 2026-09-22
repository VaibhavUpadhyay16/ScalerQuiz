
import { generateQuestions as geminiGenerateQuestions } from './geminiService.js';
export const DOMAINS = [
  'Java Programming',
  'Python Programming',
  'Data Structures',
  'Algorithms',
  'Database Systems',
  'Web Development',
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'History',
  'Geography',
  'General Knowledge',
  'English Literature',
  'Computer Networks',
  'Operating Systems',
  'Artificial Intelligence',
  'Machine Learning',
  'Cybersecurity',
  'Cloud Computing'
];

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function getFallbackQuestions(domain, difficulty, count) {
  const fallbackQuestions = [];
  const numQuestions = Math.min(count, 5);

  for (let i = 0; i < numQuestions; i++) {
    fallbackQuestions.push({
      text: `Sample question ${i + 1} for ${domain} (${difficulty})`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOptionIndex: 0,
      difficulty,
      type: 'MULTIPLE_CHOICE',
      explanation: 'This is a fallback question. Please configure the Gemini API key for AI-generated questions.'
    });
  }

  return fallbackQuestions;
}

async function generateFreshQuestions(domain, difficulty, count, apiKey) {
  const maxRetries = 3;
  let attempt = 0;
  let collected = [];

  while (attempt < maxRetries) {
    try {
      const remaining = count - collected.length;
      const questions = await geminiGenerateQuestions(domain, difficulty, remaining, apiKey);
      collected = collected.concat(questions);

      if (collected.length >= count) {
        return collected.slice(0, count);
      }

      attempt++;
      if (attempt < maxRetries) {
        console.log(`Retry attempt ${attempt} of ${maxRetries}`);
        await delay(1000);
      }
    } catch (error) {
      console.error(`Error generating questions (attempt ${attempt + 1}): ${error.message}`);

      if (error.code === 'GEMINI_TIMEOUT') {
        throw error;
      }

      attempt++;
      if (attempt < maxRetries) {
        await delay(2000);
      }
    }
  }

  return collected;
}

/**
 * Equivalent to QuestionBank.getQuestionsForDomain()
 */
export async function getQuestionsForDomain(domain, difficulty, count, apiKey) {
  console.log(`\nGenerating ${count} fresh AI questions...`);
  console.log(`Domain: ${domain} | Difficulty: ${difficulty}`);

  if (!apiKey) {
    console.error('Gemini AI is not configured!');
    return getFallbackQuestions(domain, difficulty, count);
  }

  const questions = await generateFreshQuestions(domain, difficulty, count, apiKey);

  if (questions.length === 0) {
    console.error('Failed to generate questions, using fallback');
    return getFallbackQuestions(domain, difficulty, count);
  }

  console.log(`Successfully generated ${questions.length} unique questions\n`);
  return questions;
}

export async function* streamQuestionsForDomain(domain, difficulty, count, apiKey) {
  if (!apiKey) {
    for (const question of getFallbackQuestions(domain, difficulty, count)) {
      yield question;
    }
    return;
  }

  for (let index = 0; index < count; index++) {
    const questions = await generateFreshQuestions(domain, difficulty, 1, apiKey);

    if (questions.length === 0) {
      throw new Error(`Could not generate question ${index + 1}`);
    }

    yield questions[0];
  }
}

export async function testGeminiConnection(apiKey) {
  if (!apiKey) return false;

  try {
    const testQuestions = await geminiGenerateQuestions('General Knowledge', 'Easy', 1, apiKey);
    return testQuestions.length > 0;
  } catch (error) {
    console.error(`Gemini connection test failed - ${error.message}`);
    return false;
  }
}
