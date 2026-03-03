// ======= SET YOUR STREAM URL HERE =======
const STREAM_URL = "https://example.com";

// Status pill text (OFFLINE / LIVE)
const STATUS = "OFFLINE"; // change to "LIVE" whenever you want

function qs(id){ return document.getElementById(id); }

function initAccordion() {
  const toggle = qs("opToggle");
  const body = qs("opBody");
  const card = toggle?.closest(".card");
  if (!toggle || !body || !card) return;

  toggle.addEventListener("click", () => {
    const open = card.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // Start CLOSED like your screenshot
  card.classList.remove("open");
  toggle.setAttribute("aria-expanded", "false");
}

function initStreamLinks() {
  const watchBtn = qs("watchBtn");
  if (watchBtn) watchBtn.href = STREAM_URL;

  const pill = qs("statusPill");
  if (pill) pill.textContent = STATUS;
}

document.addEventListener("DOMContentLoaded", () => {
  initAccordion();
  initStreamLinks();
});