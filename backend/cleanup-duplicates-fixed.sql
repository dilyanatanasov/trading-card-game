-- Step 1: Clear all user cards first to avoid foreign key constraints
DELETE FROM user_cards;

-- Step 2: Delete duplicate cards, keeping only the most recently created ones
DELETE FROM cards
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY name, category ORDER BY "createdAt" DESC) as rn
    FROM cards
  ) sub
  WHERE rn > 1
);

-- Step 3: Verify we now have exactly 30 cards per race
SELECT 'Card counts by race:' as info;
SELECT category, COUNT(*) as total FROM cards GROUP BY category ORDER BY category;

-- Step 4: Redistribute cards to users (30 unique cards each, no duplicates)

-- User 1: Dragons
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Dragons';

-- User 2: Aqua
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177+2@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Aqua';

-- User 3 (admin): Dark
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'admin@cards.local'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Dark';

-- User 4: Holy
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177+3@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Holy';

-- Step 5: Final verification
SELECT 'User card distribution:' as info;
SELECT
  u.email,
  c.category,
  COUNT(uc.id) as card_count
FROM users u
LEFT JOIN user_cards uc ON u.id = uc."userId"
LEFT JOIN cards c ON uc."cardId" = c.id
GROUP BY u.email, c.category
ORDER BY u.email, c.category;
