const pool = require('../db/connection');

class QuizController {
  // Get random questions for a player
  static async getQuestions(req, res) {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Get 10 random active questions (mix of Python and C)
      // SQLite uses RANDOM() instead of RAND()
      const [questions] = await pool.query(
        `SELECT id, language, question_text, option_a, option_b, option_c, option_d 
         FROM questions 
         WHERE is_active = 1 
         ORDER BY RANDOM() 
         LIMIT 10`
      );

      if (questions.length === 0) {
        return res.status(404).json({ error: 'No questions available' });
      }

      res.json({ success: true, questions: questions });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ error: 'Failed to get questions' });
    }
  }

  // Get specific question
  static async getQuestion(req, res) {
    try {
      const { questionId } = req.params;

      const [questions] = await pool.query(
        'SELECT id, language, question_text, option_a, option_b, option_c, option_d, correct_option FROM questions WHERE id = ?',
        [questionId]
      );

      if (questions.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const question = questions[0];
      
      // Format response to match frontend expectations
      const formattedQuestion = {
        id: question.id,
        language: question.language,
        text: question.question_text,
        options: {
          A: question.option_a,
          B: question.option_b,
          C: question.option_c,
          D: question.option_d
        },
        correctOption: question.correct_option
      };

      res.json({ 
        success: true, 
        data: {
          question: formattedQuestion
        }
      });
    } catch (error) {
      console.error('Get question error:', error);
      res.status(500).json({ error: 'Failed to get question' });
    }
  }

  // Submit answer
  static async submitAnswer(req, res) {
    try {
      const { questionId, selectedOption } = req.body;

      if (!req.session.userId || !req.session.sessionId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      if (!questionId || !selectedOption) {
        return res.status(400).json({ error: 'Question ID and selected option required' });
      }

      // Validate option
      if (!['A', 'B', 'C', 'D'].includes(selectedOption)) {
        return res.status(400).json({ error: 'Invalid option' });
      }

      // Check if answer already submitted for this question
      const [existing] = await pool.query(
        'SELECT id FROM player_answers WHERE session_id = ? AND question_id = ?',
        [req.session.sessionId, questionId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Answer already submitted for this question' });
      }

      // Get correct answer
      const [questions] = await pool.query(
        'SELECT correct_option FROM questions WHERE id = ?',
        [questionId]
      );

      if (questions.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const correctOption = questions[0].correct_option;
      const isCorrect = selectedOption === correctOption;

      // Calculate points
      let points = 0;
      let resultType = 'wrong';

      if (isCorrect) {
        points = 100;
        resultType = 'correct';
      }

      // Save answer
      await pool.query(
        `INSERT INTO player_answers (session_id, question_id, selected_option, is_correct, result_type) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.session.sessionId, questionId, selectedOption, isCorrect ? 1 : 0, resultType]
      );

      // Update game session
      if (isCorrect) {
        await pool.query(
          `UPDATE game_sessions 
           SET score = score + ?, correct_answers = correct_answers + 1 
           WHERE id = ?`,
          [points, req.session.sessionId]
        );
      } else {
        await pool.query(
          `UPDATE game_sessions 
           SET wrong_answers = wrong_answers + 1 
           WHERE id = ?`,
          [req.session.sessionId]
        );
      }

      // Update user record
      const [session] = await pool.query(
        'SELECT score, correct_answers, wrong_answers, skipped_answers FROM game_sessions WHERE id = ?',
        [req.session.sessionId]
      );

      if (session.length > 0) {
        await pool.query(
          `UPDATE users 
           SET score = ?, correct_answers = ?, wrong_answers = ?, skipped_answers = ? 
           WHERE id = ?`,
          [session[0].score, session[0].correct_answers, session[0].wrong_answers, session[0].skipped_answers, req.session.userId]
        );
      }

      res.json({
        success: true,
        isCorrect: isCorrect,
        correctOption: correctOption,
        points: points,
        message: isCorrect ? 'Correct answer!' : 'Wrong answer',
      });
    } catch (error) {
      console.error('Submit answer error:', error);
      res.status(500).json({ error: 'Failed to submit answer' });
    }
  }

  // Handle border collision (skip question)
  static async skipQuestion(req, res) {
    try {
      const { questionId } = req.body;

      if (!req.session.userId || !req.session.sessionId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      // Check if answer already submitted
      const [existing] = await pool.query(
        'SELECT id FROM player_answers WHERE session_id = ? AND question_id = ?',
        [req.session.sessionId, questionId]
      );

      if (existing.length > 0) {
        return res.status(409).json({ error: 'Question already answered' });
      }

      // Record as skipped
      await pool.query(
        `INSERT INTO player_answers (session_id, question_id, selected_option, is_correct, result_type) 
         VALUES (?, ?, ?, ?, ?)`,
        [req.session.sessionId, questionId, 'A', 0, 'skipped']
      );

      // Update session
      await pool.query(
        `UPDATE game_sessions 
         SET skipped_answers = skipped_answers + 1 
         WHERE id = ?`,
        [req.session.sessionId]
      );

      res.json({ success: true, message: 'Question skipped' });
    } catch (error) {
      console.error('Skip question error:', error);
      res.status(500).json({ error: 'Failed to skip question' });
    }
  }

  // Get session stats
  static async getSessionStats(req, res) {
    try {
      if (!req.session.sessionId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const [session] = await pool.query(
        'SELECT * FROM game_sessions WHERE id = ?',
        [req.session.sessionId]
      );

      if (session.length === 0) {
        return res.status(404).json({ error: 'Session not found' });
      }

      // Count answered questions
      const [answered] = await pool.query(
        'SELECT COUNT(*) as count FROM player_answers WHERE session_id = ?',
        [req.session.sessionId]
      );

      res.json({
        success: true,
        session: session[0],
        questionsAnswered: answered[0].count,
      });
    } catch (error) {
      console.error('Get session stats error:', error);
      res.status(500).json({ error: 'Failed to get session stats' });
    }
  }

  // Complete the game
  static async completeGame(req, res) {
    try {
      if (!req.session.userId || !req.session.sessionId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const totalTimeSeconds = parseInt(req.body.totalTimeSeconds) || 0;

      // Update game session
      await pool.query(
        `UPDATE game_sessions 
         SET status = 'completed', completed_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [req.session.sessionId]
      );

      // Update user
      await pool.query(
        `UPDATE users 
         SET game_status = 'completed', completed_at = CURRENT_TIMESTAMP, total_time_seconds = ? 
         WHERE id = ?`,
        [totalTimeSeconds, req.session.userId]
      );

      // Get final stats
      const [user] = await pool.query(
        `SELECT id, name, class, roll_number, score, correct_answers, wrong_answers, skipped_answers, total_time_seconds, completed_at, game_status 
         FROM users WHERE id = ?`,
        [req.session.userId]
      );

      // Emit real-time WebSocket update for Admin Panel
      try {
        const io = req.app.get('io');
        if (io) {
          const [topPlayers] = await pool.query(
            `SELECT 
              id, name, class, roll_number, score, correct_answers, wrong_answers, 
              skipped_answers, total_time_seconds, completed_at, game_status
             FROM users 
             ORDER BY score DESC, completed_at ASC`
          );
          
          const leaderboardData = topPlayers.map((player, index) => {
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

          io.emit('leaderboard-updated', leaderboardData);
          io.emit('leaderboard-data', leaderboardData);
          io.emit('player-completed', user[0]);
        }
      } catch (wsErr) {
        console.warn('WebSocket broadcast error:', wsErr);
      }

      res.json({
        success: true,
        user: user[0],
        message: 'Game completed successfully',
      });
    } catch (error) {
      console.error('Complete game error:', error);
      res.status(500).json({ error: 'Failed to complete game' });
    }
  }
}

module.exports = QuizController;
