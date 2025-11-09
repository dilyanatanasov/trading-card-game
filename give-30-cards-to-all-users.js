const axios = require('axios');

const API_URL = 'http://localhost:3000';

// List of known users with their credentials
const TEST_USERS = [
  { email: 'admin@cards.local', password: 'admin123' },
  { email: 'user@cards.local', password: 'user123' },
];

async function give30CardsToUser(email, password) {
  try {
    console.log(`\n📦 Processing user: ${email}`);

    // Login as the user
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email,
      password
    });
    const token = loginRes.data.access_token;
    const username = loginRes.data.user.username;
    console.log(`✅ Logged in as ${username}`);

    // Get all cards to see what's available
    const cardsRes = await axios.get(`${API_URL}/cards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cards = cardsRes.data;

    if (cards.length === 0) {
      console.log('❌ No cards found in database. Please seed cards first.');
      return;
    }

    // Give 30 random cards using the claim endpoint
    for (let i = 0; i < 30; i++) {
      try {
        const res = await axios.get(`${API_URL}/cards/daily/claim`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`  ✅ Added card ${i + 1}/30: ${res.data.card.name}`);
      } catch (error) {
        console.log(`  ⚠️ Failed to add card ${i + 1}/30: ${error.response?.data?.message || error.message}`);
      }
    }

    console.log(`✅ Completed for ${username}`);
  } catch (error) {
    console.error(`❌ Error for ${email}:`, error.response?.data?.message || error.message);
  }
}

async function give30CardsToAllUsers() {
  console.log('🎴 Giving 30 cards to all users...\n');

  for (const user of TEST_USERS) {
    await give30CardsToUser(user.email, user.password);
  }

  console.log('\n🎉 Done! All users now have 30 cards.\n');
}

give30CardsToAllUsers();
