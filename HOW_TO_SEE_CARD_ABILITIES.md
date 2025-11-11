# 🎴 How to See Card Abilities

Quick guide to viewing and understanding card abilities in the game.

---

## 📍 Where to See Abilities

### Option 1: Collection Page (Recommended) ⭐

**Steps:**
1. Navigate to **Collection** in the main menu
2. Scroll through your cards
3. Look for **Legendary rarity** cards (purple/pink glow)
4. Ability information appears in a **purple highlighted box**

**What You'll See:**
```
┌────────────────────────────────────┐
│  [Card Image]                      │
│                                    │
│  Ancient Dragon King               │
│  Epic fantasy dragon description   │
│                                    │
│  LEGENDARY                         │
│  ⚜ Value: 5000 coins              │
│                                    │
│  ⚔️ ATK: 3500    🛡️ DEF: 3200    │
│                                    │
│  ┌──────────────────────────────┐ │
│  │ ⚡ Dragon's Breath           │ │
│  │ When played, deal 800 damage │ │
│  │ to all enemy cards in the    │ │
│  │ same row.                    │ │
│  └──────────────────────────────┘ │
│  [Purple highlighted ability box] │
└────────────────────────────────────┘
```

**Visual Indicators:**
- **Lightning Bolt (⚡)** - Indicates special ability
- **Purple Box** - Only appears on cards with abilities
- **ATK/DEF Stats** - Now visible on all cards

---

### Option 2: During Battle

**When Playing a Card:**
1. Select a legendary card from your hand
2. Place it on the board
3. Ability triggers **automatically**
4. Watch for effects:
   - **Area Damage**: Enemy cards destroyed
   - **Direct Damage**: Enemy HP drops
   - **Lifesteal**: Your HP increases
   - **Resurrect**: Card returns to hand when destroyed

**Backend Logs (for developers):**
Open browser console or check backend logs to see:
```
🔥 ABILITY TRIGGERED: Dragon's Breath
   Card: Ancient Dragon King
   Trigger: on_play
   Description: When played, deal 800 damage to all enemy cards in the same row.
   Targeting 2 enemy cards in row 1
   Hitting Shadow Imp (50 DEF) with 800 damage
   💀 Shadow Imp destroyed!
```

---

## 🎮 Current Legendary Cards with Abilities

### 1. Ancient Dragon King 🐉
**Ability:** Dragon's Breath
- **Trigger:** When played (ON_PLAY)
- **Effect:** Deal 800 damage to all enemy cards in the same row
- **Strategy:** Play when enemy has multiple weak cards in a row
- **Best Against:** Swarm strategies

### 2. Leviathan Ocean Lord 🌊
**Ability:** Tidal Wave
- **Trigger:** When attacking (ON_ATTACK)
- **Effect:** Heal 500 HP when destroying an enemy card
- **Strategy:** Use for sustain in long battles
- **Best Against:** Attrition battles

### 3. Shadow Demon Emperor 👿
**Ability:** Soul Drain
- **Trigger:** When played (ON_PLAY)
- **Effect:** Deal 600 damage directly to enemy player
- **Strategy:** Finisher when enemy is low HP
- **Best Against:** Defensive players hiding behind cards

### 4. Archangel Supreme 😇
**Ability:** Divine Resurrection
- **Trigger:** When destroyed (ON_DESTROY)
- **Effect:** Return to hand (once per game)
- **Strategy:** Bait enemy into wasting resources
- **Best Against:** Removal-heavy decks

---

## 🔍 How to Get Legendary Cards

**Method 1: Daily Card Claim**
- Go to Dashboard
- Click "Claim Daily Card"
- 1% chance of legendary

**Method 2: Starter Pack**
- New users get 30 random cards
- ~1% chance per card = ~0.3 legendaries expected

**Method 3: Marketplace**
- Check Marketplace for legendary listings
- Expensive (1000-5000 coins)
- Guaranteed specific card

**Method 4: Trading**
- Trade with other players
- Negotiate multi-card deals

**Method 5: Gifts**
- Other players can gift you legendary cards
- Check Gifts page

---

## 💡 Tips & Tricks

### Ability Timing
- **Dragon's Breath**: Best when enemy has 2-3 cards in a row
- **Soul Drain**: Save for finishing blow (600 damage is significant!)
- **Tidal Wave**: Attack high-defense enemies for big heals
- **Divine Resurrection**: Don't fear trades - you get the card back!

### Strategic Combos
- **Ancient Dragon King** + weak board = easy clear
- **Shadow Demon Emperor** → Follow-up attack = potential lethal
- **Leviathan Ocean Lord** + attack mode = continuous healing
- **Archangel Supreme** → Place again after resurrection = double value

### Counter-Play
- **vs Dragon's Breath**: Spread cards across rows, don't clump
- **vs Soul Drain**: Stay above 600 HP when they have 5+ mana
- **vs Tidal Wave**: Don't let it attack your high-defense cards
- **vs Divine Resurrection**: Plan for it coming back

---

## 🐛 Troubleshooting

### "I don't see abilities on my cards"

**Possible Causes:**
1. **You don't own legendary cards yet**
   - Check your collection
   - Only 4 legendary cards have abilities currently
   - Claim daily cards or buy from marketplace

2. **Frontend not updated**
   - Refresh the page (Ctrl + R)
   - Clear cache (Ctrl + Shift + R)
   - Restart frontend: `docker-compose restart frontend`

3. **Database not migrated**
   - Backend should auto-migrate on restart
   - Check backend logs for migration errors

### "Abilities don't trigger in battle"

**Possible Causes:**
1. **Backend not restarted after update**
   - Run: `docker-compose restart backend`
   - Wait 10 seconds for full restart

2. **Wrong trigger type**
   - **ON_PLAY**: Triggers when placing card (working ✅)
   - **ON_ATTACK**: Not yet implemented (coming soon)
   - **ON_DESTROY**: Not yet implemented (coming soon)

3. **Check backend logs**
   - Look for "🔥 ABILITY TRIGGERED" messages
   - If missing, ability executor may have issue

### "ATK/DEF stats not showing"

**Solution:**
- Clear browser cache
- Refresh page
- Check if Collection.tsx was updated

---

## 📊 Ability Statistics

Based on 3500 ATK / 3200 DEF legendary cards:

**Dragon's Breath (800 damage):**
- Kills common cards: ✅ (50-100 DEF)
- Kills uncommon cards: ✅ (100-200 DEF)
- Kills rare cards: ✅ (200-500 DEF)
- Kills epic cards: ❌ (800-1000 DEF)
- Kills legendary cards: ❌ (3000+ DEF)

**Soul Drain (600 damage):**
- % of starting HP: 12%
- Kills if enemy HP: < 600
- Average damage per game: 600 (one-time use)

**Tidal Wave (500 healing):**
- % of max HP: 10%
- Max healing per game: 1500-2500 (depends on attacks)
- Effective HP gain: +20-40% over battle

**Divine Resurrection:**
- Effectively: 2 legendary cards for the price of 1
- Forces enemy to kill it twice
- Value: Immeasurable (psychological advantage)

---

## 🔮 Coming Soon

**More Abilities:**
- 10+ additional legendary abilities
- Epic card abilities (weaker versions)
- Uncommon/rare abilities (very simple)

**More Triggers:**
- ON_ATTACK fully implemented
- ON_DESTROY fully implemented
- ON_DAMAGED (take damage)
- ON_TURN_START (passive effects)
- PASSIVE (always active)

**Visual Effects:**
- Ability activation animations
- Particle effects
- Screen shake for big abilities
- Battle log showing triggers

---

## 📞 Need Help?

If you're still having issues seeing abilities:

1. **Check you own legendary cards:**
   - Go to Collection
   - Filter by "Legendary" (if filter exists)
   - Count legendary cards

2. **Verify backend is updated:**
   - Check `backend/src/cards/entities/card.entity.ts`
   - Should have `ability` column defined

3. **Check database:**
   ```sql
   SELECT name, ability IS NOT NULL as has_ability
   FROM cards
   WHERE rarity = 'legendary';
   ```

4. **Still stuck?**
   - Open browser DevTools (F12)
   - Go to Console tab
   - Look for errors
   - Report issue with screenshot

---

*Last Updated: 2025-11-11*
*Abilities Implemented: 4*
*Next Update: Achievement System*
