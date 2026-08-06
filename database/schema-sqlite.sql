-- SQLite Schema for Snake MCQ Challenge
-- Note: SQLite doesn't support SERIAL, use INTEGER PRIMARY KEY AUTOINCREMENT

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  class TEXT,
  roll_number TEXT NOT NULL,
  session_token TEXT,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_answers INTEGER DEFAULT 0,
  game_status TEXT DEFAULT 'waiting',
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_username ON admin_users(username);

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  language TEXT NOT NULL, -- 'python' or 'c'
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'A', 'B', 'C', or 'D'
  is_active INTEGER DEFAULT 1,
  difficulty_level TEXT DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(language);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty_level);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  current_question_number INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  wrong_answers INTEGER DEFAULT 0,
  skipped_answers INTEGER DEFAULT 0,
  game_status TEXT DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(game_status);
CREATE INDEX IF NOT EXISTS idx_game_sessions_session_token ON game_sessions(session_token);

-- ============================================
-- PLAYER ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS player_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  question_id INTEGER NOT NULL,
  question_number INTEGER NOT NULL,
  selected_option TEXT,
  correct_option TEXT NOT NULL,
  is_correct INTEGER,
  result_type TEXT, -- 'correct', 'wrong', 'border_collision', 'timeout', 'skipped'
  points_awarded INTEGER DEFAULT 0,
  reading_time_taken INTEGER, -- in seconds
  reading_bonus_points INTEGER DEFAULT 0,
  snake_size_at_question INTEGER,
  snake_speed_at_question INTEGER,
  board_size_at_question INTEGER,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_player_answers_session_id ON player_answers(session_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_question_id ON player_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_player_answers_is_correct ON player_answers(is_correct);

-- ============================================
-- PERFORMANCE INDEXES FOR 200+ PLAYERS (ADDED)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_game_sessions_user_and_status 
  ON game_sessions(user_id, game_status);

CREATE INDEX IF NOT EXISTS idx_player_answers_by_result 
  ON player_answers(session_id, is_correct);

CREATE INDEX IF NOT EXISTS idx_users_by_status_and_time
  ON users(game_status, completed_at);

-- ============================================
-- GAME STATISTICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS game_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  total_players INTEGER DEFAULT 0,
  completed_games INTEGER DEFAULT 0,
  active_games INTEGER DEFAULT 0,
  average_score REAL DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  total_questions_attempted INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_wrong_answers INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hash - $2b$10$abcdefgh...)
INSERT OR IGNORE INTO admin_users (id, username, password_hash)
VALUES (1, 'admin', '$2b$10$8E8xx1E1A.1D5Z5Z5Z5Z5eO3N8E1E1E1E1E1E1E1E1E1E1E1E1E1E1');

-- ============================================
-- INITIAL GAME STATISTICS
-- ============================================
INSERT OR IGNORE INTO game_statistics (id) VALUES (1);
