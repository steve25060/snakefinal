const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Generate JWT token for player
 */
function generatePlayerToken(userId, rollNumber) {
  return jwt.sign(
    {
      userId,
      rollNumber,
      type: 'player',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Generate JWT token for admin
 */
function generateAdminToken(adminId, username) {
  return jwt.sign(
    {
      adminId,
      username,
      type: 'admin',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Generate session token for game session
 */
function generateSessionToken() {
  return uuidv4();
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Verify admin token
 */
function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'admin') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Verify player token
 */
function verifyPlayerToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type !== 'player') {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

module.exports = {
  generatePlayerToken,
  generateAdminToken,
  generateSessionToken,
  verifyToken,
  verifyAdminToken,
  verifyPlayerToken,
  extractToken
};
