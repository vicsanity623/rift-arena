[![pages-build-deployment](https://github.com/vicsanity623/rift-arena/actions/workflows/pages/pages-build-deployment/badge.svg?event=page_build)](https://github.com/vicsanity623/rift-arena/actions/workflows/pages/pages-build-deployment)
# Rift Arena

An original, ranked 3v3 turn-based creature battler with RPG progression, idle mechanics, and gacha summoning. Built as a lightweight Progressive Web App (PWA) — no build step, no database, no dependencies required.

Inspired by the *feel* of ranked online monster-battler mobile games (team select → prep timer → HP-bar battles) mixed with modern mobile RPG progression (like Raid or Pocket Mortys). Every creature, name, move, item, and piece of art here is original — nothing is copied from any commercial game.

## What's in it

- **RPG Progression & Economy:** Earn Player XP, Gold, and Gems from winning ranked matches. Level up your profile to earn gem bonuses.
- **Roster Upgrades:** 12 original creatures across 6 elemental types. Use Gold to level up your Rift-forms, increasing their Base HP, Attack, Defense, and Speed. 
- **Summoning (Gacha):** Spend 100 Gems to summon and unlock new Rift-forms to add to your roster. If you roll a duplicate/max roster, you are compensated with Gold.
- **Idle Base:** Claim stored Gold generated automatically over time while you are away from the game.
- **Ranked Ladder:** Win/lose changes your VP and rank tier (Bronze → Silver → Gold → Platinum → Diamond → Master). Opponent AI scales in level based on your average team level and current rank.
- **Turn-based Combat:** Pick-3 team select. Battles feature speed order, accuracy rolls, type effectiveness, held items, forced switches on faint, and visual animations. 
- **PWA Ready:** Includes a `manifest.json` and `sw.js` (Service Worker) allowing the game to be installed as an app on mobile devices and played offline. Saves are kept locally in your browser.

## File Structure

The game is split into clean, easy-to-read files:
* `index.html` - The UI layout and app structure.
* `styles.css` - All visual styling, animations, and responsive design.
* `app.js` - Game logic, combat math, save management, and AI.
* `manifest.json` - PWA configuration for mobile installation.
* `sw.js` - Service worker for offline caching.

## Running it locally (Mac, Windows, Linux)

You don't need to install any heavy frameworks, but because it uses a Service Worker for PWA features, it runs best via a local web server.

1. Unzip this folder anywhere on your computer.
2. Open a terminal in that folder and start a quick local server. For example, using Python:
   ```bash
   python3 -m http.server 8000
