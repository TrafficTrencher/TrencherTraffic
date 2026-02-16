const CONFIG = {
  seasonGoalMiles: 25000,
  nextTarget: "Rear camera",
  isLive: false,
  dispatchUrl: "dispatch.json"
};

const DEFAULT_STATS = { milesSeason: 0, milesToday: 0, updatedAtISO: null };
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

function render(stats){
  const milesSeason = clampInt(stats.milesSeason);
  const milesToday = clampInt(stats.milesToday);
  const goal = CONFIG.seasonGoalMiles;

  const pct = goal > 0 ? Math.min(100, Math.floor((milesSeason / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - milesSeason);

  const updatedAtEl = qs("#updatedAt");
  if(updatedAtEl) updatedAtEl.textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;

  if(qs("#seasonGoal")) qs("#seasonGoal").textContent = String(goal);
  if(qs("#milesSeason")) qs("#milesSeason").textContent = String(milesSeason);
  if(qs("#milesToday")) qs("#milesToday").textContent = String(milesToday);
  if(qs("#progressPct")) qs("#progressPct").textContent = String(pct);
  if(qs("#remainingMiles")) qs("#remainingMiles").textContent = String(remaining);

  const fill = qs("#progressFill");
  if(fill) fill.style.width = `${pct}%`;

  if(qs("#progressMetaLeft")) qs("#progressMetaLeft").textContent = `${pct}%`;
  if(qs("#progressMetaRight")) qs("#progressMetaRight").textContent = `${goal.toLocaleString()} mi`;
  if(qs("#nextTargetConsole")) qs("#nextTargetConsole").textContent = CONFIG.nextTarget;

  const liveText = qs("#liveText");
  const liveDot = qs("#liveDot");
  if(CONFIG.isLive){
    if(liveText) liveText.textContent = "Live";
    if(liveDot){
      liveDot.style.background = "rgba(154,252,255,.95)";
      liveDot.style.boxShadow = "0 0 16px rgba(154,252,255,.65)";
    }
  }else{
    if(liveText) liveText.textContent = "Offline";
    if(liveDot){
      liveDot.style.background = "rgba(255,255,255,.35)";
      liveDot.style.boxShadow = "none";
    }
  }
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
  log.innerHTML = sorted.slice(0, 12).map(e => {
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
    if(!res.ok) throw new Error("dispatch fetch failed");
    const data = await res.json();
    renderMissionLog(data);
  }catch{
    log.innerHTML = `<div class="log__empty">Dispatch unavailable. Add <code>dispatch.json</code> in the repo root.</div>`;
    const meta = qs("#logUpdated");
    if(meta) meta.textContent = "—";
  }
}

(function init(){
  render(loadStats());
  loadMissionLog();
})();