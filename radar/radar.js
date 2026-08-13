// Eigentümer-Radar – Widget-Logik. Mandant kommt aus ?m=<tenant-id>,
// Anzeige-Konfig aus tenants/<id>.json, Richtwerte aus data/richtwerte.json.
// Die Lead-Zustellung (Tenant -> Makler-Postfach) liegt bewusst NICHT hier,
// sondern im Cloudflare Worker – öffentliche Konfig kann keine Leads umleiten.
import { berechneWert } from "./calc.js";

const ENDPOINT = "https://immobild-contact.ismailkhudida.workers.dev/radar-lead";

const $ = (id) => document.getElementById(id);
const app = $("app");

/* ---------- Auto-Höhe für die iframe-Einbettung ---------- */
function postHeight() {
  if (window.parent === window) return;
  window.parent.postMessage(
    { type: "immobild-radar:height", height: document.documentElement.offsetHeight },
    "*" // nur eine Zahl – unkritisch für beliebige Empfänger
  );
}
new ResizeObserver(postHeight).observe(document.body);

/* ---------- Mandant + Richtwerte laden ---------- */
const tenantId = (new URLSearchParams(location.search).get("m") || "demo").replace(/[^a-z0-9-]/gi, "");

let tenant, daten;
try {
  [tenant, daten] = await Promise.all([
    fetch(`tenants/${tenantId}.json`).then((r) => (r.ok ? r.json() : Promise.reject(new Error("tenant")))),
    fetch("data/richtwerte.json").then((r) => (r.ok ? r.json() : Promise.reject(new Error("daten")))),
  ]);
} catch {
  $("ladeFehler").hidden = false;
  postHeight();
  throw new Error("Konfiguration nicht ladbar");
}

/* ---------- Mandanten-Konfig anwenden ---------- */
document.documentElement.style.setProperty("--r-accent", tenant.accent || "#ff5e3a");
if (tenant.kicker) $("tKicker").textContent = tenant.kicker;
if (tenant.titel) $("tTitle").textContent = tenant.titel;
if (tenant.logo) {
  const img = $("tLogo");
  img.src = tenant.logo;
  img.hidden = false;
}
document.querySelectorAll(".t-name").forEach((el) => (el.textContent = tenant.name));
$("tImpressum").href = tenant.impressum;
$("tDatenschutz").href = tenant.datenschutz;
$("tDatenschutz2").href = tenant.datenschutz;

const stadtSelect = $("fStadt");
const staedte = (tenant.staedte || Object.keys(daten.staedte)).filter((k) => daten.staedte[k]);
for (const key of staedte) {
  const opt = document.createElement("option");
  opt.value = key;
  opt.textContent = daten.staedte[key].name;
  stadtSelect.appendChild(opt);
}
$("fBaujahr").max = String(new Date().getFullYear());

app.hidden = false;
postHeight();

/* ---------- Felder je Objektart ein-/ausblenden ---------- */
function objektart() {
  return document.querySelector('input[name="objektart"]:checked').value;
}
function felderAktualisieren() {
  const art = objektart();
  document.querySelectorAll("[data-nur]").forEach((feld) => {
    const aktiv = feld.dataset.nur.split(" ").includes(art);
    feld.hidden = !aktiv;
    feld.querySelectorAll("input, select").forEach((el) => (el.disabled = !aktiv));
  });
}
$("artWahl").addEventListener("change", felderAktualisieren);
felderAktualisieren();

/* ---------- Schrittsteuerung ---------- */
const schritte = { 1: $("stepObjekt"), 2: $("stepKontakt"), 3: $("stepErgebnis") };
function zeigeSchritt(n) {
  for (const [num, el] of Object.entries(schritte)) el.hidden = Number(num) !== n;
  document.querySelectorAll(".r-steps li").forEach((li) => {
    const s = Number(li.dataset.step);
    li.classList.toggle("is-active", s === n);
    li.classList.toggle("is-done", s < n);
  });
  postHeight();
}

let eingabe = null;

$("stepObjekt").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;
  eingabe = {
    objektart: objektart(),
    stadt: stadtSelect.value,
    lage: $("fLage").value,
    wohnflaeche: $("fWohnflaeche").value,
    grundstuecksflaeche: $("fGrundstueck").value,
    baujahr: $("fBaujahr").value,
    zustand: $("fZustand").value,
  };
  // Rechenprobe schon hier: ungültige Kombinationen sollen nicht bis Schritt 2 kommen.
  try {
    berechneWert(eingabe, daten);
  } catch {
    e.target.reportValidity();
    return;
  }
  zeigeSchritt(2);
});

$("zurueck").addEventListener("click", () => zeigeSchritt(1));

$("stepKontakt").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!e.target.reportValidity()) return;

  let spanne;
  try {
    spanne = berechneWert(eingabe, daten);
  } catch {
    zeigeSchritt(1);
    return;
  }

  const senden = $("senden");
  const fehler = $("sendFehler");
  fehler.hidden = true;
  senden.disabled = true;
  const label = senden.textContent;
  senden.textContent = "Wird berechnet …";

  const fmt = (n) => n.toLocaleString("de-DE");
  const payload = {
    tenant: tenantId,
    ...eingabe,
    stadtName: daten.staedte[eingabe.stadt].name,
    spanneMin: spanne.min,
    spanneMax: spanne.max,
    name: $("fName").value.trim(),
    email: $("fEmail").value.trim(),
    phone: $("fTelefon").value.trim(),
    consent: $("fConsent").checked,
    seite: document.referrer || location.href,
    firma: $("fFirma").value, // Honeypot
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    if (!res.ok || !out.ok) throw new Error("send");
  } catch {
    fehler.hidden = false;
    senden.disabled = false;
    senden.textContent = label;
    postHeight();
    return;
  }

  const artName = { haus: "Haus", wohnung: "Wohnung", grundstueck: "Grundstück" }[eingabe.objektart];
  $("ergSpanne").textContent = `${fmt(spanne.min)} – ${fmt(spanne.max)} €`;
  $("ergObjekt").textContent = `${artName} in ${daten.staedte[eingabe.stadt].name} · erste Einschätzung als Spanne`;
  zeigeSchritt(3);
});
