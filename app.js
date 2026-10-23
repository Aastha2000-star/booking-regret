(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const inr = (n) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

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
    upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5M12 3v12"/>',
    file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
  };
  const svg = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ""}</svg>`;
  const setIcon = (el, n) => { el.dataset.icon = n; el.innerHTML = svg(n); };
  const paint = (root = document) => $$("[data-icon]", root).forEach((el) => { if (!el.firstChild) el.innerHTML = svg(el.dataset.icon); });

  /* ---------- Booking data ---------- */
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (iso) => {
    const d = new Date(iso + "T00:00:00");
    return isNaN(d) ? iso : `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
  };
  const DEFAULT = {
    from: "Delhi", to: "Goa", date: "2025-05-16", airline: "IndiGo", code: "6E 5314",
    dep: "07:05", arr: "09:40", price: 8400, trav: 1, pnr: "PNR123456",
  };
  const MANUAL_KEY = "bra-manual-booking";

  const bookings = {
    email: { ...DEFAULT, source: ["mail", "Imported from your confirmation email"] },
    pnr: null,
    manual: null,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(MANUAL_KEY) || "null");
    if (saved && saved.price) bookings.manual = saved;
  } catch (e) { /* storage unavailable */ }

  const state = { tab: "email", booking: bookings.email, screen: 0, shown: 1, sel: 0, analysedFor: null, checkedAt: 0 };
  const B = () => state.booking;
  const route = () => `${B().from} → ${B().to}`;
  const FEE = () => Math.min(2000, B().price);   // estimated cancellation fee (may be waived)
  const CONV_FEE = 350;                           // platform convenience fee that may not be refunded

  // Alternatives are priced relative to the booking so the demo works for any fare
  const ALT_POOL = [
    { airline: "Air India", code: "AI 887", ratio: 0.82, dep: "07:10", arr: "09:45", color: "red", tag: "Same time", seats: 4 },
    { airline: "SpiceJet", code: "SG 8169", ratio: 0.87, dep: "08:20", arr: "10:55", color: "orange", tag: "+1 h later", seats: 7 },
    { airline: "Akasa Air", code: "QP 1121", ratio: 0.91, dep: "06:00", arr: "08:35", color: "orange", tag: "Earlier", seats: 2 },
    { airline: "IndiGo", code: "6E 2012", ratio: 0.89, dep: "13:30", arr: "16:05", color: "blue", tag: "Afternoon", seats: 5 },
  ];
  let ALTS = [];
  function buildAlts() {
    ALTS = ALT_POOL
      .filter((a) => a.airline.toLowerCase() !== B().airline.trim().toLowerCase())
      .slice(0, 3)
      .map((a) => ({ ...a, price: Math.round((B().price * a.ratio) / 50) * 50 }));
  }
  const alt = () => ALTS[state.sel];
  const saving = () => B().price - alt().price;
  const bestNet = () => saving();
  const worstNet = () => saving() - FEE() - CONV_FEE;
  const netFor = (fee) => saving() - fee;
  const estNet = () => netFor(FEE());            // estimate assumes the full fee is charged
  const signed = (n) => (n > 0 ? "+" : "") + inr(n);

  /* ---------- Navigation ---------- */
  const screens = $$(".screen");
  function go(n) {
    if (n > 0 && n < 5 && !ALTS.length) commitBooking();
    if (n === 2) {
      $("#seatInfo").textContent = `${alt().seats} left at ${inr(alt().price)}`;
      $("#policyAirline").textContent = B().airline;
    }
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

  /* ---------- 1. Connect booking ---------- */
  function bookingCard(b) {
    const times = b.dep && b.arr ? ` · ${b.dep} → ${b.arr}` : "";
    const flight = [b.airline, b.code].filter(Boolean).map(esc).join(" · ");
    return `
      <div class="card booking">
        <div class="route">
          <span class="air blue">${svg("plane")}</span>
          <div><b>${esc(b.from)} → ${esc(b.to)}</b><small>${fmtDate(b.date)} · ${b.trav} traveller${b.trav > 1 ? "s" : ""}</small><small>${flight}${times}</small></div>
        </div>
        <span class="chip green">Confirmed</span>
        ${b.file ? `<span class="file-chip">${svg("file")}${esc(b.file)}</span>` : ""}
        ${b.pnr ? `<div class="kv"><small>Booking reference</small><b>${esc(b.pnr)}</b></div>` : ""}
        <div class="price"><b>${inr(b.price)}</b> <small>per person</small></div>
      </div>
      <p class="source">${svg(b.source[0])}${esc(b.source[1])}</p>`;
  }

  function renderResults() {
    $("#resEmail").innerHTML = bookingCard(bookings.email);

    const p = bookings.pnr;
    $("#resPnr").innerHTML = p ? bookingCard(p) + `
      ${p.file ? `<div class="note amber"><i data-icon="info"></i>Details were read from your PDF. Please check they're correct before continuing.</div>` : ""}
      <div class="res-actions"><button data-act="pnr-reset">Use a different booking</button><button data-act="edit-pnr">Edit details</button></div>` : "";
    $("#pnrInput").classList.toggle("hide", !!p);

    const m = bookings.manual;
    $("#resManual").innerHTML = m ? bookingCard(m) + `<div class="res-actions"><button data-act="edit-manual">Edit details</button><button data-act="clear-manual">Clear</button></div>` : "";
    $("#manualForm").style.display = m ? "none" : "";

    paint($(".screen[data-screen='0']"));
    $("#addToAnalysis").disabled = !bookings[state.tab];
  }

  function setTab(tab) {
    state.tab = tab;
    $$(".import-tabs [data-imp]").forEach((o) => o.classList.toggle("active", o.dataset.imp === tab));
    $$(".panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab));
    $("#addToAnalysis").disabled = !bookings[tab];
  }
  $$(".import-tabs [data-imp]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.imp)));

  // PNR lookup (simulated)
  const pnrLoading = (on, text) => {
    $("#pnrLoading").classList.toggle("show", on);
    if (text) $("#pnrLoadingText").textContent = text;
    $("#pnrInput").classList.toggle("hide", on || !!bookings.pnr);
  };
  $("#pnrForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const codeEl = $("#pnrCode"), nameEl = $("#pnrName");
    const code = codeEl.value.trim().toUpperCase();
    const name = nameEl.value.trim();
    codeEl.classList.toggle("invalid", !/^[A-Z0-9]{6}$/.test(code));
    nameEl.classList.toggle("invalid", !name);
    if (!/^[A-Z0-9]{6}$/.test(code)) return void ($("#pnrErr").textContent = "A PNR is 6 letters or numbers, e.g. K9TZ4P.");
    if (!name) return void ($("#pnrErr").textContent = "Enter the last name on the booking.");
    $("#pnrErr").textContent = "";
    pnrLoading(true, `Fetching booking ${code}…`);
    setTimeout(() => {
      bookings.pnr = { ...DEFAULT, pnr: code, source: ["check", `Fetched from ${DEFAULT.airline} using PNR ${code}`] };
      pnrLoading(false);
      renderResults();
      toast("Booking found");
    }, 1300);
  });
  $("#pnrCode").addEventListener("input", (e) => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""); });

  // Confirmation PDF upload (extraction is simulated in this prototype)
  function handlePdf(file) {
    $("#pdfErr").textContent = "";
    if (!file) return;
    if (!(file.type === "application/pdf" || /\.pdf$/i.test(file.name))) return void ($("#pdfErr").textContent = "Please upload a PDF file.");
    if (file.size > 10 * 1024 * 1024) return void ($("#pdfErr").textContent = "That file is over 10 MB. Try a smaller PDF.");
    pnrLoading(true, `Reading ${file.name}…`);
    setTimeout(() => {
      bookings.pnr = { ...DEFAULT, pnr: "K9TZ4P", file: file.name, source: ["file", "Extracted from your confirmation PDF"] };
      pnrLoading(false);
      renderResults();
      toast("Booking details extracted");
    }, 1600);
  }
  const drop = $("#drop");
  $("#pdfFile").addEventListener("change", (e) => { handlePdf(e.target.files[0]); e.target.value = ""; });
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add("over"); }));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove("over"); }));
  drop.addEventListener("drop", (e) => handlePdf(e.dataTransfer.files[0]));

  // Manual form
  const form = $("#manualForm");
  function fillForm(b) {
    ["from", "to", "date", "airline", "code", "dep", "arr", "price", "trav", "pnr"].forEach((k) => { form.elements[k].value = b[k] ?? ""; });
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = Object.fromEntries(new FormData(form));
    $$("input", form).forEach((i) => i.classList.remove("invalid"));
    const bad = (name, msg) => { form.elements[name].classList.add("invalid"); form.elements[name].focus(); $("#manualErr").textContent = msg; };
    if (!v.from.trim()) return bad("from", "Where are you flying from?");
    if (!v.to.trim()) return bad("to", "Where are you flying to?");
    if (v.from.trim().toLowerCase() === v.to.trim().toLowerCase()) return bad("to", "Origin and destination can't be the same.");
    if (!v.date) return bad("date", "Pick the travel date.");
    if (!v.airline.trim()) return bad("airline", "Which airline is it?");
    if (!(+v.price > 0)) return bad("price", "Enter the fare you paid per person.");
    if (!(+v.trav >= 1 && +v.trav <= 9)) return bad("trav", "Travellers must be between 1 and 9.");
    $("#manualErr").textContent = "";
    bookings.manual = {
      from: v.from.trim(), to: v.to.trim(), date: v.date, airline: v.airline.trim(), code: v.code.trim().toUpperCase(),
      dep: v.dep, arr: v.arr, price: Math.round(+v.price), trav: Math.round(+v.trav), pnr: v.pnr.trim().toUpperCase(),
      source: ["pen", "Entered manually · saved on this device"],
    };
    try { localStorage.setItem(MANUAL_KEY, JSON.stringify(bookings.manual)); } catch (err) { /* storage unavailable */ }
    renderResults();
    toast("Booking saved");
  });

  $(".screen[data-screen='0']").addEventListener("click", (e) => {
    const act = e.target.closest("[data-act]")?.dataset.act;
    if (!act) return;
    if (act === "pnr-reset") { bookings.pnr = null; $("#pnrForm").reset(); renderResults(); }
    if (act === "edit-pnr" || act === "edit-manual") {
      fillForm(act === "edit-pnr" ? bookings.pnr : bookings.manual);
      bookings.manual = null;
      renderResults();
      setTab("manual");
    }
    if (act === "clear-manual") {
      bookings.manual = null;
      try { localStorage.removeItem(MANUAL_KEY); } catch (err) { /* storage unavailable */ }
      form.reset();
      renderResults();
    }
  });

  function commitBooking() {
    state.booking = bookings[state.tab] || bookings.email;
    state.shown = 1; state.sel = 0; state.analysedFor = null;
    buildAlts();
    renderAlts();
    $("#aCur").textContent = inr(B().price);
  }
  $("#addToAnalysis").addEventListener("click", () => {
    if (!bookings[state.tab]) return;
    commitBooking();
    go(1);
  });

  /* ---------- 2. Alternatives ---------- */
  function renderAlts() {
    const b = B();
    $("#altList").innerHTML = ALTS.slice(0, state.shown).map((a, i) => `
      <div class="card alt ${i === state.sel ? "selected" : ""}" data-i="${i}" role="radio" aria-checked="${i === state.sel}" tabindex="0">
        <div class="alt-top">
          <div class="route">
            <span class="air ${a.color}">${svg("plane")}</span>
            <div><b>${esc(b.from)} → ${esc(b.to)}</b><small>${fmtDate(b.date)} · ${b.trav} traveller${b.trav > 1 ? "s" : ""}</small><small>${a.airline} · ${a.code}</small></div>
          </div>
          <span class="radio"></span>
        </div>
        <div class="chips"><span class="chip green">Cheaper fare</span><span class="chip amber">${a.tag}</span></div>
        <div class="price"><b>${inr(a.price)}</b> <small>per person</small></div>
        <button class="btn soft" data-details>View details</button>
        <div class="details">
          <div><span>Departs</span><b>${a.dep}</b></div>
          <div><span>Arrives</span><b>${a.arr}</b></div>
          <div><span>Baggage</span><b>15 kg check-in</b></div>
          <div><span>Seats at this fare</span><b>${a.seats} left</b></div>
          <div><span>Difference vs your booking</span><b style="color:var(--green-700)">${inr(b.price - a.price)} cheaper</b></div>
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
    $("#analysing").classList.remove("hide");
    $("#analysis").classList.remove("show");
    $("#toRec").disabled = true;
    $$("#analysingSteps li").forEach((li) => li.classList.remove("done"));
    $$("#analysingSteps li").forEach((li, i) =>
      analysisTimers.push(setTimeout(() => li.classList.add("done"), 450 * (i + 1))));
    analysisTimers.push(setTimeout(() => {
      $("#aCur").textContent = inr(B().price);
      $("#aSaving").textContent = inr(saving());
      $("#aAlt").textContent = inr(alt().price);
      $(".pill.red").textContent = "−" + inr(FEE());
      const net = estNet();
      $("#aRefund").textContent = inr(B().price - FEE());
      $("#aNet").textContent = signed(net);
      $("#aNetPill").className = "pill " + (net > 0 ? "green" : "red");
      $("#refundTip").innerHTML =
        `Estimated as your fare minus the ${inr(FEE())} cancellation fee. If the airline waives the fee, you'd save <b>${signed(bestNet())}</b>. ` +
        `If the ${inr(CONV_FEE)} convenience fee isn't refunded either, it's <b>${signed(worstNet())}</b>.`;
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

  // Prototype time: 10 real seconds = 1 "minute", so staleness is visible in a demo
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
    const net = estNet();
    $("#recNote").className = "note big " + (net > 0 ? "amber" : "green");
    setIcon($("#recIcon"), net > 0 ? "alert" : "check");
    if (net > 0) {
      $("#recTitle").textContent = `Switching could save you ${inr(net)} per person.`;
      $("#recText").textContent = `That's after the estimated ${inr(FEE())} cancellation fee. Confirm the fee and refund on the ${B().airline} website before you cancel anything.`;
    } else {
      $("#recTitle").textContent = "Keep your current booking.";
      $("#recText").textContent = `After the estimated ${inr(FEE())} cancellation fee, switching would cost you ${inr(-net)} more per person. It only pays off if the airline waives the fee.`;
    }
    $("#proText").textContent = `Save up to ${inr(bestNet())} per person if the cancellation fee is waived.`;
    $(".pros-cons > div:last-child p").textContent =
      `The ${inr(FEE())} fee and a ${inr(CONV_FEE)} convenience fee could turn this into a ${inr(-worstNet())} loss. The refund takes 5–7 days.`;
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

  const bookingLabel = () => `${esc(B().airline)}${B().code ? " " + esc(B().code) : ""}${B().pnr ? ` (${esc(B().pnr)})` : ""}`;

  const SHEETS = {
    keep() {
      openSheet(`
        <h3>Keep your current booking?</h3>
        <p class="lead">No changes will be made to ${bookingLabel()}.</p>
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
        <p class="lead">Confirm the cancellation fee on the ${esc(B().airline)} website so we can work out your real saving.</p>
        <div class="mini">
          <b style="font-size:.86rem">What fee did the airline confirm?</b>
          <div class="import-tabs" id="feeSeg">
            <button data-fee="0">₹0 (waived)</button>
            <button data-fee="${FEE()}">${inr(FEE())}</button>
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
          $("#sGo", b).disabled = !(fee !== null && $("#ack", b).checked);
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
      const breakEven = B().price - FEE();
      const min = Math.round((B().price * 0.5) / 100) * 100;
      const max = Math.round((B().price * 0.95) / 100) * 100;
      const start = Math.round((B().price * 0.7) / 100) * 100;
      openSheet(`
        <h3>Watch fares for me</h3>
        <p class="lead">We'll alert you when a ${esc(route())} fare on ${fmtDate(B().date)} drops below your target.</p>
        <div class="slider-val" id="tVal"></div>
        <div class="slider-sub" id="tSub"></div>
        <input type="range" id="target" min="${min}" max="${max}" step="100" value="${start}" aria-label="Target fare">
        <button class="btn primary" id="sAlert">Set fare alert</button>`, (b) => {
        const r = $("#target", b);
        const sync = () => {
          const v = +r.value, s = breakEven - v;
          $("#tVal", b).textContent = inr(v);
          $("#tSub", b).innerHTML = s > 0
            ? `At this fare you'd save at least <b style="color:var(--green-700)">${inr(s)}</b> per person, even after the full fee.`
            : `<span style="color:var(--red)">At this fare, the ${inr(FEE())} fee would cancel out the saving.</span>`;
        };
        r.oninput = sync; sync();
        $("#sAlert", b).onclick = () => done("wait", +r.value);
      });
    },
  };
  $$("[data-sheet]").forEach((b) => b.addEventListener("click", () => SHEETS[b.dataset.sheet]()));

  /* ---------- Done ---------- */
  function done(kind, val) {
    const a = alt(), b = B();
    const icon = $("#doneIcon");
    icon.className = "done-ic";
    let title, text, rows;
    if (kind === "keep") {
      icon.classList.add("ink"); icon.innerHTML = svg("check");
      title = "Booking kept";
      text = "Nothing has changed. We'll tell you if a fare comes up that's actually worth switching to.";
      rows = [["Booking", `${b.airline} ${b.code}`.trim()], ["Fare paid", inr(b.price)], ["Switch is worth it below", inr(b.price - FEE() - CONV_FEE)]];
    } else if (kind === "rebook") {
      icon.innerHTML = svg("check");
      title = "Rebooking started";
      text = `Your new ${a.airline} booking is confirmed. Next, cancel the old ${b.airline} booking; we've saved the steps for you.`;
      rows = [["New booking", `${a.airline} ${a.code}`], ["New fare", inr(a.price)], ["Cancellation fee", inr(val)], ["Refund (5–7 days)", inr(b.price - val)], ["Net saving", (netFor(val) > 0 ? "+" : "") + inr(netFor(val))]];
      if (b.trav > 1) rows.push([`Total for ${b.trav} travellers`, (netFor(val) > 0 ? "+" : "") + inr(netFor(val) * b.trav)]);
    } else {
      icon.classList.add("amber"); icon.innerHTML = svg("bell");
      title = "We're watching fares";
      text = `You'll get an alert as soon as a fare drops below ${inr(val)}. Your current booking stays as it is.`;
      rows = [["Route", `${route()} · ${fmtDate(b.date)}`], ["Alert below", inr(val)], ["Checks", "Every 30 min"]];
    }
    $("#doneTitle").textContent = title;
    $("#doneText").textContent = text;
    $("#doneSummary").innerHTML = rows.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("");
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
    $("#policyText").classList.remove("open");
    $("#policyToggle").textContent = "View full policy →";
    $("#refundTip").classList.remove("open");
    setTab("email");
    commitBooking();
    go(0);
  }
  $("#startOver").addEventListener("click", reset);
  $("#restart").addEventListener("click", reset);

  const tick = () => { const d = new Date(); $("#clock").textContent = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); };
  tick(); setInterval(tick, 15000);

  paint();
  renderResults();
  commitBooking();
  go(0);
})();
