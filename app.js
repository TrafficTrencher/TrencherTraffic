// Trencher Traffic — app.js (matches index.html v=60)

const CONFIG = {
  goalMiles: 25000,
  milestoneCount: 25, // 25k / 25 = 1,000-mile claims
  milesStorageKey: "tt_miles_v2",
  streamStorageKey: "tt_stream_v2",
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

  const pct = CONFIG.goalMiles > 0
    ? Math.min(100, Math.floor((miles / CONFIG.goalMiles) * 100))
    : 0;

  if (currentMilesText) currentMilesText.textContent = String(miles);
  if (percentText) percentText.textContent = `${pct}%`;
  if (barFill) barFill.style.width = `${pct}%`;
}

function renderMilestones(miles){
  const list = qs("#milestoneList");
  if (!list) return;

  const step = Math.floor(CONFIG.goalMiles / CONFIG.milestoneCount); // 1000 for 25k/25
  const items = [];

  for (let i = 1; i <= CONFIG.milestoneCount; i++){
    const at = i * step;
    const done = miles >= at;

    items.push(`
      <li style="margin:8px 0; color:${done ? "rgba(233,238,251,.95)" : "rgba(168,179,209,.85)"}">
        <b>${done ? "✓" : "•"}</b> ${at.toLocaleString()} miles
      </li>
    `);
  }

  list.innerHTML = items.join("");
}

function attachMilesUI(){
  const input = qs("#currentMiles");
  const btn = qs("#saveMiles");

  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const miles = clampInt(input.value);
    saveMiles(miles);
    renderMiles(miles);
    renderMilestones(miles);
    input.value = "";
  });
}

function loadStream(){
  try{
    return localStorage.getItem(CONFIG.streamStorageKey) || "";
  }catch{
    return "";
  }
}

function saveStream(url){
  localStorage.setItem(CONFIG.streamStorageKey, url);
}

function renderStream(url){
  const frame = qs("#streamFrame");
  if (!frame) return;
  frame.src = url || "";
}

function attachStreamUI(){
  const input = qs("#streamUrl");
  const btn = qs("#saveStream");
  if (!input || !btn) return;

  btn.addEventListener("click", () => {
    const url = String(input.value || "").trim();
    saveStream(url);
    renderStream(url);
  });
}

(function init(){
  setYear();
  setLiveBadge();

  const miles = loadMiles();
  renderMiles(miles);
  renderMilestones(miles);
  attachMilesUI();

  const stream = loadStream();
  renderStream(stream);

  const streamInput = qs("#streamUrl");
  if (streamInput) streamInput.value = stream;

  attachStreamUI();
})();