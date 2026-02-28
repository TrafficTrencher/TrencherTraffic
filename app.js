// Traffic Trencher — app.js

const CONFIG = {
  goalMiles: 25000,
  milestoneCount: 25, // 25k / 25 = 1,000-mile claims
  milesStorageKey: "tt_miles_v1",
  streamStorageKey: "tt_stream_v1"
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

function setLiveBadge(isLive){
  const badge = qs("#liveBadge");
  if (!badge) return;

  if (isLive){
    badge.textContent = "LIVE";
    badge.classList.add("is-live");
  } else {
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
  try{ mq.addEventListener("change", apply); }
  catch{ mq.addListener(apply); } // Safari fallback
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

function renderClaimsHUD(miles){
  const nextClaimAtEl = qs("#nextClaimAt");
  const milesToNextEl = qs("#milesToNext");
  const claimsDoneEl = qs("#claimsDone");
  const claimsTotalEl = qs("#claimsTotal");
  const claimFillEl = qs("#claimFill");

  const step = Math.floor(CONFIG.goalMiles / CONFIG.milestoneCount); // 1000
  const totalClaims = CONFIG.milestoneCount;

  const done = Math.min(totalClaims, Math.floor(miles / step));
  const nextAt = Math.min(CONFIG.goalMiles, (done + 1) * step);
  const milesToNext = Math.max(0, nextAt - miles);

  const withinStep = miles % step;
  const stepPct = step > 0 ? Math.min(100, Math.floor((withinStep / step) * 100)) : 0;

  if (nextClaimAtEl) nextClaimAtEl.textContent = nextAt.toLocaleString();
  if (milesToNextEl) milesToNextEl.textContent = milesToNext.toLocaleString();
  if (claimsDoneEl) claimsDoneEl.textContent = String(done);
  if (claimsTotalEl) claimsTotalEl.textContent = String(totalClaims);
  if (claimFillEl) claimFillEl.style.width = `${stepPct}%`;
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

  renderClaimsHUD(miles);
}

function renderMilestones(miles){
  const list = qs("#milestoneList");
  if (!list) return;

  const step = Math.floor(CONFIG.goalMiles / CONFIG.milestoneCount); // 1000
  const items = [];

  for (let i = 1; i <= CONFIG.milestoneCount; i++){
    const at = i * step;
    const done = miles >= at;
    items.push(`
      <li style="margin:6px 0; color:${done ? "rgba(233,238,251,.95)" : "rgba(168,179,209,.85)"}">
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

function clearStream(){
  try{
    localStorage.removeItem(CONFIG.streamStorageKey);
  }catch{}
}

function renderStream(url){
  const frame = qs("#streamFrame");
  if (frame) frame.src = url || "";
  setLiveBadge(!!(url && url.trim()));
}

function attachStreamUI(){
  const input = qs("#streamUrl");
  const saveBtn = qs("#saveStream");
  const clearBtn = qs("#clearStream");
  if (!input || !saveBtn) return;

  saveBtn.addEventListener("click", () => {
    const url = String(input.value || "").trim();
    saveStream(url);
    renderStream(url);
  });

  if (clearBtn){
    clearBtn.addEventListener("click", () => {
      clearStream();
      input.value = "";
      renderStream("");
    });
  }
}

(function init(){
  setYear();
  setThesisDefault();

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