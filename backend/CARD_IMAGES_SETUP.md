# Card Images Setup Guide

This guide provides multiple options for setting up card images in your environment.

## Problem Context

Card images were initially loading slowly from the external Pollinations.ai API. To improve performance, we now store images locally in the Docker container at `backend/public/card-images/`.

## Option 1: Download from Compressed Archive (Fastest)

**Best for:** Quick setup, git deployment (3.4 MB compressed)

### Steps:

1. Extract the compressed archive:
```bash
cd backend/public
tar -xzf card-images.tar.gz
```

2. Verify extraction:
```bash
ls card-images/*.jpg | wc -l
# Should show 97
```

3. Restart the backend:
```bash
docker-compose restart backend
```

**Status:** 97/120 images available locally, 23 still load from external API

---

## Option 2: Run Download Script (Most Complete)

**Best for:** Fresh setup, ensuring all images are attempted

### Steps:

1. Ensure Docker containers are running:
```bash
docker-compose up -d
```

2. Run the download script:
```bash
cd backend
node download-images-simple.js
```

3. The script will:
   - Connect to the PostgreSQL database
   - Download all card images from Pollinations.ai
   - Save to `backend/public/card-images/`
   - Update database URLs to point to local paths
   - Take ~2 minutes (1 second delay per card)

**Expected Results:**
- Downloads: 97/120 images (81% success rate)
- Failures: 23 images (API timeouts/502 errors)
- Failed images continue using external URLs

### Prerequisites:
- PostgreSQL database running (localhost:5432)
- `axios`, `fs`, `path`, `pg` packages installed
- Database credentials:
  - Database: `trading_cards`
  - User: `carduser`
  - Password: `cardpass`

---

## Option 3: Production Docker Volume (Recommended)

**Best for:** Production deployments, persistent storage

### Current Setup:

Images are stored in the Docker container's filesystem. To make them persistent:

1. Create a Docker volume in `docker-compose.yml`:
```yaml
services:
  backend:
    volumes:
      - ./backend/public/card-images:/app/public/card-images
```

2. Place images in `backend/public/card-images/` on the host
3. Container automatically serves them via static file middleware

**Advantages:**
- Images persist across container restarts
- Easy to update/add images without rebuilding
- Can be backed up independently

---

## Technical Details

### Static File Serving

The NestJS backend is configured to serve static files from the `public` directory:

```typescript
// backend/src/main.ts
app.useStaticAssets(join(__dirname, '..', 'public'), {
  prefix: '/',
});
```

### Database URLs

Card images are referenced in the database with full URLs:
```
http://localhost:3000/card-images/ancient-dragon-king.jpg
```

For production, update these URLs to your domain:
```sql
UPDATE cards
SET "imageUrl" = REPLACE("imageUrl", 'http://localhost:3000', 'https://your-domain.com')
WHERE "imageUrl" LIKE 'http://localhost:3000/card-images/%';
```

---

## Failed Downloads

These 23 cards failed to download (502/timeout errors):

**Dragons (13 cards):**
- Dragon Cultist
- Dragon Disciple
- Dragon Egg Guardian
- Dragon Hatchling
- Dragon Horn Blower
- Dragon Knight
- Dragon Mage
- Dragon Priest
- Dragon Rider
- Dragon Sage
- Dragon Wyrmling
- Dragonborn Warrior
- Ice Dragon
- Shadow Dragon
- Thunder Dragon

**Holy (8 cards):**
- Blessing Priest
- Holy Knight
- Incense Burner
- Prayer Monk
- Sacred Warrior
- Scripture Scholar
- Shield Bearer
- Temple Guardian

These cards continue loading from the external Pollinations.ai API:
```
https://image.pollinations.ai/prompt/[description]?width=400&height=600&nologo=true&model=flux
```

---

## Retry Failed Downloads

To retry downloading the failed images:

```bash
cd backend
node download-images-simple.js
```

The script will attempt to download all images again, including failed ones.

---

## Git Deployment Strategy

### Current Configuration:

- `.gitignore` excludes: `backend/public/card-images/`
- Compressed archive included: `backend/public/card-images.tar.gz` (3.4 MB)

### Deployment Workflow:

1. Clone repository
2. Extract images: `tar -xzf backend/public/card-images.tar.gz -C backend/public/`
3. Start Docker: `docker-compose up -d`
4. Images ready to serve

**Alternatively:** Run the download script on first deployment.

---

## Troubleshooting

### Images not loading

1. Check static file middleware is configured:
```bash
curl http://localhost:3000/card-images/ancient-dragon-king.jpg
```

2. Verify files exist:
```bash
ls backend/public/card-images/ | head -5
```

3. Check database URLs:
```sql
SELECT "imageUrl" FROM cards LIMIT 5;
```

### Database connection errors

Ensure PostgreSQL is accessible:
```bash
docker-compose ps
# Should show 'postgres' service running
```

### Permission errors

Ensure directory is writable:
```bash
chmod -R 755 backend/public/card-images/
```

---

## Image Naming Convention

Images are named using kebab-case based on card names:
- "Ancient Dragon King" → `ancient-dragon-king.jpg`
- "Leviathan Ocean Lord" → `leviathan-ocean-lord.jpg`
- Special characters removed, spaces replaced with hyphens

---

## Performance Impact

**Before (External API):**
- Load time: 2-5 seconds per image
- Depends on external service availability
- Network latency issues

**After (Local Storage):**
- Load time: < 100ms per image
- No external dependencies for 81% of images
- Instant loading from Docker container

**File Sizes:**
- Uncompressed: ~30 MB (97 images)
- Compressed: 3.4 MB (tar.gz)
- Average per image: ~310 KB
