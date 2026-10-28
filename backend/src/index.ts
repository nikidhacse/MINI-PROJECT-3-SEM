import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import identityRouter from './routes/identity';
import apiRouter from './routes/api';
import ragRouter from './routes/rag';
import generateRouter from './routes/generate';
import supportRouter from './routes/support';
import socialRouter from './routes/social';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'apikey', 'X-Client-Info']
}));

// Body parser with 50mb limit for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AetherDesign API',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/identity', identityRouter);
app.use('/api', apiRouter);
app.use('/rag', ragRouter);
app.use('/generate', generateRouter);
app.use('/support', supportRouter);
app.use('/social', socialRouter);
app.use('/api/social', socialRouter);

// Global 404 handler for unmatched routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND'
  });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    code: err.code || 'SERVER_ERROR'
  });
});

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 AetherDesign API running on http://localhost:${PORT}`);
  });
}

export default app;
