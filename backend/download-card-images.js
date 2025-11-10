const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:3000';

// Create images directory if it doesn't exist
const imagesDir = path.join(__dirname, 'public', 'card-images');
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filepath = path.join(imagesDir, filename);
    fs.writeFileSync(filepath, response.data);
    console.log(`✓ Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.log(`✗ Failed to download ${filename}:`, error.message);
    return false;
  }
}

async function downloadAllCardImages() {
  try {
    console.log('Starting card image download...\n');

    // Login as admin
    let token;
    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'admin@cards.local',
        password: 'admin123',
      });
      token = loginResponse.data.access_token;
      console.log('Logged in as admin@cards.local\n');
    } catch (error) {
      console.log('admin@cards.local not found, trying dilyanatanasov177@gmail.com...');
      const loginResponse = await axios.post(`${API_URL}/auth/login`, {
        email: 'dilyanatanasov177@gmail.com',
        password: 'Password123',
      });
      token = loginResponse.data.access_token;
      console.log('Logged in as dilyanatanasov177@gmail.com\n');
    }

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // Get all cards
    const cardsResponse = await axios.get(`${API_URL}/cards`, config);
    const cards = cardsResponse.data;

    console.log(`Found ${cards.length} cards to download images for\n`);

    let downloaded = 0;
    let failed = 0;

    for (const card of cards) {
      // Create a safe filename from card name
      const safeFilename = card.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '.jpg';

      const success = await downloadImage(card.imageUrl, safeFilename);

      if (success) {
        downloaded++;
        // Update card imageUrl in database
        try {
          await axios.patch(`${API_URL}/cards/${card.id}`, {
            imageUrl: `/card-images/${safeFilename}`
          }, config);
        } catch (error) {
          console.log(`  Warning: Could not update URL for ${card.name}`);
        }
      } else {
        failed++;
      }

      // Add small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n✅ Download complete!`);
    console.log(`   Downloaded: ${downloaded}/${cards.length}`);
    console.log(`   Failed: ${failed}/${cards.length}`);

  } catch (error) {
    console.error('Error downloading images:', error.response?.data || error.message);
    process.exit(1);
  }
}

downloadAllCardImages();
