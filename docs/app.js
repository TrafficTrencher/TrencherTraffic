/* =========================
   Traffic Trencher — app.js
   Works with the index.html you pasted.
========================= */

/**
 * Paste your stream link here. If empty, badge stays OFFLINE.
 * Example: "https://kick.com/yourchannel" or "https://www.youtube.com/watch?v=..."
 */
const STREAM_URL = ""; // <- set this

function setLiveBadge(isOnline) {
  const badge = document.getElementById("liveBadge");
  if (!badge) return;

  badge.classList.remove("is-online", "is-offline");

  if (isOnline) {
    badge.textContent = "ONLINE";
    badge.classList.add("is-online");
  } else {
    badge.textContent = "OFFLINE";
    badge.classList.add("is-offline");
  }
}

function wireDetailsHint() {
  const d = document.getElementById("thesisDetails");
  if (!d) return;

  const hint = d.querySelector(".thesis__hint");
  const update = () => {
    if (!hint) return;
    hint.textContent = d.open ? "Tap to collapse" : "Tap to expand";
  };

  // persist open/close
  const KEY = "tt_thesis_open";
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === "0") d.open = false;
    if (saved === "1") d.open = true;
  } catch (_) {}

  update();

  d.addEventListener("toggle", () => {
    update();
    try {
      localStorage.setItem(KEY, d.open ? "1" : "0");
    } catch (_) {}
  });
}

function init() {
  setLiveBadge(Boolean(STREAM_URL && STREAM_URL.trim().length > 0));
  wireDetailsHint();

  // Optional: if you later add a button with id="openStreamBtn"
  // it will open STREAM_URL.
  const openBtn = document.getElementById("openStreamBtn");
  if (openBtn) {
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (!STREAM_URL) return;
      window.open(STREAM_URL, "_blank", "noopener,noreferrer");
    });
  }
}

document.addEventListener("DOMContentLoaded", init);