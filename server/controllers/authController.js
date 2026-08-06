const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

class AuthController {
  // Register player
  static async register(req, res) {
    try {
      const { name, class: playerClass, rollNumber } = req.body;

      // Validation
      if (!name || !rollNumber) {
        return res.status(400).json({ error: 'Name and roll number required' });
      }

      // Create session token (allow multiple entries even with same roll number / class / name)
      const sessionToken = uuidv4();

      // Insert new player
      const [result] = await pool.query(
        `INSERT INTO users (name, class, roll_number, session_token, game_status) 
         VALUES (?, ?, ?, ?, 'waiting')`,
        [name, playerClass || null, rollNumber, sessionToken]
      );

      // Create game session
      const [sessionResult] = await pool.query(
        'INSERT INTO game_sessions (user_id, status) VALUES (?, ?)',
        [result.insertId, 'playing']
      );

      // Store in session
      req.session.userId = result.insertId;
      req.session.sessionToken = sessionToken;
      req.session.sessionId = sessionResult.insertId;

      res.status(201).json({
        success: true,
        userId: result.insertId,
        sessionToken: sessionToken,
        sessionId: sessionResult.insertId,
        message: 'Registration successful',
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }

  // Login player (if they already registered)
  static async login(req, res) {
    try {
      const { rollNumber } = req.body;

      if (!rollNumber) {
        return res.status(400).json({ error: 'Roll number required' });
      }

      const [users] = await pool.query(
        'SELECT id, name FROM users WHERE roll_number = ?',
        [rollNumber]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Player not found' });
      }

      const user = users[0];
      const sessionToken = uuidv4();

      // Update session token
      await pool.query(
        'UPDATE users SET session_token = ?, game_status = ? WHERE id = ?',
        [sessionToken, 'playing', user.id]
      );

      // Get or create new game session
      const [existingSession] = await pool.query(
        'SELECT id FROM game_sessions WHERE user_id = ? AND status = ?',
        [user.id, 'playing']
      );

      let sessionId;
      if (existingSession.length === 0) {
        const [newSession] = await pool.query(
          'INSERT INTO game_sessions (user_id, status) VALUES (?, ?)',
          [user.id, 'playing']
        );
        sessionId = newSession.insertId;
      } else {
        sessionId = existingSession[0].id;
      }

      req.session.userId = user.id;
      req.session.sessionToken = sessionToken;
      req.session.sessionId = sessionId;

      res.json({
        success: true,
        userId: user.id,
        sessionToken: sessionToken,
        sessionId: sessionId,
        message: 'Login successful',
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Logout player
  static async logout(req, res) {
    try {
      if (req.session.userId) {
        await pool.query(
          'UPDATE users SET session_token = NULL WHERE id = ?',
          [req.session.userId]
        );
      }

      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Get current user info
  static async getCurrentUser(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [users] = await pool.query(
        'SELECT id, name, roll_number, score, correct_answers, wrong_answers, skipped_answers, game_status FROM users WHERE id = ?',
        [req.session.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ success: true, user: users[0] });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}

module.exports = AuthController;
