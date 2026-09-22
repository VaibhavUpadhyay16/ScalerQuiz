import express from 'express';
import {
  getDomains,
  generateQuestions,
  streamQuestions,
  submitResult,
  checkGeminiStatus
} from '../controllers/quizController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/domains', getDomains);

router.use(verifyJWT); // Protect all remaining quiz routes
router.get('/status', checkGeminiStatus);
router.post('/questions', generateQuestions);
router.post('/questions/stream', streamQuestions);
router.post('/submit', submitResult);

export default router;
