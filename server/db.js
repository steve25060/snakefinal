const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file path
const DB_PATH = path.join(__dirname, '../snake_mcq.db');

// Create database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
    process.exit(1);
  }
  console.log('✅ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database with schema and questions
 */
async function initializeDatabase() {
  return new Promise(async (resolve, reject) => {
    try {
      // Check if tables exist
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", async (err, row) => {
        if (err) {
          reject(err);
          return;
        }

        // If tables don't exist, create them
        if (!row) {
          console.log('📦 Initializing database schema...');
          
          try {
            // Enable foreign keys
            await runQuery('PRAGMA foreign_keys = ON');
            
            // Create tables directly
            await runQuery(`
              CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                class TEXT,
                roll_number TEXT NOT NULL UNIQUE,
                session_token TEXT,
                score INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                wrong_answers INTEGER DEFAULT 0,
                skipped_answers INTEGER DEFAULT 0,
                total_time_seconds INTEGER DEFAULT 0,
                game_status TEXT DEFAULT 'waiting',
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `);

            // Migration check: add total_time_seconds column if missing in existing table
            try {
              await runQuery(`ALTER TABLE users ADD COLUMN total_time_seconds INTEGER DEFAULT 0`);
            } catch (ignored) {}
            
            await runQuery(`
              CREATE TABLE IF NOT EXISTS admin_users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_login DATETIME,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `);
            
            await runQuery(`
              CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                language TEXT NOT NULL,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_option TEXT NOT NULL,
                is_active INTEGER DEFAULT 1,
                difficulty_level TEXT DEFAULT 'medium',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
              )
            `);
            
            await runQuery(`
              CREATE TABLE IF NOT EXISTS game_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                session_token TEXT NOT NULL UNIQUE,
                current_question_number INTEGER DEFAULT 1,
                score INTEGER DEFAULT 0,
                correct_answers INTEGER DEFAULT 0,
                wrong_answers INTEGER DEFAULT 0,
                skipped_answers INTEGER DEFAULT 0,
                game_status TEXT DEFAULT 'active',
                started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                completed_at DATETIME,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )
            `);
            
            await runQuery(`
              CREATE TABLE IF NOT EXISTS player_answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                question_id INTEGER NOT NULL,
                question_number INTEGER NOT NULL,
                selected_option TEXT,
                correct_option TEXT NOT NULL,
                is_correct INTEGER,
                result_type TEXT,
                points_awarded INTEGER DEFAULT 0,
                reading_time_taken INTEGER,
                reading_bonus_points INTEGER DEFAULT 0,
                snake_size_at_question INTEGER,
                snake_speed_at_question INTEGER,
                board_size_at_question INTEGER,
                answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
                FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
              )
            `);
            
            await runQuery(`
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
              )
            `);
            
            // Insert default admin
            await runQuery(`
              INSERT OR IGNORE INTO admin_users (id, username, password_hash)
              VALUES (1, 'admin', '$2b$10$8E8xx1E1A.1D5Z5Z5Z5Z5eO3N8E1E1E1E1E1E1E1E1E1E1E1E1E1E1')
            `);
            
            // Insert default stats record
            await runQuery(`INSERT OR IGNORE INTO game_statistics (id) VALUES (1)`);
            
            console.log('✅ Schema created');
            
            // Load questions from file
            console.log('📝 Loading questions...');
            const questionsPath = path.join(__dirname, '../database/questions-complete.sql');
            if (fs.existsSync(questionsPath)) {
              const questionsFile = fs.readFileSync(questionsPath, 'utf8');
              await new Promise((res) => {
                db.exec(questionsFile, (execErr) => {
                  if (execErr) {
                    console.log('⚠️ Questions loading notice:', execErr.message);
                  } else {
                    console.log('✅ Questions loaded successfully');
                  }
                  res();
                });
              });
            } else {
              console.log('⚠️ Questions file not found');
            }
            
          } catch (error) {
            console.error('Database initialization error:', error);
            reject(error);
            return;
          }
        } else {
          console.log('✅ Database already initialized');
        }
        
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Helper to run a query with promise
 */
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

/**
 * Helper to get a single row
 */
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

/**
 * Helper to get all rows
 */
function getAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}

/**
 * Helper for INSERT queries - returns lastID
 */
function insert(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Helper for UPDATE queries - returns changes
 */
function update(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes });
    });
  });
}

module.exports = {
  db,
  initializeDatabase,
  runQuery,
  getOne,
  getAll,
  insert,
  update
};
