/**
 * Trencher Traffic — v23
 * - Season 1: 25,000 miles
 * - Friday claim cadence: clock + countdown (auto)
 * - Launchpad dashboard (progress fill, remaining)
 * - Overlay mode: ?overlay=1
 * - Local admin edit: ?admin=1 (device-only)
 */

const CONFIG = {
  watchUrl: "https://x.com",   // TODO replace
  xUrl: "https://x.com",       // TODO replace
  tokenUrl: "#",               // TODO replace
  isLive: false,               // manual toggle
  seasonGoalMiles: 25000,
  nextTarget: "Rear camera",
  adminPassphrase: "trencher", // TODO change
  claimHourLocal: 17,
  claimMinuteLocal: 0,
};

const DEFAULT_STATS = {
  milesSeason: 0,
  milesToday: 0,
  updatedAtISO: null,
};

// helpers
function qs(sel){ return document.querySelector(sel); }
function getParam(name){ return new URLSearchParams(location.search).get(name); }
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

// storage
function loadStats(){
  try{
    const raw = localStorage.getItem("tt_stats_v4");
    if(!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  }catch{
    return { ...DEFAULT_STATS };
  }
}
function saveStats(stats){
  localStorage.setItem("tt_stats_v4", JSON.stringify(stats));
}

// links
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

  // receipts placeholders are optional; keep inert unless set
  const lastClaimLink = qs("#lastClaimLink");
  const rigLink = qs("#rigLink");
  const carLink = qs("#carLink");
  if(lastClaimLink) lastClaimLink.href = "#";
  if(rigLink) rigLink.href = "#";
  if(carLink) carLink.href = "#";
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

// claim clock
function nextFridayAt(hour, minute){
  const now = new Date();
  const d = new Date(now);
  d.setSeconds(0,0);
  d.setHours(hour, minute, 0, 0);

  const day = now.getDay(); // Sun=0..Fri=5
  let addDays = (5 - day + 7) % 7; // to Friday
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
  const claimClock = qs("#claimClock");
  const nextClaimText = qs("#nextClaimText");
  if(!claimClock && !nextClaimText) return;

  function tick(){
    const target = nextFridayAt(CONFIG.claimHourLocal, CONFIG.claimMinuteLocal);
    const now = new Date();
    const ms = target.getTime() - now.getTime();

    const date = target.toLocaleDateString(undefined, { month:"short", day:"2-digit" });
    const time = target.toLocaleTimeString(undefined, { hour:"2-digit", minute:"2-digit" });

    const line = `Fri ${date} @ ${time} • ${formatCountdown(ms)}`;
    if(claimClock) claimClock.textContent = line;
    if(nextClaimText) nextClaimText.textContent = line;
  }

  tick();
  setInterval(tick, 30_000);
}

// render
function render(stats){
  const milesSeason = clampInt(stats.milesSeason);
  const milesToday = clampInt(stats.milesToday);
  const goal = CONFIG.seasonGoalMiles;

  const pct = goal > 0 ? Math.min(100, Math.floor((milesSeason / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - milesSeason);

  // console + chips
  const nextTop = qs("#nextTargetTop");
  const nextConsole = qs("#nextTargetConsole");
  if(nextTop) nextTop.textContent = CONFIG.nextTarget;
  if(nextConsole) nextConsole.textContent = CONFIG.nextTarget;

  const updatedAtEl = qs("#updatedAt");
  if(updatedAtEl) updatedAtEl.textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;

  // dashboard
  const milesSeasonEl = qs("#milesSeason");
  const milesTodayEl = qs("#milesToday");
  const progressPctEl = qs("#progressPct");
  const remainingEl = qs("#remainingMiles");
  const progressFill = qs("#progressFill");
  const metaLeft = qs("#progressMetaLeft");
  const metaRight = qs("#progressMetaRight");
  const seasonGoalEl = qs("#seasonGoal");

  if(seasonGoalEl) seasonGoalEl.textContent = String(goal);
  if(milesSeasonEl) milesSeasonEl.textContent = String(milesSeason);
  if(milesTodayEl) milesTodayEl.textContent = String(milesToday);
  if(progressPctEl) progressPctEl.textContent = String(pct);
  if(remainingEl) remainingEl.textContent = String(remaining);
  if(progressFill) progressFill.style.width = `${pct}%`;
  if(metaLeft) metaLeft.textContent = `${pct}%`;
  if(metaRight) metaRight.textContent = `${goal.toLocaleString()} mi`;

  // overlay
  const overlayMiles = qs("#overlayMiles");
  const overlayToday = qs("#overlayToday");
  const overlayNext = qs("#overlayNext");
  if(overlayMiles) overlayMiles.textContent = String(milesSeason);
  if(overlayToday) overlayToday.textContent = String(milesToday);
  if(overlayNext) overlayNext.textContent = "Rear cam";
}

// admin
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
  render(next);
  alert("Saved locally (this device/browser).");
}

// overlay
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
  render(stats);
  startClaimClock();
  maybeAdmin(stats);
})();