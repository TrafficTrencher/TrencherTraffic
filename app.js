// /docs/app.js ✅ FULL REPLACEMENT (uses your v2 base)

const CONFIG = {
  goalMiles: 25000,
  milestoneCount: 25,            // 25k / 25 = 1,000-mile checkpoints
  milesStorageKey: "tt_miles_v2",
  streamStorageKey: "tt_stream_v2",
  liveStorageKey: "tt_live_v2",
  fomoReferralUrl: "https://fomo.family/r/TrafficTrencher"
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

/* ========= LIVE (MANUAL) ========= */
function loadLiveFlag(){
  try{ return localStorage.getItem(CONFIG.liveStorageKey) === "1"; }
  catch{ return false; }
}
function saveLiveFlag(on){
  try{ localStorage.setItem(CONFIG.liveStorageKey, on ? "1" : "0"); }
  catch{}
}
function loadStream(){
  try{ return localStorage.getItem(CONFIG.streamStorageKey) || ""; }
  catch{ return ""; }
}
function saveStream(url){
  try{ localStorage.setItem(CONFIG.streamStorageKey, url); }
  catch{}
}
function clearStream(){
  try{ localStorage.removeItem(CONFIG.streamStorageKey); }
  catch{}
}

function computeIsLive(streamUrl, liveFlag){
  // Live only when toggle ON and a stream URL exists
  return !!(liveFlag && streamUrl && String(streamUrl).trim().length > 0);
}

function setLiveBadge(isLive){
  const badge = qs("#liveBadge");
  if (!badge) return;

  if (isLive){
    badge.textContent = "LIVE";
    badge.classList.add("is-live");
  }else{
    badge.textContent = "OFFLINE";
    badge.classList.remove("is-live");
  }
}

function renderStream(url){
  const frame = qs("#streamFrame");
  if (!frame) return;
  frame.src = url || "";
}

function syncLiveUI(streamUrl, liveFlag){
  const toggle = qs("#liveToggle");
  if (toggle) toggle.checked = !!liveFlag;

  const isLive = computeIsLive(streamUrl, liveFlag);
  setLiveBadge(isLive);
}

function attachStreamUI(){
  const input = qs("#streamUrl");
  const saveBtn = qs("#saveStream");
  const clearBtn = qs("#clearStream");
  const liveToggle = qs("#liveToggle");

  if (input){
    input.value = loadStream();
  }

  if (saveBtn && input){
    saveBtn.addEventListener("click", () => {
      const url = String(input.value || "").trim();
      saveStream(url);
      renderStream(url);

      const liveFlag = loadLiveFlag();
      syncLiveUI(url, liveFlag);
    });
  }

  if (clearBtn && input){
    clearBtn.addEventListener("click", () => {
      input.value = "";
      clearStream();
      renderStream("");

      // Clearing stream forces LIVE off
      saveLiveFlag(false);
      if (liveToggle) liveToggle.checked = false;
      syncLiveUI("", false);
    });
  }

  if (liveToggle){
    liveToggle.addEventListener("change", () => {
      const on = !!liveToggle.checked;
      saveLiveFlag(on);

      const url = loadStream();
      syncLiveUI(url, on);
    });
  }
}

/* ========= THE OPERATION DEFAULT OPEN ON DESKTOP ========= */
function setThesisDefault(){
  const d = qs("#thesisDetails");
  if (!d) return;

  const mq = window.matchMedia("(min-width: 901px)");
  const apply = () => { d.open = mq.matches; };

  apply();
  try{ mq.addEventListener("change", apply); }
  catch{ mq.addListener(apply); }
}

/* ========= MILES + MILESTONES ========= */
function loadMiles(){
  try{
    const raw = localStorage.getItem(CONFIG.milesStorageKey);
    return clampInt(raw ?? 0);
  }catch{
    return 0;
  }
}
function saveMiles(miles){
  try{ localStorage.setItem(CONFIG.milesStorageKey, String(clampInt(miles))); }
  catch{}
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

  const step = Math.floor(CONFIG.goalMiles / CONFIG.milestoneCount); // 1000
  const items = [];

  for (let i = 1; i <= CONFIG.milestoneCount; i++){
    const at = i * step;
    const done = miles >= at;

    items.push(`
      <li style="color:${done ? "rgba(233,238,251,.95)" : "rgba(168,179,209,.85)"}">
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

/* ========= COPY FOMO (clean default state) ========= */
async function copyToClipboard(text){
  if (navigator.clipboard && navigator.clipboard.writeText){
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "");
  ta.style.position = "absolute";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(ta);
  return ok;
}

function attachCopyFomo(){
  const btn = qs("#copyFomo");
  const toast = qs("#copyToast");

  // Force hidden on load every time
  if (toast){
    toast.hidden = true;
    toast.textContent = "Copied ✓";
  }

  if (!btn) return;

  btn.addEventListener("click", async () => {
    try{
      await copyToClipboard(CONFIG.fomoReferralUrl);
      if (toast){
        toast.hidden = false;
        clearTimeout(attachCopyFomo._t);
        attachCopyFomo._t = setTimeout(() => { toast.hidden = true; }, 1400);
      }
    }catch{
      window.open(CONFIG.fomoReferralUrl, "_blank", "noopener");
    }
  });
}

/* ========= INIT ========= */
(function init(){
  setYear();
  setThesisDefault();

  // Miles
  const miles = loadMiles();
  renderMiles(miles);
  renderMilestones(miles);
  attachMilesUI();

  // Stream + Live
  const stream = loadStream();
  renderStream(stream);
  const liveFlag = loadLiveFlag();
  syncLiveUI(stream, liveFlag);
  attachStreamUI();

  // Copy
  attachCopyFomo();
})();