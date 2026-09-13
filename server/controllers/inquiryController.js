const db = require('../config/db');

/**
 * Submit a customer inquiry / purchase interest from the frontend contact form
 * Route: POST /api/inquiries
 */
exports.createInquiry = (req, res) => {
  try {
    const { name, email, phone, subject, message, artwork_id } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Your name is required.'
      });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required.'
      });
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject line is required.'
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message body cannot be empty.'
      });
    }

    let artworkTitle = '';
    if (artwork_id) {
      const art = db.getArtworkById(artwork_id);
      if (art) {
        artworkTitle = art.title;
      }
    }

    const inquiry = db.createInquiry({
      artwork_id: artwork_id || null,
      artwork_title: artworkTitle,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      subject: subject.trim(),
      message: message.trim()
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! Ian Kimemia will respond to your inquiry shortly.',
      data: inquiry
    });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to submit your message at this time. Please try again or reach out via WhatsApp.'
    });
  }
};

/**
 * Get all submitted inquiries (Admin only)
 * Route: GET /api/inquiries
 */
exports.getInquiries = (req, res) => {
  try {
    const { status } = req.query;
    const inquiries = db.getInquiries({ status });

    return res.status(200).json({
      success: true,
      count: inquiries.length,
      data: inquiries
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve inquiries.'
    });
  }
};

/**
 * Update an inquiry's status (new, read, replied) (Admin only)
 * Route: PATCH /api/inquiries/:id
 */
exports.updateInquiryStatus = (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['new', 'read', 'replied'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}.`
      });
    }

    const updated = db.updateInquiryStatus(id, status);
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Inquiry #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: `Inquiry status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update inquiry status.'
    });
  }
};

/**
 * Delete an inquiry (Admin only)
 * Route: DELETE /api/inquiries/:id
 */
exports.deleteInquiry = (req, res) => {
  try {
    const { id } = req.params;
    const deleted = db.deleteInquiry(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Inquiry #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Inquiry successfully deleted.'
    });
  } catch (error) {
    console.error('Error deleting inquiry:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete inquiry.'
    });
  }
};
