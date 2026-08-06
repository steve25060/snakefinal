-- PostgreSQL Schema for Snake MCQ Challenge (Production-Ready)
-- Created: August 3, 2026

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(100),
  roll_number VARCHAR(50) NOT NULL,
  session_token VARCHAR(255),
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_answers INTEGER DEFAULT 0,
  game_status VARCHAR(20) DEFAULT 'waiting',
  total_time_seconds INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_roll_number ON users(roll_number);
CREATE INDEX idx_users_session_token ON users(session_token);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_by_status_and_time ON users(game_status, completed_at);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_username ON admin_users(username);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  language VARCHAR(20) NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  difficulty_level VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_language ON questions(language);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) NOT NULL UNIQUE,
  current_question_number INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_answers INTEGER DEFAULT 0,
  game_status VARCHAR(20) DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(game_status);
CREATE INDEX idx_game_sessions_session_token ON game_sessions(session_token);
CREATE INDEX idx_game_sessions_user_and_status ON game_sessions(user_id, game_status);

-- ============================================
-- PLAYER ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_answers (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  selected_option CHAR(1),
  correct_option CHAR(1) NOT NULL,
  is_correct BOOLEAN,
  result_type VARCHAR(50),
  points_awarded INTEGER DEFAULT 0,
  reading_time_taken INTEGER,
  reading_bonus_points INTEGER DEFAULT 0,
  snake_size_at_question INTEGER,
  snake_speed_at_question INTEGER,
  board_size_at_question INTEGER,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_answers_session_id ON player_answers(session_id);
CREATE INDEX idx_player_answers_question_id ON player_answers(question_id);
CREATE INDEX idx_player_answers_is_correct ON player_answers(is_correct);
CREATE INDEX idx_player_answers_by_result ON player_answers(session_id, is_correct);

-- ============================================
-- GAME STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_statistics (
  id SERIAL PRIMARY KEY,
  total_players INTEGER DEFAULT 0,
  completed_games INTEGER DEFAULT 0,
  active_games INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  total_questions_attempted INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_wrong_answers INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
INSERT INTO admin_users (id, username, password_hash, is_active)
VALUES (1, 'admin', '$2b$10$8E8xx1E1A.1D5Z5Z5Z5Z5eO3N8E1E1E1E1E1E1E1E1E1E1E1E1E1E1', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- INITIAL GAME STATISTICS
-- ============================================
INSERT INTO game_statistics (id) VALUES (1) ON CONFLICT DO NOTHING;
