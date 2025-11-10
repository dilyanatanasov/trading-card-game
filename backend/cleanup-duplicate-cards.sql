-- Delete duplicate cards, keeping only the most recently created ones
-- This will remove the old 8 cards per race and keep the new 30

-- For each duplicate card (same name and category), delete the older ones
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

-- Verify we now have exactly 30 cards per race
SELECT category, COUNT(*) as total FROM cards GROUP BY category ORDER BY category;

-- Rebuild user_cards to use the remaining cards
-- First, clear all user cards
DELETE FROM user_cards;

-- User 1: Dragons (30 unique cards)
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Dragons';

-- User 2: Aqua (30 unique cards)
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177+2@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Aqua';

-- User 3 (admin): Dark (30 unique cards)
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'admin@cards.local'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Dark';

-- User 4: Holy (30 unique cards)
INSERT INTO user_cards ("userId", "cardId", quantity, "isFavorite", "acquiredAt")
SELECT
  (SELECT id FROM users WHERE email = 'dilyanatanasov177+3@gmail.com'),
  id,
  1,
  false,
  NOW()
FROM cards
WHERE category = 'Holy';

-- Final verification
SELECT
  u.email,
  c.category,
  COUNT(uc.id) as card_count
FROM users u
LEFT JOIN user_cards uc ON u.id = uc."userId"
LEFT JOIN cards c ON uc."cardId" = c.id
GROUP BY u.email, c.category
ORDER BY u.email, c.category;
