/**
 * Trencher Traffic — revamp v22 (Pump-inspired cadence + dashboard)
 * - Season 1: 25,000 miles
 * - Friday claim cadence countdown (auto)
 * - Launchpad-style progress bar + remaining miles
 * - Overlay mode retained (?overlay=1)
 * - Local-only admin edits (?admin=1) (device/browser only)
 */

const CONFIG = {
  watchUrl: "https://x.com",   // TODO: replace
  xUrl: "https://x.com",       // TODO: replace
  tokenUrl: "#",               // TODO: replace
  isLive: false,               // manual toggle
  seasonGoalMiles: 25000,
  nextTarget: "Rear camera",
  adminPassphrase: "trencher", // TODO: change
};

const DEFAULT_STATS = {
  milesSeason: 0,
  milesToday: 0,
  updatedAtISO: null,
};

function qs(sel){ return document.querySelector(sel); }
function getParam(name){ return new URLSearchParams(location.search).get(name); }

function loadStats(){
  try{
    const raw = localStorage.getItem("tt_stats_v3");
    if(!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  }catch{
    return { ...DEFAULT_STATS };
  }
}
function saveStats(stats){
  localStorage.setItem("tt_stats_v3", JSON.stringify(stats));
}

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
  }catch{
    return "—";
  }
}

function setLinks(){
  const watchBtn = qs("#watchBtn");
  const watchBtn2 = qs("#watchBtn2");
  const xLink = qs("#xLink");
  const streamLink = qs("#streamLink");
  const tokenLink = qs("#tokenLink");

  if(watchBtn) watchBtn.href = CONFIG.watchUrl;
  if(watchBtn2) watchBtn2.href = CONFIG.watchUrl;
  if(xLink) xLink.href = CONFIG.xUrl;
  if(streamLink) streamLink.href = CONFIG.watchUrl;
  if(tokenLink) tokenLink.href = CONFIG.tokenUrl;
}

function setYear(){
  const y = qs("#year");
  if(y) y.textContent = String(new Date().getFullYear());
}

function setLiveUI(){
  const liveBadge = qs("#liveBadge");
  const liveDot = qs("#liveDot");
  const liveText = qs("#liveText");
  const overlayLive = qs("#overlayLive");

  if(CONFIG.isLive){
    if(liveBadge) liveBadge.textContent = "LIVE";
    if(liveDot){
      liveDot.style.background = "rgba(154,252,255,.95)";
      liveDot.style.boxShadow = "0 0 16px rgba(154,252,255,.65)";
    }
    if(liveText) liveText.textContent = "Live";
    if(overlayLive) overlayLive.textContent = "LIVE";
  }else{
    if(liveBadge) liveBadge.textContent = "OFFLINE";
    if(liveDot){
      liveDot.style.background = "rgba(255,255,255,.35)";
      liveDot.style.boxShadow = "none";
    }
    if(liveText) liveText.textContent = "Offline";
    if(overlayLive) overlayLive.textContent = "OFFLINE";
  }
}

/**
 * Next Friday countdown (local timezone).
 * If it’s Friday already, counts to the next Friday.
 * Uses 17:00 local time by default (adjust if you want).
 */
function nextFridayAt(hour=17, minute=0){
  const now = new Date();
  const d = new Date(now);
  d.setSeconds(0,0);
  d.setHours(hour, minute, 0, 0);

  const day = now.getDay(); // Sun=0..Fri=5
  let addDays = (5 - day + 7) % 7; // days until Friday
  if(addDays === 0 && now >= d) addDays = 7; // if it's Friday past claim time, go next week
  if(addDays !== 0){
    d.setDate(now.getDate() + addDays);
  }
  return d;
}

function formatCountdown(ms){
  const total = Math.max(0, ms);
  const sec = Math.floor(total/1000);
  const days = Math.floor(sec / 86400);
  const hrs = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  return `${days}d ${hrs}h ${mins}m`;
}

function renderStats(stats){
  const milesSeason = clampInt(stats.milesSeason);
  const milesToday = clampInt(stats.milesToday);
  const goal = CONFIG.seasonGoalMiles;

  const pct = goal > 0 ? Math.min(100, Math.floor((milesSeason / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - milesSeason);

  // Hero console / top chips
  const nextTop = qs("#nextTargetTop");
  const nextConsole = qs("#nextTargetConsole");
  if(nextTop) nextTop.textContent = CONFIG.nextTarget;
  if(nextConsole) nextConsole.textContent = CONFIG.nextTarget;

  // Dashboard values
  const milesSeasonEl = qs("#milesSeason");
  const milesTodayEl = qs("#milesToday");
  const progressPctEl = qs("#progressPct");
  const remainingEl = qs("#remainingMiles");
  const progressFill = qs("#progressFill");
  const progressMetaRight = qs("#progressMetaRight");
  const updatedAtEl = qs("#updatedAt");

  if(milesSeasonEl) milesSeasonEl.textContent = String(milesSeason);
  if(milesTodayEl) milesTodayEl.textContent = String(milesToday);
  if(progressPctEl) progressPctEl.textContent = String(pct);
  if(remainingEl) remainingEl.textContent = String(remaining);
  if(progressFill) progressFill.style.width = `${pct}%`;
  if(progressMetaRight) progressMetaRight.textContent = `${goal.toLocaleString()} mi`;
  if(updatedAtEl) updatedAtEl.textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;

  // Overlay
  const overlayMiles = qs("#overlayMiles");
  const overlayToday = qs("#overlayToday");
  const overlayNext = qs("#overlayNext");
  if(overlayMiles) overlayMiles.textContent = String(milesSeason);
  if(overlayToday) overlayToday.textContent = String(milesToday);
  if(overlayNext) overlayNext.textContent = "Rear cam";
}

function startClaimCountdown(){
  const nextClaimText = qs("#nextClaimText");
  if(!nextClaimText) return;

  function tick(){
    const target = nextFridayAt(17,0);
    const now = new Date();
    const ms = target.getTime() - now.getTime();

    const label = `Fri ${target.toLocaleDateString(undefined, { month:"short", day:"2-digit" })} @ ${target.toLocaleTimeString(undefined,{ hour:"2-digit", minute:"2-digit" })}`;
    nextClaimText.textContent = `${label} • ${formatCountdown(ms)}`;
  }
  tick();
  setInterval(tick, 30_000);
}

/**
 * Local ADMIN editing (device-only)
 * Visit: ?admin=1
 */
function maybeAdmin(stats){
  const admin = getParam("admin");
  if(admin !== "1") return;

  const ok = sessionStorage.getItem("tt_admin_ok") === "1";
  if(!ok){
    const pass = prompt("Admin passphrase:");
    if(pass !== CONFIG.adminPassphrase){
      alert("Nope.");
      return;
    }
    sessionStorage.setItem("tt_admin_ok","1");
  }

  const milesSeason = prompt("Season 1 Miles:", String(stats.milesSeason ?? 0));
  if(milesSeason === null) return;
  const milesToday = prompt("Miles Today:", String(stats.milesToday ?? 0));
  if(milesToday === null) return;

  const next = {
    ...stats,
    milesSeason: clampInt(milesSeason),
    milesToday: clampInt(milesToday),
    updatedAtISO: new Date().toISOString(),
  };
  saveStats(next);
  renderStats(next);
  alert("Saved locally (this device/browser).");
}

/**
 * Overlay Mode
 */
function applyOverlayMode(){
  const overlay = getParam("overlay") === "1";
  if(!overlay) return;

  const main = document.querySelector("main");
  const header = document.querySelector("header");
  if(main) main.style.display = "none";
  if(header) header.style.display = "none";

  const overlayRoot = qs("#overlayRoot");
  if(overlayRoot){
    overlayRoot.style.display = "flex";
    overlayRoot.setAttribute("aria-hidden","false");
  }
  document.body.style.background = "transparent";
}

(function init(){
  setLinks();
  setYear();
  setLiveUI();
  applyOverlayMode();

  const stats = loadStats();
  renderStats(stats);
  startClaimCountdown();
  maybeAdmin(stats);
})();