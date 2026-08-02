const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Use SQLite database
const dbPath = path.join(__dirname, '../../snake_mcq.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ SQLite connection error:', err.message);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create a pool-like wrapper for compatibility
class SQLitePool {
  async query(sql, params = []) {
    return new Promise((resolve, reject) => {
      // Handle SELECT queries
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve([rows || [], []]);
        });
      }
      // Handle INSERT queries
      else if (sql.trim().toUpperCase().startsWith('INSERT')) {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else {
            resolve([{
              insertId: this.lastID,
              affectedRows: this.changes
            }, []]);
          }
        });
      }
      // Handle UPDATE queries
      else if (sql.trim().toUpperCase().startsWith('UPDATE')) {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else {
            resolve([{
              affectedRows: this.changes,
              changedRows: this.changes
            }, []]);
          }
        });
      }
      // Handle DELETE queries
      else if (sql.trim().toUpperCase().startsWith('DELETE')) {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else {
            resolve([{
              affectedRows: this.changes
            }, []]);
          }
        });
      }
      // Handle other queries
      else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve([{ ok: true }, []]);
        });
      }
    });
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
