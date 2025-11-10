-- Clear all user cards first
DELETE FROM user_cards;

-- Redistribute cards to users by race
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

-- Verify the distribution
SELECT
  u.email,
  c.category,
  COUNT(uc.id) as card_count
FROM users u
LEFT JOIN user_cards uc ON u.id = uc."userId"
LEFT JOIN cards c ON uc."cardId" = c.id
GROUP BY u.email, c.category
ORDER BY u.email, c.category;
