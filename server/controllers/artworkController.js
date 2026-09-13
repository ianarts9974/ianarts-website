const path = require('path');
const fs = require('fs');
const db = require('../config/db');

const ALLOWED_CATEGORIES = ['Charcoal', 'Paints', 'Animes'];
const ALLOWED_STATUSES = ['Available', 'Reserved', 'Sold'];

/**
 * Get all artworks with optional filtering, search, and sorting
 * Route: GET /api/artworks
 */
exports.getArtworks = (req, res) => {
  try {
    const { category, search, featured, status, sort } = req.query;

    const artworks = db.getArtworks({
      category,
      search,
      featured,
      status,
      sort
    });

    return res.status(200).json({
      success: true,
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve artwork catalog.'
    });
  }
};

/**
 * Get single artwork by ID
 * Route: GET /api/artworks/:id
 */
exports.getArtworkById = (req, res) => {
  try {
    const { id } = req.params;
    const artwork = db.getArtworkById(id);

    if (!artwork) {
      return res.status(404).json({
        success: false,
        message: `Artwork with ID #${id} not found.`
      });
    }

    return res.status(200).json({
      success: true,
      data: artwork
    });
  } catch (error) {
    console.error('Error retrieving artwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve artwork.'
    });
  }
};

/**
 * Create a new artwork (Admin only)
 * Route: POST /api/artworks
 */
exports.createArtwork = (req, res) => {
  try {
    const {
      title,
      category,
      medium,
      dimensions,
      price,
      currency,
      description,
      status,
      is_featured
    } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Artwork title is required.'
      });
    }

    if (!category || !ALLOWED_CATEGORIES.includes(category.trim())) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`
      });
    }

    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid non-negative price is required.'
      });
    }

    // Determine image URL: either uploaded file or URL string
    let finalImageUrl = '';
    if (req.file) {
      finalImageUrl = `/uploads/artworks/${req.file.filename}`;
    } else if (req.body.image_url && req.body.image_url.trim()) {
      finalImageUrl = req.body.image_url.trim();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image by uploading a file or supplying an image URL.'
      });
    }

    const artwork = db.createArtwork({
      title,
      category,
      medium: medium || (category === 'Charcoal' ? 'Charcoal on Paper' : category === 'Paints' ? 'Acrylic on Canvas' : 'Digital Illustration'),
      dimensions: dimensions || 'Standard Canvas',
      price: Number(price),
      currency: currency || 'KES',
      image_url: finalImageUrl,
      description: description || '',
      status: ALLOWED_STATUSES.includes(status) ? status : 'Available',
      is_featured: is_featured === 'true' || is_featured === true || is_featured === '1' || is_featured === 1 ? 1 : 0
    });

    return res.status(201).json({
      success: true,
      message: 'New artwork successfully added to the catalog.',
      data: artwork
    });
  } catch (error) {
    console.error('Error creating artwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create new artwork listing.'
    });
  }
};

/**
 * Update an existing artwork (Admin only)
 * Route: PUT /api/artworks/:id
 */
exports.updateArtwork = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getArtworkById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Artwork #${id} not found.`
      });
    }

    const {
      title,
      category,
      medium,
      dimensions,
      price,
      currency,
      description,
      status,
      is_featured,
      image_url
    } = req.body;

    const updates = {};

    if (title !== undefined) updates.title = title;
    if (category !== undefined) {
      if (!ALLOWED_CATEGORIES.includes(category.trim())) {
        return res.status(400).json({
          success: false,
          message: `Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}.`
        });
      }
      updates.category = category;
    }
    if (medium !== undefined) updates.medium = medium;
    if (dimensions !== undefined) updates.dimensions = dimensions;
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({
          success: false,
          message: 'Price must be a valid non-negative number.'
        });
      }
      updates.price = Number(price);
    }
    if (currency !== undefined) updates.currency = currency;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.`
        });
      }
      updates.status = status;
    }
    if (is_featured !== undefined) {
      updates.is_featured = (is_featured === 'true' || is_featured === true || is_featured === '1' || is_featured === 1) ? 1 : 0;
    }

    // Check if new file was uploaded
    if (req.file) {
      updates.image_url = `/uploads/artworks/${req.file.filename}`;
      // Clean up previous local file if it existed
      if (existing.image_url && existing.image_url.startsWith('/uploads/artworks/')) {
        const oldFile = path.join(__dirname, '..', '..', 'public', existing.image_url);
        if (fs.existsSync(oldFile)) {
          fs.unlink(oldFile, () => {});
        }
      }
    } else if (image_url && image_url.trim()) {
      updates.image_url = image_url.trim();
    }

    const updated = db.updateArtwork(id, updates);

    return res.status(200).json({
      success: true,
      message: 'Artwork listing successfully updated.',
      data: updated
    });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update artwork.'
    });
  }
};

/**
 * Delete an artwork (Admin only)
 * Route: DELETE /api/artworks/:id
 */
exports.deleteArtwork = (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getArtworkById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Artwork #${id} not found.`
      });
    }

    const deleted = db.deleteArtwork(id);

    // Clean up local image file if stored locally
    if (deleted && deleted.image_url && deleted.image_url.startsWith('/uploads/artworks/')) {
      const filePath = path.join(__dirname, '..', '..', 'public', deleted.image_url);
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
      }
    }

    return res.status(200).json({
      success: true,
      message: `Artwork "${existing.title}" successfully removed from inventory.`,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete artwork.'
    });
  }
};
