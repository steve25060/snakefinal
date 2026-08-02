const fs = require('fs');
const path = require('path');

const LOG_LEVEL = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const CURRENT_LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const logFile = path.join(__dirname, '../logs/app.log');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Format log message
 */
function formatLog(level, message, data = {}) {
  const timestamp = new Date().toISOString();
  const dataStr = Object.keys(data).length > 0 ? JSON.stringify(data) : '';
  return `[${timestamp}] [${level}] ${message} ${dataStr}`;
}

/**
 * Write log to file
 */
function writeLog(message) {
  try {
    fs.appendFileSync(logFile, message + '\n');
  } catch (error) {
    console.error('Error writing to log file:', error);
  }
}

/**
 * Log error
 */
function error(message, data = {}) {
  const logMessage = formatLog(LOG_LEVEL.ERROR, message, data);
  console.error(logMessage);
  writeLog(logMessage);
}

/**
 * Log warning
 */
function warn(message, data = {}) {
  const logMessage = formatLog(LOG_LEVEL.WARN, message, data);
  console.warn(logMessage);
  writeLog(logMessage);
}

/**
 * Log info
 */
function info(message, data = {}) {
  const logMessage = formatLog(LOG_LEVEL.INFO, message, data);
  console.log(logMessage);
  writeLog(logMessage);
}

/**
 * Log debug
 */
function debug(message, data = {}) {
  if (CURRENT_LOG_LEVEL === 'debug') {
    const logMessage = formatLog(LOG_LEVEL.DEBUG, message, data);
    console.log(logMessage);
    writeLog(logMessage);
  }
}

module.exports = {
  error,
  warn,
  info,
  debug
};
