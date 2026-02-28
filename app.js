// Traffic Trencher — app.js (Polish Pass 3)

const CONFIG = {
  goalMiles: 25000,
  milestoneCount: 25,
  milesStorageKey: "tt_miles_v1",
  streamStorageKey: "tt_stream_v1",
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

function setLiveBadge(isLive){
  const badge = qs("#liveBadge");
  if (!badge) return;

  if (isLive){
    badge.textContent = "LIVE";
    badge.classList.add("is-live");
  } else {
    badge.textContent = "OFFLINE";
    badge.classList.remove("is-live");
  }

  document.documentElement.classList.toggle("tt-live", !!isLive);

  // Now Live banner
  const nowLive = qs("#nowLive");
  if (nowLive){
    nowLive.hidden = !isLive;
  }
}

function setThesisDefault(){
  const d = qs("#thesisDetails");
  if (!d) return;

  const mq = window.matchMedia("(min-width: 901px)");
  const apply = () => { d.open = mq.matches; };

  apply();
  try{ mq.addEventListener("change", apply); }
  catch{ mq.addListener(apply); }
}

/* Reveal on scroll */
function setupReveal(){
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window) || els.length === 0){
    els.forEach(el => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    for (const e of entries){
      if (e.isIntersecting){
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    }
  }, { threshold: 0.10, rootMargin: "60px 0px" });

  els.forEach(el => io.observe(el));
}

/* Miles */
function loadMiles(){
  try{
    const raw = localStorage.getItem(CONFIG.milesStorageKey);
    return clampInt(raw ?? 0);
  }catch{
    return 0;
  }
}
function saveMiles(miles){
  localStorage.setItem(CONFIG.milesStorageKey, String(clampInt(miles)));
}

function renderClaimsHUD(miles){
  const nextClaimAtEl = qs("#nextClaimAt");
  const milesToNextEl = qs("#milesToNext");
  const claimsDoneEl = qs("#claimsDone");
  const claimsTotalEl = qs("#claimsTotal");
  const claimFillEl = qs("#claimFill");

  const step = Math.floor(CONFIG.goalMiles / CONFIG.milestoneCount);
  const totalClaims = CONFIG.milestoneCount;

  const done = Math.min(totalClaims, Math.floor(miles / step));
  const nextAt = Math.min(CONFIG.goalMiles, (done + 1) * step);
  const milesToNext = Math.max(0, nextAt - miles);

  const withinStep = miles % step;
  const stepPct = step > 0 ? Math.min(100, Math.floor((withinStep / step) * 100