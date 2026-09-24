# immobild.ai — Projektwissen

**Was das ist:** Immobilienmedien und digitale Systeme für Maklerbüros in Ostwestfalen und im Landkreis Schaumburg (Niedersachsen). Marke von Ismail Khudida, Schwesterprojekt von RECmo.de Studio.

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
- `immobilienfotograf-*.html` — 8 Städteseiten (NRW: Minden, Bad Oeynhausen, Herford, Lübbecke, Bielefeld · Niedersachsen: Bückeburg, Rinteln, Stadthagen). **Werden aus `scripts/staedte.mjs` generiert — nie von Hand bearbeiten**, sonst überschreibt der nächste Lauf die Änderung. Neue Stadt = Datensatz dort + `node scripts/staedte.mjs` + Sitemap + Einsatzgebiet-Liste auf der Startseite + Fußzeilen der übrigen Seiten + `llms.txt`.
- `kosten-immobilienfotograf.html` — „Was kostet ein Immobilienfotograf?“: Pakete, Größenzuschläge (müssen zu den `data-price`-Werten im Konfigurator der Startseite passen), Vergleichs-Checkliste
- `bewertung.html` — öffentliche Demo des Bewertungsrechners (bettet das Widget wie ein Makler-Kunde ein)
- `radar/` — der Eigentümer-Radar als vermietbares Produkt: iframe-Widget (`index.html` + `radar.js` + `radar.css`), Rechenlogik (`calc.js`, Tests: `node radar/calc.test.mjs`), Einbett-Loader (`embed.js`), Mandanten (`tenants/<id>.json`), Richtwerte (`data/richtwerte.json`). **Anleitung für neue Makler-Kunden: [EINBETTUNG.md](EINBETTUNG.md).** Lead-Routing (Tenant → Postfach) liegt bewusst im Worker (`RADAR_TENANTS`), nicht in der öffentlichen JSON.

**Designtokens** in `styles.css`: `--accent: #ff5e3a` (Orange), `--accent-text: #c43d1b` (Orange für kleine Textlinks – #ff5e3a hat auf Weiß nur 3:1, WCAG AA verlangt 4,5:1), `--ink: #14171c`, `--bg: #f7f8fb`, `--muted: #555a63`.
**Bausteine zum Wiederverwenden:** `.section`, `.section-heading`, `.eyebrow`, `.button primary|ghost`, `.dark-section`, `.faq-list`, `.site-footer`.

## Qualitätssicherung — vor jedem Commit

```bash
node scripts/seo-check.mjs
```

Prüft alle Seiten deterministisch: Title/Description-Länge, genau ein H1, Canonical, JSON-LD, **FAQ-Sync sichtbar ↔ Schema**, Breadcrumbs, Bilder, interne Links inkl. Anker, Sitemap. Muss mit 0 Fehlern enden. Performance messen: `npx lighthouse@12 <url> --form-factor=mobile` (die PageSpeed-API ist anonym oft im Tageslimit).

## Stolperfallen

- **Die globale `h1`-Regel hat `hyphens: auto`.** Lange Überschriften werden mitten im Wort getrennt („brin-gen"). Bei neuen Heros `hyphens: none` setzen.
- **`.hero` ist ein Zweispalter** (`1.02fr 0.98fr`). Ein Hero mit nur einer Spalte lässt die rechte Hälfte leer — entweder Inhalt dafür bauen oder das Grid überschreiben.
- **Seiteneigenes CSS gehört in die jeweilige Datei**, nicht in `styles.css` — sonst kann eine neue Seite die bestehenden fünf kaputtmachen. Nur wirklich geteilte Bausteine kommen ins globale Stylesheet.
- **FAQ doppelt pflegen:** Jede FAQ steht sichtbar im HTML *und* im FAQPage-JSON-LD. Beide müssen zeichengleich bleiben, sonst ist das Schema wertlos.
- **Hero-Bilder (Startseite + Städteseiten):** Nur das sichtbare Kamera-Bild lädt sofort (`fetchpriority="high"`, `srcset`). Drohne/360° tragen ihr Bild in `data-src`/`data-srcset` und werden von `script.js` erst nach `window.load` geladen – sonst konkurrieren sie mit dem LCP-Bild (vorher LCP 6,3 s, danach 1,8 s). Kein `<link rel="preload">` fürs Hero-Bild (Doppel-Download-Risiko bei srcset in älteren Safaris).
- **Neue Inhaltsbilder** immer mit 640w/960w-Varianten: `magick bild.webp -resize 640x -quality 80 -define webp:method=6 bild-640.webp` (dito 960) und `srcset`/`sizes` setzen.
- **Google Analytics lädt erst nach Einwilligung.** Das Inline-Snippet im `<head>` jeder Seite liest die gespeicherte Einwilligung und setzt sie VOR `config`; `script.js` lädt gtag.js nach Klick auf „Akzeptieren“. Neue Seiten: das Snippet 1:1 von einer bestehenden Seite übernehmen. Lead-Events: `generate_lead` (Formular), `contact_click` (Telefon/E-Mail/Termin).
- **Fahrzeiten** auf Städteseiten sind per OSRM ab Bückeburger Str. 14 berechnet – nicht schätzen, die alten Schätzungen waren bis zu doppelt zu optimistisch.
- **Preise im Fließtext** mit geschütztem Leerzeichen (`399&nbsp;€`), sonst bricht das €-Zeichen in eine eigene Zeile.
- **Bei Preisen aufpassen:** Auf immobild.ai *dürfen* Preise stehen (Foto-Pakete sind standardisiert). Auf recmo.de **niemals** — dort haben Bestandskunden individuelle Konditionen.

## Termin-Link

Alle CTAs zeigen auf `https://calendar.app.google/85Hebvgn6tX9ZhNb6`.
Kontakt: info@immobild.ai · 0178 3248904

## Sicherung (GitHub) — Wochenregel

Dieses Repo ist **öffentlich** und liefert die Live-Website aus (Deploy = git push!).
Regel (27.08.2026): Wöchentlich prüfen, ob ungesicherte Änderungen vorliegen — aber
**pushen heißt hier veröffentlichen**. Nur pushen, wenn die Änderungen live gehen
sollen; sonst Ismail fragen. Nichts committen, was nicht öffentlich sein darf.
