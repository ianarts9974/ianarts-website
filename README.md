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
