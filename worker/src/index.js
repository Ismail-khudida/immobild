// Nimmt Formulare von immobild.ai entgegen und verschickt sie per Resend
// (https://resend.com). Kein Framework, keine Abhängigkeiten.
//
// Zwei Endpunkte:
//   POST /radar-lead   – Eigentümer-Radar (Bewertungsrechner), mandantenfähig
//   POST <alles andere> – Kontaktformular der Website (unverändertes Verhalten)

const ALLOWED_ORIGINS = new Set([
  "https://immobild.ai",
  "https://www.immobild.ai",
]);

// Eigentümer-Radar: Zuordnung Tenant-ID -> Zielpostfach des Maklers.
// Bewusst HIER statt in der öffentlichen tenants/<id>.json, damit niemand durch
// Manipulation der Anzeige-Konfig Leads umleiten kann. Neuer Kunde = neuer Eintrag
// + `npx wrangler deploy`. to: null bedeutet env.TO_ADDRESS (eigenes Postfach).
const RADAR_TENANTS = {
  demo: { name: "Immobild.ai", to: null },
};

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://immobild.ai";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

// Zeilenumbrüche entfernen (Header-Injection vermeiden) und Länge begrenzen.
const clean = (v) => String(v == null ? "" : v).replace(/[\r\n]+/g, " ").trim().slice(0, 2000);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

async function sendeMail(env, mail) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.FROM_ADDRESS, ...mail }),
  });
  if (!res.ok) {
    const detail = (await res.text().catch(() => "")).slice(0, 300);
    throw Object.assign(new Error("send_failed"), { status: res.status, detail });
  }
}

/* ---------- Kontaktformular (bestehendes Verhalten) ---------- */
async function handleKontakt(data, env, headers) {
  // Honeypot: echte Nutzer lassen dieses Feld leer. Bots füllen es -> still "ok", nichts senden.
  if (clean(data.company)) return json({ ok: true }, 200, headers);

  const name = clean(data.name);
  const email = clean(data.email);
  if (!name || !EMAIL_RE.test(email)) {
    return json({ ok: false, error: "fields" }, 422, headers);
  }

  const phone = clean(data.phone);
  const objectType = clean(data.objectType);
  const pkg = clean(data.package);
  const size = clean(data.size);
  const furnish = data.furnish ? "Ja" : "Nein";
  const address = clean(data.address);
  const price = clean(data.price);
  const message = clean(data.message);

  const subject = `Neue Anfrage – ${objectType || "Objekt"}${pkg ? " · " + pkg : ""}`;
  const text = [
    "Neue Anfrage über immobild.ai",
    "",
    `Name:         ${name}`,
    `E-Mail:       ${email}`,
    phone ? `Telefon:      ${phone}` : null,
    "",
    objectType ? `Objektart:    ${objectType}` : null,
    pkg ? `Paket:        ${pkg}` : null,
    size ? `Objektgröße:  ${size}` : null,
    `Möblierung:   ${furnish}`,
    address ? `Adresse:      ${address}` : null,
    price ? `Orientierung: ${price}` : null,
    message ? "" : null,
    message ? "Nachricht:" : null,
    message || null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await sendeMail(env, {
      to: [env.TO_ADDRESS],
      reply_to: `${name} <${email}>`,
      subject,
      text,
    });
  } catch (err) {
    return json({ ok: false, error: "send_failed", status: err.status, detail: err.detail || String(err.message) }, 502, headers);
  }

  return json({ ok: true }, 200, headers);
}

/* ---------- Eigentümer-Radar (Bewertungsrechner) ---------- */
async function handleRadarLead(data, env, headers) {
  // Honeypot wie beim Kontaktformular.
  if (clean(data.firma)) return json({ ok: true }, 200, headers);

  const tenantId = clean(data.tenant);
  const tenant = RADAR_TENANTS[tenantId];
  if (!tenant) return json({ ok: false, error: "unknown_tenant" }, 404, headers);

  const name = clean(data.name);
  const email = clean(data.email);
  const phone = clean(data.phone);
  if (!name || !EMAIL_RE.test(email) || !phone) {
    return json({ ok: false, error: "fields" }, 422, headers);
  }
  // Ohne dokumentierte Einwilligung darf kein Lead entstehen (DSGVO).
  if (data.consent !== true) return json({ ok: false, error: "consent" }, 422, headers);

  const objektart = clean(data.objektart);
  const stadt = clean(data.stadtName) || clean(data.stadt);
  const lage = clean(data.lage);
  const wohnflaeche = clean(data.wohnflaeche);
  const grundstueck = clean(data.grundstuecksflaeche);
  const baujahr = clean(data.baujahr);
  const zustand = clean(data.zustand);
  const seite = clean(data.seite);

  const min = Number(data.spanneMin);
  const max = Number(data.spanneMax);
  const spanne =
    Number.isFinite(min) && Number.isFinite(max) && min > 0 && max >= min
      ? `${min.toLocaleString("de-DE")} – ${max.toLocaleString("de-DE")} €`
      : "(keine Angabe)";

  const artName = { haus: "Haus", wohnung: "Wohnung", grundstueck: "Grundstück" }[objektart] || objektart || "Objekt";
  const zielAdresse = tenant.to || env.TO_ADDRESS;
  const jetzt = new Date().toISOString();

  // 1) Lead an den Makler – wenn das fehlschlägt, ist es ein echter Fehler.
  const leadText = [
    `Neuer Eigentümer-Lead über den Bewertungsrechner (${tenant.name})`,
    "",
    `Name:            ${name}`,
    `E-Mail:          ${email}`,
    `Telefon:         ${phone}`,
    "",
    `Objektart:       ${artName}`,
    `Stadt:           ${stadt}`,
    `Lage:            ${lage}`,
    wohnflaeche ? `Wohnfläche:      ${wohnflaeche} m²` : null,
    grundstueck ? `Grundstück:      ${grundstueck} m²` : null,
    baujahr ? `Baujahr:         ${baujahr}` : null,
    zustand ? `Zustand:         ${zustand}` : null,
    "",
    `Ersteinschätzung (Spanne): ${spanne}`,
    "",
    `Einwilligung:    erteilt am ${jetzt} (Verarbeitung + Kontaktaufnahme)`,
    seite ? `Quelle:          ${seite}` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");

  try {
    await sendeMail(env, {
      to: [zielAdresse],
      reply_to: `${name} <${email}>`,
      subject: `Neuer Eigentümer-Lead – ${artName} in ${stadt}`,
      text: leadText,
    });
  } catch (err) {
    return json({ ok: false, error: "send_failed", status: err.status, detail: err.detail || String(err.message) }, 502, headers);
  }

  // 2) Bestätigung an den Eigentümer – Stufe 1 der Nachfass-Strecke.
  //    Scheitert sie, bleibt der Lead trotzdem gültig (kein Fehler an den Nutzer).
  const bestaetigung = [
    `Guten Tag ${name},`,
    "",
    "vielen Dank für Ihre Anfrage. Ihre unverbindliche Ersteinschätzung:",
    "",
    `Objekt:          ${artName} in ${stadt}`,
    `Einschätzung:    ${spanne}`,
    "",
    "Wichtig: Das ist eine automatische Ersteinschätzung auf Basis regionaler",
    "Richtwerte – keine Wertermittlung nach ImmoWertV. Der tatsächliche Wert",
    "hängt von Lage, Zustand und Ausstattung im Detail ab.",
    "",
    `${tenant.name} prüft Ihre Angaben und meldet sich zeitnah bei Ihnen für`,
    "eine genauere Einschätzung.",
  ].join("\n");

  try {
    await sendeMail(env, {
      to: [email],
      reply_to: zielAdresse,
      subject: `Ihre Ersteinschätzung – ${artName} in ${stadt}`,
      text: bestaetigung,
    });
  } catch {
    // bewusst verschluckt – Lead ist beim Makler, das zählt
  }

  return json({ ok: true }, 200, headers);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
    if (request.method !== "POST") return json({ ok: false, error: "method" }, 405, headers);

    if (!env.RESEND_API_KEY) return json({ ok: false, error: "config" }, 500, headers);

    let data;
    try {
      data = await request.json();
    } catch {
      return json({ ok: false, error: "invalid_json" }, 400, headers);
    }

    const path = new URL(request.url).pathname;
    if (path === "/radar-lead") return handleRadarLead(data, env, headers);
    return handleKontakt(data, env, headers);
  },
};
