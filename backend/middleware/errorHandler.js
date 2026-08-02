const logger = require('../utils/logger');

/**
 * Global error handler middleware
 */
function errorHandler(err, req, res, next) {
  const timestamp = new Date().toISOString();
  const errorId = Math.random().toString(36).substring(7).toUpperCase();
  
  console.error('\x1b[41m\x1b[37m  ERROR  \x1b[0m \x1b[31m[ID: ' + errorId + ']\x1b[0m');
  console.error(`  ├─ Time: ${timestamp}`);
  console.error(`  ├─ Message: ${err.message}`);
  console.error(`  ├─ Code: ${err.code || 'N/A'}`);
  console.error(`  ├─ Path: ${req.method} ${req.path}`);
  console.error(`  ├─ IP: ${req.ip}`);
  
  if (err.stack) {
    const stackLines = err.stack.split('\n').slice(0, 3);
    console.error(`  ├─ Stack:`);
    stackLines.forEach((line, i) => {
      const prefix = i === stackLines.length - 1 ? '  └─' : '  ├─';
      console.error(`  ${prefix}   ${line.trim()}`);
    });
  }
  
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    errorId: errorId
  });
  
  // Database connection error
  if (err.code === 'ECONNREFUSED') {
    console.error('  └─ Type: Database Connection Failed');
    return res.status(503).json({
      error: 'Database connection error',
      message: 'The service is temporarily unavailable',
      errorId: errorId
    });
  }
  
  // Validation error
  if (err.name === 'ValidationError') {
    console.error('  └─ Type: Validation Error');
    return res.status(400).json({
      error: 'Validation error',
      message: err.message,
      errorId: errorId
    });
  }
  
  // Authentication error
  if (err.name === 'UnauthorizedError') {
    console.error('  └─ Type: Unauthorized');
    return res.status(401).json({
      error: 'Unauthorized',
      message: err.message,
      errorId: errorId
    });
  }
  
  // JSON parse error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('  └─ Type: JSON Parse Error');
    return res.status(400).json({
      error: 'Invalid JSON',
      message: 'Request body is not valid JSON',
      errorId: errorId
    });
  }
  
  // Default error response
  console.error('  └─ Type: Internal Server Error');
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred',
    errorId: errorId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
