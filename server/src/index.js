import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import evidenceRoutes from './routes/evidenceRoutes.js';
import caseRoutes from './routes/caseRoutes.js';
import demoRoutes from './routes/demoRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security & utility middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'ProofPath Evidence Vault & Case Builder API',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.AI_PROVIDER || 'local',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/demo', demoRoutes);

// Serve client production build if available
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

// Start server function
let server;
export const startServer = async (port = PORT) => {
  try {
    await connectDB();
    server = app.listen(port, () => {
      console.log(`ProofPath API Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
    return server;
  } catch (err) {
    console.error('Failed to start ProofPath API Server:', err);
    process.exit(1);
  }
};

// Only automatically start the server if not running in a test suite or if directly executed
const isRunningInTest = process.env.NODE_ENV === 'test' || (process.argv[1] && process.argv[1].includes('test'));
if (!isRunningInTest) {
  startServer();
}

export { app };
