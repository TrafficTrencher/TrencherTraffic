/* =========================================================
   Trencher Traffic — app.js
   Live stream + countdown + milestones
   ========================================================= */

/* ---------------- CONFIG ---------------- */

const GOAL_MILES = 50000;
const CLAIMS_TOTAL = 25;
const STEP = GOAL_MILES / CLAIMS_TOTAL;

// Feb 2, 2026 @ 3:00 PM EST = 20:00 UTC
const TARGET_UTC_MS = Date.UTC(2026, 1, 2, 20, 0, 0);

/* ---------------- HELPERS ---------------- */

const $ = (id) => document.getElementById(id);

function fmt(n) {
  return Math.max(0, Math.floor(Number(n) || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function clampMiles(n) {
  return Math.max(0, Math.min(GOAL_MILES, Math.floor(Number(n) || 0)));
}

/* ---------------- LIVE BADGE ---------------- */

function setLiveBadge(isLive) {
  const badge = $("liveBadge");
  if (!badge) return;

  if (isLive) {
    badge.classList.add("is-live");
    badge.textContent = "LIVE";
  } else {
    badge.classList.remove("is-live");
    badge.textContent = "OFFLINE";
  }
}

/* ---------------- STREAM ---------------- */

function setStream(url) {
  const frame = $("streamFrame");
  if (frame) frame.src = url || "";
  setLiveBadge(!!url);
}

/* ---------------- MILESTONES ---------------- */

function buildMilestones(current) {
  const list = $("milestoneList");
  if (!list) return;

  list.innerHTML = "";

  for (let i = 1; i <= CLAIMS_TOTAL; i++) {
    const mileMark = i * STEP;
    const done = current >= mileMark;

    const li = document.createElement("li");
    li.style.cssText = `
      margin: 10px 0;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,.12);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(255,255,255,.03);
    `;

    const left = document.createElement("div");
    left.innerHTML = `
      <b>Claim ${i}</b>
      <div style="font-size:12px;color:#9aa6c4">${fmt(mileMark)} miles</div>
    `;

    const tag = document.createElement("div");
    tag.textContent = done ? "DONE" : "PENDING";
    tag.style.cssText = `
      font-size: 12px;
      font-weight: 800;
      padding: 6px 10px;
      border-radius: 999px;
      border: 1px solid rgba(255,255,255,.12);
      color: ${done ? "#07101a" : "#a8b3d1"};
      background: ${
        done
          ? "linear-gradient(135deg,#7c5cff,#00d4ff)"
          : "rgba(255,255,255,.05)"
      };
    `;

    li.appendChild(left);
    li.appendChild(tag);
    list.appendChild(li);
  }
}

/* ---------------- MILES UI ---------------- */

function updateMilesUI(current) {
  const pct = Math.round((current / GOAL_MILES) * 1000) / 10;

  if ($("currentMilesText")) $("currentMilesText").textContent = fmt(current);
  if ($("percentText")) $("percentText").textContent = `${pct}%`;
  if ($("barFill"))
    $("barFill").style.width = `${Math.min(100, pct)}%`;

  buildMilestones(current);
}

/* ---------------- COUNTDOWN ---------------- */

function formatDuration(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  return `${d > 0 ? d + "d " : ""}${h}h ${m}m ${s}s`;
}

function updateCountdown() {
  const el = $("countdown");
  if (!el) return;

  const now = Date.now();
  const diff = TARGET_UTC_MS - now;

  if (diff <= 0) {
    el.innerHTML = "🚀 Stream is LIVE!";
    return;
  }

  el.innerHTML = `
    Countdown to Feb 2 • 3:00 PM EST
    <span style="opacity:.8">(${formatDuration(diff)})</span>
  `;
}

/* ---------------- INIT ---------------- */

function init() {
  // Footer year
  if ($("year")) $("year").textContent = new Date().getFullYear();

  // Load saved data
  const savedStream = localStorage.getItem("tt_stream_url") || "";
  const savedMiles = clampMiles(localStorage.getItem("tt_miles") || 0);

  if ($("streamUrl")) $("streamUrl").value = savedStream;
  if ($("currentMiles")) $("currentMiles").value = savedMiles || "";

  setStream(savedStream);
  updateMilesUI(savedMiles);

  // Save stream
  $("saveStream")?.addEventListener("click", () => {
    const url = $("streamUrl").value.trim();
    localStorage.setItem("tt_stream_url", url);
    setStream(url);
  });

  // Save miles
  $("saveMiles")?.addEventListener("click", () => {
    const miles = clampMiles($("currentMiles").value);
    localStorage.setItem("tt_miles", miles);
    updateMilesUI(miles);
  });

  // Countdown tick
  updateCountdown();
  setInterval(updateCountdown, 1000);
}

document.addEventListener("DOMContentLoaded", init);

