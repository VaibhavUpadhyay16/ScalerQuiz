import express from 'express';
import { submitCode } from '../controllers/codeController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyJWT);

router.post('/submit', submitCode);

export default router;
