# Eigentümer-Radar: Einbettung & neuer Makler-Kunde

## Der Schnipsel für den Makler

Genau diese eine Zeile geht an den Makler (bzw. seinen Webbauer). Sie kommt an die
Stelle der Website, an der der Rechner erscheinen soll:

```html
<script async src="https://immobild.ai/radar/embed.js" data-radar="TENANT-ID"></script>
```

Mehr ist nicht nötig: `embed.js` erzeugt an Ort und Stelle ein iframe und passt dessen
Höhe automatisch an den Inhalt an. Funktioniert in jedem CMS, das einen HTML-Block
erlaubt (WordPress, Jimdo, Wix, onOffice-Websites …).

## Neuen Makler-Kunden anlegen (2 Schritte)

**1. Anzeige-Konfig** — `radar/tenants/<tenant-id>.json` anlegen (Tenant-ID: kleinbuchstaben,
Ziffern, Bindestriche, z. B. `mustermann-minden`):

```json
{
  "name": "Mustermann Immobilien",
  "logo": "https://www.mustermann-immobilien.de/logo.png",
  "accent": "#0a6e4f",
  "kicker": "Kostenlose Ersteinschätzung",
  "titel": "Was ist Ihre Immobilie in Minden wert?",
  "staedte": ["minden", "porta-westfalica"],
  "impressum": "https://www.mustermann-immobilien.de/impressum",
  "datenschutz": "https://www.mustermann-immobilien.de/datenschutz"
}
```

- `staedte`: Schlüssel aus `radar/data/richtwerte.json` — bestimmt, welche Städte im
  Dropdown stehen (= Gebietsexklusivität sichtbar gemacht).
- `impressum`/`datenschutz` **müssen** auf die Seiten des Maklers zeigen — er ist der
  Verantwortliche für die Leads (DSGVO).
- Danach `git push` (GitHub Pages deployt die JSON automatisch).

**2. Lead-Routing** — in `worker/src/index.js` bei `RADAR_TENANTS` ergänzen und deployen:

```js
const RADAR_TENANTS = {
  demo: { name: "Immobild.ai", to: null },
  "mustermann-minden": { name: "Mustermann Immobilien", to: "info@mustermann-immobilien.de" },
};
```

```bash
cd worker && npx wrangler deploy
```

Das Routing liegt bewusst **nicht** in der öffentlichen JSON: Niemand kann durch
Manipulation der Anzeige-Konfig Leads umleiten.

## Was passiert bei einer Anfrage

1. Eigentümer füllt Objektdaten aus → Kontaktdaten + Einwilligung → sieht die Spanne.
2. Worker (`POST /radar-lead`) schickt per Resend:
   - **Lead-Mail an den Makler** (alle Daten, Spanne, Einwilligungszeitpunkt, Quellseite)
   - **Bestätigung an den Eigentümer** (seine Spanne + „[Makler] meldet sich") — Stufe 1 der Nachfass-Strecke
3. Honeypot-Feld `firma` fängt Bots ab (stilles OK, keine Mail).

## Richtwerte pflegen

`radar/data/richtwerte.json` — Bodenrichtwerte (€/m² Grundstück) und Wohnungspreise
(€/m² Wohnfläche) je Stadt und Lagestufe. **Vor dem ersten zahlenden Makler einer Stadt
einmal gegen BORIS NRW prüfen** (https://www.boris.nrw.de). Neue Stadt = neuer Eintrag,
fertig — Rechenlogik und Tests decken sie automatisch mit ab.

## Verifizieren nach Änderungen

```bash
node radar/calc.test.mjs
```

Testet die Rechenlogik deterministisch gegen Handrechnungen (Baujahr-Abschläge,
Zustandsfaktoren, Spannen, Fehlerpfade, alle Städte/Lagen).

## Demo

Live-Demo (Tenant `demo`, Leads an das eigene Postfach): https://immobild.ai/bewertung.html
