const logger = require('../utils/logger');

/**
 * Validate player registration
 */
function validatePlayerRegistration(req, res, next) {
  try {
    const name = req.body.name;
    const playerClass = req.body.class;
    const roll_number = req.body.roll_number;
    
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'Valid player name is required' });
    }
    
    if (!playerClass || typeof playerClass !== 'string' || playerClass.trim().length === 0) {
      return res.status(400).json({ error: 'Valid class is required' });
    }
    
    if (!roll_number || typeof roll_number !== 'string' || roll_number.trim().length === 0) {
      return res.status(400).json({ error: 'Valid roll number is required' });
    }
    
    if (name.length > 255) {
      return res.status(400).json({ error: 'Player name too long (max 255 characters)' });
    }
    
    if (playerClass.length > 50) {
      return res.status(400).json({ error: 'Class too long (max 50 characters)' });
    }
    
    if (roll_number.length > 50) {
      return res.status(400).json({ error: 'Roll number too long (max 50 characters)' });
    }
    
    // Sanitize inputs
    req.body.name = name.trim();
    req.body.class = playerClass.trim();
    req.body.roll_number = roll_number.trim();
    
    next();
  } catch (error) {
    logger.error('Registration validation error:', { error: error.message });
    res.status(400).json({ error: 'Validation failed' });
  }
}

/**
 * Validate answer submission
 */
function validateAnswerSubmission(req, res, next) {
  try {
    const { session_id, question_id, selected_option, result_type } = req.body;
    
    if (!session_id) {
      return res.status(400).json({ error: 'Session ID is required' });
    }
    
    if (!question_id) {
      return res.status(400).json({ error: 'Question ID is required' });
    }
    
    if (selected_option && !['A', 'B', 'C', 'D'].includes(selected_option)) {
      return res.status(400).json({ error: 'Invalid option. Must be A, B, C, or D' });
    }
    
    if (result_type && !['correct', 'wrong', 'border_collision', 'timeout', 'skipped'].includes(result_type)) {
      return res.status(400).json({ error: 'Invalid result type' });
    }
    
    next();
  } catch (error) {
    logger.error('Answer validation error:', { error: error.message });
    res.status(400).json({ error: 'Validation failed' });
  }
}

/**
 * Validate question creation/update
 */
function validateQuestion(req, res, next) {
  try {
    const { language, question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
    
    if (!language || !['Python', 'C'].includes(language)) {
      return res.status(400).json({ error: 'Valid language (Python or C) is required' });
    }
    
    if (!question_text || typeof question_text !== 'string' || question_text.trim().length === 0) {
      return res.status(400).json({ error: 'Question text is required' });
    }
    
    if (!option_a || !option_b || !option_c || !option_d) {
      return res.status(400).json({ error: 'All four options (A, B, C, D) are required' });
    }
    
    if (!correct_option || !['A', 'B', 'C', 'D'].includes(correct_option)) {
      return res.status(400).json({ error: 'Valid correct option (A, B, C, or D) is required' });
    }
    
    next();
  } catch (error) {
    logger.error('Question validation error:', { error: error.message });
    res.status(400).json({ error: 'Validation failed' });
  }
}

/**
 * Validate admin credentials
 */
function validateAdminCredentials(req, res, next) {
  try {
    const { username, password } = req.body;
    
    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }
    
    next();
  } catch (error) {
    logger.error('Admin credentials validation error:', { error: error.message });
    res.status(400).json({ error: 'Validation failed' });
  }
}

module.exports = {
  validatePlayerRegistration,
  validateAnswerSubmission,
  validateQuestion,
  validateAdminCredentials
};
