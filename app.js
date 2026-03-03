// =============================
// Traffic Trencher - app.js
// =============================

// 1) Put your real stream URL here (Prism/YouTube/Twitch/etc).
// When this is set, badge flips to ONLINE and Open Stream works.
const STREAM_URL = ""; // e.g. "https://youtube.com/live/xxxxx"

const LS_MILES_KEY = "tt_miles_streamed_v1";

function qs(sel){ return document.querySelector(sel); }
function clampInt(n){ return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0; }

function setLiveBadge(){
  const badge = qs("#liveBadge");
  const link = qs("#streamLink");

  if(!badge) return;

  if(STREAM_URL && STREAM_URL.trim().length > 10){
    badge.textContent = "ONLINE";
    badge.classList.add("online");
    if(link){
      link.href = STREAM_URL;
      link.removeAttribute("aria-disabled");
      link.style.pointerEvents = "auto";
      link.style.opacity = "1";
    }
  }else{
    badge.textContent = "OFFLINE";
    badge.classList.remove("online");
    if(link){
      link.href = "#";
      link.setAttribute("aria-disabled", "true");
      link.style.pointerEvents = "none";
      link.style.opacity = ".75";
    }
  }
}

function syncThesisHint(){
  const d = qs("#thesisDetails");
  const hint = qs("#thesisHint");
  if(!d || !hint) return;
  hint.textContent = d.open ? "Tap to collapse" : "Tap to expand";
}

function getMiles(){
  const raw = localStorage.getItem(LS_MILES_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return clampInt(n);
}
function setMiles(n){
  localStorage.setItem(LS_MILES_KEY, String(clampInt(n)));
  const el = qs("#milesValue");
  if(el) el.textContent = String(getMiles());
}

function wireMilesButtons(){
  const addBtn = qs("#addMilesBtn");
  const resetBtn = qs("#resetMilesBtn");
  if(addBtn){
    addBtn.addEventListener("click", () => setMiles(getMiles() + 100));
  }
  if(resetBtn){
    resetBtn.addEventListener("click", () => setMiles(0));
  }
}

function wireOpenStreamBtn(){
  const btn = qs("#openStreamBtn");
  const link = qs("#streamLink");
  if(!btn) return;

  btn.addEventListener("click", (e) => {
    if(!(STREAM_URL && STREAM_URL.trim().length > 10)){
      // if offline, just scroll to watch section
      e.preventDefault();
      const watch = qs("#watch");
      if(watch) watch.scrollIntoView({behavior:"smooth", block:"start"});
      return;
    }
    // if online, open the stream
    // allow default anchor behavior
  });

  // also allow clicking Open Stream link when online
  if(link && STREAM_URL && STREAM_URL.trim().length > 10){
    link.href = STREAM_URL;
  }
}

async function loadMissionLog(){
  // You can add /docs/mission-log.json like:
  // [
  //  {"date":"2026-03-03","milestone":"Logo finalized","status":"done"},
  //  {"date":"2026-03-04","milestone":"Stream day 1","status":"in-progress"}
  // ]
  const rowsEl = qs("#missionLogRows");
  if(!rowsEl) return;

  const fallback = [
    {date:"—", milestone:"Stream route daily (Starlink)", status:"in-progress"},
    {date:"—", milestone:"Hit 1,000 mile checkpoint", status:"pending"},
    {date:"—", milestone:"Upgrade hardware stack", status:"pending"},
    {date:"—", milestone:"Acquire autonomy system", status:"pending"},
  ];

  let data = null;

  try{
    const res = await fetch("mission-log.json", {cache:"no-store"});
    if(res.ok){
      data = await res.json();
      if(!Array.isArray(data)) data = null;
    }
  }catch(_e){
    data = null;
  }

  const items = data || fallback;

  rowsEl.innerHTML = "";
  for(const item of items){
    const date = (item.date ?? "—");
    const milestone = (item.milestone ?? "—");
    const statusRaw = String(item.status ?? "pending").toLowerCase();

    const statusBadge =
      statusRaw.includes("done") ? `<span class="badge ok">DONE</span>` :
      statusRaw.includes("progress") ? `<span class="badge warn">LIVE</span>` :
      `<span class="badge">PENDING</span>`;

    const row = document.createElement("div");
    row.className = "log__row";
    row.innerHTML = `
      <div class="muted">${escapeHtml(date)}</div>
      <div>${escapeHtml(milestone)}</div>
      <div>${statusBadge}</div>
    `;
    rowsEl.appendChild(row);
  }
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function wireRefreshLog(){
  const btn = qs("#refreshLogBtn");
  if(!btn) return;
  btn.addEventListener("click", () => loadMissionLog());
}

function setYear(){
  const y = qs("#year");
  if(y) y.textContent = String(new Date().getFullYear());
}

(function init(){
  setLiveBadge();
  syncThesisHint();
  setMiles(getMiles());
  wireMilesButtons();
  wireOpenStreamBtn();
  wireRefreshLog();
  loadMissionLog();
  setYear();

  const d = qs("#thesisDetails");
  if(d){
    d.addEventListener("toggle", syncThesisHint);
  }
})();