(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const inr = (n) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

  /* ---------- Icons ---------- */
  const ICONS = {
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"/>',
    alert: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const paint = (root = document) => $$("[data-icon]", root).forEach((el) => { if (!el.firstChild) el.innerHTML = svg(el.dataset.icon); });

  /* ---------- Data ---------- */
  const CURRENT = 8400;
  const FEE = 2000;        // estimated cancellation fee (may be waived)
  const CONV_FEE = 350;    // platform convenience fee that may not be refunded
  const ALTS = [
    { airline: "Air India", code: "AI 887", price: 6900, dep: "07:10", arr: "09:45", color: "red", tags: ["Cheaper fare", "Same time"], seats: 4, bag: "15 kg check-in" },
    { airline: "SpiceJet", code: "SG 8169", price: 7300, dep: "08:20", arr: "10:55", color: "orange", tags: ["Cheaper fare", "+1 h later"], seats: 7, bag: "15 kg check-in" },
    { airline: "Akasa Air", code: "QP 1121", price: 7650, dep: "06:00", arr: "08:35", color: "blue", tags: ["Cheaper fare", "Earlier"], seats: 2, bag: "15 kg check-in" },
  ];

  const state = { screen: 0, shown: 1, sel: 0, analysedFor: null, checkedAt: 0 };
  const alt = () => ALTS[state.sel];
  const saving = () => CURRENT - alt().price;
  const bestNet = () => saving();                       // fee waived, everything refunded
  const worstNet = () => saving() - FEE - CONV_FEE;     // full fee + convenience fee lost
  const netFor = (fee) => saving() - fee;

  /* ---------- Navigation ---------- */
  const screens = $$(".screen");
  function go(n) {
    if (n === 2) $("#seatInfo").textContent = `${alt().seats} left at ${inr(alt().price)}`;
    if (n === 3 && state.analysedFor !== state.sel) startAnalysis();
    state.screen = n;
    screens.forEach((s, i) => {
      s.classList.toggle("active", i === n);
      s.classList.toggle("left", i < n);
    });
    $$("#dots i").forEach((d, i) => { d.classList.toggle("on", i <= n); d.classList.toggle("cur", i === n); });
    $("#dots").classList.toggle("hide", n === 5);
    $$("#railSteps li").forEach((li, i) => {
      li.classList.toggle("active", i === n);
      li.classList.toggle("done", i < n);
    });
    closeSheet();
  }
  $$("[data-next]").forEach((b) => b.addEventListener("click", () => go(state.screen + 1)));
  $$("[data-back]").forEach((b) => b.addEventListener("click", () => go(state.screen - 1)));
  $$("#railSteps li").forEach((li) => li.addEventListener("click", () => go(+li.dataset.go)));

  /* ---------- 1. Import tabs ---------- */
  const SOURCES = {
    email: ["mail", "Imported from your confirmation email"],
    pnr: ["check", "Fetched from the airline using PNR123456"],
    manual: ["check", "Details entered manually"],
  };
  $$(".import-tabs button").forEach((b) => b.addEventListener("click", () => {
    $$(".import-tabs button").forEach((o) => o.classList.toggle("active", o === b));
    const [icon, text] = SOURCES[b.dataset.imp];
    $("#impSource").innerHTML = `<i data-icon="${icon}"></i>${text}`;
    paint($("#impSource"));
  }));

  /* ---------- 2. Alternatives ---------- */
  function renderAlts() {
    $("#altList").innerHTML = ALTS.slice(0, state.shown).map((a, i) => `
      <div class="card alt ${i === state.sel ? "selected" : ""}" data-i="${i}" role="radio" aria-checked="${i === state.sel}" tabindex="0">
        <div class="alt-top">
          <div class="route">
            <span class="air ${a.color}">${svg("plane")}</span>
            <div><b>Delhi → Goa</b><small>Fri, 16 May · 1 traveller</small><small>${a.airline} · ${a.code}</small></div>
          </div>
          <span class="radio"></span>
        </div>
        <div class="chips">${a.tags.map((t, k) => `<span class="chip ${k === 0 ? "green" : "amber"}">${t}</span>`).join("")}</div>
        <div class="price"><b>${inr(a.price)}</b> <small>per person</small></div>
        <button class="btn soft" data-details>View details</button>
        <div class="details">
          <div><span>Departs</span><b>${a.dep}</b></div>
          <div><span>Arrives</span><b>${a.arr}</b></div>
          <div><span>Baggage</span><b>${a.bag}</b></div>
          <div><span>Seats at this fare</span><b>${a.seats} left</b></div>
          <div><span>Difference vs your booking</span><b style="color:var(--green-700)">${inr(CURRENT - a.price)} cheaper</b></div>
        </div>
      </div>`).join("");
    $("#addOption").hidden = state.shown >= ALTS.length;
  }
  $("#altList").addEventListener("click", (e) => {
    const card = e.target.closest(".alt");
    if (!card) return;
    if (e.target.closest("[data-details]")) {
      const d = $(".details", card);
      d.classList.toggle("open");
      e.target.textContent = d.classList.contains("open") ? "Hide details" : "View details";
      return;
    }
    const i = +card.dataset.i;
    if (i !== state.sel) {
      state.sel = i;
      $$(".alt").forEach((c) => {
        const on = +c.dataset.i === i;
        c.classList.toggle("selected", on);
        c.setAttribute("aria-checked", on);
      });
      toast(`${ALTS[i].airline} selected`);
    }
  });
  $("#addOption").addEventListener("click", () => {
    state.shown++;
    renderAlts();
    toast(`Found another option: ${ALTS[state.shown - 1].airline}`);
  });

  /* ---------- 3. Policy ---------- */
  $("#policyToggle").addEventListener("click", (e) => {
    const open = $("#policyText").classList.toggle("open");
    e.target.textContent = open ? "Hide full policy ↑" : "View full policy →";
  });

  /* ---------- 4. Analysis ---------- */
  let analysisTimers = [];
  function startAnalysis() {
    analysisTimers.forEach(clearTimeout);
    analysisTimers = [];
    const a = alt();
    $("#analysing").classList.remove("hide");
    $("#analysis").classList.remove("show");
    $("#toRec").disabled = true;
    $$("#analysingSteps li").forEach((li) => li.classList.remove("done"));
    $$("#analysingSteps li").forEach((li, i) =>
      analysisTimers.push(setTimeout(() => li.classList.add("done"), 450 * (i + 1))));
    analysisTimers.push(setTimeout(() => {
      $("#aSaving").textContent = inr(saving());
      $("#aAlt").textContent = inr(a.price);
      $("#tipBest").textContent = (bestNet() > 0 ? "+" : "") + inr(bestNet());
      $("#tipWorst").textContent = inr(worstNet());
      $("#analysing").classList.add("hide");
      $("#analysis").classList.add("show");
      $("#toRec").disabled = false;
      state.analysedFor = state.sel;
      state.checkedAt = Date.now();
      updateChecked();
      updateRecommendation();
    }, 1700));
  }
  $("#refundInfo").addEventListener("click", () => $("#refundTip").classList.toggle("open"));

  // Prototype time: 1 real 10 s = 1 "minute", so staleness is visible in a demo
  function updateChecked() {
    if (!state.checkedAt) return;
    const mins = Math.floor((Date.now() - state.checkedAt) / 10000);
    $("#lastChecked").textContent = mins < 1 ? "Just now" : `${mins} min ago`;
    $("#refresh").classList.toggle("stale", mins >= 5);
  }
  setInterval(updateChecked, 2000);
  $("#refresh").addEventListener("click", () => {
    const btn = $("#refresh");
    btn.classList.add("spin");
    $("#lastChecked").textContent = "Checking…";
    setTimeout(() => {
      btn.classList.remove("spin");
      state.checkedAt = Date.now();
      updateChecked();
      toast(`Fare re-checked: still ${inr(alt().price)}`);
    }, 900);
  });

  /* ---------- 5. Recommendation ---------- */
  function updateRecommendation() {
    $("#proText").textContent = `Save up to ${inr(bestNet())} per person if the cancellation fee is waived.`;
    $(".pros-cons > div:last-child p").textContent =
      `The ${inr(FEE)} fee and a ${inr(CONV_FEE)} convenience fee could turn this into a ${inr(-worstNet())} loss. The refund takes 5–7 days.`;
  }

  /* ---------- Sheets ---------- */
  const sheet = $("#sheet"), scrim = $("#scrim"), sheetBody = $("#sheetBody");
  function openSheet(html, bind) {
    sheetBody.innerHTML = html;
    paint(sheetBody);
    bind && bind(sheetBody);
    sheet.classList.add("open");
    scrim.classList.add("open");
  }
  function closeSheet() { sheet.classList.remove("open"); scrim.classList.remove("open"); }
  scrim.addEventListener("click", closeSheet);

  const SHEETS = {
    keep() {
      openSheet(`
        <h3>Keep your current booking?</h3>
        <p class="lead">No changes will be made to IndiGo 6E 5314 (PNR123456).</p>
        <button class="btn primary" id="sKeep">Keep booking</button>
        <button class="btn ghost" id="sCancel">Go back</button>`, (b) => {
        $("#sKeep", b).onclick = () => done("keep");
        $("#sCancel", b).onclick = closeSheet;
      });
    },

    rebook() {
      const a = alt();
      openSheet(`
        <h3>Before you rebook</h3>
        <p class="lead">Confirm the cancellation fee on the IndiGo website so we can work out your real saving.</p>
        <div class="mini">
          <b style="font-size:.86rem">What fee did the airline confirm?</b>
          <div class="import-tabs" id="feeSeg">
            <button data-fee="0">₹0 (waived)</button>
            <button data-fee="${FEE}">${inr(FEE)}</button>
          </div>
          <div class="row" id="netRow" style="display:none"><span>Net saving per person</span><b id="netVal"></b></div>
        </div>
        <div class="checks">
          <label><input type="checkbox" id="ack"><span>I'll book the new ${a.airline} fare <b>first</b>, then cancel the old booking. The refund takes 5–7 business days.</span></label>
        </div>
        <div id="verifyBox"></div>
        <button class="btn primary" id="sGo" disabled>Re-check fare &amp; rebook</button>
        <button class="btn ghost" id="sKeepInstead" style="display:none">Keep my booking instead</button>`, (b) => {
        let fee = null;
        const sync = () => {
          const ok = fee !== null && $("#ack", b).checked;
          $("#sGo", b).disabled = !ok;
          if (fee === null) return;
          const net = netFor(fee);
          $("#netRow", b).style.display = "flex";
          $("#netVal", b).textContent = (net > 0 ? "+" : "") + inr(net);
          $("#netVal", b).style.color = net > 0 ? "var(--green-700)" : "var(--red)";
          $("#sGo", b).textContent = net > 0 ? "Re-check fare & rebook" : "Rebook anyway";
          $("#sKeepInstead", b).style.display = net > 0 ? "none" : "block";
        };
        $$("#feeSeg button", b).forEach((btn) => btn.onclick = () => {
          fee = +btn.dataset.fee;
          $$("#feeSeg button", b).forEach((o) => o.classList.toggle("active", o === btn));
          sync();
        });
        $("#ack", b).onchange = sync;
        $("#sKeepInstead", b).onclick = () => done("keep");
        $("#sGo", b).onclick = () => {
          $("#sGo", b).disabled = true;
          $("#verifyBox", b).innerHTML = `<div class="verify"><div class="spinner"></div>Re-checking the live fare and seats…</div>`;
          setTimeout(() => {
            $("#verifyBox", b).innerHTML = `<div class="verify ok"><span class="tick">${svg("check")}</span>Fare still ${inr(a.price)} · verified just now</div>`;
            setTimeout(() => done("rebook", fee), 900);
          }, 1400);
        };
      });
    },

    wait() {
      const breakEven = CURRENT - FEE;
      openSheet(`
        <h3>Watch fares for me</h3>
        <p class="lead">We'll alert you when a Delhi → Goa fare on 16 May drops below your target.</p>
        <div class="slider-val" id="tVal"></div>
        <div class="slider-sub" id="tSub"></div>
        <input type="range" id="target" min="4500" max="7500" step="100" value="6000" aria-label="Target fare">
        <button class="btn primary" id="sAlert">${svg("bell").replace("<svg", '<svg style="width:1em;height:1em;vertical-align:-2px;margin-right:6px"')}Set fare alert</button>`, (b) => {
        const r = $("#target", b);
        const sync = () => {
          const v = +r.value, s = breakEven - v;
          $("#tVal", b).textContent = inr(v);
          $("#tSub", b).innerHTML = s > 0
            ? `At this fare you'd save at least <b style="color:var(--green-700)">${inr(s)}</b> per person, even after the full fee.`
            : `<span style="color:var(--red)">At this fare, the ${inr(FEE)} fee would cancel out the saving.</span>`;
        };
        r.oninput = sync; sync();
        $("#sAlert", b).onclick = () => done("wait", +r.value);
      });
    },
  };
  $$("[data-sheet]").forEach((b) => b.addEventListener("click", () => SHEETS[b.dataset.sheet]()));

  /* ---------- Done ---------- */
  function done(kind, val) {
    const a = alt();
    const icon = $("#doneIcon");
    icon.className = "done-ic";
    let title, text, rows;
    if (kind === "keep") {
      icon.classList.add("ink"); icon.innerHTML = svg("check");
      title = "Booking kept";
      text = "Nothing has changed. We'll tell you if a fare comes up that's actually worth switching to.";
      rows = [["Booking", "IndiGo 6E 5314"], ["Fare paid", inr(CURRENT)], ["Switch is worth it below", inr(CURRENT - FEE - CONV_FEE)]];
    } else if (kind === "rebook") {
      icon.innerHTML = svg("check");
      title = "Rebooking started";
      text = `Your new ${a.airline} booking is confirmed. Next, cancel the old IndiGo booking; we've saved the steps for you.`;
      rows = [["New booking", `${a.airline} ${a.code}`], ["New fare", inr(a.price)], ["Cancellation fee", inr(val)], ["Refund (5–7 days)", inr(CURRENT - val)], ["Net saving", (netFor(val) > 0 ? "+" : "") + inr(netFor(val))]];
    } else {
      icon.classList.add("amber"); icon.innerHTML = svg("bell");
      title = "We're watching fares";
      text = `You'll get an alert as soon as a fare drops below ${inr(val)}. Your current booking stays as it is.`;
      rows = [["Route", "Delhi → Goa · 16 May"], ["Alert below", inr(val)], ["Checks", "Every 30 min"]];
    }
    $("#doneTitle").textContent = title;
    $("#doneText").textContent = text;
    $("#doneSummary").innerHTML = rows.map(([k, v]) => `<div class="row"><span>${k}</span><b>${v}</b></div>`).join("");
    go(5);
  }

  /* ---------- Misc ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1800);
  }
  function reset() {
    state.shown = 1; state.sel = 0; state.analysedFor = null; state.checkedAt = 0;
    renderAlts();
    $("#policyText").classList.remove("open");
    $("#policyToggle").textContent = "View full policy →";
    $("#refundTip").classList.remove("open");
    go(0);
  }
  $("#startOver").addEventListener("click", reset);
  $("#restart").addEventListener("click", reset);

  const tick = () => { const d = new Date(); $("#clock").textContent = d.getHours().toString().padStart(2, "0") + ":" + d.getMinutes().toString().padStart(2, "0"); };
  tick(); setInterval(tick, 15000);

  paint();
  renderAlts();
  go(0);
})();
