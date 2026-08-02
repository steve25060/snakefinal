const tokenUtils = require('../utils/token');
const logger = require('../utils/logger');

/**
 * Middleware to verify player token
 */
function verifyPlayerAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = tokenUtils.extractToken(authHeader);
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = tokenUtils.verifyPlayerToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Player auth verification error:', { error: error.message });
    res.status(401).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware to verify admin token
 */
function verifyAdminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = tokenUtils.extractToken(authHeader);
    
    if (!token) {
      return res.status(401).json({ error: 'No admin token provided' });
    }
    
    const decoded = tokenUtils.verifyAdminToken(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired admin token' });
    }
    
    req.admin = decoded;
    next();
  } catch (error) {
    logger.error('Admin auth verification error:', { error: error.message });
    res.status(401).json({ error: 'Admin authentication failed' });
  }
}

/**
 * Middleware to verify session token
 */
function verifySessionToken(req, res, next) {
  try {
    const sessionToken = req.headers['x-session-token'] || req.query.sessionToken;
    
    if (!sessionToken) {
      return res.status(401).json({ error: 'No session token provided' });
    }
    
    // Session token validation will be done with database query
    req.sessionToken = sessionToken;
    next();
  } catch (error) {
    logger.error('Session token verification error:', { error: error.message });
    res.status(401).json({ error: 'Session verification failed' });
  }
}

module.exports = {
  verifyPlayerAuth,
  verifyAdminAuth,
  verifySessionToken
};
