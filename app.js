/* =========================================================
Traffic Trencher — app.js (v1202)
Changes from v1201:

- Mile tracker now uses Supabase for shared/live miles
  (all visitors see the real number, not localStorage 0)
- Falls back to localStorage if Supabase not configured
- Admin panel only visible at ?admin=1 — you update from
  any device by visiting traffictrencher.com?admin=1
- Token CA copy button wired up
- Thesis hint text flips between “expand” / “collapse”
- Links section expanded to 4 cards (no JS needed)
  ========================================================= */

/* –––––––––––––
SUPABASE CONFIG
─────────────────────────
To enable shared live miles:

1. Create a free Supabase project at https://supabase.com
1. In the SQL editor run:
   
   create table miles (
   id int primary key default 1,
   current int not null default 0,
   check (id = 1)   – only ever one row
   );
   insert into miles (id, current) values (1, 0);
   
   – allow public read, restrict write to anon only via RLS:
   alter table miles enable row level security;
   create policy “public read” on miles for select using (true);
   create policy “anon write” on miles for update using (true);
1. Fill in your project URL and anon key below.
1. Done. Miles update from your device → all visitors see it.

Leave SUPABASE_URL as “” to use localStorage fallback instead.
––––––––––––– */
const SUPABASE_URL = “”;          // e.g. “https://xyzxyz.supabase.co”
const SUPABASE_ANON_KEY = “”;     // your project’s anon/public key
const SUPABASE_TABLE = “miles”;
const SUPABASE_COLUMN = “current”;
const SUPABASE_ROW_ID = 1;

/* –––––––––––––
CONFIG
––––––––––––– */
const MILES_TARGET = 25000;
const MILESTONE_STEP = 1000;

const LS_STREAM_URL  = “tt_stream_url”;
const LS_STREAM_LIVE = “tt_live_toggle”;   // “1” / “0”
const LS_MILES       = “tt_current_miles”; // fallback only

/* –––––––––––––
DOM HELPERS
––––––––––––– */
const $ = (id) => document.getElementById(id);

const liveBadge        = $(“liveBadge”);
const streamFrame      = $(“streamFrame”);
const streamUrlInput   = $(“streamUrl”);
const liveToggle       = $(“liveToggle”);
const saveStreamBtn    = $(“saveStream”);
const clearStreamBtn   = $(“clearStream”);

const currentMilesText  = $(“currentMilesText”);
const percentText       = $(“percentText”);
const barFill           = $(“barFill”);
const currentMilesInput = $(“currentMiles”);
const saveMilesBtn      = $(“saveMiles”);
const milestoneList     = $(“milestoneList”);
const milesAdminPanel   = $(“milesAdminPanel”);
const milesStorageNote  = $(“milesStorageNote”);

const copyFomoBtn  = $(“copyFomo”);
const copyToast    = $(“copyToast”);

const tokenCAEl    = $(“tokenCA”);
const copyCABtn    = $(“copyCA”);
const caCopyToast  = $(“caCopyToast”);

const yearEl = $(“year”);

/* –––––––––––––
UTIL
––––––––––––– */
function clamp(n, min, max) {
return Math.max(min, Math.min(max, n));
}

function safeUrl(url) {
if (!url) return “”;
const trimmed = String(url).trim();
if (!/^https?:///i.test(trimmed)) return “”;
return trimmed;
}

function isAdminMode() {
return new URLSearchParams(window.location.search).get(“admin”) === “1”;
}

function supabaseConfigured() {
return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

/* –––––––––––––
LIVE BADGE
––––––––––––– */
function setBadgeLive(isLive) {
if (!liveBadge) return;
if (isLive) {
liveBadge.textContent = “LIVE”;
liveBadge.classList.add(“is-live”);
liveBadge.style.background = “linear-gradient(90deg,#ff003c,#ff5a5a)”;
liveBadge.style.borderColor = “rgba(255,90,90,.75)”;
liveBadge.style.color = “#fff”;
} else {
liveBadge.textContent = “OFFLINE”;
liveBadge.classList.remove(“is-live”);
liveBadge.style.background = “rgba(255,255,255,.12)”;
liveBadge.style.borderColor = “rgba(255,255,255,.25)”;
liveBadge.style.color = “#ddd”;
}
}

/* –––––––––––––
STREAM
––––––––––––– */
function loadStreamFromStorage() {
const url    = safeUrl(localStorage.getItem(LS_STREAM_URL) || “”);
const isLive = (localStorage.getItem(LS_STREAM_LIVE) || “0”) === “1”;
if (streamUrlInput) streamUrlInput.value = url;
if (liveToggle)     liveToggle.checked   = isLive;
applyStream(url, isLive);
}

function applyStream(url, isLive) {
setBadgeLive(Boolean(isLive));
if (streamFrame) streamFrame.src = url || “”;
}

function saveStream() {
const url    = safeUrl(streamUrlInput ? streamUrlInput.value : “”);
const isLive = Boolean(liveToggle && liveToggle.checked);
if (!url && streamUrlInput) {
alert(“Paste a valid https:// stream URL (or tap Clear).”);
return;
}
localStorage.setItem(LS_STREAM_URL,  url);
localStorage.setItem(LS_STREAM_LIVE, isLive ? “1” : “0”);
applyStream(url, isLive);
}

function clearStream() {
localStorage.removeItem(LS_STREAM_URL);
localStorage.setItem(LS_STREAM_LIVE, “0”);
if (streamUrlInput) streamUrlInput.value = “”;
if (liveToggle)     liveToggle.checked   = false;
applyStream(””, false);
}

/* –––––––––––––
MILES — SUPABASE LAYER
––––––––––––– */

/** Fetch current miles from Supabase. Returns number or null on error. */
async function fetchMilesRemote() {
try {
const res = await fetch(
`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${SUPABASE_ROW_ID}&select=${SUPABASE_COLUMN}`,
{
headers: {
“apikey”: SUPABASE_ANON_KEY,
“Authorization”: `Bearer ${SUPABASE_ANON_KEY}`,
}
}
);
if (!res.ok) return null;
const data = await res.json();
if (Array.isArray(data) && data.length > 0) {
return Number(data[0][SUPABASE_COLUMN]) || 0;
}
return null;
} catch {
return null;
}
}

/** Save miles to Supabase. Returns true on success. */
async function saveMilesRemote(miles) {
try {
const res = await fetch(
`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}?id=eq.${SUPABASE_ROW_ID}`,
{
method: “PATCH”,
headers: {
“apikey”: SUPABASE_ANON_KEY,
“Authorization”: `Bearer ${SUPABASE_ANON_KEY}`,
“Content-Type”: “application/json”,
“Prefer”: “return=minimal”,
},
body: JSON.stringify({ [SUPABASE_COLUMN]: miles })
}
);
return res.ok;
} catch {
return false;
}
}

/* –––––––––––––
MILES — LOCAL FALLBACK
––––––––––––– */
function getMilesLocal() {
const raw = localStorage.getItem(LS_MILES);
const n   = Number(raw);
return Number.isFinite(n) ? clamp(Math.floor(n), 0, 9999999) : 0;
}

function setMilesLocal(n) {
localStorage.setItem(LS_MILES, String(clamp(Math.floor(n), 0, 9999999)));
}

/* –––––––––––––
MILES — RENDER
––––––––––––– */
function renderMiles(miles) {
const pct = clamp((miles / MILES_TARGET) * 100, 0, 100);
if (currentMilesText) currentMilesText.textContent = miles.toLocaleString();
if (percentText)      percentText.textContent      = `${Math.floor(pct)}%`;
if (barFill)          barFill.style.width           = `${pct}%`;
renderMilestones(miles);
}

function renderMilestones(miles) {
if (!milestoneList) return;
const count   = Math.ceil(MILES_TARGET / MILESTONE_STEP);
const reached = Math.floor(miles / MILESTONE_STEP);
milestoneList.innerHTML = “”;
for (let i = 1; i <= count; i++) {
const at  = i * MILESTONE_STEP;
const li  = document.createElement(“li”);
li.textContent = (i <= reached)
? `✅ ${at.toLocaleString()} miles checkpoint`
: `⬜ ${at.toLocaleString()} miles checkpoint`;
milestoneList.appendChild(li);
}
}

/* Load miles on page init */
async function loadMiles() {
if (supabaseConfigured()) {
const remote = await fetchMilesRemote();
if (remote !== null) {
renderMiles(remote);
if (milesStorageNote) milesStorageNote.textContent = “Live miles — updated by the creator daily.”;
return;
}
}
// Fallback: localStorage
renderMiles(getMilesLocal());
if (milesStorageNote) milesStorageNote.textContent = “Miles saved locally on this device.”;
}

/* Save miles from admin input */
async function saveMilesFromInput() {
const val = currentMilesInput ? Number(currentMilesInput.value) : NaN;
if (!Number.isFinite(val) || val < 0) {
alert(“Enter a valid number of miles.”);
return;
}
const clean = clamp(Math.floor(val), 0, 9999999);

if (supabaseConfigured()) {
const ok = await saveMilesRemote(clean);
if (ok) {
renderMiles(clean);
alert(`✅ Miles updated to ${clean.toLocaleString()} — all visitors will now see this.`);
} else {
alert(“⚠️ Supabase save failed. Check your config or internet connection.”);
}
} else {
// Fallback: localStorage
setMilesLocal(clean);
renderMiles(clean);
}
}

/* –––––––––––––
ADMIN PANEL VISIBILITY
––––––––––––– */
function setupAdminPanel() {
if (!milesAdminPanel) return;
if (isAdminMode()) {
milesAdminPanel.style.display = “block”;
if (milesStorageNote) {
milesStorageNote.textContent = supabaseConfigured()
? “Admin mode — changes save to Supabase (all visitors will see).”
: “Admin mode — changes save to localStorage (this device only).”;
}
}
}

/* –––––––––––––
THESIS DIV ACCORDION
(replaces <details> to kill iOS Safari disclosure dots)
––––––––––––– */
function setupThesisToggle() {
const summary = $(“thesisSummary”);
const body    = $(“thesisBody”);
const hint    = $(“thesisHint”);
if (!summary || !body) return;

// Start expanded
body.style.display = “block”;
let open = true;

function toggle() {
open = !open;
body.style.display = open ? “block” : “none”;
if (hint) hint.textContent = open ? “Tap to collapse” : “Tap to expand”;
summary.setAttribute(“aria-expanded”, String(open));
}

summary.addEventListener(“click”, toggle);
summary.addEventListener(“keydown”, (e) => {
if (e.key === “Enter” || e.key === “ “) { e.preventDefault(); toggle(); }
});
}

/* –––––––––––––
TOKEN — CA COPY
Replace the CA string below when you launch.
The button will auto-hide if CA is still “coming soon”.
––––––––––––– */
const TOKEN_CA = “”; // <– paste contract address here when live, e.g. “ABC123…xyz”

function setupTokenCA() {
if (!tokenCAEl) return;

if (TOKEN_CA) {
tokenCAEl.textContent = TOKEN_CA;
// Update buy button to Pump.fun link
const buyBtn = $(“buyTokenBtn”);
if (buyBtn) {
buyBtn.href        = `https://pump.fun/${TOKEN_CA}`;
buyBtn.textContent = “Buy on Pump.fun”;
}
// Update status pill
const pill = $(“tokenStatusPill”);
if (pill) {
pill.textContent = “Live”;
pill.classList.add(“token__pill–live-active”);
}
// Update card desc
const desc = document.querySelector(”.token__card–buy .token__card-desc”);
if (desc) desc.textContent = “Trade TRAFFIC on Pump.fun. Creator fees fund autonomy hardware.”;
}

// Wire copy button
if (copyCABtn) {
if (!TOKEN_CA) {
copyCABtn.style.display = “none”; // hide copy when no CA yet
} else {
copyCABtn.addEventListener(“click”, async () => {
await copyText(TOKEN_CA, caCopyToast);
});
}
}
}

/* –––––––––––––
FOMO COPY
––––––––––––– */
async function copyFomoLink() {
await copyText(“https://fomo.family/r/TrafficTrencher”, copyToast);
}

/* –––––––––––––
COPY UTIL
––––––––––––– */
async function copyText(text, toastEl) {
try {
await navigator.clipboard.writeText(text);
flashToast(toastEl);
} catch {
const ta = document.createElement(“textarea”);
ta.value = text;
ta.style.cssText = “position:fixed;opacity:0;pointer-events:none”;
document.body.appendChild(ta);
ta.focus();
ta.select();
try { document.execCommand(“copy”); flashToast(toastEl); } finally {
document.body.removeChild(ta);
}
}
}

function flashToast(el) {
if (!el) return;
el.hidden = false;
clearTimeout(el._t);
el._t = setTimeout(() => (el.hidden = true), 1400);
}

/* –––––––––––––
INIT / EVENTS
––––––––––––– */
function bindEvents() {
if (saveStreamBtn)  saveStreamBtn.addEventListener(“click”, saveStream);
if (clearStreamBtn) clearStreamBtn.addEventListener(“click”, clearStream);

if (liveToggle) {
liveToggle.addEventListener(“change”, () => {
const url    = safeUrl(streamUrlInput ? streamUrlInput.value : localStorage.getItem(LS_STREAM_URL));
const isLive = Boolean(liveToggle.checked);
localStorage.setItem(LS_STREAM_LIVE, isLive ? “1” : “0”);
applyStream(url || “”, isLive);
});
}

if (saveMilesBtn) saveMilesBtn.addEventListener(“click”, saveMilesFromInput);

if (currentMilesInput) {
currentMilesInput.addEventListener(“keydown”, (e) => {
if (e.key === “Enter”) saveMilesFromInput();
});
}

if (copyFomoBtn) copyFomoBtn.addEventListener(“click”, copyFomoLink);
}

async function init() {
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

loadStreamFromStorage();
setupAdminPanel();
setupThesisToggle();
setupTokenCA();
await loadMiles();
bindEvents();
}

document.addEventListener(“DOMContentLoaded”, init);