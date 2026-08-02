const express = require('express');
const db = require('../utils/db');
const tokenUtils = require('../utils/token');
const scoringUtils = require('../utils/scoring');
const logger = require('../utils/logger');
const { verifyPlayerAuth, verifySessionToken } = require('../middleware/auth');
const { validateAnswerSubmission } = require('../middleware/validation');

const router = express.Router();

const TOTAL_QUESTIONS = parseInt(process.env.TOTAL_QUESTIONS) || 10;

/**
 * POST /api/game/start
 * Start new game session
 */
router.post('/start', verifyPlayerAuth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Create new game session
    const sessionToken = tokenUtils.generateSessionToken();
    
    const session = await db.insert(
      `INSERT INTO game_sessions (user_id, session_token, current_question_number, game_status)
       VALUES ($1, $2, 1, 'active')`,
      [userId, sessionToken]
    );
    
    logger.info('Game session started', { userId, sessionId: session.id });
    
    res.status(201).json({
      success: true,
      message: 'Game session started',
      data: {
        sessionId: session.id,
        sessionToken,
        currentQuestion: 1,
        totalQuestions: TOTAL_QUESTIONS
      }
    });
  } catch (error) {
    logger.error('Game start error:', { error: error.message });
    res.status(500).json({ error: 'Failed to start game' });
  }
});

/**
 * GET /api/game/question/:questionNumber
 * Get MCQ question for current question number
 * Query params: ?language=python|c (optional)
 */
router.get('/question/:questionNumber', verifySessionToken, async (req, res) => {
  try {
    const { questionNumber } = req.params;
    const { language } = req.query;
    const { sessionToken } = req;
    
    const questionNum = parseInt(questionNumber);
    
    if (isNaN(questionNum) || questionNum < 1 || questionNum > TOTAL_QUESTIONS) {
      return res.status(400).json({ error: 'Invalid question number' });
    }
    
    // Verify session exists
    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE session_token = $1',
      [sessionToken]
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    // Build query with optional language filter
    let query = `SELECT * FROM questions 
                 WHERE is_active = true AND id NOT IN (
                   SELECT question_id FROM player_answers WHERE session_id = $1
                 )`;
    const params = [session.id];
    
    if (language) {
      query += ` AND LOWER(language) = $2`;
      params.push(language.toLowerCase());
    }
    
    query += ` ORDER BY RANDOM() LIMIT 1`;
    
    // Get random question (that hasn't been answered yet in this session)
    const question = await db.getOne(query, params);
    
    if (!question) {
      return res.status(404).json({ error: 'No more questions available' });
    }
    
    res.json({
      success: true,
      data: {
        questionNumber: questionNum,
        totalQuestions: TOTAL_QUESTIONS,
        question: {
          id: question.id,
          text: question.question_text,
          language: question.language,
          options: {
            A: question.option_a,
            B: question.option_b,
            C: question.option_c,
            D: question.option_d
          },
          correctOption: question.correct_option,
          readingTimeSeconds: parseInt(process.env.READING_TIME_SECONDS) || 20
        }
      }
    });
  } catch (error) {
    logger.error('Get question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get question' });
  }
});

/**
 * POST /api/game/answer
 * Submit player answer
 */
router.post('/answer', verifySessionToken, validateAnswerSubmission, async (req, res) => {
  try {
    const { session_id, question_id, selected_option, result_type, reading_time_taken } = req.body;
    const { sessionToken } = req;
    
    // Verify session matches
    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE id = $1 AND session_token = $2',
      [session_id, sessionToken]
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    if (session.game_status !== 'active') {
      return res.status(400).json({ error: 'Game session is not active' });
    }
    
    // Get question
    const question = await db.getOne(
      'SELECT * FROM questions WHERE id = $1',
      [question_id]
    );
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }
    
    // Validate answer
    const isCorrect = selected_option === question.correct_option;
    let pointsAwarded = 0;
    let readingBonusPoints = 0;
    
    // Calculate score
    if (isCorrect) {
      const scoreCalc = scoringUtils.calculateCorrectAnswerScore(reading_time_taken);
      pointsAwarded = scoreCalc.totalPoints;
      readingBonusPoints = scoreCalc.bonusPoints;
    }
    
    // Save answer
    const answer = await db.insert(
      `INSERT INTO player_answers (
        session_id, question_id, question_number, selected_option, correct_option,
        is_correct, result_type, points_awarded, reading_time_taken, reading_bonus_points
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        session_id, question_id, session.current_question_number, selected_option,
        question.correct_option, isCorrect, result_type || (isCorrect ? 'correct' : 'wrong'),
        pointsAwarded, reading_time_taken || 0, readingBonusPoints
      ]
    );
    
    // Update session
    const newScore = session.score + pointsAwarded;
    const newCorrectCount = session.correct_answers + (isCorrect ? 1 : 0);
    const newWrongCount = session.wrong_answers + (isCorrect ? 0 : 1);
    
    await db.query(
      `UPDATE game_sessions 
       SET score = $1, correct_answers = $2, wrong_answers = $3, updated_at = NOW()
       WHERE id = $4`,
      [newScore, newCorrectCount, newWrongCount, session_id]
    );
    
    logger.info('Answer submitted', {
      sessionId: session_id,
      questionId: question_id,
      correct: isCorrect,
      points: pointsAwarded
    });
    
    res.json({
      success: true,
      message: isCorrect ? 'Correct answer!' : 'Wrong answer',
      data: {
        isCorrect,
        selectedOption: selected_option,
        correctOption: question.correct_option,
        pointsAwarded,
        readingBonusPoints,
        totalPointsThisQuestion: pointsAwarded + readingBonusPoints,
        sessionScore: newScore,
        correctAnswers: newCorrectCount,
        wrongAnswers: newWrongCount
      }
    });
  } catch (error) {
    logger.error('Answer submission error:', { error: error.message });
    res.status(500).json({ error: 'Failed to submit answer' });
  }
});

/**
 * POST /api/game/next-question
 * Progress to next question
 */
router.post('/next-question', verifySessionToken, async (req, res) => {
  try {
    const { session_id } = req.body;
    const { sessionToken } = req;
    
    // Verify session
    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE id = $1 AND session_token = $2',
      [session_id, sessionToken]
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    const nextQuestionNumber = session.current_question_number + 1;
    
    // Check if all questions completed
    if (nextQuestionNumber > TOTAL_QUESTIONS) {
      // Mark game as completed
      await db.query(
        `UPDATE game_sessions 
         SET game_status = 'completed', completed_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [session_id]
      );
      
      logger.info('Game completed', { sessionId: session_id, score: session.score });
      
      return res.json({
        success: true,
        message: 'Game completed',
        data: {
          gameCompleted: true,
          finalScore: session.score,
          correctAnswers: session.correct_answers,
          wrongAnswers: session.wrong_answers,
          questionsCompleted: TOTAL_QUESTIONS
        }
      });
    }
    
    // Update current question
    await db.query(
      `UPDATE game_sessions 
       SET current_question_number = $1, updated_at = NOW()
       WHERE id = $2`,
      [nextQuestionNumber, session_id]
    );
    
    res.json({
      success: true,
      message: `Moving to question ${nextQuestionNumber}`,
      data: {
        currentQuestion: nextQuestionNumber,
        totalQuestions: TOTAL_QUESTIONS,
        gameCompleted: false
      }
    });
  } catch (error) {
    logger.error('Next question error:', { error: error.message });
    res.status(500).json({ error: 'Failed to progress to next question' });
  }
});

/**
 * GET /api/game/status/:sessionId
 * Get current game status
 */
router.get('/status/:sessionId', verifySessionToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE id = $1',
      [sessionId]
    );
    
    if (!session) {
      return res.status(404).json({ error: 'Game session not found' });
    }
    
    const answers = await db.getAll(
      'SELECT * FROM player_answers WHERE session_id = $1 ORDER BY answered_at',
      [sessionId]
    );
    
    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.game_status,
        currentQuestion: session.current_question_number,
        totalQuestions: TOTAL_QUESTIONS,
        score: session.score,
        correctAnswers: session.correct_answers,
        wrongAnswers: session.wrong_answers,
        skippedAnswers: session.skipped_answers,
        questionsAnswered: answers.length,
        startedAt: session.started_at,
        completedAt: session.completed_at
      }
    });
  } catch (error) {
    logger.error('Get game status error:', { error: error.message });
    res.status(500).json({ error: 'Failed to get game status' });
  }
});

module.exports = router;
