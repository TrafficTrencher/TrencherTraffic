// docs/app.js
"use strict";

/**
 * ✅ CONFIG — edit these only
 * If you already have a CONFIG, paste your values here.
 */
const CONFIG = {
  goalMiles: 25000,
  currentMiles: 0,

  // creator fee claim cadence
  claimEveryMiles: 1000,

  // links
  watchUrl: "https://example.com/live",
  xUrl: "https://x.com/",
  tokenUrl: "https://pump.fun/",

  // status
  isLive: false, // set true when you go live
  eraLabel: "HUMAN DRIVER ERA — ACTIVE",

  // optional: current FOMO rank (wire to real data later)
  fomoRank: null
};

// ---------- helpers ----------
const fmt = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US").format(n);
};

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

// ---------- bind ----------
function initLinks(){
  const watch = document.getElementById("watchLink");
  const x = document.getElementById("xLink");
  const lwatch = document.getElementById("linkWatch");
  const lx = document.getElementById("linkX");
  const ltoken = document.getElementById("linkToken");

  if (watch) watch.href = CONFIG.watchUrl || "#";
  if (x) x.href = CONFIG.xUrl || "#";
  if (lwatch) lwatch.href = CONFIG.watchUrl || "#";
  if (lx) lx.href = CONFIG.xUrl || "#";
  if (ltoken) ltoken.href = CONFIG.tokenUrl || "#";
}

function initHeaderStatus(){
  const statusText = document.getElementById("statusText");
  const dot = document.querySelector(".status-dot");
  if (!statusText) return;

  statusText.textContent = CONFIG.isLive ? "ONLINE" : "OFFLINE";
  if (dot){
    dot.style.background = CONFIG.isLive ? "var(--accent2)" : "rgba(255,255,255,.7)";
    dot.style.boxShadow = CONFIG.isLive ? "0 0 0 4px rgba(0,212,255,.12)" : "none";
  }
}

function initHero(){
  const era = document.getElementById("eraLabel");
  if (era) era.textContent = CONFIG.eraLabel || "HUMAN DRIVER ERA — ACTIVE";
}

function initMetrics(){
  const goal = CONFIG.goalMiles || 0;
  const current = clamp(CONFIG.currentMiles || 0, 0, goal || 0);
  const remaining = Math.max(0, goal - current);
  const pct = goal > 0 ? Math.round((current / goal) * 100) : 0;

  const elGoal = document.getElementById("goalMiles");
  const elCurrent = document.getElementById("currentMiles");
  const elRemaining = document.getElementById("remainingMiles");
  const elPct = document.getElementById("progressPct");
  const fill = document.getElementById("progressFill");

  if (elGoal) elGoal.textContent = fmt(goal);
  if (elCurrent) elCurrent.textContent = fmt(current);
  if (elRemaining) elRemaining.textContent = fmt(remaining);
  if (elPct) elPct.textContent = `${pct}%`;
  if (fill) fill.style.width = `${clamp(pct, 0, 100)}%`;

  // claims
  const every = Math.max(1, CONFIG.claimEveryMiles || 1000);
  const claims = Math.floor(current / every);
  const nextAt = (claims + 1) * every;

  const elClaims = document.getElementById("claimsCount");
  const elNextAt = document.getElementById("nextClaimAt");
  const elEvery = document.getElementById("claimEvery");

  if (elClaims) elClaims.textContent = fmt(claims);
  if (elNextAt) elNextAt.textContent = fmt(nextAt);
  if (elEvery) elEvery.textContent = fmt(every);

  // fomo
  const fr = (CONFIG.fomoRank === null || CONFIG.fomoRank === undefined) ? "—" : fmt(CONFIG.fomoRank);
  const elFomo = document.getElementById("fomoRank");
  const elFomoBig = document.getElementById("fomoRankBig");
  if (elFomo) elFomo.textContent = fr;
  if (elFomoBig) elFomoBig.textContent = fr;
}

function initAccordion(){
  const btn = document.getElementById("opToggle");
  const panel = document.getElementById("opPanel");
  if (!btn || !panel) return;

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
}

function initModal(){
  const modal = document.getElementById("operationModal");
  const openBtn = document.getElementById("openOperation");
  if (!modal || !openBtn) return;

  const open = () => { modal.setAttribute("aria-hidden", "false"); };
  const close = () => { modal.setAttribute("aria-hidden", "true"); };

  openBtn.addEventListener("click", open);

  modal.addEventListener("click", (e) => {
    const t = e.target;
    if (t && (t.matches("[data-close]") || t.closest("[data-close]"))) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function initFooterYear(){
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
}

// ---------- run ----------
(function boot(){
  initLinks();
  initHeaderStatus();
  initHero();
  initMetrics();
  initAccordion();
  initModal();
  initFooterYear();
})();