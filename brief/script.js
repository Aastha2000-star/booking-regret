/* ==========================================================
   The Booking Regret Problem — interactions
   ========================================================== */
(function () {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const inr = (n) => (n < 0 ? "−" : "") + "₹" + Math.abs(Math.round(n)).toLocaleString("en-IN");

  /* ---------- Icons (Lucide-style, inline SVG) ---------- */
  const ICONS = {
    plane: '<path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    triangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4M12 17h.01"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 10h.01M12 10h.01M16 10h.01"/>',
    clipboard: '<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6M9 16h6"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M3 3v18h18"/><path d="M18 17V9M13 17V5M8 17v-3"/>',
    refresh: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    building: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"/>',
    coins: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/><path d="M3 12a9 3 0 0 0 18 0"/>',
    receipt: '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8M12 17.5v-11"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    flask: '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2.2h12.4a1.5 1.5 0 0 0 1.3-2.2L14 9V3"/><path d="M7 15h10"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    bot: '<path d="M12 8V4H8"/><rect x="4" y="8" width="16" height="12" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/>',
    calculator: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M16 14v4M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01"/>',
    arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    minus: '<path d="M5 12h14"/>',
    chevL: '<path d="m15 18-6-6 6-6"/>',
    chevR: '<path d="m9 18 6-6-6-6"/>',
    play: '<path d="M6 4l14 8-14 8z"/>',
    pause: '<path d="M8 4v16M16 4v16"/>',
  };
  const svgIcon = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;
  function paintIcons(root = document) {
    $$("[data-icon]", root).forEach((el) => {
      if (!el.firstChild) el.innerHTML = svgIcon(el.dataset.icon);
    });
  }
  const setIcon = (el, name) => { el.dataset.icon = name; el.innerHTML = svgIcon(name); };

  /* ---------- Nav: progress, active link, mobile menu ---------- */
  function initNav() {
    const nav = $(".nav");
    const bar = $("#progressBar");
    const toggle = $("#navToggle");
    const links = $("#navLinks");

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + "%";
      nav.classList.toggle("scrolled", h.scrollTop > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toggle.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    $$("a", links).forEach((a) => a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }));

    const map = new Map($$("a", links).map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        $$("a", links).forEach((a) => a.classList.remove("active"));
        const a = map.get(e.target.id);
        if (a) a.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main section[id]").forEach((s) => io.observe(s));
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el, i) => {
      el.style.transitionDelay = ((i % 4) * 70) + "ms";
      io.observe(el);
    });
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    $$(".count").forEach((el) => {
      const to = +el.dataset.to;
      if (reduceMotion) { el.textContent = to; return; }
      const start = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min(1, (t - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ---------- Hero demo sequence ---------- */
  function initHero() {
    const demo = $("#heroDemo");
    let timers = [];
    const play = () => {
      timers.forEach(clearTimeout);
      demo.classList.remove("s1", "s2", "s3", "s4");
      if (reduceMotion) { demo.classList.add("s1", "s2", "s3", "s4"); return; }
      [[300, "s1"], [1200, "s2"], [2200, "s3"], [4400, "s4"]].forEach(([t, c]) =>
        timers.push(setTimeout(() => demo.classList.add(c), t)));
    };
    $("#heroReplay").addEventListener("click", play);
    play();
  }

  /* ---------- Journey ---------- */
  const JOURNEY = [
    { k: "Book", e: "😊", mood: 0.92, title: "Book with confidence", text: "Finds a good-looking fare, books it and shares the plan with friends.", quote: "“Done! Goa is booked 🎉”", meta: ["~10 min", "to book"] },
    { k: "Spot", e: "😯", mood: 0.55, title: "Spot a cheaper fare", text: "A few days later, a friend or an app shows the same flight for much less.", quote: "“Wait… it's ₹2,300 cheaper now?”", meta: ["₹2,300", "looks like a saving"] },
    { k: "Dig", e: "😕", mood: 0.32, title: "Dig into the fine print", text: "Opens the booking platform and the airline site, trying to decode cancellation fees, fare types and refund rules.", quote: "“Is this partially refundable or not?”", meta: ["3–4", "sites & tabs"] },
    { k: "Calculate", e: "🤔", mood: 0.2, title: "Do the maths", text: "Works out fee, refund and the new fare in a notes app, unsure whether taxes and convenience fees come back.", quote: "“So… do I actually save anything?”", meta: ["Unclear", "net saving"] },
    { k: "Align", e: "😩", mood: 0.08, title: "Align the group", text: "Shares screenshots on WhatsApp. Everyone has opinions, and some have already settled up on Splitwise. Hours pass, and the fare may change.", quote: "“Guys, should we rebook? Need answers today.”", meta: ["Hours", "of back-and-forth"] },
    { k: "Decide", e: "😬", mood: 0.34, title: "Decide, or give up", text: "Either rebooks and hopes it works out, or does nothing and lives with the regret. Neither feels confident.", quote: "“Let's just leave it.”", meta: ["Low", "confidence"] },
  ];
  function moodColor(m) { return m > 0.6 ? "#12805c" : m > 0.3 ? "#d4950f" : "#d9534f"; }

  function initJourney() {
    const W = 1000, H = 160, n = JOURNEY.length;
    const pts = JOURNEY.map((j, i) => [(i / (n - 1)) * W, 12 + (1 - j.mood) * (H - 24)]);
    // Catmull-Rom → cubic Bézier for a smooth curve
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
    }
    $("#moodLine").setAttribute("d", d);
    $("#moodArea").setAttribute("d", `${d} L${W},${H} L0,${H} Z`);

    const pointsEl = $("#journeyPoints"), stepsEl = $("#journeySteps"), detail = $("#journeyDetail");
    JOURNEY.forEach((j, i) => {
      const p = document.createElement("button");
      p.className = "jp";
      p.style.left = (pts[i][0] / W) * 100 + "%";
      p.style.top = (pts[i][1] / H) * 100 + "%";
      p.style.background = moodColor(j.mood);
      p.setAttribute("aria-label", j.title);
      p.addEventListener("click", () => select(i));
      pointsEl.appendChild(p);

      const b = document.createElement("button");
      b.setAttribute("role", "tab");
      b.innerHTML = `<span>${j.e}</span>${j.k}`;
      b.addEventListener("click", () => select(i));
      stepsEl.appendChild(b);
    });

    function select(i) {
      const j = JOURNEY[i];
      $$(".jp", pointsEl).forEach((el, k) => el.classList.toggle("active", k === i));
      $$("button", stepsEl).forEach((el, k) => { el.classList.toggle("active", k === i); el.setAttribute("aria-selected", k === i); });
      detail.style.animation = "none"; void detail.offsetWidth; detail.style.animation = "";
      detail.innerHTML = `
        <span class="jd-emoji">${j.e}</span>
        <div><h4>${i + 1}. ${j.title}</h4><p>${j.text}</p><p class="jd-quote">${j.quote}</p></div>
        <div class="jd-meta"><b>${j.meta[0]}</b><small>${j.meta[1]}</small></div>`;
    }
    select(4);
  }

  /* ---------- Evidence checklist ---------- */
  function initChecklist() {
    const KEY = "brp-evidence";
    let saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { saved = {}; }
    const boxes = $$("#checklist input");
    const update = () => {
      const done = boxes.filter((b) => b.checked).length;
      $("#tpFill").style.width = (done / boxes.length) * 100 + "%";
      $("#tpLabel").textContent = `${done} / ${boxes.length}`;
    };
    boxes.forEach((b) => {
      b.checked = !!saved[b.dataset.key];
      b.addEventListener("change", () => {
        saved[b.dataset.key] = b.checked;
        try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* storage unavailable */ }
        update();
      });
    });
    update();

    // accordion: keep one question open at a time
    const items = $$("#questions details");
    items.forEach((d) => d.addEventListener("toggle", () => {
      if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
    }));
  }

  /* ---------- Comparison matrix ---------- */
  const TOOLS = [
    { name: "WhatsApp", sub: "Chat & coordination", color: "#25a35a", icon: "message" },
    { name: "Splitwise", sub: "Shared expenses", color: "#1b9e95", icon: "receipt" },
    { name: "Booking platforms", sub: "MakeMyTrip, Booking.com, airline sites", color: "#2563eb", icon: "plane" },
    { name: "Price comparison", sub: "Google Flights, Skyscanner", color: "#e0892b", icon: "search" },
    { name: "Regret Assistant", sub: "Proposed", color: "#0e6b4c", icon: "bot", ai: true },
  ];
  const ROWS = [
    ["Group discussion & coordination", ["y", "Great for discussion and coordination"], ["p", "Has groups, but only for splitting costs"], ["n", "Built for a single booker"], ["n", "No group features"], ["y", "A shared decision view for the whole group"]],
    ["Shared cost tracking", ["n", "No expense tracking"], ["y", "Helps track shared expenses"], ["n", "Only shows your own payment"], ["n", "Out of scope"], ["p", "Shows the per-person impact of switching"]],
    ["Find current or lower fares", ["n", "No real-time price tracking"], ["n", "Doesn't compare fares or policies"], ["y", "Shows current prices and booking options"], ["y", "Useful for finding lower fares"], ["y", "Pulls in cheaper alternatives for the same itinerary"]],
    ["Works from your existing booking", ["n", "Screenshots only"], ["n", "Only the amount someone typed in"], ["p", "Only bookings made on that platform"], ["n", "Doesn't factor in your existing booking"], ["y", "Imports your booking from email, PNR or manual entry"]],
    ["Cancellation & refund analysis", ["n", "No policy or refund analysis"], ["n", "No cancellation fee analysis"], ["n", "You read and compare the fine print yourself"], ["n", "Doesn't know your cancellation rules or refund"], ["y", "Pulls out fees, fare type and refund timeline"]],
    ["True net saving after fees", ["n", "Not supported"], ["n", "Not supported"], ["n", "Manual comparison across platforms"], ["n", "No total cost analysis (what you actually save)"], ["y", "Works out the net saving, with confidence labels"]],
    ["Keep / switch / wait recommendation", ["n", "No group decision flow"], ["n", "No rebooking recommendations"], ["p", "Limited guidance on whether to rebook"], ["n", "No decision support"], ["y", "A clear recommendation with next steps"]],
  ];
  const MARK = { y: "check", p: "minus", n: "x" };
  const MARK_LABEL = { y: "Yes", p: "Partially", n: "No" };

  function initMatrix() {
    const table = $("#matrix"), foot = $("#matrixFoot");
    const cls = (t) => (t.ai ? ' class="col-ai"' : "");
    let html = "<thead><tr><th class='row-h'>Capability</th>";
    TOOLS.forEach((t) => {
      html += `<th${cls(t)}><div class="tool-h"><span class="tool-ic" style="background:${t.color}">${svgIcon(t.icon)}</span><b>${t.name}</b><small>${t.sub}</small></div></th>`;
    });
    html += "</tr></thead><tbody>";
    ROWS.forEach((r, ri) => {
      html += `<tr><th class="row-h" scope="row">${r[0]}</th>`;
      TOOLS.forEach((t, ti) => {
        const [v, note] = r[ti + 1];
        html += `<td${cls(t)}><i class="mk mk-${v}" tabindex="0" data-r="${ri}" data-t="${ti}" aria-label="${t.name}: ${MARK_LABEL[v]}. ${note}">${svgIcon(MARK[v])}</i></td>`;
      });
      html += "</tr>";
    });
    html += "<tr class='score'><th class='row-h'>Coverage</th>";
    TOOLS.forEach((t, ti) => {
      const s = ROWS.reduce((a, r) => a + (r[ti + 1][0] === "y" ? 1 : r[ti + 1][0] === "p" ? 0.5 : 0), 0);
      html += `<td${cls(t)}><span class="score-pill">${s % 1 ? s.toFixed(1) : s} / ${ROWS.length}</span></td>`;
    });
    html += "</tr></tbody>";
    table.innerHTML = html;

    const defaultFoot = foot.innerHTML;
    const show = (el) => {
      const r = ROWS[el.dataset.r], t = TOOLS[el.dataset.t];
      foot.innerHTML = `<b>${t.name} · ${r[0]}:</b> ${r[+el.dataset.t + 1][1]}`;
      foot.classList.add("active");
    };
    const reset = () => { foot.innerHTML = defaultFoot; foot.classList.remove("active"); };
    $$(".mk", table).forEach((el) => {
      el.addEventListener("mouseenter", () => show(el));
      el.addEventListener("focus", () => show(el));
      el.addEventListener("click", () => show(el));
      el.addEventListener("mouseleave", reset);
      el.addEventListener("blur", reset);
    });

    $("#matrixToggle").addEventListener("change", (e) => table.classList.toggle("show-ai", e.target.checked));
  }

  /* ---------- 5-step flow ---------- */
  function initFlow() {
    const buttons = $$("#flowSteps button");
    const screens = $$("#screens .screen");
    const playBtn = $("#flowPlay");
    const DUR = 5000;
    let idx = 0, playing = !reduceMotion, timer = null, inView = false;

    function go(i, fromUser) {
      const prev = idx;
      idx = (i + screens.length) % screens.length;
      screens.forEach((s, k) => {
        s.classList.toggle("active", k === idx);
        s.classList.toggle("leave", k === prev && k !== idx);
      });
      buttons.forEach((b, k) => {
        b.classList.toggle("active", k === idx);
        b.classList.toggle("done", k < idx);
        b.setAttribute("aria-current", k === idx ? "step" : "false");
        const bar = $(".fs-bar", b);
        bar.classList.remove("run");
      });
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      const bar = $(".fs-bar", buttons[idx]);
      bar.classList.remove("run");
      if (!playing || !inView) return;
      bar.style.setProperty("--dur", DUR + "ms");
      void bar.offsetWidth;
      bar.classList.add("run");
      timer = setTimeout(() => go(idx + 1), DUR);
    }
    function setPlaying(p) {
      playing = p;
      setIcon($("[data-icon]", playBtn), p ? "pause" : "play");
      playBtn.setAttribute("aria-label", p ? "Pause autoplay" : "Play autoplay");
      schedule();
    }

    buttons.forEach((b) => b.addEventListener("click", () => go(+b.dataset.step, true)));
    $$("[data-goto]").forEach((b) => b.addEventListener("click", () => go(+b.dataset.goto, true)));
    $("#flowPrev").addEventListener("click", () => go(idx - 1, true));
    $("#flowNext").addEventListener("click", () => go(idx + 1, true));
    playBtn.addEventListener("click", () => setPlaying(!playing));

    new IntersectionObserver((entries) => {
      inView = entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.35 }).observe($("#flow"));

    setPlaying(playing);
  }

  /* ---------- Calculator ---------- */
  const PRESETS = {
    brief: { cur: 8400, alt: 6900, fee: 2000, policy: "refundable", trav: 1, fresh: "now", min: 500 },
    group: { cur: 7200, alt: 5100, fee: 1200, policy: "refundable", trav: 6, fresh: "30", min: 500 },
    hotel: { cur: 12000, alt: 9500, fee: 0, policy: "nonref", trav: 2, fresh: "now", min: 500 },
    win: { cur: 9800, alt: 5600, fee: 1500, policy: "refundable", trav: 2, fresh: "now", min: 500 },
  };
  const AVATAR_COLORS = ["#0e6b4c", "#2563eb", "#e0892b", "#8b5cf6", "#d9534f", "#1b9e95"];

  function initCalc() {
    const f = { cur: $("#fCur"), alt: $("#fAlt"), fee: $("#fFee"), min: $("#fMin") };
    const state = { policy: "refundable", fresh: "now", trav: 1 };
    let lastVerdict = "";

    function setSeg(name, v) {
      state[name] = v;
      $$(`.seg[data-name="${name}"] button`).forEach((b) => b.classList.toggle("active", b.dataset.v === v));
    }
    function fillRange(r) { r.style.setProperty("--fill", ((r.value - r.min) / (r.max - r.min)) * 100 + "%"); }

    function apply(p) {
      f.cur.value = p.cur; f.alt.value = p.alt; f.fee.value = p.fee; f.min.value = p.min;
      state.trav = p.trav;
      setSeg("policy", p.policy); setSeg("fresh", p.fresh);
      compute();
    }

    function compute() {
      const cur = Math.max(0, +f.cur.value || 0);
      const alt = Math.max(0, +f.alt.value || 0);
      const fee = Math.min(+f.fee.value, cur);
      const min = +f.min.value;
      const trav = state.trav;
      const policy = state.policy, fresh = state.fresh;

      $("#oFee").textContent = inr(+f.fee.value);
      $("#oMin").textContent = inr(min);
      $("#oTrav").textContent = trav;
      fillRange(f.fee); fillRange(f.min);

      const diff = cur - alt;
      const netRefundable = diff - fee;          // refund = fare − fee
      const netNonref = -alt;                    // no refund: you pay again
      const net = policy === "nonref" ? netNonref : netRefundable;

      // breakdown rows
      const rows = [["Fare difference", diff]];
      if (policy === "refundable") rows.push(["Cancellation fee", -fee]);
      if (policy === "nonref") rows.push(["Fare not refunded", -cur]);
      if (policy === "unknown") { rows.push(["Cancellation fee", -fee]); rows.push(["Refund at risk (worst case)", -(cur - fee)]); }
      const maxAbs = Math.max(1, ...rows.map((r) => Math.abs(r[1])));
      $("#bdRows").innerHTML = rows.map(([label, v]) => `
        <div class="bd-row"><span>${label}</span>
          <span class="bd-track"><span class="bd-fill ${v >= 0 ? "pos" : "neg"}" style="width:${(Math.abs(v) / maxAbs) * 100}%"></span></span>
          <b class="${v > 0 ? "pos" : v < 0 ? "neg" : ""}">${v > 0 ? "+" : ""}${inr(v)}</b></div>`).join("");

      const netEl = $("#bdNet");
      if (policy === "unknown") {
        netEl.textContent = `${inr(netNonref)} to ${inr(netRefundable)}`;
        netEl.className = "unk";
      } else {
        netEl.textContent = (net > 0 ? "+" : "") + inr(net);
        netEl.className = net > 0 ? "pos" : net < 0 ? "neg" : "";
      }

      // confidence
      const conf = $("#vConf");
      const CONF = { now: ["Verified · just now", ""], 30: ["Checked 30 min ago", "warn"], 120: ["Stale · 2h+ ago", "bad"] };
      let [confText, confCls] = CONF[fresh];
      if (policy === "unknown") { confText = "Uncertain · policy unknown"; confCls = "warn"; }
      conf.textContent = confText;
      conf.className = "conf " + confCls;

      // verdict
      let v, label, title, text, steps, tone;
      const total = net * trav;
      const who = trav > 1 ? ` (${inr(total)} for all ${trav} travellers)` : "";
      if (alt >= cur) {
        v = "keep"; label = "Keep"; title = "Keep your current booking";
        text = "The alternative isn't cheaper than what you've already paid, so there's nothing to gain by switching.";
        steps = ["Keep your current booking.", "Optionally set a price alert in case the fare drops further."];
      } else if (policy === "unknown") {
        v = "verify"; label = "Verify first"; title = "Check the refund policy before cancelling";
        text = `Depending on the refund, switching could change your cost by anywhere from ${inr(netNonref)} to ${inr(netRefundable)} per person. Confirm the fare type and cancellation fee with the airline or hotel first.`;
        steps = ["Open the full fare rules on the airline's or hotel's website.", "Confirm the cancellation fee and whether taxes and fees are refunded.", "Come back with the confirmed policy for a clear recommendation."];
      } else if (net <= 0) {
        v = "keep"; label = "Keep"; title = "Keep your current booking";
        text = policy === "nonref"
          ? `Your booking is non-refundable, so switching means paying ${inr(alt)} again per person. The ${inr(diff)} price gap is an illusion.`
          : `Once the ${inr(fee)} cancellation fee is counted, switching ${net < 0 ? `would cost you ${inr(-net)} more per person` : "saves nothing"}. The ${inr(diff)} fare difference disappears.`;
        steps = policy === "nonref"
          ? ["Keep your current booking. Switching can't pay off without a refund.", "Check whether the airline or hotel allows a free date change or credit instead.", "Share this breakdown with your group so everyone agrees."]
          : ["Keep your current booking. No action needed.", "Set a price alert. Switching only pays off if the fare drops below " + inr(cur - fee - min) + ".", "Share this breakdown with your group so everyone agrees."];
      } else if (net < min) {
        v = "wait"; label = "Wait & monitor"; title = "The saving is too small to be worth it, for now";
        text = `You'd save ${inr(net)} per person${who}, which is below your ${inr(min)} threshold for the hassle. Watch the fare and switch if it drops further.`;
        steps = ["Keep your booking for now.", "Set an alert for fares below " + inr(cur - fee - min) + ".", "Check the cancellation deadline so you don't lose the option to switch."];
      } else if (fresh === "120") {
        v = "wait"; label = "Re-check"; title = "Probably worth it, but the price is stale";
        text = `On paper you'd save ${inr(net)} per person${who}, but this fare was checked over two hours ago. Fares move quickly, so refresh it before you act.`;
        steps = ["Refresh the alternative fare and availability.", "If the saving still beats " + inr(min) + " per person, book the new fare first.", "Then cancel the original booking and track the refund."];
      } else {
        v = "switch"; label = "Switch";
        title = fresh === "30" ? "Switch, but re-check the fare first" : "Switching is worth it";
        text = `You'd save ${inr(net)} per person${who} after the cancellation fee.` +
          (fresh === "30" ? " The price was checked 30 minutes ago, so confirm it hasn't moved before cancelling." : " The price was verified just now.");
        steps = [
          fresh === "30" ? "Refresh the fare to confirm it's still available." : "Book the new fare first, while it's still available.",
          fresh === "30" ? "Book the new fare before cancelling, so you're never without a booking." : "Cancel the original booking once the new one is confirmed.",
          "Track your refund (usually 5–7 business days).",
        ];
        if (trav > 1) steps.push("Share the decision with the group and settle the difference per person.");
      }
      tone = v === "switch" ? "#12805c" : v === "keep" ? "#d9534f" : "#d4950f";

      const vEl = $("#verdict");
      vEl.className = "verdict v-" + v;
      if (lastVerdict && lastVerdict !== v + title) { void vEl.offsetWidth; vEl.classList.add("bump"); }
      lastVerdict = v + title;
      $("#vLabel").textContent = label;
      $("#vTitle").textContent = title;
      $("#vText").textContent = text;
      $("#nsList").innerHTML = steps.map((s) => `<li>${s}</li>`).join("");

      // group impact
      const gi = $("#giText");
      const noun = trav === 1 ? "traveller" : "travellers";
      if (policy === "unknown") gi.innerHTML = `For ${trav} ${noun}: between <b>${inr(netNonref * trav)}</b> and <b>${inr(netRefundable * trav)}</b> in total, depending on the refund.`;
      else if (alt >= cur) gi.innerHTML = `For ${trav} ${noun}: no saving available.`;
      else gi.innerHTML = `For ${trav} ${noun}, switching would <b>${total >= 0 ? "save" : "cost"} ${inr(Math.abs(total))}</b> ${total < 0 ? " more" : ""} in total.`;
      $("#avatars").innerHTML = Array.from({ length: trav }, (_, i) =>
        `<span style="background:${policy === "unknown" ? AVATAR_COLORS[i % AVATAR_COLORS.length] : tone};animation-delay:${i * 40}ms">${String.fromCharCode(65 + i)}</span>`).join("");
    }

    // events
    [f.cur, f.alt, f.fee, f.min].forEach((el) => el.addEventListener("input", () => { clearPreset(); compute(); }));
    $$(".calc .seg").forEach((seg) => seg.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      setSeg(seg.dataset.name, b.dataset.v); clearPreset(); compute();
    }));
    $("#tMinus").addEventListener("click", () => { state.trav = Math.max(1, state.trav - 1); clearPreset(); compute(); });
    $("#tPlus").addEventListener("click", () => { state.trav = Math.min(12, state.trav + 1); clearPreset(); compute(); });
    const presetBtns = $$("[data-preset]");
    function clearPreset() { presetBtns.forEach((b) => b.classList.remove("active")); }
    presetBtns.forEach((b) => b.addEventListener("click", () => {
      clearPreset(); b.classList.add("active"); apply(PRESETS[b.dataset.preset]);
    }));

    apply(PRESETS.brief);
  }

  /* ---------- Fare drift simulator ---------- */
  function initSim() {
    const svg = $("#simSvg");
    const NS = "http://www.w3.org/2000/svg";
    const CUR = 8200, FEE = 1500, START = 5900, BE = CUR - FEE, N = 20, STEP_MIN = 30;
    const VOL = { low: { s: 0.015, jump: 0, drift: 0.002 }, med: { s: 0.04, jump: 0.04, drift: 0.006 }, high: { s: 0.075, jump: 0.09, drift: 0.012 } };
    let vol = "med";

    const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    const el = (tag, attrs, text) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (text != null) e.textContent = text;
      svg.appendChild(e);
      return e;
    };

    function generate() {
      const cfg = VOL[vol];
      const out = [];
      let p = START;
      for (let i = 0; i < N; i++) {
        if (i > 0) {
          p = p * (1 + cfg.drift + gauss() * cfg.s);
          p = Math.max(4800, Math.round(p / 10) * 10);
        }
        const unavailable = i > 0 && Math.random() < cfg.jump;
        if (unavailable) p = Math.round(p * 1.08);
        out.push({ p, unavailable });
      }
      return out;
    }

    function draw(data) {
      svg.innerHTML = "";
      const W = 800, H = 280, L = 58, R = 16, T = 18, B = 34;
      const prices = data.map((d) => d.p);
      const lo = Math.floor((Math.min(...prices, START) - 400) / 500) * 500;
      const hi = Math.ceil((Math.max(...prices, BE) + 400) / 500) * 500;
      const x = (i) => L + (i / (N - 1)) * (W - L - R);
      const y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);

      // zones
      el("rect", { x: L, y: T, width: W - L - R, height: y(BE) - T, fill: "#fdf1f0" });
      el("rect", { x: L, y: y(BE), width: W - L - R, height: H - B - y(BE), fill: "#ecf7f1" });
      el("text", { x: W - R - 8, y: T + 16, "text-anchor": "end", class: "zone-label", fill: "#d9534f", style: "fill:#d9534f" }, "No saving");
      el("text", { x: W - R - 8, y: H - B - 8, "text-anchor": "end", class: "zone-label", style: "fill:#12805c" }, "Saving zone");

      // grid
      const step = hi - lo > 3000 ? 1000 : 500;
      for (let v = lo; v <= hi; v += step) {
        el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: "rgba(13,43,34,.07)" });
        el("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end" }, "₹" + (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k");
      }
      [0, 4, 9, 14, 19].forEach((i) => el("text", { x: x(i), y: H - 12, "text-anchor": "middle" }, i === 0 ? "Check 1" : `+${(i * STEP_MIN) / 60}h`));

      // break-even
      el("line", { x1: L, x2: W - R, y1: y(BE), y2: y(BE), stroke: "#0d2b22", "stroke-width": 1.5, "stroke-dasharray": "6 5" });
      el("text", { x: L + 8, y: y(BE) - 7, class: "be-label" }, `Break-even ${inr(BE)}`);

      // line
      const d = data.map((pt, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(pt.p).toFixed(1)}`).join(" ");
      const line = el("path", { d, class: "sim-line" });
      if (!reduceMotion && line.getTotalLength) {
        const len = line.getTotalLength();
        line.style.strokeDasharray = len;
        line.style.strokeDashoffset = len;
        line.getBoundingClientRect();
        line.style.transition = "stroke-dashoffset 1.6s cubic-bezier(.22,.8,.24,1)";
        line.style.strokeDashoffset = 0;
      }

      // dots
      data.forEach((pt, i) => {
        const delay = reduceMotion ? 0 : i * 70;
        if (pt.unavailable) {
          const g = document.createElementNS(NS, "g");
          g.setAttribute("class", "sim-dot");
          g.style.animationDelay = delay + "ms";
          g.innerHTML = `<circle cx="${x(i)}" cy="${y(pt.p)}" r="8" fill="#fff" stroke="#6a7b73" stroke-width="2"/><path d="M${x(i) - 3.5} ${y(pt.p) - 3.5} l7 7 M${x(i) + 3.5} ${y(pt.p) - 3.5} l-7 7" stroke="#6a7b73" stroke-width="2" stroke-linecap="round"/><title>Check ${i + 1}: fare unavailable, then repriced at ${inr(pt.p)}</title>`;
          svg.appendChild(g);
        } else {
          const ok = pt.p < BE;
          const c = el("circle", { cx: x(i), cy: y(pt.p), r: 5.5, fill: ok ? "#12805c" : "#d9534f", stroke: "#fff", "stroke-width": 2, class: "sim-dot" });
          c.style.animationDelay = delay + "ms";
          const t = document.createElementNS(NS, "title");
          t.textContent = `Check ${i + 1}: ${inr(pt.p)} — ${ok ? "saves " + inr(BE - pt.p) : "no saving"}`;
          c.appendChild(t);
        }
      });
    }

    function run() {
      const data = generate();
      draw(data);
      const held = data.filter((d) => !d.unavailable && d.p < BE).length;
      const unavailable = data.filter((d) => d.unavailable).length;
      const last = data[N - 1];
      $("#sPersist").textContent = `${held} / ${N}`;
      $("#sFinal").textContent = last.unavailable ? "Sold out" : (last.p < BE ? inr(BE - last.p) : "None");
      $("#sUnavail").textContent = unavailable;
      const lost = N - held;
      $("#sInsight").textContent = lost === 0
        ? "The saving held at every check this time, but run it again. One volatile hour is enough to wipe it out, which is why every price needs a timestamp."
        : `The saving disappeared in ${lost} of ${N} checks (${Math.round((lost / N) * 100)}%). A recommendation made at check 1 could easily be wrong by checkout, so the product must timestamp prices, flag staleness and re-verify before rebooking.`;
    }

    $$('.seg[data-name="vol"] button').forEach((b) => b.addEventListener("click", () => {
      vol = b.dataset.v;
      $$('.seg[data-name="vol"] button').forEach((o) => o.classList.toggle("active", o === b));
      run();
    }));
    $("#simRun").addEventListener("click", run);

    let started = false;
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !started) { started = true; run(); }
    }, { threshold: 0.3 }).observe($("#sim"));
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    paintIcons();
    initNav();
    initReveal();
    initCounters();
    initHero();
    initJourney();
    initChecklist();
    initMatrix();
    initFlow();
    initCalc();
    initSim();
  });
})();
