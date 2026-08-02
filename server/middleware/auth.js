// Middleware to check if user is authenticated
const authenticateUser = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  next();
};

// Middleware to check if admin is authenticated
const authenticateAdmin = (req, res, next) => {
  if (!req.session.adminId || !req.session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

module.exports = {
  authenticateUser,
  authenticateAdmin,
};
