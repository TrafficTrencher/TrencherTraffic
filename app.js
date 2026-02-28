const LS_STREAM = "tt_stream_url";
const LS_MILES  = "tt_total_miles";

const $ = (id) => document.getElementById(id);

function setStatus(isLive){
  const pill = $("statusPill");
  const dot  = pill.querySelector(".dot");
  const txt  = $("statusText");

  if(isLive){
    txt.textContent = "LIVE";
    dot.style.background = "#44ff9a";
    dot.style.boxShadow = "0 0 0 4px rgba(68,255,154,.14)";
  } else {
    txt.textContent = "OFFLINE";
    dot.style.background = "#9aa6c4";
    dot.style.boxShadow = "0 0 0 4px rgba(154,166,196,.12)";
  }
}

function setMode(hasStream){
  const mode = $("modeText");
  if(!mode) return;
  mode.textContent = hasStream ? "OPERATIONAL" : "HUMAN-REQUIRED";
}

function setPlayer(url){
  const frame = $("streamFrame");
  const empty = $("playerEmpty");

  if(url && url.trim()){
    frame.src = url.trim();
    empty.style.display = "none";
    setStatus(true);
    setMode(true);
  } else {
    frame.src = "";
    empty.style.display = "grid";
    setStatus(false);
    setMode(false);
  }
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function renderMiles(total){
  total = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const goal = 25000;
  const pct = clamp((total/goal)*100, 0, 100);

  $("mileNumber").textContent = total.toLocaleString();
  $("mileFill").style.width = pct.toFixed(2) + "%";
  $("milePct").textContent = pct.toFixed(1) + "%";
  $("mileInput").value = total;
}

function saveMiles(){
  const val = parseInt($("mileInput").value || "0", 10);
  const total = Number.isFinite(val) ? Math.max(0, val) : 0;
  localStorage.setItem(LS_MILES, String(total));
  renderMiles(total);
}

function clearMiles(){
  localStorage.removeItem(LS_MILES);
  renderMiles(0);
}

function saveStream(){
  const url = $("streamUrl").value || "";
  localStorage.setItem(LS_STREAM, url.trim());
  setPlayer(url);
}

function clearStream(){
  localStorage.removeItem(LS_STREAM);
  $("streamUrl").value = "";
  setPlayer("");
}

function init(){
  $("year").textContent = new Date().getFullYear();

  const savedStream = localStorage.getItem(LS_STREAM) || "";
  $("streamUrl").value = savedStream;
  setPlayer(savedStream);

  $("saveStream").addEventListener("click", saveStream);
  $("clearStream").addEventListener("click", clearStream);

  const savedMilesRaw = localStorage.getItem(LS_MILES);
  const savedMiles = savedMilesRaw ? parseInt(savedMilesRaw, 10) : 0;
  renderMiles(Number.isFinite(savedMiles) ? savedMiles : 0);

  $("saveMiles").addEventListener("click", saveMiles);
  $("clearMiles").addEventListener("click", clearMiles);
}

init();
