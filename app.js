// Trencher Traffic — app.js (matches the current index.html)

const CONFIG = {
  goalMiles: 25000,
  milestoneCount: 25, // 25k / 25 = 1,000-mile claims
  milesStorageKey: "tt_miles_v1",
  streamStorageKey: "tt_stream_v1",
  isLive: false // flip true when live
};

const qs = (s) => document.querySelector(s);

function clampInt(n){
  const v = parseInt(n, 10);
  if (Number.isNaN(v) || !Number.isFinite(v)) return 0;
  return Math.max(0, v);
}

function setYear(){
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

function setLiveBadge(){
  const badge = qs("#liveBadge");
  if (!badge) return;

  if (CONFIG.isLive){
    badge.textContent = "LIVE";
    badge.classList.add("is-live");
  }else{
    badge.textContent = "OFFLINE";
    badge.classList.remove("is-live");
  }
}

// Desktop opens thesis, mobile keeps it collapsed
function setThesisDefault(){
  const d = qs("#thesisDetails");
  if (!d) return;

  const mq = window.matchMedia("(min-width: 901px)");
  const apply = () => { d.open = mq.matches; };

  apply();
  try{
    mq.addEventListener("change", apply);
  }catch{
    // Safari fallback
    mq.addListener(apply);
  }
}

function loadMiles(){
  try{
    const raw = localStorage.getItem(CONFIG.milesStorageKey);
    return clampInt(raw ?? 0);
  }catch{
    return 0;
  }
}

function saveMiles(miles){
  localStorage.setItem(CONFIG.milesStorageKey, String(clampInt(miles)));
}

function renderMiles(miles){
  const currentMilesText = qs("#currentMilesText");
  const percentText = qs("#percentText");
  const barFill = qs("#barFill");

  const pct = CONFIG.goalMiles > 0 ? Math.min(100, Math.floor((miles / CONFIG.goalMiles) * 100)) : 0;

  if (currentMilesText) currentMilesText.textContent = String(miles);
  if (percentText) percentText.textContent = `${pct}%`;
  if (barFill) barFill.style.width = `${pct}%`;
}

function renderMilestones(miles){
  const list = qs("#milestoneList");