# Rift Arena

An original, ranked 3v3 turn-based creature battler. Single self-contained
HTML file — no build step, no server, no dependencies, no network required.

Inspired by the *feel* of ranked online monster-battler mobile games (team
select → prep timer → HP-bar battles → win/loss VP), but every creature,
name, move, item, and piece of art here is original — nothing is copied
from any commercial game.

## What's in it

- 12 original creatures across 6 elemental types (Ember, Aqua, Verdant,
  Volt, Stone, Gale) with a rock-paper-scissors-style type chart
- Pick-3 team select with battle order
- A "Preparing for Battle" countdown before each match, showing both
  team lineups (yours revealed immediately, the opponent's revealed
  when prep ends) — mirroring the ranked-lobby feel from the reference
  footage
- Turn-based combat: speed order, accuracy rolls, type effectiveness,
  held items (Quick Feather, Iron Scale, Guard Charm, Vital Berry,
  Steadfast Sash), forced switches on faint, simple hit/lunge/faint
  animations
- A ranked ladder: win/lose changes your VP and rank tier (Bronze →
  Silver → Gold → Platinum → Diamond → Master), saved locally in your
  browser so it persists between sessions
- A basic AI opponent that picks the highest-expected-damage move each
  turn

## Running it locally (Intel iMac or any computer)

You don't need to install anything.

1. Unzip this folder anywhere (e.g. your Desktop).
2. Double-click `index.html`. It opens directly in your default browser
   (Safari, Chrome, or Firefox all work).
3. Play. Your rank/VP/record are saved in that browser via
   `localStorage`, tied to the file's location — if you move the
   folder, your save may not carry over (browsers scope local storage
   to the file path for local files).

If your Mac opens `.html` files in a text editor instead of a browser:
right-click `index.html` → **Open With** → choose Safari or Chrome.

## Hosting it for free on GitHub Pages

1. Create a new GitHub repository (public).
2. Upload `index.html` (and this `README.md` if you like) to the repo's
   root — either via the GitHub web UI ("Add file → Upload files") or:
   ```bash
   git init
   git add index.html README.md
   git commit -m "Rift Arena"
   git branch -M main
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a
   branch", branch `main`, folder `/ (root)`. Save.
5. Wait a minute, then visit `https://<you>.github.io/<repo>/`.

That's it — no build tooling, no server code, nothing else to
configure.

## Extending it

Everything lives in one file (`index.html`) for portability:

- Creature roster, stats, moves, and items: look for `ROSTER_DEF` near
  the top of the `<script>` block.
- Type effectiveness chart: `TYPE_CHART`.
- Battle math (damage formula, accuracy, item effects): `computeDamage`,
  `applyItemSafety`, `maybeVitalBerry`.
- Visual style (colors, fonts, layout): the `<style>` block at the top
  — CSS custom properties under `:root` control the whole palette.

Ideas if you want to keep building on it: a training/leveling mode
between matches, a shop to re-roll held items, more creatures per type,
a real network opponent instead of the local AI, or swapping the CSS
creature avatars for your own sprite art.
