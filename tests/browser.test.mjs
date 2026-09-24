// Browser-Tests für immobild.ai (Headless Chrome über puppeteer-core).
//
//   cd tests && npm install
//   node browser.test.mjs                      # gegen http://localhost:4321 (python3 -m http.server 4321 im Projektordner)
//   node browser.test.mjs https://immobild.ai  # gegen live
//
// Chrome-Pfad: Standard ist macOS; sonst CHROME_PATH setzen.
// Geprüft: mobile Kontaktleiste (Sichtbarkeit je Scrollposition, Cookie-Banner, Seitenabdeckung, Desktop),
// Konfigurator-Preise (Komplett enthält Möblierung), Checkliste (Buttons, Zwischenablage, Mailto,
// Druckansicht als A4-PDF, Handy ohne horizontales Scrollen) und dass keine JS-Fehler auftreten.
import puppeteer from "puppeteer-core";

const BASE = (process.argv[2] || "http://localhost:4321").replace(/\/$/, "");
const CHROME = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MOBILE = { width: 375, height: 812, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };
const DESKTOP = { width: 1280, height: 900 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let failures = 0;
const check = (name, cond, detail = "") => {
  console.log(`${cond ? "✓" : "✗"} ${name}${detail && !cond ? "  – " + detail : ""}`);
  if (!cond) failures++;
};

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });

// Frischer Kontext je Test (eigener localStorage). consent: null = Erstbesuch mit Banner.
async function open(path, viewport, { consent = "denied", noShare = false } = {}) {
  const ctx = await browser.createBrowserContext();
  await ctx.overridePermissions(new URL(BASE).origin, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.evaluateOnNewDocument((consent, noShare) => {
    try { if (consent) localStorage.setItem("cookieConsent", consent); } catch (e) {}
    if (noShare) { try { delete Navigator.prototype.share; } catch (e) {} }
  }, consent, noShare);
  // Kein echter Analytics-Traffic aus Tests
  await page.setRequestInterception(true);
  page.on("request", (r) => (r.url().includes("googletagmanager") ? r.abort() : r.continue()));
  await page.setViewport(viewport);
  await page.goto(BASE + path, { waitUntil: "load" });
  await sleep(300);
  return { page, errors, close: () => ctx.close() };
}

const scrollToY = (page, y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const barState = (page) => page.evaluate(() => {
  const bar = document.querySelector(".cta-bar");
  if (!bar) return null;
  const s = getComputedStyle(bar);
  return { display: s.display, visibility: s.visibility, label: bar.lastChild.textContent };
});

// ---------- Kontaktleiste: Startseite, Erstbesuch ----------
{
  const { page, errors, close } = await open("/", MOBILE, { consent: null });
  let st = await barState(page);
  check("Startseite: Leiste 'Objekt anfragen' vorhanden, oben versteckt", st && st.label === "Objekt anfragen" && st.visibility === "hidden", JSON.stringify(st));
  await scrollToY(page, 1200); await sleep(400);
  check("gescrollt + Cookie-Banner offen: versteckt", (await barState(page)).visibility === "hidden");
  await page.click('.cookie-banner [data-consent="denied"]'); await sleep(400);
  check("Banner geschlossen: sichtbar", (await barState(page)).visibility === "visible");
  await page.evaluate(() => document.getElementById("kontakt").scrollIntoView({ behavior: "instant" })); await sleep(500);
  check("im Kontaktbereich: versteckt (verdeckt das Formular nicht)", (await barState(page)).visibility === "hidden");
  await scrollToY(page, 1e6); await sleep(500);
  const pos = await page.evaluate(() => {
    const links = document.querySelectorAll(".site-footer a");
    return { barTop: document.querySelector(".cta-bar").getBoundingClientRect().top, last: links[links.length - 1].getBoundingClientRect().bottom };
  });
  check("Seitenende: sichtbar, letzter Footer-Link nicht verdeckt", (await barState(page)).visibility === "visible" && pos.last <= pos.barTop, JSON.stringify(pos));
  await scrollToY(page, 0); await sleep(500);
  const focusable = await page.evaluate(() => { const a = document.querySelector(".cta-bar a"); a.focus(); return document.activeElement === a; });
  check("versteckt: Links nicht fokussierbar", (await barState(page)).visibility === "hidden" && !focusable);
  check("Startseite: keine JS-Fehler", errors.length === 0, errors.join(" | "));
  await close();
}

// ---------- Kontaktleiste: Seitenabdeckung ----------
for (const [path, expected] of [
  ["/immobilienfotograf-minden.html", "Objekt anfragen"],
  ["/immobilienfotograf-stadthagen.html", "Objekt anfragen"],
  ["/kosten-immobilienfotograf.html", "Objekt anfragen"],
  ["/immobilie-fotos-vorbereiten.html", "Objekt anfragen"],
  ["/makler-system.html", "Gebiet prüfen"],
  ["/bewertung.html", null],
  ["/impressum.html", null],
  ["/datenschutz.html", null],
  ["/404.html", null],
]) {
  const { page, errors, close } = await open(path, MOBILE);
  const st = await barState(page);
  if (expected) {
    await scrollToY(page, 900); await sleep(400);
    const after = await barState(page);
    check(`${path}: Leiste '${expected}', nach Scroll sichtbar`, st && st.label === expected && after.visibility === "visible", JSON.stringify(after));
  } else {
    check(`${path}: keine Leiste`, st === null);
  }
  check(`${path}: keine JS-Fehler`, errors.length === 0, errors.join(" | "));
  await close();
}

// ---------- Kontaktleiste: Desktop ----------
{
  const { page, close } = await open("/", DESKTOP);
  await scrollToY(page, 1500); await sleep(400);
  const st = await barState(page);
  const pad = await page.evaluate(() => getComputedStyle(document.body).paddingBottom);
  check("Desktop: Leiste unsichtbar, kein Extra-Abstand", st.display === "none" && pad === "0px", `${JSON.stringify(st)} ${pad}`);
  await close();
}

// ---------- Konfigurator ----------
{
  const { page, errors, close } = await open("/", DESKTOP);
  const q = () => page.evaluate(() => ({
    total: document.getElementById("totalPrice").textContent,
    summary: document.getElementById("summaryText").textContent,
    row: getComputedStyle(document.getElementById("leerRow")).display !== "none",
    note: getComputedStyle(document.getElementById("leerIncluded")).display !== "none",
  }));
  let s = await q();
  check("Konfigurator: Standard Premium 80–160 m² = ab 919 €", s.total === "ab 919 €" && s.row && !s.note, JSON.stringify(s));
  await page.click("#leerCheck");
  s = await q();
  check("Premium + Möblierung = ab 1.099 €", s.total === "ab 1.099 €", JSON.stringify(s));
  await page.select("#packageSelect", "Komplett");
  s = await q();
  check("Komplett = ab 1.419 €, Möblierung inklusive (Hinweis statt Checkbox)", s.total === "ab 1.419 €" && !s.row && s.note && s.summary.endsWith("· Möblierung inkl."), JSON.stringify(s));
  await page.select("#packageSelect", "Premium");
  s = await q();
  check("zurück zu Premium: eigene Auswahl bleibt = ab 1.099 €", s.total === "ab 1.099 €" && s.row, JSON.stringify(s));
  await page.click("#leerCheck");
  await page.select("#packageSelect", "Lite");
  await page.select("#sizeSelect", "bis 80 m²");
  check("Lite bis 80 m² = ab 399 €", (await q()).total === "ab 399 €");
  await page.select("#sizeSelect", "über 300 m²");
  await page.select("#packageSelect", "Komplett");
  check("Komplett über 300 m² = ab 1.779 €", (await q()).total === "ab 1.779 €");
  check("Konfigurator: keine JS-Fehler", errors.length === 0, errors.join(" | "));
  await close();
}

// ---------- Checkliste: Buttons, Kopieren, Mailto ----------
{
  const { page, errors, close } = await open("/immobilie-fotos-vorbereiten.html", DESKTOP, { noShare: true });
  const st = await page.evaluate(() => {
    const p = document.querySelector("[data-print]");
    const s = document.querySelector("[data-share]");
    const href = document.querySelector('a[href^="mailto:?"]').getAttribute("href");
    return {
      print: !p.hidden && getComputedStyle(p).display !== "none",
      share: !s.hidden && getComputedStyle(s).display !== "none", label: s.textContent,
      subject: decodeURIComponent(href.split("subject=")[1].split("&")[0]),
      body: decodeURIComponent(href.split("body=")[1]),
    };
  });
  check("Checkliste: Drucken + 'Link kopieren' eingeblendet", st.print && st.share && st.label === "Link kopieren", JSON.stringify(st));
  check("Checkliste: Mailto mit Betreff und Seiten-URL", st.subject === "Checkliste für den Fototermin" && st.body.includes("https://immobild.ai/immobilie-fotos-vorbereiten.html"), JSON.stringify(st));
  await page.click("[data-share]"); await sleep(200);
  const copied = await page.evaluate(async () => ({ label: document.querySelector("[data-share]").textContent, clip: await navigator.clipboard.readText() }));
  check("Checkliste: Link kopiert (URL ohne #)", copied.label === "Link kopiert ✓" && copied.clip === BASE + "/immobilie-fotos-vorbereiten.html", JSON.stringify(copied));
  check("Checkliste: keine JS-Fehler", errors.length === 0, errors.join(" | "));
  await close();
}

// ---------- Checkliste: Druckansicht ----------
{
  const { page, close } = await open("/immobilie-fotos-vorbereiten.html", DESKTOP);
  await page.emulateMediaType("print");
  const vis = await page.evaluate(() => {
    const shown = (sel) => { const el = document.querySelector(sel); return !!el && getComputedStyle(el).display !== "none"; };
    const sections = Array.from(document.querySelectorAll(".section")).filter((s) => getComputedStyle(s).display !== "none");
    return {
      chrome: [".site-header", ".site-footer", ".share-box", ".faq-section", "#kontakt"].some(shown),
      list: shown(".rooms") && shown(".print-only"),
      opaque: sections.every((s) => getComputedStyle(s).opacity === "1"),
    };
  });
  check("Druck: Navigation/Teilen/FAQ/Kontakt ausgeblendet, Checkliste sichtbar", !vis.chrome && vis.list, JSON.stringify(vis));
  check("Druck: alle Abschnitte deckend (Reveal-Fix)", vis.opaque);
  const pdf = Buffer.from(await page.pdf({ format: "A4", printBackground: true }));
  const pages = (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length;
  check("Druck: passt auf 2 A4-Seiten", pages === 2, `${pages} Seiten`);
  await close();
}

// ---------- Checkliste: Handy ----------
{
  const { page, errors, close } = await open("/immobilie-fotos-vorbereiten.html", MOBILE);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  check("Checkliste Handy: kein horizontales Scrollen", overflow <= 0, `${overflow}px`);
  check("Checkliste Handy: keine JS-Fehler", errors.length === 0, errors.join(" | "));
  await close();
}

await browser.close();
console.log(failures ? `\n${failures} Fehler` : "\nAlle Prüfungen bestanden");
process.exit(failures ? 1 : 0);
