const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function giveCardsToAdmin() {
  try {
    console.log('🎴 Giving cards to admin user...\n');

    // Login as admin
    console.log('1. Logging in as admin...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cards.local',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    const userId = loginRes.data.user.id;
    console.log('✅ Logged in as admin');

    // Get all cards
    console.log('\n2. Fetching all cards...');
    const cardsRes = await axios.get(`${API_URL}/cards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cards = cardsRes.data;
    console.log(`✅ Found ${cards.length} cards`);

    // Add cards to admin's collection via direct database insert
    // Since there's no public API endpoint to add cards to users,
    // we'll need to use the scheduler service or create them manually

    console.log('\n📋 Available cards in database:');
    cards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.name} - ${card.rarity} (${card.baseValue} coins)`);
    });

    console.log('\n💡 To get cards in your collection:');
    console.log('   Option 1: Wait until midnight for daily card distribution');
    console.log('   Option 2: I can create an endpoint to manually give cards');
    console.log('   Option 3: Create a new user and they will get daily cards\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

giveCardsToAdmin();
