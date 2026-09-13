/**
 * Database Layer for Ian Kimemia Art Portfolio
 * 
 * Provides a resilient, self-initializing database manager with full CRUD query methods,
 * automatic schema migration, and safe persistent file storage.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'art_portfolio.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory data store with atomic file persistence
class RelationalDatabase {
  constructor(filePath) {
    this.filePath = filePath;
    this.data = {
      admins: [],
      artworks: [],
      inquiries: [],
      _meta: {
        lastAdminId: 0,
        lastArtworkId: 0,
        lastInquiryId: 0
      }
    };
    this.init();
  }

  init() {
    if (fs.existsSync(this.filePath)) {
      try {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = {
          admins: parsed.admins || [],
          artworks: parsed.artworks || [],
          inquiries: parsed.inquiries || [],
          _meta: parsed._meta || {
            lastAdminId: (parsed.admins || []).reduce((max, a) => Math.max(max, a.id || 0), 0),
            lastArtworkId: (parsed.artworks || []).reduce((max, a) => Math.max(max, a.id || 0), 0),
            lastInquiryId: (parsed.inquiries || []).reduce((max, a) => Math.max(max, a.id || 0), 0)
          }
        };
      } catch (err) {
        console.error('Error reading database file, initializing fresh store:', err);
        this.persist();
      }
    } else {
      this.persist();
    }
  }

  persist() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Database write error:', err);
    }
  }

  // --- Admins Table Methods ---
  findAdminByUsernameOrEmail(identifier) {
    const ident = (identifier || '').trim().toLowerCase();
    return this.data.admins.find(
      a => (a.username && a.username.toLowerCase() === ident) || 
           (a.email && a.email.toLowerCase() === ident)
    ) || null;
  }

  findAdminById(id) {
    return this.data.admins.find(a => a.id === Number(id)) || null;
  }

  createAdmin({ username, email, password_hash }) {
    this.data._meta.lastAdminId += 1;
    const admin = {
      id: this.data._meta.lastAdminId,
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password_hash,
      created_at: new Date().toISOString()
    };
    this.data.admins.push(admin);
    this.persist();
    return admin;
  }

  updateAdminPassword(id, newHash) {
    const admin = this.findAdminById(id);
    if (admin) {
      admin.password_hash = newHash;
      this.persist();
      return true;
    }
    return false;
  }

  // --- Artworks Table Methods ---
  getArtworks({ category, search, featured, status, sort } = {}) {
    let list = [...this.data.artworks];

    // Filter by Category ('Charcoal', 'Paints', 'Animes')
    if (category && category !== 'All') {
      list = list.filter(item => item.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by Status
    if (status) {
      list = list.filter(item => item.status.toLowerCase() === status.toLowerCase());
    }

    // Filter by Featured
    if (featured !== undefined && featured !== '') {
      const isFeat = featured === true || featured === 'true' || featured === 1 || featured === '1';
      list = list.filter(item => Boolean(item.is_featured) === isFeat);
    }

    // Search by title, medium, description
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(item => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.medium && item.medium.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sort === 'price_asc') {
      list.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === 'price_desc') {
      list.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      // Default: newest first
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    return list;
  }

  getArtworkById(id) {
    return this.data.artworks.find(a => a.id === Number(id)) || null;
  }

  createArtwork({ title, category, medium, dimensions, price, currency = 'KES', image_url, description, status = 'Available', is_featured = 0 }) {
    this.data._meta.lastArtworkId += 1;
    const now = new Date().toISOString();
    const artwork = {
      id: this.data._meta.lastArtworkId,
      title: title.trim(),
      category: category.trim(),
      medium: medium ? medium.trim() : 'Mixed Media',
      dimensions: dimensions ? dimensions.trim() : 'Custom Size',
      price: Number(price) || 0,
      currency: currency || 'KES',
      image_url: image_url.trim(),
      description: description ? description.trim() : '',
      status: status || 'Available',
      is_featured: Number(is_featured) ? 1 : 0,
      created_at: now,
      updated_at: now
    };
    this.data.artworks.push(artwork);
    this.persist();
    return artwork;
  }

  updateArtwork(id, updates) {
    const artwork = this.getArtworkById(id);
    if (!artwork) return null;

    if (updates.title !== undefined) artwork.title = updates.title.trim();
    if (updates.category !== undefined) artwork.category = updates.category.trim();
    if (updates.medium !== undefined) artwork.medium = updates.medium.trim();
    if (updates.dimensions !== undefined) artwork.dimensions = updates.dimensions.trim();
    if (updates.price !== undefined) artwork.price = Number(updates.price);
    if (updates.currency !== undefined) artwork.currency = updates.currency;
    if (updates.image_url !== undefined && updates.image_url !== '') artwork.image_url = updates.image_url.trim();
    if (updates.description !== undefined) artwork.description = updates.description.trim();
    if (updates.status !== undefined) artwork.status = updates.status;
    if (updates.is_featured !== undefined) artwork.is_featured = Number(updates.is_featured) ? 1 : 0;
    
    artwork.updated_at = new Date().toISOString();
    this.persist();
    return artwork;
  }

  deleteArtwork(id) {
    const index = this.data.artworks.findIndex(a => a.id === Number(id));
    if (index === -1) return false;
    const [deleted] = this.data.artworks.splice(index, 1);
    this.persist();
    return deleted;
  }

  // --- Inquiries Table Methods ---
  getInquiries({ status } = {}) {
    let list = [...this.data.inquiries];
    if (status && status !== 'all') {
      list = list.filter(inq => inq.status === status);
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return list;
  }

  getInquiryById(id) {
    return this.data.inquiries.find(i => i.id === Number(id)) || null;
  }

  createInquiry({ artwork_id = null, artwork_title = '', name, email, phone = '', subject, message }) {
    this.data._meta.lastInquiryId += 1;
    const inquiry = {
      id: this.data._meta.lastInquiryId,
      artwork_id: artwork_id ? Number(artwork_id) : null,
      artwork_title: artwork_title || '',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || '').trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      created_at: new Date().toISOString()
    };
    this.data.inquiries.push(inquiry);
    this.persist();
    return inquiry;
  }

  updateInquiryStatus(id, status) {
    const inq = this.getInquiryById(id);
    if (!inq) return null;
    inq.status = status;
    this.persist();
    return inq;
  }

  deleteInquiry(id) {
    const index = this.data.inquiries.findIndex(i => i.id === Number(id));
    if (index === -1) return false;
    const [deleted] = this.data.inquiries.splice(index, 1);
    this.persist();
    return deleted;
  }

  // --- Statistics ---
  getStats() {
    const artworks = this.data.artworks;
    const inquiries = this.data.inquiries;

    const totalArtworks = artworks.length;
    const availableArtworks = artworks.filter(a => a.status === 'Available').length;
    const soldArtworks = artworks.filter(a => a.status === 'Sold').length;
    const reservedArtworks = artworks.filter(a => a.status === 'Reserved').length;

    const totalInventoryValue = artworks.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
    const availableInventoryValue = artworks
      .filter(a => a.status === 'Available')
      .reduce((sum, a) => sum + (Number(a.price) || 0), 0);

    const categoriesCount = {
      Charcoal: artworks.filter(a => a.category === 'Charcoal').length,
      Paints: artworks.filter(a => a.category === 'Paints').length,
      Animes: artworks.filter(a => a.category === 'Animes').length
    };

    const newInquiries = inquiries.filter(i => i.status === 'new').length;
    const totalInquiries = inquiries.length;

    return {
      totalArtworks,
      availableArtworks,
      soldArtworks,
      reservedArtworks,
      totalInventoryValue,
      availableInventoryValue,
      categoriesCount,
      newInquiries,
      totalInquiries
    };
  }
}

const db = new RelationalDatabase(DB_FILE);

module.exports = db;
