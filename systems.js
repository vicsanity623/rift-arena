"use strict";

// --- DAILY QUESTS ---
const QUEST_POOL = [
  { type: "win_battles", target: 3, desc: "Win 3 Ranked Battles", reward: { gems: 20, gold: 150 } },
  { type: "win_battles", target: 5, desc: "Win 5 Ranked Battles", reward: { gems: 40, gold: 300 } },
  { type: "earn_gold", target: 500, desc: "Earn 500 Gold", reward: { gems: 15, gold: 100 } },
  { type: "earn_gold", target: 1000, desc: "Earn 1,000 Gold", reward: { gems: 30, gold: 250 } },
  { type: "explore", target: 1, desc: "Complete 1 Expedition", reward: { gems: 10, gold: 100 } },
  { type: "explore", target: 3, desc: "Complete 3 Expeditions", reward: { gems: 25, gold: 200 } },
  { type: "level_up", target: 2, desc: "Level Up Any Rift-Form 2 Times", reward: { gems: 15, gold: 150 } },
  { type: "level_up", target: 5, desc: "Level Up Any Rift-Form 5 Times", reward: { gems: 35, gold: 300 } },
  { type: "summon", target: 1, desc: "Summon 1 Creature", reward: { gems: 10, gold: 50 } },
  { type: "summon", target: 3, desc: "Summon 3 Creatures", reward: { gems: 25, gold: 150 } },
];

function getDateString() {
  return new Date().toISOString().slice(0, 10);
}

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h) + seed.charCodeAt(i);
    h = h & h;
  }
  return function() {
    h = (h * 16807) % 2147483647;
    return (h - 1) / 2147483646;
  };
}

function generateDailyQuests() {
  const date = getDateString();
  const rng = seededRandom("rift_quests_" + date);
  const shuffled = [...QUEST_POOL].sort(() => rng() - 0.5);
  return shuffled.slice(0, 3).map(q => ({
    ...q,
    progress: 0,
    claimed: false,
    id: q.type + "_" + date + "_" + Math.floor(rng() * 1000)
  }));
}

function ensureDailyQuests() {
  if (!save.dailyQuests || save.dailyQuests.date !== getDateString()) {
    save.dailyQuests = {
      date: getDateString(),
      quests: generateDailyQuests()
    };
    saveGame();
  }
}

function trackQuestProgress(type, amount) {
  ensureDailyQuests();
  let anyChanged = false;
  save.dailyQuests.quests.forEach(q => {
    if (!q.claimed && q.type === type) {
      q.progress = Math.min(q.target, q.progress + amount);
      if (q.progress >= q.target) anyChanged = true;
    }
  });
  if (anyChanged) saveGame();
}

function initQuestsUI() {
  ensureDailyQuests();
  const container = document.getElementById("quests-content");
  container.innerHTML = "";

  save.dailyQuests.quests.forEach((q, i) => {
    const done = q.progress >= q.target;
    const claimed = q.claimed;
    const pct = Math.min(100, (q.progress / q.target) * 100);

    const card = document.createElement("div");
    card.className = "details-card quest-card" + (claimed ? " claimed" : "");
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:14px;">${q.desc}</div>
          <div class="quest-progress" style="margin-top:6px;">
            <div class="xp-bar" style="width:100%;"><div class="xp-fill" style="width:${pct}%;"></div></div>
            <div style="font-size:11px; color:var(--text-dim); font-family:var(--mono); margin-top:2px;">${q.progress}/${q.target}</div>
          </div>
          <div style="font-size:11px; color:var(--gold); margin-top:4px;">
            <span>🪙 ${formatNum(q.reward.gold)}</span>
            <span style="margin-left:8px;">💎 ${formatNum(q.reward.gems)}</span>
          </div>
        </div>
        <button class="btn ghost quest-claim-btn" style="width:auto; padding:8px 16px; flex-shrink:0;" ${!done || claimed ? 'disabled' : ''}>
          ${claimed ? "Claimed" : done ? "Claim" : "—"}
        </button>
      </div>
    `;

    if (done && !claimed) {
      card.querySelector(".quest-claim-btn").onclick = () => claimQuestReward(i);
    }

    container.appendChild(card);
  });

  const allClaimed = save.dailyQuests.quests.every(q => q.claimed);
  document.getElementById("quests-dash-status").textContent = allClaimed ? "Done!" : save.dailyQuests.quests.filter(q => q.progress >= q.target && !q.claimed).length + " ready";
}

function claimQuestReward(index) {
  const q = save.dailyQuests.quests[index];
  if (!q || q.claimed || q.progress < q.target) return;

  q.claimed = true;
  save.gold += q.reward.gold;
  save.gems += q.reward.gems;
  saveGame();
  refreshHome();
  initQuestsUI();
  alert(`Quest complete!\n\nRewards:\n🪙 ${formatNum(q.reward.gold)} Gold\n💎 ${formatNum(q.reward.gems)} Gems`);
}

// --- TRAINING DOJO SYSTEM ---
const DOJO_TRAININGS = {
  light:   { name:"Light Sparring",   durMs: 60000,   xpMult:1,   goldCost:0,   desc:"1 min · Low XP" },
  medium:  { name:"Medium Training",  durMs: 180000,  xpMult:3,   goldCost:50,  desc:"3 min · Medium XP" },
  intense: { name:"Intense Regimen",  durMs: 300000,  xpMult:6,   goldCost:150, desc:"5 min · High XP" }
};

function initDojoUI() {
  const container = document.getElementById("dojo-content");
  container.innerHTML = "";

  if (save.dojo && save.dojo.active) {
    const timeLeft = Math.max(0, save.dojo.endTime - Date.now());
    const mins = Math.ceil(timeLeft / 60000);
    const secs = Math.ceil((timeLeft % 60000) / 1000);
    const m = getMonData(save.dojo.uid);
    const training = DOJO_TRAININGS[save.dojo.type];

    if (timeLeft <= 0) {
      container.innerHTML = `
        <div class="details-card" style="text-align:center;">
          <h3>Training Complete!</h3>
          <p>${m.name} has finished ${training.name}.</p>
          <button class="btn gold" id="btn-claim-dojo">Claim Rewards</button>
        </div>
      `;
      document.getElementById("btn-claim-dojo").onclick = claimDojo;
    } else {
      container.innerHTML = `
        <div class="details-card" style="text-align:center;">
          <h3>Training in Progress</h3>
          <div class="orb mon-big-orb t-${m.type}" style="margin:20px auto;"><div class="glyph"></div></div>
          <p>${m.name} is training (${training.name})...</p>
          <p style="font-family:var(--mono); color:var(--warn); font-size:24px;">${mins}:${String(secs).padStart(2,"0")} remaining</p>
        </div>
      `;
    }
  } else {
    const eligibleMons = save.mons.filter(m => !m.onExpedition);
    if (eligibleMons.length === 0) {
      container.innerHTML = `<p>No Rift-forms available to train.</p>`;
      return;
    }

    let selectHtml = `<select id="dojo-mon-select" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">`;
    eligibleMons.forEach(m => {
      const data = getMonData(m.uid);
      selectHtml += `<option value="${m.uid}">${data.name} (Lv.${data.level})</option>`;
    });
    selectHtml += `</select>`;

    let trainingHtml = `<div class="dojo-options">`;
    Object.keys(DOJO_TRAININGS).forEach(key => {
      const t = DOJO_TRAININGS[key];
      trainingHtml += `
        <label class="dojo-option" data-key="${key}">
          <input type="radio" name="dojo-type" value="${key}" ${key === "light" ? "checked" : ""}>
          <div class="dojo-option-content">
            <div class="dojo-option-name">${t.name}</div>
            <div class="dojo-option-desc">${t.desc}</div>
            <div class="dojo-option-cost">${t.goldCost > 0 ? `🪙 ${t.goldCost}` : "Free"}</div>
          </div>
        </label>
      `;
    });
    trainingHtml += `</div>`;

    container.innerHTML = `
      <div class="details-card">
        <h3>Training Dojo</h3>
        <p class="subtitle">Send a Rift-form to train and earn XP.</p>
        <label style="font-size:12px; color:var(--text-dim);">Select Rift-form:</label>
        ${selectHtml}
        <label style="font-size:12px; color:var(--text-dim); margin-top:10px;">Select Training:</label>
        ${trainingHtml}
        <button class="btn gold" id="btn-start-dojo" style="margin-top:20px;">Start Training</button>
      </div>
    `;

    document.getElementById("btn-start-dojo").onclick = () => {
      const uid = document.getElementById("dojo-mon-select").value;
      const typeEl = document.querySelector('input[name="dojo-type"]:checked');
      if (!typeEl) return alert("Select a training type.");
      const type = typeEl.value;
      const training = DOJO_TRAININGS[type];

      if (save.gold < training.goldCost) return alert(`Not enough gold. Need ${training.goldCost} 🪙.`);

      save.gold -= training.goldCost;
      const monState = save.mons.find(m => m.uid === uid);
      monState.onExpedition = true; // reuse expedition flag to block battle

      save.dojo = {
        active: true,
        uid: uid,
        type: type,
        endTime: Date.now() + training.durMs
      };
      saveGame();
      initDojoUI();
    };
  }
}

function claimDojo() {
  const mSave = save.mons.find(m => m.uid === save.dojo.uid);
  const training = DOJO_TRAININGS[save.dojo.type];

  const xpGained = training.xpMult * 75;
  const goldGained = training.xpMult * 5;

  mSave.xp += xpGained;
  mSave.onExpedition = false;

  while (mSave.xp >= getMonMaxXp(mSave.level)) {
    mSave.xp -= getMonMaxXp(mSave.level);
    mSave.level++;
  }

  save.dojo = { active: false };
  saveGame();

  alert(`Training complete!\n\n${mSave.baseId} gained ${xpGained} XP\n${formatNum(goldGained)} Gold earned`);
  refreshHome();
  show("screen-home");
}

// --- SURVIVAL MODE ---
let survivalState = null;

function startSurvivalMode() {
  const pData = pickOrder.map(uid => getMonData(uid));
  if (pData.length !== 3) return alert("Select 3 Rift-forms first.");

  const avgLevel = Math.max(1, Math.floor(pData.reduce((s, m) => s + m.level, 0) / 3));

  survivalState = {
    wave: 1,
    player: pData.map(m => {
      m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
      m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
      m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
      return m;
    }),
    pIndex: 0,
    rewards: { gold: 0, gems: 0, xp: 0, vp: 0 },
    over: false
  };

  generateSurvivalWave();
}

function generateSurvivalWave() {
  const wave = survivalState.wave;
  const baseLvl = Math.max(1, Math.floor(
    survivalState.player.reduce((s, m) => s + m.level, 0) / 3
  ) + wave - 1);

  const trainer = TRAINER_TEMPLATES[Math.floor(Math.random() * TRAINER_TEMPLATES.length)];
  let oppIds;
  if (trainer.theme) {
    const themes = trainer.theme.includes("+") ? trainer.theme.split("+") : [trainer.theme];
    let pool = [];
    themes.forEach(t => {
      if (THEMED_ROSTER[t]) pool = pool.concat(THEMED_ROSTER[t]);
    });
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

  // Refill alive player mons, keep dead ones dead
  survivalState.player.forEach(m => {
    if (!m.fainted) {
      m.hp = m.baseHp;
      m.statusEffects = [];
      m.statusAtkMult = 1;
      m.statusSkipTurns = 0;
      m.itemUsed = false;
    }
  });
  survivalState.pIndex = survivalState.player.findIndex(m => !m.fainted);
  if (survivalState.pIndex === -1) survivalState.pIndex = 0;

  battle = {
    player: survivalState.player,
    foe: oppIds.map(id => instantiateFoe(id, baseLvl)),
    pIndex: survivalState.pIndex,
    fIndex: 0,
    opponentName: trainer.name + ` (Wave ${survivalState.wave})`,
    personality: trainer.personality,
    over: false,
    survival: true
  };

  const weatherKeys = Object.keys(WEATHER_CONDITIONS).filter(k => k !== "none");
  if (Math.random() < 0.30) {
    const wType = weatherKeys[Math.floor(Math.random() * weatherKeys.length)];
    setWeather(wType, 3 + Math.floor(Math.random() * 3));
  } else {
    setWeather("none", 0);
  }

  show("screen-battle");
  document.getElementById("battle-log").textContent = `Survival — Wave ${survivalState.wave} against ${trainer.name}!`;
  renderBattle(true);
}

function handleSurvivalWaveEnd(won) {
  if (won) {
    survivalState.wave++;
    const waveRewards = {
      gold: 50 + survivalState.wave * 25,
      gems: 5 + survivalState.wave * 2,
      xp: 100 + survivalState.wave * 50,
      vp: 10 + survivalState.wave * 5
    };
    survivalState.rewards.gold += waveRewards.gold;
    survivalState.rewards.gems += waveRewards.gems;
    survivalState.rewards.xp += waveRewards.xp;
    survivalState.rewards.vp += waveRewards.vp;

    // Grant survival rewards
    save.gold += waveRewards.gold;
    save.gems += waveRewards.gems;
    save.playerXp += waveRewards.xp;

    while (save.playerXp >= getPlayerMaxXp(save.playerLevel)) {
      save.playerXp -= getPlayerMaxXp(save.playerLevel);
      save.playerLevel++;
      save.gems += 50;
    }

    battle.player.forEach(m => {
      let mSave = save.mons.find(x => x.uid === m.uid);
      if (mSave) {
        mSave.xp += waveRewards.xp;
        while (mSave.xp >= getMonMaxXp(mSave.level)) { mSave.xp -= getMonMaxXp(mSave.level); mSave.level++; }
      }
    });

    saveGame();

    // Check if any player mons died
    if (battle.player.every(m => m.fainted)) {
      survivalLost();
      return;
    }

    // Show wave victory screen with Continue / Retreat
    showSurvivalWaveEndUI(waveRewards);
  } else {
    survivalLost();
  }
}

function showSurvivalWaveEndUI(waveRewards) {
  const container = document.getElementById("app");
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));

  const survivalEl = document.createElement("section");
  survivalEl.className = "screen active";
  survivalEl.id = "screen-survival-end";
  survivalEl.innerHTML = `
    <div class="end-wrap" style="flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:10px;">
      <div class="end-banner win" style="font-size:28px;">Wave ${survivalState.wave - 1} Cleared!</div>
      <div class="rewards-box" style="background:var(--card-hi); border:1px solid var(--line); border-radius:12px; padding:16px; min-width:200px; display:flex; flex-direction:column; gap:6px;">
        <div class="item"><span>Wave Gold</span><span>+${formatNum(waveRewards.gold)}</span></div>
        <div class="item"><span>Wave Gems</span><span>+${formatNum(waveRewards.gems)}</span></div>
        <div class="item"><span>Wave XP</span><span>+${formatNum(waveRewards.xp)}</span></div>
        <div class="item" style="border-top:1px solid var(--line); padding-top:6px; margin-top:4px; color:var(--gold);">
          <span>Total Rewards</span><span>🪙${formatNum(survivalState.rewards.gold)} 💎${formatNum(survivalState.rewards.gems)}</span>
        </div>
      </div>
      <p style="font-size:13px; color:var(--text-dim);">Next wave: +${survivalState.wave * 5}% difficulty</p>
      <div style="display:flex; gap:10px; width:100%; max-width:300px;">
        <button class="btn gold" id="btn-survival-continue">Continue (Wave ${survivalState.wave})</button>
        <button class="btn ghost" id="btn-survival-retreat">Retreat</button>
      </div>
    </div>
  `;

  document.getElementById("app").appendChild(survivalEl);

  document.getElementById("btn-survival-continue").onclick = () => {
    survivalEl.remove();
    generateSurvivalWave();
  };

  document.getElementById("btn-survival-retreat").onclick = () => {
    survivalEl.remove();
    survivalComplete();
  };
}

function survivalLost() {
  survivalState.over = true;
  const survived = survivalState.wave - 1;
  alert(`Defeated at Wave ${survivalState.wave}!\n\nYou earned ${formatNum(survivalState.rewards.gold)} Gold, ${formatNum(survivalState.rewards.gems)} Gems over ${survived} waves.`);
  survivalState = null;
  pickOrder = [];
  refreshHome();
  show("screen-home");
}

function survivalComplete() {
  const waves = survivalState.wave - 1;
  const msg = `Survival complete! Cleared ${waves} waves.\n\nFinal Rewards: 🪙${formatNum(survivalState.rewards.gold)} 💎${formatNum(survivalState.rewards.gems)}`;
  alert(msg);
  playVictorySound();
  survivalState = null;
  pickOrder = [];
  refreshHome();
  show("screen-home");
}

// --- NUMBER FORMATTING ---
function formatNum(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return Math.floor(num).toString();
}

// --- TIER SYSTEM ---
function getTierMaxXp(lvl) { return lvl * 200; }
function addTierXp(amount) {
  save.tierXp += amount;
  let leveledUp = false;
  while(save.tierXp >= getTierMaxXp(save.tierLevel)) {
    save.tierXp -= getTierMaxXp(save.tierLevel);
    save.tierLevel++;
    leveledUp = true;
  }
  return leveledUp;
}

// --- EXPLORE SYSTEM ---
function initExploreUI() {
  const container = document.getElementById("explore-content");
  container.innerHTML = "";

  if (save.explore && save.explore.active) {
    // Active Expedition
    const timeLeft = Math.max(0, save.explore.endTime - Date.now());
    const mins = Math.ceil(timeLeft / 60000);
    const m = getMonData(save.explore.uid);

    if (timeLeft <= 0) {
      container.innerHTML = `
        <div class="details-card" style="text-align:center;">
          <h3>Expedition Complete!</h3>
          <p>${m.name} has returned.</p>
          <button class="btn gold" id="btn-claim-explore">Claim Rewards</button>
        </div>
      `;
      document.getElementById("btn-claim-explore").onclick = claimExplore;
    } else {
      container.innerHTML = `
        <div class="details-card" style="text-align:center;">
          <h3>Expedition in Progress</h3>
          <div class="orb mon-big-orb t-${m.type}" style="margin: 20px auto;"><div class="glyph"></div></div>
          <p>${m.name} is exploring...</p>
          <p style="font-family:var(--mono); color:var(--warn); font-size:24px;">${mins}m remaining</p>
        </div>
      `;
    }
  } else {
    // Setup new expedition
    const eligibleMons = save.mons.filter(m => !m.onExpedition);
    if (eligibleMons.length === 0) {
      container.innerHTML = `<p>No Rift-forms available to explore.</p>`;
      return;
    }

    let selectHtml = `<select id="explore-mon-select" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">`;
    eligibleMons.forEach(m => {
      const data = getMonData(m.uid);
      selectHtml += `<option value="${m.uid}">${data.name} (Lv.${data.level})</option>`;
    });
    selectHtml += `</select>`;

    container.innerHTML = `
      <div class="details-card">
        <h3>Start Expedition</h3>
        <p class="subtitle">Send a Rift-form away to find XP, Gold, Gems, and rare items.</p>
        <label style="font-size:12px; color:var(--text-dim);">Select Rift-form:</label>
        ${selectHtml}
        
        <label style="font-size:12px; color:var(--text-dim); margin-top:10px;">Select Duration:</label>
        <select id="explore-time-select" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">
          <option value="2">2 Minutes (Quick)</option>
          <option value="30">30 Minutes (Normal)</option>
          <option value="120">2 Hours (Deep Hunt)</option>
        </select>
        
        <button class="btn gold" id="btn-start-explore" style="margin-top:20px;">Start Hunt</button>
      </div>
    `;

    document.getElementById("btn-start-explore").onclick = () => {
      const uid = document.getElementById("explore-mon-select").value;
      const mins = parseInt(document.getElementById("explore-time-select").value);
      const monState = save.mons.find(m => m.uid === uid);
      
      monState.onExpedition = true;
      save.explore = {
        active: true,
        uid: uid,
        durationMins: mins,
        endTime: Date.now() + (mins * 60000)
      };
      saveGame();
      initExploreUI();
    };
  }
}

function claimExplore() {
  const mSave = save.mons.find(m => m.uid === save.explore.uid);
  const dur = save.explore.durationMins;
  
  // Calculate Rewards
  const xpGained = dur * 25;
  const goldGained = dur * 10;
  const gemsGained = Math.floor(dur / 5);
  const vpGained = dur * 2;
  
  mSave.xp += xpGained;
  mSave.onExpedition = false;
  save.gold += goldGained;
  save.gems += gemsGained;
  save.vp += vpGained;
  
  let rareMsg = "";
  // 10% chance per 30 mins to find a rare spawn
  if (Math.random() < (dur / 300)) { 
    const oppPool = ROSTER_DEF.map(r=>r[0]);
    const rareId = oppPool[Math.floor(Math.random()*oppPool.length)];
    const def = ROSTER_DEF.find(r => r[0] === rareId);
    save.mons.push({ uid: Date.now().toString(), baseId: rareId, level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false, evolved: false });
    rareMsg = `<br><br>✨ <b>RARE FIND!</b> Found a wild ${def[1]}!`;
  }
  
  save.explore = { active: false };
  saveGame();
  
  alert(`Expedition complete!\n\n${xpGained} Mon XP\n${formatNum(goldGained)} Gold\n${formatNum(gemsGained)} Gems\n${vpGained} VP${rareMsg}`);
  refreshHome();
  show("screen-home");
}

function updateExploreDash() {
  if (save.explore && save.explore.active) {
    const timeLeft = save.explore.endTime - Date.now();
    if (timeLeft <= 0) document.getElementById("explore-status").textContent = "Completed!";
    else document.getElementById("explore-status").textContent = Math.ceil(timeLeft/60000) + "m left";
  } else {
    document.getElementById("explore-status").textContent = "Ready";
  }
}

setInterval(updateExploreDash, 5000);

// --- DOJO STATUS ON DASHBOARD ---
function updateDojoDash() {
  if (save.dojo && save.dojo.active) {
    const timeLeft = save.dojo.endTime - Date.now();
    if (timeLeft <= 0) document.getElementById("dojo-status").textContent = "Complete!";
    else {
      const mins = Math.floor(timeLeft / 60000);
      const secs = Math.floor((timeLeft % 60000) / 1000);
      document.getElementById("dojo-status").textContent = mins + ":" + String(secs).padStart(2,"0") + " left";
    }
  } else {
    document.getElementById("dojo-status").textContent = "Training";
  }
}

setInterval(updateDojoDash, 5000);

// --- MERGE SYSTEM ---
function initMergeUI() {
  const container = document.getElementById("merge-content");
  container.innerHTML = "";

  // Group by baseId
  const groups = {};
  save.mons.forEach(m => {
    if (m.onExpedition) return; // Cant merge exploring mons
    if (!groups[m.baseId]) groups[m.baseId] = [];
    groups[m.baseId].push(m);
  });

  let foundAny = false;
  Object.keys(groups).forEach(baseId => {
    const arr = groups[baseId];
    if (arr.length >= 4) {
      foundAny = true;
      const def = ROSTER_DEF.find(r => r[0] === baseId);
      
      const card = document.createElement("div");
      card.className = "details-card";
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h3>${def[1]}</h3>
            <p class="subtitle">You have ${arr.length} available.</p>
          </div>
          <div class="orb sm t-${def[2]}"><div class="glyph"></div></div>
        </div>
        <button class="btn gold">Merge 4 ${def[1]}s</button>
      `;
      
      card.querySelector("button").onclick = () => {
        // Sort by level descending, keep the strongest 1, sacrifice bottom 3
        arr.sort((a,b) => b.level - a.level);
        const keeper = arr[0];
        const sacs = arr.slice(arr.length - 3); // Get 3 weakest
        
        // Remove sacs from save.mons
        sacs.forEach(sac => {
          save.mons = save.mons.filter(m => m.uid !== sac.uid);
        });

        // Boost keeper 3 times (5% each)
        const stats = ["hp", "atk", "def", "spd"];
        let boostLog = [];
        for (let i=0; i<3; i++) {
          const stat = stats[Math.floor(Math.random()*stats.length)];
          keeper.mergeBonuses[stat] = (keeper.mergeBonuses[stat] || 0) + 0.05;
          boostLog.push(stat.toUpperCase());
        }
        
        saveGame();
        alert(`Merge successful!\n3 duplicates destroyed.\nYour strongest ${def[1]} gained +5% bonuses in: ${boostLog.join(", ")}`);
        initMergeUI();
      };
      
      container.appendChild(card);
    }
  });

  if (!foundAny) {
    container.innerHTML = `<p>You don't have 4 of the same Rift-form available to merge.</p>`;
  }
}

// --- BAG SYSTEM ---
function initBagUI() {
  const container = document.getElementById("bag-content");
  container.innerHTML = "";
  
  if (!save.bag) save.bag = { vitalberry: 5, quickfeather: 1, ironscale: 1, guardcharm: 1, steadfastsash: 1, puredew: 1 };

  Object.keys(save.bag).forEach(itemKey => {
    const amt = save.bag[itemKey];
    if (amt > 0) {
      const itm = ITEMS[itemKey];
      const card = document.createElement("div");
      card.className = "switch-opt";
      card.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:14px;">${itm.name} (x${amt})</div>
          <div style="font-size:11px; color:var(--text-dim);">${itm.desc}</div>
        </div>
        <button class="btn ghost" style="width:auto; padding:6px 12px;">Equip</button>
      `;
      
      card.querySelector("button").onclick = () => showEquipSelect(itemKey);
      container.appendChild(card);
    }
  });
  
  if (container.innerHTML === "") {
    container.innerHTML = "<p>Your bag is empty.</p>";
  }
}

function showEquipSelect(itemKey) {
  const container = document.getElementById("bag-content");
  let html = `<div class="backrow"><button class="iconbtn" onclick="initBagUI()">←</button><h2>Select Mon for ${ITEMS[itemKey].name}</h2></div>`;
  html += `<div class="roster-grid">`;
  
  save.mons.forEach(m => {
    const data = getMonData(m.uid);
    html += `
      <div class="cmon-card" onclick="equipItem('${m.uid}', '${itemKey}')">
        <div class="row1"><div class="orb t-${data.type}"><div class="glyph"></div></div><div><div class="name">${data.name}</div></div></div>
        <div class="item">Currently: ${ITEMS[data.item]?.name || "None"}</div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function equipItem(uid, itemKey) {
  const mSave = save.mons.find(m => m.uid === uid);
  
  // If they already hold something, put it back in bag
  if (mSave.heldItem && mSave.heldItem !== "none") {
    save.bag[mSave.heldItem] = (save.bag[mSave.heldItem] || 0) + 1;
  }
  
  mSave.heldItem = itemKey;
  save.bag[itemKey]--;
  
  saveGame();
  alert("Item equipped!");
  initBagUI();
}

// --- SHOP / STORE ---
const SHOP_ITEMS = [
  { key:"vitalberry", name:"Vital Berry", desc:"Heals 25% at low HP", priceGold:80, priceGems:0, icon:"🫐" },
  { key:"quickfeather", name:"Quick Feather", desc:"+10% Speed", priceGold:150, priceGems:0, icon:"🪶" },
  { key:"ironscale", name:"Iron Scale", desc:"+15% Defense", priceGold:200, priceGems:0, icon:"🛡️" },
  { key:"guardcharm", name:"Guard Charm", desc:"-10% Dmg taken", priceGold:250, priceGems:0, icon:"🍀" },
  { key:"puredew", name:"Pure Dew", desc:"Cures status when HP<30%", priceGold:300, priceGems:0, icon:"💧" },
  { key:"steadfastsash", name:"Steadfast Sash", desc:"Survives lethal hit once", priceGold:400, priceGems:0, icon:"🧣" },
  { key:"gems_pack", name:"Gem Pack (50💎)", desc:"50 gems for gold", priceGold:500, priceGems:0, icon:"💎" },
];

const SHOP_REFRESH_KEY = "rift_shop_refresh";

function getShopStock() {
  if (!save.shopStock || save.shopStock.date !== getDateString()) {
    const rng = seededRandom("rift_shop_" + getDateString());
    const shuffled = [...SHOP_ITEMS].sort(() => rng() - 0.5);
    save.shopStock = {
      date: getDateString(),
      items: shuffled.slice(0, 4).map(item => ({
        ...item,
        stock: item.key === "gems_pack" ? 1 : 3 + Math.floor(rng() * 3)
      })),
      freeClaimed: false
    };
    saveGame();
  }
  return save.shopStock;
}

function initShopUI() {
  const container = document.getElementById("shop-content");
  container.innerHTML = "";

  const stock = getShopStock();

  // Free daily item
  const freeCard = document.createElement("div");
  freeCard.className = "details-card";
  freeCard.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center;">
      <div>
        <h3 style="margin:0;">🎁 Daily Free Item</h3>
        <p class="subtitle" style="margin:4px 0 0;">A free gift awaits you every day!</p>
      </div>
      <button class="btn gold" id="btn-free-shop" style="width:auto; padding:10px 20px;" ${stock.freeClaimed ? 'disabled' : ''}>
        ${stock.freeClaimed ? "Claimed" : "Claim"}
      </button>
    </div>
  `;
  container.appendChild(freeCard);

  if (!stock.freeClaimed) {
    document.getElementById("btn-free-shop").onclick = () => {
      const rng = seededRandom("rift_free_" + getDateString());
      const items = Object.keys(save.bag);
      const freeItem = items[Math.floor(rng() * items.length)];
      save.bag[freeItem] = (save.bag[freeItem] || 0) + 1;
      save.shopStock.freeClaimed = true;
      saveGame();
      alert(`🎁 Free item claimed: ${ITEMS[freeItem].name}!`);
      initShopUI();
    };
  }

  // Shop items
  stock.items.forEach((item, idx) => {
    const card = document.createElement("div");
    card.className = "details-card";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:14px;">${item.icon} ${item.name}</div>
          <div style="font-size:11px; color:var(--text-dim);">${item.desc}</div>
          <div style="font-size:11px; color:var(--gold-dim); margin-top:4px;">
            ${item.priceGold > 0 ? `🪙 ${item.priceGold}` : ""} ${item.priceGems > 0 ? `💎 ${item.priceGems}` : ""}
            <span style="margin-left:8px; color:var(--text-dim);">Stock: ${item.stock}</span>
          </div>
        </div>
        <button class="btn gold" id="btn-shop-buy-${idx}" style="width:auto; padding:10px 20px;" ${item.stock <= 0 ? 'disabled' : ''}>
          Buy
        </button>
      </div>
    `;
    container.appendChild(card);

    const buyBtn = document.getElementById("btn-shop-buy-" + idx);
    if (buyBtn && item.stock > 0) {
      buyBtn.onclick = () => purchaseShopItem(idx);
    }
  });
}

function purchaseShopItem(idx) {
  const stock = getShopStock();
  const item = stock.items[idx];
  if (!item || item.stock <= 0) return;

  if (item.key === "gems_pack") {
    if (save.gold < item.priceGold) return alert("Not enough gold!");
    save.gold -= item.priceGold;
    save.gems += 50;
  } else {
    if (save.gold < item.priceGold) return alert("Not enough gold!");
    save.gold -= item.priceGold;
    save.bag[item.key] = (save.bag[item.key] || 0) + 1;
  }

  item.stock--;
  saveGame();
  alert(`Purchased ${item.name}!`);
  initShopUI();
  refreshHome();
}