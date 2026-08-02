const pool = require('../db/connection');

class LeaderboardController {
  // Get top N players
  static async getTopPlayers(req, res) {
    try {
      const { limit = 50 } = req.params;
      const max = Math.min(parseInt(limit), 1000);

      // SQLite compatible query without ROW_NUMBER()
      const [players] = await pool.query(
        `SELECT 
          id, name, class, roll_number, score, correct_answers, wrong_answers, 
          skipped_answers, total_time_seconds, completed_at, game_status
         FROM users 
         WHERE game_status = 'completed'
         ORDER BY score DESC, completed_at ASC
         LIMIT ?`,
        [max]
      );

      // Add rank and formatted time
      const playersWithRank = players.map((player, index) => {
        const secs = player.total_time_seconds;
        let displayTime = 'N/A';
        if (secs && !isNaN(secs) && secs > 0) {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          displayTime = m > 0 ? `${m}m ${s}s` : `${s}s`;
        }
        return {
          ...player,
          rank: index + 1,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
          formatted_time: displayTime
        };
      });

      res.json({
        success: true,
        players: playersWithRank,
        count: playersWithRank.length,
      });
    } catch (error) {
      console.error('Get top players error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  }

  // Get all completed players
  static async getAllPlayers(req, res) {
    try {
      const [players] = await pool.query(
        `SELECT 
          id, name, class, roll_number, score, correct_answers, wrong_answers, 
          skipped_answers, total_time_seconds, completed_at, game_status
         FROM users 
         WHERE game_status = 'completed'
         ORDER BY score DESC, completed_at ASC`
      );

      // Add rank and formatted time
      const playersWithRank = players.map((player, index) => {
        const secs = player.total_time_seconds;
        let displayTime = 'N/A';
        if (secs && !isNaN(secs) && secs > 0) {
          const m = Math.floor(secs / 60);
          const s = Math.floor(secs % 60);
          displayTime = m > 0 ? `${m}m ${s}s` : `${s}s`;
        }
        return {
          ...player,
          rank: index + 1,
          medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
          formatted_time: displayTime
        };
      });

      res.json({
        success: true,
        players: playersWithRank,
        count: playersWithRank.length,
      });
    } catch (error) {
      console.error('Get all players error:', error);
      res.status(500).json({ error: 'Failed to get leaderboard' });
    }
  }

  // Get player rank
  static async getPlayerRank(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [users] = await pool.query(
        `SELECT id, name, roll_number, score FROM users WHERE id = ?`,
        [req.session.userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = users[0];

      // Get rank
      const [rank] = await pool.query(
        `SELECT COUNT(*) + 1 as rank FROM users 
         WHERE game_status = 'completed' AND (score > ? OR (score = ? AND completed_at < (SELECT completed_at FROM users WHERE id = ?)))`,
        [user.score, user.score, req.session.userId]
      );

      res.json({
        success: true,
        rank: rank[0].rank,
        user: user,
      });
    } catch (error) {
      console.error('Get player rank error:', error);
      res.status(500).json({ error: 'Failed to get player rank' });
    }
  }

  // Get leaderboard stats
  static async getStats(req, res) {
    try {
      const [stats] = await pool.query(
        `SELECT 
          COUNT(*) as total_players,
          SUM(CASE WHEN game_status = 'completed' THEN 1 ELSE 0 END) as completed_players,
          SUM(CASE WHEN game_status = 'playing' THEN 1 ELSE 0 END) as active_players,
          MAX(score) as highest_score,
          ROUND(AVG(score)) as average_score
         FROM users`
      );

      res.json({
        success: true,
        stats: stats[0],
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }
}

module.exports = LeaderboardController;
