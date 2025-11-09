-- Update existing cards with new attack/defense stats based on rarity

-- God Tier Cards (if they exist)
UPDATE cards SET attack = 200, defense = 180, "baseValue" = 5000 WHERE name = 'Primordial Dragon God';
UPDATE cards SET attack = 180, defense = 200, "baseValue" = 4500 WHERE name = 'Eternal Phoenix';
UPDATE cards SET attack = 190, defense = 190, "baseValue" = 4800 WHERE name = 'Void Sovereign';

-- Legendary Cards
UPDATE cards SET attack = 120, defense = 100, "baseValue" = 1000 WHERE name = 'Dragon Warrior';
UPDATE cards SET attack = 110, defense = 110, "baseValue" = 1200 WHERE name = 'Ice Queen';

-- Epic Cards
UPDATE cards SET attack = 95, defense = 55, "baseValue" = 750 WHERE name = 'Fire Mage';
UPDATE cards SET attack = 105, defense = 45, "baseValue" = 800 WHERE name = 'Shadow Assassin';
UPDATE cards SET attack = 90, defense = 60, "baseValue" = 780 WHERE name = 'Thunder Paladin';

-- Rare Cards
UPDATE cards SET attack = 65, defense = 85, "baseValue" = 500 WHERE name = 'Knight Protector';
UPDATE cards SET attack = 60, defense = 75, "baseValue" = 450 WHERE name = 'Dwarf Smith';
UPDATE cards SET attack = 55, defense = 70, "baseValue" = 480 WHERE name = 'Battle Cleric';

-- Uncommon Cards
UPDATE cards SET attack = 50, defense = 35, "baseValue" = 250 WHERE name = 'Forest Elf';
UPDATE cards SET attack = 45, defense = 40, "baseValue" = 280 WHERE name = 'Mystic Scholar';

-- Common Cards
UPDATE cards SET attack = 25, defense = 20, "baseValue" = 100 WHERE name = 'Goblin Scout';
UPDATE cards SET attack = 30, defense = 25, "baseValue" = 120 WHERE name = 'Town Guard';
UPDATE cards SET attack = 20, defense = 15, "baseValue" = 90 WHERE name = 'Apprentice Mage';
