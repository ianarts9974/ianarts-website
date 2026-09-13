const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'ian_kimemia_default_secure_secret_2026';

/**
 * Middleware to authenticate requests to admin routes using JWT
 */
const requireAdmin = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No authorization token provided.'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach admin info to request
    req.admin = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please sign in again.'
      });
    }
    return res.status(403).json({
      success: false,
      message: 'Invalid or forged authentication token.'
    });
  }
};

module.exports = {
  requireAdmin,
  JWT_SECRET
};
