const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to SQLite database
const dbPath = path.join(__dirname, '../../snake_mcq.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  } else {
    console.log('✓ Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Promisify db methods for easier use
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
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

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Create a query wrapper that mimics mysql2/promise interface
const query = async (sql, params = []) => {
  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await dbAll(sql, params);
      return [rows, []];
    } else if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const result = await dbRun(sql, params);
      return [{ insertId: result.id, affectedRows: result.changes }, []];
    } else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
      const result = await dbRun(sql, params);
      return [{ affectedRows: result.changes }, []];
    } else if (sql.trim().toUpperCase().startsWith('DELETE')) {
      const result = await dbRun(sql, params);
      return [{ affectedRows: result.changes }, []];
    } else {
      await dbRun(sql, params);
      return [{ ok: true }, []];
    }
  } catch (error) {
    throw error;
  }
};

// Create connection pool object that mimics mysql2/promise
class SQLitePool {
  async query(sql, params = []) {
    return query(sql, params);
  }

  async end() {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = new SQLitePool();
