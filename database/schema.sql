-- Create database
CREATE DATABASE snake_mcq;

-- Connect to database
\c snake_mcq;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  class VARCHAR(50) NOT NULL,
  roll_number VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_roll_number ON users(roll_number);
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE admin_users (
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
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  language VARCHAR(20) NOT NULL, -- 'Python' or 'C'
  question_text TEXT NOT NULL,
  option_a VARCHAR(255) NOT NULL,
  option_b VARCHAR(255) NOT NULL,
  option_c VARCHAR(255) NOT NULL,
  option_d VARCHAR(255) NOT NULL,
  correct_option VARCHAR(1) NOT NULL, -- 'A', 'B', 'C', or 'D'
  is_active BOOLEAN DEFAULT true,
  difficulty_level VARCHAR(20) DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_language ON questions(language);
CREATE INDEX idx_questions_is_active ON questions(is_active);
CREATE INDEX idx_questions_difficulty ON questions(difficulty_level);

-- ============================================
-- GAME SESSIONS TABLE
-- ============================================
CREATE TABLE game_sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(500) NOT NULL UNIQUE,
  current_question_number INT DEFAULT 1,
  score INT DEFAULT 0,
  correct_answers INT DEFAULT 0,
  wrong_answers INT DEFAULT 0,
  skipped_answers INT DEFAULT 0,
  game_status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'abandoned'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(game_status);
CREATE INDEX idx_game_sessions_session_token ON game_sessions(session_token);

-- ============================================
-- PLAYER ANSWERS TABLE
-- ============================================
CREATE TABLE player_answers (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
  question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_number INT NOT NULL,
  selected_option VARCHAR(1),
  correct_option VARCHAR(1) NOT NULL,
  is_correct BOOLEAN,
  result_type VARCHAR(50), -- 'correct', 'wrong', 'border_collision', 'timeout', 'skipped'
  points_awarded INT DEFAULT 0,
  reading_time_taken INT, -- in seconds
  reading_bonus_points INT DEFAULT 0,
  snake_size_at_question INT,
  snake_speed_at_question INT,
  board_size_at_question INT,
  answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_player_answers_session_id ON player_answers(session_id);
CREATE INDEX idx_player_answers_question_id ON player_answers(question_id);
CREATE INDEX idx_player_answers_is_correct ON player_answers(is_correct);

-- ============================================
-- LEADERBOARD VIEW
-- ============================================
CREATE VIEW leaderboard AS
SELECT 
  u.id,
  u.name,
  u.roll_number,
  gs.score,
  gs.correct_answers,
  gs.wrong_answers,
  gs.skipped_answers,
  COUNT(CASE WHEN pa.is_correct = true THEN 1 END) as total_correct,
  gs.completed_at,
  ROW_NUMBER() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank
FROM users u
JOIN game_sessions gs ON u.id = gs.user_id
LEFT JOIN player_answers pa ON gs.id = pa.session_id
WHERE gs.game_status = 'completed'
GROUP BY u.id, u.name, u.roll_number, gs.score, gs.correct_answers, gs.wrong_answers, gs.skipped_answers, gs.completed_at
ORDER BY gs.score DESC, gs.completed_at ASC;

-- ============================================
-- GAME STATISTICS TABLE
-- ============================================
CREATE TABLE game_statistics (
  id SERIAL PRIMARY KEY,
  total_players INT DEFAULT 0,
  completed_games INT DEFAULT 0,
  active_games INT DEFAULT 0,
  average_score DECIMAL(10, 2) DEFAULT 0,
  highest_score INT DEFAULT 0,
  total_questions_attempted INT DEFAULT 0,
  total_correct_answers INT DEFAULT 0,
  total_wrong_answers INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERT DEFAULT ADMIN USER
-- ============================================
-- Password: admin123 (bcrypt hash)
INSERT INTO admin_users (username, password_hash)
VALUES ('admin', '$2b$10$E8Xx1E1A.1D5Z5Z5Z5Z5eO3N8E1E1E1E1E1E1E1E1E1E1E1E1E1E1');

-- Create a few sample questions (will be expanded)
INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty_level)
VALUES 
('Python', 'Which keyword is used to define a function in Python?', 'def', 'function', 'fun', 'define', 'A', 'easy'),
('C', 'Which header file is used for input/output operations in C?', '#include <stdio.h>', '#include <stdlib.h>', '#include <string.h>', '#include <math.h>', 'A', 'easy'),
('Python', 'What is the correct syntax for a while loop in Python?', 'while x > 0:', 'while (x > 0)', 'do while x > 0', 'loop x > 0:', 'A', 'easy'),
('C', 'What does the printf function do in C?', 'Prints formatted output', 'Reads input', 'Allocates memory', 'Frees memory', 'A', 'easy'),
('Python', 'How do you create a list in Python?', 'my_list = []', 'my_list = {}', 'my_list = ()', 'my_list = <>', 'A', 'easy');

-- ============================================
-- TRIGGERS FOR TIMESTAMP UPDATES
-- ============================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_admin_users_timestamp
BEFORE UPDATE ON admin_users
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_questions_timestamp
BEFORE UPDATE ON questions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_game_sessions_timestamp
BEFORE UPDATE ON game_sessions
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ============================================
-- INITIAL GAME STATISTICS
-- ============================================
INSERT INTO game_statistics DEFAULT VALUES;

COMMIT;
