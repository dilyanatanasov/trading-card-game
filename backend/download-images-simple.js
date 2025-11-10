const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const imagesDir = path.join(__dirname, 'public', 'card-images');

// Ensure images directory exists
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

async function downloadImage(url, filename) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    const filepath = path.join(imagesDir, filename);
    fs.writeFileSync(filepath, response.data);
    console.log(`✓ Downloaded: ${filename}`);
    return true;
  } catch (error) {
    console.log(`✗ Failed ${filename}:`, error.message);
    return false;
  }
}

async function main() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'trading_cards',
    user: 'carduser',
    password: 'cardpass',
  });

  try {
    await client.connect();
    console.log('Connected to database\n');

    // Get all cards
    const result = await client.query('SELECT id, name, "imageUrl", category FROM cards ORDER BY category, name');
    const cards = result.rows;

    console.log(`Found ${cards.length} cards\n`);

    let downloaded = 0;
    const updates = [];

    for (const card of cards) {
      // Create safe filename
      const safeFilename = card.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') + '.jpg';

      const localUrl = `/card-images/${safeFilename}`;

      console.log(`Processing: ${card.name} (${card.category})`);

      // Download image
      const success = await downloadImage(card.imageUrl, safeFilename);

      if (success) {
        downloaded++;
        updates.push({ id: card.id, url: localUrl });
      }

      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`\n\nUpdating database with local URLs...`);

    // Update database
    for (const update of updates) {
      await client.query(
        'UPDATE cards SET "imageUrl" = $1 WHERE id = $2',
        [update.url, update.id]
      );
    }

    console.log(`\n✅ Complete!`);
    console.log(`   Downloaded: ${downloaded}/${cards.length} images`);
    console.log(`   Updated: ${updates.length} database records`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
