import express from 'express';
import { registerUser, loginUser, logoutUser, refreshUserToken, getMe } from '../controllers/authController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/refresh', refreshUserToken);
router.get('/me', verifyJWT, getMe);

export default router;
