# Immobild.ai – Kontakt-Worker

Nimmt das Kontaktformular von immobild.ai entgegen und schickt die Anfrage
per **Cloudflare Email Routing** direkt an `Ismail.khudida@recmo.de`.
Kostenlos, kein Drittanbieter, kein Paid-Plan – die immobild.ai-Weiterleitung
bei Namecheap bleibt komplett unangetastet.

## Einmalige Voraussetzungen (in Cloudflare)

1. **Email Routing aktiv** auf einer deiner Domains in diesem Cloudflare-Account
   (naheliegend `recmo.de`, wo du schon Worker betreibst):
   Dashboard → Domain wählen → **Email** → **Email Routing** aktivieren.
2. **Zieladresse verifizieren**: unter Email Routing → *Destination addresses*
   `Ismail.khudida@recmo.de` hinzufügen und den Bestätigungslink klicken
   (falls noch nicht verifiziert).
3. In `wrangler.toml` prüfen:
   - `FROM_ADDRESS` = eine Adresse auf der Email-Routing-Domain (z. B. `formular@recmo.de`).
     Das Postfach muss **nicht** existieren, die Domain muss nur Email Routing haben.
   - `destination_address` und `TO_ADDRESS` = die verifizierte Zieladresse.

## Deployen

```bash
cd worker
npm install
npx wrangler login        # nur beim ersten Mal
npx wrangler deploy
```

Nach dem Deploy zeigt Wrangler die URL an, z. B.:

```
https://immobild-contact.<dein-subdomain>.workers.dev
```

## Website scharf schalten

Diese URL in `../script.js` eintragen (ganz oben im Konfigurator-Block):

```js
const CONTACT_ENDPOINT = "https://immobild-contact.<dein-subdomain>.workers.dev";
```

Danach committen/pushen. Solange dort noch `REPLACE-ME` steht, zeigt das
Formular einen Hinweis mit der E-Mail-Adresse statt zu senden – es geht also
nichts kaputt, bevor der Worker live ist.

## Test

```bash
curl -X POST https://immobild-contact.<subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -H "Origin: https://immobild.ai" \
  -d '{"name":"Test Makler","email":"test@example.com","objectType":"Wohnung","package":"Premium","message":"Testanfrage"}'
# erwartet: {"ok":true}
```

Kommt keine Mail an, in Cloudflare unter **Workers → immobild-contact → Logs**
(`npx wrangler tail`) nachsehen – meist ist die Zieladresse noch nicht als
Destination verifiziert.

## Sicherheit

- **CORS**: nimmt nur POSTs von `https://immobild.ai` / `https://www.immobild.ai` an.
- **Honeypot**: verstecktes Feld `company`; ausgefüllt = Bot → wird still verworfen.
- **Validierung**: Name + gültige E-Mail Pflicht; Zeilenumbrüche werden entfernt
  (keine Header-Injection); Feldlänge begrenzt.
- Der Worker speichert nichts – er stellt nur die E-Mail zu.
