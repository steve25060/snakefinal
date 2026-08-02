const express = require('express');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { verifyAdminAuth } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Get admin dashboard statistics
 */
router.get('/dashboard', verifyAdminAuth, async (req, res) => {
  try {
    const stats = await db.getOne(
      `SELECT 
        COUNT(DISTINCT u.id) as total_participants,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'active' THEN u.id END) as currently_playing,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN u.id END) as completed_players,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN gs.id END) as total_games_completed,
        ROUND(AVG(CASE WHEN gs.game_status = 'completed' THEN gs.score END)::numeric, 2) as average_score,
        MAX(CASE WHEN gs.game_status = 'completed' THEN gs.score END) as highest_score
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id`
    );
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('Get dashboard stats error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

/**
 * GET /api/admin/participants
 * Get all participants with filters
 */
router.get('/participants', verifyAdminAuth, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0, search } = req.query;
    
    let query = `SELECT 
      u.id, u.name, u.roll_number, u.created_at,
      gs.id as session_id, gs.score, gs.correct_answers, gs.wrong_answers, 
      gs.skipped_answers, gs.game_status, gs.current_question_number,
      gs.started_at, gs.completed_at,
      ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
     FROM users u
     LEFT JOIN game_sessions gs ON u.id = gs.user_id
     WHERE 1=1`;
    
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      query += ` AND gs.game_status = $${paramCount}`;
      params.push(status);
    }
    
    if (search) {
      paramCount++;
      query += ` AND (LOWER(u.name) LIKE LOWER($${paramCount}) OR u.roll_number LIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const participants = await db.getAll(query, params);
    
    res.json({
      success: true,
      data: {
        participants,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    logger.error('Get participants error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get participants' });
  }
});

/**
 * GET /api/admin/participant/:userId
 * Get detailed participant info
 */
router.get('/participant/:userId', verifyAdminAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const participant = await db.getOne(
      `SELECT 
        u.id, u.name, u.roll_number, u.created_at,
        gs.id as session_id, gs.score, gs.correct_answers, gs.wrong_answers,
        gs.skipped_answers, gs.game_status, gs.current_question_number,
        gs.started_at, gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id
       WHERE u.id = $1
       ORDER BY gs.completed_at DESC LIMIT 1`,
      [userId]
    );
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    // Get detailed answers if session exists
    let answers = [];
    if (participant.session_id) {
      answers = await db.getAll(
        `SELECT 
          pa.question_number, pa.selected_option, pa.correct_option, pa.is_correct,
          pa.result_type, pa.points_awarded, pa.reading_bonus_points,
          q.question_text, q.language,
          pa.answered_at
         FROM player_answers pa
         JOIN questions q ON pa.question_id = q.id
         WHERE pa.session_id = $1
         ORDER BY pa.question_number`,
        [participant.session_id]
      );
    }
    
    res.json({
      success: true,
      data: {
        participant,
        answers
      }
    });
  } catch (error) {
    logger.error('Get participant detail error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get participant details' });
  }
});

/**
 * GET /api/admin/live-stats
 * Get live game statistics (for real-time updates)
 */
router.get('/live-stats', verifyAdminAuth, async (req, res) => {
  try {
    const liveStats = await db.getOne(
      `SELECT 
        COUNT(DISTINCT CASE WHEN gs.game_status = 'active' THEN u.id END) as active_players,
        COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN u.id END) as completed_players,
        COUNT(DISTINCT u.id) as total_participants,
        COUNT(DISTINCT gs.id) as total_sessions,
        ROUND(AVG(CASE WHEN gs.game_status = 'completed' THEN gs.score END)::numeric, 2) as avg_score,
        MAX(CASE WHEN gs.game_status = 'completed' THEN gs.score END) as max_score,
        MIN(CASE WHEN gs.game_status = 'completed' THEN gs.score END) as min_score
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id`
    );
    
    res.json({
      success: true,
      data: liveStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Get live stats error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get live statistics' });
  }
});

/**
 * GET /api/admin/leaderboard-snapshot
 * Get current leaderboard snapshot for admin
 */
router.get('/leaderboard-snapshot', verifyAdminAuth, async (req, res) => {
  try {
    const { top = 10 } = req.query;
    const topCount = Math.min(parseInt(top), 100);
    
    const leaderboard = await db.getAll(
      `SELECT 
        RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
        u.id, u.name, u.roll_number,
        gs.score, gs.correct_answers, gs.wrong_answers, gs.skipped_answers,
        gs.completed_at,
        ROUND(((gs.correct_answers::float / 10) * 100)::numeric, 2) as accuracy_percentage,
        EXTRACT(EPOCH FROM (gs.completed_at - gs.started_at))::integer as time_taken_seconds
       FROM users u
       JOIN game_sessions gs ON u.id = gs.user_id
       WHERE gs.game_status = 'completed'
       ORDER BY gs.score DESC, gs.completed_at ASC
       LIMIT $1`,
      [topCount]
    );
    
    res.json({
      success: true,
      data: {
        leaderboard,
        count: leaderboard.length,
        snapshot_time: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Get leaderboard snapshot error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get leaderboard snapshot' });
  }
});

/**
 * GET /api/admin/reports
 * Get comprehensive reports
 */
router.get('/reports', verifyAdminAuth, async (req, res) => {
  try {
    // Overall statistics
    const overallStats = await db.getOne(
      `SELECT 
        COUNT(DISTINCT u.id) as total_players,
        COUNT(DISTINCT gs.id) as total_sessions,
        SUM(CASE WHEN gs.game_status = 'completed' THEN 1 ELSE 0 END) as completed_sessions,
        SUM(CASE WHEN gs.game_status = 'active' THEN 1 ELSE 0 END) as active_sessions,
        ROUND(AVG(CASE WHEN gs.game_status = 'completed' THEN gs.score END)::numeric, 2) as avg_score_completed
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id`
    );
    
    // Language-wise statistics
    const languageStats = await db.getAll(
      `SELECT 
        q.language,
        COUNT(DISTINCT pa.question_id) as questions_asked,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct_attempts,
        ROUND((SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100)::numeric, 2) as accuracy
       FROM player_answers pa
       JOIN questions q ON pa.question_id = q.id
       GROUP BY q.language`
    );
    
    // Difficulty-wise statistics
    const difficultyStats = await db.getAll(
      `SELECT 
        q.difficulty_level,
        COUNT(*) as total_attempts,
        SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END) as correct_attempts,
        ROUND((SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END)::float / COUNT(*) * 100)::numeric, 2) as accuracy
       FROM player_answers pa
       JOIN questions q ON pa.question_id = q.id
       GROUP BY q.difficulty_level`
    );
    
    res.json({
      success: true,
      data: {
        overall: overallStats,
        byLanguage: languageStats,
        byDifficulty: difficultyStats,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Get reports error:', { error: error.message });
    res.status(500).json({ error: 'Failed to generate reports' });
  }
});

module.exports = router;
