# immobild.ai — Projektwissen

**Was das ist:** Immobilienmedien und digitale Systeme für Maklerbüros in Ostwestfalen. Marke von Ismail Khudida, Schwesterprojekt von RECmo.de Studio.

**Der Plan steht in [PLAN.md](PLAN.md) — dort zuerst nachsehen.** Kurzfassung: Der Foto-Shoot ist der Türöffner, das monatliche System ist das Geschäft, der Bewertungsrechner ist das eigentliche Produkt (einmal bauen, an jeden Makler vermieten). Ein Makler pro Stadt.

## Markenaufteilung — wichtig

**immobild.ai = alles für Makler.** RECmo.de Studio = alles andere (abbeo, bioclimatic, normale Betriebe). Kein Markenwechsel im Verkaufsgespräch: Wer den Shoot hier kauft, bekommt das System auch hier. Auf recmo.de gibt es nur eine Auffangseite `/immobilienmakler`, die hierher verweist.

## Deploy — anders als bei recmo.de!

**`git push` ist der Deploy** (GitHub Pages, Repo `Ismail-khudida/immobild`). Kein Wrangler für die Website. Nach dem Push dauert es 1–3 Minuten, bis die Seite live ist — vorher liefert sie 404.

Der **Cloudflare Worker in `worker/`** ist getrennt davon und wird mit `npx wrangler deploy` aus diesem Ordner ausgerollt. Er nimmt das Kontaktformular entgegen und verschickt per Resend an `ismail.khudida@recmo.de`. Der `RESEND_API_KEY` ist ein Secret, steht nicht in `wrangler.toml`.

## Aufbau

Statisches HTML, kein Build-Schritt. Gemeinsames `styles.css`, gemeinsames `script.js`, selbstgehostete Schrift (`assets/fonts/PlusJakartaSans.woff2`).

- `index.html` — Startseite mit Vorher/Nachher-Reglern, 360°-Demo, Paketen (399/799/1.299 €) und Kontaktformular
- `makler-system.html` — die Systeme für Maklerbüros (Anfrage-Automatik, Eigentümer-Radar, Objekt-Seiten)
- `immobilienfotograf-*.html` — 5 Städteseiten (Minden, Bielefeld, Bad Oeynhausen, Herford, Lübbecke)
- `bewertung.html` — öffentliche Demo des Bewertungsrechners (bettet das Widget wie ein Makler-Kunde ein)
- `radar/` — der Eigentümer-Radar als vermietbares Produkt: iframe-Widget (`index.html` + `radar.js` + `radar.css`), Rechenlogik (`calc.js`, Tests: `node radar/calc.test.mjs`), Einbett-Loader (`embed.js`), Mandanten (`tenants/<id>.json`), Richtwerte (`data/richtwerte.json`). **Anleitung für neue Makler-Kunden: [EINBETTUNG.md](EINBETTUNG.md).** Lead-Routing (Tenant → Postfach) liegt bewusst im Worker (`RADAR_TENANTS`), nicht in der öffentlichen JSON.

**Designtokens** in `styles.css`: `--accent: #ff5e3a` (Orange), `--ink: #14171c`, `--bg: #f7f8fb`, `--muted: #555a63`.
**Bausteine zum Wiederverwenden:** `.section`, `.section-heading`, `.eyebrow`, `.button primary|ghost`, `.dark-section`, `.faq-list`, `.site-footer`.

## Stolperfallen

- **Die globale `h1`-Regel hat `hyphens: auto`.** Lange Überschriften werden mitten im Wort getrennt („brin-gen"). Bei neuen Heros `hyphens: none` setzen.
- **`.hero` ist ein Zweispalter** (`1.02fr 0.98fr`). Ein Hero mit nur einer Spalte lässt die rechte Hälfte leer — entweder Inhalt dafür bauen oder das Grid überschreiben.
- **Seiteneigenes CSS gehört in die jeweilige Datei**, nicht in `styles.css` — sonst kann eine neue Seite die bestehenden fünf kaputtmachen. Nur wirklich geteilte Bausteine kommen ins globale Stylesheet.
- **FAQ doppelt pflegen:** Jede FAQ steht sichtbar im HTML *und* im FAQPage-JSON-LD. Beide müssen zeichengleich bleiben, sonst ist das Schema wertlos.
- **Bei Preisen aufpassen:** Auf immobild.ai *dürfen* Preise stehen (Foto-Pakete sind standardisiert). Auf recmo.de **niemals** — dort haben Bestandskunden individuelle Konditionen.

## Termin-Link

Alle CTAs zeigen auf `https://calendar.app.google/85Hebvgn6tX9ZhNb6`.
Kontakt: info@immobild.ai · 0178 3248904
