// Traffic Trencher — Mission Log placeholder
// Later you can replace `sampleLog` with a fetch() to your real JSON feed.

const sampleLog = [
  { name: "Route Stream", meta: "Daily run (proof-of-work)", value: "LIVE / WEEKDAY" },
  { name: "Mileage Checkpoint", meta: "Next creator-fee claim milestone", value: "1,000 mi" },
  { name: "Upgrade Target", meta: "Hardware + autonomy stack", value: "IN PROGRESS" },
  { name: "Fleet Expansion", meta: "From one route to multiple", value: "PLANNED" },
];

function renderLog(items){
  const el = document.getElementById("logList");
  if(!el) return;

  el.innerHTML = "";
  items.forEach((it) => {
    const row = document.createElement("div");
    row.className = "log-item";

    const left = document.createElement("div");
    left.className = "log-left";

    const name = document.createElement("div");
    name.className = "log-name";
    name.textContent = it.name;

    const meta = document.createElement("div");
    meta.className = "log-meta";
    meta.textContent = it.meta;

    left.appendChild(name);
    left.appendChild(meta);

    const right = document.createElement("div");
    right.className = "log-right";
    right.textContent = it.value;

    row.appendChild(left);
    row.appendChild(right);
    el.appendChild(row);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderLog(sampleLog);

  const btn = document.getElementById("refreshLog");
  if(btn){
    btn.addEventListener("click", () => renderLog(sampleLog));
  }
});