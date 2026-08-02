require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const questionsRoutes = require('./routes/questions');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import socket handlers
const socketHandlers = require('./socket/handlers');

// Import database initialization
const { initializeDatabase } = require('./utils/db-init');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Socket.IO event handlers
socketHandlers(io);

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    
    console.log(`${statusColor}[${res.statusCode}]${reset} ${req.method} ${req.path} - ${duration}ms`);
    
    if (res.statusCode >= 400) {
      console.error(`  └─ URL: ${req.originalUrl}`);
      console.error(`  └─ Headers: ${JSON.stringify(req.headers)}`);
    }
  });
  
  next();
});

// 404 handler
app.use((req, res) => {
  const error = `Route not found: ${req.method} ${req.path}`;
  console.error('\x1b[31m❌ 404 ERROR\x1b[0m');
  console.error(`  └─ ${error}`);
  console.error(`  └─ Full URL: ${req.originalUrl}`);
  
  res.status(404).json({ error: 'Route not found', path: req.path });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error('\x1b[31m❌ SERVER ERROR\x1b[0m');
  console.error(`  └─ Message: ${err.message}`);
  console.error(`  └─ Stack: ${err.stack}`);
  console.error(`  └─ Path: ${req.path}`);
  console.error(`  └─ Method: ${req.method}`);
  
  errorHandler(err, req, res, next);
});

const PORT = process.env.PORT || 3000;

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🐍 SNAKE MCQ CHALLENGE - Backend Server  ║
╚════════════════════════════════════════════╝
  
  Server running on: http://localhost:${PORT}
  Environment: ${process.env.NODE_ENV}
  WebSocket: Enabled (Socket.IO)
  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}
  
  Endpoints:
  - Health: GET /health
  - Auth: POST /api/auth/*
  - Game: GET|POST /api/game/*
  - Questions: GET|POST /api/questions/*
  - Leaderboard: GET /api/leaderboard/*
  - Admin: GET|POST|PUT|DELETE /api/admin/*

  Ready to handle 100+ concurrent players!
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Closing gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = { app, server, io };
