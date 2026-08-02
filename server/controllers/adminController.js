const pool = require('../db/connection');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class AdminController {
  // Admin login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      // Default Admin credentials fallback
      if (username === 'admin' && password === 'admin123') {
        req.session.adminId = 1;
        req.session.isAdmin = true;
        return res.json({
          success: true,
          adminId: 1,
          message: 'Login successful',
        });
      }

      const [admins] = await pool.query(
        'SELECT id, password_hash FROM admin_users WHERE username = ?',
        [username]
      );

      if (admins.length > 0) {
        const admin = admins[0];
        const passwordMatch = await bcrypt.compare(password, admin.password_hash);
        if (passwordMatch) {
          req.session.adminId = admin.id;
          req.session.isAdmin = true;
          return res.json({
            success: true,
            adminId: admin.id,
            message: 'Login successful',
          });
        }
      }

      return res.status(401).json({ error: 'Invalid admin credentials' });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }

  // Admin logout
  static async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
      });
    } catch (error) {
      console.error('Admin logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  }

  // Get all participants
  static async getParticipants(req, res) {
    try {
      const [participants] = await pool.query(
        `SELECT 
          id, name, class, roll_number, score, correct_answers, wrong_answers, 
          skipped_answers, game_status, started_at, completed_at 
         FROM users 
         ORDER BY score DESC, completed_at ASC`
      );

      res.json({
        success: true,
        participants: participants,
        count: participants.length,
      });
    } catch (error) {
      console.error('Get participants error:', error);
      res.status(500).json({ error: 'Failed to get participants' });
    }
  }

  // Search participants
  static async searchParticipants(req, res) {
    try {
      const { query } = req.query;

      if (!query || query.length < 1) {
        return res.status(400).json({ error: 'Search query required' });
      }

      const searchTerm = `%${query}%`;

      const [participants] = await pool.query(
        `SELECT 
          id, name, class, roll_number, score, correct_answers, wrong_answers, 
          skipped_answers, game_status, started_at, completed_at 
         FROM users 
         WHERE name LIKE ? OR roll_number LIKE ?
         ORDER BY score DESC`,
        [searchTerm, searchTerm]
      );

      res.json({
        success: true,
        participants: participants,
        count: participants.length,
      });
    } catch (error) {
      console.error('Search participants error:', error);
      res.status(500).json({ error: 'Failed to search participants' });
    }
  }

  // Get participant details
  static async getParticipantDetails(req, res) {
    try {
      const { userId } = req.params;

      const [users] = await pool.query(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const [answers] = await pool.query(
        `SELECT pa.*, q.question_text, q.correct_option, q.option_a, q.option_b, q.option_c, q.option_d
         FROM player_answers pa
         JOIN questions q ON pa.question_id = q.id
         WHERE pa.session_id = (SELECT id FROM game_sessions WHERE user_id = ? ORDER BY id DESC LIMIT 1)
         ORDER BY pa.answered_at`,
        [userId]
      );

      res.json({
        success: true,
        user: users[0],
        answers: answers,
      });
    } catch (error) {
      console.error('Get participant details error:', error);
      res.status(500).json({ error: 'Failed to get participant details' });
    }
  }

  // Get all questions
  static async getQuestions(req, res) {
    try {
      const [questions] = await pool.query(
        'SELECT * FROM questions ORDER BY language, created_at DESC'
      );

      res.json({
        success: true,
        questions: questions,
        count: questions.length,
      });
    } catch (error) {
      console.error('Get questions error:', error);
      res.status(500).json({ error: 'Failed to get questions' });
    }
  }

  // Add question
  static async addQuestion(req, res) {
    try {
      const { language, questionText, optionA, optionB, optionC, optionD, correctOption } = req.body;

      if (!language || !questionText || !optionA || !optionB || !optionC || !optionD || !correctOption) {
        return res.status(400).json({ error: 'All fields required' });
      }

      if (!['Python', 'C'].includes(language)) {
        return res.status(400).json({ error: 'Invalid language' });
      }

      if (!['A', 'B', 'C', 'D'].includes(correctOption)) {
        return res.status(400).json({ error: 'Invalid correct option' });
      }

      const [result] = await pool.query(
        `INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [language, questionText, optionA, optionB, optionC, optionD, correctOption]
      );

      res.status(201).json({
        success: true,
        questionId: result.insertId,
        message: 'Question added successfully',
      });
    } catch (error) {
      console.error('Add question error:', error);
      res.status(500).json({ error: 'Failed to add question' });
    }
  }

  // Update question
  static async updateQuestion(req, res) {
    try {
      const { id } = req.params;
      const { language, questionText, optionA, optionB, optionC, optionD, correctOption, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Question ID required' });
      }

      const [existing] = await pool.query('SELECT id FROM questions WHERE id = ?', [id]);

      if (existing.length === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      const updates = [];
      const values = [];

      if (language !== undefined) {
        updates.push('language = ?');
        values.push(language);
      }
      if (questionText !== undefined) {
        updates.push('question_text = ?');
        values.push(questionText);
      }
      if (optionA !== undefined) {
        updates.push('option_a = ?');
        values.push(optionA);
      }
      if (optionB !== undefined) {
        updates.push('option_b = ?');
        values.push(optionB);
      }
      if (optionC !== undefined) {
        updates.push('option_c = ?');
        values.push(optionC);
      }
      if (optionD !== undefined) {
        updates.push('option_d = ?');
        values.push(optionD);
      }
      if (correctOption !== undefined) {
        updates.push('correct_option = ?');
        values.push(correctOption);
      }
      if (isActive !== undefined) {
        updates.push('is_active = ?');
        values.push(isActive ? 1 : 0);
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      values.push(id);

      await pool.query(
        `UPDATE questions SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      res.json({
        success: true,
        message: 'Question updated successfully',
      });
    } catch (error) {
      console.error('Update question error:', error);
      res.status(500).json({ error: 'Failed to update question' });
    }
  }

  // Delete question
  static async deleteQuestion(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'Question ID required' });
      }

      const [result] = await pool.query('DELETE FROM questions WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Question not found' });
      }

      res.json({
        success: true,
        message: 'Question deleted successfully',
      });
    } catch (error) {
      console.error('Delete question error:', error);
      res.status(500).json({ error: 'Failed to delete question' });
    }
  }

  // Get dashboard stats
  static async getStats(req, res) {
    try {
      const [stats] = await pool.query(
        `SELECT 
          COUNT(*) as total_participants,
          SUM(CASE WHEN game_status = 'playing' THEN 1 ELSE 0 END) as currently_playing,
          SUM(CASE WHEN game_status = 'completed' THEN 1 ELSE 0 END) as completed_players,
          SUM(CASE WHEN game_status = 'waiting' THEN 1 ELSE 0 END) as waiting_players,
          COUNT(DISTINCT CASE WHEN game_status = 'completed' THEN id END) as total_games_completed
         FROM users`
      );

      const [questionStats] = await pool.query(
        `SELECT 
          COUNT(*) as total_questions,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_questions,
          SUM(CASE WHEN language = 'Python' THEN 1 ELSE 0 END) as python_questions,
          SUM(CASE WHEN language = 'C' THEN 1 ELSE 0 END) as c_questions
         FROM questions`
      );

      res.json({
        success: true,
        participantStats: stats[0],
        questionStats: questionStats[0],
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  }
}

module.exports = AdminController;
