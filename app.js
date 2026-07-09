"use strict";

/* ============================= DATA ============================= */
function move(name, type, power, acc){ return {name, type, power, acc}; }
const BASH = move("Bash","neutral",35,100);

const MOVES = {
  ember:  move("Flame Burst","ember",60,95), aqua:   move("Tide Crash","aqua",60,95),
  verdant:move("Bramble Whip","verdant",60,95), volt:   move("Shock Bolt","volt",60,95),
  stone:  move("Rock Slam","stone",60,95), gale:   move("Wind Slash","gale",60,95)
};

const ITEMS = {
  none:         { name:"None",          desc:"No item held." },
  quickfeather: { name:"Quick Feather", desc:"+10% Speed" },
  ironscale:    { name:"Iron Scale",    desc:"+15% Defense" },
  guardcharm:   { name:"Guard Charm",   desc:"-10% Dmg taken" },
  vitalberry:   { name:"Vital Berry",   desc:"Heals 25% at low HP" },
  steadfastsash:{ name:"Steadfast Sash",desc:"Survives lethal hit once" },
  puredew:      { name:"Pure Dew",      desc:"Cures all status effects when HP<30%" }
};

const ROSTER_DEF = [
  ["cindrake","Cindrake","ember",70,65,55,70,"quickfeather","Inferno Pounce","smooth",15,"Cindrake Alpha"],
  ["pyrelope","Pyrelope","ember",75,80,60,85,"guardcharm","Solar Kick","spiky",20,"Pyrelope Omega"],
  ["tidenne","Tidenne","aqua",80,60,65,60,"ironscale","Riptide Spin","smooth",15,"Tidenne Alpha"],
  ["coralisk","Coralisk","aqua",90,70,85,50,"vitalberry","Abyssal Crush","angular",20,"Coralisk Omega"],
  ["verdil","Verdil","verdant",75,60,60,75,"quickfeather","Thicket Charge","smooth",15,"Verdil Alpha"],
  ["thornuke","Thornuke","verdant",95,75,90,40,"ironscale","Root Slam","spiky",20,"Thornuke Omega"],
  ["sparkit","Sparkit","volt",60,65,50,95,"quickfeather","Static Burst","smooth",15,"Sparkit Alpha"],
  ["voltigo","Voltigo","volt",70,85,55,90,"steadfastsash","Thunder Fang","spiky",20,"Voltigo Omega"],
  ["pebblin","Pebblin","stone",85,60,90,45,"ironscale","Pebble Barrage","angular",15,"Pebblin Alpha"],
  ["boulderon","Boulderon","stone",100,90,100,30,"guardcharm","Seismic Slam","spiky",20,"Boulderon Omega"],
  ["gustling","Gustling","gale",65,70,55,90,"quickfeather","Gale Dash","smooth",15,"Gustling Alpha"],
  ["zephyrn","Zephyrn","gale",75,85,60,100,"steadfastsash","Cyclone Strike","angular",20,"Zephyrn Omega"]
];

const TYPE_CHART = {
  ember: { verdant:2, aqua:0.5, stone:0.5 }, aqua: { ember:2, stone:2, verdant:0.5, volt:0.5 },
  verdant: { aqua:2, stone:2, ember:0.5, gale:0.5 }, volt: { aqua:2, gale:2, verdant:0.5, stone:0 },
  stone: { ember:2, volt:2, gale:0.5, verdant:0.5 }, gale: { verdant:2, volt:0.5, stone:0.5 }
};
function typeMultiplier(atkType, defType){ return (atkType==="neutral")? 1 : ((TYPE_CHART[atkType] && TYPE_CHART[atkType][defType]) || 1); }

/* ============================= STATUS EFFECTS & WEATHER ============================= */
const STATUS_EFFECTS = {
  burn:  { name:"Burn", icon:"🔥", color:"#ff6a45", desc:"-25% ATK, 10% max HP dmg per turn",
           onApply(m){ m.statusAtkMult = 0.75; },
           onTick(m){ return Math.floor(m.baseHp * 0.1); },
           onCure(m){ m.statusAtkMult = 1; } },
  freeze:{ name:"Freeze", icon:"❄️", color:"#33c7ea", desc:"Cannot move for 1-2 turns",
           onApply(m){ m.statusSkipTurns = 1 + Math.floor(Math.random() * 2); },
           onTick(m){ return null; },
           onCure(m){ m.statusSkipTurns = 0; } },
  poison:{ name:"Poison", icon:"☠️", color:"#9b59b6", desc:"15% max HP damage per turn",
           onApply(m){ },
           onTurn(m){ return Math.floor(m.baseHp * 0.15); },
           onCure(m){} }
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
  sunny:    { name:"Sunny", icon:"☀️", color:"#ff6a45",
              desc:"Ember +20%, Aqua -20%",
              modify(atkType, defType){ return atkType==="ember"? 1.2 : atkType==="aqua"? 0.8 : 1; } },
  rain:     { name:"Rain", icon:"🌧️", color:"#33c7ea",
              desc:"Aqua +20%, Ember -20%",
              modify(atkType, defType){ return atkType==="aqua"? 1.2 : atkType==="ember"? 0.8 : 1; } },
  sandstorm:{ name:"Sandstorm", icon:"🌪️", color:"#c98a52",
              desc:"Stone +20%, Gale -20%",
              modify(atkType, defType){ return atkType==="stone"? 1.2 : atkType==="gale"? 0.8 : 1; } },
  gale:     { name:"Gale Winds", icon:"💨", color:"#9db4ff",
              desc:"Gale +20%, Verdant -20%",
              modify(atkType, defType){ return atkType==="gale"? 1.2 : atkType==="verdant"? 0.8 : 1; } },
  overgrown:{ name:"Overgrown", icon:"🌿", color:"#5fd66b",
              desc:"Verdant +20%, Volt -20%",
              modify(atkType, defType){ return atkType==="verdant"? 1.2 : atkType==="volt"? 0.8 : 1; } },
  none:     { name:"Clear", icon:"☀️", color:"#888",
              desc:"No weather effects",
              modify(atkType, defType){ return 1; } }
};

let weather = { type:"none", turnsLeft:0 };
function setWeather(type, turns) { weather = { type, turnsLeft: turns }; }
function advanceWeather() {
  if (weather.type !== "none") { weather.turnsLeft--; if (weather.turnsLeft <= 0) weather = { type:"none", turnsLeft:0 }; }
}
function getWeatherMult(atkType, defType) {
  if (!weather || weather.type === "none") return 1;
  const w = WEATHER_CONDITIONS[weather.type];
  return w ? w.modify(atkType, defType) : 1;
}

/* ============================= TRAINER TEMPLATES & AI ============================= */
const TRAINER_TEMPLATES = [
  { name:"Epidemic",   theme:null,             personality:"balanced",   desc:"Balanced challenger" },
  { name:"Nightshard", theme:"ember",           personality:"aggressive", desc:"Fire specialist" },
  { name:"Vellum",     theme:"aqua",            personality:"defensive",  desc:"Water tactician" },
  { name:"Kestrix",    theme:"gale",            personality:"aggressive", desc:"Wind striker" },
  { name:"Rowan",      theme:"verdant",         personality:"balanced",   desc:"Nature guardian" },
  { name:"Ashvale",    theme:"stone",           personality:"defensive",  desc:"Rock bulwark" },
  { name:"Voltara",    theme:"volt",            personality:"balanced",   desc:"Thunder master" },
  { name:"Diremire",   theme:null,              personality:"aggressive", desc:"Wildcard brawler" },
  { name:"Glacius",    theme:"aqua+gale",       personality:"defensive",  desc:"Permafrost duelist" },
  { name:"Sylvara",    theme:"verdant+ember",   personality:"balanced",   desc:"Overgrowth shaman" },
  { name:"Tecton",     theme:"stone+volt",      personality:"aggressive", desc:"Magma titan" },
  { name:"Shadoom",    theme:null,              personality:"tactician",  desc:"Calculated predator" },
  { name:"Blitzara",   theme:"volt+gale",       personality:"reckless",   desc:"Storm chaser" },
  { name:"Fernwood",   theme:"verdant+stone",   personality:"defensive",  desc:"Ancient warden" },
];

const AI_PERSONALITIES = {
  aggressive: { switchChance:0.08, dmgWeight:1.3,  switchBelowHpPct:0.12, accWeight:0.6,  stabBonus:1.1 },
  balanced:   { switchChance:0.3,  dmgWeight:1.0,  switchBelowHpPct:0.25, accWeight:1.0,  stabBonus:1.1 },
  defensive:  { switchChance:0.55, dmgWeight:0.85, switchBelowHpPct:0.4,  accWeight:1.2,  stabBonus:1.15 },
  tactician:  { switchChance:0.4,  dmgWeight:1.0,  switchBelowHpPct:0.3,  accWeight:1.1,  stabBonus:1.2 },
  reckless:   { switchChance:0.05, dmgWeight:1.5,  switchBelowHpPct:0.08, accWeight:0.4,  stabBonus:0.9 }
};

const THEMED_ROSTER = {
  ember:   ["cindrake","pyrelope"],
  aqua:    ["tidenne","coralisk"],
  verdant: ["verdil","thornuke"],
  volt:    ["sparkit","voltigo"],
  stone:   ["pebblin","boulderon"],
  gale:    ["gustling","zephyrn"]
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
  } catch(e) {}
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
  } catch(e) {}
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
  } catch(e) {}
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
  } catch(e) {}
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
  } catch(e) {}
}

/* ============================= SAVE & PROGRESSION (v3) ============================= */
const SAVE_KEY = "rift_arena_rpg_v3";

function generateDefaultSave() {
  const save = {
    vp: 1000, wins: 0, losses: 0,
    playerLevel: 1, playerXp: 0, gold: 500, gems: 100,
    tierLevel: 1, tierXp: 0,
    lastIdleClaim: Date.now(),
    explore: { active: false },
    dojo: { active: false },
    dailyQuests: { date: "", quests: [] },
    bag: { vitalberry: 5, quickfeather: 2, ironscale: 2, puredew: 1 },
    mons: []
  };
  ["cindrake", "tidenne", "verdil", "sparkit"].forEach((id, i) => {
    save.mons.push({ uid: "start_"+i, baseId: id, level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false, evolved: false });
  });
  return save;
}

let save = (function(){
  let s;
  try{ const raw = localStorage.getItem(SAVE_KEY); if(raw) s = {...generateDefaultSave(), ...JSON.parse(raw)}; }catch(e){}
  if (!s) s = generateDefaultSave();
  // Migration: ensure all mons have evolved property
  s.mons.forEach(m => { if (m.evolved === undefined) m.evolved = false; });
  if (!s.shopStock) s.shopStock = null;
  return s;
})();
function saveGame() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

function getPlayerMaxXp(lvl) { return lvl * 150; }
function getMonMaxXp(lvl) { return lvl * lvl * 50; }

function getMonData(uid) {
  const mSave = save.mons.find(m => m.uid === uid) || save.mons[0]; // fallback
  const def = ROSTER_DEF.find(r => r[0] === mSave.baseId);
  const lvl = mSave.level;
  
  // Base scale + Merge bonuses
  const scale = 1 + (lvl - 1) * 0.05;
  const hpBonus = 1 + (mSave.mergeBonuses.hp || 0);
  const atkBonus = 1 + (mSave.mergeBonuses.atk || 0);
  const defBonus = 1 + (mSave.mergeBonuses.def || 0);
  const spdBonus = 1 + (mSave.mergeBonuses.spd || 0);
  
  const evoLevel = def[10] || 0;
  const evoName = def[11] || "";
  const evolved = mSave.evolved || false;
  const displayName = evolved ? evoName : def[1];

  return {
    uid: mSave.uid, baseId: def[0], name: displayName, type: def[2], 
    baseHp: Math.floor(def[3] * scale * hpBonus),
    atk: Math.floor(def[4] * scale * atkBonus),
    def: Math.floor(def[5] * scale * defBonus),
    spd: Math.floor(def[6] * scale * spdBonus),
    item: mSave.heldItem, sigName: def[8], shape: def[9],
    level: lvl, xp: mSave.xp, onExpedition: mSave.onExpedition,
    maxXp: getMonMaxXp(lvl),
    evolvesAt: evoLevel,
    evoName: evoName,
    evolved: evolved,
    moves: [BASH, MOVES[def[2]], move(def[8], def[2], 80, 85)]
  };
}

function rankForVP(vp){
  if(vp < 1500) return "Bronze"; if(vp < 2500) return "Silver";
  if(vp < 3500) return "Gold"; if(vp < 4500) return "Platinum"; return "Master";
}

/* ============================= UI NAVIGATION ============================= */
function show(id){
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}
document.querySelectorAll("[data-back]").forEach(btn=>{
  btn.addEventListener("click", ()=> {
    if(btn.getAttribute("data-back") === "screen-home") refreshHome();
    show(btn.getAttribute("data-back"));
  });
});

/* ============================= DASHBOARD / HOME ============================= */
function refreshHome(){
  document.getElementById("player-level").textContent = "Lv." + save.playerLevel;
  document.getElementById("player-xp-fill").style.width = `${Math.min(100, (save.playerXp / getPlayerMaxXp(save.playerLevel)) * 100)}%`;
  
  document.getElementById("tier-level").textContent = save.tierLevel;
  document.getElementById("tier-xp-fill").style.width = `${Math.min(100, (save.tierXp / getTierMaxXp(save.tierLevel)) * 100)}%`;
  
  document.getElementById("res-gold").textContent = formatNum(save.gold);
  document.getElementById("res-gems").textContent = formatNum(save.gems);
  
  document.getElementById("home-rank").textContent = rankForVP(save.vp);
  document.getElementById("home-vp").textContent = formatNum(save.vp) + " VP";
  if (typeof updateExploreDash === "function") updateExploreDash();
  if (typeof updateDojoDash === "function") updateDojoDash();
}

setInterval(() => {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  const earned = mins * 3;
  document.getElementById("idle-status").textContent = mins > 0 ? `${formatNum(earned)}🪙 stored` : "Claim";
}, 1000);

document.getElementById("card-idle").addEventListener("click", () => {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  if (mins > 0) {
    const earned = mins * 3;
    save.gold += earned; save.lastIdleClaim = Date.now(); saveGame();
    alert(`Claimed ${formatNum(earned)} Gold from Idle Base!`);
    refreshHome();
  } else alert("Too soon to claim again. Base generates gold over time.");
});

document.getElementById("card-summon").addEventListener("click", () => {
  if (save.gems < 100) return alert("Not enough gems. Earn gems by exploring or leveling up!");
  save.gems -= 100;
  
  const choice = ROSTER_DEF[Math.floor(Math.random() * ROSTER_DEF.length)];
  const uid = Date.now().toString() + Math.floor(Math.random()*1000);
  save.mons.push({ uid: uid, baseId: choice[0], level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false, evolved: false });
  
  if (typeof trackQuestProgress === "function") trackQuestProgress("summon", 1);
  saveGame(); refreshHome();
  alert(`✨ Summoned a new ${choice[1]}! Added to roster.`);
});

// Hooks to systems.js
document.getElementById("card-explore").addEventListener("click", ()=>{ initExploreUI(); show("screen-explore"); });
document.getElementById("card-merge").addEventListener("click", ()=>{ initMergeUI(); show("screen-merge"); });
document.getElementById("card-bag").addEventListener("click", ()=>{ initBagUI(); show("screen-bag"); });
if(document.getElementById("card-shop")) document.getElementById("card-shop").addEventListener("click", ()=>{ initShopUI(); show("screen-shop"); });
if(document.getElementById("card-dojo")) document.getElementById("card-dojo").addEventListener("click", ()=>{ initDojoUI(); show("screen-dojo"); });

document.getElementById("card-battle").addEventListener("click", ()=>{
  if (save.mons.filter(m => !m.onExpedition).length < 3) return alert("You need at least 3 Rift-forms available to battle.");
  buildSelectGrid(); 
  show("screen-select"); 
  document.getElementById("btn-confirm-team").textContent = "Find Ranked Match";
  if(document.getElementById("btn-survival-team")) document.getElementById("btn-survival-team").style.display = "";
  if(document.getElementById("btn-tournament-team")) document.getElementById("btn-tournament-team").style.display = "";
});
document.getElementById("card-battle").addEventListener("contextmenu", (e)=>{
  e.preventDefault();
  buildSelectGrid();
  show("screen-select");
  document.getElementById("btn-confirm-team").textContent = "Find Ranked Match";
  if(document.getElementById("btn-survival-team")) document.getElementById("btn-survival-team").style.display = "";
  if(document.getElementById("btn-tournament-team")) document.getElementById("btn-tournament-team").style.display = "";
});
document.getElementById("card-roster").addEventListener("click", ()=>{ buildRosterView(); show("screen-roster"); });
if(document.getElementById("card-quests")) document.getElementById("card-quests").addEventListener("click", ()=>{ initQuestsUI(); show("screen-quests"); });
refreshHome();

/* ============================= ROSTER & DETAILS ============================= */
function statLine(m){ return `HP ${m.baseHp} · ATK ${m.atk} · DEF ${m.def} · SPD ${m.spd}`; }

function buildRosterView(){
  const grid = document.getElementById("roster-view-grid");
  grid.innerHTML = "";
  
  save.mons.forEach(mSave => {
    const m = getMonData(mSave.uid);
    const card = document.createElement("div");
    card.className = "cmon-card " + (m.onExpedition ? "locked" : "");
    card.innerHTML = `
      <div class="row1">
        <div class="orb t-${m.type}"><div class="glyph"></div></div>
        <div style="flex:1;">
          <div class="name">${m.name} <span class="badge">Lv.${m.level}</span></div>
          <div class="type">${m.type} ${m.onExpedition ? '(Exploring)' : ''}</div>
        </div>
      </div>
      <div class="xp-bar" style="width:100%; margin-top:4px;"><div class="xp-fill" style="width:${(m.xp/m.maxXp)*100}%"></div></div>
    `;
    card.addEventListener("click", () => showMonDetails(m));
    grid.appendChild(card);
  });
}

function showMonDetails(m) {
  const view = document.getElementById("mon-details-view");
  const upgCost = m.level * 100;
  
  const drawStat = (label, val, max) => `
    <div class="stat-bar-row">
      <div class="stat-label">${label}</div>
      <div class="stat-bar-track"><div class="stat-bar-fill" style="width:${Math.min(100,(val/max)*100)}%"></div></div>
      <div class="stat-val">${val}</div>
    </div>`;
    
  view.innerHTML = `
    <div class="orb mon-big-orb t-${m.type}"><div class="glyph"></div></div>
    <div style="text-align:center; font-family:var(--display); font-weight:800; font-size:22px;">${m.name} <span class="badge">Lv.${m.level}</span></div>
    
    <div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">
      ${drawStat("HP", m.baseHp, 300)}
      ${drawStat("ATK", m.atk, 250)}
      ${drawStat("DEF", m.def, 250)}
      ${drawStat("SPD", m.spd, 250)}
    </div>
    
    <div style="font-size:12px; color:var(--text-dim); text-align:center; margin-top:10px;">
      Held item: ${ITEMS[m.item].name} — ${ITEMS[m.item].desc}
    </div>
    
    <button class="btn gold" id="btn-lvlup" style="margin-top:10px;" ${m.onExpedition ? 'disabled' : ''}>Level Up (${formatNum(upgCost)} Gold)</button>
    ${(!m.evolved && m.evolvesAt > 0 && m.level >= m.evolvesAt) ? `<button class="btn gold" id="btn-evolve" style="margin-top:8px; background:linear-gradient(135deg, #c084fc, #8b5cf6); color:white; border:none;">✨ Evolve to ${m.evoName} (FREE)</button>` : ''}
  `;
  
  show("screen-details");
  
  document.getElementById("btn-lvlup").onclick = () => {
    if (save.gold < upgCost) return alert("Not enough gold.");
    save.gold -= upgCost;
    save.mons.find(x => x.uid === m.uid).level++;
    if (typeof trackQuestProgress === "function") trackQuestProgress("level_up", 1);
    saveGame(); refreshHome(); showMonDetails(getMonData(m.uid));
  };

  const evolveBtn = document.getElementById("btn-evolve");
  if (evolveBtn) {
    evolveBtn.onclick = () => {
      const mSave = save.mons.find(x => x.uid === m.uid);
      if (!mSave || mSave.evolved) return;
      mSave.evolved = true;
      saveGame();
      const evolved = getMonData(m.uid);
      alert(`✨ ${m.name} evolved into ${evolved.name}! All stats increased!`);
      refreshHome();
      showMonDetails(evolved);
    };
  }
}

/* ============================= TEAM SELECT ============================= */
let pickOrder = [];

function buildSelectGrid(){
  pickOrder = [];
  const grid = document.getElementById("select-grid");
  grid.innerHTML = "";
  
  save.mons.forEach(mSave => {
    if(mSave.onExpedition) return; // Hide exploring mons
    const m = getMonData(mSave.uid);
    const card = document.createElement("div");
    card.className = "cmon-card"; card.dataset.uid = m.uid;
    card.innerHTML = `
      <div class="pickbadge" style="display:none;"></div>
      <div class="row1"><div class="orb t-${m.type}"><div class="glyph"></div></div>
      <div><div class="name">${m.name} <span class="badge">Lv.${m.level}</span></div><div class="type">${m.type}</div></div></div>
      <div class="stats">${statLine(m)}</div>
    `;
    card.onclick = ()=> togglePick(m.uid, card);
    grid.appendChild(card);
  });
  updateConfirmBtn();
}

function togglePick(uid, card){
  const idx = pickOrder.indexOf(uid);
  if(idx >= 0){ pickOrder.splice(idx,1); card.classList.remove("picked"); card.querySelector(".pickbadge").style.display = "none"; }
  else { if(pickOrder.length >= 3) return; pickOrder.push(uid); card.classList.add("picked"); const badge = card.querySelector(".pickbadge"); badge.style.display = "flex"; badge.textContent = pickOrder.length; }
  
  document.querySelectorAll("#select-grid .cmon-card").forEach(c=>{
    const i = pickOrder.indexOf(c.dataset.uid);
    const badge = c.querySelector(".pickbadge");
    if(i >= 0){ badge.style.display="flex"; badge.textContent = i+1; c.classList.add("picked"); }
    else { badge.style.display="none"; c.classList.remove("picked"); }
  });
  updateConfirmBtn();
}

function updateConfirmBtn(){
  const btn = document.getElementById("btn-confirm-team");
  btn.textContent = `Find Ranked Match (${pickOrder.length}/3)`;
  btn.disabled = pickOrder.length !== 3;
  const survBtn = document.getElementById("btn-survival-team");
  if(survBtn) {
    survBtn.textContent = `Survival Mode (${pickOrder.length}/3)`;
    survBtn.disabled = pickOrder.length !== 3;
  }
  const tourneyBtn = document.getElementById("btn-tournament-team");
  if (tourneyBtn) {
    tourneyBtn.textContent = `Tournament (${pickOrder.length}/3)`;
    tourneyBtn.disabled = pickOrder.length !== 3;
  }
}

document.getElementById("btn-confirm-team").addEventListener("click", ()=>{
  if(pickOrder.length !== 3) return;
  startMatchmaking(pickOrder.slice());
});

if(document.getElementById("btn-survival-team")) {
  document.getElementById("btn-survival-team").addEventListener("click", ()=>{
    if(pickOrder.length !== 3) return;
    if (typeof startSurvivalMode === "function") startSurvivalMode();
  });
}

if(document.getElementById("btn-tournament-team")) {
  document.getElementById("btn-tournament-team").addEventListener("click", ()=>{
    if(pickOrder.length !== 3) return;
    if (typeof startTournamentMode === "function") startTournamentMode(pickOrder.slice());
  });
}

/* ============================= MATCHMAKING QUEUE ============================= */
let matchmakingTimer = null;

function startMatchmaking(playerUids) {
  const pData = playerUids.map(uid => getMonData(uid));
  const avgLevel = Math.max(1, Math.floor(pData.reduce((s, m) => s + m.level, 0) / 3));
  const playerVP = save.vp;

  if(!document.getElementById("queue-timer")) {
      // Fallback if UI doesn't have queue screen, just instantly match
      startPrepDirect(playerUids, avgLevel, playerVP);
      return;
  }

  document.getElementById("queue-timer").textContent = "00:00";
  document.getElementById("queue-sub").textContent = "Searching the arena for a worthy opponent...";
  document.getElementById("queue-rank-range").textContent = `Your VP: ${formatNum(playerVP)}`;
  show("screen-queue");

  const queueStart = Date.now();
  const searchTime = 3000 + Math.random() * 4000;

  clearInterval(matchmakingTimer);
  matchmakingTimer = setInterval(() => {
    const elapsed = Math.floor((Date.now() - queueStart) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById("queue-timer").textContent = String(m).padStart(2,"0") + ":" + String(s).padStart(2,"0");

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
    clearInterval(matchmakingTimer);
    document.getElementById("queue-sub").textContent = "Match found!";
    startPrepDirect(playerUids, avgLevel, playerVP);
  }, searchTime);
}

function startPrepDirect(playerUids, avgLevel, playerVP) {
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
        const extra = ROSTER_DEF.map(r=>r[0]).sort(()=>Math.random()-0.5).filter(id => !fromTheme.includes(id));
        fromTheme.push(extra[0]);
      }
      oppIds = fromTheme;
    } else {
      oppIds = ROSTER_DEF.map(r=>r[0]).sort(()=>Math.random()-0.5).slice(0, 3);
    }

    if(document.getElementById("prep-foe-name")) document.getElementById("prep-foe-name").textContent = trainer.name;
    
    // Call the original prep function, or route to a custom if startPrepWithData exists
    if (typeof startPrepWithData === "function") {
        startPrepWithData(playerUids, oppIds, oppLvl, trainer, oppRank);
    } else {
        // Safe fallback logic inline
        battle = {
            player: playerUids.map(uid => {
                let m = getMonData(uid);
                m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
                m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
                m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
                return m;
            }),
            foe: oppIds.map(id => instantiateFoe(id, oppLvl)),
            pIndex: 0, fIndex: 0,
            opponentName: trainer.name,
            personality: trainer.personality,
            over: false
        };
        const weatherKeys = Object.keys(WEATHER_CONDITIONS).filter(k => k !== "none");
        if (Math.random() < 0.30) {
            setWeather(weatherKeys[Math.floor(Math.random() * weatherKeys.length)], 3 + Math.floor(Math.random() * 3));
        } else {
            setWeather("none", 0);
        }

        document.getElementById("prep-player-slots").innerHTML = ""; document.getElementById("prep-foe-slots").innerHTML = "";
        battle.player.forEach((m,i)=> document.getElementById("prep-player-slots").insertAdjacentHTML("beforeend", `<div class="prep-slot ${i===0?'lead':''}"><div class="n">${i+1}</div><div class="nm">${m.name}</div></div>`));
        battle.foe.forEach((m,i)=> document.getElementById("prep-foe-slots").insertAdjacentHTML("beforeend", `<div class="prep-slot ${i===0?'lead':''} hidden"><div class="n">${i+1}</div><div class="nm">???</div></div>`));
        show("screen-prep"); runPrepTimer();
    }
}

if(document.getElementById("btn-cancel-queue")) document.getElementById("btn-cancel-queue").addEventListener("click", () => {
  clearInterval(matchmakingTimer);
  buildSelectGrid();
  show("screen-select");
});

/* ============================= BATTLE SYSTEM (ASYNC RESOLUTION) ============================= */
let battle = null;
let awaitingInput = true;

const delay = ms => new Promise(res => setTimeout(res, ms));

function instantiateFoe(baseId, lvl) {
  const def = ROSTER_DEF.find(r => r[0] === baseId);
  const scale = 1 + (lvl - 1) * 0.05;
  const itemKey = def[7]; // AI gets default item
  const m = {
    uid: "foe_"+Math.random(), name: def[1], type: def[2], level: lvl, item: itemKey,
    baseHp: Math.floor(def[3] * scale), atk: Math.floor(def[4] * scale),
    def: Math.floor(def[5] * scale), spd: Math.floor(def[6] * scale),
    moves: [BASH, MOVES[def[2]], move(def[8], def[2], 80, 85)], shape: def[9]
  };
  m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
  m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
  m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
  return m;
}

let prepTimerHandle = null;
function runPrepTimer(){
  awaitingInput = true;
  let t = 4; document.getElementById("prep-clock").textContent = "00:04"; clearInterval(prepTimerHandle);
  prepTimerHandle = setInterval(()=>{ t--; if(t<=0){ clearInterval(prepTimerHandle); revealFoeAndBattle(); return; } document.getElementById("prep-clock").textContent = "00:0" + t; }, 1000);
}
if(document.getElementById("btn-skip-prep")) document.getElementById("btn-skip-prep").onclick = ()=> { clearInterval(prepTimerHandle); revealFoeAndBattle(); };

function revealFoeAndBattle(){
  document.querySelectorAll("#prep-foe-slots .prep-slot").forEach((el,i)=>{ el.classList.remove("hidden"); el.querySelector(".nm").textContent = battle.foe[i].name; });
  setTimeout(()=>{ show("screen-battle"); document.getElementById("battle-log").textContent = `Tier ${save.tierLevel} match against ${battle.opponentName} has begun!`; renderBattle(true); }, 500);
}

function activePlayer(){ return battle.player[battle.pIndex]; }
function activeFoe(){ return battle.foe[battle.fIndex]; }

function renderBattle(fullRebuild){
  const p = activePlayer(), f = activeFoe();
  document.getElementById("ally-name").textContent = p.name; document.getElementById("ally-level").textContent = "Lv." + p.level;
  document.getElementById("foe-name").textContent = f.name; document.getElementById("foe-level").textContent = "Lv." + f.level;
  document.getElementById("ally-hp").style.width = Math.max(0,(p.hp/p.baseHp*100)) + "%";
  document.getElementById("foe-hp").style.width = Math.max(0,(f.hp/f.baseHp*100)) + "%";

  let wEl = document.getElementById("weather-display");
  if(!wEl) {
    wEl = document.createElement("div"); wEl.id = "weather-display";
    wEl.style = "position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.5); padding:4px 8px; border-radius:8px; font-size:12px; z-index:10;";
    document.getElementById("arena").appendChild(wEl);
  }
  
  if (weather && weather.type !== "none") {
    const w = WEATHER_CONDITIONS[weather.type];
    wEl.textContent = `${w.icon} ${w.name} (${weather.turnsLeft}t)`;
    wEl.style.display = "block";
  } else {
    wEl.style.display = "none";
  }

  const pStatusEl = document.getElementById("ally-status");
  const fStatusEl = document.getElementById("foe-status");
  if (pStatusEl) pStatusEl.innerHTML = (p.statusEffects||[]).map(k => `<span style="color:${STATUS_EFFECTS[k].color}">${STATUS_EFFECTS[k].icon}</span>`).join(" ");
  if (fStatusEl) fStatusEl.innerHTML = (f.statusEffects||[]).map(k => `<span style="color:${STATUS_EFFECTS[k].color}">${STATUS_EFFECTS[k].icon}</span>`).join(" ");

  const pm = document.getElementById("player-mon"); pm.className = "mon " + p.shape + " t-" + p.type;
  const fm = document.getElementById("foe-mon"); fm.className = "mon " + f.shape + " t-" + f.type;
  (p.statusEffects||[]).forEach(k => pm.classList.add(k === "freeze" ? "frozen" : k));
  (f.statusEffects||[]).forEach(k => fm.classList.add(k === "freeze" ? "frozen" : k));

  if(fullRebuild){
    document.getElementById("ally-orb").className = "orb sm t-" + p.type; document.getElementById("foe-orb").className = "orb sm t-" + f.type;
    buildActionPanel();
  }
}

function buildActionPanel(){
  const panel = document.getElementById("action-panel"); panel.className = "moves-grid"; panel.innerHTML = "";
  activePlayer().moves.forEach(mv=>{
    const btn = document.createElement("button"); btn.className = "movebtn";
    btn.innerHTML = `<span class="mv-nm">${mv.name}</span><span class="mv-sub">${mv.type.toUpperCase()} · PWR ${mv.power}</span>`;
    btn.onclick = ()=> playerAct({kind:"move", move:mv}); panel.appendChild(btn);
  });
  const swBtn = document.createElement("button"); swBtn.className = "movebtn switchbtn";
  swBtn.innerHTML = `<span class="mv-nm">Switch Out</span><span class="mv-sub">Change active</span>`;
  swBtn.onclick = ()=> openSwitchPanel(false); panel.appendChild(swBtn);
}

function openSwitchPanel(forced){
  const panel = document.getElementById("action-panel"); panel.className = "switch-panel"; panel.innerHTML = "";
  battle.player.forEach((m,i)=>{
    const dis = m.fainted || i === battle.pIndex;
    const opt = document.createElement("div"); opt.className = "switch-opt" + (dis ? " disabled":"");
    opt.innerHTML = `<div class="orb sm t-${m.type}"><div class="glyph"></div></div><div class="mini-hp"><div class="nmrow" style="font-size:12px;"><span>${m.name}</span><span>${m.fainted?"Fainted":Math.round(m.hp)+"/"+m.baseHp}</span></div><div class="hpbar-track"><div class="hpbar-fill" style="width:${Math.max(0,m.hp/m.baseHp*100)}%"></div></div></div>`;
    if(!dis) opt.onclick = ()=> forced ? forcedSwitchTo(i) : playerAct({kind:"switch", index:i});
    panel.appendChild(opt);
  });
  if(!forced){
    const cancel = document.createElement("button"); cancel.className = "btn ghost"; cancel.textContent = "Cancel";
    cancel.onclick = ()=> { panel.className="moves-grid"; buildActionPanel(); }; panel.appendChild(cancel);
  }
}

function aiPickAction() {
  const f = activeFoe(), p = activePlayer();
  const personality = AI_PERSONALITIES[battle.personality] || AI_PERSONALITIES.balanced;
  const aliveFoes = battle.foe.filter(m => !m.fainted);
  
  const bestPlyrMove = p.moves.reduce((best, mv) => {
    const s = mv.power * typeMultiplier(mv.type, f.type);
    return s > (best?.score || -1) ? {mv, score: s} : best;
  }, null);
  const aiAtDisadvantage = bestPlyrMove && bestPlyrMove.score > 80;
  
  if (aliveFoes.length > 1 && aiAtDisadvantage && (f.hp / f.baseHp) <= personality.switchBelowHpPct && Math.random() < personality.switchChance) {
    let bestSwitch = null, bestResist = -1;
    aliveFoes.forEach(candidate => {
      if (candidate.uid === f.uid) return;
      let totalDmg = 0;
      p.moves.forEach(mv => { totalDmg += mv.power * typeMultiplier(mv.type, candidate.type); });
      const avgMult = totalDmg / (p.moves.length * 100);
      const resistScore = 1 - avgMult;
      if (resistScore > bestResist) { bestResist = resistScore; bestSwitch = candidate; }
    });
    if (bestSwitch) return {kind:"switch", index: battle.foe.indexOf(bestSwitch)};
  }
  
  let best = null, bScore = -1;
  f.moves.forEach(mv => {
    const mult = typeMultiplier(mv.type, p.type);
    const weatherMult = getWeatherMult(mv.type, p.type);
    const accFactor = Math.pow(mv.acc / 100, personality.accWeight);
    const stabBonus = mv.type === f.type ? personality.stabBonus : 1;
    const effPower = mv.power * stabBonus;
    const typeWeight = mult > 1 ? 1.3 : mult < 1 ? 0.7 : 1;
    const s = effPower * mult * weatherMult * typeWeight * accFactor * personality.dmgWeight;
    if (s > bScore) { bScore = s; best = mv; }
  });
  return {kind:"move", move: best || f.moves[0]};
}

function playerAct(action){
  if(!awaitingInput || battle.over) return; 
  awaitingInput = false;
  document.getElementById("action-panel").innerHTML = "";
  const aiAct = aiPickAction();
  resolveTurn(action, aiAct);
}

async function resolveTurn(pAct, aiAct) {
  const logLines = []; 
  let pActs = true, aiActs = true;

  // Real-time UI log updater
  const updateLog = () => {
    const logEl = document.getElementById("battle-log");
    logEl.innerHTML = logLines.join("<br>");
    logEl.scrollTop = logEl.scrollHeight;
  };

  // Phase 1: Handling Switches Instantly
  if(pAct.kind === "switch"){ 
    battle.pIndex = pAct.index; 
    logLines.push(`You send out <b>${activePlayer().name}</b>!`); 
    pActs = false; 
    updateLog();
    await delay(1000); 
  }
  
  if(aiAct.kind === "switch"){ 
    battle.fIndex = aiAct.index; 
    logLines.push(`${battle.opponentName} sends out <b>${activeFoe().name}</b>!`); 
    aiActs = false; 
    updateLog();
    await delay(1000); 
  }
  
  // Setup order
  const order = [];
  if(pActs && aiActs) order.push(...(activePlayer().spd >= activeFoe().spd ? ["p","f"] : ["f","p"]));
  else if(aiActs) order.push("f");
  else if(pActs) order.push("p");
  
  // Phase 2: Execute attacks in order WITH delay
  for (let i = 0; i < order.length; i++) {
    if (battle.over) break;
    const side = order[i];
    const atk = side === "p" ? activePlayer() : activeFoe();
    const def = side === "p" ? activeFoe() : activePlayer();
    
    if(atk.fainted || def.fainted) continue;

    // Freeze check
    if (atk.statusSkipTurns > 0) {
      logLines.push(`${atk.name} is frozen solid and can't move!`);
      atk.statusSkipTurns--;
      if (atk.statusSkipTurns <= 0) cureStatus(atk);
      renderBattle(false);
      updateLog();
      if (i < order.length - 1) await delay(1800);
      continue;
    }

    // Burn damage
    if (atk.statusEffects && atk.statusEffects.includes("burn") && !atk.fainted) {
      const tick = resolveStatusTick(atk);
      if (tick && tick !== "skip") {
        logLines.push(`${atk.name} took ${tick} burn damage.`);
        if (atk.hp <= 0) { 
            atk.fainted = true; 
            logLines.push(`<b>${atk.name} fainted from burn!</b>`); 
            renderBattle(false); 
            updateLog();
            break; 
        }
      }
    }

    const mv = side==="p" ? pAct.move : aiAct.move;
    
    if(mv.type !== "neutral" && Math.random()*100 > mv.acc) { 
        logLines.push(`${atk.name} used ${mv.name} but missed!`); 
        updateLog();
        if (i < order.length - 1) await delay(1800);
        continue; 
    }
    
    const mult = typeMultiplier(mv.type, def.type);
    const weatherMult = getWeatherMult(mv.type, def.type);
    if(mult === 0) { 
        logLines.push(`${atk.name}'s ${mv.name} had no effect on ${def.name}.`); 
        updateLog();
        if (i < order.length - 1) await delay(1800);
        continue; 
    }
    
    const isCrit = Math.random() < 0.08;
    const atkMult = (atk.statusAtkMult || 1);
    let raw = (atk.atk * atkMult / def.effDef) * mv.power * 0.5 * mult * weatherMult * (0.85 + Math.random()*0.15);
    if (isCrit) raw *= 1.8;
    if(def.item === "guardcharm") raw *= 0.9;
    let dmg = Math.max(1, Math.round(raw));
    
    if (isCrit) playCritSound(); else playHitSound(mv.type === "stone" ? 100 : mv.type === "gale" ? 200 : 150);
    
    const atkEl = document.getElementById(side==="p"?"player-mon":"foe-mon");
    atkEl.classList.remove("lunge-r","lunge-l"); void atkEl.offsetWidth; atkEl.classList.add(side==="p"?"lunge-r":"lunge-l");
    
    if(!def.itemUsed && def.item === "steadfastsash" && dmg >= def.hp) { dmg = def.hp - 1; def.itemUsed = true; logLines.push(`${def.name} hung on using Steadfast Sash!`); }
    def.hp = Math.max(0, def.hp - dmg);
    
    let dmgLog = `${atk.name} used ${mv.name} for ${dmg} damage.`;
    if (isCrit) dmgLog += " <b style='color:var(--danger);'>Critical hit!</b>";
    if(mult>1) dmgLog += " <b style='color:var(--gold)'>Super effective!</b>";
    if(weatherMult !== 1) dmgLog += weatherMult > 1 ? " <span style='color:var(--warn)'>Weather boosted!</span>" : " <span style='color:var(--text-dim)'>Weather dampened...</span>";
    logLines.push(dmgLog);

    if (!def.statusEffects || def.statusEffects.length === 0) {
      const statusChance = { ember:0.2, aqua:0.2, verdant:0, volt:0.2, stone:0, gale:0 };
      const statusMap = { ember:"burn", aqua:"freeze", volt:"burn", gale:"freeze" };
      if (statusChance[mv.type] && Math.random() < statusChance[mv.type]) {
        const applied = applyStatus(def, statusMap[mv.type]);
        if (applied) logLines.push(`<b>${def.name} was ${STATUS_EFFECTS[statusMap[mv.type]].icon} ${STATUS_EFFECTS[statusMap[mv.type]].name}ed!</b>`);
      }
    }
    
    const defEl = document.getElementById(side==="p"?"foe-mon":"player-mon");
    defEl.classList.remove("hit"); void defEl.offsetWidth; defEl.classList.add(isCrit ? "crit-hit" : "hit");
    
    const arena = document.getElementById("arena");
    arena.classList.remove("shake"); void arena.offsetWidth; arena.classList.add("shake");
    
    const dmgFloat = document.createElement("div");
    dmgFloat.className = "dmg-float" + (isCrit ? " crit" : "");
    dmgFloat.textContent = dmg;
    const defRect = defEl.getBoundingClientRect(), arenaRect = arena.getBoundingClientRect();
    dmgFloat.style.left = (defRect.left - arenaRect.left + defRect.width/2 - 20) + "px";
    dmgFloat.style.top = (defRect.top - arenaRect.top + 10) + "px";
    arena.appendChild(dmgFloat);
    setTimeout(() => dmgFloat.remove(), 1000);
    
    if(!def.fainted && def.hp > 0 && def.hp / def.baseHp <= 0.25 && def.item === "vitalberry" && !def.itemUsed) {
      def.itemUsed = true;
      const heal = Math.round(def.baseHp * 0.25);
      def.hp = Math.min(def.baseHp, def.hp + heal);
      playHealSound();
      logLines.push(`<b>${def.name} consumed its Vital Berry and healed ${heal} HP!</b>`);
    }
    
    if(!def.fainted && def.hp > 0 && def.statusEffects && def.statusEffects.length > 0 && def.hp / def.baseHp <= 0.30 && def.item === "puredew" && !def.itemUsed) {
      def.itemUsed = true;
      const cured = [...def.statusEffects];
      cureStatus(def);
      logLines.push(`<b>${def.name} consumed Pure Dew and cured ${cured.map(k=>STATUS_EFFECTS[k].icon).join("")}!</b>`);
    }

    if (!def.fainted && def.hp > 0 && def.statusEffects && def.statusEffects.includes("poison")) {
      const tick = resolveStatusTick(def);
      if (tick && tick !== "skip") {
        logLines.push(`${def.name} took ${tick} poison damage.`);
        if (def.hp <= 0) { def.fainted = true; logLines.push(`<b>${def.name} fainted from poison!</b>`); }
      }
    }

    if(def.hp <= 0){
      def.fainted = true; 
      logLines.push(`<b>${def.name} fainted!</b>`);
      defEl.classList.add("faint"); 
      setTimeout(()=>defEl.classList.remove("faint"), 500);
    }
    
    renderBattle(false);
    updateLog();

    // The magical turn pacing delay!
    if(activePlayer().fainted || activeFoe().fainted) break;
    if (i < order.length - 1) await delay(1800); 
  }
  
  // Phase 3: Post-turn cleanup (Weather & checking for end of battle)
  renderBattle(false);
  advanceWeather();
  if (weather.type !== "none") {
    const w = WEATHER_CONDITIONS[weather.type];
    logLines.push(`<span style="color:${w.color}">${w.icon} ${w.name} (${weather.turnsLeft}t)</span>`);
    updateLog();
  }

  // Brief pause before fading to switch UI or game over
  await delay(1200);

  if(battle.player.every(m=>m.fainted)) return endBattle(false);
  if(battle.foe.every(m=>m.fainted)) return endBattle(true);
  
  if(activeFoe().fainted){ 
      battle.fIndex = battle.foe.findIndex(m=>!m.fainted); 
      logLines.push(`${battle.opponentName} sends out <b>${activeFoe().name}</b>!`); 
      updateLog();
      renderBattle(true); 
  }
  if(activePlayer().fainted){ 
      renderBattle(true); 
      logLines.push("<b>Choose your next rift-form!</b>");
      updateLog();
      return openSwitchPanel(true); 
  }
  
  awaitingInput = true; 
  buildActionPanel();
}

function forcedSwitchTo(i){ 
    battle.pIndex = i; 
    renderBattle(true); 
    document.getElementById("battle-log").innerHTML = `You send out <b>${activePlayer().name}</b>!`; 
    awaitingInput = true; 
    buildActionPanel(); 
}

function endBattle(won){
  battle.over = true;
  if (won) playVictorySound(); else playDefeatSound();

  if (battle.survival) {
    if (typeof handleSurvivalWaveEnd === "function") handleSurvivalWaveEnd(won);
    return;
  }
  if (battle.tournament) {
    if (typeof processTourneyMatchEnd === "function") processTourneyMatchEnd(won);
    return;
  }

  document.getElementById("end-banner").textContent = won ? "VICTORY" : "DEFEAT";
  document.getElementById("end-banner").className = "end-banner " + (won ? "win":"lose");

  const vpChange = won ? 30 : -15;
  const xpReward = won ? 200 : 50;
  const goldReward = won ? 85 : 20;
  const tierXpReward = won ? 60 : 10;
  
  const format = typeof window.formatNum === "function" ? window.formatNum : (n => n);
  const trackQuest = typeof window.trackQuestProgress === "function" ? window.trackQuestProgress : (() => {});
  const addTier = typeof window.addTierXp === "function" ? window.addTierXp : (() => false);

  save.vp = Math.max(0, save.vp + vpChange);
  if (won) trackQuest("win_battles", 1);
  trackQuest("earn_gold", goldReward);
  save.gold += goldReward;
  save.playerXp += xpReward;
  if(won) save.wins++; else save.losses++;
  
  let playerLvlUp = false;
  while(save.playerXp >= getPlayerMaxXp(save.playerLevel)) {
    save.playerXp -= getPlayerMaxXp(save.playerLevel); save.playerLevel++; save.gems += 50; playerLvlUp = true;
  }
  
  const tierLvlUp = addTier(tierXpReward);
  
  battle.player.forEach(m => {
    let mSave = save.mons.find(x => x.uid === m.uid);
    if(mSave) {
      mSave.xp += xpReward;
      while(mSave.xp >= getMonMaxXp(mSave.level)) { mSave.xp -= getMonMaxXp(mSave.level); mSave.level++; }
    }
  });
  
  saveGame(); refreshHome();

  document.getElementById("end-rewards").innerHTML = `
    <div class="item"><span>Tier XP</span> <span>+${tierXpReward} ${tierLvlUp?"(TIER UP!)":""}</span></div>
    <div class="item"><span>Player XP</span> <span>+${xpReward} ${playerLvlUp?"(LVL UP!)":""}</span></div>
    <div class="item"><span>Roster XP</span> <span>+${xpReward} (x3)</span></div>
    <div class="item"><span>Gold</span> <span>+${format(goldReward)}</span></div>
  `;
  document.getElementById("end-vp").textContent = (vpChange>0?"+":"") + format(vpChange) + " VP";
  document.getElementById("end-vp").className = "vp-change " + (vpChange>0?"pos":"neg");
  document.getElementById("end-rank").textContent = `Now ${format(save.vp)} VP — ${rankForVP(save.vp)}`;

  setTimeout(()=> show("screen-end"), 600);
}

if(document.getElementById("btn-rematch")) {
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
