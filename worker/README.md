# Immobild.ai – Kontakt-Worker (Resend)

Nimmt das Kontaktformular von immobild.ai entgegen und verschickt die Anfrage
über **Resend** an `ismail.khudida@recmo.de`. Der Worker läuft in deinem
Cloudflare-Account (du hast dort schon Worker), Resend übernimmt den Mailversand.
Die immobild.ai-Weiterleitung bei Namecheap bleibt komplett unangetastet.

## Voraussetzungen (in Resend)

1. **Sende-Domain**: `recmo.de` ist in deinem Resend-Account bereits **verifiziert**
   (Status: Verified, EU-Region). Sie ist in `wrangler.toml` als `FROM_ADDRESS`
   (`anfrage@recmo.de`) eingetragen – hier ist nichts weiter zu tun. Kein DNS nötig.
2. **API-Key erzeugen**: In Resend → *API Keys* → einen Key mit Sende-Recht
   anlegen und kopieren (beginnt mit `re_`).

## Deployen

```bash
cd worker
npm install
npx wrangler login                       # nur beim ersten Mal
npx wrangler secret put RESEND_API_KEY    # den re_... Key einfügen
npx wrangler deploy
```

Alternativ ganz ohne CLI: `src/index.js` in einen neuen Worker im Cloudflare-
Dashboard kopieren, dort unter *Settings → Variables* `RESEND_API_KEY`
(verschlüsselt) sowie `FROM_ADDRESS` und `TO_ADDRESS` setzen, deployen.

Nach dem Deploy zeigt Wrangler die URL an, z. B.:

```
https://immobild-contact.<dein-subdomain>.workers.dev
```

## Website scharf schalten

Diese URL in `../script.js` eintragen (oben im Konfigurator-Block):

```js
const CONTACT_ENDPOINT = "https://immobild-contact.<dein-subdomain>.workers.dev";
```

Danach committen/pushen. Solange dort `REPLACE-ME` steht, zeigt das Formular
einen Hinweis mit der E-Mail-Adresse statt zu senden – es geht also nichts
kaputt, bevor der Worker live ist.

## Test

```bash
curl -X POST https://immobild-contact.<subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: https://immobild.ai" \
  -d '{"name":"Test Makler","email":"test@example.com","objectType":"Wohnung","package":"Premium","message":"Testanfrage"}'
# erwartet: {"ok":true}
```

Fehlermeldungen im Body helfen bei der Diagnose:
- `{"error":"config"}` → `RESEND_API_KEY` fehlt als Secret.
- `{"error":"send_failed","status":403,...}` → Absender-Domain in `FROM_ADDRESS`
  ist in Resend nicht verifiziert.
- Live-Logs: `npx wrangler tail`.

## Sicherheit

- **CORS**: nimmt nur POSTs von `https://immobild.ai` / `https://www.immobild.ai` an.
- **Honeypot**: verstecktes Feld `company`; ausgefüllt = Bot → wird still verworfen.
- **Validierung**: Name + gültige E-Mail Pflicht; Zeilenumbrüche werden entfernt
  (keine Header-Injection); Feldlänge begrenzt.
- Der API-Key liegt als verschlüsseltes Secret im Worker, nie im Code/Repo.
