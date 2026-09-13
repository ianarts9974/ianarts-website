const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

/**
 * Admin Login
 * Route: POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.'
      });
    }

    const admin = db.findAdminByUsernameOrEmail(username);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrative credentials.'
      });
    }

    // Generate JWT token valid for 7 days
    const token = jwt.sign(
      {
        id: admin.id,
        username: admin.username,
        email: admin.email
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome, Ian Kimemia.',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error occurred during login. Please try again.'
    });
  }
};

/**
 * Verify current token and return authenticated admin info
 * Route: GET /api/auth/verify
 */
exports.verify = (req, res) => {
  try {
    const admin = db.findAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    return res.status(200).json({
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email
      }
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error validating session.'
    });
  }
};

/**
 * Change admin password
 * Route: POST /api/auth/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are both required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const admin = db.findAdminById(req.admin.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin account not found.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password does not match.'
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    db.updateAdminPassword(admin.id, newHash);

    return res.status(200).json({
      success: true,
      message: 'Password successfully updated.'
    });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update password.'
    });
  }
};
