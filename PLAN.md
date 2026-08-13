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

## 5) Was Ismail tun muss (kann keine Software erledigen)

1. **Liste bauen** — Makler in Minden, Porta Westfalica, Bad Oeynhausen, Herford, Bielefeld, Lübbecke, Osnabrück, Hannover. Über ImmoScout24-Maklersuche, Google Maps, IVD-Verzeichnis. Realistisch 150–300 Namen, ein paar Stunden Arbeit.
2. **Zeigen statt reden** — Ein aktuelles Objekt mit schlechten Fotos suchen, **ein** Bild virtuell möblieren, hinschicken:
   > „Bin über Ihr Objekt in der [Straße] gestolpert. Hab das Wohnzimmer mal virtuell möbliert — anbei, können Sie behalten. Falls Sie sowas öfter brauchen, melden Sie sich."

   15 Minuten Aufwand, kein Pitch, ein Geschenk. **Nur 1:1 an den Makler schicken, nicht öffentlich zeigen** — die Originalfotos gehören ihm.
3. **Zehn pro Woche**, nach drei Tagen anrufen. Nach vier Wochen messen, was passiert ist, statt vorher Quoten zu schätzen.
4. Beim Shoot vor Ort die kaputten Abläufe ansehen → das System verkaufen.

## 6) Offene Schwachstelle

Es steht noch **kein einziger Makler als Referenz** auf der Seite. Das lässt sich nicht texten, das braucht den ersten Kunden. Sobald einer da ist: Zitat, Name, Firma, gern ein Objektbeispiel — die Seite wird damit doppelt so stark.
