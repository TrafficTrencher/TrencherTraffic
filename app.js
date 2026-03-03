// ===== SETTINGS =====
const STATUS = "OFFLINE"; // change to "LIVE" whenever
// ====================

function qs(id){ return document.getElementById(id); }

function initLiveBadge(){
  const badge = qs("liveBadge");
  if (!badge) return;
  badge.textContent = STATUS;

  if (STATUS === "LIVE"){
    badge.style.background = "rgba(51, 255, 160, .16)";
    badge.style.borderColor = "rgba(51, 255, 160, .22)";
    badge.style.color = "rgba(238, 255, 248, .95)";
  }
}

function initDetailsHint(){
  const details = qs("thesisDetails");
  if (!details) return;

  const summary = details.querySelector(".thesis__summary");
  const hint = details.querySelector(".thesis__hint");
  if (!summary || !hint) return;

  const setHint = () => {
    hint.textContent = details.open ? "Tap to collapse" : "Tap to expand";
  };

  setHint();
  details.addEventListener("toggle", setHint);
}

document.addEventListener("DOMContentLoaded", () => {
  initLiveBadge();
  initDetailsHint();
});