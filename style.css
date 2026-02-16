/**
 * Trencher Traffic — revamp v20
 * - Overlay mode: ?overlay=1
 * - Minimal live metrics + links
 * - NOTE: No backend. If you want secure “only I can edit miles” we’ll need a backend or GitHub Actions.
 *   This file provides a simple local "admin unlock" so random visitors can’t casually change numbers.
 */

const CONFIG = {
  watchUrl: "https://x.com",     // TODO: replace with your actual live stream URL
  xUrl: "https://x.com",         // TODO: replace with your X profile
  tokenUrl: "#",                 // TODO: replace with token page (optional)
  // “Live” is manual for now (safe + simple). Change to true when streaming.
  isLive: false,
  // Next upgrade target text displayed on hero panel
  nextTarget: "Tesla down payment → FSD fund",
};

// --- Simple stored stats (edit locally, persists in your browser)
const DEFAULT_STATS = {
  milesSeason: 0,
  milesToday: 0,
  streak: 0,
  updatedAtISO: null,
};

function qs(sel) { return document.querySelector(sel); }
function getParam(name) { return new URLSearchParams(location.search).get(name); }

function loadStats() {
  try {
    const raw = localStorage.getItem("tt_stats_v1");
    if (!raw) return { ...DEFAULT_STATS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATS, ...parsed };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

function saveStats(stats) {
  localStorage.setItem("tt_stats_v1", JSON.stringify(stats));
}

function fmtUpdated(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { year:"numeric", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" });
  } catch {
    return "—";
  }
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
  const milesSeason = qs("#milesSeason");
  const milesToday = qs("#milesToday");
  const streak = qs("#streak");
  const updatedAt = qs("#updatedAt");
  const nextTarget = qs("#nextTarget");

  const overlayMiles = qs("#overlayMiles");
  const overlayToday = qs("#overlayToday");
  const overlayStreak = qs("#overlayStreak");

  if (milesSeason) milesSeason.textContent = String(stats.milesSeason ?? 0);
  if (milesToday) milesToday.textContent = String(stats.milesToday ?? 0);
  if (streak) streak.textContent = String(stats.streak ?? 0);
  if (updatedAt) updatedAt.textContent = `Updated: ${fmtUpdated(stats.updatedAtISO)}`;
  if (nextTarget) nextTarget.textContent = CONFIG.nextTarget;

  if (overlayMiles) overlayMiles.textContent = String(stats.milesSeason ?? 0);
  if (overlayToday) overlayToday.textContent = String(stats.milesToday ?? 0);
  if (overlayStreak) overlayStreak.textContent = String(stats.streak ?? 0);
}

function setYear() {
  const y = qs("#year");
  if (y) y.textContent = String(new Date().getFullYear());
}

/**
 * ADMIN UNLOCK (local only)
 * Visit: yoursite.com/?admin=1
 * Then it prompts for a passphrase.
 * - This is NOT secure against determined users (front-end only),
 *   but it prevents casual messing with your numbers.
 */
function maybeAdmin(stats) {
  const admin = getParam("admin");
  if (admin !== "1") return;

  const ok = sessionStorage.getItem("tt_admin_ok") === "1";
  if (!ok) {
    const pass = prompt("Admin passphrase:");
    // TODO: change this to whatever you want
    if (pass !== "trencher") {
      alert("Nope.");
      return;
    }
    sessionStorage.setItem("tt_admin_ok", "1");
  }

  const milesSeason = prompt("Miles (Season):", String(stats.milesSeason ?? 0));
  if (milesSeason === null) return;
  const milesToday = prompt("Miles (Today):", String(stats.milesToday ?? 0));
  if (milesToday === null) return;
  const streak = prompt("Weekday Streak:", String(stats.streak ?? 0));
  if (streak === null) return;

  const next = {
    ...stats,
    milesSeason: Math.max(0, parseInt(milesSeason, 10) || 0),
    milesToday: Math.max(0, parseInt(milesToday, 10) || 0),
    streak: Math.max(0, parseInt(streak, 10) || 0),
    updatedAtISO: new Date().toISOString(),
  };

  saveStats(next);
  renderStats(next);
  alert("Saved (locally, on this device/browser).");
}

/**
 * OVERLAY MODE
 * If ?overlay=1, we hide the full site and show only the overlay widget.
 */
function applyOverlayMode() {
  const overlay = getParam("overlay") === "1";
  if (!overlay) return;

  // hide normal content
  const main = document.querySelector("main");
  const header = document.querySelector("header");
  if (main) main.style.display = "none";
  if (header) header.style.display = "none";

  const overlayRoot = qs("#overlayRoot");
  if (overlayRoot) {
    overlayRoot.style.display = "flex";
    overlayRoot.setAttribute("aria-hidden", "false");
  }

  // Transparent page background can help OBS/Prism chroma workflows
  document.body.style.background = "transparent";
}

(function init(){
  setLinks();
  setLiveUI();
  setYear();
  applyOverlayMode();

  const stats = loadStats();
  renderStats(stats);

  // Optional local admin edit
  maybeAdmin(stats);
})();