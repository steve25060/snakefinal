const mysql = require('mysql2/promise');
const config = require('../config/config');

async function initializeDatabase() {
  const connection = await mysql.createConnection({
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
  });

  try {
    // Create database
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.db.database}`);
    console.log('✓ Database created');

    // Switch to the database
    await connection.execute(`USE ${config.db.database}`);

    // Create users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(100) NOT NULL UNIQUE,
        session_token VARCHAR(255) UNIQUE,
        score INT DEFAULT 0,
        total_questions INT DEFAULT 0,
        correct_answers INT DEFAULT 0,
        wrong_answers INT DEFAULT 0,
        skipped_answers INT DEFAULT 0,
        current_question INT DEFAULT 0,
        game_status ENUM('waiting', 'playing', 'completed') DEFAULT 'waiting',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_roll_number (roll_number),
        INDEX idx_score (score),
        INDEX idx_game_status (game_status)
      )
    `);
    console.log('✓ Users table created');

    // Create admins table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS admins (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Admins table created');

    // Create questions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        language ENUM('Python', 'C') NOT NULL,
        question_text TEXT NOT NULL,
        option_a VARCHAR(255) NOT NULL,
        option_b VARCHAR(255) NOT NULL,
        option_c VARCHAR(255) NOT NULL,
        option_d VARCHAR(255) NOT NULL,
        correct_option ENUM('A', 'B', 'C', 'D') NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_language (language),
        INDEX idx_is_active (is_active)
      )
    `);
    console.log('✓ Questions table created');

    // Create game_sessions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        score INT DEFAULT 0,
        current_question INT DEFAULT 1,
        correct_answers INT DEFAULT 0,
        wrong_answers INT DEFAULT 0,
        skipped_answers INT DEFAULT 0,
        status ENUM('playing', 'completed', 'abandoned') DEFAULT 'playing',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_completed_at (completed_at)
      )
    `);
    console.log('✓ Game sessions table created');

    // Create player_answers table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS player_answers (
        id INT PRIMARY KEY AUTO_INCREMENT,
        session_id INT NOT NULL,
        question_id INT NOT NULL,
        selected_option ENUM('A', 'B', 'C', 'D') NOT NULL,
        is_correct BOOLEAN DEFAULT 0,
        result_type ENUM('correct', 'wrong', 'skipped') DEFAULT 'skipped',
        answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (session_id) REFERENCES game_sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
        INDEX idx_session_id (session_id),
        INDEX idx_question_id (question_id)
      )
    `);
    console.log('✓ Player answers table created');

    // Create leaderboard view
    await connection.execute(`
      CREATE OR REPLACE VIEW leaderboard AS
      SELECT 
        u.id,
        u.name,
        u.roll_number,
        u.score,
        u.correct_answers,
        u.wrong_answers,
        u.skipped_answers,
        u.game_status,
        u.completed_at,
        RANK() OVER (ORDER BY u.score DESC, u.completed_at ASC) as rank
      FROM users u
      WHERE u.game_status = 'completed'
      ORDER BY u.score DESC, u.completed_at ASC
    `);
    console.log('✓ Leaderboard view created');

    // Check if admin exists
    const [admins] = await connection.execute('SELECT * FROM admins WHERE username = ?', ['admin']);
    
    if (admins.length === 0) {
      // Hash default admin password
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await connection.execute(
        'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
        ['admin', hashedPassword]
      );
      console.log('✓ Default admin user created (username: admin, password: admin123)');
    }

    // Insert sample questions
    const [existingQuestions] = await connection.execute('SELECT COUNT(*) as count FROM questions');
    
    if (existingQuestions[0].count === 0) {
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
          option_a: '&lt;class \'int\'&gt;',
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
          option_a: '#include &lt;math.h&gt;',
          option_b: '#include &lt;stdio.h&gt;',
          option_c: '#include &lt;string.h&gt;',
          option_d: '#include &lt;stdlib.h&gt;',
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
        await connection.execute(
          `INSERT INTO questions (language, question_text, option_a, option_b, option_c, option_d, correct_option, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
          [q.language, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
        );
      }
      console.log('✓ Sample questions inserted');
    }

    console.log('\n✅ Database initialization completed successfully!\n');
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
  } finally {
    await connection.end();
  }
}

// Run initialization
initializeDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
