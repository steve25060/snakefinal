const express = require('express');
const db = require('../db-postgresql');

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

    // Get players - prioritise u.total_time_seconds (server-saved authoritative value)
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
          u.total_time_seconds,
          (
            SELECT CAST(EXTRACT(EPOCH FROM (COALESCE(gs.completed_at, CURRENT_TIMESTAMP) - gs.started_at)) AS INTEGER)
            FROM game_sessions gs
            WHERE gs.user_id = u.id
            ORDER BY gs.id DESC LIMIT 1
          )
        ) AS total_time_seconds,
        ROW_NUMBER() OVER (
          ORDER BY 
            u.score DESC,
            COALESCE(u.total_time_seconds, 999999) ASC,
            u.completed_at ASC NULLS LAST
        ) as rank
       FROM users u
       ORDER BY 
         u.score DESC,
         COALESCE(u.total_time_seconds, 999999) ASC,
         u.completed_at ASC NULLS LAST
       LIMIT $1`,
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
        rollNumber: player.roll_number,
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
      'SELECT COUNT(*) as count FROM game_sessions WHERE game_status = $1',
      ['completed']
    );
    const activeGames = await db.getOne(
      'SELECT COUNT(*) as count FROM game_sessions WHERE game_status = $1',
      ['active']
    );
    
    // Get highest score
    const highestScore = await db.getOne(
      'SELECT MAX(score) as score FROM users'
    );

    // Get average score
    const avgScore = await db.getOne(
      'SELECT AVG(score) as avg FROM users WHERE game_status = $1',
      ['completed']
    );

    // Get total questions attempted
    const totalAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers'
    );

    // Get correct/wrong counts
    const correctAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers WHERE is_correct = true'
    );
    const wrongAnswers = await db.getOne(
      'SELECT COUNT(*) as count FROM player_answers WHERE is_correct = false'
    );

    res.json({
      success: true,
      data: {
        totalPlayers: parseInt(totalPlayers?.count || 0, 10),
        completedGames: parseInt(completedGames?.count || 0, 10),
        activeGames: parseInt(activeGames?.count || 0, 10),
        highestScore: parseInt(highestScore?.score || 0, 10),
        averageScore: Math.round(parseFloat(avgScore?.avg || 0)),
        totalQuestionsAttempted: parseInt(totalAnswers?.count || 0, 10),
        totalCorrectAnswers: parseInt(correctAnswers?.count || 0, 10),
        totalWrongAnswers: parseInt(wrongAnswers?.count || 0, 10)
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
      'SELECT id, name, roll_number, score, correct_answers, wrong_answers, skipped_answers FROM users WHERE id = $1',
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
      'SELECT id, score FROM users WHERE game_status = $1 ORDER BY score DESC',
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
