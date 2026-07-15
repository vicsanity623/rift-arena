"use strict";

/* ============================= DATA ============================= */
function move(name, type, power, acc) { return { name, type, power, acc }; }
const BASH = move("Bash", "neutral", 35, 100);

const MOVES = {
  ember: move("Flame Burst", "ember", 60, 95), aqua: move("Tide Crash", "aqua", 60, 95),
  verdant: move("Bramble Whip", "verdant", 60, 95), volt: move("Shock Bolt", "volt", 60, 95),
  stone: move("Rock Slam", "stone", 60, 95), gale: move("Wind Slash", "gale", 60, 95)
};

const TIER_COLORS = { common: "#a8a2c4", uncommon: "#57d68d", rare: "#4facfe", epic: "#c084fc", legendary: "#e6b94d" };
const TIER_NAMES = { common: "Common", uncommon: "Uncommon", rare: "Rare", epic: "Epic", legendary: "Legendary" };
const EQUIP_SLOTS = ["weapon", "armor", "accessory"];

const BATTLE_ITEMS = {
  health_potion: { name: "Health Potion", desc: "Heals 40% HP in battle", icon: "🧪", tier: "uncommon", slot: "consumable", statBonus: {} },
  full_restore: { name: "Full Restore", desc: "Heals 100% HP & cures status", icon: "💊", tier: "rare", slot: "consumable", statBonus: {} },
  atk_boost: { name: "ATK Booster", desc: "+30% ATK for one battle", icon: "⚔️", tier: "uncommon", slot: "consumable", statBonus: {} },
  def_boost: { name: "DEF Booster", desc: "+30% DEF for one battle", icon: "🛡️", tier: "uncommon", slot: "consumable", statBonus: {} },
  spd_boost: { name: "SPD Booster", desc: "+30% SPD for one battle", icon: "💨", tier: "uncommon", slot: "consumable", statBonus: {} },
};

const ITEMS = {
  none: { name: "None", desc: "No item held.", tier: "common", slot: "any", statBonus: {} },
  quickfeather: { name: "Quick Feather", desc: "+10% Speed", tier: "uncommon", slot: "accessory", statBonus: {} },
  ironscale: { name: "Iron Scale", desc: "+15% Defense", tier: "uncommon", slot: "armor", statBonus: {} },
  guardcharm: { name: "Guard Charm", desc: "-10% Dmg taken", tier: "uncommon", slot: "armor", statBonus: {} },
  vitalberry: { name: "Vital Berry", desc: "Heals 25% at low HP", tier: "common", slot: "accessory", statBonus: {} },
  steadfastsash: { name: "Steadfast Sash", desc: "Survives lethal hit once", tier: "rare", slot: "accessory", statBonus: {} },
  puredew: { name: "Pure Dew", desc: "Cures all status effects when HP<30%", tier: "uncommon", slot: "accessory", statBonus: {} },
  // Materials
  iron_ore: { name: "Iron Ore", desc: "A chunk of raw iron. Used in crafting.", tier: "common", slot: "material", statBonus: {} },
  leather: { name: "Leather", desc: "Tough leather hide. Used in crafting.", tier: "common", slot: "material", statBonus: {} },
  cloth: { name: "Cloth", desc: "Fine woven cloth. Used in crafting.", tier: "common", slot: "material", statBonus: {} },
  crystal_shard: { name: "Crystal Shard", desc: "A shimmering crystal fragment.", tier: "uncommon", slot: "material", statBonus: {} },
  essence_fire: { name: "Fire Essence", desc: "Essence of flame. Used in crafting.", tier: "uncommon", slot: "material", statBonus: {} },
  essence_water: { name: "Water Essence", desc: "Essence of the deep. Used in crafting.", tier: "uncommon", slot: "material", statBonus: {} },
  essence_nature: { name: "Nature Essence", desc: "Essence of the wild. Used in crafting.", tier: "uncommon", slot: "material", statBonus: {} },
  dragon_scale: { name: "Dragon Scale", desc: "A scale from a legendary beast.", tier: "rare", slot: "material", statBonus: {} },
  rift_core: { name: "Rift Core", desc: "The core of a dimensional rift.", tier: "rare", slot: "material", statBonus: {} },
  // Crafted Gear
  leather_bracers: { name: "Leather Bracers", desc: "+5% ATK", tier: "uncommon", slot: "armor", statBonus: { atk: 0.05 } },
  iron_helm: { name: "Iron Helm", desc: "+8% DEF", tier: "uncommon", slot: "armor", statBonus: { def: 0.08 } },
  silver_ring: { name: "Silver Ring", desc: "+5% All Stats", tier: "rare", slot: "accessory", statBonus: { hp: 0.05, atk: 0.05, def: 0.05, spd: 0.05 } },
  flame_sword: { name: "Flame Sword", desc: "+12% ATK", tier: "rare", slot: "weapon", statBonus: { atk: 0.12 } },
  guardian_plate: { name: "Guardian Plate", desc: "+12% DEF, +5% HP", tier: "rare", slot: "armor", statBonus: { def: 0.12, hp: 0.05 } },
  swift_boots: { name: "Swift Boots", desc: "+12% SPD", tier: "rare", slot: "accessory", statBonus: { spd: 0.12 } },
  dragon_amulet: { name: "Dragon Amulet", desc: "+8% All Stats", tier: "epic", slot: "accessory", statBonus: { hp: 0.08, atk: 0.08, def: 0.08, spd: 0.08 } },
  rift_blade: { name: "Rift Blade", desc: "+20% ATK, +5% SPD", tier: "epic", slot: "weapon", statBonus: { atk: 0.20, spd: 0.05 } },
  aegis_shield: { name: "Aegis Shield", desc: "+20% DEF, +10% HP", tier: "epic", slot: "armor", statBonus: { def: 0.20, hp: 0.10 } },
  phoenix_crown: { name: "Phoenix Crown", desc: "+30% All Stats", tier: "legendary", slot: "armor", statBonus: { hp: 0.30, atk: 0.30, def: 0.30, spd: 0.30 } }
};

Object.assign(ITEMS, BATTLE_ITEMS);

const CRAFTING_RECIPES = [
  { id: "leather_bracers", name: "Leather Bracers", goldCost: 100, materials: [{ key: "leather", qty: 2 }, { key: "cloth", qty: 1 }] },
  { id: "iron_helm", name: "Iron Helm", goldCost: 150, materials: [{ key: "iron_ore", qty: 3 }, { key: "leather", qty: 1 }] },
  { id: "silver_ring", name: "Silver Ring", goldCost: 300, materials: [{ key: "crystal_shard", qty: 2 }, { key: "essence_nature", qty: 1 }, { key: "cloth", qty: 1 }] },
  { id: "flame_sword", name: "Flame Sword", goldCost: 400, materials: [{ key: "iron_ore", qty: 3 }, { key: "essence_fire", qty: 2 }, { key: "leather", qty: 1 }] },
  { id: "guardian_plate", name: "Guardian Plate", goldCost: 500, materials: [{ key: "iron_ore", qty: 4 }, { key: "leather", qty: 2 }, { key: "crystal_shard", qty: 1 }] },
  { id: "swift_boots", name: "Swift Boots", goldCost: 350, materials: [{ key: "leather", qty: 3 }, { key: "cloth", qty: 2 }, { key: "essence_water", qty: 1 }] },
  { id: "dragon_amulet", name: "Dragon Amulet", goldCost: 800, materials: [{ key: "dragon_scale", qty: 1 }, { key: "crystal_shard", qty: 3 }, { key: "essence_fire", qty: 1 }, { key: "essence_water", qty: 1 }] },
  { id: "rift_blade", name: "Rift Blade", goldCost: 1000, materials: [{ key: "rift_core", qty: 1 }, { key: "crystal_shard", qty: 3 }, { key: "essence_fire", qty: 2 }, { key: "iron_ore", qty: 3 }] },
  { id: "aegis_shield", name: "Aegis Shield", goldCost: 1200, materials: [{ key: "dragon_scale", qty: 1 }, { key: "iron_ore", qty: 5 }, { key: "crystal_shard", qty: 2 }, { key: "essence_nature", qty: 1 }] },
  { id: "phoenix_crown", name: "Phoenix Crown", goldCost: 2000, materials: [{ key: "rift_core", qty: 2 }, { key: "dragon_scale", qty: 2 }, { key: "crystal_shard", qty: 5 }, { key: "essence_fire", qty: 3 }, { key: "essence_nature", qty: 3 }] }
];

const ROSTER_DEF = [
  ["cindrake", "Cindrake", "ember", 70, 65, 55, 70, "quickfeather", "Inferno Pounce", "smooth", 15, "Cindrake Alpha"],
  ["pyrelope", "Pyrelope", "ember", 75, 80, 60, 85, "guardcharm", "Solar Kick", "spiky", 20, "Pyrelope Omega"],
  ["tidenne", "Tidenne", "aqua", 80, 60, 65, 60, "ironscale", "Riptide Spin", "smooth", 15, "Tidenne Alpha"],
  ["coralisk", "Coralisk", "aqua", 90, 70, 85, 50, "vitalberry", "Abyssal Crush", "angular", 20, "Coralisk Omega"],
  ["verdil", "Verdil", "verdant", 75, 60, 60, 75, "quickfeather", "Thicket Charge", "smooth", 15, "Verdil Alpha"],
  ["thornuke", "Thornuke", "verdant", 95, 75, 90, 40, "ironscale", "Root Slam", "spiky", 20, "Thornuke Omega"],
  ["sparkit", "Sparkit", "volt", 60, 65, 50, 95, "quickfeather", "Static Burst", "smooth", 15, "Sparkit Alpha"],
  ["voltigo", "Voltigo", "volt", 70, 85, 55, 90, "steadfastsash", "Thunder Fang", "spiky", 20, "Voltigo Omega"],
  ["pebblin", "Pebblin", "stone", 85, 60, 90, 45, "ironscale", "Pebble Barrage", "angular", 15, "Pebblin Alpha"],
  ["boulderon", "Boulderon", "stone", 100, 90, 100, 30, "guardcharm", "Seismic Slam", "spiky", 20, "Boulderon Omega"],
  ["gustling", "Gustling", "gale", 65, 70, 55, 90, "quickfeather", "Gale Dash", "smooth", 15, "Gustling Alpha"],
  ["zephyrn", "Zephyrn", "gale", 75, 85, 60, 100, "steadfastsash", "Cyclone Strike", "angular", 20, "Zephyrn Omega"]
];

const VARIANTS = {
  shadow: { name: "Shadow", icon: "🌑", desc: "Dark-infused, high ATK+SPD", statMods: { atk: 1.25, spd: 1.15, def: 0.85, hp: 0.9 } },
  crystal: { name: "Crystal", icon: "💎", desc: "Hardened, high DEF+HP", statMods: { def: 1.25, hp: 1.15, atk: 0.85, spd: 0.9 } },
  primal: { name: "Primal", icon: "⚡", desc: "Ancient power, all stats up", statMods: { atk: 1.15, def: 1.15, spd: 1.15, hp: 1.15 } },
  toxic: { name: "Toxic", icon: "☠️", desc: "Poison-infused, high SPD+ATK", statMods: { spd: 1.25, atk: 1.15, def: 0.9, hp: 0.95 } }
};

/* ============================= TALENT MASTERY SYSTEM ============================= */
const TALENT_TREES = {
  ember: {
    name: "Ember", icon: "🔥", color: "#ff6a45",
    nodes: [
      { id: "ember_hp", name: "Ember Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "ember_atk", name: "Ember Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "ember_def", name: "Ember Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "ember_spd", name: "Ember Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "ember_inferno", name: "Inferno", icon: "🌋", desc: "+15% burn chance on attacks", perk: "inferno", cost: 4, req: ["ember_atk"] }
    ]
  },
  aqua: {
    name: "Aqua", icon: "🌊", color: "#33c7ea",
    nodes: [
      { id: "aqua_hp", name: "Aqua Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "aqua_atk", name: "Aqua Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "aqua_def", name: "Aqua Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "aqua_spd", name: "Aqua Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "aqua_tide", name: "Tide Healer", icon: "💧", desc: "Heal 8% HP on switch-in", perk: "tide", cost: 4, req: ["aqua_hp"] }
    ]
  },
  verdant: {
    name: "Verdant", icon: "🌿", color: "#5fd66b",
    nodes: [
      { id: "verdant_hp", name: "Verdant Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "verdant_atk", name: "Verdant Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "verdant_def", name: "Verdant Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "verdant_spd", name: "Verdant Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "verdant_thorn", name: "Thornmail", icon: "🌵", desc: "+15% thorns reflect", perk: "thornmail", cost: 4, req: ["verdant_def"] }
    ]
  },
  volt: {
    name: "Volt", icon: "⚡", color: "#f4d33c",
    nodes: [
      { id: "volt_hp", name: "Volt Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "volt_atk", name: "Volt Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "volt_def", name: "Volt Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "volt_spd", name: "Volt Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "volt_overcharge", name: "Overcharge", icon: "🔋", desc: "+20% Static speed bonus", perk: "overcharge", cost: 4, req: ["volt_spd"] }
    ]
  },
  stone: {
    name: "Stone", icon: "🪨", color: "#c98a52",
    nodes: [
      { id: "stone_hp", name: "Stone Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "stone_atk", name: "Stone Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "stone_def", name: "Stone Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "stone_spd", name: "Stone Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "stone_fortress", name: "Fortress", icon: "🏰", desc: "+15% Fortify defense boost", perk: "fortress", cost: 4, req: ["stone_def"] }
    ]
  },
  gale: {
    name: "Gale", icon: "💨", color: "#9db4ff",
    nodes: [
      { id: "gale_hp", name: "Gale Vitality", icon: "❤️", desc: "+10% HP", stat: "hp", bonus: 0.10, cost: 2, req: null },
      { id: "gale_atk", name: "Gale Strength", icon: "⚔️", desc: "+10% ATK", stat: "atk", bonus: 0.10, cost: 2, req: null },
      { id: "gale_def", name: "Gale Shell", icon: "🛡️", desc: "+10% DEF", stat: "def", bonus: 0.10, cost: 2, req: null },
      { id: "gale_spd", name: "Gale Swift", icon: "💨", desc: "+10% SPD", stat: "spd", bonus: 0.10, cost: 2, req: null },
      { id: "gale_phantom", name: "Phantom Step", icon: "👻", desc: "+15% Evasion dodge chance", perk: "phantom", cost: 4, req: ["gale_spd"] }
    ]
  }
};

function getTalentTree(type) {
  return TALENT_TREES[type] || null;
}

function getOwnedTalents(uid) {
  const mSave = save.mons.find(m => m.uid === uid);
  return mSave ? (mSave.talents || []) : [];
}

function hasTalent(uid, talentId) {
  return getOwnedTalents(uid).includes(talentId);
}

function getTalentNode(tree, talentId) {
  if (!tree) return null;
  return tree.nodes.find(n => n.id === talentId) || null;
}

function meetsTalentReqs(uid, node) {
  if (!node.req || node.req.length === 0) return true;
  return node.req.every(r => hasTalent(uid, r));
}

function getMasteryPoints(uid) {
  const mSave = save.mons.find(m => m.uid === uid);
  return mSave ? (mSave.mp || 0) : 0;
}

function awardMasteryPoints(uid, amount) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave) return;
  mSave.mp = (mSave.mp || 0) + amount;
  saveGame();
}

function awardAllMasteryPoints(amount) {
  save.mons.forEach(m => {
    m.mp = (m.mp || 0) + amount;
  });
  saveGame();
}

function purchaseTalent(uid, talentId) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave) return false;
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  if (!def) return false;
  const tree = getTalentTree(def[2]);
  if (!tree) return false;
  const node = getTalentNode(tree, talentId);
  if (!node) return false;
  if (!mSave.talents) mSave.talents = [];
  if (mSave.talents.includes(talentId)) return false;
  if (!meetsTalentReqs(uid, node)) return false;
  if ((mSave.mp || 0) < node.cost) return false;
  mSave.mp = (mSave.mp || 0) - node.cost;
  mSave.talents.push(talentId);
  saveGame();
  return true;
}

function getTalentStatBonuses(uid) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave || !mSave.talents) return { hp: 0, atk: 0, def: 0, spd: 0 };
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  if (!def) return { hp: 0, atk: 0, def: 0, spd: 0 };
  const tree = getTalentTree(def[2]);
  if (!tree) return { hp: 0, atk: 0, def: 0, spd: 0 };
  const bonuses = { hp: 0, atk: 0, def: 0, spd: 0 };
  mSave.talents.forEach(id => {
    const node = getTalentNode(tree, id);
    if (node && node.stat) {
      bonuses[node.stat] = (bonuses[node.stat] || 0) + node.bonus;
    }
  });
  return bonuses;
}

function hasTalentPerk(uid, perk) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave || !mSave.talents) return false;
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  if (!def) return false;
  const tree = getTalentTree(def[2]);
  if (!tree) return false;
  return mSave.talents.some(id => {
    const node = getTalentNode(tree, id);
    return node && node.perk === perk;
  });
}

function getTalentPerkDescriptions(uid) {
  const descs = [];
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave || !mSave.talents) return descs;
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  if (!def) return descs;
  const tree = getTalentTree(def[2]);
  if (!tree) return descs;
  mSave.talents.forEach(id => {
    const node = getTalentNode(tree, id);
    if (node && node.perk) {
      descs.push(node.desc);
    }
  });
  return descs;
}

function showTalentTree(uid) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave) return;
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  if (!def) return;
  const tree = getTalentTree(def[2]);
  if (!tree) return;
  const mp = getMasteryPoints(uid);
  const owned = getOwnedTalents(uid);

  let html = `<div class="talent-overlay" id="talent-overlay">
    <div class="talent-modal">
      <div class="backrow"><button class="iconbtn" id="btn-talent-close">←</button><h2 style="color:${tree.color};">${tree.icon} ${tree.name} Talent Mastery</h2></div>
      <div class="talent-mp-bar">✦ <span id="talent-mp-display">${mp}</span> Mastery Points</div>
      <div class="talent-grid">`;

  tree.nodes.forEach((node, idx) => {
    const isOwned = owned.includes(node.id);
    const canBuy = !isOwned && meetsTalentReqs(uid, node) && mp >= node.cost;
    const locked = !meetsTalentReqs(uid, node);
    const cls = isOwned ? "talent-node owned" : canBuy ? "talent-node available" : "talent-node locked";

    let reqHtml = "";
    if (node.req && node.req.length > 0 && !isOwned) {
      const reqsMet = node.req.every(r => owned.includes(r));
      reqHtml = `<div class="talent-req" style="color:${reqsMet ? 'var(--safe)' : 'var(--danger)'};">Requires: ${node.req.map(r => {
        const n = TALENT_TREES[def[2]] ? TALENT_TREES[def[2]].nodes.find(x => x.id === r) : null;
        return n ? n.name : r;
      }).join(", ")}</div>`;
    }

    html += `<div class="${cls}" data-talent-id="${node.id}">
      <div class="talent-node-icon" style="border-color:${tree.color};${isOwned ? `background:${tree.color}33;` : ''}">${node.icon}</div>
      <div class="talent-node-info">
        <div class="talent-node-name">${node.name}</div>
        <div class="talent-node-desc">${node.desc}</div>
        ${reqHtml}
        <div class="talent-node-cost">${isOwned ? '✓ Owned' : canBuy ? `🔓 ${node.cost} MP` : locked ? `🔒 ${node.cost} MP` : `🔒 ${node.cost} MP`}</div>
      </div>
      ${canBuy ? `<button class="btn-talent-buy" data-talent-id="${node.id}">Learn</button>` : ''}
    </div>`;
  });

  html += `</div>
    <div class="talent-perks" id="talent-perks-display"></div>
    </div></div>`;

  const existing = document.getElementById("talent-overlay");
  if (existing) existing.remove();

  const div = document.createElement("div");
  div.innerHTML = html;
  document.getElementById("app").appendChild(div.firstElementChild);

  document.getElementById("btn-talent-close").onclick = () => {
    document.getElementById("talent-overlay").remove();
  };

  document.querySelectorAll(".btn-talent-buy").forEach(btn => {
    btn.onclick = () => {
      const talentId = btn.dataset.talentId;
      const success = purchaseTalent(uid, talentId);
      if (success) {
        showModal({ icon: "✦", title: "Talent Unlocked!", message: `Learned ${tree.nodes.find(n => n.id === talentId)?.name}!` });
        showTalentTree(uid);
      } else {
        showModal({ icon: "⚠️", title: "Cannot Learn", message: "Not enough Mastery Points or requirements not met." });
      }
    };
  });

  // Show active perk descriptions
  const perkDescs = getTalentPerkDescriptions(uid);
  const perksEl = document.getElementById("talent-perks-display");
  if (perksEl) {
    if (perkDescs.length > 0) {
      perksEl.innerHTML = `<div class="talent-perks-title">Active Perks:</div><div class="talent-perks-list">${perkDescs.map(d => `<div class="talent-perk-tag">✦ ${d}</div>`).join("")}</div>`;
    }
  }
}

const ACHIEVEMENT_CATEGORIES = {
  battle: { name: "Battle", icon: "⚔️", color: "#ff6a45" },
  collection: { name: "Collection", icon: "🐾", color: "#c084fc" },
  exploration: { name: "Exploration", icon: "🗺️", color: "#4facfe" },
  crafting: { name: "Crafting", icon: "🔨", color: "#f4c74c" },
  dojo: { name: "Dojo", icon: "🥋", color: "#57d68d" }
};

const ACHIEVEMENTS = [
  { id: "battle_wins_1", category: "battle", name: "First Blood", desc: "Win 1 battle", target: 1, reward: { gold: 50, gems: 5 } },
  { id: "battle_wins_10", category: "battle", name: "Skirmisher", desc: "Win 10 battles", target: 10, reward: { gold: 200, gems: 20 } },
  { id: "battle_wins_50", category: "battle", name: "Warrior", desc: "Win 50 battles", target: 50, reward: { gold: 500, gems: 50 } },
  { id: "battle_wins_100", category: "battle", name: "Veteran", desc: "Win 100 battles", target: 100, reward: { gold: 1000, gems: 100 } },
  { id: "battle_wins_500", category: "battle", name: "Legend", desc: "Win 500 battles", target: 500, reward: { gold: 5000, gems: 500 } },
  { id: "battle_streak_5", category: "battle", name: "On Fire", desc: "Win 5 in a row", target: 5, reward: { gold: 300, gems: 30 } },
  { id: "battle_streak_10", category: "battle", name: "Unstoppable", desc: "Win 10 in a row", target: 10, reward: { gold: 600, gems: 60 } },
  { id: "battle_vp_2000", category: "battle", name: "VP Collector", desc: "Reach 2000 VP", target: 2000, reward: { gold: 400, gems: 40 } },
  { id: "battle_vp_5000", category: "battle", name: "VP Elite", desc: "Reach 5000 VP", target: 5000, reward: { gold: 1000, gems: 100 } },
  { id: "battle_vp_10000", category: "battle", name: "VP Legend", desc: "Reach 10000 VP", target: 10000, reward: { gold: 2500, gems: 250 } },
  { id: "collect_5", category: "collection", name: "Collector", desc: "Own 5 unique creatures", target: 5, reward: { gold: 100, gems: 10 } },
  { id: "collect_12", category: "collection", name: "Menagerie", desc: "Own all 12 creature types", target: 12, reward: { gold: 500, gems: 50 } },
  { id: "variant_1", category: "collection", name: "Variant Seeker", desc: "Obtain 1 variant creature", target: 1, reward: { gold: 200, gems: 20 } },
  { id: "variant_4", category: "collection", name: "Variant Collector", desc: "Obtain all 4 variant types", target: 4, reward: { gold: 800, gems: 80 } },
  { id: "evolve_1", category: "collection", name: "First Evolution", desc: "Evolve 1 creature", target: 1, reward: { gold: 150, gems: 15 } },
  { id: "evolve_5", category: "collection", name: "Evolution Master", desc: "Evolve 5 creatures", target: 5, reward: { gold: 750, gems: 75 } },
  { id: "explore_1", category: "exploration", name: "First Steps", desc: "Complete 1 expedition", target: 1, reward: { gold: 50, gems: 5 } },
  { id: "explore_10", category: "exploration", name: "Pathfinder", desc: "Complete 10 expeditions", target: 10, reward: { gold: 300, gems: 30 } },
  { id: "explore_50", category: "exploration", name: "Explorer", desc: "Complete 50 expeditions", target: 50, reward: { gold: 1000, gems: 100 } },
  { id: "materials_100", category: "exploration", name: "Material Hoarder", desc: "Collect 100 materials", target: 100, reward: { gold: 400, gems: 40 } },
  { id: "materials_500", category: "exploration", name: "Resource Baron", desc: "Collect 500 materials", target: 500, reward: { gold: 1500, gems: 150 } },
  { id: "craft_1", category: "crafting", name: "Blacksmith", desc: "Forge 1 item", target: 1, reward: { gold: 100, gems: 10 } },
  { id: "craft_10", category: "crafting", name: "Artisan", desc: "Forge 10 items", target: 10, reward: { gold: 500, gems: 50 } },
  { id: "craft_50", category: "crafting", name: "Master Craftsman", desc: "Forge 50 items", target: 50, reward: { gold: 2000, gems: 200 } },
  { id: "gear_5", category: "crafting", name: "Gear Up", desc: "Equip 5 pieces of gear", target: 5, reward: { gold: 200, gems: 20 } },
  { id: "gear_20", category: "crafting", name: "Well Equipped", desc: "Equip 20 pieces of gear", target: 20, reward: { gold: 800, gems: 80 } },
  { id: "dojo_1h", category: "dojo", name: "Beginner Trainee", desc: "Train 1 hour in the dojo", target: 1, reward: { gold: 100, gems: 10 } },
  { id: "dojo_10h", category: "dojo", name: "Dedicated Student", desc: "Train 10 hours in the dojo", target: 10, reward: { gold: 500, gems: 50 } },
  { id: "dojo_50h", category: "dojo", name: "Dojo Master", desc: "Train 50 hours in the dojo", target: 50, reward: { gold: 2500, gems: 250 } }
];

const NPC_LEADERBOARD = [
  { name: "Nightshard", vp: 5200, rank: "Master", wins: 342, losses: 98, badge: "👑" },
  { name: "Kestrix", vp: 4800, rank: "Master", wins: 289, losses: 112, badge: "👑" },
  { name: "Voltara", vp: 4300, rank: "Platinum", wins: 256, losses: 134, badge: "🥇" },
  { name: "Glacius", vp: 4100, rank: "Platinum", wins: 198, losses: 87, badge: "🥇" },
  { name: "Tecton", vp: 3800, rank: "Platinum", wins: 175, losses: 102, badge: "🥈" },
  { name: "Sylvara", vp: 3600, rank: "Gold", wins: 201, losses: 145, badge: "🥈" },
  { name: "Blitzara", vp: 3400, rank: "Gold", wins: 167, losses: 123, badge: "🥈" },
  { name: "Fernwood", vp: 3100, rank: "Gold", wins: 154, losses: 119, badge: "🥉" },
  { name: "Rowan", vp: 2800, rank: "Silver", wins: 132, losses: 98, badge: "🥉" },
  { name: "Ashvale", vp: 2500, rank: "Silver", wins: 118, losses: 87, badge: "🥉" },
  { name: "Epidemic", vp: 2100, rank: "Silver", wins: 89, losses: 76, badge: "" },
  { name: "Diremire", vp: 1800, rank: "Bronze", wins: 67, losses: 54, badge: "" },
  { name: "Shadoom", vp: 1500, rank: "Bronze", wins: 45, losses: 38, badge: "" },
  { name: "Vellum", vp: 1200, rank: "Bronze", wins: 32, losses: 41, badge: "" },
];

const TYPE_CHART = {
  ember: { verdant: 2, aqua: 0.5, stone: 0.5 }, aqua: { ember: 2, stone: 2, verdant: 0.5, volt: 0.5 },
  verdant: { aqua: 2, stone: 2, ember: 0.5, gale: 0.5 }, volt: { aqua: 2, gale: 2, verdant: 0.5, stone: 0 },
  stone: { ember: 2, volt: 2, gale: 0.5, verdant: 0.5 }, gale: { verdant: 2, volt: 0.5, stone: 0.5 }
};
function typeMultiplier(atkType, defType) { return (atkType === "neutral") ? 1 : ((TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) || 1); }

const PASSIVE_ABILITIES = {
  ember: {
    name: "Blaze", icon: "🔥", desc: "15% chance to burn attackers when hit",
    onHit(owner, attacker) { const hasPerk = typeof hasTalentPerk === "function" && owner.uid && hasTalentPerk(owner.uid, "inferno"); const chance = hasPerk ? 0.30 : 0.15; if (Math.random() < chance && !owner.fainted) { applyStatus(attacker, "burn"); return true; } return false; },
    getEvoDesc: (lvl) => `${Math.min(35, 15 + Math.floor(lvl / 3))}% chance to burn attackers`
  },
  aqua: {
    name: "Tide", icon: "🌊", desc: "Heal 5% max HP at start of each turn",
    onTurnStart(owner) { if (!owner.fainted && owner.hp < owner.baseHp) { const pct = 0.05 + (owner.level || 1) * 0.002; const amt = Math.max(1, Math.floor(owner.baseHp * Math.min(0.12, pct))); owner.hp = Math.min(owner.baseHp, owner.hp + amt); return amt; } return 0; },
    getEvoDesc: (lvl) => `Heal ${Math.min(12, 5 + Math.floor(lvl / 2))}% max HP each turn`
  },
  verdant: {
    name: "Thorns", icon: "🌿", desc: "Reflect 20% of damage back to attacker",
    onHit(owner, attacker) { if (!owner.fainted && !attacker.fainted) { const hasPerk = typeof hasTalentPerk === "function" && owner.uid && hasTalentPerk(owner.uid, "thornmail"); const baseReflect = hasPerk ? 0.35 : 0.20; const reflectPct = baseReflect + (owner.level || 1) * 0.003; const reflect = Math.max(1, Math.floor(owner._lastDmg * Math.min(0.5, reflectPct))); attacker.hp = Math.max(0, attacker.hp - reflect); return reflect; } return 0; },
    getEvoDesc: (lvl) => `Reflect ${Math.min(40, 20 + Math.floor(lvl / 2))}% damage back`
  },
  volt: {
    name: "Static", icon: "⚡", desc: "+15% Speed in battle",
    onInit(owner) { const hasPerk = typeof hasTalentPerk === "function" && owner.uid && hasTalentPerk(owner.uid, "overcharge"); const baseBoost = hasPerk ? 1.35 : 1.15; const boost = baseBoost + (owner.level || 1) * 0.003; owner.spd = Math.floor(owner._baseSpd * Math.min(1.55, boost)); },
    getEvoDesc: (lvl) => `+${Math.min(35, 15 + Math.floor(lvl / 2))}% Speed in battle`
  },
  stone: {
    name: "Fortify", icon: "🪨", desc: "+15% Defense in battle",
    onInit(owner) { const hasPerk = typeof hasTalentPerk === "function" && owner.uid && hasTalentPerk(owner.uid, "fortress"); const baseBoost = hasPerk ? 1.30 : 1.15; const boost = baseBoost + (owner.level || 1) * 0.003; owner.effDef = Math.floor(owner._baseDef * Math.min(1.50, boost)); },
    getEvoDesc: (lvl) => `+${Math.min(35, 15 + Math.floor(lvl / 2))}% Defense in battle`
  },
  gale: {
    name: "Evasion", icon: "💨", desc: "10% chance to dodge attacks",
    onDefend(owner) { const hasPerk = typeof hasTalentPerk === "function" && owner.uid && hasTalentPerk(owner.uid, "phantom"); const baseChance = hasPerk ? 0.25 : 0.10; const chance = baseChance + (owner.level || 1) * 0.002; return Math.random() < Math.min(0.40, chance); },
    getEvoDesc: (lvl) => `${Math.min(25, 10 + Math.floor(lvl / 2))}% chance to dodge attacks`
  }
};
function getPassive(type) { return PASSIVE_ABILITIES[type] || null; }
function triggerPassiveOnInit(mon) {
  const p = getPassive(mon.type);
  if (p && p.onInit) p.onInit(mon);
  mon.passive = p ? p.name : null;
  mon.passiveIcon = p ? p.icon : null;
  mon.passiveDesc = p && p.getEvoDesc ? p.getEvoDesc(mon.level || 1) : (p ? p.desc : null);
}
function triggerPassiveOnTurnStart(mon, logLines) {
  const p = getPassive(mon.type);
  if (p && p.onTurnStart && !mon.fainted) {
    const healed = p.onTurnStart(mon);
    if (healed > 0) {
      logLines.push(`<b>${mon.name}</b>'s ${p.icon} ${p.name} restored <b>${healed}</b> HP.`);
      return true;
    }
  }
  return false;
}
function triggerPassiveOnHit(defender, attacker, logLines) {
  const p = getPassive(defender.type);
  if (p && p.onHit && !defender.fainted) {
    const result = p.onHit(defender, attacker);
    if (typeof result === "number" && result > 0) {
      logLines.push(`<b>${defender.name}</b>'s ${p.icon} ${p.name} reflected <b>${result}</b> damage back!`);
      if (attacker.hp <= 0) { attacker.fainted = true; logLines.push(`<b>${attacker.name}</b> was knocked out by reflected damage!`); }
      return true;
    } else if (result === true) {
      logLines.push(`<b>${attacker.name}</b> was burned by <b>${defender.name}</b>'s ${p.icon} ${p.name}!`);
      return true;
    }
  }
  return false;
}
function triggerPassiveOnDefend(defender) {
  const p = getPassive(defender.type);
  return p && p.onDefend && !defender.fainted && p.onDefend(defender);
}

const ELEMENTAL_COMBOS = {
  "gale_ember": { name: "Firestorm", icon: "🌪️🔥", desc: "Bonus fire damage from wind-fanning", mult: 1.5, effect: "dmgBoost", dur: "once" },
  "volt_aqua": { name: "Thunderstorm", icon: "⚡🌊", desc: "Stunning bolt through water", mult: 1.4, effect: "stun", dur: "once" },
  "ember_stone": { name: "Magma Eruption", icon: "🔥🪨", desc: "Molten rock smash", mult: 1.5, effect: "dmgBoost", dur: "once" },
  "stone_verdant": { name: "Overgrowth", icon: "🪨🌿", desc: "Life springs from stone", mult: 0.15, effect: "heal", dur: "once" },
  "volt_gale": { name: "Tempest", icon: "⚡💨", desc: "Electrified winds batter the foe", mult: 0.5, effect: "spdDmg", dur: "once" },
  "verdant_aqua": { name: "Bloom", icon: "🌿🌊", desc: "Nourishing waters heal the team", mult: 0.1, effect: "teamHeal", dur: "once" },
  "ember_aqua_verdant": { name: "Seasonal Cycle", icon: "🔥🌊🌿", desc: "Nature's wrath reduces ATK", mult: 2.0, effect: "atkDebuff", dur: "once" },
  "stone_gale_volt": { name: "Cataclysm", icon: "🪨💨⚡", desc: "Tectonic fury reduces DEF", mult: 2.0, effect: "defDebuff", dur: "once" }
};

function checkAndApplyCombo(side, attacker, defender, mv, dmg, logLines, arena) {
  const tracker = side === "p" ? battle.pCombo : battle.fCombo;
  tracker.push(mv.type);
  if (tracker.length > 3) tracker.shift();
  const comboApplied = { active: false, name: "", icon: "", desc: "", bonusDmg: 0 };

  // Unity perk: combo damage bonus when guild members' creatures are in play
  let unityMult = 1;
  if (typeof getGuildRewardMultipliers === "function" && save.guild) {
    const mults = getGuildRewardMultipliers();
    if (mults.unity > 1 && side === "p") {
      unityMult = mults.unity;
    }
  }

  for (let len = 3; len >= 2; len--) {
    if (tracker.length < len) continue;
    const seq = tracker.slice(tracker.length - len);
    const key = seq.join("_");
    const combo = ELEMENTAL_COMBOS[key];
    if (!combo) continue;

    comboApplied.active = true;
    comboApplied.name = combo.name;
    comboApplied.icon = combo.icon;
    comboApplied.desc = combo.desc;

    if (combo.effect === "dmgBoost") {
      const bonus = Math.round(dmg * (combo.mult - 1) * unityMult);
      defender.hp = Math.max(0, defender.hp - bonus);
      if (arena) {
        const defEl = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
        if (defEl) {
          const hf = document.createElement("div");
          hf.className = "dmg-float combo"; hf.textContent = `${combo.icon} ${bonus}`;
          const dRect = defEl.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
          hf.style.left = (dRect.left - aRect.left + dRect.width / 2 - 25) + "px";
          hf.style.top = (dRect.top - aRect.top - 25) + "px";
          arena.appendChild(hf);
          setTimeout(() => hf.remove(), 1200);
        }
      }
      comboApplied.bonusDmg = bonus;
    } else if (combo.effect === "stun") {
      if (!defender.statusEffects || defender.statusEffects.length === 0) {
        applyStatus(defender, "freeze");
        const defEl2 = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
        if (defEl2) { defEl2.classList.remove("status-applied"); void defEl2.offsetWidth; defEl2.classList.add("status-applied"); }
      }
    } else if (combo.effect === "heal") {
      const healAmt = Math.round(attacker.baseHp * combo.mult);
      attacker.hp = Math.min(attacker.baseHp, attacker.hp + healAmt);
      if (arena) {
        const atkEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
        if (atkEl) {
          const hf = document.createElement("div");
          hf.className = "dmg-float heal"; hf.textContent = `+${healAmt}`;
          const tRect = atkEl.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
          hf.style.left = (tRect.left - aRect.left + tRect.width / 2 - 15) + "px";
          hf.style.top = (tRect.top - aRect.top - 5) + "px";
          arena.appendChild(hf);
          setTimeout(() => hf.remove(), 1000);
        }
      }
    } else if (combo.effect === "teamHeal") {
      const team = side === "p" ? battle.player : battle.foe;
      team.forEach(m => {
        if (!m.fainted) {
          m.hp = Math.min(m.baseHp, m.hp + Math.round(m.baseHp * combo.mult));
        }
      });
    } else if (combo.effect === "spdDmg") {
      const spdBonus = Math.round(attacker.spd * combo.mult * unityMult);
      defender.hp = Math.max(0, defender.hp - spdBonus);
      comboApplied.bonusDmg = spdBonus;
      if (arena) {
        const defEl3 = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
        if (defEl3) {
          const hf = document.createElement("div");
          hf.className = "dmg-float combo"; hf.textContent = `${combo.icon} ${spdBonus}`;
          const dRect = defEl3.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
          hf.style.left = (dRect.left - aRect.left + dRect.width / 2 - 25) + "px";
          hf.style.top = (dRect.top - aRect.top - 25) + "px";
          arena.appendChild(hf);
          setTimeout(() => hf.remove(), 1200);
        }
      }
    } else if (combo.effect === "atkDebuff") {
      defender.statusAtkMult = (defender.statusAtkMult || 1) * 0.75;
    } else if (combo.effect === "defDebuff") {
      const defDmg = Math.round(dmg * (combo.mult - 1));
      defender.hp = Math.max(0, defender.hp - defDmg);
      comboApplied.bonusDmg = defDmg;
      if (arena) {
        const defEl4 = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
        if (defEl4) {
          const hf = document.createElement("div");
          hf.className = "dmg-float combo"; hf.textContent = `${combo.icon} ${defDmg}`;
          const dRect = defEl4.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
          hf.style.left = (dRect.left - aRect.left + dRect.width / 2 - 25) + "px";
          hf.style.top = (dRect.top - aRect.top - 25) + "px";
          arena.appendChild(hf);
          setTimeout(() => hf.remove(), 1200);
        }
      }
    }

    tracker._lastCombo = combo.name;
    break;
  }

  return comboApplied;
}

function updateComboUI() {
  const el = document.getElementById("combo-tracker");
  if (!el) return;
  const pCombo = battle.pCombo || [];
  const fCombo = battle.fCombo || [];
  let html = "";
  const seqP = pCombo.slice(-3).join(" → ").toUpperCase();
  const seqF = fCombo.slice(-3).join(" → ").toUpperCase();
  if (seqP) html += `<div class="combo-side"><span class="combo-label">YOUR CHAIN:</span> <span class="combo-seq">${seqP}</span></div>`;
  if (seqF) html += `<div class="combo-side"><span class="combo-label">FOE CHAIN:</span> <span class="combo-seq">${seqF}</span></div>`;
  el.innerHTML = html;
}

/* ============================= STATUS EFFECTS & WEATHER ============================= */
const STATUS_EFFECTS = {
  burn: {
    name: "Burn", icon: "🔥", color: "#ff6a45", desc: "-25% ATK, 10% max HP dmg per turn",
    onApply(m) { m.statusAtkMult = 0.75; },
    onTick(m) { return Math.floor(m.baseHp * 0.1); },
    onCure(m) { m.statusAtkMult = 1; }
  },
  freeze: {
    name: "Freeze", icon: "❄️", color: "#33c7ea", desc: "Cannot move for 1-2 turns",
    onApply(m) { m.statusSkipTurns = 1 + Math.floor(Math.random() * 2); },
    onTick(m) { return null; },
    onCure(m) { m.statusSkipTurns = 0; }
  },
  poison: {
    name: "Poison", icon: "☠️", color: "#9b59b6", desc: "15% max HP damage per turn",
    onApply(m) { },
    onTurn(m) { return Math.floor(m.baseHp * 0.15); },
    onCure(m) { }
  }
};

function applyStatus(target, effectKey) {
  if (target.statusEffects && target.statusEffects.length > 0) return false;
  if (!target.statusEffects) target.statusEffects = [];
  const eff = STATUS_EFFECTS[effectKey];
  if (!eff) return false;
  target.statusEffects.push(effectKey);
  target.statusAtkMult = 1;
  target.statusSkipTurns = 0;
  if (eff.onApply) eff.onApply(target);
  return true;
}

function cureStatus(target) {
  if (!target.statusEffects || target.statusEffects.length === 0) return;
  target.statusEffects.forEach(key => {
    const eff = STATUS_EFFECTS[key];
    if (eff.onCure) eff.onCure(target);
  });
  target.statusEffects = [];
  target.statusAtkMult = 1;
  target.statusSkipTurns = 0;
}

function resolveStatusTick(target) {
  if (!target.statusEffects || target.statusEffects.length === 0) return null;
  const key = target.statusEffects[0];
  const eff = STATUS_EFFECTS[key];
  if (eff.onTick || eff.onTurn) {
    let dmg = 0;
    if (eff.onTick) dmg = eff.onTick(target) || 0;
    if (eff.onTurn) dmg = eff.onTurn(target) || 0;
    if (dmg > 0) {
      target.hp = Math.max(0, target.hp - dmg);
      return dmg;
    }
  }
  return null;
}

const WEATHER_CONDITIONS = {
  sunny: {
    name: "Sunny", icon: "☀️", color: "#ff6a45",
    desc: "Ember +20%, Aqua -20%",
    modify(atkType, defType) { return atkType === "ember" ? 1.2 : atkType === "aqua" ? 0.8 : 1; }
  },
  rain: {
    name: "Rain", icon: "🌧️", color: "#33c7ea",
    desc: "Aqua +20%, Ember -20%",
    modify(atkType, defType) { return atkType === "aqua" ? 1.2 : atkType === "ember" ? 0.8 : 1; }
  },
  sandstorm: {
    name: "Sandstorm", icon: "🌪️", color: "#c98a52",
    desc: "Stone +20%, Gale -20%",
    modify(atkType, defType) { return atkType === "stone" ? 1.2 : atkType === "gale" ? 0.8 : 1; }
  },
  gale: {
    name: "Gale Winds", icon: "💨", color: "#9db4ff",
    desc: "Gale +20%, Verdant -20%",
    modify(atkType, defType) { return atkType === "gale" ? 1.2 : atkType === "verdant" ? 0.8 : 1; }
  },
  overgrown: {
    name: "Overgrown", icon: "🌿", color: "#5fd66b",
    desc: "Verdant +20%, Volt -20%",
    modify(atkType, defType) { return atkType === "verdant" ? 1.2 : atkType === "volt" ? 0.8 : 1; }
  },
  none: {
    name: "Clear", icon: "☀️", color: "#888",
    desc: "No weather effects",
    modify(atkType, defType) { return 1; }
  }
};

let weather = { type: "none", turnsLeft: 0 };
function setWeather(type, turns) { weather = { type, turnsLeft: turns }; }
function advanceWeather() {
  if (weather.type !== "none") { weather.turnsLeft--; if (weather.turnsLeft <= 0) weather = { type: "none", turnsLeft: 0 }; }
}
function getWeatherMult(atkType, defType) {
  if (!weather || weather.type === "none") return 1;
  const w = WEATHER_CONDITIONS[weather.type];
  return w ? w.modify(atkType, defType) : 1;
}

function updateWeatherOverlay() {
  const arena = document.getElementById("arena");
  if (!arena) return;
  let overlay = document.getElementById("weather-overlay");
  if (!overlay) {
    overlay = document.createElement("div"); overlay.id = "weather-overlay";
    overlay.className = "weather-overlay";
    arena.insertBefore(overlay, arena.firstChild);
  }
  if (weather && weather.type !== "none") {
    overlay.className = "weather-overlay " + weather.type;
    overlay.style.display = "block";
  } else {
    overlay.style.display = "none";
  }
}

/* ============================= TRAINER TEMPLATES & AI ============================= */
const TRAINER_TEMPLATES = [
  { name: "Epidemic", theme: null, personality: "balanced", desc: "Balanced challenger" },
  { name: "Nightshard", theme: "ember", personality: "aggressive", desc: "Fire specialist" },
  { name: "Vellum", theme: "aqua", personality: "defensive", desc: "Water tactician" },
  { name: "Kestrix", theme: "gale", personality: "aggressive", desc: "Wind striker" },
  { name: "Rowan", theme: "verdant", personality: "balanced", desc: "Nature guardian" },
  { name: "Ashvale", theme: "stone", personality: "defensive", desc: "Rock bulwark" },
  { name: "Voltara", theme: "volt", personality: "balanced", desc: "Thunder master" },
  { name: "Diremire", theme: null, personality: "aggressive", desc: "Wildcard brawler" },
  { name: "Glacius", theme: "aqua+gale", personality: "defensive", desc: "Permafrost duelist" },
  { name: "Sylvara", theme: "verdant+ember", personality: "balanced", desc: "Overgrowth shaman" },
  { name: "Tecton", theme: "stone+volt", personality: "aggressive", desc: "Magma titan" },
  { name: "Shadoom", theme: null, personality: "tactician", desc: "Calculated predator" },
  { name: "Blitzara", theme: "volt+gale", personality: "reckless", desc: "Storm chaser" },
  { name: "Fernwood", theme: "verdant+stone", personality: "defensive", desc: "Ancient warden" },
];

const AI_PERSONALITIES = {
  aggressive: { switchChance: 0.08, dmgWeight: 1.3, switchBelowHpPct: 0.12, accWeight: 0.6, stabBonus: 1.1 },
  balanced: { switchChance: 0.3, dmgWeight: 1.0, switchBelowHpPct: 0.25, accWeight: 1.0, stabBonus: 1.1 },
  defensive: { switchChance: 0.55, dmgWeight: 0.85, switchBelowHpPct: 0.4, accWeight: 1.2, stabBonus: 1.15 },
  tactician: { switchChance: 0.4, dmgWeight: 1.0, switchBelowHpPct: 0.3, accWeight: 1.1, stabBonus: 1.2 },
  reckless: { switchChance: 0.05, dmgWeight: 1.5, switchBelowHpPct: 0.08, accWeight: 0.4, stabBonus: 0.9 }
};

const THEMED_ROSTER = {
  ember: ["cindrake", "pyrelope"],
  aqua: ["tidenne", "coralisk"],
  verdant: ["verdil", "thornuke"],
  volt: ["sparkit", "voltigo"],
  stone: ["pebblin", "boulderon"],
  gale: ["gustling", "zephyrn"]
};

/* ============================= BATTLE SOUND EFFECTS ============================= */
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playHitSound(pitch) {
  try {
    const ctx = getAudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sawtooth";
    const base = pitch || 150;
    osc.frequency.setValueAtTime(base, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(base * 0.6, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.15);
  } catch (e) { }
}

function playCritSound() {
  try {
    const ctx = getAudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.35);
    const osc2 = ctx.createOscillator(), gain2 = ctx.createGain();
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(800, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime); osc2.stop(ctx.currentTime + 0.15);
  } catch (e) { }
}

function playHealSound() {
  try {
    const ctx = getAudioCtx(), osc = ctx.createOscillator(), gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch (e) { }
}

function playVictorySound() {
  try {
    const ctx = getAudioCtx();
    [523, 659, 784, 1047].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15); osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) { }
}

function playDefeatSound() {
  try {
    const ctx = getAudioCtx();
    [400, 350, 300, 200].forEach((freq, i) => {
      const osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.4);
      osc.start(ctx.currentTime + i * 0.2); osc.stop(ctx.currentTime + i * 0.2 + 0.4);
    });
  } catch (e) { }
}

/* ============================= SAVE & PROGRESSION (v3) ============================= */
const SAVE_KEY = "rift_arena_rpg_v3";

function generateDefaultSave() {
  const save = {
    vp: 1000, wins: 0, losses: 0,
    playerLevel: 1, playerXp: 0, gold: 500, gems: 100,
    tierLevel: 1, tierXp: 0,
    stamina: 100, staminaMax: 100, lastStaminaRegen: Date.now(),
    lastIdleClaim: Date.now(),
    explore: { active: false },
    dojo: { active: false },
    dailyQuests: { date: "", quests: [] },
    dailyLogin: { date: "", streak: 0, claimed: false },
    guild: null,
    achievements: [],
    stats: { bestStreak: 0, expeditionsCompleted: 0, itemsForged: 0, materialsFound: 0, dojoHours: 0, gearEquipped: 0, evolutionsPerformed: 0 },
    bag: { vitalberry: 5, quickfeather: 2, ironscale: 2, puredew: 1, iron_ore: 3, leather: 2, cloth: 2, health_potion: 5, full_restore: 1, atk_boost: 2, def_boost: 2, spd_boost: 2 },
    mons: [],
    matchHistory: []
  };
  ["cindrake", "tidenne", "verdil", "sparkit"].forEach((id, i) => {
    save.mons.push({ uid: "start_" + i, baseId: id, level: 1, xp: 0, heldItem: "none", equipment: { weapon: "none", armor: "none", accessory: "none" }, mergeBonuses: {}, onExpedition: false, evolved: false, variant: null, mp: 0, talents: [] });
  });
  return save;
}

let save = (function () {
  let s;
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) s = { ...generateDefaultSave(), ...JSON.parse(raw) }; } catch (e) { }
  if (!s) s = generateDefaultSave();
  s.mons.forEach(m => {
    if (m.evolved === undefined) m.evolved = false;
    if (m.variant === undefined) m.variant = null;
    if (m.mp === undefined) m.mp = 0;
    if (m.talents === undefined) m.talents = [];
    if (m.equipment === undefined) {
      const itemKey = m.heldItem || "none";
      m.equipment = { weapon: "none", armor: "none", accessory: "none" };
      if (itemKey !== "none" && ITEMS[itemKey]) {
        const slot = ITEMS[itemKey].slot;
        if (slot && slot !== "material") { m.equipment[slot] = itemKey; }
      }
    }
    if (m.heldItem === undefined) m.heldItem = "none";
    m.heldItem = m.equipment.accessory || "none";
  });
  if (!s.matchHistory) s.matchHistory = [];
  if (!s.shopStock) s.shopStock = null;
  if (s.stamina === undefined) s.stamina = 100;
  if (s.staminaMax === undefined) s.staminaMax = 100;
  if (s.lastStaminaRegen === undefined) s.lastStaminaRegen = Date.now();
  if (!s.dailyLogin) s.dailyLogin = { date: "", streak: 0, claimed: false };
  if (!s.guild) s.guild = null;
  if (!s.achievements) s.achievements = [];
  if (!s.stats) s.stats = { bestStreak: 0, expeditionsCompleted: 0, itemsForged: 0, materialsFound: 0, dojoHours: 0, gearEquipped: 0, evolutionsPerformed: 0 };
  if (s._currentStreak === undefined) s._currentStreak = 0;
  return s;
})();
function saveGame() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

// --- STAMINA SYSTEM ---
const STAMINA_COST = { battle: 10, survival: 15, tournament: 20, explore: 5, dojo: 5, dungeon: 15 };
const STAMINA_REGEN_MS = 5 * 60 * 1000; // 5 minutes

function ensureStaminaRegen() {
  if (save.stamina >= save.staminaMax) {
    save.lastStaminaRegen = Date.now();
    return;
  }
  const elapsed = Date.now() - save.lastStaminaRegen;
  const regened = Math.floor(elapsed / STAMINA_REGEN_MS);
  if (regened > 0) {
    // MODIFIED: Multiply the elapsed intervals (regened) by 10 instead of 1
    save.stamina = Math.min(save.staminaMax, save.stamina + (regened * 10));
    save.lastStaminaRegen += regened * STAMINA_REGEN_MS;
    saveGame();
  }
}

function getNextStaminaRegen() {
  if (save.stamina >= save.staminaMax) return 0;
  const elapsed = Date.now() - save.lastStaminaRegen;
  const remaining = STAMINA_REGEN_MS - (elapsed % STAMINA_REGEN_MS);
  return Math.max(0, remaining);
}

function formatStaminaRegen(ms) {
  if (ms <= 0) return "Full";
  const mins = Math.ceil(ms / 60000);
  const secs = Math.ceil((ms % 60000) / 1000);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function hasStamina(cost) {
  ensureStaminaRegen();
  return save.stamina >= cost;
}

function deductStamina(cost) {
  if (!hasStamina(cost)) return false;
  save.stamina -= cost;
  saveGame();
  return true;
}

function refundStamina(cost) {
  save.stamina = Math.min(save.staminaMax, save.stamina + cost);
  saveGame();
}

function refillStamina(amount) {
  save.stamina = Math.min(save.staminaMax, save.stamina + amount);
  save.lastStaminaRegen = Date.now();
  saveGame();
}

function getPlayerMaxXp(lvl) { return lvl * 150; }
function getMonMaxXp(lvl) { return lvl * lvl * 50; }

function getMonData(uid) {
  const mSave = save.mons.find(m => m.uid === uid) || save.mons[0];
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  const lvl = mSave.level;

  const scale = 1 + (lvl - 1) * 0.05;
  const hpBonus = 1 + (mSave.mergeBonuses.hp || 0);
  const atkBonus = 1 + (mSave.mergeBonuses.atk || 0);
  const defBonus = 1 + (mSave.mergeBonuses.def || 0);
  const spdBonus = 1 + (mSave.mergeBonuses.spd || 0);

  // Equipment stat bonuses
  const equip = mSave.equipment || { weapon: "none", armor: "none", accessory: "none" };
  let equipHp = 0, equipAtk = 0, equipDef = 0, equipSpd = 0;
  EQUIP_SLOTS.forEach(slot => {
    const key = equip[slot];
    if (key && key !== "none" && ITEMS[key]) {
      const sb = ITEMS[key].statBonus || {};
      if (sb.hp) equipHp += sb.hp;
      if (sb.atk) equipAtk += sb.atk;
      if (sb.def) equipDef += sb.def;
      if (sb.spd) equipSpd += sb.spd;
    }
  });

  // Talent stat bonuses
  const talentBonuses = getTalentStatBonuses(mSave.uid);

  // Guild stat bonuses
  const guildBonuses = typeof getGuildStatBonuses === "function" ? getGuildStatBonuses() : { hp: 0, atk: 0, def: 0, spd: 0 };

  const variantKey = mSave.variant || null;
  const variantDef = variantKey ? VARIANTS[variantKey] : null;
  const vMod = variantDef ? variantDef.statMods : { hp: 1, atk: 1, def: 1, spd: 1 };

  const evoLevel = def[10] || 0;
  const evoName = def[11] || "";
  const evolved = mSave.evolved || false;
  const displayName = evolved ? (variantDef ? variantDef.icon + " " + variantDef.name + " " + evoName : evoName) : (variantDef ? variantDef.icon + " " + variantDef.name + " " + def[1] : def[1]);
  const displayType = variantDef && variantDef.typeOverride ? variantDef.typeOverride : def[2];

  const evoMult = evolved ? 1.25 : 1;

  const finalHp = Math.floor(def[3] * scale * hpBonus * vMod.hp * evoMult * (1 + equipHp) * (1 + talentBonuses.hp) * (1 + guildBonuses.hp));
  const finalAtk = Math.floor(def[4] * scale * atkBonus * vMod.atk * evoMult * (1 + equipAtk) * (1 + talentBonuses.atk) * (1 + guildBonuses.atk));
  const finalDef = Math.floor(def[5] * scale * defBonus * vMod.def * evoMult * (1 + equipDef) * (1 + talentBonuses.def) * (1 + guildBonuses.def));
  const finalSpd = Math.floor(def[6] * scale * spdBonus * vMod.spd * evoMult * (1 + equipSpd) * (1 + talentBonuses.spd) * (1 + guildBonuses.spd));

  return {
    uid: mSave.uid, baseId: def[0], name: displayName, type: displayType,
    baseHp: finalHp,
    atk: finalAtk,
    def: finalDef,
    spd: finalSpd,
    overallAffinity: Math.round(Math.max(finalHp, finalAtk, finalDef, finalSpd) / 4),
    item: mSave.heldItem, sigName: def[8], shape: def[9],
    level: lvl, xp: mSave.xp, onExpedition: mSave.onExpedition,
    maxXp: getMonMaxXp(lvl),
    evolvesAt: evoLevel,
    evoName: evoName,
    evolved: evolved,
    variant: variantKey,
    variantDef: variantDef,
    moves: [BASH, MOVES[displayType], move(def[8], displayType, 80, 85)]
  };
}

function rankForVP(vp) {
  if (vp < 1500) return "Bronze"; if (vp < 2500) return "Silver";
  if (vp < 3500) return "Gold"; if (vp < 4500) return "Platinum"; return "Master";
}

function initLeaderboardUI() {
  const fmt = typeof window.formatNum === "function" ? window.formatNum : (n => n);
  const container = document.getElementById("leaderboard-content");
  if (!container) return;
  container.innerHTML = "";

  const sorted = [...NPC_LEADERBOARD].sort((a, b) => b.vp - a.vp);
  let playerIdx = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (save.vp > sorted[i].vp) { playerIdx = i; break; }
  }
  if (playerIdx === -1) playerIdx = sorted.length;

  let html = `<div class="lb-header">
    <div class="lb-player-spot">
      <div class="lb-rank-icon">${playerIdx === 0 ? "👑" : playerIdx < 3 ? "🥇" : playerIdx < 5 ? "🥈" : "🥉"}</div>
      <div>
        <div class="lb-player-name">You <span class="badge">${rankForVP(save.vp)}</span></div>
        <div class="lb-player-stats">${fmt(save.vp)} VP · ${save.wins}W ${save.losses}L</div>
      </div>
      <div class="lb-pos">#${playerIdx + 1}</div>
    </div>
  </div>`;

  html += `<div class="lb-ladder"><div class="lb-ladder-title">Arena Rankings</div>`;
  sorted.forEach((npc, i) => {
    const isPlayerPos = i === playerIdx;
    html += `<div class="lb-row ${isPlayerPos ? 'lb-row-you' : ''}">
      <div class="lb-rank">${i < 3 ? npc.badge : "#" + (i + 1)}</div>
      <div class="lb-orb t-${["ember", "aqua", "verdant", "volt", "stone", "gale"][i % 6]}"><div class="glyph"></div></div>
      <div class="lb-info">
        <div class="lb-npc-name">${npc.name}</div>
        <div class="lb-npc-stats">${npc.rank} · ${npc.wins}W ${npc.losses}L</div>
      </div>
      <div class="lb-vp">${fmt(npc.vp)}</div>
    </div>`;
    if (isPlayerPos) {
      html += `<div class="lb-row lb-row-player">
        <div class="lb-rank">#${playerIdx + 1}</div>
        <div class="lb-orb t-${["ember", "aqua", "verdant", "volt", "stone", "gale"][playerIdx % 6]}"><div class="glyph"></div></div>
        <div class="lb-info">
          <div class="lb-npc-name">You (${rankForVP(save.vp)})</div>
          <div class="lb-npc-stats">${fmt(save.vp)} VP</div>
        </div>
        <div class="lb-vp" style="color:var(--gold);">${fmt(save.vp)}</div>
      </div>`;
    }
  });
  html += `</div>`;

  html += `<div class="lb-history"><div class="lb-ladder-title">Match History</div>`;
  if (save.matchHistory.length === 0) {
    html += `<div class="lb-row" style="justify-content:center; color:var(--text-dim);">No matches played yet.</div>`;
  } else {
    save.matchHistory.slice(0, 10).forEach(m => {
      const cls = m.won ? "lb-hist-win" : "lb-hist-loss";
      const sign = m.vpChange > 0 ? "+" : "";
      html += `<div class="lb-row ${cls}">
        <div class="lb-hist-result">${m.won ? "WIN" : "LOSS"}</div>
        <div class="lb-info"><div class="lb-npc-name">vs ${m.opponent}</div></div>
        <div class="lb-vp">${sign}${m.vpChange} VP</div>
      </div>`;
    });
  }
  html += `</div>`;

  container.innerHTML = html;
}

/* ============================= UI NAVIGATION ============================= */
function show(id) {
  const target = document.getElementById(id);
  if (!target) {
    console.warn(`Navigation Warning: Screen with ID "${id}" was not found in the DOM.`);
    return;
  }
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  target.classList.add("active");
}
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.getAttribute("data-back") === "screen-home") refreshHome();
    show(btn.getAttribute("data-back"));
  });
});

/* ============================= DASHBOARD / HOME ============================= */
function refreshHome() {
  document.getElementById("player-level").textContent = "Lv." + save.playerLevel;
  document.getElementById("player-xp-fill").style.width = `${Math.min(100, (save.playerXp / getPlayerMaxXp(save.playerLevel)) * 100)}%`;

  document.getElementById("tier-level").textContent = save.tierLevel;
  document.getElementById("tier-xp-fill").style.width = `${Math.min(100, (save.tierXp / getTierMaxXp(save.tierLevel)) * 100)}%`;

  document.getElementById("res-gold").textContent = formatNum(save.gold);
  document.getElementById("res-gems").textContent = formatNum(save.gems);

  document.getElementById("home-rank").textContent = rankForVP(save.vp);
  document.getElementById("home-vp").textContent = formatNum(save.vp) + " VP";

  ensureStaminaRegen();
  const stEl = document.getElementById("stamina-count");
  const fillEl = document.getElementById("stamina-fill");
  const regenEl = document.getElementById("stamina-regen");
  if (stEl) stEl.textContent = `${save.stamina}/${save.staminaMax}`;
  if (fillEl) fillEl.style.width = `${(save.stamina / save.staminaMax) * 100}%`;
  if (regenEl) {
    const nextMs = getNextStaminaRegen();
    regenEl.textContent = nextMs > 0 ? `+10 in ${formatStaminaRegen(nextMs)}` : "Full";
  }
  if (typeof updateExploreDash === "function") updateExploreDash();
  if (typeof updateDojoDash === "function") updateDojoDash();
  if (typeof updateTourneyDashboard === "function") updateTourneyDashboard();
  if (typeof updateDungeonDash === "function") updateDungeonDash();
  if (typeof initDailyLoginUI === "function") initDailyLoginUI();
  if (typeof initGuildUI === "function") initGuildUI();
  // Update guild dash status
  const guildDash = document.getElementById("guild-dash");
  if (guildDash) {
    if (save.guild) guildDash.textContent = `Lv.${save.guild.level}`;
    else guildDash.textContent = "Create";
  }
}

setInterval(() => {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  const earned = mins * 3;
  document.getElementById("idle-status").textContent = mins > 0 ? `${formatNum(earned)}🪙 stored` : "Claim";
}, 1000);

setInterval(() => {
  const homeActive = document.getElementById("screen-home").classList.contains("active");
  if (homeActive) {
    ensureStaminaRegen();
    const fillEl = document.getElementById("stamina-fill");
    const stEl = document.getElementById("stamina-count");
    const regenEl = document.getElementById("stamina-regen");
    if (fillEl) fillEl.style.width = `${(save.stamina / save.staminaMax) * 100}%`;
    if (stEl) stEl.textContent = `${save.stamina}/${save.staminaMax}`;
    if (regenEl) {
      const nextMs = getNextStaminaRegen();
      regenEl.textContent = nextMs > 0 ? `+10 in ${formatStaminaRegen(nextMs)}` : "Full";
    }
  }
}, 5000);

document.getElementById("card-idle").addEventListener("click", () => {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  if (mins > 0) {
    const earned = mins * 3;
    save.gold += earned; save.lastIdleClaim = Date.now(); saveGame();
    showModal({ icon: "🪙", title: "Idle Base", message: `Claimed ${formatNum(earned)} Gold from Idle Base!` });
    refreshHome();
  } else showModal({ icon: "⏳", title: "Idle Base", message: "Too soon to claim again. Base generates gold over time." });
});

document.getElementById("card-summon").addEventListener("click", () => {
  if (save.gems < 100) return showModal({ icon: "💎", title: "Not Enough Gems", message: "Not enough gems. Earn gems by exploring or leveling up!" });
  save.gems -= 100;

  const choice = ROSTER_DEF[Math.floor(Math.random() * ROSTER_DEF.length)];
  const uid = Date.now().toString() + Math.floor(Math.random() * 1000);
  const variantRoll = Math.random();
  let variant = null;
  if (variantRoll < 0.10) {
    const vKeys = Object.keys(VARIANTS);
    variant = vKeys[Math.floor(Math.random() * vKeys.length)];
  }
  save.mons.push({ uid: uid, baseId: choice[0], level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false, evolved: false, variant: variant, mp: 0, talents: [] });

  if (typeof trackQuestProgress === "function") trackQuestProgress("summon", 1);
  saveGame(); refreshHome();
  const vTag = variant ? " " + VARIANTS[variant].icon + " " + VARIANTS[variant].name : "";
  showModal({ icon: "✨", title: "Summon Complete", message: `Summoned a new${vTag} ${choice[1]}! Added to roster.` });
});

// Hooks to systems.js
document.getElementById("card-explore").addEventListener("click", () => { initExploreUI(); show("screen-explore"); });
document.getElementById("card-merge").addEventListener("click", () => { initMergeUI(); show("screen-merge"); });
document.getElementById("card-forge").addEventListener("click", () => { if (typeof initForgeUI === "function") initForgeUI(); show("screen-forge"); });
document.getElementById("card-bag").addEventListener("click", () => { initBagUI(); show("screen-bag"); });
if (document.getElementById("card-shop")) document.getElementById("card-shop").addEventListener("click", () => { initShopUI(); show("screen-shop"); });
if (document.getElementById("card-dojo")) document.getElementById("card-dojo").addEventListener("click", () => { initDojoUI(); show("screen-dojo"); });

document.getElementById("card-battle").addEventListener("click", () => {
  if (save.mons.filter(m => !m.onExpedition).length < 3) return showModal({ icon: "⚠️", title: "Cannot Battle", message: "You need at least 3 Rift-forms available to battle." });
  buildSelectGrid();
  show("screen-select");
  document.getElementById("btn-confirm-team").textContent = "Find Ranked Match";
  if (document.getElementById("btn-survival-team")) document.getElementById("btn-survival-team").style.display = "";
  if (document.getElementById("btn-tournament-team")) document.getElementById("btn-tournament-team").style.display = "";
});
document.getElementById("card-battle").addEventListener("contextmenu", (e) => {
  e.preventDefault();
  buildSelectGrid();
  show("screen-select");
  document.getElementById("btn-confirm-team").textContent = "Find Ranked Match";
  if (document.getElementById("btn-survival-team")) document.getElementById("btn-survival-team").style.display = "";
  if (document.getElementById("btn-tournament-team")) document.getElementById("btn-tournament-team").style.display = "";
});
document.getElementById("card-roster").addEventListener("click", () => { buildRosterView(); show("screen-roster"); });
if (document.getElementById("card-quests")) document.getElementById("card-quests").addEventListener("click", () => { initQuestsUI(); show("screen-quests"); });

function showTournamentInfo() {
  const container = document.getElementById("tournament-content");
  if (!container) return;
  const gemsHave = save.gems;
  container.innerHTML = `
    <div class="tourney-card highlight">
      <div class="tourney-header">
        <div class="tourney-name">🏆 Rift Cup</div>
        <div class="tourney-prize">🥇 500 🪙 · 100 💎</div>
      </div>
      <div class="tourney-desc">4-player bracket tournament. Select 3 Rift-forms and battle through semi-finals and finals!</div>
      <div class="tourney-desc" style="color:var(--gold);">Entry Fee: 50 💎 (You have ${gemsHave})</div>
      <div class="tourney-desc" style="font-size:11px; color:var(--text-dim);">
        Prizes: 1st: 500🪙+100💎 · 2nd: 250🪙+40💎 · 3rd: 125🪙+20💎 · 4th: 50🪙+5💎
      </div>
      <button class="btn gold" id="btn-enter-tourney" style="margin-top:8px;" ${gemsHave < 50 ? 'disabled' : ''}>${gemsHave < 50 ? 'Not enough Gems' : 'Select Team →'}</button>
      <button class="btn ghost" onclick="refreshHome(); show('screen-home');" style="margin-top:4px;">Back</button>
    </div>
  `;
  document.getElementById("btn-enter-tourney").onclick = () => {
    if (save.gems < 50) return showModal({ icon: "💎", title: "Not Enough Gems", message: `Not enough Gems! Need 50 💎.` });
    buildSelectGrid();
    battleMode = "tournament";
    if (document.getElementById("btn-tournament-team")) document.getElementById("btn-tournament-team").style.display = "none";
    if (document.getElementById("btn-survival-team")) document.getElementById("btn-survival-team").style.display = "none";
    document.getElementById("btn-confirm-team").textContent = "Enter Tournament";
    show("screen-select");
  };
}

if (document.getElementById("card-tournament")) {
  document.getElementById("card-tournament").addEventListener("click", () => {
    if (tournamentState && tournamentState.playerAlive) {
      showTourneyBracket();
    } else {
      showTournamentInfo();
      show("screen-tournament");
    }
  });
}
if (document.getElementById("card-leaderboard")) {
  document.getElementById("card-leaderboard").addEventListener("click", () => {
    initLeaderboardUI();
    show("screen-leaderboard");
  });
}
if (document.getElementById("card-lab")) {
  document.getElementById("card-lab").addEventListener("click", () => {
    if (typeof initLabUI === "function") initLabUI();
    show("screen-lab");
  });
}
refreshHome();

/* ============================= ROSTER & DETAILS ============================= */
function statLine(m) { return `HP ${m.baseHp} · ATK ${m.atk} · DEF ${m.def} · SPD ${m.spd}`; }

let rosterFilterType = "all";
let rosterSortKey = "name";

function getRosterMons() {
  let list = save.mons.map(mSave => ({ mSave, m: getMonData(mSave.uid) }));
  if (rosterFilterType !== "all") {
    list = list.filter(x => x.m.type === rosterFilterType);
  }
  list.sort((a, b) => {
    switch (rosterSortKey) {
      case "name": return a.m.name.localeCompare(b.m.name);
      case "name-desc": return b.m.name.localeCompare(a.m.name);
      case "level": return b.m.level - a.m.level;
      case "level-asc": return a.m.level - b.m.level;
      case "type": {
        const tOrder = ["ember", "aqua", "verdant", "volt", "stone", "gale"];
        return tOrder.indexOf(a.m.type) - tOrder.indexOf(b.m.type);
      }
      default: return 0;
    }
  });
  return list;
}

function renderRosterGrid() {
  const grid = document.getElementById("roster-view-grid");
  if (!grid) return;
  grid.innerHTML = "";

  getRosterMons().forEach(({ mSave, m }) => {
    const card = document.createElement("div");
    card.className = "cmon-card roster-oa-card t-" + m.type + (m.onExpedition ? " locked" : "");
    const vBadge = m.variant ? `<span class="var-badge var-${m.variant}">${m.variantDef.icon}</span>` : "";
    const passive = getPassive(m.type);
    const evoTag = m.evolved ? `<span class="evo-badge">✦</span>` : "";
    card.innerHTML = `
      <div class="row1">
        <div class="sprite-thumb" id="roster-sprite-${m.uid}"></div>
        <div style="flex:1;">
          <div class="name">${vBadge}${evoTag}${m.name} <span class="badge">Lv.${m.level}</span></div>
          <div class="type">${m.type}${passive ? ` · ${passive.icon} ${passive.name}` : ''} ${m.onExpedition ? '(Exploring)' : ''} ${m.variant ? m.variantDef.name : ''}</div>
        </div>
      </div>
      <div class="roster-oa-row"><span class="roster-oa-label">OA</span><span class="roster-oa-val">${m.overallAffinity}</span></div>
      <div class="xp-bar" style="width:100%; margin-top:4px;"><div class="xp-fill" style="width:${(m.xp / m.maxXp) * 100}%"></div></div>
      <div class="xp-text">${formatNum(m.xp)} / ${formatNum(m.maxXp)} XP (${Math.round((m.xp / m.maxXp) * 100)}%)</div>
      ${passive && m.passiveDesc ? `<div class="passive-desc" style="font-size:10px;color:var(--text-dim);margin-top:2px;">${passive.icon} ${m.passiveDesc}</div>` : ''}
    `;
    card.addEventListener("click", () => showMonDetails(m));
    grid.appendChild(card);
    setCreatureSprite(document.getElementById("roster-sprite-" + m.uid), m.baseId, m.evolved);
  });
}

function buildRosterView() {
  const sortEl = document.getElementById("roster-sort");
  const filterEl = document.getElementById("roster-filter");
  if (sortEl) sortEl.onchange = () => { rosterSortKey = sortEl.value; renderRosterGrid(); };
  if (filterEl) filterEl.onchange = () => { rosterFilterType = filterEl.value; renderRosterGrid(); };
  renderRosterGrid();
}

function showMonDetails(m) {
  const view = document.getElementById("mon-details-view");
  if (!view) return;
  const upgCost = m.level * 100;

  const drawStat = (label, val, max) => `
    <div class="stat-bar-row">
      <div class="stat-label">${label}</div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100, (val / max) * 100)}%"></div></div>
      <div class="stat-val">${val}</div>
    </div>`;

  const vTag = m.variant ? `<div class="var-badge var-${m.variant}" style="display:inline-block; font-size:13px; padding:2px 10px;">${m.variantDef.icon} ${m.variantDef.name}</div>` : "";
  const evoTag = m.evolved ? `<span class="evo-badge-lg">✦ EVOLVED</span>` : "";
  view.innerHTML = `
    <div class="orb mon-big-orb sprite-orb t-${m.type} ${m.evolved ? 'evo-orb-glow' : ''}" id="detail-sprite-${m.uid}" style="transform:scale(1.8); margin:30px 0;"></div>
    <div style="text-align:center; font-family:var(--display); font-weight:800; font-size:22px;">${vTag} ${m.name} <span class="badge">Lv.${m.level}</span> ${evoTag}</div>
    ${m.evolved ? `<div style="text-align:center; font-size:11px; color:var(--gold);">✦ Evolution Bonus: +25% All Stats</div>` : (m.evolvesAt > 0 ? `<div style="text-align:center; font-size:11px; color:var(--text-dim);">Evolves at Lv.${m.evolvesAt} → ${m.evoName} (+25% all stats)</div>` : '')}
    
    <div style="text-align:center; padding:6px; background:rgba(255,255,255,0.03); border-radius:10px; border:1px solid var(--line);">
      <span style="font-size:11px; color:var(--text-dim); font-weight:700; letter-spacing:1px;">OA</span>
      <span style="font-family:var(--display); font-weight:800; font-size:22px; margin-left:6px;">${m.overallAffinity}</span>
      <span style="font-size:10px; color:var(--text-dim); margin-left:4px;">Highest stat ÷ 4</span>
    </div>

    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
      ${drawStat("HP", m.baseHp, 300)}
      ${drawStat("ATK", m.atk, 250)}
      ${drawStat("DEF", m.def, 250)}
      ${drawStat("SPD", m.spd, 250)}
    </div>

    <div class="xp-detail-card">
      <div class="xp-detail-header">${formatNum(m.xp)} / ${formatNum(m.maxXp)} XP</div>
      <div class="xp-bar" style="width:100%;"><div class="xp-fill" style="width:${(m.xp / m.maxXp) * 100}%"></div></div>
      <div class="xp-detail-stats"><span>${Math.round((m.xp / m.maxXp) * 100)}% to next level</span><span>${formatNum(m.maxXp - m.xp)} XP remaining</span></div>
      ${!m.evolved && m.evolvesAt > 0 ? `<div class="xp-preview" style="color:${m.level >= m.evolvesAt ? 'var(--safe)' : 'var(--gold-dim)'};">${m.level >= m.evolvesAt ? '✦ Evolution ready! ✦' : `Evolves at Lv.${m.evolvesAt} (${m.evolvesAt - m.level} levels away)`}</div>` : ''}
      ${m.level < 100 ? `<div class="xp-preview">Next level at ${formatNum(getMonMaxXp(m.level))} total XP · Costs ${formatNum(m.level * 100)} 🪙 to level up</div>` : '<div class="xp-preview" style="color:var(--gold);">★ MAX LEVEL REACHED ★</div>'}
    </div>
    
    <div style="font-size:12px; color:var(--text-dim); text-align:center; margin-top:10px;">
      ${EQUIP_SLOTS.map(s => {
    const saveM = save.mons.find(x => x.uid === m.uid);
    const key = saveM && saveM.equipment ? saveM.equipment[s] : "none";
    return `<span style="margin:0 4px;">${s.charAt(0).toUpperCase() + s.slice(1)}: ${ITEMS[key] ? ITEMS[key].name : "None"}</span>`;
  }).join(" | ")}
    </div>
    ${m.evolved ? `<div style="font-size:11px; color:var(--gold-dim); text-align:center; margin-top:6px;">✦ Evolution Passive Boost: ${m.passiveDesc || (getPassive(m.type) ? getPassive(m.type).desc : '')}</div>` : (() => { const pa = getPassive(m.type); return pa ? `<div style="font-size:11px; color:var(--xp-blue); text-align:center; margin-top:6px;">${pa.icon} Passive: ${pa.name} — ${m.passiveDesc || pa.desc}</div>` : ""; })()}
    
    <button class="btn gold" id="btn-lvlup" style="margin-top:10px;" ${m.onExpedition ? 'disabled' : ''}>Level Up (${formatNum(upgCost)} Gold)</button>
    ${(!m.evolved && m.evolvesAt > 0 && m.level >= m.evolvesAt) ? `<button class="btn gold" id="btn-evolve" style="margin-top:8px; background:linear-gradient(135deg, #c084fc, #8b5cf6); color:white; border:none;">✨ Evolve to ${m.evoName} (FREE)</button>` : ''}
    <button class="btn ghost" id="btn-talents" style="margin-top:8px; border-color:var(--gold-dim); color:var(--gold);">✦ Talents Mastery (${getMasteryPoints(m.uid)} MP)</button>
  `;

  show("screen-details");
  setCreatureSprite(document.getElementById("detail-sprite-" + m.uid), m.baseId, m.evolved);

  document.getElementById("btn-lvlup").onclick = () => {
    if (save.gold < upgCost) return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Not enough gold." });
    save.gold -= upgCost;
    const mSave = save.mons.find(x => x.uid === m.uid);
    mSave.level++;
    awardMasteryPoints(m.uid, 1);
    if (typeof trackQuestProgress === "function") trackQuestProgress("level_up", 1);
    saveGame();
    const updated = getMonData(m.uid);
    if (!mSave.evolved && updated.evolvesAt > 0 && mSave.level >= updated.evolvesAt) {
      showEvolutionPrompt(updated);
    } else {
      refreshHome();
      showMonDetails(updated);
    }
  };

  const evolveBtn = document.getElementById("btn-evolve");
  if (evolveBtn) {
    evolveBtn.onclick = () => {
      performEvolution(m.uid);
    };
  }

  const talentBtn = document.getElementById("btn-talents");
  if (talentBtn) {
    talentBtn.onclick = () => showTalentTree(m.uid);
  }
}

/* ============================= EVOLUTION SYSTEM ============================= */
function performEvolution(uid) {
  const mSave = save.mons.find(x => x.uid === uid);
  if (!mSave || mSave.evolved) return;
  const oldName = getMonData(uid).name;

  showEvolutionAnimation(uid, () => {
    mSave.evolved = true;
    save.stats.evolutionsPerformed = (save.stats.evolutionsPerformed || 0) + 1;
    saveGame();
    const evolved = getMonData(uid);
    const oldView = document.getElementById("mon-details-view");
    if (oldView) {
      showMonDetails(evolved);
    }
    refreshHome();
  });
}

function showEvolutionAnimation(uid, callback) {
  const m = getMonData(uid);
  const overlay = document.createElement("div");
  overlay.id = "evo-overlay";
  overlay.innerHTML = `
    <div class="evo-container">
      <div class="evo-orb t-${m.type} ${m.shape}">
        <div class="evo-glow"></div>
        <div class="evo-face"><div class="eye l"></div><div class="eye r"></div></div>
      </div>
      <div class="evo-name">${m.name}</div>
      <div class="evo-label">is evolving...</div>
      <div class="evo-bars">
        <div class="evo-bar-row"><span class="evo-bar-label">HP</span><div class="evo-bar-track"><div class="evo-bar-fill" style="width:70%"></div></div></div>
        <div class="evo-bar-row"><span class="evo-bar-label">ATK</span><div class="evo-bar-track"><div class="evo-bar-fill" style="width:70%"></div></div></div>
        <div class="evo-bar-row"><span class="evo-bar-label">DEF</span><div class="evo-bar-track"><div class="evo-bar-fill" style="width:70%"></div></div></div>
        <div class="evo-bar-row"><span class="evo-bar-label">SPD</span><div class="evo-bar-track"><div class="evo-bar-fill" style="width:70%"></div></div></div>
      </div>
    </div>
  `;
  document.getElementById("app").appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add("evo-active"));

  const evoName = m.evoName || m.name;
  const duration = 2500;
  const startTime = Date.now();

  function animStep() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / duration);
    const bars = overlay.querySelectorAll(".evo-bar-fill");
    const orb = overlay.querySelector(".evo-orb");
    const label = overlay.querySelector(".evo-label");

    bars.forEach(bar => {
      const currentW = 70 + progress * 25;
      bar.style.width = Math.min(95, currentW) + "%";
    });

    if (progress > 0.5) {
      orb.className = "evo-orb evo-evolved t-" + m.type + " " + m.shape;
      label.textContent = "evolved into " + evoName + "!";
    }

    if (progress < 1) {
      requestAnimationFrame(animStep);
    } else {
      setTimeout(() => {
        overlay.classList.remove("evo-active");
        overlay.classList.add("evo-fadeout");
        setTimeout(() => overlay.remove(), 600);
        if (callback) callback();
      }, 500);
    }
  }

  requestAnimationFrame(animStep);
}

function showEvolutionPrompt(m) {
  const overlay = document.createElement("div");
  overlay.id = "evo-prompt-overlay";
  overlay.innerHTML = `
    <div class="evo-prompt">
      <div class="evo-prompt-orb t-${m.type} ${m.shape}"><div class="face"><div class="eye l"></div><div class="eye r"></div></div></div>
      <div class="evo-prompt-title">Evolution Available!</div>
      <div class="evo-prompt-desc">${m.name} has reached Lv.${m.level} and is ready to evolve into <strong>${m.evoName}</strong>!</div>
      <div class="evo-prompt-stats">
        <div>✦ All stats +25%</div>
        <div>✦ Enhanced passive ability</div>
        <div>✦ New visual form</div>
      </div>
      <div class="evo-prompt-btns">
        <button class="btn gold" id="btn-evolve-prompt-yes">✨ Evolve Now</button>
        <button class="btn ghost" id="btn-evolve-prompt-later">Later</button>
      </div>
    </div>
  `;
  document.getElementById("app").appendChild(overlay);

  document.getElementById("btn-evolve-prompt-yes").onclick = () => {
    overlay.remove();
    performEvolution(m.uid);
  };
  document.getElementById("btn-evolve-prompt-later").onclick = () => {
    overlay.remove();
    refreshHome();
    showMonDetails(m);
  };
}

/* ============================= TEAM SELECT ============================= */
let pickOrder = [];
let battleMode = "ranked";

function buildSelectGrid() {
  battleMode = "ranked";
  pickOrder = [];
  const grid = document.getElementById("select-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const survBtn = document.getElementById("btn-survival-team");
  if (survBtn) survBtn.style.display = "";
  const tourneyBtn = document.getElementById("btn-tournament-team");
  if (tourneyBtn) tourneyBtn.style.display = "";

  save.mons.forEach(mSave => {
    if (mSave.onExpedition) return;
    const m = getMonData(mSave.uid);
    const card = document.createElement("div");
    card.className = "cmon-card"; card.dataset.uid = m.uid;
    const passive = getPassive(m.type);
    card.innerHTML = `
      <div class="pickbadge" style="display:none;"></div>
      <div class="row1"><div class="sprite-thumb" id="select-sprite-${m.uid}"></div>
      <div><div class="name">${m.name} <span class="badge">Lv.${m.level}</span></div><div class="type">${m.type}${passive ? ` ${passive.icon}` : ''}</div></div></div>
      <div class="stats">${statLine(m)}</div>
      ${m.passiveDesc ? `<div class="passive-desc" style="font-size:10px;color:var(--text-dim);margin-top:2px;">${m.passiveIcon} ${m.passiveDesc}</div>` : ''}
    `;
    card.onclick = () => togglePick(m.uid, card);
    grid.appendChild(card);
    setCreatureSprite(document.getElementById("select-sprite-" + m.uid), m.baseId, m.evolved);
  });
  updateConfirmBtn();
}

function togglePick(uid, card) {
  const idx = pickOrder.indexOf(uid);
  if (idx >= 0) { pickOrder.splice(idx, 1); card.classList.remove("picked"); card.querySelector(".pickbadge").style.display = "none"; }
  else { if (pickOrder.length >= 3) return; pickOrder.push(uid); card.classList.add("picked"); const badge = card.querySelector(".pickbadge"); badge.style.display = "flex"; badge.textContent = pickOrder.length; }

  document.querySelectorAll("#select-grid .cmon-card").forEach(c => {
    const i = pickOrder.indexOf(c.dataset.uid);
    const badge = c.querySelector(".pickbadge");
    if (i >= 0) { badge.style.display = "flex"; badge.textContent = i + 1; c.classList.add("picked"); }
    else { badge.style.display = "none"; c.classList.remove("picked"); }
  });
  updateConfirmBtn();
}

function updateConfirmBtn() {
  const btn = document.getElementById("btn-confirm-team");
  if (!btn) return;
  btn.textContent = `Find Ranked Match (${pickOrder.length}/3)`;
  btn.disabled = pickOrder.length !== 3;
  const survBtn = document.getElementById("btn-survival-team");
  if (survBtn) {
    survBtn.textContent = `Survival Mode (${pickOrder.length}/3)`;
    survBtn.disabled = pickOrder.length !== 3;
  }
  const tourneyBtn = document.getElementById("btn-tournament-team");
  if (tourneyBtn) {
    tourneyBtn.textContent = `Tournament (${pickOrder.length}/3)`;
    tourneyBtn.disabled = pickOrder.length !== 3;
  }
}

document.getElementById("btn-confirm-team").addEventListener("click", () => {
  if (pickOrder.length !== 3) return;
  if (battleMode === "tournament") {
    startTournamentMode(pickOrder.slice());
  } else if (battleMode === "dungeon") {
    const idx = window._pendingDungeonIdx;
    window._pendingDungeonIdx = null;
    if (typeof startDungeon === "function" && idx !== undefined) {
      startDungeon(pickOrder.slice(), idx);
    }
  } else {
    startMatchmaking(pickOrder.slice());
  }
  battleMode = "ranked";
});

if (document.getElementById("btn-survival-team")) {
  document.getElementById("btn-survival-team").addEventListener("click", () => {
    if (pickOrder.length !== 3) return;
    if (typeof startSurvivalMode === "function") startSurvivalMode();
  });
}

if (document.getElementById("btn-tournament-team")) {
  document.getElementById("btn-tournament-team").addEventListener("click", () => {
    if (pickOrder.length !== 3) return;
    if (typeof startTournamentMode === "function") startTournamentMode(pickOrder.slice());
  });
}

/* ============================= MATCHMAKING QUEUE ============================= */
let matchmakingTimer = null;
let matchmakingCancelled = false;

function startMatchmaking(playerUids) {
  if (!deductStamina(STAMINA_COST.battle)) {
    return showModal({ icon: "⚡", title: "Not Enough Stamina", message: `Need ${STAMINA_COST.battle} stamina to queue for battle. Regen: 1 per 5 min.` });
  }
  const pData = playerUids.map(uid => getMonData(uid));
  const avgLevel = Math.max(1, Math.floor(pData.reduce((s, m) => s + m.level, 0) / 3));
  const playerVP = save.vp;

  // Added safety fallback from Top Duplicate
  if (!document.getElementById("queue-timer")) {
    const vpDiff = Math.floor((Math.random() - 0.5) * 400);
    const oppVP = Math.max(500, playerVP + vpDiff);
    const oppRank = rankForVP(oppVP);
    const oppLvl = Math.max(1, avgLevel + Math.floor((oppVP - playerVP) / 200));

    const trainer = TRAINER_TEMPLATES[Math.floor(Math.random() * TRAINER_TEMPLATES.length)];
    let oppIds = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).slice(0, 3);
    startPrepWithData(playerUids, oppIds, oppLvl, trainer, oppRank);
    return;
  }

  document.getElementById("queue-timer").textContent = "00:00";
  document.getElementById("queue-sub").textContent = "Searching the arena for a worthy opponent...";
  document.getElementById("queue-rank-range").textContent = `Your VP: ${formatNum(playerVP)}`;
  show("screen-queue");

  const queueStart = Date.now();
  const searchTime = 3000 + Math.random() * 4000;

  matchmakingCancelled = false;
  clearInterval(matchmakingTimer);
  matchmakingTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - queueStart) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById("queue-timer").textContent = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");

    if (elapsed % 3 === 0) {
      const msgs = [
        "Scanning nearby rift signatures...",
        "Evaluating opponent ranking...",
        "Checking arena availability...",
        "Calibrating match balance...",
        "Opponent found! Authenticating...",
        "Establishing rift connection..."
      ];
      document.getElementById("queue-sub").textContent = msgs[Math.floor(Math.random() * msgs.length)];
    }
  }, 1000);

  setTimeout(() => {
    if (matchmakingCancelled) return;
    clearInterval(matchmakingTimer);
    document.getElementById("queue-sub").textContent = "Match found!";

    // Build opponent based on VP matchmaking
    const vpDiff = Math.floor((Math.random() - 0.5) * 400);
    const oppVP = Math.max(500, playerVP + vpDiff);
    const oppRank = rankForVP(oppVP);
    const oppLvl = Math.max(1, avgLevel + Math.floor((oppVP - playerVP) / 200));

    const trainer = TRAINER_TEMPLATES[Math.floor(Math.random() * TRAINER_TEMPLATES.length)];
    let oppIds;
    if (trainer.theme) {
      const themes = trainer.theme.includes("+") ? trainer.theme.split("+") : [trainer.theme];
      let pool = [];
      themes.forEach(t => { if (THEMED_ROSTER[t]) pool = pool.concat(THEMED_ROSTER[t]); });
      pool = [...new Set(pool)].sort(() => Math.random() - 0.5);
      const fromTheme = [...pool];
      while (fromTheme.length < 3) {
        const extra = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).filter(id => !fromTheme.includes(id));
        fromTheme.push(extra[0]);
      }
      oppIds = fromTheme;
    } else {
      oppIds = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).slice(0, 3);
    }

    document.getElementById("prep-foe-name").textContent = trainer.name;
    startPrepWithData(playerUids, oppIds, oppLvl, trainer, oppRank);
  }, searchTime);
}

function cancelMatchmaking() {
  matchmakingCancelled = true;
  clearInterval(matchmakingTimer);
  refundStamina(STAMINA_COST.battle);
  buildSelectGrid();
  show("screen-select");
}

if (document.getElementById("btn-cancel-queue")) {
  document.getElementById("btn-cancel-queue").addEventListener("click", cancelMatchmaking);
}

document.getElementById("btn-tourney-leave").addEventListener("click", () => {
  tournamentState = null;
  refreshHome();
  show("screen-home");
});

/* ============================= TOURNAMENT MODE ============================= */
var tournamentState = null;

function startTournamentMode(playerUids) {
  const entryFee = 50;
  if (save.gems < entryFee) return showModal({ icon: "🏆", title: "Entry Fee", message: `Tournament entry requires ${entryFee} Gems. You have ${save.gems}.` });
  if (!deductStamina(STAMINA_COST.tournament)) {
    return showModal({ icon: "⚡", title: "Not Enough Stamina", message: `Need ${STAMINA_COST.tournament} stamina for Tournament. Regen: 1 per 5 min.` });
  }

  const pData = playerUids.map(uid => getMonData(uid));
  const avgLevel = Math.max(1, Math.floor(pData.reduce((s, m) => s + m.level, 0) / 3));

  save.gems -= entryFee;
  trackQuestProgress("earn_gold", 0);
  saveGame();

  const opponents = [];
  const usedNames = new Set();
  for (let i = 0; i < 3; i++) {
    let trainer;
    do { trainer = TRAINER_TEMPLATES[Math.floor(Math.random() * TRAINER_TEMPLATES.length)]; }
    while (usedNames.has(trainer.name));
    usedNames.add(trainer.name);

    let oppIds;
    if (trainer.theme) {
      const themes = trainer.theme.includes("+") ? trainer.theme.split("+") : [trainer.theme];
      let pool = [];
      themes.forEach(t => { if (THEMED_ROSTER[t]) pool = pool.concat(THEMED_ROSTER[t]); });
      pool = [...new Set(pool)].sort(() => Math.random() - 0.5);
      const fromTheme = [...pool];
      while (fromTheme.length < 3) {
        const extra = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).filter(id => !fromTheme.includes(id));
        fromTheme.push(extra[0]);
      }
      oppIds = fromTheme;
    } else {
      oppIds = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).slice(0, 3);
    }

    opponents.push({
      trainer: trainer,
      ids: oppIds,
      level: avgLevel + Math.floor(i * 0.5),
      alive: true
    });
  }

  tournamentState = {
    playerUids: playerUids,
    bracket: [
      { round: "semi", match: 0, p1: "player", p2: 0, winner: null, loser: null, done: false },
      { round: "semi", match: 1, p1: 1, p2: 2, winner: null, loser: null, done: false },
      { round: "final", match: 0, p1: null, p2: null, winner: null, loser: null, done: false },
      { round: "third", match: 0, p1: null, p2: null, winner: null, loser: null, done: false }
    ],
    opponents: opponents,
    playerAlive: true,
    entryFee: entryFee
  };

  showTourneyBracket();
}

function showTourneyBracket() {
  const container = document.getElementById("bracket-view");
  if (!container) return;
  container.innerHTML = "";

  const roundLabel = tournamentState.bracket.every(m => m.done) ? "Tournament Results" :
    tournamentState.bracket[0].done ? "Finals & 3rd Place" : "Semi-Finals";

  document.getElementById("tourney-title").textContent = roundLabel;
  show("screen-tournament-bracket");

  let html = `<div class="bracket-round-label">${roundLabel}</div>`;

  tournamentState.bracket.forEach((match, idx) => {
    if (match.round === "third" && !tournamentState.bracket[1].done) return;

    const isPlayerMatch = match.p1 === "player" || match.p2 === "player";
    const canPlay = !match.done && isPlayerMatch && tournamentState.playerAlive;

    html += `<div class="bracket-match ${canPlay ? 'live' : ''} ${match.done ? 'completed' : ''}">`;

    const slots = [
      { id: match.p1, winner: match.winner, loser: match.loser },
      { id: match.p2, winner: match.winner, loser: match.loser }
    ];

    slots.forEach((slot, si) => {
      const isPlayer = slot.id === "player";
      const isOpp = typeof slot.id === "number";

      let name = "", won = false, lost = false;
      if (isPlayer) {
        name = "You";
        won = match.winner === "player";
        lost = match.loser === "player";
      } else if (isOpp && tournamentState.opponents[slot.id]) {
        name = tournamentState.opponents[slot.id].trainer.name;
        won = match.winner === slot.id;
        lost = match.loser === slot.id;
      } else if (slot.id === null) {
        name = "TBD";
      }

      const cls = won ? "winner" : lost ? "loser" : "";
      html += `<div class="bracket-team ${cls}"><span class="name">${name}</span>${won ? '<span class="score">✓</span>' : lost ? '<span class="score">✗</span>' : ''}</div>`;
      if (si === 0) html += `<div class="bracket-vs">VS</div>`;
    });

    if (canPlay) {
      html += `<button class="btn gold" id="btn-play-tourney-${idx}" style="margin-top:8px;">FIGHT</button>`;
    } else if (match.done && match.round === "final") {
      html += `<div style="text-align:center; font-size:13px; color:var(--gold); margin-top:6px;">Champion: ${match.winner === "player" ? "You!" : tournamentState.opponents[match.winner]?.trainer.name}</div>`;
    }

    html += `</div>`;
  });

  container.innerHTML = html;

  tournamentState.bracket.forEach((match, idx) => {
    const btn = document.getElementById("btn-play-tourney-" + idx);
    if (btn) {
      btn.onclick = () => startTourneyMatch(idx);
    }
  });

  updateTourneyDashboard();
}

function startTourneyMatch(matchIdx) {
  const match = tournamentState.bracket[matchIdx];
  if (!match || match.done) return;

  let playerUids, aiOpp;
  if (match.p1 === "player") {
    playerUids = tournamentState.playerUids;
    aiOpp = tournamentState.opponents[match.p2];
  } else if (match.p2 === "player") {
    playerUids = tournamentState.playerUids;
    aiOpp = tournamentState.opponents[match.p1];
  } else {
    match.done = true;
    match.winner = match.p1;
    match.loser = match.p2;
    showTourneyBracket();
    return;
  }

  // Reset battle state for next tournament match
  awaitingInput = true;
  setWeather("none", 0);
  const apEl = document.getElementById("action-panel");
  if (apEl) apEl.innerHTML = "";
  const blEl = document.getElementById("battle-log");
  if (blEl) blEl.textContent = "";

  const pData = playerUids.map(uid => {
    const m = getMonData(uid);
    m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
    m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
    m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
    m._baseSpd = m.spd; m._baseDef = m.def;
    triggerPassiveOnInit(m);
    return m;
  });

  const foe = aiOpp.ids.map(id => instantiateFoe(id, aiOpp.level));

  battle = {
    player: pData,
    foe: foe,
    pIndex: 0, fIndex: 0,
    opponentName: aiOpp.trainer.name,
    personality: aiOpp.trainer.personality,
    over: false,
    tournament: { matchIdx: matchIdx },
    pCombo: [], fCombo: []
  };

  const weatherKeys = Object.keys(WEATHER_CONDITIONS).filter(k => k !== "none");
  if (Math.random() < 0.30) {
    const wType = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    setWeather(wType, 3 + Math.floor(Math.random() * 3));
  } else {
    setWeather("none", 0);
  }

  document.getElementById("prep-player-slots").innerHTML = "";
  document.getElementById("prep-foe-slots").innerHTML = "";
  battle.player.forEach((m, i) => {
    const passiveHtml = m.passive ? `<span class="passive-prep" title="${m.passive}: ${m.passiveDesc || ''}">${m.passiveIcon}</span>` : '';
    document.getElementById("prep-player-slots").insertAdjacentHTML("beforeend",
      `<div class="prep-slot ${i === 0 ? 'lead' : ''}"><div class="n">${i + 1}</div><div class="nm">${m.name} ${passiveHtml}</div></div>`);
  });
  battle.foe.forEach((m, i) => document.getElementById("prep-foe-slots").insertAdjacentHTML("beforeend", `<div class="prep-slot ${i === 0 ? 'lead' : ''} hidden"><div class="n">${i + 1}</div><div class="nm">???</div></div>`));
  document.getElementById("prep-foe-name").textContent = aiOpp.trainer.name;

  document.getElementById("prep-clock").textContent = "00:03";
  clearInterval(prepTimerHandle);
  prepTimerHandle = setInterval(() => {
    const t = parseInt(document.getElementById("prep-clock").textContent.slice(-1));
    if (t <= 1) { clearInterval(prepTimerHandle); revealFoeAndBattle(); return; }
    document.getElementById("prep-clock").textContent = "00:0" + (t - 1);
  }, 1000);
  document.getElementById("btn-skip-prep").onclick = () => { clearInterval(prepTimerHandle); revealFoeAndBattle(); };

  show("screen-prep");
}

function spawnParticleBurst(element, type, isCrit) {
  const arena = document.getElementById("arena");
  if (!arena || !element) return;
  const burst = document.createElement("div");
  burst.className = "particle-burst " + type + (isCrit ? " crit" : "");
  const rect = element.getBoundingClientRect();
  const arenaRect = arena.getBoundingClientRect();
  burst.style.left = (rect.left - arenaRect.left + rect.width / 2 - 50) + "px";
  burst.style.top = (rect.top - arenaRect.top + rect.height / 2 - 50) + "px";
  const count = isCrit ? 12 : 8;
  for (let i = 0; i < count; i++) {
    const part = document.createElement("div");
    part.className = "part";
    const angle = (360 / count) * i + Math.random() * 30;
    const dist = 30 + Math.random() * 50;
    const rad = angle * Math.PI / 180;
    part.style.setProperty("--px", Math.cos(rad) * dist + "px");
    part.style.setProperty("--py", Math.sin(rad) * dist + "px");
    part.style.animationDelay = (Math.random() * 0.1) + "s";
    burst.appendChild(part);
  }
  arena.appendChild(burst);
  setTimeout(function () { if (burst.parentNode) burst.remove(); }, 800);
}

/* ============================= BATTLE SYSTEM (ASYNC RESOLUTION) ============================= */
let battle = null;
let awaitingInput = true;

const delay = ms => new Promise(res => setTimeout(res, ms));

function instantiateFoe(baseId, lvl) {
  const def = ROSTER_DEF.find(r => r[0] === baseId);
  const scale = 1 + (lvl - 1) * 0.05;
  const itemKey = def[7];
  const m = {
    uid: "foe_" + Math.random(), baseId: def[0], name: def[1], type: def[2], level: lvl, item: itemKey,
    baseHp: Math.floor(def[3] * scale), atk: Math.floor(def[4] * scale),
    def: Math.floor(def[5] * scale), spd: Math.floor(def[6] * scale),
    moves: [BASH, MOVES[def[2]], move(def[8], def[2], 80, 85)], shape: def[9]
  };
  m._baseSpd = m.spd; m._baseDef = m.def;
  m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
  m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
  m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
  triggerPassiveOnInit(m);
  return m;
}

let prepTimerHandle = null;
function runPrepTimer() {
  awaitingInput = true;
  let t = 4; document.getElementById("prep-clock").textContent = "00:04"; clearInterval(prepTimerHandle);
  prepTimerHandle = setInterval(() => { t--; if (t <= 0) { clearInterval(prepTimerHandle); revealFoeAndBattle(); return; } document.getElementById("prep-clock").textContent = "00:0" + t; }, 1000);
}
if (document.getElementById("btn-skip-prep")) document.getElementById("btn-skip-prep").onclick = () => { clearInterval(prepTimerHandle); revealFoeAndBattle(); };

function revealFoeAndBattle() {
  document.querySelectorAll("#prep-foe-slots .prep-slot").forEach((el, i) => { el.classList.remove("hidden"); el.querySelector(".nm").textContent = battle.foe[i].name; });
  setTimeout(() => {
    show("screen-battle");
    const p = activePlayer(), f = activeFoe();
    let log = `Tier ${save.tierLevel} match against ${battle.opponentName} has begun!`;
    if (p.passive) log += `<br>Your ${p.name}'s ${p.passiveIcon} ${p.passive} is active.`;
    if (f.passive) log += `<br>Foe ${f.name}'s ${f.passiveIcon} ${f.passive} is active.`;
    document.getElementById("battle-log").innerHTML = log;
    renderBattle(true);
  }, 500);
}

function activePlayer() { return battle.player[battle.pIndex]; }
function activeFoe() { return battle.foe[battle.fIndex]; }

function renderBattle(fullRebuild) {
  const p = activePlayer(), f = activeFoe();
  document.getElementById("ally-name").textContent = p.name; document.getElementById("ally-level").textContent = "Lv." + p.level;
  document.getElementById("foe-name").textContent = f.name; document.getElementById("foe-level").textContent = "Lv." + f.level;
  document.getElementById("ally-hp").style.width = Math.max(0, (p.hp / p.baseHp * 100)) + "%";
  document.getElementById("foe-hp").style.width = Math.max(0, (f.hp / f.baseHp * 100)) + "%";

  let wEl = document.getElementById("weather-display");
  if (!wEl) {
    const wb = document.querySelector(".weather-bar");
    wEl = wb || (() => {
      const e = document.createElement("div"); e.id = "weather-display";
      e.className = "weather-bar";
      const arena = document.getElementById("arena");
      if (arena) arena.prepend(e);
      return e;
    })();
  }

  if (weather && weather.type !== "none") {
    const w = WEATHER_CONDITIONS[weather.type];
    wEl.innerHTML = `<span class="weather-icon">${w.icon}</span><span class="weather-name">${w.name}</span><span class="weather-turns">${weather.turnsLeft}t</span>`;
    wEl.style.display = "flex";
    wEl.style.color = w.color;
    wEl.style.borderBottom = `1px solid ${w.color}33`;
  } else {
    wEl.style.display = "none";
  }

  updateWeatherOverlay();

  const pStatusEl = document.getElementById("ally-status");
  const fStatusEl = document.getElementById("foe-status");
  if (pStatusEl) pStatusEl.innerHTML = (p.statusEffects || []).map(k => `<span style="color:${STATUS_EFFECTS[k].color}">${STATUS_EFFECTS[k].icon}</span>`).join(" ") + (p.passive ? `<span title="${p.passive}" style="opacity:0.6;font-size:11px;margin-left:4px;">${p.passiveIcon}</span>` : "");
  if (fStatusEl) fStatusEl.innerHTML = (f.statusEffects || []).map(k => `<span style="color:${STATUS_EFFECTS[k].color}">${STATUS_EFFECTS[k].icon}</span>`).join(" ") + (f.passive ? `<span title="${f.passive}" style="opacity:0.6;font-size:11px;margin-left:4px;">${f.passiveIcon}</span>` : "");

  const pm = document.getElementById("player-mon"); pm.className = "mon sprite-loaded " + p.shape + " t-" + p.type + (p.evolved ? " evolved" : "");
  const fm = document.getElementById("foe-mon"); fm.className = "mon sprite-loaded " + f.shape + " t-" + f.type + (f.evolved ? " evolved" : "");
  const pBaseId = p.baseId || (save.mons.find(m => m.uid === p.uid) ? save.mons.find(m => m.uid === p.uid).baseId : null);
  const fBaseId = f.baseId;
  if (pBaseId) setCreatureSprite(pm, pBaseId, p.evolved);
  if (fBaseId) setCreatureSprite(fm, fBaseId, f.evolved);
  pm.classList.toggle("low-hp", !p.fainted && p.hp / p.baseHp < 0.25);
  fm.classList.toggle("low-hp", !f.fainted && f.hp / f.baseHp < 0.25);
  (p.statusEffects || []).forEach(k => pm.classList.add(k === "freeze" ? "frozen" : k));
  (f.statusEffects || []).forEach(k => fm.classList.add(k === "freeze" ? "frozen" : k));

  if (fullRebuild) {
    document.getElementById("ally-orb").className = "orb sm t-" + p.type; document.getElementById("foe-orb").className = "orb sm t-" + f.type;
    buildActionPanel();
  }
}

function buildActionPanel() {
  const panel = document.getElementById("action-panel"); panel.className = "moves-grid"; panel.innerHTML = "";
  activePlayer().moves.forEach(mv => {
    const btn = document.createElement("button"); btn.className = "movebtn";
    btn.innerHTML = `<span class="mv-nm">${mv.name}</span><span class="mv-sub">${mv.type.toUpperCase()} · PWR ${mv.power}</span>`;
    btn.onclick = () => playerAct({ kind: "move", move: mv }); panel.appendChild(btn);
  });
  const swBtn = document.createElement("button"); swBtn.className = "movebtn switchbtn";
  swBtn.innerHTML = `<span class="mv-nm">Switch Out</span><span class="mv-sub">Change active</span>`;
  swBtn.onclick = () => openSwitchPanel(false); panel.appendChild(swBtn);

  const bagBtn = document.createElement("button"); bagBtn.className = "movebtn";
  bagBtn.innerHTML = `<span class="mv-nm">🎒 Bag</span><span class="mv-sub">Use item</span>`;
  bagBtn.onclick = () => openBattleBag(); panel.appendChild(bagBtn);
}

function openBattleBag() {
  const panel = document.getElementById("action-panel"); panel.className = "switch-panel"; panel.innerHTML = "";
  const available = Object.keys(save.bag).filter(k => BATTLE_ITEMS[k] && save.bag[k] > 0);
  if (available.length === 0) {
    panel.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-dim);font-size:13px;">No consumable items available.</div>`;
    const cancel = document.createElement("button"); cancel.className = "btn ghost"; cancel.textContent = "Back";
    cancel.onclick = () => { panel.className = "moves-grid"; buildActionPanel(); };
    panel.appendChild(cancel);
    return;
  }
  available.forEach(itemKey => {
    const bi = BATTLE_ITEMS[itemKey];
    const p = activePlayer();
    const opt = document.createElement("div"); opt.className = "switch-opt";
    opt.innerHTML = `<div style="flex:1;display:flex;align-items:center;gap:8px;">
      <span style="font-size:20px;">${bi.icon}</span>
      <div><div style="font-weight:bold;font-size:14px;">${bi.name} <span style="font-size:10px;color:var(--text-dim);">x${save.bag[itemKey]}</span></div>
      <div style="font-size:11px;color:var(--text-dim);">${bi.desc}</div></div>
    </div>`;
    opt.onclick = () => playerAct({ kind: "item", itemKey: itemKey });
    panel.appendChild(opt);
  });
  const cancel = document.createElement("button"); cancel.className = "btn ghost"; cancel.textContent = "Cancel";
  cancel.onclick = () => { panel.className = "moves-grid"; buildActionPanel(); };
  panel.appendChild(cancel);
}

function openSwitchPanel(forced) {
  const panel = document.getElementById("action-panel"); panel.className = "switch-panel"; panel.innerHTML = "";
  battle.player.forEach((m, i) => {
    const dis = m.fainted || i === battle.pIndex;
    const opt = document.createElement("div"); opt.className = "switch-opt" + (dis ? " disabled" : "");
    opt.innerHTML = `<div class="orb sm t-${m.type}"><div class="glyph"></div></div><div class="mini-hp"><div class="nmrow" style="font-size:12px;"><span>${m.name}</span><span>${m.fainted ? "Fainted" : Math.round(m.hp) + "/" + m.baseHp}</span></div><div class="hpbar-track"><div class="hpbar-fill" style="width:${Math.max(0, m.hp / m.baseHp * 100)}%"></div></div></div>`;
    if (!dis) opt.onclick = () => forced ? forcedSwitchTo(i) : playerAct({ kind: "switch", index: i });
    panel.appendChild(opt);
  });
  if (!forced) {
    const cancel = document.createElement("button"); cancel.className = "btn ghost"; cancel.textContent = "Cancel";
    cancel.onclick = () => { panel.className = "moves-grid"; buildActionPanel(); }; panel.appendChild(cancel);
  }
}

function aiPickAction() {
  const f = activeFoe(), p = activePlayer();
  const personality = AI_PERSONALITIES[battle.personality] || AI_PERSONALITIES.balanced;
  const aliveFoes = battle.foe.filter(m => !m.fainted);

  /* --- THREAT ASSESSMENT --- */
  const bestPlyrMove = p.moves.reduce((best, mv) => {
    const s = mv.power * typeMultiplier(mv.type, f.type);
    return s > (best?.score || -1) ? { mv, score: s } : best;
  }, null);
  const aiAtDisadvantage = bestPlyrMove && bestPlyrMove.score > 80;

  /* --- COMBO PREDICTION SYSTEM --- */
  let comboThreat = false, comboResistType = null, comboScore = 0;
  if (battle.pCombo && battle.pCombo.length >= 1) {
    const seq = battle.pCombo;
    for (const key in ELEMENTAL_COMBOS) {
      const parts = key.split("_");
      if (parts.length < seq.length) continue;
      if (parts.every((t, i) => t === seq[i])) {
        if (parts.length > seq.length) {
          const nextType = parts[seq.length];
          const currentMult = typeMultiplier(nextType, f.type);
          const worstMult = aliveFoes.reduce((min, m) => Math.min(min, typeMultiplier(nextType, m.type)), 2);
          if (currentMult > 1 || worstMult < 1) {
            comboThreat = true;
            comboResistType = nextType;
            comboScore = Math.max(comboScore, ELEMENTAL_COMBOS[key].mult || 1);
          }
        } else {
          const combo = ELEMENTAL_COMBOS[key];
          if (combo) comboScore = Math.max(comboScore, combo.mult || 1);
        }
      }
    }
  }

  /* --- STATUS-AWARE SWITCH CHECK --- */
  const hasHarmfulStatus = f.statusEffects && f.statusEffects.length > 0 &&
    (f.statusEffects.includes("burn") || f.statusEffects.includes("poison")) &&
    (f.hp / f.baseHp) <= 0.5;

  /* --- SWITCH DECISION --- */
  if (aliveFoes.length > 1) {
    let shouldSwitch = false;
    let switchPriority = 0;

    // Combo threat evasion — more aggressive if combo is powerful
    const comboThreatThreshold = comboScore > 1.8 ? 0.65 : 0.5;
    if (comboThreat && (f.hp / f.baseHp) <= comboThreatThreshold && personality.dmgWeight >= 1.0) {
      shouldSwitch = true;
      switchPriority = 2;
    }

    // Harmful status — defensive/tactician personalities more likely to switch
    if (hasHarmfulStatus && personality.switchChance > 0.2 && Math.random() < personality.switchChance) {
      shouldSwitch = true;
      switchPriority = Math.max(switchPriority, 1.5);
    }

    // Standard disadvantage check
    if (aiAtDisadvantage && (f.hp / f.baseHp) <= personality.switchBelowHpPct && Math.random() < personality.switchChance) {
      shouldSwitch = true;
      switchPriority = Math.max(switchPriority, 1);
    }

    // Reckless personality ignores combo threats
    if (personality.dmgWeight >= 1.5 && switchPriority < 2) {
      shouldSwitch = false;
    }

    if (shouldSwitch) {
      let bestSwitch = null, bestScore = -1;
      aliveFoes.forEach(candidate => {
        if (candidate === f) return;
        let totalDmg = 0;
        p.moves.forEach(mv => { totalDmg += mv.power * typeMultiplier(mv.type, candidate.type); });
        const avgMult = totalDmg / (p.moves.length * 100);
        let resistScore = 1 - avgMult;

        // Bonus for combo-resistant switch
        if (comboResistType && typeMultiplier(comboResistType, candidate.type) < 1) {
          resistScore += 0.3;
        }

        // Passive synergy bonus — switch to a mon whose passive counters player
        const candPassive = getPassive(candidate.type);
        if (candPassive) {
          if (candPassive.name === "Evasion" && p.atk > p.def) resistScore += 0.1;
          if (candPassive.name === "Thorns" && p.atk > p.spd) resistScore += 0.1;
          if (candPassive.name === "Fortify") resistScore += 0.05;
        }

        // HP bonus — prefer healthier mons
        const hpRatio = candidate.hp / candidate.baseHp;
        resistScore += hpRatio * 0.1;

        if (resistScore > bestScore) { bestScore = resistScore; bestSwitch = candidate; }
      });
      if (bestSwitch) return { kind: "switch", index: battle.foe.indexOf(bestSwitch) };
    }
  }

  /* --- MOVE SELECTION WITH COMBO-BUILDING & FINISHING PRIORITY --- */
  let best = null, bScore = -1;
  const playerLowHp = (p.hp / p.baseHp) <= 0.3;

  f.moves.forEach(mv => {
    const mult = typeMultiplier(mv.type, p.type);
    const weatherMult = getWeatherMult(mv.type, p.type);
    const accFactor = Math.pow(mv.acc / 100, personality.accWeight);
    const stabBonus = mv.type === f.type ? personality.stabBonus : 1;
    const effPower = mv.power * stabBonus;
    const typeWeight = mult > 1 ? 1.3 : mult < 1 ? 0.7 : 1;

    // Combo-building: AI actively tries to build its own combos
    let comboBuildBonus = 1;
    if (battle.fCombo && battle.fCombo.length >= 1) {
      const seq = battle.fCombo;
      for (const key in ELEMENTAL_COMBOS) {
        const parts = key.split("_");
        if (parts.length > seq.length + 1) continue;
        if (parts.slice(0, seq.length).every((t, i) => t === seq[i]) && parts[seq.length] === mv.type) {
          comboBuildBonus = 1.25;
          break;
        }
      }
      // Continue existing chain bonus
      if (mv.type === seq[seq.length - 1]) comboBuildBonus = Math.max(comboBuildBonus, 1.15);
    }

    // Finishing move bonus
    const finishBonus = playerLowHp && mult > 0 ? 1.2 : 1;

    // Status application bonus — prefer moves that can apply status
    const statusBonus = (!p.statusEffects || p.statusEffects.length === 0) &&
      { ember: "burn", aqua: "freeze", volt: "burn", gale: "freeze" }[mv.type] ? 1.1 : 1;

    const s = effPower * mult * weatherMult * typeWeight * accFactor * personality.dmgWeight * comboBuildBonus * finishBonus * statusBonus;
    if (s > bScore) { bScore = s; best = mv; }
  });

  return { kind: "move", move: best || f.moves[0] };
}

function playerAct(action) {
  if (!awaitingInput || battle.over) return;
  awaitingInput = false;
  document.getElementById("action-panel").innerHTML = "";
  if (action.kind === "item") {
    const p = activePlayer();
    const bi = BATTLE_ITEMS[action.itemKey];
    if (!bi || !save.bag[action.itemKey] || save.bag[action.itemKey] <= 0) {
      awaitingInput = true; buildActionPanel();
      return;
    }
    save.bag[action.itemKey]--;
    if (save.bag[action.itemKey] <= 0) delete save.bag[action.itemKey];
    saveGame();

    let itemLog = "";
    if (action.itemKey === "health_potion") {
      const heal = Math.round(p.baseHp * 0.4);
      p.hp = Math.min(p.baseHp, p.hp + heal);
      itemLog = `<b>${p.name}</b> used ${bi.icon} ${bi.name} and restored <b>${heal}</b> HP!`;
      playHealSound();
    } else if (action.itemKey === "full_restore") {
      p.hp = p.baseHp;
      cureStatus(p);
      const pmEl = document.getElementById("player-mon");
      if (pmEl) { pmEl.classList.remove("cured", "status-applied"); void pmEl.offsetWidth; pmEl.classList.add("cured"); }
      itemLog = `<b>${p.name}</b> used ${bi.icon} ${bi.name} and fully recovered!`;
      playHealSound();
    } else if (action.itemKey === "atk_boost") {
      p.battleAtkBoost = (p.battleAtkBoost || 1) * 1.3;
      itemLog = `<b>${p.name}</b> used ${bi.icon} ${bi.name} — ATK boosted!`;
      playHealSound();
    } else if (action.itemKey === "def_boost") {
      p.battleDefBoost = (p.battleDefBoost || 1) * 1.3;
      itemLog = `<b>${p.name}</b> used ${bi.icon} ${bi.name} — DEF boosted!`;
      playHealSound();
    } else if (action.itemKey === "spd_boost") {
      p.battleSpdBoost = (p.battleSpdBoost || 1) * 1.3;
      itemLog = `<b>${p.name}</b> used ${bi.icon} ${bi.name} — SPD boosted!`;
      playHealSound();
    }

    const pmEl2 = document.getElementById("player-mon");
    if (pmEl2) {
      pmEl2.classList.remove("item-activate"); void pmEl2.offsetWidth;
      pmEl2.classList.add("item-activate");
    }

    const logEl = document.getElementById("battle-log");
    logEl.innerHTML += "<br>" + itemLog;
    logEl.scrollTop = logEl.scrollHeight;

    renderBattle(false);
    const aiAct = aiPickAction();
    resolveTurn({ kind: "item_used" }, aiAct);
    return;
  }

  const aiAct = aiPickAction();
  resolveTurn(action, aiAct);
}

async function resolveTurn(pAct, aiAct) {
  const logLines = [];
  let pActs = pAct.kind !== "item_used", aiActs = true;

  const updateLog = () => {
    const logEl = document.getElementById("battle-log");
    logEl.innerHTML = logLines.join("<br>");
    logEl.scrollTop = logEl.scrollHeight;
    logEl.classList.remove("new-entry"); void logEl.offsetWidth; logEl.classList.add("new-entry");
  };

  if (pAct.kind === "switch") {
    battle.pIndex = pAct.index;
    const pm = document.getElementById("player-mon");
    if (pm) { pm.classList.remove("switch-in"); void pm.offsetWidth; pm.classList.add("switch-in"); }
    const switchedP = activePlayer();
    logLines.push(`You send out <b>${switchedP.name}</b>!`);

    // Tide Healer perk: heal 8% HP on switch-in
    if (switchedP.uid && typeof hasTalentPerk === "function" && hasTalentPerk(switchedP.uid, "tide")) {
      const healAmt = Math.max(1, Math.floor(switchedP.baseHp * 0.08));
      switchedP.hp = Math.min(switchedP.baseHp, switchedP.hp + healAmt);
      logLines.push(`🌊 Tide Healer restores <b>${healAmt}</b> HP to ${switchedP.name}!`);
    }

    pActs = false;
    updateLog();
    await delay(1000);
  }

  if (aiAct.kind === "switch") {
    battle.fIndex = aiAct.index;
    const fm = document.getElementById("foe-mon");
    if (fm) { fm.classList.remove("switch-in"); void fm.offsetWidth; fm.classList.add("switch-in"); }
    logLines.push(`${battle.opponentName} sends out <b>${activeFoe().name}</b>!`);
    aiActs = false;
    updateLog();
    await delay(1000);
  }

  const order = [];
  if (pActs && aiActs) order.push(...(activePlayer().spd >= activeFoe().spd ? ["p", "f"] : ["f", "p"]));
  else if (aiActs) order.push("f");
  else if (pActs) order.push("p");

  for (let i = 0; i < order.length; i++) {
    if (battle.over) break;
    const side = order[i];
    const atk = side === "p" ? activePlayer() : activeFoe();
    const def = side === "p" ? activeFoe() : activePlayer();

    if (atk.fainted || def.fainted) continue;

    if (triggerPassiveOnTurnStart(atk, logLines)) renderBattle(false);

    if (atk.statusSkipTurns > 0) {
      logLines.push(`${atk.name} is frozen solid and can't move!`);
      atk.statusSkipTurns--;
      if (atk.statusSkipTurns <= 0) cureStatus(atk);
      renderBattle(false);
      updateLog();
      if (i < order.length - 1) await delay(1800);
      continue;
    }

    if (atk.statusEffects && atk.statusEffects.includes("burn") && !atk.fainted) {
      const tick = resolveStatusTick(atk);
      if (tick && tick !== "skip") {
        logLines.push(`${atk.name} took ${tick} burn damage.`);
        const atkEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
        if (atkEl) {
          const hf = document.createElement("div");
          hf.className = "dmg-float self-hit"; hf.textContent = "-" + tick;
          const arena = document.getElementById("arena");
          if (arena) {
            const tRect = atkEl.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
            hf.style.left = (tRect.left - aRect.left + tRect.width / 2 - 15) + "px";
            hf.style.top = (tRect.top - aRect.top - 5) + "px";
            arena.appendChild(hf);
            setTimeout(() => hf.remove(), 1000);
          }
        }
        if (atk.hp <= 0) {
          atk.fainted = true;
          logLines.push(`<b>${atk.name} fainted from burn!</b>`);
          renderBattle(false);
          updateLog();
          break;
        }
      }
    }

    const mv = side === "p" ? pAct.move : aiAct.move;

    if (triggerPassiveOnDefend(def)) {
      const dp = getPassive(def.type);
      logLines.push(`${def.name} evaded the attack with ${dp.icon} ${dp.name}!`);
      updateLog();
      if (i < order.length - 1) await delay(1800);
      continue;
    }

    if (mv.type !== "neutral" && Math.random() * 100 > mv.acc) {
      logLines.push(`${atk.name} used ${mv.name} but missed!`);
      updateLog();
      if (i < order.length - 1) await delay(1800);
      continue;
    }

    const mult = typeMultiplier(mv.type, def.type);
    const weatherMult = getWeatherMult(mv.type, def.type);
    if (mult === 0) {
      logLines.push(`${atk.name}'s ${mv.name} had no effect on ${def.name}.`);
      updateLog();
      if (i < order.length - 1) await delay(1800);
      continue;
    }

    const isCrit = Math.random() < 0.08;
    const atkMult = (atk.statusAtkMult || 1);
    let raw = (atk.atk * atkMult * (atk.battleAtkBoost || 1) / (def.effDef * (def.battleDefBoost || 1))) * mv.power * 0.5 * mult * weatherMult * (0.85 + Math.random() * 0.15);
    if (isCrit) raw *= 1.8;
    if (def.item === "guardcharm") raw *= 0.9;
    let dmg = Math.max(1, Math.round(raw));

    if (isCrit) playCritSound(); else playHitSound(mv.type === "stone" ? 100 : mv.type === "gale" ? 200 : 150);

    const atkEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
    atkEl.classList.remove("lunge-r", "lunge-l"); void atkEl.offsetWidth; atkEl.classList.add(side === "p" ? "lunge-r" : "lunge-l");

    if (!def.itemUsed && def.item === "steadfastsash" && dmg >= def.hp) {
      dmg = def.hp - 1; def.itemUsed = true;
      const targetEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
      if (targetEl) {
        targetEl.classList.remove("item-activate"); void targetEl.offsetWidth;
        targetEl.classList.add("item-activate");
      }
      logLines.push(`${def.name} hung on using Steadfast Sash!`);
    }
    def._lastDmg = dmg;
    def.hp = Math.max(0, def.hp - dmg);

    let dmgLog = `${atk.name} used ${mv.name} for ${dmg} damage.`;
    if (isCrit) dmgLog += " <b style='color:var(--danger);'>Critical hit!</b>";
    if (mult > 1) dmgLog += " <b style='color:var(--gold)'>Super effective!</b>";
    if (weatherMult !== 1) dmgLog += weatherMult > 1 ? " <span style='color:var(--warn)'>Weather boosted!</span>" : " <span style='color:var(--text-dim)'>Weather dampened...</span>";
    logLines.push(dmgLog);

    const comboResult = checkAndApplyCombo(side, atk, def, mv, dmg, logLines, document.getElementById("arena"));
    if (comboResult.active) {
      logLines.push(`<b style="color:var(--gold)">✦ ${comboResult.icon} ${comboResult.name}!</b> <span style="color:var(--text-dim)">${comboResult.desc}</span>`);
      if (comboResult.bonusDmg > 0) {
        logLines.push(`<span style="color:var(--warn)">Combo bonus: +${comboResult.bonusDmg} extra damage!</span>`);
      }
    }
    updateComboUI();

    if (!def.statusEffects || def.statusEffects.length === 0) {
      const statusChance = { ember: 0.2, aqua: 0.2, verdant: 0, volt: 0.2, stone: 0, gale: 0 };
      const statusMap = { ember: "burn", aqua: "freeze", volt: "burn", gale: "freeze" };
      if (statusChance[mv.type] && Math.random() < statusChance[mv.type]) {
        const applied = applyStatus(def, statusMap[mv.type]);
        if (applied) {
          logLines.push(`<b>${def.name} was ${STATUS_EFFECTS[statusMap[mv.type]].icon} ${STATUS_EFFECTS[statusMap[mv.type]].name}ed!</b>`);
          const targetEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
          if (targetEl) {
            targetEl.classList.remove("status-applied"); void targetEl.offsetWidth;
            targetEl.classList.add("status-applied");
          }
        }
      }
    }

    const defEl = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
    defEl.classList.remove("hit", "recoil", "knockback-l", "knockback-r"); void defEl.offsetWidth;
    defEl.classList.add(isCrit ? "crit-hit" : "hit");
    const knockDir = side === "p" ? "knockback-r" : "knockback-l";
    defEl.classList.add("recoil", knockDir);
    spawnParticleBurst(defEl, mv.type === "neutral" ? atk.type : mv.type, isCrit);

    const arena = document.getElementById("arena");
    if (arena) {
      arena.classList.remove("shake"); void arena.offsetWidth; arena.classList.add("shake");

      const dmgFloat = document.createElement("div");
      dmgFloat.className = "dmg-float" + (isCrit ? " crit" : "");
      dmgFloat.textContent = dmg;
      const defRect = defEl.getBoundingClientRect(), arenaRect = arena.getBoundingClientRect();
      dmgFloat.style.left = (defRect.left - arenaRect.left + defRect.width / 2 - 20) + "px";
      dmgFloat.style.top = (defRect.top - arenaRect.top + 10) + "px";
      arena.appendChild(dmgFloat);
      setTimeout(() => dmgFloat.remove(), 1000);
    }

    if (triggerPassiveOnHit(def, atk, logLines)) {
      renderBattle(false);
      if (atk.fainted) break;
    }

    if (!def.fainted && def.hp > 0 && def.hp / def.baseHp <= 0.25 && def.item === "vitalberry" && !def.itemUsed) {
      def.itemUsed = true;
      const heal = Math.round(def.baseHp * 0.25);
      def.hp = Math.min(def.baseHp, def.hp + heal);
      playHealSound();
      const targetEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
      if (targetEl) {
        targetEl.classList.remove("item-activate"); void targetEl.offsetWidth;
        targetEl.classList.add("item-activate");
        const hf = document.createElement("div");
        hf.className = "dmg-float heal";
        hf.textContent = "+" + heal;
        const arena = document.getElementById("arena");
        if (arena) {
          const tRect = targetEl.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
          hf.style.left = (tRect.left - aRect.left + tRect.width / 2 - 20) + "px";
          hf.style.top = (tRect.top - aRect.top - 10) + "px";
          arena.appendChild(hf);
          setTimeout(() => hf.remove(), 1000);
        }
      }
      logLines.push(`<b>${def.name} consumed its Vital Berry and healed ${heal} HP!</b>`);
    }

    if (!def.fainted && def.hp > 0 && def.statusEffects && def.statusEffects.length > 0 && def.hp / def.baseHp <= 0.30 && def.item === "puredew" && !def.itemUsed) {
      def.itemUsed = true;
      const cured = [...def.statusEffects];
      cureStatus(def);
      const targetEl = document.getElementById(side === "p" ? "player-mon" : "foe-mon");
      if (targetEl) {
        targetEl.classList.remove("cured", "status-applied"); void targetEl.offsetWidth;
        targetEl.classList.add("cured");
      }
      logLines.push(`<b>${def.name} consumed Pure Dew and cured ${cured.map(k => STATUS_EFFECTS[k].icon).join("")}!</b>`);
    }

    if (!def.fainted && def.hp > 0 && def.statusEffects && def.statusEffects.includes("poison")) {
      const tick = resolveStatusTick(def);
      if (tick && tick !== "skip") {
        logLines.push(`${def.name} took ${tick} poison damage.`);
        const defEl2 = document.getElementById(side === "p" ? "foe-mon" : "player-mon");
        if (defEl2) {
          const hf = document.createElement("div");
          hf.className = "dmg-float self-hit"; hf.textContent = "-" + tick;
          const arena = document.getElementById("arena");
          if (arena) {
            const tRect = defEl2.getBoundingClientRect(), aRect = arena.getBoundingClientRect();
            hf.style.left = (tRect.left - aRect.left + tRect.width / 2 - 15) + "px";
            hf.style.top = (tRect.top - aRect.top - 5) + "px";
            arena.appendChild(hf);
            setTimeout(() => hf.remove(), 1000);
          }
        }
        if (def.hp <= 0) { def.fainted = true; logLines.push(`<b>${def.name} fainted from poison!</b>`); }
      }
    }

    if (def.hp <= 0) {
      def.fainted = true;
      logLines.push(`<b>${def.name} fainted!</b>`);
      defEl.classList.add("faint"); setTimeout(() => defEl.classList.remove("faint"), 500);
    }

    renderBattle(false);
    updateLog();

    if (activePlayer().fainted || activeFoe().fainted) break;
    if (i < order.length - 1) await delay(1800);
  }

  renderBattle(false);
  advanceWeather();
  if (weather.type !== "none") {
    const w = WEATHER_CONDITIONS[weather.type];
    logLines.push(`<span style="color:${w.color}">${w.icon} ${w.name} (${weather.turnsLeft}t)</span>`);
    updateLog();
  }

  await delay(1200);

  if (battle.player.every(m => m.fainted)) return endBattle(false);
  if (battle.foe.every(m => m.fainted)) return endBattle(true);

  if (activeFoe().fainted) {
    battle.fIndex = battle.foe.findIndex(m => !m.fainted);
    const fm = document.getElementById("foe-mon");
    if (fm) { fm.classList.remove("switch-in"); void fm.offsetWidth; fm.classList.add("switch-in"); }
    logLines.push(`${battle.opponentName} sends out <b>${activeFoe().name}</b>!`);
    updateLog();
    renderBattle(true);
  }
  if (activePlayer().fainted) {
    renderBattle(true);
    document.getElementById("battle-log").innerHTML = "<b>Choose your next rift-form!</b>";
    return openSwitchPanel(true);
  }

  awaitingInput = true;
  buildActionPanel();
}

function forcedSwitchTo(i) {
  battle.pIndex = i;
  const pm = document.getElementById("player-mon");
  if (pm) { pm.classList.remove("switch-in"); void pm.offsetWidth; pm.classList.add("switch-in"); }
  renderBattle(true);
  const p = activePlayer();
  document.getElementById("battle-log").innerHTML = `You send out <b>${p.name}</b>!`;

  // Tide Healer perk: heal 8% HP on switch-in
  if (p.uid && typeof hasTalentPerk === "function" && hasTalentPerk(p.uid, "tide")) {
    const healAmt = Math.max(1, Math.floor(p.baseHp * 0.08));
    p.hp = Math.min(p.baseHp, p.hp + healAmt);
    document.getElementById("battle-log").innerHTML += `<br>🌊 Tide Healer restores <b>${healAmt}</b> HP to ${p.name}!`;
    renderBattle(false);
  }

  awaitingInput = true;
  buildActionPanel();
}

function startPrepWithData(playerUids, oppIds, aiLvl, trainer, oppRank) {
  const pData = playerUids.map(uid => getMonData(uid));

  battle = {
    player: pData.map(m => {
      m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
      m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
      m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
      m._baseSpd = m.spd; m._baseDef = m.def;
      triggerPassiveOnInit(m);
      return m;
    }),
    foe: oppIds.map(id => instantiateFoe(id, aiLvl)),
    pIndex: 0, fIndex: 0,
    opponentName: trainer.name,
    personality: trainer.personality,
    over: false,
    pCombo: [], fCombo: []
  };

  const weatherKeys = Object.keys(WEATHER_CONDITIONS).filter(k => k !== "none");
  if (Math.random() < 0.30) {
    const wType = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    setWeather(wType, 3 + Math.floor(Math.random() * 3));
  } else {
    setWeather("none", 0);
  }

  document.getElementById("prep-player-slots").innerHTML = "";
  document.getElementById("prep-foe-slots").innerHTML = "";
  battle.player.forEach((m, i) => {
    const passiveHtml = m.passive ? `<span class="passive-prep" title="${m.passive}: ${m.passiveDesc || ''}">${m.passiveIcon}</span>` : '';
    document.getElementById("prep-player-slots").insertAdjacentHTML("beforeend",
      `<div class="prep-slot ${i === 0 ? 'lead' : ''}"><div class="n">${i + 1}</div><div class="nm">${m.name} ${passiveHtml}</div></div>`);
  });
  battle.foe.forEach((m, i) => document.getElementById("prep-foe-slots").insertAdjacentHTML("beforeend", `<div class="prep-slot ${i === 0 ? 'lead' : ''} hidden"><div class="n">${i + 1}</div><div class="nm">???</div></div>`));
  document.getElementById("prep-foe-name").textContent = trainer.name + (oppRank ? ` (${oppRank})` : "");
  show("screen-prep");
  runPrepTimer();
}

function endBattle(won) {
  battle.over = true;
  if (won) playVictorySound(); else playDefeatSound();

  if (battle.survival) {
    if (typeof handleSurvivalWaveEnd === "function") handleSurvivalWaveEnd(won);
    return;
  }
  if (battle.dungeon) {
    if (typeof handleDungeonFloorEnd === "function") handleDungeonFloorEnd(won);
    return;
  }
  if (battle.tournament) {
    handleTourneyMatchEnd(won);
    return;
  }

  document.getElementById("end-banner").textContent = won ? "VICTORY" : "DEFEAT";
  document.getElementById("end-banner").className = "end-banner " + (won ? "win" : "lose");

  const guildMults = typeof getGuildRewardMultipliers === "function" ? getGuildRewardMultipliers() : { gold: 1, xp: 1 };

  const vpChange = won ? 30 : -15;
  let xpReward = won ? 200 : 50;
  let goldReward = won ? 85 : 20;
  const tierXpReward = won ? 60 : 10;

  if (guildMults.gold > 1) goldReward = Math.round(goldReward * guildMults.gold);
  if (guildMults.xp > 1) xpReward = Math.round(xpReward * guildMults.xp);

  const format = typeof window.formatNum === "function" ? window.formatNum : (n => n);
  const trackQuest = typeof window.trackQuestProgress === "function" ? window.trackQuestProgress : (() => { });
  const addTier = typeof window.addTierXp === "function" ? window.addTierXp : (() => false);

  save.vp = Math.max(0, save.vp + vpChange);
  if (won) trackQuest("win_battles", 1);
  if (won) awardAllMasteryPoints(1);
  trackQuest("earn_gold", goldReward);
  save.gold += goldReward;
  save.playerXp += xpReward;
  if (won) {
    save.wins++;
    if (!save._currentStreak) save._currentStreak = 0;
    save._currentStreak++;
    if (save._currentStreak > save.stats.bestStreak) save.stats.bestStreak = save._currentStreak;
    // Guild XP from battle win
    if (typeof addGuildXp === "function") addGuildXp(30);
    if (typeof addGuildChat === "function" && save.guild) addGuildChat("⚔️", `A ranked battle was won against ${battle.opponentName}!`);
  } else {
    save.losses++;
    save._currentStreak = 0;
  }

  save.matchHistory.unshift({
    date: Date.now(), opponent: battle.opponentName,
    won: won, vpChange: vpChange, vp: save.vp
  });
  if (save.matchHistory.length > 20) save.matchHistory.length = 20;

  let playerLvlUp = false;
  while (save.playerXp >= getPlayerMaxXp(save.playerLevel)) {
    save.playerXp -= getPlayerMaxXp(save.playerLevel); save.playerLevel++; save.gems += 50; playerLvlUp = true;
  }

  const tierLvlUp = addTier(tierXpReward);

  battle.player.forEach(m => {
    let mSave = save.mons.find(x => x.uid === m.uid);
    if (mSave) {
      mSave.xp += xpReward;
      while (mSave.xp >= getMonMaxXp(mSave.level)) { mSave.xp -= getMonMaxXp(mSave.level); mSave.level++; }
    }
  });

  saveGame(); refreshHome();

  document.getElementById("end-rewards").innerHTML = `
    <div class="item"><span>Tier XP</span> <span>+${tierXpReward} ${tierLvlUp ? "(TIER UP!)" : ""}</span></div>
    <div class="item"><span>Player XP</span> <span>+${xpReward} ${playerLvlUp ? "(LVL UP!)" : ""}</span></div>
    <div class="item"><span>Roster XP</span> <span>+${xpReward} (x3)</span></div>
    <div class="item"><span>Gold</span> <span>+${format(goldReward)}</span></div>
  `;
  document.getElementById("end-vp").textContent = (vpChange > 0 ? "+" : "") + format(vpChange) + " VP";
  document.getElementById("end-vp").className = "vp-change " + (vpChange > 0 ? "pos" : "neg");
  document.getElementById("end-rank").textContent = `Now ${format(save.vp)} VP — ${rankForVP(save.vp)}`;

  setTimeout(() => show("screen-end"), 600);
}

function handleTourneyMatchEnd(won) {
  const matchIdx = battle.tournament.matchIdx;
  const match = tournamentState.bracket[matchIdx];
  if (!match) { show("screen-home"); return; }

  const playerIsP1 = match.p1 === "player";
  if (won) {
    match.winner = "player";
    match.loser = playerIsP1 ? match.p2 : match.p1;
  } else {
    match.loser = "player";
    match.winner = playerIsP1 ? match.p2 : match.p1;
    tournamentState.playerAlive = false;
  }
  match.done = true;

  const guildMults = typeof getGuildRewardMultipliers === "function" ? getGuildRewardMultipliers() : { gold: 1, xp: 1 };
  const xpReward = Math.round((won ? 100 : 30) * guildMults.xp);
  const goldReward = Math.round((won ? 40 : 10) * guildMults.gold);
  save.gold += goldReward;
  save.playerXp += xpReward;
  if (won) {
    if (typeof addGuildXp === "function") addGuildXp(40);
    if (typeof addGuildChat === "function" && save.guild) addGuildChat("🏆", `A tournament match was won against ${battle.opponentName}!`);
  }

  battle.player.forEach(m => {
    let mSave = save.mons.find(x => x.uid === m.uid);
    if (mSave) {
      mSave.xp += xpReward;
      while (mSave.xp >= getMonMaxXp(mSave.level)) { mSave.xp -= getMonMaxXp(mSave.level); mSave.level++; }
    }
  });

  updateBracketAfterMatch(matchIdx);

  saveGame();
  refreshHome();

  if (match.round === "final" || match.round === "third" || !tournamentState.playerAlive) {
    showTourneyResults();
  } else {
    showTourneyBracket();
  }
}

function updateBracketAfterMatch(completedIdx) {
  const match = tournamentState.bracket[completedIdx];

  if (match.round === "semi") {
    if (completedIdx === 0) {
      tournamentState.bracket[2].p1 = match.winner;
      tournamentState.bracket[3].p1 = match.loser;
    } else if (completedIdx === 1) {
      tournamentState.bracket[2].p2 = match.winner;
      tournamentState.bracket[3].p2 = match.loser;
    }
  }
}

function showTourneyResults() {
  document.getElementById("tourney-title").textContent = "Tournament Complete!";

  const finalMatch = tournamentState.bracket[2];
  const thirdMatch = tournamentState.bracket[3];

  if (finalMatch.winner === null && finalMatch.p1 !== null && finalMatch.p2 !== null) {
    if (finalMatch.p1 === "player" || finalMatch.p2 === "player") {
    } else {
      finalMatch.winner = finalMatch.p1;
      finalMatch.loser = finalMatch.p2;
      finalMatch.done = true;
    }
  }

  let placement = 4;
  let prizeGold = 0;
  let prizeGems = 0;

  if (!tournamentState.playerAlive) {
    placement = (finalMatch.loser === "player" || finalMatch.loser === null) ? 2 :
      (thirdMatch && (thirdMatch.loser === "player" || thirdMatch.p1 === null)) ? 4 : 3;
    if (finalMatch && finalMatch.loser === "player") placement = 2;
    else if (thirdMatch && thirdMatch.winner === "player") placement = 3;
    else if (thirdMatch && (thirdMatch.p1 === "player" || thirdMatch.p2 === "player") && thirdMatch.loser === "player") placement = 4;
  } else {
    placement = 1;
    if (finalMatch) {
      if (finalMatch.p1 === "player" || finalMatch.p2 === "player") {
        finalMatch.winner = "player";
        finalMatch.loser = (finalMatch.p1 === "player") ? finalMatch.p2 : finalMatch.p1;
        finalMatch.done = true;
      }
    }
  }

  if (placement === 1) { prizeGold = 500; prizeGems = 100; }
  else if (placement === 2) { prizeGold = 250; prizeGems = 40; }
  else if (placement === 3) { prizeGold = 125; prizeGems = 20; }
  else { prizeGold = 50; prizeGems = 5; }

  save.gold += prizeGold;
  save.gems += prizeGems;
  saveGame();

  const placementNames = { 1: "1st - Champion! 🏆", 2: "2nd - Runner-Up", 3: "3rd Place", 4: "4th Place" };

  const container = document.getElementById("bracket-view");
  if (container) {
    container.innerHTML = `
      <div class="tourney-result-banner" style="color:var(--gold);">${placementNames[placement]}</div>
      <div class="tourney-result-box">
        <div class="item" style="display:flex; justify-content:space-between; font-family:var(--mono); font-size:14px;">
          <span>Prize Gold</span><span style="color:var(--gold);">+${formatNum(prizeGold)}</span>
        </div>
        <div class="item" style="display:flex; justify-content:space-between; font-family:var(--mono); font-size:14px;">
          <span>Prize Gems</span><span style="color:var(--gold);">+${formatNum(prizeGems)}</span>
        </div>
      </div>
      <button class="btn gold" onclick="tournamentState=null; refreshHome(); show('screen-home');">Done</button>
    `;
  }

  show("screen-tournament-bracket");
}

function updateTourneyDashboard() {
  const el = document.querySelector("#card-tournament .desc");
  if (el) {
    if (tournamentState && tournamentState.playerAlive) el.textContent = "In Progress";
    else el.textContent = "50 💎 Entry";
  }
}

// Hooks to systems.js for new cards
if (document.getElementById("card-daily-login")) {
  document.getElementById("card-daily-login").addEventListener("click", () => {
    initDailyLoginUI();
    show("screen-daily-login");
  });
}

if (document.getElementById("card-guild")) {
  document.getElementById("card-guild").addEventListener("click", () => {
    initGuildUI();
    show("screen-guild");
  });
}

if (document.getElementById("card-dungeon")) {
  document.getElementById("card-dungeon").addEventListener("click", () => {
    if (typeof initDungeonUI === "function") initDungeonUI();
    show("screen-dungeon");
  });
}

if (document.getElementById("btn-rematch")) {
  document.getElementById("btn-rematch").addEventListener("click", () => {
    if (battle) {
      const prevUids = battle.player.map(m => m.uid);
      startMatchmaking(prevUids);
    } else {
      buildSelectGrid();
      show("screen-select");
    }
  });
}

/* ============================= ACHIEVEMENTS SYSTEM ============================= */
function trackAchievement(type, amount) {
  if (!save.stats) return;
  if (type === "explore_complete") save.stats.expeditionsCompleted = (save.stats.expeditionsCompleted || 0) + amount;
  if (type === "materials_found") save.stats.materialsFound = (save.stats.materialsFound || 0) + amount;
  if (type === "item_forged") save.stats.itemsForged = (save.stats.itemsForged || 0) + amount;
  if (type === "gear_equipped") save.stats.gearEquipped = (save.stats.gearEquipped || 0) + amount;
  if (type === "dojo_hours") save.stats.dojoHours = (save.stats.dojoHours || 0) + amount;
}

function getAchievementProgress(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach) return 0;
  switch (id) {
    case "battle_wins_1": case "battle_wins_10": case "battle_wins_50":
    case "battle_wins_100": case "battle_wins_500": return save.wins;
    case "battle_streak_5": case "battle_streak_10": return save.stats.bestStreak;
    case "battle_vp_2000": case "battle_vp_5000": case "battle_vp_10000": return save.vp;
    case "collect_5": case "collect_12": return new Set(save.mons.map(m => m.baseId)).size;
    case "variant_1": case "variant_4": return new Set(save.mons.filter(m => m.variant).map(m => m.variant)).size;
    case "evolve_1": case "evolve_5": return save.stats.evolutionsPerformed;
    case "explore_1": case "explore_10": case "explore_50": return save.stats.expeditionsCompleted;
    case "materials_100": case "materials_500": return save.stats.materialsFound;
    case "craft_1": case "craft_10": case "craft_50": return save.stats.itemsForged;
    case "gear_5": case "gear_20": return save.stats.gearEquipped;
    case "dojo_1h": case "dojo_10h": case "dojo_50h": return Math.floor(save.stats.dojoHours / 3600000);
    default: return 0;
  }
}

function getCategoryAchievements(category) {
  return ACHIEVEMENTS.filter(a => a.category === category);
}

function getCategoryStatus(category) {
  const achs = getCategoryAchievements(category);
  let completed = 0, total = achs.length, claimed = 0;
  achs.forEach(a => {
    const progress = getAchievementProgress(a.id);
    const isComplete = progress >= a.target;
    const isClaimed = save.achievements.includes(a.id);
    if (isClaimed) claimed++;
    else if (isComplete) completed++;
  });
  return { completed, total, claimed, pct: total > 0 ? Math.round(((completed + claimed) / total) * 100) : 0 };
}

function getUnclaimedAchievements() {
  let count = 0;
  ACHIEVEMENTS.forEach(a => {
    if (!save.achievements.includes(a.id) && getAchievementProgress(a.id) >= a.target) count++;
  });
  return count;
}

function claimAchievement(id) {
  const ach = ACHIEVEMENTS.find(a => a.id === id);
  if (!ach || save.achievements.includes(id)) return;
  if (getAchievementProgress(id) < ach.target) return;
  save.achievements.push(id);
  save.gold += ach.reward.gold;
  save.gems += ach.reward.gems;
  awardAllMasteryPoints(2);
  saveGame();
  refreshHome();
  refreshAchievementsUI();
  showModal({ icon: "🏆", title: `Achievement Unlocked: ${ach.name}`, message: `Claimed ${ach.reward.gold} 🪙 and ${ach.reward.gems} 💎! +2 MP to all creatures!` });
}

function refreshAchievementsUI() {
  const container = document.getElementById("achievements-content");
  if (!container) return;

  const unclaimed = getUnclaimedAchievements();
  let html = "";

  Object.keys(ACHIEVEMENT_CATEGORIES).forEach(catKey => {
    const cat = ACHIEVEMENT_CATEGORIES[catKey];
    const status = getCategoryStatus(catKey);
    const achs = getCategoryAchievements(catKey);

    html += `<div class="ach-category-card" style="border-color:${cat.color};">
      <div class="ach-cat-header">
        <div class="ach-cat-name">${cat.icon} ${cat.name}</div>
        <div class="ach-cat-pct">${status.pct}%</div>
      </div>
      <div class="ach-cat-bar-track"><div class="ach-cat-bar-fill" style="width:${status.pct}%;background:${cat.color};"></div></div>
      <div class="ach-cat-count">${status.completed + status.claimed}/${status.total} · ${status.claimed} claimed</div>
    </div>`;

    achs.sort((a, b) => {
      const aDone = save.achievements.includes(a.id) ? 3 : getAchievementProgress(a.id) >= a.target ? 2 : 1;
      const bDone = save.achievements.includes(b.id) ? 3 : getAchievementProgress(b.id) >= b.target ? 2 : 1;
      return aDone - bDone;
    });

    achs.forEach(ach => {
      const progress = getAchievementProgress(ach.id);
      const isComplete = progress >= ach.target;
      const isClaimed = save.achievements.includes(ach.id);
      const isTargetNumeric = ach.target > 100;
      const pct = Math.min(100, Math.round((progress / ach.target) * 100));

      html += `<div class="ach-card ${isClaimed ? 'ach-claimed' : isComplete ? 'ach-ready' : ''}">
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          <div class="ach-progress-row">
            <div class="ach-bar-track"><div class="ach-bar-fill ${isClaimed ? 'ach-bar-claim' : ''}" style="width:${pct}%;${isClaimed ? '' : `background:${cat.color};`}"></div></div>
            <div class="ach-progress-text">${isTargetNumeric ? formatNum(progress) + '/' + formatNum(ach.target) : progress + '/' + ach.target}</div>
          </div>
          <div class="ach-reward">🪙 ${formatNum(ach.reward.gold)} · 💎 ${formatNum(ach.reward.gems)}</div>
        </div>
        <div class="ach-action">
          ${isClaimed ? '<div class="ach-check">✓</div>' : isComplete ? `<button class="btn-ach-claim" data-ach-id="${ach.id}">Claim</button>` : ''}
        </div>
      </div>`;
    });
  });

  container.innerHTML = html;

  container.querySelectorAll(".btn-ach-claim").forEach(btn => {
    btn.addEventListener("click", () => claimAchievement(btn.dataset.achId));
  });
}

function updateAchievementsDash() {
  const el = document.querySelector("#card-achievements .desc");
  if (el) {
    const count = getUnclaimedAchievements();
    el.textContent = count > 0 ? `${count} unclaimed!` : "Milestones";
  }
}

function initAchievementsUI() {
  refreshAchievementsUI();
  show("screen-achievements");
}

// Card hook
if (document.getElementById("card-achievements")) {
  document.getElementById("card-achievements").addEventListener("click", () => {
    refreshAchievementsUI();
    show("screen-achievements");
  });
}

// Call updateAchievementsDash in refreshHome
const _origRefreshHome = refreshHome;
refreshHome = function () {
  _origRefreshHome();
  if (typeof updateAchievementsDash === "function") updateAchievementsDash();
};
