const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { requireAdmin } = require('../middleware/auth');

// Public contact form inquiry submission
router.post('/', inquiryController.createInquiry);

// Admin messages management (Protected)
router.get('/', requireAdmin, inquiryController.getInquiries);
router.patch('/:id', requireAdmin, inquiryController.updateInquiryStatus);
router.delete('/:id', requireAdmin, inquiryController.deleteInquiry);

module.exports = router;
