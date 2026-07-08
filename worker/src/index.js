// Nimmt das Kontaktformular von immobild.ai entgegen und verschickt die Anfrage
// per Resend (https://resend.com) an das Zielpostfach. Kein Framework, keine
// Abhängigkeiten – kann per `wrangler deploy` ODER per Copy-&-Paste in den
// Cloudflare-Dashboard-Editor deployt werden.

const ALLOWED_ORIGINS = new Set([
  "https://immobild.ai",
  "https://www.immobild.ai",
]);

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

function json(body, status, headers) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
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

    // Honeypot: echte Nutzer lassen dieses Feld leer. Bots füllen es -> still "ok", nichts senden.
    if (clean(data.company)) return json({ ok: true }, 200, headers);

    const name = clean(data.name);
    const email = clean(data.email);
    if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
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

    let res;
    try {
      res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: env.FROM_ADDRESS, // z. B. "Immobild.ai <anfrage@immobild.ai>" – Domain muss in Resend verifiziert sein
          to: [env.TO_ADDRESS], // "ismail.khudida@recmo.de"
          reply_to: `${name} <${email}>`,
          subject,
          text,
        }),
      });
    } catch (err) {
      return json({ ok: false, error: "network", detail: String((err && err.message) || err) }, 502, headers);
    }

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return json({ ok: false, error: "send_failed", status: res.status, detail: detail.slice(0, 300) }, 502, headers);
    }

    return json({ ok: true }, 200, headers);
  },
};
