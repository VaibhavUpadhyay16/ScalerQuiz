import express from 'express';
import { listUsers, getUserStats, updatePreferences } from '../controllers/userController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(verifyJWT); // Protect all user routes

router.get('/', listUsers);
router.get('/:username', getUserStats);
router.patch('/:username/preferences', updatePreferences);

export default router;
