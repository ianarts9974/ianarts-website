/**
 * Server Entrypoint for Ian Kimemia Art Portfolio & E-Commerce
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Database layer
const db = require('./config/db');

// Route handlers
const authRoutes = require('./routes/authRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Parsing Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Ensure upload folders exist
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads', 'artworks');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static frontend assets
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    artist: 'Ian Kimemia',
    location: 'Kutus, Kirinyaga',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/artworks', artworkRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/stats', statsRoutes);

// Admin Portal Page Direct Route
app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin.html'));
});

// Client-side routing fallback to index.html
app.get('*', (req, res) => {
  // If API route was not matched, return 404 JSON
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'API endpoint not found.'
    });
  }
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Auto-seed on initial launch if empty
async function autoSeedIfEmpty() {
  const artworks = db.getArtworks();
  const admin = db.findAdminByUsernameOrEmail(process.env.ADMIN_USERNAME || 'admin');
  if (artworks.length === 0 || !admin) {
    console.log('Database appears uninitialized. Running initial seed...');
    try {
      require('./seed');
    } catch (e) {
      console.error('Automatic seeding notice:', e.message);
    }
  }
}

app.listen(PORT, async () => {
  console.log(`====================================================`);
  console.log(`🎨 Ian Kimemia Art Portfolio Server Active`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🛡️  Admin CMS: http://localhost:${PORT}/admin`);
  console.log(`📍 Location: Kutus, Kirinyaga`);
  console.log(`====================================================`);
  await autoSeedIfEmpty();
});
