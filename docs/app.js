/* =========================================================
   Traffic Trencher — app.js (v1201 compatible)
   Works with your provided index.html + style.css
   ========================================================= */

/* --------------------------
   CONFIG
-------------------------- */
const MILES_TARGET = 25000;
const MILESTONE_STEP = 1000;

const LS_STREAM_URL = "tt_stream_url";
const LS_STREAM_LIVE = "tt_live_toggle";     // "1" / "0"
const LS_MILES = "tt_current_miles";         // number as string

/* --------------------------
   DOM HELPERS
-------------------------- */
const $ = (id) => document.getElementById(id);

const liveBadge = $("liveBadge");
const streamFrame = $("streamFrame");
const streamUrlInput = $("streamUrl");
const liveToggle = $("liveToggle");
const saveStreamBtn = $("saveStream");
const clearStreamBtn = $("clearStream");

const currentMilesText = $("currentMilesText");
const percentText = $("percentText");
const barFill = $("barFill");
const currentMilesInput = $("currentMiles");
const saveMilesBtn = $("saveMiles");
const milestoneList = $("milestoneList");

const copyFomoBtn = $("copyFomo");
const copyToast = $("copyToast");

const yearEl = $("year");

/* --------------------------
   UTIL
-------------------------- */
function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function safeUrl(url) {
  if (!url) return "";
  const trimmed = String(url).trim();
  // basic allowlist: must be http(s)
  if (!/^https?:\/\//i.test(trimmed)) return "";
  return trimmed;
}

/* --------------------------
   LIVE BADGE
-------------------------- */
function setBadgeLive(isLive) {
  if (!liveBadge) return;

  if (isLive) {
    liveBadge.textContent = "LIVE";
    liveBadge.classList.add("is-live");
    // keep your dramatic gradient even if class exists
    liveBadge.style.background = "linear-gradient(90deg,#ff003c,#ff5a5a)";
    liveBadge.style.borderColor = "rgba(255,90,90,.75)";
    liveBadge.style.color = "#fff";
  } else {
    liveBadge.textContent = "OFFLINE";
    liveBadge.classList.remove("is-live");
    liveBadge.style.background = "rgba(255,255,255,.12)";
    liveBadge.style.borderColor = "rgba(255,255,255,.25)";
    liveBadge.style.color = "#ddd";
  }
}

/* --------------------------
   STREAM
-------------------------- */
function loadStreamFromStorage() {
  const url = safeUrl(localStorage.getItem(LS_STREAM_URL) || "");
  const isLive = (localStorage.getItem(LS_STREAM_LIVE) || "0") === "1";

  if (streamUrlInput) streamUrlInput.value = url;
  if (liveToggle) liveToggle.checked = isLive;

  applyStream(url, isLive);
}

function applyStream(url, isLive) {
  // Badge depends ONLY on manual toggle (your spec)
  setBadgeLive(Boolean(isLive));

  // Player loads when URL exists (even if offline — user can preview)
  if (streamFrame) {
    streamFrame.src = url || "";
  }
}

function saveStream() {
  const url = safeUrl(streamUrlInput ? streamUrlInput.value : "");
  const isLive = Boolean(liveToggle && liveToggle.checked);

  if (!url && streamUrlInput) {
    // allow save "blank" only via clear button; here we nudge user
    alert("Paste a valid https:// stream URL (or tap Clear).");
    return;
  }

  localStorage.setItem(LS_STREAM_URL, url);
  localStorage.setItem(LS_STREAM_LIVE, isLive ? "1" : "0");

  applyStream(url, isLive);
}

function clearStream() {
  localStorage.removeItem(LS_STREAM_URL);
  localStorage.setItem(LS_STREAM_LIVE, "0");

  if (streamUrlInput) streamUrlInput.value = "";
  if (liveToggle) liveToggle.checked = false;

  applyStream("", false);
}

/* --------------------------
   MILES + PROGRESS
-------------------------- */
function getMiles() {
  const raw = localStorage.getItem(LS_MILES);
  const n = Number(raw);
  return Number.isFinite(n) ? clamp(Math.floor(n), 0, 9999999) : 0;
}

function setMiles(n) {
  const clean = clamp(Math.floor(Number(n) || 0), 0, 9999999);
  localStorage.setItem(LS_MILES, String(clean));
  renderMiles();
}

function renderMiles() {
  const miles = getMiles();
  const pct = clamp((miles / MILES_TARGET) * 100, 0, 100);

  if (currentMilesText) currentMilesText.textContent = String(miles);
  if (percentText) percentText.textContent = `${Math.floor(pct)}%`;
  if (barFill) barFill.style.width = `${pct}%`;

  renderMilestones(miles);
}

function renderMilestones(miles) {
  if (!milestoneList) return;

  const count = Math.ceil(MILES_TARGET / MILESTONE_STEP); // 25 for 25k
  const reached = Math.floor(miles / MILESTONE_STEP);

  milestoneList.innerHTML = "";

  for (let i = 1; i <= count; i++) {
    const at = i * MILESTONE_STEP;
    const li = document.createElement("li");

    const isDone = i <= reached;

    // simple + clean text (style already handles list)
    li.textContent = isDone
      ? `✅ ${at.toLocaleString()} miles checkpoint`
      : `⬜ ${at.toLocaleString()} miles checkpoint`;

    milestoneList.appendChild(li);
  }
}

function saveMilesFromInput() {
  const val = currentMilesInput ? Number(currentMilesInput.value) : NaN;
  if (!Number.isFinite(val)) {
    alert("Enter a valid number of miles.");
    return;
  }
  setMiles(val);
}

/* --------------------------
   FOMO COPY
-------------------------- */
async function copyFomoLink() {
  const link = "https://fomo.family/r/TrafficTrencher";

  try {
    await navigator.clipboard.writeText(link);
    if (copyToast) {
      copyToast.hidden = false;
      clearTimeout(copyToast._t);
      copyToast._t = setTimeout(() => (copyToast.hidden = true), 1200);
    }
  } catch (e) {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = link;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      if (copyToast) {
        copyToast.hidden = false;
        clearTimeout(copyToast._t);
        copyToast._t = setTimeout(() => (copyToast.hidden = true), 1200);
      }
    } finally {
      document.body.removeChild(ta);
    }
  }
}

/* --------------------------
   INIT / EVENTS
-------------------------- */
function bindEvents() {
  if (saveStreamBtn) saveStreamBtn.addEventListener("click", saveStream);
  if (clearStreamBtn) clearStreamBtn.addEventListener("click", clearStream);

  // live toggle updates badge immediately
  if (liveToggle) {
    liveToggle.addEventListener("change", () => {
      const url = safeUrl(streamUrlInput ? streamUrlInput.value : localStorage.getItem(LS_STREAM_URL));
      const isLive = Boolean(liveToggle.checked);

      // store toggle instantly so refresh keeps state
      localStorage.setItem(LS_STREAM_LIVE, isLive ? "1" : "0");
      applyStream(url || "", isLive);
    });
  }

  // save miles
  if (saveMilesBtn) saveMilesBtn.addEventListener("click", saveMilesFromInput);

  // allow Enter key in miles field
  if (currentMilesInput) {
    currentMilesInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") saveMilesFromInput();
    });
  }

  // copy fomo
  if (copyFomoBtn) copyFomoBtn.addEventListener("click", copyFomoLink);
}

function init() {
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  loadStreamFromStorage();
  renderMiles();
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);