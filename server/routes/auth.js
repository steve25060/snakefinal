const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db-postgresql');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new player
 */
router.post('/register', async (req, res) => {
  try {
    const { name, rollNumber, roll_number, class: userClass } = req.body;
    
    // Accept both rollNumber and roll_number
    const actualRollNumber = rollNumber || roll_number;

    if (!name || !actualRollNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Name and roll number are required' 
      });
    }

    // Check if roll number already exists
    const existing = await db.getOne(
      'SELECT id FROM users WHERE roll_number = $1',
      [actualRollNumber]
    );

    if (existing) {
      return res.status(409).json({ 
        success: false,
        error: 'Roll number already registered' 
      });
    }

    // Create user
    const sessionToken = uuidv4();
    const result = await db.insert(
      `INSERT INTO users (name, roll_number, class, session_token, game_status) 
       VALUES ($1, $2, $3, $4, 'waiting')`,
      [name, actualRollNumber, userClass || '', sessionToken]
    );

    // Create game session
    const sessionResult = await db.insert(
      'INSERT INTO game_sessions (user_id, session_token, game_status) VALUES ($1, $2, $3)',
      [result.id, sessionToken, 'active']
    );

    // Broadcast real-time player event
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('player-joined', { userId: result.id, name, rollNumber: actualRollNumber });
      }
    } catch (e) {}

    res.status(201).json({
      success: true,
      userId: result.id,
      sessionToken: sessionToken,
      sessionId: sessionResult.id,
      data: {
        userId: result.id,
        sessionToken: sessionToken,
        sessionId: sessionResult.id,
        name: name,
        rollNumber: actualRollNumber
      },
      message: 'Registration successful'
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false,
        error: 'Roll number already registered' 
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Registration failed' 
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing player
 */
router.post('/login', async (req, res) => {
  try {
    const { rollNumber, roll_number, class: userClass, className, playerClass } = req.body;
    
    // Accept both formats
    const actualRollNumber = rollNumber || roll_number;
    const actualClass = userClass || className || playerClass;

    if (!actualRollNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Roll number is required' 
      });
    }

    const user = await db.getOne(
      'SELECT id, name, roll_number, class FROM users WHERE roll_number = $1',
      [actualRollNumber]
    );

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Player not found' 
      });
    }

    // Generate new session token
    const sessionToken = uuidv4();

    await db.update(
      `UPDATE users SET 
        session_token = $1, 
        game_status = 'playing',
        score = 0,
        correct_answers = 0,
        wrong_answers = 0,
        skipped_answers = 0,
        completed_at = NULL,
        total_time_seconds = NULL,
        class = CASE WHEN $2 != '' THEN $2 ELSE class END
       WHERE id = $3`,
      [sessionToken, actualClass || '', user.id]
    );

    // Check for existing active session
    let session = await db.getOne(
      'SELECT id FROM game_sessions WHERE user_id = $1 AND game_status = $2',
      [user.id, 'active']
    );

    let sessionId;
    if (!session) {
      const newSession = await db.insert(
        'INSERT INTO game_sessions (user_id, session_token, game_status) VALUES ($1, $2, $3)',
        [user.id, sessionToken, 'active']
      );
      sessionId = newSession.id;
    } else {
      sessionId = session.id;
      // Update session token
      await db.update(
        'UPDATE game_sessions SET session_token = $1 WHERE id = $2',
        [sessionToken, sessionId]
      );
    }

    // Broadcast real-time player event
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('player-joined', { userId: user.id, name: user.name, rollNumber: user.roll_number });
      }
    } catch (e) {}

    res.json({
      success: true,
      userId: user.id,
      sessionToken: sessionToken,
      sessionId: sessionId,
      data: {
        userId: user.id,
        sessionToken: sessionToken,
        sessionId: sessionId,
        name: user.name,
        rollNumber: user.roll_number
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Login failed' 
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout player
 */
router.post('/logout', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];

    if (sessionToken) {
      await db.update(
        'UPDATE users SET session_token = NULL WHERE session_token = $1',
        [sessionToken]
      );
    }

    res.json({ success: true, message: 'Logged out successfully' });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Logout failed' 
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Not authenticated' 
      });
    }

    const user = await db.getOne(
      `SELECT id, name, roll_number, class, score, correct_answers, 
              wrong_answers, skipped_answers, game_status 
       FROM users WHERE session_token = $1`,
      [sessionToken]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'User not found' 
      });
    }

    user.rollNumber = user.roll_number;
    res.json({ success: true, user, data: user });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get user' 
    });
  }
});

module.exports = router;
