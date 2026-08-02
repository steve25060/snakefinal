const express = require('express');
const db = require('../utils/db');
const logger = require('../utils/logger');
const { verifyAdminAuth } = require('../middleware/auth');
const { validateQuestion } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/questions
 * Get all questions (with optional filters)
 */
router.get('/', verifyAdminAuth, async (req, res) => {
  try {
    const { language, is_active, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM questions WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (language) {
      paramCount++;
      query += ` AND language = $${paramCount}`;
      params.push(language);
    }
    
    if (is_active !== undefined) {
      paramCount++;
      query += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }
    
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const questions = await db.getAll(query, params);
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM questions WHERE 1=1';
    const countParams = [];
    if (language) {
      countQuery += ' AND language = $1';
      countParams.push(language);
    }
    if (is_active !== undefined) {
      countQuery += ` AND is_active = $${countParams.length + 1}`;
      countParams.push(is_active === 'true');
    }
    
    const countResult = await db.getOne(countQuery, countParams);
    
    res.json({
      success: true,
      data: {
        questions,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: parseInt(countResult.total)
        }
      }
    });
  } catch (error) {
    logger.error('Get questions error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

/**
 * GET /api/questions/:id
 * Get specific question
 */
router.get('/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await db.getOne(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    res.json({
      success: true,
      data: question
    });
  } catch (error) {
    logger.error('Get question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get question' });
  }
});

/**
 * POST /api/questions
 * Create new question
 */
router.post('/', verifyAdminAuth, validateQuestion, async (req, res) => {
  try {
    const { language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level } = req.body;
    
    const question = await db.insert(
      `INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level || 'medium']
    );
    
    logger.info('Question created', { questionId: question.id, language });
    
    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question
    });
  } catch (error) {
    logger.error('Create question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to create question' });
  }
});

/**
 * PUT /api/questions/:id
 * Update question
 */
router.put('/:id', verifyAdminAuth, validateQuestion, async (req, res) => {
  try {
    const { id } = req.params;
    const { language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level, is_active } = req.body;
    
    // Check if question exists
    const existingQuestion = await db.getOne(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    
    if (!existingQuestion) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const question = await db.update(
      `UPDATE questions 
       SET language = $1, question_text = $2, option_a = $3, option_b = $4, 
           option_c = $5, option_d = $6, correct_option = $7, difficulty_level = $8, is_active = $9
       WHERE id = $10`,
      [language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level || 'medium', is_active !== undefined ? is_active : true, id]
    );
    
    logger.info('Question updated', { questionId: id });
    
    res.json({
      success: true,
      message: 'Question updated successfully',
      data: question
    });
  } catch (error) {
    logger.error('Update question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to update question' });
  }
});

/**
 * DELETE /api/questions/:id
 * Delete question
 */
router.delete('/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if question exists
    const question = await db.getOne(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Soft delete by marking as inactive
    await db.query(
      'UPDATE questions SET is_active = false WHERE id = $1',
      [id]
    );
    
    logger.info('Question deleted', { questionId: id });
    
    res.json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    logger.error('Delete question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

/**
 * POST /api/questions/toggle-active/:id
 * Toggle question active status
 */
router.post('/toggle-active/:id', verifyAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const question = await db.getOne(
      'SELECT * FROM questions WHERE id = $1',
      [id]
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    const updated = await db.update(
      'UPDATE questions SET is_active = $1 WHERE id = $2',
      [!question.is_active, id]
    );
    
    logger.info('Question status toggled', { questionId: id, isActive: !question.is_active });
    
    res.json({
      success: true,
      message: `Question ${updated.is_active ? 'activated' : 'deactivated'}`,
      data: updated
    });
  } catch (error) {
    logger.error('Toggle question status error:', { error: error.message });
    res.status(500).json({ error: 'Failed to toggle question status' });
  }
});

module.exports = router;
