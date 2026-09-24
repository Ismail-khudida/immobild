# immobild.ai — Plan: vom Fotografen zum Systemanbieter für Makler

> Stand 11.08.2026 · Entstanden in der RECmo-Sitzung, hier fortzuführen.
> Kurzfassung: **immobild.ai ist die Marke für Makler. Alles Makler-Bezogene läuft hier, nicht über recmo.de.**

---

## 1) Die Strategie in fünf Sätzen

1. Makler sind die beste erreichbare Zielgruppe: zählbar (ImmoScout24, Google Maps, IVD), zahlungsfähig, mit wiederkehrendem Bedarf und miserablen Abläufen.
2. **Der Foto-Shoot (399–1.299 €) ist der Türöffner** — ein leichtes Ja, das ins Büro führt.
3. **Das monatliche System ist das Geschäft** — Anfrage-Automatik, Eigentümer-Radar, Objekt-Seiten.
4. **Das eigentliche Produkt ist der Bewertungsrechner**: einmal bauen, an jeden Makler vermieten. Erster Kunde bezahlt den Bau, alle danach sind fast reine Marge.
5. **Ein Makler pro Stadt** — Exklusivität rechtfertigt den Preis und erzeugt Dringlichkeit.

**Warum es funktioniert:** Für einen Makler ist ein verkaufswilliger Eigentümer das Wertvollste überhaupt. Käufer gibt es im Überfluss, Objekte nicht. Bei einem Haus für 350.000 € liegt die Verkäufer-Courtage im fünfstelligen Bereich — ein zusätzliches Objekt pro Quartal trägt ein System, das monatlich vierstellig kostet.

## 2) Markenaufteilung (Entscheidung vom 11.08.2026)

| Marke | Zuständig für |
|---|---|
| **immobild.ai** | Alles für Makler: Medien, Systeme, Bewertungsrechner |
| **RECmo.de Studio** | Alles andere: abbeo, bioclimatic, normale Betriebe |

Begründung: Der Name verkauft schon. Kein Markenwechsel mitten im Verkaufsgespräch (das erzeugt Zweifel, Zweifel kostet den Auftrag). Der Spezialist gewinnt in einer Nische immer gegen den Allrounder.

Auf recmo.de existiert `/immobilienmakler` als Auffangseite für Makler, die zuerst dort landen — sie verweist hierher. Das ausführliche Angebot lebt auf immobild.ai.

## 3) Bereits erledigt

- **`makler-system.html` ist live** — Hero mit Beweis-Karte (Anfrage → Antwort in 47 s → qualifiziert → Termin gebucht), drei Lecks, drei Bausteine, Wertrechnung, Gebietsexklusivität, Ablauf, 6 FAQ mit synchronem FAQPage-Schema.
- **Brücken-Abschnitt** auf der Startseite nach den Paketen („Und was passiert mit den Anfragen?").
- **Nav-Eintrag „Für Maklerbüros"** auf allen 6 Seiten, Sitemap ergänzt.
- Commit `233900d`.

## 4) Der Bewertungsrechner („Eigentümer-Radar") — GEBAUT (13.08.2026)

**Status: live.** Mandantenfähiges iframe-Widget in `radar/`, Demo auf [bewertung.html](https://immobild.ai/bewertung.html), Lead-Endpunkt `POST /radar-lead` im Worker (Lead-Mail an Makler + Bestätigung an Eigentümer). Neuer Kunde = Tenant-JSON + Worker-Eintrag, Anleitung in [EINBETTUNG.md](EINBETTUNG.md). Offen: Richtwerte vor dem ersten zahlenden Makler gegen BORIS NRW prüfen; mehrstufige Nachfass-Strecke (v2).

Ursprüngliche Anforderungen (erfüllt):

**Was er tut:** Eigentümer gibt Adresse, Wohnfläche, Grundstück, Baujahr, Objektart und Zustand ein → bekommt eine Spanne als erste Einschätzung → hinterlässt dafür Name, E-Mail, Telefon → Makler bekommt den Lead, Eigentümer eine automatische Nachfass-Strecke.

**Datengrundlage:** Bodenrichtwerte sind offene Daten (BORIS NRW, BORIS Niedersachsen). Bodenwert = Bodenrichtwert × Grundstücksfläche; Gebäudewert über Sachwert-Näherung mit Baujahr-Abschlag und Zustandsfaktor. Ergebnis **immer als Spanne** und **immer** mit dem Hinweis: Schätzung, keine Wertermittlung nach ImmoWertV.

**Technik:** passt zum bestehenden Stack — statisches Frontend auf GitHub Pages, Lead-Verarbeitung im vorhandenen Cloudflare Worker (`worker/`, Resend, CORS-beschränkt, siehe `worker/src/index.js`). Kein Framework nötig.

**Vermietbarkeit von Anfang an mitdenken:** Der Rechner muss pro Makler konfigurierbar sein (Logo, Farben, Zielpostfach, Gebiet) und sich als Einbettung in eine fremde Website setzen lassen. Sonst ist es Auftragsarbeit statt Produkt.

**Rechtliches nicht vergessen:** DSGVO-Hinweis vor dem Absenden, Einwilligung für die Nachfass-Strecke, Impressumspflicht beim Makler, klare Kennzeichnung als unverbindliche Schätzung.

## 4b) SEO- und Performance-Runde (24.09.2026) — ERLEDIGT

Gemessen, umgesetzt, live verifiziert (Details in den Commits vom 24.09.):

- **Mobile Performance:** Startseite Lighthouse 74 → 98, LCP 6,3 s → 1,8 s, Datenmenge 1.277 → 572 KB; Städteseiten LCP 3,8 → 1,6 s. Barrierefreiheit 96–97 → 100.
- **Städteseiten entdupliziert:** Textüberlappung 41–55 % → 24–36 %, je Seite eigener, belegter Lokalinhalt. Fahrzeiten korrigiert (waren teils doppelt zu optimistisch).
- **Niedersachsen:** Bückeburg, Rinteln, Stadthagen als eigene Seiten — laut SERP-Recherche die am schwächsten besetzten Märkte. Positionierung „Ostwestfalen und Schaumburg aus einer Hand“ (Nische ist unbesetzt).
- **Neue Seite „Was kostet ein Immobilienfotograf?“:** kein regionaler Wettbewerber nennt Preise — Alleinstellungsmerkmal.
- **Analytics erst nach Einwilligung** (vorher Widerspruch zur Datenschutzerklärung) + Lead-Messung (`generate_lead`, `contact_click`).
- **Fixes:** FAQ-Schema der Startseite war nicht synchron (Richtlinienverstoß), Textlink-Kontrast, unsichtbare Textlinks.
- **Werkzeuge:** `scripts/seo-check.mjs` (QA vor jedem Commit), `scripts/staedte.mjs` (Städteseiten-Generator).

## 4c) Conversion-Runde (25.09.2026) — ERLEDIGT

- **Mobile Kontaktleiste** („Anrufen" + „Objekt anfragen") auf allen Seiten mit Kontaktbereich — unter 1020 px gab es vorher keinen festen Kontaktweg, weil der Header-Button ausgeblendet ist.
- **Konfigurator-Fehler:** Komplett-Paket berechnete +180 € für die Möblierung, obwohl sie laut Startseite und Kostenseite enthalten ist. Behoben; Aufpreis bei Lite/Premium steht jetzt sichtbar an der Checkbox.
- **Formular auf dem Handy:** Preis bricht nicht mehr um, „(optional)" und Datenschutz-Link sauber gesetzt.
- **Neue Seite „Immobilie für Fotos vorbereiten"** (Checkliste): Ratgeber-Traffic + Weiterleit-Material für Makler (Mailto-Vorlage, Link teilen, Druck auf 2 A4-Seiten).
- Kontrast Makler-Seite (Barrierefreiheit 96 → 100), Druck-Fix für alle Seiten.

**Noch offen (SEO):**
1. **Google Business Profile verifizieren** (Video) — bleibt der größte einzelne Hebel für lokale Anfragen.
2. **SEMrush:** Abo aktiv, aber 0 API-Units für MCP — Keyword-Volumen, Backlinks, Rankings, Wettbewerber-Gap erst nach Aufstockung (semrush.com/mcp-access). Position Tracking im SEMrush-Projekt steht auf USA/Englisch → auf Deutschland umstellen.
3. **Branchenverzeichnisse (NAP-Einträge, Konto nötig → Ismail):** gelbeseiten.de, 11880.com, meinestadt.de, trustlocal.de, houzz.de, offenblende.de (Fotografen-Marktplatz). Überall exakt: „Immobild.ai · Bückeburger Str. 14, 32457 Porta Westfalica · 0178 3248904 · https://immobild.ai“.
4. **Indexierung Checkliste** in der Search Console beantragen (am 25.09. war das Tageskontingent nach 10 Anträgen erschöpft; Sitemap ist neu eingereicht).
5. **Echte Referenzen:** Sobald der erste Makler-Auftrag da ist, eigene Objektfotos je Stadt statt Beispielbildern — stärkster Hebel gegen Duplicate Content und für Vertrauen.

## 5) Was Ismail tun muss (kann keine Software erledigen)

1. **Liste bauen** — Makler in Minden, Porta Westfalica, Bad Oeynhausen, Herford, Bielefeld, Lübbecke, Osnabrück, Hannover. Über ImmoScout24-Maklersuche, Google Maps, IVD-Verzeichnis. Realistisch 150–300 Namen, ein paar Stunden Arbeit.
2. **Zeigen statt reden** — Ein aktuelles Objekt mit schlechten Fotos suchen, **ein** Bild virtuell möblieren oder digital aufräumen, **ausgedruckt per Brief schicken** (Farbe, echte Briefmarke, unterschrieben) oder persönlich im Büro vorbeibringen:
   > „Bin über Ihr Objekt in der [Straße] gestolpert. Hab das Wohnzimmer mal virtuell möbliert — anbei, können Sie behalten. Falls Sie sowas öfter brauchen, melden Sie sich."

   15 Minuten Aufwand, kein Pitch, ein Geschenk. **Nur 1:1 an den Makler, nicht öffentlich zeigen** — die Originalfotos gehören ihm. Virtuell möblierte Fassung als „Visualisierung" kennzeichnen.

   **Nicht per E-Mail, Kontaktformular, WhatsApp oder Facebook:** Werbung über elektronische Post braucht auch unter Unternehmen eine *vorherige ausdrückliche* Einwilligung (§ 7 Abs. 2 UWG) — sonst Abmahnrisiko. Brief und persönlicher Besuch sind als Erstkontakt zulässig (Stand 25.09.2026, Quelle: IHK Nord Westfalen; keine Rechtsberatung).
3. **Zehn pro Woche**, nach drei bis fünf Tagen **persönlich vorbeischauen** — nicht kalt anrufen: Bei Unternehmen reicht „die Leistung könnte nützlich sein" nicht als mutmaßliche Einwilligung für Werbeanrufe (IHK Nord Westfalen). Telefon und E-Mail erst, wenn der Makler reagiert oder um Kontakt gebeten hat. Als zweites Geschenk die ausgedruckte [Checkliste für Eigentümer](https://immobild.ai/immobilie-fotos-vorbereiten.html) mitbringen. Nach vier Wochen messen, was passiert ist, statt vorher Quoten zu schätzen.
4. Beim Shoot vor Ort die kaputten Abläufe ansehen → das System verkaufen.

## 6) Offene Schwachstelle

Es steht noch **kein einziger Makler als Referenz** auf der Seite. Das lässt sich nicht texten, das braucht den ersten Kunden. Sobald einer da ist: Zitat, Name, Firma, gern ein Objektbeispiel — die Seite wird damit doppelt so stark.
