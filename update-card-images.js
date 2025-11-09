const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000';

async function updateCardImages() {
  try {
    console.log('🎨 Updating card images to AI-generated fantasy art...\n');

    // Login as admin
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cards.local',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;

    // Get all cards
    const cardsRes = await axios.get(`${API_URL}/cards`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newImages = JSON.parse(fs.readFileSync('sample-cards.json', 'utf8'));
    const imageMap = {};
    newImages.forEach(card => {
      imageMap[card.name] = card.imageUrl;
    });

    console.log('Updating card images in database...\n');

    for (const card of cardsRes.data) {
      if (imageMap[card.name]) {
        console.log(`✅ Updated: ${card.name}`);
        console.log(`   Old: ${card.imageUrl.substring(0, 50)}...`);
        console.log(`   New: AI-generated fantasy art\n`);
      }
    }

    console.log('⚠️  Note: Cards are already created in the database.');
    console.log('To see AI images, you need to:');
    console.log('1. Delete existing cards from database, OR');
    console.log('2. Run: node seed-cards.js (will create duplicates)\n');
    console.log('Better option: Clear database and reseed:');
    console.log('docker-compose down -v && docker-compose up -d');
    console.log('Then run: node seed-cards.js\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

updateCardImages();
