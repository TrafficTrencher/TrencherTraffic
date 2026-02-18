/* Trencher Traffic — app.js
   - Updates progress UI
   - Set your links + live numbers in CONFIG below
*/

const CONFIG = {
  // --- LINKS (set these) ---
  watchLiveUrl: "https://pump.fun",      // put your live page / stream link
  followXUrl: "https://x.com/TrencherTraffic",
  pumpFunTokenUrl: "https://pump.fun",   // put your token link
  fomoAppUrl: "https://fomo.app",        // replace if you have a specific link
  youtubeUrl: "https://www.youtube.com", // put your clipping channel link

  // --- PROGRESS SETTINGS ---
  seasonGoalMiles: 25000,
  feeClaimEveryMiles: 1000,

  // Set current miles here (manual update)
  currentMiles: 0,

  // Optional: show a custom status string
  top25StatusText: "In Progress"
};

function fmtNumber(n) {
  try { return new Intl.NumberFormat("en-US").format(n); }
  catch { return String(n); }
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function computeNextClaimMiles(current, step) {
  if (step <= 0) return 0;
  const remainder = current % step;
  const toNext = remainder === 0 ? step : (step - remainder);
  return current + toNext;
}

function setHref(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  el.href = url || "#";
  if (!url) el.setAttribute("aria-disabled", "true");
}

function updateUI() {
  const miles = Number(CONFIG.currentMiles) || 0;
  const goal = Number(CONFIG.seasonGoalMiles) || 25000;
  const claimStep = Number(CONFIG.feeClaimEveryMiles) || 1000;

  const nextClaim = computeNextClaimMiles(miles, claimStep);
  const milesToGoal = Math.max(0, goal - miles);
  const pct = goal > 0 ? clamp((miles / goal) * 100, 0, 999) : 0;

  const milesEl = document.getElementById("milesValue");
  const goalEl = document.getElementById("seasonGoalValue");
  const nextEl = document.getElementById("nextClaimValue");
  const milesToGoalEl = document.getElementById("milesToGoalValue");
  const pctEl = document.getElementById("seasonPctLabel");
  const barEl = document.getElementById("seasonBar");
  const yearEl = document.getElementById("year");
  const top25StatusEl = document.getElementById("top25Status");

  if (milesEl) milesEl.textContent = fmtNumber(miles);
  if (goalEl) goalEl.textContent = fmtNumber(goal);
  if (nextEl) nextEl.textContent = fmtNumber(nextClaim);
  if (milesToGoalEl) milesToGoalEl.textContent = fmtNumber(milesToGoal);
  if (pctEl) pctEl.textContent = `${pct.toFixed(1)}%`;
  if (barEl) barEl.style.width = `${clamp(pct, 0, 100)}%`;
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  if (top25StatusEl) top25StatusEl.textContent = CONFIG.top25StatusText || "In Progress";
}

function init() {
  // Wire buttons/links
  setHref("btnWatchLive", CONFIG.watchLiveUrl);
  setHref("btnFollowX", CONFIG.followXUrl);
  setHref("pumpLink", CONFIG.pumpFunTokenUrl);
  setHref("fomoLink", CONFIG.fomoAppUrl);
  setHref("ytLink", CONFIG.youtubeUrl);

  updateUI();
}

document.addEventListener("DOMContentLoaded", init);