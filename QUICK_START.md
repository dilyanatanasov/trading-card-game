# Quick Start Guide

## ✅ What's New

### 1. **New Users Get Starter Cards**
- Every new user now receives **3 random cards** when they register
- No need to wait until midnight for your first cards!

### 2. **Sell Cards Feature**
- Click **"Sell Card"** button on any card in your Collection
- Set your price (defaults to card's base value)
- Card is immediately listed in the Marketplace
- Other users can buy it

### 3. **AI-Generated Card Images** (Optional)
- See [AI_IMAGE_INTEGRATION.md](AI_IMAGE_INTEGRATION.md) for details
- Quick option: Use Pollinations.ai (free, no API key)
- Just update the `imageUrl` field when creating cards

## 🚀 How to Use

### Register a New Account
1. Go to http://localhost:5173
2. Click "Sign up"
3. Create account
4. You'll automatically get 3 starter cards!

### Sell a Card
1. Go to "Collection" page
2. Click "Sell Card" on any card
3. Enter price (in coins)
4. Click "List"
5. Card appears in Marketplace

### Buy a Card
1. Go to "Marketplace" page
2. Browse available cards
3. Click "Buy Card"
4. Card is added to your collection
5. Coins are deducted

### Get More Cards
- **Wait for midnight** - Automatic daily card distribution
- **Or claim manually** (for testing):
  ```bash
  node claim-daily-card.js
  ```

## 📋 Testing Checklist

- [x] Docker containers running
- [x] 8 sample cards created
- [x] Admin user has cards
- [x] New users get 3 starter cards
- [x] Can sell cards from collection
- [x] Can buy cards from marketplace
- [x] Daily card claim works
- [ ] Create a second user to test trading
- [ ] Test gifting between users

## 🎴 Card Rarity Weights

When claiming daily cards or getting starter packs:
- **Common** (Goblin Scout): 50% chance
- **Uncommon** (Forest Elf): 30% chance
- **Rare** (Knight, Dwarf): 15% chance
- **Epic** (Fire Mage, Shadow Assassin): 4% chance
- **Legendary** (Dragon, Ice Queen): 1% chance

## 💡 Tips

1. **Start with more coins**: Edit `.env` and restart, or give yourself coins via database
2. **Create more cards**: Use Swagger at http://localhost:3000/api
3. **Test trading**: Create 2 users and trade between them
4. **Use AI images**: Update `sample-cards.json` with Pollinations.ai URLs

## 🔧 Useful Commands

```bash
# Claim random card
node claim-daily-card.js

# Create sample cards
node seed-cards.js

# View logs
docker-compose logs -f

# Restart everything
docker-compose restart

# Stop everything
docker-compose down
```

## 🌐 URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api

## 🎯 Next Features to Build

- [ ] User profiles
- [ ] Trading system UI
- [ ] Gifting system UI
- [ ] Card statistics/analytics
- [ ] Leaderboard
- [ ] Chat system
- [ ] Notifications
- [ ] Card packs (buy multiple cards at once)
- [ ] Special events (double coins day, rare card day)
- [ ] Card evolution/upgrade system

Enjoy! 🎴
