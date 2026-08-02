const db = require('./db');
const logger = require('./logger');

/**
 * Initialize database tables if they don't exist
 */
async function initializeDatabase() {
  try {
    console.log('\x1b[36m[DB-INIT]\x1b[0m Checking database tables...');
    
    // Check if users table exists
    const usersTableExists = await db.getOne(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'users'
      )
    `);
    
    if (!usersTableExists.exists) {
      console.log('\x1b[33m[DB-INIT]\x1b[0m Users table not found, creating...');
      
      await db.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          roll_number VARCHAR(50) NOT NULL UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_users_roll_number ON users(roll_number);
        CREATE INDEX idx_users_created_at ON users(created_at);
      `);
      
      console.log('\x1b[32m[DB-INIT]\x1b[0m Users table created successfully');
    } else {
      console.log('\x1b[32m[DB-INIT]\x1b[0m Users table exists');
    }
    
    // Check if questions table exists
    const questionsTableExists = await db.getOne(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'questions'
      )
    `);
    
    if (!questionsTableExists.exists) {
      console.log('\x1b[33m[DB-INIT]\x1b[0m Questions table not found, creating...');
      
      await db.query(`
        CREATE TABLE questions (
          id SERIAL PRIMARY KEY,
          language VARCHAR(20) NOT NULL,
          question_text TEXT NOT NULL,
          option_a VARCHAR(255) NOT NULL,
          option_b VARCHAR(255) NOT NULL,
          option_c VARCHAR(255) NOT NULL,
          option_d VARCHAR(255) NOT NULL,
          correct_option VARCHAR(1) NOT NULL,
          is_active BOOLEAN DEFAULT true,
          difficulty_level VARCHAR(20) DEFAULT 'medium',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_questions_language ON questions(language);
        CREATE INDEX idx_questions_is_active ON questions(is_active);
        CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);
      `);
      
      console.log('\x1b[32m[DB-INIT]\x1b[0m Questions table created successfully');
    } else {
      console.log('\x1b[32m[DB-INIT]\x1b[0m Questions table exists');
    }
    
    // Check if game_sessions table exists
    const gameSessionsTableExists = await db.getOne(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'game_sessions'
      )
    `);
    
    if (!gameSessionsTableExists.exists) {
      console.log('\x1b[33m[DB-INIT]\x1b[0m Game sessions table not found, creating...');
      
      await db.query(`
        CREATE TABLE game_sessions (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          session_token VARCHAR(500) NOT NULL UNIQUE,
          current_question_number INT DEFAULT 1,
          score INT DEFAULT 0,
          correct_answers INT DEFAULT 0,
          wrong_answers INT DEFAULT 0,
          skipped_answers INT DEFAULT 0,
          game_status VARCHAR(50) DEFAULT 'active',
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
        CREATE INDEX idx_game_sessions_status ON game_sessions(game_status);
        CREATE INDEX idx_game_sessions_session_token ON game_sessions(session_token);
      `);
      
      console.log('\x1b[32m[DB-INIT]\x1b[0m Game sessions table created successfully');
    } else {
      console.log('\x1b[32m[DB-INIT]\x1b[0m Game sessions table exists');
    }
    
    // Check if player_answers table exists
    const playerAnswersTableExists = await db.getOne(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'player_answers'
      )
    `);
    
    if (!playerAnswersTableExists.exists) {
      console.log('\x1b[33m[DB-INIT]\x1b[0m Player answers table not found, creating...');
      
      await db.query(`
        CREATE TABLE player_answers (
          id SERIAL PRIMARY KEY,
          session_id INT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
          question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
          question_number INT NOT NULL,
          selected_option VARCHAR(1),
          correct_option VARCHAR(1) NOT NULL,
          is_correct BOOLEAN,
          result_type VARCHAR(50),
          points_awarded INT DEFAULT 0,
          reading_time_taken INT,
          reading_bonus_points INT DEFAULT 0,
          snake_size_at_question INT,
          snake_speed_at_question INT,
          board_size_at_question INT,
          answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX idx_player_answers_session_id ON player_answers(session_id);
        CREATE INDEX idx_player_answers_question_id ON player_answers(question_id);
        CREATE INDEX idx_player_answers_is_correct ON player_answers(is_correct);
      `);
      
      console.log('\x1b[32m[DB-INIT]\x1b[0m Player answers table created successfully');
    } else {
      console.log('\x1b[32m[DB-INIT]\x1b[0m Player answers table exists');
    }
    
    console.log('\x1b[32m[DB-INIT]\x1b[0m Database initialization complete!\n');
    
  } catch (error) {
    console.error('\x1b[31m[DB-INIT ERROR]\x1b[0m', error.message);
    logger.error('Database initialization failed:', { error: error.message });
  }
}

module.exports = { initializeDatabase };
