/**
 * Traffic Trencher v27
 * - Dashcam-style HUD layout
 * - Mission Log via dispatch.json
 * - Friday claim clock
 * - Subtle live indicator + top pill
 */

const CONFIG = {
  watchUrl: "https://x.com",                 // TODO: put your live link (Twitch/Kick/YouTube/X)
  isLive: false,                             // manual toggle
  seasonGoalMiles: 25000,
  nextTarget: "Rear camera",
  dispatchUrl: "dispatch.json",
  claimHourLocal: 17,
  claimMinuteLocal: 0
};

const DEFAULT_STATS = {
  milesSeason: 0,
  milesToday: 0,
  updatedAtISO: null
};

const qs = (s) => document.querySelector(s);

function clampInt(n){
  const v = parseInt(n, 10);
  if(Number.isNaN(v) || !Number.isFinite(v)) return 0;
  return Math.max(0, v);
}

function fmtUpdated(iso){
  if(!iso) return "—";
  try{
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  }catch{ return "—"; }
}

function loadStats(){
  try{
    const raw = localStorage.getItem("tt_stats_v7");
    if(!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  }catch{
    return { ...DEFAULT_STATS };
  }
}

function nextFridayAt(hour, minute){
  const now = new Date();
  const d = new Date(now);
  d.setSeconds(0,0);
  d.setHours(hour, minute, 0, 0);

  const day = now.getDay(); // Sun=0..Fri=5
  let addDays = (5 - day + 7) % 7;
  if(addDays === 0 && now >= d) addDays = 7;
  if(addDays !== 0) d.setDate(now.getDate() + addDays);
  return d;
}

function formatCountdown(ms){
  const total = Math.max(0, ms);
  const sec = Math.floor(total / 1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  return `${days}d ${hrs}h ${mins}m`;
}

function startClaimClock(){
  const el = qs("#claimClock");
  if(!el) return;

  function tick(){
    const target = nextFridayAt(CONFIG.claimHourLocal, CONFIG.claimMinuteLocal);
    const now = new Date();
    const ms = target.getTime() - now.getTime();
    const date = target.toLocaleDateString(undefined, { month:"short", day:"2-digit" });
    const time = target.toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" });
    el.textContent = `Fri ${date} @ ${time} • ${formatCountdown(ms)}`;
  }

  tick();
  setInterval(tick, 30_000);
}

function setLiveUI(){
  const pill = qs("#livePill");
  const dot = qs("#liveDot");
  const text = qs("#liveText");

  if(CONFIG.isLive){
    if(pill) pill.textContent = "LIVE";
    if(dot){
      dot.style.background = "rgba(154,252,255,.95)";
      dot.style.boxShadow = "0 0 16px rgba(154,252,255,.65)";
    }
    if(text) text.textContent = "Live";
  }else{
    if(pill) pill.textContent = "OFFLINE";
    if(dot){
      dot.style.background = "rgba(255,255,255,.35)";
      dot.style.boxShadow = "none";
    }
    if(text) text.textContent = "Offline";
  }
}

function render(stats){
  const milesSeason = clampInt(stats.milesSeason);
  const milesToday = clampInt(stats.milesToday);
  const goal = CONFIG.seasonGoalMiles;

  const pct = goal > 0 ? Math.min(100, Math.floor((milesSeason / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - milesSeason);

  if(qs("#watchBtn")) qs("#watchBtn").href = CONFIG.watchUrl;

  if(qs("#updatedAt")) qs("#updatedAt").textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;
  if(qs("#seasonGoal")) qs("#seasonGoal").textContent = String(goal);
  if(qs("#milesSeason")) qs("#milesSeason").textContent = String(milesSeason);
  if(qs("#milesToday")) qs("#milesToday").textContent = String(milesToday);
  if(qs("#remainingMiles")) qs("#remainingMiles").textContent = String(remaining);
  if(qs("#progressPct")) qs("#progressPct").textContent = String(pct);
  if(qs("#nextTarget")) qs("#nextTarget").textContent = CONFIG.nextTarget;

  const fill = qs("#progressFill");
  if(fill) fill.style.width = `${pct}%`;
}

function safeText(str){
  return String(str ?? "").replace(/[<>]/g, "");
}

function renderMissionLog(data){
  const log = qs("#missionLog");
  const meta = qs("#logUpdated");
  if(!log) return;

  if(meta) meta.textContent = data?.updatedAt ? fmtUpdated(data.updatedAt) : "—";

  const entries = Array.isArray(data?.entries) ? data.entries : [];
  if(entries.length === 0){
    log.innerHTML = `<div class="log__empty">No dispatch entries yet.</div>`;
    return;
  }

  const sorted = [...entries].sort((a,b)=> String(b.ts||"").localeCompare(String(a.ts||"")));
  log.innerHTML = sorted.slice(0, 16).map(e => {
    const ts = safeText(e.ts || "");
    const title = safeText(e.title || "Dispatch");
    const text = safeText(e.text || "");
    return `
      <div class="logItem">
        <div class="logTop">
          <div class="logTitle">${title}</div>
          <div class="logTs">${ts}</div>
        </div>
        <div class="logText">${text}</div>
      </div>
    `;
  }).join("");
}

async function loadMissionLog(){
  const log = qs("#missionLog");
  if(!log) return;

  const url = `${CONFIG.dispatchUrl}?v=${Date.now()}`;
  try{
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error(`dispatch fetch failed: ${res.status}`);
    const data = await res.json();
    renderMissionLog(data);
  }catch{
    log.innerHTML = `<div class="log__empty">Dispatch unavailable. Add <code>dispatch.json</code> in the repo root.</div>`;
    const meta = qs("#logUpdated");
    if(meta) meta.textContent = "—";
  }
}

(function init(){
  const year = qs("#year");
  if(year) year.textContent = String(new Date().getFullYear());

  setLiveUI();
  startClaimClock();

  const stats = loadStats();
  render(stats);

  loadMissionLog();
})();