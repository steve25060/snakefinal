const { Pool } = require('pg');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

console.log('🔍 PostgreSQL Configuration:');
if (dbUrl) {
  console.log('  Using DATABASE_URL connection string');
} else {
  console.log('  Host:', process.env.DB_HOST);
  console.log('  Port:', process.env.DB_PORT);
  console.log('  Database:', process.env.DB_NAME);
  console.log('  User:', process.env.DB_USER);
}

// Create PostgreSQL connection pool with explicit options or connectionString
const poolConfig = dbUrl ? {
  connectionString: dbUrl,
  ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
} : {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'snake_mcq_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  ssl: (process.env.PGSSLMODE === 'require' || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : false,
  max: parseInt(process.env.DB_POOL_MAX || '50', 10),
  min: parseInt(process.env.DB_POOL_MIN || '5', 10),
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
};

const pool = new Pool(poolConfig);

// Connection error handling
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ PostgreSQL connection failed:', err.message);
  } else {
    console.log('✅ PostgreSQL connected successfully');
    console.log(`🐘 Database: ${process.env.DB_NAME || 'snake_mcq_game'}`);
  }
});

/**
 * Helper to convert '?' parameter placeholders to PostgreSQL '$1', '$2', ... format
 */
function convertPlaceholders(sql) {
  if (!sql || typeof sql !== 'string') return sql;
  if (sql.includes('?')) {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
  }
  return sql;
}

/**
 * Execute a query
 */
async function query(text, params = []) {
  const start = Date.now();
  let client;
  const formattedText = convertPlaceholders(text);
  
  try {
    client = await pool.connect();
    const result = await client.query(formattedText, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️  SLOW QUERY (${duration}ms):`, formattedText.substring(0, 50) + '...');
    }
    
    return result;
  } catch (error) {
    console.error('Query error:', error.message, 'SQL:', formattedText);
    throw error;
  } finally {
    if (client) client.release();
  }
}

/**
 * Get one row
 */
async function getOne(text, params = []) {
  const result = await query(text, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Get all rows
 */
async function getAll(text, params = []) {
  const result = await query(text, params);
  return result.rows;
}

/**
 * Insert and return ID
 */
async function insert(text, params = []) {
  let sql = convertPlaceholders(text);
  if (/^\s*INSERT\s+INTO/i.test(sql) && !/RETURNING/i.test(sql)) {
    sql = sql.trim().replace(/;$/, '') + ' RETURNING id';
  }
  const result = await query(sql, params);
  const row = (result.rows && result.rows[0]) ? result.rows[0] : {};
  return {
    ...row,
    id: row.id,
    lastID: row.id
  };
}

/**
 * Update
 */
async function update(text, params = []) {
  const result = await query(text, params);
  return result;
}

/**
 * Run raw query
 */
async function runQuery(text, params = []) {
  return query(text, params);
}

/**
 * Initialize database - create schema if needed
 */
async function initializeDatabase() {
  try {
    const fs = require('fs');
    // Check if tables exist
    const result = await pool.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') as exists"
    );
    
    const tableExists = result.rows[0]?.exists;
    
    if (!tableExists) {
      console.log('📦 Creating database schema...');
      const schema = fs.readFileSync(
        path.join(__dirname, '../database/schema-postgresql.sql'),
        'utf8'
      );
      await pool.query(schema);
      console.log('✅ Database schema created');
    } else {
      console.log('✅ Database schema already exists');
    }

    // Sync questions if database has no questions or if questions need updating to balanced A-D options
    const qCountRes = await pool.query('SELECT COUNT(*) as count FROM questions');
    const aOnlyRes = await pool.query("SELECT COUNT(*) as count FROM questions WHERE correct_option = 'A'");
    const totalQ = parseInt(qCountRes.rows[0]?.count || '0', 10);
    const totalA = parseInt(aOnlyRes.rows[0]?.count || '0', 10);

    console.log('🌱 Forcing reseed of 40 official questions from questions-complete.sql...');
    const seedSqlPath = path.join(__dirname, '../database/questions-complete.sql');
    if (fs.existsSync(seedSqlPath)) {
      const seedSql = fs.readFileSync(seedSqlPath, 'utf8');
      await pool.query('TRUNCATE TABLE questions RESTART IDENTITY CASCADE;');
      await pool.query(seedSql);
      console.log('✅ 40 Official questions successfully loaded into database');
    }
    
    return true;
  } catch (error) {
    console.error('⚠️  PostgreSQL initialization warning:', error.message);
    throw error;
  }
}

module.exports = {
  query,
  getOne,
  getAll,
  insert,
  update,
  runQuery,
  initializeDatabase,
  pool
};
