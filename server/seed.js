/**
 * Seed Script for Ian Kimemia Art Portfolio
 * 
 * Populates:
 * 1. Default Admin Account (admin / IanArtAdmin2026!)
 * 2. Curated Artworks across Charcoal, Paints, and Animes
 * 3. Sample Customer Inquiries for the Admin Inbox
 */

const bcrypt = require('bcryptjs');
const db = require('./config/db');
require('dotenv').config();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'ianarts20@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'IanArtAdmin2026!';

async function seed() {
  console.log('--- Starting Ian Kimemia Art Portfolio Database Seeding ---');

  // 1. Seed or Verify Admin User
  const existingAdmin = db.findAdminByUsernameOrEmail(ADMIN_USERNAME);
  if (!existingAdmin) {
    const password_hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    const admin = db.createAdmin({
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      password_hash
    });
    console.log(`✓ Admin user created: [${admin.username}] (${admin.email})`);
    console.log(`  Default Password: ${ADMIN_PASSWORD}`);
  } else {
    console.log(`✓ Admin user already exists: [${existingAdmin.username}]`);
  }

  // 2. Seed Artworks if catalog is empty
  const currentArtworks = db.getArtworks();
  if (currentArtworks.length === 0) {
    console.log('Seeding curated artwork catalog...');

    const sampleArtworks = [
      // --- CHARCOAL CATEGORY ---
      {
        title: 'Soul of the Matriarch',
        category: 'Charcoal',
        medium: 'Compressed charcoal and graphite on Strathmore 400 paper',
        dimensions: '50 x 70 cm',
        price: 38000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85',
        description: 'A deeply expressive hyper-realistic charcoal study of a Kikuyu elder matriarch. Crafted with fine graphite layering and intense velvety charcoal, capturing every wrinkle of wisdom and timeless grace.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Sovereign of the Savannah',
        category: 'Charcoal',
        medium: 'Carbon pencil and powdered charcoal on toned archival sheet',
        dimensions: '60 x 80 cm',
        price: 45000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=85',
        description: 'A powerful tribute to Kenya\'s wild royalty. The lion stands poised against a minimalist dark backdrop, with individual whiskers and deep, brooding gaze brought to life through intricate cross-hatching and erasure highlights.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Contemplation in Monochrome',
        category: 'Charcoal',
        medium: 'Vine charcoal and white chalk on Fabriano paper',
        dimensions: '42 x 59.4 cm (A2)',
        price: 26000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1582561424760-0321d75e81fa?auto=format&fit=crop&w=1000&q=85',
        description: 'An evocative chiaroscuro portrait exploring introspection and human stillness. The stark play of pure light against deep obsidian shadows creates a mesmerizing presence in any modern space.',
        status: 'Sold',
        is_featured: 0
      },
      {
        title: 'Whispers of Kirinyaga',
        category: 'Charcoal',
        medium: 'Charcoal and conté crayon on textured cotton rag',
        dimensions: '45 x 65 cm',
        price: 32000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=1000&q=85',
        description: 'Atmospheric charcoal landscape capturing the tea terraces and gentle mist rolling over the hills of Kutus, Kirinyaga. A piece rooted in the artist\'s homeland.',
        status: 'Available',
        is_featured: 0
      },

      // --- PAINTS CATEGORY ---
      {
        title: 'Mount Kenya at Dawn',
        category: 'Paints',
        medium: 'Impasto acrylic and oil on heavy stretched canvas',
        dimensions: '90 x 120 cm',
        price: 58000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=85',
        description: 'A majestic panoramic celebration of Batian and Nelion peaks illuminated by first dawn. Textured palette knife strokes layer brilliant vermilion, ochre, and icy cobalt against the morning sky.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Rhythms of Nairobi (Matatu Culture)',
        category: 'Paints',
        medium: 'Textured acrylic and spray enamel on gallery canvas',
        dimensions: '75 x 100 cm',
        price: 48000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=1000&q=85',
        description: 'An explosion of urban kinetic energy. Custom graffiti-adorned matatus, wet asphalt reflecting neon shop lights, and the vibrant pulse of Nairobi city life.',
        status: 'Available',
        is_featured: 0
      },
      {
        title: 'Serengeti Horizon Symphony',
        category: 'Paints',
        medium: 'Oil on Belgian linen canvas',
        dimensions: '80 x 110 cm',
        price: 64000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1000&q=85',
        description: 'A rich, luminous depiction of the golden hour on the East African plains. Glowing crimson and molten amber skies frame the silhouettes of wild acacia branches in perfect harmony.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Flora Euphoria',
        category: 'Paints',
        medium: 'Acrylic and 24K gold leaf on wood panel',
        dimensions: '60 x 60 cm',
        price: 35000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1549887534-1541e9326642?auto=format&fit=crop&w=1000&q=85',
        description: 'An organic symphony of indigenous Kenyan blossoms accented with luminous metallic gold leaf that shifts dynamically under warm gallery lighting.',
        status: 'Reserved',
        is_featured: 0
      },

      // --- ANIMES CATEGORY ---
      {
        title: 'Shadow Assassin: Shinobi Genesis',
        category: 'Animes',
        medium: 'Digital fine-art illustration on metallic pearl canvas',
        dimensions: '50 x 70 cm',
        price: 24000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1000&q=85',
        description: 'Dynamic anime action concept. A rogue shadow shinobi mid-strike with electric cyan chakra trails, glowing crimson eye effect, and intricate cyberpunk garment detailing.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Celestial Sorceress of the Astral Gate',
        category: 'Animes',
        medium: 'Mixed digital illustration and acrylic varnish finish',
        dimensions: '42 x 59.4 cm (A2)',
        price: 22000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=85',
        description: 'Stunning ethereal anime character portrait featuring flowing silver hair woven with constellations, celestial sigils, and iridescent violet color grading.',
        status: 'Available',
        is_featured: 1
      },
      {
        title: 'Flame Breaker (Nichirin Blade)',
        category: 'Animes',
        medium: 'Ink lines and digital coloring on metallic archival print',
        dimensions: '50 x 75 cm',
        price: 25000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=85',
        description: 'High-octane tribute artwork showcasing a blazing katana technique. Vibrant swirling flame dragons rendered with traditional sumi-e brush textures fused with anime intensity.',
        status: 'Sold',
        is_featured: 0
      },
      {
        title: 'Neo-Tokyo Midnight Phantom',
        category: 'Animes',
        medium: 'Digital painting on framed acrylic glass',
        dimensions: '60 x 80 cm',
        price: 29000,
        currency: 'KES',
        image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85',
        description: 'Atmospheric cyberpunk anime illustration. A masked drifter seated atop a customized retro-futuristic bike overlooking a rain-soaked neon skyline.',
        status: 'Available',
        is_featured: 0
      }
    ];

    sampleArtworks.forEach(art => {
      db.createArtwork(art);
    });

    console.log(`✓ Successfully seeded ${sampleArtworks.length} art pieces across Charcoal, Paints, and Animes.`);
  } else {
    console.log(`✓ Catalog already has ${currentArtworks.length} artworks. Skipping artwork seeding.`);
  }

  // 3. Seed Sample Inquiries
  const currentInquiries = db.getInquiries();
  if (currentInquiries.length === 0) {
    db.createInquiry({
      artwork_id: 1,
      artwork_title: 'Soul of the Matriarch',
      name: 'Wanjiku Mwangi',
      email: 'wanjiku.m@gmail.com',
      phone: '+254712345678',
      subject: 'Inquiry on Soul of the Matriarch Original Piece',
      message: 'Hello Ian, I was deeply moved by the detail in your charcoal piece "Soul of the Matriarch". Is it framed and ready to ship to Nairobi? Please let me know the delivery timeline.'
    });

    db.createInquiry({
      artwork_id: 5,
      artwork_title: 'Mount Kenya at Dawn',
      name: 'Brian Omondi',
      email: 'brian.omondi@outlook.com',
      phone: '+254798765432',
      subject: 'Commission and Mount Kenya painting inquiry',
      message: 'Hi Ian! Love your landscape paintings. I am interested in "Mount Kenya at Dawn" for my new living room in Westlands. Also wondering if you do custom commission work on large canvas?'
    });

    console.log('✓ Successfully seeded sample customer inquiries.');
  }

  console.log('--- Seeding Completed Successfully ---');
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
