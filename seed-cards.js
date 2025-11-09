const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000';

async function seedCards() {
  try {
    console.log('🎴 Seeding sample cards...\n');

    // First, register a user to get auth token
    console.log('1. Creating admin user...');
    let token;
    try {
      const registerRes = await axios.post(`${API_URL}/auth/register`, {
        email: 'admin@cards.local',
        username: 'admin',
        password: 'admin123'
      });
      token = registerRes.data.access_token;
      console.log('✅ Admin user created');
    } catch (error) {
      if (error.response?.status === 409) {
        console.log('⚠️  Admin user already exists, logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
          email: 'admin@cards.local',
          password: 'admin123'
        });
        token = loginRes.data.access_token;
        console.log('✅ Logged in as admin');
      } else {
        throw error;
      }
    }

    // Load sample cards
    const sampleCards = JSON.parse(fs.readFileSync('sample-cards.json', 'utf8'));
    console.log(`\n2. Creating ${sampleCards.length} cards...\n`);

    // Create each card
    for (const card of sampleCards) {
      try {
        await axios.post(`${API_URL}/cards`, card, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Created: ${card.name} (${card.rarity})`);
      } catch (error) {
        console.log(`❌ Failed to create ${card.name}: ${error.message}`);
      }
    }

    console.log('\n🎉 Sample cards seeded successfully!');
    console.log('\n📍 Next steps:');
    console.log('1. Open http://localhost:5173');
    console.log('2. Register a new user account');
    console.log('3. Start collecting cards!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

seedCards();
