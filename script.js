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
  const imgs = Array.from(document.querySelectorAll(".stage-img"));

  function show(mode) {
    frame.setAttribute("data-mode", mode);
    imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.mode === mode));
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  }

  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.mode)));
  show("kamera");
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
  let x = 0, dragging = false, startX = 0, startVal = 0;

  const getMax = () => Math.max(0, img.offsetWidth - box.offsetWidth);
  function apply() { img.style.transform = "translate3d(" + x + "px, -50%, 0)"; }
  function clamp() { const m = getMax(); x = Math.max(-m, Math.min(0, x)); apply(); }

  box.addEventListener("pointerdown", (e) => {
    dragging = true; startX = e.clientX; startVal = x;
    box.classList.add("is-panning");
    try { box.setPointerCapture(e.pointerId); } catch (_) {}
  });
  box.addEventListener("pointermove", (e) => { if (dragging) { x = startVal + (e.clientX - startX); clamp(); } });
  const end = () => { dragging = false; box.classList.remove("is-panning"); };
  box.addEventListener("pointerup", end);
  box.addEventListener("pointercancel", end);
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
  const isConfigured = CONTACT_ENDPOINT.indexOf("REPLACE-ME") === -1;

  const setHint = (msg, isError) => {
    if (!hint) return;
    hint.innerHTML = msg;
    hint.classList.toggle("is-error", !!isError);
  };

  if (!isConfigured) {
    // Online-Versand ist noch nicht eingerichtet: von Anfang an klar kommunizieren,
    // statt den Nutzer erst nach dem Ausfüllen mit einem Fehler zu überraschen.
    setHint('Die Online-Anfrage befindet sich in Vorbereitung. Bitte nutzen Sie in der Zwischenzeit Telefon oder E-Mail (siehe oben).', false);
  }

  quoteForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!quoteForm.reportValidity()) return;

    if (!isConfigured) {
      setHint('Die Online-Anfrage befindet sich in Vorbereitung. Bitte nutzen Sie Telefon oder <a href="mailto:info@immobild.ai">E-Mail</a>.', false);
      return;
    }

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
        setHint('Senden hat gerade nicht geklappt. Bitte direkt an <a href="mailto:info@immobild.ai">info@immobild.ai</a> schreiben.', true);
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
      }
    } catch (_) {
      setHint('Senden hat gerade nicht geklappt. Bitte direkt an <a href="mailto:info@immobild.ai">info@immobild.ai</a> schreiben.', true);
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = label; }
    }
  });
}
updateQuote();
