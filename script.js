const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Mobile menu ---------- */
const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");

function closeMenu() {
  document.body.classList.remove("menu-open");
  if (menuButton) menuButton.setAttribute("aria-expanded", "false");
}
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = document.body.classList.toggle("menu-open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", (e) => { if (e.target.tagName === "A") closeMenu(); });
  const desktop = window.matchMedia("(min-width: 1021px)");
  const onDesktop = (e) => { if (e.matches) closeMenu(); };
  if (desktop.addEventListener) desktop.addEventListener("change", onDesktop);
  else if (desktop.addListener) desktop.addListener(onDesktop);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) { closeMenu(); menuButton.focus(); }
  });
}

/* ---------- Hero: capture-mode stage ---------- */
(function stage() {
  const frame = document.querySelector(".stage-frame");
  const buttons = Array.from(document.querySelectorAll(".stage-modes button"));
  if (!frame || !buttons.length) return;
  const modes = ["kamera", "drohne", "360"];
  const imgs = Array.from(document.querySelectorAll(".stage-img"));
  let i = 0, timer = null;

  function show(mode) {
    frame.setAttribute("data-mode", mode);
    imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.mode === mode));
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
    i = modes.indexOf(mode);
  }
  function next() { show(modes[(i + 1) % modes.length]); }
  function start() { if (canAnimate) { stop(); timer = setInterval(next, 3400); } }
  function stop() { if (timer) clearInterval(timer); }

  buttons.forEach((b) => b.addEventListener("click", () => { show(b.dataset.mode); start(); }));
  show("kamera");
  start();
})();

/* ---------- Vorher / Nachher Slider (mehrere parallel) ---------- */
document.querySelectorAll(".ba-slider").forEach((slider) => {
  const range = slider.querySelector(".ba-range");
  if (!range) return;
  const set = (v) => slider.style.setProperty("--pos", v + "%");
  range.addEventListener("input", () => set(range.value));
  set(range.value);
});

/* ---------- 360°-Rundgang: eigene Drag-Panorama-Simulation ---------- */
(function pano360() {
  const box = document.getElementById("pano360");
  if (!box) return;
  const img = box.querySelector(".pano360-img");
  if (!img) return;
  let x = 0, dragging = false, startX = 0, startVal = 0, dir = -1, auto = canAnimate;

  const getMax = () => Math.max(0, img.offsetWidth - box.offsetWidth);
  function apply() { img.style.transform = "translate3d(" + x + "px, -50%, 0)"; }
  function clamp() { const m = getMax(); x = Math.max(-m, Math.min(0, x)); apply(); }
  function loop() {
    const m = getMax();
    if (auto && !dragging && m > 0) {
      x += dir * Math.max(0.3, m / 1600);
      if (x <= -m) { x = -m; dir = 1; } else if (x >= 0) { x = 0; dir = -1; }
      apply();
    }
    requestAnimationFrame(loop);
  }
  box.addEventListener("pointerdown", (e) => {
    dragging = true; auto = false; startX = e.clientX; startVal = x;
    box.classList.add("is-panning");
    try { box.setPointerCapture(e.pointerId); } catch (_) {}
  });
  box.addEventListener("pointermove", (e) => { if (dragging) { x = startVal + (e.clientX - startX); clamp(); } });
  const end = () => { dragging = false; };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
  requestAnimationFrame(loop);
})();

/* ---------- Makler-Rechner ---------- */
(function roi() {
  const objekte = document.getElementById("roiObjekte");
  const anfragen = document.getElementById("roiAnfragen");
  const zeit = document.getElementById("roiZeit");
  if (!objekte || !anfragen || !zeit) return;
  const oOut = document.getElementById("roiObjekteOut");
  const aOut = document.getElementById("roiAnfragenOut");
  const zOut = document.getElementById("roiZeitOut");
  const mehr = document.getElementById("roiMehr");
  const stunden = document.getElementById("roiStunden");
  const euro = document.getElementById("roiEuro");

  function update() {
    const o = Number(objekte.value), a = Number(anfragen.value), z = Number(zeit.value);
    if (oOut) oOut.textContent = o;
    if (aOut) aOut.textContent = a;
    if (zOut) zOut.textContent = z;
    // professionelle Medien -> konservativ +60 % mehr Anfragen; gesparte Vorbereitung = alle Objekte × Zeit
    const extra = Math.round(o * a * 0.6);
    if (mehr) mehr.textContent = "+" + extra.toLocaleString("de-DE");
    if (stunden) stunden.textContent = (o * z) + " h";
    if (euro) euro.textContent = (o * z * 50).toLocaleString("de-DE") + " €";
  }
  [objekte, anfragen, zeit].forEach((el) => el.addEventListener("input", update));
  update();
})();

/* ---------- Reveal on scroll ---------- */
if (canAnimate && "IntersectionObserver" in window) {
  document.body.classList.add("reveal-ready");
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-visible"); obs.unobserve(en.target); } });
  }, { threshold: 0.1, rootMargin: "0px 0px -70px 0px" });
  document.querySelectorAll(".section").forEach((s) => obs.observe(s));
}

/* ---------- Anfrage-Konfigurator ---------- */
const quoteForm = document.getElementById("quoteForm");
const packageSelect = document.getElementById("packageSelect");
const objectType = document.getElementById("objectType");
const sizeSelect = document.getElementById("sizeSelect");
const leerCheck = document.getElementById("leerCheck");
const totalPrice = document.getElementById("totalPrice");
const summaryText = document.getElementById("summaryText");

function updateQuote() {
  if (!packageSelect || !sizeSelect || !totalPrice || !summaryText || !objectType) return;
  const pkg = packageSelect.options[packageSelect.selectedIndex];
  const size = sizeSelect.options[sizeSelect.selectedIndex];
  const base = Number(pkg.dataset.price || 0);
  const sizePrice = Number(size.dataset.price || 0);
  const leer = leerCheck && leerCheck.checked ? Number(leerCheck.dataset.price || 0) : 0;
  const total = base + sizePrice + leer;
  totalPrice.textContent = `ab ${total.toLocaleString("de-DE")} €`;
  summaryText.textContent = `${objectType.value} · ${pkg.value} · ${size.value}${leer ? " · Möblierung" : ""}`;
}
[packageSelect, objectType, sizeSelect, leerCheck].forEach((el) => el && el.addEventListener("change", updateQuote));

// Nach dem Worker-Deploy hier die URL eintragen, z. B. "https://immobild-contact.<subdomain>.workers.dev"
const CONTACT_ENDPOINT = "https://immobild-contact.REPLACE-ME.workers.dev";

function fieldVal(id) { const el = document.getElementById(id); return el ? el.value.trim() : ""; }

if (quoteForm) {
  const hint = document.getElementById("formHint");
  const successBox = document.getElementById("quoteSuccess");
  const submitBtn = quoteForm.querySelector('button[type="submit"]');

  const fail = (msg) => {
    if (!hint) return;
    hint.innerHTML = msg + ' Bitte direkt an <a href="mailto:info@immobild.ai">info@immobild.ai</a> schreiben.';
    hint.classList.add("is-error");
  };

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!quoteForm.reportValidity()) return;

    const payload = {
      name: fieldVal("cName"),
      email: fieldVal("cEmail"),
      phone: fieldVal("cPhone"),
      objectType: objectType ? objectType.value : "",
      package: packageSelect ? packageSelect.value : "",
      size: sizeSelect ? sizeSelect.value : "",
      furnish: !!(leerCheck && leerCheck.checked),
      address: fieldVal("objectAddress"),
      message: fieldVal("cMessage"),
      price: totalPrice ? totalPrice.textContent : "",
      company: fieldVal("company"), // Honeypot – bleibt bei echten Nutzern leer
    };

    if (CONTACT_ENDPOINT.indexOf("REPLACE-ME") !== -1) {
      fail("Das Formular ist noch nicht scharf geschaltet.");
      return;
    }

    const label = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Wird gesendet …"; }
    if (hint) hint.classList.remove("is-error");

    try {
      const res = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        quoteForm.hidden = true;
        if (successBox) successBox.hidden = false;
      } else {
        fail("Senden hat gerade nicht geklappt.");
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
      }
    } catch (_) {
      fail("Senden hat gerade nicht geklappt.");
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
    }
  });
}
updateQuote();
