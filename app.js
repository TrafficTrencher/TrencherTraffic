/* ================================
   Traffic Trencher — app.js
   ================================ */

/** SET THIS to your real stream link */
const STREAM_URL = "https://example.com";

/** Optional mission log file (create later if you want) */
const MISSION_LOG_URL = "./mission-log.json"; // docs/mission-log.json

function setHref(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  el.href = url;
}

function qs(id){ return document.getElementById(id); }

function formatDate(input) {
  try {
    const d = new Date(input);
    if (Number.isNaN(d.getTime())) return String(input);
    return d.toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" });
  } catch {
    return String(input);
  }
}

async function loadMissionLog() {
  const list = qs("logList");
  const meta = qs("logMeta");
  if (!list || !meta) return;

  // nice fallback (so it never looks broken)
  const fallback = [
    { title: "Day 1 — Proof-of-Work begins", message: "Route streamed. Miles logged. Narrative executed in public.", date: new Date().toISOString() },
    { title: "Checkpoint system online", message: "Milestones tied to real mileage, not promises.", date: new Date().toISOString() },
  ];

  try {
    const res = await fetch(MISSION_LOG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("No mission-log.json found");
    const data = await res.json();

    const entries = Array.isArray(data) ? data : (data.entries || []);
    const safe = entries.length ? entries : fallback;

    meta.textContent = `${safe.length} entries`;

    list.innerHTML = safe.slice(0, 12).map(e => {
      const t = e.title || "Log Entry";
      const m = e.message || "";
      const d = e.date ? formatDate(e.date) : "";
      return `
        <div class="log-item">
          <div class="t">${escapeHtml(t)}</div>
          <div class="m">${escapeHtml(m)}</div>
          ${d ? `<div class="d">${escapeHtml(d)}</div>` : ``}
        </div>
      `;
    }).join("");
  } catch (err) {
    meta.textContent = "Using default";
    list.innerHTML = fallback.map(e => `
      <div class="log-item">
        <div class="t">${escapeHtml(e.title)}</div>
        <div class="m">${escapeHtml(e.message)}</div>
        <div class="d">${escapeHtml(formatDate(e.date))}</div>
      </div>
    `).join("");
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setupMobileNav() {
  const toggle = qs("navToggle");
  const mobileNav = qs("mobileNav");
  if (!toggle || !mobileNav) return;

  toggle.addEventListener("click", () => {
    const open = mobileNav.style.display === "block";
    mobileNav.style.display = open ? "none" : "block";
    toggle.setAttribute("aria-expanded", open ? "false" : "true");
  });

  // close after click
  mobileNav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      mobileNav.style.display = "none";
      toggle.setAttribute("aria-expanded", "false");
    });
  });
}

function init() {
  // Stream links
  setHref("openStreamBtn", STREAM_URL);
  setHref("watchBtn", STREAM_URL);

  // Footer year
  const y = qs("year");
  if (y) y.textContent = String(new Date().getFullYear());

  setupMobileNav();
  loadMissionLog();
}

document.addEventListener("DOMContentLoaded", init);