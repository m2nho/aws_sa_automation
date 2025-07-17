import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { authRoutes } from './routes/auth';
import { checksRoutes } from './routes/checks';
import { errorHandler } from './middleware/error-handler';

// .env 파일 경로를 명시적으로 지정
dotenv.config({ path: path.join(__dirname, '../.env') });

// 환경 변수 검증
if (!process.env.COGNITO_USER_POOL_ID || !process.env.COGNITO_CLIENT_ID) {
  console.error('Missing required environment variables:');
  console.error('- COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID);
  console.error('- COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/checks', checksRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log('Environment variables:');
  console.log('- COGNITO_USER_POOL_ID:', process.env.COGNITO_USER_POOL_ID ? 'Set' : 'Not set');
  console.log('- COGNITO_CLIENT_ID:', process.env.COGNITO_CLIENT_ID ? 'Set' : 'Not set');
  console.log('- AWS_REGION:', process.env.AWS_REGION);
});