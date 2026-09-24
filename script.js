const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Lead-Messung: wird nur gesendet, wenn gtag.js nach Einwilligung geladen ist ---------- */
function track(name, params) {
  if (typeof gtag === "function") gtag("event", name, Object.assign({ page_path: location.pathname }, params));
}
document.addEventListener("click", (e) => {
  const a = e.target.closest ? e.target.closest("a[href]") : null;
  if (!a) return;
  const href = a.getAttribute("href");
  if (href.startsWith("tel:")) track("contact_click", { method: "telefon" });
  else if (href.startsWith("mailto:?")) track("share", { method: "email", content_type: "checkliste" }); // Weiterleiten ohne Empfänger
  else if (href.startsWith("mailto:")) track("contact_click", { method: "email" });
  else if (href.includes("calendar.app.google")) track("contact_click", { method: "termin" });
});

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

  // Unsichtbare Modi (Drohne, 360°) tragen ihr Bild in data-src, damit sie beim
  // Seitenaufbau nicht mit dem sichtbaren Hero-Bild (LCP) um Bandbreite konkurrieren.
  function hydrate(im) {
    if (!im.dataset.src) return;
    if (im.dataset.srcset) im.srcset = im.dataset.srcset;
    im.src = im.dataset.src;
    delete im.dataset.src;
    delete im.dataset.srcset;
  }

  function show(mode) {
    imgs.forEach((im) => { if (im.dataset.mode === mode) hydrate(im); });
    frame.setAttribute("data-mode", mode);
    imgs.forEach((im) => im.classList.toggle("is-active", im.dataset.mode === mode));
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.mode === mode));
  }

  const hydrateAll = () => setTimeout(() => imgs.forEach(hydrate), 300);
  if (document.readyState === "complete") hydrateAll();
  else window.addEventListener("load", hydrateAll, { once: true });

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
const leerRow = document.getElementById("leerRow");
const leerIncluded = document.getElementById("leerIncluded");
const totalPrice = document.getElementById("totalPrice");
const summaryText = document.getElementById("summaryText");

// Pakete mit data-furnish="inklusive" (Komplett) enthalten die virtuelle Möblierung bereits –
// dann keinen Aufpreis berechnen und statt der Checkbox einen Hinweis zeigen. Die Auswahl
// der Checkbox bleibt dabei erhalten, falls danach wieder ein anderes Paket gewählt wird.
function furnishIncluded() {
  if (!packageSelect) return false;
  return packageSelect.options[packageSelect.selectedIndex].dataset.furnish === "inklusive";
}

function updateQuote() {
  if (!packageSelect || !sizeSelect || !totalPrice || !summaryText || !objectType) return;
  const pkg = packageSelect.options[packageSelect.selectedIndex];
  const size = sizeSelect.options[sizeSelect.selectedIndex];
  const included = furnishIncluded();
  if (leerRow) leerRow.hidden = included;
  if (leerIncluded) leerIncluded.hidden = !included;
  const base = Number(pkg.dataset.price || 0);
  const sizePrice = Number(size.dataset.price || 0);
  const leer = !included && leerCheck && leerCheck.checked ? Number(leerCheck.dataset.price || 0) : 0;
  const total = base + sizePrice + leer;
  totalPrice.textContent = `ab ${total.toLocaleString("de-DE")} €`;
  summaryText.textContent = `${objectType.value} · ${pkg.value} · ${size.value}${included ? " · Möblierung inkl." : leer ? " · Möblierung" : ""}`;
}
[packageSelect, objectType, sizeSelect, leerCheck].forEach((el) => el && el.addEventListener("change", updateQuote));

const CONTACT_ENDPOINT = "https://immobild-contact.ismailkhudida.workers.dev";

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
      furnish: furnishIncluded() || !!(leerCheck && leerCheck.checked),
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
        track("generate_lead", { lead_source: "anfrageformular", package: payload.package, object_type: payload.objectType });
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

/* ---------- Cookie-Consent (Google Analytics) ---------- */
(function cookieConsent() {
  const KEY = "cookieConsent";
  const GA_SRC = "https://www.googletagmanager.com/gtag/js?id=G-8G34GDTRKY";
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch (_) {}

  // Eine gespeicherte Einwilligung setzt bereits das Inline-Snippet im <head>
  // (vor 'config', inkl. Laden von gtag.js) – hier nur noch der Banner für Erstbesucher.
  if (stored) return;

  const banner = document.createElement("div");
  banner.className = "cookie-banner";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", "Cookie-Einstellungen");
  banner.innerHTML =
    '<p>Diese Website nutzt Google Analytics zur anonymisierten Reichweitenmessung. Cookies dafür werden erst nach Ihrer Zustimmung gesetzt. <a href="datenschutz.html">Mehr erfahren</a></p>' +
    '<div class="cookie-banner-actions">' +
    '<button type="button" class="button ghost" data-consent="denied">Ablehnen</button>' +
    '<button type="button" class="button primary" data-consent="granted">Akzeptieren</button>' +
    "</div>";
  document.body.appendChild(banner);

  banner.addEventListener("click", (e) => {
    const choice = e.target.dataset.consent;
    if (!choice) return;
    try { localStorage.setItem(KEY, choice); } catch (_) {}
    if (choice === "granted" && typeof gtag === "function") {
      gtag("consent", "update", { analytics_storage: "granted" });
      // gtag.js erst jetzt laden: vor der Einwilligung gehen keine Daten an Google.
      if (!document.querySelector(`script[src="${GA_SRC}"]`)) {
        const s = document.createElement("script");
        s.async = true;
        s.src = GA_SRC;
        document.head.appendChild(s);
      }
    }
    banner.remove();
    document.dispatchEvent(new CustomEvent("cookiebanner:closed"));
  });
})();

/* ---------- Drucken / Link teilen (Checkliste) ----------
   Die Buttons stehen mit hidden im HTML und werden erst hier sichtbar – ohne JS gibt es sie nicht. */
document.querySelectorAll("[data-print]").forEach((b) => {
  if (typeof window.print !== "function") return;
  b.hidden = false;
  b.addEventListener("click", () => { track("checkliste_drucken", {}); window.print(); });
});
document.querySelectorAll("[data-share]").forEach((b) => {
  const canShare = typeof navigator.share === "function";
  const canCopy = !!(navigator.clipboard && navigator.clipboard.writeText);
  if (!canShare && !canCopy) return;
  const label = canShare ? "Link teilen" : "Link kopieren";
  b.textContent = label;
  b.hidden = false;
  b.addEventListener("click", async () => {
    const url = location.href.split("#")[0];
    if (canShare) {
      try {
        await navigator.share({ title: document.title, url });
        track("share", { method: "web_share", content_type: "checkliste" });
        return;
      } catch (e) {
        if (e && e.name === "AbortError") return; // Teilen-Dialog geschlossen
        if (!canCopy) return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      b.textContent = "Link kopiert ✓";
      track("share", { method: "link_kopiert", content_type: "checkliste" });
    } catch (_) {
      b.textContent = "Kopieren nicht möglich";
    }
    setTimeout(() => { b.textContent = label; }, 2500);
  });
});

/* ---------- Mobile Kontaktleiste: Anrufen + Anfragen, sobald der Hero verlassen ist ---------- */
(function ctaBar() {
  const target = document.getElementById("kontakt");
  if (!target || !document.querySelector(".site-header")) return;

  const bar = document.createElement("div");
  bar.className = "cta-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Schnellkontakt");
  const label = target.dataset.ctaLabel || "Objekt anfragen";
  bar.innerHTML =
    '<a class="button ghost" href="tel:+491783248904">Anrufen</a>' +
    '<a class="button primary" href="#kontakt"></a>';
  bar.lastChild.textContent = label;
  document.body.appendChild(bar);
  document.body.classList.add("has-cta-bar");

  let pastHero = false;
  let atContact = false;
  const update = () => {
    // Nicht über dem Cookie-Banner stapeln und nicht im Kontaktbereich doppeln.
    const show = pastHero && !atContact && !document.querySelector(".cookie-banner");
    bar.classList.toggle("is-visible", show);
  };

  // Scroll-Events kommen ohnehin höchstens einmal pro Frame; die Arbeit hier ist trivial.
  const onScroll = () => {
    pastHero = window.scrollY > window.innerHeight * 0.6;
    update();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("cookiebanner:closed", update);
  onScroll();

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      atContact = entries[0].isIntersecting;
      update();
    }).observe(target);
  }

  bar.querySelector('a[href="#kontakt"]').addEventListener("click", () => {
    track("cta_click", { cta_location: "mobile_leiste", cta_target: "kontakt" });
  });
})();
