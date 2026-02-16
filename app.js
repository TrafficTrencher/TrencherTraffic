/**
 * Trencher Traffic — revamp v21
 * Updates per direction:
 * - Season 1 goal: 25,000 miles + Friday creator-fee claim
 * - Next upgrade target: Rear camera
 * - Copy aligned to "week day route" + "Wage Maxxing"
 * - Overlay mode retained (?overlay=1) without calling it out in the UI copy
 *
 * NOTE:
 * This is still a front-end-only stats store (localStorage).
 * It prevents casual edits, but it’s not a true secure global updater yet.
 */

const CONFIG = {
  watchUrl: "https://x.com",     // TODO: replace with your actual live stream URL
  xUrl: "https://x.com",         // TODO: replace with your X profile
  tokenUrl: "#",                 // TODO: replace with token page (optional)
  isLive: false,                 // manual toggle
  seasonGoalMiles: 25000,
  claimDayLabel: "Every Friday",
  nextTarget: "Rear camera",
};

const DEFAULT_STATS = {
  milesSeason: 0,
  milesToday: 0,
  updatedAtISO: null,
};

function qs(sel) { return document.querySelector(sel); }
function getParam(name) { return new URLSearchParams(location.search).get(name); }

function loadStats() {
  try {
    const raw = localStorage.getItem("tt_stats_v2");
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats(stats) {
  localStorage.setItem("tt_stats_v2", JSON.stringify(stats));
}

function fmtUpdated(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      year:"numeric", month:"short", day:"2-digit",
      hour:"2-digit", minute:"2-digit"
    });
  } catch {
    return "—";
  }
}

function clampInt(n) {
  const v = parseInt(n, 10);
  if (Number.isNaN(v) || !Number.isFinite(v)) return 0;
  return Math.max(0, v);
}

function setLinks() {
  const watchBtn = qs("#watchBtn");
  const watchBtn2 = qs("#watchBtn2");
  const xLink = qs("#xLink");
  const streamLink = qs("#streamLink");
  const tokenLink = qs("#tokenLink");

  if (watchBtn) watchBtn.href = CONFIG.watchUrl;
  if (watchBtn2) watchBtn2.href = CONFIG.watchUrl;

  if (xLink) xLink.href = CONFIG.xUrl;
  if (streamLink) streamLink.href = CONFIG.watchUrl;
  if (tokenLink) tokenLink.href = CONFIG.tokenUrl;
}

function setLiveUI() {
  const liveBadge = qs("#liveBadge");
  const liveDot = qs("#liveDot");
  const liveText = qs("#liveText");
  const overlayLive = qs("#overlayLive");

  if (CONFIG.isLive) {
    if (liveBadge) liveBadge.textContent = "LIVE";
    if (liveDot) {
      liveDot.style.background = "rgba(154,252,255,.95)";
      liveDot.style.boxShadow = "0 0 16px rgba(154,252,255,.65)";
    }
    if (liveText) liveText.textContent = "Live";
    if (overlayLive) overlayLive.textContent = "LIVE";
  } else {
    if (liveBadge) liveBadge.textContent = "OFFLINE";
    if (liveDot) {
      liveDot.style.background = "rgba(255,255,255,.35)";
      liveDot.style.boxShadow = "none";
    }
    if (liveText) liveText.textContent = "Offline";
    if (overlayLive) overlayLive.textContent = "OFFLINE";
  }
}

function renderStats(stats) {
  const milesSeasonEl = qs("#milesSeason");
  const milesTodayEl = qs("#milesToday");
  const updatedAtEl = qs("#updatedAt");
  const nextTargetEl = qs("#nextTarget");
  const claimDayEl = qs("#claimDay");

  const progressPctEl = qs("#progressPct");
  const remainingMilesEl = qs("#remainingMiles");

  // Overlay
  const overlayMiles = qs("#overlayMiles");
  const overlayToday = qs("#overlayToday");
  const overlayNext = qs("#overlayNext");

  const milesSeason = clampInt(stats.milesSeason);
  const milesToday = clampInt(stats.milesToday);

  const goal = CONFIG.seasonGoalMiles;
  const pct = goal > 0 ? Math.min(100, Math.floor((milesSeason / goal) * 100)) : 0;
  const remaining = Math.max(0, goal - milesSeason);

  if (milesSeasonEl) milesSeasonEl.textContent = String(milesSeason);
  if (milesTodayEl) milesTodayEl.textContent = String(milesToday);

  if (progressPctEl) progressPctEl.textContent = String(pct);
  if (remainingMilesEl) remainingMilesEl.textContent = String(remaining);

  if (updatedAtEl) updatedAtEl.textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;
  if (nextTargetEl) nextTargetEl.textContent = CONFIG.nextTarget;
  if (claimDayEl) claimDayEl.textContent = CONFIG.claimDayLabel;

  if (overlayMiles) overlayMiles.textContent = String(milesSeason);
  if (overlayToday) overlayToday.textContent = String(milesToday);
  if (overlayNext) overlayNext.textContent = "Rear cam";
}

function setYear() {
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

/**
 * Local ADMIN UNLOCK (not global / not secure)
 * Visit: ?admin=1
 * Passphrase: change in code
 */
function maybeAdmin(stats) {
  const admin = getParam("admin");
  if (admin !== "1") return;

  const ok = sessionStorage.getItem("tt_admin_ok") === "1";
  if (!ok) {
    const pass = prompt("Admin passphrase:");
    // TODO: change this to something only you know
    if (pass !== "trencher") {
      alert("Nope.");
      return;
    }
    sessionStorage.setItem("tt_admin_ok", "1");
  }

  const milesSeason = prompt("Season 1 Miles (0–25000+):", String(stats.milesSeason ?? 0));
  if (milesSeason === null) return;
  const milesToday = prompt("Miles Today:", String(stats.milesToday ?? 0));
  if (milesToday === null) return;

  const next = {
    ...stats,
    milesSeason: clampInt(milesSeason),
    milesToday: clampInt(milesToday),
    updatedAtISO: new Date().toISOString(),
  };

  saveStats(next);
  renderStats(next);
  alert("Saved locally (this device/browser).");
}

/**
 * OVERLAY MODE
 * If ?overlay=1, hide the full site and show only the overlay widget.
 */
function applyOverlayMode() {
  const overlay = getParam("overlay") === "1";
  if (!overlay) return;

  const main = document.querySelector("main");
  const header = document.querySelector("header");
  if (main) main.style.display = "none";
  if (header) header.style.display = "none";

  const overlayRoot = qs("#overlayRoot");
  if (overlayRoot) {
    overlayRoot.style.display = "flex";
    overlayRoot.setAttribute("aria-hidden", "false");
  }

  // Useful for capture workflows
  document.body.style.background = "transparent";
}

(function init(){
  setLinks();
  setLiveUI();
  setYear();
  applyOverlayMode();

  const stats = loadStats();
  renderStats(stats);

  maybeAdmin(stats);
})();