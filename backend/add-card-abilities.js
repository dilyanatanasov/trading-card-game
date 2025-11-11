const { Client } = require('pg');

const legendaryAbilities = {
  'Ancient Dragon King': {
    id: 'dragon_breath',
    name: 'Dragon\'s Breath',
    description: 'When played, deal 800 damage to all enemy cards in the same row.',
    type: 'area_damage',
    trigger: 'on_play',
    value: 800,
    target: 'enemy_row',
  },
  'Leviathan Ocean Lord': {
    id: 'tidal_wave',
    name: 'Tidal Wave',
    description: 'When this card attacks and destroys an enemy, heal yourself for 500 HP.',
    type: 'lifesteal',
    trigger: 'on_attack',
    value: 500,
    target: 'self',
  },
  'Shadow Demon Emperor': {
    id: 'soul_drain',
    name: 'Soul Drain',
    description: 'When played, deal 600 damage directly to the enemy player.',
    type: 'direct_damage',
    trigger: 'on_play',
    value: 600,
    target: 'player',
  },
  'Archangel Supreme': {
    id: 'divine_resurrection',
    name: 'Divine Resurrection',
    description: 'When destroyed, return this card to your hand. Can only trigger once per game.',
    type: 'resurrect',
    trigger: 'on_destroy',
    target: 'self',
    usesPerGame: 1,
  },
};

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

    // Run migration first
    console.log('Running migration...');
    await client.query(`
      ALTER TABLE cards ADD COLUMN IF NOT EXISTS ability jsonb;
    `);
    console.log('✓ Migration complete\n');

    let updated = 0;

    for (const [cardName, ability] of Object.entries(legendaryAbilities)) {
      console.log(`Updating: ${cardName}`);
      console.log(`  Ability: ${ability.name}`);
      console.log(`  ${ability.description}\n`);

      const result = await client.query(
        `UPDATE cards SET ability = $1 WHERE name = $2 RETURNING id`,
        [JSON.stringify(ability), cardName]
      );

      if (result.rowCount > 0) {
        updated++;
      }
    }

    console.log(`✅ Complete!`);
    console.log(`   Updated ${updated}/${Object.keys(legendaryAbilities).length} legendary cards with abilities`);

    // Show updated cards
    console.log('\nLegendary Cards with Abilities:');
    const cards = await client.query(`
      SELECT name, ability->>'name' as ability_name, ability->>'description' as ability_desc
      FROM cards
      WHERE ability IS NOT NULL
      ORDER BY name;
    `);

    cards.rows.forEach(card => {
      console.log(`\n${card.name}:`);
      console.log(`  ${card.ability_name}`);
      console.log(`  ${card.ability_desc}`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
