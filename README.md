# Trading Card App

A full-stack trading card application where users receive a daily card and can gift, trade, or buy cards from other users.

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + Headless UI + Floating UI
- **Backend**: Nest.js + TypeORM
- **Database**: PostgreSQL
- **Containerization**: Docker + Docker Compose

## Features

- 🎴 Daily card distribution (automatic)
- 🎁 Gift cards to other users
- 🔄 Trade cards with friends
- 🛒 Buy/sell cards in the marketplace
- 👤 User authentication and profiles
- 📊 Card collection management

## Quick Start

### Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ (for local development)

### Setup

1. Clone the repository and navigate to the project:
   ```bash
   cd claude-code-app
   ```

2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

3. Start all services with Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api

### Local Development (without Docker)

#### Backend Setup

```bash
cd backend
npm install
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

#### Database Setup

Make sure PostgreSQL is running locally and update the `.env` file with your local database credentials.

## Project Structure

```
trading-card-app/
├── backend/                 # Nest.js backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── users/          # User management
│   │   ├── cards/          # Card entities and logic
│   │   ├── trades/         # Trading system
│   │   ├── gifts/          # Gifting system
│   │   ├── marketplace/    # Buy/sell functionality
│   │   └── scheduler/      # Daily card distribution
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `GET /auth/profile` - Get current user profile

### Cards
- `GET /cards` - Get all cards
- `GET /cards/my-collection` - Get user's card collection
- `GET /cards/:id` - Get specific card details

### Trading
- `POST /trades` - Create trade offer
- `GET /trades` - Get all trades
- `PUT /trades/:id/accept` - Accept trade
- `PUT /trades/:id/reject` - Reject trade

### Gifting
- `POST /gifts` - Send gift
- `GET /gifts` - Get received gifts
- `PUT /gifts/:id/claim` - Claim gift

### Marketplace
- `GET /marketplace` - Get marketplace listings
- `POST /marketplace` - List card for sale
- `POST /marketplace/:id/buy` - Buy card

## Environment Variables

See `.env.example` for all available configuration options.

## Deployment

### Production Build

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Environment-Specific Configuration

- Development: `.env`
- Production: `.env.production`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
