# Deployment Guide

Quick start guide for deploying the Trading Card App.

## Quick Start

```bash
# 1. Clone repository
git clone <repository-url>
cd claude-code-app

# 2. Setup card images (choose one option)

# Option A: Extract compressed archive (FASTEST - 3.4 MB)
cd backend/public
tar -xzf card-images.tar.gz
cd ../..

# Option B: Download fresh images (~2 minutes)
docker-compose up -d
cd backend && node download-images-simple.js && cd ..

# 3. Start application
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:5173
# Backend: http://localhost:3000
# API Docs: http://localhost:3000/api
```

## Environment Setup

### Requirements
- Docker & Docker Compose
- Node.js 18+ (for local development)
- Git

### Environment Variables

Create `.env` files if needed:

**Backend (.env):**
```env
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=carduser
DATABASE_PASSWORD=cardpass
DATABASE_NAME=trading_cards
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:3000
```

## Card Images

The app includes 120 fantasy card images. See [backend/CARD_IMAGES_SETUP.md](backend/CARD_IMAGES_SETUP.md) for detailed setup instructions.

**Quick Facts:**
- 97 images included in git (compressed: 3.4 MB)
- 23 load from external API (fallback)
- Extracted size: ~30 MB

## Docker Services

```yaml
services:
  - postgres: Database (port 5432)
  - backend: NestJS API (port 3000)
  - frontend: React Vite (port 5173)
```

### Common Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

## Database Initialization

Database is automatically initialized with seed data:
- 120 cards (4 races: Dragons, Aqua, Dark, Holy)
- Admin user: `admin@cards.local` / `admin123`

To reset database:
```bash
docker-compose down -v
docker-compose up -d
```

## Production Deployment

### 1. Update Image URLs

For production domains, update image URLs in database:

```sql
UPDATE cards
SET "imageUrl" = REPLACE("imageUrl", 'http://localhost:3000', 'https://yourdomain.com')
WHERE "imageUrl" LIKE 'http://localhost:3000/card-images/%';
```

### 2. Environment Variables

Update all `localhost` references to production URLs:
- `FRONTEND_URL`
- `VITE_API_URL`
- Card image URLs in database

### 3. Docker Volume for Images

For persistent storage, mount card images as volume:

```yaml
services:
  backend:
    volumes:
      - ./backend/public/card-images:/app/public/card-images
```

### 4. HTTPS & Security

- Enable HTTPS (recommend: nginx reverse proxy)
- Update CORS settings in `backend/src/main.ts`
- Use strong JWT_SECRET
- Secure database credentials

## Troubleshooting

### Images not loading
```bash
# Verify files exist
ls backend/public/card-images/ | wc -l

# Test image URL
curl http://localhost:3000/card-images/ancient-dragon-king.jpg

# Check backend logs
docker-compose logs backend
```

### Database connection errors
```bash
# Check postgres is running
docker-compose ps postgres

# View postgres logs
docker-compose logs postgres
```

### Frontend can't reach backend
```bash
# Verify backend is accessible
curl http://localhost:3000/cards

# Check CORS settings in backend/src/main.ts
```

## Architecture

```
Frontend (React)
    ↓
Backend API (NestJS)
    ↓
PostgreSQL Database

Static Files:
- Served by NestJS from backend/public/
- Card images at /card-images/*.jpg
```

## Features

- Daily card distribution
- Card collection & marketplace
- Gift & trade system
- Real-time battles (WebSocket)
- Dark mode
- Race-based cards (Dragons, Aqua, Dark, Holy)

## API Documentation

Swagger docs available at: `http://localhost:3000/api`

## Support

For detailed card image setup, see: [backend/CARD_IMAGES_SETUP.md](backend/CARD_IMAGES_SETUP.md)
