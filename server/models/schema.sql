-- Database Schema for Ian Kimemia Art Portfolio & E-Commerce Catalog

-- Table: Admins
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: Artworks
CREATE TABLE IF NOT EXISTS artworks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('Charcoal', 'Paints', 'Animes')),
    medium TEXT NOT NULL,
    dimensions TEXT,
    price REAL NOT NULL,
    currency TEXT DEFAULT 'KES',
    image_url TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'Available' CHECK(status IN ('Available', 'Reserved', 'Sold')),
    is_featured INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: Inquiries (Contact messages from potential buyers/clients)
CREATE TABLE IF NOT EXISTS inquiries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    artwork_id INTEGER,
    artwork_title TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK(status IN ('new', 'read', 'replied')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_featured ON artworks(is_featured);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
