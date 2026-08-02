const express = require('express');
const db = require('../db');

const router = express.Router();

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds <= 0) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

const getLeaderboardHandler = async (req, res) => {
  try {
    let limit = req.params.limit || req.query.limit || 100;
    limit = parseInt(limit) || 100;

    // Get players ordered by score
    const leaderboard = await db.getAll(
      `SELECT 
        u.id,
        u.name,
        u.roll_number,
        u.class,
        u.score,
        u.correct_answers,
        u.wrong_answers,
        u.skipped_answers,
        u.game_status,
        u.completed_at,
        u.created_at,
        COALESCE(
          (
            SELECT CAST(ROUND((JULIANDAY(gs.completed_at) - JULIANDAY(gs.started_at)) * 86400) AS INTEGER)
            FROM game_sessions gs
            WHERE gs.user_id = u.id AND gs.completed_at IS NOT NULL
            ORDER BY gs.completed_at DESC LIMIT 1
          ),
          (
            SELECT CAST(ROUND((JULIANDAY(COALESCE(u.completed_at, datetime('now'))) - JULIANDAY(u.created_at)) * 86400) AS INTEGER)
          )
        ) AS total_time_seconds,
        ROW_NUMBER() OVER (ORDER BY u.score DESC, u.completed_at ASC) as rank
       FROM users u
       ORDER BY u.score DESC, u.completed_at ASC
       LIMIT ?`,
      [limit]
    );

    // Add medal emoji and formatted total time for each player
    const leaderboardWithMedals = leaderboard.map((player, index) => {
      let medal = '';
      if (index === 0) medal = '🥇';
      else if (index === 1) medal = '🥈';
      else if (index === 2) medal = '🥉';
      
      const timeSecs = player.total_time_seconds || 0;
      const formattedTime = formatTime(timeSecs);

      return {
        ...player,
        medal,
        total_time_seconds: timeSecs,
        formatted_time: formattedTime
      };
    });

    res.json({
      success: true,
      data: leaderboardWithMedals,
      players: leaderboardWithMedals,
      leaderboard: leaderboardWithMedals,
      total: leaderboardWithMedals.length
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get leaderboard' 
    });
  }
};

router.get('/', getLeaderboardHandler);
router.get('/top/:limit', getLeaderboardHandler);

/**
 * GET /api/leaderboard/stats
 * Get overall game statistics
 */
router.get('/stats', async (req, res) => {
  try {
    // Get counts
    const totalPlayers = await db.getOne('SELECT COUNT(*) as count FROM users');
    const completedGames = await db.getOne(
      'SELECT COUNT(*) as count FROM game_sessions WHERE game_status = ?',
      ['completed']
    );
    const activeGames = await db.getOne(
      'SELECT COUNT(*) as count FROM game_sessions WHERE game_status = ?',
      ['active']
    );
    
    // Get highest score
    const highestScore = await db.getOne(
      'SELECT MAX(score) as score FROM users'
    );

    // Get average score
    const avgScore = await db.getOne(
      'SELECT AVG(score) as avg FROM users WHERE game_status = ?',
      ['completed']
    );

    // Get total questions attempted
    const totalAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers'
    );

    // Get correct/wrong counts
    const correctAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers WHERE is_correct = 1'
    );
    const wrongAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers WHERE is_correct = 0'
    );

    res.json({
      success: true,
      data: {
        totalPlayers: totalPlayers?.count || 0,
        completedGames: completedGames?.count || 0,
        activeGames: activeGames?.count || 0,
        highestScore: highestScore?.score || 0,
        averageScore: Math.round(avgScore?.avg || 0),
        totalQuestionsAttempted: totalAnswers?.count || 0,
        totalCorrectAnswers: correctAnswers?.count || 0,
        totalWrongAnswers: wrongAnswers?.count || 0
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get statistics' 
    });
  }
});

/**
 * GET /api/leaderboard/player/:id
 * Get specific player rank and stats
 */
router.get('/player/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await db.getOne(
      'SELECT id, name, roll_number, score, correct_answers, wrong_answers, skipped_answers FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        error: 'Player not found' 
      });
    }

    // Get rank
    const allPlayers = await db.getAll(
      'SELECT id, score FROM users WHERE game_status = ? ORDER BY score DESC',
      ['completed']
    );

    const rank = allPlayers.findIndex(p => p.id === user.id) + 1;

    res.json({
      success: true,
      data: {
        ...user,
        rank: rank || null,
        totalPlayers: allPlayers.length
      }
    });

  } catch (error) {
    console.error('Get player rank error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get player rank' 
    });
  }
});

module.exports = router;
