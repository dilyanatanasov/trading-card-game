# Trading Card App - Setup Guide

## Current Status

✅ Backend is fully set up with NestJS + TypeORM + PostgreSQL
✅ Docker Compose configuration is ready
✅ Frontend package.json with TypeScript configured
✅ TypeScript types and API services created

## Quick Start

### 1. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Start with Docker (Recommended)

```bash
# From root directory
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Backend API on http://localhost:3000
- Frontend on http://localhost:5173

### 3. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api

### 4. Seed Initial Data (Optional)

You'll need to create some initial cards. You can use the Swagger UI at http://localhost:3000/api to:
1. Register a user
2. Login to get a token
3. Create cards using the POST /cards endpoint

Example card data:
```json
{
  "name": "Dragon Warrior",
  "description": "A powerful dragon warrior from the mountains",
  "imageUrl": "https://via.placeholder.com/300x400?text=Dragon+Warrior",
  "rarity": "rare",
  "baseValue": 500,
  "category": "Fantasy"
}
```

## Remaining Frontend Files to Create

I've set up the foundation. Here are the remaining files you need to create:

### 1. src/main.tsx
```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
```

### 2. src/context/AuthContext.tsx
```tsx
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

### 3. Pages to Create

Create these in `src/pages/`:
- Login.tsx
- Register.tsx
- Dashboard.tsx
- Collection.tsx
- Trading.tsx
- Marketplace.tsx
- Gifts.tsx

### 4. Components to Create

Create these in `src/components/`:
- Layout.tsx (navigation and layout wrapper)
- CardItem.tsx (display individual cards)
- Modal.tsx (reusable modal using Headless UI)

## Project Structure

```
trading-card-app/
├── backend/                  # NestJS backend ✅
├── frontend/                 # React + TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React Context (Auth) ✅
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services ✅
│   │   ├── types/           # TypeScript types ✅
│   │   ├── App.tsx          # Main App component
│   │   ├── index.css        # ✅ Tailwind styles
│   │   └── main.tsx         # Entry point
│   ├── package.json         # ✅
│   ├── tsconfig.json        # ✅
│   ├── tailwind.config.js   # ✅
│   └── vite.config.ts       # ✅
├── docker-compose.yml       # ✅
├── .env                     # ✅
└── README.md                # ✅
```

## Features Implemented

### Backend
- ✅ User authentication (JWT)
- ✅ Card management
- ✅ Daily card distribution (cron job)
- ✅ Trading system
- ✅ Gift system
- ✅ Marketplace (buy/sell)
- ✅ Swagger API documentation

### Frontend (Foundation)
- ✅ TypeScript setup
- ✅ Tailwind CSS
- ✅ Headless UI + Floating UI
- ✅ API service layer
- ✅ TypeScript types
- ⏳ Auth context
- ⏳ Pages and components

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Headless UI + Floating UI
- **Backend**: NestJS + TypeORM + PostgreSQL
- **Authentication**: JWT
- **Containerization**: Docker + Docker Compose

## Development Tips

1. Use the Swagger UI for testing API endpoints
2. Check Docker logs if services don't start: `docker-compose logs`
3. The backend will auto-sync database schema in development mode
4. Hot reload is enabled for both frontend and backend

## Troubleshooting

### Database Connection Issues
```bash
docker-compose down -v
docker-compose up -d postgres
# Wait 5 seconds
docker-compose up -d backend frontend
```

### Port Already in Use
Check and kill processes:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

## Next Steps

1. Create the remaining frontend components and pages
2. Add sample card images
3. Implement real-time updates (optional: Socket.IO)
4. Add pagination for large collections
5. Implement card filtering and sorting
6. Add user profiles
7. Create admin panel for card management

Happy coding! 🎴
