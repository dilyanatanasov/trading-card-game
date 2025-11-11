# 🗺️ Feature Roadmap - Trading Card Game

This document preserves the planned features and implementation order.

## 🎯 Mission: Add 5 Game-Changing Features

Transform the trading card game from a solid foundation into an engaging, feature-rich experience with progression systems, social features, and monetization opportunities.

---

## ✅ COMPLETED FEATURES

### Feature 1: Card Abilities System ✅

**Status:** COMPLETE
**Completion Date:** 2025-11-11
**Impact:** High - Adds strategic depth to battles

**What Was Added:**
- 4 legendary cards with unique abilities
- Server-side ability execution system
- 15+ ability types defined (area damage, lifesteal, resurrect, etc.)
- 8 trigger types (on_play, on_attack, on_destroy, etc.)
- Frontend display in Collection page with purple highlight
- ATK/DEF stats now visible on all cards

**Legendary Abilities:**
1. Ancient Dragon King - Dragon's Breath (800 AOE damage)
2. Leviathan Ocean Lord - Tidal Wave (500 HP lifesteal)
3. Shadow Demon Emperor - Soul Drain (600 direct player damage)
4. Archangel Supreme - Divine Resurrection (return to hand when destroyed)

**Files Changed:**
- Backend: 6 new files, 4 modified files
- Frontend: 1 modified file (Collection.tsx)
- Database: 1 migration

**How to See Abilities:**
- Go to Collection page
- Look for legendary cards
- Purple box shows ability name and description
- Lightning bolt icon (⚡) indicates special ability

---

## 🔄 IN PROGRESS

### Feature 2: Achievement System 🏅

**Status:** IN PROGRESS
**Priority:** High
**Estimated Complexity:** Medium

**Why This Feature:**
- Gives players goals beyond "win battles"
- Rewards milestone accomplishments
- Increases retention (achievement hunters)
- Shows off progress on profile
- Easy to implement, high engagement value

**Planned Achievements:**

**Battle Achievements:**
- 🥇 First Blood - Win your first battle (10 coins)
- 🔥 Winning Streak - Win 5 battles in a row (50 coins)
- ⚔️ Battle Veteran - Win 50 battles (200 coins)
- 👑 Battle Master - Win 100 battles (500 coins + rare card)
- ✨ Flawless Victory - Win without losing HP (100 coins)
- 💪 Comeback King - Win from below 1000 HP (75 coins)
- 🎯 Perfect Placement - Win using only 3 cards (150 coins)

**Collection Achievements:**
- 📚 Collector - Own 50 cards (100 coins)
- 💎 Treasure Hunter - Own 10 rare cards (150 coins)
- ⭐ Legendary Hunter - Own 5 legendary cards (300 coins)
- 🐉 Dragon Master - Own all 30 Dragon cards (500 coins + legendary)
- 🌊 Ocean Master - Own all 30 Aqua cards (500 coins + legendary)
- 🌑 Dark Master - Own all 30 Dark cards (500 coins + legendary)
- ☀️ Holy Master - Own all 30 Holy cards (500 coins + legendary)
- 🎨 Full Collection - Own all 120 cards (2000 coins + special title)

**Social Achievements:**
- 👥 Friendly - Send 5 friend requests (25 coins)
- 🤝 Trader - Complete 10 trades (100 coins)
- 🎁 Gift Giver - Send 20 gifts (150 coins)
- 💰 Merchant - Sell 50 cards on marketplace (200 coins)

**Economic Achievements:**
- 💵 Wealthy - Accumulate 10,000 coins (Title: "Rich")
- 💸 Big Spender - Spend 5,000 coins (100 coins)
- 🛒 Bargain Hunter - Buy 20 marketplace cards (150 coins)

**Technical Implementation:**

**Database Tables:**
```sql
-- Achievement definitions
CREATE TABLE achievements (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50), -- battle, collection, social, economic
  icon VARCHAR(255),
  requirement_type VARCHAR(50), -- win_battles, own_cards, etc.
  requirement_value INTEGER,
  reward_coins INTEGER DEFAULT 0,
  reward_card_id UUID REFERENCES cards(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- User achievement progress
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  achievement_id UUID REFERENCES achievements(id),
  progress INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
```

**Backend Services:**
- `AchievementService` - CRUD operations
- `AchievementTrackerService` - Track events and update progress
- Event listeners for automatic tracking

**Frontend Components:**
- Achievements page showing all achievements
- Progress bars for partially complete
- Badge display on user profile
- Achievement unlock notification/toast
- Filter by category (all, battle, collection, social, economic)
- Sort by: locked first, progress, alphabetical

**API Endpoints:**
```typescript
GET /achievements - Get all achievements
GET /achievements/user/:userId - Get user's achievement progress
POST /achievements/:id/check - Manually check achievement progress
```

---

## ⏳ PENDING FEATURES

### Feature 3: Daily Quests 📋

**Status:** PENDING
**Priority:** High
**Estimated Complexity:** Medium

**Why This Feature:**
- Drives daily engagement (log in every day)
- Gives players short-term goals
- Rewards active players
- Creates daily ritual/habit
- Increases retention by 40-60% (proven in other games)

**Quest System Design:**

**Daily Quests (3 per day, refresh at midnight):**
- Win 3 battles → 100 coins
- Play 10 Dragon cards → 1 random Dragon card
- Deal 5000 total damage → 50 coins
- Place 15 cards in battles → 75 coins
- Destroy 5 enemy cards → 50 coins
- Win 1 battle with only Common cards → 100 coins
- Complete 1 trade → 50 coins

**Weekly Quests (reset every Monday):**
- Win 20 battles → 500 coins + 1 epic card
- Complete 5 trades → 300 coins
- Collect 7 daily cards → 200 coins
- Sell 10 cards on marketplace → 250 coins
- Win 5 battles with each race (20 total) → 1000 coins + legendary

**Quest Mechanics:**
- Quest slots: 3 daily, 2 weekly
- Quest reroll: 1 free reroll per day (cost: 10 coins after)
- Auto-tracking: Progress updates automatically
- Claim rewards: Manual claim required

**Technical Implementation:**

**Database Tables:**
```sql
CREATE TABLE quests (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  type VARCHAR(20), -- daily, weekly
  requirement_type VARCHAR(50), -- win_battles, play_cards, etc.
  requirement_value INTEGER,
  reward_coins INTEGER,
  reward_card_rarity VARCHAR(20),
  active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_quests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  quest_id UUID REFERENCES quests(id),
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  claimed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Services:**
- `QuestService` - Quest generation and management
- `QuestTrackerService` - Track progress
- Scheduled job for daily/weekly refresh

**Frontend:**
- Quests page showing active quests
- Progress bars with current/required values
- Claim rewards button (glows when complete)
- Timer showing refresh countdown
- Quest history

---

### Feature 4: Guilds/Clans System 🛡️

**Status:** PENDING
**Priority:** High
**Estimated Complexity:** High

**Why This Feature:**
- Creates social bonds (players stay for their guild)
- Enables team-based content
- Adds long-term engagement
- Creates community leaders
- Players recruit friends to join guild

**Guild Features:**

**Core Guild System:**
- Create guild (cost: 1000 coins)
- Guild name, description, emblem/icon
- Member limit: 50 players
- Guild roles: Leader, Officer (3 max), Member
- Guild level (based on collective activity)

**Guild Chat:**
- Real-time guild chat via WebSocket
- Text messages
- Emotes/stickers
- Announcements channel (officers only)
- Message history (last 100 messages)

**Guild Bank:**
- Members can donate coins/cards
- Officers can distribute resources
- Used for guild events/rewards

**Guild Quests:**
- Collective goals (e.g., "Guild members win 100 battles this week")
- All members contribute progress
- Rewards distributed to all active members

**Guild Wars (PvP Tournaments):**
- Weekly tournaments between guilds
- Bracket-style elimination
- Guild ranking/leaderboard
- Prestige points for winning

**Guild Perks:**
- XP bonus for guild members
- Coin bonus on marketplace sales
- Priority queue for battles
- Special guild card backs

**Technical Implementation:**

**Database Tables:**
```sql
CREATE TABLE guilds (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  emblem VARCHAR(255),
  leader_id UUID REFERENCES users(id),
  member_count INTEGER DEFAULT 1,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  coins_bank INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE guild_members (
  id UUID PRIMARY KEY,
  guild_id UUID REFERENCES guilds(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR(20), -- leader, officer, member
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id) -- User can only be in one guild
);

CREATE TABLE guild_messages (
  id UUID PRIMARY KEY,
  guild_id UUID REFERENCES guilds(id),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Services:**
- `GuildService` - CRUD operations
- `GuildChatGateway` - WebSocket for real-time chat
- Permission system (leader, officer, member)

**Frontend:**
- Guild creation page
- Guild discovery/browser
- Guild profile page
- Member management (invite, kick, promote)
- Guild chat interface
- Guild quests tracker

---

### Feature 5: Card Packs & Gacha System 🎁

**Status:** PENDING
**Priority:** Medium
**Estimated Complexity:** Medium

**Why This Feature:**
- Monetization opportunity (sell packs)
- Exciting opening experience
- Alternative to marketplace for getting cards
- Gacha mechanics = proven engagement driver
- Players love opening packs!

**Pack Types:**

**Common Pack** - 100 coins
- 5 cards per pack
- Rarity Distribution:
  - 50% Common
  - 30% Uncommon
  - 15% Rare
  - 4% Epic
  - 1% Legendary

**Rare Pack** - 300 coins
- 5 cards per pack
- Guaranteed 1 rare or better
- Rarity Distribution:
  - 20% Common
  - 30% Uncommon
  - 30% Rare
  - 15% Epic
  - 5% Legendary

**Legendary Pack** - 1000 coins
- 3 cards per pack
- Guaranteed 1 legendary
- Rarity Distribution:
  - 0% Common
  - 20% Uncommon
  - 30% Rare
  - 30% Epic
  - 20% Legendary

**Race-Specific Packs** - 250 coins
- 5 cards from specific race (Dragon, Aqua, Dark, Holy)
- Standard rarity distribution
- Great for completing race collections

**Gacha Mechanics:**

**Pity System:**
- Counter tracks packs opened without legendary
- Every 40 packs: guaranteed legendary (resets counter)
- Displayed on pack shop UI

**Duplicate Protection:**
- After owning 3 copies of a card, reduced chance of pulling more
- "Smart pack" option: costs 20% more, avoids duplicates

**Pack Opening Experience:**

**Animation Sequence:**
1. Pack appears on screen (3D model)
2. User clicks to open
3. Cards fly out one by one
4. Each card flips to reveal (with sparkles)
5. Rarity glow effect (color-coded)
6. Legendary cards have special animation (golden rays)
7. Final summary showing all cards
8. Auto-add to collection

**Technical Implementation:**

**Database Tables:**
```sql
CREATE TABLE packs (
  id UUID PRIMARY KEY,
  name VARCHAR(100),
  description TEXT,
  price_coins INTEGER,
  card_count INTEGER,
  rarity_weights JSONB, -- {common: 50, uncommon: 30, ...}
  race_filter VARCHAR(20), -- null for all races
  image_url VARCHAR(255)
);

CREATE TABLE pack_openings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pack_id UUID REFERENCES packs(id),
  cards_received JSONB, -- Array of card IDs
  legendary_pity_counter INTEGER, -- Track pity system
  opened_at TIMESTAMP DEFAULT NOW()
);
```

**Backend Services:**
- `PackService` - Pack generation and opening logic
- Rarity roll algorithm with pity system
- Duplicate checking

**Frontend:**
- Pack shop page
- Pack opening animation (React Spring / Framer Motion)
- Visual effects (sparkles, glow, rays)
- Sound effects (optional)
- Pack opening history

---

## 📊 Implementation Timeline

**Week 1:**
- ✅ Feature 1: Card Abilities (DONE)
- 🔄 Feature 2: Achievement System

**Week 2:**
- Feature 3: Daily Quests

**Week 3:**
- Feature 4: Guilds/Clans (Part 1 - Core system)

**Week 4:**
- Feature 4: Guilds/Clans (Part 2 - Chat & Quests)
- Feature 5: Card Packs

**Week 5:**
- Polish, testing, and balance adjustments
- Bug fixes
- User feedback integration

---

## 🎯 Success Metrics

Track these metrics to measure feature success:

**Engagement:**
- Daily Active Users (DAU)
- Session length
- Return rate (day 1, day 7, day 30)

**Feature Adoption:**
- % of users with achievements unlocked
- % of users completing daily quests
- % of users in guilds
- Packs opened per user

**Monetization (if applicable):**
- Pack purchase rate
- Average revenue per user (ARPU)
- Conversion rate (free → paying)

**Social:**
- Guild creation rate
- Average guild size
- Guild chat messages per day
- Trades/gifts per user

---

## 🔮 Future Enhancements (Post-Launch)

**Phase 2 Features:**
- PvE Story Campaign
- 2v2 Team Battles
- Seasonal Ranked Ladder
- Card Crafting/Disenchanting
- Spectator Mode
- Tournament Brackets
- Friend System Overhaul
- Card Evolution/Fusion
- More Card Abilities (50+ total)
- Boss Raid Events

**Quality of Life:**
- Deck Builder with presets
- Battle replay system
- Detailed statistics page
- Leaderboards
- Chat improvements
- Mobile app (React Native)

---

## 📝 Notes

- All features designed with dark mode support
- All features use TypeScript for type safety
- All database changes include migrations
- All features tested before release
- User feedback gathered after each feature

---

*Last Updated: 2025-11-11*
*Features Completed: 1/5 (20%)*
*Current Focus: Achievement System*
