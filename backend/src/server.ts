import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import deliveryRoutes from './routes/delivery.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import peakHoursRoutes from './routes/peak-hours.routes.js';
import riderRoutes from './routes/rider.routes.js';
import importRoutes from './routes/import.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { pool } from './database/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const HEALTH_RATE_LIMIT_WINDOW_MS = 60_000;
const HEALTH_RATE_LIMIT_MAX_REQUESTS = 30;
const healthRequests = new Map<string, { count: number; windowStart: number }>();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8443',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.use('/health', (req, res, next) => {
  const key = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const existing = healthRequests.get(key);

  if (!existing || now - existing.windowStart >= HEALTH_RATE_LIMIT_WINDOW_MS) {
    healthRequests.set(key, { count: 1, windowStart: now });
    next();
    return;
  }

  existing.count += 1;

  if (existing.count > HEALTH_RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ message: 'Too many requests' });
    return;
  }

  next();
});

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', message: 'Server and database connected' });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', message: 'Database connection failed' });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics', peakHoursRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/import', importRoutes);

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await pool.end();
  process.exit(0);
});
