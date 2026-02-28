/* Traffic Trencher — redesigned app.js
   Features:
   - Save stream URL to localStorage + embed in iframe
   - Save miles to localStorage + update progress
   - Render Onion accordion + Doctrine text
*/

const LS_STREAM = "tt_stream_url";
const LS_MILES  = "tt_total_miles";

const $ = (id) => document.getElementById(id);

function setStatus(isLive){
  const pill = $("statusPill");
  const dot  = pill.querySelector(".dot");
  const txt  = $("statusText");
  if(isLive){
    txt.textContent = "LIVE";
    dot.style.background = "#44ff9a";
    dot.style.boxShadow = "0 0 0 4px rgba(68,255,154,.14)";
  } else {
    txt.textContent = "OFFLINE";
    dot.style.background = "#9aa6c4";
    dot.style.boxShadow = "0 0 0 4px rgba(154,166,196,.12)";
  }
}

function setPlayer(url){
  const frame = $("streamFrame");
  const empty = $("playerEmpty");

  if(url && url.trim().length > 0){
    frame.src = url.trim();
    empty.style.display = "none";
    setStatus(true);
  } else {
    frame.src = "";
    empty.style.display = "grid";
    setStatus(false);
  }
}

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function renderMiles(total){
  total = Number.isFinite(total) ? total : 0;
  total = Math.max(0, Math.floor(total));

  const goal = 25000;
  const pct = clamp((total/goal)*100, 0, 100);

  $("mileNumber").textContent = total.toLocaleString();
  $("mileFill").style.width = pct.toFixed(2) + "%";
  $("milePct").textContent = pct.toFixed(1) + "%";
  $("mileInput").value = total;

  // Also update the autonomy bar aria if you want later (kept separate intentionally)
}

function saveMiles(){
  const val = parseInt($("mileInput").value || "0", 10);
  const total = Number.isFinite(val) ? Math.max(0, val) : 0;
  localStorage.setItem(LS_MILES, String(total));
  renderMiles(total);
}

function clearMiles(){
  localStorage.removeItem(LS_MILES);
  renderMiles(0);
}

function saveStream(){
  const url = $("streamUrl").value || "";
  localStorage.setItem(LS_STREAM, url.trim());
  setPlayer(url);
}

function clearStream(){
  localStorage.removeItem(LS_STREAM);
  $("streamUrl").value = "";
  setPlayer("");
}

/* ===== Onion + Doctrine content =====
   You can edit these arrays/strings anytime without touching layout.
*/

const ONION = [
  {
    title: "Outer Layer — What People See",
    tag: "entry point",
    body:
`Traffic Trencher is a live IRL stream documenting a real medical courier route while exploring the future of autonomous driving, AI, and work.

Daily miles are streamed from inside real pharmacy logistics operations as self-driving technology advances toward removing the need for human drivers.`
  },
  {
    title: "Layer 2 — The Project",
    tag: "experiment",
    body:
`A real-world experiment documenting the transition from human labor to autonomous systems.

An independent pharmacy logistics contractor publicly tracks the evolution from Human Driver → AI Supervisor → Autonomous Operator.`
  },
  {
    title: "Layer 3 — The Different Idea",
    tag: "self-disruption",
    body:
`Instead of waiting for AI (or an employer) to replace my job:
I’m adopting autonomy first, replacing my own labor, and transitioning into ownership of automated production.`
  },
  {
    title: "Layer 4 — The Real Foundation",
    tag: "pharmacy logistics",
    body:
`Independent contractor. Medical/pharmacy courier logistics. Time-critical deliveries. Income tied to driving attention.
Nothing is simulated. Real work creates credibility.`
  },
  {
    title: "Layer 5 — The Attention Engine",
    tag: "work → capital",
    body:
`Work becomes media. Media becomes capital. Capital funds autonomy.
Miles become proof-of-work. Progress stays measurable.`
  },
  {
    title: "Layer 6 — Technology Alignment",
    tag: "external clock",
    body:
`The timeline runs parallel to autonomy progress. As fleet learning approaches large-scale maturity, this project documents the human-required era while it still exists.`
  },
  {
    title: "Layer 7 — The Transformation Arc",
    tag: "operator evolution",
    body:
`Independent Contractor → Human Courier → Live Documentation → Autonomy Adoption → AI Supervision → Autonomous Courier Fleet Owner.`
  },
  {
    title: "Layer 8 — Gravity System",
    tag: "audience convergence",
    body:
`Traders, tech observers, logistics people, workers, entrepreneurs, and media all converge because TT sits at the intersection:
AI + autonomy + real work + healthcare logistics + entrepreneurship + timing.`
  },
  {
    title: "Layer 9 — Inevitability Engine",
    tag: "process",
    body:
`Daily repetition creates belief.
Route → Miles → Documentation → Upgrade → Reduced Labor → Expansion.
No promises required—just process.`
  },
  {
    title: "Layer 10 — Founder Position",
    tag: "witness/operator",
    body:
`I’m the witness executing self-automation publicly: an independent pharmacy logistics contractor choosing ownership over displacement.`
  },
  {
    title: "Layer 11 — Control Layer",
    tag: "credibility",
    body:
`Reality over hype. Safety over content. Process over promises. Slow visible evolution. External timelines over predictions.`
  },
  {
    title: "Layer 12 — Daily Rules",
    tag: "discipline",
    body:
`1) Work first  2) Document, don’t perform  3) Safety non-negotiable
4) Miles show progress  5) Calm tone  6) Repeat the core idea
7) Keep logistics authority  8) Upgrade gradually
9) Align with real news  10) Mission independent of markets`
  },
  {
    title: "Layer 13 — Failure Modes",
    tag: "what kills it",
    body:
`Crypto-first vibes, skipped stages, lost operator identity, anti-AI tone, timeline promises, safety incidents, market emotional dependence, brand worship, losing logistics grounding, ending the story early.`
  },
  {
    title: "Layer 14 — Non-Negotiables",
    tag: "hard rules",
    body:
`1) Reality must always be true
2) Safety over content
3) Mission outlives the market`
  },
  {
    title: "Layer 15 — Endgame",
    tag: "fleet ownership",
    body:
`Human driving becomes unnecessary.
Autonomous systems perform logistics work once requiring full attention.
Driver → Supervisor → Operator → Fleet Owner.`
  },
  {
    title: "Layer 16 — Immortality Layer",
    tag: "archive",
    body:
`Once autonomy is normal, the human-driven era can’t be recreated.
TT becomes archive + case study + historical record of the transition.`
  },
  {
    title: "Core — Historical Truth",
    tag: "why it matters",
    body:
`TT may matter because it preserves the lived experience of a worker transitioning from manual labor into autonomous system ownership during the early rise of AI transportation.`
  }
];

const DOCTRINE =
`TRENCHER TRAFFIC — ONE-PAGE DOCTRINE

CORE MISSION
Document + execute the transition from human-operated labor to autonomous systems in real time, beginning with independent pharmacy courier logistics.

FOUNDATIONAL REALITY
Independent contractor. Real medical/pharmacy routes. Time-critical deliveries. Income tied to driving attention. No simulation.

CENTRAL IDEA
Instead of waiting for AI (or an employer) to replace human labor:
the worker replaces his own job first — and owns what comes next.

TRANSFORMATION ARC
Independent Contractor → Human Courier → Live Documentation → Autonomy Adoption → AI Supervision → Autonomous Fleet Owner

TECH ALIGNMENT
Aligned with external autonomy progress (not self-invented). The clock is real; TT documents the approach.

ATTENTION PHILOSOPHY
Work becomes media. Media becomes capital. Capital funds automation. Miles are proof.

CONTROL PRINCIPLES
Reality over hype. Process over promises. Safety over content. Slow visible evolution. Honest friction.

FOUNDER POSITION
Witness/operator executing self-automation publicly. Operator first. Creator second.

ENDGAME
Human driving becomes unnecessary. Autonomous systems perform logistics work. Labor detaches from effort and reconnects to ownership.

IMMORTALITY
When autonomy becomes normal, the human-driven era can’t be recreated. TT becomes archive + case study + record.

DOCTRINE SENTENCE
Trencher Traffic is a real-world experiment in which an independent pharmacy courier publicly replaces his own labor with autonomous systems, documenting humanity’s transition from human-driven work to automated production.

DECISION TEST
Does this make TT feel more real, more safe, and more aligned with the autonomy transition?
If yes → proceed. If hype-driven → reject.`;

function renderOnion(){
  const root = $("onionAccordion");
  root.innerHTML = "";

  ONION.forEach((item, idx) => {
    const wrap = document.createElement("div");
    wrap.className = "acc-item";

    const btn = document.createElement("button");
    btn.className = "acc-btn";
    btn.type = "button";
    btn.innerHTML = `<div>${item.title}</div><span>${item.tag}</span>`;

    const panel = document.createElement("div");
    panel.className = "acc-panel";
    panel.textContent = item.body;

    btn.addEventListener("click", () => {
      wrap.classList.toggle("open");
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    root.appendChild(wrap);

    // Open the first 2 by default for instant comprehension
    if(idx < 2) wrap.classList.add("open");
  });
}

function init(){
  $("year").textContent = new Date().getFullYear();

  // Stream
  const savedStream = localStorage.getItem(LS_STREAM) || "";
  $("streamUrl").value = savedStream;
  setPlayer(savedStream);

  $("saveStream").addEventListener("click", saveStream);
  $("clearStream").addEventListener("click", clearStream);

  // Miles
  const savedMilesRaw = localStorage.getItem(LS_MILES);
  const savedMiles = savedMilesRaw ? parseInt(savedMilesRaw, 10) : 0;
  renderMiles(Number.isFinite(savedMiles) ? savedMiles : 0);

  $("saveMiles").addEventListener("click", saveMiles);
  $("clearMiles").addEventListener("click", clearMiles);

  // Onion + Doctrine
  renderOnion();
  $("doctrineText").textContent = DOCTRINE;
}

init();