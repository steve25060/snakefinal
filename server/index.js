const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./db-postgresql');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database on startup
initializeDatabase()
  .then(() => console.log('✅ PostgreSQL Database ready'))
  .catch(err => {
    console.error('❌ Database initialization failed:', err);
    process.exit(1);
  });

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Token', 'x-session-token']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for API responses
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const color = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    console.log(`${color}[${res.statusCode}]\x1b[0m ${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
const authRoutes = require('./routes/auth');
const quizRoutes = require('./routes/quiz');
const leaderboardRoutes = require('./routes/leaderboard');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString() 
  });
});

// Catch-all route for frontend (SPA support)
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api/')) {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
  } else {
    res.status(404).json({ error: 'API endpoint not found' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Setup HTTP & Socket.io Server
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);

  socket.on('admin-join', () => {
    socket.join('admin-room');
    console.log('🛡️ Admin joined real-time socket room');
  });

  socket.on('disconnect', () => {
    console.log('⚡ Socket disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║   🐍 SNAKE MCQ CHALLENGE - Game Server    ║
╚════════════════════════════════════════════╝

  ✅ Server running on: http://localhost:${PORT}
  🎮 Game URL: http://localhost:${PORT}
  📊 Admin panel: http://localhost:${PORT}/admin-login.html
  💾 Database: PostgreSQL (Neon)

  Ready to play! 🚀
  `);
});

module.exports = app;
