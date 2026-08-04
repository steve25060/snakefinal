const express = require('express');
const db = require('../db-postgresql');

const router = express.Router();

/**
 * GET /api/quiz/questions
 * Get all available active questions
 */
router.get('/questions', async (req, res) => {
  try {
    const { language } = req.query;
    let query = 'SELECT * FROM questions WHERE is_active = true';
    const params = [];

    if (language) {
      query += ' AND LOWER(language) = $1';
      params.push(language.toLowerCase());
    }

    query += ' ORDER BY RANDOM() LIMIT 10';

    const questions = await db.getAll(query, params);

    res.json({
      success: true,
      questions: questions,
      data: questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get questions' 
    });
  }
});

/**
 * POST /api/quiz/start
 * Start or verify a game session
 */
router.post('/start', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'] || req.body.sessionToken;

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false, 
        error: 'Session token required' 
      });
    }

    let session = await db.getOne(
      "SELECT id, user_id FROM game_sessions WHERE session_token = $1",
      [sessionToken]
    );

    if (session) {
      await db.update(
        "UPDATE game_sessions SET game_status = 'active', started_at = CURRENT_TIMESTAMP WHERE id = $1",
        [session.id]
      );
    } else {
      const user = await db.getOne('SELECT id FROM users WHERE session_token = $1', [sessionToken]);
      if (user) {
        const newSession = await db.insert(
          "INSERT INTO game_sessions (user_id, session_token, game_status, started_at) VALUES ($1, $2, 'active', CURRENT_TIMESTAMP)",
          [user.id, sessionToken]
        );
        session = { id: newSession.id, user_id: user.id };
      } else {
        const newUser = await db.insert(
          "INSERT INTO users (name, roll_number, session_token, game_status) VALUES ('Player', 'GUEST', $1, 'playing')",
          [sessionToken]
        );
        const newSession = await db.insert(
          "INSERT INTO game_sessions (user_id, session_token, game_status, started_at) VALUES ($1, $2, 'active', CURRENT_TIMESTAMP)",
          [newUser.id, sessionToken]
        );
        session = { id: newSession.id, user_id: newUser.id };
      }
    }

    res.json({
      success: true,
      sessionId: session.id,
      sessionToken: sessionToken,
      data: {
        sessionId: session.id,
        sessionToken: sessionToken
      }
    });

  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ success: false, error: 'Failed to start game' });
  }
});

/**
 * GET /api/quiz/question/:questionNumber
 * Get a random question for the current question number
 * Query params: ?language=python|c
 */
router.get('/question/:questionNumber', async (req, res) => {
  try {
    const { questionNumber } = req.params;
    const { language } = req.query;
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Session token required' 
      });
    }

    // Verify or auto-create/reactivate session
    let session = await db.getOne(
      'SELECT id, user_id FROM game_sessions WHERE session_token = $1',
      [sessionToken]
    );

    if (session) {
      await db.update(
        "UPDATE game_sessions SET game_status = 'active' WHERE id = $1 AND game_status != 'active'",
        [session.id]
      );
    } else {
      const user = await db.getOne('SELECT id FROM users WHERE session_token = $1 ORDER BY id DESC LIMIT 1', [sessionToken]);
      if (user) {
        const newSession = await db.insert(
          "INSERT INTO game_sessions (user_id, session_token, game_status, started_at) VALUES ($1, $2, 'active', CURRENT_TIMESTAMP)",
          [user.id, sessionToken]
        );
        session = { id: newSession.id, user_id: user.id };
      } else {
        const newUser = await db.insert(
          "INSERT INTO users (name, roll_number, session_token, game_status) VALUES ('Player', 'GUEST', $1, 'playing')",
          [sessionToken]
        );
        const newSession = await db.insert(
          "INSERT INTO game_sessions (user_id, session_token, game_status, started_at) VALUES ($1, $2, 'active', CURRENT_TIMESTAMP)",
          [newUser.id, sessionToken]
        );
        session = { id: newSession.id, user_id: newUser.id };
      }
    }

    // Get questions already answered in this session
    const answeredQuestions = await db.getAll(
      'SELECT question_id FROM player_answers WHERE session_id = $1',
      [session.id]
    );

    const answeredIds = answeredQuestions.map(a => a.question_id);

    // Build query to get question
    let query = 'SELECT * FROM questions WHERE is_active = true';
    const params = [];
    let paramIdx = 1;

    // Filter by language if specified
    if (language) {
      query += ` AND LOWER(language) = $${paramIdx++}`;
      params.push(language.toLowerCase());
    }

    // Exclude already answered questions in this session if possible
    if (answeredIds.length > 0) {
      const placeholders = answeredIds.map(() => `$${paramIdx++}`).join(',');
      query += ` AND id NOT IN (${placeholders})`;
      params.push(...answeredIds);
    }

    query += ' ORDER BY RANDOM() LIMIT 1';

    let question = await db.getOne(query, params);

    // Fallback 1: If all questions for that language were answered, pick any question of that language
    if (!question && language) {
      question = await db.getOne(
        'SELECT * FROM questions WHERE is_active = true AND LOWER(language) = $1 ORDER BY RANDOM() LIMIT 1',
        [language.toLowerCase()]
      );
    }

    // Fallback 2: Pick any active question from the database
    if (!question) {
      question = await db.getOne('SELECT * FROM questions WHERE is_active = true ORDER BY RANDOM() LIMIT 1');
    }

    if (!question) {
      return res.status(404).json({ 
        success: false,
        error: 'No questions available in database' 
      });
    }

    // Format response
    res.json({
      success: true,
      data: {
        questionNumber: parseInt(questionNumber),
        totalQuestions: 20,
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
          correctOption: question.correct_option
        }
      }
    });

  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get question' 
    });
  }
});

/**
 * POST /api/quiz/answer
 * Submit an answer
 */
router.post('/answer', async (req, res) => {
  try {
    const { questionId, selectedOption, timeTaken } = req.body;
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Session token required' 
      });
    }

    if (!questionId || !selectedOption) {
      return res.status(400).json({ 
        success: false,
        error: 'Question ID and selected option are required' 
      });
    }

    // Verify session
    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE session_token = $1 AND game_status = $2',
      [sessionToken, 'active']
    );

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Game session not found' 
      });
    }

    // Check if already answered
    const existing = await db.getOne(
      'SELECT id FROM player_answers WHERE session_id = $1 AND question_id = $2',
      [session.id, questionId]
    );

    if (existing) {
      return res.status(409).json({ 
        success: false,
        error: 'Question already answered' 
      });
    }

    // Get question
    const question = await db.getOne(
      'SELECT correct_option FROM questions WHERE id = $1',
      [questionId]
    );

    if (!question) {
      return res.status(404).json({ 
        success: false,
        error: 'Question not found' 
      });
    }

    const isCorrect = selectedOption === question.correct_option;
    const pointsAwarded = isCorrect ? 100 : 0;

    // Save answer
    await db.insert(
      `INSERT INTO player_answers (
        session_id, question_id, question_number, selected_option, 
        correct_option, is_correct, result_type, points_awarded, reading_time_taken
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        session.id, questionId, session.current_question_number, selectedOption,
        question.correct_option, isCorrect ? true : false, 
        isCorrect ? 'correct' : 'wrong', pointsAwarded, timeTaken || 0
      ]
    );

    // Update session
    const newScore = session.score + pointsAwarded;
    const newCorrect = session.correct_answers + (isCorrect ? 1 : 0);
    const newWrong = session.wrong_answers + (isCorrect ? 0 : 1);

    await db.update(
      'UPDATE game_sessions SET score = $1, correct_answers = $2, wrong_answers = $3 WHERE id = $4',
      [newScore, newCorrect, newWrong, session.id]
    );

    // Update user record
    await db.update(
      'UPDATE users SET score = $1, correct_answers = $2, wrong_answers = $3 WHERE id = $4',
      [newScore, newCorrect, newWrong, session.user_id]
    );

    // Broadcast real-time score update via WebSockets
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('score-updated', { userId: session.user_id, newScore });
      }
    } catch (ignored) {}

    res.json({
      success: true,
      isCorrect,
      correctOption: question.correct_option,
      pointsAwarded,
      totalScore: newScore,
      data: {
        isCorrect,
        correctOption: question.correct_option,
        pointsAwarded,
        totalScore: newScore
      },
      message: isCorrect ? 'Correct answer!' : 'Wrong answer'
    });

  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit answer' 
    });
  }
});

/**
 * POST /api/quiz/skip
 * Skip a question (border collision)
 */
router.post('/skip', async (req, res) => {
  try {
    const { questionId } = req.body;
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Session token required' 
      });
    }

    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE session_token = $1 AND game_status = $2',
      [sessionToken, 'active']
    );

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Game session not found' 
      });
    }

    // Check if already answered
    const existing = await db.getOne(
      'SELECT id FROM player_answers WHERE session_id = $1 AND question_id = $2',
      [session.id, questionId]
    );

    if (existing) {
      return res.status(409).json({ 
        success: false,
        error: 'Question already answered' 
      });
    }

    // Get question
    const question = await db.getOne(
      'SELECT correct_option FROM questions WHERE id = $1',
      [questionId]
    );

    if (question) {
      // Record as skipped
      await db.insert(
        `INSERT INTO player_answers (
          session_id, question_id, question_number, selected_option,
          correct_option, is_correct, result_type, points_awarded
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [session.id, questionId, session.current_question_number, null,
         question.correct_option, false, 'skipped', 0]
      );

      // Update session
      await db.update(
        'UPDATE game_sessions SET skipped_answers = skipped_answers + 1 WHERE id = $1',
        [session.id]
      );

      // Update user
      await db.update(
        'UPDATE users SET skipped_answers = skipped_answers + 1 WHERE id = $1',
        [session.user_id]
      );
    }

    res.json({ success: true, message: 'Question skipped' });

  } catch (error) {
    console.error('Skip question error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to skip question' 
    });
  }
});

/**
 * POST /api/quiz/complete
 * Complete the game
 */
router.post('/complete', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Session token required' 
      });
    }

    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE session_token = $1',
      [sessionToken]
    );

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Game session not found' 
      });
    }

    // Calculate real elapsed time in seconds
    const durationRow = await db.getOne(
      `SELECT CAST(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at)) AS INTEGER) as secs
       FROM game_sessions WHERE id = $1`,
      [session.id]
    );

    const reqSecs = req.body ? parseInt(req.body.totalTimeSeconds) : null;
    const finalSeconds = (!isNaN(reqSecs) && reqSecs > 0) ? reqSecs : (durationRow ? Math.max(1, durationRow.secs || 1) : 1);
    
    const mins = Math.floor(finalSeconds / 60);
    const secs = Math.floor(finalSeconds % 60);
    const formattedTime = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    // Update session
    await db.update(
      `UPDATE game_sessions 
       SET game_status = 'completed', 
           completed_at = CURRENT_TIMESTAMP 
       WHERE id = $1`,
      [session.id]
    );

    // Update user record with total_time_seconds and completion timestamp
    await db.update(
      `UPDATE users 
       SET game_status = 'completed', 
           completed_at = CURRENT_TIMESTAMP,
           total_time_seconds = $1
       WHERE id = $2`,
      [finalSeconds, session.user_id]
    );

    // Get final user stats
    const user = await db.getOne(
      'SELECT id, name, class, roll_number, score, correct_answers, wrong_answers, skipped_answers, total_time_seconds, completed_at, game_status FROM users WHERE id = $1',
      [session.user_id]
    );

    // Broadcast real-time Socket.io updates to Admin Dashboard
    try {
      const io = req.app.get('io');
      if (io) {
        const topPlayers = await db.getAll(
          `SELECT 
            id, name, class, roll_number, score, correct_answers, wrong_answers, 
            skipped_answers, total_time_seconds, completed_at, game_status
           FROM users 
           WHERE game_status = 'completed'
           ORDER BY score DESC, total_time_seconds ASC, completed_at ASC`
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
            rollNumber: player.roll_number,
            rank: index + 1,
            medal: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '',
            formatted_time: displayTime,
            formatted_date: player.completed_at ? new Date(player.completed_at).toLocaleString() : 'In Progress'
          };
        });

        io.emit('leaderboard-updated', leaderboardData);
        io.emit('leaderboard-data', leaderboardData);
        io.emit('score-updated', { userId: session.user_id, score: user.score });
        io.emit('player-completed', { ...user, totalTimeSeconds: finalSeconds, formattedTime });
      }
    } catch (wsErr) {
      console.warn('WebSocket broadcast notice:', wsErr.message);
    }

    res.json({
      success: true,
      message: 'Game completed successfully',
      user: {
        ...user,
        totalTimeSeconds: finalSeconds,
        formattedTime
      },
      stats: {
        totalTimeSeconds: finalSeconds,
        formattedTime
      }
    });

  } catch (error) {
    console.error('Complete game error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to complete game' 
    });
  }
});

/**
 * GET /api/quiz/stats
 * Get current game stats
 */
router.get('/stats', async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'];

    if (!sessionToken) {
      return res.status(401).json({ 
        success: false,
        error: 'Session token required' 
      });
    }

    const session = await db.getOne(
      'SELECT * FROM game_sessions WHERE session_token = $1',
      [sessionToken]
    );

    if (!session) {
      return res.status(404).json({ 
        success: false,
        error: 'Game session not found' 
      });
    }

    // Get answered count
    const answers = await db.getAll(
      'SELECT * FROM player_answers WHERE session_id = $1 ORDER BY answered_at',
      [session.id]
    );

    res.json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.game_status,
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
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to get stats' 
    });
  }
});

module.exports = router;
