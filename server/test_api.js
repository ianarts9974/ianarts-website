/**
 * Automated Verification Script for Ian Kimemia Art Portfolio & CMS
 */

const http = require('http');

const PORT = 5001; // Use 5001 for test to avoid collision
process.env.PORT = PORT;

const app = require('./server'); // Note: server.js starts listening on its configured PORT or 5000

// Helper to make HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const defaultHeaders = { ...headers };
    let postData = null;

    if (body && typeof body === 'object') {
      postData = JSON.stringify(body);
      defaultHeaders['Content-Type'] = 'application/json';
      defaultHeaders['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: defaultHeaders
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Ian Kimemia Art Portfolio API on port 5000...');
  
  // Wait 1 second for server to initialize
  await new Promise(r => setTimeout(r, 1000));

  try {
    // 1. Health Check
    console.log('1. Testing GET /api/health ...');
    const health = await request('GET', '/api/health');
    console.log('   Status:', health.status, 'Response:', health.body);
    if (health.status !== 200 || health.body.artist !== 'Ian Kimemia') {
      throw new Error('Health check failed');
    }

    // 2. Fetch Artworks
    console.log('2. Testing GET /api/artworks ...');
    const artworks = await request('GET', '/api/artworks');
    console.log(`   Status: ${artworks.status}, Count: ${artworks.body.count}`);
    if (artworks.status !== 200 || artworks.body.count < 12) {
      throw new Error('Artworks catalog fetch failed');
    }

    // Check Categories
    const categories = new Set(artworks.body.data.map(a => a.category));
    console.log('   Categories present:', Array.from(categories));
    if (!categories.has('Charcoal') || !categories.has('Paints') || !categories.has('Animes')) {
      throw new Error('Missing required art categories');
    }

    // 3. Filter by Category
    console.log('3. Testing GET /api/artworks?category=Charcoal ...');
    const charcoalArt = await request('GET', '/api/artworks?category=Charcoal');
    console.log(`   Charcoal count: ${charcoalArt.body.count}`);
    if (charcoalArt.body.count === 0) throw new Error('Charcoal filter failed');

    // 4. Submit Customer Inquiry
    console.log('4. Testing POST /api/inquiries (Customer inquiry) ...');
    const inqRes = await request('POST', '/api/inquiries', {
      name: 'Grace Wambui',
      email: 'grace.wambui@example.com',
      phone: '+254711223344',
      subject: 'Inquiry on Charcoal Original',
      message: 'Hello Ian, I would like to reserve this piece for private delivery.'
    });
    console.log('   Status:', inqRes.status, 'Success:', inqRes.body.success);
    if (inqRes.status !== 201 || !inqRes.body.success) {
      throw new Error('Inquiry submission failed');
    }

    // 5. Admin Authentication
    console.log('5. Testing POST /api/auth/login ...');
    const loginRes = await request('POST', '/api/auth/login', {
      username: 'admin',
      password: 'IanArtAdmin2026!'
    });
    console.log('   Status:', loginRes.status, 'Token acquired:', Boolean(loginRes.body.token));
    if (loginRes.status !== 200 || !loginRes.body.token) {
      throw new Error('Admin login failed');
    }
    const token = loginRes.body.token;

    // 6. Admin KPI Stats
    console.log('6. Testing GET /api/stats (Admin only) ...');
    const statsRes = await request('GET', '/api/stats', null, {
      'Authorization': `Bearer ${token}`
    });
    console.log('   Status:', statsRes.status, 'Stats:', statsRes.body.data);
    if (statsRes.status !== 200) throw new Error('Stats retrieval failed');

    // 7. Admin Create Artwork
    console.log('7. Testing POST /api/artworks (Admin create) ...');
    const createArtRes = await request('POST', '/api/artworks', {
      title: 'Nightfall over Mt. Kenya',
      category: 'Paints',
      medium: 'Oil on Canvas',
      dimensions: '80 x 100 cm',
      price: 52000,
      image_url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=85',
      description: 'Test artwork creation',
      status: 'Available',
      is_featured: 0
    }, {
      'Authorization': `Bearer ${token}`
    });
    console.log('   Status:', createArtRes.status, 'Created ID:', createArtRes.body.data?.id);
    if (createArtRes.status !== 201) throw new Error('Artwork creation failed');

    const createdId = createArtRes.body.data.id;

    // 8. Admin Delete Artwork
    console.log(`8. Testing DELETE /api/artworks/${createdId} ...`);
    const deleteRes = await request('DELETE', `/api/artworks/${createdId}`, null, {
      'Authorization': `Bearer ${token}`
    });
    console.log('   Status:', deleteRes.status, 'Message:', deleteRes.body.message);
    if (deleteRes.status !== 200) throw new Error('Artwork deletion failed');

    console.log('\n=============================================');
    console.log('🎉 ALL 8 AUTOMATED TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================');
    process.exit(0);
  } catch (err) {
    console.error('Test verification failure:', err.message);
    process.exit(1);
  }
}

runTests();
