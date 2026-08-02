const express = require('express');
const db = require('../utils/db');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * GET /api/leaderboard?limit=10&offset=0
 * Get top players leaderboard
 */
router.get('/', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const offset = parseInt(req.query.offset) || 0;
    
    const leaderboard = await db.getAll(
      `SELECT 
        RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
        u.id,
        u.name,
        u.roll_number,
        gs.score,
        gs.correct_answers,
        gs.wrong_answers,
        gs.skipped_answers,
        gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
       FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE gs.game_status = 'completed'
       ORDER BY gs.score DESC, gs.completed_at ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    // Get total count
    const countResult = await db.getOne(
      'SELECT COUNT(*) as total FROM game_sessions WHERE game_status = $1',
      ['completed']
    );
    
    res.json({
      success: true,
      data: {
        leaderboard,
        pagination: {
          limit,
          offset,
          total: parseInt(countResult.total)
        }
      }
    });
  } catch (error) {
    logger.error('Get leaderboard error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * GET /api/leaderboard/top?count=10
 * Get top N players
 */
router.get('/top', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.query.count) || 10, 100);
    
    const topPlayers = await db.getAll(
      `SELECT 
        RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
        u.id,
        u.name,
        u.roll_number,
        gs.score,
        gs.correct_answers,
        gs.wrong_answers,
        gs.skipped_answers,
        gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
       FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE gs.game_status = 'completed'
       ORDER BY gs.score DESC, gs.completed_at ASC
       LIMIT $1`,
      [count]
    );
    
    res.json({
      success: true,
      data: {
        topPlayers,
        count: topPlayers.length
      }
    });
  } catch (error) {
    logger.error('Get top players error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get top players' });
  }
});

/**
 * GET /api/leaderboard/search?q=name_or_roll
 * Search players on leaderboard
 */
router.get('/search', async (req, res) => {
  try {
    const searchQuery = req.query.q || '';
    
    if (searchQuery.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }
    
    const results = await db.getAll(
      `SELECT 
        RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
        u.id,
        u.name,
        u.roll_number,
        gs.score,
        gs.correct_answers,
        gs.wrong_answers,
        gs.skipped_answers,
        gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
       FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE gs.game_status = 'completed'
       AND (LOWER(u.name) LIKE LOWER($1) OR u.roll_number LIKE $1)
       ORDER BY gs.score DESC, gs.completed_at ASC
       LIMIT 50`,
      [`%${searchQuery}%`]
    );
    
    res.json({
      success: true,
      data: {
        results,
        count: results.length
      }
    });
  } catch (error) {
    logger.error('Search leaderboard error:', { error: error.message });
    res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * GET /api/leaderboard/player/:playerId
 * Get specific player's rank and stats
 */
router.get('/player/:playerId', async (req, res) => {
  try {
    const { playerId } = req.params;
    
    const player = await db.getOne(
      `SELECT 
        RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
        u.id,
        u.name,
        u.roll_number,
        gs.id as session_id,
        gs.score,
        gs.correct_answers,
        gs.wrong_answers,
        gs.skipped_answers,
        gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
       FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE u.id = $1 AND gs.game_status = 'completed'
       ORDER BY gs.score DESC
       LIMIT 1`,
      [playerId]
    );
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found on leaderboard' });
    }
    
    res.json({
      success: true,
      data: player
    });
  } catch (error) {
    logger.error('Get player rank error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get player rank' });
  }
});

/**
 * GET /api/leaderboard/stats
 * Get overall game statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await db.getOne(
      `SELECT 
        COUNT(DISTINCT u.id) as total_players,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN gs.id END) as completed_games,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'active' THEN gs.id END) as active_games,
        ROUND(AVG(CASE WHEN gs.game_status = 'completed' THEN gs.score END)::numeric, 2) as average_score,
        MAX(CASE WHEN gs.game_status = 'completed' THEN gs.score END) as highest_score,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN u.id END) as players_completed
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id`
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get statistics error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
