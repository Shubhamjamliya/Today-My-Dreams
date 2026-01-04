const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const verified = jwt.verify(token, jwtSecret);

    // Check if token has required admin properties
    if (!verified.isAdmin && !verified.role) {
      return res.status(403).json({ message: 'Invalid token type. Admin token required.' });
    }

    req.user = verified;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: 'Your session has expired. Please log in again.',
        error: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid authentication token. Please log in again.',
        error: 'INVALID_TOKEN'
      });
    }

    res.status(401).json({ message: 'Authentication failed. Please log in again.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.isAdmin === true || req.user.role === 'admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
};

// Combined middleware for admin authentication
const auth = (req, res, next) => {
  authenticateToken(req, res, (err) => {
    if (err) return next(err);
    isAdmin(req, res, next);
  });
};

module.exports = {
  authenticateToken,
  isAdmin,
  auth
}; 