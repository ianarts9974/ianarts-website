# Ian Kimemia — Fine Art Portfolio & E-Commerce Platform

A production-ready full-stack web application and inventory CMS built for Kenyan contemporary visual artist **Ian Kimemia** (based in Kutus, Kirinyaga).

The platform features a modern, sleek dark-mode aesthetic acting as a digital gallery wall to make visual artworks (**Charcoal**, **Paints**, and **Animes**) visually pop, paired with an interactive customer catalog, direct inquiry system, and a robust private Admin CMS Dashboard for inventory and message management.

---

## 🎨 Key Features

### 🌟 Customer-Facing Experience (Frontend)
- **Gallery Wall Dark-Mode Aesthetic**: Deep obsidian `#0a0c10` tones and brushed gold accents that spotlight the artwork.
- **Hero & Curated Spotlight**: Atmospheric introduction to Ian Kimemia with featured pieces and key stats.
- **Interactive Art Catalog**:
  - Filterable tabs by style: **"Charcoal"**, **"Paints"**, and **"Animes"** (plus **"All"**).
  - Real-time search by title, medium, or keywords.
  - Sorting options: Price (Low to High / High to Low), Newest additions, and Classic works.
- **Artwork Detail Lightbox Modal**:
  - High-resolution artwork viewer.
  - Detailed metadata: Medium, dimensions, pricing in Kenyan Shillings (KES) + approx. USD, origin, and story.
  - Instant purchase inquiry with 1-click WhatsApp or studio message.
- **Direct Contact & Inquiry Section**:
  - Display of artist details:
    - **Name**: Ian Kimemia
    - **Email**: `ianarts20@gmail.com`
    - **Phone & WhatsApp**: `+254 742916132`
    - **Location**: `Kutus, Kirinyaga, Kenya`
  - Integrated inquiry form connected directly to the database.
  - Direct WhatsApp quick chat button (`https://wa.me/254742916132`).
- **Fully Responsive Layout**: Built with CSS Grid and Flexbox for fluid performance on mobile phones, tablets, and wide monitors.

### 🛡️ Owner-Facing CMS (Admin Dashboard at `/admin`)
- **Secure Authentication**:
  - Admin login portal with JWT session management and bcrypt password hashing.
  - Session verification and logout.
  - Password change utility directly in the dashboard.
- **Full Inventory CRUD (Create, Read, Update, Delete)**:
  - **Dual Image Sourcing**: Support for local file uploads (drag-and-drop file upload with preview) OR direct web image URLs.
  - Manage: Title, Category (`Charcoal`, `Paints`, `Animes`), Medium, Dimensions, Price (KES), Status (`Available`, `Reserved`, `Sold`), Featured Spotlight toggle, Description.
  - Instant status switches and inline editing.
  - Delete with safety confirmation dialog.
- **Customer Inquiry Inbox**:
  - View incoming messages with sender name, email, phone, timestamp, and referenced artwork.
  - Status management (`new`, `read`, `replied`).
  - 1-click **"Reply via Email"** (`mailto:`) and **"Reply on WhatsApp"** (`wa.me`).
  - Delete inquiries.
- **Studio KPIs & Analytics**:
  - Total artworks in catalog.
  - Available vs. Sold count.
  - Total inventory valuation (KES).
  - New customer inquiries counter.
  - Category distribution breakdown.

---

## 📁 Project Architecture & Folder Structure

```
Vagitus1/
├── server/
│   ├── config/
│   │   └── db.js              # Resilient atomic relational store & queries
│   ├── controllers/
│   │   ├── authController.js   # Admin login, verify & password change
│   │   ├── artworkController.js# Artworks CRUD & filtering
│   │   ├── inquiryController.js# Customer contact messages & inbox
│   │   └── statsController.js  # Dashboard KPIs (art count, value, inquiries)
│   ├── middleware/
│   │   ├── auth.js            # JWT protection middleware
│   │   └── upload.js          # Multer image upload configuration
│   ├── models/
│   │   └── schema.sql         # Relational database schema reference
│   ├── routes/
│   │   ├── authRoutes.js      # /api/auth
│   │   ├── artworkRoutes.js   # /api/artworks
│   │   ├── inquiryRoutes.js   # /api/inquiries
│   │   └── statsRoutes.js     # /api/stats
│   ├── seed.js                # Database seeder with sample artworks & admin
│   └── server.js              # Main Express server entrypoint
├── public/
│   ├── index.html             # Customer-facing website
│   ├── admin.html             # Owner-facing CMS Dashboard
│   ├── css/
│   │   ├── style.css          # Dark gallery aesthetic & responsive grid
│   │   └── admin.css          # Clean dark CMS styling & modals
│   ├── js/
│   │   ├── app.js             # Customer frontend client logic
│   │   └── admin.js           # Admin CMS client logic & JWT management
│   └── uploads/artworks/      # Destination for uploaded artwork files
├── .env                       # Active environment configuration
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
└── README.md                  # Documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16.x or higher)
- [npm](https://www.npmjs.com/) (bundled with Node.js)

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Verify or adjust your `.env` file:
```ini
PORT=5000
NODE_ENV=development
JWT_SECRET=ian_kimemia_super_secret_jwt_key_2026_art_vault

# Initial Admin Credentials (used during auto-seed)
ADMIN_USERNAME=admin
ADMIN_EMAIL=ianarts20@gmail.com
ADMIN_DEFAULT_PASSWORD=IanArtAdmin2026!

# Artist Information
ARTIST_NAME=Ian Kimemia
ARTIST_EMAIL=ianarts20@gmail.com
ARTIST_PHONE=+254742916132
ARTIST_LOCATION=Kutus, Kirinyaga
```

### Step 3: Seed Database (Optional / Automatic)
The application will automatically seed initial high-resolution artworks across Charcoal, Paints, and Animes on first launch. If you wish to run the seeder manually:
```bash
npm run seed
```

### Step 4: Launch Server
Start the Express server:
```bash
npm start
```
Or for development with automatic reload on changes:
```bash
npm run dev
```

### Step 5: Access the Website
- **Public Art Gallery**: [http://localhost:5000](http://localhost:5000)
- **Admin CMS Portal**: [http://localhost:5000/admin](http://localhost:5000/admin)

#### Default Admin Login Credentials:
- **Username / Email**: `admin` (or `ianarts20@gmail.com`)
- **Password**: `IanArtAdmin2026!`

*(You can update this password at any time inside the Admin Settings tab).*

---

## 📡 RESTful API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Public | Authenticates admin credentials, returns JWT token |
| **GET** | `/api/auth/verify` | Admin | Validates existing session token |
| **POST** | `/api/auth/change-password` | Admin | Updates admin account password |
| **GET** | `/api/artworks` | Public | Lists all artworks. Filters: `category`, `search`, `status`, `sort` |
| **GET** | `/api/artworks/:id` | Public | Retrieves detailed single artwork |
| **POST** | `/api/artworks` | Admin | Creates new artwork (supports `multipart/form-data` or JSON URL) |
| **PUT** | `/api/artworks/:id` | Admin | Updates an existing artwork |
| **DELETE**| `/api/artworks/:id` | Admin | Permanently deletes artwork and cleans up local file |
| **POST** | `/api/inquiries` | Public | Submits a contact / purchase inquiry |
| **GET** | `/api/inquiries` | Admin | Retrieves all customer inquiries. Filter: `status` |
| **PATCH**| `/api/inquiries/:id` | Admin | Updates inquiry status (`new`, `read`, `replied`) |
| **DELETE**| `/api/inquiries/:id` | Admin | Deletes customer inquiry |
| **GET** | `/api/stats` | Admin | Returns aggregate dashboard metrics (counts, values, KPIs) |

---

## 🌐 Production Deployment Guide

### Option 1: Deploying to Render / Railway / Heroku
1. Push this repository to GitHub or GitLab.
2. In your deployment dashboard (e.g. Render.com or Railway.app):
   - Choose **New Web Service** connected to your repo.
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. Add your Environment Variables in the service settings:
   - `NODE_ENV=production`
   - `JWT_SECRET=your_production_secure_secret_key`
   - `ADMIN_USERNAME=admin`
   - `ADMIN_DEFAULT_PASSWORD=YourStrongPasswordHere!`
4. Deploy! Your website will be live with full SSL/HTTPS.

### Option 2: Deploying to Ubuntu / Debian VPS with Nginx & PM2
1. Clone the repository to `/var/www/ian-kimemia-art`:
   ```bash
   git clone <repo-url> /var/www/ian-kimemia-art
   cd /var/www/ian-kimemia-art
   npm install --production
   ```
2. Run database seed:
   ```bash
   npm run seed
   ```
3. Start the application with PM2:
   ```bash
   npm install -g pm2
   pm2 start server/server.js --name "ian-art"
   pm2 save
   pm2 startup
   ```
4. Configure Nginx reverse proxy to forward traffic to `http://127.0.0.1:5000`.

---

## 🔒 Security & Best Practices
- **Password Hashing**: Passwords are encrypted using salted bcrypt hashes (`bcryptjs`).
- **Authorization Guard**: All modifying routes (`POST/PUT/DELETE /api/artworks`, `/api/inquiries`, `/api/stats`) are protected with cryptographic JWT verification.
- **Sanitized Uploads**: Image uploads are strictly filtered to valid image mime types and extensions with a 10MB file limit.
- **XSS Protection**: Dynamic frontend rendering escapes all user-supplied data.

---

## 📞 Artist Contact Information
- **Artist**: Ian Kimemia
- **Email**: [ianarts20@gmail.com](mailto:ianarts20@gmail.com)
- **Phone / WhatsApp**: [+254 742916132](tel:+254742916132)
- **Studio Location**: Kutus, Kirinyaga, Kenya
