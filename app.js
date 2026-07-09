"use strict";

/* ============================= DATA ============================= */
function move(name, type, power, acc){ return {name, type, power, acc}; }
const BASH = move("Bash","neutral",35,100);

const MOVES = {
  ember:  move("Flame Burst","ember",60,95),
  aqua:   move("Tide Crash","aqua",60,95),
  verdant:move("Bramble Whip","verdant",60,95),
  volt:   move("Shock Bolt","volt",60,95),
  stone:  move("Rock Slam","stone",60,95),
  gale:   move("Wind Slash","gale",60,95)
};

const ITEMS = {
  quickfeather: { name:"Quick Feather", desc:"+10% Speed" },
  ironscale:    { name:"Iron Scale",    desc:"+15% Defense" },
  guardcharm:   { name:"Guard Charm",   desc:"-10% Dmg taken" },
  vitalberry:   { name:"Vital Berry",   desc:"Heals 25% at low HP" },
  steadfastsash:{ name:"Steadfast Sash",desc:"Survives lethal hit once" }
};

const ROSTER_DEF = [
  ["cindrake","Cindrake","ember",70,65,55,70,"quickfeather","Inferno Pounce","smooth"],
  ["pyrelope","Pyrelope","ember",75,80,60,85,"guardcharm","Solar Kick","spiky"],
  ["tidenne","Tidenne","aqua",80,60,65,60,"ironscale","Riptide Spin","smooth"],
  ["coralisk","Coralisk","aqua",90,70,85,50,"vitalberry","Abyssal Crush","angular"],
  ["verdil","Verdil","verdant",75,60,60,75,"quickfeather","Thicket Charge","smooth"],
  ["thornuke","Thornuke","verdant",95,75,90,40,"ironscale","Root Slam","spiky"],
  ["sparkit","Sparkit","volt",60,65,50,95,"quickfeather","Static Burst","smooth"],
  ["voltigo","Voltigo","volt",70,85,55,90,"steadfastsash","Thunder Fang","spiky"],
  ["pebblin","Pebblin","stone",85,60,90,45,"ironscale","Pebble Barrage","angular"],
  ["boulderon","Boulderon","stone",100,90,100,30,"guardcharm","Seismic Slam","spiky"],
  ["gustling","Gustling","gale",65,70,55,90,"quickfeather","Gale Dash","smooth"],
  ["zephyrn","Zephyrn","gale",75,85,60,100,"steadfastsash","Cyclone Strike","angular"]
];

const TYPE_CHART = {
  ember:   { verdant:2, aqua:0.5, stone:0.5 },
  aqua:    { ember:2, stone:2, verdant:0.5, volt:0.5 },
  verdant: { aqua:2, stone:2, ember:0.5, gale:0.5 },
  volt:    { aqua:2, gale:2, verdant:0.5, stone:0 },
  stone:   { ember:2, volt:2, gale:0.5, verdant:0.5 },
  gale:    { verdant:2, volt:0.5, stone:0.5 }
};

function typeMultiplier(atkType, defType){
  if(atkType === "neutral") return 1;
  const row = TYPE_CHART[atkType];
  return (row && defType in row) ? row[defType] : 1;
}

/* ============================= SAVE & PROGRESSION ============================= */
const SAVE_KEY = "rift_arena_rpg_v2";
function generateDefaultSave() {
  const save = {
    vp: 1000, wins: 0, losses: 0,
    playerLevel: 1, playerXp: 0, gold: 500, gems: 100,
    lastIdleClaim: Date.now(),
    roster: {}
  };
  // Starter unlocks
  ["cindrake", "tidenne", "verdil", "sparkit", "pebblin", "gustling"].forEach(id => {
    save.roster[id] = { level: 1, xp: 0, unlocked: true };
  });
  return save;
}

let save = (function(){
  try{
    const raw = localStorage.getItem(SAVE_KEY);
    if(raw) return {...generateDefaultSave(), ...JSON.parse(raw)};
  }catch(e){}
  return generateDefaultSave();
})();

function saveGame() { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); }

function getPlayerMaxXp(lvl) { return lvl * 150; }
function getMonMaxXp(lvl) { return lvl * lvl * 50; }

function getMonData(id) {
  const def = ROSTER_DEF.find(r => r[0] === id);
  const mSave = save.roster[id] || { level: 1, xp: 0, unlocked: false };
  const lvl = mSave.level;
  
  // Stat scaling: +5% base per level
  const scale = 1 + (lvl - 1) * 0.05;
  
  return {
    id: def[0], name: def[1], type: def[2], 
    baseHp: Math.floor(def[3] * scale),
    atk: Math.floor(def[4] * scale),
    def: Math.floor(def[5] * scale),
    spd: Math.floor(def[6] * scale),
    item: def[7], sigName: def[8], shape: def[9],
    level: lvl, xp: mSave.xp, unlocked: mSave.unlocked,
    maxXp: getMonMaxXp(lvl),
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
  btn.addEventListener("click", ()=> show(btn.getAttribute("data-back")));
});

/* ============================= DASHBOARD / HOME ============================= */
function refreshHome(){
  document.getElementById("player-level").textContent = "Lv." + save.playerLevel;
  const xpPct = (save.playerXp / getPlayerMaxXp(save.playerLevel)) * 100;
  document.getElementById("player-xp-fill").style.width = `${Math.min(100, xpPct)}%`;
  
  document.getElementById("res-gold").textContent = save.gold;
  document.getElementById("res-gems").textContent = save.gems;
  
  document.getElementById("home-rank").textContent = rankForVP(save.vp);
  document.getElementById("home-vp").textContent = save.vp + " VP";
}

setInterval(updateIdleText, 1000);
function updateIdleText() {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  document.getElementById("idle-status").textContent = mins > 0 ? `${mins}m stored` : "Claim";
}

document.getElementById("card-idle").addEventListener("click", () => {
  const diff = Date.now() - save.lastIdleClaim;
  const mins = Math.floor(diff / 60000);
  if (mins > 0) {
    const earned = mins * 2;
    save.gold += earned;
    save.lastIdleClaim = Date.now();
    saveGame();
    alert(`Claimed ${earned} Gold from Idle Base!`);
    refreshHome();
  } else {
    alert("Too soon to claim again. Base generates gold over time.");
  }
});

document.getElementById("card-summon").addEventListener("click", () => {
  if (save.gems < 100) return alert("Not enough gems. Earn gems by leveling up!");
  save.gems -= 100;
  
  const locked = ROSTER_DEF.filter(r => !save.roster[r[0]]?.unlocked);
  if (locked.length === 0) {
    save.gold += 1000;
    saveGame();
    refreshHome();
    return alert("Roster full! You got 1000 Gold instead.");
  }
  
  const choice = locked[Math.floor(Math.random() * locked.length)];
  save.roster[choice[0]] = { level: 1, xp: 0, unlocked: true };
  saveGame();
  refreshHome();
  alert(`✨ Summoned ${choice[1]}! Added to roster.`);
});

document.getElementById("card-battle").addEventListener("click", ()=>{ buildSelectGrid(); show("screen-select"); });
document.getElementById("card-roster").addEventListener("click", ()=>{ buildRosterView(); show("screen-roster"); });

document.getElementById("card-settings").addEventListener("click", ()=>{
  if(confirm("Hard Reset Game Data?")) { save = generateDefaultSave(); saveGame(); refreshHome(); }
});

refreshHome();

/* ============================= ROSTER & DETAILS ============================= */
function statLine(m){ return `HP ${m.baseHp} · ATK ${m.atk} · DEF ${m.def} · SPD ${m.spd}`; }

function buildRosterView(){
  const grid = document.getElementById("roster-view-grid");
  grid.innerHTML = "";
  
  ROSTER_DEF.forEach(r => {
    const m = getMonData(r[0]);
    const card = document.createElement("div");
    card.className = "cmon-card " + (m.unlocked ? "" : "locked");
    card.innerHTML = `
      <div class="row1">
        <div class="orb t-${m.type}"><div class="glyph"></div></div>
        <div style="flex:1;">
          <div class="name">${m.name} <span class="badge">Lv.${m.level}</span></div>
          <div class="type">${m.type}</div>
        </div>
      </div>
      <div class="xp-bar" style="width:100%; margin-top:4px;"><div class="xp-fill" style="width:${(m.xp/m.maxXp)*100}%"></div></div>
    `;
    if (m.unlocked) card.addEventListener("click", () => showMonDetails(m));
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
      ${drawStat("HP", m.baseHp, 200)}
      ${drawStat("ATK", m.atk, 150)}
      ${drawStat("DEF", m.def, 150)}
      ${drawStat("SPD", m.spd, 150)}
    </div>
    
    <div style="font-size:12px; color:var(--text-dim); text-align:center; margin-top:10px;">
      Held item: ${ITEMS[m.item].name} — ${ITEMS[m.item].desc}
    </div>
    
    <button class="btn gold" id="btn-lvlup" style="margin-top:10px;">Level Up (${upgCost} Gold)</button>
  `;
  
  show("screen-details");
  
  document.getElementById("btn-lvlup").addEventListener("click", () => {
    if (save.gold < upgCost) return alert("Not enough gold.");
    save.gold -= upgCost;
    save.roster[m.id].level++;
    saveGame();
    refreshHome();
    showMonDetails(getMonData(m.id)); // Re-render
  });
}

/* ============================= TEAM SELECT ============================= */
let pickOrder = [];

function buildSelectGrid(){
  pickOrder = [];
  const grid = document.getElementById("select-grid");
  grid.innerHTML = "";
  
  ROSTER_DEF.forEach(r => {
    const m = getMonData(r[0]);
    if (!m.unlocked) return;
    
    const card = document.createElement("div");
    card.className = "cmon-card";
    card.dataset.id = m.id;
    card.innerHTML = `
      <div class="pickbadge" style="display:none;"></div>
      <div class="row1">
        <div class="orb t-${m.type}"><div class="glyph"></div></div>
        <div>
          <div class="name">${m.name} <span class="badge">Lv.${m.level}</span></div>
          <div class="type">${m.type}</div>
        </div>
      </div>
      <div class="stats">${statLine(m)}</div>
    `;
    card.addEventListener("click", ()=> togglePick(m.id, card));
    grid.appendChild(card);
  });
  updateConfirmBtn();
}

function togglePick(id, card){
  const idx = pickOrder.indexOf(id);
  if(idx >= 0){
    pickOrder.splice(idx,1);
    card.classList.remove("picked");
    card.querySelector(".pickbadge").style.display = "none";
  } else {
    if(pickOrder.length >= 3) return;
    pickOrder.push(id);
    card.classList.add("picked");
    const badge = card.querySelector(".pickbadge");
    badge.style.display = "flex";
    badge.textContent = pickOrder.length;
  }
  document.querySelectorAll("#select-grid .cmon-card").forEach(c=>{
    const i = pickOrder.indexOf(c.dataset.id);
    const badge = c.querySelector(".pickbadge");
    if(i >= 0){ badge.style.display="flex"; badge.textContent = i+1; c.classList.add("picked"); }
    else { badge.style.display="none"; c.classList.remove("picked"); }
  });
  updateConfirmBtn();
}

function updateConfirmBtn(){
  const btn = document.getElementById("btn-confirm-team");
  btn.textContent = `Confirm Team (${pickOrder.length}/3)`;
  btn.disabled = pickOrder.length !== 3;
}

document.getElementById("btn-confirm-team").addEventListener("click", ()=>{
  if(pickOrder.length !== 3) return;
  startPrep(pickOrder.slice());
});

/* ============================= BATTLE SYSTEM ============================= */
let battle = null;

function instantiate(m) {
  return {
    ...m,
    effDef: Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1)),
    hp: m.baseHp, itemUsed: false, fainted: false
  };
}

function startPrep(playerIds){
  const avgPLevel = Math.max(1, Math.floor(playerIds.reduce((sum, id) => sum + getMonData(id).level, 0) / 3));
  
  // Opponents AI scales with player's average level + rank bonus
  const rankBonus = Math.floor(save.vp / 1000); 
  const aiLvl = Math.max(1, avgPLevel + rankBonus - 1);

  const oppPool = ROSTER_DEF.map(r=>r[0]);
  const oppIds = oppPool.sort(()=>Math.random()-0.5).slice(0,3);

  battle = {
    player: playerIds.map(id => instantiate(getMonData(id))),
    foe: oppIds.map(id => {
      const b = getMonData(id);
      b.level = aiLvl;
      b.baseHp = Math.floor(b.baseHp * (1 + (aiLvl-1)*0.05));
      b.atk = Math.floor(b.atk * (1 + (aiLvl-1)*0.05));
      b.def = Math.floor(b.def * (1 + (aiLvl-1)*0.05));
      b.spd = Math.floor(b.spd * (1 + (aiLvl-1)*0.05));
      return instantiate(b);
    }),
    pIndex: 0, fIndex: 0,
    opponentName: ["Epidemic","Nightshard","Vellum","Kestrix","Rowan","Ashvale"][Math.floor(Math.random()*6)],
    over: false
  };

  document.getElementById("prep-player-name").textContent = "You";
  document.getElementById("prep-foe-name").textContent = battle.opponentName;
  
  const pSlotsEl = document.getElementById("prep-player-slots");
  const fSlotsEl = document.getElementById("prep-foe-slots");
  pSlotsEl.innerHTML = ""; fSlotsEl.innerHTML = "";
  battle.player.forEach((m,i)=> pSlotsEl.insertAdjacentHTML("beforeend", `<div class="prep-slot ${i===0?'lead':''}"><div class="n">${i+1}</div><div class="nm">${m.name}</div></div>`));
  battle.foe.forEach((m,i)=> fSlotsEl.insertAdjacentHTML("beforeend", `<div class="prep-slot ${i===0?'lead':''} hidden"><div class="n">${i+1}</div><div class="nm">???</div></div>`));

  show("screen-prep");
  runPrepTimer();
}

let prepTimerHandle = null;
function runPrepTimer(){
  let t = 4;
  document.getElementById("prep-clock").textContent = "00:04";
  clearInterval(prepTimerHandle);
  prepTimerHandle = setInterval(()=>{
    t--;
    if(t <= 0){ clearInterval(prepTimerHandle); revealFoeAndBattle(); return; }
    document.getElementById("prep-clock").textContent = "00:0" + t;
  }, 1000);
}
document.getElementById("btn-skip-prep").addEventListener("click", ()=>{ clearInterval(prepTimerHandle); revealFoeAndBattle(); });

function revealFoeAndBattle(){
  document.querySelectorAll("#prep-foe-slots .prep-slot").forEach((el,i)=>{ el.classList.remove("hidden"); el.querySelector(".nm").textContent = battle.foe[i].name; });
  setTimeout(()=>{
    show("screen-battle");
    document.getElementById("battle-log").textContent = `A ranked match against ${battle.opponentName} has begun!`;
    renderBattle(true);
  }, 500);
}

function activePlayer(){ return battle.player[battle.pIndex]; }
function activeFoe(){ return battle.foe[battle.fIndex]; }

function renderBattle(fullRebuild){
  const p = activePlayer(), f = activeFoe();
  document.getElementById("ally-name").textContent = p.name;
  document.getElementById("ally-level").textContent = "Lv." + p.level;
  document.getElementById("foe-name").textContent = f.name;
  document.getElementById("foe-level").textContent = "Lv." + f.level;

  document.getElementById("ally-hp").style.width = Math.max(0,(p.hp/p.baseHp*100)) + "%";
  document.getElementById("foe-hp").style.width = Math.max(0,(f.hp/f.baseHp*100)) + "%";

  if(fullRebuild){
    document.getElementById("ally-orb").className = "orb sm t-" + p.type;
    document.getElementById("foe-orb").className = "orb sm t-" + f.type;
    document.getElementById("player-mon").className = "mon " + p.shape + " t-" + p.type;
    document.getElementById("foe-mon").className = "mon " + f.shape + " t-" + f.type;
    buildActionPanel();
  }
}

function buildActionPanel(){
  const panel = document.getElementById("action-panel");
  panel.className = "moves-grid"; panel.innerHTML = "";
  activePlayer().moves.forEach(mv=>{
    const btn = document.createElement("button"); btn.className = "movebtn";
    btn.innerHTML = `<span class="mv-nm">${mv.name}</span><span class="mv-sub">${mv.type.toUpperCase()} · PWR ${mv.power}</span>`;
    btn.onclick = ()=> playerAct({kind:"move", move:mv});
    panel.appendChild(btn);
  });
  const swBtn = document.createElement("button"); swBtn.className = "movebtn switchbtn";
  swBtn.innerHTML = `<span class="mv-nm">Switch Out</span><span class="mv-sub">Change active</span>`;
  swBtn.onclick = ()=> openSwitchPanel(false);
  panel.appendChild(swBtn);
}

function openSwitchPanel(forced){
  const panel = document.getElementById("action-panel");
  panel.className = "switch-panel"; panel.innerHTML = "";
  battle.player.forEach((m,i)=>{
    const dis = m.fainted || i === battle.pIndex;
    const opt = document.createElement("div");
    opt.className = "switch-opt" + (dis ? " disabled":"");
    opt.innerHTML = `
      <div class="orb sm t-${m.type}"><div class="glyph"></div></div>
      <div class="mini-hp"><div class="nmrow" style="font-size:12px;"><span>${m.name}</span><span>${m.fainted?"Fainted":Math.round(m.hp)+"/"+m.baseHp}</span></div>
      <div class="hpbar-track"><div class="hpbar-fill" style="width:${Math.max(0,m.hp/m.baseHp*100)}%"></div></div></div>
    `;
    if(!dis) opt.onclick = ()=> forced ? forcedSwitchTo(i) : playerAct({kind:"switch", index:i});
    panel.appendChild(opt);
  });
  if(!forced){
    const cancel = document.createElement("button"); cancel.className = "btn ghost"; cancel.textContent = "Cancel";
    cancel.onclick = ()=> { panel.className="moves-grid"; buildActionPanel(); };
    panel.appendChild(cancel);
  }
}

let awaitingInput = true;
function playerAct(action){
  if(!awaitingInput || battle.over) return;
  awaitingInput = false;
  document.getElementById("action-panel").innerHTML = "";

  const f = activeFoe(), p = activePlayer();
  let best = f.moves[0], bScore = -1;
  f.moves.forEach(mv => {
    const s = mv.power * typeMultiplier(mv.type, p.type);
    if(s > bScore) { bScore = s; best = mv; }
  });
  
  resolveTurn(action, {kind:"move", move:best});
}

function computeDamage(atk, def, mv){
  if(mv.type !== "neutral" && Math.random()*100 > mv.acc) return {miss:true};
  const mult = typeMultiplier(mv.type, def.type);
  if(mult === 0) return {miss:false, dmg:0, mult};
  let raw = (atk.atk / def.effDef) * mv.power * 0.5 * mult * (0.85 + Math.random()*0.15);
  if(def.item === "guardcharm") raw *= 0.9;
  return {miss:false, dmg:Math.max(1, Math.round(raw)), mult};
}

function resolveTurn(pAct, aiAct){
  const logLines = [];
  let pActs = true, aiActs = true;
  
  if(pAct.kind === "switch"){
    battle.pIndex = pAct.index;
    logLines.push(`You send out <b>${activePlayer().name}</b>!`);
    pActs = false;
  }
  
  const order = [];
  if(pActs && aiActs) order.push(...(activePlayer().spd >= activeFoe().spd ? ["p","f"] : ["f","p"]));
  else if(aiActs) order.push("f");
  
  function doMove(side){
    if(battle.over) return;
    const atk = side==="p"? activePlayer():activeFoe(), def = side==="p"? activeFoe():activePlayer();
    if(atk.fainted || def.fainted) return;
    
    const mv = side==="p"? pAct.move : aiAct.move;
    const res = computeDamage(atk, def, mv);
    const label = side==="p"? atk.name : battle.opponentName+"'s "+atk.name;
    
    const atkEl = document.getElementById(side==="p"?"player-mon":"foe-mon");
    atkEl.classList.remove("lunge-r","lunge-l"); void atkEl.offsetWidth; atkEl.classList.add(side==="p"?"lunge-r":"lunge-l");
    
    if(res.miss) return logLines.push(`${label} missed!`);
    
    let dmg = res.dmg;
    if(!def.itemUsed && def.item === "steadfastsash" && dmg >= def.hp) { dmg = def.hp - 1; def.itemUsed = true; }
    def.hp = Math.max(0, def.hp - dmg);
    
    logLines.push(`${label} used ${mv.name} for ${dmg} damage.` + (res.mult>1?" <b style='color:var(--gold)'>Super effective!</b>":""));
    
    const defEl = document.getElementById(side==="p"?"foe-mon":"player-mon");
    defEl.classList.remove("hit"); void defEl.offsetWidth; defEl.classList.add("hit");
    
    if(def.hp <= 0){
      def.fainted = true;
      logLines.push(`<b>${def.name} fainted!</b>`);
      defEl.classList.add("faint"); setTimeout(()=>defEl.classList.remove("faint"), 500);
    }
    renderBattle(false);
  }
  
  order.forEach(doMove);
  document.getElementById("battle-log").innerHTML = logLines.join("<br>");
  
  setTimeout(()=>{
    if(battle.player.every(m=>m.fainted)) return endBattle(false);
    if(battle.foe.every(m=>m.fainted)) return endBattle(true);
    
    if(activeFoe().fainted){
      battle.fIndex = battle.foe.findIndex(m=>!m.fainted);
      document.getElementById("battle-log").innerHTML = `${battle.opponentName} sends out <b>${activeFoe().name}</b>!`;
      renderBattle(true);
    }
    if(activePlayer().fainted){
      renderBattle(true);
      document.getElementById("battle-log").innerHTML = "<b>Choose your next rift-form!</b>";
      return openSwitchPanel(true);
    }
    awaitingInput = true;
    buildActionPanel();
  }, 750);
}

function forcedSwitchTo(i){
  battle.pIndex = i; renderBattle(true);
  document.getElementById("battle-log").innerHTML = `You send out <b>${activePlayer().name}</b>!`;
  awaitingInput = true; buildActionPanel();
}

function endBattle(won){
  battle.over = true;
  document.getElementById("end-banner").textContent = won ? "VICTORY" : "DEFEAT";
  document.getElementById("end-banner").className = "end-banner " + (won ? "win":"lose");

  const vpChange = won ? 25 : -12;
  const xpReward = won ? 150 : 30;
  const goldReward = won ? 60 : 15;
  
  save.vp = Math.max(0, save.vp + vpChange);
  save.gold += goldReward;
  save.playerXp += xpReward;
  if(won) save.wins++; else save.losses++;
  
  // Level up checks
  let playerLvlUp = false;
  while(save.playerXp >= getPlayerMaxXp(save.playerLevel)) {
    save.playerXp -= getPlayerMaxXp(save.playerLevel);
    save.playerLevel++;
    save.gems += 50; // reward gems for leveling
    playerLvlUp = true;
  }
  
  battle.player.forEach(m => {
    let mSave = save.roster[m.id];
    mSave.xp += xpReward;
    while(mSave.xp >= getMonMaxXp(mSave.level)) {
      mSave.xp -= getMonMaxXp(mSave.level);
      mSave.level++;
    }
  });
  
  saveGame();
  refreshHome();

  document.getElementById("end-rewards").innerHTML = `
    <div class="item"><span>Player XP</span> <span>+${xpReward} ${playerLvlUp?"(LEVEL UP!)":""}</span></div>
    <div class="item"><span>Roster XP</span> <span>+${xpReward} (x3)</span></div>
    <div class="item"><span>Gold</span> <span>+${goldReward}</span></div>
  `;
  
  document.getElementById("end-vp").textContent = (vpChange>0?"+":"") + vpChange + " VP";
  document.getElementById("end-vp").className = "vp-change " + (vpChange>0?"pos":"neg");
  document.getElementById("end-rank").textContent = `Now ${save.vp} VP — ${rankForVP(save.vp)}`;

  setTimeout(()=> show("screen-end"), 600);
}
