const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '../../snake_mcq.db');

// Open database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
    process.exit(1);
  }
  console.log('✓ Connected to SQLite database');
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Helper functions
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

async function initializeDatabase() {
  try {
    console.log('\n🚀 Initializing Snake MCQ Database (SQLite)...\n');

    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        roll_number TEXT NOT NULL UNIQUE,
        session_token TEXT UNIQUE,
        score INTEGER DEFAULT 0,
        total_questions INTEGER DEFAULT 0,
        correct_answers INTEGER DEFAULT 0,
        wrong_answers INTEGER DEFAULT 0,
        skipped_answers INTEGER DEFAULT 0,
        current_question INTEGER DEFAULT 0,
        game_status TEXT DEFAULT 'waiting',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Users table created');

    // Create admins table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Admins table created');

    // Create questions table
    await dbRun(`
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Questions table created');

    // Create game_sessions table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        current_question INTEGER DEFAULT 1,
        correct_answers INTEGER DEFAULT 0,
        wrong_answers INTEGER DEFAULT 0,
        skipped_answers INTEGER DEFAULT 0,
        status TEXT DEFAULT 'playing',
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Game sessions table created');

    // Create player_answers table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS player_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        selected_option TEXT NOT NULL,
        is_correct INTEGER DEFAULT 0,
        result_type TEXT DEFAULT 'skipped',
        answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
      )
    `);
    console.log('✓ Player answers table created');

    // Create indexes
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_score ON users(score DESC)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_users_game_status ON users(game_status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_questions_language ON questions(language)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_game_sessions_user_id ON game_sessions(user_id)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_game_sessions_status ON game_sessions(status)');
    await dbRun('CREATE INDEX IF NOT EXISTS idx_player_answers_session_id ON player_answers(session_id)');
    console.log('✓ Indexes created');

    // Check if admin exists
    const admin = await dbGet('SELECT * FROM admins WHERE username = ?', ['admin']);
    
    if (!admin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await dbRun(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    } else {
      console.log('✓ Admin user already exists');
    }

    // Check if sample questions exist
    const questionCount = await dbGet('SELECT COUNT(*) as count FROM questions');
    
    if (questionCount.count === 0) {
      const sampleQuestions = [
        // Python Questions
        {
          language: 'Python',
          question_text: 'Which keyword is used to define a function in Python?',
          option_a: 'def',
          option_b: 'function',
          option_c: 'fun',
          option_d: 'define',
          correct_option: 'A',
        },
        {
          language: 'Python',
          question_text: 'What is the output of print(type(5))?',
          option_a: "<class 'int'>",
          option_b: 'int',
          option_c: '5',
          option_d: 'number',
          correct_option: 'A',
        },
        {
          language: 'Python',
          question_text: 'Which method removes the last item from a list?',
          option_a: 'remove()',
          option_b: 'pop()',
          option_c: 'delete()',
          option_d: 'discard()',
          correct_option: 'B',
        },
        {
          language: 'Python',
          question_text: 'What does len([1,2,3]) return?',
          option_a: '0',
          option_b: '1',
          option_c: '3',
          option_d: '2',
          correct_option: 'C',
        },
        {
          language: 'Python',
          question_text: 'Which of these is NOT a valid variable name in Python?',
          option_a: '_var',
          option_b: 'var2',
          option_c: '2var',
          option_d: 'var_name',
          correct_option: 'C',
        },
        // C Questions
        {
          language: 'C',
          question_text: 'Which header file is used for input/output in C?',
          option_a: '#include <math.h>',
          option_b: '#include <stdio.h>',
          option_c: '#include <string.h>',
          option_d: '#include <stdlib.h>',
          correct_option: 'B',
        },
        {
          language: 'C',
          question_text: 'What is the size of int in most systems?',
          option_a: '1 byte',
          option_b: '2 bytes',
          option_c: '4 bytes',
          option_d: '8 bytes',
          correct_option: 'C',
        },
        {
          language: 'C',
          question_text: 'Which function is used to allocate memory in C?',
          option_a: 'allocate()',
          option_b: 'malloc()',
          option_c: 'alloc()',
          option_d: 'new()',
          correct_option: 'B',
        },
        {
          language: 'C',
          question_text: 'What does printf() return?',
          option_a: 'void',
          option_b: 'Number of characters printed',
          option_c: 'true/false',
          option_d: 'NULL',
          correct_option: 'B',
        },
        {
          language: 'C',
          question_text: 'Which operator is used to access a structure member?',
          option_a: '->',
          option_b: '::',
          option_c: '.',
          option_d: '&',
          correct_option: 'C',
        },
      ];

      for (const q of sampleQuestions) {
        await dbRun(
          `INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [q.language, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
        );
      }
      console.log('✓ Sample questions inserted (10 Python & C MCQs)');
    } else {
      console.log(`✓ Questions already exist (${questionCount.count} questions)`);
    }

    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('📊 Database Location:', dbPath);
    console.log('🔐 Admin Credentials: admin / admin123');
    console.log('❓ Sample Questions: 10 (Python & C)');
    
    db.close();
  } catch (error) {
    console.error('❌ Initialization error:', error.message);
    db.close();
    process.exit(1);
  }
}

initializeDatabase();
