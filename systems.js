"use strict";

// --- CUSTOM MODAL NOTIFICATION SYSTEM ---
function showModal(opts) {
  const overlay = document.getElementById("modal-overlay");
  if (!overlay) return;
  const title = opts.title || "Notification";
  const icon = opts.icon || "📢";
  const message = opts.message || "";
  const buttons = opts.buttons || [{ label: "OK", primary: true }];
  const modalTitle = document.getElementById("modal-title");
  const modalIcon = document.getElementById("modal-icon");
  const modalBody = document.getElementById("modal-body");
  const modalFooter = document.getElementById("modal-footer");
  if (modalIcon) modalIcon.textContent = icon;
  if (modalTitle) modalTitle.textContent = title;
  if (modalBody) modalBody.innerHTML = message;
  if (modalFooter) {
    modalFooter.innerHTML = "";
    buttons.forEach((btn, idx) => {
      const b = document.createElement("button");
      b.className = "modal-btn" + (btn.primary ? " primary" : " secondary");
      b.textContent = btn.label || "OK";
      b.onclick = () => {
        overlay.classList.remove("active");
        if (btn.action) setTimeout(btn.action, 50);
        else if (btn.callback) setTimeout(btn.callback, 50);
      };
      modalFooter.appendChild(b);
    });
  }
  overlay.classList.add("active");
}

// --- DAILY LOGIN REWARDS ---
const DAILY_LOGIN_REWARDS = [
  { day: 1,  items: [{ type: "gold", amount: 100 }, { type: "gems", amount: 10 }] },
  { day: 2,  items: [{ type: "gold", amount: 150 }, { type: "item", key: "vitalberry", amount: 1 }] },
  { day: 3,  items: [{ type: "gold", amount: 200 }, { type: "gems", amount: 15 }] },
  { day: 4,  items: [{ type: "gold", amount: 250 }, { type: "item", key: "quickfeather", amount: 1 }] },
  { day: 5,  items: [{ type: "gold", amount: 300 }, { type: "gems", amount: 25 }] },
  { day: 6,  items: [{ type: "gold", amount: 400 }, { type: "item", key: "ironscale", amount: 1 }] },
  { day: 7,  items: [{ type: "gold", amount: 500 }, { type: "gems", amount: 50 }] }
];

function ensureDailyLogin() {
  const today = getDateString();
  if (!save.dailyLogin || save.dailyLogin.date !== today) {
    const consecutive = save.dailyLogin && save.dailyLogin.date
      ? (isConsecutiveDay(save.dailyLogin.date, today) ? save.dailyLogin.streak + 1 : 1)
      : 1;
    save.dailyLogin = {
      date: today,
      streak: consecutive,
      claimed: false
    };
    saveGame();
  }
}

function isConsecutiveDay(lastDate, today) {
  const last = new Date(lastDate);
  const now = new Date(today);
  const diff = (now - last) / 86400000;
  return diff >= 0.9 && diff <= 1.5;
}

function claimDailyLogin() {
  ensureDailyLogin();
  if (save.dailyLogin.claimed) return showModal({ icon: "🎁", title: "Daily Login", message: "Daily reward already claimed today." });

  const dayIdx = ((save.dailyLogin.streak - 1) % 7);
  const reward = DAILY_LOGIN_REWARDS[dayIdx];

  reward.items.forEach(item => {
    if (item.type === "gold") {
      save.gold += item.amount;
    } else if (item.type === "gems") {
      save.gems += item.amount;
    } else if (item.type === "item") {
      if (!save.bag[item.key]) save.bag[item.key] = 0;
      save.bag[item.key] += item.amount;
    }
  });

  save.dailyLogin.claimed = true;
  saveGame();
  refreshHome();
  return { reward, streak: save.dailyLogin.streak };
}

function initDailyLoginUI() {
  ensureDailyLogin();

  // Dynamically update home screen dashboard status description
  const dashEl = document.getElementById("daily-login-dash");
  if (dashEl) {
    dashEl.textContent = save.dailyLogin.claimed ? "Claimed" : "Ready";
  }

  const container = document.getElementById("daily-login-content");
  if (!container) return;

  const today = getDateString();
  const streak = save.dailyLogin.streak;
  const claimed = save.dailyLogin.claimed;
  const dayIndex = ((streak - 1) % 7);
  const reward = DAILY_LOGIN_REWARDS[dayIndex];

  let html = `<div class="daily-login-header">
    <div class="login-streak">🔥 Day ${streak} Login Streak</div>
    <div class="login-date">${today}</div>
  </div>
  <div class="login-rewards-row">`;

  DAILY_LOGIN_REWARDS.forEach((r, i) => {
    const isCurrent = i === dayIndex;
    const isPast = streak > i + 1 || (streak === i + 1 && claimed);
    const cls = isCurrent && !claimed ? "login-day current" : isPast ? "login-day past" : "login-day future";
    const check = isPast ? "✓" : "";

    html += `<div class="${cls}">
      <div class="login-day-num">Day ${r.day}</div>
      <div class="login-day-rewards">${r.items.map(it => {
        if (it.type === "gold") return `🪙${it.amount}`;
        if (it.type === "gems") return `💎${it.amount}`;
        if (it.type === "item") return `${ITEMS[it.key] ? ITEMS[it.key].name : it.key}`;
        return "";
      }).join("<br>")}</div>
      <div class="login-check">${check}</div>
    </div>`;
  });

  html += `</div>
    <div class="daily-login-footer">
      ${!claimed ? `<button class="btn gold" id="btn-claim-daily">Claim Day ${streak} Rewards</button>` : `<button class="btn ghost" disabled>Claimed Today</button>`}
      <div style="font-size:11px; color:var(--text-dim); margin-top:8px;">${!claimed ? `Claim your Day ${((streak-1)%7)+1} rewards!` : "Come back tomorrow for more!"}</div>
    </div>`;

  container.innerHTML = html;

  const claimBtn = document.getElementById("btn-claim-daily");
  if (claimBtn) {
    claimBtn.onclick = () => {
      const result = claimDailyLogin();
      if (result) {
        const rewardDesc = result.reward.items.map(it => {
          if (it.type === "gold") return `${formatNum(it.amount)} 🪙`;
          if (it.type === "gems") return `${formatNum(it.amount)} 💎`;
          if (it.type === "item") return `${ITEMS[it.key] ? ITEMS[it.key].name : it.key}`;
          return "";
        }).join(", ");
        showModal({ icon: "🎉", title: `Day ${result.streak} Login Bonus`, message: `Received: ${rewardDesc}` });
        initDailyLoginUI();
      }
    };
  }
}

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
  showModal({ icon: "📋", title: "Quest Complete!", message: `Rewards:<br>🪙 ${formatNum(q.reward.gold)} Gold<br>💎 ${formatNum(q.reward.gems)} Gems` });
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
          <div class="orb mon-big-orb sprite-orb t-${m.type}" style="margin:20px auto;background-image:url('assets/creatures/${m.baseId}.PNG');transform:scale(2);"><div class="glyph"></div></div>
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
      if (!typeEl) return showModal({ icon: "🥋", title: "Dojo", message: "Select a training type." });
      const type = typeEl.value;
      const training = DOJO_TRAININGS[type];

      if (save.gold < training.goldCost) return showModal({ icon: "🪙", title: "Not Enough Gold", message: `Not enough gold. Need ${training.goldCost} 🪙.` });

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
  if (typeof trackAchievement === "function") trackAchievement("dojo_hours", training.durMs);
  saveGame();

  showModal({ icon: "🥋", title: "Training Complete!", message: `${mSave.baseId} gained ${xpGained} XP<br>${formatNum(goldGained)} Gold earned` });
  refreshHome();
  show("screen-home");
}

// --- SURVIVAL MODE ---
let survivalState = null;

function startSurvivalMode() {
  const pData = pickOrder.map(uid => getMonData(uid));
  if (pData.length !== 3) return showModal({ icon: "⚠️", title: "Team Selection", message: "Select 3 Rift-forms first." });

  const avgLevel = Math.max(1, Math.floor(pData.reduce((s, m) => s + m.level, 0) / 3));

  survivalState = {
    wave: 1,
    player: pData.map(m => {
      m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
      m.hp = m.baseHp; m.itemUsed = false; m.fainted = false;
      m.statusEffects = []; m.statusAtkMult = 1; m.statusSkipTurns = 0;
      m._baseSpd = m.spd; m._baseDef = m.def;
      if (typeof triggerPassiveOnInit === "function") triggerPassiveOnInit(m);
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
    survival: true,
    pCombo: [], fCombo: []
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
    const guildMults = typeof getGuildRewardMultipliers === "function" ? getGuildRewardMultipliers() : { gold: 1, xp: 1 };
    const waveRewards = {
      gold: Math.round((50 + survivalState.wave * 25) * guildMults.gold),
      gems: 5 + survivalState.wave * 2,
      xp: Math.round((100 + survivalState.wave * 50) * guildMults.xp),
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
  showModal({ icon: "💀", title: `Defeated at Wave ${survivalState.wave}`, message: `You earned ${formatNum(survivalState.rewards.gold)} Gold, ${formatNum(survivalState.rewards.gems)} Gems over ${survived} waves.` });
  survivalState = null;
  pickOrder = [];
  refreshHome();
  show("screen-home");
}

function survivalComplete() {
  const waves = survivalState.wave - 1;
  showModal({ icon: "🏆", title: "Survival Complete!", message: `Cleared ${waves} waves.<br><br>Final Rewards: 🪙${formatNum(survivalState.rewards.gold)} 💎${formatNum(survivalState.rewards.gems)}` });
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
          <div class="orb mon-big-orb sprite-orb t-${m.type}" style="margin:20px auto;background-image:url('assets/creatures/${m.baseId}.PNG');transform:scale(2);"><div class="glyph"></div></div>
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
  const guildMults = typeof getGuildRewardMultipliers === "function" ? getGuildRewardMultipliers() : { gold: 1, xp: 1, explore: 1 };
  
  // Calculate Rewards
  const xpGained = Math.round(dur * 25 * guildMults.xp * guildMults.explore);
  const goldGained = Math.round(dur * 10 * guildMults.gold * guildMults.explore);
  const gemsGained = Math.floor(dur / 5);
  const vpGained = dur * 2;
  
  mSave.xp += xpGained;
  mSave.onExpedition = false;
  save.gold += goldGained;
  save.gems += gemsGained;
  save.vp += vpGained;
  
  // Crafting materials scaled by duration
  const materials = {
    iron_ore: Math.floor(dur / 30) + 1,
    leather: Math.floor(dur / 30) + 1,
    cloth: Math.floor(dur / 30) + 1,
    crystal_shard: dur >= 120 ? 2 : dur >= 30 ? 1 : 0,
    essence_nature: dur >= 120 ? 1 : 0
  };
  let matMsg = "";
  Object.keys(materials).forEach(key => {
    const qty = materials[key];
    if (qty > 0) {
      if (!save.bag[key]) save.bag[key] = 0;
      save.bag[key] += qty;
      matMsg += `\n${ITEMS[key].name} x${qty}`;
    }
  });
  
  let rareMsg = "";
  // 10% chance per 30 mins to find a rare spawn
  if (Math.random() < (dur / 300)) { 
    const oppPool = ROSTER_DEF.map(r=>r[0]);
    const rareId = oppPool[Math.floor(Math.random()*oppPool.length)];
    const def = ROSTER_DEF.find(r => r[0] === rareId);
    save.mons.push({ uid: Date.now().toString(), baseId: rareId, level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false, evolved: false, variant: null, mp: 0, talents: [] });
    rareMsg = `<br><br>✨ <b>RARE FIND!</b> Found a wild ${def[1]}!`;
  }
  
  save.explore = { active: false };
  if (typeof trackQuestProgress === "function") trackQuestProgress("explore", 1);
  if (typeof trackAchievement === "function") trackAchievement("explore_complete", 1);
  if (typeof trackAchievement === "function") {
    const totalMats = Object.keys(materials).reduce((s, k) => s + materials[k], 0);
    if (totalMats > 0) trackAchievement("materials_found", totalMats);
  }
  saveGame();
  
  showModal({ icon: "🗺️", title: "Expedition Complete!", message: `${xpGained} Mon XP<br>${formatNum(goldGained)} Gold<br>${formatNum(gemsGained)} Gems<br>${vpGained} VP${matMsg.replace(/\n/g, "<br>")}${rareMsg}` });
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
        showModal({ icon: "🧬", title: "Merge Successful!", message: `3 duplicates destroyed.<br>Your strongest ${def[1]} gained +5% bonuses in: ${boostLog.join(", ")}` });
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
      if (itm && itm.slot === "material") return;
      const tierColor = TIER_COLORS[itm.tier] || "#a8a2c4";
      const card = document.createElement("div");
      card.className = "switch-opt";
      card.innerHTML = `
        <div style="flex:1;">
          <div style="font-weight:bold; font-size:14px;"><span style="color:${tierColor};">●</span> ${itm.name} <span style="font-size:10px;color:${tierColor};">[${TIER_NAMES[itm.tier]||itm.tier}]</span> <span style="font-size:10px;color:var(--text-dim);">(x${amt})</span></div>
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
  const isMaterial = ITEMS[itemKey] && ITEMS[itemKey].slot === "material";
  const slotType = ITEMS[itemKey] ? ITEMS[itemKey].slot : "accessory";
  
  let html = `<div class="backrow"><button class="iconbtn" onclick="initBagUI()">←</button><h2>Equip ${ITEMS[itemKey].name}</h2></div>`;
  html += `<p class="subtitle">Slot: ${slotType.charAt(0).toUpperCase() + slotType.slice(1)}</p>`;
  html += `<div class="roster-grid">`;
  
  save.mons.forEach(m => {
    const data = getMonData(m.uid);
    const currentEquip = m.equipment && m.equipment[slotType] ? m.equipment[slotType] : "none";
    html += `
      <div class="cmon-card" onclick="equipItemSlot('${m.uid}', '${itemKey}', '${slotType}')">
        <div class="row1"><div class="orb t-${data.type}"><div class="glyph"></div></div><div><div class="name">${data.name}</div></div></div>
        <div class="item" style="font-size:10px;">${slotType}: ${ITEMS[currentEquip]?.name || "None"}</div>
      </div>
    `;
  });
  
  html += `</div>`;
  container.innerHTML = html;
}

function equipItemSlot(uid, itemKey, slotType) {
  const mSave = save.mons.find(m => m.uid === uid);
  if (!mSave) return;
  
  if (!mSave.equipment) {
    mSave.equipment = { weapon: "none", armor: "none", accessory: "none" };
  }
  
  const currentKey = mSave.equipment[slotType] || "none";
  if (currentKey !== "none") {
    save.bag[currentKey] = (save.bag[currentKey] || 0) + 1;
  }
  
  mSave.equipment[slotType] = itemKey;
  save.bag[itemKey] = (save.bag[itemKey] || 1) - 1;
  if (save.bag[itemKey] <= 0) delete save.bag[itemKey];
  
  // heldItem reflects accessory slot (for battle trigger items)
  mSave.heldItem = mSave.equipment.accessory || "none";

  saveGame();
  if (typeof trackAchievement === "function") trackAchievement("gear_equipped", 1);
  showModal({ icon: "🎒", title: "Equipment", message: `${ITEMS[itemKey].name} equipped to ${slotType} slot!` });
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
      showModal({ icon: "🎁", title: "Free Item", message: `${ITEMS[freeItem].name} claimed!` });
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
    if (save.gold < item.priceGold) return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Not enough gold!" });
    save.gold -= item.priceGold;
    save.gems += 50;
  } else {
    if (save.gold < item.priceGold) return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Not enough gold!" });
    save.gold -= item.priceGold;
    save.bag[item.key] = (save.bag[item.key] || 0) + 1;
  }

  item.stock--;
  saveGame();
  showModal({ icon: "🏪", title: "Purchase Complete", message: `Purchased ${item.name}!` });
  initShopUI();
  refreshHome();
}

// --- LAB / BREEDING SYSTEM ---
function initLabUI() {
  const container = document.getElementById("lab-content");
  container.innerHTML = "";

  const eligibleMons = save.mons.filter(m => !m.onExpedition && m.level >= 10);
  if (eligibleMons.length < 2) {
    container.innerHTML = `<div class="details-card" style="text-align:center;">
      <h3>🧬 Breeding Lab</h3>
      <p style="color:var(--text-dim);">Need at least 2 Rift-forms at Lv.10+ to breed. Send them on expeditions or train them!</p>
      <button class="btn ghost" data-back="screen-home">Back</button>
    </div>`;
    return;
  }

  const breedCost = 300;

  let p1Html = `<select id="lab-parent1" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">`;
  let p2Html = `<select id="lab-parent2" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">`;
  eligibleMons.forEach(m => {
    const data = getMonData(m.uid);
    const vTag = m.variant ? ` ${VARIANTS[m.variant].icon}` : "";
    const opt = `<option value="${m.uid}">${vTag}${data.name} (Lv.${data.level})</option>`;
    p1Html += opt; p2Html += opt;
  });
  p1Html += `</select>`; p2Html += `</select>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px;">
      <div class="details-card" style="align-items:center; text-align:center;">
        <h3>Select Breeders</h3>
        <p class="subtitle">Breeding consumes the raw power of two high-level Rift-forms to synthesize a brand new Variant at Lv.1.</p>
      </div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <label style="font-size:12px; color:var(--text-dim);">Parent A (Lv.10+):</label>
        ${p1Html}
        <label style="font-size:12px; color:var(--text-dim); margin-top:4px;">Parent B (Lv.10+):</label>
        ${p2Html}
      </div>
      <div class="lab-preview" id="lab-preview" style="margin:12px 0; padding:12px; background:var(--card-hi); border-radius:12px; border:1px solid var(--line); text-align:center; min-height:60px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
        <div style="color:var(--text-dim); font-size:13px;">Select parents to see offspring preview</div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
        <span style="color:var(--gold); font-family:var(--mono);">🪙 ${formatNum(breedCost)}</span>
        <span id="lab-status" style="font-size:12px; color:var(--text-dim);"></span>
      </div>
      <button class="btn gold" id="btn-breed" disabled>🧬 Synthesize Variant</button>
    </div>
  `;

  function updateBreedPreview() {
    const uid1 = document.getElementById("lab-parent1").value;
    const uid2 = document.getElementById("lab-parent2").value;
    const btn = document.getElementById("btn-breed");
    const preview = document.getElementById("lab-preview");

    if (uid1 === uid2) {
      btn.disabled = true;
      btn.textContent = "Must Select Two Different Parents";
      preview.innerHTML = `<div style="color:var(--danger); font-size:13px;">⚠️ Select two different parent Rift-forms</div>`;
      return;
    }

    const m1 = save.mons.find(m => m.uid === uid1);
    const m2 = save.mons.find(m => m.uid === uid2);
    if (!m1 || !m2) return;

    const def1 = ROSTER_DEF.find(r => r[0] === m1.baseId);
    const def2 = ROSTER_DEF.find(r => r[0] === m2.baseId);

    // Seed preview based on IDs
    const chosenDef = Math.random() < 0.5 ? def1 : def2;
    const vKeys = Object.keys(VARIANTS);
    const mockVariant = vKeys[Math.floor(Math.random() * vKeys.length)];
    const vDef = VARIANTS[mockVariant];

    const canAfford = save.gold >= breedCost;
    btn.disabled = !canAfford;
    btn.textContent = canAfford ? `🧬 Synthesize Variant` : `Need ${formatNum(breedCost)} 🪙`;

    preview.innerHTML = `
      <div style="font-weight:bold; font-size:15px; color:var(--safe);"><span class="var-badge var-${mockVariant}" style="display:inline-block;">${vDef.icon}</span> ${vDef.name} ${chosenDef[1]}</div>
      <div style="font-size:12px; color:var(--text-dim); margin-top:2px;">Type: ${chosenDef[2]} · Stat Boosts on synthesis</div>
      <div style="font-size:11px; color:var(--gold-dim); margin-top:4px;">Gene Mix: ${def1[1]} × ${def2[1]}</div>
    `;
  }

  document.getElementById("lab-parent1").onchange = updateBreedPreview;
  document.getElementById("lab-parent2").onchange = updateBreedPreview;

  document.getElementById("btn-breed").onclick = () => {
    const uid1 = document.getElementById("lab-parent1").value;
    const uid2 = document.getElementById("lab-parent2").value;
    if (uid1 === uid2) return showModal({ icon: "🧬", title: "Breeding Lab", message: "Select two different parents!" });

    const m1 = save.mons.find(m => m.uid === uid1);
    const m2 = save.mons.find(m => m.uid === uid2);
    if (!m1 || !m2) return;

    if (save.gold < breedCost) return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Not enough gold!" });
    save.gold -= breedCost;

    const def1 = ROSTER_DEF.find(r => r[0] === m1.baseId);
    const def2 = ROSTER_DEF.find(r => r[0] === m2.baseId);

    // Breeders are consumed
    save.mons = save.mons.filter(m => m.uid !== uid1 && m.uid !== uid2);

    const chosenDef = Math.random() < 0.5 ? def1 : def2;
    const vKeys = Object.keys(VARIANTS);
    const childVariant = vKeys[Math.floor(Math.random() * vKeys.length)];
    const vDef = VARIANTS[childVariant];

    const uid = "breed_" + Date.now().toString() + Math.floor(Math.random() * 100);
    save.mons.push({
      uid, baseId: chosenDef[0], level: 1, xp: 0,
      heldItem: "none", mergeBonuses: {}, onExpedition: false,
      evolved: false, variant: childVariant, mp: 0, talents: []
    });

    saveGame();
    showModal({ icon: "🧬", title: "Gene Synthesis Complete!", message: `Both parents fused into a rare Variant:<br>${vDef.icon} ${vDef.name} ${chosenDef[1]} (Lv.1)!` });
    refreshHome();
    initLabUI();
  };

  updateBreedPreview();
}

// --- GUILD / CLAN SYSTEM ---
const GUILD_NAMES = [
  "Rift Wardens", "Ember Legion", "Abyss Stalkers", "Storm Vanguard",
  "Verdant Circle", "Crystal Sentinels", "Shadow Pact", "Thunder Cohort"
];

const GUILD_PERK_DEFS = {
  battle: { name: "Battle Boon", icon: "⚔️", desc: "Bonus gold from battles", basePct: 5, scalePerLvl: 2.5, unlockLvl: 1, maxPct: 30 },
  battleXp: { name: "Battle XP Boost", icon: "✨", desc: "Bonus XP from battles", basePct: 10, scalePerLvl: 3, unlockLvl: 2, maxPct: 40 },
  explore: { name: "Explorer's Grant", icon: "🗺️", desc: "Bonus explore rewards", basePct: 10, scalePerLvl: 5, unlockLvl: 1, maxPct: 50 },
  training: { name: "Training Accel", icon: "🥋", desc: "Reduced dojo training time", basePct: 20, scalePerLvl: 5, unlockLvl: 3, maxPct: 60 },
  shop: { name: "Merchant's Discount", icon: "🏪", desc: "Reduced shop prices", basePct: 10, scalePerLvl: 3, unlockLvl: 4, maxPct: 35 },
  goldFind: { name: "Gold Rush", icon: "🪙", desc: "Bonus gold from all sources", basePct: 8, scalePerLvl: 2, unlockLvl: 5, maxPct: 25 }
};

function getGuildPerkValue(perkKey, guildLevel) {
  const def = GUILD_PERK_DEFS[perkKey];
  if (!def) return 0;
  const raw = def.basePct + (guildLevel - def.unlockLvl) * def.scalePerLvl;
  return Math.min(def.maxPct, Math.max(0, raw));
}

function getGuildPerkDesc(perkKey, guildLevel) {
  const def = GUILD_PERK_DEFS[perkKey];
  if (!def) return "";
  const val = getGuildPerkValue(perkKey, guildLevel);
  if (perkKey === "training" || perkKey === "shop") {
    return `-${Math.round(val)}% ${def.desc.replace(/^Reduced |Reduced /, "").toLowerCase()}`;
  }
  return `+${Math.round(val)}% ${def.desc.replace(/^Bonus /, "").toLowerCase()}`;
}

function getUnlockedPerks(guildLevel) {
  return Object.keys(GUILD_PERK_DEFS).filter(k => GUILD_PERK_DEFS[k].unlockLvl <= guildLevel);
}

function getAllPerkKeys() {
  return Object.keys(GUILD_PERK_DEFS);
}

function initGuildUI() {
  const container = document.getElementById("guild-content");
  if (!container) return;

  container.innerHTML = "";

  if (save.guild) {
    showGuildDashboard(container);
  } else {
    showGuildCreate(container);
  }
}

function showGuildCreate(container) {
  const createCost = 500;
  const startPerks = getUnlockedPerks(1);
  container.innerHTML = `
    <div class="details-card" style="text-align:center;">
      <h3>🏰 Guild Hall</h3>
      <p class="subtitle">Join or create a guild to unlock clan perks and compete together!</p>
      <div style="margin:16px 0;">
        <div style="font-size:48px;">🏴</div>
        <p style="color:var(--text-dim); font-size:13px;">Create a guild for ${formatNum(createCost)} 🪙 and choose your name and starting perk.</p>
        <p style="color:var(--gold-dim); font-size:11px;">✦ More perks unlock as your guild grows (Lv.2, 3, 4, 5)!</p>
      </div>
      <label style="font-size:12px; color:var(--text-dim); display:block; text-align:left;">Guild Name:</label>
      <select id="guild-name-select" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">
        ${GUILD_NAMES.map(n => `<option value="${n}">${n}</option>`).join("")}
      </select>
      <label style="font-size:12px; color:var(--text-dim); display:block; text-align:left; margin-top:10px;">Starting Guild Perk:</label>
      <select id="guild-perk-select" class="btn ghost" style="border:1px solid var(--line); color:white; padding:10px;">
        ${startPerks.map(k => `<option value="${k}">${GUILD_PERK_DEFS[k].icon} ${GUILD_PERK_DEFS[k].name} — ${getGuildPerkDesc(k, 1)}</option>`).join("")}
      </select>
      <button class="btn gold" id="btn-create-guild" style="margin-top:16px;" ${save.gold < createCost ? 'disabled' : ''}>
        ${save.gold < createCost ? `Need ${formatNum(createCost)} 🪙` : `Create Guild (${formatNum(createCost)} 🪙)`}
      </button>
    </div>
  `;

  document.getElementById("btn-create-guild").onclick = () => {
    if (save.gold < createCost) return showModal({ icon: "🪙", title: "Not Enough Gold", message: `Not enough gold. Need ${formatNum(createCost)} 🪙.` });
    const name = document.getElementById("guild-name-select").value;
    const perk = document.getElementById("guild-perk-select").value;

    save.gold -= createCost;
    save.guild = {
      name: name,
      perk: perk,
      level: 1,
      xp: 0,
      members: 1,
      founded: Date.now(),
      donated: 0,
      perks: [perk]
    };
    saveGame();
    refreshHome();
    initGuildUI();
    const val = getGuildPerkValue(perk, 1);
    showModal({ icon: "🏴", title: "Guild Created!", message: `Guild "${name}" created!<br><br>Perk: ${GUILD_PERK_DEFS[perk].name}<br>${getGuildPerkDesc(perk, 1)}` });
  };
}

function showGuildDashboard(container) {
  const g = save.guild;
  if (!g.perks) g.perks = [g.perk];
  const guildXpNeeded = g.level * 300;
  const unlocked = getUnlockedPerks(g.level);
  const allKeys = getAllPerkKeys();

  let perksHtml = "";
  allKeys.forEach(k => {
    const def = GUILD_PERK_DEFS[k];
    const isUnlocked = unlocked.includes(k);
    const isOwned = g.perks.includes(k);
    const val = getGuildPerkValue(k, g.level);
    const cls = isOwned ? "guild-perk owned" : isUnlocked && !isOwned ? "guild-perk available" : "guild-perk locked";

    perksHtml += `<div class="${cls}">
      <div class="guild-perk-icon">${def.icon}</div>
      <div class="guild-perk-info">
        <div class="guild-perk-name">${def.name}</div>
        <div class="guild-perk-desc">${getGuildPerkDesc(k, g.level)}</div>
      </div>
      <div class="guild-perk-status">${isOwned ? '✓ Active' : isUnlocked ? '⚠️ Unlocked' : `🔒 Lv.${def.unlockLvl}`}</div>
    </div>`;
  });

  container.innerHTML = `
    <div class="details-card" style="text-align:center;">
      <div style="font-size:40px; margin-bottom:8px;">🏰</div>
      <h3>${g.name}</h3>
      <div style="display:flex; justify-content:center; gap:12px; margin:8px 0; flex-wrap:wrap;">
        <span style="font-family:var(--mono); font-size:13px; color:var(--text-dim);">Level ${g.level}</span>
        <span style="font-family:var(--mono); font-size:13px; color:var(--gold);">${g.perks.length} / ${allKeys.length} Perks</span>
        <span style="font-family:var(--mono); font-size:13px; color:var(--text-dim);">Members: ${g.members}</span>
      </div>
      <div class="xp-bar" style="width:100%; margin:8px 0;"><div class="xp-fill" style="width:${Math.min(100, (g.xp / guildXpNeeded) * 100)}%"></div></div>
      <div style="font-size:11px; color:var(--text-dim); font-family:var(--mono); margin-bottom:8px;">Guild XP: ${formatNum(g.xp)} / ${formatNum(guildXpNeeded)}</div>
    </div>
    <div class="details-card">
      <div style="font-weight:bold; font-size:14px; text-align:center; margin-bottom:8px;">🏅 Guild Perks</div>
      <div class="guild-perks-list">${perksHtml}</div>
      ${unlocked.filter(k => !g.perks.includes(k)).length > 0 ? `<button class="btn gold" id="btn-claim-perks" style="margin-top:8px;">Claim New Perks</button>` : ''}
    </div>
    <div class="details-card" style="flex-direction:row; justify-content:space-between; align-items:center;">
      <div>
        <div style="font-size:12px; color:var(--text-dim);">Contribute to the guild</div>
        <div style="font-size:11px; color:var(--gold-dim);">100 🪙 → 50 Guild XP</div>
      </div>
      <button class="btn gold" id="btn-guild-donate" style="width:auto; padding:10px 20px;">Donate</button>
    </div>
  `;

  const claimBtn = document.getElementById("btn-claim-perks");
  if (claimBtn) {
    claimBtn.onclick = () => {
      const newlyUnlocked = unlocked.filter(k => !g.perks.includes(k));
      if (newlyUnlocked.length > 0) {
        newlyUnlocked.forEach(k => { if (!g.perks.includes(k)) g.perks.push(k); });
        saveGame();
        showModal({ icon: "✨", title: "New Guild Perks!", message: `${newlyUnlocked.map(k => `${GUILD_PERK_DEFS[k].icon} ${GUILD_PERK_DEFS[k].name}: ${getGuildPerkDesc(k, g.level)}`).join("<br>")}` });
        refreshHome();
        initGuildUI();
      }
    };
  }

  document.getElementById("btn-guild-donate").onclick = () => {
    if (save.gold < 100) return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Need 100 gold to donate." });
    save.gold -= 100;
    save.guild.donated += 100;
    save.guild.xp += 50;
    const prevLevel = save.guild.level;
    while (save.guild.xp >= save.guild.level * 300) {
      save.guild.xp -= save.guild.level * 300;
      save.guild.level++;
    }
    if (save.guild.level > prevLevel) {
      const newUnlocked = getUnlockedPerks(save.guild.level).filter(k => !save.guild.perks.includes(k));
      let msg = `Guild leveled up to Lv.${save.guild.level}!`;
      if (newUnlocked.length > 0) {
        msg += `<br><br>New perks available:<br>${newUnlocked.map(k => `${GUILD_PERK_DEFS[k].icon} ${GUILD_PERK_DEFS[k].name}`).join("<br>")}`;
      }
      saveGame();
      refreshHome();
      initGuildUI();
      showModal({ icon: "🏴", title: "Guild Level Up!", message: msg });
    } else {
      saveGame();
      refreshHome();
      initGuildUI();
      showModal({ icon: "🏴", title: "Donation", message: "Donated 100 🪙 to the guild! Guild gained 50 XP." });
    }
  };
}

// --- DUNGEON / RAID SYSTEM ---
const DUNGEON_DEFS = [
  { id:"ember_caverns", name:"Ember Caverns", icon:"🌋", desc:"Blazing tunnels filled with fire-aligned creatures.", floors:5, minLevel:1, theme:"ember",
    bossName:"Magma Tyrant", bossIds:["pyrelope","boulderon"],
    loot:[
      { floor:1, gold:60, gems:5, items:[], xp:80 },
      { floor:2, gold:90, gems:8, items:[], xp:100 },
      { floor:3, gold:120, gems:10, items:[], xp:120 },
      { floor:4, gold:160, gems:12, items:["vitalberry"], xp:150 },
      { floor:5, gold:400, gems:35, items:["ironscale","quickfeather"], xp:300, rareMonChance:0.3 }
    ] },
  { id:"abyssal_depths", name:"Abyssal Depths", icon:"🌊", desc:"Dark waters where aqua predators lurk in the depths.", floors:5, minLevel:5, theme:"aqua",
    bossName:"Leviathan", bossIds:["coralisk","tidenne"],
    loot:[
      { floor:1, gold:100, gems:8, items:[], xp:120 },
      { floor:2, gold:140, gems:12, items:[], xp:150 },
      { floor:3, gold:180, gems:15, items:[], xp:180 },
      { floor:4, gold:240, gems:18, items:["guardcharm"], xp:220 },
      { floor:5, gold:600, gems:50, items:["steadfastsash","puredew"], xp:400, rareMonChance:0.4 }
    ] },
  { id:"storm_spire", name:"Storm Spire", icon:"⚡", desc:"A towering spire crackling with volt and gale energy.", floors:5, minLevel:10, theme:"volt",
    bossName:"Storm Titan", bossIds:["voltigo","zephyrn"],
    loot:[
      { floor:1, gold:180, gems:12, items:[], xp:180 },
      { floor:2, gold:240, gems:16, items:[], xp:220 },
      { floor:3, gold:300, gems:20, items:[], xp:260 },
      { floor:4, gold:380, gems:24, items:["quickfeather"], xp:300 },
      { floor:5, gold:900, gems:70, items:["ironscale","guardcharm"], xp:500, rareMonChance:0.5 }
    ] },
  { id:"verdant_maw", name:"Verdant Maw", icon:"🌿", desc:"An overgrown chasm where nature has twisted into a deadly maze.", floors:6, minLevel:15, theme:"verdant",
    bossName:"Ancient Treant", bossIds:["thornuke","verdil"],
    loot:[
      { floor:1, gold:250, gems:16, items:[], xp:220 },
      { floor:2, gold:320, gems:20, items:[], xp:260 },
      { floor:3, gold:400, gems:24, items:[], xp:300 },
      { floor:4, gold:500, gems:30, items:["vitalberry"], xp:350 },
      { floor:5, gold:600, gems:36, items:["puredew"], xp:400 },
      { floor:6, gold:1200, gems:90, items:["steadfastsash","ironscale"], xp:600, rareMonChance:0.6 }
    ] }
];

let dungeonState = null;

function initDungeonUI() {
  const container = document.getElementById("dungeon-content");
  if (!container) return;
  container.innerHTML = "";

  if (dungeonState && dungeonState.active) {
    showDungeonActive(container);
  } else {
    showDungeonSelect(container);
  }
}

function showDungeonSelect(container) {
  let html = `<div class="details-card" style="text-align:center;">
    <h3>🏛️ Dungeon Raids</h3>
    <p class="subtitle">Select a dungeon and lead your Rift-forms through dangerous floors. Defeat the boss to claim epic rewards!</p>
  </div>`;

  DUNGEON_DEFS.forEach((dd, idx) => {
    const avgLevel = Math.max(1, Math.floor(save.mons.reduce((s, m) => {
      const d = getMonData(m.uid); return s + d.level;
    }, 0) / Math.max(1, save.mons.length)));
    const locked = avgLevel < dd.minLevel;
    const hasCleared = save.dungeonProgress && save.dungeonProgress[dd.id];
    const clearedLabel = hasCleared ? "✓ Cleared" : `${dd.floors} Floors`;

    html += `<div class="dungeon-card ${locked ? 'locked' : ''}" data-dungeon-idx="${idx}">
      <div class="dun-header">
        <div>
          <div class="dun-name">${dd.icon} ${dd.name}</div>
          <div class="dun-desc">${dd.desc}</div>
        </div>
        <div class="dun-icon">${hasCleared ? '✅' : '🏛️'}</div>
      </div>
      <div class="dun-meta">
        <span>${clearedLabel}</span>
        <span>Min Lv.${dd.minLevel}</span>
        <span>Boss: ${dd.bossName}</span>
      </div>
    </div>`;
  });

  container.innerHTML = html;

  container.querySelectorAll(".dungeon-card:not(.locked)").forEach(card => {
    card.addEventListener("click", () => {
      const idx = parseInt(card.dataset.dungeonIdx);
      const dd = DUNGEON_DEFS[idx];
      if (save.mons.filter(m => !m.onExpedition).length < 3) {
        return showModal({ icon: "🏛️", title: "Dungeon", message: "You need at least 3 available Rift-forms to enter a dungeon." });
      }
      buildSelectGrid();
      battleMode = "dungeon";
      window._pendingDungeonIdx = idx;
      document.getElementById("btn-confirm-team").textContent = `Enter ${dd.name}`;
      const survBtn = document.getElementById("btn-survival-team");
      if (survBtn) survBtn.style.display = "none";
      const tourneyBtn = document.getElementById("btn-tournament-team");
      if (tourneyBtn) tourneyBtn.style.display = "none";
      show("screen-select");
    });
  });
}

function showDungeonActive(container) {
  const ds = dungeonState;
  const dd = DUNGEON_DEFS[ds.dungeonIdx];
  const currentFloor = ds.currentFloor;
  const isBoss = currentFloor === dd.floors;

  let dotsHtml = "";
  for (let i = 1; i <= dd.floors; i++) {
    const cleared = i < currentFloor;
    const cur = i === currentFloor;
    const isBossFloor = i === dd.floors;
    dotsHtml += `<div class="dungeon-floor-dot ${cleared ? 'cleared' : ''} ${cur ? 'current' : ''} ${isBossFloor ? 'boss-dot' : ''}">${isBossFloor ? '👑' : i}</div>`;
  }

  const lootInfo = dd.loot.find(l => l.floor === currentFloor) || dd.loot[dd.loot.length - 1];

  container.innerHTML = `
    <div class="details-card" style="text-align:center;">
      <div style="font-size:28px;">${dd.icon}</div>
      <h3>${dd.name}</h3>
      <div class="dungeon-floor-progress">${dotsHtml}</div>
      <p class="subtitle">Floor ${currentFloor} / ${dd.floors}${isBoss ? ' — 👑 BOSS FLOOR' : ''}</p>
    </div>
    <div class="details-card" style="text-align:center;">
      <div style="display:flex; justify-content:space-around; margin:8px 0;">
        <div style="font-family:var(--mono); font-size:13px;">🪙 ${formatNum(lootInfo.gold)}</div>
        <div style="font-family:var(--mono); font-size:13px;">💎 ${formatNum(lootInfo.gems)}</div>
        <div style="font-family:var(--mono); font-size:13px;">✨ ${formatNum(lootInfo.xp)} XP</div>
      </div>
      ${lootInfo.items.length > 0 ? `<div style="font-size:12px; color:var(--text-dim);">Items: ${lootInfo.items.map(k => ITEMS[k] ? ITEMS[k].name : k).join(', ')}</div>` : ''}
      ${isBoss ? `<div style="font-size:12px; color:var(--gold); margin-top:4px;">👑 Boss: ${dd.bossName} — Rare creature drop chance!</div>` : ''}
      <button class="btn gold" id="btn-enter-dungeon-floor" style="margin-top:12px;">Enter Floor ${currentFloor}</button>
      <button class="btn ghost" id="btn-retreat-dungeon" style="margin-top:4px;">Retreat (Keep Rewards)</button>
    </div>
  `;

  document.getElementById("btn-enter-dungeon-floor").onclick = () => {
    enterDungeonFloor();
  };
  document.getElementById("btn-retreat-dungeon").onclick = () => {
    dungeonRetreat();
  };
}

function startDungeon(teamUids, dungeonIdx) {
  const dd = DUNGEON_DEFS[dungeonIdx];
  if (!dd) return;

  const pData = teamUids.map(uid => getMonData(uid));
  dungeonState = {
    active: true,
    dungeonIdx: dungeonIdx,
    currentFloor: 1,
    player: pData,
    totalRewards: { gold: 0, gems: 0, xp: 0 },
    over: false
  };

  showDungeonActive(document.getElementById("dungeon-content"));
  show("screen-dungeon");
}

function enterDungeonFloor() {
  if (!dungeonState || !dungeonState.active) return;
  const ds = dungeonState;
  const dd = DUNGEON_DEFS[ds.dungeonIdx];
  const currentFloor = ds.currentFloor;
  const isBoss = currentFloor === dd.floors;

  const baseLvl = Math.max(1, Math.floor(
    ds.player.reduce((s, m) => s + m.level, 0) / 3
  ) + currentFloor - 1);

  let oppIds;
  if (isBoss) {
    oppIds = [...dd.bossIds];
    while (oppIds.length < 3) {
      const extra = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).filter(id => !oppIds.includes(id));
      oppIds.push(extra[0]);
    }
  } else {
    let pool = [];
    if (dd.theme && THEMED_ROSTER[dd.theme]) {
      pool = [...THEMED_ROSTER[dd.theme]];
    }
    while (pool.length < 3) {
      const extra = ROSTER_DEF.map(r => r[0]).sort(() => Math.random() - 0.5).filter(id => !pool.includes(id));
      pool.push(extra[0]);
    }
    oppIds = pool.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  const trainerName = isBoss ? dd.bossName : `${dd.name} Guardian`;

  ds.player.forEach(m => {
    if (!m.fainted) {
      m.effDef = Math.round(m.def * (m.item === "ironscale" ? 1.15 : 1));
      m.hp = m.baseHp;
      m.statusEffects = [];
      m.statusAtkMult = 1;
      m.statusSkipTurns = 0;
      m.itemUsed = false;
      m._baseSpd = m.spd;
      m._baseDef = m.def;
      if (typeof triggerPassiveOnInit === "function") triggerPassiveOnInit(m);
    }
  });
  ds.pIndex = ds.player.findIndex(m => !m.fainted);
  if (ds.pIndex === -1) ds.pIndex = 0;

  battle = {
    player: ds.player,
    foe: oppIds.map(id => instantiateFoe(id, baseLvl)),
    pIndex: ds.pIndex,
    fIndex: 0,
    opponentName: trainerName + ` (Floor ${currentFloor})`,
    personality: isBoss ? "aggressive" : "balanced",
    over: false,
    dungeon: true,
    pCombo: [], fCombo: []
  };

  const weatherKeys = Object.keys(WEATHER_CONDITIONS).filter(k => k !== "none");
  if (Math.random() < 0.35) {
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
  battle.foe.forEach((m, i) => document.getElementById("prep-foe-slots").insertAdjacentHTML("beforeend",
    `<div class="prep-slot ${i === 0 ? 'lead' : ''} hidden"><div class="n">${i + 1}</div><div class="nm">???</div></div>`));
  document.getElementById("prep-foe-name").textContent = trainerName;

  document.getElementById("prep-clock").textContent = "00:03";
  show("screen-prep");
  clearInterval(prepTimerHandle);
  prepTimerHandle = setInterval(() => {
    const t = parseInt(document.getElementById("prep-clock").textContent.slice(-1));
    if (t <= 1) { clearInterval(prepTimerHandle); revealFoeAndBattle(); return; }
    document.getElementById("prep-clock").textContent = "00:0" + (t - 1);
  }, 1000);
  document.getElementById("btn-skip-prep").onclick = () => { clearInterval(prepTimerHandle); revealFoeAndBattle(); };
}

function handleDungeonFloorEnd(won) {
  if (!dungeonState || !dungeonState.active) return;

  if (won) {
    const dd = DUNGEON_DEFS[dungeonState.dungeonIdx];
    const currentFloor = dungeonState.currentFloor;
    const lootInfo = dd.loot.find(l => l.floor === currentFloor) || dd.loot[dd.loot.length - 1];

    const guildMults = typeof getGuildRewardMultipliers === "function" ? getGuildRewardMultipliers() : { gold: 1, xp: 1 };
    const goldReward = Math.round(lootInfo.gold * guildMults.gold);
    const gemsReward = lootInfo.gems;
    const xpReward = Math.round(lootInfo.xp * guildMults.xp);

    dungeonState.totalRewards.gold += goldReward;
    dungeonState.totalRewards.gems += gemsReward;
    dungeonState.totalRewards.xp += xpReward;

    save.gold += goldReward;
    save.gems += gemsReward;
    save.playerXp += xpReward;

    while (save.playerXp >= getPlayerMaxXp(save.playerLevel)) {
      save.playerXp -= getPlayerMaxXp(save.playerLevel);
      save.playerLevel++;
      save.gems += 50;
    }

    battle.player.forEach(m => {
      let mSave = save.mons.find(x => x.uid === m.uid);
      if (mSave) {
        mSave.xp += xpReward;
        while (mSave.xp >= getMonMaxXp(mSave.level)) {
          mSave.xp -= getMonMaxXp(mSave.level);
          mSave.level++;
        }
      }
    });

    lootInfo.items.forEach(itemKey => {
      if (!save.bag[itemKey]) save.bag[itemKey] = 0;
      save.bag[itemKey]++;
    });

    if (currentFloor === dd.floors) {
      if (lootInfo.rareMonChance && Math.random() < lootInfo.rareMonChance) {
        const pool = ROSTER_DEF.map(r => r[0]);
        const rareId = pool[Math.floor(Math.random() * pool.length)];
        const def = ROSTER_DEF.find(r => r[0] === rareId);
        save.mons.push({
          uid: "dungeon_" + Date.now().toString(),
          baseId: rareId, level: 1, xp: 0,
          heldItem: "none", mergeBonuses: {}, onExpedition: false,
          evolved: false, variant: null, mp: 0, talents: []
        });
        dungeonState._rareFound = def[1];
      }
    }

    const isBoss = currentFloor === dd.floors;
    if (isBoss) {
      if (!save.dungeonProgress) save.dungeonProgress = {};
      save.dungeonProgress[dd.id] = true;
    }

    saveGame();

    const allFainted = battle.player.every(m => m.fainted);
    if (allFainted) {
      dungeonRetreat();
      return;
    }

    showDungeonFloorEndUI(currentFloor, dd, lootInfo, isBoss);
  } else {
    dungeonRetreat();
  }
}

function showDungeonFloorEndUI(floor, dd, lootInfo, isBoss) {
  const container = document.getElementById("dungeon-floor-end-content");
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById("screen-dungeon-floor-end").classList.add("active");

  const nextFloor = floor + 1;
  const isLastFloor = floor >= dd.floors;

  let itemHtml = "";
  if (lootInfo.items.length > 0) {
    itemHtml = lootInfo.items.map(k => ITEMS[k] ? ITEMS[k].name : k).join(", ");
  }

  container.innerHTML = `
    <div class="dungeon-floor-end-banner ${isBoss ? 'boss' : ''}">${isBoss ? "👑 " + dd.bossName + " Defeated!" : "Floor " + floor + " Cleared!"}</div>
    <div class="dungeon-floor-end-rewards">
      <div class="item"><span>Gold</span><span>+${formatNum(lootInfo.gold)}</span></div>
      <div class="item"><span>Gems</span><span>+${formatNum(lootInfo.gems)}</span></div>
      <div class="item"><span>XP</span><span>+${formatNum(lootInfo.xp)}</span></div>
      ${itemHtml ? `<div class="item"><span>Items</span><span>+${itemHtml}</span></div>` : ''}
      ${dungeonState._rareFound ? `<div class="item" style="color:var(--gold);"><span>✨ Rare Find!</span><span>${dungeonState._rareFound}</span></div>` : ''}
      ${isLastFloor ? `<div class="item" style="border-top:1px solid var(--line); padding-top:6px; margin-top:4px; color:var(--gold); font-weight:bold;"><span>Dungeon Complete!</span><span>🏆</span></div>` : ''}
    </div>
    <div class="dungeon-floor-end-actions">
      ${!isLastFloor ? `<button class="btn gold" id="btn-next-floor">Next Floor →</button>` : `<button class="btn gold" id="btn-dungeon-complete">Claim Victory</button>`}
      <button class="btn ghost" id="btn-dungeon-retreat">${isLastFloor ? 'Leave' : 'Retreat (Keep Rewards)'}</button>
    </div>
  `;

  const nextBtn = document.getElementById("btn-next-floor");
  if (nextBtn) {
    nextBtn.onclick = () => {
      dungeonState.currentFloor++;
      dungeonState._rareFound = null;
      document.getElementById("screen-dungeon-floor-end").classList.remove("active");
      const cont = document.getElementById("dungeon-content");
      showDungeonActive(cont);
      show("screen-dungeon");
    };
  }

  const completeBtn = document.getElementById("btn-dungeon-complete");
  if (completeBtn) {
    completeBtn.onclick = () => {
      dungeonComplete();
    };
  }

  document.getElementById("btn-dungeon-retreat").onclick = () => {
    dungeonComplete();
  };
}

function dungeonRetreat() {
  if (!dungeonState) return;
  const rewards = dungeonState.totalRewards;
  const dd = DUNGEON_DEFS[dungeonState.dungeonIdx];
  const floorsCleared = dungeonState.currentFloor - 1;

  dungeonState.active = false;
  dungeonState.over = true;

  let msg = `Retreated from ${dd.name} after Floor ${floorsCleared}.\n\n`;
  msg += `Rewards kept:\n🪙 ${formatNum(rewards.gold)}\n💎 ${formatNum(rewards.gems)}\n✨ ${formatNum(rewards.xp)} XP`;
  if (dungeonState._rareFound) msg += `\n✨ Rare: ${dungeonState._rareFound}`;

  dungeonState = null;
  saveGame();
  refreshHome();

  document.getElementById("screen-dungeon-floor-end").classList.remove("active");
  showModal({ icon: "🏛️", title: "Dungeon Retreat", message: msg.replace(/\n/g, "<br>") });
  show("screen-home");
}

function dungeonComplete() {
  if (!dungeonState) return;
  const rewards = dungeonState.totalRewards;
  const dd = DUNGEON_DEFS[dungeonState.dungeonIdx];

  dungeonState.active = false;
  dungeonState.over = true;

  let msg = `🏆 ${dd.name} conquered! All ${dd.floors} floors cleared!\n\n`;
  msg += `Total Rewards:\n🪙 ${formatNum(rewards.gold)}\n💎 ${formatNum(rewards.gems)}\n✨ ${formatNum(rewards.xp)} XP`;
  if (dungeonState._rareFound) msg += `\n✨ Rare Creature: ${dungeonState._rareFound}!`;

  dungeonState = null;
  saveGame();

  playVictorySound();
  refreshHome();
  showModal({ icon: "🏆", title: "Dungeon Conquered!", message: msg.replace(/\n/g, "<br>") });
  document.getElementById("screen-dungeon-floor-end").classList.remove("active");
  show("screen-home");
}

function getGuildRewardMultipliers() {
  const mults = { gold: 1, xp: 1, explore: 1, training: 1, shop: 1 };
  if (!save.guild) return mults;
  const g = save.guild;
  if (!g.perks) g.perks = [g.perk];
  g.perks.forEach(k => {
    const val = getGuildPerkValue(k, g.level) / 100;
    if (k === "battle") mults.gold = 1 + val;
    if (k === "battleXp") mults.xp = 1 + val;
    if (k === "explore") mults.explore = 1 + val;
    if (k === "training") mults.training = 1 - val;
    if (k === "shop") mults.shop = 1 - val;
    if (k === "goldFind") { mults.gold = mults.gold * (1 + val); mults.explore = mults.explore * (1 + val); }
  });
  return mults;
}

function updateDungeonDash() {
  const el = document.getElementById("dungeon-dash");
  if (!el) return;
  if (dungeonState && dungeonState.active) {
    const dd = DUNGEON_DEFS[dungeonState.dungeonIdx];
    el.textContent = `F${dungeonState.currentFloor}/${dd.floors}`;
  } else {
    const clearedCount = save.dungeonProgress ? Object.keys(save.dungeonProgress).length : 0;
    el.textContent = clearedCount > 0 ? `${clearedCount}/${DUNGEON_DEFS.length} cleared` : "Raid";
  }
}

setInterval(updateDungeonDash, 5000);

// --- FORGE / CRAFTING SYSTEM ---
function initForgeUI() {
  const container = document.getElementById("forge-content");
  if (!container) return;
  initForgeTabs();
  container.innerHTML = "";
  showCraftTab();
}

function showCraftTab() {
  const tabCraft = document.getElementById("forge-tab-craft");
  const tabEquip = document.getElementById("forge-tab-equip");
  if (tabCraft) { tabCraft.className = "btn gold"; tabCraft.style.flex = "1"; }
  if (tabEquip) { tabEquip.className = "btn ghost"; tabEquip.style.flex = "1"; }

  const container = document.getElementById("forge-content");
  if (!container) return;
  container.innerHTML = "";

  // Materials section
  const matSection = document.createElement("div");
  matSection.className = "details-card";
  const matKeys = Object.keys(save.bag).filter(k => ITEMS[k] && ITEMS[k].slot === "material" && save.bag[k] > 0);
  if (matKeys.length > 0) {
    let matHtml = `<div class="forge-materials-header">🔨 Available Materials</div><div style="display:flex;flex-wrap:wrap;gap:4px;">`;
    matKeys.forEach(k => {
      const itm = ITEMS[k];
      matHtml += `<span class="forge-material-tag have" style="border-color:${TIER_COLORS[itm.tier]||'#888'};">${itm.name} x${save.bag[k]}</span>`;
    });
    matHtml += `</div>`;
    matSection.innerHTML = matHtml;
  } else {
    matSection.innerHTML = `<div style="font-size:12px;color:var(--text-dim);text-align:center;">No crafting materials yet. Explore dungeons and expeditions to find materials!</div>`;
  }
  container.appendChild(matSection);

  // Recipes
  CRAFTING_RECIPES.forEach(recipe => {
    const resultItem = ITEMS[recipe.id];
    if (!resultItem) return;

    const hasAllMats = recipe.materials.every(mat => (save.bag[mat.key] || 0) >= mat.qty);
    const canAfford = save.gold >= recipe.goldCost;
    const canCraft = hasAllMats && canAfford;
    const tierColor = TIER_COLORS[resultItem.tier] || "#a8a2c4";

    const card = document.createElement("div");
    card.className = `forge-recipe${canCraft ? ' craftable' : ''}`;
    card.innerHTML = `
      <div class="forge-recipe-header">
        <div class="forge-recipe-name" style="color:${tierColor};">${resultItem.name}</div>
        <div class="forge-recipe-tier" style="background:${tierColor}22;color:${tierColor};border:1px solid ${tierColor}44;">${TIER_NAMES[resultItem.tier]||resultItem.tier}</div>
      </div>
      <div class="forge-recipe-desc">${resultItem.desc}</div>
      <div style="font-size:11px;color:var(--text-dim);text-transform:capitalize;">Slot: ${resultItem.slot}</div>
      <div class="forge-recipe-mats">
        ${recipe.materials.map(mat => {
          const have = save.bag[mat.key] || 0;
          const enough = have >= mat.qty;
          return `<span class="forge-material-tag ${enough ? 'have' : 'need'}">${ITEMS[mat.key]?.name || mat.key} ${have}/${mat.qty}</span>`;
        }).join("")}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div class="forge-recipe-cost">🪙 ${formatNum(recipe.goldCost)}</div>
        <button class="btn gold" style="width:auto;padding:8px 16px;" ${canCraft ? '' : 'disabled'}>
          ${canCraft ? 'Craft' : hasAllMats ? 'Need Gold' : 'Missing Materials'}
        </button>
      </div>
    `;

    const craftBtn = card.querySelector("button");
    if (canCraft) {
      craftBtn.onclick = () => craftItem(recipe);
    }

    container.appendChild(card);
  });
}

function showEquipTab() {
  const tabCraft = document.getElementById("forge-tab-craft");
  const tabEquip = document.getElementById("forge-tab-equip");
  if (tabCraft) { tabCraft.className = "btn ghost"; tabCraft.style.flex = "1"; }
  if (tabEquip) { tabEquip.className = "btn gold"; tabEquip.style.flex = "1"; }

  const container = document.getElementById("forge-content");
  if (!container) return;
  container.innerHTML = "";

  const slotIcons = { weapon: "⚔️", armor: "🛡️", accessory: "💍" };

  save.mons.forEach(m => {
    const data = getMonData(m.uid);
    const card = document.createElement("div");
    card.className = "details-card";

    let slotsHtml = "";
    EQUIP_SLOTS.forEach(slot => {
      const eq = m.equipment ? m.equipment[slot] : "none";
      const eqItem = ITEMS[eq];
      const eqName = eqItem ? eqItem.name : "None";
      const eqTier = eqItem && eqItem.tier !== "common" ? eqItem.tier : null;
      const eqColor = eqTier ? (TIER_COLORS[eqTier] || "#a8a2c4") : "var(--text-dim)";

      slotsHtml += `
        <div class="forge-equip-slot" data-uid="${m.uid}" data-slot="${slot}">
          <div class="forge-equip-slot-icon">${slotIcons[slot] || "📦"}</div>
          <div style="flex:1;">
            <div class="forge-equip-slot-name">${slot.charAt(0).toUpperCase() + slot.slice(1)}</div>
            <div class="forge-equip-item" style="color:${eqColor};">${eqName}${eqItem && eqItem.statBonus && Object.keys(eqItem.statBonus).length > 0 ? ` — ${Object.entries(eqItem.statBonus).map(([s,v]) => s.toUpperCase() + "+" + Math.round(v*100) + "%").join(" ")}` : ""}</div>
          </div>
          <button class="btn ghost" style="width:auto;padding:6px 12px;font-size:11px;">${eq !== "none" ? 'Unequip' : '—'}</button>
        </div>
      `;
    });

    card.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
        <div class="orb sm t-${data.type}"><div class="glyph"></div></div>
        <div><div style="font-weight:700;font-size:14px;">${data.name} <span class="badge">Lv.${data.level}</span></div></div>
      </div>
      ${slotsHtml}
    `;

    container.appendChild(card);

    // Unequip handlers
    card.querySelectorAll(".forge-equip-slot button").forEach(btn => {
      const slotEl = btn.closest(".forge-equip-slot");
      const uid = slotEl.dataset.uid;
      const slot = slotEl.dataset.slot;
      const mSave = save.mons.find(x => x.uid === uid);
      const cur = mSave && mSave.equipment ? mSave.equipment[slot] : "none";
      if (cur !== "none") {
        btn.onclick = () => {
          if (mSave.equipment && mSave.equipment[slot] !== "none") {
            const oldItem = mSave.equipment[slot];
            save.bag[oldItem] = (save.bag[oldItem] || 0) + 1;
            mSave.equipment[slot] = "none";
            mSave.heldItem = mSave.equipment.accessory || "none";
            saveGame();
            showEquipTab();
          }
        };
      }
    });
  });

  if (save.mons.length === 0) {
    container.innerHTML = `<p>No Rift-forms available. Summon some first!</p>`;
  }
}

function craftItem(recipe) {
  const resultItem = ITEMS[recipe.id];
  if (!resultItem) return;

  // Verify materials again
  for (const mat of recipe.materials) {
    if ((save.bag[mat.key] || 0) < mat.qty) {
      return showModal({ icon: "🔨", title: "Crafting", message: "Not enough materials!" });
    }
  }
  if (save.gold < recipe.goldCost) {
    return showModal({ icon: "🪙", title: "Not Enough Gold", message: "Not enough gold!" });
  }

  // Consume materials
  recipe.materials.forEach(mat => {
    save.bag[mat.key] = (save.bag[mat.key] || 0) - mat.qty;
    if (save.bag[mat.key] <= 0) delete save.bag[mat.key];
  });

  save.gold -= recipe.goldCost;

  // Add crafted item to bag
  save.bag[recipe.id] = (save.bag[recipe.id] || 0) + 1;

  saveGame();
  if (typeof trackAchievement === "function") trackAchievement("item_forged", 1);
  showModal({ icon: "🔨", title: "Crafted!", message: `Crafted ${resultItem.name}!<br><br>Tier: ${TIER_NAMES[resultItem.tier]}<br>Slot: ${resultItem.slot}<br>${resultItem.desc}` });
  showCraftTab();
  refreshHome();
}

// Forge tab switching — called once from initForgeUI
function initForgeTabs() {
  const tabCraft = document.getElementById("forge-tab-craft");
  const tabEquip = document.getElementById("forge-tab-equip");
  if (tabCraft) tabCraft.onclick = showCraftTab;
  if (tabEquip) tabEquip.onclick = showEquipTab;
}
