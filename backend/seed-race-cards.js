const axios = require('axios');
const cards = require('./race-cards.json');

const API_URL = 'http://localhost:3000';

async function seedRaceCards() {
  try {
    console.log('Starting race-based card seeding...');

    // Login as admin
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@example.com',
      password: 'admin123',
    });

    const token = loginResponse.data.access_token;
    console.log('Logged in as admin');

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // Delete all existing cards
    console.log('\nClearing existing cards...');
    try {
      await axios.delete(`${API_URL}/cards/all`, config);
      console.log('All existing cards deleted');
    } catch (error) {
      console.log('No existing cards to delete or error:', error.message);
    }

    // Create new race-based cards
    console.log('\nCreating new race-based cards...');
    let created = 0;

    for (const card of cards) {
      try {
        const response = await axios.post(`${API_URL}/cards`, card, config);
        created++;
        console.log(`✓ Created: ${card.name} (${card.category}) - ${card.rarity}`);
      } catch (error) {
        console.log(`✗ Failed to create ${card.name}:`, error.response?.data?.message || error.message);
      }
    }

    console.log(`\n✅ Successfully created ${created}/${cards.length} cards`);

    // Summary by race
    const summary = cards.reduce((acc, card) => {
      acc[card.category] = (acc[card.category] || 0) + 1;
      return acc;
    }, {});

    console.log('\nCards by race:');
    Object.entries(summary).forEach(([race, count]) => {
      console.log(`  ${race}: ${count} cards`);
    });

  } catch (error) {
    console.error('Error seeding cards:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedRaceCards();
