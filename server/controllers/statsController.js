const db = require('../config/db');

/**
 * Get aggregated statistics for the Admin Dashboard
 * Route: GET /api/stats
 */
exports.getDashboardStats = (req, res) => {
  try {
    const stats = db.getStats();

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve dashboard statistics.'
    });
  }
};
