# Trading Card App

## Overview
A simple trading card app where users receive a card each day and can gift, trade, or buy cards.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Headless UI + Floating UI + Socket.IO Client
- **Backend**: Nest.js + TypeORM + Socket.IO + WebSockets
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose
- **Real-time**: WebSocket connections for live battle updates

## Restrictions & Requirements
- Frontend must use TypeScript (.tsx files)
- All new features and restrictions must be documented in this file

## Features
- Daily card distribution (automatic at midnight)
- Manual daily card claim (GET /cards/daily/claim for testing)
- Add cards to collection (POST /cards/add-to-collection/:cardId for testing)
- New users receive 3 random starter cards upon registration
- Sell cards in marketplace (directly from collection page)
- Gift cards to other users (full send/receive/claim workflow)
- Trade cards with friends (create trades, accept/reject, view history)
- Buy cards from the marketplace
- **Turn-based card battle game**:
  - 5x2 board (5 positions per player)
  - Cards have attack and defense stats
  - Each turn: place one card OR perform one action (attack/switch mode)
  - Attack mode vs Defense mode switching (defense mode rotates card 90°)
  - Direct player attacks when opponent has no cards on their field
  - Attacking cards: remaining damage (attack - defense) dealt to opponent's health
  - Players start with 5000 HP
  - Win/loss record tracking
  - Create/join game lobbies
  - Auto-end turn after actions
  - **Real-time updates**: WebSocket-powered instant synchronization between players (no polling)
- Dark mode toggle with localStorage persistence
- Epic fantasy-themed UI with gradient backgrounds and glow effects

## UI Theme
- **Fantasy Fonts**: Cinzel for headings, Inter for body text
- **Color Scheme**: Purple/violet primary colors with gradient overlays
- **Dark Mode**: Full dark mode support across all pages
- **Card Rarity System**:
  - Legendary: Purple/pink gradient with purple glow
  - Epic: Red/orange gradient with red glow
  - Rare: Blue/cyan gradient with blue glow
  - Uncommon: Green/emerald gradient with green glow
  - Common: Gray styling
- **Visual Effects**:
  - Backdrop blur on cards
  - Hover glow effects
  - Smooth transitions
  - Rarity-based card borders (4px for legendary/epic/rare/uncommon)

## Card Images
- Using AI-generated fantasy artwork from Pollinations.ai (free, no API key required)
- All cards feature unique fantasy-themed AI art using Flux model
- Image URL format: `https://image.pollinations.ai/prompt/[description]?width=400&height=600&nologo=true&model=flux`
- See sample-cards.json for examples

## Deployment
- Easily deployable with multiple environments:
    - Development
    - Production

## Setup Instructions

### Frontend
1. Create a new React app using Vite:
     ```bash
     npm create vite@latest trading-card-app --template react
     cd trading-card-app
     npm install
     ```

### Backend
1. Set up a new Nest.js project:
     ```bash
     npm i -g @nestjs/cli
     nest new trading-card-backend
     cd trading-card-backend
     npm install @nestjs/typeorm typeorm pg
     ```

### Docker
1. Create a `Dockerfile` for both frontend and backend.
2. Use Docker Compose to manage multi-container applications.

### Environment Configuration
- Use `.env` files for different environments (dev, prod).

## Conclusion
This trading card app will provide an engaging experience for users while leveraging modern technologies for scalability and maintainability.  