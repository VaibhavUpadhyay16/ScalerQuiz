import express from 'express';
import { getProblems, getProblemById } from '../controllers/problemController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyJWT);

router.get('/', getProblems);
router.get('/:id', getProblemById);

export default router;
