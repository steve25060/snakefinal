const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../utils/db');
const tokenUtils = require('../utils/token');
const logger = require('../utils/logger');
const { validatePlayerRegistration, validateAdminCredentials } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/auth/register
 * Register new player
 */
router.post('/register', validatePlayerRegistration, async (req, res) => {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  console.log(`\x1b[36m[AUTH]\x1b[0m Register #${requestId} - User: ${req.body.name} (${req.body.roll_number})`);
  
  try {
    const name = req.body.name;
    const playerClass = req.body.class;
    const roll_number = req.body.roll_number;
    
    // Check if roll number already exists
    const existingUser = await db.getOne(
      'SELECT id FROM users WHERE roll_number = $1',
      [roll_number]
    );
    
    if (existingUser) {
      console.warn(`\x1b[33m[AUTH]\x1b[0m Register #${requestId} - Duplicate roll number: ${roll_number}`);
      return res.status(409).json({ 
        error: 'Roll number already registered',
        message: 'This roll number is already in use'
      });
    }
    
    // Create new user
    const user = await db.insert(
      'INSERT INTO users (name, class, roll_number) VALUES ($1, $2, $3)',
      [name, playerClass, roll_number]
    );
    
    logger.info('Player registered', { userId: user.id, rollNumber: roll_number, class: playerClass });
    console.log(`\x1b[32m[AUTH]\x1b[0m Register #${requestId} - Success! User ID: ${user.id}`);
    
    // Generate token
    const token = tokenUtils.generatePlayerToken(user.id, roll_number);
    
    res.status(201).json({
      success: true,
      message: 'Player registered successfully',
      data: {
        userId: user.id,
        name: user.name,
        class: user.class,
        rollNumber: user.roll_number,
        token,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error(`\x1b[31m[AUTH]\x1b[0m Register #${requestId} - Error: ${error.message}`);
    logger.error('Registration error:', { error: error.message });
    res.status(500).json({ error: 'Registration failed' });
  }
});

/**
 * POST /api/auth/login
 * Player login (auto-register if not exists)
 */
router.post('/login', validatePlayerRegistration, async (req, res) => {
  const requestId = Math.random().toString(36).substring(7).toUpperCase();
  console.log(`\x1b[36m[AUTH]\x1b[0m Login #${requestId} - User: ${req.body.name} (${req.body.roll_number})`);
  
  try {
    const name = req.body.name;
    const playerClass = req.body.class;
    const roll_number = req.body.roll_number;
    
    // Find or create user
    let user = await db.getOne(
      'SELECT * FROM users WHERE roll_number = $1',
      [roll_number]
    );
    
    if (!user) {
      console.log(`\x1b[33m[AUTH]\x1b[0m Login #${requestId} - User not found, creating new user`);
      // Auto-register if user doesn't exist
      user = await db.insert(
        'INSERT INTO users (name, class, roll_number) VALUES ($1, $2, $3)',
        [name, playerClass, roll_number]
      );
      console.log(`\x1b[32m[AUTH]\x1b[0m Login #${requestId} - Auto-registered! User ID: ${user.id}`);
    } else {
      console.log(`\x1b[32m[AUTH]\x1b[0m Login #${requestId} - User found! ID: ${user.id}`);
    }
    
    logger.info('Player logged in', { userId: user.id, rollNumber: roll_number, class: playerClass });
    
    // Generate token
    const token = tokenUtils.generatePlayerToken(user.id, roll_number);
    
    // Check if player has active session
    const activeSession = await db.getOne(
      `SELECT id, session_token, current_question_number, score 
       FROM game_sessions 
       WHERE user_id = $1 AND game_status = 'active'
       LIMIT 1`,
      [user.id]
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        userId: user.id,
        name: user.name,
        class: user.class,
        rollNumber: user.roll_number,
        token,
        activeSession: activeSession ? {
          sessionToken: activeSession.session_token,
          currentQuestion: activeSession.current_question_number,
          score: activeSession.score
        } : null
      }
    });
  } catch (error) {
    console.error(`\x1b[31m[AUTH]\x1b[0m Login #${requestId} - Error: ${error.message}`);
    logger.error('Login error:', { error: error.message });
    res.status(500).json({ error: 'Login failed' });
  }
});

/**
 * POST /api/auth/admin-login
 * Admin login
 */
router.post('/admin-login', validateAdminCredentials, async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find admin user
    const admin = await db.getOne(
      'SELECT * FROM admin_users WHERE username = $1',
      [username]
    );
    
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password_hash);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!admin.is_active) {
      return res.status(403).json({ error: 'Admin account is inactive' });
    }
    
    // Update last login
    await db.query(
      'UPDATE admin_users SET last_login = NOW() WHERE id = $1',
      [admin.id]
    );
    
    logger.info('Admin logged in', { adminId: admin.id, username });
    
    // Generate token
    const token = tokenUtils.generateAdminToken(admin.id, username);
    
    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        adminId: admin.id,
        username: admin.username,
        token
      }
    });
  } catch (error) {
    logger.error('Admin login error:', { error: error.message });
    res.status(500).json({ error: 'Admin login failed' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (invalidate session)
 */
router.post('/logout', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];
    
    if (sessionToken) {
      await db.query(
        'UPDATE game_sessions SET game_status = $1 WHERE session_token = $2',
        ['abandoned', sessionToken]
      );
      
      logger.info('Player logged out', { sessionToken });
    }
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    logger.error('Logout error:', { error: error.message });
    res.status(500).json({ error: 'Logout failed' });
  }
});

module.exports = router;
