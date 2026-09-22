import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import authRoutes from './routes/authRoutes.js';
import problemRoutes from './routes/problemRoutes.js';
import codeRoutes from './routes/codeRoutes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';
import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);   
const app = express();

connectDB();

// Security Middlewares
app.use(helmet());

// CORS configuration to allow credentials (cookies)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://scalarquiz.netlify.app',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

// Routes
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/code', codeRoutes);

app.get('/', (req, res) => {
  res.send('🤖 AI-Powered Quiz Application API is running securely');
});

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('='.repeat(70));
  console.log('  🤖 AI-POWERED QUIZ APPLICATION - API SERVER');
  console.log('  Powered by Google Gemini AI');
  console.log('='.repeat(70));
  console.log(`✅ Server running on port ${PORT}`);
});
