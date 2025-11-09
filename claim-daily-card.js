const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function claimDailyCard() {
  try {
    console.log('🎴 Claiming daily card...\n');

    // Login as admin
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@cards.local',
      password: 'admin123'
    });
    const token = loginRes.data.access_token;
    console.log('✅ Logged in as admin\n');

    // Claim daily card (you can run this multiple times to get multiple cards)
    const claimRes = await axios.get(`${API_URL}/cards/daily/claim`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('🎉 Daily card claimed!');
    console.log(`Card: ${claimRes.data.card.name} (${claimRes.data.card.rarity})`);
    console.log(`Value: ${claimRes.data.card.baseValue} coins\n`);

    // Get collection
    const collectionRes = await axios.get(`${API_URL}/cards/my-collection`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📚 Your collection (${collectionRes.data.length} unique cards):`);
    collectionRes.data.forEach((userCard) => {
      console.log(`  - ${userCard.card.name} x${userCard.quantity} (${userCard.card.rarity})`);
    });

    console.log('\n💡 Tip: Run this script multiple times to get more cards!');
    console.log('💡 Then login to http://localhost:5173 to see them!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

claimDailyCard();
