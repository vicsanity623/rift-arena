"use strict";

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
    save.mons.push({ uid: Date.now().toString(), baseId: rareId, level: 1, xp: 0, heldItem: "none", mergeBonuses: {}, onExpedition: false });
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
  
  if (!save.bag) save.bag = { vitalberry: 5, quickfeather: 1, ironscale: 1, guardcharm: 1, steadfastsash: 1 };

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