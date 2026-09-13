const express = require('express');
const router = express.Router();
const artworkController = require('../controllers/artworkController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public catalog routes
router.get('/', artworkController.getArtworks);
router.get('/:id', artworkController.getArtworkById);

// Admin inventory management routes (Protected)
router.post('/', requireAdmin, upload.single('image'), artworkController.createArtwork);
router.put('/:id', requireAdmin, upload.single('image'), artworkController.updateArtwork);
router.delete('/:id', requireAdmin, artworkController.deleteArtwork);

module.exports = router;
