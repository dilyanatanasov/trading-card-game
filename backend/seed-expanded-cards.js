const axios = require('axios');
const cards = require('./expanded-race-cards.json');

const API_URL = 'http://localhost:3000';

async function seedExpandedCards() {
  try {
    console.log('Starting expanded race-based card seeding (120 cards total - 30 per race)...');

    // Login as admin
    let token;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@cards.local',
        password: 'admin123',
      });
      token = loginResponse.data.access_token;
      console.log('Logged in as admin@cards.local');
    } catch (error) {
      // Try alternative admin account
      console.log('admin@cards.local not found, trying dilyanatanasov177@gmail.com...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'dilyanatanasov177@gmail.com',
        password: 'Password123',
      });
      token = loginResponse.data.access_token;
      console.log('Logged in as dilyanatanasov177@gmail.com');
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // Get all existing cards
    console.log('\nFetching existing cards...');
    const existingCardsResponse = await axios.get(`${API_URL}/cards`, config);
    const existingCards = existingCardsResponse.data;

    console.log(`Found ${existingCards.length} existing cards`);

    // Delete all existing cards one by one
    if (existingCards.length > 0) {
      console.log('\nDeleting existing cards...');
      for (const card of existingCards) {
        try {
          await axios.delete(`${API_URL}/cards/${card.id}`, config);
          console.log(`✓ Deleted: ${card.name}`);
        } catch (error) {
          console.log(`✗ Failed to delete ${card.name}:`, error.response?.data?.message || error.message);
        }
      }
    }

    // Create new expanded cards
    console.log('\nCreating new expanded cards (120 total)...');
    let created = 0;
    const createdCardIds = {
      Dragons: [],
      Aqua: [],
      Dark: [],
      Holy: []
    };

    for (const card of cards) {
      try {
        const response = await axios.post(`${API_URL}/cards`, card, config);
        created++;
        createdCardIds[card.category].push(response.data.id);
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

    // Now redistribute cards to all existing users
    console.log('\n\n=== REDISTRIBUTING CARDS TO USERS ===\n');

    // Get all users
    const usersResponse = await axios.get(`${API_URL}/users`, config);
    const users = usersResponse.data;

    console.log(`Found ${users.length} users to distribute cards to`);

    const races = ['Dragons', 'Aqua', 'Dark', 'Holy'];

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const assignedRace = races[i % races.length]; // Distribute races evenly

      console.log(`\nAssigning ${assignedRace} deck to ${user.email}...`);

      // Get all cards for this race
      const raceCards = cards.filter(c => c.category === assignedRace);

      // Give user all 30 cards from their assigned race
      let addedCount = 0;
      for (const card of raceCards) {
        try {
          // Find the created card ID by name and category
          const allCards = await axios.get(`${API_URL}/cards`, config);
          const matchingCard = allCards.data.find(c => c.name === card.name && c.category === card.category);

          if (matchingCard) {
            await axios.post(`${API_URL}/cards/add-to-collection/${matchingCard.id}`, {}, {
              headers: { Authorization: `Bearer ${token}` },
              params: { userId: user.id }
            });
            addedCount++;
          }
        } catch (error) {
          console.log(`  ✗ Failed to add ${card.name}:`, error.response?.data?.message || error.message);
        }
      }

      console.log(`✓ Added ${addedCount}/30 ${assignedRace} cards to ${user.email}`);
    }

    console.log('\n\n✅ COMPLETE! All users have been given their themed decks (30 unique cards each)');

  } catch (error) {
    console.error('Error seeding cards:', error.response?.data || error.message);
    process.exit(1);
  }
}

seedExpandedCards();
