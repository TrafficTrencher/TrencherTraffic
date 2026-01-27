(() => {
  // =========================
  // CONFIG
  // =========================
  const GOAL = 50000;
  const CLAIM_COUNT = 25;
  const STEP = 2000; // every 2,000 miles

  // =========================
  // DOM
  // =========================
  const yearEl = document.getElementById("year");
  const liveBadge = document.getElementById("liveBadge");
  const streamFrame = document.getElementById("streamFrame");
  const streamUrlInput = document.getElementById("streamUrl");
  const saveStreamBtn = document.getElementById("saveStream");

  const currentMilesText = document.getElementById("currentMilesText");
  const percentText = document.getElementById("percentText");
  const barFill = document.getElementById("barFill");

  const milesInput = document.getElementById("currentMiles");
  const saveMilesBtn = document.getElementById("saveMiles");
  const milestoneList = document.getElementById("milestoneList");

  // =========================
  // BASIC HELPERS
  // =========================
  const comma = (n) => Number(n).toLocaleString();
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function setLiveBadge() {
    // Show LIVE badge only when on /#live (simple rule you can change)
    if (!liveBadge) return;
    const isLive = location.hash === "#live" || location.hash === "#live/";
    liveBadge.style.display = isLive ? "inline-flex" : "none";
  }

  // =========================
  // STREAM (local to viewer is fine)
  // =========================
  function loadStream() {
    const saved = localStorage.getItem("tt_stream_url") || "";
    if (streamUrlInput) streamUrlInput.value = saved;

    if (streamFrame) {
      streamFrame.src = saved; // put your embed URL here
    }
  }

  function saveStream() {
    const url = (streamUrlInput?.value || "").trim();
    localStorage.setItem("tt_stream_url", url);
    if (streamFrame) streamFrame.src = url;
  }

  // =========================
  // MILES (OFFICIAL / READ-ONLY)
  // =========================
  async function loadOfficialMiles() {
    // cache-bust so commits show up quickly
    const res = await fetch(`./data/progress.json?v=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Missing data/progress.json");
    const data = await res.json();
    return Number(data.miles) || 0;
  }

  function renderMiles(miles) {
    if (currentMilesText) currentMilesText.textContent = comma(miles);

    const pct = clamp((miles / GOAL) * 100, 0, 100);
    if (percentText) percentText.textContent = `${pct.toFixed(1)}%`;
    if (barFill) barFill.style.width = `${pct}%`;

    renderMilestones(miles);
  }

  function renderMilestones(miles) {
    if (!milestoneList) return;
    milestoneList.innerHTML = "";

    for (let i = 1; i <= CLAIM_COUNT; i++) {
      const target = i * STEP; // 2000, 4000, ... 50000
      const unlocked = miles >= target;

      const li = document.createElement("li");
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.padding = "10px 0";
      li.style.borderBottom = "1px solid rgba(255,255,255,0.08)";

      const left = document.createElement("div");
      left.innerHTML = `
        <div style="font-weight:700">${i}) ${comma(target)} miles</div>
        <div class="small" style="opacity:.85">Claim milestone</div>
      `;

      const right = document.createElement("div");
      right.className = "pill"; // uses your existing styling
      right.textContent = unlocked ? "Unlocked" : "Locked";
      right.style.opacity = unlocked ? "1" : ".65";

      li.appendChild(left);
      li.appendChild(right);
      milestoneList.appendChild(li);
    }
  }

  function lockMilesEditorUI() {
    // This is what prevents public editing.
    if (milesInput) {
      milesInput.disabled = true;
      milesInput.placeholder = "Owner-only (repo controlled)";
      milesInput.style.opacity = "0.6";
      milesInput.style.cursor = "not-allowed";
    }
    if (saveMilesBtn) {
      saveMilesBtn.disabled = true;
      saveMilesBtn.style.opacity = "0.6";
      saveMilesBtn.style.cursor = "not-allowed";
      saveMilesBtn.title = "Owner-only (edit data/progress.json in GitHub)";
    }
  }

  // =========================
  // COUNTDOWN (optional placeholder)
  // =========================
  function initCountdown() {
    const el = document.getElementById("countdown");
    if (!el) return;
    // Keep your existing countdown logic if you already had one.
    // This just keeps it from saying "Loading…" forever.
    el.textContent = "Weekdays • 3:00–7:00 PM EST";
  }

  // =========================
  // INIT
  // =========================
  async function init() {
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    setLiveBadge();
    window.addEventListener("hashchange", setLiveBadge);

    initCountdown();

    // stream UI (local)
    loadStream();
    saveStreamBtn?.addEventListener("click", saveStream);

    // miles UI (official + read-only)
    lockMilesEditorUI();

    try {
      const miles = await loadOfficialMiles();
      renderMiles(miles);
      console.log("Official miles loaded:", miles);
    } catch (e) {
      console.error(e);
      // Fallback display if file missing
      renderMiles(0);
    }
  }

  init();
})();


