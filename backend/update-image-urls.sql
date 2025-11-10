-- Update card image URLs to point to local backend server
-- This allows images to be served from the Docker container instead of external API
-- Run after downloading images with download-images-simple.js

UPDATE cards
SET "imageUrl" = 'http://localhost:3000' || "imageUrl"
WHERE "imageUrl" LIKE '/card-images/%';

-- Verify the update
SELECT
  COUNT(*) as total_local_images,
  (SELECT COUNT(*) FROM cards WHERE "imageUrl" LIKE 'http://localhost:3000/card-images/%') as updated_count
FROM cards
WHERE "imageUrl" LIKE 'http://localhost:3000/card-images/%';
