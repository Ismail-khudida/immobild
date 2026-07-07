# Immobild.ai

Statische Website für **Immobild.ai** – Immobilienaufnahmen für Makler in Ostwestfalen-Lippe (Foto, Video, Drohne, 360-Grad, AI-Visualisierung).

## Struktur

- `index.html` – Startseite: Hero, Nutzen, Ansatz, Leistungen, Beispiele, Positionierung, Pakete, Vergleich, Anfrage-Konfigurator, Vorbereitung, FAQ, Kontakt.
- `styles.css` – komplettes Design inkl. Responsive-Layout und Reduced-Motion-Support.
- `script.js` – mobiles Menü, Reveal-Animationen und der E-Mail-Anfrage-Konfigurator (Preis-Orientierung + `mailto:`).
- `impressum.html`, `datenschutz.html` – Rechtsseiten (Impressum nach § 5 DDG / § 18 Abs. 2 MStV).
- `favicon.svg`, `favicon.ico`, `assets/apple-touch-icon.png` – Icons.
- `robots.txt`, `sitemap.xml` – SEO.
- `CNAME`, `.nojekyll` – GitHub-Pages-Konfiguration.

## Bild-Pipeline

Die großen Original-PNGs bleiben lokal (siehe `.gitignore`); ausgeliefert werden optimierte Formate. Neu generieren aus einem Original:

```bash
cd assets
cwebp -q 80 immobild-production-hero.png -o immobild-production-hero.webp
magick immobild-production-hero.png -resize 1000x immobild-production-hero-mobile.webp
magick immobild-production-hero.png -strip -quality 82 immobild-production-hero.jpg
magick immobild-production-hero.png -resize 1200x630^ -gravity center -extent 1200x630 -strip -quality 84 og-image.jpg
```

## Deployment

Gehostet über **GitHub Pages** mit Custom Domain `immobild.ai`.

- Custom Domain: über die `CNAME`-Datei bzw. Repo → Settings → Pages.
- DNS (Namecheap → Advanced DNS): vier A-Records auf die GitHub-Pages-IPs
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  sowie ein `CNAME`-Record `www` → `ismail-khudida.github.io.`.
- Nach korrektem DNS „Enforce HTTPS" aktivieren (Let's-Encrypt-Zertifikat wird automatisch ausgestellt).

## Vor Veröffentlichung prüfen

- Rechtstexte (Impressum, Datenschutz) final rechtlich prüfen lassen – die USt-IdNr. bestätigen.
- Telefonnummer und E-Mail bestätigen.
- Bei Einbindung von echtem Formularanbieter, Tracking, Kalender, Maps oder 360-Grad-Viewer die Datenschutzerklärung erweitern.
- Sobald echte Referenzaufnahmen vorliegen: Beispiele-Sektion in `index.html` mit echten Objektbildern ausstatten.
